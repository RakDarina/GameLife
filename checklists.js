export function render() {
    const app = document.getElementById('app-viewport');
    app.innerHTML = `
        <div style="padding:20px; text-align:center;">
            <span class="material-icons" onclick="loadModule('./lists.js')" style="color:#007AFF; cursor:pointer; float:left;">chevron_left</span>
            <h2 style="margin-top:50px;">Чек-листы</h2>
            <p style="color:#8E8E93;">Этот раздел будет в отдельном файле</p>
        </div>
    `;
}
