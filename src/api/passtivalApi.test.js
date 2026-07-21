import { describe, expect, it, vi } from 'vitest';
import {
  GROUPS,
  PasstivalApiError,
  fetchTopFive,
  lookupParticipant,
  normalizeParticipant,
  normalizeTopFive,
} from './passtivalApi';

describe('passtival API contract', () => {
  it('uses exact Apps Script group names', () => {
    expect(GROUPS).toEqual(['고3 남자', '고3 여자', '고2 남자', '고2 여자']);
  });

  it('normalizes personal records and blank values', () => {
    expect(normalizeParticipant({
      examNumber: 101,
      name: '김민수',
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
    })).toEqual({
      examNumber: '101',
      name: '김민수',
      center: '서울센터',
      gender: '남자',
      grade: '고3',
      group: '고3 남자',
      rank: 233,
      totalCount: 1233,
      records: {
        standingLongJump: 277,
        backStrength: null,
        shuttleRun10m: 9.17,
        medicineBall: 8.9,
        sitAndReach: 12.5,
      },
    });
  });

  it('normalizes legacy field aliases', () => {
    expect(normalizeParticipant({
      exam_number: '00101',
      userName: '김민수',
      branch: '서울센터',
      sex: '남자',
      schoolGrade: '고3',
      filter: '고3 남자',
      ranking: 1,
      count: 2,
      standingLongJump: '277',
      back: '41',
      run_10m: '9.17',
      medBall: '8.9',
      sitReach: '12.5',
    })).toEqual({
      examNumber: '00101',
      name: '김민수',
      center: '서울센터',
      gender: '남자',
      grade: '고3',
      group: '고3 남자',
      rank: 1,
      totalCount: 2,
      records: {
        standingLongJump: '277',
        backStrength: '41',
        shuttleRun10m: '9.17',
        medicineBall: '8.9',
        sitAndReach: '12.5',
      },
    });
  });

  it('unwraps top-five result rows without scores', () => {
    expect(normalizeTopFive({ result: [{ name: '김민수', center: '서울센터', score: 99 }] }))
      .toEqual([{ name: '김민수', center: '서울센터' }]);
  });

  it('normalizes an empty top-five response', () => {
    expect(normalizeTopFive({ result: [] })).toEqual([]);
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

  it.each([null, []])('maps an empty personal result to a stable error code', async (result) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result }),
    }));

    await expect(lookupParticipant('101')).rejects.toEqual(
      expect.objectContaining({ code: PasstivalApiError.NOT_FOUND }),
    );
  });

  it('URL-encodes top-five groups', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: [] }),
    });
    vi.stubGlobal('fetch', fetch);

    await fetchTopFive('고3 남자&test');

    expect(fetch.mock.calls[0][0]).toContain('filter=%EA%B3%A03+%EB%82%A8%EC%9E%90%26test');
  });

  it('maps network and invalid responses to stable error codes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(lookupParticipant('101')).rejects.toEqual(
      expect.objectContaining({ code: PasstivalApiError.NETWORK }),
    );

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    }));
    await expect(lookupParticipant('101')).rejects.toEqual(
      expect.objectContaining({ code: PasstivalApiError.INVALID_RESPONSE }),
    );
  });
});
