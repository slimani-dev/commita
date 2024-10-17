import {exec} from 'child_process';
import {promisify} from 'util';
import fs from 'fs/promises';
import chalk from "chalk";
import path from "path";
import simpleGit, {SimpleGit} from "simple-git";

const execAsync = promisify(exec);
const git: SimpleGit = simpleGit();

export async function openEditor(content: string): Promise<string> {
  const tempFilePath = path.join(process.cwd(), 'commit_message.txt');

  // Write the current message (if any) to a temporary file
  await fs.writeFile(tempFilePath, content);

  // Open the default editor
  const editor = process.env.EDITOR || git.getConfig("core.editor");
  try {
    await execAsync(`${editor} ${tempFilePath}`);
    // Read the message back from the temporary file
    const finalMessage = await fs.readFile(tempFilePath, 'utf-8');
    // Delete the temporary file after reading
    await fs.unlink(tempFilePath);
    return finalMessage.trim();
  } catch (error: any) {
    console.error(chalk.red('Error opening editor:', error.message));
    return ''; // Return an empty string if there's an error
  }
}
