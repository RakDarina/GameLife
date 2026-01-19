/* ==========================================
   МОДУЛЬ: МЕНТАЛЬНОЕ ЗДОРОВЬЕ (mental.js)
   ========================================== */

const MentalPage = {
    init: function() {
        this.render();
    },

    // --- ИСПРАВЛЕННАЯ ФУНКЦИЯ ПРОВЕРКИ ---
    checkDailyStatus: function(type) {
        try {
            // Получаем сегодня в правильном формате (2026-01-19), как в базе
            const todayStr = new Date().toISOString().split('T')[0];

            if (type === 'gratitude') {
                // Проверяем правильный ключ GL_Data_Gratitude
                const data = JSON.parse(localStorage.getItem('GL_Data_Gratitude')) || [];
                return data.some(item => item.date === todayStr);
            }

            if (type === 'diary') {
                // Проверяем и настроение, и заметки по правильным ключам
                const moodData = JSON.parse(localStorage.getItem('GL_Mood_Data')) || {};
                const notesData = JSON.parse(localStorage.getItem('GL_Notes_Data')) || [];
                
                // Есть ли запись настроения ЗА СЕГОДНЯ?
                const hasMood = !!moodData[todayStr];
                // Есть ли текстовая заметка ЗА СЕГОДНЯ?
                const hasNote = notesData.some(n => n.date === todayStr);

                // Точка исчезнет, если вы сделали ХОТЯ БЫ ЧТО-ТО одно (или настроение, или запись)
                return hasMood || hasNote; 
            }

            return false;
        } catch (e) {
            console.error('Ошибка проверки:', e);
            return false;
        }
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        
        // --- ИСПРАВЛЕННЫЙ ВЫЗОВ ПРОВЕРКИ ---
        // Передаем не названия ключей, а типы ('gratitude' или 'diary'), 
        // чтобы функция checkDailyStatus сама выбрала нужные ключи.
        const hasGratitudeToday = this.checkDailyStatus('gratitude'); 
        const hasDiaryToday = this.checkDailyStatus('diary');

        // Логика точки (оставил вашу)
        const gratitudeBadge = !hasGratitudeToday ? '<span class="me-status-dot"></span>' : '';
        const diaryBadge = !hasDiaryToday ? '<span class="me-status-dot"></span>' : '';

        // --- ДАЛЬШЕ ВАШ КОД БЕЗ ИЗМЕНЕНИЙ (СТИЛИ И HTML) ---
        const styles = `
            <style>
                .me-container { padding: 20px; animation: fadeIn 0.3s; font-family: -apple-system, sans-serif; padding-bottom: 100px; }
                .me-title { font-size: 28px; font-weight: 800; margin-bottom: 20px; color: #2d3436; }
                .me-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .me-card {
                    background: #fff; border-radius: 24px; padding: 20px;
                    display: flex; flex-direction: column; align-items: center;
                    justify-content: center; text-align: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    border: 1px solid #f1f2f6; cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s; position: relative;
                }
                .me-card:active { transform: scale(0.95); background: #f9f9fb; }
                .me-icon { font-size: 32px; margin-bottom: 10px; }
                .me-name { font-size: 14px; font-weight: 700; color: #2d3436; line-height: 1.2; }
                .me-card.wide { grid-column: span 2; flex-direction: row; gap: 15px; }
                
                .me-status-dot {
                    position: absolute; top: 15px; right: 15px;
                    width: 10px; height: 10px;
                    background-color: #ff4757; border-radius: 50%;
                    box-shadow: 0 0 0 2px #fff;
                    animation: pulseDot 2s infinite;
                }
                @keyframes pulseDot {
                    0% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.4); }
                    70% { box-shadow: 0 0 0 6px rgba(255, 71, 87, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0); }
                }
            </style>
        `;

        app.innerHTML = `
            ${styles}
            <div class="me-container">
                <h1 class="me-title">Менталка 🧠</h1>
                <div class="me-grid">
                    <div class="me-card" onclick="loadModule('./therapy.js')">
                        <span class="me-icon">👩‍⚕️</span>
                        <span class="me-name">Психотерапевт</span>
                    </div>
                    
                    <div class="me-card" onclick="loadModule('./gratitude.js')">
                        ${gratitudeBadge}
                        <span class="me-icon">🙏</span>
                        <span class="me-name">Благодарность</span>
                    </div>
                    
                    <div class="me-card" onclick="loadModule('./achievements.js')">
                        <span class="me-icon">🏆</span>
                        <span class="me-name">Достижения</span>
                    </div>
                    
                    <div class="me-card" onclick="loadModule('./good_day.js')">
                        <span class="me-icon">✨</span>
                        <span class="me-name">Хорошее за день</span>
                    </div>
                    
                    <div class="me-card" onclick="loadModule('./emotions.js')">
                        <span class="me-icon">🎭</span>
                        <span class="me-name">Эмоции</span>
                    </div>
                    
                    <div class="me-card" onclick="loadModule('./food_mind.js')">
                        <span class="me-icon">🍏</span>
                        <span class="me-name">Питание</span>
                    </div>
                    
                    <div class="me-card" onclick="loadModule('./skin.js')">
                        <span class="me-icon">🧤</span>
                        <span class="me-name">Дерматилломания</span>
                    </div>
                    
                    <div class="me-card wide" onclick="loadModule('./diary.js')">
                        ${diaryBadge}
                        <span class="me-icon">📔</span>
                        <span class="me-name">Дневник</span>
                    </div>
                </div>
            </div>
        `;
    }
};

// Экспорт для системы модулей
export function render() {
    MentalPage.init();
}
