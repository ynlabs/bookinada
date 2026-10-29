# Development workflow

This personal project uses GitHub. The course uses teams of at least three students and LRZ GitLab; solo self-review and assistant review do not replace independent peer review.

## One task, one branch

1. Start from an up-to-date local `main` and create a task branch.
2. Make a focused change. Keep affected requirements, diagrams, code, and tests consistent.
3. Inspect the diff and perform checks appropriate to the change.
4. Stage only the intended files and review the staged diff.
5. Commit with a message describing the change, then push the task branch.
6. Open a pull request targeting `main`. Describe the change, verification results, and unresolved questions.
7. Review before merging. Clearly identify solo self-review, assistant review, or independent peer review; only claim checks actually performed.
8. After merging, switch to local `main` and pull the latest changes.

## Review checklist

- The change addresses the intended task.
- Related documentation remains consistent.
- The diff contains no unintended files or secrets.
- Relevant checks passed, or limitations are recorded.
- The author can explain the change.
