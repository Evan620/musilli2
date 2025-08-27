import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/contexts/AuthContext";
import { PropertyProvider } from "@/contexts/PropertyContext";
import { ProviderProvider } from "@/contexts/ProviderContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Rentals from "./pages/Rentals";
import PropertiesForSale from "./pages/PropertiesForSale";
import Land from "./pages/Land";
import Drawings from "./pages/Drawings";
import AdvancedSearch from "./pages/AdvancedSearch";
import PropertyDetails from "./pages/PropertyDetails";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AddProperty from "./pages/AddProperty";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Partners from "./pages/Partners";
import AuthCallback from "./pages/AuthCallback";
import NetworkTest from "./pages/NetworkTest";
import DebugAuth from "./pages/DebugAuth";
import Header from "./components/layout/SiteHeader";
import Footer from "./components/layout/SiteFooter";
import { DashboardRedirect } from "./components/DashboardRedirect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PropertyProvider>
          <ProviderProvider>
            <AdminProvider>
              <NotificationProvider>
                <Toaster />
                <Sonner />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true
                }}
              >
                <SiteLayout />
              </BrowserRouter>
              </NotificationProvider>
            </AdminProvider>
          </ProviderProvider>
        </PropertyProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

const SiteLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 pb-16 lg:pb-0">{/* Add bottom padding for mobile navigation */}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/rentals" element={<Rentals />} />
          <Route path="/properties-for-sale" element={<PropertiesForSale />} />
          <Route path="/land" element={<Land />} />
          <Route path="/drawings" element={<Drawings />} />
          <Route path="/advanced-search" element={<AdvancedSearch />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/add-property" element={
            <ProtectedRoute requiredRole="provider">
              <AddProperty />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/dashboard/provider" element={
            <ProtectedRoute requiredRole="provider">
              <ProviderDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/partners" element={<Partners />} />
          <Route path="/network-test" element={<NetworkTest />} />
          <Route path="/debug-auth" element={<DebugAuth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;
