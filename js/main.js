
// 初始化Firebase认证
function initFirebaseAuth() {
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    
    // 修改登录按钮样式
    if (loginButton) {
        loginButton.classList.add('px-6', 'py-3', 'text-lg', 'bg-purple-600', 'hover:bg-purple-700', 'text-white', 'rounded-lg', 'transition-colors');
    }
    
    // 检查是否在本地开发环境
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('192.168.');
    
    if (isLocalhost) {
        console.log('本地开发环境：Firebase认证可能受限，请在Firebase控制台添加localhost到授权域名');
    }
    
    // 检查Firebase是否已初始化
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.error('Firebase Auth 未初始化');
        return;
    }
    
    // 监听认证状态变化
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // 用户已登录
            if (loginButton) loginButton.classList.add('hidden');
            if (userProfile) userProfile.classList.remove('hidden');
            
            // 更新用户信息
            if (userAvatar) userAvatar.src = user.photoURL || 'img/default-avatar.png';
            if (userName) userName.textContent = user.displayName || '用户';
            
            // 打印完整的用户信息
            console.log('用户信息:', {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
                phoneNumber: user.phoneNumber,
                creationTime: user.metadata?.creationTime,
                lastSignInTime: user.metadata?.lastSignInTime
            });
            
        } else {
            // 用户未登录
            if (loginButton) loginButton.classList.remove('hidden');
            if (userProfile) userProfile.classList.add('hidden');
            
            console.log('用户未登录');
        }
    });
    
    // 登录按钮点击事件
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            try {
                // 创建Google认证提供者
                const provider = new firebase.auth.GoogleAuthProvider();
                
                // 使用弹出窗口方式登录
                firebase.auth().signInWithPopup(provider)
                    .then((result) => {
                        // 登录成功
                        const user = result.user;
                        console.log('Google登录成功:', user.displayName);
                        
                        // 可以在这里保存用户信息到本地存储
                        localStorage.setItem('user', JSON.stringify({
                            uid: user.uid,
                            displayName: user.displayName,
                            email: user.email,
                            photoURL: user.photoURL
                        }));
                        
                        // 显示成功提示
                        showToast('登录成功！');
                    })
                    .catch((error) => {
                        // 登录失败
                        console.error('Google登录失败:', error);
                        
                        // 根据错误类型显示不同提示
                        if (error.code === 'auth/unauthorized-domain') {
                            showToast('登录失败：当前域名未授权。请在Firebase控制台添加此域名到授权域名列表。');
                        } else {
                            showToast('登录失败，请重试');
                        }
                    });
            } catch (error) {
                console.error('登录过程发生错误:', error);
                showToast('登录过程发生错误，请检查控制台');
            }
        });
    }
    
    // 退出按钮点击事件
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            firebase.auth().signOut()
                .then(() => {
                    // 退出成功
                    console.log('退出成功');
                    
                    // 清除本地存储的用户信息
                    localStorage.removeItem('user');
                    
                    // 显示成功提示
                    showToast('已退出登录');
                })
                .catch((error) => {
                    // 退出失败
                    console.error('退出失败:', error);
                });
        });
    }
}

// 显示提示消息
function showToast(message) {
    // 检查是否已存在toast元素
    let toast = document.getElementById('toast');
    
    if (!toast) {
        // 创建toast元素
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-apple-gray-900 text-white px-4 py-2 rounded-lg opacity-0 transition-opacity duration-300';
        document.body.appendChild(toast);
    }
    
    // 设置消息内容
    toast.textContent = message;
    
    // 显示toast
    setTimeout(() => {
        toast.classList.add('opacity-100');
        
        // 3秒后隐藏
        setTimeout(() => {
            toast.classList.remove('opacity-100');
        }, 3000);
    }, 100);
}

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
                        window.location.href = `game.html?id=${game.id}`;
                    } else {
                        // 在首页点击，跳转到该游戏详情页
                        window.location.href = `game.html?id=${game.id}`;
                    }
                });
                
                searchResultsContainer.appendChild(resultItem);
            });
            
            // 显示搜索结果容器
            searchResultsContainer.classList.remove('hidden');
        } else {
            // 没有匹配结果
            searchResultsContainer.innerHTML = `
                <div class="p-3 text-apple-gray-600 text-center">没有找到匹配的游戏</div>
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
// 页面初始化函数
document.addEventListener('DOMContentLoaded', function() {
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

// 游戏详情页初始化
function initGameDetailPage() {
    // 获取URL参数中的游戏ID
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');
    
    if (gameId) {
        // 从游戏配置中查找对应ID的游戏
        const game = gamesConfig.games.find(g => g.id == gameId);
        if (game) {
            // 更新页面标题
            document.title = `${game.title} - Game518`;
            
            // 更新游戏标题和描述
            const gameTitle = document.getElementById('game-title');
            if (gameTitle) gameTitle.textContent = game.title;
            
            const gameDescription = document.getElementById('game-description');
            if (gameDescription) gameDescription.textContent = game.shortDescription;
            
            // 更新游戏分类和评分
            const gameCategory = document.getElementById('game-category');
            if (gameCategory) gameCategory.textContent = game.category;
            
            const gameRating = document.getElementById('game-rating');
            if (gameRating) gameRating.textContent = game.rating;
            
            // 更新游戏播放次数
            const gamePlayCount = document.getElementById('game-play-count');
            if (gamePlayCount) gamePlayCount.textContent = `${game.playCount} plays`;
            
            // 添加游戏iframe
            const gameIframeContainer = document.getElementById('game-iframe-container');
            if (gameIframeContainer) {
                gameIframeContainer.innerHTML = `
                    <iframe src="${game.iframeUrl}" title="${game.title}" class="w-full h-full border-0" allowfullscreen></iframe>
                `;
            }
            
            // 更新游戏完整描述
            const gameFullDescription = document.getElementById('game-full-description');
            if (gameFullDescription) {
                gameFullDescription.innerHTML = game.fullDescription.replace(/\n/g, '<br>');
            }
            
            // 加载相关游戏
            loadRelatedGames(game.category, game.id);
        } else {
            console.error('未找到ID为', gameId, '的游戏');
        }
    } else {
        console.error('URL中未找到游戏ID');
    }
}

// 加载相关游戏
function loadRelatedGames(category, currentGameId) {
    const relatedGamesContainer = document.getElementById('related-games');
    if (!relatedGamesContainer) return;
    
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
    } else {
        relatedGamesContainer.innerHTML = '<p class="text-apple-gray-400 text-center">没有找到相关游戏</p>';
    }
}

// 渲染游戏卡片
function renderGameCards(games) {
    const gamesContainer = document.getElementById('games-container');
    if (!gamesContainer) return;
    
    gamesContainer.innerHTML = games.map(game => `
        <a href="game.html?id=${game.id}" class="game-card block bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div class="relative aspect-video">
                <img src="${game.imageUrl}" alt="${game.title}" class="w-full h-full object-cover">
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 class="text-white text-lg font-bold">${game.title}</h3>
                </div>
            </div>
            <div class="p-4">
                <p class="text-apple-gray-600 text-sm line-clamp-2 mb-3">${game.shortDescription}</p>
                <div class="flex items-center justify-between">
                    <span class="bg-apple-blue/10 text-apple-blue px-3 py-1 rounded-full text-sm">${game.category}</span>
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

// 创建游戏卡片
function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full';
    
    card.innerHTML = `
        <div class="relative w-full pt-[56.25%]">
            <img src="${game.imageUrl}" alt="${game.title}" class="absolute top-0 left-0 w-full h-full object-cover">
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
    document.title = `${game.title} - Game518`;  // 修改这里，将GameVerse改为Game518
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

// 添加更新分类标题的函数
function updateCategoryTitle(category) {
    const titleElement = document.querySelector('#category-title h3');
    const countElement = document.querySelector('#games-count');
    const games = gamesConfig.games;
    
    if (category === 'ALL') {
        titleElement.textContent = 'All Games';
        countElement.textContent = `${games.length}`;
    } else {
        titleElement.textContent = `${category} Games`;
        const filteredGames = games.filter(game => game.category === category);
        countElement.textContent = `${filteredGames.length}`;
    }
}

// 修改 performSearch 函数，添加搜索结果标题更新
function performSearch(query) {
    if (!query) {
        updateCategoryTitle('ALL');
        renderGameCards(gamesConfig.games);
        return;
    }
    
    query = query.toLowerCase().trim();
    
    // 过滤游戏
    const filteredGames = gamesConfig.games.filter(game => {
        return game.title.toLowerCase().includes(query) || 
               game.category.toLowerCase().includes(query) ||
               (game.tags && game.tags.some(tag => tag.toLowerCase().includes(query)));
    });
    
    // 渲染过滤后的游戏
    renderGameCards(filteredGames);
    
    // 如果没有找到游戏，显示提示
    const gamesContainer = document.getElementById('games-container');
    if (filteredGames.length === 0 && gamesContainer) {
        gamesContainer.innerHTML = `
            <div class="col-span-full text-center py-10">
                <p class="text-xl text-apple-gray-600">没有找到与 "${query}" 相关的游戏</p>
                <button id="reset-search" class="mt-4 bg-apple-blue text-white px-4 py-2 rounded-lg">
                    显示所有游戏
                </button>
            </div>
        `;
        
        // 添加重置搜索的按钮事件
        document.getElementById('reset-search').addEventListener('click', function() {
            document.getElementById('game-search').value = '';
            renderGameCards(gamesConfig.games);
        });
    }
}

// 初始化游戏详情页
function initGamePage() {
    try {
        // 从URL获取游戏ID
        const urlParams = new URLSearchParams(window.location.search);
        const gameId = urlParams.get('id');
        
        if (!gameId) {
            console.error('游戏ID未提供');
            window.location.href = 'index.html'; // 重定向到首页
            return;
        }
        
        // 从配置中查找游戏
        const game = gamesConfig.games.find(g => g.id == gameId);
        
        if (!game) {
            console.error('未找到ID为', gameId, '的游戏');
            window.location.href = 'index.html'; // 重定向到首页
            return;
        }
        
        // 更新页面标题
        document.title = `${game.title} - Game518`;
        
        // 更新游戏详情
        updateGameDetails(game);
        
        // 加载相关游戏推荐
        loadRelatedGames(game);
        
    } catch (error) {
        console.error('初始化游戏详情页时出错:', error);
    }
}

// 更新游戏详情
function updateGameDetails(game) {
    try {
        // 更新游戏标题
        const titleElement = document.getElementById('game-title');
        if (titleElement) {
            titleElement.textContent = game.title;
        }
        
        // 更新游戏图片
        const imageElement = document.getElementById('game-image');
        if (imageElement) {
            imageElement.src = game.imageUrl;
            imageElement.alt = game.title;
        } else {
            console.warn('游戏图片元素不存在');
        }
        
        // 更新游戏分类
        const categoryElement = document.getElementById('game-category');
        if (categoryElement) {
            categoryElement.textContent = game.category;
        }
        
        // 更新游戏评分
        const ratingElement = document.getElementById('game-rating');
        if (ratingElement) {
            ratingElement.textContent = game.rating.toFixed(1);
        }
        
        // 更新游戏播放次数
        const playCountElement = document.getElementById('game-play-count');
        if (playCountElement) {
            playCountElement.textContent = `${formatPlayCount(game.playCount)} plays`;
        }
        
        // 添加游戏iframe
        const iframeContainer = document.getElementById('game-iframe-container');
        if (iframeContainer) {
            iframeContainer.innerHTML = `
                <iframe src="${game.iframeUrl}" title="${game.title}" class="w-full h-full border-0" allowfullscreen></iframe>
            `;
        } else {
            console.warn('游戏iframe容器不存在');
        }
        
        // 更新游戏完整描述
        const descriptionElement = document.getElementById('game-full-description');
        if (descriptionElement) {
            descriptionElement.innerHTML = game.fullDescription.replace(/\n/g, '<br>');
        }
    } catch (error) {
        console.error('更新游戏详情时出错:', error);
    }
}

// 加载相关游戏推荐
function loadRelatedGames(currentGame) {
    try {
        // 获取相同分类的游戏
        const relatedGames = gamesConfig.games
            .filter(game => game.category === currentGame.category && game.id !== currentGame.id)
            .slice(0, 6); // 最多显示6个相关游戏
        
        const relatedGamesContainer = document.getElementById('related-games');
        
        if (!relatedGamesContainer) {
            console.error('相关游戏容器不存在');
            return;
        }
        
        if (relatedGames.length === 0) {
            relatedGamesContainer.innerHTML = '<p class="text-center text-gray-400">没有相关游戏</p>';
            return;
        }
        
        // 生成相关游戏卡片
        let relatedGamesHTML = '';
        
        relatedGames.forEach(game => {
            relatedGamesHTML += `
                <div class="game-card">
                    <a href="game.html?id=${game.id}" class="block">
                        <div class="relative overflow-hidden rounded-lg">
                            <img src="${game.imageUrl}" alt="${game.title}" class="w-full h-40 object-cover transition-transform duration-300 hover:scale-110">
                            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                <h3 class="text-white font-bold truncate">${game.title}</h3>
                                <div class="flex items-center mt-1">
                                    <span class="bg-apple-purple text-white text-xs px-2 py-1 rounded">${game.category}</span>
                                    <div class="ml-auto flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span class="text-white text-xs ml-1">${game.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            `;
        });
        
        relatedGamesContainer.innerHTML = relatedGamesHTML;
        
    } catch (error) {
        console.error('加载相关游戏时出错:', error);
    }
}

// 添加缺失的函数定义
// 游戏详情页初始化
function initGameDetailPage() {
    console.log('初始化游戏详情页');
    // 获取URL参数中的游戏ID
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');
    
    if (gameId) {
        // 从游戏配置中查找对应ID的游戏
        const game = gamesConfig.games.find(g => g.id == gameId);
        if (game) {
            // 更新页面标题
            document.title = `${game.title} - Game518`;
            
            // 更新游戏标题和描述
            const gameTitle = document.getElementById('game-title');
            if (gameTitle) gameTitle.textContent = game.title;
            
            const gameDescription = document.getElementById('game-description');
            if (gameDescription) gameDescription.textContent = game.shortDescription;
            
            // 更新游戏分类和评分
            const gameCategory = document.getElementById('game-category');
            if (gameCategory) gameCategory.textContent = game.category;
            
            const gameRating = document.getElementById('game-rating');
            if (gameRating) gameRating.textContent = game.rating;
            
            // 更新游戏播放次数
            const gamePlayCount = document.getElementById('game-play-count');
            if (gamePlayCount) gamePlayCount.textContent = `${game.playCount} plays`;
            
            // 添加游戏iframe
            const gameIframeContainer = document.getElementById('game-iframe-container');
            if (gameIframeContainer) {
                gameIframeContainer.innerHTML = `
                    <iframe src="${game.iframeUrl}" title="${game.title}" class="w-full h-full border-0" allowfullscreen></iframe>
                `;
            }
            
            // 更新游戏完整描述
            const gameFullDescription = document.getElementById('game-full-description');
            if (gameFullDescription) {
                gameFullDescription.innerHTML = game.fullDescription.replace(/\n/g, '<br>');
            }
            
            // 加载相关游戏
            loadRelatedGames(game.category, game.id);
        } else {
            console.error('未找到ID为', gameId, '的游戏');
        }
    } else {
        console.error('URL中未找到游戏ID');
    }
}

// 加载相关游戏
function loadRelatedGames(category, currentGameId) {
    const relatedGamesContainer = document.getElementById('related-games');
    if (!relatedGamesContainer) return;
    
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
    } else {
        relatedGamesContainer.innerHTML = '<p class="text-apple-gray-400 text-center">没有找到相关游戏</p>';
    }
}

// 通用功能初始化
function initCommonFeatures() {
    console.log('初始化通用功能');
    // 初始化搜索功能
    initSearchFunction();
    
    // 初始化Firebase认证
    initFirebaseAuth();
}

// 添加首页初始化函数
function initHomePage() {
    console.log('初始化首页内容');
    
    // 获取游戏容器元素
    const gamesContainer = document.getElementById('games-container');
    if (!gamesContainer) {
        console.warn('游戏容器元素不存在，无法初始化首页');
        return;
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

// 初始化分类导航
function initCategoriesNav() {
    // 获取所有游戏分类
    const categories = Array.from(new Set(gamesConfig.games.map(game => game.category)));
    
    // 获取分类容器
    const categoriesSection = document.getElementById('categories');
    if (!categoriesSection) return;
    
    // 创建分类导航HTML
    let categoriesHTML = `
        <div class="container mx-auto px-4">
            <h2 class="text-2xl font-bold mb-6 text-white">游戏分类</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <a href="#" class="category-btn bg-[#2A2A3C] hover:bg-[#3A3A4C] text-white rounded-lg p-4 text-center transition-colors" data-category="ALL">
                    所有游戏
                </a>
    `;
    
    // 添加每个分类
    categories.forEach(category => {
        categoriesHTML += `
            <a href="#" class="category-btn bg-[#2A2A3C] hover:bg-[#3A3A4C] text-white rounded-lg p-4 text-center transition-colors" data-category="${category}">
                ${category.charAt(0).toUpperCase() + category.slice(1)}
            </a>
        `;
    });
    
    categoriesHTML += `
            </div>
        </div>
    `;
    
    // 设置分类导航HTML
    categoriesSection.innerHTML = categoriesHTML;
    
    // 添加分类按钮点击事件
    document.querySelectorAll('.category-btn').forEach(btn => {
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
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('bg-apple-blue');
                btn.classList.add('bg-[#2A2A3C]');
            });
            this.classList.remove('bg-[#2A2A3C]');
            this.classList.add('bg-apple-blue');
        });
    });
}