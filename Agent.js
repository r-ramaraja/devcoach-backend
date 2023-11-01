const { MultiPromptChain, LLMChain } = require("langchain/chains");
const { OpenAI } = require("langchain/llms/openai");
const { personas } = require("./prompts");
const { PromptTemplate } = require("langchain/prompts");

require("dotenv").config();

class Agent {
  constructor() {
    this.model = new OpenAI({
      temperature: 1.0,
      modelName: "gpt-3.5-turbo",
    });

    const default_prompt = PromptTemplate.fromTemplate(personas[1]["promptTemplate"]);
    const default_chain = new LLMChain({ llm: this.model, prompt: default_prompt });
    this.multiPromptChain = MultiPromptChain.fromLLMAndPrompts(this.model, {
      promptNames: personas.map((p) => p.name),
      promptDescriptions: personas.map((p) => p.description),
      promptTemplates: personas.map((p) => p.promptTemplate),
      defaultChain: default_chain,
    });
  }

  async chatWithUser(message) {
    const response = await this.multiPromptChain.call({
      input: message,
    });

    return response.text;
  }
}

module.exports = Agent;
