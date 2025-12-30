import { Link, useParams } from "@/route.tree";

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/users">← Back to Users</Link>
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-3xl font-bold">User {id}</h1>
        <span className="badge badge-primary">Dynamic Route</span>
      </div>
      
      <p className="text-muted mb-6">
        This page uses the <code>$id</code> dynamic segment.
        The file is at <code>src/users/$id/index.tsx</code>.
      </p>

      <div className="card">
        <h3 className="card-title mb-2">useParams Hook</h3>
        <p className="card-description mb-4">
          Access route parameters using the <code>useParams</code> hook:
        </p>
        <pre className="p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--muted))' }}>
          <code>{`const { id } = useParams<{ id: string }>();
// Current id: "${id}"`}</code>
        </pre>
      </div>

      <div className="flex gap-2 mt-6">
        <Link href="/users/1" className="btn btn-outline">User 1</Link>
        <Link href="/users/2" className="btn btn-outline">User 2</Link>
        <Link href="/users/3" className="btn btn-outline">User 3</Link>
      </div>
    </div>
  );
}
