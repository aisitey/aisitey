# Getting Started with aisitey

## Prerequisites

- Node.js 18+
- npm or yarn
- An AI coding agent (Codex, Cursor, Claude, etc.)

## Installation

```bash
npm install -g aisitey
```

## Create Your First Project

```bash
aisitey init
```

Follow the prompts:

1. Enter your project name
2. Select your tech stack
3. Choose whether to create a new folder

This creates a `.aisitey` folder with seven context files.

## Fill in Your Context Files

### 1. Project Overview

Open `.aisitey/project-overview.md` and define:

- What your project does
- Your goals
- Core user flow
- Features
- What's in scope and out of scope

### 2. Architecture

Open `.aisitey/architecture.md` and specify:

- Tech stack
- System boundaries
- Data model
- Domain entities

### 3. UI Context

Open `.aisitey/ui-context.md` and define:

- Design tokens
- Typography
- Layout patterns

### 4. Code Standards

Open `.aisitey/code-standards.md` and set:

- Coding conventions
- Validation rules
- Error handling

### 5. AI Workflow Rules

Open `.aisitey/ai-workflow-rules.md` and control:

- How AI should work
- What AI can't change
- Implementation order

## Start Building with AI

Once your context files are filled in, give them to your AI agent:

```bash
"Read the .aisitey folder and build the project according to the context files."
```

## Next Steps

- Check [How It Works](how-it-works.md) for a detailed explanation
- Browse [Templates](templates.md) for ready-made contexts
- Join the community on GitHub

## Need Help?

- GitHub Issues: https://github.com/aisitey/aisitey
- Website: https://aisitey.com
