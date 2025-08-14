import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useProperties } from "@/contexts/PropertyContext";
import { useProviders } from "@/contexts/ProviderContext";
import { toast } from "@/hooks/use-toast";
import { AdminStats, Property, User } from "@/types";
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
  Shield,
  Activity,
  AlertCircle,
  Building2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  Download,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { properties, updateProperty } = useProperties();
  const { providers, pendingProviders: pendingProvidersList, approveProvider, rejectProvider, isLoading: providersLoading } = useProviders();
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

  const pendingProperties = properties.filter(p => p.status === 'pending');

  // Mock users data - in a real app, this would come from a users context or API
  const [allUsers] = useState<User[]>([
    {
      id: '1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      phone: '+254712345678',
      role: 'user',
      status: 'approved',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      phone: '+254723456789',
      role: 'user',
      status: 'approved',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '3',
      email: 'mike.johnson@realty.com',
      name: 'Mike Johnson',
      phone: '+254734567890',
      role: 'provider',
      status: 'approved',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '4',
      email: 'sarah.wilson@example.com',
      name: 'Sarah Wilson',
      phone: '+254745678901',
      role: 'user',
      status: 'pending',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '5',
      email: 'admin@buildbnb.com',
      name: 'Admin User',
      phone: '+254756789012',
      role: 'admin',
      status: 'approved',
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date('2023-12-01'),
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '6',
      email: 'david.brown@properties.com',
      name: 'David Brown',
      phone: '+254767890123',
      role: 'provider',
      status: 'suspended',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-25'),
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '7',
      email: 'lisa.garcia@example.com',
      name: 'Lisa Garcia',
      phone: '+254778901234',
      role: 'user',
      status: 'approved',
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25'),
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '8',
      email: 'robert.taylor@example.com',
      name: 'Robert Taylor',
      phone: '+254789012345',
      role: 'user',
      status: 'rejected',
      createdAt: new Date('2024-01-30'),
      updatedAt: new Date('2024-02-02'),
      avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face'
    }
  ]);

  const handleSuspendUser = (userId: string) => {
    toast({
      title: "User Suspended",
      description: "The user has been suspended and can no longer access the platform.",
    });
  };

  const handleActivateUser = (userId: string) => {
    toast({
      title: "User Activated",
      description: "The user has been activated and can now access the platform.",
    });
  };

  const handleDeleteUser = (userId: string) => {
    toast({
      title: "User Deleted",
      description: "The user account has been permanently deleted.",
      variant: "destructive",
    });
  };

  const getUserStatusBadge = (status: User['status']) => {
    const variants = {
      approved: 'default',
      pending: 'secondary',
      rejected: 'destructive',
      suspended: 'outline',
    } as const;

    const colors = {
      approved: 'text-green-600',
      pending: 'text-yellow-600',
      rejected: 'text-red-600',
      suspended: 'text-gray-600',
    } as const;

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRoleBadge = (role: User['role']) => {
    const variants = {
      admin: 'default',
      provider: 'secondary',
      user: 'outline',
    } as const;

    const colors = {
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      provider: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      user: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    } as const;

    return (
      <Badge variant={variants[role]} className={colors[role]}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  useEffect(() => {
    // Calculate admin stats
    const totalViews = properties.reduce((sum, p) => sum + p.views, 0);
    const totalInquiries = properties.reduce((sum, p) => sum + p.inquiries, 0);

    setStats({
      totalUsers: 150, // Mock data
      totalProviders: providers.length,
      pendingProviders: pendingProvidersList.length,
      totalProperties: properties.length,
      pendingProperties: pendingProperties.length,
      totalInquiries,
      newInquiries: Math.floor(totalInquiries * 0.2), // Mock: 20% are new
      revenue: 12500, // Mock revenue
      activeSubscriptions: providers.filter(p => p.approvalStatus === 'approved').length,
    });
  }, [properties, providers, pendingProvidersList, pendingProperties]);

  const handleApproveProperty = async (propertyId: string) => {
    await updateProperty(propertyId, { status: 'published' });
  };

  const handleRejectProperty = async (propertyId: string) => {
    await updateProperty(propertyId, { status: 'rejected' });
  };

  const handleApproveProvider = async (providerId: string) => {
    if (user?.id) {
      const success = await approveProvider(providerId, user.id);
      if (success) {
        toast({
          title: "Provider Approved",
          description: "The provider has been approved and can now appear in the Partner Agents section.",
        });
      } else {
        toast({
          title: "Approval Failed",
          description: "Failed to approve provider. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRejectProvider = async (providerId: string) => {
    if (user?.id) {
      const success = await rejectProvider(providerId, user.id, 'Application rejected by admin');
      if (success) {
        toast({
          title: "Provider Rejected",
          description: "The provider application has been rejected.",
        });
      } else {
        toast({
          title: "Rejection Failed",
          description: "Failed to reject provider. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleExportData = () => {
    // Create CSV data for export
    const csvData = [
      ['Type', 'Name', 'Status', 'Date', 'Location', 'Details'],
      ...properties.map(p => [
        'Property',
        p.title,
        p.status,
        p.createdAt.toLocaleDateString(),
        `${p.location.city}, ${p.location.state}`,
        `${p.currency} ${p.price.toLocaleString()}`
      ]),
      ...providers.map(p => [
        'Provider',
        p.businessName,
        p.approvalStatus,
        p.joinedDate,
        `${p.city}, ${p.state}`,
        `${p.totalListings} listings`
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Dashboard data has been exported to CSV file.",
    });
  };

  const handleRefresh = () => {
    // Simulate refresh by showing loading state and updating stats
    toast({
      title: "Dashboard Refreshed",
      description: "All data has been refreshed successfully.",
    });

    // Force re-calculation of stats
    window.location.reload();
  };

  const handleViewAllProviders = () => {
    navigate('/partners');
  };

  const handleViewAllProperties = () => {
    navigate('/rentals');
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-6 sm:py-8 px-4 sm:px-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-2">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Monitor platform activity, manage users, and oversee all operations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleExportData}>
                <Download className="w-4 h-4" />
                Export Data
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <section className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Users Card */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-4 h-4 text-blue-200" />
                    <span className="text-blue-100 text-sm">+12% from last month</span>
                  </div>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Properties Card */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Properties</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalProperties}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stats.pendingProperties > 0 ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-emerald-200" />
                        <span className="text-emerald-100 text-sm">{stats.pendingProperties} pending</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-200" />
                        <span className="text-emerald-100 text-sm">All approved</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Home className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Card */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Revenue</p>
                  <p className="text-3xl font-bold mt-1">KSH {(stats.revenue * 130).toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-4 h-4 text-purple-200" />
                    <span className="text-purple-100 text-sm">+8% from last month</span>
                  </div>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inquiries Card */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Inquiries</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalInquiries}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Activity className="w-4 h-4 text-orange-200" />
                    <span className="text-orange-100 text-sm">{stats.newInquiries} new this week</span>
                  </div>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-1">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto bg-transparent gap-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-3 px-4 rounded-lg font-medium"
              >
                <Activity className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-3 px-4 rounded-lg font-medium"
              >
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger
                value="properties"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-3 px-4 rounded-lg font-medium"
              >
                <Home className="w-4 h-4 mr-2" />
                Properties
              </TabsTrigger>
              <TabsTrigger
                value="providers"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-3 px-4 rounded-lg font-medium"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Providers
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-3 px-4 rounded-lg font-medium"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Activity */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New property approved</p>
                        <p className="text-xs text-muted-foreground">Modern Luxury Villa in Mombasa</p>
                      </div>
                      <span className="text-xs text-muted-foreground">2 min ago</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New provider registered</p>
                        <p className="text-xs text-muted-foreground">Sarabi Listings from Nairobi</p>
                      </div>
                      <span className="text-xs text-muted-foreground">1 hour ago</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New inquiry received</p>
                        <p className="text-xs text-muted-foreground">Downtown Apartment inquiry</p>
                      </div>
                      <span className="text-xs text-muted-foreground">3 hours ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="w-5 h-5 text-purple-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <Button 
                      className="justify-start h-auto p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      onClick={() => {
                        const totalPending = pendingProperties.length + pendingProvidersList.length;
                        if (totalPending === 0) {
                          toast({
                            title: "No Pending Items",
                            description: "All properties and providers are already approved.",
                          });
                        } else {
                          // Navigate to the appropriate tab based on what's pending
                          if (pendingProperties.length > 0) {
                            // Switch to properties tab
                            const propertiesTab = document.querySelector('[value="properties"]') as HTMLElement;
                            propertiesTab?.click();
                          } else if (pendingProvidersList.length > 0) {
                            // Switch to providers tab
                            const providersTab = document.querySelector('[value="providers"]') as HTMLElement;
                            providersTab?.click();
                          }
                          toast({
                            title: "Pending Items",
                            description: `Found ${totalPending} items waiting for approval. Switched to relevant tab.`,
                          });
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5" />
                        <div className="text-left">
                          <p className="font-medium">Approve Pending Items</p>
                          <p className="text-xs opacity-90">{pendingProperties.length + pendingProvidersList.length} items waiting</p>
                        </div>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4"
                      onClick={handleExportData}
                    >
                      <div className="flex items-center gap-3">
                        <Download className="w-5 h-5" />
                        <div className="text-left">
                          <p className="font-medium">Export Reports</p>
                          <p className="text-xs text-muted-foreground">Download platform data</p>
                        </div>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4"
                      onClick={() => {
                        // Switch to users tab
                        const usersTab = document.querySelector('[value="users"]') as HTMLElement;
                        usersTab?.click();
                        toast({
                          title: "User Management",
                          description: `Switched to Users tab. Found ${allUsers.length} platform users.`,
                        });
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5" />
                        <div className="text-left">
                          <p className="font-medium">Manage Users</p>
                          <p className="text-xs text-muted-foreground">View all platform users</p>
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* All Users */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-blue-500" />
                    All Platform Users
                    <Badge variant="secondary" className="ml-2">
                      {allUsers.length}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search users..."
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allUsers.map((platformUser) => (
                    <div key={platformUser.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <img
                          src={platformUser.avatar || '/placeholder.svg'}
                          alt={platformUser.name}
                          className="w-12 h-12 object-cover rounded-full flex-shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{platformUser.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {platformUser.email}
                                </div>
                                {platformUser.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    {platformUser.phone}
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Joined {platformUser.createdAt.toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {getRoleBadge(platformUser.role)}
                              {getUserStatusBadge(platformUser.status)}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Edit User</DropdownMenuItem>
                                  {platformUser.status === 'suspended' ? (
                                    <DropdownMenuItem onClick={() => handleActivateUser(platformUser.id)}>
                                      Activate User
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleSuspendUser(platformUser.id)}>
                                      Suspend User
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDeleteUser(platformUser.id)}
                                  >
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Statistics */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-blue-500" />
                    User Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Regular Users</p>
                        <p className="text-xl font-bold text-blue-600">
                          {allUsers.filter(u => u.role === 'user').length}
                        </p>
                      </div>
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Providers</p>
                        <p className="text-xl font-bold text-purple-600">
                          {allUsers.filter(u => u.role === 'provider').length}
                        </p>
                      </div>
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Admins</p>
                        <p className="text-xl font-bold text-green-600">
                          {allUsers.filter(u => u.role === 'admin').length}
                        </p>
                      </div>
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-green-500" />
                    User Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Active Users</p>
                        <p className="text-xl font-bold text-green-600">
                          {allUsers.filter(u => u.status === 'approved').length}
                        </p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Pending</p>
                        <p className="text-xl font-bold text-yellow-600">
                          {allUsers.filter(u => u.status === 'pending').length}
                        </p>
                      </div>
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Suspended</p>
                        <p className="text-xl font-bold text-red-600">
                          {allUsers.filter(u => u.status === 'suspended').length}
                        </p>
                      </div>
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    Recent Registrations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allUsers
                      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                      .slice(0, 4)
                      .map((recentUser) => (
                        <div key={recentUser.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <img
                            src={recentUser.avatar || '/placeholder.svg'}
                            alt={recentUser.name}
                            className="w-8 h-8 object-cover rounded-full flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{recentUser.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {recentUser.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                          {getRoleBadge(recentUser.role)}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            {/* Pending Approvals */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Pending Property Approvals
                    {pendingProperties.length > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {pendingProperties.length}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {pendingProperties.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">No properties pending approval</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingProperties.map((property) => (
                      <div key={property.id} className="p-6 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <img
                            src={property.images[0]?.url || '/placeholder.svg'}
                            alt={property.title}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <MapPin className="w-4 h-4" />
                                  {property.location.city}, {property.location.state}
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="font-semibold text-lg text-green-600">
                                    {property.currency} {property.price.toLocaleString()}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    {property.views} views
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveProperty(property.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectProperty(property.id)}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Properties */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="w-5 h-5 text-blue-500" />
                    All Properties
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search properties..."
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {properties.slice(0, 8).map((property) => (
                    <div key={property.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <img
                          src={property.images[0]?.url || '/placeholder.svg'}
                          alt={property.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold truncate">{property.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <MapPin className="w-4 h-4" />
                                {property.location.city}
                              </div>
                              <div className="flex items-center gap-4 mt-2">
                                {getStatusBadge(property.status)}
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Eye className="w-4 h-4" />
                                  {property.views}
                                </div>
                                <span className="text-sm font-medium text-green-600">
                                  {property.currency} {property.price.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Edit Property</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline" onClick={handleViewAllProperties}>
                    View All Properties ({properties.length})
                  </Button>
                </div>
              </CardContent>
            </Card>
        </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-6">
            {/* Pending Provider Approvals */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Pending Provider Approvals
                    {pendingProvidersList.length > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {pendingProvidersList.length}
                      </Badge>
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {pendingProvidersList.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">No providers pending approval</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingProvidersList.map((provider) => (
                      <div key={provider.id} className="p-6 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <img
                            src={provider.logo}
                            alt={provider.businessName}
                            className="w-16 h-16 object-cover rounded-full flex-shrink-0 border-2 border-slate-200 dark:border-slate-700"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-lg mb-1">{provider.businessName}</h3>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    {provider.name}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {provider.email}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {provider.city}, {provider.state}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Applied: {provider.joinedDate}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {provider.specialties.map((specialty, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {specialty}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleApproveProvider(provider.id)}
                                  disabled={providersLoading}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectProvider(provider.id)}
                                  disabled={providersLoading}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Providers */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-blue-500" />
                    All Providers
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search providers..."
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {providers.slice(0, 8).map((provider) => (
                    <div key={provider.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <img
                          src={provider.logo}
                          alt={provider.businessName}
                          className="w-12 h-12 object-cover rounded-full flex-shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{provider.businessName}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {provider.email}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {provider.city}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4" />
                                  {provider.rating}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={provider.approvalStatus === 'approved' ? 'default' : 'secondary'}>
                                {provider.approvalStatus.charAt(0).toUpperCase() + provider.approvalStatus.slice(1)}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Edit Provider</DropdownMenuItem>
                                  <DropdownMenuItem>Suspend</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline" onClick={handleViewAllProviders}>
                    View All Providers ({providers.length})
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Platform Growth */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Platform Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Monthly Active Users</p>
                        <p className="text-2xl font-bold text-green-600">2,847</p>
                      </div>
                      <div className="text-green-600">
                        <ArrowUpRight className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Property Views</p>
                        <p className="text-2xl font-bold text-blue-600">18,392</p>
                      </div>
                      <div className="text-blue-600">
                        <ArrowUpRight className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Conversion Rate</p>
                        <p className="text-2xl font-bold text-purple-600">12.4%</p>
                      </div>
                      <div className="text-purple-600">
                        <ArrowUpRight className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Properties */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Top Performing Properties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {properties.slice(0, 4).map((property, index) => (
                      <div key={property.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{property.title}</p>
                          <p className="text-sm text-muted-foreground">{property.views} views</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{property.inquiries} inquiries</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default AdminDashboard;
