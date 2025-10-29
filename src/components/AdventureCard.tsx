import { MapPin, Clock, DollarSign, Navigation } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Activity {
  time: string;
  place: string;
  type: string;
  description: string;
  tip?: string;
}

interface AdventureCardProps {
  title: string;
  duration: string;
  budget: string;
  description: string;
  activities: Activity[];
  transport: string;
  totalCost: string;
}

const AdventureCard = ({ 
  title, 
  duration, 
  budget, 
  description, 
  activities,
  transport,
  totalCost 
}: AdventureCardProps) => {
  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      restaurant: "bg-secondary/10 text-secondary border-secondary/20",
      cafe: "bg-accent/10 text-accent border-accent/20",
      park: "bg-primary/10 text-primary border-primary/20",
      market: "bg-secondary/10 text-secondary border-secondary/20",
    };
    return typeColors[type.toLowerCase()] || "bg-muted text-muted-foreground";
  };

  const createMapsUrl = () => {
    const locations = activities.map(a => a.place).join(" to ");
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locations)}`;
  };

  return (
    <Card className="w-full animate-scale-in shadow-medium hover:shadow-strong transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            {duration}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <DollarSign className="w-3 h-3" />
            {budget}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          {activities.map((activity, idx) => (
            <div 
              key={idx}
              className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0 w-16 text-xs font-medium text-primary pt-1">
                {activity.time}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-sm text-foreground">{activity.place}</h4>
                  <Badge variant="outline" className={`text-xs ${getTypeColor(activity.type)}`}>
                    {activity.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {activity.description}
                </p>
                {activity.tip && (
                  <p className="text-xs text-accent italic mt-1">💡 {activity.tip}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border space-y-3">
          <div className="flex items-start gap-2 text-sm">
            <Navigation className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">{transport}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-muted-foreground">Total: </span>
              <span className="font-bold text-foreground">{totalCost}</span>
            </div>
            
            <Button 
              size="sm"
              className="gap-2"
              onClick={() => window.open(createMapsUrl(), '_blank')}
            >
              <MapPin className="w-4 h-4" />
              Open in Maps
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdventureCard;
