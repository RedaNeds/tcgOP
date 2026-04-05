import { Metadata } from 'next';
import { SettingsClient } from './SettingsClient';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';

export const metadata: Metadata = {
    title: 'Settings - OPTCG Tracker',
    description: 'Manage your portfolio settings, notifications, and profile.',
};

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            name: true,
            username: true,
            email: true,
            alertPriceSpike: true,
            alertPriceDrop: true,
            alertMilestones: true,
            isPublic: true
        }
    });

    if (!user) redirect('/login');

    return <SettingsClient user={{
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        alertPriceSpike: user.alertPriceSpike,
        alertPriceDrop: user.alertPriceDrop,
        alertMilestones: user.alertMilestones,
        isPublic: user.isPublic
    }} />;
}
