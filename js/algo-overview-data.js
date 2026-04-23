// 算法全景卡数据：伪代码 + 自动驾驶类比 + 流程图
// 每个算法对应一个 key，值包含 carStory / mapping / pseudocode / flow

export const OVERVIEW_DATA = {

  // ===== 初探强化学习 =====
  intro: {
    carStory: `想象你刚拿到驾照，坐进一辆车。你就是<b>智能体（Agent）</b>，道路和交通就是<b>环境（Environment）</b>。
      你每做一个决定（踩油门、刹车、转弯）就是一个<b>动作</b>，GPS 显示的位置就是<b>状态</b>，
      安全到达目的地得到表扬就是<b>正奖励</b>，违章扣分就是<b>负奖励</b>。
      强化学习的目标：让你这个新手司机通过不断试错，最终变成老司机。`,
    mapping: [
      { label: '智能体', value: '你（司机）' },
      { label: '环境', value: '道路+交通' },
      { label: '状态', value: 'GPS 位置+车速' },
      { label: '动作', value: '油门/刹车/转弯' },
      { label: '奖励', value: '安全到达+1 / 违章-1' },
      { label: '策略', value: '你的驾驶习惯' },
    ],
    pseudocode: [
      { code: '<span class="kw">while</span> 还在开车 <span class="kw">do</span>', comment: '每一秒都在做决策' },
      { code: '  观察当前状态 s', comment: '看路况、看仪表盘' },
      { code: '  根据策略 π 选择动作 a', comment: '决定踩油门还是刹车' },
      { code: '  执行 a → 得到奖励 r, 新状态 s\'', comment: '车动了，GPS 更新了' },
      { code: '  用 (s, a, r, s\') 更新策略 π', comment: '从这次经验中学习' },
      { code: '  s ← s\'', comment: '进入下一秒' },
      { code: '<span class="kw">end while</span>', comment: '到达目的地，一趟结束' },
    ],
    flow: [
      { icon: '👀', label: '观察状态' },
      { icon: '🧠', label: '策略决策' },
      { icon: '🎬', label: '执行动作' },
      { icon: '🏆', label: '获得奖励' },
      { icon: '📝', label: '更新策略' },
    ],
    flowLoop: '↩ 回到观察状态，循环往复',
  },

  // ===== 多臂老虎机 =====
  bandit: {
    carStory: `想象你走进一家赌场，面前有 <b>K 台老虎机</b>，每台的中奖概率不同且未知。
      每次你只能拉一台，拉完才知道这一下有没有中奖——<b>结果是随机的</b>，同一台机器也可能一次中一次不中。
      你的目标：在 1000 次拉杆内赢尽量多的钱。关键抉择就是 <b>探索（试新机器）</b> vs <b>利用（拉当前最赚的那台）</b>。
      这就是多臂老虎机问题——没有状态变化，只有"选哪台"和"随机奖励"。`,
    mapping: [
      { label: '动作 a', value: '选哪台老虎机（K 选 1）' },
      { label: '奖励 r', value: '这次拉杆中了多少钱（随机）' },
      { label: 'Q̂(a)', value: '每台机器期望收益的估计' },
      { label: 'ε-贪心', value: '90%拉最赚的那台，10%随机试别的' },
      { label: 'UCB', value: '给试得少的机器加"不确定性奖金"' },
      { label: 'Thompson', value: '为每台维护 Beta 分布，采样后取最大' },
    ],
    pseudocode: [
      { code: '<span class="kw">Initialize</span> Q̂(a) ← <span class="num">0</span>, N(a) ← <span class="num">0</span>  ∀a', comment: '每台机器先打个问号' },
      { code: '<span class="kw">for</span> t = <span class="num">1</span> <span class="kw">to</span> T <span class="kw">do</span>', comment: '总共拉 T 次杆' },
      { code: '  <span class="kw">if</span> random() < ε:', comment: '以 ε 概率探索' },
      { code: '    a ← <span class="fn">random_choice</span>(所有机器)', comment: '随机挑一台试试' },
      { code: '  <span class="kw">else</span>:', comment: '以 1-ε 概率利用' },
      { code: '    a ← <span class="fn">argmax</span><sub>a</sub> Q̂(a)', comment: '拉目前估计最赚的那台' },
      { code: '  r ← <span class="fn">pull</span>(a)', comment: '拉下杠杆，随机得到奖励' },
      { code: '  N(a) ← N(a) + <span class="num">1</span>', comment: '记录这台被拉了几次' },
      { code: '  Q̂(a) ← Q̂(a) + <span class="num">1</span>/N(a) · (r − Q̂(a))', comment: '增量平均更新期望估计' },
      { code: '<span class="kw">end for</span>', comment: 'T 次后你大致摸清了哪台最赚' },
    ],
    flow: [
      { icon: '🎲', label: 'ε-贪心选台' },
      { icon: '🎰', label: '拉下杠杆' },
      { icon: '💰', label: '随机奖励' },
      { icon: '📊', label: '更新估计' },
    ],
    flowLoop: '↩ 下一轮继续选台',
  },

  // ===== MDP =====
  mdp: {
    carStory: `开车时，<b>路况、周围车辆位置、红绿灯状态</b>这些合起来构成当前的<b>状态</b>；
      而左转、右转、直行、加速减速就是你能做的<b>动作</b>。每次行动后会得到<b>奖励</b>：
      顺利通过路口 +10、更接近目的地 +20、剐蹭 −100。
      执行动作后，环境会<b>转移</b>到新状态（到下一个路口、周围车也变位置了）。MDP 就是把这一切写成数学五元组 &lt;S, A, P, R, γ&gt;。`,
    carStoryExtra: `<b>🔍 更深入理解：</b><br/>
      状态 <b>不是一个数字</b>，而是多维向量：（GPS坐标、速度、前车距离、红绿灯倒计时…）共同描述"此刻的世界"。
      动作带有<b>随机性</b>：你打算左转，但前车没让、路人窜出来，实际可能被迫直行——这就是转移概率 P(s'|s,a) 的意义。
      奖励设计要<b>分层</b>：终点大奖 +100 是长期目标、每步 −1 逼效率、剐蹭 −100 明确红线。折扣 γ=0.9 则表示"今天 1 分钟 ≈ 明天 0.9 分钟"，让智能体愿意短期吃点亏换长期大收益。`,
    mapping: [
      { label: '状态 S', value: '当前路口 GPS 坐标' },
      { label: '动作 A', value: '{直行, 左转, 右转, 掉头}' },
      { label: '转移 P', value: '路况决定：想左转但可能被堵' },
      { label: '奖励 R', value: '每走一步 -1分钟，到公司 +100' },
      { label: '折扣 γ', value: '越早到越好（未来奖励打折）' },
    ],
    pseudocode: [
      { section: '— MDP 五元组定义 —' },
      { code: 'S = {所有路口}', comment: '状态空间：城市里每个路口' },
      { code: 'A = {直行, 左转, 右转, 掉头}', comment: '动作空间：每个路口的选择' },
      { code: 'P(s\'|s,a) = 转移概率', comment: '选了左转，80%成功，20%被迫直行' },
      { code: 'R(s,a,s\') = 即时奖励', comment: '每步-1，到公司+100，撞车-50' },
      { code: 'γ ∈ [<span class="num">0</span>, <span class="num">1</span>]', comment: '折扣因子：0.9 表示明天的1块≈今天的0.9块' },
      { section: '— 贝尔曼方程（价值函数的递推关系）—' },
      { code: 'V<sup>π</sup>(s) = Σ<sub>a</sub> π(a|s) Σ<sub>s\'</sub> P(s\'|s,a)[R + γ·V<sup>π</sup>(s\')]', comment: '"当前路口的价值 = 即时奖励 + 折扣×下个路口的价值"' },
    ],
    flow: [
      { icon: '📍', label: '当前路口(状态)' },
      { icon: '🧠', label: '策略选动作' },
      { icon: '🎲', label: '环境转移' },
      { icon: '💰', label: '获得奖励' },
      { icon: '📍', label: '新路口(新状态)' },
    ],
    flowLoop: '↩ 在新路口继续决策，直到到达目的地',
  },

  // ===== 动态规划 =====
  dp: {
    carStory: `假设我们有一张<b>详细的离线地图</b>，知道所有路口的连接关系、距离、堵车概率——全部已知。
      动态规划就可以<b>从终点倒推</b>，为每个路口计算出到达终点的最优价值，从而规划出全局最优的路线。
      就像高德地图的离线规划：坐在家里就能算出每个路口应该怎么走。
      <b>⚠️ 局限：</b>一旦实际路况和地图不符（临时封路、突发事故），规划就会失效。`,
    carStoryExtra: `<b>🔍 更深入理解：</b><br/>
      DP 的核心是<b>贝尔曼方程</b>：V(s) = R + γ·V(s')，也就是"当前路口价值 = 即时奖励 + 折扣×下个路口价值"。
      <b>策略迭代</b>分两步反复：① 固定当前规划，算出每个路口价值（评估）② 在每个路口贪心选最优方向（改进）。
      <b>价值迭代</b>则把两步合成一步：V(s) ← max<sub>a</sub> Σ P·[R + γV(s')]，用 max 同时完成评估和改进。
      DP 属于 <b>model-based</b> 方法——必须提前知道完整环境模型（P 和 R），所以才衬托出后面 TD、MC 这些 model-free 方法的价值：不需要地图，也能通过实际开车学出来。`,
    mapping: [
      { label: '已知模型', value: '完整城市地图（P和R全知道）' },
      { label: '策略评估', value: '算出当前路线规划下每个路口的"价值"' },
      { label: '策略改进', value: '在每个路口贪心选最优方向' },
      { label: '收敛', value: '反复评估+改进，直到路线不再变化' },
    ],
    pseudocode: [
      { section: '— 策略迭代 —' },
      { code: '<span class="kw">Initialize</span> π(s) ← 随机策略, V(s) ← <span class="num">0</span>', comment: '先随便规划一条路线' },
      { code: '<span class="kw">repeat</span>', comment: '反复"评估→改进"' },
      { code: '  <span class="comment">// 策略评估：算当前路线下每个路口的价值</span>', comment: '' },
      { code: '  <span class="kw">repeat</span>', comment: '' },
      { code: '    <span class="kw">for each</span> s ∈ S:', comment: '遍历每个路口' },
      { code: '      V(s) ← Σ<sub>s\'</sub> P(s\'|s,π(s))[R + γ·V(s\')]', comment: '用贝尔曼方程更新价值' },
      { code: '  <span class="kw">until</span> V 收敛', comment: '直到价值不再变化' },
      { code: '  <span class="comment">// 策略改进：在每个路口贪心选最优</span>', comment: '' },
      { code: '  <span class="kw">for each</span> s ∈ S:', comment: '' },
      { code: '    π(s) ← <span class="fn">argmax</span><sub>a</sub> Σ<sub>s\'</sub> P(s\'|s,a)[R + γ·V(s\')]', comment: '选让"即时奖励+未来价值"最大的方向' },
      { code: '<span class="kw">until</span> π 不再变化', comment: '路线规划稳定了，就是最优路线' },
    ],
    flow: [
      { icon: '🗺️', label: '初始化策略' },
      { icon: '📊', label: '策略评估' },
      { icon: '⬆️', label: '策略改进' },
      { icon: '✅', label: '收敛？' },
    ],
    flowLoop: '↩ 未收敛则继续"评估→改进"循环',
  },

  // ===== 时序差分 =====
  td: {
    carStory: `现在你<b>没有地图</b>了，只能亲自上路边开边学。SARSA 和 Q-Learning 是两种学法：
      <b>👧 SARSA（保守派）</b>：根据自己实际要走的下一步来评价当前动作——<b>保守自动驾驶</b>不轻易超车。
      <b>🦸 Q-Learning（激进派）</b>：根据理论上的最优下一步来评价当前动作——<b>激进自动驾驶</b>敢于探索超车。
      两者都用"预期 vs 现实"的差距（TD 误差）一步步修正判断。`,
    carStoryExtra: `<b>🔍 更深入理解：</b><br/>
      <b>SARSA 的五元组</b>（名字就是它的过程）：状态 s → 动作 a → 奖励 r → 新状态 s' → <b>新动作 a'</b>。
      它必须先确定了"下一步真要执行 a'"才能更新，用的是 Q(s', a') 来评价 Q(s, a)——所以叫 <b>on-policy</b>（学自己真正走的路）。
      好比司机转完方向盘看到新路况，还必须想好下一步要直行，才根据"左转后能直行且安全"来评价刚才这一转。<br/><br/>
      <b>Q-Learning 的四元组</b>：状态 s → 动作 a → 奖励 r → 新状态 s'，不管新动作是啥。
      它直接取 max<sub>a'</sub> Q(s', a')，即"新状态下理论最优动作的价值"——所以叫 <b>off-policy</b>（学假想中的最优路）。
      好比司机哪怕没走过某条窄路，只要计算出理论收益高，就愿意打高分去尝试。<br/><br/>
      <b>💡 自动驾驶模式类比：</b>SARSA ≈ 保守派自动驾驶（考虑变道后前车不让的真实风险，优先保证安全）；
      Q-Learning ≈ 激进派自动驾驶（只看超车成功的高收益，理论上能赢就上）。`,
    mapping: [
      { label: 'TD 误差 δ', value: '实际花的时间 vs 你的预估差距' },
      { label: 'SARSA', value: '你妈开车：保守，远离事故多发路段' },
      { label: 'Q-Learning', value: '老司机开车：敢走最快但有风险的路' },
      { label: 'on-policy', value: 'SARSA：按自己实际走的路来学' },
      { label: 'off-policy', value: 'Q-Learning：假装自己总能走最优路来学' },
    ],
    pseudocode: [
      { section: '— Q-Learning（off-policy）—' },
      { code: '<span class="kw">Initialize</span> Q(s,a) ← <span class="num">0</span>  ∀s,a', comment: '每个"路口×方向"先打问号' },
      { code: '<span class="kw">for</span> episode = <span class="num">1</span> <span class="kw">to</span> N <span class="kw">do</span>', comment: '每天通勤算一个 episode' },
      { code: '  s ← 起点（家门口）', comment: 'reset 环境' },
      { code: '  <span class="kw">while</span> s ≠ 终点 <span class="kw">do</span>', comment: '还没到公司就继续开' },
      { code: '    a ← <span class="fn">ε-greedy</span>(Q, s)', comment: '90%走老路，10%试新路' },
      { code: '    执行 a → 观察 r, s\'', comment: '开过去，记录花了多久' },
      { code: '    δ ← r + γ·<span class="fn">max</span><sub>a\'</sub> Q(s\',a\') − Q(s,a)', comment: 'TD误差：预期和现实差多少' },
      { code: '    Q(s,a) ← Q(s,a) + α·δ', comment: '按差距小步修正估计' },
      { code: '    s ← s\'', comment: '开到下一个路口' },
      { code: '  <span class="kw">end while</span>', comment: '到公司了，一趟结束' },
      { code: '<span class="kw">end for</span>', comment: '100天后你已经是老司机了' },
    ],
    flow: [
      { icon: '📍', label: '当前路口' },
      { icon: '🎲', label: 'ε-greedy选路' },
      { icon: '🚗', label: '开过去' },
      { icon: '⚡', label: '算TD误差' },
      { icon: '📝', label: '更新Q值' },
    ],
    flowLoop: '↩ 到新路口继续，直到到达目的地',
  },

  // ===== DQN =====
  dqn: {
    carStory: `当自动驾驶看到的是<b>前视摄像头的高清画面</b>时，像素组合多到无法想象，传统 Q 表彻底失效。
      DQN 的做法：用<b>深度神经网络近似 Q 函数</b>——输入摄像头画面等原始状态，输出每个动作的 Q 值。
      为了训练稳定，DQN 还配了两件法宝：<b>行车记录仪随机回放</b>过去片段（经验回放），
      以及一个<b>慢半拍的副驾</b>提供稳定学习目标（目标网络）。`,
    carStoryExtra: `<b>🔍 更深入理解：</b><br/>
      <b>为什么需要神经网络？</b>摄像头画面的像素组合是天文数字，你不可能给每一张画面都记一个 Q 值。
      神经网络的作用是"<b>泛化</b>"——看到类似路况就能推断出相近的 Q 值，哪怕这一帧从没见过。<br/><br/>
      <b>💾 经验回放（记忆宫殿）：</b>如果只用最近开车的片段训练，神经网络会"只记得最近"。
      DQN 的做法是建一个巨大的行车记录仪库（通常存 100 万帧），每次随机抽 32 帧混合训练——
      打破数据相关性，还能反复利用难得的好/坏样例。<br/><br/>
      <b>👯 目标网络（冷静双胞胎）：</b>DQN 在训练时，目标值 y = r + γ·max Q(s') 和自己正在训练的 Q 网络是同一个，
      这会导致"<b>自己追自己的影子</b>"——目标值一直在动，训练极不稳定。
      解决办法：复制一个"慢半拍"的副本（目标网络），每 C 步才同步一次。主网络追一个暂时不动的靶子，稳定性大增。`,
    mapping: [
      { label: '状态 s', value: '前视摄像头画面（像素矩阵）' },
      { label: 'Q 网络', value: '输入画面 → 输出每个方向的分数' },
      { label: '经验回放', value: '行车记录仪：存下过去的驾驶片段，随机回放学习' },
      { label: '目标网络', value: '一个"慢半拍"的副本，提供稳定的学习目标' },
    ],
    pseudocode: [
      { code: '<span class="kw">Initialize</span> Q网络 θ, 目标网络 θ⁻ ← θ', comment: '主网络和它的"冷静双胞胎"' },
      { code: '<span class="kw">Initialize</span> 经验池 D ← ∅', comment: '空的行车记录仪' },
      { code: '<span class="kw">for</span> step = <span class="num">1</span> <span class="kw">to</span> T <span class="kw">do</span>', comment: '每一帧画面都要决策' },
      { code: '  s ← 当前摄像头画面', comment: '看路' },
      { code: '  a ← <span class="fn">ε-greedy</span>(Q(s;θ))', comment: '神经网络打分，偶尔随机探索' },
      { code: '  执行 a → r, s\'', comment: '方向盘转过去，看结果' },
      { code: '  D.<span class="fn">push</span>(s, a, r, s\')', comment: '存入行车记录仪' },
      { code: '  batch ← D.<span class="fn">sample</span>(<span class="num">32</span>)', comment: '随机抽 32 段历史片段' },
      { code: '  y ← r + γ·<span class="fn">max</span><sub>a\'</sub> Q(s\';θ⁻)', comment: '用"冷静双胞胎"算目标值' },
      { code: '  <span class="fn">SGD</span>: 最小化 (y − Q(s,a;θ))²', comment: '让主网络的预测靠近目标' },
      { code: '  <span class="kw">if</span> step % C == <span class="num">0</span>: θ⁻ ← θ', comment: '每 C 步把主网络复制给双胞胎' },
      { code: '<span class="kw">end for</span>', comment: '' },
    ],
    flow: [
      { icon: '📷', label: '看摄像头' },
      { icon: '🧠', label: 'Q网络打分' },
      { icon: '🚗', label: '执行动作' },
      { icon: '💾', label: '存入经验池' },
      { icon: '🎲', label: '随机采样' },
      { icon: '📉', label: '梯度更新' },
    ],
    flowLoop: '↩ 每 C 步同步目标网络，继续下一帧',
  },

  // ===== REINFORCE =====
  reinforce: {
    carStory: `REINFORCE 采用<b>回合更新</b>：自动驾驶汽车从起点到终点算一个完整回合。
      跑完后系统回顾整个过程——如果这趟顺利准点到达、没超速没急刹，就给这一路的<b>所有动作策略都加分</b>，
      让它们未来更容易被选中；反之如果发生剐蹭、绕远路，就把这些动作的概率<b>统统降下去</b>。
      一句话：<b>"跑完一整趟，再回头算总账"</b>。`,
    carStoryExtra: `<b>🔍 更深入理解：</b><br/>
      REINFORCE 和前面的 DQN/Q-Learning 完全不同——它<b>不记 Q 值</b>，而是直接优化策略 π(a|s) 本身（每个状态下选各动作的概率）。<br/><br/>
      <b>三步走：</b>① 用当前策略跑一整条轨迹 τ；② 算每一步的累积回报 G_t（从此刻到终点的总奖励）；
      ③ 用梯度上升更新：∇log π(a|s) · G_t ——好路线对应的动作概率↑，差路线对应的动作概率↓。<br/><br/>
      <b>💡 为什么要加 baseline？</b>直接用 G_t 会导致<b>方差巨大</b>：同样是开得不错的一趟，如果总奖励是 +100 或 +500，更新幅度天差地别，训练剧烈抖动。
      解决办法是减去一个基线 b（通常是平均回报或 V(s)），变成 (G_t − b)。数学上这不改变梯度期望，但<b>方差大幅降低</b>，训练稳得多。<br/><br/>
      <b>⚠️ 主要缺点：</b>必须跑完整趟才能学一次，样本效率极低——这就是下一个算法 Actor-Critic 要解决的问题。`,
    mapping: [
      { label: '策略 π(a|s)', value: '每个路口选各方向的概率' },
      { label: '轨迹 τ', value: '一整趟通勤的完整路线' },
      { label: '回报 G_t', value: '从第 t 个路口到公司的总时间' },
      { label: '梯度更新', value: '好路线的选择概率↑，差路线↓' },
    ],
    pseudocode: [
      { code: '<span class="kw">Initialize</span> 策略网络 π(a|s;θ)', comment: '随机初始化驾驶习惯' },
      { code: '<span class="kw">for</span> episode = <span class="num">1</span> <span class="kw">to</span> N <span class="kw">do</span>', comment: '每天通勤一次' },
      { code: '  τ ← <span class="fn">采样轨迹</span>(π)', comment: '按当前习惯跑完一整趟' },
      { code: '  <span class="kw">for</span> t = <span class="num">0</span> <span class="kw">to</span> T <span class="kw">do</span>', comment: '复盘每个路口' },
      { code: '    G_t ← Σ<sub>k=t</sub><sup>T</sup> γ<sup>k-t</sup> r_k', comment: '算从这个路口到公司的总花费' },
      { code: '  <span class="kw">end for</span>', comment: '' },
      { code: '  θ ← θ + α · Σ<sub>t</sub> ∇<span class="fn">log</span> π(a_t|s_t;θ) · (G_t − b)', comment: '好路线概率↑，差路线概率↓' },
      { code: '<span class="kw">end for</span>', comment: 'b 是 baseline，减去它能降低方差' },
    ],
    flow: [
      { icon: '🚗', label: '跑完整趟' },
      { icon: '📹', label: '回放录像' },
      { icon: '📊', label: '算每步回报' },
      { icon: '📐', label: '算策略梯度' },
      { icon: '⬆️', label: '更新策略' },
    ],
    flowLoop: '↩ 用新策略再跑一趟',
  },

  // ===== Actor-Critic =====
  ac: {
    carStory: `REINFORCE 要跑完整趟才能学，太慢了。Actor-Critic 给自动驾驶配了一个<b>实时评分员（Critic）</b>：
      <b>🎭 Actor</b>负责实际操控（加速到 60、保持车道），学习一个好策略来选动作；
      <b>🎬 Critic</b>坐在副驾，<b>每一步都用 TD 误差立即打分</b>——"这个超车选得比预期好 3 分！"
      Actor 根据实时反馈立刻调整，<b>每走一步就学一步</b>，不用等整趟结束再复盘。`,
    carStoryExtra: `<b>🔍 更深入理解：</b><br/>
      <b>Critic 到底怎么打分？</b>它维护一个价值网络 V(s)，预估"在当前状态下往后能拿多少奖励"。
      每走一步后，Critic 把<b>预估价值 vs 实际结果</b>作比较：δ = r + γ·V(s') − V(s)。
      δ > 0 → Actor 这步选得比预期好，加强这个动作；δ < 0 → 选差了，削弱这个动作。<br/><br/>
      <b>双网络协作更新：</b>
      Critic 自我校准（让打分越来越准）：w ← w + α<sub>c</sub>·δ·∇V；
      Actor 根据打分调策略：θ ← θ + α<sub>a</sub>·δ·∇log π。<br/><br/>
      <b>💡 vs REINFORCE 的关键区别：</b>
      REINFORCE 用<b>整条轨迹的真实总回报 G_t</b>来评价动作（准但方差大、要等完整回合）；
      AC 用 <b>Critic 的即时 TD 误差 δ</b> 来评价动作（有偏但方差小、可以每步学）。
      本质是用"一个会学习的评分员"取代"等到终点才揭晓的答案"。`,
    mapping: [
      { label: 'Actor（你）', value: '策略网络 π(a|s;θ)，决定方向盘' },
      { label: 'Critic（教练）', value: '价值网络 V(s;w)，给路口打分' },
      { label: 'TD 误差 δ', value: '教练说"比预期好/差多少"' },
      { label: '优势', value: 'δ > 0 → 这步选得好；δ < 0 → 选差了' },
    ],
    pseudocode: [
      { code: '<span class="kw">Initialize</span> Actor π(a|s;θ), Critic V(s;w)', comment: '新手司机 + 新教练' },
      { code: '<span class="kw">for each</span> step <span class="kw">do</span>', comment: '每个路口都学习' },
      { code: '  a ← π(·|s;θ)', comment: 'Actor 选方向' },
      { code: '  执行 a → r, s\'', comment: '开过去' },
      { code: '  δ ← r + γ·V(s\';w) − V(s;w)', comment: 'Critic 算 TD 误差：比预期好还是差？' },
      { code: '  w ← w + α<sub>c</sub>·δ·∇V(s;w)', comment: '教练自我校准（更新 Critic）' },
      { code: '  θ ← θ + α<sub>a</sub>·δ·∇<span class="fn">log</span> π(a|s;θ)', comment: 'Actor 根据教练反馈调整（δ>0则加强）' },
      { code: '  s ← s\'', comment: '开到下一个路口' },
      { code: '<span class="kw">end for</span>', comment: '' },
    ],
    flow: [
      { icon: '🎭', label: 'Actor选动作' },
      { icon: '🚗', label: '执行' },
      { icon: '⚡', label: 'Critic算TD误差' },
      { icon: '📝', label: '更新Critic' },
      { icon: '⬆️', label: '更新Actor' },
    ],
    flowLoop: '↩ 每个路口都即时学习，不用等到终点',
  },

  // ===== TRPO =====
  trpo: {
    carStory: `把旧策略想象成自动驾驶已经熟练的驾驶习惯（比如弯道减速到 80 km/h）。
      TRPO 像一个严格的教练：新策略尝试的动作，必须和旧习惯<b>偏离不能太大</b>——
      最多减速到 75 或加速到 85，但<b>不允许突然跳到减速 50 这种剧变</b>。
      这种"<b>信赖域</b>"约束保证每次策略更新都平稳提升，不会因为尝试过激导致车辆失控。`,
    carStoryExtra: `<b>🔍 更深入理解：</b><br/>
      <b>为什么需要 TRPO？</b>普通策略梯度（REINFORCE、AC）的最大痛点是<b>学习率难调</b>——步子小了学得慢，步子大了一次崩盘。
      TRPO 不再用一个固定学习率控制步长，而是用<b>新旧策略分布的 KL 散度</b>限制差异：𝔼[KL(π<sub>old</sub> ‖ π<sub>θ</sub>)] ≤ δ。<br/><br/>
      <b>几何直觉：</b>在策略参数空间里，围绕旧策略画一个<b>半径为 δ 的安全圈</b>（不是欧氏距离的圆，而是 KL 距离的圆）。
      TRPO 在这个圆内寻找能让目标函数最大化的新策略。δ 越小步子越稳但越慢，δ 越大步子越大但可能翻车。<br/><br/>
      <b>数学表述：</b>
      max<sub>θ</sub> 𝔼[ (π<sub>θ</sub>(a|s)/π<sub>old</sub>(a|s)) · A(s,a) ]，s.t. 𝔼[KL] ≤ δ。
      实际求解用<b>共轭梯度法</b>近似自然梯度，避开了直接求 Fisher 信息矩阵逆的高昂计算。<br/><br/>
      <b>⚠️ 代价：</b>实现复杂、计算成本高（每次要做二阶优化+线搜索）——这就为后面"用一行 clip 代替所有约束"的 PPO 铺好了路。`,
    mapping: [
      { label: 'KL 散度', value: '新旧驾驶习惯的差异程度' },
      { label: '信赖域 δ', value: '方向盘最大调整幅度' },
      { label: '共轭梯度', value: '在安全圈内高效搜索最优方向' },
      { label: '稳定性', value: '保证每次更新后不会比之前更差' },
    ],
    pseudocode: [
      { code: '<span class="kw">Initialize</span> 策略 π(a|s;θ)', comment: '初始驾驶习惯' },
      { code: '<span class="kw">for</span> iteration = <span class="num">1</span> <span class="kw">to</span> N <span class="kw">do</span>', comment: '' },
      { code: '  用 π<sub>old</sub> 采集一批驾驶数据', comment: '按当前习惯开一批' },
      { code: '  计算优势 A(s,a)', comment: '每步比平均好/差多少' },
      { code: '  <span class="comment">// 在安全圈内找最优更新方向</span>', comment: '' },
      { code: '  <span class="fn">max</span><sub>θ</sub> 𝔼[π<sub>θ</sub>(a|s)/π<sub>old</sub>(a|s) · A(s,a)]', comment: '最大化替代目标函数' },
      { code: '  <span class="kw">s.t.</span> 𝔼[KL(π<sub>old</sub> ‖ π<sub>θ</sub>)] ≤ δ', comment: '约束：新旧习惯差异不超过 δ' },
      { code: '  用<span class="fn">共轭梯度法</span>近似求解', comment: '避免直接算 Hessian 逆（太贵）' },
      { code: '  θ ← θ + Δθ', comment: '在安全圈内迈出一步' },
      { code: '<span class="kw">end for</span>', comment: '' },
    ],
    flow: [
      { icon: '🚗', label: '采集数据' },
      { icon: '📊', label: '算优势函数' },
      { icon: '⭕', label: '画安全圈(KL≤δ)' },
      { icon: '🔍', label: '圈内找最优' },
      { icon: '👣', label: '安全更新' },
    ],
    flowLoop: '↩ 用新策略再采集数据',
  },

  // ===== PPO =====
  ppo: {
    carStory: `PPO 就像给自动驾驶装了个<b>硬性"限位器"</b>：旧策略直行时方向盘通常在 ±5° 以内，
      PPO 设定的阈值是 ±10°。如果新策略算出要打 15°，<b>直接截断到 10°</b>再执行。
      既让策略有探索空间，又防止一脚油门上天。简单粗暴，但稳得一批——
      这就是 PPO 从 Atari 游戏到 ChatGPT 都能通吃的核心秘诀。`,
    carStoryExtra: `<b>🔍 更深入理解：</b><br/>
      <b>PPO 和 TRPO 的关键区别：</b>TRPO 用 KL 散度硬性约束（需要复杂的共轭梯度 + 线搜索）；
      PPO 用一个简单得多的<b>概率比裁剪（clip）</b>替代——效果相当但实现只要几十行代码。<br/><br/>
      <b>核心公式：</b>L<sup>CLIP</sup> = 𝔼[ min( r(θ)·A, clip(r(θ), 1-ε, 1+ε)·A ) ]，
      其中 r(θ) = π<sub>新</sub>(a|s) / π<sub>旧</sub>(a|s) 是新旧策略的概率比，ε 通常取 0.2。<br/><br/>
      <b>裁剪的直觉：</b><br/>
      • A > 0（这个动作不错）：想增大它的概率，但 r 不能超过 1+ε=1.2（不让超太多）<br/>
      • A < 0（这个动作不好）：想减小它的概率，但 r 不能低于 1-ε=0.8（不让降太多）<br/>
      • min 保证了"想冲动时有上限，想拉闸时有下限"，永远不会一步走得太远。<br/><br/>
      <b>💡 PPO 为什么这么红？</b>① 简单（无需 Hessian、二阶优化）；② 稳定（clip 天然限制更新幅度）；
      ③ 高效（同一批数据可以反复更新 K 轮，样本利用率高）；④ 通用（离散/连续动作都能用，从 Atari 到 ChatGPT RLHF 都在用）。`,
    mapping: [
      { label: '概率比 r(θ)', value: '新习惯选这个动作的概率 / 旧习惯的概率' },
      { label: 'clip', value: '物理限位器：r 超过 [1-ε, 1+ε] 就截断' },
      { label: 'ε', value: '限位器的松紧度，通常 0.2' },
      { label: 'GAE', value: '更精确的优势估计（平衡偏差和方差）' },
    ],
    pseudocode: [
      { code: '<span class="kw">Initialize</span> 策略 π(a|s;θ)', comment: '' },
      { code: '<span class="kw">for</span> iteration = <span class="num">1</span> <span class="kw">to</span> N <span class="kw">do</span>', comment: '' },
      { code: '  用 π<sub>old</sub> 采集 T 步数据', comment: '按当前习惯开一批' },
      { code: '  计算 GAE 优势 Â_t', comment: '每步比平均好/差多少（更精确版）' },
      { code: '  <span class="kw">for</span> epoch = <span class="num">1</span> <span class="kw">to</span> K <span class="kw">do</span>', comment: '同一批数据更新 K 轮！' },
      { code: '    r(θ) ← π<sub>θ</sub>(a|s) / π<sub>old</sub>(a|s)', comment: '算概率比' },
      { code: '    L<sub>clip</sub> ← <span class="fn">min</span>(r·Â, <span class="fn">clip</span>(r, <span class="num">1</span>-ε, <span class="num">1</span>+ε)·Â)', comment: '裁剪！超过限位器就截断' },
      { code: '    θ ← θ + α·∇L<sub>clip</sub>', comment: '梯度上升更新策略' },
      { code: '  <span class="kw">end for</span>', comment: '同一批数据反复用，样本效率高' },
      { code: '<span class="kw">end for</span>', comment: '' },
    ],
    flow: [
      { icon: '🚗', label: '采集数据' },
      { icon: '📏', label: '算GAE优势' },
      { icon: '✂️', label: 'Clip裁剪' },
      { icon: '🔄', label: '多轮更新' },
    ],
    flowLoop: '↩ 用新策略再采集，重复',
  },

  // ===== DDPG =====
  ddpg: {
    carStory: `前面的算法处理的都是<b>离散动作</b>（左转/右转/直行/加速/减速这几个选项）。
      但真实驾驶需要<b>连续控制</b>——方向盘可以是 0°~360° 任意角度，油门可以是 0%~100% 任意比例。
      DDPG 就是为连续动作空间量身定做的：Actor 直接<b>输出精确数值</b>（方向盘 15.3°、油门 32.7%），
      让驾驶变得平滑线性，而不是只能在几个固定选项间跳跃。`,
    carStoryExtra: `<b>🔍 更深入理解：</b><br/>
      <b>为什么 DQN 不能直接用？</b>DQN 要求 max<sub>a</sub> Q(s,a)——如果动作是连续的，你没法枚举所有角度挨个算 Q 值。
      DDPG 的解法：用一个 <b>Actor 网络 μ(s)</b> 直接输出"当前状态下最优的连续动作值"，用 <b>Critic 网络 Q(s,a)</b> 评估这个动作好不好。<br/><br/>
      <b>四网络架构（DDPG = DQN 技巧 + AC 架构）：</b><br/>
      🎭 Actor μ(s;θ)：输出连续动作<br/>
      👯 Target Actor μ'：软更新跟随，提供稳定目标<br/>
      🎬 Critic Q(s,a;w)：评估动作价值<br/>
      👯 Target Critic Q'：稳定 TD 目标<br/><br/>
      <b>🌊 软更新（soft update）：</b>θ' ← τ·θ + (1−τ)·θ'，τ 取 0.005。
      目标网络每步都慢慢跟随主网络移动 0.5%，比 DQN 的"硬切换"更平滑，连续动作空间下更容易收敛。<br/><br/>
      <b>🎯 探索机制：</b>由于策略是确定性的（μ(s) 输出唯一动作），DDPG 必须手动加<b>探索噪声</b>（如 Ornstein-Uhlenbeck 噪声），
      否则智能体永远只走一条确定的路，学不到更好的策略。`,
    mapping: [
      { label: 'Actor μ(s)', value: '直接输出方向盘角度和油门力度' },
      { label: 'Critic Q(s,a)', value: '评估"在这个路口转 15°"值多少分' },
      { label: '探索噪声', value: '给动作加随机扰动（像新手手抖）' },
      { label: '软更新 τ', value: '目标网络慢慢跟随，不是直接复制' },
    ],
    pseudocode: [
      { code: '<span class="kw">Initialize</span> Actor μ(s;θ), Critic Q(s,a;w)', comment: '司机 + 教练' },
      { code: '<span class="kw">Initialize</span> Target μ\'←θ, Q\'←w', comment: '各自的"慢半拍"副本' },
      { code: '<span class="kw">Initialize</span> 经验池 D', comment: '行车记录仪' },
      { code: '<span class="kw">for each</span> step <span class="kw">do</span>', comment: '' },
      { code: '  a ← μ(s;θ) + <span class="fn">noise</span>()', comment: 'Actor 输出角度 + 手抖噪声' },
      { code: '  执行 a → r, s\'', comment: '车动了' },
      { code: '  D.<span class="fn">push</span>(s, a, r, s\')', comment: '存入记录仪' },
      { code: '  batch ← D.<span class="fn">sample</span>(N)', comment: '随机抽一批历史' },
      { code: '  y ← r + γ·Q\'(s\', μ\'(s\'))', comment: '用目标网络算 TD 目标' },
      { code: '  更新 Critic: <span class="fn">min</span> (y − Q(s,a;w))²', comment: '让教练的评分更准' },
      { code: '  更新 Actor: ∇<sub>θ</sub> Q(s, μ(s;θ);w)', comment: '让司机往教练打高分的方向调' },
      { code: '  θ\' ← τ·θ + (<span class="num">1</span>-τ)·θ\'', comment: '目标网络慢慢跟随（软更新）' },
      { code: '  w\' ← τ·w + (<span class="num">1</span>-τ)·w\'', comment: '' },
      { code: '<span class="kw">end for</span>', comment: '' },
    ],
    flow: [
      { icon: '🎭', label: 'Actor出动作' },
      { icon: '🔊', label: '加噪声探索' },
      { icon: '🚗', label: '执行' },
      { icon: '💾', label: '存经验池' },
      { icon: '📉', label: '更新Critic' },
      { icon: '⬆️', label: '更新Actor' },
      { icon: '🔄', label: '软更新目标' },
    ],
    flowLoop: '↩ 继续下一步',
  },

  // ===== LLM RL =====
  llm: {
    carStory: `最后一个前沿场景：训练一个像 <b>ChatGPT</b> 一样会聊天的大语言模型。
      模型预训练完只会"接龙"，不懂得回答得"对人胃口"——同样的问题可以啰嗦也可以简洁、可以严谨也可以敷衍。
      我们需要让它<b>对齐人类偏好</b>：<b>RLHF</b> 先让人类标注"哪个回答更好"，训练打分器，再用 PPO 优化；
      <b>DPO</b> 跳过打分器，直接从偏好数据学；<b>GRPO</b> 一次生成一组回答，组内互相比较打分。`,
    mapping: [
      { label: 'SFT', value: '先用高质量问答对做监督微调' },
      { label: '奖励模型 RM', value: '给回答打分的"人类偏好模拟器"' },
      { label: 'KL 惩罚', value: '防止为了高分而胡言乱语，偏离 SFT 模型太远' },
      { label: 'PPO（RLHF）', value: '用裁剪策略梯度最大化 RM 分数' },
      { label: 'DPO', value: '直接从"A 比 B 好"的偏好对学习，无需 RM' },
      { label: 'GRPO', value: '一组回答组内归一化得优势，无需价值网络' },
    ],
    pseudocode: [
      { section: '— RLHF 三阶段流水线 —' },
      { code: '<span class="comment">// 阶段 1: SFT 监督微调</span>', comment: '' },
      { code: 'π<sub>SFT</sub> ← <span class="fn">finetune</span>(预训练模型, 高质量问答数据)', comment: '先学会像人一样回答' },
      { code: '<span class="comment">// 阶段 2: 训练奖励模型 RM</span>', comment: '' },
      { code: '<span class="kw">for each</span> (x, y<sub>w</sub>, y<sub>l</sub>) ∈ 人类偏好数据:', comment: 'w=人类更喜欢的, l=较差的' },
      { code: '  <span class="fn">min</span> −<span class="fn">log</span> σ(r(x,y<sub>w</sub>) − r(x,y<sub>l</sub>))', comment: '训练 RM：好回答得高分，差回答得低分' },
      { code: '<span class="comment">// 阶段 3: 用 PPO 对齐策略</span>', comment: '' },
      { code: '<span class="kw">for</span> iteration:', comment: '' },
      { code: '  y ∼ π<sub>θ</sub>(·|x)', comment: '当前模型生成回答' },
      { code: '  R ← r(x,y) − β·KL(π<sub>θ</sub> ‖ π<sub>SFT</sub>)', comment: '奖励 = RM 分 − 偏离原模型的惩罚' },
      { code: '  用 PPO 更新 π<sub>θ</sub>', comment: '裁剪策略梯度，与前文 PPO 完全一致' },
      { section: '— DPO：跳过 RM，直接从偏好学习 —' },
      { code: 'L<sub>DPO</sub> = −<span class="fn">log</span> σ(β·<span class="fn">log</span>(π<sub>θ</sub>(y<sub>w</sub>)/π<sub>SFT</sub>(y<sub>w</sub>)) − β·<span class="fn">log</span>(π<sub>θ</sub>(y<sub>l</sub>)/π<sub>SFT</sub>(y<sub>l</sub>)))', comment: '一步到位，工程上更简单' },
    ],
    flow: [
      { icon: '📚', label: 'SFT 微调' },
      { icon: '👥', label: '收集人类偏好' },
      { icon: '⚖️', label: '训练 RM' },
      { icon: '🎯', label: 'PPO 对齐' },
      { icon: '🛡️', label: 'KL 约束' },
      { icon: '✨', label: '对齐完成' },
    ],
    flowLoop: '↩ 持续收集人类反馈，迭代优化',
  },

  // ===== RLHF 三阶段 =====
  rlhf: {
    carStory: `想象训练一个 ChatGPT：预训练模型只会"接龙"，并不知道怎样回答才"对人胃口"。
      RLHF 三阶段像培养一个新员工：<b>SFT（岗前培训）</b>：照着示范回答学一遍；
      <b>RM（打分考官）</b>：请专家对比回答对的好坏，训出一个"偏好打分器"；
      <b>PPO（反复练习）</b>：让员工一边答题，一边由考官打分，根据分数调整答题习惯——但不允许离原始风格太远（KL 惩罚）。`,
    mapping: [
      { label: '📚 SFT', value: '高质量问答对监督微调，得到 π_SFT' },
      { label: '⚖️ RM', value: '(chosen, rejected) 偏好对训出打分器 r(x,y)' },
      { label: '🎯 PPO', value: '用 r 打分 + KL 惩罚，用 PPO 优化策略 π' },
      { label: '🎭 π（策略）', value: '正在训练的大模型（Actor）' },
      { label: '📖 π_ref', value: '冻结的 SFT 模型，用于算 KL 防跑偏' },
      { label: '🎬 V（Critic）', value: 'PPO 的价值网络（大模型场景下很贵）' },
    ],
    pseudocode: [
      { section: '— 阶段 1：SFT 监督微调 —' },
      { code: 'π<sub>SFT</sub> ← <span class="fn">finetune</span>(预训练模型, 高质量 (x,y) 对)', comment: '最大化 log π(y|x)' },
      { section: '— 阶段 2：RM 奖励模型训练 —' },
      { code: '<span class="kw">for each</span> (x, y<sub>w</sub>, y<sub>l</sub>) ∈ 人类偏好数据:', comment: 'w=chosen, l=rejected' },
      { code: '  L<sub>RM</sub> = −<span class="fn">log</span> σ(r(x,y<sub>w</sub>) − r(x,y<sub>l</sub>))', comment: 'Bradley-Terry 偏好建模' },
      { section: '— 阶段 3：PPO 策略对齐 —' },
      { code: '<span class="kw">for</span> iteration:', comment: '' },
      { code: '  y ∼ π<sub>θ</sub>(·|x)', comment: '当前策略生成回答' },
      { code: '  R = r(x,y) − β·KL(π<sub>θ</sub> ‖ π<sub>SFT</sub>)', comment: '奖励 = 打分 − β×偏移惩罚' },
      { code: '  用 PPO 更新 π<sub>θ</sub>', comment: '和第四篇 PPO 完全一样的 clip 目标' },
    ],
    flow: [
      { icon: '📚', label: 'SFT 微调' },
      { icon: '👥', label: '收集偏好' },
      { icon: '⚖️', label: '训练 RM' },
      { icon: '🎯', label: 'PPO 对齐' },
      { icon: '🛡️', label: 'KL 约束' },
    ],
    flowLoop: '↩ 持续收集反馈，迭代循环',
  },

  // ===== Reward Model =====
  'reward-model': {
    carStory: `"什么是好回答？"——你没法写代码描述。但可以让人类来标：给同一问题的两个回答 A/B，
      让标注员选"哪个更好"。Reward Model 就是把这种<b>相对偏好</b>编码成一个<b>绝对打分函数</b> r(x, y) 的神经网络。
      训练目标：chosen 的分数应该比 rejected 高。训好后，后续 PPO/GRPO 都靠它来给生成的回答打分——<b>RM 就是对齐算法的"心脏"</b>。`,
    carStoryExtra: `<b>🔍 更深入理解：</b><br/>
      <b>Bradley-Terry 模型</b>：假设人类偏好服从 P(y<sub>w</sub> > y<sub>l</sub>) = σ(r(x,y<sub>w</sub>) − r(x,y<sub>l</sub>))，
      训练目标就是最大化这个似然。也就是 pairwise loss：L = −log σ(r<sub>w</sub> − r<sub>l</sub>)。<br/><br/>
      <b>🐛 RM Hacking（奖励破解）：</b>训练久了，策略会发现 RM 的漏洞——比如"长回答得分高"、"开头说'当然可以'得分高"，
      策略就刷长度、刷礼貌词，真实质量并没有提升。这是 RLHF 最大的坑。<br/><br/>
      <b>📉 过度优化（Goodhart's Law）：</b>经典曲线——RM 打分一路上涨，但人类真实满意度先升后降。
      解决办法：① 限制 KL（β 系数）② 集成多个 RM 取 min ③ 定期用新数据 refresh RM。`,
    mapping: [
      { label: '偏好对', value: '(prompt, chosen, rejected) 三元组' },
      { label: '打分器 r(x,y)', value: '神经网络：输入问答 → 输出标量分数' },
      { label: 'Pairwise Loss', value: '−log σ(r_w − r_l)，越负越好' },
      { label: 'RM Hacking', value: '策略发现 RM 漏洞后"刷分"' },
      { label: '过度优化', value: 'RM 分数↑ 但人类真实满意度↓' },
    ],
    pseudocode: [
      { section: '— Bradley-Terry 偏好建模 —' },
      { code: 'P(y<sub>w</sub> &gt; y<sub>l</sub> | x) = σ(r(x,y<sub>w</sub>) − r(x,y<sub>l</sub>))', comment: '人类选 chosen 的概率' },
      { section: '— RM 训练循环 —' },
      { code: '<span class="kw">for each</span> (x, y<sub>w</sub>, y<sub>l</sub>) <span class="kw">in</span> D<sub>pref</sub>:', comment: '遍历所有偏好对' },
      { code: '  s<sub>w</sub> ← r<sub>φ</sub>(x, y<sub>w</sub>)', comment: 'chosen 的分数' },
      { code: '  s<sub>l</sub> ← r<sub>φ</sub>(x, y<sub>l</sub>)', comment: 'rejected 的分数' },
      { code: '  L = −<span class="fn">log</span> σ(s<sub>w</sub> − s<sub>l</sub>)', comment: '希望 s_w 远大于 s_l' },
      { code: '  φ ← φ − η·∇<sub>φ</sub> L', comment: '反向传播更新' },
    ],
    flow: [
      { icon: '📝', label: '收集偏好对' },
      { icon: '🔢', label: '打分 r(x,y)' },
      { icon: '⚖️', label: 'Pairwise Loss' },
      { icon: '📉', label: '梯度更新' },
      { icon: '🎯', label: '供下游使用' },
    ],
    flowLoop: '↩ 定期用新偏好数据 refresh，对抗 RM Hacking',
  },

  // ===== DPO =====
  dpo: {
    carStory: `RLHF 要训 4 个模型（SFT、RM、Actor、Critic），又贵又不稳定。
      <b>DPO 的核心观察</b>：RLHF 的最优策略对 RM 有一个漂亮的<b>闭式解</b>——
      把这个闭式解反代入偏好损失，RM 项会被完美消掉！
      最后只剩一个监督式损失：<b>让 chosen 回答的对数概率比 rejected 的更高</b>。
      训练只需要 2 个模型（策略 π 和冻结的 π_ref），像 BCE loss 一样简单稳定。`,
    carStoryExtra: `<b>🔍 推导脉络：</b><br/>
      ① RLHF 目标：max 𝔼<sub>π</sub>[r(x,y)] − β·KL(π ‖ π<sub>ref</sub>)<br/>
      ② 闭式最优解：π*(y|x) = (1/Z)·π<sub>ref</sub>(y|x)·exp(r(x,y)/β)<br/>
      ③ 反解 r(x,y)：r(x,y) = β·log(π*(y|x)/π<sub>ref</sub>(y|x)) + β·log Z<br/>
      ④ 代入 Bradley-Terry：log Z 在差值中完美抵消！<br/>
      ⑤ 最终 DPO 损失：L = −log σ(β·log(π(y<sub>w</sub>)/π<sub>ref</sub>(y<sub>w</sub>)) − β·log(π(y<sub>l</sub>)/π<sub>ref</sub>(y<sub>l</sub>)))<br/><br/>
      <b>💡 直觉：</b>对每对 (y<sub>w</sub>, y<sub>l</sub>)，DPO 让 π 相对 π<sub>ref</sub> <b>更偏向 chosen、更远离 rejected</b>。
      β 控制偏移幅度：β 大 → 紧贴 π_ref 保守；β 小 → 激进偏移。`,
    mapping: [
      { label: 'π（策略）', value: '正在训练的模型（要更新）' },
      { label: 'π_ref', value: '冻结的 SFT 模型（参考）' },
      { label: '隐式奖励', value: 'r̂ = β·log(π/π_ref)，无需显式 RM' },
      { label: 'β', value: '越大越保守，越小越激进' },
      { label: '训练数据', value: '只需偏好对 (x, y_w, y_l)' },
    ],
    pseudocode: [
      { section: '— DPO 损失（一行搞定 RLHF）—' },
      { code: 'L<sub>DPO</sub>(π;π<sub>ref</sub>) =', comment: '' },
      { code: '  𝔼<sub>(x,y<sub>w</sub>,y<sub>l</sub>)</sub>[ −<span class="fn">log</span> σ(', comment: '' },
      { code: '    β·<span class="fn">log</span>(π(y<sub>w</sub>|x)/π<sub>ref</sub>(y<sub>w</sub>|x))', comment: 'chosen 的相对对数几率' },
      { code: '    − β·<span class="fn">log</span>(π(y<sub>l</sub>|x)/π<sub>ref</sub>(y<sub>l</sub>|x))', comment: 'rejected 的相对对数几率' },
      { code: '  )]', comment: '希望前者远大于后者' },
      { section: '— 训练循环 —' },
      { code: '<span class="kw">for each</span> batch (x, y<sub>w</sub>, y<sub>l</sub>):', comment: '' },
      { code: '  计算 logπ(y<sub>w</sub>), logπ<sub>ref</sub>(y<sub>w</sub>), logπ(y<sub>l</sub>), logπ<sub>ref</sub>(y<sub>l</sub>)', comment: '4 次前向' },
      { code: '  L ← 上述 DPO 损失', comment: '' },
      { code: '  反向传播仅更新 π（π<sub>ref</sub> 冻结）', comment: '只训一个模型！' },
    ],
    flow: [
      { icon: '📦', label: '加载偏好对' },
      { icon: '🔢', label: '算 4 个 logp' },
      { icon: '📐', label: 'DPO 损失' },
      { icon: '⬆️', label: '仅更新 π' },
    ],
    flowLoop: '↩ 下一个 batch',
  },

  // ===== GRPO =====
  grpo: {
    carStory: `<b>PPO 在 LLM 场景的痛点</b>：Critic 是一个和策略同规模的价值网络——70B 的策略 + 70B 的 Critic，
      显存直接爆炸。<b>GRPO 的聪明之处</b>：不训 Critic！
      而是<b>对同一个 prompt 生成一组（比如 8 个）回答</b>，用 RM 给每个回答打分，
      用<b>组内均值作基线、组内标准差归一化</b>得到优势 A_i = (r_i − μ)/σ。
      这样既不需要 Critic，又保留了 PPO 式的 clip 更新，正是 <b>DeepSeek-R1</b> 成功的关键技术。`,
    carStoryExtra: `<b>🔍 为什么组采样有效？</b><br/>
      PPO 里 Critic 的作用是估计 V(s) 作为基线，让高于基线的动作被加强。
      但在 LLM 里，"一个回答"就是一整个动作，Critic 估 V 的方差极大、效果往往还不如简单基线。<br/><br/>
      GRPO 发现：既然都要生成回答，为什么不一次多生成几个？
      <b>组内的平均分自然就是一个无偏基线</b>，组内标准差则提供了自动缩放。
      这和"多臂老虎机里用 ε-greedy 先探索一圈"是一个哲学。<br/><br/>
      <b>🎯 DeepSeek-R1 的贡献</b>：证明了在数学推理这种<b>可验证奖励</b>任务上，GRPO + 规则奖励 + 无 SFT 就能让模型自发学会反思、回溯——
      这被称为 <b>R1-Zero 时刻</b>，开启了 RL-first 训练范式。`,
    mapping: [
      { label: '组 G', value: '同一 prompt 生成的 N 个回答 {y_1, ..., y_N}' },
      { label: 'RM 打分', value: 'r_i = r(x, y_i)' },
      { label: '组内优势', value: 'A_i = (r_i − μ_G) / σ_G' },
      { label: 'clip 目标', value: '和 PPO 一样的 ratio × advantage clip' },
      { label: '无 Critic', value: '省掉 70B 价值网络，显存大幅降低' },
    ],
    pseudocode: [
      { section: '— GRPO 训练循环 —' },
      { code: '<span class="kw">for each</span> prompt x:', comment: '' },
      { code: '  生成组 G = {y<sub>1</sub>, ..., y<sub>N</sub>} ∼ π<sub>old</sub>(·|x)', comment: '一次采 N 个回答（如 N=8）' },
      { code: '  <span class="kw">for</span> i = <span class="num">1..N</span>: r<sub>i</sub> ← r(x, y<sub>i</sub>)', comment: 'RM 给每个打分' },
      { code: '  μ ← <span class="fn">mean</span>(r), σ ← <span class="fn">std</span>(r)', comment: '组内统计量' },
      { code: '  A<sub>i</sub> ← (r<sub>i</sub> − μ) / σ', comment: '组内归一化优势' },
      { code: '  <span class="kw">for</span> each token t <span class="kw">in</span> y<sub>i</sub>:', comment: 'token 级更新' },
      { code: '    ρ ← π<sub>θ</sub>(t|·)/π<sub>old</sub>(t|·)', comment: '概率比' },
      { code: '    L<sub>clip</sub> ← <span class="fn">min</span>(ρ·A<sub>i</sub>, <span class="fn">clip</span>(ρ, 1−ε, 1+ε)·A<sub>i</sub>)', comment: 'PPO 风格 clip' },
      { code: '  L ← L<sub>clip</sub> − β·KL(π<sub>θ</sub> ‖ π<sub>ref</sub>)', comment: '加 KL 惩罚' },
      { code: '  θ ← θ + η·∇L', comment: '' },
    ],
    flow: [
      { icon: '📝', label: '给 prompt' },
      { icon: '🎰', label: '生成一组回答' },
      { icon: '⚖️', label: 'RM 打分' },
      { icon: '📊', label: '组内归一化' },
      { icon: '✂️', label: 'clip 更新' },
    ],
    flowLoop: '↩ 下一个 prompt',
  },

  // ===== 四法全景对比 =====
  'align-compare': {
    carStory: `学完 RLHF / DPO / GRPO 之后，实战中到底选哪个？这里给你一张全景地图：
      <b>数据只有偏好对、算力有限</b> → 选 <b>DPO</b>，最简单稳定；
      <b>追求极致效果、算力充足、线上有用户反馈</b> → 选 <b>RLHF-PPO</b>，上限最高；
      <b>要做推理/数学/代码这类可验证奖励任务</b> → 选 <b>GRPO</b>，省掉 Critic 还能用规则奖励。
      每种方法都对应不同的数据形态、成本预算和业务目标。`,
    mapping: [
      { label: 'RLHF-PPO', value: 'ChatGPT/Claude/Llama3 等主流产品' },
      { label: 'DPO', value: 'Zephyr / Llama3-Instruct 等开源精调' },
      { label: 'GRPO', value: 'DeepSeek-R1 / DeepSeek-Math 等推理模型' },
      { label: 'Constitutional AI', value: 'Claude 的 RLAIF，用 AI 替代人类标注' },
      { label: '选型三原则', value: '数据形态 + 算力预算 + 业务目标' },
    ],
    flow: [
      { icon: '❓', label: '有什么数据？' },
      { icon: '💰', label: '算力预算？' },
      { icon: '🎯', label: '业务目标？' },
      { icon: '✅', label: '选型完成' },
    ],
    flowLoop: '↩ 跑起来之后根据指标再迭代',
  },
};