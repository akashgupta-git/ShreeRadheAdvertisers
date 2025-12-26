import { Linkedin, Twitter, Mail } from "lucide-react";
import ashishImg from "@/assets/Ashish.jpg";
import shubhamImg from "@/assets/Shubham.jpg";

const teamMembers = [
  {
    name: "Ashish Gupta",
    role: "Founder & CEO",
    bio: "Our vision is to be the most trusted and effective outdoor advertising partner in Chhattisgarh. We're not just providing ad space; we're building platforms for brands to shine and connect with the heart of the state. We believe in the power of visibility and are committed to helping our clients achieve their goals through strategic, high-impact campaigns.",
    image: ashishImg,
  },
  {
    name: "Shubham Gupta",
    role: "COO",
    bio: "Operational excellence is at the core of what we do. We ensure every campaign is executed flawlessly, on time, and delivers maximum impact for our clients through meticulous planning and support. Our focus on logistics and quality control means our clients can trust us to represent their brand perfectly, every time.",
    image: shubhamImg,
  },
];

export function AboutSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-slide-up">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider mb-2 block">
            About Us
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">
            Meet the Team Behind{" "}
            <span className="gradient-text">Shree Radhe Advertisers</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We are passionate about connecting brands with audiences through strategic outdoor advertising solutions across India.
          </p>
        </div>

        {/* Company Story */}
        <div className="glass-card rounded-2xl p-8 md:p-12 mb-16 animate-slide-up delay-100">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4 font-display">Our Story</h3>
              <p className="text-muted-foreground mb-4">
                Founded with a vision to transform outdoor advertising in India, Shree Radhe Advertisers has grown to become one of the most trusted names in the OOH industry.
              </p>
              <p className="text-muted-foreground mb-4">
                We manage premium advertising locations including billboards, unipoles, hoardings, gantries, kiosks, and digital LEDs across multiple states and districts.
              </p>
              <p className="text-muted-foreground">
                Our commitment to quality, transparency, and client success has helped us build lasting partnerships with brands of all sizes.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-peacock/20 rounded-2xl blur-xl" />
              <div className="relative grid grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">100%</div>
                  <div className="text-sm text-muted-foreground">Client Satisfaction</div>
                </div>

                <div className="glass-card rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-peacock mb-1">500+</div>
                  <div className="text-sm text-muted-foreground">Happy Clients</div>
                </div>
                <div className="glass-card rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-accent mb-1">1000+</div>
                  <div className="text-sm text-muted-foreground">Media Locations</div>
                </div>
                <div className="glass-card rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-success mb-1">30+</div>
                  <div className="text-sm text-muted-foreground">Districts</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="grid md:grid-cols-2 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={member.name}
              className="glass-card rounded-2xl p-8 hover-lift animate-slide-up"
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
            >
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary to-accent rounded-full blur-sm opacity-50" />
                  <img
                    src={member.image}
                    alt={member.name}
                    className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-background"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1 font-display">{member.name}</h3>
                  <p className="text-accent font-medium text-sm mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm mb-4">{member.bio}</p>
                  <div className="flex gap-3">
                    <a
                      href="#"
                      className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a
                      href="#"
                      className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                    <a
                      href="#"
                      className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}