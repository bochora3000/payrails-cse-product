# Card Tokenization Application

This application implements a solution provided by Payrails - [Payrails Product Assessment](https://github.com/bochora3000/payrails-product-assessment).

## Challenge Goal

The goal of the challenge was to create an application for tokenizing cards via Payrails using Client-Side Encryption.

## Solution

Access token retrievela and client initialization are happening on server side (app.js)
Encryption is happening on client side (scrip.jt)
Finally tokenization is happening via proxy enpoint on app.js server side.
Client processes tokenization response and updates DOM for demonstration purposes.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)

## Prerequisites

To test the solution, you'll need:

- **Mockcoon** running locally. Refer to the [instructions here](https://github.com/bochora3000/payrails-product-assessment?tab=readme-ov-file#mockoon) to set it up.

## Installation

1. Clone this repository.
2. Install dependencies by running `npm install`.
3. Create a `.env` file and provide necessary environment variables (e.g., `CLIENT_ID`, `API_KEY`, `X_IDEMPOTENCY_KEY`).
4. Start the server with `npm start`.

## Usage

1. Open `index.html` in a web browser.
2. Fill in the payment information (card number, expiry, CVV, holder's name).
3. Click on "Tokenize Card" to initiate the tokenization process.
4. View the tokenization response displayed on the web page.

## API Endpoints

### GET `/client-configurations`

- **Purpose:** Fetches client configurations including access tokens and client settings.
- **Method:** GET
- **Endpoint:** `http://localhost:3000/client-configurations`
- **Response:** JSON object containing client configurations.

### POST `/tokenize`

- **Purpose:** Tokenizes card information received from the client.
- **Method:** POST
- **Endpoint:** `http://localhost:3000/tokenize`
- **Request Payload:** JSON object containing card data and public key.
- **Response:** JSON object with tokenized card details.

## Configuration

Ensure you have the following environment variables set in the `.env` file:

- `CLIENT_ID`: Your client ID for authentication (use whatever is required from the documentation of the endpoint).
- `API_KEY`: Your API key for authorization (use whatever is required from the documentation of the endpoint).
- `X_IDEMPOTENCY_KEY`: Key for ensuring idempotent requests (can be anything).
