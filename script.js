let API_KEY = 'f15698c1ccbd767c2653fbced2c133f1';
let isCelsius = true;
let currentCity = '';

function getWeather() {
    const cityInput = document.getElementById("city").value;
    if (cityInput.trim()) {
        fetchWeather(cityInput);
    } else {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`)
                    .then(res => res.json())
                    .then(data => fetchWeather(data.name));
            },
            () => alert("Geolocation not allowed or unavailable")
        );
    }
}

function fetchWeather(city) {
    currentCity = city;
    let unit = isCelsius ? 'metric' : 'imperial';
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}`;
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${unit}`;

    fetch(weatherURL)
        .then(res => res.json())
        .then(data => {
            if (data.cod !== 200) throw new Error(data.message);
            updateBackground(data.weather[0].main);
            document.getElementById("weatherInfo").innerHTML = `
                <h3>${data.name}, ${data.sys.country} <img class="flag" src="https://flagsapi.com/${data.sys.country}/flat/32.png"></h3>
                <p><img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png"> ${data.weather[0].description}</p>
                <p>🌡️ Temp: ${data.main.temp}°${isCelsius ? 'C' : 'F'} (Feels like: ${data.main.feels_like}°)</p>
                <p>💧 Humidity: ${data.main.humidity}%</p>
                <p>🌬️ Wind: ${data.wind.speed} ${isCelsius ? 'm/s' : 'mph'}</p>
                <p>🌅 Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}</p>
                <p>🌇 Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}</p>
            `;

            fetch(forecastURL)
                .then(res => res.json())
                .then(forecastData => {
                    displayForecast(forecastData);
                    displayHourly(forecastData);
                });
        })
        .catch(() => {
            document.getElementById("weatherInfo").innerHTML = "<p style='color:red;'>City not found</p>";
            document.getElementById("forecast").innerHTML = "";
        });
}

function displayForecast(data) {
    let html = "<h4>5-Day Forecast</h4>";
    const days = {};
    data.list.forEach(item => {
        const date = new Date(item.dt_txt);
        const day = date.toLocaleDateString(undefined, { weekday: 'long' });
        if (!days[day] && Object.keys(days).length < 5) {
            days[day] = item;
            html += `<div class='forecast-day'>
                <strong>${day}</strong>: ${item.weather[0].description} 🌡️ ${item.main.temp}°
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
            </div>`;
        }
    });
    document.getElementById("forecast").innerHTML = html;
}

function displayHourly(data) {
    let html = "<h4>Next Hours</h4>";
    for (let i = 0; i < 6; i++) {
        const item = data.list[i];
        const date = new Date(item.dt_txt);
        html += `<div class='hour-slot'>
            <strong>${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>: 
            ${item.weather[0].description}, 🌡️ ${item.main.temp}°
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
        </div>`;
    }
    document.getElementById("hourly").innerHTML = html;
}

function toggleUnits() {
    isCelsius = !isCelsius;
    if (currentCity) fetchWeather(currentCity);
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}

function updateBackground(condition) {
    const backgrounds = {
        Clear: 'https://source.unsplash.com/1600x900/?clear,sky',
        Clouds: 'https://source.unsplash.com/1600x900/?cloudy,sky',
        Rain: 'https://source.unsplash.com/1600x900/?rain',
        Snow: 'https://source.unsplash.com/1600x900/?snow',
        Thunderstorm: 'https://source.unsplash.com/1600x900/?thunderstorm',
        Drizzle: 'https://source.unsplash.com/1600x900/?drizzle',
        Mist: 'https://source.unsplash.com/1600x900/?mist',
        Fog: 'https://source.unsplash.com/1600x900/?fog'
    };
    document.body.style.backgroundImage = `url('${backgrounds[condition] || 'https://source.unsplash.com/1600x900/?weather'}')`;
}
