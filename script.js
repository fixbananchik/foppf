console.log('Weather');

const apiKey = 'f707b7afc8bc4b36a32104719251907';
const city = 'Moscow';
const weatherContainer = document.getElementById('weather');

async function fetchWeather() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ru`);
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        const data = await response.json();
        renderWeather(data);
    } catch (error) {
        weatherContainer.innerHTML = `<div class='loader'>Не удалось загрузить погоду :(</div>`;
    }
}

function renderWeather(data) {
    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    const icon = data.weather[0].icon;
    const cityName = data.name;
    weatherContainer.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;">
            <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="${desc}" style="width:100px;height:100px;">
            <div style="font-size:2.5em;font-weight:bold;">${temp}°C</div>
            <div style="font-size:1.2em;">${desc.charAt(0).toUpperCase() + desc.slice(1)}</div>
            <div style="margin-top:8px;font-size:1em;">${cityName}</div>
        </div>
    `;
}

fetchWeather();

const weatherTodayContainer = document.getElementById('weather-today');

async function fetchTodayWeather() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=ru`);
        if (!response.ok) throw new Error('Ошибка загрузки прогноза');
        const data = await response.json();
        renderTodayWeather(data);
    } catch (error) {
        weatherTodayContainer.innerHTML = '<div class="loader">Не удалось загрузить прогноз :(</div>';
    }
}

function renderTodayWeather(data) {
    // Берём только прогнозы на сегодня
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const todayList = data.list.filter(item => item.dt_txt.startsWith(todayStr));
    if (todayList.length === 0) {
        weatherTodayContainer.innerHTML = '<div class="loader">Нет данных на сегодня</div>';
        return;
    }
    let table = '<table class="weather-today-table"><tr>';
    todayList.forEach(item => {
        const time = item.dt_txt.slice(11, 16);
        table += `<th>${time}</th>`;
    });
    table += '</tr><tr>';
    todayList.forEach(item => {
        table += `<td><img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}"></td>`;
    });
    table += '</tr><tr>';
    todayList.forEach(item => {
        table += `<td>${Math.round(item.main.temp)}°C</td>`;
    });
    table += '</tr></table>';
    weatherTodayContainer.innerHTML = table;
}

fetchTodayWeather();

const weatherWeekContainer = document.getElementById('weather-week');

async function fetchWeekWeather() {
    try {
        // Получаем координаты Москвы
        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
        if (!geoRes.ok) throw new Error('Ошибка геокодирования');
        const geoData = await geoRes.json();
        const { lat, lon } = geoData[0];
        // Получаем прогноз на 7 дней
        const weekRes = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts,current&appid=${apiKey}&units=metric&lang=ru`);
        if (!weekRes.ok) throw new Error('Ошибка загрузки недельного прогноза');
        const weekData = await weekRes.json();
        renderWeekWeather(weekData);
    } catch (error) {
        weatherWeekContainer.innerHTML = '<div class="loader">Не удалось загрузить прогноз на 7 дней :(</div>';
    }
}

function renderWeekWeather(data) {
    if (!data.daily || data.daily.length === 0) {
        weatherWeekContainer.innerHTML = '<div class="loader">Нет данных на 7 дней</div>';
        return;
    }
    let cards = '';
    const days = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
    data.daily.slice(0, 7).forEach((day, idx) => {
        const date = new Date(day.dt * 1000);
        const dayName = days[date.getDay()];
        const temp = Math.round(day.temp.day);
        const desc = day.weather[0].description;
        const icon = day.weather[0].icon;
        cards += `
            <div class="weather-day-card">
                <div class="day">${dayName}</div>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
                <div class="temp">${temp}°C</div>
                <div class="desc">${desc.charAt(0).toUpperCase() + desc.slice(1)}</div>
            </div>
        `;
    });
    weatherWeekContainer.innerHTML = cards;
}

fetchWeekWeather(); 