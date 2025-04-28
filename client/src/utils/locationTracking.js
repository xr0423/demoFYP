import { getCoordinates, fetchShopCoordinates, getDistance, sendNotification } from "./shopHelpers";

let shopListings = []; // Store all shop listings

export async function trackLocation(radius) {
  // Fetch all shop coordinates from the backend
  await fetchShopCoordinates().then((shops) => {
    shopListings = shops;
  });

  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Find nearby shops within 2 km
        let nearby = shopListings.filter((shop) => getDistance(latitude, longitude, shop.lat, shop.lng) < radius);

        if (nearby.length > 0) {
          // Throttle notifications to prevent spam
          throttleNotification(() => sendNotification(nearby.length), 300000); // 120s delay
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve location.");
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Throttling function to prevent frequent notifications
let lastNotificationTime = 0;
function throttleNotification(callback, delay) {
  const now = Date.now();
  if (now - lastNotificationTime > delay) {
    lastNotificationTime = now;
    callback();
  }
}
