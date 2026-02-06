import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{ backgroundColor: '#fff', borderTop: '1px solid #eee', padding: '15px 0' }}>
            <div className="container footer-container">
                <div className="footer-main-content">
                    <div className="footer-row">
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                            <img src="/vite.svg" alt="Plexi Logo" style={{ height: '20px', width: '20px' }} />
                            <span style={{
                                fontFamily: 'Playfair Display, serif',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                color: 'var(--color-text-primary)'
                            }}>
                                Plexi
                            </span>
                        </Link>

                        <span className="footer-copyright">
                            &copy; 2025
                        </span>

                        <div className="footer-links">
                            <Link to="/privacy-policy" className="footer-link">
                                Privacy Policy
                            </Link>
                            <Link to="/terms-of-service" className="footer-link">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .footer-container {
                    display: flex;
                }
                
                .footer-main-content {
                    width: 100%;
                }

                .footer-row {
                    display: flex;
                    align-items: center;
                    gap: clamp(15px, 3vw, 30px);
                    white-space: nowrap;
                }
                
                .footer-links {
                    display: flex;
                    gap: clamp(10px, 2vw, 20px);
                    align-items: center;
                }
                
                .footer-link {
                    color: #666;
                    text-decoration: none;
                    font-size: 0.75rem;
                }
                
                .footer-copyright {
                    color: #999;
                    font-size: 0.75rem;
                    margin-top: 2px;
                }
                
                /* Mobile adjustments */
                @media (max-width: 480px) {
                    .footer-row {
                        gap: 10px;
                    }
                    .footer-links {
                        gap: 8px;
                    }
                    .footer-link, .footer-copyright {
                        font-size: 0.7rem;
                    }
                }
            `}</style>
        </footer>
    );
};

export default Footer;
