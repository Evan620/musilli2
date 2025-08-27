import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { planService } from "@/lib/supabase-plans";
import { ArchitecturalPlan, PlanCategory, PlanStatus } from "@/types";
import { ArchitecturalPlanForm } from "@/components/ui/architectural-plan-form";
import {
  Home,
  Eye,
  Download,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Filter,
  Search,
  Edit,
  Check,
  X,
  FileText,
  Calendar,
  DollarSign,
  Plus
} from "lucide-react";

interface PlansAnalytics {
  totalPlans: number;
  publishedPlans: number;
  pendingPlans: number;
  totalDownloads: number;
  totalRevenue: number;
  popularCategories: { category: string; count: number }[];
  recentPurchases: number;
}

const PlansManagement = () => {
  const [plans, setPlans] = useState<ArchitecturalPlan[]>([]);
  const [analytics, setAnalytics] = useState<PlansAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PlanStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<PlanCategory | "all">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ArchitecturalPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load plans and analytics
  const loadPlansData = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Loading plans data...');
      
      // Load all plans (admin can see all)
      const allPlans = await planService.getAllPlans();
      setPlans(allPlans);
      
      // Calculate analytics
      const analytics: PlansAnalytics = {
        totalPlans: allPlans.length,
        publishedPlans: allPlans.filter(p => p.status === 'published').length,
        pendingPlans: allPlans.filter(p => p.status === 'pending').length,
        totalDownloads: allPlans.reduce((sum, p) => sum + p.downloads, 0),
        totalRevenue: allPlans.reduce((sum, p) => sum + (p.purchases * p.price), 0),
        popularCategories: calculatePopularCategories(allPlans),
        recentPurchases: allPlans.reduce((sum, p) => sum + p.purchases, 0)
      };
      
      setAnalytics(analytics);
      console.log('✅ Plans data loaded:', { plans: allPlans.length, analytics });
    } catch (error) {
      console.error('❌ Error loading plans data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePopularCategories = (plans: ArchitecturalPlan[]) => {
    const categoryCount: Record<string, number> = {};
    plans.forEach(plan => {
      categoryCount[plan.category] = (categoryCount[plan.category] || 0) + 1;
    });
    
    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const handleApprovePlan = async (planId: string) => {
    try {
      const result = await planService.approvePlan(planId, 'admin-user-id'); // TODO: Get actual admin ID
      if (result.success) {
        console.log('✅ Plan approved');
        loadPlansData(); // Refresh data
      } else {
        console.error('❌ Failed to approve plan:', result.error);
      }
    } catch (error) {
      console.error('❌ Error approving plan:', error);
    }
  };

  const handleRejectPlan = async (planId: string, reason: string) => {
    try {
      const result = await planService.rejectPlan(planId, 'admin-user-id', reason); // TODO: Get actual admin ID
      if (result.success) {
        console.log('✅ Plan rejected');
        loadPlansData(); // Refresh data
      } else {
        console.error('❌ Failed to reject plan:', result.error);
      }
    } catch (error) {
      console.error('❌ Error rejecting plan:', error);
    }
  };

  // Handle add plan
  const handleAddPlan = () => {
    setEditingPlan(null);
    setShowAddForm(true);
  };

  // Handle edit plan
  const handleEditPlan = (plan: ArchitecturalPlan) => {
    setEditingPlan(plan);
    setShowAddForm(true);
  };

  // Handle save plan
  const handleSavePlan = async (formData: any) => {
    setIsSubmitting(true);
    try {
      console.log('📋 Saving architectural plan:', formData);

      if (editingPlan) {
        // Update existing plan
        console.log('Updating existing plan...');
        alert('Update functionality will be implemented soon!');
      } else {
        // Create new plan
        console.log('Creating new architectural plan...');
        alert('Create functionality will be implemented soon! This would create a new architectural plan with the provided details.');
      }

      setShowAddForm(false);
      setEditingPlan(null);
      loadPlansData(); // Refresh the list
    } catch (error) {
      console.error('❌ Error saving plan:', error);
      alert('Failed to save plan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingPlan(null);
  };

  // Filter plans based on search and filters
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || plan.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || plan.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  useEffect(() => {
    loadPlansData();
  }, []);

  const getStatusColor = (status: PlanStatus) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Architectural Plans Management</h2>
        <Button
          onClick={handleAddPlan}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Architectural Plan
        </Button>
      </div>

      {/* Plans Analytics Overview */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalPlans}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.publishedPlans} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalDownloads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all plans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KSH {analytics.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From {analytics.recentPurchases} purchases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.pendingPlans}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">All Plans</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Plans Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plans.slice(0, 5).map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{plan.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {plan.category} • {plan.bedrooms} bed • {plan.area} {plan.areaUnit}
                        </p>
                      </div>
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.popularCategories.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="capitalize">{item.category.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(item.count / analytics.totalPlans) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Search & Filter Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
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

                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="bungalow">Bungalow</SelectItem>
                    <SelectItem value="maisonette">Maisonette</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="cottage">Cottage</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={loadPlansData} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Plans List */}
          <div className="grid gap-4">
            {filteredPlans.map((plan) => (
              <Card key={plan.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Home className="w-8 h-8 text-gray-400" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{plan.title}</h3>
                          <Badge className={getStatusColor(plan.status)}>
                            {plan.status}
                          </Badge>
                          {plan.isFeatured && (
                            <Badge variant="secondary">Featured</Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground mb-2 line-clamp-2">
                          {plan.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{plan.category}</span>
                          <span>{plan.bedrooms} bed, {plan.bathrooms} bath</span>
                          <span>{plan.area} {plan.areaUnit}</span>
                          <span>KSH {plan.price.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {plan.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {plan.downloads}
                          </div>
                          <div className="flex items-center gap-1">
                            <ShoppingCart className="w-4 h-4" />
                            {plan.purchases}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {plan.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprovePlan(plan.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectPlan(plan.id, 'Quality standards not met')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Category Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.popularCategories.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="capitalize">{item.category.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(item.count / analytics.totalPlans) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Average Downloads per Plan</span>
                      <span className="font-medium">
                        {analytics.totalPlans > 0 ? Math.round(analytics.totalDownloads / analytics.totalPlans) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Revenue per Plan</span>
                      <span className="font-medium">
                        KSH {analytics.totalPlans > 0 ? Math.round(analytics.totalRevenue / analytics.totalPlans).toLocaleString() : 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversion Rate</span>
                      <span className="font-medium">
                        {analytics.totalDownloads > 0 ? ((analytics.recentPurchases / analytics.totalDownloads) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Plan Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPlan ? 'Edit Architectural Plan' : 'Add Architectural Plan'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <ArchitecturalPlanForm
                initialData={editingPlan || undefined}
                onSave={handleSavePlan}
                onCancel={handleCancelForm}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansManagement;
