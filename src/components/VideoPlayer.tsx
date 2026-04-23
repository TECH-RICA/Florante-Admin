import React from 'react';

interface VideoPlayerProps {
  url: string;
  title?: string;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title = 'Video Player', className = '' }) => {
  const getEmbedUrl = (videoUrl: string) => {
    if (!videoUrl) return '';

    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const ytMatch = videoUrl.match(ytRegex);

    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/i;
    const vimeoMatch = videoUrl.match(vimeoRegex);

    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return videoUrl;
  };

  const embedUrl = getEmbedUrl(url);
  const isEmbeddable = embedUrl.includes('youtube.com/embed/') || embedUrl.includes('player.vimeo.com/video/');
  
  const isVideoFile = url.match(/\.(mp4|webm|ogg)$/i) || url.includes('supabase.co/storage/v1/object/public/');
  const isAudioFile = url.match(/\.(mp3|wav|ogg)$/i);

  if (isEmbeddable) {
    return (
      <div className={`video-player-wrapper ${className}`} style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
        <iframe
          src={embedUrl}
          title={title}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  if (isVideoFile && !isAudioFile) {
    return (
      <video controls className={`video-player ${className}`} style={{ width: '100%', borderRadius: '8px', maxHeight: '400px' }}>
        <source src={url} />
        Your browser does not support the video tag.
      </video>
    );
  }

  if (isAudioFile) {
    return (
      <div className={`audio-player-wrapper ${className}`} style={{ padding: '15px', background: '#f1f2f6', borderRadius: '8px' }}>
        <audio controls style={{ width: '100%' }}>
          <source src={url} />
          Your browser does not support the audio tag.
        </audio>
      </div>
    );
  }

  return (
    <div className="video-player-fallback" style={{ padding: '10px', fontSize: '12px', color: '#666' }}>
      <p>Preview not available for this link. <a href={url} target="_blank" rel="noopener noreferrer">Test Link</a></p>
    </div>
  );
};

export default VideoPlayer;
