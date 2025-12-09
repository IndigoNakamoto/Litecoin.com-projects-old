// components/SEOHead.tsx
import Head from 'next/head'
import { optimizeWebflowImageUrl } from '../utils/customImageLoader'

type SEOHeadProps = {
  title: string
  summary: string
  coverImage: string
}

const SEOHead: React.FC<SEOHeadProps> = ({ title, summary, coverImage }) => {
  const baseImageUrl = coverImage.startsWith('http')
    ? coverImage
    : `https://www.litecoin.com${coverImage}`

  // Optimize Webflow CDN URLs for social media previews
  const imageUrl = optimizeWebflowImageUrl(baseImageUrl)

  return (
    <Head>
      <title>Litecoin | {title}</title>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={summary} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@LTCFoundation" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={summary} />
      <meta name="twitter:image" content={imageUrl} />
      <meta property="og:image" content={imageUrl} />
    </Head>
  )
}

export default SEOHead
