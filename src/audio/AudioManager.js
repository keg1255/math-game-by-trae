// 音频资源管理器
class AudioManager {
    constructor() {
        this.audioCache = new Map();
        this.currentAudio = null;
    }

    // 预加载所有音频资源
    async preloadAudios() {
        const audioFiles = {
            // 数字音频 1-9
            'num1': '/audio/numbers/1.mp3',
            'num2': '/audio/numbers/2.mp3',
            'num3': '/audio/numbers/3.mp3',
            'num4': '/audio/numbers/4.mp3',
            'num5': '/audio/numbers/5.mp3',
            'num6': '/audio/numbers/6.mp3',
            'num7': '/audio/numbers/7.mp3',
            'num8': '/audio/numbers/8.mp3',
            'num9': '/audio/numbers/9.mp3',

            // 成功提示语
            'success1': '/audio/success/great.mp3',
            'success2': '/audio/success/excellent.mp3',
            'success3': '/audio/success/perfect.mp3',
            'success4': '/audio/success/keepgoing.mp3',
            'success5': '/audio/success/wonderful.mp3',
            'success6': '/audio/success/youarethebest.mp3',

            // 连击提示语
            'streak1': '/audio/streak/consecutive.mp3',
            'streak2': '/audio/streak/winning.mp3',
            'streak3': '/audio/streak/unstoppable.mp3',
            'streak4': '/audio/streak/invincible.mp3',

            // 失败提示语
            'fail1': '/audio/fail/choose_line.mp3',
            'fail2': '/audio/fail/not_ten.mp3'
        };

        try {
            const loadPromises = Object.entries(audioFiles).map(async ([key, path]) => {
                const audio = new Audio('/math-game-by-trae' + path);
                await new Promise((resolve, reject) => {
                    audio.addEventListener('canplaythrough', resolve, { once: true });
                    audio.addEventListener('error', reject, { once: true });
                    audio.load();
                });
                this.audioCache.set(key, audio);
            });

            await Promise.all(loadPromises);
            console.log('所有音频资源加载完成');
            return true;
        } catch (error) {
            console.error('音频资源加载失败:', error);
            return false;
        }
    }

    // 播放数字音频
    playNumber(number) {
        this.playAudio(`num${number}`);
    }

    // 播放随机成功提示语
    playSuccessMessage(successStreak, score) {
        // 停止当前播放的音频
        this.stopCurrentAudio();

        // 播放基础成功提示语
        const successIndex = Math.floor(Math.random() * 6) + 1;
        this.playAudio(`success${successIndex}`);

        // 如果有连击，播放连击提示语
        if (successStreak >= 2) {
            setTimeout(() => {
                const streakIndex = Math.floor(Math.random() * 4) + 1;
                this.playAudio(`streak${streakIndex}`);
            }, 1000);
        }
    }

    // 播放失败提示语
    playFailureMessage(isLineError) {
        this.playAudio(isLineError ? 'fail1' : 'fail2');
    }

    // 播放指定音频
    playAudio(key) {
        const audio = this.audioCache.get(key);
        if (audio) {
            this.stopCurrentAudio();
            this.currentAudio = audio;
            audio.currentTime = 0;
            audio.play().catch(error => console.error('音频播放失败:', error));
        }
    }

    // 停止当前播放的音频
    stopCurrentAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }
    }
}

// 创建单例实例
const audioManager = new AudioManager();
export default audioManager;