import ai from "./config/gemini.js";

async function main() {
  try {
    const pager = await ai.models.list();

    for await (const model of pager) {
      console.log(model.name);
    }
  } catch (err) {
    console.error(err);
  }
}

main();