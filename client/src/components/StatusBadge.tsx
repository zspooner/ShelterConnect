import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "Available" | "Adopted" | "Hold" | "Urgent";
  urgencyLevel?: "None" | "Soon" | "Critical";
  className?: string;
}

export default function StatusBadge({ status, urgencyLevel, className }: StatusBadgeProps) {
  const getStatusColor = () => {
    if (status === "Urgent" || urgencyLevel === "Critical") {
      return "bg-danger text-white";
    }
    if (urgencyLevel === "Soon") {
      return "bg-warning text-black";
    }
    switch (status) {
      case "Adopted":
        return "bg-success text-white";
      case "Hold":
        return "bg-warning text-black";
      case "Available":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const displayText = status === "Available" && urgencyLevel === "Critical" ? "URGENT" :
                     status === "Available" && urgencyLevel === "Soon" ? "Soon" :
                     status;

  return (
    <Badge 
      className={cn(getStatusColor(), className)}
      data-testid={`badge-status-${status.toLowerCase()}`}
    >
      {displayText}
    </Badge>
  );
}