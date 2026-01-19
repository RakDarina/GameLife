/* ==========================================
   МОДУЛЬ: ДЕЛА НА СЕГОДНЯ (todo_daily.js)
   ========================================== */

const TodoDaily = {
    state: {
        tasks: [],
        lastDate: ""
    },

    init: function() {
        this.loadData();
        this.checkNewDay();
        this.render();
    },

    loadData: function() {
        const saved = localStorage.getItem('GL_Todo_Data');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.state.tasks = parsed.tasks || [];
            this.state.lastDate = parsed.lastDate || "";
        }
    },

    saveData: function() {
        localStorage.setItem('GL_Todo_Data', JSON.stringify(this.state));
    },

    checkNewDay: function() {
        const today = new Date().toLocaleDateString();
        if (this.state.lastDate !== today) {
            // Удаляем одиночные выполненные, а ежедневные сбрасываем
            this.state.tasks = this.state.tasks
                .filter(t => !(t.type === 'once' && t.done)) // удаляем одиночные закрытые
                .map(t => ({ ...t, done: false }));          // сбрасываем ежедневные
            
            this.state.lastDate = today;
            this.saveData();
        }
    },

    addTask: function() {
        const input = document.getElementById('td-input');
        const type = document.getElementById('td-type').value;
        if (!input.value.trim()) return;

        const newTask = {
            id: Date.now(),
            text: input.value.trim(),
            type: type, // 'daily' или 'once'
            done: false
        };

        this.state.tasks.push(newTask);
        this.saveData();
        this.render();
    },

    toggleTask: function(id) {
        const task = this.state.tasks.find(t => t.id === id);
        if (task) {
            task.done = true; // Сразу ставим выполнено
            this.saveData();
            // Небольшая задержка перед исчезновением для красоты
            setTimeout(() => this.render(), 300);
        }
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        
        // Показываем только те, что не выполнены сегодня
        const activeTasks = this.state.tasks.filter(t => !t.done);

        const styles = `
            <style>
                .td-container { animation: fadeIn 0.3s; color: #1C1C1E; }
                .td-title { font-size: 28px; font-weight: 800; margin-bottom: 20px; }
                
                .td-item {
                    background: #fff; padding: 16px; border-radius: 18px;
                    display: flex; align-items: center; margin-bottom: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                }
                .td-check {
                    width: 24px; height: 24px; border: 2px solid #E5E5EA;
                    border-radius: 50%; margin-right: 15px; cursor: pointer;
                }
                .td-text { font-size: 17px; font-weight: 500; flex: 1; }
                .td-tag { font-size: 11px; color: #999; text-transform: uppercase; }

                .td-add-box {
                    position: fixed; bottom: 110px; left: 20px; right: 20px;
                    background: #fff; padding: 15px; border-radius: 20px;
                    box-shadow: 0 -5px 20px rgba(0,0,0,0.05);
                }
                .td-input-row { display: flex; gap: 10px; margin-bottom: 10px; }
                #td-input { flex: 1; padding: 12px; border: 1px solid #E5E5EA; border-radius: 10px; outline: none; }
                .td-btn { background: var(--blue); color: #fff; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 600; }
                #td-type { padding: 8px; border-radius: 8px; border: 1px solid #E5E5EA; background: #F8F9FB; font-size: 13px; }
            </style>
        `;

        let listHtml = activeTasks.length > 0 
            ? activeTasks.map(t => `
                <div class="td-item">
                    <div class="td-check" onclick="TodoDaily.toggleTask(${t.id})"></div>
                    <div class="td-text">${t.text}</div>
                    <div class="td-tag">${t.type === 'daily' ? 'каждый день' : 'разово'}</div>
                </div>
            `).join('')
            : '<div style="text-align:center; color:#999; margin-top:40px;">Все дела сделаны! 🙌</div>';

        app.innerHTML = `
            ${styles}
            <div class="td-container">
                <div class="td-title">Мой день</div>
                <div id="td-list">${listHtml}</div>
                
                <div class="td-add-box">
                    <div class="td-input-row">
                        <input type="text" id="td-input" placeholder="Что нужно сделать?">
                        <button class="td-btn" onclick="TodoDaily.addTask()">OK</button>
                    </div>
                    <select id="td-type">
                        <option value="daily">Повторять каждый день</option>
                        <option value="once">Только один раз</option>
                    </select>
                </div>
            </div>
        `;
    }
};

window.TodoDaily = TodoDaily;
export function render() { TodoDaily.init(); }
