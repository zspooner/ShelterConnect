import { Button } from "@/components/ui/button";
import { Heart, Menu, User } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  shelterName?: string;
  isLoggedIn?: boolean;
  userType?: "shelter" | "volunteer";
  onLogin?: () => void;
  onLogout?: () => void;
  onMenuToggle?: () => void;
}

export default function Header({
  shelterName,
  isLoggedIn = false,
  userType = "shelter",
  onLogin,
  onLogout,
  onMenuToggle
}: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
    console.log('Menu toggled');
    onMenuToggle?.();
  };

  const handleLogin = () => {
    console.log('Login clicked');
    onLogin?.();
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    onLogout?.();
  };

  return (
    <header className="border-b bg-background">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMenuClick}
            className="md:hidden"
            data-testid="button-menu-toggle"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-accent-foreground" />
            <h1 className="text-xl font-semibold">ShelterDog Amplify</h1>
          </div>
          
          {shelterName && (
            <div className="hidden md:block text-sm text-muted-foreground">
              {shelterName}
            </div>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {isLoggedIn ? (
            <>
              {userType === "shelter" && (
                <>
                  <a href="/dash" className="text-sm hover:text-foreground">Dashboard</a>
                  <a href="/dogs/new" className="text-sm hover:text-foreground">Add Dog</a>
                </>
              )}
              {userType === "volunteer" && (
                <a href="/amplify" className="text-sm hover:text-foreground">Amplify Tasks</a>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
                <User className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <a href="/amplify" className="text-sm hover:text-foreground">Volunteer</a>
              <Button variant="ghost" size="sm" onClick={handleLogin} data-testid="button-login">
                For Shelters
              </Button>
            </>
          )}
        </nav>

        {/* Mobile menu */}
        {showMenu && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b md:hidden p-4 space-y-2">
            {isLoggedIn ? (
              <>
                {userType === "shelter" && (
                  <>
                    <a href="/dash" className="block py-2 text-sm">Dashboard</a>
                    <a href="/dogs/new" className="block py-2 text-sm">Add Dog</a>
                  </>
                )}
                {userType === "volunteer" && (
                  <a href="/amplify" className="block py-2 text-sm">Amplify Tasks</a>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <a href="/amplify" className="block py-2 text-sm">Volunteer</a>
                <Button variant="ghost" size="sm" onClick={handleLogin} className="w-full justify-start">
                  For Shelters
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}