import { Link } from "@/route.tree";

const users = [
  { id: 1, name: "Alice Johnson", role: "Developer" },
  { id: 2, name: "Bob Smith", role: "Designer" },
  { id: 3, name: "Charlie Brown", role: "Manager" },
];

export default function Users() {
  return (
    <div className="page">
      <nav className="nav container">
        <Link href="/">← Back</Link>
      </nav>

      <main className="container py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Users</h1>
          <p className="text-muted mb-6">
            Click on a user to see the dynamic route in action.
          </p>

          <div className="flex flex-col gap-3">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/users/${user.id}` as "/users/:id"}
                className="card flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted">{user.role}</p>
                </div>
                <span className="badge">ID: {user.id}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
