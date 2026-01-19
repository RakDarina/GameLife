/* ==========================================
   МОДУЛЬ: ДЕЛА НА СЕГОДНЯ (todo_daily.js) — EDITABLE
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
            this.state.tasks = this.state.tasks
                .filter(t => !(t.type === 'once' && t.done))
                .map(t => ({ ...t, done: false }));
            
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
            type: type,
            done: false
        };

        this.state.tasks.push(newTask);
        this.saveData();
        this.render();
    },

    toggleTask: function(id) {
        const task = this.state.tasks.find(t => t.id === id);
        if (task) {
            task.done = true;
            this.saveData();
            setTimeout(() => this.render(), 300);
        }
    },

    // НОВАЯ ФУНКЦИЯ: Удаление
    deleteTask: function(id) {
        if (confirm('Удалить это задание совсем?')) {
            this.state.tasks = this.state.tasks.filter(t => t.id !== id);
            this.saveData();
            this.render();
        }
    },

    // НОВАЯ ФУНКЦИЯ: Редактирование
    editTask: function(id) {
        const task = this.state.tasks.find(t => t.id === id);
        if (task) {
            const newText = prompt('Редактировать задание:', task.text);
            if (newText !== null && newText.trim() !== "") {
                task.text = newText.trim();
                this.saveData();
                this.render();
            }
        }
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const activeTasks = this.state.tasks.filter(t => !t.done);

        const styles = `
            <style>
                .td-container { animation: fadeIn 0.3s; color: #1C1C1E; }
                .td-title { font-size: 28px; font-weight: 800; margin-bottom: 20px; }
                
                .td-item {
                    background: #fff; padding: 16px; border-radius: 18px;
                    display: flex; align-items: center; margin-bottom: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    position: relative;
                }
                .td-check {
                    width: 24px; height: 24px; border: 2px solid #E5E5EA;
                    border-radius: 50%; margin-right: 15px; cursor: pointer; flex-shrink: 0;
                }
                .td-text { font-size: 17px; font-weight: 500; flex: 1; cursor: pointer; padding-right: 10px; }
                .td-tag { font-size: 10px; color: #999; text-transform: uppercase; margin-right: 10px; white-space: nowrap; }
                
                .td-del-btn {
                    color: #FF3B30; font-size: 18px; font-weight: bold; 
                    cursor: pointer; padding: 5px; opacity: 0.3;
                }
                .td-del-btn:hover { opacity: 1; }

                .td-add-box {
                    position: fixed; bottom: 110px; left: 20px; right: 20px;
                    background: #fff; padding: 15px; border-radius: 20px;
                    box-shadow: 0 -5px 20px rgba(0,0,0,0.05);
                }
                .td-input-row { display: flex; gap: 10px; margin-bottom: 10px; }
                #td-input { flex: 1; padding: 12px; border: 1px solid #E5E5EA; border-radius: 10px; outline: none; font-size: 16px; }
                .td-btn { background: #5856D6; color: #fff; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 600; }
                #td-type { width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #E5E5EA; background: #F8F9FB; color: #8E8E93; }
            </style>
        `;

        let listHtml = activeTasks.length > 0 
            ? activeTasks.map(t => `
                <div class="td-item">
                    <div class="td-check" onclick="TodoDaily.toggleTask(${t.id})"></div>
                    <div class="td-text" onclick="TodoDaily.editTask(${t.id})">${t.text}</div>
                    <div class="td-tag">${t.type === 'daily' ? 'день' : 'раз'}</div>
                    <div class="td-del-btn" onclick="TodoDaily.deleteTask(${t.id})">×</div>
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
