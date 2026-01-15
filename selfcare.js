/* ==========================================
   МОДУЛЬ: УХОД ЗА СОБОЙ (selfcare.js)
   ========================================== */

const SelfCare = {
    // Хранилище задач
    tasks: JSON.parse(localStorage.getItem('GL_SelfCare_Tasks')) || [
        { id: 1, text: 'Умыться (пенка/гель)', cat: 'Лицо', done: false },
        { id: 2, text: 'Тоник и сыворотка', cat: 'Лицо', done: false },
        { id: 3, text: 'Увлажняющий крем', cat: 'Лицо', done: false },
        { id: 4, text: 'Крем для тела', cat: 'Тело', done: false },
        { id: 5, text: 'Маска для волос', cat: 'Волосы', done: false }
    ],

    init() {
        this.render();
    },

    save() {
        localStorage.setItem('GL_SelfCare_Tasks', JSON.stringify(this.tasks));
        this.render();
    },

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) task.done = !task.done;
        this.save();
    },

    addTask() {
        const text = prompt("Что добавить в уход?");
        if (!text) return;
        const cat = prompt("Категория (например: Лицо, Тело, Маникюр):", "Лицо");
        this.tasks.push({ id: Date.now(), text, cat, done: false });
        this.save();
    },

    deleteTask(id) {
        if (confirm("Удалить этот пункт?")) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.save();
        }
    },

    render() {
        const app = document.getElementById('app-viewport');
        
        // Группируем задачи по категориям
        const categories = [...new Set(this.tasks.map(t => t.cat))];
        
        const sectionsHtml = categories.map(cat => {
            const catTasks = this.tasks.filter(t => t.cat === cat);
            return `
                <div class="sc-section">
                    <div class="sc-cat-title">${cat}</div>
                    ${catTasks.map(t => `
                        <div class="sc-item ${t.done ? 'done' : ''}" onclick="SelfCare.toggleTask(${t.id})">
                            <div class="sc-checkbox">
                                ${t.done ? '<span class="material-icons">done</span>' : ''}
                            </div>
                            <div class="sc-text">${t.text}</div>
                            <span class="material-icons sc-del" onclick="event.stopPropagation(); SelfCare.deleteTask(${t.id})">close</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('');

        app.innerHTML = `
            <style>
                .sc-container { padding: 15px 15px 100px; animation: fadeIn 0.3s; }
                .sc-header { display: flex; align-items: center; margin-bottom: 25px; }
                .sc-title { flex: 1; text-align: center; font-size: 22px; font-weight: 800; margin-right: 32px; }
                
                .sc-section { background: white; border-radius: 20px; padding: 15px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
                .sc-cat-title { font-size: 14px; font-weight: 800; color: #8E8E93; text-transform: uppercase; margin-bottom: 10px; padding-left: 5px; }
                
                .sc-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #F2F2F7; cursor: pointer; }
                .sc-item:last-child { border: none; }
                .sc-item.done .sc-text { color: #8E8E93; text-decoration: line-through; }
                
                .sc-checkbox { width: 24px; height: 24px; border: 2px solid #D1D1D6; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .sc-item.done .sc-checkbox { background: #FF2D55; border-color: #FF2D55; color: white; }
                .sc-checkbox .material-icons { font-size: 18px; }
                
                .sc-text { flex: 1; font-size: 16px; font-weight: 500; color: #1C1C1E; }
                .sc-del { color: #E5E5EA; font-size: 20px; }
                
                .sc-add-btn { background: #FF2D55; color: white; border-radius: 16px; padding: 16px; text-align: center; font-weight: 700; cursor: pointer; margin-top: 10px; }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>

            <div class="sc-container">
                <div class="sc-header">
                    <span class="material-icons" onclick="loadModule('./checklists.js')" style="color:#FF2D55; cursor:pointer; font-size:32px;">chevron_left</span>
                    <div class="sc-title">Уход за собой</div>
                </div>
                
                ${sectionsHtml || '<div style="text-align:center; color:#8E8E93; margin-top:50px;">Списков пока нет</div>'}
                
                <div class="sc-add-btn" onclick="SelfCare.addTask()">+ Добавить процедуру</div>
            </div>
        `;
    }
};

window.SelfCare = SelfCare;
export function render() { SelfCare.init(); }
