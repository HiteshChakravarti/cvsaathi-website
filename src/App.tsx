import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { WhyChooseUs } from "./components/WhyChooseUs";
import { InfiniteScrollBenefits } from "./components/InfiniteScrollBenefits";
import { AIServices } from "./components/AIServices";
import { FeaturesBentoModern } from "./components/FeaturesBentoModern";
import { HowItWorksModern } from "./components/HowItWorksModern";
import { Templates3D } from "./components/Templates3D";
import { SuccessStories } from "./components/SuccessStories";
import { PricingSnapshot } from "./components/PricingSnapshot";
import { FinalCTA } from "./components/FinalCTA";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navigation />
      <Hero />
      <WhyChooseUs />
      <InfiniteScrollBenefits />
      <FeaturesBentoModern />
      <AIServices />
      <HowItWorksModern />
      <Templates3D />
      <SuccessStories />
      <PricingSnapshot />
      <FinalCTA />
      <FAQ />
      <Footer />
    </div>
  );
}
