import { Layout } from '../components/layout'
import { HeroSection } from '../components/hero-section'
import { TemplatesSection } from '../components/templates-section'
import { TipsSection } from '../components/tips-section';
import { TestimonialsSection } from '../components/testimonials-section';
import { AiAssistantSection } from '../components/ai-assistant-section'; // New import

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <TemplatesSection />
      <TipsSection />
      <TestimonialsSection />
      <AiAssistantSection /> {/* New component */}
    </Layout>
  );
}


