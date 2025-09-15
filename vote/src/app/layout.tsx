import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "新世相LESS",
  description: "新世相LESS图书投票",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body style={{ background: "#fff", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
