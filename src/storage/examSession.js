const EXAM_NUMBER_KEY = 'passtival.examNumber';

export function saveExamNumber(value) {
  const examNumber = String(value ?? '').trim();

  if (!examNumber) {
    sessionStorage.removeItem(EXAM_NUMBER_KEY);
    return;
  }

  sessionStorage.setItem(EXAM_NUMBER_KEY, examNumber);
}

export function readExamNumber() {
  return sessionStorage.getItem(EXAM_NUMBER_KEY);
}

export function clearExamNumber() {
  sessionStorage.removeItem(EXAM_NUMBER_KEY);
}
