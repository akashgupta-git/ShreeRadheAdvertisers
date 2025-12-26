import { Link } from "react-router-dom";
import { MediaLocation } from "@/lib/data"; 
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, Maximize, Lightbulb } from "lucide-react";

interface MediaCardProps {
  media: MediaLocation; 
}

export function MediaCard({ media }: MediaCardProps) {
  // Helper to determine status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-600 hover:bg-green-700 text-white border-none";
      case "Booked":
        return "bg-red-600 hover:bg-red-700 text-white border-none";
      case "Coming Soon": 
        return "bg-yellow-500 hover:bg-yellow-600 text-black border-none";
      default:
        return "bg-slate-800 text-white";
    }
  };

  return (
    <Card className="group overflow-hidden border-border/50 bg-card hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={media.image}
          alt={media.name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Top Left: Status Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className={`px-3 py-1 text-xs font-semibold shadow-md ${getStatusColor(media.status)}`}>
            {media.status}
          </Badge>
        </div>

        {/* Top Right: Media Type Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="bg-white text-slate-900 border-none shadow-md px-3 py-1 font-bold hover:bg-white/90">
            {media.type}
          </Badge>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
              {media.name}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1 text-primary" />
              <span className="line-clamp-1">{media.city}, {media.district}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-grow">
        <div className="grid grid-cols-2 gap-3 text-sm mt-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Maximize className="h-4 w-4 text-primary" />
            <span className="font-medium text-xs">{media.size}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span className="font-medium text-xs">{media.lighting}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/50 mt-auto bg-muted/10">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">Starting from</span>
          <span className="text-lg font-bold text-primary">₹{media.pricePerMonth}<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
        </div>
        <Button size="sm" asChild className="rounded-full px-4 shadow-sm hover:shadow-md transition-all">
          <Link to={`/media/${media.id}`}>
            View Details <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}