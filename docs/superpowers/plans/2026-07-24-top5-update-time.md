# TOP5 조회 시각 표시 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** TOP5 랭킹을 성공적으로 불러온 시간을 `HH시 mm분 기준`으로 표시한다.

**Architecture:** `App`이 TOP5 응답 성공 시점의 브라우저 로컬 시간을 상태로 보관하고, 필터 옆의 전용 `update` 요소에서 렌더링한다. 시각 문자열은 시와 분을 각각 두 자리로 정규화하며, 실패 또는 로딩 시에는 표시하지 않는다.

**Tech Stack:** React 19, Create React App, React Testing Library, Jest, CSS

## Global Constraints

- 표시 문구는 정확히 `HH시 mm분 기준` 형식이며 시와 분은 두 자리 숫자다.
- 시간은 유효한 TOP5 배열 응답을 받은 직후의 브라우저 로컬 시간이다.
- 로딩 중과 요청 실패 시 조회 시각을 렌더링하지 않는다.
- 기존 사용자 변경 파일 `screenCapture1.png`은 수정하거나 스테이징하지 않는다.

---

### Task 1: TOP5 조회 시각의 테스트와 구현

**Files:**
- Modify: `src/App.test.js`
- Modify: `src/App.js`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: TOP5 API 응답 `{ result: Array }`와 전역 `Date`.
- Produces: 성공 응답 뒤 렌더링되는 `09시 05분 기준` 형식의 조회 시각 텍스트.

- [ ] **Step 1: Write the failing test**

`src/App.test.js`에 다음 테스트를 추가한다.

```js
test('shows the zero-padded TOP5 fetch time after a successful response', async () => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 6, 24, 9, 5));

  render(<App setUserData={jest.fn()} />);

  expect(await screen.findByText('09시 05분 기준')).toBeInTheDocument();
});
```

`afterEach`에 `jest.useRealTimers();`도 추가해 다른 테스트에 가짜 시간이 남지 않게 한다.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- --watchAll=false --runInBand src/App.test.js`

Expected: FAIL because the current rendered text uses unpadded hour and minute values.

- [ ] **Step 3: Write minimal implementation**

`src/App.js`에서 유효한 `data.result` 배열을 받은 분기에만 다음처럼 시각을 설정한다.

```js
const now = new Date();
const hour = String(now.getHours()).padStart(2, '0');
const minute = String(now.getMinutes()).padStart(2, '0');
setLastUpdate(`${hour}시 ${minute}분 기준`);
```

요청 시작 시와 `catch`에서 `setLastUpdate('')`를 호출한다. JSX는 `lastUpdate`가 비어 있지 않을 때에만 전용 요소를 렌더링한다.

```jsx
{lastUpdate && <div className="update">{lastUpdate}</div>}
```

`src/App.css`의 `.top-title .update` 선택자를 `.update`로 바꿔 실제 요소에 글꼴·색상을 적용한다.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- --watchAll=false --runInBand src/App.test.js`

Expected: PASS, including `shows the zero-padded TOP5 fetch time after a successful response`.

- [ ] **Step 5: Run the complete test suite**

Run: `npm.cmd test -- --watchAll=false --runInBand`

Expected: PASS with no failing test suites.

- [ ] **Step 6: Commit**

```powershell
git add src/App.js src/App.css src/App.test.js docs/superpowers/specs/2026-07-24-top5-update-time-design.md docs/superpowers/plans/2026-07-24-top5-update-time.md
git commit -m "feat: show top5 fetch time"
```

Expected: a commit containing only the TOP5 timestamp files, not `screenCapture1.png`.

## Self-Review

- Spec coverage: Task 1 covers two-digit formatting, successful-response timing, conditional visibility, direct styling, error cleanup, and automated verification.
- Placeholder scan: no placeholders or deferred work remain.
- Type consistency: `lastUpdate` remains a string state and is only rendered when non-empty.
