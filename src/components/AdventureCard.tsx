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
    <Card className="w-full animate-scale-in bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300 border-2 border-border hover:border-primary/30">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </CardDescription>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1.5 px-3 py-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-medium">{duration}</span>
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-3 py-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="font-medium">{budget}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          {activities.map((activity, idx) => (
            <div 
              key={idx}
              className="group p-4 rounded-xl bg-background/50 hover:bg-primary/5 border border-border hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-16 text-xs font-semibold text-primary pt-1">
                  {activity.time}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {activity.place}
                    </h4>
                    <Badge variant="outline" className={`text-xs ${getTypeColor(activity.type)}`}>
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {activity.description}
                  </p>
                  {activity.tip && (
                    <p className="text-xs text-accent italic mt-1 flex items-start gap-1">
                      <span>💡</span>
                      <span>{activity.tip}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border space-y-4">
          <div className="flex items-start gap-2 text-sm p-3 rounded-lg bg-muted/30">
            <Navigation className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground text-xs leading-relaxed">{transport}</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Total: </span>
              <span className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
                {totalCost}
              </span>
            </div>
            
            <Button 
              size="sm"
              className="gap-2 shadow-medium hover:shadow-glow"
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
