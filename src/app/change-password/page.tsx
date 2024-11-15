"use client"
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import styles from './change-password.module.css'
import Link from 'next/link'

interface User {
    id: number;
    name: string;
}

export default function ChangePassword() {
    const { user } = useAuth()
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [userIdToChange, setUserIdToChange] = useState('')
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            const fetchUsersData = async () => {
                setLoading(true)
                try {
                    const response = await fetch('/api/users')
                    if (response.ok) {
                        const data = await response.json()
                        console.log('Fetched users:', data) // Debug log
                        setUsers(data)
                    } else {
                        console.error('Failed to fetch users:', await response.text())
                        toast.error('Failed to fetch users')
                    }
                } catch (error) {
                    console.error('Error fetching users:', error)
                    toast.error('Error fetching users')
                } finally {
                    setLoading(false)
                }
            }

            fetchUsersData()
        }
    }, [user?.role])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        try {
            console.log('Submitting password change request...');
            
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newPassword,
                    userIdToChange: user?.role === 'ADMIN' ? userIdToChange : user?.id
                }),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response:', errorData); // Debug log
                throw new Error(errorData.error || 'Failed to change password');
            }

            const data = await response.json();
            console.log('Success response:', data); // Debug log

            toast.success('Password changed successfully');
            setNewPassword('');
            setConfirmPassword('');
            setUserIdToChange('');
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error(error instanceof Error ? error.message : 'An error occurred while changing the password');
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <Link href="/" className={styles.backLink}>
                    ← Back to Home
                </Link>
                <h1 className={styles.title}>Change Password</h1>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    {user?.role === 'ADMIN' && (
                        <div className={styles.formGroup}>
                            <label htmlFor="userSelect">Select User:</label>
                            <select
                                id="userSelect"
                                value={userIdToChange}
                                onChange={(e) => setUserIdToChange(e.target.value)}
                                className={styles.select}
                                disabled={loading}
                                required
                            >
                                <option value="">
                                    {loading ? 'Loading users...' : 'Select a user'}
                                </option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {user?.role !== 'ADMIN' && (
                        <div className={styles.formGroup}>
                            <label htmlFor="currentPassword">Current Password:</label>
                            <input
                                type="password"
                                id="currentPassword"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className={styles.input}
                            />
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label htmlFor="newPassword">New Password:</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className={styles.input}
                            minLength={6}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword">Confirm New Password:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className={styles.input}
                            minLength={6}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Change Password'}
                    </button>
                </form>
                <ToastContainer />
            </div>
        </div>
    );
}