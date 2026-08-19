import React, { useState } from 'react';

const JobCard = ({ job, onSwipe, onViewDetails, onSave }) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleStart = (clientX) => { setStartX(clientX); setIsDragging(true); };
  const handleMove = (clientX) => { if (!isDragging) return; setCurrentX(clientX - startX); };
  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (currentX > 140) onSwipe('interested', job.id);
    else if (currentX < -140) onSwipe('skip', job.id);
    setCurrentX(0);
  };

  return (
    <div
      className="absolute w-full max-w-md bg-white border border-blue-50 rounded-3xl shadow-xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{ transform: `translateX(${currentX}px) rotate(${currentX / 15}deg)`, transition: isDragging ? 'none' : 'transform 0.4s ease' }}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => isDragging && handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => isDragging && handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-xl">X</div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{job.title}</h3>
            <p className="text-blue-600 font-semibold text-sm">Enterprise Partner</p>
          </div>
        </div>
        <p className="text-slate-600 text-sm mb-4 line-clamp-3">{job.description}</p>
        <div className="flex space-x-2">
          <button onClick={() => onViewDetails(job.id)} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl text-sm shadow-md">View Details</button>
          <button onClick={() => onSave(job.id)} className="bg-blue-50 text-blue-600 font-bold px-4 rounded-xl text-sm border border-blue-100">🔖</button>
        </div>
      </div>
    </div>
  );
};
export default JobCard;