import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from 'next/script';
import Footer from "./components/Footer";
import { GlobalContextProviders } from './contexts/GlobalContextProviders'; // Import the wrapper

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "公文写作助手 - AI驱动的专业公文拟稿服务",
  description: "借助AI“公文笔杆子”，根据您的指令快速、规范地撰写各类政府机关及企事业单位常用公文。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className="antialiased flex flex-col min-h-screen">
        <GlobalContextProviders> {/* Wrap the content with the provider */}
          <Script id="cherry-studio-detection" strategy="afterInteractive">
            {`
            // 检测是否在Cherry Studio中运行
            function isInCherryStudio() {
              try {
                return window.parent !== window && 
                       window.location.ancestorOrigins && 
                       window.location.ancestorOrigins[0].includes('cherry-studio');
              } catch (e) {
                return false;
              }
            }
            
            // 根据环境调整UI
            if (isInCherryStudio()) {
              document.body.classList.add('in-cherry-studio');
              console.log('Running in Cherry Studio environment');
            } else {
              console.log('Running in standard environment');
            }
          `}
          </Script>
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </GlobalContextProviders>
      </body>
    </html>
  );
}
