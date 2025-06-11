import axios from 'axios';

const API_KEY = '3de6a812dde8a31384f44e58b374a178'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function getCurrentWeather(city) {
  try {
    if (API_KEY === 'YOUR_API_KEY') {
      throw new Error('Please replace YOUR_API_KEY with a valid OpenWeatherMap API key in WeatherService.js');
    }
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric'
      }
    });
    console.log('Current weather fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching current weather:', error.message);
    throw new Error('City not found or API error');
  }
}

export async function getForecast(city) {
  try {
    if (API_KEY === 'YOUR_API_KEY') {
      throw new Error('Please replace YOUR_API_KEY with a valid OpenWeatherMap API key in WeatherService.js');
    }
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric'
      }
    });
    const daily = response.data.list.filter(item => item.dt_txt.includes('12:00:00'));
    console.log('Forecast fetched:', daily);
    return daily;
  } catch (error) {
    console.error('Error fetching forecast:', error.message);
    throw new Error('Forecast not available');
  }
}