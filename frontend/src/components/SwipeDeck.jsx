import React, { useState, useEffect, useRef } from 'react';
import JobCard from './JobCard';
import { RefreshCw, X, Heart, Sparkles, Filter } from 'lucide-react';

const SwipeDeck = ({ jobs = [], onSwipe, onResetFilters, onResetSwipes, loading = false, onOpenATS, onOpenCoverLetter }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeStatus, setSwipeStatus] = useState(null); // 'left' | 'right' | null
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isSwipingRef = useRef(false);

  // Reset index when jobs change
  useEffect(() => {
    setCurrentIndex(0);
    setDragOffset({ x: 0, y: 0 });
    setSwipeStatus(null);
    isSwipingRef.current = false;
  }, [jobs]);

  const triggerSwipe = (direction) => {
    if (isSwipingRef.current || currentIndex >= jobs.length) return;
    const currentJob = jobs[currentIndex];
    if (!currentJob) return;

    isSwipingRef.current = true;
    setSwipeStatus(direction);
    setDragOffset({ x: direction === 'right' ? 600 : -600, y: 0 });

    setTimeout(() => {
      onSwipe(currentJob.id, direction);
      setCurrentIndex((prev) => prev + 1);
      setDragOffset({ x: 0, y: 0 });
      setSwipeStatus(null);
      isSwipingRef.current = false;
    }, 220);
  };

  // Keyboard navigation support (Arrow Left = Skip, Arrow Right = Apply)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentIndex >= jobs.length || loading || isSwipingRef.current) return;
      if (e.key === 'ArrowLeft') {
        triggerSwipe('left');
      } else if (e.key === 'ArrowRight') {
        triggerSwipe('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, jobs, loading]);

  // Window drag listeners for smooth drag & drop
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging || isSwipingRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - dragStartPos.current.x;
      const deltaY = clientY - dragStartPos.current.y;
      setDragOffset({ x: deltaX, y: deltaY });

      if (deltaX > 50) {
        setSwipeStatus('right');
      } else if (deltaX < -50) {
        setSwipeStatus('left');
      } else {
        setSwipeStatus(null);
      }
    };

    const handlePointerUp = () => {
      if (!isDragging || isSwipingRef.current) return;
      setIsDragging(false);

      if (dragOffset.x > 60) {
        triggerSwipe('right');
      } else if (dragOffset.x < -60) {
        triggerSwipe('left');
      } else {
        setDragOffset({ x: 0, y: 0 });
        setSwipeStatus(null);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('touchend', handlePointerUp);
    }

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, dragOffset.x]);

  const handlePointerDown = (e) => {
    // Don't initiate drag if clicking buttons or links inside the card
    if (e.target.closest('button') || e.target.closest('a')) return;
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = { x: clientX, y: clientY };
  };

  const currentJob = jobs[currentIndex];
  const nextJob = jobs[currentIndex + 1];
  const isFinished = !loading && (jobs.length === 0 || currentIndex >= jobs.length);

  if (loading) {
    return (
      <div className="w-full max-w-md h-[550px] bg-white/80 rounded-3xl border border-slate-200 shadow-lg flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 animate-spin mb-4 border border-teal-100">
          <RefreshCw className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Finding Tailored Jobs...</h3>
        <p className="text-xs text-slate-500 max-w-xs">Excluding previously swiped roles & applying smart filter preferences.</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="w-full max-w-md h-[520px] bg-gradient-to-b from-white to-slate-50 rounded-3xl border border-slate-200/90 shadow-xl flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-4 border border-teal-100 shadow-sm">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">You're All Caught Up!</h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-6">
          No more unswiped jobs matching your filter parameters. Try adjusting your filters or resetting your swipe history to browse again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onResetFilters}
            className="flex items-center justify-center space-x-2 bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all"
          >
            <Filter className="w-4 h-4" />
            <span>Reset Filters</span>
          </button>
          {onResetSwipes && (
            <button
              onClick={onResetSwipes}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-md shadow-teal-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear Swipes & Restart</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const rotation = dragOffset.x * 0.06;
  const topCardStyle = {
    transform: `translate3d(${dragOffset.x}px, ${dragOffset.y * 0.3}px, 0px) rotate(${rotation}deg)`,
    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div className="relative w-full max-w-md flex flex-col items-center">
      {/* Cards Stack Container */}
      <div className="relative w-full h-[580px] flex items-center justify-center">
        
        {/* Next Card Background Preview */}
        {nextJob && (
          <div className="absolute inset-0 flex items-center justify-center transform scale-95 translate-y-3 opacity-60 pointer-events-none transition-all">
            <JobCard job={nextJob} onOpenATS={onOpenATS} onOpenCoverLetter={onOpenCoverLetter} />
          </div>
        )}

        {/* Current Active Card */}
        {currentJob && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10 touch-none"
            style={topCardStyle}
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
          >
            {/* Visual Overlay Badges */}
            {swipeStatus === 'right' && (
              <div className="absolute top-8 left-8 z-30 transform -rotate-12 bg-emerald-500 text-white font-extrabold text-lg px-4 py-1.5 rounded-xl shadow-lg border-2 border-white tracking-wider uppercase pointer-events-none">
                APPLY / SAVE
              </div>
            )}
            {swipeStatus === 'left' && (
              <div className="absolute top-8 right-8 z-30 transform rotate-12 bg-rose-500 text-white font-extrabold text-lg px-4 py-1.5 rounded-xl shadow-lg border-2 border-white tracking-wider uppercase pointer-events-none">
                SKIP
              </div>
            )}

            <JobCard
              job={currentJob}
              onSwipeLeft={() => triggerSwipe('left')}
              onSwipeRight={() => triggerSwipe('right')}
              onOpenATS={onOpenATS}
              onOpenCoverLetter={onOpenCoverLetter}
            />
          </div>
        )}
      </div>


      {/* Bottom Action Controls */}
      <div className="flex items-center space-x-6 mt-4 z-20">
        <button
          onClick={() => triggerSwipe('left')}
          title="Skip (Left Arrow)"
          className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-lg text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <X className="w-7 h-7" />
        </button>

        <span className="text-xs font-semibold text-slate-400 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 shadow-xs">
          {currentIndex + 1} of {jobs.length} Jobs
        </span>

        <button
          onClick={() => triggerSwipe('right')}
          title="Apply / Save (Right Arrow)"
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/30 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <Heart className="w-7 h-7 fill-white" />
        </button>
      </div>
    </div>
  );
};

export default SwipeDeck;
