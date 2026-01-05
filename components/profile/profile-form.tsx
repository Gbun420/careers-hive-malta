"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import ResumeUpload from "./resume-upload";

type ProfileData = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  headline?: string | null;
  bio?: string | null;
  skills?: string[] | null;
};

type ApiError = {
  error?: {
    message?: string;
  };
};

export default function ProfileForm() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const payload = await response.json();
        const data = payload.data;
        setProfile(data);
        setFullName(data.full_name || "");
        setHeadline(data.headline || "");
        setBio(data.bio || "");
        setSkills(data.skills || []);
      }
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          full_name: fullName,
          headline,
          bio,
          skills
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as ApiError;
        throw new Error(payload.error?.message || "Failed to update profile");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-600 font-bold">Synchronizing profile data...</p>;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-12">
      {profile.role === 'jobseeker' && (
        <section>
          <h2 className="text-sm font-black uppercase tracking-widest text-navy-400 mb-6">Professional Onboarding</h2>
          <ResumeUpload onParsed={() => void loadProfile()} />
        </section>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold">Email address</Label>
            <Input id="email" value={profile.email} disabled className="bg-slate-50 border-slate-200 rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name" className="font-bold">Full name</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              required
              className="rounded-xl border-slate-200 focus:border-navy-400"
            />
          </div>
        </div>

        {profile.role === 'jobseeker' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="headline" className="font-bold">Professional Headline</Label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="rounded-xl border-slate-200 focus:border-navy-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="font-bold">Short Biography</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell employers about your experience..."
                className="min-h-[120px] rounded-xl border-slate-200 focus:border-navy-400"
              />
            </div>

            <div className="space-y-4">
              <Label className="font-bold">Extracted Skills</Label>
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <Badge key={skill} variant="verified" className="px-3 py-1">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No skills added yet. Use the resume parser above.</p>
                )}
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label className="font-bold uppercase text-[10px] tracking-widest text-navy-400">Account Type</Label>
          <p className="text-lg font-black text-navy-950 capitalize">{profile.role}</p>
        </div>

        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
            Profile synchronized successfully.
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={saving} className="bg-coral-500 hover:bg-coral-600 text-white rounded-xl px-10">
          {saving ? "Saving..." : "Update Profile"}
        </Button>
      </form>
    </div>
  );
}
