import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const episodes = pgTable("episodes", {
  id: serial("id").primaryKey(),
  mixcloudId: text("mixcloud_id").notNull().unique(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  duration: integer("duration").notNull(), // duration in seconds
  artworkUrl: text("artwork_url"),
  mixcloudUrl: text("mixcloud_url").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  isNew: boolean("is_new").default(false),
});

export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  mixcloudUrl: text("mixcloud_url").notNull().unique(),
  name: text("name").notNull(),
  lastUpdated: timestamp("last_updated").notNull(),
  episodeCount: integer("episode_count").default(0),
});

export const insertEpisodeSchema = createInsertSchema(episodes).omit({
  id: true,
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
});

export type Episode = typeof episodes.$inferSelect;
export type InsertEpisode = z.infer<typeof insertEpisodeSchema>;
export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
