const isValidProduct = (product) => {
  const validFields = ["name", "price", "description"];

  return Object.keys(product).every((key) => validFields.includes(key));
};

module.exports = isValidProduct;
