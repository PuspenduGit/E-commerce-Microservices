const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const connect = require("./db/db");
const rabbitMq = require("./service/rabbit");
const setupOrderService = require("./service/orderService");

rabbitMq.connect();
connect();

setupOrderService();

module.exports = app;
