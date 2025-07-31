import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertSongSchema, insertSongLyricsSchema, insertEditSuggestionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Song routes
  app.get('/api/songs', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const songs = await storage.getSongs(limit, offset);
      res.json(songs);
    } catch (error) {
      console.error("Error fetching songs:", error);
      res.status(500).json({ message: "Failed to fetch songs" });
    }
  });

  app.get('/api/songs/popular', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const songs = await storage.getPopularSongs(limit);
      res.json(songs);
    } catch (error) {
      console.error("Error fetching popular songs:", error);
      res.status(500).json({ message: "Failed to fetch popular songs" });
    }
  });

  app.get('/api/songs/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length < 2) {
        return res.json([]);
      }
      const limit = parseInt(req.query.limit as string) || 20;
      const songs = await storage.searchSongs(query, limit);
      res.json(songs);
    } catch (error) {
      console.error("Error searching songs:", error);
      res.status(500).json({ message: "Failed to search songs" });
    }
  });

  app.get('/api/songs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const song = await storage.getSongWithLyrics(id);
      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }
      
      // Increment view count
      await storage.incrementViewCount(id);
      
      res.json(song);
    } catch (error) {
      console.error("Error fetching song:", error);
      res.status(500).json({ message: "Failed to fetch song" });
    }
  });

  app.post('/api/songs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const songData = insertSongSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const song = await storage.createSong(songData);
      res.status(201).json(song);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid song data", errors: error.errors });
      }
      console.error("Error creating song:", error);
      res.status(500).json({ message: "Failed to create song" });
    }
  });

  // Song lyrics routes
  app.get('/api/songs/:id/lyrics', async (req, res) => {
    try {
      const songId = parseInt(req.params.id);
      const lyrics = await storage.getSongLyrics(songId);
      res.json(lyrics);
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      res.status(500).json({ message: "Failed to fetch lyrics" });
    }
  });

  app.post('/api/songs/:id/lyrics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const songId = parseInt(req.params.id);
      
      const lyricsData = insertSongLyricsSchema.parse({
        ...req.body,
        songId,
        contributorId: userId,
      });
      
      const lyrics = await storage.createSongLyrics(lyricsData);
      res.status(201).json(lyrics);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lyrics data", errors: error.errors });
      }
      console.error("Error creating lyrics:", error);
      res.status(500).json({ message: "Failed to create lyrics" });
    }
  });

  // Favorites routes
  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { songId } = req.body;
      
      if (!songId) {
        return res.status(400).json({ message: "Song ID is required" });
      }
      
      const favorite = await storage.addFavorite({ userId, songId: parseInt(songId) });
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete('/api/favorites/:songId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const songId = parseInt(req.params.songId);
      
      await storage.removeFavorite(userId, songId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  app.get('/api/favorites/:songId/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const songId = parseInt(req.params.songId);
      
      const isFavorite = await storage.isFavorite(userId, songId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite:", error);
      res.status(500).json({ message: "Failed to check favorite" });
    }
  });

  // Edit suggestions routes
  app.get('/api/edit-suggestions', isAuthenticated, async (req, res) => {
    try {
      const status = req.query.status as string;
      const suggestions = await storage.getEditSuggestions(status);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching edit suggestions:", error);
      res.status(500).json({ message: "Failed to fetch edit suggestions" });
    }
  });

  app.post('/api/edit-suggestions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const suggestionData = insertEditSuggestionSchema.parse({
        ...req.body,
        suggestedBy: userId,
      });
      
      const suggestion = await storage.createEditSuggestion(suggestionData);
      res.status(201).json(suggestion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid suggestion data", errors: error.errors });
      }
      console.error("Error creating edit suggestion:", error);
      res.status(500).json({ message: "Failed to create edit suggestion" });
    }
  });

  app.patch('/api/edit-suggestions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const suggestion = await storage.updateEditSuggestionStatus(id, status, userId);
      res.json(suggestion);
    } catch (error) {
      console.error("Error updating edit suggestion:", error);
      res.status(500).json({ message: "Failed to update edit suggestion" });
    }
  });

  // Activity feed
  app.get('/api/activity', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activity = await storage.getRecentActivity(limit);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
