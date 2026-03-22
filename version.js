// 版本管理 - 每次更新時修改此檔案
const APP_VERSION = 'v3.4.0';
const BUILD_DATE = '2026-03-22';

// 版本更新日誌
const VERSION_HISTORY = {
  'v3.4.0': {
    date: '2026-03-22',
    changes: [
      '✅ 自動更新機制',
      '✅ 背景靜默更新',
      '✅ 可設定更新行為',
      '✅ 減少使用者操作'
    ]
  },
  'v3.3.0': {
    date: '2026-03-22',
    changes: [
      '✅ 加入智慧更新機制',
      '✅ 自動檢測新版本',
      '✅ 顯示更新提示',
      '✅ 一鍵更新功能'
    ]
  },
  'v3.2.0': {
    date: '2026-03-18',
    changes: [
      '✅ 修正授權域名錯誤',
      '✅ 改進錯誤處理',
      '✅ 更新文件'
    ]
  }
};

// 導出版本資訊
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { APP_VERSION, BUILD_DATE, VERSION_HISTORY };
}
