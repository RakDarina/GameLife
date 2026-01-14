/* ==========================================
   МОДУЛЬ: ВЕС И ТРЕНИРОВКИ V3 (weight.js)
   ========================================== */

const WeightApp = {
    state: {
        currentMonth: new Date(),
        data: {} // { "2026-02-14": { weight: 65, workout: true, fastfood: false, ... } }
    },

    init: function() {
        this.loadData();
        this.render();
    },

    loadData: function() {
        const saved = localStorage.getItem('GL_Weight_App_V3');
        if (saved) this.state.data = JSON.parse(saved);
    },

    saveData: function() {
        localStorage.setItem('GL_Weight_App_V3', JSON.stringify(this.state.data));
    },

    // Определение стадии персонажа (от 60 до 70+ кг)
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

    // --- РЕНДЕРИНГ ---
    render: function() {
        const app = document.getElementById('app-viewport');
        const stage = this.getCharacterStage();
        const year = this.state.currentMonth.getFullYear();
        const month = this.state.currentMonth.getMonth();
        const monthName = this.state.currentMonth.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

        const styles = `
            <style>
                .wa-container { padding-bottom: 40px; animation: fadeIn 0.3s; font-family: sans-serif; max-width: 500px; margin: 0 auto; }
                .wa-header { padding: 15px; color: #6c5ce7; font-weight: 700; cursor: pointer; display: flex; align-items: center; }
                
                /* Персонаж в 3 раза больше */
                .wa-char-box { text-align: center; margin: 20px 0; overflow: visible; height: 320px; display: flex; align-items: center; justify-content: center; }
                .wa-char-img { height: 300px; width: auto; object-fit: contain; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.15)); transition: 0.3s; }
                
                .wa-calendar { background: #fff; border-radius: 25px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin: 0 15px 20px 15px; }
                .wa-cal-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-weight: 800; text-transform: capitalize; color: #2d3436; }
                .wa-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
                .wa-day { 
                    aspect-ratio: 1; border-radius: 12px; display: flex; flex-direction: column; 
                    align-items: center; justify-content: center; font-size: 14px; position: relative; 
                    background: #f7f8fa; cursor: pointer; font-weight: 600;
                }
                .wa-day.has-workout { background: #e3f9e5; color: #2ecc71; box-shadow: inset 0 0 0 1.5px #2ecc71; }
                .wa-day.has-fastfood { background: #fff0f0; color: #e74c3c; box-shadow: inset 0 0 0 1.5px #e74c3c; }
                .wa-day.has-both { background: #fff9e6; color: #f39c12; box-shadow: inset 0 0 0 1.5px #f39c12; }
                
                .wa-bottom-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 0 15px; }
                .wa-btn { border: none; padding: 18px; border-radius: 20px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 15px; }
                .btn-measure { background: #6c5ce7; color: #fff; box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3); }
                .btn-history { background: #f1f2f6; color: #2d3436; }

                /* Исправленные инпуты */
                .wa-modal-bg { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:2000; display:flex; align-items:center; justify-content:center; backdrop-filter: blur(4px); }
                .wa-modal { background:#fff; padding:25px; border-radius:30px; width:90%; max-width:400px; box-sizing: border-box; }
                .wa-input-group { margin-bottom: 15px; }
                .wa-label { font-size: 12px; font-weight: 700; color: #a0a0a0; margin-left: 5px; margin-bottom: 5px; display: block; }
                .wa-input { width:100%; padding:14px; box-sizing: border-box; border:2px solid #f1f2f6; border-radius:15px; font-size:16px; outline: none; transition: 0.2s; background: #f9f9fb; }
                .wa-input:focus { border-color: #6c5ce7; background: #fff; }
                .wa-choice-btn { width:100%; padding:16px; margin:8px 0; border-radius:18px; border:none; font-weight:700; cursor:pointer; font-size: 16px; transition: 0.2s; }
                .wa-choice-btn:active { transform: scale(0.96); }
            </style>
        `;

        app.innerHTML = `
            ${styles}
            <div class="wa-container">
                <div class="wa-header" onclick="loadModule('./health.js')">‹ Здоровье</div>
                
                <div class="wa-char-box">
                    <img src="./stage${stage}.png" class="wa-char-img">
                </div>

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
                <div style="font-size:9px; position:absolute; bottom:3px; display:flex; gap:1px;">
                    ${e.workout ? '💪' : ''}${e.fastfood ? '🍔' : ''}
                </div>
                ${e.weight ? '<div style="position:absolute; top:4px; right:4px; width:4px; height:4px; background:#6c5ce7; border-radius:50%;"></div>' : ''}
            </div>`;
        }
        return html;
    },

    // --- МЕНЮ ДНЯ ---
    openDayMenu: function(dateStr) {
        const e = this.state.data[dateStr] || {};
        const html = `
            <h3 style="margin-top:0; text-align:center; color:#2d3436;">${dateStr}</h3>
            <button class="wa-choice-btn" style="background:${e.workout ? '#badc58' : '#f1f2f6'}; color:${e.workout ? '#fff' : '#2d3436'};" 
                onclick="WeightApp.toggleHabit('${dateStr}', 'workout')">
                💪 Тренировка: ${e.workout ? 'УДАЛИТЬ' : 'ДОБАВИТЬ'}
            </button>
            <button class="wa-choice-btn" style="background:${e.fastfood ? '#ff7979' : '#f1f2f6'}; color:${e.fastfood ? '#fff' : '#2d3436'};" 
                onclick="WeightApp.toggleHabit('${dateStr}', 'fastfood')">
                🍔 Фастфуд: ${e.fastfood ? 'УДАЛИТЬ' : 'ДОБАВИТЬ'}
            </button>
            <button class="wa-choice-btn" style="background:#eee; margin-top:10px;" onclick="WeightApp.closeModal()">Закрыть</button>
        `;
        this.showModal(html);
    },

    toggleHabit: function(dateStr, type) {
        if (!this.state.data[dateStr]) this.state.data[dateStr] = {};
        this.state.data[dateStr][type] = !this.state.data[dateStr][type];
        this.saveData();
        this.closeModal();
        this.render();
    },

    // --- ИЗМЕРЕНИЯ ---
    openMeasureModal: function(editDate = null) {
        const today = editDate || new Date().toISOString().split('T')[0];
        const e = this.state.data[today] || {};
        
        const html = `
            <h3 style="margin:0 0 20px 0; text-align:center;">${editDate ? 'Изменить замер' : 'Новый замер'}</h3>
            
            <div class="wa-input-group">
                <span class="wa-label">Дата замера</span>
                <input type="date" id="m-date" class="wa-input" value="${today}" ${editDate ? 'disabled' : ''}>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                <div class="wa-input-group"><span class="wa-label">Вес (кг)</span><input type="number" step="0.1" id="m-w" class="wa-input" placeholder="0.0" value="${e.weight || ''}"></div>
                <div class="wa-input-group"><span class="wa-label">Жир (%)</span><input type="number" id="m-f" class="wa-input" placeholder="%" value="${e.fat || ''}"></div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                <div class="wa-input-group"><span class="wa-label">Белок</span><input type="number" id="m-p" class="wa-input" value="${e.prot || ''}"></div>
                <div class="wa-input-group"><span class="wa-label">Вода</span><input type="number" id="m-wa" class="wa-input" value="${e.water || ''}"></div>
            </div>

            <span class="wa-label">Объемы (см)</span>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:20px;">
                <input type="number" id="m-t" class="wa-input" placeholder="Талия" value="${e.waist || ''}">
                <input type="number" id="m-g" class="wa-input" placeholder="Грудь" value="${e.chest || ''}">
                <input type="number" id="m-b" class="wa-input" placeholder="Бедра" value="${e.hips || ''}">
            </div>

            <button class="wa-choice-btn" style="background:#6c5ce7; color:#fff;" onclick="WeightApp.submitMeasure()">Сохранить замер</button>
            <button class="wa-choice-btn" style="background:#eee;" onclick="WeightApp.closeModal()">Отмена</button>
        `;
        this.showModal(html);
    },

    submitMeasure: function() {
        const date = document.getElementById('m-date').value;
        if (!this.state.data[date]) this.state.data[date] = {};
        
        const weight = parseFloat(document.getElementById('m-w').value);
        this.state.data[date].weight = weight || null;
        this.state.data[date].fat = parseFloat(document.getElementById('m-f').value) || null;
        this.state.data[date].prot = parseFloat(document.getElementById('m-p').value) || null;
        this.state.data[date].water = parseFloat(document.getElementById('m-wa').value) || null;
        this.state.data[date].waist = parseFloat(document.getElementById('m-t').value) || null;
        this.state.data[date].chest = parseFloat(document.getElementById('m-g').value) || null;
        this.state.data[date].hips = parseFloat(document.getElementById('m-b').value) || null;

        this.saveData();
        this.closeModal();
        this.render();
    },

    // --- ИСТОРИЯ ---
    openHistoryModal: function() {
        const dates = Object.keys(this.state.data).filter(d => this.state.data[d].weight).sort().reverse();
        let items = dates.map(d => {
            const e = this.state.data[d];
            return `
                <div style="border-bottom:2px solid #f1f2f6; padding:15px 0; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-weight:800; font-size:14px; color:#2d3436;">${d}</div>
                        <div style="font-size:13px; color:#636e72;">Вес: <b>${e.weight} кг</b> | Талия: ${e.waist || '--'}</div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button onclick="WeightApp.openMeasureModal('${d}')" style="border:none; background:#f1f2f6; padding:8px; border-radius:10px; cursor:pointer;">✎</button>
                        <button onclick="WeightApp.deleteEntry('${d}')" style="border:none; background:#fff0f0; padding:8px; border-radius:10px; color:#e74c3c; cursor:pointer;">🗑</button>
                    </div>
                </div>
            `;
        }).join('');

        const html = `
            <h3 style="margin-top:0; text-align:center;">История замеров</h3>
            <div style="max-height:55vh; overflow-y:auto; padding-right:5px;">${items || '<p style="text-align:center; color:#ccc;">Пока нет замеров веса</p>'}</div>
            <button class="wa-choice-btn" style="background:#eee; margin-top:20px;" onclick="WeightApp.closeModal()">Закрыть</button>
        `;
        this.showModal(html);
    },

    deleteEntry: function(d) {
        if(confirm('Удалить данные веса за ' + d + '?')) {
            this.state.data[d].weight = null; 
            this.saveData();
            this.openHistoryModal();
            this.render();
        }
    },

    // Вспомогательные функции
    changeMonth: function(n) { this.state.currentMonth.setMonth(this.state.currentMonth.getMonth() + n); this.render(); },
    showModal: function(c) {
        this.closeModal();
        const b = document.createElement('div'); b.className = 'wa-modal-bg';
        b.innerHTML = `<div class="wa-modal">${c}</div>`;
        document.body.appendChild(b);
    },
    closeModal: function() { const m = document.querySelector('.wa-modal-bg'); if(m) m.remove(); }
};

window.WeightApp = WeightApp;
export function render() { WeightApp.init(); }
