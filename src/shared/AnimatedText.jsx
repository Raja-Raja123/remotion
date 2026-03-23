import {useCurrentFrame, interpolate} from "remotion";

export const AnimatedText = ({text,size=60}) => {

  const frame = useCurrentFrame();
  
  const opacity = interpolate(frame,[0,20],[0,1]);

  const translateY = interpolate(frame,[0,20],[80,0]);

  return (
    <div
      style={{
        fontSize:size,
        color:"green",
        textAlign:"center",
        opacity,
        transform:`translateY(${translateY}px)`
      }}
    >
      {text}
    </div>
  );
};