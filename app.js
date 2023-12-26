// Load env variables from .env file. You need to create your own on production for testing
require("dotenv").config();

// Import required libraries
const express = require("express");
const cors = require("cors");
const axios = require("axios"); // Import Axios for making HTTP requests
const app = express(); // Initialize Express application

// Set CORS options
const corsOptions = {
  origin: "*", // Allow requests from any origin (customize this in production)
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed HTTP methods
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-api-key",
    "x-idempotency-key",
  ], // Allowed headers for requests
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json()); // Parse incoming requests with JSON payloads

// Handle client configuration request
app.get("/client-configurations", async (req, res) => {
  const CLIENT_ID = process.env.CLIENT_ID; // Retrieve client ID from environment variables
  const API_KEY = process.env.API_KEY; // Retrieve API key from environment variables

  try {
    // Fetch access token
    const url = `http://localhost:3001/auth/token/${CLIENT_ID}`;
    const headers = {
      accept: "application/json",
      "x-api-key": API_KEY,
    };
    const response = await axios.post(url, null, { headers });
    const access_token = response.data.access_token;

    // Here i fetch client configuration
    const clientInitUrl = "http://localhost:3001/merchant/client/init";

    const clientHeaders = {
      accept: "application/json",
      "x-api-key": API_KEY,
      Authorization: `Bearer ${access_token}`,
    };

    const clientRequestBody = {
      type: "tokenization",
      holderReference: "some customer reference",
    };

    const clientResponse = await axios.post(clientInitUrl, clientRequestBody, {
      headers: clientHeaders,
    });

    // I receive base64 data and I decode it and then parse to JSON
    const base64Data = clientResponse.data.data;
    const decodedData = Buffer.from(base64Data, "base64").toString("utf-8");
    const clientConfigurations = JSON.parse(decodedData);

    // Sending configuration back to frontend
    console.log(clientConfigurations);
    res.json(clientConfigurations);
  } catch (error) {
    console.error("Error fetching client configurations:", error);
    res.status(500).json({ error: "Error fetching configurations" });
  }
});

// Route to act as a proxy for tokenization
app.post("/tokenize", async (req, res) => {
  try {
    const url = "http://localhost:3001/public/payment/instruments/tokenize";
    const response = await axios.post(url, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Tokenization error:", error.message);
    res.status(500).json({ error: "An error occurred during tokenization" });
  }
});

// My express server is running on port 3000
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
