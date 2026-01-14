/* ==========================================
   МОДУЛЬ: ДЕРМАТИЛЛОМАНИЯ (skin.js)
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

    addRecord: function() { 
        this.editingId = 'new'; 
        this.render(); 
    },
    
    // ИСПРАВЛЕНО: Приведение типов для корректного удаления
    deleteRecord: function(id) { 
        if (confirm('Удалить эту запись?')) { 
            this.data = this.data.filter(r => String(r.id) !== String(id)); 
            this.save(); 
        } 
    },

    submitForm: function() {
        const form = document.getElementById('sk-form');
        const damageVal = parseInt(document.querySelector('.sk-num.active')?.dataset.value || 0);

        const record = {
            id: this.editingId === 'new' ? Date.now() : this.editingId,
            date: form.sk_date.value,
            time: form.sk_time.value,
            place: form.sk_place.value || 'Без места', // Защита от пустого места
            feeling_before: form.sk_before.value,
            feeling_after: form.sk_after.value,
            damage: damageVal,
            switch: form.sk_switch.value
        };

        if (this.editingId === 'new') {
            this.data.unshift(record);
        } else {
            const idx = this.data.findIndex(r => String(r.id) === String(this.editingId));
            if (idx !== -1) this.data[idx] = record;
        }

        this.editingId = null;
        this.save();
    },

    addText: function(fieldId, text) {
        const field = document.getElementsByName(fieldId)[0];
        if (field) {
            const currentVal = field.value.trim();
            // ИСПРАВЛЕНО: Убрано появление undefined
            field.value = currentVal ? currentVal + ', ' + text : text;
            field.style.height = 'auto';
            field.style.height = (field.scrollHeight) + 'px';
        }
    },

    getCleanDays: function() {
        const relapses = this.data.filter(r => parseInt(r.damage) > 0).sort((a,b) => new Date(b.date) - new Date(a.date));
        if (relapses.length === 0) return this.data.length > 0 ? "★" : 0;
        const diff = new Date() - new Date(relapses[0].date);
        return Math.floor(diff / (1000 * 86400));
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const todayStr = new Date().toISOString().split('T')[0];
        const displayDate = this.viewMode === 'today' ? todayStr : this.selectedHistoryDate;
        
        // Фильтруем записи для отображения
        const filteredRecords = this.data
            .filter(r => r.date === displayDate)
            .sort((a, b) => b.time.localeCompare(a.time));

        const allDays = [...new Set(this.data.filter(r => r.date <= todayStr).map(r => r.date))];
        const failDays = [...new Set(this.data.filter(r => r.date <= todayStr && parseInt(r.damage) > 0).map(r => r.date))];
        const successCount = Math.max(0, allDays.length - failDays.length);
        const failCount = failDays.length;
        const successPerc = (successCount + failCount) > 0 ? (successCount / (successCount + failCount)) * 100 : 0;

        const styles = `
            <style>
                .sk-container { animation: fadeIn 0.3s; padding-bottom: 140px; }
                .sk-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
                .sk-clean-banner { background: #34C759; color: white; border-radius: 25px; padding: 25px; text-align: center; margin-bottom: 25px; }
                .sk-cal-card { background: white; border-radius: 25px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
                .sk-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; margin-top: 15px; }
                .sk-cal-cell { position: relative; padding: 12px 0; font-size: 14px; font-weight: 600; text-align: center; border-radius: 12px; }
                .sk-cal-cell.active { background: #5856D6; color: white; }
                .sk-dot { width: 5px; height: 5px; background: #FF3B30; border-radius: 50%; position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); }
                .sk-card { background: white; border-radius: 25px; padding: 20px; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
                .sk-damage-label { background: #F2F2F7; padding: 4px 10px; border-radius: 10px; color: #FF3B30; font-weight: 700; font-size: 12px; }
                .sk-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 3000; display: flex; align-items: flex-end; }
                .sk-modal-content { background: #F2F2F7; width: 100%; max-height: 95vh; border-radius: 30px 30px 0 0; padding: 20px; overflow-y: auto; box-sizing: border-box; }
                .sk-form-group { background: white; border-radius: 20px; padding: 15px; margin-bottom: 12px; }
                .sk-label { display: block; font-weight: 700; font-size: 14px; color: #8E8E93; margin-bottom: 10px; }
                .sk-input { width: 100%; border: none; background: transparent; font-size: 17px; font-family: inherit; outline: none; resize: none; }
                .sk-num-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
                .sk-num { background: #F2F2F7; padding: 12px 0; border-radius: 12px; text-align: center; font-weight: 700; }
                .sk-num.active { background: #FF3B30; color: white; }
                .sk-btn-save { background: #5856D6; color: white; border: none; width: 100%; padding: 18px; border-radius: 20px; font-weight: 700; font-size: 17px; margin-top: 10px; }
            </style>
        `;

        const renderCalendar = () => {
            const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
            const daysInMonth = new Date(this.currentCalYear, this.currentCalMonth + 1, 0).getDate();
            const firstDay = new Date(this.currentCalYear, this.currentCalMonth, 1).getDay();
            const offset = firstDay === 0 ? 6 : firstDay - 1;

            let html = `<div style="display:flex; justify-content:space-between; align-items:center; font-weight:800;">
                <span onclick="event.stopPropagation(); SkinTracker.changeMonth(-1)">◀</span>
                <span>${months[this.currentCalMonth]} ${this.currentCalYear}</span>
                <span onclick="event.stopPropagation(); SkinTracker.changeMonth(1)">▶</span>
            </div><div class="sk-cal-grid">`;
            
            ['П','В','С','Ч','П','С','В'].forEach(d => html += `<div style="font-size:10px; color:#8E8E93; text-align:center">${d}</div>`);
            for (let i = 0; i < offset; i++) html += `<div></div>`;
            for (let d = 1; d <= daysInMonth; d++) {
                const dStr = `${this.currentCalYear}-${String(this.currentCalMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                const hasAnyRecord = this.data.some(r => r.date === dStr);
                html += `<div class="sk-cal-cell ${this.selectedHistoryDate === dStr ? 'active' : ''}" onclick="SkinTracker.selectedHistoryDate='${dStr}'; SkinTracker.render()">
                    ${d}${hasAnyRecord ? '<div class="sk-dot"></div>' : ''}
                </div>`;
            }
            return html + `</div>`;
        };

        // ИСПРАВЛЕНО: Передача ID как строки в deleteRecord
        let recordsHTML = filteredRecords.map(r => `
            <div class="sk-card">
                <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                    <span style="color:#8E8E93; font-weight:600;">${r.time}</span>
                    <span class="sk-damage-label">Урон: ${r.damage}/10</span>
                </div>
                <div style="font-weight:700; font-size:17px; margin-bottom:8px;">${r.place}</div>
                <div style="font-size:15px; line-height:1.4; color:#3A3A3C">
                    <div style="margin-bottom:4px;"><b>До:</b> ${r.feeling_before || '—'}</div>
                    <div style="margin-bottom:4px;"><b>После:</b> ${r.feeling_after || '—'}</div>
                    <div style="color:#34C759"><b>Переключилась:</b> ${r.switch || '—'}</div>
                </div>
                <div style="margin-top:15px; padding-top:12px; border-top:1px solid #F2F2F7; display:flex; gap:20px;">
                    <span class="material-icons-outlined" style="color:#8E8E93; font-size:20px;" onclick="SkinTracker.editingId='${r.id}'; SkinTracker.render()">edit</span>
                    <span class="material-icons-outlined" style="color:#FF3B30; font-size:20px;" onclick="SkinTracker.deleteRecord('${r.id}')">delete</span>
                </div>
            </div>
        `).join('');

        app.innerHTML = `
            ${styles}
            <div class="sk-container">
                <div class="sk-header">
                    <span class="material-icons-outlined" style="color:#007AFF; font-size:32px;" onclick="loadModule('./mental.js')">chevron_left</span>
                    <span style="font-size:20px; font-weight:800;">${this.viewMode === 'today' ? 'Дерматилломания' : 'История'}</span>
                    <span style="color:#5856D6; font-weight:700;" onclick="SkinTracker.viewMode = '${this.viewMode === 'today' ? 'history' : 'today'}'; SkinTracker.render()">
                        ${this.viewMode === 'today' ? 'История' : 'Назад'}
                    </span>
                </div>

                ${this.viewMode === 'today' ? `
                    <div class="sk-clean-banner">
                        <div style="font-weight:700; opacity:0.9; margin-bottom:5px;">Молодец!</div>
                        <div style="font-size:40px; font-weight:900;">${this.getCleanDays()}</div>
                        <div style="font-weight:700;">дней без повреждений</div>
                    </div>
                ` : `
                    <div class="sk-cal-card">
                        <div style="font-weight:800; margin-bottom:10px;">Прогресс</div>
                        <div style="height:12px; background:#FF3B30; border-radius:6px; overflow:hidden; display:flex;">
                            <div style="width:${successPerc}%; background:#34C759;"></div>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-top:8px;">
                            <span style="color:#34C759">Чисто: ${successCount}д.</span>
                            <span style="color:#FF3B30">Срывы: ${failCount}д.</span>
                        </div>
                        <hr style="border:none; border-top:1px solid #F2F2F7; margin:20px 0;">
                        ${renderCalendar()}
                    </div>
                `}

                ${recordsHTML || '<div style="text-align:center; color:#8E8E93; margin-top:50px;">Записей пока нет</div>'}

                <div style="position:fixed; bottom:110px; left:20px; right:20px;">
                    <button style="width:100%; background:#5856D6; color:white; border:none; padding:20px; border-radius:22px; font-weight:700; font-size:17px; box-shadow: 0 10px 25px rgba(88,86,214,0.3);" 
                        onclick="SkinTracker.addRecord()">+ Записать порыв</button>
                </div>
            </div>
            ${this.editingId ? this.getModalHTML(todayStr) : ''}
        `;
        this.initTextAreas();
    },

    changeMonth: function(dir) {
        this.currentCalMonth += dir;
        if (this.currentCalMonth > 11) { this.currentCalMonth = 0; this.currentCalYear++; }
        if (this.currentCalMonth < 0) { this.currentCalMonth = 11; this.currentCalYear--; }
        this.render();
    },

    getModalHTML: function(todayStr) {
        const edit = this.editingId === 'new' ? null : this.data.find(r => String(r.id) === String(this.editingId));
        return `
            <div class="sk-modal" onclick="SkinTracker.editingId=null; SkinTracker.render()">
                <div class="sk-modal-content" onclick="event.stopPropagation()">
                    <h2 style="text-align:center; margin-top:0; margin-bottom:20px;">${edit ? 'Изменить' : 'Новая запись'}</h2>
                    <form id="sk-form">
                        <div style="display:flex; gap:10px; margin-bottom:12px;">
                            <div class="sk-form-group" style="flex:1; margin-bottom:0;"><label class="sk-label">Дата</label>
                            <input type="date" name="sk_date" class="sk-input" value="${edit ? edit.date : todayStr}"></div>
                            <div class="sk-form-group" style="flex:1; margin-bottom:0;"><label class="sk-label">Время</label>
                            <input type="time" name="sk_time" class="sk-input" value="${edit ? edit.time : new Date().toTimeString().slice(0,5)}"></div>
                        </div>
                        <div class="sk-form-group">
                            <label class="sk-label">Место</label>
                            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px;">
                                ${['Лицо','Руки','Ноги','Зеркало'].map(t => `<div style="background:#F2F2F7; padding:8px 12px; border-radius:10px; font-size:13px; font-weight:600;" onclick="SkinTracker.addText('sk_place', '${t}')">${t}</div>`).join('')}
                            </div>
                            <textarea name="sk_place" class="sk-input" rows="1">${edit ? edit.place : ''}</textarea>
                        </div>
                        <div class="sk-form-group">
                            <label class="sk-label">Урон (0-10)</label>
                            <div class="sk-num-grid">
                                ${[0,1,2,3,4,5,6,7,8,9,10].map(n => `<div class="sk-num ${(edit?.damage || 0) == n ? 'active' : ''}" data-value="${n}" onclick="document.querySelectorAll('.sk-num').forEach(x=>x.classList.remove('active')); this.classList.add('active')">${n}</div>`).join('')}
                            </div>
                        </div>
                        <div class="sk-form-group">
                            <label class="sk-label">Чувства ДО</label>
                            <textarea name="sk_before" class="sk-input" rows="2">${edit ? edit.feeling_before : ''}</textarea>
                        </div>
                        <div class="sk-form-group">
                            <label class="sk-label">Чувства ПОСЛЕ</label>
                            <textarea name="sk_after" class="sk-input" rows="2">${edit ? edit.feeling_after : ''}</textarea>
                        </div>
                        <div class="sk-form-group">
                            <label class="sk-label">Переключилась на...</label>
                            <textarea name="sk_switch" class="sk-input" rows="1">${edit ? edit.switch : ''}</textarea>
                        </div>
                        <button type="button" class="sk-btn-save" onclick="SkinTracker.submitForm()">Сохранить</button>
                    </form>
                </div>
            </div>
        `;
    },

    initTextAreas: function() {
        document.querySelectorAll('textarea.sk-input').forEach(el => {
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
        });
    }
};

window.SkinTracker = SkinTracker;
export function render() { SkinTracker.init(); }
