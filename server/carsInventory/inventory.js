const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  dealer_id: Number,
  make: String,
  model: String,
  bodyType: String,
  year: Number,
  mileage: Number,
  price: Number
});

const cars = mongoose.model('cars', carSchema);

module.exports = cars;