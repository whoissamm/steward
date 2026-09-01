"use client"

import { ShaderBackground } from "@/components/ui/dq"
import { Hero } from "@/components/ui/animated-hero"
import { AdaptiveNotchNavigationBar } from "@/components/ui/adaptive-notch-navigation-bar"
import { CoverflowCarousel } from "@/components/ui/coverflow-carousel"
import { GenerativeTree } from "@/components/ui/generative-tree"
import { QuantumCloudLoader } from "@/components/ui/quantum-cloud-loader"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { ReorderList } from "@/components/ui/reorder-list"
import { TaskSteps } from "@/components/ui/task-steps"
import { ReadingProgress } from "@/components/ui/reading-progress"
import { ExpandableTabs } from "@/components/ui/expandable-tabs"
import { MessageDock } from "@/components/ui/message-dock"
import { CourseDesignCards } from "@/components/ui/course-design-cards"
import { OnboardingWelcomeScreen } from "@/components/ui/onboarding-welcome-screen"
import { ImageStreamHero } from "@/components/ui/image-stream-hero"
import { HeroScrollVideoPinReveal } from "@/components/ui/hero-scroll-video-pin-reveal"
import {
  Home, Leaf, BarChart2, Settings, Bell, Calendar, CloudRain,
} from "lucide-react"

const LEFT_NAV = [
  { label: "Home", href: "#", icon: <Home className="w-4 h-4" /> },
  { label: "Fields", href: "#fields", icon: <Leaf className="w-4 h-4" /> },
  { label: "Analytics", href: "#analytics", icon: <BarChart2 className="w-4 h-4" /> },
]
const RIGHT_NAV = [
  { label: "Alerts", href: "#", icon: <Bell className="w-4 h-4" /> },
  { label: "Settings", href: "#", icon: <Settings className="w-4 h-4" /> },
]
const MOBILE_NAV = [
  { label: "Home", href: "#", icon: <Home className="w-4 h-4" /> },
  { label: "Fields", href: "#", icon: <Leaf className="w-4 h-4" /> },
  { label: "Weather", href: "#", icon: <CloudRain className="w-4 h-4" /> },
  { label: "Calendar", href: "#", icon: <Calendar className="w-4 h-4" /> },
  { label: "Settings", href: "#", icon: <Settings className="w-4 h-4" /> },
]

const CAROUSEL_SLIDES = [
  { id: "1", image: "https://picsum.photos/seed/farm1/800/600", title: "North Field — Wheat", subtitle: "Stage: Grain fill · 82% health" },
  { id: "2", image: "https://picsum.photos/seed/farm2/800/600", title: "South Field — Barley", subtitle: "Stage: Tillering · 91% health" },
  { id: "3", image: "https://picsum.photos/seed/farm3/800/600", title: "East Field — Oilseed Rape", subtitle: "Stage: Flowering · 76% health" },
  { id: "4", image: "https://picsum.photos/seed/farm4/800/600", title: "West Field — Cover Crop", subtitle: "Stage: Establishment · 95% health" },
  { id: "5", image: "https://picsum.photos/seed/farm5/800/600", title: "Orchard — Apples", subtitle: "Stage: Fruit set · 88% health" },
]

const TASKS = [
  { id: "1", label: "Soil moisture sensors calibrated", state: "done" as const },
  { id: "2", label: "Weekly AI advisory report generated", state: "done" as const },
  { id: "3", label: "North Field irrigation scheduled", state: "active" as const },
  { id: "4", label: "Pest alert review", state: "pending" as const },
  { id: "5", label: "Subsidy claim submission", state: "pending" as const },
]

const REORDER_ITEMS = [
  { id: "1", content: "Check morning weather forecast", label: "Check morning weather forecast" },
  { id: "2", content: "Review soil moisture levels", label: "Review soil moisture levels" },
  { id: "3", content: "Scout for aphids in South Field", label: "Scout for aphids in South Field" },
  { id: "4", content: "Update field diary", label: "Update field diary" },
  { id: "5", content: "Call agronomist for North Field", label: "Call agronomist for North Field" },
]

const COURSES = [
  {
    id: "1",
    thumbnail: "https://picsum.photos/seed/c1/600/400",
    category: "Soil Health",
    title: "Regenerative Agriculture Fundamentals",
    description: "Learn cover cropping, reduced tillage, and soil biology to improve long-term farm productivity.",
    instructor: "Dr. Sarah Chen",
    duration: "6h 20m",
    students: 1840,
    rating: 4.8,
    reviewCount: 312,
    price: "Free",
    isFree: true,
    progress: 62,
  },
  {
    id: "2",
    thumbnail: "https://picsum.photos/seed/c2/600/400",
    category: "Grants & Subsidies",
    title: "Navigating the Sustainable Farming Incentive",
    description: "Step-by-step guide to SFI agreements, payment rates, and eligible actions for English farmers.",
    instructor: "James Whitfield",
    duration: "3h 45m",
    students: 3210,
    rating: 4.9,
    reviewCount: 581,
    price: "Free",
    isFree: true,
    progress: 28,
  },
  {
    id: "3",
    thumbnail: "https://picsum.photos/seed/c3/600/400",
    category: "Precision Farming",
    title: "Using AI & Satellite Data for Crop Monitoring",
    description: "Integrate NDVI imagery, weather APIs, and AI models into your farm management workflow.",
    instructor: "Prof. Amir Patel",
    duration: "8h 10m",
    students: 920,
    rating: 4.7,
    reviewCount: 148,
    price: "£49",
    originalPrice: "£79",
  },
]

const TABS = [
  { id: "home", label: "Dashboard", icon: <Home className="w-4 h-4" /> },
  { id: "fields", label: "Fields", icon: <Leaf className="w-4 h-4" /> },
  "separator" as const,
  { id: "weather", label: "Weather", icon: <CloudRain className="w-4 h-4" /> },
  { id: "calendar", label: "Calendar", icon: <Calendar className="w-4 h-4" /> },
]

function Section({ title, children, dark }: { title: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <section className={`w-full py-16 px-4 md:px-8 ${dark ? "bg-zinc-950 text-white" : "bg-white"}`}>
      <p className={`text-xs font-semibold uppercase tracking-widest mb-8 ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
        {title}
      </p>
      {children}
    </section>
  )
}

export default function Page() {
  return (
    <div className="flex flex-col w-full min-h-screen font-sans">
      <ReadingProgress fixed showMinutesLeft />

      {/* Hero — WebGL shader background */}
      <section className="relative w-full h-screen overflow-hidden">
        <ShaderBackground className="absolute inset-0" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-8 px-4">
          <Hero />
        </div>
      </section>

      {/* Nav */}
      <Section title="Navigation">
        <AdaptiveNotchNavigationBar
          leftItems={LEFT_NAV}
          rightItems={RIGHT_NAV}
          mobileItems={MOBILE_NAV}
        />
      </Section>

      {/* Image stream corridor */}
      <Section title="Image Stream Hero" dark>
        <div className="h-[500px] rounded-2xl overflow-hidden">
          <ImageStreamHero />
        </div>
      </Section>

      {/* Coverflow carousel */}
      <Section title="Field Carousel">
        <CoverflowCarousel slides={CAROUSEL_SLIDES} />
      </Section>

      {/* Video pin reveal */}
      <Section title="Hero Scroll Reveal" dark>
        <HeroScrollVideoPinReveal />
      </Section>

      {/* Generative tree */}
      <Section title="Generative Art">
        <div className="flex items-center justify-center bg-zinc-950 rounded-2xl overflow-hidden" style={{ height: 420 }}>
          <GenerativeTree size={420} color="#4ade80" leafColor="#86efac" opacity={0.9} />
        </div>
      </Section>

      {/* Quantum loader */}
      <Section title="Loader" dark>
        <div className="flex items-center justify-center py-8">
          <QuantumCloudLoader size={120} />
        </div>
      </Section>

      {/* Interactive button */}
      <Section title="Interactive Button">
        <div className="flex flex-wrap gap-4 justify-center py-4">
          <InteractiveHoverButton>Get farm advice</InteractiveHoverButton>
          <InteractiveHoverButton>View field report</InteractiveHoverButton>
          <InteractiveHoverButton>Apply for SFI grant</InteractiveHoverButton>
        </div>
      </Section>

      {/* Progress bars */}
      <Section title="Progress Bars" dark>
        <div className="flex flex-col gap-6 max-w-lg mx-auto">
          <ProgressBar value={62} label="Soil health score" />
          <ProgressBar value={88} label="Irrigation efficiency" />
          <ProgressBar value={100} label="Weekly report" />
          <ProgressBar label="Fetching satellite imagery…" />
        </div>
      </Section>

      {/* Task steps */}
      <Section title="Task Steps">
        <div className="max-w-md mx-auto">
          <TaskSteps steps={TASKS} />
        </div>
      </Section>

      {/* Reorder list */}
      <Section title="Daily Task Planner" dark>
        <div className="max-w-md mx-auto">
          <ReorderList items={REORDER_ITEMS} />
        </div>
      </Section>

      {/* Expandable tabs */}
      <Section title="Expandable Tabs">
        <div className="flex justify-center">
          <ExpandableTabs tabs={TABS} />
        </div>
      </Section>

      {/* Course cards */}
      <Section title="Learning Centre" dark>
        <CourseDesignCards courses={COURSES} />
      </Section>

      {/* Message dock */}
      <Section title="AI Advisors Dock">
        <div className="flex justify-center py-4">
          <MessageDock />
        </div>
      </Section>

      {/* Onboarding */}
      <Section title="Onboarding Screen" dark>
        <div className="max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl" style={{ height: 700 }}>
          <OnboardingWelcomeScreen
            heroImage="https://picsum.photos/seed/farm-hero/800/900"
            title="Your farm's AI companion"
            description="Personalised advice, daily plans, and weather alerts — tailored to your land and season."
            ctaLabel="Get started"
          />
        </div>
      </Section>

      <footer className="w-full py-8 text-center text-xs text-zinc-500 bg-zinc-950">
        Steward · AI advisory companion for small farms in England
      </footer>
    </div>
  )
}
