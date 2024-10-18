import type {AiProvider} from "./ai-provider";
import {generateText, LanguageModel} from "ai"
import {createOpenRouter, OpenRouterProvider} from "@openrouter/ai-sdk-provider";
import {loadConfig, saveConfig} from "../utils/config.js";


export class OpenRouter implements AiProvider {
  name = 'openrouter';
  apiKey?: string | undefined;
  apiKeyRequired = true;
  apiKeyHelpUrl = "https://openrouter.ai/settings/keys";
  model?: string | undefined;

  private openrouter?: OpenRouterProvider
  private aiModel?: LanguageModel;
  private models = [
    'deepseek/deepseek-coder',
    'google/gemini-flash-1.5',
    'google/gemini-pro-1.5',
    'mistralai/mistral-nemo',
    'qwen/qwen-110b-cha',
    'cohere/command'
  ];

  async init(): Promise<void> {
    const config = await loadConfig(this.name);
    this.model = config?.defaultModel;

    if (config?.apiKey) {
      this.apiKey = config?.apiKey
    } else {
      await this.setApiKey(config?.apiKey || '')
    }

    this.createOpenRouter();
  }

  private createOpenRouter() {
    this.openrouter = createOpenRouter({
      apiKey: this.apiKey
    })

    this.createAiModel()
  }

  private createAiModel() {
    if (this.model) {
      if (this.openrouter) {
        // @ts-ignore
        this.aiModel = this.openrouter(this.model);
      } else {
        throw new Error("something went wrong try again later ..");
      }
    }
  }

  getModels(): Promise<string[]> {
    return Promise.resolve(this.models)
  }

  checkApiKey(): Promise<boolean> {
    return Promise.resolve(!!this.apiKey);
  }

  async setApiKey(key: string): Promise<void> {
    await saveConfig({apiKey: key}, this.name)
    this.apiKey = key

    this.createOpenRouter();
  }

  async setModel(model: string) {
    //check model is in the list of models
    if (!this.models.includes(model)) {
      throw new Error("Invalid model");
    }

    await saveConfig({defaultModel: model}, this.name);
    this.model = model;

    this.createAiModel();
  }

  async runPrompt(prompt: string, model?: string): Promise<string> {

    if (!this.aiModel && model) {
      await this.setModel(model)
    }

    if (this.aiModel) {
      const {text} = await generateText({
        model: this.aiModel,
        prompt: prompt
      })
      return text;
    }

    throw new Error("Model not selected");
  }
}
