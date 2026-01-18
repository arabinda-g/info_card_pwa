import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3EFEF] text-black">
      <div className="rounded-3xl bg-white p-8 text-center shadow-lg shadow-black/10">
        <h2 className="text-2xl font-semibold text-black/90">Page not found</h2>
        <p className="mt-2 text-sm text-black/60">That page does not exist.</p>
        <Link
          to="/"
          className="mt-4 inline-flex rounded-full bg-purple-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
