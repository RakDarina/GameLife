/* ==========================================
   МОДУЛЬ: ЦИКЛ (cycle.js)
   ========================================== */

const CyclePage = {
    state: {
        history: {}, 
        cycleLength: 28, 
        periodLength: 5, 
        viewDate: new Date()
    },

    init: function() {
        this.loadData();
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
            this.state.viewDate = new Date(this.state.viewDate) || new Date();
        }
    },

    getLastPeriodStart: function(date) {
        let d = new Date(date);
        for (let i = 0; i < 60; i++) {
            const str = this.formatDate(d);
            if (this.state.history[str]?.period) {
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

    getPhase: function(date) {
        const dateStr = this.formatDate(date);
        const entry = this.state.history[dateStr];

        if (entry?.period) return 'menstruation';

        const lastStart = this.getLastPeriodStart(date);
        if (!lastStart) return 'unknown';

        const diffTime = Math.ceil((date - lastStart) / (1000 * 60 * 60 * 24));
        const dayOfCycle = diffTime + 1;

        // Приоритет прогноза: если день попадает на предполагаемое начало следующего цикла
        if (dayOfCycle > this.state.cycleLength) {
            const overdueDays = dayOfCycle - this.state.cycleLength;
            if (overdueDays <= this.state.periodLength) return 'prediction';
            return 'late';
        }

        if (dayOfCycle >= 1 && dayOfCycle <= this.state.periodLength) return 'menstruation';
        if (dayOfCycle >= 12 && dayOfCycle <= 16) return 'ovulation';
        if (dayOfCycle <= 11) return 'follicular';
        
        return 'luteal'; // Теперь будет без цвета в стилях
    },

    changeMonth: function(delta) {
        this.state.viewDate.setMonth(this.state.viewDate.getMonth() + delta);
        this.render();
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const year = this.state.viewDate.getFullYear();
        const month = this.state.viewDate.getMonth();
        const today = new Date();
        const currentPhase = this.getPhase(today);
        const prediction = this.getPredictionText(today);

        const styles = `
            <style>
                .cy-container { animation: fadeIn 0.3s; color: #1C1C1E; height: 100%; display: flex; flex-direction: column; padding-bottom: 20px; }
                .cy-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; }
                .cy-nav-btn { font-size: 24px; color: #5856D6; cursor: pointer; padding: 0 10px; }
                .cy-title { font-size: 18px; font-weight: 700; text-transform: capitalize; }
                .cy-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 20px; }
                .cy-weekday { text-align: center; font-size: 12px; color: #8E8E93; padding-bottom: 5px; font-weight: 600; }
                .cy-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 14px; position: relative; cursor: pointer; }
                
                .cy-phase-menstruation { background: #FFCDD2; color: #B71C1C; }
                
                /* ПРОГНОЗ: РОЗОВЫЙ ПУНКТИР */
                .cy-phase-prediction { border: 2px dashed #FFCDD2; color: #B71C1C; background: transparent; }
                
                .cy-phase-follicular { background: #E3F2FD; color: #0D47A1; }
                .cy-phase-ovulation { background: #81D4FA; color: #01579B; border: 2px solid #0288D1; font-weight: 700; }
                
                /* ЛЮТЕИНОВАЯ ФАЗА: БЕЗ ЦВЕТА */
                .cy-phase-luteal { background: transparent; color: #1C1C1E; }
                
                .cy-phase-late { background: #FFE0B2; border: 1px dashed #FF9800; }

                .cy-today { background: #1C1C1E !important; color: #fff !important; }
                .cy-heart { position: absolute; bottom: -2px; right: -2px; font-size: 10px; }

                .cy-info-card { background: #FFF0F5; border-radius: 20px; padding: 15px; margin-top: 10px; border: 1px solid #FFCDD2; }
                .cy-info-title { font-weight: 800; font-size: 15px; margin-bottom: 5px; color: #880E4F; }
                
                .cy-legend { margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 15px; font-size: 12px; }
                .cy-leg-item { display: flex; align-items: center; margin-bottom: 6px; }
                .cy-leg-dot { width: 12px; height: 12px; border-radius: 50%; margin-right: 10px; }

                .cy-modal-bg { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.3); z-index: 999; display:flex; align-items:center; justify-content:center; }
                .cy-modal { background:#fff; padding: 20px; border-radius: 24px; width: 80%; text-align: center; }
                .cy-btn { width: 100%; padding: 14px; border-radius: 12px; margin-bottom: 8px; border: none; font-weight: 600; }
            </style>
        `;

        app.innerHTML = `
            ${styles}
            <div class="cy-container">
                <div onclick="loadModule('./health.js')" style="color:#5856D6; font-weight:600; cursor:pointer;">‹ Назад</div>
                
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

                <div style="text-align:center; margin-bottom: 10px; font-weight: 700; color: #FF2D55;">
                    ${prediction}
                </div>

                <div class="cy-info-card">
                    <div class="cy-info-title">${this.getPhaseTitle(currentPhase)}</div>
                    <div style="font-size: 13px; line-height: 1.3;">${this.getPhaseAdvice(currentPhase)}</div>
                </div>

                <div class="cy-legend">
                    <div style="font-weight:700; margin-bottom:8px;">Что значат цвета:</div>
                    <div class="cy-leg-item"><div class="cy-leg-dot" style="background:#FFCDD2;"></div> Менструация (отмечено)</div>
                    <div class="cy-leg-item"><div class="cy-leg-dot" style="border:2px dashed #FFCDD2;"></div> Прогноз менструации</div>
                    <div class="cy-leg-item"><div class="cy-leg-dot" style="background:#81D4FA;"></div> Овуляция (пик)</div>
                    <div class="cy-leg-item"><div class="cy-leg-dot" style="background:#E3F2FD;"></div> Фертильные дни</div>
                    <div class="cy-leg-item"><div class="cy-leg-dot" style="border:1px solid #ddd; background:#fff;"></div> Обычный день</div>
                </div>
            </div>
        `;
    },

    renderCalendarDays: function(year, month) {
        const firstDay = new Date(year, month, 1).getDay() || 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let html = '';
        for (let i = 1; i < firstDay; i++) { html += `<div></div>`; }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = this.formatDate(date);
            const isToday = dateStr === this.formatDate(new Date());
            const entry = this.state.history[dateStr] || {};
            const phase = this.getPhase(date);
            
            let classes = `cy-day cy-phase-${phase}`;
            if (isToday) classes += ' cy-today';

            html += `
                <div class="${classes}" onclick="CyclePage.openDayModal('${dateStr}')">
                    <span style="z-index:2">${day}</span>
                    ${entry.sex ? '<span class="cy-heart">❤️</span>' : ''}
                </div>
            `;
        }
        return html;
    },

    openDayModal: function(dateStr) {
        const entry = this.state.history[dateStr] || { period: false, sex: false };
        const modal = document.createElement('div');
        modal.className = 'cy-modal-bg';
        modal.innerHTML = `
            <div class="cy-modal">
                <h3 style="margin-top:0">${new Date(dateStr).toLocaleDateString('ru-RU', {day:'numeric', month:'long'})}</h3>
                <button class="cy-btn" style="background:#FFCDD2; color:#B71C1C" onclick="CyclePage.togglePeriod('${dateStr}')">
                    ${entry.period ? 'Убрать месячные' : 'Начались месячные (5 дн)'}
                </button>
                <button class="cy-btn" style="background:#E3F2FD; color:#0D47A1" onclick="CyclePage.toggleSex('${dateStr}')">
                    ${entry.sex ? 'Убрать ❤️' : 'Был секс ❤️'}
                </button>
                <button class="cy-btn" style="background:#eee" onclick="document.querySelector('.cy-modal-bg').remove()">Закрыть</button>
            </div>
        `;
        document.body.appendChild(modal);
    },

    togglePeriod: function(dateStr) {
        if (this.state.history[dateStr]?.period) {
            this.state.history[dateStr].period = false;
        } else {
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

    formatDate: function(date) { return date.toISOString().split('T')[0]; },

    getPredictionText: function(today) {
        const lastStart = this.getLastPeriodStart(today);
        if (!lastStart) return 'Отметьте начало цикла';
        const nextPeriod = new Date(lastStart);
        nextPeriod.setDate(nextPeriod.getDate() + this.state.cycleLength);
        const diff = Math.ceil((nextPeriod - today) / (1000 * 60 * 60 * 24));
        if (diff > 0) return `Прогноз: через ${diff} дн.`;
        if (diff === 0) return `Месячные должны быть сегодня`;
        return `Задержка: ${Math.abs(diff)} дн.`;
    },

    getPhaseTitle: function(phase) {
        const titles = { 'menstruation': '🩸 Менструация', 'prediction': '🩺 Прогноз', 'follicular': '🌱 Фолликулярная фаза', 'ovulation': '🥚 Овуляция', 'luteal': '🍂 Обычный день', 'late': '⚠️ Задержка' };
        return titles[phase] || 'Твой цикл';
    },

    getPhaseAdvice: function(phase) {
        const advice = {
            'menstruation': 'Пей больше теплого, отдыхай. Тяжелый спорт лучше заменить на растяжку.',
            'prediction': 'Скоро начнется новый цикл. Подготовь средства гигиены.',
            'follicular': 'Сил становится больше! Самое время для новых дел и тренировок.',
            'ovulation': 'Ты на пике привлекательности и энергии. Настроение супер!',
            'luteal': 'Период спокойствия. Организм готовится к новому циклу.',
            'late': 'Если задержка большая, стоит снизить уровень стресса или сделать тест.'
        };
        return advice[phase] || 'Начни отмечать дни, чтобы видеть советы.';
    }
};

window.CyclePage = CyclePage;
export function render() { CyclePage.init(); }
