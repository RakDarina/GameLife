/* ==========================================
   МОДУЛЬ: ВЕС И ТРЕНИРОВКИ V4 (weight.js)
   ========================================== */

const WeightApp = {
    state: {
        currentMonth: new Date(),
        data: {} 
    },

    init: function() {
        this.loadData();
        this.render();
    },

    loadData: function() {
        const saved = localStorage.getItem('GL_Weight_App_V4');
        if (saved) this.state.data = JSON.parse(saved);
    },

    saveData: function() {
        localStorage.setItem('GL_Weight_App_V4', JSON.stringify(this.state.data));
    },

    getCharacterStage: function() {
        const dates = Object.keys(this.state.data).sort().reverse();
        let lastW = 70; 
        for (let d of dates) { if (this.state.data[d] && this.state.data[d].weight) { lastW = this.state.data[d].weight; break; } }
        if (lastW <= 60) return 1;
        if (lastW >= 70) return 6;
        if (lastW <= 62) return 2;
        if (lastW <= 64) return 3;
        if (lastW <= 66) return 4;
        return 5;
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const stage = this.getCharacterStage();
        const year = this.state.currentMonth.getFullYear();
        const month = this.state.currentMonth.getMonth();
        const monthName = this.state.currentMonth.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

        const styles = `
            <style>
                .wa-container { padding-bottom: 40px; animation: fadeIn 0.3s; font-family: sans-serif; max-width: 500px; margin: 0 auto; }
                .wa-header { padding: 15px; color: #6c5ce7; font-weight: 700; cursor: pointer; }
                
                .wa-char-box { text-align: center; margin: 10px 0; height: 320px; display: flex; align-items: center; justify-content: center; }
                .wa-char-img { height: 300px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.15)); }
                
                .wa-calendar { background: #fff; border-radius: 25px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin: 0 15px 20px 15px; }
                .wa-cal-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-weight: 800; text-transform: capitalize; }
                .wa-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
                .wa-day { aspect-ratio: 1; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 14px; position: relative; background: #f7f8fa; cursor: pointer; font-weight: 600; }
                .wa-day.has-workout { background: #e3f9e5; color: #2ecc71; box-shadow: inset 0 0 0 1.5px #2ecc71; }
                .wa-day.has-fastfood { background: #fff0f0; color: #e74c3c; box-shadow: inset 0 0 0 1.5px #e74c3c; }
                .wa-day.has-both { background: #fff9e6; color: #f39c12; box-shadow: inset 0 0 0 1.5px #f39c12; }
                
                .wa-bottom-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 0 15px; }
                .wa-btn { border: none; padding: 18px; border-radius: 20px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 15px; }
                .btn-measure { background: #6c5ce7; color: #fff; }
                .btn-history { background: #f1f2f6; color: #2d3436; }

                /* ИСПРАВЛЕННЫЙ ДИЗАЙН ФОРМЫ ЗАМЕРА */
                .wa-modal-bg { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:2000; display:flex; align-items:center; justify-content:center; backdrop-filter: blur(4px); }
                .wa-modal { background:#fff; padding:25px; border-radius:30px; width:90%; max-width:380px; box-sizing: border-box; overflow-y: auto; max-height: 90vh; }
                
                .wa-field { margin-bottom: 12px; width: 100%; box-sizing: border-box; }
                .wa-label { font-size: 11px; font-weight: 800; color: #b2bec3; text-transform: uppercase; margin-bottom: 4px; display: block; margin-left: 4px; }
                .wa-input { 
                    width: 100%; padding: 12px 15px; box-sizing: border-box; 
                    border: 2px solid #f1f2f6; border-radius: 14px; font-size: 16px; 
                    background: #f9f9fb; outline: none; transition: 0.2s;
                    font-family: inherit;
                }
                .wa-input:focus { border-color: #6c5ce7; background: #fff; }
                
                .wa-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; box-sizing: border-box; }
                .wa-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; width: 100%; box-sizing: border-box; }
                
                .wa-choice-btn { width:100%; padding:16px; margin:8px 0; border-radius:18px; border:none; font-weight:700; cursor:pointer; font-size: 16px; }
            </style>
        `;

        app.innerHTML = `
            ${styles}
            <div class="wa-container">
                <div class="wa-header" onclick="loadModule('./health.js')">‹ Назад</div>
                <div class="wa-char-box"><img src="./stage${stage}.png" class="wa-char-img"></div>
                <div class="wa-calendar">
                    <div class="wa-cal-nav">
                        <div onclick="WeightApp.changeMonth(-1)" style="padding:10px">❮</div>
                        <div>${monthName}</div>
                        <div onclick="WeightApp.changeMonth(1)" style="padding:10px">❯</div>
                    </div>
                    <div class="wa-cal-grid">${this.renderDays(year, month)}</div>
                </div>
                <div class="wa-bottom-btns">
                    <button class="wa-btn btn-measure" onclick="WeightApp.openMeasureModal()">⚖️ Измерить</button>
                    <button class="wa-btn btn-history" onclick="WeightApp.openHistoryModal()">📜 История</button>
                </div>
            </div>
        `;
    },

    renderDays: function(y, m) {
        const first = new Date(y, m, 1).getDay() || 7;
        const total = new Date(y, m + 1, 0).getDate();
        let html = '';
        for (let i = 1; i < first; i++) html += '<div></div>';
        for (let d = 1; d <= total; d++) {
            const dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const e = this.state.data[dateStr] || {};
            let cls = 'wa-day';
            if (e.workout && e.fastfood) cls += ' has-both';
            else if (e.workout) cls += ' has-workout';
            else if (e.fastfood) cls += ' has-fastfood';

            html += `<div class="${cls}" onclick="WeightApp.openDayMenu('${dateStr}')">
                ${d}
                <div style="font-size:9px; position:absolute; bottom:3px;">${e.workout ? '💪' : ''}${e.fastfood ? '🍔' : ''}</div>
                ${e.weight ? '<div style="position:absolute; top:4px; right:4px; width:4px; height:4px; background:#6c5ce7; border-radius:50%;"></div>' : ''}
            </div>`;
        }
        return html;
    },

    openDayMenu: function(dateStr) {
        const e = this.state.data[dateStr] || {};
        const html = `
            <h3 style="margin-top:0; text-align:center;">${dateStr}</h3>
            <button class="wa-choice-btn" style="background:${e.workout ? '#badc58' : '#f1f2f6'}; color:${e.workout ? '#fff' : '#2d3436'};" 
                onclick="WeightApp.toggleHabit('${dateStr}', 'workout')">💪 Тренировка</button>
            <button class="wa-choice-btn" style="background:${e.fastfood ? '#ff7979' : '#f1f2f6'}; color:${e.fastfood ? '#fff' : '#2d3436'};" 
                onclick="WeightApp.toggleHabit('${dateStr}', 'fastfood')">🍔 Фастфуд</button>
            <button class="wa-choice-btn" style="background:#eee; margin-top:10px;" onclick="WeightApp.closeModal()">Закрыть</button>
        `;
        this.showModal(html);
    },

    toggleHabit: function(dateStr, type) {
        if (!this.state.data[dateStr]) this.state.data[dateStr] = {};
        this.state.data[dateStr][type] = !this.state.data[dateStr][type];
        this.saveData(); this.closeModal(); this.render();
    },

    // --- ОБНОВЛЕННАЯ ФОРМА ИЗМЕРЕНИЯ ---
    openMeasureModal: function(editDate = null) {
        const today = editDate || new Date().toISOString().split('T')[0];
        const e = this.state.data[today] || {};
        
        const html = `
            <h3 style="margin:0 0 15px 0; text-align:center;">${editDate ? 'Изменить замер' : 'Замер тела'}</h3>
            
            <div class="wa-field">
                <label class="wa-label">Дата замера</label>
                <input type="date" id="m-date" class="wa-input" value="${today}" ${editDate ? 'disabled' : ''}>
            </div>

            <div class="wa-row">
                <div class="wa-field"><label class="wa-label">Вес (кг)</label><input type="number" step="0.1" id="m-w" class="wa-input" placeholder="0.0" value="${e.weight || ''}"></div>
                <div class="wa-field"><label class="wa-label">Жир (%)</label><input type="number" id="m-f" class="wa-input" placeholder="%" value="${e.fat || ''}"></div>
            </div>

            <div class="wa-row">
                <div class="wa-field"><label class="wa-label">Белок</label><input type="number" id="m-p" class="wa-input" value="${e.prot || ''}"></div>
                <div class="wa-field"><label class="wa-label">Вода</label><input type="number" id="m-wa" class="wa-input" value="${e.water || ''}"></div>
            </div>

            <label class="wa-label">Объемы тела (см)</label>
            <div class="wa-row-3">
                <div class="wa-field"><input type="number" id="m-t" class="wa-input" placeholder="Талия" value="${e.waist || ''}"></div>
                <div class="wa-field"><input type="number" id="m-g" class="wa-input" placeholder="Грудь" value="${e.chest || ''}"></div>
                <div class="wa-field"><input type="number" id="m-b" class="wa-input" placeholder="Бедра" value="${e.hips || ''}"></div>
            </div>

            <button class="wa-choice-btn" style="background:#6c5ce7; color:#fff; margin-top:10px;" onclick="WeightApp.submitMeasure()">Сохранить замер</button>
            <button class="wa-choice-btn" style="background:#f1f2f6; color:#2d3436;" onclick="WeightApp.closeModal()">Отмена</button>
        `;
        this.showModal(html);
    },

    submitMeasure: function() {
        const date = document.getElementById('m-date').value;
        if (!this.state.data[date]) this.state.data[date] = {};
        this.state.data[date].weight = parseFloat(document.getElementById('m-w').value) || null;
        this.state.data[date].fat = parseFloat(document.getElementById('m-f').value) || null;
        this.state.data[date].prot = parseFloat(document.getElementById('m-p').value) || null;
        this.state.data[date].water = parseFloat(document.getElementById('m-wa').value) || null;
        this.state.data[date].waist = parseFloat(document.getElementById('m-t').value) || null;
        this.state.data[date].chest = parseFloat(document.getElementById('m-g').value) || null;
        this.state.data[date].hips = parseFloat(document.getElementById('m-b').value) || null;
        this.saveData(); this.closeModal(); this.render();
    },

    openHistoryModal: function() {
        const dates = Object.keys(this.state.data).filter(d => this.state.data[d].weight).sort().reverse();
        let items = dates.map(d => {
            const e = this.state.data[d];
            return `
                <div style="border-bottom:2px solid #f1f2f6; padding:12px 0; display:flex; justify-content:space-between; align-items:center;">
                    <div><div style="font-weight:800; font-size:13px;">${d}</div><div style="font-size:12px; color:#636e72;">${e.weight} кг | Талия: ${e.waist || '--'}</div></div>
                    <div style="display:flex; gap:8px;">
                        <button onclick="WeightApp.openMeasureModal('${d}')" style="border:none; background:#f1f2f6; padding:8px; border-radius:10px;">✎</button>
                        <button onclick="WeightApp.deleteEntry('${d}')" style="border:none; background:#fff0f0; padding:8px; border-radius:10px; color:#e74c3c;">🗑</button>
                    </div>
                </div>`;
        }).join('');
        this.showModal(`<h3 style="margin-top:0; text-align:center;">История</h3><div style="max-height:50vh; overflow-y:auto;">${items || 'Нет записей'}</div><button class="wa-choice-btn" style="background:#eee; margin-top:15px;" onclick="WeightApp.closeModal()">Закрыть</button>`);
    },

    deleteEntry: function(d) { if(confirm('Удалить замер за ' + d + '?')) { this.state.data[d].weight = null; this.saveData(); this.openHistoryModal(); this.render(); } },
    changeMonth: function(n) { this.state.currentMonth.setMonth(this.state.currentMonth.getMonth() + n); this.render(); },
    showModal: function(c) { this.closeModal(); const b = document.createElement('div'); b.className = 'wa-modal-bg'; b.innerHTML = `<div class="wa-modal">${c}</div>`; document.body.appendChild(b); },
    closeModal: function() { const m = document.querySelector('.wa-modal-bg'); if(m) m.remove(); }
};

window.WeightApp = WeightApp;
export function render() { WeightApp.init(); }
