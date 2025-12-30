import { Link } from "@/route.tree";

export const metadata = {
    title: "About",
    description: "About page",
    keywords: ["about", "page"],
}

export default function About() {
  return (
    <div className="page">
      <nav className="nav container">
        <Link href="/" className="font-semibold">← Back</Link>
      </nav>

      <main className="container py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">About</h1>
          <p className="text-muted mb-6">
            This is a static route example. The file is located at{" "}
            <code>src/about/index.tsx</code> and maps to <code>/about</code>.
          </p>

          <div className="card">
            <h3 className="card-title mb-2">Static Routes</h3>
            <p className="card-description">
              Create routes by adding folders with an <code>index.tsx</code> file.
              The folder structure determines the URL path.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
