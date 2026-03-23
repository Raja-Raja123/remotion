import { Audio, useVideoConfig } from "remotion";

export const BackgroundMusic = ({ audio }) => {
  const { durationInFrames } = useVideoConfig();

  if (!audio) return null;

  return (
    <Audio
      src={audio}
      volume={0.8}
      startFrom={0}
      endAt={durationInFrames}
    />
  );
};