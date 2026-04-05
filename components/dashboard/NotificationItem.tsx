'use client';

import { NotificationItem as NotificationType } from '@/lib/actions/notifications';
import { formatDistanceToNow } from 'date-fns';
import { Bell, TrendingUp, TrendingDown, Target, Award, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NotificationItemProps {
    notification: NotificationType;
    onRead: (id: string) => void;
    onDelete: (id: string) => void;
}

export function NotificationItem({ notification, onRead, onDelete }: NotificationItemProps) {
    const getIcon = () => {
        switch (notification.type) {
            case 'PRICE_SPIKE':
                return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'PRICE_DROP':
                return <TrendingDown className="w-4 h-4 text-red-500" />;
            case 'WISHLIST_TARGET':
                return <Target className="w-4 h-4 text-yellow-500" />;
            case 'MILESTONE':
                return <Award className="w-4 h-4 text-purple-500" />;
            default:
                return <Bell className="w-4 h-4 text-blue-500" />;
        }
    };

    const handleContainerClick = () => {
        if (!notification.isRead) {
            onRead(notification.id);
        }
    };

    return (
        <div
            className={cn(
                "group relative p-4 flex gap-3 transition-colors hover:bg-white/5",
                !notification.isRead ? "bg-blue-500/5" : ""
            )}
            onClick={handleContainerClick}
        >
            {!notification.isRead && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r" />
            )}

            <div className="mt-1 flex-shrink-0">
                <div className={cn(
                    "p-2 rounded-full",
                    !notification.isRead ? "bg-background" : "bg-white/5"
                )}>
                    {getIcon()}
                </div>
            </div>

            <div className="flex-1 min-w-0 pr-6">
                <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className={cn(
                        "text-sm font-medium leading-tight",
                        !notification.isRead ? "text-foreground" : "text-foreground/80"
                    )}>
                        {notification.title}
                    </h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.message}
                </p>

                {notification.link && (
                    <Link
                        href={notification.link}
                        className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-blue-400 hover:text-blue-300"
                        onClick={(e) => {
                            // Don't trigger the container click if we're clicking the link
                            e.stopPropagation();
                            if (!notification.isRead) onRead(notification.id);
                        }}
                    >
                        View Details
                        <ExternalLink className="w-3 h-3" />
                    </Link>
                )}
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                }}
                className="absolute right-4 top-4 p-1.5 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-white/10"
                aria-label="Delete notification"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}
