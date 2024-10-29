import express from 'express';
import { registerAgent, loginAgent, getAgentProfile, updateAgentProfile } from '../controllers/agentController.js';
import agentAuthMiddleware from '../middleware/agentAuthMiddleware.js';

const agentAuthRoutes = express.Router();




  

// Route for registering a new agent
agentAuthRoutes.post('/register-agent', registerAgent);

// Route for logging in an agent
agentAuthRoutes.post('/login', loginAgent);


agentAuthRoutes.post('/check-auth', agentAuthMiddleware, (req, res) => {
   
    res.json({ user: req.user });
  });
  




  agentAuthRoutes.post('/view', agentAuthMiddleware, getAgentProfile);
  agentAuthRoutes.post('/update', agentAuthMiddleware, updateAgentProfile);
  

export default agentAuthRoutes;
