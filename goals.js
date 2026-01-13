/* ==========================================
   СТРАНИЦА: ЦЕЛИ (goals.js)
   ========================================== */

// Уникальное пространство имен, чтобы не смешиваться с другими страницами
const GoalsModule = {
    // Данные по умолчанию
    data: {
        year: 2026,
        items: [] // Здесь будет дерево целей
    },

    // Инициализация страницы
    init: function() {
        this.loadData();
        this.render();
    },

    // Сохранение в память телефона
    saveData: function() {
        localStorage.setItem('LifeSpark_Goals', JSON.stringify(this.data));
        this.updateGlobalProgress();
    },

    // Загрузка из памяти
    loadData: function() {
        const saved = localStorage.getItem('LifeSpark_Goals');
        if (saved) {
            this.data = JSON.parse(saved);
        }
    },

    // --- ЛОГИКА ПРОГРЕССА ---
    
    // Рекурсивный подсчет прогресса для элемента
    calculateItemProgress: function(item) {
        if (!item.children || item.children.length === 0) {
            return item.completed ? 100 : 0;
        }

        let total = 0;
        item.children.forEach(child => {
            total += this.calculateItemProgress(child);
        });
        return Math.round(total / item.children.length);
    },

    // Общий прогресс всего года
    calculateGlobalProgress: function() {
        if (this.data.items.length === 0) return 0;
        let total = 0;
        this.data.items.forEach(item => {
            total += this.calculateItemProgress(item);
        });
        return Math.round(total / this.data.items.length);
    },

    // --- ОТРИСОВКА (RENDER) ---

    render: function() {
        const container = document.getElementById('app-content');
        const globalProgress = this.calculateGlobalProgress();
        
        // Определение цвета полоски
        let progressColor = '#FF3B30'; // Красный
        if (globalProgress > 25) progressColor = '#FF9500'; // Оранжевый
        if (globalProgress > 50) progressColor = '#FFCC00'; // Желтый
        if (globalProgress > 75) progressColor = '#34C759'; // Зеленый

        // Вставка CSS стилей (только для этой страницы)
        const styles = `
            <style>
                .goals-header { text-align: center; margin-bottom: 20px; }
                .goals-year-input { 
                    font-size: 32px; font-weight: 800; border: none; background: transparent; 
                    text-align: center; width: 100px; color: #000;
                }
                
                /* Глобальный прогресс */
                .goals-global-bar-container {
                    background: #e5e5ea; height: 20px; border-radius: 10px; 
                    overflow: hidden; margin-bottom: 5px; position: relative;
                }
                .goals-global-bar-fill {
                    height: 100%; transition: width 0.5s ease, background-color 0.5s ease;
                }
                .goals-global-text { text-align: right; font-size: 12px; font-weight: bold; color: #666; }

                /* Карточка цели/задачи */
                .goals-item {
                    background: #fff; border-radius: 12px; padding: 15px; margin-bottom: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05); position: relative;
                }
                .goals-type-tag {
                    font-size: 10px; text-transform: uppercase; font-weight: bold; 
                    padding: 2px 6px; border-radius: 4px; color: #fff; display: inline-block; margin-bottom: 5px;
                }
                .tag-goal { background: #007AFF; }   /* Синий */
                .tag-task { background: #AF52DE; }   /* Фиолетовый */
                .tag-step { background: #FF9500; }   /* Оранжевый */

                .goals-title { font-size: 17px; font-weight: 600; margin-bottom: 5px; }
                .goals-desc { font-size: 13px; color: #666; white-space: pre-wrap; margin-bottom: 10px; }
                
                /* Кнопки действий */
                .goals-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
                .goals-btn { border: none; background: #f2f2f7; border-radius: 8px; padding: 5px 10px; font-size: 12px; color: #007AFF; }
                .goals-btn-del { color: #FF3B30; }

                /* Чекбокс для выполнения */
                .goals-checkbox {
                    width: 24px; height: 24px; border-radius: 50%; border: 2px solid #ccc;
                    display: flex; align-items: center; justify-content: center; cursor: pointer;
                }
                .goals-checkbox.checked { background: #34C759; border-color: #34C759; color: white; }

                /* Вложенность */
                .goals-children { border-left: 2px solid #e5e5ea; margin-left: 10px; padding-left: 10px; margin-top: 10px; }

                /* Главная кнопка добавления */
                .goals-fab {
                    display: block; width: 100%; padding: 15px; background: #007AFF; color: white;
                    text-align: center; border-radius: 14px; font-weight: bold; font-size: 16px; margin-top: 20px;
                }
            </style>
        `;

        let html = styles;

        // 1. Заголовок с годом
        html += `
            <div class="goals-header">
                <input type="number" class="goals-year-input" value="${this.data.year}" onchange="GoalsModule.updateYear(this.value)">
                <div class="goals-global-bar-container">
                    <div class="goals-global-bar-fill" style="width: ${globalProgress}%; background-color: ${progressColor};"></div>
                </div>
                <div class="goals-global-text">Выполнено: ${globalProgress}%</div>
            </div>
            
            <div id="goals-list-root">
                </div>

            <div class="goals-fab" onclick="GoalsModule.addItem(null)">+ Добавить новую Цель</div>
        `;

        container.innerHTML = html;
        this.renderItems(this.data.items, document.getElementById('goals-list-root'));
    },

    // Рекурсивная отрисовка списка
    renderItems: function(items, containerElement, parentId = null) {
        if (!items || items.length === 0) return;

        items.forEach((item, index) => {
            const itemProgress = this.calculateItemProgress(item);
            const isStep = item.type === 'step';
            
            const div = document.createElement('div');
            div.className = 'goals-item';
            
            // Если выполнено, делаем полупрозрачным
            if (itemProgress === 100 && !isStep) div.style.opacity = '0.6';

            let typeLabel = '';
            let tagClass = '';
            if (item.type === 'goal') { typeLabel = 'Цель'; tagClass = 'tag-goal'; }
            else if (item.type === 'task') { typeLabel = 'Задача'; tagClass = 'tag-task'; }
            else { typeLabel = 'Шаг'; tagClass = 'tag-step'; }

            // HTML карточки
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <span class="goals-type-tag ${tagClass}">${typeLabel}</span>
                    ${!isStep ? `<span style="font-size:10px; color:#888;">${itemProgress}%</span>` : ''}
                </div>
                
                <div style="display:flex; align-items:flex-start; gap:10px;">
                    <div class="goals-checkbox ${item.completed ? 'checked' : ''}" onclick="GoalsModule.toggleComplete('${item.id}')">
                        ${item.completed ? '✓' : ''}
                    </div>
                    <div style="flex:1;">
                        <div class="goals-title" style="${item.completed ? 'text-decoration:line-through; color:#aaa;' : ''}">${item.title}</div>
                        ${item.description ? `<div class="goals-desc">${item.description.replace(/\n/g, '<br>')}</div>` : ''}
                    </div>
                </div>

                ${!isStep ? `
                    <div style="height:4px; background:#f2f2f7; border-radius:2px; margin-top:8px; overflow:hidden;">
                         <div style="height:100%; width:${itemProgress}%; background:${tagClass === 'tag-goal' ? '#007AFF' : '#AF52DE'}"></div>
                    </div>
                ` : ''}

                <div class="goals-actions">
                    <button class="goals-btn" onclick="GoalsModule.addItem('${item.id}')">+ Вложить</button>
                    <button class="goals-btn" onclick="GoalsModule.editItem('${item.id}')">✎ Изм.</button>
                    <button class="goals-btn goals-btn-del" onclick="GoalsModule.deleteItem('${item.id}')">🗑</button>
                </div>

                <div class="goals-children" id="children-${item.id}"></div>
            `;

            containerElement.appendChild(div);

            // Рекурсия: если есть дети, рисуем их внутри
            if (item.children && item.children.length > 0) {
                this.renderItems(item.children, div.querySelector(`#children-${item.id}`), item.id);
            }
        });
    },

    // --- ДЕЙСТВИЯ (CRUD) ---

    updateYear: function(val) {
        this.data.year = val;
        this.saveData();
    },

    addItem: function(parentId) {
        // Простое меню выбора (в будущем можно сделать красивый Modal)
        const typeMap = {'1': 'goal', '2': 'task', '3': 'step'};
        let typeChoice = prompt("Что добавить?\n1 - Цель\n2 - Задачу\n3 - Шаг", "2");
        if (!typeMap[typeChoice]) return;

        const title = prompt("Название:");
        if (!title) return;
        
        const desc = prompt("Описание (можно оставить пустым):", "");

        const newItem = {
            id: Date.now().toString(), // Уникальный ID
            type: typeMap[typeChoice],
            title: title,
            description: desc,
            completed: false,
            children: []
        };

        if (parentId === null) {
            // Добавляем в корень
            this.data.items.push(newItem);
        } else {
            // Ищем родителя рекурсивно и добавляем ему
            const parent = this.findItemById(this.data.items, parentId);
            if (parent) parent.children.push(newItem);
        }

        this.saveData();
        this.render();
    },

    deleteItem: function(id) {
        if(!confirm('Удалить этот пункт и все вложения?')) return;
        
        // Функция удаления из дерева
        const deleteFromTree = (list, id) => {
            const idx = list.findIndex(i => i.id === id);
            if (idx > -1) {
                list.splice(idx, 1);
                return true;
            }
            for (let item of list) {
                if (deleteFromTree(item.children, id)) return true;
            }
            return false;
        };

        deleteFromTree(this.data.items, id);
        this.saveData();
        this.render();
    },

    toggleComplete: function(id) {
        const item = this.findItemById(this.data.items, id);
        if (item) {
            item.completed = !item.completed;
            // Если это задача/цель, то галочка может (или не может) влиять на детей.
            // Пока сделаем простую логику: галочка влияет только на сам элемент,
            // но прогресс считается от детей. 
            // Если это "Шаг", то он просто выполнен.
        }
        this.saveData();
        this.render();
    },

    editItem: function(id) {
        const item = this.findItemById(this.data.items, id);
        if(!item) return;

        const newTitle = prompt("Новое название:", item.title);
        if(newTitle) item.title = newTitle;

        const newDesc = prompt("Новое описание:", item.description);
        if(newDesc !== null) item.description = newDesc;

        this.saveData();
        this.render();
    },

    // Вспомогательная функция поиска
    findItemById: function(list, id) {
        for (let item of list) {
            if (item.id === id) return item;
            const found = this.findItemById(item.children, id);
            if (found) return found;
        }
        return null;
    }
};
