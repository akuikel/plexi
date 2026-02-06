import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{ backgroundColor: '#fff', borderTop: '1px solid #eee', padding: '20px 0' }}>
            <div className="container footer-container">
                <div className="footer-main-content">
                    <div className="footer-top-row">
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
                        <div className="footer-links">
                            <Link to="/privacy-policy" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
                                Privacy Policy
                            </Link>
                            <Link to="/terms-of-service" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                    <div className="footer-bottom-row">
                        <span className="footer-copyright">
                            &copy; 2025
                        </span>
                    </div>
                </div>
            </div>

            <style>{`
                .footer-container {
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                }
                
                .footer-main-content {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                }

                .footer-top-row {
                    display: flex;
                    align-items: center;
                    gap: 40px;
                    flex-wrap: wrap;
                }
                
                .footer-links {
                    display: flex;
                    gap: 30px;
                }
                
                .footer-copyright {
                    color: #999;
                    font-size: 0.8rem;
                    margin-left: 34px; /* Align with the start of 'Plexi' text (24px logo + 10px gap) */
                    margin-top: -2px;
                }
                
                /* Mobile layout */
                @media (max-width: 600px) {
                    .footer-top-row {
                        gap: 15px;
                        justify-content: space-between;
                    }
                    
                    .footer-links {
                        gap: 15px;
                    }

                    .footer-copyright {
                        margin-left: 34px;
                    }
                }
            `}</style>
        </footer>
    );
};

export default Footer;
