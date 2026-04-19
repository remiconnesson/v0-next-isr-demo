import { DemoNav } from "@/components/demo-nav"
import { TimestampCard } from "@/components/timestamp-card"
import { RevalidateButton } from "@/components/revalidate-button"
import { CodeBlock } from "@/components/code-block"
import { Callout } from "@/components/callout"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

// ---------------------------------------------------------------
// Simulated "post" data. In a real app, you would fetch this from
// a CMS or database.
// ---------------------------------------------------------------
const posts: Record<string, { title: string; body: string }> = {
  "post-1": {
    title: "Understanding ISR with pre-built pages",
    body: "This page was listed in generateStaticParams, so Next.js pre-rendered it at build time. It exists in the cache from the very first deployment.",
  },
  "post-2": {
    title: "Understanding ISR with dynamic pages",
    body: "This page was NOT listed in generateStaticParams. It was rendered on the first user request and then cached. This is sometimes called 'on-demand ISR' or 'lazy ISR'.",
  },
}

// ---------------------------------------------------------------
// generateStaticParams tells Next.js which slugs to pre-render
// at build time. Only "post-1" is listed here intentionally.
// "post-2" will be rendered on the first request instead.
// ---------------------------------------------------------------
export function generateStaticParams() {
  return [{ slug: "post-1" }]
}

// ---------------------------------------------------------------
// No time-based revalidation — this page is cached indefinitely
// until we manually call revalidateTag().
// ---------------------------------------------------------------

export default async function OnDemandPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = posts[slug]

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <DemoNav />
        <main className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="text-2xl font-bold text-foreground">
            Post not found
          </h1>
          <p className="mt-2 text-muted-foreground">
            Try <Link href="/on-demand/post-1" className="text-primary underline">/on-demand/post-1</Link>{" "}
            or <Link href="/on-demand/post-2" className="text-primary underline">/on-demand/post-2</Link>.
          </p>
        </main>
      </div>
    )
  }

  const isPreBuilt = slug === "post-1"
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
      <DemoNav currentPath={`/on-demand/${slug}`} />

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="flex flex-col gap-4 pb-8">
          <Link
            href="/"
            className="group flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            Back to overview
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">Strategy 2</Badge>
            <Badge
              variant="outline"
              className="font-mono text-xs"
            >
              on-demand revalidation
            </Badge>
            {isPreBuilt ? (
              <Badge className="bg-[oklch(0.7_0.15_150)] text-[oklch(0.15_0.03_150)]">
                Pre-built at build time
              </Badge>
            ) : (
              <Badge className="bg-[oklch(0.8_0.15_80)] text-[oklch(0.2_0.03_80)]">
                Rendered on first request
              </Badge>
            )}
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>
          <p className="max-w-2xl text-muted-foreground leading-relaxed">
            {post.body}
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
            cacheStatus={isPreBuilt ? "pre-built" : "lazy-rendered"}
            randomValue={randomValue}
            title="Cached page data"
            description={
              isPreBuilt
                ? "This page was pre-rendered at build time via generateStaticParams."
                : "This page was rendered on the first visit and then cached."
            }
          />

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              Trigger on-demand revalidation
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Click the button below to call{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                revalidateTag(&quot;{slug}&quot;)
              </code>{" "}
              via an API route. Then refresh the page to see new data.
            </p>
            <RevalidateButton tag={slug} />
          </div>

          <Callout type="tip" title="Test flow">
            <ol className="mt-1 flex flex-col gap-1 text-sm">
              <li>1. Note the current timestamp and random value.</li>
              <li>2. Click &quot;Revalidate now&quot; to purge the cache.</li>
              <li>3. Refresh the page &mdash; you should see new values.</li>
              <li>4. Refresh again without revalidating &mdash; values stay the same (cached again).</li>
            </ol>
          </Callout>
        </section>

        <Separator className="mb-8" />

        {/* Source walkthrough */}
        <section className="flex flex-col gap-6 pb-10">
          <h2 className="text-xl font-semibold text-foreground">
            Source code walkthrough
          </h2>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">
              1. The dynamic page component
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This is a dynamic route with a <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">[slug]</code>{" "}
              parameter. The key element is <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">generateStaticParams</code>{" "}
              which only returns <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">post-1</code>,
              meaning <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">post-2</code> is{" "}
              <strong>not</strong> pre-built.
            </p>
            <CodeBlock
              filename="app/on-demand/[slug]/page.tsx"
              code={`// Only "post-1" is pre-rendered at build time.
// "post-2" will be rendered on the first request.
export function generateStaticParams() {
  return [{ slug: "post-1" }]
}

export default async function OnDemandPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = getPostData(slug)

  return (
    <div>
      <h1>{data.title}</h1>
      <p>Generated at: {new Date().toISOString()}</p>
    </div>
  )
}`}
              highlight={[3, 4]}
            />
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">
              2. The revalidation API route
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This Route Handler receives a tag name via query parameter and
              calls <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">revalidateTag()</code>{" "}
              to purge all cached entries that were tagged with that name.
            </p>
            <CodeBlock
              filename="app/api/revalidate/route.ts"
              code={`import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get('tag')

  if (!tag) {
    return NextResponse.json(
      { error: 'Missing tag parameter' },
      { status: 400 }
    )
  }

  // Purge all cache entries tagged with this name
  revalidateTag(tag, 'max')

  return NextResponse.json({
    revalidated: true,
    tag,
    now: Date.now(),
  })
}`}
              highlight={[15]}
            />
          </div>
        </section>

        <Separator className="mb-8" />

        {/* Comparison */}
        <section className="flex flex-col gap-6 pb-10">
          <h2 className="text-xl font-semibold text-foreground">
            Pre-built vs. dynamically rendered
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 text-left font-semibold text-foreground">
                    Aspect
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-foreground">
                    post-1 (pre-built)
                  </th>
                  <th className="py-3 pl-4 text-left font-semibold text-foreground">
                    post-2 (dynamic)
                  </th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-3 pr-4 font-medium text-foreground">
                    In generateStaticParams?
                  </td>
                  <td className="py-3 px-4">Yes</td>
                  <td className="py-3 pl-4">No</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 pr-4 font-medium text-foreground">
                    When is it rendered?
                  </td>
                  <td className="py-3 px-4">At build time</td>
                  <td className="py-3 pl-4">On first user request</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 pr-4 font-medium text-foreground">
                    First visit experience
                  </td>
                  <td className="py-3 px-4">Instant (pre-cached)</td>
                  <td className="py-3 pl-4">Slight delay (server render), then cached</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 pr-4 font-medium text-foreground">
                    Subsequent visits
                  </td>
                  <td className="py-3 px-4">Instant (from cache)</td>
                  <td className="py-3 pl-4">Instant (from cache)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-foreground">
                    On-demand revalidation
                  </td>
                  <td className="py-3 px-4">Supported</td>
                  <td className="py-3 pl-4">Supported</td>
                </tr>
              </tbody>
            </table>
          </div>

          <Callout type="info">
            <p>
              Once cached, both pages behave identically. The only difference
              is <em>when</em> the initial render happens: build time vs. first
              request.
            </p>
          </Callout>
        </section>

        {/* Navigation */}
        <Separator className="mb-6" />
        <div className="flex gap-4 pb-12">
          {slug === "post-1" ? (
            <Link
              href="/on-demand/post-2"
              className="text-sm font-medium text-primary hover:underline"
            >
              View the dynamically rendered page (post-2) &rarr;
            </Link>
          ) : (
            <Link
              href="/on-demand/post-1"
              className="text-sm font-medium text-primary hover:underline"
            >
              &larr; View the pre-built page (post-1)
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
