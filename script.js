
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const errorData = document.querySelector(".error-container");

// initially variables needed
let currentTab = userTab;
const API_KEY = '10e9d8041bd7cc147d9383b26608073f';
currentTab.classList.add('current-tab');

getFromSessionStorage();

function switchTab(clickedTab){
    if(clickedTab != currentTab)
    {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active"))
        {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
            errorData.classList.remove("active");
        }
        else{
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getFromSessionStorage();
            errorData.classList.remove("active");
        }
    }

}

// Event listeners for tab switching
userTab.addEventListener("click", ()=>{
    switchTab(userTab);
});
searchTab.addEventListener("click", ()=>{
    switchTab(searchTab);
});


function getFromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("localCoordinates");
    if(!localCoordinates){
        grantAccessContainer.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const{lat,lon} = coordinates;

    grantAccessContainer.classList.remove('active');
    loadingScreen.classList.add('active');

    try{
        const result = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await result.json();

        loadingScreen.classList.remove('active');
        userInfoContainer.classList.add('active');

        renderWeatherInfo(data);
    }
    catch(error){
        loadingScreen.classList.remove('active');
        console.log("Faced some issue" ,error);
        return ; 
    }
}


function renderWeatherInfo(weatherInfo){
    // fetch the elements first
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]"); 
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const cloudiness = document.querySelector("[data-cloudiness]");
    const humidity = document.querySelector("[data-humidity]");

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${ weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
}


function getLocation(){
    if(navigator.geolocation)
       {
         navigator.geolocation.getCurrentPosition(showPosition);
        }
    else{
         alert("Geolocation is not supported by this browser.");
        }
}

function showPosition(position){
    const userCoordinates = { 
        lat: position.coords.latitude, 
        lon: position.coords.longitude,
    }
    sessionStorage.setItem("userCoordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grandAccessButton = document.querySelector("[data-grantAccess]");
grandAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    let cityName = searchInput.value;
    if (cityName === "")
    {
        return;
    }
    else{
        fetchSearchWeatherInfo(cityName);
    }
});

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active"); 

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);

    }
    catch(error){
        loadingScreen.classList.remove("active");
        if (errorData) {
            errorData.classList.add("active");
        }
    
        // Optionally clear previous weather info
        userInfoContainer.classList.remove("active");
    }
}
