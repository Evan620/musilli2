import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlanPreviewModal } from "@/components/ui/plan-preview-modal";
import { PlanPurchaseModal } from "@/components/ui/plan-purchase-modal";
import { useState, useEffect } from "react";
import { planService } from "@/lib/supabase-plans";
import { ArchitecturalPlan, PlanSearchFilters, PlanCategory } from "@/types";
import { Search, Download, Eye, Ruler, Bed, Bath, Home, Building2, TreePine, Star, TrendingUp, Award } from "lucide-react";

const Drawings = () => {
  const [plans, setPlans] = useState<ArchitecturalPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ArchitecturalPlan | null>(null);
  const [planToPurchase, setPlanToPurchase] = useState<ArchitecturalPlan | null>(null);
  const [showPlanPreview, setShowPlanPreview] = useState(false);
  const [showPlanPurchase, setShowPlanPurchase] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<PlanCategory | "all">("all");
  const [priceRange, setPriceRange] = useState<"all" | "under-100k" | "100k-200k" | "over-200k">("all");
  const [bedroomFilter, setBedroomFilter] = useState<"all" | "1" | "2" | "3" | "4+">("all");

  // Load plans from database
  const loadPlans = async () => {
    setIsLoading(true);
    try {
      console.log('🏗️ Loading architectural plans...');

      // Build search filters
      const filters: PlanSearchFilters = {
        sortBy: 'date',
        sortOrder: 'desc'
      };

      if (categoryFilter !== "all") {
        filters.category = categoryFilter;
      }

      if (priceRange !== "all") {
        switch (priceRange) {
          case "under-100k":
            filters.maxPrice = 100000;
            break;
          case "100k-200k":
            filters.minPrice = 100000;
            filters.maxPrice = 200000;
            break;
          case "over-200k":
            filters.minPrice = 200000;
            break;
        }
      }

      if (bedroomFilter !== "all") {
        if (bedroomFilter === "4+") {
          filters.minBedrooms = 4;
        } else {
          filters.minBedrooms = parseInt(bedroomFilter);
          filters.maxBedrooms = parseInt(bedroomFilter);
        }
      }

      const loadedPlans = await planService.searchPlans(filters);

      // Filter by search query if provided
      const filteredPlans = searchQuery
        ? loadedPlans.filter(plan =>
            plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            plan.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : loadedPlans;

      setPlans(filteredPlans);
      console.log('✅ Plans loaded:', filteredPlans.length);
    } catch (error) {
      console.error('❌ Error loading plans:', error);
      setPlans([]); // Fallback to empty array
    } finally {
      setIsLoading(false);
    }
  };

  // Load plans on component mount and when filters change
  useEffect(() => {
    loadPlans();
  }, [categoryFilter, priceRange, bedroomFilter]);

  // Search when query changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadPlans();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handler functions for architectural plans
  const handlePlanPreview = (plan: ArchitecturalPlan) => {
    setSelectedPlan(plan);
    setShowPlanPreview(true);
    // Track plan view
    planService.trackPlanView(plan.id);
  };

  const handlePlanPurchase = (plan: ArchitecturalPlan) => {
    setPlanToPurchase(plan);
    setShowPlanPurchase(true);
    setShowPlanPreview(false);
  };

  const handlePurchaseSuccess = (planId: string) => {
    setShowPlanPurchase(false);
    setPlanToPurchase(null);
    // Refresh plans to update download count
    loadPlans();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl mb-6 shadow-lg">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Architectural Plans
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Professional house plans designed by expert architects. Download instantly and start building your dream home.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
                <SelectTrigger className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="bungalow">Bungalow</SelectItem>
                  <SelectItem value="maisonette">Maisonette</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="cottage">Cottage</SelectItem>
                  <SelectItem value="mansion">Mansion</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="duplex">Duplex</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={(value: any) => setPriceRange(value)}>
                <SelectTrigger className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-100k">Under KSH 100K</SelectItem>
                  <SelectItem value="100k-200k">KSH 100K - 200K</SelectItem>
                  <SelectItem value="over-200k">Over KSH 200K</SelectItem>
                </SelectContent>
              </Select>

              <Select value={bedroomFilter} onValueChange={(value: any) => setBedroomFilter(value)}>
                <SelectTrigger className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Bedrooms</SelectItem>
                  <SelectItem value="1">1 Bedroom</SelectItem>
                  <SelectItem value="2">2 Bedrooms</SelectItem>
                  <SelectItem value="3">3 Bedrooms</SelectItem>
                  <SelectItem value="4+">4+ Bedrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Plans Grid */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Loading Plans...</h3>
            <p className="text-slate-500">Finding the perfect architectural plans for you</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16">
            <Home className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Plans Found</h3>
            <p className="text-slate-500">Try adjusting your search filters or check back later for new plans.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="group overflow-hidden border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative">
                  <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    {plan.files && plan.files.length > 0 ? (
                      <img
                        src={plan.files.find(f => f.isPrimary)?.fileUrl || plan.files[0]?.fileUrl || '/api/placeholder/400/300'}
                        alt={plan.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Home className="w-16 h-16 text-slate-400" />
                    )}
                  </div>

                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-slate-700 hover:bg-white">
                      {plan.category.charAt(0).toUpperCase() + plan.category.slice(1)}
                    </Badge>
                  </div>

                  {plan.isFeatured && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                      onClick={() => handlePlanPreview(plan)}
                      className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Plan
                    </Button>
                  </div>
                </div>

                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {plan.title}
                  </CardTitle>

                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {plan.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      {plan.bedrooms}
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      {plan.bathrooms}
                    </div>
                    <div className="flex items-center gap-1">
                      <Ruler className="w-4 h-4" />
                      {plan.area} {plan.areaUnit}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {plan.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{plan.features.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {plan.currency} {plan.price.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {plan.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {plan.downloads}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handlePlanPreview(plan)}
                      className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg"
                    >
                      View Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Plan Preview Modal */}
      {showPlanPreview && selectedPlan && (
        <PlanPreviewModal
          plan={selectedPlan}
          onClose={() => setShowPlanPreview(false)}
          onPurchase={handlePlanPurchase}
        />
      )}

      {/* Plan Purchase Modal */}
      {showPlanPurchase && planToPurchase && (
        <PlanPurchaseModal
          plan={planToPurchase}
          onClose={() => setShowPlanPurchase(false)}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
};

export default Drawings;
