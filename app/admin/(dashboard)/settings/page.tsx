"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Shield, Building2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getInitials } from "@/lib/utils";
import { settingsApi, CompanySettings } from "@/lib/api";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Company settings form state
  const [companyForm, setCompanyForm] = React.useState<CompanySettings>({
    companyName: "",
    officeAddress: "",
    phone: "",
    email: "",
    website: "",
  });

  // Fetch company settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["companySettings"],
    queryFn: settingsApi.get,
  });

  // Update form when settings load
  React.useEffect(() => {
    if (settings) {
      setCompanyForm({
        companyName: settings.companyName || "",
        officeAddress: settings.officeAddress || "",
        phone: settings.phone || "",
        email: settings.email || "",
        website: settings.website || "",
      });
    }
  }, [settings]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      toast.success("Company settings updated");
      queryClient.invalidateQueries({ queryKey: ["companySettings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update settings");
    },
  });

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(companyForm);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and company information</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
              {getInitials(session?.user?.name || "Admin")}
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-gray-900">
                {session?.user?.name || "Admin User"}
              </p>
              <p className="text-gray-500">{session?.user?.email}</p>
              <p className="text-sm text-gray-400 mt-1">Administrator</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingSettings ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <Input
                label="Company Name"
                value={companyForm.companyName}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, companyName: e.target.value })
                }
                placeholder="Your company name"
              />
              <Textarea
                label="Office Address"
                value={companyForm.officeAddress}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, officeAddress: e.target.value })
                }
                placeholder="Full office address"
                rows={3}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  type="tel"
                  value={companyForm.phone}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, phone: e.target.value })
                  }
                  placeholder="+1 (555) 123-4567"
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={companyForm.email}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, email: e.target.value })
                  }
                  placeholder="contact@company.com"
                />
              </div>
              <Input
                label="Website (optional)"
                type="url"
                value={companyForm.website || ""}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, website: e.target.value })
                }
                placeholder="https://www.company.com"
              />
              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={updateSettingsMutation.isPending}>
                  Save Company Info
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Security Section */}
      <SecuritySection />
    </div>
  );
}

// Separate component for password change to manage its own state
function SecuritySection() {
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = React.useState({
    current: false,
    new: false,
    confirm: false,
  });

  const changePasswordMutation = useMutation({
    mutationFn: settingsApi.changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    changePasswordMutation.mutate(passwordForm);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <p className="text-sm font-medium text-gray-700">Change Password</p>
          
          <div className="relative">
            <Input
              label="Current Password"
              type={showPasswords.current ? "text" : "password"}
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              placeholder="Enter current password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.current ? "Hide" : "Show"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                label="New Password"
                type={showPasswords.new ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? "Hide" : "Show"}
              </button>
            </div>
            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Password must be at least 8 characters with uppercase, lowercase, and a number.
          </p>

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={changePasswordMutation.isPending}>
              Change Password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
