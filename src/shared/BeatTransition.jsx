import { Sequence } from "remotion";

export const BeatTransition = ({ index, children }) => {

  return (
    <Sequence
      from={index * 30}
      durationInFrames={30}
    >
      {children}
    </Sequence>
  );

};