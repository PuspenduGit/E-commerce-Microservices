const express = require("express");
const router = express.Router();
const userAuth = require("../middleware/authMiddleWare");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  buyProduct,
} = require("../controllers/product.controller");

router.get("/get", userAuth, getProducts);
router.post("/buy", userAuth, buyProduct);
router.get("/get/:id", userAuth, getProductById);
router.post("/create", userAuth, createProduct);
router.put("/update/:id", userAuth, updateProduct);
router.delete("/delete/:id", userAuth, deleteProduct);

module.exports = router;
