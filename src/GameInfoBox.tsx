import React, { useState, useEffect } from 'react';

const GameInfoBox = () => {
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="stats-box">
      <div>
        <div>Turn: w/b</div>
      </div>
      <div>
        <div>Time Left: {formatTime(timeLeft)}</div>
      </div>
    </div>
  );
};

export default GameInfoBox;