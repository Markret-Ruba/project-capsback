import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Agent from '../models/agent.js';


// Register a new agent
export const registerAgent = async (req, res) => {
  const { name, email, password, agencyName, licenseNumber } = req.body;

  try {
    // Check if agent exists
    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({ message: 'Agent already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new agent
    const newAgent = new Agent({
      name,
      email,
      password: hashedPassword,
      agencyName,
      licenseNumber,
    });

    // Save the agent to the database
    await newAgent.save();

    // Generate a token for the agent
    const token = jwt.sign({ id: newAgent._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with the agent data and token
    res.status(201).json({
      message: 'Agent registered successfully',
      agent: newAgent,
      token,
    });
  } catch (error) {
    console.error('Error registering agent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login an agent
export const loginAgent = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the agent by email
    const agent = await Agent.findOne({ email });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a token
    const token = jwt.sign({ id: agent._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with the agent data and token
    res.status(200).json({
      message: 'Login successful',
      agent,
      token,
    });
  } catch (error) {
    console.error('Error logging in agent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




// Update agent profile
export const getAgentProfile = async (req, res) => {
  try {
    const agent = await Agent.findById(req.agent.id).select('-password');
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    console.error('Error fetching agent profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAgentProfile = async (req, res) => {
  try {
    const { name, agencyName, licenseNumber } = req.body;
    
    const agent = await Agent.findById(req.agent.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    agent.name = name || agent.name;
    agent.agencyName = agencyName || agent.agencyName;
    agent.licenseNumber = licenseNumber || agent.licenseNumber;
    
    await agent.save();
    
    const updatedAgent = await Agent.findById(req.agent.id).select('-password');
    res.json(updatedAgent);
  } catch (error) {
    console.error('Error updating agent profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};