import React from 'react';

const VideoSection: React.FC<{ props: Record<string, any> }> = ({ props }) => {
  const { device } = props;
  const isMobile = device === 'mobile';

  const heading = props.heading ?? 'See it in Action';
  const description = props.description ?? 'Watch how our products transform everyday spaces into extraordinary experiences.';
  const videoUrl = props.videoUrl ?? 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  const bgColor = props.bgColor || props.backgroundColor || 'var(--theme-bg-section, var(--theme-background))';
  const headingColor = props.headingColor || 'var(--theme-text-heading)';
  const textColor = props.textColor || 'var(--theme-text-body)';

  // Convert youtube/vimeo URLs to embed URLs
  let embedUrl = videoUrl;
  if (videoUrl.includes('youtube.com/watch')) {
    const videoId = videoUrl.split('v=')[1]?.split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (videoUrl.includes('youtu.be/')) {
    const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (videoUrl.includes('vimeo.com/') && !videoUrl.includes('player.vimeo.com')) {
    const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
    embedUrl = `https://player.vimeo.com/video/${videoId}`;
  }

  return (
    <section style={{
      width: '100%',
      backgroundColor: bgColor,
      background: bgColor,
      position: 'relative',
      overflow: 'hidden',
      ...props._marginStyle,
    }}>
      <div style={{
        padding: isMobile ? '40px 24px' : '80px 48px',
        textAlign: 'center',
        maxWidth: props._layoutWidth ?? '100%',
        margin: '0 auto',
        ...props._paddingStyle,
      }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '40px' }}>
        <h2 style={{
          fontSize: isMobile ? '32px' : '40px',
          fontWeight: 700,
          letterSpacing: '-1px',
          color: headingColor,
          marginBottom: '16px',
          fontFamily: 'var(--theme-font-heading), sans-serif',
        }}>
          {heading}
        </h2>
        <p style={{
          fontSize: '17px',
          lineHeight: 1.6,
          color: textColor,
          opacity: 0.85,
        }}>
          {description}
        </p>
      </div>
      <div style={{
        maxWidth: '960px',
        margin: '0 auto',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
        aspectRatio: '16/9',
        backgroundColor: '#0f172a',
      }}>
        <iframe
          src={embedUrl}
          title={heading}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      </div>
    </section>
  );
};

export default VideoSection;
