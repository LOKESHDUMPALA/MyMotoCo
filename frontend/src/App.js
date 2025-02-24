import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [file, setFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [skuCodes, setSkuCodes] = useState(""); // State for SKU codes input
  const [showDeleteInput, setShowDeleteInput] = useState(false); // Toggle input visibility

  // Handle File Selection
  const handleFileChange = (e) => setFile(e.target.files[0]);

  // Upload CSV/Excel File
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV or Excel file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const successMessage = response.data.message;
      // Extract errors and format them with line breaks
      const errors = response.data.errors.length > 0 ? response.data.errors.join("\n") : "";
  
      // Show toast notification with proper formatting
      toast.success(
        <>
          <div>{successMessage}</div>
          {errors && (
            <div className="mt-2">
              <strong>Errors:</strong>
              <pre className="whitespace-pre-wrap">{errors}</pre>
            </div>
          )}
        </>
      );
    } catch (error) {
      toast.error("File upload failed!");
    }
  };

  // Download Sample CSV
  const handleDownloadCSV = () => {
    window.open("http://localhost:5000/download-sample", "_blank");
    toast.success("Downloading sample CSV...");
  };

  // Toggle Delete Input Field
  const toggleDeleteInput = () => setShowDeleteInput(!showDeleteInput);
 
  // Delete Specific Products by SKU
  const handleDeleteSelected = async () => {
    const skuArray = skuCodes.split(",").map((sku) => sku.trim()); // Convert input to array

    if (skuArray.length === 0 || !skuArray[0]) {
      toast.error("Please enter SKU codes to delete.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/delete-products", { skuCodes: skuArray });
      toast.success(response.data.message);
      setProducts(products.filter((p) => !skuArray.includes(p.SKU_Code))); // Update UI
    } catch (error) {
      toast.error("Error deleting products.");
    }
  };

  // Fetch All Products
  const handleGetAllProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/products");
      setProducts(response.data);
      toast.success("Fetched all products successfully.");
    } catch (error) {
      toast.error("Error fetching products.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Product Management</h1>

   
<div className="flex flex-wrap gap-4 justify-center items-center w-full mt-4">
 
  <div className="bg-white p-4 rounded-md shadow-md flex flex-col items-center w-80">
    <h3 className="text-lg font-semibold mb-2 text-gray-700">Upload Product File</h3>

    <label className="bg-blue-500 text-white px-6 py-3 rounded-md cursor-pointer hover:bg-blue-600 w-full text-center">
      Select CSV/Excel
      <input type="file" accept=".csv, .xlsx" onChange={handleFileChange} className="hidden" />
    </label>

    <button onClick={handleUpload} className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 w-full mt-3">
      Submit File
    </button>
  </div>

  <button onClick={handleDownloadCSV} className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 w-56">
    Download Sample CSV
  </button>

  <button onClick={toggleDeleteInput} className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 w-56">
    Delete Specific Products
  </button>

  <button onClick={handleGetAllProducts} className="bg-yellow-500 text-white px-6 py-3 rounded-md hover:bg-yellow-600 w-56">
    Get All Products
  </button>
</div>


      {/* Delete Input Field */}
      {showDeleteInput && (
        <div className="mt-4 flex flex-col items-center">
          <input
            type="text"
            placeholder="Enter SKU Codes (comma-separated)"
            value={skuCodes}
            onChange={(e) => setSkuCodes(e.target.value)}
            className="border p-2 rounded-md w-96"
          />
          <button onClick={handleDeleteSelected} className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 mt-2">
            Confirm Delete
          </button>
        </div>
      )}

      {/* Products Table */}
      {products.length > 0 && (
        <div className="bg-white shadow-md p-6 rounded-lg w-full max-w-4xl mt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Product List</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">SKU Code</th>
                <th className="border border-gray-300 p-2">Name</th>
                <th className="border border-gray-300 p-2">Description</th>
                <th className="border border-gray-300 p-2">Price</th>
                <th className="border border-gray-300 p-2">HSN Code</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="text-center">
                  <td className="border border-gray-300 p-2">{product.SKU_Code}</td>
                  <td className="border border-gray-300 p-2">{product.Product_Name}</td>
                  <td className="border border-gray-300 p-2">{product.Product_Description}</td>
                  <td className="border border-gray-300 p-2">{product.Price}</td>
                  <td className="border border-gray-300 p-2">{product.HSN_Code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
