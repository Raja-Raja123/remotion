import {AbsoluteFill, useVideoConfig} from "remotion";
import {MediaRenderer} from "../../shared/MediaRenderer";
import {AnimatedText} from "../../shared/AnimatedText";
import {BackgroundMusic} from "../../shared/BackgroundMusic";

export const ThemeDynamic = ({
  title,
  images,
  video,
  audio
}) => {

  const {durationInFrames} = useVideoConfig();

  return (
    <AbsoluteFill>

      <BackgroundMusic audio={audio} />

      <MediaRenderer
        images={images}
        video={video}
        durationInFrames={durationInFrames}
      />

      <div
        style={{
          position:"absolute",
          bottom:160,
          width:"100%"
        }}
      >
        <AnimatedText text={title} size={80}/>
      </div>

    </AbsoluteFill>
  );
};