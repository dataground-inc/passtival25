# Loading Skeleton Design

## Goal

Show a blue shimmer skeleton while TOP 5 rankings or a participant's personal record are being requested, without changing the layout size when data arrives.

## Scope

- Replace the generic TOP 5 loading bars with five row-shaped skeletons that preserve the ranking list geometry.
- Add a personal-record loading state from exam-number submission until the record API finishes.
- Render a personal-result skeleton that mirrors the rank card and five record fields.
- Respect `prefers-reduced-motion` by showing static placeholders instead of shimmer animation.

## Data Flow

1. Selecting a TOP 5 filter sets its existing `loading` state before the request.
2. The ranking list renders five `RankingSkeleton` rows until the response resolves or fails.
3. Submitting an exam number sets a new personal-record loading state before its request.
4. The app sets a root-level personal-record loading state and navigates to the personal-result route immediately; `MyRankingPage` renders `RecordSkeleton` while the request is pending.
5. On success, user data replaces the skeleton. On failure, loading ends, the existing alert is shown, and the app returns to the lookup screen.

## Components And Styling

- `SkeletonList` becomes a row-shaped TOP 5 placeholder using the existing `react-loading-skeleton` dependency.
- A dedicated personal-record skeleton component mirrors the rank card and three record groups, so the loaded and loading states have stable dimensions.
- Use the existing light neutral base with the established blue (`#0545FF`) highlight.
- The loading wrapper exposes `aria-busy="true"` and a screen-reader loading label.

## Verification

- TOP 5 loading renders five placeholders before data loads and no longer renders them after success.
- Personal record loading renders the rank and record placeholders while the request is pending and replaces them with returned data on success.
- Reduced-motion mode does not animate the placeholders.
