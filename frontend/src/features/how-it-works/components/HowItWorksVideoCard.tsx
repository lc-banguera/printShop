import { ExternalLink, Play } from 'lucide-react';
import * as React from 'react';
import { Link } from 'react-router-dom';
import type { HowItWorksVideo } from '../data/how-it-works.data';

export function HowItWorksVideoCard({ video }: { video: HowItWorksVideo }) {
  const [thumbnailUnavailable, setThumbnailUnavailable] = React.useState(false);

  return (
    <article className="how-it-works-video-card">
      <a className="how-it-works-video-media" href={video.url} target="_blank" rel="noreferrer" aria-label={`Ver ${video.title} en YouTube`}>
        {thumbnailUnavailable ? (
          <div className="how-it-works-video-fallback" aria-hidden="true"><Play /></div>
        ) : (
          <img
            src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            onError={() => setThumbnailUnavailable(true)}
          />
        )}
        <span className="how-it-works-video-play" aria-hidden="true"><Play fill="currentColor" /></span>
      </a>
      <div className="how-it-works-video-body">
        <p className="how-it-works-eyebrow">{video.topic}</p>
        <h3>{video.title}</h3>
        <p className="how-it-works-video-description">{video.description}</p>
        <p className="how-it-works-video-channel">Canal: {video.channel}</p>
        <div className="how-it-works-video-actions">
          <a className="how-it-works-button how-it-works-button-primary" href={video.url} target="_blank" rel="noreferrer">
            Ver en YouTube <ExternalLink aria-hidden="true" />
          </a>
          <Link className="how-it-works-text-link" to={`/como-funciona/documentacion/${video.articleSlug}`}>
            Ver más detalles
          </Link>
        </div>
      </div>
    </article>
  );
}
