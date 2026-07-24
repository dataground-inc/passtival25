# Loading Skeletons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display stable, blue-shimmer loading placeholders for TOP 5 rankings and personal performance records.

**Architecture:** Keep the existing `react-loading-skeleton` dependency and turn `SkeletonList` into a TOP 5 row placeholder. Add a focused `RecordSkeleton` component, then lift the personal lookup pending state to `Root` so the destination page can render it as soon as lookup starts.

**Tech Stack:** React 19, React Router 7, Create React App/Jest, React Testing Library, react-loading-skeleton 3.

## Global Constraints

- Use `#E4E6F0` as skeleton base color and `#0545FF` as highlight color.
- Render five TOP 5 placeholders with the same 60px row geometry as `.ranking-list`.
- Render a personal-result placeholder that mirrors the rank card and five record fields.
- Set `aria-busy="true"` and include a screen-reader loading label while either skeleton is shown.
- Disable shimmer motion when `prefers-reduced-motion: reduce` is active.
- Do not add dependencies or alter loaded TOP 5 or record content.

---

### Task 1: Shape and test the TOP 5 loading rows

**Files:**
- Modify: `src/components/SkeletonList.js`
- Create: `src/components/SkeletonList.css`
- Create: `src/components/SkeletonList.test.js`
- Modify: `src/App.js`

**Interfaces:**
- Consumes: `react-loading-skeleton` and the existing `loading` boolean in `App`.
- Produces: `<SkeletonList />`, a 60px accessible TOP 5 row placeholder.

- [ ] **Step 1: Write the failing component test**

```js
import { render, screen } from '@testing-library/react';
import { SkeletonList } from './SkeletonList';

test('renders an accessible TOP 5 row placeholder', () => {
  render(<SkeletonList />);

  expect(screen.getByRole('status', { name: 'TOP 5 순위를 불러오는 중' })).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByTestId('top5-skeleton-row')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm.cmd test -- --watchAll=false src/components/SkeletonList.test.js`

Expected: FAIL because the current component has neither the status region nor the test id.

- [ ] **Step 3: Implement the accessible row skeleton and reduced-motion styling**

```jsx
export const SkeletonList = () => (
  <div aria-busy="true" aria-label="TOP 5 순위를 불러오는 중" className="ranking-skeleton" role="status">
    <span className="sr-only">TOP 5 순위를 불러오는 중</span>
    <div data-testid="top5-skeleton-row" className="ranking-skeleton__row">
      <Skeleton className="ranking-skeleton__rank" height={36} width={34} />
      <Skeleton className="ranking-skeleton__name" height={20} width="32%" />
      <Skeleton className="ranking-skeleton__center" height={18} width="24%" />
    </div>
  </div>
);
```

```css
.ranking-skeleton { width: 100%; }
.ranking-skeleton__row { align-items: center; background: #0045ff; border-radius: 8px; display: flex; gap: 12px; height: 60px; padding: 0 16px; }
.ranking-skeleton__center { margin-left: auto; }
@media (prefers-reduced-motion: reduce) { .ranking-skeleton .react-loading-skeleton { --pseudo-element-display: none; } }
```

Ensure `src/App.js` continues to render exactly five `<SkeletonList />` elements while `loading` is true.

- [ ] **Step 4: Run the focused tests to verify they pass**

Run: `npm.cmd test -- --watchAll=false src/components/SkeletonList.test.js src/App.test.js`

Expected: PASS.

- [ ] **Step 5: Commit the TOP 5 skeleton**

```powershell
git add src/App.js src/components/SkeletonList.js src/components/SkeletonList.css src/components/SkeletonList.test.js
git commit -m "feat: add top five loading skeleton"
```

### Task 2: Add personal-record pending state and skeleton

**Files:**
- Create: `src/components/RecordSkeleton.js`
- Create: `src/components/RecordSkeleton.css`
- Create: `src/components/RecordSkeleton.test.js`
- Modify: `src/App.js`
- Modify: `src/index.js`
- Modify: `src/pages/MyRankingPage.js`
- Modify: `src/pages/MyRankingPage.css`
- Modify: `src/App.test.js`

**Interfaces:**
- Consumes: `recordLoading` and `setRecordLoading` owned by `Root` and passed through `ProgressRouter` to `App` and `MyRankingPage`.
- Produces: `<RecordSkeleton />` and a personal page that renders it while `recordLoading` is true.

- [ ] **Step 1: Write the failing skeleton and page tests**

```js
import { render, screen } from '@testing-library/react';
import { RecordSkeleton } from './RecordSkeleton';
import { MyRankingPage } from '../pages/MyRankingPage';

test('renders a stable personal-record loading placeholder', () => {
  render(<RecordSkeleton />);

  expect(screen.getByRole('status', { name: '내 기록을 불러오는 중' })).toHaveAttribute('aria-busy', 'true');
  expect(screen.getAllByTestId('record-skeleton-item')).toHaveLength(5);
});

test('shows a skeleton instead of a missing-data message while loading', () => {
  render(<MyRankingPage isLoading userData={null} />);

  expect(screen.getByRole('status', { name: '내 기록을 불러오는 중' })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm.cmd test -- --watchAll=false src/components/RecordSkeleton.test.js`

Expected: FAIL because `RecordSkeleton` and the `isLoading` prop do not yet exist.

- [ ] **Step 3: Implement `RecordSkeleton` and its styling**

```jsx
export const RecordSkeleton = () => (
  <section aria-busy="true" aria-label="내 기록을 불러오는 중" className="record-skeleton" role="status">
    <span className="sr-only">내 기록을 불러오는 중</span>
    <div className="record-skeleton__rank"><Skeleton height={16} width={72} /><Skeleton height={24} width={48} /></div>
    <div className="record-skeleton__records">
      {Array.from({ length: 5 }).map((_, index) => <div className="record-skeleton__item" data-testid="record-skeleton-item" key={index}><Skeleton height={14} width="44%" /><Skeleton height={22} width="60%" /></div>)}
    </div>
  </section>
);
```

```css
.record-skeleton { display: flex; flex-direction: column; gap: 24px; width: 100%; }
.record-skeleton__rank { align-items: center; background: linear-gradient(90deg, #0545ff10, #032999); border-radius: 12px; display: flex; gap: 16px; height: 60px; padding: 0 16px; }
.record-skeleton__records { display: grid; gap: 16px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.record-skeleton__item { background: #1c1c1c; border-radius: 8px; display: flex; flex-direction: column; gap: 4px; min-height: 58px; padding: 8px 16px; }
.record-skeleton__item:last-child { grid-column: 1 / -1; }
.sr-only { height: 1px; margin: -1px; overflow: hidden; padding: 0; position: absolute; white-space: nowrap; width: 1px; clip: rect(0, 0, 0, 0); }
@media (prefers-reduced-motion: reduce) { .record-skeleton .react-loading-skeleton { --pseudo-element-display: none; } }
```

Import `react-loading-skeleton/dist/skeleton.css`, `./RecordSkeleton.css`, and `Skeleton` from `react-loading-skeleton` in `RecordSkeleton.js`. Put `.sr-only` in `src/index.css` so both skeleton components can use it.

- [ ] **Step 4: Lift loading state and wire the destination page**

```jsx
const [recordLoading, setRecordLoading] = useState(false);

<ProgressRouter
  recordLoading={recordLoading}
  setRecordLoading={setRecordLoading}
  setUserData={setUserData}
  userData={userData}
/>
```

Pass `setRecordLoading` to `App`; in `handleExamSubmit`, call `setRecordLoading(true)` and navigate to `/my-ranking` before awaiting `fetch`. On success set user data; in `finally`, call `setRecordLoading(false)`. In the catch branch, retain the existing alert and navigate back to `/`. Pass `recordLoading` to `MyRankingPage` as `isLoading` and render `<RecordSkeleton />` before the existing missing-data guard.

- [ ] **Step 5: Run all relevant tests and build**

Run: `npm.cmd test -- --watchAll=false src/components/SkeletonList.test.js src/components/RecordSkeleton.test.js src/App.test.js`

Expected: PASS.

Run: `npm.cmd run build`

Expected: Build completes successfully with no ESLint errors.

- [ ] **Step 6: Commit the personal-record skeleton**

```powershell
git add src/App.js src/index.js src/pages/MyRankingPage.js src/pages/MyRankingPage.css src/components/RecordSkeleton.js src/components/RecordSkeleton.css src/components/RecordSkeleton.test.js src/App.test.js src/index.css
git commit -m "feat: add personal record loading skeleton"
```
