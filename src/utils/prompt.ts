import {select, confirm, input} from '@inquirer/prompts';
import chalk from "chalk";
import {Ollama} from "../models/ollama.js";
import {DEFAULT_PROMPT, loadConfig, saveConfig} from "./config.js";
import {AiProvider} from "../models/model";

const ollama = new Ollama()

export class Prompt {
  providers: AiProvider[] = [];

  provider?: AiProvider;
  model?: string;
  prompt: string;

  constructor() {
    this.providers.push(ollama);
    this.prompt = DEFAULT_PROMPT;
  }

  async init() {
    // get default provider from config
    const config = await loadConfig();
    const defaultProvider = config.defaultProvider || 'ollama';
    this.provider = this.providers.find(provider => provider.name === defaultProvider);

    await this.prepareProvider();
  }

  async prepareProvider() {
    await this.provider?.init();
    this.model = this.provider?.defaultModel;

    await saveConfig({defaultModel: this.provider?.defaultModel});
  }

  async selectProvider(setDefault = false): Promise<void> {

    // if no providers exit the app
    if (this.providers.length === 0) {
      console.log(chalk.red('No AI providers available.'));
      process.exit(1);
    }

    const selectedProvider = await select({
      message: 'Select an AI provider:',
      choices: this.providers.map(provider => ({value: provider.name, name: provider.name})),
    });

    this.provider = this.providers.find(provider => provider.name === selectedProvider);
    await this.prepareProvider();

    const setAsDefault = setDefault || await confirm({message: 'Set this provider as default?'});
    if (setAsDefault) {
      await saveConfig({defaultProvider: selectedProvider});
    }
  }

  async selectModel(ignoreDefault = false, setDefault = false): Promise<void> {
    while (!this.provider) {
      await this.selectProvider()
    }

    if (this.model && !ignoreDefault) {
      return;
    }

    const availableModels = await this.provider.getModels();
    const selectedModel = await select({
      message: 'Select a model to use:',
      choices: availableModels.map(model => ({value: model, name: model})),
    });

    const setAsDefault = setDefault || await confirm({message: 'Set this model as default?'});
    if (setAsDefault) {
      await this.provider.setDefaultModel(selectedModel);
      await saveConfig({defaultModel: selectedModel});
      this.model = selectedModel;
    }
  }

  async changeModel(setDefault = false): Promise<void> {
    const currentDefault = this.model || 'No default model set';

    console.log(`Current default model: ${currentDefault} (${this.provider?.name || 'No provider set'})`);

    const action = await select({
      message: 'What would you like to do?',
      choices: [
        {value: 'change', name: 'Change default model'},
        {value: 'remove', name: 'Remove default model'},
        {value: 'cancel', name: 'Cancel'},
      ],
    });

    if (action === 'change') {
      await this.selectProvider(setDefault);
      await this.selectModel(true, setDefault);
      console.log(`Model changed to: ${this.model}`);
    } else if (action === 'remove') {
      await saveConfig({
        defaultModel: undefined,
        defaultProvider: undefined
      });
      console.log('Default model removed');
    } else {
      console.log('Operation cancelled');
    }
  }

  async changePrompt(): Promise<void> {
    const newPrompt = await input({
      message: 'Enter a new prompt:',
      default: this.prompt,
    });

    this.prompt = newPrompt;
    await saveConfig({prompt: newPrompt});
  }

  async suggestCommitMessage(changes: string): Promise<string> {

    while (!this.provider) {
      await this.selectProvider()
    }

    while (!this.model) {
      await this.selectModel();
    }

    const prompt = `${this.prompt}${changes}`

    return this.provider.runPrompt(prompt, this.model)
  }
}
