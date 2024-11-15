import { useState } from 'react';
import styles from './Image.module.css';

interface ImageProps {
    src: string | null;
    alt: string;
    className?: string;
}

export default function Image({ src, alt, className = '' }: ImageProps) {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    const defaultSrc = '/assets/default-post.jpeg';
    const imageSrc = error || !src ? defaultSrc : src;

    return (
        <img
            src={imageSrc}
            alt={alt}
            className={`${className} ${loading ? styles.loading : ''}`}
            onError={() => {
                if (imageSrc !== defaultSrc) {
                    setError(true);
                }
            }}
            onLoad={() => setLoading(false)}
        />
    );
} 