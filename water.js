/* ==========================================
   МОДУЛЬ: ВОДА (water.js) — PRO VERSION
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
            // Перед обнулением сохраняем текущий день в историю
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
            if ((this.state.history[s] || 0) >= this.state.goal) streak++; else break;
        }
        return streak;
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const percent = Math.min((this.state.current / this.state.goal) * 100, 100);

        const styles = `
            <style>
                .w-container { animation: fadeIn 0.3s; color: #1C1C1E; font-family: -apple-system, sans-serif; }
                .w-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; }
                
                /* СТАКАН */
                .w-glass-box {
                    width: 160px; height: 220px; margin: 20px auto; position: relative;
                    background: #fff; clip-path: polygon(5% 0%, 95% 0%, 85% 100%, 15% 100%);
                    border-bottom: 10px solid #E5E5EA; overflow: hidden; cursor: pointer;
                }
                .w-fill {
                    position: absolute; bottom: 0; width: 100%; 
                    background: linear-gradient(180deg, #4FC3F7 0%, #007AFF 100%);
                    transition: height 1s ease-in-out;
                }
                .w-glass-txt { position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%); font-size: 32px; font-weight: 900; z-index: 5; }

                .w-btn-circle { width: 80px; height: 80px; background: #007AFF; border-radius: 50%; color: #fff; font-size: 40px; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 5px 15px rgba(0,122,255,0.3); cursor: pointer; }
                
                .w-card { background: #fff; border-radius: 20px; padding: 18px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
                .w-input { width: 100%; border: 1px solid #E5E5EA; padding: 14px; border-radius: 14px; font-size: 16px; margin-top: 8px; box-sizing: border-box; }
                .w-action-btn { background: #007AFF; color: #fff; border: none; padding: 14px; border-radius: 14px; width: 100%; font-weight: 700; margin-top: 10px; cursor: pointer; }

                /* ГРАФИК */
                .w-bar-row { display: flex; align-items: flex-end; justify-content: space-between; height: 120px; margin-top: 10px; }
                .w-bar-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; }
                .w-bar-bg { width: 20px; height: 80px; background: #F2F2F7; border-radius: 10px; position: relative; overflow: hidden; }
                .w-bar-fill { position: absolute; bottom: 0; width: 100%; background: #007AFF; transition: height 0.5s; }
                .w-bar-date { font-size: 10px; color: #8E8E93; transform: rotate(-45deg); margin-top: 5px; }

                /* ИСТОРИЯ */
                .w-hist-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 0.5px solid #F2F2F7; }
                .w-hist-row:last-child { border: none; }
                .w-edit-btns { display: flex; gap: 15px; }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        if (this.state.view === 'main') {
            app.innerHTML = `${styles}
            <div class="w-container">
                <div class="w-header">
                    <span onclick="loadModule('./health.js')" style="color:#007AFF">‹ Назад</span>
                    <div style="gap:20px; display:flex; font-size:24px;">
                        <span onclick="WaterPage.state.view='stats'; WaterPage.render()">📊</span>
                        <span onclick="WaterPage.state.view='settings'; WaterPage.render()">⚙️</span>
                    </div>
                </div>
                
                <div style="background:#FF9500; color:#fff; display:inline-block; padding:5px 15px; border-radius:20px; font-weight:700; margin-bottom:15px;">🔥 Серия: ${this.getStreak()} дн.</div>
                <div style="font-size:18px; color:#8E8E93;">Сегодня выпито:</div>
                <div style="font-size:42px; font-weight:900; margin-bottom:10px;">${this.state.current} <span style="font-size:20px; color:#AEAEB2;">/ ${this.state.goal} мл</span></div>

                <div class="w-glass-box" onclick="WaterPage.addWater(WaterPage.state.cupSize)">
                    <div class="w-glass-txt">${Math.round(percent)}%</div>
                    <div class="w-fill" style="height:${percent}%"></div>
                </div>

                <div class="w-btn-circle" onclick="WaterPage.addWater(WaterPage.state.cupSize)">+</div>
                <p style="color:#8E8E93; margin-top:20px; font-size:14px;">Нажми на стакан, чтобы добавить ${this.state.cupSize}мл</p>
            </div>`;
        }

        else if (this.state.view === 'settings') {
            app.innerHTML = `${styles}
            <div class="w-container">
                <div class="w-header"><span onclick="WaterPage.state.view='main'; WaterPage.render()" style="color:#007AFF">‹ Готово</span></div>
                <h2 style="font-size:32px; font-weight:800; margin-bottom:20px;">Настройки</h2>
                
                <div class="w-card">
                    <label style="font-weight:600; color:#8E8E93; font-size:13px; text-transform:uppercase;">Авто-расчет по весу</label>
                    <input type="number" id="set-weight" class="w-input" placeholder="Введите ваш вес в кг">
                    <button class="w-action-btn" onclick="WaterPage.calcByWeight()">Рассчитать (30 мл на кг)</button>
                </div>

                <div class="w-card">
                    <label style="font-weight:600; color:#8E8E93; font-size:13px; text-transform:uppercase;">Ручные параметры</label>
                    <div style="margin-top:10px;">Цель в мл:</div>
                    <input type="number" id="set-goal" class="w-input" value="${this.state.goal}">
                    <div style="margin-top:10px;">Объем стакана в мл:</div>
                    <input type="number" id="set-cup" class="w-input" value="${this.state.cupSize}">
                    <button class="w-action-btn" style="background:#34C759;" onclick="WaterPage.saveSettings()">Сохранить изменения</button>
                </div>
            </div>`;
        }

        else if (this.state.view === 'stats') {
            // Подготовка данных для графика (7 дней)
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toLocaleDateString();
                const val = (dateStr === this.state.lastDate) ? this.state.current : (this.state.history[dateStr] || 0);
                last7Days.push({ date: dateStr.slice(0,5), fullDate: dateStr, val: val });
            }

            const historyEntries = Object.entries(this.state.history).sort((a,b) => b[0].split('.').reverse().join('') - a[0].split('.').reverse().join(''));

            app.innerHTML = `${styles}
            <div class="w-container">
                <div class="w-header"><span onclick="WaterPage.state.view='main'; WaterPage.render()" style="color:#007AFF">‹ Назад</span></div>
                
                <div class="w-card">
                    <div style="font-weight:700;">График за неделю</div>
                    <div class="w-bar-row">
                        ${last7Days.map(d => {
                            const h = Math.min((d.val / this.state.goal) * 100, 100);
                            return `
                            <div class="w-bar-item">
                                <div style="font-size:9px; font-weight:700;">${d.val}</div>
                                <div class="w-bar-bg"><div class="w-bar-fill" style="height:${h}%"></div></div>
                                <div class="w-bar-date">${d.date}</div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>

                <h3 style="margin: 25px 0 15px;">История и редактирование</h3>
                <button class="w-action-btn" style="margin-bottom:20px; background:#5856D6;" onclick="WaterPage.manualAdd()">+ Добавить запись за любой день</button>

                <div class="w-card">
                    ${historyEntries.length === 0 ? '<div style="color:#8E8E93; text-align:center;">История пуста</div>' : ''}
                    ${historyEntries.map(([date, amount]) => `
                        <div class="w-hist-row">
                            <div>
                                <div style="font-weight:700;">${date}</div>
                                <div style="font-size:13px; color:#8E8E93;">${amount} мл</div>
                            </div>
                            <div class="w-edit-btns">
                                <span onclick="WaterPage.editDate('${date}', ${amount})">✏️</span>
                                <span onclick="WaterPage.deleteDate('${date}')">🗑️</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }
    },

    calcByWeight: function() {
        const w = document.getElementById('set-weight').value;
        if(w) { 
            this.state.goal = w * 30; 
            this.saveData(); 
            alert('Ваша норма: ' + this.state.goal + ' мл');
            this.render();
        }
    },

    saveSettings: function() {
        this.state.goal = parseInt(document.getElementById('set-goal').value) || 2000;
        this.state.cupSize = parseInt(document.getElementById('set-cup').value) || 250;
        this.saveData();
        this.state.view = 'main';
        this.render();
    },

    manualAdd: function() {
        const d = prompt("Введите дату (например: 01.01.2026):", new Date().toLocaleDateString());
        const v = prompt("Сколько мл вы выпили?", "1500");
        if(d && v) { 
            this.state.history[d] = parseInt(v); 
            this.saveData(); 
            this.render(); 
        }
    },

    editDate: function(date, currentVal) {
        const v = prompt(`Изменить объем за ${date}:`, currentVal);
        if(v !== null) {
            this.state.history[date] = parseInt(v);
            this.saveData();
            this.render();
        }
    },

    deleteDate: function(date) {
        if(confirm(`Удалить запись за ${date}?`)) {
            delete this.state.history[date];
            this.saveData();
            this.render();
        }
    },

    addWater: function(ml) {
        this.state.current = Math.max(0, this.state.current + ml);
        this.saveData();
        this.render();
    }
};

window.WaterPage = WaterPage;
export function render() { WaterPage.init(); }
