import mongoose from "mongoose";

// Define the Listing Schema
const listingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, minlength: 3, maxlength: 62 }, // Refers to the user who created the listing
    email: { type: String, required: true, minlength: 3, maxlength: 62 },
    description: { type: String, required: true },
    address: { type: String, required: true },
    type: { type: String, enum: ['sale', 'rent'], required: true },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    regularPrice: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },
    sold: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    furnished: { type: Boolean, default: false },
    imageUrls: [{ type: String, required: true }] // Array of image URLs
  },
  { timestamps: true }
);

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;  // Correct ES module export
