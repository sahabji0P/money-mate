import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import appCss from '~/styles/app.css?url'
import { supportsViewTransitions } from '~/lib/view-transitions'

function AppSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="h-6 w-28 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900"
            >
              <div className="h-5 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-3" />
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-6" />
              <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      {
        title: 'Owwn - Own what you owe',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Audiowide&display=swap' },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  notFoundComponent: () => <div>Route not found</div>,
  component: RootComponent,
})

function RootComponent() {
  // Enable View Transitions API for smoother page transitions
  React.useEffect(() => {
    // The CSS @view-transition rule handles automatic transitions
    // This just adds a meta tag for better browser support
    if (supportsViewTransitions()) {
      const meta = document.createElement('meta')
      meta.name = 'view-transition'
      meta.content = 'same-origin'
      document.head.appendChild(meta)
      
      return () => {
        if (document.head.contains(meta)) {
          document.head.removeChild(meta)
        }
      }
    }
  }, [])

  return (
    <RootDocument>
      <React.Suspense fallback={<AppSkeleton />}>
        <Outlet />
      </React.Suspense>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
