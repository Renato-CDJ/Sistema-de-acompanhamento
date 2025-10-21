import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import { Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/auth-context"
import { DataProvider } from "@/contexts/data-context"
import { AgendasProvider } from "@/contexts/agendas-context"
import { ChatProvider } from "@/contexts/chat-context"
import { DocumentsProvider } from "@/contexts/documents-context"
import { NotificationsProvider } from "@/contexts/notifications-context"
import { UsersProvider } from "@/contexts/users-context"
import { ActivityLogProvider } from "@/contexts/activity-log-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Sistema de Acompanhamento",
  description: "Sistema moderno de acompanhamento empresarial",
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress benign ResizeObserver error from Recharts
              window.addEventListener('error', function(e) {
                if (e.message === 'ResizeObserver loop completed with undelivered notifications.' || 
                    e.message === 'ResizeObserver loop limit exceeded') {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                }
              });
            `,
          }}
        />
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
              <UsersProvider>
                <ActivityLogProvider>
                  <DataProvider>
                    <NotificationsProvider>
                      <AgendasProvider>
                        <ChatProvider>
                          <DocumentsProvider>{children}</DocumentsProvider>
                        </ChatProvider>
                      </AgendasProvider>
                    </NotificationsProvider>
                  </DataProvider>
                </ActivityLogProvider>
              </UsersProvider>
            </AuthProvider>
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
