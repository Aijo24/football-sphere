"use client"
import { useState } from 'react';
import { PREDEFINED_CATEGORIES } from '@/types/categories';
import styles from './CategoryFilter.module.css';

type Props = {
    onCategoryChange: (categories: string[]) => void;
}

export default function CategoryFilter({ onCategoryChange }: Props) {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const handleCategoryChange = (categoryId: string) => {
        const newCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId)
            : [...selectedCategories, categoryId];
        
        setSelectedCategories(newCategories);
        onCategoryChange(newCategories);
    };

    return (
        <div className={styles.filterContainer}>
            <h3 className={styles.filterTitle}>Filter by Category</h3>
            <div className={styles.categoriesList}>
                {PREDEFINED_CATEGORIES.map(category => (
                    <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`${styles.categoryButton} ${
                            selectedCategories.includes(category.id) ? styles.selected : ''
                        }`}
                        title={category.description}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    );
} 