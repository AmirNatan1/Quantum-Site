import Link from "next/link";
import { sparkStatus } from "../../data";

export function SparkStatusPanel() {
  return (
    <aside className={`spark-status spark-status-${sparkStatus.state}`} aria-labelledby="spark-status-title">
      <span>Program status</span>
      <h2 id="spark-status-title">Application dates to be confirmed</h2>
      <p>The program model is active, but no current cohort window has been approved for publication. You can prepare your field-readiness information now.</p>
      <ul>{sparkStatus.eligibility.map((item) => <li key={item}>{item}</li>)}</ul>
      <Link href="/spark-register">Review the application fields</Link>
    </aside>
  );
}
