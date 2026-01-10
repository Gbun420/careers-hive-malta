import { SITE_NAME } from "@/lib/site/url";

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
            <div className="prose prose-invert max-w-none">
                <p className="lead">Welcome to {SITE_NAME}. By using our platform, you agree to the following terms.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
                <p>By accessing or using Careers.mt, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">2. User Conduct</h2>
                <p>Users are responsible for ensuring the accuracy of the information they provide. Any fraudulent activity or misuse of the platform may lead to account termination.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">3. Employer Responsibilities</h2>
                <p>Employers must provide accurate job descriptions and adhere to Maltese employment laws. Featured job posts are subject to the agreed pricing and duration.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">4. Limitation of Liability</h2>
                <p>{SITE_NAME} is not responsible for the content of job posts or the conduct of users. We provide a platform for connection but do not guarantee employment or candidate quality.</p>

                <p className="mt-12 text-sm text-gray-400">Last updated: January 2026</p>
            </div>
        </div>
    );
}
