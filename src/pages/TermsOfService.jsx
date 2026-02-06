import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsOfService = () => {
    return (
        <>
            <Navbar />
            <div className="container" style={{ padding: '80px 20px', minHeight: '60vh', maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-block', marginBottom: '20px', color: '#666', textDecoration: 'none' }}>&larr; Back to Home</Link>
                <h1 style={{ marginBottom: '40px', fontFamily: 'var(--font-serif)', fontSize: '2.5rem' }}>Terms of Service</h1>

                <div style={{ lineHeight: '1.8', color: '#444' }}>
                    <p style={{ marginBottom: '20px' }}>Last updated: {new Date().toLocaleDateString()}</p>

                    <p style={{ marginBottom: '20px' }}>
                        Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the
                        Plexi AI Solutions website and services operated by Plexi ("us", "we", or "our").
                    </p>

                    <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#222' }}>1. Acceptance of Terms</h3>
                    <p style={{ marginBottom: '20px' }}>
                        By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part
                        of the terms then you may not access the Service.
                    </p>

                    <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#222' }}>2. Service Description</h3>
                    <p style={{ marginBottom: '20px' }}>
                        Plexi provides AI-powered voice automation services for businesses. We grant you a limited, non-exclusive,
                        non-transferable license to use our services in accordance with these Terms.
                    </p>

                    <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#222' }}>3. User Responsibilities</h3>
                    <p style={{ marginBottom: '20px' }}>
                        You are responsible for your use of the Service and for any consequences thereof. You agree not to use
                        the Service for any illegal or unauthorized purpose, including but not limited to harassment, spamming,
                        or violating intellectual property rights.
                    </p>

                    <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#222' }}>4. Limitation of Liability</h3>
                    <p style={{ marginBottom: '20px' }}>
                        In no event shall Plexi, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable
                        for any indirect, incidental, special, consequential or punitive damages, including without limitation,
                        loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use
                        of or inability to access or use the Service.
                    </p>

                    <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#222' }}>5. Changes</h3>
                    <p style={{ marginBottom: '20px' }}>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision
                        is material we will try to provide at least 30 days notice prior to any new terms taking effect.
                    </p>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default TermsOfService;
