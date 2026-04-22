// 漫画插画资源中心 —— 统一管理所有 AI 生成的图片
//
// 所有图片均通过 generate_picture 工具基于「风格锚点图」生成，
// 保证系列风格一致：低饱和度莫兰迪色、柔和粉/紫/绿/米调、扁平卡通。
//
// 使用方式：
//   import { IMG } from './img-assets.js';
//   { character: IMG.happy }     // 直接作为 comics-data.js 的 character / extras 字段
//
// 所有图片对象都带 fallback（原始 emoji），当 URL 加载失败时会自动降级。
// 若未来要把远程 URL 迁移到本地，仅需修改本文件，无需改其它任何代码。

/**
 * 构造一个图片资源对象
 * @param {string} src  图片 URL
 * @param {string} fallback  加载失败时回退显示的 emoji
 * @param {string} alt  无障碍文本
 */
const img = (src, fallback, alt) => ({ type: 'img', src, fallback, alt });

// —— 主角机器人表情包（8 张，基于 robot-anchor 风格锚点图生成） ——
export const IMG = {
  // 风格锚点（惊讶张嘴款，最完整最萌）
  anchor: img(
    'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/copilot/4615f902-36e0-47a9-acce-1dc17c9d1ab5/7c5d037f9bcf4e4aab5489338ff0f6f5.png',
    '🤖', '学习机器人·锚点形象'
  ),

  // 托腮思考
  thinking: img(
    'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/copilot/baccc6db-565a-47a3-a64d-1b4d2f1e17df/ce7c7ee198d343fe8ef2a70fec29664c.png',
    '🤔', '托腮思考的机器人'
  ),

  // 头顶灯泡·灵光一闪
  idea: img(
    'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/copilot/37ade418-06cd-4679-b84c-049dc3e2e32e/5228b528f94e4d90aaf9de08896e3d7f.png',
    '💡', '灵光一闪的机器人'
  ),

  // 歪头疑惑
  confused: img(
    'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/copilot/f80ab45a-4912-4a72-845b-99cb437bbd70/1b43f0a62795418d917ef4ebeeacd57b.png',
    '🤨', '歪头疑惑的机器人'
  ),

  // 沮丧流泪
  sad: img(
    'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/copilot/6e2e5f6a-a4ed-4afd-92e6-9f32e0e70b37/e80fecb01d8a40abb0ff6cb9e18f1f39.png',
    '😔', '沮丧流泪的机器人'
  ),

  // 开心眯眼笑 + 捧着小书
  happy: img(
    'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/copilot/d8863b85-13e8-42a9-b463-513c0e2e5d7a/278f4ac5bb2f4fadb6e678163752370a.png',
    '😊', '开心微笑的机器人'
  ),

  // 戴头巾·拳头紧握·热血
  fighting: img(
    'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/copilot/07f439fb-ce7e-47b8-abd2-6a8ef65323eb/a38b1af857b349f989331a350c283787.png',
    '💪', '热血加油的机器人'
  ),

  // 举手欢呼·彩纸飞舞
  cheer: img(
    'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/copilot/9f929eb9-ea4c-46ad-b1ba-1a01aca28843/cf8d61fedb8648b29bf451a176748ef6.png',
    '🎉', '举手欢呼的机器人'
  ),

  // 吃惊瞪眼·手举起
  surprised: img(
    'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/copilot/3c86a549-2ba6-4b83-bce8-4d1a884abaaf/39e9e28ef7bc44ebb3bc6d9f3923b155.png',
    '😲', '吃惊的机器人'
  ),

  // —— 场景图（目前只生了 2 张示例，其余仍走 emoji） ——
  banditCasino: img(
    'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/copilot/dffc977d-adb6-4f5b-a6b9-49e08c03edf3/4bb1c3414bcb4f31ae7bbdb05fce4f99.png',
    '🎰', '赌场老虎机场景'
  ),

  mdpMaze: img(
    'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/copilot/99ac827a-228d-47c1-8d13-0b64b9117715/3b63495eafc3450cbf3dec14d587e4bb.png',
    '🗺️', '网格迷宫俯视图'
  ),
};

// 快捷别名（方便语义化使用）
export default IMG;
