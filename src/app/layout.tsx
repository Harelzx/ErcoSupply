import type { Metadata } from "next";
import { Noto_Sans_Hebrew } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const notoHebrew = Noto_Sans_Hebrew({
  variable: "--font-noto-hebrew",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "מחשבון יעדים רבעוני",
  description: "חישוב וניהול יעדי הכנסה יומיים לפי רבעון עם תמיכה בלוח שנה ישראלי",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${notoHebrew.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
