# Commita

Commita is a powerful CLI tool that enhances your Git workflow by providing intelligent commit message suggestions, streamlined status checks, and easy branch management. Leveraging the Ollama AI model, commita offers context-aware commit message recommendations based on your changes.

## Features

- 🤖 AI-powered commit message suggestions
- 📊 Quick Git status overview
- 🔍 Detailed view of repository changes
- 🌿 Easy branch creation and management
- 🚀 Simplified push operations
- 🔄 Customizable AI model selection

## Installation

To install commita globally, run:

```bash
npm install -g commita
```

Make sure you have Node.js version 14 or higher installed on your system.

## Usage

### Suggest Commit Message (Default Command)

To get an AI-suggested commit message based on your current changes:

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

### Manage AI Model

To change or remove the default Ollama model:

```bash
commita model
```

## Configuration

commita uses a configuration file (`.commita-config.json`) in your current working directory to store settings such as the default AI model. This file is automatically created and managed by the CLI.

## Requirements

- Node.js >= 18.0.0
- Git
- Ollama (for AI-powered suggestions) and models installed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- This project uses [Ollama](https://github.com/jmorganca/ollama) for AI-powered commit message suggestions.
- Built with [Commander.js](https://github.com/tj/commander.js/) for CLI structure.
- Uses [simple-git](https://github.com/steveukx/git-js) for Git operations.

## Author

[Mohamed Slimani](https://github.com/slimani-dev)

---

Happy committing with commita! 🚀
