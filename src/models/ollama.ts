import {Ollama as OllamaProvider} from 'ollama';
import {type AiProvider} from "./model";
import {loadConfig, saveConfig} from "../utils/config.js";

const ollama = new OllamaProvider();

export class Ollama implements AiProvider {
  name: string = "ollama";
  apiKeyRequired = false;
  apiKey?: string;
  defaultModel?: string;

  async init() {
    const config = await loadConfig(this.name);
    this.defaultModel = config?.defaultModel;
  }

  async getModels(): Promise<string[]> {
    const response = await ollama.list();
    return response.models.map(model => model.name);
  }

  async setApiKey(key: string) {
    throw new Error('Method not implemented.');
  }

  async setDefaultModel(model: string) {
    console.log('Setting default model for ', this.name, ' to ', model)
    return saveConfig({defaultModel: model}, this.name);
  }

  async runPrompt(prompt: string, model: string): Promise<string> {
    const response = await ollama.chat({
      model,
      messages: [
        {role: 'user', content: prompt}
      ],
      stream: false,
    });
    return response.message.content.trim();
  }

}
