/* ==========================================
   МОДУЛЬ: СПИСКИ И ЧЕК-ЛИСТЫ (lists.js)
   ========================================== */

const ListsModule = {
    currentView: 'hub', // 'hub', 'simple-lists', 'checklists'
    
    // Данные для обычных списков
    simpleListData: JSON.parse(localStorage.getItem('GL_Simple_Lists')) || [],
    // Данные для чек-листов
    checklistsData: JSON.parse(localStorage.getItem('GL_Checklists')) || [],

    init: function() {
        this.render();
    },

    // Сохранение данных
    save: function() {
        localStorage.setItem('GL_Simple_Lists', JSON.stringify(this.simpleListData));
        localStorage.setItem('GL_Checklists', JSON.stringify(this.checklistsData));
        this.render();
    },

    render: function() {
        const app = document.getElementById('app-viewport');
        
        const styles = `
            <style>
                .ls-hub-wrap { animation: fadeIn 0.3s; padding-top: 10px; }
                
                /* Шапка */
                .ls-hub-header { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; }
                .ls-hub-back { color: #007AFF; cursor: pointer; font-size: 28px; }
                .ls-hub-title { font-size: 24px; font-weight: 800; color: #1C1C1E; flex: 1; text-align: center; margin-right: 40px; }

                /* Кнопки выбора на главной */
                .ls-hub-menu { display: grid; grid-template-columns: 1fr; gap: 15px; }
                .ls-hub-btn { 
                    background: white; border-radius: 22px; padding: 25px; 
                    display: flex; align-items: center; gap: 20px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05); cursor: pointer; transition: 0.2s;
                }
                .ls-hub-btn:active { transform: scale(0.97); background: #F2F2F7; }
                .ls-hub-icon { 
                    width: 50px; height: 50px; border-radius: 15px; 
                    display: flex; align-items: center; justify-content: center; color: white;
                }
                .ls-hub-btn-text { font-size: 18px; font-weight: 700; color: #1C1C1E; }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        if (this.currentView === 'hub') {
            app.innerHTML = styles + `
                <div class="ls-hub-wrap">
                    <div class="ls-hub-header">
                        <span class="material-icons-outlined ls-hub-back" onclick="loadModule('./main.js')">chevron_left</span>
                        <div class="ls-hub-title">Списки</div>
                    </div>

                    <div class="ls-hub-menu">
                        <div class="ls-hub-btn" onclick="ListsModule.currentView = 'simple-lists'; ListsModule.render()">
                            <div class="ls-hub-icon" style="background: #5856D6;">
                                <span class="material-icons">format_list_bulleted</span>
                            </div>
                            <div class="ls-hub-btn-text">Списки</div>
                        </div>

                        <div class="ls-hub-btn" onclick="ListsModule.currentView = 'checklists'; ListsModule.render()">
                            <div class="ls-hub-icon" style="background: #34C759;">
                                <span class="material-icons">checklist</span>
                            </div>
                            <div class="ls-hub-btn-text">Чек-листы</div>
                        </div>
                    </div>
                </div>
            `;
        } else if (this.currentView === 'simple-lists') {
            this.renderSimpleLists(app, styles);
        } else if (this.currentView === 'checklists') {
            this.renderChecklists(app, styles);
        }
    },

    /* --- ПОД-МОДУЛЬ: ОБЫЧНЫЕ СПИСКИ --- */
    renderSimpleLists: function(app, baseStyles) {
        app.innerHTML = baseStyles + `
            <div class="ls-hub-wrap">
                <div class="ls-hub-header">
                    <span class="material-icons-outlined ls-hub-back" onclick="ListsModule.currentView = 'hub'; ListsModule.render()">chevron_left</span>
                    <div class="ls-hub-title">Списки</div>
                </div>
                <div style="text-align:center; color:#8E8E93; margin-top:50px;">
                    <span class="material-icons" style="font-size:48px; opacity:0.5;">construction</span>
                    <p>Раздел "Списки" в разработке</p>
                </div>
            </div>
        `;
    },

    /* --- ПОД-МОДУЛЬ: ЧЕК-ЛИСТЫ --- */
    renderChecklists: function(app, baseStyles) {
        app.innerHTML = baseStyles + `
            <div class="ls-hub-wrap">
                <div class="ls-hub-header">
                    <span class="material-icons-outlined ls-hub-back" onclick="ListsModule.currentView = 'hub'; ListsModule.render()">chevron_left</span>
                    <div class="ls-hub-title">Чек-листы</div>
                </div>
                <div style="text-align:center; color:#8E8E93; margin-top:50px;">
                    <span class="material-icons" style="font-size:48px; opacity:0.5;">construction</span>
                    <p>Раздел "Чек-листы" в разработке</p>
                </div>
            </div>
        `;
    }
};

window.ListsModule = ListsModule;
export function render() { ListsModule.init(); }
