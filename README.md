# Card Tokenization Application

This application implements a solution provided by Payrails - [Payrails Product Assessment](https://github.com/bochora3000/payrails-product-assessment).

## Challenge Goal

The goal of the challenge was to create an application for tokenizing cards via Payrails using Client-Side Encryption.

## Solution

Access token retrieval and client initialization happen on the server-side (`app.js`). Encryption occurs on the client-side (`script.js`). Finally, tokenization occurs via a proxy endpoint on `app.js` server-side. The client processes the tokenization response and updates the DOM for demonstration purposes.

**Note #1: Encryption Approach**

In the challenge requirement, the specified encryption involved a PKCS8 RSA public key in `PEM` format without headers and line breaks, using RSA-OAEP-256 and A256CBC-HS512 for content encryption. However, this solution deviates from the requirement by implementing encryption using `CryptoKey`. The `script.js` code converts the publicKey to `CryptoKey` and utilizes the `crypto.subtle` library to encrypt payment data with the public key using RSA-OAEP algorithm. Finally, the data is encoded as a base64Encoded string before being sent for tokenization.

**Note #2: CORS Issue Resolution**

There were issues encountered with CORS settings between the Mockoon server and the client. Instead of making a direct POST to Mockoon, the application utilizes `app.js` as a proxy server to facilitate communication and resolve the CORS problem.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Notes](#notes)

## Prerequisites

To test the solution, you'll need:

- **Mockoon** running locally. Refer to the [instructions here](https://github.com/bochora3000/payrails-product-assessment?tab=readme-ov-file#mockoon) to set it up.

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

- **Purpose:** Fetches client configurations, including access tokens and client settings.
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

## Notes
