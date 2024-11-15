"use client"
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import PostCard from '@/components/PostCard'
import styles from './search.module.css'

interface SearchResult {
    id: string;
    title: string;
    image: string;
    author: string;
}

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`/api/posts/search?q=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    setResults(data);
                } else {
                    console.error('Search failed:', response.statusText);
                    setResults([]);
                }
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    if (!query) {
        return (
            <div className={styles.container}>
                <div className={styles.noQuery}>
                    Please enter a search term
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Searching...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.searchHeader}>
                <h1>Search Results</h1>
                <p className={styles.searchInfo}>
                    Found {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
                </p>
            </div>

            {results.length > 0 ? (
                <div className={styles.resultsGrid}>
                    {results.map((post: SearchResult) => (
                        <PostCard 
                            key={post.id}
                            id={post.id}
                            title={post.title || 'Untitled'}
                            image={post.image || '/default-image.jpg'}
                            author={post.author}
                        />
                    ))}
                </div>
            ) : (
                <div className={styles.noResults}>
                    No results found for &quot;{query}&quot;
                </div>
            )}
        </div>
    );
}