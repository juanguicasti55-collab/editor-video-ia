import { Composition } from "remotion";
import { Main, CTA_SECONDS } from "./video";
import { DURATION } from "./words";

export const FPS = 30;

export const Root = () => (
  <Composition
    id="Main"
    component={Main}
    durationInFrames={Math.ceil((DURATION + CTA_SECONDS) * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
