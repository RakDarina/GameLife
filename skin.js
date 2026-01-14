/* ==========================================
   МОДУЛЬ: ДНЕВНИК КОЖИ (skin.js)
   ========================================== */

const SkinTracker = {
    data: JSON.parse(localStorage.getItem('GL_Skin_Data_v1')) || [],
    editingId: null,
    selectedHistoryDate: new Date().toISOString().split('T')[0],
    viewMode: 'today',

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

    deleteRecord: function(id) {
        if (confirm('Удалить эту запись?')) {
            this.data = this.data.filter(r => r.id !== id);
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
            place: form.sk_place.value,
            feeling_before: form.sk_before.value,
            feeling_after: form.sk_after.value,
            damage: damageVal,
            switch: form.sk_switch.value
        };

        if (this.editingId === 'new') {
            this.data.unshift(record);
        } else {
            const idx = this.data.findIndex(r => r.id == this.editingId);
            this.data[idx] = record;
        }

        this.editingId = null;
        this.save();
    },

    addText: function(fieldId, text) {
        const field = document.getElementsByName(fieldId)[0];
        if (field) {
            const currentVal = field.value.trim();
            field.value = currentVal ? currentVal + ', ' + text : text;
            field.dispatchEvent(new Event('input')); // Триггер для автовысоты
        }
    },

    // Расчет дней без повреждений
    getCleanDays: function() {
        if (this.data.length === 0) return 0;
        const lastRelapse = this.data
            .filter(r => parseInt(r.damage) > 0)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        
        if (!lastRelapse) return this.data.length > 0 ? 'Много' : 0;

        const diff = new Date() - new Date(lastRelapse.date);
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const todayStr = new Date().toISOString().split('T')[0];
        
        const displayDate = this.viewMode === 'today' ? todayStr : this.selectedHistoryDate;
        const filteredRecords = this.data
            .filter(r => r.date === displayDate)
            .sort((a, b) => b.time.localeCompare(a.time));

        // Статистика для диаграммы
        const allDays = [...new Set(this.data.filter(r => r.date <= todayStr).map(r => r.date))];
        const failDays = [...new Set(this.data.filter(r => r.date <= todayStr && parseInt(r.damage) > 0).map(r => r.date))];
        const successDaysCount = Math.max(0, allDays.length - failDays.length);
        const failDaysCount = failDays.length;
        const total = successDaysCount + failDaysCount;
        const successPerc = total > 0 ? Math.round((successDaysCount / total) * 100) : 0;

        const styles = `
            <style>
                .sk-container { animation: fadeIn 0.3s; margin-left: -20px; margin-right: -20px; padding: 0 20px 140px; width: calc(100% + 40px); box-sizing: border-box; touch-action: pan-y; }
                .sk-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
                .sk-back-btn { color: #007AFF; cursor: pointer; font-size: 28px; }
                .sk-title { font-size: 22px; font-weight: 800; }
                .sk-history-btn { color: #5856D6; font-weight: 700; cursor: pointer; font-size: 14px; }

                /* Плашка успеха */
                .sk-clean-banner { background: linear-gradient(135deg, #34C759, #2ecc71); color: white; border-radius: 20px; padding: 20px; text-align: center; margin-bottom: 20px; box-shadow: 0 8px 20px rgba(52, 199, 89, 0.2); }
                .sk-clean-count { font-size: 32px; font-weight: 900; display: block; }

                /* Диаграмма */
                .sk-chart-box { background: white; border-radius: 20px; padding: 15px; margin-bottom: 20px; }
                .sk-chart-bar { height: 12px; background: #FF3B30; border-radius: 6px; overflow: hidden; display: flex; margin-top: 10px; }
                .sk-chart-fill { height: 100%; background: #34C759; transition: 0.5s; }
                .sk-chart-labels { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-top: 5px; }

                .sk-card { background: white; border-radius: 25px; padding: 20px; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); width: 100%; box-sizing: border-box; }
                .sk-damage-badge { background: #F2F2F7; padding: 4px 10px; border-radius: 10px; color: #FF3B30; font-weight: 700; font-size: 12px; }
                
                /* Календарь с точкой */
                .sk-calendar-wrapper { background: white; border-radius: 20px; padding: 15px; margin-bottom: 20px; position: relative; }
                .sk-red-dot { width: 6px; height: 6px; background: #FF3B30; border-radius: 50%; position: absolute; top: 10px; right: 10px; }

                /* Форма стили */
                .sk-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 3000; display: flex; align-items: flex-end; }
                .sk-modal-content { background: #F8F9FB; width: 100%; max-height: 95vh; border-radius: 30px 30px 0 0; padding: 25px 20px; box-sizing: border-box; overflow-y: auto; animation: skSlide 0.3s ease-out; }
                .sk-group { background: white; border-radius: 20px; padding: 15px; margin-bottom: 12px; }
                .sk-label { display: block; font-weight: 700; font-size: 14px; margin-bottom: 10px; color: #5856D6; }
                .sk-num-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
                .sk-num { background: #F2F2F7; padding: 10px 0; border-radius: 10px; text-align: center; font-weight: 700; cursor: pointer; }
                .sk-num.active { background: #FF3B30; color: white; }
                .sk-input { width: 100%; border: none; background: transparent; font-size: 16px; outline: none; font-family: inherit; resize: none; }
                .sk-save-btn { background: #5856D6; color: white; border: none; width: 100%; padding: 18px; border-radius: 20px; font-weight: 700; font-size: 16px; margin-top: 10px; }

                @keyframes skSlide { from { transform: translateY(100%); } to { transform: translateY(0); } }
            </style>
        `;

        // Проверка повреждения на выбранную дату для календаря
        const hasDamageOnSelected = failDays.includes(this.selectedHistoryDate);

        let recordsHTML = filteredRecords.map(r => `
            <div class="sk-card">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <span style="color:#8E8E93; font-size:13px;">${r.time}</span>
                    <span class="sk-damage-badge">Урон: ${r.damage}/10</span>
                </div>
                <div style="font-weight:700; font-size:17px; margin-bottom:10px;">${r.place}</div>
                <div style="font-size:14px; color:#3A3A3C; line-height:1.4;">
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
        const modalHTML = this.editingId ? `
            <div class="sk-modal" onclick="SkinTracker.editingId=null; SkinTracker.render()">
                <div class="sk-modal-content" onclick="event.stopPropagation()">
                    <h2 style="margin:0 0 20px; text-align:center">${currentEdit ? 'Изменить' : 'Новая запись'}</h2>
                    <form id="sk-form">
                        <div style="display:flex; gap:10px;">
                            <div class="sk-group" style="flex:1"><label class="sk-label">Дата</label>
                            <input type="date" name="sk_date" class="sk-input" value="${currentEdit ? currentEdit.date : todayStr}"></div>
                            <div class="sk-group" style="flex:1"><label class="sk-label">Время</label>
                            <input type="time" name="sk_time" class="sk-input" value="${currentEdit ? currentEdit.time : new Date().toTimeString().slice(0,5)}"></div>
                        </div>
                        <div class="sk-group">
                            <label class="sk-label">Место и занятие</label>
                            <div style="display:flex; gap:5px; flex-wrap:wrap; margin-bottom:10px;">
                                ${['Лицо','Руки','Ноги','Ногти','Зеркало'].map(t => `<div style="background:#F2F2F7; padding:5px 10px; border-radius:8px; font-size:12px;" onclick="SkinTracker.addText('sk_place', '${t}')">${t}</div>`).join('')}
                            </div>
                            <textarea name="sk_place" class="sk-input" rows="1">${currentEdit ? currentEdit.place : ''}</textarea>
                        </div>
                        <div class="sk-group">
                            <label class="sk-label">Чувства ДО</label>
                            <div style="display:flex; gap:5px; flex-wrap:wrap; margin-bottom:10px;">
                                ${['Скука','Тревога','Стресс'].map(t => `<div style="background:#F2F2F7; padding:5px 10px; border-radius:8px; font-size:12px;" onclick="SkinTracker.addText('sk_before', '${t}')">${t}</div>`).join('')}
                            </div>
                            <textarea name="sk_before" class="sk-input" rows="2">${currentEdit ? currentEdit.feeling_before : ''}</textarea>
                        </div>
                        <div class="sk-group">
                            <label class="sk-label">Урон коже (0-10)</label>
                            <div class="sk-num-grid">
                                ${[0,1,2,3,4,5,6,7,8,9,10].map(n => `<div class="sk-num ${(currentEdit?.damage || 0) == n ? 'active' : ''}" data-value="${n}" onclick="document.querySelectorAll('.sk-num').forEach(x=>x.classList.remove('active')); this.classList.add('active')">${n}</div>`).join('')}
                            </div>
                        </div>
                        <div class="sk-group">
                            <label class="sk-label">Чувства ПОСЛЕ</label>
                            <textarea name="sk_after" class="sk-input" rows="2">${currentEdit ? currentEdit.feeling_after : ''}</textarea>
                        </div>
                        <div class="sk-group">
                            <label class="sk-label">На что переключилась?</label>
                            <textarea name="sk_switch" class="sk-input" rows="1">${currentEdit ? currentEdit.switch : ''}</textarea>
                        </div>
                        <button type="button" class="sk-save-btn" onclick="SkinTracker.submitForm()">Сохранить</button>
                    </form>
                </div>
            </div>
        ` : '';

        app.innerHTML = `
            ${styles}
            <div class="sk-container">
                <div class="sk-header">
                    <span class="material-icons-outlined sk-back-btn" onclick="loadModule('./mental.js')">chevron_left</span>
                    <div class="sk-title">${this.viewMode === 'today' ? 'Главная' : 'История'}</div>
                    <div class="sk-history-btn" onclick="SkinTracker.viewMode = '${this.viewMode === 'today' ? 'history' : 'today'}'; SkinTracker.render()">
                        ${this.viewMode === 'today' ? 'История' : 'Назад'}
                    </div>
                </div>

                ${this.viewMode === 'today' ? `
                    <div class="sk-clean-banner">
                        <span style="font-weight:700; opacity:0.9">Молодец!</span>
                        <span class="sk-clean-count">${this.getCleanDays()}</span>
                        <span style="font-size:14px; font-weight:700">дней без повреждений</span>
                    </div>
                    <h3 style="margin-bottom:15px">Записи за сегодня:</h3>
                ` : `
                    <div class="sk-chart-box">
                        <div style="font-weight:800; font-size:14px; color:#1C1C1E">Ваш прогресс</div>
                        <div class="sk-chart-bar">
                            <div class="sk-chart-fill" style="width:${successPerc}%"></div>
                        </div>
                        <div class="sk-chart-labels">
                            <span style="color:#34C759">Без ковыряния: ${successDaysCount}дн.</span>
                            <span style="color:#FF3B30">С ковырянием: ${failDaysCount}дн.</span>
                        </div>
                    </div>
                    <div class="sk-calendar-wrapper">
                        <label class="sk-label">Выберите дату</label>
                        <input type="date" class="sk-input" style="font-weight:800; font-size:18px;" 
                            value="${this.selectedHistoryDate}" onchange="SkinTracker.selectedHistoryDate = this.value; SkinTracker.render()">
                        ${hasDamageOnSelected ? '<div class="sk-red-dot"></div>' : ''}
                        <div style="font-size:11px; color:#8E8E93; margin-top:8px;">Красная точка означает наличие повреждений в этот день</div>
                    </div>
                `}

                ${recordsHTML || '<div style="text-align:center; color:#8E8E93; margin-top:40px;">Записей нет</div>'}

                <div style="position:fixed; bottom:110px; left:20px; right:20px;">
                    <button style="width:100%; background:#5856D6; color:white; border:none; padding:18px; border-radius:20px; font-weight:700; box-shadow: 0 10px 25px rgba(88, 86, 214, 0.3);" 
                        onclick="SkinTracker.addRecord()">+ Записать порыв</button>
                </div>
            </div>
            ${modalHTML}
        `;

        // Авто-высота для textarea
        document.querySelectorAll('textarea.sk-input').forEach(el => {
            el.style.height = 'auto';
            el.style.height = (el.scrollHeight) + 'px';
            el.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
        });
    }
};

window.SkinTracker = SkinTracker;
export function render() { SkinTracker.init(); }
