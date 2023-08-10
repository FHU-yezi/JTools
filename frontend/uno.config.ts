import presetRemToPx from "@unocss/preset-rem-to-px";
import {
  defineConfig,
  presetWind,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  presets: [presetRemToPx(), presetWind()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
