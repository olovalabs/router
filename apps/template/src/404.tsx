import { Link, useRouter } from "@/route.tree";

export default function NotFound() {
  const { currentPath, navigate } = useRouter();

  return (
    <div className="page">
      <main className="container flex items-center justify-center" style={{ minHeight: 'calc(100vh - 4rem)', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-6xl font-bold" style={{ marginBottom: '1rem' }}>404</h1>
          <h2 className="text-xl font-semibold" style={{ marginBottom: '0.5rem' }}>Page Not Found</h2>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>
            The page <code>{currentPath}</code> does not exist.
          </p>

          <div className="flex justify-center gap-4">
            <button onClick={() => navigate("/")} className="btn btn-primary">
              Go Home
            </button>
            <Link href="/about" className="btn btn-outline">
              About
            </Link>
          </div>

          <div className="card text-left" style={{ marginTop: '2rem' }}>
            <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>Custom 404 Pages</h3>
            <p className="card-description">
              Create <code>404.tsx</code> in any folder for route-specific 404 pages.
              This is the global 404 at <code>src/404.tsx</code>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
