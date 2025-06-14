import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PresentationCarousel } from "@/components/landing/presentation-carousel"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { AdvantagesSection } from "@/components/landing/advantages-section"
import { StatsSection } from "@/components/landing/stats-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <PresentationCarousel />
        <FeaturesSection />
        <HowItWorksSection />
        <AdvantagesSection />
        <StatsSection />
        <TestimonialsSection />
      </main>
      <SiteFooter />
    </div>
  )
}
