/* ==========================================
   МОДУЛЬ: СОН (sleep.js) — WITH NAVIGATION
   ========================================== */

const SleepPage = {
    state: {
        history: {}, 
        view: 'main', 
        statsTab: 'week', // week, month
        currentOffset: 0  // 0 - текущий период, 1 - прошлый, 2 - позапрошлый и т.д.
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
        return parseFloat(((endDate - startDate) / (1000 * 60 * 60)).toFixed(1));
    },

    getColor: function(hours) {
        if (hours === 0) return '#F2F2F7'; 
        if (hours >= 8) return '#34C759'; 
        if (hours >= 6.5) return '#FFCC00'; 
        return '#FF3B30'; 
    },

    changeOffset: function(delta) {
        this.state.currentOffset += delta;
        if (this.state.currentOffset < 0) this.state.currentOffset = 0;
        this.render();
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        
        const styles = `
            <style>
                .sl-container { animation: fadeIn 0.3s; color: #1C1C1E; max-width: 100%; box-sizing: border-box; }
                .sl-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; }
                
                .sl-card { background: #fff; border-radius: 20px; padding: 15px; margin-bottom: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .sl-label { font-size: 13px; color: #8E8E93; margin-bottom: 6px; display: block; }
                .sl-input { width: 100%; padding: 12px; border: 1px solid #E5E5EA; border-radius: 12px; font-size: 16px; margin-bottom: 12px; box-sizing: border-box; }
                
                .sl-btn-main { width: 100%; padding: 16px; border-radius: 16px; border: none; font-weight: 700; font-size: 16px; cursor: pointer; }
                .sl-btn-primary { background: #5856D6; color: #fff; }
                
                .sl-tabs { display: flex; background: #F2F2F7; padding: 2px; border-radius: 12px; margin-bottom: 15px; }
                .sl-tab { flex: 1; text-align: center; padding: 8px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; color: #8E8E93; }
                .sl-tab.active { background: #fff; color: #000; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                
                /* НАВИГАЦИЯ ПЕРИОДА */
                .sl-nav-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 0 5px; }
                .sl-nav-btn { width: 32px; height: 32px; border-radius: 50%; background: #F2F2F7; display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: pointer; }
                .sl-nav-title { font-weight: 700; font-size: 15px; }

                .sl-chart-area { 
                    display: flex; 
                    align-items: flex-end; 
                    justify-content: space-between; 
                    height: 180px; 
                    padding: 10px 0; 
                    gap: 4px;
                }
                .sl-bar-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; position: relative; }
                .sl-bar { width: 80%; border-radius: 3px 3px 0 0; min-height: 2px; transition: height 0.3s ease; }
                .sl-bar-val { font-size: 8px; font-weight: 700; margin-bottom: 2px; height: 10px; }
                .sl-bar-label { font-size: 9px; color: #AEAEB2; margin-top: 6px; }

                .sl-legend { display: flex; justify-content: center; gap: 12px; margin-top: 15px; font-size: 10px; color: #8E8E93; padding-top: 10px; border-top: 1px solid #F2F2F7; }
                .sl-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; margin-right: 3px; }

                .sl-modal { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.4); backdrop-filter: blur(4px); display:flex; align-items:center; justify-content:center; z-index:2000; }
                .sl-modal-content { background:#fff; padding:25px; border-radius:28px; width:85%; max-width: 320px; }
            </style>
        `;

        if (this.state.view === 'main') {
            app.innerHTML = `${styles}
            <div class="sl-container">
                <div class="sl-header">
                    <span onclick="loadModule('./health.js')" style="color:#5856D6; font-weight:600;">‹ Назад</span>
                    <span onclick="SleepPage.state.view='stats'; SleepPage.state.currentOffset=0; SleepPage.render()" style="font-size:24px;">📊</span>
                </div>
                <h2 style="font-weight:800; font-size:28px; margin-bottom:20px;">Запись сна</h2>
                <div class="sl-card">
                    <label class="sl-label">Дата</label>
                    <input type="date" id="sl-date" class="sl-input" value="${new Date().toISOString().split('T')[0]}">
                    <div style="display:flex; gap:10px;">
                        <div style="flex:1"><label class="sl-label">Уснула</label><input type="time" id="sl-start" class="sl-input" value="23:00"></div>
                        <div style="flex:1"><label class="sl-label">Проснулась</label><input type="time" id="sl-end" class="sl-input" value="08:00"></div>
                    </div>
                    <button class="sl-btn-main sl-btn-primary" onclick="SleepPage.addEntry()">Сохранить</button>
                </div>
            </div>`;
        } else {
            const periodTitle = this.getPeriodTitle();
            app.innerHTML = `${styles}
            <div class="sl-container">
                <div class="sl-header">
                    <span onclick="SleepPage.state.view='main'; SleepPage.render()" style="color:#5856D6; font-weight:600;">‹ Добавить</span>
                </div>
                <div class="sl-tabs">
                    <div class="sl-tab ${this.state.statsTab === 'week' ? 'active' : ''}" onclick="SleepPage.state.statsTab='week'; SleepPage.state.currentOffset=0; SleepPage.render()">НЕДЕЛЯ</div>
                    <div class="sl-tab ${this.state.statsTab === 'month' ? 'active' : ''}" onclick="SleepPage.state.statsTab='month'; SleepPage.state.currentOffset=0; SleepPage.render()">МЕСЯЦ</div>
                </div>

                <div class="sl-nav-row">
                    <div class="sl-nav-btn" onclick="SleepPage.changeOffset(1)">‹</div>
                    <div class="sl-nav-title">${periodTitle}</div>
                    <div class="sl-nav-btn" onclick="SleepPage.changeOffset(-1)">›</div>
                </div>

                <div class="sl-card">
                    <div class="sl-chart-area">
                        ${this.renderChartBars()}
                    </div>
                    <div class="sl-legend">
                        <span><div class="sl-dot" style="background:#34C759"></div>8ч+</span>
                        <span><div class="sl-dot" style="background:#FFCC00"></div>6.5-8ч</span>
                        <span><div class="sl-dot" style="background:#FF3B30"></div><6.5ч</span>
                    </div>
                </div>
            </div>`;
        }
    },

    getPeriodTitle: function() {
        let d = new Date();
        if (this.state.statsTab === 'week') {
            let end = new Date();
            end.setDate(d.getDate() - (this.state.currentOffset * 7));
            let start = new Date();
            start.setDate(end.getDate() - 6);
            return `${start.getDate()} - ${end.getDate()} ${end.toLocaleString('default', {month: 'short'})}`;
        } else {
            d.setMonth(d.getMonth() - this.state.currentOffset);
            return d.toLocaleString('default', { month: 'long', year: 'numeric' });
        }
    },

    renderChartBars: function() {
        let bars = '';
        let isMonth = this.state.statsTab === 'month';
        let count = isMonth ? 30 : 7;
        
        for (let i = count - 1; i >= 0; i--) {
            let d = new Date();
            if (isMonth) {
                // Если месяц — листаем на 30 дней назад за каждый офсет
                d.setDate(d.getDate() - (this.state.currentOffset * 30) - i);
            } else {
                // Если неделя — листаем на 7 дней за каждый офсет
                d.setDate(d.getDate() - (this.state.currentOffset * 7) - i);
            }
            
            let ds = d.toLocaleDateString();
            let entry = this.state.history[ds] || { hours: 0 };
            let hPercent = Math.min((entry.hours / 10) * 100, 100); 
            
            let label = (count === 7) 
                ? d.toLocaleDateString('ru-RU', {weekday: 'short'}) 
                : (i % 5 === 0 ? d.getDate() : ''); // В месяце подписи только через каждые 5 дней

            bars += `
                <div class="sl-bar-wrapper" onclick="SleepPage.showEditModal('${ds}')">
                    <div class="sl-bar-val">${!isMonth && entry.hours > 0 ? entry.hours : ''}</div>
                    <div class="sl-bar" style="height:${hPercent}%; background:${this.getColor(entry.hours)}"></div>
                    <div class="sl-bar-label">${label}</div>
                </div>
            `;
        }
        return bars;
    },

    // Остальные функции (addEntry, showEditModal, updateEntry, deleteEntry) остаются такими же
    addEntry: function() {
        const start = document.getElementById('sl-start').value;
        const end = document.getElementById('sl-end').value;
        const rawDate = document.getElementById('sl-date').value;
        if (!start || !end || !rawDate) return;
        const dateFormatted = new Date(rawDate).toLocaleDateString();
        const hours = this.calculateDuration(start, end);
        this.state.history[dateFormatted] = { start, end, hours };
        this.saveData();
        this.state.view = 'stats';
        this.state.currentOffset = 0;
        this.render();
    },

    showEditModal: function(dateStr) {
        const entry = this.state.history[dateStr] || { start: "23:00", end: "08:00", hours: 0 };
        const modal = document.createElement('div');
        modal.className = 'sl-modal';
        modal.innerHTML = `
            <div class="sl-modal-content">
                <h3 style="margin-top:0; text-align:center;">${dateStr}</h3>
                <label class="sl-label">Уснула:</label>
                <input type="time" id="edit-sl-start" class="sl-input" value="${entry.start}">
                <label class="sl-label">Проснулась:</label>
                <input type="time" id="edit-sl-end" class="sl-input" value="${entry.end}">
                <button class="sl-btn-main sl-btn-primary" style="margin-bottom:10px;" onclick="SleepPage.updateEntry('${dateStr}')">Сохранить</button>
                <button class="sl-btn-main" style="background:#FF3B30; color:#fff; margin-bottom:10px;" onclick="SleepPage.deleteEntry('${dateStr}')">Удалить</button>
                <button class="sl-btn-main" style="background:#F2F2F7;" onclick="this.parentElement.parentElement.remove()">Отмена</button>
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
