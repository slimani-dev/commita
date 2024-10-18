import {spawn} from 'child_process';
import fs from 'fs/promises';
import chalk from "chalk";
import path from "path";
import simpleGit, {SimpleGit} from "simple-git";
import {promisify} from "util";
import {SpawnOptions} from "node:child_process";

const execAsync = promisify(spawn);
const git: SimpleGit = simpleGit();

export async function openEditor(content: string, file: string, editor?: string): Promise<string> {
  // get the default editor
  const gitEditor = await git.getConfig("core.editor", 'global');

  const tempFilePath = path.join(process.cwd(), file);

  // Write the current message (if any) to a temporary file
  await fs.writeFile(tempFilePath, content);

  try {

    if (editor) {
      await promisifiedSpawn(editor, [tempFilePath], {stdio: 'inherit'})
    } else if (gitEditor.value) {
      await promisifiedSpawn(gitEditor.value, [tempFilePath], {stdio: 'inherit'})
    } else {
      console.error(chalk.red('No editor specified.'))
    }


    // Read the message back from the temporary file
    const finalMessage = await fs.readFile(tempFilePath, 'utf-8');
    // Delete the temporary file after reading
    await fs.unlink(tempFilePath);
    return finalMessage;
  } catch (error: any) {
    console.error(chalk.red('Error opening editor:', error.message));
    return ''; // Return an empty string if there's an error
  }

}

function promisifiedSpawn(command: string, args: string[], options: SpawnOptions) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);

    child.on('exit', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Process exited with code: ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}
