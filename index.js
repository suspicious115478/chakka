const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

// Initialize Express
const app = express();
app.use(bodyParser.json());

// Load Firebase service account from environment
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// POST endpoint to send FCM notification
app.post('/sendRingingNotification', async (req, res) => {
  try {
    const { fcmToken, callerId } = req.body;

    if (!fcmToken || !callerId) {
      return res.status(400).send('Missing fcmToken or callerId');
    }

    const message = {
      token: fcmToken,
      notification: {
        title: 'Incoming Call',
        body: 'You have a call',
      },
      data: {
        type: 'Incoming_call',
        callerId: callerId
      },
          android: {
      priority: "high"
    }
    };

    const response = await admin.messaging().send(message);
    console.log('FCM Message sent successfully:', response);
    return res.status(200).send('Notification sent');
  } catch (error) {
    console.error('Error sending FCM:', error);
    return res.status(500).send('Internal Server Error');
  }
});
// ✅ Add root GET route
app.get('/', (req, res) => {
  res.send('FCM Server is running');
});
// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
