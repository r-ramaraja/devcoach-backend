const { MultiPromptChain, LLMChain } = require("langchain/chains");
const { OpenAI } = require("langchain/llms/openai");
const { personas } = require("./prompts");
const { PromptTemplate } = require("langchain/prompts");
const { ConversationSummaryBufferMemory } = require("langchain/memory");

require("dotenv").config();

class Agent {
  constructor() {
    this.model = new OpenAI({
      temperature: 0.9,
      modelName: "gpt-3.5-turbo",
    });

    this.chatPromptMemory = new ConversationSummaryBufferMemory({
      memoryKey: "chat_history",
      llm: this.model,
      maxTokenLimit: 100,
    });

    const default_prompt = PromptTemplate.fromTemplate(personas[1]["promptTemplate"]);
    const default_chain = new LLMChain({
      llm: this.model,
      prompt: default_prompt,
      memory: this.chatPromptMemory,
      verbose: true,
    });
    this.multiPromptChain = MultiPromptChain.fromLLMAndPrompts(this.model, {
      promptNames: personas.map((p) => p.name),
      promptDescriptions: personas.map((p) => p.description),
      promptTemplates: personas.map((p) => p.promptTemplate),
      defaultChain: default_chain,
      llmChainOpts: {
        memory: this.chatPromptMemory,
        verbose: true,
      },
    });
  }

  async chatWithUser(message) {
    try {
      const response = await this.multiPromptChain.call({
        input: message,
      });

      return response.text;
    } catch (e) {
      console.log(e);
      return {
        name: personas[1]["name"],
        role: personas[1]["role"],
        text: "Sorry, I didn't understand that. Can you rephrase your message?",
      };
    }
  }
}

module.exports = Agent;
