import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Tools from "@/components/Tools";
import WhyChooseUs from "@/components/WhyChooseUs";
import SupportedFormats from "@/components/SupportedFormats";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Tools />
      <WhyChooseUs />
      <SupportedFormats />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
