"use client"
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import Link from 'next/link'
import styles from './profile.module.css'
import PostCard from '@/components/PostCard'

interface Post {
    id: number;
    title: string;
    content: string;
    image: string;
    author: string;
    created_at: string;
    author_id: number;
}

export default function ProfilePage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserPosts = async () => {
            if (!user) return;
            
            try {
                setLoading(true);
                const response = await fetch(`/api/posts/user/${user.id}`);
                
                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                }
                
                const data = await response.json();
                console.log('Fetched posts:', data);
                
                setPosts(data);
            } catch (err) {
                console.error('Error fetching posts:', err);
                setError(err instanceof Error ? err.message : 'Failed to load posts');
            } finally {
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, [user]);

    if (!user) {
        return (
            <div className={styles.container}>
                <h1>Please log in to view your profile</h1>
                <Link href="/login">
                    <motion.button 
                        className={styles.loginButton}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Go to Login
                    </motion.button>
                </Link>
            </div>
        );
    }

    if (loading) {
        return <div className={styles.loading}>Loading your posts...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.profileHeader}>
                <h1>My Profile</h1>
                <div className={styles.userInfo}>
                    <p className={styles.userName}>{user.name}</p>
                    <p className={styles.userEmail}>{user.email}</p>
                </div>
            </div>

            <div className={styles.postsSection}>
                <div className={styles.postsHeader}>
                    <h2>My Posts</h2>
                    <Link href="/create-post">
                        <motion.button 
                            className={styles.createButton}
                            whileHover={{ 
                                scale: 1.05,
                            }}
                            whileTap={{ 
                                scale: 0.95 
                            }}
                        >
                            Create New Post
                        </motion.button>
                    </Link>
                </div>

                {posts.length === 0 ? (
                    <div className={styles.noPosts}>
                        <p>You haven't created any posts yet.</p>
                        <Link href="/create-post">
                            <motion.button 
                                className={styles.createButton}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Create Your First Post
                            </motion.button>
                        </Link>
                    </div>
                ) : (
                    <motion.div 
                        className={styles.postsGrid}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {posts.map((post, i) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link href={`/post/${post.id}`} className={styles.postLink}>
                                    <PostCard 
                                        title={post.title}
                                        image={post.image}
                                        author={post.author}
                                    />
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}