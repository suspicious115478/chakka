const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const { GoogleAuth } = require('google-auth-library');

// Initialize Express
const app = express();
app.use(bodyParser.json());

// Path to your Firebase service account JSON file (now fetched from environment variable)
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

// Initialize Firebase Admin SDK with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Define the FCM API endpoint
app.post('/sendRingingNotification', async (req, res) => {
  try {
    const { fcmToken, callerId } = req.body;

    if (!fcmToken || !callerId) {
      return res.status(400).send('Missing fcmToken or callerId');
    }

    // Create the notification payload
    const message = {
      token: fcmToken,
      notification: {
        title: 'Incoming Call',
        body: `Call from device: ${callerId}`,
      },
      data: {
        type: 'incoming_call',
        callerId,
      },
    };

    // Send FCM message
    const response = await admin.messaging().send(message);
    console.log('FCM Message sent successfully:', response);
    return res.status(200).send('Notification sent');
  } catch (error) {
    console.error('Error sending FCM:', error);
    return res.status(500).send('Internal Server Error');
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
