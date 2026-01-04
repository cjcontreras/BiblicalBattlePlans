# Copilot Code Review Instructions

## Review Focus

When reviewing pull requests, focus on issues that **actually matter**:

### Comment on these (High Priority)
- **Bugs**: Memory leaks, race conditions, null/undefined errors, infinite loops
- **Security vulnerabilities**: XSS, injection, exposed secrets, insecure data handling
- **Breaking changes**: API changes, removed exports, changed behavior
- **Best practices**: React hooks rules, proper cleanup in useEffect, correct use of useRef vs useState, avoiding stale closures

### Comment on these (Medium Priority)
- **Performance issues**: Unnecessary re-renders, missing memoization on expensive operations, N+1 queries
- **Error handling**: Unhandled promise rejections, missing error boundaries for critical paths
- **Accessibility**: Only if something is actually broken (missing alt text on images, non-focusable interactive elements)

### Do NOT comment on these
- Style preferences or naming conventions (trust the linter)
- "Consider adding..." suggestions for optional enhancements
- Minor TypeScript pedantry where the code works correctly
- Adding comments or documentation to self-explanatory code
- ARIA attributes on elements that are already accessible (e.g., buttons with clear text)
- Suggestions to re-show dismissed UI or add "nice to have" UX features
- Formatting issues (trust Prettier)
- Theoretical error handling for edge cases with natural recovery paths (e.g., "what if this Promise rejects?" when the user can simply retry)

## Comment Style

- Be direct and concise
- Explain **why** something is a problem, not just what to change
- If it's a best practice rather than a bug, say so explicitly
- Don't pile on - one comment per issue, not multiple comments about the same pattern
- Skip praise comments ("Great job!" adds noise)

## Tech Stack Context

This is a React + TypeScript + Vite PWA using:
- TanStack Query for data fetching
- Supabase for backend
- Tailwind CSS for styling
- vite-plugin-pwa for service worker

Assume the reviewer understands these technologies.
