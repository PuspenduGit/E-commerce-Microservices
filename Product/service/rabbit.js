const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBIT_URL;

let connection, channel;

async function connect() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    console.log("Connected to RabbitMQ");

    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err);
    });

    connection.on("close", () => {
      console.error("RabbitMQ connection closed. Reconnecting...");
      setTimeout(connect, 5000); // Retry connection
    });

    channel = await connection.createChannel();

    channel.on("error", (err) => {
      console.error("RabbitMQ channel error:", err);
    });
  } catch (err) {
    console.error("Error connecting to RabbitMQ:", err);
    setTimeout(connect, 5000); // Retry connection
  }
}

async function subscribeToQueue(queueName, callback) {
  try {
    if (!channel) await connect();
    await channel.assertQueue(queueName);
    channel.consume(queueName, (message) => {
      if (message) {
        callback(JSON.parse(message.content.toString()));
        channel.ack(message);
      }
    });
  } catch (err) {
    console.error("Error subscribing to queue:", err);
  }
}

async function publishToQueue(queueName, data) {
  try {
    if (!channel) await connect();
    await channel.assertQueue(queueName);
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
  } catch (err) {
    console.error("Error publishing to queue:", err);
  }
}

module.exports = {
  subscribeToQueue,
  publishToQueue,
  connect,
};
