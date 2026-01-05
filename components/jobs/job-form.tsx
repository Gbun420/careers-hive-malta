"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { JobCreateSchema, type JobCreate } from "@/lib/jobs/schema";

type JobFormValues = {
  title: string;
  description: string;
  location: string;
  salary_min: string;
  salary_max: string;
  salary_period: "hourly" | "monthly" | "yearly";
  is_active: boolean;
};

type JobFormProps = {
  initialValues?: Partial<JobFormValues>;
  submitLabel: string;
  onSubmit: (payload: JobCreate) => Promise<void>;
};

const defaultValues: JobFormValues = {
  title: "",
  description: "",
  location: "",
  salary_min: "",
  salary_max: "",
  salary_period: "yearly",
  is_active: true,
};

export default function JobForm({
  initialValues,
  submitLabel,
  onSubmit,
}: JobFormProps) {
  const [values, setValues] = useState<JobFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = <K extends keyof JobFormValues>(
    key: K,
    value: JobFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    let payload: JobCreate;
    try {
      payload = JobCreateSchema.parse({
        title: values.title.trim(),
        description: values.description.trim(),
        location: values.location.trim() || undefined,
        salary_min: values.salary_min ? Number(values.salary_min) : undefined,
        salary_max: values.salary_max ? Number(values.salary_max) : undefined,
        salary_period: values.salary_period,
        is_active: values.is_active,
      });
    } catch (validationError) {
      const message =
        validationError instanceof z.ZodError
          ? validationError.errors[0]?.message
          : "Invalid form data.";
      setError(message);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(payload);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to save job.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={values.title}
          onChange={(event) => handleChange("title", event.target.value)}
          placeholder="e.g. Marketing Manager"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={values.description}
          onChange={(event) => handleChange("description", event.target.value)}
          placeholder="Outline responsibilities, requirements, and benefits."
          rows={6}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={values.location}
          onChange={(event) => handleChange("location", event.target.value)}
          placeholder="e.g. Valletta"
        />
      </div>
      
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="salary_min">Min Salary</Label>
          <Input
            id="salary_min"
            type="number"
            value={values.salary_min}
            onChange={(event) => handleChange("salary_min", event.target.value)}
            placeholder="e.g. 30000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary_max">Max Salary</Label>
          <Input
            id="salary_max"
            type="number"
            value={values.salary_max}
            onChange={(event) => handleChange("salary_max", event.target.value)}
            placeholder="e.g. 40000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary_period">Period</Label>
          <div className="relative">
            <select
              id="salary_period"
              value={values.salary_period}
              onChange={(event) => handleChange("salary_period", event.target.value as any)}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="yearly">Yearly</option>
              <option value="monthly">Monthly</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={values.is_active}
          onChange={(event) => handleChange("is_active", event.target.checked)}
          className="h-4 w-4 rounded border border-slate-300 text-teal-600"
        />
        Publish immediately
      </label>

      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
