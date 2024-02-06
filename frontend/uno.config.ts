import presetRemToPx from "@unocss/preset-rem-to-px";
import {
  defineConfig,
  presetIcons,
  presetWind,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  presets: [presetRemToPx(), presetWind(), presetIcons()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
