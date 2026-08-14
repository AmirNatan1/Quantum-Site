const stateLabels = [
  ["frame", "Boundary defined"],
  ["configure", "Test cell configured"],
  ["test", "Conditions applied"],
  ["resolve", "Evidence under review"],
  ["decide", "Decision ready"],
] as const;

export function ProvingSpecimen() {
  return (
    <figure className="proving-machine" data-proving-apparatus>
      <figcaption className="sr-only">
        One proof specimen moves through framing, configuration, field testing, evidence resolution and a neutral decision gate.
      </figcaption>

      <div className="proving-machine__head" aria-hidden="true">
        <span>QH / PROVING ROUTE</span>
        <span className="proving-machine__state">
          {stateLabels.map(([id, label]) => <i data-machine-state={id} key={id}>{label}</i>)}
        </span>
      </div>

      <div className="proving-machine__viewport" aria-hidden="true">
        <div className="proving-machine__grid" />
        <div className="proving-machine__datum proving-machine__datum--x"><i /><i /><i /><i /><i /><i /><i /><i /></div>
        <div className="proving-machine__datum proving-machine__datum--y"><i /><i /><i /><i /><i /><i /></div>

        <div className="proving-machine__rail proving-machine__rail--top"><span>ENVIRONMENT</span></div>
        <div className="proving-machine__rail proving-machine__rail--bottom"><span>FIELD CONDITION</span></div>
        <div className="proving-machine__wall proving-machine__wall--left"><span>CONSTRAINT</span></div>
        <div className="proving-machine__wall proving-machine__wall--right"><span>INSTRUMENTATION</span></div>

        <div className="proving-machine__frame">
          <i /><i /><i /><i />
        </div>

        <div className="proof-specimen" data-proving-specimen>
          <div className="proof-specimen__shell">
            <span className="proof-specimen__id">SPECIMEN / 01</span>
            <strong>Proof condition</strong>
            <span className="proof-specimen__status">
              <i data-specimen-status="live">UNRESOLVED</i>
              <i data-specimen-status="resolved">EVIDENCE OBJECT</i>
            </span>
            <div className="proof-specimen__trace"><i /><i /><i /></div>
            <div className="proof-specimen__evidence"><i /><i /><i /><i /><i /></div>
          </div>
        </div>

        <div className="proving-machine__test-bands">
          <i><span>CONDITION</span></i>
          <i><span>OBSERVE</span></i>
          <i><span>REGISTER</span></i>
        </div>

        <div className="proving-machine__resolve-axis"><i /><i /><span>LOCK</span></div>

        <div className="proving-machine__decision-gate">
          <span>DECISION GATE</span>
          <i data-decision-path="scale">Scale</i>
          <i data-decision-path="iterate">Iterate</i>
          <i data-decision-path="stop">Stop</i>
        </div>
      </div>

      <div className="proving-machine__foot" aria-hidden="true">
        <span>LIVE / UNRESOLVED</span>
        <i />
        <span>RESOLVED / DECISION-READY</span>
      </div>
    </figure>
  );
}
