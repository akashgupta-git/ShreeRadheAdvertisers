import { useParams, useNavigate } from "react-router-dom";
import { getMediaById } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  MapPin, 
  Maximize, 
  Lightbulb, 
  Compass, 
  Calendar,
  Mail
} from "lucide-react";

const MediaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const media = getMediaById(id || '');

  if (!media) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Media not found</h1>
          <Button onClick={() => navigate('/explore')}>
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  const statusVariant = 
    media.status === 'Available' ? 'success' :
    media.status === 'Booked' ? 'destructive' : 'warning';

  return (
    <div className="pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <img 
                src={media.image} 
                alt={media.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge variant={statusVariant} className="text-sm px-3 py-1">
                  {media.status}
                </Badge>
              </div>
            </div>

            {/* Details Grid - Adjusted to 3 columns */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-card border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Maximize className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Size</div>
                    <div className="font-medium">{media.size}</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Lightbulb className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Lighting</div>
                    <div className="font-medium">{media.lighting}</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Compass className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Facing</div>
                    <div className="font-medium">{media.facing}</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Description */}
            <Card className="p-6 bg-card border-border/50">
              <h3 className="text-lg font-semibold mb-4">Location Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Address</div>
                    <div className="text-muted-foreground">{media.address}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
                  <div>
                    <div className="text-muted-foreground">City</div>
                    <div className="font-medium">{media.city}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">District</div>
                    <div className="font-medium">{media.district}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">State</div>
                    <div className="font-medium">{media.state}</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card className="p-6 bg-card border-border/50 sticky top-24">
              <div className="mb-6">
                <Badge variant="secondary" className="mb-3">{media.type}</Badge>
                <h1 className="text-2xl font-bold mb-2">{media.name}</h1>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{media.city}, {media.state}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 mb-6">
                <div className="text-sm text-muted-foreground mb-1">Media ID</div>
                <div className="font-mono font-medium">{media.id}</div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={statusVariant}>{media.status}</Badge>
                </div>
                {/* Occupancy Rate Removed */}
              </div>

              <div className="pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground mb-1">Starting from</div>
                <div className="text-3xl font-bold mb-4">
                  ₹{media.pricePerMonth.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" size="lg" onClick={() => navigate('/contact')}>
                    <Mail className="h-4 w-4 mr-2" />
                    Inquire Now
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <Calendar className="h-4 w-4 mr-2" />
                    Check Availability
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetail;