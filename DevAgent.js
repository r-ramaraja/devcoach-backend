const {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} = require("langchain/prompts");

const { ConversationSummaryBufferMemory } = require("langchain/memory");

const { ConversationChain } = require("langchain/chains");

const { OpenAI } = require("langchain/llms/openai");

require("dotenv").config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

class DevAgent {
  constructor(name, initialPrompt) {
    this.name = name;
    this.initialPrompt = initialPrompt; //"I want you to act as a designer in a software company. You are responsible for the designing phase in agile software development cycle. The user will discuss design decisions with you and your goal is to provide feedback and suggestions."
    this.agent_tone = "friendly";
    this.agent_characteristic = "Quiet";

    this.model = new OpenAI({
      openAIApiKey: OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo",
      temperature: 0.9,
    });

    this.chatPromptMemory = new ConversationSummaryBufferMemory({
      llm: this.model,
      maxTokenLimit: 1000,
      returnMessages: true,
    });

    this.chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        initialPrompt +
          " Your named is " +
          this.name +
          ". Your tone is " +
          this.agent_tone +
          ". Your characteristic is " +
          this.agent_characteristic
      ),
      new MessagesPlaceholder("history"),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);
  }

  async chatWithUser(inputQuestion) {
    const chain = new ConversationChain({
      llm: this.model,
      memory: this.chatPromptMemory,
      prompt: this.chatPrompt,
    });

    const res1 = await chain.predict({
      input: inputQuestion,
    });
    console.log(res1);
    await this.chatPromptMemory.saveContext({ input: inputQuestion }, { output: res1 });

    return res1;
  }
}

module.exports = DevAgent;
