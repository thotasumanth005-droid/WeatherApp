let map;

// 🚀 Auto load
window.onload = () => {
  getWeatherByLocation();
};

// 📍 Location Weather
function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      // ✅ Get city name
      const geoRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      const geoData = await geoRes.json();

      const city = geoData.city || geoData.locality || "Your Location";

      getWeather(lat, lon, city);

    }, () => {
      document.getElementById("weatherResult").innerHTML = "❌ Location denied";
    });
  }
}

// 🔍 Search Weather (FIXED)
async function getWeatherByCity() {
  const city = document.getElementById("city").value.trim();

  if (!city) {
    alert("Enter city name!");
    return;
  }

  try {
    // ✅ Get coordinates from city
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      document.getElementById("weatherResult").innerHTML = "❌ City not found";
      return;
    }

    const lat = geoData.results[0].latitude;
    const lon = geoData.results[0].longitude;

    getWeather(lat, lon, geoData.results[0].name);

  } catch (error) {
    document.getElementById("weatherResult").innerHTML = "⚠️ Error";
  }
}

// 🌤 Weather Data
async function getWeather(lat, lon, name) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );

    const data = await res.json();

document.getElementById("weatherResult").innerHTML = `

<div class="main-card">
  <h2><i class="fa-solid fa-location-dot"></i> ${name}</h2>
  <div class="temp">${data.current_weather.temperature}°C</div>
</div>

<div class="side-cards">

  <div class="detail-box">
    <p>🌬</p>
    <span>Wind</span>
    <h4>${data.current_weather.windspeed} km/h</h4>
  </div>

  <div class="detail-box">
    <p>🧭</p>
    <span>Direction</span>
    <h4>${data.current_weather.winddirection}°</h4>
  </div>

  <div class="detail-box">
    <p>⏱</p>
    <span>Time</span>
    <h4>${data.current_weather.time}</h4>
  </div>

</div>
`;

    loadMap(lat, lon, name);

  } catch (error) {
    document.getElementById("weatherResult").innerHTML = "⚠️ Failed to load weather";
  }
}

// 🗺️ Map Function (FIXED)
function loadMap(lat, lon, name) {
  if (map) {
    map.remove();
  }

  map = L.map("map").setView([lat, lon], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  L.marker([lat, lon]).addTo(map)
    .bindPopup(`📍 ${name}`)
    .openPopup();
}