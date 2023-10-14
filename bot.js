/* eslint-disable */
const { ActivityHandler, MessageFactory } = require('botbuilder');
const axios = require('axios');

const OPENAI_RESOURCE = process.env.OPENAI_RESOURCE;
const OPENAI_DEPLOYMENT = process.env.OPENAI_DEPLOYMENT;
const OPENAI_API_VERSION = process.env.OPENAI_API_VERSION;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_COMPLETION_URL = `https://${OPENAI_RESOURCE}.openai.azure.com/openai/deployments/${OPENAI_DEPLOYMENT}/chat/completions?api-version=${OPENAI_API_VERSION}`;

var getCompletion = async function (text) {
  var data = {
    messages: [
      {
        role: 'user',
        content: text,
      },
    ],
  };
  var res = await axios({
    method: 'post',
    url: OPENAI_COMPLETION_URL,
    headers: {
      'Content-Type': 'application/json',
      'api-key': OPENAI_API_KEY,
    },
    data,
  });
  return (res.data.choices[0] || []).message?.content;
};

class EchoBot extends ActivityHandler {
  constructor() {
    super();
    this.onMessage(async (context, next) => {
      try {
        const replyText = await getCompletion(context.activity.text);
        await context.sendActivity(replyText);
      } catch (error) {
        console.log(
          '🚀 ~ file: bot.js:43 ~ EchoBot ~ this.onMessage ~ error:',
          error.message
        );
      }
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      const welcomeText = 'Hello and welcome!';
      for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
        if (membersAdded[cnt].id !== context.activity.recipient.id) {
          await context.sendActivity(
            MessageFactory.text(welcomeText, welcomeText)
          );
        }
      }
      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }
}

module.exports.EchoBot = EchoBot;
