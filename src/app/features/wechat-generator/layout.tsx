import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: "WeChat Official Account Content Generator",
  description: "AI-powered content generation for WeChat Official Accounts.",
};

export default function WeChatGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
