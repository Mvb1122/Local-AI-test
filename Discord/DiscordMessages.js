const index = require("../index");
const message = index.message;
const Run = index.Run;

const fs = require('fs');

function GetMessages() {
    const data = fs.readFileSync("./Discord/DiscordData.txt").toString().split("\n");
    const messages = [];

    data.forEach(line => {
        messages.push(message("user", line.replace("\n", "")));
    })

    return messages;
}

async function Test() {
    let messages = GetMessages();
    messages.push(message("system", "You are a helpful assistant, answer all of the user's questions."));
    messages.push(message("user", "Who are the two people in this chat?"));

    messages = messages.slice(messages.length - 48);

    let value = await Run(messages)
    messages.push(message("assistant", value[0].generated_text))
    
    messages.push(message("user", "What are they talking about? Please summarize all topics."));
    value = await Run(messages);
    messages.push(message("assistant", value[0].generated_text))
    fs.writeFile("Output.txt", JSON.stringify(messages), (e) => {if (e) console.log(e)});
}

module.exports = {GetMessages, Test}