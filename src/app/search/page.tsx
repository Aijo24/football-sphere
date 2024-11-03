"use client"
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import PostCard from '@/components/PostCard'
import styles from './search.module.css'

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;

            setLoading(true);
            try {
                const response = await fetch(`/api/posts/search?q=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    setResults(data);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    if (loading) {
        return <div className={styles.loading}>Searching...</div>;
    }

    return (
        <div className={styles.container}>
            <h1>Search Results for "{query}"</h1>
            {results.length > 0 ? (
                <div className={styles.resultsGrid}>
                    {results.map((post) => (
                        <PostCard 
                            key={post.id}
                            title={post.title}
                            image={post.image}
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