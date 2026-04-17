import "dotenv/config";
import { db } from "./firebaseAdmin.js";

const BOOKING_EVENT_TO_SUBJECT = {
  booking_created: "Appointment Request Received",
  booking_confirmed: "Appointment Confirmed",
  booking_rejected: "Appointment Rejected",
  booking_cancelled: "Appointment Cancelled",
  booking_completed: "Appointment Completed",
};

const BOOKING_EVENT_TO_SMS_TEXT = {
  booking_created: "Your appointment request has been received.",
  booking_confirmed: "Your appointment has been confirmed.",
  booking_rejected: "Your appointment request was rejected.",
  booking_cancelled: "Your appointment was cancelled.",
  booking_completed: "Your appointment has been marked completed.",
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