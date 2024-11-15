"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import styles from './create-post.module.css';
import { PREDEFINED_CATEGORIES } from '@/types/categories';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Header from '@/components/Header';

export default function CreatePost() {
    const router = useRouter();
    const { user } = useAuth();
    const supabase = createClientComponentClient();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [imageBase64, setImageBase64] = useState<string>('');
    const [previewUrl, setPreviewUrl] = useState<string>('');

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Vérifier la taille du fichier (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            try {
                const base64String = await convertToBase64(file);
                setImageBase64(base64String);
                setPreviewUrl(URL.createObjectURL(file));
            } catch (error) {
                console.error('Error converting image:', error);
                toast.error('Failed to process image');
            }
        }
    };

    const handleRemoveImage = () => {
        setImageBase64('');
        setPreviewUrl('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) {
            toast.error('You must be logged in to create a post');
            return;
        }
        
        setLoading(true);

        try {
            const { data: post, error } = await supabase
                .from('posts')
                .insert([
                    {
                        title,
                        content,
                        image: imageBase64 || null,
                        author_id: user.id,
                        categories: selectedCategories
                    }
                ])
                .select()
                .single();

            if (error) {
                throw error;
            }

            toast.success('Post created successfully!');
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Error details:', error);
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('An error occurred while creating the post');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategories(prev => 
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    return (
        <div className={styles.wrapper}>
            <Header />
            <div className={styles.container}>
                <Link href="/" className={styles.backLink}>
                    ← Back to Home
                </Link>
                <h1 className={styles.title}>Create New Post</h1>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="title">Title:</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Categories:</label>
                        <div className={styles.categoriesGrid}>
                            {PREDEFINED_CATEGORIES.map(category => (
                                <div key={category.id} className={styles.categoryItem}>
                                    <input
                                        type="checkbox"
                                        id={`category-${category.id}`}
                                        checked={selectedCategories.includes(category.id)}
                                        onChange={() => handleCategoryChange(category.id)}
                                        className={styles.categoryCheckbox}
                                    />
                                    <label 
                                        htmlFor={`category-${category.id}`}
                                        className={styles.categoryLabel}
                                        title={category.description}
                                    >
                                        {category.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="imageUpload">Upload Image:</label>
                        <input
                            type="file"
                            id="imageUpload"
                            onChange={handleImageChange}
                            accept="image/*"
                            className={styles.fileInput}
                        />
                        <small className={styles.imageHint}>
                            Maximum file size: 5MB
                        </small>
                    </div>

                    {previewUrl && (
                        <div className={styles.imagePreview}>
                            <Image
                                src={previewUrl}
                                alt="Preview"
                                width={200}
                                height={200}
                                style={{ objectFit: 'cover' }}
                            />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className={styles.removeImage}
                            >
                                Remove Image
                            </button>
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label htmlFor="content">Content:</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            className={styles.textarea}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Post'}
                    </button>
                </form>
            </div>
        </div>
    );
}