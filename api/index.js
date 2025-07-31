// Vercel serverless function entry point
import express from 'express';
import { registerRoutes } from '../server/routes.js';

const app = express();

// Register all routes
registerRoutes(app);

// Export the app as a Vercel function
export default app;