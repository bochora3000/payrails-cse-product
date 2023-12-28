// Load environment variables from .env file
require("dotenv").config();

// Import required libraries
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();

// Middleware configuration
const corsOptions = {
  origin: "*", // Allow requests from any origin (customize this in production)
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-api-key",
    "x-idempotency-key",
  ],
};
app.use(cors(corsOptions));
app.use(express.json());

// Handle client configuration request
app.get("/client-configurations", async (req, res) => {
  try {
    // 1st - retrieve access data to initialize the client
    const CLIENT_ID = process.env.CLIENT_ID;
    const API_KEY = process.env.API_KEY;

    const url = `http://localhost:3001/auth/token/${CLIENT_ID}`;
    const headers = {
      accept: "application/json",
      "x-api-key": API_KEY,
    };

    // request to get token and store it
    const response = await axios.post(url, null, { headers });
    const access_token = response.data.access_token;

    // 2nd - I request client initialization data
    const clientInitUrl = "http://localhost:3001/merchant/client/init";
    const clientHeaders = {
      accept: "application/json",
      "x-api-key": API_KEY,
      Authorization: `Bearer ${access_token}`,
    };
    const clientRequestBody = {
      type: "tokenization",
      holderReference: "customer123",
    };

    // Here i make request to client init and store response data
    const clientResponse = await axios.post(clientInitUrl, clientRequestBody, {
      headers: clientHeaders,
    });

    // Data that i receive is encoded and needs to be decoded
    const base64Data = clientResponse.data.data;
    console.log(base64Data);
    // I decode base64 data and convert it to the string using utf-8
    const decodedData = Buffer.from(base64Data, "base64").toString("utf-8");
    // Finally i convert it to JSON so i can send it to my client
    const clientConfigurations = JSON.parse(decodedData);

    // Send it back to client
    res.json(clientConfigurations);
  } catch (error) {
    console.error("Error fetching client configurations:", error);
    res.status(500).json({ error: "Error fetching configurations" });
  }
});

// Route to act as a proxy for tokenization
app.post("/tokenize", async (req, res) => {
  try {
    // Here happens tokenization
    const url = "http://localhost:3001/public/payment/instruments/tokenize";
    const response = await axios.post(url, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Tokenization error:", error.message);
    res.status(500).json({ error: "An error occurred during tokenization" });
  }
});

// Start the server
app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});
