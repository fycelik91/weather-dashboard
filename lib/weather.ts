const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
}

interface ForecastData {
  list: {
    dt: number;
    main: {
      temp: number;
    };
    weather: {
      description: string;
      icon: string;
    }[];
  }[];
}

export async function getCurrentWeather(city: string): Promise<WeatherData | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) {
      console.error(`Error fetching current weather for ${city}: ${res.statusText}`);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Error in getCurrentWeather:", error);
    return null;
  }
}

export async function getFiveDayForecast(city: string): Promise<ForecastData | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) {
      console.error(`Error fetching 5-day forecast for ${city}: ${res.statusText}`);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Error in getFiveDayForecast:", error);
    return null;
  }
}
