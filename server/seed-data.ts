import { storage } from "./storage";
import { hashPassword } from "./auth";
import crypto from "crypto";
import path from "path";
import fs from "fs";

// Validate that text doesn't contain emojis
import emojiRegex from 'emoji-regex';
const validateNoEmojis = (text: string): boolean => {
  const regex = emojiRegex();
  return !regex.test(text);
};

// Sample dog names without emojis
const dogNames = [
  "Luna", "Max", "Bella", "Charlie", "Lucy", "Cooper", "Sadie", "Rocky", 
  "Molly", "Tucker", "Daisy", "Bear", "Rosie", "Jack", "Lola", "Duke",
  "Sophie", "Zeus", "Lily", "Milo", "Ruby", "Oscar", "Penny", "Leo"
];

// Sample breed guesses
const breedGuesses = [
  "Labrador Retriever Mix",
  "German Shepherd Mix", 
  "Pit Bull Terrier Mix",
  "Golden Retriever Mix",
  "Husky Mix",
  "Beagle Mix",
  "Border Collie Mix",
  "Rottweiler Mix",
  "Boxer Mix",
  "Australian Cattle Dog Mix",
  "Chihuahua Mix",
  "Poodle Mix"
];

// Sample temperament traits (without emojis)
const temperamentTraits = [
  "Friendly", "Energetic", "Calm", "Playful", "Gentle", "Loyal", 
  "Smart", "Protective", "Independent", "Affectionate", "Alert", 
  "Patient", "Active", "Social", "Curious", "Brave"
];

// Sample bio templates
const bioTemplates = [
  "This sweet {name} is looking for a loving home! {name} is {age} years old and weighs about {weight} pounds. {personality} Perfect for families who enjoy an active lifestyle.",
  "{name} is a wonderful {breed} who loves people and would make a great addition to any family. At {age} years old, {name} has the perfect balance of energy and calmness.",
  "Meet {name}! This {age}-year-old sweetheart is ready to find their forever family. {name} loves walks, playing, and snuggling. Great with kids and other pets!",
  "{name} is a special dog looking for a special family. This {breed} mix is {age} years old and has so much love to give. {personality}",
  "Looking for a loyal companion? {name} might be perfect for you! This {age}-year-old {breed} is house-trained, walks well on a leash, and loves belly rubs."
];

// Generate slug from name
const generateSlug = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
};

// Sample shelter data
const sampleShelters = [
  {
    name: "Happy Tails Animal Rescue",
    email: "admin@happytails.org",
    password: crypto.randomBytes(32).toString('hex'),
    city: "Austin",
    state: "Texas"
  },
  {
    name: "Paws & Hearts Shelter",
    email: "contact@pawshearts.org",
    password: crypto.randomBytes(32).toString('hex'),
    city: "Portland",
    state: "Oregon"
  },
  {
    name: "Second Chance Animal Sanctuary",
    email: "info@secondchance.org",
    password: crypto.randomBytes(32).toString('hex'),
    city: "Denver",
    state: "Colorado"
  }
];

// Sample volunteer data
const sampleVolunteers = [
  {
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    city: "Austin",
    state: "Texas"
  },
  {
    name: "Mike Chen", 
    email: "mike.chen@email.com",
    city: "Portland",
    state: "Oregon"
  },
  {
    name: "Emma Williams",
    email: "emma.w@email.com", 
    city: "Denver",
    state: "Colorado"
  },
  {
    name: "David Rodriguez",
    email: "d.rodriguez@email.com",
    city: "Austin", 
    state: "Texas"
  },
  {
    name: "Lisa Park",
    email: "lisa.park@email.com",
    city: "Portland",
    state: "Oregon" 
  }
];

// Sample adoption inquiry data
const inquiryMessages = [
  "Hi! I'm very interested in adopting this sweet dog. I have experience with dogs and would love to provide a loving home.",
  "Hello, I saw your listing and would like to know more about this dog. I have a fenced yard and work from home.",
  "We are a family of four looking to add a furry member to our family. This dog looks perfect for us!",
  "I'm interested in meeting this dog. I live alone and am looking for a loyal companion.",
  "This dog looks wonderful! I have two other dogs and think they would get along great."
];

export async function seedDatabase(): Promise<void> {
  console.log("Starting database seeding...");

  try {
    // 1. Create sample shelters
    console.log("Creating sample shelters...");
    const createdShelters = [];
    
    for (const shelterData of sampleShelters) {
      if (!validateNoEmojis(shelterData.name) || !validateNoEmojis(shelterData.city) || !validateNoEmojis(shelterData.state)) {
        console.error(`Skipping shelter with emojis: ${shelterData.name}`);
        continue;
      }

      const hashedPassword = await hashPassword(shelterData.password);
      const shelter = await storage.createUser({
        email: shelterData.email,
        password: hashedPassword,
        name: shelterData.name,
        city: shelterData.city,
        state: shelterData.state,
      });
      createdShelters.push(shelter);
      console.log(`Created shelter: ${shelter.name}`);
    }

    // 2. Create sample volunteers  
    console.log("Creating sample volunteers...");
    const createdVolunteers = [];
    
    for (const volunteerData of sampleVolunteers) {
      if (!validateNoEmojis(volunteerData.name) || !validateNoEmojis(volunteerData.city || '') || !validateNoEmojis(volunteerData.state || '')) {
        console.error(`Skipping volunteer with emojis: ${volunteerData.name}`);
        continue;
      }

      const volunteer = await storage.createVolunteer(volunteerData);
      createdVolunteers.push(volunteer);
      console.log(`Created volunteer: ${volunteer.name}`);
    }

    // 3. Create sample dog profiles
    console.log("Creating sample dog profiles...");
    const createdDogs = [];
    
    for (let i = 0; i < 10; i++) {
      const shelterIndex = i % createdShelters.length;
      const shelter = createdShelters[shelterIndex];
      
      const name = dogNames[i % dogNames.length];
      const breedGuess = breedGuesses[Math.floor(Math.random() * breedGuesses.length)];
      const sex = Math.random() > 0.5 ? 'Male' : 'Female';
      const ageYears = Math.random() * 8 + 0.5; // 0.5 to 8.5 years
      const weightLbs = Math.random() * 80 + 10; // 10 to 90 pounds
      
      // Generate temperament (3-4 traits)
      const shuffledTraits = [...temperamentTraits].sort(() => 0.5 - Math.random());
      const selectedTraits = shuffledTraits.slice(0, 3 + Math.floor(Math.random() * 2));
      const temperament = selectedTraits.join(', ');
      
      // Generate bio
      const bioTemplate = bioTemplates[Math.floor(Math.random() * bioTemplates.length)];
      const personality = `${selectedTraits[0]} and ${selectedTraits[1].toLowerCase()}.`;
      const bio = bioTemplate
        .replace(/{name}/g, name)
        .replace(/{age}/g, Math.floor(ageYears).toString())
        .replace(/{weight}/g, Math.floor(weightLbs).toString())
        .replace(/{breed}/g, breedGuess)
        .replace(/{personality}/g, personality);

      // Validate no emojis in generated content
      if (!validateNoEmojis(name) || !validateNoEmojis(bio) || !validateNoEmojis(temperament) || !validateNoEmojis(breedGuess)) {
        console.error(`Skipping dog with emojis: ${name}`);
        continue;
      }

      // Set urgency and deadline
      const urgencyRandom = Math.random();
      let urgencyLevel: "Low" | "Medium" | "High" | "Critical";
      let euthanasiaRisk = false;
      let adoptionDeadline: Date | null = null;

      if (urgencyRandom < 0.1) {
        urgencyLevel = "Critical";
        euthanasiaRisk = true;
        adoptionDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
      } else if (urgencyRandom < 0.3) {
        urgencyLevel = "High";
        adoptionDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 2 weeks
      } else if (urgencyRandom < 0.7) {
        urgencyLevel = "Medium";
      } else {
        urgencyLevel = "Low";
      }

      const dogData = {
        shelterId: shelter.id,
        name,
        slug: generateSlug(name) + '-' + i,
        ageYears,
        sex,
        breedGuess,
        weightLbs,
        temperament,
        bio,
        photoUrl: `/uploads/dogs/happy_dogs_various_b_${['7e276494', '357e1ae5', '3bf0ae69', '1546abf6', 'a26f9041'][i % 5]}.jpg`,
        euthanasiaRisk,
        adoptionDeadline,
        urgencyLevel,
        status: "Available" as const,
        intakeDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random intake date within last 90 days
      };

      const dog = await storage.createDog(dogData);
      createdDogs.push(dog);
      console.log(`Created dog: ${dog.name} (${dog.urgencyLevel} urgency)`);
    }

    // 4. Create sample amplify tasks
    console.log("Creating sample amplify tasks...");
    const channels = ['IG', 'X', 'FB', 'Nextdoor'];
    const taskStatuses = ['Open', 'Claimed', 'Done'];
    
    for (const dog of createdDogs) {
      // Create 2-4 tasks per dog
      const numTasks = 2 + Math.floor(Math.random() * 3);
      
      for (let j = 0; j < numTasks; j++) {
        const channel = channels[Math.floor(Math.random() * channels.length)];
        const status = taskStatuses[Math.floor(Math.random() * taskStatuses.length)];
        
        let volunteerId = null;
        if (status === 'Claimed' || status === 'Done') {
          const volunteer = createdVolunteers[Math.floor(Math.random() * createdVolunteers.length)];
          volunteerId = volunteer.id;
        }

        const task = await storage.createAmplifyTask({
          dogId: dog.id,
          volunteerId,
          channel,
          status,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          shareUrl: status === 'Done' ? `https://example.com/shared/${dog.slug}` : null,
        });
        
        console.log(`Created ${status} ${channel} task for ${dog.name}`);
      }
    }

    // 5. Create sample adoption inquiries
    console.log("Creating sample adoption inquiries...");
    const inquirerNames = ["John Smith", "Maria Garcia", "Robert Johnson", "Jennifer Lee", "Michael Brown"];
    
    for (const dog of createdDogs) {
      // 1-3 inquiries per dog
      const numInquiries = Math.floor(Math.random() * 3) + 1;
      
      for (let k = 0; k < numInquiries; k++) {
        const inquirerName = inquirerNames[Math.floor(Math.random() * inquirerNames.length)];
        const message = inquiryMessages[Math.floor(Math.random() * inquiryMessages.length)];
        
        if (!validateNoEmojis(inquirerName) || !validateNoEmojis(message)) {
          console.error(`Skipping inquiry with emojis for dog: ${dog.name}`);
          continue;
        }

        const inquiry = await storage.createInquiry({
          dogId: dog.id,
          name: inquirerName,
          email: `${inquirerName.toLowerCase().replace(' ', '.')}@email.com`,
          phone: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          message,
        });
        
        console.log(`Created inquiry for ${dog.name} from ${inquirerName}`);
      }
    }

    // 6. Create sample click tracking data
    console.log("Creating sample click tracking data...");
    const sources = ['IG', 'X', 'FB', 'Direct', 'Other'];
    
    for (const dog of createdDogs) {
      // 5-25 clicks per dog
      const numClicks = 5 + Math.floor(Math.random() * 21);
      
      for (let l = 0; l < numClicks; l++) {
        const source = sources[Math.floor(Math.random() * sources.length)];
        const fakeIP = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        const ipHash = crypto.createHash('sha256').update(fakeIP + 'salt').digest('hex');
        
        await storage.recordClick(dog.id, source, ipHash);
      }
      
      console.log(`Created ${numClicks} clicks for ${dog.name}`);
    }

    console.log("Database seeding completed successfully!");
    console.log(`Created: ${createdShelters.length} shelters, ${createdVolunteers.length} volunteers, ${createdDogs.length} dogs`);

  } catch (error) {
    console.error("Error during database seeding:", error);
    throw error;
  }
}

// Create placeholder dog images
export async function createPlaceholderImages(): Promise<void> {
  console.log("Creating placeholder dog images...");
  
  const uploadsDir = path.join(process.cwd(), 'uploads', 'dogs');
  
  // Ensure directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Create simple colored placeholder images (using SVG converted to data URLs)
  const placeholderColors = ['#8B7355', '#A0522D', '#D2691E', '#CD853F', '#F4A460'];
  
  for (let i = 1; i <= 5; i++) {
    const color = placeholderColors[i - 1];
    const svgContent = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="${color}"/>
        <circle cx="200" cy="150" r="30" fill="white"/>
        <circle cx="170" cy="140" r="8" fill="black"/>
        <circle cx="230" cy="140" r="8" fill="black"/>
        <ellipse cx="200" cy="160" rx="6" ry="4" fill="black"/>
        <path d="M 180 180 Q 200 200 220 180" stroke="black" stroke-width="3" fill="none"/>
        <text x="200" y="320" text-anchor="middle" fill="white" font-size="24" font-family="Arial">
          Placeholder Dog ${i}
        </text>
      </svg>
    `;
    
    const filename = `placeholder-dog-${i}.jpg`;
    const filepath = path.join(uploadsDir, filename);
    
    // For now, just create a simple text file as placeholder
    // In a real implementation, you'd convert SVG to JPG using a library like sharp
    fs.writeFileSync(filepath, svgContent);
    console.log(`Created placeholder image: ${filename}`);
  }
}

// Function to run seeding
export async function runSeeding(): Promise<void> {
  try {
    await createPlaceholderImages();
    await seedDatabase();
    console.log("All seeding operations completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}