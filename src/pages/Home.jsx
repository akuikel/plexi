import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import StatsBar from '../components/StatsBar';
import BookingWidget from '../components/BookingWidget';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <>
            <Navbar />
            <Hero />
            <StatsBar />
            <HowItWorks />
            <BookingWidget />
            <Footer />
        </>
    );
};

export default Home;
