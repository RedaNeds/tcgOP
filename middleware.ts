import { auth } from "@/auth"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isAuthPage = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register"
    const isOnDashboard = !isAuthPage

    if (isOnDashboard && !isLoggedIn) {
        return Response.redirect(new URL("/login", req.nextUrl))
    }

    if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/", req.nextUrl))
    }

    return
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
