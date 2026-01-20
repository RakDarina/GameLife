/* ==========================================
   МОДУЛЬ: ИГРОВОЙ ЦЕНТР (game_ai.js) — ULTIMATE EDITION
   ========================================== */

const GamePage = {
    // === КОНФИГУРАЦИЯ ИГРЫ ===
    config: {
        levels: [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000], // XP для уровней
        wheelCost: 50, // Цена прокрутки колеса
    },

    // Внутреннее состояние (сохраняется)
    gameState: {
        coins: 0,
        xp: 0,
        level: 1,
        
        // Инвентарь
        skins: ['default'],
        pets: [],
        backgrounds: ['bg_default'],
        
        // Экипировка
        equippedSkin: 'default',
        equippedPet: null,
        equippedBg: 'bg_default',
        
        // Квесты и события
        dailyQuest: null,
        questCompleted: false,
        lastQuestDate: "",
        lastEventDate: "", // Для случайных событий
        
        // Ачивки (храним ID полученных)
        achievements: [],
        
        // Статистика для ачивок
        stats: {
            questsDone: 0,
            wheelSpins: 0,
            clicks: 0
        }
    },

    // Текущая вкладка интерфейса
    currentTab: 'main', // main, shop, inventory, casino, achievements

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
        achievements: [
            { id: 'rich_1', name: 'Копилка', desc: 'Накопить 100 монет', check: (s) => s.coins >= 100, reward: 50 },
            { id: 'rich_2', name: 'Богач', desc: 'Накопить 1000 монет', check: (s) => s.coins >= 1000, reward: 300 },
            { id: 'lvl_5', name: 'Опытный', desc: 'Достичь 5 уровня', check: (s) => s.level >= 5, reward: 200 },
            { id: 'quest_5', name: 'Помощник', desc: 'Выполнить 5 квестов', check: (s) => s.stats.questsDone >= 5, reward: 150 },
            { id: 'click_100', name: 'Залипала', desc: 'Кликнуть по герою 100 раз', check: (s) => s.stats.clicks >= 100, reward: 50 },
            { id: 'shop_3', name: 'Шопоголик', desc: 'Купить 3 скина', check: (s) => s.skins.length >= 3, reward: 100 }
        ]
    },

    // === ИНИЦИАЛИЗАЦИЯ ===
    init: function() {
        this.loadData();
        this.checkNewDayLogic(); // Квесты и события
        this.checkAchievements(); // Проверка ачивок при входе
        this.render();
    },

    loadData: function() {
        const saved = localStorage.getItem('GL_Game_Ultimate');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Миграция данных (если добавились новые поля)
            this.gameState = { ...this.gameState, ...parsed };
            // Глубокое слияние для статов, чтобы не потерять click count
            if(parsed.stats) this.gameState.stats = { ...this.gameState.stats, ...parsed.stats };
        }
    },

    saveData: function() {
        localStorage.setItem('GL_Game_Ultimate', JSON.stringify(this.gameState));
    },

    // === ЛОГИКА МИРА ===
    checkNewDayLogic: function() {
        const today = new Date().toLocaleDateString();
        
        // 1. Ежедневный квест
        if (this.gameState.lastQuestDate !== today) {
            const quests = [
                { text: "Выпить стакан воды и улыбнуться", reward: 25 },
                { text: "Записать одну цель на завтра", reward: 30 },
                { text: "Сделать 20 прыжков на месте", reward: 35 },
                { text: "Убрать одну вещь на место", reward: 20 },
                { text: "Послушать любимую песню", reward: 15 },
                { text: "Прочитать 1 страницу книги", reward: 40 }
            ];
            this.gameState.dailyQuest = quests[Math.floor(Math.random() * quests.length)];
            this.gameState.questCompleted = false;
            this.gameState.lastQuestDate = today;
            
            // 2. Случайное событие (только раз в день)
            if (Math.random() > 0.3) { // 70% шанс события
                this.triggerRandomEvent();
            }
            this.saveData();
        }
    },

    triggerRandomEvent: function() {
        const events = [
            { text: "Ты нашла старую монетку под диваном!", reward: 10 },
            { text: "Вдохновение посетило тебя! +XP", xp: 50 },
            { text: "Ты встретила бродячего торговца. Он подарил тебе удачу.", reward: 5 },
            { text: "Птичка напела тебе песенку. Настроение улучшилось!", xp: 20 }
        ];
        const evt = events[Math.floor(Math.random() * events.length)];
        
        // Отложенный алерт, чтобы страница успела загрузиться
        setTimeout(() => {
            alert(`✨ СЛУЧАЙНОЕ СОБЫТИЕ ✨\n\n${evt.text}`);
            if(evt.reward) this.addCoins(evt.reward);
            if(evt.xp) this.addXp(evt.xp);
        }, 500);
    },

    // === ЛОГИКА ИГРОКА ===
    addCoins: function(amount) {
        this.gameState.coins += amount;
        this.checkAchievements();
        this.saveData();
        this.render(); // Обновляем UI
    },

    addXp: function(amount) {
        this.gameState.xp += amount;
        // Проверка левелапа
        const nextLvl = this.config.levels[this.gameState.level] || 999999;
        if (this.gameState.xp >= nextLvl) {
            this.gameState.level++;
            alert(`🎉 УРОВЕНЬ ПОВЫШЕН!\nТы достигла уровня ${this.gameState.level}!`);
            this.addCoins(100); // Бонус за уровень
        }
        this.saveData();
    },

    completeQuest: function() {
        if (!this.gameState.questCompleted) {
            this.gameState.questCompleted = true;
            this.gameState.stats.questsDone++;
            this.addCoins(this.gameState.dailyQuest.reward);
            this.addXp(50);
            alert("✅ Квест выполнен!");
        }
    },

    collectDailyReward: function() {
        const today = new Date().toDateString();
        const last = localStorage.getItem('GL_Reward_Date');
        
        if (last !== today) {
            // Анализируем активность для бонуса
            const stats = this.analyzeExternalData();
            const baseReward = 50;
            const bonus = (stats.completedTasks * 10) + (stats.goalsDone * 5);
            
            this.addCoins(baseReward + bonus);
            this.addXp(30);
            
            localStorage.setItem('GL_Reward_Date', today);
            alert(`🎁 НАГРАДА ПОЛУЧЕНА!\nБаза: ${baseReward}\nБонус за дела: ${bonus}\nВсего: ${baseReward+bonus} монет`);
        } else {
            alert("⏳ Ты уже забирала награду сегодня. Приходи завтра!");
        }
    },

    // Чтение данных из других файлов (безопасно)
    analyzeExternalData: function() {
        // Задачи
        const todo = JSON.parse(localStorage.getItem('GL_Todo_Data') || '{"tasks":[]}').tasks || [];
        const completedTasks = todo.filter(t => t.done).length;
        
        // Цели
        const goalsTree = JSON.parse(localStorage.getItem('GL_Goals_Tree') || '[]');
        let goalsDone = 0;
        const scan = (list) => list.forEach(i => { if(i.completed) goalsDone++; if(i.children) scan(i.children); });
        scan(goalsTree);
        
        // Вода
        const water = JSON.parse(localStorage.getItem('GL_Water_Data') || '{}');
        const waterPerc = water.goal ? Math.min(100, Math.round((water.current || 0) / water.goal * 100)) : 0;
        
        return { completedTasks, goalsDone, waterPerc };
    },

    checkAchievements: function() {
        let newUnlock = false;
        this.db.achievements.forEach(ach => {
            if (!this.gameState.achievements.includes(ach.id)) {
                if (ach.check(this.gameState)) {
                    this.gameState.achievements.push(ach.id);
                    this.gameState.coins += ach.reward;
                    alert(`🏆 ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО!\n"${ach.name}"\nНаграда: ${ach.reward} монет`);
                    newUnlock = true;
                }
            }
        });
        if (newUnlock) this.saveData();
    },

    // === ИНТЕРАКТИВ ===
    clickHero: function() {
        this.gameState.stats.clicks++;
        
        // Шанс дропа монетки
        if (Math.random() > 0.7) {
            this.addCoins(1);
            // Анимация монетки (просто через UI обновление)
        }
        
        // Визуальный эффект через DOM
        const hero = document.getElementById('hero-img');
        if(hero) {
            hero.style.transform = "scale(0.9)";
            setTimeout(() => hero.style.transform = "scale(1)", 100);
        }
        
        this.checkAchievements();
        this.saveData();
    },

    spinWheel: function() {
        if (this.gameState.coins < this.config.wheelCost) {
            alert("Недостаточно монет! Нужно 50 💰");
            return;
        }

        this.gameState.coins -= this.config.wheelCost;
        this.gameState.stats.wheelSpins++;
        
        // Простая рулетка
        const rand = Math.random();
        let prize = 0;
        let msg = "";

        if (rand < 0.1) { prize = 0; msg = "Пусто... 😢"; }
        else if (rand < 0.5) { prize = 25; msg = "25 монет (мало)"; }
        else if (rand < 0.8) { prize = 50; msg = "50 монет (возврат)"; }
        else if (rand < 0.95) { prize = 100; msg = "100 монет! Неплохо!"; }
        else { prize = 500; msg = "🔥 ДЖЕКПОТ! 500 МОНЕТ! 🔥"; }

        if (prize > 0) this.addCoins(prize);
        else this.saveData(); // просто сохраняем списание

        this.render();
        // Небольшой хак для анимации вращения
        const wheel = document.getElementById('casino-wheel');
        if(wheel) {
            wheel.style.transition = "transform 1s ease-out";
            wheel.style.transform = "rotate(720deg)";
            setTimeout(() => {
                wheel.style.transition = "none";
                wheel.style.transform = "rotate(0deg)";
                alert(msg);
            }, 1050);
        } else {
            alert(msg);
        }
    },

    // === МАГАЗИН И ИНВЕНТАРЬ ===
    buyItem: function(type, id) {
        // type: 'skins', 'pets', 'backgrounds'
        const dbList = this.db[type];
        const item = dbList.find(i => i.id === id);
        const invList = this.gameState[type]; // inventory list
        
        if (invList.includes(id)) {
            // Если куплено - надеваем
            if (type === 'skins') this.gameState.equippedSkin = id;
            if (type === 'pets') this.gameState.equippedPet = id;
            if (type === 'backgrounds') this.gameState.equippedBg = id;
            this.saveData();
            this.render();
        } else {
            // Покупка
            if (this.gameState.coins >= item.price) {
                if (confirm(`Купить "${item.name}" за ${item.price}?`)) {
                    this.gameState.coins -= item.price;
                    invList.push(id);
                    // Сразу надеваем
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

    // === ОТРИСОВКА ===
    render: function() {
        const app = document.getElementById('app-viewport');
        const extStats = this.analyzeExternalData();
        
        // Находим объекты текущей экипировки
        const curSkin = this.db.skins.find(s => s.id === this.gameState.equippedSkin) || this.db.skins[0];
        const curPet = this.gameState.equippedPet ? this.db.pets.find(p => p.id === this.gameState.equippedPet) : null;
        const curBg = this.db.backgrounds.find(b => b.id === this.gameState.equippedBg) || this.db.backgrounds[0];

        // XP Bar calc
        const nextLvlXp = this.config.levels[this.gameState.level] || 999999;
        const prevLvlXp = this.config.levels[this.gameState.level - 1] || 0;
        const xpPercent = Math.min(100, Math.max(0, ((this.gameState.xp - prevLvlXp) / (nextLvlXp - prevLvlXp)) * 100));

        const styles = `
            <style>
                .gm-wrap { 
                    font-family: -apple-system, sans-serif; 
                    color: #333; 
                    min-height: 80vh; 
                    background: ${curBg.css}; /* Динамический фон */
                    border-radius: 20px;
                    padding: 20px;
                    padding-bottom: 80px;
                    animation: fadeIn 0.5s;
                }
                
                /* ГЕРОЙ */
                .gm-hero-section {
                    text-align: center; margin-bottom: 20px;
                    padding: 20px; background: rgba(255,255,255,0.7);
                    backdrop-filter: blur(10px); border-radius: 25px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    position: relative;
                }
                .gm-avatar-container { 
                    position: relative; display: inline-block; 
                    width: 100px; height: 100px;
                }
                .gm-avatar { 
                    font-size: 80px; cursor: pointer; transition: transform 0.1s;
                    user-select: none;
                }
                .gm-pet {
                    position: absolute; bottom: 0; right: -20px;
                    font-size: 40px; animation: float 3s infinite ease-in-out;
                }
                .gm-hud {
                    display: flex; justify-content: space-between; margin-bottom: 10px;
                    font-weight: 800; color: #5856D6;
                }
                .gm-xp-bar {
                    height: 12px; background: rgba(0,0,0,0.1); border-radius: 6px; overflow: hidden; margin-top: 10px;
                }
                .gm-xp-fill {
                    height: 100%; background: linear-gradient(90deg, #5856D6, #C694F9); width: ${xpPercent}%; transition: width 0.3s;
                }
                
                /* ВКЛАДКИ */
                .gm-tabs {
                    display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; margin-bottom: 15px;
                }
                .gm-tab {
                    padding: 8px 16px; background: rgba(255,255,255,0.8); border-radius: 20px;
                    font-weight: 700; font-size: 13px; cursor: pointer; white-space: nowrap;
                    border: 2px solid transparent;
                }
                .gm-tab.active {
                    background: #5856D6; color: white; border-color: #5856D6;
                }

                /* КАРТОЧКИ */
                .gm-card {
                    background: rgba(255,255,255,0.9); border-radius: 18px; padding: 15px; margin-bottom: 15px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                }
                .gm-title { font-weight: 800; font-size: 18px; margin-bottom: 10px; display:flex; justify-content:space-between; }
                
                /* МАГАЗИН */
                .gm-shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 10px; }
                .gm-item {
                    background: #fff; border-radius: 15px; padding: 10px; text-align: center;
                    border: 2px solid transparent; cursor: pointer; transition: 0.2s;
                }
                .gm-item.owned { background: #f0fdf4; border-color: #34C759; }
                .gm-item.equipped { background: #e0e7ff; border-color: #5856D6; box-shadow: 0 0 10px #5856D655; }
                .gm-item:active { transform: scale(0.95); }
                .gm-icon { font-size: 32px; margin-bottom: 5px; }
                
                /* АЧИВКИ */
                .gm-ach-row {
                    display: flex; align-items: center; gap: 10px; padding: 10px;
                    background: #fff; border-radius: 12px; margin-bottom: 8px;
                    opacity: 0.6; filter: grayscale(1);
                }
                .gm-ach-row.unlocked { opacity: 1; filter: none; border: 1px solid #FFD700; background: #fffbe6; }
                
                /* КАЗИНО */
                .gm-wheel-container { text-align: center; padding: 20px; }
                .gm-wheel { font-size: 80px; display: inline-block; margin-bottom: 20px; }
                .gm-spin-btn {
                    background: #FF3B30; color: white; padding: 15px 30px; border-radius: 25px;
                    font-weight: 900; font-size: 18px; border: none; cursor: pointer;
                    box-shadow: 0 5px 15px rgba(255, 59, 48, 0.4);
                }

                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            </style>
        `;

        // === ГЕНЕРАЦИЯ КОНТЕНТА В ЗАВИСИМОСТИ ОТ ВКЛАДКИ ===
        let contentHtml = '';

        // 1. ГЛАВНАЯ
        if (this.currentTab === 'main') {
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
                    <div class="gm-title">📊 Твои Характеристики</div>
                    
                    <div style="margin-bottom:8px;">
                        <div style="font-size:12px; font-weight:700;">СИЛА (Вода + Задачи)</div>
                        <div style="background:#eee; height:8px; border-radius:4px; overflow:hidden;">
                            <div style="width:${Math.round((extStats.waterPerc + (extStats.completedTasks > 0 ? 50 : 0))/1.5)}%; background:#FF3B30; height:100%;"></div>
                        </div>
                    </div>

                    <div>
                        <div style="font-size:12px; font-weight:700;">ИНТЕЛЛЕКТ (Цели)</div>
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
                        const isOwned = this.gameState[type].includes(item.id);
                        let isEquipped = false;
                        if(type==='skins') isEquipped = this.gameState.equippedSkin === item.id;
                        if(type==='pets') isEquipped = this.gameState.equippedPet === item.id;
                        if(type==='backgrounds') isEquipped = this.gameState.equippedBg === item.id;
                        
                        return `
                        <div class="gm-item ${isOwned ? 'owned' : ''} ${isEquipped ? 'equipped' : ''}" onclick="GamePage.buyItem('${type}', '${item.id}')">
                            <div class="gm-icon">${item.icon || (type==='backgrounds' ? '🖼️' : '')}</div>
                            <div style="font-size:12px; font-weight:bold;">${item.name}</div>
                            <div style="font-size:10px; color:#666;">${isOwned ? (isEquipped ? 'НАДЕТО' : 'КУПЛЕНО') : item.price + ' 💰'}</div>
                        </div>
                        `;
                    }).join('')}
                </div>
            `;

            contentHtml = `
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
                return `
                    <div class="gm-ach-row ${unlocked ? 'unlocked' : ''}">
                        <div style="font-size:24px;">${unlocked ? '🏆' : '🔒'}</div>
                        <div>
                            <div style="font-weight:bold;">${ach.name}</div>
                            <div style="font-size:12px;">${ach.desc}</div>
                            ${unlocked ? `<div style="font-size:10px; color:#34C759;">Награда получена</div>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }

        // 4. КАЗИНО
        else if (this.currentTab === 'casino') {
            contentHtml = `
                <div class="gm-card gm-wheel-container">
                    <div class="gm-title" style="justify-content:center;">🎡 Колесо Фортуны</div>
                    <div style="color:#666; margin-bottom:20px;">Цена попытки: ${this.config.wheelCost} монет</div>
                    <div id="casino-wheel" class="gm-wheel">🎱</div>
                    <br>
                    <button class="gm-spin-btn" onclick="GamePage.spinWheel()">КРУТИТЬ!</button>
                    <div style="margin-top:20px; font-size:12px; color:#999;">Можно выиграть до 500 монет!</div>
                </div>
            `;
        }


        // === СБОРКА ВСЕГО СТРАНИЦЫ ===
        app.innerHTML = `
            ${styles}
            <div class="gm-wrap">
                <div class="gm-hero-section">
                    <div class="gm-hud">
                        <span>Lvl ${this.gameState.level}</span>
                        <span>💰 ${this.gameState.coins}</span>
                    </div>
                    
                    <div class="gm-avatar-container" onclick="GamePage.clickHero()">
                        <div id="hero-img" class="gm-avatar">${curSkin.icon}</div>
                        ${curPet ? `<div class="gm-pet">${curPet.icon}</div>` : ''}
                    </div>
                    
                    <div style="font-size:12px; color:#666; margin-top:5px;">(Нажми на меня!)</div>
                    
                    <div class="gm-xp-bar">
                        <div class="gm-xp-fill"></div>
                    </div>
                    <div style="font-size:10px; margin-top:2px;">XP: ${Math.floor(this.gameState.xp)} / ${nextLvlXp}</div>
                </div>

                <div class="gm-tabs">
                    <div class="gm-tab ${this.currentTab === 'main' ? 'active' : ''}" onclick="GamePage.currentTab='main'; GamePage.render()">🏠 Главная</div>
                    <div class="gm-tab ${this.currentTab === 'shop' ? 'active' : ''}" onclick="GamePage.currentTab='shop'; GamePage.render()">🛍️ Магазин</div>
                    <div class="gm-tab ${this.currentTab === 'achievements' ? 'active' : ''}" onclick="GamePage.currentTab='achievements'; GamePage.render()">🏆 Ачивки</div>
                    <div class="gm-tab ${this.currentTab === 'casino' ? 'active' : ''}" onclick="GamePage.currentTab='casino'; GamePage.render()">🎲 Казино</div>
                </div>

                <div style="animation: fadeIn 0.3s;">
                    ${contentHtml}
                </div>
            </div>
        `;
    }
};

window.GamePage = GamePage;
export function render() { GamePage.init(); }
