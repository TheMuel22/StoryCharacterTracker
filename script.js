// App State
let currentChapter = null;
let chapters = [];
let characters = [];
let places = [];
let mapData = null;
let mapImage = null;
let currentCharacter = null;
let darkMode = localStorage.getItem('darkMode') === 'true';
let connected = false;
let serverUrl = '';
let isLoggedIn = false;

// Password for app access
const APP_PASSWORD = 'Linsey123';

// DOM Elements
const elements = {
    loginScreen: document.getElementById('loginScreen'),
    mainApp: document.getElementById('mainApp'),
    passwordInput: document.getElementById('passwordInput'),
    loginBtn: document.getElementById('loginBtn'),
    loginError: document.getElementById('loginError'),
    logoutBtn: document.getElementById('logoutBtn'),
    chaptersList: document.getElementById('chaptersList'),
    chapterContent: document.getElementById('chapterContent'),
    currentChapterTitle: document.getElementById('currentChapterTitle'),
    wordCount: document.getElementById('wordCount'),
    charactersList: document.getElementById('charactersList'),
    addChapterBtn: document.getElementById('addChapter'),
    saveChapterBtn: document.getElementById('saveChapter'),
    spellCheckBtn: document.getElementById('spellCheckBtn'),
    thesaurusBtn: document.getElementById('thesaurusBtn'),
    connectTrackerBtn: document.getElementById('connectTracker'),
    refreshDataBtn: document.getElementById('refreshData'),
    toggleViewBtn: document.getElementById('toggleView'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    connectionStatus: document.getElementById('connectionStatus'),
    spellCheckModal: document.getElementById('spellCheckModal'),
    thesaurusModal: document.getElementById('thesaurusModal'),
    characterDetailModal: document.getElementById('characterDetailModal'),
    spellCheckResults: document.getElementById('spellCheckResults'),
    thesaurusInput: document.getElementById('thesaurusInput'),
    thesaurusResults: document.getElementById('thesaurusResults'),
    characterSearch: document.getElementById('characterSearch'),
    mapCanvas: document.getElementById('mapCanvas'),
    placesList: document.getElementById('placesList')
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    setupLoginListeners();
    checkLoginStatus();
});

function setupLoginListeners() {
    // Login functionality
    elements.loginBtn.addEventListener('click', attemptLogin);
    elements.passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            attemptLogin();
        }
    });
    
    // Logout functionality
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', logout);
    }
}

function checkLoginStatus() {
    // Check if user was previously logged in (optional - remove if you want login every time)
    const wasLoggedIn = localStorage.getItem('storyWriterLoggedIn') === 'true';
    
    if (wasLoggedIn) {
        showMainApp();
    } else {
        showLoginScreen();
    }
}

function attemptLogin() {
    const password = elements.passwordInput.value;
    
    if (password === APP_PASSWORD) {
        isLoggedIn = true;
        localStorage.setItem('storyWriterLoggedIn', 'true');
        showMainApp();
    } else {
        showLoginError('Incorrect password. Please try again.');
        elements.passwordInput.value = '';
        elements.passwordInput.focus();
    }
}

function logout() {
    isLoggedIn = false;
    localStorage.removeItem('storyWriterLoggedIn');
    elements.passwordInput.value = '';
    showLoginScreen();
}

function showLoginScreen() {
    elements.loginScreen.style.display = 'flex';
    elements.mainApp.style.display = 'none';
    elements.passwordInput.focus();
    hideLoginError();
}

function showMainApp() {
    elements.loginScreen.style.display = 'none';
    elements.mainApp.style.display = 'block';
    initializeApp();
    loadChapters();
    setupEventListeners();
}

function showLoginError(message) {
    elements.loginError.textContent = message;
    elements.loginError.classList.add('show');
}

function hideLoginError() {
    elements.loginError.classList.remove('show');
}

function initializeApp() {
    // Set dark mode
    if (darkMode) {
        document.body.setAttribute('data-theme', 'dark');
        elements.darkModeToggle.textContent = '☀️';
    }
    
    // Update word count
    updateWordCount();
}

function setupEventListeners() {
    // Chapter management
    elements.addChapterBtn.addEventListener('click', createNewChapter);
    elements.saveChapterBtn.addEventListener('click', saveCurrentChapter);
    elements.chapterContent.addEventListener('input', updateWordCount);
    elements.chapterContent.addEventListener('input', debounce(autoSave, 2000));
    
    // Tools
    elements.spellCheckBtn.addEventListener('click', runSpellCheck);
    elements.thesaurusBtn.addEventListener('click', () => showModal('thesaurus'));
    elements.connectTrackerBtn.addEventListener('click', connectCharacterTracker);
    elements.refreshDataBtn.addEventListener('click', refreshAllData);
    elements.toggleViewBtn.addEventListener('click', toggleMapView);
    elements.darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // New sync functionality
    const syncBtn = document.getElementById('syncTracker');
    const testLocalBtn = document.getElementById('testLocal');
    const testNetworkBtn = document.getElementById('testNetwork');
    
    if (syncBtn) {
        syncBtn.addEventListener('click', syncWithCharacterTracker);
    }
    if (testLocalBtn) {
        testLocalBtn.addEventListener('click', () => testConnection('http://localhost:8000'));
    }
    if (testNetworkBtn) {
        testNetworkBtn.addEventListener('click', () => testConnection('http://192.168.4.111:8000'));
    }
    
    // Search
    elements.characterSearch.addEventListener('input', debounce(searchCharacters, 300));
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Character detail tabs
    document.querySelectorAll('.char-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.getAttribute('data-char-tab');
            switchCharacterTab(tabName);
        });
    });
    
    // Modal management
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            hideModals();
        }
        if (e.target.classList.contains('modal-close')) {
            hideModals();
        }
    });
    
    // Character detail modal actions
    document.getElementById('insertCharacterRef').addEventListener('click', () => {
        if (currentCharacter) {
            insertCharacterReference(currentCharacter.name);
            hideModals();
        }
    });
    
    document.getElementById('showCharacterOnMap').addEventListener('click', () => {
        if (currentCharacter) {
            showCharacterOnMap(currentCharacter);
            hideModals();
        }
    });
    
    // Thesaurus
    elements.thesaurusInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchThesaurus();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideModals();
        }
    });
    
    // Map controls
    document.getElementById('mapZoomIn').addEventListener('click', () => zoomMap(1.2));
    document.getElementById('mapZoomOut').addEventListener('click', () => zoomMap(0.8));
    document.getElementById('mapReset').addEventListener('click', resetMap);
}

// Chapter Management
function createNewChapter() {
    const title = prompt('Enter chapter title:');
    if (!title) return;
    
    const chapter = {
        id: Date.now(),
        title: title,
        content: '',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        wordCount: 0
    };
    
    chapters.push(chapter);
    saveChapters();
    renderChapters();
    selectChapter(chapter);
}

function selectChapter(chapter) {
    currentChapter = chapter;
    elements.chapterContent.value = chapter.content;
    elements.currentChapterTitle.textContent = `✏️ ${chapter.title}`;
    updateWordCount();
    
    // Update active chapter in list
    document.querySelectorAll('.chapter-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-chapter-id="${chapter.id}"]`)?.classList.add('active');
}

function saveCurrentChapter() {
    if (!currentChapter) return;
    
    currentChapter.content = elements.chapterContent.value;
    currentChapter.modified = new Date().toISOString();
    currentChapter.wordCount = countWords(currentChapter.content);
    
    saveChapters();
    renderChapters();
    
    // Show save confirmation
    const originalText = elements.saveChapterBtn.textContent;
    elements.saveChapterBtn.textContent = '✅ Saved';
    elements.saveChapterBtn.style.background = '#059669';
    
    setTimeout(() => {
        elements.saveChapterBtn.textContent = originalText;
        elements.saveChapterBtn.style.background = '';
    }, 2000);
}

function autoSave() {
    if (currentChapter) {
        saveCurrentChapter();
    }
}

function renderChapters() {
    elements.chaptersList.innerHTML = '';
    
    if (chapters.length === 0) {
        elements.chaptersList.innerHTML = '<p class="placeholder">No chapters yet. Create your first chapter!</p>';
        return;
    }
    
    chapters.forEach(chapter => {
        const chapterElement = document.createElement('div');
        chapterElement.className = 'chapter-item';
        chapterElement.setAttribute('data-chapter-id', chapter.id);
        
        const date = new Date(chapter.modified).toLocaleDateString();
        
        chapterElement.innerHTML = `
            <div class="chapter-title">${chapter.title}</div>
            <div class="chapter-meta">${chapter.wordCount || 0} words • ${date}</div>
        `;
        
        chapterElement.addEventListener('click', () => selectChapter(chapter));
        elements.chaptersList.appendChild(chapterElement);
    });
}

// Writing Tools
function runSpellCheck() {
    const text = elements.chapterContent.value;
    if (!text.trim()) {
        alert('Please write some text first!');
        return;
    }
    
    // Simple browser-based spell check
    const words = text.match(/\b\w+\b/g) || [];
    const misspelled = [];
    
    // Create a temporary element to use browser's spell check
    const tempElement = document.createElement('div');
    tempElement.contentEditable = true;
    tempElement.style.position = 'absolute';
    tempElement.style.left = '-9999px';
    document.body.appendChild(tempElement);
    
    words.forEach(word => {
        tempElement.textContent = word;
        // This is a simplified approach - real spell checking would need a more robust solution
        if (tempElement.textContent !== word.toLowerCase()) {
            misspelled.push(word);
        }
    });
    
    document.body.removeChild(tempElement);
    
    // Show results
    if (misspelled.length === 0) {
        elements.spellCheckResults.innerHTML = '<p style="color: var(--success-color);">✅ No spelling errors found!</p>';
    } else {
        elements.spellCheckResults.innerHTML = `
            <p style="color: var(--warning-color);">⚠️ Potential spelling issues found:</p>
            <div style="margin-top: 1rem;">
                ${misspelled.map(word => `<span class="synonym">${word}</span>`).join(' ')}
            </div>
            <p style="margin-top: 1rem; font-size: 0.875rem; color: var(--text-muted);">
                Note: This is a basic spell check. Consider using your browser's built-in spell checker for better accuracy.
            </p>
        `;
    }
    
    showModal('spellCheck');
}

function searchThesaurus() {
    const word = elements.thesaurusInput.value.trim();
    if (!word) return;
    
    elements.thesaurusResults.innerHTML = '<p>Searching...</p>';
    
    // Use Datamuse API for thesaurus
    fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}`)
        .then(response => response.json())
        .then(data => {
            displayThesaurusResults(word, data);
        })
        .catch(error => {
            elements.thesaurusResults.innerHTML = '<p style="color: var(--danger-color);">Error searching for synonyms. Please try again.</p>';
            console.error('Thesaurus error:', error);
        });
}

function displayThesaurusResults(word, synonyms) {
    if (synonyms.length === 0) {
        elements.thesaurusResults.innerHTML = '<p>No synonyms found for this word.</p>';
        return;
    }
    
    const html = `
        <div class="synonym-group">
            <h4>Synonyms for "${word}"</h4>
            <div class="synonyms">
                ${synonyms.slice(0, 20).map(syn => 
                    `<span class="synonym" onclick="insertSynonym('${syn.word}')">${syn.word}</span>`
                ).join('')}
            </div>
        </div>
    `;
    
    elements.thesaurusResults.innerHTML = html;
}

function insertSynonym(word) {
    const textarea = elements.chapterContent;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    textarea.value = text.substring(0, start) + word + text.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start, start + word.length);
    
    updateWordCount();
    hideModals();
}

// Character Tracker Integration
function connectCharacterTracker() {
    const url = prompt('Enter Character Tracker server URL:', 'http://192.168.4.111:8000');
    if (!url) return;
    
    testConnection(url);
}

function syncWithCharacterTracker() {
    const serverUrlInput = document.getElementById('serverUrl');
    const url = serverUrlInput.value.trim();
    
    if (!url) {
        alert('Please enter a server URL');
        return;
    }
    
    testConnection(url);
}

function testConnection(url) {
    serverUrl = url;
    updateConnectionStatus('Connecting...');
    
    // Test connection with /api/characters endpoint (which exists in our API)
    fetch(`${serverUrl}/api/characters`)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(`Server responded with status: ${response.status}`);
        })
        .then(data => {
            connected = true;
            updateConnectionStatus(`Connected - ${data.length} characters found`);
            loadAllData();
            
            // Update URL input field
            const serverUrlInput = document.getElementById('serverUrl');
            if (serverUrlInput) {
                serverUrlInput.value = url;
            }
            
            // Show success message
            showMessage(`✅ Successfully connected to Character Tracker!\nFound ${data.length} characters and syncing data...`);
        })
        .catch(error => {
            connected = false;
            updateConnectionStatus('Connection failed');
            console.error('Connection error:', error);
            
            let errorMessage = 'Could not connect to Character Tracker.\n\n';
            errorMessage += `URL tried: ${url}\n\n`;
            errorMessage += 'Please check:\n';
            errorMessage += '1. Character Tracker application is running\n';
            errorMessage += '2. API server shows green status in app\n';
            errorMessage += '3. URL is correct (usually http://192.168.4.111:8000)\n';
            errorMessage += '4. No firewall blocking the connection\n\n';
            errorMessage += `Error: ${error.message}`;
            
            alert(errorMessage);
        });
}

function showMessage(message) {
    // Simple message display - you can enhance this with a proper notification system
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 10000;
        max-width: 300px;
        white-space: pre-line;
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

function updateConnectionStatus(message) {
    const indicator = elements.connectionStatus.querySelector('.status-indicator');
    const text = elements.connectionStatus.querySelector('.status-text');
    
    text.textContent = message;
    
    if (connected) {
        indicator.classList.remove('offline');
        indicator.classList.add('online');
    } else {
        indicator.classList.remove('online');
        indicator.classList.add('offline');
    }
}

function loadAllData() {
    if (!connected || !serverUrl) return;
    
    updateConnectionStatus('Loading data...');
    
    Promise.all([
        loadCharacters(),
        loadMapData(),
        loadPlaces(),
        loadStoryChapters()
    ]).then(() => {
        renderCharacters();
        renderPlaces();
        renderMap();
        renderChapters(); // Render any story chapters we loaded
        updateConnectionStatus(`Connected - ${characters.length} characters loaded`);
    }).catch(error => {
        console.error('Error loading data:', error);
        updateConnectionStatus('Connected - some data failed to load');
        alert('Error loading some data from Character Tracker');
    });
}

function loadStoryChapters() {
    // Try to load story data from Character Tracker if available
    return fetch(`${serverUrl}/api/story`)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('No story data available');
        })
        .then(data => {
            // If we get story data, convert it to our chapter format
            if (data && data.chapters) {
                data.chapters.forEach(chapterData => {
                    const existingChapter = chapters.find(c => c.title === chapterData.title);
                    if (!existingChapter) {
                        chapters.push({
                            id: Date.now() + Math.random(),
                            title: chapterData.title || 'Untitled Chapter',
                            content: chapterData.content || '',
                            created: chapterData.created || new Date().toISOString(),
                            modified: chapterData.modified || new Date().toISOString(),
                            wordCount: countWords(chapterData.content || '')
                        });
                    }
                });
                saveChapters(); // Save to local storage
            }
        })
        .catch(() => {
            // Story loading failed, that's okay - not all Character Trackers will have story data
            console.log('No story data available from Character Tracker');
        });
}

function loadCharacters() {
    return fetch(`${serverUrl}/api/characters`)
        .then(response => response.json())
        .then(data => {
            characters = [];
            // Convert the character data properly
            Object.keys(data).forEach(charId => {
                const char = data[charId];
                const firstName = char.basic_info?.first_name || '';
                const lastName = char.basic_info?.last_name || '';
                const fullName = `${firstName} ${lastName}`.trim();
                
                if (fullName) { // Only add characters with names
                    characters.push({
                        id: charId,
                        name: fullName,
                        firstName: firstName,
                        lastName: lastName,
                        title: char.basic_info?.title || '',
                        age: char.basic_info?.age || '',
                        gender: char.physical?.gender || '',
                        location: char.basic_info?.home || '',
                        currentLocation: char.basic_info?.current_location || '',
                        region: char.basic_info?.region || '',
                        photo: char.photo_path || '',
                        personality: char.personality || '',
                        skills: char.skills || '',
                        backstory: char.backstory || '',
                        goals: char.goals || '',
                        fears: char.fears || '',
                        notes: char.notes || '',
                        physical: char.physical || {},
                        deceased: char.deceased || false,
                        basicInfo: char.basic_info || {},
                        created: char.created_date || '',
                        modified: char.last_modified || ''
                    });
                }
            });
            
            console.log(`Loaded ${characters.length} characters:`, characters);
        });
}

function loadMapData() {
    return fetch(`${serverUrl}/api/map`)
        .then(response => response.json())
        .then(data => {
            console.log('Map data received:', data);
            mapData = data;
            
            // Load map image if available
            if (data.map_image_path) {
                mapImage = new Image();
                mapImage.crossOrigin = 'anonymous';
                mapImage.onload = function() {
                    console.log('Map image loaded successfully');
                    renderMap();
                };
                mapImage.onerror = function() {
                    console.log('Map image failed to load, using placeholder');
                    mapImage = null;
                };
                // Try to load the image from the server
                mapImage.src = `${serverUrl}/api/map/image?t=${Date.now()}`;
            }
        })
        .catch(error => {
            console.log('Map data not available:', error);
            mapData = null;
            mapImage = null;
        });
}

function loadPlaces() {
    return fetch(`${serverUrl}/api/places`)
        .then(response => response.json())
        .then(data => {
            console.log('Places data received:', data);
            places = [];
            
            // Extract places from the data structure
            if (Array.isArray(data)) {
                places = data;
            } else if (data && typeof data === 'object') {
                // If it's an object, try to extract place names from various sources
                const placeSet = new Set();
                
                // Add places from characters' locations
                characters.forEach(char => {
                    if (char.location) placeSet.add(char.location);
                    if (char.currentLocation) placeSet.add(char.currentLocation);
                    if (char.region) placeSet.add(char.region);
                });
                
                // Add places from map pins if available
                if (mapData && mapData.map_pins) {
                    mapData.map_pins.forEach(pin => {
                        if (pin.type === 'Place' && pin.label) {
                            placeSet.add(pin.label);
                        }
                    });
                }
                
                // Convert to place objects
                places = Array.from(placeSet).map(placeName => ({
                    name: placeName,
                    type: 'Location',
                    description: `Location: ${placeName}`
                }));
            }
            
            console.log(`Loaded ${places.length} places:`, places);
        })
        .catch(error => {
            console.log('Places data not available:', error);
            places = [];
        });
}

function refreshAllData() {
    if (!connected) {
        alert('Not connected to Character Tracker');
        return;
    }
    
    updateConnectionStatus('Refreshing...');
    loadAllData().then(() => {
        updateConnectionStatus('Connected');
    });
}

function renderCharacters() {
    const searchTerm = elements.characterSearch.value.toLowerCase();
    const filteredCharacters = characters.filter(char => 
        char.name.toLowerCase().includes(searchTerm) ||
        (char.title && char.title.toLowerCase().includes(searchTerm)) ||
        (char.location && char.location.toLowerCase().includes(searchTerm)) ||
        (char.currentLocation && char.currentLocation.toLowerCase().includes(searchTerm))
    );
    
    if (filteredCharacters.length === 0) {
        elements.charactersList.innerHTML = '<p class="placeholder">No characters found</p>';
        return;
    }
    
    elements.charactersList.innerHTML = '';
    filteredCharacters.forEach(character => {
        const characterElement = document.createElement('div');
        characterElement.className = 'character-item';
        
        // Create avatar - either photo or initials
        let avatar = '';
        if (character.photo && character.photo.trim()) {
            // Try to load photo from server
            avatar = `<img src="${serverUrl}/api/character/photo/${character.id}" alt="${character.name}" onerror="this.style.display='none'; this.nextSibling.style.display='block';">
                     <div class="character-initials" style="display: none;">${character.name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>`;
        } else {
            // Use initials
            avatar = `<div class="character-initials">${character.name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>`;
        }
        
        // Build character details
        const details = [];
        if (character.title) details.push(`<span class="character-tag title">${character.title}</span>`);
        if (character.age) details.push(`<span class="character-tag age">${character.age} years</span>`);
        if (character.gender) details.push(`<span class="character-tag gender">${character.gender}</span>`);
        if (character.currentLocation) details.push(`<span class="character-tag location">📍 ${character.currentLocation}</span>`);
        else if (character.location) details.push(`<span class="character-tag location">🏠 ${character.location}</span>`);
        if (character.region) details.push(`<span class="character-tag region">🗺️ ${character.region}</span>`);
        if (character.deceased) details.push('<span class="character-tag deceased">💀 Deceased</span>');
        
        characterElement.innerHTML = `
            <div class="character-avatar">
                ${avatar}
            </div>
            <div class="character-info">
                <div class="character-name">${character.name}</div>
                <div class="character-details">
                    ${details.join(' ')}
                </div>
                <div class="character-preview">
                    ${character.personality ? character.personality.substring(0, 100) + '...' : 'No description available'}
                </div>
            </div>
        `;
        
        characterElement.addEventListener('click', () => showCharacterDetails(character));
        elements.charactersList.appendChild(characterElement);
    });
}

function renderPlaces() {
    if (places.length === 0) {
        elements.placesList.innerHTML = '<p class="placeholder">No places found</p>';
        return;
    }
    
    elements.placesList.innerHTML = '';
    places.forEach(place => {
        const placeElement = document.createElement('div');
        placeElement.className = 'place-item';
        placeElement.innerHTML = `
            <div>
                <div class="place-name">${place.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${place.description || ''}</div>
            </div>
            <div class="place-type">${place.type || 'Location'}</div>
        `;
        
        placeElement.addEventListener('click', () => {
            insertTextAtCursor(place.name);
            switchTab('characters'); // Switch back to writing
        });
        
        elements.placesList.appendChild(placeElement);
    });
}

function renderMap() {
    const canvas = elements.mapCanvas;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    if (!mapData) {
        document.querySelector('.map-placeholder').style.display = 'flex';
        return;
    }
    
    document.querySelector('.map-placeholder').style.display = 'none';
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw map image if available
    if (mapImage && mapImage.complete) {
        ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
    } else {
        // Draw placeholder background
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#6b7280';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Map Loading...', canvas.width / 2, canvas.height / 2);
    }
    
    // Draw pins if available
    if (mapData.map_pins && mapData.map_pins.length > 0) {
        mapData.map_pins.forEach(pin => {
            // Calculate pin position (scale to canvas size)
            const x = (pin.map_x || pin.x || 0) * canvas.width / (mapData.original_width || 1000);
            const y = (pin.map_y || pin.y || 0) * canvas.height / (mapData.original_height || 1000);
            
            // Draw pin based on type
            ctx.save();
            if (pin.type === 'Place') {
                // Draw red square for places
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(x - 5, y - 5, 10, 10);
            } else {
                // Draw blue circle for characters
                ctx.fillStyle = '#3b82f6';
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fill();
            }
            
            // Draw label
            if (pin.label) {
                ctx.fillStyle = '#000000';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(pin.label, x, y - 10);
            }
            ctx.restore();
        });
    }
    
    // Draw character pins if available
    if (mapData.character_pins && Object.keys(mapData.character_pins).length > 0) {
        Object.entries(mapData.character_pins).forEach(([charName, pinData]) => {
            const x = (pinData.map_x || pinData.x || 0) * canvas.width / (mapData.original_width || 1000);
            const y = (pinData.map_y || pinData.y || 0) * canvas.height / (mapData.original_height || 1000);
            
            // Draw character pin (circle)
            ctx.save();
            ctx.fillStyle = '#8b5cf6';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw character name
            ctx.fillStyle = '#000000';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(charName, x, y - 12);
            ctx.restore();
        });
    }
}

function showCharacterDetails(character) {
    currentCharacter = character;
    
    // Update modal content
    document.getElementById('characterDetailName').textContent = character.name;
    document.getElementById('characterFullName').textContent = character.name;
    document.getElementById('characterTitle').textContent = character.title || 'No title';
    document.getElementById('characterLocation').textContent = `${character.location || 'Unknown'} • ${character.region || 'Unknown region'}`;
    
    // Set photo
    const photoElement = document.getElementById('characterPhoto');
    if (character.photo) {
        photoElement.src = `${serverUrl}/api/character/photo/${character.id}`;
        photoElement.style.display = 'block';
    } else {
        photoElement.style.display = 'none';
    }
    
    // Fill tab contents
    fillCharacterTabContent('basic', character);
    fillCharacterTabContent('physical', character);
    fillCharacterTabContent('personality', character);
    fillCharacterTabContent('background', character);
    
    showModal('characterDetail');
}

function fillCharacterTabContent(tabName, character) {
    const tabElement = document.getElementById(`${tabName}Tab`);
    
    switch(tabName) {
        case 'basic':
            tabElement.innerHTML = `
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Full Name</div>
                        <div class="info-value">${character.name}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Title</div>
                        <div class="info-value">${character.title || 'None'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Age</div>
                        <div class="info-value">${character.age || 'Unknown'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Gender</div>
                        <div class="info-value">${character.gender || 'Not specified'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Home</div>
                        <div class="info-value">${character.location || 'Unknown'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Current Location</div>
                        <div class="info-value">${character.currentLocation || 'Unknown'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Region</div>
                        <div class="info-value">${character.region || 'Unknown'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Status</div>
                        <div class="info-value">${character.deceased ? 'Deceased' : 'Alive'}</div>
                    </div>
                </div>
            `;
            break;
            
        case 'physical':
            const physical = character.physical || {};
            tabElement.innerHTML = `
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Height</div>
                        <div class="info-value">${physical.height || 'Not specified'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Weight</div>
                        <div class="info-value">${physical.weight || 'Not specified'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Hair Color</div>
                        <div class="info-value">${physical.hair_color || 'Not specified'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Eye Color</div>
                        <div class="info-value">${physical.eye_color || 'Not specified'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Build</div>
                        <div class="info-value">${physical.build || 'Not specified'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Complexion</div>
                        <div class="info-value">${physical.complexion || 'Not specified'}</div>
                    </div>
                </div>
            `;
            break;
            
        case 'personality':
            tabElement.innerHTML = `
                ${character.personality ? `<div class="text-content">${character.personality}</div>` : '<p>No personality information available.</p>'}
                ${character.skills ? `
                    <div class="info-item">
                        <div class="info-label">Skills & Abilities</div>
                        <div class="text-content">${character.skills}</div>
                    </div>
                ` : ''}
            `;
            break;
            
        case 'background':
            tabElement.innerHTML = `
                ${character.backstory ? `
                    <div class="info-item">
                        <div class="info-label">Backstory</div>
                        <div class="text-content">${character.backstory}</div>
                    </div>
                ` : ''}
                ${character.goals ? `
                    <div class="info-item">
                        <div class="info-label">Goals & Motivations</div>
                        <div class="text-content">${character.goals}</div>
                    </div>
                ` : ''}
                ${character.fears ? `
                    <div class="info-item">
                        <div class="info-label">Fears & Weaknesses</div>
                        <div class="text-content">${character.fears}</div>
                    </div>
                ` : ''}
                ${character.notes ? `
                    <div class="info-item">
                        <div class="info-label">Additional Notes</div>
                        <div class="text-content">${character.notes}</div>
                    </div>
                ` : ''}
            `;
            break;
    }
}

function searchCharacters() {
    renderCharacters();
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Render map if switching to map tab
    if (tabName === 'map') {
        setTimeout(renderMap, 100); // Allow tab to render first
    }
}

function switchCharacterTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.char-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-char-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.char-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

function showCharacterOnMap(character) {
    switchTab('map');
    // TODO: Highlight character location on map
}

function toggleMapView() {
    const currentTab = document.querySelector('.tab-content.active').id;
    if (currentTab === 'mapTab') {
        switchTab('characters');
    } else {
        switchTab('map');
    }
}

function zoomMap(factor) {
    // TODO: Implement map zoom functionality
}

function resetMap() {
    renderMap();
}

function insertCharacterReference(characterName) {
    insertTextAtCursor(characterName);
}

// Utility Functions
function updateWordCount() {
    const text = elements.chapterContent.value;
    const wordCount = countWords(text);
    const charCount = text.length;
    
    elements.wordCount.textContent = `Words: ${wordCount} | Characters: ${charCount}`;
}

function countWords(text) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    
    if (darkMode) {
        document.body.setAttribute('data-theme', 'dark');
        elements.darkModeToggle.textContent = '☀️';
    } else {
        document.body.removeAttribute('data-theme');
        elements.darkModeToggle.textContent = '🌙';
    }
}

function showModal(type) {
    hideModals();
    if (type === 'spellCheck') {
        elements.spellCheckModal.classList.add('show');
    } else if (type === 'thesaurus') {
        elements.thesaurusModal.classList.add('show');
        elements.thesaurusInput.focus();
    } else if (type === 'characterDetail') {
        elements.characterDetailModal.classList.add('show');
    }
}

function hideModals() {
    elements.spellCheckModal.classList.remove('show');
    elements.thesaurusModal.classList.remove('show');
    elements.characterDetailModal.classList.remove('show');
}

function insertTextAtCursor(text) {
    const textarea = elements.chapterContent;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    
    textarea.value = currentText.substring(0, start) + text + currentText.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + text.length, start + text.length);
    
    updateWordCount();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Data Persistence
function saveChapters() {
    localStorage.setItem('storyChapters', JSON.stringify(chapters));
}

function loadChapters() {
    const saved = localStorage.getItem('storyChapters');
    if (saved) {
        chapters = JSON.parse(saved);
        renderChapters();
    }
}
