Overview
This is a real-time weather monitoring system for Indian metro cities, retrieving weather data from the OpenWeatherMap API and displaying it in both the terminal and a web interface. The system calculates daily weather rollups, triggers alerts based on user-configurable thresholds, and stores daily summaries in a MongoDB database for further analysis.

Features
Weather Data: Fetches current weather data for Indian metros (Delhi, Mumbai, Chennai, Bangalore, Kolkata, Hyderabad).
Temperature Unit Conversion: Converts temperature to Celsius, Fahrenheit, or Kelvin based on user input.
Daily Aggregates: Calculates average, maximum, and minimum temperatures, and determines the dominant weather condition.
Alert System: Alerts the user if the temperature exceeds the user-configured threshold.
Web Interface: Displays weather data, alerts, and daily summaries in a simple web interface.
Data Persistence: Stores daily summaries in MongoDB for further analysis.


Prerequisites
Node.js: Version 14 or higher is required. You can download Node.js here.
MongoDB: Ensure MongoDB is installed and running locally, or run it using Docker (see instructions below).
OpenWeatherMap API Key: You’ll need an API key from OpenWeatherMap. You can get one here.

Clone the repository:
git clone https://github.com/khu26shi/weather-monitoring-app.git
cd weather-monitoring-app

install dependencies:
npm install

Run the application :
node server.js