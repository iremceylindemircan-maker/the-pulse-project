/**
 * DESIGN: Ayarlanabilir parametreler ve kural ayarları
 * (Adjustable colors, sizes, timings, thresholds and rule settings)
 */
const DESIGN = {
    chargeRate: 1.2,       // Tuşa basıldığında dolum hızı (Load increase speed per frame)
    decayRate: 1.8,        // Tuş bırakıldığında düşüş hızı (Decay speed when released)
    thresholdWarning: 70,  // Uyarı/titreşimin başladığı eşik (Threshold where feedback intensifies)
    maxLimit: 100,         // Aşırı yüklenme sınırı (Overload limit)
    baseColor: "#1f2229",  // Başlangıç arka plan rengi
    warningColor: "#f29900",// Uyarı rengi (Sarı/Turuncu)
    dangerColor: "#d93025"  // Tehlike / Aşırı yüklenme rengi (Kırmızı)
};

/**
 * STATE: Sistem durumu değişkenleri
 */
let state = {
    loadLevel: 0,          // Mevcut yük durumu (0 - 100)
    isHolding: false,      // Kullanıcı tuşa basıyor mu?
    isOverloaded: false,   // Sistem patladı/kilitlendi mi?
    numericMode: false     // Karşılaştırma modu (Sayısal gösterge aktif mi?)
};

/**
 * INPUT: Girdi dinleyicileri (Mouse, Touch, Keyboard)
 */
const targetElement = document.getElementById('pulse-target');
const feedbackText = document.getElementById('feedback-text');
const numericDisplay = document.getElementById('numeric-display');
const loadValueSpan = document.getElementById('load-value');
const modeToggle = document.getElementById('mode-toggle');
const resetBtn = document.getElementById('reset-btn');

// Basma eylemini başlat (Press start)
function startHolding(e) {
    if (e.type === 'keydown' && e.code !== 'Space') return;
    e.preventDefault();
    if (!state.isOverloaded) {
        state.isHolding = true;
    }
}

// Basma eylemini bitir (Press end / Release)
function stopHolding(e) {
    if (e.type === 'keyup' && e.code !== 'Space') return;
    state.isHolding = false;
}

// Event Listeners (Fare, Dokunmatik ve Klavye alternatifleri)
targetElement.addEventListener('mousedown', startHolding);
window.addEventListener('mouseup', stopHolding);

targetElement.addEventListener('touchstart', (e) => { startHolding(e); });
window.addEventListener('touchend', stopHolding);

window.addEventListener('keydown', startHolding);
window.addEventListener('keyup', stopHolding);

// Mod değiştirme ve Sıfırlama
modeToggle.addEventListener('change', (e) => {
    state.numericMode = e.target.checked;
    numericDisplay.classList.toggle('hidden', !state.numericMode);
});

resetBtn.addEventListener('click', resetSystem);

function resetSystem() {
    state.loadLevel = 0;
    state.isHolding = false;
    state.isOverloaded = false;
    targetElement.classList.remove('shaking');
    feedbackText.textContent = "HOLD";
    targetElement.style.borderColor = "#3c4043";
    targetElement.style.backgroundColor = DESIGN.baseColor;
}

/**
 * RULE: Tasarım kuralları ve durum güncelleyici (Game Loop / State Engine)
 */
function updateRule() {
    if (state.isOverloaded) return;

    if (state.isHolding) {
        // Tuş basılıysa yükü artır
        state.loadLevel += DESIGN.chargeRate;
        if (state.loadLevel >= DESIGN.maxLimit) {
            state.loadLevel = DESIGN.maxLimit;
            state.isOverloaded = true;
        }
    } else {
        // Tuş bırakıldıysa yükü azalt
        state.loadLevel -= DESIGN.decayRate;
        if (state.loadLevel < 0) {
            state.loadLevel = 0;
        }
    }

    updateOutput();
}

/**
 * OUTPUT: Durum geri bildirimlerinin arayüze yansıtılması (Rendering / Feedback Loop)
 */
function updateOutput() {
    // Sayısal mod aktifse değeri yazdır
    if (state.numericMode) {
        loadValueSpan.textContent = Math.round(state.loadLevel);
    }

    // Aşırı yüklenme durumu (Overload feedback)
    if (state.isOverloaded) {
        feedbackText.textContent = "OVERLOAD!";
        targetElement.style.backgroundColor = DESIGN.dangerColor;
        targetElement.style.borderColor = "#ffffff";
        targetElement.classList.add('shaking');
        return;
    }

    // Normal dolum ve uyarı eşiği geri bildirimi (Sensory Threshold Feedback)
    if (state.loadLevel >= DESIGN.thresholdWarning) {
        // Eşiğe yaklaşıldı: Renk turuncuya döner, titreme başlar
        feedbackText.textContent = "HOLD...";
        targetElement.style.backgroundColor = DESIGN.warningColor;
        targetElement.style.borderColor = "#ffffff";
        targetElement.classList.add('shaking');
    } else if (state.loadLevel > 0) {
        // Güvenli dolum bölgesi
        feedbackText.textContent = "CHARGING";
        targetElement.style.backgroundColor = DESIGN.baseColor;
        targetElement.style.borderColor = "#8ab4f8";
        targetElement.classList.remove('shaking');
    } else {
        // Boş / Sıfır durumu
        feedbackText.textContent = "HOLD";
        targetElement.style.backgroundColor = DESIGN.baseColor;
        targetElement.style.borderColor = "#3c4043";
        targetElement.classList.remove('shaking');
    }

    // Dinamik boyutlandırma (Scale feedback based on load)
    const scaleFactor = 1 + (state.loadLevel / 300);
    targetElement.style.transform = `scale(${scaleFactor})`;
}

// Her karede kuralı çalıştır (Animation Loop ~60fps)
function loop() {
    updateRule();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
