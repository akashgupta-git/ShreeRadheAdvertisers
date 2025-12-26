import { Link } from "react-router-dom";
import { AlertTriangle, Phone, Mail, Calendar, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { bookings, getCustomerById, getMediaById } from "@/lib/data";

export function ExpiringBookings() {
  // Get bookings expiring in next 30 days
  const today = new Date();
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringBookings = bookings
    .filter(b => {
      const endDate = new Date(b.endDate);
      return endDate >= today && endDate <= thirtyDaysLater && b.status === 'Active';
    })
    .map(b => {
      const customer = getCustomerById(b.customerId);
      const media = getMediaById(b.mediaId);
      const endDate = new Date(b.endDate);
      const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...b, customer, media, daysLeft };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return 'destructive';
    if (days <= 14) return 'warning';
    return 'secondary';
  };

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Expiring Soon - Follow Up Required
          </CardTitle>
          <Badge variant="outline" className="text-muted-foreground">
            {expiringBookings.length} bookings
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {expiringBookings.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">No bookings expiring in the next 30 days</p>
        ) : (
          expiringBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
            >
              {/* Urgency indicator */}
              <div className="shrink-0">
                <Badge variant={getUrgencyColor(booking.daysLeft)} className="whitespace-nowrap">
                  {booking.daysLeft} days left
                </Badge>
              </div>

              {/* Media info */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm truncate">{booking.media?.name || booking.mediaId}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {booking.media?.city}, {booking.media?.district}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {booking.media?.type}
                  </Badge>
                </div>

                {/* Customer info */}
                <div className="p-2 rounded bg-background/50 space-y-1">
                  <p className="text-sm font-medium">{booking.customer?.company}</p>
                  <p className="text-xs text-muted-foreground">{booking.customer?.name}</p>
                  <div className="flex items-center gap-4 pt-1">
                    <a 
                      href={`tel:${booking.customer?.phone}`}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      {booking.customer?.phone}
                    </a>
                    <a 
                      href={`mailto:${booking.customer?.email}`}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      {booking.customer?.email}
                    </a>
                  </div>
                </div>

                {/* Booking period */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{booking.startDate}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-medium text-foreground">{booking.endDate}</span>
                </div>
              </div>

              {/* Action */}
              <div className="shrink-0">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/media/${booking.mediaId}`}>View</Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
