import Link from "next/link";

export const metadata = { title: "Page not found | Quantum Hub", robots: "noindex,nofollow" };

export default function NotFound() {
  return (
    <main className="not-found-page" id="main-content">
      <div className="shell">
        <span>404</span>
        <h1>That page is not here</h1>
        <p>The link may be old, or the page may have moved. These are the two most useful places to start.</p>
        <div><Link href="/for-partners">I have an operational need</Link><Link href="/for-startups">I have technology to test</Link></div>
        <Link href="/contact">Or get in touch</Link>
      </div>
    </main>
  );
}
