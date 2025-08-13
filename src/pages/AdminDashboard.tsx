import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useProperties } from "@/contexts/PropertyContext";
import { AdminStats, Property } from "@/types";
import {
  Users,
  Home,
  Eye,
  MessageSquare,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Shield
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { properties, updateProperty } = useProperties();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProviders: 0,
    pendingProviders: 0,
    totalProperties: 0,
    pendingProperties: 0,
    totalInquiries: 0,
    newInquiries: 0,
    revenue: 0,
    activeSubscriptions: 0,
  });

  // Mock data for providers (in real app, this would come from API)
  const mockProviders = [
    { id: 'provider-1', name: 'John Provider', email: 'provider@example.com', status: 'approved', joinDate: '2024-01-15' },
    { id: 'provider-2', name: 'Jane Business', email: 'jane@business.com', status: 'pending', joinDate: '2024-02-20' },
    { id: 'provider-3', name: 'Mike Properties', email: 'mike@properties.com', status: 'pending', joinDate: '2024-02-25' },
  ];

  const pendingProperties = properties.filter(p => p.status === 'pending');
  const pendingProviders = mockProviders.filter(p => p.status === 'pending');

  useEffect(() => {
    // Calculate admin stats
    const totalViews = properties.reduce((sum, p) => sum + p.views, 0);
    const totalInquiries = properties.reduce((sum, p) => sum + p.inquiries, 0);

    setStats({
      totalUsers: 150, // Mock data
      totalProviders: mockProviders.length,
      pendingProviders: pendingProviders.length,
      totalProperties: properties.length,
      pendingProperties: pendingProperties.length,
      totalInquiries,
      newInquiries: Math.floor(totalInquiries * 0.2), // Mock: 20% are new
      revenue: 12500, // Mock revenue
      activeSubscriptions: mockProviders.filter(p => p.status === 'approved').length,
    });
  }, [properties, pendingProviders.length, pendingProperties.length]);

  const handleApproveProperty = async (propertyId: string) => {
    await updateProperty(propertyId, { status: 'published' });
  };

  const handleRejectProperty = async (propertyId: string) => {
    await updateProperty(propertyId, { status: 'rejected' });
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

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-gradient">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor platform activity, manage users, and oversee all operations.</p>
      </header>

      {/* Stats Overview */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="brutal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProviders} providers
            </p>
          </CardContent>
        </Card>

        <Card className="brutal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingProperties} pending approval
            </p>
          </CardContent>
        </Card>

        <Card className="brutal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSubscriptions} active subscriptions
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
      </section>

      {/* Main Content */}
      <Tabs defaultValue="properties" className="space-y-6">
        <TabsList>
          <TabsTrigger value="properties">Property Approvals</TabsTrigger>
          <TabsTrigger value="providers">Provider Management</TabsTrigger>
          <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-6">
          <Card className="brutal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Property Approvals ({pendingProperties.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingProperties.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">No properties pending approval</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingProperties.map((property) => (
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

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveProperty(property.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectProperty(property.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="brutal-card">
            <CardHeader>
              <CardTitle>All Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {properties.slice(0, 5).map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={property.images[0]?.url || '/placeholder.svg'}
                        alt={property.title}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <div>
                        <h3 className="font-medium">{property.title}</h3>
                        <p className="text-sm text-muted-foreground">{property.location.city}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {getStatusBadge(property.status)}
                      <div className="text-right text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Eye className="w-4 h-4 mr-1" />
                          {property.views}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          <Card className="brutal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Provider Approvals ({pendingProviders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingProviders.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">No providers pending approval</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingProviders.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground">{provider.email}</p>
                        <p className="text-xs text-muted-foreground">Applied: {provider.joinDate}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="brutal-card">
            <CardHeader>
              <CardTitle>All Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProviders.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{provider.name}</h3>
                      <p className="text-sm text-muted-foreground">{provider.email}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <Badge variant={provider.status === 'approved' ? 'default' : 'secondary'}>
                        {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Suspend</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="brutal-card">
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics Coming Soon</h3>
                <p className="text-muted-foreground">Detailed platform analytics and insights will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default AdminDashboard;
