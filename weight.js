/* ==========================================
   МОДУЛЬ: WEIGHT RPG (weight.js)
   ========================================== */

const WeightRPG = {
    state: {
        currentW: 0,
        targetW: 0,
        history: [], // [{date: '2026-01-14', weight: 65, xp: 10, fastfood: false}]
        xp: 0,
        lvl: 1,
        coins: 0,
        view: 'main'
    },

    init: function() {
        this.load();
        this.render();
    },

    load: function() {
        const saved = localStorage.getItem('GL_RPG_Data');
        if (saved) this.state = { ...this.state, ...JSON.parse(saved) };
    },

    save: function() {
        localStorage.setItem('GL_RPG_Data', JSON.stringify(this.state));
    },

    // Расчет уровня как в твоем оригинале
    updateLvl: function() {
        let nxt = this.state.lvl * 100;
        if (this.state.xp >= nxt) {
            this.state.xp -= nxt;
            this.state.lvl++;
            alert("Level Up! Новый уровень: " + this.state.lvl);
        }
    },

    addRecord: function() {
        const w = prompt("Ваш вес сегодня (кг):", this.state.currentW || "");
        if (!w) return;

        const isFastFood = confirm("Сегодня был фастфуд? (Ок - да, Отмена - нет)");
        const today = new Date().toISOString().split('T')[0];
        const weightVal = parseFloat(w.replace(',', '.'));

        // Добавляем запись или обновляем старую
        const idx = this.state.history.findIndex(i => i.date === today);
        const record = { 
            date: today, 
            weight: weightVal, 
            xp: 10, 
            fastfood: isFastFood 
        };

        if (idx > -1) this.state.history[idx] = record;
        else this.state.history.push(record);

        this.state.currentW = weightVal;
        this.state.xp += 10;
        this.state.coins += 5;
        
        this.updateLvl();
        this.save();
        this.render();
    },

    // УПРАЖНЕНИЯ ЗА ЛЮБОЙ ДЕНЬ
    toggleTreadmill: function(dateStr, add = true) {
        const record = this.state.history.find(i => i.date === dateStr);
        if (record) {
            if (add) {
                record.xp = (record.xp || 0) + 15;
                this.state.xp += 15;
                this.state.coins += 10;
            } else {
                record.xp = Math.max(0, (record.xp || 0) - 15);
                this.state.xp = Math.max(0, this.state.xp - 15);
            }
            this.updateLvl();
            this.save();
            this.render();
        }
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const progress = this.state.targetW ? Math.max(5, Math.min(100, (this.state.targetW / this.state.currentW) * 100)) : 0;
        
        // Определение стадии персонажа (1-6)
        let stage = 1;
        if (this.state.currentW > 0 && this.state.targetW > 0) {
            const diff = this.state.currentW - this.state.targetW;
            if (diff <= 0) stage = 6;
            else if (diff < 2) stage = 5;
            else if (diff < 5) stage = 4;
            else if (diff < 10) stage = 3;
            else stage = 2;
        }

        const styles = `
            <style>
                .rpg-container { animation: fadeIn 0.3s; padding: 15px; font-family: sans-serif; }
                .rpg-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                .rpg-char-box { text-align: center; background: #fff; border-radius: 24px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                .rpg-avatar { width: 120px; height: 120px; object-fit: contain; }
                .rpg-bar { height: 10px; background: #E5E5EA; border-radius: 5px; overflow: hidden; margin: 10px 0; }
                .rpg-bar-fill { height: 100%; background: #6c5ce7; transition: width 0.5s; }
                
                .rpg-history { margin-top: 20px; }
                .rpg-item { 
                    background: #fff; margin-bottom: 10px; padding: 15px; border-radius: 15px;
                    display: flex; justify-content: space-between; align-items: center;
                    border-left: 5px solid transparent;
                }
                .rpg-item.fastfood { border-left-color: #ff3b30; background: #fff5f5; }
                
                .rpg-btn-add { background: #6c5ce7; color: #fff; border: none; padding: 15px; width: 100%; border-radius: 15px; font-weight: 700; font-size: 16px; cursor: pointer; }
                .rpg-btn-sm { background: #f0f0f5; border: none; padding: 5px 10px; border-radius: 8px; font-size: 11px; cursor: pointer; }
            </style>
        `;

        let historyHtml = this.state.history.slice().reverse().map(item => `
            <div class="rpg-item ${item.fastfood ? 'fastfood' : ''}">
                <div>
                    <div style="font-size: 12px; color: #8E8E93;">${item.date}</div>
                    <div style="font-weight: 700;">${item.weight} кг ${item.fastfood ? '🍔' : ''}</div>
                </div>
                <div style="display:flex; gap:5px;">
                    <button class="rpg-btn-sm" onclick="WeightRPG.toggleTreadmill('${item.date}', true)">🏃 +15xp</button>
                    <button class="rpg-btn-sm" style="color:red" onclick="WeightRPG.toggleTreadmill('${item.date}', false)">✕</button>
                </div>
            </div>
        `).join('');

        app.innerHTML = `
            ${styles}
            <div class="rpg-container">
                <div class="rpg-header" onclick="loadModule('./health.js')">
                    <span style="color:#6c5ce7; font-weight:700;">‹ Назад</span>
                    <span>💰 ${this.state.coins} | Lvl ${this.state.lvl}</span>
                </div>

                <div class="rpg-char-box">
                    <img src="./stage${stage}.png" class="rpg-avatar" alt="Character">
                    <div style="font-weight:700; margin-top:10px;">XP: ${this.state.xp} / ${this.state.lvl * 100}</div>
                    <div class="rpg-bar"><div class="rpg-bar-fill" style="width:${(this.state.xp / (this.state.lvl * 100)) * 100}%"></div></div>
                    <div style="font-size:12px; color:#8E8E93;">Текущий вес: ${this.state.currentW || '--'} кг</div>
                </div>

                <div style="margin: 20px 0;">
                    <button class="rpg-btn-add" onclick="WeightRPG.addRecord()">Записать вес</button>
                    <button onclick="WeightRPG.setTarget()" style="background:none; border:none; color:#6c5ce7; width:100%; margin-top:10px; font-size:13px;">Цель: ${this.state.targetW || 'указать'}</button>
                </div>

                <div class="rpg-history">
                    <h3 style="font-size:16px;">История записей</h3>
                    ${historyHtml || '<p style="text-align:center; color:#8E8E93;">Записей пока нет</p>'}
                </div>
            </div>
        `;
    },

    setTarget: function() {
        const t = prompt("Ваша цель (кг):", this.state.targetW || "");
        if (t) {
            this.state.targetW = parseFloat(t.replace(',', '.'));
            this.save();
            this.render();
        }
    }
};

window.WeightRPG = WeightRPG;
export function render() { WeightRPG.init(); }
