import { DemoNav } from "@/components/demo-nav"
import { TimestampCard } from "@/components/timestamp-card"
import { CodeBlock } from "@/components/code-block"
import { Callout } from "@/components/callout"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// ---------------------------------------------------------------
// THIS is the key line. It tells Next.js to revalidate this page
// at most once every 15 seconds. After 15s, the next request will
// trigger a background re-render, while the stale version is served
// immediately to the current visitor.
// ---------------------------------------------------------------
export const revalidate = 15

export default function TimeBasedPage() {
  const now = new Date()
  const generatedAt = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "UTC",
  })
  const randomValue = Math.floor(Math.random() * 100_000)

  return (
    <div className="min-h-screen bg-background">
      <DemoNav currentPath="/time-based" />

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex flex-col gap-4 pb-8">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">Strategy 1</Badge>
            <Badge variant="outline" className="font-mono text-xs">
              revalidate = 15
            </Badge>
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Time-based revalidation
          </h1>
          <p className="max-w-2xl text-muted-foreground leading-relaxed">
            This page re-generates automatically every 15 seconds. Refresh
            repeatedly and watch the timestamp and random value below: they
            will stay the same until the 15-second window expires.
          </p>
        </div>

        <Separator className="mb-8" />

        {/* Live demo */}
        <section className="flex flex-col gap-6 pb-10">
          <h2 className="text-xl font-semibold text-foreground">
            Live result
          </h2>
          <TimestampCard
            generatedAt={generatedAt}
            cacheStatus="revalidate = 15"
            randomValue={randomValue}
            title="Cached page data"
            description="These values were captured when the page was last rendered on the server."
          />

          <Callout type="info" title="How to test">
            <ol className="mt-1 flex flex-col gap-1 text-sm">
              <li>1. Note the timestamp and random value above.</li>
              <li>2. Refresh the page immediately &mdash; values stay the same (cached).</li>
              <li>3. Wait 15+ seconds, then refresh &mdash; you still see stale data.</li>
              <li>4. Refresh once more &mdash; now you see new data (regenerated in background).</li>
            </ol>
          </Callout>
        </section>

        <Separator className="mb-8" />

        {/* Source code walkthrough */}
        <section className="flex flex-col gap-6 pb-10">
          <h2 className="text-xl font-semibold text-foreground">
            Source code
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed">
            The entire implementation is a single export. Line 2 is where the
            magic happens:
          </p>

          <CodeBlock
            filename="app/time-based/page.tsx"
            code={`// Tell Next.js: cache this page for 15 seconds
export const revalidate = 15

export default function TimeBasedPage() {
  const now = new Date()
  const generatedAt = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "UTC",
  })
  const randomValue = Math.floor(Math.random() * 100_000)

  return (
    <div>
      <p>Generated at: {generatedAt}</p>
      <p>Random value: {randomValue}</p>
    </div>
  )
}`}
            highlight={[2]}
          />
        </section>

        <Separator className="mb-8" />

        {/* Timeline */}
        <section className="flex flex-col gap-6 pb-10">
          <h2 className="text-xl font-semibold text-foreground">
            What happens under the hood
          </h2>

          <div className="flex flex-col gap-0">
            {[
              {
                time: "t = 0s",
                title: "Build / first request",
                desc: "Next.js renders the page and caches the result. The 15-second timer starts.",
              },
              {
                time: "t < 15s",
                title: "Within the revalidation window",
                desc: "All requests get the cached HTML instantly. No server rendering occurs.",
              },
              {
                time: "t = 15s",
                title: "Window expires",
                desc: "The cache is now considered stale. The next request still gets the stale version.",
              },
              {
                time: "t > 15s (first hit)",
                title: "Background regeneration triggered",
                desc: 'The visitor gets the stale page, but Next.js re-renders the page in the background. This is the "stale-while-revalidate" pattern.',
              },
              {
                time: "t > 15s (next hit)",
                title: "Fresh page served",
                desc: "The regenerated page replaces the old cache. All new requests get the fresh version. The timer resets.",
              },
            ].map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-mono font-bold text-primary">
                    {i + 1}
                  </div>
                  {i < 4 && (
                    <div className="w-px flex-1 bg-border" />
                  )}
                </div>
                <div className="flex flex-col gap-1 pb-6">
                  <span className="font-mono text-xs text-muted-foreground">
                    {step.time}
                  </span>
                  <h3 className="text-sm font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator className="mb-8" />

        {/* Per-fetch example */}
        <section className="flex flex-col gap-6 pb-10">
          <h2 className="text-xl font-semibold text-foreground">
            Alternative: per-fetch revalidation
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Instead of setting a page-level <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">revalidate</code>{" "}
            export, you can configure it per <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">fetch</code>{" "}
            call. This is useful when different data sources have different
            freshness requirements.
          </p>
          <CodeBlock
            filename="app/mixed/page.tsx"
            code={`export default async function MixedPage() {
  // Revalidate every 60 seconds
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 },
  })

  // Revalidate every 5 seconds
  const prices = await fetch('https://api.example.com/prices', {
    next: { revalidate: 5 },
  })

  // Next.js uses the LOWEST revalidate value (5s)
  // to determine the page-level revalidation interval
}`}
            highlight={[4, 9]}
          />
          <Callout type="warning" title="Lowest value wins">
            <p>
              When multiple fetches on the same page have different
              <code>revalidate</code> values, Next.js uses the{" "}
              <strong>lowest</strong> one for the whole page.
            </p>
          </Callout>
        </section>
      </main>
    </div>
  )
}
