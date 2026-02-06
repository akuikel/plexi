import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{ backgroundColor: '#fff', borderTop: '1px solid #eee', padding: '30px 0' }}>
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
                            &copy; {new Date().getFullYear()}
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
                    gap: 5px;
                }

                .footer-top-row {
                    display: flex;
                    align-items: center;
                    gap: 30px;
                }
                
                .footer-links {
                    display: flex;
                    gap: 30px;
                }
                
                .footer-copyright {
                    color: #ccc;
                    font-size: 0.8rem;
                    margin-left: 34px; /* Align with the start of 'Plexi' text (24px logo + 10px gap) */
                }
                
                /* Mobile layout */
                @media (max-width: 768px) {
                    .footer-top-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 15px;
                    }
                    
                    .footer-links {
                        gap: 20px;
                    }

                    .footer-copyright {
                        margin-left: 0;
                    }
                }
            `}</style>
        </footer>
    );
};

export default Footer;
