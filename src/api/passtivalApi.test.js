import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  GROUPS,
  PasstivalApiError,
  fetchTopFive,
  lookupParticipant,
  normalizeParticipant,
  normalizeTopFive,
} from './passtivalApi';

afterEach(() => vi.unstubAllGlobals());

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

  it.each([null, 'invalid row', []])('rejects malformed top-five rows', (row) => {
    let error;

    try {
      normalizeTopFive({ result: [row] });
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(PasstivalApiError);
    expect(error).toMatchObject({ code: PasstivalApiError.INVALID_RESPONSE });
  });

  it.each([
    { code: 'NOT_FOUND', error: 'Participant missing' },
    { error: 'Not found' },
  ])('maps a coded or legacy exact not-found response to NOT_FOUND', async (payload) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    }));

    await expect(lookupParticipant('101')).rejects.toEqual(
      expect.objectContaining({ code: PasstivalApiError.NOT_FOUND }),
    );
  });

  it.each([
    ['lookupParticipant', () => lookupParticipant('101')],
    ['fetchTopFive', () => fetchTopFive('고3 남자')],
  ])('maps INTERNAL_ERROR to retryable NETWORK for %s', async (label, operation) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: 'INTERNAL_ERROR', error: 'Sheet not found' }),
    }));

    await expect(operation()).rejects.toEqual(
      expect.objectContaining({ code: PasstivalApiError.NETWORK }),
    );
  });

  it.each([
    ['lookupParticipant', () => lookupParticipant('101')],
    ['fetchTopFive', () => fetchTopFive('고3 남자')],
  ])('maps uncoded backend errors to retryable NETWORK for %s', async (label, operation) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ error: 'Unexpected backend failure' }),
    }));

    await expect(operation()).rejects.toEqual(
      expect.objectContaining({ code: PasstivalApiError.NETWORK }),
    );
  });

  it('maps coded NOT_FOUND to NOT_FOUND for top-five requests', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: 'NOT_FOUND', error: 'Not found' }),
    }));

    await expect(fetchTopFive('고3 남자')).rejects.toEqual(
      expect.objectContaining({ code: PasstivalApiError.NOT_FOUND }),
    );
  });

  it('maps an HTTP 404 response to a stable error code', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
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

  it('uses the deployed default endpoint and URL-encodes an exact group', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: [] }),
    });
    vi.stubGlobal('fetch', fetch);

    await fetchTopFive('고3 남자');

    expect(fetch).toHaveBeenCalledWith(
      'https://script.google.com/macros/s/AKfycbxwQUaBUsLgm901g3FlfepQ2peKFWJEzdtOU8FAJKnbw5OyJ_VCCmHN-yA6c0hITZR8/exec?mode=top5&filter=%EA%B3%A03+%EB%82%A8%EC%9E%90',
    );
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
