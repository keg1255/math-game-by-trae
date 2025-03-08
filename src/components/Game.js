import React, { useState, useEffect, useCallback } from 'react';
import Score from './Score';
import '../styles.css';
import audioManager from '../audio/AudioManager';

const Game = () => {
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [numbers, setNumbers] = useState([]);
    const [selectedCells, setSelectedCells] = useState([]);
    const [successStreak, setSuccessStreak] = useState(0);
    const [gameTime, setGameTime] = useState(0);
    const [totalCorrectAnswers, setTotalCorrectAnswers] = useState(0);
    const [averageScoreTime, setAverageScoreTime] = useState(0);
    const [countdown, setCountdown] = useState(10);
    const [lastScoreTime, setLastScoreTime] = useState(null);
    const [isGameStarted, setIsGameStarted] = useState(false);

    // 初始化音频资源和计时器
    useEffect(() => {
        audioManager.preloadAudios().catch(error => {
            console.error('音频资源加载失败:', error);
        });

        // 只有在游戏开始后才启动计时器
        if (!isGameStarted) return;

        // 每秒更新游戏时间和倒计时
        const gameTimer = setInterval(() => {
            setGameTime(prevTime => prevTime + 1);
            
            const now = Date.now();
            const timeSinceLastScore = Math.floor((now - lastScoreTime) / 1000);
            const newCountdown = 10 - timeSinceLastScore;
            
            if (newCountdown <= 0) {
                setScore(prevScore => Math.max(0, prevScore - 1));
                setSuccessStreak(0); // 超时扣分时重置连击
                setLastScoreTime(now);
                setCountdown(10);
            } else {
                setCountdown(newCountdown);
            }
        }, 1000);

        return () => {
            clearInterval(gameTimer);
        };
    }, [lastScoreTime, isGameStarted]);

    // 检查是否存在和为10的有效组合
    const hasValidCombination = (numbers) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // 横向
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // 竖向
            [0, 4, 8], [2, 4, 6] // 斜向
        ];

        return lines.some(line => {
            const sum = line.reduce((acc, index) => acc + numbers[index], 0);
            return sum === 10;
        });
    };

    // 生成3x3随机数字矩阵，确保至少有一组和为10的组合
    const generateNumbers = useCallback(() => {
        let newNumbers;
        do {
            newNumbers = [];
            for (let i = 0; i < 9; i++) {
                newNumbers.push(Math.floor(Math.random() * 9) + 1);
            }
        } while (!hasValidCombination(newNumbers));
        return newNumbers;
    }, []);

    // 初始化游戏
    useEffect(() => {
        setNumbers(generateNumbers());
    }, [generateNumbers]);

    // 检查选中的数字之和是否为10
    const checkSum = (selectedIndexes) => {
        const sum = selectedIndexes.reduce((acc, index) => acc + numbers[index], 0);
        return sum === 10;
    };

    // 检查是否构成一条线（横、竖、斜）
    const isValidLine = (indexes) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // 横向
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // 竖向
            [0, 4, 8], [2, 4, 6] // 斜向
        ];
        return lines.some(line =>
            indexes.length === 3 &&
            line.every(num => indexes.includes(num)));
    };

    // 处理单元格点击
    const handleCellClick = (index) => {
        // 第一次点击时启动游戏
        if (!isGameStarted) {
            setIsGameStarted(true);
            setLastScoreTime(Date.now());
        }

        audioManager.playNumber(numbers[index]);
        let newSelected = [...selectedCells];
        const cellIndex = newSelected.indexOf(index);

        if (cellIndex === -1) {
            if (newSelected.length < 3) {
                newSelected.push(index);
            }
        } else {
            newSelected.splice(cellIndex, 1);
        }

        setSelectedCells(newSelected);

        if (newSelected.length === 3) {
            const isLine = isValidLine(newSelected);
            const isSum = checkSum(newSelected);
            
            if (isLine && isSum) {
                const newStreak = successStreak + 1;
                const points = newStreak; // 连击次数即为得分
                const newScore = score + points;
                audioManager.playSuccessMessage(successStreak, score);
                setScore(newScore);
                setHighScore(prevHigh => Math.max(prevHigh, newScore));
                setSuccessStreak(newStreak);
                setTotalCorrectAnswers(prev => prev + 1);
                setAverageScoreTime(gameTime / (totalCorrectAnswers + 1));
                setNumbers(generateNumbers());
                setSelectedCells([]);
                setLastScoreTime(Date.now()); // 重置倒计时
                setCountdown(5);
            } else {
                audioManager.playFailureMessage(!isLine);
                setScore(Math.max(0, score - 1)); // 答错扣1分
                setSelectedCells([]);
                setSuccessStreak(0);
                setLastScoreTime(Date.now()); // 重置倒计时
                setCountdown(5);
            }
        }
    };

    // 检测是否为移动设备
    const isMobileDevice = () => {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    };

    // 处理触摸事件
    const handleTouchStart = (event, index) => {
        event.preventDefault();
        handleCellClick(index);
    };

    return (
        <div className="game-container">
            {!isGameStarted ? (
                <div className="score-container">
                    <h3>游戏规则：</h3>
                    <ul className="game-rules-list">
                        <li><span className="rule-highlight">基本规则：</span>选择横、竖或斜线上的三个数字，使它们的和等于10</li>
                        <li><span className="rule-highlight">得分规则：</span>连续答对次数即为当次得分（如：连续答对3次得3分）</li>
                        <li><span className="rule-highlight">扣分规则：</span>答错或超时（10秒）扣1分，同时重置连击</li>
                    </ul>
                </div>
            ) : (
                <Score score={score} highScore={highScore} gameTime={gameTime} averageScoreTime={averageScoreTime} countdown={countdown} />
            )}
            <div className="grid">
                {numbers.map((number, index) => (
                    <div
                        key={index}
                        className={`cell ${selectedCells.includes(index) ? 'selected' : ''}`}
                        {...(isMobileDevice() 
                            ? { onTouchStart: (e) => handleTouchStart(e, index) }
                            : { onClick: () => handleCellClick(index) }
                        )}
                        role="button"
                        tabIndex={0}
                    >
                        {number}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Game;