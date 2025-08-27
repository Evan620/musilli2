import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useProperties } from "@/contexts/PropertyContext";
import { propertyService } from "@/lib/supabase-properties";
import { NotificationBell } from "@/components/provider/NotificationBell";
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
  DollarSign,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deleteProperty } = useProperties();
  const [providerProperties, setProviderProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);

  // Load provider's properties
  useEffect(() => {
    const loadProviderProperties = async () => {
      if (!user) return;

      setIsLoadingProperties(true);
      try {
        console.log('🔄 ProviderDashboard: Loading provider properties...');
        const properties = await propertyService.getProviderProperties();
        console.log('✅ ProviderDashboard: Loaded', properties.length, 'properties');
        setProviderProperties(properties);
      } catch (error) {
        console.error('❌ ProviderDashboard: Error loading properties:', error);
        setProviderProperties([]);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    loadProviderProperties();
  }, [user]);

  const stats = useMemo(() => {
    const activeListings = providerProperties.filter(p => p.status === 'published').length;
    const pendingListings = providerProperties.filter(p => p.status === 'pending').length;
    const rejectedListings = providerProperties.filter(p => p.status === 'rejected').length;
    const draftListings = providerProperties.filter(p => p.status === 'draft').length;
    const totalViews = providerProperties.reduce((sum, p) => sum + p.views, 0);
    const totalInquiries = providerProperties.reduce((sum, p) => sum + p.inquiries, 0);

    return {
      totalListings: providerProperties.length,
      activeListings,
      pendingListings,
      rejectedListings,
      draftListings,
      totalViews,
      totalInquiries,
      newInquiries: Math.floor(totalInquiries * 0.3), // Mock: 30% are new
      monthlyViews: Math.floor(totalViews * 0.6), // Mock: 60% are from this month
      conversionRate: totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0,
    };
  }, [providerProperties]);

  const handleAddProperty = () => {
    try {
      // Small delay to ensure auth state is stable
      setTimeout(() => {
        navigate('/add-property');
      }, 100);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location if navigate fails
      window.location.href = '/add-property';
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      await deleteProperty(propertyId);
    }
  };

  const handleResubmitProperty = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to resubmit this property for review? This will change its status to pending.')) {
      try {
        // Update property status to pending for resubmission
        const result = await propertyService.updateProperty(propertyId, { status: 'pending' });
        if (result.success) {
          // Refresh the properties list
          const updatedProperties = await propertyService.getProviderProperties();
          setProviderProperties(updatedProperties);

          // Show success message
          alert('Property resubmitted successfully! It will be reviewed by our admin team.');
        } else {
          alert('Failed to resubmit property. Please try again.');
        }
      } catch (error) {
        console.error('Error resubmitting property:', error);
        alert('An error occurred while resubmitting the property.');
      }
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

  // Only providers should access this dashboard
  if (user.role !== 'provider') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p>This dashboard is only available to property providers.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-6 sm:py-10 px-4 sm:px-6">
      <header className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gradient">Provider Dashboard</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Welcome back, {user.name}! Manage your listings and track performance.</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Button
              onClick={handleAddProperty}
              className="shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card className="brutal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <p className="text-xs text-muted-foreground">
              All property listings
            </p>
          </CardContent>
        </Card>

        <Card className="brutal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeListings}</div>
            <p className="text-xs text-muted-foreground">
              Published properties
            </p>
          </CardContent>
        </Card>

        <Card className="brutal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingListings}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card className="brutal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejectedListings}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
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
                  <Button onClick={handleAddProperty}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Property
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {providerProperties.map((property) => (
                    <div key={property.id} className="p-4 border rounded-lg space-y-4">
                      {/* Property Info */}
                      <div className="flex items-start space-x-4">
                        <img
                          src={property.images[0]?.url || '/placeholder.svg'}
                          alt={property.title}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base truncate">{property.title}</h3>
                              <p className="text-sm text-muted-foreground">{property.location.city}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                {getStatusBadge(property.status)}
                                <span className="text-sm font-medium">
                                  {property.currency} {property.price.toLocaleString()}
                                </span>
                              </div>

                              {/* Rejection Reason Display */}
                              {property.status === 'rejected' && property.rejectionReason && (
                                <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                  <p className="text-xs font-medium text-red-800 dark:text-red-200 mb-1">
                                    Rejection Reason:
                                  </p>
                                  <p className="text-xs text-red-700 dark:text-red-300">
                                    {property.rejectionReason}
                                  </p>
                                  {property.rejectedAt && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                      Rejected on {new Date(property.rejectedAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Mobile-friendly dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="flex-shrink-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {property.status === 'rejected' && (
                                  <DropdownMenuItem
                                    onClick={() => handleResubmitProperty(property.id)}
                                    className="text-blue-600"
                                  >
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Resubmit for Review
                                  </DropdownMenuItem>
                                )}
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
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {property.views} views
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {property.inquiries} inquiries
                        </div>
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
