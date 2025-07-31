// Vercel serverless function entry point
const express = require('express');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const ws = require("ws");

// Configure Neon
neonConfig.webSocketConstructor = ws;

// Simple API handler for Vercel
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Initialize database connection
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });

  const { method, url } = req;

  try {
    if (url === '/api/songs/popular') {
      const songs = await db.execute(`
        SELECT id, title, artist, "primaryLanguage", tags, "viewCount", "createdAt" 
        FROM songs 
        ORDER BY "viewCount" DESC, "createdAt" DESC 
        LIMIT 10
      `);
      res.json(songs.rows || []);
    } else if (url === '/api/activity') {
      res.json([]);
    } else if (url === '/api/auth/user') {
      res.status(401).json({ message: 'Unauthorized' });
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};