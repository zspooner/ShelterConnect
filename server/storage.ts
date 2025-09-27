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
import { eq, and, lt } from "drizzle-orm";

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
  getTasksByDog(dogId: string): Promise<AmplifyTask[]>;
  expireOldTasks(): Promise<void>;
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

// In-memory storage implementation for development
export class MemStorage implements IStorage {
  public sessionStore: session.Store;
  private users: Map<string, User> = new Map();
  private shelters: Map<string, Shelter> = new Map();
  private dogs: Map<string, Dog> = new Map();
  private volunteers: Map<string, Volunteer> = new Map();
  private postAssets: Map<string, PostAsset> = new Map();
  private amplifyTasks: Map<string, AmplifyTask> = new Map();
  private clicks: Click[] = [];
  private adoptionInquiries: AdoptionInquiry[] = [];

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // Auth methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === username) return user; // Look up by email since User = Shelter
    }
    return undefined;
  }

  async createUser(user: any): Promise<User> {
    const newUser: User = {
      id: randomUUID(),
      name: user.name,
      email: user.email,
      password: user.password,
      city: user.city,
      state: user.state,
      createdAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  // Shelter methods
  async getShelter(id: string): Promise<Shelter | undefined> {
    return this.shelters.get(id);
  }

  async getShelterByEmail(email: string): Promise<Shelter | undefined> {
    for (const shelter of this.shelters.values()) {
      if (shelter.email === email) return shelter;
    }
    return undefined;
  }

  async createShelter(shelter: InsertShelter): Promise<Shelter> {
    const newShelter: Shelter = {
      id: randomUUID(),
      name: shelter.name,
      email: shelter.email,
      phone: shelter.phone || null,
      address: shelter.address || null,
      city: shelter.city || null,
      state: shelter.state || null,
      zipcode: shelter.zipcode || null,
      website: shelter.website || null,
      primaryContact: shelter.primaryContact || null,
      description: shelter.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.shelters.set(newShelter.id, newShelter);
    return newShelter;
  }

  // Dog methods
  async createDog(dog: InsertDog): Promise<Dog> {
    const newDog: Dog = {
      id: randomUUID(),
      shelterId: dog.shelterId,
      name: dog.name,
      slug: dog.slug,
      ageYears: dog.ageYears,
      sex: dog.sex,
      breedGuess: dog.breedGuess,
      weightLbs: dog.weightLbs,
      temperament: dog.temperament,
      bio: dog.bio,
      photoUrl: dog.photoUrl,
      adoptionDeadline: dog.adoptionDeadline ? new Date(dog.adoptionDeadline) : null,
      euthanasiaRisk: dog.euthanasiaRisk,
      urgencyLevel: dog.urgencyLevel || "Medium",
      status: dog.status || "Available",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.dogs.set(newDog.id, newDog);
    return newDog;
  }

  async getDog(id: string): Promise<Dog | undefined> {
    return this.dogs.get(id);
  }

  async getDogBySlug(slug: string): Promise<Dog | undefined> {
    for (const dog of this.dogs.values()) {
      if (dog.slug === slug) return dog;
    }
    return undefined;
  }

  async listDogsByShelter(shelterId: string): Promise<Dog[]> {
    return Array.from(this.dogs.values()).filter(dog => dog.shelterId === shelterId);
  }

  async updateDog(id: string, updates: Partial<Dog>): Promise<Dog | undefined> {
    const dog = this.dogs.get(id);
    if (!dog) return undefined;
    
    const updatedDog = { ...dog, ...updates, updatedAt: new Date() };
    this.dogs.set(id, updatedDog);
    return updatedDog;
  }

  // Volunteer methods
  async createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer> {
    const newVolunteer: Volunteer = {
      id: randomUUID(),
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone || null,
      socialHandles: volunteer.socialHandles || {},
      preferredChannels: volunteer.preferredChannels || [],
      location: volunteer.location || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.volunteers.set(newVolunteer.id, newVolunteer);
    return newVolunteer;
  }

  async getVolunteerByEmail(email: string): Promise<Volunteer | undefined> {
    for (const volunteer of this.volunteers.values()) {
      if (volunteer.email === email) return volunteer;
    }
    return undefined;
  }

  // Post assets
  async createPostAsset(asset: { dogId: string; kind: string; payload: any }): Promise<PostAsset> {
    const newAsset = {
      id: randomUUID(),
      dogId: asset.dogId,
      kind: asset.kind,
      payload: asset.payload,
      createdAt: new Date(),
    } as PostAsset;
    this.postAssets.set(newAsset.id, newAsset);
    return newAsset;
  }

  async getPostAssetsByDog(dogId: string): Promise<PostAsset[]> {
    return Array.from(this.postAssets.values()).filter(asset => asset.dogId === dogId);
  }

  // Amplify tasks
  async createAmplifyTask(task: Omit<AmplifyTask, 'id' | 'createdAt'>): Promise<AmplifyTask> {
    const newTask: AmplifyTask = {
      id: randomUUID(),
      dogId: task.dogId,
      volunteerId: task.volunteerId || null,
      channel: task.channel,
      status: task.status || "Open",
      shareUrl: task.shareUrl || null,
      expiresAt: task.expiresAt ? new Date(task.expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
    };
    this.amplifyTasks.set(newTask.id, newTask);
    return newTask;
  }

  async expireOldTasks(): Promise<void> {
    const now = new Date();
    for (const [id, task] of this.amplifyTasks.entries()) {
      if (task.expiresAt && task.expiresAt < now && task.status === "Claimed") {
        task.status = "Open";
        task.volunteerId = null;
      }
    }
  }

  async listOpenTasks(): Promise<AmplifyTask[]> {
    await this.expireOldTasks();
    return Array.from(this.amplifyTasks.values()).filter(task => task.status === "Open");
  }

  async listTasksByVolunteer(volunteerId: string): Promise<AmplifyTask[]> {
    return Array.from(this.amplifyTasks.values()).filter(task => task.volunteerId === volunteerId);
  }

  async getTasksByDog(dogId: string): Promise<AmplifyTask[]> {
    return Array.from(this.amplifyTasks.values()).filter(task => task.dogId === dogId);
  }

  async claimTask(taskId: string, volunteerId: string): Promise<AmplifyTask | undefined> {
    const task = this.amplifyTasks.get(taskId);
    if (!task || task.status !== "Open") return undefined;
    
    task.status = "Claimed";
    task.volunteerId = volunteerId;
    return task;
  }

  async completeTask(taskId: string): Promise<AmplifyTask | undefined> {
    const task = this.amplifyTasks.get(taskId);
    if (!task || task.status !== "Claimed") return undefined;
    
    task.status = "Done";
    return task;
  }

  // Click tracking
  async recordClick(dogId: string, source: string, ipHash: string): Promise<Click> {
    const click = {
      id: randomUUID(),
      dogId,
      source,
      ipHash,
      createdAt: new Date(),
    } as Click;
    this.clicks.push(click);
    return click;
  }

  async getClicksByDog(dogId: string): Promise<Click[]> {
    return this.clicks.filter(click => click.dogId === dogId);
  }

  // Adoption inquiries
  async createInquiry(inquiry: InsertAdoptionInquiry): Promise<AdoptionInquiry> {
    const newInquiry: AdoptionInquiry = {
      id: randomUUID(),
      dogId: inquiry.dogId,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone || null,
      message: inquiry.message || null,
      createdAt: new Date(),
    };
    this.adoptionInquiries.push(newInquiry);
    return newInquiry;
  }

  async getInquiriesByDog(dogId: string): Promise<AdoptionInquiry[]> {
    return this.adoptionInquiries.filter(inquiry => inquiry.dogId === dogId);
  }

  getSessionStore(): session.Store {
    return this.sessionStore;
  }
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
    try {
      // Ensure all required fields are present
      const shelterData: InsertShelter = {
        name: user.name || "New Shelter",
        email: user.email,
        password: user.password,
        city: user.city || "Unknown",
        state: user.state || "Unknown",
        phone: null,
        address: null,
        zipcode: null,
        website: null,
        primaryContact: null,
        description: null,
      };
      
      console.log('Creating shelter with data:', { 
        name: shelterData.name, 
        email: shelterData.email, 
        city: shelterData.city, 
        state: shelterData.state 
      });
      
      const newShelter = await this.createShelter(shelterData);
      console.log('Shelter created successfully:', newShelter.id);
      return newShelter;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
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

  async expireOldTasks(): Promise<void> {
    // Mark tasks as expired that are past their expiration date
    await db
      .update(amplifyTasks)
      .set({ status: "Expired" })
      .where(and(
        eq(amplifyTasks.status, "Open"),
        lt(amplifyTasks.expiresAt, new Date())
      ));
  }

  async listOpenTasks(): Promise<AmplifyTask[]> {
    // First expire any old tasks
    await this.expireOldTasks();
    
    // Then return only truly open tasks
    return await db
      .select()
      .from(amplifyTasks)
      .where(eq(amplifyTasks.status, "Open"));
  }

  async getTasksByDog(dogId: string): Promise<AmplifyTask[]> {
    // Expire old tasks first
    await this.expireOldTasks();
    
    return await db
      .select()
      .from(amplifyTasks)
      .where(eq(amplifyTasks.dogId, dogId));
  }

  async claimTask(taskId: string, volunteerId: string): Promise<AmplifyTask | undefined> {
    // First expire any old tasks
    await this.expireOldTasks();
    
    // Try to claim the task (will only work if still Open and not expired)
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

export const storage = new MemStorage();
