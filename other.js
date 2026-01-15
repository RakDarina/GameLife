/* ==========================================
   МОДУЛЬ: РАЗНОЕ (other.js)
   ========================================== */

const OtherLists = {
    // Структура: массивы объектов с категориями
    data: JSON.parse(localStorage.getItem('GL_Other_Data')) || [
        { id: 1, title: 'Посмотреть / Почитать', items: [
            { id: 101, text: 'Фильм: Начало', done: false },
            { id: 102, text: 'Книга: Атомные привычки', done: false }
        ]},
        { id: 2, title: 'Идеи для подарков', items: [] }
    ],

    init() {
        this.render();
    },

    save() {
        localStorage.setItem('GL_Other_Data', JSON.stringify(this.data));
        this.render();
    },

    // --- ЛОГИКА ГРУПП ---
    addGroup() {
        const title = prompt("Название новой группы (например, 'Хобби'):");
        if (title) {
            this.data.push({ id: Date.now(), title, items: [] });
            this.save();
        }
    },

    deleteGroup(groupId) {
        if (confirm("Удалить всю группу целиком?")) {
            this.data = this.data.filter(g => g.id !== groupId);
            this.save();
        }
    },

    // --- ЛОГИКА ПУНКТОВ ---
    addItem(groupId) {
        const text = prompt("Что добавить?");
        if (text) {
            const group = this.data.find(g => g.id === groupId);
            group.items.push({ id: Date.now(), text, done: false });
            this.save();
        }
    },

    toggleItem(groupId, itemId) {
        const group = this.data.find(g => g.id === groupId);
        const item = group.items.find(i => i.id === itemId);
        if (item) item.done = !item.done;
        this.save();
    },

    deleteItem(groupId, itemId) {
        const group = this.data.find(g => g.id === groupId);
        group.items = group.items.filter(i => i.id !== itemId);
        this.save();
    },

    // --- РЕНДЕР ---
    render() {
        const app = document.getElementById('app-viewport');
        
        const sectionsHtml = this.data.map(group => `
            <div class="ot-section">
                <div class="ot-sec-head">
                    <span class="ot-sec-title">${group.title}</span>
                    <span class="material-icons ot-icon-del" onclick="OtherLists.deleteGroup(${group.id})">delete_sweep</span>
                </div>
                
                <div class="ot-items-list">
                    ${group.items.map(item => `
                        <div class="ot-item ${item.done ? 'done' : ''}">
                            <div class="ot-checkbox" onclick="OtherLists.toggleItem(${group.id}, ${item.id})">
                                ${item.done ? '<span class="material-icons">check</span>' : ''}
                            </div>
                            <div class="ot-text" onclick="OtherLists.toggleItem(${group.id}, ${item.id})">${item.text}</div>
                            <span class="material-icons ot-item-del" onclick="OtherLists.deleteItem(${group.id}, ${item.id})">close</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="ot-add-item" onclick="OtherLists.addItem(${group.id})">+ Добавить пункт</div>
            </div>
        `).join('');

        app.innerHTML = `
            <style>
                .ot-container { padding: 10px 15px 120px; animation: fadeIn 0.3s; }
                .ot-header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
                .ot-back { color: #AF52DE; cursor: pointer; font-size: 32px; }
                .ot-title { flex: 1; text-align: center; font-size: 24px; font-weight: 800; margin-right: 32px; }
                
                .ot-section { background: white; border-radius: 22px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                .ot-sec-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #F2F2F7; padding-bottom: 10px; }
                .ot-sec-title { font-size: 17px; font-weight: 800; color: #1C1C1E; }
                .ot-icon-del { color: #E5E5EA; cursor: pointer; font-size: 20px; }
                .ot-icon-del:hover { color: #FF3B30; }

                .ot-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F9F9FB; }
                .ot-item:last-child { border: none; }
                .ot-checkbox { width: 22px; height: 22px; border: 2px solid #D1D1D6; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; }
                .ot-item.done .ot-checkbox { background: #AF52DE; border-color: #AF52DE; color: white; }
                .ot-checkbox .material-icons { font-size: 16px; }
                
                .ot-text { flex: 1; font-size: 16px; font-weight: 500; color: #3A3A3C; cursor: pointer; transition: 0.2s; }
                .ot-item.done .ot-text { color: #C7C7CC; text-decoration: line-through; }
                
                .ot-item-del { color: #E5E5EA; font-size: 18px; cursor: pointer; }
                .ot-add-item { margin-top: 10px; color: #AF52DE; font-size: 14px; font-weight: 700; cursor: pointer; padding: 5px; }
                
                .ot-main-btn { background: #AF52DE; color: white; border-radius: 18px; padding: 18px; text-align: center; font-weight: 700; cursor: pointer; margin-top: 10px; }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>

            <div class="ot-container">
                <div class="ot-header">
                    <span class="material-icons ot-back" onclick="loadModule('./checklists.js')">chevron_left</span>
                    <div class="ot-title">Разное</div>
                </div>
                
                ${sectionsHtml || '<div style="text-align:center; color:#8E8E93; margin-top:50px;">Нажмите кнопку ниже, чтобы создать первую группу</div>'}
                
                <div class="ot-main-btn" onclick="OtherLists.addGroup()">+ Создать новую группу</div>
            </div>
        `;
    }
};

window.OtherLists = OtherLists;
export function render() { OtherLists.init(); }
