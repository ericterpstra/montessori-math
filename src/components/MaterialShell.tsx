import type { ReactNode } from 'react'

export interface MaterialShellProps {
  /** Buttons/selects for modes, reset, etc. Hidden when printing. */
  controls?: ReactNode
  /** Short how-to content shown in a collapsible box. */
  help?: ReactNode
  /** Background of the work area: green felt mat, wood table, or plain paper. */
  mat?: 'felt' | 'wood' | 'paper'
  children: ReactNode
}

/** Consistent frame around every interactive material's work area. */
export function MaterialShell({ controls, help, mat = 'felt', children }: MaterialShellProps) {
  return (
    <div className="material-shell">
      {help && (
        <details className="material-help no-print">
          <summary>How to use this material</summary>
          <div className="material-help-body">{help}</div>
        </details>
      )}
      {controls && <div className="material-controls no-print">{controls}</div>}
      <div className={`material-stage mat-${mat}`}>{children}</div>
    </div>
  )
}
