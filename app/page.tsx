import Link from 'next/link';
import { TrendingUp, Shield, Bell, BarChart3, Layers, Heart, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { headers } from 'next/headers';

export const metadata = {
    title: 'OPTCG Tracker — Next-Gen One Piece TCG Portfolio Manager',
    description: 'Track your One Piece TCG collection value in real-time. Monitor prices, analyze performance, and never miss a deal with the ultimate collector tool.',
};

export default async function LandingPage() {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseHost = host.replace(/^www\./, '');
    const appUrl = `${protocol}://app.${baseHost}`;

    return (
        <div className="min-h-screen bg-[#050505] text-foreground font-sans overflow-x-hidden selection:bg-primary/30">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse-slow"></div>
                <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen opacity-50"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[100px] mix-blend-screen"></div>
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}></div>
            </div>

            {/* Navigation */}
            <nav className="relative z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                            <Layers className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight">
                            OPTCG Tracker
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a
                            href={`${appUrl}/login`}
                            className="text-sm font-semibold text-white/70 hover:text-white transition-colors hidden sm:block"
                        >
                            Sign In
                        </a>
                        <a
                            href={`${appUrl}/register`}
                            className="text-sm font-bold bg-white text-black hover:bg-white/90 px-6 py-2.5 rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center gap-2"
                        >
                            Get Started Free <ArrowRight size={16} />
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
                    
                    {/* Hero Text */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-blue-400 px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm animate-fade-in-up">
                            <Sparkles size={14} className="text-blue-400" />
                            The #1 Platform for Collectors
                        </div>
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            Master Your
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                                One Piece
                            </span> Collection.
                        </h1>
                        <p className="text-lg sm:text-xl text-white/60 max-w-xl mb-10 leading-relaxed font-light animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            Stop using spreadsheets. Seamlessly track your OPTCG portfolio value, monitor live market prices, and uncover deep analytics on your investments.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                            <a
                                href={`${appUrl}/register`}
                                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_40px_rgba(79,70,229,0.3)] transition-all hover:shadow-[0_0_60px_rgba(79,70,229,0.4)] hover:-translate-y-1"
                            >
                                Start Tracking Free
                                <ArrowRight size={20} />
                            </a>
                            <a
                                href="#features"
                                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-full font-medium text-lg transition-all"
                            >
                                Explore Features
                            </a>
                        </div>
                        
                        <div className="mt-12 flex items-center gap-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                            <div className="flex -space-x-3">
                                {[1,2,3,4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold" style={{ zIndex: 10 - i }}>
                                        👤
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm text-white/50">
                                Join <span className="text-white font-bold">thousands</span> of collectors already onboard.
                            </div>
                        </div>
                    </div>

                    {/* Hero Visual / Mockup */}
                    <div className="relative w-full aspect-square max-w-lg mx-auto lg:mr-0 animate-fade-in">
                        {/* Glowing backdrop */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-[40px] blur-3xl transform rotate-12"></div>
                        
                        {/* Main mock interface */}
                        <div className="relative w-full h-full bg-[#0E0E11]/80 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl overflow-hidden transform transition-transform hover:scale-[1.02] duration-500 flex flex-col">
                            {/* App Header Mock */}
                            <div className="h-14 border-b border-white/10 flex items-center px-6 justify-between bg-white/5">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                </div>
                                <div className="w-32 h-4 bg-white/10 rounded-full"></div>
                            </div>
                            
                            {/* App Content Mock */}
                            <div className="p-6 flex-1 flex flex-col gap-6">
                                {/* Portfolio Value */}
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-white/50 text-xs uppercase font-bold tracking-wider mb-1">Total Value</div>
                                        <div className="text-4xl font-black text-white">$4,289.50</div>
                                    </div>
                                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                        <TrendingUp size={14} /> +12.4%
                                    </div>
                                </div>
                                
                                {/* Chart Mock */}
                                <div className="h-32 w-full border-b border-white/5 relative flex items-end">
                                    <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                                        <path d="M0,40 L0,30 C20,30 30,10 50,20 C70,30 80,5 100,10 L100,40 Z" fill="url(#gradient)" opacity="0.2" />
                                        <path d="M0,30 C20,30 30,10 50,20 C70,30 80,5 100,10" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
                                        <defs>
                                            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#60A5FA" stopOpacity="1" />
                                                <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                
                                {/* Cards List Mock */}
                                <div className="flex flex-col gap-3">
                                    {[
                                        { name: 'Shanks (Manga Rare)', set: 'OP-01', price: '$1,250.00', trend: '+5.2%' },
                                        { name: 'Portgas.D.Ace (Super Rare)', set: 'OP-02', price: '$85.50', trend: '-1.4%' },
                                        { name: 'Roronoa Zoro (Leader)', set: 'OP-01', price: '$120.00', trend: '+12.0%' }
                                    ].map((card, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                            <div className="flex gap-3 items-center">
                                                <div className="w-8 h-10 bg-gradient-to-br from-indigo-500/40 to-purple-500/40 rounded border border-white/10"></div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">{card.name}</div>
                                                    <div className="text-xs text-white/50">{card.set}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-white">{card.price}</div>
                                                <div className={`text-xs ${card.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{card.trend}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Floating elements */}
                        <div className="absolute -right-12 top-20 bg-[#1A1A24] border border-white/10 p-4 rounded-2xl shadow-xl backdrop-blur-xl animate-float" style={{ animationDelay: '1s' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">🏆</div>
                                <div>
                                    <div className="text-xs text-white/50">Top Earner</div>
                                    <div className="text-sm font-bold">OP-05 Luffy</div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -left-8 bottom-32 bg-[#1A1A24] border border-white/10 p-4 rounded-2xl shadow-xl backdrop-blur-xl animate-float-delayed">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                    <Bell size={18} />
                                </div>
                                <div>
                                    <div className="text-xs text-white/50">Price Alert Triggered</div>
                                    <div className="text-sm font-bold">Nami AA hits $90</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Showcase */}
            <section id="features" className="relative z-10 py-32 bg-black/40 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 mb-6">
                            Everything you need to dominate the TCG market
                        </h2>
                        <p className="text-lg text-white/50 leading-relaxed">
                            We&apos;ve built the ultimate command center for your collection. Whether you&apos;re a casual player or a hardcore investor, OPTCG Tracker gives you the edge.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<TrendingUp size={28} />}
                            title="Live Market Pricing"
                            description="Prices are fetched and updated automatically from trusted sources. Never guess the value of your binder again."
                            color="blue"
                        />
                        <FeatureCard
                            icon={<BarChart3 size={28} />}
                            title="Advanced P&L"
                            description="Input what you paid, and let the algorithm calculate your exact profit & loss margins across your entire portfolio."
                            color="green"
                        />
                        <FeatureCard
                            icon={<Layers size={28} />}
                            title="Master Sets & Slabs"
                            description="Track your progression towards full Master Sets, and manage your graded slabs (PSA, BGS, CGC) with cert verification."
                            color="purple"
                        />
                        <FeatureCard
                            icon={<Heart size={28} />}
                            title="Wishlists & Sniping"
                            description="Keep a close eye on your most-wanted cards. Set target prices and instantly see when a card drops into your strike zone."
                            color="red"
                        />
                        <FeatureCard
                            icon={<Shield size={28} />}
                            title="Public Sharing"
                            description="Generate a beautiful, read-only public link to show off your collection on Discord, Reddit, or Twitter."
                            color="indigo"
                        />
                        <FeatureCard
                            icon={<CheckCircle2 size={28} />}
                            title="Instant Setup"
                            description="Get started in seconds. No complex configurations. Just add your cards and instantly see your dashboard come alive."
                            color="teal"
                        />
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative z-10 py-40 overflow-hidden text-center px-6">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
                
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
                    Ready to level up your collection?
                </h2>
                <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
                    Join OPTCG Tracker today. It&apos;s 100% free to start building your ultimate portfolio dashboard.
                </p>
                <div className="flex justify-center">
                    <a
                        href={`${appUrl}/register`}
                        className="group inline-flex items-center gap-3 bg-white text-black hover:bg-gray-100 px-10 py-5 rounded-full font-bold text-xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                    >
                        Create Your Free Account
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 bg-black/60 pt-16 pb-8 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Layers className="text-white" size={24} />
                            <span className="text-xl font-bold">OPTCG Tracker</span>
                        </div>
                        <p className="text-white/50 max-w-sm mb-6">
                            The smartest, most beautiful way to manage and analyze your One Piece TCG collection online.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Product</h4>
                        <ul className="space-y-3 text-white/50 text-sm">
                            <li><a href={`${appUrl}/`} className="hover:text-white transition-colors">Dashboard</a></li>
                            <li><a href={`${appUrl}/catalog`} className="hover:text-white transition-colors">Card Catalog</a></li>
                            <li><a href={`${appUrl}/register`} className="hover:text-white transition-colors">Sign Up</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Legal</h4>
                        <ul className="space-y-3 text-white/50 text-sm">
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
                    <p>© {new Date().getFullYear()} OPTCG Tracker. All rights reserved.</p>
                    <p>Not affiliated with Bandai Namco or Eiichiro Oda.</p>
                </div>
            </footer>
        </div>
    );
}

// Simple color map for feature cards
const colorMap: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20 shadow-blue-500/10',
    green: 'text-green-400 bg-green-400/10 border-green-400/20 shadow-green-500/10',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20 shadow-purple-500/10',
    red: 'text-red-400 bg-red-400/10 border-red-400/20 shadow-red-500/10',
    indigo: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20 shadow-indigo-500/10',
    teal: 'text-teal-400 bg-teal-400/10 border-teal-400/20 shadow-teal-500/10',
};

function FeatureCard({
    icon,
    title,
    description,
    color,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
}) {
    const theme = colorMap[color] || colorMap.blue;
    
    return (
        <div className="group relative bg-[#0E0E11]/80 backdrop-blur-sm rounded-3xl border border-white/5 p-8 hover:bg-[#15151A] transition-colors overflow-hidden">
            {/* Glow effect on hover */}
            <div className={`absolute -inset-px opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500 bg-gradient-to-br ${color === 'blue' ? 'from-blue-500' : color === 'green' ? 'from-green-500' : color === 'purple' ? 'from-purple-500' : color === 'red' ? 'from-red-500' : color === 'indigo' ? 'from-indigo-500' : 'from-teal-500'} to-transparent`}></div>
            
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border shadow-lg transition-transform group-hover:scale-110 duration-300 ${theme}`}>
                {icon}
            </div>
            <h3 className="font-bold text-xl text-white mb-3">{title}</h3>
            <p className="text-white/50 leading-relaxed group-hover:text-white/70 transition-colors">
                {description}
            </p>
        </div>
    );
}
