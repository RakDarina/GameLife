/* ==========================================
   МОДУЛЬ: КОНСТРУКТОР СПИСКОВ (simple-lists.js)
   ========================================== */

const SimpleLists = {
    // Хранилище мета-данных (списки и их настройки)
    meta: JSON.parse(localStorage.getItem('GL_SL_Meta')) || [],
    // Хранилище элементов (ключ = ID списка)
    items: JSON.parse(localStorage.getItem('GL_SL_Items')) || {},

    // Состояние
    view: 'hub', // 'hub', 'edit-list-config', 'view-list', 'edit-item'
    activeListId: null,
    editingItemId: null,
    sortMode: 'date-desc', // 'date-desc', 'date-asc', 'alpha', 'rating'

    // Доступные опции конструктора (схема)
    schemaOptions: [
        { key: 'hasRating', label: 'Рейтинг (5 звезд)' },
        { key: 'hasStatus', label: 'Статус (В процессе, пауза...)' },
        { key: 'hasDateStart', label: 'Дата начала' },
        { key: 'hasDateEnd', label: 'Дата окончания' },
        { key: 'hasSeries', label: 'Сериал (Сезон/Серия)' },
        { key: 'hasPage', label: 'Страница (Книги)' },
        { key: 'hasPrice', label: 'Цена' },
        { key: 'hasPhoto', label: 'Фотография' }
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
        localStorage.setItem('GL_SL_Meta', JSON.stringify(this.meta));
        localStorage.setItem('GL_SL_Items', JSON.stringify(this.items));
        this.render();
    },

    // --- ЛОГИКА СОРТИРОВКИ ---
    getSortedItems: function(listId) {
        let items = [...(this.items[listId] || [])];
        
        switch(this.sortMode) {
            case 'alpha': 
                return items.sort((a, b) => a.title.localeCompare(b.title));
            case 'rating': 
                return items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'date-asc': 
                return items.sort((a, b) => new Date(a.created) - new Date(b.created));
            case 'date-desc': 
            default:
                return items.sort((a, b) => new Date(b.created) - new Date(a.created));
        }
    },

    // --- УПРАВЛЕНИЕ СПИСКАМИ ---
    
    // Создать или сохранить настройки списка
    saveListConfig: function() {
        const title = document.getElementById('sl-list-title').value;
        if (!title.trim()) return alert('Введите название списка');

        const schema = {};
        this.schemaOptions.forEach(opt => {
            schema[opt.key] = document.getElementById(`sl-opt-${opt.key}`).checked;
        });

        if (this.activeListId === 'new') {
            const newList = {
                id: Date.now().toString(),
                title: title,
                schema: schema,
                created: new Date().toISOString()
            };
            this.meta.push(newList);
            this.items[newList.id] = [];
        } else {
            // Редактирование существующего
            const list = this.meta.find(l => l.id === this.activeListId);
            list.title = title;
            list.schema = schema;
        }

        this.view = 'hub';
        this.save();
    },

    deleteList: function(e, id) {
        e.stopPropagation();
        if (confirm('Удалить этот список и все записи в нем?')) {
            this.meta = this.meta.filter(l => l.id !== id);
            delete this.items[id];
            this.save();
        }
    },

    // --- УПРАВЛЕНИЕ ЗАПИСЯМИ ---

   saveItem: function() {
        const list = this.meta.find(l => l.id === this.activeListId);
        // Безопасное получение заголовка
        const titleInput = document.getElementById('sl-item-title');
        const title = titleInput ? titleInput.value : '';
        
        if (!title.trim()) return alert('Введите название');

        // Сбор данных
        const itemData = {
            id: this.editingItemId === 'new' ? Date.now() : this.editingItemId,
            title: title,
            note: document.getElementById('sl-item-note')?.value || '',
            // Сохраняем дату создания или берем текущую
            created: this.editingItemId === 'new' ? new Date().toISOString() : (
                (this.items[this.activeListId].find(i => i.id == this.editingItemId) || {}).created || new Date().toISOString()
            )
        };

        // --- ИСПРАВЛЕНИЕ РЕЙТИНГА (Считаем количество звезд) ---
        if (list.schema.hasRating) {
            // Ищем все звезды с классом active внутри блока ввода рейтинга
            const activeStars = document.querySelectorAll('.sl-rate-input .sl-star.active');
            itemData.rating = activeStars.length; 
        }

        // Остальные поля с безопасной проверкой (?.value)
        if (list.schema.hasStatus) itemData.status = document.getElementById('sl-item-status')?.value;
        if (list.schema.hasDateStart) itemData.dateStart = document.getElementById('sl-item-d-start')?.value;
        if (list.schema.hasDateEnd) itemData.dateEnd = document.getElementById('sl-item-d-end')?.value;
        
        if (list.schema.hasSeries) {
            itemData.season = document.getElementById('sl-item-season')?.value;
            itemData.episode = document.getElementById('sl-item-episode')?.value;
        }
        if (list.schema.hasPage) itemData.page = document.getElementById('sl-item-page')?.value;
        if (list.schema.hasPrice) itemData.price = document.getElementById('sl-item-price')?.value;
        
        // Внутренняя функция финализации
        const saveAndClose = () => {
            let items = this.items[this.activeListId] || [];
            
            if (this.editingItemId === 'new') {
                items.unshift(itemData); // Добавляем в начало
            } else {
                const idx = items.findIndex(i => i.id == this.editingItemId);
                if (idx !== -1) {
                    // Если фото не меняли, оставляем старое
                    if (!itemData.photo) itemData.photo = items[idx].photo; 
                    items[idx] = itemData;
                }
            }
            
            this.items[this.activeListId] = items;
            this.view = 'view-list'; // Принудительно меняем экран
            this.save(); // Сохраняем и перерисовываем
        };

        // Обработка фото
        const photoInput = document.getElementById('sl-item-photo');
        if (list.schema.hasPhoto && photoInput && photoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                itemData.photo = e.target.result;
                saveAndClose();
            };
            reader.readAsDataURL(photoInput.files[0]);
        } else {
            // Если фото нет или не выбрано — просто сохраняем
            saveAndClose();
        }
    },

    deleteItem: function(itemId) {
        if (confirm('Удалить запись?')) {
            this.items[this.activeListId] = this.items[this.activeListId].filter(i => i.id !== itemId);
            this.view = 'view-list';
            this.save();
        }
    },

    // --- RENDER ---

    render: function() {
        const app = document.getElementById('app-viewport');
        
        // CSS стили
        const styles = `
            <style>
                .sl-wrap { animation: fadeIn 0.3s; padding: 10px 15px 120px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
                
                /* HEADER */
                .sl-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
                .sl-back { color: #007AFF; cursor: pointer; font-size: 28px; }
                .sl-title { font-size: 24px; font-weight: 800; color: #1C1C1E; flex: 1; text-align: center; margin-right: 40px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

                /* СПИСКИ (HUB) */
                .sl-list-card { 
                    background: white; border-radius: 16px; padding: 16px; margin-bottom: 12px; 
                    display: flex; justify-content: space-between; align-items: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.03); cursor: pointer; transition: 0.1s;
                }
                .sl-list-card:active { transform: scale(0.98); background: #F2F2F7; }
                .sl-list-actions { display: flex; gap: 15px; }
                .sl-list-icon { color: #8E8E93; font-size: 20px; cursor: pointer; }
                .sl-list-icon.del { color: #FF3B30; }

                /* КНОПКА СОЗДАТЬ СПИСОК (ПУНКТИР) */
                .sl-create-hub-btn {
                    border: 2px dashed #C7C7CC; border-radius: 16px; padding: 20px;
                    text-align: center; color: #8E8E93; font-weight: 600; cursor: pointer; margin-top: 10px;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                }

                /* СОРТИРОВКА */
                .sl-sort-bar { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 10px; }
                .sl-chip { 
                    padding: 6px 14px; background: #E5E5EA; border-radius: 20px; 
                    font-size: 13px; font-weight: 600; color: #1C1C1E; white-space: nowrap; cursor: pointer;
                }
                .sl-chip.active { background: #007AFF; color: white; }

                /* ITEM CARD */
                .sl-item { background: white; padding: 16px; border-radius: 18px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); cursor: pointer; position: relative; }
                .sl-item-title { font-weight: 700; font-size: 17px; margin-bottom: 4px; color: #1C1C1E; }
                .sl-item-note { font-size: 14px; color: #8E8E93; white-space: pre-wrap; margin-bottom: 8px; max-height: 60px; overflow: hidden; }
                .sl-meta-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 8px; font-size: 12px; color: #8E8E93; font-weight: 600; }
                .sl-stars { color: #FFD60A; font-size: 16px; letter-spacing: 1px; }
                .sl-badge { padding: 4px 10px; border-radius: 6px; color: white; font-size: 11px; }
                .sl-photo-preview { width: 100%; height: 150px; object-fit: cover; border-radius: 12px; margin-bottom: 10px; display: block; }

                /* FORMS */
                .sl-form-group { margin-bottom: 20px; }
                .sl-label { font-size: 12px; font-weight: 700; color: #8E8E93; margin-bottom: 8px; display: block; text-transform: uppercase; }
                .sl-input, .sl-textarea { 
                    width: 100%; border: none; background: white; padding: 16px; border-radius: 16px; 
                    font-size: 17px; font-family: inherit; box-sizing: border-box; outline: none; 
                }
                .sl-textarea { min-height: 120px; resize: none; }
                .sl-switch-row { display: flex; justify-content: space-between; align-items: center; background: white; padding: 15px; border-radius: 16px; margin-bottom: 8px; }
                .sl-save-btn { width: 100%; background: #007AFF; color: white; padding: 18px; border-radius: 18px; font-weight: 700; font-size: 17px; border: none; margin-top: 20px; cursor: pointer; }

                /* RATING INPUT */
                .sl-rate-input { display: flex; gap: 10px; justify-content: center; background: white; padding: 15px; border-radius: 16px; }
                .sl-star { font-size: 32px; color: #E5E5EA; cursor: pointer; transition: 0.2s; }
                .sl-star.active { color: #FFD60A; transform: scale(1.1); }

                /* FAB (Кнопка +) */
                .sl-fab { 
                    position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); 
                    background: #1C1C1E; color: white; width: 56px; height: 56px; 
                    border-radius: 50%; box-shadow: 0 10px 25px rgba(0,0,0,0.3); 
                    display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 999;
                }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        if (this.view === 'hub') this.renderHub(app, styles);
        else if (this.view === 'edit-list-config') this.renderListConfig(app, styles);
        else if (this.view === 'view-list') this.renderListView(app, styles);
        else if (this.view === 'edit-item') this.renderEditItem(app, styles);
        
        // Автоувеличение textarea
        setTimeout(() => {
            document.querySelectorAll('.sl-textarea').forEach(tx => {
                tx.setAttribute('style', 'height:' + (tx.scrollHeight) + 'px;overflow-y:hidden;');
                tx.addEventListener("input", function(){
                    this.style.height = 'auto';
                    this.style.height = (this.scrollHeight) + 'px';
                }, false);
            });
        }, 50);
    },

    // 1. ГЛАВНАЯ: СПИСОК СПИСКОВ
    renderHub: function(app, styles) {
        const listHtml = this.meta.map(l => {
            const count = (this.items[l.id] || []).length;
            return `
                <div class="sl-list-card" onclick="SimpleLists.activeListId='${l.id}'; SimpleLists.view='view-list'; SimpleLists.render()">
                    <div>
                        <div style="font-weight:700; font-size:17px; color:#1C1C1E;">${l.title}</div>
                        <div style="font-size:13px; color:#8E8E93;">${count} записей</div>
                    </div>
                    <div class="sl-list-actions">
                        <span class="material-icons sl-list-icon" onclick="event.stopPropagation(); SimpleLists.activeListId='${l.id}'; SimpleLists.view='edit-list-config'; SimpleLists.render()">edit</span>
                        <span class="material-icons sl-list-icon del" onclick="SimpleLists.deleteList(event, '${l.id}')">delete</span>
                    </div>
                </div>
            `;
        }).join('');

        app.innerHTML = styles + `
            <div class="sl-wrap">
                <div class="sl-header">
                    <span class="material-icons-outlined sl-back" onclick="loadModule('./lists.js')">chevron_left</span>
                    <div class="sl-title">Мои списки</div>
                </div>
                ${listHtml}
                <div class="sl-create-hub-btn" onclick="SimpleLists.activeListId='new'; SimpleLists.view='edit-list-config'; SimpleLists.render()">
                    <span class="material-icons">add</span> Создать новый список
                </div>
            </div>
        `;
    },

    // 2. КОНФИГУРАЦИЯ СПИСКА (СОЗДАНИЕ/РЕДАКТИРОВАНИЕ)
    renderListConfig: function(app, styles) {
        const isNew = this.activeListId === 'new';
        const list = isNew ? { schema: {} } : this.meta.find(l => l.id === this.activeListId);
        
        app.innerHTML = styles + `
            <div class="sl-wrap">
                <div class="sl-header">
                    <span class="material-icons-outlined sl-back" onclick="SimpleLists.view='hub'; SimpleLists.render()">chevron_left</span>
                    <div class="sl-title">${isNew ? 'Новый список' : 'Настройки списка'}</div>
                </div>

                <div class="sl-form-group">
                    <label class="sl-label">Название</label>
                    <input type="text" id="sl-list-title" class="sl-input" value="${list.title || ''}" placeholder="Например: Книги">
                </div>

                <div class="sl-label" style="margin-top:25px; margin-bottom:10px;">ВЫБЕРИТЕ ПОЛЯ ДЛЯ КАРТОЧКИ:</div>
                
                ${this.schemaOptions.map(opt => `
                    <div class="sl-switch-row">
                        <span style="font-weight:600; font-size:15px;">${opt.label}</span>
                        <input type="checkbox" id="sl-opt-${opt.key}" ${list.schema[opt.key] ? 'checked' : ''} style="transform:scale(1.3);">
                    </div>
                `).join('')}

                <button class="sl-save-btn" onclick="SimpleLists.saveListConfig()">${isNew ? 'Создать' : 'Сохранить'}</button>
            </div>
        `;
    },

    // 3. ПРОСМОТР СПИСКА (ITEMS)
    renderListView: function(app, styles) {
        const list = this.meta.find(l => l.id === this.activeListId);
        if (!list) return this.view = 'hub', this.render();

        const items = this.getSortedItems(this.activeListId);

        // Генерация карточки элемента
        const renderItem = (item) => {
            let metaHtml = [];
            
            // Рейтинг
            if (list.schema.hasRating && item.rating) {
                metaHtml.push(`<span class="sl-stars">${'★'.repeat(item.rating)}${'☆'.repeat(5-item.rating)}</span>`);
            }
            // Статус
            if (list.schema.hasStatus && item.status) {
                const s = this.statusMap[item.status];
                metaHtml.push(`<span class="sl-badge" style="background:${s.color}">${s.label}</span>`);
            }
            // Серия / Страница
            if (list.schema.hasSeries && (item.season || item.episode)) metaHtml.push(`S${item.season || 1} E${item.episode || 1}`);
            if (list.schema.hasPage && item.page) metaHtml.push(`${item.page} стр.`);
            // Цена
            if (list.schema.hasPrice && item.price) metaHtml.push(`${item.price} ₽`);
            // Дата (автоматическая)
            metaHtml.push(new Date(item.created).toLocaleDateString('ru-RU'));

            return `
                <div class="sl-item" onclick="SimpleLists.editingItemId=${item.id}; SimpleLists.view='edit-item'; SimpleLists.render()">
                    ${item.photo ? `<img src="${item.photo}" class="sl-photo-preview">` : ''}
                    <div class="sl-item-title">${item.title}</div>
                    ${item.note ? `<div class="sl-item-note">${item.note}</div>` : ''}
                    ${metaHtml.length ? `<div class="sl-meta-row">${metaHtml.join('<span style="color:#E5E5EA">|</span>')}</div>` : ''}
                </div>
            `;
        };

        app.innerHTML = styles + `
            <div class="sl-wrap">
                <div class="sl-header">
                    <span class="material-icons-outlined sl-back" onclick="SimpleLists.view='hub'; SimpleLists.render()">chevron_left</span>
                    <div class="sl-title">${list.title}</div>
                    <span class="material-icons-outlined" style="font-size:20px; color:#007AFF;" onclick="SimpleLists.view='edit-list-config'; SimpleLists.render()">settings</span>
                </div>

                <div class="sl-sort-bar">
                    <div class="sl-chip ${this.sortMode === 'date-desc' ? 'active' : ''}" onclick="SimpleLists.sortMode='date-desc'; SimpleLists.render()">Сначала новые</div>
                    <div class="sl-chip ${this.sortMode === 'date-asc' ? 'active' : ''}" onclick="SimpleLists.sortMode='date-asc'; SimpleLists.render()">Сначала старые</div>
                    <div class="sl-chip ${this.sortMode === 'alpha' ? 'active' : ''}" onclick="SimpleLists.sortMode='alpha'; SimpleLists.render()">А-Я</div>
                    ${list.schema.hasRating ? `<div class="sl-chip ${this.sortMode === 'rating' ? 'active' : ''}" onclick="SimpleLists.sortMode='rating'; SimpleLists.render()">По рейтингу</div>` : ''}
                </div>

                <div>
                    ${items.length ? items.map(renderItem).join('') : '<div style="text-align:center; color:#AEAEB2; margin-top:40px;">Нет записей. Нажмите +</div>'}
                </div>

                <div class="sl-fab" onclick="SimpleLists.editingItemId='new'; SimpleLists.view='edit-item'; SimpleLists.render()">
                    <span class="material-icons">add</span>
                </div>
            </div>
        `;
    },

    // 4. РЕДАКТИРОВАНИЕ ЗАПИСИ (ITEM FORM)
    renderEditItem: function(app, styles) {
        const list = this.meta.find(l => l.id === this.activeListId);
        const item = this.editingItemId === 'new' ? {} : (this.items[this.activeListId].find(i => i.id == this.editingItemId) || {});

        let fieldsHtml = '';

        // Динамические поля
        if (list.schema.hasRating) {
            const r = item.rating || 0;
            fieldsHtml += `
                <div class="sl-form-group">
                    <label class="sl-label">Рейтинг</label>
                    <div class="sl-rate-input">
                        ${[1,2,3,4,5].map(i => `
                            <span class="material-icons sl-star ${i <= r ? 'active' : ''}" 
                                  data-val="${i}"
                                  onclick="this.parentNode.querySelectorAll('.sl-star').forEach(s => s.classList.remove('active')); 
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
                <div class="sl-form-group">
                    <label class="sl-label">Статус</label>
                    <select id="sl-item-status" class="sl-input">
                        ${Object.entries(this.statusMap).map(([k, v]) => `<option value="${k}" ${item.status === k ? 'selected' : ''}>${v.label}</option>`).join('')}
                    </select>
                </div>
            `;
        }

        if (list.schema.hasSeries) {
            fieldsHtml += `
                <div style="display:flex; gap:10px;">
                    <div class="sl-form-group" style="flex:1;">
                        <label class="sl-label">Сезон</label>
                        <input type="number" id="sl-item-season" class="sl-input" value="${item.season || ''}" placeholder="1">
                    </div>
                    <div class="sl-form-group" style="flex:1;">
                        <label class="sl-label">Серия</label>
                        <input type="number" id="sl-item-episode" class="sl-input" value="${item.episode || ''}" placeholder="1">
                    </div>
                </div>
            `;
        }

        if (list.schema.hasPage) {
            fieldsHtml += `<div class="sl-form-group"><label class="sl-label">Страница</label><input type="number" id="sl-item-page" class="sl-input" value="${item.page || ''}" placeholder="Стр."></div>`;
        }

        if (list.schema.hasPrice) {
            fieldsHtml += `<div class="sl-form-group"><label class="sl-label">Цена</label><input type="number" id="sl-item-price" class="sl-input" value="${item.price || ''}" placeholder="₽"></div>`;
        }

        if (list.schema.hasDateStart || list.schema.hasDateEnd) {
            fieldsHtml += `<div style="display:flex; gap:10px;">`;
            if (list.schema.hasDateStart) fieldsHtml += `<div style="flex:1"><label class="sl-label">Начало</label><input type="date" id="sl-item-d-start" class="sl-input" value="${item.dateStart || ''}"></div>`;
            if (list.schema.hasDateEnd) fieldsHtml += `<div style="flex:1"><label class="sl-label">Конец</label><input type="date" id="sl-item-d-end" class="sl-input" value="${item.dateEnd || ''}"></div>`;
            fieldsHtml += `</div><br>`;
        }

        if (list.schema.hasPhoto) {
            fieldsHtml += `
                <div class="sl-form-group">
                    <label class="sl-label">Фотография</label>
                    ${item.photo ? `<img src="${item.photo}" style="width:100px; height:100px; object-fit:cover; border-radius:10px; display:block; margin-bottom:10px;">` : ''}
                    <input type="file" id="sl-item-photo" class="sl-input" accept="image/*">
                </div>
            `;
        }

        app.innerHTML = styles + `
            <div class="sl-wrap">
                <div class="sl-header">
                    <span class="material-icons-outlined sl-back" onclick="SimpleLists.view='view-list'; SimpleLists.render()">chevron_left</span>
                    <div class="sl-title">${this.editingItemId === 'new' ? 'Новая запись' : 'Редактирование'}</div>
                    ${this.editingItemId !== 'new' ? `<span class="material-icons-outlined" style="color:#FF3B30;" onclick="SimpleLists.deleteItem(${item.id})">delete</span>` : ''}
                </div>

                <div class="sl-form-group">
                    <label class="sl-label">Название</label>
                    <input type="text" id="sl-item-title" class="sl-input" value="${item.title || ''}" placeholder="Заголовок">
                </div>

                <div class="sl-form-group">
                    <label class="sl-label">Заметка</label>
                    <textarea id="sl-item-note" class="sl-textarea" placeholder="Подробное описание...">${item.note || ''}</textarea>
                </div>

                ${fieldsHtml}

                <button class="sl-save-btn" onclick="SimpleLists.saveItem()">Сохранить</button>
            </div>
        `;
    }
};

window.SimpleLists = SimpleLists;
export function render() { SimpleLists.init(); }
