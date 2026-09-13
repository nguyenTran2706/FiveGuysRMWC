import { useEffect, useState } from 'react';

// Decode only this scene and its immediate branches, not the whole image library.
const decodedImages = new Map<string, Promise<void>>();
function loadImage(src: string): Promise<void> {
  const cached = decodedImages.get(src);
  if (cached) return cached;
  const image = new Image();
  const promise = new Promise<void>((resolve, reject) => {
    image.onload = () => { void image.decode().then(resolve, resolve); };
    image.onerror = () => reject(new Error('Scene image unavailable'));
    image.src = src;
  }).catch(error => { decodedImages.delete(src); throw error; });
  decodedImages.set(src, promise);
  return promise;
}

type Props = { src: string; fallback: string; preload: string[]; reducedMotion: boolean };
type Frame = { current: string; previous?: string };

export function ConversationBackdrop({ src, fallback, preload, reducedMotion }: Props) {
  const [frame, setFrame] = useState<Frame>({ current: fallback });
  useEffect(() => {
    let currentRequest = true;
    void loadImage(src).then(() => {
      if (currentRequest) setFrame(old => old.current === src ? old : {
        current: src, previous: reducedMotion ? undefined : old.current,
      });
    }).catch(() => {
      // A missing/offline image must never block the conversation.
      if (currentRequest) setFrame({ current: fallback });
    });
    return () => { currentRequest = false; };
  }, [src, fallback, reducedMotion]);
  const preloadKey = preload.join('|');
  useEffect(() => {
    for (const image of preloadKey.split('|').filter(Boolean)) void loadImage(image).catch(() => {});
  }, [preloadKey]);
  useEffect(() => {
    if (!frame.previous) return;
    const timeout = setTimeout(() => setFrame(old => ({ current: old.current })), 450);
    return () => clearTimeout(timeout);
  }, [frame.current, frame.previous]);

  return <div className="conversation-backdrop" aria-hidden="true" data-requested-scene={src}>
    {frame.previous && <img className="game-image game-image-previous" src={frame.previous} alt="" width="1600" height="900" />}
    <img key={frame.current} className="game-image game-image-current" data-scene={frame.current} src={frame.current} alt="" width="1600" height="900" />
  </div>;
}
