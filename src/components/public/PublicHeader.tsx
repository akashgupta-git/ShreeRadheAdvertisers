import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            {/* Added cursor-pointer to ensure the hand icon appears on hover */}
            <img 
              src={logo} 
              alt="Shree Radhe Advertisers" 
              className="h-12 w-auto mix-blend-multiply cursor-pointer" 
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About Us
            </Link>
            <Link to="/explore" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Explore Media
            </Link>
            <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {/* Admin Login Removed */}
            <Button variant="hero" onClick={() => navigate('/contact')}>
              Get a Quote
            </Button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in bg-background">
            <nav className="flex flex-col gap-4">
              <Link to="/" className="text-sm font-medium px-2 py-2 hover:bg-accent rounded-lg">
                Home
              </Link>
              <Link to="/about" className="text-sm font-medium px-2 py-2 hover:bg-accent rounded-lg">
                About Us
              </Link>
              <Link to="/explore" className="text-sm font-medium px-2 py-2 hover:bg-accent rounded-lg">
                Explore Media
              </Link>
              <Link to="/contact" className="text-sm font-medium px-2 py-2 hover:bg-accent rounded-lg">
                Contact
              </Link>
              <div className="flex items-center gap-2 pt-2">
                {/* Admin Login Removed */}
                <Button variant="hero" className="flex-1" onClick={() => navigate('/contact')}>
                  Get a Quote
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}