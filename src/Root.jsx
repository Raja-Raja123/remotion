import { Composition } from "remotion";
import { ThemeModern } from "./themes/ThemeModern/ThemeModern";
import { ThemeDynamic } from "./themes/ThemeDynamic/ThemeDynamic";
import { ThemeRetro } from "./themes/ThemeRetro/ThemeRetro";
import { ThemeCinematic } from "./themes/ThemeCinematic/ThemeCinematic";

export const RemotionRoot = () => {

  return (
    <>
      <Composition
        id="ThemeModern"
        component={ThemeModern}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="ThemeDynamic"
        component={ThemeDynamic}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="ThemeRetro"
        component={ThemeRetro}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="ThemeCinematic"
        component={ThemeCinematic}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );

};