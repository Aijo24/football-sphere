import Image from 'next/image';
import { motion } from 'framer-motion';

interface PostCardProps {
    title: string;
    image: string;
    author: string;
}

export default function PostCard({ title, image, author }: PostCardProps) {
    return (
        <div className="post-card">
            <div className="post-image-container">
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        width={300}
                        height={200}
                        className="post-image"
                        priority
                    />
                ) : (
                    <div className="post-image-placeholder">
                        <i className="fas fa-image"></i>
                    </div>
                )}
            </div>
            <div className="post-content">
                <h3 className="post-title">{title}</h3>
                <p className="post-author">By {author}</p>
            </div>
        </div>
    );
}
