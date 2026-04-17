import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Bell, Star, Users } from 'lucide-react';

interface WaitlistSuccessProps {
  userName: string;
}

export function WaitlistSuccess({ userName }: WaitlistSuccessProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to the Waitlist! 🎉</h1>
          <p className="text-xl text-gray-600 mb-8">
            Thank you for joining us, <span className="font-semibold text-indigo-600">{userName}</span>! We've secured
            your spot and will notify you as soon as we launch.
          </p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-indigo-200 shadow-lg">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Early Access</h3>
                  <p className="text-sm text-gray-600">Be the first to try our platform</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Exclusive Benefits</h3>
                  <p className="text-sm text-gray-600">Special launch pricing & features</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">VIP Community</h3>
                  <p className="text-sm text-gray-600">Join our exclusive beta community</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
