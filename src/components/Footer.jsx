import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{ backgroundColor: '#fff', borderTop: '1px solid #eee', padding: '40px 0' }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                {/* Brand / Logo Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        <img src="/vite.svg" alt="Plexi Logo" style={{ height: '24px', width: '24px' }} />
                        <span style={{
                            fontFamily: 'Playfair Display, serif',
                            fontSize: '1.2rem',
                            fontWeight: '700',
                            color: 'var(--color-text-primary)'
                        }}>
                            Plexi
                        </span>
                    </Link>
                    <span style={{ color: '#ccc', fontSize: '0.8rem', marginLeft: '10px' }}>
                        &copy; {new Date().getFullYear()}
                    </span>
                </div>

                {/* Legal Links Section */}
                <div style={{ display: 'flex', gap: '30px' }}>
                    <Link to="/privacy-policy" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
                        Privacy Policy
                    </Link>
                    <Link to="/terms-of-service" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
                        Terms of Service
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
