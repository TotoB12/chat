const { get } = require("axios");

async function get_weather(input) {
  try {
    const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=1&appid=${process.env['OPENWEATHER_API_KEY']}`;
    const geocode = await get(geocodingUrl);

    const { lat, lon } = geocode.data[0];
    // console.log(lat, lon);

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env['OPENWEATHER_API_KEY']}`;
    const weather = await get(weatherUrl);

    const weatherData = JSON.stringify(weather.data);
    // console.log(weatherData)

    return {weather: weatherData };
  } catch (error) {
    console.error(error);
    return { weather: null };
  }
}

get_weather("paris");