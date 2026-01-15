/* ==========================================
   МОДУЛЬ: ПСИХОТЕРАПЕВТ (therapy.js)
   ========================================== */

const TherapyModule = {
    selectedDates: JSON.parse(localStorage.getItem('GL_Therapy_Dates')) || [],
    currentMonth: new Date(),

    init: function() {
        this.render();
    },

    save: function() {
        localStorage.setItem('GL_Therapy_Dates', JSON.stringify(this.selectedDates));
        this.render();
    },

    // Расчет следующей рекомендуемой даты
    getNextSessionDate: function() {
        if (this.selectedDates.length === 0) return null;
        
        // Находим самый последний визит
        const timestamps = this.selectedDates.map(d => new Date(d).getTime());
        const lastVisit = new Date(Math.max(...timestamps));
        
        // Прибавляем 21 день (3 недели)
        const nextDate = new Date(lastVisit);
        nextDate.setDate(lastVisit.getDate() + 21);
        return nextDate;
    },

    toggleDate: function(dateStr) {
        const index = this.selectedDates.indexOf(dateStr);
        if (index > -1) {
            this.selectedDates.splice(index, 1);
        } else {
            this.selectedDates.push(dateStr);
        }
        this.save();
    },

    changeMonth: function(delta) {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + delta);
        this.render();
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const nextDate = this.getNextSessionDate();
        const nextDateStr = nextDate ? nextDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : '—';
        const nextDateISO = nextDate ? nextDate.toISOString().split('T')[0] : null;

        const styles = `
            <style>
                .th-container { animation: fadeIn 0.3s; color: #1c1c1e; padding-bottom: 50px; }
                
                /* Унифицированный заголовок со стрелочкой */
                .th-header-nav { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding-top: 10px; }
                .th-back-arrow { color: #007AFF; cursor: pointer; font-size: 28px; }
                .th-main-title { font-size: 24px; font-weight: 800; color: #1C1C1E; flex: 1; text-align: center; margin-right: 40px; }

                /* Кнопка записи */
                .th-book-btn { 
                    background: #5856D6; color: white; border: none; width: 100%; 
                    padding: 16px; border-radius: 16px; font-size: 16px; font-weight: 600; 
                    margin-bottom: 25px; cursor: pointer; box-shadow: 0 4px 12px rgba(88, 86, 214, 0.3);
                }

                /* Календарь */
                .th-cal-card { background: white; border-radius: 24px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 20px; }
                .th-cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                .th-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; text-align: center; }
                .th-weekday { font-size: 12px; color: #8e8e93; font-weight: 600; padding-bottom: 10px; }
                
                .th-day { 
                    aspect-ratio: 1; display: flex; align-items: center; justify-content: center; 
                    border-radius: 50%; font-size: 14px; cursor: pointer; position: relative; transition: 0.2s;
                }
                .th-day.visited { background: #E5E5EA; color: #000; font-weight: bold; border: 2px solid #5856D6; }
                .th-day.suggested { border: 2px dashed #5856D6; color: #5856D6; font-weight: bold; }
                .th-day.today { background: #f2f2f7; color: #5856D6; text-decoration: underline; }
                .th-day:active { transform: scale(0.9); }

                /* Инфо-блок */
                .th-info-card { 
                    background: #F2F2F7; border-radius: 20px; padding: 20px; 
                    display: flex; flex-direction: column; align-items: center; gap: 8px;
                }
                .th-info-label { font-size: 14px; color: #8e8e93; }
                .th-info-date { font-size: 18px; font-weight: 700; color: #5856D6; }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        // Генерация дней календаря
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Коррекция для понедельника

        let calendarHTML = '';
        for (let i = 0; i < startOffset; i++) calendarHTML += '<div></div>';
        
        for (let d = 1; d <= daysInMonth; d++) {
            const dateISO = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isVisited = this.selectedDates.includes(dateISO);
            const isSuggested = dateISO === nextDateISO;
            const isToday = new Date().toISOString().split('T')[0] === dateISO;

            calendarHTML += `
                <div class="th-day ${isVisited ? 'visited' : ''} ${isSuggested ? 'suggested' : ''} ${isToday ? 'today' : ''}" 
                     onclick="TherapyModule.toggleDate('${dateISO}')">
                    ${d}
                </div>
            `;
        }

        app.innerHTML = `
            ${styles}
            <div class="th-container">
                <div class="th-header-nav">
                    <span class="material-icons-outlined th-back-arrow" onclick="loadModule('./mental.js')">chevron_left</span>
                    <div class="th-main-title">Психотерапевт</div>
                </div>

                <button class="th-book-btn" onclick="window.open('https://prodoctorov.ru/samara/vrach/468194-ivanova/#speciality=psihoterapevt%23filter=default', '_blank')">
                    Записаться на прием
                </button>

                <div class="th-cal-card">
                    <div class="th-cal-header">
                        <span class="material-icons-outlined" style="cursor:pointer" onclick="TherapyModule.changeMonth(-1)">chevron_left</span>
                        <b style="text-transform: capitalize;">${this.currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</b>
                        <span class="material-icons-outlined" style="cursor:pointer" onclick="TherapyModule.changeMonth(1)">chevron_right</span>
                    </div>
                    <div class="th-cal-grid">
                        <div class="th-weekday">Пн</div><div class="th-weekday">Вт</div><div class="th-weekday">Ср</div>
                        <div class="th-weekday">Чт</div><div class="th-weekday">Пт</div><div class="th-weekday">Сб</div><div class="th-weekday">Вс</div>
                        ${calendarHTML}
                    </div>
                </div>

                <div class="th-info-card">
                    <div class="th-info-label">Следующий визит (рекомендация):</div>
                    <div class="th-info-date">${nextDateStr}</div>
                </div>
            </div>
        `;
    },
};

window.TherapyModule = TherapyModule;

export function render() {
    TherapyModule.init();
}
