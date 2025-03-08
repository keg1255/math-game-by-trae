import React from 'react';

const Score = ({ score, highScore, gameTime, averageScoreTime, countdown }) => {
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="score-container">
            <h3>当前得分: {score}</h3>
            <h3>最高分: {highScore}</h3>
            <h3>游戏时长: {formatTime(gameTime)}</h3>
            {averageScoreTime > 0 && (
                <h3>平均得分时间: {averageScoreTime.toFixed(1)}秒</h3>
            )}
            <h3 className="countdown">倒计时: {countdown}秒</h3>
        </div>
    );
};

export default Score;