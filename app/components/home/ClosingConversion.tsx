import Link from "next/link";

export function ClosingConversion() {
  return (
    <section className="closing-conversion">
      <div className="shell">
        <span>Two ways in</span>
        <h2>Start with the need,<br />not the technology</h2>
        <p>If you run an operation with a problem worth testing, or you have built something that needs to prove itself in the field, the conversation starts the same way.</p>
        <div><Link href="/contact?intent=challenge">Bring an operational need</Link><Link href="/contact?intent=startup">I have technology to test</Link></div>
      </div>
    </section>
  );
}
