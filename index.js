const model_id = "Xenova/TinyLlama-1.1B-Chat-v1.0";
const ModelAssistantStart = "<|assistant|>";
const Default_Settings = {
    max_new_tokens: 256,
    temperature: 0.8,
    do_sample: true,
    top_k: 50,
};


const { pipeline } = import("@xenova/transformers");


/**
 * @param {"system" | "user" | "assistant"} role 
 * @param {String} content 
 * @returns {{role: String, content: String}} Message object
*/
function message(role, content) {
    return { role: role, content: content }
}

let tokenizer, model = tokenizer = null;
/**
 * 
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

const fs = require('fs');
async function ActiveSession() {
    preload()
    console.clear();
    console.log("Beginning active session:");
    const readline = require('readline').createInterface({
        input: process.stdin,
    });
    
    // const testFile = fs.readFileSync("Test.md").toString();
    let messages = [
        message("system", "You are a helpful assistant. Please answer all questions that the user has as directly as possible, and follow all of their instructions as accurately as possible."),
        message("system", "The user is Micah, a cute girl, whose pronouns are she/her.")
        /* message("system", "Given text: \n" + testFile) */
    ]

    let ConvoId = Math.floor(Math.random() * 100000);

    do {
        const promise = new Promise(res => {
            console.log("User: ")
            readline.question('', async ans => {
                if (ans.trim().toLowerCase() == "new") return res(false);
                else if (ans.startsWith("rec")) {
                    const Id = ans.substring(3).trim();
                    const Path = `./Past Convos/${Id}.json`;
                    // Recover Convo by loading messages in.
                    if (fs.existsSync(Path)) {
                        const data = fs.readFileSync(Path);
                        messages = JSON.parse(data);
                        ConvoId = Id;
                        return res(true);
                    } else {
                        console.log("Invalid ConvoId.");
                        return res(true);
                    }
                }
                
                let Length = ans.match(/max=\d+/);
                let settings = Default_Settings;
                if (Length != null) {
                    ans = ans.replace(Length[0], "");
                    settings.max_new_tokens = Length[0].substring(4);
                }
                
                messages.push(message("user", ans));
                const result = await Run(messages, null, settings);
                WriteMessages();
                let LatestMessage = result[0].generated_text;
                LatestMessage = LatestMessage.substring(LatestMessage.lastIndexOf(ModelAssistantStart) + ModelAssistantStart.length)
                messages.push(message("assistant", LatestMessage))
                console.log(`\nAI: ${LatestMessage}\n`);
                res(true)
            });
        })
        if (!await promise) {
            setTimeout(() => {
                console.log("Last ConvoId: " + ConvoId)
            }, 300);
            WriteMessages();
            return ActiveSession();
        }
    } while (true);

    function WriteMessages() {
        if (!fs.existsSync("./Past Convos/")) fs.mkdirSync("./Past Convos/");
        
        fs.writeFile(`./Past Convos/${ConvoId}.json`, JSON.stringify(messages), (e) => {
            if (e) console.log(e);
        });
    }
}
ActiveSession();

module.exports = {message, Run, ActiveSession, ModelAssistantStart}