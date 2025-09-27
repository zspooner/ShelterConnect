import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, Share, Phone, Mail, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import StatusBadge from "./StatusBadge";

interface PublicDogProfileProps {
  name: string;
  ageYears: number;
  sex: string;
  breedGuess?: string;
  weightLbs: number;
  temperament: string[];
  bio?: string;
  photoUrl: string;
  status: "Available" | "Adopted" | "Hold" | "Urgent";
  urgencyLevel?: "None" | "Soon" | "Critical";
  adoptionDeadline?: string;
  shelterName: string;
  shelterEmail: string;
  city: string;
  state: string;
  qrCodeUrl?: string;
  onInquiry?: (inquiry: any) => void;
  onShare?: (source: string) => void;
}

export default function PublicDogProfile({
  name,
  ageYears,
  sex,
  breedGuess,
  weightLbs,
  temperament,
  bio,
  photoUrl,
  status,
  urgencyLevel,
  adoptionDeadline,
  shelterName,
  shelterEmail,
  city,
  state,
  qrCodeUrl,
  onInquiry,
  onShare
}: PublicDogProfileProps) {
  const [inquiry, setInquiry] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleShare = (source: string) => {
    console.log(`Shared to ${source}`);
    onShare?.(source);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Inquiry submitted:', inquiry);
    onInquiry?.(inquiry);
  };

  const getDaysUntilDeadline = () => {
    if (!adoptionDeadline) return null;
    const deadline = new Date(adoptionDeadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilDeadline();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Image */}
      <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
        <img 
          src={photoUrl} 
          alt={`${name} - adoptable dog`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Status and Urgency */}
        <div className="absolute top-4 right-4">
          <StatusBadge status={status} urgencyLevel={urgencyLevel} />
        </div>
        
        {/* Countdown for urgent cases */}
        {daysLeft !== null && daysLeft <= 7 && (
          <div className="absolute top-4 left-4 bg-danger text-white px-3 py-1 rounded-lg text-sm font-medium">
            <Clock className="h-4 w-4 inline mr-1" />
            {daysLeft > 0 ? `${daysLeft} days left` : 'Last day!'}
          </div>
        )}
        
        {/* Share Buttons */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => handleShare('FB')}
            data-testid="button-share-fb"
          >
            <Share className="h-4 w-4 mr-1" />
            Facebook
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => handleShare('IG')}
            data-testid="button-share-ig"
          >
            <Share className="h-4 w-4 mr-1" />
            Instagram
          </Button>
        </div>
        
        {/* Dog Name */}
        <div className="absolute bottom-4 left-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white" data-testid="text-dog-name">
            {name}
          </h1>
          {adoptionDeadline && (
            <p className="text-white/90">
              Adopt by {new Date(adoptionDeadline).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dog Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">About {name}</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{ageYears}</div>
                  <div className="text-sm text-muted-foreground">
                    {ageYears === 1 ? 'Year' : 'Years'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{sex}</div>
                  <div className="text-sm text-muted-foreground">Sex</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{weightLbs}</div>
                  <div className="text-sm text-muted-foreground">Pounds</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{breedGuess || 'Mixed'}</div>
                  <div className="text-sm text-muted-foreground">Breed</div>
                </div>
              </div>
              
              {temperament.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Temperament</h3>
                  <div className="flex flex-wrap gap-2">
                    {temperament.map(trait => (
                      <Badge key={trait} variant="secondary">
                        {trait.replace(/([A-Z])/g, ' $1').trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {bio && (
                <div>
                  <h3 className="text-sm font-medium mb-2">About Me</h3>
                  <p className="text-muted-foreground">{bio}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Shelter Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contact {shelterName}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{city}, {state}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${shelterEmail}`} className="text-accent-foreground hover:underline">
                    {shelterEmail}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inquiry Form */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Interested in {name}?</h3>
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inquiry-name">Your Name *</Label>
                  <Input
                    id="inquiry-name"
                    value={inquiry.name}
                    onChange={(e) => setInquiry(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    data-testid="input-inquiry-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="inquiry-email">Email *</Label>
                  <Input
                    id="inquiry-email"
                    type="email"
                    value={inquiry.email}
                    onChange={(e) => setInquiry(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    data-testid="input-inquiry-email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="inquiry-phone">Phone</Label>
                  <Input
                    id="inquiry-phone"
                    type="tel"
                    value={inquiry.phone}
                    onChange={(e) => setInquiry(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    data-testid="input-inquiry-phone"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="inquiry-message">Message</Label>
                  <Textarea
                    id="inquiry-message"
                    value={inquiry.message}
                    onChange={(e) => setInquiry(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Tell us about your experience with dogs..."
                    className="min-h-20"
                    data-testid="textarea-inquiry-message"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  data-testid="button-submit-inquiry"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Send Inquiry
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* QR Code */}
          {qrCodeUrl && (
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium mb-4">Share This Page</h3>
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-32 h-32 mx-auto rounded-lg"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Scan to share {name}'s profile
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}