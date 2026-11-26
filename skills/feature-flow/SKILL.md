---
name: feature-flow
description: Take one feature or bug fix from request to pull request in fixed phases (understand, plan, implement, test, review, commit, ship). Use when the user asks to build, add or fix something in a code repository and wants it done end to end.
---

# Feature flow

The example pipeline of jalur-agent: each phase below is a station on the board, so keep them in order.

1. **Understand.** Read the request and the code it touches (Read, Grep). Done when you can name the files that will change and why.
2. **Plan.** Write the steps as a todo list and show them to the user. Wait for their OK before editing.
3. **Implement.** Make only the changes the plan names.
4. **Test.** Run the project's tests (or the narrowest relevant subset). Fix until they pass; say so plainly if some cannot run.
5. **Review.** Re-read the diff for bugs and simpler code; use a review skill if one is installed.
6. **Commit.** Stage the changed files by name and commit with a message that says why.
7. **Ship.** Push and open a pull request only when the user asks for it.
