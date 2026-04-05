import Link from 'next/link';
import { Layers } from 'lucide-react';

export const metadata = {
    title: 'Privacy Policy — OPTCG Tracker',
    description: 'Privacy Policy for OPTCG Tracker',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <nav className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Layers size={20} />
                    <span className="font-semibold">OPTCG Tracker</span>
                </Link>
            </nav>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
                <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                    <p className="text-sm">Last updated: March 2026</p>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
                        <p>We collect the following information when you create an account:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Username</li>
                            <li>Password (stored securely hashed, never in plain text)</li>
                            <li>Portfolio and wishlist data you enter</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Data</h2>
                        <p>Your data is used exclusively to:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Provide portfolio tracking functionality</li>
                            <li>Display price alerts and notifications</li>
                            <li>Calculate portfolio performance metrics</li>
                        </ul>
                        <p className="mt-3">We do not sell, share, or rent your personal data to third parties.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Storage</h2>
                        <p>Your data is stored securely in a PostgreSQL database. Passwords are hashed using bcrypt with a cost factor of 10.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Deletion</h2>
                        <p>You can delete all your portfolio data at any time via Settings → Reset Portfolio. To request full account deletion, contact us.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">5. Cookies</h2>
                        <p>We use session cookies for authentication only. No tracking cookies or third-party analytics cookies are used.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">6. Changes</h2>
                        <p>We may update this policy from time to time. We will notify you of significant changes within the application.</p>
                    </section>
                </div>
            </main>
        </div>
    );
}
