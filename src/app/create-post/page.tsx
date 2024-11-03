"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './create-post.module.css';

export default function CreatePost() {
    const router = useRouter();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            setError('You must be logged in to create a post');
            return;
        }

        if (!title.trim() || !content.trim()) {
            setError('Title and content are required');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                    image,
                    author_id: user.id
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            router.push('/profile');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create post');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className={styles.container}>
                <p className={styles.error}>Please log in to create a post</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1>Create New Post</h1>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="content">Content</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="image">Image URL (optional)</label>
                    <input
                        type="text"
                        id="image"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
                <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Creating...' : 'Create Post'}
                </button>
            </form>
        </div>
    );
}