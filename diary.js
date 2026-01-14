/* ==========================================
   ОБНОВЛЕННЫЙ МОДУЛЬ: ДНЕВНИК (diary.js)
   ========================================== */

const DiaryModule = {
    moodData: JSON.parse(localStorage.getItem('GL_Mood_Data')) || {},
    notesData: JSON.parse(localStorage.getItem('GL_Notes_Data')) || [],
    currentView: 'main', 
    viewMonth: new Date().getMonth(),
    viewYear: new Date().getFullYear(),
    editingMoodDate: null,
    editingNoteId: null,

    moodConfig: {
        'super': { icon: 'sentiment_very_satisfied', color: '#34C759', label: 'Супер' },
        'good': { icon: 'sentiment_satisfied', color: '#A7C957', label: 'Хорошо' },
        'norm': { icon: 'sentiment_neutral', color: '#007AFF', label: 'Норм' },
        'bad': { icon: 'sentiment_dissatisfied', color: '#FF9500', label: 'Плохо' },
        'awful': { icon: 'sentiment_very_dissatisfied', color: '#FF3B30', label: 'Ужасно' }
    },

    init: function() { this.render(); },
    save: function() {
        localStorage.setItem('GL_Mood_Data', JSON.stringify(this.moodData));
        localStorage.setItem('GL_Notes_Data', JSON.stringify(this.notesData));
        this.render();
    },

    openMoodModal: function(date = new Date().toISOString().split('T')[0]) {
        this.editingMoodDate = date;
        this.render();
    },

    saveMood: function() {
        const selected = document.querySelector('.dr-mood-opt.active')?.dataset.type;
        const note = document.getElementById('dr-mood-note-field')?.value || '';
        const date = document.getElementById('dr-mood-date-field')?.value;
        if (selected && date) {
            this.moodData[date] = { type: selected, note: note };
            this.editingMoodDate = null;
            this.save();
        }
    },

    deleteMood: function(date) {
        if (confirm('Удалить настроение?')) {
            delete this.moodData[date];
            this.editingMoodDate = null;
            this.save();
        }
    },

    openNoteModal: function(id = null) {
        this.editingNoteId = id;
        this.render();
    },

    saveNote: function() {
        const date = document.getElementById('dr-note-date-field').value;
        const text = document.getElementById('dr-note-text-field').value;
        if (!text.trim()) return;
        if (this.editingNoteId === 'new') {
            this.notesData.unshift({ id: Date.now(), date, text });
        } else {
            const idx = this.notesData.findIndex(n => n.id == this.editingNoteId);
            if (idx !== -1) { Object.assign(this.notesData[idx], { date, text }); }
        }
        this.editingNoteId = null;
        this.save();
    },

    deleteNote: function(id) {
        if (confirm('Удалить запись?')) {
            this.notesData = this.notesData.filter(n => n.id != id);
            this.save();
        }
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const today = new Date().toISOString().split('T')[0];
        const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

        const styles = `
            <style>
                .dr-wrap { animation: fadeIn 0.3s; padding-top: 10px; }
                .dr-card { background: white; border-radius: 25px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
                .dr-card-title { font-weight: 800; font-size: 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                
                .dr-mood-btn { border: 2px dashed #E5E5EA; border-radius: 20px; padding: 30px; text-align: center; color: #8E8E93; cursor: pointer; }
                .dr-mood-active { text-align: center; padding: 10px 0; }
                .dr-mood-active .material-icons { font-size: 64px; display: block; margin: 0 auto 10px; }

                .dr-nav-row { display: flex; justify-content: space-between; align-items: center; margin: 30px 0 15px; padding: 0 5px; }
                .dr-month-display { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 17px; }

                .dr-note-item { background: white; border-radius: 22px; padding: 18px; margin-bottom: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
                .dr-note-date { font-size: 12px; color: #8E8E93; font-weight: 700; margin-bottom: 5px; text-transform: uppercase; }
                .dr-note-text { font-size: 16px; line-height: 1.5; white-space: pre-wrap; }

                /* Модалки */
                .dr-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 2000; display: flex; align-items: flex-end; }
                .dr-modal-content { background: #F2F2F7; width: 100%; border-radius: 30px 30px 0 0; padding: 25px; max-height: 90vh; overflow-y: auto; box-sizing: border-box; }
                
                .dr-input-block { background: white; border-radius: 18px; padding: 15px; margin-bottom: 15px; }
                .dr-label { font-size: 11px; color: #8E8E93; font-weight: 800; margin-bottom: 6px; display: block; }
                .dr-input { width: 100%; border: none; background: transparent; font-size: 17px; outline: none; font-family: inherit; resize: none; }
                
                .dr-mood-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin: 20px 0; }
                .dr-mood-opt { text-align: center; opacity: 0.3; transition: 0.2s; }
                .dr-mood-opt.active { opacity: 1; transform: scale(1.1); }
                .dr-mood-opt .material-icons { font-size: 36px; display: block; }

                .dr-save-btn { background: #5856D6; color: white; border: none; width: 100%; padding: 18px; border-radius: 18px; font-weight: 700; font-size: 17px; margin-top: 10px; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        if (this.currentView === 'stats') {
            app.innerHTML = styles + this.renderStats();
        } else {
            app.innerHTML = styles + this.renderMain(today, months);
        }
        this.initTextAreas();
    },

    renderMain: function(today, months) {
        const mood = this.moodData[today];
        const filteredNotes = this.notesData.filter(n => {
            const d = new Date(n.date);
            return d.getMonth() === this.viewMonth && d.getFullYear() === this.viewYear;
        }).sort((a,b) => b.date.localeCompare(a.date));

        return `
            <div class="dr-wrap">
                <div class="dr-card">
                    <div class="dr-card-title">
                        <span>Настроение сегодня</span>
                        <div style="color:#5856D6; font-size:14px;" onclick="DiaryModule.currentView='stats'; DiaryModule.render()">График</div>
                    </div>
                    ${mood ? `
                        <div class="dr-mood-active" onclick="DiaryModule.openMoodModal('${today}')">
                            <span class="material-icons" style="color:${this.moodConfig[mood.type].color}">${this.moodConfig[mood.type].icon}</span>
                            <div style="font-weight:800; font-size:20px;">${this.moodConfig[mood.type].label}</div>
                            ${mood.note ? `<div style="color:#8E8E93; margin-top:5px;">${mood.note}</div>` : ''}
                        </div>
                    ` : `
                        <div class="dr-mood-btn" onclick="DiaryModule.openMoodModal()">
                            <span class="material-icons-outlined" style="font-size:30px;">add_reaction</span>
                            <div style="font-size:14px; margin-top:8px; font-weight:600;">Отметить настроение</div>
                        </div>
                    `}
                </div>

                <div class="dr-nav-row">
                    <span style="font-weight:900; font-size:22px;">Дневник</span>
                    <div class="dr-month-display">
                        <span class="material-icons-outlined" onclick="DiaryModule.changeMonth(-1)">chevron_left</span>
                        <span style="min-width:110px; text-align:center;">${months[this.viewMonth]}</span>
                        <span class="material-icons-outlined" onclick="DiaryModule.changeMonth(1)">chevron_right</span>
                    </div>
                </div>

                <div class="dr-note-item" style="text-align:center; border: 1px solid #E5E5EA; background: transparent; box-shadow: none;" onclick="DiaryModule.openNoteModal('new')">
                    <span style="font-weight:700; color:#5856D6;">+ Новая запись</span>
                </div>

                ${filteredNotes.map(n => `
                    <div class="dr-note-item" onclick="DiaryModule.openNoteModal(${n.id})">
                        <div class="dr-note-date">${new Date(n.date).toLocaleDateString('ru-RU', {day:'numeric', month:'long'})}</div>
                        <div class="dr-note-text">${n.text}</div>
                    </div>
                `).join('')}
            </div>

            ${this.editingMoodDate ? `
                <div class="dr-modal-bg" onclick="DiaryModule.editingMoodDate=null; DiaryModule.render()">
                    <div class="dr-modal-content" onclick="event.stopPropagation()">
                        <h3 style="text-align:center; margin-top:0;">Настроение</h3>
                        <div class="dr-input-block">
                            <label class="dr-label">Дата</label>
                            <input type="date" id="dr-mood-date-field" class="dr-input" value="${this.editingMoodDate}">
                        </div>
                        <div class="dr-mood-grid">
                            ${Object.entries(this.moodConfig).map(([key, cfg]) => `
                                <div class="dr-mood-opt ${this.moodData[this.editingMoodDate]?.type === key ? 'active' : ''}" data-type="${key}" onclick="document.querySelectorAll('.dr-mood-opt').forEach(o=>o.classList.remove('active')); this.classList.add('active')">
                                    <span class="material-icons" style="color:${cfg.color}">${cfg.icon}</span>
                                    <div style="font-size:10px; font-weight:700; margin-top:4px;">${cfg.label}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="dr-input-block">
                            <label class="dr-label">Заметка</label>
                            <textarea id="dr-mood-note-field" class="dr-input" rows="2" placeholder="Как прошел день?">${this.moodData[this.editingMoodDate]?.note || ''}</textarea>
                        </div>
                        <button class="dr-save-btn" onclick="DiaryModule.saveMood()">Сохранить</button>
                        ${this.moodData[this.editingMoodDate] ? `<div style="text-align:center; color:#FF3B30; margin-top:15px; font-weight:700;" onclick="DiaryModule.deleteMood('${this.editingMoodDate}')">Удалить</div>` : ''}
                    </div>
                </div>
            ` : ''}

            ${this.editingNoteId ? `
                <div class="dr-modal-bg" onclick="DiaryModule.editingNoteId=null; DiaryModule.render()">
                    <div class="dr-modal-content" onclick="event.stopPropagation()">
                        <h3 style="text-align:center; margin-top:0;">Новая запись</h3>
                        <div class="dr-input-block">
                            <label class="dr-label">Дата</label>
                            <input type="date" id="dr-note-date-field" class="dr-input" value="${this.editingNoteId === 'new' ? today : this.notesData.find(n => n.id == this.editingNoteId).date}">
                        </div>
                        <div class="dr-input-block">
                            <label class="dr-label">Текст</label>
                            <textarea id="dr-note-text-field" class="dr-input" rows="8" placeholder="Пиши здесь...">${this.editingNoteId === 'new' ? '' : this.notesData.find(n => n.id == this.editingNoteId).text}</textarea>
                        </div>
                        <button class="dr-save-btn" onclick="DiaryModule.saveNote()">Сохранить</button>
                        ${this.editingNoteId !== 'new' ? `<div style="text-align:center; color:#FF3B30; margin-top:15px; font-weight:700;" onclick="DiaryModule.deleteNote(${this.editingNoteId})">Удалить</div>` : ''}
                    </div>
                </div>
            ` : ''}
        `;
    },

    renderStats: function() {
        return `
            <div class="dr-wrap">
                <div style="display:flex; align-items:center; margin-bottom:20px;">
                    <span class="material-icons-outlined" onclick="DiaryModule.currentView='main'; DiaryModule.render()">chevron_left</span>
                    <span style="font-weight:800; font-size:20px; margin-left:10px;">Статистика</span>
                </div>
                <div class="dr-card" style="text-align:center; padding:50px 20px;">
                    тут будут графики...
                </div>
            </div>
        `;
    },

    changeMonth: function(dir) {
        this.viewMonth += dir;
        if (this.viewMonth > 11) { this.viewMonth = 0; this.viewYear++; }
        if (this.viewMonth < 0) { this.viewMonth = 11; this.viewYear--; }
        this.render();
    },

    initTextAreas: function() {
        document.querySelectorAll('textarea.dr-input').forEach(el => {
            el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px';
            el.addEventListener('input', function() { this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px'; });
        });
    }
};

window.DiaryModule = DiaryModule;
export function render() { DiaryModule.init(); }
