import { Link, useSearchParams, useRouter } from "@/route.tree";

export default function Search() {
  const searchParams = useSearchParams();
  const { setSearchParams } = useRouter();

  const query = searchParams.get("q") || "";
  const page = searchParams.get("page") || "1";
  const sort = searchParams.get("sort") || "relevance";

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ q: e.target.value, page: "1" }, { merge: true });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage) }, { merge: true });
  };

  const handleSortChange = (newSort: string) => {
    setSearchParams({ sort: newSort }, { merge: true });
  };

  return (
    <div className="page">
      <nav className="nav container">
        <Link href="/" className="font-semibold">← Back</Link>
      </nav>

      <main className="container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold">Search</h1>
            <span className="badge badge-primary">Search Params</span>
          </div>
          
          <p className="text-muted mb-6">
            Demonstrating the <code>useSearchParams</code> hook for URL query parameters.
          </p>

          <div className="card mb-6">
            <h3 className="card-title mb-4">Search Input</h3>
            <input
              type="text"
              className="input"
              placeholder="Search..."
              value={query}
              onChange={handleSearch}
            />
          </div>

          <div className="card mb-6">
            <h3 className="card-title mb-4">Current Parameters</h3>
            <pre className="p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--muted))' }}>
              <code>{`{
            q: "${query}",
            page: "${page}",
            sort: "${sort}"
          }`}</code>
            </pre>
          </div>

          <div className="card mb-6">
            <h3 className="card-title mb-4">Pagination</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`btn ${page === String(p) ? 'btn-primary' : 'btn-outline'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="card-title mb-4">Sort Options</h3>
            <div className="flex gap-2">
              {['relevance', 'date', 'name'].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSortChange(s)}
                  className={`btn ${sort === s ? 'btn-primary' : 'btn-outline'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
