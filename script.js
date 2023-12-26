// Listen for form submission
document
  .getElementById("cardForm")

  .addEventListener("submit", async function (event) {
    // Prevent default form submission behavior

    event.preventDefault();

    try {
      // Fetch configurations from the server
      const configResponse = await fetch(
        "http://localhost:3000/client-configurations"
      );

      // Check if configuration response is successful
      if (!configResponse.ok) {
        throw new Error("Failed to fetch configurations");
      }

      // Extract configuration data from the response
      const configData = await configResponse.json();

      // Gather card data from the form and retrieved configuration
      const cardData = {
        cardNumber: document.getElementById("cardNumber").value,
        expiryMonth: document.getElementById("expiryMonth").value,
        expiryYear: document.getElementById("expiryYear").value,
        securityCode: document.getElementById("securityCode").value,
        holderName: document.getElementById("holderName").value,
        holderReference: configData.holderReference,
      };

      // Retrieve the public key for tokenization
      const publicKey = configData.tokenization.publicKey;
      const token = configData.token;

      // Function to parse the public key and convert it to CryptoKey
      async function parsePublicKey(publicKey) {
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
      }

      // Function to encrypt payment data with a public key
      async function encryptPaymentData(publicKey) {
        try {
          // Convert payment data to a JSON string
          const jsonData = JSON.stringify(cardData);

          // Encrypt the payment data using the public key
          const encryptedArrayBuffer = await crypto.subtle.encrypt(
            {
              name: "RSA-OAEP",
            },
            publicKey,
            new TextEncoder().encode(jsonData)
          );

          // Encode the encrypted data as base64
          const encryptedBytes = new Uint8Array(encryptedArrayBuffer);
          const base64Encoded = btoa(String.fromCharCode(...encryptedBytes));

          return base64Encoded;
        } catch (error) {
          console.error(error);
        }
      }

      // Function to tokenize instrument with encrypted details
      async function tokenizeInstrument(base64Encoded) {
        const url = "http://localhost:3000/tokenize"; // Change the URL to your proxy endpoint

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

        try {
          const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload),
          });

          // Extract tokenization data from the response
          const tokenizationData = await response.json();

          // Create HTML content with tokenization response data
          const tokenizationResponseHtml = `
            <p>ID: ${tokenizationData.id}</p>
            <p>Created At: ${tokenizationData.createdAt}</p>
            <p>Updated At: ${tokenizationData.updatedAt}</p>
            <p>Holder ID: ${tokenizationData.holderId}</p>
            <p>Status: ${tokenizationData.status}</p>
          `;

          // Update the HTML container with tokenization response
          const responseContainer = document.getElementById(
            "tokenizationResponse"
          );
          responseContainer.innerHTML = tokenizationResponseHtml;

          // Log the tokenization response
          console.log(tokenizationData);
        } catch (error) {
          console.error("Tokenization error:", error);
        }
      }

      // Execute the tokenization process
      parsePublicKey(publicKey)
        .then((parsedKey) => encryptPaymentData(parsedKey))
        .then((base64Encoded) => tokenizeInstrument(base64Encoded))
        .catch((error) => console.error(error));
    } catch (error) {
      console.error("Error:", error);
    }
  });
