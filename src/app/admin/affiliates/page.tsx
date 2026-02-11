import React, { Suspense } from 'react'
import AffiliatePartners from '@/components/page/AffiliatePartners'
import FullScreenSpinner from '@/components/ui/FullScreenSpinner'

function AffiliatePartnersContent() {
  return <AffiliatePartners />
}

export default function AffiliatePartnersPage() {
  return (
    <Suspense
      fallback={
        <FullScreenSpinner isVisible={true} message="Loading affiliate partners..." />
      }
    >
      <AffiliatePartnersContent />
    </Suspense>
  )
}
