/* ==========================================
   МОДУЛЬ: ЧЕК-ЛИСТЫ (ХАБ)
   ========================================== */

const Checklists = {
    view: 'hub', // 'hub', 'daily', 'cleaning', 'self-care', 'other'

    init() {
        this.render();
    },

    render() {
        const app = document.getElementById('app-viewport');
        const styles = `
            <style>
                .ch-container { animation: fadeIn 0.3s; padding: 10px 15px 120px; }
                .ch-header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
                .ch-title { font-size: 24px; font-weight: 800; color: #1C1C1E; flex: 1; text-align: center; margin-right: 40px; }
                
                /* Стили кнопок-категорий */
                .ch-menu-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
                .ch-btn { 
                    background: white; border-radius: 24px; padding: 24px; 
                    display: flex; align-items: center; gap: 20px; 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05); cursor: pointer;
                    transition: transform 0.1s;
                }
                .ch-btn:active { transform: scale(0.97); }
                .ch-icon { width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; color: white; }
                .ch-info { display: flex; flex-direction: column; }
                .ch-btn-title { font-size: 19px; font-weight: 800; color: #1C1C1E; }
                .ch-btn-desc { font-size: 13px; color: #8E8E93; font-weight: 500; margin-top: 2px; }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        if (this.view === 'hub') {
            app.innerHTML = styles + `
                <div class="ch-container">
                    <div class="ch-header">
                        <span class="material-icons-outlined" style="color:#007AFF; cursor:pointer; font-size:28px;" onclick="loadModule('./lists.js')">chevron_left</span>
                        <div class="ch-title">Чек-листы</div>
                    </div>
                    
                    <div class="ch-menu-grid">
                        <div class="ch-btn" onclick="Checklists.view = 'daily'; Checklists.render();">
                            <div class="ch-icon" style="background: linear-gradient(135deg, #FF9500, #FFCC00); shadow: 0 4px 12px rgba(255,149,0,0.3);">
                                <span class="material-icons" style="font-size: 32px;">calendar_today</span>
                            </div>
                            <div class="ch-info">
                                <span class="ch-btn-title">Ежедневник</span>
                                <span class="ch-btn-desc">Планы на день и задачи</span>
                            </div>
                        </div>

                        <div class="ch-btn" onclick="Checklists.view = 'cleaning'; Checklists.render();">
                            <div class="ch-icon" style="background: linear-gradient(135deg, #5AC8FA, #007AFF);">
                                <span class="material-icons" style="font-size: 32px;">cleaning_services</span>
                            </div>
                            <div class="ch-info">
                                <span class="ch-btn-title">Уборка</span>
                                <span class="ch-btn-desc">Чистота и уют в доме</span>
                            </div>
                        </div>

                        <div class="ch-btn" onclick="Checklists.view = 'self-care'; Checklists.render();">
                            <div class="ch-icon" style="background: linear-gradient(135deg, #FF2D55, #FF375F);">
                                <span class="material-icons" style="font-size: 32px;">self_improvement</span>
                            </div>
                            <div class="ch-info">
                                <span class="ch-btn-title">Уход за собой</span>
                                <span class="ch-btn-desc">Красота и здоровье</span>
                            </div>
                        </div>

                        <div class="ch-btn" onclick="Checklists.view = 'other'; Checklists.render();">
                            <div class="ch-icon" style="background: linear-gradient(135deg, #AF52DE, #BF5AF2);">
                                <span class="material-icons" style="font-size: 32px;">auto_awesome</span>
                            </div>
                            <div class="ch-info">
                                <span class="ch-btn-title">Разное</span>
                                <span class="ch-btn-desc">Другие списки дел</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Заглушка для подразделов (будем наполнять по очереди)
            this.renderSubPage(app);
        }
    },

    renderSubPage(app) {
        const titles = {
            daily: 'Ежедневник',
            cleaning: 'Уборка',
            'self-care': 'Уход за собой',
            other: 'Разное'
        };
        app.innerHTML = `
            <div style="padding: 20px; text-align: center; animation: fadeIn 0.3s;">
                <div style="display: flex; align-items: center; margin-bottom: 30px;">
                    <span class="material-icons" onclick="Checklists.view='hub'; Checklists.render();" style="color:#007AFF; cursor:pointer;">chevron_left</span>
                    <h2 style="flex:1; margin:0; font-size: 22px;">${titles[this.view]}</h2>
                </div>
                <div style="margin-top: 100px;">
                    <span class="material-icons" style="font-size: 64px; color: #E5E5EA;">construction</span>
                    <p style="color: #8E8E93; margin-top: 20px;">Этот раздел мы опишем следующим...</p>
                </div>
            </div>
        `;
    }
};

window.Checklists = Checklists;
export function render() { Checklists.init(); }
