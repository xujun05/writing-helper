"use client";

import React from 'react';
import { ApiSettingsProvider } from './ApiSettingsContext'; // Adjust path if necessary

export function GlobalContextProviders({ children }: { children: React.ReactNode }) {
  return <ApiSettingsProvider>{children}</ApiSettingsProvider>;
}
