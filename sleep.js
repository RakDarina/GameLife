/* ==========================================
   МОДУЛЬ: СОН (sleep.js) — FIXED GRAPH
   ========================================== */

const SleepPage = {
    state: {
        history: {}, 
        view: 'main', 
        statsTab: 'week'
    },

    init: function() {
        this.loadData();
        this.render();
    },

    saveData: function() {
        localStorage.setItem('GL_Sleep_Data', JSON.stringify(this.state));
    },

    loadData: function() {
        const saved = localStorage.getItem('GL_Sleep_Data');
        if (saved) this.state = { ...this.state, ...JSON.parse(saved) };
    },

    calculateDuration: function(start, end) {
        let [sH, sM] = start.split(':').map(Number);
        let [eH, eM] = end.split(':').map(Number);
        let startDate = new Date(2000, 0, 1, sH, sM);
        let endDate = new Date(2000, 0, 1, eH, eM);
        if (endDate <= startDate) endDate.setDate(endDate.getDate() + 1);
        let diffMs = endDate - startDate;
        return parseFloat((diffMs / (1000 * 60 * 60)).toFixed(1));
    },

    getColor: function(hours) {
        if (hours === 0) return '#E5E5EA'; 
        if (hours >= 8) return '#34C759'; // Зеленый (Отлично)
        if (hours >= 6) return '#FFCC00'; // Желтый (Средне)
        return '#FF3B30'; // Красный (Мало)
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        
        const styles = `
            <style>
                .sl-container { 
                    animation: fadeIn 0.3s; 
                    color: #1C1C1E; 
                    max-width: 100%; 
                    overflow-x: hidden; 
                    box-sizing: border-box;
                }
                .sl-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; }
                
                .sl-card { background: #fff; border-radius: 20px; padding: 15px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .sl-label { font-size: 14px; color: #8E8E93; margin-bottom: 8px; display: block; }
                .sl-input { width: 100%; padding: 12px; border: 1px solid #E5E5EA; border-radius: 12px; font-size: 16px; margin-bottom: 15px; box-sizing: border-box; }
                
                .sl-btn-main { width: 100%; padding: 16px; border-radius: 16px; border: none; font-weight: 700; font-size: 16px; cursor: pointer; }
                .sl-btn-primary { background: #5856D6; color: #fff; }
                
                /* СТИЛИ ГРАФИКА */
                .sl-tabs { display: flex; background: #E5E5EA; padding: 2px; border-radius: 12px; margin-bottom: 20px; }
                .sl-tab { flex: 1; text-align: center; padding: 10px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
                .sl-tab.active { background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                
                .sl-chart-area { 
                    display: flex; 
                    align-items: flex-end; 
                    justify-content: space-between; 
                    height: 200px; 
                    padding: 10px 5px; 
                    background: #f9f9f9;
                    border-radius: 10px;
                }
                .sl-bar-wrapper { 
                    flex: 1; 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    height: 100%; 
                    justify-content: flex-end;
                    gap: 8px;
                }
                .sl-bar { 
                    width: 70%; 
                    min-width: 8px;
                    max-width: 30px;
                    border-radius: 6px 6px 0 0; 
                    transition: height 0.6s ease;
                }
                .sl-bar-val { font-size: 9px; font-weight: 700; color: #1C1C1E; }
                .sl-bar-label { font-size: 10px; color: #8E8E93; }

                .sl-legend { display: flex; justify-content: space-around; margin-top: 15px; font-size: 11px; color: #8E8E93; }
                .sl-leg-item { display: flex; align-items: center; gap: 4px; }
                .sl-dot { width: 8px; height: 8px; border-radius: 50%; }

                .sl-modal { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:2000; }
                .sl-modal-content { background:#fff; padding:25px; border-radius:24px; width:85%; box-sizing: border-box; }
            </style>
        `;

        if (this.state.view === 'main') {
            app.innerHTML = `${styles}
            <div class="sl-container">
                <div class="sl-header">
                    <span onclick="loadModule('./health.js')" style="color:#5856D6; font-weight:600;">‹ Назад</span>
                    <span onclick="SleepPage.state.view='stats'; SleepPage.render()" style="font-size:24px;">📊</span>
                </div>

                <h2 style="font-weight:800; margin-bottom:20px;">Новая запись</h2>

                <div class="sl-card">
                    <label class="sl-label">Дата сна</label>
                    <input type="date" id="sl-date" class="sl-input" value="${new Date().toISOString().split('T')[0]}">
                    
                    <div style="display:flex; gap:10px;">
                        <div style="flex:1">
                            <label class="sl-label">Уснула в</label>
                            <input type="time" id="sl-start" class="sl-input" value="23:00">
                        </div>
                        <div style="flex:1">
                            <label class="sl-label">Проснулась в</label>
                            <input type="time" id="sl-end" class="sl-input" value="08:00">
                        </div>
                    </div>

                    <button class="sl-btn-main sl-btn-primary" onclick="SleepPage.addEntry()">Сохранить сон</button>
                </div>
            </div>`;
        } else {
            app.innerHTML = `${styles}
            <div class="sl-container">
                <div class="sl-header">
                    <span onclick="SleepPage.state.view='main'; SleepPage.render()" style="color:#5856D6; font-weight:600;">‹ Добавить</span>
                </div>

                <div class="sl-tabs">
                    <div class="sl-tab ${this.state.statsTab === 'week' ? 'active' : ''}" onclick="SleepPage.state.statsTab='week'; SleepPage.render()">Неделя</div>
                    <div class="sl-tab ${this.state.statsTab === 'month' ? 'active' : ''}" onclick="SleepPage.state.statsTab='month'; SleepPage.render()">Месяц</div>
                </div>

                <div class="sl-card">
                    <div class="sl-chart-area">
                        ${this.renderChartBars()}
                    </div>
                    <div class="sl-legend">
                        <div class="sl-leg-item"><div class="sl-dot" style="background:#34C759"></div> 8ч+</div>
                        <div class="sl-leg-item"><div class="sl-dot" style="background:#FFCC00"></div> 6-7ч</div>
                        <div class="sl-leg-item"><div class="sl-dot" style="background:#FF3B30"></div> <5ч</div>
                    </div>
                </div>
            </div>`;
        }
    },

    addEntry: function() {
        const start = document.getElementById('sl-start').value;
        const end = document.getElementById('sl-end').value;
        const rawDate = document.getElementById('sl-date').value;
        if (!start || !end || !rawDate) return;

        const dateObj = new Date(rawDate);
        const dateFormatted = dateObj.toLocaleDateString();
        const hours = this.calculateDuration(start, end);

        this.state.history[dateFormatted] = { start, end, hours };
        this.saveData();
        this.state.view = 'stats';
        this.render();
    },

    renderChartBars: function() {
        let bars = '';
        let count = this.state.statsTab === 'week' ? 7 : 30;
        
        for (let i = count - 1; i >= 0; i--) {
            let d = new Date();
            d.setDate(d.getDate() - i);
            let ds = d.toLocaleDateString();
            
            let entry = this.state.history[ds] || { hours: 0 };
            // Высота: 10 часов сна = 100% высоты графика
            let hPercent = Math.min((entry.hours / 10) * 100, 100); 
            
            let label = (count === 7) ? d.toLocaleDateString('ru-RU', {weekday: 'short'}) : d.getDate();

            bars += `
                <div class="sl-bar-wrapper" onclick="SleepPage.showEditModal('${ds}')">
                    <div class="sl-bar-val">${entry.hours > 0 ? entry.hours : ''}</div>
                    <div class="sl-bar" style="height:${hPercent}%; background:${this.getColor(entry.hours)}"></div>
                    <div class="sl-bar-label">${label}</div>
                </div>
            `;
        }
        return bars;
    },

    showEditModal: function(dateStr) {
        const entry = this.state.history[dateStr] || { start: "23:00", end: "08:00", hours: 0 };
        const modal = document.createElement('div');
        modal.className = 'sl-modal';
        modal.innerHTML = `
            <div class="sl-modal-content">
                <h3 style="margin-top:0;">${dateStr}</h3>
                <label class="sl-label">Уснула:</label>
                <input type="time" id="edit-sl-start" class="sl-input" value="${entry.start}">
                <label class="sl-label">Проснулась:</label>
                <input type="time" id="edit-sl-end" class="sl-input" value="${entry.end}">
                
                <button class="sl-btn-main sl-btn-primary" style="margin-bottom:10px;" onclick="SleepPage.updateEntry('${dateStr}')">Сохранить</button>
                <button class="sl-btn-main" style="background:#FF3B30; color:#fff; margin-bottom:10px;" onclick="SleepPage.deleteEntry('${dateStr}')">Удалить запись</button>
                <button class="sl-btn-main" style="background:#E5E5EA;" onclick="this.parentElement.parentElement.remove()">Отмена</button>
            </div>
        `;
        document.body.appendChild(modal);
    },

    updateEntry: function(dateStr) {
        const start = document.getElementById('edit-sl-start').value;
        const end = document.getElementById('edit-sl-end').value;
        const hours = this.calculateDuration(start, end);
        this.state.history[dateStr] = { start, end, hours };
        this.saveData();
        document.querySelector('.sl-modal').remove();
        this.render();
    },

    deleteEntry: function(dateStr) {
        delete this.state.history[dateStr];
        this.saveData();
        document.querySelector('.sl-modal').remove();
        this.render();
    }
};

window.SleepPage = SleepPage;
export function render() { SleepPage.init(); }
