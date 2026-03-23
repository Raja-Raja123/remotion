import {AbsoluteFill, useVideoConfig} from "remotion";
import {MediaRenderer} from "../../shared/MediaRenderer";
import {AnimatedText} from "../../shared/AnimatedText";
import {BackgroundMusic} from "../../shared/BackgroundMusic";

export const ThemeCinematic = ({
  title,
  brand,
  images,
  video,
  audio
}) => {
  
  const {durationInFrames} = useVideoConfig();

  return (
    <AbsoluteFill style={{backgroundColor:"#000"}}>

      <BackgroundMusic audio={audio} />

      <MediaRenderer
        images={images}
        video={video}
        durationInFrames={durationInFrames}
      />

      <div
        style={{
          position:"absolute",
          bottom:180,
          left:80
        }}
      >
        <AnimatedText text={brand} size={90}/>
        <AnimatedText text={title} size={60}/>
      </div>

    </AbsoluteFill>
  );
};