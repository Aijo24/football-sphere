"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PostCard from '@/components/PostCard'
import Header from '@/components/Header'
import { motion } from 'framer-motion'
import styles from './page.module.css'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

interface Post {
    id: string;
    title: string;
    content: string;
    image: string | null;
    author: string;
    created_at: string;
}

export default function Home() {
    const { user } = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/posts');
                if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                }
                const data = await response.json();
                setPosts(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load posts');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [user, router]);

    if (!user) {
        return null;
    }

    if (loading) {
        return <div className={styles.loading}>Loading posts...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <main className={styles.main}>
            <Header/>
            <div className={styles.container}>
                <div className={styles.titleContainer}>
                    <h1 className={styles.title}>APPRENEZ ET PARTAGEZ</h1>
                    <Link href="/create-post">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={styles.createPostButton}
                        >
                            <i className="fas fa-plus" /> Cree un post
                        </motion.button>
                    </Link>
                </div>

                <motion.ul 
                    className={styles.postsGrid}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {posts.map((post, i) => (
                        <motion.li 
                            key={post.id}
                            className={styles.postItem}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            <PostCard 
                                id={post.id}
                                title={post.title} 
                                image={post.image} 
                                author={post.author}
                            />
                        </motion.li>
                    ))}
                </motion.ul>
            </div>
        </main>
    );
}


