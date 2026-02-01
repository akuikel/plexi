'use client';

import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useWaitlist } from '@/hooks/use-waitlist';
import { WaitlistForm } from '@/components/waitlist';

export default function WaitlistPage() {
  const { isLoading, error, successData, submitToWaitlist } = useWaitlist();

  const handleWaitlistSubmit = (data: { email: string }) => {
    submitToWaitlist(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 flex items-start justify-center p-4 ">
      <div className="text-center w-full max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="mb-4 sm:mb-0">
            <Image
              src="/persalogo.png"
              alt="Persa Logo"
              width={150}
              height={150}
              className="rounded-lg mx-auto sm:w-[180px] sm:h-[180px] lg:w-[220px] lg:h-[220px]"
            />
          </div>
          <Badge className="mb-4 bg-indigo-100 text-indigo-700 border-indigo-200">
            <Sparkles className="w-4 h-4 mr-2" />
            Coming Soon
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 px-4">
            Join the Future of AI Voice Assistants
          </h1>
        </div>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
          Be among the first to experience our revolutionary AI voice assistant platform. Help shape the future of
          conversational AI.
        </p>

        <div className="space-y-6">
          <WaitlistForm
            onSubmit={handleWaitlistSubmit}
            isLoading={isLoading}
            error={error}
            success={successData?.success || false}
          />

          <div className="text-center px-4">
            <button
              onClick={() => window.open('/demo', '_blank')}
              className="inline-flex items-center px-4 sm:px-6 py-3 border border-indigo-300 text-indigo-700 bg-white hover:bg-indigo-50 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Try Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
