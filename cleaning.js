/* ==========================================
   МОДУЛЬ: УБОРКА (cleaning.js)
   ========================================== */

const Cleaning = {
    // Начальные данные
    tasks: JSON.parse(localStorage.getItem('GL_Clean_Tasks')) || [
        { id: 1, text: 'Застелить кровать', type: 'daily' },
        { id: 2, text: 'Убрать вещи', type: 'daily' },
        { id: 3, text: 'Убрать лоток', type: 'daily' },
        { id: 4, text: 'Помыть посуду', type: 'daily' },
        { id: 5, text: 'Вычесать Панду', type: 'daily' },
        { id: 6, text: 'Сменить постельное белье', type: 'weekly' },
        { id: 7, text: 'Сменить салфетку на кухне', type: 'weekly' },
        { id: 8, text: 'Постирать белье', type: 'weekly' },
        { id: 9, text: 'Протереть пыль', type: 'weekly' },
        { id: 10, text: 'Протереть микроволновку', type: 'biweekly' },
        { id: 11, text: 'Навести порядок в холодильнике', type: 'biweekly' },
        { id: 12, text: 'Продезинфицировать туалет', type: 'biweekly' },
        { id: 13, text: 'Помыть ванну', type: 'biweekly' },
        { id: 14, text: 'Помыть раковины', type: 'biweekly' },
        { id: 15, text: 'Почистить мягкую мебель', type: 'biweekly' },
        { id: 16, text: 'Протереть зеркала', type: 'biweekly' },
        { id: 17, text: 'Сменить полотенца в ванной', type: 'monthly' },
        { id: 18, text: 'Поменять губку', type: 'monthly' },
        { id: 19, text: 'Поменять сушилку для посуды', type: 'monthly' },
        { id: 20, text: 'Прочистить слив', type: 'monthly' },
        { id: 21, text: 'Проверить чистящие средства', type: 'monthly' },
        { id: 22, text: 'Протереть пыль со шкафа', type: 'season' },
        { id: 23, text: 'Помыть окна', type: 'season' },
        { id: 24, text: 'Почистить чайник', type: 'season' },
        { id: 25, text: 'Убрать не сезонные вещи', type: 'season' },
        { id: 26, text: 'Протереть двери', type: 'year' },
        { id: 27, text: 'Протереть плинтус', type: 'year' }
    ],

    state: JSON.parse(localStorage.getItem('GL_Clean_State')) || {
        doneIds: [],
        lastReset: {} 
    },

    supplies: JSON.parse(localStorage.getItem('GL_Clean_Supplies')) || [],
    view: 'main', // 'main', 'supplies', 'all-tasks'

    init() {
        this.checkResets();
        this.render();
    },

    save() {
        localStorage.setItem('GL_Clean_Tasks', JSON.stringify(this.tasks));
        localStorage.setItem('GL_Clean_State', JSON.stringify(this.state));
        localStorage.setItem('GL_Clean_Supplies', JSON.stringify(this.supplies));
        this.render();
    },

    // --- ЛОГИКА СБРОСА ---
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
        const base = new Date('2025-12-29'); // Опорный понедельник
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

    // --- РЕНДЕР ---
    render() {
        const app = document.getElementById('app-viewport');
        const styles = `
            <style>
                .cl-container { padding: 10px 15px 120px; animation: fadeIn 0.3s; font-family: sans-serif; }
                .cl-header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
                .cl-back { color: #007AFF; cursor: pointer; font-size: 32px; }
                .cl-title { flex: 1; text-align: center; font-size: 24px; font-weight: 800; margin-right: 32px; }
                
                .cl-section { background: white; border-radius: 20px; padding: 18px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
                .cl-sec-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .cl-sec-name { font-weight: 800; font-size: 16px; color: #1C1C1E; }
                
                .cl-progress-bg { width: 100%; height: 8px; background: #F2F2F7; border-radius: 4px; margin-bottom: 15px; overflow: hidden; }
                .cl-progress-fill { height: 100%; transition: width 0.4s ease, background 0.4s; }

                .cl-task { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #F9F9FB; }
                .cl-task:last-child { border: none; }
                .cl-circle { width: 26px; height: 26px; border: 2px solid #D1D1D6; border-radius: 50%; flex-shrink: 0; cursor: pointer; }
                .cl-circle.done { background: #34C759; border-color: #34C759; position: relative; }
                .cl-circle.done::after { content: '✓'; color: white; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
                .cl-text { font-size: 16px; font-weight: 500; color: #3A3A3C; flex: 1; }
                
                .cl-btn { background: white; border: 2px solid #007AFF; color: #007AFF; border-radius: 16px; padding: 16px; text-align: center; font-weight: 700; margin-top: 12px; cursor: pointer; }
                
                .cl-textarea { width: 100%; min-height: 100px; border-radius: 12px; border: 1px solid #D1D1D6; padding: 12px; font-size: 16px; margin-bottom: 15px; resize: vertical; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        if (this.view === 'main') this.renderMain(app, styles);
        else if (this.view === 'supplies') this.renderSupplies(app, styles);
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
            
            let color = '#FF3B30';
            if (percent > 35) color = '#FFCC00';
            if (percent > 70) color = '#34C759';

            const listHtml = percent === 100 
                ? '<div style="text-align:center; color:#34C759; font-weight:700; padding:10px;">Все выполнено, молодец! 🎉</div>'
                : groupTasks.filter(t => !this.state.doneIds.includes(t.id)).map(t => `
                    <div class="cl-task">
                        <div class="cl-circle" onclick="Cleaning.toggleTask(${t.id})"></div>
                        <div class="cl-text">${t.text}</div>
                    </div>
                `).join('');

            return `
                <div class="cl-section">
                    <div class="cl-sec-head">
                        <span class="cl-sec-name">${g.title}</span>
                        <span style="font-size:12px; font-weight:700; color:${color}">${Math.round(percent)}%</span>
                    </div>
                    <div class="cl-progress-bg">
                        <div class="cl-progress-fill" style="width:${percent}%; background:${color}"></div>
                    </div>
                    ${listHtml}
                </div>
            `;
        }).join('');

        app.innerHTML = styles + `
            <div class="cl-container">
                <div class="cl-header">
                    <span class="material-icons cl-back" onclick="loadModule('./checklists.js')">chevron_left</span>
                    <div class="cl-title">Уборка</div>
                </div>
                ${sectionsHtml}
                <div class="cl-btn" onclick="Cleaning.view='supplies'; Cleaning.render()">Чек-лист средств</div>
                <div class="cl-btn" onclick="Cleaning.view='all-tasks'; Cleaning.render()">Показать все задания</div>
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
                        <div class="cl-task">
                            <div class="cl-circle ${this.state.doneIds.includes(t.id) ? 'done' : ''}" onclick="Cleaning.toggleTask(${t.id})"></div>
                            <div class="cl-text" style="white-space:pre-wrap;" onclick="Cleaning.editTaskPrompt(${t.id})">${t.text}</div>
                            <span class="material-icons" style="color:#FF3B30; font-size:20px;" onclick="Cleaning.deleteTask(${t.id})">delete</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('');

        app.innerHTML = styles + `
            <div class="cl-container">
                <div class="cl-header">
                    <span class="material-icons cl-back" onclick="Cleaning.view='main'; Cleaning.render()">chevron_left</span>
                    <div class="cl-title">Все задания</div>
                </div>
                ${listHtml}
                <div class="cl-btn" onclick="Cleaning.addTaskPrompt()">+ Добавить задание</div>
            </div>
        `;
    },

    // --- СТРАНИЦА: СРЕДСТВА ---
    renderSupplies(app, styles) {
        const listHtml = this.supplies.map((s, idx) => `
            <div class="cl-task">
                <div class="cl-circle ${s.done ? 'done' : ''}" onclick="Cleaning.supplies[${idx}].done = !Cleaning.supplies[${idx}].done; Cleaning.save();"></div>
                <div class="cl-text">${s.text}</div>
                <span class="material-icons" style="color:#FF3B30; font-size:20px;" onclick="Cleaning.supplies.splice(${idx},1); Cleaning.save();">delete</span>
            </div>
        `).join('');

        app.innerHTML = styles + `
            <div class="cl-container">
                <div class="cl-header">
                    <span class="material-icons cl-back" onclick="Cleaning.view='main'; Cleaning.render()">chevron_left</span>
                    <div class="cl-title">Средства</div>
                </div>
                <div class="cl-section">${listHtml || '<div style="text-align:center; color:#8E8E93;">Список пуст</div>'}</div>
                <div class="cl-btn" onclick="Cleaning.addSupplyPrompt()">+ Добавить средство</div>
            </div>
        `;
    },

    // --- ПРОМПТЫ УПРАВЛЕНИЯ ---
    addTaskPrompt() {
        const text = prompt("Введите задание (поддерживаются абзацы):");
        if (!text) return;
        const type = prompt("Выберите блок (daily, weekly, biweekly, monthly, season, year):", "daily");
        this.tasks.push({ id: Date.now(), text, type });
        this.save();
    },

    editTaskPrompt(id) {
        const task = this.tasks.find(t => t.id === id);
        const newText = prompt("Редактировать задание:", task.text);
        if (newText) {
            task.text = newText;
            this.save();
        }
    },

    deleteTask(id) {
        if (confirm("Удалить задание навсегда?")) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.state.doneIds = this.state.doneIds.filter(i => i !== id);
            this.save();
        }
    },

    addSupplyPrompt() {
        const text = prompt("Название средства:");
        if (text) {
            this.supplies.push({ text, done: false });
            this.save();
        }
    }
};

window.Cleaning = Cleaning;
export function render() { Cleaning.init(); }
