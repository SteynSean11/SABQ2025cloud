import { Layout } from '../components/layout'
import { HeroSection } from '../components/hero-section'
import { TemplatesSection } from '../components/templates-section'
import { TipsSection } from '../components/tips-section'
import { TestimonialsSection } from '../components/testimonials-section'

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <TemplatesSection />
      <TipsSection />
      <TestimonialsSection />
    </Layout>
  )
}


