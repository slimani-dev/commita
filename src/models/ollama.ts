import {Ollama as OllamaProvider} from 'ollama';
import {type AiProvider} from "./ai-provider";
import {loadConfig, saveConfig} from "../utils/config.js";

export class Ollama implements AiProvider {
  name: string = "ollama";
  apiKeyRequired = false;
  apiKey?: string;
  model?: string;
  private ollama: OllamaProvider

  constructor() {
    this.ollama = new OllamaProvider();
  }


  async init() {
    const config = await loadConfig(this.name);
    this.model = config?.defaultModel;
  }

  async getModels(): Promise<string[]> {
    const response = await this.ollama.list();
    return response.models.map(model => model.name);
  }

  async setApiKey(key: string) {
    throw new Error('Method not implemented.');
  }

  checkApiKey(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async setModel(model: string) {
    this.model = model;
    return saveConfig({defaultModel: model}, this.name);
  }

  async runPrompt(prompt: string, model: string): Promise<string> {
    if (!this.model && model) {
      await this.setModel(model)
    }

    if (this.model) {
      const response = await this.ollama.chat({
        model: this.model,
        messages: [
          {role: 'user', content: prompt}
        ],
        stream: false,
      });
      return response.message.content.trim();
    }

    throw new Error("Model not selected");
  }

}
