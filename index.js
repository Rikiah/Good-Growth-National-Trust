(function () {
  // Step 1: Extract property location data
  function getPropertyLocation() {
    const mapLink = document.querySelector('a[href*="google.com/maps"]');
    if (mapLink) {
      const href = mapLink.getAttribute("href");
      const [, lat, lon] =
        href.match(/destination=([0-9.-]+)%2C([0-9.-]+)/) || [];
      if (lat && lon) {
        return { lat, lon };
      }
    }
    return null;
  }

  // Step 2: Fetch weather data
  function fetchWeatherData(lat, lon, callback) {
    const appid = "a2ef86c41a";
    const url = `https://europe-west1-amigo-actions.cloudfunctions.net/recruitment-mock-weather-endpoint/forecast?appid=${appid}&lat=${lat}&lon=${lon}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => callback(null, data))
      .catch((error) => callback(error, null));
  }

  // Step 3: Display weather data
  function displayWeatherData(weatherData) {
    const weatherElement = document.createElement("div");
    weatherElement.className = "weather-info";

    const weather = weatherData.list[0];
    const temp = weather.main.temp;
    const condition = weather.weather[0].description;

    weatherElement.innerHTML = `
          <h3>Current Weather</h3>
          <p>Temperature: ${temp.toFixed(2)}°C</p>
          <p>Condition: ${condition}</p>
      `;

    const container = document.querySelector(
      ".Sectionstyle__StyledSection-sc-1rnt8u1-0.fFbYaE.Placestyle__HeroSection-sc-7yy3d-0.cYgsUe"
    );
    if (container) {
      container.appendChild(weatherElement);
    } else {
      console.error("Container not found to display weather information");
    }
  }

  // Step 4: Implement A/B testing
  function getABGroup() {
    let group = localStorage.getItem("ab-group");
    if (!group) {
      group = Math.random() < 0.5 ? "control" : "test";
      localStorage.setItem("ab-group", group);
    }
    return group;
  }

  // Step 5: Main function to execute all steps
  function main() {
    const location = getPropertyLocation();
    if (location) {
      const group = getABGroup();
      if (group === "test") {
        fetchWeatherData(location.lat, location.lon, function (error, data) {
          if (!error) {
            displayWeatherData(data);
          } else {
            console.error("Error fetching weather data:", error);
          }
        });
      } else {
        console.log("User is in the control group, skipping weather display.");
      }
    } else {
      console.log("Location data not found");
    }
  }

  // Initialise the script
  main();
})();
