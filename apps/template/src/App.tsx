import { Link } from "@/route.tree";

export default function App() {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold" style={{ marginBottom: "1rem" }}>
        Welcome to Olova Router
      </h1>
      <p className="text-muted text-lg" style={{ marginBottom: "2rem" }}>
        File-based routing for React + Vite applications.
      </p>

      <div
        className="flex justify-center gap-4"
        style={{ marginBottom: "3rem" }}
      >
        <Link href="/about" className="btn btn-primary">
          Get Started
        </Link>
        <Link href="/users" className="btn btn-outline">
          View User
        </Link>
      </div>

      <div className="separator"></div>

      <div className="card text-left" style={{ marginTop: "2rem" }}>
        <h3 className="card-title mb-4">Route Examples</h3>
        <div className="flex flex-col gap-3">
          <div
            className="flex justify-between items-center py-2 border-b"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <code>/</code>
            <span className="badge">Static Route</span>
          </div>
          <div
            className="flex justify-between items-center py-2 border-b"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <code>/about</code>
            <span className="badge">Static Route</span>
          </div>
          <div
            className="flex justify-between items-center py-2 border-b"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <code>/users/:id</code>
            <span className="badge badge-primary">Dynamic Route</span>
          </div>
          <div
            className="flex justify-between items-center py-2 border-b"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <code>/blog/*</code>
            <span className="badge badge-primary">Catch-all Route</span>
          </div>
          <div
            className="flex justify-between items-center py-2 border-b"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <code>/login</code>
            <span className="badge">Route Group (auth)</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <code>/search?q=...</code>
            <span className="badge">Search Params</span>
          </div>
        </div>
      </div>
    </div>
  );
}
