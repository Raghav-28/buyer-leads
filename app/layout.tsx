import "./globals.css";
import { Inter } from "next/font/google";
import ClientSessionProvider from "@/components/SessionProvider";
import Header from "@/components/Header";
import ErrorBoundary from "@/components/ErrorBoundary";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Buyer Leads Dashboard",
  description: "Dashboard for managing buyer leads",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
        <ClientSessionProvider>
          <Header />
          <main style={{ padding: "16px" }}>{children}</main>
        </ClientSessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
