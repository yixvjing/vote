import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "新世相",
  description: "新世相-成为连绵不断的力量",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ch">
      <head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        <script src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js"></script>
      </head>
      <body style={{ background: "#fff", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
