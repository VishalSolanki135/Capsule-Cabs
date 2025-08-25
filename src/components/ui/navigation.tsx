import { Button } from "@/components/ui/button";
import { Car, User } from "lucide-react";
import { Link } from "react-router-dom";

export const Navigation = () => {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Car className="h-6 w-6 text-primary" />
          <span>CapsuleCabs</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-foreground hover:text-primary transition-smooth">
            Home
          </Link>
          <Link to="/dashboard" className="text-foreground hover:text-primary transition-smooth">
            Dashboard
          </Link>
          <Link to="/booking" className="text-foreground hover:text-primary transition-smooth">
            Book a Ride
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};