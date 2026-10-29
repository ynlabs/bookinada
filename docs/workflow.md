# Git and GitHub workflow

Status: proposed personal workflow for `ynlabs/bookinada`. The course uses teams of at least three students and LRZ GitLab. A solo PR or assistant review is not independent peer review.

## Repository starting point

- The README baseline already exists on `main` in commit `b1d6a78`.
- `origin` is `git@github.com:ynlabs/bookinada.git`.
- The current Week 1 work branch is `docs/week1-context`.
- Existing draft documents must be inspected before their first commit. Do not reinitialize Git or recreate the remote.

## What each action does

| Concept/action | Meaning |
| --- | --- |
| Working tree | The files currently on your computer. |
| Untracked | A file exists locally but is not yet tracked by Git. |
| `git add PATH` | Select the file's current content for the next commit. |
| `git commit` | Record the staged content in local history. |
| Branch | A reference to a commit; new commits advance the checked-out branch. |
| `git push` | Send local commits and update the remote branch. |
| Pull Request | Propose and inspect the difference between the work branch and `main`. |
| Merge | Integrate the reviewed change into the target branch. |

Creating a branch does not commit files. Untracked files do not belong to a committed branch snapshot. Before the first `git add`, normal `git diff` omits them; read them in an editor, or use `git diff --no-index /dev/null PATH` for a text file (exit code 1 means a difference was found).

## One task, one reviewable change

1. Create a short-lived branch from an up-to-date `main`; Week 1 already uses `docs/week1-context`.
2. Edit the smallest relevant set of files and keep requirements, diagrams, and assumptions consistent.
3. Inspect `git status`, read new files, and inspect changes to tracked files.
4. Stage intended paths explicitly; inspect `git diff --cached --stat`, `git diff --cached`, and `git diff --cached --check`.
5. Commit with a message describing the result.
6. Push the branch and open a PR to `main`.
7. Inspect the PR diff, record actual verification and remaining questions. Label solo or assistant-assisted review honestly. Do not mark a peer-review or learning checkbox complete without evidence.
8. Merge only after review, then update local `main` with `git pull --ff-only`.

## Week 1 staging scope

Run inside `bookinada/` after reading the documents:

```sh
git add README.md .gitignore .github/pull_request_template.md docs/requirements.md docs/system-context.md docs/system-context.drawio docs/system-context.svg docs/workflow.md docs/week1-guide.md
git diff --cached --stat
git diff --cached --check
git diff --cached
```

The scope is project documentation and ignore rules. Course PDFs are reference material outside the project, not repository deliverables.

After committing, publish the current branch:

```sh
git push -u origin docs/week1-context
```

On GitHub, open a PR with base `main` and compare `docs/week1-context`. Use the PR template to describe the problem, resulting behavior, course connection, verification, and unresolved decisions. No CI pipeline or branch protection is configured by these files.

After the PR has actually been reviewed and merged:

```sh
git switch main
git pull --ff-only
```

GitHub PRs correspond to the course's GitLab merge requests. GitHub Actions and GitLab CI have different configuration syntax; automated API validation is part of the next exercise.

## References

- [Pro Git: branches](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell)
- [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow)
