global.EventSource = require("eventsource");
global.window = {
  setTimeout: function (callback, time, smth) {
    return global.setTimeout(callback, time, smth);
  },
  location: {
    hostname: "chat.totob12.com",
  },
};

async function generate_image(prompt) {
  const { Client } = await import("@gradio/client");

  const app = await Client.connect("https://hysts-SDXL.hf.space/run");
  console.log(77);
  const result = await app.predict("/run", [
      prompt, // prompt
      "Hello!!", // negative prompt
      "Hello!!", // prompt 2
      "Hello!!", // negative prompt 2
      false, // negative prompt?
      false, // prompt 2?
      false, // negative prompt 2?
      7, // seed
      1024, // width
      1024, // height
      5, // base guidance scale
      5, // refiner guidance scale
      25, // base inference steps
      25, // refiner inference steps
      false, // refiner?
  ]);
  console.log(99)
  console.log(result)
  const url = result.data[0].url.toString();
  return { url: url };
}

generate_image("a cute dog");