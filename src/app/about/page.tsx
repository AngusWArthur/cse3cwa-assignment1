import ReportViewer from '@/components/ReportViewer';

export const metadata = { title: 'CSE3CWA - About' };

export default function AboutPage() {
  const reports = [
    { id: 'escape-room', label: 'Escape Room Page', src: '/lh/escape-room.report.html' },
    { id: 'tabs',        label: 'Tabs Page',        src: '/lh/tabs.report.html' },
  ];

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--fg)',
    borderRadius: '10px',
    padding: '16px',
    background: 'var(--card)',
    color: 'var(--fg)',
  };

  const videoWrapper: React.CSSProperties = {
    position: 'relative',
    width: '100%',       // full width now
    aspectRatio: '16 / 9',
    background: 'var(--bg)',
    border: '1px solid var(--fg)',
    borderRadius: '10px',
    overflow: 'hidden',
  };

  const iframeStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    border: 0,
  };

  return (
    <>
      <h1>About</h1>

      {/* Full-bleed wrapper makes this section as wide as header/footer */}
      <div className="full-bleed">
        <section aria-labelledby="about-heading" style={cardStyle}>
          <h2 id="about-heading">Author</h2>
          <p><strong>Name:</strong> Angus Arthur</p>
          <p><strong>Student Number:</strong> 21819446</p>

          <h2 id="howto-heading" style={{ marginTop: '16px' }}>How to use this website</h2>

          <figure aria-labelledby="howto-caption" style={{ margin: 0 }}>
            <div style={videoWrapper}>
              <iframe
                src="https://latrobeuni-my.sharepoint.com/personal/21918446_students_ltu_edu_au/_layouts/15/embed.aspx?UniqueId=3e97bcce-f267-4160-bc78-9ed18b984856&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create"
                title="CSE3CWA_Assignment1_VideoDemo.mkv"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
                frameBorder={0}
                scrolling="no"
                style={iframeStyle}
              />
            </div>

            <figcaption
              id="howto-caption"
              style={{ color: 'var(--muted)', marginTop: '8px' }}
            >
              Embedded instructional video demonstrating how to use the website.
            </figcaption>
          </figure>
        </section>

        {/* Lighthouse Reports */}
        <div style={{ height: 12 }} />

        <ReportViewer
          reports={reports}
          defaultId="escape-room"
          height={900}
          title="Lighthouse Reports (HTML)"
        />
      </div>
    </>
  );
}
