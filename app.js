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
        await videoElement.play(); // Ensure video is playing

        // Show camera UI
        cameraPreview.classList.remove('hidden');
        takePictureBtn.classList.remove('hidden');
        startCameraBtn.textContent = '🔄 Switch Camera';
        photoPreview.classList.add('hidden');

    } catch (error) {
        console.error('Camera error:', error);
        alert('Kamera erişimi sağlanamadı. Lütfen kamera izinlerini kontrol edin.');
    }
}

function takePicture() {
    try {
        // Create canvas and capture image
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        canvas.getContext('2d').drawImage(videoElement, 0, 0);

        // Show captured photo
        photoPreview.src = canvas.toDataURL('image/jpeg');
        photoPreview.classList.remove('hidden');
        
        // Stop camera stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        // Reset UI
        cameraPreview.classList.add('hidden');
        takePictureBtn.classList.add('hidden');
        startCameraBtn.textContent = '📸 Start Camera';
        startCameraBtn.classList.remove('hidden');
    } catch (error) {
        console.error('Error taking picture:', error);
        alert('Fotoğraf çekilirken bir hata oluştu.');
    }
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

// Load and display notes
function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const notesList = document.getElementById('notesList');
    const template = document.getElementById('noteTemplate');
    
    notesList.innerHTML = '';
    
    notes.forEach((note, index) => {
        const noteElement = template.content.cloneNode(true);
        
        noteElement.querySelector('.note-title').textContent = note.title;
        noteElement.querySelector('.note-content').textContent = note.content;
        
        const photoElement = noteElement.querySelector('.note-photo');
        if (note.photo) {
            photoElement.src = note.photo;
            photoElement.classList.remove('hidden');
        }
        
        const locationElement = noteElement.querySelector('.note-location');
        if (note.location) {
            locationElement.textContent = `📍 ${note.location}`;
            locationElement.classList.remove('hidden');
        }
        
        // Add delete functionality
        const deleteBtn = noteElement.querySelector('.delete-note');
        deleteBtn.addEventListener('click', () => deleteNote(index));
        
        notesList.appendChild(noteElement);
    });
}

// Delete note
function deleteNote(index) {
    if (confirm('Bu notu silmek istediğinizden emin misiniz?')) {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();
    }
}

// Note Form Submission
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    const photo = photoPreview.classList.contains('hidden') ? null : photoPreview.src;
    
    let location = null;
    try {
        const position = await getCurrentLocation();
        location = `${position.coords.latitude}, ${position.coords.longitude}`;
    } catch (error) {
        console.log('Location not available');
    }
    
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    notes.push({ title, content, photo, location, timestamp: new Date().toISOString() });
    localStorage.setItem('notes', JSON.stringify(notes));
    
    // Reset form
    noteForm.reset();
    photoPreview.classList.add('hidden');
    photoPreview.src = '';
    
    // Switch to notes view and reload notes
    showView('notesView');
    loadNotes();
});

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
    loadNotes();
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
