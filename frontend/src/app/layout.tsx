import "@/styles/globals.css";
import "katex/dist/katex.min.css";

import { type Metadata } from "next";

import { AppProviders } from "@/components/app-providers";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/core/i18n/context";
import { detectLocaleServer } from "@/core/i18n/server";

export const metadata: Metadata = {
  title: "DeerFlow",
  description: "A LangChain-based framework for building super agents.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await detectLocaleServer();
  return (
    <html lang={locale} suppressContentEditableWarning suppressHydrationWarning>
      <body>
        <AppProviders>
          <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
            <I18nProvider initialLocale={locale}>{children}</I18nProvider>
          </ThemeProvider>
        </AppProviders>
      </body>
    </html>
  );
}
