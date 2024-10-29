import mongoose from 'mongoose';

// Define the Agent Schema
const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  agencyName: {
    type: String,
    required: true,
  },
  licenseNumber: {
    type: String,
    required: true,
  },
});

// Create a model based on the schema
const Agent = mongoose.model('Agent', agentSchema);

export default Agent;
