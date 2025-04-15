
// 页面初始化函数 - 只保留一个DOMContentLoaded事件监听器
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化...');
    
    // 检测当前页面类型
    const isHomePage = document.querySelector('#games-container') !== null;
    const isGameDetailPage = document.querySelector('#game-iframe-container') !== null;
    
    // 初始化搜索功能（两个页面都需要）
    initSearchFunction();
    
    // 根据页面类型执行不同的初始化
    if (isHomePage) {
        console.log('初始化首页');
        initHomePage();
    } else if (isGameDetailPage) {
        console.log('初始化游戏详情页');
        initGameDetailPage();
    }
});

// 初始化搜索功能
function initSearchFunction() {
    const searchInput = document.getElementById('game-search');
    const searchButton = document.getElementById('search-button');
    
    if (!searchInput || !searchButton) return;
    
    // 创建搜索结果下拉容器
    const searchResultsContainer = document.createElement('div');
    searchResultsContainer.id = 'search-results';
    searchResultsContainer.className = 'absolute z-10 bg-white w-full mt-1 rounded-lg shadow-lg overflow-hidden hidden';
    searchInput.parentNode.appendChild(searchResultsContainer);
    
    // 搜索按钮点击事件
    searchButton.addEventListener('click', function() {
        // 如果在详情页，跳转到首页并带上搜索参数
        if (window.location.pathname.includes('game.html')) {
            window.location.href = `index.html?search=${encodeURIComponent(searchInput.value)}`;
        } else {
            performSearch(searchInput.value);
            hideSearchResults();
        }
    });
    
    // 输入框回车事件
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            // 如果在详情页，跳转到首页并带上搜索参数
            if (window.location.pathname.includes('game.html')) {
                window.location.href = `index.html?search=${encodeURIComponent(searchInput.value)}`;
            } else {
                performSearch(searchInput.value);
                hideSearchResults();
            }
        }
    });
    
    // 输入框输入事件 - 显示搜索建议
    searchInput.addEventListener('input', function() {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            showSearchSuggestions(query);
        } else {
            hideSearchResults();
            // 如果在首页，显示所有游戏
            if (!window.location.pathname.includes('game.html')) {
                renderGameCards(gamesConfig.games);
            }
        }
    });
    
    // 点击页面其他地方时隐藏搜索结果
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResultsContainer.contains(e.target)) {
            hideSearchResults();
        }
    });
    
    // 如果是首页且URL中有搜索参数，执行搜索
    if (!window.location.pathname.includes('game.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        if (searchQuery) {
            searchInput.value = searchQuery;
            performSearch(searchQuery);
        }
    }
    
    // 显示搜索建议
    // 显示搜索建议
    function showSearchSuggestions(query) {
        query = query.toLowerCase();
        
        // 过滤匹配的游戏
        const matchedGames = gamesConfig.games.filter(game => {
            return game.title.toLowerCase().includes(query) || 
                   game.category.toLowerCase().includes(query) ||
                   (game.tags && game.tags.some(tag => tag.toLowerCase().includes(query)));
        }).slice(0, 6); // 最多显示6个结果
        
        if (matchedGames.length > 0) {
            // 渲染搜索结果
            searchResultsContainer.innerHTML = '';
            matchedGames.forEach(game => {
                const resultItem = document.createElement('div');
                resultItem.className = 'flex items-center p-3 hover:bg-apple-gray-100 cursor-pointer';
                resultItem.innerHTML = `
                    <img src="${game.imageUrl}" alt="${game.title}" class="w-12 h-12 object-cover rounded mr-3">
                    <div>
                        <div class="font-medium text-gray-900">${game.title}</div>
                        <div class="text-sm text-apple-gray-600">${game.category}</div>
                    </div>
                `;
                
                // 点击搜索结果项
                resultItem.addEventListener('click', function() {
                    if (window.location.pathname.includes('game.html')) {
                        // 在详情页点击，直接跳转到该游戏
                        window.location.href = `index.html?search=${encodeURIComponent(searchInput.value)}`;
                    } else {
                        // 在首页点击，跳转到该游戏详情页
                        window.location.href = `index.html?search=${encodeURIComponent(searchInput.value)}`;
                    }
                });
                searchResultsContainer.appendChild(resultItem);
            });
            
            // 显示搜索结果容器
            searchResultsContainer.classList.remove('hidden');
        } else {
            // 没有匹配结果
            searchResultsContainer.innerHTML = `
                <div class="p-3 text-apple-gray-600 text-center">No matching games found</div>
            `;
            searchResultsContainer.classList.remove('hidden');
        }
    }
    
    // 隐藏搜索结果
    function hideSearchResults() {
        searchResultsContainer.classList.add('hidden');
    }
}

// 初始化首页
function initHomePage() {
    console.log('初始化首页内容');
    
    // 获取游戏容器元素
    const gamesContainer = document.getElementById('games-container');
    if (!gamesContainer) {
        console.warn('游戏容器元素不存在，无法初始化首页');
        return;
    }
    
    // 更新游戏总数
    const gamesCount = document.getElementById('games-count');
    if (gamesCount) {
        gamesCount.textContent = gamesConfig.games.length;
    }
    
    // 渲染所有游戏卡片
    renderGameCards(gamesConfig.games);
    
    // 初始化分类导航（如果存在）
    const categoriesSection = document.getElementById('categories');
    if (categoriesSection) {
        initCategoriesNav();
    }
    
    // 检查URL中是否有搜索参数
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
        // 如果有搜索参数，执行搜索
        const searchInput = document.getElementById('game-search');
        if (searchInput) {
            searchInput.value = searchQuery;
            performSearch(searchQuery);
        }
    }
}

// 渲染游戏卡片
function renderGameCards(games) {
    const gamesContainer = document.getElementById('games-container');
    if (!gamesContainer) return;
    
    if (games.length === 0) {
        gamesContainer.innerHTML = `
            <div class="col-span-full text-center py-10">
                <p class="text-xl text-apple-gray-400">No matching games found</p>
                <button id="reset-search" class="mt-4 bg-apple-blue text-white px-4 py-2 rounded-lg">
                    Show All Games
                </button>
            </div>
        `;
        
        // 添加重置搜索的按钮事件
        const resetButton = document.getElementById('reset-search');
        if (resetButton) {
            resetButton.addEventListener('click', function() {
                document.getElementById('game-search').value = '';
                renderGameCards(gamesConfig.games);
                updateCategoryTitle('ALL');
            });
        }
        return;
    }
    
    gamesContainer.innerHTML = games.map(game => `
        <a href="game.html?id=${game.id}" class="game-card block bg-white dark:bg-[#2A2A3C] rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div class="relative aspect-video">
                <img src="${game.imageUrl}" alt="${game.title}" class="w-full h-full object-cover">
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 class="text-white text-lg font-bold game-title">${game.title}</h3>
                </div>
            </div>
            <div class="p-4">
                <div class="flex items-center justify-between">
                    <span class="bg-apple-blue/10 text-apple-blue dark:bg-apple-blue/20 dark:text-apple-blue px-3 py-1 rounded-full text-sm">${game.category}</span>
                    <div class="flex items-center text-apple-yellow">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span class="ml-1">${game.rating}</span>
                    </div>
                </div>
            </div>
        </a>
    `).join('');
}

// 初始化分类导航
function initCategoriesNav() {
    // 获取所有游戏分类
    const categories = Array.from(new Set(gamesConfig.games.map(game => game.category)));
    
    // 获取分类容器
    const categoriesSection = document.getElementById('categories');
    if (!categoriesSection) return;
    
    // 定义分类图标和颜色
    const categoryIcons = [
        { icon: 'gamepad', color: '#FF9500' }, // 橙色
        { icon: 'puzzle-piece', color: '#34C759' }, // 绿色
        { icon: 'car-side', color: '#007AFF' }, // 蓝色
        { icon: 'chess', color: '#AF52DE' }, // 紫色
        { icon: 'running', color: '#FF2D55' }, // 粉色
        { icon: 'brain', color: '#5AC8FA' }, // 青色
        { icon: 'fighter-jet', color: '#FFCC00' }, // 黄色
        { icon: 'rocket', color: '#FF3B30' }, // 红色
        { icon: 'football-ball', color: '#5856D6' }, // 靛蓝色
        { icon: 'ghost', color: '#BF5AF2' }, // 亮紫色
        { icon: 'dice', color: '#64D2FF' }, // 浅蓝色
        { icon: 'hat-wizard', color: '#FF375F' }  // 深粉色
    ];
    
    // 随机打乱图标数组，确保随机分配且不重复
    const shuffledIcons = [...categoryIcons].sort(() => Math.random() - 0.5);
    
    // 创建分类导航HTML
    let categoriesHTML = `
        <!-- 所有游戏分类 -->
        <a href="#" class="sidebar-item active-category" data-category="ALL">
            <i class="fas fa-grip" style="color:rgb(161, 52, 204);"></i>
            <span>ALL</span>
        </a>
    `;
    
    // 添加每个分类，并分配随机图标
    categories.forEach((category, index) => {
        // 确保不超出图标数组范围
        const iconIndex = index % shuffledIcons.length;
        const { icon, color } = shuffledIcons[iconIndex];
        
        categoriesHTML += `
            <a href="#" class="sidebar-item" data-category="${category}">
                <i class="fas fa-${icon}" style="color: ${color};"></i>
                <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
            </a>
        `;
    });
    
    // 设置分类导航HTML
    categoriesSection.innerHTML = categoriesHTML;
    
    // 添加分类按钮点击事件
    document.querySelectorAll('.sidebar-item').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取选中的分类
            const category = this.getAttribute('data-category');
            
            // 过滤游戏
            if (category === 'ALL') {
                renderGameCards(gamesConfig.games);
            } else {
                const filteredGames = gamesConfig.games.filter(game => game.category === category);
                renderGameCards(filteredGames);
            }
            
            // 更新分类标题
            updateCategoryTitle(category);
            
            // 高亮当前选中的分类
            document.querySelectorAll('.sidebar-item').forEach(btn => {
                btn.classList.remove('active-category');
            });
            this.classList.add('active-category');
        });
    });
}

// 更新分类标题
function updateCategoryTitle(category) {
    const categoryNameElement = document.querySelector('#category-name');
    const countElement = document.querySelector('#games-count');
    
    if (!categoryNameElement || !countElement) return;
    
    if (category === 'ALL') {
        categoryNameElement.textContent = 'All Games';
        countElement.textContent = gamesConfig.games.length;
    } else {
        categoryNameElement.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Games`;
        const filteredGames = gamesConfig.games.filter(game => game.category === category);
        countElement.textContent = filteredGames.length;
    }
}

// 执行搜索
function performSearch(query) {
    if (!query || !query.trim()) {
        renderGameCards(gamesConfig.games);
        updateCategoryTitle('ALL');
        return;
    }
    
    query = query.toLowerCase().trim();
    
    // 过滤游戏
    const filteredGames = gamesConfig.games.filter(game => {
        return game.title.toLowerCase().includes(query) || 
               game.category.toLowerCase().includes(query) ||
               game.shortDescription.toLowerCase().includes(query) ||
               (game.tags && game.tags.some(tag => tag.toLowerCase().includes(query)));
    });
    
    // 渲染过滤后的游戏
    renderGameCards(filteredGames);
    
    // 更新标题 - 使用自定义搜索结果标题
    const categoryNameElement = document.querySelector('#category-name');
    const countElement = document.querySelector('#games-count');
    
    if (categoryNameElement) {
        categoryNameElement.textContent = `Search Results: "${query}"`;
    }
    
    if (countElement) {
        countElement.textContent = filteredGames.length;
    }
    
    // 移除所有分类按钮的高亮
    document.querySelectorAll('.sidebar-item').forEach(btn => {
        btn.classList.remove('active-category');
    });
}

// 游戏详情页初始化
function initGameDetailPage() {
    console.log('Initializing game detail page');
    
    // 从URL获取游戏ID
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');
    
    if (!gameId) {
        console.error('Game ID not found');
        return;
    }
    
    // 查找对应的游戏
    const game = gamesConfig.games.find(g => g.id.toString() === gameId);
    
    if (!game) {
        console.error('Game data not found');
        return;
    }
    
    // 更新页面标题
    document.title = `${game.title} - Game518`;
    
    // 更新游戏信息
    const gameTitle = document.getElementById('game-title');
    if (gameTitle) gameTitle.textContent = game.title;
    
    const gameDescription = document.getElementById('game-description');
    if (gameDescription) gameDescription.textContent = game.shortDescription;
    
    const gameCategory = document.getElementById('game-category');
    if (gameCategory) gameCategory.textContent = game.category;
    
    const gameRating = document.getElementById('game-rating');
    if (gameRating) gameRating.textContent = game.rating;
    
    const gamePlayCount = document.getElementById('game-play-count');
    if (gamePlayCount) gamePlayCount.textContent = `${game.playCount.toLocaleString()} plays`;
    
    // 显示游戏图片
    const gameImage = document.getElementById('game-image');
    if (gameImage) {
        gameImage.src = game.imageUrl;
        gameImage.alt = game.title;
        gameImage.classList.remove('hidden');
    }
    
    // 加载游戏iframe
    const gameIframeContainer = document.getElementById('game-iframe-container');
    if (gameIframeContainer) {
        gameIframeContainer.innerHTML = `<iframe src="${game.iframeUrl}" class="game-iframe" title="${game.title}" allowfullscreen></iframe>`;
    }
    
    // 更新游戏简单描述
    const gameShortDescription = document.getElementById('game-short-description');
    if (gameShortDescription) {
        gameShortDescription.innerHTML = game.shortDescription.replace(/\n/g, '<br>');
    }
    
    // 更新游戏详细描述
    const gameFullDescription = document.getElementById('game-full-description');
    if (gameFullDescription) {
        gameFullDescription.innerHTML = game.fullDescription.replace(/\n/g, '<br>');
    }
    
    // 加载相关游戏
    loadRelatedGames(game.category, game.id);
}

// 加载相关游戏
function loadRelatedGames(category, currentGameId) {
    const relatedGamesSection = document.querySelector('.mb-8:last-child');
    const relatedGamesContainer = document.getElementById('related-games');
    if (!relatedGamesContainer || !relatedGamesSection) return;
    
    // 查找同类别的游戏，排除当前游戏
    const relatedGames = gamesConfig.games
        .filter(game => game.category === category && game.id != currentGameId)
        .slice(0, 6); // 最多显示6个相关游戏
    
    if (relatedGames.length > 0) {
        relatedGamesContainer.innerHTML = relatedGames.map(game => `
            <a href="game.html?id=${game.id}" class="game-card block bg-[#2A2A3C] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all">
                <div class="relative aspect-video">
                    <img src="${game.imageUrl}" alt="${game.title}" class="w-full h-full object-cover">
                </div>
                <div class="p-3">
                    <h3 class="text-white text-sm font-medium line-clamp-1">${game.title}</h3>
                    <div class="flex items-center justify-between mt-2">
                        <span class="text-xs text-apple-gray-400">${game.category}</span>
                        <div class="flex items-center text-apple-yellow">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span class="ml-1 text-xs">${game.rating}</span>
                        </div>
                    </div>
                </div>
            </a>
        `).join('');
        relatedGamesSection.classList.remove('hidden');
    } else {
        // 如果没有相关游戏，隐藏整个相关游戏部分
        relatedGamesSection.classList.add('hidden');
    }
}

// 格式化播放次数
function formatPlayCount(count) {
    return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}