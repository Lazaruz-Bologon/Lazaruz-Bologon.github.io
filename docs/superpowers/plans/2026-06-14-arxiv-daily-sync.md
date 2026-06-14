# arXiv Daily Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the Pages repository updated daily with the latest arXiv medical image segmentation report generated from the local workspace.

**Architecture:** A local PowerShell sync script copies the latest rendered report into a stable `arxiv-daily/` site section, generates archive pages, and optionally commits and pushes the changes. A Windows Scheduled Task runs the script once per day on the user machine.

**Tech Stack:** PowerShell, static HTML, Git, Windows Task Scheduler

---

### Task 1: Add a stable report section

**Files:**
- Create: `arxiv-daily/index.html`
- Create: `arxiv-daily/latest/index.html`
- Create: `arxiv-daily/archive/index.html`
- Create: `arxiv-daily/README.md`

- [x] **Step 1: Write the static landing page**
- [x] **Step 2: Write the latest-page redirect**
- [x] **Step 3: Write the archive index**
- [x] **Step 4: Write the README note**

### Task 2: Add the local sync script

**Files:**
- Create: `scripts/sync-arxiv-daily.ps1`
- Create: `scripts/register-arxiv-daily-task.ps1`

- [x] **Step 1: Write the sync script**
- [x] **Step 2: Verify the script finds the latest report folder**
- [x] **Step 3: Verify the homepage link update**
- [x] **Step 4: Write the task registration helper**

### Task 3: Add lightweight validation

**Files:**
- Create: `.github/workflows/validate-daily-report.yml`

- [x] **Step 1: Write the scheduled workflow**
- [x] **Step 2: Ensure the workflow checks the generated pages**

### Task 4: Verify and commit

**Files:**
- Modify: `index.html`
- Modify: `arxiv-daily/index.html`
- Modify: `arxiv-daily/latest/index.html`
- Modify: `arxiv-daily/archive/index.html`
- Modify: `arxiv-daily/README.md`
- Modify: `.github/workflows/validate-daily-report.yml`
- Modify: `scripts/sync-arxiv-daily.ps1`
- Modify: `scripts/register-arxiv-daily-task.ps1`

- [x] **Step 1: Check the modified file list**
- [ ] **Step 2: Commit the change set**
- [ ] **Step 3: Push the branch**
