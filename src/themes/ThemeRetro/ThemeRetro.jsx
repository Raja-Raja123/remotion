import {AbsoluteFill, useVideoConfig} from "remotion";
import {MediaRenderer} from "../../shared/MediaRenderer";
import {AnimatedText} from "../../shared/AnimatedText";
import { BackgroundMusic } from "../../shared/BackgroundMusic";

export const ThemeRetro = ({
  title,
  brand,
  price,
  images,
  video,
  audio
}) => {

  const {durationInFrames} = useVideoConfig();
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor:"#f5deb3",
        fontFamily:"Courier New"
      }}
    >


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
        <AnimatedText text={brand} size={70} color="green"/>
        <AnimatedText text={price} size={70} color="green"/>
        <AnimatedText text={title} size={90} color="green"/>
      </div>

    </AbsoluteFill>
  );
};