import { sparkStatus } from "../../data";

export function SparkStatusPanel() {
  return (
    <aside className={`spark-status spark-status-${sparkStatus.state}`} aria-labelledby="spark-status-title">
      <span>Program status</span>
      <h2 id="spark-status-title">Applications are not open right now</h2>
      <p>We open a SPARK cohort when our partners have confirmed operational needs to test against, so we do not run to a fixed calendar. Current application dates and a submission route are not available.</p>
      <p><strong>{sparkStatus.cohortCount} cohorts have run.</strong> As of {sparkStatus.cohortAsOf}.</p>
      <ul>{sparkStatus.eligibility.map((item) => <li key={item}>{item}</li>)}</ul>
    </aside>
  );
}
