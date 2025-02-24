const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  SKU_Code: { type: String, unique: true, required: true },
  Product_Name: { type: String, required: true },
  Product_Description: { type: String, required: true },
  Price: { type: Number, required: true },
  HSN_Code: { type: String, required: true },
});

module.exports = mongoose.model("Product", ProductSchema);
