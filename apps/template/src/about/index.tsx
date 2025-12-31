import { Link, clientOnly, useLoaderData, defer, Await, useInvalidate } from "@/route.tree";
import { useState } from "react";

export const metadata = {
    title: "About - Power Demo",
    description: "Demonstrating TanStack Router-like features",
    keywords: ["about", "page", "demo"],
}

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string;
    website: string;
    company: {
        name: string;
        catchPhrase: string;
    };
}

interface Post {
    id: number;
    userId: number;
    title: string;
    body: string;
}

interface LoaderData {
    users: User[];
    posts: ReturnType<typeof defer<Post[]>>;
    fetchedAt: string;
}

export const route = clientOnly({
    loader: async ({ signal }): Promise<LoaderData> => {
        console.log("🚀 Loader running...");
        
        const usersRes = await fetch('https://jsonplaceholder.typicode.com/users?_limit=3', { signal });
        const users = await usersRes.json();
        
        const postsPromise = fetch('https://jsonplaceholder.typicode.com/posts?_limit=5', { signal })
            .then(res => res.json());
        
        return {
            users,
            posts: defer(postsPromise),
            fetchedAt: new Date().toISOString()
        };
    },
    
    staleTime: 30000,
    
    refetchOnWindowFocus: true,
    
    refetchOnReconnect: true,

    refetchInterval: 60000,
    
    preload: true,
    
    pendingComponent: () => (
        <div className="page">
            <main className="container py-12">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                        <p className="text-blue-500">⏳ Loading users...</p>
                    </div>
                </div>
            </main>
        </div>
    ),
    
    errorComponent: ({ error, retry }) => (
        <div className="page">
            <main className="container py-12">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Error Loading Data</h2>
                    <p className="text-red-500 mb-4">{error.message}</p>
                    <button 
                        onClick={retry}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        🔄 Retry
                    </button>
                </div>
            </main>
        </div>
    )
});


export default function About() {
    const data = useLoaderData<LoaderData>();
    const { invalidate, invalidateAll } = useInvalidate();
    const [showFeatures, setShowFeatures] = useState(true);

    return (
        <div className="page">
            <nav className="nav container">
                <Link href="/" className="font-semibold">← Back</Link>
            </nav>

            <main className="container py-12">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-4">🚀 Power Features Demo</h1>
                    
                    {/* Feature Pills */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            ⚡ Stale-While-Revalidate
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            🎯 Deferred Data
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                            🔄 Auto Refetch
                        </span>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                            🗑️ Cache Invalidation
                        </span>
                    </div>
                    
                    {/* Fetch info */}
                    <div className="card mb-6 bg-green-50 border-green-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="card-title mb-2 text-green-700">✅ Data Loaded</h3>
                                <p className="text-green-600 text-sm">
                                    <strong>Fetched at:</strong> {data.fetchedAt}
                                </p>
                                <p className="text-green-600 text-xs mt-1">
                                    Cached for 30s (staleTime). Switch tabs and come back to trigger refetch!
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                                <button 
                                    onClick={() => invalidate('/about')}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                                >
                                    🔄 Invalidate
                                </button>
                                <button 
                                    onClick={invalidateAll}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                                >
                                    🗑️ Clear All
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Users Section - Loaded immediately */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">
                            👥 Users <span className="text-sm font-normal text-gray-500">(loaded immediately)</span>
                        </h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            {data.users.map(user => (
                                <div key={user.id} className="card">
                                    <h3 className="card-title">{user.name}</h3>
                                    <p className="text-sm text-gray-500">@{user.username}</p>
                                    <p className="text-sm mt-2">
                                        <strong>Email:</strong> {user.email}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Posts Section - Deferred! */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">
                            📝 Posts <span className="text-sm font-normal text-orange-500">(deferred - loads in background!)</span>
                        </h2>
                        
                        <Await
                            resolve={data.posts}
                            fallback={
                                <div className="grid gap-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="card animate-pulse">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-100 rounded w-full"></div>
                                            <div className="h-3 bg-gray-100 rounded w-2/3 mt-1"></div>
                                        </div>
                                    ))}
                                    <p className="text-center text-gray-500">Loading posts in background...</p>
                                </div>
                            }
                            errorElement={(error: Error) => (
                                <div className="card bg-red-50 border-red-200">
                                    <p className="text-red-600">Failed to load posts: {error.message}</p>
                                </div>
                            )}
                        >
                            {(posts: Post[]) => (
                                <div className="space-y-4">
                                    {posts.map((post: Post) => (
                                        <div key={post.id} className="card hover:shadow-lg transition-shadow">
                                            <h3 className="card-title text-lg capitalize">{post.title}</h3>
                                            <p className="card-description">{post.body}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Await>
                    </div>

                    {/* Feature Explanation */}
                    <button 
                        onClick={() => setShowFeatures(!showFeatures)}
                        className="mb-4 text-blue-500 hover:underline"
                    >
                        {showFeatures ? '▼ Hide' : '▶ Show'} Feature Details
                    </button>
                    
                    {showFeatures && (
                        <div className="card bg-gray-50">
                            <h3 className="card-title mb-4">🎯 TanStack Router-like Features Used:</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <span className="text-green-500">✓</span>
                                    <div>
                                        <strong>staleTime: 30000</strong>
                                        <p className="text-gray-600">Data cached for 30 seconds. Stale data shown while refetching.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-green-500">✓</span>
                                    <div>
                                        <strong>defer()</strong>
                                        <p className="text-gray-600">Posts load in background without blocking initial render.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-green-500">✓</span>
                                    <div>
                                        <strong>refetchOnWindowFocus: true</strong>
                                        <p className="text-gray-600">Switch tabs and come back - data will refetch!</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-green-500">✓</span>
                                    <div>
                                        <strong>refetchOnReconnect: true</strong>
                                        <p className="text-gray-600">Automatically refetch when coming back online.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-green-500">✓</span>
                                    <div>
                                        <strong>invalidate() / invalidateAll()</strong>
                                        <p className="text-gray-600">Manually clear cache and trigger refetch.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
