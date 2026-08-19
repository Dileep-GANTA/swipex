import { getSwipeAction, getNextIndex, normalizeIndex, getVisibleJobs } from './swipeCardLogic';

describe('swipe card queue logic', () => {
  it('treats a large rightward drag as interested', () => {
    expect(getSwipeAction(140)).toBe('interested');
  });

  it('treats a large leftward drag as skip', () => {
    expect(getSwipeAction(-140)).toBe('skip');
  });

  it('moves to the next job in the queue', () => {
    expect(getNextIndex(1, 4)).toBe(2);
  });

  it('wraps around to the first job when the queue reaches the end', () => {
    expect(normalizeIndex(4, 4)).toBe(0);
  });

  it('removes jobs from the recommendation queue after they are saved or skipped', () => {
    const jobs = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const visibleJobs = getVisibleJobs(jobs, [1], [2]);

    expect(visibleJobs.map(job => job.id)).toEqual([3]);
  });
});
