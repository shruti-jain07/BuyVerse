"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Page = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:flex lg:items-center lg:gap-12">
        <div className="lg:w-1/2">
          <h1 className="text-4xl font-light mb-2">
            Welcome to{" "}
            <span className="text-shadow-black italic font-bold">
              ShopVerse
            </span>
          </h1>
          <p className="text-lg text-gray-700 mb-4">
            Sell what you create — simply. ShopVerse is built for independent
            creators and solopreneurs who want to share their work with the
            world. Start selling digital products in minutes, no tech expertise
            required.
          </p>
          <Button
            variant="elevated"
            className="bg-black text-white hover:bg-white hover:text-black"
          >
            <Link href={"/sign-in"}>Get Started</Link>
          </Button>
        </div>
        <div className="hidden lg:block lg:w-1/2 relative">
          <video
            src="/videos/video1.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700">
            To provide creators with a seamless way to sell their digital
            products and monetize their skills globally — without complexity or
            upfront costs.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
          <p className="text-gray-700">
            To become the leading digital marketplace for creators, empowering
            innovation and making digital goods accessible to everyone.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4 text-green-600 text-4xl">📝</div>
            <h3 className="font-semibold mb-2">Sign Up & Create Store</h3>
            <p className="text-gray-700">
              Launch your store instantly — no coding required.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4 text-green-600 text-4xl">📤</div>
            <h3 className="font-semibold mb-2">Upload Products</h3>
            <p className="text-gray-700">
              Sell ebooks, templates, courses, software — any digital product.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4 text-green-600 text-4xl">💳</div>
            <h3 className="font-semibold mb-2">Get Paid</h3>
            <p className="text-gray-700">
              Secure payouts through Stripe.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4 text-green-600 text-4xl">📚</div>
            <h3 className="font-semibold mb-2">Deliver Instantly</h3>
            <p className="text-gray-700">
              Customers access their digital goods instantly after purchase.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#EEF1DA] py-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-black">
          <h2 className="text-3xl font-bold mb-4 text-black">
            Start Your Digital Store Today
          </h2>
          <p className="mb-6">
            You don’t need to be a tech expert to start a business. Just take
            what you know, turn it into a digital product, and sell it on
            ShopVerse.
          </p>
          <Button
            variant="elevated"
            className="bg-white text-black hover:bg-[#896C6C] hover:text-white"
          >
            <Link href={"/sign-up"}>Sign Up Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Page;
