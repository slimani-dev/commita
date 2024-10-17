import { Ollama } from 'ollama';
import { select, confirm } from '@inquirer/prompts';
import fs from 'fs/promises';
import path from 'path';
import chalk from "chalk";

const ollama = new Ollama();
const CONFIG_FILE = path.join(process.cwd(), '.gitcomm-config.json');

interface Config {
  defaultModel?: string;
}

async function loadConfig(): Promise<Config> {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    console.error(chalk.red('Error loading configuration:', error.message));
    return {};
  }
}

async function saveConfig(config: Config): Promise<void> {
  try {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error: any) {
    console.error(chalk.red('Error saving configuration:', error.message));
  }
}

async function getInstalledModels(): Promise<string[]> {
  const response = await ollama.list();
  return response.models.map(model => model.name);
}

export async function selectModel(): Promise<string> {
  const config = await loadConfig();
  if (config.defaultModel) {
    return config.defaultModel;
  }

  const installedModels = await getInstalledModels();
  const selectedModel = await select({
    message: 'Select a model to use:',
    choices: installedModels.map(model => ({ value: model, name: model })),
  });

  const setAsDefault = await confirm({ message: 'Set this model as default?' });
  if (setAsDefault) {
    await saveConfig({ defaultModel: selectedModel });
  }

  return selectedModel;
}

export async function changeModel(): Promise<void> {
  const config = await loadConfig();
  const currentDefault = config.defaultModel || 'No default model set';

  console.log(`Current default model: ${currentDefault}`);

  const action = await select({
    message: 'What would you like to do?',
    choices: [
      { value: 'change', name: 'Change default model' },
      { value: 'remove', name: 'Remove default model' },
      { value: 'cancel', name: 'Cancel' },
    ],
  });

  if (action === 'change') {
    const newModel = await selectModel();
    console.log(`Default model changed to: ${newModel}`);
  } else if (action === 'remove') {
    await saveConfig({});
    console.log('Default model removed');
  } else {
    console.log('Operation cancelled');
  }
}

export async function suggestCommitMessage(changes: string): Promise<string> {
  const model = await selectModel();
  const prompt = `Based on the following Git changes, 
   suggest a concise and descriptive commit message,
   give me only the commit message without any explanation or extra talk
   here are the changes:\n\n${changes}`;
  const response = await ollama.generate({
    model: model,
    prompt: prompt,
    stream: false,
  });
  return response.response.trim();
}
