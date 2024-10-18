import type {AiProvider} from "./ai-provider";
import {generateText, LanguageModel} from "ai"
import {createGoogleGenerativeAI, GoogleGenerativeAIProvider} from "@ai-sdk/google"
import {loadConfig, saveConfig} from "../utils/config.js";


export class Google implements AiProvider {
  name = 'google';
  apiKey?: string | undefined;
  apiKeyRequired = true;
  apiKeyHelpUrl = "https://aistudio.google.com/app/apikey";
  model?: string | undefined;

  private google?: GoogleGenerativeAIProvider
  private gemini?: LanguageModel;
  private models = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
  ];

  async init(): Promise<void> {
    const config = await loadConfig(this.name);
    this.model = config?.defaultModel;

    if (config?.apiKey) {
      this.apiKey = config?.apiKey
    } else {
      await this.setApiKey(config?.apiKey || '')
    }

    this.google = createGoogleGenerativeAI({
      apiKey: this.apiKey
    })


    this.createGeminiModel();

  }

  private createGeminiModel() {
    if (this.model) {
      if (this.google) {
        this.gemini = this.google(this.model);
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

    this.google = createGoogleGenerativeAI({
      apiKey: key
    })

    this.createGeminiModel()
  }

  async setModel(model: string) {
    //check model is in the list of models
    if (!this.models.includes(model)) {
      throw new Error("Invalid model");
    }

    await saveConfig({defaultModel: model}, this.name);
    this.model = model;

    this.createGeminiModel()
  }

  async runPrompt(prompt: string, model?: string): Promise<string> {

    if (!this.gemini && model) {
      await this.setModel(model)
    }

    if (this.gemini) {
      const {text} = await generateText({
        model: this.gemini,
        prompt: prompt
      })
      return text;
    }

    throw new Error("Model not selected");
  }
}
