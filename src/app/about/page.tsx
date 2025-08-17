export const metadata = { title: 'CSE3CWA - About' };

export default function AboutPage() {
  return (
    <>
      <h1>About</h1>
      <section aria-labelledby="about-heading" style={{border:'1px solid #00000022', borderRadius:'10px', padding:'16px', background:'var(--card)'}}>
        <h2 id="about-heading">Author</h2>
        <p><strong>Name:</strong> Angus Arthur</p>
        <p><strong>Student Number:</strong> 21819446</p>

        <h2 id="video" style={{marginTop:'16px'}}>How to use this website</h2>
        <figure aria-labelledby="video-caption" style={{margin:0}}>
          <div
            role="img"
            aria-label="Video placeholder"
            style={{
              width: '100%', maxWidth:'720px', aspectRatio: '16 / 9',
              background: '#00000055', border: '2px dashed #00000044',
              display:'grid', placeItems:'center', borderRadius:'10px'
            }}
          >
            <span>Video coming soon</span>
          </div>
          <figcaption id="video-caption" style={{color:'var(--muted)', marginTop:'8px'}}>
            Placeholder for an instructional video.
          </figcaption>
        </figure>
      </section>
    </>
  );
}
