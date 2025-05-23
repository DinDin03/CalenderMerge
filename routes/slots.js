import express from 'express';
import { getAuthClientForUser } from '../auth.js';
import { getFreeBusy, invertBusySlots, intersectFreeSlots } from '../calender.js';
import dayjs from 'dayjs';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { userA, userB, from, to } = req.query;
    if (!userA || !userB || !from || !to) {
      throw new Error('Required parameters missing: userA, userB, from, to');
    }
    const start = dayjs(from), end = dayjs(to);
    if (!start.isValid() || !end.isValid()) throw new Error('Invalid dates');

    const authA = await getAuthClientForUser(userA);
    const authB = await getAuthClientForUser(userB);

    const busyA = await getFreeBusy(authA, ['primary'], start, end);
    const busyB = await getFreeBusy(authB, ['primary'], start, end);

    const freeA = invertBusySlots(busyA.primary.busy, start, end);
    const freeB = invertBusySlots(busyB.primary.busy, start, end);

    const common = intersectFreeSlots(freeA, freeB);
    res.json({ common });
  } catch (err) {
    next(err);
  }
});


export default router;
