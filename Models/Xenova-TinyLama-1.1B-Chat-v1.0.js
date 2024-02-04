const model_id = "Xenova/TinyLlama-1.1B-Chat-v1.0";
const ModelAssistantStart = "<|assistant|>";
const Default_Settings = {
    max_new_tokens: 256,
    temperature: 0.8,
    do_sample: true,
    top_k: 50,
};

const { pipeline } = import("@xenova/transformers");
let tokenizer, model = tokenizer = null;

/**
 * @param {[{role: String, content: String}]} messages 
 * @param {String} txt Text to use if no messages provided; uses default system prompt.
 * @returns {Promise<[{generated_text: String}]>} Generated result.
*/
async function Run(messages = null, txt = null, settings = null) {
    await preload();

    if (model == null)
        model = await pipeline('text-generation', model_id);
    /*
    if (model == null)
        model = await AutoModelForCausalLM.from_pretrained("microsoft/phi-2", torch_dtype="auto", trust_remote_code=true)

    if (tokenizer == null)
        tokenizer = await AutoTokenizer.from_pretrained("microsoft/phi-2", trust_remote_code=true)

    const inputs = tokenizer("Hi, how're you doing?")

    let out = model.generate(inputs, max_length=200);
    console.log(out);
    // [{'label': 'POSITIVE', 'score': 0.999817686}]
    */
    return new Promise(async (resolve) => {

        if (txt != null && messages == null) {
            messages = [
                { "role": "system", "content": "You are a friendly assistant." },
                { "role": "user", "content": txt },
            ]
        }

        // Construct the prompt
        const prompt = model.tokenizer.apply_chat_template(messages, {
            tokenize: false, add_generation_prompt: true,
        });

        // Generate a response
        if (settings == null) {
            settings = Default_Settings
        }
        const result = await model(prompt, settings);

        resolve(result);
    })

    /*
    const output = await model(txt, {
        temperature: 2,
        max_new_tokens: 100,
        repetition_penalty: 1.5
    });
    console.log(output);
    */
};

// Temp Test:
async function TempTest() {
    let sumOutput = "";
    for (let i = 0.1; i <= 2; i += 0.1) {
        const settings = Default_Settings;
        settings.temperature = i;
        
        const result = await Run(null, "What do you think of Japan?", null, settings);
        let LatestMessage = result[0].generated_text;
        LatestMessage = LatestMessage.substring(LatestMessage.lastIndexOf(ModelAssistantStart) + ModelAssistantStart.length + 1)
        const output = `\n# Temp: ${settings.temperature}\n${LatestMessage}`;
        sumOutput += output;
        console.log(output);
    }
    fs.writeFile("TempTest.md", sumOutput, (e) => {if (e) console.log(e)});
}
// TempTest();

async function preload() {
    return new Promise(async res => {
        const { pipeline } = await import("@xenova/transformers");
        if (model == null)
            model = await pipeline('text-generation', model_id);

        res();
    })
}

module.exports = {
    model_id, ModelAssistantStart, Default_Settings, Run, preload, TempTest
}