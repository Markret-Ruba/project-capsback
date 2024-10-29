import express from 'express';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Set up multer for handling image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append the file's extension to ensure unique filenames
  },
});

// Multer middleware for handling multiple file uploads (max 6 files)
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    // Only accept image files (png, jpg, jpeg)
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('File type not supported. Only images are allowed.'));
    }
  },
});

// Route to handle listing creation and image upload
router.post('/create', upload.array('images', 6), async (req, res) => {
  try {
    const { userId, name, description, address, type, bedrooms, bathrooms, regularPrice, discountPrice, sold, parking, furnished } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    if (!name || !description || !regularPrice || !address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find user by ID and ensure user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If no images are uploaded, return an error
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image is required.' });
    }

    // Ensure prices are numbers and discountPrice is lower than regularPrice
    if (isNaN(regularPrice) || isNaN(discountPrice)) {
      return res.status(400).json({ error: 'Prices must be valid numbers' });
    }
    if (Number(regularPrice) < Number(discountPrice)) {
      return res.status(400).json({ error: 'Discount price must be lower than regular price' });
    }

    // Handle image URLs (array of image URLs)
    const imageUrls = req.files.map((file) => file.filename); // Only include the filename


  console.log(userId)


    // Create a new listing object
    const newListing = new Listing({
      user: userId,
      email: user.email,    // Assuming userId is coming from front-end
      name,
      description,
      address,
      type,
      bedrooms,
      bathrooms,
      regularPrice: Number(regularPrice), // Convert to number
      discountPrice: Number(discountPrice), // Convert to number
      sold,
      parking,
      furnished,
      imageUrls,
    });

    // Save the new listing to the database
    await newListing.save();

    // Return the created listing as a response
    res.status(201).json({
      message: 'Listing created successfully',
      listing: newListing,
    });
  } catch (err) {
    console.error(err);

    // Check for multer-specific errors
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Failed to create listing' });
    }
  }
});

export default router;
