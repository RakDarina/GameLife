/* ==========================================
   МОДУЛЬ: ИГРОВОЙ ЦЕНТР (game_ai.js) — AI INTELLIGENCE EDITION
   ========================================== */

const GamePage = {
    // === КОНФИГУРАЦИЯ ИГРЫ ===
    config: {
        levels: [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000],
        wheelCost: 50,
    },

    // Внутреннее состояние
    gameState: {
        coins: 0,
        xp: 0,
        level: 1,
        
        // Инвентарь
        skins: ['default'],
        pets: [],
        backgrounds: ['bg_default'],
        artifacts: [], // NEW: Артефакты
        
        // Экипировка
        equippedSkin: 'default',
        equippedPet: null,
        equippedBg: 'bg_default',
        
        // Квесты и события
        dailyQuest: null,
        questCompleted: false,
        lastQuestDate: "",
        lastEventDate: "",
        
        // Ачивки
        achievements: [],
        
        // Статистика
        stats: {
            questsDone: 0,
            wheelSpins: 0,
            clicks: 0,
            lateNightActions: 0 // NEW: Для ачивки "Сова"
        },

        // Активные баффы (NEW)
        activeBuffs: {
            frozenStreak: false // Пример: заморозка стрика
        }
    },

    currentTab: 'main', 

    // === БАЗЫ ДАННЫХ ===
    db: {
        skins: [
            { id: 'default', name: 'Новичок', price: 0, icon: '🙂', desc: 'Твое начало пути' },
            { id: 'cool', name: 'Крутой', price: 150, icon: '😎', desc: '+10 к стилю' },
            { id: 'smart', name: 'Гений', price: 300, icon: '🤓', desc: 'Знание - сила' },
            { id: 'cyborg', name: 'Киборг', price: 600, icon: '🤖', desc: 'Технологии будущего' },
            { id: 'ninja', name: 'Ниндзя', price: 900, icon: '🥷', desc: 'Скрытный и быстрый' },
            { id: 'king', name: 'Король', price: 2000, icon: '👑', desc: 'Правитель жизни' },
            { id: 'dragon', name: 'Дракон', price: 5000, icon: '🐲', desc: 'Легендарная мощь' }
        ],
        pets: [
            { id: 'dog', name: 'Песель', price: 200, icon: '🐶', desc: 'Верный друг' },
            { id: 'cat', name: 'Котейка', price: 200, icon: '🐱', desc: 'Мурчит когда ты спишь' },
            { id: 'fox', name: 'Лис', price: 450, icon: '🦊', desc: 'Хитрый спутник' },
            { id: 'ufo', name: 'НЛО', price: 800, icon: '🛸', desc: 'Оно следит за тобой' },
            { id: 'unicorn', name: 'Единорог', price: 1500, icon: '🦄', desc: 'Магия существует' }
        ],
        backgrounds: [
            { id: 'bg_default', name: 'Чистый', price: 0, css: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' },
            { id: 'bg_sunset', name: 'Закат', price: 100, css: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)' },
            { id: 'bg_ocean', name: 'Океан', price: 250, css: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)' },
            { id: 'bg_forest', name: 'Лес', price: 300, css: 'linear-gradient(to top, #0ba360 0%, #3cba92 100%)' },
            { id: 'bg_magic', name: 'Магия', price: 500, css: 'linear-gradient(to right, #243949 0%, #517fa4 100%)' },
            { id: 'bg_gold', name: 'Роскошь', price: 1000, css: 'linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)' }
        ],
        // NEW: Артефакты
        artifacts: [
            { id: 'scroll_wisdom', name: 'Свиток Мудрости', price: 50, icon: '📜', type: 'consumable', desc: 'Дает умный совет от ИИ' },
            { id: 'potion_energy', name: 'Зелье Бодрости', price: 100, icon: '🧪', type: 'consumable', desc: 'Восстанавливает настроение' },
            { id: 'hourglass', name: 'Песочные часы', price: 500, icon: '⏳', type: 'buff', desc: 'Защита от срыва задач (24ч)' }
        ],
        achievements: [
            { id: 'rich_1', name: 'Копилка', desc: 'Накопить 100 монет', check: (s) => s.coins >= 100, reward: 50 },
            { id: 'rich_2', name: 'Богач', desc: 'Накопить 1000 монет', check: (s) => s.coins >= 1000, reward: 300 },
            { id: 'lvl_5', name: 'Опытный', desc: 'Достичь 5 уровня', check: (s) => s.level >= 5, reward: 200 },
            { id: 'quest_5', name: 'Помощник', desc: 'Выполнить 5 квестов', check: (s) => s.stats.questsDone >= 5, reward: 150 },
            { id: 'click_100', name: 'Залипала', desc: 'Кликнуть по герою 100 раз', check: (s) => s.stats.clicks >= 100, reward: 50 },
            { id: 'shop_3', name: 'Шопоголик', desc: 'Купить 3 скина', check: (s) => s.skins.length >= 3, reward: 100 },
            // NEW: Скрытые ачивки
            { id: 'night_owl', name: 'Ночная Сова', desc: 'Играть после полуночи (Скрытое)', check: (s) => s.stats.lateNightActions >= 5, reward: 250, hidden: true },
            { id: 'hoarder', name: 'Плюшкин', desc: 'Иметь 5 артефактов (Скрытое)', check: (s) => (s.artifacts || []).length >= 5, reward: 200, hidden: true }
        ]
    },

    // === ИНИЦИАЛИЗАЦИЯ ===
    init: function() {
        this.loadData();
        this.checkNewDayLogic();
        this.checkAchievements();
        this.render();
    },

    loadData: function() {
        const saved = localStorage.getItem('GL_Game_Ultimate');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.gameState = { ...this.gameState, ...parsed };
            if(parsed.stats) this.gameState.stats = { ...this.gameState.stats, ...parsed.stats };
            // Обеспечиваем наличие массивов при миграции
            if(!this.gameState.artifacts) this.gameState.artifacts = [];
        }
    },

    saveData: function() {
        localStorage.setItem('GL_Game_Ultimate', JSON.stringify(this.gameState));
    },

    // === NEW: ИИ-АНАЛИЗАТОР (Logic) ===
    
    // 1. Анализ внешних данных (из других файлов)
    analyzeExternalData: function() {
        // Задачи
        const todo = JSON.parse(localStorage.getItem('GL_Todo_Data') || '{"tasks":[]}').tasks || [];
        const activeTasks = todo.filter(t => !t.done).length;
        const completedTasks = todo.filter(t => t.done).length;
        
        // Цели
        const goalsTree = JSON.parse(localStorage.getItem('GL_Goals_Tree') || '[]');
        let goalsDone = 0;
        const scan = (list) => list.forEach(i => { if(i.completed) goalsDone++; if(i.children) scan(i.children); });
        scan(goalsTree);
        
        // Вода (если есть)
        const water = JSON.parse(localStorage.getItem('GL_Water_Data') || '{}');
        const waterPerc = water.goal ? Math.min(100, Math.round((water.current || 0) / water.goal * 100)) : 0;
        
        return { activeTasks, completedTasks, goalsDone, waterPerc };
    },

    // 2. Расчет настроения (Тамагочи)
    calculateMood: function() {
        const stats = this.analyzeExternalData();
        let score = 50; // База
        
        score += (stats.completedTasks * 5);
        score += (stats.waterPerc > 50 ? 10 : -10);
        if (stats.activeTasks > 5) score -= 10; // Стресс от кучи дел
        
        score = Math.min(100, Math.max(0, score));
        
        let moodIcon = '';
        if (score >= 80) moodIcon = '🔥'; // В ударе
        else if (score >= 40) moodIcon = ''; // Норма
        else moodIcon = '🌧️'; // Грусть
        
        return { score, icon: moodIcon };
    },

    // 3. Генерация предсказания
    getAiPrediction: function() {
        const hour = new Date().getHours();
        const mood = this.calculateMood();
        
        if (mood.score < 30) return "Ты выглядишь уставшей. Может, чайку? ☕";
        if (hour < 9) return "Доброе утро! Зарядимся энергией? ⚡";
        if (hour > 22) return "Пора готовиться ко сну, герой. 🌙";
        if (mood.score > 80) return "Ты просто космос сегодня! 🚀";
        return "Я верю в тебя! ✨";
    },

    // 4. Генерация Умного Квеста
    checkNewDayLogic: function() {
        const today = new Date().toLocaleDateString();
        
        if (this.gameState.lastQuestDate !== today) {
            const stats = this.analyzeExternalData();
            let potentialQuests = [];

            // Умная генерация
            if (stats.waterPerc < 30) {
                potentialQuests.push({ text: "Организм просит воды! Выпей стакан 💧", reward: 35 });
            }
            if (stats.activeTasks > 0) {
                potentialQuests.push({ text: "Закрой одну 'висящую' задачу 🔨", reward: 50 });
            }
            
            // Базовые квесты
            potentialQuests.push(
                { text: "Улыбнись своему отражению 😊", reward: 20 },
                { text: "Сделай глубокий вдох и выдох 🧘‍♀️", reward: 15 },
                { text: "Похвали себя за мелочь 💖", reward: 25 }
            );

            this.gameState.dailyQuest = potentialQuests[Math.floor(Math.random() * potentialQuests.length)];
            this.gameState.questCompleted = false;
            this.gameState.lastQuestDate = today;
            
            // Событие
            if (Math.random() > 0.3) this.triggerRandomEvent();
            
            this.saveData();
        }
    },

    triggerRandomEvent: function() {
        const events = [
            { text: "Ты нашла старую монетку! +10 💰", reward: 10 },
            { text: "Вдохновение посетило тебя! +50 XP ✨", xp: 50 },
            { text: "Птичка напела песенку. Настроение UP! 🐦", xp: 20 }
        ];
        const evt = events[Math.floor(Math.random() * events.length)];
        setTimeout(() => {
            alert(`✨ СОБЫТИЕ ✨\n\n${evt.text}`);
            if(evt.reward) this.addCoins(evt.reward);
            if(evt.xp) this.addXp(evt.xp);
        }, 500);
    },

    // === ИГРОВАЯ ЛОГИКА ===
    addCoins: function(amount) {
        this.gameState.coins += amount;
        this.checkAchievements();
        this.saveData();
        this.render();
    },

    addXp: function(amount) {
        this.gameState.xp += amount;
        const nextLvl = this.config.levels[this.gameState.level] || 999999;
        if (this.gameState.xp >= nextLvl) {
            this.gameState.level++;
            alert(`🎉 НОВЫЙ УРОВЕНЬ: ${this.gameState.level}!`);
            this.addCoins(100);
        }
        this.saveData();
    },

    completeQuest: function() {
        if (!this.gameState.questCompleted) {
            this.gameState.questCompleted = true;
            this.gameState.stats.questsDone++;
            this.addCoins(this.gameState.dailyQuest.reward);
            this.addXp(50);
            alert("✅ Квест выполнен! Ты молодец!");
        }
    },

    collectDailyReward: function() {
        const today = new Date().toDateString();
        const last = localStorage.getItem('GL_Reward_Date');
        
        if (last !== today) {
            const stats = this.analyzeExternalData();
            const baseReward = 50;
            const bonus = (stats.completedTasks * 10) + (stats.goalsDone * 5);
            
            this.addCoins(baseReward + bonus);
            this.addXp(30);
            localStorage.setItem('GL_Reward_Date', today);
            alert(`🎁 НАГРАДА!\nБаза: ${baseReward}\nБонус за продуктивность: ${bonus}\nИтого: ${baseReward+bonus}`);
        } else {
            alert("⏳ Награда уже получена сегодня.");
        }
    },

    // NEW: Использование артефактов
    useArtifact: function(id) {
        const idx = this.gameState.artifacts.indexOf(id);
        if (idx === -1) return;

        // Эффекты
        if (id === 'scroll_wisdom') {
            const quotes = ["Делай, что можешь, с тем, что имеешь.", "Отдых — это тоже часть работы.", "Маленькие шаги ведут к большим целям."];
            alert("📜 Мудрость дня:\n\n" + quotes[Math.floor(Math.random() * quotes.length)]);
            this.gameState.artifacts.splice(idx, 1); // Удаляем
        } 
        else if (id === 'potion_energy') {
            alert("🧪 Ты выпила зелье! Энергия хлещет через край! (+50 XP)");
            this.addXp(50);
            this.gameState.artifacts.splice(idx, 1);
        }
        else if (id === 'hourglass') {
            alert("⏳ Время замедлилось! Твой стрик задач защищен на сегодня.");
            this.gameState.activeBuffs.frozenStreak = true;
            // Не удаляем (если это многоразовый, но сделаем одноразовым для баланса)
            this.gameState.artifacts.splice(idx, 1); 
        }

        this.saveData();
        this.render();
    },

    buyItem: function(type, id) {
        // Если это артефакт - отдельная логика (можно иметь много одинаковых)
        if (type === 'artifacts') {
             const item = this.db.artifacts.find(i => i.id === id);
             if (this.gameState.coins >= item.price) {
                 if (confirm(`Купить "${item.name}" за ${item.price}?`)) {
                     this.gameState.coins -= item.price;
                     this.gameState.artifacts.push(id);
                     this.saveData();
                     this.render();
                 }
             } else { alert("Не хватает монет!"); }
             return;
        }

        // Логика для скинов/петов (уникальные предметы)
        const dbList = this.db[type];
        const item = dbList.find(i => i.id === id);
        const invList = this.gameState[type]; 
        
        if (invList.includes(id)) {
            // Надеть
            if (type === 'skins') this.gameState.equippedSkin = id;
            if (type === 'pets') this.gameState.equippedPet = id;
            if (type === 'backgrounds') this.gameState.equippedBg = id;
            this.saveData();
            this.render();
        } else {
            // Купить
            if (this.gameState.coins >= item.price) {
                if (confirm(`Купить "${item.name}" за ${item.price}?`)) {
                    this.gameState.coins -= item.price;
                    invList.push(id);
                    // Авто-надевание
                    if (type === 'skins') this.gameState.equippedSkin = id;
                    if (type === 'pets') this.gameState.equippedPet = id;
                    if (type === 'backgrounds') this.gameState.equippedBg = id;
                    this.checkAchievements();
                    this.saveData();
                    this.render();
                }
            } else {
                alert("Не хватает монет!");
            }
        }
    },

    checkAchievements: function() {
        // Проверка времени для "Совы"
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 4) {
            this.gameState.stats.lateNightActions++;
        }

        let newUnlock = false;
        this.db.achievements.forEach(ach => {
            if (!this.gameState.achievements.includes(ach.id)) {
                if (ach.check(this.gameState)) {
                    this.gameState.achievements.push(ach.id);
                    this.gameState.coins += ach.reward;
                    alert(`🏆 АЧИВКА: "${ach.name}"!\n+${ach.reward} монет`);
                    newUnlock = true;
                }
            }
        });
        if (newUnlock) this.saveData();
    },

    clickHero: function() {
        this.gameState.stats.clicks++;
        const hero = document.getElementById('hero-img');
        if(hero) {
            hero.style.transform = "scale(0.9)";
            setTimeout(() => hero.style.transform = "scale(1)", 100);
        }
        
        if (Math.random() > 0.8) {
            this.addCoins(1); // Редкий дроп
            // Визуальный эффект +1
            const floatText = document.createElement('div');
            floatText.innerHTML = "+1💰";
            floatText.style.position = 'absolute';
            floatText.style.left = '50%';
            floatText.style.top = '50%';
            floatText.style.color = '#FFD700';
            floatText.style.fontWeight = 'bold';
            floatText.style.animation = 'float 1s ease-out forwards';
            hero.parentElement.appendChild(floatText);
            setTimeout(() => floatText.remove(), 1000);
        }
        
        this.checkAchievements();
        this.saveData();
    },

    spinWheel: function() {
        if (this.gameState.coins < this.config.wheelCost) {
            alert("Недостаточно монет! 😢");
            return;
        }

        this.gameState.coins -= this.config.wheelCost;
        this.gameState.stats.wheelSpins++;
        
        const rand = Math.random();
        let prize = 0;
        let msg = "";

        if (rand < 0.2) { prize = 0; msg = "Пусто... Попробуй еще! 🎱"; }
        else if (rand < 0.5) { prize = 25; msg = "25 монет (утешительный приз)"; }
        else if (rand < 0.8) { prize = 50; msg = "50 монет (свои вернула)"; }
        else if (rand < 0.95) { prize = 100; msg = "100 монет! Хорошо идем! 🍀"; }
        else { prize = 500; msg = "🔥 ДЖЕКПОТ! 500 МОНЕТ! 🔥"; }

        if (prize > 0) this.addCoins(prize);
        else this.saveData();

        this.render();
        const wheel = document.getElementById('casino-wheel');
        if(wheel) {
            wheel.style.transition = "transform 1s ease-out";
            wheel.style.transform = "rotate(1080deg)";
            setTimeout(() => {
                wheel.style.transition = "none";
                wheel.style.transform = "rotate(0deg)";
                alert(msg);
            }, 1050);
        } else { alert(msg); }
    },

    // === ОТРИСОВКА (RENDER) ===
    render: function() {
        const app = document.getElementById('app-viewport');
        const extStats = this.analyzeExternalData();
        const mood = this.calculateMood(); // { score, icon }
        const aiSpeech = this.getAiPrediction();

        const curSkin = this.db.skins.find(s => s.id === this.gameState.equippedSkin) || this.db.skins[0];
        const curPet = this.gameState.equippedPet ? this.db.pets.find(p => p.id === this.gameState.equippedPet) : null;
        const curBg = this.db.backgrounds.find(b => b.id === this.gameState.equippedBg) || this.db.backgrounds[0];

        const nextLvlXp = this.config.levels[this.gameState.level] || 999999;
        const prevLvlXp = this.config.levels[this.gameState.level - 1] || 0;
        const xpPercent = Math.min(100, Math.max(0, ((this.gameState.xp - prevLvlXp) / (nextLvlXp - prevLvlXp)) * 100));

        const styles = `
            <style>
                .gm-wrap { font-family: -apple-system, sans-serif; color: #333; min-height: 80vh; background: ${curBg.css}; border-radius: 20px; padding: 20px; padding-bottom: 80px; animation: fadeIn 0.5s; position: relative; }
                .gm-hero-section { text-align: center; margin-bottom: 20px; padding: 20px; background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); border-radius: 25px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
                
                /* AI BUBBLE */
                .gm-ai-bubble {
                    background: #fff; padding: 10px 15px; border-radius: 20px; border-bottom-left-radius: 0;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 15px;
                    font-size: 14px; font-style: italic; color: #555;
                    position: relative; display: inline-block; max-width: 80%;
                    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .gm-ai-bubble:after {
                    content: ''; position: absolute; bottom: -10px; left: 0;
                    border-width: 10px 10px 0; border-style: solid; border-color: #fff transparent;
                }

                .gm-avatar-container { position: relative; display: inline-block; width: 100px; height: 100px; margin-top: 10px; }
                .gm-avatar { font-size: 80px; cursor: pointer; transition: transform 0.1s; user-select: none; }
                .gm-pet { position: absolute; bottom: 0; right: -20px; font-size: 40px; animation: float 3s infinite ease-in-out; }
                .gm-mood-icon { position: absolute; top: 0; right: -10px; font-size: 30px; animation: pulse 2s infinite; }
                
                .gm-hud { display: flex; justify-content: space-between; font-weight: 800; color: #5856D6; }
                .gm-xp-bar { height: 12px; background: rgba(0,0,0,0.1); border-radius: 6px; overflow: hidden; margin-top: 10px; }
                .gm-xp-fill { height: 100%; background: linear-gradient(90deg, #5856D6, #C694F9); width: ${xpPercent}%; transition: width 0.3s; }
                
                .gm-tabs { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; margin-bottom: 15px; }
                .gm-tab { padding: 8px 16px; background: rgba(255,255,255,0.8); border-radius: 20px; font-weight: 700; font-size: 13px; cursor: pointer; white-space: nowrap; border: 2px solid transparent; }
                .gm-tab.active { background: #5856D6; color: white; border-color: #5856D6; }

                .gm-card { background: rgba(255,255,255,0.9); border-radius: 18px; padding: 15px; margin-bottom: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
                .gm-title { font-weight: 800; font-size: 18px; margin-bottom: 10px; display:flex; justify-content:space-between; }
                
                .gm-shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 10px; }
                .gm-item { background: #fff; border-radius: 15px; padding: 10px; text-align: center; border: 2px solid transparent; cursor: pointer; transition: 0.2s; position: relative; }
                .gm-item.owned { background: #f0fdf4; border-color: #34C759; }
                .gm-item.equipped { background: #e0e7ff; border-color: #5856D6; box-shadow: 0 0 10px #5856D655; }
                .gm-count-badge { position: absolute; top: -5px; right: -5px; background: #FF3B30; color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; display: flex; align-items: center; justify-content: center; }

                .gm-ach-row { display: flex; align-items: center; gap: 10px; padding: 10px; background: #fff; border-radius: 12px; margin-bottom: 8px; opacity: 0.6; filter: grayscale(1); }
                .gm-ach-row.unlocked { opacity: 1; filter: none; border: 1px solid #FFD700; background: #fffbe6; }

                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
                @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
            </style>
        `;

        let contentHtml = '';

        // 1. ГЛАВНАЯ
        if (this.currentTab === 'main') {
            // NEW: Рефлексия (Зеркало мыслей)
            const summaryText = extStats.goalsDone > 0 
                ? "Ты активно идешь к целям! " 
                : (extStats.completedTasks > 2 ? "Продуктивный день! " : "Пока затишье...");
                
            contentHtml = `
                <div class="gm-card" style="background:#FFF9C4; border: 2px dashed #FBC02D;">
                    <div class="gm-title">📜 Квест Дня</div>
                    <div>${this.gameState.dailyQuest.text}</div>
                    <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-weight:bold; color:#F57F17;">+${this.gameState.dailyQuest.reward} монет</span>
                        ${!this.gameState.questCompleted 
                            ? `<button onclick="GamePage.completeQuest()" style="background:#FBC02D; border:none; padding:8px 15px; border-radius:10px; font-weight:bold;">Готово</button>`
                            : `✅`
                        }
                    </div>
                </div>

                <div class="gm-card">
                    <div class="gm-title">🔮 Зеркало Мыслей</div>
                    <div style="font-style:italic; color:#666; margin-bottom:10px;">"${summaryText}"</div>
                    <div style="font-size:12px;">
                        <div>Сделано дел: <b>${extStats.completedTasks}</b></div>
                        <div>Прогресс целей: <b>${extStats.goalsDone}</b> шагов</div>
                    </div>
                </div>

                <div class="gm-card">
                    <div class="gm-title">📊 Характеристики</div>
                    <div style="margin-bottom:8px;">
                        <div style="font-size:12px; font-weight:700;">ЭНЕРГИЯ</div>
                        <div style="background:#eee; height:8px; border-radius:4px; overflow:hidden;">
                            <div style="width:${mood.score}%; background:${mood.score > 50 ? '#34C759' : '#FF9500'}; height:100%;"></div>
                        </div>
                    </div>
                    <div>
                        <div style="font-size:12px; font-weight:700;">ИНТЕЛЛЕКТ</div>
                        <div style="background:#eee; height:8px; border-radius:4px; overflow:hidden;">
                            <div style="width:${Math.min(100, extStats.goalsDone * 10)}%; background:#007AFF; height:100%;"></div>
                        </div>
                    </div>
                </div>

                <button onclick="GamePage.collectDailyReward()" style="width:100%; padding:15px; background:#34C759; color:white; border:none; border-radius:18px; font-weight:bold; font-size:16px; box-shadow:0 5px 15px rgba(52, 199, 89, 0.3);">🎁 Ежедневный бонус</button>
            `;
        }

        // 2. МАГАЗИН
        else if (this.currentTab === 'shop') {
            const renderShopSection = (title, type, items) => `
                <div class="gm-title" style="margin-top:15px;">${title}</div>
                <div class="gm-shop-grid">
                    ${items.map(item => {
                        let isOwned = false;
                        let isEquipped = false;
                        let count = 0;

                        // Логика для Артефактов (расходники) vs Скины
                        if (type === 'artifacts') {
                            count = this.gameState.artifacts.filter(x => x === item.id).length;
                            isOwned = count > 0;
                        } else {
                            isOwned = this.gameState[type].includes(item.id);
                            if(type==='skins') isEquipped = this.gameState.equippedSkin === item.id;
                            if(type==='pets') isEquipped = this.gameState.equippedPet === item.id;
                            if(type==='backgrounds') isEquipped = this.gameState.equippedBg === item.id;
                        }

                        // Действие по клику
                        let clickAction = "";
                        if (type === 'artifacts' && isOwned) {
                            clickAction = `GamePage.useArtifact('${item.id}')`;
                        } else {
                            clickAction = `GamePage.buyItem('${type}', '${item.id}')`;
                        }
                        
                        return `
                        <div class="gm-item ${isOwned ? 'owned' : ''} ${isEquipped ? 'equipped' : ''}" onclick="${clickAction}">
                            ${count > 1 ? `<div class="gm-count-badge">${count}</div>` : ''}
                            <div style="font-size:32px;">${item.icon || '📦'}</div>
                            <div style="font-size:12px; font-weight:bold;">${item.name}</div>
                            <div style="font-size:10px; color:#666;">
                                ${type === 'artifacts' && isOwned ? 'ИСПОЛЬЗОВАТЬ' : (isOwned ? (isEquipped ? 'НАДЕТО' : 'КУПЛЕНО') : item.price + ' 💰')}
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            `;

            contentHtml = `
                ${renderShopSection('🎒 Артефакты', 'artifacts', this.db.artifacts)}
                ${renderShopSection('🎭 Облики', 'skins', this.db.skins)}
                ${renderShopSection('🐾 Питомцы', 'pets', this.db.pets)}
                ${renderShopSection('🎨 Фоны', 'backgrounds', this.db.backgrounds)}
            `;
        }

        // 3. АЧИВКИ
        else if (this.currentTab === 'achievements') {
            contentHtml = `<div class="gm-title">🏆 Зал Славы</div>`;
            contentHtml += this.db.achievements.map(ach => {
                const unlocked = this.gameState.achievements.includes(ach.id);
                if (ach.hidden && !unlocked) return ''; // Не показывать скрытые пока не открыты
                return `
                    <div class="gm-ach-row ${unlocked ? 'unlocked' : ''}">
                        <div style="font-size:24px;">${unlocked ? '🏆' : '🔒'}</div>
                        <div>
                            <div style="font-weight:bold;">${ach.name}</div>
                            <div style="font-size:12px;">${ach.desc}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // 4. КАЗИНО
        else if (this.currentTab === 'casino') {
            contentHtml = `
                <div class="gm-card" style="text-align:center;">
                    <div class="gm-title" style="justify-content:center;">🎡 Колесо Фортуны</div>
                    <div style="color:#666; margin-bottom:20px;">Цена попытки: ${this.config.wheelCost} монет</div>
                    <div id="casino-wheel" style="font-size:80px; display:inline-block; margin-bottom:20px;">🎱</div>
                    <br>
                    <button onclick="GamePage.spinWheel()" style="background:#FF3B30; color:white; padding:15px 30px; border-radius:25px; font-weight:900; border:none; box-shadow:0 5px 15px rgba(255, 59, 48, 0.4);">КРУТИТЬ!</button>
                </div>
            `;
        }

        app.innerHTML = `
            ${styles}
            <div class="gm-wrap">
                <div class="gm-hero-section">
                    <div class="gm-ai-bubble">${aiSpeech}</div>
                    
                    <div class="gm-hud">
                        <span>Lvl ${this.gameState.level}</span>
                        <span>💰 ${this.gameState.coins}</span>
                    </div>
                    
                    <div class="gm-avatar-container" onclick="GamePage.clickHero()">
                        <div id="hero-img" class="gm-avatar">${curSkin.icon}</div>
                        ${curPet ? `<div class="gm-pet">${curPet.icon}</div>` : ''}
                        ${mood.icon ? `<div class="gm-mood-icon">${mood.icon}</div>` : ''}
                    </div>
                    
                    <div class="gm-xp-bar"><div class="gm-xp-fill"></div></div>
                    <div style="font-size:10px; margin-top:2px;">XP: ${Math.floor(this.gameState.xp)} / ${nextLvlXp}</div>
                </div>

                <div class="gm-tabs">
                    <div class="gm-tab ${this.currentTab === 'main' ? 'active' : ''}" onclick="GamePage.currentTab='main'; GamePage.render()">🏠 Дом</div>
                    <div class="gm-tab ${this.currentTab === 'shop' ? 'active' : ''}" onclick="GamePage.currentTab='shop'; GamePage.render()">🛍️ Магазин</div>
                    <div class="gm-tab ${this.currentTab === 'achievements' ? 'active' : ''}" onclick="GamePage.currentTab='achievements'; GamePage.render()">🏆 Ачивки</div>
                    <div class="gm-tab ${this.currentTab === 'casino' ? 'active' : ''}" onclick="GamePage.currentTab='casino'; GamePage.render()">🎰 Казино</div>
                </div>

                <div style="animation: fadeIn 0.3s;">${contentHtml}</div>
            </div>
        `;
    }
};

window.GamePage = GamePage;
export function render() { GamePage.init(); }
