// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否在游戏详情页
    const isGamePage = window.location.pathname.includes('game.html');
    
    if (isGamePage) {
        // 初始化游戏详情页
        initGamePage();
    } else {
        // 初始化首页
        initHomePage();
    }
});

// 初始化首页
async function initHomePage() {
    try {
        // 使用配置文件中的游戏数据
        const games = gamesConfig.games;
        
        // 渲染游戏卡片
        renderGameCards(games);
    } catch (error) {
        console.error('Error initializing home page:', error);
    }
}

// 初始化游戏详情页
async function initGamePage() {
    try {
        // 获取URL参数中的游戏ID
        const gameId = getGameIdFromUrl();
        if (!gameId) {
            console.error('No game ID found in URL');
            return;
        }
        
        // 从配置文件中查找对应的游戏
        const game = gamesConfig.games.find(g => g.id.toString() === gameId.toString());
        if (!game) {
            console.error('Game not found with ID:', gameId);
            return;
        }
        
        // 渲染游戏详情
        renderGameDetails(game);
    } catch (error) {
        console.error('Error initializing game page:', error);
    }
}

// 从URL获取游戏ID
function getGameIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// 渲染游戏卡片
function renderGameCards(games) {
    const gamesContainer = document.getElementById('games-container');
    if (!gamesContainer) return;
    
    gamesContainer.innerHTML = '';
    
    games.forEach(game => {
        const gameCard = createGameCard(game);
        gamesContainer.appendChild(gameCard);
    });
}

// 创建游戏卡片
function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full';
    
    card.innerHTML = `
        <div class="aspect-video w-full">
            <img src="${game.imageUrl}" alt="${game.title}" class="w-full h-full object-cover">
        </div>
        <div class="p-4 flex flex-col flex-grow">
            <h3 class="text-xl font-bold h-14 line-clamp-2">${game.title}</h3>
            <div class="flex justify-between items-center mt-auto">
                <span class="bg-apple-blue text-white px-3 py-1.5 rounded-full text-sm">${game.category}</span>
                <div class="flex items-center text-apple-yellow">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span class="ml-1 text-lg font-medium">${game.rating}</span>
                </div>
            </div>
            <a href="game.html?id=${game.id}" class="block mt-4 bg-apple-blue hover:bg-blue-600 text-white text-center py-2.5 rounded-lg transition-colors font-medium">
                Play Now
            </a>
        </div>
    `;
    
    return card;
}

// 渲染游戏详情
function renderGameDetails(game) {
    // 更新页面标题和元数据
    document.title = `${game.title} - GameVerse`;
    document.querySelector('meta[name="description"]').content = game.shortDescription;
    document.querySelector('link[rel="canonical"]').href = `https://gameverse.example.com/game.html?id=${game.id}`;
    
    // 更新游戏标题和描述
    document.getElementById('game-title').textContent = game.title;
    document.getElementById('game-description').textContent = game.shortDescription;
    
    // 更新游戏分类和评分
    document.getElementById('game-category').textContent = game.category;
    document.getElementById('game-rating').querySelector('span').textContent = game.rating;
    
    // 更新游戏播放次数
    document.getElementById('game-play-count').textContent = `${formatPlayCount(game.playCount)} plays`;
    
    // 添加游戏iframe
    document.getElementById('game-iframe-container').innerHTML = `
        <iframe src="${game.iframeUrl}" title="${game.title}" class="w-full h-full border-0" allowfullscreen></iframe>
    `;
    
    // 更新游戏完整描述
    document.getElementById('game-full-description').innerHTML = game.fullDescription.replace(/\n/g, '<br>');
}

// 格式化播放次数
function formatPlayCount(count) {
    return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}