import React from 'react';
import VoiceDemo from './VoiceDemo';

const Hero = () => {
    return (
        <section style={{ padding: '40px 0 60px', position: 'relative', overflow: 'hidden' }}>
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '60px',
                    alignItems: 'center'
                }}>
                    {/* Left Column: Text */}
                    <div style={{ textAlign: 'left', marginTop: '-40px' }}>
                        <span style={{
                            display: 'inline-block',
                            marginBottom: '20px',
                            color: 'var(--color-accent)',
                            fontWeight: '600',
                            letterSpacing: '1px',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase'
                        }}>
                            AI Voice Agents for Business
                        </span>

                        <h1 style={{
                            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                            marginBottom: '30px',
                            lineHeight: '1.1'
                        }}>
                            We Build Intelligent Voice Solutions For You
                        </h1>

                        <p style={{
                            marginBottom: '40px',
                            fontSize: '1.2rem',
                            color: '#555',
                            lineHeight: '1.8'
                        }}>
                            Automate your phone lines, schedule appointments, and capture leads 24/7 with our human-like AI voice agents.
                        </p>

                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <button
                                className="btn-outline"
                                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                How It Works
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Interactive Demo */}
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        paddingLeft: '20px' // Push slightly right within its grid cell if room
                    }}>
                        <div style={{ width: '100%', maxWidth: '400px', transform: 'scale(0.95)', transformOrigin: 'right center' }}>
                            <VoiceDemo />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
