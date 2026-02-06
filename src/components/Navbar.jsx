import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    return (
        <nav
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                backgroundColor: scrolled ? 'rgba(250, 248, 245, 0.95)' : 'transparent',
                backdropFilter: scrolled ? 'blur(10px)' : 'none',
                transition: 'all 0.3s ease',
                borderBottom: scrolled ? '1px solid rgba(0,0,0,0.05)' : 'none',
                padding: 'var(--nav-padding, 20px 0)'
            }}
        >
            <style>{`
                :root {
                    --nav-padding: 20px 0;
                }
                @media (max-width: 768px) {
                    :root {
                        --nav-padding: 10px 0;
                    }
                }
            `}</style>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" className="nav-brand" style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    color: 'var(--color-text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textDecoration: 'none'
                }}>
                    <img src="/vite.svg" alt="Plexi Logo" style={{ height: '32px', width: '32px' }} />
                    Plexi
                </Link>
                <div className="nav-actions">
                    <button
                        className="btn-primary"
                        onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Schedule Your Call
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
