import "dotenv/config";
import { db } from "./firebaseAdmin.js";

const BOOKING_EVENT_TO_SUBJECT = {
  booking_created: "Appointment Request Received",
  booking_confirmed: "Appointment Confirmed",
  booking_rejected: "Appointment Rejected",
  booking_cancelled: "Appointment Cancelled",
  booking_completed: "Appointment Completed",
  booking_delayed: "Appointment Delayed",
  booking_back_on_schedule: "Doctor Back on Schedule",
};

const BOOKING_EVENT_TO_SMS_TEXT = {
  booking_created: "Your appointment request has been received.",
  booking_confirmed: "Your appointment has been confirmed.",
  booking_rejected: "Your appointment request was rejected.",
  booking_cancelled: "Your appointment was cancelled.",
  booking_completed: "Your appointment has been marked completed.",
  booking_delayed: "Your appointment is delayed by approximately {delayMinutes} minutes. We apologize for the inconvenience.",
  booking_back_on_schedule: "Good news! The doctor is back on schedule. Your appointment is on time.",
};

async function resolveDoctorName() {
  try {
    const doc = await db.collection('doctorProfile').doc('main').get();
    return doc.exists ? (doc.data().name || 'Doctor') : 'Doctor';
  } catch {
    return 'Doctor';
  }
}

async function resolveClinic(payload) {
  if (!payload?.clinicId) {
    return { clinicName: 'Clinic', clinicAddress: '' };
  }

  try {
    const doc = await db.collection('clinics').doc(payload.clinicId).get();
    if (!doc.exists) {
      return { clinicName: payload.clinicId, clinicAddress: '' };
    }
    const data = doc.data();
    return {
      clinicName: data.name || payload.clinicId,
      clinicAddress: data.address || '',
    };
  } catch {
    return { clinicName: payload.clinicId, clinicAddress: '' };
  }
}

function normalizePhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  return digits;
}

function htmlForEvent(event, payload, doctorName, clinicMeta) {
  const statusLine = BOOKING_EVENT_TO_SMS_TEXT[event] || "Appointment updated.";
  return `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
      <h2>Nexus Enliven Hospital</h2>
      <p>Hello ${payload.patientName || "Patient"},</p>
      <p>${statusLine}</p>
      <ul>
        <li><strong>Doctor:</strong> ${doctorName}</li>
        <li><strong>Clinic:</strong> ${clinicMeta.clinicName}</li>
        <li><strong>Address:</strong> ${clinicMeta.clinicAddress || '-'}</li>
        <li><strong>Date:</strong> ${payload.appointmentDate || "-"}</li>
        <li><strong>Time:</strong> ${payload.timeSlot || "-"}</li>
        <li><strong>Status:</strong> ${(event || "").replace("booking_", "") || "updated"}</li>
      </ul>
      <p>For support, contact Nexus Enliven Hospital.</p>
    </div>
  `;
}

async function brevoRequest(path, body) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  const response = await fetch(`https://api.brevo.com/v3/${path}`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || `Brevo API request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

async function sendSms(event, payload, doctorName, clinicMeta) {
  const patientPhone = normalizePhone(payload.patientPhone || payload.patientId);
  if (!patientPhone) return;

  const statusText = BOOKING_EVENT_TO_SMS_TEXT[event] || "Appointment updated.";
  const content = `${statusText} Doctor: ${doctorName}. Clinic: ${clinicMeta.clinicName}. Date: ${payload.appointmentDate || "-"}, Time: ${payload.timeSlot || "-"}.`;

  await brevoRequest("transactionalSMS/send", {
    sender: "NE Hospital",
    recipient: patientPhone,
    content,
    type: "transactional",
    tag: event,
    organisationPrefix: "Nexus Enliven Hospital",
  });
}

async function sendEmail(event, payload, doctorName, clinicMeta) {
  const patientEmail = payload.patientEmail;
  if (!patientEmail) return;

  await brevoRequest("smtp/email", {
    sender: {
      name: "Nexus Enliven Hospital",
      email: process.env.BREVO_SENDER_EMAIL || "no-reply@nexusenliven.com",
    },
    to: [{ email: patientEmail, name: payload.patientName || "Patient" }],
    subject: BOOKING_EVENT_TO_SUBJECT[event] || "Appointment Update",
    htmlContent: htmlForEvent(event, payload, doctorName, clinicMeta),
  });
}

export async function sendBookingNotification(event, payload) {
  if (!event || !payload) return;

  const [doctorName, clinicMeta] = await Promise.all([
    resolveDoctorName(),
    resolveClinic(payload),
  ]);

  const tasks = [
    sendSms(event, payload, doctorName, clinicMeta),
    sendEmail(event, payload, doctorName, clinicMeta),
  ];

  const results = await Promise.allSettled(tasks);
  const rejected = results.filter((r) => r.status === "rejected");
  if (rejected.length === results.length) {
    throw rejected[0].reason;
  }
}

/**
 * Send a delay-specific notification to a patient.
 * @param {string} event - 'booking_delayed' or 'booking_back_on_schedule'
 * @param {object} appointment - The appointment data
 * @param {number} delayMinutes - Delay duration in minutes
 * @param {string} clinicName - Human-readable clinic name
 */
export async function sendDelayNotification(event, appointment, delayMinutes, clinicName) {
  if (!event || !appointment) return;

  const doctorName = await resolveDoctorName();
  const clinicMeta = {
    clinicName: clinicName || appointment.clinicId,
    clinicAddress: '',
  };

  // Resolve clinic address if we have clinicId
  if (appointment.clinicId) {
    try {
      const doc = await db.collection('clinics').doc(appointment.clinicId).get();
      if (doc.exists) {
        clinicMeta.clinicAddress = doc.data().address || '';
        clinicMeta.clinicName = doc.data().name || clinicName;
      }
    } catch { /* ignore */ }
  }

  // Build SMS with delay minutes interpolated
  const smsTemplate = BOOKING_EVENT_TO_SMS_TEXT[event] || 'Appointment update.';
  const smsContent = smsTemplate.replace('{delayMinutes}', String(delayMinutes));

  // Build delay-specific HTML
  const statusLine = event === 'booking_delayed'
    ? `Your appointment is delayed by approximately <strong>${delayMinutes} minutes</strong>. We apologize for the inconvenience.`
    : `Good news! The doctor is back on schedule. Your appointment is on time.`;

  const delayHtml = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
      <h2>Nexus Enliven Hospital</h2>
      <p>Hello ${appointment.patientName || 'Patient'},</p>
      <p>${statusLine}</p>
      <ul>
        <li><strong>Doctor:</strong> ${doctorName}</li>
        <li><strong>Clinic:</strong> ${clinicMeta.clinicName}</li>
        <li><strong>Address:</strong> ${clinicMeta.clinicAddress || '-'}</li>
        <li><strong>Date:</strong> ${appointment.appointmentDate || '-'}</li>
        <li><strong>Time:</strong> ${appointment.timeSlot || '-'}</li>
      </ul>
      <p>For support, contact Nexus Enliven Hospital.</p>
    </div>
  `;

  const tasks = [];

  // SMS
  const patientPhone = normalizePhone(appointment.patientPhone || appointment.patientId);
  if (patientPhone) {
    tasks.push(
      brevoRequest('transactionalSMS/send', {
        sender: 'NE Hospital',
        recipient: patientPhone,
        content: `${smsContent} Doctor: ${doctorName}. Clinic: ${clinicMeta.clinicName}. Date: ${appointment.appointmentDate || '-'}, Time: ${appointment.timeSlot || '-'}.`,
        type: 'transactional',
        tag: event,
        organisationPrefix: 'Nexus Enliven Hospital',
      })
    );
  }

  // Email
  if (appointment.patientEmail) {
    tasks.push(
      brevoRequest('smtp/email', {
        sender: {
          name: 'Nexus Enliven Hospital',
          email: process.env.BREVO_SENDER_EMAIL || 'no-reply@nexusenliven.com',
        },
        to: [{ email: appointment.patientEmail, name: appointment.patientName || 'Patient' }],
        subject: BOOKING_EVENT_TO_SUBJECT[event] || 'Appointment Update',
        htmlContent: delayHtml,
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  const rejected = results.filter((r) => r.status === 'rejected');
  if (rejected.length === results.length && rejected.length > 0) {
    throw rejected[0].reason;
  }
}