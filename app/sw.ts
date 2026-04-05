/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: defaultCache,
});

serwist.addEventListeners();

self.addEventListener("push", (event) => {
    if (!event.data) return;
    
    try {
        const data = event.data.json();
        const title = data.title || "OPTCG Tracker";
        const options = {
            body: data.message,
            icon: "/icons/icon-192x192.png",
            badge: "/icons/icon-192x192.png",
            data: {
                url: data.link || "/app",
            },
        };

        event.waitUntil(self.registration.showNotification(title, options));
    } catch (e) {
        console.error("Push event data parsing failed", e);
    }
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.openWindow(event.notification.data.url)
    );
});
