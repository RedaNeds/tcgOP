import { SidebarNav } from './SidebarNav';
import { UserProfile } from './UserProfile';
import { NotificationCenter } from './NotificationCenter';

export function Sidebar() {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-64 glass-dark border-r border-white/5 hidden md:flex flex-col p-6 z-50">
                <div className="mb-10 px-2 mt-2">
                    <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent font-noto-serif-jp">
                        OPTCG<span className="font-light text-blue-400">.</span>
                    </h1>
                </div>

                <SidebarNav />

                <div className="mt-auto border-t border-white/5 pt-6 flex flex-col gap-4">
                    <div className="px-2 flex justify-start">
                        <NotificationCenter />
                    </div>
                    <UserProfile />
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <SidebarNav mobile />
        </>
    );
}
