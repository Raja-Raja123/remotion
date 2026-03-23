import {AbsoluteFill, Video, Sequence} from "remotion";
import {KenBurnsImage} from "./KenBurnsImage";

export const MediaRenderer = ({images = [], video, durationInFrames}) => {

  if (video) {
    return (
      <Video
        src={video}
        style={{width: "100%", height: "100%"}}
      />
    );
  }

  const validImages = images.slice(0,6);

  const framePerImage = Math.floor(durationInFrames / validImages.length);

  return (
    <AbsoluteFill>
      {validImages.map((img, index) => (
        <Sequence
          key={index}
          from={index * framePerImage}
          durationInFrames={framePerImage}
        >
          <KenBurnsImage src={img} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};