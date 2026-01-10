import { SITE_NAME } from "@/lib/site/url";

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <div className="prose prose-invert max-w-none">
                <p className="lead">Your privacy is important to us. This policy explains how we handle your data at {SITE_NAME}.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">1. Data Collection</h2>
                <p>We collect information you provide directly to us when creating a profile, applying for jobs, or posting vacancies. This include names, email addresses, and professional history.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">2. Use of Data</h2>
                <p>We use your data to facilitate the hiring process, improve our services, and communicate important updates regarding your account or applications.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">3. GDPR Compliance</h2>
                <p>In accordance with the General Data Protection Regulation (GDPR), users have the right to access, rectify, or delete their personal data. We implement industry-standard security measures to protect your information.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">4. Cookies and Tracking</h2>
                <p>We use essential cookies to maintain your session and improve site performance. Analytical cookies help us understand how users interact with the platform.</p>

                <p className="mt-12 text-sm text-gray-400">Last updated: January 2026</p>
            </div>
        </div>
    );
}
