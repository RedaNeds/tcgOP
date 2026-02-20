import { SidebarNav } from './SidebarNav';
import { UserProfile } from './UserProfile';

export function Sidebar() {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border hidden md:flex flex-col p-4 z-50">
                <div className="mb-8 px-4 mt-2">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        OPTCG<span className="font-light text-gray-400">Tracker</span>
                    </h1>
                </div>

                <SidebarNav />

                <div className="mt-auto border-t border-border pt-4">
                    <UserProfile />
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <SidebarNav mobile />
        </>
    );
}
