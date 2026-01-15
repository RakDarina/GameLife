/* ==========================================
   МОДУЛЬ: УБОРКА (cleaning.js)
   ========================================== */

const Cleaning = {
    init() {
        this.render();
    },

    render() {
        const app = document.getElementById('app-viewport');
        app.innerHTML = `
            <div style="padding: 20px; animation: fadeIn 0.3s;">
                <div style="display: flex; align-items: center; margin-bottom: 30px;">
                    <span class="material-icons" onclick="loadModule('./checklists.js')" style="color:#007AFF; cursor:pointer; font-size:32px;">chevron_left</span>
                    <h2 style="flex:1; text-align:center; margin-right:32px; font-size: 24px; font-weight: 800;">Уборка</h2>
                </div>
                
                <div style="margin-top: 100px; text-align: center;">
                    <span class="material-icons" style="font-size: 80px; color: #E5E5EA;">cleaning_services</span>
                    <p style="color: #8E8E93; margin-top: 20px; font-size: 17px;">
                        Здесь будет интерактивная комната и списки задач.
                    </p>
                </div>
            </div>
            
            <style>
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;
    }
};

window.Cleaning = Cleaning;
export function render() { Cleaning.init(); }
