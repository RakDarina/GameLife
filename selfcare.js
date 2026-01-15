/* ==========================================
   МОДУЛЬ: УХОД ЗА СОБОЙ (selfcare.js)
   ========================================== */

const SelfCare = {
    // Список задач по умолчанию
    tasks: JSON.parse(localStorage.getItem('GL_Self_Tasks')) || [
        { id: 101, text: 'Умыться с пенкой', type: 'daily' },
        { id: 102, text: 'Нанести сыворотку и крем', type: 'daily' },
        { id: 103, text: 'Выпить витамины', type: 'daily' },
        { id: 104, text: 'Маска для лица', type: 'weekly' },
        { id: 105, text: 'Скраб для тела', type: 'weekly' },
        { id: 106, text: 'Маникюр', type: 'biweekly' },
        { id: 107, text: 'Пилинг лица', type: 'monthly' },
        { id: 108, text: 'Стрижка кончиков', type: 'season' },
        { id: 109, text: 'Диспансеризация (врачи)', type: 'year' }
    ],

    state: JSON.parse(localStorage.getItem('GL_Self_State')) || {
        doneIds: [],
        lastReset: {} 
    },

    view: 'main', // 'main' или 'all-tasks'

    init() {
        this.checkResets();
        this.render();
    },

    save() {
        localStorage.setItem('GL_Self_Tasks', JSON.stringify(this.tasks));
        localStorage.setItem('GL_Self_State', JSON.stringify(this.state));
        this.render();
    },

    // --- ЛОГИКА СБРОСА (Копия Уборки) ---
    checkResets() {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        const resetRules = {
            daily: todayStr,
            weekly: this.getMonday(now),
            biweekly: this.getBiweeklyMonday(now),
            monthly: `${now.getFullYear()}-${now.getMonth() + 1}-01`,
            season: this.getSeasonStart(now),
            year: `${now.getFullYear()}-01-01`
        };

        let changed = false;
        Object.keys(resetRules).forEach(type => {
            if (this.state.lastReset[type] !== resetRules[type]) {
                const idsOfThisType = this.tasks.filter(t => t.type === type).map(t => t.id);
                this.state.doneIds = this.state.doneIds.filter(id => !idsOfThisType.includes(id));
                this.state.lastReset[type] = resetRules[type];
                changed = true;
            }
        });
        if (changed) this.save();
    },

    getMonday(d) {
        const date = new Date(d);
        const day = date.getDay(), diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff)).toISOString().split('T')[0];
    },

    getBiweeklyMonday(now) {
        const base = new Date('2025-12-29'); 
        const diffDays = Math.floor((now - base) / (1000 * 60 * 60 * 24));
        const periods = Math.floor(diffDays / 14);
        const currentPeriodMonday = new Date(base);
        currentPeriodMonday.setDate(base.getDate() + (periods * 14));
        return currentPeriodMonday.toISOString().split('T')[0];
    },

    getSeasonStart(now) {
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        if (month >= 3 && month <= 5) return `${year}-03-01`;
        if (month >= 6 && month <= 8) return `${year}-06-01`;
        if (month >= 9 && month <= 11) return `${year}-09-01`;
        return (month === 12) ? `${year}-12-01` : `${year-1}-12-01`;
    },

    // --- ОТРИСОВКА ---
    render() {
        const app = document.getElementById('app-viewport');
        const styles = `
            <style>
                .sc-unique-container { padding: 10px 15px 120px; animation: fadeInSC 0.3s; font-family: sans-serif; }
                .sc-unique-header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
                .sc-unique-back { color: #FF2D55; cursor: pointer; font-size: 32px; font-weight: bold; }
                .sc-unique-title { flex: 1; text-align: center; font-size: 24px; font-weight: 800; margin-right: 32px; color: #1C1C1E; }
                
                .sc-unique-section { background: white; border-radius: 20px; padding: 18px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
                .sc-unique-sec-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .sc-unique-sec-name { font-weight: 800; font-size: 16px; color: #1C1C1E; }
                
                .sc-unique-progress-bg { width: 100%; height: 8px; background: #F2F2F7; border-radius: 4px; margin-bottom: 15px; overflow: hidden; }
                .sc-unique-progress-fill { height: 100%; transition: width 0.4s ease, background 0.4s; }

                .sc-unique-task { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #F9F9FB; }
                .sc-unique-task:last-child { border: none; }
                .sc-unique-circle { width: 26px; height: 26px; border: 2px solid #D1D1D6; border-radius: 50%; flex-shrink: 0; cursor: pointer; }
                .sc-unique-circle.done { background: #FF2D55; border-color: #FF2D55; position: relative; }
                .sc-unique-circle.done::after { content: '✓'; color: white; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 16px; }
                .sc-unique-text { font-size: 16px; font-weight: 500; color: #3A3A3C; flex: 1; white-space: pre-wrap; }
                
                .sc-unique-btn { background: white; border: 2px solid #FF2D55; color: #FF2D55; border-radius: 16px; padding: 16px; text-align: center; font-weight: 700; margin-top: 12px; cursor: pointer; }
                
                @keyframes fadeInSC { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        if (this.view === 'main') this.renderMain(app, styles);
        else if (this.view === 'all-tasks') this.renderAllTasks(app, styles);
    },

    renderMain(app, styles) {
        const groups = [
            { id: 'daily', title: 'Каждый день' },
            { id: 'weekly', title: 'Каждую неделю' },
            { id: 'biweekly', title: 'Каждые 2 недели' },
            { id: 'monthly', title: 'Раз в месяц' },
            { id: 'season', title: 'Каждый сезон' },
            { id: 'year', title: 'Каждый год' }
        ];

        const sectionsHtml = groups.map(g => {
            const groupTasks = this.tasks.filter(t => t.type === g.id);
            if (groupTasks.length === 0) return '';

            const done = groupTasks.filter(t => this.state.doneIds.includes(t.id));
            const percent = (done.length / groupTasks.length) * 100;
            
            let color = '#FF3B30'; // Красный
            if (percent > 35) color = '#FFCC00'; // Желтый
            if (percent > 70) color = '#34C759'; // Зеленый

            const listHtml = percent === 100 
                ? '<div style="text-align:center; color:#34C759; font-weight:700; padding:10px;">Все выполнено, молодец! 🎉</div>'
                : groupTasks.filter(t => !this.state.doneIds.includes(t.id)).map(t => `
                    <div class="sc-unique-task">
                        <div class="sc-unique-circle" onclick="SelfCare.toggleTask(${t.id})"></div>
                        <div class="sc-unique-text">${t.text}</div>
                    </div>
                `).join('');

            return `
                <div class="sc-unique-section">
                    <div class="sc-unique-sec-head">
                        <span class="sc-unique-sec-name">${g.title}</span>
                        <span style="font-size:12px; font-weight:700; color:${color}">${Math.round(percent)}%</span>
                    </div>
                    <div class="sc-unique-progress-bg">
                        <div class="sc-unique-progress-fill" style="width:${percent}%; background:${color}"></div>
                    </div>
                    ${listHtml}
                </div>
            `;
        }).join('');

        app.innerHTML = styles + `
            <div class="sc-unique-container">
                <div class="sc-unique-header">
                    <span class="material-icons sc-unique-back" onclick="loadModule('./checklists.js')">chevron_left</span>
                    <div class="sc-unique-title">Уход за собой</div>
                </div>
                ${sectionsHtml}
                <div class="sc-unique-btn" onclick="SelfCare.view='all-tasks'; SelfCare.render()">Показать все задания</div>
            </div>
        `;
    },

    toggleTask(id) {
        if (this.state.doneIds.includes(id)) {
            this.state.doneIds = this.state.doneIds.filter(i => i !== id);
        } else {
            this.state.doneIds.push(id);
        }
        this.save();
    },

    // --- СТРАНИЦА: ВСЕ ЗАДАНИЯ ---
    renderAllTasks(app, styles) {
        const types = {
            daily: 'Каждый день', weekly: 'Каждую неделю', biweekly: 'Каждые 2 недели',
            monthly: 'Раз в месяц', season: 'Каждый сезон', year: 'Каждый год'
        };

        const listHtml = Object.keys(types).map(type => {
            const secTasks = this.tasks.filter(t => t.type === type);
            return `
                <div style="margin-bottom:25px;">
                    <div style="font-weight:800; color:#8E8E93; border-bottom:1px solid #E5E5EA; padding-bottom:5px; margin-bottom:10px; font-size:13px;">${types[type].toUpperCase()}</div>
                    ${secTasks.map(t => `
                        <div class="sc-unique-task">
                            <div class="sc-unique-circle ${this.state.doneIds.includes(t.id) ? 'done' : ''}" onclick="SelfCare.toggleTask(${t.id})"></div>
                            <div class="sc-unique-text" onclick="SelfCare.editTaskPrompt(${t.id})">${t.text}</div>
                            <span class="material-icons" style="color:#FF3B30; font-size:20px; cursor:pointer;" onclick="SelfCare.deleteTask(${t.id})">delete</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('');

        app.innerHTML = styles + `
            <div class="sc-unique-container">
                <div class="sc-unique-header">
                    <span class="material-icons sc-unique-back" onclick="SelfCare.view='main'; SelfCare.render()">chevron_left</span>
                    <div class="sc-unique-title">Все задания ухода</div>
                </div>
                ${listHtml}
                <div class="sc-unique-btn" onclick="SelfCare.addTaskPrompt()">+ Добавить процедуру</div>
            </div>
        `;
    },

    // --- ПРОМПТЫ УПРАВЛЕНИЯ ---
    addTaskPrompt() {
        const text = prompt("Введите процедуру (можно длинный текст):");
        if (!text) return;
        const type = prompt("Выберите период (daily, weekly, biweekly, monthly, season, year):", "daily");
        if (!type) return;
        this.tasks.push({ id: Date.now(), text, type });
        this.save();
    },

    editTaskPrompt(id) {
        const task = this.tasks.find(t => t.id === id);
        const newText = prompt("Редактировать процедуру:", task.text);
        if (newText) {
            task.text = newText;
            this.save();
        }
    },

    deleteTask(id) {
        if (confirm("Удалить это задание?")) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.state.doneIds = this.state.doneIds.filter(i => i !== id);
            this.save();
        }
    }
};

window.SelfCare = SelfCare;
export function render() { SelfCare.init(); }
