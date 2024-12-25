const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const connect = require("./db/db");
connect();
const productRoutes = require("./routes/product.routes");
const cookieParser = require("cookie-parser");
const rabbitMq = require("./service/rabbit");

rabbitMq.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", productRoutes);

module.exports = app;