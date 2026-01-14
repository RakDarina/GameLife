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
        const damageVal = document.querySelector('.sk-num.active')?.dataset.value || 0;

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

    // Функция быстрой вставки текста из тегов
    addText: function(fieldId, text) {
        const field = document.getElementsByName(fieldId)[0];
        if (field) {
            const currentVal = field.value.trim();
            field.value = currentVal ? currentVal + ', ' + text : text;
            field.style.height = 'auto';
            field.style.height = (field.scrollHeight) + 'px';
        }
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const todayStr = new Date().toISOString().split('T')[0];
        
        const displayDate = this.viewMode === 'today' ? todayStr : this.selectedHistoryDate;
        const filteredRecords = this.data
            .filter(r => r.date === displayDate)
            .sort((a, b) => b.time.localeCompare(a.time));

        const styles = `
            <style>
                .sk-container { 
                    animation: fadeIn 0.3s; 
                    margin-left: -20px; margin-right: -20px;
                    padding: 0 20px 140px;
                    width: calc(100% + 40px);
                    box-sizing: border-box;
                    touch-action: pan-y;
                }
                .sk-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px; }
                .sk-back-btn { color: #007AFF; cursor: pointer; font-size: 28px; }
                .sk-title { font-size: 22px; font-weight: 800; }
                .sk-history-btn { color: #5856D6; font-weight: 700; cursor: pointer; font-size: 14px; }

                .sk-card { background: white; border-radius: 25px; padding: 20px; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); width: 100%; box-sizing: border-box; }
                .sk-card-meta { color: #8E8E93; font-size: 13px; margin-bottom: 10px; display: flex; justify-content: space-between; }
                
                .sk-damage-badge { background: #F2F2F7; padding: 4px 10px; border-radius: 10px; color: #FF3B30; font-weight: 700; font-size: 12px; }
                .sk-label-sm { font-size: 12px; color: #8E8E93; font-weight: 700; margin-top: 10px; text-transform: uppercase; }
                .sk-val { font-size: 15px; color: #1C1C1E; margin-bottom: 5px; white-space: pre-wrap; line-height: 1.4; }

                /* МОДАЛКА */
                .sk-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 3000; display: flex; align-items: flex-end; }
                .sk-modal-content { background: #F8F9FB; width: 100%; max-height: 95vh; border-radius: 30px 30px 0 0; padding: 25px 20px; box-sizing: border-box; overflow-y: auto; animation: skSlide 0.3s ease-out; }

                .sk-group { background: white; border-radius: 20px; padding: 15px; margin-bottom: 12px; }
                .sk-label { display: block; font-weight: 700; font-size: 14px; margin-bottom: 10px; color: #5856D6; }
                
                .sk-hint-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
                .sk-hint-btn { background: #F2F2F7; padding: 6px 12px; border-radius: 10px; font-size: 13px; font-weight: 600; color: #3A3A3C; cursor: pointer; }

                .sk-num-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
                .sk-num { background: #F2F2F7; padding: 10px 0; border-radius: 10px; text-align: center; font-weight: 700; cursor: pointer; }
                .sk-num.active { background: #FF3B30; color: white; }

                .sk-input { width: 100%; border: none; background: transparent; font-size: 16px; outline: none; font-family: inherit; padding: 0; resize: none; }
                .sk-save-btn { background: #5856D6; color: white; border: none; width: 100%; padding: 18px; border-radius: 20px; font-weight: 700; font-size: 16px; margin-top: 10px; }

                @keyframes skSlide { from { transform: translateY(100%); } to { transform: translateY(0); } }
            </style>
        `;

        let recordsHTML = filteredRecords.map(r => `
            <div class="sk-card">
                <div class="sk-card-meta">
                    <span>${r.time}</span>
                    <span class="sk-damage-badge">Урон: ${r.damage}/10</span>
                </div>
                <div style="font-weight:700; font-size:17px; margin-bottom:10px;">${r.place}</div>
                <div class="sk-label-sm">До:</div><div class="sk-val">${r.feeling_before}</div>
                <div class="sk-label-sm">После:</div><div class="sk-val">${r.feeling_after}</div>
                <div class="sk-label-sm">Переключилась на:</div><div class="sk-val" style="color:#34C759">${r.switch}</div>
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
                    <h2 style="margin:0 0 20px; text-align:center">${currentEdit ? 'Изменить' : 'Дневник кожи'}</h2>
                    <form id="sk-form">
                        <div style="display:flex; gap:10px;">
                            <div class="sk-group" style="flex:1"><label class="sk-label">Дата</label>
                            <input type="date" name="sk_date" class="sk-input" value="${currentEdit ? currentEdit.date : todayStr}"></div>
                            <div class="sk-group" style="flex:1"><label class="sk-label">Время</label>
                            <input type="time" name="sk_time" class="sk-input" value="${currentEdit ? currentEdit.time : new Date().toTimeString().slice(0,5)}"></div>
                        </div>

                        <div class="sk-group">
                            <label class="sk-label">Занятие и место</label>
                            <div class="sk-hint-row">
                                ${['Лицо', 'Руки', 'Ноги', 'Ногти', 'Ванная', 'Зеркало'].map(t => `<div class="sk-hint-btn" onclick="SkinTracker.addText('sk_place', '${t}')">${t}</div>`).join('')}
                            </div>
                            <textarea name="sk_place" class="sk-input" rows="1" placeholder="Где и что делали?">${currentEdit ? currentEdit.place : ''}</textarea>
                        </div>

                        <div class="sk-group">
                            <label class="sk-label">Мысли и чувства ДО</label>
                            <div class="sk-hint-row">
                                ${['Скука', 'Тревога', 'Стресс', 'Неровность'].map(t => `<div class="sk-hint-btn" onclick="SkinTracker.addText('sk_before', '${t}')">${t}</div>`).join('')}
                            </div>
                            <textarea name="sk_before" class="sk-input" rows="2" placeholder="О чем думали до?">${currentEdit ? currentEdit.feeling_before : ''}</textarea>
                        </div>

                        <div class="sk-group">
                            <label class="sk-label">Повреждение (0-10)</label>
                            <div class="sk-num-grid">
                                ${[0,1,2,3,4,5,6,7,8,9,10].map(n => `<div class="sk-num ${ (currentEdit?.damage || 0) == n ? 'active' : ''}" data-value="${n}" onclick="document.querySelectorAll('.sk-num').forEach(x=>x.classList.remove('active')); this.classList.add('active')">${n}</div>`).join('')}
                            </div>
                        </div>

                        <div class="sk-group">
                            <label class="sk-label">Мысли и чувства ПОСЛЕ</label>
                            <textarea name="sk_after" class="sk-input" rows="2" placeholder="Что почувствовали потом?">${currentEdit ? currentEdit.feeling_after : ''}</textarea>
                        </div>

                        <div class="sk-group">
                            <label class="sk-label">На что переключилась?</label>
                            <textarea name="sk_switch" class="sk-input" rows="1" placeholder="Что помогло остановиться?">${currentEdit ? currentEdit.switch : ''}</textarea>
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
                    <div class="sk-title">${this.viewMode === 'today' ? 'Сегодня' : 'История'}</div>
                    <div class="sk-history-btn" onclick="SkinTracker.viewMode = '${this.viewMode === 'today' ? 'history' : 'today'}'; SkinTracker.render()">
                        ${this.viewMode === 'today' ? 'История' : 'К сегодня'}
                    </div>
                </div>

                ${this.viewMode === 'history' ? `
                    <div class="sk-group" style="padding:10px 15px; display:flex; align-items:center; gap:10px;">
                        <input type="date" style="border:none; font-family:inherit; font-size:16px; font-weight:700; flex:1; outline:none;" 
                            value="${this.selectedHistoryDate}" onchange="SkinTracker.selectedHistoryDate = this.value; SkinTracker.render()">
                    </div>
                ` : ''}

                ${recordsHTML || '<div style="text-align:center; color:#8E8E93; margin-top:40px;">Записей нет. Ты молодец!</div>'}

                <div style="position:fixed; bottom:110px; left:20px; right:20px;">
                    <button style="width:100%; background:#5856D6; color:white; border:none; padding:18px; border-radius:20px; font-weight:700; box-shadow: 0 10px 25px rgba(88, 86, 214, 0.3);" 
                        onclick="SkinTracker.addRecord()">+ Добавить запись</button>
                </div>
            </div>
            ${modalHTML}
        `;

        // Авто-высота полей
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
