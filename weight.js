/* ==========================================
   МОДУЛЬ: ВЕС И ТРЕНИРОВКИ (weight.js)
   ========================================== */

const WeightApp = {
    // Уникальное хранилище данных
    state: {
        currentMonth: new Date(), // Какой месяц смотрим
        data: {} // Формат: { "2026-02-14": { weight: 65, fat: 20, workout: true, fastfood: false, ... } }
    },

    init: function() {
        this.loadData();
        this.render();
    },

    saveData: function() {
        localStorage.setItem('GL_Weight_App', JSON.stringify(this.state.data));
    },

    loadData: function() {
        const saved = localStorage.getItem('GL_Weight_App');
        if (saved) {
            this.state.data = JSON.parse(saved);
        }
    },

    // --- ЛОГИКА ---

    // Определение картинки персонажа (60кг = stage1 ... 70кг+ = stage6)
    getCharacterStage: function() {
        // Ищем последнюю запись с весом
        const dates = Object.keys(this.state.data).sort().reverse();
        let lastWeight = 70; // Дефолтный вес, если нет записей

        for (let date of dates) {
            if (this.state.data[date].weight) {
                lastWeight = this.state.data[date].weight;
                break;
            }
        }

        // Логика стадий
        if (lastWeight <= 60) return 1;
        if (lastWeight >= 70) return 6;
        
        // Промежуточные (61-69 кг распределяем на stage 2,3,4,5)
        // Диапазон 10 кг. Шаг примерно 2 кг.
        if (lastWeight <= 62) return 2;
        if (lastWeight <= 65) return 3;
        if (lastWeight <= 67) return 4;
        return 5;
    },

    changeMonth: function(delta) {
        this.state.currentMonth.setMonth(this.state.currentMonth.getMonth() + delta);
        this.render();
    },

    // --- УПРАВЛЕНИЕ ЗАПИСЯМИ ---

    toggleHabit: function(dateStr, type) {
        // type = 'workout' или 'fastfood'
        if (!this.state.data[dateStr]) this.state.data[dateStr] = {};
        
        // Переключаем true/false
        this.state.data[dateStr][type] = !this.state.data[dateStr][type];
        
        this.saveData();
        this.render();
    },

    saveMeasurement: function(dateStr, formData) {
        if (!this.state.data[dateStr]) this.state.data[dateStr] = {};
        
        // Объединяем старые данные дня с новыми измерениями
        this.state.data[dateStr] = { ...this.state.data[dateStr], ...formData };
        
        this.saveData();
        this.render();
    },

    deleteRecord: function(dateStr) {
        if (confirm('Удалить запись за ' + dateStr + '?')) {
            delete this.state.data[dateStr];
            this.saveData();
            this.render();
        }
    },

    // --- РЕНДЕРИНГ ---

    render: function() {
        const app = document.getElementById('app-viewport');
        const stage = this.getCharacterStage();
        const year = this.state.currentMonth.getFullYear();
        const month = this.state.currentMonth.getMonth();
        const monthName = this.state.currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

        // Стили (префикс wp- для уникальности)
        const styles = `
            <style>
                .wp-container { padding-bottom: 80px; animation: fadeIn 0.3s; color: #333; }
                .wp-header { padding: 10px 0; color: #6c5ce7; font-weight: 700; cursor: pointer; }
                
                /* Персонаж */
                .wp-char-box { text-align: center; margin-bottom: 20px; }
                .wp-char-img { height: 180px; object-fit: contain; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.1)); }

                /* Календарь */
                .wp-calendar { background: #fff; border-radius: 20px; padding: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px; }
                .wp-cal-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-weight: bold; font-size: 16px; text-transform: capitalize; }
                .wp-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
                .wp-cal-day-name { text-align: center; font-size: 12px; color: #888; margin-bottom: 5px; }
                .wp-day { 
                    aspect-ratio: 1; border-radius: 10px; display: flex; flex-direction: column; 
                    align-items: center; justify-content: center; font-size: 14px; position: relative; 
                    background: #f9f9f9; border: 1px solid transparent;
                }
                
                /* Статусы дней */
                .wp-day.workout { background: #dff9fb; border-color: #badc58; color: #2e7d32; } /* Зеленый */
                .wp-day.fastfood { background: #ffcccc; border-color: #ff4d4d; color: #b71c1c; } /* Красный */
                .wp-day.both { background: #fff3cd; border-color: #ff9f43; } /* Если и то и то */
                
                .wp-icon { font-size: 10px; position: absolute; bottom: 2px; }
                .wp-icon-top { font-size: 10px; position: absolute; top: 2px; right: 2px; }

                /* Кнопки меню */
                .wp-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .wp-btn { 
                    border: none; padding: 15px; border-radius: 15px; font-weight: 600; font-size: 14px; 
                    cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 5px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05); transition: 0.1s;
                }
                .wp-btn:active { transform: scale(0.98); }
                .btn-green { background: #badc58; color: #134e08; }
                .btn-red { background: #ff7979; color: #570000; }
                .btn-blue { background: #7ed6df; color: #013846; }
                .btn-gray { background: #dff9fb; color: #333; }

                /* Модальные окна */
                .wp-modal-bg { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; }
                .wp-modal { background: #fff; padding: 25px; border-radius: 20px; width: 85%; max-height: 90vh; overflow-y: auto; }
                .wp-input { width: 100%; padding: 10px; margin: 5px 0 15px; border: 1px solid #ddd; border-radius: 8px; }
                .wp-label { font-size: 12px; font-weight: bold; color: #666; }
                
                /* История */
                .wp-hist-item { background: #fff; border-radius: 12px; padding: 10px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #eee; }
            </style>
        `;

        app.innerHTML = `
            ${styles}
            <div class="wp-container">
                <div class="wp-header" onclick="loadModule('./health.js')">‹ Назад в Здоровье</div>

                <div class="wp-char-box">
                    <img src="./stage${stage}.png" class="wp-char-img" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
                    <div style="font-size:12px; color:#888; margin-top:5px;">Текущая форма: Stage ${stage}</div>
                </div>

                <div class="wp-calendar">
                    <div class="wp-cal-nav">
                        <span onclick="WeightApp.changeMonth(-1)" style="cursor:pointer">‹</span>
                        <span>${monthName}</span>
                        <span onclick="WeightApp.changeMonth(1)" style="cursor:pointer">›</span>
                    </div>
                    <div class="wp-cal-grid">
                        <div class="wp-cal-day-name">Пн</div><div class="wp-cal-day-name">Вт</div><div class="wp-cal-day-name">Ср</div>
                        <div class="wp-cal-day-name">Чт</div><div class="wp-cal-day-name">Пт</div><div class="wp-cal-day-name">Сб</div>
                        <div class="wp-cal-day-name">Вс</div>
                        ${this.renderCalendarDays(year, month)}
                    </div>
                </div>

                <div class="wp-controls">
                    <button class="wp-btn btn-green" onclick="WeightApp.openDateModal('workout')">
                        <span>💪 Тренировка</span>
                    </button>
                    <button class="wp-btn btn-red" onclick="WeightApp.openDateModal('fastfood')">
                        <span>🍔 Фастфуд</span>
                    </button>
                    <button class="wp-btn btn-blue" onclick="WeightApp.openMeasureModal()">
                        <span>⚖️ Измерить</span>
                    </button>
                    <button class="wp-btn btn-gray" onclick="WeightApp.openHistoryModal()">
                        <span>📜 История</span>
                    </button>
                </div>
            </div>
        `;
    },

    renderCalendarDays: function(year, month) {
        const firstDay = new Date(year, month, 1).getDay() || 7; 
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let html = '';

        // Пустые ячейки
        for (let i = 1; i < firstDay; i++) html += `<div></div>`;

        // Дни
        for (let day = 1; day <= daysInMonth; day++) {
            // Формируем дату YYYY-MM-DD с учетом часового пояса (простой способ)
            const dateObj = new Date(year, month, day);
            const dateStr = this.formatDate(dateObj);
            
            const entry = this.state.data[dateStr] || {};
            
            // Определяем классы
            let classes = 'wp-day';
            let icons = '';

            if (entry.workout && entry.fastfood) {
                classes += ' both';
                icons += '<span class="wp-icon">💪🍔</span>';
            } else if (entry.workout) {
                classes += ' workout';
                icons += '<span class="wp-icon">💪</span>';
            } else if (entry.fastfood) {
                classes += ' fastfood';
                icons += '<span class="wp-icon">🍔</span>';
            }

            // Если есть вес, добавим точку сверху
            if (entry.weight) icons += '<span class="wp-icon-top">⚖️</span>';

            html += `<div class="${classes}">${day} ${icons}</div>`;
        }
        return html;
    },

    // --- МОДАЛЬНЫЕ ОКНА ---

    // 1. Модалка выбора даты для Тренировки/Фастфуда
    openDateModal: function(type) {
        const title = type === 'workout' ? 'Добавить/Убрать тренировку' : 'Добавить/Убрать фастфуд';
        const color = type === 'workout' ? '#badc58' : '#ff7979';
        
        const today = this.formatDate(new Date());

        const html = `
            <h3 style="margin-top:0">${title}</h3>
            <p class="wp-label">Выберите дату:</p>
            <input type="date" id="wp-date-picker" class="wp-input" value="${today}">
            <button class="wp-btn" style="width:100%; background:${color}; color:#fff;" onclick="WeightApp.submitHabit('${type}')">
                Применить
            </button>
            <button class="wp-btn" style="width:100%; background:#eee; margin-top:10px" onclick="document.querySelector('.wp-modal-bg').remove()">Отмена</button>
        `;
        this.showModal(html);
    },

    submitHabit: function(type) {
        const date = document.getElementById('wp-date-picker').value;
        if (date) {
            this.toggleHabit(date, type);
            document.querySelector('.wp-modal-bg').remove();
        }
    },

    // 2. Модалка измерений
    openMeasureModal: function() {
        const today = this.formatDate(new Date());
        const html = `
            <h3 style="margin-top:0">Новое измерение</h3>
            
            <p class="wp-label">Дата:</p>
            <input type="date" id="m-date" class="wp-input" value="${today}">

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div>
                    <p class="wp-label">Вес (кг):</p>
                    <input type="number" id="m-weight" class="wp-input" placeholder="0.0">
                </div>
                <div>
                    <p class="wp-label">Жир (%):</p>
                    <input type="number" id="m-fat" class="wp-input" placeholder="%">
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div>
                    <p class="wp-label">Белок:</p>
                    <input type="number" id="m-protein" class="wp-input">
                </div>
                <div>
                    <p class="wp-label">Вода (л):</p>
                    <input type="number" id="m-water" class="wp-input">
                </div>
            </div>

            <p class="wp-label">Объемы (см):</p>
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:5px;">
                <input type="number" id="m-waist" class="wp-input" placeholder="Талия">
                <input type="number" id="m-chest" class="wp-input" placeholder="Грудь">
                <input type="number" id="m-hips" class="wp-input" placeholder="Бедра">
            </div>

            <button class="wp-btn btn-blue" style="width:100%; color:#fff" onclick="WeightApp.submitMeasure()">Сохранить</button>
            <button class="wp-btn" style="width:100%; background:#eee; margin-top:10px" onclick="document.querySelector('.wp-modal-bg').remove()">Отмена</button>
        `;
        this.showModal(html);
    },

    submitMeasure: function() {
        const date = document.getElementById('m-date').value;
        const data = {
            weight: parseFloat(document.getElementById('m-weight').value) || null,
            fat: parseFloat(document.getElementById('m-fat').value) || null,
            protein: parseFloat(document.getElementById('m-protein').value) || null,
            water: parseFloat(document.getElementById('m-water').value) || null,
            waist: parseFloat(document.getElementById('m-waist').value) || null,
            chest: parseFloat(document.getElementById('m-chest').value) || null,
            hips: parseFloat(document.getElementById('m-hips').value) || null,
        };

        // Удаляем пустые ключи
        Object.keys(data).forEach(key => data[key] === null && delete data[key]);

        if (date && Object.keys(data).length > 0) {
            this.saveMeasurement(date, data);
            document.querySelector('.wp-modal-bg').remove();
        } else {
            alert('Заполните хотя бы одно поле и дату');
        }
    },

    // 3. Модалка Истории
    openHistoryModal: function() {
        // Сортируем даты по убыванию
        const dates = Object.keys(this.state.data).sort().reverse();
        
        let listHtml = '';
        if (dates.length === 0) listHtml = '<p style="text-align:center; color:#888">Записей нет</p>';

        dates.forEach(date => {
            const entry = this.state.data[date];
            // Формируем описание строки
            let details = [];
            if (entry.weight) details.push(`<b>${entry.weight} кг</b>`);
            if (entry.workout) details.push(`💪`);
            if (entry.fastfood) details.push(`🍔`);
            if (entry.waist) details.push(`Тал: ${entry.waist}`);
            
            listHtml += `
                <div class="wp-hist-item">
                    <div>
                        <div style="font-weight:bold; font-size:13px; color:#6c5ce7">${date}</div>
                        <div style="font-size:12px; margin-top:2px;">${details.join(' | ') || 'Нет данных'}</div>
                    </div>
                    <button onclick="WeightApp.deleteRecord('${date}')" style="background:none; border:none; font-size:18px; color:red;">🗑</button>
                </div>
            `;
        });

        const html = `
            <h3 style="margin-top:0">История записей</h3>
            <div style="max-height:60vh; overflow-y:auto; margin-bottom:15px;">
                ${listHtml}
            </div>
            <button class="wp-btn" style="width:100%; background:#eee;" onclick="document.querySelector('.wp-modal-bg').remove()">Закрыть</button>
        `;
        this.showModal(html);
    },

    // Вспомогательные функции
    showModal: function(content) {
        const div = document.createElement('div');
        div.className = 'wp-modal-bg';
        div.innerHTML = `<div class="wp-modal">${content}</div>`;
        document.body.appendChild(div);
    },

    formatDate: function(date) {
        // YYYY-MM-DD корректно
        const offset = date.getTimezoneOffset();
        const d = new Date(date.getTime() - (offset*60*1000));
        return d.toISOString().split('T')[0];
    }
};

window.WeightApp = WeightApp;
export function render() { WeightApp.init(); }
