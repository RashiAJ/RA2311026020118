import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Notifications",
  description: "Placements, results, and events — priority inbox",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
