import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share, Eye } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { cn } from "@/lib/utils";

interface DogCardProps {
  id: string;
  name: string;
  ageYears: number;
  sex: string;
  breedGuess?: string;
  weightLbs: number;
  photoUrl: string;
  status: "Available" | "Adopted" | "Hold" | "Urgent";
  urgencyLevel?: "None" | "Soon" | "Critical";
  adoptionDeadline?: string;
  clicks?: number;
  inquiries?: number;
  onClick?: () => void;
  className?: string;
}

export default function DogCard({
  id,
  name,
  ageYears,
  sex,
  breedGuess,
  weightLbs,
  photoUrl,
  status,
  urgencyLevel,
  adoptionDeadline,
  clicks = 0,
  inquiries = 0,
  onClick,
  className
}: DogCardProps) {
  const handleCardClick = () => {
    console.log(`Dog card clicked: ${name}`);
    onClick?.();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Share clicked for ${name}`);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Favorite clicked for ${name}`);
  };

  return (
    <Card 
      className={cn("hover-elevate cursor-pointer", className)} 
      onClick={handleCardClick}
      data-testid={`card-dog-${id}`}
    >
      <CardHeader className="p-0">
        <div className="relative">
          <img 
            src={photoUrl} 
            alt={`${name} - adoptable dog`}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute top-2 right-2">
            <StatusBadge status={status} urgencyLevel={urgencyLevel} />
          </div>
          <div className="absolute top-2 left-2 flex gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 bg-black/20 hover:bg-black/40 text-white"
              onClick={handleShare}
              data-testid={`button-share-${id}`}
            >
              <Share className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 bg-black/20 hover:bg-black/40 text-white"
              onClick={handleFavorite}
              data-testid={`button-favorite-${id}`}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold" data-testid={`text-name-${id}`}>{name}</h3>
            {adoptionDeadline && (
              <span className="text-sm text-muted-foreground">
                Adopt by {adoptionDeadline}
              </span>
            )}
          </div>
          
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{ageYears} {ageYears === 1 ? 'year' : 'years'}</span>
            <span>{sex}</span>
            <span>{weightLbs} lbs</span>
          </div>
          
          {breedGuess && (
            <p className="text-sm text-muted-foreground">{breedGuess}</p>
          )}
          
          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span data-testid={`text-clicks-${id}`}>{clicks}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span data-testid={`text-inquiries-${id}`}>{inquiries}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}