


import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function SearchCars() {
  const { id } = useParams();

  const [cars, setCars] = useState([]);
  const [dealer, setDealer] = useState({});
  const [message, setMessage] = useState("Loading...");

  const fetchDealer = async () => {
    try {
      const response = await fetch(`/djangoapp/get_dealer/${id}`);
      const data = await response.json();

      if (data.status === 200) {
        setDealer(data.dealer);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCars = async () => {
    try {
      const response = await fetch(`/djangoapp/inventory/${id}`);
      const data = await response.json();

      setCars(data.cars);

      if (data.cars.length === 0) {
        setMessage("No cars found");
      } else {
        setMessage("");
      }
    } catch (error) {
      console.error(error);
      setMessage("Error loading cars");
    }
  };

  useEffect(() => {
    fetchDealer();
    fetchCars();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Search Cars</h2>

      <h3>
        Dealer: {dealer.full_name || dealer.name || id}
      </h3>

      {message && <p>{message}</p>}

      {cars.map((car) => (
        <div
          key={car._id}
          style={{
            border: "1px solid #ccc",
            margin: "10px",
            padding: "10px",
          }}
        >
          <h4>
            {car.make} {car.model}
          </h4>

          <p>Year: {car.year}</p>
          <p>Mileage: {car.mileage}</p>
          <p>Body Type: {car.bodyType}</p>
        </div>
      ))}
    </div>
  );
}

export default SearchCars;
