// 算法文章数据（双版本：plain 通俗理解 / deep 深入学习）
//
// ## 数据结构
// ARTICLES[algoId] = {
//   title, subtitle, icon,
//   plain: { readMinutes, blocks: [ ...BlockPlain ] },
//   deep:  { readMinutes, blocks: [ ...BlockDeep ] },
// }
//
// ### BlockPlain 块类型（追求散文化、娓娓道来）
//   { type: 'p',        text }                         段落（支持 <b>/<i>/<code>）
//   { type: 'h2',       text }                         小标题（用得少，只在真正需要分段时）
//   { type: 'quote',    text, from? }                  引言/金句
//   { type: 'callout',  tone?, icon?, text }           提示框（tone: tip/warn/note）
//   { type: 'divider' }                                分隔符（故事转折）
//   { type: 'image',    src, caption?, fallback? }     插画（基于 IMG 资源）
//   { type: 'hr-quote', text }                         大引文（居中醒目）
//
// ### BlockDeep 块类型（追求严谨、公式完备）
//   { type: 'h2', text, anchor? }                     章节标题
//   { type: 'h3', text }                              小节标题
//   { type: 'p',  text }                              段落（支持 $..$ 行内公式）
//   { type: 'math', tex, label? }                     块级公式（$$..$$）
//   { type: 'derivation', steps: [{ tex, note? }] }   推导步骤链
//   { type: 'pseudocode', title?, lines: [string] }   伪代码块
//   { type: 'table', headers, rows }                  对比表
//   { type: 'callout', tone, text }                   提示框
//   { type: 'list', items: [string] }                 无序列表
//   { type: 'olist', items: [string] }                有序列表
//   { type: 'references', items: [{ title, url? }] }  参考文献

import { IMG } from './img-assets.js';

export const ARTICLES = {

  // ========== 多臂老虎机 ==========
  bandit: {
    title: '多臂老虎机',
    subtitle: '强化学习最原始的困境：在"已知的好"与"未知的可能更好"之间做抉择',
    icon: '🎰',

    // —— 白话版：娓娓道来 ——
    plain: {
      readMinutes: 5,
      blocks: [
        {
          type: 'p',
          text: '想象你走进一家赌场。面前摆着十台外表一模一样的老虎机，每台中奖的概率都不相同——但你不知道哪台慷慨、哪台吝啬。你手上只有一百枚硬币，每投一次，就少一次机会。'
        },
        {
          type: 'p',
          text: '这时候你会怎么做？'
        },
        {
          type: 'image',
          src: IMG.banditCasino.src,
          fallback: '🎰',
          caption: '面前摆着十台老虎机，每台中奖率都不相同……'
        },
        {
          type: 'p',
          text: '最保守的人，会先每台都耐心试上几次，凑出一份"谁最大方"的统计表，然后一口气把剩下的硬币全投在看起来最好的那台上。听起来挺合理？但麻烦在于——万一你前几次的运气太坏，把真正最好的那台错过了呢？'
        },
        {
          type: 'p',
          text: '最激进的人则恰恰相反。他一开始摸到某一台感觉还不错，就死磕它不放，再也不去尝试其他。这样虽然省心，可你永远不会知道：隔壁那台，会不会才是真正的宝藏。'
        },
        {
          type: 'hr-quote',
          text: '这就是「多臂老虎机」——强化学习里最原始，也最深刻的困境。'
        },
        {
          type: 'p',
          text: '人们给这两种倾向起了名字。前一种叫<b>"探索"（Exploration）</b>——主动尝试未知，为的是收集更多信息；后一种叫<b>"利用"（Exploitation）</b>——根据手头的经验，做此刻看起来最划算的选择。'
        },
        {
          type: 'p',
          text: '你会发现，这对矛盾其实无处不在。去一家新餐厅点菜，你是会点那道"上次觉得还行"的招牌菜，还是鼓起勇气试一道没吃过的？刷短视频时，算法是会一直推你已经爱上的那个博主，还是穿插进一些风格完全不同的新内容？做职业选择时，你是在熟悉的岗位上深耕，还是跳出舒适区冒险转行？'
        },
        {
          type: 'p',
          text: '如果只做前者，你永远不会更进一步；如果只做后者，你可能连当下拥有的都守不住。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '那聪明人会怎么做？一个最朴素的想法是——<b>绝大多数时候听经验的，偶尔任性一把去试试新东西。</b>'
        },
        {
          type: 'p',
          text: '比如九成时间拉目前平均收益最高的那台老虎机，剩下一成时间随机挑一台。那一成的"任性"看似浪费了几次机会，但它换来了一样非常珍贵的东西——让你有机会发现那些"被低估的宝藏"。'
        },
        {
          type: 'callout',
          tone: 'tip',
          icon: '💡',
          text: '这个策略有个朴素的名字，叫 <b>ε-贪心（Epsilon-Greedy）</b>。ε 就是那"偶尔任性"的概率。ε 越大，越爱探索；越小，越守成。'
        },
        {
          type: 'p',
          text: 'ε-贪心很直接，但它有个小缺陷——"任性"的时候，它是完全随机挑一台的。也就是说，那些它早就试过很多次、明显很糟的机器，它还是会傻乎乎地再去试。这显然不够聪明。'
        },
        {
          type: 'p',
          text: '有没有办法"聪明地任性"？当然有。人会这么想：<i>一台老虎机被我试得越少，我对它的了解就越模糊，也就越有可能低估它的真实水平。所以——我越是不熟悉它，就越应该给它一次机会。</i>'
        },
        {
          type: 'p',
          text: '这就是 <b>UCB（上置信界）</b> 的精髓。它给每台机器算一个分数，这个分数由两部分组成：一部分是经验里的"平均收益"，另一部分是"不确定性奖金"——你试得越少，这个奖金就越高。所以那些冷门的机器，哪怕目前看起来不太行，也会因为"不确定性奖金"而被定期关照一下。'
        },
        {
          type: 'callout',
          tone: 'note',
          icon: '🎯',
          text: '这其实很像我们评价一个陌生人——如果你只和一个人说过两句话，你不应该太快下结论说他"不行"，因为样本太少了。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '还有一种更优雅的做法，叫 <b>Thompson 采样</b>。它不直接估计"平均值"，而是为每台老虎机维护一个"可能性分布"——我不确切地知道你的中奖率是多少，但我大概觉得它在某个范围里。'
        },
        {
          type: 'p',
          text: '每次要做决定时，它从每台机器的"可能性分布"里各抽一个随机数，然后选数值最大的那台。这听起来有点玄，但实际上极为精妙——试得少的机器，它的分布很宽，有时候能抽到非常高的数，所以会被选中；试得多、结论明确的机器，分布很窄，就按稳定水平来竞争。'
        },
        {
          type: 'p',
          text: '换句话说，这是一种带"幻想"的决策方式：<i>就当它真的可能有那么好，去试一次看看。</i>'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '三种策略，三种性格。ε-贪心朴素直接，适合快速上手；UCB 讲道理，有数学上的保证；Thompson 优雅灵活，实战里往往表现最好。但它们解决的，都是同一个问题——<b>在未知中行动，在行动中学习。</b>'
        },
        {
          type: 'p',
          text: '你可能已经隐约感觉到了：这个"老虎机"问题，并不只是赌场里的游戏。每当一家公司在做 A/B 测试——到底是按钮红一点好还是蓝一点好？每当一个推荐系统在给你推送下一条视频——它都在做一次"拉动哪台老虎机"的决策。新闻 App 的推送、电商的"猜你喜欢"、医药临床试验里的病人分组……背后全都是同一套思想在运转。'
        },
        {
          type: 'hr-quote',
          text: '所以"多臂老虎机"不是一个关于赌博的问题，而是一个关于"如何在不完全的信息下做出更好决策"的问题。'
        },
        {
          type: 'p',
          text: '这也是强化学习要教给我们的第一课。后面不管多么复杂的算法——Q-Learning、PPO、DQN——它们的骨子里都还在回答同一个问题：如何在"按经验办事"和"给未知一次机会"之间，找到那个刚刚好的平衡点。'
        },
        {
          type: 'p',
          text: '现在，下面有一个动手实验区。你可以亲手试试这三种策略，在图表里看它们的"性格"差异——谁更稳、谁更快、谁在长期里赢得更多。这是比读一万字更直观的学习方式。'
        },
      ]
    },

    // —— 深度版：严谨完整 ——
    deep: {
      readMinutes: 15,
      blocks: [
        { type: 'h2', text: '1. 问题形式化', anchor: 'formalization' },
        {
          type: 'p',
          text: '多臂老虎机（Multi-Armed Bandit，MAB）是强化学习中最简化的设定：没有状态转移、没有序列依赖，只剩下"在 K 个未知分布中选择"这一动作。'
        },
        {
          type: 'p',
          text: '形式化地，设有 $K$ 个动作 $\\mathcal{A}=\\{a_1, a_2, \\dots, a_K\\}$，每个动作 $a_i$ 对应一个未知的奖励分布 $\\mathcal{R}_i$，其期望为 $\\mu_i = \\mathbb{E}[R \\mid a_i]$。在离散时间步 $t = 1, 2, \\dots, T$，决策者选择一个动作 $A_t \\in \\mathcal{A}$ 并观察到奖励 $R_t \\sim \\mathcal{R}_{A_t}$。目标是最大化 $T$ 步累积期望奖励：'
        },
        { type: 'math', tex: '\\max \\; \\mathbb{E}\\left[\\sum_{t=1}^{T} R_t\\right]' },
        {
          type: 'p',
          text: '这与"最大化期望累积奖励"的目标等价于最小化<b>遗憾（Regret）</b>——即与始终选择最优动作 $a^* = \\arg\\max_i \\mu_i$ 的累积差距：'
        },
        { type: 'math', tex: '\\mathrm{Regret}(T) = T \\cdot \\mu^* - \\mathbb{E}\\left[\\sum_{t=1}^{T} R_t\\right]' },
        {
          type: 'callout',
          tone: 'note',
          text: '一个算法的优劣通常以 Regret 的渐近阶来衡量。Lai & Robbins (1985) 证明了任意一致策略的 Regret 下界为 $\\Omega(\\log T)$，即 Regret 的增长不可能慢于对数。'
        },

        { type: 'h2', text: '2. 样本均值估计' },
        {
          type: 'p',
          text: '最自然的价值估计方式是样本均值：用动作 $a$ 历史上获得奖励的平均值作为 $\\mu_a$ 的估计量：'
        },
        { type: 'math', tex: '\\hat{Q}_t(a) = \\frac{1}{N_t(a)} \\sum_{k=1}^{t-1} \\mathbb{1}\\{A_k = a\\} \\cdot R_k' },
        { type: 'p', text: '其中 $N_t(a)$ 表示直到时刻 $t$ 动作 $a$ 被选择的次数。这个估计可以增量式地更新，避免保存历史：' },
        { type: 'math', tex: '\\hat{Q}_{t+1}(a) = \\hat{Q}_t(a) + \\frac{1}{N_t(a) + 1}\\left( R_t - \\hat{Q}_t(a) \\right)' },
        {
          type: 'p',
          text: '这一增量更新式可以看作是后续 TD 学习更新规则的"最简祖先"——将 $\\frac{1}{N}$ 替换为固定步长 $\\alpha$，就成了时序差分方法的雏形。'
        },

        { type: 'h2', text: '3. 三类经典策略', anchor: 'strategies' },

        { type: 'h3', text: '3.1 ε-Greedy' },
        {
          type: 'p',
          text: '以概率 $1 - \\varepsilon$ 选择当前估计值最高的动作（利用），以概率 $\\varepsilon$ 均匀随机选择一个动作（探索）：'
        },
        {
          type: 'math',
          tex: 'A_t = \\begin{cases} \\arg\\max_a \\hat{Q}_t(a), & \\text{w.p. } 1-\\varepsilon \\\\ \\text{Uniform}(\\mathcal{A}), & \\text{w.p. } \\varepsilon \\end{cases}'
        },
        {
          type: 'p',
          text: '在 $\\varepsilon$ 为常数时，ε-Greedy 的 Regret 为 $O(T)$ ——因为它始终以固定概率做随机探索。实践中常用 $\\varepsilon_t = \\min(1, c\\,K / (d^2 t))$ 等衰减策略，可将 Regret 降至 $O(\\log T)$，但对超参数敏感。'
        },

        { type: 'h3', text: '3.2 UCB（Upper Confidence Bound）' },
        {
          type: 'p',
          text: 'UCB 的核心思想是"面对不确定性时保持乐观"（Optimism in the Face of Uncertainty）。为每个动作的估计值加上一个与不确定性相关的奖励项：'
        },
        { type: 'math', tex: 'A_t = \\arg\\max_a \\left[ \\hat{Q}_t(a) + c\\sqrt{\\frac{\\ln t}{N_t(a)}} \\right]', label: 'UCB1' },
        {
          type: 'derivation',
          steps: [
            { tex: 'P\\left( \\mu_a \\le \\hat{Q}_t(a) + U_t(a) \\right) \\ge 1 - \\delta', note: '由 Hoeffding 不等式，可构造置信上界 $U_t(a)$：' },
            { tex: 'U_t(a) = \\sqrt{\\frac{\\ln(1/\\delta)}{2 N_t(a)}}', note: '取 $\\delta = t^{-4}$（随时间收紧置信度），代入后取阶得：' },
            { tex: 'U_t(a) \\propto \\sqrt{\\frac{\\ln t}{N_t(a)}}', note: '将置信上界加入选择准则，即得 UCB1。' },
          ]
        },
        {
          type: 'callout',
          tone: 'tip',
          text: 'UCB1 的 Regret 上界为 $O\\!\\left( \\sum_{a : \\Delta_a > 0} \\frac{\\ln T}{\\Delta_a} \\right)$，其中 $\\Delta_a = \\mu^* - \\mu_a$ 是次优差距。这与 Lai–Robbins 下界同阶，属于渐近最优。'
        },

        { type: 'h3', text: '3.3 Thompson Sampling' },
        {
          type: 'p',
          text: 'Thompson 采样是一种贝叶斯方法。为每个动作 $a$ 维护一个参数 $\\mu_a$ 的后验分布 $p(\\mu_a \\mid \\mathcal{D}_t)$。每个时间步从各后验中独立采样一次，选择采样值最大的动作：'
        },
        {
          type: 'olist',
          items: [
            '对每个 $a$：从 $p(\\mu_a \\mid \\mathcal{D}_t)$ 中独立采样 $\\tilde{\\mu}_a$',
            '选择 $A_t = \\arg\\max_a \\tilde{\\mu}_a$',
            '观察 $R_t$，更新后验 $p(\\mu_{A_t} \\mid \\mathcal{D}_{t+1})$'
          ]
        },
        {
          type: 'p',
          text: '以伯努利老虎机为例，采用共轭先验 $\\mathrm{Beta}(\\alpha, \\beta)$，后验更新为：每次成功 $\\alpha \\mathrel{+}= 1$，每次失败 $\\beta \\mathrel{+}= 1$。简单到可以一行代码实现，但其 Regret 同样达到 $O(\\log T)$ 阶，且经验表现常优于 UCB。'
        },

        { type: 'h2', text: '4. 伪代码对照', anchor: 'pseudocode' },
        {
          type: 'pseudocode',
          title: 'ε-Greedy / UCB1 / Thompson 统一框架',
          lines: [
            'Initialize: N(a) ← 0,  Q̂(a) ← 0,  ∀a ∈ A',
            'for t = 1, 2, ..., T do',
            '    # -- 根据策略选动作 --',
            '    if ε-Greedy:',
            '        with prob ε: A_t ← random action',
            '        otherwise:   A_t ← argmax_a Q̂(a)',
            '    elif UCB1:',
            '        A_t ← argmax_a [ Q̂(a) + c·√(ln t / N(a)) ]',
            '    elif Thompson (Bernoulli):',
            '        for each a: sample μ̃_a ~ Beta(α_a, β_a)',
            '        A_t ← argmax_a μ̃_a',
            '    # -- 执行并更新 --',
            '    Observe reward R_t',
            '    N(A_t) ← N(A_t) + 1',
            '    Q̂(A_t) ← Q̂(A_t) + (R_t − Q̂(A_t)) / N(A_t)',
            '    (Thompson only) update Beta posterior'
          ]
        },

        { type: 'h2', text: '5. 三种策略对比', anchor: 'comparison' },
        {
          type: 'table',
          headers: ['维度', 'ε-Greedy', 'UCB1', 'Thompson'],
          rows: [
            ['探索方式', '均匀随机', '确定性（基于置信界）', '后验采样'],
            ['超参数', 'ε', '常数 c', '先验参数'],
            ['Regret 阶', '$O(T)$（常数 ε）/ $O(\\log T)$（衰减 ε）', '$O(\\log T)$', '$O(\\log T)$'],
            ['实现难度', '极简', '简单', '需共轭先验或采样'],
            ['实战表现', '作为 baseline', '稳定', '通常最优'],
            ['主要缺点', '"笨拙探索"', '对非平稳环境不友好', '后验难以采样时受限'],
          ]
        },

        { type: 'h2', text: '6. 拓展与工程考虑', anchor: 'extensions' },
        {
          type: 'list',
          items: [
            '<b>非平稳老虎机（Non-stationary Bandit）</b>：真实分布随时间变化，需用滑动窗口均值或指数加权平均（把固定步长 $1/N$ 换成常数 $\\alpha$）。',
            '<b>上下文老虎机（Contextual Bandit）</b>：每步可观察到"上下文" $x_t$，需学习 $\\mathbb{E}[R \\mid a, x]$，典型算法 LinUCB 将线性回归与 UCB 结合。',
            '<b>对抗式老虎机（Adversarial Bandit）</b>：奖励由对手任意设置，EXP3 算法可在此设定下保证 $O(\\sqrt{T \\log K})$ Regret。',
            '<b>从 Bandit 到完整 RL</b>：加入"状态"和"转移"后，老虎机就升级为 MDP；UCB 思想直接推广为 UCRL，Thompson 推广为 PSRL。'
          ]
        },

        {
          type: 'callout',
          tone: 'note',
          text: '理解老虎机的价值不在于解决老虎机本身，而在于它用最干净的形式暴露了 RL 的核心张力——<b>探索与利用的权衡</b>。后续的 Q-Learning、PPO、TRPO 等，本质都是在不同约束下解决这一问题的升级版。'
        },

        { type: 'h2', text: '7. 延伸阅读', anchor: 'refs' },
        {
          type: 'references',
          items: [
            { title: 'Lai, T. L., & Robbins, H. (1985). Asymptotically efficient adaptive allocation rules.' },
            { title: 'Auer, P., Cesa-Bianchi, N., & Fischer, P. (2002). Finite-time analysis of the multiarmed bandit problem. (UCB1 原论文)' },
            { title: 'Thompson, W. R. (1933). On the likelihood that one unknown probability exceeds another...' },
            { title: 'Sutton & Barto, "Reinforcement Learning: An Introduction", Chap. 2' },
            { title: 'Lattimore & Szepesvári, "Bandit Algorithms" (2020)' },
          ]
        },
      ]
    }
  },

  // ========== MDP 马尔可夫决策过程 ==========
  mdp: {
    title: '马尔可夫决策过程',
    subtitle: '让一切决策问题都可以用同一种语言描述',
    icon: '🗺️',

    // —— 白话版 ——
    plain: {
      readMinutes: 6,
      blocks: [
        {
          type: 'p',
          text: '上一节我们讲了老虎机：一个在"探索"与"利用"之间摇摆的小世界。但你可能已经注意到——老虎机太干净了。它干净到有些失真。'
        },
        {
          type: 'p',
          text: '真实世界里的决策几乎从来不是这样。你不是站在一个空无一物的赌场里，对着十台并排的机器选号。你在生活中，在岗位上，在地图里。每做一件事，你的"处境"就会改变。走错一步，下一步面对的问题就完全不一样了。'
        },
        {
          type: 'p',
          text: '下棋就是个典型的例子。这一步你走哪里，会决定下一步棋盘的样子；而棋盘的样子，又反过来决定你能走什么。开车也是如此——你此刻踩不踩刹车，决定了一秒后你是在红灯前稳稳停住，还是追尾前车。'
        },
        {
          type: 'hr-quote',
          text: '换句话说，现实里，你做的每个决定不只是为了"这一刻的奖励"，还得考虑它把你带到了什么"下一刻"。'
        },
        {
          type: 'p',
          text: '这就是老虎机所欠缺的东西——<b>状态</b>。'
        },
        { type: 'divider' },
        {
          type: 'image',
          src: IMG.mdpMaze.src,
          fallback: '🗺️',
          caption: '把问题从赌场搬到迷宫，我们就多出了"位置"这个维度。'
        },
        {
          type: 'p',
          text: '想象一个简单的迷宫：一只小机器人 🤖 站在左上角，右下角藏着一颗宝石 💎，中间星星点点散布着几颗地雷 💣。小机器人每一步可以选择向上、向下、向左、向右。走到宝石处 +10 分，踩到地雷 -10 分，每走一步 -1 分（因为我们希望它尽快抵达）。'
        },
        {
          type: 'p',
          text: '这个迷宫比老虎机多了什么？多了一件事：<b>"我现在在哪儿"</b>。'
        },
        {
          type: 'p',
          text: '同样一个动作——"向右走"——放在不同的格子里，意义是完全不一样的。站在宝石旁边的那一格向右走，下一步就是胜利；站在地雷旁边向右走，下一步就是爆炸。'
        },
        {
          type: 'p',
          text: '于是强化学习里的研究者们，把这样的问题抽象成了一种统一的形式。它有一个有点数学腔调的名字，叫 <b>马尔可夫决策过程</b>（Markov Decision Process，简称 MDP）。别被名字吓到——它其实只是在说：一切决策问题都可以拆成五件事。'
        },
        { type: 'divider' },
        { type: 'h2', text: '五件事，拼成一切决策问题' },
        {
          type: 'p',
          text: '<b>第一件事，是状态（State）。</b>它回答"我现在在哪儿"。在迷宫里，它是某一格；在下棋中，它是此刻的棋局；在自动驾驶里，它是摄像头看到的画面、车速、和方向盘的角度。换句话说，状态是"做决定时你需要知道的一切"。'
        },
        {
          type: 'p',
          text: '<b>第二件事，是动作（Action）。</b>它回答"我可以做什么"。迷宫里是上下左右，棋盘上是合法的每一步棋，开车时是油门、刹车和方向盘。'
        },
        {
          type: 'p',
          text: '<b>第三件事，是转移（Transition）。</b>它回答"我做了这件事之后，会去哪儿"。这听起来很废话对吧？但其实有个重要的细节：现实常常不听话。你踩了刹车，车可能因为地面结冰，滑得比你预想的还远一些；你想走右边的门，可能因为风把门吹开了，你却被带到了另一个房间。于是"下一格"不是一个固定的位置，而是一个带着概率的分布。'
        },
        {
          type: 'p',
          text: '<b>第四件事，是奖励（Reward）。</b>它回答"我走了这一步，值还是不值"。宝石 +10，地雷 -10，普通的一步 -1。奖励是整个强化学习世界里唯一的"价值判断"——智能体靠它知道什么是好、什么是坏。也正因为如此，奖励函数怎么设计，往往比算法本身还要关键。设计不好，智能体就会学到各种让人哭笑不得的"捷径"。'
        },
        {
          type: 'callout',
          tone: 'note',
          text: '曾经有人让机器人学开赛车，以"跑得多远"为奖励。结果它学会了在起点原地打转，因为轮胎一直在转，里程数一直在涨。你看，智能体从不违反规则，它只是无情地执行了你定义的规则。'
        },
        {
          type: 'p',
          text: '<b>第五件事，是折扣因子（Discount Factor）。</b>它回答一个略带哲学意味的问题——今天的 10 块钱，和一年后的 10 块钱，你觉得哪个更值？'
        },
        {
          type: 'p',
          text: '几乎所有人都会说"今天的"。这不仅仅是因为利息，也是因为"未来不确定"。我们用一个 0 到 1 之间的数字 γ，每经过一步就把奖励打个折。γ 越接近 1，我们越有耐心，愿意为了远处的大奖多走几步；γ 越接近 0，我们越急功近利，只看眼前。'
        },
        { type: 'divider' },
        { type: 'h2', text: '有了这五件事，然后呢？' },
        {
          type: 'p',
          text: '当你把一个问题写成了 MDP 的形式，神奇的事情就发生了——它突然变得"可计算"了。'
        },
        {
          type: 'p',
          text: '我们可以问一些非常具体的问题：如果我身处某一格，并且决定从现在起按某套规则行动下去，那么我在接下来的所有步里，平均能赚多少？这个"平均能赚多少"的数，研究者们给它取了个名字叫<b>价值</b>（Value）。'
        },
        {
          type: 'p',
          text: '价值这个概念，是理解强化学习最重要的一把钥匙。一个位置的价值高，说明"从这里出发能赚很多"；一个位置的价值低，说明"在这儿很不妙"。有了价值的概念，你做决定时就不再只盯着眼前的那一步奖励，而是会朝着"未来价值更高的地方"走。'
        },
        {
          type: 'p',
          text: '更妙的是，价值有一个优美的"递归"性质。站在某一格上，我能赚多少呢？答案是：<i>我下一步能拿到的奖励，加上我走到的下一格的价值（打了折的）</i>。也就是说，一个格子的价值，其实等于"下一个格子的价值 + 这一步的奖励"。'
        },
        {
          type: 'p',
          text: '这看似是句绕口令，但它是整个强化学习理论的基石。它有个名字，叫 <b>贝尔曼方程</b>（Bellman Equation）。后面你会在几乎每一个算法里见到它的身影。'
        },
        {
          type: 'callout',
          tone: 'tip',
          icon: '🗝️',
          text: '贝尔曼方程之所以重要，是因为它把一个"无限远的未来"问题，拆成了"下一步 + 剩下"这两件事。只要能算出"下一格的价值"，当前这一格的价值就水到渠成。这就把"计划整个未来"变成了"只往前看一步"——一个非常强大的简化。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '你可能会想：这听起来挺玄乎，但怎么真的算出来呢？别急——这正是我们下一章要讲的事。'
        },
        {
          type: 'p',
          text: '如果这个世界的"转移概率"和"奖励"你都完全知道（好比你有一份完整的迷宫地图），那我们可以用一种叫 <b>动态规划</b> 的方法，把每一格的价值都精确地算出来。'
        },
        {
          type: 'p',
          text: '但现实往往没有地图。你是个新来的小机器人，被扔进一个陌生的迷宫，一切只能靠走、靠试、靠一次次跌倒后爬起来。那种"边走边学"的方式，就是接下来的课题——时序差分（TD）。'
        },
        {
          type: 'hr-quote',
          text: 'MDP 不是一种"算法"，它是一种"语言"——一种用来描述决策问题的语言。'
        },
        {
          type: 'p',
          text: '在这之后，你所看到的几乎所有强化学习算法——Q-Learning、DQN、PPO、DDPG——本质上都是在用不同的方式，回答同一个问题：<b>给定一个 MDP，我该如何找到最好的行动策略？</b>'
        },
        {
          type: 'p',
          text: '现在，下面有一个可以动手玩的迷宫。你可以亲手调一调折扣因子、调一调"滑动概率"，看看每一格的价值会怎么随之变化。在动手的过程中，你会真切体会到这五个元素是怎样彼此牵动的。'
        },
      ]
    },

    // —— 深度版 ——
    deep: {
      readMinutes: 16,
      blocks: [
        { type: 'h2', text: '1. 从 Bandit 到 MDP', anchor: 'bandit-to-mdp' },
        {
          type: 'p',
          text: '多臂老虎机给出了决策问题的最简模型：动作、奖励、权衡探索与利用。但它缺失了两个关键维度：<b>状态</b>（决策的上下文）与<b>转移</b>（动作如何改变未来的上下文）。引入这两者，便得到强化学习的通用数学框架——马尔可夫决策过程（Markov Decision Process, MDP）。'
        },

        { type: 'h2', text: '2. MDP 的形式化定义', anchor: 'definition' },
        {
          type: 'p',
          text: '一个有限 MDP 由五元组 $\\langle \\mathcal{S}, \\mathcal{A}, P, R, \\gamma \\rangle$ 定义：'
        },
        {
          type: 'list',
          items: [
            '<b>状态空间</b> $\\mathcal{S}$：所有可能状态的集合',
            '<b>动作空间</b> $\\mathcal{A}$（或 $\\mathcal{A}(s)$，依赖状态）',
            '<b>转移核</b> $P(s\' \\mid s, a)$：在状态 $s$ 执行 $a$ 后跳到 $s\'$ 的概率',
            '<b>奖励函数</b> $R(s, a, s\')$（或期望形式 $r(s,a) = \\mathbb{E}[R_{t+1} \\mid S_t = s, A_t = a]$）',
            '<b>折扣因子</b> $\\gamma \\in [0, 1)$'
          ]
        },
        {
          type: 'callout',
          tone: 'note',
          text: '<b>马尔可夫性（Markov Property）：</b>未来只依赖当前状态和动作，与过去无关：$P(S_{t+1} \\mid S_t, A_t, S_{t-1}, A_{t-1}, \\dots) = P(S_{t+1} \\mid S_t, A_t)$。这一性质是所有 Bellman 类算法正确性的前提。'
        },

        { type: 'h2', text: '3. 策略与回报', anchor: 'policy-return' },
        { type: 'h3', text: '3.1 策略 π' },
        {
          type: 'p',
          text: '策略 $\\pi$ 是从状态到动作的映射。随机策略 $\\pi(a \\mid s) = P(A_t = a \\mid S_t = s)$ 给出动作的概率分布；确定性策略 $\\pi(s) = a$ 直接输出动作。RL 的目标是寻找最优策略 $\\pi^*$。'
        },

        { type: 'h3', text: '3.2 回报（Return）' },
        {
          type: 'p',
          text: '回报是从时间步 $t$ 起的折扣累积奖励：'
        },
        { type: 'math', tex: 'G_t = R_{t+1} + \\gamma R_{t+2} + \\gamma^2 R_{t+3} + \\cdots = \\sum_{k=0}^{\\infty} \\gamma^k R_{t+k+1}' },
        {
          type: 'p',
          text: '折扣因子 $\\gamma$ 的三重作用：① 使无限和收敛（当 $\\gamma < 1$ 且奖励有界时 $|G_t| < R_{\\max} / (1-\\gamma)$）；② 建模"未来不确定性"；③ 调节时间偏好（$\\gamma \\to 1$ 偏远视，$\\gamma \\to 0$ 偏近视）。'
        },

        { type: 'h2', text: '4. 价值函数', anchor: 'value-functions' },
        { type: 'h3', text: '4.1 状态价值 $V^\\pi$' },
        { type: 'math', tex: 'V^\\pi(s) = \\mathbb{E}_\\pi \\left[ G_t \\mid S_t = s \\right]' },
        { type: 'h3', text: '4.2 动作价值 $Q^\\pi$' },
        { type: 'math', tex: 'Q^\\pi(s, a) = \\mathbb{E}_\\pi \\left[ G_t \\mid S_t = s,\\, A_t = a \\right]' },
        {
          type: 'p',
          text: '两者的关系：$V^\\pi(s) = \\sum_a \\pi(a \\mid s) Q^\\pi(s, a)$；或反之 $Q^\\pi(s,a) = r(s,a) + \\gamma \\sum_{s\'} P(s\' \\mid s,a) V^\\pi(s\')$。'
        },

        { type: 'h2', text: '5. Bellman 方程', anchor: 'bellman' },
        { type: 'h3', text: '5.1 Bellman 期望方程' },
        {
          type: 'derivation',
          steps: [
            { note: '由回报的递归性 $G_t = R_{t+1} + \\gamma G_{t+1}$ 代入价值函数定义：', tex: 'V^\\pi(s) = \\mathbb{E}_\\pi[R_{t+1} + \\gamma G_{t+1} \\mid S_t = s]' },
            { note: '利用全期望定律对动作求和：', tex: 'V^\\pi(s) = \\sum_a \\pi(a \\mid s) \\sum_{s\',r} P(s\', r \\mid s, a) \\left[ r + \\gamma V^\\pi(s\') \\right]' },
            { note: '对应的动作价值形式：', tex: 'Q^\\pi(s,a) = \\sum_{s\',r} P(s\',r \\mid s,a) \\left[ r + \\gamma \\sum_{a\'} \\pi(a\' \\mid s\') Q^\\pi(s\', a\') \\right]' }
          ]
        },

        { type: 'h3', text: '5.2 Bellman 最优方程' },
        {
          type: 'p',
          text: '最优价值满足'
        },
        { type: 'math', tex: 'V^*(s) = \\max_a \\sum_{s\'} P(s\' \\mid s, a) \\left[ r(s,a,s\') + \\gamma V^*(s\') \\right]' },
        { type: 'math', tex: 'Q^*(s,a) = \\sum_{s\'} P(s\' \\mid s,a) \\left[ r(s,a,s\') + \\gamma \\max_{a\'} Q^*(s\', a\') \\right]' },
        {
          type: 'p',
          text: '这是一组非线性方程（因为含 $\\max$），但可以通过<b>不动点迭代</b>求解——这正是下一章"动态规划"的主线。'
        },

        { type: 'h2', text: '6. 为什么 Bellman 算子是压缩的', anchor: 'contraction' },
        {
          type: 'p',
          text: '将 Bellman 最优算子写作 $\\mathcal{T}^* : \\mathbb{R}^{|\\mathcal{S}|} \\to \\mathbb{R}^{|\\mathcal{S}|}$：'
        },
        { type: 'math', tex: '(\\mathcal{T}^* V)(s) = \\max_a \\sum_{s\'} P(s\' \\mid s,a) [ r + \\gamma V(s\') ]' },
        {
          type: 'p',
          text: '$\\mathcal{T}^*$ 是 $\\gamma$-压缩映射，即对任意 $V_1, V_2$：$\\|\\mathcal{T}^* V_1 - \\mathcal{T}^* V_2\\|_\\infty \\le \\gamma \\|V_1 - V_2\\|_\\infty$。由 Banach 不动点定理，任意初值反复作用 $\\mathcal{T}^*$ 都收敛到唯一不动点 $V^*$。这保证了<b>价值迭代（Value Iteration）</b>的正确性，也是 Q-Learning 与 DQN 等一大类算法的理论支撑。'
        },

        { type: 'h2', text: '7. 策略改进定理', anchor: 'policy-improvement' },
        {
          type: 'p',
          text: '给定策略 $\\pi$ 及其价值 $V^\\pi$，定义贪心策略 $\\pi\'(s) = \\arg\\max_a Q^\\pi(s, a)$。策略改进定理保证 $V^{\\pi\'}(s) \\ge V^\\pi(s)$，对所有 $s$ 成立；且当两者相等时 $\\pi\'$ 即为最优策略。这条定理是<b>策略迭代（Policy Iteration）</b>"评估—改进"循环收敛性的核心。'
        },

        { type: 'h2', text: '8. 终止状态与 Episode', anchor: 'episodic' },
        {
          type: 'p',
          text: '若存在"吸收终止态"，则问题是 <b>episodic</b> 的；否则是 <b>continuing</b> 的。Episodic 任务中允许 $\\gamma = 1$；Continuing 任务必须 $\\gamma < 1$ 保证回报有界。'
        },

        { type: 'h2', text: '9. MDP 之外', anchor: 'beyond' },
        {
          type: 'list',
          items: [
            '<b>POMDP</b>（部分可观测 MDP）：智能体只能观察到状态的部分函数 $o = O(s)$，需用置信状态或 RNN 记忆。',
            '<b>SMDP</b>（半 MDP）：动作持续时间可变，用于 Options 框架与层次化 RL。',
            '<b>约束 MDP（CMDP）</b>：除回报外加入约束期望 $\\mathbb{E}[\\sum \\gamma^t C_t] \\le d$，用于安全 RL。',
            '<b>平均回报 MDP</b>：关注 $\\lim_T \\frac{1}{T} \\mathbb{E}[\\sum_t R_t]$，适合长期稳态问题。'
          ]
        },

        { type: 'h2', text: '10. MDP 建模实践要点', anchor: 'practical' },
        {
          type: 'table',
          headers: ['坑', '表现', '对策'],
          rows: [
            ['状态定义不满足马尔可夫性', '同样状态下回报波动极大，训练不收敛', '把关键历史信息纳入状态（如加速度、上一步动作）'],
            ['奖励过于稀疏', '长时间全零反馈，智能体无法学习', 'Reward shaping、课程学习、好奇心驱动'],
            ['奖励可被刷分利用（reward hacking）', '智能体学到违反设计意图的"捷径"', '设计最终目标奖励而非过程奖励，或加约束'],
            ['动作粒度不当', '连续问题被过度离散化而损失精度', '改用连续动作算法（DDPG、SAC）或更细的离散化'],
          ]
        },

        {
          type: 'callout',
          tone: 'tip',
          text: 'MDP 是 RL 的"规范书"——任何强化学习算法的设计与分析，都是围绕"如何在一个 MDP 上找到 $\\pi^*$"展开的。理解了 MDP，你就拥有了阅读所有 RL 论文的统一坐标系。'
        },

        { type: 'h2', text: '11. 延伸阅读', anchor: 'refs' },
        {
          type: 'references',
          items: [
            { title: 'Sutton & Barto, "Reinforcement Learning: An Introduction" (2nd ed.), Chap. 3' },
            { title: 'Puterman, "Markov Decision Processes: Discrete Stochastic Dynamic Programming" (1994)' },
            { title: 'Bertsekas, "Dynamic Programming and Optimal Control", Vol. I' },
            { title: 'Kaelbling et al., "Planning and Acting in Partially Observable Stochastic Domains" (POMDP)' }
          ]
        }
      ]
    }
  },

  // ========== PPO · 近端策略优化 ==========
  ppo: {
    title: 'PPO · 近端策略优化',
    subtitle: '工业界最广泛使用的 RL 算法，也是 ChatGPT 背后的那把"剪刀"',
    icon: '✂️',

    // —— 白话版 ——
    plain: {
      readMinutes: 7,
      blocks: [
        {
          type: 'p',
          text: '到 PPO 的时候，你已经走了一段不短的路了。我们从老虎机聊到 MDP，又从动态规划聊到 Q-Learning，再聊到 REINFORCE 这种"直接优化策略"的想法。'
        },
        {
          type: 'p',
          text: '但你可能已经隐约感觉到——每一种看似聪明的办法，实际用起来都会遇到一些令人头疼的问题。'
        },
        {
          type: 'p',
          text: 'REINFORCE 的毛病是抖得厉害。它靠整条轨迹的"总奖励"来更新策略，可一条好的轨迹和一条坏的轨迹之间差别巨大，导致每次更新都像在暴风雨里扬帆——方向飘忽，训练时好时坏。'
        },
        {
          type: 'p',
          text: 'Actor-Critic 给抖动问题打了个补丁：让一个"评论家"随时估计"当前局势到底几分"，再用它作为参照去修正演员的动作。方差确实下去了，可是新的麻烦也来了——<b>每一步更新到底要迈多大？</b>'
        },
        {
          type: 'hr-quote',
          text: '在强化学习里，步子太小会永远学不完，步子太大会一下子崩掉。'
        },
        {
          type: 'p',
          text: '这话一点都不夸张。RL 里的策略更新是一个奇妙的"正反馈系统"——你这一步走偏一点，下一次采集到的数据就会偏得更多，再下一次更新就会更不稳。很多时候，一个看起来训练得不错的智能体，在某一次"过大"的更新之后，忽然就崩了，再也回不来。'
        },
        {
          type: 'p',
          text: '所以问题就变成了：我们能不能规定一下——<b>新的策略，不许离旧的策略太远</b>？'
        },
        { type: 'divider' },
        { type: 'h2', text: 'TRPO：在旧策略身边画一个"安全圈"' },
        {
          type: 'p',
          text: 'PPO 并不是第一个想到这一点的算法。在它之前，有一个叫 <b>TRPO</b>（信赖域策略优化）的方法，就干了这件事：它要求新策略和旧策略的"距离"不能超过一个预设的阈值。'
        },
        {
          type: 'p',
          text: '形象地说，TRPO 在旧策略所在的位置画了一个小圆圈——新策略无论长什么样，都必须落在这个圆圈里。圆圈叫"信赖域"，意思是"在这个范围内，我相信自己的估计是靠谱的，所以可以安心优化"。'
        },
        {
          type: 'p',
          text: 'TRPO 的思路无可挑剔，效果也不错。但它有一个现实的缺点——<b>它太复杂了</b>。'
        },
        {
          type: 'p',
          text: '为了严格守住那个"圆圈"的边界，TRPO 需要去计算一个叫 Fisher 信息矩阵的二阶量，用共轭梯度法求近似自然梯度，再用线性搜索保证约束不被违反。实现起来代码又长、又难调、又慢。'
        },
        {
          type: 'callout',
          tone: 'note',
          icon: '🤔',
          text: '这时候，OpenAI 的研究者们提出了一个看似朴素但极为精妙的问题：<br>"我们真的需要这么严格地守住那个圆圈吗？如果只是用一把剪刀把走出圆圈的部分直接剪掉，效果会不会差不多？"'
        },
        { type: 'divider' },
        { type: 'h2', text: 'PPO：一把"剪刀"解决所有问题' },
        {
          type: 'p',
          text: 'PPO 的全名叫 <b>Proximal Policy Optimization</b>，"近端"两个字就是它的精神——不追求严格的距离约束，只要让策略不要跑得太远就行。而它做到这一点的方法，简单得让人觉得像个玩笑：'
        },
        {
          type: 'p',
          text: '它比较新旧策略在同一个状态下，对同一个动作给出的概率。这个比值叫做"概率比"——如果新策略比旧策略更倾向于这个动作，比值就大于 1；反之小于 1。'
        },
        {
          type: 'p',
          text: '然后 PPO 规定：<b>这个比值不能超出 [0.8, 1.2] 这个范围。</b>'
        },
        {
          type: 'p',
          text: '就这么简单。超了？剪掉。低了？也剪掉。'
        },
        {
          type: 'p',
          text: '具体一点说——当一个动作是"好动作"时（带来了正的优势），PPO 希望新策略更爱做它，所以比值会变大。但 PPO 说："涨可以，最多涨到 1.2 倍，再高就没奖励了。" 这样做的好处是：万一这个动作其实没那么好，你也不会一下子把策略拉偏太远。'
        },
        {
          type: 'p',
          text: '当一个动作是"坏动作"时（带来了负的优势），PPO 希望新策略少做它，所以比值会变小。PPO 也同样规定："降可以，最低降到 0.8 倍，再低就不用更降了。" 这样做是为了防止某一次意外的坏数据把一个本来还行的动作给彻底"打死"。'
        },
        {
          type: 'callout',
          tone: 'tip',
          icon: '✂️',
          text: '这把"剪刀"的意义在于——它用一条极简的规则，既防止了"步子过大"的崩溃，也给了算法足够的灵活性去真正学到东西。'
        },
        { type: 'divider' },
        { type: 'h2', text: '为什么这个朴素的想法赢了？' },
        {
          type: 'p',
          text: 'PPO 2017 年由 OpenAI 提出。它没有什么炫目的数学，没有复杂的二阶优化，就一把剪刀。但它很快就取代了 TRPO，成为工业界最广泛使用的强化学习算法。'
        },
        {
          type: 'p',
          text: '为什么？因为它<b>足够好</b>，同时<b>足够简单</b>。'
        },
        {
          type: 'p',
          text: '在深度学习的世界里，这两者合在一起，就是一种巨大的优势。它意味着代码容易写对、模型容易调通、团队协作时不容易出错、在新的任务上可以很快试出效果。那些需要"精密调参"的华丽算法，往往输给了"能让所有人都跑得动"的粗朴方法。'
        },
        {
          type: 'p',
          text: '你也许听过一个故事——2022 年的 ChatGPT，它在训练过程中要用人类反馈去"教"模型什么叫"好回答"。这个被称为 <b>RLHF</b> 的过程，最核心的那一步，用的就是 PPO。换句话说，你每天在用的那个"懂礼貌、会拒绝、能讲道理"的 ChatGPT，背后的训练算法，正是这把"剪刀"。'
        },
        {
          type: 'hr-quote',
          text: '一个简单的规则，改变了整个产业——这就是 PPO 的故事。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '现在回头看看你走过的这条路：'
        },
        {
          type: 'p',
          text: '从老虎机里的"探索与利用"，到 MDP 用五元素描述一切决策问题，再到 Q-Learning 学会在不知道模型时也能学习，再到 REINFORCE 跳出价值函数去直接优化策略，又到 Actor-Critic 降低了抖动，再到 TRPO 想办法稳住步子，最后到 PPO——用一把剪刀把所有问题收拾得干干净净。'
        },
        {
          type: 'p',
          text: '你会发现强化学习的演进，并不是一堆互相无关的算法堆砌在一起。它更像是一场一代代研究者接力的对话——一个人提出想法，另一个人发现问题，再一个人提出更简单的解法——最终一步步从"玩具问题"走到了"改变世界的工具"。'
        },
        {
          type: 'p',
          text: '下面是一个可以动手玩的 PPO 可视化。拖一拖"优势 A"和"裁剪 ε"的滑块，你就能直观看到那把"剪刀"是如何在图上真实地"切"下来的。这是比任何公式都更直观的理解方式。'
        }
      ]
    },

    // —— 深度版 ——
    deep: {
      readMinutes: 18,
      blocks: [
        { type: 'h2', text: '1. 背景：策略梯度的步长难题', anchor: 'background' },
        {
          type: 'p',
          text: '记策略为 $\\pi_\\theta$，目标函数为期望回报 $J(\\theta) = \\mathbb{E}_{\\tau \\sim \\pi_\\theta}[R(\\tau)]$。策略梯度定理给出 $\\nabla_\\theta J(\\theta) = \\mathbb{E}_{s,a \\sim \\pi_\\theta} \\left[ \\nabla_\\theta \\log \\pi_\\theta(a \\mid s) \\cdot A^{\\pi_\\theta}(s,a) \\right]$。'
        },
        {
          type: 'p',
          text: 'Vanilla 策略梯度（REINFORCE / A2C）的核心难点是<b>步长敏感</b>：参数空间的小更新可能导致策略空间的大变化，进而使后续采样分布严重偏离，出现<b>训练崩溃（performance collapse）</b>。'
        },

        { type: 'h2', text: '2. TRPO：带 KL 约束的策略优化', anchor: 'trpo' },
        {
          type: 'p',
          text: '为避免策略突变，Schulman et al. (2015) 提出 TRPO，把每步更新限制在旧策略的"信赖域"内：'
        },
        {
          type: 'math',
          tex: '\\begin{aligned} \\max_\\theta \\quad & \\mathbb{E}_{s,a \\sim \\pi_{\\theta_{\\text{old}}}} \\left[ \\frac{\\pi_\\theta(a|s)}{\\pi_{\\theta_{\\text{old}}}(a|s)} \\hat A_t \\right] \\\\ \\text{s.t.} \\quad & \\mathbb{E}_s \\left[ D_{\\mathrm{KL}}(\\pi_{\\theta_{\\text{old}}}(\\cdot|s) \\| \\pi_\\theta(\\cdot|s)) \\right] \\le \\delta \\end{aligned}'
        },
        {
          type: 'p',
          text: 'TRPO 在理论上有单调改进保证，但实现需要：① 计算 Fisher 信息矩阵向量积（FIM-vector product）；② 共轭梯度求近似自然梯度方向；③ 线性搜索保证 KL 约束成立。工程复杂度高、难以与 RNN / dropout / 参数共享等常见深度学习技巧结合。'
        },

        { type: 'h2', text: '3. PPO-Clip：用裁剪替代约束', anchor: 'ppo-clip' },
        {
          type: 'p',
          text: '设概率比 $r_t(\\theta) = \\dfrac{\\pi_\\theta(a_t | s_t)}{\\pi_{\\theta_{\\text{old}}}(a_t | s_t)}$。PPO-Clip（Schulman et al., 2017）的代理目标函数为：'
        },
        {
          type: 'math',
          tex: 'L^{\\mathrm{CLIP}}(\\theta) = \\mathbb{E}_t \\left[ \\min\\big( r_t(\\theta)\\,\\hat A_t,\\ \\mathrm{clip}(r_t(\\theta),\\ 1-\\epsilon,\\ 1+\\epsilon)\\,\\hat A_t \\big) \\right]',
          label: 'PPO-CLIP'
        },

        { type: 'h3', text: '3.1 为什么 min + clip 组合能够限制更新？' },
        {
          type: 'derivation',
          steps: [
            { note: '当 $\\hat A_t > 0$（好动作）：期望增大 $r_t$。裁剪上界为 $1+\\epsilon$，超出后目标函数不再随 $r_t$ 增长：', tex: 'L = \\min(r_t \\hat A_t,\\ (1+\\epsilon)\\hat A_t) = (1+\\epsilon)\\hat A_t, \\quad r_t > 1+\\epsilon' },
            { note: '当 $\\hat A_t < 0$（坏动作）：期望减小 $r_t$。裁剪下界为 $1-\\epsilon$，低于后目标函数不再继续下降：', tex: 'L = \\min(r_t \\hat A_t,\\ (1-\\epsilon)\\hat A_t) = (1-\\epsilon)\\hat A_t, \\quad r_t < 1-\\epsilon' },
            { note: '因此梯度在 $r_t$ 越过 $[1-\\epsilon, 1+\\epsilon]$ 时被"关闭"，策略不会因一次过大偏移而崩溃。' , tex: '\\frac{\\partial L^{\\mathrm{CLIP}}}{\\partial \\theta} = 0,\\quad \\text{当 clip 激活时}' }
          ]
        },
        {
          type: 'callout',
          tone: 'note',
          text: '注意：PPO-Clip 并<b>没有</b>真正约束 KL 散度，它只是在代理目标中"移除"了超出区间后的改进激励。实际运行时 KL 可能偶尔越界，但因梯度为零，越界效应会被后续步骤缓解。这种"软约束"使得实现极简，也是 PPO 能够广泛使用的关键。'
        },

        { type: 'h2', text: '4. 广义优势估计（GAE）', anchor: 'gae' },
        {
          type: 'p',
          text: '优势 $\\hat A_t$ 的选择对 PPO 性能至关重要。Schulman et al. (2015b) 提出 <b>GAE</b>，在 bias 与 variance 之间提供了可调折衷：'
        },
        {
          type: 'math',
          tex: '\\hat A_t^{\\mathrm{GAE}(\\gamma, \\lambda)} = \\sum_{k=0}^{\\infty} (\\gamma \\lambda)^k \\delta_{t+k}, \\quad \\delta_t = r_t + \\gamma V(s_{t+1}) - V(s_t)'
        },
        {
          type: 'list',
          items: [
            '$\\lambda = 0$：退化为单步 TD 误差（低方差、高偏差）',
            '$\\lambda = 1$：退化为蒙特卡洛回报（高方差、低偏差）',
            '实践经验：$\\gamma = 0.99, \\lambda = 0.95$ 在大多数任务上效果不错'
          ]
        },

        { type: 'h2', text: '5. 完整目标函数', anchor: 'full-objective' },
        {
          type: 'p',
          text: 'PPO 的实际优化目标是三部分加权和：'
        },
        {
          type: 'math',
          tex: 'L^{\\mathrm{PPO}}(\\theta, \\phi) = \\mathbb{E}_t \\Big[ L^{\\mathrm{CLIP}}(\\theta) - c_1 \\cdot L^{\\mathrm{VF}}(\\phi) + c_2 \\cdot \\mathcal{H}[\\pi_\\theta](s_t) \\Big]'
        },
        {
          type: 'list',
          items: [
            '$L^{\\mathrm{CLIP}}$：上节的裁剪目标，训练策略',
            '$L^{\\mathrm{VF}} = (V_\\phi(s_t) - \\hat R_t)^2$：价值网络的回归损失',
            '$\\mathcal{H}[\\pi_\\theta]$：策略熵，鼓励探索；$c_2$ 一般 0.0~0.01'
          ]
        },

        { type: 'h2', text: '6. 算法伪代码', anchor: 'pseudocode' },
        {
          type: 'pseudocode',
          title: 'PPO-Clip (Actor-Critic)',
          lines: [
            'Initialize: policy θ, value φ',
            'for iteration = 1, 2, ... do',
            '    # ---- 1. 收集 Rollout ----',
            '    for actor = 1, 2, ..., N do',
            '        Run π_θ_old in env for T timesteps',
            '        Compute advantages Â_1..Â_T via GAE(γ, λ)',
            '        Compute returns R̂_t = Â_t + V_φ(s_t)',
            '    Collect batch D = {(s_t, a_t, Â_t, R̂_t, log π_θ_old(a_t|s_t))}',
            '',
            '    # ---- 2. 多 epoch 小批更新 ----',
            '    for epoch = 1, 2, ..., K do',
            '        for minibatch M ⊂ D do',
            '            Compute r_t = π_θ(a_t|s_t) / π_θ_old(a_t|s_t)',
            '            L_CLIP = E[ min( r_t Â_t, clip(r_t, 1-ε, 1+ε) Â_t ) ]',
            '            L_VF   = E[ (V_φ(s_t) - R̂_t)² ]',
            '            L_ENT  = E[ H[π_θ](s_t) ]',
            '            L = -L_CLIP + c1 · L_VF - c2 · L_ENT',
            '            Update θ, φ by Adam on ∇L',
            '    θ_old ← θ'
          ]
        },

        { type: 'h2', text: '7. 关键实现细节', anchor: 'tricks' },
        {
          type: 'p',
          text: 'Engstrom et al. (2020) 在"Implementation Matters in Deep RL"中指出，PPO 的公开实现平均使用了 9 个以上的"工程技巧"，它们对最终性能的影响往往不亚于主算法。核心要点：'
        },
        {
          type: 'table',
          headers: ['技巧', '作用', '常用配置'],
          rows: [
            ['优势归一化', '稳定 $L^{\\mathrm{CLIP}}$ 的尺度', '每个 minibatch 内 $\\hat A$ 减均值除标准差'],
            ['奖励缩放', '避免价值函数数值发散', '对 reward 做滑动标准差缩放'],
            ['观测归一化', '适配不同特征尺度', '对 state 维持 running mean/std'],
            ['梯度裁剪', '防止大梯度突刺', '全局 L2 norm $\\le 0.5$'],
            ['学习率退火', '后期精细收敛', '线性衰减到 0'],
            ['价值函数裁剪', '限制 $V_\\phi$ 的更新幅度', '类似 CLIP 的形式应用于 value head'],
            ['正交初始化', '策略网络稳定起步', '输出层 gain=0.01'],
            ['Early stopping on KL', '防止 epoch 内过度更新', '当 approx KL > 1.5·target 时跳出'],
          ]
        },

        { type: 'h2', text: '8. PPO 家族与变体', anchor: 'variants' },
        {
          type: 'list',
          items: [
            '<b>PPO-Penalty：</b>原论文另一种形式，$L = \\mathbb{E}[r_t \\hat A_t] - \\beta \\cdot \\mathrm{KL}$，$\\beta$ 自适应调节。工程上不如 Clip 流行。',
            '<b>PPG（Phasic Policy Gradient）：</b>策略与价值使用不同更新相位，进一步提升样本效率。',
            '<b>GRPO（DeepSeek, 2024）：</b>去掉价值网络，用组内样本的奖励标准化得到群体优势，专为 LLM 对齐设计。',
            '<b>DAPO / Dr. GRPO：</b>进一步改进 LLM-RL 训练稳定性，修正长序列下的梯度偏差。'
          ]
        },

        { type: 'h2', text: '9. PPO 与 RLHF', anchor: 'rlhf' },
        {
          type: 'p',
          text: '在 Ouyang et al. (2022) 的 InstructGPT 工作中，PPO 被用于语言模型对齐。额外添加了两项工程修改：'
        },
        {
          type: 'olist',
          items: [
            '在代理目标中加入 <b>KL 惩罚项</b> $-\\beta \\cdot \\mathrm{KL}(\\pi_\\theta \\| \\pi_{\\mathrm{SFT}})$，防止 RL 阶段破坏预训练/SFT 的语言能力。',
            '在奖励中混入一定比例的 <b>预训练损失</b>（PPO-ptx），进一步抑制能力退化。'
          ]
        },
        {
          type: 'p',
          text: '这一配方成为了 ChatGPT / Claude / LLaMA-Instruct 等早期 LLM 对齐的标准流程。'
        },

        { type: 'h2', text: '10. 常见问题（FAQ）', anchor: 'faq' },
        {
          type: 'list',
          items: [
            '<b>为什么 PPO 能对同一批数据做多 epoch 更新而不崩？</b> —— 因为 clip 限制了每次更新幅度；但 epoch 过多仍会导致 KL 超界，通常 K=3~10。',
            '<b>ε 如何选？</b> —— 经典值 $\\epsilon = 0.2$。离散动作空间可更小，连续空间可更大。大模型对齐中常取 $\\epsilon = 0.1$。',
            '<b>PPO 是 on-policy 还是 off-policy？</b> —— 严格来说是 <b>near on-policy</b>：只在旧策略附近使用重要性采样修正，不具备经验回放的能力。',
            '<b>何时不该用 PPO？</b> —— 极其稀疏奖励（用 PPO + 内在奖励 / 课程学习）、纯离线数据（改用 CQL / IQL 等离线 RL）、需要样本效率极高的真机任务（考虑 SAC / TD3）。'
          ]
        },

        { type: 'h2', text: '11. 延伸阅读', anchor: 'refs' },
        {
          type: 'references',
          items: [
            { title: 'Schulman et al. "Proximal Policy Optimization Algorithms" (2017)', url: 'https://arxiv.org/abs/1707.06347' },
            { title: 'Schulman et al. "Trust Region Policy Optimization" (ICML 2015)', url: 'https://arxiv.org/abs/1502.05477' },
            { title: 'Schulman et al. "High-Dimensional Continuous Control Using GAE" (ICLR 2016)', url: 'https://arxiv.org/abs/1506.02438' },
            { title: 'Engstrom et al. "Implementation Matters in Deep Policy Gradients" (ICLR 2020)', url: 'https://arxiv.org/abs/2005.12729' },
            { title: 'Ouyang et al. "Training Language Models to Follow Instructions with Human Feedback" (2022)', url: 'https://arxiv.org/abs/2203.02155' },
            { title: 'DeepSeek-AI, "DeepSeekMath: Pushing the Limits of Mathematical Reasoning" (GRPO, 2024)' }
          ]
        }
      ]
    }
  },

  // ========== 初探强化学习 ==========
  intro: {
    title: '初探强化学习',
    subtitle: '在机器学习的版图上，强化学习到底是一块什么样的地盘？',
    icon: '🌱',

    plain: {
      readMinutes: 6,
      blocks: [
        {
          type: 'p',
          text: '说起"机器学习"，大多数人脑子里会先跳出两个画面。一个是"给它看一万张猫的照片，它学会认猫"，另一个是"给它一堆没标签的数据，它自己把相似的东西聚到一起"。前者叫监督学习，后者叫无监督学习。它们听起来几乎覆盖了所有可以想象的学习场景。'
        },
        {
          type: 'p',
          text: '但生活里还有第三种学习方式——它既不是有人手把手教你正确答案，也不只是观察数据的分布规律。它是一种更原始、更贴近生命本身的东西。'
        },
        {
          type: 'hr-quote',
          text: '你伸手去碰火，被烫了一下，从此学会了"火是危险的"。'
        },
        {
          type: 'p',
          text: '没有人给你一份标注好的数据集告诉你"火=危险"，也没有一套关于"万物冷热分布"的统计分析摆在你面前。你只是<b>做了一件事，世界给你一个反馈，你根据这个反馈调整了下次的行为</b>。一只小狗学会拒绝讨厌的食物、一个婴儿学会扶着墙走路、你学会骑自行车——其实都是同一种学习方式。'
        },
        {
          type: 'p',
          text: '这种学习，有一个名字，叫<b>强化学习</b>（Reinforcement Learning）。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '它的特殊之处在于：没有"标准答案"这种东西。你做出一个动作，环境只会给你一个数字——可能是奖励，也可能是惩罚。它不会告诉你"你本来应该怎么做"，更不会每一步都耐心指导。你得<b>自己从这些零碎的反馈里，拼凑出一套行为准则</b>。'
        },
        {
          type: 'p',
          text: '更棘手的是，奖励常常是延迟的。下一盘棋，你走了第三步妙招，但输赢要等 40 步之后才分晓。你怎么知道是那第三步救了你，还是第三十步才是真正的关键？这叫<b>信用分配问题</b>——历史上每一步到底贡献了多少？这是强化学习要解的核心谜题之一。'
        },
        {
          type: 'callout',
          tone: 'tip',
          icon: '💡',
          text: '一个监督学习算法要学会"识别猫"，只要给它足够多"这是猫"的图片。一个强化学习算法要学会"下棋"，你只能告诉它"最后赢了"，它得自己摸索清楚路上每一步的价值。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '那强化学习里都有哪些"角色"？其实就那么几个。'
        },
        {
          type: 'p',
          text: '中间站着的那个，我们叫它<b>智能体</b>（Agent）——它就是学习者，是要做决策的主体。围绕它的整个外部世界，叫<b>环境</b>（Environment）。智能体每一刻都能感知到环境的某种样子，这个样子就叫<b>状态</b>（State）。基于当前状态，它做出一个<b>动作</b>（Action），这个动作改变了环境，环境就给它一个<b>奖励</b>（Reward），同时进入新的状态。'
        },
        {
          type: 'p',
          text: '这样一来二去，循环往复，就构成了强化学习里最基本的节奏。想象一下下围棋：你看着棋盘的样子（状态），想好一步（动作），对手回应之后棋盘变了，你看到结果是好是坏（奖励），再看新棋盘，再下一步……生活中几乎每一个"做决定"的场景，都能套进这个循环。'
        },
        {
          type: 'p',
          text: '而智能体心里那个"在什么状态下倾向于做什么动作"的偏好，有个专门的名字，叫<b>策略</b>（Policy）。你可以把它理解成这个智能体的"性格"或者"行为习惯"。强化学习要做的事情，说到底只有一件——<b>不断调整这个策略，让它在长期里拿到更多奖励</b>。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '不过，"长期"这两个字，值得多聊两句。'
        },
        {
          type: 'p',
          text: '如果一个智能体只看眼前，它就成了短视的机会主义者。拉你去短视频里无休止地刷下去——当下你确实很快乐，但第二天醒来发现浪费了一整晚，这就是短视。下棋时贪吃一个卒子，忽略了对方正在悄悄布下的杀阵，也是短视。'
        },
        {
          type: 'p',
          text: '所以强化学习不追求"每一步都最好"，它追求的是<b>"从现在开始，所有未来奖励加在一起最大"</b>。为此它甚至愿意在当下吃亏——先走一步看起来没用的棋，为了三步之后的杀招。'
        },
        {
          type: 'p',
          text: '为了让这件事可计算，人们给未来的奖励打了个折——越远的奖励，折算到当下价值越低。这个折扣，用希腊字母 γ（gamma）来记。它既是一种数学上的工具，也反映了一种朴素的哲学：远处的幸福当然值得争取，但前提是近处的事情不能垮掉。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '说到这里，你会发现强化学习其实不太像别的"学习"，倒更像一种<b>"行为艺术"</b>。它不是在静态的数据里发掘规律，而是在活生生的互动中形成习惯。它的学生不坐在教室里，而是在赛场、实验室、模拟器里跌跌撞撞地试错。它的老师不讲课，只在每次动作后扔下一个数字——或褒或贬。'
        },
        {
          type: 'p',
          text: '这也是为什么它既最像"人"，也最难。它要求算法<b>在不完全的信息下行动、在延迟的反馈中归因、在短期与长期之间权衡</b>。这几件事任何一件都不简单。'
        },
        {
          type: 'p',
          text: '但也正因如此，当它成功的时候，效果才如此惊艳。AlphaGo 在围棋上碾压人类，不是因为它记住了一万本棋谱，而是它通过自己和自己对弈的几百万局，长出了一种人类难以言喻的"棋感"。机器人学会走路，不是因为工程师把每一块肌肉的收缩顺序写死，而是它摔倒几千次之后自己摸清了平衡的道理。而我们今天在用的 ChatGPT，背后也有一层叫做 RLHF 的机制——它基于人类对回答的偏好反馈，把一个"只会预测下一个词"的语言模型，训练成了一个会聊天、会推理、会拒绝不该做的事的助手。'
        },
        {
          type: 'hr-quote',
          text: '强化学习的精神，其实就一句话——<b>在世界里行动，从反馈里成长。</b>'
        },
        {
          type: 'p',
          text: '接下来的旅程，我们会从最简单的情境出发——一台老虎机的抉择——逐步走到最复杂的大模型对齐。每一步都不跳跃，每一个算法都会回答一个具体的问题：如何评估好坏？如何更新策略？如何在不稳定中稳住？当你走完这条路，你会发现：AlphaGo、PPO、DeepSeek，其实共享着同一套思考方式。'
        },
        {
          type: 'p',
          text: '现在，从下一章开始，我们就要跳进这个世界了。'
        },
      ]
    },

    deep: {
      readMinutes: 10,
      blocks: [
        { type: 'h2', text: '1. 强化学习在机器学习版图中的位置', anchor: 'position' },
        {
          type: 'p',
          text: '机器学习通常被分为三大范式：监督学习（Supervised Learning）、无监督学习（Unsupervised Learning）和强化学习（Reinforcement Learning, RL）。它们的本质差别不在于"是否有标签"，而在于<b>信号的形式</b>。'
        },
        {
          type: 'table',
          headers: ['范式', '输入', '监督信号', '目标'],
          rows: [
            ['监督学习', '样本 $x$', '标签 $y$（告诉你正确答案）', '拟合条件分布 $p(y \\mid x)$'],
            ['无监督学习', '样本 $x$', '无', '建模 $p(x)$ 或学习表示'],
            ['强化学习', '状态 $s_t$', '标量奖励 $r_t$（评价性反馈）', '最大化累计奖励的期望']
          ]
        },
        {
          type: 'p',
          text: '强化学习的监督信号是<b>评价性</b>（evaluative）而非<b>指令性</b>（instructive）的：它只告诉你"这个动作有多好"，不告诉你"本来应该做什么"。这种设定下，学习者必须通过主动尝试来获取数据，而不是从固定的数据集里被动学习。'
        },

        { type: 'h2', text: '2. 交互循环：Agent-Environment 接口', anchor: 'loop' },
        {
          type: 'p',
          text: '在离散时间设定下，RL 的交互可用下述循环刻画：在时刻 $t$，智能体观察到状态 $s_t \\in \\mathcal{S}$，执行动作 $a_t \\in \\mathcal{A}$，环境根据动力学返回奖励 $r_t \\in \\mathbb{R}$ 和新状态 $s_{t+1}$。'
        },
        {
          type: 'math',
          tex: 's_t \\xrightarrow{a_t \\sim \\pi(\\cdot \\mid s_t)} (r_t, s_{t+1}) \\sim P(\\cdot, \\cdot \\mid s_t, a_t)',
          label: '交互循环'
        },
        {
          type: 'p',
          text: '其中 $\\pi$ 是策略，$P$ 是环境的转移与奖励分布。这个"交互"才是 RL 区别于其他范式的根源。'
        },

        { type: 'h2', text: '3. 累计回报与折扣因子', anchor: 'return' },
        {
          type: 'p',
          text: '强化学习优化的不是单步奖励，而是从当前时刻开始累计的<b>回报</b>（return）。对无限长的任务，常用折扣回报：'
        },
        {
          type: 'math',
          tex: 'G_t = \\sum_{k=0}^{\\infty} \\gamma^k r_{t+k}, \\qquad \\gamma \\in [0, 1)',
          label: '折扣回报'
        },
        {
          type: 'p',
          text: '折扣因子 $\\gamma$ 有三重意义：（1）数学上保证无穷级数收敛；（2）建模意义上表达对未来奖励的不确定性或偏好；（3）工程上提供一个调节"远视程度"的旋钮。$\\gamma \\to 1$ 意味着更看重长期，$\\gamma \\to 0$ 则近乎短视。'
        },

        { type: 'h2', text: '4. 策略、价值函数与最优性', anchor: 'value' },
        {
          type: 'p',
          text: '策略 $\\pi(a \\mid s)$ 是从状态到动作的分布。衡量"一个状态有多好"或"一个动作有多好"，需要价值函数：'
        },
        {
          type: 'math',
          tex: 'V^\\pi(s) = \\mathbb{E}_{\\pi}\\!\\left[\\, G_t \\mid s_t = s \\,\\right]'
        },
        {
          type: 'math',
          tex: 'Q^\\pi(s, a) = \\mathbb{E}_{\\pi}\\!\\left[\\, G_t \\mid s_t = s,\\, a_t = a \\,\\right]'
        },
        {
          type: 'p',
          text: 'RL 的最终目标是找到最优策略 $\\pi^* = \\arg\\max_\\pi V^\\pi(s), \\forall s$。几乎所有 RL 算法都能被归结为两大流派：<b>基于价值的方法</b>（先估 $Q^*$，再贪心导出策略）与<b>基于策略的方法</b>（直接对策略参数做梯度上升）。两者的融合催生了 Actor-Critic 家族。'
        },

        { type: 'h2', text: '5. 核心难点', anchor: 'challenges' },
        {
          type: 'olist',
          items: [
            '<b>探索与利用的权衡</b>：既要利用当前最优动作，又要探索未知动作以获取信息。',
            '<b>信用分配</b>：延迟奖励下，如何把最终结果归功到历史上的若干步。',
            '<b>样本效率</b>：真实交互成本高（机器人、医疗、金融），需要少量样本学到好策略。',
            '<b>稳定性</b>：函数逼近 + 自举 + 离策略组成"致命三元组"（Sutton），使训练易发散。',
            '<b>分布漂移</b>：策略在更新过程中改变了经验分布，学到的值可能不再适用。'
          ]
        },

        { type: 'h2', text: '6. 与监督学习的形式化对比', anchor: 'vs-sl' },
        {
          type: 'table',
          headers: ['维度', '监督学习', '强化学习'],
          rows: [
            ['数据来源', '独立同分布的样本集', '由策略采样产生，非独立同分布'],
            ['目标', '最小化期望损失 $\\mathbb{E}_{(x,y)}[\\ell(f(x), y)]$', '最大化期望回报 $\\mathbb{E}_\\pi[G_0]$'],
            ['反馈', '正确输出', '标量奖励'],
            ['时间性', '无', '序列决策，未来取决于当下动作'],
            ['核心挑战', '过拟合、泛化', '探索、信用分配、非平稳'],
          ]
        },

        { type: 'h2', text: '7. RL 算法谱系预览', anchor: 'landscape' },
        {
          type: 'p',
          text: '本课程将按照下述路线展开：'
        },
        {
          type: 'list',
          items: [
            '<b>Bandit</b>：剥离状态维度，专攻"探索-利用"。',
            '<b>MDP</b>：引入状态转移，建立整个 RL 的形式化框架。',
            '<b>动态规划</b>：已知模型时的最优解法（策略迭代、价值迭代）。',
            '<b>时序差分</b>：未知模型时的无偏估计（SARSA / Q-Learning）。',
            '<b>DQN</b>：深度神经网络 + 经验回放 + 目标网络，把 RL 带进高维。',
            '<b>REINFORCE → AC → TRPO → PPO → DDPG</b>：策略梯度家族的演进。',
            '<b>RLHF / DPO / GRPO</b>：大语言模型对齐中的 RL 应用。'
          ]
        },

        { type: 'h2', text: '8. 适用与不适用', anchor: 'applicable' },
        {
          type: 'callout',
          tone: 'tip',
          text: '<b>RL 适合：</b>序贯决策、动作改变后续数据分布、奖励稀疏或延迟、需要长期规划的场景。'
        },
        {
          type: 'callout',
          tone: 'warn',
          text: '<b>RL 不适合：</b>能被纯监督学习等价解决的单步分类/回归、数据分布固定且易标注、交互成本过高且无可用模拟器的任务。'
        },

        { type: 'h2', text: '9. 延伸阅读', anchor: 'refs' },
        {
          type: 'references',
          items: [
            { title: 'Sutton & Barto, "Reinforcement Learning: An Introduction" (2nd ed., 2018)', url: 'http://incompleteideas.net/book/the-book-2nd.html' },
            { title: 'Silver, "UCL RL Lectures" (2015)', url: 'https://www.davidsilver.uk/teaching/' },
            { title: 'OpenAI Spinning Up in Deep RL', url: 'https://spinningup.openai.com/' }
          ]
        }
      ]
    }
  },

  // ========== 动态规划 ==========
  dp: {
    title: '动态规划',
    subtitle: '当你"看透了"环境，就能用最朴素的递推算出最优策略',
    icon: '📐',

    plain: {
      readMinutes: 6,
      blocks: [
        {
          type: 'p',
          text: '我们在上一章把 MDP 讲清楚之后，一个问题自然而然浮上来——既然世界已经被刻画成"状态、动作、奖励、转移"这四件事，那最优策略到底长什么样？有没有办法把它算出来？'
        },
        {
          type: 'p',
          text: '答案是：<b>如果你对环境了如指掌——每一步走到哪里的概率、每一步能拿多少奖励都一清二楚——那最优策略不仅可以算出来，而且还算得出奇地优雅。</b>这种情况下的解法，叫<b>动态规划</b>。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '动态规划这个名字可能有点吓人，但它的核心思想其实朴素得近乎一种生活直觉——<b>把大问题拆成小问题，把小问题的答案记下来，下次直接拿来用。</b>'
        },
        {
          type: 'p',
          text: '打个比方。你站在北京，想知道去乌鲁木齐最快要多久。这是个"大问题"。你一下子答不上来，但你会这么想：如果我先到了西安，那从西安到乌鲁木齐要多久？如果先到了兰州呢？如果先到了郑州呢？……只要我知道"从任何一个城市到乌鲁木齐最快要多久"，我再加上"从北京到它要多久"，取最小的那个就行了。'
        },
        {
          type: 'p',
          text: '这个朴素的递推关系，如果放到强化学习里，就是那个大名鼎鼎的 <b>Bellman 方程</b>：<i>一个状态的价值 = 这一步的奖励 + 下一个状态的价值（打折扣）</i>。它把"此时此地的价值"和"下一刻的价值"勾连在了一起。'
        },
        {
          type: 'callout',
          tone: 'tip',
          icon: '💡',
          text: '动态规划不是一个具体算法，它是一种"解耦时间"的思路。只要世界有"现在的价值取决于未来的价值"这种递推结构，动态规划就能派上用场。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '但光有 Bellman 方程还不够。它告诉你"最优价值"应该满足什么样的递推关系，可它并没有直接交给你答案。价值函数出现在了等式两边——你得从某个初值开始，反复代入、反复更新，直到它不再变化。这个"反复"的过程，就是动态规划的实际套路。'
        },
        {
          type: 'p',
          text: '人们想出了两种风格的套路。一种叫<b>策略迭代</b>，另一种叫<b>价值迭代</b>。它们殊途同归，但"性格"不同。'
        },
        {
          type: 'p',
          text: '策略迭代像个"慢条斯理的两步流"。第一步叫"策略评估"——给我一个策略，我就慢慢算清楚按这个策略走，每个状态到底值多少；第二步叫"策略改进"——既然每个状态的价值都知道了，那我在每个状态上选一个"能带我去最高价值邻居"的动作，就得到了一个更好的策略。然后回到第一步重新评估。这样评估-改进、评估-改进，像两个齿轮交替咬合，最终策略会停下来——那就是最优了。'
        },
        {
          type: 'p',
          text: '价值迭代则更"激进"。它不耐心地把当前策略评估到收敛，而是每一轮就把"评估"和"改进"揉在同一步里做——每次更新价值，都直接用"所有动作中最好的那个"的结果。它省去了"完整评估一个策略"的这一步，更接近"直接跟 Bellman 最优方程较劲"。'
        },
        {
          type: 'callout',
          tone: 'note',
          icon: '🎯',
          text: '打个比方：策略迭代像是"先把一本书仔细读完，再想下次怎么读得更好"；价值迭代像是"边读边修正读法，不追求把这一遍读完美"。前者稳重，后者灵活，但都能到终点。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '讲到这里，你可能会觉得动态规划简直完美——只要给我足够的时间，它保证能算出最优策略。但等一下，有个隐秘的前提我们一直没细说：<b>它要求你对环境"了如指掌"。</b>'
        },
        {
          type: 'p',
          text: '这个要求，在真实世界里几乎永远不成立。你玩一个从没玩过的电子游戏，你并不知道按了 A 之后会发生什么；一个机器人第一次在陌生房间里走动，它并不知道每一步会不会撞到家具；AlphaGo 面对围棋这个局面，它也没有一张写好的"下一手之后胜率如何"的表格——棋局的空间大得超乎想象。'
        },
        {
          type: 'p',
          text: '所以动态规划虽然优雅，但它更像一个<b>理想化的参考答案</b>——它告诉我们"如果一切都已知，最优策略该是什么样的"。真实世界里，我们没有这个奢侈品。我们必须在一边走一边看里，去估计价值、去改进策略。'
        },
        {
          type: 'p',
          text: '这就是为什么接下来我们要学的"时序差分""Q-Learning""深度 Q 网络"等等——它们本质上都是在<b>"没上帝视角"的前提下，近似地完成动态规划所做的事</b>。它们把 Bellman 方程里的那个期望，用采样来代替；把那张"所有状态的价值表"，用神经网络来逼近。'
        },
        {
          type: 'hr-quote',
          text: '所以你可以把动态规划看作所有 RL 算法的"理想原型"——往后不管走多远，我们其实都在模仿它的骨架，只是用不同的方式补全它缺失的那部分信息。'
        },
        {
          type: 'p',
          text: '这也是为什么学 RL 一定要先学一下动态规划——它不一定直接拿来用，但它是所有后续算法的参照系。当你后面看到 Q-Learning 的更新公式时，会突然意识到"欸这不就是价值迭代的采样版吗？"——那一刻，你就真的入门了。'
        },
        {
          type: 'p',
          text: '下面的动画里，你可以亲眼看到"价值函数一轮一轮地在网格上扩散开"的样子。这是动态规划最美的时刻——像水波一样从终点向起点一圈圈漫开，每一轮都让系统更接近最优。'
        },
      ]
    },

    deep: {
      readMinutes: 14,
      blocks: [
        { type: 'h2', text: '1. 前提：已知模型', anchor: 'premise' },
        {
          type: 'p',
          text: '动态规划（Dynamic Programming，DP）是一类求解 MDP 最优策略的算法，其核心前提是<b>环境模型已知</b>：转移概率 $P(s\' \\mid s, a)$ 与奖励函数 $R(s, a)$ 对算法完全可见。这一前提在许多实际问题中并不满足，但 DP 依然是所有后续 RL 算法的理论基石。'
        },

        { type: 'h2', text: '2. Bellman 期望方程', anchor: 'bellman-expectation' },
        {
          type: 'p',
          text: '给定策略 $\\pi$，状态价值函数满足：'
        },
        {
          type: 'math',
          tex: 'V^\\pi(s) = \\sum_a \\pi(a \\mid s) \\sum_{s\'} P(s\' \\mid s, a)\\big[R(s,a) + \\gamma V^\\pi(s\')\\big]',
          label: 'Bellman 期望方程'
        },
        {
          type: 'p',
          text: '该方程是一个关于 $V^\\pi$ 的线性方程组，可直接求解（$|S|$ 个未知数，$|S|$ 个方程）。但对大规模状态空间而言，直接求逆代价为 $O(|S|^3)$，更常用的做法是迭代求解。'
        },

        { type: 'h2', text: '3. 策略评估（迭代）', anchor: 'policy-evaluation' },
        {
          type: 'p',
          text: '把 Bellman 方程视为算子 $T^\\pi$，反复应用即可：'
        },
        {
          type: 'math',
          tex: 'V_{k+1}(s) \\leftarrow \\sum_a \\pi(a \\mid s) \\sum_{s\'} P(s\' \\mid s, a)\\big[R(s,a) + \\gamma V_k(s\')\\big]'
        },
        {
          type: 'p',
          text: '因为 $T^\\pi$ 是 $\\gamma$-压缩算子（contraction mapping），由 Banach 不动点定理，$V_k \\to V^\\pi$ 指数收敛。'
        },

        { type: 'h2', text: '4. 策略改进定理', anchor: 'policy-improvement' },
        {
          type: 'p',
          text: '已知 $V^\\pi$ 时，对每个状态做贪心选择：'
        },
        {
          type: 'math',
          tex: '\\pi\'(s) = \\arg\\max_a \\sum_{s\'} P(s\' \\mid s, a)\\big[R(s,a) + \\gamma V^\\pi(s\')\\big]'
        },
        {
          type: 'p',
          text: '可证明 $V^{\\pi\'}(s) \\geq V^\\pi(s), \\forall s$。若 $\\pi\' = \\pi$，则它已是最优策略。这一事实称为<b>策略改进定理</b>。'
        },

        { type: 'h2', text: '5. 策略迭代（Policy Iteration）', anchor: 'pi' },
        {
          type: 'pseudocode',
          title: 'Policy Iteration',
          lines: [
            'Initialize π arbitrarily',
            'repeat:',
            '    # 1. Policy Evaluation',
            '    repeat:',
            '        Δ ← 0',
            '        for each s:',
            '            v ← V(s)',
            '            V(s) ← Σ_a π(a|s) Σ_{s\'} P(s\'|s,a)[R(s,a) + γ V(s\')]',
            '            Δ ← max(Δ, |v − V(s)|)',
            '    until Δ < θ',
            '    # 2. Policy Improvement',
            '    policy_stable ← true',
            '    for each s:',
            '        a_old ← π(s)',
            '        π(s) ← argmax_a Σ_{s\'} P(s\'|s,a)[R(s,a) + γ V(s\')]',
            '        if a_old ≠ π(s): policy_stable ← false',
            'until policy_stable',
            'return π, V'
          ]
        },
        {
          type: 'p',
          text: '策略迭代保证在有限步内收敛到最优策略（策略空间有限 + 单调改进）。'
        },

        { type: 'h2', text: '6. Bellman 最优方程与价值迭代', anchor: 'vi' },
        {
          type: 'math',
          tex: 'V^*(s) = \\max_a \\sum_{s\'} P(s\' \\mid s, a)\\big[R(s,a) + \\gamma V^*(s\')\\big]',
          label: 'Bellman 最优方程'
        },
        {
          type: 'p',
          text: '同样，最优 Bellman 算子 $T^*$ 也是 $\\gamma$-压缩。把策略评估中"Σ π(a|s)"换成"max_a"，就得到价值迭代：'
        },
        {
          type: 'math',
          tex: 'V_{k+1}(s) \\leftarrow \\max_a \\sum_{s\'} P(s\' \\mid s, a)\\big[R(s,a) + \\gamma V_k(s\')\\big]'
        },

        { type: 'h2', text: '7. 两种算法对比', anchor: 'compare' },
        {
          type: 'table',
          headers: ['维度', '策略迭代', '价值迭代'],
          rows: [
            ['每轮内部', '完整评估 + 一次改进', '一次 max 同时完成评估与改进'],
            ['每轮代价', '评估可能需要多轮扫全状态', '只扫一轮状态'],
            ['收敛轮数', '通常较少（数十次）', '通常较多（但每轮便宜）'],
            ['适用情境', '策略稳定后变化少', '更通用，默认选择']
          ]
        },

        { type: 'h2', text: '8. 异步 DP 与广义策略迭代', anchor: 'async' },
        {
          type: 'p',
          text: '实际实现中，我们不必每轮同步更新所有状态，也不必在评估阶段完全收敛。Sutton & Barto 提出了<b>广义策略迭代</b>（Generalized Policy Iteration，GPI）的概念：只要评估和改进这两个过程交替进行、都能朝最优方向进展，最终就能收敛。这一视角统一了几乎所有 RL 算法。'
        },
        {
          type: 'callout',
          tone: 'note',
          text: 'Q-Learning、SARSA、Actor-Critic、PPO —— 它们都可以被理解为 GPI 的具体实现，只是"评估"和"改进"的形式不同，且用采样取代了精确求期望。'
        },

        { type: 'h2', text: '9. 复杂度与局限', anchor: 'limits' },
        {
          type: 'list',
          items: [
            '<b>时间复杂度</b>：每轮 $O(|S|^2 |A|)$（遍历所有状态-动作-下一状态三元组）。',
            '<b>空间复杂度</b>：至少 $O(|S|)$ 存储价值函数。',
            '<b>维数灾难</b>：状态空间巨大时（例如围棋 $\\approx 10^{170}$ 个合法局面），DP 不可行。',
            '<b>模型依赖</b>：要求精确知道 $P$ 和 $R$，真实世界几乎永远不成立。'
          ]
        },

        { type: 'h2', text: '10. 承上启下', anchor: 'bridge' },
        {
          type: 'p',
          text: 'DP 为 RL 提供了两件利器：Bellman 方程的递推结构，以及"评估 ⇄ 改进"的双阶段范式。后续的无模型算法（TD / MC / Q-Learning）可视为在这个框架下，用<b>采样均值</b>代替<b>精确期望</b>，用<b>函数逼近</b>代替<b>精确存储</b>。'
        },

        { type: 'h2', text: '11. 延伸阅读', anchor: 'refs' },
        {
          type: 'references',
          items: [
            { title: 'Bellman, "Dynamic Programming" (1957)' },
            { title: 'Sutton & Barto, Chapter 4', url: 'http://incompleteideas.net/book/the-book-2nd.html' },
            { title: 'Puterman, "Markov Decision Processes" (1994)' }
          ]
        }
      ]
    }
  },

  // ========== 时序差分 SARSA / Q-Learning ==========
  td: {
    title: '时序差分学习',
    subtitle: '不需要环境模型，也不必等到回合结束——每走一步，就学一点',
    icon: '🧗',

    plain: {
      readMinutes: 7,
      blocks: [
        {
          type: 'p',
          text: '动态规划的故事讲完了，但它留下了一个大问题：<b>要是我不知道环境的规则怎么办？</b>我不知道每个动作之后世界会怎么变，也不知道每一步能拿多少奖励——那张"转移概率表"根本不在我手里。这恰恰是绝大多数真实场景的样子。'
        },
        {
          type: 'p',
          text: '于是一代代研究者开始想：既然规则不可见，那就<b>从互动里去摸索</b>。不求一步登天，只求一边走、一边学、一边修正。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '最朴素的办法是这样——每次我走完一整局，复盘：这一局最后拿到多少总奖励？那我就把它分摊到这一局走过的每一步上，当作"经过这些状态有多值"的证据。下次再来，我就用更新过的估计来做决策。这个办法叫<b>蒙特卡洛方法</b>，它很直观，但有个大麻烦——你必须等到一局彻底结束才能更新。如果一局棋要下两个小时，那每两个小时才能学一次，实在太慢了。'
        },
        {
          type: 'p',
          text: '有没有办法"每走一步就学一点"？你想，动态规划里那个 Bellman 方程告诉我们——<i>一个状态的价值 = 这一步的奖励 + 下一个状态的价值（打折扣）。</i>那如果我把当前估计的"下一个状态价值"当作"未来的预言"来用，不就不需要等到局终了吗？'
        },
        {
          type: 'hr-quote',
          text: '这，就是时序差分的核心诡计——<b>用"下一步的估计"来更新"这一步的估计"</b>。'
        },
        {
          type: 'p',
          text: '这种做法听起来似乎在"用未证实的东西去修正未证实的东西"——没错，这就是它被称为"自举"（Bootstrapping）的原因。你也许会担心这样会不会越学越偏，但实际上：只要学习步长不太大，次次都把估计往真实的方向拽一点，最终所有估计都会收敛到正确的值。'
        },
        {
          type: 'callout',
          tone: 'tip',
          icon: '💡',
          text: '时序差分 = 蒙特卡洛的"耐心" + 动态规划的"递推"。它既不用等一整局结束，也不用知道环境的内部规则。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '时序差分可以用来估计 V(s)，但在控制问题里，我们更关心 Q(s,a)——"在某个状态下做某个动作有多好"。因为一旦知道了 Q，最佳策略就是"在每个状态选 Q 值最大的动作"，干脆利落。'
        },
        {
          type: 'p',
          text: '这里，时序差分家族分出了两兄弟，性格还挺不一样。他们叫 <b>SARSA</b> 和 <b>Q-Learning</b>。'
        },
        {
          type: 'p',
          text: '先说老大 <b>SARSA</b>。这个名字听起来像人名，其实是五个字母的首字母缩写：State-Action-Reward-State-Action。意思是它更新 Q 值时用到的完整信息是一个五元组：(s, a, r, s′, a′)。其中 a′ 是它"实际"下一步要做的动作。'
        },
        {
          type: 'p',
          text: 'SARSA 很诚实——我下一步打算做什么动作，我就按那个动作的 Q 值来更新。如果我本来就偏保守、带点随机探索，它就会把这种"带着探索"的谨慎性格也学进去。'
        },
        {
          type: 'p',
          text: '再看老二 <b>Q-Learning</b>。它就激进多了——更新 Q 值的时候，它才不管自己下一步实际要做什么呢，反正就按"假设下一步我能选到最好的动作"来更新。'
        },
        {
          type: 'callout',
          tone: 'note',
          icon: '🎯',
          text: 'SARSA 更新用的是"我下一步真的要做的那个动作"；Q-Learning 更新用的是"我下一步理论上最好的那个动作"。一个看实际，一个看理想。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '这点差别看起来很小，但它带来的"性格差异"却大得惊人。强化学习圈里有个经典的例子，叫<b>"悬崖行走"</b>——左下角是起点，右下角是终点，下边一整排是悬崖，掉下去就是 -100 分。'
        },
        {
          type: 'p',
          text: '你猜这两位会怎么走？'
        },
        {
          type: 'p',
          text: 'Q-Learning 学到的是"真正最优"的路径——贴着悬崖边走，因为那条路最短。但训练过程中它会一次次掉下去（毕竟它还有 ε 概率的探索），所以整个训练期间，它的平均奖励其实不高。但学出来之后的策略确实是最优的。'
        },
        {
          type: 'p',
          text: 'SARSA 呢？它学到的是"带着探索习惯的稳妥路径"——它会绕远一点，离悬崖远远的。因为它更新时知道自己"下一步可能因为探索而随机选了个傻动作"，所以为了不被那个傻动作坑到，它干脆选一条容错更高的路。表面上看它绕了冤枉路，但训练过程中它平均奖励更高，也更少掉下悬崖。'
        },
        {
          type: 'p',
          text: '所以这两个算法到底哪个"更好"？答案是没有绝对答案——<b>要看你追求的是什么</b>。如果你最终只关心"训练完以后的策略能有多强"，Q-Learning 更好；如果你连训练过程中的安全性也要考虑（比如真机上不能一直摔），SARSA 更稳。'
        },
        {
          type: 'hr-quote',
          text: '一个看着地图找最优解，一个把自己的"手抖"也算进成本——两种策略，都各有道理。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '顺带一提，SARSA 属于"on-policy"算法，Q-Learning 属于"off-policy"。这两个术语听着抽象，但意思其实很朴素——<b>你学的是"你自己的行为"，还是"某种假设中的理想行为"？</b>SARSA 是前者，Q-Learning 是后者。这个区分很重要，后面许多更高级的算法（比如 DQN 的经验回放）都依赖"off-policy"这个特性，因为只有 off-policy 的算法才能把旧数据拿来反复学。'
        },
        {
          type: 'p',
          text: '时序差分是强化学习真正"进入工作状态"的时刻。从这一章开始，我们不再需要上帝视角，算法可以放到任何未知环境里从零开始学。这是一个看似朴素却意义重大的跨越——下一章的 DQN，实际上就是把 Q-Learning 的那张 Q 表，换成了一张神经网络。其余的思路，几乎原封不动。'
        },
        {
          type: 'p',
          text: '下面的悬崖动画，你可以亲眼看 SARSA 和 Q-Learning 在同样的环境里，走出截然不同的路线。这个实验被写进了 Sutton & Barto 的经典教材，也是我见过最直观揭示"两种性格"的可视化——别错过。'
        },
      ]
    },

    deep: {
      readMinutes: 15,
      blocks: [
        { type: 'h2', text: '1. 从蒙特卡洛到时序差分', anchor: 'mc-vs-td' },
        {
          type: 'p',
          text: '无模型估计价值函数的两大思路是 <b>Monte Carlo（MC）</b>与<b>Temporal Difference（TD）</b>。两者的核心差异在于"何时用什么目标来更新"。'
        },
        {
          type: 'table',
          headers: ['方法', '更新目标', '何时更新', '方差', '偏差', '需等回合结束'],
          rows: [
            ['MC', '真实回报 $G_t$', '回合结束后', '高', '无（无偏）', '是'],
            ['TD(0)', '引导目标 $r_t + \\gamma V(s_{t+1})$', '每步', '低', '有（自举引入）', '否'],
            ['TD(λ)', '加权多步目标', '每步', '中', '中', '否']
          ]
        },

        { type: 'h2', text: '2. TD(0) 的更新规则', anchor: 'td0' },
        {
          type: 'p',
          text: 'TD(0) 的价值更新为：'
        },
        {
          type: 'math',
          tex: 'V(s_t) \\leftarrow V(s_t) + \\alpha\\,\\big[\\,\\underbrace{r_t + \\gamma V(s_{t+1})}_{\\text{TD target}} - V(s_t)\\,\\big]'
        },
        {
          type: 'p',
          text: '方括号中的量称为 <b>TD 误差</b>（TD error），记作 $\\delta_t$。它是当前估计与"引导目标"之间的差距。TD 同时利用了采样（单步转移）和自举（下一状态估值）。'
        },

        { type: 'h2', text: '3. SARSA（on-policy 控制）', anchor: 'sarsa' },
        {
          type: 'p',
          text: '将 TD 思想应用到 $Q(s,a)$ 上，并使用实际采样到的 $a\' \\sim \\pi(\\cdot \\mid s\')$：'
        },
        {
          type: 'math',
          tex: 'Q(s_t, a_t) \\leftarrow Q(s_t, a_t) + \\alpha\\,\\big[\\,r_t + \\gamma\\,Q(s_{t+1}, a_{t+1}) - Q(s_t, a_t)\\,\\big]',
          label: 'SARSA'
        },
        {
          type: 'p',
          text: '所用五元组 $(s_t, a_t, r_t, s_{t+1}, a_{t+1})$ 首字母即算法名。由于目标中出现的是"当前策略真实选出的 $a\'$"，SARSA 是 <b>on-policy</b>。'
        },
        {
          type: 'pseudocode',
          title: 'SARSA (tabular, ε-greedy)',
          lines: [
            'Initialize Q(s, a) arbitrarily; ε, α, γ',
            'for each episode:',
            '    s ← env.reset()',
            '    a ← ε-greedy(Q, s)',
            '    while not done:',
            '        s\', r, done ← env.step(a)',
            '        a\' ← ε-greedy(Q, s\')',
            '        Q(s, a) ← Q(s, a) + α[r + γ Q(s\', a\') − Q(s, a)]',
            '        s, a ← s\', a\''
          ]
        },

        { type: 'h2', text: '4. Q-Learning（off-policy 控制）', anchor: 'qlearn' },
        {
          type: 'math',
          tex: 'Q(s_t, a_t) \\leftarrow Q(s_t, a_t) + \\alpha\\,\\big[\\,r_t + \\gamma\\,\\max_{a\'} Q(s_{t+1}, a\') - Q(s_t, a_t)\\,\\big]',
          label: 'Q-Learning'
        },
        {
          type: 'p',
          text: '这里用 $\\max_{a\'} Q(s_{t+1}, a\')$ 作为目标，与实际执行的行为策略无关——目标策略是贪心策略 $\\pi^*$，行为策略可以是任意（通常 ε-greedy）。这就是 <b>off-policy</b> 的含义。Q-Learning 是 Bellman 最优方程的采样版本，在满足一定条件下收敛到 $Q^*$。'
        },

        { type: 'h2', text: '5. 为什么 SARSA 更保守？', anchor: 'safety' },
        {
          type: 'p',
          text: '关键在目标策略。SARSA 学的是<b>"带探索扰动的当前策略"</b>的价值，因此会把"下一步可能 ε 概率随机乱走"的成本计入评估；Q-Learning 学的是<b>"假想下一步总是最优"</b>的价值，对自身探索带来的风险视而不见。'
        },
        {
          type: 'callout',
          tone: 'note',
          text: '在悬崖行走（Cliff Walking, Sutton & Barto Example 6.6）中，Q-Learning 学到最优但训练期间频繁掉崖，SARSA 学到次优但训练期间更稳。这一经典对比揭示：<b>算法要评估的是哪个策略，决定了它关心什么风险。</b>'
        },

        { type: 'h2', text: '6. 收敛性条件', anchor: 'convergence' },
        {
          type: 'p',
          text: '在 tabular 设置下，以下条件保证 Q-Learning 收敛到 $Q^*$（Watkins, 1989）：'
        },
        {
          type: 'olist',
          items: [
            '所有 $(s, a)$ 被无限次访问；',
            '学习率满足 $\\sum_t \\alpha_t = \\infty,\\ \\sum_t \\alpha_t^2 < \\infty$（如 Robbins-Monro 条件）；',
            '奖励有界。'
          ]
        },
        {
          type: 'p',
          text: 'SARSA 的收敛还要求策略在极限下收敛到贪心策略（GLIE 条件，例如 ε 逐渐衰减至 0）。'
        },

        { type: 'h2', text: '7. 扩展：Expected SARSA 与 Double Q-Learning', anchor: 'extensions' },
        {
          type: 'p',
          text: 'Expected SARSA 把 $Q(s\', a\')$ 换成关于策略的期望 $\\mathbb{E}_{a\' \\sim \\pi}[Q(s\', a\')]$，方差更低且仍是 on-policy；Double Q-Learning（van Hasselt, 2010）通过维护两张 Q 表解耦"选择动作"与"估计价值"，缓解 max 造成的系统性<b>高估偏差</b>。'
        },

        { type: 'h2', text: '8. n-step TD 与 TD(λ)', anchor: 'tdlambda' },
        {
          type: 'p',
          text: 'n 步 TD 将目标扩展到 $G_t^{(n)} = r_t + \\gamma r_{t+1} + \\cdots + \\gamma^n V(s_{t+n})$。把不同 n 的目标用指数加权几何平均合起来，就得到 TD(λ) 的<b>λ-return</b>：'
        },
        {
          type: 'math',
          tex: 'G_t^\\lambda = (1 - \\lambda) \\sum_{n=1}^{\\infty} \\lambda^{n-1} G_t^{(n)}'
        },
        {
          type: 'p',
          text: 'λ = 0 时退化为 TD(0)，λ = 1 时等价于 MC。通过调节 λ 可在偏差-方差之间平滑过渡。'
        },

        { type: 'h2', text: '9. 实现注意事项', anchor: 'tricks' },
        {
          type: 'list',
          items: [
            '<b>学习率 α</b>：过大不稳，过小收敛慢。常取 0.1~0.5，可线性衰减。',
            '<b>ε 调度</b>：从 1.0 线性衰减到 0.01~0.1 是稳健选择。',
            '<b>终止状态</b>：目标中的 $Q(s\', \\cdot)$ 应被置零。',
            '<b>函数逼近下不稳定</b>：TD + 非线性函数逼近 + off-policy 组成"致命三元组"，这正是 DQN 必须引入经验回放 + 目标网络的原因（见下一章）。'
          ]
        },

        { type: 'h2', text: '10. 承上启下', anchor: 'bridge' },
        {
          type: 'p',
          text: 'TD 把 DP 的"递推思想"与 MC 的"采样思想"结合起来，彻底摆脱了对已知模型的依赖。它是无模型 RL 的基石。然而 tabular 形式无法应对高维状态——下一步需要把 Q 表替换为<b>神经网络逼近器</b>，这就是 DQN。'
        },

        { type: 'h2', text: '11. 延伸阅读', anchor: 'refs' },
        {
          type: 'references',
          items: [
            { title: 'Watkins & Dayan, "Q-Learning" (Machine Learning, 1992)' },
            { title: 'Rummery & Niranjan, "On-line Q-learning using connectionist systems" (1994)' },
            { title: 'Sutton & Barto, Chapter 6', url: 'http://incompleteideas.net/book/the-book-2nd.html' },
            { title: 'van Hasselt, "Double Q-Learning" (NIPS 2010)' }
          ]
        }
      ]
    }
  },

  // ========== DQN 深度 Q 网络 ==========
  dqn: {
    title: '深度 Q 网络（DQN）',
    subtitle: '把 Q 表换成神经网络，强化学习第一次走进"深度时代"',
    icon: '🧠',

    plain: {
      readMinutes: 7,
      blocks: [
        {
          type: 'p',
          text: '到上一章为止，我们已经学会了 Q-Learning。它很强，但也有一个天然的天花板——它需要一张 Q 表，把每个状态-动作对的价值都存起来。状态数是 10、100，甚至 10000，还勉强塞得下；状态数是 100 万、1 亿呢？Q 表装不下，更谈不上去学。'
        },
        {
          type: 'p',
          text: '而真实世界里，状态动辄是一张图片、一段声音、一帧游戏画面——它们的可能性都是天文数字，根本不存在"把每个状态列出来"这种奢望。'
        },
        { type: 'divider' },
        {
          type: 'hr-quote',
          text: '那有没有办法，让强化学习直接从画面里学？'
        },
        {
          type: 'p',
          text: '2013 年，DeepMind 的几个年轻人给出了答案——他们把 Q-Learning 里的那张表，换成了一个<b>神经网络</b>。这个网络的输入是游戏画面（比如 Atari 游戏的原始像素），输出是每个动作对应的 Q 值。状态不再是一个离散的格子，而是网络里的一段"特征"——它是被学出来的、压缩过的、抽象的。'
        },
        {
          type: 'p',
          text: '这个方法叫做 <b>Deep Q-Network</b>，简称 <b>DQN</b>。它让算法第一次用人类一样的"眼睛"玩游戏——不是被告知"敌人在第 5 列第 3 行"，而是只看屏幕，然后学会什么时候跳、什么时候射。'
        },
        {
          type: 'p',
          text: '当时他们让 DQN 在 49 款 Atari 游戏上自学，结果大半超过了人类玩家水平——这一实验震惊了学术界。2015 年的那篇《Nature》论文，成为了深度强化学习真正的开端。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '不过，事情没那么简单。你不能直接把 Q 表换成网络、然后套上 Q-Learning 的更新公式就完事——如果真这么干，训练会<b>剧烈震荡甚至发散</b>。研究者们吃了不少苦头才找到两个关键技巧。'
        },
        {
          type: 'p',
          text: '第一个技巧叫做 <b>经验回放</b>（Experience Replay）。它的思路特别巧妙——每走一步，我把这次的经历 (s, a, r, s′) 丢进一个大池子里存起来；训练时，我不按顺序用最新的数据，而是<b>随机</b>从池子里抽一批出来去学。'
        },
        {
          type: 'p',
          text: '为什么要这样？因为强化学习采集到的数据，天然是"高度相关"的——下一步状态和这一步状态非常接近，如果按顺序学，网络会被"前一小段时间的风格"带偏，学了就忘，忘了再学。打乱顺序能让数据看起来更像"独立同分布"，神经网络训练起来就稳定多了。'
        },
        {
          type: 'callout',
          tone: 'tip',
          icon: '💡',
          text: '这个思路其实很像我们人类的"睡眠"——白天经历的事情散乱地发生，晚上大脑把它们打乱、回放、整理。经验回放就是算法的"夜间复习"。'
        },
        {
          type: 'p',
          text: '第二个技巧叫做 <b>目标网络</b>（Target Network）。它要解决的问题是这样的——Q-Learning 的更新目标里出现了 Q 本身：<i>新的估计 = 奖励 + 下一状态的最大 Q</i>。要是你一边更新网络，一边用这个网络去算目标，那目标也在晃动。就像你想瞄准一个目标，但你自己的手和靶子都在同步摇晃——根本瞄不准。'
        },
        {
          type: 'p',
          text: 'DQN 的做法是：复制一份网络出来，<b>让这份"副本"专门负责算目标</b>，而且它每隔几千步才同步一次主网络的参数。于是在这"几千步"里，目标是稳定的，主网络可以安心朝它拟合。每隔一段时间再"刷新"一下靶子——就像你射一批箭之后再去移动靶子。这样训练就稳定多了。'
        },
        {
          type: 'callout',
          tone: 'note',
          icon: '🎯',
          text: '经验回放解决了"样本相关性"的问题，目标网络解决了"目标漂移"的问题。这两个技巧合起来，才让深度 Q-Learning 真正能跑起来。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: 'DQN 之后，人们还发现了一些"小补丁"，效果非常显著。比如 <b>Double DQN</b> —— 原版 DQN 里用 max 来选下一步动作的 Q，这一 max 操作会引入一种系统性的"高估偏差"（挑出来的总是那些噪声偏高的估值）；Double DQN 用两个网络解耦"选动作"和"估价值"，有效地把这种高估压下去。'
        },
        {
          type: 'p',
          text: '再比如 <b>Dueling DQN</b> —— 把 Q(s, a) 拆成两部分：一个是状态的"基础价值" V(s)，一个是每个动作相对 V(s) 的"优势" A(s, a)。这种分解让网络更聪明：有些状态无论做什么都差不多（比如游戏里的过场动画），这时候 V 单独学就够了，不用每个动作都训练一遍。'
        },
        {
          type: 'p',
          text: '再之后还有 <b>Prioritized Replay</b>（按误差大小优先抽取经验）、<b>Rainbow</b>（把六七个改进糅合成一个大礼包）——它们层层叠叠，把 DQN 打磨得越来越强。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '说到这里你大概能感受到——DQN 本身不是一个复杂的算法，它的骨架就是 Q-Learning。但它第一次解决了"深度 + 强化"怎么结合的技术难题，让 RL 从"玩玩小格子世界"真正跨入了"处理真实复杂感知"的时代。'
        },
        {
          type: 'hr-quote',
          text: 'Q-Learning 是思想，DQN 是让这个思想能在深度学习时代工作起来的工程学。'
        },
        {
          type: 'p',
          text: '当然，DQN 也有它的局限——它只能处理离散动作（"跳/不跳""开火/不开火"），没法处理连续动作（"油门踩多少""方向盘打多少度"）。后面我们学 DDPG、PPO 的时候，你会看到人们是怎么把思路扩展到连续动作的。'
        },
        {
          type: 'p',
          text: '下面的动画里，你会看到经验回放池的样子、两个网络"追逐"彼此的过程，以及 Q 值是怎么从乱码渐渐变得有章法的。'
        },
      ]
    },

    deep: {
      readMinutes: 15,
      blocks: [
        { type: 'h2', text: '1. 为什么需要深度化', anchor: 'why-deep' },
        {
          type: 'p',
          text: '传统 Q-Learning 用表格存储 $Q(s, a)$，在高维状态（例如 Atari 的 84×84×4 像素帧）上完全不可行。DQN（Mnih et al., 2013/2015）用一个卷积神经网络 $Q(s, a; \\theta)$ 作为函数逼近器，把"感知"与"价值估计"端到端地一并学出来。'
        },

        { type: 'h2', text: '2. 致命三元组与 DQN 的两大修正', anchor: 'triad' },
        {
          type: 'p',
          text: 'Sutton 指出，以下三者同时出现会使 TD 学习发散：<b>函数逼近（function approximation）+ 自举（bootstrapping）+ 离策略（off-policy）</b>。这被称为"致命三元组"（deadly triad）。DQN 通过两项工程技巧使训练变得稳定：'
        },
        {
          type: 'list',
          items: [
            '<b>经验回放</b>（Experience Replay）：解耦样本相关性，近似 i.i.d. 采样。',
            '<b>目标网络</b>（Target Network）：冻结目标参数 $\\theta^-$，周期性同步，避免目标漂移。'
          ]
        },

        { type: 'h2', text: '3. 目标与损失', anchor: 'loss' },
        {
          type: 'math',
          tex: 'y_t = r_t + \\gamma\\,\\max_{a\'} Q(s_{t+1}, a\';\\,\\theta^-)',
          label: 'DQN 目标'
        },
        {
          type: 'math',
          tex: '\\mathcal{L}(\\theta) = \\mathbb{E}_{(s,a,r,s\') \\sim \\mathcal{D}}\\!\\left[\\,\\big(y - Q(s, a;\\,\\theta)\\big)^2\\,\\right]',
          label: '均方 TD 误差'
        },
        {
          type: 'p',
          text: '这里 $\\mathcal{D}$ 是回放缓冲区，$\\theta^-$ 是目标网络参数（$\\theta$ 的延迟拷贝）。梯度只对 $\\theta$ 更新：'
        },
        {
          type: 'math',
          tex: '\\nabla_\\theta \\mathcal{L} = \\mathbb{E}\\!\\left[\\,-2\\big(y - Q(s, a;\\theta)\\big) \\nabla_\\theta Q(s, a;\\theta)\\,\\right]'
        },

        { type: 'h2', text: '4. DQN 伪代码', anchor: 'pseudocode' },
        {
          type: 'pseudocode',
          title: 'DQN (Nature 2015)',
          lines: [
            'Initialize Q(·; θ), target Q\'(·; θ⁻ ← θ), replay buffer D',
            'for episode = 1..M:',
            '    s ← env.reset()',
            '    while not done:',
            '        a ← ε-greedy(Q(s; θ))',
            '        s\', r, done ← env.step(a)',
            '        D.push((s, a, r, s\', done))',
            '        s ← s\'',
            '        # Learn',
            '        sample minibatch B ~ D',
            '        for (s_i, a_i, r_i, s\'_i, d_i) in B:',
            '            y_i ← r_i + (1 - d_i) · γ · max_{a\'} Q\'(s\'_i, a\'; θ⁻)',
            '        θ ← θ − α ∇_θ Σ (y_i − Q(s_i, a_i; θ))²',
            '        every C steps: θ⁻ ← θ    # 硬更新目标网络'
          ]
        },

        { type: 'h2', text: '5. 高估偏差与 Double DQN', anchor: 'double' },
        {
          type: 'p',
          text: 'DQN 目标中的 $\\max_{a\'} Q(\\cdot; \\theta^-)$ 会系统性地<b>高估</b>真实 $Q^*$：在估值带噪声时，取 max 相当于选到了"正噪声最大的那个"（Thrun & Schwartz, 1993；van Hasselt 2010）。<b>Double DQN</b>（van Hasselt, Guez & Silver, 2016）将动作选择与价值估计解耦：'
        },
        {
          type: 'math',
          tex: 'y_t^{\\text{DDQN}} = r_t + \\gamma\\,Q\\!\\big(s_{t+1},\\,\\arg\\max_{a\'} Q(s_{t+1}, a\'; \\theta);\\;\\theta^-\\big)'
        },
        {
          type: 'p',
          text: '即：用在线网络选动作，用目标网络估值。有效地减少高估，在 Atari 上普遍带来若干百分点的分数提升。'
        },

        { type: 'h2', text: '6. Dueling DQN', anchor: 'dueling' },
        {
          type: 'p',
          text: 'Wang et al. (2016) 把网络拆为两支：价值流 $V(s;\\theta_V)$ 与优势流 $A(s, a;\\theta_A)$，再合成：'
        },
        {
          type: 'math',
          tex: 'Q(s, a;\\,\\theta) = V(s;\\theta_V) + \\Big(A(s, a;\\theta_A) - \\tfrac{1}{|\\mathcal{A}|}\\sum_{a\'} A(s, a\';\\theta_A)\\Big)'
        },
        {
          type: 'p',
          text: '减去 $A$ 的均值是为了消除 $V$ 与 $A$ 的可加歧义。Dueling 在"动作差异小"的状态下表现尤佳。'
        },

        { type: 'h2', text: '7. Prioritized Replay', anchor: 'per' },
        {
          type: 'p',
          text: 'Schaul et al. (2016) 按 TD 误差大小给经验赋优先级 $p_i \\propto |\\delta_i|^\\alpha$，大误差的样本更常被抽到。为纠正非均匀采样引入的偏差，用重要性采样权重：'
        },
        {
          type: 'math',
          tex: 'w_i = \\big(N \\cdot P(i)\\big)^{-\\beta},\\qquad \\beta \\text{ 从小到大线性退火到 } 1'
        },

        { type: 'h2', text: '8. 其余常见改进', anchor: 'more' },
        {
          type: 'list',
          items: [
            '<b>Multi-step returns</b>（n-step DQN）：用 $n$ 步奖励做目标，降低偏差、提速学习。',
            '<b>Noisy Nets</b>：将 ε-greedy 替换为参数化噪声，自动学习探索幅度。',
            '<b>Distributional RL（C51/QR-DQN）</b>：学习 $Q$ 的分布而非期望。',
            '<b>Rainbow</b>（Hessel et al., 2018）：把 Double、Dueling、PER、多步、Noisy、C51 合并在一起。'
          ]
        },

        { type: 'h2', text: '9. 关键实现细节', anchor: 'tricks' },
        {
          type: 'list',
          items: [
            '输入用最近 4 帧堆叠（解决 POMDP 中的部分可观测）；像素归一化到 [0, 1]。',
            '使用 Huber 损失而非纯 MSE，抗异常 TD 误差。',
            'RMSProp 或 Adam，学习率 $\\sim 10^{-4}$；梯度裁剪防爆炸。',
            '目标网络 C = 10,000 步硬更新；或用 $\\theta^- \\leftarrow \\tau \\theta + (1-\\tau) \\theta^-,\\ \\tau \\approx 0.005$ 软更新。',
            '回放池 $10^6$ 量级；热身数万步后再开始更新。'
          ]
        },

        { type: 'h2', text: '10. 适用范围与局限', anchor: 'limits' },
        {
          type: 'callout',
          tone: 'tip',
          text: '<b>DQN 适合：</b>离散动作、可无限次重置的模拟环境、像素级或其他高维离线观测。'
        },
        {
          type: 'callout',
          tone: 'warn',
          text: '<b>DQN 不适合：</b>连续动作（需 DDPG/SAC）、真机高成本交互（需离线 RL 或模型 RL）、奖励极稀疏（需内在奖励 / 好奇心）。'
        },

        { type: 'h2', text: '11. 延伸阅读', anchor: 'refs' },
        {
          type: 'references',
          items: [
            { title: 'Mnih et al. "Human-level control through deep reinforcement learning" (Nature 2015)', url: 'https://www.nature.com/articles/nature14236' },
            { title: 'van Hasselt, Guez & Silver, "Deep Reinforcement Learning with Double Q-Learning" (AAAI 2016)', url: 'https://arxiv.org/abs/1509.06461' },
            { title: 'Wang et al. "Dueling Network Architectures" (ICML 2016)', url: 'https://arxiv.org/abs/1511.06581' },
            { title: 'Schaul et al. "Prioritized Experience Replay" (ICLR 2016)', url: 'https://arxiv.org/abs/1511.05952' },
            { title: 'Hessel et al. "Rainbow: Combining Improvements in Deep RL" (AAAI 2018)', url: 'https://arxiv.org/abs/1710.02298' }
          ]
        }
      ]
    }
  },

  // ========== REINFORCE 策略梯度 ==========
  reinforce: {
    title: 'REINFORCE · 策略梯度',
    subtitle: '不再绕道价值函数，直接对"行为习惯"做梯度上升',
    icon: '🎭',

    plain: {
      readMinutes: 6,
      blocks: [
        {
          type: 'p',
          text: '一路学下来，你可能已经发现——我们到目前为止学的所有算法，都有一个共同的套路：<b>先估出 Q 值或 V 值，然后从价值里"反推"出策略</b>。你想在某个状态该做什么？看 Q 值最大的动作就好。这种思路叫"基于价值"（value-based）。'
        },
        {
          type: 'p',
          text: '但是，这真的是唯一的办法吗？'
        },
        { type: 'divider' },
        {
          type: 'hr-quote',
          text: '有没有一种办法，<b>直接</b>对"行为习惯"下手，不绕价值函数这个弯？'
        },
        {
          type: 'p',
          text: '当然有。这种思路叫<b>策略梯度</b>（Policy Gradient），它的想法朴素到令人惊讶——<i>我把策略写成一个参数化的函数（比如神经网络的输出分布），然后直接计算"怎么调这些参数能让总奖励最大"，然后朝那个方向走一步。</i>就像拧水龙头——想让水更热，就把旋钮往热的方向拧一点。'
        },
        {
          type: 'p',
          text: '这个想法可以追溯到上世纪 90 年代初。有人把这个最朴素的实现起了个名字，叫做 <b>REINFORCE</b>（确切说是 Williams 1992 年提出的算法）。'
        },
        {
          type: 'p',
          text: '它的工作方式是这样——先用当前策略玩一整局游戏，把这一局的完整轨迹记下来。然后看这一局总共拿了多少奖励。如果结果很好，就把<b>这一局做过的每个动作</b>的概率都往上调一点；如果结果很糟，就把它们都往下调一点。'
        },
        {
          type: 'callout',
          tone: 'tip',
          icon: '💡',
          text: '一句话概括 REINFORCE：<b>"这局打得好？那这局做过的事，下次都多做一点。"</b>'
        },
        {
          type: 'p',
          text: '这听起来简直像"玄学"——怎么能这么粗暴呢？但数学上是严密的。由一个叫做"策略梯度定理"的东西保证，这种更新方式<b>在期望意义上</b>真的是在朝"期望回报最大"的方向爬坡。当然"在期望上"这四个字很关键——它意味着单次更新可能噪声非常大，需要很多局的平均才能看出方向。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '策略梯度相比于基于价值的方法，有几个明显的优势。'
        },
        {
          type: 'p',
          text: '第一个优势是——它天然支持<b>随机策略</b>。在某些问题里（比如对抗性博弈：石头剪刀布），确定性策略注定要输，你必须带一点随机性才能稳定。基于价值的方法总是"选最大 Q 值"，输出的是确定性动作；而策略梯度输出的是一个概率分布，想要多少随机就有多少随机。'
        },
        {
          type: 'p',
          text: '第二个优势是——它天然支持<b>连续动作</b>。Q-Learning 里那个 max_a 在离散动作时好办，但在连续动作空间里（比如"油门踩几度"），你怎么对无穷多个 a 取 max？根本做不到。而策略梯度可以让策略直接输出一个连续值（比如均值和方差），根本不需要枚举动作。'
        },
        {
          type: 'p',
          text: '第三个优势是——对<b>随机的、噪声大的</b>环境，策略梯度的收敛性往往更优雅。基于价值的方法一旦 Q 值估偏，策略可能突然剧烈变化；而策略梯度是在"策略本身"上平滑移动，不容易抽搐。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '但 REINFORCE 也有一个要命的缺点——<b>方差极大</b>。刚才我们说它的更新方式是"看整局总奖励，决定这局所有动作调不调"。可是，一局的总奖励可能因为很多偶然因素起伏——你前两步其实做得很好，后面一步手抖出了糟糕决定，结果总奖励被拖下水——此时 REINFORCE 会把"前两步的好决策"也一起打压。'
        },
        {
          type: 'p',
          text: '这就像你写了一份报告，结果老板因为最后一页有个错别字把整份报告说得一文不值——对你写得很好的前面部分来说，这评价也太不公平了。REINFORCE 就是这样"一杆子打死一船"，所以它的学习过程充满噪声、训练不稳定。'
        },
        {
          type: 'p',
          text: '人们想了个简单又优雅的办法来缓解这个问题——<b>引入一个 "基线"（baseline）</b>。思路是：我不要用"这局拿了多少"来当信号，而是用"这局比'
        },
        {
          type: 'p',
          text: '"平均"多拿了多少"。如果这局拿了 80 分，但你平均能拿 70，那这局算"还可以"，概率微微加一点；如果这局拿了 50，平均是 70，那这局算"差了点"，概率调低。'
        },
        {
          type: 'callout',
          tone: 'note',
          icon: '🎯',
          text: '数学上可以证明：减去一个与动作无关的基线<b>不改变梯度的期望</b>，但能<b>显著降低方差</b>。这是一个免费的午餐——你没损失任何正确性，却让训练稳定多了。'
        },
        {
          type: 'p',
          text: '这个基线最常见的选择，就是每个状态的期望回报 V(s) ——"在这个状态下，平均能拿多少"。但 V(s) 本身也是要学的——谁来学它？一个自然的做法是再搭一个网络专门估计它。于是策略网络和价值网络就自然地耦合在了一起——这正是下一章 Actor-Critic 的雏形。'
        },
        {
          type: 'hr-quote',
          text: 'REINFORCE 是最朴素的策略梯度，但它开启了整个"基于策略"的家族——Actor-Critic、TRPO、PPO 都是它的后代。'
        },
        {
          type: 'p',
          text: '下面的动画你可以看到策略分布如何一轮一轮地被"塑形"——从最开始的均匀乱撒，到后来逐渐集中到有用的动作上。也可以切换"有/无 baseline"看两种训练曲线——差别相当明显。'
        },
      ]
    },

    deep: {
      readMinutes: 12,
      blocks: [
        { type: 'h2', text: '1. 策略参数化与目标', anchor: 'objective' },
        {
          type: 'p',
          text: '把策略写成可参数化的概率分布 $\\pi_\\theta(a \\mid s)$（例如神经网络输出 softmax / 高斯参数）。RL 的目标是最大化期望回报：'
        },
        {
          type: 'math',
          tex: 'J(\\theta) = \\mathbb{E}_{\\tau \\sim \\pi_\\theta}\\!\\left[\\, \\sum_{t=0}^{T} \\gamma^t r_t \\,\\right]',
          label: '策略目标'
        },
        {
          type: 'p',
          text: '我们希望通过梯度上升 $\\theta \\leftarrow \\theta + \\alpha \\nabla_\\theta J(\\theta)$ 来优化它。但 $J$ 对 $\\theta$ 的依赖是<b>通过采样分布</b>而非被积函数本身——这让直接求梯度变得不平凡。'
        },

        { type: 'h2', text: '2. 策略梯度定理', anchor: 'pg-theorem' },
        {
          type: 'p',
          text: 'Sutton et al. (2000) 给出关键结论：'
        },
        {
          type: 'math',
          tex: '\\nabla_\\theta J(\\theta) = \\mathbb{E}_{\\tau \\sim \\pi_\\theta}\\!\\left[\\,\\sum_{t=0}^{T} \\nabla_\\theta \\log \\pi_\\theta(a_t \\mid s_t) \\cdot G_t \\,\\right]',
          label: '策略梯度定理'
        },
        {
          type: 'p',
          text: '其中 $G_t = \\sum_{k=t}^{T} \\gamma^{k-t} r_k$ 是从 $t$ 时刻起的回报。这一结论把"对参数求梯度"转化成"对 log-policy 求梯度并用回报加权"，可以直接用蒙特卡洛样本估计。'
        },

        { type: 'h2', text: '3. 推导梗概（"log-trick"）', anchor: 'derivation' },
        {
          type: 'derivation',
          steps: [
            { note: '把期望展成积分', tex: 'J(\\theta) = \\int p_\\theta(\\tau) R(\\tau) \\, d\\tau' },
            { note: '对 θ 求导，交换导数与积分', tex: '\\nabla_\\theta J = \\int \\nabla_\\theta p_\\theta(\\tau) \\cdot R(\\tau) \\, d\\tau' },
            { note: '利用 $\\nabla p = p \\nabla \\log p$（log-trick）', tex: '\\nabla_\\theta J = \\int p_\\theta(\\tau) \\nabla_\\theta \\log p_\\theta(\\tau) \\cdot R(\\tau) \\, d\\tau = \\mathbb{E}_\\tau [\\nabla \\log p_\\theta(\\tau) \\cdot R(\\tau)]' },
            { note: '轨迹分布拆开：$\\log p_\\theta(\\tau) = \\sum_t \\log \\pi_\\theta(a_t \\mid s_t) + \\text{常数}$（转移/初始状态与 θ 无关）', tex: '\\nabla_\\theta J = \\mathbb{E}\\!\\left[\\sum_t \\nabla_\\theta \\log \\pi_\\theta(a_t \\mid s_t) \\cdot R(\\tau) \\right]' },
            { note: '进一步用"因果性"论证可把 $R(\\tau)$ 换成 $G_t$（仅计算该时刻及之后的奖励）', tex: '\\nabla_\\theta J = \\mathbb{E}\\!\\left[\\sum_t \\nabla_\\theta \\log \\pi_\\theta(a_t \\mid s_t) \\cdot G_t \\right]' }
          ]
        },

        { type: 'h2', text: '4. REINFORCE 伪代码', anchor: 'pseudocode' },
        {
          type: 'pseudocode',
          title: 'REINFORCE (Williams, 1992)',
          lines: [
            'Initialize policy π_θ',
            'for episode = 1..M:',
            '    Sample trajectory τ = (s_0, a_0, r_0, ..., s_T)',
            '    for t = 0..T:',
            '        G_t ← Σ_{k=t}^T γ^{k-t} · r_k',
            '    # 梯度上升（或负号做梯度下降）',
            '    θ ← θ + α · Σ_t G_t · ∇_θ log π_θ(a_t | s_t)'
          ]
        },

        { type: 'h2', text: '5. 基线与方差缩减', anchor: 'baseline' },
        {
          type: 'p',
          text: '对任意与动作无关的函数 $b(s)$，下述"加基线"的梯度仍无偏：'
        },
        {
          type: 'math',
          tex: '\\nabla_\\theta J = \\mathbb{E}\\!\\left[\\sum_t \\nabla_\\theta \\log \\pi_\\theta(a_t \\mid s_t) \\cdot (G_t - b(s_t))\\right]'
        },
        {
          type: 'p',
          text: '证明：$\\mathbb{E}_a[\\nabla \\log \\pi \\cdot b(s)] = b(s) \\nabla \\int \\pi \\, da = 0$。方差则可以大幅减小。常用基线：滑动平均回报、状态价值 $V(s)$。前者简单，后者更精细（要学一个 critic）。'
        },

        { type: 'h2', text: '6. 优势函数的引入', anchor: 'advantage' },
        {
          type: 'p',
          text: '当 $b(s) = V^\\pi(s)$ 时，$G_t - V(s_t)$ 是对<b>优势函数</b>的估计：'
        },
        {
          type: 'math',
          tex: 'A^\\pi(s, a) = Q^\\pi(s, a) - V^\\pi(s)'
        },
        {
          type: 'p',
          text: '它表达了"在状态 $s$ 执行 $a$ 比平均水平好多少"。几乎所有现代策略梯度算法（AC、A2C、TRPO、PPO）都用某种 $\\hat{A}$ 估计替代 $G_t$。'
        },

        { type: 'h2', text: '7. 偏差-方差谱', anchor: 'bias-variance' },
        {
          type: 'table',
          headers: ['估计', '偏差', '方差', '说明'],
          rows: [
            ['$G_t$（MC）', '无', '大', 'REINFORCE 默认；等回合'],
            ['$G_t - V(s_t)$', '无', '中', 'REINFORCE + baseline'],
            ['$r_t + \\gamma V(s_{t+1}) - V(s_t)$', '有（V 不准）', '小', '单步 TD 优势；见 AC'],
            ['GAE(λ)', '可调', '可调', 'TRPO/PPO 标配']
          ]
        },

        { type: 'h2', text: '8. 常见失败模式与工程技巧', anchor: 'tricks' },
        {
          type: 'list',
          items: [
            '<b>策略退化</b>：训练中概率集中到单一动作后探索消失；加熵正则 $-\\beta \\sum_a \\pi \\log \\pi$。',
            '<b>回报归一化</b>：把 $G_t$ 减均值除标准差，显著稳定训练。',
            '<b>梯度裁剪</b>：防止 log-prob 爆炸。',
            '<b>学习率</b>：通常 $10^{-4}\\sim 10^{-3}$；可与 entropy coefficient 一并调。',
            '<b>折扣因子</b>：$\\gamma$ 选择影响方差与视野；CartPole 类任务常取 0.99。'
          ]
        },

        { type: 'h2', text: '9. 与 value-based 方法的对比', anchor: 'compare' },
        {
          type: 'table',
          headers: ['维度', 'Value-based（DQN）', 'Policy-based（REINFORCE）'],
          rows: [
            ['学什么', 'Q(s,a)', '策略 π_θ(a|s)'],
            ['动作空间', '离散为主', '离散 / 连续均可'],
            ['策略类型', '确定性（argmax Q）', '随机（概率分布）'],
            ['样本效率', '高（off-policy + replay）', '低（on-policy，轨迹即扔）'],
            ['理论稳定性', '致命三元组风险', '有梯度定理保障']
          ]
        },

        { type: 'h2', text: '10. 承上启下', anchor: 'bridge' },
        {
          type: 'p',
          text: 'REINFORCE 揭示了策略梯度的威力，但其高方差与低样本效率让它难以直接用于复杂任务。后续工作沿两条线改进：引入 critic 做时间差分估计（<b>Actor-Critic</b>）、约束策略更新幅度（<b>TRPO → PPO</b>）。下一章我们就进入 Actor-Critic 这一关键融合。'
        },

        { type: 'h2', text: '11. 延伸阅读', anchor: 'refs' },
        {
          type: 'references',
          items: [
            { title: 'Williams, "Simple statistical gradient-following algorithms for connectionist RL" (1992)' },
            { title: 'Sutton et al. "Policy Gradient Methods for RL with Function Approximation" (NIPS 2000)', url: 'https://papers.nips.cc/paper/1999/file/464d828b85b0bed98e80ade0a5c43b0f-Paper.pdf' },
            { title: 'Sutton & Barto, Chapter 13', url: 'http://incompleteideas.net/book/the-book-2nd.html' }
          ]
        }
      ]
    }
  },

  // ========== Actor-Critic ==========
  ac: {
    title: 'Actor-Critic',
    subtitle: '演员负责演，评论家负责看——两个网络的优雅协作',
    icon: '🎬',

    plain: {
      readMinutes: 6,
      blocks: [
        {
          type: 'p',
          text: '上一章我们学了 REINFORCE——最朴素的策略梯度。它很直接，但有两个问题一直没彻底解决。'
        },
        {
          type: 'p',
          text: '第一个问题是<b>方差大</b>——更新信号由"整局回报"驱动，一局的总奖励上下波动很厉害。第二个问题是<b>非得等一局结束才能学</b>——像蒙特卡洛方法一样，你必须收集完整轨迹才能计算 $G_t$。如果一局玩很久，训练就慢得出奇。'
        },
        {
          type: 'p',
          text: '这两个问题，其实在"时序差分"那一章我们都见过——当时我们说，用"下一状态的估值"来替代"完整回报"，能让学习变得又稳又快。那现在问题来了——<b>能不能把时序差分的思想嫁接到策略梯度上？</b>'
        },
        {
          type: 'hr-quote',
          text: '答案是：当然能。而且这一嫁接，催生了强化学习里最重要的家族之一——Actor-Critic。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: 'Actor-Critic 这个名字翻译过来就是"演员-评论家"。它的想法用一句话就能讲明白——'
        },
        {
          type: 'p',
          text: '<b>让两个网络一起工作：一个叫 Actor，负责输出策略（该做什么动作）；另一个叫 Critic，负责输出价值（这个状态/动作有多好）。Actor 做决定，Critic 评价——然后 Actor 根据 Critic 的评价来调整自己。</b>'
        },
        {
          type: 'callout',
          tone: 'tip',
          icon: '💡',
          text: '就像电影行业——演员只管演戏，评论家在旁边打分；演员根据打分来调整自己的演技，评论家也在不断校准自己的品味。两个人一起变强。'
        },
        {
          type: 'p',
          text: '这个类比虽然有点萌，但抓住了要害。Actor 其实就是 REINFORCE 里的那个策略网络 $\\pi_\\theta$；Critic 就是专门学价值函数 $V(s)$ 或 $Q(s, a)$ 的另一个网络。它们共享采样到的经验，但各自被用来更新不同的参数。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '那 Actor-Critic 是怎么让训练变稳变快的呢？关键在于它用一个叫 <b>TD 误差</b> 的东西，来代替 REINFORCE 里那个"整局回报"。'
        },
        {
          type: 'p',
          text: 'TD 误差的定义很朴素：<i>这一步之后我实际拿到的"即时奖励 + 下一状态价值估计"，减去我原本认为这个状态应该值多少</i>。如果这个差值是正的，说明"这一步比预期好"；如果是负的，说明"比预期差"。'
        },
        {
          type: 'p',
          text: '这个信号特别好用——它<b>只需要看一步</b>，不用等到回合结束。更重要的是，它的方差比"整局回报"小得多——因为它不被整局的偶然因素（比如后面那步手抖）拖累。'
        },
        {
          type: 'p',
          text: '所以 Actor-Critic 的更新方式就变成——每走一步，Critic 用 TD 误差去更新自己的价值估计；Actor 也用同一个 TD 误差作为权重，去调整这一步动作的概率。正的就把概率调上去，负的就调下去。'
        },
        {
          type: 'callout',
          tone: 'note',
          icon: '🎯',
          text: 'Actor-Critic 和 REINFORCE 的核心区别：前者用"当下一步的好坏差值"来推动更新，后者用"整局的总奖励"。一个是近视的快手，一个是远视的慢手——对时间尺度不算太大的任务，快手完胜。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '这个框架后来衍生出了一整个家族。'
        },
        {
          type: 'p',
          text: '<b>A2C</b>（Advantage Actor-Critic）——用 $A(s, a)$ = $Q(s, a) - V(s)$ 这种"优势函数"作为更新信号，相当于更精细的 baseline。'
        },
        {
          type: 'p',
          text: '<b>A3C</b>（Asynchronous A2C）——DeepMind 2016 年的经典工作。同时跑很多个 Actor-Critic 并行采样，打破时间上的相关性，早期深度强化学习圈子的标配。'
        },
        {
          type: 'p',
          text: '<b>TRPO / PPO</b>——在 Actor-Critic 基础上，加了一个"策略更新不能跨太大"的约束。这让训练更稳定、调参更容易。'
        },
        {
          type: 'p',
          text: '<b>DDPG / TD3 / SAC</b>——把 Actor-Critic 扩展到连续动作空间，让机器人、自动驾驶等连续控制任务也能用 RL 搞定。'
        },
        {
          type: 'p',
          text: '你会发现——从 2015 年之后，<b>几乎所有成功的深度强化学习算法，骨架都是 Actor-Critic</b>。它是一种架构性的胜利——不是某一个具体算法，而是一种组合方式。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '到这里你可以回头看——我们从最原始的 REINFORCE 出发，看到了它的高方差和低效；引入 Critic 把"整局回报"换成"TD 误差"之后，训练变得又快又稳。Actor-Critic 最精妙的地方在于：它不是简单地把两个方法拼在一起，而是让它们<b>互相帮忙、同时成长</b>。'
        },
        {
          type: 'hr-quote',
          text: 'Actor 在 Critic 的打分下学会做更好的决定，Critic 在 Actor 的采样下学会更准的评价。两者缺一不可，相互成就。'
        },
        {
          type: 'p',
          text: '下面的动画里你会看到，Actor 的概率分布和 Critic 的价值曲线同步演化——它们是两条独立又相关的轨迹，却指向同一个终点。你也可以和纯 REINFORCE 做对比，看看加上 Critic 之后学习曲线变得多平滑。'
        },
      ]
    },

    deep: {
      readMinutes: 14,
      blocks: [
        { type: 'h2', text: '1. 动机：从 REINFORCE 到 Actor-Critic', anchor: 'motivation' },
        {
          type: 'p',
          text: 'REINFORCE 用蒙特卡洛回报 $G_t$ 作为策略梯度权重，问题有二：<b>方差高</b>（整条轨迹累加造成）、<b>时效差</b>（必须等回合结束）。一个自然的改造是把 $G_t$ 替换为 TD 目标，这就需要一个估计价值的网络——Critic 由此诞生。'
        },

        { type: 'h2', text: '2. 基本更新规则', anchor: 'update' },
        {
          type: 'p',
          text: 'Critic 维护 $V_w(s)$（或 $Q_w(s, a)$），Actor 维护 $\\pi_\\theta(a \\mid s)$。单步 AC 使用 TD 误差：'
        },
        {
          type: 'math',
          tex: '\\delta_t = r_t + \\gamma V_w(s_{t+1}) - V_w(s_t)',
          label: 'TD 误差'
        },
        {
          type: 'p',
          text: '然后对 Critic 做均方 TD 误差的梯度下降，对 Actor 做策略梯度上升：'
        },
        {
          type: 'math',
          tex: 'w \\leftarrow w + \\beta\\,\\delta_t \\,\\nabla_w V_w(s_t)'
        },
        {
          type: 'math',
          tex: '\\theta \\leftarrow \\theta + \\alpha\\,\\delta_t \\,\\nabla_\\theta \\log \\pi_\\theta(a_t \\mid s_t)'
        },
        {
          type: 'p',
          text: '注意：Actor 更新使用的 $\\delta_t$ 是 <b>TD-based 优势估计</b>，相当于 REINFORCE 中的 $G_t - b(s_t)$ 的无限偏差更小、方差也更小的版本。'
        },

        { type: 'h2', text: '3. Advantage Actor-Critic（A2C）', anchor: 'a2c' },
        {
          type: 'p',
          text: '把 Actor 权重的通用形式写出来，就是优势函数 $A(s, a)$：'
        },
        {
          type: 'math',
          tex: '\\nabla_\\theta J \\approx \\mathbb{E}\\!\\left[\\,\\nabla_\\theta \\log \\pi_\\theta(a \\mid s)\\cdot A(s, a)\\right]'
        },
        {
          type: 'p',
          text: '$A$ 的几种常见估计方式（偏差-方差谱）：'
        },
        {
          type: 'table',
          headers: ['估计', '公式', '偏差', '方差'],
          rows: [
            ['TD(0) 优势', '$r_t + \\gamma V(s_{t+1}) - V(s_t)$', '高', '低'],
            ['n-step 优势', '$\\sum_{k=0}^{n-1}\\gamma^k r_{t+k} + \\gamma^n V(s_{t+n}) - V(s_t)$', '中', '中'],
            ['GAE(λ)', '$\\sum_{l=0}^{\\infty}(\\gamma\\lambda)^l \\delta_{t+l}$', '可调', '可调'],
            ['MC 优势', '$G_t - V(s_t)$', '低', '高']
          ]
        },

        { type: 'h2', text: '4. 单网络共享主干', anchor: 'shared-backbone' },
        {
          type: 'p',
          text: '工程上，Actor 与 Critic 常共享一个特征提取骨干，仅输出头不同：'
        },
        {
          type: 'pseudocode',
          title: 'Shared-backbone Actor-Critic',
          lines: [
            'h = Backbone(s)                 # 卷积 / MLP',
            'logits = PolicyHead(h)          # Actor：离散 softmax 或连续高斯参数',
            'v     = ValueHead(h)            # Critic：标量 V(s)',
            'L = L_policy + c1 · L_value − c2 · H(π)',
            '# c1 = value coef，c2 = entropy coef，H 为熵正则'
          ]
        },
        {
          type: 'p',
          text: '熵正则 $H(\\pi) = -\\sum_a \\pi(a \\mid s) \\log \\pi(a \\mid s)$ 促使策略保持探索，防止过早 degenerate。典型系数 $c_1 \\approx 0.5,\\ c_2 \\in [0.001, 0.01]$。'
        },

        { type: 'h2', text: '5. A3C：异步并行', anchor: 'a3c' },
        {
          type: 'p',
          text: 'Mnih et al. (2016) 提出 <b>A3C</b>（Asynchronous Advantage Actor-Critic）：多个 worker 同时与各自环境交互，独立计算梯度，再异步累加到共享参数。优点：样本更 i.i.d.、无需经验回放、CPU 友好。其同步版 <b>A2C</b>（通过 GPU 批处理）在实现和复现性上更受欢迎。'
        },

        { type: 'h2', text: '6. 算法伪代码', anchor: 'pseudocode' },
        {
          type: 'pseudocode',
          title: 'A2C (Synchronous, N-step)',
          lines: [
            'Initialize θ (actor), w (critic), shared backbone',
            'for iteration = 1..K:',
            '    for each of N_env parallel envs:',
            '        run policy π_θ for T steps, collect (s_t, a_t, r_t)',
            '    # Compute returns & advantages (N-step or GAE)',
            '    for t in reverse(0..T-1):',
            '        R_t ← r_t + γ · R_{t+1} · (1 − done)',
            '        A_t ← R_t − V_w(s_t)',
            '    # Gradient step',
            '    L_policy = − Σ log π_θ(a_t|s_t) · stop_grad(A_t)',
            '    L_value  = Σ (R_t − V_w(s_t))²',
            '    L_ent    = − Σ H(π_θ(·|s_t))',
            '    L_total  = L_policy + c1·L_value + c2·L_ent',
            '    θ, w ← Adam step on ∇ L_total'
          ]
        },

        { type: 'h2', text: '7. 为什么要 stop_grad(A)', anchor: 'stop-grad' },
        {
          type: 'p',
          text: 'Actor 损失中 $A_t$ 依赖 $V_w$，但梯度只应流回 Actor 参数 $\\theta$，不应借 $A_t$ 再一次流到 Critic 上（否则会让 Critic 直接拟合自身，产生循环信号）。实现上用 <code>.detach()</code> 或 <code>tf.stop_gradient</code>。'
        },

        { type: 'h2', text: '8. 收敛性与理论', anchor: 'theory' },
        {
          type: 'p',
          text: '严格的收敛证明（Konda & Tsitsiklis, 2000）要求 Critic 比 Actor 以更快的时间尺度更新，形成"双时间尺度随机逼近"。实践上常简单取 $\\beta > \\alpha$ 即可。"natural actor-critic"（Kakade 2001; Peters & Schaal 2008）用 Fisher 信息预处理梯度，是后来 TRPO 的前身。'
        },

        { type: 'h2', text: '9. 常见失败模式', anchor: 'pitfalls' },
        {
          type: 'list',
          items: [
            '<b>Critic 拟合慢</b>：若 $V$ 严重偏低/偏高，Advantage 方向错误，策略崩溃。——提高 critic 学习率或 value coef。',
            '<b>熵坍塌</b>：策略过早收敛到单一动作。——增大熵正则或用 entropy schedule。',
            '<b>奖励尺度过大</b>：使得 $V$ 数值爆炸。——对 reward 或 advantage 做归一化。',
            '<b>共享骨干冲突</b>：Policy 与 Value 的梯度方向不一致。——可分离双骨干，或用 $c_1$ 平衡。'
          ]
        },

        { type: 'h2', text: '10. 与后续方法的关系', anchor: 'bridge' },
        {
          type: 'olist',
          items: [
            '加 KL 约束 → <b>TRPO</b>（Trust Region）',
            '用 clip 替代 KL → <b>PPO</b>（PPO-Clip）',
            '连续动作 + 确定性策略 → <b>DDPG / TD3</b>',
            '熵最大化强化学习 → <b>SAC</b>',
            'LLM 对齐 → <b>RLHF</b>（内核仍是 PPO-AC）'
          ]
        },

        { type: 'h2', text: '11. 延伸阅读', anchor: 'refs' },
        {
          type: 'references',
          items: [
            { title: 'Konda & Tsitsiklis, "Actor-Critic Algorithms" (NIPS 2000)' },
            { title: 'Mnih et al. "Asynchronous Methods for Deep RL" (ICML 2016)', url: 'https://arxiv.org/abs/1602.01783' },
            { title: 'Peters & Schaal, "Natural Actor-Critic" (Neurocomputing 2008)' }
          ]
        }
      ]
    }
  },

  // ========== TRPO ==========
  trpo: {
    title: 'TRPO · 信赖域策略优化',
    subtitle: '在旧策略身边画一个"安全圈"，保证每一步更新都稳步前进',
    icon: '🛡️',

    plain: {
      readMinutes: 6,
      blocks: [
        {
          type: 'p',
          text: '到这里为止，我们已经掌握了 Actor-Critic 的框架。用它训练策略，效果已经相当不错了——但如果你真的动手调过参，就会发现一个让人抓狂的问题：<b>学习率</b>。'
        },
        {
          type: 'p',
          text: '学习率大了，策略一下步子迈太大，更新后效果反而变差；学习率小了，训练慢得要命。而且麻烦在于，"合适的学习率"因任务而异，因训练阶段而异——同一个数值，在训练初期刚刚好，到了中期就变太大。'
        },
        {
          type: 'p',
          text: '为什么会这样？因为在强化学习里，<b>策略一变，它采样出来的数据分布也跟着变</b>。如果策略迈了一大步，那下一批数据就和这一批数据差异很大——你基于"旧数据"算出来的梯度，对"新策略"来说可能已经完全不适用了。有时候这一步迈错了方向，策略就再也爬不起来了。'
        },
        {
          type: 'hr-quote',
          text: '一步走错，步步皆错——这正是策略梯度训练不稳定的根源。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '2015 年，John Schulman 和他的同事们提出了一个漂亮的想法：<b>我们不是每一步都要"尽可能往好里走"吗？那能不能在保证"新策略不离旧策略太远"的前提下，每次找那个"最好的新策略"？</b>'
        },
        {
          type: 'p',
          text: '这个想法非常朴素——"别跨太大步"。但要把它变成数学形式，得先回答一个问题：<b>"两个策略「近不近」，用什么来度量？"</b>'
        },
        {
          type: 'p',
          text: '答案是一个来自信息论的东西——<b>KL 散度</b>（Kullback-Leibler divergence）。你可以粗糙地把它理解成"两个概率分布之间的距离"——KL 大，意味着两个策略在同样的状态下，给出的动作概率差别很大；KL 小，意味着两个策略几乎一样。'
        },
        {
          type: 'p',
          text: '所以 TRPO 的核心思想就被写出来了——<b>在 KL 散度不超过某个阈值 δ 的范围内，找那个能最大化期望回报的新策略。</b>'
        },
        {
          type: 'callout',
          tone: 'tip',
          icon: '💡',
          text: '这就像你在登山——不是"闭着眼睛迈大步", 而是"先在脚下画一个小圆圈，在这个圆圈里找海拔最高的点，再朝它走一步"。这个圆圈叫"信赖域"，这就是 Trust Region 的来历。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '这个想法听起来很优雅，但要真的做到，数学上相当复杂。你要在"KL 不超过 δ"的限制下做优化——这叫<b>带约束的优化</b>，比普通梯度下降难得多。'
        },
        {
          type: 'p',
          text: 'TRPO 的做法是：先对目标函数做一个线性近似，再对 KL 约束做一个二阶近似，然后解出一个"自然梯度"方向。之所以用"自然梯度"而不是普通梯度，是因为 KL 度量了"分布空间里的距离"，而普通梯度度量的是"参数空间里的距离"——它们不是一回事。自然梯度能帮你在"分布空间"里走得更合理。'
        },
        {
          type: 'p',
          text: '解出这个方向之后，TRPO 还要做一次<b>线搜索</b>——沿着这个方向走几步，每一步都检查一下是否真的满足 KL 约束，并且目标函数有没有改进。如果不满足，就缩小步长再试。这样反复，直到找到一个"进步了又没跨太大"的步长。'
        },
        {
          type: 'callout',
          tone: 'note',
          icon: '🎯',
          text: 'TRPO 的核心价值在于——它提供了<b>理论上的单调改进保证</b>：每次更新之后，策略的期望回报只会变好，不会变差（在一定条件下）。这是策略梯度方法里第一次有人给出这么强的保证。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '不过 TRPO 也有缺点——它的实现太复杂了。那个"自然梯度"的计算需要共轭梯度法，需要算二阶导数（或用 Fisher 向量积近似），还要做线搜索……实际工程里代码写起来非常痛苦，训练也慢。'
        },
        {
          type: 'p',
          text: '这也是为什么 TRPO 虽然开创了"信赖域"这一思路，但它本身并没有在工业界大规模流行。人们一直在想：<b>有没有办法把 TRPO 的"安全性"保留下来，但让算法实现变简单？</b>'
        },
        {
          type: 'p',
          text: '答案就是下一章的主角——<b>PPO</b>。Schulman 本人在两年后提出了它——PPO 用一个简单的"裁剪"技巧，近似实现了 TRPO 的效果，但代码短得多、跑得也快得多。它一出来就横扫业界，成了"万能首选"。'
        },
        {
          type: 'hr-quote',
          text: 'TRPO 是那个打开了"信赖域"大门的先驱，PPO 是那个把房间装修得舒适宜居的后来者。'
        },
        {
          type: 'p',
          text: '所以你可能会问：既然有了 PPO，为什么还要学 TRPO？答案是——<b>要理解 PPO 为什么 work，就必须理解 TRPO 在背后给出的理论保障</b>。PPO 的 clip 不是凭空变出来的，它是 TRPO 的一种廉价替代品。懂了 TRPO，你才真正懂 PPO。'
        },
        {
          type: 'p',
          text: '下面的动画里，你可以看到策略在参数空间里的 2D 投影——旧策略是橙色点，新策略被限制在一个紫色的圆圈里。你可以拖动 δ 来观察"圈子"放大或收紧时，训练的效果差异。圈太小了，走得慢；圈太大了，又容易走偏——这就是 TRPO 要解决的核心矛盾。'
        },
      ]
    },

    deep: {
      readMinutes: 14,
      blocks: [
        { type: 'h2', text: '1. 动机：策略更新的步长困境', anchor: 'motivation' },
        {
          type: 'p',
          text: '策略梯度 $\\theta \\leftarrow \\theta + \\alpha \\nabla_\\theta J$ 的步长 $\\alpha$ 极难取：过大使策略偏离采样分布、性能暴跌；过小则训练低效。问题根源在于<b>策略改变会改变后续数据分布</b>，这不是标准监督学习的问题设置。'
        },

        { type: 'h2', text: '2. 代理目标（Surrogate Objective）', anchor: 'surrogate' },
        {
          type: 'p',
          text: 'Kakade & Langford (2002) 给出精确的"策略改进下界"。令旧策略为 $\\pi_{\\theta_{\\text{old}}}$，新策略 $\\pi_\\theta$。通过重要性采样可以构造代理目标：'
        },
        {
          type: 'math',
          tex: 'L_{\\theta_{\\text{old}}}(\\theta) = \\mathbb{E}_{s \\sim d^{\\pi_{\\text{old}}},\\,a \\sim \\pi_{\\text{old}}}\\!\\left[\\,\\frac{\\pi_\\theta(a \\mid s)}{\\pi_{\\text{old}}(a \\mid s)} \\cdot A^{\\pi_{\\text{old}}}(s, a)\\,\\right]',
          label: '代理目标'
        },
        {
          type: 'p',
          text: '关键事实：$L$ 与真实目标 $J(\\pi_\\theta)$ 在 $\\theta = \\theta_{\\text{old}}$ 处一阶相等。但 $L$ 只在 $\\pi_\\theta$ 与 $\\pi_{\\text{old}}$ "足够近"时才是好的近似。'
        },

        { type: 'h2', text: '3. Schulman 的单调改进下界', anchor: 'bound' },
        {
          type: 'math',
          tex: 'J(\\pi_\\theta) \\geq L_{\\theta_{\\text{old}}}(\\theta) - C \\cdot D_{\\mathrm{KL}}^{\\max}(\\pi_{\\text{old}},\\,\\pi_\\theta)',
          label: '下界'
        },
        {
          type: 'p',
          text: '其中 $C$ 取决于环境的折扣和优势函数上界，$D_{\\mathrm{KL}}^{\\max}$ 是在所有状态上的 KL 最大值。这意味着——只要我们在"$L$ 提升"与"KL 控制"之间权衡好，真实目标 $J$ 必然改进。'
        },

        { type: 'h2', text: '4. TRPO 的优化问题', anchor: 'problem' },
        {
          type: 'p',
          text: '直接把"最大 KL"换成"平均 KL"后，TRPO 求解如下带约束问题：'
        },
        {
          type: 'math',
          tex: '\\max_{\\theta}\\ L_{\\theta_{\\text{old}}}(\\theta) \\quad \\text{s.t.}\\quad \\bar{D}_{\\mathrm{KL}}(\\pi_{\\text{old}},\\pi_\\theta) \\leq \\delta',
          label: 'TRPO 形式'
        },
        {
          type: 'p',
          text: '这是<b>约束优化</b>，普通梯度下降不能直接处理。TRPO 采用以下近似。'
        },

        { type: 'h2', text: '5. 自然梯度解', anchor: 'natural-grad' },
        {
          type: 'derivation',
          steps: [
            { note: '目标线性化：$L(\\theta) \\approx L(\\theta_{\\text{old}}) + g^\\top (\\theta - \\theta_{\\text{old}})$，其中 $g = \\nabla_\\theta L$', tex: 'g = \\nabla_\\theta L(\\theta)\\big|_{\\theta=\\theta_{\\text{old}}}' },
            { note: 'KL 二次化：$\\bar{D}_{\\mathrm{KL}} \\approx \\tfrac{1}{2} (\\theta - \\theta_{\\text{old}})^\\top F (\\theta - \\theta_{\\text{old}})$，$F$ 是 Fisher 信息矩阵', tex: 'F = \\mathbb{E}_{s}\\!\\left[\\,\\nabla_\\theta \\log \\pi_\\theta \\cdot \\nabla_\\theta \\log \\pi_\\theta^\\top\\,\\right]' },
            { note: '用 Lagrange 解析求解，方向即自然梯度', tex: '\\Delta\\theta = \\sqrt{\\frac{2\\delta}{g^\\top F^{-1} g}}\\, F^{-1} g' }
          ]
        },
        {
          type: 'p',
          text: 'Fisher 矩阵 $F$ 在高维下不能直接求逆。TRPO 用<b>共轭梯度法</b>（Conjugate Gradient, CG）迭代求解 $F x = g$，再用 Fisher-Vector Product（FVP）避免显式构造 $F$。'
        },

        { type: 'h2', text: '6. 线搜索确保单调改进', anchor: 'linesearch' },
        {
          type: 'p',
          text: '二次近似只在小邻域有效。TRPO 取 $\\Delta\\theta$ 之后做指数衰减线搜索：'
        },
        {
          type: 'pseudocode',
          title: 'Backtracking Line Search',
          lines: [
            'α ← 1',
            'for j = 0..J_max:',
            '    θ_new ← θ_old + α · Δθ',
            '    if KL(θ_old, θ_new) ≤ δ and L(θ_new) > L(θ_old):',
            '        return θ_new',
            '    α ← α · 0.5',
            'return θ_old   # 更新失败则回退'
          ]
        },

        { type: 'h2', text: '7. 完整伪代码', anchor: 'pseudocode' },
        {
          type: 'pseudocode',
          title: 'TRPO',
          lines: [
            'for iter = 1..K:',
            '    # 1. 采样',
            '    Collect trajectories with π_{θ_old}',
            '    Compute advantages Â_t (GAE)',
            '    # 2. 方向（共轭梯度）',
            '    g ← ∇_θ L(θ_old)',
            '    x ← CG(F·, g)              # 解 F x = g',
            '    Δθ ← √(2δ / (x·F·x)) · x',
            '    # 3. 线搜索',
            '    θ ← line_search(θ_old, Δθ, δ)',
            '    # 4. Critic 更新',
            '    Fit V_w to returns (MSE)'
          ]
        },

        { type: 'h2', text: '8. TRPO 的理论贡献', anchor: 'theory' },
        {
          type: 'list',
          items: [
            '首次把"策略梯度"与"信赖域方法"结合，提供<b>单调改进的理论保证</b>（在无近似误差下）。',
            '打开了"用 KL 约束控制策略更新"这条路线，后续 PPO、ACER、SAC 等都受其启发。',
            '验证了<b>自然梯度</b>在深度强化学习中的实用性（早期 Kakade 2001 提出，但工程可行性直到 TRPO 才站稳）。'
          ]
        },

        { type: 'h2', text: '9. TRPO 的局限', anchor: 'limits' },
        {
          type: 'list',
          items: [
            '<b>实现复杂</b>：CG + FVP + 线搜索，代码量大、调试难。',
            '<b>计算昂贵</b>：每次更新都要多次前向+反向，单步代价高。',
            '<b>不兼容某些架构</b>：如参数共享的 Actor-Critic、循环网络，Fisher 计算棘手。',
            '<b>样本效率仍为 on-policy</b>：无法利用旧数据做多轮更新。'
          ]
        },

        { type: 'h2', text: '10. 与 PPO 的关系', anchor: 'to-ppo' },
        {
          type: 'p',
          text: 'Schulman 等人在 2017 年提出 PPO，核心思想是：<b>用简单的"概率比裁剪"替代 KL 约束</b>。PPO 牺牲了严格的理论保证，换来了代码简洁、可同一批数据训练多 epoch 的巨大工程优势。PPO 成为事实上的工业标准，TRPO 则更多作为参考实现和理论基石被保留。'
        },
        {
          type: 'callout',
          tone: 'tip',
          text: '理解 TRPO 最大的价值，是理解<b>"为什么要限制策略变化幅度"</b>——这个问题的答案与具体的 clip 形式无关，是所有现代策略梯度方法共同的灵魂。'
        },

        { type: 'h2', text: '11. 延伸阅读', anchor: 'refs' },
        {
          type: 'references',
          items: [
            { title: 'Schulman et al. "Trust Region Policy Optimization" (ICML 2015)', url: 'https://arxiv.org/abs/1502.05477' },
            { title: 'Kakade & Langford, "Approximately Optimal Approximate RL" (ICML 2002)' },
            { title: 'Kakade, "A Natural Policy Gradient" (NIPS 2001)' },
            { title: 'Wu et al. "Scalable Trust-region Method for Deep RL using Kronecker-factored Approximation (ACKTR)" (NIPS 2017)', url: 'https://arxiv.org/abs/1708.05144' }
          ]
        }
      ]
    }
  },

  // ========== DDPG ==========
  ddpg: {
    title: 'DDPG · 深度确定性策略梯度',
    subtitle: '把 DQN 的技巧搬进 Actor-Critic，让机器人学会控制连续动作',
    icon: '🤖',

    plain: {
      readMinutes: 6,
      blocks: [
        {
          type: 'p',
          text: '到这一章为止，我们所有的算法都有一个隐藏的前提——<b>动作是离散的</b>。向上、向下、向左、向右；跳或者不跳；出石头、剪刀或布。这些都是可以枚举出来的有限选项。'
        },
        {
          type: 'p',
          text: '但真实世界里，很多决策根本不是这个样子。'
        },
        {
          type: 'p',
          text: '一辆自动驾驶的车，它要决定方向盘打多少度——可以是 0.3°，也可以是 0.31°，还可以是 -2.15°，这是<b>连续</b>的。机器人手臂抓取物体时，每个关节的扭矩也是连续的值。无人机的姿态控制、火箭的推力调节、化工厂的流量阀门……凡是涉及物理世界精细控制的地方，动作空间都是连续的。'
        },
        {
          type: 'hr-quote',
          text: '而连续动作，恰好是 DQN 和 Q-Learning 的死穴。'
        },
        {
          type: 'p',
          text: '你想想：Q-Learning 的核心更新里有一步 $\\max_{a\'} Q(s\', a\')$ ——在所有动作里找 Q 值最大的那个。动作是离散的时候，这很容易：扫一遍所有动作就行。可如果动作是连续的实数呢？那是无穷多个可能，你怎么遍历？'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: 'DDPG 就是为了解决这个问题而生的。它的思路很聪明——<b>既然我没法遍历所有动作去找最大 Q 值，那我干脆再训练一个网络，让它的输出"直接就是"那个最好的动作。</b>'
        },
        {
          type: 'p',
          text: '具体来说，DDPG 里有一个 Actor 网络 μ(s)，它吃进去一个状态，直接吐出来一个（连续）动作——就是它认为在这个状态下"最好"的那个。不用概率分布，不用 softmax，就是一个确定的实数向量。这就是"确定性策略"（Deterministic Policy）这个名字的来历。'
        },
        {
          type: 'p',
          text: '然后还有一个 Critic 网络 Q(s, a)——和普通的 Q 网络一样，吃进去状态和动作，吐出 Q 值。'
        },
        {
          type: 'p',
          text: '两个网络怎么配合？思路很朴素：<b>Actor 尽量输出让 Critic 给高分的动作；Critic 尽量准确地给 Actor 的输出打分。</b>于是 Actor 的更新目标就是"最大化 Q(s, μ(s))"——通过链式法则，梯度可以从 Critic 一路穿回到 Actor 身上，让 Actor 学到"怎么调整动作，能让 Q 值升高"。这就是"确定性策略梯度"（Deterministic Policy Gradient）定理的威力。'
        },
        {
          type: 'callout',
          tone: 'tip',
          icon: '💡',
          text: '一句话概括 DDPG：<b>Actor 负责出动作，Critic 负责打分，梯度从 Critic 回传到 Actor，让 Actor 学会"讨好" Critic——只要 Critic 靠谱，Actor 就能越来越强。</b>'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '这听起来很简单，但要让它真的跑起来、不崩掉，DDPG 还做了一些聪明的借鉴。'
        },
        {
          type: 'p',
          text: '还记得 DQN 那两个让训练稳定下来的技巧吗？<b>经验回放</b>和<b>目标网络</b>。DDPG 把这两样<b>原封不动地搬了过来</b>。每走一步，经验丢进一个大池子；训练时从池子里随机抽一批出来学，打破样本相关性。Actor 和 Critic 各自都有一份"目标网络"副本，用来算稳定的 TD 目标。'
        },
        {
          type: 'p',
          text: '不过 DDPG 对目标网络做了个小改动——它不用 DQN 那种"每 C 步硬拷贝"的方式，而是采用"软更新"：每一步都让目标网络朝在线网络靠拢一点点（比如移动 0.5%）。这样目标变化更平滑，稳定性更好。'
        },
        {
          type: 'p',
          text: '还有一个问题：<b>Actor 是确定性策略，那它怎么探索？</b>每次同样的状态都输出同样的动作，那它永远只能在一条路上走下去，永远看不到别的可能。'
        },
        {
          type: 'p',
          text: 'DDPG 的办法是——<b>在 Actor 输出的动作上，加一点随机噪声</b>。就像你本来决定把方向盘打 5°，但为了探索一下，实际打了 5.3°。这样每次决策都有点扰动，就能看到不同的结果。加噪声有不同花样，早期 DDPG 用 OU 噪声（一种带"记忆"的时间相关噪声，更适合物理控制），后来的 TD3 发现直接用高斯噪声就够了。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: 'DDPG 开创了一个重要的算法家族，但它也有不少问题——最大的问题是<b>高估偏差</b>。Critic 容易把某些动作的 Q 值估得过高，Actor 就会朝那些"虚高"的方向靠拢，结果策略越学越偏。'
        },
        {
          type: 'p',
          text: '为了解决这些问题，后来人们做了两个重要改进。'
        },
        {
          type: 'p',
          text: '<b>TD3</b>（Twin Delayed DDPG，2018）——用两个 Critic 网络，取它们给出的 Q 值中的较小值当目标，抑制高估；Actor 的更新频率比 Critic 慢一点，让 Critic 先稳定下来；在目标策略上加噪声，让 Q 函数更"平滑"。这三个技巧加起来，效果比 DDPG 好得多。'
        },
        {
          type: 'p',
          text: '<b>SAC</b>（Soft Actor-Critic，2018）——在目标函数里加一项"熵"，主动鼓励策略保持随机性。这相当于一个"持续的探索奖励"，让策略既学最优动作、又不会过度聚焦。SAC 在样本效率和稳定性上都非常出色，成了现在连续控制的事实标准。'
        },
        {
          type: 'callout',
          tone: 'note',
          icon: '🎯',
          text: '如果你今天要在一个连续控制任务上跑 RL，建议的选择优先级是：<b>SAC > TD3 > DDPG</b>。DDPG 更多是一个学习用的起点。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '说到底，DDPG 的核心贡献是：<b>它把 DQN 的"离散世界"和 Actor-Critic 的"策略网络"合流成了一条河——让 RL 第一次真正进入了连续控制的领地</b>。有了它之后，机器人、无人机、模拟物理控制这些"硬核"任务，才真正成了 RL 的主场。'
        },
        {
          type: 'hr-quote',
          text: 'DDPG = DQN 的稳定性 + Actor-Critic 的连续性 + 确定性策略梯度定理的数学保证。'
        },
        {
          type: 'p',
          text: '下面的动画里，你可以看到一个小智能体追踪目标点的过程——Actor 输出连续的 (fx, fy) 向量，Critic 在评估这个动作的价值，二者在经验池里交替学习。你可以调探索噪声 σ 和软更新 τ，看它们对训练曲线的影响。'
        },
      ]
    },

    deep: {
      readMinutes: 13,
      blocks: [
        { type: 'h2', text: '1. 为什么需要 DDPG', anchor: 'motivation' },
        {
          type: 'p',
          text: 'DQN 的最大限制是<b>动作空间必须离散</b>——更新目标 $\\max_{a\'} Q(s\', a\')$ 在连续动作下无法枚举求解。REINFORCE / AC 虽然可处理连续动作（用高斯策略），但是 on-policy 的，样本效率低。DDPG（Lillicrap et al., 2016）把 DPG 定理（Silver et al. 2014）和 DQN 技巧结合，得到一个可处理连续动作的 off-policy AC 方法。'
        },

        { type: 'h2', text: '2. 确定性策略梯度定理', anchor: 'dpg' },
        {
          type: 'p',
          text: '令 $\\mu_\\theta: \\mathcal{S} \\to \\mathcal{A}$ 为确定性策略。其期望回报关于参数 $\\theta$ 的梯度为（Silver, 2014）：'
        },
        {
          type: 'math',
          tex: '\\nabla_\\theta J(\\mu_\\theta) = \\mathbb{E}_{s \\sim d^\\mu}\\!\\left[\\,\\nabla_\\theta \\mu_\\theta(s) \\cdot \\nabla_a Q^\\mu(s, a)\\big|_{a=\\mu_\\theta(s)}\\,\\right]',
          label: '确定性策略梯度定理'
        },
        {
          type: 'p',
          text: '与随机策略梯度不同，DPG 不对动作期望，直接用链式法则穿过 $Q$ 的动作变量——样本效率更高、方差更小。'
        },

        { type: 'h2', text: '3. DDPG 四网络架构', anchor: 'architecture' },
        {
          type: 'table',
          headers: ['网络', '参数', '作用'],
          rows: [
            ['Actor', '$\\theta$', '输出动作 $a = \\mu_\\theta(s)$'],
            ['Critic', '$w$', '估计 $Q_w(s, a)$'],
            ['Target Actor', '$\\theta^-$', '软更新跟随 $\\theta$，计算稳定目标动作'],
            ['Target Critic', '$w^-$', '软更新跟随 $w$，计算稳定 TD 目标']
          ]
        },
        {
          type: 'math',
          tex: '\\theta^- \\leftarrow \\tau\\,\\theta + (1-\\tau)\\,\\theta^-\\quad,\\quad w^- \\leftarrow \\tau\\,w + (1-\\tau)\\,w^-',
          label: '软更新（Polyak averaging）'
        },
        {
          type: 'p',
          text: '$\\tau \\approx 0.005$，目标网络每步都同步一个很小的比例，避免硬拷贝导致的"跳变"。'
        },

        { type: 'h2', text: '4. 损失与目标', anchor: 'loss' },
        {
          type: 'math',
          tex: 'y_t = r_t + \\gamma\\,Q_{w^-}(s_{t+1},\\,\\mu_{\\theta^-}(s_{t+1}))',
          label: 'Critic TD 目标'
        },
        {
          type: 'math',
          tex: '\\mathcal{L}(w) = \\mathbb{E}_{(s,a,r,s\') \\sim \\mathcal{D}}\\!\\left[\\,\\big(y - Q_w(s, a)\\big)^2\\,\\right]'
        },
        {
          type: 'math',
          tex: '\\mathcal{L}(\\theta) = -\\mathbb{E}_{s \\sim \\mathcal{D}}\\!\\left[\\,Q_w\\!\\big(s,\\,\\mu_\\theta(s)\\big)\\,\\right]',
          label: 'Actor 损失（负号→最大化）'
        },
        {
          type: 'p',
          text: '实现时用自动微分：Actor 损失关于 $\\theta$ 的梯度自然通过 $Q_w$ 回传到 $\\mu_\\theta$。'
        },

        { type: 'h2', text: '5. 探索策略', anchor: 'exploration' },
        {
          type: 'p',
          text: '确定性策略本身不产生随机性。行为策略用加噪动作：'
        },
        {
          type: 'math',
          tex: 'a_t = \\mu_\\theta(s_t) + \\mathcal{N}_t'
        },
        {
          type: 'list',
          items: [
            '<b>OU 噪声</b>（Ornstein-Uhlenbeck）：时间相关，适合惯性物理系统。',
            '<b>高斯噪声</b> $\\mathcal{N}(0, \\sigma^2)$：简单有效，TD3/SAC 采用。',
            '<b>参数噪声</b>（Plappert et al., 2018）：直接扰动 Actor 参数，探索更具一致性。'
          ]
        },

        { type: 'h2', text: '6. 算法伪代码', anchor: 'pseudocode' },
        {
          type: 'pseudocode',
          title: 'DDPG',
          lines: [
            'Initialize μ_θ, Q_w; target μ_{θ⁻} ← μ_θ, Q_{w⁻} ← Q_w',
            'Initialize replay buffer D',
            'for episode = 1..M:',
            '    Reset noise process N; s ← env.reset()',
            '    while not done:',
            '        a ← μ_θ(s) + N_t           # 加噪探索',
            '        s\', r, done ← env.step(a)',
            '        D.push((s, a, r, s\', done))',
            '        s ← s\'',
            '        # --- Update ---',
            '        Sample mini-batch B ~ D',
            '        y ← r + (1-done)·γ·Q_{w⁻}(s\', μ_{θ⁻}(s\'))',
            '        Update w by ∇_w (Q_w(s,a) − y)²',
            '        Update θ by −∇_θ Q_w(s, μ_θ(s))',
            '        # Soft update',
            '        θ⁻ ← τθ + (1−τ)θ⁻',
            '        w⁻ ← τw + (1−τ)w⁻'
          ]
        },

        { type: 'h2', text: '7. 已知的问题', anchor: 'issues' },
        {
          type: 'list',
          items: [
            '<b>Q 值高估</b>：与 DQN 同源，max 或 $\\mu$ 梯度会选中被估值噪声偏高的动作。',
            '<b>脆弱</b>：对学习率、噪声方差、batch size 均敏感，调参难。',
            '<b>易陷局部最优</b>：确定性策略缺少结构化探索。',
            '<b>回放池混策略</b>：早期与当前策略差异太大的样本可能有偏。'
          ]
        },

        { type: 'h2', text: '8. TD3：三个关键改进', anchor: 'td3' },
        {
          type: 'olist',
          items: [
            '<b>Clipped Double-Q</b>：训练两套 Critic，目标取较小：$y = r + \\gamma \\min_{i=1,2} Q_{w^-_i}(s\', \\tilde{a})$。',
            '<b>Delayed Policy Update</b>：Critic 更新 d 次后才更新 Actor 一次（通常 d=2）。',
            '<b>Target Policy Smoothing</b>：给目标动作 $\\tilde{a} = \\mu_{\\theta^-}(s\') + \\epsilon,\\ \\epsilon \\sim \\text{clip}(\\mathcal{N}, -c, c)$ 加噪并裁剪，平滑 Q 函数。'
          ]
        },

        { type: 'h2', text: '9. SAC：随机 + 熵正则', anchor: 'sac' },
        {
          type: 'p',
          text: 'Soft Actor-Critic（Haarnoja et al., 2018）放弃确定性策略，改用高斯策略并引入最大熵目标：'
        },
        {
          type: 'math',
          tex: 'J(\\pi) = \\mathbb{E}\\!\\left[\\sum_t r_t + \\alpha\\,\\mathcal{H}(\\pi(\\cdot \\mid s_t))\\right]'
        },
        {
          type: 'p',
          text: '熵正则天然鼓励探索，温度 $\\alpha$ 可自动调节，SAC 成为当前连续控制的 SOTA。'
        },

        { type: 'h2', text: '10. 实现注意事项', anchor: 'tricks' },
        {
          type: 'list',
          items: [
            '动作必须做边界约束（如 tanh 压到 [-1, 1] 再缩放）。',
            '奖励归一化 / 状态归一化对稳定性影响巨大。',
            '经验池 $\\sim 10^6$，warm-up 几万步再开始更新。',
            'Adam 学习率：Actor $10^{-4}$，Critic $10^{-3}$ 是常见起点。',
            'batch size 通常 64~256。'
          ]
        },

        { type: 'h2', text: '11. 延伸阅读', anchor: 'refs' },
        {
          type: 'references',
          items: [
            { title: 'Silver et al. "Deterministic Policy Gradient Algorithms" (ICML 2014)', url: 'http://proceedings.mlr.press/v32/silver14.html' },
            { title: 'Lillicrap et al. "Continuous Control with Deep RL" (ICLR 2016)', url: 'https://arxiv.org/abs/1509.02971' },
            { title: 'Fujimoto et al. "Addressing Function Approximation Error in Actor-Critic" (TD3, ICML 2018)', url: 'https://arxiv.org/abs/1802.09477' },
            { title: 'Haarnoja et al. "Soft Actor-Critic" (ICML 2018)', url: 'https://arxiv.org/abs/1801.01290' }
          ]
        }
      ]
    }
  },

  // ========== LLM 对齐 ==========
  llm: {
    title: '大模型对齐：RLHF / DPO / GRPO',
    subtitle: '让语言模型"听懂人话"——RL 在 LLM 时代最重要的应用',
    icon: '✨',

    plain: {
      readMinutes: 8,
      blocks: [
        {
          type: 'p',
          text: '到这一章为止，你可能会觉得强化学习大多活在游戏、机器人、控制这些场景里。但实际上，过去几年影响最大、落地最广的 RL 应用，藏在一个你每天都在用的东西里——<b>ChatGPT</b>。'
        },
        {
          type: 'p',
          text: '准确说，ChatGPT 之所以能从一个只会"预测下一个词"的统计机器，变成一个会礼貌回答问题、会拒绝糟糕请求、会承认自己错误的"助手"，背后那个关键环节叫做 <b>RLHF</b>——Reinforcement Learning from Human Feedback，基于人类反馈的强化学习。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '要讲清楚 RLHF，得先说清楚它在解决什么问题。'
        },
        {
          type: 'p',
          text: '大语言模型的第一阶段是"预训练"——喂给它半个互联网的文本，让它学会预测下一个词。这阶段结束后，它已经掌握了惊人的语言能力和世界知识。但你直接用它，会发现它怪怪的——你问"帮我写个简历"，它可能会接一句"帮我写个求职信"，因为它学的只是"什么话后面接什么话更合理"，而不是"你希望我做什么"。'
        },
        {
          type: 'p',
          text: '第二阶段叫"监督微调"（SFT）——人类写一些"这种问法该怎么回答"的范例，让模型学会"问答"这种对话形式。这一阶段结束后，模型终于会"对答如流"了。但它回答的质量还是参差不齐——有时非常啰嗦，有时不礼貌，有时对明显有害的问题也老老实实回答。'
        },
        {
          type: 'hr-quote',
          text: '第三阶段，就是对齐——要让模型<b>不仅会说话，还要说得好</b>。这是 RL 登场的舞台。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: 'RLHF 的核心难点在于——<b>"好的回答"是没有确定公式的</b>。你可以写出评分规则去判断一张图片是不是猫，但"这个回答够不够好"这种事，连人类都说不清楚，只能靠"看着办"。'
        },
        {
          type: 'p',
          text: 'OpenAI 的团队想出了一个极其聪明的办法：<b>让人给两个回答打一个相对的偏好——A 比 B 好，或者反过来</b>。这种比较比"给一个绝对分数"简单多了，对标注员也友好。收集到几万对这样的"A vs B"数据之后，就能训练一个"奖励模型"（Reward Model）——它学的就是"怎么给回答打分，能预测出人类的偏好"。'
        },
        {
          type: 'p',
          text: '有了奖励模型之后，事情就回到了我们熟悉的强化学习套路——<b>把语言模型当作一个"策略"，把奖励模型当作"环境"，用 RL 算法让语言模型生成的回答，在奖励模型下得分越来越高</b>。具体用的 RL 算法，就是我们前面学过的 <b>PPO</b>。'
        },
        {
          type: 'callout',
          tone: 'tip',
          icon: '💡',
          text: '从宏观看，RLHF 就是用人类偏好训练一个打分器，再用 PPO 让模型"讨好"打分器。整件事的精妙之处在于——人类不用写规则，只需要判断两个回答哪个更好。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '但 RLHF 也有它的麻烦。麻烦之一是——它<b>真的很贵</b>。要跑 PPO，你得同时在内存里放着：策略模型、奖励模型、参考模型（防止策略跑偏）、价值模型……四个大模型一起训练，光 GPU 显存就要占到原来的四倍。而且 PPO 的训练过程需要不断采样、打分、更新，每一步都慢得心疼。'
        },
        {
          type: 'p',
          text: '麻烦之二是——它<b>不稳定</b>。奖励模型自己是靠有限数据训出来的，本身就不完美。如果语言模型太努力去"讨好"奖励模型，可能会找到一些"钻空子"的回答方式——技术上分高，但读起来怪怪的。这叫"奖励劫持"（reward hacking）。'
        },
        {
          type: 'p',
          text: '这些问题让学界开始想：<b>能不能不用 RL，直接从偏好数据里学策略？</b>'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '斯坦福 Rafael Rafailov 等人 2023 年提出的 <b>DPO</b>（Direct Preference Optimization）给出了答案。'
        },
        {
          type: 'p',
          text: 'DPO 的洞察非常惊艳——他们通过数学推导证明：<b>"奖励建模 + PPO"这一套，本质上等价于一个简单的分类损失函数</b>。也就是说，你根本不用真的训练一个奖励模型，也不用跑 PPO——直接在偏好数据上最小化一个精心设计的损失，得到的模型就和 RLHF 效果差不多。'
        },
        {
          type: 'p',
          text: '这个损失函数的形式有点像对比学习——对每对 (y_chosen, y_rejected)，我让 chosen 的概率相对参考模型"偏高"，让 rejected 的概率相对"偏低"。就这么简单，没有采样，没有奖励模型，没有 KL 正则——所有复杂性都藏在了那个巧妙的损失函数里。'
        },
        {
          type: 'callout',
          tone: 'note',
          icon: '🎯',
          text: 'DPO 的魔法在于——它把 RLHF 里那个"看起来不可避免的 RL"从流水线里拿掉了，训练变成了单纯的监督学习，显存占用和训练时间都大幅降低。很多开源 LLM（如 Mistral、Qwen 的对齐版）都采用 DPO。'
        },
        {
          type: 'p',
          text: '不过 DPO 也不是银弹——它的前提是"你相信偏好数据能完全刻画好的回答"。当你想引入额外的、非偏好形式的奖励信号时（比如"这道数学题答对了没有"），DPO 就不太合适。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '最后一个主角是 <b>GRPO</b>（Group Relative Policy Optimization），来自 DeepSeek 团队，2024 年被用在 DeepSeek-Math 和 R1 上，效果惊艳。'
        },
        {
          type: 'p',
          text: 'GRPO 的动机是：在数学/代码推理这些任务上，RLHF 那套太重了——既要维护 Critic（value model），又要算 GAE，效率低。GRPO 的做法是——<b>干脆不要 Critic 了</b>。'
        },
        {
          type: 'p',
          text: '那没有 Critic，优势函数从哪儿来？GRPO 的窍门是：对同一个问题，让模型生成 G 个不同的回答（一组），用这 G 个回答的平均奖励当 baseline，每个回答减去组平均就是它的优势。'
        },
        {
          type: 'p',
          text: '这听起来有点像"REINFORCE 加组内归一化"，但它的精神是：<b>不要绝对的 Critic，只要组内的相对比较</b>。这在数学题这种"有确定对错"的任务上格外合适——规则写个自动检查器就能打分，连奖励模型都省了。'
        },
        {
          type: 'p',
          text: 'DeepSeek 的 R1 就是靠 GRPO 训出来的——让模型对每道数学题生成一组解答，用"答案对/错"当奖励，组内相对比较推动策略学习。<b>完全没有用人工标注的偏好数据，也没有监督学习数据</b>——纯 RL 从零开始，靠规则奖励自己涌现出了链式推理能力。这是近年来强化学习最震撼的一次"复兴"。'
        },
        {
          type: 'hr-quote',
          text: 'RLHF 把 RL 带进了 LLM 时代；DPO 让对齐变得轻量；GRPO 让 RL 在推理模型里再次成为主角。'
        },
        { type: 'divider' },
        {
          type: 'p',
          text: '到这里，你已经见证了强化学习从最原始的老虎机一路走到 DeepSeek R1。是不是很奇妙——我们在第一章讨论的那些困境（探索与利用、信用分配、短期长期权衡），到了第十章还在以另一种形式继续存在。'
        },
        {
          type: 'p',
          text: 'RLHF 里的探索，是采样温度；信用分配，是 token-level 优势；长期目标，是"整个回答的好坏"。骨架完全没变，只是穿上了百亿参数的外衣。'
        },
        {
          type: 'p',
          text: '这就是强化学习最迷人的地方——它不是某一类具体技术，而是一种"在不完全信息下从反馈中成长"的思维方式。它既可以让一个机器人学会走路，也可以让一个语言模型学会思考。这种通用性，让它注定还会在未来的 AI 中扮演越来越重要的角色。'
        },
        {
          type: 'p',
          text: '下面的动画里，你可以看到 RLHF / DPO / GRPO 三条不同的训练流水线——它们的结构差异会让你更直观地理解"为什么说 DPO 省了那么多，GRPO 又省在哪里"。也祝贺你——读到这里，你已经走完了这个教程最长的一条路。'
        },
      ]
    },

    deep: {
      readMinutes: 18,
      blocks: [
        { type: 'h2', text: '1. 背景：LLM 的三段式训练', anchor: 'pipeline' },
        {
          type: 'olist',
          items: [
            '<b>Pre-training</b>：自回归语言模型，目标 $\\mathbb{E}[-\\log p_\\theta(x_t \\mid x_{<t})]$。',
            '<b>SFT</b>（Supervised Fine-Tuning）：在"指令-回答"数据上微调，让模型学会对话格式。',
            '<b>Alignment</b>：让模型的输出与人类偏好对齐——RLHF / DPO / GRPO 等方法所处的阶段。'
          ]
        },

        { type: 'h2', text: '2. RLHF 的三个阶段', anchor: 'rlhf' },
        {
          type: 'olist',
          items: [
            '<b>偏好收集</b>：对同一 prompt 生成多个回答，人类选出更好的，形成 $(x, y_+, y_-)$ 三元组。',
            '<b>奖励建模</b>：训练 $r_\\phi(x, y)$，最小化 Bradley-Terry 对数似然。',
            '<b>RL 微调</b>：用 PPO 等算法最大化 $\\mathbb{E}_{y \\sim \\pi_\\theta}[r_\\phi(x, y)] - \\beta\\,\\mathrm{KL}(\\pi_\\theta \\,\\|\\, \\pi_{\\text{ref}})$。'
          ]
        },

        { type: 'h2', text: '3. Bradley-Terry 偏好模型', anchor: 'bt' },
        {
          type: 'math',
          tex: 'P(y_1 \\succ y_2 \\mid x) = \\sigma\\!\\big(r_\\phi(x, y_1) - r_\\phi(x, y_2)\\big)',
          label: 'Bradley-Terry'
        },
        {
          type: 'math',
          tex: '\\mathcal{L}_{\\text{RM}}(\\phi) = -\\mathbb{E}_{(x, y_+, y_-)}\\!\\left[\\log \\sigma\\!\\big(r_\\phi(x, y_+) - r_\\phi(x, y_-)\\big)\\right]'
        },
        {
          type: 'p',
          text: '$r_\\phi$ 通常由预训练 LLM 去掉 LM 头、加一个标量输出头得到。'
        },

        { type: 'h2', text: '4. RLHF 的目标函数', anchor: 'rlhf-obj' },
        {
          type: 'math',
          tex: '\\max_{\\pi_\\theta} \\;\\mathbb{E}_{x \\sim \\mathcal{D},\\,y \\sim \\pi_\\theta(\\cdot \\mid x)}\\!\\left[r_\\phi(x, y)\\right] - \\beta\\,\\mathrm{KL}\\!\\big(\\pi_\\theta(\\cdot \\mid x) \\,\\|\\, \\pi_{\\text{ref}}(\\cdot \\mid x)\\big)',
          label: 'KL-正则奖励最大化'
        },
        {
          type: 'p',
          text: 'KL 项把策略约束在参考模型附近，防止过度偏离与奖励劫持。$\\beta \\approx 0.01 \\sim 0.1$。'
        },

        { type: 'h2', text: '5. PPO 在 RLHF 中的具体化', anchor: 'ppo-rlhf' },
        {
          type: 'p',
          text: 'Token-level 优势估计，把整个回答 $y = (y_1, \\ldots, y_T)$ 视为序贯决策：'
        },
        {
          type: 'math',
          tex: 'r_t = -\\beta\\,\\log\\dfrac{\\pi_\\theta(y_t \\mid x, y_{<t})}{\\pi_{\\text{ref}}(y_t \\mid x, y_{<t})} \\quad (t < T),\\qquad r_T = r_\\phi(x, y) - \\beta\\,\\log\\dfrac{\\pi_\\theta(y_T \\mid x, y_{<T})}{\\pi_{\\text{ref}}(y_T \\mid x, y_{<T})}',
          label: 'token-level 奖励'
        },
        {
          type: 'p',
          text: '即把 KL 作为 per-token 惩罚，外部奖励只在句末给。然后用 GAE + PPO-Clip 正常优化。'
        },

        { type: 'h2', text: '6. RLHF 的工程复杂度', anchor: 'rlhf-cost' },
        {
          type: 'list',
          items: [
            '需要同时驻留 <b>4 个模型</b>：策略 $\\pi_\\theta$、参考 $\\pi_{\\text{ref}}$、奖励 $r_\\phi$、Critic $V_w$。',
            '显存开销约为 SFT 的 3~4 倍。',
            '对偏好数据质量高度敏感；奖励模型过拟合会放大 reward hacking。',
            '训练不稳定，对学习率、KL 系数、采样温度调参敏感。'
          ]
        },

        { type: 'h2', text: '7. DPO：直接偏好优化', anchor: 'dpo' },
        {
          type: 'p',
          text: 'Rafailov et al. (2023) 证明：最优策略 $\\pi^*$ 对应的奖励可以从 $\\pi^*$ 与 $\\pi_{\\text{ref}}$ 的比值直接推出：'
        },
        {
          type: 'math',
          tex: 'r^*(x, y) = \\beta\\,\\log\\frac{\\pi^*(y \\mid x)}{\\pi_{\\text{ref}}(y \\mid x)} + Z(x)',
          label: '奖励与策略的对偶关系'
        },
        {
          type: 'p',
          text: '代入 Bradley-Terry，$Z(x)$ 消掉，得到 DPO 损失：'
        },
        {
          type: 'math',
          tex: '\\mathcal{L}_{\\text{DPO}}(\\theta) = -\\mathbb{E}\\!\\left[\\,\\log\\sigma\\!\\left(\\beta\\log\\frac{\\pi_\\theta(y_+ \\mid x)}{\\pi_{\\text{ref}}(y_+ \\mid x)} - \\beta\\log\\frac{\\pi_\\theta(y_- \\mid x)}{\\pi_{\\text{ref}}(y_- \\mid x)}\\right)\\right]',
          label: 'DPO 损失'
        },
        {
          type: 'p',
          text: '它完全是一个分类损失，<b>不需要显式奖励模型、不需要采样、不需要 Critic</b>。训练像 SFT 一样轻量。'
        },

        { type: 'h2', text: '8. DPO 的优劣', anchor: 'dpo-pros-cons' },
        {
          type: 'table',
          headers: ['维度', 'RLHF (PPO)', 'DPO'],
          rows: [
            ['显存', '~4× SFT', '~2× SFT'],
            ['需要奖励模型', '是', '否'],
            ['训练稳定性', '较低', '较高'],
            ['奖励劫持', '易发生', '少（无显式 RM）'],
            ['灵活性', '可接入任意奖励源', '仅限偏好数据'],
            ['在线 vs 离线', 'on-policy 采样', '纯离线']
          ]
        },
        {
          type: 'callout',
          tone: 'warn',
          text: '<b>DPO 的局限</b>：对分布外 prompt 的泛化不如 PPO；"preference hacking"现象存在（模型过度拉开 chosen 与 rejected 的概率差，导致整体分布扭曲）；无法利用非成对的奖励信号（如自动验证器、人工规则）。'
        },

        { type: 'h2', text: '9. GRPO：省掉 Critic 的 PPO 变体', anchor: 'grpo' },
        {
          type: 'p',
          text: 'GRPO（Shao et al., DeepSeek-Math 2024）在保留 PPO-Clip 框架的同时，用<b>组内相对优势</b>替代 Critic 估计的优势：'
        },
        {
          type: 'olist',
          items: [
            '对同一 prompt $x$，采样一组 $G$ 个回答 $\\{y_i\\}_{i=1}^G$；',
            '用任意奖励源（RM 或规则）得到 $\\{r_i\\}$；',
            '组内 z-score 归一化：$\\hat{A}_i = \\dfrac{r_i - \\bar{r}}{\\mathrm{std}(r)}$；',
            '用 PPO-Clip 损失 + KL-to-ref 正则，反向更新策略。'
          ]
        },
        {
          type: 'math',
          tex: '\\mathcal{L}_{\\text{GRPO}} = -\\mathbb{E}\\!\\left[\\frac{1}{G}\\sum_{i=1}^G \\min\\!\\big(\\rho_i \\hat{A}_i,\\,\\mathrm{clip}(\\rho_i, 1\\pm\\epsilon)\\hat{A}_i\\big)\\right] + \\beta\\,\\mathrm{KL}(\\pi_\\theta \\,\\|\\, \\pi_{\\text{ref}})',
          label: 'GRPO 损失'
        },
        {
          type: 'p',
          text: '省掉 Critic 直接降低 40%~50% 显存；对<b>规则奖励</b>任务（数学/代码：对 = 1，错 = 0）极友好。DeepSeek-R1 演示了用 GRPO + 纯规则奖励让模型<b>自发涌现长链思维推理</b>。'
        },

        { type: 'h2', text: '10. 三法同台对比', anchor: 'compare' },
        {
          type: 'table',
          headers: ['维度', 'RLHF (PPO)', 'DPO', 'GRPO'],
          rows: [
            ['是否需要 RM', '是', '否', '是（或规则）'],
            ['是否需要 Critic', '是', '否', '否'],
            ['是否需要采样', '是', '否', '是（group 采样）'],
            ['显存开销', '~4× SFT', '~2× SFT', '~3× SFT'],
            ['最适合场景', '通用对齐', '偏好数据充裕的轻量对齐', '规则可验证的推理任务'],
            ['代表产品', 'ChatGPT / Claude', 'Mistral / Qwen 对齐版', 'DeepSeek-Math / R1']
          ]
        },

        { type: 'h2', text: '11. 奖励劫持与对齐税', anchor: 'hacking' },
        {
          type: 'list',
          items: [
            '<b>Reward hacking</b>：策略找到 RM 的漏洞，输出虽然得分高但质量差的回答。',
            '<b>Alignment tax</b>：对齐阶段可能损失部分基础能力（如数学、代码）。',
            '<b>KL 约束</b>是一道防线，但 KL 系数本身就是一个 bias-reward trade-off 的旋钮。',
            '<b>PPO clip + KL + entropy</b> 的"三件套"本质上都在试图稳定一个本就高噪声的优化过程。'
          ]
        },

        { type: 'h2', text: '12. 前沿进展', anchor: 'frontiers' },
        {
          type: 'list',
          items: [
            '<b>Constitutional AI</b>（Anthropic, 2022）：用 AI 替代人类标注偏好。',
            '<b>RLAIF</b>：用更强 LLM 给 RM 提供偏好，减少人工成本。',
            '<b>IPO / KTO / SimPO</b>：DPO 家族的各种改进，针对 preference hacking、长度偏置等。',
            '<b>Online DPO</b>：混合 on-policy 采样与偏好学习。',
            '<b>Process Reward Model</b>：对推理过程的每一步打分，而不只是最终答案。'
          ]
        },

        { type: 'h2', text: '13. 延伸阅读', anchor: 'refs' },
        {
          type: 'references',
          items: [
            { title: 'Christiano et al. "Deep RL from Human Preferences" (NeurIPS 2017)', url: 'https://arxiv.org/abs/1706.03741' },
            { title: 'Ouyang et al. "Training Language Models to Follow Instructions with Human Feedback" (InstructGPT, 2022)', url: 'https://arxiv.org/abs/2203.02155' },
            { title: 'Rafailov et al. "Direct Preference Optimization" (NeurIPS 2023)', url: 'https://arxiv.org/abs/2305.18290' },
            { title: 'Shao et al. "DeepSeekMath: Pushing the Limits of Mathematical Reasoning" (GRPO, 2024)', url: 'https://arxiv.org/abs/2402.03300' },
            { title: 'DeepSeek-AI, "DeepSeek-R1: Incentivizing Reasoning Capability via RL" (2025)', url: 'https://arxiv.org/abs/2501.12948' },
            { title: 'Bai et al. "Constitutional AI" (Anthropic, 2022)', url: 'https://arxiv.org/abs/2212.08073' }
          ]
        }
      ]
    }
  },

};