const WeightRPG = {
    state: {
        currentW: 0,
        targetW: 0,
        history: [], // [{date, weight, xp, fastfood, treadmill}]
        xp: 0,
        lvl: 1,
        coins: 0,
        activeTab: 'main'
    },

    init: function() {
        this.load();
        this.render();
    },

    load: function() {
        const saved = localStorage.getItem('GL_RPG_Full_Data');
        if (saved) this.state = { ...this.state, ...JSON.parse(saved) };
    },

    save: function() {
        localStorage.setItem('GL_RPG_Full_Data', JSON.stringify(this.state));
    },

    // --- ЛОГИКА ---
    addWeight: function() {
        const w = prompt("Введите вес сегодня (кг):", this.state.currentW || "");
        if (!w) return;
        const fast = confirm("Был ли сегодня фастфуд? 🍔");
        const today = new Date().toISOString().split('T')[0];
        const val = parseFloat(w.replace(',', '.'));

        const idx = this.state.history.findIndex(h => h.date === today);
        const record = { date: today, weight: val, fastfood: fast, treadmill: false };
        
        if(idx > -1) this.state.history[idx] = record;
        else {
            this.state.history.push(record);
            this.state.xp += 20;
            this.state.coins += 10;
        }
        
        this.state.currentW = val;
        this.checkLvl();
        this.save();
        this.render();
    },

    toggleActivity: function(date, type) {
        const item = this.state.history.find(h => h.date === date);
        if (item) {
            item[type] = !item[type];
            if (item[type]) { this.state.xp += 15; this.state.coins += 5; }
            else { this.state.xp -= 15; this.state.coins -= 5; }
            this.checkLvl();
            this.save();
            this.render();
        }
    },

    checkLvl: function() {
        let nxt = this.state.lvl * 100;
        if (this.state.xp >= nxt) {
            this.state.xp -= nxt;
            this.state.lvl++;
            alert("🎉 Уровень повышен! Теперь вы Lvl " + this.state.lvl);
        }
    },

    getAI: function() {
        if (this.state.history.length < 2 || !this.state.targetW) return "Нужно больше данных...";
        const sorted = [...this.state.history].sort((a,b) => new Date(a.date) - new Date(b.date));
        const first = sorted[0];
        const last = sorted[sorted.length-1];
        const weightDiff = first.weight - last.weight;
        const daysDiff = (new Date(last.date) - new Date(first.date)) / (1000*60*60*24);
        
        if (weightDiff > 0.1 && daysDiff > 0.5) {
            const speed = weightDiff / daysDiff;
            const left = last.weight - this.state.targetW;
            const days = Math.round(left / speed);
            if (days > 0) {
                const d = new Date(); d.setDate(d.getDate() + days);
                return `Цель будет достигнута: ${d.toLocaleDateString()}`;
            }
        }
        return "Продолжайте замеры для прогноза";
    },

    // --- РЕНДЕР ---
    render: function() {
        const app = document.getElementById('app-viewport');
        const stage = Math.min(6, Math.max(1, 7 - Math.ceil((this.state.currentW - this.state.targetW) / 3) || 1));
        
        const styles = `
            <style>
                .rpg-page { background: #f0f2f5; min-height: 100%; font-family: sans-serif; padding: 15px; padding-bottom: 80px; }
                .rpg-card { background: #fff; border-radius: 20px; padding: 20px; margin-bottom: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .rpg-nav { position: fixed; bottom: 0; left: 0; width: 100%; background: #fff; display: flex; padding: 10px 0; border-top: 1px solid #ddd; z-index: 100; }
                .rpg-nav-btn { flex: 1; text-align: center; font-size: 20px; cursor: pointer; opacity: 0.4; }
                .rpg-nav-btn.active { opacity: 1; transform: scale(1.1); }
                .rpg-avatar { width: 140px; display: block; margin: 0 auto; }
                .rpg-progress { height: 8px; background: #eee; border-radius: 4px; overflow: hidden; margin: 10px 0; }
                .rpg-fill { height: 100%; background: #6c5ce7; transition: width 0.3s; }
                .rpg-btn { background: #6c5ce7; color: #fff; border: none; padding: 12px; border-radius: 12px; width: 100%; font-weight: 700; margin-top: 10px; }
                .hist-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
                .tag-ff { color: red; font-size: 10px; border: 1px solid red; padding: 2px 4px; border-radius: 4px; }
            </style>
        `;

        let content = '';
        if (this.state.activeTab === 'main') {
            content = `
                <div class="rpg-card" style="text-align:center">
                    <div style="display:flex; justify-content:space-between; font-size:14px; color:#6c5ce7; font-weight:700;">
                        <span>Lvl ${this.state.lvl}</span>
                        <span>💰 ${this.state.coins}</span>
                    </div>
                    <img src="./stage${stage}.png" class="rpg-avatar">
                    <div class="rpg-progress"><div class="rpg-fill" style="width:${(this.state.xp / (this.state.lvl * 100)) * 100}%"></div></div>
                    <div style="font-size:12px; color:#888">XP: ${this.state.xp} / ${this.state.lvl * 100}</div>
                </div>
                <div class="rpg-card">
                    <h3 style="margin-top:0; font-size:16px;">🤖 ИИ-Прогноз</h3>
                    <div style="font-size:14px; color:#444">${this.getAI()}</div>
                    <button class="rpg-btn" onclick="WeightRPG.addWeight()">Записать вес</button>
                </div>
            `;
        } else if (this.state.activeTab === 'shop') {
            content = `
                <h2 style="margin-left:10px">Магазин</h2>
                <div class="rpg-card">
                    <div style="display:flex; justify-content:space-between">
                        <span>🍏 Здоровое питание</span>
                        <button class="rpg-btn" style="width:80px; margin:0" onclick="if(WeightRPG.state.coins>=50){WeightRPG.state.coins-=50; WeightRPG.state.xp+=100; WeightRPG.checkLvl(); WeightRPG.save(); WeightRPG.render()}">50 💰</button>
                    </div>
                </div>
                <div class="rpg-card">
                    <div style="display:flex; justify-content:space-between">
                        <span>💊 Витамины (+XP)</span>
                        <button class="rpg-btn" style="width:80px; margin:0" onclick="alert('Куплено!')">30 💰</button>
                    </div>
                </div>
            `;
        } else if (this.state.activeTab === 'history') {
            content = `
                <h2 style="margin-left:10px">История</h2>
                <div class="rpg-card">
                    ${this.state.history.slice().reverse().map(h => `
                        <div class="hist-item">
                            <div>
                                <div style="font-size:12px">${h.date}</div>
                                <b>${h.weight} кг</b> ${h.fastfood ? '<span class="tag-ff">FAST FOOD</span>' : ''}
                            </div>
                            <button style="border:none; border-radius:8px; padding:5px 10px; background:${h.treadmill ? '#00b894' : '#eee'}; color:${h.treadmill ? '#fff' : '#000'}" 
                                onclick="WeightRPG.toggleActivity('${h.date}', 'treadmill')">🏃 ${h.treadmill ? '+15xp' : 'Добавить'}</button>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        app.innerHTML = `
            ${styles}
            <div class="rpg-page">
                <div onclick="loadModule('./health.js')" style="margin-bottom:15px; color:#6c5ce7; font-weight:700">‹ Назад</div>
                ${content}
                <div class="rpg-nav">
                    <div class="rpg-nav-btn ${this.state.activeTab === 'main' ? 'active' : ''}" onclick="WeightRPG.state.activeTab='main'; WeightRPG.render()">👤</div>
                    <div class="rpg-nav-btn ${this.state.activeTab === 'shop' ? 'active' : ''}" onclick="WeightRPG.state.activeTab='shop'; WeightRPG.render()">🛒</div>
                    <div class="rpg-nav-btn ${this.state.activeTab === 'history' ? 'active' : ''}" onclick="WeightRPG.state.activeTab='history'; WeightRPG.render()">📜</div>
                </div>
            </div>
        `;
    }
};

window.WeightRPG = WeightRPG;
export function render() { WeightRPG.init(); }
