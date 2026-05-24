import "./globals.css";

import {
  WalletProvider
} from "../context/WalletContext";

export default function RootLayout({
  children
}) {

  return (
    <html lang="en">
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}