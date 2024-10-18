#!/usr/bin/env node

import {Command} from '@commander-js/extra-typings';
import {confirm, select} from '@inquirer/prompts';
import simpleGit, {SimpleGit} from 'simple-git';
import chalk from 'chalk';
import loading from "loading-cli";
import {openEditor} from "./utils/editor.js";
import {Prompt} from "./utils/prompt.js";

const git: SimpleGit = simpleGit(process.cwd());

const program = new Command();
const prompt = new Prompt()
await prompt.init()

program
    .name('commita')
    .description('CLI app for Git status, changes, and commit suggestions')
    .version('1.0.0');

async function getGitStatus() {
  return git.status();
}

async function getGitChanges() {
  return git.diff();
}

async function suggestAndCommit(
    options: { commit?: true | undefined, push?: true | undefined, force?: true | undefined }
) {

  while (!prompt.provider) {
    await prompt.selectProvider()
  }

  while (!prompt.model) {
    await prompt.selectModel();
  }

  let load = loading(chalk.yellow('Suggesting commit message...')).start()
  try {
    const changes = await getGitChanges();
    const suggestedMessage = await prompt.suggestCommitMessage(changes);
    load.stop()

    if (!suggestedMessage) {
      console.log(chalk.red('No commit message suggested.'));
      return;
    }

    console.log(chalk.green(suggestedMessage));

    // let force = false;

    /*if (options.commit && options.push) {
      force = options.force || await confirm({
        message: 'Commit and push changes?',
        default: true,
      });
    }*/

    let runCommit: 'commit' | 'abort' | 'edit' = (options.commit && !!options.force) ? 'commit' : 'abort';

    if (options.commit && !options.force) {
      runCommit = await select({
        message: 'Use this as the commit message?',
        choices: [
          {value: "commit", name: "commit", description: "Yes, commit the changes"},
          {value: "abort", name: "abort", description: "No, abort the commit"},
          {
            value: "edit",
            name: "edit",
            description: "Edit the commit message manually",
          },
        ],
      });

      if (runCommit == 'abort') {
        console.log(chalk.yellow('Commit aborted.'));
      }
    }

    if (runCommit == 'commit' || runCommit == 'edit') {
      const message = (runCommit === 'edit') ? await openEditor(suggestedMessage, '.commit_message.txt') : suggestedMessage;
      await git.add('.')
      await git.commit(message.trim());
      console.log(chalk.green('Changes committed successfully!'));
    }

    let runPush = options.push && !!options.force;

    if (options.push && !options.force) {
      runPush = await confirm({
        message: 'Push changes to remote repository?',
        default: true,
      });

      if (!runPush) {
        console.log(chalk.yellow('Changes not pushed to remote repository.'));
      }
    }

    if (runPush) {
      load.stop()
      load = loading(chalk.yellow('Pushing changes to remote repository...')).start()
      const branchName = await git.revparse(['--abbrev-ref', 'HEAD']);
      await git.push('origin', branchName);
      console.log(chalk.green(`Changes pushed to ${branchName}`));
      load.stop()
    }

  } catch (error) {
    console.error(chalk.red('Error suggesting commit message:', error));
    load.stop()
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
    .option('-c, --commit', 'Commit the changes')
    .option('-p, --push', 'Push changes to remote repository')
    .option('-f, --force', 'Force commit or push without prompting')
    .action((options) => suggestAndCommit(options));

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
    .description('Change or remove the default model')
    .action(args => prompt.changeModel(true));

program
    .command('prompt')
    .description('View or Change the default prompt')
    .action(args => prompt.changePrompt());

program.parse();
