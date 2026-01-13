/* ==========================================
   МОДУЛЬ: ВОДА (water.js) — FULL VERSION
   ========================================== */

const WaterPage = {
    state: {
        goal: 2000,
        current: 0,
        cupSize: 250,
        lastDate: new Date().toLocaleDateString(),
        history: {}, 
        view: 'main' // main, stats, settings
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

    getStreak: function() {
        let streak = 0;
        let d = new Date();
        if (this.state.current >= this.state.goal) streak = 1;
        for (let i = 1; i < 30; i++) {
            d.setDate(d.getDate() - 1);
            let s = d.toLocaleDateString();
            if (this.state.history[s] >= this.state.goal) streak++; else break;
        }
        return streak;
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const percent = Math.min((this.state.current / this.state.goal) * 100, 100);

        const styles = `
            <style>
                .w-container { animation: fadeIn 0.3s; color: #1C1C1E; }
                .w-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; }
                
                /* СТАКАН */
                .w-glass-box {
                    width: 180px; height: 240px; margin: 20px auto; position: relative;
                    background: #fff; clip-path: polygon(5% 0%, 95% 0%, 85% 100%, 15% 100%);
                    border-bottom: 10px solid #E5E5EA; overflow: hidden; cursor: pointer;
                }
                .w-fill {
                    position: absolute; bottom: 0; width: 100%; 
                    background: linear-gradient(180deg, #4FC3F7 0%, #007AFF 100%);
                    transition: height 1s ease-in-out;
                }
                .w-glass-txt { position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%); font-size: 38px; font-weight: 900; z-index: 5; }

                /* КНОПКИ */
                .w-btn-circle { width: 70px; height: 70px; background: #007AFF; border-radius: 50%; color: #fff; font-size: 35px; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 5px 15px rgba(0,122,255,0.3); }
                .w-btn-row { display: flex; gap: 20px; justify-content: center; margin-top: 20px; }
                
                /* НАСТРОЙКИ И ГРАФИКИ */
                .w-card { background: #fff; border-radius: 20px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
                .w-input { width: 100%; border: 1px solid #E5E5EA; padding: 12px; border-radius: 12px; font-size: 16px; margin-top: 8px; outline: none; }
                .w-action-btn { background: #007AFF; color: #fff; border: none; padding: 12px; border-radius: 12px; width: 100%; font-weight: 600; margin-top: 10px; }
                
                /* ГРАФИК СТОЛБИКИ */
                .w-chart { display: flex; align-items: flex-end; justify-content: space-between; height: 100px; padding-top: 20px; }
                .w-bar { width: 12%; background: #E5E5EA; border-radius: 4px; position: relative; }
                .w-bar-fill { position: absolute; bottom: 0; width: 100%; background: #007AFF; border-radius: 4px; transition: height 0.5s; }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            </style>
        `;

        // ГЛАВНЫЙ ЭКРАН
        if (this.state.view === 'main') {
            app.innerHTML = `${styles}
            <div class="w-container">
                <div class="w-header">
                    <span onclick="loadModule('./health.js')">‹ Назад</span>
                    <div style="gap:20px; display:flex;">
                        <span onclick="WaterPage.state.view='stats'; WaterPage.render()">📊</span>
                        <span onclick="WaterPage.state.view='settings'; WaterPage.render()">⚙️</span>
                    </div>
                </div>
                
                <div style="background:#FF9500; color:#fff; display:inline-block; padding:4px 12px; border-radius:15px; font-weight:700; margin-bottom:10px;">🔥 ${this.getStreak()} дн. серии</div>
                <div style="font-size:40px; font-weight:900;">${this.state.current} <span style="font-size:18px; color:#8E8E93;">/ ${this.state.goal} мл</span></div>

                <div class="w-glass-box" onclick="WaterPage.addWater(WaterPage.state.cupSize)">
                    <div class="w-glass-txt">${Math.round(percent)}%</div>
                    <div class="w-fill" style="height:${percent}%"></div>
                </div>

                <div class="w-btn-circle" onclick="WaterPage.addWater(WaterPage.state.cupSize)">+</div>
                
                <div class="w-btn-row">
                    <div onclick="WaterPage.addWater(-WaterPage.state.cupSize)" style="color:#FF3B30;">Отменить</div>
                    <div onclick="WaterPage.addWater(1000)" style="color:#007AFF; font-weight:600;">+1 Литр</div>
                </div>
            </div>`;
        }

        // ЭКРАН НАСТРОЕК (как ты просила)
        else if (this.state.view === 'settings') {
            app.innerHTML = `${styles}
            <div class="w-container">
                <div class="w-header"><span onclick="WaterPage.state.view='main'; WaterPage.render()">‹ Готово</span></div>
                <h2 style="font-size:28px; font-weight:800;">Настройки воды</h2>
                
                <div class="w-card">
                    <label style="font-weight:600;">Ваш вес (кг) для расчета:</label>
                    <input type="number" id="set-weight" class="w-input" placeholder="Напр: 60">
                    <button class="w-action-btn" onclick="WaterPage.calcByWeight()">Рассчитать норму (30мл/кг)</button>
                </div>

                <div class="w-card">
                    <label style="font-weight:600;">Цель вручную (мл):</label>
                    <input type="number" id="set-goal" class="w-input" value="${this.state.goal}">
                    <label style="font-weight:600; display:block; margin-top:15px;">Объем стакана (мл):</label>
                    <input type="number" id="set-cup" class="w-input" value="${this.state.cupSize}">
                    <button class="w-action-btn" style="background:#34C759;" onclick="WaterPage.saveSettings()">Сохранить параметры</button>
                </div>
            </div>`;
        }

        // ЭКРАН ГРАФИКОВ И ИСТОРИИ
        else if (this.state.view === 'stats') {
            const historyKeys = Object.keys(this.state.history).sort().reverse().slice(0, 7);
            app.innerHTML = `${styles}
            <div class="w-container">
                <div class="w-header"><span onclick="WaterPage.state.view='main'; WaterPage.render()">‹ Назад</span></div>
                <h2 style="font-size:28px; font-weight:800;">Статистика</h2>
                
                <div class="w-card">
                    <div style="font-weight:700; margin-bottom:10px;">Последние 7 дней</div>
                    <div class="w-chart">
                        ${[6,5,4,3,2,1,0].map(i => {
                            const d = new Date(); d.setDate(d.getDate() - i);
                            const val = (d.toLocaleDateString() === this.state.lastDate) ? this.state.current : (this.state.history[d.toLocaleDateString()] || 0);
                            const h = Math.min((val / this.state.goal) * 100, 100);
                            return `<div class="w-bar" style="height:100%"><div class="w-bar-fill" style="height:${h}%"></div></div>`;
                        }).join('')}
                    </div>
                </div>

                <h3 style="margin-top:25px;">История записей</h3>
                <button class="w-action-btn" style="margin-bottom:15px; background:#5856D6;" onclick="WaterPage.manualAdd()">Добавить за другой день</button>

                ${historyKeys.map(date => `
                    <div class="w-card" style="display:flex; justify-content:space-between; padding:15px;" onclick="WaterPage.editDate('${date}')">
                        <span>${date}</span>
                        <span style="font-weight:700;">${this.state.history[date]} мл ✎</span>
                    </div>
                `).join('')}
            </div>`;
        }
    },

    // Логика функций
    calcByWeight: function() {
        const w = document.getElementById('set-weight').value;
        if(w) { 
            this.state.goal = w * 30; 
            this.saveData(); 
            alert('Норма установлена: ' + this.state.goal + 'мл'); 
        }
    },

    saveSettings: function() {
        this.state.goal = parseInt(document.getElementById('set-goal').value);
        this.state.cupSize = parseInt(document.getElementById('set-cup').value);
        this.saveData();
        this.state.view = 'main';
        this.render();
    },

    manualAdd: function() {
        const d = prompt("Введите дату (ДД.ММ.ГГГГ):", new Date().toLocaleDateString());
        const v = prompt("Сколько мл было выпито?", "1500");
        if(d && v) { this.state.history[d] = parseInt(v); this.saveData(); this.render(); }
    },

    editDate: function(d) {
        const v = prompt("Изменить количество мл для " + d, this.state.history[d]);
        if(v !== null) { this.state.history[d] = parseInt(v); this.saveData(); this.render(); }
    },

    addWater: function(ml) {
        this.state.current = Math.max(0, this.state.current + ml);
        this.saveData();
        this.render();
    }
};

window.WaterPage = WaterPage;
export function render() { WaterPage.init(); }
