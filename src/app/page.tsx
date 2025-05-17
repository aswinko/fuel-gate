"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  Camera,
  FileText,
  Fuel,
  Shield,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import VerificationDemo from "@/components/verification-demo";
import Navbar from "@/components/layout/NavBar";

type FadeInSectionProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

const FadeInSection = ({
  children,
  delay = 0,
  className = "",
}: FadeInSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay: delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  const { scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: false });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Scroll Progress Line */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />
      <Navbar />

      
      <main className="flex-1 mx-auto container">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative w-full min-h-[90vh] flex items-center py-12 md:py-24 lg:py-32 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50 to-white -z-10" />
          <motion.div
            className="absolute inset-0 -z-10 opacity-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 1.5 }}
            style={{
              backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-4"
                >
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                    Verify Vehicle Age with AI Precision
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Ensure compliance with emission standards by verifying
                    vehicles manufactured after 2015 through registration checks
                    and AI-powered image analysis.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex flex-col gap-3 min-[400px]:flex-row"
                >
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-purple-200/50 transition-all"
                    asChild
                  >
                    <Link href="/verify">
                      Start Verification
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-purple-200 hover:bg-purple-50 transition-all"
                  >
                    Learn More
                  </Button>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex items-center justify-center"
              >
                <VerificationDemo />
              </motion.div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-400"
          >
            <Link href="#features" className="flex flex-col items-center">
              <span className="text-sm mb-2">Scroll to explore</span>
              <ChevronDown className="h-6 w-6" />
            </Link>
          </motion.div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="w-full py-20 md:py-32 lg:py-40 relative"
        >
          <div className="container px-4 md:px-6">
            <FadeInSection>
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                <div className="inline-block rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 mb-4">
                  Advanced Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Cutting-Edge Verification Technology
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our system combines multiple verification methods to ensure
                  accuracy and compliance
                </p>
              </div>
            </FadeInSection>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
              <FadeInSection delay={0.1}>
                <Card className="border-0 bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="pb-2 relative">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Camera className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl">
                      Number Plate Recognition
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <CardDescription className="text-base">
                      Advanced AI algorithms extract vehicle registration
                      numbers from images with high accuracy.
                    </CardDescription>
                  </CardContent>
                </Card>
              </FadeInSection>
              <FadeInSection delay={0.2}>
                <Card className="border-0 bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="pb-2 relative">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl">
                      Vehicle Database Lookup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <CardDescription className="text-base">
                      Instantly verify manufacturing year and other details
                      through our comprehensive database.
                    </CardDescription>
                  </CardContent>
                </Card>
              </FadeInSection>
              <FadeInSection delay={0.3}>
                <Card className="border-0 bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="pb-2 relative">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl">Fraud Detection</CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <CardDescription className="text-base">
                      Cross-reference multiple data points to prevent fraudulent
                      verification attempts with real-time alerts.
                    </CardDescription>
                  </CardContent>
                </Card>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="w-full py-20 md:py-32 lg:py-40 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white to-purple-50 -z-10" />
          <div className="container px-4 md:px-6">
            <FadeInSection>
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                <div className="inline-block rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 mb-4">
                  Simple Process
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  How It Works
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Simple, fast, and accurate vehicle verification in three easy
                  steps
                </p>
              </div>
            </FadeInSection>
            <div className="mx-auto max-w-5xl mt-12 relative">
              {/* Connecting line */}
              <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-0.5 h-[calc(100%-120px)] bg-gradient-to-b from-purple-300 to-indigo-100 hidden md:block" />

              <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                <FadeInSection delay={0.1} className="relative">
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg border border-purple-100 z-10 group transition-transform duration-300 hover:scale-110">
                      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">
                        1
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">Scan Registration</h3>
                    <p className="text-gray-500">
                      Scan the vehicle registration document or enter the
                      registration number
                    </p>
                  </div>
                </FadeInSection>
                <FadeInSection delay={0.3} className="relative">
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg border border-purple-100 z-10 group transition-transform duration-300 hover:scale-110">
                      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">
                        2
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">Capture Vehicle Image</h3>
                    <p className="text-gray-500">
                      Take a photo of the vehicle for AI analysis and model
                      verification
                    </p>
                  </div>
                </FadeInSection>
                <FadeInSection delay={0.5} className="relative">
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg border border-purple-100 z-10 group transition-transform duration-300 hover:scale-110">
                      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">
                        3
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">Instant Verification</h3>
                    <p className="text-gray-500">
                      Receive immediate verification results and compliance
                      status
                    </p>
                  </div>
                </FadeInSection>
              </div>

              <FadeInSection delay={0.6} className="mt-20">
                <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-indigo-600 rounded-2xl blur-xl opacity-20" />
                  <div className="relative bg-white p-8 rounded-2xl">
                    <h3 className="text-2xl font-bold mb-6">
                      Verification Process Demo
                    </h3>
                    <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src="/placeholder.svg?height=400&width=800"
                        alt="Verification process demonstration"
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="w-full py-20 md:py-32 lg:py-40">
          <div className="container px-4 md:px-6">
            <FadeInSection>
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                <div className="inline-block rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 mb-4">
                  Why Choose Us
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Benefits for Petrol Pumps
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Why petrol stations across the country are adopting our
                  verification system
                </p>
              </div>
            </FadeInSection>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 mt-12">
              <FadeInSection delay={0.1}>
                <div className="flex items-start space-x-4 p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                      <Check className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Regulatory Compliance</h3>
                    <p className="text-gray-500 mt-2">
                      Ensure your petrol pump complies with all environmental
                      regulations by serving only eligible vehicles
                    </p>
                  </div>
                </div>
              </FadeInSection>
              <FadeInSection delay={0.2}>
                <div className="flex items-start space-x-4 p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                      <Check className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Reduced Liability</h3>
                    <p className="text-gray-500 mt-2">
                      Protect your business from penalties and legal issues with
                      automated compliance verification
                    </p>
                  </div>
                </div>
              </FadeInSection>
              <FadeInSection delay={0.3}>
                <div className="flex items-start space-x-4 p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                      <Check className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Increased Efficiency</h3>
                    <p className="text-gray-500 mt-2">
                      Speed up the verification process with instant results,
                      reducing customer wait times
                    </p>
                  </div>
                </div>
              </FadeInSection>
              <FadeInSection delay={0.4}>
                <div className="flex items-start space-x-4 p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                      <Check className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Data Insights</h3>
                    <p className="text-gray-500 mt-2">
                      Gain valuable insights into customer vehicles and usage
                      patterns through our analytics dashboard
                    </p>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-700 -z-10" />
          <motion.div
            className="absolute inset-0 -z-10 opacity-10"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            style={{
              backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
              backgroundSize: "cover",
            }}
          />
          <div className="container px-4 md:px-6 relative">
            <FadeInSection>
              <div className="flex flex-col items-center justify-center space-y-8 text-center">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                    Ready to Modernize Your Petrol Pump?
                  </h2>
                  <p className="max-w-[900px] text-purple-50 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Join hundreds of petrol stations already using our
                    verification system
                  </p>
                </div>
                <div className="flex flex-col gap-4 min-[400px]:flex-row">
                  <Button
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-white/20 transition-all"
                  >
                    Get Started Today
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-white hover:bg-purple-700/30 transition-all"
                  >
                    Request Demo
                  </Button>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-20 md:py-32 lg:py-40">
          <div className="container px-4 md:px-6">
            <FadeInSection>
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                <div className="inline-block rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 mb-4">
                  Success Stories
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Trusted by Petrol Stations Nationwide
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  See what our customers have to say about our verification
                  system
                </p>
              </div>
            </FadeInSection>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
              <FadeInSection delay={0.1}>
                <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-gray-100 overflow-hidden">
                        <img
                          src="/placeholder.svg?height=100&width=100"
                          alt="Rajesh Kumar"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div>
                        <CardTitle>Rajesh Kumar</CardTitle>
                        <CardDescription>Station Owner, Delhi</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 italic">
                      "This system has transformed how we verify vehicles. The
                      AI analysis is incredibly accurate and has saved us from
                      potential regulatory issues."
                    </p>
                  </CardContent>
                </Card>
              </FadeInSection>
              <FadeInSection delay={0.2}>
                <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-gray-100 overflow-hidden">
                        <img
                          src="/placeholder.svg?height=100&width=100"
                          alt="Priya Sharma"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div>
                        <CardTitle>Priya Sharma</CardTitle>
                        <CardDescription>
                          Operations Manager, Mumbai
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 italic">
                      "The dual verification system gives us confidence that
                      we're complying with all regulations. Our customers
                      appreciate the quick process too."
                    </p>
                  </CardContent>
                </Card>
              </FadeInSection>
              <FadeInSection delay={0.3}>
                <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-gray-100 overflow-hidden">
                        <img
                          src="/placeholder.svg?height=100&width=100"
                          alt="Amit Patel"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div>
                        <CardTitle>Amit Patel</CardTitle>
                        <CardDescription>
                          Franchise Owner, Bangalore
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 italic">
                      "Implementation was seamless and the analytics dashboard
                      provides valuable insights into our customer base. Highly
                      recommended."
                    </p>
                  </CardContent>
                </Card>
              </FadeInSection>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-white">
        <div className="container flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-12">
          <div className="flex items-center gap-2 font-bold">
            <Fuel className="h-6 w-6 text-purple-600" />
            <span>Fuel Gate</span>
          </div>
          <nav className="flex gap-4 md:gap-6">
            <Link
              href="#"
              className="text-sm font-medium hover:text-purple-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-sm font-medium hover:text-purple-600 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-sm font-medium hover:text-purple-600 transition-colors"
            >
              Contact Us
            </Link>
          </nav>
          <div className="text-sm text-gray-500">
            © 2025 Fuel Gate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
