/* ==========================================
   МОДУЛЬ: ЦИКЛ (cycle.js)
   ========================================== */

const CyclePage = {
    state: {
        history: {}, // { "2026-01-13": { period: true, sex: false } }
        cycleLength: 28, // Средняя длина цикла
        periodLength: 5, // Средняя длина месячных
        viewDate: new Date() // Какой месяц смотрим
    },

    init: function() {
        this.loadData();
        // Если открыли модуль, и viewDate не сохранен, ставим текущий
        this.render();
    },

    saveData: function() {
        localStorage.setItem('GL_Cycle_Data', JSON.stringify(this.state));
    },

    loadData: function() {
        const saved = localStorage.getItem('GL_Cycle_Data');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.state = { ...this.state, ...parsed };
            // Восстанавливаем дату как объект Date
            this.state.viewDate = new Date(this.state.viewDate) || new Date();
        }
    },

    // --- ЛОГИКА ФАЗ ---
    
    // Найти дату начала последних месячных перед указанной датой
    getLastPeriodStart: function(date) {
        let d = new Date(date);
        // Ищем назад на 60 дней максимум
        for (let i = 0; i < 60; i++) {
            const str = this.formatDate(d);
            if (this.state.history[str]?.period) {
                // Проверяем, это начало? (вчера месячных не было)
                let prev = new Date(d);
                prev.setDate(prev.getDate() - 1);
                if (!this.state.history[this.formatDate(prev)]?.period) {
                    return d;
                }
            }
            d.setDate(d.getDate() - 1);
        }
        return null;
    },

    // Получить информацию о фазе для конкретного дня
    getPhase: function(date) {
        const dateStr = this.formatDate(date);
        const entry = this.state.history[dateStr];

        // 1. Если отмечено вручную как месячные
        if (entry?.period) return 'menstruation';

        // 2. Вычисляем фазу на основе последнего цикла
        const lastStart = this.getLastPeriodStart(date);
        if (!lastStart) return 'unknown';

        const diffTime = Math.abs(date - lastStart);
        const dayOfCycle = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (dayOfCycle > this.state.cycleLength) return 'late'; // Задержка или новый цикл еще не отмечен
        
        // Стандартные фазы (примерно)
        if (dayOfCycle <= this.state.periodLength) return 'menstruation'; // Прогноз месячных
        if (dayOfCycle <= 11) return 'follicular';
        if (dayOfCycle >= 12 && dayOfCycle <= 16) return 'ovulation';
        return 'luteal';
    },

    // --- РЕНДЕРИНГ ---

    changeMonth: function(delta) {
        this.state.viewDate.setMonth(this.state.viewDate.getMonth() + delta);
        this.render();
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const year = this.state.viewDate.getFullYear();
        const month = this.state.viewDate.getMonth();
        
        // Определяем состояние сегодня
        const today = new Date();
        const currentPhase = this.getPhase(today);
        const prediction = this.getPredictionText(today);

        // Уникальные стили для цикла (префикс cy-)
        const styles = `
            <style>
                .cy-container { animation: fadeIn 0.3s; color: #1C1C1E; height: 100%; display: flex; flex-direction: column; }
                .cy-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; }
                .cy-nav-btn { font-size: 24px; color: #5856D6; cursor: pointer; padding: 0 10px; }
                .cy-title { font-size: 18px; font-weight: 700; text-transform: capitalize; }
                
                .cy-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 20px; }
                .cy-weekday { text-align: center; font-size: 12px; color: #8E8E93; padding-bottom: 5px; font-weight: 600; }
                
                .cy-day { 
                    aspect-ratio: 1; display: flex; align-items: center; justify-content: center; 
                    border-radius: 50%; font-size: 14px; position: relative; cursor: pointer; transition: 0.2s;
                }
                .cy-day-num { z-index: 2; font-weight: 500; }
                .cy-heart { position: absolute; bottom: -2px; right: -2px; font-size: 10px; z-index: 3; }
                
                /* ЦВЕТА ФАЗ */
                .cy-phase-menstruation { background: #FFCDD2; color: #B71C1C; } /* Розовый/Красный */
                .cy-phase-follicular { background: #E3F2FD; color: #0D47A1; } /* Светло-голубой */
                .cy-phase-ovulation { background: #81D4FA; color: #01579B; border: 2px solid #0288D1; font-weight: 700; } /* Ярко-синий */
                .cy-phase-luteal { background: #FFF9C4; color: #F57F17; } /* Желтоватый */
                .cy-phase-late { background: #FFE0B2; border: 1px dashed #FF9800; } /* Оранжевый пунктир */

                .cy-today { border: 2px solid #1C1C1E; }

                /* Карточка статуса */
                .cy-info-card { 
                    background: #FFF0F5; border-radius: 20px; padding: 20px; margin-top: auto; 
                    box-shadow: 0 4px 15px rgba(255,182,193, 0.3); border: 1px solid #FFCDD2;
                }
                .cy-info-title { font-weight: 800; font-size: 16px; margin-bottom: 8px; color: #880E4F; }
                .cy-info-text { font-size: 14px; color: #4A4A4A; line-height: 1.4; }
                
                .cy-modal-bg { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.3); z-index: 999; display:flex; align-items:center; justify-content:center; }
                .cy-modal { background:#fff; padding: 20px; border-radius: 24px; width: 80%; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
                .cy-btn { width: 100%; padding: 14px; border-radius: 12px; margin-bottom: 8px; border: none; font-weight: 600; font-size: 15px; cursor: pointer; }
            </style>
        `;

        app.innerHTML = `
            ${styles}
            <div class="cy-container">
                <div style="margin-bottom: 10px;">
                    <span onclick="loadModule('./health.js')" style="color:#5856D6; font-weight:600; cursor:pointer;">‹ Назад</span>
                </div>

                <div class="cy-header">
                    <span class="cy-nav-btn" onclick="CyclePage.changeMonth(-1)">‹</span>
                    <span class="cy-title">${this.state.viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <span class="cy-nav-btn" onclick="CyclePage.changeMonth(1)">›</span>
                </div>

                <div class="cy-grid">
                    <div class="cy-weekday">Пн</div><div class="cy-weekday">Вт</div><div class="cy-weekday">Ср</div>
                    <div class="cy-weekday">Чт</div><div class="cy-weekday">Пт</div><div class="cy-weekday">Сб</div>
                    <div class="cy-weekday">Вс</div>
                    ${this.renderCalendarDays(year, month)}
                </div>

                <div style="text-align:center; margin-bottom: 15px; font-weight: 600; color: #5856D6;">
                    ${prediction}
                </div>

                <div class="cy-info-card">
                    <div class="cy-info-title">${this.getPhaseTitle(currentPhase)}</div>
                    <div class="cy-info-text">${this.getPhaseAdvice(currentPhase)}</div>
                </div>
            </div>
        `;
    },

    renderCalendarDays: function(year, month) {
        const firstDay = new Date(year, month, 1).getDay() || 7; // 1 (Пн) - 7 (Вс)
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let html = '';

        // Пустые клетки до начала месяца
        for (let i = 1; i < firstDay; i++) {
            html += `<div></div>`;
        }

        // Дни месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = this.formatDate(date);
            const isToday = dateStr === this.formatDate(new Date());
            
            const entry = this.state.history[dateStr] || {};
            const phase = this.getPhase(date);
            
            let classes = `cy-day cy-phase-${phase}`;
            if (isToday) classes += ' cy-today';

            let heart = entry.sex ? '<span class="cy-heart">❤️</span>' : '';

            html += `
                <div class="${classes}" onclick="CyclePage.openDayModal('${dateStr}')">
                    <span class="cy-day-num">${day}</span>
                    ${heart}
                </div>
            `;
        }
        return html;
    },

    // --- МОДАЛЬНОЕ ОКНО ДНЯ ---
    openDayModal: function(dateStr) {
        const entry = this.state.history[dateStr] || { period: false, sex: false };
        const d = new Date(dateStr);
        const niceDate = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

        const modal = document.createElement('div');
        modal.className = 'cy-modal-bg';
        modal.innerHTML = `
            <div class="cy-modal">
                <h3>${niceDate}</h3>
                <button class="cy-btn" style="background: #FFCDD2; color: #B71C1C;" onclick="CyclePage.togglePeriod('${dateStr}')">
                    ${entry.period ? 'Убрать месячные' : 'Начались месячные (отметить 5 дн.)'}
                </button>
                <button class="cy-btn" style="background: #E1F5FE; color: #0277BD;" onclick="CyclePage.toggleSex('${dateStr}')">
                    ${entry.sex ? 'Убрать сердечко 💔' : 'Был секс ❤️'}
                </button>
                <button class="cy-btn" style="background: #F5F5F5; color: #000;" onclick="document.querySelector('.cy-modal-bg').remove()">Отмена</button>
            </div>
        `;
        document.body.appendChild(modal);
    },

    togglePeriod: function(dateStr) {
        const entry = this.state.history[dateStr];
        
        if (entry && entry.period) {
            // Если уже есть - просто убираем один день
            this.state.history[dateStr].period = false;
        } else {
            // Если нет - ставим на 5 дней вперед
            let d = new Date(dateStr);
            for (let i = 0; i < 5; i++) {
                let s = this.formatDate(d);
                if (!this.state.history[s]) this.state.history[s] = {};
                this.state.history[s].period = true;
                d.setDate(d.getDate() + 1);
            }
        }
        this.saveData();
        document.querySelector('.cy-modal-bg').remove();
        this.render();
    },

    toggleSex: function(dateStr) {
        if (!this.state.history[dateStr]) this.state.history[dateStr] = {};
        this.state.history[dateStr].sex = !this.state.history[dateStr].sex;
        this.saveData();
        document.querySelector('.cy-modal-bg').remove();
        this.render();
    },

    // --- ПОМОЩНИКИ ---
    formatDate: function(date) {
        return date.toISOString().split('T')[0];
    },

    getPredictionText: function(today) {
        const lastStart = this.getLastPeriodStart(today);
        if (!lastStart) return 'Отметьте последние месячные';

        // Дата следующих месячных
        const nextPeriod = new Date(lastStart);
        nextPeriod.setDate(nextPeriod.getDate() + this.state.cycleLength);
        
        // Разница в днях
        const diff = Math.ceil((nextPeriod - today) / (1000 * 60 * 60 * 24));

        if (diff > 0) return `Месячные через ${diff} дн.`;
        if (diff === 0) return `Месячные сегодня?`;
        return `Задержка ${Math.abs(diff)} дн.!`;
    },

    getPhaseTitle: function(phase) {
        const titles = {
            'menstruation': '🩸 Менструация',
            'follicular': '🌱 Фолликулярная фаза',
            'ovulation': '🥚 Овуляция (Фертильность)',
            'luteal': '🍂 Лютеиновая фаза',
            'late': '⚠️ Задержка',
            'unknown': 'Данных пока нет'
        };
        return titles[phase] || 'Цикл';
    },

    getPhaseAdvice: function(phase) {
        const advice = {
            'menstruation': 'Энергия на минимуме. Возможны спазмы. Лучшее время для отдыха, тепла и шоколада. Избегай тяжелых нагрузок.',
            'follicular': 'Энергия растет! Кожа сияет, настроение улучшается. Отличное время для планирования, спорта и активной работы.',
            'ovulation': 'Пик энергии и либидо. Ты чувствуешь себя максимально уверенно. Самое время для свиданий или сложных задач!',
            'luteal': 'Энергия снижается, возможен ПМС. Организм готовится к новому циклу. Хочется уюта, спокойствия и вкусной еды.',
            'late': 'Твой цикл длиннее обычного. Если задержка большая, стоит сделать тест или снизить уровень стресса.',
            'unknown': 'Отметь первый день месячных в календаре, чтобы получить персональные рекомендации.'
        };
        return advice[phase] || '';
    }
};

window.CyclePage = CyclePage;
export function render() { CyclePage.init(); }