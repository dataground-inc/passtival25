import { readFileSync } from 'node:fs';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { lookupParticipant } from '../api/passtivalApi';
import athleteHeroFemale from '../assets/athlete-hero-female.png';
import athleteHero from '../assets/athlete-hero.png';
import { saveExamNumber } from '../storage/examSession';
import { PersonalResultPage } from './PersonalResultPage';

const personalResultStyles = readFileSync(
  'src/styles/personal-result.css',
  'utf8',
);

vi.mock('../api/passtivalApi', async () => {
  const actual = await vi.importActual('../api/passtivalApi');

  return {
    ...actual,
    lookupParticipant: vi.fn(),
  };
});

const participant = {
  examNumber: '00123',
  name: '한지훈',
  center: '서울센터',
  grade: '고3',
  gender: '남학생',
  group: '고3 남자',
  rank: 233,
  totalCount: 1233,
  records: {
    standingLongJump: 277,
    backStrength: 180,
    shuttleRun10m: 9.17,
    medicineBall: 8.9,
    sitAndReach: 12.5,
  },
  totalScore: 999,
};

beforeEach(() => {
  sessionStorage.clear();
  lookupParticipant.mockReset();
  window.scrollTo = vi.fn();
});

function LocationProbe() {
  const location = useLocation();

  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
}

function renderPage(initialEntry = '/my-ranking') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/my-ranking" element={<PersonalResultPage />} />
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

it('gives guidance the full result content width while preserving natural wrapping', () => {
  const guidanceRule = personalResultStyles.match(
    /\.personal-result__guidance\s*\{([^}]*)\}/,
  )?.[1];

  expect(guidanceRule).toContain('margin: 11px 0 0;');
  expect(guidanceRule).not.toMatch(/\bwhite-space\s*:\s*nowrap/);
});

it('matches the Figma participant metadata typography', () => {
  const metadataRule = personalResultStyles.match(
    /\.personal-result__metadata\s*\{([^}]*)\}/,
  )?.[1];

  expect(metadataRule).toContain('color: var(--color-gray-4);');
  expect(metadataRule).toContain('font-size: 14px;');
  expect(metadataRule).toContain('font-weight: 400;');
  expect(metadataRule).toContain('line-height: 18px;');
});

it('restores the session and renders every required participant result field', async () => {
  saveExamNumber('00123');
  lookupParticipant.mockResolvedValue(participant);

  renderPage();

  expect(await screen.findByRole('heading', { name: '한지훈' })).toBeInTheDocument();
  expect(lookupParticipant).toHaveBeenCalledWith('00123');
  expect(screen.getByText('233위')).toBeInTheDocument();
  expect(screen.getByText('총 1,233명 중')).toBeInTheDocument();
  expect(screen.getByText('메디신볼던지기').nextElementSibling).toHaveTextContent('8.9');
  expect(screen.queryByText('999')).not.toBeInTheDocument();
});

it('shows only center, grade, and normalized male gender in metadata', async () => {
  saveExamNumber('00123');
  lookupParticipant.mockResolvedValue({ ...participant, gender: '남자' });

  const { container } = renderPage();

  expect(await screen.findByRole('heading', { name: '한지훈' })).toBeInTheDocument();

  const metadata = screen.getByLabelText('참가자 정보');
  expect(
    [...metadata.querySelectorAll(':scope > span')].map((field) => field.textContent),
  ).toEqual(['서울센터', '고3', '남학생']);
  expect(within(metadata).queryByText('고3 남자')).not.toBeInTheDocument();
  expect(screen.queryByText('00123')).not.toBeInTheDocument();
  expect(container.querySelector('.personal-result__athlete')).toHaveAttribute(
    'src',
    athleteHero,
  );
});

it.each(['여자', '여학생'])(
  'normalizes female gender %s and uses the female hero',
  async (gender) => {
    saveExamNumber('00123');
    lookupParticipant.mockResolvedValue({ ...participant, gender });

    const { container } = renderPage();

    expect(await screen.findByRole('heading', { name: '한지훈' })).toBeInTheDocument();
    expect(screen.getByLabelText('참가자 정보')).toHaveTextContent('여학생');
    expect(container.querySelector('.personal-result__athlete')).toHaveAttribute(
      'src',
      athleteHeroFemale,
    );
  },
);

it.each([undefined, '', '기타'])(
  'normalizes missing or unknown gender %p as 미응시',
  async (gender) => {
    saveExamNumber('00123');
    lookupParticipant.mockResolvedValue({ ...participant, gender });

    const { container } = renderPage();

    expect(await screen.findByRole('heading', { name: '한지훈' })).toBeInTheDocument();

    const metadata = screen.getByLabelText('참가자 정보');
    expect(within(metadata).getByText('미응시')).toBeInTheDocument();
    expect(container.querySelector('.personal-result__athlete')).toHaveAttribute(
      'src',
      athleteHero,
    );
  },
);

it('renders missing identity and rank values as 미응시 without empty or zero output', async () => {
  saveExamNumber('00123');
  lookupParticipant.mockResolvedValue({
    ...participant,
    examNumber: '   ',
    name: '',
    center: null,
    grade: undefined,
    gender: ' ',
    group: '',
    rank: null,
    totalCount: null,
  });

  renderPage();

  expect(await screen.findByRole('heading', { name: '미응시' })).toBeInTheDocument();

  const metadata = screen.getByLabelText('참가자 정보');
  expect(within(metadata).getAllByText('미응시')).toHaveLength(3);
  expect(
    [...metadata.querySelectorAll(':scope > span')].every((field) => field.textContent.trim()),
  ).toBe(true);

  const ranking = screen.getByRole('region', { name: '현재 순위' });
  expect(within(ranking).getAllByText('미응시')).toHaveLength(2);
  expect(within(ranking).queryByText('0위')).not.toBeInTheDocument();
  expect(within(ranking).queryByText('총 0명 중')).not.toBeInTheDocument();
  expect(within(ranking).queryByText(/^위$/)).not.toBeInTheDocument();
  expect(within(ranking).queryByText(/^총\s*명 중$/)).not.toBeInTheDocument();
});

it('keeps the result shell mounted while loading', () => {
  saveExamNumber('00123');
  lookupParticipant.mockReturnValue(new Promise(() => {}));

  renderPage();

  expect(screen.getByRole('main')).toHaveClass('personal-result');
  expect(screen.getByRole('status')).toHaveTextContent('결과를 불러오는 중입니다.');
  expect(screen.getByRole('banner')).toHaveClass('top-bar--fixed');
});

it('resets the viewport to the top when the result route opens', () => {
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  saveExamNumber('00123');
  lookupParticipant.mockReturnValue(new Promise(() => {}));

  renderPage();

  expect(scrollTo).toHaveBeenCalledWith(0, 0);
});

it('shows a retry action after a service failure and loads the next attempt', async () => {
  const user = userEvent.setup();
  saveExamNumber('00123');
  lookupParticipant
    .mockRejectedValueOnce(new Error('network unavailable'))
    .mockResolvedValueOnce(participant);

  renderPage();

  expect(await screen.findByRole('alert')).toHaveTextContent('결과를 불러오지 못했습니다.');
  await user.click(screen.getByRole('button', { name: '다시 시도' }));

  expect(await screen.findByRole('heading', { name: '한지훈' })).toBeInTheDocument();
  expect(lookupParticipant).toHaveBeenCalledTimes(2);
});

it('redirects a missing session to lookup mode without requesting data', async () => {
  renderPage();

  await waitFor(() => {
    expect(screen.getByTestId('location')).toHaveTextContent('/?lookup=1');
  });
  expect(lookupParticipant).not.toHaveBeenCalled();
});
