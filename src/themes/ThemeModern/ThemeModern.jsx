import {AbsoluteFill, useVideoConfig} from "remotion";
import {MediaRenderer} from "../../shared/MediaRenderer";
import {BackgroundMusic} from "../../shared/BackgroundMusic";
import {AnimatedText} from "../../shared/AnimatedText";

export const ThemeModern = ({
  title,
  brand,
  price,
  images,
  video,
  audio
}) => {

  const {durationInFrames} = useVideoConfig();

  return (
    <AbsoluteFill style={{backgroundColor:"#111"}}>

      <BackgroundMusic audio={audio} />

      <MediaRenderer
        images={images}
        video={video}
        durationInFrames={durationInFrames}
      />

      <div
        style={{
          position:"absolute",
          bottom:200,
          width:"100%"
        }}
      >
        <AnimatedText text={`${brand} ${title}`} size={70}/>
        <AnimatedText text={`₹${price}`} size={90}/>
      </div>

    </AbsoluteFill>
  );
};