# Commita: AI-Powered Git Commit Assistant

Commita is a powerful command-line tool that streamlines your Git workflow by providing intelligent commit message suggestions, enhanced status checks, and simple branch management. It utilizes advanced AI models like Ollama, OpenRouter, and Google's Gemini to offer insightful and context-aware commit message recommendations based on your changes.

## Features

- **🤖 AI-Powered Commit Suggestions:**  Get intelligent commit message suggestions tailored to your code changes, saving you time and effort.
- **📊 Enhanced Git Status:**  Quickly view the status of your Git repository, including modified, deleted, and newly added files.
- **🔍 Detailed Change View:**  Examine all changes made in your Git repository with a comprehensive diff view.
- **🌿 Branch Management:**  Effortlessly create new branches and switch between them.
- **🚀 Push Operations:**  Simplify push operations to your remote repository with a single command.
- **🔄 Customizable AI Models:**  Select from a range of AI models (Ollama, OpenRouter, Google's Gemini) to find the best fit for your needs.
- **🔐 API Key Management:**  Securely manage your API keys for the AI providers to enable model access.
- **⌨️ Customizable Prompts:**  Fine-tune the prompts used by the AI models to achieve specific results.

## Installation

To install Commita globally, run:

```bash
npm install -g commita
```

Ensure you have Node.js version 18 or higher installed on your system.

## Usage

### Suggest Commit Message (Default Command)

To obtain an AI-suggested commit message based on your current changes:

```bash
commita
```

or

```bash
commita suggest-commit
```

### Check Git Status

To view the status of your Git repository:

```bash
commita status
```

### View Changes

To see all changes in your Git repository:

```bash
commita changes
```

### Create a New Branch

To create and switch to a new branch:

```bash
commita branch <branch-name>
```

### Push Changes

To push changes to the remote repository:

```bash
commita push
```

To push to a specific branch:

```bash
commita push -b <branch-name>
```

### Manage AI Models

To change or remove the default AI model:

```bash
commita model
```

### Customize Prompt

To view or change the default prompt used by the AI model:

```bash
commita prompt
```

## Configuration

Commita uses a configuration file (`~/.config/commita/config.json`) to store settings such as the default AI provider, model, and prompt. This file is automatically created and managed by the CLI.

## Requirements

- Node.js >= 18.0.0
- Git
- Internet connection for accessing AI models

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- This project uses [Ollama](https://github.com/jmorganca/ollama), [OpenRouter](https://github.com/openrouter/ai-sdk-provider), and [Google Generative AI](https://cloud.google.com/generative-ai) for AI-powered commit message suggestions.
- Built with [Commander.js](https://github.com/tj/commander.js/) for CLI structure.
- Uses [simple-git](https://github.com/steveukx/git-js) for Git operations.

## Author

[Mohamed Slimani](https://github.com/slimani-dev)

---

Happy committing with Commita! 🚀 
