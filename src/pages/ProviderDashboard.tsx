import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useProperties } from "@/contexts/PropertyContext";
import { Property, ProviderStats } from "@/types";
import {
  Plus,
  Eye,
  MessageSquare,
  Home,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  MoreHorizontal,
  DollarSign
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProviderDashboard = () => {
  const { user } = useAuth();
  const { properties, deleteProperty } = useProperties();
  const [stats, setStats] = useState<ProviderStats>({
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    totalViews: 0,
    totalInquiries: 0,
    newInquiries: 0,
    monthlyViews: 0,
    conversionRate: 0,
  });

  // Filter properties for current provider
  const providerProperties = properties.filter(p => p.providerId === user?.id);

  useEffect(() => {
    // Calculate stats from provider's properties
    const activeListings = providerProperties.filter(p => p.status === 'published').length;
    const pendingListings = providerProperties.filter(p => p.status === 'pending').length;
    const totalViews = providerProperties.reduce((sum, p) => sum + p.views, 0);
    const totalInquiries = providerProperties.reduce((sum, p) => sum + p.inquiries, 0);

    setStats({
      totalListings: providerProperties.length,
      activeListings,
      pendingListings,
      totalViews,
      totalInquiries,
      newInquiries: Math.floor(totalInquiries * 0.3), // Mock: 30% are new
      monthlyViews: Math.floor(totalViews * 0.6), // Mock: 60% are from this month
      conversionRate: totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0,
    });
  }, [providerProperties]);

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      await deleteProperty(propertyId);
    }
  };

  const getStatusBadge = (status: Property['status']) => {
    const variants = {
      published: 'default',
      pending: 'secondary',
      draft: 'outline',
      rejected: 'destructive',
      sold: 'default',
      rented: 'default',
    } as const;

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (!user) {
    return <div>Please log in to access your dashboard.</div>;
  }

  return (
    <main className="container mx-auto py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gradient">Provider Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}! Manage your listings and track performance.</p>
        </div>
        <Link to="/add-property">
          <Button className="shadow-lg hover:shadow-xl transition-shadow">
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </header>

      {/* Stats Overview */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="brutal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeListings} active, {stats.pendingListings} pending
            </p>
          </CardContent>
        </Card>

        <Card className="brutal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              {stats.monthlyViews} this month
            </p>
          </CardContent>
        </Card>

        <Card className="brutal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInquiries}</div>
            <p className="text-xs text-muted-foreground">
              {stats.newInquiries} new this week
            </p>
          </CardContent>
        </Card>

        <Card className="brutal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
            <Progress value={stats.conversionRate} className="mt-2" />
          </CardContent>
        </Card>
      </section>

      {/* Main Content */}
      <Tabs defaultValue="properties" className="space-y-6">
        <TabsList>
          <TabsTrigger value="properties">My Properties</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-6">
          <Card className="brutal-card">
            <CardHeader>
              <CardTitle>Property Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {providerProperties.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
                  <p className="text-muted-foreground mb-4">Start by adding your first property listing</p>
                  <Link to="/add-property">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Property
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {providerProperties.map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={property.images[0]?.url || '/placeholder.svg'}
                          alt={property.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div>
                          <h3 className="font-semibold">{property.title}</h3>
                          <p className="text-sm text-muted-foreground">{property.location.city}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(property.status)}
                            <span className="text-sm font-medium">
                              {property.currency} {property.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Eye className="w-4 h-4 mr-1" />
                            {property.views}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {property.inquiries}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteProperty(property.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inquiries" className="space-y-6">
          <Card className="brutal-card">
            <CardHeader>
              <CardTitle>Recent Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No inquiries yet</h3>
                <p className="text-muted-foreground">Inquiries from potential buyers/renters will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="brutal-card">
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">Detailed analytics and insights will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default ProviderDashboard;
