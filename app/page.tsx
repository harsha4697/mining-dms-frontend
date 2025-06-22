import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Mining Document Management System
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          A centralized hub for all mining compliance and operational documents.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/mines"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            View All Mines
          </Link>
        </div>
      </div>
    </main>
  );
}