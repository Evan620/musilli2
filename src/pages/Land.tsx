import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProperties } from "@/contexts/PropertyContext";
import { PropertySearchFilters } from "@/types";
import { Search, MapPin, Eye, MessageSquare, Ruler, TreePine } from "lucide-react";

const Land = () => {
  const { searchProperties } = useProperties();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<PropertySearchFilters>({
    query: "",
    type: "land",
    category: "sale",
    sortBy: "date",
    sortOrder: "desc",
  });

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlFilters: PropertySearchFilters = {
      query: searchParams.get('query') || "",
      type: "land",
      category: "sale",
      city: searchParams.get('city') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || "date",
      sortOrder: (searchParams.get('sortOrder') as any) || "desc",
    };
    setFilters(urlFilters);
  }, [searchParams]);

  const handleFilterChange = (key: keyof PropertySearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL parameters
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== "" && v !== "all" && k !== "type" && k !== "category") {
        newSearchParams.set(k, v.toString());
      }
    });
    setSearchParams(newSearchParams);
  };

  const results = useMemo(() => {
    return searchProperties(filters);
  }, [filters, searchProperties]);

  // Get unique cities for filter dropdown
  const cities = useMemo(() => {
    const allLand = searchProperties({ type: "land" });
    const uniqueCities = Array.from(new Set(allLand.map(p => p.location.city)));
    return uniqueCities.sort();
  }, [searchProperties]);

  const landProperties = results.filter(p => p.type === 'land');

  return (
    <main className="container mx-auto py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-gradient">Land for Sale</h1>
        <p className="text-muted-foreground">
          Discover prime land opportunities for development, investment, and agriculture.
        </p>
      </header>

      {/* Search and Filters */}
      <section className="brutal-card p-6 mb-8 animate-fade-in">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search land..."
              value={filters.query || ""}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filters.city || "all"} onValueChange={(value) => handleFilterChange('city', value === "all" ? undefined : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.sortBy || "date"} onValueChange={(value) => handleFilterChange('sortBy', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Newest First</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="area">Area Size</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setFilters({ type: "land", category: "sale", sortBy: "date", sortOrder: "desc" })}
          >
            Clear Filters
          </Button>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {landProperties.length} land parcels found
          </p>
          <div className="flex gap-2">
            <Badge variant="outline" className="cursor-pointer">
              Residential
            </Badge>
            <Badge variant="outline" className="cursor-pointer">
              Commercial
            </Badge>
            <Badge variant="outline" className="cursor-pointer">
              Agricultural
            </Badge>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {landProperties.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <TreePine className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No land found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters or check back later for new listings.</p>
          </div>
        ) : (
          landProperties.map((property) => (
            <Card key={property.id} className="brutal-card overflow-hidden hover-scale transition-transform duration-200 hover:-translate-y-0.5">
              <div className="relative">
                <img
                  src={property.images[0]?.url || '/placeholder.svg'}
                  alt={property.title}
                  className="aspect-[16/10] object-cover w-full"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-white/90 text-black">
                    Land
                  </Badge>
                </div>
                {property.isFeatured && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-orange-500 hover:bg-orange-600">
                      Featured
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">{property.title}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.location.city}, {property.location.state}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Land Features */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center">
                    <Ruler className="w-4 h-4 mr-1" />
                    {property.features.area} {property.features.areaUnit}
                  </div>
                </div>

                {/* Amenities */}
                {property.features.amenities.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {property.features.amenities.slice(0, 3).map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {property.features.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{property.features.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Price and Stats */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-primary">
                      {property.currency} {property.price.toLocaleString()}
                    </span>
                    <div className="text-sm text-muted-foreground">
                      {property.currency} {Math.round(property.price / property.features.area).toLocaleString()}/{property.features.areaUnit}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {property.views}
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {property.inquiries}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button className="w-full mt-4" variant="outline">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </main>
  );
};

export default Land;
