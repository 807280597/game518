// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否在游戏详情页
    const isGamePage = window.location.pathname.includes('game.html');
    
    if (isGamePage) {
        // 初始化游戏详情页
        initGamePage();
        // 在详情页也初始化搜索功能
        initSearchFunction();
    } else {
        // 初始化首页
        initHomePage();
        // 初始化搜索功能
        initSearchFunction();
    }
    
    // 初始化Firebase认证
    initFirebaseAuth();
});

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
    
    // 监听认证状态变化
    // 监听认证状态变化
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // 用户已登录
            loginButton.classList.add('hidden');
            userProfile.classList.remove('hidden');
            
            // 更新用户信息
            userAvatar.src = user.photoURL || 'img/default-avatar.png';
            userName.textContent = user.displayName || '用户';
            
            // 打印完整的用户信息
            console.log('用户信息:', {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
                phoneNumber: user.phoneNumber,
                creationTime: user.metadata.creationTime,
                lastSignInTime: user.metadata.lastSignInTime
            });
            
        } else {
            // 用户未登录
            loginButton.classList.remove('hidden');
            userProfile.classList.add('hidden');
            
            console.log('用户未登录');
        }
    });
    
    // 登录按钮点击事件
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
    
    // 退出按钮点击事件
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
                        <div class="font-medium">${game.title}</div>
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
async function initHomePage() {
    try {
        const games = gamesConfig.games;
        
        // 定义一组鲜艳的颜色
        const colors = [
            'bg-blue-500',
            'bg-green-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-yellow-500',
            'bg-red-500',
            'bg-indigo-500',
            'bg-teal-500',
            'bg-orange-500',
            'bg-cyan-500'
        ];
        
        // 添加分类导航
        const categoriesSection = document.createElement('section');
        categoriesSection.className = 'categories-drawer fixed left-0 top-20 z-30 h-full';
        
        // 定义彩色分类图标
        const categoryIcons = [
            // Action - 红色闪电
            '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#FF3B30"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
            // Adventure - 绿色探险
            '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#34C759"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/></svg>',
            // Puzzle - 紫色拼图
            '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#AF52DE"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/></svg>',
            // Racing - 橙色箭头
            '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#FF9500"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>',
            // Sports - 蓝色球类
            '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#007AFF"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg>',
            // Strategy - 青色棋盘
            '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#5AC8FA"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>'
        ];
        
        // 创建抽屉HTML结构
        let drawerHTML = `
            <div class="drawer-container group">
                <div class="drawer-icons bg-[#1A1A2A] rounded-r-lg shadow-lg py-2">
                    <a href="#" class="category-icon-btn flex items-center justify-center p-3 text-white hover:bg-[#252535] transition-colors" data-category="ALL">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#FFCC00">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                        </svg>
                    </a>
        `;
        
        // 添加分类图标
        Array.from(new Set(games.map(game => game.category))).forEach((category, index) => {
            drawerHTML += `
                <a href="#" class="category-icon-btn flex items-center justify-center p-3 text-white hover:bg-[#252535] transition-colors" data-category="${category}">
                    ${categoryIcons[index % categoryIcons.length]}
                </a>
            `;
        });
        
        drawerHTML += `
                </div>
                <div class="drawer-content hidden group-hover:block absolute left-full top-0 bg-[#1A1A2A] rounded-r-lg shadow-lg py-2 min-w-[150px]">
                    <a href="#" class="category-btn flex items-center p-3 text-white hover:bg-[#252535] transition-colors" data-category="ALL">
                        <span class="ml-2">ALL</span>
                    </a>
        `;
        
        // 添加分类名称
        Array.from(new Set(games.map(game => game.category))).forEach((category, index) => {
            drawerHTML += `
                <a href="#" class="category-btn flex items-center p-3 text-white hover:bg-[#252535] transition-colors" data-category="${category}">
                    <span class="ml-2">${category}</span>
                </a>
            `;
        });
        
        drawerHTML += `
                </div>
            </div>
        `;
        
        categoriesSection.innerHTML = drawerHTML;
        
        // 添加CSS样式
        const drawerStyle = document.createElement('style');
        drawerStyle.textContent = `
            .categories-drawer {
                transition: transform 0.3s ease;
            }
            .drawer-container {
                position: relative;
            }
            .drawer-content {
                transition: opacity 0.3s ease, visibility 0.3s;
            }
            /* 调整主内容区域的左边距，为抽屉腾出空间 */
            main.container {
                margin-left: 60px;
                width: calc(100% - 60px);
            }
        `;
        document.head.appendChild(drawerStyle);
        
        // 添加到body
        document.body.appendChild(categoriesSection);
        
        // 添加分类点击事件
        categoriesSection.addEventListener('click', (e) => {
            const categoryBtn = e.target.closest('[data-category]');
            if (categoryBtn) {
                e.preventDefault();
                const category = categoryBtn.dataset.category;
                
                // 更新分类标题
                updateCategoryTitle(category);
                
                // 如果点击的是ALL，显示所有游戏
                if (category === 'ALL') {
                    renderGameCards(games);
                } else {
                    const filteredGames = games.filter(game => game.category === category);
                    renderGameCards(filteredGames);
                }
                
                // 滚动到游戏列表
                document.getElementById('games-container').scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        // 添加分类标题区域
        const categoryTitleSection = document.createElement('div');
        categoryTitleSection.id = 'category-title';
        categoryTitleSection.className = 'px-4 py-3 mb-4';
        categoryTitleSection.innerHTML = `
            <h3 class="text-xl font-bold text-apple-white">All Games</h3>
            <p class="text-apple-gray-300 text-base mt-1"><span id="games-count"></span> games available</p>
        `;
        
        // 插入分类标题到游戏列表前
        const gamesContainer = document.getElementById('games-container');
        gamesContainer.parentNode.insertBefore(categoryTitleSection, gamesContainer);
        
        // 渲染游戏卡片
        renderGameCards(games);
    } catch (error) {
        console.error('Error initializing home page:', error);
    }
}

// 执行搜索
function performSearch(query) {
    if (!query) {
        // 如果搜索框为空，显示所有游戏
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
        
        // 移除了分类导航的初始化
    } catch (error) {
        console.error('Error initializing game page:', error);
    }
}

// 将分类导航初始化代码提取为独立函数
function initCategoriesNavigation() {
    const games = gamesConfig.games;
    
    // 定义一组鲜艳的颜色
    const colors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-yellow-500',
        'bg-red-500',
        'bg-indigo-500',
        'bg-teal-500',
        'bg-orange-500',
        'bg-cyan-500'
    ];
    
    // 添加分类导航
    const categoriesSection = document.createElement('section');
    categoriesSection.className = 'categories-drawer fixed left-0 top-20 z-30 h-full';
    
    // 定义彩色分类图标
    const categoryIcons = [
        // Action - 红色闪电
        '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#FF3B30"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
        // Adventure - 绿色探险
        '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#34C759"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/></svg>',
        // Puzzle - 紫色拼图
        '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#AF52DE"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/></svg>',
        // Racing - 橙色箭头
        '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#FF9500"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>',
        // Sports - 蓝色球类
        '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#007AFF"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg>',
        // Strategy - 青色棋盘
        '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#5AC8FA"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>'
    ];

    // 创建抽屉HTML结构
    let drawerHTML = `
        <div class="drawer-container group">
            <div class="drawer-icons bg-[#1A1A2A] rounded-r-lg shadow-lg py-2">
                <a href="#" class="category-icon-btn flex items-center justify-center p-3 text-white hover:bg-[#252535] transition-colors" data-category="ALL">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#FFCC00">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                </a>
    `;

    // 添加分类图标
    Array.from(new Set(games.map(game => game.category))).forEach((category, index) => {
        drawerHTML += `
            <a href="#" class="category-icon-btn flex items-center justify-center p-3 text-white hover:bg-[#252535] transition-colors" data-category="${category}">
                ${categoryIcons[index % categoryIcons.length]}
            </a>
        `;
    });

    drawerHTML += `
            </div>
            <div class="drawer-content hidden group-hover:block absolute left-full top-0 bg-[#1A1A2A] rounded-r-lg shadow-lg py-2 min-w-[150px]">
                <a href="#" class="category-btn flex items-center p-3 text-white hover:bg-[#252535] transition-colors" data-category="ALL">
                    <span class="ml-2">ALL</span>
                </a>
    `;

    // 添加分类名称
    Array.from(new Set(games.map(game => game.category))).forEach((category, index) => {
        drawerHTML += `
            <a href="#" class="category-btn flex items-center p-3 text-white hover:bg-[#252535] transition-colors" data-category="${category}">
                <span class="ml-2">${category}</span>
            </a>
        `;
    });

    drawerHTML += `
            </div>
        </div>
    `;

    categoriesSection.innerHTML = drawerHTML;
    
    // 添加CSS样式
    const drawerStyle = document.createElement('style');
    drawerStyle.textContent = `
        .categories-drawer {
            transition: transform 0.3s ease;
        }
        .drawer-container {
            position: relative;
        }
        .drawer-content {
            transition: opacity 0.3s ease, visibility 0.3s;
        }
        /* 调整主内容区域的左边距，为抽屉腾出空间 */
        main.container {
            margin-left: 60px;
            width: calc(100% - 60px);
        }
    `;
    document.head.appendChild(drawerStyle);
    
    // 添加到body
    document.body.appendChild(categoriesSection);
    
    // 添加分类点击事件
    categoriesSection.addEventListener('click', (e) => {
        const categoryBtn = e.target.closest('[data-category]');
        if (categoryBtn) {
            e.preventDefault();
            const category = categoryBtn.dataset.category;
            
            // 如果在详情页，跳转到首页并带上分类参数
            if (window.location.pathname.includes('game.html')) {
                window.location.href = `index.html?category=${encodeURIComponent(category)}`;
            } else {
                // 更新分类标题
                updateCategoryTitle(category);
                
                // 如果点击的是ALL，显示所有游戏
                if (category === 'ALL') {
                    renderGameCards(games);
                } else {
                    const filteredGames = games.filter(game => game.category === category);
                    renderGameCards(filteredGames);
                }
            }
        }
    });
}

// 在 initHomePage 函数中调用 initCategoriesNavigation
async function initHomePage() {
    try {
        const games = gamesConfig.games;
        
        // 初始化分类导航
        initCategoriesNavigation();
        
        // 添加分类标题区域
        const categoryTitleSection = document.createElement('div');
        categoryTitleSection.id = 'category-title';
        categoryTitleSection.className = 'px-4 py-3 mb-4';
        categoryTitleSection.innerHTML = `
            <h3 class="text-xl font-bold text-apple-white">All Games</h3>
            <p class="text-apple-gray-300 text-base mt-1"><span id="games-count"></span> games available</p>
        `;
        
        // 插入分类标题到游戏列表前
        const gamesContainer = document.getElementById('games-container');
        gamesContainer.parentNode.insertBefore(categoryTitleSection, gamesContainer);
        
        // 渲染游戏卡片
        renderGameCards(games);
    } catch (error) {
        console.error('Error initializing home page:', error);
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