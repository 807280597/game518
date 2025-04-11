// 游戏信息转JSON工具

// 游戏分类列表
const GAME_CATEGORIES = [
    "动作", "冒险", "街机", "棋盘", "卡牌", "赛车", "益智", "角色扮演", 
    "射击", "模拟", "体育", "策略", "文字", "休闲", "多人"
];

// 根据游戏标题和描述自动判断游戏分类
function determineGameCategory(title, description) {
    const combinedText = (title + " " + description).toLowerCase();
    
    // 定义关键词与分类的映射
    const categoryKeywords = {
        "动作": ["动作", "格斗", "打斗", "战斗", "combat", "fight", "action"],
        "冒险": ["冒险", "探索", "探险", "adventure", "explore"],
        "街机": ["街机", "复古", "经典", "arcade", "retro", "classic"],
        "棋盘": ["棋盘", "棋类", "象棋", "围棋", "board", "chess"],
        "卡牌": ["卡牌", "纸牌", "扑克", "card", "poker"],
        "赛车": ["赛车", "驾驶", "飙车", "racing", "drive", "car"],
        "益智": ["益智", "解谜", "谜题", "智力", "puzzle", "brain"],
        "角色扮演": ["角色", "扮演", "rpg", "role"],
        "射击": ["射击", "枪战", "射手", "shoot", "gun", "shooter"],
        "模拟": ["模拟", "经营", "建设", "simulation", "simulator", "build"],
        "体育": ["体育", "运动", "足球", "篮球", "sports", "football", "basketball"],
        "策略": ["策略", "战略", "塔防", "strategy", "tower defense"],
        "文字": ["文字", "阅读", "故事", "text", "word", "story"],
        "休闲": ["休闲", "轻松", "简单", "casual", "simple", "easy"],
        "多人": ["多人", "合作", "对战", "multiplayer", "coop", "versus"]
    };
    
    // 计算每个分类的匹配分数
    const scores = {};
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        scores[category] = 0;
        for (const keyword of keywords) {
            if (combinedText.includes(keyword)) {
                scores[category] += 1;
            }
        }
    }
    
    // 找出得分最高的分类
    let bestCategory = "休闲"; // 默认分类
    let highestScore = 0;
    
    for (const [category, score] of Object.entries(scores)) {
        if (score > highestScore) {
            highestScore = score;
            bestCategory = category;
        }
    }
    
    return bestCategory;
}

// 从iframe中提取游戏URL
function extractGameUrl(iframeCode) {
    const srcMatch = iframeCode.match(/src=["']([^"']+)["']/);
    if (srcMatch && srcMatch[1]) {
        return srcMatch[1];
    }
    return "";
}

// 生成随机评分 (4.0-5.0)
function generateRandomRating() {
    return (4 + Math.random()).toFixed(1);
}

// 生成随机游玩次数 (100+)
function generateRandomPlayCount() {
    return Math.floor(Math.random() * 10000) + 100;
}

// 生成游戏ID (基于当前时间戳)
function generateGameId() {
    return Date.now();
}

// 格式化当前日期为ISO格式 (YYYY-MM-DD)
function formatCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

// 游戏数据存储
let generatedGames = [];

// 创建游戏JSON对象
function createGameJson(gameData) {
    const gameId = generateGameId();
    const gameUrl = extractGameUrl(gameData.gameUrl);
    const category = gameData.category || determineGameCategory(gameData.title, gameData.description);
    const rating = gameData.rating || generateRandomRating();
    const playCount = gameData.playCount || generateRandomPlayCount();
    
    const gameJson = {
        id: gameId,
        title: gameData.title,
        shortDescription: gameData.description,
        fullDescription: gameData.instructions || gameData.description,
        imageUrl: gameData.imageUrl || "https://via.placeholder.com/800x450?text=" + encodeURIComponent(gameData.title),
        category: category,
        rating: parseFloat(rating),
        playCount: parseInt(playCount),
        releaseDate: formatCurrentDate(),
        iframeUrl: gameUrl
    };
    
    generatedGames.push(gameJson);
    return gameJson;
}

// 生成完整的游戏JSON代码
function generateGameJsonCode() {
    let jsonOutput = "";
    
    generatedGames.forEach((game, index) => {
        jsonOutput += JSON.stringify(game, null, 2);
        if (index < generatedGames.length - 1) {
            jsonOutput += ",\n";
        }
    });
    
    return jsonOutput;
}

// 重置生成的游戏数据
function resetGeneratedGames() {
    generatedGames = [];
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 填充分类下拉框
    const categorySelect = document.getElementById('game-category');
    if (categorySelect) {
        GAME_CATEGORIES.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
    
    // 表单提交处理
    const gameForm = document.getElementById('game-form');
    const outputContainer = document.getElementById('json-output');
    const gameList = document.getElementById('game-list');
    const noGamesMsg = document.getElementById('no-games');
    
    if (gameForm) {
        gameForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const gameData = {
                title: document.getElementById('game-title').value,
                description: document.getElementById('game-description').value,
                instructions: document.getElementById('game-instructions').value,
                imageUrl: document.getElementById('game-image').value,
                gameUrl: document.getElementById('game-url').value,
                category: document.getElementById('game-category').value
            };
            
            if (!gameData.title || !gameData.description) {
                alert('请至少填写游戏标题和描述！');
                return;
            }
            
            const gameJson = createGameJson(gameData);
            
            // 隐藏"暂无游戏"提示
            if (noGamesMsg) {
                noGamesMsg.style.display = 'none';
            }
            
            // 添加到游戏列表
            const gameItem = document.createElement('div');
            gameItem.className = 'bg-white p-4 rounded-lg shadow mb-4';
            gameItem.innerHTML = `
                <h3 class="font-bold text-lg">${gameJson.title}</h3>
                <p class="text-sm text-gray-600 mb-2">${gameJson.shortDescription.substring(0, 100)}${gameJson.shortDescription.length > 100 ? '...' : ''}</p>
                <div class="flex justify-between text-sm">
                    <span class="bg-apple-blue text-white px-2 py-1 rounded">${gameJson.category}</span>
                    <span>评分: ${gameJson.rating}</span>
                </div>
            `;
            gameList.appendChild(gameItem);
            
            // 更新JSON输出
            outputContainer.textContent = generateGameJsonCode();
            
            // 重置表单
            gameForm.reset();
        });
    }
    
    // 复制按钮
    const copyButton = document.getElementById('copy-json');
    if (copyButton) {
        copyButton.addEventListener('click', function() {
            const jsonText = outputContainer.textContent;
            if (jsonText) {
                navigator.clipboard.writeText(jsonText)
                    .then(() => alert('JSON代码已复制到剪贴板！'))
                    .catch(err => alert('复制失败: ' + err));
            } else {
                alert('没有可复制的JSON代码！');
            }
        });
    }
    
    // 重置按钮
    const resetButton = document.getElementById('reset-json');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            if (confirm('确定要清空所有已生成的游戏数据吗？')) {
                resetGeneratedGames();
                outputContainer.textContent = '';
                gameList.innerHTML = '';
                noGamesMsg.style.display = 'block';
            }
        });
    }
});