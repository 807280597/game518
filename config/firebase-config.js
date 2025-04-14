// Firebase配置
const firebaseConfig = {
  apiKey: "AIzaSyAJxk0rcU40DoMfCg4kqQjniNzvZ-w2q8w",
  authDomain: "game518-b6a34.firebaseapp.com",
  projectId: "game518-b6a34",
  storageBucket: "game518-b6a34.firebasestorage.app",
  messagingSenderId: "994952179455",
  appId: "1:994952179455:web:d1d13310dfb53a2a0266ca",
  measurementId: "G-PC66TN3H16"
};

// 注意：此配置文件已保留，但当前网站不使用Firebase功能
console.log('Firebase配置已加载，但当前未使用');

// 初始化Firebase
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    // 设置全局变量
    window.firebaseAuth = firebase.auth();
    
    // 检查 firebase.database 是否存在
    if (typeof firebase.database === 'function') {
        window.firebaseDatabase = firebase.database();
    } else {
        console.warn('Firebase Database 不可用，请确保已加载相应的SDK');
    }
    
    // 触发自定义事件，通知Firebase已准备就绪
    document.dispatchEvent(new Event('firebaseReady'));
} else {
    console.error('Firebase SDK 未加载');
}
