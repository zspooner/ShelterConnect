import { OpenAI } from 'openai';
import { createCanvas, loadImage } from 'canvas';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import emojiRegex from 'emoji-regex';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface DogProfile {
  name: string;
  sex: 'Male' | 'Female';
  ageYears: number;
  breedGuess?: string;
  temperament?: string;
  bio?: string;
  euthanasiaRisk: boolean;
  adoptionDeadline?: Date;
  shelterName?: string;
  city?: string;
  state?: string;
  photoUrl: string;
  publicUrl: string;
}

export interface GeneratedContent {
  shortCaption: string;
  longCaption: string;
  xText: string;
  instagramImageUrl: string;
  storyImageUrl: string;
  qrCodeUrl: string;
}

export class ContentGenerator {
  private assetsDir: string;

  constructor() {
    this.assetsDir = path.join(process.cwd(), 'uploads', 'assets');
    if (!fs.existsSync(this.assetsDir)) {
      fs.mkdirSync(this.assetsDir, { recursive: true });
    }
  }

  /**
   * Remove emojis from text to comply with design guidelines
   */
  private removeEmojis(text: string): string {
    const regex = emojiRegex();
    return text.replace(regex, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Generate AI-powered captions for adoption posts
   */
  async generateCaptions(dog: DogProfile): Promise<{
    shortCaption: string;
    longCaption: string;
    xText: string;
  }> {
    const urgencyLevel = dog.euthanasiaRisk ? 'URGENT - at risk' : 
      (dog.adoptionDeadline && new Date(dog.adoptionDeadline).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000) ? 'time-sensitive' : 'standard';

    const prompt = `Create compelling adoption captions for a shelter dog with these details:
- Name: ${dog.name}
- Age: ${dog.ageYears} years old
- Sex: ${dog.sex}
- Breed: ${dog.breedGuess || 'Mixed breed'}
- Temperament: ${dog.temperament || 'Friendly'}
- Bio: ${dog.bio || 'Looking for a loving home'}
- Urgency: ${urgencyLevel}
- Location: ${dog.city}, ${dog.state}
- Shelter: ${dog.shelterName}
- Deadline: ${dog.adoptionDeadline?.toDateString() || 'None specified'}

Generate 3 captions:
1. SHORT (under 150 characters) - Instagram/social friendly
2. LONG (2-3 sentences) - detailed but engaging  
3. X/TWITTER (under 280 characters) - platform optimized

Make them emotional, urgent when needed, and include a clear call-to-action. Do NOT use any emojis - use only text.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system", 
            content: "You are an expert copywriter specializing in animal rescue and adoption content. Create compelling, emotional captions that drive adoptions while being authentic and respectful. NEVER use emojis in your output."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Parse the response to extract the three captions
      const lines = response.split('\n').filter(line => line.trim());
      
      let shortCaption = '';
      let longCaption = '';
      let xText = '';
      
      let currentSection = '';
      for (const line of lines) {
        if (line.toLowerCase().includes('short') || line.startsWith('1.')) {
          currentSection = 'short';
          shortCaption = line.replace(/^1\.\s*SHORT.*?-\s*/, '').replace(/^.*?:\s*/, '').trim();
        } else if (line.toLowerCase().includes('long') || line.startsWith('2.')) {
          currentSection = 'long';
          longCaption = line.replace(/^2\.\s*LONG.*?-\s*/, '').replace(/^.*?:\s*/, '').trim();
        } else if (line.toLowerCase().includes('x/twitter') || line.toLowerCase().includes('twitter') || line.startsWith('3.')) {
          currentSection = 'x';
          xText = line.replace(/^3\.\s*X\/TWITTER.*?-\s*/, '').replace(/^.*?:\s*/, '').trim();
        } else if (currentSection && line.trim() && !line.match(/^\d+\./)) {
          // Continue the current caption
          if (currentSection === 'short') shortCaption += ' ' + line.trim();
          else if (currentSection === 'long') longCaption += ' ' + line.trim();
          else if (currentSection === 'x') xText += ' ' + line.trim();
        }
      }

      // Fallback captions if parsing fails
      if (!shortCaption) {
        shortCaption = `${dog.name} needs a home! ${dog.ageYears}yr ${dog.sex.toLowerCase()} ${dog.breedGuess || 'mixed breed'} in ${dog.city}, ${dog.state}. ${urgencyLevel === 'URGENT - at risk' ? 'URGENT' : 'Apply today!'} - link`;
      }
      
      if (!longCaption) {
        longCaption = `Meet ${dog.name}, a wonderful ${dog.ageYears}-year-old ${dog.sex.toLowerCase()} ${dog.breedGuess || 'mixed breed'} looking for love in ${dog.city}, ${dog.state}. ${dog.temperament ? dog.temperament + '.' : ''} ${dog.bio || `${dog.name} is ready to bring joy to the right family.`} ${urgencyLevel === 'URGENT - at risk' ? 'Time is critical - please share and apply!' : 'Ready to adopt? Contact us today!'}`;
      }
      
      if (!xText) {
        xText = shortCaption.slice(0, 280);
      }

      // Ensure character limits and remove any emojis
      shortCaption = this.removeEmojis(shortCaption.slice(0, 150));
      longCaption = this.removeEmojis(longCaption);
      xText = this.removeEmojis(xText.slice(0, 280));

      return { shortCaption, longCaption, xText };
    } catch (error) {
      console.error('Error generating captions:', error);
      
      // Fallback captions - also sanitized for emojis
      const fallbackShort = `${dog.name} needs a home! ${dog.ageYears}yr ${dog.sex.toLowerCase()} in ${dog.city}, ${dog.state}. ${urgencyLevel === 'URGENT - at risk' ? 'URGENT' : 'Apply today!'}`;
      const fallbackLong = `Meet ${dog.name}, a ${dog.ageYears}-year-old ${dog.sex.toLowerCase()} ${dog.breedGuess || 'mixed breed'} in ${dog.city}, ${dog.state}. ${dog.bio || 'Looking for a loving home!'} Contact the shelter to learn more!`;
      
      return {
        shortCaption: this.removeEmojis(fallbackShort),
        longCaption: this.removeEmojis(fallbackLong),
        xText: this.removeEmojis(fallbackShort.slice(0, 280)),
      };
    }
  }

  /**
   * Create Instagram square post image (1080x1080)
   */
  async createInstagramImage(dog: DogProfile): Promise<string> {
    const canvas = createCanvas(1080, 1080);
    const ctx = canvas.getContext('2d');

    try {
      // Load dog photo
      const dogImagePath = path.join(process.cwd(), dog.photoUrl.replace(/^\//, ''));
      const dogImage = await loadImage(dogImagePath);

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
      gradient.addColorStop(0, '#1e293b'); // slate-800
      gradient.addColorStop(1, '#0f172a'); // slate-900
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1080);

      // Dog photo (circular, centered)
      const photoSize = 600;
      const photoX = (1080 - photoSize) / 2;
      const photoY = 120;
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(photoX + photoSize/2, photoY + photoSize/2, photoSize/2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(dogImage, photoX, photoY, photoSize, photoSize);
      ctx.restore();

      // White border around photo
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(photoX + photoSize/2, photoY + photoSize/2, photoSize/2 + 4, 0, Math.PI * 2);
      ctx.stroke();

      // Dog name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(dog.name, 540, 800);

      // Age and breed
      ctx.font = '36px Arial';
      const details = `${dog.ageYears} ${dog.ageYears === 1 ? 'year' : 'years'} • ${dog.sex} • ${dog.breedGuess || 'Mixed breed'}`;
      ctx.fillText(details, 540, 860);

      // Location
      ctx.font = '32px Arial';
      ctx.fillStyle = '#10b981'; // emerald-500
      ctx.fillText(`${dog.city}, ${dog.state}`, 540, 910);

      // Urgency badge if needed
      if (dog.euthanasiaRisk) {
        ctx.fillStyle = '#dc2626'; // red-600
        ctx.fillRect(50, 50, 280, 80);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('URGENT', 70, 105);
      }

      // Save image
      const filename = `ig-${dog.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
      const filepath = path.join(this.assetsDir, filename);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(filepath, buffer);

      return `/uploads/assets/${filename}`;
    } catch (error) {
      console.error('Error creating Instagram image:', error);
      
      // Create a simple text-based fallback
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 1080, 1080);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 64px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(dog.name, 540, 500);
      ctx.font = '36px Arial';
      ctx.fillText('Available for Adoption', 540, 580);
      
      const filename = `ig-fallback-${dog.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
      const filepath = path.join(this.assetsDir, filename);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(filepath, buffer);

      return `/uploads/assets/${filename}`;
    }
  }

  /**
   * Create Instagram story image (1080x1920)
   */
  async createStoryImage(dog: DogProfile): Promise<string> {
    const canvas = createCanvas(1080, 1920);
    const ctx = canvas.getContext('2d');

    try {
      // Load dog photo
      const dogImagePath = path.join(process.cwd(), dog.photoUrl.replace(/^\//, ''));
      const dogImage = await loadImage(dogImagePath);

      // Background image (full screen)
      ctx.drawImage(dogImage, -100, -100, 1280, 2120);

      // Dark overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, 1080, 1920);

      // Main dog photo (larger, centered)
      const photoSize = 700;
      const photoX = (1080 - photoSize) / 2;
      const photoY = 300;
      
      ctx.save();
      ctx.beginPath();
      ctx.rect(photoX, photoY, photoSize, photoSize);
      ctx.clip();
      ctx.drawImage(dogImage, photoX, photoY, photoSize, photoSize);
      ctx.restore();

      // White border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.strokeRect(photoX - 3, photoY - 3, photoSize + 6, photoSize + 6);

      // Header text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('NEEDS A HOME', 540, 200);

      // Dog name
      ctx.font = 'bold 86px Arial';
      ctx.fillText(dog.name, 540, 1150);

      // Details
      ctx.font = '42px Arial';
      ctx.fillText(`${dog.ageYears} years • ${dog.sex} • ${dog.breedGuess || 'Mixed breed'}`, 540, 1220);

      // Location
      ctx.font = '38px Arial';
      ctx.fillStyle = '#10b981'; // emerald-500
      ctx.fillText(`${dog.city}, ${dog.state}`, 540, 1280);

      // Call to action
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('Swipe up to adopt!', 540, 1380);

      // Urgency badge
      if (dog.euthanasiaRisk) {
        ctx.fillStyle = '#dc2626'; // red-600
        ctx.fillRect(90, 100, 900, 80);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.fillText('URGENT - TIME SENSITIVE', 540, 155);
      }

      // Save image
      const filename = `story-${dog.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
      const filepath = path.join(this.assetsDir, filename);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(filepath, buffer);

      return `/uploads/assets/${filename}`;
    } catch (error) {
      console.error('Error creating story image:', error);
      
      // Create a simple fallback
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 1080, 1920);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(dog.name, 540, 900);
      ctx.font = '48px Arial';
      ctx.fillText('Available for Adoption', 540, 1000);
      ctx.fillText(`${dog.city}, ${dog.state}`, 540, 1080);
      
      const filename = `story-fallback-${dog.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
      const filepath = path.join(this.assetsDir, filename);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(filepath, buffer);

      return `/uploads/assets/${filename}`;
    }
  }

  /**
   * Generate QR code linking to public dog profile
   */
  async generateQRCode(dog: DogProfile): Promise<string> {
    try {
      const filename = `qr-${dog.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
      const filepath = path.join(this.assetsDir, filename);

      await QRCode.toFile(filepath, dog.publicUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e293b', // slate-800
          light: '#ffffff'
        }
      });

      return `/uploads/assets/${filename}`;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Generate all content for a dog
   */
  async generateAllContent(dog: DogProfile): Promise<GeneratedContent> {
    try {
      // Generate captions
      const captions = await this.generateCaptions(dog);
      
      // Generate images and QR code in parallel
      const [instagramImageUrl, storyImageUrl, qrCodeUrl] = await Promise.all([
        this.createInstagramImage(dog),
        this.createStoryImage(dog),
        this.generateQRCode(dog)
      ]);

      return {
        shortCaption: captions.shortCaption,
        longCaption: captions.longCaption,
        xText: captions.xText,
        instagramImageUrl,
        storyImageUrl,
        qrCodeUrl
      };
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }
}