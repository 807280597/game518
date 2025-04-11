// Fetch games data
async function fetchGames() {
    try {
        // 首先检查是否有预加载的游戏数据
        if (window.gamesData && window.gamesData.games && window.gamesData.games.length > 0) {
            return window.gamesData.games;
        }
        
        // 如果没有预加载数据，则通过fetch获取
        const response = await fetch('../data/games.json');
        const data = await response.json();
        return data.games;
    } catch (error) {
        console.error('Error fetching games:', error);
        return [];
    }
}

// Format play count
function formatPlayCount(count) {
    return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Create game card HTML
function createGameCard(game) {
    return `
        <div class="game-card bg-white rounded-xl shadow-lg overflow-hidden">
            <img src="${game.imageUrl}" alt="${game.title}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="text-xl font-bold mb-2">${game.title}</h3>
                <p class="text-apple-gray-600 mb-4">${game.shortDescription}</p>
                <div class="flex justify-between items-center">
                    <span class="bg-apple-blue text-white px-2 py-1 rounded text-xs">${game.category}</span>
                    <div class="flex items-center text-apple-yellow">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span class="ml-1">${game.rating}</span>
                    </div>
                </div>
                <a href="game.html?id=${game.id}" class="block mt-4 bg-apple-blue hover:bg-blue-600 text-white text-center py-2 rounded-lg transition-colors">
                    Play Now
                </a>
            </div>
        </div>
    `;
}

// Initialize the home page
async function initHomePage() {
    const gamesContainer = document.getElementById('games-container');
    if (!gamesContainer) return;
    
    const games = await fetchGames();
    gamesContainer.innerHTML = '';
    games.forEach(game => {
        gamesContainer.innerHTML += createGameCard(game);
    });
}

// Get URL parameter
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Initialize the game page
async function initGamePage() {
    const gameId = getUrlParam('id');
    if (!gameId) return;

    const games = await fetchGames();
    const game = games.find(g => g.id.toString() === gameId);
    if (!game) return;

    // Update page title and meta
    document.title = `${game.title} - GameVerse`;
    document.querySelector('meta[name="description"]').content = game.shortDescription;
    document.querySelector('link[rel="canonical"]').href = `https://gameverse.example.com/game.html?id=${game.id}`;

    // Update game details
    document.getElementById('game-title').textContent = game.title;
    document.getElementById('game-description').textContent = game.shortDescription;
    document.getElementById('game-category').textContent = game.category;
    document.getElementById('game-rating').querySelector('span').textContent = game.rating;
    
    // Update play count with animation
    const playCount = parseInt(game.playCount) + 1;
    document.getElementById('game-play-count').textContent = `${formatPlayCount(playCount)} plays`;
    document.getElementById('game-play-count').classList.add('play-count');

    // Add game iframe
    document.getElementById('game-iframe-container').innerHTML = `
        <iframe src="${game.iframeUrl}" title="${game.title}" class="game-iframe" allowfullscreen></iframe>
    `;

    // Update full description
    document.getElementById('game-full-description').innerHTML = `<p>${game.fullDescription}</p>`;
}

// Initialize the appropriate page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('games-container')) {
        initHomePage();
    } else if (document.getElementById('game-content')) {
        initGamePage();
    }
});