const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });

/**
 * GET all secondChanceItems
 */
router.get('/', async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('secondChanceItems');
    const secondChanceItems = await collection.find({}).toArray();
    res.json(secondChanceItems);
  } catch (e) {
    logger.error('Error fetching items', e);
    next(e);
  }
});

/**
 * POST a new secondChanceItem
 */
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('secondChanceItems');

    let secondChanceItem = req.body;

    // Auto-increment ID
    const lastItemQuery = await collection.find().sort({ id: -1 }).limit(1);
    await lastItemQuery.forEach(item => {
      secondChanceItem.id = (parseInt(item.id) + 1).toString();
    });
    if (!secondChanceItem.id) {
      secondChanceItem.id = "1";
    }

    // Add date_added timestamp
    secondChanceItem.date_added = Math.floor(new Date().getTime() / 1000);

    // Attach image path if uploaded
    if (req.file) {
      secondChanceItem.image = `/images/${req.file.originalname}`;
    }

    const result = await collection.insertOne(secondChanceItem);
    res.status(201).json(result.ops[0]);
  } catch (e) {
    logger.error('Error adding new item', e);
    next(e);
  }
});

/**
 * GET a single secondChanceItem by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('secondChanceItems');

    const id = req.params.id;
    const secondChanceItem = await collection.findOne({ id });
    if (!secondChanceItem) {
      logger.error('secondChanceItem not found');
      return res.status(404).json({ error: 'secondChanceItem not found' });
    }
    res.json(secondChanceItem);
  } catch (e) {
    next(e);
  }
});

/**
 * PUT - Update an existing secondChanceItem
 */
router.put('/:id', async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('secondChanceItems');

    const id = req.params.id;
    const secondChanceItem = await collection.findOne({ id });
    if (!secondChanceItem) {
      logger.error('secondChanceItem not found');
      return res.status(404).json({ error: 'secondChanceItem not found' });
    }

    // Update fields
    secondChanceItem.category = req.body.category;
    secondChanceItem.condition = req.body.condition;
    secondChanceItem.age_days = req.body.age_days;
    secondChanceItem.description = req.body.description;
    secondChanceItem.age_years = Number((secondChanceItem.age_days / 365).toFixed(1));
    secondChanceItem.updatedAt = new Date();

    const updatedItem = await collection.findOneAndUpdate(
      { id },
      { $set: secondChanceItem },
      { returnDocument: 'after' }
    );

    if (updatedItem.value) {
      res.json({ uploaded: 'success' });
    } else {
      res.json({ uploaded: 'failed' });
    }
  } catch (e) {
    next(e);
  }
});

/**
 * DELETE - Remove a specific secondChanceItem
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('secondChanceItems');

    const id = req.params.id;
    const secondChanceItem = await collection.findOne({ id });
    if (!secondChanceItem) {
      logger.error('secondChanceItem not found');
      return res.status(404).json({ error: 'secondChanceItem not found' });
    }

    await collection.deleteOne({ id });
    res.json({ deleted: 'success' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
