const SimpleLists = {
    meta: JSON.parse(localStorage.getItem('GL_Simple_Meta')) || [],
    items: JSON.parse(localStorage.getItem('GL_Simple_Items')) || {},
    view: 'list-categories', // 'list-categories', 'create-cat', 'view-items', 'edit-item'
    activeCatId: null,
    activeItemId: null,

    init() { this.render(); },

    render() {
        const app = document.getElementById('app-viewport');
        const styles = `
            <style>
                .sl-container { animation: fadeIn 0.3s; padding: 10px 15px 140px; }
                .sl-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
                .sl-card { background: white; padding: 20px; border-radius: 20px; margin-bottom: 12px; display: flex; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.03); cursor: pointer; }
                .sl-input, .sl-textarea { width: 100%; border: none; background: white; padding: 16px; border-radius: 16px; font-size: 17px; margin-bottom: 12px; outline: none; box-sizing: border-box; }
                .sl-textarea { min-height: 150px; resize: none; }
                .sl-fab { position: fixed; bottom: 110px; left: 50%; transform: translateX(-50%); background: #1C1C1E; color: white; padding: 16px 30px; border-radius: 30px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; z-index: 1000; box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
                .sl-star-row { display: flex; gap: 5px; color: #FFD60A; margin-top: 5px; }
                .sl-save-btn { width: 100%; background: #007AFF; color: white; padding: 18px; border-radius: 18px; font-weight: 700; border: none; }
            </style>
        `;

        if (this.view === 'list-categories') {
            const listHtml = this.meta.map(m => `<div class="sl-card" onclick="SimpleLists.openCat('${m.id}')"><b>${m.title}</b> <span style="color:#8E8E93">${(this.items[m.id] || []).length} ></span></div>`).join('');
            app.innerHTML = styles + `<div class="sl-container">
                <div class="sl-header"><span class="material-icons" onclick="loadModule('./lists.js')" style="color:#007AFF; cursor:pointer;">chevron_left</span> <h2 style="flex:1; text-align:center; margin-right:30px;">Мои списки</h2></div>
                ${listHtml || '<p style="text-align:center; color:#8E8E93">Нет списков</p>'}
                <div class="sl-fab" onclick="SimpleLists.view='create-cat'; SimpleLists.render()"><span class="material-icons">add</span> Создать список</div>
            </div>`;
        } 
        else if (this.view === 'create-cat') {
            app.innerHTML = styles + `<div class="sl-container">
                <div class="sl-header"><span class="material-icons" onclick="SimpleLists.view='list-categories'; SimpleLists.render()" style="color:#007AFF; cursor:pointer;">chevron_left</span> <h2>Новый список</h2></div>
                <input type="text" id="cat-name" class="sl-input" placeholder="Название (например: Фильмы)">
                <div style="background:white; padding:15px; border-radius:16px; display:flex; justify-content:space-between; margin-top:10px;">
                    <span>Использовать рейтинг (5 звезд)</span>
                    <input type="checkbox" id="use-rating" style="transform:scale(1.2)">
                </div>
                <button class="sl-save-btn" style="margin-top:20px" onclick="SimpleLists.saveCat()">Создать</button>
            </div>`;
        }
        else if (this.view === 'view-items') {
            const cat = this.meta.find(m => m.id === this.activeCatId);
            const itemsHtml = (this.items[this.activeCatId] || []).map(i => `
                <div class="sl-card" style="flex-direction:column; align-items:flex-start;" onclick="SimpleLists.editItem('${i.id}')">
                    <div style="font-weight:700; font-size:18px;">${i.title}</div>
                    <div style="font-size:14px; color:#8E8E93; white-space:pre-wrap; margin:5px 0;">${i.note}</div>
                    ${cat.useRating ? `<div class="sl-star-row">${'★'.repeat(i.rating)}${'☆'.repeat(5-i.rating)}</div>` : ''}
                </div>
            `).join('');
            app.innerHTML = styles + `<div class="sl-container">
                <div class="sl-header"><span class="material-icons" onclick="SimpleLists.view='list-categories'; SimpleLists.render()" style="color:#007AFF; cursor:pointer;">chevron_left</span> <h2 style="flex:1; text-align:center; margin-right:30px;">${cat.title}</h2></div>
                ${itemsHtml}
                <div class="sl-fab" onclick="SimpleLists.activeItemId='new'; SimpleLists.view='edit-item'; SimpleLists.render()"><span class="material-icons">add</span> Добавить запись</div>
            </div>`;
        }
        else if (this.view === 'edit-item') {
            const cat = this.meta.find(m => m.id === this.activeCatId);
            const item = this.activeItemId === 'new' ? {title:'', note:'', rating:0} : this.items[this.activeCatId].find(i => i.id == this.activeItemId);
            app.innerHTML = styles + `<div class="sl-container">
                <div class="sl-header"><span class="material-icons" onclick="SimpleLists.view='view-items'; SimpleLists.render()" style="color:#007AFF; cursor:pointer;">chevron_left</span> <h2>Запись</h2></div>
                <input type="text" id="i-title" class="sl-input" placeholder="Название" value="${item.title}">
                <textarea id="i-note" class="sl-textarea" placeholder="Заметки...">${item.note}</textarea>
                ${cat.useRating ? `<div class="sl-input">Рейтинг (0-5): <input type="number" id="i-rating" min="0" max="5" value="${item.rating}" style="border:none; width:50px; font-size:17px;"></div>` : ''}
                <button class="sl-save-btn" onclick="SimpleLists.saveItem()">Сохранить</button>
            </div>`;
        }
    },

    openCat(id) { this.activeCatId = id; this.view = 'view-items'; this.render(); },
    saveCat() {
        const title = document.getElementById('cat-name').value;
        if(!title) return;
        const id = Date.now().toString();
        this.meta.push({ id, title, useRating: document.getElementById('use-rating').checked });
        this.items[id] = [];
        this.view = 'list-categories';
        this.store();
    },
    saveItem() {
        const title = document.getElementById('i-title').value;
        if(!title) return;
        const newItem = {
            id: this.activeItemId === 'new' ? Date.now() : this.activeItemId,
            title,
            note: document.getElementById('i-note').value,
            rating: document.getElementById('i-rating')?.value || 0
        };
        if(this.activeItemId === 'new') this.items[this.activeCatId].push(newItem);
        else {
            const idx = this.items[this.activeCatId].findIndex(i => i.id == this.activeItemId);
            this.items[this.activeCatId][idx] = newItem;
        }
        this.view = 'view-items';
        this.store();
    },
    store() {
        localStorage.setItem('GL_Simple_Meta', JSON.stringify(this.meta));
        localStorage.setItem('GL_Simple_Items', JSON.stringify(this.items));
        this.render();
    }
};

window.SimpleLists = SimpleLists;
export function render() { SimpleLists.init(); }
