import Link from 'next/link';
import { Layers } from 'lucide-react';

export const metadata = {
    title: 'Terms of Service — OPTCG Tracker',
    description: 'Terms of Service for OPTCG Tracker',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <nav className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Layers size={20} />
                    <span className="font-semibold">OPTCG Tracker</span>
                </Link>
            </nav>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
                <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                    <p className="text-sm">Last updated: March 2026</p>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
                        <p>By accessing and using OPTCG Tracker (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
                        <p>OPTCG Tracker is a free portfolio tracking tool for One Piece Trading Card Game collectors. The Service provides price tracking, portfolio management, and analytics features.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">3. User Accounts</h2>
                        <p>You are responsible for maintaining the security of your account and password. You must not share your credentials with others.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">4. Price Data</h2>
                        <p>Market price data provided by the Service is for informational purposes only. We do not guarantee the accuracy, completeness, or timeliness of price data. Do not make purchasing decisions solely based on the prices shown.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">5. Limitation of Liability</h2>
                        <p>The Service is provided &quot;as is&quot; without warranty of any kind. We are not liable for any financial losses resulting from the use of, or reliance on, information provided by the Service.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">6. Changes to Terms</h2>
                        <p>We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">7. Contact</h2>
                        <p>For questions about these Terms, contact us through the application.</p>
                    </section>
                </div>
            </main>
        </div>
    );
}
