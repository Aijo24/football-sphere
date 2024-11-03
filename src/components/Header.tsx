"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'

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

  const buttonBaseStyle = {
    padding: '0.5rem 1.2rem',
    backgroundColor: '#fff',
    border: '2px solid var(--secondary-blue)',
    borderRadius: '20px',
    cursor: 'pointer',
    color: 'var(--text-blue)',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    display: 'inline-block',
    textDecoration: 'none',
  }

  return (
   <header style={headerStyle}>
    <motion.div style={leftContainerStyle}
      transition={{type:'spring',damping:18,mass:0.75}}
      initial={{opacity:0,x:-1000}} 
      animate={{opacity:1,x:0}}
    >
      <h1 style={bookTitleStyle}>Football Sphere</h1>
      <div style={searchContainerStyle}>
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
          style={searchInputStyle}
          initial={{opacity:0,x:-100}}
          animate={{opacity:1,x:0}}
        />
        {searchTerm.trim() && (
          <div style={searchResultsStyle}>
            {isSearching ? (
              <div style={loadingStyle}>Searching...</div>
            ) : searchResults.length > 0 ? (
              <div>
                {searchResults.map((result: SearchResult) => (
                  <Link 
                    key={result.id} 
                    href={`/post/${result.id}`}
                    style={searchResultItemStyle}
                    onClick={() => setSearchTerm('')}
                  >
                    <div style={resultContentStyle}>
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
                        <div style={resultTitleStyle}>{result.title}</div>
                        <Link 
                          href={`/author/${result.author_id}`}
                          style={resultAuthorStyle}
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
              <div style={noResultsStyle}>No results found</div>
            )}
          </div>
        )}
      </div>
    </motion.div>

    <motion.div 
      style={rightContainerStyle} 
      transition={{type:'spring',damping:18,mass:0.75}}
      initial={{opacity:0,x:1000}} 
      animate={{opacity:1,x:0}}
    >
      {user && (
        <motion.div style={userContainerStyle}>
          <span style={userNameStyle}>Bienvenu, {user.name}</span>
          
          <motion.div
            style={buttonBaseStyle}
            whileHover={{ 
              backgroundColor: 'var(--primary-blue)',
              color: '#fff',
              scale: 1.05
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              href="/change-password" 
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              Mofifier le mot de passe
            </Link>
          </motion.div>

          <motion.button
            onClick={handleLogout}
            style={buttonBaseStyle}
            whileHover={{ 
              backgroundColor: 'var(--primary-blue)',
              color: '#fff',
              scale: 1.05
            }}
            whileTap={{ scale: 0.95 }}
          >
            Deconnexion
          </motion.button>
        </motion.div>
      )}

      <motion.div
        style={buttonBaseStyle}
        whileHover={{ 
          backgroundColor: 'var(--primary-blue)',
          color: '#fff',
          scale: 1.05
        }}
        whileTap={{ scale: 0.95 }}
      >
        <Link 
          href="/profile" 
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          Profile
        </Link>
      </motion.div>
    </motion.div>
   </header>
  )
}

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: 'var(--bg-blue)',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.1)',
}

const leftContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem'
}

const bookTitleStyle = {
    color: 'var(--primary-blue)',
    fontSize: '1.8rem',
    fontWeight: '700',
}

const searchInputStyle = {
    padding: "0.7rem 1.2rem",
    borderRadius: '70px',
    backgroundColor: '#fff',
    border: '2px solid var(--secondary-blue)',
    minWidth: '320px',
    color: 'var(--text-blue)',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
}

const rightContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
}

const avatarLinkStyle = {
    marginRight:'1rem'
}

const avatarStyle = {
    width:"40px",
    height:'40px',
    borderRadius:'50%'
}

const userContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
}

const userNameStyle = {
    color: 'var(--text-blue)',
    fontSize: '0.9rem',
    fontWeight: '500'
}

const logoutButtonStyle = {
    padding: '0.5rem 1.2rem',
    backgroundColor: '#fff',
    border: '2px solid var(--secondary-blue)',
    borderRadius: '20px',
    cursor: 'pointer',
    color: 'var(--text-blue)',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}

const linkStyle = {
    color: 'var(--text-blue)',
    textDecoration: 'none',
    padding: '0.5rem 1.2rem',
    backgroundColor: '#fff',
    border: '2px solid var(--secondary-blue)',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
}

const profileLinkStyle = {
    color: 'var(--text-blue)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    padding: '0.5rem 1.2rem',
    backgroundColor: '#fff',
    border: '2px solid var(--secondary-blue)',
    borderRadius: '20px',
    transition: 'all 0.2s ease',
}

const searchContainerStyle = {
    position: 'relative' as const,
    flex: '1',
    maxWidth: '600px',
}

const searchResultsStyle = {
    position: 'absolute' as const,
    top: 'calc(100% + 8px)',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    border: '1px solid var(--secondary-blue)',
    borderRadius: '10px',
    maxHeight: '400px',
    overflowY: 'auto' as const,
    zIndex: 1000,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}

const searchResultItemStyle = {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--bg-blue)',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'block',
    color: 'inherit',
    transition: 'all 0.2s ease',
    backgroundColor: '#fff',
    ':hover': {
        backgroundColor: 'var(--bg-blue)',
    }
}

const resultContentStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
}

const resultImageStyle = {
    width: '40px',
    height: '40px',
    objectFit: 'cover' as const,
    borderRadius: '4px',
}

const resultTitleStyle = {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: 'var(--text-blue)',
    marginBottom: '0.25rem',
}

const resultAuthorStyle = {
    fontSize: '0.85rem',
    color: 'var(--secondary-blue)',
    textDecoration: 'none',
    ':hover': {
        textDecoration: 'underline',
    }
}

const loadingStyle = {
    padding: '1rem',
    textAlign: 'center' as const,
    color: 'var(--text-blue)',
}

const noResultsStyle = {
    padding: '1rem',
    textAlign: 'center' as const,
    color: 'var(--text-blue)',
}

