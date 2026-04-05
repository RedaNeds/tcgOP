'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Package } from 'lucide-react';

interface CardImageProps {
    src: string | null | undefined;
    alt: string;
    fill?: boolean;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
}

export function CardImage({ src, alt, fill, width, height, className, priority }: CardImageProps) {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return (
            <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className || ''}`}
                style={!fill ? { width, height } : undefined}
            >
                <Package size={24} />
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill={fill}
            width={!fill ? width : undefined}
            height={!fill ? height : undefined}
            className={className}
            onError={() => setHasError(true)}
            priority={priority}
            sizes={fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined}
        />
    );
}
