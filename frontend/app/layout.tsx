import type { Metadata } from "next";
import { Toaster } from "sonner";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Hirenix — Career Analytics Platform",
  description:
    "AI-powered resume analysis, GitHub intelligence, job matching, and mock interviews — your complete career analytics platform.",
  openGraph: {
    title: "Hirenix — Career Analytics Platform",
    description: "AI-powered career analytics platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
