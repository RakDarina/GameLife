/* ==========================================
   СТРАНИЦА: ЗДОРОВЬЕ (МЕНЮ)
   ========================================== */

const HealthPage = {
    render: function() {
        const app = document.getElementById('app-viewport');
        
        // Стили для карточек меню
        const styles = `
            <style>
                .hl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding-top: 20px; }
                .hl-card {
                    background: #fff; border-radius: 24px; padding: 20px;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    aspect-ratio: 1 / 1; box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                    transition: transform 0.2s; cursor: pointer;
                }
                .hl-card:active { transform: scale(0.96); }
                .hl-icon { font-size: 40px; margin-bottom: 10px; }
                .hl-title { font-size: 16px; font-weight: 600; color: #000; }
                .hl-stat { font-size: 13px; color: #8E8E93; margin-top: 5px; }
                
                /* Цвета карточек */
                .hl-water { background: #E0F7FA; color: #006064; }
                .hl-sleep { background: #E8EAF6; color: #1A237E; }
            </style>
        `;

        app.innerHTML = `
            ${styles}
            <div style="padding-bottom: 80px;">
                <h1 style="font-size: 34px; font-weight: 800; margin-bottom: 10px;">Здоровье</h1>
                
                <div class="hl-grid">
                    <div class="hl-card" style="background: #E3F2FD;" onclick="loadModule('./water.js')">
                        <div class="hl-icon">💧</div>
                        <div class="hl-title">Вода</div>
                        <div class="hl-stat">Трекер</div>
                    </div>

                    <div class="hl-card" style="background: #F3E5F5;" onclick="loadModule('./sleep.js')">
                        <div class="hl-icon">😴</div>
                        <div class="hl-title">Сон</div>
                        <div class="hl-stat">8ч 12м</div>
                    </div>

                    <div class="hl-card" style="background: #FFEBEE;" onclick="loadModule('./cycle.js')">
                        <div class="hl-icon">🌸</div>
                        <div class="hl-title">Цикл</div>
                        <div class="hl-stat">Через 5 дн.</div>
                    </div>

                     <div class="hl-card" style="background: #E8F5E9;" onclick="alert('Скоро...')">
                        <div class="hl-icon">⚖️</div>
                        <div class="hl-title">Вес</div>
                        <div class="hl-stat">-- кг</div>
                    </div>
                </div>
            </div>
        `;
    }
};

export function render() {
    HealthPage.render();
}
