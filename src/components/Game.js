import React, { useState, useEffect } from 'react';
import Score from './Score';
import '../styles.css';

const Game = () => {
    const [score, setScore] = useState(0);
    const [numbers, setNumbers] = useState([]);
    const [selectedCells, setSelectedCells] = useState([]);
    const [successStreak, setSuccessStreak] = useState(0);

    // 获取随机成功提示语
    const getSuccessMessage = () => {
        const messages = [
            '太棒了！',
            '你真厉害！',
            '完美！',
            '继续保持！',
            '好极了！',
            '你是最棒的！'
        ];
        const streakMessages = [
            '连续成功！',
            '连战连胜！',
            '势如破竹！',
            '无人能挡！'
        ];

        let message = messages[Math.floor(Math.random() * messages.length)];
        
        if (successStreak >= 2) {
            message += streakMessages[Math.floor(Math.random() * streakMessages.length)];
        }
        
        if (score > 0 && score % 5 === 0) {
            message += `已经完成${score}分了！继续加油！`;
        }
        
        return message;
    };

    // 初始化语音合成
    const speak = (text, onEnd) => {
        // 取消当前正在播放的语音
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 1.2; // 稍微提高语速
        utterance.volume = 1.0;
        if (onEnd) {
            utterance.onend = onEnd;
        }
        window.speechSynthesis.speak(utterance);
    };

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
    const generateNumbers = () => {
        let newNumbers;
        do {
            newNumbers = [];
            for (let i = 0; i < 9; i++) {
                newNumbers.push(Math.floor(Math.random() * 9) + 1);
            }
        } while (!hasValidCombination(newNumbers));
        return newNumbers;
    };

    // 初始化游戏
    useEffect(() => {
        setNumbers(generateNumbers());
    }, []);

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
        speak(numbers[index].toString());
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
                const successMessage = getSuccessMessage();
                speak(successMessage, () => {
                    setScore(score + 1);
                    setSuccessStreak(successStreak + 1);
                    setNumbers(generateNumbers());
                    setSelectedCells([]);
                });
            } else {
                let failureReason = '';
                if (!isLine) {
                    failureReason = '请选择同一行、列或对角线上的数字';
                } else if (!isSum) {
                    failureReason = '这三个数字加起来不等于10';
                }
                speak(failureReason, () => {
                    setSelectedCells([]);
                    setSuccessStreak(0);
                });
            }
        }
    };

    return (
        <div className="game-container">
            <Score score={score} />
            <div className="grid">
                {numbers.map((number, index) => (
                    <div
                        key={index}
                        className={`cell ${selectedCells.includes(index) ? 'selected' : ''}`}
                        onClick={() => handleCellClick(index)}
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