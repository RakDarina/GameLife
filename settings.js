/* ==========================================
   МОДУЛЬ: НАСТРОЙКИ (settings.js)
   ========================================== */

const Settings = {
    // Данные профиля
    profile: JSON.parse(localStorage.getItem('GL_UserProfile')) || {
        name: "Пользователь",
        status: "Верю в себя и свои силы"
    },

    init() {
        this.render();
    },

    saveProfile() {
        localStorage.setItem('GL_UserProfile', JSON.stringify(this.profile));
        this.render();
    },

    // Считаем общую статистику из всех модулей
    getStats() {
        const clean = JSON.parse(localStorage.getItem('GL_Clean_State')) || { doneIds: [] };
        const self = JSON.parse(localStorage.getItem('GL_Self_State')) || { doneIds: [] };
        const daily = JSON.parse(localStorage.getItem('GL_Daily_Tasks')) || []; // Если есть такой ключ
        
        return {
            cleanCount: clean.doneIds.length,
            selfCount: self.doneIds.length,
            total: clean.doneIds.length + self.selfCount // + другие если есть
        };
    },

    clearAllData() {
        if (confirm("Вы уверены? Все ваши списки, задачи и прогресс будут удалены навсегда!")) {
            localStorage.clear();
            location.reload(); // Перезагрузка приложения
        }
    },

    render() {
        const app = document.getElementById('app-viewport');
        const stats = this.getStats();

        const styles = `
            <style>
                .st-container { padding: 15px 15px 120px; animation: fadeIn 0.3s; }
                .st-header { display: flex; align-items: center; margin-bottom: 30px; }
                .st-back { color: #8E8E93; cursor: pointer; font-size: 32px; }
                .st-title { flex: 1; text-align: center; font-size: 24px; font-weight: 800; margin-right: 32px; }

                .st-profile-card { background: white; border-radius: 24px; padding: 20px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 25px; }
                .st-avatar { width: 80px; height: 80px; background: #E5E5EA; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 30px; }
                .st-name { font-size: 20px; font-weight: 800; margin-bottom: 5px; border: none; text-align: center; width: 100%; outline: none; }
                .st-status { font-size: 14px; color: #8E8E93; border: none; text-align: center; width: 100%; outline: none; }

                .st-section-title { font-size: 13px; font-weight: 700; color: #8E8E93; text-transform: uppercase; margin: 0 0 10px 10px; }
                .st-menu { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 25px; }
                .st-menu-item { display: flex; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #F2F2F7; }
                .st-menu-item:last-child { border: none; }
                .st-label { font-size: 16px; font-weight: 500; }
                .st-value { color: #007AFF; font-weight: 700; }

                .st-danger-btn { color: #FF3B30; font-weight: 700; text-align: center; padding: 16px; cursor: pointer; background: white; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        app.innerHTML = styles + `
            <div class="st-container">
                <div class="st-header">
                    <span class="material-icons st-back" onclick="loadModule('./lists.js')">chevron_left</span>
                    <div class="st-title">Настройки</div>
                </div>

                <div class="st-profile-card">
                    <div class="st-avatar">👤</div>
                    <input type="text" class="st-name" value="${this.profile.name}" onchange="Settings.profile.name = this.value; Settings.saveProfile()">
                    <input type="text" class="st-status" value="${this.profile.status}" onchange="Settings.profile.status = this.value; Settings.saveProfile()">
                </div>

                <div class="st-section-title">Статистика</div>
                <div class="st-menu">
                    <div class="st-menu-item">
                        <span class="st-label">Уборка (выполнено)</span>
                        <span class="st-value">${stats.cleanCount}</span>
                    </div>
                    <div class="st-menu-item">
                        <span class="st-label">Уход (выполнено)</span>
                        <span class="st-value">${stats.selfCount}</span>
                    </div>
                </div>

                <div class="st-section-title">Система</div>
                <div class="st-danger-btn" onclick="Settings.clearAllData()">Очистить все данные</div>
            </div>
        `;
    }
};

window.Settings = Settings;
export function render() { Settings.init(); }
