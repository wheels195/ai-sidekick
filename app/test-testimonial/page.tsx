import TestimonialCarousel from '@/components/TestimonialCarousel'

export default function TestTestimonialPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
      {/* Some content above to test natural scroll */}
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-400">Scroll down to see testimonial section</p>
      </div>

      {/* Testimonial Carousel - feels natural as user scrolls */}
      <TestimonialCarousel />
      
      {/* Extra padding for testing */}
      <div className="h-64"></div>
    </div>
  )
}