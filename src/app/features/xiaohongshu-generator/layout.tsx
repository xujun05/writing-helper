import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: "Xiaohongshu Post Generator",
  description: "AI-powered content generation for Xiaohongshu.",
};

export default function XiaohongshuGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
