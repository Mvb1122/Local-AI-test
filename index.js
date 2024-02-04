const model_id = "Xenova-TinyLama-1.1B-Chat-v1.0";
    // Felladrin-onnx-gpt2-large-conversational-retrain
    // Xenova-TinyLama-1.1B-Chat-v1.0

/**
 * @type {{ 
 * model_id: String, 
 * ModelAssistantStart: String, 
 * Default_Settings: {{ max_new_tokens: number, temperature: number, do_sample: boolean, top_k: number}}, 
 * Run: (property), 
 * preload: (property), 
 * }}
 */
const ModelHelper = require(`./Models/${model_id}`)

const SystemInfo = "You are a helpful assistant. Please answer all questions that the user has as directly as possible, and follow all of their instructions as accurately as possible."
const UserInfo = "The user is Micah, a cute girl, whose pronouns are she/her."

const ModelAssistantStart = ModelHelper.ModelAssistantStart;
const Default_Settings = ModelHelper.Default_Settings;
const Run = ModelHelper.Run;
const preload = ModelHelper.preload;

/**
 * @param {"system" | "user" | "assistant"} role 
 * @param {String} content 
 * @returns {{role: String, content: String}} Message object
*/
function message(role, content) {
    return { role: role, content: content }
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
        message("system", SystemInfo),
        message("system", UserInfo)
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