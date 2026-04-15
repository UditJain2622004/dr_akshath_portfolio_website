import "dotenv/config";

const CHECKUP_EVENT_TO_SUBJECT = {
  checkup_booked: "Health Checkup Booked",
  checkup_cancelled: "Health Checkup Cancelled",
  checkup_completed: "Health Checkup Completed",
};

const CHECKUP_EVENT_TO_SMS_TEXT = {
  checkup_booked: "Your health checkup has been booked.",
  checkup_cancelled: "Your health checkup booking has been cancelled.",
  checkup_completed: "Your health checkup has been marked completed.",
};

function normalizePhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  return digits;
}

function htmlForEvent(event, payload) {
  const statusLine = CHECKUP_EVENT_TO_SMS_TEXT[event] || "Health checkup updated.";
  return `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
      <h2>Nexus Enliven Hospital</h2>
      <p>Hello ${payload.patientName || "Patient"},</p>
      <p>${statusLine}</p>
      <ul>
        <li><strong>Package:</strong> ${payload.packageName || "-"}</li>
        <li><strong>Preferred Date:</strong> ${payload.preferredDate || "-"}</li>
        <li><strong>Status:</strong> ${(event || "").replace("checkup_", "") || "updated"}</li>
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

async function sendSms(event, payload) {
  const patientPhone = normalizePhone(payload.patientPhone || payload.patientId);
  if (!patientPhone) return;

  const statusText = CHECKUP_EVENT_TO_SMS_TEXT[event] || "Health checkup updated.";
  const content = `${statusText} Package: ${payload.packageName || "-"}. Date: ${payload.preferredDate || "-"}.`;

  await brevoRequest("transactionalSMS/send", {
    sender: "NE Hospital",
    recipient: patientPhone,
    content,
    type: "transactional",
    tag: event,
    organisationPrefix: "Nexus Enliven Hospital",
  });
}

async function sendEmail(event, payload) {
  const patientEmail = payload.patientEmail;
  if (!patientEmail) return;

  await brevoRequest("smtp/email", {
    sender: {
      name: "Nexus Enliven Hospital",
      email: process.env.BREVO_SENDER_EMAIL || "no-reply@nexusenliven.com",
    },
    to: [{ email: patientEmail, name: payload.patientName || "Patient" }],
    subject: CHECKUP_EVENT_TO_SUBJECT[event] || "Health Checkup Update",
    htmlContent: htmlForEvent(event, payload),
  });
}

export async function sendHealthCheckupNotification(event, payload) {
  if (!event || !payload) return;

  const tasks = [
    sendSms(event, payload),
    sendEmail(event, payload),
  ];

  const results = await Promise.allSettled(tasks);
  const rejected = results.filter((r) => r.status === "rejected");
  if (rejected.length === results.length) {
    throw rejected[0].reason;
  }
}