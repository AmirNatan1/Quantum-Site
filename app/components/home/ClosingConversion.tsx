import Link from "next/link";

export function ClosingConversion() {
  return (
    <section className="closing-conversion">
      <div className="shell">
        <span>One network. Two ways in.</span>
        <h2>Bring the constraint.<br />Or bring the technology.</h2>
        <div><Link href="/contact">Start with a challenge</Link><Link href="/spark">Explore SPARK</Link></div>
      </div>
    </section>
  );
}
