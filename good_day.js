const GoodDayModule = {
    config: {
        storageKey: 'GL_Data_GoodDay',
        title: 'Хорошее за день',
        placeholder: 'Что приятного произошло сегодня?'
    },
    data: [],
    editingId: null,

    init: function() {
        this.data = JSON.parse(localStorage.getItem(this.config.storageKey)) || [];
        this.render();
    },

    save: function() {
        localStorage.setItem(this.config.storageKey, JSON.stringify(this.data));
        this.render();
    },

    openModal: function(id = null) {
        this.editingId = id;
        this.render();
    },

    addItem: function() {
        const text = document.getElementById('list-input-field').value;
        const date = document.getElementById('list-date-field').value;
        if (!text.trim()) return;

        if (this.editingId === 'new') {
            this.data.push({ id: Date.now(), text: text, date: date });
        } else {
            const item = this.data.find(i => i.id == this.editingId);
            if (item) { item.text = text; item.date = date; }
        }
        this.editingId = null;
        this.save();
    },

    deleteItem: function(id) {
        this.editingId = null;
        this.render();
        setTimeout(() => {
            if (confirm('Удалить эту запись?')) {
                this.data = this.data.filter(i => i.id != id);
                this.save();
            }
        }, 50);
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        const styles = `
            <style>
                .ls-wrap { animation: fadeIn 0.2s; padding-top: 10px; }

                /* Уникальные стили для шапки Хорошее за день */
                .gd-header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
                .gd-back-btn { color: #007AFF; cursor: pointer; font-size: 28px; }
                .gd-title { font-size: 24px; font-weight: 800; flex: 1; text-align: center; margin-right: 40px; color: #1C1C1E; }

                .ls-item { background: white; border-radius: 20px; padding: 18px; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); display: flex; cursor: pointer; }
                .ls-number { font-weight: 800; color: #5856D6; min-width: 25px; font-size: 16px; margin-right: 8px; line-height: 1.5; }
                .ls-content { flex: 1; }
                .ls-text { font-size: 16px; line-height: 1.5; color: #1C1C1E; white-space: pre-wrap; word-break: break-word; }
                .ls-date { font-size: 11px; color: #AEAEB2; font-weight: 600; text-align: right; margin-top: 8px; }
                .ls-add-btn { background: #5856D6; color: white; border-radius: 18px; padding: 16px; text-align: center; font-weight: 700; margin-bottom: 20px; cursor: pointer; }
                .ls-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 3000; display: flex; align-items: flex-end; backdrop-filter: blur(2px); }
                .ls-modal { background: #F2F2F7; width: 100%; border-radius: 30px 30px 0 0; padding: 25px; box-sizing: border-box; animation: slideUp 0.3s; }
                .ls-input-group { background: white; border-radius: 18px; padding: 15px; margin-bottom: 15px; }
                .ls-label { font-size: 11px; color: #8E8E93; font-weight: 800; margin-bottom: 5px; display: block; }
                .ls-textarea { width: 100%; border: none; outline: none; font-family: inherit; font-size: 17px; resize: none; min-height: 120px; background: transparent; }
                .ls-input-date { width: 100%; border: none; outline: none; font-family: inherit; font-size: 16px; background: transparent; }
                .ls-save { background: #5856D6; color: white; border: none; width: 100%; padding: 18px; border-radius: 18px; font-weight: 700; font-size: 17px; }
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        let listHtml = this.data.map((item, index) => `
            <div class="ls-item" onclick="GoodDayModule.openModal(${item.id})">
                <div class="ls-number">${index + 1}.</div>
                <div class="ls-content">
                    <div class="ls-text">${item.text}</div>
                    <div class="ls-date">${new Date(item.date).toLocaleDateString('ru-RU')}</div>
                </div>
            </div>
        `).join('');

        app.innerHTML = styles + `
            <div class="ls-wrap">
                <div class="gd-header">
                    <span class="material-icons-outlined gd-back-btn" onclick="loadModule('./mental.js')">chevron_left</span>
                    <div class="gd-title">${this.config.title}</div>
                </div>
                <div class="ls-add-btn" onclick="GoodDayModule.openModal('new')">+ Записать хорошее</div>
                <div class="ls-list">${listHtml || '<div style="text-align:center; color:#8E8E93; margin-top:40px;">Записей пока нет...</div>'}</div>
            </div>
            ${this.editingId ? this.renderModal() : ''}
        `;
        if(this.editingId) this.initAutoResize();
    },

    renderModal: function() {
        const item = this.editingId === 'new' ? null : this.data.find(i => i.id == this.editingId);
        const today = new Date().toISOString().split('T')[0];
        return `
            <div class="ls-modal-bg" onclick="GoodDayModule.editingId=null; GoodDayModule.render()">
                <div class="ls-modal" onclick="event.stopPropagation()">
                    <h3 style="text-align:center; margin-top:0;">Хорошее событие</h3>
                    <div class="ls-input-group">
                        <label class="ls-label">ДАТА</label>
                        <input type="date" id="list-date-field" class="ls-input-date" value="${item ? item.date : today}">
                    </div>
                    <div class="ls-input-group">
                        <label class="ls-label">ЧТО ПРИЯТНОГО</label>
                        <textarea id="list-input-field" class="ls-textarea" placeholder="${this.config.placeholder}">${item ? item.text : ''}</textarea>
                    </div>
                    <button class="ls-save" onclick="GoodDayModule.addItem()">Сохранить</button>
                    ${item ? `<div style="text-align:center; color:#FF3B30; margin-top:15px; font-weight:700; cursor:pointer;" onclick="GoodDayModule.deleteItem(${item.id})">Удалить</div>` : ''}
                </div>
            </div>
        `;
    },

    initAutoResize: function() {
        const tx = document.getElementById('list-input-field');
        if(!tx) return;
        tx.style.height = 'auto'; tx.style.height = tx.scrollHeight + 'px';
        tx.addEventListener('input', function() { this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px'; });
    }
};

window.GoodDayModule = GoodDayModule;
export function render() { GoodDayModule.init(); }
