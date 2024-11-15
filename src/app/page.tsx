"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PostCard from '@/components/PostCard'
import Header from '@/components/Header'
import { motion } from 'framer-motion'
import styles from './page.module.css'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { PREDEFINED_CATEGORIES } from '@/types/categories'
import { FaSearch } from 'react-icons/fa'
import { getImageUrl } from '@/utils/imageUtils'

interface Post {
    id: string; 
    title: string;
    content: string;
    image: string | null;
    author: string;
    created_at: string;
    categories: string[];
}

export default function Home() {
    const { user } = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

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

    // Handle search with debounce
    useEffect(() => {
        if (!searchTerm.trim()) {
            const fetchPosts = async () => {
                try {
                    const response = await fetch('/api/posts');
                    if (!response.ok) throw new Error('Failed to fetch posts');
                    const data = await response.json();
                    setPosts(data);
                } catch (err) {
                    console.error('Error fetching posts:', err);
                }
            };
            fetchPosts();
            return;
        }

        const debounceTimer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await fetch(`/api/posts/search?q=${encodeURIComponent(searchTerm)}`);
                if (!response.ok) throw new Error('Search failed');
                const data = await response.json();
                setPosts(data);
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const filteredPosts = posts.filter(post => {
        const matchesCategory = !selectedCategory || 
            (post.categories && post.categories.includes(selectedCategory));
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.content.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (!user) {
        return null;
    }

    return (
        <main className={styles.main}>
            <Header/>
            <div className={styles.container}>
                <motion.div 
                    className={styles.hero}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className={styles.title}>APPRENEZ ET PARTAGEZ</h1>
                    <p className={styles.subtitle}>
                        Découvrez et partagez vos connaissances sur le football
                    </p>
                    <Link href="/create-post">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={styles.createPostButton}
                        >
                            <i className="fas fa-plus" /> Créer un post
                        </motion.button>
                    </Link>
                </motion.div>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner} />
                        <p>Chargement des posts...</p>
                    </div>
                ) : error ? (
                    <div className={styles.errorContainer}>
                        <i className="fas fa-exclamation-circle" />
                        <p>{error}</p>
                    </div>
                ) : (
                    <motion.div 
                        className={styles.postsSection}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h2 className={styles.sectionTitle}>
                            {selectedCategory ? 
                                `Posts dans ${PREDEFINED_CATEGORIES.find(c => c.id === selectedCategory)?.name}` : 
                                'Derniers Posts'
                            }
                            <span className={styles.postCount}>({filteredPosts.length})</span>
                        </h2>
                        
                        <motion.ul className={styles.postsGrid}>
                            {filteredPosts.map((post, i) => (
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
                                        image={post.image ? getImageUrl(post.image) : null}
                                        author={post.author}
                                        categories={post.categories}
                                    />
                                </motion.li>
                            ))}
                        </motion.ul>
                    </motion.div>
                )}
            </div>
        </main>
    );
}


