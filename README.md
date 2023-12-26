# Card Tokenization Application

This application implements a solution provided by Payrails - [Payrails Product Assessment](https://github.com/bochora3000/payrails-product-assessment).

## Challenge Goal

The goal of the challenge was to create an application for tokenizing cards via Payrails using Client-Side Encryption. It allows users to input card details and obtain a tokenized representation for secure transactions.

**Note:** This solution deviates from the challenge in the encryption part. In this implementation, encryption of card data occurs on the server-side (app.js) due to encountering blockers with JavaScript-based encryption. As a result, the encryption and tokenization processes are handled on the backend.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)

## Prerequisites

Payrails endpoints are being mocked locally for testing purposes. To test the solution, you'll need:

Mockcoon running locally. In order to achieve it follow instructions here -> https://github.com/bochora3000/payrails-product-assessment?tab=readme-ov-file#mockoon

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

- `CLIENT_ID`: Your client ID for authentication. (use whatever you wish from documentation of endpoint)
- `API_KEY`: Your API key for authorization. (use whatever you wish from documentation of endpoint)
- `X_IDEMPOTENCY_KEY`: Key for ensuring idempotent requests. (can be anything)
