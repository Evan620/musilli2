import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Building2, Home, Map, Palette, Users, Settings, Search, TrendingUp, Zap, LogIn, LogOut, User, Plus, Calendar, TreePine, Download } from "lucide-react";
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
  const { user, logout, isAuthenticated } = useAuth();
  return (
    <header className="bg-white shadow-sm relative overflow-visible z-[100]" style={{zIndex: 9999}}>
      <div className="container mx-auto flex items-center justify-between h-16 relative z-10 px-4">
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
                <div className="grid gap-3 p-6 md:w-[500px] lg:w-[600px] lg:grid-cols-2 bg-background/95 backdrop-blur-sm border shadow-lg z-[120]" style={{zIndex: 9999, position: 'relative'}}>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Properties</h4>
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
                        Apartments
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Modern apartments in prime locations
                      </p>
                    </Link>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground mb-3">For Sale</h4>
                    <Link to="/rentals?category=sale&type=house" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Houses for Sale
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Family homes and luxury properties
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
                    <Link to="/rentals?category=sale&type=commercial" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Commercial Properties
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Office buildings and retail spaces
                      </p>
                    </Link>
                    <Link to="/rentals" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Browse All Properties
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        View all available properties
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
                        Apartments
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Modern apartments in prime locations
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
              <NavigationMenuTrigger className="bg-white/10 text-white border border-white/20 hover:bg-white/20 data-[state=open]:bg-white/20">
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
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Navigation */}
        <nav className="flex lg:hidden items-center gap-1" aria-label="Main">
          <NavLink to="/rentals" className={navLinkClass}>
            <Home className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Properties</span>
          </NavLink>
          <NavLink to="/land" className={navLinkClass}>
            <Map className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Land</span>
          </NavLink>
          <NavLink to="/drawings" className={navLinkClass}>
            <Palette className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Plans</span>
          </NavLink>
          {!isAuthenticated ? (
            <NavLink to="/register" className={navLinkClass}>
              <Users className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Join</span>
            </NavLink>
          ) : (
            <NavLink to="/add-property" className={navLinkClass}>
              <Plus className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Add</span>
            </NavLink>
          )}
        </nav>
        
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium">
                Sign In
              </Link>
              <Link to="/login" className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium">
                Log In
              </Link>
              <Link to="/add-property">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium">
                  Request a property
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium">
                  Create Listing
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
    </header>
  );
};

export default SiteHeader;
