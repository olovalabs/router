import { Link, useRouter } from "@/route.tree";

export default function BlogCatchAll() {
  const { currentPath } = useRouter();
  const slug = currentPath.replace("/blog/", "");

  return (
    <div className="page">
      <nav className="nav container">
        <Link href="/">← Back</Link>
      </nav>

      <main className="container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold">Blog Post</h1>
            <span className="badge badge-primary">Catch-all Route</span>
          </div>
          
          <p className="text-muted mb-6">
            This page catches all routes under <code>/blog/*</code>.
            The file is at <code>src/blog/$/index.tsx</code>.
          </p>

          <div className="card mb-6">
            <h3 className="card-title mb-2">Current Path</h3>
            <p className="card-description mb-4">
              The catch-all segment captures everything after <code>/blog/</code>:
            </p>
            <pre className="p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--muted))' }}>
              <code>{`Path: "${currentPath}"
Slug: "${slug}"`}</code>
            </pre>
          </div>

          <div className="card">
            <h3 className="card-title mb-4">Try Different Paths</h3>
            <div className="flex flex-col gap-2">
              <Link href="/blog/hello-world" className="btn btn-outline w-full">/blog/hello-world</Link>
              <Link href="/blog/2024/01/my-post" className="btn btn-outline w-full">/blog/2024/01/my-post</Link>
              <Link href="/blog/category/tech/article" className="btn btn-outline w-full">/blog/category/tech/article</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
