import React from 'react';
import VoiceDemo from './VoiceDemo';

const Hero = () => {
    return (
        <section style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            padding: '100px 20px 40px' // Top padding for navbar, side padding for mobile
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

                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
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
                    gap: 40px;
                    align-items: center;
                    grid-template-columns: 1fr;
                }

                .hero-text {
                    text-align: left;
                }

                .hero-demo {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    margin: 0 auto;
                }

                /* Mobile: Stack vertically, demo on top */
                @media (max-width: 768px) {
                    .hero-grid {
                        grid-template-columns: 1fr;
                        gap: 30px;
                    }
                    
                    .hero-text {
                        text-align: center;
                        order: 2;
                    }
                    
                    .hero-demo {
                        order: 1;
                        max-width: 100%;
                    }
                }

                /* Tablet: Side by side with balanced spacing */
                @media (min-width: 769px) and (max-width: 1024px) {
                    .hero-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 40px;
                    }
                    
                    .hero-demo {
                        justify-content: flex-end;
                    }
                }

                /* Desktop: Optimal layout */
                @media (min-width: 1025px) {
                    .hero-grid {
                        grid-template-columns: 1.2fr 1fr;
                        gap: 60px;
                    }
                    
                    .hero-demo {
                        justify-content: flex-end;
                    }
                }
            `}</style>
        </section>
    );
};

export default Hero;
