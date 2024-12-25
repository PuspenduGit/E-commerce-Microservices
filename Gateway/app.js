const express = require("express");
const expressProxy = require("express-http-proxy");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use("/user", expressProxy(process.env.USER_SERVICE_URL));
app.use("/product", expressProxy(process.env.PRODUCT_SERVICE_URL));
app.use("/order", expressProxy(process.env.ORDER_SERVICE_URL));

app.listen(3000, () => {
  console.log("Gateway is running on port 3000");
});
