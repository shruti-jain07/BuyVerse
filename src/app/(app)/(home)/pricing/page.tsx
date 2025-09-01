"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl text-center space-y-8">
        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          Simple & Transparent Pricing
        </h1>
        <p className="text-lg text-gray-600">
          No monthly fees, no hidden charges. You only pay when you sell.
        </p>

        {/* Pricing Card */}
        <Card className="p-8 shadow-xl border-2 border-gray-100 max-w-md mx-auto rounded-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900">
              10% per sale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Keep 90% of what you earn from every product sold.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>✅ No monthly subscription</li>
              <li>✅ No upfront cost</li>
              <li>✅ Pay only when you earn</li>
            </ul>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="text-sm text-gray-500 mt-6">
          Whether you’re selling your first digital product or scaling up, our pricing stays the same.
        </p>
      </div>
    </section>
  );
}
