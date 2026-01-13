/* ==========================================
   МОДУЛЬ: ВОДА (water.js)
   ========================================== */

const WaterPage = {
    // Настройки по умолчанию
    state: {
        goal: 2000,       // Цель (мл)
        current: 0,       // Выпито сегодня (мл)
        cupSize: 250,     // Размер одного клика (мл)
        lastDate: null,   // Чтобы сбрасывать каждый день
        history: []       // История: [{date: '2026-01-13', amount: 1500}, ...]
    },

    init: function() {
        this.loadData();
        this.checkNewDay();
        this.render();
    },

    saveData: function() {
        localStorage.setItem('GL_Water_State', JSON.stringify(this.state));
    },

    loadData: function() {
        const saved = localStorage.getItem('GL_Water_State');
        if (saved) {
            this.state = { ...this.state, ...JSON.parse(saved) };
        }
    },

    // Если наступил новый день — обнуляем счетчик, сохраняя историю
    checkNewDay: function() {
        const today = new Date().toLocaleDateString();
        if (this.state.lastDate !== today) {
            // Сохраняем вчерашний результат в историю, если он был не пустой
            if (this.state.lastDate && this.state.current > 0) {
                this.state.history.push({ date: this.state.lastDate, amount: this.state.current });
            }
            // Сброс
            this.state.current = 0;
            this.state.lastDate = today;
            this.saveData();
        }
    },

    // Добавить воду (или убрать, если amount отрицательный)
    addWater: function(amount) {
        let newValue = this.state.current + amount;
        if (newValue < 0) newValue = 0;
        
        this.state.current = newValue;
        this.saveData();
        this.render(); // Перерисовка с анимацией
    },

    // Настройки
    openSettings: function() {
        const weight = prompt("Введите ваш вес (кг) для расчета нормы:", "60");
        if (weight) {
            // Формула: Вес * 30мл
            this.state.goal = parseInt(weight) * 30;
            alert(`Ваша новая цель: ${this.state.goal} мл`);
            this.saveData();
            this.render();
        }
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const percent = Math.min((this.state.current / this.state.goal) * 100, 100); // Не больше 100% визуально
        const remains = Math.max(this.state.goal - this.state.current, 0);

        // --- СТИЛИ (CSS) ---
        const styles = `
            <style>
                .wl-container { text-align: center; padding-top: 20px; color: #000; animation: fadein 0.3s; }
                
                /* Заголовок с кнопкой назад */
                .wl-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
                .wl-back { color: #007AFF; font-size: 17px; cursor: pointer; display: flex; align-items: center; }
                .wl-settings-btn { font-size: 24px; cursor: pointer; }

                /* БУТЫЛКА (Анимация) */
                .wl-bottle-wrap {
                    width: 140px; height: 280px; margin: 0 auto 30px;
                    position: relative;
                    background: #F2F2F7; border: 4px solid #fff;
                    border-radius: 60px 60px 40px 40px;
                    box-shadow: 0 10px 30px rgba(0,122,255, 0.2);
                    overflow: hidden; /* Чтобы вода не вытекала */
                    cursor: pointer;
                    -webkit-tap-highlight-color: transparent;
                }
                /* Горлышко */
                .wl-bottle-wrap::before {
                    content: ''; position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
                    width: 50px; height: 20px; background: #fff; border-radius: 5px; z-index: 5;
                }

                /* Вода */
                .wl-water-fill {
                    position: absolute; bottom: 0; left: 0; width: 100%;
                    background: linear-gradient(to top, #007AFF, #00C7BE);
                    transition: height 1s cubic-bezier(0.4, 0.0, 0.2, 1); /* Плавная анимация 1 сек */
                    z-index: 1;
                    opacity: 0.8;
                }
                /* Текст поверх воды */
                .wl-percent-text {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    z-index: 10; font-size: 40px; font-weight: 800; color: #333;
                    text-shadow: 0 2px 10px rgba(255,255,255,0.8);
                }

                /* Кнопки управления */
                .wl-controls { display: flex; gap: 15px; justify-content: center; margin-top: 20px; }
                .wl-btn {
                    background: #fff; border-radius: 20px; padding: 15px 25px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05); cursor: pointer;
                    display: flex; flex-direction: column; align-items: center; gap: 5px;
                }
                .wl-btn:active { transform: scale(0.95); background: #f0f0f0; }
                .wl-btn-icon { font-size: 24px; }
                .wl-btn-text { font-size: 12px; font-weight: 600; color: #007AFF; }

                /* Инфо */
                .wl-info { font-size: 16px; color: #8E8E93; margin-bottom: 5px; }
                .wl-big-value { font-size: 36px; font-weight: 800; color: #000; margin-bottom: 20px; }

                @keyframes fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            </style>
        `;

        app.innerHTML = `
            ${styles}
            <div class="wl-container">
                
                <div class="wl-header">
                    <div class="wl-back" onclick="loadModule('./health.js')">‹ Здоровье</div>
                    <div class="wl-settings-btn" onclick="WaterPage.openSettings()">⚙️</div>
                </div>

                <div class="wl-info">Сегодня выпито</div>
                <div class="wl-big-value">${this.state.current} / ${this.state.goal} мл</div>

                <div class="wl-bottle-wrap" onclick="WaterPage.addWater(${this.state.cupSize})">
                    <div class="wl-percent-text">${Math.round(percent)}%</div>
                    <div class="wl-water-fill" style="height: ${percent}%"></div>
                </div>

                <div style="font-size: 14px; color: #8E8E93; margin-bottom: 20px;">
                    Нажми на бутылку, чтобы добавить ${this.state.cupSize}мл
                </div>

                <div class="wl-controls">
                    <div class="wl-btn" onclick="WaterPage.addWater(-${this.state.cupSize})">
                        <span class="wl-btn-icon">↩️</span>
                        <span class="wl-btn-text">Отмена</span>
                    </div>
                    <div class="wl-btn" onclick="WaterPage.addWater(500)">
                        <span class="wl-btn-icon">🥛</span>
                        <span class="wl-btn-text">+0.5 л</span>
                    </div>
                </div>

            </div>
        `;
    }
};

// Экспорт для модуля
window.WaterPage = WaterPage;
export function render() {
    WaterPage.init();
}
