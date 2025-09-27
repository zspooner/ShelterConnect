import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Shelters table - for shelter authentication
export const shelters = pgTable("shelters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Dogs table
export const dogs = pgTable("dogs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shelterId: varchar("shelter_id").notNull().references(() => shelters.id),
  name: text("name").notNull(),
  ageYears: real("age_years").notNull(),
  sex: text("sex").notNull(),
  breedGuess: text("breed_guess"),
  weightLbs: real("weight_lbs").notNull(),
  temperament: text("temperament").notNull(), // CSV of enums
  bio: text("bio"),
  intakeDate: timestamp("intake_date"),
  euthanasiaRisk: boolean("euthanasia_risk").notNull().default(false),
  adoptionDeadline: timestamp("adoption_deadline"),
  status: text("status").notNull().default("Available"),
  photoUrl: text("photo_url").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Post Assets table - for generated content
export const postAssets = pgTable("post_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dogId: varchar("dog_id").notNull().references(() => dogs.id),
  kind: text("kind").notNull(), // Caption|IGImage|StoryImage|XText
  payload: json("payload").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Volunteers table
export const volunteers = pgTable("volunteers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  city: text("city"),
  state: text("state"),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Amplify Tasks table
export const amplifyTasks = pgTable("amplify_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dogId: varchar("dog_id").notNull().references(() => dogs.id),
  volunteerId: varchar("volunteer_id").references(() => volunteers.id),
  channel: text("channel").notNull(), // IG|TikTok|X|FB|Nextdoor
  status: text("status").notNull().default("Open"), // Open|Claimed|Done|Expired
  shareUrl: text("share_url"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: timestamp("expires_at"),
});

// Clicks table - for tracking
export const clicks = pgTable("clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dogId: varchar("dog_id").notNull().references(() => dogs.id),
  source: text("source").notNull(), // IG|TikTok|X|FB|Direct|Other
  ipHash: text("ip_hash").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Adoption Inquiries table
export const adoptionInquiries = pgTable("adoption_inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dogId: varchar("dog_id").notNull().references(() => dogs.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Insert schemas
export const insertShelterSchema = createInsertSchema(shelters).omit({
  id: true,
  createdAt: true,
});

export const insertDogSchema = createInsertSchema(dogs).omit({
  id: true,
  slug: true,
  createdAt: true,
});

export const insertVolunteerSchema = createInsertSchema(volunteers).omit({
  id: true,
  verified: true,
  createdAt: true,
});

export const insertAdoptionInquirySchema = createInsertSchema(adoptionInquiries).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertShelter = z.infer<typeof insertShelterSchema>;
export type Shelter = typeof shelters.$inferSelect;
export type InsertDog = z.infer<typeof insertDogSchema>;
export type Dog = typeof dogs.$inferSelect;
export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type Volunteer = typeof volunteers.$inferSelect;
export type PostAsset = typeof postAssets.$inferSelect;
export type AmplifyTask = typeof amplifyTasks.$inferSelect;
export type Click = typeof clicks.$inferSelect;
export type InsertAdoptionInquiry = z.infer<typeof insertAdoptionInquirySchema>;
export type AdoptionInquiry = typeof adoptionInquiries.$inferSelect;

// Legacy compatibility for auth blueprint
export const users = shelters; // Use shelters table for user auth
export const insertUserSchema = insertShelterSchema.pick({
  email: true,
  password: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
