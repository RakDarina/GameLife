/* ==========================================
   МОДУЛЬ: ДНЕВНИК ЭМОЦИЙ (emotions.js)
   ========================================== */

const EmotionDiary = {
    records: JSON.parse(localStorage.getItem('GL_Emotion_Records')) || [],
    editingId: null,

    init: function() {
        this.render();
    },

    saveToStore: function() {
        localStorage.setItem('GL_Emotion_Records', JSON.stringify(this.records));
        this.render();
    },

    addRecord: function() {
        this.editingId = 'new';
        this.render();
    },

    editRecord: function(id) {
        this.editingId = id;
        this.render();
    },

    deleteRecord: function(id) {
        if (confirm('Удалить эту запись?')) {
            this.records = this.records.filter(r => r.id !== id);
            this.saveToStore();
        }
    },

    submitForm: function() {
        const form = document.getElementById('em-form');
        const newRecord = {
            id: this.editingId === 'new' ? Date.now() : this.editingId,
            date: form.em_date.value,
            situation: form.em_sit.value,
            emotions: form.em_emo.value,
            thoughts: form.em_thou.value,
            behavior: form.em_beh.value,
            alternative: form.em_alt.value
        };

        if (this.editingId === 'new') {
            this.records.unshift(newRecord);
        } else {
            const index = this.records.findIndex(r => r.id === this.editingId);
            this.records[index] = newRecord;
        }

        this.editingId = null;
        this.saveToStore();
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        
        const styles = `
            <style>
                /* Контейнер страницы */
                .em-container { 
                    animation: fadeIn 0.3s; 
                    padding: 0 0 120px 0;
                    width: 100%;
                    overflow-x: hidden;
                    box-sizing: border-box;
                    touch-action: pan-y;
                }

                .em-header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
                .em-back-btn { color: #007AFF; cursor: pointer; font-size: 28px; }
                .em-title { font-size: 24px; font-weight: 800; flex: 1; text-align: center; margin-right: 40px; }

                /* Карточки записей */
                .em-card { 
                    background: white; border-radius: 25px; padding: 20px; 
                    margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                    box-sizing: border-box; width: 100%;
                }
                .em-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .em-card-date { color: #5856D6; font-weight: 700; font-size: 16px; }
                .em-card-actions { display: flex; gap: 15px; color: #8E8E93; }
                
                .em-label { font-weight: 800; font-size: 14px; margin-top: 10px; display: block; color: #1C1C1E; }
                .em-text { font-size: 15px; margin-bottom: 8px; color: #3A3A3C; line-height: 1.4; white-space: pre-wrap; word-break: break-word; }

                /* Кнопка "Добавить" */
                .em-add-btn {
                    background: white; border: 2px dashed #C7C7CC; border-radius: 25px;
                    padding: 25px; display: flex; flex-direction: column; align-items: center;
                    gap: 8px; color: #8E8E93; cursor: pointer; width: 100%; box-sizing: border-box;
                }

                /* МОДАЛЬНАЯ ФОРМА (Выезжает снизу) */
                .em-modal {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.5); z-index: 2000;
                    display: flex; align-items: flex-end; touch-action: none;
                }
                .em-modal-content {
                    background: #F8F9FB; width: 100%; max-height: 95vh;
                    border-radius: 30px 30px 0 0; padding: 20px;
                    box-sizing: border-box; overflow-y: auto;
                    animation: slideUp 0.3s ease-out;
                    touch-action: pan-y;
                }

                .em-form-title { font-size: 20px; font-weight: 800; margin: 0 0 20px 0; text-align: center; }
                
                .em-input-group { background: white; border-radius: 20px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
                .em-input-label { display: block; font-weight: 700; font-size: 14px; margin-bottom: 8px; color: var(--blue); }
                
                .em-field {
                    width: 100%; border: none; background: transparent;
                    font-size: 16px; font-family: inherit; outline: none; padding: 0;
                    color: #1C1C1E;
                }
                .em-area { min-height: 60px; resize: none; }

                .em-btns { display: flex; gap: 12px; margin-top: 25px; padding-bottom: 20px; }
                .em-save { background: var(--blue); color: white; border: none; flex: 2; padding: 18px; border-radius: 18px; font-weight: 700; font-size: 16px; }
                .em-cancel { background: #E5E5EA; color: #3A3A3C; border: none; flex: 1; padding: 18px; border-radius: 18px; font-weight: 700; font-size: 16px; }

                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        // Список записей
        let recordsHTML = this.records.map(r => `
            <div class="em-card">
                <div class="em-card-header">
                    <div class="em-card-date">${r.date.split('-').reverse().join('.')}</div>
                    <div class="em-card-actions">
                        <span class="material-icons-outlined" onclick="EmotionDiary.editRecord(${r.id})">edit</span>
                        <span class="material-icons-outlined" style="color:#FF3B30" onclick="EmotionDiary.deleteRecord(${r.id})">delete</span>
                    </div>
                </div>
                <span class="em-label">Ситуация</span><div class="em-text">${r.situation}</div>
                <span class="em-label">Эмоции</span><div class="em-text">${r.emotions}</div>
                <span class="em-label">Мысли</span><div class="em-text">${r.thoughts}</div>
                <span class="em-label">Альтернатива</span><div class="em-text" style="color:#34C759">${r.alternative}</div>
            </div>
        `).join('');

        // Форма
        const modalHTML = this.editingId ? `
            <div class="em-modal" onclick="if(event.target===this){EmotionDiary.editingId=null;EmotionDiary.render();}">
                <div class="em-modal-content" onclick="event.stopPropagation()">
                    <div class="em-form-title">${this.editingId === 'new' ? 'Новая запись' : 'Редактирование'}</div>
                    <form id="em-form">
                        <div class="em-input-group">
                            <label class="em-input-label">Дата</label>
                            <input type="date" name="em_date" class="em-field" value="${this.editingId === 'new' ? new Date().toISOString().split('T')[0] : this.records.find(r => r.id === this.editingId).date}">
                        </div>
                        <div class="em-input-group">
                            <label class="em-input-label">1. Что случилось?</label>
                            <textarea name="em_sit" class="em-field em-area" placeholder="Опишите ситуацию...">${this.editingId === 'new' ? '' : this.records.find(r => r.id === this.editingId).situation}</textarea>
                        </div>
                        <div class="em-input-group">
                            <label class="em-input-label">2. Ваши эмоции</label>
                            <textarea name="em_emo" class="em-field em-area" placeholder="Что вы почувствовали?">${this.editingId === 'new' ? '' : this.records.find(r => r.id === this.editingId).emotions}</textarea>
                        </div>
                        <div class="em-input-group">
                            <label class="em-input-label">3. Автоматические мысли</label>
                            <textarea name="em_thou" class="em-field em-area" placeholder="О чем подумали в тот момент?">${this.editingId === 'new' ? '' : this.records.find(r => r.id === this.editingId).thoughts}</textarea>
                        </div>
                        <div class="em-input-group">
                            <label class="em-input-label">4. Ваше поведение</label>
                            <textarea name="em_beh" class="em-field em-area" placeholder="Что вы сделали?">${this.editingId === 'new' ? '' : this.records.find(r => r.id === this.editingId).behavior}</textarea>
                        </div>
                        <div class="em-input-group" style="border: 1px solid #34C759;">
                            <label class="em-input-label" style="color:#34C759">5. Альтернативная мысль</label>
                            <textarea name="em_alt" class="em-field em-area" placeholder="Как можно посмотреть иначе?">${this.editingId === 'new' ? '' : this.records.find(r => r.id === this.editingId).alternative}</textarea>
                        </div>

                        <div class="em-btns">
                            <button type="button" class="em-cancel" onclick="EmotionDiary.editingId=null;EmotionDiary.render();">Отмена</button>
                            <button type="button" class="em-save" onclick="EmotionDiary.submitForm()">Сохранить</button>
                        </div>
                    </form>
                </div>
            </div>
        ` : '';

        app.innerHTML = `
            ${styles}
            <div class="em-container">
                <div class="em-header">
                    <span class="material-icons-outlined em-back-btn" onclick="loadModule('./mental.js')">chevron_left</span>
                    <div class="em-title">Дневник эмоций</div>
                </div>

                ${recordsHTML}

                <div class="em-add-btn" onclick="EmotionDiary.addRecord()">
                    <span class="material-icons-outlined" style="font-size: 32px">add_circle_outline</span>
                    <span style="font-weight:700">Добавить запись СМЭР</span>
                </div>
            </div>
            ${modalHTML}
        `;
    }
};

window.EmotionDiary = EmotionDiary;
export function render() { EmotionDiary.init(); }
