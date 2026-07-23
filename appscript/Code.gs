const SHEET_NAME = 'passtival_raw';

const COLUMN = Object.freeze({
  EXAM_NUMBER: 0,
  NAME: 1,
  GENDER: 2,
  GRADE: 3,
  CENTER: 4,
  STANDING_LONG_JUMP: 5,
  BACK_STRENGTH: 6,
  RUN_10M: 7,
  MEDICINE_BALL: 8,
  SIT_AND_REACH: 9,
  TOTAL_SCORE: 10,
  RANK: 11,
});

const TOP5_GROUPS = Object.freeze({
  '고3 남자': Object.freeze({ grades: ['고3', '재수이상'], gender: '남자' }),
  '고3 여자': Object.freeze({ grades: ['고3', '재수이상'], gender: '여자' }),
  '고2 남자': Object.freeze({ grades: ['고1', '고2'], gender: '남자' }),
  '고2 여자': Object.freeze({ grades: ['고1', '고2'], gender: '여자' }),
});

const ERROR_CODE = Object.freeze({
  NOT_FOUND: 'NOT_FOUND',
  INVALID_REQUEST: 'INVALID_REQUEST',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
});

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonError(code, error) {
  return jsonResponse({ code, error });
}

function normalizedExamNumber(value) {
  const trimmed = String(value === null || value === undefined ? '' : value).trim();
  return /^\d+$/.test(trimmed) ? trimmed.replace(/^0+(?=\d)/, '') : trimmed;
}

function hasFiniteScore(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  const decimalPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
  return decimalPattern.test(trimmed) && Number.isFinite(Number(trimmed));
}

function matchesGroup(row, group) {
  return group.grades.includes(row[COLUMN.GRADE])
    && row[COLUMN.GENDER] === group.gender;
}

function findGroup(grade, gender) {
  return Object.entries(TOP5_GROUPS).find(([, group]) => (
    group.grades.includes(grade) && group.gender === gender
  ));
}

function doGet(e) {
  try {
    const parameters = e && e.parameter ? e.parameter : {};
    const mode = parameters.mode;
    const examNumber = parameters.examNumber;
    const filter = parameters.filter;
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (!sheet) {
      return jsonError(ERROR_CODE.INTERNAL_ERROR, 'Sheet not found');
    }

    const values = sheet.getDataRange().getValues();
    const rows = values.slice(1);

    if (mode === 'top5') {
      if (!filter) {
        return jsonError(ERROR_CODE.INVALID_REQUEST, 'Missing filter parameter');
      }

      if (!Object.prototype.hasOwnProperty.call(TOP5_GROUPS, filter)) {
        return jsonError(ERROR_CODE.INVALID_REQUEST, 'Invalid filter parameter');
      }

      const group = TOP5_GROUPS[filter];
      const top5 = rows
        .filter((row) => (
          matchesGroup(row, group) && hasFiniteScore(row[COLUMN.TOTAL_SCORE])
        ))
        .sort((left, right) => (
          Number(right[COLUMN.TOTAL_SCORE]) - Number(left[COLUMN.TOTAL_SCORE])
        ))
        .slice(0, 5)
        .map((row) => ({
          name: row[COLUMN.NAME],
          center: row[COLUMN.CENTER],
        }));

      return jsonResponse({ result: top5 });
    }

    if (mode === 'exam') {
      if (examNumber === undefined || String(examNumber).trim() === '') {
        return jsonError(ERROR_CODE.INVALID_REQUEST, 'Missing examNumber parameter');
      }

      const requestedExamNumber = normalizedExamNumber(examNumber);
      const match = rows.find((row) => (
        normalizedExamNumber(row[COLUMN.EXAM_NUMBER]) === requestedExamNumber
      ));

      if (!match) {
        return jsonError(ERROR_CODE.NOT_FOUND, 'Not found');
      }

      const grade = match[COLUMN.GRADE];
      const gender = match[COLUMN.GENDER];
      const groupEntry = findGroup(grade, gender);
      const [groupName, group] = groupEntry || [`${grade} ${gender}`, null];
      const totalCount = group
        ? rows.filter((row) => matchesGroup(row, group)).length
        : rows.filter((row) => (
          row[COLUMN.GRADE] === grade && row[COLUMN.GENDER] === gender
        )).length;

      return jsonResponse({
        examNumber: match[COLUMN.EXAM_NUMBER],
        name: match[COLUMN.NAME],
        center: match[COLUMN.CENTER],
        gender,
        grade,
        group: groupName,
        jemul: match[COLUMN.STANDING_LONG_JUMP],
        backStrength: match[COLUMN.BACK_STRENGTH],
        run10m: match[COLUMN.RUN_10M],
        medicineBall: match[COLUMN.MEDICINE_BALL],
        sitAndReach: match[COLUMN.SIT_AND_REACH],
        rank: match[COLUMN.RANK],
        totalCount,
      });
    }

    return jsonError(ERROR_CODE.INVALID_REQUEST, 'Invalid request');
  } catch (error) {
    return jsonError(ERROR_CODE.INTERNAL_ERROR, 'Internal error');
  }
}
