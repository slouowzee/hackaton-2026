// Placeholder for Weather API
// You can use OpenWeatherMap or similar
const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

export const fetchWeather = async (lat: number, lon: number) => {
  // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`);
  // return response.json();
  return { temp: 20, condition: 'Sunny' }; // Mock data
};

// Placeholder for Routing/Directions
// You can use OSRM, Google Directions, or Mapbox
export const fetchRouteTime = async (start: {lat: number, lon: number}, end: {lat: number, lon: number}, mode: 'walking' | 'cycling' | 'driving') => {
  // Implementation depends on the provider
  // Example: OSRM
  // const profile = mode === 'cycling' ? 'bike' : mode === 'walking' ? 'foot' : 'car';
  // const url = `http://router.project-osrm.org/route/v1/${profile}/${start.lon},${start.lat};${end.lon},${end.lat}?overview=false`;
  
  // Mock return
  return {
    duration: 15, // minutes
    distance: 2.5, // km
  };
};
