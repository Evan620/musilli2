import { Link } from "react-router-dom";
import { Building2, Home, MapPin, Mail, Phone, Facebook, Twitter, Instagram, Linkedin, Heart, Palette } from "lucide-react";

const SiteFooter = () => {
  return (
    <footer className="text-white relative overflow-hidden" style={{background: 'linear-gradient(135deg, hsl(158, 64%, 8%) 0%, hsl(158, 54%, 12%) 50%, hsl(174, 100%, 15%) 100%)'}}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gray-900/5"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/3 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16 grid lg:grid-cols-4 md:grid-cols-2 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 font-bold text-xl tracking-tight hover:scale-105 transition-transform">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-black" />
              </div>
              Musilli homes
            </Link>
            <p className="text-gray-300 leading-relaxed">
              Your trusted partner in finding the perfect property. From luxury rentals to prime land investments, we make real estate dreams come true.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Quick Links</h3>
            <nav className="space-y-3" aria-label="Footer Navigation">
              <Link to="/rentals" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group">
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Luxury Rentals
              </Link>
              <Link to="/land" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group">
                <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Prime Land
              </Link>
              <Link to="/drawings" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group">
                <Palette className="w-4 h-4 group-hover:scale-110 transition-transform" />
                House Plans
              </Link>
              <Link to="/drawings" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group">
                <Building2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Architectural Drawings
              </Link>
              <Link to="/register" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group">
                <Building2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Become a Provider
              </Link>
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Services</h3>
            <div className="space-y-3">
              <div className="text-gray-300">Property Management</div>
              <div className="text-gray-300">Investment Consulting</div>
              <div className="text-gray-300">Market Analysis</div>
              <div className="text-gray-300">Legal Support</div>
              <div className="text-gray-300">24/7 Customer Service</div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="w-5 h-5 text-white" />
                <span>hello@musillihomes.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="w-5 h-5 text-white" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="text-gray-300">
                Available 24/7 for all your real estate needs
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Musilli homes. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-white fill-current" />
              <span>for real estate enthusiasts</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
