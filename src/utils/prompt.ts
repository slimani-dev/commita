import {select, confirm, input} from '@inquirer/prompts';
import chalk from "chalk";
import Mustache from 'mustache'
import {Ollama} from "../models/ollama.js";
import {DEFAULT_PROMPT, loadConfig, saveConfig} from "./config.js";
import {AiProvider} from "../models/ai-provider";
import {Google} from "../models/google.js";
import {OpenRouter} from "../models/openrouter.js";
import {openEditor} from "./editor.js";

const ollama = new Ollama()
const google = new Google()
const openrouter = new OpenRouter()

export class Prompt {
  providers: AiProvider[] = [];

  provider?: AiProvider;
  model?: string;
  prompt: string;

  constructor() {
    this.providers.push(ollama);
    this.providers.push(google);
    this.providers.push(openrouter);
    this.prompt = DEFAULT_PROMPT;
  }

  async init() {
    // get default provider from config
    const config = await loadConfig();
    const defaultProvider = config.defaultProvider;
    this.provider = this.providers.find(provider => provider.name === defaultProvider);

    this.prompt = config.prompt || DEFAULT_PROMPT

    await this.prepareProvider();
  }

  async prepareProvider() {
    await this.provider?.init();
    this.model = this.provider?.model;
    await saveConfig({defaultModel: this.provider?.model});

    while (this.provider?.apiKeyRequired && !(await this.provider?.checkApiKey())) {
      // show help on how to get an api key
      console.log(`You can get an API key from the ${this.provider?.name} website.`);
      console.log(this.provider?.apiKeyHelpUrl);

      const apiKey = await input({
        message: 'Enter your API key:',
      });

      await this.provider?.setApiKey(apiKey);

      if (!(await this.provider?.checkApiKey())) {
        console.log(chalk.red('Invalid API key. Please try again.'));
      }
    }
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
      console.log('Setting default model for ', this.provider.name, ' to ', selectedModel)
      await this.provider.setModel(selectedModel);
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
    // show the user the current prompt
    console.log(`Current prompt: ${this.prompt}`);

    // check if the user want to change the prompt
    const changePrompt = await confirm({message: 'Do you want to change the prompt?'});
    if (!changePrompt) {
      return;
    }

    const editor = await select({
      message: 'Select an editor:',
      choices: [
        {value: 'vim', name: 'Vim'},
        {value: 'nano', name: 'Nano'},
      ],
    })

    const newPrompt = await openEditor(this.prompt, '.prompt.txt', editor);

    this.prompt = newPrompt;
    await saveConfig({prompt: newPrompt});
  }

  async suggestCommitMessage(diff: string): Promise<string | undefined> {

    const prompt = Mustache.render(`${this.prompt}$`, {
      diff
    });

    return this.provider?.runPrompt(prompt)
  }

}
