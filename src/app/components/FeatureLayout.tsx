import React from 'react';
import Navigation from './Navigation';

type FeatureLayoutProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
};

export default function FeatureLayout({
  children,
  title,
  subtitle,
}: FeatureLayoutProps) {
  return (
    <div className="bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {(title || subtitle) && (
          <div className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {title && (
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-2 text-lg text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        )}
        
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
} 