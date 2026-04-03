<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:verification-rules -->
# Verify changes before handing off

After making code changes, always run the most relevant verification available for the affected area and check the changed flow actually works.

- At minimum, run targeted static checks such as `pnpm lint`, `pnpm typecheck`, or the narrowest relevant test command.
- For UI or form changes, also verify the affected screen/interaction manually in the browser when the environment allows it.
- If a verification step cannot be run, state that clearly in the final handoff.
<!-- END:verification-rules -->
