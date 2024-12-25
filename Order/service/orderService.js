const Order = require("../models/order.model");
const rabbitMq = require("./rabbit");
const uuid = require("uuid");

const setupOrderService = () => {
  setTimeout(async () => {
    await rabbitMq.subscribeToQueue("order", async (data) => {
      //   console.log("Received message", data);
      //   const { event, userEmail } = data;
      const products = data.data;
      //   console.log("event", event);
      //   console.log("products", products);
      //   console.log("userEmail", userEmail);
      const newOrderId = uuid.v4();

      const newOrder = new Order({
        orderId: newOrderId,
        products,
        totalPrice: products.reduce((acc, product) => acc + product.price, 0),
      });

      await newOrder.save();

      await rabbitMq.publishToQueue("products", {
        event: "order.success",
        data: {
          orderId: newOrderId,
          products,
        },
      });
    });
  }, 5000); // delay to wait for rabbitmq connection
};

module.exports = setupOrderService;
