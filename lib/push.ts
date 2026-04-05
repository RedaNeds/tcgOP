import webpush from 'web-push';
import prisma from './db';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
    webpush.setVapidDetails(
        'mailto:support@optcgtracker.com',
        publicKey,
        privateKey
    );
}

export async function sendPushNotification(userId: string, payload: { title: string; message: string; link?: string; cardId?: string }) {
    try {
        if (!publicKey || !privateKey) {
            console.warn('Push notifications skipped: VAPID keys not configured');
            return;
        }

        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId }
        });

        if (subscriptions.length === 0) return;

        const pushPayload = JSON.stringify(payload);

        const promises = subscriptions.map(sub => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };

            return webpush.sendNotification(pushSubscription, pushPayload)
                .catch(err => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription expired or no longer valid
                        return prisma.pushSubscription.delete({ where: { id: sub.id } });
                    }
                    console.error('Error sending push notification:', err);
                });
        });

        await Promise.all(promises);
    } catch (error) {
        console.error('Failed to send push notification:', error);
    }
}
