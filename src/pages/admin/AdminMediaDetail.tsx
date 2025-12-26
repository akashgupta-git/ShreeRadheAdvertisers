import { useParams, useNavigate } from "react-router-dom";
import { getMediaById } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  MapPin, 
  Maximize, 
  Lightbulb, 
  Compass, 
  Calendar,
  Edit,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { useMediaById } from "@/hooks/api/useMedia";
import { isBackendConfigured } from "@/lib/api/config";
import { adaptMediaLocation } from "@/lib/services/dataService";

const AdminMediaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Try API first if backend is configured
  const { data: apiMedia, isLoading } = useMediaById(id || '');
  
  // Use API data if available, otherwise fall back to static data
  const media = isBackendConfigured() && apiMedia 
    ? adaptMediaLocation(apiMedia as any)
    : getMediaById(id || '');

  // Show loading state when fetching from API
  if (isBackendConfigured() && isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Media not found</h1>
        <Button onClick={() => navigate('/admin/media')}>Back to Media</Button>
      </div>
    );
  }

  const statusVariant = 
    media.status === 'Available' ? 'success' :
    media.status === 'Booked' ? 'destructive' : 'warning';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{media.name}</h1>
              <Badge variant={statusVariant}>{media.status}</Badge>
            </div>
            <p className="text-muted-foreground font-mono">{media.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Manage Availability
          </Button>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Media
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <Card className="overflow-hidden bg-card border-border/50">
            <img 
              src={media.image} 
              alt={media.name}
              className="w-full aspect-video object-cover"
            />
          </Card>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Maximize, label: 'Size', value: media.size, color: 'primary' },
              { icon: Lightbulb, label: 'Lighting', value: media.lighting, color: 'warning' },
              { icon: Compass, label: 'Facing', value: media.facing, color: 'success' },
              { icon: MapPin, label: 'District', value: media.district, color: 'destructive' },
            ].map((spec) => (
              <Card key={spec.label} className="p-4 bg-card border-border/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${spec.color}/10`}>
                    <spec.icon className={`h-4 w-4 text-${spec.color}`} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{spec.label}</div>
                    <div className="font-medium">{spec.value}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Booking Timeline */}
          <Card className="p-6 bg-card border-border/50">
            <h3 className="text-lg font-semibold mb-4">Booking History</h3>
            <div className="space-y-4">
              {media.bookedDates && media.bookedDates.length > 0 ? (
                media.bookedDates.map((booking, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <div className="flex-1">
                      <div className="font-medium">Booked Period</div>
                      <div className="text-sm text-muted-foreground">{booking.start} to {booking.end}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No booking history available</p>
                </div>
              )}
            </div>
          </Card>

          {/* AI Insight */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent border-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">AI Performance Insight</h3>
                <p className="text-sm text-muted-foreground">
                  This {media.type.toLowerCase()} shows <span className="text-foreground font-medium">high demand during summer months (March–June)</span> and 
                  remains underutilized during monsoon season. Consider offering promotional rates 
                  during July–September to improve occupancy. The high traffic location 
                  makes it ideal for brand awareness campaigns.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location Info */}
          <Card className="p-6 bg-card border-border/50">
            <h3 className="font-semibold mb-4">Location Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Address</div>
                  <div className="text-muted-foreground">{media.address}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                <div>
                  <div className="text-muted-foreground">City</div>
                  <div className="font-medium">{media.city}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">District</div>
                  <div className="font-medium">{media.district}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-muted-foreground">State</div>
                  <div className="font-medium">{media.state}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Metrics */}
          <Card className="p-6 bg-card border-border/50">
            <h3 className="font-semibold mb-4">Performance Metrics</h3>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Occupancy Rate</span>
                  <span className="font-medium">{media.occupancyRate}%</span>
                </div>
                <Progress value={media.occupancyRate} className="h-2" />
              </div>
              <div className="flex items-center justify-between py-3 border-t border-border">
                <span className="text-sm text-muted-foreground">Total Days Booked</span>
                <span className="font-medium">{media.totalDaysBooked} days</span>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-border">
                <span className="text-sm text-muted-foreground">Monthly Rate</span>
                <span className="font-medium">₹{media.pricePerMonth.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-border">
                <span className="text-sm text-muted-foreground">Estimated Revenue</span>
                <span className="font-medium text-success">
                  ₹{((media.pricePerMonth * 12 * media.occupancyRate) / 100).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Type Badge */}
          <Card className="p-6 bg-card border-border/50">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Media Type</div>
                <div className="text-xl font-bold">{media.type}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminMediaDetail;
