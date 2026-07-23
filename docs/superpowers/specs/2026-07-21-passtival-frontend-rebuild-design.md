# PASSTIVAL Frontend Rebuild Design

## Goal

Rebuild the participant-facing frontend around the approved Figma screens while preserving the existing Google Spreadsheet and Apps Script operating model. The app must let a participant look up personal results by exam number and browse the top five participants in each group.

## Scope

Included:

- Onboarding screen based on Figma node `1845:5163`
- Exam-number bottom sheet
- Personal result screen based on male node `1872:1237` and female node `1883:1380`
- Group TOP 5 screen
- Loading, empty, validation, and network-error states
- Mobile-first responsive layouts
- Apps Script response normalization
- Refresh-safe personal-result lookup within the same browser session

Excluded:

- Authentication or additional identity verification
- Automatic polling
- Admin record entry
- Full participant rankings
- Personal total-score display
- The existing promotional event page
- Changes to the Spreadsheet-based operating model

## Technical Direction

Replace Create React App with Vite and rebuild the frontend in React. Keep JavaScript and plain CSS so the migration stays small and the Figma measurements can be expressed directly without adding a styling framework.

Use hash-based routes because the application is deployed to GitHub Pages:

- `#/` - onboarding
- `#/my-ranking` - personal result
- `#/top5` - group TOP 5

The Apps Script base URL remains configurable in one API module. UI components never consume raw Apps Script rows directly; a normalization layer converts responses into stable frontend models.

## User Flows

### Personal Result

1. The user opens the onboarding screen.
2. The user selects `내 순위 확인하기`.
3. A bottom sheet opens and focuses the exam-number input.
4. The user submits an exam number.
5. The app validates and fetches the participant record.
6. On success, the app stores only the exam number in `sessionStorage` and routes to `#/my-ranking`.
7. The personal-result page fetches fresh data using that exam number.
8. Refreshing the page repeats the lookup. Leaving the browser session clears the stored exam number.

If the personal-result route has no stored exam number, it redirects to `#/?lookup=1`. The onboarding page reads that query flag, opens the lookup sheet once, and then removes the flag from the URL so a later refresh does not reopen it unexpectedly.

### TOP 5

1. The user selects `TOP 5 순위` on onboarding.
2. The app routes to `#/top5` and fetches the default group.
3. Selecting a group tab fetches that group's latest ranking.
4. Refreshing the page fetches current data again.

## Screen Design

### Onboarding

Preserve the black full-height layout, centered Figma title asset, and bottom-safe-area button placement from node `1845:5163`. Use two commands at the bottom:

- Primary: `내 순위 확인하기`
- Secondary: `TOP 5 순위`

The primary button uses the existing translucent blue treatment. The secondary command is visually quieter but remains a full-width accessible button.

### Exam Number Bottom Sheet

The modal includes a title, guidance text, numeric input, inline error text, close control, and `기록 확인하기` submit button. It supports overlay click, close button, and Escape dismissal. Focus is trapped while open and returned to the trigger after close.

Submission states are idle, submitting, invalid/not found, and network failure. Errors remain inside the sheet instead of using browser alerts.

### Personal Result

Preserve the Figma composition from male node `1872:1237` and female node `1883:1380`: gender-matched athlete image at the top, dark navy fade, fixed compact top bar, participant identity, rank block, and records list.

Display:

- Name, center, grade, and normalized `남학생` or `여학생`
- Group rank and total participant count
- Standing long jump, back strength, 10m shuttle run, medicine-ball throw, and sit-and-reach

Exam number and group remain part of the lookup/API contract but are not rendered in the participant identity block. Use `미응시` when a record is null, undefined, an empty string, or whitespace. Do not append units in the first release because the supplied data already mixes formatted and raw values; this avoids displaying incorrect duplicate units. The footer guidance is `실기 기록이 잘못되었다면 근처 기록 작성 스태프에게 문의해 주세요.`

### TOP 5

Use the same navy background, top bar, type scale, dividers, and spacing language as the personal-result page. Four horizontally scrollable tabs represent:

- 고3 남자
- 고3 여자
- 고2 남자
- 고2 여자

Rows show rank, full name, and center only. First place receives the strongest blue accent and largest rank numeral; second and third use restrained light accents; fourth and fifth use the standard row style. If fewer than five results exist, render only available rows.

## Data Contracts

Normalized personal result:

```js
{
  examNumber: string,
  name: string,
  gender: string,
  grade: string,
  center: string,
  group: string,
  rank: number | string,
  totalCount: number | string,
  records: {
    standingLongJump: string | number | null,
    backStrength: string | number | null,
    shuttleRun10m: string | number | null,
    medicineBall: string | number | null,
    sitAndReach: string | number | null
  }
}
```

Normalized TOP 5 row:

```js
{
  name: string,
  center: string
}
```

The Apps Script personal lookup must return gender, grade, center, group, rank, total participant count, and the five records. The old `run20m` mapping is replaced by `sitAndReach`. TOP 5 continues to use total score internally but does not expose it in the UI.

The exact group strings sent to and received from Apps Script are `고3 남자`, `고3 여자`, `고2 남자`, and `고2 여자`. The frontend does not translate these into broader `이상` or `이하` labels.

## Component Boundaries

- `AppRouter`: routes and route-level recovery
- `OnboardingPage`: entry commands and sheet ownership
- `ExamLookupSheet`: form state, validation, and accessibility
- `PersonalResultPage`: fresh participant fetch and page composition
- `TopFivePage`: group selection and ranking fetch
- `TopBar`, `AsyncState`, `RecordList`, `RankingTabs`, `TopFiveList`: focused presentation components
- `api/passtivalApi`: request construction, error mapping, and response normalization
- `storage/examSession`: session-only exam-number persistence

## Error And Loading Behavior

- Reject an empty exam number before making a request.
- Treat API `error`, an empty result, and HTTP 404-like responses as not found.
- Treat network, parsing, and non-success HTTP failures as retryable service errors.
- Keep the submitted exam number in the sheet after an error.
- Show skeletons without changing page dimensions while data loads.
- Provide an explicit retry command on page-level failures.
- Show a neutral empty state when a TOP 5 group has no entries.

## Responsive And Accessibility Rules

The 390px Figma frames are the mobile reference. Content remains centered with a maximum width on larger screens while full-bleed backgrounds extend to the viewport. Respect device safe areas. Buttons and tabs have at least 44px touch targets. All interactive controls receive visible focus states, modal semantics, keyboard support, and descriptive labels. Text and records must reflow without overlap at 320px width and at 200% browser zoom.

## Motion Direction

Motion should make the service feel responsive and premium without delaying result access. Use Framer Motion for coordinated transitions and CSS for small control feedback.

- Onboarding title enters with a short fade and upward movement; the two commands follow with a restrained stagger.
- The exam lookup sheet uses a spring-based upward entrance and a fading overlay. Closing reverses the motion before unmounting.
- Route changes use a 160-240ms fade with slight vertical movement. Navigation remains immediate and never waits for decorative animation.
- Personal identity, rank, and record rows reveal in visual reading order with a subtle stagger. Numeric values do not count up because that can imply changing live data.
- TOP 5 rows animate only on first load and when changing groups; layout positions remain stable while loading.
- Buttons use small opacity or scale feedback, and tabs animate the active indicator without changing label widths.
- Respect `prefers-reduced-motion`: remove translation, scale, spring, and stagger effects while retaining instant state changes and short opacity transitions.

Avoid looping decoration, parallax, glow pulses, and animation that shifts content after it becomes interactive.

## Asset Handling

Download the title artwork and athlete image exposed by the Figma MCP into the project. Do not depend on the temporary Figma asset URLs at runtime. Optimize raster files without changing their visible crop and provide explicit dimensions to prevent layout shift.

## Verification

Automated tests cover:

- Apps Script response normalization
- Missing-record conversion to `미응시`
- Exam lookup success, not-found, and retryable failure states
- Session restoration and missing-session redirect
- TOP 5 group switching and short/empty result sets

Production verification includes a clean build and browser checks at 390x844, 320x568, tablet, and desktop sizes. The onboarding and personal-result screens are compared against their Figma screenshots, and all controls are exercised with keyboard and touch-sized viewports.

## Acceptance Criteria

- The onboarding screen matches the approved Figma direction and exposes both entry flows.
- `내 순위 확인하기` opens an accessible exam-number sheet.
- A valid lookup routes to a refresh-safe personal-result page.
- Personal information, group rank/count, and all five records render correctly.
- Missing records display `미응시`; personal total score is never shown.
- TOP 5 supports all four groups and displays only rank, name, and center.
- Transitions follow the motion direction and reduced-motion behavior without delaying interaction.
- Loading, empty, not-found, and network-error states are usable without browser alerts.
- The app builds for GitHub Pages and remains usable from 320px mobile through desktop widths.
