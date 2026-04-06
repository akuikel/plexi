import React from 'react';

const Team = () => {
    const teamMembers = [
        {
            name: "Abhiyan Singh",
            title: "Chief Executive Officer",
            image: "https://ui-avatars.com/api/?name=Abhiyan+Singh&background=295647&color=fff",
            bio: "Delivered AI voice automation to 18+ businesses, handling thousands of calls and appointments.Founder of Alone|Orbit"
        },
        {
            name: "Aavash Kuikel",
            title: "Head of Engineering",
            image: "https://ui-avatars.com/api/?name=Aavash+Kuikel&background=D7AA42&color=fff",
            bio: "Expert in NLP and voice synthesis, 10x Hackathon Winner and Vanderbilt University Alum. Architecting Plexi's human-like voice agents that handle calls, schedule appointments, and capture leads for businesses."
        },
    ];

    return (
        <section style={{ padding: '100px 0', backgroundColor: 'var(--bg-primary)' }}>
            <div className="container">
                <div style={{ marginBottom: '60px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '3rem', marginBottom: '20px' }}>Meet Our Team</h2>
                    <p style={{ maxWidth: '600px', margin: '0 auto', color: '#666' }}>
                        Experts in Artificial Intelligence, Voice Synthesis, and Business Automation.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '40px'
                }}>
                    {teamMembers.map((member, index) => (
                        <div key={index} style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '180px',
                                height: '180px',
                                margin: '0 auto 25px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '4px solid #fff',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                            }}>
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{member.name}</h3>
                            <div style={{
                                color: 'var(--color-secondary)',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                fontSize: '0.85rem',
                                marginBottom: '15px',
                                letterSpacing: '1px'
                            }}>
                                {member.title}
                            </div>
                            <p style={{
                                color: '#555',
                                fontSize: '0.95rem',
                                lineHeight: '1.6',
                                maxWidth: '300px',
                                margin: '0 auto'
                            }}>
                                {member.bio}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Team;
