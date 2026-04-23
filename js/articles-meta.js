// 文章元数据（轻量版）
//
// 目的：让算法页"先读一篇原理长文"提示条仅凭几 KB 元数据即可渲染，
// 避免首屏同步加载体量庞大的 articles-data.js（~190KB）。
// 真正的正文会在用户点击"开始阅读"按钮时通过 dynamic import() 懒加载。
//
// 维护约定：在 articles-data.js 中新增文章时，请同步在此补一条记录，
// 字段（title / subtitle / icon / plain.readMinutes / deep.readMinutes）
// 必须与主数据保持一致。

export const ARTICLES_META = {
  bandit: {
    title: '多臂老虎机',
    subtitle: '强化学习最原始的困境：在"已知的好"与"未知的可能更好"之间做抉择',
    icon: '🎰',
    plain: { readMinutes: 5 },
    deep:  { readMinutes: 15 },
  },
  mdp: {
    title: '马尔可夫决策过程',
    subtitle: '让一切决策问题都可以用同一种语言描述',
    icon: '🗺️',
    plain: { readMinutes: 6 },
    deep:  { readMinutes: 16 },
  },
  ppo: {
    title: 'PPO · 近端策略优化',
    subtitle: '工业界最广泛使用的 RL 算法，也是 ChatGPT 背后的那把"剪刀"',
    icon: '✂️',
    plain: { readMinutes: 7 },
    deep:  { readMinutes: 18 },
  },
  intro: {
    title: '初探强化学习',
    subtitle: '在机器学习的版图上，强化学习到底是一块什么样的地盘？',
    icon: '🌱',
    plain: { readMinutes: 6 },
    deep:  { readMinutes: 10 },
  },
  dp: {
    title: '动态规划',
    subtitle: '当你"看透了"环境，就能用最朴素的递推算出最优策略',
    icon: '📐',
    plain: { readMinutes: 6 },
    deep:  { readMinutes: 14 },
  },
  td: {
    title: '时序差分学习',
    subtitle: '不需要环境模型，也不必等到回合结束——每走一步，就学一点',
    icon: '🧗',
    plain: { readMinutes: 7 },
    deep:  { readMinutes: 15 },
  },
  dqn: {
    title: '深度 Q 网络（DQN）',
    subtitle: '把 Q 表换成神经网络，强化学习第一次走进"深度时代"',
    icon: '🧠',
    plain: { readMinutes: 7 },
    deep:  { readMinutes: 15 },
  },
  reinforce: {
    title: 'REINFORCE · 策略梯度',
    subtitle: '不再绕道价值函数，直接对"行为习惯"做梯度上升',
    icon: '🎭',
    plain: { readMinutes: 6 },
    deep:  { readMinutes: 12 },
  },
  ac: {
    title: 'Actor-Critic',
    subtitle: '演员负责演，评论家负责看——两个网络的优雅协作',
    icon: '🎬',
    plain: { readMinutes: 6 },
    deep:  { readMinutes: 14 },
  },
  trpo: {
    title: 'TRPO · 信赖域策略优化',
    subtitle: '在旧策略身边画一个"安全圈"，保证每一步更新都稳步前进',
    icon: '🛡️',
    plain: { readMinutes: 6 },
    deep:  { readMinutes: 14 },
  },
  ddpg: {
    title: 'DDPG · 深度确定性策略梯度',
    subtitle: '把 DQN 的技巧搬进 Actor-Critic，让机器人学会控制连续动作',
    icon: '🤖',
    plain: { readMinutes: 6 },
    deep:  { readMinutes: 13 },
  },
  llm: {
    title: '大模型对齐：RLHF / DPO / GRPO',
    subtitle: '让语言模型"听懂人话"——RL 在 LLM 时代最重要的应用',
    icon: '✨',
    plain: { readMinutes: 8 },
    deep:  { readMinutes: 18 },
  },
  // 注意：rlhf / reward-model / dpo / grpo / align-compare 这 5 个新页
  // 目前共享上面这条 llm 文章作为原理读物（由算法页内 algoKey 去映射）。
  // 如果未来单独写了长文，请在这里补 meta，并在 articles-data.js 补正文。
};

export default ARTICLES_META;