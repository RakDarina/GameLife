/* ==========================================
   МОДУЛЬ: СПИСКИ (ОБЩИЙ ХАБ + КОНСТРУКТОР)
   ========================================== */

const ListsModule = {
    // Данные для конструктора списков (внутри синей кнопки)
    listsMeta: JSON.parse(localStorage.getItem('GL_CL_Meta')) || [],
    listItems: JSON.parse(localStorage.getItem('GL_CL_Items')) || {},
    
    // Состояние навигации
    // 'main-hub' (2 кнопки), 'cl-hub' (списки), 'cl-create' (форма списка), 'cl-view' (записи), 'cl-edit-item' (форма записи)
    view: 'main-hub', 
    activeListId: null,
    editingItemId: null,

    // Конфигурация полей
    schemaOptions: [
        { key: 'hasRating', label: 'Рейтинг (5 звезд)' },
        { key: 'hasCheckbox', label: 'Чек-бокс (кружочек)' },
        { key: 'hasStatus', label: 'Статус (В процессе...)' },
        { key: 'hasDateEnd', label: 'Дата завершения' },
        { key: 'hasSeries', label: 'Номер серии' },
        { key: 'hasPage', label: 'Номер страницы' }
    ],

    statusMap: {
        'want': { label: 'Хочу начать', color: '#8E8E93' },
        'process': { label: 'В процессе', color: '#007AFF' },
        'pause': { label: 'Пауза', color: '#FF9500' },
        'done': { label: 'Закончила', color: '#34C759' },
        'drop': { label: 'Прекратила', color: '#FF3B30' }
    },

    init: function() { this.render(); },

    save: function() {
        localStorage.setItem('GL_CL_Meta', JSON.stringify(this.listsMeta));
        localStorage.setItem('GL_CL_Items', JSON.stringify(this.listItems));
        this.render();
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const styles = `
            <style>
                .ls-container { animation: fadeIn 0.3s; padding-bottom: 80px; }
                .ls-header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding-top: 10px; }
                .ls-back { color: #007AFF; cursor: pointer; font-size: 28px; }
                .ls-title { font-size: 24px; font-weight: 800; color: #1C1C1E; flex: 1; text-align: center; margin-right: 40px; }

                /* Главные кнопки (твой дизайн) */
                .ls-menu-btn { 
                    background: white; border-radius: 24px; padding: 20px; margin-bottom: 16px;
                    display: flex; align-items: center; gap: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); cursor: pointer;
                }
                .ls-btn-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; }
                .ls-btn-text { font-size: 18px; font-weight: 700; color: #1C1C1E; }

                /* Карточки конструктора */
                .cl-card { background: white; padding: 20px; border-radius: 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.03); cursor: pointer; }
                .cl-item { background: white; padding: 16px; border-radius: 18px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); cursor: pointer; }
                .cl-stars { color: #FFD60A; font-size: 18px; }
                
                /* Формы */
                .cl-input, .cl-textarea { width: 100%; border: none; background: white; padding: 16px; border-radius: 16px; font-size: 17px; font-family: inherit; margin-bottom: 15px; outline: none; box-sizing: border-box; }
                .cl-textarea { min-height: 120px; resize: none; }
                .cl-save-btn { width: 100%; background: #007AFF; color: white; padding: 18px; border-radius: 18px; font-weight: 700; border: none; font-size: 17px; }
                .cl-fab { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #1C1C1E; color: white; padding: 15px 30px; border-radius: 30px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        if (this.view === 'main-hub') {
            app.innerHTML = styles + `
                <div class="ls-container">
                    <div class="ls-header">
                        <span class="material-icons-outlined ls-back" onclick="loadModule('./main.js')">chevron_left</span>
                        <div class="ls-title">Списки</div>
                    </div>
                    <div class="ls-menu-btn" onclick="ListsModule.view = 'cl-hub'; ListsModule.render();">
                        <div class="ls-btn-icon" style="background: #5856D6;"><span class="material-icons">list</span></div>
                        <div class="ls-btn-text">Списки</div>
                    </div>
                    <div class="ls-menu-btn" onclick="alert('Чек-листы в разработке')">
                        <div class="ls-btn-icon" style="background: #34C759;"><span class="material-icons">checklist</span></div>
                        <div class="ls-btn-text">Чек-листы</div>
                    </div>
                </div>
            `;
        } else if (this.view === 'cl-hub') {
            this.renderClHub(app, styles);
        } else if (this.view === 'cl-create') {
            this.renderClCreate(app, styles);
        } else if (this.view === 'cl-view') {
            this.renderClView(app, styles);
        } else if (this.view === 'cl-edit-item') {
            this.renderClEditItem(app, styles);
        }
    },

    // Экран "Мои списки" (внутри синей кнопки)
    renderClHub: function(app, styles) {
        const lists = this.listsMeta.map(l => `
            <div class="cl-card" onclick="ListsModule.activeListId='${l.id}'; ListsModule.view='cl-view'; ListsModule.render()">
                <div style="font-weight:700; font-size:18px;">${l.title}</div>
                <div style="color:#8E8E93;">${(this.listItems[l.id] || []).length} ></div>
            </div>
        `).join('');

        app.innerHTML = styles + `
            <div class="ls-container">
                <div class="ls-header">
                    <span class="material-icons-outlined ls-back" onclick="ListsModule.view='main-hub'; ListsModule.render()">chevron_left</span>
                    <div class="ls-title">Мои списки</div>
                </div>
                ${lists || '<p style="text-align:center; color:#8E8E93;">Создайте свой первый список</p>'}
                <div class="cl-fab" onclick="ListsModule.view='cl-create'; ListsModule.render()"><span class="material-icons">add</span> Создать новый список</div>
            </div>
        `;
    },

    // Форма создания нового списка (конструктор)
    renderClCreate: function(app, styles) {
        app.innerHTML = styles + `
            <div class="ls-container">
                <div class="ls-header">
                    <span class="material-icons-outlined ls-back" onclick="ListsModule.view='cl-hub'; ListsModule.render()">chevron_left</span>
                    <div class="ls-title">Новый список</div>
                </div>
                <input type="text" id="cl-new-title" class="cl-input" placeholder="Название (например: Фильмы)">
                <p style="font-size:12px; font-weight:700; color:#8E8E93; margin: 20px 0 10px;">ЭЛЕМЕНТЫ ВНУТРИ ЗАПИСИ:</p>
                ${this.schemaOptions.map(opt => `
                    <div style="background:white; padding:15px; border-radius:16px; display:flex; justify-content:space-between; margin-bottom:8px;">
                        <span style="font-weight:600;">${opt.label}</span>
                        <input type="checkbox" id="opt-${opt.key}" style="transform:scale(1.2);">
                    </div>
                `).join('')}
                <button class="cl-save-btn" style="margin-top:20px;" onclick="ListsModule.createListAction()">Создать</button>
            </div>
        `;
    },

    createListAction: function() {
        const title = document.getElementById('cl-new-title').value;
        if(!title) return;
        const schema = {};
        this.schemaOptions.forEach(o => schema[o.key] = document.getElementById(`opt-${o.key}`).checked);
        const newList = { id: Date.now().toString(), title, schema };
        this.listsMeta.push(newList);
        this.listItems[newList.id] = [];
        this.view = 'cl-hub';
        this.save();
    },

    // Просмотр записей внутри конкретного списка
    renderClView: function(app, styles) {
        const list = this.listsMeta.find(l => l.id === this.activeListId);
        const items = this.listItems[this.activeListId] || [];

        const itemsHtml = items.map(item => `
            <div class="cl-item" onclick="ListsModule.editingItemId=${item.id}; ListsModule.view='cl-edit-item'; ListsModule.render()">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="font-weight:700; font-size:18px;">${item.title}</div>
                    ${list.schema.hasCheckbox ? `<div style="width:22px; height:22px; border-radius:50%; border:2px solid ${item.done ? '#34C759' : '#C7C7CC'}; background:${item.done ? '#34C759' : 'transparent'};"></div>` : ''}
                </div>
                <div style="font-size:14px; color:#8E8E93; margin-top:5px; white-space:pre-wrap;">${item.note || ''}</div>
                <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
                    ${list.schema.hasRating && item.rating ? `<div class="cl-stars">${'★'.repeat(item.rating)}${'☆'.repeat(5-item.rating)}</div>` : ''}
                    ${list.schema.hasStatus && item.status ? `<div style="background:${this.statusMap[item.status].color}; color:white; font-size:10px; padding:3px 8px; border-radius:6px; font-weight:700;">${this.statusMap[item.status].label}</div>` : ''}
                </div>
            </div>
        `).join('');

        app.innerHTML = styles + `
            <div class="ls-container">
                <div class="ls-header">
                    <span class="material-icons-outlined ls-back" onclick="ListsModule.view='cl-hub'; ListsModule.render()">chevron_left</span>
                    <div class="ls-title">${list.title}</div>
                    <span class="material-icons-outlined" style="color:#FF3B30;" onclick="ListsModule.deleteList()">delete</span>
                </div>
                ${itemsHtml || '<p style="text-align:center; color:#8E8E93;">Нажмите +, чтобы добавить запись</p>'}
                <div class="cl-fab" onclick="ListsModule.editingItemId='new'; ListsModule.view='cl-edit-item'; ListsModule.render()"><span class="material-icons">add</span> Добавить запись</div>
            </div>
        `;
    },

    // Форма создания/редактирования записи
    renderClEditItem: function(app, styles) {
        const list = this.listsMeta.find(l => l.id === this.activeListId);
        const item = this.editingItemId === 'new' ? {} : this.listItems[this.activeListId].find(i => i.id == this.editingItemId);

        app.innerHTML = styles + `
            <div class="ls-container">
                <div class="ls-header">
                    <span class="material-icons-outlined ls-back" onclick="ListsModule.view='cl-view'; ListsModule.render()">chevron_left</span>
                    <div class="ls-title">${this.editingItemId === 'new' ? 'Новая запись' : 'Изменить'}</div>
                </div>
                <input type="text" id="item-title" class="cl-input" placeholder="Название" value="${item.title || ''}">
                <textarea id="item-note" class="cl-textarea" placeholder="Заметка (можно много строк)...">${item.note || ''}</textarea>
                
                <div id="dynamic-fields">
                    ${list.schema.hasRating ? `
                        <div style="background:white; padding:15px; border-radius:16px; margin-bottom:15px;">
                            <p style="margin:0 0 10px; font-size:12px; font-weight:700; color:#8E8E93;">РЕЙТИНГ</p>
                            <input type="number" id="item-rating" class="cl-input" min="0" max="5" value="${item.rating || 0}" style="margin:0;">
                        </div>
                    ` : ''}
                    ${list.schema.hasStatus ? `
                        <select id="item-status" class="cl-input">
                            <option value="">Выберите статус</option>
                            ${Object.entries(this.statusMap).map(([id, s]) => `<option value="${id}" ${item.status === id ? 'selected' : ''}>${s.label}</option>`).join('')}
                        </select>
                    ` : ''}
                    ${list.schema.hasCheckbox ? `
                        <div style="background:white; padding:15px; border-radius:16px; display:flex; justify-content:space-between; margin-bottom:15px;">
                            <span style="font-weight:600;">Выполнено</span>
                            <input type="checkbox" id="item-done" ${item.done ? 'checked' : ''} style="transform:scale(1.2);">
                        </div>
                    ` : ''}
                </div>

                <button class="cl-save-btn" onclick="ListsModule.saveItemAction()">Сохранить</button>
            </div>
        `;
    },

    saveItemAction: function() {
        const list = this.listsMeta.find(l => l.id === this.activeListId);
        const title = document.getElementById('item-title').value;
        if(!title) return;

        const newItem = {
            id: this.editingItemId === 'new' ? Date.now() : this.editingItemId,
            title,
            note: document.getElementById('item-note').value,
            rating: list.schema.hasRating ? parseInt(document.getElementById('item-rating').value) : null,
            status: list.schema.hasStatus ? document.getElementById('item-status').value : null,
            done: list.schema.hasCheckbox ? document.getElementById('item-done').checked : false
        };

        if(this.editingItemId === 'new') {
            this.listItems[this.activeListId].push(newItem);
        } else {
            const idx = this.listItems[this.activeListId].findIndex(i => i.id == this.editingItemId);
            this.listItems[this.activeListId][idx] = newItem;
        }
        this.view = 'cl-view';
        this.save();
    },

    deleteList: function() {
        if(confirm('Удалить весь список?')) {
            this.listsMeta = this.listsMeta.filter(l => l.id !== this.activeListId);
            delete this.listItems[this.activeListId];
            this.view = 'cl-hub';
            this.save();
        }
    }
};

window.ListsModule = ListsModule;
export function render() { ListsModule.init(); }
