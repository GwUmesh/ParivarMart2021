import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { GoogleAuthProvider } from "@/context/GoogleAuthProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Parivar Mart | Your Family's Trusted Store",
  description: "Parivar Mart is your one-stop shop for high-quality groceries, household items, and more in Rasayani. Experience premium service and fast delivery.",
  keywords: "supermarket, grocery, Parivar Mart, Rasayani, delivery, home delivery, fresh produce, snacks, household essentials",
  authors: [{ name: "Parivar Mart Team" }],
  openGraph: {
    title: "Parivar Mart | Premium Online Grocery Shopping",
    description: "Shop for the freshest groceries and household essentials at Parivar Mart.",
    url: "https://parivarmart.com",
    siteName: "Parivar Mart",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} min-height-screen flex flex-col`}>
        <AuthProvider>
          <GoogleAuthProvider>
            <CartProvider>
              <Toaster position="bottom-right" toastOptions={{
                style: {
                  background: '#023535',
                  color: '#fff',
                  border: '1px solid #0FC2C0',
                },
              }} />
              <Navbar />
              <main className="flex-grow pt-24">
                {children}
              </main>
              <Footer />
            </CartProvider>
          </GoogleAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
