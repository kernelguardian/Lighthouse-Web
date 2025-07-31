import {
  users,
  songs,
  songLyrics,
  favorites,
  editSuggestions,
  type User,
  type UpsertUser,
  type Song,
  type InsertSong,
  type SongLyrics,
  type InsertSongLyrics,
  type Favorite,
  type InsertFavorite,
  type EditSuggestion,
  type InsertEditSuggestion,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, ilike, or, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Song operations
  getSongs(limit?: number, offset?: number): Promise<Song[]>;
  getSong(id: number): Promise<Song | undefined>;
  getSongWithLyrics(id: number): Promise<(Song & { lyrics: SongLyrics[] }) | undefined>;
  createSong(song: InsertSong): Promise<Song>;
  updateSong(id: number, song: Partial<InsertSong>): Promise<Song>;
  searchSongs(query: string, limit?: number): Promise<Song[]>;
  incrementViewCount(id: number): Promise<void>;
  
  // Song lyrics operations
  getSongLyrics(songId: number): Promise<SongLyrics[]>;
  createSongLyrics(lyrics: InsertSongLyrics): Promise<SongLyrics>;
  updateSongLyrics(id: number, lyrics: Partial<InsertSongLyrics>): Promise<SongLyrics>;
  
  // Favorites operations
  getUserFavorites(userId: string): Promise<(Favorite & { song: Song })[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, songId: number): Promise<void>;
  isFavorite(userId: string, songId: number): Promise<boolean>;
  
  // Edit suggestions operations
  getEditSuggestions(status?: string): Promise<EditSuggestion[]>;
  createEditSuggestion(suggestion: InsertEditSuggestion): Promise<EditSuggestion>;
  updateEditSuggestionStatus(id: number, status: string, reviewerId: string): Promise<EditSuggestion>;
  
  // Statistics
  getPopularSongs(limit?: number): Promise<Song[]>;
  getRecentActivity(limit?: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Song operations
  async getSongs(limit = 20, offset = 0): Promise<Song[]> {
    return await db.select().from(songs)
      .orderBy(desc(songs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getSong(id: number): Promise<Song | undefined> {
    const [song] = await db.select().from(songs).where(eq(songs.id, id));
    return song;
  }

  async getSongWithLyrics(id: number): Promise<(Song & { lyrics: SongLyrics[] }) | undefined> {
    const song = await this.getSong(id);
    if (!song) return undefined;
    
    const lyrics = await this.getSongLyrics(id);
    return { ...song, lyrics };
  }

  async createSong(song: InsertSong): Promise<Song> {
    const [newSong] = await db.insert(songs).values(song).returning();
    return newSong;
  }

  async updateSong(id: number, song: Partial<InsertSong>): Promise<Song> {
    const [updatedSong] = await db
      .update(songs)
      .set({ ...song, updatedAt: new Date() })
      .where(eq(songs.id, id))
      .returning();
    return updatedSong;
  }

  async searchSongs(query: string, limit = 20): Promise<Song[]> {
    return await db.select().from(songs)
      .where(
        or(
          ilike(songs.title, `%${query}%`),
          ilike(songs.artist, `%${query}%`),
          sql`${songs.tags} && ARRAY[${query}]`
        )
      )
      .orderBy(desc(songs.viewCount))
      .limit(limit);
  }

  async incrementViewCount(id: number): Promise<void> {
    await db
      .update(songs)
      .set({ viewCount: sql`${songs.viewCount} + 1` })
      .where(eq(songs.id, id));
  }

  // Song lyrics operations
  async getSongLyrics(songId: number): Promise<SongLyrics[]> {
    return await db.select().from(songLyrics)
      .where(eq(songLyrics.songId, songId))
      .orderBy(desc(songLyrics.isOriginal), asc(songLyrics.language));
  }

  async createSongLyrics(lyrics: InsertSongLyrics): Promise<SongLyrics> {
    const [newLyrics] = await db.insert(songLyrics).values(lyrics).returning();
    return newLyrics;
  }

  async updateSongLyrics(id: number, lyrics: Partial<InsertSongLyrics>): Promise<SongLyrics> {
    const [updatedLyrics] = await db
      .update(songLyrics)
      .set({ ...lyrics, updatedAt: new Date() })
      .where(eq(songLyrics.id, id))
      .returning();
    return updatedLyrics;
  }

  // Favorites operations
  async getUserFavorites(userId: string): Promise<(Favorite & { song: Song })[]> {
    return await db.select({
      id: favorites.id,
      userId: favorites.userId,
      songId: favorites.songId,
      createdAt: favorites.createdAt,
      song: songs,
    })
    .from(favorites)
    .innerJoin(songs, eq(favorites.songId, songs.id))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    return newFavorite;
  }

  async removeFavorite(userId: string, songId: number): Promise<void> {
    await db.delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.songId, songId)));
  }

  async isFavorite(userId: string, songId: number): Promise<boolean> {
    const [favorite] = await db.select().from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.songId, songId)));
    return !!favorite;
  }

  // Edit suggestions operations
  async getEditSuggestions(status?: string): Promise<EditSuggestion[]> {
    const query = db.select().from(editSuggestions);
    
    if (status) {
      query.where(eq(editSuggestions.status, status));
    }
    
    return await query.orderBy(desc(editSuggestions.createdAt));
  }

  async createEditSuggestion(suggestion: InsertEditSuggestion): Promise<EditSuggestion> {
    const [newSuggestion] = await db.insert(editSuggestions).values(suggestion).returning();
    return newSuggestion;
  }

  async updateEditSuggestionStatus(id: number, status: string, reviewerId: string): Promise<EditSuggestion> {
    const [updatedSuggestion] = await db
      .update(editSuggestions)
      .set({ 
        status, 
        reviewedBy: reviewerId, 
        updatedAt: new Date() 
      })
      .where(eq(editSuggestions.id, id))
      .returning();
    return updatedSuggestion;
  }

  // Statistics
  async getPopularSongs(limit = 10): Promise<Song[]> {
    return await db.select().from(songs)
      .orderBy(desc(songs.viewCount))
      .limit(limit);
  }

  async getRecentActivity(limit = 10): Promise<any[]> {
    // Get recent songs, lyrics, and edit suggestions
    const recentSongs = await db.select({
      type: sql`'song'`,
      id: songs.id,
      title: songs.title,
      artist: songs.artist,
      createdAt: songs.createdAt,
      userId: songs.createdBy,
    }).from(songs)
    .orderBy(desc(songs.createdAt))
    .limit(limit);

    const recentLyrics = await db.select({
      type: sql`'lyrics'`,
      id: songLyrics.id,
      songId: songLyrics.songId,
      language: songLyrics.language,
      createdAt: songLyrics.createdAt,
      userId: songLyrics.contributorId,
    }).from(songLyrics)
    .orderBy(desc(songLyrics.createdAt))
    .limit(limit);

    const recentSuggestions = await db.select({
      type: sql`'suggestion'`,
      id: editSuggestions.id,
      songId: editSuggestions.songId,
      status: editSuggestions.status,
      createdAt: editSuggestions.createdAt,
      userId: editSuggestions.suggestedBy,
    }).from(editSuggestions)
    .orderBy(desc(editSuggestions.createdAt))
    .limit(limit);

    // Combine and sort by date
    const allActivity = [...recentSongs, ...recentLyrics, ...recentSuggestions]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);

    return allActivity;
  }
}

export const storage = new DatabaseStorage();
