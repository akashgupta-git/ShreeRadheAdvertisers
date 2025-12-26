import { HeroSection } from "@/components/public/HeroSection";
import { AboutSection } from "@/components/public/AboutSection";
import { MediaShowcase } from "@/components/public/MediaShowcase";
import { MediaCard } from "@/components/public/MediaCard";
import { Button } from "@/components/ui/button";
import { mediaLocations } from "@/lib/data";
import { ArrowRight, Building2, CheckCircle, Target, TrendingUp, Award, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const featuredMedia = mediaLocations.slice(0, 6);

  return (
    <>
      <HeroSection />

      {/* Media Showcase Section */}
      <MediaShowcase />

      {/* Why Choose Us Section */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMxLjIgMCAyIC44IDIgMnMtLjggMi0yIDItMi0uOC0yLTIgLjgtMiAyLTJ6IiBmaWxsPSJjdXJyZW50Q29sb3IiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-slide-up">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider mb-2 block">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">
              Why Choose <span className="gradient-text">Shree Radhe Advertisers</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Transform your outdoor advertising strategy with our comprehensive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: 'Strategic Locations', desc: 'Prime spots in high-traffic areas across major cities', color: 'primary' },
              { icon: TrendingUp, title: 'Custom Strategy', desc: 'Tailored media planning aligned with your business goals', color: 'peacock' },
              { icon: Award, title: 'Premium Quality', desc: 'High-quality displays maintained to perfection', color: 'accent' },
              { icon: Users, title: '500+ Clients', desc: 'Trusted by leading brands across industries', color: 'success' },
              { icon: CheckCircle, title: 'Easy Booking', desc: 'Streamlined process from inquiry to activation', color: 'primary' },
              { icon: Building2, title: 'Statewide Reach', desc: 'Comprehensive network covering all major districts', color: 'peacock' },
              { icon: Clock, title: '24/7 Support', desc: 'Round-the-clock assistance for all your needs', color: 'accent' },
              { icon: TrendingUp, title: 'ROI Focused', desc: 'Maximize returns on your advertising investment', color: 'success' },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="glass-card rounded-xl p-6 hover-lift animate-slide-up group"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`p-3 rounded-xl bg-${feature.color}/10 w-fit mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-6 w-6 text-${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Media Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-accent font-semibold text-sm uppercase tracking-wider mb-2 block">
                Featured Locations
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">Premium Media Spots</h2>
              <p className="text-muted-foreground">Discover premium advertising spots across India</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/explore')}>
              View All <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMedia.map((media, i) => (
              <div key={media.id} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <MediaCard media={media} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <AboutSection />

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 font-display">
            Ready to Amplify Your Brand?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Get started with Shree Radhe Advertisers today and unlock the power of strategic outdoor advertising
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" variant="hero" onClick={() => navigate('/contact')}>
              Get Started Today
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="xl" variant="outline" onClick={() => navigate('/explore')}>
              Explore Locations
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;