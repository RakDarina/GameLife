/* ==========================================
   МОДУЛЬ: ЕЖЕДНЕВНИК (daily.js)
   ========================================== */

const DailyPlanner = {
    // Хранилище: массив всех задач/событий
    // Типы: 'event' (календарь), 'task' (нижний список), 'week-plan', 'month-plan'
    data: JSON.parse(localStorage.getItem('GL_Daily_Data')) || [],
    
    // Состояние интерфейса
    view: 'main', // 'main', 'day-details', 'plan-list'
    currentDate: new Date(), // Для календаря
    selectedDateStr: null,   // Выбранный день в календаре (YYYY-MM-DD)
    activePlanType: null,    // 'week' или 'month' для экранов планов
    editingId: null,

    init: function() { this.render(); },

    save: function() {
        localStorage.setItem('GL_Daily_Data', JSON.stringify(this.data));
        this.render();
    },

    // --- ЛОГИКА КАЛЕНДАРЯ ---
    changeMonth: function(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.render();
    },

    // --- ЛОГИКА ЗАДАЧ (Calendar Events) ---
    addCalendarEvent: function() {
        const title = document.getElementById('dp-event-title').value;
        const repeat = document.getElementById('dp-event-repeat').value; // 'none', 'week', 'month'
        if (!title.trim()) return;

        const batchId = Date.now().toString(); // ID группы для повторов
        const baseDate = new Date(this.selectedDateStr);

        let eventsToAdd = [];
        
        // Генерируем события (если повтор - создаем на год вперед, ~12 или ~52 записи)
        // Это упрощает удаление конкретного дня и поиск
        let count = repeat === 'none' ? 1 : (repeat === 'week' ? 52 : 12);
        
        for (let i = 0; i < count; i++) {
            const d = new Date(baseDate);
            if (repeat === 'week') d.setDate(d.getDate() + (i * 7));
            if (repeat === 'month') d.setMonth(d.getMonth() + i);

            eventsToAdd.push({
                id: Date.now() + i,
                batchId: repeat === 'none' ? null : batchId,
                type: 'event',
                date: d.toISOString().split('T')[0],
                title: title,
                repeatRule: repeat
            });
        }

        this.data.push(...eventsToAdd);
        this.editingId = null;
        this.save();
    },

    deleteCalendarEvent: function(id, batchId, dateStr) {
        if (!batchId) {
            // Одиночная запись
            this.data = this.data.filter(i => i.id !== id);
            this.save();
            return;
        }

        // Если запись повторяющаяся
        if (confirm('Это повторяющееся событие.\nOK — Удалить это и БУДУЩИЕ\nОтмена — Удалить только ЭТО')) {
            // Удаляем это и будущие
            this.data = this.data.filter(i => !(i.batchId === batchId && i.date >= dateStr));
        } else {
            // Удаляем только это
            this.data = this.data.filter(i => i.id !== id);
        }
        this.save();
    },

    // --- ЛОГИКА ОБЩИХ ЗАДАЧ (Bottom List) ---
    addGeneralTask: function() {
        const title = document.getElementById('dp-task-title').value;
        const deadline = document.getElementById('dp-task-deadline').value;
        const important = document.getElementById('dp-task-imp').checked;
        if (!title.trim()) return;

        this.data.push({
            id: Date.now(),
            type: 'task',
            title: title,
            deadline: deadline || null,
            important: important,
            created: new Date().toISOString()
        });
        
        // Сброс формы (закрытие модалки в render)
        this.editingId = null; 
        this.save();
    },

    // --- ЛОГИКА ПЛАНОВ (Week/Month) ---
    addPlanItem: function(text) {
        if(!text.trim()) return;
        this.data.push({
            id: Date.now(),
            type: this.activePlanType === 'week' ? 'week-plan' : 'month-plan',
            title: text,
            date: new Date().toISOString() // дата создания для сортировки
        });
        this.save();
    },

    deleteItem: function(id) {
        if(confirm('Удалить?')) {
            this.data = this.data.filter(i => i.id !== id);
            this.save();
        }
    },

    // --- RENDER ---
    render: function() {
        const app = document.getElementById('app-viewport');
        const styles = `
            <style>
                .dp-container { animation: fadeIn 0.3s; padding: 10px 15px 100px; font-family: -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
                .dp-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
                .dp-title { font-size: 24px; font-weight: 800; color: #1C1C1E; flex: 1; text-align: center; margin-right: 40px; }
                
                /* КАЛЕНДАРЬ */
                .dp-cal-card { background: white; border-radius: 20px; padding: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px; }
                .dp-cal-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-weight: 700; font-size: 18px; text-transform: capitalize; }
                .dp-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center; }
                .dp-weekday { font-size: 12px; color: #8E8E93; font-weight: 600; margin-bottom: 5px; }
                .dp-day { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 50%; font-size: 15px; cursor: pointer; position: relative; }
                .dp-day.today { background: #F2F2F7; color: #007AFF; font-weight: 700; }
                .dp-day.has-event::after { content: ''; width: 4px; height: 4px; background: #FF3B30; border-radius: 50%; position: absolute; bottom: 5px; }
                
                /* КНОПКИ ПЛАНОВ */
                .dp-plan-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 25px; }
                .dp-plan-btn { background: white; padding: 15px; border-radius: 18px; text-align: center; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.03); cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 5px; }
                .dp-plan-btn .material-icons { font-size: 28px; color: #5856D6; }

                /* НИЖНИЙ СПИСОК ЗАДАЧ */
                .dp-section-title { font-size: 20px; font-weight: 800; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
                .dp-task-item { background: white; padding: 16px; border-radius: 18px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
                .dp-task-info { flex: 1; }
                .dp-task-title { font-weight: 600; font-size: 16px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
                .dp-task-imp { color: #FF3B30; font-weight: 900; }
                .dp-task-meta { font-size: 12px; color: #8E8E93; display: flex; gap: 10px; font-weight: 500; }
                .dp-countdown { color: #007AFF; background: #E5F0FF; padding: 2px 6px; border-radius: 4px; }
                .dp-countdown.late { color: #FF3B30; background: #FFE5E5; }

                /* MODAL */
                .dp-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: flex-end; }
                .dp-modal { background: #F2F2F7; width: 100%; border-radius: 25px 25px 0 0; padding: 25px; box-sizing: border-box; animation: slideUp 0.3s; max-height: 85vh; overflow-y: auto; }
                .dp-input { width: 100%; padding: 16px; border: none; border-radius: 16px; margin-bottom: 12px; font-size: 16px; box-sizing: border-box; }
                .dp-save-btn { width: 100%; background: #007AFF; color: white; padding: 16px; border-radius: 16px; border: none; font-weight: 700; font-size: 16px; }
                
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        if (this.view === 'main') {
            this.renderMain(app, styles);
        } else if (this.view === 'day-details') {
            this.renderDayDetails(app, styles);
        } else if (this.view === 'plan-list') {
            this.renderPlanList(app, styles);
        }
    },

    renderMain: function(app, styles) {
        // Календарь
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startOffset = firstDay === 0 ? 6 : firstDay - 1;

        let calendarHtml = '';
        for(let i=0; i<startOffset; i++) calendarHtml += '<div></div>';
        
        for(let d=1; d<=daysInMonth; d++) {
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const hasEvent = this.data.some(e => e.type === 'event' && e.date === dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            
            calendarHtml += `
                <div class="dp-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}" 
                     onclick="DailyPlanner.selectedDateStr='${dateStr}'; DailyPlanner.view='day-details'; DailyPlanner.render()">
                    ${d}
                </div>
            `;
        }

        // Общие задачи (снизу)
        const tasks = this.data.filter(i => i.type === 'task').sort((a,b) => (b.important ? 1 : -1));
        const tasksHtml = tasks.map(t => {
            let timeLeft = '';
            if (t.deadline) {
                const diff = Math.ceil((new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                const label = diff < 0 ? `Просрочено ${Math.abs(diff)} дн` : (diff === 0 ? 'Сегодня' : `Осталось ${diff} дн`);
                const cls = diff <= 0 ? 'late' : '';
                timeLeft = `<span class="dp-countdown ${cls}">${label}</span>`;
            }
            return `
                <div class="dp-task-item">
                    <div class="dp-task-info">
                        <div class="dp-task-title">
                            ${t.important ? '<span class="dp-task-imp">!</span>' : ''} 
                            ${t.title}
                        </div>
                        <div class="dp-task-meta">
                            ${t.deadline ? `<span>До: ${new Date(t.deadline).toLocaleDateString('ru-RU')}</span> ${timeLeft}` : 'Бессрочно'}
                        </div>
                    </div>
                    <span class="material-icons" style="color:#FF3B30; font-size:20px; cursor:pointer;" onclick="DailyPlanner.deleteItem(${t.id})">delete</span>
                </div>
            `;
        }).join('');

        // Модалка добавления задачи
        const modalHtml = this.editingId === 'new-task' ? `
            <div class="dp-modal-bg" onclick="DailyPlanner.editingId=null; DailyPlanner.render()">
                <div class="dp-modal" onclick="event.stopPropagation()">
                    <h3>Новая задача</h3>
                    <input type="text" id="dp-task-title" class="dp-input" placeholder="Что нужно сделать?">
                    <div style="background:white; border-radius:16px; padding:15px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                        <span>Важное (!)</span>
                        <input type="checkbox" id="dp-task-imp" style="transform:scale(1.3)">
                    </div>
                    <div style="background:white; border-radius:16px; padding:15px; margin-bottom:12px;">
                        <div style="margin-bottom:5px; font-size:12px; color:#8E8E93;">СРОК (НЕОБЯЗАТЕЛЬНО)</div>
                        <input type="date" id="dp-task-deadline" style="width:100%; border:none; font-size:16px;">
                    </div>
                    <button class="dp-save-btn" onclick="DailyPlanner.addGeneralTask()">Добавить</button>
                </div>
            </div>
        ` : '';

        app.innerHTML = styles + `
            <div class="dp-container">
                <div class="dp-header">
                    <span class="material-icons-outlined" style="color:#007AFF; cursor:pointer; font-size:28px;" onclick="loadModule('./checklists.js')">chevron_left</span>
                    <div class="dp-title">Ежедневник</div>
                </div>

                <div class="dp-cal-card">
                    <div class="dp-cal-nav">
                        <span class="material-icons" onclick="DailyPlanner.changeMonth(-1)">chevron_left</span>
                        <span>${this.currentDate.toLocaleDateString('ru-RU', {month:'long', year:'numeric'})}</span>
                        <span class="material-icons" onclick="DailyPlanner.changeMonth(1)">chevron_right</span>
                    </div>
                    <div class="dp-cal-grid">
                        <div class="dp-weekday">Пн</div><div class="dp-weekday">Вт</div><div class="dp-weekday">Ср</div>
                        <div class="dp-weekday">Чт</div><div class="dp-weekday">Пт</div><div class="dp-weekday">Сб</div><div class="dp-weekday">Вс</div>
                        ${calendarHtml}
                    </div>
                </div>

                <div class="dp-plan-row">
                    <div class="dp-plan-btn" onclick="DailyPlanner.activePlanType='week'; DailyPlanner.view='plan-list'; DailyPlanner.render()">
                        <span class="material-icons">view_week</span>
                        <span>Планы на неделю</span>
                    </div>
                    <div class="dp-plan-btn" onclick="DailyPlanner.activePlanType='month'; DailyPlanner.view='plan-list'; DailyPlanner.render()">
                        <span class="material-icons">calendar_view_month</span>
                        <span>Планы на месяц</span>
                    </div>
                </div>

                <div class="dp-section-title">
                    <span>Задачи</span>
                    <span class="material-icons" style="color:#007AFF; cursor:pointer;" onclick="DailyPlanner.editingId='new-task'; DailyPlanner.render()">add_circle</span>
                </div>
                <div>
                    ${tasksHtml || '<div style="text-align:center; color:#8E8E93; margin-top:20px;">Задач пока нет</div>'}
                </div>
            </div>
            ${modalHtml}
        `;
    },

    // ДЕТАЛИ ДНЯ (ПРИ КЛИКЕ НА КАЛЕНДАРЬ)
    renderDayDetails: function(app, styles) {
        const events = this.data.filter(e => e.type === 'event' && e.date === this.selectedDateStr);
        const dateDisplay = new Date(this.selectedDateStr).toLocaleDateString('ru-RU', {day:'numeric', month:'long', weekday:'long'});

        const eventsHtml = events.map(e => `
            <div class="dp-task-item">
                <div class="dp-task-info">
                    <div class="dp-task-title">${e.title}</div>
                    ${e.batchId ? '<div class="dp-task-meta" style="color:#007AFF;">↻ Повторяется</div>' : ''}
                </div>
                <span class="material-icons" style="color:#FF3B30; font-size:20px; cursor:pointer;" onclick="DailyPlanner.deleteCalendarEvent(${e.id}, '${e.batchId || ''}', '${e.date}')">delete</span>
            </div>
        `).join('');

        const modalHtml = this.editingId === 'new-event' ? `
            <div class="dp-modal-bg" onclick="DailyPlanner.editingId=null; DailyPlanner.render()">
                <div class="dp-modal" onclick="event.stopPropagation()">
                    <h3>Событие на ${dateDisplay}</h3>
                    <input type="text" id="dp-event-title" class="dp-input" placeholder="Название события">
                    <div style="background:white; border-radius:16px; padding:15px; margin-bottom:12px;">
                        <div style="margin-bottom:5px; font-size:12px; color:#8E8E93;">ПОВТОРЕНИЕ</div>
                        <select id="dp-event-repeat" style="width:100%; border:none; font-size:16px; background:white;">
                            <option value="none">Единоразово</option>
                            <option value="week">Каждую неделю</option>
                            <option value="month">Каждый месяц (того же числа)</option>
                        </select>
                    </div>
                    <button class="dp-save-btn" onclick="DailyPlanner.addCalendarEvent()">Сохранить</button>
                </div>
            </div>
        ` : '';

        app.innerHTML = styles + `
            <div class="dp-container">
                <div class="dp-header">
                    <span class="material-icons-outlined" style="color:#007AFF; cursor:pointer; font-size:28px;" onclick="DailyPlanner.view='main'; DailyPlanner.render()">chevron_left</span>
                    <div class="dp-title" style="font-size:18px; text-transform:capitalize;">${dateDisplay}</div>
                    <span class="material-icons" style="color:#007AFF; cursor:pointer;" onclick="DailyPlanner.editingId='new-event'; DailyPlanner.render()">add</span>
                </div>
                ${eventsHtml || '<div style="text-align:center; color:#8E8E93; margin-top:50px;">Нет событий на этот день</div>'}
            </div>
            ${modalHtml}
        `;
    },

    // СПИСОК ПЛАНОВ (НЕДЕЛЯ/МЕСЯЦ)
    renderPlanList: function(app, styles) {
        const type = this.activePlanType === 'week' ? 'week-plan' : 'month-plan';
        const title = this.activePlanType === 'week' ? 'Планы на неделю' : 'Планы на месяц';
        const items = this.data.filter(i => i.type === type);

        const itemsHtml = items.map(i => `
            <div class="dp-task-item">
                <div class="dp-task-info" style="font-weight:500;">${i.title}</div>
                <span class="material-icons" style="color:#FF3B30; font-size:20px; cursor:pointer;" onclick="DailyPlanner.deleteItem(${i.id})">delete</span>
            </div>
        `).join('');

        const modalHtml = this.editingId === 'new-plan' ? `
            <div class="dp-modal-bg" onclick="DailyPlanner.editingId=null; DailyPlanner.render()">
                <div class="dp-modal" onclick="event.stopPropagation()">
                    <h3>Добавить в ${title}</h3>
                    <input type="text" id="dp-plan-text" class="dp-input" placeholder="План...">
                    <button class="dp-save-btn" onclick="DailyPlanner.addPlanItem(document.getElementById('dp-plan-text').value); DailyPlanner.editingId=null;">Добавить</button>
                </div>
            </div>
        ` : '';

        app.innerHTML = styles + `
            <div class="dp-container">
                <div class="dp-header">
                    <span class="material-icons-outlined" style="color:#007AFF; cursor:pointer; font-size:28px;" onclick="DailyPlanner.view='main'; DailyPlanner.render()">chevron_left</span>
                    <div class="dp-title">${title}</div>
                    <span class="material-icons" style="color:#007AFF; cursor:pointer;" onclick="DailyPlanner.editingId='new-plan'; DailyPlanner.render()">add</span>
                </div>
                ${itemsHtml || '<div style="text-align:center; color:#8E8E93; margin-top:50px;">Список пуст</div>'}
            </div>
            ${modalHtml}
        `;
    }
};

window.DailyPlanner = DailyPlanner;
export function render() { DailyPlanner.init(); }
