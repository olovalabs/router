import { Link, useRouter } from "@/route.tree";


export const metadata = {
    title: "Login",
    description: "Login page",
    keywords: ["login", "page"],
}

export default function Login() {
  const { navigate } = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="page">
      <nav className="nav container">
        <Link href="/" className="font-semibold">← Back</Link>
      </nav>

      <main className="container py-12">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold">Login</h1>
            <span className="badge">Route Group</span>
          </div>
          
          <p className="text-muted mb-6">
            This page is in an <code>(auth)</code> route group.
            The file is at <code>src/(auth)/login/index.tsx</code> but the URL is <code>/login</code>.
          </p>

          <form onSubmit={handleSubmit} className="card">
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <input type="email" className="input" placeholder="email@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Password</label>
                <input type="password" className="input" placeholder="••••••••" />
              </div>
              <button type="submit" className="btn btn-primary w-full">
                Sign In
              </button>
            </div>
          </form>

          <p className="text-sm text-muted text-center mt-4">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium">Register</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
