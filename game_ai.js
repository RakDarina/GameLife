/* ==========================================
   МОДУЛЬ: ГЕЙМИФИКАЦИЯ И AI (game_ai.js)
   ========================================== */

const GamePage = {
    // Внутреннее состояние игры (сохраняется отдельно)
    gameState: {
        coins: 0,
        inventory: ['default'], // Купленные скины
        currentSkin: 'default',
        level: 1,
        xp: 0
    },

    // База данных магазина (можно расширять)
    shopItems: [
        { id: 'default', name: 'Обычный', price: 0, icon: '🙂' },
        { id: 'cool', name: 'Крутой', price: 50, icon: '😎' },
        { id: 'smart', name: 'Умник', price: 100, icon: '🤓' },
        { id: 'robot', name: 'Киборг', price: 200, icon: '🤖' },
        { id: 'cat', name: 'Котик', price: 500, icon: '🐱' },
        { id: 'queen', name: 'Королева', price: 1000, icon: '👸' }
    ],

    init: function() {
        this.loadGameData();
        this.render();
    },

    loadGameData: function() {
        const saved = localStorage.getItem('GL_Game_State');
        if (saved) {
            this.gameState = JSON.parse(saved);
        }
    },

    saveGameData: function() {
        localStorage.setItem('GL_Game_State', JSON.stringify(this.gameState));
    },

    // --- АНАЛИЗАТОР (Чтение данных из других модулей) ---
    analyzeUser: function() {
        // 1. Читаем задачи на сегодня
        const todoData = JSON.parse(localStorage.getItem('GL_Todo_Data') || '{"tasks":[]}');
        const tasks = todoData.tasks || [];
        const completedTasks = tasks.filter(t => t.done).length;
        const totalTasks = tasks.length;
        
        // 2. Читаем цели
        const goalsTree = JSON.parse(localStorage.getItem('GL_Goals_Tree') || '[]');
        // Простая рекурсия для подсчета всех выполненных целей
        let completedGoals = 0;
        const countGoals = (list) => {
            list.forEach(item => {
                if (item.completed) completedGoals++;
                if (item.children) countGoals(item.children);
            });
        };
        countGoals(goalsTree);

        // 3. Читаем Воду (если есть)
        const waterData = JSON.parse(localStorage.getItem('GL_Water_Data') || '{}');
        const waterToday = waterData.current || 0;
        const waterGoal = waterData.goal || 2000;

        // 4. Расчет характеристик RPG
        // Сила = Вода % + Задачи %
        const strength = Math.min(100, Math.round((waterToday / waterGoal * 50) + (totalTasks ? (completedTasks / totalTasks * 50) : 0)));
        
        // Интеллект = Выполненные цели (каждая дает очки)
        const intellect = Math.min(100, completedGoals * 5); 

        // Настроение (из дневника или задач)
        let mood = "Neutral";
        if (completedTasks > 2) mood = "Good";
        if (completedTasks === 0 && totalTasks > 0) mood = "Bad";

        // 5. Начисление монет (Виртуальная валюта)
        // Чтобы монеты не накручивались бесконечно при обновлении, 
        // мы просто считаем "потенциал" и сохраняем разницу, 
        // но для простоты здесь сделаем механику "Сбор награды" кнопкой.
        
        return { strength, intellect, mood, completedTasks, waterToday };
    },

    // --- ЛОГИКА ИГРЫ ---
    collectReward: function() {
        // Даем 10 монет за каждую выполненную задачу сегодня
        // В реальном приложении нужно хранить ID, за которые уже платили.
        // Тут сделаем упрощенно: просто подарок каждый день.
        
        const lastRewardDate = localStorage.getItem('GL_Game_LastReward');
        const today = new Date().toDateString();

        if (lastRewardDate !== today) {
            const stats = this.analyzeUser();
            const reward = 10 + (stats.completedTasks * 5); // База 10 + 5 за задачу
            
            this.gameState.coins += reward;
            this.gameState.xp += reward;
            
            // Повышение уровня (каждые 100 xp)
            this.gameState.level = 1 + Math.floor(this.gameState.xp / 100);

            localStorage.setItem('GL_Game_LastReward', today);
            this.saveGameData();
            alert(`🎁 Ежедневная награда: +${reward} монет!`);
            this.render();
        } else {
            alert('На сегодня награда уже получена! Возвращайся завтра.');
        }
    },

    buySkin: function(skinId) {
        const item = this.shopItems.find(i => i.id === skinId);
        if (this.gameState.inventory.includes(skinId)) {
            // Если уже куплено - надеваем
            this.gameState.currentSkin = skinId;
            this.saveGameData();
            this.render();
        } else {
            // Покупка
            if (this.gameState.coins >= item.price) {
                if(confirm(`Купить "${item.name}" за ${item.price} монет?`)) {
                    this.gameState.coins -= item.price;
                    this.gameState.inventory.push(skinId);
                    this.gameState.currentSkin = skinId;
                    this.saveGameData();
                    this.render();
                }
            } else {
                alert('Недостаточно монет! Выполняй цели и задачи.');
            }
        }
    },

    // --- AI ОРАКУЛ (Генератор прогноза) ---
    getOracleAdvice: function(stats) {
        const advices = [];
        
        if (stats.strength < 30) advices.push("⚠️ Твое тело обезвожено или малоактивно. Выпей стакан воды прямо сейчас!");
        else if (stats.strength > 80) advices.push("💪 Ты в отличной физической форме сегодня!");
        
        if (stats.intellect < 10) advices.push("📚 Мозг требует пищи. Выполни хотя бы одну маленькую цель.");
        else advices.push("🧠 Твоя продуктивность на высоте. Самое время для сложных проектов.");

        if (stats.completedTasks === 0) advices.push("⚡️ Начни с самого простого дела, чтобы разогнаться.");

        // Случайная мудрость, если все хорошо
        const randomWisdom = [
            "Сегодня идеальный день, чтобы похвалить себя.",
            "Не забывай дышать глубже.",
            "Ты справляешься лучше, чем думаешь.",
            "Геймификация жизни — путь к успеху!"
        ];

        return advices.length > 0 ? advices[0] : randomWisdom[Math.floor(Math.random() * randomWisdom.length)];
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const stats = this.analyzeUser();
        const currentSkinObj = this.shopItems.find(i => i.id === this.gameState.currentSkin);
        const oracleText = this.getOracleAdvice(stats);

        const styles = `
            <style>
                .gm-container { animation: fadeIn 0.4s; font-family: -apple-system, sans-serif; color: #1C1C1E; padding-bottom: 50px; }
                
                /* Блок Персонажа */
                .gm-hero-card {
                    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
                    color: white; border-radius: 24px; padding: 25px; text-align: center;
                    box-shadow: 0 10px 20px rgba(37, 117, 252, 0.3); margin-bottom: 25px; position: relative; overflow: hidden;
                }
                .gm-avatar { font-size: 80px; display: block; margin-bottom: 10px; animation: bounce 2s infinite; }
                .gm-level-badge { 
                    background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 12px; 
                    font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
                }
                .gm-coins { 
                    position: absolute; top: 20px; right: 20px; 
                    font-size: 16px; font-weight: 800; background: #FFD700; color: #000; 
                    padding: 6px 12px; border-radius: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                }

                /* Статы */
                .gm-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
                .gm-stat-box { background: white; padding: 15px; border-radius: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
                .gm-stat-label { font-size: 12px; color: #8E8E93; font-weight: 700; margin-bottom: 8px; }
                .gm-progress-bg { background: #F2F2F7; height: 8px; border-radius: 4px; overflow: hidden; }
                .gm-progress-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }

                /* Оракул */
                .gm-oracle-box {
                    background: #fff; border: 2px solid #E5E5EA; border-radius: 20px; padding: 20px;
                    margin-bottom: 25px; position: relative;
                }
                .gm-oracle-title { font-weight: 800; font-size: 14px; color: #5856D6; margin-bottom: 5px; text-transform: uppercase; }
                .gm-oracle-text { font-style: italic; color: #3A3A3C; line-height: 1.5; }

                /* Магазин */
                .gm-shop-title { font-size: 20px; font-weight: 800; margin-bottom: 15px; }
                .gm-shop-grid { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 10px; }
                .gm-shop-item { 
                    min-width: 90px; background: white; padding: 15px; border-radius: 18px; text-align: center;
                    border: 2px solid transparent; cursor: pointer; transition: 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.03);
                }
                .gm-shop-item.active { border-color: #34C759; background: #F0FFF4; }
                .gm-shop-item.locked { opacity: 0.6; }
                .gm-shop-icon { font-size: 32px; margin-bottom: 8px; }
                .gm-shop-price { font-size: 12px; font-weight: 700; color: #8E8E93; }

                .gm-collect-btn {
                    background: #34C759; color: white; border: none; width: 100%; padding: 16px;
                    border-radius: 18px; font-weight: 700; font-size: 16px; margin-bottom: 20px;
                    cursor: pointer; box-shadow: 0 4px 15px rgba(52, 199, 89, 0.3);
                }

                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
            </style>
        `;

        const shopHtml = this.shopItems.map(item => {
            const isOwned = this.gameState.inventory.includes(item.id);
            const isEquipped = this.gameState.currentSkin === item.id;
            
            return `
                <div class="gm-shop-item ${isEquipped ? 'active' : ''}" onclick="GamePage.buySkin('${item.id}')">
                    <div class="gm-shop-icon">${item.icon}</div>
                    <div class="gm-shop-price">
                        ${isOwned ? (isEquipped ? 'Надето' : 'Куплено') : item.price + ' 💰'}
                    </div>
                </div>
            `;
        }).join('');

        app.innerHTML = `
            ${styles}
            <div class="gm-container">
                <div class="gm-hero-card">
                    <div class="gm-coins">${this.gameState.coins} 💰</div>
                    <div class="gm-avatar">${currentSkinObj.icon}</div>
                    <div style="font-size: 22px; font-weight: 800;">Герой ${this.gameState.level} ур.</div>
                    <div style="margin-top: 5px; opacity: 0.8;">XP: ${this.gameState.xp}</div>
                </div>

                <button class="gm-collect-btn" onclick="GamePage.collectReward()">🎁 Получить награду за сегодня</button>

                <div class="gm-stats-grid">
                    <div class="gm-stat-box">
                        <div class="gm-stat-label">СИЛА (Тело)</div>
                        <div class="gm-progress-bg">
                            <div class="gm-progress-fill" style="width:${stats.strength}%; background:#FF3B30"></div>
                        </div>
                        <div style="font-size:10px; margin-top:4px; text-align:right">${stats.strength}%</div>
                    </div>
                    <div class="gm-stat-box">
                        <div class="gm-stat-label">ИНТЕЛЛЕКТ (Цели)</div>
                        <div class="gm-progress-bg">
                            <div class="gm-progress-fill" style="width:${stats.intellect}%; background:#007AFF"></div>
                        </div>
                        <div style="font-size:10px; margin-top:4px; text-align:right">${stats.intellect}%</div>
                    </div>
                </div>

                <div class="gm-oracle-box">
                    <div class="gm-oracle-title">🤖 AI-Ассистент сообщает:</div>
                    <div class="gm-oracle-text">"${oracleText}"</div>
                </div>

                <div class="gm-shop-title">Гардеробная</div>
                <div class="gm-shop-grid">
                    ${shopHtml}
                </div>
            </div>
        `;
    }
};

window.GamePage = GamePage;
export function render() { GamePage.init(); }
