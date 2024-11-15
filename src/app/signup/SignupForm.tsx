'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './signup.module.css';

export default function SignupForm() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    password,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Signup failed');
            }

            router.push('/login');
        } catch (err: any) {
            setError(err.message || 'An error occurred during signup');
            console.error('Signup error:', err);
        }
    };
    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <h2 className={styles.title}>Créer votre compte</h2>
                <form className={styles.form} onSubmit={handleSubmit}>
                    {error && (
                        <div className={styles.error}>{error}</div>
                    )}
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Nom</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            minLength={3}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={6}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            className={styles.input}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            minLength={6}
                        />
                    </div>
                    <button type="submit" className={styles.button}>
                        S'inscrire
                    </button>
                </form>
                <div className="text-center mt-4">
                    <Link href="/login" className={styles.signupLink}>
                        Déjà un compte ? Se connecter
                    </Link>
                </div>
            </div>
        </div>
    );
}