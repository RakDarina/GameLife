/* ==========================================
   МОДУЛЬ: МЕНТАЛЬНОЕ ЗДОРОВЬЕ (mental.js)
   ========================================== */

const MentalPage = {
    init: function() {
        this.render();
    },

    // Функция проверки: была ли запись сегодня?
    checkDailyStatus: function(storageKey) {
        try {
            const rawData = localStorage.getItem(storageKey);
            if (!rawData) return false;

            const data = JSON.parse(rawData);
            if (!Array.isArray(data)) return false;

            // Генерируем сегодняшнюю дату в формате DD.MM.YYYY
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            const todayStr = `${day}.${month}.${year}`;

            // Проверяем, есть ли хоть одна запись с такой датой
            // (Предполагаем, что у ваших записей есть поле date)
            return data.some(item => item.date === todayStr);
        } catch (e) {
            console.error('Ошибка проверки статуса для', storageKey, e);
            return false;
        }
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        
        // 1. ПРОВЕРЯЕМ СТАТУС (были ли записи сегодня?)
        // ! ПРОВЕРЬТЕ КЛЮЧИ НИЖЕ: они должны совпадать с тем, как вы сохраняете данные в gratitude.js и diary.js
        const hasGratitudeToday = this.checkDailyStatus('gratitude_entries'); 
        const hasDiaryToday = this.checkDailyStatus('diary_entries');

        // Логика отображения точки (показываем, если записи НЕТ)
        const gratitudeBadge = !hasGratitudeToday ? '<span class="me-status-dot"></span>' : '';
        const diaryBadge = !hasDiaryToday ? '<span class="me-status-dot"></span>' : '';

        const styles = `
            <style>
                .me-container { 
                    padding: 20px; 
                    animation: fadeIn 0.3s; 
                    font-family: -apple-system, sans-serif;
                    padding-bottom: 100px; 
                }
                .me-title { 
                    font-size: 28px; 
                    font-weight: 800; 
                    margin-bottom: 20px; 
                    color: #2d3436;
                }
                .me-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 15px; 
                }
                .me-card {
                    background: #fff;
                    border-radius: 24px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    border: 1px solid #f1f2f6;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    position: relative; /* Важно для позиционирования точки */
                }
                .me-card:active {
                    transform: scale(0.95);
                    background: #f9f9fb;
                }
                .me-icon {
                    font-size: 32px;
                    margin-bottom: 10px;
                }
                .me-name {
                    font-size: 14px;
                    font-weight: 700;
                    color: #2d3436;
                    line-height: 1.2;
                }
                /* Стиль для дневника на всю ширину */
                .me-card.wide {
                    grid-column: span 2;
                    flex-direction: row;
                    gap: 15px;
                }
                
                /* === НОВЫЙ СТИЛЬ: КРАСНАЯ ТОЧКА === */
                .me-status-dot {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    width: 10px;
                    height: 10px;
                    background-color: #ff4757; /* Яркий красный/розовый */
                    border-radius: 50%;
                    box-shadow: 0 0 0 2px #fff; /* Белая обводка, чтобы не сливалось */
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
