import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertDogSchema, insertVolunteerSchema, insertAdoptionInquirySchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import { ContentGenerator } from "./content-generator";

export async function registerRoutes(app: Express): Promise<Server> {
  // Referenced from javascript_auth_all_persistance integration
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Ensure upload directories exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const dogsDir = path.join(uploadsDir, 'dogs');
  const assetsDir = path.join(uploadsDir, 'assets');
  
  [uploadsDir, dogsDir, assetsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Configure multer for file uploads
  const storage_multer = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, dogsDir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
      cb(null, filename);
    }
  });

  const upload = multer({ 
    storage: storage_multer,
    limits: {
      fileSize: 8 * 1024 * 1024, // 8MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });

  // Helper function to require authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    next();
  };

  // Helper function to hash IP for privacy
  const hashIP = (ip: string): string => {
    const salt = process.env.SESSION_SECRET || 'default-salt';
    return crypto.createHash('sha256').update(ip + salt).digest('hex');
  };

  // DOG MANAGEMENT ROUTES

  // POST /api/dogs - Create a new dog with photo upload
  app.post('/api/dogs', requireAuth, upload.single('photo'), async (req, res) => {
    try {
      const shelterId = req.user!.id;
      const dogData = JSON.parse(req.body.dogData || '{}');
      
      if (!req.file) {
        return res.status(400).json({ error: 'Photo is required' });
      }

      // Validate the dog data
      const validatedData = insertDogSchema.parse({
        ...dogData,
        shelterId,
        photoUrl: `/uploads/dogs/${req.file.filename}`,
        ageYears: parseFloat(dogData.ageYears),
        weightLbs: parseFloat(dogData.weightLbs),
        adoptionDeadline: dogData.adoptionDeadline ? new Date(dogData.adoptionDeadline) : null,
        intakeDate: dogData.intakeDate ? new Date(dogData.intakeDate) : null,
        euthanasiaRisk: dogData.euthanasiaRisk === 'true' || dogData.euthanasiaRisk === true,
      });

      const dog = await storage.createDog(validatedData);
      res.status(201).json(dog);
    } catch (error) {
      console.error('Error creating dog:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create dog' });
    }
  });

  // GET /api/dogs - List dogs for the authenticated shelter
  app.get('/api/dogs', requireAuth, async (req, res) => {
    try {
      const shelterId = req.user!.id;
      const dogs = await storage.listDogsByShelter(shelterId);
      
      // Add click counts for each dog
      const dogsWithMetrics = await Promise.all(
        dogs.map(async (dog) => {
          const clicks = await storage.getClicksByDog(dog.id);
          const inquiries = await storage.getInquiriesByDog(dog.id);
          return {
            ...dog,
            clickCount: clicks.length,
            inquiryCount: inquiries.length,
          };
        })
      );
      
      res.json(dogsWithMetrics);
    } catch (error) {
      console.error('Error listing dogs:', error);
      res.status(500).json({ error: 'Failed to list dogs' });
    }
  });

  // GET /api/dogs/:id - Get detailed dog information
  app.get('/api/dogs/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const shelterId = req.user!.id;
      
      const dog = await storage.getDog(id);
      if (!dog) {
        return res.status(404).json({ error: 'Dog not found' });
      }
      
      // Ensure the dog belongs to this shelter
      if (dog.shelterId !== shelterId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Get associated data
      const [assets, clicks, inquiries] = await Promise.all([
        storage.getPostAssetsByDog(id),
        storage.getClicksByDog(id),
        storage.getInquiriesByDog(id),
      ]);
      
      res.json({
        ...dog,
        assets,
        clicks,
        inquiries,
        clickCount: clicks.length,
        inquiryCount: inquiries.length,
      });
    } catch (error) {
      console.error('Error getting dog:', error);
      res.status(500).json({ error: 'Failed to get dog' });
    }
  });

  // POST /api/dogs/:id/generate - Generate content for a dog
  app.post('/api/dogs/:id/generate', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const shelterId = req.user!.id;
      
      const dog = await storage.getDog(id);
      if (!dog || dog.shelterId !== shelterId) {
        return res.status(404).json({ error: 'Dog not found' });
      }
      
      // Check if content already exists to avoid duplicates
      const existingAssets = await storage.getPostAssetsByDog(id);
      if (existingAssets.length > 0) {
        return res.json({ message: 'Content already exists for this dog', assets: existingAssets });
      }
      
      const shelter = await storage.getShelter(shelterId);
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const publicUrl = `${baseUrl}/dog/${dog.slug}`;
      
      // Create content generator and generate all content
      const contentGenerator = new ContentGenerator();
      const content = await contentGenerator.generateAllContent({
        name: dog.name,
        sex: dog.sex as 'Male' | 'Female',
        ageYears: dog.ageYears,
        breedGuess: dog.breedGuess || undefined,
        temperament: dog.temperament || undefined,
        bio: dog.bio || undefined,
        euthanasiaRisk: dog.euthanasiaRisk,
        adoptionDeadline: dog.adoptionDeadline || undefined,
        shelterName: shelter?.name,
        city: shelter?.city,
        state: shelter?.state,
        photoUrl: dog.photoUrl,
        publicUrl
      });
      
      // Create content assets
      await Promise.all([
        storage.createPostAsset({
          dogId: id,
          kind: 'Caption',
          payload: { text: content.shortCaption, type: 'short' }
        }),
        storage.createPostAsset({
          dogId: id,
          kind: 'Caption', 
          payload: { text: content.longCaption, type: 'long' }
        }),
        storage.createPostAsset({
          dogId: id,
          kind: 'XText',
          payload: { text: content.xText }
        }),
        storage.createPostAsset({
          dogId: id,
          kind: 'IGImage',
          payload: { url: content.instagramImageUrl, type: 'square' }
        }),
        storage.createPostAsset({
          dogId: id,
          kind: 'StoryImage',
          payload: { url: content.storyImageUrl, type: 'story' }
        }),
        storage.createPostAsset({
          dogId: id,
          kind: 'QRCode',
          payload: { url: content.qrCodeUrl, linkTo: publicUrl }
        })
      ]);
      
      // Create amplify tasks
      const channels = ['IG', 'X', 'FB', 'Nextdoor'];
      for (const channel of channels) {
        await storage.createAmplifyTask({
          dogId: id,
          channel,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
      }
      
      res.json({ 
        message: 'Content generated successfully',
        content: {
          captions: {
            short: content.shortCaption,
            long: content.longCaption,
            x: content.xText
          },
          images: {
            instagram: content.instagramImageUrl,
            story: content.storyImageUrl,
            qrCode: content.qrCodeUrl
          }
        }
      });
    } catch (error) {
      console.error('Error generating content:', error);
      res.status(500).json({ error: 'Failed to generate content' });
    }
  });

  // PUBLIC ROUTES (no auth required)
  
  // GET /api/public/dogs/:slug - Get public dog profile
  app.get('/api/public/dogs/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const dog = await storage.getDogBySlug(slug);
      
      if (!dog) {
        return res.status(404).json({ error: 'Dog not found' });
      }
      
      const shelter = await storage.getShelter(dog.shelterId);
      const inquiries = await storage.getInquiriesByDog(dog.id);
      
      res.json({
        ...dog,
        shelter: {
          name: shelter?.name,
          email: shelter?.email,
          city: shelter?.city,
          state: shelter?.state,
        },
        inquiryCount: inquiries.length,
      });
    } catch (error) {
      console.error('Error getting public dog:', error);
      res.status(500).json({ error: 'Failed to get dog' });
    }
  });
  
  // POST /api/public/dogs/:slug/click - Track click
  app.post('/api/public/dogs/:slug/click', async (req, res) => {
    try {
      const { slug } = req.params;
      const { source } = req.body;
      
      const dog = await storage.getDogBySlug(slug);
      if (!dog) {
        return res.status(404).json({ error: 'Dog not found' });
      }
      
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const ipHash = hashIP(ip);
      
      await storage.recordClick(dog.id, source || 'Direct', ipHash);
      res.json({ success: true });
    } catch (error) {
      console.error('Error recording click:', error);
      res.status(500).json({ error: 'Failed to record click' });
    }
  });
  
  // POST /api/public/dogs/:slug/inquire - Submit adoption inquiry
  app.post('/api/public/dogs/:slug/inquire', async (req, res) => {
    try {
      const { slug } = req.params;
      const inquiryData = req.body;
      
      const dog = await storage.getDogBySlug(slug);
      if (!dog) {
        return res.status(404).json({ error: 'Dog not found' });
      }
      
      const validatedInquiry = insertAdoptionInquirySchema.parse({
        ...inquiryData,
        dogId: dog.id,
      });
      
      const inquiry = await storage.createInquiry(validatedInquiry);
      res.status(201).json({ message: 'Inquiry submitted successfully', id: inquiry.id });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to submit inquiry' });
    }
  });
  
  // VOLUNTEER ROUTES
  
  // GET /api/tasks - List open amplify tasks
  app.get('/api/tasks', async (req, res) => {
    try {
      const tasks = await storage.listOpenTasks();
      
      // Get dog and shelter info for each task
      const tasksWithDetails = await Promise.all(
        tasks.map(async (task) => {
          const dog = await storage.getDog(task.dogId);
          const shelter = dog ? await storage.getShelter(dog.shelterId) : null;
          
          return {
            ...task,
            dog: dog ? {
              name: dog.name,
              photoUrl: dog.photoUrl,
              urgencyLevel: dog.euthanasiaRisk ? 'Critical' : 
                (dog.adoptionDeadline && new Date(dog.adoptionDeadline).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000) ? 'Soon' : 'None'
            } : null,
            location: shelter ? `${shelter.city}, ${shelter.state}` : 'Unknown',
          };
        })
      );
      
      res.json(tasksWithDetails);
    } catch (error) {
      console.error('Error listing tasks:', error);
      res.status(500).json({ error: 'Failed to list tasks' });
    }
  });
  
  // POST /api/tasks/:id/claim - Claim a task
  app.post('/api/tasks/:id/claim', async (req, res) => {
    try {
      const { id } = req.params;
      const { volunteerEmail, name } = req.body;
      
      // Create or get volunteer
      let volunteer = await storage.getVolunteerByEmail(volunteerEmail);
      if (!volunteer) {
        volunteer = await storage.createVolunteer({
          name,
          email: volunteerEmail,
        });
      }
      
      const task = await storage.claimTask(id, volunteer.id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found or already claimed' });
      }
      
      res.json(task);
    } catch (error) {
      console.error('Error claiming task:', error);
      res.status(500).json({ error: 'Failed to claim task' });
    }
  });
  
  // POST /api/tasks/:id/done - Mark task as complete
  app.post('/api/tasks/:id/done', async (req, res) => {
    try {
      const { id } = req.params;
      
      const task = await storage.completeTask(id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found or not claimable' });
      }
      
      res.json(task);
    } catch (error) {
      console.error('Error completing task:', error);
      res.status(500).json({ error: 'Failed to complete task' });
    }
  });
  
  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    // Add CORS headers for image serving
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
  
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const httpServer = createServer(app);

  return httpServer;
}
