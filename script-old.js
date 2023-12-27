// Listen for form submission
document
  .getElementById("cardForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    try {
      console.log("Fetching configurations...");
      // Fetch configurations from the server (access token)
      const configResponse = await fetch(
        "http://localhost:3000/client-configurations"
      );

      if (!configResponse.ok) {
        throw new Error("Failed to fetch configurations");
      }

      console.log("Configurations fetched successfully.");
      // Extract configuration data from the response
      const configData = await configResponse.json();
      console.log("Config data:", configData);

      // Gather card data from the form and retrieved configuration
      const paymentData = {
        cardNumber: document.getElementById("cardNumber").value,
        expiryMonth: document.getElementById("expiryMonth").value,
        expiryYear: document.getElementById("expiryYear").value,
        securityCode: document.getElementById("securityCode").value,
        holderName: document.getElementById("holderName").value,
        holderReference: configData.holderReference,
      };
      console.log("Payment data:", paymentData);

      const publicKeyPEM = `
        -----BEGIN PUBLIC KEY-----
        MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxIEg4zC7vN6v6YhfoF0v
        j8ZYQKGLLlkLqk7dGadnEFaNnMYsdgyNpBF5va/Emn3sn+vIqmQ0pXUIHbW42lPM
        1CpjNj2iYFQwO9MctMYYZohCp9sUJIZAK/VjM6zciASmYLuM5OP0+EKgQL1JlIJV
        tgbzks68evWzB2Vs03TjLW/Lh3C7iU1sC2v8Vq1p9MF3OWb5Q5ieDE5j1tuFMu0s
        JCVB6hLDlqt9hV2gRZD01fQpufx9VSKQrBmWUCZrQD7p7sKcrW+nSeEV3zMRQQNR
        fcmg3R1seLo1g6q3d08cH2LmRcVpMMuMT1bXJKQT6CzmZ2hznn6aFKHwTTpI3IoY
        kQIDAQAB
        -----END PUBLIC KEY-----
      `;

      const token = configData.token;
      console.log("Public Key (PEM):", publicKeyPEM);
      console.log("Token:", token);

      // Function to encrypt payment data using JWE
      async function encryptPaymentData(publicKey, paymentData) {
        // Convert payment data to a JSON string
        const jsonData = JSON.stringify(paymentData);

        // Encrypt the payment data using JWE
        const encrypted = await jose.JWE.encrypt(jsonData, publicKey, {
          alg: "RSA-OAEP-256", // Key encryption algorithm
          enc: "A256CBC-HS512", // Content encryption algorithm
        });

        return encrypted; // Return the encrypted data
      }

      // Function to tokenize instrument with encrypted details
      async function tokenizeInstrument(encrypted) {
        const url = "http://localhost:3000/tokenize"; // Change the URL to your proxy endpoint

        const payload = {
          storeInstrument: true,
          holderReference: configData.holderReference,
          encryptedInstrumentDetails: encrypted,
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
          console.log("Tokenization data:", tokenizationData);
        } catch (error) {
          console.error("Tokenization error:", error);
        }
      }

      // Execute the tokenization process
      encryptPaymentData(publicKeyPEM, paymentData)
        .then((base64Encoded) => {
          console.log("Base64 Encoded:", base64Encoded);
          return tokenizeInstrument(base64Encoded);
        })
        .catch((error) => console.error(error));
    } catch (error) {
      console.error("Error:", error);
    }
  });
