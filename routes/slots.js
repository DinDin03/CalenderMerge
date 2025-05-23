import express from 'express';
import { getAuthClientForUser } from '../auth.js';
import { getFreeBusy, invertBusySlots, intersectFreeSlots } from '../calender.js';
import dayjs from 'dayjs';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { userA, userB, from, to } = req.query;
    const start = dayjs(from), end = dayjs(to);

    // 1) Auth clients
    const authA = await getAuthClientForUser(userA);
    const authB = await getAuthClientForUser(userB);

    // 2) Fetch busy slots
    const busy = await getFreeBusy(authA, [ 'primary' ], start, end);
    const busyB= await getFreeBusy(authB, [ 'primary' ], start, end);

    // 3) Invert to get free
    const freeA = invertBusySlots(busy.primary.busy, start, end);
    const freeB = invertBusySlots(busyB.primary.busy, start, end);

    // 4) Intersect
    const common = intersectFreeSlots(freeA, freeB);

    res.json({ common });
  } catch(err) { next(err) }
});

export default router;
