"use client";

import ApplicantTracker from "@/components/employer/applicant-tracker";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";

export default function EmployerApplicationsPage() {
    return (
        <PageShell>
            <header className="mb-12">
                <SectionHeading
                    title="Global Applicant Pipeline"
                    subtitle="Manage all candidates across your Maltese job listings."
                />
            </header>

            <div className="max-w-5xl">
                <ApplicantTracker />
            </div>
        </PageShell>
    );
}
