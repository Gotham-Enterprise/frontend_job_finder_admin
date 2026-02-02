import React, { Suspense } from 'react'
import ForumModeration from '@/components/page/ForumModeration'
import FullScreenSpinner from '@/components/ui/FullScreenSpinner'

function ForumModerationContent() {
  return <ForumModeration />
}

export default function ForumModerationPage() {
  return (
    <Suspense
      fallback={
        <FullScreenSpinner isVisible={true} message="Loading forum moderation..." />
      }
    >
      <ForumModerationContent />
    </Suspense>
  )
}
