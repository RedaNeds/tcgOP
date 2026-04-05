import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <DashboardShell sidebar={<Sidebar />}>
            {children}
        </DashboardShell>
    );
}
