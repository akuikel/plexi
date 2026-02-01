'use client';

import {
  Phone,
  Mic,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Shield,
  Zap,
  Users,
  MessageSquare,
  Play,
  PhoneCall,
  AlertTriangle,
  Video,
  MapPin,
  StarHalf,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const reviews = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Manager',
    location: 'New York, USA',
    avatar: '/american-woman-professional.png',
    rating: 5,
    text: 'Persa saved me 3 hours of hold time with customer service. It got my refund processed while I was in meetings!',
  },
  {
    name: 'Rajesh Sharma',
    role: 'Software Engineer',
    location: 'Mumbai, India',
    avatar: '/indian-professional-man.png',
    rating: 5,
    text: 'Amazing for handling awkward conversations. Persa negotiated my internet bill down by $30/month without any hassle.',
  },
  {
    name: 'Emma Thompson',
    role: 'Consultant',
    location: 'Sydney, Australia',
    avatar: '/australian-woman-professional.png',
    rating: 4.5,
    text: 'As someone with social anxiety, Persa is a game-changer. It handles all my appointment scheduling seamlessly.',
  },
  {
    name: 'Michael Chen',
    role: 'Business Owner',
    location: 'Toronto, Canada',
    avatar: '/asian-man-creative.png',
    rating: 5,
    text: 'Perfect for awkward conversations. Persa handled canceling my gym membership without any pushback.',
  },
  {
    name: 'Sita Thapa',
    role: 'Teacher',
    location: 'Kathmandu, Nepal',
    avatar: '/indian-woman-designer.png',
    rating: 5,
    text: 'Persa helped me reschedule multiple parent-teacher conferences when I was sick. Saved my entire week!',
  },
  {
    name: 'James Wilson',
    role: 'Sales Director',
    location: 'London, UK',
    avatar: '/professional-man-sales.png',
    rating: 4,
    text: 'The Active Mode is incredible! Persa answered calls while I was in a client presentation and filtered out spam perfectly.',
  },
  {
    name: 'Isabella Rodriguez',
    role: 'Restaurant Owner',
    location: 'Madrid, Spain',
    avatar: '/asian-woman-professional.png',
    rating: 5,
    text: "Persa handles all my supplier calls and inventory checks. It's like having a personal assistant for my business.",
  },
  {
    name: 'David Kim',
    role: 'UX Designer',
    location: 'Seoul, South Korea',
    avatar: '/korean-entrepreneur.png',
    rating: 4.5,
    text: 'I use Persa to check product availability at stores before driving there. Saves me so much time and gas money!',
  },
  {
    name: 'Deepasha Kumar',
    role: 'Data Analyst',
    location: 'New Delhi, India',
    avatar: '/indian-woman-professional.png',
    rating: 5,
    text: "Persa got me a full refund on a defective laptop when I couldn't get through to customer service for days.",
  },
  {
    name: 'Lucas Silva',
    role: 'Marketing Director',
    location: 'São Paulo, Brazil',
    avatar: '/nepali-businessman.png',
    rating: 4.5,
    text: "The meeting attendance feature is coming soon and I can't wait! Persa already handles my scheduling perfectly.",
  },
  {
    name: 'Sophie Anderson',
    role: 'Startup Founder',
    location: 'Melbourne, Australia',
    avatar: '/nepali-woman-executive.png',
    rating: 5,
    text: "Persa handles all the tedious vendor calls for my startup. It's freed up hours of my time every week.",
  },
  {
    name: 'Alexander Petrov',
    role: 'Doctor',
    location: 'Moscow, Russia',
    avatar: '/indian-tech-professional.png',
    rating: 4,
    text: 'Perfect for rescheduling appointments when emergencies come up. My patients love that they get immediate responses.',
  },
  {
    name: 'Charlotte Brown',
    role: 'Project Manager',
    location: 'Manchester, UK',
    avatar: '/hispanic-professional-man.png',
    rating: 5,
    text: "Persa's scam call filtering is amazing! It only lets important calls through and drops the spam automatically.",
  },
  {
    name: 'Antoine Dubois',
    role: 'Product Designer',
    location: 'Paris, France',
    avatar: '/nepali-engineer.png',
    rating: 4.5,
    text: "I love how Persa can check travel costs and book appointments. It's like having a travel agent and secretary in one.",
  },
  {
    name: 'Mia Johansson',
    role: 'Software Engineer',
    location: 'Stockholm, Sweden',
    avatar: '/nepali-woman-executive.png',
    rating: 5,
    text: 'The transcripts are incredibly detailed. I can review exactly what was discussed without having to take notes during calls.',
  },
];

const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
  }

  if (hasHalfStar) {
    stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
  }

  const remainingStars = 5 - Math.ceil(rating);
  for (let i = 0; i < remainingStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
  }

  return stars;
};

export default function LandingPage() {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [currentDemoStep, setCurrentDemoStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 3) % reviews.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const demoInterval = setInterval(() => {
      setCurrentDemoStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(demoInterval);
  }, []);

  const currentReviews = [
    reviews[currentReviewIndex],
    reviews[(currentReviewIndex + 1) % reviews.length],
    reviews[(currentReviewIndex + 2) % reviews.length],
  ];

  const nextReviews = () => {
    setCurrentReviewIndex((prev) => (prev + 3) % reviews.length);
  };

  const prevReviews = () => {
    setCurrentReviewIndex((prev) => (prev - 3 + reviews.length) % reviews.length);
  };

  const demoSteps = [
    {
      prompt: 'Call Amazon and check my refund status for order #12345',
      result: '✅ Refund approved: $89.99 will be credited to your card within 3-5 business days',
      icon: '💳',
    },
    {
      prompt: 'Reschedule my dentist appointment from Tuesday to Friday at 2 PM',
      result: '✅ Appointment rescheduled: Friday, March 15th at 2:00 PM confirmed',
      icon: '🦷',
    },
    {
      prompt: 'Call Walmart and check if they have iPhone 15 Pro Max in stock',
      result: '✅ In stock: iPhone 15 Pro Max available in all colors, $1,199 - reserved for pickup',
      icon: '📱',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Phone className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground">Persa</h1>
                <p className="text-sm text-muted-foreground">AI Voice Assistant</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Features
              </a>
              <a href="/demo" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Demo
              </a>
              <Link
                href="/pricing"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Pricing
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm" className="border-primary text-primary">
                  Log In
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
            Your AI Assistant for
            <span className="text-primary"> Effortless Communication</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Persa makes and receives calls on your behalf, handling everything from customer service to appointment
            scheduling. Save time, avoid frustration, and let AI handle the conversations you'd rather skip.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-6">
                <Phone className="mr-2 h-5 w-5" />
                Start Your First Call
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Hero Image Placeholder */}
          <div className="relative mx-auto max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Image 1 */}
              <div className="rounded-xl border shadow-2xl p-4 flex items-center justify-center bg-white">
                <Image
                  src="/image1.png"
                  alt="Before Persa – on hold"
                  width={300}
                  height={200}
                  priority
                  className="object-contain"
                />
              </div>

              {/* Image 2 */}
              <div className="rounded-xl border shadow-2xl p-4 flex items-center justify-center bg-white">
                <Image
                  src="/image2.png"
                  alt="Persa calling while you play"
                  width={300}
                  height={200}
                  priority
                  className="object-contain"
                />
              </div>

              {/* Image 3 */}
              <div className="rounded-xl border shadow-2xl p-4 flex items-center justify-center bg-white">
                <Image
                  src="/image3.png"
                  alt="Prompt completed – results"
                  width={300}
                  height={200}
                  priority
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Communication Workflow Visualization */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Experience Seamless Communication</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Skip the endless calls Persa answers and dials for you, whether it’s customer service or scheduling. Relax
              while Persa handles the conversations you don’t want to.{' '}
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Content starts from here */}
            <div className="relative mb-12">
              <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto"></div>
            </div>

            {/* Animated Demo Flow */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border shadow-2xl p-8 mb-8">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                <div className="text-center">
                  <div
                    className={`bg-card rounded-lg p-6 shadow-lg mb-4 transition-all duration-500 ${
                      currentDemoStep === 0 ? 'ring-2 ring-primary scale-105' : ''
                    }`}
                  >
                    <div className="text-2xl mb-3">{demoSteps[currentDemoStep].icon}</div>
                    <MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Your Prompt</h4>
                    <p className="text-sm text-muted-foreground italic">"{demoSteps[currentDemoStep].prompt}"</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <ArrowRight className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                  <div
                    className={`bg-primary/20 rounded-full p-6 mx-auto w-fit mb-4 transition-all duration-500 ${
                      currentDemoStep === 1 ? 'animate-pulse scale-110' : ''
                    }`}
                  >
                    <Phone className="h-12 w-12 text-primary animate-bounce" />
                  </div>
                  <h4 className="font-semibold">Persa AI Calling</h4>
                  <p className="text-sm text-muted-foreground">Navigating menus & speaking with agents</p>
                </div>

                <div className="text-center">
                  <div
                    className={`bg-card rounded-lg p-6 shadow-lg mb-4 transition-all duration-500 ${
                      currentDemoStep === 2 ? 'ring-2 ring-green-500 scale-105' : ''
                    }`}
                  >
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Results Delivered</h4>
                    <p className="text-sm text-muted-foreground">{demoSteps[currentDemoStep].result}</p>
                  </div>
                </div>
              </div>

              {/* Progress Indicators */}
              <div className="flex justify-center mt-6 gap-2">
                {demoSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-8 rounded-full transition-colors duration-300 ${
                      index === currentDemoStep ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-card rounded-lg border">
                <PhoneCall className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Natural Conversations</h4>
                <p className="text-sm text-muted-foreground">Speaks like a human with context awareness</p>
              </div>
              <div className="text-center p-6 bg-card rounded-lg border">
                <MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Smart Navigation</h4>
                <p className="text-sm text-muted-foreground">Automatically handles complex IVR systems</p>
              </div>
              <div className="text-center p-6 bg-card rounded-lg border">
                <CheckCircle className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Complete Results</h4>
                <p className="text-sm text-muted-foreground">Detailed transcripts and summaries</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Reviews Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Trusted by People Everywhere</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hear what our users say about their Persa experience
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {currentReviews.map((review, index) => (
                <Card
                  key={`${review.name}-${currentReviewIndex}-${index}`}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                        <img
                          src={review.avatar || '/placeholder.svg'}
                          alt={review.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{review.name}</h4>
                        <p className="text-sm text-muted-foreground">{review.role}</p>
                        <p className="text-xs text-muted-foreground">{review.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-3">{renderStars(review.rating)}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">"{review.text}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={prevReviews}
                className="hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
              >
                ← Previous
              </Button>
              <div className="flex gap-2">
                {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentReviewIndex(index * 3)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      Math.floor(currentReviewIndex / 3) === index ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={nextReviews}
                className="hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
              >
                Next →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Your Complete Communication Solution</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Persa handles every aspect of phone communication so you can focus on what matters most
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Smart Call Handling</CardTitle>
                <CardDescription>
                  Automatically navigates IVR menus and speaks naturally with human agents
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Natural Conversations</CardTitle>
                <CardDescription>
                  GPT-powered intelligence manages context, follow-ups, and polite dialogue
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Active Mode</CardTitle>
                <CardDescription>Handles incoming calls even when you're unavailable or offline</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Intelligent Call Screening</CardTitle>
                <CardDescription>
                  Persa answers unsaved or unknown calls and automatically drops scam calls, while letting important
                  calls ring through to you
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Secure & Private</CardTitle>
                <CardDescription>End-to-end encryption for all conversations and complete audit trails</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Instant Results</CardTitle>
                <CardDescription>Get summaries and transcripts immediately after each call completes</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Meeting Attendance</CardTitle>
                <CardDescription>
                  Soon: Attend virtual meetings and share progress updates on your behalf with pre-fed information
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Travel & Cost Inquiries</CardTitle>
                <CardDescription>
                  From booking appointments to checking travel costs anywhere - Persa handles all your logistics calls
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Multi-Use Support</CardTitle>
                <CardDescription>
                  Perfect for refunds, appointments, availability checks, and sensitive conversations
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">How Persa Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to delegate any phone task
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-serif font-semibold mb-4">Describe Your Task</h3>
              <p className="text-muted-foreground">
                Simply tell Persa what you need done: "Call Walmart and check if they have Coca-Cola Zero in stock"
              </p>
            </div>

            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-serif font-semibold mb-4">Persa Makes the Call</h3>
              <p className="text-muted-foreground">
                Our AI handles the entire conversation, navigating menus and speaking with representatives
              </p>
            </div>

            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-serif font-semibold mb-4">Get Your Results</h3>
              <p className="text-muted-foreground">
                Receive a complete summary and transcript with all the information you requested
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">Choose the plan that works for you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle className="font-serif">Free</CardTitle>
                <CardDescription>Perfect for trying out Persa</CardDescription>
                <div className="text-3xl font-bold">
                  $0<span className="text-base font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">5 calls per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Basic transcription</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Email summaries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Standard support</span>
                  </li>
                </ul>
                <Link href="/signup">
                  <Button variant="outline" className="w-full bg-transparent">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary shadow-lg scale-105">
              <CardHeader>
                <Badge className="w-fit mb-2">Most Popular</Badge>
                <CardTitle className="font-serif">Pro</CardTitle>
                <CardDescription>For regular users</CardDescription>
                <div className="text-3xl font-bold">
                  $14.99<span className="text-base font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Unlimited calls</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Advanced transcription & summaries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Call scheduling & retry logic</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Basic scam call filtering</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Priority support</span>
                  </li>
                </ul>
                <Link href="/signup">
                  <Button className="w-full">Start Free Trial</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-border">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">Premium</Badge>
                <CardTitle className="font-serif">Premium</CardTitle>
                <CardDescription>For power users & businesses</CardDescription>
                <div className="text-3xl font-bold">
                  $22.99<span className="text-base font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Persa Active Mode (incoming calls)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Advanced scam call protection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Meeting attendance (coming soon)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Custom voice training & personality</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">API access & integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Dedicated account manager</span>
                  </li>
                </ul>
                <Link href="/signup">
                  <Button variant="outline" className="w-full bg-transparent">
                    Contact Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-serif font-bold mb-4">Ready to Transform Your Communication?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who have already saved hundreds of hours with Persa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                Schedule a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/30 border-t">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Phone className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-serif font-bold">Persa</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered voice assistant that handles your calls so you don't have to.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Persa AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
