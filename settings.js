/* ==========================================
   МОДУЛЬ: НАСТРОЙКИ + BACKUP (settings.js)
   ========================================== */

const Settings = {
    profile: JSON.parse(localStorage.getItem('GL_UserProfile')) || {
        name: "Пользователь",
        status: "Верю в себя и свои силы"
    },

    init() { this.render(); },

    saveProfile() {
        localStorage.setItem('GL_UserProfile', JSON.stringify(this.profile));
        this.render();
    },

    // --- ЛОГИКА РЕЗЕРВНОГО КОПИРОВАНИЯ ---
    
    exportData() {
        // Собираем вообще всё, что есть в localStorage
        const allData = JSON.stringify(localStorage);
        
        // Копируем в буфер обмена
        navigator.clipboard.writeText(allData).then(() => {
            alert("Все данные скопированы в буфер обмена! Сохраните этот код в надежном месте.");
        }).catch(err => {
            console.error('Ошибка при копировании:', err);
            alert("Не удалось скопировать автоматически. Данные выведены в консоль.");
        });
    },

    importData() {
        const json = prompt("Вставьте код резервной копии здесь:");
        if (!json) return;

        try {
            const data = JSON.parse(json);
            // Очищаем старое и записываем новое
            localStorage.clear();
            Object.keys(data).forEach(key => {
                localStorage.setItem(key, data[key]);
            });
            alert("Данные успешно импортированы! Страница будет перезагружена.");
            location.reload();
        } catch (e) {
            alert("Ошибка: Неверный формат кода. Убедитесь, что вы скопировали код полностью.");
        }
    },

    clearAllData() {
        if (confirm("Вы уверены? Это удалит всё безвозвратно!")) {
            localStorage.clear();
            location.reload();
        }
    },

    render() {
        const app = document.getElementById('app-viewport');
        const styles = `
            <style>
                .st-container { padding: 15px 15px 120px; animation: fadeIn 0.3s; font-family: sans-serif; }
                .st-header { display: flex; align-items: center; margin-bottom: 25px; }
                .st-back { color: #8E8E93; cursor: pointer; font-size: 32px; }
                .st-title { flex: 1; text-align: center; font-size: 24px; font-weight: 800; margin-right: 32px; }

                .st-card { background: white; border-radius: 22px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px; }
                .st-section-title { font-size: 13px; font-weight: 700; color: #8E8E93; text-transform: uppercase; margin: 0 0 10px 10px; }
                
                .st-btn-blue { background: #007AFF; color: white; border-radius: 14px; padding: 14px; text-align: center; font-weight: 700; margin-bottom: 10px; cursor: pointer; }
                .st-btn-outline { border: 2px solid #007AFF; color: #007AFF; border-radius: 14px; padding: 12px; text-align: center; font-weight: 700; cursor: pointer; }
                
                .st-danger { color: #FF3B30; font-weight: 700; text-align: center; padding: 10px; cursor: pointer; margin-top: 10px; }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;

        app.innerHTML = styles + `
            <div class="st-container">
                <div class="st-header">
                    <span class="material-icons st-back" onclick="loadModule('./lists.js')">chevron_left</span>
                    <div class="st-title">Настройки</div>
                </div>

                <div class="st-section-title">Резервное копирование</div>
                <div class="st-card">
                    <p style="font-size: 14px; color: #3A3A3C; margin-bottom: 15px;">
                        Экспорт создаст текстовый код всех ваших данных. Импорт сотрет текущие данные и заменит их на данные из кода.
                    </p>
                    <div class="st-btn-blue" onclick="Settings.exportData()">Копировать всё (Экспорт)</div>
                    <div class="st-btn-outline" onclick="Settings.importData()">Импортировать данные</div>
                </div>

                <div class="st-section-title">Аккаунт</div>
                <div class="st-card">
                    <div style="font-size: 14px; color: #8E8E93; margin-bottom: 5px;">Ваше имя:</div>
                    <input type="text" value="${this.profile.name}" 
                        style="width:100%; font-size:18px; font-weight:700; border:none; outline:none;"
                        onchange="Settings.profile.name = this.value; Settings.saveProfile()">
                </div>

                <div class="st-danger" onclick="Settings.clearAllData()">Удалить все данные приложения</div>
            </div>
        `;
    }
};

window.Settings = Settings;
export function render() { Settings.init(); }
