import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: "Twitter Post Generator",
  description: "AI-powered content generation for Twitter.",
};

export default function TwitterGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
