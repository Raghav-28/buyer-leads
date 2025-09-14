import "./globals.css";
import { Inter } from "next/font/google";

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
        <header style={{ padding: "16px", background: "#f4f4f4" }}>
          <h1>Buyer Leads Dashboard</h1>
        </header>
        <main style={{ padding: "16px" }}>{children}</main>
      </body>
    </html>
  );
}
