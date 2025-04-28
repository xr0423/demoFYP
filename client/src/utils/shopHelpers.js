import { makeRequest } from "../axios";
const API_KEY = "AIzaSyADPNpHr57R9nj5kHaSiUnuOZGFb0x4ki8";

// Fetch shop coordinates from your backend
export async function fetchShopCoordinates() {
  try {
    const response = await makeRequest.get("shoplistings/findall");
    const shops = response.data;
    const shopListings = await Promise.all(
      shops.map(async (shop) => {
        const coordinates = await getCoordinates(
          `${shop.location},${shop.postal_code}`
        );
        return coordinates ? { ...shop, ...coordinates } : null;
      })
    );
    const filteredListings = shopListings.filter((shop) => shop !== null); // Filter out invalid entries
    return filteredListings;
  } catch (error) {
    return [];
  }
}

// Fetch top-rated shops with coordinates
export async function fetchTopRatedShops() {
  try {
    const response = await makeRequest.get("shoplistings/find/highlights");
    const data = response.data;
    const topRatedShops = await Promise.all(
      data.topRatedShops.map(async (shop) => {
        const coordinates = await getCoordinates(
          `${shop.location},${shop.postal_code}`
        );
        return coordinates ? { ...shop, ...coordinates } : null;
      })
    );
    return topRatedShops.filter((shop) => shop !== null); // Filter out invalid entries
  } catch (error) {
    return [];
  }
}

// Fetch featured shops with coordinates
export async function fetchFeaturedShops() {
  try {
    const response = await makeRequest.get("shoplistings/find/highlights");
    const data = response.data;
    const featuredShops = await Promise.all(
      data.featuredShops.map(async (shop) => {
        const coordinates = await getCoordinates(
          `${shop.location},${shop.postal_code}`
        );
        return coordinates ? { ...shop, ...coordinates } : null;
      })
    );
    return featuredShops.filter((shop) => shop !== null); // Filter out invalid entries
  } catch (error) {
    return [];
  }
}
// Convert address to coordinates using Google Maps API
export async function getCoordinates(address) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${API_KEY}`
    );
    const data = await response.json();
    if (data.status === "OK") {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

// Calculate the distance between two coordinates using the Haversine formula
export function getDistance(lat1, lng1, lat2, lng2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Send a notification to the user
export function sendNotification(nearbyCount) {
  const user = JSON.parse(localStorage.getItem("user")); // Use JSON.parse to parse the JSON string

  let url = "";
  if (user) {
    switch (user.type) {
      case "regular":
        url = "/user/map";
        break;
      case "owner":
        url = "/owner/map";
        break;
      case "expert":
        url = "/expert/map";
    }
  }

  // Construct absolute URL based on the current domain
  const baseUrl = window.location.origin; // e.g., https://yourdomain.com
  const fullUrl = `${baseUrl}${url}`;
  const notification = new Notification("You're near some coffee shops! ☕", {
    body: `There are ${nearbyCount} coffee shops around you. Tap to explore more!`,
    icon: "https://via.placeholder.com/150?text=Coffee+Shops",
  });
  // Redirect to the shop details page when the notification is clicked
  notification.onclick = function () {
    window.open(url);
  };
}
