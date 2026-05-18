import { useState, useEffect } from "react";
import WeatherCard from "./components/WeatherCard";
import "./App.css";

function App() {

  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [history, setHistory] = useState([]);
  const [savedCities, setSavedCities] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load recent searches
  useEffect(() => {

    const savedHistory =
      JSON.parse(localStorage.getItem("weatherHistory")) || [];

    setHistory(savedHistory);

  }, []);

  // Save recent searches
  useEffect(() => {

    localStorage.setItem(
      "weatherHistory",
      JSON.stringify(history)
    );

  }, [history]);

  // Load saved locations
  useEffect(() => {

    const saved =
      JSON.parse(localStorage.getItem("savedCities")) || [];

    setSavedCities(saved);

  }, []);

  // Save saved locations
  useEffect(() => {

    localStorage.setItem(
      "savedCities",
      JSON.stringify(savedCities)
    );

  }, [savedCities]);

  // Fetch weather by city
  const getWeatherByCity = async (cityName) => {

    try {

      const apiKey =
        "ea31990694c7709491a99f6807e21e10";

      setLoading(true);

      // Current weather API
      const currentWeatherUrl =
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

      const currentResponse =
        await fetch(currentWeatherUrl);

      const currentData =
        await currentResponse.json();

      if (currentData.cod !== 200) {

        setError("City not found");

        setLoading(false);

        return;
      }

      setError("");

      setWeatherData(currentData);

      // Forecast API
      const forecastUrl =
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;

      const forecastResponse =
        await fetch(forecastUrl);

      const forecastResult =
        await forecastResponse.json();

      setForecastData(forecastResult.list);

      // Save search history
      if (!history.includes(cityName)) {

        setHistory([...history, cityName]);
      }

      setLoading(false);

    } catch (error) {

      setLoading(false);

      console.error(error);
    }
  };

  // Search button
  const getWeatherData = () => {

    getWeatherByCity(city);
  };

  // Current location weather
  const getCurrentLocationWeather = () => {

    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(

        async (position) => {

          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          try {

            const apiKey =
              "ea31990694c7709491a99f6807e21e10";

            setLoading(true);

            // Current weather API
            const currentWeatherUrl =
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

            const currentResponse =
              await fetch(currentWeatherUrl);

            const currentData =
              await currentResponse.json();

            setWeatherData(currentData);

            // Forecast API
            const forecastUrl =
              `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

            const forecastResponse =
              await fetch(forecastUrl);

            const forecastResult =
              await forecastResponse.json();

            setForecastData(forecastResult.list);

            const cityName = currentData.name;

            if (
              cityName &&
              !history.includes(cityName)
            ) {

              setHistory([...history, cityName]);
            }

            setLoading(false);

          } catch (error) {

            setLoading(false);

            console.error(error);
          }
        },

        (error) => {

          if (error.code === 1) {
            setError("Location permission denied");
          }

          else if (error.code === 2) {
            setError("Location unavailable");
          }

          else if (error.code === 3) {
            setError("Location request timed out");
          }

          else {
            setError("Unable to retrieve location");
          }

          setLoading(false);
        }

      );
    }
  };

  // Click recent search
  const handleHistoryClick = (cityName) => {

    setCity(cityName);

    getWeatherByCity(cityName);
  };

  // Save location permanently
  const saveCity = (cityName) => {

    if (!savedCities.includes(cityName)) {

      setSavedCities([...savedCities, cityName]);
    }
  };

  return (

    <div className="app-container">

      <h1>Weather App</h1>

      <div className="search-box">

        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => {

            if (e.key === "Enter") {

              getWeatherData();
            }
          }}
        />

        <button onClick={getWeatherData}>
          Search
        </button>

        <button onClick={getCurrentLocationWeather}>
          Use Current Location
        </button>

      </div>

      {loading && <p>Loading...</p>}

      {error && (
        <p className="error">{error}</p>
      )}

      {weatherData?.main && (

        <>
          <WeatherCard
            city={weatherData?.name}
            temperature={weatherData?.main?.temp}
            condition={weatherData?.weather?.[0]?.description}
            humidity={weatherData?.main?.humidity}
            windSpeed={weatherData?.wind?.speed}
            icon={weatherData?.weather?.[0]?.icon}
          />

          <button
            onClick={() => saveCity(weatherData?.name)}
          >
            ⭐ Save Location
          </button>
        </>
      )}

      {/* Hourly Forecast */}

      {forecastData.length > 0 && (

        <>
          <h3>Hourly Forecast</h3>

          <div className="forecast-container">

            {forecastData
              .slice(0, 8)
              .map((item, index) => (

                <div
                  key={index}
                  className="forecast-card"
                >

                  <p>
                    {new Date(
                      item.dt_txt
                    ).getHours()}:00
                  </p>

                  <img
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                    alt="forecast icon"
                  />

                  <p>
                    {item.main.temp}°C
                  </p>

                </div>
              ))}

          </div>

          {/* 5 Day Forecast */}

          <h3>5-Day Forecast</h3>

          <div className="forecast-container">

            {forecastData
              .filter((item) =>
                item.dt_txt.includes("12:00:00")
              )
              .map((item, index) => (

                <div
                  key={index}
                  className="forecast-card"
                >

                  <p>
                    {new Date(
                      item.dt_txt
                    ).toLocaleDateString()}
                  </p>

                  <img
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                    alt="forecast icon"
                  />

                  <p>
                    {item.main.temp}°C
                  </p>

                </div>
              ))}

          </div>
        </>
      )}

      {/* Saved Locations */}

      <h3>Saved Locations</h3>

      <ul>

        {savedCities.map((city, index) => (

          <li
            key={index}
            className="history-item"
            onClick={() => handleHistoryClick(city)}
          >

            ⭐ {city}

          </li>
        ))}

      </ul>

      {/* Recent Searches */}

      <h3>Recent Searches</h3>

      <ul>

        {history.map((item, index) => (

          <li
            key={index}
            onClick={() =>
              handleHistoryClick(item)
            }
            className="history-item"
          >

            {item}

          </li>
        ))}

      </ul>

    </div>
  );
}

export default App;
