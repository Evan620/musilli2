import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Search, Download, Eye, Ruler, Bed, Bath, Home, Building2, TreePine, Star } from "lucide-react";

const architecturalPlans = [
  {
    id: "1",
    title: "Minimalist 3-Bedroom Villa",
    image: "/placeholder.svg",
    category: "Villa",
    bedrooms: 3,
    bathrooms: 2,
    area: 2500,
    areaUnit: "sqft",
    price: 150000,
    currency: "KSH",
    description: "Modern minimalist design with open-plan living and large windows",
    features: ["Open Plan", "Large Windows", "Modern Kitchen", "Master Suite"],
    isFeatured: true,
    downloads: 234
  },
  {
    id: "2",
    title: "Urban Duplex Concept",
    image: "/placeholder.svg",
    category: "Duplex",
    bedrooms: 4,
    bathrooms: 3,
    area: 3200,
    areaUnit: "sqft",
    price: 200000,
    currency: "KSH",
    description: "Two-story duplex perfect for urban living with rooftop terrace",
    features: ["Two Story", "Rooftop Terrace", "Parking", "Modern Design"],
    isFeatured: false,
    downloads: 156
  },
  {
    id: "3",
    title: "Eco-Friendly Cottage",
    image: "/placeholder.svg",
    category: "Cottage",
    bedrooms: 2,
    bathrooms: 1,
    area: 1200,
    areaUnit: "sqft",
    price: 80000,
    currency: "KSH",
    description: "Sustainable design with solar panels and rainwater harvesting",
    features: ["Solar Panels", "Rainwater Harvesting", "Natural Materials", "Energy Efficient"],
    isFeatured: true,
    downloads: 189
  },
  {
    id: "4",
    title: "Luxury Penthouse Blueprint",
    image: "/placeholder.svg",
    category: "Penthouse",
    bedrooms: 4,
    bathrooms: 4,
    area: 4500,
    areaUnit: "sqft",
    price: 350000,
    currency: "KSH",
    description: "High-end penthouse with panoramic views and premium finishes",
    features: ["Panoramic Views", "Premium Finishes", "Private Elevator", "Balcony"],
    isFeatured: true,
    downloads: 312
  },
  {
    id: "5",
    title: "Family Bungalow",
    image: "/placeholder.svg",
    category: "Bungalow",
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    areaUnit: "sqft",
    price: 120000,
    currency: "KSH",
    description: "Single-story family home with spacious rooms and garden space",
    features: ["Single Story", "Garden Space", "Family Friendly", "Storage"],
    isFeatured: false,
    downloads: 98
  },
  {
    id: "6",
    title: "Modern Townhouse",
    image: "/placeholder.svg",
    category: "Townhouse",
    bedrooms: 3,
    bathrooms: 2,
    area: 2200,
    areaUnit: "sqft",
    price: 180000,
    currency: "KSH",
    description: "Contemporary townhouse design with private courtyard",
    features: ["Private Courtyard", "Modern Design", "Two Story", "Parking"],
    isFeatured: false,
    downloads: 145
  }
];

const Drawings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  // Filter and sort plans
  const filteredPlans = architecturalPlans
    .filter(plan => {
      const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plan.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || plan.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "featured":
          return b.isFeatured ? 1 : -1;
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "popular":
          return b.downloads - a.downloads;
        default:
          return 0;
      }
    });

  const categories = ["all", ...Array.from(new Set(architecturalPlans.map(plan => plan.category)))];

  return (
    <main className="container mx-auto py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-gradient">House Architectural Plans</h1>
        <p className="text-muted-foreground">
          Professional architectural drawings and blueprints for your dream home. Ready-to-build plans with detailed specifications.
        </p>
      </header>

      {/* Search and Filters */}
      <section className="brutal-card p-6 mb-8 animate-fade-in">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Downloaded</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSortBy("featured");
            }}
          >
            Clear Filters
          </Button>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {filteredPlans.length} architectural plans found
          </p>
          <div className="flex gap-2">
            <Badge variant="outline" className="cursor-pointer">
              Residential
            </Badge>
            <Badge variant="outline" className="cursor-pointer">
              Commercial
            </Badge>
            <Badge variant="outline" className="cursor-pointer">
              Custom Design
            </Badge>
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No plans found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters or check back later for new designs.</p>
          </div>
        ) : (
          filteredPlans.map((plan) => (
            <Card key={plan.id} className="brutal-card overflow-hidden hover-scale transition-transform duration-200 hover:-translate-y-0.5">
              <div className="relative">
                <img
                  src={plan.image}
                  alt={`${plan.title} architectural plan`}
                  className="aspect-[16/10] object-cover w-full"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-white/90 text-black">
                    {plan.category}
                  </Badge>
                </div>
                {plan.isFeatured && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-orange-500 hover:bg-orange-600">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">{plan.title}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Plan Features */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center">
                    <Bed className="w-4 h-4 mr-1" />
                    {plan.bedrooms}
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-4 h-4 mr-1" />
                    {plan.bathrooms}
                  </div>
                  <div className="flex items-center">
                    <Ruler className="w-4 h-4 mr-1" />
                    {plan.area} {plan.areaUnit}
                  </div>
                </div>

                {/* Key Features */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {plan.features.slice(0, 2).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {plan.features.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{plan.features.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Price and Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xl font-bold text-primary">
                      {plan.currency} {plan.price.toLocaleString()}
                    </span>
                    <div className="text-sm text-muted-foreground">
                      Complete Plans Package
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      {plan.downloads}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105"
                    style={{backgroundColor: 'hsl(174, 100%, 29%)'}}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-2 font-medium rounded-lg transition-all duration-200 hover:scale-105"
                    style={{
                      borderColor: 'hsl(174, 100%, 29%)',
                      color: 'hsl(174, 100%, 29%)'
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Buy Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </main>
  );
};

export default Drawings;
