type ClientProposalBoardProps = {
  jobTitle: string;
  freelancerName: string;
  initials: string;
  onView: () => void;
};

export function ClientProposalBoard({ jobTitle, freelancerName, initials, onView }: ClientProposalBoardProps) {
  return (
    <section className="client-proposals-layout" aria-label="Jobs and proposals">
      <aside className="client-jobs-card">
        <header>
          <h2>Jobs</h2>
          <p>Select a job to view proposals.</p>
        </header>
        <button className="client-job-row active" type="button">
          <strong>{jobTitle}</strong>
          <span>published</span>
        </button>
      </aside>

      <article className="client-proposals-card">
        <header>
          <h2>Proposals for: {jobTitle}</h2>
          <div className="client-proposal-filters" role="tablist" aria-label="Proposal filters">
            <button className="active" type="button">All <span>(1)</span></button>
            <button type="button">Viewed <span>(1)</span></button>
          </div>
        </header>
        <div className="client-proposal-list">
          <article className="client-proposal-row">
            <div className="client-proposal-avatar" aria-hidden="true">{initials}</div>
            <div className="client-proposal-copy">
              <strong>{freelancerName.toLowerCase()}</strong>
              <span>viewed</span>
              <p>I&apos;m a creative Graphic Designer with experience in brand identity, digital products and visual storytelling...</p>
            </div>
            <button type="button" onClick={onView}>View</button>
          </article>
        </div>
      </article>
    </section>
  );
}
