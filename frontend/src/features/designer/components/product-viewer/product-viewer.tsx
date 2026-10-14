import { SceneController } from './scene-controller';
import type { Designer2ArtworkProps } from './artwork-decals';

export function ProductViewer(artworkProps: Designer2ArtworkProps) {
  return <SceneController {...artworkProps} />;
}
