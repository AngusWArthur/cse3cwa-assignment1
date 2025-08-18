export const metadata = { title: 'CSE3CWA - About' };

export default function AboutPage() {
  return (
    <>
      <h1>About</h1>

      <section
        aria-labelledby="about-heading"
        style={{
          border: '1px solid var(--fg)',
          borderRadius: '10px',
          padding: '16px',
          background: 'var(--card)',
          color: 'var(--fg)',
        }}
      >
        <h2 id="about-heading">Author</h2>
        <p><strong>Name:</strong> Angus Arthur</p>
        <p><strong>Student Number:</strong> 21819446</p>

        <h2 id="video" style={{ marginTop: '16px' }}>How to use this website</h2>

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
      </section>
    </>
  );
}
