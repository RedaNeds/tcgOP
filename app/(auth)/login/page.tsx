'use client';

import { login } from "@/lib/actions/auth-actions"
import { GalleryVerticalEnd } from "lucide-react"
import Link from "next/link"
import { useActionState } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LoginForm() {
    const [state, formAction, isPending] = useActionState(login, null)
    const searchParams = useSearchParams()
    const justRegistered = searchParams.get('registered') === 'true'

    return (
        <div className="flex min-h-screen w-full bg-background p-4 md:p-6 lg:p-8">
            <div className="flex w-full overflow-hidden bg-card rounded-3xl border border-border/50 shadow-2xl relative">
                
                {/* Left Side - Auth Form */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 py-16">
                    <div className="w-full max-w-[420px] mx-auto">
                        
                        {/* Logo / Brand Header */}
                        <div className="flex items-center gap-2 mb-12">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                                <GalleryVerticalEnd className="size-5" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">OPTCG Tracker</span>
                        </div>

                        {/* Title Section */}
                        <div className="mb-10">
                            <h1 className="text-4xl font-extrabold tracking-tight mb-3">Sign In</h1>
                            <p className="text-muted-foreground">
                                Welcome back! Log in to streamline your experience from day one.
                            </p>
                        </div>

                        {justRegistered && (
                            <div className="bg-green-500/10 border border-green-500/30 text-green-500 text-sm rounded-xl px-4 py-3 mb-6 font-medium animate-in fade-in slide-in-from-top-2">
                                ✓ Account created successfully! Sign in to get started.
                            </div>
                        )}

                        {/* Form */}
                        <form action={formAction} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="username" className="text-sm font-semibold text-foreground/90">Username</label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    className="flex h-12 w-full rounded-lg border border-border/60 bg-background/50 px-4 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent placeholder:text-muted-foreground/70"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-semibold text-foreground/90">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="flex h-12 w-full rounded-lg border border-border/60 bg-background/50 px-4 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent placeholder:text-muted-foreground/70"
                                    required
                                />
                            </div>

                            {state?.error && (
                                <p className="text-sm text-red-500 animate-in fade-in">{state?.error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white h-12 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {isPending ? "Signing in..." : "Sign In"}
                            </button>
                        </form>

                        {/* Social Auth Placeholders */}
                        <div className="relative mt-10 mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border/60"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-4 text-muted-foreground">Or Sign In With</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 h-12 bg-background border border-border/60 rounded-lg text-sm font-semibold hover:bg-muted/50 transition-colors">
                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
                                Google
                            </button>
                            <button className="flex items-center justify-center gap-2 h-12 bg-background border border-border/60 rounded-lg text-sm font-semibold hover:bg-muted/50 transition-colors">
                                <svg className="w-5 h-5" viewBox="0 0 384 512"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                                Apple
                            </button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground mt-10">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="font-semibold text-[#3B82F6] hover:underline underline-offset-4">
                                Sign up
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Side - Visual Dashboard Mockup */}
                <div className="hidden lg:flex w-1/2 bg-[#3B82F6] flex-col justify-between relative overflow-hidden text-white p-16">
                    {/* Background Pattern Effects */}
                    <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, white 0%, transparent 50%)' }}></div>
                    <div className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-[#2563EB] rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-[#60A5FA] rounded-full blur-3xl opacity-40"></div>

                    {/* Right Side Content */}
                    <div className="relative z-10 max-w-lg mt-12">
                        <h2 className="text-[2.75rem] font-bold leading-[1.15] mb-6">
                            Effortlessly manage your <br /> collection and operations.
                        </h2>
                        <p className="text-[#BFDBFE] text-lg max-w-md">
                            Log in to access your TCG dashboard, track market prices, and watch your portfolio grow.
                        </p>
                    </div>
                    
                    {/* Custom Mockup */}
                    <div className="relative z-10 mt-16 ml-4">
                        <div className="w-[120%] bg-white rounded-tl-xl rounded-tr-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 pl-8 opacity-95">
                            <div className="flex gap-6">
                                {/* Dashboard Card 1 */}
                                <div className="w-1/3 bg-[#F8FAFC] p-4 rounded-xl border border-slate-100">
                                    <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Value</div>
                                    <div className="text-[#3B82F6] text-2xl font-bold mb-1">$189,374</div>
                                    <div className="text-emerald-500 text-xs font-medium flex gap-1">↑ 1.5% <span className="text-slate-400">from last month</span></div>
                                </div>
                                {/* Dashboard Card 2 */}
                                <div className="w-1/3 bg-[#F8FAFC] p-4 rounded-xl border border-slate-100">
                                    <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Collection Size</div>
                                    <div className="text-slate-800 text-2xl font-bold mb-1">6,248</div>
                                    <div className="text-emerald-500 text-xs font-medium flex gap-1">↑ 24 <span className="text-slate-400">new items</span></div>
                                </div>
                            </div>

                            {/* Table Mockup */}
                            <div className="mt-6 border border-slate-100 rounded-xl overflow-hidden">
                                <div className="bg-[#F8FAFC] px-4 py-3 border-b border-slate-100 grid grid-cols-4 gap-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                    <div>Item</div>
                                    <div>Date</div>
                                    <div>Price</div>
                                    <div>Status</div>
                                </div>
                                <div className="bg-white px-4 py-3 border-b border-slate-50 grid grid-cols-4 gap-4 items-center">
                                    <div className="text-slate-700 font-medium text-sm flex items-center gap-2"><div className="w-6 h-8 bg-slate-200 rounded"></div> Manga Rare Luffy</div>
                                    <div className="text-slate-400 text-sm">Today</div>
                                    <div className="text-emerald-500 font-bold text-sm">$3,200</div>
                                    <div className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-1 rounded-full font-bold w-fit">IN PORTFOLIO</div>
                                </div>
                                <div className="bg-white px-4 py-3 grid grid-cols-4 gap-4 items-center">
                                    <div className="text-slate-700 font-medium text-sm flex items-center gap-2"><div className="w-6 h-8 bg-slate-200 rounded"></div> Signature Shanks</div>
                                    <div className="text-slate-400 text-sm">Yesterday</div>
                                    <div className="text-emerald-500 font-bold text-sm">$1,500</div>
                                    <div className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-1 rounded-full font-bold w-fit">IN PORTFOLIO</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    )
}
