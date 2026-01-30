import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AnalysisProvider } from "@/context/analysis-context";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "Gitara AI | Enterprise Repository Intelligence",
  description: "The professional standard for AI-powered GitHub repository analysis and DevOps automation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth dark">
      <body
        className={cn(
          inter.variable,
          outfit.variable,
          "antialiased font-sans"
        )}
        suppressHydrationWarning
      >
        <AnalysisProvider>
          {children}
        </AnalysisProvider>
      </body>
    </html>
  );
}
