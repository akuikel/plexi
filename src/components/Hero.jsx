import React from 'react';
import VoiceDemo from './VoiceDemo';

const Hero = () => {
    return (
        <section style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'flex-start', // Align to top instead of center
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            paddingTop: '120px', // Space for navbar + some breathing room
            paddingBottom: '60px',
            paddingLeft: '20px',
            paddingRight: '20px'
        }}>
            <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                <div className="hero-grid">
                    {/* Left Column: Text */}
                    <div className="hero-text">
                        <span style={{
                            display: 'inline-block',
                            marginBottom: '20px',
                            color: 'var(--color-accent)',
                            fontWeight: '600',
                            letterSpacing: '1px',
                            fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                            textTransform: 'uppercase'
                        }}>
                            AI Voice Agents for Business
                        </span>

                        <h1 style={{
                            fontSize: 'clamp(1.75rem, 5vw, 2.8rem)',
                            marginBottom: 'clamp(20px, 3vw, 30px)',
                            lineHeight: '1.1'
                        }}>
                            We Build Intelligent Voice Solutions For You
                        </h1>

                        <p style={{
                            marginBottom: 'clamp(30px, 4vw, 40px)',
                            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                            color: '#555',
                            lineHeight: '1.8'
                        }}>
                            Automate your phone lines, schedule appointments, and capture leads 24/7 with our human-like AI voice agents.
                        </p>

                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button
                                className="btn-outline"
                                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                How It Works
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Interactive Demo */}
                    <div className="hero-demo">
                        <VoiceDemo />
                    </div>
                </div>
            </div>

            <style>{`
                .hero-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: clamp(20px, 4vw, 60px);
                    align-items: center;
                }

                .hero-text {
                    text-align: left;
                }

                .hero-demo {
                    width: 100%;
                    display: flex;
                    justify-content: flex-end;
                }

                /* Small mobile phones */
                @media (max-width: 480px) {
                    section {
                        padding-top: 5px !important;
                        padding-left: 12px !important;
                        padding-right: 12px !important;
                    }
                    
                    .hero-grid {
                        display: flex;
                        flex-direction: column;
                        gap: 25px;
                    }
                    
                    .hero-text {
                        text-align: center;
                        order: 1;
                    }
                    
                    .hero-demo {
                        order: 2;
                        justify-content: center;
                        max-width: 100%;
                    }
                }

                /* Mobile phones */
                @media (max-width: 768px) {
                    section {
                        padding-top: 5px !important;
                        padding-left: 15px !important;
                        padding-right: 15px !important;
                    }
                    
                    .hero-grid {
                        display: flex;
                        flex-direction: column;
                        gap: 30px;
                    }
                    
                    .hero-text {
                        text-align: center;
                        order: 1;
                    }
                    
                    .hero-demo {
                        order: 2;
                        justify-content: center;
                        max-width: 100%;
                    }
                }

                /* Tablets */
                @media (min-width: 769px) and (max-width: 1024px) {
                    .hero-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 40px;
                    }
                }

                /* Desktop */
                @media (min-width: 1025px) {
                    .hero-grid {
                        grid-template-columns: 1.2fr 1fr;
                        gap: 60px;
                    }
                }
            `}</style>
        </section>
    );
};

export default Hero;
