# AGENTS Guidelines for This Repository

This repository contains a Next.js application located in the root of this repository. When
working on the project interactively with an agent (e.g. the Codex CLI) please follow
the guidelines below so that the development experience – in particular Hot Module
Replacement (HMR) – continues to work smoothly.

## 1. Use the Development Server, **not** `npm run build`

- **Always use `npm run dev` (or `pnpm dev`, `yarn dev`, etc.)** while iterating on the
  application. This starts Next.js in development mode with hot-reload enabled.
- **Do _not_ run `npm run build` inside the agent session.** Running the production
  build command switches the `.next` folder to production assets which disables hot
  reload and can leave the development server in an inconsistent state. If a
  production build is required, do it outside of the interactive agent workflow.

## 2. Keep Dependencies in Sync

If you add or update dependencies remember to:

1. Update the appropriate lockfile (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`).
2. Re-start the development server so that Next.js picks up the changes.

## 3. Coding Conventions

- Prefer TypeScript (`.tsx`/`.ts`) for new components and utilities.
- Co-locate component-specific styles in the same folder as the component when
  practical.

## 4. Useful Commands Recap

| Command         | Purpose                                                   |
| --------------- | --------------------------------------------------------- |
| `npm run dev`   | Start the Next.js dev server with HMR.                    |
| `npm run lint`  | Run ESLint checks.                                        |
| `npm run test`  | Execute the test suite (if present).                      |
| `npm run build` | **Production build – _do not run during agent sessions_** |

## 5. UI Design Principles

Design Principles to Follow
Aesthetic Usability: Use spacing/typography to make forms feel easier
Hick’s Law: Avoid clutter; collapse complex settings
Jakob’s Law: Stick to familiar WP Admin patterns (cards, sidebars, modals)
Fitts’s Law: Place important buttons close, large, clear
Law of Proximity: Group logic and inputs with spacing + PanelBody + layout components
Zeigarnik Effect: Use progress indicators, save states
Goal-Gradient: Emphasize progress in wizards (e.g. New Rule flow)
Law of Similarity: Ensure toggles, selectors, filters share styling and layout conventions
Aesthetic-Usability Effect

- Clean, consistent spacing (e.g. gap-2, px-4)
- Typography hierarchy (e.g. headings text-lg font-semibold)
- Visual cues like subtle shadows or border separators improve perceived usability

Hick's Law

- Reduce visible options per screen
- Collapse complex filters/conditions into toggles or expandable sections

Fitts’s Law

- Important actions (edit, delete) should be large, clickable buttons
- Avoid tiny icon-only targets unless they are grouped and spaced (space-x-2)

Law of Proximity

- Group related controls using spacing + containers (e.g. PanelBody, Card)
- Inputs related to conditions or filters should be visually bundled

Zeigarnik Effect

- Show progress in multi-step rule creation (stepper, breadcrumb, or "Step X of Y")
- Save state feedback (e.g. "Saving..." or "Unsaved changes" banners)

Goal-Gradient Effect

- Emphasize next step in workflows (highlight active step, primary button styling)
- Use progress bars or steppers to encourage completion

Law of Similarity

- Use consistent styles for toggle switches, buttons, badges, filters
- Align icon sizing and spacing across all rows for visual rhythm

Miller's Law

- Don’t overload the user with options; chunk rule configuration into steps/panels
- Default to collapsed sections (e.g. advanced options)

Doherty Threshold

- Aim for sub-400ms interactions (e.g. loading skeletons, optimistic UI)
- Use loading states with spinners or shimmer placeholders

---

Following these practices ensures that the agent-assisted development workflow stays
fast and dependable. When in doubt, restart the dev server rather than running the
production build.
