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
                .em-container { 
                    animation: fadeIn 0.3s; 
                    /* Эти две строки ниже — магия, которая нейтрализует паддинги из index.html */
                    margin-left: -20px; 
                    margin-right: -20px;
                    
                    padding: 0 20px 100px;
                    width: calc(100% + 40px); /* Расширяем обратно до краев экрана */
                    overflow-x: hidden;
                    box-sizing: border-box;
                    touch-action: pan-y; /* Запрет горизонтального сдвига */
                }
                
                .em-header { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; }
                .em-back-btn { color: #007AFF; cursor: pointer; font-size: 28px; }
                .em-title { font-size: 24px; font-weight: 800; flex: 1; text-align: center; margin-right: 40px; }

                .em-card { 
                    background: white; border-radius: 25px; padding: 20px; 
                    margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                    box-sizing: border-box;
                    width: 100%;
                }
                
                .em-field-text { font-size: 15px; margin-bottom: 10px; white-space: pre-wrap; color: #3A3A3C; line-height: 1.4; word-break: break-word; }

                .em-add-placeholder {
                    border: 2px dashed #C7C7CC; border-radius: 25px; padding: 30px;
                    display: flex; flex-direction: column; align-items: center; gap: 10px;
                    color: #8E8E93; cursor: pointer; box-sizing: border-box; width: 100%;
                }

                /* ФИКСИРОВАННАЯ МОДАЛКА */
                .em-modal {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.4); z-index: 2000; display: flex; align-items: flex-end;
                    touch-action: none;
                }
                .em-modal-content {
                    background: white; width: 100%; max-height: 90vh; 
                    border-radius: 30px 30px 0 0; padding: 25px; overflow-y: auto;
                    box-sizing: border-box;
                    animation: slideUp 0.3s ease-out;
                    touch-action: pan-y;
                }
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
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        let recordsHTML = this.records.map(r => `
            <div class="em-card">
                <div class="em-card-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <div style="color:#5856D6; font-weight:700;">${r.date.split('-').reverse().join('.')}</div>
                    <div style="display:flex; gap:15px; color:#8E8E93;">
                        <span class="material-icons-outlined" onclick="EmotionDiary.editRecord(${r.id})">edit</span>
                        <span class="material-icons-outlined" style="color:#FF3B30" onclick="EmotionDiary.deleteRecord(${r.id})">delete</span>
                    </div>
                </div>
                <div style="font-weight:800; font-size:15px;">Ситуация:</div><div class="em-field-text">${r.situation}</div>
                <div style="font-weight:800; font-size:15px;">Эмоции:</div><div class="em-field-text">${r.emotions}</div>
                <div style="font-weight:800; font-size:15px;">Мысли:</div><div class="em-field-text">${r.thoughts}</div>
                <div style="font-weight:800; font-size:15px;">Поведение:</div><div class="em-field-text">${r.behavior}</div>
                <div style="font-weight:800; font-size:15px; color:#34C759;">Альтернатива:</div><div class="em-field-text" style="color:#34C759;">${r.alternative}</div>
            </div>
        `).join('');

        const modalHTML = this.editingId ? `
            <div class="em-modal" onclick="if(event.target===this) { EmotionDiary.editingId = null; EmotionDiary.render(); }">
                <div class="em-modal-content" onclick="event.stopPropagation()">
                    <h2 style="margin-top:0">${this.editingId === 'new' ? 'Новая запись' : 'Редактировать'}</h2>
                    <form id="em-form">
                        <div style="margin-bottom: 20px;"><label style="display:block; font-weight:700; margin-bottom:8px;">Дата:</label>
                        <input type="date" name="em_date" class="em-input" value="${this.editingId === 'new' ? new Date().toISOString().split('T')[0] : this.records.find(r => r.id === this.editingId).date}"></div>
                        <div style="margin-bottom: 20px;"><label style="display:block; font-weight:700; margin-bottom:8px;">Ситуация:</label><textarea name="em_sit" class="em-textarea">${this.editingId === 'new' ? '' : this.records.find(r => r.id === this.editingId).situation}</textarea></div>
                        <div style="margin-bottom: 20px;"><label style="display:block; font-weight:700; margin-bottom:8px;">Эмоции:</label><textarea name="em_emo" class="em-textarea">${this.editingId === 'new' ? '' : this.records.find(r => r.id === this.editingId).emotions}</textarea></div>
                        <div style="margin-bottom: 20px;"><label style="display:block; font-weight:700; margin-bottom:8px;">Мысли:</label><textarea name="em_thou" class="em-textarea">${this.editingId === 'new' ? '' : this.records.find(r => r.id === this.editingId).thoughts}</textarea></div>
                        <div style="margin-bottom: 20px;"><label style="display:block; font-weight:700; margin-bottom:8px;">Поведение:</label><textarea name="em_beh" class="em-textarea">${this.editingId === 'new' ? '' : this.records.find(r => r.id === this.editingId).behavior}</textarea></div>
                        <div style="margin-bottom: 20px;"><label style="display:block; font-weight:700; margin-bottom:8px;">Альтернатива:</label><textarea name="em_alt" class="em-textarea" style="color: #34C759">${this.editingId === 'new' ? '' : this.records.find(r => r.id === this.editingId).alternative}</textarea></div>
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
export function render() { EmotionDiary.init(); }
