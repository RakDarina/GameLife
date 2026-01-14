/* ==========================================
   МОДУЛЬ: ОСОЗНАННОЕ ПИТАНИЕ (food_mind.js)
   ========================================== */

const FoodTracker = {
    data: JSON.parse(localStorage.getItem('GL_Food_Data_v1')) || [],
    editingId: null,
    selectedHistoryDate: new Date().toISOString().split('T')[0],
    viewMode: 'today',

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
        
        // Получаем значения из активных кнопок-цифр
        const hungerVal = document.querySelector('.fd-number.active[data-type="hunger"]')?.dataset.value || 5;
        const fullnessVal = document.querySelector('.fd-number.active[data-type="fullness"]')?.dataset.value || 5;

        const record = {
            id: this.editingId === 'new' ? Date.now() : this.editingId,
            date: form.fd_date.value,
            time: form.fd_time.value,
            product: form.fd_prod.value,
            hunger: hungerVal,
            fullness: fullnessVal,
            activity: form.fd_act.value,
            thoughts: form.fd_emo.value
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

    selectNumber: function(el, type) {
        // Убираем активность у всех кнопок в этой группе
        document.querySelectorAll(`.fd-number[data-type="${type}"]`).forEach(btn => btn.classList.remove('active'));
        // Добавляем нажатой
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

                .fd-history-nav { background: white; border-radius: 20px; padding: 15px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
                .fd-date-picker { border: none; font-family: inherit; font-size: 16px; font-weight: 700; color: #1C1C1E; flex: 1; outline: none; }

                .fd-card { 
                    background: white; border-radius: 25px; padding: 20px; 
                    margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                    box-sizing: border-box; width: 100%;
                }
                .fd-card-meta { display: flex; justify-content: space-between; color: #8E8E93; font-size: 13px; margin-bottom: 10px; }
                .fd-card-prod { font-size: 18px; font-weight: 700; color: #1C1C1E; margin-bottom: 12px; }
                
                .fd-badge-row { display: flex; gap: 8px; margin-bottom: 12px; }
                .fd-badge { background: #F2F2F7; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; color: #5856D6; }

                .fd-info-label { font-size: 12px; color: #8E8E93; font-weight: 700; margin-top: 10px; text-transform: uppercase; }
                .fd-info-val { font-size: 15px; color: #3A3A3C; margin-bottom: 8px; white-space: pre-wrap; }

                /* МОДАЛКА */
                .fd-modal {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.5); z-index: 3000;
                    display: flex; align-items: flex-end;
                }
                .fd-modal-content {
                    background: #F8F9FB; width: 100%; max-height: 95vh;
                    border-radius: 30px 30px 0 0; padding: 25px 20px;
                    box-sizing: border-box; overflow-y: auto;
                    animation: fdSlide 0.3s ease-out;
                }

                .fd-group { background: white; border-radius: 20px; padding: 15px; margin-bottom: 12px; }
                .fd-label { display: block; font-weight: 700; font-size: 14px; margin-bottom: 10px; color: #5856D6; }
                
                /* СЕТКА ЦИФР */
                .fd-numbers-grid { 
                    display: grid; 
                    grid-template-columns: repeat(6, 1fr); 
                    gap: 6px; 
                    margin-bottom: 5px;
                }
                .fd-number {
                    background: #F2F2F7; border-radius: 10px; padding: 10px 0;
                    text-align: center; font-weight: 700; color: #1C1C1E;
                    cursor: pointer; transition: 0.2s;
                }
                .fd-number.active { background: #5856D6; color: white; }

                .fd-input { width: 100%; border: none; background: transparent; font-size: 16px; outline: none; font-family: inherit; padding: 0; color: #1C1C1E; resize: none; }
                .fd-btn-save { background: #5856D6; color: white; border: none; width: 100%; padding: 18px; border-radius: 20px; font-weight: 700; font-size: 16px; margin-top: 10px; }

                @keyframes fdSlide { from { transform: translateY(100%); } to { transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        let recordsHTML = filteredRecords.map(r => `
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
                ${r.thoughts ? `<div class="fd-info-label">Мысли:</div><div class="fd-info-val">${r.thoughts}</div>` : ''}
            </div>
        `).join('');

        const currentEdit = this.editingId && this.editingId !== 'new' ? this.data.find(r => r.id == this.editingId) : null;
        
        // Генерация кнопок с цифрами
        const getNumbers = (type, currentVal) => {
            let html = '<div class="fd-numbers-grid">';
            for(let i=0; i<=10; i++) {
                const active = i == (currentVal || 5) ? 'active' : '';
                html += `<div class="fd-number ${active}" data-type="${type}" data-value="${i}" onclick="FoodTracker.selectNumber(this, '${type}')">${i}</div>`;
            }
            html += '</div>';
            return html;
        };

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
                            <label class="fd-label">Голод до еды (0-10)</label>
                            ${getNumbers('hunger', currentEdit?.hunger)}
                        </div>

                        <div class="fd-group">
                            <label class="fd-label">Сытость после (0-10)</label>
                            ${getNumbers('fullness', currentEdit?.fullness)}
                        </div>

                        <div class="fd-group">
                            <label class="f-label" style="font-weight:700; font-size:14px; color:#5856D6; display:block; margin-bottom:8px;">Что делали во время еды?</label>
                            <textarea name="fd_act" class="fd-input" rows="2" placeholder="Смотрела ТВ, работала...">${currentEdit ? currentEdit.activity : ''}</textarea>
                        </div>

                        <div class="fd-group">
                            <label class="f-label" style="font-weight:700; font-size:14px; color:#5856D6; display:block; margin-bottom:8px;">Мысли и эмоции</label>
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

                ${recordsHTML || '<div style="text-align:center; color:#8E8E93; margin-top:40px;">Записей пока нет</div>'}

                <div style="position:fixed; bottom:110px; left:20px; right:20px;">
                    <button style="width:100%; background:#5856D6; color:white; border:none; padding:18px; border-radius:20px; font-weight:700; box-shadow: 0 10px 25px rgba(88, 86, 214, 0.3);" 
                        onclick="FoodTracker.addRecord()">
                        + Добавить еду
                    </button>
                </div>
            </div>
            ${modalHTML}
        `;

        // Авто-высота для всех textarea
        document.querySelectorAll('textarea.fd-input').forEach(el => {
            el.style.height = 'auto';
            el.style.height = (el.scrollHeight) + 'px';
            el.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
        });
    }
};

window.FoodTracker = FoodTracker;
export function render() { FoodTracker.init(); }
