import {Img, useCurrentFrame, interpolate} from "remotion";

export const KenBurnsImage = ({src}) => {

  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0,120], [1,1.15]);

  return (
    <Img
      src={src}
      style={{
        width: "100%",
        transform: `scale(${scale})`
      }}
    />
  );
};