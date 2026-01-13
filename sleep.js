/* ==========================================
   МОДУЛЬ: СОН (sleep.js)
   ========================================== */

const SleepPage = {
    state: {
        history: {}, // Формат: { "11.01.2026": { start: "23:00", end: "07:30", hours: 8.5 } }
        view: 'main', // main, stats
        statsTab: 'week' // week, month, year
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

    // Расчет длительности сна
    calculateDuration: function(start, end) {
        let [sH, sM] = start.split(':').map(Number);
        let [eH, eM] = end.split(':').map(Number);
        
        let startDate = new Date(2000, 0, 1, sH, sM);
        let endDate = new Date(2000, 0, 1, eH, eM);
        
        if (endDate <= startDate) endDate.setDate(endDate.getDate() + 1);
        
        let diffMs = endDate - startDate;
        return parseFloat((diffMs / (1000 * 60 * 60)).toFixed(1));
    },

    // Цвет в зависимости от часов
    getColor: function(hours) {
        if (hours >= 8) return '#34C759'; // Зеленый
        if (hours >= 6) return '#FFCC00'; // Желтый
        return '#FF3B30'; // Красный
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        
        const styles = `
            <style>
                .sl-container { animation: fadeIn 0.3s; color: #1C1C1E; font-family: -apple-system, sans-serif; }
                .sl-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; }
                
                .sl-card { background: #fff; border-radius: 20px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .sl-label { font-size: 14px; color: #8E8E93; margin-bottom: 8px; display: block; }
                .sl-input { width: 100%; padding: 12px; border: 1px solid #E5E5EA; border-radius: 12px; font-size: 18px; margin-bottom: 15px; font-family: inherit; }
                
                .sl-btn-main { width: 100%; padding: 16px; border-radius: 16px; border: none; font-weight: 700; font-size: 16px; cursor: pointer; transition: 0.2s; }
                .sl-btn-primary { background: #5856D6; color: #fff; }
                
                /* ГРАФИК */
                .sl-tabs { display: flex; background: #E5E5EA; padding: 2px; border-radius: 12px; margin-bottom: 20px; }
                .sl-tab { flex: 1; text-align: center; padding: 10px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
                .sl-tab.active { background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                
                .sl-chart-row { display: flex; align-items: flex-end; gap: 8px; height: 180px; padding: 10px 0; }
                .sl-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; cursor: pointer; }
                .sl-bar { width: 100%; border-radius: 4px 4px 0 0; transition: height 0.5s; }
                .sl-bar-date { font-size: 9px; color: #8E8E93; }

                .sl-modal { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:2000; }
                .sl-modal-content { background:#fff; padding:25px; border-radius:24px; width:85%; }
            </style>
        `;

        if (this.state.view === 'main') {
            app.innerHTML = `${styles}
            <div class="sl-container">
                <div class="sl-header">
                    <span onclick="loadModule('./health.js')" style="color:#5856D6; font-weight:600; cursor:pointer;">‹ Назад</span>
                    <span onclick="SleepPage.state.view='stats'; SleepPage.render()" style="font-size:24px; cursor:pointer;">📊</span>
                </div>

                <h2 style="font-size:28px; font-weight:800; margin-bottom:5px;">Сон</h2>
                <p style="color:#8E8E93; margin-bottom:25px;">Запишите время отдыха</p>

                <div class="sl-card">
                    <label class="sl-label">Когда вы легли?</label>
                    <input type="time" id="sl-start" class="sl-input" value="23:00">
                    
                    <label class="sl-label">Когда вы проснулись?</label>
                    <input type="time" id="sl-end" class="sl-input" value="08:00">
                    
                    <label class="sl-label">Дата записи</label>
                    <input type="date" id="sl-date" class="sl-input" value="${new Date().toISOString().split('T')[0]}">

                    <button class="sl-btn-main sl-btn-primary" onclick="SleepPage.addEntry()">Сохранить запись</button>
                </div>

                <div id="sl-today-result"></div>
            </div>`;
        } else {
            app.innerHTML = `${styles}
            <div class="sl-container">
                <div class="sl-header">
                    <span onclick="SleepPage.state.view='main'; SleepPage.render()" style="color:#5856D6; font-weight:600; cursor:pointer;">‹ Добавить</span>
                </div>

                <div class="sl-tabs">
                    <div class="sl-tab ${this.state.statsTab === 'week' ? 'active' : ''}" onclick="SleepPage.state.statsTab='week'; SleepPage.render()">Неделя</div>
                    <div class="sl-tab ${this.state.statsTab === 'month' ? 'active' : ''}" onclick="SleepPage.state.statsTab='month'; SleepPage.render()">Месяц</div>
                    <div class="sl-tab ${this.state.statsTab === 'year' ? 'active' : ''}" onclick="SleepPage.state.statsTab='year'; SleepPage.render()">Год</div>
                </div>

                <div class="sl-card">
                    <div class="sl-chart-row">
                        ${this.renderChartBars()}
                    </div>
                </div>
                
                <p style="text-align:center; color:#8E8E93; font-size:13px;">Нажми на столбик, чтобы изменить или удалить</p>
            </div>`;
        }
    },

    addEntry: function() {
        const start = document.getElementById('sl-start').value;
        const end = document.getElementById('sl-end').value;
        const rawDate = document.getElementById('sl-date').value;
        if (!start || !end || !rawDate) return;

        const dateFormatted = new Date(rawDate).toLocaleDateString();
        const hours = this.calculateDuration(start, end);

        this.state.history[dateFormatted] = { start, end, hours };
        this.saveData();
        alert(`Записано: ${hours} ч. сна`);
        this.state.view = 'stats';
        this.render();
    },

    renderChartBars: function() {
        let bars = '';
        let count = this.state.statsTab === 'week' ? 7 : (this.state.statsTab === 'month' ? 30 : 12);
        
        for (let i = count - 1; i >= 0; i--) {
            let d = new Date();
            if (this.state.statsTab === 'year') d.setMonth(d.getMonth() - i);
            else d.setDate(d.getDate() - i);
            
            let ds = d.toLocaleDateString();
            let label = this.state.statsTab === 'year' ? d.toLocaleString('default', { month: 'short' }) : d.getDate();
            
            let entry = this.state.history[ds] || { hours: 0 };
            let hPercent = Math.min((entry.hours / 12) * 100, 100); // 12 часов - максимум для графика
            
            bars += `
                <div class="sl-bar-col" onclick="SleepPage.showEditModal('${ds}')">
                    <div style="font-size:8px; font-weight:700;">${entry.hours || ''}</div>
                    <div class="sl-bar" style="height:${hPercent}%; background:${this.getColor(entry.hours)}"></div>
                    <div class="sl-bar-date">${label}</div>
                </div>
            `;
        }
        return bars;
    },

    showEditModal: function(dateStr) {
        const entry = this.state.history[dateStr];
        if (!entry) {
            alert("Нет данных за этот день");
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'sl-modal';
        modal.innerHTML = `
            <div class="sl-modal-content">
                <h3 style="margin:0 0 15px;">${dateStr}</h3>
                <label class="sl-label">Уснула:</label>
                <input type="time" id="edit-sl-start" class="sl-input" value="${entry.start}">
                <label class="sl-label">Проснулась:</label>
                <input type="time" id="edit-sl-end" class="sl-input" value="${entry.end}">
                
                <button class="sl-btn-main sl-btn-primary" style="margin-bottom:10px;" onclick="SleepPage.updateEntry('${dateStr}')">Сохранить</button>
                <button class="sl-btn-main" style="background:#FF3B30; color:#fff; margin-bottom:10px;" onclick="SleepPage.deleteEntry('${dateStr}')">Удалить</button>
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
        if (confirm("Удалить запись за этот день?")) {
            delete this.state.history[dateStr];
            this.saveData();
            document.querySelector('.sl-modal').remove();
            this.render();
        }
    }
};

window.SleepPage = SleepPage;
export function render() { SleepPage.init(); }
