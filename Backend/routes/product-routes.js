const express = require("express");
const multer = require("multer");
const { uploadFile, getProducts, deleteProducts, downloadSample } = require("../controllers/product-controller");

const router = express.Router();
 
// Multer Storage Config
const uploadDir = "./uploads";
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// Routes
router.post("/upload", upload.single("file"), uploadFile);
router.get("/products", getProducts);
router.post("/delete-products", deleteProducts);
router.get("/download-sample", downloadSample);

module.exports = router;
