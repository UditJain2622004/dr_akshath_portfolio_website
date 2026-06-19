import "dotenv/config";
import { db } from "./firebaseAdmin.js";
import { format } from "date-fns";

// ─── Constants ──────────────────────────────────────────────────────────────────

const DOCTOR_NAME = "Dr. Akshath Ramesh Acharya";
const DOCTOR_SHORT = "Dr. Akshath";
const SUCCESS_COLOR = "#2d9a5c";     // Green for confirmations
const DANGER_COLOR = "#e5533d";      // Red for rejections
const CONTACT_PHONE = "+91 99999 99999"; // TODO: Update with real phone

// Only these events trigger email + SMS notifications
const NOTIFY_EVENTS = new Set(["booking_confirmed", "booking_rejected"]);

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  try {
    return format(new Date(dateStr + "T00:00:00"), "d MMMM yyyy");
  } catch {
    return dateStr;
  }
}

function normalizePhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  return digits;
}

async function resolveDoctorName() {
  try {
    const doc = await db.collection("doctorProfile").doc("main").get();
    return doc.exists ? doc.data().name || DOCTOR_NAME : DOCTOR_NAME;
  } catch {
    return DOCTOR_NAME;
  }
}

async function resolveClinic(payload) {
  if (!payload?.clinicId) {
    return { clinicName: "Clinic", clinicAddress: "" };
  }

  try {
    const doc = await db.collection("clinics").doc(payload.clinicId).get();
    if (!doc.exists) {
      return { clinicName: payload.clinicId, clinicAddress: "" };
    }
    const data = doc.data();
    return {
      clinicName: data.name || payload.clinicId,
      clinicAddress: data.address || "",
    };
  } catch {
    return { clinicName: payload.clinicId, clinicAddress: "" };
  }
}

// ─── Brevo API Request ──────────────────────────────────────────────────────────

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
    const message =
      data?.message || `Brevo API request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

// ─── Email HTML Templates ───────────────────────────────────────────────────────

function emailWrapper(headerBg, headerTitle, bodyContent) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f0f2f5; padding: 30px 10px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background: ${headerBg}; color: #ffffff; padding: 28px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">${DOCTOR_NAME}</h1>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">${headerTitle}</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
          ${bodyContent}
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 18px 30px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
          <p style="margin: 0;">© ${new Date().getFullYear()} ${DOCTOR_NAME}. All rights reserved.</p>
          <p style="margin: 4px 0 0;">This is an automated notification. Please do not reply to this email.</p>
        </div>

      </div>
    </div>
  `;
}

function detailsCard(details, bgColor = "#f8fafc", borderColor = "#e8ecf1") {
  const rows = details
    .filter((d) => d.value)
    .map(
      (d) =>
        `<p style="margin: 6px 0; font-size: 14px; color: #333;"><strong style="color: #555;">${d.label}:</strong> ${d.value}</p>`
    )
    .join("");

  return `
    <div style="background: ${bgColor}; padding: 18px 20px; border-radius: 10px; margin: 20px 0; border: 1px solid ${borderColor};">
      ${rows}
    </div>
  `;
}

function buildEmailHtml(event, payload, doctorName, clinicMeta) {
  const patientName = payload.patientName || "Patient";
  const appointmentDate = payload.appointmentDate || "-";
  const timeSlot = payload.timeSlot || "-";

  const appointmentDetails = [
    { label: "Patient Name", value: patientName },
    { label: "Doctor", value: doctorName },
    { label: "Clinic", value: clinicMeta.clinicName },
    ...(clinicMeta.clinicAddress
      ? [{ label: "Address", value: clinicMeta.clinicAddress }]
      : []),
    { label: "Date", value: appointmentDate },
    { label: "Time Slot", value: timeSlot },
  ];

  if (event === "booking_confirmed") {
    return emailWrapper(SUCCESS_COLOR, "Appointment Confirmed", `
      <p style="font-size: 16px; color: #222;">Hello <strong>${patientName}</strong>,</p>
      <p style="font-size: 15px; color: #555; line-height: 1.6;">
        Great news! Your appointment has been <strong style="color: ${SUCCESS_COLOR};">confirmed</strong>. Here are your appointment details:
      </p>
      ${detailsCard(appointmentDetails, "#f0faf4", "#c8e6d5")}
      <div style="background: #e8f5e9; padding: 12px 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid ${SUCCESS_COLOR};">
        <p style="margin: 0; font-size: 13px; color: #2e7d32;">
          📋 <strong>Please arrive 10 minutes early</strong> and carry any relevant medical reports or prescriptions.
        </p>
      </div>
      <p style="font-size: 14px; color: #777;">
        If you need to reschedule, contact us at <strong>${CONTACT_PHONE}</strong>.
      </p>
      <p style="margin-top: 24px; font-size: 14px; color: #444;">
        We look forward to seeing you,<br><strong>${DOCTOR_SHORT}'s Team</strong>
      </p>
    `);
  }

  // booking_rejected
  return emailWrapper(DANGER_COLOR, "Appointment Update", `
    <p style="font-size: 16px; color: #222;">Hello <strong>${patientName}</strong>,</p>
    <p style="font-size: 15px; color: #555; line-height: 1.6;">
      We regret to inform you that your appointment request could not be confirmed at this time.
    </p>
    ${detailsCard(appointmentDetails, "#fff5f5", "#f5c2c0")}
    <p style="font-size: 14px; color: #777;">
      This may be due to slot unavailability or scheduling conflicts.
      We recommend booking another slot at your convenience.
    </p>
    <p style="font-size: 14px; color: #555;">
      For assistance, contact us at <strong>${CONTACT_PHONE}</strong>.
    </p>
    <p style="margin-top: 24px; font-size: 14px; color: #444;">
      We appreciate your understanding,<br><strong>${DOCTOR_SHORT}'s Team</strong>
    </p>
  `);
}

// ─── SMS Builder ────────────────────────────────────────────────────────────────

function buildSmsContent(event, payload, clinicMeta) {
  const patientName = payload.patientName || "Patient";
  const date = payload.appointmentDate || "-";
  const time = payload.timeSlot || "-";

  if (event === "booking_confirmed") {
    return `Dear ${patientName}, Your appointment with ${DOCTOR_NAME} at ${clinicMeta.clinicName} is confirmed for ${date} at ${time}. Please arrive 10 min early. Contact: ${CONTACT_PHONE}.`;
  }

  // booking_rejected
  return `Dear ${patientName}, Your appointment request with ${DOCTOR_NAME} on ${date} at ${time} could not be confirmed. Please try booking a different slot. Contact: ${CONTACT_PHONE}.`;
}

// ─── Senders ────────────────────────────────────────────────────────────────────

async function sendSms(event, payload, doctorName, clinicMeta) {
  const patientPhone = normalizePhone(payload.patientPhone || payload.patientId);
  if (!patientPhone) return;

  await brevoRequest("transactionalSMS/send", {
    sender: DOCTOR_SHORT,
    recipient: patientPhone,
    content: buildSmsContent(event, payload, clinicMeta),
    type: "transactional",
    tag: event,
  });

  console.log(`[Brevo] SMS (${event}) sent to ${patientPhone}`);
}

async function sendEmail(event, payload, doctorName, clinicMeta) {
  const patientEmail = payload.patientEmail;
  if (!patientEmail) return;

  const subject = event === "booking_confirmed"
    ? `Appointment Confirmed – ${DOCTOR_SHORT}`
    : `Appointment Update – ${DOCTOR_SHORT}`;

  await brevoRequest("smtp/email", {
    sender: {
      name: DOCTOR_NAME,
      email: process.env.BREVO_SENDER_EMAIL || "no-reply@drakshath.com",
    },
    to: [{ email: patientEmail, name: payload.patientName || "Patient" }],
    subject,
    htmlContent: buildEmailHtml(event, payload, doctorName, clinicMeta),
  });

  console.log(`[Brevo] Email (${event}) sent to ${patientEmail}`);
}

// ─── Exported Functions ─────────────────────────────────────────────────────────

/**
 * Send email + SMS notification when a booking is confirmed or rejected.
 * Silently skips all other events (created, cancelled, completed, etc.).
 *
 * Called by the Firestore snapshot watcher (notificationWatcherService.js).
 *
 * @param {string} event - One of the booking_* event keys.
 * @param {object} payload - Appointment data from Firestore.
 */
export async function sendBookingNotification(event, payload) {
  if (!event || !payload) return;

  // Only send notifications for confirm / reject
  if (!NOTIFY_EVENTS.has(event)) {
    console.log(`[Brevo] Skipping notification for event: ${event}`);
    return;
  }

  const [doctorName, clinicMeta] = await Promise.all([
    resolveDoctorName(),
    resolveClinic(payload),
  ]);

  // Format the date for readability in emails/SMS
  const enrichedPayload = {
    ...payload,
    appointmentDate: payload.appointmentDate
      ? formatDate(payload.appointmentDate)
      : "-",
  };

  const tasks = [
    sendSms(event, enrichedPayload, doctorName, clinicMeta),
    sendEmail(event, enrichedPayload, doctorName, clinicMeta),
  ];

  const results = await Promise.allSettled(tasks);
  const rejected = results.filter((r) => r.status === "rejected");
  if (rejected.length === results.length) {
    throw rejected[0].reason;
  }
}
