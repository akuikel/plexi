'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Users, Star, Clock, Phone, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function DemoPage() {
  const [isPlaying, setIsPlaying] = useState(false);

  const features = [
    {
      icon: <Phone className="w-8 h-8 text-purple-600" />,
      title: "Smart Call Management",
      description: "AI handlesyour calls with natural conversation"
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Spam Protection",
      description: "Automatically filters out unwanted calls"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: "Real-time Processing",
      description: "Instant responses with advanced AI understanding"
    }
  ];



  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <Link href="/wait-list/join">
          <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-sm">
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back to Waitlist
          </Button>
        </Link>
        
        <Link href="/wait-list/join">
          <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-sm">
            Join Waitlist
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-3 py-1">
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium mb-1">
            <Star className="w-2.5 h-2.5" />
            Demo Preview
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 leading-tight">
            Experience Persa
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              in Action
            </span>
          </h1>
        </div>

        {/* Video Container with Custom Thumbnail */}
        <div className="relative">
          <div className="bg-white rounded-xl shadow-lg p-1.5">
            <div className="aspect-video bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-lg overflow-hidden relative group cursor-pointer"
                 onClick={() => setIsPlaying(true)}>
              
              {!isPlaying ? (
                // Custom Thumbnail
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-1/4 left-1/4 w-24 h-24 border border-white/20 rounded-full"></div>
                    <div className="absolute top-1/3 right-1/4 w-16 h-16 border border-white/20 rounded-full"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-28 h-28 border border-white/20 rounded-full"></div>
                  </div>
                  
                  {/* Logo and Content */}
                  <div className="relative z-10 text-center">
                    <div className="mb-2">
                      <div className="w-10 h-10 mx-auto mb-1 bg-white rounded-lg flex items-center justify-center shadow-lg">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-md flex items-center justify-center">
                          <Phone className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-0.5">
                        Persa
                      </h3>
                      <p className="text-purple-200 text-xs mb-2">
                        AI Voice Assistant Demo
                      </p>
                    </div>
                    
                    {/* Play Button */}
                    <div className="relative">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-4 h-4 text-purple-600 ml-0.5" />
                      </div>
                      <div className="absolute inset-0 rounded-full border-3 border-white/30 animate-pulse"></div>
                    </div>
                    
                    <p className="text-white/80 mt-1.5 text-xs">
                      Click to watch • 2:16 duration
                    </p>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm rounded-md px-1.5 py-0.5">
                    <div className="flex items-center gap-0.5">
                      <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-white text-xs">Live Demo</span>
                    </div>
                  </div>
                  
                  <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-md px-1.5 py-0.5">
                    <div className="flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 text-white" />
                      <span className="text-white text-xs">2:16</span>
                    </div>
                  </div>
                </div>
              ) : (
                // YouTube Video Player
                <iframe 
                  className="w-full h-full rounded-lg"
                  src="https://www.youtube.com/embed/T8tDgx_LroY?autoplay=1&rel=0&modestbranding=1"
                  title="Persa AI Voice Assistant Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
  );
}