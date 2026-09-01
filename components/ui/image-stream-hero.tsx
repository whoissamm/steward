import React, { CSSProperties } from "react"
import { cn } from "@/lib/utils"

export interface StreamImage {
  src: string
  alt?: string
}

export interface CorridorPath {
  images: StreamImage[]
  reverse?: boolean
  speed?: number
}

export interface ImageStreamHeroProps {
  paths?: CorridorPath[]
  title?: string
  subtitle?: string
  className?: string
  children?: React.ReactNode
}

function ImageTrack({
  images,
  reverse = false,
  speed = 30,
}: {
  images: StreamImage[]
  reverse?: boolean
  speed?: number
}) {
  const duplicated = [...images, ...images]
  return (
    <div
      className="flex flex-col gap-[1cqw] overflow-hidden"
      style={{ height: "100%" }}
    >
      <div
        className={cn(
          "flex flex-col gap-[1cqw]",
          reverse ? "animate-stream-up" : "animate-stream-down"
        )}
        style={
          {
            "--stream-duration": `${speed}s`,
            animationDuration: `${speed}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          } as CSSProperties
        }
      >
        {duplicated.map((img, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-[1cqw] flex-shrink-0"
            style={{ width: "100%", aspectRatio: "3/4" }}
          >
            <img
              src={img.src}
              alt={img.alt ?? ""}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes stream-down {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes stream-up {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .animate-stream-down {
          animation: stream-down var(--stream-duration, 30s) linear infinite;
        }
        .animate-stream-up {
          animation: stream-up var(--stream-duration, 30s) linear infinite;
        }
      `}</style>
    </div>
  )
}

function CorridorColumn({
  path,
  index,
}: {
  path: CorridorPath
  index: number
}) {
  const perspective = 800 - index * 60
  const translateZ = index * 40
  const opacity = 1 - index * 0.15
  const scaleX = 1 - index * 0.04

  return (
    <div
      className="absolute inset-0"
      style={{
        transform: `perspective(${perspective}px) translateZ(-${translateZ}px) scaleX(${scaleX})`,
        opacity,
        zIndex: 10 - index,
        containerType: "inline-size",
      }}
    >
      <div
        className="w-full h-full grid"
        style={{
          gridTemplateColumns: `repeat(${Math.max(path.images.length, 3)}, 1fr)`,
          gap: "1cqw",
          padding: "1cqw",
        }}
      >
        {Array.from({ length: Math.max(path.images.length, 3) }).map((_, col) => {
          const colImages = path.images.filter((_, i) => i % 3 === col % 3)
          const finalImages = colImages.length > 0 ? colImages : path.images.slice(0, 3)
          return (
            <ImageTrack
              key={col}
              images={finalImages}
              reverse={col % 2 === 1 ? !path.reverse : path.reverse}
              speed={(path.speed ?? 30) + col * 5}
            />
          )
        })}
      </div>
    </div>
  )
}

export function ImageStreamHero({
  paths,
  title,
  subtitle,
  className,
  children,
}: ImageStreamHeroProps) {
  const defaultImages: StreamImage[] = [
    { src: "https://picsum.photos/seed/a1/400/533", alt: "Image 1" },
    { src: "https://picsum.photos/seed/a2/400/533", alt: "Image 2" },
    { src: "https://picsum.photos/seed/a3/400/533", alt: "Image 3" },
    { src: "https://picsum.photos/seed/a4/400/533", alt: "Image 4" },
    { src: "https://picsum.photos/seed/a5/400/533", alt: "Image 5" },
    { src: "https://picsum.photos/seed/a6/400/533", alt: "Image 6" },
  ]

  const corridorPaths: CorridorPath[] = paths ?? [
    { images: defaultImages, reverse: false, speed: 25 },
    { images: [...defaultImages].reverse(), reverse: true, speed: 20 },
    { images: defaultImages, reverse: false, speed: 35 },
  ]

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden bg-background",
        className
      )}
      style={{ minHeight: "100svh", containerType: "inline-size" }}
    >
      {/* Corridor layers */}
      <div className="absolute inset-0">
        {corridorPaths.map((path, i) => (
          <CorridorColumn key={i} path={path} index={i} />
        ))}
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/80 z-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60 z-20 pointer-events-none" />

      {/* Content */}
      <div className="relative z-30 flex flex-col items-center justify-center min-h-[100svh] px-6 text-center">
        {title && (
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-4 max-w-4xl">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-8">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}
