import React, { useEffect, useMemo, useRef, useState } from 'react';

export type StorefrontPreviewDevice = 'desktop' | 'tablet' | 'mobile' | 'custom';

interface StorefrontPreviewViewportProps {
  children: React.ReactNode;
  device?: StorefrontPreviewDevice;
  customWidth?: number;
  className?: string;
  frameClassName?: string;
  minHeight?: number | string;
  desktopMaxWidth?: number | string;
  stageStyle?: React.CSSProperties;
  frameStyle?: React.CSSProperties;
  onClickCapture?: React.MouseEventHandler<HTMLDivElement>;
  disableScaling?: boolean;
}

const getPixelWidth = (device: StorefrontPreviewDevice, customWidth: number): number | null => {
  if (device === 'mobile') return 375;
  if (device === 'tablet') return 768;
  if (device === 'custom') return Math.max(300, Math.min(1440, Math.round(customWidth)));
  return null;
};

/**
 * Shared responsive preview viewport for the Store Editor canvas, standalone
 * preview surfaces and future page-specific preview entry points.
 *
 * Device dimensions are logical CSS viewport widths. When a device is wider
 * than the available stage, the frame is scaled down without changing its
 * internal responsive breakpoint.
 */
export const StorefrontPreviewViewport: React.FC<StorefrontPreviewViewportProps> = ({
  children,
  device = 'desktop',
  customWidth = 1024,
  className = '',
  frameClassName = '',
  minHeight = '100%',
  desktopMaxWidth = 1280,
  stageStyle = {},
  frameStyle = {},
  onClickCapture,
  disableScaling = false
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(1200);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateWidth = () => setStageWidth(stage.clientWidth || 1200);
    updateWidth();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateWidth);
      observer.observe(stage);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const logicalWidth = getPixelWidth(device, customWidth);
  const scale = useMemo(() => {
    if (disableScaling || logicalWidth === null || stageWidth <= 0) return 1;
    return Math.min(1, Math.max(0.1, (stageWidth - 32) / logicalWidth));
  }, [disableScaling, logicalWidth, stageWidth]);

  const frameDimensions: React.CSSProperties = logicalWidth === null
    ? { width: '100%', maxWidth: desktopMaxWidth }
    : { width: `${logicalWidth}px`, maxWidth: 'none' };

  return (
    <div
      ref={stageRef}
      className={className}
      style={{
        width: '100%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflow: 'auto',
        boxSizing: 'border-box',
        ...stageStyle
      }}
    >
      <div
        className={frameClassName}
        onClickCapture={onClickCapture}
        style={{
          ...frameDimensions,
          minHeight,
          flexShrink: 0,
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          transition: 'transform 160ms ease, width 160ms ease',
          boxSizing: 'border-box',
          ...frameStyle
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default StorefrontPreviewViewport;
