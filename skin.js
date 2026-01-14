/* ==========================================
   МОДУЛЬ: ТРЕКЕР КОЖИ (skin.js)
   ========================================== */

const SkinTracker = {
    // Уникальное хранилище
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
        
        // Собираем активные теги
        const location = document.querySelector('.sk-tag.active[data-type="loc"]')?.dataset.value || 'Не указано';
        const trigger = document.querySelector('.sk-tag.active[data-type="trig"]')?.dataset.value || 'Нет';

        const record = {
            id: this.editingId === 'new' ? Date.now() : this.editingId,
            date: form.sk_date.value,
            time: form.sk_time.value,
            location: location,
            trigger: trigger,
            feeling_before: form.sk_before.value,
            feeling_after: form.sk_after.value,
            success: form.sk_success.checked // Удалось ли остановиться
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

    toggleTag: function(el, type) {
        document.querySelectorAll(`.sk-tag[data-type="${type}"]`).forEach(t => t.classList.remove('active'));
        el.classList.add('active');
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

                .sk-card { 
                    background: white; border-radius: 25px; padding: 20px; 
                    margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                    box-sizing: border-box; width: 100%;
                    position: relative;
                }
                .sk-card-meta { color: #8E8E93; font-size: 13px; margin-bottom: 10px; display: flex; justify-content: space-between; }
                
                .sk-card-title { font-size: 17px; font-weight: 700; color: #1C1C1E; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
                .sk-success-badge { background: #E8F5E9; color: #2E7D32; font-size: 11px; padding: 4px 8px; border-radius: 8px; }

                .sk-info-label { font-size: 12px; color: #8E8E93; font-weight: 700; margin-top: 10px; text-transform: uppercase; }
                .sk-info-val { font-size: 15px; color: #3A3A3C; margin-bottom: 8px; white-space: pre-wrap; line-height: 1.4; }

                /* МОДАЛКА */
                .sk-modal {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.5); z-index: 3000;
                    display: flex; align-items: flex-end;
                }
                .fd-modal-content { /* Используем похожий стиль анимации */
                    background: #F8F9FB; width: 100%; max-height: 95vh;
                    border-radius: 30px 30px 0 0; padding: 25px 20px;
                    box-sizing: border-box; overflow-y: auto;
                    animation: skSlide 0.3s ease-out;
                }

                .sk-group { background: white; border-radius: 20px; padding: 15px; margin-bottom: 12px; }
                .sk-label { display: block; font-weight: 700; font-size: 14px; margin-bottom: 10px; color: #5856D6; }
                
                /* ТЕГИ */
                .sk-tags-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 5px; }
                .sk-tag { 
                    background: #F2F2F7; padding: 8px 16px; border-radius: 12px; 
                    font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.2s;
                }
                .sk-tag.active { background: #5856D6; color: white; }

                .sk-input { width: 100%; border: none; background: transparent; font-size: 16px; outline: none; font-family: inherit; padding: 0; color: #1C1C1E; resize: none; }
                
                .sk-checkbox-group { display: flex; align-items: center; gap: 10px; cursor: pointer; }
                .sk-checkbox { width: 22px; height: 22px; accent-color: #34C759; }

                .sk-btn-save { background: #5856D6; color: white; border: none; width: 100%; padding: 18px; border-radius: 20px; font-weight: 700; font-size: 16px; margin-top: 10px; }

                @keyframes skSlide { from { transform: translateY(100%); } to { transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        let recordsHTML = filteredRecords.map(r => `
            <div class="sk-card">
                <div class="sk-card-meta">
                    <span>${r.time}</span>
                    <div style="display:flex; gap:15px;">
                        <span class="material-icons-outlined" style="font-size:18px;" onclick="SkinTracker.editingId='${r.id}'; SkinTracker.render()">edit</span>
                        <span class="material-icons-outlined" style="font-size:18px; color:#FF3B30" onclick="SkinTracker.deleteRecord(${r.id})">delete</span>
                    </div>
                </div>
                <div class="sk-card-title">
                    ${r.location} 
                    ${r.success ? '<span class="sk-success-badge">Справилась! ✨</span>' : ''}
                </div>
                <div class="sk-info-label">Триггер:</div><div class="sk-info-val">${r.trigger}</div>
                <div class="sk-info-label">До (чувства):</div><div class="sk-info-val">${r.feeling_before}</div>
                <div class="sk-info-label">После (чувства):</div><div class="sk-info-val">${r.feeling_after}</div>
            </div>
        `).join('');

        const currentEdit = this.editingId && this.editingId !== 'new' ? this.data.find(r => r.id == this.editingId) : null;
        
        const modalHTML = this.editingId ? `
            <div class="sk-modal" onclick="SkinTracker.editingId=null; SkinTracker.render()">
                <div class="fd-modal-content" onclick="event.stopPropagation()">
                    <h2 style="margin:0 0 20px; text-align:center">${currentEdit ? 'Изменить запись' : 'Дневник кожи'}</h2>
                    <form id="sk-form">
                        <div style="display:flex; gap:10px;">
                            <div class="sk-group" style="flex:1"><label class="sk-label">Дата</label>
                            <input type="date" name="sk_date" class="sk-input" value="${currentEdit ? currentEdit.date : todayStr}"></div>
                            <div class="sk-group" style="flex:1"><label class="sk-label">Время</label>
                            <input type="time" name="sk_time" class="sk-input" value="${currentEdit ? currentEdit.time : new Date().toTimeString().slice(0,5)}"></div>
                        </div>

                        <div class="sk-group">
                            <label class="sk-label">Где это произошло?</label>
                            <div class="sk-tags-row">
                                ${['Лицо', 'Плечи', 'Руки', 'Спина', 'Ванная', 'Зеркало'].map(loc => `
                                    <div class="sk-tag ${currentEdit?.location === loc ? 'active' : ''}" data-type="loc" data-value="${loc}" onclick="SkinTracker.toggleTag(this, 'loc')">${loc}</div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="sk-group">
                            <label class="sk-label">Что послужило триггером?</label>
                            <div class="sk-tags-row">
                                ${['Скука', 'Тревога', 'Стресс', 'Неровность', 'Злость', 'Усталость'].map(trig => `
                                    <div class="sk-tag ${currentEdit?.trigger === trig ? 'active' : ''}" data-type="trig" data-value="${trig}" onclick="SkinTracker.toggleTag(this, 'trig')">${trig}</div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="sk-group">
                            <label class="sk-label">Мысли и чувства ДО</label>
                            <textarea name="sk_before" class="sk-input" rows="2" placeholder="О чем думали?">${currentEdit ? currentEdit.feeling_before : ''}</textarea>
                        </div>

                        <div class="sk-group">
                            <label class="sk-label">Мысли и чувства ПОСЛЕ</label>
                            <textarea name="sk_after" class="sk-input" rows="2" placeholder="Что почувствовали потом?">${currentEdit ? currentEdit.feeling_after : ''}</textarea>
                        </div>

                        <div class="sk-group">
                            <label class="sk-checkbox-group">
                                <input type="checkbox" name="sk_success" class="sk-checkbox" ${currentEdit?.success ? 'checked' : ''}>
                                <span style="font-weight:700; font-size:15px; color:#2E7D32">Удалось вовремя остановиться?</span>
                            </label>
                        </div>

                        <button type="button" class="sk-btn-save" onclick="SkinTracker.submitForm()">Сохранить запись</button>
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
                    <div class="sk-history-nav" style="background:white; border-radius:20px; padding:15px; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
                        <span class="material-icons-outlined" style="color:#8E8E93">calendar_month</span>
                        <input type="date" style="border:none; font-family:inherit; font-size:16px; font-weight:700; flex:1; outline:none;" 
                            value="${this.selectedHistoryDate}" 
                            onchange="SkinTracker.selectedHistoryDate = this.value; SkinTracker.render()">
                    </div>
                ` : ''}

                ${recordsHTML || '<div style="text-align:center; color:#8E8E93; margin-top:40px;">Записей пока нет. Береги себя! 🤍</div>'}

                <div style="position:fixed; bottom:110px; left:20px; right:20px;">
                    <button style="width:100%; background:#5856D6; color:white; border:none; padding:18px; border-radius:20px; font-weight:700; box-shadow: 0 10px 25px rgba(88, 86, 214, 0.3);" 
                        onclick="SkinTracker.addRecord()">
                        + Сделать запись
                    </button>
                </div>
            </div>
            ${modalHTML}
        `;

        // Авто-высота для всех textarea
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
