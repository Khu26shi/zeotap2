const axios = require('axios');
const readline = require('readline');
const { MongoClient } = require('mongodb');

const path = require('path');




// List of Indian metros
const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

// Replace with your actual OpenWeatherMap API key
const apiKey = '05d932b1c07b2e8eb7bc9a001e8e23b1';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

// MongoDB connection URI
const mongoUri = 'mongodb://localhost:27017'; // Adjust if necessary
const dbName = 'weatherdb';
const collectionName = 'daily_summary';

// Temperature threshold for alerts
let temperatureThreshold = 35; // Default threshold value

// Function to connect to MongoDB
async function connectToMongo() {
  const client = new MongoClient(mongoUri);
  await client.connect();
  return client.db(dbName).collection(collectionName);


}



async function main() {
  const collection = await connectToMongo();
  setInterval(() => monitorWeather('C', collection), 60 * 60 * 1000);
}



// Function to convert temperature based on user preference
function convertTemperature(tempCelsius, unit) {
  switch (unit) {
    case 'F':
      return (tempCelsius * 9 / 5) + 32; // Convert to Fahrenheit
    case 'K':
      return tempCelsius + 273.15; // Convert to Kelvin
    case 'C':
    default:
      return tempCelsius; // Keep it Celsius
  }
}

// Function to fetch weather data for a city
async function fetchWeatherData(city, preferredUnit) {
  try {
    const response = await axios.get(apiUrl, {
      params: {
        q: city,
        appid: apiKey,
        units: 'metric' // Fetch data in Celsius
      }
    });

    console.log(`Fetched data for ${city}:`, response.data); // Log the API response

    const { main, weather, dt } = response.data;
    const currentTemperatureC = main.temp; // Current temperature in Celsius
    const weatherCondition = weather[0].description; // Weather condition

    // Convert temperature based on user preference
    const currentTemperature = convertTemperature(currentTemperatureC, preferredUnit);

    return {
      city,
      date: new Date(dt * 1000).toISOString().split('T')[0],
      temperature: currentTemperatureC,
      condition: weatherCondition
    };
  } catch (error) {
    console.error(`Error fetching data for ${city}:`, error.message);
    return null; // Return null if there's an error
  }
}

// Function to store daily summary in MongoDB
async function storeDailySummary(collection, summary) {
  await collection.updateOne(
    { city: summary.city, date: summary.date }, // Find existing entry
    { $setOnInsert: summary, $inc: { count: 1 } }, // Insert if not exists, increase count
    { upsert: true }
  );
}

// Function to calculate aggregates and store them in MongoDB
async function calculateAndStoreAggregates(collection) {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];

  // Fetch all daily summaries for today
  const dailyData = await collection.find({ date: dateString }).toArray();

  if (dailyData.length === 0) return; // No data for today

  const totalTemperature = dailyData.reduce((sum, entry) => sum + entry.temperature, 0);
  const maxTemperature = Math.max(...dailyData.map(entry => entry.temperature));
  const minTemperature = Math.min(...dailyData.map(entry => entry.temperature));

  // Determine dominant weather condition
  const conditionCounts = dailyData.reduce((acc, entry) => {
    acc[entry.condition] = (acc[entry.condition] || 0) + 1;
    return acc;
  }, {});

  const dominantCondition = Object.keys(conditionCounts).reduce((a, b) => conditionCounts[a] > conditionCounts[b] ? a : b);

  const dailySummary = {
    date: dateString,
    averageTemperature: (totalTemperature / dailyData.length).toFixed(2),
    maximumTemperature: maxTemperature,
    minimumTemperature: minTemperature,
    dominantCondition
  };

  console.log(`Daily Summary for ${dateString}:`, dailySummary);

  // Store the daily summary in MongoDB
  await collection.updateOne(
    { date: dateString }, // Find existing entry
    { $set: dailySummary }, // Update with new data
    { upsert: true } // Insert if it doesn't exist
  );
}

// Function to check for alerts based on temperature thresholds
async function checkAlerts(collection, latestData) {
  for (const data of latestData) {
    if (data.temperature > temperatureThreshold) {
      console.log(`Alert: Temperature in ${data.city} exceeds ${temperatureThreshold}°C: ${data.temperature}°C`);
      // Here, you can add additional logic to send email alerts if needed.
    }
  }
}

// Function to monitor weather data
async function monitorWeather(preferredUnit, collection) {
  const latestData = []; // To hold the latest weather data for alerts

  for (const city of cities) {
    const weatherData = await fetchWeatherData(city, preferredUnit);
    if (weatherData) {
      await storeDailySummary(collection, weatherData);
      latestData.push(weatherData); // Store latest data for alerts
    }
  }

  // Check alerts after fetching data
  await checkAlerts(collection, latestData);

  // Calculate and store aggregates after fetching data
  await calculateAndStoreAggregates(collection);
}

// Function to prompt user for temperature unit
async function promptUserForUnit() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Please enter your preferred temperature unit (C for Celsius, F for Fahrenheit, K for Kelvin): ', (unit) => {
      rl.close();
      resolve(unit.toUpperCase()); // Convert input to uppercase
    });
  });
}

// Function to prompt user for temperature threshold
async function promptUserForThreshold() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Please enter your temperature threshold for alerts (in Celsius): ', (threshold) => {
      rl.close();
      resolve(parseFloat(threshold)); // Convert input to float
    });
  });
}

// Main function to start the application
async function main() {
  let preferredUnit = await promptUserForUnit(); // Get user input for temperature unit
  // Validate input
  if (!['C', 'F', 'K'].includes(preferredUnit)) {
    console.error('Invalid unit. Defaulting to Celsius (C).');
    preferredUnit = 'C';
  }

  temperatureThreshold = await promptUserForThreshold(); // Get user input for temperature threshold

  const collection = await connectToMongo(); // Connect to MongoDB

  await monitorWeather(preferredUnit, collection); // Start monitoring weather data

  console.log('Weather monitoring completed.');
}


// Start the application
main().catch(console.error);
