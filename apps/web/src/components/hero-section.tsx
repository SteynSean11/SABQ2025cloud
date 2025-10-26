"use client";
import React from 'react';
import { Button } from "@heroui/react";
import Link from 'next/link';
import { RetroGrid } from './magicui/retro-grid';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative text-center py-20 bg-brand-background">
      <RetroGrid />
      <h1 className="text-5xl font-bold text-brand-primary">
        Live Like Royalty on Any Budget
      </h1>
      <p className="text-xl text-brand-text mt-4 max-w-2xl mx-auto">
        Your journey to financial freedom starts here. Get access to practical budgeting templates, tips, and tools designed for South Africans.
      </p>
      <div className="mt-8">
        <Link
          href="/templates"
        >
          <Button color="primary">Get Your Free Templates</Button>
        </Link>
      </div>
    </section>
  );
};