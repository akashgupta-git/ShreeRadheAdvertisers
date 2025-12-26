import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mediaLocations } from "@/lib/data";
import { Clock, MapPin, Calendar, CheckCircle } from "lucide-react"; // Switched Wrench to Clock

const Maintenance = () => {
  const comingSoonMedia = mediaLocations.filter(m => m.status === 'Coming Soon');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Coming Soon</h1>
        <p className="text-muted-foreground">Track and manage media locations that are coming soon</p>
      </div>

      {/* Summary */}
      <Card className="p-6 bg-warning/10 border-warning/20">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning/20">
            {/* CHANGED: Icon */}
            <Clock className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">{comingSoonMedia.length}</p>
            <p className="text-sm text-muted-foreground">Media locations marked as coming soon</p>
          </div>
        </div>
      </Card>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comingSoonMedia.map((media) => (
          <Card key={media.id} className="p-6 bg-card border-border/50">
            <div className="flex items-start justify-between mb-4">
              <Badge className="bg-warning text-warning-foreground hover:bg-warning/90">Coming Soon</Badge>
              <span className="text-xs text-muted-foreground font-mono">{media.id}</span>
            </div>

            <h3 className="font-semibold mb-2">{media.name}</h3>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
              <MapPin className="h-3.5 w-3.5" />
              <span>{media.city}, {media.district}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Calendar className="h-3.5 w-3.5" />
              <span>Added: {new Date().toLocaleDateString()}</span>
            </div>

            <div className="pt-4 border-t border-border flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                View Details
              </Button>
              <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-1" />
                Make Available
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {comingSoonMedia.length === 0 && (
        <Card className="p-12 bg-card border-border/50 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
          <h3 className="text-xl font-semibold mb-2">All Clear!</h3>
          <p className="text-muted-foreground">No media locations are currently marked as coming soon.</p>
        </Card>
      )}
    </div>
  );
};

export default Maintenance;