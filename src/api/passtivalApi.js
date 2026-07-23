const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://script.google.com/macros/s/AKfycbwHWNk3VeXEn-PsnngyCQtj3xtgupOUzw4QN-2-xAD0JVkfDMzHU_kBzcNAShWS4hJd/exec";

export const GROUPS = ["고3 남자", "고3 여자", "고2 남자", "고2 여자"];

export class PasstivalApiError extends Error {
  static NOT_FOUND = "NOT_FOUND";

  static NETWORK = "NETWORK";

  static INVALID_RESPONSE = "INVALID_RESPONSE";

  constructor(code, message = code) {
    super(message);
    this.name = "PasstivalApiError";
    this.code = code;
  }
}

function firstValue(payload, keys) {
  for (const key of keys) {
    if (payload[key] !== undefined) {
      return payload[key];
    }
  }

  return undefined;
}

function cleanText(value) {
  const cleaned = cleanRecord(value);
  return cleaned === null ? "" : String(cleaned);
}

export function cleanRecord(value) {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === "string" && value.trim() === "" ? null : value;
}

export function normalizeParticipant(payload) {
  const source =
    payload?.result && !Array.isArray(payload.result)
      ? payload.result
      : payload;
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    throw new PasstivalApiError(PasstivalApiError.INVALID_RESPONSE);
  }

  return {
    examNumber: cleanText(firstValue(source, ["examNumber", "exam_number"])),
    name: cleanText(firstValue(source, ["name", "userName"])),
    center: cleanText(firstValue(source, ["center", "branch"])),
    gender: cleanText(firstValue(source, ["gender", "sex"])),
    grade: cleanText(firstValue(source, ["grade", "schoolGrade"])),
    group: cleanText(firstValue(source, ["group", "filter"])),
    rank: cleanRecord(firstValue(source, ["rank", "ranking"])),
    totalCount: cleanRecord(firstValue(source, ["totalCount", "count"])),
    records: {
      standingLongJump: cleanRecord(
        firstValue(source, ["jemul", "standingLongJump"]),
      ),
      backStrength: cleanRecord(firstValue(source, ["backStrength", "back"])),
      shuttleRun10m: cleanRecord(firstValue(source, ["run10m", "run_10m"])),
      medicineBall: cleanRecord(
        firstValue(source, ["medicineBall", "medBall"]),
      ),
      sitAndReach: cleanRecord(firstValue(source, ["sitAndReach", "sitReach"])),
    },
  };
}

export function normalizeTopFive(payload) {
  const rows = Array.isArray(payload) ? payload : payload?.result;
  if (!Array.isArray(rows)) {
    throw new PasstivalApiError(PasstivalApiError.INVALID_RESPONSE);
  }

  return rows.map((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      throw new PasstivalApiError(PasstivalApiError.INVALID_RESPONSE);
    }

    return {
      name: cleanText(firstValue(row, ["name", "userName"])),
      center: cleanText(firstValue(row, ["center", "branch"])),
    };
  });
}

function buildUrl(params) {
  return `${API_BASE}?${new URLSearchParams(params)}`;
}

async function requestJson(params) {
  let response;

  try {
    response = await fetch(buildUrl(params));
  } catch {
    throw new PasstivalApiError(PasstivalApiError.NETWORK);
  }

  if (!response.ok) {
    throw new PasstivalApiError(
      response.status === 404
        ? PasstivalApiError.NOT_FOUND
        : PasstivalApiError.NETWORK,
    );
  }

  try {
    const payload = await response.json();
    if (!payload || typeof payload !== "object") {
      throw new Error("Expected an object response");
    }

    return payload;
  } catch {
    throw new PasstivalApiError(PasstivalApiError.INVALID_RESPONSE);
  }
}

function throwForApiError(payload) {
  const backendCode = typeof payload.code === "string" ? payload.code : "";
  const backendMessage =
    typeof payload.error === "string" ? payload.error.trim() : "";

  if (!backendCode && !backendMessage) {
    return;
  }

  const isNotFound =
    backendCode === PasstivalApiError.NOT_FOUND ||
    (!backendCode && backendMessage.toLowerCase() === "not found");
  throw new PasstivalApiError(
    isNotFound ? PasstivalApiError.NOT_FOUND : PasstivalApiError.NETWORK,
    backendMessage || backendCode,
  );
}

export async function lookupParticipant(examNumber) {
  const payload = await requestJson({
    mode: "exam",
    examNumber: String(examNumber),
  });
  throwForApiError(payload);

  if (
    Object.keys(payload).length === 0 ||
    payload.result === null ||
    (Array.isArray(payload.result) && payload.result.length === 0)
  ) {
    throw new PasstivalApiError(PasstivalApiError.NOT_FOUND);
  }

  return normalizeParticipant(payload);
}

export async function fetchTopFive(group) {
  const payload = await requestJson({ mode: "top5", filter: group });
  throwForApiError(payload);

  return normalizeTopFive(payload);
}
