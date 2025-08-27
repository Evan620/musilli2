import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Building2, Home, Map, Palette, Users, Settings, Search, TrendingUp, Zap, LogIn, LogOut, User, Plus, Calendar, TreePine, Download, Star, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md story-link transition-colors ${
    isActive ? "text-primary-foreground" : "text-primary-foreground/90 hover:text-primary-foreground"
  }`;

const SiteHeader = () => {
  const { user, logout, isLoading } = useAuth();
  const isAuthenticated = !!user;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    // Prevent body scroll when menu is open
    if (newState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  // Cleanup effect to reset body scroll on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <header className="bg-white shadow-sm relative overflow-visible z-[100] w-full" style={{zIndex: 9999}}>
      <div className="container mx-auto flex items-center justify-between h-16 relative z-10 px-4 w-full max-w-full">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:scale-105 transition-transform">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: 'hsl(158, 64%, 20%)'}}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span style={{color: 'hsl(158, 64%, 20%)'}}>Musilli</span><span className="text-gray-800">homes</span>
        </Link>
        
        <NavigationMenu className="hidden lg:flex z-[110]" style={{zIndex: 9999}}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-gray-700 hover:text-red-600 data-[state=open]:text-red-600">
                For Sale
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-6 md:w-[450px] bg-background/95 backdrop-blur-sm border shadow-lg z-[120]" style={{zIndex: 9999, position: 'relative'}}>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground mb-3">For Sale</h4>
                    <Link to="/properties-for-sale?type=house" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Houses for Sale
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Family homes and luxury properties
                      </p>
                    </Link>
                    <Link to="/properties-for-sale?type=apartment" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Apartments for Sale
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Modern apartments in prime locations
                      </p>
                    </Link>
                    <Link to="/land" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <TreePine className="w-4 h-4" />
                        Land for Sale
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Residential, commercial & agricultural land
                      </p>
                    </Link>
                    <Link to="/drawings" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Architectural Plans
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Professional house plans & blueprints
                      </p>
                    </Link>
                    <Link to="/properties-for-sale?type=commercial" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Commercial Properties
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Office buildings and retail spaces
                      </p>
                    </Link>
                    <Link to="/properties-for-sale" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Browse All Properties for Sale
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        View all available properties for sale
                      </p>
                    </Link>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-gray-700 hover:text-red-600 data-[state=open]:text-red-600">
                For Rent
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-6 md:w-[450px] bg-background/95 backdrop-blur-sm border shadow-lg z-[120]" style={{zIndex: 9999, position: 'relative'}}>
                  <div className="space-y-3">
                    <Link to="/rentals?category=rent" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Houses for Rent
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Long-term rental homes and apartments
                      </p>
                    </Link>
                    <Link to="/rentals?category=short-term-rental" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Short-term Stays
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        AirBnB and vacation rentals
                      </p>
                    </Link>
                    <Link to="/rentals?type=apartment" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Apartments for Rent
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Modern apartments in prime locations
                      </p>
                    </Link>
                    <Link to="/rentals" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Browse All Rentals
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        View all available rental properties
                      </p>
                    </Link>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-gray-700 hover:text-red-600 data-[state=open]:text-red-600">
                Project
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-6 md:w-[450px] bg-background/95 backdrop-blur-sm border shadow-lg z-[120]" style={{zIndex: 9999, position: 'relative'}}>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Land Types</h4>
                    <Link to="/land?query=residential" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Residential Plots
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Prime locations for building your dream home
                      </p>
                    </Link>
                    <Link to="/land?query=commercial" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Commercial Land
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Business and retail development opportunities
                      </p>
                    </Link>
                    <Link to="/land?query=agricultural" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <TreePine className="w-4 h-4" />
                        Agricultural Land
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Farming and agricultural investment land
                      </p>
                    </Link>
                    <Link to="/land?sortBy=area" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Investment Opportunities
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        High-potential land for development
                      </p>
                    </Link>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-gray-700 hover:text-red-600 data-[state=open]:text-red-600">
                <Users className="w-4 h-4 mr-2" />
                For Providers
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-6 md:w-[400px] bg-background/95 backdrop-blur-sm border shadow-lg z-[120]" style={{zIndex: 9999, position: 'relative'}}>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Get Started</h4>
                    <Link to="/register" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Join as Provider
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Register to start listing your properties
                      </p>
                    </Link>
                    <Link to="/add-property" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Property
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        List your house, land, or AirBnB
                      </p>
                    </Link>
                    <Link to="/dashboard/provider" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Provider Dashboard
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Manage your listings and analytics
                      </p>
                    </Link>
                    <Link to="/drawings" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Design Services
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Architectural plans and 3D visualizations
                      </p>
                    </Link>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-gray-700 hover:text-red-600 data-[state=open]:text-red-600">
                Our Partner Agents
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-6 md:w-[450px] bg-background/95 backdrop-blur-sm border shadow-lg z-[120]" style={{zIndex: 9999, position: 'relative'}}>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Find Real Estate Professionals</h4>
                    <Link to="/partners" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Browse All Partners
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        View our verified real estate agents and agencies
                      </p>
                    </Link>
                    <Link to="/partners?filter=premium" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Premium Partners
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Top-rated agencies with premium services
                      </p>
                    </Link>
                    <Link to="/partners?city=Nairobi" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Nairobi Agents
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Find local experts in Nairobi area
                      </p>
                    </Link>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu Button - Always visible on mobile */}
        <div className="lg:hidden flex items-center">
          <Button
            onClick={toggleMobileMenu}
            className="p-3 border-2 border-gray-400 bg-white hover:bg-gray-100 shadow-md hover:shadow-lg transition-all duration-200"
            aria-label="Toggle mobile menu"
            style={{
              minWidth: '48px',
              minHeight: '48px',
              backgroundColor: 'hsl(158, 64%, 20%)',
              borderColor: 'hsl(158, 64%, 20%)',
              color: 'white'
            }}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </Button>
        </div>
        
        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-2">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-16 h-8 bg-gray-100 rounded animate-pulse"></div>
              <div className="w-20 h-8 bg-gray-100 rounded animate-pulse"></div>
            </div>
          ) : !isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium">
                Sign In
              </Link>
              <Link to="/register">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium">
                  Register
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {(user?.role === 'provider' || user?.role === 'admin') && (
                <Link to="/add-property" className="hidden sm:block">
                  <Button variant="hero" className="shadow-lg hover:shadow-xl transition-shadow">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="soft" className="backdrop-blur-sm">
                    <User className="w-4 h-4 mr-2 hidden sm:block" />
                    {user?.name || 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to={user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/provider'} className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {(user?.role === 'provider' || user?.role === 'admin') && (
                    <DropdownMenuItem asChild>
                      <Link to="/add-property" className="flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Property
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t shadow-lg z-50">
          <div className="container mx-auto px-4 py-4">
            <nav className="space-y-6 max-h-[70vh] overflow-y-auto">
              {/* For Sale Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 px-3">For Sale</h3>
                <div className="space-y-1">
                  <Link
                    to="/properties-for-sale?type=house"
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Home className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Houses for Sale</div>
                      <div className="text-sm text-gray-500">Family homes and luxury properties</div>
                    </div>
                  </Link>
                  <Link
                    to="/properties-for-sale?type=apartment"
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Building2 className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Apartments for Sale</div>
                      <div className="text-sm text-gray-500">Modern apartments in prime locations</div>
                    </div>
                  </Link>
                  <Link
                    to="/land"
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <TreePine className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Land for Sale</div>
                      <div className="text-sm text-gray-500">Residential, commercial & agricultural land</div>
                    </div>
                  </Link>
                  <Link
                    to="/properties-for-sale?type=commercial"
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Building2 className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Commercial Properties</div>
                      <div className="text-sm text-gray-500">Office buildings and retail spaces</div>
                    </div>
                  </Link>
                  <Link
                    to="/properties-for-sale"
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Search className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Browse All Properties for Sale</div>
                      <div className="text-sm text-gray-500">View all available properties for sale</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* For Rent Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 px-3">For Rent</h3>
                <div className="space-y-1">
                  <Link
                    to="/rentals?category=rent"
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Home className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Houses for Rent</div>
                      <div className="text-sm text-gray-500">Long-term rental homes and apartments</div>
                    </div>
                  </Link>
                  <Link
                    to="/rentals?category=short-term-rental"
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Calendar className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Short-term Stays</div>
                      <div className="text-sm text-gray-500">AirBnB and vacation rentals</div>
                    </div>
                  </Link>
                  <Link
                    to="/rentals?type=apartment"
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Building2 className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Apartments for Rent</div>
                      <div className="text-sm text-gray-500">Modern apartments in prime locations</div>
                    </div>
                  </Link>
                  <Link
                    to="/rentals"
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Search className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Browse All Rentals</div>
                      <div className="text-sm text-gray-500">View all available rental properties</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Project/Land Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 px-3">Land & Projects</h3>
                <div className="space-y-1">
                  <Link
                    to="/land?query=residential"
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Home className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Residential Plots</div>
                      <div className="text-sm text-gray-500">Prime locations for building your dream home</div>
                    </div>
                  </Link>
                  <Link
                    to="/land?query=commercial"
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Building2 className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Commercial Land</div>
                      <div className="text-sm text-gray-500">Business and retail development opportunities</div>
                    </div>
                  </Link>
                  <Link
                    to="/land?query=agricultural"
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <TreePine className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Agricultural Land</div>
                      <div className="text-sm text-gray-500">Farming and agricultural investment land</div>
                    </div>
                  </Link>
                  <Link
                    to="/land?sortBy=area"
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <TrendingUp className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Investment Opportunities</div>
                      <div className="text-sm text-gray-500">High-potential land for development</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* For Providers Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 px-3">For Providers</h3>
                <div className="space-y-1">
                  <Link
                    to="/register"
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Users className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Join as Provider</div>
                      <div className="text-sm text-gray-500">Register to start listing your properties</div>
                    </div>
                  </Link>
                  <Link
                    to="/add-property"
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Plus className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Add Property</div>
                      <div className="text-sm text-gray-500">List your house, land, or AirBnB</div>
                    </div>
                  </Link>
                  <Link
                    to="/drawings"
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Palette className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Design Services</div>
                      <div className="text-sm text-gray-500">Architectural plans and 3D visualizations</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Partner Agents Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 px-3">Partner Agents</h3>
                <div className="space-y-1">
                  <Link
                    to="/partners"
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Users className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Browse All Partners</div>
                      <div className="text-sm text-gray-500">View our verified real estate agents and agencies</div>
                    </div>
                  </Link>
                  <Link
                    to="/partners?filter=premium"
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Star className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Premium Partners</div>
                      <div className="text-sm text-gray-500">Top-rated agencies with premium services</div>
                    </div>
                  </Link>
                  <Link
                    to="/partners?city=Nairobi"
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Building2 className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Nairobi Agents</div>
                      <div className="text-sm text-gray-500">Find local experts in Nairobi area</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Auth Section */}
              <div className="border-t pt-4">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ) : !isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <Users className="w-5 h-5" />
                      Create Account
                    </Link>
                    <Link
                      to="/add-property"
                      className="flex items-center gap-3 px-3 py-2 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <Plus className="w-5 h-5" />
                      Request a Property
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to={user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/provider'}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <Settings className="w-5 h-5" />
                      Dashboard
                    </Link>
                    {(user?.role === 'provider' || user?.role === 'admin') && (
                      <Link
                        to="/add-property"
                        className="flex items-center gap-3 px-3 py-2 rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                        onClick={closeMobileMenu}
                      >
                        <Plus className="w-5 h-5" />
                        Add Property
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation - Always visible on mobile as fallback */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex items-center justify-around py-2">
          <Link
            to="/"
            className="flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link
            to="/rentals"
            className="flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            <Building2 className="w-4 h-4" />
            Properties
          </Link>
          <Link
            to="/land"
            className="flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            <Map className="w-4 h-4" />
            Land
          </Link>
          <Link
            to="/drawings"
            className="flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            <Palette className="w-4 h-4" />
            Plans
          </Link>
          <Link
            to="/partners"
            className="flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            <Users className="w-4 h-4" />
            Agents
          </Link>
          {isLoading ? (
            <div className="flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium text-gray-600">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-2 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : !isAuthenticated ? (
            <Link
              to="/login"
              className="flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium text-gray-600 hover:text-gray-900"
            >
              <User className="w-4 h-4" />
              Login
            </Link>
          ) : (
            <Link
              to={user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/provider'}
              className="flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium text-gray-600 hover:text-gray-900"
            >
              <Settings className="w-4 h-4" />
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
