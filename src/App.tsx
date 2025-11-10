import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { Benefits } from "./components/Benefits";
import { Features } from "./components/Features";
import { Services } from "./components/Services";
import { Process } from "./components/Process";
import { Projects } from "./components/Projects";
import { Customers } from "./components/Customers";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0C0E18] text-white overflow-hidden">
      <Navigation />
      <Hero />
      <Benefits />
      <Features />
      <Services />
      <Process />
      <Projects />
      <Customers />
      <CTA />
      <Footer />
    </div>
  );
}
