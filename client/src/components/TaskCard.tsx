import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  id: string;
  dogName: string;
  dogPhoto: string;
  channel: "IG" | "TikTok" | "X" | "FB" | "Nextdoor";
  status: "Open" | "Claimed" | "Done" | "Expired";
  location: string;
  expiresAt: string;
  urgencyLevel?: "None" | "Soon" | "Critical";
  claimedBy?: string;
  onClaim?: () => void;
  onComplete?: () => void;
  className?: string;
}

export default function TaskCard({
  id,
  dogName,
  dogPhoto,
  channel,
  status,
  location,
  expiresAt,
  urgencyLevel,
  claimedBy,
  onClaim,
  onComplete,
  className
}: TaskCardProps) {
  const getChannelColor = () => {
    switch (channel) {
      case "IG": return "bg-pink-500 text-white";
      case "TikTok": return "bg-black text-white";
      case "X": return "bg-gray-900 text-white";
      case "FB": return "bg-blue-600 text-white";
      case "Nextdoor": return "bg-green-600 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "Open": return urgencyLevel === "Critical" ? "bg-danger text-white" : "bg-accent text-accent-foreground";
      case "Claimed": return "bg-warning text-black";
      case "Done": return "bg-success text-white";
      case "Expired": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleClaim = () => {
    console.log(`Task claimed: ${id} for ${dogName} on ${channel}`);
    onClaim?.();
  };

  const handleComplete = () => {
    console.log(`Task completed: ${id} for ${dogName} on ${channel}`);
    onComplete?.();
  };

  return (
    <Card className={cn("hover-elevate", className)} data-testid={`card-task-${id}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <img 
              src={dogPhoto} 
              alt={dogName}
              className="w-12 h-12 object-cover rounded-lg"
            />
            <div>
              <CardTitle className="text-base" data-testid={`text-dogname-${id}`}>
                {dogName}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{location}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={getChannelColor()} data-testid={`badge-channel-${channel.toLowerCase()}`}>
              {channel}
            </Badge>
            <Badge className={getStatusColor()}>
              {status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Expires {expiresAt}</span>
        </div>
        
        {claimedBy && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            <span>Claimed by {claimedBy}</span>
          </div>
        )}
        
        <div className="flex gap-2">
          {status === "Open" && (
            <Button 
              onClick={handleClaim} 
              className="flex-1"
              data-testid={`button-claim-${id}`}
            >
              Claim Task
            </Button>
          )}
          
          {status === "Claimed" && (
            <Button 
              onClick={handleComplete} 
              variant="outline" 
              className="flex-1"
              data-testid={`button-complete-${id}`}
            >
              Mark Complete
            </Button>
          )}
          
          {status === "Done" && (
            <div className="flex-1 text-center text-sm text-muted-foreground py-2">
              Task completed ✓
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}