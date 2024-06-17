// Step 1: Extract property location data from website

(function () {
  // Inspected the page and couldn't find any property location in any of the HTML elements. Checked any Javascript variables or functions that may have be storing location data. Also looked at network requests for any API calls. Used the search function to look for words like latitude, longitude, lat, lon, location and geo. Eventually, I found all the data stored in a script tag when searching these words.

  // However, upon further inspection of the script tag and looking at the props, I couldn't find any co-ordinates besides the address of the location. Even though, the search was bringing up innerHTML, textContent.

  // After not being able to use the script tag, I had to remove it and find another way. Also, I wasn't able to use JSON.parse to extracr the data properties. With further inspection of the code, I looked into the div called 'getting-there-map-description' and found that within this element there were a bunch of images from the google maps API containing co-ordinates. I knew they could be extracted from the href but I hadn't done this before so I researched how to do so.

  function getPropertyLocation() {
    const mapLink = document.querySelector('a[href*="google.com/maps"]');
    if (mapLink) {
      const href = mapLink.getAttribute("href");
      const [lat, lon] =
        href.match(/destination=([0-9.-]+)%2C([0-9.-]+)/) || [];
      if (lat && lon) {
        return { lat, lon };
      }
    }
    return null;
  }

  // Extract and log the property location data, this allows the co-ordinates to be extracted and printed in the console.
  //   const location = getPropertyLocation();
  //   if (location) {
  //     console.log(`Latitude: ${location.lat}, Longitude: ${location.lon}`);
  //   } else {
  //     console.log("Location data not found");
  //   }

  // Step 2: Fetch weather data from endpoint

  // This code was quite easy to implement from previous code I'd already written when using an external API. With this endpoint created for me it was simple to get the data I needed.

  function fetchWeatherData(lat, lon, callback) {
    const appid = "a2ef86c41a";
    const url = `https://europe-west1-amigo-actions.cloudfunctions.net/recruitment-mock-weather-endpoint/forecast?appid=${appid}&lat=${lat}&lon=${lon}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => callback(null, data))
      .catch((error) => callback(error, null));
  }

  // Extract location and fetch weather data, using step 1 and 2 we are able to write an if statement using the extracted co-ordinates and display it in the console, the next step will be to display it rather than just returning everything

  //   const location = getPropertyLocation();
  //   if (location) {
  //     fetchWeatherData(location.lat, location.lon, function (error, data) {
  //       if (!error) {
  //         console.log("Weather Data:", data);
  //       } else {
  //         console.error("Error fetching weather data:", error);
  //       }
  //     });
  //   } else {
  //     console.log("Location data not found");
  //   }

  // Step 3: Display the weather data

  function displayWeatherData(weatherData) {
    const weatherElement = document.createElement("div");
    weatherElement.className = "weather-info";

    // Extracting the data from the mock API, I had some issues with how the data was being represented in the API and had to destrcture what was happening. I tried to log it in the console and figured it out that way but found it difficult to understand. Luckily, all the data was on the url and the pretty print feature made it easy to understand and extract. These were the 3 I decided to display.
    const weather = weatherData.list[0];
    const temp = weather.main.temp;
    const condition = weather.weather[0].description;

    // Fixed the temperature to be two decimals, rather than displaying the whole number
    weatherElement.innerHTML = `
        <h3>Current Weather</h3>
        <p>Temperature: ${temp.toFixed(2)}°C</p>
        <p>Condition: ${condition}</p>
    `;

    // Finding a specific container to displau the weather information was difficult as the query selector wasn't doing what I intended and displaying it correctly, I found this one using the inspect feature and it added it where I wanted.
    const container = document.querySelector(
      ".Sectionstyle__StyledSection-sc-1rnt8u1-0.fFbYaE.Placestyle__HeroSection-sc-7yy3d-0.cYgsUe"
    );

    if (container) {
      container.appendChild(weatherElement);
    } else {
      console.error("Container not found to display weather information");
    }
  }

  //   function main() {
  //     const location = getPropertyLocation();
  //     if (location) {
  //         fetchWeatherData(location.lat, location.lon, function(error, data) {
  //             if (!error) {
  //                 displayWeatherData(data);
  //             } else {
  //                 console.error('Error fetching weather data:', error);
  //             }
  //         });
  //     } else {
  //         console.log('Location data not found');
  //     }
  // }

  // Step 4: Implement A/B testing

  // A/B testing, split testing was a new concept I had to learn, I'd only had experience writing tests using libaries such as playwright and jest. This style of testing offers a new perspective by having a control and test. I also learned the difference between local and session storage, I'd used local storage before but not session.

  // By using A/B testing, and adding this weather feature it would enable us to evaluate whether the displaying on this data had a negative or positive impact. We can track how users respond, test different variants, allow us to fine tune with user expectations and measure metrics to justify decisions and future enhancements.

  // This testing logic, will randomly assign users to the control or test group based on local storage.

  // Clear localStorage for 'ab-group'
  // localStorage.removeItem('ab-group');

  function getABGroup() {
    let group = localStorage.getItem("ab-group");
    if (!group) {
      group = Math.random() < 0.5 ? "control" : "test";
      localStorage.setItem("ab-group", group);
    }
    return group;
  }

  // Step 5: End function to execute all steps together, also to initalise the script to work
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
