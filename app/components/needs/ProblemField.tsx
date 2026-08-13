import type { CSSProperties } from "react";
import { needs } from "../../data";

type FieldPositionStyle = CSSProperties & {
  "--field-x": string;
  "--field-y": string;
};

const fieldPositions = [
  ["7%", "17%"],
  ["36%", "9%"],
  ["72%", "17%"],
  ["18%", "43%"],
  ["59%", "39%"],
  ["82%", "52%"],
  ["8%", "72%"],
  ["42%", "70%"],
  ["70%", "79%"],
] as const;

export function ProblemField() {
  return (
    <section
      id="representative-challenges"
      className="problem-field"
      aria-labelledby="problem-field-title"
    >
      <div className="problem-field__station">
        <div className="problem-field__handoff shell" aria-hidden="true">
          <span className="problem-field__released-datum" />
          <span>05 / DECISION</span>
          <i />
          <b>EVIDENCE OBJECT / RELEASED</b>
        </div>

        <div className="problem-field__paper">
          <header className="problem-field__mast shell">
            <div>
              <p className="problem-field__eyebrow">REPRESENTATIVE CHALLENGES</p>
              <h2 id="problem-field-title">Live Problem Field</h2>
            </div>
            <div className="problem-field__classification">
              <strong>{needs[0].displayLabel}</strong>
              <p>These are examples of the kind of operational need we frame and test against. They are not open calls.</p>
            </div>
          </header>

          <div className="problem-field__canvas shell" data-problem-field-visual>
            <div className="problem-field__registration" aria-hidden="true">
              <i /><i /><i /><i /><i /><i />
            </div>

            <aside className="problem-field__index" aria-hidden="true">
              <div><span>FIELD INDEX</span><b>09 / RECORDS</b></div>
              <ol>
                {needs.map((need, index) => (
                  <li
                    data-problem-index-item={index}
                    data-problem-position="future"
                    key={need.id}
                  >
                    <i />
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </li>
                ))}
              </ol>
            </aside>

            <div className="problem-field__records">
              {needs.map((need, index) => {
                const [x, y] = fieldPositions[index];
                const style = { "--field-x": x, "--field-y": y } as FieldPositionStyle;
                return (
                  <article
                    className="problem-record"
                    data-problem-record
                    data-problem-id={need.id}
                    data-problem-position="future"
                    key={need.id}
                    style={style}
                  >
                    <span className="problem-record__marker" data-problem-marker aria-hidden="true"><i /></span>
                    <div className="problem-record__meta">
                      <span>{String(index + 1).padStart(2, "0")} / 09</span>
                      <span>{need.sectorLabel}</span>
                    </div>
                    <h3>{need.title}</h3>
                    <p>{need.summary}</p>
                  </article>
                );
              })}
            </div>

            <div className="problem-field__aperture" aria-hidden="true">
              <span>INSPECTION DATUM</span><i /><i /><i /><i />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
