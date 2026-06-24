import React, { Suspense } from 'react'
import AffiliateLinks from '@/components/page/AffiliateLinks'
import FullScreenSpinner from '@/components/ui/FullScreenSpinner'

function AffiliateLinksContent() {
  return <AffiliateLinks />
}

export default function AffiliateLinksPage() {
  return (
    <Suspense
      fallback={
        <FullScreenSpinner isVisible={true} message="Loading affiliate links..." />
      }
    >
      <AffiliateLinksContent />
    </Suspense>
  )
}
