# Design QA

## Comparison Targets

- Source visual truth:
  - Figma `cBxcRSzFtX7KESunY7GXMm`, onboarding node `1845:5163`
  - Figma personal-result male node `1872:1237`
  - Figma personal-result female node `1883:1380`
  - `.superpowers/sdd/screenshots/figma-personal-male-390x844.png`
  - `.superpowers/sdd/screenshots/figma-personal-female-390x844.png`
- Browser implementation:
  - `http://127.0.0.1:4173/passtival25/`
  - `.superpowers/sdd/screenshots/personal-result-male-viewport-390x844.png`
  - `.superpowers/sdd/screenshots/personal-result-female-viewport-390x844.png`
  - `.superpowers/sdd/screenshots/onboarding-390x844.png`
- Side-by-side evidence:
  - `.superpowers/sdd/screenshots/comparison-male-viewport-final.png`
  - `.superpowers/sdd/screenshots/comparison-female-viewport-final.png`

## Normalization

- CSS viewport: `390 x 844`
- Source pixels: `390 x 844`
- Implementation viewport pixels: `390 x 844`
- Device scale factor: `1`
- Browser chrome and device frames: excluded
- State: loaded participant result with rank and all five records
- Full-page captures were retained separately to check page overflow; the fidelity comparison uses equal-size viewport captures.

## Fidelity Review

- Fonts and typography: hierarchy, declared Pretendard stack, sizes, weights, line heights, wrapping, and zero letter spacing follow the Figma structure. Browser rasterization differs slightly from the Figma renderer but does not create an actionable hierarchy or wrapping mismatch.
- Spacing and layout: app bar, hero, participant identity, rank divider, rank block, and record panel align with the 390px reference. The record panel begins at the same viewport region and remains scrollable below the fold.
- Colors and tokens: navy, blue, gray text, dividers, and fade treatments use the Figma palette. The fixed app bar remains transparent over the hero as in the source.
- Image quality: male and female hero assets are local PNGs derived from the corresponding Figma nodes. They render at explicit dimensions without stretching, placeholders, or temporary Figma URLs.
- Copy and content: participant metadata is exactly center, grade, and normalized `남학생` or `여학생`. Group and exam number are absent. Rank and record labels match the approved content.

## Interaction Evidence

- Male and female API states were intercepted independently in a browser.
- Female input selected `athlete-hero-female.png`; male input selected `athlete-hero.png`.
- Fixed app-bar top position was `0` before and after a 500px scroll in both states.
- Horizontal overflow: none at 390px.
- Browser console and page errors: none.
- Existing responsive captures cover 320x568, 768x1024, and 1440x900; no horizontal page overflow was reported.
- Onboarding CTA, exam-number dialog, Escape dismissal, personal-result restoration, and TOP 5 tabs were exercised in the earlier browser QA pass.

## Comparison History

### Pass 1

- P2: participant metadata rendered at 12px gray instead of the Figma 14px gray-4 treatment.
- P2: the fixed app bar added an opaque navy/blur rectangle that was absent from the source.

Fixes:

- Updated metadata to 14px regular, 18px line height, `#e4e6f0`.
- Removed the app-bar background, blur, and shadow while retaining fixed positioning and z-index.

### Pass 2

- Evidence: `comparison-male-viewport-final.png` and `comparison-female-viewport-final.png`.
- No actionable P0, P1, or P2 differences remain.
- Focused region comparison was not separated from the full view because the 1:1 `780 x 844` side-by-side composites keep the app bar, identity metadata, rank text, and record rows readable at native density.

## Findings

No actionable P0, P1, or P2 visual findings remain.

## Follow-up Polish

- P3: font antialiasing can vary by operating system when Pretendard is unavailable locally; the existing system fallback preserves layout and readability.

final result: passed
