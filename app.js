const express = require("express");
const mqtt = require("mqtt");
const fs = require("fs");
const path = require("path");

const app = express();

// Load CA certificate
const caFile = fs.readFileSync(path.join(__dirname, "./certs/emqxsl-ca.crt"));

// MQTT connection options with TLS
const options = {
  host: "ce2516b1.ala.asia-southeast1.emqxsl.com",
  port: 8883,
  protocol: "mqtts",
  ca: caFile,
  username: "nola",
  password: "mqtt",
};

// Store the latest message received from MQTT
let latestMessage = "Waiting for data...";

// Connect to MQTT broker with TLS
const mqttClient = mqtt.connect(options);

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker over TLS");
  mqttClient.subscribe("test/topic", (err) => {
    if (!err) {
      console.log("Subscribed to test/topic");
    }
  });
});

mqttClient.on("message", (topic, message) => {
  latestMessage = message.toString();
  console.log(`Received message on ${topic}: ${latestMessage}`);
});

// Serve static HTML file
// app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

// API endpoint to get the latest message
app.get("/latest-message", (req, res) => {
  res.json({ message: latestMessage });
});

// API endpoint to publish messages
app.get("/publish", (req, res) => {
  const message = req.query.message || "Hello MQTT over TLS";
  mqttClient.publish("test/topic", message, () => {
    res.send(`Message "${message}" published to test/topic`);
  });
});

// Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
