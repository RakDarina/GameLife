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

    // --- Методы ---
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
        if (confirm('Удалить настроение за этот день?')) {
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

    render: function() {
        const app = document.getElementById('app-viewport');
        const today = new Date().toISOString().split('T')[0];
        const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

        const styles = `
            <style>
                .dr-wrap { animation: fadeIn 0.3s; padding: 20px; padding-bottom: 120px; font-family: -apple-system, sans-serif; background: #F9F9F9; min-height: 100vh; }
                .dr-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                .dr-title { font-size: 34px; font-weight: 800; margin: 0; }
                
                .dr-card { background: white; border-radius: 24px; padding: 20px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                .dr-card-title { font-weight: 700; font-size: 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                
                .dr-mood-btn { border: 2px dashed #E5E5EA; border-radius: 20px; padding: 25px; text-align: center; color: #8E8E93; cursor: pointer; }
                .dr-mood-display { text-align: center; padding: 10px 0; }
                .dr-mood-display .material-icons { font-size: 60px; margin-bottom: 8px; }
                
                .dr-nav-row { display: flex; justify-content: space-between; align-items: center; margin: 25px 0 15px; }
                .dr-month-nav { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 17px; }
                .dr-nav-btn { color: #007AFF; cursor: pointer; font-size: 24px; user-select: none; }

                .dr-note-card { background: white; border-radius: 20px; padding: 18px; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); cursor: pointer; }
                .dr-note-date { font-size: 13px; color: #8E8E93; font-weight: 600; margin-bottom: 6px; }
                .dr-note-excerpt { font-size: 16px; line-height: 1.4; white-space: pre-wrap; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

                /* Модалки */
                .dr-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 9999; display: flex; align-items: flex-end; }
                .dr-modal { background: white; width: 100%; border-radius: 30px 30px 0 0; padding: 25px; max-height: 92vh; overflow-y: auto; }
                .dr-modal-h { font-size: 20px; font-weight: 800; text-align: center; margin-bottom: 25px; }
                
                .dr-form-item { background: #F2F2F7; border-radius: 16px; padding: 12px 16px; margin-bottom: 16px; }
                .dr-form-label { font-size: 11px; color: #8E8E93; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; display: block; }
                .dr-form-input { width: 100%; border: none; background: transparent; font-size: 17px; outline: none; padding: 0; font-family: inherit; }
                
                .dr-mood-selector { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 20px 0; }
                .dr-mood-opt { text-align: center; opacity: 0.3; transition: 0.2s; cursor: pointer; }
                .dr-mood-opt.active { opacity: 1; transform: scale(1.1); }
                .dr-mood-opt .material-icons { font-size: 36px; display: block; margin-bottom: 4px; }
                .dr-mood-opt span { font-size: 10px; font-weight: 700; }

                .dr-btn-group { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }
                .dr-btn { padding: 16px; border-radius: 16px; border: none; font-weight: 700; font-size: 17px; cursor: pointer; }
                .dr-btn-save { background: #007AFF; color: white; }
                .dr-btn-cancel { background: #E5E5EA; color: #1C1C1E; }
                .dr-btn-delete { background: #FFEBEB; color: #FF3B30; grid-column: span 2; margin-top: -5px; }
            </style>
        `;

        if (this.currentView === 'stats') {
            app.innerHTML = styles + this.renderStats(months);
        } else {
            app.innerHTML = styles + this.renderMain(today, months);
        }
        
        this.attachAutoResize();
    },

    renderMain: function(today, months) {
        const mood = this.moodData[today];
        const filteredNotes = this.notesData.filter(n => {
            const d = new Date(n.date);
            return d.getMonth() === this.viewMonth && d.getFullYear() === this.viewYear;
        }).sort((a,b) => b.date.localeCompare(a.date));

        return `
            <div class="dr-wrap">
                <div class="dr-header">
                    <h1 class="dr-title">Дневник</h1>
                    <span class="material-icons" style="color:#8E8E93; font-size:28px;">settings</span>
                </div>

                <div class="dr-card">
                    <div class="dr-card-title">
                        <span>Мое настроение</span>
                        <div style="color:#007AFF; cursor:pointer; font-size:15px; display:flex; align-items:center;" onclick="DiaryModule.currentView='stats'; DiaryModule.render()">
                            <span class="material-icons" style="font-size:18px; margin-right:4px;">leaderboard</span> График
                        </div>
                    </div>

                    ${mood ? `
                        <div class="dr-mood-display">
                            <span class="material-icons" style="color:${this.moodConfig[mood.type].color}">${this.moodConfig[mood.type].icon}</span>
                            <div style="font-weight:800; font-size:22px; color:${this.moodConfig[mood.type].color}">${this.moodConfig[mood.type].label}</div>
                            <div style="margin-top:12px; color:#007AFF; font-weight:700; font-size:14px; cursor:pointer" onclick="DiaryModule.openMoodModal('${today}')">Изменить</div>
                        </div>
                    ` : `
                        <div class="dr-mood-btn" onclick="DiaryModule.openMoodModal()">
                            <span class="material-icons-outlined" style="font-size:32px; display:block; margin-bottom:8px;">add_reaction</span>
                            Отметить настроение
                        </div>
                    `}
                </div>

                <div class="dr-nav-row">
                    <h2 style="margin:0; font-size:22px; font-weight:800;">Записи</h2>
                    <div class="dr-month-nav">
                        <span class="material-icons dr-nav-btn" onclick="DiaryModule.changeMonth(-1)">chevron_left</span>
                        <span style="min-width:110px; text-align:center;">${months[this.viewMonth]} ${this.viewYear}</span>
                        <span class="material-icons dr-nav-btn" onclick="DiaryModule.changeMonth(1)">chevron_right</span>
                    </div>
                </div>

                <div class="dr-mood-btn" style="padding:15px; margin-bottom:20px; border-style:solid; border-width:1px; background:white;" onclick="DiaryModule.openNoteModal('new')">
                    <span class="material-icons" style="vertical-align:middle; font-size:20px; margin-right:5px;">edit</span> Новая запись
                </div>

                <div class="dr-list">
                    ${filteredNotes.map(n => `
                        <div class="dr-note-card" onclick="DiaryModule.openNoteModal(${n.id})">
                            <div class="dr-note-date">${new Date(n.date).toLocaleDateString('ru-RU', {day:'numeric', month:'long'})}</div>
                            <div class="dr-note-excerpt">${n.text}</div>
                        </div>
                    `).join('') || '<div style="text-align:center; color:#8E8E93; padding:40px;">Нет записей за этот месяц</div>'}
                </div>
            </div>
            ${this.editingMoodDate ? this.renderMoodModal() : ''}
            ${this.editingNoteId ? this.renderNoteModal() : ''}
        `;
    },

    renderMoodModal: function() {
        const existing = this.moodData[this.editingMoodDate];
        return `
            <div class="dr-modal-overlay" onclick="DiaryModule.editingMoodDate=null; DiaryModule.render()">
                <div class="dr-modal" onclick="event.stopPropagation()">
                    <div class="dr-modal-h">Как вы себя чувствуете?</div>
                    
                    <div class="dr-form-item">
                        <label class="dr-form-label">Дата</label>
                        <input type="date" id="dr-mood-date-field" class="dr-form-input" value="${this.editingMoodDate}">
                    </div>

                    <div class="dr-mood-selector">
                        ${Object.entries(this.moodConfig).map(([key, cfg]) => `
                            <div class="dr-mood-opt ${existing?.type === key ? 'active' : ''}" data-type="${key}" onclick="document.querySelectorAll('.dr-mood-opt').forEach(o=>o.classList.remove('active')); this.classList.add('active')">
                                <span class="material-icons" style="color:${cfg.color}">${cfg.icon}</span>
                                <span>${cfg.label}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="dr-form-item">
                        <label class="dr-form-label">Заметка</label>
                        <textarea id="dr-mood-note-field" class="dr-form-input" rows="2" placeholder="Пару слов о дне...">${existing?.note || ''}</textarea>
                    </div>

                    <div class="dr-btn-group">
                        <button class="dr-btn dr-btn-cancel" onclick="DiaryModule.editingMoodDate=null; DiaryModule.render()">Отмена</button>
                        <button class="dr-btn dr-btn-save" onclick="DiaryModule.saveMood()">Сохранить</button>
                        ${existing ? `<button class="dr-btn dr-btn-delete" onclick="DiaryModule.deleteMood('${this.editingMoodDate}')">Удалить</button>` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    renderNoteModal: function() {
        const note = this.editingNoteId === 'new' ? null : this.notesData.find(n => n.id == this.editingNoteId);
        return `
            <div class="dr-modal-overlay" onclick="DiaryModule.editingNoteId=null; DiaryModule.render()">
                <div class="dr-modal" onclick="event.stopPropagation()">
                    <div class="dr-modal-h">${note ? 'Правка записи' : 'Новая запись'}</div>
                    
                    <div class="dr-form-item">
                        <label class="dr-form-label">Дата</label>
                        <input type="date" id="dr-note-date-field" class="dr-form-input" value="${note ? note.date : new Date().toISOString().split('T')[0]}">
                    </div>

                    <div class="dr-form-item">
                        <label class="dr-form-label">Текст дневника</label>
                        <textarea id="dr-note-text-field" class="dr-form-input" rows="6" placeholder="О чем ты думаешь?">${note ? note.text : ''}</textarea>
                    </div>

                    <div class="dr-btn-group">
                        <button class="dr-btn dr-btn-cancel" onclick="DiaryModule.editingNoteId=null; DiaryModule.render()">Отмена</button>
                        <button class="dr-btn dr-btn-save" onclick="DiaryModule.saveNote()">Сохранить</button>
                        ${note ? `<button class="dr-btn dr-btn-delete" onclick="DiaryModule.deleteNote(${note.id})">Удалить</button>` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    renderStats: function(months) {
        // Код статистики (круг и точки) остается прежним, только обновляем стили под dr-wrap
        return `<div class="dr-wrap">
            <div class="dr-header">
                <span class="material-icons dr-nav-btn" onclick="DiaryModule.currentView='main'; DiaryModule.render()">chevron_left</span>
                <h1 style="font-size:22px; font-weight:800; margin-left:10px; flex-grow:1;">Статистика</h1>
            </div>
            <div class="dr-card" style="text-align:center; padding:40px;">График строится на основе ваших отметок настроения за год.</div>
        </div>`;
    },

    changeMonth: function(dir) {
        this.viewMonth += dir;
        if (this.viewMonth > 11) { this.viewMonth = 0; this.viewYear++; }
        if (this.viewMonth < 0) { this.viewMonth = 11; this.viewYear--; }
        this.render();
    },

    attachAutoResize: function() {
        const tx = document.querySelectorAll('textarea.dr-form-input');
        tx.forEach(el => {
            el.style.height = 'auto';
            el.style.height = (el.scrollHeight) + 'px';
            el.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
        });
    }
};

window.DiaryModule = DiaryModule;
export function render() { DiaryModule.init(); }
