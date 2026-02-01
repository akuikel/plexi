'use client';

import { CallReports } from '@/components/dashboard/CallReports';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { useCalls } from '@/hooks/dashboard/useCalls';
import { useTranscript } from '@/hooks/dashboard/useTranscript';
import { useAuthStatus } from '@/hooks/auth/useAuthStatus';
import { Button } from '@/components/ui/button';
import { MessageCircle, BarChart3, Calendar, Phone } from 'lucide-react';
import Link from 'next/link';

import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const { authenticated, loading, user } = useAuthStatus();
  const { calls, refreshCalls } = useCalls();
  const { selectedTranscript, isTranscriptOpen, handleViewTranscript, handleCloseTranscript, handleDownloadReport } =
    useTranscript();

  const handleQuickAction = (message: string) => {
    // Navigate to chat with the message as a query parameter
    router.push(`/chat?message=${encodeURIComponent(message)}`);
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Welcome back, {user?.name || 'User'}!</h1>
          <p className="text-muted-foreground">Here's an overview of your AI assistant activity.</p>
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
          <Link href="/chat">
            <Button className="w-full h-16 lg:h-20 flex flex-col items-center justify-center gap-1 lg:gap-2 hover:scale-105 transition-transform text-sm lg:text-base">
              <MessageCircle className="h-5 w-5 lg:h-6 lg:w-6" />
              <span>Start Chat</span>
            </Button>
          </Link>
          <Button
            className="w-full h-16 lg:h-20 flex flex-col items-center justify-center gap-1 lg:gap-2 hover:scale-105 transition-transform text-sm lg:text-base"
            variant="outline"
            onClick={() => router.push('/chat?message=' + encodeURIComponent('I need to make a phone call'))}
          >
            <Phone className="h-5 w-5 lg:h-6 lg:w-6" />
            <span>Make Call</span>
          </Button>
          <Button
            className="w-full h-16 lg:h-20 flex flex-col items-center justify-center gap-1 lg:gap-2 hover:scale-105 transition-transform text-sm lg:text-base"
            variant="outline"
            onClick={() => router.push('/chat?message=' + encodeURIComponent('I need to schedule an appointment'))}
          >
            <Calendar className="h-5 w-5 lg:h-6 lg:w-6" />
            <span>Schedule</span>
          </Button>
          <Button
            className="w-full h-16 lg:h-20 flex flex-col items-center justify-center gap-1 lg:gap-2 hover:scale-105 transition-transform text-sm lg:text-base"
            variant="outline"
          >
            <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6" />
            <span>Analytics</span>
          </Button>
        </div>

        {/* Stats Overview */}
        <StatsOverview />

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6 ">
          <div className="xl:col-span-3">
            <CallReports
              calls={calls}
              selectedTranscript={selectedTranscript}
              isTranscriptOpen={isTranscriptOpen}
              onViewTranscript={handleViewTranscript}
              onDownloadReport={handleDownloadReport}
              onCloseTranscript={handleCloseTranscript}
            />
          </div>

          <div className="xl:col-span-1">
            <div className="sticky top-24">
              <QuickActions onSetMessage={handleQuickAction} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
