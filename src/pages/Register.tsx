import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { ProviderRegistrationData } from "@/types";
import { Building2, Users, CheckCircle, ArrowLeft } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<ProviderRegistrationData>({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    city: "",
  });

  const handleInputChange = (field: keyof ProviderRegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.businessName || !formData.businessEmail || !formData.city) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (formData.email === formData.businessEmail) {
      setError("Personal and business emails should be different");
      setLoading(false);
      return;
    }

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, this would save to database and send notification to admin
      toast({
        title: "Registration submitted successfully!",
        description: "Your application will be reviewed by our admin team. You'll receive an email notification once approved."
      });

      // Redirect to login page
      navigate("/login");
    } catch (err) {
      setError("Failed to submit registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold">Join as Property Provider</h1>
              <p className="text-muted-foreground">Start listing your properties on Musilli homes</p>
            </div>
          </div>
        </header>

        <Card className="brutal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Provider Registration
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Fill out the form below to apply as a property provider. Your application will be reviewed by our admin team.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Personal Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Business Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business/Company Name *</Label>
                  <Input
                    id="businessName"
                    placeholder="Your business or company name"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="businessEmail">Business Email *</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      placeholder="business@company.com"
                      value={formData.businessEmail}
                      onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessPhone">Business Phone</Label>
                    <Input
                      id="businessPhone"
                      type="tel"
                      placeholder="+1 (555) 987-6543"
                      value={formData.businessPhone}
                      onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Primary Operating City *</Label>
                  <Input
                    id="city"
                    placeholder="City where you operate"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Terms and Submit */}
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">What happens next?</p>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Your application will be reviewed within 2-3 business days</li>
                        <li>• You'll receive an email notification once approved</li>
                        <li>• After approval, you can start listing your properties</li>
                        <li>• Our team may contact you for additional verification</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Submitting Application..." : "Submit Application"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/")}>
                    Cancel
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  By submitting this form, you agree to our Terms of Service and Privacy Policy.
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Register;
