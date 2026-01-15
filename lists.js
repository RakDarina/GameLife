export function render() {
    const app = document.getElementById('app-viewport');
    app.innerHTML = `
        <style>
            .ls-hub-container { animation: fadeIn 0.3s; padding: 10px 15px 120px; }
            .ls-hub-header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
            .ls-hub-title { font-size: 24px; font-weight: 800; color: #1C1C1E; flex: 1; text-align: center; margin-right: 40px; }
            .ls-hub-btn { 
                background: white; border-radius: 24px; padding: 20px; margin-bottom: 16px;
                display: flex; align-items: center; gap: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); cursor: pointer;
            }
            .ls-hub-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; }
            .ls-hub-text { font-size: 18px; font-weight: 700; color: #1C1C1E; }
        </style>
        <div class="ls-hub-container">
            <div class="ls-hub-header">
                <span class="material-icons-outlined" style="color:#007AFF; cursor:pointer; font-size:28px;" onclick="loadModule('./main.js')">chevron_left</span>
                <div class="ls-hub-title">Списки</div>
            </div>
            
            <div class="ls-hub-btn" onclick="loadModule('./simple-lists.js')">
                <div class="ls-hub-icon" style="background: #5856D6;"><span class="material-icons">list</span></div>
                <div class="ls-hub-text">Списки</div>
            </div>

            <div class="ls-hub-btn" onclick="loadModule('./checklists.js')">
                <div class="ls-hub-icon" style="background: #34C759;"><span class="material-icons">checklist</span></div>
                <div class="ls-hub-text">Чек-листы</div>
            </div>
        </div>
    `;
}
