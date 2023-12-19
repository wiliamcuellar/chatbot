const openAi = require("openai");
const {promises: fs} = require("fs");
require('dotenv').config();

const openai = new openAi({
    apiKey: process.env.OPENAI_API_KEY
});

async function query(prompt) {
    const context = await fs.readFile('budget.csv', 'utf8');
    const completion = await openai.chat.completions.create({
        messages: [{
            role: "system",
            content: context
        },{
            role: "user",
            content: prompt
        }
        ],
        model: "gpt-3.5-turbo",
    });
    return completion.choices[0].message.content;
}
module.exports = {query};
