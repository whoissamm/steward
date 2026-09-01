"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type StepState = "pending" | "active" | "done" | "error"

export interface TaskStep {
  id: string
  label: string
  description?: string
  state: StepState
}

export interface TaskStepsProps {
  steps?: TaskStep[]
  className?: string
}

function StepIcon({ state }: { state: StepState }) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0 transition-colors duration-300",
        state === "pending" && "border-border bg-background",
        state === "active" && "border-primary bg-primary/10",
        state === "done" && "border-emerald-500 bg-emerald-500",
        state === "error" && "border-destructive bg-destructive"
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === "pending" && (
          <motion.div
            key="pending"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="w-2.5 h-2.5 rounded-full bg-border"
          />
        )}
        {state === "active" && (
          <motion.div
            key="active"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </motion.div>
        )}
        {state === "done" && (
          <motion.div
            key="done"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </motion.div>
        )}
        {state === "error" && (
          <motion.div
            key="error"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <X className="w-4 h-4 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ConnectorLine({ fromState, toState }: { fromState: StepState; toState: StepState }) {
  const filled = fromState === "done"
  return (
    <div className="relative flex items-center justify-center w-8 flex-shrink-0 my-0.5" style={{ height: 32 }}>
      <div className="absolute inset-x-0 flex justify-center">
        <div className="w-0.5 h-full bg-border relative overflow-hidden rounded-full">
          <motion.div
            className="absolute top-0 left-0 right-0 bg-emerald-500 rounded-full"
            initial={{ height: 0 }}
            animate={{ height: filled ? "100%" : "0%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  )
}

const DEFAULT_STEPS: TaskStep[] = [
  { id: "1", label: "Collect soil data", description: "Connecting to sensors…", state: "done" },
  { id: "2", label: "Analyse moisture levels", description: "Running analysis…", state: "active" },
  { id: "3", label: "Generate recommendations", state: "pending" },
  { id: "4", label: "Send daily report", state: "pending" },
]

export function TaskSteps({ steps = DEFAULT_STEPS, className }: TaskStepsProps) {
  return (
    <div className={cn("w-full space-y-0", className)} role="list" aria-label="Task steps">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        return (
          <div key={step.id} role="listitem">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <StepIcon state={step.state} />
                {!isLast && (
                  <ConnectorLine fromState={step.state} toState={steps[i + 1].state} />
                )}
              </div>

              <div
                className={cn(
                  "flex-1 pt-1 pb-6",
                  isLast && "pb-0"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-medium text-sm transition-colors",
                      step.state === "done" && "text-emerald-600 dark:text-emerald-400",
                      step.state === "active" && "text-foreground",
                      step.state === "pending" && "text-muted-foreground",
                      step.state === "error" && "text-destructive"
                    )}
                  >
                    {step.label}
                  </span>
                  {step.state === "active" && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      In progress
                    </span>
                  )}
                  {step.state === "error" && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full">
                      Failed
                    </span>
                  )}
                </div>
                {step.description && (
                  <AnimatePresence>
                    {step.state === "active" && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-muted-foreground mt-0.5"
                      >
                        {step.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
