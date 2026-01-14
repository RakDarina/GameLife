/* ==========================================
   МОДУЛЬ: МЕНТАЛЬНОЕ ЗДОРОВЬЕ (mental.js)
   ========================================== */

const MentalPage = {
    init: function() {
        this.render();
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        
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
                /* Специальный стиль для дневника на всю ширину, если нужно */
                .me-card.wide {
                    grid-column: span 2;
                    flex-direction: row;
                    gap: 15px;
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
