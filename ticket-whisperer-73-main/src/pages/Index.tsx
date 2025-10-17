import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Ticket, Shield, Users, BarChart3 } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <nav className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Ticket className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SupportHub</span>
          </div>
          <Button onClick={() => navigate("/auth")}>Get Started</Button>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Customer Support Made Simple
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Streamline your support workflow with our comprehensive ticketing system. Track, manage, and resolve customer
          issues efficiently.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
            Start Free Trial
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card rounded-lg p-8 border shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Secure & Reliable</h3>
            <p className="text-muted-foreground">
              Enterprise-grade security with role-based access control to protect your customer data.
            </p>
          </div>
          <div className="bg-card rounded-lg p-8 border shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 rounded-full bg-accent/10 w-fit mb-4">
              <Users className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Team Collaboration</h3>
            <p className="text-muted-foreground">
              Assign tickets to agents, add internal notes, and work together to resolve issues faster.
            </p>
          </div>
          <div className="bg-card rounded-lg p-8 border shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 rounded-full bg-success/10 w-fit mb-4">
              <BarChart3 className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Analytics & Insights</h3>
            <p className="text-muted-foreground">
              Track ticket volume, resolution times, and agent performance with comprehensive reports.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to transform your support?</h2>
        <p className="text-muted-foreground mb-8">Join thousands of teams already using SupportHub</p>
        <Button size="lg" onClick={() => navigate("/auth")}>
          Get Started Now
        </Button>
      </section>

      <footer className="bg-card border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 SupportHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
