import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  filename?: string
  language?: string
  className?: string
  highlight?: number[]
}

export function CodeBlock({
  code,
  filename,
  language = "tsx",
  className,
  highlight = [],
}: CodeBlockProps) {
  const lines = code.split("\n")

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-[oklch(0.16_0_0)]",
        className
      )}
    >
      {filename && (
        <div className="flex items-center gap-2 border-b border-border bg-[oklch(0.18_0_0)] px-4 py-2">
          <span className="text-xs font-mono text-muted-foreground">
            {filename}
          </span>
          {language && (
            <span className="ml-auto text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
              {language}
            </span>
          )}
        </div>
      )}
      <div className="overflow-x-auto p-4">
        <pre className="text-sm font-mono leading-relaxed">
          {lines.map((line, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                highlight.includes(i + 1) &&
                  "bg-primary/10 -mx-4 px-4 border-l-2 border-primary"
              )}
            >
              <span className="mr-4 inline-block w-6 select-none text-right text-muted-foreground/40">
                {i + 1}
              </span>
              <code className="text-foreground/90">{line}</code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}
