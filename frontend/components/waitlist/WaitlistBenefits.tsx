import { Bell, Star, Users, Rocket } from 'lucide-react';

export function WaitlistBenefits() {
  const benefits = [
    // {
    //   icon: Star,
    //   title: 'Early Bird Pricing',
    //   description: 'Save 50% on your first year with exclusive launch pricing',
    //   bgColor: 'bg-indigo-100',
    //   iconColor: 'text-indigo-600',
    //   borderColor: 'border-indigo-100',
    // },
    {
      icon: Bell,
      title: 'Beta Access',
      description: 'Be the first to test and provide feedback on new features',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-100',
    },
    {
      icon: Users,
      title: 'VIP Support',
      description: 'Priority customer support and dedicated onboarding',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      borderColor: 'border-green-100',
    },
    {
      icon: Rocket,
      title: 'Exclusive Features',
      description: 'Access to premium features not available to regular users',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">What You'll Get</h2>
        <p className="text-gray-600">Join thousands of professionals already on our waitlist</p>
      </div>

      <div className="space-y-4">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className={`flex items-start gap-4 p-4 bg-white/60 rounded-lg border ${benefit.borderColor}`}
          >
            <div className={`w-10 h-10 ${benefit.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <benefit.icon className={`w-5 h-5 ${benefit.iconColor}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
              <p className="text-gray-600 text-sm">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-lg text-white text-center">
        <h3 className="font-bold text-lg mb-2">🎉 Limited Time Offer</h3>
        <p className="text-indigo-100">The first 1,000 members get lifetime access to premium features!</p>
      </div> */}
    </div>
  );
}
