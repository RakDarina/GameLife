/* ==========================================
   МОДУЛЬ: ВЕС И ТРЕНИРОВКИ (weight.js)
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
        const saved = localStorage.getItem('GL_Weight_App_V2');
        if (saved) this.state.data = JSON.parse(saved);
    },

    saveData: function() {
        localStorage.setItem('GL_Weight_App_V2', JSON.stringify(this.state.data));
    },

    // Логика стадий персонажа
    getCharacterStage: function() {
        const dates = Object.keys(this.state.data).sort().reverse();
        let lastW = 70;
        for (let d of dates) { if (this.state.data[d].weight) { lastW = this.state.data[d].weight; break; } }
        if (lastW <= 60) return 1;
        if (lastW >= 70) return 6;
        if (lastW <= 62) return 2;
        if (lastW <= 65) return 3;
        if (lastW <= 67) return 4;
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
                .wa-container { padding-bottom: 80px; animation: fadeIn 0.3s; font-family: sans-serif; }
                .wa-header { padding: 10px; color: #6c5ce7; font-weight: 700; cursor: pointer; }
                .wa-char-box { text-align: center; margin-bottom: 20px; }
                .wa-char-img { height: 160px; object-fit: contain; }
                
                .wa-calendar { background: #fff; border-radius: 20px; padding: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px; }
                .wa-cal-nav { display: flex; justify-content: space-between; margin-bottom: 15px; font-weight: bold; text-transform: capitalize; }
                .wa-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
                .wa-day { 
                    aspect-ratio: 1; border-radius: 10px; display: flex; flex-direction: column; 
                    align-items: center; justify-content: center; font-size: 14px; position: relative; 
                    background: #f9f9f9; cursor: pointer;
                }
                .wa-day.has-workout { background: #e3f9e5; color: #2e7d32; border: 1px solid #badc58; }
                .wa-day.has-fastfood { background: #fff0f0; color: #c0392b; border: 1px solid #ff7979; }
                .wa-day.has-both { background: #fff8e1; border: 1px solid #ffcc80; }
                
                .wa-bottom-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 0 10px; }
                .wa-btn { border: none; padding: 15px; border-radius: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
                .btn-measure { background: #7ed6df; color: #013846; }
                .btn-history { background: #dff9fb; color: #333; }

                .wa-modal-bg { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000; display:flex; align-items:center; justify-content:center; }
                .wa-modal { background:#fff; padding:20px; border-radius:20px; width:85%; max-height:80vh; overflow-y:auto; }
                .wa-input { width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:10px; }
                .wa-choice-btn { width:100%; padding:12px; margin:5px 0; border-radius:12px; border:none; font-weight:600; cursor:pointer; }
            </style>
        `;

        app.innerHTML = `
            ${styles}
            <div class="wa-container">
                <div class="wa-header" onclick="loadModule('./health.js')">‹ Назад</div>
                
                <div class="wa-char-box">
                    <img src="./stage${stage}.png" class="wa-char-img">
                </div>

                <div class="wa-calendar">
                    <div class="wa-cal-nav">
                        <span onclick="WeightApp.changeMonth(-1)">‹</span>
                        <span>${monthName}</span>
                        <span onclick="WeightApp.changeMonth(1)">›</span>
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
                <div style="font-size:8px; position:absolute; bottom:2px;">
                    ${e.workout ? '💪' : ''}${e.fastfood ? '🍔' : ''}
                </div>
                ${e.weight ? '<div style="position:absolute; top:2px; right:2px; font-size:8px;">●</div>' : ''}
            </div>`;
        }
        return html;
    },

    // --- МЕНЮ ДНЯ (При нажатии на дату) ---
    openDayMenu: function(dateStr) {
        const html = `
            <h3 style="margin-top:0; text-align:center;">${dateStr}</h3>
            <button class="wa-choice-btn" style="background:#e3f9e5;" onclick="WeightApp.openActionChoice('${dateStr}', 'workout')">💪 Тренировка</button>
            <button class="wa-choice-btn" style="background:#fff0f0;" onclick="WeightApp.openActionChoice('${dateStr}', 'fastfood')">🍔 Фастфуд</button>
            <button class="wa-choice-btn" style="background:#eee;" onclick="WeightApp.closeModal()">Отмена</button>
        `;
        this.showModal(html);
    },

    openActionChoice: function(dateStr, type) {
        const title = type === 'workout' ? 'Тренировка' : 'Фастфуд';
        const html = `
            <h3 style="margin-top:0; text-align:center;">${title}</h3>
            <button class="wa-choice-btn" style="background:#badc58;" onclick="WeightApp.updateHabit('${dateStr}', '${type}', true)">Добавить</button>
            <button class="wa-choice-btn" style="background:#ff7979; color:#fff;" onclick="WeightApp.updateHabit('${dateStr}', '${type}', false)">Убрать</button>
            <button class="wa-choice-btn" style="background:#eee;" onclick="WeightApp.closeModal()">Назад</button>
        `;
        this.showModal(html);
    },

    updateHabit: function(dateStr, type, val) {
        if (!this.state.data[dateStr]) this.state.data[dateStr] = {};
        this.state.data[dateStr][type] = val;
        this.saveData();
        this.closeModal();
        this.render();
    },

    // --- ИЗМЕРЕНИЯ ---
    openMeasureModal: function(editDate = null) {
        const today = editDate || new Date().toISOString().split('T')[0];
        const e = this.state.data[today] || {};
        
        const html = `
            <h3 style="margin-top:0">${editDate ? 'Редактировать' : 'Новый замер'}</h3>
            <input type="date" id="m-date" class="wa-input" value="${today}" ${editDate ? 'disabled' : ''}>
            <input type="number" id="m-w" class="wa-input" placeholder="Вес (кг)" value="${e.weight || ''}">
            <input type="number" id="m-f" class="wa-input" placeholder="Жир (%)" value="${e.fat || ''}">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <input type="number" id="m-p" class="wa-input" placeholder="Белок" value="${e.prot || ''}">
                <input type="number" id="m-wa" class="wa-input" placeholder="Вода" value="${e.water || ''}">
            </div>
            <p style="font-size:12px; margin:10px 0 5px;">Объемы (см):</p>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px;">
                <input type="number" id="m-t" class="wa-input" placeholder="Талия" value="${e.waist || ''}">
                <input type="number" id="m-g" class="wa-input" placeholder="Грудь" value="${e.chest || ''}">
                <input type="number" id="m-b" class="wa-input" placeholder="Бедра" value="${e.hips || ''}">
            </div>
            <button class="wa-choice-btn" style="background:#7ed6df;" onclick="WeightApp.submitMeasure()">Сохранить</button>
            <button class="wa-choice-btn" style="background:#eee;" onclick="WeightApp.closeModal()">Отмена</button>
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

        this.saveData();
        this.closeModal();
        this.render();
    },

    // --- ИСТОРИЯ (Только замеры) ---
    openHistoryModal: function() {
        const dates = Object.keys(this.state.data).filter(d => this.state.data[d].weight).sort().reverse();
        let items = dates.map(d => {
            const e = this.state.data[d];
            return `
                <div style="border-bottom:1px solid #eee; padding:10px 0; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-weight:700; font-size:13px;">${d}</div>
                        <div style="font-size:12px; color:#666;">Вес: ${e.weight} кг | Талия: ${e.waist || '--'}</div>
                    </div>
                    <div>
                        <button onclick="WeightApp.openMeasureModal('${d}')" style="border:none; background:none; color:blue; margin-right:10px;">✎</button>
                        <button onclick="WeightApp.deleteEntry('${d}')" style="border:none; background:none; color:red;">🗑</button>
                    </div>
                </div>
            `;
        }).join('');

        const html = `
            <h3 style="margin-top:0">История замеров</h3>
            <div style="max-height:50vh; overflow-y:auto;">${items || 'Записей нет'}</div>
            <button class="wa-choice-btn" style="background:#eee; margin-top:15px;" onclick="WeightApp.closeModal()">Закрыть</button>
        `;
        this.showModal(html);
    },

    deleteEntry: function(d) {
        if(confirm('Удалить замер за ' + d + '?')) {
            // Удаляем только данные замера, оставляя привычки, если они есть
            this.state.data[d].weight = null;
            this.state.data[d].fat = null;
            // ... (можно очистить всё, если хочешь)
            this.saveData();
            this.openHistoryModal(); // Обновить список
            this.render();
        }
    },

    // Вспомогательные
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
