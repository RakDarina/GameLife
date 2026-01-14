/* ==========================================
   МОДУЛЬ: ОСОЗНАННОЕ ПИТАНИЕ (food_mind.js)
   ========================================== */

const FoodTracker = {
    // Уникальный ключ в localStorage
    data: JSON.parse(localStorage.getItem('GL_Food_Data_v1')) || [],
    editingId: null,
    selectedHistoryDate: new Date().toISOString().split('T')[0], // Дата для просмотра истории
    viewMode: 'today', // 'today' или 'history'

    init: function() {
        this.render();
    },

    save: function() {
        localStorage.setItem('GL_Food_Data_v1', JSON.stringify(this.data));
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
        const form = document.getElementById('fd-form');
        const record = {
            id: this.editingId === 'new' ? Date.now() : this.editingId,
            date: form.fd_date.value,
            time: form.fd_time.value,
            product: form.fd_prod.value,
            hunger: form.fd_hunger.value,
            fullness: form.fd_fullness.value,
            activity: form.fd_act.value,
            thoughts: form.fd_emo.value
        };

        if (this.editingId === 'new') {
            this.data.unshift(record);
        } else {
            const idx = this.data.findIndex(r => r.id === this.editingId);
            this.data[idx] = record;
        }

        this.editingId = null;
        this.save();
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Фильтруем записи
        const displayDate = this.viewMode === 'today' ? todayStr : this.selectedHistoryDate;
        const filteredRecords = this.data
            .filter(r => r.date === displayDate)
            .sort((a, b) => b.time.localeCompare(a.time));

        const styles = `
            <style>
                /* Контейнер с защитой от шатания */
                .fd-container { 
                    animation: fadeIn 0.3s; 
                    margin-left: -20px; margin-right: -20px;
                    padding: 0 20px 140px;
                    width: calc(100% + 40px);
                    box-sizing: border-box;
                    touch-action: pan-y;
                }
                
                .fd-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px; }
                .fd-back-btn { color: #007AFF; cursor: pointer; font-size: 28px; }
                .fd-title { font-size: 22px; font-weight: 800; }
                .fd-history-btn { color: #5856D6; font-weight: 700; cursor: pointer; font-size: 14px; }

                /* Календарь в истории */
                .fd-history-nav { background: white; border-radius: 20px; padding: 15px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
                .fd-date-picker { border: none; font-family: inherit; font-size: 16px; font-weight: 700; color: #1C1C1E; flex: 1; outline: none; }

                /* Карточка еды */
                .fd-card { 
                    background: white; border-radius: 25px; padding: 20px; 
                    margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                    box-sizing: border-box; width: 100%;
                }
                .fd-card-meta { display: flex; justify-content: space-between; color: #8E8E93; font-size: 13px; margin-bottom: 10px; }
                .fd-card-prod { font-size: 18px; font-weight: 700; color: #1C1C1E; margin-bottom: 12px; line-height: 1.3; }
                
                .fd-badge-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
                .fd-badge { background: #F2F2F7; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; color: #5856D6; }

                .fd-info-label { font-size: 12px; color: #8E8E93; font-weight: 700; margin-top: 10px; text-transform: uppercase; }
                .fd-info-val { font-size: 15px; color: #3A3A3C; margin-bottom: 8px; white-space: pre-wrap; }

                /* Форма (Модалка) */
                .fd-modal {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.5); z-index: 3000;
                    display: flex; align-items: flex-end; touch-action: none;
                }
                .fd-modal-content {
                    background: #F8F9FB; width: 100%; max-height: 95vh;
                    border-radius: 30px 30px 0 0; padding: 25px 20px;
                    box-sizing: border-box; overflow-y: auto;
                    animation: fdSlide 0.3s ease-out; touch-action: pan-y;
                }

                .fd-group { background: white; border-radius: 20px; padding: 15px; margin-bottom: 12px; }
                .fd-label { display: block; font-weight: 700; font-size: 14px; margin-bottom: 8px; color: #5856D6; }
                
                /* Поля с автовысотой (textarea) */
                .fd-input { width: 100%; border: none; background: transparent; font-size: 16px; outline: none; font-family: inherit; padding: 0; color: #1C1C1E; resize: none; }
                
                .fd-range { width: 100%; margin: 10px 0; accent-color: #5856D6; }
                .fd-range-desc { display: flex; justify-content: space-between; font-size: 11px; color: #8E8E93; }

                .fd-btn-save { background: #5856D6; color: white; border: none; width: 100%; padding: 18px; border-radius: 20px; font-weight: 700; font-size: 16px; margin-top: 10px; }

                @keyframes fdSlide { from { transform: translateY(100%); } to { transform: translateY(0); } }
            </style>
        `;

        let recordsHTML = filteredRecords.length > 0 ? filteredRecords.map(r => `
            <div class="fd-card">
                <div class="fd-card-meta">
                    <span>${r.time}</span>
                    <div style="display:flex; gap:15px;">
                        <span class="material-icons-outlined" style="font-size:18px;" onclick="FoodTracker.editingId='${r.id}'; FoodTracker.render()">edit</span>
                        <span class="material-icons-outlined" style="font-size:18px; color:#FF3B30" onclick="FoodTracker.deleteRecord(${r.id})">delete</span>
                    </div>
                </div>
                <div class="fd-card-prod">${r.product}</div>
                <div class="fd-badge-row">
                    <div class="fd-badge">Голод: ${r.hunger}/10</div>
                    <div class="fd-badge">Сытость: ${r.fullness}/10</div>
                </div>
                ${r.activity ? `<div class="fd-info-label">В процессе:</div><div class="fd-info-val">${r.activity}</div>` : ''}
                ${r.thoughts ? `<div class="fd-info-label">Мысли и эмоции:</div><div class="fd-info-val">${r.thoughts}</div>` : ''}
            </div>
        `).join('') : `<div style="text-align:center; color:#8E8E93; margin-top:40px;">Записей пока нет</div>`;

        // Форма добавления/редактирования
        const currentEdit = this.editingId && this.editingId !== 'new' ? this.data.find(r => r.id == this.editingId) : null;
        
        const modalHTML = this.editingId ? `
            <div class="fd-modal" onclick="FoodTracker.editingId=null; FoodTracker.render()">
                <div class="fd-modal-content" onclick="event.stopPropagation()">
                    <h2 style="margin:0 0 20px; text-align:center">${currentEdit ? 'Изменить' : 'Запись питания'}</h2>
                    <form id="fd-form">
                        <div style="display:flex; gap:10px;">
                            <div class="fd-group" style="flex:1"><label class="fd-label">Дата</label>
                            <input type="date" name="fd_date" class="fd-input" value="${currentEdit ? currentEdit.date : todayStr}"></div>
                            <div class="fd-group" style="flex:1"><label class="fd-label">Время</label>
                            <input type="time" name="fd_time" class="fd-input" value="${currentEdit ? currentEdit.time : new Date().toTimeString().slice(0,5)}"></div>
                        </div>

                        <div class="fd-group">
                            <label class="fd-label">Что съели?</label>
                            <textarea name="fd_prod" class="fd-input" rows="2" placeholder="Напишите здесь...">${currentEdit ? currentEdit.product : ''}</textarea>
                        </div>

                        <div class="fd-group">
                            <label class="fd-label">Насколько были голодны? (0-10)</label>
                            <input type="range" name="fd_hunger" class="fd-range" min="0" max="10" value="${currentEdit ? currentEdit.hunger : 5}">
                            <div class="fd-range-desc"><span>Совсем нет</span><span>Очень голодна</span></div>
                        </div>

                        <div class="fd-group">
                            <label class="fd-label">Насколько сыты после? (0-10)</label>
                            <input type="range" name="fd_fullness" class="fd-range" min="0" max="10" value="${currentEdit ? currentEdit.fullness : 5}">
                            <div class="fd-range-desc"><span>Голодна</span><span>Объелась</span></div>
                        </div>

                        <div class="fd-group">
                            <label class="fd-label">Что делали во время еды?</label>
                            <textarea name="fd_act" class="fd-input" rows="2" placeholder="Смотрела ТВ, работала...">${currentEdit ? currentEdit.activity : ''}</textarea>
                        </div>

                        <div class="fd-group">
                            <label class="fd-label">Мысли и эмоции</label>
                            <textarea name="fd_emo" class="fd-input" rows="3" placeholder="О чем думали?">${currentEdit ? currentEdit.thoughts : ''}</textarea>
                        </div>

                        <button type="button" class="fd-btn-save" onclick="FoodTracker.submitForm()">Сохранить</button>
                    </form>
                </div>
            </div>
        ` : '';

        app.innerHTML = `
            ${styles}
            <div class="fd-container">
                <div class="fd-header">
                    <span class="material-icons-outlined fd-back-btn" onclick="loadModule('./mental.js')">chevron_left</span>
                    <div class="fd-title">${this.viewMode === 'today' ? 'Сегодня' : 'История'}</div>
                    <div class="fd-history-btn" onclick="FoodTracker.viewMode = '${this.viewMode === 'today' ? 'history' : 'today'}'; FoodTracker.render()">
                        ${this.viewMode === 'today' ? 'История' : 'К сегодня'}
                    </div>
                </div>

                ${this.viewMode === 'history' ? `
                    <div class="fd-history-nav">
                        <span class="material-icons-outlined" style="color:#8E8E93">calendar_month</span>
                        <input type="date" class="fd-date-picker" value="${this.selectedHistoryDate}" 
                            onchange="FoodTracker.selectedHistoryDate = this.value; FoodTracker.render()">
                    </div>
                ` : ''}

                ${recordsHTML}

                <div style="position:fixed; bottom:110px; left:20px; right:20px;">
                    <button style="width:100%; background:#5856D6; color:white; border:none; padding:18px; border-radius:20px; font-weight:700; box-shadow: 0 10px 25px rgba(88, 86, 214, 0.3);" 
                        onclick="FoodTracker.addRecord()">
                        + Добавить еду
                    </button>
                </div>
            </div>
            ${modalHTML}
        `;

        // Авто-увеличение высоты текстовых полей при вводе
        document.querySelectorAll('.fd-input').forEach(el => {
            el.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
        });
    }
};

window.FoodTracker = FoodTracker;
export function render() { FoodTracker.init(); }
