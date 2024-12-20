"use client"
import '@fortawesome/fontawesome-free/css/all.min.css'
import { motion } from 'framer-motion'
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import styles from './post.module.css'

interface Post {
    id: string;
    title: string;
    content: string;
    image: string | null;
    author: string;
    author_id: string;
    created_at: string;
    categories: string[];
}

export default function PostPage() {
    const params = useParams();
    const router = useRouter();
    
    console.log('Params:', params);
    
    const postId = typeof params?.id === 'string' ? params.id : null;
    
    console.log('Post ID:', postId);

    const { user } = useAuth();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            if (!postId) {
                console.error('Invalid or missing post ID');
                setError('Post not found');
                setLoading(false);
                return;
            }

            try {
                console.log('Fetching post with ID:', postId);
                const response = await fetch(`/api/posts/${postId}`);
                
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to fetch post');
                }

                const data = await response.json();
                console.log('Post data received:', data);
                
                if (!data) {
                    throw new Error('No post data received');
                }

                setPost({
                    ...data,
                    categories: data.categories || []
                });
                setEditedContent(data.content);
            } catch (err) {
                console.error('Error fetching post:', err);
                setError(err instanceof Error ? err.message : 'Failed to load post');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    const handleSave = async () => {
        if (!post || !user) return

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: editedContent,
                    author_id: user.id
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to update post')
            }

            toast.success('Changes saved successfully!')
            setIsEditing(false)
            // Update local post data
            setPost(prev => prev ? { ...prev, content: editedContent } : null)
        } catch (err) {
            toast.error('Failed to save changes')
        }
    }

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: user?.id,
                    role: user?.role
                })
            });

            if (!response.ok) {
                throw new Error('Failed to delete post');
            }

            toast.success('Post deleted successfully');
            router.push('/');
        } catch (err) {
            toast.error('Failed to delete post');
            console.error('Error deleting post:', err);
        }
    };

    const renderImage = () => {
        if (!post?.image) return null;

        // Vérifier si l'image est déjà en base64
        const isBase64 = post.image.startsWith('data:image');
        const imageUrl = isBase64 ? post.image : `/api/images/${post.image}`;

        return (
            <div className={styles.imageContainer}>
                <img
                    src={post.image}
                    alt={post.title}
                    className={styles.image}
                />
            </div>
        );
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner} />
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>{error}</p>
                <button 
                    className={styles.backButton}
                    onClick={() => router.back()}
                >
                    Go Back
                </button>
            </div>
        )
    }

    if (!post) {
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>Post not found</p>
                <button 
                    className={styles.backButton}
                    onClick={() => router.back()}
                >
                    Go Back
                </button>
            </div>
        )
    }

    const canEdit = Boolean(user?.id && post?.author_id && user.id === post.author_id);
    const canDelete = Boolean(
        user?.id && post?.author_id && (
            user.id === post.author_id || 
            user.role === 'ADMIN' || 
            user.role === 'MODERATOR'
        )
    );

    return (
        <motion.div className={styles.main}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <button 
                        className={styles.backButton}
                        onClick={() => router.back()}
                    >
                        <i className="fas fa-arrow-left" /> Back
                    </button>

                    <div className={styles.actions}>
                        {canEdit && (
                            <>
                                {isEditing ? (
                                    <button 
                                        className={styles.saveButton}
                                        onClick={handleSave}
                                    >
                                        <i className="fas fa-save" /> Save
                                    </button>
                                ) : (
                                    <button 
                                        className={styles.editButton}
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <i className="fas fa-edit" /> Edit
                                    </button>
                                )}
                            </>
                        )}
                        {canDelete && !isEditing && (
                            <button 
                                className={styles.deleteButton}
                                onClick={handleDelete}
                            >
                                <i className="fas fa-trash" /> Delete
                            </button>
                        )}
                    </div>
                </header>

                <article className={styles.article}>
                    {renderImage()}

                    <div className={styles.content}>
                        <h1 className={styles.title}>{post.title}</h1>
                        
                        <div className={styles.meta}>
                            <span className={styles.author}>
                                <i className="fas fa-user" /> {post.author}
                            </span>
                            <span className={styles.date}>
                                <i className="fas fa-calendar" /> {new Date(post.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        {post.categories && post.categories.length > 0 && (
                            <div className={styles.categories}>
                                {post.categories.map((category) => (
                                    <span 
                                        key={category} 
                                        className={`${styles.category} ${styles[`category-${category}`]}`}
                                    >
                                        {category}
                                    </span>
                                ))}
                            </div>
                        )}

                        {isEditing ? (
                            <div className={styles.editorWrapper}>
                                <textarea
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                    className={styles.editor}
                                    placeholder="Edit your content here..."
                                />
                            </div>
                        ) : (
                            <div 
                                className={styles.postContent}
                                dangerouslySetInnerHTML={{ __html: post.content }} 
                            />
                        )}
                    </div>
                </article>

                <ToastContainer 
                    position="bottom-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </div>
        </motion.div>
    )
}