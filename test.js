import { client } from "@gradio/client";
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url);
global.EventSource = require('eventsource');

async function generateImage(prompt) {
  const app = await client("hysts/SDXL");
  const result = await app.predict("/run", [
    prompt, // string  in 'Prompt' Textbox component
    "Hello!!", // string  in 'Negative prompt' Textbox component
    "Hello!!", // string  in 'Prompt 2' Textbox component
    "Hello!!", // string  in 'Negative prompt 2' Textbox component
    true, // boolean  in 'Use negative prompt' Checkbox component
    true, // boolean  in 'Use prompt 2' Checkbox component
    true, // boolean  in 'Use negative prompt 2' Checkbox component
    0, // number (numeric value between 0 and 2147483647) in 'Seed' Slider component
    256, // number (numeric value between 256 and 1024) in 'Width' Slider component
    256, // number (numeric value between 256 and 1024) in 'Height' Slider component
    1, // number (numeric value between 1 and 20) in 'Guidance scale for base' Slider component
    1, // number (numeric value between 1 and 20) in 'Guidance scale for refiner' Slider component
    10, // number (numeric value between 10 and 100) in 'Number of inference steps for base' Slider component
    10, // number (numeric value between 10 and 100) in 'Number of inference steps for refiner' Slider component
    true, // boolean  in 'Apply refiner' Checkbox component
  ]);

  return "https://hysts-sdxl.hf.space/file=" + result.data;
}

generateImage(
  "a woman at the beach, bikini, large breasts, pregnant woman, oil paiting",
);
