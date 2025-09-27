import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  description,
  trend,
  trendValue,
  icon,
  className
}: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up": return "text-success";
      case "down": return "text-danger";
      default: return "text-muted-foreground";
    }
  };

  const getTrendSymbol = () => {
    switch (trend) {
      case "up": return "↗";
      case "down": return "↙";
      default: return "";
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`text-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </div>
        {(description || trendValue) && (
          <div className="flex items-center gap-2 text-xs">
            {description && (
              <span className="text-muted-foreground">{description}</span>
            )}
            {trendValue && (
              <span className={cn("flex items-center", getTrendColor())}>
                {getTrendSymbol()} {trendValue}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}