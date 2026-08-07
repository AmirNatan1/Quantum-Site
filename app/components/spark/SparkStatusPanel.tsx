import { sparkRouteContent, sparkStatus } from "../../data";

export function SparkStatusPanel() {
  return (
    <aside className={`spark-status spark-status-${sparkStatus.state}`} aria-labelledby="spark-status-title">
      <span>{sparkRouteContent.status.label}</span>
      <h2 id="spark-status-title">{sparkRouteContent.status.heading}</h2>
      <p>{sparkRouteContent.status.body}</p>
      <p><strong>{sparkStatus.cohortCount} cohorts have run.</strong> As of {sparkStatus.cohortAsOf}.</p>
      <ul>{sparkStatus.eligibility.map((item) => <li key={item}>{item}</li>)}</ul>
    </aside>
  );
}
