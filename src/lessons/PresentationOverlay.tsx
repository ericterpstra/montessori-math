import type { Lesson } from './types'

export interface PresentationOverlayProps {
  lesson: Lesson
  stepIndex: number
  onPrev: () => void
  onNext: () => void
  onClose: () => void
}

/** Fixed bottom panel that narrates one presentation step at a time. */
export function PresentationOverlay({ lesson, stepIndex, onPrev, onNext, onClose }: PresentationOverlayProps) {
  const steps = lesson.presentation
  const step = steps[Math.min(stepIndex, steps.length - 1)]
  return (
    <div className="presentation-overlay no-print" role="region" aria-label={`Walk-through: ${lesson.name}`}>
      <div className="presentation-head">
        <span className="presentation-title">{lesson.name}</span>
        <span className="presentation-progress">
          Step {stepIndex + 1} of {steps.length}
        </span>
        <button type="button" className="btn presentation-close" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="presentation-body" aria-live="polite">
        <p className="presentation-text">{step.text}</p>
        {step.say && <p className="say">{step.say}</p>}
      </div>
      <div className="presentation-nav">
        <button type="button" className="btn" onClick={onPrev} disabled={stepIndex === 0}>
          ← Previous
        </button>
        <button type="button" className="btn primary" onClick={onNext} disabled={stepIndex === steps.length - 1}>
          Next →
        </button>
      </div>
    </div>
  )
}
