
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, Plus, Gift, User, BarChart3, Menu, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { authUtils } from "@/lib/auth";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const user = await authUtils.getCurrentUser();
    if (user) {
      setIsAdmin(authUtils.isAdminUser(user));
    }
  };

  const handleLogout = () => {
    authUtils.removeAuthToken();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate("/");
  };

  const navItems = isAdmin 
    ? [{ icon: BarChart3, label: "Admin Dashboard", path: "/admin" }]
    : [
        { icon: Home, label: "Dashboard", path: "/dashboard" },
        { icon: Plus, label: "Log Consumption", path: "/log" },
        { icon: Gift, label: "Rewards", path: "/rewards" },
        { icon: User, label: "Profile", path: "/profile" },
      ];

  const NavLink = ({ item, onClick }: { item: typeof navItems[0], onClick?: () => void }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={onClick}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover-glow ${
          isActive
            ? "gradient-primary text-white shadow-md"
            : "text-blue-600 hover:bg-blue-50 glass-effect"
        }`}
      >
        <item.icon className="h-5 w-5" />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Desktop Navigation */}
      <header className="hidden lg:block glass-card border-b border-blue-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2 hover-glow">
              <div className="w-8 h-8 gradient-primary rounded-full shadow-lg"></div>
              <h1 className="text-2xl font-bold text-gradient">SnackTrack</h1>
            </Link>

            <nav className="flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors hover-glow ${
                    location.pathname === item.path
                      ? "gradient-primary text-white shadow-lg"
                      : "text-blue-600 hover:text-blue-700 hover:bg-blue-50 glass-effect"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <Button variant="ghost" onClick={handleLogout} className="text-blue-600 hover:text-red-600 hover-glow">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <header className="lg:hidden glass-card border-b border-blue-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2 hover-glow">
              <div className="w-8 h-8 gradient-primary rounded-full shadow-lg"></div>
              <h1 className="text-xl font-bold text-gradient">SnackTrack</h1>
            </Link>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-blue-600">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 glass-card">
                <div className="py-6">
                  <div className="flex items-center space-x-2 mb-8">
                    <div className="w-10 h-10 gradient-primary rounded-full shadow-lg"></div>
                    <div>
                      <h2 className="text-lg font-bold text-gradient">SnackTrack</h2>
                      <p className="text-sm text-muted-foreground">Welcome back!</p>
                    </div>
                  </div>

                  <nav className="space-y-2">
                    {navItems.map((item) => (
                      <NavLink key={item.path} item={item} onClick={() => setIsOpen(false)} />
                    ))}
                  </nav>

                  <div className="mt-8 pt-6 border-t border-blue-200">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full justify-start text-blue-600 hover:text-red-600 hover:bg-red-50 hover-glow"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-blue-200/50 z-50">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors hover-glow ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-blue-600"
                }`}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navigation;
