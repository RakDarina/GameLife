/* ==========================================
   МОДУЛЬ: ЛИЧНЫЙ ДНЕВНИК И НАСТРОЕНИЕ (diary.js)
   ========================================== */

const DiaryModule = {
    // Хранение данных: настроения и текстовые записи
    moodData: JSON.parse(localStorage.getItem('GL_Mood_Data')) || {},
    notesData: JSON.parse(localStorage.getItem('GL_Notes_Data')) || [],
    
    // Состояние экрана
    currentView: 'main', // 'main' или 'stats'
    viewMonth: new Date().getMonth(),
    viewYear: new Date().getFullYear(),
    
    // Для модалок
    editingMoodDate: null,
    editingNoteId: null,

    moodConfig: {
        'super': { icon: 'sentiment_very_satisfied', color: '#34C759', label: 'Супер' },
        'good': { icon: 'sentiment_satisfied', color: '#A7C957', label: 'Хорошо' },
        'norm': { icon: 'sentiment_neutral', color: '#007AFF', label: 'Норм' },
        'bad': { icon: 'sentiment_dissatisfied', color: '#FF9500', label: 'Плохо' },
        'awful': { icon: 'sentiment_very_dissatisfied', color: '#FF3B30', label: 'Ужасно' }
    },

    init: function() {
        this.render();
    },

    save: function() {
        localStorage.setItem('GL_Mood_Data', JSON.stringify(this.moodData));
        localStorage.setItem('GL_Notes_Data', JSON.stringify(this.notesData));
        this.render();
    },

    // --- ЛОГИКА НАСТРОЕНИЯ ---
    openMoodModal: function(date = new Date().toISOString().split('T')[0]) {
        this.editingMoodDate = date;
        this.render();
    },

    saveMood: function() {
        const form = document.getElementById('dr-mood-form');
        const selectedMood = document.querySelector('.dr-mood-opt.active')?.dataset.type;
        const note = form.mood_note.value;
        const date = form.mood_date.value;

        if (selectedMood) {
            this.moodData[date] = { type: selectedMood, note: note };
            this.editingMoodDate = null;
            this.save();
        }
    },

    deleteMood: function(date) {
        if (confirm('Удалить запись о настроении?')) {
            delete this.moodData[date];
            this.editingMoodDate = null;
            this.save();
        }
    },

    // --- ЛОГИКА ЗАПИСЕЙ ДНЕВНИКА ---
    openNoteModal: function(id = null) {
        this.editingNoteId = id;
        this.render();
    },

    saveNote: function() {
        const form = document.getElementById('dr-note-form');
        const date = form.note_date.value;
        const text = form.note_text.value;

        if (!text.trim()) return;

        if (this.editingNoteId === 'new') {
            this.notesData.unshift({ id: Date.now(), date, text });
        } else {
            const idx = this.notesData.findIndex(n => n.id == this.editingNoteId);
            if (idx !== -1) {
                this.notesData[idx].date = date;
                this.notesData[idx].text = text;
            }
        }
        this.editingNoteId = null;
        this.save();
    },

    deleteNote: function(id) {
        if (confirm('Удалить эту запись?')) {
            this.notesData = this.notesData.filter(n => n.id != id);
            this.save();
        }
    },

    // --- РЕНДЕРИНГ ---
    render: function() {
        const app = document.getElementById('app-viewport');
        
        const styles = `
            <style>
                .dr-container { animation: fadeIn 0.3s; padding-bottom: 100px; color: #1C1C1E; }
                .dr-card { background: white; border-radius: 25px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
                
                /* Блок настроения */
                .dr-mood-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                .dr-mood-empty { 
                    border: 2px dashed #E5E5EA; border-radius: 20px; padding: 30px; 
                    text-align: center; color: #8E8E93; cursor: pointer;
                }
                .dr-mood-active { text-align: center; }
                .dr-mood-icon-large { font-size: 64px; margin-bottom: 10px; }
                
                /* Список записей */
                .dr-note-item { background: white; border-radius: 20px; padding: 15px; margin-bottom: 12px; position: relative; }
                .dr-note-date { font-size: 13px; color: #8E8E93; font-weight: 600; margin-bottom: 5px; }
                .dr-note-text { font-size: 16px; line-height: 1.5; white-space: pre-wrap; }

                /* Модальные окна */
                .dr-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 3000; display: flex; align-items: flex-end; }
                .dr-modal-content { 
                    background: white; width: 100%; max-height: 90vh; 
                    border-radius: 30px 30px 0 0; padding: 25px; overflow-y: auto; box-sizing: border-box;
                }
                
                .dr-input-group { background: #F2F2F7; border-radius: 15px; padding: 12px; margin-bottom: 15px; }
                .dr-label { font-size: 12px; color: #8E8E93; font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 5px; }
                .dr-field { 
                    width: 100%; border: none; background: transparent; font-size: 17px; 
                    font-family: inherit; outline: none; resize: none; padding: 0;
                }
                
                /* Сетка настроений */
                .dr-mood-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin: 20px 0; }
                .dr-mood-opt { text-align: center; opacity: 0.4; transition: 0.2s; }
                .dr-mood-opt.active { opacity: 1; transform: scale(1.1); }
                .dr-mood-opt span { font-size: 32px; display: block; }
                .dr-mood-opt label { font-size: 10px; font-weight: 700; }

                .dr-btn-primary { 
                    background: #007AFF; color: white; border: none; width: 100%; 
                    padding: 18px; border-radius: 18px; font-weight: 700; font-size: 17px; 
                }
                
                /* Статистика */
                .dr-dot-year { display: grid; grid-template-columns: repeat(13, 1fr); gap: 4px; margin-top: 15px; }
                .dr-dot { width: 100%; aspect-ratio: 1; border-radius: 4px; background: #F2F2F7; }
                .dr-stats-chart { width: 180px; height: 180px; border-radius: 50%; margin: 20px auto; position: relative; display: flex; align-items: center; justify-content: center; }
            </style>
        `;

        if (this.currentView === 'stats') {
            app.innerHTML = styles + this.renderStatsView();
        } else {
            app.innerHTML = styles + this.renderMainView();
        }

        this.initAutoResize();
    },

    renderMainView: function() {
        const today = new Date().toISOString().split('T')[0];
        const mood = this.moodData[today];
        
        const filteredNotes = this.notesData.filter(n => {
            const d = new Date(n.date);
            return d.getMonth() === this.viewMonth && d.getFullYear() === this.viewYear;
        }).sort((a,b) => b.date.localeCompare(a.date));

        const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

        return `
            <div class="dr-container">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding: 0 5px;">
                    <h1 style="margin:0; font-size:28px; font-weight:800;">Дневник</h1>
                    <span class="material-icons-outlined" style="color:#8E8E93">settings</span>
                </div>

                <div class="dr-card">
                    <div class="dr-mood-header">
                        <span style="font-weight:700; font-size:18px;">Мое настроение</span>
                        <div style="color:#007AFF; font-weight:700; display:flex; align-items:center;" onclick="DiaryModule.currentView='stats'; DiaryModule.render()">
                            <span class="material-icons-outlined" style="font-size:18px; margin-right:4px;">bar_chart</span> График
                        </div>
                    </div>

                    ${mood ? `
                        <div class="dr-mood-active">
                            <span class="material-icons" style="color:${this.moodConfig[mood.type].color}; font-size:60px;">${this.moodConfig[mood.type].icon}</span>
                            <div style="font-weight:800; font-size:20px; color:${this.moodConfig[mood.type].color}">${this.moodConfig[mood.type].label}</div>
                            <div style="margin-top:10px; color:#8E8E93; font-style:italic;">${mood.note || ''}</div>
                            <div style="margin-top:15px; display:flex; justify-content:center; gap:20px; color:#007AFF; font-size:14px; font-weight:600;">
                                <span onclick="DiaryModule.openMoodModal('${today}')">Изменить</span>
                                <span style="color:#FF3B30" onclick="DiaryModule.deleteMood('${today}')">Удалить</span>
                            </div>
                        </div>
                    ` : `
                        <div class="dr-mood-empty" onclick="DiaryModule.openMoodModal()">
                            <span class="material-icons-outlined" style="font-size:32px; margin-bottom:8px; display:block;">add_reaction</span>
                            Отметить настроение
                        </div>
                    `}
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; padding:0 10px;">
                    <h2 style="margin:0; font-size:20px; font-weight:800;">Записи</h2>
                    <div style="display:flex; align-items:center; gap:10px; font-weight:700; color:#8E8E93;">
                        <span class="material-icons" onclick="DiaryModule.changeMonth(-1)">chevron_left</span>
                        <span style="min-width:100px; text-align:center; color:#1C1C1E">${months[this.viewMonth]} ${this.viewYear}</span>
                        <span class="material-icons" onclick="DiaryModule.changeMonth(1)">chevron_right</span>
                    </div>
                </div>

                <div class="dr-mood-empty" style="padding:20px; margin-bottom:20px;" onclick="DiaryModule.openNoteModal('new')">
                    <span class="material-icons-outlined" style="vertical-align:middle; margin-right:5px;">edit</span> Новая запись
                </div>

                <div class="dr-notes-list">
                    ${filteredNotes.map(n => `
                        <div class="dr-note-item" onclick="DiaryModule.openNoteModal(${n.id})">
                            <div class="dr-note-date">${new Date(n.date).toLocaleDateString('ru-RU', {day:'numeric', month:'long'})}</div>
                            <div class="dr-note-text">${n.text}</div>
                        </div>
                    `).join('') || '<div style="text-align:center; color:#8E8E93; padding:40px;">В этом месяце еще нет записей</div>'}
                </div>
            </div>

            ${this.editingMoodDate ? this.getMoodModalHTML() : ''}
            ${this.editingNoteId ? this.getNoteModalHTML() : ''}
        `;
    },

    renderStatsView: function() {
        // Простая статистика по настроениям (за текущий месяц)
        const stats = { super:0, good:0, norm:0, bad:0, awful:0 };
        Object.values(this.moodData).forEach(m => stats[m.type]++);
        const total = Object.values(this.moodData).length || 1;

        return `
            <div class="dr-container">
                <div style="display:flex; align-items:center; margin-bottom:25px;">
                    <span class="material-icons" style="font-size:32px; color:#007AFF;" onclick="DiaryModule.currentView='main'; DiaryModule.render()">chevron_left</span>
                    <h1 style="margin:0; font-size:22px; font-weight:800; margin-left:10px;">Статистика настроения</h1>
                </div>

                <div class="dr-card">
                    <div style="font-weight:800; margin-bottom:15px;">Настроение за месяц</div>
                    <div class="dr-stats-chart" style="background: conic-gradient(
                        #34C759 0% ${(stats.super/total)*100}%, 
                        #A7C957 ${(stats.super/total)*100}% ${((stats.super+stats.good)/total)*100}%,
                        #007AFF ${((stats.super+stats.good)/total)*100}% ${((stats.super+stats.good+stats.norm)/total)*100}%,
                        #FF9500 ${((stats.super+stats.good+stats.norm)/total)*100}% ${((stats.super+stats.good+stats.norm+stats.bad)/total)*100}%,
                        #FF3B30 ${((stats.super+stats.good+stats.norm+stats.bad)/total)*100}% 100%
                    );">
                        <div style="width:120px; height:120px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-direction:column;">
                            <span style="font-size:24px; font-weight:800;">${total === 1 && !this.moodData[Object.keys(this.moodData)[0]] ? 0 : total}</span>
                            <span style="font-size:10px; color:#8E8E93; font-weight:700;">ВСЕГО</span>
                        </div>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:10px;">
                        ${Object.entries(this.moodConfig).map(([key, cfg]) => `
                            <div style="display:flex; align-items:center; font-size:12px; font-weight:600;">
                                <div style="width:12px; height:12px; background:${cfg.color}; border-radius:3px; margin-right:8px;"></div>
                                ${cfg.label}: ${stats[key]}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="dr-card">
                    <div style="font-weight:800;">Год в точках (2026)</div>
                    <div class="dr-dot-year">
                        <div></div> ${['Я','Ф','М','А','М','И','И','А','С','О','Н','Д'].map(m => `<div style="font-size:9px; color:#8E8E93; text-align:center; font-weight:700;">${m}</div>`).join('')}
                        ${Array.from({length: 31}, (_, i) => {
                            let row = `<div style="font-size:9px; color:#C7C7CC; align-self:center;">${i+1}</div>`;
                            for(let m=0; m<12; m++) {
                                const dStr = `2026-${String(m+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;
                                const mData = this.moodData[dStr];
                                const color = mData ? this.moodConfig[mData.type].color : '#F2F2F7';
                                row += `<div class="dr-dot" style="background:${color}"></div>`;
                            }
                            return row;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    // --- МОДАЛКИ (HTML) ---
    getMoodModalHTML: function() {
        const date = this.editingMoodDate;
        const existing = this.moodData[date];
        return `
            <div class="dr-modal" onclick="DiaryModule.editingMoodDate=null; DiaryModule.render()">
                <div class="dr-modal-content" onclick="event.stopPropagation()">
                    <div style="text-align:center; font-weight:800; font-size:18px; margin-bottom:20px;">Как вы себя чувствуете?</div>
                    <form id="dr-mood-form">
                        <div class="dr-input-group">
                            <label class="dr-label">Дата</label>
                            <input type="date" name="mood_date" class="dr-field" value="${date}">
                        </div>

                        <div class="dr-mood-grid">
                            ${Object.entries(this.moodConfig).map(([key, cfg]) => `
                                <div class="dr-mood-opt ${existing?.type === key ? 'active' : ''}" data-type="${key}" onclick="document.querySelectorAll('.dr-mood-opt').forEach(o=>o.classList.remove('active')); this.classList.add('active')">
                                    <span class="material-icons" style="color:${cfg.color}">${cfg.icon}</span>
                                    <label>${cfg.label}</label>
                                </div>
                            `).join('')}
                        </div>

                        <div class="dr-input-group">
                            <label class="dr-label">Короткая заметка (необязательно)</label>
                            <textarea name="mood_note" class="dr-field" rows="2" placeholder="Что на душе?">${existing?.note || ''}</textarea>
                        </div>

                        <div style="display:flex; gap:10px; margin-top:20px;">
                            <button type="button" class="dr-btn-primary" style="background:#F2F2F7; color:#1C1C1E;" onclick="DiaryModule.editingMoodDate=null; DiaryModule.render()">Отмена</button>
                            ${existing ? `<button type="button" class="dr-btn-primary" style="background:#FF3B30;" onclick="DiaryModule.deleteMood('${date}')">Удалить</button>` : ''}
                            <button type="button" class="dr-btn-primary" onclick="DiaryModule.saveMood()">Сохранить</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    getNoteModalHTML: function() {
        const note = this.editingNoteId === 'new' ? null : this.notesData.find(n => n.id == this.editingNoteId);
        const today = new Date().toISOString().split('T')[0];
        
        return `
            <div class="dr-modal" onclick="DiaryModule.editingNoteId=null; DiaryModule.render()">
                <div class="dr-modal-content" onclick="event.stopPropagation()">
                    <div style="text-align:center; font-weight:800; font-size:18px; margin-bottom:20px;">Запись в дневник</div>
                    <form id="dr-note-form">
                        <div class="dr-input-group">
                            <label class="dr-label">Дата</label>
                            <input type="date" name="note_date" class="dr-field" value="${note ? note.date : today}">
                        </div>

                        <div class="dr-input-group">
                            <label class="dr-label">Что произошло сегодня?</label>
                            <textarea name="note_text" class="dr-field" rows="5" placeholder="Начни писать...">${note ? note.text : ''}</textarea>
                        </div>

                        <div style="display:flex; gap:10px; margin-top:20px;">
                            <button type="button" class="dr-btn-primary" style="background:#F2F2F7; color:#1C1C1E;" onclick="DiaryModule.editingNoteId=null; DiaryModule.render()">Отмена</button>
                            ${note ? `<button type="button" class="dr-btn-primary" style="background:#FFEBEB; color:#FF3B30;" onclick="DiaryModule.deleteNote(${note.id})">Удалить</button>` : ''}
                            <button type="button" class="dr-btn-primary" onclick="DiaryModule.saveNote()">Сохранить</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
    changeMonth: function(dir) {
        this.viewMonth += dir;
        if (this.viewMonth > 11) { this.viewMonth = 0; this.viewYear++; }
        if (this.viewMonth < 0) { this.viewMonth = 11; this.viewYear--; }
        this.render();
    },

    initAutoResize: function() {
        const textareas = document.querySelectorAll('.dr-field');
        textareas.forEach(el => {
            el.style.height = 'auto';
            el.style.height = (el.scrollHeight) + 'px';
            el.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
        });
    }
};

// Экспорт для системы
window.DiaryModule = DiaryModule;
export function render() { DiaryModule.init(); }
