const model_id = "Xenova/gpt2";
const ModelAssistantStart = "<|ASSISTANT|>";
const ModelUserStart = "<|USER|>"
const Default_Settings = {
    max_new_tokens: 256,
    temperature: 2, 
    top_k: 50, 
    top_p: 80,
    
};

const { pipeline } = import("@xenova/transformers");

/**
 * @type {GPT2Tokenizer}
 */
let tokenizer, 
/**
 * @type {GPT2LMHeadModel}
 */
model 
= tokenizer = null;

/**
 * @param {[{role: String, content: String}]} messages 
 * @param {String} txt Text to use if no messages provided; uses default system prompt.
 * @returns {Promise<[{generated_text: String}]>} Generated result.
*/
async function Run(messages = null, txt = null, settings = null) {
    await preload();

    return new Promise(async (resolve) => {

        if (txt != null && messages == null) {
            messages = [
                { "role": "system", "content": "You are a friendly assistant." },
                { "role": "user", "content": txt },
            ]
        }

        // Construct the prompt
        let prompt = ""
        messages.forEach(message => {
            let prefix = ""
            switch (message.role) {
                case "user":
                    prefix = ModelUserStart
                    break;
                case "system": 
                    prefix = ModelUserStart
                    break;
                case "assistant":
                    prefix = ModelAssistantStart
                    break;
            }

            prompt += `${prefix} ${message.content}\n`;
        })

        prompt += ModelAssistantStart;

        // const input = await tokenizer.encode(prompt, null, { add_special_tokens: true });
        
        // Generate a response
        if (settings == null) {
            settings = Default_Settings
        }

        // const output = await model.generate(input, settings);
        console.log(prompt);
        const output = await model(prompt, settings);
        console.log(output);
        // const result = tokenizer.decode(output, { skip_special_tokens: false })
        
        resolve(output);
    })
};

async function preload() {
    return new Promise(async res => {
        const { pipeline } = await import("@xenova/transformers");
        if (model == null || tokenizer == null) {
            model = await pipeline("text-generation", model_id)
            // model = await GPT2LMHeadModel.from_pretrained(model_id)
            // tokenizer = await GPT2Tokenizer.from_pretrained(model_id)
            res(true);
        }

        res(false);
    })
}

module.exports = {
    model_id, ModelAssistantStart, Default_Settings, Run, preload
}