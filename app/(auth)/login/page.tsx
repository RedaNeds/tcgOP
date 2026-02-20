'use client';

import { login } from "@/lib/actions/auth-actions"
import { GalleryVerticalEnd } from "lucide-react"
import Link from "next/link"
import { useActionState } from "react"

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, null)

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="flex flex-col gap-4 p-6 md:p-8 bg-card rounded-xl border border-border shadow-sm">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <GalleryVerticalEnd className="size-6" />
                        </div>
                        <h1 className="text-2xl font-bold">Welcome back</h1>
                        <p className="text-balance text-sm text-muted-foreground">
                            Sign in to your One Piece TCG Portfolio
                        </p>
                    </div>
                    <form
                        action={formAction}
                        className="flex flex-col gap-4"
                    >
                        <div className="grid gap-2">
                            <label htmlFor="username" className="text-sm font-medium">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <label htmlFor="password" className="text-sm font-medium">Password</label>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            />
                        </div>

                        {state?.error && (
                            <p className="text-sm text-red-500 text-center">{state.error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-md px-4 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? "Signing in..." : "Sign in"}
                        </button>
                    </form>
                    <div className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="underline underline-offset-4 hover:text-primary">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
