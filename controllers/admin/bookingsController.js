// GET  /api/admin/bookings  — List bookings (admin: all, doctor: own)
// POST /api/admin/bookings  — Create a booking (admin only)
// PATCH /api/admin/bookings — Update a booking (status, patient info)

import { db } from '../../_utils/firebaseAdmin.js';
import { verifyAuth, requireAdmin } from '../../_utils/authMiddleware.js';
import { sendError, sendSuccess, validateRequired, isValidDate, isValidTime } from '../../_utils/apiHelpers.js';
import { generateSlotTimes, buildSlotId, classifyBookingDate } from '../../_utils/slotGenerator.js';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
    // Special check for follow-up before booking (needs to be above generic GET)
    if (req.method === 'GET' && req.query.checkFollowup === 'true') {
        return handleFollowupCheck(req, res);
    }

    if (req.method === 'GET') return handleGet(req, res);
    if (req.method === 'POST') return handlePost(req, res);
    if (req.method === 'PATCH') return handlePatch(req, res);
    if (req.method === 'DELETE') return handleDelete(req, res);

    return sendError(res, 405, 'Method not allowed');
}

// ─── DELETE: Remove a booking ───────────────────────────────────────────────────

async function handleDelete(req, res) {
    const result = await verifyAuth(req);
    if (result.error) return sendError(res, result.status, result.error);

    const { user } = result;
    const { appointmentId } = req.query;

    if (!appointmentId) return sendError(res, 400, 'Missing appointmentId');

    try {
        const appointmentRef = db.collection('appointments').doc(appointmentId);
        const doc = await appointmentRef.get();

        if (!doc.exists) return sendError(res, 404, 'Appointment not found');

        const appointment = doc.data();

        // Permissions check
        if (user.role === 'doctor' && appointment.doctorId !== user.doctorId) {
            return sendError(res, 403, 'You can only delete your own appointments');
        }

        await appointmentRef.delete();
        return sendSuccess(res, { message: 'Appointment deleted successfully' });

    } catch (error) {
        console.error('Error in DELETE /api/admin/bookings:', error);
        return sendError(res, 500, 'Internal server error');
    }
}

// ─── GET: List bookings ─────────────────────────────────────────────────────────

async function handleGet(req, res) {
    const result = await verifyAuth(req);
    if (result.error) return sendError(res, result.status, result.error);

    const { user } = result;
    const { doctorId, dateFrom, dateTo, status, patientPhone } = req.query;

    try {
        let query = db.collection('appointments');

        if (patientPhone) {
            query = query.where('patientId', '==', patientPhone);
        }

        // Doctor can only see their own bookings
        const filterDoctorId = user.role === 'doctor' ? user.doctorId : (doctorId || null);

        if (filterDoctorId) {
            query = query.where('doctorId', '==', filterDoctorId);
        }

        if (status) {
            const statuses = status.split(',').map(s => s.trim());
            query = query.where('status', 'in', statuses);
        }

        const snapshot = await query.get();

        let bookings = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
                confirmedAt: data.confirmedAt?.toDate?.()?.toISOString() || null,
            };
        });

        // Apply date range filter in memory
        if (dateFrom) {
            bookings = bookings.filter(b => b.appointmentDate >= dateFrom);
        }
        if (dateTo) {
            bookings = bookings.filter(b => b.appointmentDate <= dateTo);
        }

        // Apply status filter (now handled in query above, but keeping for safety if multi-status isn't fully supported)
        if (status && !status.includes(',')) {
            // if it was a single status it's already filtered, if multiple we keep it for fallback
        } else if (status) {
            const statuses = status.split(',').map(s => s.trim());
            bookings = bookings.filter(b => statuses.includes(b.status));
        }

        // Sort by date descending, then time ascending
        bookings.sort((a, b) => {
            const dateDiff = (b.appointmentDate || '').localeCompare(a.appointmentDate || '');
            if (dateDiff !== 0) return dateDiff;
            return (a.timeSlot || '').localeCompare(b.timeSlot || '');
        });

        // Fetch doctor names for enrichment
        const doctorIds = [...new Set(bookings.map(b => b.doctorId).filter(Boolean))];
        const doctorNames = {};

        if (doctorIds.length > 0) {
            const doctorDocs = await Promise.all(
                doctorIds.map(id => db.collection('doctors').doc(id).get())
            );
            doctorDocs.forEach(doc => {
                if (doc.exists) {
                    doctorNames[doc.id] = doc.data().name;
                }
            });
        }

        // Enrich bookings with doctor name
        bookings = bookings.map(b => ({
            ...b,
            doctorName: doctorNames[b.doctorId] || b.doctorId,
        }));

        return sendSuccess(res, { bookings });

    } catch (error) {
        console.error('Error in GET /api/admin/bookings:', error);
        return sendError(res, 500, `Internal server error: ${error.message}`);
    }
}

// ─── POST: Create a booking (admin only) ─────────────────────────────────────────

async function handlePost(req, res) {
    const admin = await requireAdmin(req, res);
    if (!admin) return; // Response already sent

    const body = req.body;

    const validationError = validateRequired(body, ['doctorId', 'date', 'time', 'patientName', 'patientPhone']);
    if (validationError) return sendError(res, 400, validationError);

    const { doctorId, date, time, patientName, patientPhone, patientEmail, status: requestedStatus } = body;

    if (!isValidDate(date)) return sendError(res, 400, 'Invalid date format. Use YYYY-MM-DD');
    if (!isValidTime(time)) return sendError(res, 400, 'Invalid time format. Use HH:mm');

    try {
        // Verify doctor exists
        const doctorDoc = await db.collection('doctors').doc(doctorId).get();
        if (!doctorDoc.exists) return sendError(res, 404, 'Doctor not found');

        // Validate time against schedule
        const doctor = doctorDoc.data();
        const validSlotTimes = generateSlotTimes(doctor, date);
        if (!validSlotTimes.includes(time)) {
            return sendError(res, 400, 'Invalid time slot for this doctor on this date.');
        }

        const appointmentStatus = requestedStatus || 'confirmed';
        const dateClass = classifyBookingDate(date);
        const bookingType = dateClass.isInstant ? 'instant' : 'request';

        // Create the appointment
        const appointmentRef = db.collection('appointments').doc();
        const appointmentData = {
            patientId: patientPhone,
            doctorId,
            patientName,
            patientPhone,
            patientEmail: patientEmail || null,
            appointmentDate: date,
            timeSlot: time,
            bookingType,
            type: await detectFollowUp(patientPhone, doctorId),
            status: appointmentStatus,
            createdAt: FieldValue.serverTimestamp(),
            confirmedAt: appointmentStatus === 'confirmed' ? FieldValue.serverTimestamp() : null,
            createdByAdmin: true,
        };

        // If instant booking, also mark the slot
        if (dateClass.isInstant) {
            const slotId = buildSlotId(doctorId, date, time);
            const slotRef = db.collection('doctorSlots').doc(slotId);

            const batch = db.batch();
            batch.set(appointmentRef, appointmentData);

            // Create or update the slot document
            batch.set(slotRef, {
                doctorId,
                date,
                time,
                booked: true,
                appointmentId: appointmentRef.id,
                expiresAt: new Date(date + 'T23:59:59+05:30'),
            }, { merge: true });

            await batch.commit();
        } else {
            await appointmentRef.set(appointmentData);
        }

        // Upsert patient
        const patientRef = db.collection('patients').doc(patientPhone);
        await patientRef.set({
            name: patientName,
            phone: patientPhone,
            ...(patientEmail ? { email: patientEmail } : {}),
            lastAppointmentAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        return sendSuccess(res, {
            appointmentId: appointmentRef.id,
            message: 'Booking created successfully by admin.',
        });

    } catch (error) {
        console.error('Error in POST /api/admin/bookings:', error);
        return sendError(res, 500, `Internal server error: ${error.message}`);
    }
}

// ─── PATCH: Update a booking ──────────────────────────────────────────────────────

async function handlePatch(req, res) {
    const result = await verifyAuth(req);
    if (result.error) return sendError(res, result.status, result.error);

    const { user } = result;
    const { appointmentId, action, patientName, patientPhone, patientEmail } = req.body;

    if (!appointmentId) return sendError(res, 400, 'Missing appointmentId');

    try {
        const appointmentRef = db.collection('appointments').doc(appointmentId);
        const appointmentDoc = await appointmentRef.get();

        if (!appointmentDoc.exists) return sendError(res, 404, 'Appointment not found');

        const appointment = appointmentDoc.data();

        // Doctor can only update their own appointments
        if (user.role === 'doctor' && appointment.doctorId !== user.doctorId) {
            return sendError(res, 403, 'You can only manage your own appointments');
        }

        const updateData = {};

        // Handle status change via action
        if (action) {
            const statusMap = {
                confirm: 'confirmed',
                reject: 'rejected',
                cancel: 'cancelled',
                complete: 'completed',
            };

            const allowedTransitions = {
                pending: ['confirm', 'reject', 'cancel'],
                confirmed: ['complete', 'cancel'],
                rejected: [],
                cancelled: [],
                completed: [],
            };

            if (!statusMap[action]) {
                return sendError(res, 400, `Invalid action: ${action}`);
            }

            const allowed = allowedTransitions[appointment.status] || [];
            if (!allowed.includes(action)) {
                return sendError(res, 400, `Cannot ${action} an appointment with status "${appointment.status}"`);
            }

            updateData.status = statusMap[action];

            if (action === 'confirm') {
                updateData.confirmedAt = FieldValue.serverTimestamp();
            }

            // Free slot if rejecting/cancelling an instant booking
            if ((action === 'reject' || action === 'cancel') && appointment.bookingType === 'instant') {
                const slotId = `${appointment.doctorId}_${appointment.appointmentDate}_${appointment.timeSlot}`;
                const slotRef = db.collection('doctorSlots').doc(slotId);
                const slotDoc = await slotRef.get();

                if (slotDoc.exists && slotDoc.data().booked) {
                    const batch = db.batch();
                    batch.update(appointmentRef, updateData);
                    batch.update(slotRef, { booked: false, appointmentId: null });
                    await batch.commit();

                    return sendSuccess(res, {
                        appointmentId,
                        newStatus: statusMap[action],
                        slotFreed: true,
                        message: `Appointment ${statusMap[action]}. Slot freed.`,
                    });
                }
            }
        }

        // Handle patient info updates (admin only)
        if (user.role === 'admin') {
            if (patientName) updateData.patientName = patientName;
            if (patientPhone) {
                updateData.patientPhone = patientPhone;
                updateData.patientId = patientPhone;
            }
            if (patientEmail !== undefined) updateData.patientEmail = patientEmail || null;
        }

        if (Object.keys(updateData).length === 0) {
            return sendError(res, 400, 'No valid updates provided');
        }

        await appointmentRef.update(updateData);

        return sendSuccess(res, {
            appointmentId,
            message: 'Appointment updated successfully.',
            ...(updateData.status ? { newStatus: updateData.status } : {}),
        });

    } catch (error) {
        console.error('Error in PATCH /api/admin/bookings:', error);
        return sendError(res, 500, `Internal server error: ${error.message}`);
    }
}

async function handleFollowupCheck(req, res) {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const { patientPhone, doctorId } = req.query;
    console.log('[FollowupCheck] params:', { patientPhone, doctorId });
    if (!patientPhone || !doctorId) return sendError(res, 400, 'Missing params');

    const type = await detectFollowUp(patientPhone, doctorId);
    console.log('[FollowupCheck] result type:', type);
    return sendSuccess(res, { type });
}

async function detectFollowUp(patientId, doctorId) {
    console.log('[detectFollowUp] checking patientId:', patientId, 'for doctor:', doctorId);
    try {
        const recentAppointments = await db.collection('appointments')
            .where('patientId', '==', patientId)
            .where('doctorId', '==', doctorId)
            .get();

        console.log('[detectFollowUp] found docs:', recentAppointments.size);
        if (recentAppointments.empty) return 'new';

        const matching = recentAppointments.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(a => ['confirmed', 'completed'].includes(a.status))
            .sort((a, b) => (b.appointmentDate || '').localeCompare(a.appointmentDate || ''));

        console.log('[detectFollowUp] matching confirmed/completed:', matching.length);
        if (matching.length === 0) return 'new';

        console.log('[detectFollowUp] last appointment date:', matching[0].appointmentDate);
        const lastDate = new Date(matching[0].appointmentDate + 'T00:00:00');
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        console.log('[detectFollowUp] diff days:', diffDays);
        return diffDays <= 7 ? 'followup' : 'new';
    } catch (error) {
        console.error('detectFollowUp error:', error);
        return 'new';
    }
}
