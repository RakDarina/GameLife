/* ==========================================
   МОДУЛЬ: ВОДА (water.js) — STYLED LIKE WATERLLAMA
   ========================================== */

const WaterPage = {
    state: {
        goal: 2000,
        current: 0,
        cupSize: 250,
        lastDate: new Date().toLocaleDateString(),
        history: {}, // Формат: {'01.01.2026': 1500, '02.01.2026': 2100}
        view: 'main' // 'main' или 'stats'
    },

    init: function() {
        this.loadData();
        this.checkNewDay();
        this.render();
    },

    saveData: function() {
        localStorage.setItem('GL_Water_Data', JSON.stringify(this.state));
    },

    loadData: function() {
        const saved = localStorage.getItem('GL_Water_Data');
        if (saved) this.state = { ...this.state, ...JSON.parse(saved) };
    },

    checkNewDay: function() {
        const today = new Date().toLocaleDateString();
        if (this.state.lastDate !== today) {
            this.state.history[this.state.lastDate] = this.state.current;
            this.state.current = 0;
            this.state.lastDate = today;
            this.saveData();
        }
    },

    addWater: function(ml) {
        this.state.current = Math.max(0, this.state.current + ml);
        this.saveData();
        this.render();
    },

    // Расчет серии (Streak)
    getStreak: function() {
        let streak = 0;
        let date = new Date();
        if (this.state.current >= this.state.goal) streak = 1;
        
        // Идем назад по истории
        for (let i = 1; i < 365; i++) {
            date.setDate(date.getDate() - 1);
            let dStr = date.toLocaleDateString();
            if (this.state.history[dStr] >= this.state.goal) streak++;
            else break;
        }
        return streak;
    },

    openSettings: function() {
        const mode = confirm("ОК — Рассчитать по весу\nОтмена — Ввести цель вручную");
        if (mode) {
            const weight = prompt("Ваш вес в кг:", "60");
            if (weight) this.state.goal = parseInt(weight) * 30;
        } else {
            const manual = prompt("Введите цель в мл:", this.state.goal);
            if (manual) this.state.goal = parseInt(manual);
        }
        const cup = prompt("Объем одного стакана (мл):", this.state.cupSize);
        if (cup) this.state.cupSize = parseInt(cup);
        
        this.saveData();
        this.render();
    },

    editHistory: function(dateStr) {
        const val = prompt(`Объем воды за ${dateStr} (мл):`, this.state.history[dateStr] || 0);
        if (val !== null) {
            this.state.history[dateStr] = parseInt(val);
            this.saveData();
            this.render();
        }
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const percent = Math.min((this.state.current / this.state.goal) * 100, 100);

        const styles = `
            <style>
                .w-wrap { text-align: center; font-family: -apple-system, sans-serif; animation: fadeIn 0.3s; }
                .w-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 0 30px; }
                
                /* СТАКАН */
                .w-glass-container {
                    width: 160px; height: 220px; margin: 0 auto 40px;
                    position: relative; background: #fff;
                    clip-path: polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%);
                    border-bottom: 8px solid #E5E5EA;
                }
                .w-water {
                    position: absolute; bottom: 0; left: 0; width: 100%;
                    background: linear-gradient(180deg, #4FC3F7 0%, #007AFF 100%);
                    transition: height 1s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 1;
                }
                .w-glass-percent {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    font-size: 32px; font-weight: 800; z-index: 2; color: #1C1C1E;
                    mix-blend-mode: multiply;
                }

                .w-streak-badge { background: #FF9500; color: #fff; padding: 5px 15px; border-radius: 20px; font-weight: 700; display: inline-block; margin-bottom: 20px; }
                
                .w-btn-main { width: 80px; height: 80px; background: #007AFF; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 30px; margin: 0 auto; box-shadow: 0 8px 20px rgba(0,122,255,0.3); cursor: pointer; }
                .w-btn-main:active { transform: scale(0.9); }

                /* ИСТОРИЯ */
                .w-hist-item { background: #fff; padding: 15px; border-radius: 15px; display: flex; justify-content: space-between; margin-bottom: 10px; align-items: center; }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        if (this.state.view === 'main') {
            app.innerHTML = `
                ${styles}
                <div class="w-wrap">
                    <div class="w-header">
                        <div onclick="loadModule('./health.js')" style="color:var(--blue); font-weight:500;">‹ Назад</div>
                        <div style="display:flex; gap:20px;">
                            <span onclick="WaterPage.state.view='stats'; WaterPage.render()">📊</span>
                            <span onclick="WaterPage.openSettings()">⚙️</span>
                        </div>
                    </div>

                    <div class="w-streak-badge">🔥 Серия: ${this.getStreak()} дн.</div>
                    
                    <div style="font-size: 15px; color: #8E8E93;">Сегодня выпито</div>
                    <div style="font-size: 38px; font-weight: 800; margin-bottom: 30px;">${this.state.current} <span style="font-size:20px; color:#8E8E93;">/ ${this.state.goal} мл</span></div>

                    <div class="w-glass-container" onclick="WaterPage.addWater(WaterPage.state.cupSize)">
                        <div class="w-glass-percent">${Math.round(percent)}%</div>
                        <div class="w-water" style="height: ${percent}%"></div>
                    </div>

                    <div class="w-btn-main" onclick="WaterPage.addWater(WaterPage.state.cupSize)">+</div>
                    <p style="color:#8E8E93; margin-top:15px;">Нажми на стакан или плюс, чтобы добавить ${this.state.cupSize}мл</p>
                    <div onclick="WaterPage.addWater(-WaterPage.state.cupSize)" style="color:#FF3B30; font-size:14px; margin-top:10px;">Отменить последний ввод</div>
                </div>
            `;
        } else {
            // Вид графиков / Истории
            const historyKeys = Object.keys(this.state.history).sort().reverse();
            app.innerHTML = `
                ${styles}
                <div class="w-wrap">
                    <div class="w-header">
                        <div onclick="WaterPage.state.view='main'; WaterPage.render()" style="color:var(--blue); font-weight:500;">‹ Трекер</div>
                        <div onclick="WaterPage.editHistory(new Date().toLocaleDateString())" style="color:var(--blue);">Добавить запись</div>
                    </div>
                    
                    <h2 style="text-align:left; margin-bottom:20px;">История и График</h2>
                    
                    ${historyKeys.length === 0 ? '<p style="color:#8E8E93">История пока пуста</p>' : ''}
                    
                    ${historyKeys.map(date => `
                        <div class="w-hist-item" onclick="WaterPage.editHistory('${date}')">
                            <div>
                                <div style="font-weight:600;">${date}</div>
                                <div style="font-size:12px; color:${this.state.history[date] >= this.state.goal ? '#34C759' : '#8E8E93'}">
                                    ${this.state.history[date] >= this.state.goal ? '● Норма выполнена' : '○ Недобор'}
                                </div>
                            </div>
                            <div style="font-weight:700;">${this.state.history[date]} мл ✏️</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }
};

window.WaterPage = WaterPage;
export function render() { WaterPage.init(); }
