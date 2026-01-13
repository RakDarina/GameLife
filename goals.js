/* ==========================================
   СТРАНИЦА: ЦЕЛИ (goals.js)
   Версия: Folder System (Бесконечная вложенность)
   ========================================== */

const GoalsPage = {
    // Состояние страницы
    state: {
        currentPath: [], // Хлебные крошки: [] = Главная, ['id1', 'id2'] = внутри папок
        data: [] // Все данные (дерево)
    },

    // --- ИНИЦИАЛИЗАЦИЯ ---
    init: async function() {
        this.loadData();
        this.render();
    },

    // Сохранение в LocalStorage
    saveData: function() {
        localStorage.setItem('GL_Goals_Tree', JSON.stringify(this.state.data));
    },

    loadData: function() {
        const saved = localStorage.getItem('GL_Goals_Tree');
        if (saved) {
            this.state.data = JSON.parse(saved);
        } else {
            this.state.data = []; // Пустой старт
        }
    },

    // --- ЛОГИКА ПРОГРЕССА (РЕКУРСИЯ) ---
    // Считает процент выполнения для любого элемента и его детей
    calculateProgress: function(item) {
        // Если у элемента нет детей (это конечный шаг)
        if (!item.children || item.children.length === 0) {
            return item.completed ? 100 : 0;
        }

        // Если есть дети, считаем среднее арифметическое их прогресса
        let total = 0;
        item.children.forEach(child => {
            total += this.calculateProgress(child);
        });
        
        return Math.round(total / item.children.length);
    },

    // Получить цвет в зависимости от процента
    getProgressColor: function(percent) {
        if (percent < 30) return '#FF3B30'; // Красный
        if (percent < 60) return '#FF9500'; // Оранжевый
        if (percent < 90) return '#FFCC00'; // Желтый
        return '#34C759'; // Зеленый
    },

    // Найти текущий список элементов (в зависимости от того, в какой мы папке)
    getCurrentList: function() {
        let list = this.state.data;
        // Проходим по пути (currentPath), чтобы найти нужный массив детей
        for (let id of this.state.currentPath) {
            const found = list.find(i => i.id === id);
            if (found) {
                list = found.children;
            } else {
                return []; // Ошибка пути
            }
        }
        return list;
    },

    // Найти заголовок текущей папки
    getCurrentTitle: function() {
        if (this.state.currentPath.length === 0) return null; // Мы на главной
        
        // Ищем название последней открытой папки
        let list = this.state.data;
        let title = "";
        for (let id of this.state.currentPath) {
            const found = list.find(i => i.id === id);
            if (found) {
                title = found.title;
                list = found.children; // идем глубже
            }
        }
        return title;
    },

    // --- НАВИГАЦИЯ ---
    enterFolder: function(id) {
        this.state.currentPath.push(id);
        this.render();
    },

    goBack: function() {
        this.state.currentPath.pop();
        this.render();
    },

    // --- ДЕЙСТВИЯ ---
    addItem: function() {
        const input = document.getElementById('gl-goals-input');
        const text = input.value.trim();
        if (!text) return;

        const newItem = {
            id: Date.now().toString(),
            title: text,
            completed: false,
            children: [] // Массив для вложенных задач
        };

        const list = this.getCurrentList();
        list.push(newItem);
        
        this.saveData();
        input.value = '';
        input.style.height = '40px'; // Сброс высоты
        this.render();
    },

    toggleComplete: function(id) {
        const list = this.getCurrentList();
        const item = list.find(i => i.id === id);
        if (item) {
            item.completed = !item.completed;
            this.saveData();
            this.render();
        }
    },

    deleteItem: function(id) {
        if(!confirm('Удалить? Это удалит и все вложенные задачи.')) return;
        
        const list = this.getCurrentList();
        const index = list.findIndex(i => i.id === id);
        if (index > -1) {
            list.splice(index, 1);
            this.saveData();
            this.render();
        }
    },

    editItem: function(id) {
        const list = this.getCurrentList();
        const item = list.find(i => i.id === id);
        if (item) {
            const newText = prompt("Редактировать:", item.title);
            if (newText !== null) {
                item.title = newText;
                this.saveData();
                this.render();
            }
        }
    },

    // --- ОТРИСОВКА (RENDER) ---
    render: function() {
        const app = document.getElementById('app-viewport');
        const list = this.getCurrentList();
        const isRoot = this.state.currentPath.length === 0;
        const currentTitle = this.getCurrentTitle();

        // 1. Считаем общий прогресс текущей страницы
        let totalProgress = 0;
        if (list.length > 0) {
            let sum = 0;
            list.forEach(item => sum += this.calculateProgress(item));
            totalProgress = Math.round(sum / list.length);
        }
        const mainColor = this.getProgressColor(totalProgress);

        // 2. Стили CSS
        const styles = `
            <style>
                .gl-goals-container { padding-bottom: 80px; }
                
                /* Шапка уровня */
                .gl-level-header { margin-bottom: 20px; }
                .gl-back-btn { 
                    color: #007AFF; font-size: 16px; display: flex; align-items: center; 
                    margin-bottom: 10px; cursor: pointer; font-weight: 500;
                }
                .gl-big-title { font-size: 34px; font-weight: 800; line-height: 1.1; margin-bottom: 10px; }
                .gl-main-progress-bg { height: 8px; background: #E5E5EA; border-radius: 4px; overflow: hidden; }
                .gl-main-progress-fill { height: 100%; transition: 0.4s; }
                .gl-progress-text { text-align: right; color: #8E8E93; font-size: 13px; margin-top: 5px; font-weight: 600; }

                /* Карточка задачи */
                .gl-card {
                    background: #fff; border-radius: 16px; padding: 16px; margin-bottom: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03); display: flex; flex-direction: column; gap: 10px;
                }
                
                .gl-card-top { display: flex; align-items: flex-start; gap: 12px; }
                
                .gl-checkbox {
                    min-width: 24px; height: 24px; border-radius: 50%; border: 2px solid #C7C7CC;
                    display: flex; align-items: center; justify-content: center; cursor: pointer; margin-top: 2px;
                }
                .gl-checkbox.checked { background: #34C759; border-color: #34C759; color: white; }

                .gl-content-area { flex: 1; cursor: pointer; } /* Нажатие сюда проваливает в папку */
                .gl-item-title { font-size: 17px; font-weight: 500; line-height: 1.4; white-space: pre-wrap; }
                .gl-item-title.done { text-decoration: line-through; color: #AEAEB2; }

                /* Полоска прогресса внутри карточки */
                .gl-mini-progress-track {
                    height: 4px; background: #F2F2F7; border-radius: 2px; margin-top: 8px; overflow: hidden; width: 100%;
                }
                .gl-mini-progress-fill { height: 100%; border-radius: 2px; }
                .gl-mini-percent { font-size: 11px; color: #8E8E93; font-weight: 600; margin-top: 4px; text-align: right; }

                /* Кнопки управления */
                .gl-actions { display: flex; gap: 15px; margin-left: auto; }
                .gl-icon-btn { color: #C7C7CC; font-size: 18px; cursor: pointer; }

                /* Поле ввода снизу */
                .gl-input-bar {
                    position: fixed; bottom: 90px; left: 0; width: 100%;
                    background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);
                    border-top: 1px solid #E5E5EA; padding: 10px 15px; box-sizing: border-box;
                    display: flex; gap: 10px; align-items: flex-end; z-index: 500;
                }
                .gl-textarea {
                    flex: 1; background: #F2F2F7; border: none; border-radius: 18px;
                    padding: 10px 15px; font-size: 16px; font-family: inherit;
                    resize: none; min-height: 24px; max-height: 120px; outline: none;
                }
                .gl-send-btn {
                    width: 36px; height: 36px; background: #007AFF; border-radius: 50%;
                    color: white; display: flex; align-items: center; justify-content: center;
                    font-size: 20px; font-weight: bold; flex-shrink: 0; cursor: pointer; margin-bottom: 2px;
                }
            </style>
        `;

        // 3. Формируем HTML списка
        let listHTML = '';
        if (list.length === 0) {
            listHTML = `<div style="text-align:center; color:#aeaeb2; margin-top:40px;">Список пуст.<br>Добавьте первую запись снизу 👇</div>`;
        } else {
            list.forEach(item => {
                const progress = this.calculateProgress(item);
                const color = this.getProgressColor(progress);
                
                listHTML += `
                <div class="gl-card">
                    <div class="gl-card-top">
                        <div class="gl-checkbox ${item.completed ? 'checked' : ''}" 
                             onclick="GoalsPage.toggleComplete('${item.id}')">
                             ${item.completed ? '✓' : ''}
                        </div>

                        <div class="gl-content-area" onclick="GoalsPage.enterFolder('${item.id}')">
                            <div class="gl-item-title ${item.completed ? 'done' : ''}">${item.title}</div>
                            
                            <div class="gl-mini-progress-track">
                                <div class="gl-mini-progress-fill" style="width: ${progress}%; background: ${color}"></div>
                            </div>
                            <div class="gl-mini-percent">${progress}%</div>
                        </div>

                        <div class="gl-actions">
                            <div class="gl-icon-btn" onclick="GoalsPage.editItem('${item.id}')">✎</div>
                            <div class="gl-icon-btn" style="color:#FF3B30" onclick="GoalsPage.deleteItem('${item.id}')">✕</div>
                        </div>
                    </div>
                </div>
                `;
            });
        }

        // 4. Сборка всей страницы
        app.innerHTML = `
            ${styles}
            <div class="gl-goals-container">
                
                <div class="gl-level-header">
                    ${!isRoot ? `<div class="gl-back-btn" onclick="GoalsPage.goBack()">‹ Назад</div>` : ''}
                    
                    <div class="gl-big-title">
                        ${isRoot ? 'Цели 2026' : currentTitle}
                    </div>

                    <div class="gl-main-progress-bg">
                        <div class="gl-main-progress-fill" style="width: ${totalProgress}%; background: ${mainColor}"></div>
                    </div>
                    <div class="gl-progress-text">Общий прогресс: ${totalProgress}%</div>
                </div>

                <div class="gl-list">
                    ${listHTML}
                </div>

            </div>

            <div class="gl-input-bar">
                <textarea id="gl-goals-input" class="gl-textarea" placeholder="Новая цель или задача..." rows="1"
                    oninput="this.style.height = ''; this.style.height = Math.min(this.scrollHeight, 120) + 'px'"></textarea>
                <div class="gl-send-btn" onclick="GoalsPage.addItem()">↑</div>
            </div>
        `;
    }
};

// В самом низу твоего файла goals.js замени старый экспорт на этот:
export function render() {
    GoalsPage.init();
}

// Сделай GoalsPage глобальным, чтобы onclick в HTML (который генерирует скрипт) работал
window.GoalsPage = GoalsPage;
