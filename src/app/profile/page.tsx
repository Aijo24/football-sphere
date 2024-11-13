"use client"
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Header from '@/components/Header'
import { motion } from 'framer-motion'
import Link from 'next/link'
import styles from './profile.module.css'
import PostCard from '@/components/PostCard'

interface Post {
    id: string;
    title: string;
    content: string;
    image: string | null;
    author: string;
    created_at: string;
    author_id: string;
}

export default function ProfilePage() {
    const { user } = useAuth()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPosts = async () => {
            if (!user?.id) return;

            try {
                console.log('Fetching posts for user:', user.id);
                const response = await fetch(`/api/posts/user/${user.id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch posts');
                }

                console.log('Received posts:', data);
                setPosts(data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [user?.id]);

    return (
        <div className={styles.main}>
            <div className={styles.container}>
            <Header/>
                <div className={styles.titleContainer}>
                    <h1 className={styles.title}>My Profile</h1>
                    <Link href="/create-post">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={styles.createPostButton}
                        >
                            <i className="fas fa-plus" /> Create Post
                        </motion.button>
                    </Link>
                </div>

                {loading ? (
                    <div className={styles.loading}>Loading posts...</div>
                ) : posts.length > 0 ? (
                    <motion.div 
                        className={styles.postsGrid}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {posts.map((post) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <PostCard
                                    id={post.id}
                                    title={post.title}
                                    image={post.image}
                                    author={post.author}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className={styles.noPosts}>
                        <p>You haven't created any posts yet.</p>
                        <Link href="/create-post">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={styles.createPostButton}
                            >
                                <i className="fas fa-plus" /> Create Your First Post
                            </motion.button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}