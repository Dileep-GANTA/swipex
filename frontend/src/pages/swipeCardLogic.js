export function getSwipeAction(deltaX) {
  if (deltaX >= 140) return 'interested';
  if (deltaX <= -140) return 'skip';
  return null;
}

export function getNextIndex(currentIndex, length) {
  if (length <= 0) return 0;
  return (currentIndex + 1) % length;
}

export function normalizeIndex(index, length) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

export function getVisibleJobs(jobs, savedJobIds = [], skippedJobIds = []) {
  const savedSet = new Set(savedJobIds);
  const skippedSet = new Set(skippedJobIds);

  return jobs.filter((job) => !savedSet.has(job.id) && !skippedSet.has(job.id));
}
