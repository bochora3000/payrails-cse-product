// Function to fetch configurations from the server
async function fetchConfigurations() {
  try {
    const configResponse = await fetch(
      "http://localhost:3000/client-configurations"
    );

    if (!configResponse.ok) {
      throw new Error("Failed to fetch configurations");
    }

    return await configResponse.json();
  } catch (error) {
    console.error("Configuration fetch error:", error);
    throw error;
  }
}

// Function to parse the public key and convert it to CryptoKey
async function parsePublicKey(publicKey) {
  try {
    const binaryDerString = atob(publicKey);
    const binaryDer = new Uint8Array(binaryDerString.length);

    for (let i = 0; i < binaryDerString.length; ++i) {
      binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    const publicKeyCryptoKey = await crypto.subtle.importKey(
      "spki",
      binaryDer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["encrypt"]
    );

    return publicKeyCryptoKey;
  } catch (error) {
    console.error("Public key parsing error:", error);
    throw error;
  }
}

// Function to encrypt payment data with a public key using JWE
async function encryptPaymentData(publicKeyCryptoKey, cardData) {
  try {
    const jsonData = JSON.stringify(cardData);
    const encodedData = new TextEncoder().encode(jsonData);
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKeyCryptoKey,
      encodedData
    );

    return arrayBufferToBase64(encryptedData);
  } catch (error) {
    console.error("Encryption error:", error);
    throw error;
  }
}

// Function to tokenize instrument with encrypted details
async function tokenizeInstrument(base64Encoded, configData, token) {
  try {
    const url = "http://localhost:3000/tokenize";
    const payload = {
      storeInstrument: true,
      holderReference: configData.holderReference,
      encryptedInstrumentDetails: base64Encoded,
      futureUsage: "CardOnFile",
    };
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });
    const tokenizationData = await response.json();
    displayTokenizationResponse(tokenizationData);
    console.log(tokenizationData);
  } catch (error) {
    console.error("Tokenization error:", error);
    throw error;
  }
}

// Listen for form submission
document
  .getElementById("cardForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    try {
      const configData = await fetchConfigurations();
      const cardData = gatherCardData(configData);
      const parsedKey = await parsePublicKey(configData.tokenization.publicKey);
      const base64Encoded = await encryptPaymentData(parsedKey, cardData);
      await tokenizeInstrument(base64Encoded, configData, configData.token);
    } catch (error) {
      console.error("Submission error:", error);
    }
  });

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(arrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
}

// Function to gather card data for submission
function gatherCardData(configData) {
  return {
    cardNumber: document.getElementById("cardNumber").value,
    expiryMonth: document.getElementById("expiryMonth").value,
    expiryYear: document.getElementById("expiryYear").value,
    securityCode: document.getElementById("securityCode").value,
    holderName: document.getElementById("holderName").value,
    holderReference: configData.holderReference,
  };
}

// Function to display tokenization response
function displayTokenizationResponse(tokenizationData) {
  const tokenizationResponseHtml = `
    <p>ID: ${tokenizationData.id}</p>
    <p>Created At: ${tokenizationData.createdAt}</p>
    <p>Updated At: ${tokenizationData.updatedAt}</p>
    <p>Holder ID: ${tokenizationData.holderId}</p>
    <p>Status: ${tokenizationData.status}</p>
  `;
  const responseContainer = document.getElementById("tokenizationResponse");
  responseContainer.innerHTML = tokenizationResponseHtml;
}
