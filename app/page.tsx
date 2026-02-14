"use client";

import { useState, useEffect } from "react";
import { getCurrentWeather, getFiveDayForecast } from "../lib/weather";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  const [city, setCity] = useState("");
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const storedSearches = localStorage.getItem("recentSearches");
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches));
    }
  }, []);

  const handleSearch = async () => {
    if (!city) return;

    setLoading(true);
    setError(null);
    setCurrentWeather(null);
    setForecast(null);

    try {
      const weatherData = await getCurrentWeather(city);
      const forecastData = await getFiveDayForecast(city);

      if (weatherData && forecastData) {
        setCurrentWeather(weatherData);
        setForecast(forecastData);
        updateRecentSearches(city);
      } else {
        setError("City not found or API error.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateRecentSearches = (newCity: string) => {
    setRecentSearches((prevSearches) => {
      const updatedSearches = [
        newCity,
        ...prevSearches.filter((s) => s !== newCity),
      ].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
      return updatedSearches;
    });
  };

  const handleRecentSearchClick = (searchCity: string) => {
    setCity(searchCity);
    handleSearch(); // Trigger search with the clicked city
  };

  const forecastChartData = {
    labels: forecast?.list
      .filter((_item: any, index: number) => index % 8 === 0)
      .map((item: any) => new Date(item.dt * 1000).toLocaleDateString()),
    datasets: [
      {
        label: "Temperature (°C)",
        data: forecast?.list
          .filter((_item: any, index: number) => index % 8 === 0)
          .map((item: any) => item.main.temp),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white', // Legend text color
        },
      },
      title: {
        display: true,
        text: '5-Day Temperature Forecast',
        color: 'white', // Title text color
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += `${context.parsed.y}°C`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.2)', // X-axis grid lines
        },
        ticks: {
          color: 'white', // X-axis label color
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.2)', // Y-axis grid lines
        },
        ticks: {
          color: 'white', // Y-axis label color
          callback: function(value: string | number) {
            return `${value}°C`;
          }
        },
      },
    },
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-4xl font-bold text-center mb-8">Weather Dashboard</h1>

      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Enter city name"
          className="flex-grow p-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:border-blue-500"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <button
          className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold whitespace-nowrap"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {currentWeather && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Current Weather in {currentWeather.name}
          </h2>
          <p className="text-lg">Temperature: {currentWeather.main.temp}°C</p>
          <p className="text-lg">Humidity: {currentWeather.main.humidity}%</p>
          <p className="text-lg">Wind Speed: {currentWeather.wind.speed} km/h</p>
          <p className="text-lg capitalize">Description: {currentWeather.weather[0].description}</p>
        </div>
      )}

      {forecast && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">5-Day Forecast</h2>
          <div className="h-72">
            <Line data={forecastChartData} options={chartOptions as any} />
          </div>
        </div>
      )}

      {recentSearches.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Recent Searches</h2>
          <ul>
            {recentSearches.map((searchCity) => (
              <li
                key={searchCity}
                className="text-lg cursor-pointer hover:text-blue-400"
                onClick={() => handleRecentSearchClick(searchCity)}
              >
                {searchCity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
