import { auth } from "@/auth"
import { handleSignOut } from "@/lib/actions/auth-actions"

import Image from "next/image"
import Link from "next/link"
import { LogOut, User as UserIcon } from "lucide-react"

export async function UserProfile() {
    const session = await auth()

    if (!session?.user) {
        return (
            <Link href="/login" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-secondary hover:text-foreground transition-colors">
                <UserIcon size={18} />
                <span>Sign In</span>
            </Link>
        )
    }

    return (
        <div className="flex items-center gap-3 px-3 py-2 mt-auto">
            {session.user.image ? (
                <div className="relative h-8 w-8 rounded-full overflow-hidden border border-border">
                    <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        fill
                        className="object-cover"
                    />
                </div>
            ) : (
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-xs font-bold">{session.user.name?.[0] || "U"}</span>
                </div>
            )}

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session.user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
            </div>

            <form action={handleSignOut}>
                <button type="submit" title="Sign Out" className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                    <LogOut size={16} />
                </button>
            </form>
        </div>
    )
}
