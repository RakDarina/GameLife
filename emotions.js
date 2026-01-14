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
                .em-container { animation: fadeIn 0.3s; padding-bottom: 100px; box-sizing: border-box; } /* ИСПРАВЛЕНИЕ */
                .em-header { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; }
                .em-back-btn { color: #007AFF; cursor: pointer; font-size: 28px; }
                .em-title { font-size: 24px; font-weight: 800; flex: 1; text-align: center; margin-right: 40px; }

                /* Карточка записи */
                .em-card { 
                    background: white; border-radius: 25px; padding: 20px; 
                    margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                    position: relative;
                    box-sizing: border-box; /* ИСПРАВЛЕНИЕ */
                }
                .em-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                .em-card-date { color: #5856D6; font-weight: 700; font-size: 17px; }
                .em-card-actions { display: flex; gap: 15px; color: #8E8E93; }
                
                .em-field-label { font-weight: 800; display: block; margin-top: 10px; font-size: 15px; }
                .em-field-text { font-size: 15px; margin-bottom: 10px; white-space: pre-wrap; color: #3A3A3C; line-height: 1.4; }
                .em-alt-text { color: #34C759; }

                /* Кнопка Добавить (пунктир) */
                .em-add-placeholder {
                    border: 2px dashed #C7C7CC; border-radius: 25px; padding: 30px;
                    display: flex; flex-direction: column; align-items: center; gap: 10px;
                    color: #8E8E93; cursor: pointer; transition: 0.2s;
                    box-sizing: border-box; /* ИСПРАВЛЕНИЕ */
                }
                .em-add-placeholder:active { background: #E5E5EA; }

                /* Модальное окно */
                .em-modal {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.4); z-index: 2000; display: flex; align-items: flex-end;
                }
                .em-modal-content {
                    background: white; width: 100%; max-height: 90vh; 
                    border-radius: 30px 30px 0 0; padding: 25px; overflow-y: auto;
                    animation: slideUp 0.3s ease-out;
                    box-sizing: border-box;
                }
                .em-form-group { margin-bottom: 20px; }
                .em-form-label { display: block; font-weight: 700; margin-bottom: 8px; font-size: 17px; }
                .em-input, .em-textarea {
                    width: 100%; border: 1px solid #E5E5EA; border-radius: 12px;
                    padding: 12px; font-size: 16px; font-family: inherit; outline: none;
                    box-sizing: border-box;
                }
                .em-textarea { min-height: 80px; resize: none; }
                .em-modal-btns { display: flex; gap: 15px; margin-top: 20px; }
                .em-btn-save { background: #5856D6; color: white; border: none; flex: 2; padding: 15px; border-radius: 15px; font-weight: 600; }
                .em-btn-cancel { background: #F2F2F7; color: #007AFF; border: none; flex: 1; padding: 15px; border-radius: 15px; font-weight: 600; }

                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
            </style>
        `;

        let recordsHTML = this.records.map(r => `
            <div class="em-card">
                <div class="em-card-header">
                    <div class="em-card-date">${r.date.split('-').reverse().join('.')}</div>
                    <div class="em-card-actions">
                        <span class="material-icons-outlined" onclick="EmotionDiary.editRecord(${r.id})">edit</span>
                        <span class="material-icons-outlined" style="color:#FF3B30" onclick="EmotionDiary.deleteRecord(${r.id})">delete</span>
                    </div>
                </div>
                <div class="em-field-label">Ситуация:</div>
                <div class="em-field-text">${r.situation}</div>
                <div class="em-field-label">Эмоции:</div>
                <div class="em-field-text">${r.emotions}</div>
                <div class="em-field-label">Мысли:</div>
                <div class="em-field-text">${r.thoughts}</div>
                <div class="em-field-label">Поведение:</div>
                <div class="em-field-text">${r.behavior}</div>
                <div class="em-field-label em-alt-text">Альтернатива:</div>
                <div class="em-field-text em-alt-text">${r.alternative}</div>
            </div>
        `).join('');

        const modalHTML = this.editingId ? `
            <div class="em-modal">
                <div class="em-modal-content">
                    <h2 style="margin-top:0">${this.editingId === 'new' ? 'Новая запись СМЭР' : 'Редактировать СМЭР'}</h2>
                    <form id="em-form">
                        <div class="em-form-group">
                            <label class="em-form-label">Дата:</label>
                            <input type="date" name="em_date" class="em-input" value="${this.editingId === 'new' ? new Date().toISOString().split('T')[0] : this.records.find(r => r.id === this.editingId).date}">
                        </div>
                        <div class="em-form-group">
                            <label class="em-form-label">1. Ситуация:</label>
                            <textarea name="em_sit" class="em-textarea">${this.editingId === 'new' ? '' : this.records.find(r => r.id === this.editingId).situation}</textarea>
                        </div>
                        <div class="em-form-group">
                            <label class="em-form-label">2. Эмоции:</label>
                            <textarea name="em_emo" class="em-textarea">${this.editingId === 'new' ? '' : this.records.find(r => r.id === this.editingId).emotions}</textarea>
                        </div>
                        <div class="em-form-group">
                            <label class="em-form-label">3. Мысли:</label>
                            <textarea name="em_thou" class="em-textarea">${this.editingId === 'new' ? '' : this.records.find(r => r.id === this.editingId).thoughts}</textarea>
                        </div>
                        <div class="em-form-group">
                            <label class="em-form-label">4. Поведение:</label>
                            <textarea name="em_beh" class="em-textarea">${this.editingId === 'new' ? '' : this.records.find(r => r.id === this.editingId).behavior}</textarea>
                        </div>
                        <div class="em-form-group">
                            <label class="em-form-label">5. Альтернатива:</label>
                            <textarea name="em_alt" class="em-textarea" style="color: #34C759">${this.editingId === 'new' ? '' : this.records.find(r => r.id === this.editingId).alternative}</textarea>
                        </div>
                        <div class="em-modal-btns">
                            <button type="button" class="em-btn-cancel" onclick="EmotionDiary.editingId = null; EmotionDiary.render()">Отмена</button>
                            <button type="button" class="em-btn-save" onclick="EmotionDiary.submitForm()">Сохранить</button>
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

                <div class="em-add-placeholder" onclick="EmotionDiary.addRecord()">
                    <span class="material-icons-outlined" style="font-size: 40px">add</span>
                    <span>Добавить запись</span>
                </div>
            </div>
            ${modalHTML}
        `;
    }
};

window.EmotionDiary = EmotionDiary;

export function render() {
    EmotionDiary.init();
}
