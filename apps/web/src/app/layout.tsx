"use client";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SessionProvider } from "next-auth/react";

// @ts-expect-error 🚧 ETHERS IS BROKEN. THIS IS A WORKAROUND
BigInt.prototype.toJSON = function () {
  return this.toString()
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" title="Llavero">
     <link rel="icon" href="/favicon.ico" />

      <body>
        <SessionProvider>
        <ThemeProvider theme={baselightTheme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          {children}
        </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
