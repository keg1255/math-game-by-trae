import React, { useState, useEffect, useCallback } from 'react';
import Score from './Score';
import '../styles.css';
import audioManager from '../audio/AudioManager';

const Game = () => {
    const [score, setScore] = useState(0);
    const [numbers, setNumbers] = useState([]);
    const [selectedCells, setSelectedCells] = useState([]);
    const [successStreak, setSuccessStreak] = useState(0);

    // 初始化音频资源
    useEffect(() => {
        audioManager.preloadAudios().catch(error => {
            console.error('音频资源加载失败:', error);
        });
    }, []);

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
                audioManager.playSuccessMessage(successStreak, score);
                setScore(score + 1);
                setSuccessStreak(successStreak + 1);
                setNumbers(generateNumbers());
                setSelectedCells([]);
            } else {
                audioManager.playFailureMessage(!isLine);
                setSelectedCells([]);
                setSuccessStreak(0);
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
            <Score score={score} />
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
            <p className="instructions">找出横竖斜三个数相加等于10的数字</p>
        </div>
    );
};

export default Game;