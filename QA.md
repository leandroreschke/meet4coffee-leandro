# QA Guide — Meet4Coffee

This guide is for QA team members with no coding or GitHub background. You'll do everything through [cursor.com/agents](https://cursor.com/agents) — a regular website that opens in any browser. No IDE, no terminal, no installations needed.

---

## What you need before you start

1. A **GitHub account** with access to this repository (a dev on the team gives you this)
2. A **Cursor account** — sign up free at [cursor.com](https://cursor.com)
3. The URL of the app environment you're testing (e.g. `https://staging.meet4coffee.com` or the production URL)

That's it.

---

## Getting started at cursor.com/agents

1. Go to [cursor.com/agents](https://cursor.com/agents) in your browser
2. Sign in with your Cursor account
3. Connect your GitHub account when prompted
4. You'll see a **Kanban board** — this is your workspace. Each card is a task the agent is working on or has finished.
5. Click **"New Task"** to start

The agent runs in the cloud. It clones the codebase, does the work, and gives you results — you never touch code.

> **Tip:** You can install cursor.com/agents as an app on your phone (iOS or Android) for testing on the go. In your browser, tap Share → "Add to Home Screen".

---

## Part 1 — Running existing tests

The project already has automated Playwright tests. When you start a task, paste one of the prompts below exactly as written.

### Run all tests against the live app

```
Run all Playwright e2e tests against https://[APP_URL]. Tell me which tests passed and which failed. Show me a plain-English summary grouped by area (marketing pages, auth pages, navigation).
```

Replace `[APP_URL]` with the actual staging or production URL.

### Run tests for a specific area

```
Run only the marketing page tests (01-marketing.spec.ts) and tell me if the landing page, blog, and help center are working correctly.
```

```
Run only the auth tests (02-auth.spec.ts) and tell me if sign-in and sign-up are working.
```

```
Run only the navigation tests (03-navigation.spec.ts) and confirm all links between pages work.
```

```
Run the accessibility tests (04-accessibility.spec.ts) and tell me if any pages have JavaScript errors or broken titles.
```

### Run across all browsers

```
Run all e2e tests on Chromium, Firefox, and mobile Chrome. Give me a pass/fail count for each browser and highlight any tests that only fail on specific browsers.
```

### See screenshots of failures

```
Run the tests and for every test that fails, show me a screenshot of what the browser saw at the point of failure.
```

---

## Part 2 — Understanding results

### Passing test
The feature works as expected.

### Failing test
Something is broken. Ask the agent:

```
The test "[paste test name here]" failed. Show me the screenshot and explain in plain English what the test was checking and why it failed.
```

### Getting a plain-English summary

```
Summarize the last test run for me. Tell me what's working, what's broken, and what I should flag to the dev team.
```

---

## Part 3 — Testing a specific URL or feature

You don't need existing tests for this. Just describe what you want to check.

### Check that a page loads

```
Open https://[APP_URL]/en/sign-in in a browser and tell me what's visible on the page. Take a screenshot.
```

### Check something specific on a page

```
Go to https://[APP_URL]/en and check that the pricing section shows three plans: Free ($0), Premium ($29), and Ultimate ($99). Take a screenshot of that section.
```

### Check a form

```
Go to https://[APP_URL]/en/sign-in, fill in a fake email and a wrong password, click Sign In, and tell me what happens. Does it show an error message? Take a screenshot.
```

### Check on mobile

```
Open https://[APP_URL]/en on a mobile screen size (iPhone 14) and take a screenshot. Does everything look correct?
```

### Check all three languages

```
Open the landing page in English (/en), Spanish (/es), and Portuguese (/br). Take a screenshot of each. Tell me if there are any layout issues or missing text in any language.
```

---

## Part 4 — Writing new tests

You can ask the agent to write tests for anything. After it writes a test, always ask it to run it right away.

**Check that a page loads:**
```
Write a Playwright test that checks the /en/help page loads, has a visible heading, and returns a 200 status. Then run it and tell me if it passes.
```

**Check a button:**
```
Write a test that verifies clicking the "Create Account" button on the landing page takes the user to the sign-up page. Run it.
```

**Check that a link goes to the right place:**
```
Write a test that clicks the "Blog" link in the footer and checks that the URL changes to /en/blog. Run it.
```

**Check for broken images or missing content:**
```
Write a test that opens the landing page and checks that the hero section has a visible heading and the pricing cards are all showing their prices. Run it.
```

**Check an error message:**
```
Write a test that goes to /en/sign-in?error=Invalid+credentials and checks that a red error message appears with the text "Invalid credentials". Run it.
```

**Check a redirect:**
```
Write a test that visits /en/app without being logged in and checks that the user gets redirected to the sign-in page. Run it.
```

After the agent writes and runs a test that passes, ask:

```
Save this test in the tests/e2e/ folder with an appropriate filename and commit it to a new branch. Open a pull request so the dev team can review it.
```

---

## Part 5 — Capturing bugs

When you find a bug while testing manually, use the agent to lock it in as a failing test so it can't silently come back after a fix.

Describe the bug in plain English:

```
I found a bug: when I go to /en/sign-up and click the Sign Up button without filling in any fields, no error message appears — the form just submits silently. Write a Playwright test that proves this bug exists (the test should currently fail). Then open a pull request with the test so a developer can see it.
```

The agent writes a test that **fails** until the dev fixes the bug. Once fixed, the test **passes**. This is called a regression test.

---

## Part 6 — Smoke test before a release

Run this before any release to make sure nothing is broken:

```
Run a full smoke test against https://[APP_URL]. Check that:
1. The landing page loads and shows pricing
2. The sign-in page renders correctly
3. The sign-up page renders correctly
4. The blog and help pages load
5. Navigating between pages works
6. The app redirects to sign-in when not logged in

Run across Chromium and mobile Chrome. Give me a go/no-go recommendation.
```

---

## Part 7 — Slack integration

If your team uses Slack and has connected Cursor to it, you can trigger tests directly from a Slack message:

```
@Cursor Run the smoke test against https://staging.meet4coffee.com and report back
```

You'll get a Slack notification when it's done with a link to the results.

---

## Quick reference — copy-paste prompts

| Goal | Prompt |
|---|---|
| Run all tests | `Run all Playwright e2e tests and give me a pass/fail summary` |
| Run one area | `Run only the [marketing/auth/navigation/accessibility] tests` |
| See failure screenshots | `Show me screenshots from every test that failed` |
| Plain-English summary | `Summarize the test results in plain English` |
| Check a URL visually | `Go to [URL] and take a screenshot` |
| Check on mobile | `Open [URL] on iPhone 14 and take a screenshot` |
| Check all languages | `Check the landing page in /en, /es, and /br` |
| Write a test | `Write a Playwright test that checks [describe what you want], then run it` |
| Capture a bug | `I found a bug: [describe it]. Write a failing test that proves it and open a PR` |
| Pre-release smoke test | `Run a full smoke test against [URL] and give me a go/no-go` |
| Save a new test | `Save this test to tests/e2e/ and open a pull request` |

---

## Troubleshooting

**"I don't know if a failure is a real bug or a flaky test"**
```
The test "[test name]" is failing. Is this a real bug in the app, or does the test have a problem? Explain what the test checks and what went wrong.
```

**"I want to re-run just the failed tests"**
```
Re-run only the tests that failed in the last run.
```

**"The agent is taking too long"**

Check the Kanban board — each task card shows progress. You can close the tab and come back later; the agent keeps running in the background. You'll get a notification (or a Slack message if set up) when it's done.

**"I want to test something that isn't in the existing tests"**

Just describe it in plain English. The agent doesn't need you to know what a "test file" is — it figures that out from your description.
