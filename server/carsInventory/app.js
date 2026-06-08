const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const cors = require("cors");

const app = express();
const port = 3050;

app.use(cors());

const cars_data = JSON.parse(
  fs.readFileSync("data/car_records.json", "utf8")
);

mongoose.connect("mongodb://mongo_db:27017/", { dbName: "carsInventoryDB" });

const Cars = require("./inventory");

try {
  Cars.deleteMany({}).then(() => {
    Cars.insertMany(cars_data["cars"]);
  });
} catch (error) {
  console.log("Error loading car data:", error);
}

app.get("/", async (req, res) => {
  res.send("Welcome to the Mongoose API");
});

app.get("/cars/:id", async (req, res) => {
  try {
    const documents = await Cars.find({ dealer_id: req.params.id });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching cars" });
  }
});

app.get("/carsbymake/:id/:make", async (req, res) => {
  try {
    const documents = await Cars.find({
      dealer_id: req.params.id,
      make: req.params.make
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching cars by make" });
  }
});

app.get("/carsbymodel/:id/:model", async (req, res) => {
  try {
    const documents = await Cars.find({
      dealer_id: req.params.id,
      model: req.params.model
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching cars by model" });
  }
});

app.get("/carsbymaxmileage/:id/:mileage", async (req, res) => {
  try {
    const maxMileage = Number(req.params.mileage);
    const documents = await Cars.find({
      dealer_id: req.params.id,
      mileage: { $lte: maxMileage }
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching cars by mileage" });
  }
});

app.get("/carsbyprice/:id/:price", async (req, res) => {
  try {
    const maxPrice = Number(req.params.price);
    const documents = await Cars.find({
      dealer_id: req.params.id,
      price: { $lte: maxPrice }
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching cars by price" });
  }
});

app.get("/carsbyyear/:id/:year", async (req, res) => {
  try {
    const minYear = Number(req.params.year);
    const documents = await Cars.find({
      dealer_id: req.params.id,
      year: { $gte: minYear }
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching cars by year" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});