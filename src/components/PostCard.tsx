import Link from 'next/link';
import styles from './PostCard.module.css';

interface PostCardProps {
    id: string;
    title: string;
    image: string | null;
    author: string;
    categories?: string[];
}

export default function PostCard({ id, title, image, author, categories }: PostCardProps) {
    const renderImage = () => {
        if (!image) {
            return null;
        }

        const cleanBase64 = image.replace(/\s+/g, '');
        const isBase64 = cleanBase64.startsWith('data:');
        const imageSrc = isBase64 ? cleanBase64 : `/images/${image}`;

        return (
            <img
                src={imageSrc}
                alt={title}
                className={styles.image}
                onError={() => {
                    const imgElement = document.querySelector(`[data-post-id="${id}"] img`);
                    if (imgElement) {
                        (imgElement as HTMLImageElement).style.display = 'none';
                        (imgElement as HTMLElement).style.display = 'none';
                    }
                }}
            />
        );
    };

    return (
        <Link href={`/post/${id}`} className={styles.card}>
            {image && (
                <div className={styles.imageWrapper} data-post-id={id}>
                    {renderImage()}
                </div>
            )}
            <div className={`${styles.content} ${!image ? styles.noImage : ''}`}>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.author}>by {author}</p>
                {categories && categories.length > 0 && (
                    <div className={styles.categories}>
                        {categories.map((category, index) => (
                            <span key={index} className={styles.category}>
                                {category}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}
