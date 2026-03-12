// import express from 'express';
/* import { addProduct, listProduct, removeProduct } from '../controllers/productController'; */
/* import {} from '../controllers/productController'; */
// import multer from 'multer';
/* import { addProduct, listProduct, removeProduct } from '../controllers/productController'; */

const express = require('express');
const multer = require('multer');
const { addProduct, listProduct, removeProduct, bulkAddProduct, updateStock, updatePrice, updateProduct } = require('../controllers/productController');
const productRouter = express.Router();

//Image Storage Engine (Saving Image to uploads folder & rename it)

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.VERCEL ? '/tmp' : 'uploads');
    },
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
})

const upload = multer({ storage: storage })

productRouter.get("/list", listProduct);
productRouter.post("/add", upload.array('image', 4), addProduct); // Allow up to 4 images (1 main + 3 extra)
productRouter.post("/bulk-add", upload.single('file'), bulkAddProduct);
productRouter.post("/remove", removeProduct);
productRouter.post("/update-stock", updateStock);
productRouter.post("/update-price", updatePrice);
productRouter.post("/update", upload.array('image', 4), updateProduct);

// export default productRouter;

module.exports = productRouter;