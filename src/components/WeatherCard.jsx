function WeatherCard(props) {
  return (
    <div className="weather-card">

      <img
        className="weather-icon"
        src={`https://openweathermap.org/img/wn/${props.icon}@2x.png`}
        alt="weather icon"
      />

      <h2>{props.city}</h2>

      <p>Temperature: {props.temperature}°C</p>

      <p>Condition: {props.condition}</p>

      <p>Humidity: {props.humidity}%</p>

      <p>Wind Speed: {props.windSpeed} km/h</p>

    </div>
  );
}

export default WeatherCard;
