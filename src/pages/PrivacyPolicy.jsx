import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
    return (
        <>
            <Navbar />
            <div className="container" style={{ padding: '80px 20px', minHeight: '60vh', maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ display: 'inline-block', marginBottom: '20px', color: '#666', textDecoration: 'none' }}>&larr; Back to Home</Link>
                <h1 style={{ marginBottom: '40px', fontFamily: 'var(--font-serif)', fontSize: '2.5rem' }}>Privacy Policy</h1>

                <div style={{ lineHeight: '1.8', color: '#444' }}>
                    <p style={{ marginBottom: '20px' }}>Last updated: {new Date().toLocaleDateString()}</p>

                    <p style={{ marginBottom: '20px' }}>
                        At Plexi AI Solutions ("we," "us," or "our"), we respect your privacy and are committed to protecting
                        the personal information you share with us. This Privacy Policy explains how we collect, use, disclosure,
                        and safeguard your information when you visit our website or use our AI voice automation services.
                    </p>

                    <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#222' }}>1. Information We Collect</h3>
                    <p style={{ marginBottom: '15px' }}>
                        We may collect information about you in a variety of ways. The information we may collect includes:
                    </p>
                    <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                        <li style={{ marginBottom: '10px' }}>
                            <strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address,
                            email address, and telephone number, that you voluntarily give to us when you register with the
                            Service or when you choose to participate in various activities related to the Service.
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <strong>Voice Data:</strong> Audio recordings and transcripts generated during your interactions with our
                            AI voice agents for quality assurance and service improvement purposes.
                        </li>
                    </ul>

                    <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#222' }}>2. Use of Your Information</h3>
                    <p style={{ marginBottom: '20px' }}>
                        We use the information we collect to provide, operate, and maintain our services, improve user experience,
                        communicate with you, and solely for internal analytics. We do not sell your personal data to third parties.
                    </p>

                    <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#222' }}>3. Data Security</h3>
                    <p style={{ marginBottom: '20px' }}>
                        We use administrative, technical, and physical security measures to help protect your personal information.
                        While we have taken reasonable steps to secure the personal information you provide to us, please be aware
                        that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission
                        can be guaranteed against any interception or other type of misuse.
                    </p>

                    <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#222' }}>4. Contact Us</h3>
                    <p style={{ marginBottom: '20px' }}>
                        If you have questions or comments about this Privacy Policy, please contact us at: <br />
                        <strong>contact@aipersa.com</strong>
                    </p>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PrivacyPolicy;
