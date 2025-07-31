import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Songs table
export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  primaryLanguage: varchar("primary_language").notNull(),
  tags: text("tags").array().default([]),
  viewCount: integer("view_count").default(0),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Song lyrics in different languages
export const songLyrics = pgTable("song_lyrics", {
  id: serial("id").primaryKey(),
  songId: integer("song_id").references(() => songs.id).notNull(),
  language: varchar("language").notNull(),
  content: text("content").notNull(),
  isOriginal: boolean("is_original").default(false),
  contributorId: varchar("contributor_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User favorites
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  songId: integer("song_id").references(() => songs.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Edit suggestions
export const editSuggestions = pgTable("edit_suggestions", {
  id: serial("id").primaryKey(),
  songId: integer("song_id").references(() => songs.id).notNull(),
  lyricsId: integer("lyrics_id").references(() => songLyrics.id),
  suggestedContent: text("suggested_content").notNull(),
  reason: text("reason"),
  status: varchar("status").default("pending"), // pending, approved, rejected
  suggestedBy: varchar("suggested_by").references(() => users.id).notNull(),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const songsRelations = relations(songs, ({ many, one }) => ({
  lyrics: many(songLyrics),
  favorites: many(favorites),
  editSuggestions: many(editSuggestions),
  creator: one(users, {
    fields: [songs.createdBy],
    references: [users.id],
  }),
}));

export const songLyricsRelations = relations(songLyrics, ({ one }) => ({
  song: one(songs, {
    fields: [songLyrics.songId],
    references: [songs.id],
  }),
  contributor: one(users, {
    fields: [songLyrics.contributorId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  song: one(songs, {
    fields: [favorites.songId],
    references: [songs.id],
  }),
}));

export const editSuggestionsRelations = relations(editSuggestions, ({ one }) => ({
  song: one(songs, {
    fields: [editSuggestions.songId],
    references: [songs.id],
  }),
  lyrics: one(songLyrics, {
    fields: [editSuggestions.lyricsId],
    references: [songLyrics.id],
  }),
  suggester: one(users, {
    fields: [editSuggestions.suggestedBy],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [editSuggestions.reviewedBy],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  createdSongs: many(songs),
  contributions: many(songLyrics),
  favorites: many(favorites),
  editSuggestions: many(editSuggestions),
}));

// Insert schemas
export const insertSongSchema = createInsertSchema(songs).omit({
  id: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSongLyricsSchema = createInsertSchema(songLyrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEditSuggestionSchema = createInsertSchema(editSuggestions).omit({
  id: true,
  status: true,
  reviewedBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Song = typeof songs.$inferSelect;
export type InsertSong = z.infer<typeof insertSongSchema>;
export type SongLyrics = typeof songLyrics.$inferSelect;
export type InsertSongLyrics = z.infer<typeof insertSongLyricsSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type EditSuggestion = typeof editSuggestions.$inferSelect;
export type InsertEditSuggestion = z.infer<typeof insertEditSuggestionSchema>;
