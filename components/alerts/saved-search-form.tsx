"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect as Select } from "@/components/ui/select";
import {
  SavedSearchCreateSchema,
  buildCriteria,
  frequencies,
  type SavedSearchCreate,
} from "@/lib/alerts/criteria";

type SavedSearchFormValues = {
  keywords: string;
  location: string;
  categories: string;
  employment_type: string;
  remote: boolean;
  salary_range: string;
  frequency: SavedSearchCreate["frequency"];
};

type SavedSearchFormProps = {
  initialValues?: Partial<SavedSearchFormValues>;
  submitLabel: string;
  onSubmit: (payload: SavedSearchCreate) => Promise<void>;
};

const defaultValues: SavedSearchFormValues = {
  keywords: "",
  location: "",
  categories: "",
  employment_type: "",
  remote: false,
  salary_range: "",
  frequency: "instant",
};

export default function SavedSearchForm({
  initialValues,
  submitLabel,
  onSubmit,
}: SavedSearchFormProps) {
  const [values, setValues] = useState<SavedSearchFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = <K extends keyof SavedSearchFormValues>(
    key: K,
    value: SavedSearchFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    let payload: SavedSearchCreate;
    try {
      payload = SavedSearchCreateSchema.parse({
        frequency: values.frequency,
        search_criteria: buildCriteria({
          keywords: values.keywords,
          location: values.location,
          categories: values.categories,
          employment_type: values.employment_type,
          remote: values.remote,
          salary_range: values.salary_range,
        }),
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
          : "Unable to save search.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords</Label>
          <Input
            id="keywords"
            value={values.keywords}
            onChange={(event) => handleChange("keywords", event.target.value)}
            placeholder="e.g. marketing, iOS"
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
        <div className="space-y-2">
          <Label htmlFor="categories">Categories</Label>
          <Input
            id="categories"
            value={values.categories}
            onChange={(event) => handleChange("categories", event.target.value)}
            placeholder="Comma-separated"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="employment_type">Employment type</Label>
          <Select
            id="employment_type"
            value={values.employment_type}
            onChange={(event) =>
              handleChange("employment_type", event.target.value)
            }
          >
            <option value="">Any</option>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary_range">Salary range</Label>
          <Input
            id="salary_range"
            value={values.salary_range}
            onChange={(event) => handleChange("salary_range", event.target.value)}
            placeholder="e.g. €35k-€45k"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="frequency">Alert frequency</Label>
          <Select
            id="frequency"
            value={values.frequency}
            onChange={(event) =>
              handleChange(
                "frequency",
                event.target.value as SavedSearchCreate["frequency"]
              )
            }
          >
            {frequencies.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={values.remote}
          onChange={(event) => handleChange("remote", event.target.checked)}
          className="h-4 w-4 rounded border border-slate-300 text-teal-600"
        />
        Remote-friendly only
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
