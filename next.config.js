// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app https://js.dev.shift4.com https://widget.thegivingblock.com https://vercel.live https://va.vercel-scripts.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' https://pbs.twimg.com https://unavatar.io https://abs.twimg.com https://static.tgb-preprod.com https://static.tgbwidget.com https://cdn.prod.website-files.com https://litecoin.com https://litecoin.net https://uploads-ssl.webflow.com https://static.webflow.com https://images.webflow.com blob: data:;
  media-src 'self' https://video.twimg.com;
  connect-src 'self' https://react-tweet.vercel.app https://vitals.vercel-insights.com;
  font-src 'self' https://fonts.gstatic.com;
  frame-src giscus.app https://js.dev.shift4.com https://widget.thegivingblock.com https://www.youtube.com https://www.youtube-nocookie.com https://www.redditmedia.com/;
`

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ''),
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

/**
 * @type {import('next/dist/next-server/server/config').NextConfig}
 **/
module.exports = () => {
  const plugins = [withBundleAnalyzer]
  return plugins.reduce((acc, next) => next(acc), {
    reactStrictMode: true,
    transpilePackages: ['react-tweet'],
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'pbs.twimg.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'unavatar.io',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'abs.twimg.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'static.tgb-preprod.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'static.tgbwidget.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'cdn.prod.website-files.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'litecoin.net',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'litecoin.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'uploads-ssl.webflow.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'static.webflow.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'images.webflow.com',
          pathname: '/**',
        },
        // Add any additional Webflow domains if necessary
      ],
      deviceSizes: [400, 640, 750, 828, 1080, 1200, 1920],
      imageSizes: [64, 128, 256, 512],
    },
    eslint: {
      dirs: ['pages', 'components', 'lib', 'layouts', 'scripts'],
    },
    async headers() {
      return [
        {
          source: '/api/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value:
                "default-src 'self'; " +
                "script-src 'self' https://js.dev.shift4.com https://vercel.live; " +
                "connect-src 'self'; " +
                "img-src 'self'; " +
                "style-src 'self' 'unsafe-inline';",
            },
            // Other headers with reduced restrictions if necessary
          ],
        },
        {
          source: '/_next/image:path*', // Specifically target image optimization routes
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, max-age=0',
            },
          ],
        },
        {
          source: '/(.*)',
          headers: securityHeaders,
        },
        {
          source: '/_next/image(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, max-age=0',
            },
          ],
        },
      ]
    },
    async redirects() {
      return [
        {
          source: '/missions/:path*', // Matches /missions and any subpath (e.g., /missions/mweb)
          destination: 'https://litecoin.com/projects/', // Forwards subpath to the destination
          permanent: true, // 301 Permanent Redirect
        },
      ]
    },
    webpack: (config, options) => {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      })

      return config
    },
  })
}
