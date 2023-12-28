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
    // Decode publickey to binary string
    const binaryDerString = atob(publicKey);
    // Create unitarray length of binary string
    const binaryDer = new Uint8Array(binaryDerString.length);

    // convert binary string into sequence of bytes
    for (let i = 0; i < binaryDerString.length; ++i) {
      binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    // import binary data into cryptokey, spki is key format and specifies parameters algo, hash and the usage of the key
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

    // returns CryptoKey
    return publicKeyCryptoKey;
  } catch (error) {
    console.error("Public key parsing error:", error);
    throw error;
  }
}

// Function to encrypt payment data with a public key using JWE
async function encryptPaymentData(publicKeyCryptoKey, cardData) {
  try {
    // Payment data as string
    const jsonData = JSON.stringify(cardData);
    // Encode json string to byte sequence
    const encodedData = new TextEncoder().encode(jsonData);
    // Performing encryption with RSA-OAEP algo, public key and encodedData
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKeyCryptoKey,
      encodedData
    );

    // Convert encrypted data which is ArrayBuffer to Base64 string directly here. Return results.
    return btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
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
    // I'm fetching tokenization data via url and correct parameters
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });
    const tokenizationData = await response.json();

    // Display tokenization response directly within the function. this html will be inserted into DOM.
    const tokenizationResponseHtml = `
      <p>ID: ${tokenizationData.id}</p>
      <p>Created At: ${tokenizationData.createdAt}</p>
      <p>Updated At: ${tokenizationData.updatedAt}</p>
      <p>Holder ID: ${tokenizationData.holderId}</p>
      <p>Status: ${tokenizationData.status}</p>
    `;
    // Insert reponse into HTML
    const responseContainer = document.getElementById("tokenizationResponse");
    responseContainer.innerHTML = tokenizationResponseHtml;

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

      // Gather card data directly within the submission function
      const cardData = {
        cardNumber: document.getElementById("cardNumber").value,
        expiryMonth: document.getElementById("expiryMonth").value,
        expiryYear: document.getElementById("expiryYear").value,
        securityCode: document.getElementById("securityCode").value,
        holderName: document.getElementById("holderName").value,
        holderReference: configData.holderReference,
      };

      // Prepare publicKey for encryption - store it in parsedKey
      const parsedKey = await parsePublicKey(configData.tokenization.publicKey);
      // Encryption of payment data with public key - store results in base64econded
      const base64Encoded = await encryptPaymentData(parsedKey, cardData);
      // After we have encrypted data ready, we can tokenize an instrument. Passing encoded data, configdata - to pass holderreference and token
      await tokenizeInstrument(base64Encoded, configData, configData.token);
    } catch (error) {
      console.error("Submission error:", error);
    }
  });
