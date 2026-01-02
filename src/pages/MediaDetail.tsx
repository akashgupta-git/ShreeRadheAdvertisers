/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // Added for loading state
import { 
  ArrowLeft, 
  MapPin, 
  Maximize, 
  Lightbulb, 
  Compass, 
  Calendar,
  Mail,
  Loader2
} from "lucide-react";

// --- UPDATED IMPORTS ---
import { useMediaById } from "@/hooks/api/useMedia";
import { adaptMediaLocation } from "@/lib/services/dataService";
import { isBackendConfigured } from "@/lib/api/config";

const MediaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 1. FETCH FROM API (MongoDB)
  const { data: apiMedia, isLoading } = useMediaById(id || '');

  // 2. ADAPT DATA (Ensures database fields match your UI names like 'image')
  const media = apiMedia ? adaptMediaLocation(apiMedia) : null;

  // 3. LOADING STATE
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 4. NOT FOUND STATE
  if (!media) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Media record not found</h1>
          <p className="text-muted-foreground mb-6">The billboard details could not be retrieved from the database.</p>
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
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Image Section */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
              <img 
                src={media.imageUrl || (media as any).image} 
                alt={media.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge variant={statusVariant as any} className="text-sm px-3 py-1">
                  {media.status}
                </Badge>
              </div>
            </div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-card border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10"><Maximize className="h-4 w-4 text-primary" /></div>
                  <div>
                    <div className="text-xs text-muted-foreground">Size</div>
                    <div className="font-medium">{media.size}</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100"><Lightbulb className="h-4 w-4 text-orange-600" /></div>
                  <div>
                    <div className="text-xs text-muted-foreground">Lighting</div>
                    <div className="font-medium">{media.lighting}</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100"><Compass className="h-4 w-4 text-green-600" /></div>
                  <div>
                    <div className="text-xs text-muted-foreground">Facing</div>
                    <div className="font-medium">{media.facing}</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Location Details */}
            <Card className="p-6 bg-card border-border/50">
              <h3 className="text-lg font-semibold mb-4">Location Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Address</div>
                    <div className="text-muted-foreground">{media.address || 'Address information pending'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
                  <div><div className="text-muted-foreground">City</div><div className="font-medium">{media.city}</div></div>
                  <div><div className="text-muted-foreground">District</div><div className="font-medium">{media.district}</div></div>
                  <div><div className="text-muted-foreground">State</div><div className="font-medium">{media.state}</div></div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
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

              <div className="pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground mb-1">Starting from</div>
                <div className="text-3xl font-bold mb-4">
                  ₹{media.pricePerMonth?.toLocaleString('en-IN')}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" size="lg" onClick={() => navigate('/contact')}>
                    <Mail className="h-4 w-4 mr-2" /> Inquire Now
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <Calendar className="h-4 w-4 mr-2" /> Check Availability
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