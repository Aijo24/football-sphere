import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './PostCard.module.css';

interface PostCardProps {
    id: string;
    title: string;
    image: string | null;
    author: string;
}

export default function PostCard({ id, title, image, author }: PostCardProps) {
    console.log('PostCard props:', { id, title, image, author }); // Debug log

    if (!id) {
        console.error('PostCard received undefined id');
        return null;
    }

    return (
        <div className={styles.container}>
            <Link href={`/post/${id}`} className={styles.link}>
                <div className={styles['post-image-container']}>
                    {image && (
                        <Image
                            src={image}
                            alt={title}
                            width={300}
                            height={200}
                            className={styles['post-image']}
                            priority
                        />
                    )}
                </div>
                <div className={styles['post-content']}>
                    <h3 className={styles['post-title']}>{title}</h3>
                    <p className={styles['post-author']}>By {author}</p>
                </div>
            </Link>
        </div>
    );
}
