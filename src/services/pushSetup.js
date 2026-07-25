import { messaging, getToken, VAPID_KEY } from "../config/firebase";
import { registerDevice } from "./deviceService";

export function getOrCreateDeviceId() {
  let id = localStorage.getItem("tms_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("tms_device_id", id);
  }
  return id;
}

export async function setupPushNotifications() {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notification");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.warn("Notification permission denied");
    return;
  }

  try {
    const swUrl = `/firebase-messaging-sw.js?apiKey=${import.meta.env.VITE_FIREBASE_API_KEY}&authDomain=${import.meta.env.VITE_FIREBASE_AUTH_DOMAIN}&projectId=${import.meta.env.VITE_FIREBASE_PROJECT_ID}&messagingSenderId=${import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID}&appId=${import.meta.env.VITE_FIREBASE_APP_ID}`;
    const registration = await navigator.serviceWorker.register(swUrl);

    const fcmToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (fcmToken) {
      await registerDevice({
        deviceId: getOrCreateDeviceId(),
        fcmToken: fcmToken,
        platform: "web",
      });
      console.log("Device registered for push notifications successfully.");
    }
  } catch (error) {
    console.error("Error setting up push notifications:", error);
  }
}
