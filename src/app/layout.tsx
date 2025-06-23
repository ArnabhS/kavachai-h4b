import type { Metadata } from "next";
import "./globals.css";
import { CivicAuthProvider } from "@civic/auth-web3/nextjs";
import { ThemeProvider } from "next-themes";


export const metadata: Metadata = {
  title: "Kavach.Ai",
  description: "Interactive Web2/Web3 security scanner with direct code editing. Scan for vulnerabilities and apply fixes with one click. Supports JavaScript, TypeScript, Solidity, Python, Java, PHP, Ruby, Go, Rust, C/C++, and C#.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   
    <html lang="en">
      <body      
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <CivicAuthProvider>
        {children}
        </CivicAuthProvider>
        </ThemeProvider>
      </body>
     
    </html>
    
  );
}
