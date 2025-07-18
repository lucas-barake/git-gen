# AI Git Assistant (`git-gen`)

A command-line tool that acts as a general-purpose AI assistant for your git workflow. It can automatically generate PR titles and descriptions, provide code reviews, generate commit messages, and more, streamlining your workflow.

## Overview

This CLI tool connects to the GitHub (`gh`) CLI and a generative AI to perform two main functions:

1.  **GitHub Interaction (`gh` subcommand):**
    - Detects the current repository you are in.
    - Starts an interactive session, prompting for a pull request number.
    - Fetches the code changes (diff) for the specified PR.
    - Asks whether you want to generate PR details (title/description) or a code review.
    - Sends the diff to a generative AI for analysis.
    - Updates the pull request on GitHub with the AI-generated content or posts a review as a comment.

2.  **Commit Message Generation (`commit` subcommand):**
    - Gets the staged diff from your local git repository.
    - Sends the diff to a generative AI to generate a conventional commit message.
    - Prompts for confirmation before committing the changes with the generated message.

## Prerequisites

Before you begin, ensure you have the following installed and configured:

1.  **[Bun](https://bun.sh/)**: The runtime used to execute the script.
2.  **[pnpm](https://pnpm.io/)**: Used for dependency management and creating the global link.
3.  **[GitHub CLI](https://cli.github.com/)**: The tool used to interact with GitHub.
    - Make sure you are authenticated by running `gh auth login`.

## Configuration

This tool requires a Google AI API key to function. You must set the `GOOGLE_AI_API_KEY` environment variable for the application to work.

### Basic Setup (for testing)

You can export the variable in your shell. Note that this is not the most secure method for long-term use.

```bash
export GOOGLE_AI_API_KEY="your-api-key-here"
```

To make it persist between sessions, you can add this line to your shell's configuration file (e.g., `~/.zshrc`, `~/.bashrc`).

### Recommended: Using a Secret Manager

For better security, it is highly recommended to use a secret manager to handle your API key. This prevents storing secrets in plain text.

The application will automatically read the environment variable if it's provided by a secret manager's CLI.

**Example with Bitwarden CLI:**

```bash
# The `bw run` command injects the secret into the command's environment
bw run -- git-gen gh
```

**Example with Doppler:**

```bash
# The `doppler run` command works similarly
doppler run -- git-gen commit
```

Using this wrapper pattern is the most secure way to provide credentials to the application.

## Installation

Follow these steps to set up the `git-gen` command on your local machine.

### 1\. Clone the Repository

First, clone this project to your local machine.

### 2\. Install Dependencies

Install the necessary Node.js packages using `pnpm`.

```bash
pnpm install
```

### 3\. Make the Script Executable

Grant execute permissions to the main script file, `src/Main.ts`. This allows the system to run it directly via the symbolic link.

```bash
chmod +x src/Main.ts
```

### 4\. Create the Global Link

Use `pnpm` to create a global symbolic link to your script. This makes the `git-gen` command available from any directory in your terminal.

```bash
pnpm link --global
```

> **Note:** If this is your first time using `pnpm` for global links, you may need to run `pnpm setup` and restart your terminal or source your shell's config file (e.g., `source ~/.zshrc`) to update your system's `PATH`.

## Usage

Once installed, you can use the `git-gen` command from within any local Git repository directory that has a GitHub remote.

### GitHub Assistant (`gh`)

Run the `gh` subcommand to start an interactive session for PR-related tasks.

```bash
git-gen gh
```

The tool will then guide you through the process:

```
? Please enter the PR number: › 123
? What would you like to do?
❯ Generate title and description
  Generate title only
  Generate a review and post as a comment
```

### Commit Message Generator (`commit`)

Run the `commit` subcommand to generate a commit message for your staged changes.

```bash
git-gen commit
```

The tool will analyze your staged changes, generate a message, and ask for confirmation before committing.

```
Generated commit message:

feat(cli): add commit message generation

- Adds a new `commit` subcommand to generate commit messages from staged changes.
- Implements a `GitClient` to interact with git.
- Updates the AI generator to create commit messages.

? Would you like to commit with this message? › yes
✅ Successfully committed changes!
```

### Getting Help

To see all available commands and options, use the `--help` flag.

```bash
git-gen --help
```

You can also get help for a specific subcommand:

```bash
git-gen gh --help
```

```bash
git-gen commit --help
```

## Building for Production

For a more permanent and performant setup, you can compile the application into a single binary.

### 1. Build the Binary

Run the build script to compile the application:

```bash
bun run build
```

This will create a `git-gen` executable file in the project root.

### 2. Use the Binary

You can now run the compiled application directly:

```bash
./git-gen --help
```

To make it available globally, you can move it to a directory in your system's `PATH`, such as `/usr/local/bin`:

```bash
mv git-gen /usr/local/bin/
```

Now you can run `git-gen` from anywhere.
