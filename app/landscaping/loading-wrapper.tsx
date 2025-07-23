import { Suspense } from 'react'
import LoadingScreen from '@/components/ui/loading-screen'
import LandscapingChatPage from './server-page'

export default function LandscapingWithLoading() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LandscapingChatPage />
    </Suspense>
  )
}