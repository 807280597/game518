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

// 初始化Firebase
firebase.initializeApp(firebaseConfig);

// 初始化数据库引用
const database = firebase.database();

// 创建messages节点（如果不存在）
database.ref('messages').once('value')
    .then((snapshot) => {
        if (!snapshot.exists()) {
            database.ref('messages').set({
                created: new Date().toISOString()
            });
        }
    });
