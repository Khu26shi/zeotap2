const mongoose = require('mongoose');

const weatherSummarySchema = new mongoose.Schema({
  city: String,
  date: Date,
  avgTemp: Number,
  condition: String,
});

module.exports = mongoose.model('WeatherSummary', weatherSummarySchema);
