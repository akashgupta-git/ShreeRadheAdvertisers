import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2 } from "lucide-react";
import { useSubmitContact } from "@/hooks/api/useContacts";
import { isBackendConfigured } from "@/lib/api/config";

const Contact = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitContact = useSubmitContact();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    mediaType: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to backend if configured
      if (isBackendConfigured()) {
        await submitContact.mutateAsync({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          mediaType: formData.mediaType as any,
          message: formData.message,
        });
      }
      
      setSubmitted(true);
      toast({
        title: "Inquiry Submitted!",
        description: "We'll get back to you within 24 hours.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <Card className="max-w-lg mx-auto p-8 text-center bg-card border-border/50">
            <div className="p-4 rounded-full bg-success/10 w-fit mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Thank You!</h1>
            <p className="text-muted-foreground mb-6">
              Your inquiry has been submitted successfully. Our team will contact you within 24 hours.
            </p>
            <Button onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', email: '', phone: '', company: '', mediaType: '', message: '' });
            }}>
              Submit Another Inquiry
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ready to elevate your brand visibility? Contact us for personalized advertising solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="p-6 bg-card border-border/50 hover-lift transition-colors hover:border-primary/50 group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Mail className="h-5 w-5 text-primary group-hover:text-inherit" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Email Us</h3>
                    <a href="mailto:info@shreeradheadvertisers.com" className="text-sm text-muted-foreground hover:text-primary block transition-colors">
                      info@shreeradheadvertisers.com
                    </a>
                    <a href="mailto:shreeradhecd@gmail.com" className="text-sm text-muted-foreground hover:text-primary block transition-colors">
                      shreeradhecd@gmail.com
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border-border/50 hover-lift transition-colors hover:border-success/50 group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-success/10 group-hover:bg-success group-hover:text-success-foreground transition-colors">
                    <Phone className="h-5 w-5 text-success group-hover:text-inherit" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Call Us</h3>
                    <a href="tel:+919131034818" className="text-sm text-muted-foreground hover:text-success block transition-colors">
                      +91 91310 34818
                    </a>
                    <a href="tel:+919329215205" className="text-sm text-muted-foreground hover:text-success block transition-colors">
                      +91 93292 15205
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border-border/50 hover-lift transition-colors hover:border-warning/50 group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-warning/10 group-hover:bg-warning group-hover:text-warning-foreground transition-colors">
                    <MapPin className="h-5 w-5 text-warning group-hover:text-inherit" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Visit Us</h3>
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=Shree+Radhe+Advertisers,+Station+Road,+Near+Petrol+Pump,+Durg,+Chhattisgarh+491001" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-warning block transition-colors"
                    >
                      Shree Radhe Advertisers, Station Road, Near Petrol Pump<br />
                      Durg, Chhattisgarh 491001
                    </a>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="lg:col-span-2 p-8 bg-card border-border/50">
              <h2 className="text-xl font-semibold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input 
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input 
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone"
                      type="tel"
                      placeholder="+91 99999 99999"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Business Name</Label>
                    <Input 
                      id="company"
                      placeholder="ABC Corporation"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mediaType">Interested Media Type</Label>
                  <Select 
                    value={formData.mediaType}
                    onValueChange={(v) => setFormData({ ...formData, mediaType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select media type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unipole">Unipole</SelectItem>
                      <SelectItem value="Hoarding">Hoarding</SelectItem>
                      <SelectItem value="Digital LED">Digital LED</SelectItem>
                      <SelectItem value="Gantry">Gantry</SelectItem>
                      <SelectItem value="Kiosk">Kiosk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Your Message *</Label>
                  <Textarea 
                    id="message"
                    placeholder="Tell us about your advertising requirements..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" size="lg" variant="hero" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
