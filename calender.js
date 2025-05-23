// calender.js
import { google } from 'googleapis'; // if you use this file for freeBusy
import dayjs from 'dayjs';

/**
 * Query Google Calendar free/busy for specified calendar IDs.
 */
export async function getFreeBusy(auth, calendarIds, timeMin, timeMax) {
  const calendar = google.calendar({ version: 'v3', auth });
  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: calendarIds.map(id => ({ id })),
    },
  });
  return res.data.calendars; // e.g. { primary: { busy: [...] }, ... }
}

/**
 * Invert busy slots over the [start, end] window to produce free intervals.
 */
export function invertBusySlots(busySlots, start, end) {
  const frees = [];
  let cursor = start;

  // Sort busy slots by start time
  busySlots.sort((a, b) => new Date(a.start) - new Date(b.start));

  for (const slot of busySlots) {
    const bs = dayjs(slot.start);
    const be = dayjs(slot.end);

    // If there’s a gap before this busy slot, record it as free
    if (bs.isAfter(cursor)) {
      frees.push({
        start: cursor.toISOString(),
        end: bs.toISOString(),
      });
    }

    // Advance the cursor to the later of current cursor or this slot’s end
    cursor = be.isAfter(cursor) ? be : cursor;
  }

  // If there’s remaining time after the last busy slot, it’s free too
  if (cursor.isBefore(end)) {
    frees.push({
      start: cursor.toISOString(),
      end: end.toISOString(),
    });
  }

  return frees;
}

/**
 * Intersect two arrays of free intervals, returning only overlapping periods.
 */
export function intersectFreeSlots(f1, f2) {
  const result = [];
  let i = 0;
  let j = 0;

  while (i < f1.length && j < f2.length) {
    const A = f1[i];
    const B = f2[j];
    const startA = dayjs(A.start);
    const endA   = dayjs(A.end);
    const startB = dayjs(B.start);
    const endB   = dayjs(B.end);

    // Overlap is from the later start to the earlier end
    const overlapStart = startA.isAfter(startB) ? startA : startB;
    const overlapEnd   = endA.isBefore(endB)   ? endA   : endB;

    if (overlapStart.isBefore(overlapEnd)) {
      result.push({
        start: overlapStart.toISOString(),
        end:   overlapEnd.toISOString(),
      });
    }

    // Advance whichever interval ends first
    if (endA.isBefore(endB)) {
      i++;
    } else {
      j++;
    }
  }

  return result;
}
