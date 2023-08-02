import {
  defineConfig,
  presetWind,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  presets: [presetWind()],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
});
