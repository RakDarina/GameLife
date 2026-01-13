/* ==========================================
   МОДУЛЬ: ВОДА (water.js) — STRICT LOGIC
   ========================================== */

const WaterPage = {
    state: {
        goal: 2000,
        current: 0,
        cupSize: 250,
        lastDate: new Date().toLocaleDateString(),
        history: {}, 
        view: 'main', 
        statsTab: 'week'
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
        for (let i = 1; i < 365; i++) {
            let prev = new Date();
            prev.setDate(d.getDate() - i);
            let s = prev.toLocaleDateString();
            if ((this.state.history[s] || 0) >= this.state.goal) streak++; else break;
        }
        return streak;
    },

    // Функция только для графиков: спрашивает число
    askSpecificAmount: function(dateStr, isAdding) {
        const title = isAdding ? "Сколько добавить мл?" : "Сколько убрать мл?";
        const amount = prompt(title, "250");
        
        if (amount !== null && amount !== "") {
            const val = parseInt(amount);
            const multiplier = isAdding ? 1 : -1;
            
            if (dateStr === this.state.lastDate) {
                this.state.current = Math.max(0, this.state.current + (val * multiplier));
            } else {
                this.state.history[dateStr] = Math.max(0, (this.state.history[dateStr] || 0) + (val * multiplier));
            }
            this.saveData();
            this.closeModal();
            this.render();
        }
    },

    // Функция для главной: просто + / - без вопросов
    quickChange: function(ml) {
        this.state.current = Math.max(0, this.state.current + ml);
        this.saveData();
        this.render();
    },

    closeModal: function() {
        const modal = document.querySelector('.w-modal');
        if (modal) modal.remove();
    },

    showEditModal: function(dateStr) {
        const val = (dateStr === this.state.lastDate) ? this.state.current : (this.state.history[dateStr] || 0);
        const modal = document.createElement('div');
        modal.className = 'w-modal';
        modal.innerHTML = `
            <div class="w-modal-content">
                <h3 style="margin-bottom:5px;">${dateStr}</h3>
                <p style="margin-bottom:20px; color:#8E8E93;">Выпито: ${val} мл</p>
                <button class="w-modal-btn" style="background:#007AFF; color:#fff;" onclick="WaterPage.askSpecificAmount('${dateStr}', true)">Добавить стакан</button>
                <button class="w-modal-btn" style="background:#FF3B30; color:#fff;" onclick="WaterPage.askSpecificAmount('${dateStr}', false)">Убрать стакан</button>
                <button class="w-modal-btn" style="background:#E5E5EA; color:#000;" onclick="WaterPage.closeModal()">Отмена</button>
            </div>
        `;
        document.body.appendChild(modal);
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const percent = Math.min((this.state.current / this.state.goal) * 100, 100);

        const styles = `
            <style>
                .w-container { animation: fadeIn 0.3s; color: #1C1C1E; }
                .w-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; }
                .w-glass-box {
                    width: 150px; height: 210px; margin: 30px auto; position: relative;
                    background: #fff; clip-path: polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%);
                    border-bottom: 8px solid #C6C6C8; overflow: hidden;
                }
                .w-fill {
                    position: absolute; bottom: 0; width: 100%; 
                    background: linear-gradient(180deg, #4FC3F7 0%, #007AFF 100%);
                    transition: height 1s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .w-glass-txt { position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%); font-size: 32px; font-weight: 900; z-index: 5; color: #000; }

                .w-controls { display: flex; justify-content: center; gap: 30px; margin-top: 20px; }
                .w-btn-circle { width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                
                .w-tabs { display: flex; background: #E5E5EA; padding: 2px; border-radius: 10px; margin-bottom: 20px; }
                .w-tab { flex: 1; text-align: center; padding: 8px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
                .w-tab.active { background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

                .w-month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
                .w-day-cell { aspect-ratio: 1; border-radius: 8px; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; position: relative; overflow: hidden; border: 1px solid #F2F2F7; }
                .w-day-fill { position: absolute; bottom: 0; left: 0; width: 100%; background: #007AFF; opacity: 0.2; pointer-events: none; }

                .w-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
                .w-modal-content { background: #fff; padding: 30px; border-radius: 25px; width: 80%; text-align: center; }
                .w-modal-btn { width: 100%; padding: 15px; margin: 8px 0; border-radius: 15px; border: none; font-weight: 700; font-size: 17px; cursor: pointer; }
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
                
                <div style="font-size:18px; color:#8E8E93; margin-top:20px;">Сегодня выпито:</div>
                <div style="font-size:48px; font-weight:900;">${this.state.current}<span style="font-size:20px; color:#AEAEB2;"> мл</span></div>

                <div class="w-glass-box" onclick="WaterPage.quickChange(WaterPage.state.cupSize)">
                    <div class="w-glass-txt">${Math.round(percent)}%</div>
                    <div class="w-fill" style="height:${percent}%"></div>
                </div>

                <div class="w-controls">
                    <div class="w-btn-circle" style="background:#fff; color:#FF3B30; border:2px solid #FF3B30;" onclick="WaterPage.quickChange(-WaterPage.state.cupSize)">−</div>
                    <div class="w-btn-circle" style="background:#007AFF; color:#fff;" onclick="WaterPage.quickChange(WaterPage.state.cupSize)">+</div>
                </div>
            </div>`;
        }

        else if (this.state.view === 'stats') {
            app.innerHTML = `${styles}
            <div class="w-container">
                <div class="w-header"><span onclick="WaterPage.state.view='main'; WaterPage.render()" style="color:#007AFF">‹ Трекер</span></div>
                <div style="background:#FF9500; color:#fff; display:inline-block; padding:10px; border-radius:15px; font-weight:700; margin-bottom:20px; width:100%; text-align:center;">🔥 Серия: ${this.getStreak()} дн.</div>
                <div class="w-tabs">
                    <div class="w-tab ${this.state.statsTab === 'week' ? 'active' : ''}" onclick="WaterPage.state.statsTab='week'; WaterPage.render()">Неделя</div>
                    <div class="w-tab ${this.state.statsTab === 'month' ? 'active' : ''}" onclick="WaterPage.state.statsTab='month'; WaterPage.render()">Месяц</div>
                </div>
                ${this.state.statsTab === 'week' ? this.renderWeekChart() : this.renderMonthCalendar()}
            </div>`;
        }

        else if (this.state.view === 'settings') {
            app.innerHTML = `${styles}
            <div class="w-container">
                <div class="w-header"><span onclick="WaterPage.state.view='main'; WaterPage.render()" style="color:#007AFF">‹ Готово</span></div>
                <div style="background:#fff; padding:20px; border-radius:20px;">
                    <p style="font-weight:600;">Рассчитать по весу:</p>
                    <div style="display:flex; gap:10px; margin-bottom:20px;">
                        <input type="number" id="set-weight" placeholder="Кг" style="flex:1; padding:12px; border-radius:10px; border:1px solid #E5E5EA;">
                        <button onclick="WaterPage.calcWeight()" style="padding:10px; background:#007AFF; color:#fff; border:none; border-radius:10px;">OK</button>
                    </div>
                    <p style="font-weight:600;">Цель (мл):</p>
                    <input type="number" id="set-goal" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E5EA; margin-bottom:20px;" value="${this.state.goal}">
                    <p style="font-weight:600;">Размер стакана (мл):</p>
                    <input type="number" id="set-cup" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E5EA;" value="${this.state.cupSize}">
                    <button onclick="WaterPage.saveSettings()" style="width:100%; margin-top:30px; padding:15px; background:#34C759; color:#fff; border:none; border-radius:12px; font-weight:700;">Сохранить</button>
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
            bars += `<div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:8px;" onclick="WaterPage.showEditModal('${ds}')">
                <div style="font-size:10px; font-weight:700;">${val}</div>
                <div style="width:22px; height:120px; background:#F2F2F7; border-radius:5px; position:relative; overflow:hidden;">
                    <div style="position:absolute; bottom:0; width:100%; height:${h}%; background:#007AFF;"></div>
                </div>
                <div style="font-size:11px; color:#8E8E93;">${ds.slice(0,5)}</div>
            </div>`;
        }
        return `<div style="display:flex; align-items:flex-end; background:#fff; padding:20px; border-radius:20px; height:200px;">${bars}</div>`;
    },

    renderMonthCalendar: function() {
        let cells = '';
        let d = new Date();
        let daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            let ds = new Date(d.getFullYear(), d.getMonth(), i).toLocaleDateString();
            let val = (ds === this.state.lastDate) ? this.state.current : (this.state.history[ds] || 0);
            let fillH = Math.min((val / this.state.goal) * 100, 100);
            cells += `<div class="w-day-cell" onclick="WaterPage.showEditModal('${ds}')">${i}<div class="w-day-fill" style="height:${fillH}%"></div></div>`;
        }
        return `<div class="w-month-grid">${cells}</div>`;
    },

    calcWeight: function() {
        const w = document.getElementById('set-weight').value;
        if(w) { 
            this.state.goal = w * 30; 
            document.getElementById('set-goal').value = this.state.goal;
        }
    },

    saveSettings: function() {
        this.state.cupSize = parseInt(document.getElementById('set-cup').value) || 250;
        this.state.goal = parseInt(document.getElementById('set-goal').value) || 2000;
        this.saveData();
        this.state.view = 'main';
        this.render();
    }
};

window.WaterPage = WaterPage;
export function render() { WaterPage.init(); }
