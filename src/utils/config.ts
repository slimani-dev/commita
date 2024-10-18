import path from "path";
import os from "os";
import chalk from "chalk";
import {JSONFilePreset} from 'lowdb/node'
import fs from "fs/promises";

interface ProviderConfig {
  defaultModel?: string;
  apiKey?: string;
}

interface Config {
  defaultModel?: string;
  defaultProvider?: string;
  prompt?: string;

  [key: string]: ProviderConfig | string | undefined;
}

const DEFAULT_PROMPT = 'Based on these Git changes, suggest a commit message. Give me only the commit message with no explanations or extra text:\nChanges:\n\n'
const defaultData: Config = {
  prompt: DEFAULT_PROMPT,
};


const homedir = os.homedir();
const CONFIG_DIR = path.join(homedir, '.config', 'git-commit');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

async function ensureConfigFileExists() {
  try {
    await fs.mkdir(CONFIG_DIR, {recursive: true}); // Creates the directory if it doesn't exist

    try {
      await fs.access(CONFIG_FILE); // Check if the config file exists
    } catch (error) {
      // File doesn't exist, create it with default content
      await fs.writeFile(CONFIG_FILE, JSON.stringify(defaultData, null, 2));
    }
  } catch (error: any) {
    console.error(chalk.red('Error ensuring config file exists:', error.message));
  }
}


// Function overloads
export async function loadConfig(key: string): Promise<ProviderConfig | undefined>;
export async function loadConfig(): Promise<Config>;
export async function loadConfig(key?: string): Promise<ProviderConfig | Config | undefined> {
  await ensureConfigFileExists();
  try {
    const db = await JSONFilePreset(CONFIG_FILE, defaultData)

    const config: Config = db.data;

    // If a specific key is requested, return only that part of the config
    if (key) {
      return (config[key] ?? undefined) as ProviderConfig || undefined;
    }

    // Return the entire configuration if no key is specified
    return config;
  } catch (error: any) {
    console.error(chalk.red('Error loading configuration:', error.message));
    return {};
  }
}

export async function saveConfig(config: ProviderConfig, key: string): Promise<void>;
export async function saveConfig(config: Config): Promise<void>;

export async function saveConfig(config: Config | ProviderConfig, key?: string): Promise<void> {
  await ensureConfigFileExists();
  const db = await JSONFilePreset(CONFIG_FILE, defaultData)

  let currentConfig = db.data;

  try {


    // Update or replace the configuration for a model
    if (key) {
      currentConfig[key] = config;
      db.data = currentConfig;
    } else {
      db.data = {
        ...currentConfig, ...config
      }
    }

    // Save the updated configuration
    await db.write()
  } catch (error: any) {
    console.error(chalk.red('Error saving configuration:', error.message));
  }
}

export {DEFAULT_PROMPT}
