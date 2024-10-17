import {spawn} from 'child_process';
import fs from 'fs/promises';
import chalk from "chalk";
import path from "path";
import simpleGit, {SimpleGit} from "simple-git";
import {promisify} from "util";

const execAsync = promisify(spawn);
const git: SimpleGit = simpleGit();

export async function openEditor(content: string): Promise<string> {
  // get the default editor
  const editor = await git.getConfig("core.editor", 'global');

  if (!editor.value) {
    return content;
  } else {
    const tempFilePath = path.join(process.cwd(), 'commit_message.txt');

    // Write the current message (if any) to a temporary file
    await fs.writeFile(tempFilePath, content);

    try {
      await execAsync(editor.value, [tempFilePath], {stdio: 'inherit'});
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
}
