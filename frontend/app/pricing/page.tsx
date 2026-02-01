// app/pricing/page.tsx
export const dynamic = 'force-static'; // safe to prerender on Vercel

import { Navigation } from "@/components/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works for you. Start free and upgrade as you grow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free */}
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
                {[
                  "5 calls per month",
                  "Basic transcription",
                  "Email summaries",
                  "Standard support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button variant="outline" className="w-full bg-transparent">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro (Most Popular) */}
          <Card className="border-2 border-primary shadow-lg md:scale-105">
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
                {[
                  "Unlimited calls",
                  "Advanced transcription & summaries",
                  "Call scheduling & retry logic",
                  "Basic scam call filtering",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button className="w-full">Start Free Trial</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Premium */}
          <Card className="border-2 border-border">
            <CardHeader>
              <Badge className="w-fit mb-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Premium
              </Badge>
              <CardTitle className="font-serif">Premium</CardTitle>
              <CardDescription>For power users & businesses</CardDescription>
              <div className="text-3xl font-bold">
                $22.99<span className="text-base font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {[
                  "Everything in Pro",
                  "Persa Active Mode (incoming calls)",
                  "Advanced scam call protection",
                  "Meeting attendance (coming soon)",
                  "Custom voice training & personality",
                  "API access & integrations",
                  "Dedicated account manager",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button variant="outline" className="w-full bg-transparent">
                  Contact Sales
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-8">
            All plans include our core AI voice assistant features with end-to-end encryption.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo">
              <Button variant="outline" size="lg">
                Schedule a Demo
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg">Start Your Free Trial</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
