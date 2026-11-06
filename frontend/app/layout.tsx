import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/Footer";

const poppins = localFont({
    src: [
        {
            path: "../public/assets/fonts/Poppins/poppins-v23-latin-100.woff2",
            weight: "100",
            style: "normal",
        },
        {
            path: "../public/assets/fonts/Poppins/poppins-v23-latin-200.woff2",
            weight: "200",
            style: "normal",
        },
        {
            path: "../public/assets/fonts/Poppins/poppins-v23-latin-300.woff2",
            weight: "300",
            style: "normal",
        },
        {
            path: "../public/assets/fonts/Poppins/poppins-v23-latin-regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "../public/assets/fonts/Poppins/poppins-v23-latin-500.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "../public/assets/fonts/Poppins/poppins-v23-latin-600.woff2",
            weight: "600",
            style: "normal",
        },
        {
            path: "../public/assets/fonts/Poppins/poppins-v23-latin-700.woff2",
            weight: "700",
            style: "normal",
        },
        {
            path: "../public/assets/fonts/Poppins/poppins-v23-latin-800.woff2",
            weight: "800",
            style: "normal",
        },
        {
            path: "../public/assets/fonts/Poppins/poppins-v23-latin-900.woff2",
            weight: "900",
            style: "normal",
        },
    ],
    variable: "--font-poppins",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Furniro",
    description: "An online home goods store.",
};

export default function RootLayout({
    children,
}: Readonly<{children: React.ReactNode;}>) {
    return (
        <html lang="en" className={`${poppins.variable} h-full antialiased`}>
            <body className="flex min-h-full flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
            </body>
        </html>
    );
}