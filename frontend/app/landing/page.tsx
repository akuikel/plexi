'use client';

import {
  Phone, Mic, Clock, CheckCircle, Star, ArrowRight, Shield, Zap,
  Users, MessageSquare, Play, PhoneCall, AlertTriangle, Video, MapPin, StarHalf,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { InlineWidget } from 'react-calendly';
import VoiceDemo from '@/components/landing/VoiceDemo';

const reviews = [
  { name: 'Sarah Johnson', role: 'Marketing Manager', location: 'New York, USA', avatar: '/american-woman-professional.png', rating: 5, text: 'Plexi saved me 3 hours of hold time with customer service. It got my refund processed while I was in meetings!' },
  { name: 'Rajesh Sharma', role: 'Software Engineer', location: 'Mumbai, India', avatar: '/indian-professional-man.png', rating: 5, text: 'Amazing for handling awkward conversations. Plexi negotiated my internet bill down by $30/month without any hassle.' },
  { name: 'Emma Thompson', role: 'Consultant', location: 'Sydney, Australia', avatar: '/australian-woman-professional.png', rating: 4.5, text: 'As someone with social anxiety, Plexi is a game-changer. It handles all my appointment scheduling seamlessly.' },
  { name: 'Michael Chen', role: 'Business Owner', location: 'Toronto, Canada', avatar: '/asian-man-creative.png', rating: 5, text: 'Perfect for awkward conversations. Plexi handled canceling my gym membership without any pushback.' },
  { name: 'Sita Thapa', role: 'Teacher', location: 'Kathmandu, Nepal', avatar: '/indian-woman-designer.png', rating: 5, text: 'Plexi helped me reschedule multiple parent-teacher conferences when I was sick. Saved my entire week!' },
  { name: 'James Wilson', role: 'Sales Director', location: 'London, UK', avatar: '/professional-man-sales.png', rating: 4, text: 'The Active Mode is incredible! Plexi answered calls while I was in a client presentation and filtered out spam perfectly.' },
  { name: 'Isabella Rodriguez', role: 'Restaurant Owner', location: 'Madrid, Spain', avatar: '/asian-woman-professional.png', rating: 5, text: "Plexi handles all my supplier calls and inventory checks. It's like having a personal assistant for my business." },
  { name: 'David Kim', role: 'UX Designer', location: 'Seoul, South Korea', avatar: '/korean-entrepreneur.png', rating: 4.5, text: 'I use Plexi to check product availability at stores before driving there. Saves me so much time and gas money!' },
  { name: 'Deepasha Kumar', role: 'Data Analyst', location: 'New Delhi, India', avatar: '/indian-woman-professional.png', rating: 5, text: "Plexi got me a full refund on a defective laptop when I couldn't get through to customer service for days." },
  { name: 'Lucas Silva', role: 'Marketing Director', location: 'São Paulo, Brazil', avatar: '/nepali-businessman.png', rating: 4.5, text: "The meeting attendance feature is coming soon and I can't wait! Plexi already handles my scheduling perfectly." },
  { name: 'Sophie Anderson', role: 'Startup Founder', location: 'Melbourne, Australia', avatar: '/nepali-woman-executive.png', rating: 5, text: "Plexi handles all the tedious vendor calls for my startup. It's freed up hours of my time every week." },
  { name: 'Alexander Petrov', role: 'Doctor', location: 'Moscow, Russia', avatar: '/indian-tech-professional.png', rating: 4, text: 'Perfect for rescheduling appointments when emergencies come up. My patients love that they get immediate responses.' },
  { name: 'Charlotte Brown', role: 'Project Manager', location: 'Manchester, UK', avatar: '/hispanic-professional-man.png', rating: 5, text: "Plexi's scam call filtering is amazing! It only lets important calls through and drops the spam automatically." },
  { name: 'Antoine Dubois', role: 'Product Designer', location: 'Paris, France', avatar: '/nepali-engineer.png', rating: 4.5, text: "I love how Plexi can check travel costs and book appointments. It's like having a travel agent and secretary in one." },
  { name: 'Mia Johansson', role: 'Software Engineer', location: 'Stockholm, Sweden', avatar: '/nepali-woman-executive.png', rating: 5, text: 'The transcripts are incredibly detailed. I can review exactly what was discussed without having to take notes during calls.' },
];

const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  for (let i = 0; i < fullStars; i++) stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
  if (hasHalf) stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
  const remaining = 5 - Math.ceil(rating);
  for (let i = 0; i < remaining; i++) stars.push(<Star key={`e-${i}`} className="h-4 w-4 text-gray-300" />);
  return stars;
};

export default function LandingPage() {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentReviewIndex(prev => (prev + 3) % reviews.length), 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const currentReviews = [
    reviews[currentReviewIndex],
    reviews[(currentReviewIndex + 1) % reviews.length],
    reviews[(currentReviewIndex + 2) % reviews.length],
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', fontFamily: 'Inter, sans-serif' }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 1000,
        backgroundColor: scrolled ? 'rgba(250,248,245,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        transition: 'all 0.3s ease',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.05)' : 'none',
        padding: '20px 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: '700', color: '#29303D', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#295647', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Phone style={{ color: '#FAF8F5', width: '16px', height: '16px' }} />
            </div>
            Plexi
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#features" style={{ fontSize: '0.9rem', fontWeight: '500', color: '#29303D', textDecoration: 'none' }}>Features</a>
            <a href="#how-it-works" style={{ fontSize: '0.9rem', fontWeight: '500', color: '#29303D', textDecoration: 'none' }}>How It Works</a>
            <a href="#pricing" style={{ fontSize: '0.9rem', fontWeight: '500', color: '#29303D', textDecoration: 'none' }}>Pricing</a>
            <Link href="/login">
              <button style={{ backgroundColor: 'transparent', color: '#295647', border: '2px solid #295647', padding: '8px 20px', borderRadius: '4px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Log In
              </button>
            </Link>
            <button
              onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ backgroundColor: '#295647', color: '#FAF8F5', border: '2px solid #295647', padding: '8px 20px', borderRadius: '4px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              Schedule Your Call
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', padding: '80px 20px 60px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div>
              <span style={{ display: 'inline-block', marginBottom: '20px', color: '#295647', fontWeight: '600', letterSpacing: '1px', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                AI Voice Agents for Business
              </span>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '700', color: '#29303D', marginBottom: '24px', lineHeight: '1.1' }}>
                We Build Intelligent Voice Solutions For You
              </h1>
              <p style={{ fontSize: '1.15rem', color: '#555', lineHeight: '1.8', marginBottom: '36px' }}>
                Automate your phone lines, schedule appointments, and capture leads 24/7 with our human-like AI voice agents.
              </p>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <Link href="/signup">
                  <button style={{ backgroundColor: '#295647', color: '#FAF8F5', padding: '14px 32px', border: '2px solid #295647', borderRadius: '4px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Start For Free
                  </button>
                </Link>
                <button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{ backgroundColor: 'transparent', color: '#29303D', padding: '14px 32px', border: '2px solid #29303D', borderRadius: '4px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  How It Works
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <VoiceDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 10, marginTop: '-20px', padding: '0 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ backgroundColor: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderRadius: '8px', padding: '40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center' }}>
            {[{ value: '24/7', label: 'Availability' }, { value: '60%', label: 'Cost Savings' }, { value: '< 24h', label: 'Setup Time' }].map((stat, i) => (
              <div key={i} style={{ borderRight: i < 2 ? '1px solid #eee' : 'none' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#295647', fontFamily: 'Playfair Display, serif', marginBottom: '5px' }}>{stat.value}</div>
                <div style={{ color: '#666', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '100px 20px', backgroundColor: '#FAF8F5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ color: '#295647', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>Simple Process</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', marginTop: '15px', color: '#29303D' }}>How Plexi Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
            {[
              { number: '01', title: 'Connect Your Number', desc: 'Simply forward your existing business line to your dedicated Plexi AI number. No complex hardware required.' },
              { number: '02', title: 'Customize Your Agent', desc: 'Upload your knowledge base, set your tone, and define booking rules. Your agent learns your business in minutes.' },
              { number: '03', title: 'Automate 24/7', desc: 'Plexi starts handling calls, booking appointments, and capturing leads instantly — day or night.' },
            ].map((step, i) => (
              <div key={i} style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '8px', borderTop: '4px solid #295647', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '3rem', fontWeight: '700', color: 'rgba(41,86,71,0.1)', marginBottom: '20px', lineHeight: 1 }}>{step.number}</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', marginBottom: '15px', color: '#29303D' }}>{step.title}</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 20px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ color: '#295647', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>What People Say</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', marginTop: '15px', color: '#29303D' }}>Trusted by People Everywhere</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {currentReviews.map((review, index) => (
              <div key={`${review.name}-${currentReviewIndex}-${index}`} style={{ backgroundColor: '#FAF8F5', padding: '28px', borderRadius: '8px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e0d8', transition: 'transform 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#e5e0d8', flexShrink: 0 }}>
                    <img src={review.avatar || '/placeholder.svg'} alt={review.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h4 style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600', color: '#29303D', margin: 0 }}>{review.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>{review.role}</p>
                    <p style={{ fontSize: '0.75rem', color: '#999', margin: 0 }}>{review.location}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>{renderStars(review.rating)}</div>
                <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: '1.6', fontStyle: 'italic' }}>"{review.text}"</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <button onClick={() => setCurrentReviewIndex(prev => (prev - 3 + reviews.length) % reviews.length)} style={{ backgroundColor: 'transparent', border: '2px solid #295647', color: '#295647', padding: '8px 20px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Previous</button>
            <div style={{ display: 'flex', gap: '8px' }}>
              {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, i) => (
                <button key={i} onClick={() => setCurrentReviewIndex(i * 3)} style={{ width: '8px', height: '8px', borderRadius: '50%', border: 'none', backgroundColor: Math.floor(currentReviewIndex / 3) === i ? '#295647' : '#d1cdc7', cursor: 'pointer' }} />
              ))}
            </div>
            <button onClick={() => setCurrentReviewIndex(prev => (prev + 3) % reviews.length)} style={{ backgroundColor: 'transparent', border: '2px solid #295647', color: '#295647', padding: '8px 20px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Next →</button>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 20px', backgroundColor: '#FAF8F5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ color: '#295647', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>Everything You Need</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', marginTop: '15px', color: '#29303D' }}>Your Complete Communication Solution</h2>
            <p style={{ maxWidth: '600px', margin: '20px auto 0', color: '#666', lineHeight: '1.7' }}>Plexi handles every aspect of phone communication so you can focus on what matters most</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
            {[
              { icon: Phone, title: 'Smart Call Handling', desc: 'Automatically navigates IVR menus and speaks naturally with human agents' },
              { icon: Mic, title: 'Natural Conversations', desc: 'GPT-powered intelligence manages context, follow-ups, and polite dialogue' },
              { icon: Clock, title: 'Active Mode', desc: 'Handles incoming calls even when you\'re unavailable or offline' },
              { icon: AlertTriangle, title: 'Intelligent Call Screening', desc: 'Answers unsaved calls and automatically drops scam calls, while letting important calls ring through' },
              { icon: Shield, title: 'Secure & Private', desc: 'End-to-end encryption for all conversations and complete audit trails' },
              { icon: Zap, title: 'Instant Results', desc: 'Get summaries and transcripts immediately after each call completes' },
              { icon: Video, title: 'Meeting Attendance', desc: 'Soon: Attend virtual meetings and share progress updates on your behalf' },
              { icon: MapPin, title: 'Travel & Cost Inquiries', desc: 'From booking appointments to checking travel costs — Plexi handles all your logistics calls' },
              { icon: Users, title: 'Multi-Use Support', desc: 'Perfect for refunds, appointments, availability checks, and sensitive conversations' },
            ].map((feature, i) => (
              <div key={i} style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '8px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e0d8', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(41,86,71,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <feature.icon style={{ color: '#295647', width: '22px', height: '22px' }} />
                </div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: '600', color: '#29303D', marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.95rem' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '100px 20px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ color: '#295647', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>Pricing</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', marginTop: '15px', color: '#29303D' }}>Simple, Transparent Pricing</h2>
            <p style={{ color: '#666', marginTop: '12px' }}>Choose the plan that works for you</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px', alignItems: 'start' }}>
            {/* Free */}
            <div style={{ backgroundColor: '#FAF8F5', border: '2px solid #e5e0d8', borderRadius: '8px', padding: '36px' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: '#29303D', marginBottom: '8px' }}>Free</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>Perfect for trying out Plexi</p>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#29303D', fontFamily: 'Playfair Display, serif', marginBottom: '28px' }}>$0<span style={{ fontSize: '1rem', fontWeight: '400', color: '#666', fontFamily: 'Inter, sans-serif' }}>/month</span></div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['5 calls per month', 'Basic transcription', 'Email summaries', 'Standard support'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#555' }}>
                    <CheckCircle style={{ color: '#295647', width: '16px', height: '16px', flexShrink: 0 }} />{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup"><button style={{ width: '100%', backgroundColor: 'transparent', border: '2px solid #295647', color: '#295647', padding: '12px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Get Started</button></Link>
            </div>
            {/* Pro */}
            <div style={{ backgroundColor: '#295647', border: '2px solid #295647', borderRadius: '8px', padding: '36px', transform: 'scale(1.03)', boxShadow: '0 20px 40px rgba(41,86,71,0.25)' }}>
              <div style={{ display: 'inline-block', backgroundColor: '#D7AA42', color: '#29303D', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '12px', fontFamily: 'Inter, sans-serif' }}>Most Popular</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: '#FAF8F5', marginBottom: '8px' }}>Pro</h3>
              <p style={{ color: 'rgba(250,248,245,0.7)', fontSize: '0.9rem', marginBottom: '20px' }}>For regular users</p>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#FAF8F5', fontFamily: 'Playfair Display, serif', marginBottom: '28px' }}>$14.99<span style={{ fontSize: '1rem', fontWeight: '400', color: 'rgba(250,248,245,0.7)', fontFamily: 'Inter, sans-serif' }}>/month</span></div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Unlimited calls', 'Advanced transcription & summaries', 'Call scheduling & retry logic', 'Basic scam call filtering', 'Priority support'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'rgba(250,248,245,0.85)' }}>
                    <CheckCircle style={{ color: '#D7AA42', width: '16px', height: '16px', flexShrink: 0 }} />{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup"><button style={{ width: '100%', backgroundColor: '#D7AA42', border: '2px solid #D7AA42', color: '#29303D', padding: '12px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Start Free Trial</button></Link>
            </div>
            {/* Premium */}
            <div style={{ backgroundColor: '#FAF8F5', border: '2px solid #e5e0d8', borderRadius: '8px', padding: '36px' }}>
              <div style={{ display: 'inline-block', backgroundColor: '#29303D', color: '#FAF8F5', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '12px', fontFamily: 'Inter, sans-serif' }}>Premium</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: '#29303D', marginBottom: '8px' }}>Premium</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>For power users & businesses</p>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#29303D', fontFamily: 'Playfair Display, serif', marginBottom: '28px' }}>$22.99<span style={{ fontSize: '1rem', fontWeight: '400', color: '#666', fontFamily: 'Inter, sans-serif' }}>/month</span></div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Everything in Pro', 'Plexi Active Mode (incoming calls)', 'Advanced scam call protection', 'Meeting attendance (coming soon)', 'Custom voice training & personality', 'API access & integrations', 'Dedicated account manager'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#555' }}>
                    <CheckCircle style={{ color: '#295647', width: '16px', height: '16px', flexShrink: 0 }} />{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup"><button style={{ width: '100%', backgroundColor: 'transparent', border: '2px solid #295647', color: '#295647', padding: '12px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Contact Sales</button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 20px', backgroundColor: '#295647' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', fontWeight: '700', color: '#FAF8F5', marginBottom: '20px' }}>Ready to Transform Your Communication?</h2>
          <p style={{ fontSize: '1.15rem', color: 'rgba(250,248,245,0.85)', marginBottom: '40px', lineHeight: '1.7' }}>
            Join thousands of users who have already saved hundreds of hours with Plexi
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup">
              <button style={{ backgroundColor: '#D7AA42', border: '2px solid #D7AA42', color: '#29303D', padding: '14px 36px', borderRadius: '4px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Start Your Free Trial <ArrowRight style={{ width: '18px', height: '18px' }} />
              </button>
            </Link>
            <button
              onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ backgroundColor: 'transparent', border: '2px solid #FAF8F5', color: '#FAF8F5', padding: '14px 36px', borderRadius: '4px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>

      {/* ── BOOKING WIDGET ─────────────────────────────────────────────── */}
      <section id="booking" style={{ padding: '100px 20px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ color: '#295647', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>Book a Call</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', marginTop: '15px', color: '#29303D', marginBottom: '20px' }}>Schedule Your Free Strategy Call</h2>
            <p style={{ maxWidth: '600px', margin: '0 auto', color: '#666', lineHeight: '1.7' }}>
              Book a 30-minute consultation to see how our AI voice agents can transform your business workflows.
            </p>
          </div>
          <div style={{ maxWidth: '1000px', margin: '0 auto', height: '700px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
            <InlineWidget url="https://calendly.com/contact-aipersa/30min" styles={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer style={{ padding: '60px 20px', backgroundColor: '#29303D', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#295647', border: '2px solid #D7AA42', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone style={{ color: '#FAF8F5', width: '14px', height: '14px' }} />
                </div>
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', fontWeight: '700', color: '#FAF8F5' }}>Plexi</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'rgba(250,248,245,0.6)', lineHeight: '1.7' }}>AI-powered voice agents that handle your calls so you don't have to.</p>
            </div>
            {[
              { title: 'Product', links: [{ label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' }, { label: 'API', href: '#' }, { label: 'Integrations', href: '#' }] },
              { title: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Blog', href: '#' }, { label: 'Careers', href: '#' }, { label: 'Contact', href: '#' }] },
              { title: 'Support', links: [{ label: 'Help Center', href: '#' }, { label: 'Privacy Policy', href: '/privacy-policy' }, { label: 'Terms of Service', href: '/terms-of-service' }, { label: 'Status', href: '#' }] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600', color: '#FAF8F5', marginBottom: '16px' }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {col.links.map(link => (
                    <li key={link.label}><a href={link.href} style={{ fontSize: '0.9rem', color: 'rgba(250,248,245,0.6)', textDecoration: 'none' }}>{link.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '28px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'rgba(250,248,245,0.4)' }}>© 2024 Plexi AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
