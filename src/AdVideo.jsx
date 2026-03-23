import { AbsoluteFill, Img, Audio } from "remotion";
import { staticFile } from "remotion";
export const AdVideo = ({ productName, price, image,audio }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial",
      }}
    >
       {audio && (
        <Audio
          src={audio}
          volume={1}
          startFrom={0}
        />
      )}
      <Img
        src={image.includes("/uploads/") ? `file://${image}` : image}
        style={{ width: 500, borderRadius: 20 }}
      />

      <h1>{productName}</h1>

      <h2 style={{ color: "green" }}>${price}</h2>
    </AbsoluteFill>
  );
};