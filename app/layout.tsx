import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Import the AuthProvider to make session data available to all components
import { AuthProvider } from "@/lib/AuthContext";
// Import the new Header component
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mining Document Management System",
  description: "A centralized hub for all mining compliance and operational documents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {/* The Header will now appear on every page */}
          <Header />
          
          {/* The 'main' tag will contain the specific content of each page */}
          <main className="bg-gray-50 min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}