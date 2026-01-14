/* ==========================================
   МОДУЛЬ: ДНЕВНИК КОЖИ (skin.js)
   ========================================== */

const SkinTracker = {
    data: JSON.parse(localStorage.getItem('GL_Skin_Data_v1')) || [],
    editingId: null,
    selectedHistoryDate: new Date().toISOString().split('T')[0],
    viewMode: 'today',
    currentCalMonth: new Date().getMonth(),
    currentCalYear: new Date().getFullYear(),

    init: function() {
        this.render();
    },

    save: function() {
        localStorage.setItem('GL_Skin_Data_v1', JSON.stringify(this.data));
        this.render();
    },

    // ... (функции addRecord, deleteRecord, submitForm, addText остаются прежними)
    addRecord: function() { this.editingId = 'new'; this.render(); },
    deleteRecord: function(id) { if (confirm('Удалить?')) { this.data = this.data.filter(r => r.id !== id); this.save(); } },
    
    submitForm: function() {
        const form = document.getElementById('sk-form');
        const damageVal = parseInt(document.querySelector('.sk-num.active')?.dataset.value || 0);
        const record = {
            id: this.editingId === 'new' ? Date.now() : this.editingId,
            date: form.sk_date.value,
            time: form.sk_time.value,
            place: form.sk_place.value,
            feeling_before: form.sk_before.value,
            feeling_after: form.sk_after.value,
            damage: damageVal,
            switch: form.sk_switch.value
        };
        if (this.editingId === 'new') this.data.unshift(record);
        else { const idx = this.data.findIndex(r => r.id == this.editingId); this.data[idx] = record; }
        this.editingId = null; this.save();
    },

    addText: function(fieldId, text) {
        const field = document.getElementsByName(fieldId)[0];
        if (field) {
            field.value = field.value.trim() ? field.value + ', ' + text : text;
            field.style.height = 'auto'; field.style.height = (field.scrollHeight) + 'px';
        }
    },

    getCleanDays: function() {
        const relapses = this.data.filter(r => parseInt(r.damage) > 0).sort((a,b) => new Date(b.date) - new Date(a.date));
        if (relapses.length === 0) return this.data.length > 0 ? "Все" : 0;
        const diff = new Date() - new Date(relapses[0].date);
        return Math.floor(diff / (1000 * 86400));
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const todayStr = new Date().toISOString().split('T')[0];
        const displayDate = this.viewMode === 'today' ? todayStr : this.selectedHistoryDate;
        const filteredRecords = this.data.filter(r => r.date === displayDate).sort((a, b) => b.time.localeCompare(a.time));

        // Статистика
        const allDays = [...new Set(this.data.filter(r => r.date <= todayStr).map(r => r.date))];
        const failDays = [...new Set(this.data.filter(r => r.date <= todayStr && parseInt(r.damage) > 0).map(r => r.date))];
        const successCount = Math.max(0, allDays.length - failDays.length);
        const failCount = failDays.length;
        const successPerc = (successCount + failCount) > 0 ? (successCount / (successCount + failCount)) * 100 : 0;

        const styles = `
            <style>
                .sk-container { animation: fadeIn 0.3s; padding: 0 20px 140px; margin: 0 -20px; width: calc(100% + 40px); box-sizing: border-box; }
                .sk-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
                .sk-clean-banner { background: linear-gradient(135deg, #34C759, #2ecc71); color: white; border-radius: 20px; padding: 20px; text-align: center; margin-bottom: 20px; }
                
                /* КАЛЕНДАРЬ */
                .sk-cal-card { background: white; border-radius: 25px; padding: 15px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
                .sk-cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-weight: 800; }
                .sk-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center; }
                .sk-cal-day-name { font-size: 10px; color: #8E8E93; padding-bottom: 5px; }
                .sk-cal-cell { position: relative; padding: 10px 0; font-size: 14px; font-weight: 600; border-radius: 10px; cursor: pointer; }
                .sk-cal-cell.active { background: #5856D6; color: white; }
                .sk-cal-cell.today { color: #5856D6; text-decoration: underline; }
                .sk-dot { width: 4px; height: 4px; background: #FF3B30; border-radius: 50%; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); }
                .sk-cal-cell.active .sk-dot { background: white; }

                .sk-chart-bar { height: 12px; background: #FF3B30; border-radius: 6px; overflow: hidden; display: flex; margin: 10px 0; }
                .sk-card { background: white; border-radius: 25px; padding: 20px; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
                .sk-damage-badge { background: #F2F2F7; padding: 4px 10px; border-radius: 10px; color: #FF3B30; font-weight: 700; font-size: 12px; }
                
                .sk-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 3000; display: flex; align-items: flex-end; }
                .sk-modal-content { background: #F8F9FB; width: 100%; max-height: 95vh; border-radius: 30px 30px 0 0; padding: 25px 20px; overflow-y: auto; box-sizing: border-box; }
                .sk-num-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
                .sk-num { background: #F2F2F7; padding: 10px 0; border-radius: 10px; text-align: center; font-weight: 700; }
                .sk-num.active { background: #FF3B30; color: white; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        // Генерация сетки календаря
        const renderCalendar = () => {
            const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
            const firstDay = new Date(this.currentCalYear, this.currentCalMonth, 1).getDay();
            const daysInMonth = new Date(this.currentCalYear, this.currentCalMonth + 1, 0).getDate();
            const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Начинаем с ПН

            let html = `
                <div class="sk-cal-header">
                    <span onclick="event.stopPropagation(); SkinTracker.changeMonth(-1)">◀</span>
                    <span>${months[this.currentCalMonth]} ${this.currentCalYear}</span>
                    <span onclick="event.stopPropagation(); SkinTracker.changeMonth(1)">▶</span>
                </div>
                <div class="sk-cal-grid">
                    ${['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'].map(d => `<div class="sk-cal-day-name">${d}</div>`).join('')}
            `;

            for (let i = 0; i < startOffset; i++) html += `<div></div>`;

            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = `${this.currentCalYear}-${String(this.currentCalMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                const hasDamage = failDays.includes(dateStr);
                const isActive = this.selectedHistoryDate === dateStr;
                const isToday = todayStr === dateStr;

                html += `
                    <div class="sk-cal-cell ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}" 
                         onclick="SkinTracker.selectedHistoryDate='${dateStr}'; SkinTracker.render()">
                        ${d}
                        ${hasDamage ? '<div class="sk-dot"></div>' : ''}
                    </div>
                `;
            }
            return html + `</div>`;
        };

        let recordsHTML = filteredRecords.map(r => `
            <div class="sk-card">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <span style="color:#8E8E93; font-size:13px;">${r.time}</span>
                    <span class="sk-damage-badge">Урон: ${r.damage}/10</span>
                </div>
                <div style="font-weight:700; margin-bottom:10px;">${r.place}</div>
                <div style="font-size:14px; line-height:1.4;">
                    <b>До:</b> ${r.feeling_before}<br>
                    <b>После:</b> ${r.feeling_after}<br>
                    <b style="color:#34C759">Переключилась:</b> ${r.switch}
                </div>
                <div style="margin-top:15px; display:flex; gap:20px; border-top:1px solid #F2F2F7; padding-top:10px;">
                     <span class="material-icons-outlined" style="font-size:18px; color:#8E8E93" onclick="SkinTracker.editingId='${r.id}'; SkinTracker.render()">edit</span>
                     <span class="material-icons-outlined" style="font-size:18px; color:#FF3B30" onclick="SkinTracker.deleteRecord(${r.id})">delete</span>
                </div>
            </div>
        `).join('');

        const currentEdit = this.editingId && this.editingId !== 'new' ? this.data.find(r => r.id == this.editingId) : null;
        
        app.innerHTML = `
            ${styles}
            <div class="sk-container">
                <div class="sk-header">
                    <span class="material-icons-outlined" style="color:#007AFF; cursor:pointer" onclick="loadModule('./mental.js')">chevron_left</span>
                    <div class="sk-title">${this.viewMode === 'today' ? 'Главная' : 'История'}</div>
                    <div class="sk-history-btn" onclick="SkinTracker.viewMode = '${this.viewMode === 'today' ? 'history' : 'today'}'; SkinTracker.render()">
                        ${this.viewMode === 'today' ? 'История' : 'Назад'}
                    </div>
                </div>

                ${this.viewMode === 'today' ? `
                    <div class="sk-clean-banner">
                        <span style="font-weight:700; opacity:0.8">Молодец!</span>
                        <div style="font-size:32px; font-weight:900;">${this.getCleanDays()}</div>
                        <span style="font-size:14px; font-weight:700">дней без повреждений</span>
                    </div>
                ` : `
                    <div class="sk-cal-card">
                        <div style="font-weight:800; font-size:14px; margin-bottom:5px;">Прогресс</div>
                        <div class="sk-chart-bar">
                            <div style="height:100%; background:#34C759; width:${successPerc}%"></div>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700;">
                            <span style="color:#34C759">Чисто: ${successCount}д.</span>
                            <span style="color:#FF3B30">Срывы: ${failCount}д.</span>
                        </div>
                        <hr style="border:none; border-top:1px solid #F2F2F7; margin:15px 0;">
                        ${renderCalendar()}
                    </div>
                `}

                ${recordsHTML || '<div style="text-align:center; color:#8E8E93; margin-top:40px;">Записей нет</div>'}

                <div style="position:fixed; bottom:110px; left:20px; right:20px;">
                    <button style="width:100%; background:#5856D6; color:white; border:none; padding:18px; border-radius:20px; font-weight:700;" 
                        onclick="SkinTracker.addRecord()">+ Записать порыв</button>
                </div>
            </div>
            ${this.editingId ? this.getModalHTML(currentEdit, todayStr) : ''}
        `;
        this.initTextAreas();
    },

    changeMonth: function(dir) {
        this.currentCalMonth += dir;
        if (this.currentCalMonth > 11) { this.currentCalMonth = 0; this.currentCalYear++; }
        if (this.currentCalMonth < 0) { this.currentCalMonth = 11; this.currentCalYear--; }
        this.render();
    },

    // Модальное окно вынесено для чистоты
    getModalHTML: function(currentEdit, todayStr) {
        return `
            <div class="sk-modal" onclick="SkinTracker.editingId=null; SkinTracker.render()">
                <div class="sk-modal-content" onclick="event.stopPropagation()">
                    <h2 style="text-align:center; margin-top:0;">${currentEdit ? 'Изменить' : 'Запись'}</h2>
                    <form id="sk-form">
                        <div style="display:flex; gap:10px; margin-bottom:12px;">
                            <input type="date" name="sk_date" class="sk-input" style="background:white; padding:10px; border-radius:15px; flex:1;" value="${currentEdit ? currentEdit.date : todayStr}">
                            <input type="time" name="sk_time" class="sk-input" style="background:white; padding:10px; border-radius:15px; flex:1;" value="${currentEdit ? currentEdit.time : new Date().toTimeString().slice(0,5)}">
                        </div>
                        <div style="background:white; border-radius:20px; padding:15px; margin-bottom:12px;">
                            <label class="sk-label">Место и занятие</label>
                            <div style="display:flex; gap:5px; flex-wrap:wrap; margin-bottom:8px;">
                                ${['Лицо','Руки','Ноги','Зеркало'].map(t => `<div style="background:#F2F2F7; padding:5px 8px; border-radius:8px; font-size:11px;" onclick="SkinTracker.addText('sk_place', '${t}')">${t}</div>`).join('')}
                            </div>
                            <textarea name="sk_place" class="sk-input" rows="1">${currentEdit ? currentEdit.place : ''}</textarea>
                        </div>
                        <div style="background:white; border-radius:20px; padding:15px; margin-bottom:12px;">
                            <label class="sk-label">Урон коже (0-10)</label>
                            <div class="sk-num-grid">
                                ${[0,1,2,3,4,5,6,7,8,9,10].map(n => `<div class="sk-num ${(currentEdit?.damage || 0) == n ? 'active' : ''}" data-value="${n}" onclick="document.querySelectorAll('.sk-num').forEach(x=>x.classList.remove('active')); this.classList.add('active')">${n}</div>`).join('')}
                            </div>
                        </div>
                        <div style="background:white; border-radius:20px; padding:15px; margin-bottom:12px;">
                            <label class="sk-label">Чувства ДО / ПОСЛЕ</label>
                            <textarea name="sk_before" class="sk-input" placeholder="До..." rows="2" style="margin-bottom:10px; border-bottom:1px solid #F2F2F7;">${currentEdit ? currentEdit.feeling_before : ''}</textarea>
                            <textarea name="sk_after" class="sk-input" placeholder="После..." rows="2">${currentEdit ? currentEdit.feeling_after : ''}</textarea>
                        </div>
                        <div style="background:white; border-radius:20px; padding:15px; margin-bottom:12px;">
                            <label class="sk-label">На что переключилась?</label>
                            <textarea name="sk_switch" class="sk-input" rows="1">${currentEdit ? currentEdit.switch : ''}</textarea>
                        </div>
                        <button type="button" class="sk-save-btn" style="width:100%; background:#5856D6; color:white; border:none; padding:18px; border-radius:20px; font-weight:700;" onclick="SkinTracker.submitForm()">Сохранить</button>
                    </form>
                </div>
            </div>
        `;
    },

    initTextAreas: function() {
        document.querySelectorAll('textarea.sk-input').forEach(el => {
            el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px';
            el.addEventListener('input', function() { this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px'; });
        });
    }
};

window.SkinTracker = SkinTracker;
export function render() { SkinTracker.init(); }
