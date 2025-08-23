import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useProperties } from "@/contexts/PropertyContext";
import { useProviders } from "@/contexts/ProviderContext";
import { useAdmin } from "@/contexts/AdminContext";
import { propertyService } from "@/lib/supabase-properties";
import { toast } from "@/hooks/use-toast";
import { AdminStats, Property, User } from "@/types";
import { analyticsService, GrowthMetrics } from "@/lib/supabase-analytics";
import {
  Users,
  Home,
  Eye,
  MessageSquare,
  DollarSign,
  TrendingUp,
  TrendingDown,
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
  RefreshCw,
  UserCheck,
  UserX,
  Trash2,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AdminSessionKeeper } from "@/components/AdminSessionKeeper";
import { PropertyEditDialog } from "@/components/PropertyEditDialog";
import { PropertyDetailsDialog } from "@/components/PropertyDetailsDialog";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { properties, updateProperty, deleteProperty, refreshProperties } = useProperties();
  const { providers, pendingProviders: pendingProvidersList, approveProvider, rejectProvider, isLoading: providersLoading } = useProviders();
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics>({
    userGrowth: 0,
    providerGrowth: 0,
    propertyGrowth: 0,
    revenueGrowth: 0,
    inquiryGrowth: 0,
    viewsGrowth: 0
  });
  const [isLoadingGrowth, setIsLoadingGrowth] = useState(true);
  const {
    users,
    userStats,
    totalUsers,
    currentPage,
    totalPages,
    isLoadingUsers,
    activityFeed,
    notifications,
    unreadNotificationCount,
    isLoadingActivity,
    dashboardAnalytics,
    isLoadingAnalytics,
    loadUsers,
    searchUsers,
    suspendUser,
    activateUser,
    deleteUser,
    refreshStats,
    refreshActivity,
    refreshAnalytics
  } = useAdmin();

  const pendingProperties = properties.filter(p => p.status === 'pending');
  const approvedProperties = properties.filter(p => p.status === 'published' || p.status === 'approved');

  // User management state
  const [searchQuery, setSearchQuery] = useState("");
  const [suspendDialog, setSuspendDialog] = useState<{open: boolean, userId: string, userName: string}>({
    open: false,
    userId: "",
    userName: ""
  });

  // Property management state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean, propertyId: string, propertyTitle: string}>({
    open: false,
    propertyId: "",
    propertyTitle: ""
  });
  const [suspendReason, setSuspendReason] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Load growth metrics on component mount
  useEffect(() => {
    const loadGrowthMetrics = async () => {
      try {
        setIsLoadingGrowth(true);
        const metrics = await analyticsService.getGrowthMetrics();
        setGrowthMetrics(metrics);
      } catch (error) {
        console.error('Error loading growth metrics:', error);
      } finally {
        setIsLoadingGrowth(false);
      }
    };

    loadGrowthMetrics();
  }, []);

  // Calculate stats from real analytics data
  const stats: AdminStats = {
    totalUsers: dashboardAnalytics?.overview.total_users || 0,
    totalProviders: dashboardAnalytics?.overview.total_providers || 0,
    pendingProviders: dashboardAnalytics?.overview.pending_providers || 0,
    totalProperties: dashboardAnalytics?.overview.total_properties || 0,
    pendingProperties: dashboardAnalytics?.overview.pending_properties || 0,
    totalInquiries: dashboardAnalytics?.property_performance.reduce((sum, day) => sum + day.total_inquiries, 0) || 0,
    newInquiries: dashboardAnalytics?.property_performance[0]?.total_inquiries || 0,
    revenue: dashboardAnalytics?.overview.total_revenue || 0,
    activeSubscriptions: dashboardAnalytics?.overview.active_providers || 0,
  };

  // Real user action handlers
  const handleSuspendUser = (userId: string, userName: string) => {
    setSuspendDialog({ open: true, userId, userName });
  };

  const handleConfirmSuspend = async () => {
    if (!suspendReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for suspension.",
        variant: "destructive",
      });
      return;
    }

    setIsActionLoading(true);
    try {
      const result = await suspendUser(suspendDialog.userId, suspendReason);

      if (result.success) {
        toast({
          title: "User Suspended",
          description: result.message,
        });
        setSuspendDialog({ open: false, userId: "", userName: "" });
        setSuspendReason("");
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleActivateUser = async (userId: string) => {
    setIsActionLoading(true);
    try {
      const result = await activateUser(userId);

      if (result.success) {
        toast({
          title: "User Activated",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    setIsActionLoading(true);
    try {
      const result = await deleteUser(userId, "Admin deletion");

      if (result.success) {
        toast({
          title: "User Deleted",
          description: result.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle search with debouncing
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchUsers(query.trim());
    } else {
      await loadUsers(1);
    }
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



  const handleApproveProperty = async (propertyId: string) => {
    console.log('🔄 Admin approving property:', propertyId);
    const result = await propertyService.approveProperty(propertyId);

    if (result.success) {
      toast({
        title: "Property Approved",
        description: "The property has been published and is now visible to the public.",
      });
      // Refresh properties data without page reload
      await Promise.all([
        refreshStats(),
        refreshAnalytics(),
        refreshProperties()
      ]);
    } else {
      toast({
        title: "Approval Failed",
        description: result.error || "Failed to approve property. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectProperty = async (propertyId: string) => {
    console.log('🔄 Admin rejecting property:', propertyId);
    const result = await propertyService.rejectProperty(propertyId);

    if (result.success) {
      toast({
        title: "Property Rejected",
        description: "The property has been rejected and will not be published.",
      });
      // Refresh properties data without page reload
      await Promise.all([
        refreshStats(),
        refreshAnalytics(),
        refreshProperties()
      ]);
    } else {
      toast({
        title: "Rejection Failed",
        description: result.error || "Failed to reject property. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApproveProvider = async (providerId: string) => {
    if (user?.id) {
      const success = await approveProvider(providerId, user.id);
      if (success) {
        toast({
          title: "Provider Approved",
          description: "The provider has been approved and can now access their dashboard. They may need to refresh their browser to see the changes.",
          duration: 6000,
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

  const handleRefresh = async () => {
    // Refresh all dashboard data without page reload
    toast({
      title: "Dashboard Refreshed",
      description: "All data has been refreshed successfully.",
    });

    // Refresh all data sources
    await Promise.all([
      refreshStats(),
      refreshActivity(),
      refreshAnalytics(),
      refreshProperties()
    ]);
  };

  const handleViewAllProviders = () => {
    navigate('/partners');
  };

  const handleViewAllProperties = () => {
    navigate('/rentals');
  };

  // Property management handlers
  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsDetailsDialogOpen(true);
  };

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProperty = (property: Property) => {
    setDeleteDialog({
      open: true,
      propertyId: property.id,
      propertyTitle: property.title
    });
  };

  const confirmDeleteProperty = async () => {
    if (deleteDialog.propertyId) {
      const success = await deleteProperty(deleteDialog.propertyId);
      if (success) {
        toast({
          title: "Property Deleted",
          description: "The property has been deleted successfully.",
        });
      } else {
        toast({
          title: "Delete Failed",
          description: "Failed to delete the property. Please try again.",
          variant: "destructive",
        });
      }
    }
    setDeleteDialog({ open: false, propertyId: "", propertyTitle: "" });
  };

  const handlePropertySaved = () => {
    // Refresh data or handle any post-save actions
    toast({
      title: "Property Updated",
      description: "The property has been updated successfully.",
    });
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

  console.log('✅ AdminDashboard: Rendering dashboard for admin user:', user.email);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <AdminSessionKeeper />
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
                    {isLoadingGrowth ? (
                      <span className="text-blue-100 text-sm">Loading...</span>
                    ) : (
                      <>
                        {analyticsService.formatGrowthPercentage(growthMetrics.userGrowth).isPositive ? (
                          <ArrowUpRight className="w-4 h-4 text-blue-200" />
                        ) : analyticsService.formatGrowthPercentage(growthMetrics.userGrowth).isNeutral ? (
                          <Activity className="w-4 h-4 text-blue-200" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-blue-200" />
                        )}
                        <span className={`text-sm ${
                          analyticsService.formatGrowthPercentage(growthMetrics.userGrowth).isPositive
                            ? 'text-blue-100'
                            : analyticsService.formatGrowthPercentage(growthMetrics.userGrowth).isNeutral
                              ? 'text-blue-200'
                              : 'text-blue-300'
                        }`}>
                          {analyticsService.formatGrowthPercentage(growthMetrics.userGrowth).text}
                        </span>
                      </>
                    )}
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
                    {isLoadingGrowth ? (
                      <span className="text-emerald-100 text-sm">Loading...</span>
                    ) : (
                      <>
                        {analyticsService.formatGrowthPercentage(growthMetrics.propertyGrowth).isPositive ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-200" />
                        ) : analyticsService.formatGrowthPercentage(growthMetrics.propertyGrowth).isNeutral ? (
                          <Activity className="w-4 h-4 text-emerald-200" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-emerald-200" />
                        )}
                        <span className={`text-sm ${
                          analyticsService.formatGrowthPercentage(growthMetrics.propertyGrowth).isPositive
                            ? 'text-emerald-100'
                            : analyticsService.formatGrowthPercentage(growthMetrics.propertyGrowth).isNeutral
                              ? 'text-emerald-200'
                              : 'text-emerald-300'
                        }`}>
                          {analyticsService.formatGrowthPercentage(growthMetrics.propertyGrowth).text}
                        </span>
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
                    {isLoadingGrowth ? (
                      <span className="text-purple-100 text-sm">Loading...</span>
                    ) : (
                      <>
                        {analyticsService.formatGrowthPercentage(growthMetrics.revenueGrowth).isPositive ? (
                          <ArrowUpRight className="w-4 h-4 text-purple-200" />
                        ) : analyticsService.formatGrowthPercentage(growthMetrics.revenueGrowth).isNeutral ? (
                          <Activity className="w-4 h-4 text-purple-200" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-purple-200" />
                        )}
                        <span className={`text-sm ${
                          analyticsService.formatGrowthPercentage(growthMetrics.revenueGrowth).isPositive
                            ? 'text-purple-100'
                            : analyticsService.formatGrowthPercentage(growthMetrics.revenueGrowth).isNeutral
                              ? 'text-purple-200'
                              : 'text-purple-300'
                        }`}>
                          {analyticsService.formatGrowthPercentage(growthMetrics.revenueGrowth).text}
                        </span>
                      </>
                    )}
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
                    {isLoadingGrowth ? (
                      <span className="text-orange-100 text-sm">Loading...</span>
                    ) : (
                      <>
                        {analyticsService.formatGrowthPercentage(growthMetrics.inquiryGrowth).isPositive ? (
                          <ArrowUpRight className="w-4 h-4 text-orange-200" />
                        ) : analyticsService.formatGrowthPercentage(growthMetrics.inquiryGrowth).isNeutral ? (
                          <Activity className="w-4 h-4 text-orange-200" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-orange-200" />
                        )}
                        <span className={`text-sm ${
                          analyticsService.formatGrowthPercentage(growthMetrics.inquiryGrowth).isPositive
                            ? 'text-orange-100'
                            : analyticsService.formatGrowthPercentage(growthMetrics.inquiryGrowth).isNeutral
                              ? 'text-orange-200'
                              : 'text-orange-300'
                        }`}>
                          {analyticsService.formatGrowthPercentage(growthMetrics.inquiryGrowth).text}
                        </span>
                      </>
                    )}
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
                  {isLoadingActivity ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      Loading activity...
                    </div>
                  ) : activityFeed.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent activity
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activityFeed.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.actionType.includes('approve') ? 'bg-green-500' :
                            activity.actionType.includes('suspend') ? 'bg-red-500' :
                            activity.actionType.includes('activate') ? 'bg-blue-500' :
                            'bg-orange-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {activity.actionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activity.adminName} • {activity.targetEmail}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                      {activityFeed.length > 5 && (
                        <div className="text-center pt-2">
                          <span className="text-xs text-muted-foreground">
                            Showing 5 of {activityFeed.length} recent activities
                          </span>
                        </div>
                      )}
                    </div>
                  )}
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
                          description: `Switched to Users tab. Found ${totalUsers} platform users.`,
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
                      {totalUsers}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search users..."
                        className="pl-10 w-64"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => loadUsers(1)}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading users...
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((platformUser) => (
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
                                    <DropdownMenuItem
                                      onClick={() => handleActivateUser(platformUser.id)}
                                      disabled={isActionLoading}
                                    >
                                      <UserCheck className="w-4 h-4 mr-2" />
                                      Activate User
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => handleSuspendUser(platformUser.id, platformUser.name)}
                                      disabled={isActionLoading}
                                    >
                                      <UserX className="w-4 h-4 mr-2" />
                                      Suspend User
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteUser(platformUser.id)}
                                    disabled={isActionLoading}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
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
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {users.length} of {totalUsers} users
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadUsers(currentPage - 1)}
                        disabled={currentPage === 1 || isLoadingUsers}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadUsers(currentPage + 1)}
                        disabled={currentPage === totalPages || isLoadingUsers}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
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
                          {userStats?.usersByRole.user || 0}
                        </p>
                      </div>
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Providers</p>
                        <p className="text-xl font-bold text-purple-600">
                          {userStats?.usersByRole.provider || 0}
                        </p>
                      </div>
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Admins</p>
                        <p className="text-xl font-bold text-green-600">
                          {userStats?.usersByRole.admin || 0}
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
                          {userStats?.activeUsers || 0}
                        </p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Pending</p>
                        <p className="text-xl font-bold text-yellow-600">
                          {users.filter(u => u.status === 'pending').length}
                        </p>
                      </div>
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Suspended</p>
                        <p className="text-xl font-bold text-red-600">
                          {userStats?.suspendedUsers || 0}
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
                    {users
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
                {approvedProperties.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No approved properties yet</h3>
                    <p className="text-muted-foreground">Approved properties will appear here once you approve pending submissions</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {approvedProperties.slice(0, 8).map((property) => (
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
                                    <DropdownMenuItem onClick={() => handleViewProperty(property)}>
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEditProperty(property)}>
                                      Edit Property
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleDeleteProperty(property)}
                                    >
                                      Delete
                                    </DropdownMenuItem>
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
                        View All Properties ({approvedProperties.length})
                      </Button>
                    </div>
                  </>
                )}
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
            {isLoadingAnalytics ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mr-3" />
                Loading analytics...
              </div>
            ) : (
              <>
                {/* Real-time Metrics */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                          <p className="text-2xl font-bold">{dashboardAnalytics?.overview.active_users || 0}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-500" />
                      </div>
                      <div className="mt-2 text-xs text-green-600">
                        +{dashboardAnalytics?.overview.new_users_30_days || 0} this month
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Properties</p>
                          <p className="text-2xl font-bold">{dashboardAnalytics?.overview.active_properties || 0}</p>
                        </div>
                        <Home className="w-8 h-8 text-green-500" />
                      </div>
                      <div className="mt-2 text-xs text-green-600">
                        +{dashboardAnalytics?.overview.new_properties_30_days || 0} this month
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Daily Activity</p>
                          <p className="text-2xl font-bold">{dashboardAnalytics?.overview.daily_activities || 0}</p>
                        </div>
                        <Activity className="w-8 h-8 text-purple-500" />
                      </div>
                      <div className="mt-2 text-xs text-blue-600">
                        {dashboardAnalytics?.overview.daily_logins || 0} logins today
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                          <p className="text-2xl font-bold">KSH {(dashboardAnalytics?.overview.total_revenue || 0).toLocaleString()}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-yellow-500" />
                      </div>
                      <div className="mt-2 text-xs text-green-600">
                        +KSH {(dashboardAnalytics?.overview.revenue_30_days || 0).toLocaleString()} this month
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* User Growth Chart */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        User Growth (Last 30 Days)
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={refreshAnalytics}
                          disabled={isLoadingAnalytics}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dashboardAnalytics?.user_growth && dashboardAnalytics.user_growth.length > 0 ? (
                        <div className="space-y-3">
                          {dashboardAnalytics.user_growth.slice(-7).map((day, index) => (
                            <div key={day.date} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                              <div>
                                <p className="text-sm font-medium">{new Date(day.date).toLocaleDateString()}</p>
                                <p className="text-xs text-muted-foreground">New registrations</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-green-600">+{day.new_users}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No growth data available
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Property Performance */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Eye className="w-5 h-5 text-blue-500" />
                        Property Performance (Last 7 Days)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dashboardAnalytics?.property_performance && dashboardAnalytics.property_performance.length > 0 ? (
                        <div className="space-y-3">
                          {dashboardAnalytics.property_performance.slice(-7).map((day, index) => (
                            <div key={day.date} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                              <div>
                                <p className="text-sm font-medium">{new Date(day.date).toLocaleDateString()}</p>
                                <p className="text-xs text-muted-foreground">Daily metrics</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">{day.total_views} views</p>
                                <p className="text-xs text-muted-foreground">{day.total_inquiries} inquiries</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No performance data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Activity Trends */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="w-5 h-5 text-purple-500" />
                      Platform Activity Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dashboardAnalytics?.activity_trends && dashboardAnalytics.activity_trends.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {dashboardAnalytics.activity_trends.slice(-7).map((day) => (
                          <div key={day.date} className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                            <p className="text-sm font-medium">{new Date(day.date).toLocaleDateString()}</p>
                            <p className="text-2xl font-bold text-purple-600">{day.activity_count}</p>
                            <p className="text-xs text-muted-foreground">activities</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No activity data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Suspend User Dialog */}
      <Dialog open={suspendDialog.open} onOpenChange={(open) => setSuspendDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              You are about to suspend <strong>{suspendDialog.userName}</strong>.
              Please provide a reason for this action.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter reason for suspension..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSuspendDialog({ open: false, userId: "", userName: "" });
                setSuspendReason("");
              }}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmSuspend}
              disabled={isActionLoading || !suspendReason.trim()}
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Suspending...
                </>
              ) : (
                "Suspend User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Property Details Dialog */}
      <PropertyDetailsDialog
        property={selectedProperty}
        isOpen={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false);
          setSelectedProperty(null);
        }}
      />

      {/* Property Edit Dialog */}
      <PropertyEditDialog
        property={selectedProperty}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedProperty(null);
        }}
        onSave={handlePropertySaved}
      />

      {/* Delete Property Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              You are about to permanently delete <strong>{deleteDialog.propertyTitle}</strong>.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, propertyId: "", propertyTitle: "" })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteProperty}
            >
              Delete Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default AdminDashboard;
