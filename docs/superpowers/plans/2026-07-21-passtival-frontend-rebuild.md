# PASSTIVAL Frontend Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing CRA frontend with a premium, animated Vite + React experience for exam-number result lookup and exact-group TOP 5 rankings while preserving the Apps Script backend.

**Architecture:** A hash-routed React app delegates all remote data handling to `passtivalApi`, keeps only the last exam number in session storage, and renders route-focused page components. Plain CSS maps the Figma tokens and responsive composition; Framer Motion adds coordinated transitions with reduced-motion support.

**Tech Stack:** Node 22, Vite 7, React 19, React Router 7, Framer Motion 12, Vitest 3, React Testing Library, plain CSS, Google Apps Script HTTP API

## Global Constraints

- Exact Apps Script group values: `고3 남자`, `고3 여자`, `고2 남자`, `고2 여자`.
- The onboarding primary command is exactly `내 순위 확인하기`.
- Hash routes are `#/`, `#/my-ranking`, and `#/top5` for GitHub Pages compatibility.
- Personal total score must never be rendered.
- Missing record values render as `미응시`.
- Figma nodes `1845:5163` and `1872:1237` are the visual sources.
- Figma raster assets must be stored locally and never loaded from temporary MCP URLs at runtime.
- Motion must respect `prefers-reduced-motion` and must not delay navigation or data access.
- The minimum supported viewport is 320px wide.

## File Structure

- `index.html`: Vite HTML entry.
- `vite.config.js`: Vite, React, Vitest, and GitHub Pages base configuration.
- `src/main.jsx`: React root and `HashRouter` bootstrap.
- `src/AppRouter.jsx`: route declarations and route transitions.
- `src/api/passtivalApi.js`: endpoint construction, fetch behavior, response normalization, and typed error codes.
- `src/api/passtivalApi.test.js`: API and normalization contract tests.
- `src/storage/examSession.js`: session-only exam-number persistence.
- `src/storage/examSession.test.js`: storage behavior tests.
- `src/pages/OnboardingPage.jsx`: onboarding commands and lookup-sheet ownership.
- `src/pages/PersonalResultPage.jsx`: session restoration and participant-result composition.
- `src/pages/TopFivePage.jsx`: exact-group tabs and ranking retrieval.
- `src/components/ExamLookupSheet.jsx`: accessible modal form.
- `src/components/TopBar.jsx`: compact shared route header.
- `src/components/AsyncState.jsx`: loading, retry, and empty states.
- `src/components/RecordList.jsx`: five normalized records.
- `src/components/RankingTabs.jsx`: four exact group controls.
- `src/components/TopFiveList.jsx`: ranked rows.
- `src/motion.js`: shared Framer Motion variants and reduced-motion helpers.
- `src/styles/*.css`: reset, tokens, app shell, components, and page-specific responsive styles.
- `src/assets/passtival-title.png`: title artwork from Figma.
- `src/assets/athlete-hero.png`: athlete artwork from Figma.
- `src/test/setup.js`: DOM matchers and test cleanup.

---

### Task 1: Vite Foundation And API Contract

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Create: `index.html`
- Create: `vite.config.js`
- Create: `src/test/setup.js`
- Create: `src/api/passtivalApi.test.js`
- Create: `src/api/passtivalApi.js`
- Delete after replacement: `public/index.html`

**Interfaces:**
- Consumes: Apps Script modes `exam` and `top5`.
- Produces: `lookupParticipant(examNumber)`, `fetchTopFive(group)`, `normalizeParticipant(payload)`, `normalizeTopFive(payload)`, `PasstivalApiError`, and `GROUPS`.

- [ ] **Step 1: Replace CRA scripts and test dependencies**

Set `package.json` scripts and dependencies to:

```json
{
  "homepage": "https://dataground-inc.github.io/passtival25",
  "name": "passtival25",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "framer-motion": "^12.18.1",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.2"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@vitejs/plugin-react": "^4.6.0",
    "jsdom": "^26.1.0",
    "vite": "^7.0.0",
    "vitest": "^3.2.4"
  }
}
```

Run: `npm.cmd install`

Expected: installation succeeds and `package-lock.json` no longer contains `react-scripts`.

- [ ] **Step 2: Add Vite and Vitest bootstrap**

Create `vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/passtival25/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
});
```

Create `src/test/setup.js`:

```js
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);
```

- [ ] **Step 3: Write failing API normalization tests**

Create tests asserting the exact group list, legacy payload aliases, missing-record normalization, total count, URL encoding, and API failures:

```js
import { describe, expect, it, vi } from 'vitest';
import {
  GROUPS,
  PasstivalApiError,
  lookupParticipant,
  normalizeParticipant,
  normalizeTopFive,
} from './passtivalApi';

it('uses exact Apps Script group names', () => {
  expect(GROUPS).toEqual(['고3 남자', '고3 여자', '고2 남자', '고2 여자']);
});

it('normalizes personal records and blank values', () => {
  expect(normalizeParticipant({
    examNumber: 101,
    name: '한지훈',
    center: '서울센터',
    gender: '남자',
    grade: '고3',
    group: '고3 남자',
    rank: 233,
    totalCount: 1233,
    jemul: 277,
    backStrength: '',
    run10m: 9.17,
    medicineBall: 8.9,
    sitAndReach: 12.5,
  }).records.backStrength).toBeNull();
});

it('unwraps top-five result rows', () => {
  expect(normalizeTopFive({ result: [{ name: '김민준', center: '서울센터', score: 99 }] }))
    .toEqual([{ name: '김민준', center: '서울센터' }]);
});

it('maps a not-found response to a stable error code', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ error: 'not found' }),
  }));
  await expect(lookupParticipant('101')).rejects.toEqual(
    expect.objectContaining({ code: PasstivalApiError.NOT_FOUND }),
  );
});
```

- [ ] **Step 4: Run the focused tests and verify failure**

Run: `npm.cmd test -- src/api/passtivalApi.test.js`

Expected: FAIL because `passtivalApi.js` does not exist.

- [ ] **Step 5: Implement the API boundary**

Implement `GROUPS`, `cleanRecord`, `normalizeParticipant`, `normalizeTopFive`, `requestJson`, `lookupParticipant`, and `fetchTopFive`. Use `import.meta.env.VITE_API_BASE || '<current Apps Script URL>'`, `URLSearchParams`, HTTP status checks, JSON parsing guards, and error codes `NOT_FOUND`, `NETWORK`, and `INVALID_RESPONSE`. Do not expose total score from `normalizeTopFive`.

- [ ] **Step 6: Verify and commit Task 1**

Run: `npm.cmd test -- src/api/passtivalApi.test.js`

Expected: all API tests PASS.

Run: `npm.cmd run build`

Expected: Vite build succeeds once `src/main.jsx` mounts the temporary API-contract test shell.

Commit:

```powershell
git add package.json package-lock.json .gitignore index.html vite.config.js src/test src/api src/main.jsx
git commit -m "build: migrate passtival to vite"
```

---

### Task 2: Router And Session Restoration

**Files:**
- Create: `src/main.jsx`
- Create: `src/AppRouter.jsx`
- Create: `src/AppRouter.test.jsx`
- Create: `src/storage/examSession.js`
- Create: `src/storage/examSession.test.js`
- Create: `src/pages/OnboardingPage.jsx`
- Create: `src/pages/PersonalResultPage.jsx`
- Create: `src/pages/TopFivePage.jsx`

**Interfaces:**
- Consumes: `lookupParticipant(examNumber)` from Task 1.
- Produces: `saveExamNumber(value)`, `readExamNumber()`, `clearExamNumber()`, and the three stable routes.

- [ ] **Step 1: Write failing session tests**

```js
import { beforeEach, expect, it } from 'vitest';
import { clearExamNumber, readExamNumber, saveExamNumber } from './examSession';

beforeEach(() => sessionStorage.clear());

it('stores a trimmed exam number for this session', () => {
  saveExamNumber(' 00123 ');
  expect(readExamNumber()).toBe('00123');
  clearExamNumber();
  expect(readExamNumber()).toBeNull();
});
```

- [ ] **Step 2: Run session tests and verify failure**

Run: `npm.cmd test -- src/storage/examSession.test.js`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement session helpers**

Use one private key, `passtival.examNumber`, reject blank values, and return `null` when absent.

- [ ] **Step 4: Write failing router tests**

Render `AppRouter` in `MemoryRouter` and assert:

```jsx
it('redirects a result route without a session to lookup mode', async () => {
  sessionStorage.clear();
  render(<MemoryRouter initialEntries={['/my-ranking']}><AppRouter /></MemoryRouter>);
  expect(await screen.findByRole('dialog', { name: '수험번호 입력' })).toBeInTheDocument();
});
```

- [ ] **Step 5: Implement route shell and initial page components**

`AppRouter` defines `/`, `/my-ranking`, and `/top5`. The personal page redirects missing sessions to `/?lookup=1`. `OnboardingPage` reads and removes `lookup=1` after opening its sheet. `main.jsx` mounts `HashRouter` and imports global styles.

- [ ] **Step 6: Verify and commit Task 2**

Run: `npm.cmd test -- src/storage/examSession.test.js src/AppRouter.test.jsx`

Expected: all session and router tests PASS.

Commit:

```powershell
git add src/main.jsx src/AppRouter* src/storage src/pages
git commit -m "feat: add passtival routes and session restore"
```

---

### Task 3: Figma Assets, Onboarding, And Exam Lookup Sheet

**Files:**
- Create: `src/assets/passtival-title.png`
- Create: `src/assets/athlete-hero.png`
- Create: `src/components/ExamLookupSheet.jsx`
- Create: `src/components/ExamLookupSheet.test.jsx`
- Modify: `src/pages/OnboardingPage.jsx`
- Create: `src/pages/OnboardingPage.test.jsx`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/styles/onboarding.css`
- Create: `src/styles/exam-sheet.css`

**Interfaces:**
- Consumes: `lookupParticipant`, `saveExamNumber`, and navigation from Tasks 1-2.
- Produces: accessible lookup flow and locally stored Figma assets.

- [ ] **Step 1: Download and verify Figma assets**

Use Figma MCP file `cBxcRSzFtX7KESunY7GXMm`: title image from node `1845:5192` and athlete image from node `1872:1238`. Save both under `src/assets` and inspect dimensions with `System.Drawing.Image`. Expected: valid non-empty PNG files with no embedded UI text except the title artwork itself.

- [ ] **Step 2: Write failing sheet interaction tests**

Cover empty submit, successful submit, not found, network retry, Escape close, and focus return. The success assertion is:

```jsx
await user.type(screen.getByLabelText('수험번호'), '00123');
await user.click(screen.getByRole('button', { name: '기록 확인하기' }));
await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('00123'));
```

- [ ] **Step 3: Run sheet tests and verify failure**

Run: `npm.cmd test -- src/components/ExamLookupSheet.test.jsx`

Expected: FAIL because `ExamLookupSheet` does not exist.

- [ ] **Step 4: Implement the sheet and onboarding flow**

Use `role="dialog"`, `aria-modal="true"`, an explicit label, inline `role="alert"`, submit disabling, initial focus, Escape handling, and focus restoration. `OnboardingPage` shows `내 순위 확인하기` and `TOP 5 순위`; successful lookup stores the exam number and navigates to `/my-ranking`.

- [ ] **Step 5: Implement Figma-based CSS**

Define tokens including `--color-bg: #000`, `--color-navy: #040b20`, `--color-blue: #0149ef`, `--color-gray-6: #f8f8fc`, `--color-gray-4: #e4e6f0`, and `--color-gray-3: #b7b9c9`. Match the 390x844 reference while using `min-height: 100svh`, safe-area padding, stable button dimensions, and a centered desktop maximum width.

- [ ] **Step 6: Verify and commit Task 3**

Run: `npm.cmd test -- src/components/ExamLookupSheet.test.jsx src/pages/OnboardingPage.test.jsx`

Expected: onboarding and lookup tests PASS.

Commit:

```powershell
git add src/assets src/components/ExamLookupSheet* src/pages/OnboardingPage* src/styles
git commit -m "feat: build animated participant lookup entry"
```

---

### Task 4: Personal Result Page

**Files:**
- Create: `src/components/TopBar.jsx`
- Create: `src/components/AsyncState.jsx`
- Create: `src/components/RecordList.jsx`
- Create: `src/components/RecordList.test.jsx`
- Modify: `src/pages/PersonalResultPage.jsx`
- Create: `src/pages/PersonalResultPage.test.jsx`
- Create: `src/styles/personal-result.css`
- Create: `src/styles/shared.css`

**Interfaces:**
- Consumes: normalized participant data, `readExamNumber`, and `athlete-hero.png`.
- Produces: Figma-aligned personal result with retry and five-record rendering.

- [ ] **Step 1: Write failing record-list tests**

Use the exact label order and assert null values render `미응시`:

```jsx
render(<RecordList records={{
  standingLongJump: 277,
  backStrength: null,
  shuttleRun10m: 9.17,
  medicineBall: 8.9,
  sitAndReach: 12.5,
}} />);
expect(screen.getByText('배근력').nextElementSibling).toHaveTextContent('미응시');
expect(screen.getByText('좌전굴(선택)')).toBeInTheDocument();
```

- [ ] **Step 2: Run result tests and verify failure**

Run: `npm.cmd test -- src/components/RecordList.test.jsx src/pages/PersonalResultPage.test.jsx`

Expected: FAIL because the result components are incomplete.

- [ ] **Step 3: Implement result fetching states**

On mount, read the session exam number and call `lookupParticipant`. Render a dimensionally stable skeleton while loading, the result on success, and a retry action on service failure. Redirect missing sessions through `/?lookup=1`.

- [ ] **Step 4: Implement the Figma composition**

Render the top bar, local athlete image, navy fade, name, exam number, center/grade/gender/group metadata, current rank, total count, and `RecordList`. Format numeric counts with `Intl.NumberFormat('ko-KR')`. Do not render or pass through total score.

- [ ] **Step 5: Verify and commit Task 4**

Run: `npm.cmd test -- src/components/RecordList.test.jsx src/pages/PersonalResultPage.test.jsx`

Expected: all result tests PASS.

Commit:

```powershell
git add src/components/TopBar* src/components/AsyncState* src/components/RecordList* src/pages/PersonalResultPage* src/styles
git commit -m "feat: rebuild personal result experience"
```

---

### Task 5: Exact-Group TOP 5 Page

**Files:**
- Create: `src/components/RankingTabs.jsx`
- Create: `src/components/RankingTabs.test.jsx`
- Create: `src/components/TopFiveList.jsx`
- Create: `src/components/TopFiveList.test.jsx`
- Modify: `src/pages/TopFivePage.jsx`
- Create: `src/pages/TopFivePage.test.jsx`
- Create: `src/styles/top-five.css`

**Interfaces:**
- Consumes: `GROUPS` and `fetchTopFive(group)` from Task 1.
- Produces: exact-group tabs, current ranking retrieval, and short/empty result handling.

- [ ] **Step 1: Write failing tab and list tests**

```jsx
expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
  '고3 남자', '고3 여자', '고2 남자', '고2 여자',
]);

await user.click(screen.getByRole('tab', { name: '고2 여자' }));
expect(fetchTopFive).toHaveBeenLastCalledWith('고2 여자');
expect(screen.queryByText(/점$/)).not.toBeInTheDocument();
```

Also assert a two-person response renders two rows and an empty response renders the neutral empty state.

- [ ] **Step 2: Run TOP 5 tests and verify failure**

Run: `npm.cmd test -- src/components/RankingTabs.test.jsx src/components/TopFiveList.test.jsx src/pages/TopFivePage.test.jsx`

Expected: FAIL because the ranking components are not implemented.

- [ ] **Step 3: Implement tabs and fetch lifecycle**

Use ARIA tabs with stable-width labels and the first exact group as default. Refetch on tab selection and browser refresh. Abort stale requests or ignore outdated responses so fast tab changes cannot replace the newest group.

- [ ] **Step 4: Implement premium ranking presentation**

Render rank, full name, and center only. Give ranks 1-3 distinct but restrained treatments, preserve identical row geometry across loading and loaded states, and keep tabs horizontally scrollable at 320px.

- [ ] **Step 5: Verify and commit Task 5**

Run: `npm.cmd test -- src/components/RankingTabs.test.jsx src/components/TopFiveList.test.jsx src/pages/TopFivePage.test.jsx`

Expected: all ranking tests PASS.

Commit:

```powershell
git add src/components/RankingTabs* src/components/TopFiveList* src/pages/TopFivePage* src/styles/top-five.css
git commit -m "feat: add exact-group top five rankings"
```

---

### Task 6: Motion, Responsive QA, Cleanup, And Production Verification

**Files:**
- Create: `src/motion.js`
- Create: `src/motion.test.js`
- Modify: `src/AppRouter.jsx`
- Modify: `src/pages/OnboardingPage.jsx`
- Modify: `src/pages/PersonalResultPage.jsx`
- Modify: `src/pages/TopFivePage.jsx`
- Modify: `src/components/ExamLookupSheet.jsx`
- Modify: `src/styles/*.css`
- Modify: `README.md`
- Delete: obsolete CRA source files and unused legacy components after replacement

**Interfaces:**
- Consumes: all completed page components.
- Produces: coordinated route, sheet, section, and list transitions with reduced-motion fallback and a verified production build.

- [ ] **Step 1: Write failing motion-policy tests**

Export `createMotionVariants(reduceMotion)` and assert reduced motion removes translation, scale, spring, and stagger:

```js
const reduced = createMotionVariants(true);
expect(reduced.page.enter.y).toBe(0);
expect(reduced.list.visible.transition.staggerChildren).toBe(0);
expect(reduced.sheet.visible.transition.type).not.toBe('spring');
```

- [ ] **Step 2: Run motion tests and verify failure**

Run: `npm.cmd test -- src/motion.test.js`

Expected: FAIL because `motion.js` does not exist.

- [ ] **Step 3: Implement coordinated motion**

Use `useReducedMotion`, `AnimatePresence`, 160-240ms page fades, restrained 8-16px translations, spring sheet entrance, onboarding/record/list staggers, active-tab indicator layout animation, and small press feedback. Never animate numeric count-up or loop decorative effects.

- [ ] **Step 4: Remove obsolete CRA implementation**

Delete `src/index.js`, `src/reportWebVitals.js`, `src/setupTests.js`, `src/nprogress.js`, the old page files, and legacy components/CSS that are no longer imported. Remove CRA-only public manifest assets when not referenced. Verify with `rg` that no import resolves to a deleted file.

- [ ] **Step 5: Run full automated verification**

Run: `npm.cmd test`

Expected: all test files PASS with no unhandled promise or React `act` warnings.

Run: `npm.cmd run build`

Expected: Vite production build succeeds with no unresolved assets or ESLint/runtime warnings.

- [ ] **Step 6: Start the app and perform browser QA**

Run: `npm.cmd run dev -- --host 127.0.0.1`

Check 390x844, 320x568, 768x1024, and 1440x900. Compare onboarding and personal result against the Figma screenshots. Verify no blank canvas, clipped text, overlap, horizontal page scroll, or layout shift. Exercise keyboard focus, Escape dismissal, reduced-motion emulation, all four tabs, retry states, and a refreshed personal-result route.

- [ ] **Step 7: Update README and commit Task 6**

Document `npm install`, `npm run dev`, `npm test`, `npm run build`, `VITE_API_BASE`, routes, and GitHub Pages deployment.

Commit:

```powershell
git add -A
git commit -m "feat: complete premium passtival experience"
```

Run final evidence commands:

```powershell
git status --short
git log --oneline -8
npm.cmd test
npm.cmd run build
```

Expected: clean working tree, task commits present, all tests pass, and production build succeeds.
