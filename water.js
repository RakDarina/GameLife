/* ==========================================
   МОДУЛЬ: ВОДА (water.js) — ULTIMATE VERSION
   ========================================== */

const WaterPage = {
    state: {
        goal: 2000,
        current: 0,
        cupSize: 250,
        lastDate: new Date().toLocaleDateString(),
        history: {}, 
        view: 'main', // main, stats, settings
        statsTab: 'week' // week, month
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
        let currentVal = this.state.current;
        if (currentVal >= this.state.goal) streak = 1;
        for (let i = 1; i < 365; i++) {
            let prev = new Date();
            prev.setDate(d.getDate() - i);
            let s = prev.toLocaleDateString();
            if ((this.state.history[s] || 0) >= this.state.goal) streak++; else break;
        }
        return streak;
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const percent = Math.min((this.state.current / this.state.goal) * 100, 100);

        const styles = `
            <style>
                .w-container { animation: fadeIn 0.3s; color: #1C1C1E; }
                .w-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 0 20px; }
                .w-back { color: #007AFF; font-weight: 500; cursor: pointer; }
                
                /* СТАКАН */
                .w-glass-box {
                    width: 150px; height: 210px; margin: 20px auto; position: relative;
                    background: #fff; clip-path: polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%);
                    border-bottom: 8px solid #C6C6C8; overflow: hidden;
                }
                .w-fill {
                    position: absolute; bottom: 0; width: 100%; 
                    background: linear-gradient(180deg, #4FC3F7 0%, #007AFF 100%);
                    transition: height 1s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .w-glass-txt { position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%); font-size: 32px; font-weight: 900; z-index: 5; mix-blend-mode: difference; color: white; }

                /* КНОПКИ УПРАВЛЕНИЯ */
                .w-controls { display: flex; justify-content: center; align-items: center; gap: 30px; margin-top: 20px; }
                .w-btn-circle { width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: bold; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                .w-btn-plus { background: #007AFF; color: #fff; }
                .w-btn-minus { background: #fff; color: #FF3B30; border: 2px solid #FF3B30; }
                .w-btn-circle:active { transform: scale(0.9); }

                /* ГРАФИКИ */
                .w-tabs { display: flex; background: #E5E5EA; padding: 2px; border-radius: 10px; margin-bottom: 20px; }
                .w-tab { flex: 1; text-align: center; padding: 8px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
                .w-tab.active { background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

                /* КАРТА МЕСЯЦА */
                .w-month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
                .w-day-cell { aspect-ratio: 1; border-radius: 8px; background: #F2F2F7; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; position: relative; }
                .w-day-fill { position: absolute; bottom: 0; left: 0; width: 100%; border-radius: 0 0 8px 8px; background: #007AFF; opacity: 0.3; }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        if (this.state.view === 'main') {
            app.innerHTML = `${styles}
            <div class="w-container">
                <div class="w-header">
                    <span class="w-back" onclick="loadModule('./health.js')">‹ Назад</span>
                    <div style="gap:20px; display:flex; font-size:22px;">
                        <span onclick="WaterPage.state.view='stats'; WaterPage.render()">📊</span>
                        <span onclick="WaterPage.state.view='settings'; WaterPage.render()">⚙️</span>
                    </div>
                </div>
                
                <div style="background:#FF9500; color:#fff; display:inline-block; padding:6px 16px; border-radius:20px; font-weight:700; margin-bottom:10px;">🔥 День серии: ${this.getStreak()}</div>
                <div style="font-size:42px; font-weight:900;">${this.state.current}<span style="font-size:18px; color:#8E8E93; font-weight:500;"> / ${this.state.goal} мл</span></div>

                <div class="w-glass-box">
                    <div class="w-glass-txt">${Math.round(percent)}%</div>
                    <div class="w-fill" style="height:${percent}%"></div>
                </div>

                <div class="w-controls">
                    <div class="w-btn-circle w-btn-minus" onclick="WaterPage.changeWater(-WaterPage.state.cupSize)">−</div>
                    <div class="w-btn-circle w-btn-plus" onclick="WaterPage.changeWater(WaterPage.state.cupSize)">+</div>
                </div>
                <p style="color:#8E8E93; margin-top:20px;">Один стакан: ${this.state.cupSize} мл</p>
            </div>`;
        }

        else if (this.state.view === 'stats') {
            app.innerHTML = `${styles}
            <div class="w-container">
                <div class="w-header"><span class="w-back" onclick="WaterPage.state.view='main'; WaterPage.render()">‹ Готово</span></div>
                
                <div class="w-tabs">
                    <div class="w-tab ${this.state.statsTab === 'week' ? 'active' : ''}" onclick="WaterPage.state.statsTab='week'; WaterPage.render()">Неделя</div>
                    <div class="w-tab ${this.state.statsTab === 'month' ? 'active' : ''}" onclick="WaterPage.state.statsTab='month'; WaterPage.render()">Месяц</div>
                </div>

                ${this.state.statsTab === 'week' ? this.renderWeekChart() : this.renderMonthCalendar()}

                <div style="margin-top:30px; padding:15px; background:#fff; border-radius:15px; font-size:14px; color:#8E8E93; text-align:center;">
                    Нажми на любой день, чтобы изменить записи
                </div>
            </div>`;
        }

        else if (this.state.view === 'settings') {
            app.innerHTML = `${styles}
            <div class="w-container">
                <div class="w-header"><span class="w-back" onclick="WaterPage.state.view='main'; WaterPage.render()">‹ Назад</span></div>
                <h2 style="font-weight:800; font-size:28px;">Настройки</h2>
                <div style="background:#fff; padding:20px; border-radius:20px; margin-top:10px;">
                    <p style="margin:0 0 10px; font-weight:600;">Размер стакана (мл)</p>
                    <input type="number" id="set-cup" class="w-input" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E5EA;" value="${this.state.cupSize}">
                    <p style="margin:15px 0 10px; font-weight:600;">Цель на день (мл)</p>
                    <input type="number" id="set-goal" class="w-input" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E5EA;" value="${this.state.goal}">
                    <button onclick="WaterPage.saveSettings()" style="width:100%; margin-top:20px; padding:15px; background:#007AFF; color:#fff; border:none; border-radius:12px; font-weight:700;">Сохранить</button>
                </div>
            </div>`;
        }
    },

    renderWeekChart: function() {
        let bars = '';
        for (let i = 6; i >= 0; i--) {
            let d = new Date(); d.setDate(d.getDate() - i);
            let ds = d.toLocaleDateString();
            let val = (ds === this.state.lastDate) ? this.state.current : (this.state.history[ds] || 0);
            let h = Math.min((val / this.state.goal) * 100, 100);
            bars += `
                <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:10px;" onclick="WaterPage.editAnyDay('${ds}')">
                    <div style="font-size:10px; font-weight:600;">${val}</div>
                    <div style="width:25px; height:120px; background:#F2F2F7; border-radius:6px; position:relative; overflow:hidden;">
                        <div style="position:absolute; bottom:0; width:100%; height:${h}%; background:#007AFF; transition:0.5s;"></div>
                    </div>
                    <div style="font-size:11px; color:#8E8E93;">${ds.slice(0,5)}</div>
                </div>
            `;
        }
        return `<div style="display:flex; align-items:flex-end; background:#fff; padding:20px; border-radius:20px; height:200px;">${bars}</div>`;
    },

    renderMonthCalendar: function() {
        let cells = '';
        let d = new Date();
        let currentMonth = d.getMonth();
        let currentYear = d.getFullYear();
        let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            let dateObj = new Date(currentYear, currentMonth, i);
            let ds = dateObj.toLocaleDateString();
            let val = (ds === this.state.lastDate) ? this.state.current : (this.state.history[ds] || 0);
            let fillH = Math.min((val / this.state.goal) * 100, 100);
            
            cells += `
                <div class="w-day-cell" onclick="WaterPage.editAnyDay('${ds}')">
                    ${i}
                    <div class="w-day-fill" style="height:${fillH}%"></div>
                </div>
            `;
        }
        return `<div class="w-month-grid">${cells}</div>`;
    },

    editAnyDay: function(dateStr) {
        const action = prompt(`ДЕНЬ: ${dateStr}\n1. Добавить мл (напр: 250)\n2. Удалить мл (напр: -250)\n3. Очистить день (0)`, "250");
        
        if (action !== null) {
            let val = parseInt(action);
            if (dateStr === this.state.lastDate) {
                this.state.current = Math.max(0, this.state.current + val);
            } else {
                let old = this.state.history[dateStr] || 0;
                this.state.history[dateStr] = Math.max(0, old + val);
            }
            this.saveData();
            this.render();
        }
    },

    changeWater: function(ml) {
        this.state.current = Math.max(0, this.state.current + ml);
        this.saveData();
        this.render();
    },

    saveSettings: function() {
        this.state.cupSize = parseInt(document.getElementById('set-cup').value);
        this.state.goal = parseInt(document.getElementById('set-goal').value);
        this.saveData();
        this.state.view = 'main';
        this.render();
    }
};

window.WaterPage = WaterPage;
export function render() { WaterPage.init(); }
