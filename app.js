// App State
let deferredPrompt;
let isOnline = navigator.onLine;

// DOM Elements
const notesView = document.getElementById('notesView');
const addNoteView = document.getElementById('addNoteView');
const settingsView = document.getElementById('settingsView');
const notesList = document.getElementById('notesList');
const noteForm = document.getElementById('noteForm');
const startCameraBtn = document.getElementById('startCameraBtn');
const takePictureBtn = document.getElementById('takePictureBtn');
const videoElement = document.getElementById('videoElement');
const cameraPreview = document.getElementById('cameraPreview');
const photoPreview = document.getElementById('photoPreview');
const installBtn = document.getElementById('installBtn');
const offlineMessage = document.getElementById('offlineMessage');
let stream = null;

// Navigation
document.querySelectorAll('nav button').forEach(button => {
    button.addEventListener('click', () => {
        const viewId = button.id.replace('Btn', 'View');
        showView(viewId);
    });
});

function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
    
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`button[id="${viewId.replace('View', 'Btn')}"]`).classList.add('active');
}

// Camera functionality
async function startCamera() {
    try {
        // Get camera stream
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        // Show video preview
        videoElement.srcObject = stream;
        cameraPreview.classList.remove('hidden');
        takePictureBtn.classList.remove('hidden');
        startCameraBtn.classList.add('hidden');
        photoPreview.classList.add('hidden');

    } catch (error) {
        console.error('Camera error:', error);
        alert('Kamera erişimi sağlanamadı. Lütfen kamera izinlerini kontrol edin.');
    }
}

function takePicture() {
    // Create canvas and capture image
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext('2d').drawImage(videoElement, 0, 0);

    // Stop camera stream
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }

    // Show captured photo
    photoPreview.src = canvas.toDataURL('image/jpeg');
    photoPreview.classList.remove('hidden');
    cameraPreview.classList.add('hidden');
    takePictureBtn.classList.add('hidden');
    startCameraBtn.classList.remove('hidden');
}

startCameraBtn.addEventListener('click', startCamera);
takePictureBtn.addEventListener('click', takePicture);

// Geolocation
async function getCurrentLocation() {
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
    } catch (error) {
        console.error('Error getting location:', error);
        return null;
    }
}

// Note Form Submission
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    const photo = photoPreview.src;
    const location = await getCurrentLocation();
    
    const note = {
        id: Date.now(),
        title,
        content,
        photo,
        location,
        timestamp: new Date().toISOString()
    };
    
    // Save note to localStorage
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    notes.push(note);
    localStorage.setItem('notes', JSON.stringify(notes));
    
    // Reset form
    noteForm.reset();
    photoPreview.src = '';
    photoPreview.classList.add('hidden');
    
    // Show notes view
    showView('notesView');
    displayNotes();
});

// Display Notes
function displayNotes() {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    notesList.innerHTML = notes.map(note => `
        <div class="note-card">
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            ${note.photo ? `<img src="${note.photo}" alt="Note photo" style="max-width: 100%;">` : ''}
            ${note.location ? `<p> Location: ${note.location.latitude.toFixed(4)}, ${note.location.longitude.toFixed(4)}</p>` : ''}
            <p><small>${new Date(note.timestamp).toLocaleString()}</small></p>
        </div>
    `).join('');
}

// Install PWA
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        installBtn.classList.add('hidden');
    }
    deferredPrompt = null;
});

// Online/Offline Status
window.addEventListener('online', () => {
    isOnline = true;
    offlineMessage.classList.add('hidden');
});

window.addEventListener('offline', () => {
    isOnline = false;
    offlineMessage.classList.remove('hidden');
});

// Theme Selection
const themeSelect = document.getElementById('themeSelect');
themeSelect.addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.target.value);
    localStorage.setItem('theme', e.target.value);
});

// Initialize
function init() {
    displayNotes();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        themeSelect.value = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    if (!isOnline) {
        offlineMessage.classList.remove('hidden');
    }
}

init();
