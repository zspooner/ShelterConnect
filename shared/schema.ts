import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, integer as sqliteInteger } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Shelters table - for shelter authentication
export const shelters = sqliteTable("shelters", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipcode: text("zipcode"),
  website: text("website"),
  primaryContact: text("primary_contact"),
  description: text("description"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Dogs table
export const dogs = sqliteTable("dogs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  shelterId: text("shelter_id").notNull().references(() => shelters.id),
  name: text("name").notNull(),
  ageYears: real("age_years").notNull(),
  sex: text("sex").notNull(),
  breedGuess: text("breed_guess"),
  weightLbs: real("weight_lbs").notNull(),
  temperament: text("temperament").notNull(), // CSV of enums
  bio: text("bio"),
  intakeDate: integer("intake_date", { mode: 'timestamp' }),
  euthanasiaRisk: integer("euthanasia_risk", { mode: 'boolean' }).notNull().default(false),
  adoptionDeadline: integer("adoption_deadline", { mode: 'timestamp' }),
  urgencyLevel: text("urgency_level").notNull().default("Medium"),
  status: text("status").notNull().default("Available"),
  photoUrl: text("photo_url").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Post Assets table - for generated content
export const postAssets = sqliteTable("post_assets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  dogId: text("dog_id").notNull().references(() => dogs.id),
  kind: text("kind").notNull(), // Caption|IGImage|StoryImage|XText
  payload: text("payload", { mode: 'json' }).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Volunteers table
export const volunteers = sqliteTable("volunteers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  socialHandles: text("social_handles", { mode: 'json' }).default({}),
  preferredChannels: text("preferred_channels", { mode: 'json' }).default([]),
  location: text("location"),
  city: text("city"),
  state: text("state"),
  verified: integer("verified", { mode: 'boolean' }).notNull().default(false),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Amplify Tasks table
export const amplifyTasks = sqliteTable("amplify_tasks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  dogId: text("dog_id").notNull().references(() => dogs.id),
  volunteerId: text("volunteer_id").references(() => volunteers.id),
  channel: text("channel").notNull(), // IG|TikTok|X|FB|Nextdoor
  status: text("status").notNull().default("Open"), // Open|Claimed|Done|Expired
  shareUrl: text("share_url"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: integer("expires_at", { mode: 'timestamp' }),
});

// Clicks table - for tracking
export const clicks = sqliteTable("clicks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  dogId: text("dog_id").notNull().references(() => dogs.id),
  source: text("source").notNull(), // IG|TikTok|X|FB|Direct|Other
  ipHash: text("ip_hash").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Adoption Inquiries table
export const adoptionInquiries = sqliteTable("adoption_inquiries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  dogId: text("dog_id").notNull().references(() => dogs.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Insert schemas
export const insertShelterSchema = createInsertSchema(shelters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDogSchema = createInsertSchema(dogs).omit({
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVolunteerSchema = createInsertSchema(volunteers).omit({
  id: true,
  verified: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAmplifyTaskSchema = createInsertSchema(amplifyTasks).omit({
  id: true,
  createdAt: true,
  expiresAt: true,
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
export type InsertAmplifyTask = z.infer<typeof insertAmplifyTaskSchema>;
export type AmplifyTask = typeof amplifyTasks.$inferSelect;
export type Click = typeof clicks.$inferSelect;
export type InsertAdoptionInquiry = z.infer<typeof insertAdoptionInquirySchema>;
export type AdoptionInquiry = typeof adoptionInquiries.$inferSelect;

// Legacy compatibility for auth blueprint
export const users = shelters; // Use shelters table for user auth
export const insertUserSchema = insertShelterSchema.pick({
  email: true,
  password: true,
  name: true,
  city: true,
  state: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
