const Product = require("../models/product.model");
const { subscribeToQueue, publishToQueue } = require("../service/rabbit");
const isValidProduct = require("../service/validator");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Id is required" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ message: "Data to update can not be empty" });
    }

    if (!isValidProduct(req.body)) {
      return res.status(400).json({ message: "Invalid product" });
    }

    const { name, price, description } = req.body;
    req.body.createdBy = req.user._id;

    if (!name || !price || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // console.log(req.user);
    // console.log(name, category);

    const existingProduct = await Product.findOne({
      name: name,
    });

    if (existingProduct) {
      return res.status(400).json({ message: "Product already exists" });
    }

    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ message: "Data to update can not be empty" });
    }

    if (!isValidProduct(req.body)) {
      return res.status(400).json({ message: "Invalid product" });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const buyProduct = async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ message: "Data to update can not be empty" });
    }

    if (!req.body.ids) {
      return res.status(400).json({ message: "Product ids are required" });
    }

    if (!Object.keys(req.body).every((key) => ["ids"].includes(key))) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const { ids } = req.body;
    const products = await Product.find({ _id: { $in: ids } });

    publishToQueue("order", {
      event: "order.created",
      userEmail: req.user.email,
      data: products,
    });

    setTimeout(() => {
      subscribeToQueue("products", (data) => {
        // console.log("Received message", data);

        switch (data.event) {
          case "order.success":
            res.status(201).json({
              message: "Order placed",
              data: {
                orderId: data.data.orderId,
                products: data.data.products,
                totalPrice: data.data.totalPrice,
              },
            });
            break;
          default:
            break;
        }
      });
    }, 2000); // long polling
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProducts,
  buyProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
