/* ==========================================
   МОДУЛЬ: ГЕЙМИФИКАЦИЯ И AI (game_ai.js)
   ========================================== */

const GamePage = {
    // Внутреннее состояние игры
    gameState: {
        coins: 0,
        inventory: ['default'],
        currentSkin: 'default',
        level: 1,
        xp: 0,
        skills: { strength: 1, mental: 1, goals: 1 },
        dailyQuest: null, // Квест от нейросети
        questCompleted: false,
        lastQuestDate: ""
    },

    // База данных магазина
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
        this.checkDailyQuest(); // Инициализация квеста
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

    // --- ЛОГИКА КВЕСТОВ ---
    checkDailyQuest: function() {
        const today = new Date().toLocaleDateString();
        if (this.gameState.lastQuestDate !== today) {
            const quests = [
                { text: "Выпить 2 стакана воды прямо сейчас", reward: 20 },
                { text: "Записать 3 благодарности в дневник", reward: 25 },
                { text: "Сделать 10 приседаний", reward: 30 },
                { text: "Похвалить себя в зеркало", reward: 15 }
            ];
            this.gameState.dailyQuest = quests[Math.floor(Math.random() * quests.length)];
            this.gameState.questCompleted = false;
            this.gameState.lastQuestDate = today;
            this.saveGameData();
        }
    },

    completeQuest: function() {
        if (!this.gameState.questCompleted) {
            this.gameState.coins += this.gameState.dailyQuest.reward;
            this.gameState.xp += this.gameState.dailyQuest.reward;
            this.gameState.questCompleted = true;
            
            // Проверка уровня (каждые 100 XP)
            this.gameState.level = 1 + Math.floor(this.gameState.xp / 100);
            
            this.saveGameData();
            this.render();
            alert(`🎉 Квест выполнен! +${this.gameState.dailyQuest.reward} монет`);
        }
    },

    // --- АНАЛИЗАТОР ---
    analyzeUser: function() {
        const todoData = JSON.parse(localStorage.getItem('GL_Todo_Data') || '{"tasks":[]}');
        const tasks = todoData.tasks || [];
        const completedTasks = tasks.filter(t => t.done).length;
        const totalTasks = tasks.length;
        
        const goalsTree = JSON.parse(localStorage.getItem('GL_Goals_Tree') || '[]');
        let completedGoals = 0;
        const countGoals = (list) => {
            list.forEach(item => {
                if (item.completed) completedGoals++;
                if (item.children) countGoals(item.children);
            });
        };
        countGoals(goalsTree);

        const waterData = JSON.parse(localStorage.getItem('GL_Water_Data') || '{}');
        const waterToday = waterData.current || 0;
        const waterGoal = waterData.goal || 2000;

        const strength = Math.min(100, Math.round((waterToday / waterGoal * 50) + (totalTasks ? (completedTasks / totalTasks * 50) : 0)));
        const intellect = Math.min(100, completedGoals * 5); 

        return { strength, intellect, completedTasks, waterToday };
    },

    collectReward: function() {
        const lastRewardDate = localStorage.getItem('GL_Game_LastReward');
        const today = new Date().toDateString();

        if (lastRewardDate !== today) {
            const stats = this.analyzeUser();
            const reward = 10 + (stats.completedTasks * 5);
            this.gameState.coins += reward;
            this.gameState.xp += reward;
            this.gameState.level = 1 + Math.floor(this.gameState.xp / 100);
            localStorage.setItem('GL_Game_LastReward', today);
            this.saveGameData();
            alert(`🎁 Ежедневная награда: +${reward} монет!`);
            this.render();
        } else {
            alert('На сегодня награда уже получена!');
        }
    },

    buySkin: function(skinId) {
        const item = this.shopItems.find(i => i.id === skinId);
        if (this.gameState.inventory.includes(skinId)) {
            this.gameState.currentSkin = skinId;
            this.saveGameData();
            this.render();
        } else {
            if (this.gameState.coins >= item.price) {
                if(confirm(`Купить "${item.name}" за ${item.price} монет?`)) {
                    this.gameState.coins -= item.price;
                    this.gameState.inventory.push(skinId);
                    this.gameState.currentSkin = skinId;
                    this.saveGameData();
                    this.render();
                }
            } else {
                alert('Недостаточно монет!');
            }
        }
    },

    getOracleAdvice: function(stats) {
        if (stats.strength < 30) return "⚠️ Твое тело требует внимания. Выпей воды!";
        if (stats.intellect < 10) return "📚 Время размять мозги новой целью.";
        return "✨ Ты на правильном пути, продолжай в том же духе!";
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const stats = this.analyzeUser();
        const currentSkinObj = this.shopItems.find(i => i.id === this.gameState.currentSkin);
        const oracleText = this.getOracleAdvice(stats);

        const styles = `
            <style>
                .gm-container { animation: fadeIn 0.4s; font-family: -apple-system, sans-serif; color: #1C1C1E; padding: 20px; padding-bottom: 50px; }
                .gm-hero-card {
                    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
                    color: white; border-radius: 24px; padding: 25px; text-align: center;
                    box-shadow: 0 10px 20px rgba(37, 117, 252, 0.3); margin-bottom: 20px; position: relative;
                }
                .gm-avatar { font-size: 80px; display: block; margin-bottom: 10px; animation: bounce 2s infinite; }
                .gm-coins { position: absolute; top: 20px; right: 20px; font-size: 16px; font-weight: 800; background: #FFD700; color: #000; padding: 6px 12px; border-radius: 20px; }
                
                .gm-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
                .gm-stat-box { background: white; padding: 15px; border-radius: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
                .gm-progress-bg { background: #F2F2F7; height: 8px; border-radius: 4px; margin-top: 8px; overflow: hidden; }
                .gm-progress-fill { height: 100%; transition: width 0.5s; }

                .gm-quest-card {
                    background: #FFF9E5; border: 2px dashed #FFD700; border-radius: 20px; padding: 20px;
                    margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;
                }
                .gm-quest-card.completed { background: #F2F2F7; border-color: #34C759; opacity: 0.8; }
                .gm-quest-btn { background: #FFD700; border: none; padding: 10px 15px; border-radius: 12px; font-weight: 700; cursor: pointer; }
                
                .gm-shop-grid { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 10px; }
                .gm-shop-item { min-width: 90px; background: white; padding: 15px; border-radius: 18px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.03); cursor: pointer; border: 2px solid transparent; }
                .gm-shop-item.active { border-color: #34C759; }
                
                .gm-collect-btn { background: #34C759; color: white; border: none; width: 100%; padding: 16px; border-radius: 18px; font-weight: 700; margin-bottom: 20px; cursor: pointer; }

                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
            </style>
        `;

        app.innerHTML = `
            ${styles}
            <div class="gm-container">
                <div class="gm-hero-card">
                    <div class="gm-coins">${this.gameState.coins} 💰</div>
                    <div class="gm-avatar">${currentSkinObj.icon}</div>
                    <div style="font-size: 20px; font-weight: 800;">Герой ${this.gameState.level} уровня</div>
                    <div style="opacity: 0.8; font-size: 14px;">Опыт (XP): ${this.gameState.xp}</div>
                </div>

                <div class="gm-quest-card ${this.gameState.questCompleted ? 'completed' : ''}">
                    <div>
                        <div style="font-size: 12px; font-weight: 800; color: #B28B00;">КВЕСТ ДНЯ</div>
                        <div style="font-size: 15px; margin-top: 4px;">${this.gameState.dailyQuest.text}</div>
                    </div>
                    ${!this.gameState.questCompleted 
                        ? `<button class="gm-quest-btn" onclick="GamePage.completeQuest()">Готово</button>`
                        : `<span style="color: #34C759; font-weight: 800;">✅</span>`
                    }
                </div>

                <button class="gm-collect-btn" onclick="GamePage.collectReward()">🎁 Забрать награду за дела</button>

                <div class="gm-stats-grid">
                    <div class="gm-stat-box">
                        <div style="font-size: 11px; font-weight: 700;">СИЛА</div>
                        <div class="gm-progress-bg"><div class="gm-progress-fill" style="width:${stats.strength}%; background:#FF3B30"></div></div>
                    </div>
                    <div class="gm-stat-box">
                        <div style="font-size: 11px; font-weight: 700;">ИНТЕЛЛЕКТ</div>
                        <div class="gm-progress-bg"><div class="gm-progress-fill" style="width:${stats.intellect}%; background:#007AFF"></div></div>
                    </div>
                </div>

                <div class="gm-shop-grid">
                    ${this.shopItems.map(item => `
                        <div class="gm-shop-item ${this.gameState.currentSkin === item.id ? 'active' : ''}" onclick="GamePage.buySkin('${item.id}')">
                            <div style="font-size: 30px;">${item.icon}</div>
                            <div style="font-size: 11px; margin-top: 5px;">${this.gameState.inventory.includes(item.id) ? 'Выбрать' : item.price + ' 💰'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};

window.GamePage = GamePage;
export function render() { GamePage.init(); }
