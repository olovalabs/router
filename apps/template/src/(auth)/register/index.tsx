import { Link, useRouter } from "@/route.tree";

export default function Register() {
  const { navigate } = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div className="page">
      <nav className="nav container">
        <Link href="/" className="font-semibold">← Back</Link>
      </nav>

      <main className="container py-12">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold">Register</h1>
            <span className="badge">Route Group</span>
          </div>
          
          <p className="text-muted mb-6">
            This is another page in the <code>(auth)</code> route group.
            Located at <code>src/(auth)/register/index.tsx</code>.
          </p>

          <form onSubmit={handleSubmit} className="card">
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <input type="text" className="input" placeholder="John Doe" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <input type="email" className="input" placeholder="email@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Password</label>
                <input type="password" className="input" placeholder="••••••••" />
              </div>
              <button type="submit" className="btn btn-primary w-full">
                Create Account
              </button>
            </div>
          </form>

          <p className="text-sm text-muted text-center mt-4">
            Already have an account?{" "}
            <Link href="/login" className="font-medium">Sign In</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
