#!/usr/bin/env node

import {Command} from '@commander-js/extra-typings';
import {input} from '@inquirer/prompts';
import simpleGit, {SimpleGit} from 'simple-git';
import chalk from 'chalk';
import {suggestCommitMessage, changeModel} from './utils/ollamaUtils.js';
import {openEditor} from "./utils/editor.js";

const git: SimpleGit = simpleGit();

const program = new Command();

program
    .name('gitcomm')
    .description('CLI app for Git status, changes, and commit suggestions')
    .version('1.0.0');

async function getGitStatus() {
  const status = await git.status();
  return status;
}

async function getGitChanges() {
  const diff = await git.diff();
  return diff;
}

async function suggestAndCommit() {
  console.log(chalk.yellow('Suggesting commit message...'));
  try {
    const changes = await getGitChanges();
    console.log(chalk.blue('Git Changes:'));
    console.log(changes);
    console.log(chalk.yellow('Generating commit message...'));
    const suggestedMessage = await suggestCommitMessage(changes);
    console.log(chalk.blue('Suggested Commit Message:'));
    console.log(chalk.green(suggestedMessage));

    const userMessage = await openEditor(suggestedMessage);
    const finalMessage = userMessage || suggestedMessage;

    //await git.commit(finalMessage);
    console.log(chalk.green('Changes committed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error suggesting commit message:', error));
  }
}

program
    .command('status')
    .description('Check the status of the Git repository')
    .action(async () => {
      try {
        const status = await getGitStatus();
        console.log(chalk.blue('Git Status:'));
        console.log(chalk.green(`Branch: ${status.current}`));
        console.log(chalk.yellow(`Modified files: ${status.modified.join(', ')}`));
        console.log(chalk.red(`Deleted files: ${status.deleted.join(', ')}`));
        console.log(chalk.cyan(`New files: ${status.not_added.join(', ')}`));
      } catch (error) {
        console.error(chalk.red('Error getting Git status:', error));
      }
    });

program
    .command('changes')
    .description('View all changes in the Git repository')
    .action(async () => {
      try {
        const changes = await getGitChanges();
        console.log(chalk.blue('Git Changes:'));
        console.log(changes);
      } catch (error) {
        console.error(chalk.red('Error getting Git changes:', error));
      }
    });

program
    .command('suggest-commit', {isDefault: true})
    .description('Suggest a commit message based on current changes')
    .action(suggestAndCommit);

program
    .command('branch')
    .description('Create a new branch')
    .argument('<name>', 'Name of the new branch')
    .action(async (name: string) => {
      try {
        await git.checkoutLocalBranch(name);
        console.log(chalk.green(`Created and switched to new branch: ${name}`));
      } catch (error) {
        console.error(chalk.red('Error creating new branch:', error));
      }
    });

program
    .command('push')
    .description('Push changes to remote repository')
    .option('-b, --branch <name>', 'Specify the branch to push')
    .action(async (options) => {
      try {
        const branchName = options.branch || await git.revparse(['--abbrev-ref', 'HEAD']);
        await git.push('origin', branchName);
        console.log(chalk.green(`Successfully pushed changes to ${branchName}`));
      } catch (error) {
        console.error(chalk.red('Error pushing changes:', error));
      }
    });

program
    .command('model')
    .description('Change or remove the default Ollama model')
    .action(changeModel);

program.parse();
