/* ==========================================
   МОДУЛЬ: УМНЫЕ СПИСКИ (КОНСТРУКТОР)
   ========================================== */

const CustomListModule = {
    // Хранилище списка категорий (например: "Фильмы", "Книги")
    listsMeta: JSON.parse(localStorage.getItem('GL_CL_Meta')) || [],
    // Хранилище элементов (ключ = ID списка)
    listItems: JSON.parse(localStorage.getItem('GL_CL_Items')) || {},
    
    // Состояние
    currentView: 'hub', // 'hub', 'create-list', 'view-list', 'edit-item'
    activeListId: null,
    editingItemId: null,

    // Доступные опции для конструктора
    schemaOptions: [
        { key: 'hasRating', label: 'Рейтинг (5 звезд)', type: 'bool' },
        { key: 'hasCheckbox', label: 'Чек-бокс (выполнено)', type: 'bool' },
        { key: 'hasStatus', label: 'Статус (В процессе, и т.д.)', type: 'bool' },
        { key: 'hasDateStart', label: 'Дата начала', type: 'bool' },
        { key: 'hasDateEnd', label: 'Дата завершения', type: 'bool' },
        { key: 'hasSeries', label: 'Номер серии', type: 'number' },
        { key: 'hasPage', label: 'Номер страницы', type: 'number' },
        { key: 'hasLink', label: 'Ссылка', type: 'text' }
    ],

    statusMap: {
        'want': { label: 'Хочу начать', color: '#8E8E93' },
        'process': { label: 'В процессе', color: '#007AFF' },
        'pause': { label: 'Пауза', color: '#FF9500' },
        'done': { label: 'Закончила', color: '#34C759' },
        'drop': { label: 'Прекратила', color: '#FF3B30' }
    },

    init: function() {
        this.render();
    },

    save: function() {
        localStorage.setItem('GL_CL_Meta', JSON.stringify(this.listsMeta));
        localStorage.setItem('GL_CL_Items', JSON.stringify(this.listItems));
        this.render();
    },

    // --- ЛОГИКА СПИСКОВ (МЕТА) ---

    createList: function() {
        const title = document.getElementById('cl-new-list-title').value;
        if (!title.trim()) return alert('Введите название списка');

        const schema = {};
        this.schemaOptions.forEach(opt => {
            schema[opt.key] = document.getElementById(`cl-opt-${opt.key}`).checked;
        });

        const newList = {
            id: Date.now().toString(),
            title: title,
            schema: schema,
            created: new Date().toISOString()
        };

        this.listsMeta.push(newList);
        this.listItems[newList.id] = []; // Инициализируем массив элементов для этого списка
        this.currentView = 'hub';
        this.save();
    },

    deleteList: function(id) {
        if (confirm('Удалить весь список и все записи внутри?')) {
            this.listsMeta = this.listsMeta.filter(l => l.id !== id);
            delete this.listItems[id];
            this.currentView = 'hub';
            this.save();
        }
    },

    // --- ЛОГИКА ЗАПИСЕЙ (ITEMS) ---

    saveItem: function() {
        const list = this.listsMeta.find(l => l.id === this.activeListId);
        const title = document.getElementById('cl-item-title').value;
        const note = document.getElementById('cl-item-note').value;
        
        if (!title.trim()) return alert('Введите название');

        const newItem = {
            id: this.editingItemId === 'new' ? Date.now() : this.editingItemId,
            title: title,
            note: note,
            created: new Date().toISOString()
        };

        // Собираем данные согласно схеме
        if (list.schema.hasRating) newItem.rating = parseInt(document.querySelector('.cl-star.active')?.dataset.val || 0);
        if (list.schema.hasStatus) newItem.status = document.getElementById('cl-item-status').value;
        if (list.schema.hasCheckbox) newItem.checked = document.getElementById('cl-item-check').checked;
        if (list.schema.hasDateStart) newItem.dateStart = document.getElementById('cl-item-d-start').value;
        if (list.schema.hasDateEnd) newItem.dateEnd = document.getElementById('cl-item-d-end').value;
        if (list.schema.hasSeries) newItem.series = document.getElementById('cl-item-series').value;
        if (list.schema.hasPage) newItem.page = document.getElementById('cl-item-page').value;
        if (list.schema.hasLink) newItem.link = document.getElementById('cl-item-link').value;

        let items = this.listItems[this.activeListId] || [];

        if (this.editingItemId === 'new') {
            items.unshift(newItem);
        } else {
            const idx = items.findIndex(i => i.id == this.editingItemId);
            if (idx !== -1) items[idx] = newItem;
        }

        this.listItems[this.activeListId] = items;
        this.editingItemId = null;
        this.currentView = 'view-list';
        this.save();
    },

    deleteItem: function(itemId) {
        if (confirm('Удалить эту запись?')) {
            this.listItems[this.activeListId] = this.listItems[this.activeListId].filter(i => i.id !== itemId);
            this.editingItemId = null;
            this.currentView = 'view-list';
            this.save();
        }
    },

    toggleItemCheck: function(e, itemId) {
        e.stopPropagation();
        const items = this.listItems[this.activeListId];
        const item = items.find(i => i.id === itemId);
        if (item) {
            item.checked = !item.checked;
            this.save();
        }
    },

    // --- ОТРИСОВКА (RENDER) ---

    render: function() {
        const app = document.getElementById('app-viewport');
        const styles = `
            <style>
                .cl-wrap { animation: fadeIn 0.3s; padding-bottom: 80px; }
                
                /* HEADER */
                .cl-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
                .cl-back { color: #007AFF; cursor: pointer; font-size: 28px; }
                .cl-title { font-size: 24px; font-weight: 800; color: #1C1C1E; flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
                .cl-del-btn { color: #FF3B30; font-weight: 600; font-size: 14px; cursor: pointer; }

                /* LIST CARD (HUB) */
                .cl-hub-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
                .cl-list-card { background: white; padding: 20px; border-radius: 20px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 10px rgba(0,0,0,0.03); cursor: pointer; }
                .cl-list-name { font-weight: 700; font-size: 18px; color: #1C1C1E; }
                .cl-list-count { color: #8E8E93; font-size: 14px; font-weight: 600; }

                /* ITEM CARD (INSIDE LIST) */
                .cl-item { background: white; padding: 16px; border-radius: 18px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); position: relative; cursor: pointer; }
                .cl-item-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 6px; }
                .cl-item-title { font-weight: 700; font-size: 17px; line-height: 1.3; color: #1C1C1E; flex: 1; }
                .cl-item-note { font-size: 14px; color: #8E8E93; white-space: pre-wrap; margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
                
                /* BADGES & METADATA */
                .cl-meta-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 8px; }
                .cl-badge { padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; color: white; }
                .cl-stars { color: #FFD60A; font-size: 16px; letter-spacing: 1px; }
                .cl-info-txt { font-size: 12px; color: #AEAEB2; font-weight: 600; display: flex; align-items: center; gap: 4px; }

                /* CHECKBOX CIRCLE */
                .cl-check-circle { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #C7C7CC; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
                .cl-check-circle.checked { background: #34C759; border-color: #34C759; }
                .cl-check-circle .material-icons { font-size: 16px; color: white; display: none; }
                .cl-check-circle.checked .material-icons { display: block; }

                /* FAB BUTTON */
                .cl-fab { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #1C1C1E; color: white; padding: 15px 30px; border-radius: 30px; font-weight: 700; box-shadow: 0 10px 30px rgba(0,0,0,0.3); z-index: 100; cursor: pointer; display: flex; align-items: center; gap: 8px; }
                
                /* FORMS */
                .cl-form-group { margin-bottom: 20px; }
                .cl-label { font-size: 12px; font-weight: 700; color: #8E8E93; margin-bottom: 8px; display: block; text-transform: uppercase; }
                .cl-input { width: 100%; border: none; background: white; padding: 16px; border-radius: 16px; font-size: 17px; font-family: inherit; box-sizing: border-box; outline: none; }
                .cl-textarea { width: 100%; border: none; background: white; padding: 16px; border-radius: 16px; font-size: 17px; font-family: inherit; box-sizing: border-box; outline: none; resize: none; min-height: 100px; }
                .cl-switch-row { display: flex; justify-content: space-between; align-items: center; background: white; padding: 15px; border-radius: 16px; margin-bottom: 10px; }
                .cl-save-btn { width: 100%; background: #007AFF; color: white; padding: 18px; border-radius: 18px; font-weight: 700; font-size: 17px; border: none; margin-top: 10px; }

                /* RATING INPUT */
                .cl-rate-input { display: flex; gap: 10px; justify-content: center; background: white; padding: 15px; border-radius: 16px; }
                .cl-star { font-size: 32px; color: #E5E5EA; cursor: pointer; transition: 0.2s; }
                .cl-star.active { color: #FFD60A; transform: scale(1.1); }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        if (this.currentView === 'hub') {
            this.renderHub(app, styles);
        } else if (this.currentView === 'create-list') {
            this.renderCreateList(app, styles);
        } else if (this.currentView === 'view-list') {
            this.renderListView(app, styles);
        } else if (this.currentView === 'edit-item') {
            this.renderEditItem(app, styles);
        }

        this.initAutoResize();
    },

    // 1. ГЛАВНАЯ (HUB)
    renderHub: function(app, styles) {
        const listHtml = this.listsMeta.map(l => {
            const count = (this.listItems[l.id] || []).length;
            return `
                <div class="cl-list-card" onclick="CustomListModule.activeListId='${l.id}'; CustomListModule.currentView='view-list'; CustomListModule.render()">
                    <div class="cl-list-name">${l.title}</div>
                    <div class="cl-list-count">${count} <span class="material-icons-outlined" style="font-size:16px; vertical-align:middle; margin-left:5px;">chevron_right</span></div>
                </div>
            `;
        }).join('');

        app.innerHTML = styles + `
            <div class="cl-wrap">
                <div class="cl-header">
                    <span class="material-icons-outlined cl-back" onclick="loadModule('./main.js')">chevron_left</span>
                    <div class="cl-title">Мои списки</div>
                </div>
                <div class="cl-hub-grid">
                    ${listHtml || '<div style="text-align:center; color:#AEAEB2; margin-top:50px;">Списков пока нет</div>'}
                </div>
                <div class="cl-fab" onclick="CustomListModule.currentView='create-list'; CustomListModule.render()">
                    <span class="material-icons">add</span> Новый список
                </div>
            </div>
        `;
    },

    // 2. СОЗДАНИЕ СПИСКА (КОНСТРУКТОР)
    renderCreateList: function(app, styles) {
        app.innerHTML = styles + `
            <div class="cl-wrap">
                <div class="cl-header">
                    <span class="material-icons-outlined cl-back" onclick="CustomListModule.currentView='hub'; CustomListModule.render()">chevron_left</span>
                    <div class="cl-title">Создать список</div>
                </div>

                <div class="cl-form-group">
                    <label class="cl-label">Название списка</label>
                    <input type="text" id="cl-new-list-title" class="cl-input" placeholder="Например: Фильмы, Книги...">
                </div>

                <div class="cl-label" style="margin-top:25px; margin-bottom:15px;">ВЫБЕРИТЕ ЭЛЕМЕНТЫ КАРТОЧКИ:</div>
                
                ${this.schemaOptions.map(opt => `
                    <div class="cl-switch-row">
                        <span style="font-weight:600;">${opt.label}</span>
                        <input type="checkbox" id="cl-opt-${opt.key}" style="transform:scale(1.3);">
                    </div>
                `).join('')}

                <button class="cl-save-btn" onclick="CustomListModule.createList()">Создать список</button>
            </div>
        `;
    },

    // 3. ПРОСМОТР СПИСКА (ITEMS)
    renderListView: function(app, styles) {
        const list = this.listsMeta.find(l => l.id === this.activeListId);
        if (!list) return this.currentView = 'hub', this.render();

        const items = this.listItems[this.activeListId] || [];

        // Рендер элемента
        const renderItem = (item) => {
            // Звезды
            let starsHtml = '';
            if (list.schema.hasRating && item.rating) {
                const filled = '★'.repeat(item.rating);
                const empty = '☆'.repeat(5 - item.rating);
                starsHtml = `<div class="cl-stars">${filled}${empty}</div>`;
            }

            // Статус
            let statusHtml = '';
            if (list.schema.hasStatus && item.status && this.statusMap[item.status]) {
                const s = this.statusMap[item.status];
                statusHtml = `<div class="cl-badge" style="background:${s.color}">${s.label}</div>`;
            }

            // Чекбокс
            let checkHtml = '';
            if (list.schema.hasCheckbox) {
                checkHtml = `
                    <div class="cl-check-circle ${item.checked ? 'checked' : ''}" onclick="CustomListModule.toggleItemCheck(event, ${item.id})">
                        <span class="material-icons">check</span>
                    </div>
                `;
            }

            // Доп. инфо (даты, серии)
            let metaInfo = [];
            if (list.schema.hasSeries && item.series) metaInfo.push(`Серия: ${item.series}`);
            if (list.schema.hasPage && item.page) metaInfo.push(`Стр: ${item.page}`);
            if (list.schema.hasDateEnd && item.dateEnd) metaInfo.push(`Дата: ${new Date(item.dateEnd).toLocaleDateString('ru-RU')}`);

            return `
                <div class="cl-item" onclick="CustomListModule.editingItemId=${item.id}; CustomListModule.currentView='edit-item'; CustomListModule.render()">
                    <div class="cl-item-head">
                        <div style="flex:1;">
                            <div class="cl-item-title" style="${item.checked ? 'text-decoration:line-through; color:#AEAEB2;' : ''}">${item.title}</div>
                        </div>
                        ${checkHtml}
                    </div>
                    ${item.note ? `<div class="cl-item-note">${item.note}</div>` : ''}
                    ${starsHtml || statusHtml || metaInfo.length ? `
                        <div class="cl-meta-row">
                            ${starsHtml}
                            ${statusHtml}
                            ${metaInfo.map(t => `<div class="cl-info-txt">${t}</div>`).join('<div style="color:#E5E5EA;">|</div>')}
                        </div>
                    ` : ''}
                </div>
            `;
        };

        app.innerHTML = styles + `
            <div class="cl-wrap">
                <div class="cl-header">
                    <span class="material-icons-outlined cl-back" onclick="CustomListModule.currentView='hub'; CustomListModule.render()">chevron_left</span>
                    <div class="cl-title">${list.title}</div>
                    <span class="material-icons-outlined cl-del-btn" onclick="CustomListModule.deleteList('${list.id}')">delete</span>
                </div>

                <div>
                    ${items.length ? items.map(renderItem).join('') : '<div style="text-align:center; color:#AEAEB2; margin-top:40px;">Пусто... Добавьте запись</div>'}
                </div>

                <div class="cl-fab" onclick="CustomListModule.editingItemId='new'; CustomListModule.currentView='edit-item'; CustomListModule.render()">
                    <span class="material-icons">add</span> Добавить
                </div>
            </div>
        `;
    },

    // 4. РЕДАКТИРОВАНИЕ / СОЗДАНИЕ ЗАПИСИ
    renderEditItem: function(app, styles) {
        const list = this.listsMeta.find(l => l.id === this.activeListId);
        const item = this.editingItemId === 'new' ? {} : (this.listItems[this.activeListId].find(i => i.id == this.editingItemId) || {});

        // Генератор полей на основе схемы
        let fieldsHtml = '';

        if (list.schema.hasRating) {
            const r = item.rating || 0;
            fieldsHtml += `
                <div class="cl-form-group">
                    <label class="cl-label">Рейтинг</label>
                    <div class="cl-rate-input">
                        ${[1,2,3,4,5].map(i => `
                            <span class="material-icons cl-star ${i <= r ? 'active' : ''}" 
                                  data-val="${i}"
                                  onclick="this.parentNode.querySelectorAll('.cl-star').forEach(s => s.classList.remove('active')); 
                                           for(let j=1; j<=${i}; j++) this.parentNode.children[j-1].classList.add('active'); 
                                           this.classList.add('active')">
                                star
                            </span>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (list.schema.hasStatus) {
            fieldsHtml += `
                <div class="cl-form-group">
                    <label class="cl-label">Статус</label>
                    <select id="cl-item-status" class="cl-input">
                        <option value="">Не выбрано</option>
                        ${Object.entries(this.statusMap).map(([k, v]) => `<option value="${k}" ${item.status === k ? 'selected' : ''}>${v.label}</option>`).join('')}
                    </select>
                </div>
            `;
        }

        if (list.schema.hasCheckbox) {
            fieldsHtml += `
                <div class="cl-switch-row">
                    <span style="font-weight:600; color:#1C1C1E;">Выполнено (Галочка)</span>
                    <input type="checkbox" id="cl-item-check" style="transform:scale(1.3);" ${item.checked ? 'checked' : ''}>
                </div>
            `;
        }

        if (list.schema.hasSeries) {
            fieldsHtml += `
                <div class="cl-form-group">
                    <label class="cl-label">Номер серии</label>
                    <input type="number" id="cl-item-series" class="cl-input" value="${item.series || ''}" placeholder="Например: 5">
                </div>
            `;
        }
        
        if (list.schema.hasPage) {
            fieldsHtml += `
                <div class="cl-form-group">
                    <label class="cl-label">Номер страницы</label>
                    <input type="number" id="cl-item-page" class="cl-input" value="${item.page || ''}" placeholder="Например: 124">
                </div>
            `;
        }

        if (list.schema.hasDateStart) {
            fieldsHtml += `
                <div class="cl-form-group">
                    <label class="cl-label">Дата начала</label>
                    <input type="date" id="cl-item-d-start" class="cl-input" value="${item.dateStart || ''}">
                </div>
            `;
        }

        if (list.schema.hasDateEnd) {
            fieldsHtml += `
                <div class="cl-form-group">
                    <label class="cl-label">Дата завершения</label>
                    <input type="date" id="cl-item-d-end" class="cl-input" value="${item.dateEnd || ''}">
                </div>
            `;
        }

        if (list.schema.hasLink) {
            fieldsHtml += `
                <div class="cl-form-group">
                    <label class="cl-label">Ссылка</label>
                    <input type="text" id="cl-item-link" class="cl-input" value="${item.link || ''}" placeholder="https://...">
                </div>
            `;
        }

        app.innerHTML = styles + `
            <div class="cl-wrap">
                <div class="cl-header">
                    <span class="material-icons-outlined cl-back" onclick="CustomListModule.currentView='view-list'; CustomListModule.render()">chevron_left</span>
                    <div class="cl-title">${this.editingItemId === 'new' ? 'Новая запись' : 'Редактирование'}</div>
                </div>

                <div class="cl-form-group">
                    <label class="cl-label">НАЗВАНИЕ</label>
                    <input type="text" id="cl-item-title" class="cl-input" value="${item.title || ''}" placeholder="Введите название">
                </div>

                <div class="cl-form-group">
                    <label class="cl-label">ЗАМЕТКА</label>
                    <textarea id="cl-item-note" class="cl-textarea" placeholder="Описание, мысли, детали...">${item.note || ''}</textarea>
                </div>

                ${fieldsHtml}

                <button class="cl-save-btn" onclick="CustomListModule.saveItem()">Сохранить</button>
                ${this.editingItemId !== 'new' ? `<div style="text-align:center; color:#FF3B30; margin-top:20px; font-weight:700; cursor:pointer;" onclick="CustomListModule.deleteItem(${item.id})">Удалить запись</div>` : ''}
            </div>
        `;
    },

    initAutoResize: function() {
        const tx = document.getElementById('cl-item-note');
        if(!tx) return;
        tx.style.height = 'auto'; tx.style.height = tx.scrollHeight + 'px';
        tx.addEventListener('input', function() { this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px'; });
    }
};

window.CustomListModule = CustomListModule;
export function render() { CustomListModule.init(); }
