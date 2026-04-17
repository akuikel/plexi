import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle } from 'lucide-react';

interface WaitlistFormProps {
  onSubmit: (data: { email: string }) => void;
  isLoading: boolean;
  error: string | null;
  success?: boolean;
}

export function WaitlistForm({ onSubmit, isLoading, error, success }: WaitlistFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const email = formData.get('email') as string;

    if (!email?.trim()) {
      return;
    }

    onSubmit({ email });
  };

  if (success) {
    return (
      <div className="flex flex-col items-center space-y-4 px-4">
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg max-w-md w-full">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
          <span className="text-green-800 font-medium text-sm sm:text-base">You've joined the waitlist!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 px-4 w-full max-w-lg mx-auto">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md w-full">{error}</div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full"
      >
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          required
          className="w-full sm:w-80 h-12 px-4 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none bg-white"
        />
        <Button
          type="submit"
          className="w-full sm:w-auto h-12 px-6 sm:px-8 bg-white text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              Joining...
            </div>
          ) : (
            'Join'
          )}
        </Button>
      </form>
    </div>
  );
}
