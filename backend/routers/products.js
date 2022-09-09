const mongoose = require('mongoose');

const express = require('express');
const multer = require('multer');
const Category = require('../models/category');
const router = express.Router();
const Product = require('../models/product');

const FILE_TYPE_MAP = {
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('Invalid image type');
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const extension = FILE_TYPE_MAP[file.mimetype];

    const fileName = file.fieldname.split(' ').join('-');

    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const upload = multer({storage: storage});

router.get('/', async (req, res) => {
  try {
    let filter = {};
    req.query.categories
      ? (filter = {category: req.query.categories.split(',')})
      : {};
    const products = await Product.find(filter).populate('category');
    if (!products) {
      return res.status(403).json({
        success: false,
      });
    }
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({message: error.message, error: error.stack, success: false});
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
      return res
        .status(500)
        .send('The product with the given ID was not found. ');
    }
    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({message: error.message, error: error.stack, success: false});
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).send('Invalid category');
    }
    if (!req.file) return res.status(400).send('No image in the request');

    const fileName = req.file.filename;
    basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}${fileName}`,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    });
    product = await product.save();
    if (!product) {
      return res.status(500).send('The product cannot be created ');
    }
    res.status(201).json(product);
  } catch (error) {
    res
      .status(500)
      .json({message: error.message, error: error.stack, success: false});
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send('Invalid product ID');
    }
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).send('Invalid category');
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send('Invalid product');

    let imagePath;

    if (req.file) {
      const fileName = req.file.filename;
      const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
      imagePath = `${basePath}${fileName}`;
    } else {
      imagePath = product.image;
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: imagePath,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      {new: true}
    );
    if (!updatedProduct) {
      return res.status(403).send('The product cannot be updated');
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res
      .status(500)
      .json({message: error.message, error: error.stack, success: false});
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndRemove(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({success: false, message: 'product not found!'});
    }
    res.status(200).json({success: true, message: 'the product is deleted'});
  } catch (error) {
    res
      .status(500)
      .json({message: error.message, error: error.stack, success: false});
  }
});

router.get('/get/count', async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    if (!productCount) {
      return res.status(404).json({success: false});
    }
    res.status(200).json({productCount});
  } catch (error) {
    res
      .status(500)
      .json({message: error.message, error: error.stack, success: false});
  }
});

router.get('/get/featured/:count', async (req, res) => {
  try {
    const count = req.params.count ? req.params.count : 0;
    const product = await Product.find({isFeatured: true}).limit(+count);
    if (!product) {
      return res.status(404).json({success: false});
    }
    res.status(200).json({product});
  } catch (error) {
    res
      .status(500)
      .json({message: error.message, error: error.stack, success: false});
  }
});

router.put(
  '/gallery-images/:id',
  upload.array('images', 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send('Invalid product ID');
    }
    const files = req.files;
    basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
    let imagesPath = [];
    if (files) {
      files.map((file) => {
        imagesPath.push(`${basePath}${file.filename}`);
      });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPath,
      },
      {new: true}
    );

    if (!product) {
      return res.status(403).send('The product cannot be updated');
    }
    res.status(200).json(product);
  }
);

module.exports = router;
