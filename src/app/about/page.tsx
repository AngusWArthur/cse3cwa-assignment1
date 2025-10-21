export const metadata = { title: 'CSE3CWA - About' };

function SectionCard(props: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section
      aria-labelledby={props.id}
      style={{
        border: '1px solid var(--fg)',
        borderRadius: '10px',
        padding: '16px',
        background: 'var(--card)',
        color: 'var(--fg)',
        marginBottom: '16px',
        // keep content aligned with header/footer edges (matches .main padding)
        marginLeft: '16px',
        marginRight: '16px',
      }}
    >
      <h2 id={props.id} style={{ marginTop: 0 }}>{props.title}</h2>
      {props.children}
    </section>
  );
}

export default function AboutPage() {
  // IDs for the CSS-only tabs
  const group = 'lh-reports';
  const idTabs = 'lh-tabs';
  const idEscape = 'lh-escape';

  // Where your static Lighthouse HTML files should live:
  //   public/reports/tabs-lh.html
  //   public/reports/escape-lh.html
  // They’ll be served at /reports/tabs-lh.html and /reports/escape-lh.html.
  const tabsReportSrc = '/reports/tabs-lh.html';
  const escapeReportSrc = '/reports/escape-lh.html';

  return (
    <>
      <h1 style={{ margin: '0 16px 12px' }}>About</h1>

      <SectionCard id="about-heading" title="Author">
        <p><strong>Name:</strong> Angus Arthur</p>
        <p><strong>Student Number:</strong> 21819446</p>
      </SectionCard>

      <SectionCard id="video" title="How to use this website">
        <figure aria-labelledby="video-caption" style={{ margin: 0 }}>
          {/* Responsive 16:9 wrapper */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '853px',
              aspectRatio: '16 / 9',
              background: 'var(--bg)',
              border: '1px solid var(--fg)',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            <iframe
              src="https://latrobeuni-my.sharepoint.com/personal/21918446_students_ltu_edu_au/_layouts/15/embed.aspx?UniqueId=3e97bcce-f267-4160-bc78-9ed18b984856&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create"
              title="CSE3CWA_Assignment1_VideoDemo.mkv"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
              frameBorder={0}
              scrolling="no"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                border: 0,
              }}
            />
          </div>

          <figcaption
            id="video-caption"
            style={{ color: 'var(--muted)', marginTop: '8px' }}
          >
            Embedded instructional video demonstrating how to use the website.
          </figcaption>
        </figure>
      </SectionCard>

      <SectionCard id="video" title="Additions to the website">
        <figure aria-labelledby="video-caption" style={{ margin: 0 }}>
          {/* Responsive 16:9 wrapper */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '853px',
              aspectRatio: '16 / 9',
              background: 'var(--bg)',
              border: '1px solid var(--fg)',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            <iframe src="https://latrobeuni-my.sharepoint.com/personal/21918446_students_ltu_edu_au/_layouts/15/embed.aspx?UniqueId=5272eca8-cb12-4c5d-8d05-475a52b5fca1&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create" 
              width="640" 
              height="360" 
              frameBorder="0" 
              scrolling="no" 
              allowFullScreen 
              title="CSE3CWA_Assignment2_VideoDemo.mkv">
                              </iframe>
          </div>

          <figcaption
            id="video-caption"
            style={{ color: 'var(--muted)', marginTop: '8px' }}
          >
            Embedded instructional video demonstrating additions made to the website for Assignment 2.
          </figcaption>
        </figure>
      </SectionCard>
      

      {/* ---------- Lighthouse Reports (CSS-only tabs) ---------- */}
      <SectionCard id="lh-heading" title="Lighthouse Reports">
        <p style={{ marginTop: 0 }}>
          Select a report to view the full Lighthouse HTML output for the relevant page.
          <br />
          <code>public/reports/tabs-lh.html</code> &nbsp;and&nbsp; <code>public/reports/escape-lh.html</code>.
        </p>

        {/* Hidden radios control which iframe is shown */}
        <div aria-label="Lighthouse report selector">
          <input type="radio" name={group} id={idTabs} defaultChecked style={{ position: 'absolute', opacity: 0 }} />
          <input type="radio" name={group} id={idEscape} style={{ position: 'absolute', opacity: 0 }} />

          {/* Tab headers */}
          <div
            role="tablist"
            aria-label="Lighthouse reports"
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}
          >
            <label
              role="tab"
              htmlFor={idTabs}
              aria-controls="panel-tabs-report"
              style={{
                padding: '8px 12px',
                border: '1px solid var(--fg)',
                borderRadius: 8,
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              Tabs page
            </label>

            <label
              role="tab"
              htmlFor={idEscape}
              aria-controls="panel-escape-report"
              style={{
                padding: '8px 12px',
                border: '1px solid var(--fg)',
                borderRadius: 8,
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              Escape Room page
            </label>
          </div>

          {/* Panels + tiny CSS to toggle visibility without JS */}
          <style>{`
            /* Make panels stack and hide by default */
            #panel-tabs-report, #panel-escape-report { display: none; }

            /* When a radio is checked, show its panel */
            #${idTabs}:checked ~ #panel-tabs-report { display: block; }
            #${idEscape}:checked ~ #panel-escape-report { display: block; }

            /* Optional: visual state for the active tab (border-bottom accent) */
            #${idTabs}:checked ~ [role="tablist"] label[for="${idTabs}"] { border-bottom: 2px solid var(--link); }
            #${idEscape}:checked ~ [role="tablist"] label[for="${idEscape}"] { border-bottom: 2px solid var(--link); }
          `}</style>

          {/* Panel: Tabs page report */}
          <div
            id="panel-tabs-report"
            role="tabpanel"
            aria-labelledby={idTabs}
            style={{
              border: '1px solid var(--fg)',
              borderRadius: 8,
              overflow: 'hidden',
              background: 'var(--bg)',
            }}
          >
            <iframe
              title="Lighthouse report — Tabs page"
              src={tabsReportSrc}
              style={{ width: '100%', height: 640, border: 0 }}
            />
          </div>

          {/* Panel: Escape Room page report */}
          <div
            id="panel-escape-report"
            role="tabpanel"
            aria-labelledby={idEscape}
            style={{
              border: '1px solid var(--fg)',
              borderRadius: 8,
              overflow: 'hidden',
              background: 'var(--bg)',
            }}
          >
            <iframe
              title="Lighthouse report — Escape Room page"
              src={escapeReportSrc}
              style={{ width: '100%', height: 640, border: 0 }}
            />
          </div>
        </div>
      </SectionCard>
    </>
  );
}
