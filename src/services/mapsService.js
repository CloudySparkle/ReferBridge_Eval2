const env = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env
  : (typeof process !== 'undefined' && process.env)
  ? process.env
  : {};

const GOOGLE_MAPS_API_KEY = env.VITE_GOOGLE_MAPS_API_KEY || '';

export const isGoogleMapsConfigured = Boolean(
  GOOGLE_MAPS_API_KEY &&
  !GOOGLE_MAPS_API_KEY.includes('YourGoogleMapsApiKey')
);

let loadPromise = null;

export function loadGoogleMaps() {
  if (!isGoogleMapsConfigured) {
    return Promise.reject(new Error('Google Maps API key is not configured.'));
  }

  if (typeof window !== 'undefined' && window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      return reject(new Error('Document is undefined in current environment.'));
    }

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google.maps));
      existingScript.addEventListener('error', (err) => reject(err));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps script loaded but window.google.maps is undefined.'));
      }
    };

    script.onerror = (error) => {
      reject(new Error('Failed to load Google Maps script. Check network connection or API key restriction.'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

// Haversine formula for fallback distance calculation
export function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Number(distance.toFixed(1));
}

export function estimateTravelTimeMinutes(distanceKm, averageSpeedKmH = 35) {
  if (!distanceKm || distanceKm <= 0) return 0;
  const hours = (distanceKm * 1.25) / averageSpeedKmH;
  return Math.max(Math.round(hours * 60), 3);
}

export async function calculateRoute(originCoords, destCoords) {
  if (isGoogleMapsConfigured && typeof window !== 'undefined' && window.google && window.google.maps) {
    return new Promise((resolve, reject) => {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: new window.google.maps.LatLng(originCoords.lat, originCoords.lng),
          destination: new window.google.maps.LatLng(destCoords.lat, destCoords.lng),
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            const route = result.routes[0].legs[0];
            resolve({
              distanceText: route.distance.text,
              distanceKm: Number((route.distance.value / 1000).toFixed(1)),
              durationText: route.duration.text,
              durationMinutes: Math.round(route.duration.value / 60),
              directionsResult: result,
              isRealTime: true
            });
          } else {
            console.warn('Google DirectionsService failed:', status);
            const distanceKm = calculateHaversineDistanceKm(
              originCoords.lat,
              originCoords.lng,
              destCoords.lat,
              destCoords.lng
            );
            const durationMins = estimateTravelTimeMinutes(distanceKm);
            resolve({
              distanceText: `${distanceKm} km (estimate)`,
              distanceKm,
              durationText: `~${durationMins} mins (standard traffic)`,
              durationMinutes: durationMins,
              isRealTime: false,
              warning: 'Calculated via coordinate distance (Directions API status: ' + status + ')'
            });
          }
        }
      );
    });
  }

  const distanceKm = calculateHaversineDistanceKm(
    originCoords.lat,
    originCoords.lng,
    destCoords.lat,
    destCoords.lng
  );
  const durationMins = estimateTravelTimeMinutes(distanceKm);
  return {
    distanceText: `${distanceKm} km`,
    distanceKm,
    durationText: `~${durationMins} mins`,
    durationMinutes: durationMins,
    isRealTime: false,
    warning: 'Calculated using geographic coordinates. Configure VITE_GOOGLE_MAPS_API_KEY for live road routes.'
  };
}
