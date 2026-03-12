const productModel = require("../models/productModel");
const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');

const uploadsPath = process.env.VERCEL ? '/tmp' : 'uploads';

// all product list
const listProduct = async (req, res) => {
    try {
        const products = await productModel.find({})
        res.json({ success: true, data: products })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

// add Product
// add Product
const addProduct = async (req, res) => {
    try {
        let image_filename = `${req.files[0].filename}`;

        // Handle extra images (if any)
        let extra_images = [];
        if (req.files.length > 1) {
            extra_images = req.files.slice(1).map(file => file.filename);
        }

        const product = new productModel({
            name: req.body.name,
            description: req.body.description,
            price: Number(req.body.price),
            category: req.body.category,
            stock: Number(req.body.stock),
            tax: Number(req.body.tax) || 0,
            deliveryCharge: Number(req.body.deliveryCharge) || 0,
            image: image_filename,
            extraImages: extra_images
        })

        await product.save();
        res.json({ success: true, message: "Product Added" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// Bulk Add Products via Excel
const bulkAddProduct = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: "No file uploaded" });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let data = xlsx.utils.sheet_to_json(sheet);

        // Normalize keys and filter valid products
        const products = data.map(item => {
            const newItem = {};
            // Convert keys to lower case for easier access if mismatched
            Object.keys(item).forEach(key => {
                newItem[key.toLowerCase()] = item[key];
            });
            // Also keep original just in case, but prioritize our normalized keys below

            return {
                name: newItem['name'] || item['Name'],
                description: newItem['description'] || item['Description'],
                price: newItem['price'] || item['Price'],
                category: newItem['category'] || item['Category'],
                stock: newItem['stock'] || item['Stock'] || 0,
                image: newItem['image'] || item['Image'] || "default_product.png",
                extraImages: []
            };
        }).filter(p => p.name && p.price && p.category);

        if (products.length === 0) {
            return res.json({ success: false, message: "No valid products found check headers (Name, Price, Category)" });
        }

        await productModel.insertMany(products);

        // Cleanup uploaded excel file
        fs.unlink(req.file.path, () => { });

        res.json({ success: true, message: `${products.length} Products Added Successfully` });

    } catch (error) {
        console.log(error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlink(req.file.path, () => { });
        }
        res.json({ success: false, message: "Error processing file: " + error.message });
    }
}

// delete Product
const removeProduct = async (req, res) => {
    try {

        const product = await productModel.findById(req.body.id);
        fs.unlink(path.join(uploadsPath, product.image), () => { })

        await productModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Product Removed" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}
// update Product Stock
const updateStock = async (req, res) => {
    try {
        const { id, stock } = req.body;
        await productModel.findByIdAndUpdate(id, { stock: Number(stock) });
        res.json({ success: true, message: "Stock Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// update Product Price
const updatePrice = async (req, res) => {
    try {
        const { id, price } = req.body;
        await productModel.findByIdAndUpdate(id, { price: Number(price) });
        res.json({ success: true, message: "Price Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// update Product
const updateProduct = async (req, res) => {
    try {
        const { id, name, description, price, category, stock, tax, deliveryCharge } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        let updateData = {
            name,
            description,
            price: Number(price),
            category,
            stock: Number(stock),
            tax: Number(tax),
            deliveryCharge: Number(deliveryCharge)
        };

        if (req.files && req.files.length > 0) {
            // New images uploaded
            console.log("Detecting new images, cleaning up old ones...");
            const product = await productModel.findById(id);
            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }

            if (product.image) {
                const mainImagePath = path.join(uploadsPath, product.image);
                if (fs.existsSync(mainImagePath)) {
                    fs.unlink(mainImagePath, (err) => { if (err) console.log("Error unlinking main image:", err) });
                }
            }
            if (product.extraImages && Array.isArray(product.extraImages)) {
                product.extraImages.forEach(img => {
                    const extraPath = path.join(uploadsPath, img);
                    if (fs.existsSync(extraPath)) {
                        fs.unlink(extraPath, (err) => { if (err) console.log("Error unlinking extra image:", err) });
                    }
                });
            }

            updateData.image = req.files[0].filename;
            if (req.files.length > 1) {
                updateData.extraImages = req.files.slice(1).map(file => file.filename);
            } else {
                updateData.extraImages = [];
            }
        }

        const updatedProduct = await productModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found to update" });
        }

        res.json({ success: true, message: "Product Updated Successfully", data: updatedProduct });
    } catch (error) {
        console.error("Update Product Error Details:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
}

module.exports = {
    listProduct,
    addProduct,
    removeProduct,
    bulkAddProduct,
    updateStock,
    updatePrice,
    updateProduct
}
