// 所有算法的漫画剧本集中管理（详尽版：每部 14-20 格，层层递进讲清原理）
// 结构见 comic-engine.js 头部注释
//
// 💡 character 字段既支持字符串 emoji（'🤖'），也支持图片对象（IMG.happy）。
//    引擎会优先渲染图片；图片加载失败时会自动降级到 fallback emoji。
import { IMG } from './img-assets.js';

export const COMICS = {
  // ========== 第一篇 · 多臂老虎机 ==========
  bandit: {
    chapter: '第一篇 · 基础概念',
    title: '探索君 vs 利用哥 · 老虎机的两难',
    frames: [
      {
        subtitle: '场景引入',
        character: IMG.banditCasino,
        narrator: '想象你走进一家赌场，面前有 5 台外表一模一样的老虎机。每台中奖的概率都不同，但你完全不知道。你只有 100 次投币机会，想拿最多的钱。',
        bg: 'linear-gradient(135deg,#fde68a,#fca5a5)',
        extras: '<div style="position:absolute;left:20px;top:20px;font-size:2.2rem">🎲</div><div style="position:absolute;right:20px;top:20px;font-size:2.2rem">💰</div>',
      },
      {
        subtitle: '为什么这是个真问题',
        character: IMG.thinking,
        narrator: '这看上去像个赌博问题，但它其实是强化学习最核心的缩影：你通过"做动作→看反馈"来学习，没有老师告诉你正确答案，只有奖励信号。',
        note: '强化学习 ≠ 监督学习：没有标注数据，只有"做了才知道"的奖励。',
      },
      {
        subtitle: '两个极端人物登场',
        character: '🧒',
        side: 'left',
        bubble: '我是<b>探索君</b>！每次都随机选一台，这样才能知道哪台真的好。',
        narrator: '"探索"（Exploration）= 主动尝试未知选项，收集更多信息。',
      },
      {
        subtitle: '',
        character: '🧔',
        side: 'right',
        bubble: '我是<b>利用哥</b>！我记录每台的平均收益，每次都选目前平均最高的那台。',
        narrator: '"利用"（Exploitation）= 根据当前知识，做目前看起来最好的选择。',
      },
      {
        subtitle: '两人都会失败',
        character: IMG.sad,
        narrator: '探索君永远学不到稳定收益（一直在乱试），利用哥可能被前几次运气骗到（3 号机头两把中了，就死认它，错过真正的金矿 5 号机）。',
        warning: '纯探索 = 浪费机会；纯利用 = 被假信号锁死。这就是"探索-利用两难"。',
        bg: 'linear-gradient(135deg,#ddd6fe,#fbcfe8)',
      },
      {
        subtitle: '策略 1：ε-贪心',
        character: '⚖️',
        side: 'left',
        bubble: '我来调停！大部分时间（概率 1-ε）听利用哥的，偶尔（概率 ε）掷个骰子听探索君的。',
        math: 'A_t = { argmax_a Q̂(a),  概率 1-ε<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;随机选,  概率 ε }',
        note: 'ε 通常取 0.1。训练一段时间后，可以让 ε 逐渐衰减（越来越少探索）。',
      },
      {
        subtitle: '价值是怎么估计的',
        character: '📊',
        narrator: '我们用"过去所有在 a 动作上拉到的平均奖励"来估计 Q̂(a)：Q̂(a) = (累计奖励) / (选择次数)。选得越多次，估计越准。',
        math: 'Q̂(a) ← Q̂(a) + 1/N(a) · (R - Q̂(a))',
      },
      {
        subtitle: '策略 2：UCB',
        character: '📈',
        narrator: 'UCB（上置信界）比 ε-贪心更聪明：给"试得少"的动作额外加一个"不确定性奖励"，逼着自己去探索冷门。',
        math: 'A_t = argmax_a [ Q̂(a) + c·√(ln(t) / N(a)) ]',
        bg: 'linear-gradient(135deg,#bbf7d0,#a7f3d0)',
        note: 'N(a) 越小 → 加分越高 → 越容易被选中。这样冷门动作自动得到探索。',
      },
      {
        subtitle: '策略 3：Thompson 采样',
        character: '🎲',
        side: 'right',
        bubble: '我最优雅！为每台老虎机维护一个 Beta 分布（"中奖概率的可能性分布"），每次从每个分布里随机采样一次，选最大的那个。',
        narrator: '越不确定的动作，分布越宽，偶尔能采样到很高的值，被选中概率提升。',
        note: '这是贝叶斯思想：我们不仅估计"平均"，还估计"有多确定"。',
      },
      {
        subtitle: '三种策略对比',
        character: '🏆',
        compare: [
          { title: 'ε-贪心', body: '简单易实现，但"笨拙探索"（冷热门一视同仁）' },
          { title: 'UCB', body: '确定性策略，理论保证强（regret 上界为 O(log t)）' },
          { title: 'Thompson', body: '采样即决策，经验效果通常最好' },
        ],
      },
      {
        subtitle: '衡量好坏：Regret（后悔值）',
        character: '📉',
        narrator: '如何评判策略好不好？看"后悔值"：如果当初每次都选最优机器能拿多少奖励，减去你实际拿到的。好的算法 regret 增长要慢（甚至对数级）。',
        math: 'Regret(T) = T · μ* − Σ_t 𝔼[R_t]',
      },
      {
        subtitle: '这和强化学习的联系',
        character: '🔗',
        narrator: '多臂老虎机是最简单的 RL：只有一个状态（赌场里），动作集固定，反馈立即。但它揭示了 RL 永恒的主题——探索和利用的权衡。',
        bg: 'linear-gradient(135deg,#c7d2fe,#ddd6fe)',
        note: '后面学的每个算法（Q-Learning、PPO、DQN…）都要用某种方式解决这个两难。',
      },
      {
        subtitle: '工业界应用',
        character: '💼',
        narrator: '这不是玩具问题！A/B 测试、广告推荐、新闻推送、医疗试验……都在用老虎机算法。淘宝首页"猜你喜欢"的背后，就有 Thompson 采样的身影。',
      },
      {
        subtitle: '🎯 三策略速记',
        character: '🎰',
        narrator: '想象你真在赌场 K 台老虎机前——<b>ε-贪心</b>：90% 拉目前最赚的那台，10% 随机试别的。<b>UCB</b>：拉得少的机器自动加"不确定性奖金"，逼你去试冷门。<b>Thompson</b>：为每台维护一个 Beta 分布，每次从中采样后取最大。三种策略，同一个目标——在"探索"与"利用"间找平衡。',
        bg: 'linear-gradient(135deg,#fef3c7,#fce7f3)',
        note: '这三种策略在真实世界里随处可见：广告点击率测试、新闻 App 推送、电商"猜你喜欢"，都是 Bandit 的舞台。',
      },
      {
        poster: {
          title: '🏆 一句话精髓',
          slogan: '强化学习的第一课：在"已知的好"与"未知的可能更好"之间做抉择。',
          formula: 'A_t = argmax Q̂(a) + <span class="text-pink-500 font-bold">探索奖励项</span>',
          cta: { href: '#', text: '🎮 动手玩老虎机' },
        },
        character: IMG.cheer,
        bg: 'linear-gradient(135deg,#fef3c7,#fce7f3)',
      },
    ],
  },

  // ========== 第二篇 · MDP ==========
  mdp: {
    chapter: '第二篇 · 表格型方法',
    title: '机器人小马的迷宫日记 · MDP 五元组',
    frames: [
      {
        subtitle: '从老虎机到迷宫',
        character: '🔄',
        narrator: '老虎机只有一个状态（你站在机器前）。但真实世界里，每一步会改变"你处在哪里"——比如开车、下棋、走迷宫。这就需要"状态"概念。',
        bg: 'linear-gradient(135deg,#fde68a,#fca5a5)',
      },
      {
        subtitle: '认识机器人小马',
        character: IMG.mdpMaze,
        narrator: '小马站在一个 4×4 的网格世界。目标：找到右下角的宝藏 💎。陷阱：避开地雷 💣。',
        bg: 'linear-gradient(135deg,#dbeafe,#e0e7ff)',
        extras: '<div style="position:absolute;right:15px;bottom:15px;font-size:3rem">💎</div><div style="position:absolute;left:50%;top:40%;font-size:2rem">💣</div>',
      },
      {
        subtitle: '要素 ①：状态 S',
        character: '📍',
        side: 'left',
        bubble: '我此刻所在的格子，就叫"状态 s"。这个 4×4 世界一共有 16 个状态，编号 (0,0)…(3,3)。',
        note: '状态包含"当前情况的全部必要信息"。现实中可能是图像、雷达数据、游戏画面。',
      },
      {
        subtitle: '要素 ②：动作 A',
        character: '🎮',
        side: 'right',
        bubble: '在每个状态，我可以选 4 个动作：↑ → ↓ ←。这叫"动作空间 A"。',
        note: '动作也可以是连续的（后面的 DDPG 会讲），比如转方向盘多少度。',
      },
      {
        subtitle: '要素 ③：转移概率 P',
        character: '⚠️',
        narrator: '现实世界不总听话——我想向右，可能因为地面打滑向上了。这叫"环境的随机性"，用转移概率 P(s\'|s,a) 描述。',
        math: 'P(向上|想向右, 状态s) = 0.1<br>P(向右|想向右, 状态s) = 0.8<br>P(向下|想向右, 状态s) = 0.1',
        bg: 'linear-gradient(135deg,#fed7aa,#fecaca)',
      },
      {
        subtitle: '要素 ④：即时奖励 R',
        character: '🏆',
        side: 'left',
        bubble: '我每走一步 -1 分（鼓励快点）。踩到宝藏 +10 分。踩到陷阱 -10 分。',
        narrator: '"奖励函数 R(s,a,s\')"是环境给你的评价信号。它是 RL 的唯一学习来源。',
        note: '设计奖励是门艺术——奖励给得不好，智能体可能学到奇怪的捷径。',
      },
      {
        subtitle: '要素 ⑤：折扣因子 γ',
        character: '🔮',
        narrator: '今天的 10 元比明天的 10 元"更值钱"。我们用 γ ∈ [0,1] 给未来奖励打折：γ=0.9 → 一步后的奖励只计 90%。',
        math: 'G_t = R_t+1 + γ·R_t+2 + γ²·R_t+3 + ...',
        note: 'γ 越接近 1 → 越有耐心；越接近 0 → 越急功近利。',
        bg: 'linear-gradient(135deg,#fef3c7,#fde68a)',
      },
      {
        subtitle: '合起来：MDP 五元组',
        character: '📦',
        narrator: '<b>MDP = ⟨ S, A, P, R, γ ⟩</b>。任何决策问题，只要能写成这五个元素，就能用 RL 方法求解。',
        note: '"马尔可夫性"的意思是：下一状态只取决于当前状态和动作，与历史无关。',
      },
      {
        subtitle: '策略 π：行动规则',
        character: '🧭',
        side: 'left',
        bubble: '"策略 π(a|s)"告诉我在每个状态 s 下，选动作 a 的概率。有确定性策略（π(s)=a）和随机策略两种。',
        math: 'π(左|状态(1,1)) = 0.7, π(上|状态(1,1)) = 0.3',
      },
      {
        subtitle: '状态价值 V(s)',
        character: '💰',
        side: 'right',
        bubble: '"V^π(s)"表示：如果我站在状态 s，按策略 π 走下去，平均能赚多少未来奖励（折扣后求和）。',
        math: 'V^π(s) = 𝔼_π [ Σ γ^k · R_{t+k+1} | s_t = s ]',
      },
      {
        subtitle: '动作价值 Q(s,a)',
        character: '🎯',
        narrator: '"Q^π(s,a)"比 V 多了一个动作：站在 s，<b>先做动作 a，然后再按 π 走</b>，期望能赚多少。它是后续 Q-Learning 的核心。',
        math: 'Q^π(s,a) = 𝔼 [ R + γ·V^π(s\') | s,a ]',
      },
      {
        subtitle: '贝尔曼方程',
        character: '🧮',
        side: 'left',
        bubble: '价值函数满足一个自洽方程：<b>现在的价值 = 即时奖励 + γ · 下一状态的价值</b>。这就是著名的贝尔曼方程！',
        math: 'V^π(s) = Σ_a π(a|s) Σ_{s\'} P(s\'|s,a) · [ R + γ · V^π(s\') ]',
        note: '别被公式吓到：它的意思就是"递归定义"。后面所有算法都是在解这个方程。',
      },
      {
        subtitle: '什么叫最优策略',
        character: '🏆',
        narrator: '如果一个策略 π* 在所有状态下都比其他策略的 V 大，它就是最优策略。对应的 V* 和 Q* 满足"贝尔曼最优方程"（max 取代求和）。',
        math: 'V*(s) = max_a Σ_{s\'} P(s\'|s,a) · [ R + γ · V*(s\') ]',
        bg: 'linear-gradient(135deg,#bbf7d0,#a7f3d0)',
      },
      {
        subtitle: 'γ 的直观作用',
        character: '🌡️',
        narrator: 'γ 越大，V 的数值越大，影响越靠远的未来。在网格世界里，它决定价值热力图的"扩散范围"。动动滑块看看！',
        note: '主可视化页面可以直接拖动 γ 滑块，观察 V 热力图如何变化。',
      },
      {
        subtitle: '🚗 自动驾驶彩蛋',
        character: '🚗',
        narrator: '回到我们的自动驾驶小车——城市里每个路口就是一个<b>状态</b>，直行/左转/右转就是<b>动作</b>，路况好坏决定了<b>转移概率</b>（想左转但被堵），通勤时间就是<b>奖励</b>。MDP 五元组 ⟨S,A,P,R,γ⟩ 完美描述了"在城市里开车到公司"这个决策问题。自动驾驶的路径规划，本质上就是在求解一个超大规模的 MDP！',
        bg: 'linear-gradient(135deg,#ecfdf5,#f0f9ff)',
      },
      {
        poster: {
          title: '🗺️ MDP 精髓',
          slogan: '把"决策问题"翻译成数学：状态、动作、奖励、转移，再加一点折扣。',
          formula: 'V*(s) = max_a Σ P(s\'|s,a)·[ R + γ·V*(s\') ]',
          cta: { href: '#', text: '🎮 去网格世界点点看' },
        },
        character: IMG.cheer,
      },
    ],
  },

  // ========== 第二篇 · 动态规划 ==========
  dp: {
    chapter: '第二篇 · 表格型方法',
    title: '预言家的"向未来借智慧" · DP 如何解 MDP',
    frames: [
      {
        subtitle: '场景：上帝视角',
        character: '🔮',
        narrator: '假设我们"上帝视角"：完全知道环境的 P（转移概率）和 R（奖励函数）。这叫"Model-based"设置。在这种情况下，我们能不能直接算出最优策略？',
        bg: 'linear-gradient(135deg,#e9d5ff,#fce7f3)',
        note: '现实中 P 和 R 常常未知 —— 但理解 DP 是学习 RL 的基础。',
      },
      {
        subtitle: '核心思想：分而治之',
        character: '🧩',
        narrator: '贝尔曼方程告诉我们：<b>"当前状态的价值 = 即时奖励 + γ × 未来状态的价值"</b>。这是一个递归定义 —— 我们可以通过迭代来求解！',
      },
      {
        subtitle: '方法 A：策略迭代（Policy Iteration）',
        character: '🔄',
        side: 'left',
        bubble: '分两步走：先评估当前策略，再贪心改进，循环往复。',
        math: '评估：V^π(s) ← Σ_a π(a|s)·Σ P(s\'|s,a)·[R + γV^π(s\')]<br>改进：π\'(s) = argmax_a Q^π(s,a)',
      },
      {
        subtitle: '步骤 1：策略评估',
        character: '📋',
        narrator: '固定策略 π，反复迭代贝尔曼方程，直到 V 稳定（Δ < 阈值）。这是"精确算出这个策略有多好"的过程。',
        note: '类比：你有个固定驾车路线，反复模拟几百次，算出平均到达时间。',
      },
      {
        subtitle: '步骤 2：策略改进',
        character: '🎯',
        narrator: '在每个状态，把当前策略的动作换成"贪心选 Q 最大的动作"。数学上可以证明：新策略 π\' 不会比 π 差。',
        note: '这叫"策略改进定理"—— 贪心地替换动作，价值只升不降。',
      },
      {
        subtitle: '评估 → 改进 → 评估 → 改进...',
        character: '⚙️',
        narrator: '不断循环。如果某次改进后策略没变化（已经全贪心了），说明已经找到最优策略 π*。',
        bg: 'linear-gradient(135deg,#bbf7d0,#a7f3d0)',
      },
      {
        subtitle: '问题：评估太贵',
        character: IMG.surprised,
        warning: '策略评估要跑到完全收敛（几百次内循环），再做一次改进—— 太慢了！能不能省掉？',
      },
      {
        subtitle: '方法 B：价值迭代（Value Iteration）',
        character: '⚡',
        side: 'right',
        bubble: '评估和改进合二为一！每步直接用 max 操作：不求 π 的期望，而是取所有动作中最大的 Q 值。',
        math: 'V(s) ← max_a Σ P(s\'|s,a)·[ R + γ·V(s\') ]',
        note: '相当于每一步都做"1 次评估 + 1 次改进"，效率更高。',
      },
      {
        subtitle: '两者的关系',
        character: '🤝',
        compare: [
          { title: '🔄 策略迭代', body: '内循环评估到收敛，外循环改进。迭代次数少但每步贵。' },
          { title: '⚡ 价值迭代', body: '每次更新都 max。迭代次数多但每步便宜。' },
        ],
        note: '两者都保证收敛到 V* 和 π*，只是路径不同。',
      },
      {
        subtitle: '收敛性的保证',
        character: '📐',
        narrator: '贝尔曼更新是"γ-压缩映射"：每次更新后与真值的距离至少缩小 γ 倍。由巴拿赫不动点定理，迭代必然收敛到唯一解 V*。',
        math: '||V_{k+1} - V*|| ≤ γ · ||V_k - V*||',
      },
      {
        subtitle: 'γ 对收敛速度的影响',
        character: '🎚️',
        narrator: 'γ 越大（如 0.99），需要的迭代次数越多（因为要传递的信息走得更远）。γ 越小，收敛越快但策略越"短视"。',
        note: '主可视化页面可以拖动 γ，观察收敛曲线（Δ 值）的变化。',
      },
      {
        subtitle: 'DP 的局限',
        character: '🚫',
        warning: '① 要求知道完整环境模型 P 和 R（现实常常未知）<br>② 要求遍历所有状态（状态太多时 intractable）',
        narrator: '所以下一讲"时序差分"出场：不需要环境模型，边走边学！',
      },
      {
        subtitle: '🚗 自动驾驶彩蛋',
        character: '🚗',
        narrator: '回到我们的自动驾驶小车——如果你有一张<b>完美的城市地图</b>（知道每条路的距离、红绿灯时长、堵车概率），你就可以像高德地图一样<b>坐在家里倒推最优路线</b>。策略迭代 = 先算当前路线的平均通勤时间，再在每个路口贪心选最快方向，反复直到路线不变。这就是动态规划在自动驾驶离线规划中的应用！',
        bg: 'linear-gradient(135deg,#ecfdf5,#f0f9ff)',
      },
      {
        poster: {
          title: '📐 DP 的灵魂',
          slogan: '把大问题拆成"现在的奖励 + 未来最优子问题"，然后自下而上地求解。',
          formula: 'V*(s) = max_a Σ P(s\'|s,a) · [ R + γ · V*(s\') ]',
          cta: { href: '#', text: '🎮 观察价值收敛' },
        },
        character: IMG.cheer,
      },
    ],
  },

  // ========== 第二篇 · 时序差分 ==========
  td: {
    chapter: '第二篇 · 表格型方法',
    title: '萨拉 vs Q酱 · 悬崖边的 TD 之战',
    frames: [
      {
        subtitle: '动机：DP 的尴尬',
        character: IMG.confused,
        narrator: 'DP 需要环境模型 P 和 R。但现实中：一盘围棋你不知道所有落子的转移概率；开车你不知道每条路的拥堵规律。能不能"边走边学"？',
        bg: 'linear-gradient(135deg,#fde68a,#fca5a5)',
      },
      {
        subtitle: '思路：样本代替期望',
        character: IMG.idea,
        narrator: 'DP 里 V(s) = 𝔼[R + γ·V(s\')]。我们不知道 𝔼 怎么算，那就用采样值来估计！走一步 → 得到一个 (s, a, r, s\') 样本 → 用它更新 V。',
      },
      {
        subtitle: '核心：TD 误差',
        character: '⚡',
        narrator: '定义 TD 误差 δ = r + γV(s\') − V(s)。它衡量"当前估计"和"一步后修正估计"之间的差距。',
        math: 'V(s) ← V(s) + α · δ',
        note: 'α 是学习率，通常取 0.1~0.5。δ 就像误差信号，告诉我们 V(s) 估计偏多还是偏少。',
      },
      {
        subtitle: 'TD 和蒙特卡洛的对比',
        compare: [
          { title: '🎲 蒙特卡洛', body: '走完整轨迹 → 用实际总回报 G_t 更新。无偏但高方差，必须等结束。' },
          { title: '⚡ TD(0)', body: '走 1 步 → 用 r + γV(s\') 更新。低方差但有偏，每步都能更新。' },
        ],
        note: 'TD(λ) 是二者的连续混合，λ=0 是 TD(0)，λ=1 是蒙特卡洛。',
      },
      {
        subtitle: '悬崖行走环境',
        character: '🧗',
        narrator: '左下是起点 🏁，右下是终点 💎，底部一整排是悬崖 🔥。掉悬崖：-100 分，立即送回起点。每走一步：-1 分。',
        bg: 'linear-gradient(135deg,#fecaca,#fed7aa)',
        extras: '<div style="position:absolute;bottom:10px;left:0;right:0;height:20px;background:repeating-linear-gradient(45deg,#991b1b 0,#991b1b 10px,#7f1d1d 10px,#7f1d1d 20px);border-radius:8px;"></div>',
      },
      {
        subtitle: '算法一：Q-Learning（Off-policy）',
        character: '🦸',
        side: 'right',
        bubble: '我是 Q 酱！我用"下一状态能取到的最大 Q 值"来更新，不管我实际下一步做什么。',
        math: 'Q(s,a) ← Q(s,a) + α [ r + γ · <b>max_{a\'} Q(s\',a\')</b> − Q(s,a) ]',
        note: '"Off-policy" = 执行策略（带 ε 探索）和目标策略（贪心）不同。',
      },
      {
        subtitle: '算法二：SARSA（On-policy）',
        character: '👧',
        side: 'left',
        bubble: '我是萨拉。我用"下一步实际选的动作 a\'" 来更新——注意我包含了 ε 探索的影响！',
        math: 'Q(s,a) ← Q(s,a) + α [ r + γ · <b>Q(s\',a\')</b> − Q(s,a) ]',
        note: '"On-policy" = 学什么策略就用什么策略执行。所以 SARSA 考虑了"我自己会探索"这个事实。',
      },
      {
        subtitle: '为什么名字叫 SARSA',
        character: '🔤',
        narrator: 'SARSA 这 5 个字母代表更新需要用到的五元组：<b>S</b>tate, <b>A</b>ction, <b>R</b>eward, next <b>S</b>tate, next <b>A</b>ction。',
      },
      {
        subtitle: '训练过程的差异',
        character: '🎭',
        compare: [
          { title: '🦸 Q-Learning 训练时', body: '认为自己下一步会选最优，忽视 ε 探索。路径贴着悬崖走（最优！），但实际探索时经常掉下去。' },
          { title: '👧 SARSA 训练时', body: '包含了自己会乱走的事实，害怕掉悬崖，走"安全路线"——绕远一点但不会摔死。' },
        ],
        bg: 'linear-gradient(135deg,#fef3c7,#fde68a)',
      },
      {
        subtitle: '收敛后的区别',
        character: '📊',
        narrator: '如果 ε 逐渐衰减到 0，两个算法都收敛到最优。但如果 ε 保持为正（比如 0.1），SARSA 学到的是"带探索的最优"，Q-Learning 学到的是"纯最优"但执行时仍有悬崖风险。',
      },
      {
        subtitle: '累积奖励曲线的差异',
        character: '📈',
        narrator: 'Q-Learning 的理论最优值更高，但训练时的实际累积奖励常常低于 SARSA—— 因为它更频繁地掉悬崖。主可视化页面会同时训练两人，你能看到这个差异！',
      },
      {
        subtitle: '超参数 α 和 ε',
        compare: [
          { title: 'α（学习率）', body: '大则学得快但可能震荡；小则稳但慢。通常取 0.1–0.5。' },
          { title: 'ε（探索率）', body: '大则爱冒险；小则爱守成。通常从 1.0 衰减到 0.01。' },
        ],
      },
      {
        subtitle: 'TD 思想的普遍性',
        character: '🌐',
        narrator: 'TD 不仅用在 Q 学习里，后面的 DQN、Actor-Critic、PPO 的 Critic 部分，统统都在用 TD 误差。可以说 TD 是深度 RL 的基石。',
        bg: 'linear-gradient(135deg,#c7d2fe,#ddd6fe)',
      },
      {
        subtitle: '🚗 自动驾驶彩蛋',
        character: '🚗',
        narrator: '回到我们的自动驾驶小车——没有地图，只能边开边学。<b>SARSA 是你妈开车</b>："慢慢开，离事故多发路段远点！"——保守但安全。<b>Q-Learning 是老司机</b>："贴着边开最快！"——理论最优但训练时常出事。现实中 L4 自动驾驶通常选 SARSA 风格，因为一次事故的代价远大于多走 5 分钟。',
        bg: 'linear-gradient(135deg,#ecfdf5,#f0f9ff)',
      },
      {
        poster: {
          title: '🧗 时序差分精髓',
          slogan: '不必等回合结束 —— 每走一步，就用"下一步估计"修正"当前估计"。',
          formula: 'TD 误差 δ = r + γ · V(s\') − V(s)',
          cta: { href: '#', text: '🎮 看萨拉与 Q 酱赛跑' },
        },
        character: '🏁',
      },
    ],
  },

  // ========== 第三篇 · DQN ==========
  dqn: {
    chapter: '第三篇 · 深度强化学习',
    title: '大脑君的记忆宫殿 · 当 Q 表装不下世界',
    frames: [
      {
        subtitle: '问题：Q 表爆炸',
        character: IMG.surprised,
        narrator: 'Atari 游戏的画面是 210×160×3 像素，即使每个像素只有 2 种值，状态数也是 2^(210×160×3) ≈ 10^30000 个。Q 表根本存不下。',
        bg: 'linear-gradient(135deg,#fecaca,#fed7aa)',
      },
      {
        subtitle: '思路：函数近似',
        character: IMG.idea,
        narrator: '既然存不下，就不要"记录"每个 (s,a) → Q，而是"学习"一个函数 Q(s,a; θ) ≈ 真实 Q 值。参数 θ 就是神经网络的权重。',
        note: '从"查表"变成"拟合"——这是从表格型 RL 进入深度 RL 的一大步。',
      },
      {
        subtitle: '最直白的想法',
        character: '🧠',
        side: 'left',
        bubble: '我是大脑君（神经网络）！输入状态 s，输出每个动作的 Q 值 Q(s, a_1), Q(s, a_2), ... 训练用 TD 误差做 MSE 损失就行。',
        math: 'L(θ) = (r + γ·max_{a\'} Q(s\',a\'; θ) − Q(s,a; θ))²',
      },
      {
        subtitle: '问题 1：数据相关性',
        character: '🌀',
        warning: '连续几帧游戏画面高度相似，用它们做 mini-batch 训练会让梯度方向偏斜，神经网络震荡难以收敛。',
      },
      {
        subtitle: '武器 1：经验回放池',
        character: '📚',
        side: 'right',
        bubble: '每一步经验 (s, a, r, s\') 我都存进我这个 10^6 大小的水池。训练时随机抽一批——数据相关性被打破！',
        note: '这叫 Experience Replay。还有个额外好处：每条经验能被用多次，数据利用率高。',
      },
      {
        subtitle: '问题 2：目标飘移',
        character: IMG.confused,
        warning: '损失函数里 Q(s\',a\';θ) 也在用 θ 计算—— 训练时 θ 一更新，目标也跟着变，像"追自己影子"！',
      },
      {
        subtitle: '武器 2：目标网络',
        character: '👯',
        narrator: '再复制一个"冷静双胞胎"网络 Q̂（参数 θ⁻），专门用来算 TD 目标。主网络频繁更新，双胞胎每 N 步才同步一次。',
        math: 'L = ( r + γ·max_{a\'} Q̂(s\',a\'; θ⁻) − Q(s,a; θ) )²',
        note: 'θ⁻ 几千步才同步一次，保证目标稳定，训练收敛。',
        bg: 'linear-gradient(135deg,#bfdbfe,#ddd6fe)',
      },
      {
        subtitle: '完整训练循环',
        character: '⚙️',
        narrator: '① 用 ε-贪心策略和环境交互 → ② 经验存入回放池 → ③ 从池中采样 batch → ④ 计算 TD 目标（用目标网络）→ ⑤ 梯度下降更新主网络 → ⑥ 每 N 步同步目标网络',
      },
      {
        subtitle: '问题 3：Q 值过估计',
        character: '📈',
        warning: 'max 操作会系统性高估 Q 值（因为 max 对噪声敏感），导致策略"过于自信"。',
      },
      {
        subtitle: '改进：Double DQN',
        character: '🎯',
        narrator: 'Double DQN：用主网络"选动作"，用目标网络"评估"这个动作。把选择和评估分开，减小过估计偏差。',
        math: 'y = r + γ · Q̂(s\', argmax_{a\'} Q(s\',a\'; θ); θ⁻)',
      },
      {
        subtitle: '改进：Dueling DQN',
        character: '🔀',
        narrator: 'Dueling：把 Q 拆成 V(s) + A(s,a)。V 描述"这个状态值多少"，A 描述"每个动作相对好多少"。很多状态下动作差异不大，这样分解更高效。',
        math: 'Q(s,a) = V(s) + ( A(s,a) − mean_a A(s,a) )',
      },
      {
        subtitle: '改进：优先经验回放',
        character: '⭐',
        narrator: 'Prioritized Replay：TD 误差大的经验更值得学习，采样概率正比于 |δ|。让智能体"重点复习错题"。',
      },
      {
        subtitle: '历史意义',
        character: '🏛️',
        narrator: '2013 年 DeepMind 用 DQN 通杀 49 款 Atari 游戏，很多表现超过人类。这是深度 RL 破冰之战，也是 AlphaGo 的技术前身。',
        bg: 'linear-gradient(135deg,#bbf7d0,#a7f3d0)',
      },
      {
        subtitle: 'DQN 的局限',
        character: '🚫',
        warning: '① 只能处理离散动作（机械臂转角度不行）<br>② 对超参数敏感（学习率、γ、回放池大小都要调）<br>③ 样本利用率仍不够高',
        narrator: '于是后面出现了策略梯度、DDPG、PPO 等进化版。',
      },
      {
        subtitle: '🚗 自动驾驶彩蛋',
        character: '🚗',
        narrator: '回到我们的自动驾驶小车——城市路口上万个，Q 表根本记不下。更何况自动驾驶看到的是<b>摄像头画面（像素）</b>！DQN 用神经网络代替 Q 表，输入摄像头画面，输出每个方向的分数。<b>经验回放</b>就像行车记录仪，随机回放历史片段防止只记最近的路。<b>目标网络</b>就像一个"冷静的副驾"，防止自己给自己打分越打越高。',
        bg: 'linear-gradient(135deg,#ecfdf5,#f0f9ff)',
      },
      {
        poster: {
          title: '🧠 DQN 三件套',
          slogan: '神经网络 + 经验回放 + 目标网络 = 深度强化学习破冰之作。',
          formula: 'L(θ) = 𝔼[( r + γ · max Q̂(s\',a\'; θ⁻) − Q(s,a; θ) )²]',
          cta: { href: '#', text: '🎮 观察训练流程' },
        },
        character: IMG.cheer,
      },
    ],
  },

  // ========== 第四篇 · REINFORCE ==========
  reinforce: {
    chapter: '第四篇 · 策略优化',
    title: '策略姐的舞台成长记 · 直接优化动作概率',
    frames: [
      {
        subtitle: '换个思路',
        character: IMG.thinking,
        narrator: '前面的 Q-Learning/DQN 先学 Q 值，再间接推策略（argmax Q）。能不能<b>直接</b>学策略呢？毕竟我们最终要的就是"在每个状态做什么动作"。',
        bg: 'linear-gradient(135deg,#fbcfe8,#fde68a)',
      },
      {
        subtitle: '参数化的策略',
        character: '🎭',
        side: 'left',
        bubble: '我是"策略姐"，我把自己参数化为 π(a|s; θ)——一个神经网络，输入状态 s，输出动作概率分布。',
        math: 'π(a|s; θ) = softmax( NN_θ(s) )',
      },
      {
        subtitle: '我们要优化什么',
        character: '🎯',
        narrator: '目标：最大化期望回报 J(θ) = 𝔼[G_0 | π_θ]。直接对 θ 求梯度，用梯度上升更新。',
        math: 'θ ← θ + α · ∇_θ J(θ)',
        note: '但 J(θ) 是个期望，没法直接求梯度——该怎么办？',
      },
      {
        subtitle: '神奇的策略梯度定理',
        character: '🪄',
        narrator: '数学大神证明了一个漂亮的恒等式：梯度可以写成"对数策略的梯度 × 回报"的期望形式。',
        math: '∇_θ J(θ) = 𝔼_π [ ∇_θ log π(a|s;θ) · G_t ]',
        note: '这叫"策略梯度定理（PG Theorem）"。G_t 是从时刻 t 开始的折扣回报。',
      },
      {
        subtitle: '通俗解读',
        character: '🗣️',
        compare: [
          { title: '正反馈', body: 'G_t > 0 → 增大 log π(a|s) → 让这个动作更可能被选中' },
          { title: '负反馈', body: 'G_t < 0 → 减小 log π(a|s) → 让这个动作更不可能被选中' },
        ],
        note: '简言之："回报大的动作，下次更爱做；回报小的动作，下次更不想做。"',
      },
      {
        subtitle: 'REINFORCE 算法',
        character: '🎬',
        side: 'left',
        bubble: '① 用当前策略演完一整场戏（采样一条轨迹 τ）<br>② 对每一步计算回报 G_t<br>③ 按 ∇log π · G_t 求和做梯度更新',
        math: 'θ ← θ + α · Σ_t ∇_θ log π(a_t|s_t; θ) · G_t',
      },
      {
        subtitle: 'CartPole 实战',
        character: '🎡',
        narrator: '以经典的 CartPole 为例：小车上立着一根杆，目标是左右推车让杆不倒。存活每一步都 +1 奖励，杆倒了就结束。',
        bg: 'linear-gradient(135deg,#dbeafe,#e0e7ff)',
        note: 'CartPole 只有 2 个动作（左推/右推），是验证 PG 算法的 "hello world"。',
      },
      {
        subtitle: 'REINFORCE 的训练现象',
        character: '📈',
        narrator: '刚开始策略姐乱选动作，杆很快倒。几百回合后，她逐渐学会在杆左倾时选"左推"、右倾时选"右推"——存活时间越来越长！',
      },
      {
        subtitle: '问题：高方差',
        character: IMG.sad,
        warning: '同一个策略下，不同回合的回报 G_t 可能差异巨大（有的回合存活 20 步，有的 500 步）。导致梯度估计噪声很大，训练像坐过山车。',
        bg: 'linear-gradient(135deg,#fed7aa,#fecaca)',
      },
      {
        subtitle: '降方差利器：Baseline',
        character: '🧘',
        side: 'right',
        bubble: '减去一个不依赖动作的"基线" b（比如平均回报），梯度期望不变但方差大幅下降！',
        math: '∇J = 𝔼[ ∇log π(a|s) · (G_t − b) ]',
        note: '直觉：如果 G_t=200，b=180，那实际"惊喜度"只有 20。b 让学习更集中在"意外好坏"上。',
      },
      {
        subtitle: '为什么 baseline 不改变期望',
        character: '📐',
        narrator: '因为 𝔼[ ∇log π(a|s) · b ] = b · 𝔼[ ∇log π(a|s) ] = b · 0 = 0（策略对参数求梯度的期望是 0）。',
      },
      {
        subtitle: '最优 baseline？',
        character: '🎯',
        narrator: '最小化方差的最优 baseline 是一个状态相关函数 b(s) ≈ V(s)。这就自然过渡到下一节的 Actor-Critic！',
      },
      {
        subtitle: '蒙特卡洛 vs TD',
        character: '⏳',
        narrator: 'REINFORCE 是"纯蒙特卡洛"——必须等整条轨迹结束才能更新。采样效率低。但好处是无偏。',
      },
      {
        subtitle: '算法总结',
        compare: [
          { title: '✅ 优点', body: '思路简洁；能处理随机策略；能处理连续动作；收敛到局部最优有保证' },
          { title: '❌ 缺点', body: '高方差；必须等完整轨迹；样本利用率低（每条轨迹只用一次）' },
        ],
      },
      {
        subtitle: '🚗 自动驾驶彩蛋',
        character: '🚗',
        narrator: '回到我们的自动驾驶小车——REINFORCE 的学法是：每天跑完一整趟通勤后，<b>回放行车记录仪</b>复盘。"今天这条路线总共花了 25 分钟，比平均快，那今天每个路口的选择概率都调高一点。"不再记每个路口值多少分，而是<b>直接优化驾驶习惯</b>。缺点是必须跑完一整趟才能学——不能边开边学。',
        bg: 'linear-gradient(135deg,#ecfdf5,#f0f9ff)',
      },
      {
        poster: {
          title: '🎭 策略梯度精髓',
          slogan: '不去估计价值，直接调整"动作的概率"—— 这是 Policy-based 方法的起点。',
          formula: 'θ ← θ + α · ∇_θ log π(a|s; θ) · (G_t − b)',
          cta: { href: '#', text: '🎮 训练策略姐' },
        },
        character: IMG.cheer,
      },
    ],
  },

  // ========== 第四篇 · Actor-Critic ==========
  ac: {
    chapter: '第四篇 · 策略优化',
    title: '导演与演员的双人搭档 · Actor-Critic',
    frames: [
      {
        subtitle: 'REINFORCE 的痛点',
        character: IMG.sad,
        narrator: '① 必须等整条轨迹才能更新 —— 慢<br>② G_t 方差很大 —— 不稳<br>我们想"边走边更新"+"低方差"，怎么做？',
        bg: 'linear-gradient(135deg,#fed7aa,#fecaca)',
      },
      {
        subtitle: '答案：把回报换成 TD 估计',
        character: IMG.idea,
        narrator: '记得 TD 误差吗？δ = r + γ·V(s\') − V(s)。它可以看作"单步回报的估计"。用它替代 G_t，就能单步更新了！',
        math: '∇J ≈ 𝔼[ ∇log π(a|s) · δ ]',
      },
      {
        subtitle: '但 V(s) 哪里来？',
        character: IMG.thinking,
        narrator: '需要另一个网络来学 V(s) —— 这就是"评论家"（Critic）。而原来的策略网络 π(a|s) 叫"演员"（Actor）。',
      },
      {
        subtitle: '双网络架构',
        character: '👥',
        compare: [
          { title: '🎭 Actor π(a|s;θ)', body: '输出动作概率。目标：最大化期望回报。用 δ · ∇log π 更新。' },
          { title: '🎬 Critic V(s;w)', body: '输出状态价值。目标：最小化 TD 误差平方。用 δ · ∇V 更新。' },
        ],
        bg: 'linear-gradient(135deg,#fce7f3,#ddd6fe)',
      },
      {
        subtitle: 'TD 误差：双向通信',
        character: '⚡',
        narrator: 'δ 有两个用途：①  作为 Actor 的优势信号（告诉它这步动作好不好）；② 作为 Critic 的损失（修正自己的 V 估计）。一举两得！',
        math: 'Actor 更新：θ ← θ + α_θ · δ · ∇log π(a|s)<br>Critic 更新：w ← w + α_w · δ · ∇V(s)',
      },
      {
        subtitle: '训练循环',
        character: '🔄',
        narrator: '每走一步：① 观察 s → Actor 选 a → 环境给 r 和 s\' → ② Critic 算 δ = r + γV(s\') − V(s) → ③ 用 δ 更新 Actor 和 Critic → 继续下一步',
      },
      {
        subtitle: '为什么叫"优势"',
        character: '📊',
        narrator: 'TD 误差 δ ≈ Q(s,a) − V(s) = A(s,a)，这叫"优势函数"（Advantage）。它告诉 Actor："你在 s 选 a 比平均水平好多少"。',
        note: '用优势代替原始回报，就是降方差的关键。',
      },
      {
        subtitle: 'CartPole 上的表现',
        character: '🎡',
        narrator: '相比 REINFORCE，AC 训练速度更快、曲线更平滑。CartPole 能在 100-200 回合左右达到最大存活（500 步）。',
        bg: 'linear-gradient(135deg,#bbf7d0,#a7f3d0)',
      },
      {
        subtitle: 'A2C（Advantage Actor-Critic）',
        character: '🌐',
        narrator: 'A2C 是 AC 的同步多环境版本：多个并行环境同时采样，算出平均优势后统一更新。训练更稳定、数据更多样。',
      },
      {
        subtitle: 'A3C（Asynchronous A2C）',
        character: '🔀',
        narrator: 'A3C 是"异步"版本：多个 worker 各自采样、各自更新全局参数。DeepMind 早期的工作，在 Atari 上表现亮眼。',
      },
      {
        subtitle: 'AC 家族的关系',
        compare: [
          { title: 'AC (基础)', body: '单线程，TD(0)，单步更新' },
          { title: 'A2C', body: '多环境同步，算法稳健' },
          { title: 'A3C', body: '多线程异步，实现复杂但快' },
          { title: 'PPO', body: '在 AC 基础上加 clip 约束，工业主流' },
        ],
      },
      {
        subtitle: 'AC 的挑战',
        character: '⚠️',
        warning: '① 两个网络同时学，有耦合风险 ② Actor 可能过早收敛到次优策略 ③ 学习率、熵系数都需要调',
        narrator: '下一节 TRPO/PPO 就是在 AC 框架上加稳定性保证。',
      },
      {
        subtitle: '熵正则化',
        character: '🎲',
        narrator: '为了防止 Actor 过早"只选一个动作"（失去探索），常在损失里加"策略熵"：鼓励策略保持一定的随机性。',
        math: 'L_total = L_policy + c_v · L_value − c_e · H(π)',
      },
      {
        subtitle: '🚗 自动驾驶彩蛋',
        character: '🚗',
        narrator: '回到我们的自动驾驶小车——现在给你配了一个<b>副驾教练（Critic）</b>！你（Actor）负责打方向盘，教练每过一个路口就立即打分："这个路口你选左转，比我预期好 3 分！"你根据教练的即时反馈调整驾驶，不用等到终点才复盘。教练越来越准，你的驾驶也越来越好——这就是 Actor-Critic 在自动驾驶中的协作模式。',
        bg: 'linear-gradient(135deg,#ecfdf5,#f0f9ff)',
      },
      {
        poster: {
          title: '🎬 Actor-Critic 精髓',
          slogan: '策略网决定做什么，价值网实时评价做得怎么样—— 演员 + 评论家 = 训练加速器。',
          formula: '优势 A(s,a) ≈ δ = r + γV(s\') − V(s)<br>θ ← θ + α·∇log π·δ',
          cta: { href: '#', text: '🎮 观察双网协同' },
        },
        character: IMG.cheer,
      },
    ],
  },

  // ========== 第四篇 · TRPO ==========
  trpo: {
    chapter: '第四篇 · 策略优化',
    title: '围墙工的安全圈施工记 · TRPO',
    frames: [
      {
        subtitle: '策略梯度的致命伤',
        character: IMG.surprised,
        narrator: '策略梯度用 ∇J 做梯度上升时，步子一旦迈大，策略可能急剧恶化—— 更糟的是，再也回不去了（新策略下收集的数据更差）。',
        bg: 'linear-gradient(135deg,#fecaca,#fed7aa)',
      },
      {
        subtitle: '直观类比',
        character: '⛰️',
        narrator: '想象你在山脊上走路，眼睛蒙着布。梯度告诉你方向，但不告诉你离悬崖多远。一步太大——坠崖。',
      },
      {
        subtitle: '思路：限制"步子大小"',
        character: '🛡️',
        side: 'left',
        bubble: '我是围墙工！每次更新前，我在旧策略周围画一个"安全圈"，新策略必须在圈内——步子再大也摔不死。',
      },
      {
        subtitle: '但怎么量化"远近"？',
        character: '📏',
        narrator: '欧氏距离不行：参数 θ 变化 0.1 可能让策略彻底变样（也可能几乎不变），取决于神经网络结构。',
        note: '我们需要"分布之间的距离"——KL 散度登场！',
      },
      {
        subtitle: 'KL 散度',
        character: '🧮',
        narrator: 'KL(π_old ‖ π_new) 衡量新旧策略作为分布的"差异"。KL=0 → 完全相同。KL 大 → 差得多。',
        math: 'KL(p‖q) = Σ p(x) · log(p(x)/q(x))',
      },
      {
        subtitle: 'TRPO 优化目标',
        character: '🎯',
        side: 'right',
        bubble: '在 KL ≤ δ 的约束下，最大化"替代目标"（新策略下优势期望）。',
        math: 'max_θ  𝔼[ (π_θ(a|s) / π_old(a|s)) · A(s,a) ]<br>s.t.   𝔼[ KL(π_old, π_θ) ] ≤ δ',
        note: 'δ 是 KL 预算，通常取 0.01~0.05。',
      },
      {
        subtitle: '可视化：策略空间里的圆圈',
        character: '🎨',
        narrator: '把策略空间投影到 2D。目标函数是同心圆（中心最优）。TRPO 每步在旧策略周围画一个小圆（KL 半径），在圆内找最高点。',
        bg: 'linear-gradient(135deg,#ddd6fe,#fbcfe8)',
      },
      {
        subtitle: '求解：自然梯度',
        character: '📐',
        narrator: '约束优化的解是"自然梯度"方向：g = F⁻¹·∇J，其中 F 是 Fisher 信息矩阵（KL 的二阶近似）。',
        math: '步长 β = √(2δ / g^T F g)',
      },
      {
        subtitle: '问题：F⁻¹ 太贵',
        character: IMG.surprised,
        warning: 'Fisher 矩阵维度 = 参数量（百万级）。直接求逆要 O(n³)，根本算不动！',
      },
      {
        subtitle: '共轭梯度法',
        character: '🧩',
        narrator: 'TRPO 用"共轭梯度（CG）"迭代求解 F·x = g，不用显式构造 F。几次迭代就能得到高精度解。',
        note: 'CG 是数值分析的经典技巧：通过只算 Fv 这种矩阵-向量积来解 Ax = b。',
      },
      {
        subtitle: 'Line Search（线搜索）',
        character: '🔍',
        narrator: '即使拿到方向，步长也要验证：沿方向二分搜索，确保新策略 KL 真的 ≤ δ 并且替代目标真的提升。',
      },
      {
        subtitle: '理论保证',
        character: '🏅',
        narrator: 'TRPO 的强大之处：理论上证明了"每次更新单调改进"。即只要实现正确，期望回报就只升不降（或至少不显著下降）。',
        bg: 'linear-gradient(135deg,#bbf7d0,#a7f3d0)',
      },
      {
        subtitle: '实际效果',
        character: '📈',
        narrator: '在 MuJoCo 连续控制（Walker、Humanoid、Hopper）任务上，TRPO 比 vanilla PG 稳定得多，是 2015 年最强的策略梯度方法。',
      },
      {
        subtitle: 'TRPO 的代价',
        character: IMG.sad,
        warning: '① 实现复杂（CG + 线搜索 + KL 约束）<br>② 每次更新只能用一批数据一次<br>③ 计算量大',
        narrator: '于是下一节 PPO 登场：用简单的"剪刀"替代复杂的约束！',
      },
      {
        subtitle: '🚗 自动驾驶彩蛋',
        character: '🚗',
        narrator: '回到我们的自动驾驶小车——TRPO 就像<b>驾校教练限制方向盘幅度</b>：每次调整驾驶习惯时，新习惯和旧习惯的差异不能超过安全阈值。就像画了一个"安全圈"——你只能在圈内找最优调整，保证不会突然乱打方向盘导致翻车。自动驾驶系统的策略更新也需要这种"渐进式"调整，不能一次改太多。',
        bg: 'linear-gradient(135deg,#ecfdf5,#f0f9ff)',
      },
      {
        poster: {
          title: '🛡️ TRPO 核心',
          slogan: '给策略更新画一个 KL 安全圈，用自然梯度 + CG 求解，保证单调提升。',
          formula: 'max 𝔼[(π_new/π_old)·A]  s.t.  KL(π_old, π_new) ≤ δ',
          cta: { href: '#', text: '🎮 看安全圈施工' },
        },
        character: IMG.cheer,
      },
    ],
  },

  // ========== 第四篇 · PPO ==========
  ppo: {
    chapter: '第四篇 · 策略优化',
    title: '剪刀手 · 简单粗暴的 PPO',
    frames: [
      {
        subtitle: 'PPO 的出发点',
        character: IMG.fighting,
        narrator: 'TRPO 很强但太复杂。PPO 的设计哲学：<b>"用最简单的方法，达到 TRPO 90% 的效果"</b>。',
        bg: 'linear-gradient(135deg,#fde68a,#fca5a5)',
      },
      {
        subtitle: '关键概念：概率比 r(θ)',
        character: '📊',
        narrator: 'r(θ) = π_new(a|s) / π_old(a|s)。r=1 意味着"新旧策略没变"，r=2 意味着"新策略把该动作概率翻倍"。',
        note: '我们希望限制 r 不能偏离 1 太远—— 这就是"保守更新"。',
      },
      {
        subtitle: 'PPO 的核心武器：Clip',
        character: '✂️',
        side: 'left',
        bubble: '我的绝技：如果 r 偏离 1 超过 ε（通常 0.2），我就"剪掉"它——限制在 [1-ε, 1+ε] 区间。',
        math: 'clip(r, 1-ε, 1+ε) = { 1-ε  if r<1-ε<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;r  if 1-ε≤r≤1+ε<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1+ε  if r>1+ε }',
      },
      {
        subtitle: 'PPO 目标函数',
        character: '🎯',
        narrator: 'L^CLIP = 𝔼[ min(r·A, clip(r,1-ε,1+ε)·A) ]。取"原始目标"和"裁剪目标"的较小者。',
        math: 'L^CLIP(θ) = 𝔼[ min(r(θ)·A, clip(r(θ), 1-ε, 1+ε)·A) ]',
      },
      {
        subtitle: '正优势时（A > 0）的行为',
        character: '📈',
        narrator: '想增大该动作概率。但如果 r > 1+ε（已经增很多了），min 会取裁剪项（恒定在 (1+ε)·A），梯度归零——<b>不让你继续激进</b>。',
        bg: 'linear-gradient(135deg,#bbf7d0,#a7f3d0)',
      },
      {
        subtitle: '负优势时（A < 0）的行为',
        character: '📉',
        narrator: '想减小该动作概率。但如果 r < 1-ε（已经减很多了），min 取原始项（更小的 r·A），还会继续减—— 咦？这是 bug 吗？',
        note: '实际上：clip 确保不会"过度减小"，加上 PPO 同时要 KL 惩罚/早停，这个边界情况影响有限。',
      },
      {
        subtitle: '直观看图',
        character: '📉',
        narrator: '在可视化页面拖动 A 和 ε 滑块，你能直观看到：当 r 超出 [1-ε, 1+ε] 时，PPO 目标"被剪平"——梯度消失，策略不会继续走那个方向。',
      },
      {
        subtitle: 'PPO 可以多轮训练！',
        character: '🔄',
        narrator: '由于 clip 的保护，PPO 可以在<b>同一批数据上多次做梯度下降</b>（通常 3-10 epoch）。这大大提升了样本利用率！',
        note: '对比：TRPO/REINFORCE 只能用一次。',
      },
      {
        subtitle: '完整 PPO 算法',
        character: '📋',
        narrator: '① 用 π_old 采 N 步经验 → ② 计算 GAE 优势 A_t → ③ 用同一批数据做 K epoch 的 SGD（clip 目标）→ ④ 同步 π_old ← π_new → 重复',
      },
      {
        subtitle: 'GAE：广义优势估计',
        character: '📏',
        narrator: 'GAE 是一种在 TD(0) 和蒙特卡洛之间插值的优势估计方法，由 λ 控制偏差-方差权衡。',
        math: 'A_t^GAE(λ) = Σ (γλ)^l · δ_{t+l}',
      },
      {
        subtitle: '和 TRPO 的对比',
        compare: [
          { title: '🛡️ TRPO', body: 'KL 硬约束，自然梯度 + CG + 线搜索。稳定但复杂，只能单 epoch。' },
          { title: '✂️ PPO', body: 'clip 软约束，普通 SGD。简单直接，可多 epoch，样本效率高。' },
        ],
      },
      {
        subtitle: '为什么 PPO 这么红',
        character: '🏭',
        compare: [
          { title: '✅ 简单', body: '几十行代码就能实现（对比 TRPO 几百行）' },
          { title: '✅ 稳定', body: 'clip 保证每次更新不会太激进' },
          { title: '✅ 高效', body: '同一批数据可多 epoch，样本利用率高' },
          { title: '✅ 通用', body: '离散/连续、图像/向量、大小模型都能用' },
        ],
      },
      {
        subtitle: 'PPO 的真实应用',
        character: '🚀',
        narrator: 'OpenAI 的 Dota 2 AI、DeepMind 的 Starcraft II、波士顿动力的机器人控制，直到 ChatGPT 的 RLHF 训练—— 背后都是 PPO！',
        bg: 'linear-gradient(135deg,#c7d2fe,#ddd6fe)',
      },
      {
        subtitle: '实际训练 Tips',
        character: IMG.idea,
        narrator: 'ε=0.2, epoch=10, batch=64 是常见配置；加入熵正则 (c_e ≈ 0.01) 鼓励探索；Value clipping 让 Critic 也稳定。',
      },
      {
        subtitle: '🚗 自动驾驶彩蛋',
        character: '🚗',
        narrator: '回到我们的自动驾驶小车——PPO 就像给方向盘装了一个<b>物理限位器</b>！如果某次调整想把转弯概率拉到 1.5 倍（太激进），直接裁剪到 1.2 倍。简单粗暴但效果一样好。Waymo、Tesla 等自动驾驶公司的策略训练，很多都在用 PPO——因为它简单、稳定、通用，从模拟器到真车都能跑。',
        bg: 'linear-gradient(135deg,#ecfdf5,#f0f9ff)',
      },
      {
        poster: {
          title: '✂️ PPO 精髓',
          slogan: '用最简单的"裁剪"替代复杂的约束优化——大道至简。',
          formula: 'L^CLIP = 𝔼[ min( r·A, clip(r, 1-ε, 1+ε)·A ) ]',
          cta: { href: '#', text: '🎮 拖动比率看裁剪' },
        },
        character: IMG.cheer,
      },
    ],
  },

  // ========== 第五篇 · DDPG ==========
  ddpg: {
    chapter: '第五篇 · 连续控制',
    title: '控制师的机械臂特训日 · DDPG',
    frames: [
      {
        subtitle: '痛点：连续动作',
        character: '🦾',
        narrator: '机械臂要转多少度？油门踩多深？动作是连续实数。DQN 的 argmax 操作需要枚举所有动作——连续空间根本不可能枚举。',
        bg: 'linear-gradient(135deg,#fecaca,#fed7aa)',
      },
      {
        subtitle: '问题的本质',
        character: IMG.confused,
        narrator: '假设动作 a ∈ ℝ²，取值无穷多。我们不能像 DQN 那样对所有 a 计算 Q(s,a) 再取 max。',
      },
      {
        subtitle: '思路：用另一个网络去 argmax',
        character: IMG.idea,
        narrator: '既然不能枚举，就训练一个函数 μ(s) 直接输出"使 Q(s,a) 最大的 a"。这个 μ 就是"确定性策略"。',
        math: 'μ(s) ≈ argmax_a Q(s, a)',
      },
      {
        subtitle: '两个网络：Actor + Critic',
        character: '👥',
        compare: [
          { title: '🎭 Actor μ(s;θ^μ)', body: '输入状态，输出连续动作。参数 θ^μ。' },
          { title: '🎬 Critic Q(s,a;θ^Q)', body: '输入状态+动作，输出 Q 值。参数 θ^Q。' },
        ],
      },
      {
        subtitle: 'Critic 怎么学',
        character: '🎯',
        narrator: '和 DQN 类似：TD 目标 y = r + γ · Q(s\', μ(s\'))，最小化 (y − Q(s,a))²。',
        math: 'L_Q = 𝔼[( r + γ·Q(s\', μ(s\')) − Q(s,a) )²]',
      },
      {
        subtitle: 'Actor 怎么学',
        character: '🎭',
        narrator: '目标是让 μ 输出的动作获得更大的 Q 值。对 Q 的梯度通过 μ 反传：',
        math: '∇_θ^μ J ≈ 𝔼[ ∇_a Q(s,a)|_{a=μ(s)} · ∇_θ^μ μ(s) ]',
        note: '这叫"确定性策略梯度定理"（DPG Theorem），由 Silver 2014 提出。',
      },
      {
        subtitle: 'DDPG = DPG + DQN 技巧',
        character: '🔧',
        narrator: 'DDPG 在 DPG 基础上借用了 DQN 的两大武器：<b>经验回放</b> + <b>目标网络</b>。',
        bg: 'linear-gradient(135deg,#bfdbfe,#ddd6fe)',
      },
      {
        subtitle: '四个网络！',
        character: '👯',
        compare: [
          { title: 'Actor 主 μ(s;θ^μ)', body: '频繁更新' },
          { title: 'Actor 目标 μ\'(s;θ^{μ\'})', body: '缓慢跟随' },
          { title: 'Critic 主 Q(s,a;θ^Q)', body: '频繁更新' },
          { title: 'Critic 目标 Q\'(s,a;θ^{Q\'})', body: '缓慢跟随' },
        ],
      },
      {
        subtitle: '软更新（Polyak averaging）',
        character: '🌊',
        narrator: 'DQN 是"硬同步"（每 N 步把 θ⁻ = θ）。DDPG 用"软更新"：每步都轻微跟随主网络。',
        math: 'θ\' ← τ · θ + (1 − τ) · θ\'    (τ ≈ 0.005)',
        note: '好处：目标变化更平滑，训练更稳。',
      },
      {
        subtitle: '探索怎么办',
        character: '🎲',
        narrator: '确定性策略无法通过 softmax 采样探索。DDPG 在动作上加噪声：a_t = μ(s_t) + N_t。',
        math: 'a_t = μ(s_t) + σ · 𝒩(0, 1)（高斯）<br>或用 Ornstein-Uhlenbeck（相关噪声）',
      },
      {
        subtitle: 'OU 噪声 vs 高斯噪声',
        compare: [
          { title: 'OU 噪声', body: '相邻时刻相关（像布朗运动），适合惯性系统' },
          { title: '高斯噪声', body: '独立同分布，简单但可能过于"抖"' },
        ],
      },
      {
        subtitle: '应用场景',
        character: IMG.happy,
        narrator: 'DDPG 在机械臂抓取、自动驾驶、四足机器人行走等连续控制任务上表现优秀。2 维追踪这个可视化例子也是典型代表。',
      },
      {
        subtitle: '局限性',
        character: '⚠️',
        warning: '① 对超参数敏感 ② Critic 会过估计 Q ③ 探索噪声难调',
        narrator: '改进：TD3（Twin Delayed DDPG）使用两个 Critic 取 min、延迟 Actor 更新、加目标策略平滑，大幅提升稳定性。',
      },
      {
        subtitle: 'TD3 的三个改进',
        character: '🔧',
        compare: [
          { title: '① 双 Critic', body: '两个 Critic 取 min，避免过估计' },
          { title: '② 延迟 Actor', body: 'Critic 每步更新，Actor 每 2 步更新一次' },
          { title: '③ 目标平滑', body: '在 μ\'(s\') 上加小噪声，平滑 Q 曲面' },
        ],
      },
      {
        subtitle: '🚗 自动驾驶彩蛋',
        character: '🚗',
        narrator: '回到我们的自动驾驶小车——前面的算法动作都是离散的（左转/右转），但真正开车时<b>方向盘角度是连续的</b>（-180°到+180°），油门力度也是连续的。DDPG 的 Actor 直接输出"方向盘转 15.3°，油门踩 42%"这样的精确连续值。这正是自动驾驶最需要的——精准的连续控制！',
        bg: 'linear-gradient(135deg,#ecfdf5,#f0f9ff)',
      },
      {
        poster: {
          title: '🤖 DDPG 精髓',
          slogan: '让"确定性策略"也能用梯度优化—— 连续动作空间的 DQN。',
          formula: '∇_θ^μ J = 𝔼[ ∇_a Q(s,a)|_{a=μ(s)} · ∇_θ^μ μ(s) ]',
          cta: { href: '#', text: '🎮 操控追踪机器人' },
        },
        character: IMG.cheer,
      },
    ],
  },

  // ========== 第六篇 · LLM-RL ==========
  llm: {
    chapter: '第六篇 · 大模型对齐',
    title: 'AI 小助的成长记 · 从胡言乱语到温柔贴心',
    frames: [
      {
        subtitle: '预训练后的 AI 是什么样',
        character: IMG.confused,
        narrator: '初代 LLM（如 GPT-3）读遍互联网文本，学会"接下一个词"。但它啥都敢说：瞎编、冒犯、回答偏题、不懂"人类想要什么"。',
        bg: 'linear-gradient(135deg,#fed7aa,#fecaca)',
      },
      {
        subtitle: '问题核心',
        character: IMG.thinking,
        narrator: '怎么告诉一个 1000 亿参数的大模型"你应该回答得有用、诚实、无害"？传统监督学习的标注成本爆炸—— 每条好回答都要专家写。',
      },
      {
        subtitle: '突破：用 RL 做对齐',
        character: IMG.idea,
        narrator: 'OpenAI 2022 年提出 InstructGPT / ChatGPT 的训练范式：<b>SFT → 奖励模型 → RLHF</b>，三阶段对齐大模型。',
      },
      {
        subtitle: 'Stage 1 · SFT',
        character: '📚',
        side: 'left',
        bubble: '先让人类专家写一批<b>高质量问答对</b>（如 10K 条），用监督学习微调预训练模型。这叫 Supervised Fine-Tuning。',
        note: 'SFT 让模型至少"像样"地回答指令，是后续 RL 的起点。',
      },
      {
        subtitle: 'Stage 2 · 奖励模型（RM）',
        character: '⚖️',
        side: 'right',
        bubble: '让模型对同一问题生成多个回答，标注员<b>排序</b>（A 比 B 好），用偏好数据训练一个"打分器"RM(prompt, answer) → 分数。',
        math: 'L_RM = −log σ( r(x, y_w) − r(x, y_l) )',
        note: 'y_w = 标注员更喜欢的回答，y_l = 次之。RM 学习拟合人类偏好。',
      },
      {
        subtitle: 'Stage 3 · RLHF（核心）',
        character: '🎯',
        narrator: '用 PPO 微调 SFT 模型：模型生成回答 → RM 打分 → 得分作为奖励 → PPO 更新策略。但…… 有个陷阱。',
        bg: 'linear-gradient(135deg,#ddd6fe,#fbcfe8)',
      },
      {
        subtitle: '陷阱：奖励劫持',
        character: IMG.surprised,
        warning: '模型很快发现可以"刷分"—— 比如输出一堆夸张的赞美词。RM 给高分，但对用户其实毫无帮助！',
      },
      {
        subtitle: 'KL 惩罚登场',
        character: '🔐',
        narrator: '在奖励里加一个 KL 惩罚项，不让 RL 后的策略 π 和 SFT 模型 π_SFT 相差太远。这样既追求高分，又不至于"放飞自我"。',
        math: 'R(x, y) = RM(x, y) − β · KL(π(·|x) ‖ π_SFT(·|x))',
      },
      {
        subtitle: 'RLHF 完整流程',
        character: '🌐',
        narrator: '① 采样 prompt → ② π 生成回答 y → ③ RM 打分 + KL 惩罚 → ④ PPO 更新 π。循环。',
      },
      {
        subtitle: '问题：RLHF 太复杂',
        character: IMG.sad,
        warning: '要维护 4 个大模型：π（待训练）、π_SFT（参考）、RM（奖励）、V（价值）。训练 70B 规模的模型，显存吃不消。',
      },
      {
        subtitle: '改进 1：DPO',
        character: '🎁',
        side: 'left',
        bubble: '我是 DPO（Direct Preference Optimization）！跳过 RM，直接用偏好数据端到端优化策略。',
        math: 'L_DPO = −log σ( β·log(π(y_w)/π_SFT(y_w)) − β·log(π(y_l)/π_SFT(y_l)) )',
        note: '数学上等价于 "RM + KL + 最优策略闭式解"，却只用一步拟合——又快又简。',
      },
      {
        subtitle: 'DPO 的直觉',
        character: IMG.thinking,
        narrator: 'DPO 本质上在说："如果 y_w 比 y_l 好，就让 π 对 y_w 的概率比 π_SFT 对 y_w 的概率更高（相对而言）"。它是一个隐式的对比学习。',
      },
      {
        subtitle: '改进 2：GRPO',
        character: '👥',
        side: 'right',
        bubble: '我是 GRPO（Group Relative Policy Optimization），DeepSeek 提出。对同一 prompt 生成一组回答，用<b>组内归一化</b>算优势，连 Critic 都不需要！',
        math: 'A_i = (r_i − mean(r)) / std(r)',
        bg: 'linear-gradient(135deg,#bbf7d0,#a7f3d0)',
      },
      {
        subtitle: 'GRPO vs PPO',
        compare: [
          { title: 'PPO（RLHF 标配）', body: '需要 Value 网络 V(s)；4 个大模型；显存爆炸' },
          { title: 'GRPO（DeepSeek）', body: '组内相对比较；不用 V 网络；显存省一半' },
        ],
      },
      {
        subtitle: '三种方法总结',
        compare: [
          { title: 'RLHF (PPO)', body: '经典三段式，稳定但工程复杂' },
          { title: 'DPO', body: '跳过 RM，离线训练，实现简单' },
          { title: 'GRPO', body: '组内归一化，推理密集型任务效果好（如数学、代码）' },
        ],
      },
      {
        subtitle: '推理能力的涌现',
        character: IMG.idea,
        narrator: 'DeepSeek-R1 / OpenAI o1 用 GRPO + 可验证奖励（数学答案对错）训练，让 LLM 在思维链上做 RL，涌现出"自我反思"等类人推理行为。这是 2024-2025 年的热点。',
      },
      {
        subtitle: '对齐的意义',
        character: '🌟',
        narrator: 'RL + 人类偏好 = 让万亿参数的"语言怪兽"变得<b>有用、诚实、无害</b>。这是 ChatGPT、Claude、DeepSeek、Gemini 都在用的技术。',
        bg: 'linear-gradient(135deg,#c7d2fe,#fce7f3)',
      },
      {
        subtitle: '🤖 ChatGPT 是怎么炼成的',
        character: '🤖',
        narrator: '回到最经典的舞台——ChatGPT：预训练后只会"接龙"，但不懂"什么叫好回答"。<b>RLHF</b>：人类给两个回答打分"A 更好"，训练奖励模型，再用 PPO 优化。<b>DPO</b>：跳过奖励模型，直接从"A 比 B 好"的偏好对学习，工程上更简单。<b>GRPO</b>：一次生成一组回答，组内互相比较归一化打分，连价值网络都省了。',
        bg: 'linear-gradient(135deg,#e0e7ff,#fce7f3)',
        note: 'Claude、DeepSeek、Gemini 等主流大模型全部基于这套"RL + 人类偏好"范式——这就是当代 AI 对齐的基石。',
      },
      {
        poster: {
          title: '✨ LLM 对齐精髓',
          slogan: '用人类偏好代替奖励函数，让大模型学会"说人话"。',
          formula: 'RLHF: L = 𝔼[PPO目标] − β·KL(π, π_SFT)<br>DPO:  直接从偏好对优化策略<br>GRPO: 组内归一化优势，无需 Critic',
          cta: { href: '#', text: '🎮 体验对齐流程' },
        },
        character: IMG.cheer,
      },
    ],
  },
};