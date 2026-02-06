import React from 'react';

const StatsBar = () => {
    const stats = [
        { label: "Availability", value: "24/7" },
        { label: "Cost Savings", value: "60%" },
        { label: "Setup Time", value: "< 24h" }
    ];

    return (
        <div style={{ position: 'relative', zIndex: 10, marginTop: '-20px' }}>
            <div className="container">
                <div style={{
                    backgroundColor: '#fff',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    borderRadius: '8px',
                    padding: '40px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    textAlign: 'center'
                }}>
                    {stats.map((stat, index) => (
                        <div key={index} style={{
                            borderRight: index < stats.length - 1 ? '1px solid #eee' : 'none'
                        }}>
                            <div style={{
                                fontSize: '2.5rem',
                                fontWeight: '700',
                                color: 'var(--color-accent)',
                                fontFamily: 'var(--font-serif)',
                                marginBottom: '5px'
                            }}>
                                {stat.value}
                            </div>
                            <div style={{
                                color: '#666',
                                fontWeight: '500',
                                textTransform: 'uppercase',
                                fontSize: '0.85rem',
                                letterSpacing: '1px'
                            }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatsBar;
