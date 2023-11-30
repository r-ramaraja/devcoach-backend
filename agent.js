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
      modelName: "gpt-3.5-turbo-1106",
    });

    this.chatPromptMemory = new ConversationSummaryBufferMemory({
      memoryKey: "chat_history",
      llm: this.model,
      maxTokenLimit: 400,
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

    const developPhasePrompt = PromptTemplate.fromTemplate(personas[2].developPhasePrompt);
    this.developPhaseChain = new LLMChain({
      llm: this.model,
      prompt: developPhasePrompt,
      memory: this.chatPromptMemory,
      verbose: true,
    });
  }

  async chatWithUserInDesignPhase(message) {
    try {
      const response = await this.multiPromptChain.call({
        input: message,
      });

      return response.text;
    } catch (e) {
      console.log(e);
      return JSON.stringify({
        name: personas[1]["name"],
        role: personas[1]["role"],
        text: "Sorry, I didn't understand that. Can you rephrase your message?",
      });
    }
  }

  async getUserStory() {
    try {
      const response = await this.model.predict(personas[2].developPhaseInitialPrompt);

      await this.chatPromptMemory.saveContext(
        { input: "What's the user story?" },
        { output: response }
      );

      return JSON.stringify({
        name: personas[2]["name"],
        role: personas[2]["role"],
        text: response,
      });
    } catch (e) {
      console.log(e);
      return JSON.stringify({
        name: personas[2]["name"],
        role: personas[2]["role"],
        text: "Sorry, I didn't understand that. Can you rephrase your message?",
      });
    }
  }

  async chatWithUserInDevelopPhase(message, code) {
    try {
      const response = await this.developPhaseChain.call({
        input: `${message}\n\nHere's the code written by the novice developer:\n${code}`,
      });

      return JSON.stringify({
        name: personas[2]["name"],
        role: personas[2]["role"],
        text: response.text,
      });
    } catch (e) {
      console.log(e);
      return JSON.stringify({
        name: personas[2]["name"],
        role: personas[2]["role"],
        text: "Sorry, I didn't understand that. Can you rephrase your message?",
      });
    }
  }
}

module.exports = Agent;
