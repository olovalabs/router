import { Link, Outlet } from "@/route.tree";
import "./index.css";

export default function RootLayout() {
  return (
    <div className="page">
      <nav className="nav container">
        <div className="flex items-center gap-4">
          <span className="font-semibold">Olova Router</span>
          <span className="badge">Starter</span>
        </div>
        <div className="flex gap-2">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/users">Users</Link>
          <Link href="/login">Login</Link>
          <Link href="/search">Search</Link>
        </div>
      </nav>

      <main className="container" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
        <Outlet />
      </main>
    </div>
  );
}
