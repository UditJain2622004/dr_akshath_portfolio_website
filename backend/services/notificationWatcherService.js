import { db } from "../_utils/firebaseAdmin.js";
import { sendBookingNotification } from "../_utils/brevoNotifications.js";
import { COLLECTIONS } from "../models/collections.js";

function watchAppointmentsForNotifications() {
  let initialized = false;
  const previousById = new Map();

  return db.collection(COLLECTIONS.appointments).onSnapshot(
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const id = change.doc.id;
        const data = change.doc.data();

        if (!initialized) {
          previousById.set(id, data);
          return;
        }

        if (change.type === "added") {
          console.log(`[Notification] New booking detected for ID: ${id}`);
          sendBookingNotification("booking_created", data).catch((err) => {
            console.error("[Notification] Booking created notification failed:", err.message);
          });
          previousById.set(id, data);
          return;
        }

        if (change.type === "modified") {
          const before = previousById.get(id) || null;
          previousById.set(id, data);

          if (!before) {
            return;
          }

          if (before.status !== data.status) {
            console.log(`[Notification] Status change for ${id}: ${before.status} -> ${data.status}`);
            const statusToEventMap = {
              confirmed: "booking_confirmed",
              rejected: "booking_rejected",
              cancelled: "booking_cancelled",
              completed: "booking_completed",
            };
            const notificationEvent = statusToEventMap[data.status];
            if (notificationEvent) {
              sendBookingNotification(notificationEvent, data).catch((err) => {
                console.error("[Notification] Booking status notification failed:", err.message);
              });
            }
          } else {
            console.log(`[Notification] Ignoring non-status update for ID: ${id}`);
          }
          return;
        }

        previousById.delete(id);
      });

      if (!initialized) {
        initialized = true;
        console.log("[Notification] Appointments watcher initialized");
      }
    },
    (error) => {
      console.error("[Notification] Appointments watcher error:", error.message);
    }
  );
}

export function initializeNotificationWatchers() {
  if (process.env.ENABLE_FIRESTORE_WATCHERS === "false") {
    return;
  }

  // Delay to ensure Firestore client is fully ready
  setTimeout(async () => {
    console.log("[Notification] Starting appointments watcher...");
    try {
      // Warm up the client with a simple query
      await db.collection(COLLECTIONS.appointments).limit(1).get();
      watchAppointmentsForNotifications();
    } catch (err) {
      console.error("[Notification] Watcher warm-up failed:", err.message);
    }
  }, 2000);
}
