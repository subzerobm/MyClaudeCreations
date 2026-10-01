# CLAUDE.md - Project Instructions for Claude

## Project Overview

**MyClaudeCreations** is a local workspace for collaborative development between Claude and the user. This file guides Claude's behavior and understanding of the project.

## Projects

All projects live in this one repository, each in its own top-level folder:

- `parkour/`: Parkour, a single-file HTML runner game (PWA). Source parts in `parkour/src/`, rebuilt with `parkour/src/build.sh`
- `poker-trainer/`: Table du Vendredi, a single-file HTML poker trainer (PWA: `index.html` + icons; icon drawing page in `poker-trainer/src/iconart.html`)
- `stroop-registration/`: Stroop study registration site (Google Apps Script in `apps-script/`, static mockups in `preview/`, setup in `SETUP.md`)

A new project gets its own top-level folder and a line in this list and in `README.md`.

## Core Guidelines

1. **Version Control**
   - `main` is the single source of truth: finished work ends up on `main`
   - Commit and push after each meaningful change, with clear messages. A Stop hook (`.claude/hooks/auto-push.sh`) also commits and pushes anything left over at the end of each reply
   - Delete feature branches once they are merged
   - Include `Co-Authored-By: Claude` footer in commits

2. **Code Quality**
   - Write clean, readable code with comments
   - Document any dependencies or setup requirements in the project's folder

3. **Collaboration**
   - Ask for clarification if requirements are unclear
   - Propose improvements but respect user preferences
   - Keep the user informed of progress

## User Context

- **Field**: Cognitive Psychology
- **Current Work**: PostDoc on dual tasks
- **Working with**: Statistical and behavioral data, E-Prime, Excel, PowerPoint
- **Location**: Rouen, France

---

*Last updated: 2026-10-01*
