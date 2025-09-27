import { 
  type User, 
  type InsertUser, 
  type Shelter,
  type InsertShelter,
  type Dog,
  type InsertDog,
  type Volunteer,
  type InsertVolunteer,
  type PostAsset,
  type AmplifyTask,
  type Click,
  type AdoptionInquiry,
  type InsertAdoptionInquiry,
  shelters,
  dogs,
  volunteers,
  postAssets,
  amplifyTasks,
  clicks,
  adoptionInquiries
} from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Storage interface for ShelterDog Amplify
export interface IStorage {
  // Auth methods (using shelters as users)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Shelter methods
  getShelter(id: string): Promise<Shelter | undefined>;
  getShelterByEmail(email: string): Promise<Shelter | undefined>;
  createShelter(shelter: InsertShelter): Promise<Shelter>;
  
  // Dog methods
  createDog(dog: InsertDog): Promise<Dog>;
  getDog(id: string): Promise<Dog | undefined>;
  getDogBySlug(slug: string): Promise<Dog | undefined>;
  listDogsByShelter(shelterId: string): Promise<Dog[]>;
  updateDog(id: string, updates: Partial<Dog>): Promise<Dog | undefined>;
  
  // Volunteer methods
  createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer>;
  getVolunteerByEmail(email: string): Promise<Volunteer | undefined>;
  
  // Post Asset methods
  createPostAsset(asset: { dogId: string; kind: string; payload: any }): Promise<PostAsset>;
  getPostAssetsByDog(dogId: string): Promise<PostAsset[]>;
  
  // Amplify Task methods
  createAmplifyTask(task: { dogId: string; channel: string; expiresAt?: Date }): Promise<AmplifyTask>;
  listOpenTasks(): Promise<AmplifyTask[]>;
  claimTask(taskId: string, volunteerId: string): Promise<AmplifyTask | undefined>;
  completeTask(taskId: string): Promise<AmplifyTask | undefined>;
  
  // Click tracking
  recordClick(dogId: string, source: string, ipHash: string): Promise<Click>;
  getClicksByDog(dogId: string): Promise<Click[]>;
  
  // Adoption inquiries
  createInquiry(inquiry: InsertAdoptionInquiry): Promise<AdoptionInquiry>;
  getInquiriesByDog(dogId: string): Promise<AdoptionInquiry[]>;
  
  // Session store
  sessionStore: session.Store;
}

// Referenced from javascript_database integration
export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      conString: process.env.DATABASE_URL!,
      createTableIfMissing: true 
    });
  }

  // Auth methods (using shelters as users)
  async getUser(id: string): Promise<User | undefined> {
    return this.getShelter(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.getShelterByEmail(username); // using email as username
  }

  async createUser(user: InsertUser): Promise<User> {
    // Convert to shelter data
    const shelterData: InsertShelter = {
      name: "New Shelter", // Will be updated during registration
      city: "Unknown",
      state: "Unknown",
      ...user,
      email: user.email || (user as any).username, // handle both email/username
    };
    return this.createShelter(shelterData);
  }

  // Shelter methods
  async getShelter(id: string): Promise<Shelter | undefined> {
    const [shelter] = await db.select().from(shelters).where(eq(shelters.id, id));
    return shelter || undefined;
  }

  async getShelterByEmail(email: string): Promise<Shelter | undefined> {
    const [shelter] = await db.select().from(shelters).where(eq(shelters.email, email));
    return shelter || undefined;
  }

  async createShelter(shelter: InsertShelter): Promise<Shelter> {
    const [newShelter] = await db.insert(shelters).values(shelter).returning();
    return newShelter;
  }

  // Dog methods
  async createDog(dog: InsertDog): Promise<Dog> {
    // Generate unique slug
    const baseSlug = `${dog.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${randomUUID().slice(0, 4)}`;
    const slug = baseSlug;
    
    const dogData = {
      ...dog,
      slug,
      breedGuess: dog.breedGuess || null,
      bio: dog.bio || null,
      intakeDate: dog.intakeDate || null,
      adoptionDeadline: dog.adoptionDeadline || null,
      euthanasiaRisk: dog.euthanasiaRisk || false,
      status: dog.status || "Available",
    };
    
    const [newDog] = await db.insert(dogs).values(dogData).returning();
    return newDog;
  }

  async getDog(id: string): Promise<Dog | undefined> {
    const [dog] = await db.select().from(dogs).where(eq(dogs.id, id));
    return dog || undefined;
  }

  async getDogBySlug(slug: string): Promise<Dog | undefined> {
    const [dog] = await db.select().from(dogs).where(eq(dogs.slug, slug));
    return dog || undefined;
  }

  async listDogsByShelter(shelterId: string): Promise<Dog[]> {
    return await db.select().from(dogs).where(eq(dogs.shelterId, shelterId));
  }

  async updateDog(id: string, updates: Partial<Dog>): Promise<Dog | undefined> {
    const [updatedDog] = await db
      .update(dogs)
      .set(updates)
      .where(eq(dogs.id, id))
      .returning();
    return updatedDog || undefined;
  }

  // Volunteer methods
  async createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer> {
    const volunteerData = {
      ...volunteer,
      city: volunteer.city || null,
      state: volunteer.state || null,
    };
    const [newVolunteer] = await db.insert(volunteers).values(volunteerData).returning();
    return newVolunteer;
  }

  async getVolunteerByEmail(email: string): Promise<Volunteer | undefined> {
    const [volunteer] = await db.select().from(volunteers).where(eq(volunteers.email, email));
    return volunteer || undefined;
  }

  // Post Asset methods
  async createPostAsset(asset: { dogId: string; kind: string; payload: any }): Promise<PostAsset> {
    const [newAsset] = await db.insert(postAssets).values(asset).returning();
    return newAsset;
  }

  async getPostAssetsByDog(dogId: string): Promise<PostAsset[]> {
    return await db.select().from(postAssets).where(eq(postAssets.dogId, dogId));
  }

  // Amplify Task methods
  async createAmplifyTask(task: { dogId: string; channel: string; expiresAt?: Date }): Promise<AmplifyTask> {
    const taskData = {
      ...task,
      status: "Open",
      expiresAt: task.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
    };
    const [newTask] = await db.insert(amplifyTasks).values(taskData).returning();
    return newTask;
  }

  async listOpenTasks(): Promise<AmplifyTask[]> {
    return await db
      .select()
      .from(amplifyTasks)
      .where(eq(amplifyTasks.status, "Open"));
  }

  async claimTask(taskId: string, volunteerId: string): Promise<AmplifyTask | undefined> {
    const [updatedTask] = await db
      .update(amplifyTasks)
      .set({ volunteerId, status: "Claimed" })
      .where(and(eq(amplifyTasks.id, taskId), eq(amplifyTasks.status, "Open")))
      .returning();
    return updatedTask || undefined;
  }

  async completeTask(taskId: string): Promise<AmplifyTask | undefined> {
    const [updatedTask] = await db
      .update(amplifyTasks)
      .set({ status: "Done" })
      .where(and(eq(amplifyTasks.id, taskId), eq(amplifyTasks.status, "Claimed")))
      .returning();
    return updatedTask || undefined;
  }

  // Click tracking
  async recordClick(dogId: string, source: string, ipHash: string): Promise<Click> {
    const [click] = await db.insert(clicks).values({ dogId, source, ipHash }).returning();
    return click;
  }

  async getClicksByDog(dogId: string): Promise<Click[]> {
    return await db.select().from(clicks).where(eq(clicks.dogId, dogId));
  }

  // Adoption inquiries
  async createInquiry(inquiry: InsertAdoptionInquiry): Promise<AdoptionInquiry> {
    const inquiryData = {
      ...inquiry,
      phone: inquiry.phone || null,
      message: inquiry.message || null,
    };
    const [newInquiry] = await db.insert(adoptionInquiries).values(inquiryData).returning();
    return newInquiry;
  }

  async getInquiriesByDog(dogId: string): Promise<AdoptionInquiry[]> {
    return await db.select().from(adoptionInquiries).where(eq(adoptionInquiries.dogId, dogId));
  }
}

export const storage = new DatabaseStorage();