import React from 'react';

const HowItWorks = () => {
    const steps = [
        {
            number: "01",
            title: "Connect Your Number",
            description: "Simply forward your existing business line to your dedicated Plexi AI number. No complex hardware required."
        },
        {
            number: "02",
            title: "Customize Your Agent",
            description: "Upload your knowledge base, set your tone, and define booking rules. Your agent learns your business in minutes."
        },
        {
            number: "03",
            title: "Automate 24/7",
            description: "Plexi starts handling calls, booking appointments, and capturing leads instantly—day or night."
        }
    ];

    return (
        <section id="how-it-works" style={{ padding: '100px 0', backgroundColor: '#FAF8F5' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <span style={{
                        color: 'var(--color-accent)',
                        fontWeight: '600',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        fontSize: '0.9rem'
                    }}>
                        Simple Process
                    </span>
                    <h2 style={{
                        fontSize: '2.5rem',
                        marginTop: '15px',
                        fontFamily: 'var(--font-serif)'
                    }}>
                        How Plexi Works
                    </h2>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '40px'
                }}>
                    {steps.map((step, index) => (
                        <div key={index} style={{
                            backgroundColor: '#fff',
                            padding: '40px',
                            borderRadius: '8px',
                            borderTop: `4px solid var(--color-accent)`,
                            boxShadow: '0 5px 20px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{
                                fontSize: '3rem',
                                fontWeight: '700',
                                color: 'rgba(41, 86, 71, 0.1)', // Light accent color
                                marginBottom: '20px',
                                lineHeight: 1
                            }}>
                                {step.number}
                            </div>
                            <h3 style={{
                                fontSize: '1.4rem',
                                marginBottom: '15px',
                                fontFamily: 'var(--font-serif)'
                            }}>
                                {step.title}
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
