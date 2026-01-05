"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Profile = {
  id: string;
  role: string;
  full_name?: string;
  created_at: string;
  email: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      if (response.ok) {
        setProfile(data.data);
        setFullName(data.data.full_name || "");
      } else {
        setError(data.error?.message || "Failed to load profile");
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ full_name: fullName.trim() || undefined }),
      });

      const data = await response.json();
      if (response.ok) {
        setProfile(data.data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error?.message || "Failed to update profile");
      }
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
        <p className="text-sm text-slate-600">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <header>
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Profile Settings
        </h1>
        <p className="mt-2 text-slate-600">
          Update your profile information.
        </p>
      </header>

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900">Account Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile?.email || ""}
              disabled
              className="bg-slate-50"
            />
            <p className="text-xs text-slate-500">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={profile?.role || ""}
              disabled
              className="bg-slate-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <Button type="submit" size="lg" disabled={updating}>
          {updating ? "Updating..." : "Update Profile"}
        </Button>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h4 className="font-semibold text-slate-900 mb-2">Audit Trail</h4>
        <p className="text-sm text-slate-600">
          Profile changes are logged and can be reviewed by administrators in the audit logs.
        </p>
        <Button variant="outline" className="mt-2" asChild>
          <a href="/admin/audit" target="_blank">View Audit Logs</a>
        </Button>
      </div>
    </main>
  );
}
