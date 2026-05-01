import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const eventsPath = path.join(rootDir, "src/data/events.json");
const filtersPath = path.join(rootDir, "src/data/filters.json");

const requiredEventStringFields = [
  "id",
  "title",
  "startTime",
  "neighborhood",
  "type",
  "host",
  "description",
];
const requiredEventBooleanFields = ["isFree", "isInviteOnly"];
const requiredEventNumberFields = ["lat", "lng"];
const optionalEventStringFields = ["endTime", "venue", "address", "registrationUrl"];
const supportedEventArrayFields = ["topics"];
const allowedEventFields = new Set([
  ...requiredEventStringFields,
  ...requiredEventBooleanFields,
  ...requiredEventNumberFields,
  ...optionalEventStringFields,
  ...supportedEventArrayFields,
]);
const canonicalStartTimes = ["Afternoon", "Evening", "Morning", "Noon"];

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isValidDateString(value) {
  return isNonEmptyString(value) && !Number.isNaN(new Date(value).valueOf());
}

function sanitizeExternalUrl(url) {
  if (!isNonEmptyString(url)) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "https:") {
      return null;
    }

    parsedUrl.username = "";
    parsedUrl.password = "";
    parsedUrl.hash = "";
    parsedUrl.search = "";
    parsedUrl.pathname = parsedUrl.pathname.replace(/\/edit\/?$/, "");

    return parsedUrl.toString();
  } catch {
    return null;
  }
}

function getStartTimeBucket(startTime) {
  const hour = new Date(startTime).getHours();

  if (hour < 12) {
    return "Morning";
  }

  if (hour === 12) {
    return "Noon";
  }

  if (hour < 17) {
    return "Afternoon";
  }

  return "Evening";
}

function sortStrings(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function buildFilters(events) {
  return {
    topics: sortStrings(new Set(events.flatMap((event) => event.topics))),
    neighborhoods: sortStrings(new Set(events.map((event) => event.neighborhood))),
    types: sortStrings(new Set(events.map((event) => event.type))),
    start_times: canonicalStartTimes.filter((bucket) =>
      events.some((event) => getStartTimeBucket(event.startTime) === bucket),
    ),
  };
}

function pushIssue(issueList, message, eventId = null) {
  issueList.push(eventId ? `${eventId}: ${message}` : message);
}

function validateEvents(events) {
  const errors = [];
  const warnings = [];
  const seenEventIds = new Set();
  const missingEndTimeEventIds = [];
  const missingRegistrationUrlEventIds = [];
  const duplicateRegistrationUrlMap = new Map();
  const dateValues = new Set();

  for (const [index, event] of events.entries()) {
    const label = isNonEmptyString(event?.id) ? event.id : `events[${index}]`;

    if (!event || typeof event !== "object" || Array.isArray(event)) {
      pushIssue(errors, "event must be a JSON object", label);
      continue;
    }

    for (const key of Object.keys(event)) {
      if (!allowedEventFields.has(key)) {
        pushIssue(warnings, `unexpected field "${key}"`, label);
      }
    }

    for (const field of requiredEventStringFields) {
      if (!isNonEmptyString(event[field])) {
        pushIssue(errors, `missing required string field "${field}"`, label);
      }
    }

    for (const field of requiredEventBooleanFields) {
      if (typeof event[field] !== "boolean") {
        pushIssue(errors, `missing required boolean field "${field}"`, label);
      }
    }

    for (const field of requiredEventNumberFields) {
      if (!isFiniteNumber(event[field])) {
        pushIssue(errors, `missing required number field "${field}"`, label);
      }
    }

    if (!Array.isArray(event.topics) || event.topics.length === 0) {
      pushIssue(errors, 'missing required non-empty array field "topics"', label);
    } else if (event.topics.some((topic) => !isNonEmptyString(topic))) {
      pushIssue(errors, 'field "topics" must only contain non-empty strings', label);
    }

    if (isNonEmptyString(event.id)) {
      if (seenEventIds.has(event.id)) {
        pushIssue(errors, "duplicate event id", event.id);
      }

      seenEventIds.add(event.id);
    }

    if (!isValidDateString(event.startTime)) {
      pushIssue(errors, 'field "startTime" must be a valid datetime string', label);
    } else {
      dateValues.add(event.startTime.slice(0, 10));
    }

    if (event.endTime !== undefined) {
      if (!isValidDateString(event.endTime)) {
        pushIssue(errors, 'field "endTime" must be a valid datetime string when present', label);
      } else if (isValidDateString(event.startTime)) {
        const startTime = new Date(event.startTime).valueOf();
        const endTime = new Date(event.endTime).valueOf();

        if (endTime < startTime) {
          pushIssue(errors, 'field "endTime" must be later than or equal to "startTime"', label);
        }
      }
    } else {
      missingEndTimeEventIds.push(label);
    }

    if (event.registrationUrl !== undefined) {
      if (sanitizeExternalUrl(event.registrationUrl) === null) {
        pushIssue(errors, 'field "registrationUrl" must be a safe https URL when present', label);
      } else {
        const registrationUrl = sanitizeExternalUrl(event.registrationUrl);
        const ids = duplicateRegistrationUrlMap.get(registrationUrl) ?? [];

        ids.push(label);
        duplicateRegistrationUrlMap.set(registrationUrl, ids);
      }
    } else {
      missingRegistrationUrlEventIds.push(label);
    }
  }

  const duplicateRegistrationUrls = [...duplicateRegistrationUrlMap.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([url, ids]) => ({ ids, url }));

  if (missingEndTimeEventIds.length > 0) {
    warnings.push(
      `${missingEndTimeEventIds.length} events are missing "endTime"`,
    );
  }

  if (missingRegistrationUrlEventIds.length > 0) {
    warnings.push(
      `${missingRegistrationUrlEventIds.length} events are missing "registrationUrl"`,
    );
  }

  if (duplicateRegistrationUrls.length > 0) {
    warnings.push(
      `${duplicateRegistrationUrls.length} registration URLs are shared by multiple events`,
    );
  }

  return {
    dateValues: sortStrings(dateValues),
    duplicateRegistrationUrls,
    errors,
    totalEvents: events.length,
    warnings,
  };
}

function validateFilters(events, filters) {
  const errors = [];
  const expectedFilters = buildFilters(events);

  if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
    return {
      errors: ['filters.json must be a JSON object with "topics", "neighborhoods", "types", and "start_times" arrays'],
      expectedFilters,
    };
  }

  for (const key of ["topics", "neighborhoods", "types", "start_times"]) {
    if (!Array.isArray(filters[key])) {
      pushIssue(errors, `filters.json is missing array field "${key}"`);
      continue;
    }

    if (filters[key].some((value) => !isNonEmptyString(value))) {
      pushIssue(errors, `filters.json field "${key}" must only contain non-empty strings`);
    }
  }

  for (const [key, expectedValues] of Object.entries(expectedFilters)) {
    const actualValues = filters[key];

    if (!Array.isArray(actualValues)) {
      continue;
    }

    const actualSerialized = JSON.stringify(actualValues);
    const expectedSerialized = JSON.stringify(expectedValues);

    if (actualSerialized !== expectedSerialized) {
      pushIssue(
        errors,
        `filters.json field "${key}" is out of sync with events.json`,
      );
    }
  }

  return { errors, expectedFilters };
}

function printValidationReport(eventReport, filterErrors) {
  const totalErrors = eventReport.errors.length + filterErrors.length;

  if (totalErrors === 0) {
    console.log("Data validation passed.");
  } else {
    console.log("Data validation failed.");
  }

  console.log(`Events: ${eventReport.totalEvents}`);
  console.log(`Dates: ${eventReport.dateValues.join(", ")}`);
  console.log(`Errors: ${totalErrors}`);
  console.log(`Warnings: ${eventReport.warnings.length}`);

  if (eventReport.errors.length > 0) {
    console.log("\nEvent errors:");
    for (const error of eventReport.errors) {
      console.log(`- ${error}`);
    }
  }

  if (filterErrors.length > 0) {
    console.log("\nFilter errors:");
    for (const error of filterErrors) {
      console.log(`- ${error}`);
    }
  }

  if (eventReport.warnings.length > 0) {
    console.log("\nWarnings:");
    for (const warning of eventReport.warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (eventReport.duplicateRegistrationUrls.length > 0) {
    console.log("\nShared registration URL samples:");
    for (const duplicate of eventReport.duplicateRegistrationUrls.slice(0, 5)) {
      console.log(`- ${duplicate.url} -> ${duplicate.ids.join(", ")}`);
    }
  }
}

function syncFilters(events) {
  const nextFilters = buildFilters(events);
  const currentFilters = readJson(filtersPath);
  const hasChanges =
    JSON.stringify(currentFilters) !== JSON.stringify(nextFilters);

  if (hasChanges) {
    writeJson(filtersPath, nextFilters);
    console.log("Updated src/data/filters.json from src/data/events.json.");
    return;
  }

  console.log("src/data/filters.json is already in sync.");
}

function validate() {
  const events = readJson(eventsPath);
  const filters = readJson(filtersPath);

  if (!Array.isArray(events)) {
    console.error("src/data/events.json must be a JSON array.");
    process.exitCode = 1;
    return;
  }

  const eventReport = validateEvents(events);
  const { errors: filterErrors } = validateFilters(events, filters);

  printValidationReport(eventReport, filterErrors);

  if (eventReport.errors.length > 0 || filterErrors.length > 0) {
    process.exitCode = 1;
  }
}

function main() {
  const command = process.argv[2] ?? "validate";
  const events = readJson(eventsPath);

  switch (command) {
    case "sync-filters":
      if (!Array.isArray(events)) {
        console.error("src/data/events.json must be a JSON array.");
        process.exitCode = 1;
        return;
      }

      syncFilters(events);
      return;
    case "validate":
      validate();
      return;
    default:
      console.error(`Unknown command "${command}". Use "validate" or "sync-filters".`);
      process.exitCode = 1;
  }
}

main();
