import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Twitter, Instagram } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Shree Radhe Advertisers" className="h-12 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Premium outdoor advertising platform connecting brands with strategic billboard and media locations across India.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/explore" className="hover:text-primary transition-colors">Explore Media</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              {/* Admin Portal Link Removed */}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Media Types</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Unipoles</li>
              <li>Hoardings</li>
              <li>Digital LED</li>
              <li>Gantries</li>
              <li>Kiosks</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a 
                  href="mailto:info@shreeradheadvertisers.com" 
                  className="hover:text-primary transition-colors"
                >
                  info@shreeradheadvertisers.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a 
                  href="tel:+919131034818" 
                  className="hover:text-primary transition-colors"
                >
                  +91 91310 34818
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Shree+Radhe+Advertisers,+Station+Road,+Near+Petrol+Pump,+Durg,+Chhattisgarh+491001" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors text-left"
                >
                  Shree Radhe Advertisers, Station Road, Near Petrol Pump<br />
                  Durg, Chhattisgarh 491001
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2024 Shree Radhe Advertisers. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}