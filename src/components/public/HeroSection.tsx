import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import unipoleImg from "@/assets/media/unipole.jpg";
import ledScreenImg from "@/assets/media/led-screen.jpg";
import hoardingImg from "@/assets/media/hoarding.jpg";

const heroImages = [
  { src: unipoleImg, alt: "Unipole Advertisement" },
  { src: ledScreenImg, alt: "LED Screen Display" },
  { src: hoardingImg, alt: "Highway Hoarding" },
];

// Helper Component for Dynamic Counting
const Counter = ({ end, duration = 4000 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth effect (easeOutExpo)
      const easeOut = 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure it lands exactly on the end number
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return <span>{count}+</span>;
};

export function HeroSection() {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % heroImages.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20">
      {/* Background Image Carousel */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={image.alt}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
      </div>

      {/* Carousel Navigation */}
      <button
        onClick={prevImage}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-background/20 backdrop-blur-sm border border-white/10 text-white hover:bg-background/40 transition-colors hidden md:flex"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextImage}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-background/20 backdrop-blur-sm border border-white/10 text-white hover:bg-background/40 transition-colors hidden md:flex"
        aria-label="Next image"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Carousel Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentImage
                ? "w-8 bg-primary"
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Animated Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-peacock/15 rounded-full blur-3xl animate-float delay-300" />

      <div className="container mx-auto px-4 relative z-10 mt-12">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Heading */}
          <h1 className="flex flex-col items-center justify-center mb-8 animate-slide-up delay-100 font-display tracking-tight">
            <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-2 sm:mb-4">
              Chhattisgarh's Premier
            </span>
            <span className="block text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tighter gradient-text leading-tight pb-2">
              Outdoor Advertising Network
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up delay-200">
            Access premium billboard, unipole, and digital LED locations across major cities. 
            Data-driven outdoor advertising that delivers measurable results.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up delay-300">
            <Button size="xl" variant="hero" onClick={() => navigate('/explore')}>
              Explore Media Locations
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="xl" variant="outline" onClick={() => navigate('/contact')}>
              Get a Quote
            </Button>
          </div>

          {/* Dynamic Stats Section - Updated Duration to 4000ms */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto animate-slide-up delay-400">
            {/* 1. Locations */}
            <div className="glass-card rounded-xl p-6 hover-lift backdrop-blur-md">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">
                <Counter end={1000} duration={4000} />
              </div>
              <div className="text-sm text-muted-foreground">Media Locations</div>
            </div>

            {/* 2. Clients */}
            <div className="glass-card rounded-xl p-6 hover-lift backdrop-blur-md">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-peacock/10">
                  <Users className="h-5 w-5 text-peacock" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">
                <Counter end={500} duration={4000} />
              </div>
              <div className="text-sm text-muted-foreground">Happy Clients</div>
            </div>

            {/* 3. Districts */}
            <div className="glass-card rounded-xl p-6 hover-lift backdrop-blur-md">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-success/10">
                  <Building2 className="h-5 w-5 text-success" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">
                <Counter end={30} duration={4000} />
              </div>
              <div className="text-sm text-muted-foreground">Districts Covered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}