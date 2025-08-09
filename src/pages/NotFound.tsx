import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-background p-6">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-extrabold text-gradient">404</h1>
        <p className="text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/">
          <Button>Return to Dashboard</Button>
        </a>
      </div>
    </div>
  );
};

export default NotFound;
