import React, { useState } from 'react'
import Contact from '../components/Contact'
import "../styles/Archive.css"

const PLAYLISTS = [
  {
    title: "Studio Spring 2026",
    embed: "https://samply.app/embed/ab67607a-3310-468e-8e69-ed565f0a5173",
    link: "https://samply.app/p/ab67607a-3310-468e-8e69-ed565f0a5173?si=k3euYFRVqnZafBWdmMda6cbr3862",
  },
  {
    title: "JanPlan 2026",
    embed: "https://samply.app/embed/25f7c329-a48d-4a69-8dd9-2d870ac11fc4",
    link: "https://samply.app/p/25f7c329-a48d-4a69-8dd9-2d870ac11fc4?si=k3euYFRVqnZafBWdmMda6cbr3862",
  },
]

const NEWS = [
    {
        title: "The Mixing Club and Studio Is One of Colby’s Best-Kept Secrets",
        source: "Colby Echo",
        author: "William Maasbach",
        date: "October 22, 2026",
        link: "https://colbyecho.news/2026/10/22/the-mixing-club-and-studio-is-one-of-colbys-best-kept-secrets/",
        summary: "Colby’s Mixing Club and the recording studio in the basement of the Gordon Center give any student a way into music production, whether they’re a complete beginner or already releasing albums. Once open only to trained students, the studio is now available to anyone who books a two-to-four-hour session through QR codes on posters around campus. Each session is supervised by a paid student manager who was trained in a JanPlan course and brings their own genre specialty, and the managers are trained in Pro Tools, Ableton and Logic. Beyond studio time, the club meets every Monday at 4:30 p.m., when audio engineering instructor Alex Fulton leads the group in breaking down a popular song to learn techniques like reverb and chord changes. As club member Rafi Aronson ‘27 puts it, the studio has become a hub where student artists learn from each other, and the writer encourages all Colby students to try a session, with no judgment involved."
    },
    {
        title: "Bringing Songs to Life in Colby’s New Mixdown Studio",
        source: "Colby News",
        author: "Abigail Curtis",
        date: "February 14, 2025",
        link: "https://news.colby.edu/story/bringing-songs-to-life-in-colbys-new-mixdown-studio/",
        summary: "During Jan Plan, Colby students in the new Music Production course wrote, performed, engineered and recorded original songs in the Mixdown Studio, the state-of-the-art studio on the lower level of the Gordon Center for Creative and Performing Arts. The course filled within three hours of opening for registration. It is taught by Alex Fulton, a Waterville-based sound engineer and producer who runs Fulton Street Media Group, works as the studio’s “mixmaster,” and believes music education should be accessible to everyone. Fulton also started a studio manager program to train students to engineer each other’s projects. Over the month, students from majors like biology, computer science and psychology learned Pro Tools, worked through late-night troubleshooting sessions and began to think like real engineers. One group, led by singer-songwriter Cecilia Treadwell ‘26 with first-year Zoe Paley ‘28 engineering, recorded “Wildest Haze,” a bluesy love song Treadwell had written. For students like Treadwell, the course didn’t feel like homework: it was a collaborative, creative outlet and a reminder to make time for what they love.",
    },
]

function NewsItem({ item }) {
  const [open, setOpen] = useState(false)

  return (
    <li className="news-item">
      <time className="news-item__date">{item.date}</time>

      <article className="news-item__body">

        <h3 className="news-item__title">
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            {item.title}
          </a>
        </h3>

        <p className="news-item__byline">By {item.author} ({item.source})</p>

        <p className={`news-item__summary ${open ? "is-open" : ""}`}>
          {item.summary}
        </p>

        <div className="news-item__actions">
          <button
            type="button"
            className="news-item__toggle"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            {open ? "Show less" : "Read more"}
          </button>

          <a
            className="news-item__link"
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Full story on {item.source} ↗
          </a>
        </div>
      </article>
    </li>
  )
}



function Archive() {
  return (
    <div>
        <div className='archive-page'>
        <header className="archive-hero">
            <p className="archive-kicker">The Studio at Colby Archive</p>
            <h1 className="archive-title">
            The Studio at Colby <span>ARCHIVE</span>
            </h1>
            <p className="archive-lede">
            Explore this page to see our featrured news articles and the full archive of songs made in the studio. 
            </p>
        </header>

        <section className="archive-section" aria-labelledby="news-heading">
            <div className="archive-label">
                <h2 id="news-heading">In the news</h2>
            </div>

            <ol className="news-list">
                {NEWS.map((item) => (
                <NewsItem key={item.link} item={item} />
                ))}
            </ol>
        </section>

        <section className="archive-section" aria-labelledby="tracks-heading">
        <div className="archive-label">
            <h2 id="tracks-heading">Featured tracks</h2>
        </div>

        <ul className="playlist-list">
            {PLAYLISTS.map((p) => (
            <li key={p.embed} className="playlist">
                <div className="playlist__head">
                <h3 className="playlist__title">{p.title}</h3>
                <a
                    className="news-item__link"
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Open in Samply ↗
                </a>
                </div>

                <iframe
                className="playlist__frame"
                src={p.embed}
                title={`${p.title} playlist`}
                loading="lazy"
                allow="autoplay; clipboard-write"
                />
            </li>
            ))}
        </ul>
        </section>
        </div>
        <Contact />
    </div>
  )
}

export default Archive