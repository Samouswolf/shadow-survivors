/**
 * 游戏基础组件库
 * 提供触屏适配、存档管理、操作提示等通用功能
 */

const GameCore = {
    storage: {
        get: function(key, defaultValue) {
            try {
                const value = localStorage.getItem(key);
                return value ? JSON.parse(value) : defaultValue;
            } catch (e) {
                console.warn('GameCore.storage.get failed:', e);
                return defaultValue;
            }
        },
        
        set: function(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.warn('GameCore.storage.set failed:', e);
                return false;
            }
        },
        
        remove: function(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.warn('GameCore.storage.remove failed:', e);
                return false;
            }
        }
    },

    touch: {
        enable: function(selector, callback) {
            const element = document.querySelector(selector);
            if (!element) return;

            let startX, startY;

            element.addEventListener('touchstart', function(e) {
                e.preventDefault();
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }, { passive: false });

            element.addEventListener('touchmove', function(e) {
                e.preventDefault();
            }, { passive: false });

            element.addEventListener('touchend', function(e) {
                e.preventDefault();
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                
                const diffX = Math.abs(endX - startX);
                const diffY = Math.abs(endY - startY);
                
                if (diffX < 10 && diffY < 10) {
                    callback && callback(e);
                }
            }, { passive: false });
        },

        enableAllButtons: function() {
            document.querySelectorAll('button, [onclick]').forEach(btn => {
                GameCore.touch.enable(btn, function() {
                    btn.click();
                });
            });
        }
    },

    hints: {
        show: function(message, duration = 3000) {
            let hintEl = document.getElementById('game-hint');
            if (!hintEl) {
                hintEl = document.createElement('div');
                hintEl.id = 'game-hint';
                hintEl.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 20px 30px;
                    border-radius: 12px;
                    font-size: 18px;
                    z-index: 9999;
                    text-align: center;
                    max-width: 80%;
                    animation: hintFadeIn 0.3s ease;
                `;
                document.body.appendChild(hintEl);
                
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes hintFadeIn {
                        from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    }
                    @keyframes hintFadeOut {
                        from { opacity: 1; }
                        to { opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            hintEl.textContent = message;
            hintEl.style.display = 'block';
            hintEl.style.animation = 'hintFadeIn 0.3s ease';
            
            setTimeout(() => {
                hintEl.style.animation = 'hintFadeOut 0.3s ease';
                setTimeout(() => {
                    hintEl.style.display = 'none';
                }, 300);
            }, duration);
        },

        showStartGuide: function(guideText) {
            const guideEl = document.createElement('div');
            guideEl.id = 'game-guide';
            guideEl.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.85);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9998;
                padding: 20px;
            `;
            
            guideEl.innerHTML = `
                <h2 style="color: #ffd700; font-size: 28px; margin-bottom: 20px;">游戏指南</h2>
                <div style="color: white; font-size: 16px; line-height: 1.8; text-align: center; max-width: 400px;">
                    ${guideText}
                </div>
                <button id="start-game-btn" style="
                    margin-top: 30px;
                    padding: 15px 40px;
                    font-size: 18px;
                    background: #f5576c;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: bold;
                ">开始游戏</button>
            `;
            
            document.body.appendChild(guideEl);
            
            document.getElementById('start-game-btn').addEventListener('click', function() {
                guideEl.style.display = 'none';
            });
            
            GameCore.touch.enable('#start-game-btn', function() {
                document.getElementById('start-game-btn').click();
            });
        }
    },

    loading: {
        show: function(message = '加载中...') {
            let loadingEl = document.getElementById('game-loading');
            if (!loadingEl) {
                loadingEl = document.createElement('div');
                loadingEl.id = 'game-loading';
                loadingEl.style.cssText = `
                    position: fixed;
                    inset: 0;
                    background: #0a0a0a;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                `;
                loadingEl.innerHTML = `
                    <div style="width: 50px; height: 50px; border: 4px solid #f5576c; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <div style="color: white; margin-top: 20px; font-size: 18px;">${message}</div>
                `;
                document.body.appendChild(loadingEl);
                
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
            loadingEl.style.display = 'flex';
        },

        hide: function() {
            const loadingEl = document.getElementById('game-loading');
            if (loadingEl) {
                loadingEl.style.display = 'none';
            }
        }
    },

    highScore: {
        get: function(gameName) {
            return GameCore.storage.get(`highscore_${gameName}`, 0);
        },

        set: function(gameName, score) {
            const current = GameCore.highScore.get(gameName);
            if (score > current) {
                GameCore.storage.set(`highscore_${gameName}`, score);
                return true;
            }
            return false;
        },

        show: function(gameName) {
            const score = GameCore.highScore.get(gameName);
            GameCore.hints.show(`最高分: ${score}`, 2000);
        }
    },

    error: {
        handler: function(e) {
            console.error('Game error:', e);
            GameCore.hints.show('游戏出现错误，请刷新重试', 5000);
        },

        init: function() {
            window.addEventListener('error', GameCore.error.handler);
            window.addEventListener('unhandledrejection', function(e) {
                GameCore.error.handler(e.reason);
            });
        }
    },

    init: function(options = {}) {
        // --- BUG4 修复: 注入补丁：赞助面板和插屏广告的关闭按钮需恢复 pointer-events ---
        try {
            if (!document.getElementById('gc-pointer-fix')) {
                var peStyle = document.createElement('style');
                peStyle.id = 'gc-pointer-fix';
                peStyle.textContent = [
                    '.sponsor-close, #sponsorClose, .skip-btn, #skipInterstitial {',
                    '  pointer-events: auto !important;',
                    '}',
                    '.sponsor-panel button, .interstitial-ad button {',
                    '  pointer-events: auto !important;',
                    '}'
                ].join('\n');
                document.head.appendChild(peStyle);
            }
        } catch (e) {
            console.warn('[GameCore] pointer-events patch failed:', e);
        }

        if (options.touch !== false) {
            GameCore.touch.enableAllButtons();
        }
        
        if (options.errorHandler !== false) {
            GameCore.error.init();
        }
        
        // --- BUG2 修复: loading 时序竞态 + 超时兜底
        if (options.loading !== false) {
            GameCore.loading.show();
            var gcLoadingHidden = false;
            var gcHideLoadingOnce = function(delay) {
                if (gcLoadingHidden) return;
                setTimeout(function() {
                    if (gcLoadingHidden) return;
                    gcLoadingHidden = true;
                    try { GameCore.loading.hide(); } catch (e) {}
                }, delay != null ? delay : 0);
            };
            // 兜底超时 5s：无论如何最终都会隐藏，防止永久卡住
            setTimeout(gcHideLoadingOnce, 5000);
            // 如果页面已经加载完成，不用等 load 事件
            if (document.readyState === 'complete') {
                console.log('[GameCore] document already complete, hide loading soon');
                gcHideLoadingOnce(500);
            } else {
                window.addEventListener('load', function() {
                    gcHideLoadingOnce(500);
                });
            }
        }
        
        if (options.highScore) {
            GameCore.storage.set('current_game', options.highScore);
        }

        // --- BUG5 修复: 自动显示默认隐藏的 start-game-btn
        try {
            if (document.body) {
                var startBtns = document.querySelectorAll('#start-game-btn, #startGameBtn, .start-btn, .startBtn, .btn-start');
                for (var i = 0; i < startBtns.length; i++) {
                    var btn = startBtns[i];
                    if (btn.style.display === 'none' || getComputedStyle(btn).display === 'none') {
                        // 保留原有样式，只把 display 改为 block
                        btn.style.setProperty('display', 'block', 'important');
                        console.log('[GameCore] auto-shown start button:', btn.id || btn.className);
                    }
                }
            } else {
                document.addEventListener('DOMContentLoaded', function() {
                    var startBtns = document.querySelectorAll('#start-game-btn, #startGameBtn, .start-btn, .startBtn, .btn-start');
                    for (var i = 0; i < startBtns.length; i++) {
                        if (startBtns[i].style.display === 'none') {
                            startBtns[i].style.setProperty('display', 'block', 'important');
                        }
                    }
                });
            }
        } catch (e) {
            console.warn('[GameCore] start-btn auto-show failed:', e);
        }

        // --- 关键流程日志（预防措施） ---
        console.log('[GameCore] initialized at readyState=' + document.readyState,
            'time=' + (performance ? performance.now().toFixed(0) + 'ms' : ''));
    }
};

// ============================================================
// BUG1 修复: 全局 Storage 兼容层（被 66+ 文件引用但从未定义）
// 所有游戏中调用 Storage.load(key, default) / Storage.save(key, value)
// ============================================================
window.Storage = {
    load: function(key, defaultValue) {
        var val = GameCore.storage.get(key, defaultValue);
        console.log('[Storage.load]', key, '=', val);
        return val;
    },
    save: function(key, value) {
        console.log('[Storage.save]', key, '=', value);
        return GameCore.storage.set(key, value);
    },
    remove: function(key) {
        return GameCore.storage.remove(key);
    }
};
console.log('[GameCore] global Storage shim installed');
