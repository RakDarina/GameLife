/* ==========================================
   МОДУЛЬ: УБОРКА (cleaning.js)
   ========================================== */

const Cleaning = {
    // Хранилище настроек задач (какие задачи в каких блоках)
    // type: 'daily', 'weekly', 'biweekly', 'monthly', 'season', 'year'
    tasks: JSON.parse(localStorage.getItem('GL_Clean_Tasks')) || [
        { id: 1, text: 'Застелить кровать', type: 'daily', img: 'task_bed.png' },
        { id: 2, text: 'Убрать вещи', type: 'daily', img: 'task_things.png' },
        { id: 3, text: 'Помыть посуду', type: 'daily', img: 'task_dishes.png' },
        { id: 4, text: 'Вычесать Панду', type: 'daily', img: 'task_panda.png' },
        { id: 5, text: 'Сменить постельное белье', type: 'weekly', img: 'task_linen.png' },
        { id: 6, text: 'Протереть микроволновку', type: 'biweekly', img: 'task_micro.png' },
        { id: 7, text: 'Поменять губку', type: 'monthly', img: 'task_sponge.png' },
        { id: 8, text: 'Помыть окна', type: 'season', img: 'task_windows.png' },
        { id: 9, text: 'Протереть плинтус', type: 'year', img: 'task_baseboard.png' }
    ],

    // Хранилище выполненных ID и дат сброса
    state: JSON.parse(localStorage.getItem('GL_Clean_State')) || {
        doneIds: [],
        lastReset: {} // Храним даты последнего обнуления для каждого типа
    },

    // Чек-лист средств
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

    // --- ЛОГИКА ОБНУЛЕНИЯ ---
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
                // Время пришло! Убираем выполненные задачи этого типа
                const idsToRemove = this.tasks.filter(t => t.type === type).map(t => t.id);
                this.state.doneIds = this.state.doneIds.filter(id => !idsToRemove.includes(id));
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
        // Логика: каждые 14 дней от базового понедельника (например, 29 дек 2025)
        const base = new Date('2025-12-29');
        const diff = Math.floor((now - base) / (1000 * 60 * 60 * 24 * 14));
        const nextReset = new Date(base);
        nextReset.setDate(base.getDate() + (diff * 14));
        return nextReset.toISOString().split('T')[0];
    },

    getSeasonStart(now) {
        const month = now.getMonth() + 1;
        if (month >= 3 && month <= 5) return `${now.getFullYear()}-03-01`;
        if (month >= 6 && month <= 8) return `${now.getFullYear()}-06-01`;
        if (month >= 9 && month <= 11) return `${now.getFullYear()}-09-01`;
        return `${month === 12 ? now.getFullYear() : now.getFullYear()-1}-12-01`;
    },

    // --- RENDER ---
    render() {
        const app = document.getElementById('app-viewport');
        const styles = `
            <style>
                .cln-wrap { animation: fadeIn 0.3s; padding: 10px 15px 120px; }
                .cln-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
                
                /* ИНТЕРАКТИВНОЕ ФОТО */
                .cln-room-box { 
                    width: 100%; aspect-ratio: 1/1; background: #eee; border-radius: 24px; 
                    margin-bottom: 25px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }
                .cln-layer { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity 0.5s; }
                .cln-layer.hidden { opacity: 0; }

                /* ПРОГРЕСС И БЛОКИ */
                .cln-section { background: white; border-radius: 20px; padding: 18px; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
                .cln-sec-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .cln-sec-title { font-weight: 800; font-size: 16px; color: #1C1C1E; }
                
                .cln-progress-bg { width: 100%; height: 6px; background: #F2F2F7; border-radius: 3px; margin-bottom: 15px; overflow: hidden; }
                .cln-progress-fill { height: 100%; transition: width 0.5s, background 0.5s; }

                /* ЗАДАЧИ */
                .cln-task { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F2F2F7; cursor: pointer; }
                .cln-task:last-child { border: none; }
                .cln-circle { width: 24px; height: 24px; border: 2px solid #C7C7CC; border-radius: 50%; flex-shrink: 0; position: relative; }
                .cln-circle.done { background: #34C759; border-color: #34C759; }
                .cln-circle.done::after { content: '✓'; color: white; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; }
                .cln-task-text { font-size: 16px; font-weight: 500; color: #1C1C1E; }

                /* КНОПКИ СНИЗУ */
                .cln-btn-outline { 
                    width: 100%; padding: 16px; border-radius: 16px; border: 2px solid #007AFF; 
                    color: #007AFF; font-weight: 700; text-align: center; margin-top: 10px; cursor: pointer;
                }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        if (this.view === 'main') this.renderMain(app, styles);
        else if (this.view === 'supplies') this.renderSupplies(app, styles);
        else if (this.view === 'all-tasks') this.renderAllTasks(app, styles);
    },

    renderMain(app, styles) {
        const sections = [
            { type: 'daily', label: 'Каждый день' },
            { type: 'weekly', label: 'Каждую неделю' },
            { type: 'biweekly', label: 'Каждые 2 недели' },
            { type: 'monthly', label: 'Раз в месяц' },
            { type: 'season', label: 'Каждый сезон' },
            { type: 'year', label: 'Каждый год' }
        ];

        let sectionsHtml = sections.map(sec => {
            const secTasks = this.tasks.filter(t => t.type === sec.type);
            if (secTasks.length === 0) return '';
            
            const doneTasks = secTasks.filter(t => this.state.doneIds.includes(t.id));
            const percent = (doneTasks.length / secTasks.length) * 100;
            
            // Цвет прогресса
            let color = '#FF3B30'; // Красный
            if (percent > 40) color = '#FFCC00'; // Желтый
            if (percent === 100) color = '#34C759'; // Зеленый

            const tasksHtml = percent === 100 
                ? '<div style="text-align:center; padding:10px; color:#34C759; font-weight:700;">Все выполнено, молодец! 🎉</div>'
                : secTasks.filter(t => !this.state.doneIds.includes(t.id)).map(t => `
                    <div class="cln-task" onclick="Cleaning.toggleTask(${t.id})">
                        <div class="cln-circle"></div>
                        <div class="cln-task-text">${t.text}</div>
                    </div>
                `).join('');

            return `
                <div class="cln-section">
                    <div class="cln-sec-head">
                        <span class="cln-sec-title">${sec.label}</span>
                        <span style="font-size:12px; font-weight:700; color:${color}">${Math.round(percent)}%</span>
                    </div>
                    <div class="cln-progress-bg">
                        <div class="cln-progress-fill" style="width:${percent}%; background:${color}"></div>
                    </div>
                    ${tasksHtml}
                </div>
            `;
        }).join('');

        // Слои комнаты
        const layersHtml = this.tasks.map(t => `
            <img src="img/cleaning/${t.img}" class="cln-layer ${this.state.doneIds.includes(t.id) ? '' : 'hidden'}">
        `).join('');

        app.innerHTML = styles + `
            <div class="cln-wrap">
                <div class="cln-header">
                    <span class="material-icons-outlined" style="color:#007AFF; cursor:pointer; font-size:28px;" onclick="loadModule('./checklists.js')">chevron_left</span>
                    <h2 style="flex:1; text-align:center; margin-right:40px;">Уборка</h2>
                </div>

                <div class="cln-room-box">
                    <img src="img/cleaning/bg_room.png" class="cln-layer"> ${layersHtml}
                </div>

                ${sectionsHtml}

                <div class="cln-btn-outline" onclick="Cleaning.view='supplies'; Cleaning.render()">Чек-лист средств</div>
                <div class="cln-btn-outline" onclick="Cleaning.view='all-tasks'; Cleaning.render()">Показать все задания</div>
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

    // --- СТРАНИЦА ВСЕХ ЗАДАНИЙ ---
    renderAllTasks(app, styles) {
        const sections = ['daily', 'weekly', 'biweekly', 'monthly', 'season', 'year'];
        const listHtml = sections.map(type => {
            const secTasks = this.tasks.filter(t => t.type === type);
            return `
                <div style="margin-bottom:20px;">
                    <div style="text-transform:uppercase; font-size:12px; color:#8E8E93; margin-bottom:10px; font-weight:800; border-bottom:1px solid #ddd; padding-bottom:5px;">${type}</div>
                    ${secTasks.map(t => `
                        <div class="cln-task">
                            <div class="cln-circle ${this.state.doneIds.includes(t.id) ? 'done' : ''}" onclick="Cleaning.toggleTask(${t.id})"></div>
                            <div style="flex:1;" onclick="Cleaning.editTaskPrompt(${t.id})">${t.text}</div>
                            <span class="material-icons" style="color:#FF3B30; font-size:18px;" onclick="Cleaning.deleteTask(${t.id})">delete</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('');

        app.innerHTML = styles + `
            <div class="cln-wrap">
                <div class="cln-header">
                    <span class="material-icons-outlined" style="color:#007AFF; cursor:pointer; font-size:28px;" onclick="Cleaning.view='main'; Cleaning.render()">chevron_left</span>
                    <h2 style="flex:1; text-align:center; margin-right:40px;">Все задания</h2>
                </div>
                ${listHtml}
                <div class="cln-btn-outline" onclick="Cleaning.addTaskPrompt()">+ Добавить задание</div>
            </div>
        `;
    },

    // --- ЧЕК-ЛИСТ СРЕДСТВ ---
    renderSupplies(app, styles) {
        const listHtml = this.supplies.map((s, idx) => `
            <div class="cln-task">
                <div class="cln-circle ${s.done ? 'done' : ''}" onclick="Cleaning.supplies[${idx}].done = !Cleaning.supplies[${idx}].done; Cleaning.save();"></div>
                <div style="flex:1;">${s.text}</div>
                <span class="material-icons" style="color:#FF3B30; font-size:18px;" onclick="Cleaning.supplies.splice(${idx},1); Cleaning.save();">delete</span>
            </div>
        `).join('');

        app.innerHTML = styles + `
            <div class="cln-wrap">
                <div class="cln-header">
                    <span class="material-icons-outlined" style="color:#007AFF; cursor:pointer; font-size:28px;" onclick="Cleaning.view='main'; Cleaning.render()">chevron_left</span>
                    <h2 style="flex:1; text-align:center; margin-right:40px;">Средства</h2>
                </div>
                <div class="cln-section">${listHtml || 'Пусто'}</div>
                <div class="cln-btn-outline" onclick="Cleaning.addSupplyPrompt()">+ Добавить средство</div>
            </div>
        `;
    },

    // Промпты для простоты (можно заменить на красивые модалки)
    addSupplyPrompt() {
        const t = prompt("Название средства:");
        if (t) { this.supplies.push({text: t, done: false}); this.save(); }
    },

    addTaskPrompt() {
        const text = prompt("Задание:");
        const type = prompt("Тип (daily, weekly, biweekly, monthly, season, year):", "daily");
        if (text && type) {
            this.tasks.push({id: Date.now(), text, type, img: 'default.png'});
            this.save();
        }
    },

    deleteTask(id) {
        if(confirm("Удалить задание?")) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.state.doneIds = this.state.doneIds.filter(i => i !== id);
            this.save();
        }
    }
};

window.Cleaning = Cleaning;
export function render() { Cleaning.init(); }
