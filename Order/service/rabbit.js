const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBIT_URL;

let connection, channel;

async function connect() {
  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  console.log("Connected to RabbitMQ");
}

async function subscribeToQueue(queueName, callback) {
  if (!channel) await connect();
  await channel.assertQueue(queueName);
  channel.consume(queueName, (message) => {
    // console.log(`Received message ${message.content}`);
    callback(JSON.parse(message.content.toString()));
    channel.ack(message);
  });
}

async function publishToQueue(queueName, data) {
  if (!channel) await connect();
  await channel.assertQueue(queueName);
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
}

module.exports = {
  subscribeToQueue,
  publishToQueue,
  connect,
};
