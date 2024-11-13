"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import styles from './Header.module.css'

interface SearchResult {
    id: number;
    title: string;
    author: string;
    author_id: number;
    image: string;
}

export default function Header() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = useCallback(async () => {
        if (!searchTerm.trim()) return;

        setIsSearching(true);
        try {
            console.log('Searching for:', searchTerm);
            
            const response = await fetch(`/api/posts/search?q=${encodeURIComponent(searchTerm)}`);
            console.log('Search response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Search results:', data);
                setSearchResults(data);
            } else {
                const errorText = await response.text();
                console.error('Search failed:', errorText);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.trim()) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, handleSearch]);

    const handleLogout = async () => {
        try {
            console.log('Attempting to logout...');

            const res = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Logout response status:', res.status);

            if (res.ok) {
                const data = await res.json();
                console.log('Logout successful:', data);
                
                logout();
                
                router.push('/login');
                router.refresh();
            } else {
                console.error('Logout failed:', await res.text());
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <header className={styles.header}>
            <motion.div 
                className={styles.leftContainer}
                transition={{type:'spring',damping:18,mass:0.75}}
                initial={{opacity:0,x:-1000}} 
                animate={{opacity:1,x:0}}
            >
                <Link href="/">
                    <h1 className={styles.bookTitle}>Football Sphere</h1>
                </Link>
                <div className={styles.searchContainer}>
                    <motion.input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && searchTerm.trim()) {
                                router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
                            }
                        }}
                        placeholder='Search posts or authors...'
                        className={styles.searchInput}
                        initial={{opacity:0,x:-100}}
                        animate={{opacity:1,x:0}}
                    />
                    {searchTerm.trim() && (
                        <div className={styles.searchResults}>
                            {isSearching ? (
                                <div className={styles.loading}>Searching...</div>
                            ) : searchResults.length > 0 ? (
                                <div>
                                    {searchResults.map((result: SearchResult) => (
                                        <Link 
                                            key={result.id} 
                                            href={`/post/${result.id}`}
                                            className={styles.searchResultItem}
                                            onClick={() => setSearchTerm('')}
                                        >
                                            <div className={styles.resultContent}>
                                                {result.image && (
                                                    <Image 
                                                        src={result.image} 
                                                        alt={result.title}
                                                        width={40}
                                                        height={40}
                                                        style={{
                                                            objectFit: 'cover',
                                                            borderRadius: '4px'
                                                        }}
                                                    />
                                                )}
                                                <div>
                                                    <div className={styles.resultTitle}>{result.title}</div>
                                                    <Link 
                                                        href={`/author/${result.author_id}`}
                                                        className={styles.resultAuthor}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSearchTerm('');
                                                        }}
                                                    >
                                                        by {result.author}
                                                    </Link>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.noResults}>No results found</div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>

            <motion.div 
                className={styles.rightContainer}
                transition={{type:'spring',damping:18,mass:0.75}}
                initial={{opacity:0,x:1000}} 
                animate={{opacity:1,x:0}}
            >

                {user && (
                    <div className={styles.userContainer}>
                        <span className={styles.userName}>Bienvenu, {user.name}</span>
                        
                        <Link href="/change-password" className={styles.button}>
                            Modifier le mot de passe
                        </Link>

                        <button
                            onClick={handleLogout}
                            className={styles.button}
                        >
                            Deconnexion
                        </button>
                    </div>
                )}

                <Link href="/profile" className={styles.button}>
                    Profile
                </Link>
            </motion.div>
        </header>
    )
}

