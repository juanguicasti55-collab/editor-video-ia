import { Composition } from "remotion";
import { Main } from "./video";
import { DURATION } from "./words";

export const FPS = 30;

export const Root = () => (
  <Composition
    id="Main"
    component={Main}
    durationInFrames={Math.ceil(DURATION * FPS)}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
