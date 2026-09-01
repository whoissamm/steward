"use client"

import { useState } from "react"
import { Clock, Users, Star, BookOpen, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface CourseCard {
  id: string
  thumbnail: string
  category: string
  title: string
  description: string
  rating: number
  reviewCount: number
  duration: string
  students: number
  instructor: string
  progress?: number
  price: string
  originalPrice?: string
  isFree?: boolean
  ctaLabel?: string
}

export interface CourseDesignCardsProps {
  courses?: CourseCard[]
  columns?: 2 | 3 | 4
  className?: string
  onEnroll?: (id: string) => void
}

function Stars({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.floor(rating)
          const partial = !filled && i < rating
          return (
            <Star
              key={i}
              className={cn(
                "w-3.5 h-3.5",
                filled && "fill-amber-400 text-amber-400",
                partial && "fill-amber-200 text-amber-400",
                !filled && !partial && "fill-transparent text-muted-foreground/30"
              )}
            />
          )
        })}
      </div>
      <span className="text-xs font-medium text-foreground">{rating.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground">({count.toLocaleString()})</span>
    </div>
  )
}

function CourseCardItem({
  course,
  onEnroll,
}: {
  course: CourseCard
  onEnroll?: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Hover overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300",
            hovered ? "opacity-100" : "opacity-0"
          )}
          aria-hidden={!hovered}
        >
          <Button
            size="sm"
            variant="secondary"
            className="gap-2"
            tabIndex={hovered ? 0 : -1}
            onClick={() => onEnroll?.(course.id)}
          >
            Preview <BookOpen className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Category pill */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-primary text-primary-foreground">
          {course.category}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <h3 className="font-semibold text-base text-foreground line-clamp-2 leading-snug">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>

        <Stars rating={course.rating} count={course.reviewCount} />

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {course.students.toLocaleString()} students
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          by <span className="font-medium text-foreground">{course.instructor}</span>
        </p>

        {/* Progress bar */}
        {course.progress !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{course.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">
              {course.isFree ? "Free" : course.price}
            </span>
            {course.originalPrice && !course.isFree && (
              <span className="text-xs line-through text-muted-foreground">
                {course.originalPrice}
              </span>
            )}
          </div>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => onEnroll?.(course.id)}
          >
            {course.ctaLabel ?? "Enroll"} <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </article>
  )
}

const DEFAULT_COURSES: CourseCard[] = [
  {
    id: "1",
    thumbnail: "https://picsum.photos/seed/course1/640/360",
    category: "Design",
    title: "UI/UX Design Fundamentals: From Sketch to Prototype",
    description: "Learn the core principles of user-centred design and build your first high-fidelity prototype.",
    rating: 4.8,
    reviewCount: 2341,
    duration: "12h 30m",
    students: 18400,
    instructor: "Sarah Chen",
    progress: 45,
    price: "£49.99",
    originalPrice: "£99.99",
  },
  {
    id: "2",
    thumbnail: "https://picsum.photos/seed/course2/640/360",
    category: "Development",
    title: "React 19 & Next.js 15: Complete Production Guide",
    description: "Build full-stack applications with the latest React features, server components, and App Router.",
    rating: 4.9,
    reviewCount: 5120,
    duration: "28h",
    students: 42000,
    instructor: "James Patel",
    price: "£64.99",
    originalPrice: "£129.99",
  },
  {
    id: "3",
    thumbnail: "https://picsum.photos/seed/course3/640/360",
    category: "Data",
    title: "Python for Data Analysis & Machine Learning",
    description: "Master pandas, NumPy, scikit-learn and visualise insights with real-world datasets.",
    rating: 4.7,
    reviewCount: 3890,
    duration: "22h 15m",
    students: 31000,
    instructor: "Dr. Ana Torres",
    isFree: true,
    price: "Free",
  },
]

export function CourseDesignCards({
  courses = DEFAULT_COURSES,
  columns = 3,
  className,
  onEnroll,
}: CourseDesignCardsProps) {
  const colClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns]

  return (
    <div className={cn("grid grid-cols-1 gap-6", colClass, className)}>
      {courses.map((course) => (
        <CourseCardItem key={course.id} course={course} onEnroll={onEnroll} />
      ))}
    </div>
  )
}
