const Product = require("../models/Products");
const csvParser = require("csv-parser");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

// **Upload & Process CSV/Excel**
exports.uploadFile = async (req, res) => {
  try {
    const filePath = req.file.path;
    let products = [];

    if (req.file.mimetype === "text/csv") {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => products.push(row))
        .on("end", () => processProducts(products, res));
    } else if (req.file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      products = xlsx.utils.sheet_to_json(sheet);
      processProducts(products, res);
    } else {
      return res.status(400).json({ message: "Invalid file format" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// **Process Products**
async function processProducts(products, res) {
  let errors = [];
  let successCount = 0;

  for (let i = 0; i < products.length; i++) {
    const row = products[i];

    const SKU_Code = row["SKU Code"]?.trim();
    const Product_Name = row["Product Name"]?.trim();
    const Product_Description = row["Product Description"]?.trim();
    const Price = row["Price"]?.replace(/,/g, "").trim();
    const HSN_Code = row["HSN Code"]?.trim();

    if (!SKU_Code || !Product_Name || !Product_Description || !Price || !HSN_Code) {
      errors.push(`Row ${i + 2}: Missing required fields`);
      continue;
    }

    if (isNaN(Price)) {
      errors.push(`Row ${i + 2}: Price must be a number`);
      continue;
    }

    const existingProduct = await Product.findOne({ SKU_Code });
    if (existingProduct) {
      errors.push(`Row ${i + 2}: SKU Code Product already exists`);
      continue;
    }

    await Product.create({ SKU_Code, Product_Name, Product_Description, Price: parseFloat(Price), HSN_Code });
    successCount++;
  }

  res.json({ message: `${successCount} products uploaded successfully`, errors });
}

// **Fetch All Products**
exports.getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

// **Delete Specific Products by SKU**
exports.deleteProducts = async (req, res) => {
  const { skuCodes } = req.body;
  if (!skuCodes || skuCodes.length === 0) {
    return res.status(400).json({ message: "Please provide SKU codes to delete" });
  }

  try {
    const result = await Product.deleteMany({ SKU_Code: { $in: skuCodes } });
    res.json({ message: `${result.deletedCount} products deleted successfully.` });
  } catch (error) {
    res.status(500).json({ message: "Error deleting products", error });
  }
};

// **Download Sample CSV**
exports.downloadSample = async (req, res) => {
    try {
      // Fetch products from the database
      const products = await Product.find();
  
      // Define header row
      const header = ["SKU Code", "Product Name", "Product Description", "Price", "HSN Code"];
  
      // Map each product to an array of values in the correct order
      const rows = products.map(prod => [
        prod.SKU_Code,
        prod.Product_Name,
        prod.Product_Description,
        prod.Price,
        prod.HSN_Code
      ]);
    
      // Combine header and rows into a single CSV string
      const csvData = [header, ...rows]
        .map(row => row.join(","))
        .join("\n");
  
      // Define the file path for the generated CSV file
      const csvFilePath = path.join(__dirname, "../uploads", "sample.csv");
  
      // Write CSV data to file
      fs.writeFileSync(csvFilePath, csvData);
  
      // Send file as a downloadable response
      res.download(csvFilePath, "sample.csv", (err) => {
        if (err) {
          return res.status(500).json({ message: "Error downloading file", error: err });
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Error generating CSV", error });
    }
  };
