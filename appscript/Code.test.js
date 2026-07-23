import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';

const codePath = path.resolve(process.cwd(), 'appscript/Code.gs');
const source = fs.existsSync(codePath) ? fs.readFileSync(codePath, 'utf8') : '';

const HEADER = [
  '수험번호',
  '이름',
  '성별',
  '학년',
  '센터',
  '제자리멀리뛰기',
  '배근력',
  '10m 왕복달리기',
  '메디신볼',
  '좌전굴',
  '총점',
  '순위',
];

function createRow({
  examNumber,
  name,
  gender,
  grade,
  center,
  jemul = '',
  backStrength = '',
  run10m = '',
  medicineBall = '',
  sitAndReach = '',
  totalScore = '',
  rank = '',
}) {
  return [
    examNumber,
    name,
    gender,
    grade,
    center,
    jemul,
    backStrength,
    run10m,
    medicineBall,
    sitAndReach,
    totalScore,
    rank,
  ];
}

function loadCode(rows, { sheetExists = true, readThrows = false } = {}) {
  const context = {
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: (name) => (
          sheetExists && name === 'passtival_raw'
            ? {
              getDataRange: () => ({
                getValues: () => {
                  if (readThrows) {
                    throw new Error('Sheet read failed');
                  }

                  return [HEADER, ...rows];
                },
              }),
            }
            : null
        ),
      }),
    },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput: (text) => ({
        text,
        mimeType: null,
        setMimeType(mimeType) {
          this.mimeType = mimeType;
          return this;
        },
      }),
    },
  };

  vm.createContext(context);
  vm.runInContext(source, context, { filename: codePath });
  return context;
}

function request(context, parameters = {}) {
  const output = context.doGet({ parameter: parameters });
  expect(output.mimeType).toBe('application/json');
  return JSON.parse(output.text);
}

describe('deployed Apps Script contract', () => {
  it('defines a deployable doGet in the actual Code.gs source', () => {
    expect(source).not.toBe('');
    expect(loadCode([]).doGet).toBeTypeOf('function');
  });

  it('accepts only exact supported groups and never broadens grade membership', () => {
    const rows = [
      createRow({
        examNumber: 301,
        name: '고3 남자',
        gender: '남자',
        grade: '고3',
        center: '강남센터',
        totalScore: 100,
      }),
      createRow({
        examNumber: 201,
        name: '고2 남자',
        gender: '남자',
        grade: '고2',
        center: '부천센터',
        totalScore: 99,
      }),
      createRow({
        examNumber: 101,
        name: '고1 남자',
        gender: '남자',
        grade: '고1',
        center: '노원센터',
        totalScore: 120,
      }),
      createRow({
        examNumber: 401,
        name: '재수 남자',
        gender: '남자',
        grade: '재수이상',
        center: '분당센터',
        totalScore: 130,
      }),
    ];
    const context = loadCode(rows);

    expect(request(context, { mode: 'top5', filter: '고3 남자' })).toEqual({
      result: [{ name: '고3 남자', center: '강남센터' }],
    });
    expect(request(context, { mode: 'top5', filter: '고2 남자' })).toEqual({
      result: [{ name: '고2 남자', center: '부천센터' }],
    });
    expect(request(context, { mode: 'top5', filter: 'g3_plus_male' })).toEqual({
      code: 'INVALID_REQUEST',
      error: 'Invalid filter parameter',
    });
  });

  it.each([
    ['고3 남자', '고3', '남자'],
    ['고3 여자', '고3', '여자'],
    ['고2 남자', '고2', '남자'],
    ['고2 여자', '고2', '여자'],
  ])('maps the exact %s filter to grade %s and gender %s', (filter, grade, gender) => {
    const rows = [
      createRow({
        examNumber: `${grade}-${gender}`,
        name: filter,
        gender,
        grade,
        center: `${filter} 센터`,
        totalScore: 100,
      }),
      createRow({
        examNumber: `${grade}-other`,
        name: '다른 성별',
        gender: gender === '남자' ? '여자' : '남자',
        grade,
        center: '제외 센터',
        totalScore: 200,
      }),
    ];

    expect(request(loadCode(rows), { mode: 'top5', filter })).toEqual({
      result: [{ name: filter, center: `${filter} 센터` }],
    });
  });

  it('sorts finite nonblank scores descending and returns five score-free rows', () => {
    const rows = [
      createRow({ examNumber: 1, name: 'A', gender: '여자', grade: '고3', center: 'A센터', totalScore: 91 }),
      createRow({ examNumber: 2, name: 'B', gender: '여자', grade: '고3', center: 'B센터', totalScore: '105' }),
      createRow({ examNumber: 3, name: 'C', gender: '여자', grade: '고3', center: 'C센터', totalScore: '' }),
      createRow({ examNumber: 4, name: 'D', gender: '여자', grade: '고3', center: 'D센터', totalScore: 'not-a-score' }),
      createRow({ examNumber: 5, name: 'E', gender: '여자', grade: '고3', center: 'E센터', totalScore: 99 }),
      createRow({ examNumber: 6, name: 'F', gender: '여자', grade: '고3', center: 'F센터', totalScore: 88 }),
      createRow({ examNumber: 7, name: 'G', gender: '여자', grade: '고3', center: 'G센터', totalScore: 97 }),
      createRow({ examNumber: 8, name: 'H', gender: '여자', grade: '고3', center: 'H센터', totalScore: 93 }),
    ];

    expect(request(loadCode(rows), { mode: 'top5', filter: '고3 여자' })).toEqual({
      result: [
        { name: 'B', center: 'B센터' },
        { name: 'E', center: 'E센터' },
        { name: 'G', center: 'G센터' },
        { name: 'H', center: 'H센터' },
        { name: 'A', center: 'A센터' },
      ],
    });
  });

  it('excludes boolean, Date, and object scores instead of coercing them to numbers', () => {
    const rows = [
      createRow({ examNumber: 1, name: '숫자', gender: '여자', grade: '고2', center: 'A센터', totalScore: 10 }),
      createRow({ examNumber: 2, name: '문자 숫자', gender: '여자', grade: '고2', center: 'B센터', totalScore: ' 12.5 ' }),
      createRow({ examNumber: 3, name: '불리언', gender: '여자', grade: '고2', center: 'C센터', totalScore: true }),
      createRow({
        examNumber: 4,
        name: '날짜',
        gender: '여자',
        grade: '고2',
        center: 'D센터',
        totalScore: new Date('2026-01-01T00:00:00Z'),
      }),
      createRow({
        examNumber: 5,
        name: '객체',
        gender: '여자',
        grade: '고2',
        center: 'E센터',
        totalScore: { valueOf: () => 20 },
      }),
    ];

    expect(request(loadCode(rows), { mode: 'top5', filter: '고2 여자' })).toEqual({
      result: [
        { name: '문자 숫자', center: 'B센터' },
        { name: '숫자', center: 'A센터' },
      ],
    });
  });

  it('returns the complete exam contract from the correct columns', () => {
    const rows = [
      createRow({
        examNumber: 123,
        name: '김민수',
        gender: '남자',
        grade: '고3',
        center: '강남센터',
        jemul: 277,
        backStrength: '',
        run10m: 9.17,
        medicineBall: 8.9,
        sitAndReach: 12.5,
        totalScore: 400,
        rank: 1,
      }),
      createRow({
        examNumber: 124,
        name: '박민수',
        gender: '남자',
        grade: '고3',
        center: '노원센터',
        totalScore: 390,
        rank: 2,
      }),
      createRow({
        examNumber: 125,
        name: '이민수',
        gender: '여자',
        grade: '고3',
        center: '부천센터',
        totalScore: 395,
        rank: 1,
      }),
    ];

    expect(request(loadCode(rows), { mode: 'exam', examNumber: ' 00123 ' })).toEqual({
      examNumber: 123,
      name: '김민수',
      center: '강남센터',
      gender: '남자',
      grade: '고3',
      group: '고3 남자',
      jemul: 277,
      backStrength: '',
      run10m: 9.17,
      medicineBall: 8.9,
      sitAndReach: 12.5,
      rank: 1,
      totalCount: 2,
    });
  });

  it.each([
    { parameters: {}, expected: { code: 'INVALID_REQUEST', error: 'Invalid request' } },
    {
      parameters: { mode: 'top5' },
      expected: { code: 'INVALID_REQUEST', error: 'Missing filter parameter' },
    },
    {
      parameters: { mode: 'top5', filter: '고1 남자' },
      expected: { code: 'INVALID_REQUEST', error: 'Invalid filter parameter' },
    },
    {
      parameters: { mode: 'exam' },
      expected: { code: 'INVALID_REQUEST', error: 'Missing examNumber parameter' },
    },
    {
      parameters: { mode: 'exam', examNumber: '999' },
      expected: { code: 'NOT_FOUND', error: 'Not found' },
    },
  ])('returns JSON errors for invalid requests: $expected.error', ({ parameters, expected }) => {
    expect(request(loadCode([]), parameters)).toEqual(expected);
  });

  it('returns a JSON error when passtival_raw is missing', () => {
    expect(request(loadCode([], { sheetExists: false }), { mode: 'top5', filter: '고3 남자' }))
      .toEqual({ code: 'INTERNAL_ERROR', error: 'Sheet not found' });
  });

  it('returns a JSON INTERNAL_ERROR when reading the sheet throws', () => {
    expect(request(
      loadCode([], { readThrows: true }),
      { mode: 'top5', filter: '고3 남자' },
    )).toEqual({ code: 'INTERNAL_ERROR', error: 'Internal error' });
  });

  it('rejects inherited object keys as unsupported filters', () => {
    expect(request(loadCode([]), { mode: 'top5', filter: 'toString' }))
      .toEqual({ code: 'INVALID_REQUEST', error: 'Invalid filter parameter' });
  });
});
