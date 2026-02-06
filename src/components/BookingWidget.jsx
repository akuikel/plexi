import React from 'react';
import { InlineWidget } from "react-calendly";

const BookingWidget = () => {
    return (
        <section id="booking" style={{ padding: '80px 0', backgroundColor: '#fff' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', fontFamily: 'var(--font-serif)' }}>Schedule Your Free Strategy Call</h2>
                    <p style={{ maxWidth: '600px', margin: '0 auto', color: '#666' }}>
                        Book a 30-minute consultation to see how our AI voice agents can transform your business workflows.
                    </p>
                </div>

                <div style={{
                    maxWidth: '1000px',
                    margin: '0 auto',
                    height: '700px', // Increased height for Calendly
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    <InlineWidget
                        url="https://calendly.com/contact-aipersa/30min"
                        styles={{
                            height: '100%',
                            width: '100%'
                        }}
                    />
                </div>
            </div>
        </section>
    );
};

export default BookingWidget;
