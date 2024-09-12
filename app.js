const express = require("express");
const mqtt = require("mqtt");
const fs = require("fs");
const path = require("path");

const app = express();

// Load CA certificate
const caFile = fs.readFileSync(path.join(__dirname, "./certs/emqxsl-ca.crt"));

// MQTT connection options with TLS
const options = {
  host: "ce2516b1.ala.asia-southeast1.emqxsl.com", // Ganti dengan URL broker EMQX kamu
  port: 8883,
  protocol: "mqtts",
  ca: caFile,
  username: "nola",
  password: "mqtt",
};

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
  console.log(`Received message on ${topic}: ${message.toString()}`);
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
