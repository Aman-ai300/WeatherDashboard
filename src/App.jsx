import React, { useState } from 'react'; // Added React import
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler } from 'chart.js';
import { getCurrentWeather, getForecast } from './WeatherService';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler);

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught in ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger m-4" role="alert">
          <h4 className="alert-heading">Something went wrong!</h4>
          <p>{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <p>Please check the console for more details or refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const [currentWeather, forecastData] = await Promise.all([
        getCurrentWeather(city),
        getForecast(city)
      ]);
      setWeather(currentWeather);
      setForecast(forecastData);
    } catch (err) {
      setError(err.message);
      setWeather(null);
      setForecast([]);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = {
    labels: forecast.map(item => new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [{
      label: 'Temperature (°C)',
      data: forecast.map(item => item.main.temp),
      borderColor: '#0d6efd',
      backgroundColor: 'rgba(13, 110, 253, 0.2)',
      fill: true,
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Temperature (°C)'
        }
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-vh-100 bg-light d-flex flex-column align-items-center p-4">
        <h1 className="display-5 fw-bold mb-4 text-primary">Weather Dashboard</h1>
        
        <div className="w-100" style={{ maxWidth: '500px' }}>
          <form onSubmit={handleSearch} className="d-flex gap-2 mb-4">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name"
              className="form-control"
              aria-label="City"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'Loading...' : 'Search'}
            </button>
          </form>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
        </div>

        {weather && (
          <div className="w-100 card shadow mb-4" style={{ maxWidth: '800px' }}>
            <div className="card-body">
              <h2 className="card-title h4">{weather.name}, {weather.sys.country}</h2>
              <div className="d-flex align-items-center gap-3 mb-3">
                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt={weather.weather[0].description}
                  style={{ width: '64px', height: '64px' }}
                />
                <div>
                  <p className="h5">{weather.main.temp.toFixed(1)}°C</p>
                  <p className="text-capitalize">{weather.weather[0].description}</p>
                </div>
              </div>
              <div className="row g-2">
                <div className="col-6">Humidity: {weather.main.humidity}%</div>
                <div className="col-6">Wind: {weather.wind.speed} m/s</div>
                <div className="col-6">Pressure: {weather.main.pressure} hPa</div>
                <div className="col-6">Feels Like: {weather.main.feels_like.toFixed(1)}°C</div>
              </div>
            </div>
          </div>
        )}

        {forecast.length > 0 && (
          <div className="w-100 card shadow" style={{ maxWidth: '800px' }}>
            <div className="card-body">
              <h3 className="card-title h5 mb-4">5-Day Forecast</h3>
              <div className="row row-cols-2 row-cols-sm-5 g-3 mb-4">
                {forecast.map((item, index) => (
                  <div key={index} className="col text-center">
                    <p className="fw-medium">
                      {new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <img
                      src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                      alt={item.weather[0].description}
                      className="mx-auto"
                    />
                    <p>{item.main.temp.toFixed(1)}°C</p>
                    <p className="small text-capitalize">{item.weather[0].description}</p>
                  </div>
                ))}
              </div>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;