import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './server/routes/auth.js';
import agentAuthRoutes from './server/routes/agentAuth.js';
import listingRoutes from './server/routes/listing.js';
import Listing from './server/models/Listing.js';
import connectDB from './server/config/db.js';
import multer from 'multer'; // Import multer

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Append timestamp to filename
  }
});

const upload = multer({ storage: storage });

// Define listing routes
const router = express.Router();

// Get listings by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const listings = await Listing.find({ user: req.params.userId });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single listing by ID
router.get('/view/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update property by ID
router.put('/update/:id', async (req, res) => {
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedListing) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(updatedListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Update images by ID
router.put('/update/images/:id', upload.array('images'), async (req, res) => {
  const imagesToDelete = JSON.parse(req.body.imagesToDelete); // Parse JSON
  const uploadedImages = req.files;

  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Remove images to delete
    if (imagesToDelete && Array.isArray(imagesToDelete)) {
      listing.imageUrls = listing.imageUrls.filter(url => {
        const filename = url.split('/').pop(); // Get the filename
        return !imagesToDelete.includes(filename); // Keep if not in delete list
      });
    }

    // Add new images to the listing's imageUrls
    if (uploadedImages && uploadedImages.length > 0) {
      const newImageUrls = uploadedImages.map(image => `${image.filename}`);
      listing.imageUrls.push(...newImageUrls);
    }

    await listing.save();
    res.json(listing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});





router.delete('/delete/:id', async (req, res) => {
  try {
    const listingId = req.params.id;

    // Find the listing by ID and delete it
    const result = await Listing.findByIdAndDelete(listingId);

    // If no listing found, send a 404 response
    if (!result) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Successfully deleted
    res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting listing' });
  }
});



router.get('/get', async (req, res) => {
  try {
    const { searchTerm, type, parking, furnished, unsold, sort, order, startIndex } = req.query;


     const sold=unsold;
    // Build the query object
    const query = {
      ...(searchTerm && { name: new RegExp(searchTerm, 'i') }),
      ...(type && type !== 'all' && { type }),
      ...(parking === 'true' && { parking: true }),
      ...(furnished === 'true' && { furnished: true }),
      ...(sold === 'true' && { sold: false }),
    };

    // Build the sort object
    let sortObj = {};
    if (sort && order) {
      // Convert string "desc" to -1 and "asc" to 1
      const sortValue = order === 'desc' ? -1 : 1;
      sortObj[sort] = sortValue;
    } else {
      // Default sort by createdAt in descending order
      sortObj = { createdAt: -1 };
    }

    // Fetch listings with proper sorting
    const listings = await Listing
      .find(query)
      .sort(sortObj)
      .skip(Number(startIndex) || 0)
      .limit(8);

    res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




// Use the router in the app
app.use('/listings', router);

// Use the user authentication routes
app.use('/api/auth', authRoutes);

// Use the agent authentication routes
app.use('/api/agentAuth', agentAuthRoutes);

// Static file server for uploaded images
app.use('/uploads', express.static('uploads'));


app.use('/listingsnew', listingRoutes);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
