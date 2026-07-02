# ECHO NEXT DSP 新手教程

> **推荐先读这份完整文档。** 如果你正在使用 ECHO NEXT、测试新功能，或者准备提交 Issue / PR，建议先从这里开始看。这里集中整理了功能说明、音频路径、DSP 使用建议、常见排查思路和开发边界；读完再动手，很多问题会更容易定位，交流和改动也会更稳。

Source: docs/ECHO_NEXT_DSP_BEGINNER_GUIDE.md
Kind: legacy-doc
Locale: und

# ECHO NEXT DSP 新手教程

这份教程写给第一次打开 `DSP` 工作台的人。你不需要先成为录音师，也不需要背完一堆英文术语。先记住一句话：

**DSP 就是 ECHO 在把声音送到耳机、音箱或 DAC 之前，对数字音频做的可控处理。**

不开 DSP 时，ECHO 尽量保持原始输出路径；开启 EQ、耳机校正、FIR、声道工具、Headroom 等模块后，声音会经过处理链。处理本身不是坏事，但它会改变信号，也通常会让当前播放不再是 bit-perfect 候选路径。

## 什么时候先别开 DSP

如果你只是想确认播放器、声卡、DAC、耳机是否正常，先保持 DSP 全关。

尤其是这些情况，先别急着调音：

1. 刚安装软件，正在确认有没有声音。
2. 正在排查爆音、无声、半速、卡顿、切歌失败。
3. 正在验证 WASAPI Exclusive / ASIO / 外置 DAC 是否稳定。
4. 正在判断某个音乐文件是不是损坏。
5. 想确认原始输出、采样率和 bit-perfect 候选状态。

排查问题时的安全顺序是：先切回 `System` 或 `WASAPI Shared`，关闭 EQ / FIR / 声道工具 / ReplayGain / 变速，换一首普通 MP3 或 FLAC 试听。等基础播放稳定后，再逐个打开 DSP 模块。

## DSP 工作台怎么认

左侧进入 `DSP`，你会看到一条类似信号链的工作区。它不是“音效商城”，更像一张清楚的路线图：声音从输入进来，经过哪些处理，再送到输出。

| 模块 | 你可以这样理解 | 新手建议 |
| --- | --- | --- |
| `Headroom` | 先把音量空间让出来，防止后面处理把信号顶爆 | 开 EQ / FIR 前优先用 |
| `参数 EQ` | 调低频、人声、高频、空气感这些声音风格 | 先用 Simple，再进 Pro |
| `耳机校正` | 用 OPRA 曲线修正特定耳机的频响倾向 | 找到型号再用，不要乱套 |
| `FIR / 房间校正` | 导入 IR，用卷积处理房间或设备响应 | 有可靠 IR 文件再用 |
| `声道工具` | 调左右平衡、延迟、Mono、左右互换 | 偏音或声像不居中时用 |
| `输出安全` | 看削波、余量、bit-perfect、模块状态 | 经常看，不需要手动调太多 |

最稳的上手方式是：每次只动一个模块，听同一首歌，确认变化，再继续下一步。

## 新手推荐路线

第一次调 DSP，建议按这个顺序：

1. 播放一首你非常熟的歌，最好是声音正常、不是现场版、不是极端混音。
2. 打开 `DSP` 工作台，先看顶部状态是不是 `Native direct` 或类似原生直通。
3. 进入 `Headroom`，如果准备增强低频、高频或启用 FIR，先预留一点余量，例如使用界面建议或 `-6 dB` 保护。
4. 进入 `参数 EQ`，保持 `Simple` 模式，先试 `Bass`、`Vocal`、`Air`、`Warm` 这类大方向。
5. 如果出现“爆”“糊”“刺”“音量忽大忽小”，先降低 Preamp 或 Headroom，不要继续往上推。
6. 想对比原声，就用旁路、关闭 EQ，或回到输出安全看当前 DSP 是否仍 active。
7. 调到舒服后保存方案；不舒服就重置，不要硬留。

调音不是考试。你听得更舒服、又没有削波风险，就是合格。

## 数字音频最小科普

### PCM 是什么

大多数播放器内部最终都要把音乐变成 PCM。你可以把 PCM 想成一长串数字采样点：每秒取很多次声音的高度，再把这些数字送给声卡。

常见的 `44.1 kHz / 16-bit` 大致意思是：

- `44.1 kHz`：每秒 44100 个采样点。
- `16-bit`：每个采样点用 16 位数字表示音量精度。

Hi-Res 文件可能是 `96 kHz / 24-bit`、`192 kHz / 24-bit`。数字更大不自动等于更好听，录音、母带、设备和输出链路同样重要。

### 采样率不是音量

采样率表示“每秒测量多少次”，不是“声音有多大”。把 44.1 kHz 强行升到 192 kHz，不会凭空多出录音里没有的信息。它可能用于设备兼容、统一输出或某些处理流程，但不要把重采样当成音质魔法。

### bit depth 不是频响

位深影响的是动态范围和量化精度，不是低频多不多、高频亮不亮。24-bit 给制作和处理留了更多空间，但最终听感还取决于录音、响度、设备和环境。

### dB 是相对刻度

EQ、Preamp、Headroom 常用 `dB`。它不是线性刻度：

- `+3 dB` 已经是明显增强。
- `+6 dB` 很容易让输出接近上限。
- `-6 dB` 常用来给 DSP 留安全空间。

所以调 EQ 时，少量多次比一口气拉满更稳。

### 削波为什么难听

数字音频有一个天花板，通常叫 `0 dBFS`。信号超过这个上限时，波形会被截平，这就是 clipping / 削波。削波会让声音变硬、炸、刺，严重时像破音。

EQ 往上推、FIR 增益、声道补偿、ReplayGain、音量叠加，都可能让信号接近上限。`Headroom` 的作用就是先把整体电平往下让一点，给后面的处理留空间。

### bit-perfect 是什么

bit-perfect 可以简单理解为：播放器尽量把文件里的数字样本原样送出去，不改 EQ、不改音量、不重采样、不做其它处理。

这不是“永远更好听”的保证，而是一个验证链路的状态。你想确认 DAC、驱动、采样率是否按预期工作时，它很有用；你想让耳机更顺耳、修正房间、调左右偏音时，就会主动离开 bit-perfect。

更白话一点：

- bit-perfect 像“原封不动送快递”。
- DSP 像“送出前先按你的要求重新包装、修边、加保护”。

两者没有绝对高下，关键是你现在想做什么。

## EQ 怎么调才不容易翻车

EQ 是最常用的 DSP。新手先用 `Simple`，把它当成几个声音方向按钮：

| 想要 | 先试 | 注意 |
| --- | --- | --- |
| 鼓更有重量 | Bass | 低频多了可能糊，必要时降 Preamp |
| 人声更靠前 | Vocal | 太多会吵或鼻音重 |
| 高频更亮、更有空气 | Air | 太多会刺、齿音重 |
| 声音更厚、更柔和 | Warm | 可能牺牲清晰度 |
| 回到原始曲线 | Flat / Reset | Flat 不等于关闭 DSP，开关状态也要看 |

如果你进入 `Pro`，建议先只记住三段：

- 低频：大约 `20 Hz` 到 `160 Hz`，影响鼓、贝斯、厚度和轰鸣。
- 中频/人声：大约 `250 Hz` 到 `4 kHz`，影响人声、吉他、钢琴和存在感。
- 高频/空气：大约 `5 kHz` 到 `20 kHz`，影响亮度、齿音、空间感和细节感。

不要所有频段都往上推。想让某个部分更突出，很多时候是把其它部分稍微降下来，而不是一味加。

## Headroom 怎么用

Headroom 是“预留空间”。它不负责让声音变好听，它负责让后面的处理不要把声音顶爆。

推荐理解：

- `0 dB`：不额外预留。
- `-3 dB`：轻量保护，适合小幅 EQ。
- `-6 dB`：比较保守，适合明显低频增强、FIR、多个 DSP 模块叠加。
- 更低：只在确实有风险时使用。

开了 Headroom 后，整体可能会变小声。这不是坏掉，而是给信号留了余量。你可以在系统音量、耳放或设备端补回舒适音量，但不要为了“看起来响”把 DSP 处理一路推红。

## 耳机校正是什么

耳机校正不是“把所有耳机变成神耳机”。它更像给某个耳机型号贴一张修正地图：哪里太多，哪里太少，就用曲线轻轻补偿。

ECHO 的耳机校正会把 OPRA 相关曲线作为受管理的 EQ 状态使用。看到“耳机校正管理中”之类提示时，不要直接把它当普通自定义 EQ 乱改；如果你想继续自由编辑，先转换成自定义方案。

新手建议：

1. 只给确实匹配的耳机型号使用校正。
2. 校正后先用 A/B 对比确认是否更自然。
3. 如果声音变薄、变闷、变刺，关闭校正，不要硬用。
4. 耳机校正通常会影响 bit-perfect，这是正常的。

## FIR / 房间校正是什么

FIR / 房间校正常见于导入 IR 文件。IR 可以理解成一个“声音指纹”：系统用它来做卷积处理，让输出符合某个目标响应。

它适合这些场景：

- 你有测量麦克风和可靠测量流程。
- 你拿到了可信的房间、耳机或设备 IR。
- 你知道这个 IR 是给当前采样率、声道和用途准备的。

不适合这些场景：

- 随便下载一个不知道来源的 IR。
- 边排查播放问题边开 FIR。
- 没留 Headroom 就启用大幅校正。

安全做法：导入 IR 后，先预留 `-6 dB` 左右 Headroom，再启用 FIR，听音量、相位、左右声道是否正常。发现削波风险就先降低 Trim 或 Headroom。

## 声道工具怎么用

声道工具主要处理“左右”的问题，而不是处理整体音色。

常见用途：

- 耳机一边稍微大声，调左右增益。
- 人声不在中间，微调声像平衡。
- 检查左右声道有没有接反，临时交换左右。
- 用 Mono 检查左右合并后是否正常。
- 用左右延迟微调声像位置。

新手原则：只做小改动。左右增益从 `0.25 dB` 或 `0.5 dB` 这种小步开始；延迟也不要大幅拉。你是在微调方向盘，不是在拆车。

## 输出安全怎么看

`输出安全` 是 DSP 工作台里最值得经常看的页面。它会告诉你：

- 当前有没有 DSP 模块启用。
- 当前是不是 bit-perfect 候选路径。
- 有没有削波或余量风险。
- FIR、EQ、声道工具是否参与了处理。
- 建议下一步是继续监听、保持直通，还是先处理余量。

看到风险提示时，优先顺序是：

1. 降低 Headroom 或应用建议保护。
2. 降低 EQ 的 Preamp。
3. 减少 EQ 里向上推的频段。
4. 降低 FIR Trim。
5. 暂时关闭某个 DSP 模块，确认风险来自哪里。

不要在已经有削波风险时继续叠加更多增强。

## 常见问题

### 开了 DSP 以后 bit-perfect 没了，是 bug 吗

通常不是。EQ、FIR、声道处理、耳机校正、重采样、ReplayGain 等都会改变数字信号。只要改变了样本，就不能再说是原封不动输出。

### Flat 是不是等于关闭 EQ

不一定。`Flat` 只是曲线看起来平，EQ 开关如果仍然启用，信号仍可能经过 DSP 链路。想确认完全关闭，应该看 EQ 开关和输出安全状态。

### 为什么调高低频后声音反而变差

可能是低频堆积、Preamp 没降、耳机本身承受不了、录音本来就重低频，或者已经削波。先降低 Preamp / Headroom，再把增强幅度减半。

### 为什么开了 Headroom 声音变小

这是它的工作。Headroom 通过降低数字电平给后续处理留空间。你可以在设备端把听感音量补回来，但不要用数字增益把它又推爆。

### 新手到底该开哪些

日常听歌建议从这套开始：

1. `Headroom`：按建议或轻量预留。
2. `参数 EQ`：Simple 模式轻微调整。
3. `输出安全`：确认没有削波。

耳机校正、FIR、声道工具等到你有明确需求再开。

## 一句话总结

DSP 不是“越多越 HiFi”，而是“你明确知道想修哪里，并且能安全地修”。ECHO 的 DSP 工作台要帮你做到三件事：看清当前声音有没有被处理、知道处理会不会带来风险、随时能回到原始直通。

更短的 Simple 模式说明见 [ECHO_NEXT_DSP_SIMPLE_GUIDE.md](./ECHO_NEXT_DSP_SIMPLE_GUIDE.md)。开发与边界说明见 [ECHO_NEXT_EQ.md](./ECHO_NEXT_EQ.md)。

---

# ECHO NEXT DSP Simple 教程

Source: docs/ECHO_NEXT_DSP_SIMPLE_GUIDE.md
Kind: legacy-doc
Locale: und

# ECHO NEXT DSP Simple 教程

`Simple` 是给普通听歌用户准备的轻量调音模式。它不是缩水版，也不是“低级模式”。它更像自动挡：你只告诉 ECHO 你想往哪个方向听，软件帮你把背后的 EQ 频点、前级和安全提示整理好。

如果 `Pro` 像一张满是旋钮的调音台，`Simple` 就像几张声音风格卡片：

- 想低频更有重量，点 `Bass`。
- 想人声更靠前，点 `Vocal`。
- 想高频更亮，点 `Air`。
- 想声音更厚、更柔和，点 `Warm`。
- 想回到平直，点 `Flat` 或重置。

## Simple 到底在干嘛

声音可以粗略分成三块：

| 区域 | 像什么 | 你会听到 |
| --- | --- | --- |
| 低频 | 地基和鼓点 | 低音、贝斯、鼓的重量 |
| 中频 | 人声和身体 | 歌手、吉他、钢琴、厚度 |
| 高频 | 光泽和空气 | 亮度、齿音、空间感、细节 |

`Simple` 不让你一上来面对一排频点，而是把常见动作做成按钮。你点 `Vocal`，它会主要照顾人声区域；你点 `Air`，它会轻轻处理高频空气感；你点 `Bass`，它会增加一点低频存在感。

## 新手怎么用

推荐这样试：

1. 播放一首你熟的歌。
2. 进左侧 `DSP`，打开 `参数 EQ`。
3. 保持 `Simple`。
4. 只点一个方向，例如 `Vocal`。
5. 听 20 到 30 秒。
6. 不舒服就换方向或重置，不要连续猛点。
7. 看到安全提示，就先点建议的安全动作或降低 Preamp。

你不是在“调出最正确答案”，你是在找“今天这副耳机、这首歌、这个音量下更舒服的声音”。

## 每个按钮怎么理解

| 按钮 | 白话解释 | 适合 |
| --- | --- | --- |
| `Bass` | 给鼓和贝斯加一点重量 | 流行、电子、低频偏薄的耳机 |
| `Vocal` | 把歌手从背景里稍微推出来 | 人声、ACG、播客、现场录音 |
| `Air` | 给高频和空间感开一点窗 | 声音偏闷、细节不够清楚 |
| `Warm` | 让声音更厚、更不刺激 | 高频偏刺、冷薄的设备 |
| `Flat` | 回到平直曲线 | 对比原始风格、重新开始 |

注意：`Flat` 只是曲线平直，不一定等于彻底关闭 DSP。想确认原始输出，要看 EQ 开关和 `输出安全` 页面。

## 安全提示怎么处理

如果 Simple 提醒你有削波或余量风险，别紧张。它大概是在说：

“你刚才把声音某些地方加高了，数字音频快碰到天花板了，先让一点空间。”

处理顺序很简单：

1. 点界面建议的安全动作。
2. 或把 Preamp 降低一些。
3. 或把刚才的增强幅度减小。
4. 如果还不放心，关掉 EQ 对比。

不要为了更大声一直往上推。大声不等于好听，爆掉更不等于 HiFi。

## Simple 和 Pro 怎么选

| 你现在的状态 | 选哪个 |
| --- | --- |
| 只是想声音更顺耳 | Simple |
| 不知道 1 kHz、Q 值、Preamp 是什么 | Simple |
| 想快速试几种味道 | Simple |
| 想精确改某个频点 | Pro |
| 要导入 Equalizer APO / 复杂 EQ | Pro |
| 要保存、绑定、微调完整方案 | Pro |

Simple 的目标是让你不用害怕 DSP。等你知道“我想减 6 kHz 的刺”“我想让 100 Hz 少一点轰”“我想控制 Q 值”时，再去 Pro。

## 一套懒人流程

日常听歌可以这样：

1. 先不开 DSP，确认这首歌本身正常。
2. 想要更有氛围，开 `Simple`。
3. 在 `Bass`、`Vocal`、`Air`、`Warm` 里选一个最顺耳的。
4. 有风险就应用安全建议。
5. 保存成自己的方案。
6. 想认真对比，就关闭 EQ 听 10 秒，再打开听 10 秒。

如果你分不出差别，那也很好：说明现在不需要调。DSP 最好的状态不是永远开满，而是在需要时刚好帮上忙。

## 最短结论

`Simple` 就是 ECHO 的“别让我看参数，我只想让声音更舒服”模式。它把复杂 EQ 包成几个听感方向，同时提醒你别把声音推爆。先用它，够用了就停；不够再进 `Pro`。

完整 DSP 新手教程见 [ECHO_NEXT_DSP_BEGINNER_GUIDE.md](./ECHO_NEXT_DSP_BEGINNER_GUIDE.md)。

---

# ECHO NEXT EQ 指南

Source: docs/ECHO_NEXT_EQ.md
Kind: legacy-doc
Locale: und

# ECHO NEXT EQ 指南

ECHO NEXT EQ 是可播放、可解释、可关闭的 HiFi DSP 功能。它的第一原则不是“看起来专业”，而是让用户清楚知道：EQ 何时在改变声音、何时会禁用 bit-perfect、何时可能削波、何时已经真正 bypass。

## 定位

EQ 属于 Audio Core 的 DSP 能力，不属于单纯 UI 装饰。

它应该做到：

- 实时可调。
- 不破坏播放稳定。
- 不在音频回调里做危险操作。
- 清楚影响 bit-perfect。
- 预设可保存、可导入、可回退。
- UI 对新手友好，同时保留专业控制。

它不应该做到：

- 伪装成“音质增强”。
- 默认开启并改变用户声音。
- 把 Flat preset 当作关闭 EQ。
- 为了曲线动画拖慢播放。
- 把 VST、卷积、房间校正、在线预设市场混进第一阶段。

## 功能范围

当前 EQ 核心范围：

- 10-band graphic / parametric hybrid EQ。
- band gain: `-12 dB` 到 `+12 dB`。
- preamp: `-12 dB` 到 `+6 dB`。
- band center frequency: `20 Hz` 到 `20 kHz`。
- fixed Q，当前默认 `1.0`。
- enable / bypass。
- built-in presets。
- user presets。
- curve visualization。
- clipping / headroom warning。
- native realtime DSP hook。

默认频点：

```text
31 Hz, 62 Hz, 125 Hz, 250 Hz, 500 Hz, 1 kHz, 2 kHz, 4 kHz, 8 kHz, 16 kHz
```

后续能力可以加，但不能挤进音频热路径：

- full parametric bands。
- realtime analyzer。
- dynamic EQ。
- auto gain。
- A/B compare persistence。
- per-output profile。
- per-headphone profile。

明确不在当前范围：

- VST host。
- convolution / room correction。
- AutoEQ database。
- network preset marketplace。
- 和歌词、MV、下载器、流媒体强绑定。

## Bit-perfect 规则

只要 EQ 启用，Audio Status 必须表达：

- `eqEnabled = true`
- `dspActive = true`
- `bitPerfectCandidate = false`
- `bitPerfectDisabledReason = eq_enabled`
- UI 显示当前输出不是 bit-perfect

EQ 关闭或 bypass 完成后：

- native processor crossfade 回 dry signal。
- bypass smoothing 到零后不再改变样本。
- 如果没有其他 DSP、重采样、ReplayGain、声道平衡或输出 mismatch，`bitPerfectCandidate` 才可以恢复。

Flat preset 不是 disabled：

- Flat 只是所有 band 为 `0 dB`、preamp 为 `0 dB`。
- 如果 EQ 仍启用，信号依然经过 DSP 链路。
- UI 不能把 Flat 写成 bit-perfect。

## 信号链路

```text
Decoded PCM
  -> optional ReplayGain / gain stage
  -> EQ Processor
       preamp
       band filters
       smoothing
       bypass crossfade
       clipping risk detection
  -> output bridge
```

原则：

- DSP 状态必须进入 audio status。
- UI 控制变化走 control path，不进入 PCM stdin。
- 音频回调只读实时安全参数。
- 预设文件 IO 不进入音频回调。

## Native DSP 结构

相关 native 文件：

- `native/audio-engine/EqTypes.h`
- `native/audio-engine/EqBand.h`
- `native/audio-engine/EqProcessor.h`
- `native/audio-engine/EqProcessor.cpp`
- `native/audio-engine/EqPresetStore.h`
- `native/audio-engine/EqPresetStore.cpp`
- `native/audio-engine/EqMessageProtocol.h`
- `native/audio-engine/EqMessageProtocol.cpp`

`EqProcessor` 负责：

- 每声道 biquad 状态。
- atomic target parameters。
- preamp smoothing。
- band gain smoothing。
- frequency smoothing。
- bypass crossfade。
- clipping risk detection。
- NaN / Inf 防护。

`EqMessageProtocol` 负责：

- 在控制线程解析 JSON-line。
- 校验参数。
- 更新 atomic targets。
- 不在 audio callback 内解析 JSON。

## 实时安全规则

JUCE/native audio callback 禁止：

- 分配大对象。
- 读写 JSON。
- 读写 preset 文件。
- 访问 Electron / React / IPC。
- 等待 mutex。
- 发网络请求。
- 打日志到慢 IO。
- 每个 sample 都重建所有滤波器系数。

参数更新必须：

- clamp 非法值。
- 使用 atomic target。
- gain / preamp 平滑约 `25 ms`。
- bypass crossfade 约 `15 ms`。
- 快速拖动时不输出 NaN / Inf。
- 频率拖动平滑后再重算系数。

## Electron Bridge

Renderer 只通过 `window.echo.eq` 控制 EQ。

命令：

- `eq:get-state`
- `eq:set-enabled`
- `eq:set-band-gain`
- `eq:set-band-frequency`
- `eq:set-preamp`
- `eq:set-preset`
- `eq:reset`
- `eq:list-presets`
- `eq:save-preset`
- `eq:import-preset`
- `eq:export-preset`
- `eq:delete-preset`

Renderer 不能：

- 直接访问音频 buffer。
- 直接控制 native socket。
- 直接写 preset 文件。
- 自己决定 bit-perfect 状态。

控制消息示例：

```json
{ "type": "eq:set-band-gain", "band": 3, "gainDb": 2.5 }
```

```json
{ "type": "eq:set-band-frequency", "band": 3, "frequencyHz": 360 }
```

状态示例：

```json
{
  "type": "eq:state",
  "enabled": true,
  "preampDb": -3,
  "bands": [
    { "frequencyHz": 31, "gainDb": 0, "q": 1 }
  ],
  "dspActive": true,
  "bitPerfectCandidate": false,
  "bitPerfectDisabledReason": "eq_enabled"
}
```

## Preset 格式

```json
{
  "id": "bass-boost",
  "name": "Bass Boost",
  "preampDb": -2,
  "bands": [
    { "frequencyHz": 31, "gainDb": 4, "q": 1 }
  ],
  "createdAt": "built-in",
  "updatedAt": "built-in",
  "readonly": true
}
```

内置预设建议：

- Flat
- Bass Boost
- Vocal Clear
- Treble Sparkle
- Loudness
- Night
- Headphone Warm
- Anime / J-Pop
- Rock
- Classical

规则：

- Built-in preset 只读。
- User preset 存在 Electron `userData`。
- 读取时校验字段、范围、band 数量。
- malformed preset 不能让设置页白屏。
- 导入同 id preset 时生成新 id，不静默覆盖本地调音。
- 删除用户 preset 后要 fallback 到安全状态。

## UI 结构

EQ UI 应该分层：

### Simple

给普通用户：

- 总开关。
- preset selector。
- preamp。
- headroom / clipping warning。
- reset。
- bit-perfect 影响提示。

### Pro

给高级用户：

- curve view。
- draggable band nodes。
- 频率 / 增益精确输入。
- selected band 控制。
- A/B 对比。
- undo / redo。
- preset save / import / export / delete。

### 状态提示

必须可见：

- EQ 是否启用。
- 当前是否 bypass。
- 当前是否影响 bit-perfect。
- 是否有 clipping risk。
- 当前 preset 是否已修改但未保存。

不要把复杂解释塞满页面。普通用户只需要知道“现在声音有没有被改、风险是什么、怎么关掉”。

## 曲线交互

曲线交互要稳：

- 拖动时节流发送。
- release 时发送准确最终值。
- band 节点尺寸稳定。
- tooltip 显示频率和增益。
- 不能因为快速拖动导致 UI 卡顿或 native 参数爆炸。
- 键盘/输入框也能精确调整。

曲线只是控制视图，不是事实来源。事实来源是 EQ state。

## Headroom 和削波

高增益 EQ 可能导致 clipping。

UI 应该：

- 在风险出现时提示降低 preamp。
- 不要自动偷偷改用户 preset，除非明确启用 auto gain。
- 区分“可能削波”和“已经检测到削波风险”。
- 夜间、低音增强等 preset 默认保留合理 preamp。

## 稳定性验收

Native DSP 测试应覆盖：

- disabled EQ 完全返回 dry input。
- Flat preset 启用时数值透明，但状态仍报告 DSP active。
- 高增益后 bypass crossfade 完成能回到 dry output。
- 快速 gain / frequency / preamp 改动不输出 NaN / Inf。
- 频率 clamp 在 `20 Hz` 和 `20 kHz` 边界稳定。
- steady-state 不每 sample 重算所有 biquad。

TypeScript / Renderer 测试应覆盖：

- `EqBridge` 输入校验。
- preset 持久化。
- malformed preset fallback。
- UI 开关和 preset 操作。
- 曲线编辑、undo/redo、A/B。
- EQ 或 channel balance 开启时 bit-perfect 状态禁用。
- headroom / clipping-risk telemetry。

可用入口：

```text
npm run test:audio-engine
```

只改文档不需要跑这些测试；改 native DSP 或 bridge 时才跑对应窄测试。

## 和其它音频功能的关系

EQ 与这些能力都可能共同影响 bit-perfect：

- ReplayGain。
- Preamp。
- Volume。
- Channel balance。
- Resampling。
- Speed / pitch。
- Crossfade / automix。

Audio Status 需要合并原因，不要只显示最后一个原因。UI 可以做简化展示，但诊断里要能看到完整原因列表。

## 一句话标准

ECHO NEXT 的 EQ 应该让声音调整更可控，而不是让声音链路更神秘。只要 EQ 开启，用户就应该清楚知道它改变了信号；只要 EQ 关闭，系统就应该真正回到不处理样本的路径。

---

# ECHO Next Linux 构建指南

Source: docs/ECHO_NEXT_LINUX_BUILD.md
Kind: legacy-doc
Locale: und

# ECHO Next Linux 构建指南

这份文档是 ECHO Next 的 Linux x64 打包、验收和故障定位指南。目标不是“能跑一下命令”，而是把 Linux 包从环境准备、FFmpeg、ALSA、native host、electron-builder 到发布前验收都讲清楚。

当前 Linux 支持属于稳健首阶段：产出 x64 `AppImage` 和 `deb`，应用能启动、能扫描本地曲库、能播放本地 WAV / FLAC / MP3，并且在 Linux shared native output 下提供明确的 ALSA 后端。

> [!IMPORTANT]
> Linux 包必须在 Linux x64 环境中构建。不要在 Windows 上直接交叉打 Linux 包。这个项目的 Linux 包需要 Linux 版 `echo-audio-host`、Linux 版 FFmpeg、Linux 原生开发库和 Linux 打包工具；跨平台硬凑很容易产出“看起来有包、实际上不能播放”的假产物。

## 1. 当前支持边界

### 已支持

- Linux x64 桌面包。
- `AppImage`。
- `deb`。
- Electron 主程序、Renderer、Preload、主进程服务。
- 本地曲库扫描和本地播放主流程。
- Linux 版 `echo-audio-host`。
- Linux shared native output。
- shared backend `Auto`。
- shared backend `ALSA`。
- PipeWire 通过 ALSA compatibility layer 暴露出来的设备路径。
- 独立 Linux 工具目录 `electron-app/tools-linux/`。

### 暂不声明支持

- Linux arm64 / aarch64。
- rpm / snap / Flatpak 正式产物。
- JACK 原生后端。
- PipeWire 原生后端。
- Linux 独占 / bit-perfect 级别 HiFi 后端。
- 从 Windows 直接交叉构建 Linux 包。
- 发行版全矩阵兼容承诺。

### 明确仍是 Windows-only

- WASAPI Exclusive。
- ASIO。
- DirectSound compatibility mode。
- SMTC。
- Windows taskbar thumbnail controls。
- Windows audio service restart。

这些边界要保持清楚。Linux 适配不能影响 Windows 端已有播放链路，也不能把尚未验收的 Linux 能力包装成已完成能力。

## 2. 推荐构建环境

优先级从高到低：

1. 原生 Linux x64。
2. Linux x64 VM。
3. Linux CI runner。
4. WSL2 Ubuntu x64。

WSL2 可以用于构建和基础命令验证，但不建议把 WSL2 当成完整桌面验收环境。音频设备、桌面 session、AppImage 启动行为、FUSE 和 sandbox 细节都可能与真实用户环境不同。

推荐版本：

| 项目 | 建议 |
| --- | --- |
| Node.js | 20 LTS |
| npm | 9 或更高 |
| CPU | x64 |
| C++ | 支持 C++17 |
| CMake | 3.24 或更高更稳妥 |
| Electron | 使用仓库 `package-lock.json` 固定版本 |
| FFmpeg | Linux x64 可执行文件，至少包含 `aresample` |

确认平台：

```bash
uname -a
node -p "process.platform + '/' + process.arch"
```

期望 Node 输出：

```text
linux/x64
```

## 3. Ubuntu / Debian 依赖

基础构建和打包工具：

```bash
sudo apt update
sudo apt install cmake g++ pkg-config fakeroot dpkg rpm binutils
```

JUCE / audio host 相关依赖：

```bash
sudo apt install \
  libasound2-dev libjack-jackd2-dev \
  libfreetype-dev libfontconfig1-dev \
  libx11-dev libxcomposite-dev libxcursor-dev libxext-dev \
  libxinerama-dev libxrandr-dev libxrender-dev
```

桌面运行和 AppImage 验收可能需要：

```bash
sudo apt install libgtk-3-0 libnss3 libxss1 libxtst6 libdrm2 libgbm1
```

如果 AppImage 报 FUSE 相关错误，按发行版安装对应 FUSE 运行时。例如 Ubuntu 新版本可能需要：

```bash
sudo apt install libfuse2
```

不同发行版包名可能不同，但核心依赖类别不变：

- C++ 编译链。
- CMake。
- pkg-config。
- ALSA 开发库。
- X11 开发库。
- fontconfig / freetype。
- electron-builder 打包需要的 dpkg / fakeroot / rpm / binutils。

## 4. 获取代码和安装 Node 依赖

新环境从零开始：

```bash
git clone https://github.com/moekotori/echo.git
cd echo
npm ci
```

开发机已有仓库时：

```bash
git pull
npm ci
```

不要把 Windows 下的 `node_modules` 拷到 Linux。这个项目包含 native dependency，Linux 构建需要在当前 Linux 环境里重新安装或重建。

`build:linux` 会自动执行：

```bash
npm run rebuild:native
```

它会让 `better-sqlite3` 等 native dependency 匹配当前 Electron ABI。

## 5. Linux 工具目录

Linux 包使用独立工具目录：

```text
electron-app/tools-linux/
  README.md
  ffmpeg
  ffmpeg-manifest.json
  yt-dlp
```

打包后会复制到：

```text
dist/linux-unpacked/resources/tools/
```

要求：

| 文件 | 是否必须 | 作用 |
| --- | --- | --- |
| `ffmpeg` | 必须 | 解码、探测和音频处理工具链的一部分 |
| `ffmpeg-manifest.json` | 必须 | 记录 FFmpeg 版本、hash、必需 filter 和许可证信息 |
| `yt-dlp` | 可选 | 下载和部分 streaming helper |
| `README.md` | 已在仓库 | 说明目录用途 |

`yt-dlp` 缺失不应该阻断本地曲库扫描、本地播放和 Linux 包构建。它只会让下载/部分流媒体提取能力不可用。

## 6. 准备 FFmpeg

### 6.1 放置 Linux x64 FFmpeg

示例：

```bash
mkdir -p electron-app/tools-linux
cp /path/to/linux/ffmpeg electron-app/tools-linux/ffmpeg
chmod +x electron-app/tools-linux/ffmpeg
```

确认它不是 Windows 二进制：

```bash
file electron-app/tools-linux/ffmpeg
electron-app/tools-linux/ffmpeg -hide_banner -version
```

`file` 输出应该能看出 ELF / Linux x86-64。不要放 `.exe`。

### 6.2 可选放置 yt-dlp

```bash
cp /path/to/yt-dlp electron-app/tools-linux/yt-dlp
chmod +x electron-app/tools-linux/yt-dlp
```

如果没有 `yt-dlp`，可以跳过。

### 6.3 更新 manifest

当前模板在：

```text
electron-app/tools-linux/ffmpeg-manifest.json
```

字段含义：

| 字段 | 说明 |
| --- | --- |
| `name` | 工具名，通常是 `ffmpeg` |
| `version` | `ffmpeg -hide_banner -version` 输出里能匹配到的片段 |
| `source` | 本地或 CI 准备方式说明 |
| `sourceUrl` | 精确来源 URL，能填就填 |
| `downloadPage` | 下载页 |
| `artifact` | 仓库内 artifact 路径，应为 `electron-app/tools-linux/ffmpeg` |
| `sha256` | 当前 FFmpeg 文件的 SHA256 |
| `requiresSoxr` | 是否要求 `--enable-libsoxr` |
| `requiredFilters` | 必须存在的 FFmpeg filters，目前至少 `aresample` |
| `licenseFamily` | 许可证族，当前模板为 `GPLv3` |

计算 hash：

```bash
sha256sum electron-app/tools-linux/ffmpeg
```

检查 filters：

```bash
electron-app/tools-linux/ffmpeg -hide_banner -filters | grep aresample
```

检查 soxr：

```bash
electron-app/tools-linux/ffmpeg -hide_banner -version | grep enable-libsoxr
```

当前仓库模板里 `requiresSoxr` 是 `true`。如果你准备的 FFmpeg 没有 `--enable-libsoxr`，`npm run verify:ffmpeg` 会失败。此时有两个选择：

- 换一个带 `--enable-libsoxr` 的 FFmpeg。
- 如果当前发布目标不要求 soxr，把 manifest 里的 `requiresSoxr` 改成 `false`，但要明确这是发布策略变化。

### 6.4 验证 FFmpeg

```bash
npm run verify:ffmpeg
```

在 Linux 上，这条命令默认检查：

```text
electron-app/tools-linux/ffmpeg-manifest.json
```

如果要显式指定：

```bash
ECHO_FFMPEG_MANIFEST=electron-app/tools-linux/ffmpeg-manifest.json npm run verify:ffmpeg
```

通过时会看到类似：

```text
[verify:ffmpeg] OK ... sha256=...
```

## 7. audio host 和 ALSA

Linux shared native output 由 `echo-audio-host` 提供。构建入口：

```bash
npm run build:audio-host
```

相关源码和配置：

```text
native/audio-host/CMakeLists.txt
native/audio-host/src/main.cpp
native/audio-host/tests/audio_engine_tests.cpp
scripts/build-audio-host.mjs
```

Linux 平台构建特点：

- `ECHO_ENABLE_ASIO` 默认 `OFF`。
- 非 Windows 平台启用 `JUCE_ALSA=1`。
- 非 Windows 平台禁用 `JUCE_JACK=0`。
- CMake 会 `find_package(ALSA REQUIRED)`。
- 生成文件是 `electron-app/build/echo-audio-host`，没有 `.exe`。
- 构建完成后脚本会给 Linux host 设置可执行权限。

手动确认：

```bash
npm run build:audio-host
file electron-app/build/echo-audio-host
test -x electron-app/build/echo-audio-host
```

### ALSA backend 行为

应用层的 shared backend 有两种 Linux 重点路径：

- `Auto`：让 native host 根据当前设备枚举选择可用 shared backend。
- `ALSA`：只选择 ALSA 类型设备，用于明确验证 ALSA 链路。

PipeWire 系统通常通过 ALSA compatibility layer 暴露设备，所以很多现代发行版也可以走 ALSA 路径。但文档和发布说明里仍应写“ALSA 路径”，不要把 PipeWire 原生支持写成已完成。

## 8. 推荐构建流程

从干净 Linux x64 环境开始：

```bash
npm ci
npm run verify:ffmpeg
npm run test:audio-engine
npm run build:linux
```

如果只是重复打包，并且依赖和工具链没有变化：

```bash
npm run verify:ffmpeg
npm run build:linux
```

如果正在排查 audio host：

```bash
npm run build:audio-host
npm run test:audio-engine
```

如果只想先确认前端/主进程能编译：

```bash
npm run build
```

## 9. `build:linux` 做了什么

`package.json` 中：

```text
npm run build:linux
```

实际执行：

```text
node scripts/build-linux.mjs
```

脚本会按顺序做这些事：

1. 检查 `process.platform === "linux"`。
2. 检查 `process.arch === "x64"`。
3. 检查 `electron-app/tools-linux/ffmpeg` 存在且可执行。
4. 执行 `npm run rebuild:native`。
5. 执行 `npm run verify:ffmpeg`。
6. 执行 `npm run build:audio-host`。
7. 检查 `electron-app/build/echo-audio-host` 存在且可执行。
8. 执行 `npm run build`。
9. 执行 `electron-builder --linux`。
10. 检查打包后的 `resources/echo-audio-host`。
11. 检查打包后的 `resources/tools/ffmpeg`。
12. 如果源码目录有 `yt-dlp`，检查打包后的 `resources/tools/yt-dlp`。
13. 检查 `dist/` 下是否有 `.AppImage`。
14. 检查 `dist/` 下是否有 `.deb`。

只要其中任一步失败，脚本会停止。不要跳过失败继续发布。

## 10. electron-builder Linux 配置

Linux 配置在 `package.json` 的 `build.linux`：

```text
build.linux.icon = software.png
build.linux.target = AppImage x64 + deb x64
build.linux.category = AudioVideo
```

Linux extra resources：

```text
electron-app/build/echo-audio-host -> resources/echo-audio-host
electron-app/tools-linux -> resources/tools
```

也就是说，Linux 包里的 audio host 和 FFmpeg 都不是从 Windows 资源目录拿的。

预期产物：

```text
dist/linux-unpacked/resources/echo-audio-host
dist/linux-unpacked/resources/tools/ffmpeg
dist/*.AppImage
dist/*.deb
```

如果存在 `yt-dlp`：

```text
dist/linux-unpacked/resources/tools/yt-dlp
```

产包后检查权限：

```bash
test -x dist/linux-unpacked/resources/echo-audio-host
test -x dist/linux-unpacked/resources/tools/ffmpeg
test ! -f dist/linux-unpacked/resources/tools/yt-dlp || test -x dist/linux-unpacked/resources/tools/yt-dlp
```

## 11. 本地启动和桌面验收

### AppImage

```bash
chmod +x dist/*.AppImage
./dist/*.AppImage
```

### deb

```bash
sudo apt install ./dist/*.deb
```

安装后从桌面启动器或命令行启动。

### 最小验收

用小曲库验收，不要一上来导入超大库：

1. 启动应用。
2. 首次启动能进入主界面。
3. 导入一个小型本地音乐文件夹。
4. Songs 页面能显示歌曲。
5. Albums 页面能显示基本专辑信息。
6. 播放 WAV。
7. 播放 FLAC。
8. 播放 MP3。
9. 暂停、继续、上一首、下一首正常。
10. 切换曲目不会提前结束。
11. 进度不会异常跳动。

### Linux 输出验收

按顺序验收：

1. `System` 输出播放一首歌。
2. `Shared` + `Auto` 播放一首歌。
3. `Shared` + `ALSA` 播放一首歌。
4. 在 `ALSA` 下切换曲目。
5. 在 `ALSA` 下暂停 / 继续。
6. 在 `ALSA` 下拖动进度。
7. 打开播放诊断或专业状态面板，确认 output mode / backend 与选择一致。

### Linux 能力边界验收

确认 Linux 上不要出现错误可用的 Windows-only 能力：

- WASAPI Exclusive 不应作为 Linux 可用输出能力出现。
- ASIO 不应作为 Linux 可用输出能力出现。
- DirectSound 不应作为 Linux 可用 shared backend 出现。
- SMTC 相关能力不应被当作 Linux 桌面集成能力。

如果 UI 上能看到某些灰掉或说明性质的 Windows-only 文案，要确认它不会被误认为 Linux 可用路径。

## 12. 建议验收矩阵

发布前至少覆盖：

| 维度 | 最小要求 |
| --- | --- |
| 包格式 | AppImage、deb |
| 音频格式 | WAV、FLAC、MP3 |
| 输出模式 | System、Shared + Auto、Shared + ALSA |
| 曲库 | 小曲库导入和基础浏览 |
| 播放控制 | 播放、暂停、继续、切歌、拖动进度 |
| 平台隔离 | Windows-only 输出不在 Linux 上误暴露 |

有条件时增加：

| 维度 | 建议 |
| --- | --- |
| 发行版 | Ubuntu LTS、Debian stable、Fedora 或 Arch 派生环境 |
| 音频服务 | PulseAudio、PipeWire with ALSA compatibility |
| 设备 | 内置声卡、USB DAC、蓝牙输出 |
| 时间 | 连续播放 30 分钟以上 |
| 曲库 | 中型曲库扫描后播放 |

不要把所有压力混在一轮里。先确认播放，再确认扫描，再确认长时间稳定性。这样出现问题时更好定位。

## 13. 常见失败和处理

### 13.1 在 Windows 上运行 `build:linux`

现象：

```text
[build:linux] Linux packages must be built on Linux x64.
```

处理：

- 切到 Linux x64。
- 使用 WSL2 / VM / CI runner。
- 不要绕过脚本的平台检查。

### 13.2 架构不是 x64

现象：

```text
[build:linux] Linux packaging currently supports x64 only.
```

处理：

- 换 x64 runner。
- arm64 支持要另做构建链、依赖、产物和验收，不要直接复用 x64 文档。

### 13.3 找不到 Linux FFmpeg

现象：

```text
[build:linux] Missing Linux ffmpeg
```

处理：

```bash
ls -l electron-app/tools-linux/ffmpeg
file electron-app/tools-linux/ffmpeg
chmod +x electron-app/tools-linux/ffmpeg
```

确认它是 Linux ELF x86-64 文件。

### 13.4 FFmpeg 不可执行

现象：

```text
[build:linux] Linux ffmpeg is not executable
```

处理：

```bash
chmod +x electron-app/tools-linux/ffmpeg
```

如果是在 CI artifact 解压后丢失权限，也要在 CI 里显式 `chmod +x`。

### 13.5 manifest hash 不匹配

现象：

```text
[verify:ffmpeg] SHA256 mismatch
```

处理：

```bash
sha256sum electron-app/tools-linux/ffmpeg
```

把 manifest 的 `sha256` 更新为当前文件 hash。注意：如果 FFmpeg 来源不可信，先换可信二进制，不要为了过校验直接改 hash。

### 13.6 manifest 版本不匹配

现象：

```text
[verify:ffmpeg] Version output does not contain "..."
```

处理：

```bash
electron-app/tools-linux/ffmpeg -hide_banner -version
```

把 manifest 的 `version` 改成输出中真实存在的稳定片段。

### 13.7 缺少 `aresample`

现象：

```text
[verify:ffmpeg] Required FFmpeg filter is missing: aresample
```

处理：

- 换带 `aresample` 的 FFmpeg。
- 不建议移除 `requiredFilters` 来绕过，因为音频链路依赖重采样能力。

### 13.8 缺少 `libsoxr`

现象：

```text
[verify:ffmpeg] FFmpeg build configuration does not include --enable-libsoxr
```

处理：

- 使用带 `--enable-libsoxr` 的 FFmpeg。
- 或在确认发布策略允许后，把 `requiresSoxr` 改成 `false`。

### 13.9 `npm ci` 失败

处理：

- 确认 Node.js 是 20 LTS。
- 删除当前 Linux 环境的 `node_modules` 后重新 `npm ci`。
- 不要复用 Windows `node_modules`。
- 如果是网络问题，先处理 npm registry / proxy，不要改业务代码。

### 13.10 native module ABI 问题

可能表现为 `better-sqlite3` 加载失败或 Electron ABI 不匹配。

处理：

```bash
npm run rebuild:native
```

然后重新：

```bash
npm run build:linux
```

### 13.11 audio host 编译失败

现象：

```text
[build:audio-host] Failed to build JUCE audio host.
```

优先检查：

```bash
cmake --version
g++ --version
pkg-config --modversion alsa
```

再确认依赖：

```bash
sudo apt install cmake g++ pkg-config libasound2-dev libfreetype-dev libfontconfig1-dev
```

如果日志里是 JUCE 拉取失败，先处理网络或 CMake FetchContent 缓存，不要先改 audio host 代码。

### 13.12 electron-builder 没产出 AppImage / deb

检查：

```bash
ls -la dist
```

确认 `package.json` 里的 Linux target 仍包含：

```text
AppImage x64
deb x64
```

如果只缺某一种包，优先看 electron-builder 输出，不要直接改构建脚本绕过检查。

### 13.13 AppImage 启动失败

先执行：

```bash
chmod +x dist/*.AppImage
./dist/*.AppImage
```

FUSE 相关问题按发行版安装 FUSE runtime。临时分析可用：

```bash
./dist/*.AppImage --appimage-extract
```

但发布验收仍要回到标准 AppImage 启动路径。

### 13.14 deb 安装失败

执行：

```bash
sudo apt install ./dist/*.deb
```

保留 apt 输出。常见方向：

- 目标系统依赖缺失。
- deb metadata 不适配目标发行版。
- 本机已有旧安装残留。

不要用强制安装掩盖依赖问题作为发布验收结论。

### 13.15 Linux 下没有声音

先分层确认：

1. 系统播放器是否有声音。
2. ECHO `System` 输出是否有声音。
3. ECHO `Shared + Auto` 是否有声音。
4. ECHO `Shared + ALSA` 是否有声音。
5. 只有某个文件无声，还是所有格式无声。
6. 只有某个设备无声，还是所有设备无声。

可用系统命令辅助：

```bash
aplay -l
pactl info
```

如果 `System` 正常但 `ALSA` 不正常，优先看 ALSA 设备枚举和 audio host 日志。如果所有输出都不正常，先看系统音频服务和应用启动日志。

## 14. CI 示例流程

CI runner 要是 Linux x64。最小流程：

```bash
npm ci
chmod +x electron-app/tools-linux/ffmpeg
test ! -f electron-app/tools-linux/yt-dlp || chmod +x electron-app/tools-linux/yt-dlp
npm run verify:ffmpeg
npm run test:audio-engine
npm run build:linux
```

CI 可以缓存：

- npm cache。
- Electron 下载缓存。
- FFmpeg artifact。
- CMake 下载缓存。

不要跨平台缓存：

- Windows `node_modules`。
- Windows native module build output。
- Windows `electron-app/build/echo-audio-host.exe`。
- Windows `electron-app/tools/`。

CI 构建通过只说明包能产出，不说明真实桌面音频已经验收。发布前仍要做 Linux 桌面手动验收。

## 15. 发布前检查清单

产物：

- `dist/*.AppImage` 存在。
- `dist/*.deb` 存在。
- `dist/linux-unpacked/resources/echo-audio-host` 存在。
- `dist/linux-unpacked/resources/echo-audio-host` 可执行。
- `dist/linux-unpacked/resources/tools/ffmpeg` 存在。
- `dist/linux-unpacked/resources/tools/ffmpeg` 可执行。
- 如果带 `yt-dlp`，打包后也存在且可执行。

基础应用：

- AppImage 能启动。
- deb 安装后能启动。
- 首次启动能进入主界面。
- 小曲库能导入。
- Songs / Albums 基础显示正常。

播放：

- WAV 可播放。
- FLAC 可播放。
- MP3 可播放。
- 暂停 / 继续正常。
- 切歌正常。
- 拖动进度正常。
- 没有明显提前结束。
- 没有明显异常跳进度。

输出：

- `System` 可播放。
- `Shared + Auto` 可播放。
- `Shared + ALSA` 可播放。
- 诊断状态显示和实际输出选择一致。

平台边界：

- WASAPI Exclusive 没有作为 Linux 可用能力出现。
- ASIO 没有作为 Linux 可用能力出现。
- DirectSound 没有作为 Linux 可用 shared backend 出现。
- Windows SMTC 相关能力没有被当作 Linux 能力。

发布说明：

- 标明 Linux 当前是 x64。
- 标明包格式是 AppImage / deb。
- 标明 ALSA 是当前明确支持的 shared native backend。
- 不承诺 JACK / PipeWire native / Linux exclusive HiFi，除非后续已经真实实现并验收。

## 16. 维护原则

Linux 构建和 ALSA 支持后续继续按低风险方式推进：

- 构建链问题先定位环境和脚本，不要先动播放核心。
- FFmpeg 问题先看 manifest、hash、filter、权限和二进制来源。
- ALSA 问题先看设备枚举、backend 选择和 audio host 日志。
- 新增 Linux backend 要保持 Windows 行为隔离。
- 发布前优先做小曲库和播放链路验收，再做大曲库压力。
- 任何可能影响播放稳定性的改动，都要有针对性验证，不能只凭构建通过判断。

---

# ECHO Next Network Metadata Completion

Source: docs/ECHO_NEXT_NETWORK_METADATA.md
Kind: legacy-doc
Locale: und

# ECHO Next Network Metadata Completion

Network metadata is weak completion. It is never a second metadata reader and never a replacement for embedded tags, sidecar files, folder structure, or manual edits.

## Readiness States

Tracks persist explicit readiness:

- `embedded_metadata_status`: `pending`, `reading`, `present`, `missing`, `error`
- `embedded_cover_status`: `pending`, `reading`, `present`, `missing`, `error`
- `network_metadata_status`: `none`, `pending`, `candidate_found`, `applied_missing_only`, `rejected`, `error`

`pending` and `reading` mean "not ready yet", not "absent". Network completion must not treat null fields, fallback display values, or missing cover ids as proof that embedded data is absent.

## Three-Phase Flow

Phase A: Local Metadata Read

- `FileScanner` discovers files.
- `MetadataReader` reads embedded tags and marks embedded metadata `present`, `missing`, or `error`.
- `CoverExtractor` reads embedded/folder cover and marks embedded cover `present`, `missing`, or `error`.
- `tracks` and `covers` are written only after local readers finish.

Phase B: Local Finalize

- Album grouping and artist refresh run from local rows.
- Tracks and albums are usable immediately.
- UI is not blocked by network completion.

Phase C: Network Completion

- Manual trigger only.
- Provider results first go to candidate tables.
- High-confidence candidates may apply missing-only fields.
- Lower-confidence candidates remain visible for review.
- Rejected candidates are recorded and filtered from future prompts.

## Candidate Tables

Network metadata candidates live in `network_metadata_candidates`.

Network decisions live in `network_metadata_decisions` with `applied_fields_json`, so every accepted/rejected/ignored decision is auditable.

Network cover candidates live in `network_cover_candidates`. A network cover URL is never returned to Renderer as artwork. Accepted covers must pass through the cover cache pipeline and become local `thumb`, `album`, and `large` files referenced by `covers`.

## Merge Rules

Metadata priority:

1. manual
2. embedded
3. sidecar/info
4. folder_structure
5. network
6. filename_fallback

Network may write title, artist, album, albumArtist, year, genre, trackNo, and discNo only when:

- `embedded_metadata_status` is `missing` or `error`
- candidate score is at least `0.92` for automatic missing-only application
- the existing field source is `unknown`, `filename_fallback`, or `network`

Network cannot overwrite `manual`, `embedded`, `sidecar`, or `folder_structure`.

Filename fallback cannot overwrite `manual`, `embedded`, `sidecar`, `folder_structure`, or `network`.

Cover priority:

1. manual
2. embedded
3. folder/front/cover
4. network
5. default

Network covers may apply only when:

- `embedded_cover_status` is `missing` or `error`
- current cover source is `default`
- score is at least `0.92`

Network covers never overwrite manual, embedded, or folder covers.

## Scoring

`matchScore.ts` weights title and artist highest, album medium-high, and duration strongly. A duration difference over 10 seconds caps the score below automatic application. If title or artist similarity is weak, a candidate cannot reach high confidence.

Thresholds:

- `score >= 0.92`: eligible for automatic `applyMissingOnly`
- `0.75 <= score < 0.92`: visible candidate, user confirmation required
- `score < 0.75`: filtered or treated as low priority

## Providers

The provider boundary is `NetworkMetadataProvider`.

Current first-pass providers:

- `MockMetadataProvider`: architecture and tests
- `NeteaseCloudMusicProvider`: mainland China-friendly metadata candidates
- `QQMusicProvider`: mainland China-friendly metadata and album-cover URL candidates
- `MusicBrainzProvider`: metadata candidates
- `CoverArtArchiveProvider`: cover boundary placeholder

Providers are not wired into `MetadataReader`. They run behind `NetworkMetadataService` and `NetworkMetadataJobQueue` with concurrency at most 2, timeouts, candidate storage, and failure isolation.

## Why This Avoids The Old ECHO Bug

Old ECHO could see no embedded title/artist/cover yet, assume none existed, and let filename guesses or network data win. ECHO Next stores readiness separately from values:

- Before local read completes, status is `pending` or `reading`.
- Network merge refuses to write metadata while embedded metadata is `pending` or `reading`.
- Network merge refuses to write covers while embedded cover is `pending` or `reading`.
- Once embedded data is `present`, protected field sources prevent network overwrite.
- Only confirmed `missing` or reader `error` opens the missing-only network path.

The important rule is simple: "temporarily unavailable" is not "missing".

---

# ECHO Next 插件创作指南

Source: docs/ECHO_NEXT_PLUGINS.md
Kind: legacy-doc
Locale: und

# ECHO Next 插件创作指南

适用范围：ECHO Next 本地插件系统，当前宿主支持 `apiVersion` 1 和 2，推荐新插件使用 `apiVersion: 2`。

这份文档写给插件作者，也写给第一次打开“插件”页面、心里还没底的人。它会先帮你判断“这个想法适不适合做成插件”，再带你做一个能跑起来的最小插件，最后再讲 manifest、权限、API、面板、provider、导入导出和调试。

目标不是教插件突破宿主限制，而是教你在 ECHO 的安全边界内做出稳定、轻量、不会拖慢播放的扩展。插件应该像一个可靠的小工具：用户知道它要什么权限，出错时能看懂日志，播放音乐时也不会被它拖住。

如果你正在让 AI 帮你写插件，建议先把 [ForAIReadme](./plugin-sdk/ForAIReadme.md) 发给它。那份文档把插件类型、权限、manifest、运行边界和 AI 常见错误整理成了更适合模型执行的清单。

## 一句话模型

ECHO 插件是放在用户数据目录 `plugins/` 下的本地文件夹。宿主读取 `echo.plugin.json`，在受控 VM 沙箱里运行 `plugin.js`，按用户确认的权限暴露一个有限的全局 `echo` API，并把 `panel.html` 当作 sandbox iframe 显示。

插件可以做：

- 注册命令，让用户手动运行小工具。
- 读取当前播放状态，做轻量记录或展示。
- 分页读取曲库公开字段。
- 返回元数据、歌词、封面候选，交给宿主和用户决定是否采用。
- 提供自定义音源搜索候选，并在用户触发播放时返回显式 `http` / `https` 音频 URL。
- 使用插件自己的设置、存储、日志和面板。
- 在 `apiVersion: 2` 下通过宿主受控网络 API 访问 `http` / `https`。

插件不能做：

- 直接访问 Node、Electron、SQLite、主应用 DOM、原生音频 host、解码器、DSP 或输出设备。
- Hook 播放热路径、修改音频 buffer、控制 WASAPI/ASIO/native host 细节。
- 任意读写本机文件。
- 自动写入曲库记录或改源音频文件。
- 后台全库扫描、持续高频轮询、长时间同步阻塞。

ECHO 的核心原则是：插件能扩展体验，但不能牺牲播放稳定性。

## 先判断你的想法适不适合做插件

写代码前先停一分钟，问自己五个问题：

| 问题 | 如果答案是“是” | 建议 |
| --- | --- | --- |
| 只是想加一个按钮、菜单动作或小工具吗 | 是 | 从命令插件开始 |
| 需要显示一块自己的界面吗 | 是 | 用 Panel + Command，面板只负责 UI |
| 需要补充元数据、歌词、封面或音源候选吗 | 是 | 用对应 provider，把最终选择交给 ECHO |
| 需要读曲库但不改文件吗 | 是 | 申请 `library:read`，分页读取 |
| 需要改播放链、DSP、数据库、任意本机文件或主界面 DOM 吗 | 是 | 这不是普通插件能做的事，应改 ECHO 主程序或重新设计需求 |

一个好插件通常从很小的版本开始：先能启动，再能跑一个命令，再加权限，最后才加面板或网络。不要一开始就把“搜索、下载、改标签、写文件、自动播放、复杂 UI”全塞进第一版。

## 推荐创作路线

| 阶段 | 你要产出的东西 | 完成标准 |
| --- | --- | --- |
| 1. 描述想法 | 一句话写清楚插件要帮用户做什么 | 不提实现细节也能听懂 |
| 2. 选类型 | 命令、主题、面板、metadata、lyrics、cover、source provider | 知道它主要入口在哪里 |
| 3. 定权限 | `permissions` 只写真的会用到的权限 | 启用时用户不会被无关权限吓到 |
| 4. 写最小版 | `echo.plugin.json` + `plugin.js` | 插件页能看到、能启用、日志能看到启动信息 |
| 5. 加真实能力 | 读取播放状态、曲库分页、网络请求或 provider 返回候选 | 每一步都能单独重载验证 |
| 6. 收尾发布 | README、错误提示、导出包、发布前检查 | 别人拿到也知道怎么启用、怎么排错 |

如果你只是想先感受一下系统，不要从空白文件开始。ECHO 插件页内置了示例：播放状态面板、命令工具、曲库脚本、自定义音源、主题预设。先点“新建”，跑通后再改成自己的插件，会比盯着空白编辑器舒服很多。

## 快速开始

最快、最不容易迷路的方式是这样：

1. 打开 ECHO 的“插件”页面。
2. 点“打开目录”，确认真实插件目录。目录通常是 Electron `userData/plugins`，但不要硬猜路径，以插件页打开的目录为准。
3. 如果你还没想好结构，先在插件页点一个示例插件的“新建”。
4. 打开示例目录，看 `echo.plugin.json` 声明了什么，再看 `plugin.js` 注册了什么。
5. 每次只改一小段，保存后回到插件页点“重载”；如果改了 manifest，再点“刷新”。
6. 启用插件时认真看权限确认。权限越少，用户越容易信任。
7. 出错先看插件详情里的日志，不要马上扩大改动。把代码删回最小能启动的状态，再一段一段加回来。

如果你更想从零开始，下一节可以直接照抄。

## 零基础照着做第一个插件

这一节按“完全没写过 ECHO 插件”的用户来写。你只要会新建文件、复制文本、保存文件，就能先跑起来一个插件。

### 你需要准备什么

| 工具 | 用来做什么 |
| --- | --- |
| ECHO NEXT | 打开插件页面、创建示例、启用插件、看日志 |
| 一个文本编辑器 | 记事本也行，VS Code 更舒服 |
| 一个小音乐库 | 用来测试播放状态、曲库读取、provider 结果 |

建议先用一个只有几十首歌的小曲库试插件。插件写错了通常不会伤到主程序，但大库、网络请求和 provider 组合在一起时，排错会变得很吵。

不要一上来就改 ECHO 主程序源码。普通插件只需要放进 ECHO 打开的 `plugins/` 目录里。你要交付给别人的也是这个插件文件夹或导出的插件包，不是 ECHO 源码改动。

### 第 1 步：找到插件目录

1. 打开 ECHO NEXT。
2. 进入 `Plugins` / “插件”页面。
3. 点击“打开目录”。
4. 系统会打开一个文件夹，这就是插件目录。
5. 以后所有插件文件夹都放在这里。

不要自己猜路径。不同系统、便携版、开发版的用户数据目录可能不一样，以 ECHO 打开的目录为准。

### 第 2 步：新建插件文件夹

在刚才打开的插件目录里，新建一个文件夹：

```text
echo.hello-plugin
```

文件夹名建议和插件 id 一样。插件 id 只能用小写字母、数字、`.`、`_`、`-`，并且要用小写字母或数字开头。新手直接照这个格式写：

```text
echo.你的插件名
```

例如：

```text
echo.my-tool
echo.playback-note
echo.aurora-theme
```

### 第 3 步：写 `echo.plugin.json`

进入 `echo.hello-plugin` 文件夹，新建文件：

```text
echo.plugin.json
```

把下面内容完整复制进去：

```json
{
  "id": "echo.hello-plugin",
  "name": "Hello Plugin",
  "version": "0.0.1",
  "apiVersion": 2,
  "entry": "plugin.js",
  "permissions": [],
  "contributes": {
    "commands": [
      {
        "id": "hello",
        "title": "Hello"
      }
    ]
  }
}
```

这个文件告诉 ECHO：

| 字段 | 你现在先这样理解 |
| --- | --- |
| `id` | 插件的唯一名字，不能和别的插件重复 |
| `name` | 插件页面显示给人看的名字 |
| `version` | 插件版本，先写 `0.0.1` |
| `apiVersion` | 新插件写 `2` |
| `entry` | 插件启动时执行哪个 JS 文件 |
| `permissions` | 插件要什么权限；这个 Hello 插件不需要权限 |
| `contributes.commands` | 告诉 UI：这个插件有一个叫 `hello` 的命令 |

### 第 4 步：写 `plugin.js`

同一个文件夹里再新建文件：

```text
plugin.js
```

把下面内容完整复制进去：

```js
console.log('hello plugin loaded');

echo.commands.register('hello', { title: 'Hello' }, async () => {
  await echo.ui.notify('Hello from ECHO plugin');
  return { ok: true, message: 'Hello from ECHO plugin' };
});
```

这段代码做了三件事：

1. 插件启动时写一条日志。
2. 注册一个叫 `hello` 的命令。
3. 用户运行命令时，发一个通知，并返回一段 JSON。

注意：`echo.plugin.json` 里的命令 id 和 `plugin.js` 里的命令 id 必须一样。这里都叫 `hello`。

### 第 5 步：确认文件结构

现在你的插件目录应该长这样：

```text
plugins/
  echo.hello-plugin/
    echo.plugin.json
    plugin.js
```

如果文件名写成下面这样，ECHO 可能找不到：

```text
echo.plugin.json.txt
plugin.js.txt
Echo.Plugin.Json
Plugin.JS
```

Windows 记事本容易把文件保存成 `.txt`。如果你看不到扩展名，先在资源管理器里打开“显示文件扩展名”。

### 第 6 步：回到 ECHO 刷新

1. 回到 ECHO 的插件页面。
2. 点击“刷新”。
3. 你应该能看到 `Hello Plugin`。
4. 如果看不到，先检查文件夹名、`echo.plugin.json` 文件名、JSON 逗号有没有写错。

### 第 7 步：启用插件

1. 点开 `Hello Plugin`。
2. 点击“启用”。
3. 这个插件没有权限，所以不需要额外信任危险权限。
4. 启用后看插件日志，应该有 `hello plugin loaded`。

如果启用时报错，先看插件详情里的日志。ECHO 会把启动错误写在那里。

### 第 8 步：运行命令

插件启用后，在插件详情里找到命令 `Hello`，点击运行。你应该看到：

- 插件通知：`Hello from ECHO plugin`
- 日志里有命令运行记录。

到这里，第一个插件已经成功了。

如果通知没出来但插件没有报错，先刷新日志；如果日志里出现 `plugin_command_not_found`，说明 manifest 声明的命令 id 和 `plugin.js` 注册的命令 id 不一致；如果出现 `plugin_command_timeout`，说明命令执行超过约 2 秒，需要把耗时逻辑拆小。

### 第 9 步：修改插件后怎么生效

你改了 `plugin.js` 或 `echo.plugin.json` 之后：

1. 保存文件。
2. 回到插件页面。
3. 点击这个插件的“重载”。
4. 如果改了 manifest 但页面没变，点击“刷新”。

不要一边改文件一边期待 ECHO 自动立刻发现。插件系统当前按“刷新/重载”更新。

从这里开始，每次只加一种能力：

| 下一步想做什么 | 先加什么 | 先验证什么 |
| --- | --- | --- |
| 读播放状态 | `permissions: ["playback:read"]`，再调用 `echo.playback.getStatus()` | 命令能返回当前状态 |
| 读曲库 | `permissions: ["library:read"]`，用分页读取 | `pageSize` 不超过 100 |
| 做面板 | 增加 `panel.html` 和 `contributes.panels` | 面板能通过 `plugin:getSummary` 收到响应 |
| 访问网络 | `apiVersion: 2` + `network` 权限，使用 `echo.net.fetchJson/fetchText` | 超时、失败状态能写日志 |
| 做 provider | manifest 声明 provider，`plugin.js` 注册同 id provider | 搜索或候选结果能被 ECHO 收到 |

## 最小主题插件

如果你只是想做主题，不需要写复杂 JS。主题插件主要写 manifest，`plugin.js` 可以只放一行日志。

文件结构：

```text
plugins/
  echo.simple-theme/
    echo.plugin.json
    plugin.js
```

`echo.plugin.json`：

```json
{
  "id": "echo.simple-theme",
  "name": "Simple Theme",
  "version": "0.0.1",
  "apiVersion": 2,
  "entry": "plugin.js",
  "permissions": [],
  "contributes": {
    "themePresets": [
      {
        "id": "simple-blue",
        "title": "Simple Blue",
        "description": "一个最小主题示例。",
        "basePreset": "classic",
        "preview": "linear-gradient(135deg, #10243a 0%, #5cc8dc 100%)",
        "swatches": ["#10243a", "#5cc8dc", "#ffffff"],
        "light": {
          "appBg": "#eef8ff",
          "panel": "#ffffff",
          "accent": "#257f96",
          "text": "#234150"
        },
        "dark": {
          "appBg": "#08111f",
          "panel": "#142234",
          "accent": "#5cc8dc",
          "text": "#c8dce8"
        }
      }
    ]
  }
}
```

`plugin.js`：

```js
console.log('simple theme plugin loaded');
```

启用插件后，进入 `Settings` / “设置” > “外观”，找到“插件主题”，点击主题卡片。ECHO 会把它导入到“我的主题”，之后你还可以继续微调颜色、透明度、圆角和动效。

主题插件常见错误：

| 错误 | 结果 | 正确写法 |
| --- | --- | --- |
| 颜色写 `red` | 会被忽略 | 写 `#ff0000` |
| 颜色写 `#fff` | 会被忽略 | 写 6 位 `#ffffff` |
| 写任意 CSS | 不会生效 | 只写结构化字段 |
| 没有 `light` 也没有 `dark` | 主题会被丢弃 | 至少写一组 |
| `preview` 里写 `url(...)` | 预览会被丢弃 | 只用纯色或 `linear-gradient(...)` |

## 不知道该做哪种插件时先看这里

先按“用户怎么触发它”来选类型，不要按代码复杂度选。

| 你想做什么 | 第一版先做成 | 需要权限吗 | 先别做什么 |
| --- | --- | --- | --- |
| 点一下按钮，弹个提示、复制文本或保存一点小状态 | 命令插件 | 通常不需要 | 不要先做面板 |
| 显示当前播放状态 | 命令插件，跑通后再加面板 | `playback:read` | 不要高频轮询 |
| 控制播放、暂停、跳转 | 命令插件 | `playback:control` | 不要自动连续 seek 或抢用户操作 |
| 统计曲库里有多少歌缺标签 | 命令插件 | `library:read` | 不要一次读完整曲库 |
| 给歌曲提供候选标签 | Metadata Provider | `library:read` | 不要直接写入曲库 |
| 给歌曲提供候选歌词 | Lyrics Provider | `library:read` | 不要返回超大歌词包 |
| 给歌曲提供候选封面 | Cover Provider | `library:read`，可能还要 `network` | 不要下载大图塞进结果 |
| 接入一个第三方音乐搜索源 | Source Provider | `sources:provide`，可能还要 `network` | 不要返回不明确来源的播放 URL |
| 做一个可导入主题 | Theme Preset | 不需要 | 不要写任意 CSS 或脚本注入 |
| 做一个复杂界面 | Panel + Command | 按命令实际用到的 API 申请 | 不要在面板里直接访问 `echo` |

新手推荐顺序：

1. 先做命令插件，因为它最容易看日志、最容易确认成败。
2. 再做主题插件，因为它几乎不需要权限，适合理解 manifest 的贡献点。
3. 再做读取曲库的命令，练习分页和权限。
4. 再做 metadata、lyrics、cover 或 source provider，练习“返回候选，不直接替用户决定”。
5. 最后再做面板。面板体验更好，但多了 `postMessage` 通信，排错成本更高。

记住一个原则：插件应该把“危险动作”交给 ECHO 或用户确认。候选、展示、轻量命令很适合插件；直接改播放链、改数据库、改源文件，不适合普通插件。

## 让 AI 帮你写插件时怎么说

你可以直接把下面这段发给 AI，然后把你的需求补进去。越具体，AI 越不容易生成越界代码。

```text
请按 ECHO Next 插件系统写一个本地插件。
先阅读 docs/ECHO_NEXT_PLUGINS.md 和 docs/plugin-sdk/ForAIReadme.md；如果需要核对真实接口，再看 src/shared/types/plugins.ts、src/main/plugins/PluginManifest.ts、src/main/plugins/PluginService.ts、src/renderer/pages/PluginsPage.tsx。
不要修改 ECHO 主程序源码，只生成插件文件夹内的文件。
使用 apiVersion: 2。
权限最小化，不要申请无关权限。
插件目录名和 id 使用 echo.my-plugin 这种格式。
需要提供 echo.plugin.json、plugin.js、README.md。
如果需要面板，再提供 panel.html，并通过 plugin:runCommand 调用命令。
plugin.js 不要使用 require/import/process/window/document/fetch。
网络访问必须通过 echo.net，并声明 network 权限。
命令和事件 handler 要轻量，超过 2 秒的任务要拆小或返回“已排队”。
请先给出文件结构、manifest、权限理由、使用步骤、调试步骤，再给代码。
我的需求是：在这里写清楚用户怎么触发、要读什么、要展示什么、失败时怎么提示。
```

如果 AI 生成了代码，你要检查：

- 它有没有让你改 `src/main/...` 或 `src/renderer/...`。普通插件不应该改这些。
- 它有没有写 `require`、`import`、`process`、`window`、`document`、`fetch`。
- 它有没有一次申请很多权限。
- 它有没有告诉你把文件放进 ECHO 插件页打开的目录。
- 它有没有写清楚怎么刷新、启用、看日志。
- 它有没有把面板写成“直接调用 `echo`”。面板不能直接拿到 `echo`，要通过 `postMessage` 请求 `plugin:runCommand`。
- 它有没有把长任务写在 `playback:status` 事件里。播放状态事件应该很轻，不要在里面做网络请求、全库查询或大 JSON 写入。
- 它有没有直接采纳第三方返回的数据并写入曲库。普通插件应该返回候选，让 ECHO 和用户决定。

如果 AI 写得太大，先让它缩成“只包含一个命令、一个日志、一种权限”的版本。插件开发里，小而能跑比大而玄学更值钱。

## 常见新手错误

| 现象 | 最可能原因 | 怎么修 |
| --- | --- | --- |
| 插件页看不到插件 | 文件夹没放进插件目录，或 `echo.plugin.json` 文件名错 | 点“打开目录”，确认结构 |
| 插件显示 manifest 错误 | JSON 少逗号、多逗号、引号错 | 用 JSON 校验器检查 |
| `id must use lowercase...` | 插件 id 不符合规则 | 用 `echo.my-plugin` 这种小写格式 |
| `apiVersion must be between 1 and 2` | `apiVersion` 写错或写成字符串 | 新插件写数字 `2` |
| entry 或 panel 不生效 | 写了子目录、绝对路径或错误扩展名 | `entry` 写根目录 `.js` 文件名，`panel` 写根目录 `.html` 文件名 |
| 启用后立刻报错 | `plugin.js` 顶层代码抛错 | 看插件日志，先删到最小代码 |
| 命令不出现 | manifest 里声明了，但 `plugin.js` 没注册 | `contributes.commands[].id` 和 `echo.commands.register` 保持一致 |
| 命令点击没反应 | handler 抛错或超时 | 看日志，减少代码，先返回 `{ ok: true }` |
| 权限不足 | manifest 没写对应权限，或启用时没信任 | 补权限，刷新，再重新启用 |
| 面板里找不到 `echo` | 面板本来就没有 `echo` | 面板用 `postMessage` 调 `plugin:runCommand` |
| 网络请求失败 | 用了 `fetch` 或没申请 `network` | 用 `echo.net.fetchJson/fetchText` |
| 网络请求被拒绝 | 方法、header、URL 或响应大小不符合宿主限制 | 只用 `GET` / `POST`，只传必要 header，控制响应体 |
| 曲库读取很慢 | 一次读太多 | 分页，`pageSize <= 100` |
| provider 有时没结果 | 返回字段过大、数量太多或 handler 超时 | 控制候选数量，先返回小结果，再加缓存 |
| 插件突然被宿主禁用 | 10 分钟内连续启动失败达到隔离阈值 | 修好启动错误后再启用，先用最小代码确认能启动 |
| 导出包里带了缓存 | 手动塞了 `plugin-storage.json` | 删除运行缓存再发布 |

插件目录推荐形态：

```text
plugins/
  echo.my-plugin/
    echo.plugin.json
    plugin.js
    panel.html
    README.md
    echo-plugin.d.ts
```

运行中可能出现这些宿主文件：

```text
plugins/
  plugin-state.json
  echo.my-plugin/
    plugin-storage.json
    plugin-settings.json
```

这些文件是运行状态，不应当手动写入发布包。ECHO 导出插件包时也会排除它们。

## 文件职责

| 文件 | 是否必需 | 作用 |
| --- | --- | --- |
| `echo.plugin.json` | 必需 | 插件 manifest，声明 id、版本、入口、权限和贡献点 |
| `plugin.js` | 通常必需 | 插件入口脚本，在受控 VM 沙箱运行 |
| `panel.html` | 可选 | 插件面板，作为 sandbox iframe 显示 |
| `echo-plugin.d.ts` | 可选 | SDK 类型提示，来自 `docs/plugin-sdk/echo-plugin.d.ts` |
| `README.md` | 可选 | 给自己或用户看的说明 |
| `.css` / `.txt` / `.json` | 可选 | 静态资源或配置，导出包只支持根目录单文件 |

当前导入导出只处理插件根目录下的单文件，不递归子目录。可导出的扩展名是 `.js`、`.mjs`、`.cjs`、`.html`、`.css`、`.json`、`.md`、`.txt`。

## 编辑器类型提示

如果你用 VS Code 或支持 JS 类型检查的编辑器，可以把仓库的 SDK 类型复制到插件目录：

```text
docs/plugin-sdk/echo-plugin.d.ts -> plugins/echo.my-plugin/echo-plugin.d.ts
```

再放一个 `jsconfig.json`：

```json
{
  "compilerOptions": {
    "checkJs": true,
    "types": ["./echo-plugin"]
  }
}
```

这样 `plugin.js` 里访问 `echo.playback.getStatus()`、`echo.metadata.registerProvider()` 等 API 时会有提示。

## Manifest 基础

最小插件：

```json
{
  "id": "echo.my-plugin",
  "name": "我的插件",
  "version": "0.0.1",
  "apiVersion": 2,
  "entry": "plugin.js",
  "permissions": []
}
```

带面板、命令、provider 和插件设置的完整形态：

```json
{
  "id": "echo.metadata-helper",
  "name": "Metadata Helper",
  "version": "0.1.0",
  "apiVersion": 2,
  "minEchoVersion": "26.5.29",
  "entry": "plugin.js",
  "panel": "panel.html",
  "permissions": ["library:read", "network"],
  "contributes": {
    "commands": [
      {
        "id": "lookup-current-track",
        "title": "查询当前曲目"
      }
    ],
    "metadataProviders": [
      {
        "id": "tags",
        "title": "标签候选"
      }
    ],
    "lyricsProviders": [
      {
        "id": "lyrics",
        "title": "歌词候选"
      }
    ],
    "coverProviders": [
      {
        "id": "covers",
        "title": "封面候选"
      }
    ],
    "panels": [
      {
        "id": "main",
        "title": "Metadata Helper",
        "path": "panel.html"
      }
    ],
    "settings": [
      {
        "id": "provider-base-url",
        "title": "Provider URL",
        "type": "string",
        "defaultValue": "https://example.com/api"
      },
      {
        "id": "enable-extra-lookup",
        "title": "Extra lookup",
        "type": "boolean",
        "defaultValue": false
      }
    ]
  }
}
```

字段说明：

| 字段 | 规则 |
| --- | --- |
| `id` | 插件唯一 id，2 到 64 个字符，小写字母或数字开头，可含小写字母、数字、`.`、`_`、`-` |
| `name` | 显示名称，最多约 80 字符 |
| `version` | 插件版本字符串，最多约 40 字符 |
| `apiVersion` | 当前支持 1 到 2，新插件推荐 2 |
| `minEchoVersion` | 可选，仅作为兼容性展示和作者提示 |
| `entry` | 入口脚本文件名，必须是插件根目录内 `.js` 文件，不能写子目录 |
| `panel` | 可选面板文件名，必须是插件根目录内 `.html` 文件 |
| `permissions` | 插件请求权限，用户启用时确认 |
| `contributes.commands` | 插件命令声明，UI 可以展示 |
| `contributes.panels` | 面板入口声明 |
| `contributes.metadataProviders` | 元数据候选 provider |
| `contributes.sourceProviders` | 自定义音源 provider |
| `contributes.lyricsProviders` | 歌词候选 provider |
| `contributes.coverProviders` | 封面候选 provider |
| `contributes.themePresets` | 可导入的自定义主题预设 |
| `contributes.settings` | 插件自己的设置表单 |

注意：manifest 里的贡献点用于展示和声明。真正可运行的命令/provider 仍然要在 `plugin.js` 里注册。

## 主题预设

插件可以通过 `contributes.themePresets` 声明可导入的主题。主题贡献不需要权限，也不需要在 `plugin.js` 里注册逻辑；启用插件后，它会出现在“设置 > 外观”的插件主题区域。用户点击后，ECHO 会把它导入到“我的主题”，之后仍可继续微调、导出或删除。

主题插件只能提供结构化主题参数，不能注入任意 CSS。颜色只接受 `#RRGGBB`，数值会被宿主夹在安全范围内，`preview` 只接受纯色或 `linear-gradient(...)` 预览。每个主题至少要提供 `light` 或 `dark` 其中一组覆盖。

每个插件最多贡献 12 个主题。`light` / `dark` 可覆盖的颜色字段包括 `appBg`、`appBg2`、`appBg3`、`panel`、`panelSoft`、`accent`、`accentStrong`、`secondary`、`heading`、`text`、`muted`、`border`、`onAccent`、`buttonText`、`titlebar`、`sidebar`、`player`、`field`、`row`、`rowHover`、`rowActive`、`chip`、`focus`、`danger`、`success`、`warning`。

可覆盖的数值字段：`panelOpacityPercent` 40-100，`glassPercent` 0-80，`shadowPercent` 0-100，`cornerRadiusPx` 0-28，`panelBlurPx` 0-32，`saturationPercent` 60-140，`motionEnabled` 布尔值，`motionSpeedSeconds` 0.12-8，`motionIntensityPercent` 0-160。

```json
{
  "id": "echo.aurora-theme",
  "name": "Aurora Theme",
  "version": "0.1.0",
  "apiVersion": 2,
  "entry": "plugin.js",
  "permissions": [],
  "contributes": {
    "themePresets": [
      {
        "id": "aurora-glass",
        "title": "Aurora Glass",
        "description": "高透明玻璃、冷色背景和暖色强调。",
        "basePreset": "classic",
        "preview": "linear-gradient(135deg, #08111f 0%, #183b56 48%, #f0b35b 100%)",
        "swatches": ["#08111f", "#183b56", "#f0b35b", "#e8f8ff"],
        "light": {
          "appBg": "#eef8ff",
          "panel": "#ffffff",
          "accent": "#257f96",
          "text": "#234150",
          "panelOpacityPercent": 78,
          "glassPercent": 26,
          "cornerRadiusPx": 10,
          "panelBlurPx": 18,
          "saturationPercent": 108
        },
        "dark": {
          "appBg": "#08111f",
          "panel": "#142234",
          "accent": "#5cc8dc",
          "text": "#c8dce8",
          "panelOpacityPercent": 72,
          "glassPercent": 34,
          "cornerRadiusPx": 10,
          "panelBlurPx": 22,
          "motionIntensityPercent": 90
        }
      }
    ]
  }
}
```

## API 版本选择

推荐直接使用 `apiVersion: 2`。

`apiVersion: 1` 的行为：

- `echo.settings.get()` 读取应用设置快照。
- `echo.settings.set(patch)` 写应用设置 patch，需要 `settings:write`，风险高。
- `echo.net` 不可用。
- 仍兼容早期示例插件。

`apiVersion: 2` 的行为：

- `echo.settings.get(key)` / `getAll()` / `set(...)` 只读写本插件自己的设置，不再写全局应用设置。
- `echo.net.fetchJson()` / `fetchText()` 可用，但必须声明并被用户信任 `network` 权限。
- 可以声明 `lyricsProviders`、`coverProviders`、`settings`。

除非你在维护旧插件，否则不要用 v1 写应用全局设置。新插件的配置应放在 `contributes.settings` 里。

## 权限设计

插件默认禁用。启用时用户必须确认 manifest 里请求的所有权限。缺少信任权限时，API 会抛出 `plugin_permission_denied:*`。

写权限时把自己当成用户：如果一个插件说“我只是显示当前播放”，却申请了 `network`、`settings:write`、`sources:provide`，用户很难放心启用。权限不是能力清单越多越专业，而是越少越可信。

推荐写法是“用到什么，申请什么，并在 README 里解释为什么”：

```md
权限说明：
- playback:read：读取当前播放状态，用来显示正在播放的歌曲。
- network：访问我配置的歌词 API，只在用户点击“查询歌词”时触发。
```

不推荐写法：

```json
"permissions": ["playback:read", "playback:control", "library:read", "settings:write", "network"]
```

除非每个权限都有明确功能，否则这种写法会让用户和维护者都很难判断风险。

| 权限 | 状态 | 风险 | 说明 |
| --- | --- | --- | --- |
| `playback:read` | 已开放 | 低 | 读取当前播放状态、曲目 id、进度、音频状态快照 |
| `playback:control` | 已开放 | 中 | 播放、暂停、停止、跳转 |
| `library:read` | 已开放 | 中 | 分页读取曲库摘要和公开曲目字段，也用于 metadata、lyrics、cover provider |
| `sources:provide` | 已开放 | 中 | 注册自定义音源搜索和播放解析 |
| `settings:read` | 已开放 | 中 | v1 读取应用设置；v2 插件设置不需要它 |
| `settings:write` | 已开放 | 高 | v1 写应用设置 patch；新插件尽量不要申请 |
| `network` | 已开放 | 高 | v2 通过宿主受控 API 访问 `http` / `https` |
| `fs:plugin` | 受限 | 中 | 不开放任意文件 API，插件存储请用 `echo.storage` |
| `library:write` | 预留 | 高 | 当前不提供实际曲库写入 API |

权限最小化建议：

- 只展示播放状态：只申请 `playback:read`。
- 控制播放：再加 `playback:control`。
- 做曲库统计、元数据、歌词、封面候选：申请 `library:read`。
- 做自定义音源：申请 `sources:provide`。
- 访问第三方 API：使用 `apiVersion: 2` 并申请 `network`。
- 不要为了“以后可能用”提前申请高风险权限。

权限改动后，要回到插件页刷新并重新确认启用。用户已经信任过的旧权限，不代表新权限会自动被信任。

## `plugin.js` 运行环境

`plugin.js` 在 Node `vm` 沙箱中运行，但不是普通 Node 脚本。

可用全局对象：

- `echo`
- `console.log` / `console.warn` / `console.error`
- `setTimeout`
- `clearTimeout`

不可用：

- `require`
- `import`
- `process`
- `window`
- `document`
- Node 文件系统、网络、数据库、Electron 模块

入口脚本同步启动阶段最多运行约 1 秒。不要在文件顶层做重 CPU 工作。网络、曲库查询、批处理都应放进命令或 provider handler 里，并保持短小。

最小入口：

```js
console.log('plugin loaded');

echo.commands.register('hello', { title: 'Hello' }, async () => {
  await echo.ui.notify('Hello from plugin');
  return { ok: true };
});
```

## 公开 API 总览

| API | 权限 | 用途 |
| --- | --- | --- |
| `echo.events.on(eventName, handler)` | 视事件而定 | 监听宿主事件 |
| `echo.commands.register(id, options, handler)` | 无固定权限 | 注册可由宿主或面板触发的命令 |
| `echo.playback.getStatus()` | `playback:read` | 获取播放状态 |
| `echo.playback.play/pause/stop/seek()` | `playback:control` | 控制播放 |
| `echo.library.getSummary()` | `library:read` | 获取曲库摘要 |
| `echo.library.getTracks(query)` | `library:read` | 分页读取公开曲目字段 |
| `echo.metadata.registerProvider(...)` | `library:read` | 返回元数据候选 |
| `echo.lyrics.registerProvider(...)` | `library:read` | 返回歌词候选 |
| `echo.covers.registerProvider(...)` | `library:read` | 返回封面候选 |
| `echo.sources.registerProvider(...)` | `sources:provide` | 返回音源候选和播放 URL |
| `echo.settings.get/getAll/set` | v2 为插件设置 | 读写插件自己的设置 |
| `echo.net.fetchJson/fetchText` | `network` + v2 | 宿主受控网络请求 |
| `echo.storage.get/set` | 无任意 FS | 读写插件自己的小型 JSON 存储 |
| `echo.ui.notify(message)` | 无固定权限 | 写插件日志通知 |

## 事件

当前开放事件：

| 事件 | 权限 | 频率与含义 |
| --- | --- | --- |
| `playback:status` | `playback:read` | 播放状态合并推送，约 500ms 节流，也就是最多约 2Hz |
| `library:changed` | `library:read` | 曲库变化信号，payload 不保证长期稳定，只当刷新信号用 |

示例：

```js
const unsubscribe = echo.events.on('playback:status', async (status) => {
  await echo.storage.set('lastStatus', {
    state: status.state,
    trackId: status.currentTrackId,
    positionSeconds: Math.round(status.positionSeconds || 0)
  });
});

echo.commands.register('stop-listening', { title: '停止监听' }, () => {
  unsubscribe();
});
```

事件 handler 最多约 2 秒，超时会记录 `plugin_event_handler_timeout`。不要在 `playback:status` 里做网络请求、全库查询或大 JSON 写入。

## 命令

命令适合用户手动触发的动作，例如“记录当前播放”“查询当前曲目”“导出一个小摘要”。

```js
echo.commands.register('copy-now-playing', { title: '记录当前播放' }, async () => {
  const status = await echo.playback.getStatus();
  await echo.storage.set('lastCommandResult', {
    trackId: status.currentTrackId,
    state: status.state,
    savedAt: new Date().toISOString()
  });
  await echo.ui.notify('已记录当前播放状态。');
  return { ok: true };
});
```

命令限制：

- 参数 JSON 最大约 64 KB。
- 返回 JSON 最大约 256 KB。
- 执行超时约 2 秒。
- 失败会写入插件日志。

如果任务超过 2 秒，应拆成多次手动命令，或只返回“已排队”的轻量结果。当前插件系统不适合做长驻后台任务。

## 播放状态与播放控制

读取状态：

```js
const status = await echo.playback.getStatus();
console.log(status.state, status.currentTrackId, status.positionSeconds);
```

控制播放：

```js
await echo.playback.pause();
await echo.playback.seek(60);
await echo.playback.play();
```

播放控制是中风险能力。插件不要自动根据高频事件连续 `seek()` 或 `play/pause()`，否则会破坏用户操作和播放稳定性。

## 曲库读取

曲库 API 永远要分页。

```js
const page = await echo.library.getTracks({
  page: 1,
  pageSize: 50,
  search: 'artist or title',
  sort: 'recent',
  sourceProvider: 'local',
  fields: ['id', 'title', 'artist', 'album', 'duration', 'coverThumb']
});
```

限制：

- `pageSize` 最大 100，默认 50。
- `search` 最大约 120 字符。
- 默认字段：`id`、`mediaType`、`path`、`title`、`artist`、`album`、`duration`、`coverThumb`、`unavailable`。
- 可选字段以 `docs/plugin-sdk/echo-plugin.d.ts` 和 `src/shared/types/plugins.ts` 为准。

分页批处理建议：

```js
echo.commands.register('count-missing-album', { title: '统计缺少专辑的曲目' }, async () => {
  let page = 1;
  let missing = 0;

  while (page <= 20) {
    const result = await echo.library.getTracks({
      page,
      pageSize: 100,
      fields: ['id', 'title', 'album']
    });

    missing += result.items.filter((track) => !track.album).length;
    if (!result.hasMore) break;
    page += 1;

    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  await echo.ui.notify(`前 ${page} 页里有 ${missing} 首缺少专辑。`);
  return { missing, scannedPages: page };
});
```

不要一次拉完整曲库。大型曲库会跨进程传输大量 JSON，影响 UI 和播放响应。

## 元数据 Provider

Metadata Provider 返回候选标签，不直接写曲库。宿主会裁剪字段、展示候选，并由用户决定是否采用。

Manifest：

```json
{
  "permissions": ["library:read"],
  "contributes": {
    "metadataProviders": [
      { "id": "tags", "title": "标签候选" }
    ]
  }
}
```

`plugin.js`：

```js
echo.metadata.registerProvider('tags', { title: '标签候选' }, async ({ track }) => {
  if (!track.title || !track.artist) {
    return { candidates: [] };
  }

  return {
    candidates: [
      {
        title: track.title,
        artist: track.artist,
        album: track.album,
        genre: 'Alternative',
        year: 2026,
        confidence: 0.8,
        source: 'My Plugin',
        sourceUrl: 'https://example.com'
      }
    ]
  };
});
```

候选字段：

- `title`
- `artist`
- `album`
- `albumArtist`
- `genre`
- `year`
- `trackNo`
- `discNo`
- `bpm`
- `confidence`，范围 0 到 1
- `source`
- `sourceUrl`

限制：

- 单插件最多 8 个 metadata provider。
- 单 provider 每次最多 5 个候选。
- 请求最大约 32 KB，返回最大约 64 KB。
- provider 超时约 2.5 秒。
- 不返回二进制封面，不写文件，不写 SQLite。

## 歌词 Provider

歌词 Provider 返回歌词候选，宿主决定是否预览、应用或缓存。

Manifest：

```json
{
  "apiVersion": 2,
  "permissions": ["library:read"],
  "contributes": {
    "lyricsProviders": [
      { "id": "lyrics", "title": "歌词候选" }
    ]
  }
}
```

`plugin.js`：

```js
echo.lyrics.registerProvider('lyrics', { title: '歌词候选' }, async ({ track }) => {
  if (!track.title) {
    return { candidates: [] };
  }

  return {
    candidates: [
      {
        title: track.title,
        language: 'zh',
        lrc: '[00:00.00]示例歌词',
        source: 'My Lyrics Provider',
        confidence: 0.7
      }
    ]
  };
});
```

候选字段：

- `title`
- `language`
- `lrc`
- `text`
- `source`
- `sourceUrl`
- `confidence`

限制：

- 单插件最多 4 个 lyrics provider。
- 单 provider 每次最多 5 个候选。
- `lrc` / `text` 会被裁剪到约 80 KB。
- 请求最大约 32 KB，返回最大约 128 KB。
- provider 超时约 2.5 秒。

## 封面 Provider

Cover Provider 返回图片 URL 候选。候选必须是 `http` / `https` 图片 URL，宿主负责后续缓存、裁剪、写库决策。

Manifest：

```json
{
  "apiVersion": 2,
  "permissions": ["library:read"],
  "contributes": {
    "coverProviders": [
      { "id": "covers", "title": "封面候选" }
    ]
  }
}
```

`plugin.js`：

```js
echo.covers.registerProvider('covers', { title: '封面候选' }, async ({ track }) => {
  if (!track.album && !track.title) {
    return { candidates: [] };
  }

  return {
    candidates: [
      {
        imageUrl: 'https://example.com/cover.jpg',
        title: track.album || track.title,
        source: 'My Cover Provider',
        width: 1200,
        height: 1200,
        confidence: 0.75
      }
    ]
  };
});
```

限制：

- 单插件最多 4 个 cover provider。
- 单 provider 每次最多 8 个候选。
- `imageUrl` 必须是 `http` / `https`。
- 请求最大约 32 KB，返回最大约 128 KB。
- provider 超时约 2.5 秒。

## 自定义音源 Provider

Source Provider 用于“插件音源”。它只返回搜索候选，并在用户触发播放时解析成显式音频 URL。

它不是远程库同步 provider，也不能写入远程曲库、DSP、解码器或输出链路。

Manifest：

```json
{
  "apiVersion": 2,
  "permissions": ["sources:provide"],
  "contributes": {
    "sourceProviders": [
      { "id": "direct-url", "title": "Direct URL Demo" }
    ]
  }
}
```

`plugin.js`：

```js
const demoTracks = [
  {
    providerTrackId: 'demo-stream',
    title: 'Demo stream',
    artist: 'Local plugin',
    album: 'Custom source',
    duration: null,
    playable: true,
    source: 'Direct URL Demo',
    url: 'https://example.com/audio/demo.mp3'
  }
];

echo.sources.registerProvider('direct-url', { title: 'Direct URL Demo' }, {
  search: async ({ query }) => {
    const needle = String(query || '').toLowerCase();
    return {
      tracks: demoTracks
        .filter((track) => !needle || `${track.title} ${track.artist}`.toLowerCase().includes(needle))
        .map(({ url, ...track }) => track),
      total: demoTracks.length,
      hasMore: false
    };
  },
  resolvePlayback: async ({ providerTrackId }) => {
    const track = demoTracks.find((item) => item.providerTrackId === providerTrackId);
    if (!track) {
      throw new Error('plugin_source_track_not_found');
    }
    return {
      url: track.url,
      mimeType: 'audio/mpeg',
      supportsRange: true
    };
  }
});
```

搜索候选字段：

- `providerTrackId`，必填
- `title`，必填
- `artist`
- `album`
- `albumArtist`
- `duration`
- `coverUrl`
- `webUrl`
- `playable`
- `unavailableReason`
- `source`

播放解析字段：

- `url`，必填，必须是 `http` / `https`
- `expiresAt`
- `mimeType`
- `bitrate`
- `sampleRate`
- `bitDepth`
- `codec`
- `headers`
- `requiresProxy`
- `supportsRange`

限制：

- 单插件最多 4 个 source provider。
- 单 provider 每次最多 25 个搜索候选。
- 搜索请求最大约 32 KB，搜索返回最大约 128 KB。
- 播放解析请求最大约 16 KB，播放解析返回最大约 32 KB。
- provider 超时约 2.5 秒。
- `resolvePlayback` 只应在用户真的要播放时做必要解析，不要在 `search` 里预拉所有播放 URL。

## 插件设置

v2 插件设置由 manifest 声明，宿主在插件详情页渲染表单，并保存到 `plugin-settings.json`。

支持类型：

- `string`
- `select`
- `boolean`
- `number`
- `secret`

示例：

```json
{
  "contributes": {
    "settings": [
      {
        "id": "base-url",
        "title": "API URL",
        "description": "第三方 API 地址",
        "type": "string",
        "defaultValue": "https://example.com"
      },
      {
        "id": "quality",
        "title": "Quality",
        "type": "select",
        "defaultValue": "high",
        "options": [
          { "label": "High", "value": "high" },
          { "label": "Low", "value": "low" }
        ]
      },
      {
        "id": "enabled",
        "title": "Enabled",
        "type": "boolean",
        "defaultValue": false
      },
      {
        "id": "limit",
        "title": "Limit",
        "type": "number",
        "defaultValue": 5,
        "min": 1,
        "max": 25
      },
      {
        "id": "api-key",
        "title": "API Key",
        "type": "secret"
      }
    ]
  }
}
```

读取设置：

```js
const baseUrl = await echo.settings.get('base-url');
const allSettings = await echo.settings.getAll();
```

写入设置：

```js
await echo.settings.set('enabled', true);
await echo.settings.set({ limit: 10 });
```

注意：

- v2 设置是插件自己的命名空间，不写应用全局 settings。
- 宿主会按 manifest 过滤和裁剪设置值。
- `secret` 只是 UI 上用密码框显示，当前不是系统凭据保险箱。不要保存高价值长期密钥。
- 单个设置 patch 最大约 32 KB。
- 插件设置总量最大约 128 KB。
- 插件包导出不包含 `plugin-settings.json`。

## 网络访问

网络访问只在 `apiVersion: 2` 生效，并且必须申请 `network` 权限。

Manifest：

```json
{
  "apiVersion": 2,
  "permissions": ["network"]
}
```

请求 JSON：

```js
const data = await echo.net.fetchJson({
  url: 'https://example.com/api/search?q=test',
  method: 'GET',
  headers: {
    accept: 'application/json'
  },
  timeoutMs: 3000
});
```

请求文本：

```js
const text = await echo.net.fetchText('https://example.com/lyrics.txt');
```

限制：

- 只允许 `http` / `https` URL。
- 只允许 `GET` / `POST`。
- 请求 JSON 最大约 64 KB。
- 响应最大约 512 KB。
- 默认和最大超时约 5 秒。
- 允许的请求 header：`accept`、`accept-language`、`content-type`、`user-agent`。
- `authorization`、`cookie`、`set-cookie`、`x-api-key`、`x-auth-token` 等敏感 header 会被过滤。
- 非 2xx 响应会抛出 `plugin_network_http_<status>`。

网络 provider 编写建议：

- 把网络请求放到用户触发的命令或 provider handler 中。
- 对同一首歌的结果做插件 storage 缓存，但控制大小。
- 不要在 `playback:status` 事件里请求网络。
- 不要用短间隔轮询。
- 对失败返回空候选，并写清楚日志。

## 插件存储

`echo.storage` 用于保存插件自己的小型 JSON 数据。

```js
await echo.storage.set('lastLookup', {
  title: 'Song',
  savedAt: new Date().toISOString()
});

const lastLookup = await echo.storage.get('lastLookup');
```

限制：

- key 最大约 96 字符。
- 单个 value 最大约 64 KB。
- 单插件 storage 总量最大约 256 KB。
- 存储文件是 `plugin-storage.json`。
- 插件包导出不包含 storage。

storage 适合保存缓存索引、上次操作状态、小型配置。不要保存整页曲库、图片二进制、歌词大集合或长日志。

## 面板 `panel.html`

面板作为 sandbox iframe 运行。它不接触主应用 DOM，也不能直接访问 `plugin.js` 里的 `echo` 对象。

面板要和宿主交互，只能通过受控 `postMessage` bridge：

```js
parent.postMessage({
  channel: 'echo:plugin-panel',
  version: 1,
  type: 'request',
  requestId: 'request-1',
  pluginId: 'echo.my-plugin',
  action: 'plugin:getSummary'
}, '*');
```

响应：

```js
window.addEventListener('message', (event) => {
  const message = event.data;
  if (message?.channel !== 'echo:plugin-panel' || message.type !== 'response') {
    return;
  }
  if (message.ok) {
    console.log(message.result);
  } else {
    console.error(message.error);
  }
});
```

当前 panel action：

| action | payload | 作用 |
| --- | --- | --- |
| `plugin:getSummary` | 无 | 返回当前插件摘要、权限、活动、安全信息 |
| `plugin:getLogs` | 无 | 返回当前插件日志 |
| `plugin:runCommand` | `{ "commandId": "...", "args": [] }` | 执行当前插件命令 |

面板想做有权限的事，应在 `plugin.js` 里注册命令，再由面板触发 `plugin:runCommand`。不要假设面板可以直接读曲库或控制播放。

最小面板：

```html
<!doctype html>
<meta charset="utf-8">
<button id="refresh">刷新</button>
<pre id="output">等待中...</pre>
<script>
const pluginId = 'echo.my-plugin';
const channel = 'echo:plugin-panel';
const pending = new Map();
const output = document.getElementById('output');

window.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || message.channel !== channel || message.type !== 'response') return;
  const resolve = pending.get(message.requestId);
  if (!resolve) return;
  pending.delete(message.requestId);
  resolve(message);
});

function requestHost(action, payload) {
  return new Promise((resolve) => {
    const requestId = `${Date.now()}-${Math.random()}`;
    pending.set(requestId, resolve);
    parent.postMessage({ channel, version: 1, type: 'request', requestId, pluginId, action, payload }, '*');
  });
}

document.getElementById('refresh').addEventListener('click', async () => {
  output.textContent = JSON.stringify(await requestHost('plugin:getSummary'), null, 2);
});
</script>
```

## 导入、导出与发布

插件页可以导出 `.json` 插件包。包结构：

```json
{
  "type": "echo-next-plugin-package",
  "version": 1,
  "exportedAt": "2026-05-29T00:00:00.000Z",
  "manifest": {},
  "files": [
    {
      "path": "plugin.js",
      "content": "..."
    }
  ]
}
```

导出规则：

- 包最大约 2 MB。
- 最多 32 个文件。
- 单文件最大约 512 KB。
- 只导出插件根目录文件，不递归子目录。
- 排除 `plugin-state.json`、`plugin-storage.json`、`plugin-settings.json`。
- 排除 `.echo-plugin.json` 包文件，避免递归打包。

导入规则：

- 必须是 `type: "echo-next-plugin-package"` 和 `version: 1`。
- 目标插件 id 已存在时，普通 UI 导入会拒绝覆盖。
- 导入后默认禁用，需要用户确认权限再启用。
- 宿主记录来源、导入时间、包版本和 checksum。

发布前清单：

- `echo.plugin.json` 使用 `apiVersion: 2`，除非维护旧插件。
- 权限最小化。
- README 写清用途、权限原因、第三方服务边界。
- README 写清“安装到哪里、怎么启用、怎么重载、怎么卸载”。
- 不包含个人 token、cookie、运行缓存。
- 不依赖本机绝对路径。
- 不使用高频轮询。
- 大数据都分页。
- 错误路径有清晰日志。
- 在播放音乐时试一次插件主流程，确认没有明显卡顿。
- 导出包后用另一个空插件目录导入一次，确认没有漏文件。

发布包里不要承诺 ECHO 没开放的能力。比如“直接改源音频文件”“自动写曲库”“注入播放器 UI”“接管 DSP 链路”都不是普通插件能力。

## 调试

插件页会显示：

- manifest 解析错误。
- 启用状态。
- 权限风险。
- 面板 sandbox 状态。
- 命令/provider 数量。
- 活动摘要，例如命令次数、事件次数、网络次数、storage 写入次数、错误次数。
- 插件日志。

`console.log` / `console.warn` / `console.error` 会进入插件日志：

```js
console.log('lookup started');
console.warn('provider returned no result');
console.error('lookup failed', error.message);
```

常用排查顺序：

1. manifest 是否能被插件页识别。
2. 插件是否已启用，权限是否全部确认。
3. `plugin.js` 顶层是否抛错。
4. 命令是否注册，id 是否一致。
5. provider 是否申请了正确权限。
6. 返回 JSON 是否超出大小限制。
7. 网络是否缺少 `network` 权限或被 header 限制挡住。
8. 面板 `pluginId`、`channel`、`requestId` 是否正确。

排错时别一次改很多地方。先把 `plugin.js` 改成只输出一行日志，再确认启用；再注册一个只返回 `{ ok: true }` 的命令；最后才把真实逻辑加回来。这样最快，也最不容易把一个小 typo 误判成系统问题。

连续启动失败保护：

- 10 分钟内连续 3 次启动失败，宿主会自动禁用插件。
- 日志里会出现 `plugin_disabled_after_repeated_errors`。
- 修复文件后，可以手动重新启用。

## 性能与播放安全

ECHO 是播放器，插件必须默认把播放体验放在第一位。

必须遵守：

- 不在顶层做重 CPU 工作。
- 不在 `playback:status` 里做网络请求、全库查询或大写入。
- 不高频调用 `seek()`、`play()`、`pause()`。
- 曲库读取永远分页。
- Provider handler 保持 2.5 秒内完成。
- 网络超时设置短一点，失败返回空候选。
- 大任务拆成手动命令，不要自启动后台扫库。
- storage 只保存小型 JSON。
- source provider 的 `search` 只返回候选，`resolvePlayback` 只在播放时解析。
- 对第三方 API 失败、限流、空结果保持安静，不弹出连续噪声。

推荐模式：

```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scanSomePages(maxPages) {
  for (let page = 1; page <= maxPages; page += 1) {
    const result = await echo.library.getTracks({ page, pageSize: 100 });
    // do small work
    if (!result.hasMore) break;
    await sleep(0);
  }
}
```

不推荐模式：

```js
// 不要这样：事件太高频，还叠加曲库和网络。
echo.events.on('playback:status', async () => {
  const tracks = await echo.library.getTracks({ pageSize: 100 });
  await echo.net.fetchJson('https://example.com/update');
  await echo.storage.set('huge', tracks);
});
```

## 常见错误码

| 错误码 | 含义与处理 |
| --- | --- |
| `plugin_permission_confirmation_required` | 启用时没有确认全部请求权限 |
| `plugin_permission_denied:*` | 调用了未被信任的能力 |
| `plugin_manifest_invalid` | manifest 解析失败 |
| `apiVersion must be between 1 and 2` | API 版本不兼容当前宿主 |
| `plugin_not_enabled` | 插件未启用或已被宿主禁用 |
| `plugin_command_not_found` | 命令未注册或 id 写错 |
| `plugin_command_timeout` | 命令超过约 2 秒 |
| `plugin_command_args_too_large` | 命令参数超过约 64 KB |
| `plugin_command_result_too_large` | 命令返回超过约 256 KB |
| `plugin_event_not_supported:*` | 监听了未开放事件 |
| `plugin_event_handler_limit` | 同插件事件 handler 太多 |
| `plugin_event_handler_timeout` | 异步事件 handler 超过约 2 秒 |
| `plugin_metadata_provider_invalid` | metadata provider 注册参数不合法 |
| `plugin_metadata_provider_limit` | metadata provider 超过 8 个 |
| `plugin_metadata_provider_timeout` | metadata provider 超过约 2.5 秒 |
| `plugin_metadata_request_too_large` | metadata 请求超过约 32 KB |
| `plugin_metadata_result_too_large` | metadata 返回超过约 64 KB |
| `plugin_lyrics_provider_invalid` | lyrics provider 注册参数不合法 |
| `plugin_lyrics_provider_limit` | lyrics provider 超过 4 个 |
| `plugin_lyrics_provider_timeout` | lyrics provider 超过约 2.5 秒 |
| `plugin_cover_provider_invalid` | cover provider 注册参数不合法 |
| `plugin_cover_provider_limit` | cover provider 超过 4 个 |
| `plugin_cover_provider_timeout` | cover provider 超过约 2.5 秒 |
| `plugin_source_provider_invalid` | source provider 注册参数不合法 |
| `plugin_source_provider_limit` | source provider 超过 4 个 |
| `plugin_source_provider_timeout` | source provider 超过约 2.5 秒 |
| `plugin_source_provider_not_playable` | source provider 没有 `resolvePlayback` |
| `plugin_source_playback_url_invalid` | 播放 URL 不是合法 `http` / `https` |
| `plugin_source_search_request_too_large` | source 搜索请求超过约 32 KB |
| `plugin_source_search_result_too_large` | source 搜索返回超过约 128 KB |
| `plugin_source_playback_request_too_large` | source 播放解析请求超过约 16 KB |
| `plugin_source_playback_result_too_large` | source 播放解析返回超过约 32 KB |
| `plugin_storage_value_too_large` | 单个 storage value 超过约 64 KB |
| `plugin_storage_quota_exceeded` | 插件 storage 总量超过约 256 KB |
| `plugin_settings_patch_too_large` | 设置 patch 超过约 32 KB |
| `plugin_setting_value_too_large` | 插件设置单次写入过大 |
| `plugin_settings_quota_exceeded` | 插件设置总量超过约 128 KB |
| `plugin_network_requires_api_v2` | v1 插件调用了网络 API |
| `plugin_network_url_invalid` | 网络 URL 不合法 |
| `plugin_network_method_not_allowed` | 网络方法不是 `GET` / `POST` |
| `plugin_network_request_too_large` | 网络请求超过约 64 KB |
| `plugin_network_response_too_large` | 网络响应超过约 512 KB |
| `plugin_network_http_<status>` | 第三方服务返回非 2xx |
| `plugin_package_invalid` | 导入文件不是 ECHO 插件包 |
| `plugin_package_too_large` | 插件包超过约 2 MB |
| `plugin_package_file_limit_exceeded` | 插件包文件超过 32 个 |
| `plugin_package_file_too_large` | 单个包文件超过约 512 KB |
| `plugin_import_target_exists` | 目标插件 id 已存在，普通导入拒绝覆盖 |
| `plugin_disabled_after_repeated_errors` | 插件连续启动失败，被宿主自动隔离 |

## 完整示例：网络元数据候选插件

`echo.plugin.json`：

```json
{
  "id": "echo.demo-metadata",
  "name": "Demo Metadata",
  "version": "0.1.0",
  "apiVersion": 2,
  "entry": "plugin.js",
  "panel": "panel.html",
  "permissions": ["library:read", "network"],
  "contributes": {
    "commands": [
      { "id": "test-lookup", "title": "测试查询" }
    ],
    "metadataProviders": [
      { "id": "tags", "title": "Demo 标签候选" }
    ],
    "settings": [
      {
        "id": "base-url",
        "title": "API URL",
        "type": "string",
        "defaultValue": "https://example.com"
      }
    ],
    "panels": [
      { "id": "main", "title": "Demo Metadata", "path": "panel.html" }
    ]
  }
}
```

`plugin.js`：

```js
async function lookup(track) {
  const baseUrl = await echo.settings.get('base-url');
  if (!baseUrl || !track.title) {
    return [];
  }

  try {
    const url = `${String(baseUrl).replace(/\/$/, '')}/search?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist || '')}`;
    const data = await echo.net.fetchJson({
      url,
      headers: { accept: 'application/json' },
      timeoutMs: 3000
    });

    if (!Array.isArray(data?.items)) {
      return [];
    }

    return data.items.slice(0, 3).map((item) => ({
      title: item.title || track.title,
      artist: item.artist || track.artist,
      album: item.album,
      genre: item.genre,
      year: Number(item.year) || undefined,
      confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0.5)),
      source: 'Demo Metadata',
      sourceUrl: item.url
    }));
  } catch (error) {
    console.warn('lookup failed', error.message);
    return [];
  }
}

echo.metadata.registerProvider('tags', { title: 'Demo 标签候选' }, async ({ track }) => ({
  candidates: await lookup(track)
}));

echo.commands.register('test-lookup', { title: '测试查询' }, async () => {
  const page = await echo.library.getTracks({
    page: 1,
    pageSize: 1,
    sort: 'recent',
    fields: ['id', 'title', 'artist', 'album']
  });

  const track = page.items[0];
  if (!track) {
    await echo.ui.notify('曲库为空。');
    return { candidates: [] };
  }

  const candidates = await lookup(track);
  await echo.ui.notify(`找到 ${candidates.length} 个候选。`);
  return { track, candidates };
});
```

`panel.html`：

```html
<!doctype html>
<meta charset="utf-8">
<style>
  body { font: 14px system-ui; margin: 16px; color: #1f2937; }
  button { padding: 6px 10px; }
  pre { white-space: pre-wrap; border: 1px solid #d1d5db; padding: 12px; }
</style>
<button id="run">测试查询</button>
<pre id="output">等待操作...</pre>
<script>
const pluginId = 'echo.demo-metadata';
const channel = 'echo:plugin-panel';
const pending = new Map();
const output = document.getElementById('output');

window.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || message.channel !== channel || message.type !== 'response') return;
  const resolve = pending.get(message.requestId);
  if (!resolve) return;
  pending.delete(message.requestId);
  resolve(message);
});

function requestHost(action, payload) {
  return new Promise((resolve) => {
    const requestId = `${Date.now()}-${Math.random()}`;
    pending.set(requestId, resolve);
    parent.postMessage({ channel, version: 1, type: 'request', requestId, pluginId, action, payload }, '*');
  });
}

document.getElementById('run').addEventListener('click', async () => {
  const response = await requestHost('plugin:runCommand', { commandId: 'test-lookup' });
  output.textContent = JSON.stringify(response, null, 2);
});
</script>
```

## 作者检查清单

写插件前：

- 明确插件是命令、provider、面板，还是三者组合。
- 列出必须权限，删掉“可能用得上”的权限。
- 判断是否需要 `network`。如果需要，使用 `apiVersion: 2`。
- 判断是否真的需要面板。简单工具优先做命令。

写插件时：

- 顶层只注册 handler，不做重工作。
- 所有曲库操作分页。
- 所有网络请求有短超时。
- 所有 provider 返回候选，不直接写库。
- 所有错误都能返回空结果或清晰日志。
- 不把 token、cookie、用户缓存打进发布包。

发布前：

- 新装导入后默认禁用是正常行为。
- 启用权限说明能让用户看懂。
- 插件连续启动失败不会让主程序坏掉。
- 导出包里没有 `plugin-storage.json`、`plugin-settings.json`、`plugin-state.json`。
- 在播放音乐时试一次插件主流程，确认没有明显卡顿。

## 源码参考

主要契约位置：

- `src/shared/types/plugins.ts`
- `docs/plugin-sdk/echo-plugin.d.ts`
- `src/main/plugins/PluginManifest.ts`
- `src/main/plugins/PluginService.ts`
- `src/main/ipc/pluginIpc.ts`
- `src/renderer/pages/PluginsPage.tsx`

如果文档和代码不一致，以这些源码文件为准。

---

# Spotify OAuth 配置教程

Source: docs/SPOTIFY_OAUTH_SETUP.md
Kind: legacy-doc
Locale: und

# Spotify OAuth 配置教程

ECHO 不内置公共 Spotify Client ID。每个用户需要准备自己的 Spotify Developer App，然后把 Client ID 填到 ECHO。

## 需要准备

- Spotify Premium 账号。
- 可访问 Spotify Developer Dashboard。
- 只需要 Client ID，不要填写、保存或分享 Client Secret。
- ECHO 设置页显示的 Redirect URI，默认是：

```text
http://127.0.0.1:43879/spotify/callback
```

## 创建 Spotify App

1. 打开 <https://developer.spotify.com/dashboard>。
2. 登录你的 Spotify 账号。
3. 创建一个 App。
4. 在 App 的 Settings 里找到 Client ID。
5. 在 Redirect URIs 里添加 ECHO 显示的 Redirect URI。
6. 保存设置。

## 在 ECHO 里填写

1. 打开 ECHO 设置。
2. 进入 `集成`。
3. 找到 `Spotify OAuth 配置`。
4. 填入 Spotify Dashboard 里的 `Client ID`。
5. `Redirect URI` 保持和 Spotify Dashboard 里注册的一致。
6. 点击 `保存 Spotify 配置`。
7. 回到 Spotify 账号卡片，点击登录。

登录会打开系统默认浏览器。如果浏览器里已经登录 Spotify，通常不需要再输入密码。

## Development Mode 限制

新建 Spotify App 通常处于 Development Mode。这个模式有几个限制：

- App 拥有者需要 Premium。
- 只有被加入该 App 用户名单的 Spotify 账号可以正常使用 API。
- 未加入用户名单时，用户可能能完成登录，但后续请求会失败，常见错误是 `The user is not registered for this application`。

如果只是自己使用，创建自己的 App 后用自己的账号登录即可。  
如果要给少量测试用户使用，需要在 Spotify Dashboard 的 Users Management 里添加他们的 Spotify 邮箱。  
如果要公开给大量用户，需要申请 Spotify Extended Quota。

## 常见问题

### The user is not registered for this application

当前登录的 Spotify 账号没有被加入这个 Client ID 对应 App 的用户名单。

处理方式：

- 用自己的 Spotify App Client ID 登录。
- 或让 App 拥有者在 Spotify Dashboard > Users Management 添加你的 Spotify 邮箱。

### INVALID_CLIENT: Invalid redirect URI

ECHO 里的 Redirect URI 和 Spotify Dashboard 里注册的不一致。

处理方式：

- 两边必须完全一致。
- 建议直接使用默认值：`http://127.0.0.1:43879/spotify/callback`。

### Spotify Premium or regional permission is required

可能原因：

- 当前 Spotify 账号不是 Premium。
- 当前地区不能播放该内容。
- Spotify Connect / Web Playback SDK 当前不可用。

### 能不能下载 Spotify 音频

不能。ECHO 的 Spotify 接入只走官方 OAuth、Web API、Web Playback SDK / Spotify Connect，不提供可下载音频 URL，也不会进入 ECHO native audio 解码路径。

## 参考

- <https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow>
- <https://developer.spotify.com/documentation/web-api/concepts/redirect_uri>
- <https://developer.spotify.com/documentation/web-api/concepts/quota-modes>

---

# ECHO AI 主题生成指南

Source: docs/THEME_AI_GUIDE.md
Kind: legacy-doc
Locale: und

# ECHO AI 主题生成指南

这份文档给 AI 阅读。用户可以把它连同自己的审美描述一起发送给 AI，让 AI 生成 ECHO 可导入的自定义主题 JSON。

目标：生成一个 `echo-next.custom-theme` JSON 文件。用户在 ECHO 的 `设置 -> 外观 -> 自定义当前主题 -> 导入参数` 中导入后，就能得到一个“我的主题”。

## 生成原则

- 只输出 JSON，不输出 CSS、JS、HTML 或解释性文字。
- JSON 必须能被 `JSON.parse` 解析：不要写注释，不要有尾随逗号，不要使用单引号。
- 颜色只使用 `#RRGGBB` 十六进制格式，例如 `#101416`。不要输出 `rgb()`、`rgba()`、`hsl()`、透明色或渐变字符串。
- 字段名必须完全匹配本文档，不要发明新字段。
- 至少提供 `light` 或 `dark` 其中一组。推荐同时提供两组。
- 主题可以故意低对比度，但要知道这可能影响可读性。ECHO 只提醒，不会阻止用户保存。
- 优先做有审美一致性的主题：背景、面板、播放器、侧栏、文字、强调色要像同一个设计系统。
- 不要只把所有颜色都换成同一色相的深浅变化。至少使用一个主强调色、一个辅助强调色和一组中性色。

## 顶层结构

输出这个结构：

```json
{
  "schema": "echo-next.custom-theme",
  "version": 2,
  "exportedAt": "2026-06-03T00:00:00.000Z",
  "theme": {
    "id": "theme-ai-example",
    "name": "AI Example",
    "basePreset": "classic",
    "createdAt": "2026-06-03T00:00:00.000Z",
    "updatedAt": "2026-06-03T00:00:00.000Z",
    "light": {},
    "dark": {}
  }
}
```

字段说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `schema` | 是 | 固定为 `echo-next.custom-theme` |
| `version` | 是 | 固定为 `2` |
| `exportedAt` | 是 | ISO 时间字符串 |
| `theme.id` | 是 | 1-80 个字符，只用字母、数字、下划线、点、冒号、短横线 |
| `theme.name` | 是 | 用户看到的主题名，最多 48 个字符 |
| `theme.basePreset` | 是 | 基础预设名，见下方列表 |
| `theme.createdAt` | 是 | ISO 时间字符串 |
| `theme.updatedAt` | 是 | ISO 时间字符串 |
| `theme.light` | 否 | 浅色模式覆盖参数 |
| `theme.dark` | 否 | 深色模式覆盖参数 |

可用的 `basePreset`：

```text
classic, echoTwilight, sakuraMilk, peachSoda, mintCandy, berryDream,
matchaCream, lemonMochi, cottonCloud, melonCream, seaSaltJelly,
caramelPudding, neonCandy, nyanCat, childrenDoodle, wisteriaBubble,
strawberryCookie, graphiteAurora, amberNoir, oceanStudio, rosewoodVinyl,
darkSideMoon, shibuyaNight, kyotoKurenai, ukiyoIndigo, fujiSnow,
matsuriLantern, ginzaNoir, frostJazz, FINAL
```

不知道选什么时用 `classic`。如果用户要求“保留某个预设的气质再微调”，就把那个预设写入 `basePreset`。

## 色调结构

`light` 和 `dark` 的字段相同。可以只写需要覆盖的字段，但建议生成完整字段，方便用户导入后直接得到完整效果。

```json
{
  "appBg": "#f4f8fb",
  "appBg2": "#d8e8ef",
  "appBg3": "#dce3f2",
  "panel": "#fbfdff",
  "panelSoft": "#e6eef4",
  "accent": "#245f9e",
  "accentStrong": "#163f70",
  "secondary": "#7f3e70",
  "heading": "#142234",
  "text": "#34495f",
  "muted": "#546a80",
  "border": "#5c7da9",
  "onAccent": "#ffffff",
  "buttonText": "#34495f",
  "titlebar": "#fbfdff",
  "sidebar": "#e6eef4",
  "player": "#fbfdff",
  "field": "#ffffff",
  "row": "#ffffff",
  "rowHover": "#eef4fa",
  "rowActive": "#dce9ff",
  "chip": "#ffffff",
  "focus": "#245f9e",
  "danger": "#d64545",
  "success": "#2f8f72",
  "warning": "#c98a16",
  "panelOpacityPercent": 78,
  "glassPercent": 20,
  "shadowPercent": 82,
  "cornerRadiusPx": 14,
  "panelBlurPx": 15,
  "saturationPercent": 100,
  "motionEnabled": true,
  "motionSpeedSeconds": 0.18,
  "motionIntensityPercent": 64
}
```

## 颜色字段含义

| 字段 | 用途 | 生成建议 |
| --- | --- | --- |
| `appBg` | 主窗口底色 | 决定主题第一印象 |
| `appBg2` | 背景渐变中段 | 和 `appBg` 同气质但有层次 |
| `appBg3` | 背景渐变尾色 | 可加入轻微冷暖对比 |
| `panel` | 主要面板色 | 需要承载正文和按钮 |
| `panelSoft` | 弱层级面板 | 侧栏、次级区域、柔和背景 |
| `accent` | 主强调色 | 主按钮、进度、焦点 |
| `accentStrong` | 强强调色 | 标题高光、强调层次 |
| `secondary` | 第三强调色 | 小状态、高亮点缀 |
| `heading` | 主文字 | 标题、重要文字 |
| `text` | 正文文字 | 歌名、设置正文、列表文字 |
| `muted` | 次要文字 | 描述、辅助说明 |
| `border` | 边框和分割线 | 不要比文字更抢眼 |
| `onAccent` | 强调按钮上的文字 | 必须能压住 `accent` |
| `buttonText` | 普通按钮文字 | 通常接近 `text` |
| `titlebar` | 窗口顶部栏 | 通常接近 `panel` 或 `appBg` |
| `sidebar` | 左侧导航背景 | 通常接近 `panelSoft` |
| `player` | 底部播放器背景 | 可比 `panel` 稍深或稍实 |
| `field` | 输入框和搜索框 | 需要和 `text` 有可读性 |
| `row` | 列表普通行 | 通常接近 `panel` |
| `rowHover` | 列表悬停行 | 比 `row` 稍有变化 |
| `rowActive` | 列表选中行 | 带一点 `accent` 气质 |
| `chip` | 筛选芯片、小按钮底色 | 通常接近 `field` |
| `focus` | 键盘焦点和描边高亮 | 通常等于或接近 `accent` |
| `danger` | 危险色 | 删除、错误 |
| `success` | 成功色 | 正常、连接成功 |
| `warning` | 警告色 | 提醒、注意 |

## 数值字段范围

| 字段 | 范围 | 说明 |
| --- | --- | --- |
| `panelOpacityPercent` | 40-100 | 面板不透明度，越低越透 |
| `glassPercent` | 0-80 | 玻璃感和背景模糊层次 |
| `shadowPercent` | 0-100 | 阴影强度 |
| `cornerRadiusPx` | 0-28 | 圆角大小 |
| `panelBlurPx` | 0-32 | 面板模糊程度 |
| `saturationPercent` | 60-140 | 整体饱和度 |
| `motionEnabled` | `true` / `false` | 是否启用主题动效 |
| `motionSpeedSeconds` | 0.12-8 | 动效速度，越小越快 |
| `motionIntensityPercent` | 0-160 | 动效强度 |

## 对比度建议

ECHO 允许用户保存低对比度主题，但 AI 应该优先保证可读性。

推荐检查：

- `text` 对 `appBg` 尽量达到 4.5:1。
- `heading` 对 `appBg` 尽量达到 4.5:1。
- `buttonText` 对 `panel` 尽量达到 4.5:1。
- `onAccent` 对 `accent` 尽量达到 3:1。

浅色主题常见做法：

- 背景用浅色，文字用深色。
- `accent` 如果偏深，`onAccent` 用 `#ffffff`。
- 面板不要和背景完全一样，至少有轻微层次。

深色主题常见做法：

- 背景用深色，文字用浅色。
- `accent` 可以更明亮，但避免荧光色过多。
- `muted` 不要太暗，否则辅助文字会看不清。

## 完整示例

```json
{
  "schema": "echo-next.custom-theme",
  "version": 2,
  "exportedAt": "2026-06-03T00:00:00.000Z",
  "theme": {
    "id": "theme-ai-midnight-lychee",
    "name": "Midnight Lychee",
    "basePreset": "classic",
    "createdAt": "2026-06-03T00:00:00.000Z",
    "updatedAt": "2026-06-03T00:00:00.000Z",
    "light": {
      "appBg": "#f8f1f5",
      "appBg2": "#ead8e8",
      "appBg3": "#d7edf0",
      "panel": "#fffafd",
      "panelSoft": "#efe2eb",
      "accent": "#9f3d72",
      "accentStrong": "#67264b",
      "secondary": "#2f7f87",
      "heading": "#2a1724",
      "text": "#4b3241",
      "muted": "#735b69",
      "border": "#b67598",
      "onAccent": "#ffffff",
      "buttonText": "#4b3241",
      "titlebar": "#fffafd",
      "sidebar": "#efe2eb",
      "player": "#fff7fb",
      "field": "#ffffff",
      "row": "#ffffff",
      "rowHover": "#f5edf2",
      "rowActive": "#efd4e4",
      "chip": "#fffafd",
      "focus": "#9f3d72",
      "danger": "#c84355",
      "success": "#2f8f72",
      "warning": "#bd7a1c",
      "panelOpacityPercent": 80,
      "glassPercent": 18,
      "shadowPercent": 78,
      "cornerRadiusPx": 14,
      "panelBlurPx": 14,
      "saturationPercent": 104,
      "motionEnabled": true,
      "motionSpeedSeconds": 0.22,
      "motionIntensityPercent": 58
    },
    "dark": {
      "appBg": "#0d0910",
      "appBg2": "#1d1020",
      "appBg3": "#0b2428",
      "panel": "#211725",
      "panelSoft": "#17101a",
      "accent": "#f08abd",
      "accentStrong": "#ffd6ea",
      "secondary": "#72d0d7",
      "heading": "#fff6fb",
      "text": "#eadce7",
      "muted": "#c8aeba",
      "border": "#c875a4",
      "onAccent": "#321020",
      "buttonText": "#eadce7",
      "titlebar": "#18101b",
      "sidebar": "#17101a",
      "player": "#211725",
      "field": "#17101a",
      "row": "#201522",
      "rowHover": "#2a1a2e",
      "rowActive": "#3a2039",
      "chip": "#26192b",
      "focus": "#f08abd",
      "danger": "#ff6b7a",
      "success": "#65d6a1",
      "warning": "#f0b45b",
      "panelOpacityPercent": 88,
      "glassPercent": 24,
      "shadowPercent": 96,
      "cornerRadiusPx": 14,
      "panelBlurPx": 18,
      "saturationPercent": 108,
      "motionEnabled": true,
      "motionSpeedSeconds": 0.22,
      "motionIntensityPercent": 70
    }
  }
}
```

## 用户提示词模板

用户可以把下面这段发给 AI，并在最后补充自己的审美描述：

```text
请根据我提供的 ECHO AI 主题生成指南，为 ECHO 生成一个可导入的自定义主题 JSON。

要求：
- 只输出一个 JSON 代码块。
- 使用 schema = "echo-next.custom-theme"，version = 2。
- 同时生成 light 和 dark 两套色调。
- 所有颜色必须是 #RRGGBB。
- 不要输出 CSS、JS、解释文字或注释。
- 字段必须符合指南，不要增加不存在的字段。
- 尽量保证正文、标题、按钮和强调按钮可读。

我的主题需求：
主题名：
关键词：
想要的氛围：
喜欢的颜色：
不喜欢的颜色：
更偏浅色还是深色：
是否需要高对比度：
是否需要动效：
参考对象或画面：
```

## AI 生成前检查清单

生成 JSON 前检查：

- `schema` 是否为 `echo-next.custom-theme`。
- `version` 是否为 `2`。
- `theme.id` 是否只包含安全字符且不超过 80 个字符。
- `theme.name` 是否不超过 48 个字符。
- `basePreset` 是否在允许列表中。
- 是否至少有 `light` 或 `dark`。
- 所有颜色是否都是 `#RRGGBB`。
- 数值是否在范围内。
- JSON 是否没有注释和尾随逗号。
- 主题是否符合用户描述，而不是只随机堆颜色。

## 进阶：插件主题结构

如果用户不是要导入单个 JSON，而是要制作主题插件，可以使用 `contributes.themePresets`。插件主题不是本文档的主要目标，但结构如下：

```json
{
  "id": "echo.ai-theme-pack",
  "name": "AI Theme Pack",
  "version": "0.1.0",
  "apiVersion": 2,
  "entry": "plugin.js",
  "permissions": [],
  "contributes": {
    "themePresets": [
      {
        "id": "midnight-lychee",
        "title": "Midnight Lychee",
        "description": "荔枝粉、夜色紫和冷青色高光。",
        "basePreset": "classic",
        "preview": "linear-gradient(135deg, #0d0910 0%, #1d1020 50%, #72d0d7 100%)",
        "swatches": ["#0d0910", "#f08abd", "#72d0d7", "#eadce7"],
        "light": {
          "appBg": "#f8f1f5",
          "panel": "#fffafd",
          "accent": "#9f3d72",
          "heading": "#2a1724",
          "text": "#4b3241",
          "onAccent": "#ffffff"
        },
        "dark": {
          "appBg": "#0d0910",
          "panel": "#211725",
          "accent": "#f08abd",
          "heading": "#fff6fb",
          "text": "#eadce7",
          "onAccent": "#321020"
        }
      }
    ]
  }
}
```

插件主题额外规则：

- `themePresets` 最多 12 个。
- `preview` 只能是纯色或 `linear-gradient(...)`。
- `swatches` 只放 `#RRGGBB` 颜色。
- 主题插件不需要权限，不注入任意 CSS。

---

# ECHOPage Ubuntu auto deploy

Source: docs/UBUNTU_AUTO_DEPLOY.md
Kind: legacy-doc
Locale: und

# ECHOPage Ubuntu auto deploy

This repository deploys automatically through GitHub Actions when `main` is pushed.

## Server bootstrap

Install runtime packages:

```bash
sudo apt update
sudo apt install -y git curl nginx rsync

curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

Clone the repository:

```bash
sudo git clone https://github.com/Moekotori/ECHOPage.git /opt/ECHOPage
sudo chown -R "$USER:$USER" /opt/ECHOPage
cd /opt/ECHOPage
npm ci
```

Create the release-sync environment file:

```bash
sudo nano /etc/echopage.env
```

Example:

```bash
GITHUB_TOKEN=replace_with_a_fresh_token
```

The server user used by GitHub Actions must be able to reload Nginx and write the web root.
The simplest option is passwordless sudo for the deploy user, or a root SSH user on a locked-down server.

## GitHub Secrets

Add these repository secrets in GitHub:

- `DEPLOY_HOST`: server IP or domain
- `DEPLOY_USER`: SSH user
- `DEPLOY_SSH_KEY`: private key for that SSH user

Optional secrets:

- `DEPLOY_PORT`: SSH port, defaults to `22`
- `DEPLOY_PATH`: app directory, defaults to `/opt/ECHOPage`
- `DEPLOY_WEB_ROOT`: Nginx web root, defaults to `/var/www/echopage`
- `DEPLOY_ENV_FILE`: release-sync env file, defaults to `/etc/echopage.env`

## Nginx

Use a static site config like this:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/echopage;
    index index.html;

    location / {
        try_files $uri $uri/ /404.html;
    }

    location /_astro/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }

    location /update/stable/win/latest.yml {
        add_header Cache-Control "no-cache";
        try_files $uri =404;
    }

    location /update/stable/win/ {
        add_header Cache-Control "public, max-age=86400";
        try_files $uri =404;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/echopage /etc/nginx/sites-enabled/echopage
sudo nginx -t
sudo systemctl reload nginx
```

---

# ECHO NEXT 用户教程

Source: docs/USER_GUIDE.md
Kind: legacy-doc
Locale: und

# ECHO NEXT 用户教程

![ECHO NEXT 用户教程截图](./guide.png)

这份教程写给真正要用软件听歌的人，不写给已经熟悉播放器术语的人。你不需要先学一堆英文名词；看到界面上的英文页面名时，把它当成按钮标签即可。下面会直接告诉你每个入口对应中文含义、什么时候点、出问题先查哪里。

## 先跑通播放

第一次打开 ECHO NEXT，不建议一上来就导入几万首歌、开插件、开远程库、调 ASIO。先用一个小文件夹确认软件能扫到歌、能显示、能播放。

1. 准备一个小文件夹，例如 `D:\Music\Test`，放 3 到 10 首确定正常的 MP3 / FLAC。
2. 打开 ECHO NEXT，点击左侧的 `Import Folder`，选择这个文件夹。
3. 等扫描完成后，进入 `Inbox` 看新导入的歌曲。
4. 进入 `Songs`，双击一首歌播放。
5. 看底部播放器：有歌名、有进度、有声音，就说明基础链路正常。

如果没声音，先按这个顺序查，不要马上重建数据库：

1. Windows 系统音量和输出设备是否正确。
2. ECHO NEXT 底部音量是否太低或静音。
3. `Settings -> Playback` 里的输出设备是否选对。
4. 输出模式先切回 `System` 或 `WASAPI Shared`。
5. 关闭 EQ、ReplayGain、变速，再试同一首歌。
6. 换一首确定能在其它播放器播放的普通 MP3。

小文件夹正常后，再导入完整曲库。大曲库第一次扫描会慢，这是正常的：软件要读取文件、标签、封面、时长和专辑信息。扫描时不要同时开下载、远程全量索引或大量后台任务。

## 左侧页面怎么认

界面上有些页面名是英文，但你不用把它们翻译成专业概念。按下面的中文意思找入口即可。

| 页面 | 中文理解 | 什么时候用 |
| --- | --- | --- |
| `Import Folder` | 导入文件夹 | 第一次添加本地音乐，或新增一个音乐目录 |
| `Songs` | 全部歌曲 | 找歌、搜歌、排序、右键编辑标签 |
| `Albums` | 专辑墙 | 按专辑听歌、检查专辑是否合并正确 |
| `Artists` | 歌手/艺术家 | 按歌手浏览歌曲和专辑 |
| `Folders` | 本地目录管理 | 看哪些文件夹被导入、重新扫描目录 |
| `Inbox` | 新歌收件箱 | 看刚导入或刚下载进来的歌曲 |
| `Queue` | 当前播放队列 | 临时排歌、调整接下来播放什么 |
| `Liked` | 我喜欢的歌 | 找收藏过的歌曲 |
| `History` | 播放历史 | 找刚才听过的歌 |
| `Playlists` | 歌单 | 长期保存一组歌曲 |
| `Lyrics` | 歌词页 | 看沉浸歌词、调歌词显示 |
| `Streaming` | 在线搜索 | 搜在线候选、试听或补全来源 |
| `Downloads` | 下载器 | 粘贴链接、搜索下载、查看下载任务 |
| `Cloud / Remote` | 远程音乐库 | 连接 WebDAV、NAS、Jellyfin、Navidrome 等 |
| `Connect` | 局域网投放 | 找 DLNA、AirPlay 等局域网设备 |
| `Plugins` | 插件 | 启用、禁用、查看插件权限和日志 |
| `Settings` | 设置 | 调播放、歌词、MV、EQ、外观、网络、诊断 |

日常听歌最常用的只有几个入口：`Songs` 找歌，`Albums` 按专辑听，`Queue` 临时排歌，`Playlists` 保存歌单，`Settings -> Playback` 调输出。

## 每天听歌怎么用

最简单的日常流程：

1. 打开 ECHO NEXT。
2. 去 `Songs` 搜歌，或去 `Albums` 找专辑。
3. 双击歌曲播放。
4. 想临时排几首歌，就右键加入 `Queue`。
5. 想长期保存一组歌，就加入 `Playlists`。
6. 很喜欢的歌点收藏，以后在 `Liked` 里找。
7. 忘了刚才听了什么，去 `History`。

`Queue` 是临时队列，适合“今晚先听这些”。`Playlists` 是长期歌单，适合“通勤”“耳机测试”“新歌待整理”这种会反复使用的分类。

## 整理本地曲库

ECHO NEXT 优先尊重你的本地文件和标签。专辑显示乱、歌手拆分、封面不对时，通常不是“软件不认识歌”，而是文件标签本来就不统一。

整理一张专辑时，重点看这些字段：

| 字段 | 影响 |
| --- | --- |
| `album` | 专辑名，决定歌曲属于哪张专辑 |
| `albumArtist` | 专辑艺术家，决定同名专辑是否合并 |
| `trackNo` | 曲目顺序 |
| `discNo` | 多碟专辑顺序 |
| `year` | 发行年份显示 |
| 封面 | 专辑墙和播放器展示 |

推荐流程：

1. 在 `Albums` 找到显示不对的专辑。
2. 记住哪些歌曲应该属于同一张专辑。
3. 回到 `Songs`，选中这些歌曲。
4. 右键编辑标签。
5. 统一 `album` 和 `albumArtist`，检查曲序和碟号。
6. 保存后回到 `Albums` 检查是否合并正确。

网络元数据只适合补全缺失信息，不适合覆盖你已经手动整理好的高可信标签。批量修改前先小范围试，别一口气改完整个曲库。

## 播放和音频输出

如果你只是想稳定听歌，优先使用 `System` 或 `WASAPI Shared`。它们更适合大多数 Windows 日常设备，例如笔记本声卡、蓝牙耳机、普通 USB DAC。

输出模式大致这样理解：

| 模式 | 适合谁 | 建议 |
| --- | --- | --- |
| `System` | 不想折腾，只想有声音 | 新手优先 |
| `WASAPI Shared` | Windows 日常输出 | 稳定优先 |
| `WASAPI Exclusive` | 外置 DAC、USB 声卡 | 确认设备稳定后再用 |
| `ASIO` | 专业声卡或原厂 ASIO 驱动 | 有明确需求再用 |

切输出时建议每次只改一个设置，然后播放同一首歌确认。出现爆音、无声、速度异常、切歌卡住时，先切回上一个正常模式。

不要迷信接口名字。ASIO4ALL、FlexASIO、Voicemeeter 这类包装层不一定比系统输出更好，也更容易把问题变复杂。真正影响声音的通常是 DAC、声卡、耳放、耳机和驱动稳定性。

## EQ、ReplayGain 和变速

EQ 用来调整声音风格。新手先记住两件事：

1. 声音爆、糊、刺耳时，优先降低 Preamp，不要只往上推频段。
2. 想确认原始输出，就先关闭 EQ 和 Preamp。

ReplayGain 用来让不同歌曲响度更接近，适合随机播放、混合歌单、夜间听歌。不适合做 bit-perfect 验证，也不适合你想保留每张专辑原始响度关系的场景。

变速适合播客、练习、Nightcore / Daycore 等特殊玩法。排查播放问题时，先恢复正常速度。

## 歌词

播放一首歌后进入 `Lyrics`。如果没有歌词或歌词不准，按这个顺序处理：

1. 确认歌曲标题和艺术家是否正确。
2. 看是否有在线候选。
3. 手动选择更准确的歌词版本。
4. 如果整体早或晚，调时间偏移。
5. 如果只有这首歌不准，优先怀疑版本不同，例如现场版、翻唱、剪辑版。
6. 如果看不清，去歌词设置里调字体、颜色、可读性增强。

歌词问题通常不需要动数据库。先换候选、调偏移、修标题。

## MV

MV 匹配不可能每首都自动完美。推荐这样用：

1. 先播放歌曲，再打开 MV 入口。
2. 等候选加载。
3. 优先选看起来像官方 MV 的结果。
4. 自动候选不对时，手动选择。
5. 有指定视频链接时，可以粘贴自定义 URL。
6. 如果 HEVC、HDR、Dolby Vision 播不了，可能是编码支持问题，不一定是匹配错。

部分歌曲本来就需要手动绑定 MV。不要为了一个 MV 候选不准去清库或重扫。

## 下载器

`Downloads` 用来搜索下载、粘贴 URL、提取音频并导入曲库。

使用前先确认：

1. 下载目录有足够空间。
2. FFmpeg 和 yt-dlp 状态正常。
3. 网络和代理可用。
4. 内容来源合法。

下载失败时优先看任务状态：

| 状态 | 含义 |
| --- | --- |
| `queued` | 排队中 |
| `probing` | 正在解析链接 |
| `downloading` | 下载中 |
| `extracting_audio` | 提取音频中 |
| `importing` | 导入曲库中 |
| `completed` | 完成 |
| `failed` | 失败 |
| `cancelled` | 已取消 |

常见排查顺序：URL 是否有效、平台是否限制、网络/代理是否正常、FFmpeg 是否可用、输出目录是否有权限和空间。

## 远程音乐库

`Cloud / Remote` 用来连接不在本机磁盘上的音乐，例如 WebDAV、AList、Jellyfin、Emby、SMB、Subsonic、Navidrome。

新手建议：

1. 先测试连接。
2. 能浏览后再保存。
3. 先小范围索引或仅浏览。
4. 稳定后再扩大范围。

不要第一次就对巨大远程库做全量索引。远程库速度受服务器、网络、权限、证书、代理、防火墙影响，慢不一定是 ECHO NEXT 卡。

## Streaming 在线搜索

`Streaming` 用来找在线候选、试听或发现来源。它不是保证万能播放的入口。

质量偏好只是“尽量选择”，不是承诺。平台没有对应资源、账号权限不足、网络失败、版权限制或来源失效时，都可能失败或回退。

平台边界也要清楚：ECHO NEXT 不会绕过会员、版权或平台限制。遇到某个平台搜不到，先换关键词、换来源、检查代理，不要默认是本地曲库坏了。

## Plugins 插件

插件是扩展能力，不是随便运行脚本的后门。启用插件前一定看来源和权限。

常见权限可以这样理解：

| 权限 | 能做什么 | 风险 |
| --- | --- | --- |
| `playback:read` | 读取播放状态 | 低 |
| `playback:control` | 控制播放、暂停、切歌 | 中 |
| `library:read` | 读取曲库公开字段 | 中 |
| `library:write` | 写入曲库相关内容 | 高 |
| `settings:read` | 读取设置快照 | 中 |
| `settings:write` | 修改设置 | 高 |
| `network` | 访问外部网络 | 高 |
| `fs:plugin` | 读写插件自己的目录 | 中 |

新手建议只启用可信来源的插件。插件报错时，先禁用，再看日志。涉及 `library:write`、`settings:write`、`network` 的插件要特别谨慎。

## Settings 设置怎么找

设置很多，不需要一次看完。按目标找：

| 你想做什么 | 去哪里 |
| --- | --- |
| 换输出设备、输出模式 | `Settings -> Playback` |
| 看播放诊断、音频状态 | `Settings -> Playback` 或 `Settings -> About` |
| 调歌词来源、字体、偏移 | `Settings -> Lyrics` |
| 调 MV 来源、质量、外部播放 | `Settings -> MV` |
| 调 EQ、Preamp | `Settings -> EQ` |
| 改主题、字体、壁纸、动效 | `Settings -> Appearance` |
| 管理本地文件夹、网络元数据、曲库健康 | `Settings -> Library` |
| 设置代理、账号、集成 | `Settings -> Integrations` |
| 备份设置、恢复设置 | `Settings -> General` |
| 重建、修复、清缓存等危险操作 | `Settings -> Danger` |

危险操作前先想清楚三件事：会不会删除真实文件、有没有备份、能不能只修一小块。播放没声音时不要第一时间重建数据库。

## 新手不要乱动的地方

这些功能不是不能用，而是要知道后果：

| 功能 | 为什么要谨慎 |
| --- | --- |
| 删除歌曲 | 可能影响真实文件或曲库记录 |
| 重建数据库 | 会影响曲库索引、扫描状态和本地记录 |
| 清理缓存 | 封面、临时文件、下载结果可能需要重新生成 |
| 批量标签编辑 | 改错会让专辑、歌手、搜索全部变乱 |
| 全量远程索引 | 大远程库可能跑很久，占网络和服务器资源 |
| ASIO / 独占输出 | 设备或驱动不稳时容易无声、爆音或失败 |
| 高权限插件 | 可能改设置、写曲库、访问网络 |
| 手动代理 | 会影响歌词、MV、Streaming、Downloads、网络元数据 |

安全做法：小范围试，确认结果，再扩大范围。

## 常见问题快速排查

### 播放没有声音

1. 查系统音量和系统输出设备。
2. 查 ECHO NEXT 音量。
3. 切回 `System` 或 `WASAPI Shared`。
4. 关闭 EQ、ReplayGain、变速。
5. 换一首确定正常的 MP3 / FLAC。
6. 看播放诊断和日志。

### 曲库显示不对

1. 确认扫描是否完成。
2. 检查源文件标签。
3. 检查是否导入了重复目录。
4. 看 `album`、`albumArtist`、曲序、碟号是否统一。
5. 不要一上来清空数据库。

### 封面不对

1. 检查文件是否内嵌封面。
2. 检查文件夹封面。
3. 检查同一专辑的歌曲封面是否一致。
4. 刷新或清理封面缓存前，先确认影响范围。

### 歌词不准

1. 手动换候选。
2. 调时间偏移。
3. 修正歌曲标题和艺术家。
4. 确认是不是现场版、翻唱、剪辑版。

### MV 不准

1. 手动选候选。
2. 粘贴自定义 URL。
3. 修正歌曲元数据。
4. 接受部分歌曲需要手动绑定。

### 远程来源连不上

1. 检查地址、账号、密码或 token。
2. 检查证书、代理、防火墙。
3. 检查服务端是否正常。
4. 先测试连接，再建索引。

### 下载失败

1. 检查 URL 或搜索关键词。
2. 检查平台是否限制。
3. 检查网络和代理。
4. 检查 FFmpeg / yt-dlp。
5. 检查输出目录权限和磁盘空间。

## 反馈问题时带什么

有效反馈比一句“不能用”更容易修。建议带上：

1. ECHO NEXT 版本。
2. Windows / Linux 版本。
3. 使用的是安装版、便携版还是开发模式。
4. 问题发生在哪个页面。
5. 你点了什么，按顺序写。
6. 预期应该怎样。
7. 实际发生了什么。
8. 截图或录屏。
9. 日志或诊断报告。
10. 如果是播放问题，带上输出模式、设备、文件格式，以及是否只影响某些歌曲。
11. 如果是扫描问题，带上文件夹类型、本地盘还是远程盘、失败路径。
12. 如果是网络问题，带上代理模式、来源类型和服务端返回信息。

越接近真实操作链路，越容易定位。情绪可以理解，但只有可复现信息才能真的把问题修掉。

---

# ECHO Page

Source: README.md
Kind: repo-readme
Locale: und

# ECHO Page

ECHO Next official website, documentation, changelog, and static update feed.

## Pull And Build

After pulling the latest code, build from the repository root:

```powershell
git pull
npm ci
npm run build
```

The production output is written to `dist/`.

## Local Preview

For local development:

```powershell
npm run dev
```

To preview the production build:

```powershell
npm run preview
```

## Build Notes

- Use Node.js 20 LTS or newer.
- Use `npm ci` after a fresh clone or after `package-lock.json` changes.
- `npm run build` runs content validation, generates the Windows stable update feed, then builds the Astro site.
- The generated update feed is written under `public/update/stable/win/latest.yml`.

---

# 404

Source: src/content/docs/404.md
Kind: starlight-doc
Locale: und

Frontmatter:

```yaml
title: "404"
template: splash
pagefind: false
editUrl: false
draft: true
sidebar:
  hidden: true
hero:
  tagline: This page does not exist.
```

---

# How To Ask AI About ECHO

Source: src/content/docs/en/docs/ai-question-guide.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/ai-question-guide/
Description: A practical prompt guide for asking AI about ECHO usage, troubleshooting, themes, plugins, and bug reports.

AI can help you read ECHO documentation, plan troubleshooting, generate theme JSON, inspect logs, and draft clear feedback. It is not ECHO itself, and it cannot see your computer state unless you provide the details. The more precise your context is, the more useful the answer will be.

For communication with maintainers, developers, or AI, also read this external reference: [Stop-Ask-Questions-The-Stupid-Ways](https://github.com/tangx/Stop-Ask-Questions-The-Stupid-Ways/blob/master/README.md). ECHO docs do not mirror that article, but they use the same principle: do not make others guess context; provide facts, evidence, reproduction steps, and what you already tried.

## The Short Version

A good ECHO question usually includes:

- What you want to do, such as importing a local library, configuring WASAPI Exclusive, generating a dark theme, or fixing silent playback.
- What is stuck right now, including the page, visible state, error message, or playback/scanning behavior.
- Your environment, including ECHO version, Windows version, install channel, output device, file format, or remote source type.
- What you have already tried.
- How you want the AI to answer, such as “give low-risk steps first” or “turn this into a bug report”.

Avoid questions like “Why does ECHO not work?” or “Fix playback.” They do not contain enough evidence.

## General Template

```text
I am using ECHO Next and want help with this issue:

Goal:
- I want to ...

Current behavior:
- Page or feature:
- What happens:
- Error message or log:

Environment:
- ECHO version:
- OS version:
- Install channel:
- Audio output device / remote source / file format:

I already tried:
- ...

Please:
- Identify the most likely causes;
- Give troubleshooting steps from low risk to high risk;
- Do not suggest deleting my library or reinstalling unless you explain why it is necessary.
```

## Usage Questions

When you need help using ECHO, describe the result you want rather than asking AI to guess the page.

```text
I installed ECHO Next for the first time. My music files are in D:\Music and include FLAC and MP3.
I want to import one small folder first instead of scanning the whole drive.
Please tell me the steps in order and what I should see after each step.
```

Useful keywords:

- Install and first launch
- Import local library
- Search songs, albums, and artists
- Manage the play queue
- Change download folder
- Configure remote sources, cloud drives, or internet radio

## Playback And Audio Questions

For audio issues, include the file, output mode, device, and processing chain. Start with low-risk checks before reinstalling or clearing data.

```text
ECHO Next shows playback progress but I hear no sound.

Environment:
- Windows 11
- ECHO version: 26.x.x
- Output device: USB DAC, works in Windows
- File: local FLAC, 44.1 kHz / 16-bit
- Current output mode: WASAPI Exclusive

What happens:
- The progress bar moves but there is no sound
- The same file works in another player

I tried:
- Raising Windows and ECHO volume
- Disabling EQ, ReplayGain, and DSP

Please give prioritized troubleshooting steps and do not start with deleting the database.
```

For bit-perfect, ASIO, HQPlayer, DSD, resampling, EQ, or DSP questions, also include:

- Current output mode
- Whether EQ, DSP, ReplayGain, speed control, or channel balance is enabled
- Sample rate, bit depth, and channel count
- DAC or sound card model
- Windows default format

## Library And Scanning Questions

Library questions need scale and path type. A large first scan can be slow without being broken.

```text
ECHO Next scans my library slowly and I want to know whether this is normal.

Library:
- Path: E:\Music
- About 12000 tracks
- Storage: external HDD
- File types: FLAC, MP3, some DSD

Behavior:
- It slows down during cover processing
- CPU is not high, disk usage is high
- There is no error dialog

Please judge whether this looks like a normal first scan and suggest safe optimizations.
```

For library bug reports, add:

- Small folder or full library
- Local disk, external disk, NAS, or cloud path
- Chinese, Japanese, or special characters in paths
- Very large covers, damaged files, or unusual tags
- The scan phase and progress when it gets stuck

## Remote Sources

Be clear whether you are using WebDAV, Jellyfin, Emby, Subsonic, NAS, cloud drive, internet radio, or a plugin.

```text
I cannot connect a WebDAV remote source in ECHO Next.

Service:
- Type: WebDAV
- Hosted on: home NAS
- Network: same LAN
- The account can log in from a browser

Behavior:
- Test connection fails in ECHO
- Error message: ...

Please troubleshoot network, URL format, account permissions, and certificate issues.
```

Do not ask AI to bypass memberships, copyright, access controls, or platform restrictions. ECHO does not provide music downloads, piracy sources, or access-control bypass support.

## Theme Generation

For custom themes, send the [AI Theme Guide](./theme-ai-guide/) together with your visual preferences, and require JSON only.

```text
Using the ECHO Next AI Theme Guide, generate an importable custom theme JSON.

Style:
- Dark mode first
- Night recording studio feeling with teal accents
- Good contrast
- Avoid dominant purple or purple-blue gradients

Rules:
- Output JSON only
- Use schema echo-next.custom-theme
- Provide both light and dark
- Use #RRGGBB colors
```

If import fails, send the JSON and the error back to AI and ask it to check JSON syntax, field names, trailing commas, and color formats.

## Plugins And Development

For plugin or engineering questions, say whether you are using a plugin or developing one. Include file paths, errors, expected behavior, and a minimal reproduction when code is involved.

```text
I want to write an ECHO Next plugin for a music service that I am allowed to access.

I need:
- The minimal plugin file structure
- Where permission declarations go
- How to avoid hard-coding account secrets

Please use the ECHO plugin docs and point out which parts I still need to implement.
```

Tell AI not to invent APIs that are not in ECHO. If it is unsure, ask it to return to the official docs or code evidence.

## Bug Report Prompt

Ask AI to organize your notes into a developer-friendly report:

```text
Please turn the following into an ECHO bug report. Do not exaggerate and do not guess the root cause.

Details:
- ECHO version:
- OS:
- Page:
- Reproduction steps:
- Expected result:
- Actual result:
- Error message:
- Things I tried:
- Screenshot notes:
```

A good report answers:

1. What did you do?
2. What did you expect?
3. What happened instead?

## Better Questions

| Avoid | Ask Instead |
| --- | --- |
| Why does ECHO not work? | Which page, what action, and what error did you see? |
| Playback is broken. | Which file, output mode, device, and does the progress bar move? |
| Scanning is stuck. | How large is the library, where is it stored, and which scan phase is shown? |
| Generate a theme. | What style, contrast, modes, banned colors, and JSON-only requirement? |
| Give me a source for music. | I have a legal WebDAV/Jellyfin/Emby service and want to configure it in ECHO. |

## Quick Copy Prompt

```text
I have an ECHO Next issue. Goal: ... Current behavior: ... ECHO version: ... OS: ... Related device/file/remote source: ... Error message: ... I already tried: ... Please give low-risk troubleshooting first, separate confirmed facts from guesses, and do not suggest deleting data or reinstalling unless you explain why.
```

---

# AirPlay Support Boundaries

Source: src/content/docs/en/docs/airplay-connect.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/airplay-connect/
Description: ECHO's AirPlay 1 / RAOP compatibility boundary, AirPlay 2 non-support statement, and LAN troubleshooting guidance.

This page defines ECHO's AirPlay boundary so AirPlay 1, AirPlay 2, Apple ecosystem behavior, and device-specific features are not mixed together.

## Short Version

ECHO currently maintains AirPlay support within an **AirPlay 1 / RAOP compatibility** boundary.

ECHO **does not currently support AirPlay 2**. AirPlay 2 involves newer pairing, control, synchronization, multi-room behavior, device negotiation, and Apple ecosystem features. AirPlay 1 compatibility does not mean AirPlay 2 support.

If your device or workflow requires AirPlay 2, HomePod multi-room behavior, Apple TV synchronization, or other AirPlay 2-only features, it is outside current ECHO support.

## What ECHO Supports

ECHO's AirPlay path is intended for compatible AirPlay 1 / RAOP audio behavior on the same local network. The actual entry points are the `Connect` page and related in-app settings.

Treat the current boundary this way:

- Compatible AirPlay 1 / RAOP audio paths on the same LAN.
- Best tested first with normal audio files, stable networking, and default audio settings.
- Discovery, connection, playback state, and control depend on the sender, receiver, firewall, router, and protocol compatibility.
- ECHO will try to surface connection state and errors, but not every Apple or third-party device is guaranteed to work.

AirPlay is not Bluetooth and it is not local exclusive output. Do not troubleshoot AirPlay as a WASAPI Exclusive, ASIO, DSD, or Bluetooth-codec issue.

## AirPlay 2 Is Not Supported

Do not treat these as supported:

- AirPlay 2 multi-room synchronization.
- HomePod / Apple TV AirPlay 2-specific behavior.
- AirPlay 2-level pairing, encryption, session recovery, and device coordination.
- Screen mirroring, video mirroring, or system-level casting.
- Apple Music, FairPlay, DRM, paid-content, or access-control bypass behavior.
- Using ECHO as a full replacement for an official Apple AirPlay 2 device.

AirPlay-related logs or UI labels do not mean AirPlay 2 is complete. The public support boundary remains AirPlay 1 / RAOP compatibility.

## Recommended Test Flow

For a first AirPlay test:

1. Put the ECHO computer and AirPlay device on the same home LAN.
2. Disable VPNs, proxies, guest networks, and AP isolation.
3. Set Windows network type to Private.
4. Allow ECHO / Electron / Node through Windows Firewall on private networks.
5. Start with a normal MP3 or FLAC.
6. Disable EQ, ReplayGain, speed changes, resampling, and other advanced processing.
7. Confirm basic playback first, then test AirPlay.

If the same device is unstable in other apps too, check firmware, router behavior, Apple device OS version, and the LAN before treating it as an ECHO issue.

## FAQ

### Can ECHO guarantee every iPhone, iPad, Mac, or Apple TV works?

No. Apple OS versions, device models, network setup, protocol compatibility, and third-party implementations all matter. ECHO maintains only the current AirPlay 1 / RAOP compatibility boundary.

### Why does another app connect when ECHO does not?

Some apps use vendor-private behavior, system-level capabilities, or AirPlay 2 features. ECHO will not chase closed private behavior with high-risk compatibility work.

### What should I check first if AirPlay has no sound?

Check networking and protocol boundaries before changing exclusive output:

1. Confirm both devices are on the same subnet.
2. Disable VPN / proxy.
3. Allow firewall access.
4. Restart the AirPlay-related devices.
5. Try a normal MP3.
6. Return ECHO to default audio settings.

If it still fails, include the ECHO version, Windows version, sender device and OS version, network environment, screenshots, and logs.

---

# API Credentials Setup

Source: src/content/docs/en/docs/api-credentials.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/api-credentials/
Description: Detailed setup guide for Spotify, TIDAL, Discogs, Bandsintown, Ticketmaster, SeatGeek, and region filters in ECHO.

ECHO's `Developer / API Config` page is for advanced integrations: account authorization, online metadata, album ratings, artist profiles, and event lookup. It is not required for local playback, and it does not provide download access to protected streaming audio.

If you only scan and play local music, you can leave everything blank.

## Fast path

1. Spotify only: fill `Spotify Client ID` and register the Spotify Redirect URI.
2. TIDAL metadata only: fill `TIDAL Client ID`, `TIDAL Client Secret`, and `TIDAL Country Code`.
3. Discogs ratings only: fill `Discogs personal access token`.
4. Artist/event lookup: fill whichever provider keys you have: Bandsintown, Ticketmaster, or SeatGeek.
5. Unsure about a field: leave it blank. ECHO will skip that provider.

## Field reference

| ECHO field | Value to enter | Where to get it | If blank |
| --- | --- | --- | --- |
| `Spotify Client ID` | Spotify Developer App `Client ID` | [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) | Spotify login is unavailable |
| `Spotify Redirect URI` | Exact callback URI shown by ECHO | Default `http://127.0.0.1:43879/spotify/callback` | Login fails if mismatched |
| `TIDAL Client ID` | TIDAL Developer App `Client ID` | [TIDAL Developer Portal](https://developer.tidal.com/) | TIDAL metadata is unavailable |
| `TIDAL Client Secret` | TIDAL Developer App `Client Secret` | TIDAL app details | TIDAL metadata is unavailable |
| `TIDAL Redirect URI` | Exact callback URI shown by ECHO | Default `http://127.0.0.1:43880/tidal/callback` | Required for TIDAL OAuth |
| `TIDAL Country Code` | Two-letter region code, such as `US`, `HK`, or `JP` | Choose based on account or catalog region | Some catalog items may not resolve |
| `Discogs personal access token` | Discogs personal access token | [Discogs Developers settings](https://www.discogs.com/settings/developers) | Discogs ratings/version data may be unavailable |
| `Bandsintown app_id` | Bandsintown API `app_id` | Bandsintown API or partner/developer access | Bandsintown is skipped |
| `Ticketmaster apikey` | Ticketmaster API key, usually named `Consumer Key` | [Ticketmaster Developer Portal](https://developer.ticketmaster.com/) | Ticketmaster is skipped |
| `SeatGeek client_id` | SeatGeek public API key / `client_id` | [SeatGeek Developer Portal](https://developer.seatgeek.com/) | SeatGeek is skipped |
| `Region filter` | Region keywords like `HK, Tokyo, US` | Choose based on event regions | Blank means broader/global lookup |

## Safety

Do not publicly share `Client Secret`, `personal access token`, `apikey`, or any private token. `Client ID` is usually less sensitive than a secret, but using public leaked credentials is still a bad idea and may violate provider rules.

Callback URIs must match exactly. `http://127.0.0.1:43879/spotify/callback` is not the same as `http://localhost:43879/spotify/callback`, and a trailing slash also changes the URI.

## Spotify

ECHO only needs the Spotify `Client ID`; do not paste the Spotify `Client Secret` into ECHO.

1. Open the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create an app, for example `ECHO Next Local`.
3. Add the ECHO callback URI to Redirect URIs:

```text
http://127.0.0.1:43879/spotify/callback
```

4. Open the app details page.
5. Copy `Client ID`.
6. Paste it into `Spotify Client ID` in ECHO.
7. Save the config and log in again.

Spotify requires redirect URIs to match exactly. For local callbacks, use an explicit loopback IP such as `127.0.0.1`, not `localhost`.

New Spotify apps may be in Development Mode. If another Spotify account uses your app, add that account in Spotify Dashboard > Users Management, or request broader access through Spotify's quota/review flow.

## TIDAL

TIDAL credentials are used for catalog metadata lookup in ECHO. They do not bypass TIDAL playback restrictions.

1. Open the [TIDAL Developer Portal](https://developer.tidal.com/).
2. Log in with your TIDAL account.
3. Create an app in the Dashboard.
4. Copy `Client ID` and `Client Secret` from the app details page.
5. Register the ECHO callback URI:

```text
http://127.0.0.1:43880/tidal/callback
```

6. Paste both credentials into ECHO.
7. Set `Country Code` to a two-letter region code such as `US`, `HK`, `JP`, `GB`, or `DE`.
8. Save the config.

If lookup returns nothing, try `US` first, then your account region. Catalog availability can vary by region.

## Discogs

Use a Discogs personal access token for personal local metadata lookup.

1. Log in to [Discogs](https://www.discogs.com/).
2. Open [Discogs Developers settings](https://www.discogs.com/settings/developers).
3. Generate or copy `Personal access token`.
4. Paste it into `Discogs personal access token`.
5. Save the token.

Do not enter `Consumer Key`, `Consumer Secret`, or your Discogs password in this field.

## Artist and event providers

### Bandsintown

Enter the Bandsintown API `app_id` or app identifier. If your account does not have Bandsintown API access, leave it blank.

### Ticketmaster

Ticketmaster Discovery API uses the `apikey` query parameter. In the developer portal, this is commonly shown as `Consumer Key`.

1. Open the [Ticketmaster Developer Portal](https://developer.ticketmaster.com/).
2. Log in or register.
3. Open your Application.
4. Copy `Consumer Key`.
5. Paste it into `Ticketmaster apikey`.

### SeatGeek

SeatGeek API can authenticate with a public key passed as `client_id`.

1. Open the [SeatGeek Developer Portal](https://developer.seatgeek.com/).
2. Log in or request API access.
3. Find the public key / `client_id`.
4. Paste it into `SeatGeek client_id`.

`client_secret` is not required in ECHO.

## Region filter

Region filter narrows artist/event lookup results. It is separate from `TIDAL Country Code`.

```text
HK, Tokyo, US
```

Use `HK` for Hong Kong, `Tokyo, JP` for Japan/Tokyo, `US` for United States, or leave it blank for broader results.

## Verification checklist

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Spotify says `Invalid redirect URI` | Callback URI mismatch | Copy ECHO's exact Redirect URI into Spotify |
| Spotify says user is not registered | Development Mode user restriction | Add the account in Spotify Users Management |
| TIDAL unauthorized | Wrong secret, mixed app credentials, extra spaces | Recopy Client ID and Secret |
| TIDAL has no results | Region catalog mismatch | Try `US`, then your account region |
| Discogs returns 401 | Token is wrong or revoked | Generate a new personal access token |
| Ticketmaster returns 401 | Wrong key | Use the Application `Consumer Key` |
| SeatGeek has no results | Invalid key or missing API access | Check API access or leave blank |
| Event results are noisy | Region filter too broad | Use a more specific region |
| Event results are empty | Region filter too narrow | Clear the filter and retry |

## Recommended local setup

```text
Spotify Client ID: your own Spotify app Client ID
Spotify Redirect URI: keep ECHO default
TIDAL Client ID: your own TIDAL app Client ID
TIDAL Client Secret: your own TIDAL app Client Secret
TIDAL Country Code: US or your account region
Discogs personal access token: your own personal access token
Bandsintown app_id: blank unless you have API access
Ticketmaster apikey: Application Consumer Key if available
SeatGeek client_id: public client_id if available
Region filter: start with one useful region, such as HK
```

When debugging, keep optional event providers blank and test one provider at a time.

## Official references

- [Spotify Apps](https://developer.spotify.com/documentation/web-api/concepts/apps)
- [Spotify Redirect URIs](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri)
- [TIDAL Manage apps](https://developer.tidal.com/documentation/api-sdk/api-sdk-manage-apps)
- [TIDAL Authorization](https://developer.tidal.com/documentation/api-sdk/api-sdk-authorization)
- [Discogs Developers settings](https://www.discogs.com/settings/developers)
- [Ticketmaster Discovery API](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/)
- [SeatGeek API docs](https://seatgeek.github.io/)

---

# Audio Output

Source: src/content/docs/en/docs/audio-output.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/audio-output/
Description: System, WASAPI, ASIO, DSD, HQPlayer, and output troubleshooting boundaries.

ECHO audio output is stability-first. Advanced output modes can make the device chain clearer, but they also depend more on the operating system, drivers, and hardware state. When something fails, return to a stable path first, then enable advanced options one at a time.

## Choosing An Output Mode

| Mode | Best for | Recommendation |
| --- | --- | --- |
| `System` | Normal PCs, Bluetooth headphones, laptop speakers, stable playback | First choice for new users and troubleshooting |
| `WASAPI Shared` | Daily Windows output and common USB DACs | Stable long-term default |
| `WASAPI Exclusive` | External DACs and exclusive device control | Enable after the device is proven stable |
| `ASIO` | Vendor professional audio drivers and interfaces | Use only when you have a real device/driver need |
| `DSD / DoP` | DACs that explicitly support DSD | Enable only after checking device support |
| `HQPlayer` | External HQPlayer workflows | Requires separate setup and connection validation |

If you only want reliable playback, use `System` or `WASAPI Shared`. Do not enable ASIO, Exclusive, or DSD just because the name sounds more professional.

## Do Not Use Exclusive Mode With Bluetooth

Bluetooth headphones, speakers, and car audio should use `System` or `WASAPI Shared`. Do not use Bluetooth devices for WASAPI Exclusive, ASIO, DSD, bit-perfect, or high-sample-rate validation.

Bluetooth is not a controlled wired HiFi chain. It passes through the Windows Bluetooth stack, drivers, device firmware, codecs, radio conditions, and battery policies. ECHO cannot guarantee exclusive open, fixed sample rate, low latency, stable volume, or strict raw output for Bluetooth devices.

Bluetooth dropouts, latency, crackling, stutter, quality changes, volume issues, device switching, exclusive-mode failures, and codec issues are outside official ECHO maintenance. For troubleshooting, test with wired headphones, a USB DAC, or normal system output first.

## Third-Party Drivers Are Unsupported

ECHO does not support compatibility work for third-party drivers, virtual audio devices, or ASIO wrapper layers. This includes:

- ASIO4ALL, FlexASIO, and Voicemeeter.
- Driver repacks not released by the device vendor.
- System-wide audio enhancement drivers, virtual routing tools, and virtual sound cards.
- Tools that modify the system audio chain or intercept other apps' audio.

These tools may produce sound in some environments, but ECHO does not promise support, will not add targeted fixes for them, and does not treat their failures as ECHO audio engine defects. If you need ASIO, use the original driver from the device vendor.

## bit-perfect And DSP

Once audio is processed, it is no longer strictly bit-perfect. These features affect the output path:

- EQ, Preamp, FIR, and channel balance.
- ReplayGain.
- Speed changes, pitch changes, crossfade, and automix.
- Resampling.
- System mixing, Bluetooth codecs, and virtual audio devices.

To validate raw output, disable all DSP, gain, speed, and channel processing first, and use a stable wired output device.

## DSD And High Sample Rates

DSD, DoP, high sample rates, and high bit depths depend heavily on the DAC and driver. Before enabling them:

1. Confirm the device specifications support the target format.
2. Use a driver from the device vendor.
3. Make sure Windows audio settings are not locked by another app.
4. Confirm normal PCM playback first.
5. Then test DSD, DoP, or higher sample rates.

If you get no sound, crackling, half-speed playback, double-speed playback, or device-open failures, switch back to `System` or `WASAPI Shared` before adding more advanced options. If a song sounds slow, fast, or the progress looks wrong, read [Why Did My Song Speed Change?](/en/docs/audio-output/song-speed-changed/).

## HQPlayer

HQPlayer is an external professional playback chain. ECHO can act as a control and handoff surface, but output, filtering, upsampling, and device connection are handled by HQPlayer and its environment.

For HQPlayer issues, check separately:

- HQPlayer can play on its own.
- The address, port, and connection test in ECHO are correct.
- The current file format is supported by the HQPlayer chain.
- The external device is online and not occupied by another app.

HQPlayer, NAA, network players, and professional DAC combinations vary widely. Include screenshots of both ECHO connection state and HQPlayer-side errors when sending a report.

For step-by-step setup from HQPlayer standalone playback to local ECHO Connect, remote mode, NAA boundaries, and troubleshooting, read the [HQPlayer Guide](/en/docs/audio-output/hqplayer/).

## Troubleshooting Order

For no sound, crackling, half-speed playback, double-speed playback, or failed track changes:

1. Switch back to `System`.
2. Disable EQ, ReplayGain, speed changes, channel tools, and resampling.
3. Play a normal MP3 or FLAC file.
4. Confirm Windows output device and per-app volume.
5. Try `WASAPI Shared`.
6. Test Exclusive, ASIO, DSD, or HQPlayer only after that.

Change one setting at a time. If it fails, screenshot the output mode, device name, status text, file format, and error details before sending a report.

---

# Do Not Obsess Over ASIO

Source: src/content/docs/en/docs/audio-output/asio-vs-exclusive.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/audio-output/asio-vs-exclusive/
Description: Why ASIO is not required for normal listening, and why WASAPI Exclusive is usually the better fallback when ASIO cannot open or stays unstable.

Short version: **ASIO is not a sound-quality switch.** If your goal is stable music playback, less Windows mixing, and track-native sample-rate output to an external DAC, `WASAPI Exclusive` is usually enough. ASIO is most useful for professional interfaces, recording, low-latency monitoring, DAW work, multichannel routing, vendor control panels, and some Native DSD paths.

When ASIO cannot open, fails during track switching, produces silence, crackling, wrong channels, or device-busy errors, do not keep stacking ASIO4ALL, FlexASIO, virtual sound cards, or wrapper layers. **Return to `WASAPI Exclusive`; if that also fails, return to `WASAPI Shared` or `System` for troubleshooting.** Stable playback matters more than the interface name.

## Recommended Order

| Situation | Recommended mode | Why |
| --- | --- | --- |
| Laptop audio, motherboard output, Bluetooth | `System` / `WASAPI Shared` | Stable and compatible |
| Common USB DAC or DAC/amp | Start with `WASAPI Shared`, then try `WASAPI Exclusive` | Stable daily path, with optional exclusive control |
| You want the DAC opened at each track's sample rate | `WASAPI Exclusive` | The player can request the track format |
| Vendor ASIO driver with a clearly supported device | Try `ASIO` | It may expose the device's full capabilities |
| DAW, recording, instruments, low-latency monitoring | `ASIO` | This is ASIO's core use case |
| ASIO cannot open or stays unstable | Use `WASAPI Exclusive` | Normal listening rarely needs ASIO badly enough to fight it |
| Exclusive also fails | Use `WASAPI Shared` / `System` | Restore baseline playback first |

This is not a downgrade. It is moving from a driver-sensitive path to a path that is easier to keep stable and easier to debug.

## What ASIO Actually Solves

ASIO was designed for professional audio production. Its main job is to let DAWs, recording software, virtual instruments, and professional interfaces exchange audio buffers in a direct and predictable way.

It is genuinely valuable for:

- Low-latency recording and live monitoring.
- Multiple input and output channels.
- Hardware routing and vendor control panels.
- Fixed buffer callbacks for DAW processing.
- Some Native DSD, special sample rates, or vendor-specific formats.
- Professional clocking and I/O workflows such as Word Clock, ADAT, S/PDIF, AES, and MIDI.

Those are real advantages, but they do not mean that a finished music file automatically sounds better during playback. If the decoded PCM samples are not changed, and the same digital samples reach the DAC, the interface name cannot add extra detail, soundstage, density, or resolution.

## What Normal Listening Needs

Normal playback mostly needs:

1. Correct file decoding.
2. Clear DSP, EQ, ReplayGain, volume, and resampling state.
3. Stable delivery of audio data to the device.
4. A DAC that locks to the intended format.
5. Reliable analog output, amplification, headphones, speakers, and room acoustics.

The biggest listening differences usually come from the source, DAC, amp, headphones, speakers, DSP, system mixing, resampling, driver stability, and buffer underruns. ASIO only touches part of that chain, and it depends heavily on the vendor driver. A good ASIO driver can be excellent; an immature one can be worse than WASAPI for daily listening.

## Why WASAPI Exclusive Is Usually Enough

`WASAPI Shared` is the normal Windows shared path. Multiple apps can play together, and Windows mixes them into the device's shared format.

`WASAPI Exclusive` lets the player take exclusive control of the endpoint. It can bypass the shared mixer and request the current track's sample rate, bit depth, and channel format.

For music playback, that already covers most practical needs:

- Less interference from the Windows shared mixer.
- Less dependence on the device's default shared format.
- Easier validation of track-native output.
- No third-party ASIO wrapper required.
- Usually easier troubleshooting on common USB DACs.

If you mainly want `44.1 kHz`, `96 kHz`, or `192 kHz` music to leave the player in its own format, `WASAPI Exclusive` is a sensible Windows playback path. It is not a compromise; it is the right tool for many listening setups.

## If ASIO Cannot Open, Do Not Treat It As An Audio-Quality Problem

ASIO open failures are usually driver, device-state, or format-negotiation problems. Common causes include:

- Another app already owns the device.
- Another player, browser tab, game, chat app, recorder, streaming tool, DAW, system audio effect, or virtual audio device is still running in the background.
- The vendor ASIO driver is missing, stale, or incompatible with the current Windows version.
- The requested sample rate, bit depth, or channel count is not accepted by the driver.
- The ASIO control panel has locked the sample rate or buffer size.
- The USB DAC is in the wrong USB mode, firmware state, or input source.
- The driver exposes unexpected output channels.
- The buffer is too small and causes underruns or initialization failure.
- The device did not recover cleanly after sleep, hotplug, or track switching.
- A third-party ASIO wrapper added another layer above WASAPI, WDM, Kernel Streaming, or PortAudio.

Reduce variables before adding more:

1. Use `System` or `WASAPI Shared` and confirm normal PCM playback.
2. Disable EQ, FIR, ReplayGain, speed changes, crossfade, and extra resampling.
3. Test a normal `44.1 kHz` or `48 kHz` FLAC / MP3 file.
4. Switch to `WASAPI Exclusive` and confirm the device can be opened exclusively.
5. Only return to ASIO when the official ASIO driver is truly needed.

If `WASAPI Exclusive` works reliably while ASIO keeps failing, the practical answer for listening is simple: use exclusive mode.

## Check Background Device Ownership First

Many ASIO open failures are not player defects. Something else may still own the device, or the Windows audio chain may have been moved into a different state. ASIO and exclusive output are especially sensitive to this because they depend on the endpoint being available.

Check these background sources first:

| Possible source | Examples | Why it matters |
| --- | --- | --- |
| Other music players | Foobar2000, JRiver, MusicBee, AIMP, NetEase Cloud Music, QQ Music, Apple Music, Spotify | They may hold an exclusive session or fail to release the device |
| Browsers | Chrome, Edge, Firefox tabs for YouTube, Bilibili, web players, livestreams | Pausing a page does not always release the audio endpoint immediately |
| Games and voice apps | Steam games, Discord, Teams, WeChat voice, QQ voice | They may lock the default or communication device |
| Recording and streaming tools | OBS, NVIDIA Broadcast, virtual camera tools, recording software | They may keep monitoring, capture, or virtual routing active |
| DAWs | Cubase, Ableton Live, Reaper, FL Studio, Studio One | They may directly own the ASIO driver and fixed buffer state |
| Virtual audio devices | Voicemeeter, VB-CABLE, BlackHole, Virtual Audio Cable, Equalizer APO companion tools | They may change routing, channels, formats, and volume paths |
| Third-party ASIO wrappers | ASIO4ALL, FlexASIO, generic ASIO wrappers | They may hold the underlying WASAPI / WDM endpoint or enumerate the wrong device |
| Vendor control panels | XMOS, Thesycon, RME, Focusrite, MOTU, Topping, FiiO, and similar panels | They may lock sample rate, buffer size, clock source, USB mode, or channels |
| System audio effects | Windows spatial sound, loudness enhancement, Dolby, DTS, Nahimic, Sonic Studio, Realtek effects | They may insert processing layers or change the shared format |

Do not only check the taskbar. Many apps leave tray icons or background processes after the window is closed. Use this checklist:

1. Exit other players and browser audio tabs; do not merely pause them.
2. Close OBS, livestreaming tools, recorders, voice calls, DAWs, and virtual audio tools.
3. Check the Windows tray and quit audio effect tools that are not required for the DAC.
4. Open Task Manager and look for leftover player, DAW, virtual-audio, browser, or wrapper processes.
5. In Windows sound settings, confirm the default output and default communication device are not set to a virtual device.
6. In device properties, temporarily disable spatial sound, enhancements, and settings likely to create exclusive conflicts.
7. Unplug and replug the USB DAC, or power-cycle the device so the driver enumerates it again.
8. If it still cannot open, restart Windows. Audio drivers can retain a bad state after sleep, hotplug, or a previous crash.

If `System` / `WASAPI Shared` works after restart, `WASAPI Exclusive` works, and only ASIO fails, the likely problem is the ASIO driver, ASIO control panel, third-party wrapper, or device firmware state rather than ECHO's normal playback path.

## Third-Party ASIO Wrappers Are Not A Shortcut

Many "ASIO drivers" are not native vendor ASIO drivers. They are wrapper layers such as ASIO4ALL, FlexASIO, Voicemeeter, or other virtual routing tools.

The usual chain looks like this:

```text
The player thinks it is calling ASIO
  -> third-party ASIO wrapper
  -> WASAPI / WDM / Kernel Streaming / PortAudio
  -> real device driver
  -> DAC
```

That does not turn basic hardware into a professional interface. It only presents another API shape above the real device path. It may help old software that only supports ASIO, but for normal listening it often adds more buffering, channel mapping, format negotiation, and failure points.

If `WASAPI Exclusive` is available, there is usually no reason to wrap it in third-party ASIO just because ASIO sounds more professional.

## When ASIO Is Worth Using

ASIO should not be dismissed either. Official ASIO is excellent in the right context.

| Scenario | Why ASIO may matter |
| --- | --- |
| Professional recording interface | Low-latency input, monitoring, channel routing, vendor control |
| DAW / virtual instrument | Predictable buffer callbacks and real-time performance |
| Multichannel output | Vendor ASIO may expose routing more clearly |
| Native DSD | Some DACs expose Native DSD through official ASIO |
| Vendor-specific features | Clock source, hardware gain, firmware tools, or routing may depend on vendor software |

The rule is simple: **use ASIO when it comes from the device vendor and solves a specific capability problem.** Do not use it merely because it looks more advanced.

## DSD Is Not A Reason To Force ASIO At Any Cost

DSD is one of the main reasons users become fixated on ASIO, but the boundary matters:

- `WASAPI Exclusive` is commonly a PCM exclusive path; DSD often relies on DoP.
- DoP wraps DSD data inside high-sample-rate PCM frames, so the limit depends on the DAC and exposed PCM formats.
- Official ASIO is more likely to expose Native DSD and higher DSD rates.
- The DAC, vendor driver, player implementation, and device settings must all support it.

If your DAC clearly supports Native DSD through a stable vendor ASIO driver, ASIO can be the right path. Otherwise, do not install unknown ASIO wrappers just to chase DSD. Stable PCM or DoP is better than an audio chain that cannot be debugged.

DSD also does not guarantee better sound. Mastering, conversion history, DAC design, and the speaker or headphone chain matter more than the label.

## Why ASIO May Seem To Sound Different

If ASIO sounds different, do not immediately conclude that ASIO itself improves quality. More common causes are:

- The volume is not level-matched.
- Shared mode is resampled to the Windows default format while ASIO is not.
- One path bypasses system effects, loudness normalization, spatial audio, or virtual surround.
- The player uses different buffer, bit-depth, or resampling behavior in different modes.
- The ASIO control panel applies hardware mixing, gain, filtering, or routing.
- The device uses different filters or output behavior at different sample rates.

Those changes can affect listening impressions, but they are not proof that the ASIO API itself is a sound-quality upgrade. Verify the format, volume, DSP state, and device lock before drawing conclusions.

## Practical Troubleshooting Flow

For silence, crackling, half-speed playback, double-speed playback, failed track switching, or device-open failures:

1. Set output mode to `System`.
2. Confirm the Windows output device, system volume, and app volume.
3. Exit background apps that may own the audio device, especially players, browsers, OBS, DAWs, voice apps, virtual sound cards, and third-party ASIO wrappers.
4. Disable EQ, FIR, ReplayGain, speed changes, channel processing, and extra resampling in ECHO.
5. Play a normal `44.1 kHz` / `48 kHz` PCM file.
6. After that is stable, try `WASAPI Shared`.
7. Then try `WASAPI Exclusive`.
8. Test official `ASIO` last.
9. Change only one variable at a time.

Do not change sample rate, output mode, driver, DSD, buffer size, channel routing, and DSP all at once. That makes the failure impossible to reproduce.

## Final Recommendation

- Daily stable listening: `System` / `WASAPI Shared`.
- External DAC with less system mixing: `WASAPI Exclusive`.
- ASIO cannot open: use `WASAPI Exclusive`.
- Exclusive is also unstable: return to `WASAPI Shared`.
- Use ASIO only when the driver is official, the device is stable, and the need is real.
- Do not treat third-party ASIO wrappers as a HiFi upgrade.
- Restore baseline PCM playback before enabling advanced modes.

The best playback chain is clear, stable, and easy to reason about. The biggest danger is not "missing ASIO"; it is turning the system into a complicated audio path that nobody can reproduce or maintain. If ASIO cannot open, use exclusive mode. If exclusive mode also fails, return to shared mode and debug from there.

---

# Audio Setup Advice

Source: src/content/docs/en/docs/audio-output/audio-advice.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/audio-output/audio-advice/
Description: Practical advice for output modes, sample rate, WASAPI, ASIO, DSD, and upsampling.

This page is for users who want ECHO to sound good and stay stable. Audio settings contain many impressive words: WASAPI, ASIO, DSD, sample rate, upsampling, exclusive mode, and third-party drivers. They can be useful, but they are not switches that automatically improve sound quality.

**Start with stable playback, a good device chain, and sane volume. Then think about high-resolution sources or upsampling.**

## Short version

1. For regular headphones, laptop audio, Bluetooth, or motherboard output, use `System`, `Windows Output`, or `WASAPI Shared`.
2. For an external DAC, you can try `WASAPI Exclusive` after shared mode is stable.
3. Do not assume ASIO is better. Some vendor ASIO drivers are immature, and third-party ASIO layers are usually not worth it for listening.
4. `ASIO4ALL` does not make headphones sound better.
5. Do not over-demand DSD from small dongles or entry-level DACs. Improve the device chain first.
6. In Windows sound settings, keep the default format at `44.1 kHz` or `48 kHz` for daily use.
7. If you want real upsampling, use a dedicated tool such as HQPlayer. Raising the Windows default sample rate is not the same thing.

## Windows default sample rate

For daily use, `24-bit / 48 kHz` is a safe default when your device supports it. `16-bit / 44.1 kHz` is also fine.

Do not choose the highest number just because it is available. A very high Windows default format can cause every system sound to be resampled to that rate, including music, games, browsers, video players, and chat apps. It may increase CPU load, add latency, and trigger driver problems without making the sound better.

This is not high-quality upsampling. It is usually just system resampling to a shared output format.

## WASAPI Shared and Exclusive

`WASAPI Shared` is the normal Windows shared audio path. It is best for daily use because multiple apps can play sound together.

`WASAPI Exclusive` lets the player take exclusive control of the device. It can reduce system mixing and let the player open the device at the track's format, but it depends heavily on the device and driver.

Use this as a starting point:

| Situation | Recommendation |
| --- | --- |
| Daily music, video, games | `WASAPI Shared` or system output |
| Laptop audio or direct headphone jack | System output or `WASAPI Shared` |
| External DAC | Try `WASAPI Shared` first, then `WASAPI Exclusive` |
| Entry-level DAC with stable exclusive mode | `WASAPI Exclusive` can be worth trying |
| No sound, failed track switching, device busy | Return to `WASAPI Shared` |

## ASIO is not magic

ASIO is mainly useful for professional audio interfaces, low-latency recording, and DAW workflows. It is not a sound-quality enhancer for ordinary headphones.

For normal listening:

- Official ASIO drivers for professional interfaces can be useful.
- Immature vendor drivers are not worth forcing.
- Third-party ASIO drivers are usually unnecessary.
- `ASIO4ALL` does not turn a basic device into a better DAC.
- Direct headphones, Bluetooth, and most dongles are better served by WASAPI or Windows output.

If ASIO or ASIO4ALL breaks, the first place to look is the driver author or device vendor. The player can call the driver, but it cannot make an unstable driver reliable.

## Official USB DAC Driver Links

The official driver links for common USB DAC, interface, and Hi-End audio vendors now live on a separate page: [Official USB DAC Driver Links](/en/docs/audio-output/usb-dac-drivers/).

The principle stays here: install USB or ASIO drivers only from the manufacturer website, manufacturer support portal, or an official regional site. ECHO only calls the audio device driver already installed through the operating system audio APIs, and does not provide installation help, repair, debugging, compatibility workarounds, or support for any third-party driver.

## Do not obsess over DSD

DSD can be useful, but it is not a requirement for good sound. For dongles, entry-level DACs, and ordinary headphones, chasing native DSD support often gives less benefit than improving the actual device chain.

Many DSD files on the market are also not guaranteed to come from a native DSD recording chain. Some are upsampled, converted, or repackaged. A good PCM master may sound better, and careful upsampling with a dedicated tool may suit your setup better.

Use DSD only when the device supports it reliably. If it causes noise, heat, battery drain, slow switching, or playback failure, return to PCM.

## Upsampling

Upsampling is not automatically better because the number is larger. Good upsampling depends on algorithms, filters, hardware capacity, and a stable output path.

If you want to experiment:

1. Use a dedicated tool such as HQPlayer.
2. Make sure the computer is fast enough.
3. Make sure the DAC supports the target rate.
4. Change one setting at a time.
5. Lower the settings if you hear pops, latency, or high CPU usage.

Upsampling is optional. Stability matters more than impressive numbers.

## Troubleshooting order

When you hear no sound, pops, half-speed playback, high latency, or failed track switching:

1. Return to `System`, `Windows Output`, or `WASAPI Shared`.
2. Disable ASIO, exclusive mode, DSD, upsampling, DSP, EQ, ReplayGain, and speed changes.
3. Set Windows default format back to `24-bit / 48 kHz` or `16-bit / 44.1 kHz`.
4. Test with a normal MP3 or FLAC that is known to work.
5. Try another output device.
6. Update or roll back the official DAC or audio driver.
7. Check whether another app is holding exclusive control of the device.

After basic playback is stable, enable advanced options one by one.

## Practical defaults

| User type | Recommended setting |
| --- | --- |
| Regular wired headphones | Windows output or `WASAPI Shared` |
| Bluetooth headphones | Windows output |
| Entry-level dongle DAC | `WASAPI Shared`, then try `WASAPI Exclusive` if stable |
| External DAC | Start with `WASAPI Shared`, then test exclusive mode |
| Professional interface | Try the official ASIO driver; return to WASAPI if unstable |
| Upsampling experiments | Use a dedicated tool, not the Windows default format |
| DSD playback | Use only when the device really supports it reliably |

Good audio is not a numbers contest. Stable playback, a clean device chain, sensible volume, and good recordings matter more than forcing the highest mode.

---

# DSD Playback

Source: src/content/docs/en/docs/audio-output/dsd.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/audio-output/dsd/
Description: How to enable DSD playback in ECHO Next, with notes about DoP, native DSD, ASIO drivers, and volume safety.

This guide is for users who want to play DSD in ECHO Next. DSD playback depends on the DAC, driver, output mode, and volume chain. Confirm regular PCM playback first, then enable DSD options.

![ECHO Next DSD settings](/assets/docs/dsd.png)

## Short version

1. Confirm that your DAC really supports DSD at the target rate.
2. Verify normal FLAC / WAV playback first.
3. In `Settings` -> `General` -> `Advanced audio engine`, enable the DSD-related options.
4. Try `DSD DoP direct output experiment` first.
5. Only try `ASIO native DSD experiment` with the DAC manufacturer's official ASIO driver.
6. Keep digital volume at `100%` for DSD playback and control loudness from your DAC, preamp, headphone amp, or amplifier.
7. Do not chase DSD blindly. Many DSD files in circulation are unofficial upsampled or transcoded versions, not native DSD recordings or trustworthy DSD masters.

## Options to enable

| Option | Recommendation | Meaning |
| --- | --- | --- |
| `Persistent native decoding` | Enable | Keeps native decoding available for DSD playback and falls back when needed. |
| `DSD DoP direct output experiment` | Try first | Wraps DSD data in PCM frames so a DoP-capable DAC can recover DSD. |
| `ASIO native DSD experiment` | Use carefully | Only for official DAC ASIO drivers and DACs that explicitly support Native DSD. |
| `Lock volume while playing DSD` | Strongly recommended | Locks ECHO volume to `100%` while DSD plays, then restores the previous volume for PCM. |

## Do not chase DSD blindly

DSD is a digital audio format, not an automatic quality guarantee. Many unofficial DSD files are converted from CD rips, PCM masters, or already-processed digital files. Converting a weak source to DSD does not create missing detail or turn it into a better master.

Prioritize the recording, mastering source, release credibility, and actual listening result. A trustworthy PCM master can be more valuable than an unknown DSF / DFF file that merely makes a DAC display `DSD`.

## Upsampling to DSD1024 or higher

If you want to upsample PCM to DSD1024 or even higher in real time, use software designed for high-quality upsampling and modulation, such as [HQPlayer](https://signalyst.com/).

This is a different job from regular playback. DSD1024-class upsampling involves filters, noise shaping, modulators, CPU / GPU load, buffering, DAC capability, and driver stability. It is not just a matter of choosing `DSD1024` in an output menu.

A better chain is:

```text
ECHO manages the library and starts playback -> HQPlayer handles upsampling / modulation / output -> DAC decodes
```

ECHO focuses on library management, playback control, stable output, and safe fallback. HQPlayer is the specialized tool for advanced upsampling, DSD modulation, NAA, and high-end DAC output chains.

## Why third-party ASIO drivers contradict DSD playback

DSD direct playback aims to send DSD data to the DAC with as few transformations as possible. It should avoid system mixing, resampling, digital volume, DSP, and unnecessary driver layers.

DSD and PCM are transported differently. PCM is a stream of multi-bit samples, and Windows mixers, volume controls, sample-rate converters, and generic drivers are mostly built around PCM. DSD is a very high-rate 1-bit stream that relies on noise shaping and downstream filtering. Ordinary digital volume, EQ, ReplayGain, or DSP usually requires converting DSD to PCM or remodulating it afterward.

Real DSD direct output needs the player, output API, driver, USB interface, and DAC to agree that the stream is DSD. For Native DSD, the driver may need to pass device-specific markers, rate information, channel layout, buffering behavior, and private control commands.

Third-party ASIO layers such as ASIO wrappers, virtual devices, or generic bridges usually do something else: they wrap WDM, WASAPI, or virtual PCM devices behind an ASIO-looking interface. They may help software that only exposes ASIO, but they do not magically provide the DAC manufacturer's Native DSD protocol.

So the goal and the method conflict:

1. You want fewer middle layers, but the wrapper adds another layer.
2. You want device-level Native DSD, but the wrapper often only sees a generic PCM device.
3. You want a bit-perfect or near bit-perfect DSD path, but the wrapper may resample, convert to PCM, or route through the system mixer.
4. You want the DAC to detect DSD, but the driver layer may not pass DSD markers correctly.

In short:

```text
Intended Native DSD path:
Player -> official DAC ASIO driver -> DAC DSD receive path

Common third-party ASIO wrapper path:
Player -> ASIO wrapper -> Windows generic audio path / virtual device -> DAC
```

The first path depends on device knowledge from the DAC vendor. The second path mostly gives software an ASIO-shaped output. Those are not the same problem, which is why using the second path to pursue the first result is contradictory.

Use the DAC manufacturer's official USB audio driver and official ASIO driver when Native DSD matters. If you do not have one, use stable WASAPI / PCM playback instead of installing unknown ASIO drivers.

## foobar2000 can use third-party ASIO, so why not ECHO

Some users may point out that `foobar2000` can use output components, plugins, or third-party ASIO wrappers. That is true, but it is not the same as ECHO making those paths an official support target.

foobar2000 is highly open and plugin-oriented. That freedom is useful for advanced users, but it also creates many unstable combinations: different ASIO components, wrapper drivers, Windows audio paths, DAC drivers, buffer settings, and device quirks. If one setup produces sound, it does not prove the path is correct DSD direct output, nor does it mean the same setup will be stable elsewhere.

ECHO prioritizes predictable playback, volume safety, fallback behavior, and understandable troubleshooting for regular users. Third-party ASIO wrappers are not a good support target because their behavior is hard to verify, their backend may still be WASAPI / WDM / a virtual device, and DSD markers or Native DSD controls may be lost or rewritten. If ECHO adds special handling for those wrappers, users may reasonably interpret that as an official recommendation or stability promise.

So ECHO does not aim to adapt every third-party ASIO wrapper. This is not because experimentation is impossible; it is because the path is not worth encouraging as a stable DSD solution. For DSD, use DoP first, and only use Native DSD with the DAC manufacturer's official ASIO driver and clearly supported hardware.

## Volume safety

For DSD playback, keep ECHO, system, and software digital volume at `100%`. Control the real listening level from the DAC, preamp, headphone amp, or amplifier.

Digital volume on DSD usually requires converting DSD to PCM or applying special processing and remodulation. That breaks the idea of DSD direct output. `100%` digital volume does not mean you should listen loudly. It means the software should not rewrite the DSD stream. Start with the preamp or amp turned down, then raise it slowly after playback starts.

## Recommended first test

1. Connect the DAC and install the official driver.
2. Play a normal FLAC file first.
3. Enable `Persistent native decoding`.
4. Enable `Lock volume while playing DSD`.
5. Enable `DSD DoP direct output experiment`.
6. Leave `ASIO native DSD experiment` off at first.
7. Turn down the DAC, preamp, or amp volume.
8. Play a DSF / DFF file.
9. Check whether the DAC display indicates DSD.
10. If you hear noise, silence, stutter, or the DAC does not detect DSD, stop and return to PCM playback for troubleshooting.

If DoP works reliably and the DAC displays DSD correctly, you do not need to chase Native DSD. Stability and safe volume control matter more than enabling every experimental switch.

---

# dsp-beginner

Source: src/content/docs/en/docs/audio-output/dsp-beginner.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/audio-output/dsp-beginner/

---
title: "DSP Beginner Guide"
description: "A beginner-friendly DSP guide covering signal flow, bit-perfect, Headroom, EQ, correction, and output safety."
sidebar:
  order: 42
  label: "DSP Beginner Guide"
---

这份教程写给第一次打开 `DSP` 工作台的人。你不需要先成为录音师，也不需要背完一堆英文术语。先记住一句话：

**DSP 就是 ECHO 在把声音送到耳机、音箱或 DAC 之前，对数字音频做的可控处理。**

不开 DSP 时，ECHO 尽量保持原始输出路径；开启 EQ、耳机校正、FIR、声道工具、Headroom 等模块后，声音会经过处理链。处理本身不是坏事，但它会改变信号，也通常会让当前播放不再是 bit-perfect 候选路径。

## 什么时候先别开 DSP

如果你只是想确认播放器、声卡、DAC、耳机是否正常，先保持 DSP 全关。

尤其是这些情况，先别急着调音：

1. 刚安装软件，正在确认有没有声音。
2. 正在排查爆音、无声、半速、卡顿、切歌失败。
3. 正在验证 WASAPI Exclusive / ASIO / 外置 DAC 是否稳定。
4. 正在判断某个音乐文件是不是损坏。
5. 想确认原始输出、采样率和 bit-perfect 候选状态。

排查问题时的安全顺序是：先切回 `System` 或 `WASAPI Shared`，关闭 EQ / FIR / 声道工具 / ReplayGain / 变速，换一首普通 MP3 或 FLAC 试听。等基础播放稳定后，再逐个打开 DSP 模块。

## DSP 工作台怎么认

左侧进入 `DSP`，你会看到一条类似信号链的工作区。它不是“音效商城”，更像一张清楚的路线图：声音从输入进来，经过哪些处理，再送到输出。

| 模块 | 你可以这样理解 | 新手建议 |
| --- | --- | --- |
| `Headroom` | 先把音量空间让出来，防止后面处理把信号顶爆 | 开 EQ / FIR 前优先用 |
| `参数 EQ` | 调低频、人声、高频、空气感这些声音风格 | 先用 Simple，再进 Pro |
| `耳机校正` | 用 OPRA 曲线修正特定耳机的频响倾向 | 找到型号再用，不要乱套 |
| `FIR / 房间校正` | 导入 IR，用卷积处理房间或设备响应 | 有可靠 IR 文件再用 |
| `声道工具` | 调左右平衡、延迟、Mono、左右互换 | 偏音或声像不居中时用 |
| `输出安全` | 看削波、余量、bit-perfect、模块状态 | 经常看，不需要手动调太多 |

最稳的上手方式是：每次只动一个模块，听同一首歌，确认变化，再继续下一步。

## 新手推荐路线

第一次调 DSP，建议按这个顺序：

1. 播放一首你非常熟的歌，最好是声音正常、不是现场版、不是极端混音。
2. 打开 `DSP` 工作台，先看顶部状态是不是 `Native direct` 或类似原生直通。
3. 进入 `Headroom`，如果准备增强低频、高频或启用 FIR，先预留一点余量，例如使用界面建议或 `-6 dB` 保护。
4. 进入 `参数 EQ`，保持 `Simple` 模式，先试 `Bass`、`Vocal`、`Air`、`Warm` 这类大方向。
5. 如果出现“爆”“糊”“刺”“音量忽大忽小”，先降低 Preamp 或 Headroom，不要继续往上推。
6. 想对比原声，就用旁路、关闭 EQ，或回到输出安全看当前 DSP 是否仍 active。
7. 调到舒服后保存方案；不舒服就重置，不要硬留。

调音不是考试。你听得更舒服、又没有削波风险，就是合格。

## 数字音频最小科普

### PCM 是什么

大多数播放器内部最终都要把音乐变成 PCM。你可以把 PCM 想成一长串数字采样点：每秒取很多次声音的高度，再把这些数字送给声卡。

常见的 `44.1 kHz / 16-bit` 大致意思是：

- `44.1 kHz`：每秒 44100 个采样点。
- `16-bit`：每个采样点用 16 位数字表示音量精度。

Hi-Res 文件可能是 `96 kHz / 24-bit`、`192 kHz / 24-bit`。数字更大不自动等于更好听，录音、母带、设备和输出链路同样重要。

### 采样率不是音量

采样率表示“每秒测量多少次”，不是“声音有多大”。把 44.1 kHz 强行升到 192 kHz，不会凭空多出录音里没有的信息。它可能用于设备兼容、统一输出或某些处理流程，但不要把重采样当成音质魔法。

### bit depth 不是频响

位深影响的是动态范围和量化精度，不是低频多不多、高频亮不亮。24-bit 给制作和处理留了更多空间，但最终听感还取决于录音、响度、设备和环境。

### dB 是相对刻度

EQ、Preamp、Headroom 常用 `dB`。它不是线性刻度：

- `+3 dB` 已经是明显增强。
- `+6 dB` 很容易让输出接近上限。
- `-6 dB` 常用来给 DSP 留安全空间。

所以调 EQ 时，少量多次比一口气拉满更稳。

### 削波为什么难听

数字音频有一个天花板，通常叫 `0 dBFS`。信号超过这个上限时，波形会被截平，这就是 clipping / 削波。削波会让声音变硬、炸、刺，严重时像破音。

EQ 往上推、FIR 增益、声道补偿、ReplayGain、音量叠加，都可能让信号接近上限。`Headroom` 的作用就是先把整体电平往下让一点，给后面的处理留空间。

### bit-perfect 是什么

bit-perfect 可以简单理解为：播放器尽量把文件里的数字样本原样送出去，不改 EQ、不改音量、不重采样、不做其它处理。

这不是“永远更好听”的保证，而是一个验证链路的状态。你想确认 DAC、驱动、采样率是否按预期工作时，它很有用；你想让耳机更顺耳、修正房间、调左右偏音时，就会主动离开 bit-perfect。

更白话一点：

- bit-perfect 像“原封不动送快递”。
- DSP 像“送出前先按你的要求重新包装、修边、加保护”。

两者没有绝对高下，关键是你现在想做什么。

## EQ 怎么调才不容易翻车

EQ 是最常用的 DSP。新手先用 `Simple`，把它当成几个声音方向按钮：

| 想要 | 先试 | 注意 |
| --- | --- | --- |
| 鼓更有重量 | Bass | 低频多了可能糊，必要时降 Preamp |
| 人声更靠前 | Vocal | 太多会吵或鼻音重 |
| 高频更亮、更有空气 | Air | 太多会刺、齿音重 |
| 声音更厚、更柔和 | Warm | 可能牺牲清晰度 |
| 回到原始曲线 | Flat / Reset | Flat 不等于关闭 DSP，开关状态也要看 |

如果你进入 `Pro`，建议先只记住三段：

- 低频：大约 `20 Hz` 到 `160 Hz`，影响鼓、贝斯、厚度和轰鸣。
- 中频/人声：大约 `250 Hz` 到 `4 kHz`，影响人声、吉他、钢琴和存在感。
- 高频/空气：大约 `5 kHz` 到 `20 kHz`，影响亮度、齿音、空间感和细节感。

不要所有频段都往上推。想让某个部分更突出，很多时候是把其它部分稍微降下来，而不是一味加。

## Headroom 怎么用

Headroom 是“预留空间”。它不负责让声音变好听，它负责让后面的处理不要把声音顶爆。

推荐理解：

- `0 dB`：不额外预留。
- `-3 dB`：轻量保护，适合小幅 EQ。
- `-6 dB`：比较保守，适合明显低频增强、FIR、多个 DSP 模块叠加。
- 更低：只在确实有风险时使用。

开了 Headroom 后，整体可能会变小声。这不是坏掉，而是给信号留了余量。你可以在系统音量、耳放或设备端补回舒适音量，但不要为了“看起来响”把 DSP 处理一路推红。

## 耳机校正是什么

耳机校正不是“把所有耳机变成神耳机”。它更像给某个耳机型号贴一张修正地图：哪里太多，哪里太少，就用曲线轻轻补偿。

ECHO 的耳机校正会把 OPRA 相关曲线作为受管理的 EQ 状态使用。看到“耳机校正管理中”之类提示时，不要直接把它当普通自定义 EQ 乱改；如果你想继续自由编辑，先转换成自定义方案。

新手建议：

1. 只给确实匹配的耳机型号使用校正。
2. 校正后先用 A/B 对比确认是否更自然。
3. 如果声音变薄、变闷、变刺，关闭校正，不要硬用。
4. 耳机校正通常会影响 bit-perfect，这是正常的。

## FIR / 房间校正是什么

FIR / 房间校正常见于导入 IR 文件。IR 可以理解成一个“声音指纹”：系统用它来做卷积处理，让输出符合某个目标响应。

它适合这些场景：

- 你有测量麦克风和可靠测量流程。
- 你拿到了可信的房间、耳机或设备 IR。
- 你知道这个 IR 是给当前采样率、声道和用途准备的。

不适合这些场景：

- 随便下载一个不知道来源的 IR。
- 边排查播放问题边开 FIR。
- 没留 Headroom 就启用大幅校正。

安全做法：导入 IR 后，先预留 `-6 dB` 左右 Headroom，再启用 FIR，听音量、相位、左右声道是否正常。发现削波风险就先降低 Trim 或 Headroom。

## 声道工具怎么用

声道工具主要处理“左右”的问题，而不是处理整体音色。

常见用途：

- 耳机一边稍微大声，调左右增益。
- 人声不在中间，微调声像平衡。
- 检查左右声道有没有接反，临时交换左右。
- 用 Mono 检查左右合并后是否正常。
- 用左右延迟微调声像位置。

新手原则：只做小改动。左右增益从 `0.25 dB` 或 `0.5 dB` 这种小步开始；延迟也不要大幅拉。你是在微调方向盘，不是在拆车。

## 输出安全怎么看

`输出安全` 是 DSP 工作台里最值得经常看的页面。它会告诉你：

- 当前有没有 DSP 模块启用。
- 当前是不是 bit-perfect 候选路径。
- 有没有削波或余量风险。
- FIR、EQ、声道工具是否参与了处理。
- 建议下一步是继续监听、保持直通，还是先处理余量。

看到风险提示时，优先顺序是：

1. 降低 Headroom 或应用建议保护。
2. 降低 EQ 的 Preamp。
3. 减少 EQ 里向上推的频段。
4. 降低 FIR Trim。
5. 暂时关闭某个 DSP 模块，确认风险来自哪里。

不要在已经有削波风险时继续叠加更多增强。

## 常见问题

### 开了 DSP 以后 bit-perfect 没了，是 bug 吗

通常不是。EQ、FIR、声道处理、耳机校正、重采样、ReplayGain 等都会改变数字信号。只要改变了样本，就不能再说是原封不动输出。

### Flat 是不是等于关闭 EQ

不一定。`Flat` 只是曲线看起来平，EQ 开关如果仍然启用，信号仍可能经过 DSP 链路。想确认完全关闭，应该看 EQ 开关和输出安全状态。

### 为什么调高低频后声音反而变差

可能是低频堆积、Preamp 没降、耳机本身承受不了、录音本来就重低频，或者已经削波。先降低 Preamp / Headroom，再把增强幅度减半。

### 为什么开了 Headroom 声音变小

这是它的工作。Headroom 通过降低数字电平给后续处理留空间。你可以在设备端把听感音量补回来，但不要用数字增益把它又推爆。

### 新手到底该开哪些

日常听歌建议从这套开始：

1. `Headroom`：按建议或轻量预留。
2. `参数 EQ`：Simple 模式轻微调整。
3. `输出安全`：确认没有削波。

耳机校正、FIR、声道工具等到你有明确需求再开。

## 一句话总结

DSP 不是“越多越 HiFi”，而是“你明确知道想修哪里，并且能安全地修”。ECHO 的 DSP 工作台要帮你做到三件事：看清当前声音有没有被处理、知道处理会不会带来风险、随时能回到原始直通。

For the shorter Simple-mode guide, see [DSP Simple Guide](/en/docs/audio-output/dsp-simple/). For implementation scope and boundaries, see [EQ Guide](/en/docs/audio-output/eq/).

---

# dsp-simple

Source: src/content/docs/en/docs/audio-output/dsp-simple.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/audio-output/dsp-simple/

---
title: "DSP Simple Guide"
description: "A lightweight Simple-mode guide for Bass, Vocal, Air, Warm, Flat, safety hints, and Simple / Pro choice."
sidebar:
  order: 43
  label: "DSP Simple Guide"
---

`Simple` 是给普通听歌用户准备的轻量调音模式。它不是缩水版，也不是“低级模式”。它更像自动挡：你只告诉 ECHO 你想往哪个方向听，软件帮你把背后的 EQ 频点、前级和安全提示整理好。

如果 `Pro` 像一张满是旋钮的调音台，`Simple` 就像几张声音风格卡片：

- 想低频更有重量，点 `Bass`。
- 想人声更靠前，点 `Vocal`。
- 想高频更亮，点 `Air`。
- 想声音更厚、更柔和，点 `Warm`。
- 想回到平直，点 `Flat` 或重置。

## Simple 到底在干嘛

声音可以粗略分成三块：

| 区域 | 像什么 | 你会听到 |
| --- | --- | --- |
| 低频 | 地基和鼓点 | 低音、贝斯、鼓的重量 |
| 中频 | 人声和身体 | 歌手、吉他、钢琴、厚度 |
| 高频 | 光泽和空气 | 亮度、齿音、空间感、细节 |

`Simple` 不让你一上来面对一排频点，而是把常见动作做成按钮。你点 `Vocal`，它会主要照顾人声区域；你点 `Air`，它会轻轻处理高频空气感；你点 `Bass`，它会增加一点低频存在感。

## 新手怎么用

推荐这样试：

1. 播放一首你熟的歌。
2. 进左侧 `DSP`，打开 `参数 EQ`。
3. 保持 `Simple`。
4. 只点一个方向，例如 `Vocal`。
5. 听 20 到 30 秒。
6. 不舒服就换方向或重置，不要连续猛点。
7. 看到安全提示，就先点建议的安全动作或降低 Preamp。

你不是在“调出最正确答案”，你是在找“今天这副耳机、这首歌、这个音量下更舒服的声音”。

## 每个按钮怎么理解

| 按钮 | 白话解释 | 适合 |
| --- | --- | --- |
| `Bass` | 给鼓和贝斯加一点重量 | 流行、电子、低频偏薄的耳机 |
| `Vocal` | 把歌手从背景里稍微推出来 | 人声、ACG、播客、现场录音 |
| `Air` | 给高频和空间感开一点窗 | 声音偏闷、细节不够清楚 |
| `Warm` | 让声音更厚、更不刺激 | 高频偏刺、冷薄的设备 |
| `Flat` | 回到平直曲线 | 对比原始风格、重新开始 |

注意：`Flat` 只是曲线平直，不一定等于彻底关闭 DSP。想确认原始输出，要看 EQ 开关和 `输出安全` 页面。

## 安全提示怎么处理

如果 Simple 提醒你有削波或余量风险，别紧张。它大概是在说：

“你刚才把声音某些地方加高了，数字音频快碰到天花板了，先让一点空间。”

处理顺序很简单：

1. 点界面建议的安全动作。
2. 或把 Preamp 降低一些。
3. 或把刚才的增强幅度减小。
4. 如果还不放心，关掉 EQ 对比。

不要为了更大声一直往上推。大声不等于好听，爆掉更不等于 HiFi。

## Simple 和 Pro 怎么选

| 你现在的状态 | 选哪个 |
| --- | --- |
| 只是想声音更顺耳 | Simple |
| 不知道 1 kHz、Q 值、Preamp 是什么 | Simple |
| 想快速试几种味道 | Simple |
| 想精确改某个频点 | Pro |
| 要导入 Equalizer APO / 复杂 EQ | Pro |
| 要保存、绑定、微调完整方案 | Pro |

Simple 的目标是让你不用害怕 DSP。等你知道“我想减 6 kHz 的刺”“我想让 100 Hz 少一点轰”“我想控制 Q 值”时，再去 Pro。

## 一套懒人流程

日常听歌可以这样：

1. 先不开 DSP，确认这首歌本身正常。
2. 想要更有氛围，开 `Simple`。
3. 在 `Bass`、`Vocal`、`Air`、`Warm` 里选一个最顺耳的。
4. 有风险就应用安全建议。
5. 保存成自己的方案。
6. 想认真对比，就关闭 EQ 听 10 秒，再打开听 10 秒。

如果你分不出差别，那也很好：说明现在不需要调。DSP 最好的状态不是永远开满，而是在需要时刚好帮上忙。

## 最短结论

`Simple` 就是 ECHO 的“别让我看参数，我只想让声音更舒服”模式。它把复杂 EQ 包成几个听感方向，同时提醒你别把声音推爆。先用它，够用了就停；不够再进 `Pro`。

For the full beginner walkthrough, see [DSP Beginner Guide](/en/docs/audio-output/dsp-beginner/).

---

# eq

Source: src/content/docs/en/docs/audio-output/eq.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/audio-output/eq/

---
title: "EQ Guide"
description: "ECHO Next EQ scope, bit-perfect rules, DSP chain, preset format, and stability checks."
sidebar:
  order: 41
  label: "EQ"
---

ECHO NEXT EQ 是可播放、可解释、可关闭的 HiFi DSP 功能。它的第一原则不是“看起来专业”，而是让用户清楚知道：EQ 何时在改变声音、何时会禁用 bit-perfect、何时可能削波、何时已经真正 bypass。

## Recommended Reading

If you are not looking for implementation details, start here:

- [DSP Beginner Guide](/en/docs/audio-output/dsp-beginner/): DSP, bit-perfect, Headroom, EQ, correction, and output safety in plain language.
- [DSP Simple Guide](/en/docs/audio-output/dsp-simple/): Bass, Vocal, Air, Warm, Flat, and Simple / Pro choice for lightweight tuning.

## 定位

EQ 属于 Audio Core 的 DSP 能力，不属于单纯 UI 装饰。

它应该做到：

- 实时可调。
- 不破坏播放稳定。
- 不在音频回调里做危险操作。
- 清楚影响 bit-perfect。
- 预设可保存、可导入、可回退。
- UI 对新手友好，同时保留专业控制。

它不应该做到：

- 伪装成“音质增强”。
- 默认开启并改变用户声音。
- 把 Flat preset 当作关闭 EQ。
- 为了曲线动画拖慢播放。
- 把 VST、卷积、房间校正、在线预设市场混进第一阶段。

## 功能范围

当前 EQ 核心范围：

- 10-band graphic / parametric hybrid EQ。
- band gain: `-12 dB` 到 `+12 dB`。
- preamp: `-12 dB` 到 `+6 dB`。
- band center frequency: `20 Hz` 到 `20 kHz`。
- fixed Q，当前默认 `1.0`。
- enable / bypass。
- built-in presets。
- user presets。
- curve visualization。
- clipping / headroom warning。
- native realtime DSP hook。

默认频点：

```text
31 Hz, 62 Hz, 125 Hz, 250 Hz, 500 Hz, 1 kHz, 2 kHz, 4 kHz, 8 kHz, 16 kHz
```

后续能力可以加，但不能挤进音频热路径：

- full parametric bands。
- realtime analyzer。
- dynamic EQ。
- auto gain。
- A/B compare persistence。
- per-output profile。
- per-headphone profile。

明确不在当前范围：

- VST host。
- convolution / room correction。
- AutoEQ database。
- network preset marketplace。
- 和歌词、MV、下载器、流媒体强绑定。

## Bit-perfect 规则

只要 EQ 启用，Audio Status 必须表达：

- `eqEnabled = true`
- `dspActive = true`
- `bitPerfectCandidate = false`
- `bitPerfectDisabledReason = eq_enabled`
- UI 显示当前输出不是 bit-perfect

EQ 关闭或 bypass 完成后：

- native processor crossfade 回 dry signal。
- bypass smoothing 到零后不再改变样本。
- 如果没有其他 DSP、重采样、ReplayGain、声道平衡或输出 mismatch，`bitPerfectCandidate` 才可以恢复。

Flat preset 不是 disabled：

- Flat 只是所有 band 为 `0 dB`、preamp 为 `0 dB`。
- 如果 EQ 仍启用，信号依然经过 DSP 链路。
- UI 不能把 Flat 写成 bit-perfect。

## 信号链路

```text
Decoded PCM
  -> optional ReplayGain / gain stage
  -> EQ Processor
       preamp
       band filters
       smoothing
       bypass crossfade
       clipping risk detection
  -> output bridge
```

原则：

- DSP 状态必须进入 audio status。
- UI 控制变化走 control path，不进入 PCM stdin。
- 音频回调只读实时安全参数。
- 预设文件 IO 不进入音频回调。

## Native DSP 结构

相关 native 文件：

- `native/audio-engine/EqTypes.h`
- `native/audio-engine/EqBand.h`
- `native/audio-engine/EqProcessor.h`
- `native/audio-engine/EqProcessor.cpp`
- `native/audio-engine/EqPresetStore.h`
- `native/audio-engine/EqPresetStore.cpp`
- `native/audio-engine/EqMessageProtocol.h`
- `native/audio-engine/EqMessageProtocol.cpp`

`EqProcessor` 负责：

- 每声道 biquad 状态。
- atomic target parameters。
- preamp smoothing。
- band gain smoothing。
- frequency smoothing。
- bypass crossfade。
- clipping risk detection。
- NaN / Inf 防护。

`EqMessageProtocol` 负责：

- 在控制线程解析 JSON-line。
- 校验参数。
- 更新 atomic targets。
- 不在 audio callback 内解析 JSON。

## 实时安全规则

JUCE/native audio callback 禁止：

- 分配大对象。
- 读写 JSON。
- 读写 preset 文件。
- 访问 Electron / React / IPC。
- 等待 mutex。
- 发网络请求。
- 打日志到慢 IO。
- 每个 sample 都重建所有滤波器系数。

参数更新必须：

- clamp 非法值。
- 使用 atomic target。
- gain / preamp 平滑约 `25 ms`。
- bypass crossfade 约 `15 ms`。
- 快速拖动时不输出 NaN / Inf。
- 频率拖动平滑后再重算系数。

## Electron Bridge

Renderer 只通过 `window.echo.eq` 控制 EQ。

命令：

- `eq:get-state`
- `eq:set-enabled`
- `eq:set-band-gain`
- `eq:set-band-frequency`
- `eq:set-preamp`
- `eq:set-preset`
- `eq:reset`
- `eq:list-presets`
- `eq:save-preset`
- `eq:import-preset`
- `eq:export-preset`
- `eq:delete-preset`

Renderer 不能：

- 直接访问音频 buffer。
- 直接控制 native socket。
- 直接写 preset 文件。
- 自己决定 bit-perfect 状态。

控制消息示例：

```json
{ "type": "eq:set-band-gain", "band": 3, "gainDb": 2.5 }
```

```json
{ "type": "eq:set-band-frequency", "band": 3, "frequencyHz": 360 }
```

状态示例：

```json
{
  "type": "eq:state",
  "enabled": true,
  "preampDb": -3,
  "bands": [
    { "frequencyHz": 31, "gainDb": 0, "q": 1 }
  ],
  "dspActive": true,
  "bitPerfectCandidate": false,
  "bitPerfectDisabledReason": "eq_enabled"
}
```

## Preset 格式

```json
{
  "id": "bass-boost",
  "name": "Bass Boost",
  "preampDb": -2,
  "bands": [
    { "frequencyHz": 31, "gainDb": 4, "q": 1 }
  ],
  "createdAt": "built-in",
  "updatedAt": "built-in",
  "readonly": true
}
```

内置预设建议：

- Flat
- Bass Boost
- Vocal Clear
- Treble Sparkle
- Loudness
- Night
- Headphone Warm
- Anime / J-Pop
- Rock
- Classical

规则：

- Built-in preset 只读。
- User preset 存在 Electron `userData`。
- 读取时校验字段、范围、band 数量。
- malformed preset 不能让设置页白屏。
- 导入同 id preset 时生成新 id，不静默覆盖本地调音。
- 删除用户 preset 后要 fallback 到安全状态。

## UI 结构

EQ UI 应该分层：

### Simple

给普通用户：

- 总开关。
- preset selector。
- preamp。
- headroom / clipping warning。
- reset。
- bit-perfect 影响提示。

### Pro

给高级用户：

- curve view。
- draggable band nodes。
- 频率 / 增益精确输入。
- selected band 控制。
- A/B 对比。
- undo / redo。
- preset save / import / export / delete。

### 状态提示

必须可见：

- EQ 是否启用。
- 当前是否 bypass。
- 当前是否影响 bit-perfect。
- 是否有 clipping risk。
- 当前 preset 是否已修改但未保存。

不要把复杂解释塞满页面。普通用户只需要知道“现在声音有没有被改、风险是什么、怎么关掉”。

## 曲线交互

曲线交互要稳：

- 拖动时节流发送。
- release 时发送准确最终值。
- band 节点尺寸稳定。
- tooltip 显示频率和增益。
- 不能因为快速拖动导致 UI 卡顿或 native 参数爆炸。
- 键盘/输入框也能精确调整。

曲线只是控制视图，不是事实来源。事实来源是 EQ state。

## Headroom 和削波

高增益 EQ 可能导致 clipping。

UI 应该：

- 在风险出现时提示降低 preamp。
- 不要自动偷偷改用户 preset，除非明确启用 auto gain。
- 区分“可能削波”和“已经检测到削波风险”。
- 夜间、低音增强等 preset 默认保留合理 preamp。

## 稳定性验收

Native DSP 测试应覆盖：

- disabled EQ 完全返回 dry input。
- Flat preset 启用时数值透明，但状态仍报告 DSP active。
- 高增益后 bypass crossfade 完成能回到 dry output。
- 快速 gain / frequency / preamp 改动不输出 NaN / Inf。
- 频率 clamp 在 `20 Hz` 和 `20 kHz` 边界稳定。
- steady-state 不每 sample 重算所有 biquad。

TypeScript / Renderer 测试应覆盖：

- `EqBridge` 输入校验。
- preset 持久化。
- malformed preset fallback。
- UI 开关和 preset 操作。
- 曲线编辑、undo/redo、A/B。
- EQ 或 channel balance 开启时 bit-perfect 状态禁用。
- headroom / clipping-risk telemetry。

可用入口：

```text
npm run test:audio-engine
```

只改文档不需要跑这些测试；改 native DSP 或 bridge 时才跑对应窄测试。

## 和其它音频功能的关系

EQ 与这些能力都可能共同影响 bit-perfect：

- ReplayGain。
- Preamp。
- Volume。
- Channel balance。
- Resampling。
- Speed / pitch。
- Crossfade / automix。

Audio Status 需要合并原因，不要只显示最后一个原因。UI 可以做简化展示，但诊断里要能看到完整原因列表。

## 一句话标准

ECHO NEXT 的 EQ 应该让声音调整更可控，而不是让声音链路更神秘。只要 EQ 开启，用户就应该清楚知道它改变了信号；只要 EQ 关闭，系统就应该真正回到不处理样本的路径。

---

# HiFi Audio Glossary

Source: src/content/docs/en/docs/audio-output/hifi-glossary.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/audio-output/hifi-glossary/
Description: A practical glossary for imaging, separation, soundstage, sample rate, bit-perfect playback, DACs, amps, DSP, EQ, FIR, and output safety.

This glossary explains common HiFi and digital-audio terms in practical language. It is written for ECHO users who want to understand what they are hearing, what a setting changes, and how to troubleshoot without turning audio into a numbers contest.

The most important rule is simple:

**Terms should help you listen, adjust, and diagnose. They are not proof that a setting is automatically better.**

If playback is unstable, return to `System` or `WASAPI Shared`, disable EQ, DSP, ReplayGain, speed changes, FIR, exclusive mode, ASIO, and DSD, then test a normal MP3 or FLAC first.

## Quick Index

| Topic | Start with |
| --- | --- |
| Listening impressions | Resolution, separation, imaging, soundstage, layering, dynamics, transient response |
| File formats | PCM, DSD, FLAC, WAV, sample rate, bit depth, bitrate, lossless, Hi-Res |
| Output path | WASAPI, ASIO, exclusive mode, bit-perfect, resampling, cables, Bluetooth codec, latency |
| Hardware | DAC, amp, impedance, sensitivity, power, noise floor, SNR, distortion, crosstalk |
| DSP | EQ, preamp, headroom, FIR, IIR, phase, compressor, limiter, crossfeed |

## Listening Terms Are Not Measurements

Words such as resolution, separation, imaging, and black background describe perception. They are useful, but they are not single-number measurements.

For fair comparison:

1. Use tracks you know well.
2. Change one setting at a time.
3. Match volume as closely as possible.
4. Separate "more exciting" from "more accurate."
5. Remember that a change can suit one track and hurt another.

## Resolution

Resolution describes how clearly a system reveals detail: breaths, string texture, reverb tails, drum brush noise, or quiet backing parts.

Good resolution is not the same as boosted treble. A device or EQ curve can fake detail by emphasizing upper mids and treble, but that often becomes sharp or tiring.

Healthy resolution usually means:

- Small details are audible but not forced forward.
- Treble is clear without becoming sharp.
- Reverb tails and weak sounds appear naturally.
- Complex passages remain readable.

## Separation

Separation describes how easily you can distinguish different instruments or voices when they play together. Poor separation makes the mix sound smeared or congested.

It is affected by recording quality, distortion, crosstalk, excessive bass, room acoustics, and DSP choices.

Before blaming the player, try lowering excess bass, disabling stereo enhancement, checking clipping risk, and comparing with a clean recording.

## Imaging

Imaging describes whether sounds have stable positions in the stereo field. A centered vocal should stay centered; instruments should feel placed rather than floating randomly.

Bad imaging can come from channel imbalance, reversed left/right channels, poor fit, room reflections, aggressive spatial DSP, or the recording itself.

In ECHO, use channel balance, mono checks, and left/right swap tools when the image feels off-center.

## Soundstage

Soundstage is the perceived size and shape of the listening space: width, depth, height, and distance.

Bigger is not always better. Overdone virtual space can make vocals hollow or distant. A smaller but stable stage can be more natural than a huge artificial one.

Soundstage depends on the recording, headphones or speakers, room reflections, channel matching, crossfeed, HRTF, and EQ.

## Layering

Layering describes front-to-back order and musical priority. Separation is about whether sounds are distinct; layering is about whether they sit in a believable order.

Layering suffers when bass or low mids mask other content, dynamics are over-compressed, volume is too high, or spatial processing is unnatural.

## Dynamics

Dynamics describe changes from quiet to loud. Macro-dynamics are large swings such as drum hits or orchestral climaxes. Micro-dynamics are small expressive changes such as vocal phrasing or piano touch.

Over-compressed masters, clipping, weak amplification, heavy limiting, and aggressive loudness processing can all flatten dynamics.

## Transient Response

Transient response describes how cleanly sound starts and stops: drum hits, plucked strings, piano attacks, electronic kicks.

Fast transients can sound lively and rhythmic. Too much upper-mid or treble emphasis can fake speed while becoming sharp.

## Tone Words

| Word | Meaning | Possible downside |
| --- | --- | --- |
| Warm | Fuller lows and low mids, smoother highs | Muddy or slow |
| Cool | Leaner lows, clearer edges | Thin or hard |
| Bright | More upper mids or treble | Sharp or sibilant |
| Dark | Reduced treble, softer tone | Veiled or lacking air |

These are preferences, not rankings.

## Sibilance

Sibilance is sharpness around vocal `s`, `sh`, `z`, and similar sounds. It often lives somewhere around `5 kHz` to `10 kHz`, but the exact area depends on the voice and system.

It can come from the recording, headphone peaks, EQ, high volume, compression, or exciters. Fix it gently; do not remove all treble just to hide sibilance.

## Noise Floor And Black Background

Noise floor is the background hiss, hum, or electrical noise under the signal. A "black background" means quiet passages feel clean and free of noise.

Noise can come from the DAC, amp gain, sensitive IEMs, USB power, ground loops, drivers, or the recording itself. If hiss remains while playback is paused, the hardware chain is likely involved.

## PCM

PCM is the most common digital-audio representation. It stores audio as a sequence of samples.

Common examples:

- `44.1 kHz / 16-bit`: CD standard.
- `48 kHz / 24-bit`: common for video, system audio, and production.
- `96 kHz / 24-bit` or `192 kHz / 24-bit`: common Hi-Res PCM.

PCM is not inferior. Most modern production and playback processing uses PCM somewhere in the chain.

## DSD

DSD is a different digital-audio format, commonly seen as DSD64, DSD128, or DSD256.

Important points:

1. DSD playback depends heavily on the DAC and driver.
2. Unsupported paths may convert it to PCM.
3. DoP packages DSD in a PCM-like transport frame; it is not ordinary PCM playback.
4. A DSD file is not guaranteed to come from a native DSD recording chain.
5. If DSD causes problems, return to PCM and verify basic playback.

## FLAC, WAV, ALAC, APE

| Format | Type | Notes |
| --- | --- | --- |
| WAV | Usually uncompressed PCM container | Large files, simple structure |
| FLAC | Lossless compression | Common, smaller, good metadata support |
| ALAC | Apple lossless | Common in Apple ecosystems |
| APE | Lossless compression | Older libraries, sometimes less convenient |

Lossless means the decoded PCM can match the source data. It does not guarantee a good master.

## MP3, AAC, Opus

These are lossy codecs. They discard information to save space.

Lossy does not always mean bad. A high-quality AAC, Opus, or MP3 encode from a good master can sound better than a bad or fake lossless file.

## Sample Rate

Sample rate is how many samples are stored per second. `44.1 kHz` means 44100 samples per second.

Higher sample rates can be useful for production, processing, and filter design, but they do not automatically improve everyday listening. Very high Windows default formats can increase load, trigger driver issues, or resample everything without improving quality.

## Bit Depth

Bit depth describes how much numerical precision each sample has. Common values are `16-bit`, `24-bit`, and `32-bit float`.

It mainly affects dynamic range and processing headroom. It does not directly mean more bass or treble.

## Bitrate

Bitrate is the amount of data used per second, usually shown as `kbps` or `Mbps`.

For lossy codecs, higher bitrate usually preserves more information. For lossless codecs, bitrate often reflects musical complexity and compression efficiency. Do not compare different codecs by number alone.

## Hi-Res

Hi-Res usually means audio above CD specification, such as `24-bit / 96 kHz`. It is a specification label, not a guarantee of better sound.

The master, source, playback chain, volume matching, and device support matter more than the badge.

## Bit-Perfect

Bit-perfect means the player tries to send the audio samples unchanged: no EQ, no volume change, no resampling, and no DSP.

It is useful for verifying the output path. It is not always the best listening choice. If you need headphone correction, room correction, channel balance, ReplayGain, or EQ, you are intentionally changing the samples.

In ECHO, EQ, FIR, channel tools, headphone correction, resampling, and ReplayGain can remove bit-perfect candidate status. That is expected.

## Resampling, Upsampling, Oversampling

| Term | Meaning |
| --- | --- |
| Resampling | Convert one sample rate to another |
| Upsampling | Convert to a higher sample rate |
| Downsampling | Convert to a lower sample rate |
| Oversampling | Internal high-rate processing, often inside a DAC |

Resampling quality depends on the algorithm. Windows shared mode often resamples multiple apps to one device format. WASAPI Exclusive can reduce this, but stability comes first.

## Jitter

Jitter is timing error in digital-audio clocks. It is real, but often overused as a marketing explanation.

Modern competent DACs usually control jitter well through buffering, reclocking, and asynchronous USB. For most users, file quality, output stability, clipping, noise, and device matching are higher-priority problems.

## DAC

A DAC converts digital audio into an analog signal. Look for stable drivers, the formats you actually need, suitable output level, low noise, low distortion, and good device matching.

Beautiful specs do not help much if the driver is unstable.

### Do Not Buy A DAC By Chip Alone

Many buyers start with the DAC chip name: ESS, AKM, Cirrus Logic, ROHM, TI/Burr-Brown, and so on. The chip matters, but it is only one part of the complete device.

The same DAC chip can sound and behave differently in different products because the final result also depends on clocking, power supply, I/V conversion, filtering, analog output stage, headphone amp stage, USB receiver, drivers, firmware, PCB layout, grounding, shielding, and gain structure. A chip datasheet describes potential under controlled conditions. The finished unit still has to implement it well.

When choosing a DAC, look at:

| Area | Why it matters |
| --- | --- |
| Driver stability | Windows compatibility, WASAPI / ASIO behavior, sleep/wake reliability |
| Outputs | RCA, XLR, coaxial, optical, USB, Bluetooth, or headphone output |
| Output level | Too low may not drive the next device well; too high may overload an input |
| Noise floor | Sensitive IEMs can reveal hiss even when the chip looks excellent |
| Output impedance | Can affect low-impedance or multi-driver IEM frequency response |
| Analog stage | Affects real distortion, noise, channel matching, and drive stability |
| Power and grounding | Can influence USB noise, ground loops, hum, and interference |
| Volume control | Digital volume, analog volume, remote control, or preamp mode |
| Features | DSD, MQA, Bluetooth, display, remote, and firmware only matter if you use them |
| Support | Driver and firmware support matter more than a famous chip when things break |

In plain language: **do not buy a DAC only because the chip looks impressive. Let your ears and your actual setup receive the final product.** The right DAC for you is stable, quiet, compatible with your system, matched to your amp or powered speakers, and comfortable with music you know.

For auditioning:

1. Use tracks you know, not only spectacular demo tracks.
2. Match volume carefully; louder is often mistaken for better detail.
3. Listen for hiss during quiet passages and pauses.
4. Check complex passages for harshness, congestion, and clipping-like stress.
5. Test USB disconnects, pops during track changes, and sleep/wake behavior.
6. Make sure the connectors fit your actual system without awkward adapters.
7. If an AB comparison is tiny, do not let chip marketing pressure you into upgrading.

A great chip with poor implementation can disappoint. A modest chip in a well-designed unit can be very enjoyable.

## Amplifier And Power

An amplifier drives headphones or speakers. "Power" is about enough voltage, current, and control at the desired volume without excessive distortion.

Too little power can mean low volume, weak bass, compression, or distortion. Too much gain can cause hiss and poor volume control with sensitive IEMs.

## Impedance And Sensitivity

Impedance and sensitivity together affect how easy a headphone is to drive.

High impedance is not always hard to drive. Low impedance is not always easy. Sensitive IEMs can reveal noise. Some low-impedance multi-driver IEMs are sensitive to output impedance.

## Output Impedance

Output impedance is the impedance of the device output. Lower output impedance is usually safer for most headphones and IEMs because it reduces frequency-response interaction.

Higher output impedance can change tonal balance, especially with multi-driver IEMs.

## SNR, Dynamic Range, THD+N, Crosstalk

| Term | Meaning |
| --- | --- |
| SNR | Signal-to-noise ratio |
| Dynamic Range | Distance between usable loudest signal and noise floor |
| THD+N | Total harmonic distortion plus noise |
| Crosstalk | How much left and right channels leak into each other |

Measurements are useful, but real experience also depends on gain, output level, driver stability, and headphone matching.

## Balanced Output

Balanced outputs such as `2.5 mm`, `4.4 mm`, or `XLR` can provide more power or better separation in some designs. They are not automatically better.

Use only proper balanced cables. Do not force single-ended wiring into a balanced output with unsafe adapters.

## Cables

Cables matter, but mostly for practical electrical reasons: resistance, capacitance, inductance, shielding, characteristic impedance, connector contact, mechanical reliability, length, and safety. A cable should deliver the correct signal reliably with low loss and low interference. It should not be treated as a magic tone enhancer.

The useful rule is:

**Cables are best at fixing faults, noise, bad contact, wrong length, and wrong specifications. They are weakest as a promise of instant resolution, soundstage, or tonal miracles.**

| Cable | Common connectors | What matters | Common problems |
| --- | --- | --- | --- |
| Headphone cable | `3.5 mm`, `6.35 mm`, `2.5 mm`, `4.4 mm`, XLR | Pinout, contact, flexibility, microphonics, balanced compatibility | Reversed channels, unsafe adapters, loose plugs |
| Analog interconnect | RCA, XLR, TRS | Shielding, capacitance, grounding, balanced/unbalanced matching | Hum, buzz, RF pickup, high-frequency rolloff over long runs |
| Speaker cable | Banana, spade, bare wire | Gauge, resistance, contact area, polarity | Loose bass, reversed polarity, shorts, oxidized terminals |
| Coaxial digital | RCA, BNC | `75 ohm` characteristic impedance, shielding, termination | No lock, clicks, dropouts, reflections |
| AES/EBU | XLR | `110 ohm` balanced digital cable, twisted pair, shield | Short analog XLR may work, but long/pro links need the right cable |
| USB | USB-A/B/C | Standards compliance, data rate, shielding, power capability, firm fit | DAC disconnects, pops, power noise, charge-only cable |
| Optical | TOSLINK, Mini-TOSLINK | Alignment, bend radius, length, transmitter/receiver strength | No lock, format limits, but useful electrical isolation |
| Ethernet | RJ45 | Rated cable, connector quality, length, shielding only when needed | Network dropouts and buffering, not analog tone shaping |
| Power cable | IEC and regional mains plugs | Safety certification, ground, current rating, connector contact | Safety risk, bad ground, loose contact |

Why cables matter:

1. Resistance causes voltage drop and loss. Speaker cables are the clearest example because speakers are low-impedance, high-current loads.
2. Capacitance can interact with source impedance and slightly roll off treble, especially in long unbalanced analog cables or high-output-impedance gear.
3. Inductance can matter in speaker cables or unusual cable geometries, though it is rarely the first concern in short line-level cables.
4. Shielding reduces interference in low-level analog cables. Speaker cables normally do not need shielding for audio quality because signal level and current are high.
5. Balanced lines reject common-mode noise when the source, cable, and receiver are all truly balanced.
6. Digital cables need the right physical specification. S/PDIF coax is about `75 ohm`, AES/EBU is about `110 ohm`, and USB-C cables also involve data rate, power capability, and compliance.
7. Connectors matter. Many audible "cable upgrades" are really old plugs, oxidation, loose sockets, broken shields, or bad solder joints being fixed.
8. Length magnifies everything. A short desktop RCA run is not the same problem as a long stage or studio run.

How to read cable specifications:

| Spec | Where it matters | Meaning |
| --- | --- | --- |
| AWG / gauge | Speaker cables, power cables, some USB cables | Lower AWG usually means thicker wire; longer speaker runs need enough copper |
| Resistance | Speaker, headphone, and power cables | Lower resistance reduces voltage drop, especially in low-impedance or high-current use |
| Capacitance | RCA, phono, long analog runs | High capacitance can interact with high source impedance and reduce treble |
| Inductance | Speaker cables and unusual cable geometries | Excessive values can affect high frequencies or amplifier stability |
| Shield coverage | RCA, microphone, USB, coaxial digital | Better shielding helps low-level signals; speaker cables usually do not need shielding for sound quality |
| Characteristic impedance | S/PDIF, AES/EBU, USB, HDMI, Ethernet | Critical for digital/high-speed links; S/PDIF uses `75 ohm`, AES/EBU uses `110 ohm` |
| Connector quality | All cables | The point is stable contact and oxidation resistance, not magic plating |
| Bend radius | Optical, thick, and portable cables | Over-bending can damage fibers, conductors, or connector strain relief |

Changing cables is meaningful when:

- Speaker cable is too thin or too long.
- Plugs are loose, oxidized, or intermittent.
- RCA hum improves when routing or shielding changes.
- A USB DAC disconnects, pops, or is recognized inconsistently.
- A balanced headphone cable has the wrong pinout or unsafe adapter.
- TOSLINK is bent, loose, or fails to lock.
- Cable stiffness, weight, or microphonics affects headphone comfort.
- Long studio or stage runs need balanced wiring and reliable shielding.

Changing cables is usually not the first move when:

- The system is already quiet, stable, short-run, and correctly wired.
- The reason is only that someone described a cable as more resolving.
- Fit, placement, room acoustics, EQ, or amplifier matching are still unresolved.
- Volume was not matched in the comparison.
- The cable budget would crowd out bigger improvements elsewhere.

"Cable burn-in" is often overstated. Unlike a driver suspension, a cable does not have an obvious mechanical break-in mechanism. Perceived changes can come from restored contact, cleaned oxidation after replugging, changed headphone fit, unmatched volume, or listener adaptation. In daily use, secure contact, correct routing, and avoiding strain matter more.

Practical buying advice:

- Use the correct pinout, especially for `2.5 mm`, `4.4 mm`, XLR, and proprietary headphone connectors.
- Keep cables only as long as needed.
- Prefer clear specifications: gauge, shielding, impedance, USB data/power rating, S/PDIF `75 ohm`, AES/EBU `110 ohm`.
- Choose reliable plugs and strain relief.
- For power cables, prioritize safety certification and grounding. Never defeat protective earth to chase sound.

For ECHO troubleshooting:

1. Pops, dropouts, or DAC disconnects: try a short compliant USB cable directly into the computer.
2. Hum or buzz: keep RCA away from power cords, use a shared power strip when appropriate, or try optical isolation.
3. Off-center vocals: use mono, left/right swap, and cable swapping to separate recording, headphone, cable, and device faults.
4. Loose speaker bass: check polarity, binding posts, strand shorts, and cable gauge.
5. Remote library buffering: check Ethernet, router, NAS, Wi-Fi, and server throughput before blaming decoding quality.
6. Compare cables at matched volume, changing only one thing at a time.

References:

- [Blue Jeans Cable: Speaker Cables](https://www.bluejeanscable.com/store/speaker/index.htm)
- [Blue Jeans Cable: LC-1 Design Notes](https://www.bluejeanscable.com/articles/LC1-design-notes.htm)
- [Audioholics / Henry Ott: Balanced vs. Unbalanced Cables](https://www.audioholics.com/audio-video-cables/balanced-vs-unbalanced-interconnects/)
- [Canare: 110Ω Digital Audio Cable](https://www.canare.com/110ohmdigitalaudiocable)
- [Blue Jeans Cable: Digital Audio Cables](https://www.bluejeanscable.com/store/digital-audio/index.htm)
- [USB-IF: USB Type-C Functional Test Specification](https://usb.org/sites/default/files/USB%20Type%20C%20Functional%20Test%20Specification%202021%2005%2020.pdf)

## Bluetooth Codecs

Bluetooth headphones use codecs such as SBC, AAC, aptX, LDAC, or LHDC. Bluetooth is convenient, but it adds encoding, latency, wireless stability concerns, and operating-system behavior.

Bluetooth playback is usually not bit-perfect. Higher codec modes can be less stable in poor radio conditions.

## DSP

DSP means Digital Signal Processing. It includes EQ, headphone correction, room correction, FIR, channel balance, crossfeed, resampling, compression, and limiting.

DSP is not anti-HiFi. It is controlled digital processing. But it changes the samples, can add latency, and can cause clipping or phase problems if configured poorly.

Use DSP with purpose, small changes, and output safety checks.

## EQ

EQ changes the level of frequency ranges.

| Type | Use |
| --- | --- |
| Graphic EQ | Fixed bands, easy to use |
| Parametric EQ | Adjustable frequency, gain, and Q |
| Shelf filter | Raise or lower lows or highs broadly |
| High-pass | Remove content below a frequency |
| Low-pass | Remove content above a frequency |
| Notch | Cut a narrow problem frequency |

For parametric EQ:

- `Frequency`: center frequency.
- `Gain`: boost or cut amount.
- `Q`: width of the affected range.

Prefer small moves. If you boost several bands, reserve headroom.

## Preamp And Headroom

Preamp is overall gain before or around processing. Headroom is reserved level space to prevent digital clipping.

If you boost bass by `+4 dB` and treble by `+3 dB`, the signal may exceed `0 dBFS`. Lower preamp or enable headroom.

Practical defaults:

- Mild EQ: around `-3 dB` can be enough.
- Strong bass boost or multiple positive bands: consider `-6 dB`.
- FIR, correction, and channel tools together: watch output safety closely.

## Clipping And 0 dBFS

Digital audio has a maximum level called `0 dBFS`. If a signal exceeds it, it clips. Clipping sounds hard, harsh, distorted, or broken.

Common causes include EQ boosts, high preamp, ReplayGain, FIR peak gain, stacked DSP, and already-clipped masters.

If ECHO shows output safety warnings, lower headroom or preamp first.

## FIR, IIR, Convolution

| Term | Meaning |
| --- | --- |
| FIR | Filter type useful for precise frequency and phase control |
| IIR | Efficient filter type common in normal EQ |
| Convolution | Processing audio with an impulse response |
| IR | Impulse response, a captured or designed response of a system |

FIR and convolution are powerful, but wrong IR files, sample rates, channels, gain, or latency settings can cause problems. Use reliable IR files and reserve headroom.

## Phase

Phase describes timing relationships in waveforms. Phase issues can thin bass, shift imaging, or make space feel strange.

Common terms:

- `Minimum phase`: common in normal EQ, low latency.
- `Linear phase`: preserves phase relationships across frequency, but can add latency and pre-ringing.
- `Polarity`: positive/negative inversion, not the same as all phase behavior.
- `Pre-ringing`: ringing before a transient, sometimes caused by linear-phase filters.

## Compressor, Limiter, Loudness

A compressor reduces dynamic range. A limiter is a stronger ceiling. They are common in production, but casual playback use can flatten music.

Important parameters:

- `Threshold`: when processing starts.
- `Ratio`: compression strength.
- `Attack`: how fast it reacts.
- `Release`: how fast it stops.
- `Makeup Gain`: volume added after compression.

Louder is not automatically better.

## ReplayGain

ReplayGain makes different tracks or albums play at more consistent loudness. It does not remaster the music.

Track gain matches individual songs. Album gain preserves relative levels inside an album. If you want bit-perfect playback, disable it; for shuffle listening, it can be very useful.

## Crossfeed

Crossfeed mixes a little of each channel into the other to make headphone listening more speaker-like. It can reduce hard left/right separation and in-head localization, but too much can narrow or blur the image.

Use it as a taste tool, not a mandatory HiFi switch.

## HRTF And Virtual Space

HRTF describes how your head, ears, and body shape sounds arriving from different directions. Virtual surround and spatial audio often use HRTF.

It is personal. A preset that works for someone else may sound hollow or strange to you.

## Channel Balance, Mono, Left/Right Swap

Use these as diagnosis tools:

- Channel balance fixes small left/right level differences.
- Mono checks center image and phase behavior.
- Left/right swap helps find reversed wiring or device issues.
- Channel delay should be used carefully.

## Latency And Buffer

Buffering prepares audio ahead of time. More buffer is usually more stable but higher latency. Less buffer responds faster but can pop or drop out.

For music playback, latency is usually less important than stability. For gaming, video, or production, latency matters more.

## WASAPI Shared, WASAPI Exclusive, ASIO

| Mode | Best for | Notes |
| --- | --- | --- |
| System / Windows Output | Stability and compatibility | Uses the system path |
| WASAPI Shared | Daily music, video, games | Multiple apps can play together |
| WASAPI Exclusive | Direct device control when stable | Other apps may be silent |
| ASIO | Professional interfaces and low-latency production | Not automatically better for listening |

Do not force ASIO just because it sounds professional.

## EQ Frequency Cheat Sheet

| Range | Affects | Too much can sound |
| --- | --- | --- |
| `20-60 Hz` | Sub-bass, rumble, atmosphere | Boomy, heavy, unstable |
| `60-120 Hz` | Kick and bass weight | Bloated |
| `120-250 Hz` | Warmth and thickness | Muddy |
| `250-500 Hz` | Body | Boxy |
| `500 Hz-1 kHz` | Midrange core | Nasal or crowded |
| `1-3 kHz` | Vocal presence | Shouty or hard |
| `3-6 kHz` | Clarity and attack | Sharp or tiring |
| `6-10 kHz` | Sibilance and brightness | Sibilant |
| `10-16 kHz` | Air | Thin or artificial |

Use this as a starting point, not a formula.

## Practical ECHO Checklist

When the sound feels wrong:

1. Return output mode to `System` or `WASAPI Shared`.
2. Test a known-good MP3 or FLAC.
3. Disable EQ, FIR, channel tools, headphone correction, ReplayGain, and speed changes.
4. Set Windows default format back to `24-bit / 48 kHz` or `16-bit / 44.1 kHz`.
5. Check ECHO volume, system volume, and device volume.
6. Check channel balance, mono, and left/right swap.
7. Re-enable EQ, DSP, exclusive mode, ASIO, or DSD one at a time.

If a module immediately makes things worse, turn it off before stacking more settings.

## Summary

HiFi is not about enabling every advanced term. Resolution, separation, imaging, and soundstage help describe what you hear. Sample rate, bit depth, bit-perfect playback, WASAPI, and ASIO help explain the output path. EQ, headroom, FIR, and crossfeed help process sound safely.

Start stable, adjust gently, and troubleshoot before chasing bigger numbers.

For hands-on usage, continue with [DSP Beginner Guide](/en/docs/audio-output/dsp-beginner/), [DSP Simple Guide](/en/docs/audio-output/dsp-simple/), and [Audio Setup Advice](/en/docs/audio-output/audio-advice/).

---

# HQPlayer Guide

Source: src/content/docs/en/docs/audio-output/hqplayer.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/audio-output/hqplayer/
Description: How to configure HQPlayer Desktop, connect it from ECHO, use remote mode, understand NAA, and troubleshoot handoff issues.

This guide explains how to connect ECHO to HQPlayer without mixing up the playback layers.

The short version: **ECHO connects to HQPlayer. HQPlayer connects to the DAC or NAA.** After ECHO hands a track to HQPlayer, filtering, upsampling, modulation, output device selection, buffering, NAA routing, and final audio output are controlled by HQPlayer.

## Quick Setup

For the first successful local setup:

| Item | Recommended value |
| --- | --- |
| HQPlayer | Start HQPlayer Desktop and verify standalone playback first |
| ECHO mode | `Local Desktop` |
| Host | `127.0.0.1` |
| Control port | `4321` |
| Default handoff | `Ask every time` at first |
| Media service | Off for local files; on for remote HQPlayer or sources that need proxying |

Recommended order:

1. Make HQPlayer Desktop play a normal FLAC or MP3 on its own.
2. Open ECHO's `Connect` page.
3. Enable the `HQPlayer` panel.
4. Keep `127.0.0.1:4321` for local Desktop mode.
5. Click `Test`.
6. When the endpoint is available, connect to the `HQPlayer Desktop` device.

## What Each Layer Does

### HQPlayer Desktop

HQPlayer Desktop is the player and DSP engine. Signalyst describes HQPlayer Desktop as an upsampling multichannel audio player for Linux, macOS, and Windows. It supports common source formats such as FLAC, WAV, AIFF, MP3, DSF, DFF, and WavPack, plus selectable filters, modulators, convolution, parametric EQ, digital volume, NAA endpoints, and control applications.

Signalyst's quickstart describes HQPlayer Desktop as a server plus HQPlayer Client:

- **Server**: the actual HQPlayer Desktop playback engine.
- **HQPlayer Client**: a browser and control application for the server.

ECHO acts as another control and handoff surface. You can keep selecting music in ECHO, while HQPlayer handles the output chain.

### ECHO HQPlayer Connect

ECHO exposes HQPlayer as a synthetic Connect output device named `HQPlayer Desktop`. It is not DLNA or AirPlay; it is a first-class `hqplayer` Connect path.

ECHO can:

- Save the HQPlayer host, control port, connection mode, and media service settings.
- Probe HQPlayer using `GetInfo` and `Status`.
- Send `PlayNextURI` and then `Play` when handing off playback.
- Send `Seek` when playback starts from a non-zero position.
- Send `Stop` when disconnecting or stopping.
- Start an ECHO media service when remote HQPlayer needs an HTTP URL instead of a local file path.

ECHO does not:

- Choose HQPlayer filters.
- Configure HQPlayer's DAC.
- Configure NAA devices.
- Guarantee that every high-rate DSD, CUDA, ASIO, or NAA setup will be stable.
- Apply ECHO's local DSP chain after HQPlayer takeover.

## Control Port

ECHO defaults to:

```text
127.0.0.1:4321
```

`4321` is the HQPlayer control port. It is not the ECHO media-service port and not an NAA port.

For remote HQPlayer, use the LAN IP address of the HQPlayer machine:

```text
192.168.1.50:4321
```

Do not use `127.0.0.1` for a remote machine. From ECHO's point of view, `127.0.0.1` always means the ECHO computer itself.

## Prepare HQPlayer First

Before connecting ECHO:

1. Start HQPlayer Desktop.
2. Select a stable backend and output device.
3. Play a known-good local FLAC or MP3 directly in HQPlayer.
4. Keep the first test conservative: PCM, no extreme DSD rate, no heavy convolution, no NAA if you are still troubleshooting.
5. If a USB DAC crackles with default settings, Signalyst notes that increasing buffer time to `100 ms` can help.

If HQPlayer cannot play by itself, fix the HQPlayer-to-DAC chain before involving ECHO.

## Local ECHO To Local HQPlayer

Use this when ECHO and HQPlayer Desktop run on the same computer.

In HQPlayer:

1. Start HQPlayer Desktop.
2. Confirm standalone playback works.
3. Select the DAC or audio device you want HQPlayer to use.
4. If ECHO cannot connect, enable HQPlayer's `Allow control from network` button and test again.

In ECHO:

1. Open `Connect`.
2. Find the `HQPlayer` panel.
3. Enable HQPlayer.
4. Choose `Local Desktop`.
5. Keep Host as `127.0.0.1`.
6. Keep control port as `4321`.
7. Keep default handoff as `Ask every time` until the setup is proven.
8. Keep media service off for ordinary local files.
9. Click `Test`.

When the test succeeds, the Connect device list should show `HQPlayer Desktop`. Select a track in ECHO and click `Connect`, or use the `HQPlayer takeover` control from the audio settings drawer.

While HQPlayer takeover is active:

- Audio comes from HQPlayer's selected output device.
- HQPlayer decides filter, shaper, rate, bit depth, channels, and output.
- ECHO's local output mode and local DSP are not the final output path.
- ECHO playback controls route to the active HQPlayer session.

## Remote ECHO To Remote HQPlayer

Use this when ECHO and HQPlayer Desktop run on different machines.

Example:

```text
ECHO computer:      192.168.1.20
HQPlayer computer:  192.168.1.50
DAC:                connected to the HQPlayer computer
```

ECHO should connect to:

```text
192.168.1.50:4321
```

Requirements:

1. Both machines can reach each other on the network.
2. HQPlayer Desktop is running on the HQPlayer machine.
3. HQPlayer can play to the DAC by itself.
4. HQPlayer has network control enabled.
5. The HQPlayer machine firewall allows the control port `4321`.
6. If HQPlayer must read files from the ECHO machine, the ECHO media-service port must also be reachable.

In ECHO:

1. Open `Connect`.
2. Enable the `HQPlayer` panel.
3. Open `Advanced settings`.
4. Choose `Remote HQPlayer`.
5. Set Host to the HQPlayer computer IP.
6. Set control port to `4321`.
7. Enable media service.
8. Leave media port blank for automatic selection, or set a fixed port such as `17890` if firewall rules are easier with a fixed port.
9. Click `Test`.

The control test only proves that ECHO can reach HQPlayer. Remote playback also requires HQPlayer to access the media URL generated by ECHO.

## Why Remote Mode Often Needs Media Service

For local mode, ECHO can hand HQPlayer a local path:

```text
D:\Music\Album\Track.flac
```

For remote mode, that path may not exist on the HQPlayer computer. ECHO can instead expose the track as an HTTP URL:

```text
http://192.168.1.20:17890/hqplayer-media/...
```

If remote control works but playback does not, check ECHO media service and firewall access.

## NAA Boundary

NAA means Network Audio Adapter. It is the endpoint between HQPlayer and the DAC, not the endpoint ECHO connects to.

Correct chain:

```text
ECHO -> HQPlayer Desktop -> NAA -> DAC
```

Incorrect chain:

```text
ECHO -> NAA -> DAC
```

Configure NAA inside HQPlayer:

1. Put the NAA device and HQPlayer machine on the same network.
2. Start the NAA device or Network Audio Daemon.
3. In HQPlayer, choose the Network Audio Adapter backend.
4. Select the discovered NAA device.
5. Test playback directly in HQPlayer.
6. After HQPlayer-to-NAA playback works, connect ECHO to HQPlayer.

If HQPlayer cannot discover the NAA device, troubleshoot the HQPlayer/NAA/network side first. ECHO normally does not see or select the NAA device directly.

## Beginner Settings

For the first test:

- Output: PCM.
- Rate: conservative, not the DAC's maximum on day one.
- DSD: off.
- Convolution: off.
- CUDA: off.
- NAA: off until local output is proven.
- Buffer: increase if the DAC crackles.
- Test file: ordinary FLAC or MP3.

After that:

1. Try moderate PCM upsampling.
2. Change one filter or rate at a time.
3. Watch CPU load, glitches, and track-change stability.
4. Add DSD, NAA, convolution, and CUDA one layer at a time.

## Handoff Policy

| Option | Meaning | Best for |
| --- | --- | --- |
| `Prefer ECHO` | Keep ECHO native output unless confirmed | Occasional HQPlayer use |
| `Ask every time` | Confirm before handing off | First setup and troubleshooting |
| `Prefer HQPlayer` | Prefer HQPlayer for playback | Proven stable HQPlayer setups |

Start with `Ask every time`. Switch to `Prefer HQPlayer` only after the whole chain is reliable.

## Troubleshooting

### Connection refused

Check:

- HQPlayer Desktop is running.
- Host is correct.
- Port is `4321`.
- Network control is enabled when remote.
- Firewall allows the control port.

### Timeout

Check:

- The remote IP is reachable.
- The two machines are not isolated by guest Wi-Fi, VPN, proxy, campus network, or company firewall.
- You are not using `127.0.0.1` for a remote machine.

### Protocol error

Check:

- The port is HQPlayer's control port, not the media-service port.
- Another service is not occupying that port.
- Restart HQPlayer and test again.

### Test succeeds but no sound

This usually means ECHO reached HQPlayer, but HQPlayer-to-output is not working.

Check:

- HQPlayer is actually playing.
- Backend and Device are correct.
- DAC input and volume are correct.
- Output rate is supported by the DAC.
- ASIO/WASAPI/CoreAudio/ALSA works directly.
- NAA is online if used.

### Local works, remote fails

Check:

- Media service is enabled.
- ECHO media port is reachable from the HQPlayer machine.
- Firewall allows the media port.
- HQPlayer can access the generated media URL.
- The Host field points to the HQPlayer machine, not the ECHO machine.

### Spotify or protected streaming cannot hand off

Some sources cannot be handed to HQPlayer as a plain playable URI. If ECHO indicates that the Spotify SDK or an official player is required, use the native/official playback path instead of forcing HQPlayer.

## Minimal Successful Configuration

1. Run ECHO and HQPlayer on the same computer.
2. Connect the DAC to that computer.
3. Make HQPlayer play a normal FLAC directly.
4. In ECHO, open `Connect`.
5. Enable HQPlayer.
6. Use `Local Desktop`.
7. Host: `127.0.0.1`.
8. Control port: `4321`.
9. Handoff: `Ask every time`.
10. Media service: off.
11. Click `Test`.
12. Select or play a track in ECHO.
13. Click `Connect` on `HQPlayer Desktop`.

After this works, add remote mode, NAA, DSD, convolution, and higher sample rates one at a time.

## References

- Signalyst HQPlayer Desktop: <https://signalyst.com/hqplayer-desktop/>
- Signalyst Quickstart guide: <https://signalyst.com/quickstart-guide/>
- Signalyst Documentation: <https://www.signalyst.com/quickstart.html>
- Signalyst Downloads: <https://signalyst.com/downloads/>
- Signalyst Network Audio Adapter: <https://signalyst.com/network-audio-adapter/>

---

# Why Did My Song Speed Change?

Source: src/content/docs/en/docs/audio-output/song-speed-changed.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/audio-output/song-speed-changed/
Description: What to check when songs play too slowly, too fast, with shifted pitch, or with strange progress.

If a song suddenly sounds too slow, too fast, pitch-shifted, or the progress bar moves strangely, do not reinstall ECHO first. The usual cause is a mismatch in the output chain: Windows default format, the audio driver, DSP, resampling, or an advanced output mode.

## Fast Recovery

Return to a stable path first:

1. Open `Settings -> Playback`, then switch the output mode to `System` or `WASAPI Shared`.
2. Disable speed changes, pitch changes, EQ, ReplayGain, channel tools, ECHO SRC / upsampling, DSD, HQPlayer, and automix.
3. Play a normal MP3 or FLAC file. Do not troubleshoot with DSD, extreme sample-rate test files, or remote sources first.
4. Confirm the Windows output device is correct and ECHO is not muted in the volume mixer.
5. If playback returns to normal, enable advanced features one at a time.

If `System` or `WASAPI Shared` works but Exclusive, ASIO, DSD, HQPlayer, or ECHO SRC does not, the issue is usually in the advanced output chain, driver, or device support range. It does not mean ECHO damaged your music file.

## Do Not Set Windows To An Extreme Sample Rate

Do not set Windows `Sound -> More sound settings -> Playback device -> Advanced -> Default format` to an extremely high sample rate just because it looks more HiFi.

Even if your system shows an absurdly high number, setting Windows to that sample rate does not magically improve every song. The Windows shared-mode default format is a working format between the system mixer and your device driver, not a free audio-quality upgrade.

Setting it too high can cause:

- Extra driver or system resampling.
- Crackling, stutter, silence, or device instability.
- Mismatches between shared output, exclusive output, and the DAC's locked sample rate.
- Harder troubleshooting because Windows, ECHO, the driver, and the DAC may all be involved.
- Half-speed, double-speed, or strange progress behavior on some broken driver paths.

For daily use, keep the Windows default format in a stable range, such as `24 bit, 48 kHz`, or another common format your device handles reliably.

## Why This Setting Is A Bad Fix

Sample rate means how many audio samples exist per second. 44.1 kHz means 44,100 samples per second. 96 kHz means 96,000 samples per second. A real high-sample-rate source keeps those extra samples during recording, production, or export.

The Windows default format does not re-record the song, and it cannot create missing detail from nowhere. When you change the Windows shared-mode default format from 44.1 kHz to 384 kHz, you are mostly telling the Windows mixer: "deliver shared output to the device in this working format." If the original song is 44.1 kHz, Windows can only convert it with a resampling algorithm. That may be transparent, unnecessary, or worse, but it does not add information that was never in the source.

It also affects more than ECHO. In shared mode, browsers, games, chat apps, system sounds, and music playback can all enter the same Windows mixing path. An extreme default format means the whole shared audio path has to work around that format:

- Lower-sample-rate audio may be upsampled by the system.
- Audio from different apps has to be mixed into one format.
- Some drivers may convert that format again into what the device actually supports.
- Bluetooth, virtual audio devices, and audio enhancement tools may process it again.

So seeing 384 kHz in Windows does not mean the DAC is reliably receiving 384 kHz, and it does not turn the song into a real 384 kHz source. It only means one stage of the system chain is using that working format.

The reliable approach is: respect the source file's real sample rate, use a format your device handles stably, and use an explicit processing path such as ECHO SRC when you actually want upsampling.

## If You Want A Higher Sample Rate

Use one of these real paths:

1. Use source files that are actually high sample rate, such as real 88.2 kHz, 96 kHz, 176.4 kHz, or 192 kHz files.
2. Unlock ECHO Pro and use ECHO SRC / upsampling to resample PCM audio to a higher target rate inside ECHO.

The Windows default format is not a high-sample-rate source. Sending a 44.1 kHz song through the Windows mixer at 384 kHz does not turn it into a real 384 kHz master.

## Check ECHO Settings

If the speed problem only happens in ECHO, check:

- Whether speed, pitch, or tempo features are enabled.
- Whether ECHO SRC / upsampling is enabled while the DAC or driver does not support the target rate.
- Whether DSD, HQPlayer, ASIO, Exclusive, or another advanced output path is also enabled.
- Whether a virtual audio device, ASIO wrapper, or system audio enhancement driver is in the path.

To verify raw playback, disable all DSP and upsampling, then play a normal file through `System` or `WASAPI Shared`.

## ECHO SRC Notes

ECHO SRC is an ECHO Pro advanced PCM upsampling feature. It is not the same thing as the Windows default format. For best results:

- Use a wired external DAC, USB decoder, or vendor audio driver.
- Use `WASAPI Exclusive` or the official vendor `ASIO` driver when validating upsampling.
- Start with `2x PCM` or `4x PCM`; do not jump to the highest multiplier first.
- If playback becomes slow, fast, crackly, unstable, or silent, disable ECHO SRC first, then return to `System` or `WASAPI Shared`.

For details, read the [ECHO SRC / Upsampling Guide](/en/docs/audio-output/upsampling/).

## What To Include In A Report

If playback still changes speed after the recovery steps, include:

- ECHO output mode, output device, and current DSP / ECHO SRC state.
- File format, sample rate, and bit depth.
- A screenshot of the Windows default format.
- The actual sample rate shown by your DAC, sound card, or driver panel.
- Whether Bluetooth, a virtual audio device, ASIO4ALL, FlexASIO, Voicemeeter, or another third-party audio chain is involved.

---

# Why Third-Party Audio Drivers Do Not Improve Sound Quality

Source: src/content/docs/en/docs/audio-output/third-party-drivers.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/audio-output/third-party-drivers/
Description: A digital-audio explanation of why ECHO does not recommend third-party audio drivers, ASIO wrappers, virtual devices, or driver repacks.

This page uses "third-party audio drivers" to mean tools not released by the device vendor, such as ASIO wrappers, virtual sound cards, driver repacks, system-wide enhancement drivers, and USB DAC drivers downloaded from generic driver sites.

The short version: **from a digital-audio perspective, third-party drivers usually do not improve sound quality. They can change routing, interface type, latency, and compatibility. If they change the sound, they are doing DSP, resampling, mixing, or format conversion rather than magically improving the driver path.**

The only drivers worth installing are usually official drivers from the device vendor, and only when they solve a specific device capability problem.

## Short Version

1. After decoding, an audio file becomes PCM samples. The driver's core job is to deliver those samples reliably.
2. If two paths deliver the same samples bit-perfectly, there is no digital sound-quality difference between them.
3. If a third-party driver changes the sound, it is usually resampling, applying effects, changing gain, or converting format.
4. ASIO and WASAPI Exclusive are useful for lower latency, exclusive control, or avoiding system mixing. They are not automatic sound-quality upgrades.
5. ASIO wrappers, virtual sound cards, and repacked drivers add failure points: no sound, crackling, half-speed playback, latency, device conflicts, and security risk.
6. For normal listening, `System` or `WASAPI Shared` is enough when stable. External DAC users can try `WASAPI Exclusive` after shared mode is proven stable.
7. Official vendor drivers matter only when you need vendor ASIO, Native DSD, firmware tools, professional multi-channel I/O, or device-specific control panels.

## Drivers Cannot Create New Audio Information

A simplified playback chain looks like this:

```text
Audio file -> Decoder -> PCM samples -> Player / DSP -> System audio API -> Driver -> DAC -> Analog output -> Headphones / speakers
```

In the digital stage, music is sample data. For PCM, that means a sequence of numeric values over time.

If the output path does not modify those values, the goal is bit-perfect or close to bit-perfect playback. In that case, a third-party driver has no room to add resolution, detail, or dynamics that are not already in the file.

If the path does modify the values, that modification is audio processing:

- Resampling.
- Bit-depth conversion or dithering.
- Gain changes.
- EQ, loudness, virtual surround, or spatial effects.
- Channel mixing or matrixing.
- Limiting, compression, or dynamic processing.

Those tools can have creative or corrective value, but they should be explicit, controllable, and reversible. They should not be hidden behind the idea of a better driver.

## ASIO Is Not Automatically Better

ASIO is mainly useful for professional audio production: recording, low-latency monitoring, multi-channel interfaces, and DAW workflows. Its goal is direct, predictable device access, not making normal music playback sound better.

For listening:

- Official vendor ASIO can be useful for professional interfaces.
- Third-party ASIO wrappers often just wrap WASAPI, WDM, or another system path behind an ASIO interface.
- A wrapper cannot turn a normal device into a professional interface.
- A wrapper can add format negotiation, buffering, device-ownership, and crash risk.

If you only listen to music, start with WASAPI Shared. If you want less system mixing, try WASAPI Exclusive. Use ASIO only when the device vendor provides a stable driver and you have a real need for it.

## WASAPI Exclusive Is About Control

WASAPI Exclusive is valuable because it can:

- Let the player take exclusive control of the device.
- Avoid the Windows shared mixer.
- Open the device at the track's sample rate.
- Reduce interference from the Windows default format.

That is clearer output control, not magic sound improvement.

If the device and driver are stable, Exclusive mode can be useful. If they are not, it can cause no sound, failed track changes, device conflicts, or crackling. In those cases, switching back to WASAPI Shared is the correct engineering choice.

## Higher Sample Rates Do Not Create More Detail

Setting Windows to `192 kHz` or `384 kHz`, or installing a driver that advertises very high sample rates, does not turn a `44.1 kHz` source into a high-resolution master.

A higher sample rate only means more samples per second. For an existing audio file, the source information is already fixed. Resampling quality depends on the algorithm and processing chain. System resampling or driver-level resampling is not the same as high-quality upsampling.

Very high default formats can also cause problems:

- Every system sound may be resampled.
- CPU and buffering pressure can increase.
- Some drivers produce half-speed playback, double-speed playback, crackling, or silence.
- Bluetooth, virtual devices, games, and browsers become harder to troubleshoot.

If you want real upsampling, use a dedicated tool and a verifiable chain instead of relying on a third-party driver or the Windows default format.

## Clocks And Jitter Are Hardware Problems First

Modern asynchronous USB DACs usually derive the audio clock on the DAC side. The computer and driver feed buffers; the DAC handles conversion to analog output. A third-party driver does not magically improve the DAC's internal clock, analog power supply, I/V stage, op-amps, headphone amp, or headphones.

When driver or transfer problems happen, they usually show up as obvious faults:

- Crackling.
- Dropouts.
- Missing samples.
- Silence.
- Abnormal latency.
- Half-speed or double-speed playback from sample-rate mismatch.

Those are stability problems, not normal "better soundstage" or "higher resolution" behavior.

## Real Risks

The main problem with third-party drivers is the extra uncertainty they add:

- **Stability risk**: playback failures, crackling, exclusive-mode conflicts, broken sleep recovery.
- **Format risk**: wrong sample rate, bit depth, or channel negotiation.
- **Latency risk**: extra wrapping or routing makes buffers less predictable.
- **Troubleshooting risk**: player, OS, wrapper, virtual device, and real driver can all fail differently.
- **Security risk**: repacked installers and system-level drivers are high-trust software.
- **Support risk**: players cannot guarantee fixes for non-vendor driver bugs.

The longer the audio path becomes, the harder it is to keep stable.

## When Official Drivers Matter

Rejecting third-party drivers does not mean all drivers are useless. Official drivers can matter in these cases:

| Situation | Why it may matter |
| --- | --- |
| The DAC vendor requires a USB Audio driver | Exposes device capabilities, control panels, or firmware tools |
| Professional interfaces | Low-latency ASIO, multi-channel I/O, sync, and monitoring |
| Native DSD | Some DACs require vendor drivers for native DSD |
| Firmware or control software | Filter, gain, clock, and firmware management |
| Old systems or special devices | Built-in OS USB Audio support may be insufficient |

The rule is simple: **use a driver only if it comes from the device vendor and solves a specific capability problem.** If the pitch is "better sound", "universal optimization", or "audiophile driver pack", skip it.

## ECHO Recommendation

For reliable listening:

1. Start with `System` or `WASAPI Shared`.
2. Keep the Windows default format at `44.1 kHz` or `48 kHz` for daily use.
3. Do not install third-party ASIO wrappers or universal audio drivers.
4. Do not download DAC drivers from generic driver sites.
5. Try `WASAPI Exclusive` only after your DAC is stable in shared mode.
6. Use official vendor drivers only when you need ASIO, DSD, firmware tools, or device control panels.
7. If you get silence, crackling, half-speed playback, double-speed playback, or failed track changes, return to `System` / `WASAPI Shared` first.

A good audio chain is not the one with the most impressive switches enabled. It is the one where each stage has a clear job, the result is verifiable, and failures are easy to roll back.

---

# Official USB DAC Driver Links

Source: src/content/docs/en/docs/audio-output/usb-dac-drivers.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/audio-output/usb-dac-drivers/
Description: Official USB / ASIO driver download links for common USB DAC, interface, and Hi-End audio vendors, plus ECHO's third-party driver support boundary.

## Official USB DAC Driver Links

Install USB or ASIO drivers only from the manufacturer website, manufacturer support portal, or an official regional site. Avoid third-party driver sites such as `DriverHub`, `DriverMax`, `Treexy`, or `driverscape`; even when the model name looks right, the package may be outdated, wrapped in an installer, or wrong for your exact device.

ECHO only calls the audio device driver that is already installed through the operating system audio APIs. It does not provide installation help, repair, debugging, compatibility workarounds, or support for any third-party driver. If a third-party driver causes silence, pops, blue screens, device detection failures, ASIO errors, or native DSD errors, contact the device vendor or driver author first.

Before installing a driver, check that the model, Windows version, and USB receiver generation match. If `WASAPI Shared` is already stable and you do not need ASIO, native DSD, or firmware tools, the vendor driver may be optional.

<div class="dac-origin-filter" data-dac-origin-filter data-mode="en">
  <label class="dac-origin-filter__toggle">
    <input type="checkbox" data-dac-origin-toggle />
    <span class="dac-origin-filter__switch" aria-hidden="true"></span>
    <span>Show Chinese DAC brands only</span>
  </label>
  <span class="dac-origin-filter__count" data-dac-origin-count></span>
</div>

| Brand | Official link | Notes |
| --- | --- | --- |
| Accuphase | https://www.accuphase.co.jp/usbuty.html | Accuphase Japan official USB driver download index by DC, DP, and DAC digital input board model. |
| Accuphase English | https://www.accuphase.com/model/usb_notice1_v1r3.html | Accuphase English USB driver notice page covering some older DC / DP / DAC-40 drivers. |
| Allen & Heath | https://www.allen-heath.com/hardware/audio-interfaces/ | Allen & Heath official audio interface entry; ZEDi, CQ, and Qu-series downloads are under each model. |
| AMR / Abbingdon Music Research | https://amr-audio.co.uk/products/dp-777-se/ | Official AMR DP-777 SE page says Windows needs the supplied USB Audio Class 2.0 Driver; older DP-777 manuals also point users to AMR for the ASIO driver. |
| Antelope Audio | https://support.antelopeaudio.com/en/support/solutions/articles/42000102036-orion-32-gen4-download-section | Antelope official support article example; enter the official support portal by exact Orion, Zen, Discrete, or other model. |
| Apogee | https://apogeedigital.com/download-files/ | Apogee official download page; current product installers may require login and product registration. |
| aqua acoustic quality | https://www.aquahifi.com/download.html | Official aqua Download page with USB Audio Class 2 Driver Windows, X Core Driver, and Formula xHD Native DSD Driver entries. |
| Arcam | https://www.arcam.co.uk/product%2Caccessories%2Caccessories%2Crpac.htm | Arcam rPAC official legacy product page; Downloads include Windows Driver, Software, FAQ, and User Manual. |
| Astell&Kern | https://www.astellnkern.com/en/support/download.php | A&K official Download page, including IRIVER / Dreamus / AK HC USB DAC Driver entries. |
| ATOLL | https://www.atoll-electronique.com/en/xmos-specific-driver-usb/ | Official XMOS-specific USB driver page. |
| Audient | https://audient.com/products/audio-interfaces/id4/downloads/ | Audient iD-series download page; software and drivers may require product registration in ARC. |
| Audio-GD | http://www.audio-gd.com/Pro/dac/USB32/USB32EN.htm | Audio-GD official USB-32 driver installation page. Confirm the exact USB module or Amanero solution for your unit; the old site's HTTPS handshake may fail, but the official HTTP page opens. |
| Audiolab | https://www.audiolab.co.uk/pages/firmware-drivers | Official Audiolab Firmware & Drivers page with General USB Driver for OMNIA, 9000, 8300, 7000, D9, D7, M-ONE, M-DAC, and related products. |
| aune | https://en.auneaudio.com/downloads | Official download center; filter by Driver for USB driver packages. |
| AURALiC | https://support.auralic.com/hc/en-us/sections/204968568-USB-Audio-Driver | USB Audio Driver version list. |
| AURALiC China | https://www.auralic.com.cn/?p=1755 | Chinese driver page listing supported models, Windows versions, and legacy drivers. |
| Aurender | https://aurender.com/home/download/ | Official Aurender Download page with Aurender FLOW Driver for Windows 7 / 8 / 10; regular Aurender server USB-output compatibility depends on whether the target DAC works without custom drivers. |
| Ayon Audio | https://www.ayonaudio.com/updated-usb-xmos-driver/ | Official Ayon updated USB-XMOS driver for CD-1sc, CD-3s, CD-5s, CD-07s, CD-1sx, CD-3sx, Sigma, Stealth, Stratos, and related models. |
| Ayre Acoustics | https://ayre.com/support/ | Ayre official Support page with USB Driver installation guidance; Windows 10+ native playback usually works, while native DSD needs the Ayre USB Driver. |
| Bel Canto Design | https://www.belcantodesign.com/user-guides-and-downloads | Official Bel Canto User Guides and Downloads page with XMOS USB Driver and USB2.0 Driver for Windows entries. |
| Bel Canto FAQ | https://www.belcantodesign.com/faqs | Official Bel Canto FAQ notes that Windows / JRiver setups require the Windows Driver and the bundled ZIP instructions. |
| Benchmark | https://benchmarkmedia.com/pages/dac2-drivers | DAC2 and DAC3 driver page; confirm USB Audio 2.0 mode before installation. |
| Berkeley Audio Design | https://www.berkeleyaudiodesign.com/downloads | Official Berkeley Downloads page with the Alpha USB Windows <= 9 Driver and Alpha USB / Alpha DAC user guides. |
| Boulder | https://boulderamp.com/products/812-dac-preamplifier/ | Boulder 812 DAC Preamplifier official product page with USB-B input and 812 Owners Manual; no standalone Windows USB driver download page was verified, so use the manual, Boulder Controller, or official support. |
| Boulder 2120 | https://boulderamp.com/wp-content/uploads/2120-Owners-Manual.pdf | Boulder 2120 official manual covering USB-related inputs / storage behavior; driver or firmware questions should go through Boulder support, not third-party "Boulder driver" sites. |
| Bricasti Design | https://www.bricasti.com/en/consumer/m1usbupgrade.php | M1 USB official page; M1 / M1 Series II manuals state that the Windows driver is available from the website Downloads section. |
| Bryston | https://bryston.com/digital-audio/bda3/ | Bryston BDA-3 official product page; the manual states Windows needs the Bryston USB Driver, available from product Downloads. |
| Burson Audio | https://bursonaudio.com/downloads/ | Burson Downloads & Support with manuals, Windows Drivers, macOS Drivers, and legacy Conductor driver notes. |
| Cambridge Audio | https://www.cambridgeaudio.com/eur/driver-updates | Driver Updates page with USB2.0 Driver and DacMagic-related downloads. |
| Cary Audio | https://caryaudio.eu/portfolio/dac-200ts-digital-to-analog-converter/ | Cary DAC-200ts official Europe product page; Resources include USB Driver, USB firmware update packages, and installation instructions. Match driver version to USB port firmware state. |
| Cayin | https://en.cayin.cn/technical/9/18.html | Official firmware and driver list with several Cayin USB Audio Driver versions. |
| Cayin V5.74 | https://en.cayin.cn/drive/9/18/725.html | Windows 10/11 driver page for RU3 and other Cayin USB Audio products. |
| CEC | http://www.cec-web.co.jp/service/download/driver/ | Official CEC driver download directory; the CD5 USB installation manual points Windows users here for the USB audio driver. |
| CEntrance | https://centrance.com/dacport-pro/ | DACport Pro official page notes that Windows ASIO users can download the driver from CEntrance. |
| CEntrance downloads | https://centrance.com/download/ | CEntrance official Download entry; some downloads may require email or browser confirmation. |
| CH Precision | https://ch-precision.com/images/firmwares/windows-10-driver-installation.pdf | CH Precision official C1 Windows 10 XMOS / USB Audio Class 2.0 driver installation guide; get the driver from the relevant product Downloads area. |
| Chord Electronics | https://www.chordelectronics.jp/support/ | Official Chord Japan support page with Windows driver entries for CHORD USB products; also check the exact product page. |
| Classé Audio | https://support.classeaudio.com/downloads.html | Official Classé Apps, Firmware, Drivers & Utilities page with CP-800 / Sigma SSP USB Playback Driver and USB control drivers. |
| Creative | https://support.creative.com/ | Creative official support download center; search by Sound Blaster, USB DAC, or external sound card model. |
| Cyrus Audio | https://cyrusaudio.com/products/82-dac-qxr/ | Cyrus 82 DAC / 82 DAC QXR official product page; the Download area includes the QXR USB Driver. Check other Cyrus DAC models individually. |
| dCS | https://dcsaudio.zendesk.com/hc/en-gb | dCS support center. Use product documents or support requests rather than third-party driver mirrors. |
| dCS documents | https://dcsaudio.zendesk.com/hc/en-gb/categories/360003136680-Manuals-Documents | Manuals and software notes by Vivaldi, Rossini, Bartok, Lina, Debussy, and other series. |
| DENAFRIPS | https://www.denafrips.com/support | Product manuals, Thesycon USB Driver, and USB MCU firmware links. |
| Denon | https://manuals.denon.com/dnp2000ne/eu/en/DRDZSYmmnlndcl.php | Denon DNP-2000NE official manual says Windows USB-DAC use needs the dedicated driver from the product page Download section; check the exact Denon USB-DAC model page. |
| ELAC Alchemy | https://elac.com/ddp-2 | ELAC DDP-2 official product page; the Download section includes USB Audio Driver Software. |
| EMM Labs | https://www.emmlabs.ca/da2i.php | DA2i official support / downloads area with Windows USB Audio Drivers; recent Windows 10 USB Audio 2 systems usually install automatically. |
| EMM Labs / Meitner Legacy | https://www.emmlabs.ca/legacy.php | Official legacy page for EMM Labs DAC2X / XDS1 and Meitner MA-1 / MA2 USB drivers. |
| ESI Audio | https://www.esi-audio.com/support/download/ | ESI official Download area for MAYA, U, GIGAPORT, Juli, and other drivers. |
| ESOTERIC | https://www.esoteric.jp/en/support/download | Product-based download page with Windows and macOS driver categories. |
| Eversolo | https://www.eversolo.com/Support/downloads.html | Eversolo official firmware and driver download page for DAC-Z and DMP series products. |
| Eversolo FAQ | https://www.eversolo.com/en/support/faq | Official FAQ with Windows USB IN Driver notes and download links. |
| exaSound | https://www.exasound.com/Products/e62DAC.aspx | Official exaSound product page describing custom Mac OS / Windows ASIO drivers; get current drivers through exaSound support. |
| Ferrum Audio | https://ferrum.audio/support/ | Official Ferrum Support page with Windows ASIO Driver, Ferrum Streaming Control Technology Driver, HYPSOS USB Driver, and WANDLA / ERCO documents. |
| FiiO | https://www.fiio.com/newsinfo/765462.html | FiiO USB DAC Windows driver notes and version links. |
| Focusrite | https://downloads.focusrite.com/ | Focusrite official Downloads page by Scarlett, Clarett, Saffire, and other series. |
| Focusrite driver notes | https://support.focusrite.com/hc/en-gb/articles/211881185-Download-Focusrite-interface-drivers | Official guide explaining which interfaces need a separate driver and which install through Focusrite Control. |
| Fosi Audio | https://fosiaudio.com/pages/support | Fosi official SUPPORT page with DAC and headphone amp manuals, DS1 / DS2 / Q5 driver entries, and Help Center links. |
| Gold Note | https://www.goldnote.it/discontinued/fiorino-usb/ | Gold Note Fiorino USB / DAC-7 legacy pages note that Windows needs a dedicated driver; no unified driver index was verified, so check the exact product page or official support. |
| Gryphon Audio | https://gryphon-audio.dk/wp-content/uploads/zena-dac-usb-windows-driver-installation.pdf | Gryphon official Zena DAC USB Windows driver installation guide; download the driver from Gryphon's website. |
| GUSTARD | https://www.gustard.com/?page_id=8956 | Official driver page for XMOS and Amanero USB solutions. |
| Hegel | https://www.hegel.com/en/technology/usb | Hegel official USB notes; many current products are plug-and-play on recent Windows / macOS, while older products and firmware are handled through support.hegel.com. |
| HiBy | https://store.hiby.com/apps/help-center | HiBy official Help Center, including USB DAC Driver Download and Installation Guide. |
| Hidizs | https://www.hidizs.com/pages/download-center | Hidizs Download Center with USB DAC Driver for Windows and some AP-series drivers. |
| Holo Audio | https://kitsunehifi.com/pages/downloads | Kitsune HiFi is an official Holo Audio US dealer and support source with HoloAudio USB Driver, firmware, and legacy drivers. |
| iBasso | https://ibasso.com/down/ | iBasso official Downloads page with DX, DC, D16, and other USB-DAC drivers, firmware, and apps. |
| iBasso DC series | https://ibasso.com/dcseries/ | DC01 / DC02 / DC-series driver, firmware, and UAC App page. |
| Ideon Audio | https://ideonaudio.com/downloads/ | Official Ideon Downloads with Customized USB Audio 2.0 Class Driver for Windows, Absolute DAC Driver, Ayazi DAC Drivers, and ASIO4All notes. |
| iFi audio | https://downloads.ifi-audio.com/support/download-hub/ | Download Hub for drivers, firmware, and apps by product. |
| iFi China | https://www.ifi-audio.com.cn/downloads/ | Chinese USB driver page with installation notes and multiple Windows driver versions. |
| JDS Labs | https://jdslabs.com/support/drivers/ | JDS Labs official Drivers and Firmware page with XMOS Driver, firmware update utilities, and model support notes. |
| Khadas | https://www.khadas.com/support-tone | Khadas Tone support page with Tone1 / Tone2 / Tone2 Pro drivers and firmware. |
| KORG DS-DAC | https://www.korg.com/us/support/download/software/0/529/2583/ | KORG AudioGate and USB Audio Device Setup official download page with DS-DAC drivers. |
| LAiV Audio | https://www.laiv.audio/downloads | Official LAiV Downloads page with Windows USB Driver, manuals, and TL-USBDFU update components for Harmony DAC / Harmony µDAC / Harmony µDDC. |
| LampizatOr | https://www.lampizator.com/downloads | Official LampizatOr download page listing LampizatOr USB driver for Windows; older manuals also reference an XMOS driver. |
| LINDEMANN | https://lindemann-audio.de/en/limetree-usb-dac | Limetree USB-DAC official page; modern USB Audio Class 2 devices are usually driverless, while older USB-DAC 24/192 products should be checked against product documents / official support. |
| Linn | https://docs.linn.co.uk/wiki/index.php/Technical_Specification%3ASelekt_DSM | LinnDocs Selekt DSM technical specification confirming USB Audio Class 2; no dedicated Windows driver download page was verified, so use system UAC2 behavior and Linn documentation. |
| Linn Software | https://www.linn.jp/software/ | Official Linn Japan Software page with Linn App / Kazoo / Konfig downloads; these are control / configuration tools, not third-party USB DAC drivers. |
| Lotoo | https://www.lotoo.cn/english/bottom/Service/Download/ | Official download center, mostly firmware, manuals, and quick guides; check the exact product notes for USB DAC driver needs. |
| LUMIN | https://www.luminmusic.com/manual/model-differences.html | Official LUMIN model differences page showing USB audio output / digital input support by model; LUMIN is usually a network player / transport ecosystem rather than a PC USB DAC driver install. |
| LUMIN Firmware | https://www.luminmusic.com/manual/firmware-updating.html | Official LUMIN firmware updating guide; firmware is checked and installed through the LUMIN App, so USB-output compatibility should be checked against official manuals and firmware notes first. |
| LUXMAN | https://www.luxman.com/product/detail.php?id=22 | LUXMAN Driver Software page for DA / D-series USB D/A products. |
| LUXMAN Japan | https://www.luxman.co.jp/product/driver_software | Japanese official driver page listing D-08u, D-06u, DA-07X, DA-06, DA-250, DA-150, D-10X, D-07X, D-03X, and related models. |
| Lynx Studio | https://support.lynxstudio.com/hc/en-us/articles/115002882989-How-do-I-install-the-Hilo-USB | Lynx official Hilo USB driver installation guide. |
| M-Audio | https://www.m-audio.com/drivers | M-Audio official documents, drivers, and software page for M-Track, AIR, MIDISPORT, and related products. |
| M2Tech | https://m2tech.jp/driver.html | M2Tech Japan official Windows ASIO driver page for current and legacy products. |
| Marantz | https://support.marantz.com/app/answers/detail/a_id/1973/~/where-to-find-the-windows-os-audio-drivers-for-my-marantz-model | Official Marantz support article listing Windows USB Audio driver versions for SACD30n, SA-10, CD 50n, and related models. |
| Mark Levinson | https://www.marklevinson.com/products/integrated-amplifiers/MLNO5805AM.html | Mark Levinson Nº 5805 official product page; Downloads include Mark Levinson USB Audio Driver and installation instructions. |
| Matrix Audio | https://www.matrix-digi.com/en/downloads/ | Official download center; some USB DAC drivers are also referenced from product manuals. |
| Matrix Audio driver package | https://www.matrix-digi.com/drivers/Matrix_Audio_All_Driver.zip | USB DAC driver package linked by Matrix Audio documentation. |
| McIntosh | https://www.mcintoshlabs.com/products/d-a-converters/MDA200 | MDA200 official product page; Downloads include Windows 10/11 and Windows 7 USB Audio Driver packages for DA2-equipped units. |
| McIntosh Legacy | https://www.mcintoshlabs.com/legacy-products/cd-players/MCD550 | MCD550 official legacy page with McIntosh USB Audio Windows Driver B and installation guide; use exact product pages for other McIntosh models. |
| Meitner Audio | https://emmlabs-meitner.com/products/meitner-ma3i | MA3i official product page; MA3 / MA3i manuals say Windows 10/11 usually works natively, while older Windows drivers come from the website or included media. |
| Merging Technologies | https://www.merging.com/anubis/download | Merging Anubis official download page; choose drivers and firmware by model and platform. |
| Meridian Audio | https://help.meridian360.com/2024/Content/Online_Help/Explorer/Documents/DownloadFiles_Explorer.htm | Meridian Explorer official help download entry; Explorer legacy Windows drivers / documents are handled through the Meridian 360 help center. |
| Métronome / Kalista | https://www.metronome.audio/downloads/ | Official Métronome Downloads with pre-2019 USB Input Drivers for AQWO, CLASSICA, DIGITAL SHARING, C5+, C6+, C8+, CD8 S, Kalista DAC, DreamPlay DAC, and related products. |
| Microsoft USB Audio 2.0 | https://learn.microsoft.com/windows-hardware/drivers/audio/usb-2-0-audio-drivers | Windows 10 version 1703 and later include a USB Audio 2.0 class driver; many modern DACs do not need an extra vendor driver. |
| Mola Mola | https://www.mola-mola.nl/downloads.php | Official Downloads page with Mola Mola USB-Audio Driver for Windows, DIGIN programmer, and Tambaqui / Makua manuals. |
| MOON by Simaudio | https://simaudio.com/wp-content/uploads/2018/04/43_en_v_moon-usb-hd-dsd-guide.pdf | Official MOON USB HD DSD Driver setup guide; Windows needs the driver for full high-resolution / DSD compatibility. |
| MOONDROP | https://moondroplab.com/en/download | Download page for MOONRIVER2, DAWN, DASH75, firmware, and apps. |
| MOTU | https://motu.com/en-us/download/#category=1&product=507 | MOTU official download entry; select M2, M4, M6, or another product to get the correct installer. |
| MSB Technology | https://msbtechnology.com/dacs/usb/usbdrivers/ | MSB USB input driver page; macOS usually does not need USB driver updates. |
| Musical Fidelity | https://musicalfidelity.com/support/software-downloads/ | Official Software Downloads page with Windows USB drivers for Nu-Vista / M8x / M6x / M3x DAC, M6s, MX-DAC, V-LINK192, and more. |
| MUTEC | https://mutec-net.com/artikel.php?id=1665518548 | MUTEC official MC3+USB Windows 10/11 USB Audio 2.0 driver announcement with version notes and download entry. |
| Mytek Audio | https://mytek.audio/support | Legacy product drivers, firmware, manuals, USB driver, and Control Panel links. |
| Nagra | https://www.nagraaudio.com/wp-content/uploads/2018/12/Nagra-HD-DAC-User-Manual-English.pdf | Nagra HD DAC official manual says PC users need the driver supplied on the USB key; no unified public driver page was verified, so use Nagra or dealer support. |
| Naim Audio | https://www.naimaudio.com/products/dac-v1 | DAC-V1 official product page with Driver Installer and Windows Custom Driver installation instructions under Software Download / Update. |
| Neumann | https://www.neumann.com/en-us/products/audiointerfaces/mt-48 | MT 48 official product page; Windows use requires the MT 48 Toolkit, available through Manuals & Software / Download Area. |
| NICEHCK Yuandao / YUANDAO | https://nicehck.cn/about | Yuandao is currently represented as the NICEHCK Yuandao earphone brand. No official USB DAC Windows driver page was verified; pure earphones / IEMs do not need drivers, and third-party "Yuandao driver" sites should be avoided. |
| NuPrime | https://nuprimeaudio.com/product/dac-9/ | NuPrime DAC-9 product page includes a USB Driver section with NuPrime Audio WHQL and legacy universal USB Audio driver packages. |
| Onkyo | https://intl.onkyo.ru/support/firmware/p-3000r.html | Official Onkyo A-9000R / P-3000R firmware page with legacy USB Device Driver downloads for Windows / macOS. |
| OPPO Digital Japan | https://www.oppodigital.jp/support/usb-driver-software/ | OPPO USB Audio Class 2.0 DAC Driver official Japan support page for HA-1, HA-2, Sonica DAC, UDP-205, and older products. |
| PALAB | https://www.palabaudio.com/download.html | Official PALAB Download page with DAC-M1 manuals, Windows 7 USB Driver, and Windows 10 / 11 USB Driver entries. |
| Peachtree Audio | https://www.peachtreeaudio.com/pages/usb-drivers-and-firmware | Official Peachtree USB Drivers and Firmware page with separate driver guidance for Carina, nova, preDAC, sonaDAC, shift, DAC-iT X, X1, and other models. |
| Pioneer | https://global.pioneer/en/support/ | Official Pioneer support entry; legacy U-05 and similar USB DAC drivers should be checked through domestic support / exact product pages, not third-party mirrors. |
| Playback Designs | https://www.playbackdesigns.com/ | Playback Designs official site; get USB drivers and PDUU update tools through the product and support download notes. |
| PreSonus | https://www.presonus.com/support/downloads | PreSonus official Support Documents and Downloads, searchable by product and OS. |
| Primare | https://primare.net/support/documents-downloads/ | Official Primare Documents & Downloads page with USB Driver - Primare USB Audio v5.72.0; the I35 DAC guide also says PC users need the Primare XMOS audio driver. |
| Pro-Ject Audio Systems | https://www.project-audio.com/en/downloads/ | Official Pro-Ject Downloads hub; choose the exact DAC Box, Head Box, Pre Box, or other model for drivers, firmware, and manuals. |
| Pro-Ject DAC Box RS2 | https://www.project-audio.com/en/product/dac-box-rs2/ | DAC Box RS2 official product page; the Download section includes a Windows Driver zip. |
| PS Audio | https://www.psaudio.com/pages/downloads | Official PS Audio Downloads page with DirectStream firmware and Windows USB Drivers. |
| Qudelix | https://www.qudelix.com/blogs/blog/pc-chrome-app | Qudelix official PC Chrome App guide; 5K / T71 are mainly managed through the official app or Chrome extension, not third-party driver bundles. |
| Questyle | https://questyleshop.com/pages/qpm-documents-downloads | QPM documents and downloads, including QPM USB DAC Driver; check official support for other models. |
| Resonessence Labs | https://www.resonessencelabs.com/resonessence-generic-thesycon-usb-audio-2-0 | Official Resonessence Thesycon Asynchronous USB Audio 2.0 driver page for Windows USB Audio 2.0 across Resonessence products. |
| RME | https://www.rme-usa.com/downloads.html | RME driver and firmware downloads for ADI-2, Babyface, Fireface, and related products. |
| Rockna Audio | https://www.rockna-audio.com/products/wavedream-dac | Wavedream DAC official product page; the Utility section includes USB drivers, firmware, and manual links. |
| RODE | https://help.rode.com/hc/en-us/articles/360000399616-AI-1-ASIO-Drivers | RODE AI-1 ASIO Drivers official help page. |
| Roland Rubix | https://www.roland.com/us/support/by_product/rubix22/updates_drivers/3a8362ae-b4e3-473d-b325-2e88c689bd6a/ | Roland Rubix22 / Rubix24 / Rubix44 Windows Driver official page. |
| Rotel | https://www.rotel.com/usb-drivers | Official Rotel PC-USB Windows Drivers page for A12 / A14 / RA / RC / RSP / Michi and other PC-USB models. |
| S.M.S.L | https://www.smsl-audio.com/portal/product/downlist/id/11.html | Product driver list organized by DAC, AMP, Player, and series. |
| Schiit | https://www.schiit.com/drivers | Official Windows USB Drivers page; newer Unison USB devices on Windows 10/11 usually do not need a separate driver. |
| Sennheiser | https://www.sennheiser.com/en-us/support | Official Sennheiser Support page with Downloads & instructions. Most headphones / USB-C headphones use system USB Audio or Sennheiser software; avoid third-party "Sennheiser driver" mirrors. |
| Shanling | https://en.shanling.com/download/73 | UA and EM / EA line USB driver page with compatible and incompatible model notes. |
| Singxer | https://www.singxer.com/col.jsp?id=108 | Official USB Audio Class2 driver page. |
| Solid State Logic | https://solidstatelogic.com/products/ssl2-plus | SSL 2 / 2+ / MKII product page with Windows ASIO/WDM Driver download entries. |
| Sony | https://www.sony.com/electronics/support/software/00282467 | Sony UDA-1 USB DAC Amplifier Driver official support page with Windows versions, file name, and installation notes. |
| Sony Japan | https://www.sony.jp/support/netjuke/download/driver-uda1/ | Japanese official UDA-1 USB terminal Windows driver page. |
| SOtM | https://docs.sotm-audio.com/doku.php?id=en%3Ahow_to_install_dx-usb_hd_driver | SOtM official documentation for installing the dX-USB HD Windows driver and finding the official product page. |
| SOULNOTE | https://www.soulnote.audio/soulnote-en/downloads | Official SOULNOTE Downloads page; Drivers and firmware links point to the manufacturer's software page. |
| SOULNOTE Software | https://www.kcsr.co.jp/eu_sn_software.html | Official SOULNOTE software / driver entry; confirm the exact D-1N, D-2, D-3, or other model before installing. |
| Soulution | https://soulution-audio.com/downloads/ | Soulution official Downloads page with USB Driver entries for 590 / 560 / 760 and 330 / 325 products. |
| SPL | https://spl.audio/en/spl-produkt/phonitor-x/ | SPL Phonitor x official page; The Drivers section provides Windows drivers for DAC768xs / DAC192, while Mac / iOS is usually class-compliant. |
| SSL Japan | https://www.solid-state-logic.co.jp/products/ssl2 | SSL Japan official page directly listing SSL 2 / 2+ Windows ASIO/WDM Driver downloads. |
| Steinberg / Yamaha | https://o.steinberg.net/en/support/downloads_hardware/yamaha_steinberg_usb_driver.html | Yamaha Steinberg USB Driver official download page for UR, IXO, and related Yamaha USB audio devices. |
| T+A | https://www.ta-hifi.de/en/support/series-200/support-dac-200-2/ | DAC 200 support page with Windows driver and installation manual. |
| TASCAM | https://tascam.jp/int/ | TASCAM international site; USB Audio Interface Driver packages are usually on each product's Support / Downloads page. |
| TASCAM US-1200 | https://tascam.jp/int/product/us-1200/support | Example product support page showing TASCAM driver, firmware, and document downloads. |
| TEAC | https://www.teac.co.jp/int/support/download | TEAC group download hub; choose the relevant Premium Audio, TASCAM, or ESOTERIC product. |
| Technics | https://jp.technics.com/support/downloads/pc-app/index.html | Official Technics Audio Player / Driver for Windows download page for Technics products with USB-DAC capability. |
| TempoTec | https://www.tempotec.net/pages/firmware-download | TempoTec official Driver & Firmware Download page with Sonata, Serenade, V6, March, M5, and other USB2.0 Audio Driver packages. |
| Theta Digital | https://www.thetadigital.com/software/ | Official Theta Digital Software page, mainly for Downloader / firmware update utilities; no normal USB DAC audio-driver download page was verified, and Casablanca USB is mostly for Dirac / control workflows. |
| TOPPING | https://www.toppingaudio.com/download/v5-74-driver-for-most-of-topping-dacs | Official driver for most TOPPING DACs, with separate Win10/11 and Win7/8.1 packages. |
| Totaldac | https://www.totaldac.com/use_note.htm | Official Totaldac usage notes: Windows 10 / iOS / Linux need no driver installation; older Windows drivers are provided by email when needed. |
| TRUTHEAR | https://truthear.com/download | TRUTHEAR official Download Center with SHIO USB DAC/AMP driver and firmware entries, including version and MD5. |
| Universal Audio | https://www.uaudio.com/downloads/ua-connect | UA Connect official download page; Apollo, Volt, and UAD software and drivers are usually managed through UA Connect. |
| Vermeer Audio | https://www.vermeeraudio.com/es/archivo/ | Official Vermeer Archives with Vermeer Audio TWO / LaSource / LaFontaine USB audio driver, upgrade packages, and legacy Audio Aero drivers. |
| Vermeer Audio TWO | https://www.vermeeraudio.com/produit/vermeer-audio-two/ | Vermeer Audio TWO official product page confirming asynchronous USB input and USB DSD64 support; get drivers through the official Archives page. |
| Violectric / Lake People | https://www.violectric.de/produkte/zubehoer/violectric-usb-eingang-mit-24-bit/192-khz-tenor-fuer-dac | Official Violectric USB input module page stating that Windows applications need a proprietary driver from the download area. |
| Wadia | https://www.wadia.com/ContentsFiles/wadia-di322om-01.pdf | Wadia di322 official manual says the Windows USB Audio Driver is available from the product page PC DRIVER SETUP area; check the exact Wadia model page. |
| Weiss Engineering | https://weiss.ch/support/downloads/highend-hifi/ | Weiss High-End Hi-Fi official download area with DAC202, DAC50x / HELIOS, and USB Audio Device Driver (WIN) entries. |
| Wyred 4 Sound | https://wyred4sound.com/ | Official Wyred 4 Sound site; some older asynchronous USB DACs / USB converters require dedicated drivers, while current products should be checked by model Downloads / FAQ. |
| xDuoo | https://xduoo.net/firmware-download/ | Official firmware and driver entry; some manuals point here for XDUOO USB Driver. |
| YULONG | https://www.yulongaudio.com/cn/col.jsp?id=111 | Official Chinese download page with Win11, legacy Win7 / XP, and older DA-series drivers. |
| Zoom | https://zoomcorp.com/en/jp/audio-interface/ | Zoom official audio interface product entry; each model's Support & Downloads page provides drivers and firmware. |

<style>
  .dac-driver-link {
    align-items: center;
    display: inline-flex;
    gap: 0.55rem;
    line-height: 1.25;
    max-width: 100%;
    padding: 0.18rem 0.35rem 0.18rem 0.2rem;
    text-decoration: none !important;
    vertical-align: middle;
    background: transparent !important;
    border-radius: 8px;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
    transition:
      background-color 160ms ease,
      color 160ms ease;
  }

  .dac-driver-link:hover {
    background: rgba(123, 87, 176, 0.1) !important;
  }

  .dac-driver-link__icon {
    background: rgba(255, 255, 255, 0.86);
    border: 1px solid rgba(123, 87, 176, 0.16);
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(67, 56, 101, 0.08);
    flex: 0 0 auto;
    height: 1.35rem;
    object-fit: contain;
    padding: 0.16rem;
    width: 1.35rem;
  }

  .dac-driver-link__text {
    display: grid;
    gap: 0.08rem;
    min-width: 0;
  }

  .dac-driver-link__host,
  .dac-driver-link__path {
    display: block;
    max-width: min(34rem, 100%);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dac-driver-link__host {
    color: currentColor;
    font-weight: 750;
  }

  .dac-driver-link__path {
    color: var(--sl-color-gray-3);
    font-size: 0.82em;
    font-weight: 520;
    overflow-wrap: anywhere;
  }

  :root[data-theme='dark'] .dac-driver-link:hover {
    background: rgba(189, 167, 255, 0.14) !important;
  }

  :root[data-theme='dark'] .dac-driver-link__icon {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(205, 190, 255, 0.24);
  }
</style>

<script>
(() => {
  const root = document.querySelector('[data-dac-origin-filter]');
  if (!root) return;

  const chineseBrands = new Set([
    'aune',
    'Audio-GD',
    'AURALiC',
    'AURALiC China',
    'Cayin',
    'Cayin V5.74',
    'DENAFRIPS',
    'Eversolo',
    'Eversolo FAQ',
    'FiiO',
    'Fosi Audio',
    'GUSTARD',
    'HiBy',
    'Hidizs',
    'Holo Audio',
    'iBasso',
    'iBasso DC series',
    'Khadas',
    'LAiV Audio',
    'Lotoo',
    'Matrix Audio',
    'Matrix Audio driver package',
    'MOONDROP',
    'NICEHCK Yuandao / YUANDAO',
    'PALAB',
    'Questyle',
    'Shanling',
    'Singxer',
    'S.M.S.L',
    'TempoTec',
    'TOPPING',
    'TRUTHEAR',
    'xDuoo',
    'YULONG',
  ]);

  const normalize = (value) => value.replace(/\s+/g, ' ').trim();
  const table = Array.from(document.querySelectorAll('.sl-markdown-content table')).find((candidate) => {
    const head = candidate.querySelector('thead th:first-child');
    return head && /品牌|Brand/i.test(head.textContent || '');
  });
  if (!table) return;

  const rows = Array.from(table.querySelectorAll('tbody tr'));
  const toggle = root.querySelector('[data-dac-origin-toggle]');
  const count = root.querySelector('[data-dac-origin-count]');
  if (!toggle) return;

  rows.forEach((row) => {
    const link = row.cells[1]?.querySelector('a[href^="http"]');
    if (!link || link.dataset.dacDriverLink === 'ready') return;

    link.dataset.dacDriverLink = 'ready';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.classList.add('dac-driver-link');

    const label = link.textContent || link.href;
    const text = document.createElement('span');
    text.className = 'dac-driver-link__text';
    link.textContent = '';

    try {
      const url = new URL(link.href);
      const host = document.createElement('span');
      const path = document.createElement('span');
      host.className = 'dac-driver-link__host';
      path.className = 'dac-driver-link__path';
      host.textContent = url.hostname.replace(/^www\./, '');
      path.textContent = url.pathname === '/' && !url.search ? 'Official site' : url.pathname + url.search;
      text.append(host, path);
      link.title = label;

      const icon = document.createElement('img');
      icon.className = 'dac-driver-link__icon';
      icon.alt = '';
      icon.decoding = 'async';
      icon.loading = 'lazy';
      icon.referrerPolicy = 'no-referrer';
      icon.src = 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(url.hostname) + '&sz=32';
      icon.addEventListener('error', () => icon.remove(), { once: true });
      link.append(icon);
    } catch {
      // Keep the original link usable if a URL is malformed.
      text.textContent = label;
    }

    link.append(text);
  });

  rows.forEach((row) => {
    const brand = normalize(row.cells[0]?.textContent || '');
    row.dataset.chineseDac = chineseBrands.has(brand) ? 'true' : 'false';
  });

  const update = () => {
    const onlyChinese = toggle.checked;
    let visible = 0;
    rows.forEach((row) => {
      const show = !onlyChinese || row.dataset.chineseDac === 'true';
      row.hidden = !show;
      if (show) visible += 1;
    });
    if (count) count.textContent = onlyChinese ? visible + ' Chinese brands shown' : rows.length + ' brands total';
  };

  toggle.addEventListener('change', update);
  update();
})();
</script>

If your brand is not listed, search for the manufacturer site plus the exact model and `support` or `download`. If you cannot find an official package, test playback through the built-in Windows USB Audio 2.0 / WASAPI path first instead of installing an unknown ASIO driver.

---

# Cloud Drive Connection Guide

Source: src/content/docs/en/docs/cloud-drive.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/cloud-drive/
Description: Connect your own remote music library through WebDAV, NAS, Subsonic, or Navidrome.

ECHO can connect to remote music libraries that you are allowed to access. Common options include WebDAV cloud drives, NAS folders, and personal music servers such as Subsonic or Navidrome.

If you have not chosen a route yet, we recommend a Subsonic-compatible service, especially Navidrome. ECHO has special optimization for the Subsonic path: library pagination, album and artist browsing, playback URL handling, artwork caching, and large-library navigation work more like a real music service instead of a plain remote folder scan.

## Server Recommendation: Rainyun

If you do not already have a NAS or cloud server, but want to keep Navidrome, Subsonic, WebDAV, reverse proxy, object storage, or another remote-library service online, consider [Rainyun](https://www.rainyun.com/NzY3Mzg5_).

Rainyun is a China-based cloud service platform. Its common product lines include cloud servers, game cloud hosting, physical servers, virtual hosting, object storage, and CDN services. For ECHO users, the useful role is simple: run a stable remote music service. For example, you can deploy Navidrome on a small cloud server, mount your music folder there, and let ECHO connect through the Subsonic protocol instead of repeatedly scanning a slow remote directory.

Recommended uses:

- For a long-term cross-device music library: rent a lightweight cloud server, deploy Navidrome / Gonic / Airsonic, then add it to ECHO as a Subsonic source.
- For WebDAV or reverse-proxy testing: start with a small instance and verify ports, certificates, and folder permissions before moving a full library.
- For artwork, public static files, or helper assets: object storage and CDN can be useful, but music rights and access control remain your responsibility.

This is a promotion link, not an ECHO requirement. You can keep using your own NAS, home server, another cloud provider, or local-network setup. No matter which service you use, ECHO only recommends connecting content that you have the right to access and use.

## Confirm Rights And Access

Only connect music that you own, are licensed to use, or are otherwise allowed to access. ECHO does not provide music downloads, bypass paid access, bypass copyright protection, or support infringing sources.

Before connecting, prepare:

- A service URL, such as `https://music.example.com` or `https://dav.example.com/music/`.
- A username and password, app password, or access token.
- A small test folder that works in the browser or the original service client.
- A few known-good audio files, preferably MP3 / FLAC / M4A.

## Recommended: Subsonic / Navidrome

Subsonic-compatible services are the best long-term remote-library option for ECHO. They expose a music library API instead of only a file list, so album, artist, artwork, playlist, and large-library browsing are much more reliable.

Recommended workflow:

1. Deploy Navidrome, Gonic, Airsonic, or another Subsonic-compatible server.
2. Confirm the server has scanned your music folder and can play tracks in its web UI.
3. In ECHO, open remote sources and choose `Subsonic` or the compatible entry.
4. Enter the server URL, username, and password.
5. Test the connection, then browse a small album or artist first.
6. Play one normal-format track and verify artwork, duration, and progress.
7. Enable broader sync, caching, or indexing only after the small test works.

Why this route is preferred:

- Large libraries are more stable because ECHO does not need to list the whole folder tree at once.
- Album, artist, track number, and artwork data are usually cleaner than a raw file directory.
- ECHO can read the source as a music service, reducing folder-guessing behavior.
- Playback URLs are generated by the server, which is clearer for remote access.
- Pagination and weak-network behavior are friendlier for big libraries.

If your cloud drive stores the files but you can run a small server, mount the drive on the server and let Navidrome scan it. ECHO then connects to Subsonic instead of directly browsing the cloud drive folder, which is usually more stable.

## WebDAV Cloud Drives

Many cloud drives, NAS products, and sync tools provide WebDAV. WebDAV is universal, but it is still a remote file directory. Performance depends on the provider, network, folder layout, and authentication.

Connection steps:

1. Enable WebDAV in the cloud drive or NAS admin panel.
2. Copy the WebDAV URL and check whether the trailing path slash is required.
3. Use an app password when the service supports one.
4. In ECHO, choose `WebDAV` under remote sources.
5. Enter the URL, username, and password.
6. Test the connection, then open one small folder.
7. Play one track before expanding to the full library.

WebDAV tips:

- Do not scan the whole cloud-drive root at first.
- Keep a clear music layout such as `Music/Artist/Album/Track.flac`.
- Many small files, deep folders, and slow providers will make browsing slower.
- Confirm playback stability before enabling artwork caching or broad indexing.
- Corporate, campus, or public networks may block WebDAV ports.

## NAS / LAN Folders

For a home NAS, first make sure LAN access is stable. Common bottlenecks are disk sleep, account permissions, certificates, routing, DDNS, and port forwarding.

Suggestions:

- Use a stable LAN IP or hostname first.
- Use HTTPS and a trusted certificate for external access.
- Avoid exposing admin ports directly if you are unsure about public-network risk.
- If the NAS sleeps, the first browse or playback action may wait for the disk to wake.
- Keep the computer and NAS powered during the first large-library index.

## Troubleshooting

Check in this order:

1. Confirm the account works in the browser or official client.
2. Verify the URL, port, path, and HTTPS certificate.
3. Test a small folder instead of the full library.
4. Try a normal-format audio file to rule out a damaged or unusual track.
5. Temporarily disable proxies or switch networks.
6. Check the server log to see whether requests reach the server.

When reporting an issue, include the service type, server version, URL format, error screenshot, proxy state, network environment, and whether playback works in the original web UI.

## When Not To Connect A Cloud Drive Directly

Use Subsonic / Navidrome instead when:

- The library is large or deeply nested.
- WebDAV folder listing is slow or times out.
- You want album, artist, and playlist browsing instead of folder browsing only.
- You need more reliable artwork, duration, track numbers, and playback URLs.
- You often access the same library across devices or networks.

In short: WebDAV is good when you want to open a remote folder. Subsonic is better when you want ECHO to treat the source as a long-term remote music library. Prefer Subsonic when you can.

---

# Open Source, Sponsorship, And Community Boundaries

Source: src/content/docs/en/docs/community-boundaries.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/community-boundaries/
Description: ECHO's boundaries around open source, sponsorship, support, and community communication.

ECHO is an open-source project, not an on-demand service desk. Open code, public docs, and available builds do not mean maintainers must absorb every rude demand as a product requirement.

You are welcome to use ECHO, report bugs, provide logs, write reproductions, submit PRs, and improve docs. You are not welcome to treat unpaid maintenance as something owed to you personally.

## Open Source Is Not Zero Cost

Open source means the source is visible, the rules are transparent, and collaboration is possible. It does not make development, testing, packaging, support, compatibility work, documentation, and long-term maintenance free.

ECHO maintenance includes:

- Desktop playback behavior, operating-system audio differences, and driver compatibility.
- Library scanning, remote sources, plugins, lyrics, artwork, and metadata boundaries.
- Builds, signing, releases, downloads, documentation, and issue reproduction.
- The quiet long-term work that keeps a real project usable.

Treating all of that as an infinite free entitlement does not make anyone look like an open-source expert. It just burns time.

## Sponsorship Is Not A Scam

ECHO may accept sponsorships. ECHO may also offer paid services, hosted services, premium conveniences, or other sustainability paths in the future. That is not the same thing as a scam.

Projects do not run on air, and maintainers do not recharge from comments saying “but it is open source.” If you dislike sponsorship or paid extras, you can keep using the existing open-source version or fork the project and maintain it yourself.

Please do not enjoy the work while framing maintenance cost as a moral failure.

## Support Is Not A Wishing Well

Clear, reproducible, low-risk issues are easier to handle. These do not raise priority:

- No logs, no screenshots, no version number, only “it does not work.”
- Personal preferences presented as official obligations.
- Requests for sources or integrations with obvious copyright, authorization, or platform-boundary risk.
- Threats, labels, moral pressure, or passive-aggressive demands.

Maintainers may help, and maintainers may decline. Open source does not lock project authors behind a service counter.

## Community Boundaries

You can criticize ECHO. You can report bugs. You can say a design is awkward. You can bring facts, logs, and reproduction steps.

These are not welcome:

- Personal attacks, harassment, public shaming, or exposing personal information.
- Pushing third-party infringement risk onto ECHO.
- Turning “I want this” into “you must build this.”
- Mistaking restraint for permission to keep draining maintainers.

If a conversation turns into pressure, insults, or bad-faith accusations, ECHO may stop engaging. That is not fear of criticism; it is basic project hygiene.

## How To Help ECHO Improve

Please provide actionable information:

- ECHO version, operating system version, and install channel.
- Reproduction steps, screenshots, error text, logs, or diagnostics.
- For audio issues: output mode, device name, file format, sample rate, and bit depth.
- For library issues: import path type, scan stage, and error details.
- For feature requests: the real use case, not only “make it faster.”

That kind of feedback reduces back-and-forth and is more likely to be handled. ECHO welcomes serious collaboration, not unpaid emotional outsourcing.

---

# ECHO Developer Program

Source: src/content/docs/en/docs/developer-plan.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/developer-plan/
Description: An introduction to the ECHO Developer Program for plugin authors, contributors, audio developers, and documentation maintainers.

The ECHO Developer Program is for people who want to contribute to the ECHO ecosystem: plugin authors, frontend developers, audio-chain developers, tooling contributors, documentation maintainers, testers, and other collaborators who can help the project improve.

Approved developers may receive ECHO Pro for development and testing, join the developer chat, and get access to developer repositories or collaboration materials when needed.

## Development Access Boundary

Official ECHO development is only for approved ECHO Developers. People who are not approved through the Developer Program may report issues, suggest improvements, maintain their own forks, or send documentation corrections, but they may not participate in official ECHO development, access developer repositories, use internal materials, or submit implementation work that expects to be merged.

Before contributing code, plugins, build, release, authorization, update-feed, or engineering-documentation work, read the [Developer Access Rules](./engineering/developer-access/).

## What To Provide

When applying, include:

- QQ, for identity confirmation and group invitation.
- GitHub profile, public projects, or contribution history.
- Development experience, such as frontend, Electron, audio, plugins, backend, mobile, or documentation.
- The direction you want to contribute to.
- Optional competitive-programming or portfolio links, such as Codeforces, AtCoder, Luogu, or other public work.

Playback-app authors and professional recording or audio workers may apply directly with a short description of their background.

## Boundaries

Developer access and Pro eligibility are for development and validation. Do not share authorization, internal repositories, test builds, or unreleased information. Contributions should stay scoped, stable, verifiable, and aligned with ECHO's long-term maintenance.

---

# DLNA / Network Streamer

Source: src/content/docs/en/docs/dlna-connect.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/dlna-connect/
Description: How to cast from ECHO to DLNA / UPnP renderers, connect network streamers, and troubleshoot discovery, format, and firewall issues.

This guide is for sending music from ECHO to a DLNA / UPnP network streamer, receiver, TV, smart speaker, or amplifier.

ECHO's casting model is:

```text
ECHO selects and controls music -> ECHO exposes a temporary audio URL -> the DLNA renderer plays it
```

ECHO is not recording your sound card and streaming that audio. It gives the renderer a network URL for the current track.

## Quick Setup

1. Put the ECHO computer and streamer on the same LAN.
2. Enable DLNA / UPnP Renderer / Media Renderer mode on the streamer.
3. Play or select a normal MP3 or FLAC in ECHO.
4. Open ECHO's `Connect` page.
5. Click `Refresh`.
6. Find your streamer in the device list.
7. Click `Connect`.
8. After playback starts, control play, pause, stop, volume, and seek from ECHO.

If the device list is empty, troubleshoot LAN discovery, firewall, router isolation, and streamer mode before changing audio output or EQ settings.

## DLNA Roles

| Role | Meaning | Example |
| --- | --- | --- |
| DMS / Media Server | Provides media files | NAS, Jellyfin, Windows media sharing |
| DMR / Media Renderer | Plays audio | Network streamer, receiver, TV, smart speaker |
| DMC / Control Point | Controls playback | ECHO or a phone controller app |

ECHO acts like a control point and also exposes the current track through a temporary HTTP URL. You need a **Media Renderer**, not only a Media Server.

## What ECHO Supports

ECHO can:

- Discover DLNA / UPnP Media Renderers.
- Set the playback URL.
- Send play, pause, stop, seek, and volume commands.
- Poll playback state and position.
- Provide audio and artwork URLs to the renderer.

ECHO prefers formats the device reports as supported. If the current file is unsupported, ECHO may use a conservative MP3 transcode path. Common friendly formats include MP3, WAV, FLAC, M4A/AAC, OGG, and AIFF, but device firmware matters.

## Network Preparation

Recommended:

| Item | Recommendation |
| --- | --- |
| ECHO computer | Same home router as the streamer |
| Streamer | Same router; wired Ethernet if possible |
| Windows network | Private network |
| Router | Guest/AP isolation off |
| VPN / proxy | Off for first setup |
| Firewall | Allow ECHO / Electron / Node on private networks |

Avoid first setup on hotel Wi-Fi, campus networks, corporate networks, guest Wi-Fi, phone hotspots, or VPN-routed networks. These may allow internet access while blocking local discovery.

## Prepare The Streamer

Check:

1. The device is powered on.
2. It is on the same LAN as ECHO.
3. DLNA / UPnP Renderer / Media Renderer mode is enabled.
4. It is not stuck in Bluetooth, USB DAC, optical, coaxial, or another input mode.
5. Volume is not zero.
6. Another controller app is not occupying it.
7. Old firmware devices may need a reboot.

Some devices expose `DLNA Server` but not `DLNA Renderer`. ECHO needs Renderer mode for casting.

## Cast From ECHO

1. Play or select a track in ECHO.
2. Use MP3 for the first test if possible.
3. Open `Connect`.
4. Click `Refresh`.
5. Wait a few seconds.
6. Find the device marked `DLNA / UPnP`.
7. Click `Connect`.
8. ECHO pauses local playback and asks the renderer to play.

ECHO does not allow empty-metadata casting. If the button is disabled, there may be no current track, the device may be unavailable, or the device is unsupported.

## What Happens During Casting

For local files:

```text
local file -> ECHO HTTP service -> streamer reads URL -> streamer plays
```

For remote files:

```text
remote URL -> ECHO forwards or transcodes -> streamer reads ECHO URL -> streamer plays
```

ECHO chooses a local LAN address for the streamer and creates a temporary URL similar to:

```text
http://192.168.1.20:random-port/connect/audio/...
```

The streamer must be able to reach that URL, so firewall and router isolation matter.

## Format Advice

| Format | Advice |
| --- | --- |
| MP3 | Best first test |
| FLAC | Commonly supported by streamers |
| WAV | Compatible but large |
| M4A / AAC | Often works, older devices vary |
| OGG / Opus | Device support varies |
| DSD | Do not use for the first DLNA test |

If one track fails, test MP3 first. If MP3 works, discovery and control are fine, and the problem is likely format support.

## Device Not Found

Check in order:

1. The streamer is on and in renderer mode.
2. ECHO and streamer are on the same LAN.
3. Click `Refresh` in ECHO.
4. Set Windows network type to Private.
5. Allow ECHO through Windows Firewall on private networks.
6. Disable VPN.
7. Disable AP/client/guest isolation on the router.
8. Reboot the streamer.
9. Reboot the router.
10. Test with a phone DLNA controller app.

If the phone app cannot find the streamer either, fix the network or streamer first.

## Found But Connection Fails

Common causes:

- The renderer's AVTransport control endpoint is unstable.
- Another app controls the streamer.
- The current format is unsupported.
- Firewall blocks ECHO's temporary media URL.
- The streamer cannot reach the ECHO computer IP.
- Wired and wireless devices are isolated.

Try:

1. A normal MP3.
2. Reboot the streamer.
3. Close other controller apps.
4. Allow ECHO through firewall.
5. Put both devices on the same router.
6. Use Ethernet for the streamer.

## Metadata Or Artwork Looks Wrong

ECHO sends title, artist, album, duration, and artwork URL, but each renderer interprets metadata differently. Some devices do not show artwork, cache previous artwork, omit artist fields, or report position poorly.

Prioritize audio playback and control stability first.

## DLNA vs AirPlay vs HQPlayer

| Path | Best for |
| --- | --- |
| DLNA / UPnP | Network streamers, TVs, receivers, smart speakers |
| AirPlay | Apple ecosystem and AirPlay 1 / RAOP-compatible paths; AirPlay 2 is not supported |
| HQPlayer | Upsampling, NAA, external HQPlayer chains |
| ECHO native output | Headphones, DACs, sound cards connected to the computer |

Use DLNA for ordinary network streamers. Read [AirPlay Support Boundaries](/en/docs/airplay-connect/) for AirPlay, and use HQPlayer for HQPlayer/NAA chains.

## Minimal Successful Configuration

1. ECHO computer and streamer on the same home router.
2. Windows network type set to Private.
3. Streamer in DLNA Renderer mode.
4. ECHO plays an MP3.
5. Open `Connect`.
6. Click `Refresh`.
7. Find the streamer.
8. Click `Connect`.
9. Audio comes from the streamer.

After this works, test FLAC, remote sources, artwork, seek, and high-bitrate files.

## Reference

- UPnP Forum resources: <https://openconnectivity.org/developer/specifications/upnp-resources/>

---

# Download And Plugin Source Boundaries

Source: src/content/docs/en/docs/download-and-plugin-source-boundary.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/download-and-plugin-source-boundary/
Description: ECHO provides no music-content download functionality, and plugin source interfaces are technical extension points whose legality is the user's responsibility.

This page defines ECHO's boundary around downloads, source integrations, plugin interfaces, and legal responsibility.

## ECHO Provides No Music Download Functionality

ECHO provides no functionality for downloading music content.

ECHO does not host, distribute, sell, mirror, index, or provide copyrighted audio content, and it will not help users download, scrape, crack, rehost, or bypass platform copyright protection, paid access, region limits, DRM, or access controls.

Website installer downloads, update files, and project source code are not music-content downloads. They are only for installing, updating, or reviewing ECHO itself.

## Plugin Interfaces Are Not Official Sources

ECHO exposes plugin interfaces so users can locally extend commands, themes, panels, metadata, lyrics, artwork, and custom source candidates.

The plugin source interface is only a controlled technical interface. It may let a plugin return candidate metadata and explicit `http` / `https` audio URLs when a user searches or starts playback, but that does not mean:

- ECHO officially provides or endorses that source.
- ECHO officially verifies the copyright status of that source.
- ECHO allows bypassing platform authorization, paid access, DRM, region limits, or access controls.
- ECHO accepts legal responsibility for third-party plugins, scripts, APIs, accounts, URLs, or content sources.

Plugin authors and users must verify that their sources, accounts, network access, and content usage are lawful and comply with the relevant platform terms and local laws.

## Third-Party Source Liability

Anything connected through plugins, user-provided URLs, remote sources, proxies, scripts, private APIs, packet-capture reverse engineering, or third-party services is a third-party source connected by the user or plugin author.

If those sources involve infringement, piracy, payment bypass, access-control bypass, DRM circumvention, unauthorized scraping, rehosting member-only content, gray-market APIs, or platform-rule violations, the responsibility belongs to the integrator, user, plugin author, or service provider. The ECHO project, maintainers, and official docs do not accept legal responsibility for that behavior.

ECHO may provide plugin permission boundaries, sandboxing, logs, and error messages, but it will not provide fixes, adapters, tutorials, interface promises, or bypass methods for illegal or infringing sources.

## Before Reporting

If your issue involves a source, plugin, download site, script, proxy, or private API, check first:

1. The content source is legally authorized.
2. The account and access method comply with platform rules.
3. The plugin returns only lawful, accessible `http` / `https` audio URLs.
4. There is no paid-access, membership, region, copyright, DRM, or access-control bypass.
5. The problem can be reproduced without relying on an infringing third-party source.

Requests that cannot publicly explain the legality of the source are outside official support.

---

# ECHO Pro Activation

Source: src/content/docs/en/docs/echo-pro.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/echo-pro/
Description: Activate ECHO Pro with an Afdian order number, understand HWID binding, and know where to report activation issues.

ECHO Pro is provided through the sponsorship channel. After purchasing it on [Afdian](https://afdian.com/a/echonext), copy the complete order number, usually starting with `2026`, and activate it inside ECHO.

## Steps

1. Open ECHO Next.
2. Go to `Settings -> General`.
3. Open `Pro Activation`.
4. Choose the Afdian order activation mode.
5. Paste the complete order number starting with `2026`.
6. Follow the page prompt to finish activation.

ECHO Pro is bound to the current device HWID. Do not publish or share your order number. If activation, HWID binding, unbinding, or Pro entitlement has problems, report it in the ECHO Pro group with your order number, ECHO version, system version, screenshot, and exact error message.

---

# Developer Access Rules

Source: src/content/docs/en/docs/engineering/developer-access.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/engineering/developer-access/
Description: Official ECHO development access boundaries, communication requirements, contribution flow, and validation principles.

This page defines the access boundary for official ECHO development. It is not a general support channel and it is not a public issue template.

**Only people approved through the ECHO Developer Program and granted collaboration access may participate in official ECHO development, submit mergeable implementation work, access developer repositories, or use internal development materials.** Regular users may report issues, suggest improvements, send documentation corrections, or maintain their own forks, but that is not the same as official ECHO development access.

## Developer Status

In this context, Developer means an ECHO Developer confirmed by the maintainer. It does not mean:

- You only have ECHO Pro.
- You only joined a chat or sent feedback.
- You only can access the public GitHub repository.
- You only forked the project or can run it locally.
- You only used AI to generate code or a PR.

Developer status means your skills, contribution direction, risk awareness, and maintenance commitment have been reviewed. See the [ECHO Developer Program](../developer-plan/) for the application path.

## Read Before Development

Before contributing development work, read at least:

- [ECHO Next Rules](./rules/)
- [ECHO Page Developer Guide](./developer-guide/)
- [How To Ask AI About ECHO](../ai-question-guide/)
- External reference: [Stop-Ask-Questions-The-Stupid-Ways](https://github.com/tangx/Stop-Ask-Questions-The-Stupid-Ways/blob/master/README.md)

The external reference is intentionally blunt. It is linked here because development collaboration is not guesswork. When you report a bug, propose a feature, or ask about implementation, provide the goal, context, reproduction steps, logs, what you already tried, risks, and expected result.

## Allowed Work

Developers may contribute within their granted scope:

- Fix confirmed issues.
- Improve documentation, examples, plugins, and tooling.
- Improve the desktop app, website, build, release, update feed, or diagnostics flow.
- Make small, explainable, reversible experience improvements.
- Submit verifiable implementations for audio, library, metadata, remote-source, and plugin-system work.

Before submitting, be able to explain three things: why the change is needed, what changed, and how you proved it did not break existing behavior.

## Disallowed Work

Developer access does not allow crossing these boundaries:

- Do not bypass authorization, crack the app, fake activation state, or weaken ECHO Pro validation.
- Do not share internal repositories, test builds, private keys, authorization data, unreleased content, or unconfirmed plans.
- Do not wrap ECHO interfaces as hotlinking, download, infringing-source, membership-bypass, region-bypass, or platform-rule-evasion tools.
- Do not change download entry points, auto update, release scripts, authorization services, or public navigation without maintainer confirmation.
- Do not mix large refactors, style cleanup, or drive-by renames into a small fix.

If a change may affect user libraries, playback, downloads, auto updates, authorization state, database migrations, or remote services, explain the risk before implementation.

## Communication Format

Do not send only "this is broken", "can this be done", or "AI says this works". Provide at least:

```text
Goal:
Behavior or request:
Impact:
Related page / file / log:
What I already confirmed or tried:
Possible risk:
Suggested validation:
```

For bugs, include reproduction steps, version, system, logs, and screenshots. For features, describe the real use case first, not only "add a button".

## Contribution Flow

1. Confirm you have Developer access and the required repository access.
2. Check the working tree before starting so you do not overwrite another developer or process.
3. Keep the scope small and touch only the files required for the goal.
4. Explain high-risk points before implementing.
5. Run the smallest useful validation, not long low-value tests for formality.
6. In the PR or delivery note, document the change, validation, risk, and rollback path.

Documentation changes usually only need frontmatter, link, and page-path checks. Download, update-feed, authorization, build-script, and desktop behavior changes require targeted validation for the affected path.

## Direct Rejection Cases

The maintainer may reject a change even if the code runs when:

- The author is not a Developer but submits official implementation work.
- The submission has no goal, context, or validation and only drops code.
- The change attempts to bypass authorization, security boundaries, or platform rules.
- The scope is much larger than the problem.
- The change affects release, download, update, or authorization behavior without a risk note.
- The change introduces a hard-to-maintain framework, dependency, service, or abstraction.

ECHO welcomes development that is maintainable, risk-aware, and provable. Development access is not a trophy. It is a commitment to users, the project, and long-term maintenance cost.

---

# Developer Guide

Source: src/content/docs/en/docs/engineering/developer-guide.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/engineering/developer-guide/
Description: Development boundaries, PR rules, content standards, and validation expectations for ECHO Page contributors.

This guide is for developers who contribute to, maintain, or review ECHO Page. ECHO Page hosts the ECHO Next official website, documentation, changelog, and static update feed, so changes should prioritize site stability, accurate release information, and reliable download paths.

## Project Scope

ECHO Page primarily maintains:

- The homepage, download pages, changelog pages, and documentation site.
- Version notes under `src/content/releases`.
- Static update feed files under `public/update`.
- Documentation content, product images, brand assets, and required deployment scripts.

Do not publish desktop-app implementation details, temporary test notes, experimental planning drafts, or unconfirmed release promises as formal site content. Public pages should only present information that is confirmed, maintainable, and safe for users to rely on.

## Commit And PR Rules

Prefer small, clear PRs. A PR should be explainable in one sentence and should usually touch one category of files, such as documentation only, release notes only, or download-page logic only.

Any large PR must contact me first, otherwise it will be directly rejected.

These changes usually count as large PRs:

- Changing site structure, styling systems, release scripts, and content data at the same time.
- Rewriting the homepage, download page, docs navigation, or update-feed generation logic.
- Introducing a new framework, build plugin, third-party service, or deployment flow.
- Migrating large documentation sets, deleting content in bulk, or reshaping public navigation.
- Affecting downloads, auto updates, SEO, language routing, or build output.

If you are not sure whether a change is a large PR, treat it as one and share the goal, scope, risks, and plan before implementation.

## Development Requirements

Check the working tree before making changes so you do not overwrite work from another developer or process. Only touch the files required for your task; if you see unrelated edits, do not revert them and do not fold them into your PR.

Content changes should stay readable, maintainable, and verifiable:

- Keep Chinese and English pages aligned when the page exists in both languages.
- Release notes must match the real version, artifacts, and update feed.
- External links, download links, GitHub Release links, and mirror notes must be accurate.
- Images should have a clear purpose and should not add unnecessary weight.
- Document titles, sidebar labels, and paths should stay short and stable.

Code and style changes should follow the existing Astro, Starlight, component, and CSS structure. Avoid adding new abstractions, global style layers, or complex runtime logic unless the benefit is clear.

## High-Risk Changes

Be especially careful with changes that:

- Modify `astro.config.mjs`, deployment scripts, domains, language routing, or sitemap behavior.
- Modify `scripts/generate-update-feed.mjs`, `public/update`, or auto-update files.
- Change download artifact selection, version sorting, or GitHub Release sync logic.
- Reshape documentation information architecture, navigation levels, or public entry points.
- Delete docs, images, download assets, or historical release records.

If a change could stop users from downloading, auto-updating, or seeing correct version information, confirm it with the maintainer first.

## Validation Principles

Validation should be efficient. Do not spend a long time on low-value tests just for formality. Choose the smallest proof that still covers the changed behavior:

- For Markdown-only edits, check the page path, title, links, and frontmatter.
- For release-note edits, run content validation and confirm version, date, and artifact fields.
- For update-feed or download logic, verify the generated output and key download entry points.
- For Astro components, routes, or styles, run at least a local build or inspect the affected pages in a browser.

If you do not run a full build or full test pass, say why in the PR and list the targeted validation that was completed.

## PR Description Checklist

A PR description should include:

- What problem the change solves.
- Which files or pages changed.
- What validation was run.
- Any risk, rollback path, or maintainer confirmation needed.

Owning the quality of public content matters more than making a PR large. Keep the scope clear, the behavior verifiable, and the risk explainable.

---

# GitHub Source Snapshot

Source: src/content/docs/en/docs/engineering/github-source-snapshot.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/engineering/github-source-snapshot/
Description: Engineering structure, dependencies, build scripts, platform artifacts, and maintenance boundaries from the Moekotori/ECHO main branch.

This page is based on the [`Moekotori/ECHO`](https://github.com/Moekotori/ECHO) GitHub repository on the `main` branch. It is not a roadmap and does not promise future features. It records current source-backed engineering facts visible in `README.md`, `package.json`, and `docs/ECHO_NEXT_*.md`.

## Repository Facts

| Item | Current state |
| --- | --- |
| Repository | `Moekotori/ECHO` |
| Default branch | `main` |
| Visibility | Public |
| Package name | `echo-next` |
| Current `package.json` version | `26.6.7` |
| License | `Apache-2.0` |
| Electron appId | `app.echo.next` |
| Product / executable name | `ECHO NEXT` |

End-user downloads should still follow [GitHub Releases](https://github.com/moekotori/echo/releases/latest) and the official website mirror notes. This snapshot is for understanding engineering structure and maintenance boundaries.

## Product Positioning

The GitHub README positions ECHO NEXT as an open-source desktop music player for local libraries, HiFi output, and long-term maintenance. The source docs describe it as a boundary-first rebuild rather than another patch layer on top of old ECHO.

Current engineering priorities:

1. Reliable local playback.
2. Stable audio chain.
3. Large libraries without blocking the Renderer.
4. User data safety.
5. Network capabilities as completion and extension only, never above local library and playback stability.

## Runtime Layers

The source architecture is layered like this:

```text
React Renderer
  pages, components, virtual lists, settings, player controls
        |
Typed Preload Bridge
        |
Electron Main Process
  IPC, windows, lifecycle, services, system integration
        |
        +-- Library Core
        |     SQLite, scans, metadata, covers, folders, playlists
        |
        +-- Audio Core
        |     AudioSession, decoder pipeline, output bridge, device state
        |
        +-- Native Hosts
        |     echo-audio-host, WASAPI, ASIO, EQ, SMTC helper
        |
        +-- Experience Services
              lyrics, MV, streaming, plugins, remote sources
```

Important boundaries:

- Renderer owns pages, lists, lyrics, MV, settings, and playback control UI.
- Preload exposes typed `window.echo.*` APIs; it must not expose raw `ipcRenderer`, Node `fs`, `path`, or `process`.
- The main process composes windows, IPC, services, and system integration; domain logic belongs in services.
- Library Core is the local-library source of truth; the Renderer should not hold the full library or rebuild album walls in memory.
- Audio Core is the playback source of truth; the Renderer should not guess authoritative playback position.
- Native hosts handle audio output, DSP, SMTC, and low-level helpers that Electron/Node should not do directly.

## Main Technology Stack

| Area | Current GitHub dependency / signal |
| --- | --- |
| Desktop runtime | Electron `^37.10.3`, electron-vite `^5.0.0`, electron-builder `^26.8.1` |
| Frontend | React `^18.2.0`, React DOM `^18.2.0`, TypeScript `^5.3.3`, Vite `^7.3.3` |
| UI and motion | `lucide-react`, `motion`, `@tanstack/react-virtual`, `@fontsource/outfit` |
| Local database | SQLite through `better-sqlite3` `^12.9.0` |
| Media processing | `music-metadata`, `sharp`, `taglib-wasm`, FFmpeg tooling |
| Text/search helpers | `iconv-lite`, `pinyin-pro`, `opencc-js`, `kuroshiro`, `kuromoji` |
| Playback/media | Native audio host, `shaka-player`, HQPlayer / Connect-related services |
| AirPlay RAOP | Optional dependency `@lox-audioserver/node-libraop`, with packaged `airplayRaopHelper.cjs` |
| Testing | Vitest `^4.1.6`, Testing Library, jsdom, Playwright |

Dependency names prove what the current source includes. They do not automatically make every scenario an official support promise. Public support boundaries still come from user docs, settings copy, and release notes.

## Build Scripts

Key `package.json` scripts:

| Script | Purpose |
| --- | --- |
| `npm run dev` | Rebuild native modules, ensure audio host, then start Electron + Vite development |
| `npm run dev:full` | Build the SMTC host too before starting full development |
| `npm run build` | Type-check, then run electron-vite build |
| `npm run build:win` | Full Windows build: native rebuild, FFmpeg verify, audio host, SMTC host, native scanner, Electron build, NSIS resources, electron-builder, and AirPlay package verification |
| `npm run build:win:unsigned` | Unsigned Windows build path that still runs AirPlay package verification |
| `npm run build:linux` | Build Linux x64 packages through `scripts/build-linux.mjs` |
| `npm run test` | Run Vitest |
| `npm run typecheck` | Run TypeScript type-checking |
| `npm run verify:ffmpeg` | Verify the FFmpeg toolchain |
| `npm run verify:airplay-package` | Verify packaged Windows AirPlay RAOP resources |
| `npm run smoke:audio-host` / `smoke:native-scanner` / `smoke:smtc-host` | Smoke-test native helpers |

Documentation-only changes usually do not need a full desktop build. For ECHO Page docs, `npm run build` in this website repository is the direct validation. For desktop app changes, choose the platform and script that matches the touched surface.

## Platforms And Artifacts

| Platform | Current source configuration |
| --- | --- |
| Windows x64 | NSIS installer and portable build, product name `ECHO NEXT`, shortcut name `ECHO` |
| Linux x64 | AppImage and deb |
| macOS | No macOS build target in `package.json` |

Windows packaged resources include:

- `echo-audio-host.exe`
- `echo-smtc-host.exe`
- `echo-native-scanner.exe`
- `airplayRaopHelper.cjs`
- `electron-app/tools`

Linux packaged resources include:

- `echo-audio-host`
- `echo-native-scanner`
- `electron-app/tools-linux`

The Linux source doc defines the current Linux boundary as x64 first-stage support: AppImage/deb, local library scanning, local WAV / FLAC / MP3 playback, Linux shared native output, and ALSA backend. Linux arm64, Flatpak, Snap, native JACK, native PipeWire, and Linux exclusive/bit-perfect HiFi backend should not be described as supported.

## Source-Document Boundaries

### Library Core

- SQLite is the local-library source of truth.
- Scans, metadata, covers, album grouping, search indexes, health reports, and move candidates stay inside main-process service boundaries.
- Renderer receives paged data only; it should not read SQL, hold the full library, generate covers, or rebuild album walls.
- Watcher and move repair behavior must stay conservative. No automatic deletion, automatic merging, or silent moving of real audio files.

### Audio Core

- Audio Core owns playback, clock, output devices, decoding, DSP state, and HiFi explainability.
- Stable local playback is higher priority than lyrics, MV, downloads, network tasks, or plugins.
- Playback position should come from the output side or authoritative Audio Core state; Renderer timers are not authoritative.
- WASAPI Shared, WASAPI Exclusive, ASIO, DSD, ReplayGain, EQ, resampling, and bit-perfect states must be represented honestly.

### Network Metadata

- Network metadata is weak completion, not a second metadata reader.
- `pending` / `reading` does not mean missing.
- Network results first go to candidate and decision tables. They must not overwrite manual, embedded, sidecar, or folder-structure facts.
- Network artwork must pass through the local cover cache before display; remote URLs are not final artwork truth.

### Linux Build

- Linux packages must be built on Linux x64.
- `build:linux` checks platform, FFmpeg, native ABI, audio host, electron-builder artifacts, and packaged resources.
- CI success proves that packages were produced; it does not prove real desktop audio validation.

## Maintenance Guidance

When updating this page, re-check the current GitHub `package.json`, `README.md`, and `docs/ECHO_NEXT_*.md` first. Do not publish old roadmap items, experimental ideas, issue discussion, or local unpublished branches as public capabilities.

If source facts and official website language conflict, prioritize user safety, playback stability, and actual release notes, then decide whether to update website docs or wait for the desktop implementation to stabilize.

---

# Engineering Docs

Source: src/content/docs/en/docs/engineering/index.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/engineering/
Description: GitHub source snapshot, engineering rules, Linux build notes, metadata capabilities, and native worker architecture for ECHO Next.

This section keeps the engineering material that is useful as public reference. Temporary test notes, suggestion drafts, and process-heavy guides stay out of the formal navigation; build, release, and boundary material lives here.

- [ECHO Next Rules](./rules/)
- [GitHub Source Snapshot](./github-source-snapshot/)
- [Linux Build Guide](./linux-build/)
- [Network Metadata Completion](./network-metadata/)
- [ECHO Next Native Worker Ready Architecture](./native-workers/)
- [Developer Access Rules](./developer-access/)
- [Developer Guide](./developer-guide/)

---

# linux-build

Source: src/content/docs/en/docs/engineering/linux-build.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/engineering/linux-build/

---
title: "Linux Build Guide"
description: "Linux build environment, FFmpeg, audio host, AppImage/deb packaging, and validation matrix."
sidebar:
  order: 91
  label: "Linux Build"
---

这份文档是 ECHO Next 的 Linux x64 打包、验收和故障定位指南。目标不是“能跑一下命令”，而是把 Linux 包从环境准备、FFmpeg、ALSA、native host、electron-builder 到发布前验收都讲清楚。

当前 Linux 支持属于稳健首阶段：产出 x64 `AppImage` 和 `deb`，应用能启动、能扫描本地曲库、能播放本地 WAV / FLAC / MP3，并且在 Linux shared native output 下提供明确的 ALSA 后端。

> [!IMPORTANT]
> Linux 包必须在 Linux x64 环境中构建。不要在 Windows 上直接交叉打 Linux 包。这个项目的 Linux 包需要 Linux 版 `echo-audio-host`、Linux 版 FFmpeg、Linux 原生开发库和 Linux 打包工具；跨平台硬凑很容易产出“看起来有包、实际上不能播放”的假产物。

## 1. 当前支持边界

### 已支持

- Linux x64 桌面包。
- `AppImage`。
- `deb`。
- Electron 主程序、Renderer、Preload、主进程服务。
- 本地曲库扫描和本地播放主流程。
- Linux 版 `echo-audio-host`。
- Linux shared native output。
- shared backend `Auto`。
- shared backend `ALSA`。
- PipeWire 通过 ALSA compatibility layer 暴露出来的设备路径。
- 独立 Linux 工具目录 `electron-app/tools-linux/`。

### 暂不声明支持

- Linux arm64 / aarch64。
- rpm / snap / Flatpak 正式产物。
- JACK 原生后端。
- PipeWire 原生后端。
- Linux 独占 / bit-perfect 级别 HiFi 后端。
- 从 Windows 直接交叉构建 Linux 包。
- 发行版全矩阵兼容承诺。

### 明确仍是 Windows-only

- WASAPI Exclusive。
- ASIO。
- DirectSound compatibility mode。
- SMTC。
- Windows taskbar thumbnail controls。
- Windows audio service restart。

这些边界要保持清楚。Linux 适配不能影响 Windows 端已有播放链路，也不能把尚未验收的 Linux 能力包装成已完成能力。

## 2. 推荐构建环境

优先级从高到低：

1. 原生 Linux x64。
2. Linux x64 VM。
3. Linux CI runner。
4. WSL2 Ubuntu x64。

WSL2 可以用于构建和基础命令验证，但不建议把 WSL2 当成完整桌面验收环境。音频设备、桌面 session、AppImage 启动行为、FUSE 和 sandbox 细节都可能与真实用户环境不同。

推荐版本：

| 项目 | 建议 |
| --- | --- |
| Node.js | 20 LTS |
| npm | 9 或更高 |
| CPU | x64 |
| C++ | 支持 C++17 |
| CMake | 3.24 或更高更稳妥 |
| Electron | 使用仓库 `package-lock.json` 固定版本 |
| FFmpeg | Linux x64 可执行文件，至少包含 `aresample` |

确认平台：

```bash
uname -a
node -p "process.platform + '/' + process.arch"
```

期望 Node 输出：

```text
linux/x64
```

## 3. Ubuntu / Debian 依赖

基础构建和打包工具：

```bash
sudo apt update
sudo apt install cmake g++ pkg-config fakeroot dpkg rpm binutils
```

JUCE / audio host 相关依赖：

```bash
sudo apt install \
  libasound2-dev libjack-jackd2-dev \
  libfreetype-dev libfontconfig1-dev \
  libx11-dev libxcomposite-dev libxcursor-dev libxext-dev \
  libxinerama-dev libxrandr-dev libxrender-dev
```

桌面运行和 AppImage 验收可能需要：

```bash
sudo apt install libgtk-3-0 libnss3 libxss1 libxtst6 libdrm2 libgbm1
```

如果 AppImage 报 FUSE 相关错误，按发行版安装对应 FUSE 运行时。例如 Ubuntu 新版本可能需要：

```bash
sudo apt install libfuse2
```

不同发行版包名可能不同，但核心依赖类别不变：

- C++ 编译链。
- CMake。
- pkg-config。
- ALSA 开发库。
- X11 开发库。
- fontconfig / freetype。
- electron-builder 打包需要的 dpkg / fakeroot / rpm / binutils。

## 4. 获取代码和安装 Node 依赖

新环境从零开始：

```bash
git clone https://github.com/moekotori/echo.git
cd echo
npm ci
```

开发机已有仓库时：

```bash
git pull
npm ci
```

不要把 Windows 下的 `node_modules` 拷到 Linux。这个项目包含 native dependency，Linux 构建需要在当前 Linux 环境里重新安装或重建。

`build:linux` 会自动执行：

```bash
npm run rebuild:native
```

它会让 `better-sqlite3` 等 native dependency 匹配当前 Electron ABI。

## 5. Linux 工具目录

Linux 包使用独立工具目录：

```text
electron-app/tools-linux/
  README.md
  ffmpeg
  ffmpeg-manifest.json
  yt-dlp
```

打包后会复制到：

```text
dist/linux-unpacked/resources/tools/
```

要求：

| 文件 | 是否必须 | 作用 |
| --- | --- | --- |
| `ffmpeg` | 必须 | 解码、探测和音频处理工具链的一部分 |
| `ffmpeg-manifest.json` | 必须 | 记录 FFmpeg 版本、hash、必需 filter 和许可证信息 |
| `yt-dlp` | 可选 | 下载和部分 streaming helper |
| `README.md` | 已在仓库 | 说明目录用途 |

`yt-dlp` 缺失不应该阻断本地曲库扫描、本地播放和 Linux 包构建。它只会让下载/部分流媒体提取能力不可用。

## 6. 准备 FFmpeg

### 6.1 放置 Linux x64 FFmpeg

示例：

```bash
mkdir -p electron-app/tools-linux
cp /path/to/linux/ffmpeg electron-app/tools-linux/ffmpeg
chmod +x electron-app/tools-linux/ffmpeg
```

确认它不是 Windows 二进制：

```bash
file electron-app/tools-linux/ffmpeg
electron-app/tools-linux/ffmpeg -hide_banner -version
```

`file` 输出应该能看出 ELF / Linux x86-64。不要放 `.exe`。

### 6.2 可选放置 yt-dlp

```bash
cp /path/to/yt-dlp electron-app/tools-linux/yt-dlp
chmod +x electron-app/tools-linux/yt-dlp
```

如果没有 `yt-dlp`，可以跳过。

### 6.3 更新 manifest

当前模板在：

```text
electron-app/tools-linux/ffmpeg-manifest.json
```

字段含义：

| 字段 | 说明 |
| --- | --- |
| `name` | 工具名，通常是 `ffmpeg` |
| `version` | `ffmpeg -hide_banner -version` 输出里能匹配到的片段 |
| `source` | 本地或 CI 准备方式说明 |
| `sourceUrl` | 精确来源 URL，能填就填 |
| `downloadPage` | 下载页 |
| `artifact` | 仓库内 artifact 路径，应为 `electron-app/tools-linux/ffmpeg` |
| `sha256` | 当前 FFmpeg 文件的 SHA256 |
| `requiresSoxr` | 是否要求 `--enable-libsoxr` |
| `requiredFilters` | 必须存在的 FFmpeg filters，目前至少 `aresample` |
| `licenseFamily` | 许可证族，当前模板为 `GPLv3` |

计算 hash：

```bash
sha256sum electron-app/tools-linux/ffmpeg
```

检查 filters：

```bash
electron-app/tools-linux/ffmpeg -hide_banner -filters | grep aresample
```

检查 soxr：

```bash
electron-app/tools-linux/ffmpeg -hide_banner -version | grep enable-libsoxr
```

当前仓库模板里 `requiresSoxr` 是 `true`。如果你准备的 FFmpeg 没有 `--enable-libsoxr`，`npm run verify:ffmpeg` 会失败。此时有两个选择：

- 换一个带 `--enable-libsoxr` 的 FFmpeg。
- 如果当前发布目标不要求 soxr，把 manifest 里的 `requiresSoxr` 改成 `false`，但要明确这是发布策略变化。

### 6.4 验证 FFmpeg

```bash
npm run verify:ffmpeg
```

在 Linux 上，这条命令默认检查：

```text
electron-app/tools-linux/ffmpeg-manifest.json
```

如果要显式指定：

```bash
ECHO_FFMPEG_MANIFEST=electron-app/tools-linux/ffmpeg-manifest.json npm run verify:ffmpeg
```

通过时会看到类似：

```text
[verify:ffmpeg] OK ... sha256=...
```

## 7. audio host 和 ALSA

Linux shared native output 由 `echo-audio-host` 提供。构建入口：

```bash
npm run build:audio-host
```

相关源码和配置：

```text
native/audio-host/CMakeLists.txt
native/audio-host/src/main.cpp
native/audio-host/tests/audio_engine_tests.cpp
scripts/build-audio-host.mjs
```

Linux 平台构建特点：

- `ECHO_ENABLE_ASIO` 默认 `OFF`。
- 非 Windows 平台启用 `JUCE_ALSA=1`。
- 非 Windows 平台禁用 `JUCE_JACK=0`。
- CMake 会 `find_package(ALSA REQUIRED)`。
- 生成文件是 `electron-app/build/echo-audio-host`，没有 `.exe`。
- 构建完成后脚本会给 Linux host 设置可执行权限。

手动确认：

```bash
npm run build:audio-host
file electron-app/build/echo-audio-host
test -x electron-app/build/echo-audio-host
```

### ALSA backend 行为

应用层的 shared backend 有两种 Linux 重点路径：

- `Auto`：让 native host 根据当前设备枚举选择可用 shared backend。
- `ALSA`：只选择 ALSA 类型设备，用于明确验证 ALSA 链路。

PipeWire 系统通常通过 ALSA compatibility layer 暴露设备，所以很多现代发行版也可以走 ALSA 路径。但文档和发布说明里仍应写“ALSA 路径”，不要把 PipeWire 原生支持写成已完成。

## 8. 推荐构建流程

从干净 Linux x64 环境开始：

```bash
npm ci
npm run verify:ffmpeg
npm run test:audio-engine
npm run build:linux
```

如果只是重复打包，并且依赖和工具链没有变化：

```bash
npm run verify:ffmpeg
npm run build:linux
```

如果正在排查 audio host：

```bash
npm run build:audio-host
npm run test:audio-engine
```

如果只想先确认前端/主进程能编译：

```bash
npm run build
```

## 9. `build:linux` 做了什么

`package.json` 中：

```text
npm run build:linux
```

实际执行：

```text
node scripts/build-linux.mjs
```

脚本会按顺序做这些事：

1. 检查 `process.platform === "linux"`。
2. 检查 `process.arch === "x64"`。
3. 检查 `electron-app/tools-linux/ffmpeg` 存在且可执行。
4. 执行 `npm run rebuild:native`。
5. 执行 `npm run verify:ffmpeg`。
6. 执行 `npm run build:audio-host`。
7. 检查 `electron-app/build/echo-audio-host` 存在且可执行。
8. 执行 `npm run build`。
9. 执行 `electron-builder --linux`。
10. 检查打包后的 `resources/echo-audio-host`。
11. 检查打包后的 `resources/tools/ffmpeg`。
12. 如果源码目录有 `yt-dlp`，检查打包后的 `resources/tools/yt-dlp`。
13. 检查 `dist/` 下是否有 `.AppImage`。
14. 检查 `dist/` 下是否有 `.deb`。

只要其中任一步失败，脚本会停止。不要跳过失败继续发布。

## 10. electron-builder Linux 配置

Linux 配置在 `package.json` 的 `build.linux`：

```text
build.linux.icon = software.png
build.linux.target = AppImage x64 + deb x64
build.linux.category = AudioVideo
```

Linux extra resources：

```text
electron-app/build/echo-audio-host -> resources/echo-audio-host
electron-app/tools-linux -> resources/tools
```

也就是说，Linux 包里的 audio host 和 FFmpeg 都不是从 Windows 资源目录拿的。

预期产物：

```text
dist/linux-unpacked/resources/echo-audio-host
dist/linux-unpacked/resources/tools/ffmpeg
dist/*.AppImage
dist/*.deb
```

如果存在 `yt-dlp`：

```text
dist/linux-unpacked/resources/tools/yt-dlp
```

产包后检查权限：

```bash
test -x dist/linux-unpacked/resources/echo-audio-host
test -x dist/linux-unpacked/resources/tools/ffmpeg
test ! -f dist/linux-unpacked/resources/tools/yt-dlp || test -x dist/linux-unpacked/resources/tools/yt-dlp
```

## 11. 本地启动和桌面验收

### AppImage

```bash
chmod +x dist/*.AppImage
./dist/*.AppImage
```

### deb

```bash
sudo apt install ./dist/*.deb
```

安装后从桌面启动器或命令行启动。

### 最小验收

用小曲库验收，不要一上来导入超大库：

1. 启动应用。
2. 首次启动能进入主界面。
3. 导入一个小型本地音乐文件夹。
4. Songs 页面能显示歌曲。
5. Albums 页面能显示基本专辑信息。
6. 播放 WAV。
7. 播放 FLAC。
8. 播放 MP3。
9. 暂停、继续、上一首、下一首正常。
10. 切换曲目不会提前结束。
11. 进度不会异常跳动。

### Linux 输出验收

按顺序验收：

1. `System` 输出播放一首歌。
2. `Shared` + `Auto` 播放一首歌。
3. `Shared` + `ALSA` 播放一首歌。
4. 在 `ALSA` 下切换曲目。
5. 在 `ALSA` 下暂停 / 继续。
6. 在 `ALSA` 下拖动进度。
7. 打开播放诊断或专业状态面板，确认 output mode / backend 与选择一致。

### Linux 能力边界验收

确认 Linux 上不要出现错误可用的 Windows-only 能力：

- WASAPI Exclusive 不应作为 Linux 可用输出能力出现。
- ASIO 不应作为 Linux 可用输出能力出现。
- DirectSound 不应作为 Linux 可用 shared backend 出现。
- SMTC 相关能力不应被当作 Linux 桌面集成能力。

如果 UI 上能看到某些灰掉或说明性质的 Windows-only 文案，要确认它不会被误认为 Linux 可用路径。

## 12. 建议验收矩阵

发布前至少覆盖：

| 维度 | 最小要求 |
| --- | --- |
| 包格式 | AppImage、deb |
| 音频格式 | WAV、FLAC、MP3 |
| 输出模式 | System、Shared + Auto、Shared + ALSA |
| 曲库 | 小曲库导入和基础浏览 |
| 播放控制 | 播放、暂停、继续、切歌、拖动进度 |
| 平台隔离 | Windows-only 输出不在 Linux 上误暴露 |

有条件时增加：

| 维度 | 建议 |
| --- | --- |
| 发行版 | Ubuntu LTS、Debian stable、Fedora 或 Arch 派生环境 |
| 音频服务 | PulseAudio、PipeWire with ALSA compatibility |
| 设备 | 内置声卡、USB DAC、蓝牙输出 |
| 时间 | 连续播放 30 分钟以上 |
| 曲库 | 中型曲库扫描后播放 |

不要把所有压力混在一轮里。先确认播放，再确认扫描，再确认长时间稳定性。这样出现问题时更好定位。

## 13. 常见失败和处理

### 13.1 在 Windows 上运行 `build:linux`

现象：

```text
[build:linux] Linux packages must be built on Linux x64.
```

处理：

- 切到 Linux x64。
- 使用 WSL2 / VM / CI runner。
- 不要绕过脚本的平台检查。

### 13.2 架构不是 x64

现象：

```text
[build:linux] Linux packaging currently supports x64 only.
```

处理：

- 换 x64 runner。
- arm64 支持要另做构建链、依赖、产物和验收，不要直接复用 x64 文档。

### 13.3 找不到 Linux FFmpeg

现象：

```text
[build:linux] Missing Linux ffmpeg
```

处理：

```bash
ls -l electron-app/tools-linux/ffmpeg
file electron-app/tools-linux/ffmpeg
chmod +x electron-app/tools-linux/ffmpeg
```

确认它是 Linux ELF x86-64 文件。

### 13.4 FFmpeg 不可执行

现象：

```text
[build:linux] Linux ffmpeg is not executable
```

处理：

```bash
chmod +x electron-app/tools-linux/ffmpeg
```

如果是在 CI artifact 解压后丢失权限，也要在 CI 里显式 `chmod +x`。

### 13.5 manifest hash 不匹配

现象：

```text
[verify:ffmpeg] SHA256 mismatch
```

处理：

```bash
sha256sum electron-app/tools-linux/ffmpeg
```

把 manifest 的 `sha256` 更新为当前文件 hash。注意：如果 FFmpeg 来源不可信，先换可信二进制，不要为了过校验直接改 hash。

### 13.6 manifest 版本不匹配

现象：

```text
[verify:ffmpeg] Version output does not contain "..."
```

处理：

```bash
electron-app/tools-linux/ffmpeg -hide_banner -version
```

把 manifest 的 `version` 改成输出中真实存在的稳定片段。

### 13.7 缺少 `aresample`

现象：

```text
[verify:ffmpeg] Required FFmpeg filter is missing: aresample
```

处理：

- 换带 `aresample` 的 FFmpeg。
- 不建议移除 `requiredFilters` 来绕过，因为音频链路依赖重采样能力。

### 13.8 缺少 `libsoxr`

现象：

```text
[verify:ffmpeg] FFmpeg build configuration does not include --enable-libsoxr
```

处理：

- 使用带 `--enable-libsoxr` 的 FFmpeg。
- 或在确认发布策略允许后，把 `requiresSoxr` 改成 `false`。

### 13.9 `npm ci` 失败

处理：

- 确认 Node.js 是 20 LTS。
- 删除当前 Linux 环境的 `node_modules` 后重新 `npm ci`。
- 不要复用 Windows `node_modules`。
- 如果是网络问题，先处理 npm registry / proxy，不要改业务代码。

### 13.10 native module ABI 问题

可能表现为 `better-sqlite3` 加载失败或 Electron ABI 不匹配。

处理：

```bash
npm run rebuild:native
```

然后重新：

```bash
npm run build:linux
```

### 13.11 audio host 编译失败

现象：

```text
[build:audio-host] Failed to build JUCE audio host.
```

优先检查：

```bash
cmake --version
g++ --version
pkg-config --modversion alsa
```

再确认依赖：

```bash
sudo apt install cmake g++ pkg-config libasound2-dev libfreetype-dev libfontconfig1-dev
```

如果日志里是 JUCE 拉取失败，先处理网络或 CMake FetchContent 缓存，不要先改 audio host 代码。

### 13.12 electron-builder 没产出 AppImage / deb

检查：

```bash
ls -la dist
```

确认 `package.json` 里的 Linux target 仍包含：

```text
AppImage x64
deb x64
```

如果只缺某一种包，优先看 electron-builder 输出，不要直接改构建脚本绕过检查。

### 13.13 AppImage 启动失败

先执行：

```bash
chmod +x dist/*.AppImage
./dist/*.AppImage
```

FUSE 相关问题按发行版安装 FUSE runtime。临时分析可用：

```bash
./dist/*.AppImage --appimage-extract
```

但发布验收仍要回到标准 AppImage 启动路径。

### 13.14 deb 安装失败

执行：

```bash
sudo apt install ./dist/*.deb
```

保留 apt 输出。常见方向：

- 目标系统依赖缺失。
- deb metadata 不适配目标发行版。
- 本机已有旧安装残留。

不要用强制安装掩盖依赖问题作为发布验收结论。

### 13.15 Linux 下没有声音

先分层确认：

1. 系统播放器是否有声音。
2. ECHO `System` 输出是否有声音。
3. ECHO `Shared + Auto` 是否有声音。
4. ECHO `Shared + ALSA` 是否有声音。
5. 只有某个文件无声，还是所有格式无声。
6. 只有某个设备无声，还是所有设备无声。

可用系统命令辅助：

```bash
aplay -l
pactl info
```

如果 `System` 正常但 `ALSA` 不正常，优先看 ALSA 设备枚举和 audio host 日志。如果所有输出都不正常，先看系统音频服务和应用启动日志。

## 14. CI 示例流程

CI runner 要是 Linux x64。最小流程：

```bash
npm ci
chmod +x electron-app/tools-linux/ffmpeg
test ! -f electron-app/tools-linux/yt-dlp || chmod +x electron-app/tools-linux/yt-dlp
npm run verify:ffmpeg
npm run test:audio-engine
npm run build:linux
```

CI 可以缓存：

- npm cache。
- Electron 下载缓存。
- FFmpeg artifact。
- CMake 下载缓存。

不要跨平台缓存：

- Windows `node_modules`。
- Windows native module build output。
- Windows `electron-app/build/echo-audio-host.exe`。
- Windows `electron-app/tools/`。

CI 构建通过只说明包能产出，不说明真实桌面音频已经验收。发布前仍要做 Linux 桌面手动验收。

## 15. 发布前检查清单

产物：

- `dist/*.AppImage` 存在。
- `dist/*.deb` 存在。
- `dist/linux-unpacked/resources/echo-audio-host` 存在。
- `dist/linux-unpacked/resources/echo-audio-host` 可执行。
- `dist/linux-unpacked/resources/tools/ffmpeg` 存在。
- `dist/linux-unpacked/resources/tools/ffmpeg` 可执行。
- 如果带 `yt-dlp`，打包后也存在且可执行。

基础应用：

- AppImage 能启动。
- deb 安装后能启动。
- 首次启动能进入主界面。
- 小曲库能导入。
- Songs / Albums 基础显示正常。

播放：

- WAV 可播放。
- FLAC 可播放。
- MP3 可播放。
- 暂停 / 继续正常。
- 切歌正常。
- 拖动进度正常。
- 没有明显提前结束。
- 没有明显异常跳进度。

输出：

- `System` 可播放。
- `Shared + Auto` 可播放。
- `Shared + ALSA` 可播放。
- 诊断状态显示和实际输出选择一致。

平台边界：

- WASAPI Exclusive 没有作为 Linux 可用能力出现。
- ASIO 没有作为 Linux 可用能力出现。
- DirectSound 没有作为 Linux 可用 shared backend 出现。
- Windows SMTC 相关能力没有被当作 Linux 能力。

发布说明：

- 标明 Linux 当前是 x64。
- 标明包格式是 AppImage / deb。
- 标明 ALSA 是当前明确支持的 shared native backend。
- 不承诺 JACK / PipeWire native / Linux exclusive HiFi，除非后续已经真实实现并验收。

## 16. 维护原则

Linux 构建和 ALSA 支持后续继续按低风险方式推进：

- 构建链问题先定位环境和脚本，不要先动播放核心。
- FFmpeg 问题先看 manifest、hash、filter、权限和二进制来源。
- ALSA 问题先看设备枚举、backend 选择和 audio host 日志。
- 新增 Linux backend 要保持 Windows 行为隔离。
- 发布前优先做小曲库和播放链路验收，再做大曲库压力。
- 任何可能影响播放稳定性的改动，都要有针对性验证，不能只凭构建通过判断。

---

# ECHO Next Native Worker Ready Architecture

Source: src/content/docs/en/docs/engineering/native-workers.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/engineering/native-workers/
Description: ECHO Next Native Worker Ready Architecture migrated from docs/ECHO_NEXT_NATIVE_WORKERS.md.

Library Core v0.1 is deliberately native-worker-ready. TypeScript owns orchestration, SQLite, IPC validation, pagination APIs, scan jobs, and UI-facing business rules. Heavy work is called through stable worker interfaces so Rust or C++ can replace the first TS implementation without changing Renderer, IPC, or the SQLite schema.

## Worker Boundary

Stable interfaces live under `src/main/library/workers/`:

- `MetadataReader.read(filePath) -> MetadataResult`
- `CoverExtractor.extract(filePath, options) -> CoverResult`
- `FileScanner.scanFolder(folderPath, options) -> AsyncIterable<ScannedFile>`

Current implementations:

- `TsMetadataReader`: `music-metadata`, embedded tags first, filename/folder fallback only for missing fields
- `TsCoverExtractor`: TS+sharp v0.2 cover worker; embedded cover, same-folder cover/front/folder image, generated default, cached paths on disk, and real resize output
- `TsFileScanner`: recursive file enumeration and stat only

Future implementations can be swapped in as:

- `RustMetadataWorker`
- `RustCoverWorker`
- `RustFileScanner`

`LibraryService` and `ScanJobQueue` depend on the interfaces, not on TS concrete classes. Renderer and preload never know which worker implementation is active.

## Stable Return Shapes

`MetadataResult` includes:

- normalized metadata fields
- `fieldSources`
- embedded cover bytes when available for the cover worker
- `warnings`
- `errors`
- `status`

`CoverResult` includes:

- `source`
- `thumbPath`
- `albumPath`
- `largePath`
- `originalRef`
- `sourceHash`
- `mimeType`
- `warnings`
- `errors`

`ScannedFile` includes:

- `path`
- `sizeBytes`
- `mtimeMs`

These shapes are the contract a native worker must preserve. Raw parser details may exist inside the worker result for diagnostics, but Renderer list APIs do not receive them.

## Rust/C++ Priority

Priority order for native work:

1. `CoverWorker`: highest priority only if TS+sharp v0.2 fails measured cover-generation targets.
2. `MetadataWorker`: second priority; tag parsing can become expensive on large libraries.
3. `FileScanner`: only Rust/C++ if 3000/10000 track pressure tests show TS directory walking is a bottleneck.

Audio output is already moving in the same direction through `echo-audio-host`.

## Service Boundary

TypeScript service layer:

- creates scan jobs
- checks incremental cache keys
- schedules worker calls with concurrency limits
- writes SQLite in transactions
- persists album and artist indexes
- exposes paginated IPC-safe results

Worker layer:

- reads tags
- extracts/caches covers; current TS+sharp v0.2 uses `sharp` for resize while TypeScript owns priority and cache scheduling
- enumerates files and stat data

IPC:

- validates input
- calls `LibraryService`
- does not run SQL, parse metadata, extract covers, or scan folders

Renderer:

- calls typed preload methods
- renders paginated tracks/albums/folders/status
- does not group albums, generate covers, scan files, or hold the full library in memory

## Performance Budget

Targets for Phase 1 and Phase 1.5 validation:

- app startup must not scan the whole library
- `getTracks` first page target: under 200 ms
- `getAlbums` first page target: under 300 ms
- unchanged scan skip rate should approach 100%
- cover thumbnails are generated during scan, not while UI scrolls
- album wall reads persisted `albums` rows after restart
- `getTracks` and `getAlbums` never return full cover binary/base64
- scan jobs run in the background and remain cancellable
- metadata and cover workers use concurrency limits
- large libraries must not leave CPU near 50% because an album wall is rendering

## Phase 1.5 Validation

Phase 1.5 Native Worker & Performance Validation:

- use Phase 1.1 `library.getDiagnostics()`, smoke tests, and `npm run benchmark:library` results before committing to native worker work
- build a Go/C#/Rust `CoverWorker` only if cover extraction/cache generation is the measured bottleneck
- evaluate Rust `MetadataWorker`
- run 3000 and 10000 track pressure tests and 3000 and 10000 album-wall pressure tests
- record CPU, memory, total scan time, metadata time, cover time, and album wall load time
- decide from measurements whether `FileScanner` needs Rust/C++
- verify worker replacement does not change Renderer, IPC, SQLite schema, or list payloads

Native CoverWorker decision indicators:

- generating 1000 album thumbs keeps CPU above 50% for a long stretch
- generating 3000 or 10000 covers has unacceptable memory peaks
- Electron `sharp` packaging or native rebuilds are unstable
- cover cache hits remain slow after `thumb.webp` and `album.webp` exist

---

# network-metadata

Source: src/content/docs/en/docs/engineering/network-metadata.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/engineering/network-metadata/

---
title: "Network Metadata Completion"
description: "Readiness states, candidate tables, merge rules, scoring, and provider boundaries for weak network metadata completion."
sidebar:
  order: 92
  label: "Network Metadata"
---

Network metadata is weak completion. It is never a second metadata reader and never a replacement for embedded tags, sidecar files, folder structure, or manual edits.

## Readiness States

Tracks persist explicit readiness:

- `embedded_metadata_status`: `pending`, `reading`, `present`, `missing`, `error`
- `embedded_cover_status`: `pending`, `reading`, `present`, `missing`, `error`
- `network_metadata_status`: `none`, `pending`, `candidate_found`, `applied_missing_only`, `rejected`, `error`

`pending` and `reading` mean "not ready yet", not "absent". Network completion must not treat null fields, fallback display values, or missing cover ids as proof that embedded data is absent.

## Three-Phase Flow

Phase A: Local Metadata Read

- `FileScanner` discovers files.
- `MetadataReader` reads embedded tags and marks embedded metadata `present`, `missing`, or `error`.
- `CoverExtractor` reads embedded/folder cover and marks embedded cover `present`, `missing`, or `error`.
- `tracks` and `covers` are written only after local readers finish.

Phase B: Local Finalize

- Album grouping and artist refresh run from local rows.
- Tracks and albums are usable immediately.
- UI is not blocked by network completion.

Phase C: Network Completion

- Manual trigger only.
- Provider results first go to candidate tables.
- High-confidence candidates may apply missing-only fields.
- Lower-confidence candidates remain visible for review.
- Rejected candidates are recorded and filtered from future prompts.

## Candidate Tables

Network metadata candidates live in `network_metadata_candidates`.

Network decisions live in `network_metadata_decisions` with `applied_fields_json`, so every accepted/rejected/ignored decision is auditable.

Network cover candidates live in `network_cover_candidates`. A network cover URL is never returned to Renderer as artwork. Accepted covers must pass through the cover cache pipeline and become local `thumb`, `album`, and `large` files referenced by `covers`.

## Merge Rules

Metadata priority:

1. manual
2. embedded
3. sidecar/info
4. folder_structure
5. network
6. filename_fallback

Network may write title, artist, album, albumArtist, year, genre, trackNo, and discNo only when:

- `embedded_metadata_status` is `missing` or `error`
- candidate score is at least `0.92` for automatic missing-only application
- the existing field source is `unknown`, `filename_fallback`, or `network`

Network cannot overwrite `manual`, `embedded`, `sidecar`, or `folder_structure`.

Filename fallback cannot overwrite `manual`, `embedded`, `sidecar`, `folder_structure`, or `network`.

Cover priority:

1. manual
2. embedded
3. folder/front/cover
4. network
5. default

Network covers may apply only when:

- `embedded_cover_status` is `missing` or `error`
- current cover source is `default`
- score is at least `0.92`

Network covers never overwrite manual, embedded, or folder covers.

## Scoring

`matchScore.ts` weights title and artist highest, album medium-high, and duration strongly. A duration difference over 10 seconds caps the score below automatic application. If title or artist similarity is weak, a candidate cannot reach high confidence.

Thresholds:

- `score >= 0.92`: eligible for automatic `applyMissingOnly`
- `0.75 <= score < 0.92`: visible candidate, user confirmation required
- `score < 0.75`: filtered or treated as low priority

## Providers

The provider boundary is `NetworkMetadataProvider`.

Current first-pass providers:

- `MockMetadataProvider`: architecture and tests
- `NeteaseCloudMusicProvider`: mainland China-friendly metadata candidates
- `QQMusicProvider`: mainland China-friendly metadata and album-cover URL candidates
- `MusicBrainzProvider`: metadata candidates
- `CoverArtArchiveProvider`: cover boundary placeholder

Providers are not wired into `MetadataReader`. They run behind `NetworkMetadataService` and `NetworkMetadataJobQueue` with concurrency at most 2, timeouts, candidate storage, and failure isolation.

## Why This Avoids The Old ECHO Bug

Old ECHO could see no embedded title/artist/cover yet, assume none existed, and let filename guesses or network data win. ECHO Next stores readiness separately from values:

- Before local read completes, status is `pending` or `reading`.
- Network merge refuses to write metadata while embedded metadata is `pending` or `reading`.
- Network merge refuses to write covers while embedded cover is `pending` or `reading`.
- Once embedded data is `present`, protected field sources prevent network overwrite.
- Only confirmed `missing` or reader `error` opens the missing-only network path.

The important rule is simple: "temporarily unavailable" is not "missing".

---

# ECHO Next Rules

Source: src/content/docs/en/docs/engineering/rules.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/engineering/rules/
Description: Development boundaries, architecture constraints, and anti-cracking rules for ECHO Next.

These rules are ECHO Next's development boundaries and architectural guardrails. New features, refactors, plugin APIs, build scripts, and documentation should follow them.

## Core Development Rules

1. Safety and stability come first. Any change that can affect user music files, playback paths, licensing state, database migrations, auto-update, or remote services must call out risk and prefer a reversible, verifiable implementation.
2. ECHO is a local music player and legal extension platform. It is not a tool for cracking, bypassing authorization, evading payment, bypassing platform access controls, or obtaining infringing content.
3. Any cracking behavior is explicitly forbidden. Official ECHO code, plugin APIs, docs, examples, scripts, builds, and support flows must not provide, imply, assist, or encourage software cracking, service cracking, cracked sources, DRM bypass, account/member/region/payment restriction bypass, forged licensing, activation-state tampering, watermark removal, reverse engineering of third-party protection mechanisms, or distribution of infringing content.
4. Third-party sources, plugins, scripts, and user-provided URLs must only handle content the user is allowed to access and use. Plugin authors and integrators must not wrap ECHO interfaces as download, hotlinking, cracking, or platform-rule evasion capabilities.
5. Licensing and ECHO Pro logic must keep the host/server-signed path as the final source of truth. The frontend and plugins may display state, send requests, or carry proof, but they must not become the licensing authority and must not include bypass backdoors.
6. If a request could be used for cracking, infringement, or restriction bypass, reject that use explicitly and narrow the design to legal, local, user-owned content and publicly verifiable interfaces.

## File Size And Ownership

1. No giant `App.tsx`.
2. No giant `main/index.ts`.
3. No giant global CSS file.
4. Pages over 500 lines must be split.
5. Services over 800 lines must be split.
6. Shared abstractions must have a clear owner and purpose.

## App Entrypoints

`src/renderer/app/App.tsx` may only compose:

- providers
- layout
- routes
- future error boundary

`src/main/index.ts` may only compose:

- app lifecycle
- main window creation through lifecycle
- IPC registration
- necessary service bootstrap

## Renderer Rules

The renderer must not:

- scan folders
- read metadata
- parse covers
- load full covers for lists
- decide album grouping
- hold the whole library in React state
- run heavy search over a full in-memory track array
- let high-frequency playback state rerender the entire app
- know whether library workers are TypeScript, Rust, or C++

Songs, albums, artists, and search results must be paged or virtualized.

Current Phase 1 list defaults:

- songs: `pageSize = 100`
- albums: `pageSize = 60`
- track rows are virtualized with an estimated 70px row height
- list and album-wall images must use lazy loading and async decoding
- AlbumsPage must request page 1 first and append more pages only near scroll bottom; it must not loop through every album page up front
- AlbumWall may stay paged + lazy image for Phase 1.2; add grid virtualization later only if large-library smoke tests prove it is needed

## Preload Rules

Preload must:

- expose `window.echo`
- keep APIs grouped by domain
- return typed results

Preload must not:

- expose raw `ipcRenderer`
- access files directly
- implement business logic
- parse metadata or covers
- know which worker implementation backs Library Core

Renderer must not open Electron dialogs directly. Folder chooser UX must go through preload and IPC, not from React components calling `dialog`.

Renderer EQ UI may render controls, curves, warnings, and preset actions. It must not process audio buffers, calculate native filter coefficients, read/write preset files directly, or bypass the typed `window.echo.eq` preload API.

## Native Worker Boundary

Library Core heavy work must be called through stable interfaces:

- `MetadataReader`
- `CoverExtractor`
- `FileScanner`

`LibraryService` may compose concrete defaults, but orchestration must depend on the interfaces. IPC and Renderer must never import `TsMetadataReader`, `TsCoverExtractor`, or `TsFileScanner`.

Future Go/C#/Rust workers must preserve the same return shapes:

- metadata fields, field sources, warnings, errors, and status
- cover source, thumb path, album path, large path, original reference, source hash, warnings, and errors
- scanned file path, size, and mtime

SQLite schema, IPC payloads, and Renderer list views must not change just because a worker implementation changes.

## Metadata Priority

Metadata priority is fixed:

1. user manual edit
2. embedded tags
3. sidecar/info files
4. folder structure
5. network completion
6. filename fallback

Filename guessing must never overwrite embedded `title`, `artist`, or `album`.

Network metadata must never overwrite embedded tags.

Network metadata must not write fields while `embedded_metadata_status` is `pending` or `reading`. It may apply only missing-only fields after embedded metadata is `missing` or `error`, and only when the current field source is `unknown`, `filename_fallback`, or `network`.

Every stored track must preserve per-field source information in `field_sources_json`.

Phase 1 must persist at least:

- `title`
- `artist`
- `album`
- `albumArtist`
- `trackNo`
- `discNo`
- `year`
- `duration`
- `codec`
- `sampleRate`
- `bitDepth`
- `bitrate`

## Cover Priority

Long-term cover priority is fixed:

1. user manual cover
2. embedded cover
3. local folder cover
4. sidecar cover
5. network cover
6. generated placeholder

Network covers must never overwrite manual, embedded, or local covers.

Network cover lookup is manual and weak. It must not write covers while `embedded_cover_status` is `pending` or `reading`, and it may apply only when the current cover source is `default`.

Current TS+sharp v0.2 covers must be stored as:

- `thumb.webp` at 96x96 for `LibraryTrack.coverThumb`
- `album.webp` at 320x320 for `LibraryAlbum.coverThumb`
- `large.webp` up to 768x768 for NowPlaying/detail
- original

`sharp` performs the real resize work. TypeScript owns cover priority, cache directory scheduling, and fallback behavior.

List views use track thumbs only. Album walls use album thumbs only. Full covers load on demand outside list scrolling.

List APIs must never return `cover_large`, `cover_original`, `largePath`, `originalRef`, raw binary cover data, or base64 cover payloads.

Do not start a Go/C#/Rust CoverWorker until benchmark or smoke-test data proves TS+sharp is insufficient. Decision indicators are sustained CPU above 50% while generating 1000 album thumbs, unacceptable memory peaks for 3000/10000 covers, unstable Electron `sharp` packaging/rebuilds, or slow cover-cache hits after derivatives already exist.

## Long Tasks

All long tasks must be:

- backgrounded
- cancellable
- progress-reporting
- error-collecting

This includes scanning, metadata extraction, cover generation, audio analysis, and future network enrichment.

Network enrichment must not run automatically at app startup, must not issue requests for every scanned track, must use provider timeouts, must keep concurrency at 2 or below, and provider failure must not affect local library rows.

Local library scans must skip metadata parsing when `path + size_bytes + mtime_ms` is unchanged.

Scan jobs must report one of these phases:

- `discovering`
- `checking_cache`
- `reading_metadata`
- `extracting_covers`
- `grouping_albums`
- `writing_database`
- `finished`
- `failed`
- `cancelled`

Per-file metadata or cover errors must be collected without failing the entire scan.

Metadata and cover workers must use concurrency limits. Cover thumbnails must be created during scans, not during list scrolling.

## Library Persistence

SQLite is the source of truth after a scan. Restarting the app must not reparse the whole library.

`better-sqlite3` must be rebuilt for the Electron runtime ABI before desktop dev runs. `npm run dev` owns that check through `npm run rebuild:native`; do not rely on the binary produced for the system Node.js ABI when testing folder import or library scanning in Electron. Vitest uses the system Node.js ABI, so Vitest global setup owns the opposite rebuild even when tests are launched directly through `vitest`, an editor, or `npm test`. `scripts/ensure-native-abi.mjs` caches ABI-specific binaries under `node_modules/.echo-native-cache` to keep repeat Node/Electron switches fast.

Required persisted tables:

- `folders`
- `tracks`
- `albums`
- `album_tracks`
- `artists`
- `covers`
- `scan_jobs`

Album wall views must read the `albums` table. They must not regroup the full track table in the renderer.

If a file is removed from a scanned folder, the next scan must hide it from list APIs without touching the disk file.

Current v0.1 policy: missing files are marked `missing = 1` and filtered out of list APIs. This keeps cache history without deleting the user's disk files.

## Album Grouping

Album grouping must be performed in Library Core and persisted.

Rules:

- same album + same album artist merges
- same album + different album artist does not merge
- album artist missing or unknown uses folder path as a weak separator
- empty or unknown album values must not collapse into one giant album
- year participates in the album key when available

## Testing Rules

Changes touching metadata, cover, audio, library, encoding, database migration, or file scanning behavior must include focused tests.

Library Core tests should prefer real SQLite and mocked metadata readers over large binary audio fixtures unless a parser integration bug specifically requires real media.

Tests that touch Library Core must cover the worker boundary with fake `MetadataReader`, `CoverExtractor`, and `FileScanner` implementations so the architecture stays Rust/C++ ready.

Folder import UX must keep `library.chooseFolder()` in main/preload, treat repeated imports as idempotent rescans, and refresh SongsPage / AlbumsPage after import or scan completion through the shared `library:changed` event. Sidebar import entries are direct actions: `Import Folder` opens the folder picker instead of navigating, and `Import File` opens the local audio file picker without exposing Electron dialogs to Renderer code.

SongsPage must stay a list view, not an import wizard. Its folder-plus button may navigate to `ImportFolderPage` through the lightweight `app:navigate:import-folder` event, while `FoldersPage`, `ImportFolderPage`, and Settings reuse `LibraryFoldersPanel`.

TrackRow may start single-track local playback through a callback passed down from SongsPage. SongsPage may store `currentTrackId`, but high-frequency playback position and audio status must stay out of App.tsx and must not rerender the song list.

The current playback queue is only the visible/loaded SongsPage window. Do not expand it into a full playback queue until a LibraryService-backed queue service exists.

PlayerBar polling is temporary. Future playback/audio status should use throttled IPC push events such as `playback:onStatus` and `audio:onStatus`, and position updates must not rerender SongsPage or TrackList.

Library diagnostics are dev-only. They must use `library.getDiagnostics()`, must not trigger scans, and must not return full track lists, full cover records, binary cover data, or base64 cover data.

EQ changes must preserve the audio-thread boundary. Preset JSON storage belongs to main/native non-realtime code, not the JUCE callback. Native EQ parameters must be passed through atomic or lock-free state, smoothed before use, and must keep disabled/bypassed output bit-transparent once the bypass fade completes.

---

# FAQ

Source: src/content/docs/en/docs/faq.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/faq/
Description: Frequently asked questions, support boundaries, and reporting tips.

## Does ECHO Provide Music Downloads?

No. ECHO strictly follows the DMCA and applicable copyright laws. ECHO officially does not host, distribute, sell, mirror, or provide any music download service, does not provide functionality for obtaining music content, and will not help users bypass copyright protection, paid access, or access controls.

Remote sources, online metadata, plugins, and user-provided URLs should only be used for content you are allowed to access and use. Any infringing third-party source is not official ECHO behavior and is outside support.

See [Download And Plugin Source Boundaries](/en/docs/download-and-plugin-source-boundary/) for the full boundary.

## What Is The Difference Between Remote And Online Sources?

Remote sources usually mean your own WebDAV, NAS, Jellyfin, Emby, Subsonic, or similar service for browsing and playing content you are allowed to access.

Online sources are mostly for metadata, artwork, lyrics candidates, or other information completion. They should not overwrite curated local tags and should not be treated as an official ECHO content library.

## Does ECHO Support AirPlay 2?

Not currently. ECHO maintains AirPlay within an AirPlay 1 / RAOP compatibility boundary. AirPlay 1 connectivity should not be treated as AirPlay 2 support.

AirPlay 2, multi-room synchronization, HomePod / Apple TV-specific behavior, screen mirroring, DRM, and platform access bypass are outside current support. See [AirPlay Support Boundaries](/en/docs/airplay-connect/).

## When Will The Mobile Version Ship?

The mobile version is being worked on, but there is no public date until it can be validated properly.

Mobile is not a quick toggle. It involves UI, playback, library behavior, permissions, operating system differences, and long-term maintenance.

## What About Linux And macOS?

Windows is the main supported platform. Linux keeps a basic build and playback boundary, but users should build and validate it themselves from the documentation. Linux issues without clear reproduction, logs, and a low-risk fix path may not be prioritized.

macOS has no official package and no maintenance promise. There is no stable macOS development, signing, and validation environment for ECHO right now.

## Will ECHO Add A Kugou Music Source?

No. ECHO will not add a Kugou Music source. Please do not treat it as an official roadmap item.

If Kugou appears in docs or settings, it refers to lyrics, metadata candidates, or compatibility boundaries. It does not mean ECHO will provide a Kugou playback source, download source, or platform-content integration.

## Who Is Responsible For Plugin Source Legality?

Plugin interfaces are technical extension points only. They do not mean ECHO officially provides, endorses, or verifies third-party sources.

Legal responsibility for third-party plugins, scripts, APIs, accounts, URLs, or content sources belongs to the plugin author, user, or service provider. The ECHO project and maintainers do not accept legal responsibility for those sources.

## Can Bluetooth Use Exclusive Output?

Do not use Bluetooth for exclusive-output workflows. Bluetooth headphones and speakers should use `System` or `WASAPI Shared`, not WASAPI Exclusive, ASIO, DSD, or bit-perfect paths.

Bluetooth behavior depends on the Windows Bluetooth stack, drivers, device firmware, codecs, radio conditions, and battery state. Bluetooth dropouts, latency, crackling, volume issues, quality changes, device switching, and exclusive-mode failures are outside official ECHO maintenance.

## Is Lag During First Library Import Normal?

Yes, especially for large libraries. First import has to enumerate files, read tags, extract artwork, calculate duration and codec information, write indexes, and refresh album grouping. Higher CPU or disk usage and slower progress at some stages are expected.

Import a 3 to 10 track test folder first, confirm the basics, then import the full library. Avoid full remote syncs, large downloads, or other heavy background work during import.

## What Should I Check First If There Is No Sound?

Check in this order:

1. Windows volume, default output device, and per-app volume mixer.
2. ECHO bottom-player volume, mute state, and queue.
3. Switch `Settings -> Playback` back to `System` or `WASAPI Shared`.
4. Disable EQ, ReplayGain, speed changes, channel tools, and resampling.
5. Play a known-good MP3 or FLAC file.

After basic playback works, test WASAPI Exclusive, ASIO, DSD, or HQPlayer.

## Does ECHO Support ASIO4ALL, FlexASIO, Or Voicemeeter?

No. ECHO does not promise compatibility for third-party drivers, virtual audio devices, ASIO wrapper layers, system-wide audio enhancement drivers, or virtual routing tools, and will not add targeted support for them.

If you need ASIO, use the original driver from your sound card or DAC vendor. Whether third-party wrapper layers work depends on your system and is outside official ECHO support.

## Why Is Output No Longer bit-perfect After DSP?

DSP changes the audio signal. EQ, Preamp, ReplayGain, speed changes, channel balance, resampling, crossfade, and automix all affect raw output.

To validate raw output, disable all DSP and gain processing first, and use a stable wired output device.

## Is Slow Remote Sync A Bug?

Not always. Remote-source speed depends on the server, disk, network, certificate, proxy, transcoding, rate limits, and directory size. Initial indexing of a large NAS or media server can be slow.

Test a small folder and one track first, then expand the scope. If something fails, screenshot the connection state, folder page, sync progress, and error text.

## What Should I Send With A Bug Report?

Please include:

- Screenshots of the current page.
- ECHO version, operating system version, and install channel.
- Reproduction steps.
- Error text, logs, diagnostics, or copied report text.
- For audio issues: output mode, device name, file format, sample rate, and bit depth.
- For library issues: import path type, local/removable/NAS storage, scan stage, and error details.

Screenshots and reports reduce back-and-forth dramatically.

## Does The Website Affect Playback?

No. The website is static. The desktop updater reads the release feed and installer artifacts; it does not parse documentation pages to decide playback behavior.

## Does Publishing Require Frontend Code Changes?

Usually no. Add release Markdown, upload artifacts, and generate the update feed. Frontend changes are only needed when the download page, docs structure, or visual design changes.

---

# HiFi Store Map

Source: src/content/docs/en/docs/hifi-store-map.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/hifi-store-map/
Description: A neutral city-by-city reference for offline HiFi, headphone, DAC, amplifier, and speaker audition stores in China.

This page is a lightweight English entry for the store map in the Chinese docs. Store names and addresses are kept in Chinese because they are meant to be searched directly in Chinese map apps.

To avoid disputes, the published reference does not include dynamic status claims, subjective experience ratings, recommendations, or negative notes from the source spreadsheet. It only keeps city, store name, product direction, and address.

Use the full Chinese list here:

[全国 HiFi 店铺地图](/zh/docs/hifi-store-map/)

Before visiting, verify the store in a map app, confirm opening status, and ask whether the exact device you want to audition is available.

---

# Import Audio Sources

Source: src/content/docs/en/docs/import-audio-sources.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/import-audio-sources/
Description: Beginner-friendly steps for importing local folders, remote libraries, and plugin sources.

In ECHO Next, "audio source" can mean three different things. Pick the path that matches what you actually have.

| What you have | Where to go | Where to check afterward |
| --- | --- | --- |
| Local MP3, FLAC, WAV, or M4A files | `Import Folder` | `Inbox`, `Songs`, `Albums` |
| NAS, WebDAV, Jellyfin, Emby, Subsonic, or Navidrome | `Remote Library` | `Remote Library`, or the remote source switch in song views |
| A third-party plugin source | `Plugins` | `Online Search` with the plugin source selected |

Do not mix these up. A local folder is not a remote library, a remote library is not a plugin source, and enabling a plugin source does not automatically add tracks to your local library.

## Import A Local Music Folder

Start here if you already have music files on your computer.

1. Create a small test folder, for example `D:\Music\Test`.
2. Put 3 to 10 known-good tracks inside it.
3. Include at least one normal MP3.
4. Open ECHO Next.
5. Click `Import Folder`.
6. Select the folder itself, not one file inside it.
7. Confirm the selection.
8. Wait for scanning to finish.
9. Open `Inbox` or `Songs`.
10. Double-click a normal MP3 and confirm the bottom player starts moving.

Do not start by importing an entire drive, a downloads folder, a cloud placeholder folder, or a compressed archive. First prove the simple path works.

If tracks do not appear, check that you selected the correct folder, the folder actually contains audio files, scanning has finished, and the search box is empty.

If the progress bar moves but there is no sound, check system volume, ECHO volume, output device, and playback output mode before touching the database.

## Add A Remote Library

Use this for your own WebDAV, NAS, Jellyfin, Emby, Subsonic, or Navidrome server.

Prepare:

| Needed | Example |
| --- | --- |
| Source type | WebDAV, Jellyfin, Emby, Subsonic |
| Display name | `Home NAS` |
| Server URL | `https://example.com/dav/music/` |
| Account | Your service account |
| Password or token | The service password, app password, or token |
| Music root | The folder that actually contains music |

Steps:

1. Open `Remote Library`.
2. Choose the real source type.
3. Fill in the display name, server URL, account, and password or token.
4. Test the connection before saving.
5. Browse a small folder first.
6. Play one normal MP3 or FLAC.
7. Only after that, enable indexing or a larger sync.

Remote libraries depend on your server, network, certificates, permissions, transcoding, and drive state. A slow remote library is not automatically an ECHO bug.

Only connect content you have the right to access and use. ECHO does not bypass payment, copyright, region, DRM, or platform access controls.

## Import A Plugin Source

Plugin sources are third-party extensions that return search candidates and playback URLs. They are not official ECHO music sources.

If you have an ECHO plugin package:

1. Open `Plugins`.
2. Use the plugin import action.
3. Select the `.json` plugin package.
4. Open the plugin details.
5. Review requested permissions.
6. Enable it only if you trust the source.
7. Check plugin logs.
8. Open `Online Search` and select the plugin source.

If you have a plugin folder:

1. Open `Plugins`.
2. Click `Open Directory`.
3. Put the plugin folder in the directory ECHO opened.
4. Return to ECHO and refresh plugins.
5. Review permissions, enable the plugin, and check logs.
6. Use it from `Online Search`.

Be careful with plugins requesting `network`, `sources:provide`, `library:read`, `settings:write`, or `library:write`. Unknown high-permission plugins should stay disabled.

## Quick Route

To hear the first song quickly:

1. Create `D:\Music\Test`.
2. Put a few known-good MP3 or FLAC files inside it.
3. Open ECHO Next.
4. Click `Import Folder`.
5. Select `D:\Music\Test`.
6. Wait for scanning.
7. Open `Inbox` or `Songs`.
8. Double-click an MP3.
9. Confirm the bottom progress bar moves and you hear sound.

After this works, import the full library, add remote libraries, or enable plugin sources.

---

# ECHO Docs

Source: src/content/docs/en/docs/index.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/
Description: Documentation entry for ECHO.

## Maintenance Boundary: Read The Docs First

These docs are not decorative. If installation, importing audio sources, library management, remote sources, plugins, audio output, troubleshooting, or legal boundaries are already documented, read the relevant page first.

Questions with clear answers already covered by the docs may be closed without further explanation. Accounts that repeatedly refuse to read or follow the docs may be blocked.

If you have read the docs carefully and still cannot operate the app, still need one-on-one guidance, or still need the author to walk you through troubleshooting, purchase [ECHO Pro](./echo-pro/) first. Buying Pro still does not include free personal hand-holding; remote assistance is billed separately at `50 RMB per session`, and only for lawful, non-bypass issues.

Any attempt to violate DMCA, copyright, DRM, paid access, region restrictions, account authorization, membership limits, or platform access controls will be blocked. This includes requests for infringing sources, stream ripping, cracking, bypassing preview limits, bypassing membership restrictions, scraping protected content, adapting gray-market sources, or using plugins to obtain unauthorized content.

ECHO helps you manage and play content you have the right to use. It will not help you obtain, download, crack, mirror, or bypass access controls for unauthorized content.

## Quick Navigation

If you arrived with a specific task or problem, start with [Quick Navigation](./quick-navigation/). It routes common goals and symptoms to the right install, import, library, audio output, remote source, plugin, Pro, troubleshooting, and engineering pages.

ECHO Next is a HiFi desktop music player for local libraries, stable playback, and clear audio output boundaries. These docs collect the long-lived public material: install, library import, output troubleshooting, remote sources, plugins, themes, and engineering references.

## Getting Started

- [Install](./install/)
- [Beginner Setup](./zero-basics/)
- [Quick Start](./quick-start/)
- [User Guide](./user-guide/)

## Library And Remote Sources

- [Library](./library/)
- [Remote Sources](./remote-sources/)
- [Cloud Drive / Subsonic Guide](./cloud-drive/) includes the optional Rainyun server recommendation for Navidrome or WebDAV setups.
- [Download And Plugin Source Boundaries](./download-and-plugin-source-boundary/)
- [Spotify OAuth Setup](./spotify-oauth/)

## Connect

- [DLNA / Network Streamer](./dlna-connect/)
- [AirPlay Support Boundaries](./airplay-connect/)

## Audio Output

- [Audio Output](./audio-output/)
- [EQ Guide](./audio-output/eq/)

## Extensions And Themes

- [Plugin Authoring Guide](./plugins/)
- [AI Theme Guide](./theme-ai-guide/)

## Troubleshooting And Engineering

- [Troubleshooting](./troubleshooting/)
- [FAQ](./faq/)
- [Engineering Docs](./engineering/)

---

# Install and Download

Source: src/content/docs/en/docs/install.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/install/
Description: Download ECHO builds.

The download page reads the latest release content and prefers this site's mirror links. GitHub Releases remains the publishing source; the server syncs assets into `/update/stable/win/` so downloads and app updates do not depend on direct GitHub large-file delivery.

## Windows

- Installer builds are for regular use.
- Portable builds are useful for testing or isolated installs.

## GitHub sync

ECHOPage includes a sync script:

```powershell
$env:GITHUB_TOKEN = "<github token>"
npm run sync:github-release
```

The script reads the latest release from `https://github.com/Moekotori/ECHO/releases`, detects the Windows installer, downloads it into `public/update/stable/win/`, computes the electron-updater `sha512`, writes localized release Markdown, and regenerates `/update/stable/win/latest.yml`.

On the production server, trigger the sync with a scheduled task or GitHub webhook. GitHub remains the source; the Hong Kong server is the stable mirror.

## Auto update

The ECHO client should read `/update/stable/win/latest.yml`. This file is generated from release content and remains compatible with electron-updater.

---

# Internet Radio

Source: src/content/docs/en/docs/internet-radio.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/internet-radio/
Description: How to listen to internet radio in ECHO, where to find stream URLs, and how to troubleshoot radio playback.

ECHO's internet radio feature is simple: paste a playable `http://` or `https://` stream URL and play it.

The important distinction is this: a radio web page is not the same thing as a radio stream URL. ECHO needs the direct audio stream, such as:

```text
https://example.com/live.mp3
https://example.com/stream
http://example.net:8000/radio
```

## Quick Setup

1. Open ECHO's `Connect` page.
2. Find the `Internet Radio` section.
3. Play one of the built-in stations first.
4. To add your own station, find a direct public stream URL.
5. Enter a station name.
6. Paste the stream URL.
7. Click `Play`.
8. If it works, click `Favorite`.

Current ECHO radio rules:

| Item | Rule |
| --- | --- |
| Supported URL | `http://` and `https://` |
| Unsupported URL | `mms://`, `rtsp://`, `rtmp://`, URLs with username/password |
| Saved stations | Up to 40 |
| Playback | ECHO plays the live stream directly |
| Metadata | Station name becomes the title; artist is `Internet Radio` |
| Connect | ECHO disconnects active Connect casting before radio playback |

## Playing A Built-In Station

1. Open `Connect`.
2. Scroll to `Internet Radio`.
3. Click the play button next to a built-in station.
4. Check the bottom player.
5. Confirm audio plays.

If built-in stations work, ECHO's network playback path is working. If a custom station fails afterward, the issue is usually the URL, the station server, or your network route.

## Adding Your Own Station

1. Enter a readable station name.
2. Paste a direct stream URL.
3. Click `Play`.
4. If it works, click `Favorite`.
5. The saved station appears in the list.

Test before saving. Many directories list multiple stream links, and some links are stale, browser-only, or region-limited.

## Where To Find Stations

Use legal public station directories and official station pages. Avoid pirated relays, private member APIs, packet-captured temporary URLs, and sources that bypass access control.

### Radio Browser

Radio Browser is an open community radio database. It is useful for searching by country, language, tag, codec, and bitrate.

Recommended workflow:

1. Search by station name, country, language, or genre.
2. Open the station entry.
3. Copy the direct stream URL, not just the web page.
4. Prefer MP3 or AAC when multiple streams exist.
5. Paste the URL into ECHO and test.

Useful searches:

| Goal | Search terms |
| --- | --- |
| Japanese pop | `jpop`, `j-pop`, `anime` |
| Classical | `classical`, `baroque`, `piano` |
| Jazz | `jazz`, `smooth jazz` |
| Ambient | `ambient`, `downtempo` |
| News | country name plus `news` |

### TuneIn

TuneIn is useful for discovering station names, regions, and official websites, but it may not expose a direct stream URL.

If TuneIn does not give a stream URL:

1. Open the station's official website.
2. Look for `Listen Live`, `Stream`, `MP3`, `AAC`, `M3U`, or `PLS`.
3. Copy the direct stream URL into ECHO.

### SHOUTcast And Icecast

Many internet radio stations use SHOUTcast or Icecast. Their directories often expose `.m3u`, `.pls`, `/stream`, or `/live.mp3` links.

Common clues:

- `listen.pls`
- `listen.m3u`
- `stream`
- `live.mp3`
- `;stream.mp3`
- `:8000/`

If you get an `.m3u` or `.pls` file, open it as text and copy the real `http/https` URL inside.

## M3U And PLS

M3U example:

```m3u
#EXTM3U
#EXTINF:-1,Example Radio
https://stream.example.org/live.mp3
```

Paste the `https://stream.example.org/live.mp3` line into ECHO.

PLS example:

```ini
[playlist]
NumberOfEntries=1
File1=https://stream.example.org/live
Title1=Example Radio
Length1=-1
```

Paste the `File1=` URL into ECHO.

## Format Advice

| Format | Advice |
| --- | --- |
| MP3 | Best compatibility |
| AAC / M4A | Common and efficient |
| OGG / Opus | May work, but compatibility varies |
| FLAC radio | Higher bandwidth; more sensitive to network issues |
| HLS `.m3u8` | Prefer a normal MP3/AAC stream first |

For radio, stability matters more than the highest bitrate.

## Troubleshooting

### No sound

1. Test a built-in station.
2. Try a different MP3 stream.
3. Check system and ECHO volume.
4. Switch audio output back to `System` or shared output.
5. Disable proxy or VPN temporarily.
6. Test the URL in a browser or another player.

### ECHO says the URL is invalid

Check:

- It starts with `http://` or `https://`.
- There are no leading/trailing spaces.
- It is not a web page URL.
- It is not `mms://`, `rtsp://`, or `rtmp://`.
- It does not contain username/password credentials.

### It stops after a while

Possible causes:

- The station server is unstable.
- The URL uses a temporary token.
- The bitrate is too high.
- Proxy, VPN, campus, or company network routing is unstable.
- The station blocks some regions or clients.

Use an official long-lived stream URL when possible.

## Legal Boundary

Use legal public streams. ECHO does not provide radio content, host audio, bypass region locks, crack member APIs, or document how to capture protected temporary URLs.

## References

- Radio Browser: <https://www.radio-browser.info/>
- TuneIn: <https://tunein.com/>
- SHOUTcast: <https://directory.shoutcast.com/>

---

# Library

Source: src/content/docs/en/docs/library.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/library/
Description: Local library import, scanning, tags, artwork, and large-library maintenance.

ECHO is local-library first. After you import a folder, ECHO reads audio files, embedded tags, artwork, duration, codec information, and writes them into a searchable, paged, recoverable local index.

## First Import

Do not import an entire drive on the first run. Start with a small check:

1. Prepare a folder with 3 to 10 known-good tracks.
2. Import it from `Import Folder`.
3. Check `Songs`, `Albums`, and `Inbox` for tracks, artwork, and album grouping.
4. Double-click a track and confirm playback.
5. Import the full library afterward.

This separates "does ECHO work" from "does this large library need cleanup", which makes troubleshooting much faster.

## Import Lag Is Normal

Lag, slower progress, and higher CPU or disk usage during the first import of a large library are normal. ECHO has to:

- Enumerate audio files in folders.
- Read tags from MP3, FLAC, M4A, WAV, OGG, and other files.
- Extract or cache artwork.
- Calculate duration, codec, sample rate, and bit depth.
- Write the SQLite index.
- Refresh album, artist, and folder grouping.

Avoid running full remote syncs, large downloads, full-library artwork completion, or other heavy background work while import is running. Finish the first import before doing tag cleanup, artwork completion, or remote sync.

## Scan And Rescan

Importing the same path again should behave like a rescan, not a duplicate library. Rescan when:

- You added many tracks to a folder.
- You changed tags in bulk.
- Artwork or track order changed.
- Files were moved, replaced, or restored.

Do not treat full-library rescan as the first fix for everything. If one album is wrong, fix that album's tags first. If one folder is wrong, rescan that folder first.

## Tags And Album Grouping

When albums look wrong, check these fields:

| Field | Effect |
| --- | --- |
| `title` | Track title |
| `artist` | Track artist |
| `album` | Album title |
| `albumArtist` | Album artist; decides whether same-named albums merge |
| `trackNo` | Track order |
| `discNo` | Multi-disc order |
| `year` | Year display |
| Artwork | Album wall, player, and detail views |

Tracks from the same album should usually share the same `album` and `albumArtist`. Compilations, soundtracks, and multi-artist albums especially need a clean `albumArtist`.

## Network Metadata

Network metadata is useful for filling missing information. It should not overwrite high-confidence tags you already curated. Recommended priority:

- Manual local edits first.
- Embedded tags first.
- Folder structure and same-folder artwork first.
- Network results as candidates or weak completion.

Before applying network results in bulk, try a small selection. Do not overwrite the whole library in one step.

## File Safety

The ECHO library index is not the same thing as your real audio files. Normal library maintenance should respect these boundaries:

- Removing a library record should not automatically delete real music files.
- Missing files should be marked missing or repaired, not used as a reason to erase history immediately.
- Tag writing, move repair, and bulk operations should require explicit user confirmation.
- Before deleting, renaming, or moving real files, check the path and keep a backup.

## Large-Library Tips

- Use search, paging, sorting, and folders to narrow problems.
- Back up important music files before bulk tag edits.
- Keep the computer powered and prevent external drives from sleeping during scans.
- Network drives, removable drives, and NAS libraries depend on device and network speed.
- If something fails, screenshot scan progress and error details before sending a report.

---

# Lyrics And MV Matching

Source: src/content/docs/en/docs/lyrics-and-mv.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/lyrics-and-mv/
Description: Explains lyrics and MV matching limits, especially Bilibili MV sync limits, and when to use the MV diagnostics report.

Lyrics and MV lookup are candidate-matching features. ECHO NEXT uses the current track title, artist, album, duration, tags, and online sources to find likely results, then tries to pick a good candidate.

The goal is convenience, not perfect certainty. When lyrics or MV results are wrong, out of sync, or unavailable, inspect the candidate and diagnostics first. Do not treat every mismatch as a broken library, audio output, or player.

## Why Matching Cannot Be 100%

There is no universal source of truth for every track version. The same song may exist as:

| Case | Result |
| --- | --- |
| Original, live, edit, remix, instrumental | The timeline and MV may differ completely |
| Single version and album version | Lyrics may drift over time |
| Titles with feat., with, translated names, romanization, aliases | Search can return mixed candidates |
| Non-standard video titles | MV results can include fan edits, stages, clips, or reuploads |
| Recompressed or trimmed uploads | Video and local audio will not naturally align |
| Changing platform result order | Today's first candidate may not stay the same |

Automatic matching can save time, but it cannot replace judging the exact version.

## Lyrics Matching

Recommended confidence order:

1. Local LRC or lyrics you saved yourself.
2. Embedded lyrics.
3. Online lyrics candidates.
4. Manually selected candidates.
5. Per-track offset or manual correction.

When lyrics are wrong, classify the problem first:

| Symptom | Likely Cause | First Step |
| --- | --- | --- |
| Completely different song | Wrong candidate | Pick another candidate |
| Whole song is early or late | Candidate has a global offset | Adjust per-track offset |
| Starts right, drifts later | Different version or duration | Use lyrics for the same version |
| Only a few lines are wrong | Poor lyric timeline quality | Pick another candidate or edit manually |
| Translation does not align | Translation and main lyrics differ | Disable translation or pick another candidate |

Do not use the global offset to fix one song. Global offset is only for cases where every song is consistently early or late on your setup.

## Why MV Matching Is Harder

MV matching is even less likely to be perfect, especially when the MV source is Bilibili.

Bilibili is a video platform, not a one-to-one official MV database for your local audio files. A result may be an official MV, live stage, subtitled upload, fan edit, clip, reupload, interpolated version, recompressed version, concert segment, or regional version. The video title, description, tags, uploader, and view count are clues, not proof that the video is the exact MV for the audio file you are playing.

Also, the audio inside a Bilibili video is usually not the same file ECHO is playing locally. Even if it is the same song, it can contain:

1. Intro cards, outro cards, black frames, or subtitles.
2. Trimmed intros or endings.
3. Recompressed audio.
4. Live audio instead of studio audio.
5. MV and album versions with different durations.
6. Display delay from frame rate, browser decoding, or buffering.

For that reason, MV cannot promise exact audio sync. ECHO NEXT can find candidates, try alignment, restart audio when requested, and accept custom URLs, but it cannot turn a third-party video source into an official millisecond-synced asset for your local audio.

## When The MV Is Wrong

Use this order:

1. Check candidate title, uploader, duration, and visible content.
2. Prefer the official MV or the closest official-looking version.
3. If the automatic result is wrong, pick another candidate manually.
4. If you already know the correct video, use a custom URL.
5. If the audio and video are different versions, changing video is better than tuning sync.
6. If the issue is a small whole-video offset, try sync settings.
7. If mismatches are frequent, raise the auto-match threshold.

Do not treat MV mismatch as an audio-output problem. If audio playback is fine and lyrics work, focus on candidates, source, version, and video state.

## When MV Will Not Open

MV playback depends on network access, platform availability, account or cookie state, stream parsing, browser decoding, and rendering. Any of those can cause black video, failed loading, no visible frame, or external-player-only behavior.

Check:

1. Whether your network can access the platform.
2. Whether proxy settings affect Bilibili, YouTube, or other sources.
3. Whether account login or cookies expired.
4. Whether the video requires login, region access, paid access, or passes platform risk checks.
5. Whether the chosen quality is too demanding, such as HEVC, HDR, Dolby Vision, or 4K 60fps.
6. Whether immersive MV background, video wallpaper, or real-time effects are too heavy.
7. Whether an external player can open the same URL.

If MV does not open, stays black, fails to load, plays audio without visible video, or has candidates but cannot play them, enable `MV diagnostics report`. It generates a copyable local Markdown report with MV state, candidates, source information, error clues, and page visibility details.

When reporting the issue, include the `MV diagnostics report`, a screenshot, ECHO NEXT version, operating system version, current track, and the video URL or candidate title. Saying only "MV does not open" is usually not enough to tell whether the cause is network, platform, login, encoding, candidate selection, or rendering.

## Suggested Settings

| Goal | Suggestion |
| --- | --- |
| Reduce wrong matches | Raise the MV auto-match threshold |
| Slow network or UI lag | Disable MV auto-preload and lower max quality |
| Video stutters | Disable 60fps and test 720p or 1080p first |
| Lyrics are hard to read over video | Enable MV lyrics readability or darken the background |
| Candidates are often not official MVs | Pick candidates manually or use a custom URL |
| Debug video not opening | Enable `MV diagnostics report` and copy the report |

## What Not To Do First

These usually do not fix lyrics or MV issues and can make debugging harder:

1. Do not delete the database first.
2. Do not clear the whole library.
3. Do not keep switching audio output modes.
4. Do not change proxy, account, quality, source order, and sync mode all at once.
5. Do not send only a black-screen screenshot without the diagnostics report.

Keep the current track, candidate, settings, and diagnostics report available. That gives enough context to see where the chain failed.

---

# Playlist Import Guide

Source: src/content/docs/en/docs/playlist-import.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/playlist-import/
Description: Import playlists from NetEase Cloud Music, QQ Music, Spotify, plus Bilibili favorites, YouTube playlists, and SoundCloud sets.

ECHO has two playlist-import paths. Normal streaming playlists are imported into `Playlists`. Bilibili, YouTube, and SoundCloud sources are imported as streaming favorite collections. Both paths only read links and account-accessible items you provide. ECHO does not provide download services, bypass platform permissions, bypass paid access, or bypass copyright protection.

## Choose The Right Import Box

Open `Playlists` in ECHO:

1. For NetEase Cloud Music, QQ Music, KuGou, or Spotify playlists, use `Add streaming playlist`.
2. For Bilibili favorites, YouTube playlists, or SoundCloud sets, use `Import favorites` in the streaming favorites area.
3. Paste the full link and click add or import.
4. After import, select the new item in the playlist list or streaming favorites list.
5. Large playlists may take longer because ECHO reads them page by page.

Do not mix the two import paths. YouTube playlists, Bilibili favorites, and SoundCloud sets do not use the normal streaming playlist box. NetEase, QQ Music, and Spotify playlists do not use the favorites import box.

## Normal Playlists: NetEase, QQ, Spotify

### NetEase Cloud Music

Common supported formats:

- `https://music.163.com/#/playlist?id=123456789`
- `https://music.163.com/playlist?id=123456789`
- Share text that contains a full `music.163.com` playlist link
- DJ radio / podcast links, such as `https://music.163.com/djradio?id=990232286`

Notes:

- The link needs an `id=` value, or a path from which ECHO can read the playlist ID.
- If the link comes from the mobile app, copy the share link instead of only copying the playlist name.
- Private playlists, region-limited items, or account-restricted items may fail or import only partly.
- Playback still depends on source availability, copyright state, account state, and network access.

### QQ Music

QQ Music has many link variants. ECHO tries to handle mobile, desktop, legacy web, hash parameters, copied share text, short share redirects, and nested redirect links, but the link must still contain or resolve to a numeric playlist ID.

Common supported formats:

- `https://y.qq.com/n/ryqq/playlist/778899`
- `https://y.qq.com/n/yqq/playlist/7177076625.html`
- `https://i.y.qq.com/n2/m/share/details/taoge.html?id=9102222552`
- `https://i2.y.qq.com/n3/other/pages/details/playlist.html?id=9718644800`
- `https://y.qq.com/musicmac/v6/playlist/detail.html?id=7177076626`
- `https://y.qq.com/portal/playlist.html#id=9718644801`
- `https://c6.y.qq.com/base/fcgi-bin/u?__=...` short share links
- Full QQ Music share text, as long as it contains the complete `https://...` playlist URL
- Links with nested redirect parameters such as `url`, `redirect`, `jumpurl`, `link`, or `shareUrl`

Common QQ mistakes:

- Do not paste only the playlist title, creator name, or a screenshot. Paste the full link.
- Do not manually remove parameters such as `id`, `disstid`, `dissid`, `dirid`, `tid`, or `playlistId`.
- QQ short links may need redirect resolution. If network or proxy handling breaks that redirect, copy the full share link again from QQ Music.
- A track, album, MV, search page, or profile page is not a playlist page and will not import as a playlist.
- The playlist ID is usually numeric. If the link has no numeric playlist ID at all, it is unlikely to import.
- QQ playlist-detail APIs may sometimes return an empty list or reject a request. Confirm the playlist opens publicly in a browser, switch network if needed, and retry later.

Recommended copy workflow:

1. Open the target playlist detail page in QQ Music.
2. Use the share button to copy the link instead of trimming the address manually.
3. If you get a `c6.y.qq.com` short link, you can paste it directly. If it fails, open the short link and copy the final landing page URL.
4. Paste it into ECHO's `Add streaming playlist` box.
5. After import, check the playlist count and artwork in ECHO.

### Spotify

Supported Spotify playlist formats:

- `https://open.spotify.com/playlist/5MFN2Ep3ZU2FIQWIXNSLrT`
- `spotify:playlist:5MFN2Ep3ZU2FIQWIXNSLrT`

Spotify-specific notes:

- Finish [Spotify OAuth Setup](./spotify-oauth/) first and log in with your own Spotify Client ID.
- Spotify playback uses the official player / Connect path and usually requires Premium. ECHO does not expose downloadable Spotify audio URLs.
- Spotify Web API can restrict playlist track-list access. Some playlists can only be read by the owner or collaborators.
- If ECHO reports an owner or collaborator restriction, open the playlist in your system browser, copy it into your own Spotify account, then import the new playlist link.
- In Development Mode, a Spotify app may only allow listed users. Public usage requires quota and user-access handling in Spotify Dashboard.

## Special Collections: Bilibili, YouTube, SoundCloud

These sources behave like streaming favorite collections in ECHO rather than normal long-term playlists. ECHO stores the source, collection name, and readable items so you can browse them later.

### Bilibili Favorites

ECHO supports Bilibili favorite folders, not normal collections, channel pages, or single video pages. The link needs a favorite-folder ID, for example:

- `https://www.bilibili.com/medialist/detail/ml123456789`
- `https://space.bilibili.com/123456/favlist?fid=987654321`
- Favorite links with `fid`, `media_id`, or `mediaId`

Notes:

- Private favorites, inaccessible favorites, or login-required items need a valid Bilibili account state in ECHO settings.
- ECHO reads one favorite folder, not all favorites owned by the Bilibili user.
- If the link opens a single video, dynamic post, or profile page instead of a favorite folder, import will fail.

### YouTube Playlists

Supported YouTube playlist formats:

- `https://www.youtube.com/playlist?list=PLxxxxxxxx`
- `https://www.youtube.com/watch?v=VIDEO_ID&list=PLxxxxxxxx`

Notes:

- The link must contain a `list=` playlist ID.
- A single video URL without `list=` cannot be imported as a playlist.
- Private, members-only, region-limited, age-limited, or login-required playlists depend on the YouTube browser / cookie state configured in settings.
- YouTube list reading depends on network access and the upstream page structure. If import fails, first confirm the same list opens in your browser.

### SoundCloud Sets

ECHO supports SoundCloud sets / playlist pages, for example:

- `https://soundcloud.com/user/sets/name`
- `https://soundcloud.com/discover/sets/...`

Notes:

- A normal SoundCloud track page is not a set and will not import as a favorite collection.
- Private, region-limited, or login-required content may require browser cookies or a logged-in SoundCloud session.
- SoundCloud does not require Artist Pro or a developer API for this path. ECHO uses the saved login state and accessible pages.

## After Import

Normal streaming playlists appear in the `Playlists` list. You can:

- Open, play, and search the imported items like other playlists.
- Refresh an imported remote playlist so ECHO reads the source again.
- Use the external link button to open the original platform page.
- If a track cannot play, check source rights, account state, network access, and provider availability.

Streaming favorite imports appear in the favorites list. You can:

- Switch between Bilibili, YouTube, and SoundCloud collections.
- Sync a saved favorite source again.
- Delete an imported collection from ECHO; this does not delete anything on the original platform.

## Troubleshooting

Check in this order:

1. Make sure you pasted a full URL, not a playlist name, screenshot, short text, or single-track link.
2. Confirm the import path: NetEase / QQ / Spotify use `Add streaming playlist`; Bilibili / YouTube / SoundCloud use `Import favorites`.
3. Open the same link in a browser and confirm the current account and network can access it.
4. For QQ Music, check for a numeric playlist ID or one of `id`, `disstid`, `dissid`, `dirid`, `tid`, or `playlistId`.
5. For Spotify, check OAuth, Premium, allowlist, and owner / collaborator permissions.
6. For Bilibili, YouTube, and SoundCloud, configure account login or browser cookies when the source requires login.
7. If the playlist is large, wait for the first import to finish. Avoid repeatedly clicking import.
8. If it still fails, report the provider, link format screenshot, error text, proxy state, login state, and whether the link opens in your browser.

## Compliance Boundary

Playlist import only syncs list information that you are allowed to access. ECHO does not provide cracking, downloading, membership bypass, region bypass, private-content scraping, or platform-rule bypass. Third-party scripts, gray-market sources, resource-index links, and infringing content are outside official ECHO support.

---

# plugins

Source: src/content/docs/en/docs/plugins.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/plugins/

---
title: "Plugin Authoring Guide"
description: "Plugin permissions, manifest, APIs, panels, and debugging for ECHO Next local plugins."
sidebar:
  order: 50
  label: "Plugins"
---

适用范围：ECHO Next 本地插件系统，当前宿主支持 `apiVersion` 1 和 2，推荐新插件使用 `apiVersion: 2`。

这份文档写给插件作者，也写给第一次打开“插件”页面、心里还没底的人。它会先帮你判断“这个想法适不适合做成插件”，再带你做一个能跑起来的最小插件，最后再讲 manifest、权限、API、面板、provider、导入导出和调试。

目标不是教插件突破宿主限制，而是教你在 ECHO 的安全边界内做出稳定、轻量、不会拖慢播放的扩展。插件应该像一个可靠的小工具：用户知道它要什么权限，出错时能看懂日志，播放音乐时也不会被它拖住。

插件接口只是技术扩展点，不代表 ECHO 官方提供、背书或验证第三方音源。ECHO 不提供任何用于获取音乐内容的下载功能，也不承担第三方插件、脚本、接口、账号、URL 或内容来源产生的法律责任。完整声明见 [Download And Plugin Source Boundaries](/en/docs/download-and-plugin-source-boundary/)。

如果你正在让 AI 帮你写插件，建议把本文的“让 AI 帮你写插件时怎么说”和“常见新手错误”两节一起发给它。那两节把插件类型、权限、manifest、运行边界和 AI 常见错误整理成了更适合模型执行的清单。

## 一句话模型

ECHO 插件是放在用户数据目录 `plugins/` 下的本地文件夹。宿主读取 `echo.plugin.json`，在受控 VM 沙箱里运行 `plugin.js`，按用户确认的权限暴露一个有限的全局 `echo` API，并把 `panel.html` 当作 sandbox iframe 显示。

插件可以做：

- 注册命令，让用户手动运行小工具。
- 读取当前播放状态，做轻量记录或展示。
- 分页读取曲库公开字段。
- 返回元数据、歌词、封面候选，交给宿主和用户决定是否采用。
- 提供自定义音源搜索候选，并在用户触发播放时返回显式 `http` / `https` 音频 URL。
- 使用插件自己的设置、存储、日志和面板。
- 在 `apiVersion: 2` 下通过宿主受控网络 API 访问 `http` / `https`。

插件不能做：

- 直接访问 Node、Electron、SQLite、主应用 DOM、原生音频 host、解码器、DSP 或输出设备。
- Hook 播放热路径、修改音频 buffer、控制 WASAPI/ASIO/native host 细节。
- 任意读写本机文件。
- 自动写入曲库记录或改源音频文件。
- 后台全库扫描、持续高频轮询、长时间同步阻塞。

ECHO 的核心原则是：插件能扩展体验，但不能牺牲播放稳定性。

## 先判断你的想法适不适合做插件

写代码前先停一分钟，问自己五个问题：

| 问题 | 如果答案是“是” | 建议 |
| --- | --- | --- |
| 只是想加一个按钮、菜单动作或小工具吗 | 是 | 从命令插件开始 |
| 需要显示一块自己的界面吗 | 是 | 用 Panel + Command，面板只负责 UI |
| 需要补充元数据、歌词、封面或音源候选吗 | 是 | 用对应 provider，把最终选择交给 ECHO |
| 需要读曲库但不改文件吗 | 是 | 申请 `library:read`，分页读取 |
| 需要改播放链、DSP、数据库、任意本机文件或主界面 DOM 吗 | 是 | 这不是普通插件能做的事，应改 ECHO 主程序或重新设计需求 |

一个好插件通常从很小的版本开始：先能启动，再能跑一个命令，再加权限，最后才加面板或网络。不要一开始就把“搜索、下载、改标签、写文件、自动播放、复杂 UI”全塞进第一版。

## 推荐创作路线

| 阶段 | 你要产出的东西 | 完成标准 |
| --- | --- | --- |
| 1. 描述想法 | 一句话写清楚插件要帮用户做什么 | 不提实现细节也能听懂 |
| 2. 选类型 | 命令、主题、面板、metadata、lyrics、cover、source provider | 知道它主要入口在哪里 |
| 3. 定权限 | `permissions` 只写真的会用到的权限 | 启用时用户不会被无关权限吓到 |
| 4. 写最小版 | `echo.plugin.json` + `plugin.js` | 插件页能看到、能启用、日志能看到启动信息 |
| 5. 加真实能力 | 读取播放状态、曲库分页、网络请求或 provider 返回候选 | 每一步都能单独重载验证 |
| 6. 收尾发布 | README、错误提示、导出包、发布前检查 | 别人拿到也知道怎么启用、怎么排错 |

如果你只是想先感受一下系统，不要从空白文件开始。ECHO 插件页内置了示例：播放状态面板、命令工具、曲库脚本、自定义音源、主题预设。先点“新建”，跑通后再改成自己的插件，会比盯着空白编辑器舒服很多。

## 快速开始

最快、最不容易迷路的方式是这样：

1. 打开 ECHO 的“插件”页面。
2. 点“打开目录”，确认真实插件目录。目录通常是 Electron `userData/plugins`，但不要硬猜路径，以插件页打开的目录为准。
3. 如果你还没想好结构，先在插件页点一个示例插件的“新建”。
4. 打开示例目录，看 `echo.plugin.json` 声明了什么，再看 `plugin.js` 注册了什么。
5. 每次只改一小段，保存后回到插件页点“重载”；如果改了 manifest，再点“刷新”。
6. 启用插件时认真看权限确认。权限越少，用户越容易信任。
7. 出错先看插件详情里的日志，不要马上扩大改动。把代码删回最小能启动的状态，再一段一段加回来。

如果你更想从零开始，下一节可以直接照抄。

## 零基础照着做第一个插件

这一节按“完全没写过 ECHO 插件”的用户来写。你只要会新建文件、复制文本、保存文件，就能先跑起来一个插件。

### 你需要准备什么

| 工具 | 用来做什么 |
| --- | --- |
| ECHO NEXT | 打开插件页面、创建示例、启用插件、看日志 |
| 一个文本编辑器 | 记事本也行，VS Code 更舒服 |
| 一个小音乐库 | 用来测试播放状态、曲库读取、provider 结果 |

建议先用一个只有几十首歌的小曲库试插件。插件写错了通常不会伤到主程序，但大库、网络请求和 provider 组合在一起时，排错会变得很吵。

不要一上来就改 ECHO 主程序源码。普通插件只需要放进 ECHO 打开的 `plugins/` 目录里。你要交付给别人的也是这个插件文件夹或导出的插件包，不是 ECHO 源码改动。

### 第 1 步：找到插件目录

1. 打开 ECHO NEXT。
2. 进入 `Plugins` / “插件”页面。
3. 点击“打开目录”。
4. 系统会打开一个文件夹，这就是插件目录。
5. 以后所有插件文件夹都放在这里。

不要自己猜路径。不同系统、便携版、开发版的用户数据目录可能不一样，以 ECHO 打开的目录为准。

### 第 2 步：新建插件文件夹

在刚才打开的插件目录里，新建一个文件夹：

```text
echo.hello-plugin
```

文件夹名建议和插件 id 一样。插件 id 只能用小写字母、数字、`.`、`_`、`-`，并且要用小写字母或数字开头。新手直接照这个格式写：

```text
echo.你的插件名
```

例如：

```text
echo.my-tool
echo.playback-note
echo.aurora-theme
```

### 第 3 步：写 `echo.plugin.json`

进入 `echo.hello-plugin` 文件夹，新建文件：

```text
echo.plugin.json
```

把下面内容完整复制进去：

```json
{
  "id": "echo.hello-plugin",
  "name": "Hello Plugin",
  "version": "0.0.1",
  "apiVersion": 2,
  "entry": "plugin.js",
  "permissions": [],
  "contributes": {
    "commands": [
      {
        "id": "hello",
        "title": "Hello"
      }
    ]
  }
}
```

这个文件告诉 ECHO：

| 字段 | 你现在先这样理解 |
| --- | --- |
| `id` | 插件的唯一名字，不能和别的插件重复 |
| `name` | 插件页面显示给人看的名字 |
| `version` | 插件版本，先写 `0.0.1` |
| `apiVersion` | 新插件写 `2` |
| `entry` | 插件启动时执行哪个 JS 文件 |
| `permissions` | 插件要什么权限；这个 Hello 插件不需要权限 |
| `contributes.commands` | 告诉 UI：这个插件有一个叫 `hello` 的命令 |

### 第 4 步：写 `plugin.js`

同一个文件夹里再新建文件：

```text
plugin.js
```

把下面内容完整复制进去：

```js
console.log('hello plugin loaded');

echo.commands.register('hello', { title: 'Hello' }, async () => {
  await echo.ui.notify('Hello from ECHO plugin');
  return { ok: true, message: 'Hello from ECHO plugin' };
});
```

这段代码做了三件事：

1. 插件启动时写一条日志。
2. 注册一个叫 `hello` 的命令。
3. 用户运行命令时，发一个通知，并返回一段 JSON。

注意：`echo.plugin.json` 里的命令 id 和 `plugin.js` 里的命令 id 必须一样。这里都叫 `hello`。

### 第 5 步：确认文件结构

现在你的插件目录应该长这样：

```text
plugins/
  echo.hello-plugin/
    echo.plugin.json
    plugin.js
```

如果文件名写成下面这样，ECHO 可能找不到：

```text
echo.plugin.json.txt
plugin.js.txt
Echo.Plugin.Json
Plugin.JS
```

Windows 记事本容易把文件保存成 `.txt`。如果你看不到扩展名，先在资源管理器里打开“显示文件扩展名”。

### 第 6 步：回到 ECHO 刷新

1. 回到 ECHO 的插件页面。
2. 点击“刷新”。
3. 你应该能看到 `Hello Plugin`。
4. 如果看不到，先检查文件夹名、`echo.plugin.json` 文件名、JSON 逗号有没有写错。

### 第 7 步：启用插件

1. 点开 `Hello Plugin`。
2. 点击“启用”。
3. 这个插件没有权限，所以不需要额外信任危险权限。
4. 启用后看插件日志，应该有 `hello plugin loaded`。

如果启用时报错，先看插件详情里的日志。ECHO 会把启动错误写在那里。

### 第 8 步：运行命令

插件启用后，在插件详情里找到命令 `Hello`，点击运行。你应该看到：

- 插件通知：`Hello from ECHO plugin`
- 日志里有命令运行记录。

到这里，第一个插件已经成功了。

如果通知没出来但插件没有报错，先刷新日志；如果日志里出现 `plugin_command_not_found`，说明 manifest 声明的命令 id 和 `plugin.js` 注册的命令 id 不一致；如果出现 `plugin_command_timeout`，说明命令执行超过约 2 秒，需要把耗时逻辑拆小。

### 第 9 步：修改插件后怎么生效

你改了 `plugin.js` 或 `echo.plugin.json` 之后：

1. 保存文件。
2. 回到插件页面。
3. 点击这个插件的“重载”。
4. 如果改了 manifest 但页面没变，点击“刷新”。

不要一边改文件一边期待 ECHO 自动立刻发现。插件系统当前按“刷新/重载”更新。

从这里开始，每次只加一种能力：

| 下一步想做什么 | 先加什么 | 先验证什么 |
| --- | --- | --- |
| 读播放状态 | `permissions: ["playback:read"]`，再调用 `echo.playback.getStatus()` | 命令能返回当前状态 |
| 读曲库 | `permissions: ["library:read"]`，用分页读取 | `pageSize` 不超过 100 |
| 做面板 | 增加 `panel.html` 和 `contributes.panels` | 面板能通过 `plugin:getSummary` 收到响应 |
| 访问网络 | `apiVersion: 2` + `network` 权限，使用 `echo.net.fetchJson/fetchText` | 超时、失败状态能写日志 |
| 做 provider | manifest 声明 provider，`plugin.js` 注册同 id provider | 搜索或候选结果能被 ECHO 收到 |

## 最小主题插件

如果你只是想做主题，不需要写复杂 JS。主题插件主要写 manifest，`plugin.js` 可以只放一行日志。

文件结构：

```text
plugins/
  echo.simple-theme/
    echo.plugin.json
    plugin.js
```

`echo.plugin.json`：

```json
{
  "id": "echo.simple-theme",
  "name": "Simple Theme",
  "version": "0.0.1",
  "apiVersion": 2,
  "entry": "plugin.js",
  "permissions": [],
  "contributes": {
    "themePresets": [
      {
        "id": "simple-blue",
        "title": "Simple Blue",
        "description": "一个最小主题示例。",
        "basePreset": "classic",
        "preview": "linear-gradient(135deg, #10243a 0%, #5cc8dc 100%)",
        "swatches": ["#10243a", "#5cc8dc", "#ffffff"],
        "light": {
          "appBg": "#eef8ff",
          "panel": "#ffffff",
          "accent": "#257f96",
          "text": "#234150"
        },
        "dark": {
          "appBg": "#08111f",
          "panel": "#142234",
          "accent": "#5cc8dc",
          "text": "#c8dce8"
        }
      }
    ]
  }
}
```

`plugin.js`：

```js
console.log('simple theme plugin loaded');
```

启用插件后，进入 `Settings` / “设置” > “外观”，找到“插件主题”，点击主题卡片。ECHO 会把它导入到“我的主题”，之后你还可以继续微调颜色、透明度、圆角和动效。

主题插件常见错误：

| 错误 | 结果 | 正确写法 |
| --- | --- | --- |
| 颜色写 `red` | 会被忽略 | 写 `#ff0000` |
| 颜色写 `#fff` | 会被忽略 | 写 6 位 `#ffffff` |
| 写任意 CSS | 不会生效 | 只写结构化字段 |
| 没有 `light` 也没有 `dark` | 主题会被丢弃 | 至少写一组 |
| `preview` 里写 `url(...)` | 预览会被丢弃 | 只用纯色或 `linear-gradient(...)` |

## 不知道该做哪种插件时先看这里

先按“用户怎么触发它”来选类型，不要按代码复杂度选。

| 你想做什么 | 第一版先做成 | 需要权限吗 | 先别做什么 |
| --- | --- | --- | --- |
| 点一下按钮，弹个提示、复制文本或保存一点小状态 | 命令插件 | 通常不需要 | 不要先做面板 |
| 显示当前播放状态 | 命令插件，跑通后再加面板 | `playback:read` | 不要高频轮询 |
| 控制播放、暂停、跳转 | 命令插件 | `playback:control` | 不要自动连续 seek 或抢用户操作 |
| 统计曲库里有多少歌缺标签 | 命令插件 | `library:read` | 不要一次读完整曲库 |
| 给歌曲提供候选标签 | Metadata Provider | `library:read` | 不要直接写入曲库 |
| 给歌曲提供候选歌词 | Lyrics Provider | `library:read` | 不要返回超大歌词包 |
| 给歌曲提供候选封面 | Cover Provider | `library:read`，可能还要 `network` | 不要下载大图塞进结果 |
| 接入一个第三方音乐搜索源 | Source Provider | `sources:provide`，可能还要 `network` | 不要返回不明确来源的播放 URL |
| 做一个可导入主题 | Theme Preset | 不需要 | 不要写任意 CSS 或脚本注入 |
| 做一个复杂界面 | Panel + Command | 按命令实际用到的 API 申请 | 不要在面板里直接访问 `echo` |

新手推荐顺序：

1. 先做命令插件，因为它最容易看日志、最容易确认成败。
2. 再做主题插件，因为它几乎不需要权限，适合理解 manifest 的贡献点。
3. 再做读取曲库的命令，练习分页和权限。
4. 再做 metadata、lyrics、cover 或 source provider，练习“返回候选，不直接替用户决定”。
5. 最后再做面板。面板体验更好，但多了 `postMessage` 通信，排错成本更高。

记住一个原则：插件应该把“危险动作”交给 ECHO 或用户确认。候选、展示、轻量命令很适合插件；直接改播放链、改数据库、改源文件，不适合普通插件。

## 让 AI 帮你写插件时怎么说

你可以直接把下面这段发给 AI，然后把你的需求补进去。越具体，AI 越不容易生成越界代码。

```text
请按 ECHO Next 插件系统写一个本地插件。
先阅读 docs/ECHO_NEXT_PLUGINS.md 和 docs/plugin-sdk/ForAIReadme.md；如果需要核对真实接口，再看 src/shared/types/plugins.ts、src/main/plugins/PluginManifest.ts、src/main/plugins/PluginService.ts、src/renderer/pages/PluginsPage.tsx。
不要修改 ECHO 主程序源码，只生成插件文件夹内的文件。
使用 apiVersion: 2。
权限最小化，不要申请无关权限。
插件目录名和 id 使用 echo.my-plugin 这种格式。
需要提供 echo.plugin.json、plugin.js、README.md。
如果需要面板，再提供 panel.html，并通过 plugin:runCommand 调用命令。
plugin.js 不要使用 require/import/process/window/document/fetch。
网络访问必须通过 echo.net，并声明 network 权限。
命令和事件 handler 要轻量，超过 2 秒的任务要拆小或返回“已排队”。
请先给出文件结构、manifest、权限理由、使用步骤、调试步骤，再给代码。
我的需求是：在这里写清楚用户怎么触发、要读什么、要展示什么、失败时怎么提示。
```

如果 AI 生成了代码，你要检查：

- 它有没有让你改 `src/main/...` 或 `src/renderer/...`。普通插件不应该改这些。
- 它有没有写 `require`、`import`、`process`、`window`、`document`、`fetch`。
- 它有没有一次申请很多权限。
- 它有没有告诉你把文件放进 ECHO 插件页打开的目录。
- 它有没有写清楚怎么刷新、启用、看日志。
- 它有没有把面板写成“直接调用 `echo`”。面板不能直接拿到 `echo`，要通过 `postMessage` 请求 `plugin:runCommand`。
- 它有没有把长任务写在 `playback:status` 事件里。播放状态事件应该很轻，不要在里面做网络请求、全库查询或大 JSON 写入。
- 它有没有直接采纳第三方返回的数据并写入曲库。普通插件应该返回候选，让 ECHO 和用户决定。

如果 AI 写得太大，先让它缩成“只包含一个命令、一个日志、一种权限”的版本。插件开发里，小而能跑比大而玄学更值钱。

## 常见新手错误

| 现象 | 最可能原因 | 怎么修 |
| --- | --- | --- |
| 插件页看不到插件 | 文件夹没放进插件目录，或 `echo.plugin.json` 文件名错 | 点“打开目录”，确认结构 |
| 插件显示 manifest 错误 | JSON 少逗号、多逗号、引号错 | 用 JSON 校验器检查 |
| `id must use lowercase...` | 插件 id 不符合规则 | 用 `echo.my-plugin` 这种小写格式 |
| `apiVersion must be between 1 and 2` | `apiVersion` 写错或写成字符串 | 新插件写数字 `2` |
| entry 或 panel 不生效 | 写了子目录、绝对路径或错误扩展名 | `entry` 写根目录 `.js` 文件名，`panel` 写根目录 `.html` 文件名 |
| 启用后立刻报错 | `plugin.js` 顶层代码抛错 | 看插件日志，先删到最小代码 |
| 命令不出现 | manifest 里声明了，但 `plugin.js` 没注册 | `contributes.commands[].id` 和 `echo.commands.register` 保持一致 |
| 命令点击没反应 | handler 抛错或超时 | 看日志，减少代码，先返回 `{ ok: true }` |
| 权限不足 | manifest 没写对应权限，或启用时没信任 | 补权限，刷新，再重新启用 |
| 面板里找不到 `echo` | 面板本来就没有 `echo` | 面板用 `postMessage` 调 `plugin:runCommand` |
| 网络请求失败 | 用了 `fetch` 或没申请 `network` | 用 `echo.net.fetchJson/fetchText` |
| 网络请求被拒绝 | 方法、header、URL 或响应大小不符合宿主限制 | 只用 `GET` / `POST`，只传必要 header，控制响应体 |
| 曲库读取很慢 | 一次读太多 | 分页，`pageSize <= 100` |
| provider 有时没结果 | 返回字段过大、数量太多或 handler 超时 | 控制候选数量，先返回小结果，再加缓存 |
| 插件突然被宿主禁用 | 10 分钟内连续启动失败达到隔离阈值 | 修好启动错误后再启用，先用最小代码确认能启动 |
| 导出包里带了缓存 | 手动塞了 `plugin-storage.json` | 删除运行缓存再发布 |

插件目录推荐形态：

```text
plugins/
  echo.my-plugin/
    echo.plugin.json
    plugin.js
    panel.html
    README.md
    echo-plugin.d.ts
```

运行中可能出现这些宿主文件：

```text
plugins/
  plugin-state.json
  echo.my-plugin/
    plugin-storage.json
    plugin-settings.json
```

这些文件是运行状态，不应当手动写入发布包。ECHO 导出插件包时也会排除它们。

## 文件职责

| 文件 | 是否必需 | 作用 |
| --- | --- | --- |
| `echo.plugin.json` | 必需 | 插件 manifest，声明 id、版本、入口、权限和贡献点 |
| `plugin.js` | 通常必需 | 插件入口脚本，在受控 VM 沙箱运行 |
| `panel.html` | 可选 | 插件面板，作为 sandbox iframe 显示 |
| `echo-plugin.d.ts` | 可选 | SDK 类型提示，来自 `docs/plugin-sdk/echo-plugin.d.ts` |
| `README.md` | 可选 | 给自己或用户看的说明 |
| `.css` / `.txt` / `.json` | 可选 | 静态资源或配置，导出包只支持根目录单文件 |

当前导入导出只处理插件根目录下的单文件，不递归子目录。可导出的扩展名是 `.js`、`.mjs`、`.cjs`、`.html`、`.css`、`.json`、`.md`、`.txt`。

## 编辑器类型提示

如果你用 VS Code 或支持 JS 类型检查的编辑器，可以把仓库的 SDK 类型复制到插件目录：

```text
docs/plugin-sdk/echo-plugin.d.ts -> plugins/echo.my-plugin/echo-plugin.d.ts
```

再放一个 `jsconfig.json`：

```json
{
  "compilerOptions": {
    "checkJs": true,
    "types": ["./echo-plugin"]
  }
}
```

这样 `plugin.js` 里访问 `echo.playback.getStatus()`、`echo.metadata.registerProvider()` 等 API 时会有提示。

## Manifest 基础

最小插件：

```json
{
  "id": "echo.my-plugin",
  "name": "我的插件",
  "version": "0.0.1",
  "apiVersion": 2,
  "entry": "plugin.js",
  "permissions": []
}
```

带面板、命令、provider 和插件设置的完整形态：

```json
{
  "id": "echo.metadata-helper",
  "name": "Metadata Helper",
  "version": "0.1.0",
  "apiVersion": 2,
  "minEchoVersion": "26.5.29",
  "entry": "plugin.js",
  "panel": "panel.html",
  "permissions": ["library:read", "network"],
  "contributes": {
    "commands": [
      {
        "id": "lookup-current-track",
        "title": "查询当前曲目"
      }
    ],
    "metadataProviders": [
      {
        "id": "tags",
        "title": "标签候选"
      }
    ],
    "lyricsProviders": [
      {
        "id": "lyrics",
        "title": "歌词候选"
      }
    ],
    "coverProviders": [
      {
        "id": "covers",
        "title": "封面候选"
      }
    ],
    "panels": [
      {
        "id": "main",
        "title": "Metadata Helper",
        "path": "panel.html"
      }
    ],
    "settings": [
      {
        "id": "provider-base-url",
        "title": "Provider URL",
        "type": "string",
        "defaultValue": "https://example.com/api"
      },
      {
        "id": "enable-extra-lookup",
        "title": "Extra lookup",
        "type": "boolean",
        "defaultValue": false
      }
    ]
  }
}
```

字段说明：

| 字段 | 规则 |
| --- | --- |
| `id` | 插件唯一 id，2 到 64 个字符，小写字母或数字开头，可含小写字母、数字、`.`、`_`、`-` |
| `name` | 显示名称，最多约 80 字符 |
| `version` | 插件版本字符串，最多约 40 字符 |
| `apiVersion` | 当前支持 1 到 2，新插件推荐 2 |
| `minEchoVersion` | 可选，仅作为兼容性展示和作者提示 |
| `entry` | 入口脚本文件名，必须是插件根目录内 `.js` 文件，不能写子目录 |
| `panel` | 可选面板文件名，必须是插件根目录内 `.html` 文件 |
| `permissions` | 插件请求权限，用户启用时确认 |
| `contributes.commands` | 插件命令声明，UI 可以展示 |
| `contributes.panels` | 面板入口声明 |
| `contributes.metadataProviders` | 元数据候选 provider |
| `contributes.sourceProviders` | 自定义音源 provider |
| `contributes.lyricsProviders` | 歌词候选 provider |
| `contributes.coverProviders` | 封面候选 provider |
| `contributes.themePresets` | 可导入的自定义主题预设 |
| `contributes.settings` | 插件自己的设置表单 |

注意：manifest 里的贡献点用于展示和声明。真正可运行的命令/provider 仍然要在 `plugin.js` 里注册。

## 主题预设

插件可以通过 `contributes.themePresets` 声明可导入的主题。主题贡献不需要权限，也不需要在 `plugin.js` 里注册逻辑；启用插件后，它会出现在“设置 > 外观”的插件主题区域。用户点击后，ECHO 会把它导入到“我的主题”，之后仍可继续微调、导出或删除。

主题插件只能提供结构化主题参数，不能注入任意 CSS。颜色只接受 `#RRGGBB`，数值会被宿主夹在安全范围内，`preview` 只接受纯色或 `linear-gradient(...)` 预览。每个主题至少要提供 `light` 或 `dark` 其中一组覆盖。

每个插件最多贡献 12 个主题。`light` / `dark` 可覆盖的颜色字段包括 `appBg`、`appBg2`、`appBg3`、`panel`、`panelSoft`、`accent`、`accentStrong`、`secondary`、`heading`、`text`、`muted`、`border`、`onAccent`、`buttonText`、`titlebar`、`sidebar`、`player`、`field`、`row`、`rowHover`、`rowActive`、`chip`、`focus`、`danger`、`success`、`warning`。

可覆盖的数值字段：`panelOpacityPercent` 40-100，`glassPercent` 0-80，`shadowPercent` 0-100，`cornerRadiusPx` 0-28，`panelBlurPx` 0-32，`saturationPercent` 60-140，`motionEnabled` 布尔值，`motionSpeedSeconds` 0.12-8，`motionIntensityPercent` 0-160。

```json
{
  "id": "echo.aurora-theme",
  "name": "Aurora Theme",
  "version": "0.1.0",
  "apiVersion": 2,
  "entry": "plugin.js",
  "permissions": [],
  "contributes": {
    "themePresets": [
      {
        "id": "aurora-glass",
        "title": "Aurora Glass",
        "description": "高透明玻璃、冷色背景和暖色强调。",
        "basePreset": "classic",
        "preview": "linear-gradient(135deg, #08111f 0%, #183b56 48%, #f0b35b 100%)",
        "swatches": ["#08111f", "#183b56", "#f0b35b", "#e8f8ff"],
        "light": {
          "appBg": "#eef8ff",
          "panel": "#ffffff",
          "accent": "#257f96",
          "text": "#234150",
          "panelOpacityPercent": 78,
          "glassPercent": 26,
          "cornerRadiusPx": 10,
          "panelBlurPx": 18,
          "saturationPercent": 108
        },
        "dark": {
          "appBg": "#08111f",
          "panel": "#142234",
          "accent": "#5cc8dc",
          "text": "#c8dce8",
          "panelOpacityPercent": 72,
          "glassPercent": 34,
          "cornerRadiusPx": 10,
          "panelBlurPx": 22,
          "motionIntensityPercent": 90
        }
      }
    ]
  }
}
```

## API 版本选择

推荐直接使用 `apiVersion: 2`。

`apiVersion: 1` 的行为：

- `echo.settings.get()` 读取应用设置快照。
- `echo.settings.set(patch)` 写应用设置 patch，需要 `settings:write`，风险高。
- `echo.net` 不可用。
- 仍兼容早期示例插件。

`apiVersion: 2` 的行为：

- `echo.settings.get(key)` / `getAll()` / `set(...)` 只读写本插件自己的设置，不再写全局应用设置。
- `echo.net.fetchJson()` / `fetchText()` 可用，但必须声明并被用户信任 `network` 权限。
- 可以声明 `lyricsProviders`、`coverProviders`、`settings`。

除非你在维护旧插件，否则不要用 v1 写应用全局设置。新插件的配置应放在 `contributes.settings` 里。

## 权限设计

插件默认禁用。启用时用户必须确认 manifest 里请求的所有权限。缺少信任权限时，API 会抛出 `plugin_permission_denied:*`。

写权限时把自己当成用户：如果一个插件说“我只是显示当前播放”，却申请了 `network`、`settings:write`、`sources:provide`，用户很难放心启用。权限不是能力清单越多越专业，而是越少越可信。

推荐写法是“用到什么，申请什么，并在 README 里解释为什么”：

```md
权限说明：
- playback:read：读取当前播放状态，用来显示正在播放的歌曲。
- network：访问我配置的歌词 API，只在用户点击“查询歌词”时触发。
```

不推荐写法：

```json
"permissions": ["playback:read", "playback:control", "library:read", "settings:write", "network"]
```

除非每个权限都有明确功能，否则这种写法会让用户和维护者都很难判断风险。

| 权限 | 状态 | 风险 | 说明 |
| --- | --- | --- | --- |
| `playback:read` | 已开放 | 低 | 读取当前播放状态、曲目 id、进度、音频状态快照 |
| `playback:control` | 已开放 | 中 | 播放、暂停、停止、跳转 |
| `library:read` | 已开放 | 中 | 分页读取曲库摘要和公开曲目字段，也用于 metadata、lyrics、cover provider |
| `sources:provide` | 已开放 | 中 | 注册自定义音源搜索和播放解析 |
| `settings:read` | 已开放 | 中 | v1 读取应用设置；v2 插件设置不需要它 |
| `settings:write` | 已开放 | 高 | v1 写应用设置 patch；新插件尽量不要申请 |
| `network` | 已开放 | 高 | v2 通过宿主受控 API 访问 `http` / `https` |
| `fs:plugin` | 受限 | 中 | 不开放任意文件 API，插件存储请用 `echo.storage` |
| `library:write` | 预留 | 高 | 当前不提供实际曲库写入 API |

权限最小化建议：

- 只展示播放状态：只申请 `playback:read`。
- 控制播放：再加 `playback:control`。
- 做曲库统计、元数据、歌词、封面候选：申请 `library:read`。
- 做自定义音源：申请 `sources:provide`。
- 访问第三方 API：使用 `apiVersion: 2` 并申请 `network`。
- 不要为了“以后可能用”提前申请高风险权限。

权限改动后，要回到插件页刷新并重新确认启用。用户已经信任过的旧权限，不代表新权限会自动被信任。

## `plugin.js` 运行环境

`plugin.js` 在 Node `vm` 沙箱中运行，但不是普通 Node 脚本。

可用全局对象：

- `echo`
- `console.log` / `console.warn` / `console.error`
- `setTimeout`
- `clearTimeout`

不可用：

- `require`
- `import`
- `process`
- `window`
- `document`
- Node 文件系统、网络、数据库、Electron 模块

入口脚本同步启动阶段最多运行约 1 秒。不要在文件顶层做重 CPU 工作。网络、曲库查询、批处理都应放进命令或 provider handler 里，并保持短小。

最小入口：

```js
console.log('plugin loaded');

echo.commands.register('hello', { title: 'Hello' }, async () => {
  await echo.ui.notify('Hello from plugin');
  return { ok: true };
});
```

## 公开 API 总览

| API | 权限 | 用途 |
| --- | --- | --- |
| `echo.events.on(eventName, handler)` | 视事件而定 | 监听宿主事件 |
| `echo.commands.register(id, options, handler)` | 无固定权限 | 注册可由宿主或面板触发的命令 |
| `echo.playback.getStatus()` | `playback:read` | 获取播放状态 |
| `echo.playback.play/pause/stop/seek()` | `playback:control` | 控制播放 |
| `echo.library.getSummary()` | `library:read` | 获取曲库摘要 |
| `echo.library.getTracks(query)` | `library:read` | 分页读取公开曲目字段 |
| `echo.metadata.registerProvider(...)` | `library:read` | 返回元数据候选 |
| `echo.lyrics.registerProvider(...)` | `library:read` | 返回歌词候选 |
| `echo.covers.registerProvider(...)` | `library:read` | 返回封面候选 |
| `echo.sources.registerProvider(...)` | `sources:provide` | 返回音源候选和播放 URL |
| `echo.settings.get/getAll/set` | v2 为插件设置 | 读写插件自己的设置 |
| `echo.net.fetchJson/fetchText` | `network` + v2 | 宿主受控网络请求 |
| `echo.storage.get/set` | 无任意 FS | 读写插件自己的小型 JSON 存储 |
| `echo.ui.notify(message)` | 无固定权限 | 写插件日志通知 |

## 事件

当前开放事件：

| 事件 | 权限 | 频率与含义 |
| --- | --- | --- |
| `playback:status` | `playback:read` | 播放状态合并推送，约 500ms 节流，也就是最多约 2Hz |
| `library:changed` | `library:read` | 曲库变化信号，payload 不保证长期稳定，只当刷新信号用 |

示例：

```js
const unsubscribe = echo.events.on('playback:status', async (status) => {
  await echo.storage.set('lastStatus', {
    state: status.state,
    trackId: status.currentTrackId,
    positionSeconds: Math.round(status.positionSeconds || 0)
  });
});

echo.commands.register('stop-listening', { title: '停止监听' }, () => {
  unsubscribe();
});
```

事件 handler 最多约 2 秒，超时会记录 `plugin_event_handler_timeout`。不要在 `playback:status` 里做网络请求、全库查询或大 JSON 写入。

## 命令

命令适合用户手动触发的动作，例如“记录当前播放”“查询当前曲目”“导出一个小摘要”。

```js
echo.commands.register('copy-now-playing', { title: '记录当前播放' }, async () => {
  const status = await echo.playback.getStatus();
  await echo.storage.set('lastCommandResult', {
    trackId: status.currentTrackId,
    state: status.state,
    savedAt: new Date().toISOString()
  });
  await echo.ui.notify('已记录当前播放状态。');
  return { ok: true };
});
```

命令限制：

- 参数 JSON 最大约 64 KB。
- 返回 JSON 最大约 256 KB。
- 执行超时约 2 秒。
- 失败会写入插件日志。

如果任务超过 2 秒，应拆成多次手动命令，或只返回“已排队”的轻量结果。当前插件系统不适合做长驻后台任务。

## 播放状态与播放控制

读取状态：

```js
const status = await echo.playback.getStatus();
console.log(status.state, status.currentTrackId, status.positionSeconds);
```

控制播放：

```js
await echo.playback.pause();
await echo.playback.seek(60);
await echo.playback.play();
```

播放控制是中风险能力。插件不要自动根据高频事件连续 `seek()` 或 `play/pause()`，否则会破坏用户操作和播放稳定性。

## 曲库读取

曲库 API 永远要分页。

```js
const page = await echo.library.getTracks({
  page: 1,
  pageSize: 50,
  search: 'artist or title',
  sort: 'recent',
  sourceProvider: 'local',
  fields: ['id', 'title', 'artist', 'album', 'duration', 'coverThumb']
});
```

限制：

- `pageSize` 最大 100，默认 50。
- `search` 最大约 120 字符。
- 默认字段：`id`、`mediaType`、`path`、`title`、`artist`、`album`、`duration`、`coverThumb`、`unavailable`。
- 可选字段以 `docs/plugin-sdk/echo-plugin.d.ts` 和 `src/shared/types/plugins.ts` 为准。

分页批处理建议：

```js
echo.commands.register('count-missing-album', { title: '统计缺少专辑的曲目' }, async () => {
  let page = 1;
  let missing = 0;

  while (page <= 20) {
    const result = await echo.library.getTracks({
      page,
      pageSize: 100,
      fields: ['id', 'title', 'album']
    });

    missing += result.items.filter((track) => !track.album).length;
    if (!result.hasMore) break;
    page += 1;

    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  await echo.ui.notify(`前 ${page} 页里有 ${missing} 首缺少专辑。`);
  return { missing, scannedPages: page };
});
```

不要一次拉完整曲库。大型曲库会跨进程传输大量 JSON，影响 UI 和播放响应。

## 元数据 Provider

Metadata Provider 返回候选标签，不直接写曲库。宿主会裁剪字段、展示候选，并由用户决定是否采用。

Manifest：

```json
{
  "permissions": ["library:read"],
  "contributes": {
    "metadataProviders": [
      { "id": "tags", "title": "标签候选" }
    ]
  }
}
```

`plugin.js`：

```js
echo.metadata.registerProvider('tags', { title: '标签候选' }, async ({ track }) => {
  if (!track.title || !track.artist) {
    return { candidates: [] };
  }

  return {
    candidates: [
      {
        title: track.title,
        artist: track.artist,
        album: track.album,
        genre: 'Alternative',
        year: 2026,
        confidence: 0.8,
        source: 'My Plugin',
        sourceUrl: 'https://example.com'
      }
    ]
  };
});
```

候选字段：

- `title`
- `artist`
- `album`
- `albumArtist`
- `genre`
- `year`
- `trackNo`
- `discNo`
- `bpm`
- `confidence`，范围 0 到 1
- `source`
- `sourceUrl`

限制：

- 单插件最多 8 个 metadata provider。
- 单 provider 每次最多 5 个候选。
- 请求最大约 32 KB，返回最大约 64 KB。
- provider 超时约 2.5 秒。
- 不返回二进制封面，不写文件，不写 SQLite。

## 歌词 Provider

歌词 Provider 返回歌词候选，宿主决定是否预览、应用或缓存。

Manifest：

```json
{
  "apiVersion": 2,
  "permissions": ["library:read"],
  "contributes": {
    "lyricsProviders": [
      { "id": "lyrics", "title": "歌词候选" }
    ]
  }
}
```

`plugin.js`：

```js
echo.lyrics.registerProvider('lyrics', { title: '歌词候选' }, async ({ track }) => {
  if (!track.title) {
    return { candidates: [] };
  }

  return {
    candidates: [
      {
        title: track.title,
        language: 'zh',
        lrc: '[00:00.00]示例歌词',
        source: 'My Lyrics Provider',
        confidence: 0.7
      }
    ]
  };
});
```

候选字段：

- `title`
- `language`
- `lrc`
- `text`
- `source`
- `sourceUrl`
- `confidence`

限制：

- 单插件最多 4 个 lyrics provider。
- 单 provider 每次最多 5 个候选。
- `lrc` / `text` 会被裁剪到约 80 KB。
- 请求最大约 32 KB，返回最大约 128 KB。
- provider 超时约 2.5 秒。

## 封面 Provider

Cover Provider 返回图片 URL 候选。候选必须是 `http` / `https` 图片 URL，宿主负责后续缓存、裁剪、写库决策。

Manifest：

```json
{
  "apiVersion": 2,
  "permissions": ["library:read"],
  "contributes": {
    "coverProviders": [
      { "id": "covers", "title": "封面候选" }
    ]
  }
}
```

`plugin.js`：

```js
echo.covers.registerProvider('covers', { title: '封面候选' }, async ({ track }) => {
  if (!track.album && !track.title) {
    return { candidates: [] };
  }

  return {
    candidates: [
      {
        imageUrl: 'https://example.com/cover.jpg',
        title: track.album || track.title,
        source: 'My Cover Provider',
        width: 1200,
        height: 1200,
        confidence: 0.75
      }
    ]
  };
});
```

限制：

- 单插件最多 4 个 cover provider。
- 单 provider 每次最多 8 个候选。
- `imageUrl` 必须是 `http` / `https`。
- 请求最大约 32 KB，返回最大约 128 KB。
- provider 超时约 2.5 秒。

## 自定义音源 Provider

Source Provider 用于“插件音源”。它只返回搜索候选，并在用户触发播放时解析成显式音频 URL。

它不是远程库同步 provider，也不能写入远程曲库、DSP、解码器或输出链路。Source Provider 也不是下载接口、破解接口或官方音源背书；插件作者必须确认返回的候选和播放 URL 合法可访问，相关法律责任由插件作者、使用者或服务提供方自行承担。

Manifest：

```json
{
  "apiVersion": 2,
  "permissions": ["sources:provide"],
  "contributes": {
    "sourceProviders": [
      { "id": "direct-url", "title": "Direct URL Demo" }
    ]
  }
}
```

`plugin.js`：

```js
const demoTracks = [
  {
    providerTrackId: 'demo-stream',
    title: 'Demo stream',
    artist: 'Local plugin',
    album: 'Custom source',
    duration: null,
    playable: true,
    source: 'Direct URL Demo',
    url: 'https://example.com/audio/demo.mp3'
  }
];

echo.sources.registerProvider('direct-url', { title: 'Direct URL Demo' }, {
  search: async ({ query }) => {
    const needle = String(query || '').toLowerCase();
    return {
      tracks: demoTracks
        .filter((track) => !needle || `${track.title} ${track.artist}`.toLowerCase().includes(needle))
        .map(({ url, ...track }) => track),
      total: demoTracks.length,
      hasMore: false
    };
  },
  resolvePlayback: async ({ providerTrackId }) => {
    const track = demoTracks.find((item) => item.providerTrackId === providerTrackId);
    if (!track) {
      throw new Error('plugin_source_track_not_found');
    }
    return {
      url: track.url,
      mimeType: 'audio/mpeg',
      supportsRange: true
    };
  }
});
```

搜索候选字段：

- `providerTrackId`，必填
- `title`，必填
- `artist`
- `album`
- `albumArtist`
- `duration`
- `coverUrl`
- `webUrl`
- `playable`
- `unavailableReason`
- `source`

播放解析字段：

- `url`，必填，必须是 `http` / `https`
- `expiresAt`
- `mimeType`
- `bitrate`
- `sampleRate`
- `bitDepth`
- `codec`
- `headers`
- `requiresProxy`
- `supportsRange`

限制：

- 单插件最多 4 个 source provider。
- 单 provider 每次最多 25 个搜索候选。
- 搜索请求最大约 32 KB，搜索返回最大约 128 KB。
- 播放解析请求最大约 16 KB，播放解析返回最大约 32 KB。
- provider 超时约 2.5 秒。
- `resolvePlayback` 只应在用户真的要播放时做必要解析，不要在 `search` 里预拉所有播放 URL。

## 插件设置

v2 插件设置由 manifest 声明，宿主在插件详情页渲染表单，并保存到 `plugin-settings.json`。

支持类型：

- `string`
- `select`
- `boolean`
- `number`
- `secret`

示例：

```json
{
  "contributes": {
    "settings": [
      {
        "id": "base-url",
        "title": "API URL",
        "description": "第三方 API 地址",
        "type": "string",
        "defaultValue": "https://example.com"
      },
      {
        "id": "quality",
        "title": "Quality",
        "type": "select",
        "defaultValue": "high",
        "options": [
          { "label": "High", "value": "high" },
          { "label": "Low", "value": "low" }
        ]
      },
      {
        "id": "enabled",
        "title": "Enabled",
        "type": "boolean",
        "defaultValue": false
      },
      {
        "id": "limit",
        "title": "Limit",
        "type": "number",
        "defaultValue": 5,
        "min": 1,
        "max": 25
      },
      {
        "id": "api-key",
        "title": "API Key",
        "type": "secret"
      }
    ]
  }
}
```

读取设置：

```js
const baseUrl = await echo.settings.get('base-url');
const allSettings = await echo.settings.getAll();
```

写入设置：

```js
await echo.settings.set('enabled', true);
await echo.settings.set({ limit: 10 });
```

注意：

- v2 设置是插件自己的命名空间，不写应用全局 settings。
- 宿主会按 manifest 过滤和裁剪设置值。
- `secret` 只是 UI 上用密码框显示，当前不是系统凭据保险箱。不要保存高价值长期密钥。
- 单个设置 patch 最大约 32 KB。
- 插件设置总量最大约 128 KB。
- 插件包导出不包含 `plugin-settings.json`。

## 网络访问

网络访问只在 `apiVersion: 2` 生效，并且必须申请 `network` 权限。

Manifest：

```json
{
  "apiVersion": 2,
  "permissions": ["network"]
}
```

请求 JSON：

```js
const data = await echo.net.fetchJson({
  url: 'https://example.com/api/search?q=test',
  method: 'GET',
  headers: {
    accept: 'application/json'
  },
  timeoutMs: 3000
});
```

请求文本：

```js
const text = await echo.net.fetchText('https://example.com/lyrics.txt');
```

限制：

- 只允许 `http` / `https` URL。
- 只允许 `GET` / `POST`。
- 请求 JSON 最大约 64 KB。
- 响应最大约 512 KB。
- 默认和最大超时约 5 秒。
- 允许的请求 header：`accept`、`accept-language`、`content-type`、`user-agent`。
- `authorization`、`cookie`、`set-cookie`、`x-api-key`、`x-auth-token` 等敏感 header 会被过滤。
- 非 2xx 响应会抛出 `plugin_network_http_<status>`。

网络 provider 编写建议：

- 把网络请求放到用户触发的命令或 provider handler 中。
- 对同一首歌的结果做插件 storage 缓存，但控制大小。
- 不要在 `playback:status` 事件里请求网络。
- 不要用短间隔轮询。
- 对失败返回空候选，并写清楚日志。

## 插件存储

`echo.storage` 用于保存插件自己的小型 JSON 数据。

```js
await echo.storage.set('lastLookup', {
  title: 'Song',
  savedAt: new Date().toISOString()
});

const lastLookup = await echo.storage.get('lastLookup');
```

限制：

- key 最大约 96 字符。
- 单个 value 最大约 64 KB。
- 单插件 storage 总量最大约 256 KB。
- 存储文件是 `plugin-storage.json`。
- 插件包导出不包含 storage。

storage 适合保存缓存索引、上次操作状态、小型配置。不要保存整页曲库、图片二进制、歌词大集合或长日志。

## 面板 `panel.html`

面板作为 sandbox iframe 运行。它不接触主应用 DOM，也不能直接访问 `plugin.js` 里的 `echo` 对象。

面板要和宿主交互，只能通过受控 `postMessage` bridge：

```js
parent.postMessage({
  channel: 'echo:plugin-panel',
  version: 1,
  type: 'request',
  requestId: 'request-1',
  pluginId: 'echo.my-plugin',
  action: 'plugin:getSummary'
}, '*');
```

响应：

```js
window.addEventListener('message', (event) => {
  const message = event.data;
  if (message?.channel !== 'echo:plugin-panel' || message.type !== 'response') {
    return;
  }
  if (message.ok) {
    console.log(message.result);
  } else {
    console.error(message.error);
  }
});
```

当前 panel action：

| action | payload | 作用 |
| --- | --- | --- |
| `plugin:getSummary` | 无 | 返回当前插件摘要、权限、活动、安全信息 |
| `plugin:getLogs` | 无 | 返回当前插件日志 |
| `plugin:runCommand` | `{ "commandId": "...", "args": [] }` | 执行当前插件命令 |

面板想做有权限的事，应在 `plugin.js` 里注册命令，再由面板触发 `plugin:runCommand`。不要假设面板可以直接读曲库或控制播放。

最小面板：

```html
<!doctype html>
<meta charset="utf-8">
<button id="refresh">刷新</button>
<pre id="output">等待中...</pre>
<script>
const pluginId = 'echo.my-plugin';
const channel = 'echo:plugin-panel';
const pending = new Map();
const output = document.getElementById('output');

window.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || message.channel !== channel || message.type !== 'response') return;
  const resolve = pending.get(message.requestId);
  if (!resolve) return;
  pending.delete(message.requestId);
  resolve(message);
});

function requestHost(action, payload) {
  return new Promise((resolve) => {
    const requestId = `${Date.now()}-${Math.random()}`;
    pending.set(requestId, resolve);
    parent.postMessage({ channel, version: 1, type: 'request', requestId, pluginId, action, payload }, '*');
  });
}

document.getElementById('refresh').addEventListener('click', async () => {
  output.textContent = JSON.stringify(await requestHost('plugin:getSummary'), null, 2);
});
</script>
```

## 导入、导出与发布

插件页可以导出 `.json` 插件包。包结构：

```json
{
  "type": "echo-next-plugin-package",
  "version": 1,
  "exportedAt": "2026-05-29T00:00:00.000Z",
  "manifest": {},
  "files": [
    {
      "path": "plugin.js",
      "content": "..."
    }
  ]
}
```

导出规则：

- 包最大约 2 MB。
- 最多 32 个文件。
- 单文件最大约 512 KB。
- 只导出插件根目录文件，不递归子目录。
- 排除 `plugin-state.json`、`plugin-storage.json`、`plugin-settings.json`。
- 排除 `.echo-plugin.json` 包文件，避免递归打包。

导入规则：

- 必须是 `type: "echo-next-plugin-package"` 和 `version: 1`。
- 目标插件 id 已存在时，普通 UI 导入会拒绝覆盖。
- 导入后默认禁用，需要用户确认权限再启用。
- 宿主记录来源、导入时间、包版本和 checksum。

发布前清单：

- `echo.plugin.json` 使用 `apiVersion: 2`，除非维护旧插件。
- 权限最小化。
- README 写清用途、权限原因、第三方服务边界。
- README 写清“安装到哪里、怎么启用、怎么重载、怎么卸载”。
- 不包含个人 token、cookie、运行缓存。
- 不依赖本机绝对路径。
- 不使用高频轮询。
- 大数据都分页。
- 错误路径有清晰日志。
- 在播放音乐时试一次插件主流程，确认没有明显卡顿。
- 导出包后用另一个空插件目录导入一次，确认没有漏文件。

发布包里不要承诺 ECHO 没开放的能力。比如“直接改源音频文件”“自动写曲库”“注入播放器 UI”“接管 DSP 链路”都不是普通插件能力。

## 调试

插件页会显示：

- manifest 解析错误。
- 启用状态。
- 权限风险。
- 面板 sandbox 状态。
- 命令/provider 数量。
- 活动摘要，例如命令次数、事件次数、网络次数、storage 写入次数、错误次数。
- 插件日志。

`console.log` / `console.warn` / `console.error` 会进入插件日志：

```js
console.log('lookup started');
console.warn('provider returned no result');
console.error('lookup failed', error.message);
```

常用排查顺序：

1. manifest 是否能被插件页识别。
2. 插件是否已启用，权限是否全部确认。
3. `plugin.js` 顶层是否抛错。
4. 命令是否注册，id 是否一致。
5. provider 是否申请了正确权限。
6. 返回 JSON 是否超出大小限制。
7. 网络是否缺少 `network` 权限或被 header 限制挡住。
8. 面板 `pluginId`、`channel`、`requestId` 是否正确。

排错时别一次改很多地方。先把 `plugin.js` 改成只输出一行日志，再确认启用；再注册一个只返回 `{ ok: true }` 的命令；最后才把真实逻辑加回来。这样最快，也最不容易把一个小 typo 误判成系统问题。

连续启动失败保护：

- 10 分钟内连续 3 次启动失败，宿主会自动禁用插件。
- 日志里会出现 `plugin_disabled_after_repeated_errors`。
- 修复文件后，可以手动重新启用。

## 性能与播放安全

ECHO 是播放器，插件必须默认把播放体验放在第一位。

必须遵守：

- 不在顶层做重 CPU 工作。
- 不在 `playback:status` 里做网络请求、全库查询或大写入。
- 不高频调用 `seek()`、`play()`、`pause()`。
- 曲库读取永远分页。
- Provider handler 保持 2.5 秒内完成。
- 网络超时设置短一点，失败返回空候选。
- 大任务拆成手动命令，不要自启动后台扫库。
- storage 只保存小型 JSON。
- source provider 的 `search` 只返回候选，`resolvePlayback` 只在播放时解析。
- 对第三方 API 失败、限流、空结果保持安静，不弹出连续噪声。

推荐模式：

```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scanSomePages(maxPages) {
  for (let page = 1; page <= maxPages; page += 1) {
    const result = await echo.library.getTracks({ page, pageSize: 100 });
    // do small work
    if (!result.hasMore) break;
    await sleep(0);
  }
}
```

不推荐模式：

```js
// 不要这样：事件太高频，还叠加曲库和网络。
echo.events.on('playback:status', async () => {
  const tracks = await echo.library.getTracks({ pageSize: 100 });
  await echo.net.fetchJson('https://example.com/update');
  await echo.storage.set('huge', tracks);
});
```

## 常见错误码

| 错误码 | 含义与处理 |
| --- | --- |
| `plugin_permission_confirmation_required` | 启用时没有确认全部请求权限 |
| `plugin_permission_denied:*` | 调用了未被信任的能力 |
| `plugin_manifest_invalid` | manifest 解析失败 |
| `apiVersion must be between 1 and 2` | API 版本不兼容当前宿主 |
| `plugin_not_enabled` | 插件未启用或已被宿主禁用 |
| `plugin_command_not_found` | 命令未注册或 id 写错 |
| `plugin_command_timeout` | 命令超过约 2 秒 |
| `plugin_command_args_too_large` | 命令参数超过约 64 KB |
| `plugin_command_result_too_large` | 命令返回超过约 256 KB |
| `plugin_event_not_supported:*` | 监听了未开放事件 |
| `plugin_event_handler_limit` | 同插件事件 handler 太多 |
| `plugin_event_handler_timeout` | 异步事件 handler 超过约 2 秒 |
| `plugin_metadata_provider_invalid` | metadata provider 注册参数不合法 |
| `plugin_metadata_provider_limit` | metadata provider 超过 8 个 |
| `plugin_metadata_provider_timeout` | metadata provider 超过约 2.5 秒 |
| `plugin_metadata_request_too_large` | metadata 请求超过约 32 KB |
| `plugin_metadata_result_too_large` | metadata 返回超过约 64 KB |
| `plugin_lyrics_provider_invalid` | lyrics provider 注册参数不合法 |
| `plugin_lyrics_provider_limit` | lyrics provider 超过 4 个 |
| `plugin_lyrics_provider_timeout` | lyrics provider 超过约 2.5 秒 |
| `plugin_cover_provider_invalid` | cover provider 注册参数不合法 |
| `plugin_cover_provider_limit` | cover provider 超过 4 个 |
| `plugin_cover_provider_timeout` | cover provider 超过约 2.5 秒 |
| `plugin_source_provider_invalid` | source provider 注册参数不合法 |
| `plugin_source_provider_limit` | source provider 超过 4 个 |
| `plugin_source_provider_timeout` | source provider 超过约 2.5 秒 |
| `plugin_source_provider_not_playable` | source provider 没有 `resolvePlayback` |
| `plugin_source_playback_url_invalid` | 播放 URL 不是合法 `http` / `https` |
| `plugin_source_search_request_too_large` | source 搜索请求超过约 32 KB |
| `plugin_source_search_result_too_large` | source 搜索返回超过约 128 KB |
| `plugin_source_playback_request_too_large` | source 播放解析请求超过约 16 KB |
| `plugin_source_playback_result_too_large` | source 播放解析返回超过约 32 KB |
| `plugin_storage_value_too_large` | 单个 storage value 超过约 64 KB |
| `plugin_storage_quota_exceeded` | 插件 storage 总量超过约 256 KB |
| `plugin_settings_patch_too_large` | 设置 patch 超过约 32 KB |
| `plugin_setting_value_too_large` | 插件设置单次写入过大 |
| `plugin_settings_quota_exceeded` | 插件设置总量超过约 128 KB |
| `plugin_network_requires_api_v2` | v1 插件调用了网络 API |
| `plugin_network_url_invalid` | 网络 URL 不合法 |
| `plugin_network_method_not_allowed` | 网络方法不是 `GET` / `POST` |
| `plugin_network_request_too_large` | 网络请求超过约 64 KB |
| `plugin_network_response_too_large` | 网络响应超过约 512 KB |
| `plugin_network_http_<status>` | 第三方服务返回非 2xx |
| `plugin_package_invalid` | 导入文件不是 ECHO 插件包 |
| `plugin_package_too_large` | 插件包超过约 2 MB |
| `plugin_package_file_limit_exceeded` | 插件包文件超过 32 个 |
| `plugin_package_file_too_large` | 单个包文件超过约 512 KB |
| `plugin_import_target_exists` | 目标插件 id 已存在，普通导入拒绝覆盖 |
| `plugin_disabled_after_repeated_errors` | 插件连续启动失败，被宿主自动隔离 |

## 完整示例：网络元数据候选插件

`echo.plugin.json`：

```json
{
  "id": "echo.demo-metadata",
  "name": "Demo Metadata",
  "version": "0.1.0",
  "apiVersion": 2,
  "entry": "plugin.js",
  "panel": "panel.html",
  "permissions": ["library:read", "network"],
  "contributes": {
    "commands": [
      { "id": "test-lookup", "title": "测试查询" }
    ],
    "metadataProviders": [
      { "id": "tags", "title": "Demo 标签候选" }
    ],
    "settings": [
      {
        "id": "base-url",
        "title": "API URL",
        "type": "string",
        "defaultValue": "https://example.com"
      }
    ],
    "panels": [
      { "id": "main", "title": "Demo Metadata", "path": "panel.html" }
    ]
  }
}
```

`plugin.js`：

```js
async function lookup(track) {
  const baseUrl = await echo.settings.get('base-url');
  if (!baseUrl || !track.title) {
    return [];
  }

  try {
    const url = `${String(baseUrl).replace(/\/$/, '')}/search?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist || '')}`;
    const data = await echo.net.fetchJson({
      url,
      headers: { accept: 'application/json' },
      timeoutMs: 3000
    });

    if (!Array.isArray(data?.items)) {
      return [];
    }

    return data.items.slice(0, 3).map((item) => ({
      title: item.title || track.title,
      artist: item.artist || track.artist,
      album: item.album,
      genre: item.genre,
      year: Number(item.year) || undefined,
      confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0.5)),
      source: 'Demo Metadata',
      sourceUrl: item.url
    }));
  } catch (error) {
    console.warn('lookup failed', error.message);
    return [];
  }
}

echo.metadata.registerProvider('tags', { title: 'Demo 标签候选' }, async ({ track }) => ({
  candidates: await lookup(track)
}));

echo.commands.register('test-lookup', { title: '测试查询' }, async () => {
  const page = await echo.library.getTracks({
    page: 1,
    pageSize: 1,
    sort: 'recent',
    fields: ['id', 'title', 'artist', 'album']
  });

  const track = page.items[0];
  if (!track) {
    await echo.ui.notify('曲库为空。');
    return { candidates: [] };
  }

  const candidates = await lookup(track);
  await echo.ui.notify(`找到 ${candidates.length} 个候选。`);
  return { track, candidates };
});
```

`panel.html`：

```html
<!doctype html>
<meta charset="utf-8">
<style>
  body { font: 14px system-ui; margin: 16px; color: #1f2937; }
  button { padding: 6px 10px; }
  pre { white-space: pre-wrap; border: 1px solid #d1d5db; padding: 12px; }
</style>
<button id="run">测试查询</button>
<pre id="output">等待操作...</pre>
<script>
const pluginId = 'echo.demo-metadata';
const channel = 'echo:plugin-panel';
const pending = new Map();
const output = document.getElementById('output');

window.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || message.channel !== channel || message.type !== 'response') return;
  const resolve = pending.get(message.requestId);
  if (!resolve) return;
  pending.delete(message.requestId);
  resolve(message);
});

function requestHost(action, payload) {
  return new Promise((resolve) => {
    const requestId = `${Date.now()}-${Math.random()}`;
    pending.set(requestId, resolve);
    parent.postMessage({ channel, version: 1, type: 'request', requestId, pluginId, action, payload }, '*');
  });
}

document.getElementById('run').addEventListener('click', async () => {
  const response = await requestHost('plugin:runCommand', { commandId: 'test-lookup' });
  output.textContent = JSON.stringify(response, null, 2);
});
</script>
```

## 作者检查清单

写插件前：

- 明确插件是命令、provider、面板，还是三者组合。
- 列出必须权限，删掉“可能用得上”的权限。
- 判断是否需要 `network`。如果需要，使用 `apiVersion: 2`。
- 判断是否真的需要面板。简单工具优先做命令。

写插件时：

- 顶层只注册 handler，不做重工作。
- 所有曲库操作分页。
- 所有网络请求有短超时。
- 所有 provider 返回候选，不直接写库。
- 所有错误都能返回空结果或清晰日志。
- 不把 token、cookie、用户缓存打进发布包。

发布前：

- 新装导入后默认禁用是正常行为。
- 启用权限说明能让用户看懂。
- 插件连续启动失败不会让主程序坏掉。
- 导出包里没有 `plugin-storage.json`、`plugin-settings.json`、`plugin-state.json`。
- 在播放音乐时试一次插件主流程，确认没有明显卡顿。

## 源码参考

主要契约位置：

- `src/shared/types/plugins.ts`
- `docs/plugin-sdk/echo-plugin.d.ts`
- `src/main/plugins/PluginManifest.ts`
- `src/main/plugins/PluginService.ts`
- `src/main/ipc/pluginIpc.ts`
- `src/renderer/pages/PluginsPage.tsx`

如果文档和代码不一致，以这些源码文件为准。

---

# Quick Navigation

Source: src/content/docs/en/docs/quick-navigation.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/quick-navigation/
Description: Find the right ECHO Next documentation page by task or symptom.

Use this page when you already know what you are trying to do. Pick the closest goal first instead of reading the whole docs tree from the top.

## By Goal

| What you want to do | Start here |
| --- | --- |
| Download, install, and open ECHO for the first time | [Beginner Setup](../zero-basics/) |
| Verify playback as quickly as possible | [Quick Start](../quick-start/) |
| Decide between local files, remote libraries, and plugin sources | [Import Audio Sources](../import-audio-sources/) |
| Import local folders, organize albums, and fix tags | [Library](../library/) |
| Import NetEase Cloud Music, QQ Music, Spotify, or other playlists | [Playlist Import](../playlist-import/) |
| Connect WebDAV, NAS, Jellyfin, Emby, or Subsonic | [Remote Sources](../remote-sources/) and [Cloud Drive / Subsonic Guide](../cloud-drive/) |
| Play internet radio | [Internet Radio](../internet-radio/) |
| Stream to a network player, amplifier, TV, or renderer | [DLNA / Network Streamer](../dlna-connect/) |
| Check what AirPlay support means | [AirPlay Support Boundaries](../airplay-connect/) |
| Configure output devices, WASAPI, ASIO, exclusive mode, or DSD | [Audio Output](../audio-output/) |
| Understand EQ, DSP, clipping, and headroom | [EQ Guide](../audio-output/eq/) and [DSP Beginner Guide](../audio-output/dsp-beginner/) |
| Configure HQPlayer | [HQPlayer Guide](../audio-output/hqplayer/) |
| Check USB DAC drivers, third-party drivers, or ASIO4ALL boundaries | [USB DAC Drivers](../audio-output/usb-dac-drivers/) and [Third-Party Driver Boundaries](../audio-output/third-party-drivers/) |
| Set up lyrics, MV, translation, or romanization | [Lyrics And MV](../lyrics-and-mv/) |
| Install or author plugins | [Plugin Authoring Guide](../plugins/) |
| Build or generate themes | [AI Theme Guide](../theme-ai-guide/) |
| Buy, activate, or unbind ECHO Pro | [ECHO Pro](../echo-pro/) |
| Check download, plugin-source, copyright, and legal boundaries | [Download And Plugin Source Boundaries](../download-and-plugin-source-boundary/) |
| Report a bug or ask for troubleshooting help | [Troubleshooting](../troubleshooting/) |
| Read common answers | [FAQ](../faq/) |
| Read engineering structure, tech stack, and development rules | [Engineering Docs](../engineering/) |

## By Symptom

| Problem | Recommended page |
| --- | --- |
| No sound, crackling, half-speed playback, or track-skip failures | [Audio Output](../audio-output/) and [Troubleshooting](../troubleshooting/) |
| Songs do not appear after import, covers are wrong, or albums are grouped badly | [Library](../library/) |
| You are unsure about the boundary between audio sources and music downloading | [Import Audio Sources](../import-audio-sources/) and [Download And Plugin Source Boundaries](../download-and-plugin-source-boundary/) |
| Remote library connects poorly, browses but cannot play, or syncs slowly | [Remote Sources](../remote-sources/) |
| WebDAV, Navidrome, or Subsonic setup is unclear | [Cloud Drive / Subsonic Guide](../cloud-drive/) |
| Online search only gives previews or is limited by membership or region | [User Guide](../user-guide/) |
| You do not know how to describe a problem clearly | [AI Question Guide](../ai-question-guide/) and [Troubleshooting](../troubleshooting/) |

## Safest Reading Order

If you are completely new, read in this order:

1. [Beginner Setup](../zero-basics/)
2. [Quick Start](../quick-start/)
3. [Import Audio Sources](../import-audio-sources/)
4. [User Guide](../user-guide/)
5. [Audio Output](../audio-output/)
6. [Troubleshooting](../troubleshooting/)

Get download, import, and playback working first. Then move on to advanced output, remote sources, plugins, and themes.

---

# Quick Start

Source: src/content/docs/en/docs/quick-start.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/quick-start/
Description: Recommended first-run flow.

Start with a small music folder, verify playback and metadata, then enable advanced output or larger scans gradually.

Windows is the main supported platform. The mobile version is being worked on, but there is no public date until it can be validated properly.

Linux keeps a basic build and playback boundary; build and validate it yourself from the [Linux Build Guide](./engineering/linux-build/). Linux issues without clear reproduction, logs, and a low-risk fix path may not be prioritized.

macOS has no official package and no maintenance promise because there is no stable macOS development, signing, and validation environment for ECHO right now.

If you are not sure whether you should import a local folder, add a remote library, or enable a plugin source, read [Import Audio Sources](./import-audio-sources/) first.

---

# Remote and Online Sources

Source: src/content/docs/en/docs/remote-sources.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/remote-sources/
Description: Remote files, online metadata, and compliance boundaries.

Remote and online sources extend ECHO. They are not a replacement for your local library. Keep a clear difference between remote file browsing, metadata completion, streaming from your own services, and third-party user-provided sources.

## DMCA And Copyright

ECHO strictly follows the DMCA and applicable copyright laws. ECHO officially provides no music download service and no functionality for obtaining music content. It does not host, distribute, sell, or mirror copyrighted audio content, and it does not provide tools to bypass copyright protection, paid access, or access controls.

Any WebDAV, NAS, Jellyfin, Emby, Subsonic, cloud drive, proxy, plugin, or third-party source you connect must be used only for content you are allowed to access and use. Users are responsible for the legality of their sources, accounts, and network access.

If a third-party source, plugin, script, or user-provided URL involves infringing content, it is not official ECHO behavior and is outside ECHO support. Legal responsibility for third-party sources belongs to the integrator, user, plugin author, or service provider. The ECHO project and maintainers do not accept legal responsibility for those sources.

## Capability Boundaries

Different sources provide different capabilities:

| Type | Purpose | Boundary |
| --- | --- | --- |
| WebDAV / NAS | Browse and play files from your own server | Speed depends on server, network, and authentication setup |
| Jellyfin / Emby | Browse media libraries, read metadata, and play authorized content | Folder hierarchy and transcoding are controlled by the server |
| Subsonic / Navidrome | Access your personal music service | Requires your own service and account |
| Online metadata | Complete title, artist, album, artwork, and lyrics candidates | Candidate or weak completion only; should not overwrite high-confidence local data |
| Plugins | Extend connections or automation | Plugin behavior is limited by permissions and source trust |

The official ECHO docs will not instruct users to obtain infringing content and will not promise support for third-party services that cannot be publicly verified.

Read [Download And Plugin Source Boundaries](/en/docs/download-and-plugin-source-boundary/) for the complete statement.

ECHO will not add a Kugou Music source. If Kugou appears in docs or settings, it usually refers to lyrics, metadata candidates, or compatibility boundaries. It does not mean ECHO will provide a Kugou playback source, download source, or platform-content integration.

For public internet radio streams, read the [Internet Radio guide](/en/docs/internet-radio/). To cast the current ECHO track to a network streamer, receiver, TV, or other DLNA / UPnP renderer, read the [DLNA / Network Streamer guide](/en/docs/dlna-connect/).

## Remote Source Workflow

For a new remote source:

1. Test the account, URL, port, and certificate.
2. Browse the root or one small folder first.
3. Play one normal audio file.
4. Enable indexing, artwork, lyrics, or background sync afterward.
5. Expand to the full directory only after the small check works.

Do not start with a full index of an entire NAS or media server. Slow sync, slow artwork loading, and waiting on some files are normal for large remote folders.

## Online Metadata

Online metadata is useful for filling gaps such as artwork, lyrics candidates, artist names, album titles, or years. It should not replace local tag truth:

- Manual edits take priority over online results.
- Embedded tags take priority over online results.
- Same-folder artwork takes priority over online artwork.
- Online results should be previewable, reversible, and applied in small batches.

Before applying online metadata in bulk, test it on a small set of tracks.

## Network And Proxy

Remote-source problems often come from the network environment:

- Home NAS setups can be affected by LAN routing, DDNS, port forwarding, and certificates.
- Campus and corporate networks may restrict WebDAV, media servers, or proxies.
- Proxies can affect online metadata, artwork, and lyrics access.
- Server transcoding, rate limits, or sleep state can affect playback stability.

When reporting a remote-source issue, include screenshots of the connection state, folder page, error text, and sync progress. Also include the service type, server version, network environment, and whether a proxy is enabled.

## Unsupported Scope

ECHO official support does not cover:

- Infringing, pirated, paid-access-bypass, or access-control-bypass sources.
- Third-party download sites, resource indexes, scripts, crawlers, or gray-market plugins.
- User-modified servers, private APIs, expired APIs, or sources that require packet-capture reverse engineering.
- Requests for ECHO to help find, obtain, or download copyrighted content.
- Requests that treat ECHO plugin interfaces as official endorsement, official sources, or a way to transfer legal responsibility.
- Kugou Music playback-source, download-source, or platform-content integration requests.

ECHO can help you manage and play content you are allowed to use. It does not provide download services and will not help bypass copyright or platform rules.

---

# Settings Guide

Source: src/content/docs/en/docs/settings.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/settings/
Description: A user-facing guide to ECHO NEXT settings.

The full settings walkthrough is currently maintained in Simplified Chinese because ECHO NEXT's most detailed settings UI copy is Chinese-first.

Open the Chinese page for the complete per-setting guide: `/zh/docs/settings/`.

This page exists so the shared documentation sidebar remains valid for the English locale.

---

# spotify-oauth

Source: src/content/docs/en/docs/spotify-oauth.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/spotify-oauth/

---
title: "Spotify OAuth Setup"
description: "Spotify app setup, redirect URI, development mode, and common OAuth fixes."
sidebar:
  order: 32
  label: "Spotify OAuth"
---

ECHO 不内置公共 Spotify Client ID。每个用户需要准备自己的 Spotify Developer App，然后把 Client ID 填到 ECHO。

## 需要准备

- Spotify Premium 账号。
- 可访问 Spotify Developer Dashboard。
- 只需要 Client ID，不要填写、保存或分享 Client Secret。
- ECHO 设置页显示的 Redirect URI，默认是：

```text
http://127.0.0.1:43879/spotify/callback
```

## 创建 Spotify App

1. 打开 <https://developer.spotify.com/dashboard>。
2. 登录你的 Spotify 账号。
3. 创建一个 App。
4. 在 App 的 Settings 里找到 Client ID。
5. 在 Redirect URIs 里添加 ECHO 显示的 Redirect URI。
6. 保存设置。

## 在 ECHO 里填写

1. 打开 ECHO 设置。
2. 进入 `集成`。
3. 找到 `Spotify OAuth 配置`。
4. 填入 Spotify Dashboard 里的 `Client ID`。
5. `Redirect URI` 保持和 Spotify Dashboard 里注册的一致。
6. 点击 `保存 Spotify 配置`。
7. 回到 Spotify 账号卡片，点击登录。

登录会打开系统默认浏览器。如果浏览器里已经登录 Spotify，通常不需要再输入密码。

## Development Mode 限制

新建 Spotify App 通常处于 Development Mode。这个模式有几个限制：

- App 拥有者需要 Premium。
- 只有被加入该 App 用户名单的 Spotify 账号可以正常使用 API。
- 未加入用户名单时，用户可能能完成登录，但后续请求会失败，常见错误是 `The user is not registered for this application`。

如果只是自己使用，创建自己的 App 后用自己的账号登录即可。  
如果要给少量测试用户使用，需要在 Spotify Dashboard 的 Users Management 里添加他们的 Spotify 邮箱。  
如果要公开给大量用户，需要申请 Spotify Extended Quota。

## 常见问题

### The user is not registered for this application

当前登录的 Spotify 账号没有被加入这个 Client ID 对应 App 的用户名单。

处理方式：

- 用自己的 Spotify App Client ID 登录。
- 或让 App 拥有者在 Spotify Dashboard > Users Management 添加你的 Spotify 邮箱。

### INVALID_CLIENT: Invalid redirect URI

ECHO 里的 Redirect URI 和 Spotify Dashboard 里注册的不一致。

处理方式：

- 两边必须完全一致。
- 建议直接使用默认值：`http://127.0.0.1:43879/spotify/callback`。

### Spotify Premium or regional permission is required

可能原因：

- 当前 Spotify 账号不是 Premium。
- 当前地区不能播放该内容。
- Spotify Connect / Web Playback SDK 当前不可用。

### 能不能下载 Spotify 音频

不能。ECHO 的 Spotify 接入只走官方 OAuth、Web API、Web Playback SDK / Spotify Connect，不提供可下载音频 URL，也不会进入 ECHO native audio 解码路径。

## 参考

- <https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow>
- <https://developer.spotify.com/documentation/web-api/concepts/redirect_uri>
- <https://developer.spotify.com/documentation/web-api/concepts/quota-modes>

---

# theme-ai-guide

Source: src/content/docs/en/docs/theme-ai-guide.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/theme-ai-guide/

---
title: "AI Theme Guide"
description: "Theme JSON contract, field meanings, prompts, and checks for generating ECHO Next themes with AI."
sidebar:
  order: 51
  label: "AI Themes"
---

这份文档给 AI 阅读。用户可以把它连同自己的审美描述一起发送给 AI，让 AI 生成 ECHO 可导入的自定义主题 JSON。

目标：生成一个 `echo-next.custom-theme` JSON 文件。用户在 ECHO 的 `设置 -> 外观 -> 自定义当前主题 -> 导入参数` 中导入后，就能得到一个“我的主题”。

## 生成原则

- 只输出 JSON，不输出 CSS、JS、HTML 或解释性文字。
- JSON 必须能被 `JSON.parse` 解析：不要写注释，不要有尾随逗号，不要使用单引号。
- 颜色只使用 `#RRGGBB` 十六进制格式，例如 `#101416`。不要输出 `rgb()`、`rgba()`、`hsl()`、透明色或渐变字符串。
- 字段名必须完全匹配本文档，不要发明新字段。
- 至少提供 `light` 或 `dark` 其中一组。推荐同时提供两组。
- 主题可以故意低对比度，但要知道这可能影响可读性。ECHO 只提醒，不会阻止用户保存。
- 优先做有审美一致性的主题：背景、面板、播放器、侧栏、文字、强调色要像同一个设计系统。
- 不要只把所有颜色都换成同一色相的深浅变化。至少使用一个主强调色、一个辅助强调色和一组中性色。

## 顶层结构

输出这个结构：

```json
{
  "schema": "echo-next.custom-theme",
  "version": 2,
  "exportedAt": "2026-06-03T00:00:00.000Z",
  "theme": {
    "id": "theme-ai-example",
    "name": "AI Example",
    "basePreset": "classic",
    "createdAt": "2026-06-03T00:00:00.000Z",
    "updatedAt": "2026-06-03T00:00:00.000Z",
    "light": {},
    "dark": {}
  }
}
```

字段说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `schema` | 是 | 固定为 `echo-next.custom-theme` |
| `version` | 是 | 固定为 `2` |
| `exportedAt` | 是 | ISO 时间字符串 |
| `theme.id` | 是 | 1-80 个字符，只用字母、数字、下划线、点、冒号、短横线 |
| `theme.name` | 是 | 用户看到的主题名，最多 48 个字符 |
| `theme.basePreset` | 是 | 基础预设名，见下方列表 |
| `theme.createdAt` | 是 | ISO 时间字符串 |
| `theme.updatedAt` | 是 | ISO 时间字符串 |
| `theme.light` | 否 | 浅色模式覆盖参数 |
| `theme.dark` | 否 | 深色模式覆盖参数 |

可用的 `basePreset`：

```text
classic, echoTwilight, sakuraMilk, peachSoda, mintCandy, berryDream,
matchaCream, lemonMochi, cottonCloud, melonCream, seaSaltJelly,
caramelPudding, neonCandy, nyanCat, childrenDoodle, wisteriaBubble,
strawberryCookie, graphiteAurora, amberNoir, oceanStudio, rosewoodVinyl,
darkSideMoon, shibuyaNight, kyotoKurenai, ukiyoIndigo, fujiSnow,
matsuriLantern, ginzaNoir, frostJazz, FINAL
```

不知道选什么时用 `classic`。如果用户要求“保留某个预设的气质再微调”，就把那个预设写入 `basePreset`。

## 色调结构

`light` 和 `dark` 的字段相同。可以只写需要覆盖的字段，但建议生成完整字段，方便用户导入后直接得到完整效果。

```json
{
  "appBg": "#f4f8fb",
  "appBg2": "#d8e8ef",
  "appBg3": "#dce3f2",
  "panel": "#fbfdff",
  "panelSoft": "#e6eef4",
  "accent": "#245f9e",
  "accentStrong": "#163f70",
  "secondary": "#7f3e70",
  "heading": "#142234",
  "text": "#34495f",
  "muted": "#546a80",
  "border": "#5c7da9",
  "onAccent": "#ffffff",
  "buttonText": "#34495f",
  "titlebar": "#fbfdff",
  "sidebar": "#e6eef4",
  "player": "#fbfdff",
  "field": "#ffffff",
  "row": "#ffffff",
  "rowHover": "#eef4fa",
  "rowActive": "#dce9ff",
  "chip": "#ffffff",
  "focus": "#245f9e",
  "danger": "#d64545",
  "success": "#2f8f72",
  "warning": "#c98a16",
  "panelOpacityPercent": 78,
  "glassPercent": 20,
  "shadowPercent": 82,
  "cornerRadiusPx": 14,
  "panelBlurPx": 15,
  "saturationPercent": 100,
  "motionEnabled": true,
  "motionSpeedSeconds": 0.18,
  "motionIntensityPercent": 64
}
```

## 颜色字段含义

| 字段 | 用途 | 生成建议 |
| --- | --- | --- |
| `appBg` | 主窗口底色 | 决定主题第一印象 |
| `appBg2` | 背景渐变中段 | 和 `appBg` 同气质但有层次 |
| `appBg3` | 背景渐变尾色 | 可加入轻微冷暖对比 |
| `panel` | 主要面板色 | 需要承载正文和按钮 |
| `panelSoft` | 弱层级面板 | 侧栏、次级区域、柔和背景 |
| `accent` | 主强调色 | 主按钮、进度、焦点 |
| `accentStrong` | 强强调色 | 标题高光、强调层次 |
| `secondary` | 第三强调色 | 小状态、高亮点缀 |
| `heading` | 主文字 | 标题、重要文字 |
| `text` | 正文文字 | 歌名、设置正文、列表文字 |
| `muted` | 次要文字 | 描述、辅助说明 |
| `border` | 边框和分割线 | 不要比文字更抢眼 |
| `onAccent` | 强调按钮上的文字 | 必须能压住 `accent` |
| `buttonText` | 普通按钮文字 | 通常接近 `text` |
| `titlebar` | 窗口顶部栏 | 通常接近 `panel` 或 `appBg` |
| `sidebar` | 左侧导航背景 | 通常接近 `panelSoft` |
| `player` | 底部播放器背景 | 可比 `panel` 稍深或稍实 |
| `field` | 输入框和搜索框 | 需要和 `text` 有可读性 |
| `row` | 列表普通行 | 通常接近 `panel` |
| `rowHover` | 列表悬停行 | 比 `row` 稍有变化 |
| `rowActive` | 列表选中行 | 带一点 `accent` 气质 |
| `chip` | 筛选芯片、小按钮底色 | 通常接近 `field` |
| `focus` | 键盘焦点和描边高亮 | 通常等于或接近 `accent` |
| `danger` | 危险色 | 删除、错误 |
| `success` | 成功色 | 正常、连接成功 |
| `warning` | 警告色 | 提醒、注意 |

## 数值字段范围

| 字段 | 范围 | 说明 |
| --- | --- | --- |
| `panelOpacityPercent` | 40-100 | 面板不透明度，越低越透 |
| `glassPercent` | 0-80 | 玻璃感和背景模糊层次 |
| `shadowPercent` | 0-100 | 阴影强度 |
| `cornerRadiusPx` | 0-28 | 圆角大小 |
| `panelBlurPx` | 0-32 | 面板模糊程度 |
| `saturationPercent` | 60-140 | 整体饱和度 |
| `motionEnabled` | `true` / `false` | 是否启用主题动效 |
| `motionSpeedSeconds` | 0.12-8 | 动效速度，越小越快 |
| `motionIntensityPercent` | 0-160 | 动效强度 |

## 对比度建议

ECHO 允许用户保存低对比度主题，但 AI 应该优先保证可读性。

推荐检查：

- `text` 对 `appBg` 尽量达到 4.5:1。
- `heading` 对 `appBg` 尽量达到 4.5:1。
- `buttonText` 对 `panel` 尽量达到 4.5:1。
- `onAccent` 对 `accent` 尽量达到 3:1。

浅色主题常见做法：

- 背景用浅色，文字用深色。
- `accent` 如果偏深，`onAccent` 用 `#ffffff`。
- 面板不要和背景完全一样，至少有轻微层次。

深色主题常见做法：

- 背景用深色，文字用浅色。
- `accent` 可以更明亮，但避免荧光色过多。
- `muted` 不要太暗，否则辅助文字会看不清。

## 完整示例

```json
{
  "schema": "echo-next.custom-theme",
  "version": 2,
  "exportedAt": "2026-06-03T00:00:00.000Z",
  "theme": {
    "id": "theme-ai-midnight-lychee",
    "name": "Midnight Lychee",
    "basePreset": "classic",
    "createdAt": "2026-06-03T00:00:00.000Z",
    "updatedAt": "2026-06-03T00:00:00.000Z",
    "light": {
      "appBg": "#f8f1f5",
      "appBg2": "#ead8e8",
      "appBg3": "#d7edf0",
      "panel": "#fffafd",
      "panelSoft": "#efe2eb",
      "accent": "#9f3d72",
      "accentStrong": "#67264b",
      "secondary": "#2f7f87",
      "heading": "#2a1724",
      "text": "#4b3241",
      "muted": "#735b69",
      "border": "#b67598",
      "onAccent": "#ffffff",
      "buttonText": "#4b3241",
      "titlebar": "#fffafd",
      "sidebar": "#efe2eb",
      "player": "#fff7fb",
      "field": "#ffffff",
      "row": "#ffffff",
      "rowHover": "#f5edf2",
      "rowActive": "#efd4e4",
      "chip": "#fffafd",
      "focus": "#9f3d72",
      "danger": "#c84355",
      "success": "#2f8f72",
      "warning": "#bd7a1c",
      "panelOpacityPercent": 80,
      "glassPercent": 18,
      "shadowPercent": 78,
      "cornerRadiusPx": 14,
      "panelBlurPx": 14,
      "saturationPercent": 104,
      "motionEnabled": true,
      "motionSpeedSeconds": 0.22,
      "motionIntensityPercent": 58
    },
    "dark": {
      "appBg": "#0d0910",
      "appBg2": "#1d1020",
      "appBg3": "#0b2428",
      "panel": "#211725",
      "panelSoft": "#17101a",
      "accent": "#f08abd",
      "accentStrong": "#ffd6ea",
      "secondary": "#72d0d7",
      "heading": "#fff6fb",
      "text": "#eadce7",
      "muted": "#c8aeba",
      "border": "#c875a4",
      "onAccent": "#321020",
      "buttonText": "#eadce7",
      "titlebar": "#18101b",
      "sidebar": "#17101a",
      "player": "#211725",
      "field": "#17101a",
      "row": "#201522",
      "rowHover": "#2a1a2e",
      "rowActive": "#3a2039",
      "chip": "#26192b",
      "focus": "#f08abd",
      "danger": "#ff6b7a",
      "success": "#65d6a1",
      "warning": "#f0b45b",
      "panelOpacityPercent": 88,
      "glassPercent": 24,
      "shadowPercent": 96,
      "cornerRadiusPx": 14,
      "panelBlurPx": 18,
      "saturationPercent": 108,
      "motionEnabled": true,
      "motionSpeedSeconds": 0.22,
      "motionIntensityPercent": 70
    }
  }
}
```

## 用户提示词模板

用户可以把下面这段发给 AI，并在最后补充自己的审美描述：

```text
请根据我提供的 ECHO AI 主题生成指南，为 ECHO 生成一个可导入的自定义主题 JSON。

要求：
- 只输出一个 JSON 代码块。
- 使用 schema = "echo-next.custom-theme"，version = 2。
- 同时生成 light 和 dark 两套色调。
- 所有颜色必须是 #RRGGBB。
- 不要输出 CSS、JS、解释文字或注释。
- 字段必须符合指南，不要增加不存在的字段。
- 尽量保证正文、标题、按钮和强调按钮可读。

我的主题需求：
主题名：
关键词：
想要的氛围：
喜欢的颜色：
不喜欢的颜色：
更偏浅色还是深色：
是否需要高对比度：
是否需要动效：
参考对象或画面：
```

## AI 生成前检查清单

生成 JSON 前检查：

- `schema` 是否为 `echo-next.custom-theme`。
- `version` 是否为 `2`。
- `theme.id` 是否只包含安全字符且不超过 80 个字符。
- `theme.name` 是否不超过 48 个字符。
- `basePreset` 是否在允许列表中。
- 是否至少有 `light` 或 `dark`。
- 所有颜色是否都是 `#RRGGBB`。
- 数值是否在范围内。
- JSON 是否没有注释和尾随逗号。
- 主题是否符合用户描述，而不是只随机堆颜色。

## 进阶：插件主题结构

如果用户不是要导入单个 JSON，而是要制作主题插件，可以使用 `contributes.themePresets`。插件主题不是本文档的主要目标，但结构如下：

```json
{
  "id": "echo.ai-theme-pack",
  "name": "AI Theme Pack",
  "version": "0.1.0",
  "apiVersion": 2,
  "entry": "plugin.js",
  "permissions": [],
  "contributes": {
    "themePresets": [
      {
        "id": "midnight-lychee",
        "title": "Midnight Lychee",
        "description": "荔枝粉、夜色紫和冷青色高光。",
        "basePreset": "classic",
        "preview": "linear-gradient(135deg, #0d0910 0%, #1d1020 50%, #72d0d7 100%)",
        "swatches": ["#0d0910", "#f08abd", "#72d0d7", "#eadce7"],
        "light": {
          "appBg": "#f8f1f5",
          "panel": "#fffafd",
          "accent": "#9f3d72",
          "heading": "#2a1724",
          "text": "#4b3241",
          "onAccent": "#ffffff"
        },
        "dark": {
          "appBg": "#0d0910",
          "panel": "#211725",
          "accent": "#f08abd",
          "heading": "#fff6fb",
          "text": "#eadce7",
          "onAccent": "#321020"
        }
      }
    ]
  }
}
```

插件主题额外规则：

- `themePresets` 最多 12 个。
- `preview` 只能是纯色或 `linear-gradient(...)`。
- `swatches` 只放 `#RRGGBB` 颜色。
- 主题插件不需要权限，不注入任意 CSS。

---

# Settings and Troubleshooting

Source: src/content/docs/en/docs/troubleshooting.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/troubleshooting/
Description: Common settings, update, playback, library, and issue-reporting checks.

Troubleshooting works best when you narrow the problem first. Avoid clearing the library, reinstalling the app, deleting settings, or changing many switches at once until you know which area is failing.

## Screenshot And Send A Report

When you report an issue, include as much of this as possible:

- Screenshots of the current page, especially error messages, playback state, output device, scan progress, or remote-source status.
- ECHO version, operating system version, install channel, and the time the issue happened.
- The exact steps you took, such as importing a folder, changing output mode, syncing a remote source, or playing a specific file.
- Audio format, sample rate, bit depth, output mode, and device model when the issue is audio-related.
- Any diagnostics, logs, error details, or copied report text exposed by the app.

Screenshots and reports make support much faster. A message such as "it does not work", "it froze", or "no sound" is usually not enough to tell whether the cause is settings, files, drivers, network, or ECHO itself.

## Update Problems

The Windows auto-updater reads the release feed, not the website pages. Check:

1. Your network can reach GitHub Releases or the current mirror.
2. Your installed version is actually older than the latest release.
3. Antivirus, firewall, or managed networks are not blocking the installer.
4. The download folder has enough space and write permission.

If the installer download fails, download it again from the download page. Do not delete your library database for an updater problem.

## Playback Problems

For no sound, crackling, half-speed playback, double-speed playback, failed track changes, or strange progress, check in this order:

1. Windows volume, default output device, and the per-app volume mixer.
2. ECHO bottom-player volume, mute state, and queue state.
3. `Settings -> Playback`, switching back to `System` or `WASAPI Shared` first.
4. Temporarily disable EQ, ReplayGain, speed changes, channel tools, resampling, and automix.
5. Try a known-good MP3 or FLAC file.
6. Only then try WASAPI Exclusive, ASIO, DSD, or HQPlayer paths again.

If a song sounds slow, fast, pitch-shifted, or you set the Windows default format to a very high sample rate, read [Why Did My Song Speed Change?](/en/docs/audio-output/song-speed-changed/).

Third-party drivers, virtual audio devices, and ASIO wrapper layers are outside ECHO support. This includes ASIO4ALL, FlexASIO, Voicemeeter, non-vendor driver repacks, system-wide audio enhancement drivers, and virtual routing software. They may work, but ECHO does not promise compatibility and will not add device-specific support for them.

## Library Problems

Start with a small controlled check:

1. Create a folder with 3 to 10 known-good tracks.
2. Import that folder and confirm scanning, artwork, album grouping, and playback.
3. Import the full library afterward.
4. If only one album is wrong, check `album`, `albumArtist`, track number, disc number, and artwork tags.
5. Run a full rescan only when you have a clear reason.

Lag during the first import of a large library is normal. ECHO needs to read files, tags, artwork, duration, codec information, and write indexes. Avoid running large downloads, full remote syncs, or other heavy background tasks during import.

## Remote And Online Source Problems

Separate the failure into three questions:

- Can the account or address connect?
- Can the folders be browsed?
- Can the audio actually play?

WebDAV, Jellyfin, Emby, Subsonic, NAS, proxy, campus, and corporate networks can all behave differently depending on server configuration. If remote sync is slow, do not repeatedly delete and recreate the source. Screenshot the current state, keep the error text, then try pausing, resuming, or narrowing the sync scope.

## Restore Settings

Restore the affected area before resetting everything:

- Playback issues: restore playback output and DSP settings.
- Lyrics issues: restore lyrics display, online lyrics, and offset.
- Theme issues: switch back to the default theme.
- Library issues: pause background work, then handle the specific folder.

Clearing the library, deleting settings, or reinstalling should be the last step. Back up important settings and local music files first.

---

# user-guide

Source: src/content/docs/en/docs/user-guide.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/user-guide/

---
title: "ECHO NEXT User Guide"
description: "Full user guide covering first import, daily playback, lyrics, MV, remote sources, and plugins."
sidebar:
  order: 4
  label: "User Guide"
---

这份文档面向实际使用者，目标是让你知道 ECHO NEXT 每个页面能做什么、什么时候该用、怎么排查常见问题。

README 负责项目首页；这份文档负责详细教程。它会尽量按真实使用路径写，而不是只列功能名。

## 阅读方式

如果你是新用户，建议按顺序阅读：

1. 先看“第一次使用”。
2. 再看“本地曲库”和“播放控制”。
3. 已经能稳定播放后，再看“歌词”“MV”“音频输出与 HiFi”。
4. 最后再启用“远程来源”“流媒体搜索”“下载器”“插件”。

如果你只是想找某个页面怎么用，可以直接跳到对应章节。

## 零基础照着做

这一节把用户当成第一次打开播放器的人来写。不要急着理解所有名词，先照着做一遍，能播放、能找到歌、能调输出，就算跑通。

### 五分钟跑通本地播放

目标：确认 ECHO NEXT 能扫描你的本地歌曲，并且能正常播放。

1. 准备一个小文件夹，例如 `D:\Music\Test`。
2. 往里面放几首你确定没坏的歌，最好包含 MP3 和 FLAC。
3. 打开 ECHO NEXT。
4. 在左侧找到 `Import Folder`。
5. 点击 `Import Folder`。
6. 在系统文件选择窗口里选中 `D:\Music\Test`。
7. 确认导入。
8. 等待扫描开始。
9. 扫描期间不要马上乱点危险设置，先让它把这几个文件扫完。
10. 打开 `Inbox`。
11. 看看刚才那几首歌有没有出现。
12. 打开 `Songs`。
13. 在歌曲列表里找到其中一首。
14. 双击或点击播放按钮。
15. 看底部播放器是否显示当前歌曲。
16. 看进度条是否开始移动。
17. 听是否有声音。

正常结果：

| 位置 | 正常表现 |
| --- | --- |
| `Inbox` | 能看到新导入歌曲 |
| `Songs` | 能看到歌曲标题、艺术家、时长 |
| 底部播放器 | 显示当前播放歌曲 |
| 进度条 | 播放后会向前走 |
| 音频输出 | 能听到声音 |

如果没有声音，先不要重建数据库。按这个顺序排查：

1. 系统音量是不是静音。
2. ECHO NEXT 底部音量是不是太低。
3. 当前输出设备是不是你正在用的耳机或音箱。
4. 换一首确定正常的 MP3。
5. 到 `Settings -> Playback` 把输出模式切回 `System` 或共享输出。
6. 关闭 EQ、ReplayGain、变速。
7. 再试播放。

### 第一次导入完整曲库

目标：把你的长期音乐目录加入 ECHO NEXT。

1. 先确认你的小文件夹测试已经正常。
2. 确认完整曲库所在磁盘稳定在线。
3. 如果是移动硬盘，确认盘符不会突然变化。
4. 如果是 NAS 或同步盘，确认网络稳定。
5. 打开 `Import Folder` 或 `Folders`。
6. 选择完整音乐根目录，例如 `D:\Music`。
7. 开始导入。
8. 让扫描跑完第一轮。
9. 扫描时可以看 `Songs`，但不要同时启动下载器和远程全量索引。
10. 扫描结束后打开 `Albums`。
11. 检查专辑墙是否大致正确。
12. 打开 `Artists`。
13. 检查艺术家有没有明显重复或乱码。
14. 打开 `Inbox`。
15. 检查新导入内容。

如果第一次扫描很慢，不代表坏了。首次扫描要读文件、标签、封面、时长和专辑信息。大曲库就是会花时间。

### 每天听歌怎么用

最简单的日常流程：

1. 打开 ECHO NEXT。
2. 进 `Songs`。
3. 用搜索框找歌，或者切到 `Albums` 找专辑。
4. 找到想听的歌。
5. 直接播放，或者右键加入队列。
6. 想临时排一批歌，就放 `Queue`。
7. 想长期保存，就放 `Playlists`。
8. 特别喜欢，就点收藏，之后在 `Liked` 里找。
9. 忘记刚才听了什么，就去 `History`。

不要把所有东西都塞进队列。队列是临时的，播放列表才是长期保存。

### 想整理一张专辑怎么做

目标：让专辑显示正确，曲目顺序正确，封面正确。

1. 打开 `Albums`。
2. 搜索专辑名。
3. 如果同一张专辑出现多份，点进去看曲目。
4. 检查每首歌的 `album` 是否一致。
5. 检查每首歌的 `albumArtist` 是否一致。
6. 检查 track number 是否是 1、2、3 这样。
7. 多碟专辑检查 disc number。
8. 如果信息错了，回到 `Songs`。
9. 找到这些歌曲。
10. 右键编辑标签。
11. 改完后回到 `Albums` 看是否合并正确。
12. 如果封面错，检查文件内嵌封面或文件夹封面。

专辑整理优先看这几个字段：

| 字段 | 为什么重要 |
| --- | --- |
| `album` | 决定专辑名称 |
| `albumArtist` | 决定同名专辑是否应该归到一起 |
| `trackNo` | 决定曲目顺序 |
| `discNo` | 决定多碟顺序 |
| `year` | 决定发行年份显示 |
| 封面 | 决定专辑墙观感 |

### 想做一个歌单怎么做

目标：把一批歌长期保存起来。

1. 打开 `Songs`。
2. 搜索你想加入的歌曲。
3. 选中一首或多首。
4. 右键。
5. 选择加入播放列表。
6. 选择已有歌单，或者新建歌单。
7. 打开 `Playlists`。
8. 找到这个歌单。
9. 检查歌曲是否都在里面。
10. 之后想听这个主题时，直接从 `Playlists` 打开。

建议歌单分类：

| 歌单 | 用途 |
| --- | --- |
| 日常听 | 平时最常听 |
| 新歌待整理 | 刚导入还没确定是否保留 |
| 耳机测试 | 测低频、人声、声场、齿音 |
| 高解析测试 | 测 Hi-Res、DSD、不同采样率 |
| 夜间听 | 响度稳定、不吵 |
| 车载 | 适合路上听 |

### 想调音频输出怎么做

目标：先保证能听，再追求更高级输出。

1. 先用默认输出播放一首确定正常的歌。
2. 有声音后再进 `Settings -> Playback`。
3. 找到输出设备。
4. 如果你不确定选什么，先用 `System`。
5. 如果想更稳定的 Windows 日常输出，试 `WASAPI Shared`。
6. 如果你明确想独占设备，再试 `WASAPI Exclusive`。
7. 如果你有专业声卡，再试 `ASIO`。
8. 每切一次输出模式，都播放同一首歌确认是否正常。
9. 出现异常就切回上一个正常模式。
10. 调输出时先关闭 EQ、ReplayGain、变速。

判断是否正常：

| 项目 | 正常表现 |
| --- | --- |
| 设备 | 能看到你要用的耳机、音箱或 DAC |
| 播放 | 点播放后进度前进 |
| 声音 | 没爆音、没明显卡顿、没异常加速 |
| 状态 | 没有持续报错 |
| 切歌 | 上一首、下一首正常 |

### 想看歌词怎么做

1. 先播放一首歌。
2. 打开 `Lyrics`。
3. 看是否自动出现歌词。
4. 如果没有歌词，检查歌词来源设置。
5. 如果歌词整体早或晚，调整时间偏移。
6. 如果匹配错版本，手动选择候选。
7. 如果字体太小，到歌词设置调字号。
8. 如果背景复杂看不清，打开可读性增强或调颜色。

### 想看 MV 怎么做

1. 先播放一首歌。
2. 点击 MV 入口或打开 MV 相关页面。
3. 等待候选结果。
4. 先选最像官方 MV 的候选。
5. 如果自动候选不对，手动选择。
6. 如果有自定义 URL，就粘贴指定视频。
7. 如果高质量内嵌播放失败，尝试外部播放。
8. 如果 HEVC、HDR、Dolby Vision 不能播，这是编码支持问题，不一定是匹配问题。

### 想下载一首歌怎么做

1. 打开 `Downloads`。
2. 确认输出目录。
3. 搜索关键词，或者粘贴 URL。
4. 看搜索结果标题、时长、上传者是否符合预期。
5. 点击下载。
6. 查看任务状态。
7. 等待下载、提取音频、导入曲库。
8. 完成后去 `Inbox` 或 `Songs` 检查。

下载前请确认内容来源合法。下载器依赖网络、平台策略、FFmpeg、yt-dlp 和本机环境，失败时先看工具状态和错误信息。

### 想添加远程音乐库怎么做

1. 打开 `Cloud / Remote`。
2. 选择来源类型，例如 WebDAV、Jellyfin、Subsonic。
3. 填显示名称。
4. 填服务器地址。
5. 填账号、密码或 token。
6. 选择同步模式。
7. 先点测试连接。
8. 测试成功再保存。
9. 先用“仅浏览”或小范围索引试用。
10. 稳定后再建立索引。

不要一上来就对巨大远程库做重任务。先确认能连接、能浏览、能播放。

### 想启用插件怎么做

1. 打开 `Plugins`。
2. 先看插件名称和来源。
3. 打开插件详情。
4. 看它请求了哪些权限。
5. 如果有 `settings:write`、`library:write`、`network`，要特别谨慎。
6. 确认可信后再启用。
7. 启用后看活动摘要和日志。
8. 如果插件报错，先禁用。
9. 如果连续启动失败，宿主可能会隔离它。

新手建议先只试示例插件，不要直接启用来源不明的高权限插件。

## 看不懂界面时先这样判断

这一节专门给“我不知道现在发生了什么”的情况用。不要急，先判断你在哪个页面、正在做哪类事情。

### 先看左侧页面

| 你在左侧点到 | 说明 |
| --- | --- |
| `Songs` | 你在看歌曲列表 |
| `Albums` | 你在看专辑 |
| `Artists` | 你在看艺术家 |
| `Folders` | 你在看本地导入目录 |
| `Inbox` | 你在看新导入歌曲 |
| `Queue` | 你在看当前临时播放顺序 |
| `Liked` | 你在看收藏 |
| `History` | 你在看播放历史 |
| `Playlists` | 你在看长期歌单 |
| `Streaming` | 你在搜在线内容 |
| `Downloads` | 你在下载 |
| `Cloud / Remote` | 你在配置远程库 |
| `Connect` | 你在找局域网投放设备 |
| `Plugins` | 你在管理插件 |
| `Settings` | 你在改全局设置 |

### 再看底部播放器

底部播放器显示的是当前播放状态。判断顺序：

1. 有没有歌曲标题。
2. 有没有封面。
3. 播放按钮是播放还是暂停。
4. 进度条有没有动。
5. 音量是不是太低。
6. 有没有错误提示。
7. 当前输出设备是不是正确。

如果列表里有歌，但底部播放器没变化，说明你可能只是选中了歌曲，还没有真正开始播放。

### 再看右键菜单

右键菜单能告诉你当前对象是什么。

| 右键对象 | 你可能看到 |
| --- | --- |
| 本地歌曲 | 编辑标签、打开文件夹、复制路径、删除 |
| 远程歌曲 | 加队列、播放、收藏，但本地文件操作会少 |
| 专辑 | 播放专辑、加入队列、编辑专辑标签、保存封面 |
| 队列歌曲 | 从队列移除、下一首播放 |
| 插件 | 启用、禁用、重载、查看日志 |

如果某个按钮没有出现，先想想：这个对象是不是远程的？是不是当前页面不支持？是不是没有选中内容？

### 再看状态文字

常见状态大概这样理解：

| 状态 | 含义 | 你要做什么 |
| --- | --- | --- |
| loading | 正在加载 | 等一下，不要连续猛点 |
| scanning | 正在扫描 | 等扫描完成 |
| queued | 已排队 | 等任务轮到它 |
| downloading | 正在下载 | 看进度和速度 |
| importing | 正在导入曲库 | 完成后去 `Inbox` 看 |
| failed | 失败 | 点开错误或看日志 |
| cancelled | 已取消 | 需要的话重新开始 |
| unavailable | 文件不可用 | 检查路径、磁盘、远程来源 |

### 如果你不知道该点哪里

按目标找入口：

| 目标 | 去哪里 |
| --- | --- |
| 我要导入本地歌 | `Import Folder` |
| 我要找歌 | `Songs` |
| 我要按专辑听 | `Albums` |
| 我要看新歌 | `Inbox` |
| 我要临时排歌 | `Queue` |
| 我要做长期歌单 | `Playlists` |
| 我要调声音输出 | `Settings -> Playback` |
| 我要调 EQ | `Settings -> EQ` |
| 我要调歌词 | `Settings -> Lyrics` 或 `Lyrics` |
| 我要看 MV | 播放器的 MV 入口或 MV 设置 |
| 我要下载 | `Downloads` |
| 我要连远程库 | `Cloud / Remote` |
| 我要改主题 | `Settings -> Appearance` |
| 我要看日志 | `Settings -> About` 或相关诊断入口 |
| 我要做危险修复 | `Settings -> Danger`，先备份 |

## 新手不要乱动的地方

这些功能不是不能用，而是要知道自己在干什么。

| 功能 | 为什么要谨慎 |
| --- | --- |
| 删除歌曲 | 可能影响真实文件或曲库记录 |
| 重建数据库 | 会影响曲库索引、扫描状态和本地记录 |
| 清理缓存 | 封面、临时文件或下载结果可能需要重新生成 |
| 修改插件高风险权限 | 插件可能改设置、读网络、写曲库 |
| 改代理 | 会影响歌词、MV、流媒体、下载、网络元数据 |
| 改输出模式到独占或 ASIO | 可能因为设备或驱动导致无声或失败 |
| 批量标签编辑 | 改错会让专辑、艺术家、搜索全部乱掉 |
| 全量远程索引 | 大远程库可能跑很久，也可能占网络 |

安全做法：

1. 先小范围试。
2. 看清楚会影响什么。
3. 能备份就备份。
4. 不确定就不要点危险按钮。
5. 出问题先恢复上一步，不要连续乱改。

## 常见目标的最短路径

### 我要播放一首本地歌

1. `Songs`。
2. 搜索歌名。
3. 找到歌曲。
4. 双击或点播放。
5. 看底部播放器。
6. 有声音就完成。

### 我要播放一整张专辑

1. `Albums`。
2. 搜索专辑名。
3. 打开专辑。
4. 检查曲目顺序。
5. 点播放专辑，或右键专辑选择播放。

### 我要把几首歌排到下一首后面

1. `Songs`。
2. 选中歌曲。
3. 右键。
4. 选“下一首播放”或“加入队列”。
5. 去 `Queue` 检查顺序。

### 我要把一首歌加入歌单

1. `Songs`。
2. 找到歌曲。
3. 右键。
4. 选择加入播放列表。
5. 选择歌单。
6. 去 `Playlists` 检查。

### 我要修正歌名

1. `Songs`。
2. 找到歌曲。
3. 右键。
4. 选择编辑标签。
5. 修改标题。
6. 保存。
7. 搜索新标题确认。

### 我要修正专辑拆分

1. `Albums`。
2. 找到被拆开的专辑。
3. 记住哪些曲目应该属于同一专辑。
4. 回到 `Songs`。
5. 找到这些曲目。
6. 编辑标签。
7. 统一 `album` 和 `albumArtist`。
8. 保存。
9. 回到 `Albums` 检查是否合并。

### 我要换输出设备

1. 插好耳机、音箱或 DAC。
2. 确认系统能识别设备。
3. 打开 `Settings -> Playback`。
4. 找输出设备。
5. 选择目标设备。
6. 先用 System 或 Shared 测试。
7. 播放一首歌。
8. 正常后再考虑 Exclusive 或 ASIO。

### 我要让声音别忽大忽小

1. 打开 `Settings -> Playback`。
2. 找 ReplayGain。
3. 开启相关响度处理。
4. 播放几首不同专辑的歌测试。
5. 如果你要 bit-perfect，就关掉 ReplayGain。

### 我要让歌词晚一点或早一点

1. 播放歌曲。
2. 打开 `Lyrics`。
3. 判断歌词是早了还是晚了。
4. 打开歌词设置。
5. 调整 offset。
6. 调一点就播放检查，不要一次调太大。
7. 保存后再听一遍副歌确认。

### 我要把视频当 MV 绑定

1. 播放歌曲。
2. 打开 MV 入口。
3. 搜索候选。
4. 找最正确的视频。
5. 如果候选没有，复制视频 URL。
6. 用自定义 URL 绑定。
7. 播放确认。
8. 高规格视频不能内嵌时用外部播放。

## 基本概念

ECHO NEXT 不是单纯的文件打开器。它更像一个本地音乐管理系统，核心由几层组成：

| 概念 | 说明 |
| --- | --- |
| 本地文件 | 你磁盘上的真实音频文件，例如 FLAC、MP3、WAV、M4A |
| 曲库 | ECHO NEXT 从文件中扫描出来的 SQLite 数据库 |
| 标签 | 文件里记录的标题、艺术家、专辑、年份、曲号、封面等元数据 |
| 封面缓存 | 为列表和专辑墙生成的轻量封面文件 |
| 队列 | 当前临时播放顺序 |
| 播放列表 | 用户长期保存的歌单 |
| 远程来源 | WebDAV、Jellyfin、Emby、SMB、SSHFS、Subsonic 等外部音乐库 |
| 网络元数据 | 从网络来源找到的候选信息，只应该补缺，不应该覆盖高可信标签 |
| 音频输出 | 系统输出、WASAPI、ASIO、EQ、ReplayGain 等播放链路设置 |
| 插件 | 本地可编辑、受权限控制的扩展脚本 |

### 本地优先

ECHO NEXT 的中心是本地曲库。远程来源、流媒体搜索、下载器、网络元数据、插件都属于扩展能力。它们应该围绕本地听歌体验服务，而不是让播放器变成完全依赖在线平台的壳。

### 稳定优先

播放稳定比功能数量更重要。扫描、封面生成、远程补全、下载、插件、诊断窗口都不应该抢占播放链路。

### 可解释优先

音频输出、bit-perfect、EQ、ReplayGain、MV fallback、歌词匹配都要尽量说清楚当前状态。不要把被 DSP 处理过的声音伪装成 bit-perfect，也不要把网络候选当成绝对正确的元数据。

## 第一次使用

### 推荐路线

第一次使用时，不建议立刻导入完整大曲库。更稳的路线是：

1. 准备一个小文件夹，里面放 10 到 50 首常见格式的歌。
2. 打开 ECHO NEXT。
3. 用 `Import Folder` 导入这个小文件夹。
4. 在 `Inbox` 查看新导入歌曲。
5. 在 `Songs` 搜索、排序、播放几首歌。
6. 在 `Albums` 检查专辑和封面是否聚合正常。
7. 打开 `Lyrics` 和 `MV` 看候选是否可用。
8. 进入 `Settings -> Playback` 确认输出设备。
9. 如果这些都正常，再导入完整曲库。

这样做的好处是：如果扫描、播放、封面、输出、歌词、MV 里有任何一环不对，你能在小范围里定位，不会一开始就被几万首歌和多个后台任务拖住。

### 不建议一开始就做的事

| 不建议 | 原因 |
| --- | --- |
| 一次导入整个几十万文件目录 | 首次扫描会很慢，问题也难定位 |
| 同时开启远程库、下载器、插件、网络补全 | 多条后台链路叠在一起，不容易判断问题来源 |
| 外置硬盘没稳定连接就扫全库 | 容易产生缺失、不可访问、扫描失败等状态 |
| 歌词和 MV 不准就立刻认为程序坏了 | 自动匹配依赖元数据和网络来源，天然存在误差 |
| 播放异常时直接重建数据库 | 播放问题多数不需要动数据库 |

## 页面总览

| 页面 | 主要用途 | 最常用操作 |
| --- | --- | --- |
| `Import Folder` | 导入本地音乐文件夹 | 选择目录并开始扫描 |
| `Folders` | 管理导入根目录 | 查看扫描状态、维护目录 |
| `Inbox` | 查看新扫描歌曲 | 检查新导入内容 |
| `Songs` | 全曲库主列表 | 搜索、排序、播放、右键、标签编辑 |
| `Albums` | 专辑墙和专辑详情 | 按专辑播放、检查封面、整理专辑 |
| `Artists` | 艺术家浏览 | 检查艺术家聚合 |
| `Queue` | 当前播放队列 | 调整临时播放顺序 |
| `Liked` | 收藏歌曲 | 快速查看喜欢的歌 |
| `History` | 播放历史 | 找回刚听过的内容 |
| `Playlists` | 播放列表 | 管理长期歌单 |
| `Lyrics` | 沉浸式歌词页 | 看歌词、调偏移、看辅助文本 |
| `Streaming` | 流媒体搜索 | 搜索单曲、专辑、歌手、歌单 |
| `Downloads` | 下载任务 | URL 下载、搜索下载、导入曲库 |
| `Cloud / Remote` | 远程来源 | 添加 WebDAV、Jellyfin、Subsonic 等 |
| `Connect` | 局域网播放 | DLNA、AirPlay 等发现和连接 |
| `Plugins` | 插件管理 | 启用、禁用、查看权限和日志 |
| `Settings` | 全局设置 | 播放、歌词、MV、EQ、外观、曲库、危险操作 |

## 本地曲库

本地曲库是 ECHO NEXT 的核心。曲库质量越好，搜索、专辑墙、歌词匹配、MV 匹配、播放列表和统计越可靠。

### 文件整理建议

推荐结构：

```text
Music/
  Artist/
    2024 - Album Name/
      01 - Track.flac
      02 - Track.flac
      cover.jpg
```

不是必须这样放，但稳定的目录结构会减少后续整理成本。

建议：

1. 一个专辑文件夹里尽量放同一张专辑。
2. 同一张专辑的 `album`、`albumArtist` 保持一致。
3. 多碟专辑写好 disc number 和 track number。
4. 不要把临时下载目录直接当长期曲库。
5. 外置硬盘和 NAS 路径尽量固定。
6. 文件名可以辅助识别，但不要只依赖文件名。

### 支持的常见音频格式

项目的文件关联包含大量格式，常见包括：

| 类型 | 示例 |
| --- | --- |
| 无损 | FLAC、WAV、ALAC、AIFF、APE、WavPack |
| 有损 | MP3、AAC、M4A、OGG、Opus、WMA |
| DSD | DSF、DFF |
| 视频或容器 | MKV、MP4、MOV、WebM、MKA |
| 其它 | MPC、TAK、TTA、CAF、DTS、CUE |

是否能顺利播放取决于解码工具、文件本身、封装方式和当前音频链路。

## 导入文件夹

### 入口

你可以通过这些入口导入：

1. 侧边栏 `Import Folder`。
2. `Folders` 页面里的添加入口。
3. `Settings -> Library` 里的文件夹管理区域。

### 导入时发生什么

导入文件夹后，ECHO NEXT 会：

1. 记录这个根目录。
2. 后台扫描目录。
3. 找出音频文件。
4. 读取嵌入式标签。
5. 读取或提取封面。
6. 写入曲库数据库。
7. 聚合专辑和艺术家。
8. 更新 `Songs`、`Albums`、`Artists`、`Inbox` 等页面。

### 扫描状态怎么看

扫描过程可能包含这些阶段：

| 阶段 | 含义 |
| --- | --- |
| 排队 | 等待扫描任务开始 |
| 发现文件 | 遍历目录，寻找音频文件 |
| 检查增量缓存 | 判断哪些文件没有变化 |
| 读取元数据 | 读取标题、艺术家、专辑、时长等 |
| 提取封面 | 读取嵌入封面或文件夹封面 |
| 整理专辑 | 聚合同一专辑和曲目顺序 |
| 写入数据库 | 保存扫描结果 |
| 完成 | 本轮扫描结束 |
| 失败 / 取消 | 本轮扫描未完成 |

### 大曲库导入建议

如果你的曲库很大：

1. 第一次扫描时保持磁盘在线。
2. 不要同时做大量下载、远程同步和插件批处理。
3. 扫描期间可以浏览，但尽量避免频繁切换大范围筛选。
4. 如果扫描失败，先看失败路径，不要直接重建数据库。
5. 后续扫描会尽量复用未变化文件，通常比首次快。

## Folders 文件夹

`Folders` 用来管理导入根目录。

### 适合做什么

1. 查看已经添加的音乐文件夹。
2. 添加新的根目录。
3. 判断某个目录是否还可访问。
4. 触发或观察扫描。
5. 检查哪些目录可能出错。

### 常见问题

| 现象 | 可能原因 | 建议 |
| --- | --- | --- |
| 文件夹突然不可用 | 外置盘离线、盘符变化、权限变化 | 先恢复路径，不要急着删除 |
| 扫描很慢 | 首次扫描、大量封面、大量无损文件 | 等待完成，避免同时跑重任务 |
| 新文件没出现 | 没重新扫描、文件格式异常、路径不在根目录下 | 手动刷新或检查目录 |
| 重复出现歌曲 | 添加了父目录和子目录 | 保留一个根目录 |

## Inbox 收件箱

`Inbox` 是新导入内容的检查区。

### 适合场景

1. 刚下载了一批歌。
2. 刚复制了一张专辑。
3. 刚导入新文件夹。
4. 想快速筛查新增歌曲是否正常。

### 检查清单

| 检查项 | 看什么 |
| --- | --- |
| 标题 | 是否是正确歌名，不是文件名乱码 |
| 艺术家 | 是否统一 |
| 专辑 | 是否聚合到正确专辑 |
| 封面 | 是否显示正确封面 |
| 时长 | 是否异常为 0 或明显不对 |
| 播放 | 是否能正常播放 |
| 格式 | 是否符合预期 |

如果新导入内容质量很差，优先整理源文件标签，再重新读取或重新扫描。

## Songs 歌曲列表

`Songs` 是最重要的日常页面。找歌、播放、整理、排查，大多数都会经过这里。

### 搜索

搜索适合找：

1. 歌曲标题。
2. 艺术家。
3. 专辑。
4. 某些版本关键字。

建议：

1. 大曲库里优先搜索，不要纯靠滚动。
2. 搜索不到时检查标签，不要只看文件名。
3. 如果艺术家或专辑字段为空，搜索效果会下降。

### 排序

| 排序 | 适合用途 |
| --- | --- |
| 默认排序 | 日常浏览 |
| 创建时间正序 / 倒序 | 找新导入或旧导入 |
| 歌曲名 A-Z / Z-A | 按标题整理 |
| 音乐时间短到长 / 长到短 | 找异常短音频、长音频、整轨 |
| 文件修改时间旧到新 / 新到旧 | 找最近改过的文件 |
| 歌曲质量 / 大小 | 找高规格或异常小文件 |
| 常听歌曲 | 找播放频率高的内容 |
| 随机排序 | 打散浏览 |
| 按艺术家 | 检查艺术家聚合 |
| 按专辑 | 检查专辑字段 |
| 最近更新 | 查看最近扫描变化 |

### 本地和远程来源切换

歌曲页可以在本地曲库和远程来源之间切换。区别是：

| 来源 | 能做什么 | 限制 |
| --- | --- | --- |
| 本地 | 播放、编辑标签、打开文件夹、复制路径、删除、封面操作 | 依赖本地文件存在 |
| 远程 | 浏览、播放、加入队列、收藏、加入歌单 | 不一定能编辑标签或打开本地路径 |

如果你在远程歌曲上看不到某些右键操作，这是正常边界。

### 多选

多选适合：

1. 批量加入队列。
2. 批量加入播放列表。
3. 批量收藏。
4. 批量从队列移除。

不建议对大量文件一次性做高风险修改。尤其是删除、标签写入、重读标签这类动作，最好分批确认。

### 重复歌曲筛选

重复歌曲筛选适合清理：

1. 同一文件复制了多份。
2. 同一首歌不同码率。
3. 同一专辑重复导入。
4. 下载目录和正式曲库重复。

但这些不一定是重复：

1. 现场版。
2. Remaster。
3. Radio Edit。
4. Instrumental。
5. Cover。
6. 不同语言版本。
7. 专辑版和单曲版。

删除前至少对比路径、时长、码率、专辑和文件大小。

### 右键菜单

本地歌曲常见右键动作：

| 操作 | 说明 | 风险 |
| --- | --- | --- |
| 加入播放列表 | 保存到长期歌单 | 低 |
| 下一首播放 | 插入到当前播放后 | 低 |
| 加入队列 | 加到队列末尾 | 低 |
| 收藏 / 取消收藏 | 改变喜欢状态 | 低 |
| 编辑标签 | 修改曲库或文件标签 | 中 |
| 重新读取嵌入式标签 | 用文件标签刷新曲库记录 | 中 |
| 打开 osu! timing | 查看或调整 timing | 低到中 |
| 跳到专辑 | 打开专辑详情 | 低 |
| 在文件夹中显示 | 打开系统文件夹 | 低 |
| 复制路径 | 复制本地路径 | 低 |
| 用系统打开 | 交给系统默认程序 | 低 |
| 复制歌名和艺术家 | 用于搜索或分享 | 低 |
| 复制 / 保存封面 | 导出封面素材 | 低 |
| 删除歌曲 | 删除或移除歌曲 | 高 |

### 标签编辑

标签编辑会影响曲库显示，某些情况下也可能写回文件标签。

建议字段规则：

| 字段 | 建议 |
| --- | --- |
| title | 只写歌名，不要塞艺术家 |
| artist | 参与演唱或主要艺人 |
| album | 专辑名保持一致 |
| albumArtist | 同一专辑尽量统一 |
| year | 用发行年份，不要随意混入日期文本 |
| trackNo | 曲号写数字 |
| discNo | 多碟专辑写碟号 |
| genre | 风格可以粗略，不要写太碎 |

### 歌曲列表排查

| 问题 | 先检查 |
| --- | --- |
| 歌找不到 | 是否导入目录、是否扫描完成、标签是否为空 |
| 标题乱码 | 源文件标签编码或文件名来源 |
| 专辑拆分 | album / albumArtist 是否一致 |
| 封面不显示 | 文件是否有封面、文件夹是否有 cover/front 图片、缓存是否生成 |
| 播放失败 | 文件是否存在、格式是否可解码、输出设备是否正常 |
| 右键少选项 | 是否远程歌曲、是否当前上下文不支持 |

## Albums 专辑墙

`Albums` 是按专辑浏览的主入口。

### 适合做什么

1. 按专辑听歌。
2. 检查专辑封面。
3. 整理多碟专辑。
4. 检查同名专辑是否混在一起。
5. 找缺失封面的专辑。
6. 将整张专辑加入队列或歌单。

### 专辑排序

专辑页支持标题、艺术家、创建时间、时长、文件修改时间、最近更新、随机等排序。常见用法：

| 目标 | 推荐排序 |
| --- | --- |
| 找最近加入的专辑 | 创建时间倒序或最近更新 |
| 检查标题 | 标题排序 |
| 检查艺术家 | 艺术家排序 |
| 随便听一张 | 随机 |
| 找异常专辑 | 时长排序 |

### 专辑详情

进入专辑详情后，重点看：

1. 曲目顺序是否正确。
2. 碟号是否正确。
3. 曲号是否完整。
4. 封面是否正确。
5. 艺术家和专辑艺术家是否符合预期。

### 专辑右键菜单

常见动作：

| 操作 | 用途 |
| --- | --- |
| 播放专辑 | 从头播放整张专辑 |
| 加入歌单 | 保存到长期播放列表 |
| 加入队列 | 临时加入播放顺序 |
| 收藏专辑 | 标记喜欢的专辑 |
| 编辑标签 | 修正专辑级信息 |
| 复制专辑信息 | 复制标题、艺术家等 |
| 复制 / 保存封面 | 处理封面 |
| 删除专辑 | 高风险，谨慎 |

### 专辑聚合错误

| 现象 | 可能原因 | 处理 |
| --- | --- | --- |
| 一张专辑拆成多张 | album 或 albumArtist 不一致 | 统一标签后重新读取 |
| 多个专辑混成一张 | album 名相同但 albumArtist 缺失 | 补 albumArtist |
| 曲目顺序错 | trackNo / discNo 缺失 | 补曲号和碟号 |
| 封面错 | 单曲嵌入封面不同 | 统一封面或文件夹封面 |
| 年份不对 | 标签年份混乱 | 修正 year |

## Artists 艺术家

`Artists` 适合检查艺术家聚合。

常见拆分原因：

1. `Aimer` 和 `aimer`。
2. `YOASOBI` 和 `Yoasobi`。
3. `Artist feat. B` 和 `Artist / B`。
4. 中文名和英文名混用。
5. 前后有空格。
6. 使用了不同标点。

建议先确定你希望使用哪种命名规则，再批量整理标签。

## Queue 播放队列

队列是临时的播放顺序。

### 队列适合

1. 今天临时想听的一批歌。
2. 临时把搜索结果排在一起。
3. 测试不同格式或不同采样率。
4. 快速插入下一首。

### 队列不适合

1. 长期收藏。
2. 主题歌单。
3. 需要跨设备或长期维护的列表。

长期内容请使用 `Playlists`。

### 使用建议

1. 临时听歌用队列。
2. 确定要长期保留时，再加入播放列表。
3. 测试音频设备时，可以建立一个专门播放列表，而不是每次手动排队。

## Liked 收藏

`Liked` 是快速收藏。

适合：

1. 标记常听歌曲。
2. 临时收集喜欢的歌。
3. 从收藏里快速开始播放。

不适合：

1. 复杂分类。
2. 多主题整理。
3. 专辑级结构管理。

复杂整理请用播放列表。

## History 历史

`History` 记录播放过的内容。

适合：

1. 找回刚才听过但忘记收藏的歌。
2. 回看最近播放顺序。
3. 排查某首歌是否反复出问题。
4. 确认某次播放是否真的进入下一首。

## Playlists 播放列表

播放列表适合长期整理。

### 推荐歌单类型

1. 日常精选。
2. 夜间听。
3. 工作背景。
4. 耳机测试。
5. 音箱测试。
6. 高解析测试。
7. 新专辑候选。
8. 车载同步。
9. 本地无损精选。
10. 某个艺人的精选。

### 队列和播放列表的区别

| 功能 | 适合 |
| --- | --- |
| Queue | 临时播放顺序 |
| Playlists | 长期保存和整理 |
| Liked | 快速标记喜欢 |
| History | 找回播放记录 |

## 播放控制

底部播放器是全局播放控制区。

### 常见控件

1. 播放 / 暂停。
2. 上一首 / 下一首。
3. 进度条。
4. 音量。
5. 当前歌曲标题、艺术家和封面。
6. 队列入口。
7. 歌词入口。
8. MV 入口。
9. 输出或状态提示。

### 播放异常排查

| 现象 | 先检查 |
| --- | --- |
| 点播放没声音 | 系统音量、应用音量、输出设备 |
| 进度不走 | 文件是否可解码、音频宿主是否启动 |
| 突然下一首 | 文件是否损坏、是否提前结束、是否有解码错误 |
| 进度跳动 | 输出模式、设备、播放诊断 |
| 切歌卡顿 | 是否同时扫描、下载、远程补全、插件重任务 |
| 某些文件不能播 | 文件格式、封装、损坏、FFmpeg 支持 |

不要看到播放问题就先重建数据库。播放链路和数据库不是一回事。

## 歌词

歌词体验包含显示、匹配、翻译、罗马音、假名增强、偏移和样式。

### 歌词来源

歌词可能来自：

1. 本地 LRC。
2. 嵌入式歌词。
3. 在线歌词候选。
4. 手动选择的候选。
5. 增强来源，例如日文假名或注音辅助。

### 歌词设置

常见设置：

| 设置 | 用途 |
| --- | --- |
| 歌词来源 | 控制从哪里找歌词 |
| 时间偏移 | 修正整体早晚 |
| 字体 | 调整歌词字体 |
| 字号 | 调整阅读大小 |
| 行宽限制 | 避免长句撑爆 |
| 翻译 | 显示辅助翻译 |
| 罗马音 | 给日文等内容提供读音辅助 |
| 假名增强 | 在可用时显示日文假名或注音 |
| 可读性增强 | 提高背景复杂时的歌词可读性 |

### 歌词不同步

| 情况 | 处理 |
| --- | --- |
| 全部歌词都晚一点 | 增加负向或正向偏移，按实际设置方向调整 |
| 只有某几句不准 | 可能是歌词文件本身时间轴不准 |
| 匹配到另一首 | 手动选择候选 |
| 现场版对不上 | 找现场版歌词或手动调整 |
| 翻译和原文不成对 | 来源数据质量问题 |

### 日文假名和罗马音

假名、罗马音是辅助文本，不应该替代主歌词时间轴。它们适合：

1. 日文学习。
2. 看不熟悉汉字读音。
3. 跟唱。
4. 辅助理解。

如果增强来源质量不好，宁可不显示，也不要破坏主歌词。

## MV

MV 功能围绕当前歌曲查找视频候选。

### MV 来源和候选

MV 可能来自 Bilibili、YouTube 或其它支持来源。匹配会依赖：

1. 歌曲标题。
2. 艺术家。
3. 专辑。
4. 平台搜索结果。
5. 候选标题。
6. 视频质量和编码。

### 质量选择

常见质量包括 720p、1080p、1080p 60fps、4K、4K 60fps、4K 120fps 等。实际可用质量由平台返回结果决定。

注意：

1. 高质量不一定能内嵌播放。
2. HEVC、HDR、Dolby Vision 等编码可能需要外部播放器。
3. Bilibili 某些高规格流可能浏览器不支持。
4. 自动选择不一定是你想要的版本。

### MV 不准怎么办

1. 手动选择候选。
2. 自定义 URL。
3. 修正歌曲标题和艺术家。
4. 对同名歌曲加上版本信息。
5. 接受部分歌曲需要手选，这是正常情况。

## 音频输出与 HiFi

音频输出是 ECHO NEXT 的重点之一，但也是最容易受设备环境影响的部分。

### 输出模式

| 模式 | 说明 | 适合 |
| --- | --- | --- |
| System | 使用系统默认输出 | 普通用户、快速排查 |
| WASAPI Shared | Windows 共享输出 | 日常稳定播放 |
| WASAPI Exclusive | 独占设备 | 更直接的设备输出 |
| ASIO | 专业声卡链路 | 声卡、录音设备、低延迟场景 |
| DirectSound | 兼容输出 | 特殊设备或排查 |

### 选择建议

1. 不确定时先用 System。
2. 想稳定日常播放，用 WASAPI Shared。
3. 想测试独占输出，再试 WASAPI Exclusive。
4. 有专业声卡，再试 ASIO。
5. 遇到异常先回到 System 或 Shared。

### bit-perfect

bit-perfect 代表信号尽量未经处理地输出。以下情况通常会破坏 bit-perfect：

1. EQ。
2. Preamp。
3. ReplayGain。
4. 变速。
5. 重采样。
6. 系统混音。
7. 某些设备驱动处理。

不要为了显示好看强行追求 bit-perfect。如果你需要 EQ 或响度统一，就接受信号被处理。

### 采样率

采样率状态可能涉及：

1. 文件采样率。
2. 解码输出采样率。
3. 请求输出采样率。
4. 设备实际采样率。
5. 共享模式设备采样率。

如果这些值不同，不一定是 bug。共享输出、系统混音、设备限制都会影响实际结果。

## EQ

EQ 用来调整声音风格。

### 基本原则

1. 从 Flat 开始。
2. 小幅调整。
3. 提升频段时降低 Preamp。
4. 不要所有频段一起大幅提升。
5. 每种设备保存单独预设。

### 频段理解

| 频段 | 大致影响 |
| --- | --- |
| 低频 | 鼓、贝斯、厚度 |
| 中低频 | 温暖感、浑厚感，也容易糊 |
| 中频 | 人声、吉他、主体 |
| 中高频 | 清晰度、齿音 |
| 高频 | 空气感、亮度，也容易刺 |

### 常见问题

| 问题 | 处理 |
| --- | --- |
| 声音爆或破 | 降低 Preamp |
| 低频太轰 | 降低低频或中低频 |
| 人声靠后 | 轻微提升中频 |
| 声音刺 | 降低中高频或高频 |
| 想验证原始输出 | 关闭 EQ 和 Preamp |

## ReplayGain 和响度

ReplayGain 用来让不同歌曲的响度更接近。

适合：

1. 随机播放不同专辑。
2. 混合播放不同年代音乐。
3. 播放来源复杂的曲库。
4. 夜间听歌避免忽大忽小。

不适合：

1. bit-perfect 验证。
2. 想保持每张专辑原始响度关系。
3. 专业对比测试。

## 播放速度

播放速度功能适合特殊场景，例如听播客、练习、Nightcore / Daycore 等。

注意：

1. 变速会改变音频处理链路。
2. 变速后不应视为 bit-perfect。
3. 如果播放异常，先恢复正常速度再排查。

## Remote 远程来源

远程来源用于访问不在本机磁盘上的音乐。

### 支持类型

| 类型 | 适合 |
| --- | --- |
| WebDAV / AList | 网盘、AList、支持 WebDAV 的服务 |
| Jellyfin | 自建媒体服务器 |
| Emby | 自建媒体服务器 |
| NAS / SMB | 局域网共享 |
| SSHFS | SSH 文件系统 |
| Subsonic / Navidrome | 音乐服务器 |

### 添加远程来源

一般流程：

1. 进入 `Cloud / Remote`。
2. 选择来源类型。
3. 填写显示名称。
4. 填写服务器地址。
5. 填写账号、密码或 token。
6. 选择同步模式。
7. 测试连接。
8. 保存。
9. 需要时开始索引。

### 同步模式

| 模式 | 说明 | 建议 |
| --- | --- | --- |
| 仅浏览 | 不写入曲库索引 | 临时访问 |
| 建立索引 | 写入远程曲目索引，播放时取流 | 推荐 |
| 镜像缓存 | 未来扩展，不默认复制整库 | 谨慎 |

### 远程后台任务

远程来源可能产生后台任务：

1. 元数据。
2. 封面。
3. 歌词。
4. MV。
5. 时长回填。

这些任务应当低优先级运行，尤其在播放中不要抢资源。

### 远程排查

| 现象 | 检查 |
| --- | --- |
| 连接失败 | 地址、账号、密码、证书、代理、防火墙 |
| 扫描慢 | 服务端速度、网络、文件数量 |
| 播放卡 | 网络带宽、服务端响应、正在后台任务 |
| 封面不显示 | 远程封面权限、缓存、后台任务 |
| 文件缺失 | 远程路径变化、服务端索引变化 |

## Connect 局域网播放

`Connect` 面向 DLNA、AirPlay 等局域网发现和播放能力。

### 使用前检查

1. 电脑和目标设备在同一局域网。
2. 路由器没有隔离设备。
3. 防火墙允许相关通信。
4. 安全软件没有拦截。
5. 多网卡环境下选择了正确网络。

### 发现不到设备

可能原因：

1. 设备不在同一网络。
2. 路由器开启 AP 隔离。
3. Windows 防火墙拦截。
4. 设备服务没启动。
5. 多网卡广播到了错误接口。

处理顺序：

1. 重启目标设备投放服务。
2. 确认网络。
3. 检查防火墙。
4. 刷新 ECHO NEXT。
5. 必要时重启应用。

## Streaming 流媒体搜索

`Streaming` 用于在线搜索、试听和发现候选。

### 搜索类型

| 类型 | 用途 |
| --- | --- |
| 单曲 | 找具体歌曲 |
| 专辑 | 找整张发行 |
| 歌手 | 找艺术家详情 |
| 歌单 | 找平台歌单 |

### 质量偏好

| 偏好 | 含义 |
| --- | --- |
| Max | 尽量最高 |
| 高音质 | 通常偏 320kbps |
| 标准 | 兼容优先 |
| 无损 | 优先 FLAC 等无损 |
| Hi-Res | 平台可用时尝试高解析 |

质量偏好不是保证。平台没有对应资源、账号权限不足、网络失败时，都可能回退或失败。

### 平台边界

1. NetEase、QQ Music 等更偏音乐来源。
2. Spotify 更偏账号、链接或外部生态能力。
3. SoundCloud 依赖平台公开资源。
4. Bilibili 更偏视频来源。
5. 任何平台都不承诺绕过会员或版权限制。

## Downloads 下载器

下载器用于 URL 下载、搜索下载和导入曲库。

### 页面能力

1. 粘贴 URL 下载。
2. 搜索 YouTube / Bilibili。
3. 查看任务状态。
4. 查看下载进度。
5. 查看速度和 ETA。
6. 取消任务。
7. 设置输出目录。
8. 检查 FFmpeg、yt-dlp 等工具状态。

### 任务状态

| 状态 | 含义 |
| --- | --- |
| queued | 排队 |
| probing | 解析链接 |
| downloading | 下载中 |
| extracting_audio | 提取音频 |
| importing | 导入曲库 |
| binding_mv | 绑定 MV |
| completed | 完成 |
| failed | 失败 |
| cancelled | 已取消 |

### 下载设置

| 设置 | 建议 |
| --- | --- |
| 音频策略 | 默认最佳可用 |
| 下载目录 | 选择空间充足、路径稳定的位置 |
| 导入曲库 | 想长期管理就开启 |
| 绑定 MV | 想保留视频来源就开启 |

### 下载失败排查

| 问题 | 检查 |
| --- | --- |
| 搜不到 | 平台搜索、网络、代理、关键词 |
| 解析失败 | URL 是否有效、平台是否限制 |
| 下载慢 | 网络、平台限速、代理 |
| 提取音频失败 | FFmpeg 是否可用 |
| 导入失败 | 输出文件是否存在、曲库路径权限 |

请确认内容来源合法。

## Plugins 插件

插件是受控扩展能力，不是随便执行任意脚本的后门。

### 插件目录

插件通常放在用户数据目录下的 `plugins/`。每个插件是独立文件夹，包含 manifest、脚本和可选面板。

典型结构：

```text
plugins/
  echo.example/
    echo.plugin.json
    plugin.js
    panel.html
    plugin-storage.json
```

### 启用流程

1. 打开 `Plugins`。
2. 创建示例插件或导入插件包。
3. 刷新插件列表。
4. 查看插件权限。
5. 确认可信后启用。
6. 出错时看插件日志。
7. 修改插件文件后重载。

### 示例插件类型

| 类型 | 说明 |
| --- | --- |
| 播放状态面板 | 监听播放状态，显示小面板 |
| 命令工具 | 注册手动执行命令 |
| 曲库脚本 | 读取曲库摘要，做轻量整理 |
| 自定义音源 | 返回搜索候选，并在播放时解析显式音频 URL |

### 权限说明

| 权限 | 能力 | 风险 |
| --- | --- | --- |
| `playback:read` | 读取播放状态 | 低 |
| `playback:control` | 播放、暂停、跳转 | 中 |
| `library:read` | 分页读取曲库公开字段 | 中 |
| `library:write` | 预留曲库写入能力 | 高 |
| `sources:provide` | 提供自定义音源候选和播放 URL | 中 |
| `settings:read` | 读取设置快照 | 中 |
| `settings:write` | 写入设置 | 高 |
| `network` | 访问外部网络 | 高 |
| `fs:plugin` | 读写插件目录数据 | 中 |

### 插件安全建议

1. 不要启用来源不明的高权限插件。
2. 不要让插件做大量同步计算。
3. 不要让插件扫描完整曲库。
4. 插件报错先禁用，再看日志。
5. 设置写入和曲库写入属于高风险权限。
6. 自定义音源只应返回合法 `http` / `https` 音频 URL，不应绕过平台授权或触碰本地文件系统。

启用自定义音源插件后，可以在 `Streaming` 页面选择“插件音源”进行搜索。ECHO 只在搜索和播放解析时调用插件，播放仍由宿主拿到显式音频 URL 后进入原有播放链路。

插件 v2 额外支持受控网络 API、歌词 provider、封面 provider 和插件自有设置。网络访问必须有 `network` 权限，并且只能通过宿主包装的 `echo.net.fetchJson/fetchText`；歌词、封面和音源都只返回候选，是否应用或播放由 ECHO 决定。插件包导入会记录校验信息，覆盖已有插件时会保留旧目录备份。

## Settings 设置

设置页内容很多，可以按模块理解。

### General

常见内容：

1. 语言。
2. 窗口行为。
3. 托盘行为。
4. 设置备份。
5. 自动备份。

建议开启自动备份，尤其是你经常调整设置、插件、远程来源或音频输出。

### Playback

管理播放相关内容：

1. 输出设备。
2. 输出模式。
3. 音频状态。
4. HQPlayer 相关设置。
5. 播放速度。
6. ReplayGain。
7. 当前播放诊断。

### Shortcuts

快捷键分两类：

| 类型 | 说明 |
| --- | --- |
| Local | 应用聚焦时生效 |
| Global | 应用不聚焦时也可能生效 |

常见动作：

1. 播放 / 暂停。
2. 上一首。
3. 下一首。
4. 停止。
5. 音量加减。
6. 快退快进。
7. 显示主窗口。
8. 老板键。
9. 速度调整。
10. 打开音频设置、MV 设置、歌词设置。

全局快捷键可能与系统或其它应用冲突。录制失败时换一个组合。

### Lyrics

歌词设置集中管理：

1. 歌词来源。
2. 时间偏移。
3. 字体。
4. 辅助文本。
5. 假名增强。
6. 可读性。

### MV

MV 设置管理：

1. 来源。
2. 质量。
3. 同步模式。
4. 外部播放。
5. 自定义视频。
6. 可读性增强。

### Integrations

集成能力可能包括：

1. Last.fm。
2. Discord Presence。
3. 账号。
4. YouTube 浏览器 cookie 来源。
5. 网络代理。
6. 自动更新。

代理模式通常有：

| 模式 | 说明 |
| --- | --- |
| 关闭 | 不使用代理 |
| 系统代理 | 跟随系统设置 |
| 手动代理 | 手动填写代理地址 |
| PAC | 使用 PAC 配置 |

代理会影响网络歌词、MV、流媒体、下载、元数据等功能。播放本地文件通常不需要代理。

### EQ

EQ 设置集中管理：

1. 开关。
2. 10-band 调节。
3. Preamp。
4. 内置预设。
5. 用户预设。
6. 保存、导入或恢复。

### Appearance

外观设置管理：

1. 主题。
2. 自定义颜色。
3. 字体。
4. 壁纸。
5. 视频背景。
6. 动效。
7. 圆角、透明度、模糊等视觉参数。

建议：

1. 先保证文字可读。
2. 再调整装饰效果。
3. 视频背景不应该影响播放稳定。
4. UI 字体和歌词字体分开处理。

### Library

曲库设置管理：

1. 本地文件夹。
2. 网络元数据。
3. 曲库质量。
4. 重复歌曲。
5. ReplayGain 分析。
6. BPM 分析。
7. 艺术家图片缓存。
8. 数据库保护。

数据库、缓存、扫描相关操作都要谨慎。

### About

通常包含：

1. 应用版本。
2. 项目链接。
3. 日志。
4. 诊断。
5. 崩溃信息。

反馈问题前建议先看这里是否有可导出的诊断信息。

### Danger

危险区可能包含：

1. 重建数据库。
2. 修复数据库。
3. 删除数据库。
4. 清理缓存。
5. 恢复默认设置。
6. 数据库快照或恢复。

原则：

1. 能备份先备份。
2. 能小范围修复就不要全量重建。
3. 播放问题不要第一时间动数据库。
4. 不确定影响范围时先停手。

## 外观和桌面体验

### 字体

字体分两类：

| 类型 | 重点 |
| --- | --- |
| 应用 UI 字体 | 可读性、布局稳定 |
| 歌词字体 | 观感、沉浸、舞台感 |

不要为了歌词效果把整个应用 UI 字体改得难读。

### 壁纸和视频背景

壁纸和视频背景适合增强氛围，但要注意：

1. 视频背景会消耗渲染资源。
2. 最小化或隐藏时应该减少开销。
3. 播放卡顿时先关闭视频背景排查。
4. 低性能设备不要使用太重的视频背景。

## 网络元数据

网络元数据是补全，不是真相。

优先级建议：

1. 手动整理。
2. 嵌入式标签。
3. sidecar 或文件夹信息。
4. 网络候选。
5. 文件名 fallback。

网络元数据适合：

1. 缺标题。
2. 缺艺术家。
3. 缺专辑。
4. 缺年份。
5. 缺封面。

不适合：

1. 覆盖你手动整理过的字段。
2. 覆盖嵌入式高可信标签。
3. 盲目批量套用低分候选。

## 备份和安全

建议备份：

1. 设置。
2. 曲库数据库。
3. 插件目录。
4. 重要播放列表。
5. 长期整理过的音乐文件标签。

高风险操作前，至少确认：

1. 影响范围是什么。
2. 是否会删除文件。
3. 是否只影响缓存。
4. 是否能恢复。
5. 是否有备份。

## 常见排查路线

### 播放没有声音

1. 检查系统音量。
2. 检查 ECHO NEXT 音量。
3. 检查输出设备。
4. 切回 System 输出。
5. 换一首确定正常的 MP3 或 FLAC。
6. 关闭 EQ、ReplayGain、变速。
7. 查看音频状态和日志。

### 某首歌播放失败

1. 用其它播放器播放同一文件。
2. 检查文件是否损坏。
3. 检查格式是否特殊。
4. 看是否只有这首失败。
5. 看日志是否有解码错误。
6. 必要时重新导入或重新读取标签。

### 曲库显示不对

1. 检查源文件标签。
2. 检查是否扫描完成。
3. 检查是否添加了重复目录。
4. 检查网络元数据是否覆盖了预期字段。
5. 重新读取嵌入式标签。
6. 不要一上来清空数据库。

### 封面不对

1. 检查文件嵌入封面。
2. 检查文件夹封面。
3. 检查同一专辑每首歌封面是否一致。
4. 清理或刷新封面缓存前先确认影响范围。

### 歌词不准

1. 看是否匹配到错误版本。
2. 手动选择候选。
3. 调整时间偏移。
4. 修正歌曲标题和艺术家。
5. 检查是否现场版、翻唱、剪辑版。

### MV 不准

1. 手动选择候选。
2. 自定义 URL。
3. 修正元数据。
4. 检查平台搜索结果。
5. 接受部分歌曲需要手动绑定。

### 远程来源连接失败

1. 检查地址。
2. 检查账号和密码。
3. 检查证书。
4. 检查代理。
5. 检查服务端日志。
6. 检查防火墙。

### 下载失败

1. 检查 URL。
2. 检查平台是否限制。
3. 检查 FFmpeg 和 yt-dlp。
4. 检查代理。
5. 检查输出目录权限。
6. 检查磁盘空间。

## 反馈问题时请带什么

有效反馈最好包含：

1. ECHO NEXT 版本。
2. 操作系统版本。
3. 安装版、便携版还是开发模式。
4. 问题发生页面。
5. 复现步骤。
6. 预期行为。
7. 实际行为。
8. 截图。
9. 日志或诊断报告。
10. 如果是播放问题，附输出模式、设备、音频格式和是否只影响某些文件。
11. 如果是扫描问题，附文件夹类型、本地盘还是远程盘、失败路径。
12. 如果是网络问题，附代理模式、来源类型和服务端返回信息。

只说“不能用”“不好用”“卡了”通常很难修。越接近真实操作链路，越容易定位。

---

# Beginner Setup

Source: src/content/docs/en/docs/zero-basics.md
Kind: starlight-doc
Locale: en-US
URL: /en/docs/zero-basics/
Description: A very basic path from opening Windows to downloading, installing, launching, importing a small folder, and playing the first track.

This page is the most basic setup path for ECHO Next on Windows. It is intentionally simple: open the computer, download the installer from the official source, install the app, import a small music folder, and play one track before changing advanced settings.

## Before You Start

Confirm these items first:

| Item | Check |
| --- | --- |
| System | Windows 10 or Windows 11 |
| Network | Web pages open normally |
| Storage | Enough space for the installer and app |
| Audio | Speakers, headphones, or a DAC are connected |
| Music files | A few known-good MP3 or FLAC files |

Do not import an entire drive for the first test. Use a small folder first.

## 1. Open Windows

1. Turn on the computer.
2. Log in to Windows.
3. Wait until the desktop is fully loaded.
4. Confirm the network is connected.
5. Open Edge, Chrome, or another browser.

## 2. Download ECHO Next

Open the [download page](/en/download/) and choose the Windows installer for normal daily use.

Use only the official website or [GitHub Releases](https://github.com/Moekotori/ECHO/releases). Avoid third-party mirrors or forwarded files.

After the download completes, open the downloaded file from the browser download list or the Windows `Downloads` folder.

## 3. Install

1. Double-click the `.exe` installer.
2. Confirm the Windows permission prompt after checking the source.
3. Keep the default install location unless you have a specific reason to change it.
4. Wait for installation to finish.
5. Launch ECHO Next from the installer or the Start menu.

If Windows SmartScreen appears, continue only when the file came from the official website or GitHub Releases.

## 4. Import A Small Test Folder

Create a small folder such as:

```text
D:\Music\Test
```

Put 5 to 20 known-good tracks in it. MP3 is best for the first playback test; FLAC is useful for checking metadata and artwork.

In ECHO Next:

1. Use the import folder entry.
2. Select the small test folder.
3. Wait for scanning to start and finish.
4. Open the `Songs` page.
5. Confirm the tracks appear.

## 5. Play The First Track

1. Open `Songs`.
2. Double-click a known-good MP3.
3. Check that the bottom player shows the track.
4. Check that the progress bar moves.
5. Confirm that you hear sound.

If the progress bar moves but there is no sound, check Windows volume, ECHO volume, the selected output device, and switch ECHO back to the system output before trying advanced modes.

## 6. Import The Full Library Later

Only import your full library after the small folder works. Large libraries can take time because ECHO reads files, metadata, duration, artwork, and album information.

Keep external drives connected during scanning, and do not select the entire system drive as a music folder.

## What To Read Next

| Goal | Page |
| --- | --- |
| Install details | [Install and Download](./install/) |
| First-use workflow | [Quick Start](./quick-start/) |
| Full user guide | [User Guide](./user-guide/) |
| Audio troubleshooting | [Audio Output](./audio-output/) |
| Common issues | [FAQ](./faq/) |

---

# ECHO 提问与排错指南

Source: src/content/docs/zh/docs/ai-question-guide.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/ai-question-guide/
Description: 反馈 ECHO 问题前应该准备什么、怎么导出报错、哪些提问不会被处理。

这页不是客套模板，而是为了让问题能被定位。ECHO 的问题如果只靠口头描述，通常没有排查价值；截图、报错、日志、版本、复现步骤才是证据。

如果你只是想快速知道“遇到问题到底该发什么”，先看 [如何解决问题](./how-to-solve-problems/)。

如果你要向维护者、开发者或 AI 提问，也建议先读外部参考：[《别像弱智一样提问》](https://github.com/tangx/Stop-Ask-Questions-The-Stupid-Ways/blob/master/README.md)。ECHO 文档不会复刻那篇文章全文，但采用同一个原则：不要让别人猜上下文，直接给事实、证据、复现步骤和你已经尝试过的内容。

## 先说结论

请先记住这几条：

- “某某功能怎么用”“某某怎么关掉”“为什么不能用”这类没有上下文的问题会被无视。
- 只说“卡了”“坏了”“闪退了”“没声音”“你自己看着修”没有意义。
- 口头论述是最没用的。请给截图、原始报错、日志、版本号和复现步骤。
- 如果你要反馈 bug，请先去 `设置 -> 通用` 打开控制台，然后把报错导出或复制出来。
- 不要一边描述一边猜根因。把你看到的事实给出来，判断交给排查的人。

## 先打开控制台并导出报错

遇到崩溃、白屏、按钮无效、播放异常、曲库扫描异常、远程源连接失败、插件异常时，先做这件事：

1. 打开 ECHO。
2. 进入 `设置 -> 通用`。
3. 打开控制台或调试控制台相关开关。
4. 回到出问题的页面，重新执行一次会触发问题的操作。
5. 在控制台里复制报错，或使用导出/复制报告功能把报错发出来。

如果只说“我这里报错了”，但不发报错原文，基本无法判断。报错里的文件名、错误码、请求地址、设备名、音频格式、扫描阶段都可能是关键线索。

## 会被无视的问题

下面这类问题信息量太低，不适合作为反馈：

| 不要这样问 | 为什么没用 |
| --- | --- |
| `xxx 功能怎么用？` | 不知道你在哪个页面、想完成什么、已经点到哪一步。 |
| `xxx 怎么关掉？` | 不知道你说的是设置项、弹窗、播放效果、插件、远程源还是系统行为。 |
| `ECHO 不能用。` | “不能用”不是现象，无法判断是安装、网络、播放、曲库还是设置问题。 |
| `播放坏了。` | 没有文件格式、输出模式、设备、进度条状态和错误信息。 |
| `扫描卡死。` | 没有曲库规模、路径类型、卡住阶段和日志。 |
| `你们自己试一下。` | 你本机环境、文件、设备、账号、网络都可能不同，必须给复现条件。 |

如果确实是使用问题，请至少说明你想完成的结果。例如：“我想关闭桌面歌词”“我想关掉自动扫描”“我想让播放输出回到系统默认设备”。这比只问“怎么关”有用得多。

## 最小可用反馈模板

复制下面这段，把空白处补全。补不全也要写“未知”，不要留空。

```text
ECHO 版本：
系统版本：
安装渠道：
问题页面/功能：

我想做什么：

复现步骤：
1.
2.
3.

预期结果：

实际结果：

错误提示/控制台报错：

我已经试过：

截图或录屏说明：
```

如果你想让 AI 帮你整理反馈，可以直接把上面内容发给 AI，并要求它“不要猜测根因，只整理事实、复现步骤和缺失信息”。

## 播放和音频问题必须补充

播放问题不要只说“没声音”。请补充：

- 输出设备，例如主板声卡、USB DAC、蓝牙耳机、HDMI、虚拟声卡。
- 输出模式，例如 System、WASAPI Shared、WASAPI Exclusive、ASIO、HQPlayer、DLNA。
- 文件类型和参数，例如 MP3、FLAC、DSD、采样率、位深、声道数。
- 进度条是否在走。
- Windows 其它播放器播放同一首歌是否正常。
- 是否开启 EQ、DSP、ReplayGain、变速、声道平衡、重采样、Crossfade 或 Automix。
- 控制台报错原文。

一个有用的描述应该像这样：

```text
ECHO 版本：26.x.x
系统：Windows 11
输出设备：USB DAC，Windows 其它播放器正常
输出模式：WASAPI Exclusive
文件：本地 FLAC，44.1 kHz / 16-bit
现象：进度条会走，但没有声音
已尝试：切回 System 有声音；关闭 EQ/DSP 后仍无声
控制台报错：……
```

## 曲库和扫描问题必须补充

曲库问题请补充：

- 是首次导入、增量扫描、重扫，还是远程同步。
- 路径类型：本地 SSD、移动硬盘、NAS、WebDAV、Jellyfin、Emby、Subsonic、云盘。
- 大约多少首歌、多少张专辑。
- 卡在哪个阶段，例如枚举文件、读取标签、提取封面、写入索引。
- 是否存在超大封面、损坏文件、特殊字符路径、非常规标签。
- 控制台报错原文。

首次导入大曲库慢不一定是 bug。ECHO 需要读取标签、封面、时长、编码信息并写入索引。请先用 3 到 10 首歌的小文件夹验证基础功能，再反馈完整曲库的问题。

## 远程源、云盘和插件问题必须补充

远程相关问题请说明：

- 服务类型：WebDAV、Jellyfin、Emby、Subsonic、NAS、云盘、网络电台或插件。
- 是连接失败、目录打不开、搜索失败、还是能浏览但不能播放。
- 浏览器或其它客户端能否访问同一账号。
- 是否经过代理、公司网络、校园网、内网穿透或自签名证书。
- 控制台报错原文，尤其是 HTTP 状态码、请求地址、证书错误和鉴权错误。

不要要求 ECHO 或 AI 帮你绕过会员、版权、访问控制或平台限制。ECHO 不提供盗链、侵权来源、绕权下载或规避授权的支持。

## 提问时要区分事实和猜测

推荐写法：

```text
确定事实：
- 我点击了“测试连接”。
- 页面显示“连接失败”。
- 控制台出现这段报错：……

我的猜测：
- 可能和证书有关，但不确定。

我需要：
- 请先根据报错判断最可能原因。
- 请按低风险到高风险给排查步骤。
- 不要建议删除曲库或重装，除非说明为什么必须这样做。
```

不推荐写法：

```text
应该是 ECHO 的网络模块坏了，你们修一下。
```

## 排错顺序

安全排错优先，不要上来就清库、删配置或重装。

1. 记录当前现象，截图或录屏。
2. 打开 `设置 -> 通用` 的控制台，复现一次问题。
3. 导出或复制报错。
4. 用小范围样本复现，例如一首歌、一个小文件夹、一个远程目录。
5. 只改一个设置，再观察变化。
6. 最后才考虑重置、清缓存、重扫、重装。

如果问题涉及账号、曲库、数据库、插件配置或远程源，不要听到一个建议就立刻删除数据。先确认是否可撤销，必要时备份。

## 最短可用版本

赶时间时，至少发这段：

```text
ECHO 版本：……
系统：……
问题页面/功能：……
我想做什么：……
实际发生了什么：……
复现步骤：……
设置 -> 通用 打开控制台后导出的报错：……
我已经试过：……
请按低风险到高风险排查，区分确定事实和推测原因。
```

---

# AirPlay 支持边界

Source: src/content/docs/zh/docs/airplay-connect.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/airplay-connect/
Description: ECHO 当前 AirPlay 1 / RAOP 兼容链路、AirPlay 2 不支持声明，以及局域网排障建议。

这页讲清楚 ECHO 对 AirPlay 的支持边界，避免把 Apple 生态里不同代际、不同设备、不同协议层的能力混在一起。

## 先说结论

ECHO 当前按 **AirPlay 1 / RAOP 兼容链路** 维护 AirPlay 能力。

ECHO **暂不支持 AirPlay 2**。AirPlay 2 涉及新的配对、控制、同步、多房间、设备能力协商和 Apple 生态特性，不能把 AirPlay 1 能连上等同于 AirPlay 2 已支持。

如果你的设备、系统或使用场景只接受 AirPlay 2，或者依赖 HomePod 多房间、Apple TV 同步、隔空播放 2 专有能力，当前不属于 ECHO 支持范围。

## ECHO 当前支持什么

ECHO 的 AirPlay 能力面向局域网内的 AirPlay 1 / RAOP 兼容播放链路。实际入口以应用内 `Connect` 页面和相关设置显示为准。

当前可以按这些边界理解：

- 用于同一局域网内的兼容 AirPlay 1 / RAOP 音频链路。
- 适合先用普通音频、稳定网络、默认音频设置做验证。
- 设备发现、连接、播放状态和控制能力会受发送端、接收端、系统防火墙、路由器和协议兼容性影响。
- ECHO 会尽量给出连接状态和错误信息，但不能保证所有 Apple 或第三方设备都完整兼容。

AirPlay 不是蓝牙，也不是本机独占输出。不要把 AirPlay 问题和 WASAPI Exclusive、ASIO、DSD、蓝牙编码混在一起排查。

## 暂不支持 AirPlay 2

以下能力不要按已支持理解：

- AirPlay 2 多房间同步。
- HomePod / Apple TV 专有 AirPlay 2 行为。
- AirPlay 2 级别的配对、加密、会话恢复和设备协同。
- 屏幕镜像、视频镜像或系统级投屏。
- Apple Music、FairPlay、DRM、会员内容或平台权限绕过。
- 把 ECHO 当作 Apple 官方 AirPlay 2 设备的完整替代品。

如果日志或界面里出现 AirPlay 相关字样，也不代表 AirPlay 2 已完成。ECHO 公开维护边界仍然是 AirPlay 1 / RAOP 兼容路径。

## 推荐测试方式

第一次测试 AirPlay 时，按这个顺序来：

1. ECHO 电脑和 AirPlay 设备在同一个家庭局域网。
2. 关闭 VPN、代理、访客网络和 AP 隔离。
3. Windows 网络类型设为专用网络。
4. 允许 ECHO / Electron / Node 通过 Windows 防火墙访问专用网络。
5. 先用普通 MP3 或 FLAC。
6. 先关闭 EQ、ReplayGain、变速、重采样和其它高级处理。
7. 确认基础播放正常后，再测试 AirPlay。

如果同一个设备在其它 App 里也不稳定，优先排查设备固件、路由器、Apple 设备系统版本和局域网环境。

## 常见问题

### 能不能保证所有 iPhone、iPad、Mac、Apple TV 都能用？

不能。Apple 系统版本、设备型号、网络环境、协议兼容性和第三方实现差异都会影响结果。ECHO 只承诺按当前 AirPlay 1 / RAOP 兼容边界维护。

### 为什么别的软件能连，ECHO 不行？

有些软件使用的是厂商私有实现、系统级能力或 AirPlay 2 能力。ECHO 不会为了模拟闭源私有行为去做高风险兼容。

### AirPlay 没声应该先查什么？

先查网络和协议边界，不要一上来改独占输出：

1. 确认设备同网段。
2. 关闭 VPN / 代理。
3. 放行防火墙。
4. 重启 AirPlay 相关设备。
5. 换普通 MP3。
6. 回到 ECHO 默认音频设置。

仍然失败时，反馈请附 ECHO 版本、Windows 版本、发送端设备和系统版本、网络环境、截图和日志。

---

# API 凭据配置教程

Source: src/content/docs/zh/docs/api-credentials.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/api-credentials/
Description: 详细说明 Spotify、TIDAL、Discogs、Bandsintown、Ticketmaster、SeatGeek 的 Client ID、Secret、token、apikey 和地区过滤该怎么填，以及从哪里获得。

ECHO 的 `开发者 / API 配置` 页面是给进阶用户准备的。它主要用于账号授权、在线元数据、专辑评分、艺人资料和演出信息查询；不影响本地音乐播放，也不会提供任何绕过平台规则的下载能力。

如果你只是扫描本地曲库、播放本地音频、调 EQ/DSP，这一页可以完全不填。需要 Spotify 登录、TIDAL catalog 元数据、Discogs 评分，或者想让在线歌手信息更完整时，再按本教程逐项配置。

## 新手最短路线

不想一次性研究所有字段，可以按这个顺序来：

1. 只用 Spotify：只填 `Spotify Client ID`，并把 Spotify 后台的 Redirect URI 配好。
2. 只查 TIDAL 元数据：填 `TIDAL Client ID`、`TIDAL Client Secret`、`TIDAL Country Code`。
3. 只想补 Discogs 专辑评分：只填 `Discogs personal access token`。
4. 只想补演出/艺人信息：按你能申请到的来源填写 `Bandsintown app_id`、`Ticketmaster apikey`、`SeatGeek client_id`，没有就留空。
5. 不确定某个字段：先留空。ECHO 会跳过对应来源，不会让本地播放坏掉。

## 字段总览

| ECHO 字段 | 要填的值 | 获取位置 | 留空影响 |
| --- | --- | --- | --- |
| `Spotify Client ID` | Spotify Developer App 的 `Client ID` | [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) | 无法完成 Spotify 登录 |
| `Spotify Redirect URI` | ECHO 页面显示的完整回调地址 | ECHO 自动显示，默认 `http://127.0.0.1:43879/spotify/callback` | 地址不一致会导致登录失败 |
| `TIDAL Client ID` | TIDAL Developer App 的 `Client ID` | [TIDAL Developer Portal](https://developer.tidal.com/) | TIDAL 元数据来源不可用 |
| `TIDAL Client Secret` | TIDAL Developer App 的 `Client Secret` | TIDAL App 详情页 | TIDAL 元数据来源不可用 |
| `TIDAL Redirect URI` | ECHO 页面显示的完整回调地址 | ECHO 自动显示，默认 `http://127.0.0.1:43880/tidal/callback` | 做 OAuth 时必须一致 |
| `TIDAL Country Code` | 两位国家/地区代码，例如 `US`、`HK`、`JP` | 自己按账号地区或目标曲库地区填写 | 可能查不到部分地区 catalog |
| `Discogs personal access token` | Discogs 个人访问 token | [Discogs Developers 设置页](https://www.discogs.com/settings/developers) | Discogs 评分/版本资料不可用或受限 |
| `Bandsintown app_id` | Bandsintown API 的 `app_id` / app 标识 | Bandsintown API 或开发者/合作方入口 | 跳过 Bandsintown 来源 |
| `Ticketmaster apikey` | Ticketmaster API Key，后台常叫 `Consumer Key` | [Ticketmaster Developer Portal](https://developer.ticketmaster.com/) | 跳过 Ticketmaster 来源 |
| `SeatGeek client_id` | SeatGeek API 的公开 key / `client_id` | [SeatGeek Developer Portal](https://developer.seatgeek.com/) | 跳过 SeatGeek 来源 |
| `地区过滤` | 地区关键词，例如 `HK, Tokyo, US` | 自己按常看的演出地区填写 | 留空表示尽量查全球结果 |

## 填写前先确认

### 哪些是敏感信息

这些不要截图公开，也不要发到群聊、论坛、issue 或公开仓库：

- `TIDAL Client Secret`
- `Discogs personal access token`
- `Ticketmaster apikey`
- 任何服务后台显示的 `secret`、`token`、`private key`

`Client ID` 通常没有 `Client Secret` 那么敏感，但也不建议随便公开。尤其不要使用网上流传的别人 TIDAL/Spotify 凭据，可能失效，也可能违反平台规则。

### 为什么回调地址是 127.0.0.1

`127.0.0.1` 是本机地址。OAuth 登录完成后，浏览器会把授权结果发回你电脑上正在监听的 ECHO，不会发到互联网上。

回调地址必须逐字一致，包括：

- `http` 或 `https`
- `127.0.0.1`
- 端口号，例如 `43879`
- 路径，例如 `/spotify/callback`
- 结尾是否有斜杠

如果 ECHO 显示的是：

```text
http://127.0.0.1:43879/spotify/callback
```

就不要在后台填成：

```text
http://localhost:43879/spotify/callback
http://127.0.0.1:43879/spotify/callback/
https://127.0.0.1:43879/spotify/callback
```

这些看起来差不多，但对 OAuth 来说都不是同一个地址。

## Spotify OAuth 配置

Spotify 用于 Spotify 账号登录、Spotify 相关资料读取、播放控制或 Spotify Connect/Web Playback 相关能力。ECHO 只需要你自己的 `Client ID`，不要填写 Spotify 的 `Client Secret`。

### 你需要准备

- 一个 Spotify 账号。
- 可以打开 Spotify Developer Dashboard 的浏览器环境。
- ECHO 设置页显示的 Spotify Redirect URI。
- 如果要播放 Spotify 内容，账号和地区权限仍然要符合 Spotify 自己的要求。

### 创建 Spotify App

1. 打开 [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)。
2. 登录你的 Spotify 账号。
3. 点击 `Create app`。
4. `App name` 可以填 `ECHO Next Local`。
5. `App description` 可以填 `Personal local music client`。
6. `Website` 如果必填，可以填 ECHO 项目主页或留一个你自己的说明页；如果后台允许留空，可以不填。
7. `Redirect URI` 填 ECHO 页面显示的地址，默认是：

```text
http://127.0.0.1:43879/spotify/callback
```

8. 勾选开发者条款并创建 App。
9. 进入 App 详情页，找到 `Client ID`。
10. 复制 `Client ID`，回到 ECHO 粘贴到 `Spotify Client ID`。
11. 点击 `保存 Spotify 配置`。
12. 回到 Spotify 账号登录入口，重新登录。

### Spotify 后台应该填哪里

在 Spotify App 页面里找 `Settings` 或 `Edit Settings`：

- `Redirect URIs`：添加 ECHO 显示的回调地址。
- `Client ID`：复制到 ECHO。
- `Client Secret`：ECHO 不需要，不要填到 ECHO，也不要分享。

Spotify 官方对 Redirect URI 有更严格的校验。本地地址应使用明确的 loopback IP，例如 `127.0.0.1`；不要为了好看改成 `localhost`。

### Spotify Development Mode

新建 Spotify App 可能处于 Development Mode。这个模式下：

- App 默认只能给开发/测试用户使用。
- 未加入测试用户列表的账号可能登录失败，或登录后 API 请求失败。
- 如果你只是自己使用自己的 Spotify App，一般不需要额外处理。
- 如果要让别人使用你的 Client ID，需要在 Spotify Dashboard 的 Users Management 里添加对方 Spotify 邮箱。
- 如果要公开给大量用户，需要按 Spotify 的流程申请更高额度或公开访问。

### Spotify 常见错误

`INVALID_CLIENT: Invalid redirect URI`  
回调地址不匹配。复制 ECHO 页面里的 `Redirect URI`，完整粘贴到 Spotify App 的 `Redirect URIs`，保存后再试。

`The user is not registered for this application`  
当前 Spotify 账号没有被加入这个 Developer App 的测试用户。用自己的 App 登录，或让 App 拥有者把你的 Spotify 邮箱加入 Users Management。

登录后仍然不能播放  
这通常不是 Client ID 填错，而是 Spotify Premium、地区版权、设备可用性、Spotify Connect/Web Playback 限制等问题。

## TIDAL Developer 配置

TIDAL 配置用于 catalog 元数据搜索。这里说的 catalog 是专辑、曲目、艺人等元数据，不代表 ECHO 会接入或下载 TIDAL 播放流。

### 你需要准备

- 一个 TIDAL 账号。
- 可以访问 TIDAL Developer Portal。
- ECHO 设置页显示的 TIDAL Redirect URI。
- 目标 catalog 的国家/地区代码。

### 创建 TIDAL App

1. 打开 [TIDAL Developer Portal](https://developer.tidal.com/)。
2. 使用 TIDAL 账号登录。
3. 如果首次进入，按页面提示接受开发者指南/条款。
4. 进入 Dashboard。
5. 创建一个 App。名称可以填 `ECHO Next Local`。
6. 创建后进入 App 详情页。
7. 找到 `Client ID`，复制到 ECHO 的 `TIDAL Client ID`。
8. 找到 `Client Secret`，复制到 ECHO 的 `TIDAL Client Secret`。
9. 在 App 设置或 Redirect URI 设置里添加 ECHO 显示的回调地址，默认是：

```text
http://127.0.0.1:43880/tidal/callback
```

10. 回到 ECHO，确认 `TIDAL Redirect URI` 和后台完全一致。
11. `Country Code` 填两位国家/地区代码。
12. 点击 `保存 TIDAL 配置`。

### TIDAL Country Code 怎么选

`Country Code` 影响 TIDAL catalog 查询结果。常见示例：

```text
US
HK
JP
GB
DE
FR
CN
```

建议这样选：

- 你的 TIDAL 账号主要在哪个地区使用，就先填哪个地区。
- 想查国际曲库，先用 `US`。
- 想查香港常见内容，填 `HK`。
- 想查日本内容，填 `JP`。
- 查不到某些专辑时，可以换一个地区再试，因为不同地区 catalog 可用性不同。

### TIDAL 常见错误

保存后搜索没有结果  
先检查 `Client ID` 和 `Client Secret` 是否来自同一个 TIDAL App，再检查 `Country Code` 是否是两位大写代码。

提示认证失败或 unauthorized  
通常是 `Client Secret` 复制错、凭据被重置、App 没保存成功，或者复制时多了空格。

找不到 Client Secret  
TIDAL 后台可能会隐藏 Secret。通常需要点击显示按钮，或输入 TIDAL 账号密码确认后才能查看。

## Discogs 专辑评分

Discogs token 用于查询 Discogs 的专辑、版本、评分等辅助资料。没有 token 时，ECHO 仍然可以播放和管理本地音乐，只是 Discogs 来源不可用或更容易被限流。

### 获取 Personal Access Token

1. 登录 [Discogs](https://www.discogs.com/)。
2. 打开 [Discogs Developers 设置页](https://www.discogs.com/settings/developers)。
3. 找到 `Personal access token`。
4. 如果页面提供生成按钮，生成一个新的 token。
5. 复制 token。
6. 回到 ECHO，粘贴到 `Discogs personal access token`。
7. 点击 `保存 Discogs Token`。

### Discogs 这里不要填什么

不要填这些：

- `Consumer Key`
- `Consumer Secret`
- OAuth 回调地址
- Discogs 密码

ECHO 这个字段要的是 `Personal access token`。它适合个人本地使用，不需要你额外实现完整 OAuth 流程。

### Discogs 常见错误

查不到评分  
可能是专辑名、艺人名、版本信息不够准确；也可能 Discogs 没有对应条目。

401 或认证失败  
token 复制错、token 被撤销，或者粘贴时多了空格。重新生成 token 再保存。

结果很慢或偶尔失败  
Discogs 有接口限制。等待一会儿再查，或者减少批量查询频率。

## 在线歌手/演出信息

这一组用于补充艺人资料、巡演和演出信息。全部是可选项。一个来源不可用时，ECHO 可以跳过它继续尝试其它来源。

### Bandsintown app_id

`Bandsintown app_id` 是 Bandsintown API 用来识别调用方的 app 标识。不同入口显示的名字可能不完全一样，可能叫：

- `app_id`
- `App ID`
- `API key`
- 合作方提供的 app 标识

如果你有 Bandsintown API 权限：

1. 登录 Bandsintown 的开发者、合作方或 API 管理入口。
2. 找到你的应用或 API 凭据。
3. 复制 `app_id`。
4. 回到 ECHO，填入 `Bandsintown app_id`。
5. 保存配置。

如果你没有 Bandsintown API 权限，直接留空即可。ECHO 会跳过 Bandsintown，不影响 Spotify、TIDAL、Discogs 或其它演出来源。

### Ticketmaster apikey

Ticketmaster Discovery API 使用 `apikey` 查询参数。Ticketmaster Developer Portal 里常见的字段名是 `Consumer Key`，它就是 ECHO 这里要填的 `Ticketmaster apikey`。

1. 打开 [Ticketmaster Developer Portal](https://developer.ticketmaster.com/)。
2. 注册或登录开发者账号。
3. 进入 `My Apps`、`Applications` 或类似页面。
4. 创建一个 Application，或打开默认生成的 Application。
5. 找到 `Consumer Key`。
6. 复制 `Consumer Key`。
7. 回到 ECHO，粘贴到 `Ticketmaster apikey`。
8. 点击保存。

不要把 `Consumer Secret` 填到 `Ticketmaster apikey`。如果 Ticketmaster 页面同时显示多个 key，优先找用于 Discovery API 请求的 `Consumer Key`。

### SeatGeek client_id

SeatGeek API 请求可以通过 `client_id` 查询参数携带公开 key。ECHO 这里只需要公开 `client_id`，不要求填写 `client_secret`。

1. 打开 [SeatGeek Developer Portal](https://developer.seatgeek.com/)。
2. 注册或登录账号。
3. 按页面要求申请 API access 或创建应用。
4. 找到公开 key、public key 或 `client_id`。
5. 复制到 ECHO 的 `SeatGeek client_id`。
6. 保存配置。

如果 SeatGeek 页面只给了申请入口，说明你的账号可能还没有开通 API access。先提交申请；没申请到之前保持留空。

## 地区过滤怎么填

`地区过滤` 用于减少在线演出/艺人资料的噪音。它和 `TIDAL Country Code` 不是同一个东西：

- `TIDAL Country Code`：影响 TIDAL catalog 元数据查询。
- `地区过滤`：影响在线歌手/演出信息的筛选。

可以填国家代码、城市名或常用地区关键词，多个值用英文逗号分隔：

```text
HK, Tokyo, US
```

常见填法：

| 想看的范围 | 推荐填写 |
| --- | --- |
| 香港附近 | `HK` |
| 东京/日本 | `Tokyo, JP` |
| 美国 | `US` |
| 欧美都想看 | `US, GB, DE, FR` |
| 尽量查全 | 留空 |

不要填太多太散的关键词。地区过滤越宽，结果越多，也越容易混入无关演出；过滤越窄，结果更干净，但可能漏掉数据。

## 填完以后怎么验证

### Spotify

1. 保存 Spotify 配置。
2. 重新点击 Spotify 登录。
3. 浏览器打开授权页。
4. 授权后能回到 ECHO，说明 Redirect URI 基本正确。
5. 如果登录页直接报错，优先检查 Redirect URI。

### TIDAL

1. 保存 TIDAL 配置。
2. 找一首常见歌曲或专辑重新触发在线元数据查询。
3. 如果完全没有结果，先换 `Country Code` 为 `US` 再试。
4. 如果提示认证失败，重新复制 `Client Secret`。

### Discogs

1. 保存 Discogs Token。
2. 找一张 Discogs 上肯定存在的专辑。
3. 重新触发元数据/评分查询。
4. 如果失败，重新生成 Personal access token。

### 在线歌手信息

1. 至少填一个来源，例如 Ticketmaster 或 SeatGeek。
2. 地区过滤先填一个简单值，例如 `HK` 或 `US`。
3. 清理艺人资料缓存后重新查询。
4. 如果没有结果，先留空地区过滤，确认是不是过滤太窄。

## 常见填错对照表

| 现象 | 最可能原因 | 处理方式 |
| --- | --- | --- |
| Spotify 报 `Invalid redirect URI` | 回调地址不完全一致 | 复制 ECHO 的 Redirect URI 到 Spotify 后台 |
| Spotify 报用户未注册 | Development Mode 用户限制 | 在 Spotify Users Management 添加账号 |
| TIDAL unauthorized | Secret 错、凭据不是同一个 App、复制多了空格 | 重新复制 Client ID/Secret |
| TIDAL 查不到内容 | `Country Code` 地区无此 catalog | 换 `US`、`HK`、`JP` 试 |
| Discogs 401 | token 错或失效 | 重新生成 Personal access token |
| Ticketmaster 401 | `apikey` 填错 | 填后台的 `Consumer Key` |
| SeatGeek 没结果 | `client_id` 无效或未开通 API | 检查 API access，或先留空 |
| 演出结果太乱 | 地区过滤太宽 | 填更具体的城市/国家代码 |
| 演出结果为空 | 地区过滤太窄 | 清空地区过滤再试 |

## 建议的最终配置

自己本地使用，比较稳妥的配置方式是：

```text
Spotify Client ID: 只填自己的 Spotify App Client ID
Spotify Redirect URI: 保持 ECHO 默认值
TIDAL Client ID: 填自己的 TIDAL App Client ID
TIDAL Client Secret: 填自己的 TIDAL App Client Secret
TIDAL Country Code: US 或自己的账号地区
Discogs personal access token: 填自己的 personal access token
Bandsintown app_id: 没有就留空
Ticketmaster apikey: 有 Developer Portal Consumer Key 就填
SeatGeek client_id: 有 API access 就填
地区过滤: 先填一个最常用地区，例如 HK
```

遇到问题时，先把可选的在线歌手来源留空，只保留你正在验证的那个来源。这样最容易判断到底是哪一项配置有问题。

## 官方参考

- [Spotify Apps](https://developer.spotify.com/documentation/web-api/concepts/apps)
- [Spotify Redirect URIs](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri)
- [TIDAL Manage apps](https://developer.tidal.com/documentation/api-sdk/api-sdk-manage-apps)
- [TIDAL Authorization](https://developer.tidal.com/documentation/api-sdk/api-sdk-authorization)
- [Discogs Developers 设置页](https://www.discogs.com/settings/developers)
- [Ticketmaster Discovery API](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/)
- [SeatGeek API 文档](https://seatgeek.github.io/)

---

# 音频输出

Source: src/content/docs/zh/docs/audio-output.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/audio-output/
Description: System、WASAPI、ASIO、DSD、HQPlayer 与输出排障边界。

ECHO 的音频输出以稳定为先。高级输出模式可以带来更明确的设备链路，但也更依赖系统、驱动和硬件状态。遇到问题时，先回到稳定路径，再逐步打开高级选项。

## 输出模式怎么选

| 模式 | 适合场景 | 建议 |
| --- | --- | --- |
| `System` | 普通电脑、蓝牙耳机、笔记本扬声器、只想稳定播放 | 新手优先，排障基线 |
| `WASAPI Shared` | Windows 日常输出、常见 USB DAC | 稳定优先，适合长期使用 |
| `WASAPI Exclusive` | 外置 DAC、希望独占设备和控制采样率 | 确认设备稳定后再启用 |
| `ASIO` | 原厂专业声卡驱动、录音接口 | 有明确设备和驱动需求时再用 |
| `DSD / DoP` | 支持 DSD 的 DAC | 只在确认设备支持时启用 |
| `HQPlayer` | 外部 HQPlayer 工作流 | 需要单独配置和连接验证 |

如果你只想稳定听歌，优先使用 `System` 或 `WASAPI Shared`。不要因为名字看起来专业就直接启用 ASIO、Exclusive 或 DSD。

## 没声音怎么办

先不要清数据库、重装软件或连续乱开高级输出。只要进度条会走但听不到声音，优先按下面顺序把输出链路切回最稳状态。

### 先在 ECHO 里这样设置

1. 打开底部播放器右侧的音频输出抽屉，或进入 `设置 -> 播放`。
2. 把输出模式切到 `System`。如果你在 Windows 上想手动选设备，也可以切到 `WASAPI Shared`。
3. 在 `输出设备` 里选择你正在听的耳机、音箱、USB DAC 或声卡；不确定就先选系统默认输出。
4. 关闭 EQ、ReplayGain、变速、声道工具、重采样、DSD、ASIO 和 HQPlayer 接管。
5. 把 ECHO 播放器音量调到正常范围，确认没有开启不适合当前设备的固定音量。
6. 点一次 `重置音频引擎` 或 `软重启音频引擎`，再播放一首普通 MP3 或 FLAC。

如果这样有声音，说明基础播放链路是好的。之后每次只改一个设置：先试 `WASAPI Shared`，确认稳定后再考虑 Exclusive、ASIO、DSD 或 HQPlayer。

### 再检查 Windows

1. 右键任务栏音量图标，打开声音设置。
2. 在 `输出` 里选中你真正连接的耳机、音箱、显示器音频、USB DAC 或声卡。
3. 打开音量合成器，确认 ECHO 没有被静音，应用音量不是 0。
4. 如果你用的是蓝牙耳机，先断开重连；排障时优先换成有线耳机或普通系统输出。
5. 如果设备被其它播放器、录音软件、声卡控制面板或浏览器占用，先关闭那些程序再试。

如果 `System` 有声音，但 Exclusive、ASIO、DSD 或 HQPlayer 没声音，先不要继续堆高级选项。那通常是设备、驱动、通道、独占占用或外部播放器配置问题，不是曲库坏了。

## 蓝牙不要开独占

蓝牙耳机、蓝牙音箱和车载蓝牙请使用 `System` 或 `WASAPI Shared`。不要把蓝牙设备拿去开 WASAPI Exclusive、ASIO、DSD、bit-perfect 或高采样率验证。

蓝牙不是可控的有线 HiFi 链路。它会经过 Windows 蓝牙栈、蓝牙驱动、设备固件、编码器、无线环境和电量策略。ECHO 无法保证蓝牙设备的独占打开、固定采样率、低延迟、稳定音量或严格原始输出。

任何使用蓝牙出现的断连、延迟、爆音、卡顿、音质变化、音量异常、设备切换、独占失败或编码器问题，都不作为 ECHO 官方维护范围。排障时请先换成有线耳机、USB DAC 或普通系统输出确认基础播放。

## 第三方驱动不支持

ECHO 不支持任何第三方驱动、虚拟声卡或 ASIO 包装层的兼容性适配。包括但不限于：

- ASIO4ALL、FlexASIO、Voicemeeter。
- 非声卡厂商发布的改包驱动。
- 系统级音效增强驱动、虚拟路由软件、虚拟声卡。
- 需要修改系统音频链路或拦截其它应用音频的工具。

这些工具可能在某些环境下能发声，但 ECHO 不承诺支持、不针对它们修复，也不把它们的问题视为 ECHO 音频引擎缺陷。需要 ASIO 时，请优先使用设备厂商提供的原厂驱动。

## bit-perfect 和 DSP

只要音频被处理过，就不再是严格意义上的 bit-perfect。会影响输出判断的功能包括：

- EQ、Preamp、FIR、声道平衡。
- ReplayGain。
- 变速、变调、Crossfade、Automix。
- 重采样。
- 系统混音、蓝牙编码、虚拟声卡。

想验证原始输出时，请先关闭所有 DSP、音量增益、变速和声道处理，并使用稳定的有线输出设备。

## DSD 和高采样率

DSD、DoP、高采样率和高位深输出高度依赖 DAC 与驱动。启用前请确认：

1. 设备规格明确支持对应格式。
2. 驱动来自设备厂商。
3. Windows 声音设置没有被其它应用占用或锁定。
4. 先用普通 PCM 文件确认播放稳定。
5. 再测试 DSD、DoP 或更高采样率。

如果出现无声、爆音、半速、倍速或设备打不开，先切回 `System` 或 `WASAPI Shared`，不要继续堆更多高级选项。歌曲听起来变慢、变快或进度异常时，请先看 [为什么我的歌曲变速了](/zh/docs/audio-output/song-speed-changed/)。

## HQPlayer

HQPlayer 属于外部专业播放链路。ECHO 可以作为控制和交接入口，但实际输出、滤波、升采样和设备连接由 HQPlayer 及其环境决定。

排查 HQPlayer 时，请分别确认：

- HQPlayer 自身能独立播放。
- ECHO 中的地址、端口和连接测试正常。
- 当前文件格式被 HQPlayer 链路支持。
- 外部设备在线，且没有被其它应用占用。

HQPlayer、NAA、网络播放器和专业 DAC 的组合差异很大。请把 ECHO 连接状态和 HQPlayer 端错误一起截图发报告。

需要从安装、HQPlayer 自测、本机连接、远程连接、NAA 边界到排障一步步配置时，请看 [HQPlayer 超详细教程](/zh/docs/audio-output/hqplayer/)。

## 常见排障顺序

无声、爆音、半速、倍速或切歌失败时：

1. 切回 `System`。
2. 关闭 EQ、ReplayGain、变速、声道工具和重采样。
3. 播放一首普通 MP3 或 FLAC。
4. 确认 Windows 输出设备和应用音量。
5. 改为 `WASAPI Shared` 再试。
6. 最后再逐项测试 Exclusive、ASIO、DSD 或 HQPlayer。

每次只改一个设置。出问题时截图当前输出模式、设备名、状态提示、文件格式和错误信息，再发报告。

---

# 别魔怔 ASIO：打不开就用独占

Source: src/content/docs/zh/docs/audio-output/asio-vs-exclusive.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/audio-output/asio-vs-exclusive/
Description: 解释为什么普通听歌没必要执着 ASIO，以及 ASIO 打不开、不稳定或没有官方驱动时，为什么 WASAPI Exclusive 通常是更合理的选择。

先把结论放前面：**ASIO 不是音质开关。** 如果你的目标只是稳定听歌、减少系统混音、让外置 DAC 按曲目采样率工作，`WASAPI Exclusive` 通常已经够用。ASIO 真正适合的是专业声卡、录音、低延迟监听、多通道制作、厂商控制面板和部分 Native DSD 场景。

所以遇到 ASIO 打不开、切歌失败、无声、爆音、设备占用、通道不对、驱动面板抽风时，不要继续往系统里堆 ASIO4ALL、FlexASIO、虚拟声卡、第三方包装层。**先切回 `WASAPI Exclusive`，再不行就切回 `WASAPI Shared` / `System` 排障。** 稳定播放比接口名字更重要。

## 推荐顺序

| 你的情况 | 推荐选择 | 原因 |
| --- | --- | --- |
| 普通笔记本、主板声卡、蓝牙耳机 | `System` / `WASAPI Shared` | 稳定、兼容、少出问题 |
| 常见 USB DAC / 解码耳放 | 先 `WASAPI Shared`，稳定后试 `WASAPI Exclusive` | 日常够稳，独占可减少系统混音和默认格式干扰 |
| 想让 DAC 按曲目采样率打开 | `WASAPI Exclusive` | 播放器可以请求设备使用当前曲目的格式 |
| 有厂商官方 ASIO 驱动，且设备明确支持 | 可以试 `ASIO` | 官方驱动可能提供更完整的设备能力 |
| DAW、录音、乐器输入、低延迟监听 | `ASIO` | 这是 ASIO 的主战场 |
| ASIO 打不开或不稳定 | 换 `WASAPI Exclusive` | 听歌场景下通常没有必要死磕 ASIO |
| Exclusive 也打不开 | 换 `WASAPI Shared` / `System` | 先恢复基础播放，再查设备和驱动 |

这不是“降级”。这是把链路从更挑驱动的路径，切回更容易稳定、也更容易排障的路径。

## ASIO 原本解决的不是“更好听”

ASIO 最初服务的是专业音频制作。它的核心价值是让 DAW、录音软件、软音源和专业声卡之间用更直接、更可控的方式交换音频 buffer。

它真正擅长的是：

- 低延迟录音和实时监听。
- 多输入、多输出通道管理。
- 专业声卡的硬件路由和控制面板。
- 固定 buffer callback，方便 DAW 按节奏处理音频。
- 某些设备的 Native DSD、特殊采样率、厂商专有格式。
- Word Clock、ADAT、S/PDIF、AES、MIDI 等专业工作流配合。

这些都很专业，但它们不等于“播放一首已经制作完成的音乐时，音质自动变好”。如果播放器解码出的 PCM 样本没有被改写，送到 DAC 的数字数据是一致的，那么接口名字本身不会凭空增加细节、声场、密度或解析。

## 听歌真正需要什么

普通音乐播放的核心目标很朴素：

1. 文件正确解码。
2. DSP、EQ、ReplayGain、音量和重采样状态清楚。
3. 音频数据稳定送到设备。
4. DAC 以合适格式锁定输入。
5. 模拟输出、电源、耳放、耳机或音箱本身表现可靠。

这里最容易影响听感的，通常不是“ASIO 还是 WASAPI”这个名字，而是：

- 音源质量。
- DAC 和耳放素质。
- 耳机、音箱、房间声学。
- 是否开了 EQ、FIR、ReplayGain、音量衰减、交叉淡入淡出。
- 是否发生系统混音或不必要重采样。
- 驱动是否稳定，buffer 是否 underrun。

ASIO 只能解决其中一小部分链路问题，而且还高度依赖厂商驱动质量。驱动写得好，ASIO 很强；驱动写得一般，ASIO 反而可能比 WASAPI 更难用。

## 为什么 WASAPI Exclusive 对听歌通常够了

`WASAPI Shared` 是 Windows 日常共享音频路径。多个应用可以一起出声，系统会把它们混到当前设备默认格式里。它稳定、兼容、适合日常。

`WASAPI Exclusive` 是独占路径。播放器可以独占设备，尽量绕开系统混音器，并请求设备按当前曲目的采样率、位深和声道格式打开。

这对听歌已经解决了大部分关键诉求：

- 减少 Windows Shared Audio Engine 的混音和默认格式影响。
- 避免所有音乐都被系统统一重采样到设备默认格式。
- 更容易验证当前输出格式是否接近原始曲目。
- 不需要额外安装第三方 ASIO 包装层。
- 对普通 USB DAC 来说，通常比 ASIO 更好排障。

换句话说，如果你只是想让 `44.1 kHz`、`96 kHz`、`192 kHz` 文件尽量按自己的格式输出，`WASAPI Exclusive` 就是很合理的路线。它不是玄学，也不是妥协；它是 Windows 上面向播放场景非常实际的独占输出路径。

## ASIO 打不开时，不要先怀疑音质

ASIO 打不开通常是驱动、设备状态或格式协商问题，不是“还没调到发烧状态”。常见原因包括：

- 设备已经被别的应用占用。
- 后台还挂着其它播放器、浏览器标签、游戏、聊天软件、录屏软件、直播软件、DAW、系统音效工具或虚拟声卡。
- 厂商 ASIO 驱动没有正确安装，或者版本不适配当前 Windows。
- 播放器请求的采样率、位深、声道数不被驱动接受。
- ASIO 控制面板里锁定了采样率或 buffer。
- USB DAC 当前处在错误 USB 模式、固件状态或输入源。
- 驱动只暴露某些通道，默认通道不是你接耳机的那一路。
- buffer 设得太小，导致 underrun、爆音或初始化失败。
- 设备睡眠恢复、热插拔、切歌后驱动状态没有恢复干净。
- 第三方 ASIO 包装层把 WASAPI / WDM / Kernel Streaming 又套了一层，错误边界更多。

这时继续折腾 ASIO，往往是在错误路径上增加更多变量。正确排障应该先减少变量：

1. 切到 `System` 或 `WASAPI Shared`，确认普通 PCM 能播放。
2. 关闭 EQ、FIR、ReplayGain、变速、交叉淡入淡出和额外重采样。
3. 换一首普通 `44.1 kHz` 或 `48 kHz` 的 FLAC / MP3 测试。
4. 再切 `WASAPI Exclusive`，确认独占能否打开设备。
5. 只有在官方 ASIO 驱动确实必要时，再回头测 ASIO。

如果 `WASAPI Exclusive` 可以稳定播放，而 ASIO 一直打不开，那对普通听歌来说答案已经很明确：用独占即可。

## 打不开时先查后台占用

很多“ASIO 打不开”不是播放器坏了，而是后台有东西占住了设备，或者把 Windows 音频链路改成了另一个状态。尤其是 ASIO 和独占输出，它们都更依赖设备当前没有被乱占用。

优先检查这些后台来源：

| 可能占用来源 | 具体例子 | 为什么会影响 |
| --- | --- | --- |
| 其它播放器 | Foobar2000、JRiver、MusicBee、AIMP、网易云、QQ 音乐、Apple Music、Spotify | 可能正在独占设备，或保留音频会话没有释放 |
| 浏览器 | Chrome、Edge、Firefox 的 YouTube、Bilibili、网页播放器、直播页面 | 网页暂停了不代表音频设备一定立刻释放 |
| 游戏和语音软件 | Steam 游戏、Discord、Teams、微信语音、QQ 语音 | 可能锁定默认设备、通信设备或采样率 |
| 录屏和直播工具 | OBS、NVIDIA Broadcast、虚拟摄像头工具、录音软件 | 可能挂着监听、采集或虚拟路由 |
| DAW 和音频工作站 | Cubase、Ableton Live、Reaper、FL Studio、Studio One | 可能直接占用 ASIO 驱动或固定 buffer |
| 虚拟声卡 / 路由软件 | Voicemeeter、VB-CABLE、BlackHole、Virtual Audio Cable、Equalizer APO 配套工具 | 可能改变设备路由、通道、格式和音量路径 |
| 第三方 ASIO 包装层 | ASIO4ALL、FlexASIO、Generic ASIO wrappers | 可能占住底层 WASAPI / WDM 设备，或者枚举到错误端点 |
| 厂商控制面板 | XMOS / Thesycon / RME / Focusrite / MOTU / Topping / FiiO 等控制面板 | 可能锁定采样率、buffer、时钟源、USB 模式或通道 |
| 系统音效增强 | Windows 空间音效、响度均衡、Dolby、DTS、Nahimic、Sonic Studio、Realtek 音效 | 可能插入处理层或改变默认格式 |

排查时不要只看任务栏。很多程序关掉窗口后还会留在托盘或后台进程里。可以这样做：

1. 退出所有其它播放器和浏览器音频标签，不只是暂停。
2. 关闭 OBS、直播、录屏、语音通话、DAW 和虚拟声卡软件。
3. 查看 Windows 托盘，退出厂商音频控制面板以外的音效增强工具。
4. 打开任务管理器，确认可疑播放器、DAW、虚拟声卡、浏览器子进程是否还在。
5. 在 Windows 声音设置里确认当前默认输出设备和默认通信设备没有被切到虚拟设备。
6. 进入设备属性，先关掉空间音效、增强、独占冲突相关设置，再测试基础播放。
7. 拔插 USB DAC，或者重启设备电源，让驱动重新枚举。
8. 仍然打不开时，重启 Windows。音频驱动有时会在睡眠恢复或崩溃后残留坏状态。

如果重启后 `System` / `WASAPI Shared` 正常，`WASAPI Exclusive` 正常，只有 ASIO 异常，问题大概率在 ASIO 驱动、ASIO 控制面板、第三方包装层或设备固件状态上，而不是 ECHO 的普通播放链路。

## 第三方 ASIO 包装层不是捷径

很多人说的“ASIO 驱动”其实不是设备厂商原生 ASIO，而是 ASIO4ALL、FlexASIO、Voicemeeter 或其它虚拟路由 / 包装层。

这类工具常见链路是：

```text
播放器以为自己在调用 ASIO
  -> 第三方 ASIO 包装层
  -> WASAPI / WDM / Kernel Streaming / PortAudio
  -> 真实设备驱动
  -> DAC
```

它没有让普通声卡变成专业声卡，也不会让 DAC 突然多出硬件能力。它只是把底层接口包成 ASIO 的样子。对某些只认 ASIO 的老软件，它可能有兼容意义；对普通听歌，它经常只是多一层 buffer、多一层通道映射、多一层格式协商、多一层崩溃点。

如果你已经有 `WASAPI Exclusive` 可用，就没有必要为了“看起来更专业”再套第三方 ASIO。

## 哪些场景真的值得用 ASIO

不要反过来把 ASIO 妖魔化。官方 ASIO 在正确场景里非常有价值。

值得使用 ASIO 的情况包括：

| 场景 | 为什么 ASIO 有意义 |
| --- | --- |
| 专业录音接口 | 需要低延迟输入、监听、通道路由和厂商控制面板 |
| DAW / 软音源 | 需要稳定 buffer callback 和低延迟实时演奏 |
| 多通道输出 | 厂商 ASIO 可能更清楚地暴露通道和路由 |
| Native DSD | 部分 DAC 需要官方 ASIO 才暴露 Native DSD |
| 厂商专有功能 | 时钟源、输入输出路由、固件工具、硬件增益可能依赖官方驱动 |

判断标准也很简单：**驱动来自设备厂商，且解决一个明确能力问题。** 如果只是“听说 ASIO 高级”“别人说更通透”“包装层名字像专业声卡”，那就不值得。

## DSD 也不要拿来逼自己死磕 ASIO

DSD 是 ASIO 执念最常见的来源之一。这里要分清楚：

- `WASAPI Exclusive` 更常见的是 PCM 独占输出，DSD 场景多依赖 DoP。
- DoP 会把 DSD 数据封装到高采样率 PCM 帧里，能不能跑取决于 DAC 和驱动暴露的 PCM 上限。
- 官方 ASIO 更可能暴露 Native DSD，也可能支持更高 DSD 档位。
- 但前提仍然是 DAC、官方驱动、播放器实现和设备设置都支持。

如果你的 DAC 官方明确支持 Native DSD，并且官方 ASIO 驱动稳定，那可以用 ASIO。否则，不要为了 DSD 去安装来路不明的 ASIO 包装层。宁可用稳定 PCM / DoP，也不要把系统音频链路改得越来越难排障。

更重要的是，DSD 不等于必然更好听。母带来源、转换链路、DAC 实现和耳机音箱素质都更关键。很多时候，一份制作优秀的 PCM 比一份来源不明的 DSD 更值得信任。

## “ASIO 声音更好”的常见误判

如果切到 ASIO 后你觉得声音变了，先不要立刻归因到“ASIO 音质高”。更常见的原因是：

- 音量不一致，没有做电平匹配。
- Shared 模式经过了系统默认格式重采样，而 ASIO 没有。
- 某个模式绕过了系统音效、响度均衡、空间音效或虚拟环绕。
- 播放器在不同输出模式下启用了不同 buffer、位深或重采样策略。
- ASIO 控制面板里开了硬件混音、增益、滤波或通道路由。
- 设备在不同采样率下使用了不同数字滤波器或模拟输出状态。

这些都可能让听感变化，但不代表 ASIO 这个接口本身“提升音质”。专业判断应该回到可验证问题：输出数据有没有被改写？采样率是否一致？音量是否匹配？有没有 DSP？设备是否稳定锁定？

## 实用排障流程

遇到无声、爆音、半速、倍速、切歌失败、设备打不开时，按这个顺序来：

1. 输出模式改为 `System`。
2. 确认 Windows 当前输出设备正确，系统音量和应用音量正常。
3. 退出后台可能占用音频设备的程序，尤其是播放器、浏览器、OBS、DAW、语音软件、虚拟声卡和第三方 ASIO 包装层。
4. 关闭 ECHO 里的 EQ、FIR、ReplayGain、变速、声道处理和额外重采样。
5. 播放普通 `44.1 kHz` / `48 kHz` PCM 文件。
6. 稳定后改为 `WASAPI Shared`。
7. 再试 `WASAPI Exclusive`。
8. 最后才试官方 `ASIO`。
9. 每次只改一个变量，出问题就退回上一步。

不要同时改采样率、输出模式、驱动、DSD、buffer、通道和 DSP。这样只会让问题无法复现。

## 给 ECHO 用户的最终建议

- 日常稳定听歌：`System` / `WASAPI Shared`。
- 外置 DAC 想减少系统混音：`WASAPI Exclusive`。
- ASIO 打不开：直接用 `WASAPI Exclusive`，不要硬撑。
- Exclusive 也不稳：回到 `WASAPI Shared`。
- 只有官方驱动、明确需求、稳定设备三者都满足时，再考虑 ASIO。
- 不要把第三方 ASIO 包装层当成 HiFi 升级。
- 出问题时先恢复基础 PCM 播放，再逐步打开高级功能。

音频链路越清楚，越容易稳定，也越容易判断问题在哪里。普通听歌最怕的不是“没开 ASIO”，而是把系统堆成一条没人能复现、没人能维护、自己也说不清楚的复杂链路。真打不开 ASIO，就用独占；独占也不行，就先回共享。这个选择很朴素，但通常最正确。

---

# 音频设置建议

Source: src/content/docs/zh/docs/audio-output/audio-advice.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/audio-output/audio-advice/
Description: 给普通用户的音频输出、采样率、WASAPI、ASIO、DSD 和升频建议。

这份建议写给想把 ECHO 用稳定、用舒服的人。音频设置里有很多看起来很“高级”的词：WASAPI、ASIO、DSD、采样率、升频、独占输出、第三方驱动。它们不是不能玩，但不要一上来就把所有开关都推满。

**先保证稳定播放、设备正常、音量合适，再考虑音源和升频。** 很多时候，声音不好听不是因为你没开到最高规格，而是设备、驱动、耳机、音量、文件质量或输出链路本来就有短板。

## 先说结论

1. 普通直插耳机、电脑内置声卡、蓝牙耳机：优先用 `System` / `Windows Output` / `WASAPI Shared`。
2. 有外置 DAC 或低端解码器，且驱动稳定：可以试 `WASAPI Exclusive`。
3. 不要迷信 ASIO。很多厂商的 ASIO 驱动并不一定成熟，第三方 ASIO 驱动更不建议折腾。
4. `ASIO4ALL` 对大多数用户没有意义，也不会让你的耳机突然更好听。
5. 小尾巴、入门 DAC 不要过度追求解 DSD。先把设备、耳机和基础链路提升上去，收益通常更实在。
6. Windows 声音设置里的默认采样率建议用 `44.1 kHz` 或 `48 kHz`，不要长期开很高。
7. 想玩升频，用专门的升频软件，例如 HQPlayer；Windows 默认采样率调高不等于高质量升频。

## Windows 默认采样率怎么设

Windows 的声音设置里可以给输出设备设置默认格式，例如：

- `16-bit / 44.1 kHz`
- `24-bit / 48 kHz`
- `24-bit / 96 kHz`
- `24-bit / 192 kHz`
- 更高的格式

日常使用建议选 `44.1 kHz` 或 `48 kHz`。如果你的设备支持，`24-bit / 48 kHz` 是很稳的日常选择。

不要因为看到 `192 kHz`、`384 kHz` 就直接选最高。Windows 默认采样率开高没有什么实际意义，还可能带来这些问题：

1. 所有系统声音都可能被重采样到你设置的采样率。
2. 不只是听歌，游戏、浏览器、视频、聊天软件也会走这个默认格式。
3. CPU 压力可能增加。
4. 音频延迟可能增加。
5. 某些驱动或设备可能出现爆音、半速、无声、切换失败等问题。
6. 声音不会因为默认格式开高就自动变好听。

这不是升频。它只是系统混音器为了统一输出格式而做的重采样。真正想玩高质量升频，应该使用专门的软件和清楚的处理链路，而不是把 Windows 默认采样率拉满。

## WASAPI Shared 和 WASAPI Exclusive

`WASAPI Shared` 是共享模式，系统、播放器、游戏、浏览器可以一起出声。它适合日常使用，兼容性最好。

`WASAPI Exclusive` 是独占模式，播放器会独占设备，尽量绕开系统混音器。它适合想减少系统重采样、想让播放器更直接控制输出格式的用户。

建议这样选：

| 场景 | 建议 |
| --- | --- |
| 普通听歌、看视频、打游戏 | `WASAPI Shared` 或系统输出 |
| 直插耳机、笔记本内置声卡 | 系统输出或 `WASAPI Shared` |
| 外置 DAC / 解码耳放 | 先试 `WASAPI Shared`，稳定后再试 `WASAPI Exclusive` |
| 低端解码器但支持独占 | 可以优先试 `WASAPI Exclusive` |
| 独占后无声、切歌失败、设备被占用 | 切回 `WASAPI Shared` |

低端解码器有时用 `WASAPI Exclusive` 反而更清楚，因为播放器可以按文件采样率去打开设备，减少系统默认格式的干扰。但前提是设备和驱动要稳定。如果独占模式出问题，不要硬撑，切回共享模式就是正确选择。

## ASIO 不等于更好听

ASIO 最初更多是给专业音频制作、低延迟录音、声卡工作站这类场景准备的。它的重点不是“让耳机更好听”，而是绕过一部分系统音频路径，让专业软件和专业声卡更直接通信。

对普通听歌用户来说：

- 有官方稳定 ASIO 驱动的专业声卡，可以试。
- 厂商 ASIO 驱动做得不成熟，就不要强行用。
- 第三方 ASIO 驱动通常没必要。
- `ASIO4ALL` 本质上不是让设备变成高级声卡的魔法。
- 直插耳机、普通小尾巴、蓝牙耳机，老实用 WASAPI 或 Windows 输出更稳。

如果你用 ASIO 或 ASIO4ALL 出 bug，请优先找驱动作者或设备厂商。播放器能做的是按接口调用驱动，但驱动自己不稳定，播放器很难替它修好。

## USB DAC 官方驱动入口

常见 USB DAC、解码器、声卡和 Hi-End 厂商的官方驱动下载入口已经单独整理到 [USB DAC 官方驱动下载入口](/zh/docs/audio-output/usb-dac-drivers/)。

这里只保留原则：安装 USB / ASIO 驱动时只建议走厂商官网、厂商支持中心或官方区域站。ECHO 只会按系统音频接口调用已经安装好的设备驱动，不会对任何第三方驱动提供安装、修复、调试、兼容性适配或售后支持。

## DSD 不要过度执念

DSD 不是不能听，也不是没有意义。但对大多数用户来说，不建议为了 DSD 把链路搞得特别复杂。

尤其是小尾巴、入门 DAC、普通耳机，过度追求“能不能硬解 DSD”收益很低。设备本身的模拟输出、耳机素质、供电、底噪、推力、佩戴和音量控制，往往比“DSD 灯有没有亮”更影响实际听感。

还有一个现实问题：市面上很多所谓 DSD 音源并不一定是原生录音链路产生的 DSD。有些是后期升频、转码或重新封装来的。它不一定比好的 PCM 母带更好听，也不一定比你自己用 HQPlayer 这类工具做的高质量升频更合适。

所以建议是：

1. 先听录音和母带质量，不要只看格式后缀。
2. 先确认设备本身够好，再谈 DSD。
3. 小尾巴能正常播放 PCM 就很好，不必强迫它承担复杂 DSD 工作。
4. 如果 DSD 播放导致爆音、卡顿、发热、耗电、切歌慢，就回到 PCM。

## 升频应该怎么理解

升频不是把数字变大就自动变好听。高质量升频需要算法、滤波器、设备能力和稳定的输出链路配合。

把 Windows 默认采样率设成 `192 kHz` 或 `384 kHz`，通常只是让系统把所有声音统一重采样到那个格式。它不会凭空补出录音里没有的信息，也不等于专业升频。

如果你真的想玩升频：

1. 用 HQPlayer 这类专门工具。
2. 先确认电脑性能足够。
3. 先确认 DAC 支持目标采样率。
4. 一次只改一个参数，听熟悉的歌对比。
5. 如果出现延迟、爆音、CPU 占用过高，就降低设置。

升频是玩法，不是刚需。不要为了参数漂亮牺牲稳定性。

## 出问题时怎么排查

遇到无声、爆音、切歌失败、半速、延迟很高，先按这个顺序排查：

1. 切回 `System` / `Windows Output` / `WASAPI Shared`。
2. 关闭 ASIO、独占、DSD、升频、DSP、EQ、ReplayGain、变速。
3. Windows 默认采样率改回 `24-bit / 48 kHz` 或 `16-bit / 44.1 kHz`。
4. 换一首确定正常的普通 MP3 或 FLAC。
5. 换一个输出设备测试，例如电脑扬声器或另一只耳机。
6. 更新或回退声卡 / DAC 官方驱动。
7. 确认别的软件没有独占设备。

等基础播放稳定后，再一个一个打开高级选项。每开一个选项都试听一下，出问题就知道是谁引入的。

## 推荐默认配置

如果你不想折腾，按下面来就很稳：

| 用户类型 | 推荐设置 |
| --- | --- |
| 普通电脑直插耳机 | Windows 输出或 `WASAPI Shared` |
| 蓝牙耳机 | Windows 输出，不建议折腾独占和 ASIO |
| 入门小尾巴 | `WASAPI Shared`，稳定后可试 `WASAPI Exclusive` |
| 外置 DAC | 先 `WASAPI Shared`，再按设备稳定性试独占 |
| 专业声卡 | 可以试官方 ASIO，不稳定就回 WASAPI |
| 想玩升频 | 用 HQPlayer 等专门工具，不要靠 Windows 默认采样率 |
| 想听 DSD | 确认设备真实支持，出问题就回 PCM |

## 最后一句话

音频设置不是参数比赛。好听、稳定、低延迟、少出 bug，比“开到最高规格”重要得多。

先把耳机、解码器、音量、文件质量和基础播放链路做好，再去追求更高规格的音源和升频玩法。这样花出去的时间和钱，才更容易真的变成你能听见的提升。

---

# DSD 播放教程

Source: src/content/docs/zh/docs/audio-output/dsd.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/audio-output/dsd/
Description: 教用户在 ECHO Next 中开启 DSD 播放相关功能，并解释 DoP、原生 DSD、ASIO 驱动和音量安全。

这页写给想在 ECHO Next 里播放 DSD 的用户。DSD 可以玩，但它对设备、驱动和音量控制的要求比普通 PCM 更苛刻。先把普通 FLAC / WAV 播放确认稳定，再开启 DSD 相关选项。

![ECHO Next DSD 设置界面](/assets/docs/dsd.png)

## 先说结论

1. 先确认 DAC 本身支持 DSD，且支持你要播放的 DSD64 / DSD128 / DSD256 等规格。
2. 先用普通 PCM 文件确认 ECHO、输出设备、DAC 和耳放都能正常出声。
3. 在 `设置` -> `通用` -> `高级音频引擎` 中开启 DSD 相关实验选项。
4. 如果只是想尽量兼容，优先尝试 `DSD DoP 直出试验`。
5. 只有在你使用 DAC 厂商官方 ASIO 驱动，且 DAC 明确支持原生 DSD 时，才尝试 `ASIO 原生 DSD 实验`。
6. 播放 DSD 时请让 ECHO / 系统 / 播放链路里的数字音量保持 `100%`，实际音量用 DAC、前级、耳放或功放调节。
7. 不要无脑追求 DSD。市面上很多 DSD 文件并不是原生 DSD 录音链路产物，而是 PCM 母带、CD 抓轨、数字母带或后期文件被民间升频、转码、重新封装出来的版本。

## 需要开启哪些功能

进入 `设置` -> `通用`，找到右侧的 `高级音频引擎`。想播放 DSD，请按你的目标开启下面这些开关。

| 功能 | 建议 | 说明 |
| --- | --- | --- |
| `长驻原生解码` | 建议开启 | 播放 DSD 时开启。开启后，本地 WAV / FLAC / MP3 在不需要原生解码时仍会走更稳定的路径；失败会自动回退。 |
| `DSD DoP 直出试验` | 优先尝试 | 把 DSD 封装在 PCM 帧里送给 DAC。DAC 识别 DoP 后再还原为 DSD。 |
| `ASIO 原生 DSD 实验` | 谨慎开启 | 只适合 DAC 厂商官方 ASIO 驱动和明确支持 Native DSD 的设备。 |
| `播放 DSD 时自动锁定音量` | 强烈建议开启 | 播放 DSD 时自动把 ECHO 音量锁到 `100%`，切回 PCM 后恢复原来的音量。 |

如果你要走 ASIO 输出，还需要确保 ECHO 当前输出链路已经选到对应的 ASIO 设备。普通系统输出、蓝牙耳机、电脑内置声卡通常不适合折腾 DSD 直出。

## DoP 和原生 DSD 怎么选

`DoP` 的全称是 DSD over PCM。它不是把 DSD 转成普通 PCM 音乐，而是把 DSD 数据放进看起来像 PCM 的数据包里传输。只要 DAC 支持 DoP，就能在接收端识别并还原 DSD。

`原生 DSD` 则要求播放器、ASIO 驱动、USB 音频接口和 DAC 之间都能按设备厂商要求传递 DSD 数据和控制信息。这个链路更挑驱动，也更容易遇到兼容问题。

建议顺序是：

1. 先用 PCM 确认能稳定播放。
2. 再开 `DSD DoP 直出试验`。
3. 如果 DAC 显示 DSD，且播放稳定，就先用 DoP。
4. 只有在 DoP 不满足需求，且你有官方 ASIO 驱动时，再试 `ASIO 原生 DSD 实验`。

## 不要无脑追求 DSD

DSD 只是数字音频编码方式之一，不是“只要文件后缀是 DSF / DFF 就一定更高级”。很多网络上流通的 DSD 文件，尤其是来历不清的资源，并不一定来自原生 DSD 录音、DSD 后期制作或正规发行母带。

常见情况包括：

1. 从 CD 或普通 PCM 文件升频到 DSD。
2. 从 24-bit / 96 kHz、24-bit / 192 kHz 等 PCM 母带转成 DSD。
3. 从已经压缩、修复、降噪、响度处理过的数字文件重新封装。
4. 民间为了让 DAC 亮起 `DSD` 指示灯而做的格式转换。
5. 售卖页面只强调 `DSD64`、`DSD128`、`DSD256`，但不说明录音、母带和转换来源。

如果原始录音、混音、母带或转码链路本来就不好，把它转成 DSD 不会凭空增加细节，也不会自动变成高级母带。它最多只是换了一种编码外壳，甚至可能因为噪声整形、转码算法、滤波和电平处理带来新的问题。

所以，判断一份 DSD 值不值得听，优先看这些信息：

1. 是否来自可信发行方。
2. 是否说明录音、母带或转码来源。
3. 是否有明确的 DSD 制作链路，而不只是写着“DSD 版本”。
4. 是否比你手里的 PCM 正版母带实际更好听。

**无脑追求 DSD 没有意义。** 好录音、好母带、好设备和稳定播放链路，比文件名里多一个 `DSD` 更重要。

## 为什么小尾巴和入门设备不必执着 DSD

平心而论，DSD 本身不是骗局，也不是“不能好听”。真正的问题是：**DSD 只是一种编码和发行格式，不是音质通行证**。一首音乐最终好不好听，主要取决于录音、混音、母带、转码链路、DAC 架构、模拟输出、电源、时钟、耳机和音箱匹配，而不是文件名里有没有 `DSD64` / `DSD128` / `DSD256`。

很多用户会把“设备支持 DSD”理解成“这台设备更高级”。这其实是营销里很常见的误导。高端数字音频里有不少厂商并不把原生 DSD 当作必要卖点，甚至会主动选择把 DSD 转成高精度 PCM 再处理，因为他们更在意完整转换链路的声音表现。

几个例子：

| 厂商 / 产品 | 对 DSD 的态度 | 说明 |
| --- | --- | --- |
| [Berkeley Audio Design Alpha DAC Reference Series 3P](https://www.berkeleyaudiodesign.com/alpha-dac-reference-series-3p) | 不追求前面板显示 `DSD` | 官方规格列的是 `32 kHz` 到 `192 kHz`、`24-bit` 输入。Berkeley 还解释过：为了让 DAC 显示 `DSD` 而在机内增加 DSD 转多位处理，对他们来说反而可能损害声音；他们更倾向于在电脑端把 DSD 高精度转换为 `176.4 kHz / 24-bit` PCM，再交给 DAC。 |
| [Naim ND 555](https://www.naimaudio.com/products/nd-555) | 支持播放 DSD，但不等于原生 DSD DAC | ND 555 是 Naim 的旗舰级网络播放器。Naim 白皮书说明，因为其 PCM1704 DAC 芯片不兼容 DSD，DSD 会先在 DSP 内转成 PCM，再送入 DAC 级。也就是说，`支持 DSD 播放` 和 `全链路原生 DSD` 不是一回事。 |
| Metrum Acoustics / Totaldac 等 NOS、R2R 取向厂商 | 许多产品更重视 PCM、离散电阻阵列、时钟和模拟级 | 这类路线常常不把“支持多少倍 DSD”当作第一卖点，而是强调转换架构、供电、模拟输出和实际听感。 |
| Schiit Yggdrasil 这类多位 DAC | 长期不把 DSD / MQA 当核心卖点 | 它不是天价器材，但很有代表性：很多认真做 PCM 多位转换的产品，并不认为“能不能点亮 DSD 灯”是判断 DAC 好坏的核心。 |

这说明一件事：**DSD 不是高端音频的入场券**。连 Berkeley 这种定位很高、价格也很高的数字音频厂商，都不会为了迎合格式焦虑而把“原生 DSD”当成必须功能。那普通用户用小尾巴、入门 USB DAC、电脑内置声卡、蓝牙耳机或低价解码耳放去追求 DSD，实际意义就更有限。

小尾巴和入门设备真正限制声音的地方，通常不是“DSD 支持到多少倍”，而是这些更现实的因素：

1. 供电余量和抗干扰能力。
2. 模拟输出级质量。
3. 耳机推力和负载匹配。
4. 底噪、失真和通道一致性。
5. 系统是否重采样、混音或改写音量。
6. 驱动是否稳定，是否真的绕过了系统音频处理。
7. 音源本身是否来自可信母带。

所以，不要因为一个小尾巴能写 `DSD256`，就默认它比一个只认真做好 PCM 的 DAC 更高级。也不要因为一个文件是 `.dsf`，就默认它一定比可信的 FLAC / WAV 母带更好。很多时候，你听到的差异来自母带版本、音量匹配、滤波器、DAC 输出级或心理预期，而不是 DSD 这个格式本身。

更实用的判断方式是：

1. 这份音乐是不是可信发行。
2. PCM 版本和 DSD 版本是否来自同一母带。
3. 音量是否严格匹配。
4. DAC 是否真正进入了正确的播放路径。
5. 盲听或长期听感是否真的更好，而不是只看面板灯。

结论很简单：**DSD 可以玩，但不值得迷信。** 对多数用户来说，稳定的 PCM 播放、靠谱母带、正确输出模式和安全音量控制，比追求小尾巴点亮 `DSD` 指示灯更重要。

## 想升频到 DSD1024 或更高怎么办

如果你真正想玩的是把 PCM 实时升频、调制到 DSD1024，甚至更高规格，建议使用专门为高质量升频和调制设计的软件，例如 [HQPlayer](https://signalyst.com/)。

这类玩法和普通播放器的职责不一样。DSD1024 级别的实时升频通常会涉及复杂滤波器、噪声整形、调制器、CPU / GPU 算力、缓冲策略、DAC 能力和驱动稳定性。它不是简单把输出格式下拉框改成 `DSD1024` 就结束了，也不是 ECHO 这种曲库播放器应该无脑内置并替用户兜底的功能。

更合理的链路是：

```text
ECHO 管理曲库和发起播放 -> HQPlayer 做升频 / 调制 / 输出 -> DAC 解码
```

ECHO 会更重视曲库、播放控制、稳定输出和可回退的普通播放链路。HQPlayer 这类工具则专门负责滤波、升频、DSD 调制、NAA 和高阶 DAC 输出。想认真玩 DSD1024 / DSD2048 这类极限配置，请先确认电脑算力、DAC 支持、官方驱动、散热和音量控制都足够稳定。

## 为什么第三方 ASIO 驱动和 DSD 播放自相矛盾

很多用户会想到 `ASIO4ALL`、`FlexASIO`、虚拟声卡或其它第三方 ASIO 包装层。但从数字音频技术角度看，用这些东西追求 DSD 直出本身就很矛盾。

先把目标讲清楚：DSD 直出追求的是让播放器把 DSD 数据尽量原样交给 DAC。中间不能被系统混音器当成普通 PCM 处理，不能随便改采样率，不能做普通数字音量，不能套 EQ / ReplayGain / DSP，也不能被一个不了解设备私有协议的驱动层重新解释。

DSD 和 PCM 的传输逻辑不一样。PCM 可以理解为一串多位采样值，例如 24-bit / 96 kHz；系统音量、混音器、采样率转换器和很多通用驱动都天然围绕 PCM 工作。DSD 更像一串非常高速的 1-bit 数据流，它依赖噪声整形和后端模拟低通滤波来还原声音。普通 PCM 音量或 DSP 不能直接“温柔地改一点 DSD”，通常必须先转成 PCM，处理完再重新调制成 DSD。

所以，真正的 DSD 直出至少需要这几层都配合：

1. 播放器知道当前送出的是 DSD，而不是普通 PCM。
2. 输出接口允许绕过系统混音和普通 PCM 处理。
3. 驱动知道如何把 DSD 数据交给这台 DAC。
4. DAC 知道收到的是 DoP 或 Native DSD，并切到正确的 DSD 解码路径。
5. 链路中没有软件音量、EQ、重采样器或虚拟声卡把数据改写。

`DoP` 是一种相对通用的办法：把 DSD 数据装进 PCM 外观的帧里传输。外层看起来像高采样率 PCM，DAC 识别到 DoP 标记后，把里面的 DSD 数据取出来播放。这里的关键是 DAC 必须懂 DoP 标记，传输链路也不能把这些“看起来像 PCM 的数据”拿去做音量、混音或重采样。

`Native DSD` 更依赖设备和驱动。它不只是“软件里出现了 ASIO”这么简单，而是驱动要能告诉 DAC：现在传的是 DSD，不是 PCM；当前是 DSD64、DSD128 还是 DSD256；通道怎么对应；什么时候切换状态；缓冲怎么交付。很多 USB DAC 的 Native DSD 细节来自厂商驱动、USB 接收方案和设备私有实现，不是通用包装层凭空能猜出来的。

第三方 ASIO 驱动通常做的是另一件事：把普通 Windows 音频接口、WDM、WASAPI 或虚拟设备包装成一个“看起来像 ASIO”的接口。它解决的是“某些软件只认 ASIO，所以给它一个 ASIO 外壳”的问题，不是“让任意设备获得官方 Native DSD 能力”的问题。

这就是矛盾点：

| 你追求 DSD 直出时想要 | 第三方 ASIO 包装层常见实际情况 |
| --- | --- |
| 少一层中间处理 | 它本身就是额外包装层 |
| DAC 厂商级 Native DSD 控制 | 它通常只看见通用 Windows 音频设备 |
| 绕过系统混音和普通 PCM 处理 | 它可能仍然走 WDM / WASAPI / 虚拟设备路径 |
| 保持 DSD 数据和 DoP 标记不被改写 | 它可能经过音量、重采样、缓冲转换或格式协商 |
| 让 DAC 正确切到 DSD 模式 | 它不一定能传递厂商驱动里的 DSD 标记和私有命令 |

换句话说，第三方 ASIO 包装层最多可能让播放软件“以为自己在用 ASIO”，但这不等于 DAC 收到了真正可靠的 DSD。软件界面显示 ASIO、DAC 真实收到 Native DSD、声音链路没有被改写，是三件不同的事。

更直接一点：

```text
理想的 Native DSD：
播放器 -> 厂商官方 ASIO 驱动 -> DAC 的 DSD 接收路径

第三方 ASIO 包装层常见链路：
播放器 -> 第三方 ASIO 外壳 -> Windows 通用音频路径 / 虚拟设备 -> DAC
```

第一条链路的重点是“设备厂商知道自己的 DAC 怎么接收 DSD”。第二条链路的重点是“把一个通用输出伪装成 ASIO 接口”。它们解决的问题不一样。你用第二条链路去追求第一条链路的结果，自然就自相矛盾。

所以，**第三方 ASIO 驱动不应该被当成 DSD 直出的捷径**。它可能能让某些软件“看到 ASIO”，但这不等于你的 DAC 得到了真正可靠的 Native DSD 链路。

如果你真的要玩 DSD，请优先使用：

1. DAC 厂商官方 USB 音频驱动。
2. DAC 厂商明确说明支持的 ASIO 驱动。
3. DAC 官方手册里写明的 DoP 或 Native DSD 设置。

找不到官方驱动时，宁可先用 WASAPI / PCM 稳定播放，也不要随便安装来源不明的 ASIO 驱动。

## foobar2000 能用第三方 ASIO，为什么 ECHO 不跟

有些用户会说：`foobar2000` 可以通过组件、插件或第三方 ASIO 驱动播放，为什么 ECHO 不支持同样的玩法？

这里要分清两件事：**“某个软件能把接口暴露出来让用户尝试”**，不等于 **“这条链路值得 ECHO 官方为它做适配和稳定性承诺”**。

foobar2000 是非常开放、插件化、偏玩家向的播放器。它允许用户安装不同输出组件、第三方解码器和实验性配置。这个生态的优点是自由，缺点是组合非常多：不同 ASIO 组件、不同包装驱动、不同 Windows 音频路径、不同 DAC、不同缓冲设置，都可能产生完全不同的结果。能跑起来，不代表链路就是正确的 DSD 直出；能在某台机器上响，不代表另一台机器也稳定。

ECHO 的取向不一样。ECHO 需要优先保证普通用户的播放稳定、音量安全、自动回退和可解释的排障路径。第三方 ASIO 包装层的问题在于：

1. 驱动行为不可控，出问题时很难判断是 ECHO、包装层、Windows 音频路径、DAC 驱动还是设备本身的问题。
2. 同一个第三方 ASIO 名称下面，实际后端可能是 WASAPI、WDM、虚拟声卡或其它桥接方式。
3. DSD 标记、DoP 数据、缓冲格式和 Native DSD 控制命令可能被吞掉、改写或根本不支持。
4. 一旦 ECHO 为这些驱动做“专门适配”，用户会自然理解为“官方推荐”或“官方保证可用”，这会带来错误预期。
5. 为不稳定包装层逐个兜底，会牺牲真正重要的稳定播放、官方驱动支持和正常排障效率。

所以，ECHO 不把“适配各种第三方 ASIO 包装驱动”当成目标。这不是技术上完全不能尝试，而是从产品责任和音频链路正确性上看，没有必要，也不值得鼓励。

如果你是重度玩家，愿意自己承担插件、驱动和链路组合的风险，可以继续用熟悉的专业播放器或 foobar2000 方案折腾。ECHO 的建议更保守：普通播放走稳定输出；DSD 直出优先用 DoP；Native DSD 只面向 DAC 厂商官方 ASIO 驱动和明确支持的设备。

## DSD 播放为什么要把数字音量打满

播放 DSD 时，请把 ECHO 音量、系统音量和播放器链路里的数字音量保持在 `100%`，实际响度用 DAC、前级、耳放或功放调节。

原因很简单：DSD 不是普通多位 PCM。对 DSD 做数字音量、EQ、ReplayGain 或其它 DSP，通常需要把 DSD 转成 PCM，或者经过专门的高阶处理和重新调制。这样一来，它就不再是你想要的“DSD 直出”链路。

因此推荐：

1. 开启 `播放 DSD 时自动锁定音量`。
2. 播放 DSD 前先把前级、耳放或功放音量调低。
3. 开始播放后，再慢慢把前级音量调到合适位置。
4. 不要用 ECHO 的软件音量、系统音量或键盘音量键来控制 DSD 响度。

这点非常重要。`100%` 数字音量不是让你把声音开到最大听，而是让数字信号不要被软件音量改写。真正控制音量的地方应该是模拟前级、耳放、功放，或 DAC 自带的硬件音量。

## 推荐最小步骤

第一次测试 DSD 时，按这个顺序来：

1. 接好 DAC，并安装 DAC 厂商官方驱动。
2. 先播放一首普通 FLAC，确认声音正常。
3. 在 ECHO 设置里开启 `长驻原生解码`。
4. 开启 `播放 DSD 时自动锁定音量`。
5. 开启 `DSD DoP 直出试验`。
6. 先不要开启 `ASIO 原生 DSD 实验`。
7. 把 DAC / 前级 / 耳放音量先调低。
8. 播放 DSF / DFF 文件。
9. 看 DAC 屏幕或指示灯是否显示 DSD。
10. 如果无声、爆音、卡顿或 DAC 不显示 DSD，停止播放，回到 PCM 链路排查。

如果 DoP 稳定，而且 DAC 能正确显示 DSD，就不必继续追求原生 DSD。能稳定、正确、可控地播放，比开更多实验开关更重要。

## 出问题时怎么回退

遇到无声、爆音、半速、倍速、卡顿、切歌失败或设备消失时，按这个顺序回退：

1. 停止播放。
2. 关闭 `ASIO 原生 DSD 实验`。
3. 关闭 `DSD DoP 直出试验`。
4. 切回普通 PCM 文件测试。
5. 输出模式改回 `WASAPI Shared` 或系统默认输出。
6. 重启 DAC 或重新插拔 USB。
7. 必要时回退或重装 DAC 官方驱动。

不要一边换驱动、一边改 DSD、一边改采样率、一边改音量。一次只改一个变量，最快也最稳。

## 最后提醒

DSD 是一种播放链路玩法，不是所有用户都必须开启的功能。小尾巴、蓝牙耳机、电脑内置声卡、虚拟声卡和第三方 ASIO 包装层通常不是合适的 DSD 直出对象。

更不要因为看到 `DSD` 后缀就盲目升级资源。很多 DSD 是民间升频、转码或重新封装，格式数字漂亮不代表录音和母带更好。

真正重要的是：可信音源、设备支持、官方驱动、稳定链路、满刻度数字音量，以及用前级安全地控制实际响度。先保证这些，再谈 DSD。

---

# dsp-beginner

Source: src/content/docs/zh/docs/audio-output/dsp-beginner.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/audio-output/dsp-beginner/

---
title: "DSP 新手教程"
description: "给第一次打开 DSP 工作台的用户：先理解信号链路、bit-perfect、Headroom、EQ、耳机校正和输出安全。"
sidebar:
  order: 42
  label: "DSP 新手教程"
---

这份教程写给第一次打开 `DSP` 工作台的人。你不需要先成为录音师，也不需要背完一堆英文术语。先记住一句话：

**DSP 就是 ECHO 在把声音送到耳机、音箱或 DAC 之前，对数字音频做的可控处理。**

不开 DSP 时，ECHO 尽量保持原始输出路径；开启 EQ、耳机校正、FIR、声道工具、Headroom 等模块后，声音会经过处理链。处理本身不是坏事，但它会改变信号，也通常会让当前播放不再是 bit-perfect 候选路径。

## 什么时候先别开 DSP

如果你只是想确认播放器、声卡、DAC、耳机是否正常，先保持 DSP 全关。

尤其是这些情况，先别急着调音：

1. 刚安装软件，正在确认有没有声音。
2. 正在排查爆音、无声、半速、卡顿、切歌失败。
3. 正在验证 WASAPI Exclusive / ASIO / 外置 DAC 是否稳定。
4. 正在判断某个音乐文件是不是损坏。
5. 想确认原始输出、采样率和 bit-perfect 候选状态。

排查问题时的安全顺序是：先切回 `System` 或 `WASAPI Shared`，关闭 EQ / FIR / 声道工具 / ReplayGain / 变速，换一首普通 MP3 或 FLAC 试听。等基础播放稳定后，再逐个打开 DSP 模块。

## DSP 工作台怎么认

左侧进入 `DSP`，你会看到一条类似信号链的工作区。它不是“音效商城”，更像一张清楚的路线图：声音从输入进来，经过哪些处理，再送到输出。

| 模块 | 你可以这样理解 | 新手建议 |
| --- | --- | --- |
| `Headroom` | 先把音量空间让出来，防止后面处理把信号顶爆 | 开 EQ / FIR 前优先用 |
| `参数 EQ` | 调低频、人声、高频、空气感这些声音风格 | 先用 Simple，再进 Pro |
| `耳机校正` | 用 OPRA 曲线修正特定耳机的频响倾向 | 找到型号再用，不要乱套 |
| `FIR / 房间校正` | 导入 IR，用卷积处理房间或设备响应 | 有可靠 IR 文件再用 |
| `声道工具` | 调左右平衡、延迟、Mono、左右互换 | 偏音或声像不居中时用 |
| `输出安全` | 看削波、余量、bit-perfect、模块状态 | 经常看，不需要手动调太多 |

最稳的上手方式是：每次只动一个模块，听同一首歌，确认变化，再继续下一步。

## 新手推荐路线

第一次调 DSP，建议按这个顺序：

1. 播放一首你非常熟的歌，最好是声音正常、不是现场版、不是极端混音。
2. 打开 `DSP` 工作台，先看顶部状态是不是 `Native direct` 或类似原生直通。
3. 进入 `Headroom`，如果准备增强低频、高频或启用 FIR，先预留一点余量，例如使用界面建议或 `-6 dB` 保护。
4. 进入 `参数 EQ`，保持 `Simple` 模式，先试 `Bass`、`Vocal`、`Air`、`Warm` 这类大方向。
5. 如果出现“爆”“糊”“刺”“音量忽大忽小”，先降低 Preamp 或 Headroom，不要继续往上推。
6. 想对比原声，就用旁路、关闭 EQ，或回到输出安全看当前 DSP 是否仍 active。
7. 调到舒服后保存方案；不舒服就重置，不要硬留。

调音不是考试。你听得更舒服、又没有削波风险，就是合格。

## 数字音频最小科普

### PCM 是什么

大多数播放器内部最终都要把音乐变成 PCM。你可以把 PCM 想成一长串数字采样点：每秒取很多次声音的高度，再把这些数字送给声卡。

常见的 `44.1 kHz / 16-bit` 大致意思是：

- `44.1 kHz`：每秒 44100 个采样点。
- `16-bit`：每个采样点用 16 位数字表示音量精度。

Hi-Res 文件可能是 `96 kHz / 24-bit`、`192 kHz / 24-bit`。数字更大不自动等于更好听，录音、母带、设备和输出链路同样重要。

### 采样率不是音量

采样率表示“每秒测量多少次”，不是“声音有多大”。把 44.1 kHz 强行升到 192 kHz，不会凭空多出录音里没有的信息。它可能用于设备兼容、统一输出或某些处理流程，但不要把重采样当成音质魔法。

### bit depth 不是频响

位深影响的是动态范围和量化精度，不是低频多不多、高频亮不亮。24-bit 给制作和处理留了更多空间，但最终听感还取决于录音、响度、设备和环境。

### dB 是相对刻度

EQ、Preamp、Headroom 常用 `dB`。它不是线性刻度：

- `+3 dB` 已经是明显增强。
- `+6 dB` 很容易让输出接近上限。
- `-6 dB` 常用来给 DSP 留安全空间。

所以调 EQ 时，少量多次比一口气拉满更稳。

### 削波为什么难听

数字音频有一个天花板，通常叫 `0 dBFS`。信号超过这个上限时，波形会被截平，这就是 clipping / 削波。削波会让声音变硬、炸、刺，严重时像破音。

EQ 往上推、FIR 增益、声道补偿、ReplayGain、音量叠加，都可能让信号接近上限。`Headroom` 的作用就是先把整体电平往下让一点，给后面的处理留空间。

### bit-perfect 是什么

bit-perfect 可以简单理解为：播放器尽量把文件里的数字样本原样送出去，不改 EQ、不改音量、不重采样、不做其它处理。

这不是“永远更好听”的保证，而是一个验证链路的状态。你想确认 DAC、驱动、采样率是否按预期工作时，它很有用；你想让耳机更顺耳、修正房间、调左右偏音时，就会主动离开 bit-perfect。

更白话一点：

- bit-perfect 像“原封不动送快递”。
- DSP 像“送出前先按你的要求重新包装、修边、加保护”。

两者没有绝对高下，关键是你现在想做什么。

## EQ 怎么调才不容易翻车

EQ 是最常用的 DSP。新手先用 `Simple`，把它当成几个声音方向按钮：

| 想要 | 先试 | 注意 |
| --- | --- | --- |
| 鼓更有重量 | Bass | 低频多了可能糊，必要时降 Preamp |
| 人声更靠前 | Vocal | 太多会吵或鼻音重 |
| 高频更亮、更有空气 | Air | 太多会刺、齿音重 |
| 声音更厚、更柔和 | Warm | 可能牺牲清晰度 |
| 回到原始曲线 | Flat / Reset | Flat 不等于关闭 DSP，开关状态也要看 |

如果你进入 `Pro`，建议先只记住三段：

- 低频：大约 `20 Hz` 到 `160 Hz`，影响鼓、贝斯、厚度和轰鸣。
- 中频/人声：大约 `250 Hz` 到 `4 kHz`，影响人声、吉他、钢琴和存在感。
- 高频/空气：大约 `5 kHz` 到 `20 kHz`，影响亮度、齿音、空间感和细节感。

不要所有频段都往上推。想让某个部分更突出，很多时候是把其它部分稍微降下来，而不是一味加。

## Headroom 怎么用

Headroom 是“预留空间”。它不负责让声音变好听，它负责让后面的处理不要把声音顶爆。

推荐理解：

- `0 dB`：不额外预留。
- `-3 dB`：轻量保护，适合小幅 EQ。
- `-6 dB`：比较保守，适合明显低频增强、FIR、多个 DSP 模块叠加。
- 更低：只在确实有风险时使用。

开了 Headroom 后，整体可能会变小声。这不是坏掉，而是给信号留了余量。你可以在系统音量、耳放或设备端补回舒适音量，但不要为了“看起来响”把 DSP 处理一路推红。

## 耳机校正是什么

耳机校正不是“把所有耳机变成神耳机”。它更像给某个耳机型号贴一张修正地图：哪里太多，哪里太少，就用曲线轻轻补偿。

ECHO 的耳机校正会把 OPRA 相关曲线作为受管理的 EQ 状态使用。看到“耳机校正管理中”之类提示时，不要直接把它当普通自定义 EQ 乱改；如果你想继续自由编辑，先转换成自定义方案。

新手建议：

1. 只给确实匹配的耳机型号使用校正。
2. 校正后先用 A/B 对比确认是否更自然。
3. 如果声音变薄、变闷、变刺，关闭校正，不要硬用。
4. 耳机校正通常会影响 bit-perfect，这是正常的。

## FIR / 房间校正是什么

FIR / 房间校正常见于导入 IR 文件。IR 可以理解成一个“声音指纹”：系统用它来做卷积处理，让输出符合某个目标响应。

它适合这些场景：

- 你有测量麦克风和可靠测量流程。
- 你拿到了可信的房间、耳机或设备 IR。
- 你知道这个 IR 是给当前采样率、声道和用途准备的。

不适合这些场景：

- 随便下载一个不知道来源的 IR。
- 边排查播放问题边开 FIR。
- 没留 Headroom 就启用大幅校正。

安全做法：导入 IR 后，先预留 `-6 dB` 左右 Headroom，再启用 FIR，听音量、相位、左右声道是否正常。发现削波风险就先降低 Trim 或 Headroom。

## 声道工具怎么用

声道工具主要处理“左右”的问题，而不是处理整体音色。

常见用途：

- 耳机一边稍微大声，调左右增益。
- 人声不在中间，微调声像平衡。
- 检查左右声道有没有接反，临时交换左右。
- 用 Mono 检查左右合并后是否正常。
- 用左右延迟微调声像位置。

新手原则：只做小改动。左右增益从 `0.25 dB` 或 `0.5 dB` 这种小步开始；延迟也不要大幅拉。你是在微调方向盘，不是在拆车。

## 输出安全怎么看

`输出安全` 是 DSP 工作台里最值得经常看的页面。它会告诉你：

- 当前有没有 DSP 模块启用。
- 当前是不是 bit-perfect 候选路径。
- 有没有削波或余量风险。
- FIR、EQ、声道工具是否参与了处理。
- 建议下一步是继续监听、保持直通，还是先处理余量。

看到风险提示时，优先顺序是：

1. 降低 Headroom 或应用建议保护。
2. 降低 EQ 的 Preamp。
3. 减少 EQ 里向上推的频段。
4. 降低 FIR Trim。
5. 暂时关闭某个 DSP 模块，确认风险来自哪里。

不要在已经有削波风险时继续叠加更多增强。

## 常见问题

### 开了 DSP 以后 bit-perfect 没了，是 bug 吗

通常不是。EQ、FIR、声道处理、耳机校正、重采样、ReplayGain 等都会改变数字信号。只要改变了样本，就不能再说是原封不动输出。

### Flat 是不是等于关闭 EQ

不一定。`Flat` 只是曲线看起来平，EQ 开关如果仍然启用，信号仍可能经过 DSP 链路。想确认完全关闭，应该看 EQ 开关和输出安全状态。

### 为什么调高低频后声音反而变差

可能是低频堆积、Preamp 没降、耳机本身承受不了、录音本来就重低频，或者已经削波。先降低 Preamp / Headroom，再把增强幅度减半。

### 为什么开了 Headroom 声音变小

这是它的工作。Headroom 通过降低数字电平给后续处理留空间。你可以在设备端把听感音量补回来，但不要用数字增益把它又推爆。

### 新手到底该开哪些

日常听歌建议从这套开始：

1. `Headroom`：按建议或轻量预留。
2. `参数 EQ`：Simple 模式轻微调整。
3. `输出安全`：确认没有削波。

耳机校正、FIR、声道工具等到你有明确需求再开。

## 一句话总结

DSP 不是“越多越 HiFi”，而是“你明确知道想修哪里，并且能安全地修”。ECHO 的 DSP 工作台要帮你做到三件事：看清当前声音有没有被处理、知道处理会不会带来风险、随时能回到原始直通。

更短的 Simple 模式说明见 [DSP Simple 教程](/zh/docs/audio-output/dsp-simple/)。开发与边界说明见 [EQ 指南](/zh/docs/audio-output/eq/)。

---

# dsp-simple

Source: src/content/docs/zh/docs/audio-output/dsp-simple.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/audio-output/dsp-simple/

---
title: "DSP Simple 教程"
description: "面向普通听歌用户的 Simple 调音模式说明：Bass、Vocal、Air、Warm、Flat、安全提示和 Simple / Pro 选择。"
sidebar:
  order: 43
  label: "DSP Simple 教程"
---

`Simple` 是给普通听歌用户准备的轻量调音模式。它不是缩水版，也不是“低级模式”。它更像自动挡：你只告诉 ECHO 你想往哪个方向听，软件帮你把背后的 EQ 频点、前级和安全提示整理好。

如果 `Pro` 像一张满是旋钮的调音台，`Simple` 就像几张声音风格卡片：

- 想低频更有重量，点 `Bass`。
- 想人声更靠前，点 `Vocal`。
- 想高频更亮，点 `Air`。
- 想声音更厚、更柔和，点 `Warm`。
- 想回到平直，点 `Flat` 或重置。

## Simple 到底在干嘛

声音可以粗略分成三块：

| 区域 | 像什么 | 你会听到 |
| --- | --- | --- |
| 低频 | 地基和鼓点 | 低音、贝斯、鼓的重量 |
| 中频 | 人声和身体 | 歌手、吉他、钢琴、厚度 |
| 高频 | 光泽和空气 | 亮度、齿音、空间感、细节 |

`Simple` 不让你一上来面对一排频点，而是把常见动作做成按钮。你点 `Vocal`，它会主要照顾人声区域；你点 `Air`，它会轻轻处理高频空气感；你点 `Bass`，它会增加一点低频存在感。

## 新手怎么用

推荐这样试：

1. 播放一首你熟的歌。
2. 进左侧 `DSP`，打开 `参数 EQ`。
3. 保持 `Simple`。
4. 只点一个方向，例如 `Vocal`。
5. 听 20 到 30 秒。
6. 不舒服就换方向或重置，不要连续猛点。
7. 看到安全提示，就先点建议的安全动作或降低 Preamp。

你不是在“调出最正确答案”，你是在找“今天这副耳机、这首歌、这个音量下更舒服的声音”。

## 每个按钮怎么理解

| 按钮 | 白话解释 | 适合 |
| --- | --- | --- |
| `Bass` | 给鼓和贝斯加一点重量 | 流行、电子、低频偏薄的耳机 |
| `Vocal` | 把歌手从背景里稍微推出来 | 人声、ACG、播客、现场录音 |
| `Air` | 给高频和空间感开一点窗 | 声音偏闷、细节不够清楚 |
| `Warm` | 让声音更厚、更不刺激 | 高频偏刺、冷薄的设备 |
| `Flat` | 回到平直曲线 | 对比原始风格、重新开始 |

注意：`Flat` 只是曲线平直，不一定等于彻底关闭 DSP。想确认原始输出，要看 EQ 开关和 `输出安全` 页面。

## 安全提示怎么处理

如果 Simple 提醒你有削波或余量风险，别紧张。它大概是在说：

“你刚才把声音某些地方加高了，数字音频快碰到天花板了，先让一点空间。”

处理顺序很简单：

1. 点界面建议的安全动作。
2. 或把 Preamp 降低一些。
3. 或把刚才的增强幅度减小。
4. 如果还不放心，关掉 EQ 对比。

不要为了更大声一直往上推。大声不等于好听，爆掉更不等于 HiFi。

## Simple 和 Pro 怎么选

| 你现在的状态 | 选哪个 |
| --- | --- |
| 只是想声音更顺耳 | Simple |
| 不知道 1 kHz、Q 值、Preamp 是什么 | Simple |
| 想快速试几种味道 | Simple |
| 想精确改某个频点 | Pro |
| 要导入 Equalizer APO / 复杂 EQ | Pro |
| 要保存、绑定、微调完整方案 | Pro |

Simple 的目标是让你不用害怕 DSP。等你知道“我想减 6 kHz 的刺”“我想让 100 Hz 少一点轰”“我想控制 Q 值”时，再去 Pro。

## 一套懒人流程

日常听歌可以这样：

1. 先不开 DSP，确认这首歌本身正常。
2. 想要更有氛围，开 `Simple`。
3. 在 `Bass`、`Vocal`、`Air`、`Warm` 里选一个最顺耳的。
4. 有风险就应用安全建议。
5. 保存成自己的方案。
6. 想认真对比，就关闭 EQ 听 10 秒，再打开听 10 秒。

如果你分不出差别，那也很好：说明现在不需要调。DSP 最好的状态不是永远开满，而是在需要时刚好帮上忙。

## 最短结论

`Simple` 就是 ECHO 的“别让我看参数，我只想让声音更舒服”模式。它把复杂 EQ 包成几个听感方向，同时提醒你别把声音推爆。先用它，够用了就停；不够再进 `Pro`。

完整 DSP 新手教程见 [DSP 新手教程](/zh/docs/audio-output/dsp-beginner/)。

---

# eq

Source: src/content/docs/zh/docs/audio-output/eq.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/audio-output/eq/

---
title: "EQ 指南"
description: "ECHO Next EQ 的定位、bit-perfect 规则、DSP 链路、预设格式和稳定性验收。"
sidebar:
  order: 41
  label: "EQ"
---

ECHO NEXT EQ 是可播放、可解释、可关闭的 HiFi DSP 功能。它的第一原则不是“看起来专业”，而是让用户清楚知道：EQ 何时在改变声音、何时会禁用 bit-perfect、何时可能削波、何时已经真正 bypass。

## 推荐阅读

如果你不是来查实现细节，建议先看这两篇：

- [DSP 新手教程](/zh/docs/audio-output/dsp-beginner/)：先把 DSP、bit-perfect、Headroom、EQ、耳机校正和输出安全讲明白。
- [DSP Simple 教程](/zh/docs/audio-output/dsp-simple/)：只想轻量调音时，看 Bass、Vocal、Air、Warm、Flat 怎么选。

## 定位

EQ 属于 Audio Core 的 DSP 能力，不属于单纯 UI 装饰。

它应该做到：

- 实时可调。
- 不破坏播放稳定。
- 不在音频回调里做危险操作。
- 清楚影响 bit-perfect。
- 预设可保存、可导入、可回退。
- UI 对新手友好，同时保留专业控制。

它不应该做到：

- 伪装成“音质增强”。
- 默认开启并改变用户声音。
- 把 Flat preset 当作关闭 EQ。
- 为了曲线动画拖慢播放。
- 把 VST、卷积、房间校正、在线预设市场混进第一阶段。

## 功能范围

当前 EQ 核心范围：

- 10-band graphic / parametric hybrid EQ。
- band gain: `-12 dB` 到 `+12 dB`。
- preamp: `-12 dB` 到 `+6 dB`。
- band center frequency: `20 Hz` 到 `20 kHz`。
- fixed Q，当前默认 `1.0`。
- enable / bypass。
- built-in presets。
- user presets。
- curve visualization。
- clipping / headroom warning。
- native realtime DSP hook。

默认频点：

```text
31 Hz, 62 Hz, 125 Hz, 250 Hz, 500 Hz, 1 kHz, 2 kHz, 4 kHz, 8 kHz, 16 kHz
```

后续能力可以加，但不能挤进音频热路径：

- full parametric bands。
- realtime analyzer。
- dynamic EQ。
- auto gain。
- A/B compare persistence。
- per-output profile。
- per-headphone profile。

明确不在当前范围：

- VST host。
- convolution / room correction。
- AutoEQ database。
- network preset marketplace。
- 和歌词、MV、下载器、流媒体强绑定。

## Bit-perfect 规则

只要 EQ 启用，Audio Status 必须表达：

- `eqEnabled = true`
- `dspActive = true`
- `bitPerfectCandidate = false`
- `bitPerfectDisabledReason = eq_enabled`
- UI 显示当前输出不是 bit-perfect

EQ 关闭或 bypass 完成后：

- native processor crossfade 回 dry signal。
- bypass smoothing 到零后不再改变样本。
- 如果没有其他 DSP、重采样、ReplayGain、声道平衡或输出 mismatch，`bitPerfectCandidate` 才可以恢复。

Flat preset 不是 disabled：

- Flat 只是所有 band 为 `0 dB`、preamp 为 `0 dB`。
- 如果 EQ 仍启用，信号依然经过 DSP 链路。
- UI 不能把 Flat 写成 bit-perfect。

## 信号链路

```text
Decoded PCM
  -> optional ReplayGain / gain stage
  -> EQ Processor
       preamp
       band filters
       smoothing
       bypass crossfade
       clipping risk detection
  -> output bridge
```

原则：

- DSP 状态必须进入 audio status。
- UI 控制变化走 control path，不进入 PCM stdin。
- 音频回调只读实时安全参数。
- 预设文件 IO 不进入音频回调。

## Native DSP 结构

相关 native 文件：

- `native/audio-engine/EqTypes.h`
- `native/audio-engine/EqBand.h`
- `native/audio-engine/EqProcessor.h`
- `native/audio-engine/EqProcessor.cpp`
- `native/audio-engine/EqPresetStore.h`
- `native/audio-engine/EqPresetStore.cpp`
- `native/audio-engine/EqMessageProtocol.h`
- `native/audio-engine/EqMessageProtocol.cpp`

`EqProcessor` 负责：

- 每声道 biquad 状态。
- atomic target parameters。
- preamp smoothing。
- band gain smoothing。
- frequency smoothing。
- bypass crossfade。
- clipping risk detection。
- NaN / Inf 防护。

`EqMessageProtocol` 负责：

- 在控制线程解析 JSON-line。
- 校验参数。
- 更新 atomic targets。
- 不在 audio callback 内解析 JSON。

## 实时安全规则

JUCE/native audio callback 禁止：

- 分配大对象。
- 读写 JSON。
- 读写 preset 文件。
- 访问 Electron / React / IPC。
- 等待 mutex。
- 发网络请求。
- 打日志到慢 IO。
- 每个 sample 都重建所有滤波器系数。

参数更新必须：

- clamp 非法值。
- 使用 atomic target。
- gain / preamp 平滑约 `25 ms`。
- bypass crossfade 约 `15 ms`。
- 快速拖动时不输出 NaN / Inf。
- 频率拖动平滑后再重算系数。

## Electron Bridge

Renderer 只通过 `window.echo.eq` 控制 EQ。

命令：

- `eq:get-state`
- `eq:set-enabled`
- `eq:set-band-gain`
- `eq:set-band-frequency`
- `eq:set-preamp`
- `eq:set-preset`
- `eq:reset`
- `eq:list-presets`
- `eq:save-preset`
- `eq:import-preset`
- `eq:export-preset`
- `eq:delete-preset`

Renderer 不能：

- 直接访问音频 buffer。
- 直接控制 native socket。
- 直接写 preset 文件。
- 自己决定 bit-perfect 状态。

控制消息示例：

```json
{ "type": "eq:set-band-gain", "band": 3, "gainDb": 2.5 }
```

```json
{ "type": "eq:set-band-frequency", "band": 3, "frequencyHz": 360 }
```

状态示例：

```json
{
  "type": "eq:state",
  "enabled": true,
  "preampDb": -3,
  "bands": [
    { "frequencyHz": 31, "gainDb": 0, "q": 1 }
  ],
  "dspActive": true,
  "bitPerfectCandidate": false,
  "bitPerfectDisabledReason": "eq_enabled"
}
```

## Preset 格式

```json
{
  "id": "bass-boost",
  "name": "Bass Boost",
  "preampDb": -2,
  "bands": [
    { "frequencyHz": 31, "gainDb": 4, "q": 1 }
  ],
  "createdAt": "built-in",
  "updatedAt": "built-in",
  "readonly": true
}
```

内置预设建议：

- Flat
- Bass Boost
- Vocal Clear
- Treble Sparkle
- Loudness
- Night
- Headphone Warm
- Anime / J-Pop
- Rock
- Classical

规则：

- Built-in preset 只读。
- User preset 存在 Electron `userData`。
- 读取时校验字段、范围、band 数量。
- malformed preset 不能让设置页白屏。
- 导入同 id preset 时生成新 id，不静默覆盖本地调音。
- 删除用户 preset 后要 fallback 到安全状态。

## UI 结构

EQ UI 应该分层：

### Simple

给普通用户：

- 总开关。
- preset selector。
- preamp。
- headroom / clipping warning。
- reset。
- bit-perfect 影响提示。

### Pro

给高级用户：

- curve view。
- draggable band nodes。
- 频率 / 增益精确输入。
- selected band 控制。
- A/B 对比。
- undo / redo。
- preset save / import / export / delete。

### 状态提示

必须可见：

- EQ 是否启用。
- 当前是否 bypass。
- 当前是否影响 bit-perfect。
- 是否有 clipping risk。
- 当前 preset 是否已修改但未保存。

不要把复杂解释塞满页面。普通用户只需要知道“现在声音有没有被改、风险是什么、怎么关掉”。

## 曲线交互

曲线交互要稳：

- 拖动时节流发送。
- release 时发送准确最终值。
- band 节点尺寸稳定。
- tooltip 显示频率和增益。
- 不能因为快速拖动导致 UI 卡顿或 native 参数爆炸。
- 键盘/输入框也能精确调整。

曲线只是控制视图，不是事实来源。事实来源是 EQ state。

## Headroom 和削波

高增益 EQ 可能导致 clipping。

UI 应该：

- 在风险出现时提示降低 preamp。
- 不要自动偷偷改用户 preset，除非明确启用 auto gain。
- 区分“可能削波”和“已经检测到削波风险”。
- 夜间、低音增强等 preset 默认保留合理 preamp。

## 稳定性验收

Native DSP 测试应覆盖：

- disabled EQ 完全返回 dry input。
- Flat preset 启用时数值透明，但状态仍报告 DSP active。
- 高增益后 bypass crossfade 完成能回到 dry output。
- 快速 gain / frequency / preamp 改动不输出 NaN / Inf。
- 频率 clamp 在 `20 Hz` 和 `20 kHz` 边界稳定。
- steady-state 不每 sample 重算所有 biquad。

TypeScript / Renderer 测试应覆盖：

- `EqBridge` 输入校验。
- preset 持久化。
- malformed preset fallback。
- UI 开关和 preset 操作。
- 曲线编辑、undo/redo、A/B。
- EQ 或 channel balance 开启时 bit-perfect 状态禁用。
- headroom / clipping-risk telemetry。

可用入口：

```text
npm run test:audio-engine
```

只改文档不需要跑这些测试；改 native DSP 或 bridge 时才跑对应窄测试。

## 和其它音频功能的关系

EQ 与这些能力都可能共同影响 bit-perfect：

- ReplayGain。
- Preamp。
- Volume。
- Channel balance。
- Resampling。
- Speed / pitch。
- Crossfade / automix。

Audio Status 需要合并原因，不要只显示最后一个原因。UI 可以做简化展示，但诊断里要能看到完整原因列表。

## 一句话标准

ECHO NEXT 的 EQ 应该让声音调整更可控，而不是让声音链路更神秘。只要 EQ 开启，用户就应该清楚知道它改变了信号；只要 EQ 关闭，系统就应该真正回到不处理样本的路径。

---

# HiFi 音频术语详解

Source: src/content/docs/zh/docs/audio-output/hifi-glossary.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/audio-output/hifi-glossary/
Description: 从听感词、结像、分离度、声场，到采样率、bit-perfect、DAC、耳放、DSP、EQ、FIR 和输出安全的完整解释。

这篇是给 ECHO 用户看的 HiFi 音频术语详解。它不是让你背名词，也不是鼓励你把每个高级开关都打开。很多音频术语本来是为了描述声音、排查问题、理解设备链路，后来被营销、论坛黑话和玄学评价混在一起，反而让人越看越糊。

先记住一个原则：

**术语是用来帮助你听懂、调对、排查清楚的，不是用来证明某个设置一定更高级。**

如果你正在排查无声、爆音、半速、卡顿、切歌失败，先不要纠结“声场”“分离度”“DSD”“ASIO”“升频”。先切回 `System` 或 `WASAPI Shared`，关闭 EQ、DSP、ReplayGain、变速、FIR、独占、ASIO、DSD，确认普通 MP3 / FLAC 能稳定播放。等基础链路稳定后，再看这篇慢慢理解。

## 最短索引

| 你想查 | 先看这些词 |
| --- | --- |
| 声音听感 | 解析力、分离度、结像、声场、层次、动态、瞬态、密度、透明度 |
| 文件规格 | PCM、DSD、FLAC、WAV、采样率、位深、码率、无损、Hi-Res |
| 输出链路 | WASAPI、ASIO、独占、bit-perfect、重采样、线材、蓝牙编码、延迟 |
| 设备参数 | DAC、耳放、阻抗、灵敏度、推力、底噪、信噪比、失真、串扰 |
| DSP 调音 | EQ、Preamp、Headroom、FIR、IIR、相位、压缩、限制器、Crossfeed |
| 排查问题 | 削波、爆音、齿音、糊、闷、刺、偏音、底噪、左右反、声像漂 |

## 听感词不是测量报告

HiFi 圈常说的很多词是主观听感描述，不是精确仪器读数。例如“解析力好”“分离度高”“结像稳”“背景黑”，这些词可以帮助交流，但不能直接等同于某个单一参数。

同一套设备，在不同音量、不同耳机佩戴、不同房间、不同录音、不同心情下，听感都可能变化。写评价或调音时最好做到：

1. 用你熟悉的曲目反复对比。
2. 一次只改一个设置。
3. 音量尽量匹配，避免“大声一点就更好听”的错觉。
4. 分清“听起来更刺激”和“真实更准确”。
5. 分清“适合这首歌”和“适合所有歌”。

下面的术语解释会尽量用人话讲清楚，但你仍然要把它们当作沟通工具，而不是绝对真理。

## 解析力

解析力通常指系统把录音里的细节呈现出来的能力。比如歌手换气、指尖摩擦琴弦、鼓刷细碎纹理、混响尾音、背景里很轻的伴奏，这些都属于细节。

解析力好不等于声音一定亮，也不等于高频越多越好。很多设备会通过抬高高频、增强齿音和边缘感来制造“细节很多”的错觉，这种声音一开始很抓耳，听久了可能累、刺、薄。

更健康的解析力通常有这些表现：

- 小细节能听见，但不抢主旋律。
- 高频清楚，但不尖锐。
- 弱音和尾音自然出现，不像被硬拉出来。
- 复杂段落里仍然能分辨不同乐器。

如果你开 EQ 后觉得“解析力变强了”，要检查是不是只是高频或上中频推多了。可以用输出安全检查有没有削波，再把高频增益减半听一遍。

## 分离度

分离度指不同声音之间能不能分得开。比如鼓、贝斯、人声、吉他、钢琴同时出现时，你能不能听出它们各自在干什么，而不是糊成一团。

分离度受很多因素影响：

- 录音和混音本身是否清楚。
- 耳机或音箱的失真和瞬态能力。
- 声道串扰是否低。
- 低频是否过量堆积。
- DSP、EQ、房间声学是否造成遮蔽。

分离度不好常见表现是：

- 人声和伴奏粘在一起。
- 低频一多就盖住其它乐器。
- 大编制、金属、电子乐高潮段落变成一团。
- 音量越大越乱。

想改善分离度，不一定要先买设备。你可以先试：

1. 降低过多低频，尤其是 `80 Hz` 到 `250 Hz` 附近的堆积。
2. 降低整体音量，看看是不是耳机或耳放已经失真。
3. 关闭过度的空间音效、虚拟环绕、立体声增强。
4. 检查 DSP 是否削波。
5. 用更干净的录音做对比，不要用本来就糊的曲子判断系统。

## 结像

结像是非常重要但容易被误解的词。有些人会把它写成“结项”，更准确的说法是“结像”。

结像指声音在左右、前后、高低空间里的位置是否清楚、稳定、像一个具体的声源。比如人声是不是稳稳站在中间，吉他是不是在左前方，鼓是不是有宽度但不散。

结像好的系统通常会让你感觉：

- 人声中心稳定，不会飘来飘去。
- 乐器位置明确，不是一片雾。
- 声音边界自然，不会像贴纸一样硬。
- 左右声道平衡，中心不偏。

结像差可能来自：

- 耳机左右佩戴不一致。
- 左右声道增益不平衡。
- 线材或接口接触不良。
- 房间反射太强。
- 录音本身就是宽混响或特殊声像处理。
- 开了过度立体声增强、虚拟环绕或错误的 HRTF。

在 ECHO 里，如果你觉得人声偏左偏右，可以先检查声道工具里的左右平衡、左右互换、Mono 测试，再确认耳机佩戴和 Windows 声道设置。

## 声场

声场指你感受到的声音空间大小和形状。常见说法有“横向宽”“纵深好”“舞台靠前”“空间开阔”“头中效应明显”。

声场不是越大越好。过大的虚拟声场可能让声音变空、变散、人声变远；过小的声场可能让所有声音挤在头中间，听久了压迫。

影响声场的因素包括：

- 录音里的混响和麦克风摆位。
- 耳机开放式或封闭式结构。
- 音箱摆位和房间反射。
- 左右声道一致性。
- Crossfeed、HRTF、空间 DSP。
- EQ，尤其是上中频和高频。

如果你只用耳机听歌，很多“声场”其实来自录音和耳机结构，不要期待普通封闭耳机通过一个开关变成真实音箱声场。

## 层次感

层次感是指声音前后远近、主次关系是否清楚。分离度更偏“分得开”，层次感更偏“站位和远近有秩序”。

层次感好的声音不会把所有乐器都推到你脸上。主唱、伴唱、鼓、贝斯、弦乐、混响尾音会有前后关系。层次差则像所有声音贴在一张平面上。

常见破坏层次感的原因：

- 低频或低中频过量，遮蔽空间信息。
- 压缩太重，动态被压平。
- 音量过大导致耳机或放大器失真。
- 录音本身响度战争严重。
- 虚拟环绕或增强器把空间拉得不自然。

## 定位

定位和结像相关，但更强调声音位置判断。游戏里判断脚步位置、现场录音里听乐器站位、古典里听声部位置，都和定位有关。

定位依赖左右声道的时间差、音量差、频率差和混响信息。耳机定位和音箱定位不完全一样：耳机左右声道直接进左右耳，音箱则会有房间反射和双耳串音。

如果定位怪，先检查：

1. 左右声道是否接反。
2. 是否开了系统空间音效、虚拟环绕或耳机厂商音效。
3. 是否启用了错误的 HRTF 或 Crossfeed。
4. 耳机是否戴反。
5. 游戏或播放器是否输出了错误声道格式。

## 动态

动态指声音从小到大、从弱到强的变化能力。大动态是鼓点、爆发、管弦齐奏这类强弱跨度；微动态是歌手轻微咬字、弦乐力度变化、钢琴触键差异这类细小变化。

动态好会让音乐有起伏、有呼吸；动态差会让声音一直挤在同一个响度，听起来平、累、没情绪。

动态受这些因素影响：

- 母带是否被过度压缩。
- 播放链路有没有削波。
- 耳放和耳机是否有足够余量。
- DSP 是否使用了压缩器、限制器、响度增强。
- ReplayGain 或音量标准化设置。

很多流行音乐本身动态就被压得很小，这不是播放器能完全救回来的。

## 瞬态

瞬态指声音开始和停止的速度、干净程度。鼓槌打到鼓皮、拨片扫弦、钢琴敲击、电子鼓冲击，都是观察瞬态的地方。

瞬态好通常会让声音更利落、更有节奏感；瞬态差会让声音拖、软、慢、糊。

但瞬态太硬也可能变成刺、干、紧张。比如上中频和高频过多，可能会让瞬态边缘被夸张，听起来“很快”，实际是疲劳。

## 速度感

速度感不是播放速度变快，而是声音响应是否利落。低频速度感尤其常被讨论：鼓和贝斯是收得住，还是拖成一片。

低频速度慢常见原因：

- 低频量过多。
- 耳机单元控制力不足。
- 耳放推力或阻尼不合适。
- 房间低频驻波。
- EQ 在低频推得太猛。

如果你觉得低频慢，先不要急着说设备不行，先把低频 EQ 减少 `2 dB` 到 `4 dB`，再听同一段鼓和贝斯。

## 高频延伸

高频延伸指高频上端是否自然、完整、空气感是否足。它不是简单的“刺不刺”。好的高频延伸应该是开阔、细腻、有尾音，而不是尖、炸、齿音多。

高频不足可能会闷、暗、空气感少；高频过量可能会刺、薄、齿音重、听久疲劳。

年龄、听力状态、耳机佩戴、耳塞套、音量都会影响你对高频的感受。不要只根据别人说“高频好”就盲目拉高 `8 kHz` 以上。

## 低频下潜

低频下潜指低频能不能延伸到更低的位置，比如 `40 Hz` 以下的能量和氛围。它不等于低频量多。

常见区别：

- 低频量多：听起来轰、厚、震。
- 低频下潜好：深处有能量，但不一定糊。
- 低频质感好：能分辨鼓皮、贝斯弦、电子低频纹理。
- 低频控制好：来得快，收得住。

很多耳机把 `100 Hz` 到 `200 Hz` 做多，会让人以为低频强，其实可能只是中低频肥厚，不代表真正下潜好。

## 透明度

透明度指声音是否清澈、遮挡少、像没有一层雾。透明度好时，声音之间的空气和尾音更容易被感知。

透明度差常被形容为糊、闷、灰、蒙。原因可能是：

- 低中频堆积。
- 录音本身浑浊。
- 设备底噪或失真。
- 音量太大导致疲劳。
- DSP 处理过多或削波。

透明度不是高频越亮越好。亮而刺不叫透明，只是刺激。

## 密度

密度通常形容声音是否有实体感、信息是否充足。人声密度好会觉得嗓音有肉、有厚度；弦乐密度好会觉得不空、不虚。

密度差可能听起来薄、空、纸片化。密度过多也可能变厚、闷、拥挤。

调 EQ 时，`200 Hz` 到 `800 Hz` 一带会明显影响厚度和密度，但这里也最容易把声音调糊。小幅调整比大幅增强更安全。

## 冷、暖、亮、暗

这些是整体音色倾向：

| 词 | 大致含义 | 可能的问题 |
| --- | --- | --- |
| 暖 | 中低频更饱满，高频不刺激 | 可能闷、糊、慢 |
| 冷 | 低频少些，高频和线条更突出 | 可能薄、硬、没人情味 |
| 亮 | 高频或上中频更明显 | 可能刺、齿音重 |
| 暗 | 高频收敛，声音柔和 | 可能细节少、空气感不足 |

没有绝对正确的冷暖亮暗。你要看曲风、耳机、音量和个人偏好。

## 齿音

齿音是人声里 `s`、`sh`、`z`、`ch` 一类发音被突出时的刺耳感。常见位置大约在 `5 kHz` 到 `10 kHz`，但不同人声和设备会不同。

齿音重可能来自：

- 录音本来齿音多。
- 耳机高频峰值明显。
- EQ 把高频或空气感推多了。
- 音量太大。
- 压缩和激励器处理过重。

处理齿音可以用 De-esser、窄 Q EQ、降低高频增益，或者更简单地把音量降一点。不要为了压齿音把整个高频砍没。

## 刺、硬、薄、糊、闷

这些是常见负面听感：

| 词 | 常见含义 | 常见处理方向 |
| --- | --- | --- |
| 刺 | 高频或上中频过强，听久疲劳 | 降低高频、检查齿音、降低音量 |
| 硬 | 边缘过强，不够柔和 | 检查削波、降低上中频、减少压缩 |
| 薄 | 中低频不足，声音没肉 | 轻微增加低中频或减少高频 |
| 糊 | 低频/低中频堆积，细节被盖住 | 降低低频、检查房间和耳机佩戴 |
| 闷 | 高频不足或中低频遮蔽 | 轻微增加高频或减少低中频 |

这些问题通常不能靠一个“HiFi 增强”按钮解决。先找到频段，再小幅处理。

## 背景黑、底噪、噪声地板

“背景黑”通常是说没有明显底噪、杂音、毛刺，弱音和静默部分干净。更技术一点的说法是噪声地板低。

底噪可能来自：

- 声卡或 DAC 自身噪声。
- 耳放增益太高。
- 高灵敏度耳塞。
- 电脑 USB 供电噪声。
- 地环路。
- 系统音效或驱动问题。
- 录音本身有底噪。

如果暂停播放仍然有嘶声，可能是设备链路噪声；如果只有某些老录音有噪声，可能是录音本身。

## PCM

PCM 是最常见的数字音频表示方式。你可以把它理解成：每秒很多次记录声音波形的高度，然后按顺序播放这些数字。

常见 PCM 规格：

- `44.1 kHz / 16-bit`：CD 标准。
- `48 kHz / 24-bit`：视频、系统音频、制作流程里常见。
- `96 kHz / 24-bit`、`192 kHz / 24-bit`：常见 Hi-Res PCM。

PCM 不低级。绝大多数现代音乐制作、混音、母带和播放器内部处理都会大量使用 PCM。

## DSD

DSD 是另一类数字音频编码方式，常见规格有 DSD64、DSD128、DSD256。它和 PCM 的数据结构不同，不是简单的“采样率更高所以一定更好”。

你需要知道的重点：

1. DSD 播放高度依赖 DAC 和驱动。
2. 不支持原生 DSD 的链路可能要转成 PCM。
3. DoP 是把 DSD 包在 PCM 形态里传输，不是把 DSD 变成普通 PCM 音质。
4. 很多所谓 DSD 音源不一定来自原生 DSD 录音链路。
5. DSD 出问题时，先回到 PCM 验证基础播放。

DSD 可以玩，但不要把它当成好声音的唯一入口。

## FLAC、WAV、ALAC、APE

这些都是常见音频文件格式：

| 格式 | 类型 | 说明 |
| --- | --- | --- |
| WAV | 通常无压缩 PCM 容器 | 文件大，结构直接，标签体验不一定好 |
| FLAC | 无损压缩 | 常见、体积较小、标签友好 |
| ALAC | Apple 无损 | Apple 生态常见 |
| APE | 无损压缩 | 老曲库常见，兼容性和解码压力可能不如 FLAC |

无损的意思是解码后能还原原始 PCM 数据，不是“所有无损文件都一定好听”。如果母带差、转录差、假无损，格式再好也救不回来。

## MP3、AAC、Opus

这些是有损编码。它们会丢弃一部分人耳相对不敏感的信息来节省空间。

有损不等于一定难听。高码率 AAC、Opus、MP3 在很多场景下已经足够好。真正影响听感的可能是：

- 码率太低。
- 多次转码。
- 源文件本来差。
- 编码器质量差。
- 蓝牙再次有损压缩。

不要只看文件后缀判断音质。一个好母带的高码率 AAC，可能比一个来源不明的“假无损”更好听。

## 采样率

采样率表示每秒记录多少个采样点。`44.1 kHz` 就是每秒 44100 个采样点。

采样率更高的潜在意义：

- 给制作和处理留更多空间。
- 让某些滤波器设计更宽松。
- 支持更高频率范围。

但对日常听歌来说，采样率不是越高越好。高采样率文件需要更大空间、更高带宽、更稳定驱动，也可能触发设备兼容问题。Windows 默认格式长期拉到 `192 kHz` 或 `384 kHz` 并不会自动让所有声音变高级。

## 位深

位深表示每个采样点用多少位数字记录。常见有 `16-bit`、`24-bit`、`32-bit float`。

位深主要影响动态范围和处理余量：

- `16-bit` 对最终发行已经足够可用。
- `24-bit` 在录音、混音、DSP 处理时更有余量。
- `32-bit float` 常用于内部处理和制作流程，方便避免中间计算溢出。

位深不是“高频更多”或“低频更猛”。如果你听到 24-bit 明显更好，可能是母带版本、音量、处理链路不同，不一定是位深单独造成。

## 码率

码率表示单位时间内用了多少数据，常见单位是 `kbps` 或 `Mbps`。有损格式里，码率通常越高越容易保留更多信息；无损格式里，码率更多反映音乐复杂度和压缩效率。

不要跨格式简单比较码率。例如 `320 kbps MP3` 和 `256 kbps AAC` 不能只看数字大小就判输赢，因为编码效率不同。

## Hi-Res

Hi-Res 通常指高于 CD 规格的音频，例如 `24-bit / 96 kHz`。它是规格标签，不是好听保证。

判断 Hi-Res 时要注意：

1. 是否真的是高分辨率母带。
2. 是否只是从低规格升频。
3. 播放链路是否支持对应规格。
4. 设备和耳机是否能体现差异。
5. 音量是否匹配。

Hi-Res 可以是好东西，但“Hi-Res 文件”不自动等于“更好的版本”。

## bit-perfect

bit-perfect 指播放器尽量把音频数据原样送到输出设备，不改音量、不 EQ、不重采样、不做 DSP。

它适合用于验证链路：

- 文件采样率是否按预期打开设备。
- DAC 是否收到目标格式。
- DSP 是否真的关闭。
- 系统混音器是否被绕开。

但 bit-perfect 不等于永远更好听。你如果需要耳机校正、房间校正、左右平衡、ReplayGain、EQ，就会主动改变样本，这时就不再是严格 bit-perfect。

在 ECHO 里，开启 EQ、FIR、声道工具、耳机校正、重采样、ReplayGain 等，都可能让 bit-perfect 候选状态失效。这是正常逻辑，不是 bug。

## 重采样、升频、过采样

这些词容易混：

| 词 | 大致意思 |
| --- | --- |
| 重采样 | 把一种采样率转换成另一种采样率 |
| 升频 | 把较低采样率转换到较高采样率 |
| 降频 | 把较高采样率转换到较低采样率 |
| 过采样 | DAC 或处理器内部为了滤波和转换而使用更高内部采样率 |

重采样质量取决于算法和实现。好的重采样可以很透明，差的重采样可能带来失真、混叠、毛刺或相位问题。

Windows 共享模式下经常会把不同应用统一到设备默认格式，这也是一种重采样路径。想减少这类影响，可以在设备稳定时试 WASAPI Exclusive，但不要为了追求名词牺牲稳定。

## 抖动 Jitter

Jitter 指数字音频时钟时间点的微小误差。它常被营销夸大，也确实是数字音频链路里的技术问题。

现代合格 DAC 通常会通过缓冲、重时钟、异步 USB 等方式把 jitter 控制得很低。普通用户更应该先关注：

- 文件来源。
- 耳机和音箱。
- 输出模式是否稳定。
- 是否削波。
- 是否有底噪和驱动问题。

不要把所有听感差异都归因于 jitter。它不是万能解释。

## DAC

DAC 是 Digital-to-Analog Converter，数模转换器。它把数字音频变成模拟电信号，再送给耳放、功放、音箱或耳机。

DAC 重要，但不是越贵越玄。评价 DAC 时可以看：

- 是否支持你需要的采样率、位深、DSD。
- 驱动是否稳定。
- 输出电平是否合适。
- 噪声和失真是否低。
- 和耳放或有源音箱的连接是否匹配。

如果一个 DAC 的驱动不稳定，参数再漂亮也会影响日常体验。

### 买解码不要只看芯片

很多人买解码器会先问“用的什么 DAC 芯片”，比如 ESS、AKM、Cirrus Logic、ROHM、TI/Burr-Brown 等。芯片当然重要，但它只是一台 DAC 里的一个环节，不是整机声音和体验的全部。

同一颗 DAC 芯片，放在不同机器里，声音、底噪、稳定性、输出电平、接口兼容性都可能不同。原因很简单：芯片后面还有时钟、电源、I/V 转换、低通滤波、模拟输出级、耳放级、USB 接收、驱动、固件、PCB 布线、接地、屏蔽和增益设计。芯片规格表里的动态范围和 THD+N 是理想条件下的能力，整机能不能把它做好，是另一回事。

买解码更应该看这些：

| 项目 | 为什么重要 |
| --- | --- |
| 驱动和兼容性 | Windows 下是否稳定，WASAPI / ASIO 是否正常，休眠唤醒后会不会丢设备 |
| 输出接口 | 你需要 RCA、XLR、同轴、光纤、USB、蓝牙，还是耳机口 |
| 输出电平 | 太低可能推不满后级，太高可能让有源音箱或耳放前端过载 |
| 底噪 | 高灵敏度耳塞最容易暴露底噪，漂亮芯片不等于整机无底噪 |
| 输出阻抗 | 对多单元动铁耳塞、低阻耳机可能影响频响 |
| 模拟输出级 | 决定实际驱动能力、失真、噪声、声道一致性和声音稳定性 |
| 电源和接地 | 影响 USB 噪声、地环路、电流声和抗干扰 |
| 音量控制 | 数字音量、模拟音量、遥控、前级模式是否符合你的使用方式 |
| 功能稳定性 | DSD、MQA、蓝牙、显示屏、遥控、固件升级，都要看你是否真的需要 |
| 售后和固件 | 驱动出问题、系统升级后不兼容时，售后比芯片型号更实际 |

更直接一点说：**买解码不是看芯片有多好，而是耳朵收货。** 你最终要判断的是：它接在你的电脑、你的耳放、你的有源音箱、你的耳机上，是否稳定、安静、音量合适、没有爆音、没有电流声，听你熟悉的歌是否舒服。

试听时可以这样做：

1. 先用你最熟悉的歌，不要只听店里专门挑的“发烧试音曲”。
2. 音量尽量匹配，声音大一点常常会被误认为“解析更好”。
3. 听弱音和暂停时的底噪，尤其是高灵敏度耳塞。
4. 听复杂段落有没有乱、刺、硬、挤。
5. 测 USB 是否会断连，切歌是否爆音，休眠唤醒是否正常。
6. 看它和你现有设备的接口是否匹配，不要为了芯片买回来再到处转接。
7. 如果 AB 对比差异很小，就不要被参数和旗舰话术逼着升级。

芯片型号可以作为筛选信息，但不要当成购买结论。好芯片加差设计，未必好听；普通芯片加稳定整机设计，也可以非常耐听。

## 耳放、功放、推力

耳放负责驱动耳机，功放负责驱动音箱。所谓推力，通常是说放大器能否提供足够电压、电流和控制力，让耳机或音箱在目标音量下保持低失真。

推力不足可能表现为：

- 音量开很大仍然不够响。
- 低频软、散、收不住。
- 大动态时声音挤、破、乱。
- 声音薄或没控制力。

但推力不是越大越好。高灵敏度耳塞接高增益耳放可能底噪明显，音量旋钮也难调。

## 阻抗和灵敏度

耳机阻抗通常用欧姆表示，灵敏度表示给定输入下能发出多大声音。两者共同决定耳机好不好驱动。

常见误区：

- 高阻抗不一定难推，低阻抗也不一定好推。
- 灵敏度高的耳机可能很容易出底噪。
- 低阻抗多单元耳塞可能对输出阻抗更敏感。
- 手机能推响，不代表推得好；但推不推得好也不能只看音量。

如果你不知道怎么判断，就先看设备厂商建议和实际听感：音量是否够、底噪是否明显、低频是否失控、大动态是否破。

## 输出阻抗

输出阻抗是播放器、耳放或声卡输出端自身的阻抗。它会和耳机阻抗相互作用，尤其会影响某些多单元动铁耳塞的频响。

一般来说，低输出阻抗更适合大多数耳机，能减少频响被改变的风险。高输出阻抗不一定不能听，但可能让声音变暖、低频变松、频响变形。

## 信噪比、动态范围、THD+N

这些是常见测量参数：

| 参数 | 含义 |
| --- | --- |
| SNR 信噪比 | 信号相对噪声有多高 |
| Dynamic Range 动态范围 | 最大可用信号和噪声地板之间的范围 |
| THD+N | 总谐波失真加噪声 |
| Crosstalk 串扰 | 左右声道互相漏过去多少 |

参数很有用，但不要只看单项冠军。一个设备如果驱动不稳、输出电平不匹配、底噪对你的耳塞明显，漂亮参数也不能保证体验好。

## 平衡输出

平衡输出常见接口有 `2.5 mm`、`4.4 mm`、`XLR`。它可能提供更高输出功率、更好的声道分离或更低噪声，但不自动等于音质翻倍。

注意：

1. 耳机线必须正确支持平衡。
2. 不要用乱接转接头把单端耳机硬接平衡。
3. 平衡口功率更大，高灵敏度耳塞更容易听到底噪。
4. 同一设备上平衡口好不好，要看具体设计。

## 线材

线材当然有用，但它的作用首先是**把正确的信号可靠、低损耗、低干扰地送到下一台设备**。线材不是调音神药，也不是越贵越好；它真正相关的东西通常是电阻、电容、电感、屏蔽、阻抗匹配、接触电阻、机械可靠性和使用长度。

可以先记住一句话：

**线材最容易解决的是故障、噪声、接触不良、长度不合适和规格不匹配；最不应该期待的是凭空让一套本来正常的系统“解析翻倍”。**

常见线材可以这样分：

| 线材 | 常见接口 | 真正重要的点 | 常见问题 |
| --- | --- | --- | --- |
| 耳机线 | `3.5 mm`、`6.35 mm`、`2.5 mm`、`4.4 mm`、XLR | 接线定义、阻抗、接触可靠性、柔软度、麦克风/遥控兼容 | 左右声道反、平衡转接错误、插头接触不良、听诊器效应 |
| 模拟信号线 | RCA、XLR、TRS | 屏蔽、低电容、接地方式、平衡/非平衡匹配 | 嗡声、电流声、射频干扰、长距离高频衰减 |
| 喇叭线 | 香蕉头、Y 插、裸线、接线柱 | 线规、电阻、接触面积、正负极一致 | 低频控制变差、声道接反、短路、端子氧化 |
| 数字同轴线 | RCA、BNC | `75 Ω` 特性阻抗、屏蔽、端接质量 | 锁不住、爆音、丢包、接口反射导致边沿变差 |
| AES/EBU 线 | XLR | `110 Ω` 平衡数字线、双绞、屏蔽 | 用普通麦克风线短距离可能能响，但长距离和专业链路不稳 |
| USB 线 | USB-A/B/C | 数据线合规、屏蔽、供电能力、接口稳定 | DAC 断连、爆音、供电噪声、只充电不传数据 |
| 光纤线 | TOSLINK、Mini-TOSLINK | 插头对准、弯折半径、长度、发射/接收强度 | 无声、锁不住、格式上限较低，但能隔离地环路 |
| 网线 | RJ45 | 规格达标、屏蔽需求、长度、接头质量 | 网络不稳、远程曲库卡顿；正常传输时不会给音频“调音” |
| 电源线 | IEC、国标、美标等 | 安全认证、接地、线径、插头接触、承载电流 | 接触不良、地线问题、安全风险；不应乱改保护地 |

### 为什么线材有用

线材有用，是因为它不是“空气里的玄学通道”，而是一个实际电气部件。

1. **电阻会造成压降和损耗。** 喇叭线尤其明显，因为功放面对的是 `4 Ω` 或 `8 Ω` 这类低阻抗、高电流负载。线太细、太长，线材电阻会吃掉一部分功率，还可能影响阻尼系数和频响平直度。耳机线通常电流小很多，但极低阻抗耳机、很长或质量很差的线，仍可能带来可测变化。
2. **电容会和输出阻抗形成低通效应。** 模拟 RCA 这类非平衡高阻抗连接，线越长、电容越高，越可能让高频轻微滚降；多数家用短线不严重，但唱放、老设备、高输出阻抗设备、很长的非平衡线更敏感。
3. **电感会影响高频和瞬态边沿。** 对普通短模拟线通常不是首要问题，但喇叭线和某些怪异高电容/高电感结构可能和功放互相影响。不要为了“结构复杂看起来高级”去买参数奇怪的线。
4. **屏蔽会影响抗干扰。** RCA、3.5 mm、唱机线、低电平模拟线更需要好屏蔽；喇叭线因为信号电平和电流都大，通常不靠屏蔽解决音质问题。把电源线和模拟信号线长距离并排走线，是制造嗡声和电流声的常见来源。
5. **平衡连接能降低共模噪声。** XLR/TRS 平衡线用两根信号导体加屏蔽，接收端看两根信号之间的差值，对两根线上共同拾取的干扰有抵消能力。它适合长距离、低电平、复杂电源环境。注意：只有线材、发送端和接收端都按平衡方式工作，才是真正的平衡链路；RCA 插头不会因为线里多一根导体就变成平衡。
6. **数字线需要规格匹配。** USB、S/PDIF、AES/EBU、HDMI、网线这类不是在传“模拟音色”，而是在传高速数字信号。它们的问题通常表现为连接不稳、爆音、锁定失败、带宽不足、供电不稳，而不是“高频更甜”。数字同轴应看 `75 Ω`，AES/EBU 应看 `110 Ω`，USB-C 还涉及数据速率、供电能力和 eMarker 等合规问题。
7. **接头和焊接/压接非常重要。** 很多“换线有效”的案例，本质是旧线插头松、氧化、虚焊、屏蔽断、地线接触差、左右声道接错。稳定的插头、合适的插拔力度、良好的应力释放，比神秘材料更实际。
8. **长度会放大一切问题。** 短距离正常系统里差异可能很小；距离越长，电阻、电容、屏蔽、阻抗、接地、机械可靠性越重要。桌面 DAC 到耳放的一米 RCA 和舞台上几十米信号线，不是同一个难度。

### 线材参数怎么读

线材页面上经常会写一堆参数，真正值得看的通常是这些：

| 参数 | 看哪里 | 怎么理解 |
| --- | --- | --- |
| AWG / 线规 | 喇叭线、电源线、部分 USB 线 | 数字越小通常越粗；喇叭线越长、喇叭阻抗越低，越需要足够粗 |
| 电阻 | 喇叭线、耳机线、电源线 | 越低越不容易造成压降；对低阻抗、高电流场景更重要 |
| 电容 | RCA、唱机线、长模拟线 | 太高可能和高输出阻抗设备形成高频滚降 |
| 电感 | 喇叭线、特殊结构线 | 过高可能影响高频或和功放稳定性互动 |
| 屏蔽覆盖率 | RCA、麦克风线、USB、数字同轴 | 屏蔽越好越不容易拾取干扰，但喇叭线通常不靠屏蔽解决音质 |
| 特性阻抗 | S/PDIF、AES/EBU、USB、HDMI、网线 | 数字/高速传输才重点看；S/PDIF 看 `75 Ω`，AES/EBU 看 `110 Ω` |
| 接头材质和结构 | 所有线 | 重点不是“镀金一定好听”，而是抗氧化、接触稳定、夹持可靠 |
| 弯折半径 | 光纤、粗线、便携线 | 过度弯折可能让光纤衰减、线芯损伤或接头受力 |

不要只看材料名。铜、镀银、纯银、单晶铜、无氧铜这些词经常被拿来营销，但如果没有线规、电阻、电容、屏蔽、端接和做工信息，单独一个材料名不能说明它适不适合你的系统。

### 什么时候换线真的有意义

这些情况换线或重做线材很有意义：

- 线太长、太细，尤其是喇叭线。
- 插头松、氧化、转一下就断声。
- RCA 一接就嗡，换走线或换屏蔽更好的线后明显改善。
- USB DAC 会断连、爆音、识别不稳定。
- 平衡耳机线定义不对，或者转接方式有安全风险。
- 光纤线弯折严重、插不稳、设备锁不住。
- 线身太硬、太重、听诊器效应太明显，影响佩戴和使用。
- 舞台、录音、长距离布线，需要平衡线和可靠屏蔽。

这些情况不建议先换线：

- 系统本身已经无噪声、无断连、无接触问题，线也很短。
- 你只是觉得“别人都说这根线解析好”。
- 耳机佩戴、音箱摆位、房间声学、EQ 问题还没处理。
- 你还没确认音量匹配，就觉得换线后“更大声所以更好”。
- 预算有限，但耳机、音箱、房间、耳放匹配明显还有大问题。

### 线材烧不烧

很多线材商会说“煲线几百小时”。从工程角度看，线材不是扬声器单元，也不是机械悬边，它不会像耳机振膜或音箱单元那样有明显机械磨合。新线刚开始听起来不同，常见原因可能是：

- 旧线接触不良，新线接触恢复正常。
- 插拔后接口氧化层被摩擦掉。
- 新线更柔软，耳机佩戴角度变了。
- 音量没有完全匹配。
- 人耳和注意力在适应新声音。

如果线材真的需要几百小时才“打开声音”，那更应该要求卖家提供可测参数变化，而不是只给形容词。日常使用里，把线插牢、走线合理、避免拉扯和氧化，比煲线重要得多。

### 不同线材该怎么选

**耳机线**重点看接口定义和安全。`2.5 mm`、`4.4 mm`、XLR 平衡线不能随便和单端互转；错接可能损坏设备。耳机线升级最实际的收益通常是更柔软、更耐用、更少听诊器效应、更少接触不良。声音差异如果存在，也多半来自阻抗、接触、原线损坏或耳塞对输出阻抗敏感，不要默认“银线一定亮、铜线一定暖”。

**RCA 非平衡模拟线**适合短距离。它的屏蔽层既参与参考地/回流，又承担屏蔽任务，所以更容易受地环路和屏蔽电阻影响。家用建议尽量短、避开电源线和开关电源，选做工稳定、屏蔽好、不过度高电容的线。

**XLR/TRS 平衡线**适合长距离、设备多、干扰多的场景。它不是“音质等级更高”的代名词，而是抗噪声能力更强。家用桌面短距离如果没有嗡声，RCA 也可以完全正常；如果前后级都有真平衡接口、线比较长、环境复杂，XLR 会更稳。

**喇叭线**主要看线规和长度。一般家庭长度下，合格铜线、足够粗、接头牢靠就很重要。线太细会增加串联电阻；电阻上升会降低功放对喇叭的控制余量，也可能让频响随喇叭阻抗曲线轻微变化。不要让裸线毛刺短接正负极。

**数字同轴 S/PDIF**最好用真正 `75 Ω` 同轴线，尤其是线较长、设备时钟恢复能力一般、接口容易锁不稳时。普通 RCA 音频线短距离有时也能响，但不等于规格正确。

**AES/EBU**是平衡数字音频，常见 XLR 接口，线材目标是 `110 Ω`。它和模拟 XLR 线长得像，但用途不同；短距离混用不一定立刻出问题，严肃链路和长距离还是用对应规格更稳。

**USB DAC 线**不要迷信“音色”，先看是否真能稳定传数据、是否支持所需速率、供电是否可靠、插头是否松。对 USB 供电 DAC 来说，供电噪声、电脑接口、电源管理和地环路可能比线材品牌更关键。遇到爆音/断连，优先换短一些、合规、屏蔽好、数据能力明确的线，并避开劣质延长线和集线器。

**光纤 TOSLINK**的价值是电气隔离。它可以切断地环路路径，避免电脑和音响之间通过铜线共享地电位；缺点是格式上限、接口强度和线材弯折更敏感。用光纤解决“电脑接 DAC 有电流声”有时非常有效。

**网线**对 WebDAV、Jellyfin、Emby、NAS、本地服务器很重要，但它影响的是网络稳定和吞吐，不是直接给 PCM “润色”。能稳定传输、无丢包、无卡顿，就已经完成主要任务。不要把网线当成模拟调音线。

**电源线**优先讲安全。要选有认证、线径和插头规格合适、接地可靠的线；不要剪地线、拆保护地、用来路不明的大功率线。电源问题如果真的影响音频，常见路径是地环路、漏电流、开关电源噪声、接触不良和设备电源设计，不是“线材把音乐细节补出来”。

### 线材和听感词的关系

线材问题可能表现成这些听感：

| 听感/现象 | 更可能的线材原因 |
| --- | --- |
| 嗡声、电流声 | 地环路、RCA 屏蔽/接地问题、信号线和电源线走线太近 |
| 单边小声或断续 | 插头氧化、虚焊、线芯断裂、接口松动 |
| 左右反、中心偏 | 接线定义错误、左右声道插反、平衡线转接错误 |
| 爆音、DAC 断连 | USB 线不合规、接口松、供电不稳、集线器/延长线问题 |
| 同轴/光纤无声 | S/PDIF 锁定失败、格式不支持、线太长或插头未插紧 |
| 低频松、动态差 | 喇叭线过细过长、端子接触不良、功放/喇叭匹配问题 |
| 高频暗一点 | 过长高电容非平衡模拟线、老设备高输出阻抗、唱机线不合适 |

但如果一套系统没有噪声、没有断连、没有接触不良、长度很短、接口规格正确，继续换昂贵线材通常收益会迅速变小。更高效的升级顺序往往是：音源/母带、耳机或音箱、佩戴/摆位、房间声学、放大器匹配、EQ/DSP 校正，最后才是线材微调。

### ECHO 用户怎么排查线材

1. 有爆音、断连、识别失败：先换短 USB 线，直连电脑主板接口，绕开集线器和延长线。
2. 有嗡声：让电脑、DAC、功放尽量接同一个插排；模拟 RCA 避开电源线；必要时试光纤隔离。
3. 人声偏左/偏右：开 Mono，换左右声道，交换线材左右端，判断是耳机、线、接口还是录音。
4. 喇叭系统低频松：检查正负极、接线柱、裸线毛刺和线规，不要让端子半松不紧。
5. 平衡口无声或怪声：确认耳机线是真平衡定义，不要用错误转接头。
6. 远程曲库卡顿：先查网线、路由器、NAS、Wi-Fi 和服务器吞吐，不要把网络问题误判成解码音质问题。
7. 换线前后比较：保持音量一致，只换一件东西，反复插拔确认不是接触重新变好造成的错觉。

### 买线建议

买线时优先看这些：

- 接口定义正确，尤其是 `2.5 mm`、`4.4 mm`、XLR、耳机私有针脚。
- 长度合适，能短则短，但不要拉得太紧。
- 有明确规格：线规、屏蔽、阻抗、USB 速率/电流能力、S/PDIF `75 Ω`、AES/EBU `110 Ω`。
- 插头结实，插拔不松，线身柔软但不脆。
- 售后和安全认证可靠，尤其是电源线。

不建议优先为这些说法付高价：量子、纳米玄学、方向性音场、煲线几百小时、把数字线当模拟调音器、没有参数只有故事的“旗舰线”。线材可以认真选，但不要让线材预算超过它在系统里真正承担的任务。

### 参考资料

- [Blue Jeans Cable: Speaker Cables](https://www.bluejeanscable.com/store/speaker/index.htm)：喇叭线电阻、导电性、阻尼系数和线规。
- [Blue Jeans Cable: LC-1 Design Notes](https://www.bluejeanscable.com/articles/LC1-design-notes.htm)：非平衡模拟线的屏蔽和电容。
- [Audioholics / Henry Ott: Balanced vs. Unbalanced Cables](https://www.audioholics.com/audio-video-cables/balanced-vs-unbalanced-interconnects/)：平衡/非平衡连接、屏蔽电流、共模噪声抑制。
- [Canare: 110Ω Digital Audio Cable](https://www.canare.com/110ohmdigitalaudiocable)：AES/EBU `110 Ω` 数字音频线规格。
- [Blue Jeans Cable: Digital Audio Cables](https://www.bluejeanscable.com/store/digital-audio/index.htm)：S/PDIF `75 Ω` 同轴、TOSLINK、AES/EBU 的线材分类。
- [USB-IF: USB Type-C Functional Test Specification](https://usb.org/sites/default/files/USB%20Type%20C%20Functional%20Test%20Specification%202021%2005%2020.pdf)：USB-C 线缆电流能力、合规和有源线缆相关要求。

## 蓝牙编码

蓝牙耳机通常会经过蓝牙编码，例如 SBC、AAC、aptX、LDAC、LHDC 等。蓝牙很方便，但它会引入编码、延迟、系统调度和无线环境因素。

你需要知道：

- 蓝牙通常不是 bit-perfect。
- 编码规格高不代表连接一定稳定。
- 高码率模式更容易受信号环境影响。
- 游戏和视频更关心延迟。
- 不同手机、电脑、耳机支持的编码不同。

如果蓝牙声音断续，先降低高码率模式或靠近设备，不要先怪播放器。

## DSP

DSP 是 Digital Signal Processing，数字信号处理。它包括 EQ、耳机校正、房间校正、FIR、声道平衡、Crossfeed、重采样、压缩、限制等。

DSP 不是低级，也不是背叛 HiFi。它的价值是：在数字域里可控地修正或塑造声音。

但 DSP 也有代价：

- 会改变原始样本。
- 通常不再是严格 bit-perfect。
- 可能增加延迟。
- 参数不当会削波、相位异常、声音变怪。
- 多个模块叠加时更需要 Headroom。

最稳的 DSP 使用原则是：**有目的地开，少量地调，经常看输出安全。**

## EQ

EQ 是均衡器，用来调整不同频率的音量。常见类型：

| 类型 | 用途 |
| --- | --- |
| Graphic EQ 图示均衡 | 固定频段，上手简单 |
| Parametric EQ 参数均衡 | 可调频率、增益、Q，更精确 |
| Shelf 架式滤波 | 整体抬高或降低低频/高频 |
| High-pass 高通 | 切掉低于某频率的内容 |
| Low-pass 低通 | 切掉高于某频率的内容 |
| Notch 陷波 | 很窄地削掉某个问题频点 |

参数 EQ 里最重要的三个参数：

- `Frequency`：中心频率。
- `Gain`：提升或降低多少 dB。
- `Q`：影响范围宽窄，Q 越高范围越窄。

新手不要一上来把多个频段都加很多。更安全的做法是：想突出某个部分时，优先削掉遮蔽它的频段，而不是所有东西都往上推。

## Preamp 和 Headroom

Preamp 是进入 EQ 或 DSP 前后的整体增益。Headroom 是预留余量，防止处理后超过 `0 dBFS`。

如果 EQ 里有多个频段是正增益，例如低频 `+4 dB`、高频 `+3 dB`，整体信号很容易超过数字上限。这时需要降低 Preamp 或开启 Headroom。

实用建议：

- 轻微 EQ：预留 `-3 dB` 常常够用。
- 明显增强低频或多段提升：考虑 `-6 dB`。
- FIR、耳机校正、声道补偿叠加：更要看输出安全。
- 听到破音、炸、硬，先查削波。

Headroom 让声音变小不是坏事，它是在给信号留安全空间。

## 削波和 0 dBFS

数字音频有一个上限，通常叫 `0 dBFS`。信号超过它就会被截断，产生削波。削波会让声音变硬、炸、刺，严重时就是破音。

常见削波来源：

- EQ 正增益过多。
- Preamp 太高。
- ReplayGain 增益过高。
- FIR 或卷积响应带来峰值提升。
- 多个 DSP 模块叠加。
- 音源本身已经过度压缩或削波。

如果 ECHO 的输出安全提示有风险，先降 Headroom 或 Preamp，不要继续叠加增强。

## FIR、IIR 和卷积

FIR 和 IIR 是两类常见数字滤波器。你不需要先背数学，但要知道它们的听感和使用场景可能不同。

| 术语 | 大致理解 |
| --- | --- |
| FIR | 可以做很精确的频响和相位控制，常用于卷积、房间校正、线性相位滤波 |
| IIR | 计算效率高，常用于常规 EQ、低通、高通、架式滤波 |
| 卷积 | 用一个 IR 文件或滤波响应处理音频 |
| IR | Impulse Response，冲激响应，可以理解成某个系统的声音指纹 |

FIR / 卷积强大，但更容易因为 IR 来源、采样率、声道、增益、延迟设置不当而出问题。导入 IR 前确认来源可靠，启用后先留 Headroom。

## 相位

相位描述波形在时间上的相对位置。相位问题可能导致声音变薄、低频抵消、声像漂移、空间怪异。

常见相位相关术语：

- `Minimum phase`：最小相位，常见于传统 EQ，延迟低。
- `Linear phase`：线性相位，能保持频率间相位关系，但可能增加延迟和预响。
- `Polarity`：极性，常说的正负相反，不完全等同于复杂相位。
- `Pre-ringing`：线性相位滤波可能出现的预响，瞬态前出现轻微振铃。

日常听歌不必恐惧相位，但不要乱套不明来源的 FIR 或空间音效。

## 压缩器、限制器、响度

压缩器会缩小动态范围，让大声部分被压低，小声部分相对更明显。限制器是更强硬的上限保护，防止峰值超过设定值。

它们不是坏东西，录音制作里很常见。但在播放端乱用可能让声音失去起伏。

常见参数：

- `Threshold`：超过这个电平开始处理。
- `Ratio`：压缩比例。
- `Attack`：开始压缩的速度。
- `Release`：停止压缩的速度。
- `Makeup Gain`：压缩后补回音量。

如果你只是听歌，不建议为了“更响”乱开压缩和限制。音量更大不等于音质更好。

## ReplayGain 和音量标准化

ReplayGain 用来让不同歌曲或专辑听起来音量更接近。它不等于重做母带，也不等于提升音质。

常见模式：

- Track Gain：按单曲匹配音量。
- Album Gain：保持专辑内部曲目之间的相对音量。
- Peak：记录峰值，用来避免削波。

如果你追求 bit-perfect，ReplayGain 通常要关闭；如果你日常随机播放，ReplayGain 很实用。

## Crossfeed

Crossfeed 常用于耳机，把一部分左声道混到右耳、右声道混到左耳，模拟音箱听音时左右耳都会听到两只音箱的情况。

它可能减少耳机“左右硬分离”和头中效应，让老录音更自然。但参数过重会让声场变窄、声音变糊。

Crossfeed 是口味工具，不是必开项。

## HRTF 和虚拟空间

HRTF 是 Head-Related Transfer Function，头相关传输函数。它描述声音从某个方向到达双耳时，被头部、耳廓、躯干影响后的变化。虚拟环绕、空间音频、耳机 3D 定位常用到它。

HRTF 很依赖个人耳形和算法。一个预设对别人有效，对你可能不自然。如果你听音乐时觉得空间音效让人声空、定位怪、低频散，可以关闭它。

## 声道平衡、Mono、左右互换

这些是排查和微调工具：

- 声道平衡：修正左右音量差。
- Mono：把左右合并，检查中心、人声和相位问题。
- 左右互换：判断耳机、线材或录音是否左右反。
- 声道延迟：微调左右到达时间，慎用。

偏音时先别急着怀疑播放器。把耳机反戴、换线、换接口、开 Mono、左右互换，都能帮助定位问题。

## 延迟和缓冲

缓冲是播放器预先准备的一段音频数据。缓冲越大，播放越稳，但延迟可能越高；缓冲越小，响应更快，但更容易爆音、卡顿。

听歌时，较高延迟通常没关系；打游戏、看视频、做音乐时，延迟更重要。

如果你听到爆音、断续：

1. 增大缓冲。
2. 降低采样率或关闭高负载 DSP。
3. 换回 WASAPI Shared。
4. 关闭其它占用音频设备的软件。
5. 检查 CPU 占用和 USB 连接稳定性。

## WASAPI Shared、WASAPI Exclusive、ASIO

Windows 上常见输出路径：

| 模式 | 适合场景 | 注意 |
| --- | --- | --- |
| System / Windows Output | 最稳、最兼容 | 会经过系统路径 |
| WASAPI Shared | 日常听歌、视频、游戏 | 多应用可同时出声 |
| WASAPI Exclusive | 想减少系统混音，设备和驱动稳定 | 独占设备，可能导致其它应用无声 |
| ASIO | 专业声卡、录音接口、低延迟制作 | 不等于普通听歌更好 |

不要因为 ASIO 名字专业就强行使用。普通耳机、蓝牙、小尾巴、笔记本声卡，通常 WASAPI Shared 更省心。

## EQ 频段速查

| 频段 | 大致影响 | 调多了可能 |
| --- | --- | --- |
| `20-60 Hz` | 极低频、震动、氛围 | 轰、耗动态、设备吃力 |
| `60-120 Hz` | 鼓、贝斯重量 | 低频肥、压人声 |
| `120-250 Hz` | 厚度、温暖 | 糊、闷、慢 |
| `250-500 Hz` | 人声和乐器身体感 | 箱音、浑浊 |
| `500 Hz-1 kHz` | 中频主体 | 鼻音、拥挤 |
| `1-3 kHz` | 人声靠前、存在感 | 吵、硬、压迫 |
| `3-6 kHz` | 清晰度、攻击感 | 刺、疲劳 |
| `6-10 kHz` | 齿音、亮度、细节边缘 | 齿音重、沙 |
| `10-16 kHz` | 空气感、泛音 | 薄、飘、假亮 |
| `16 kHz+` | 超高频空气和感觉 | 很多人不敏感，过多可能无意义 |

这个表只是起点，不是公式。不同耳机、录音和耳朵差异很大。

## 常见误区

### 术语越多，音质越好吗

不是。术语只是描述工具。能稳定播放、音量合适、设备匹配、录音优秀，通常比堆名词更重要。

### 无损一定比有损好听吗

不一定。来源、母带和编码质量更重要。假无损、差母带、过度压缩的无损，可能不如好来源的高码率有损。

### 采样率越高越好吗

不一定。高采样率有价值，但也可能带来兼容、负载和驱动问题。日常 Windows 默认格式用 `44.1 kHz` 或 `48 kHz` 更稳。

### DSD 一定比 PCM 高级吗

不一定。DSD 是一种格式，不是音质保证。好 PCM 母带可以非常好，差 DSD 来源也不会因为后缀变神。

### ASIO 一定比 WASAPI 好吗

不一定。ASIO 适合专业声卡和低延迟制作。普通听歌优先稳定，WASAPI Shared / Exclusive 通常更实用。

### EQ 会破坏 HiFi 吗

不一定。错误 EQ 会破坏声音，正确 EQ 可以修正耳机、房间或个人偏好。关键是留 Headroom、避免削波、少量调整。

### bit-perfect 一定最好听吗

不一定。bit-perfect 是链路验证目标，不是审美目标。你需要耳机校正、房间校正或音量标准化时，DSP 可能更适合你。

## 新手推荐理解路线

如果你刚开始接触 HiFi 和 ECHO 音频设置，建议按这个顺序学：

1. 先理解输出稳定：`System`、`WASAPI Shared`、音量、设备选择。
2. 再理解文件规格：FLAC、MP3、PCM、采样率、位深。
3. 再理解听感词：解析力、分离度、结像、声场、动态。
4. 再理解 DSP：EQ、Headroom、削波、输出安全。
5. 最后再玩高级链路：WASAPI Exclusive、ASIO、DSD、HQPlayer、FIR。

这条路线不炫，但稳定。先听到正常、舒服、可重复的声音，再去研究更复杂的玩法。

## ECHO 里的实用检查清单

当你觉得声音“不对”时，可以按这个顺序走：

1. 输出模式切回 `System` 或 `WASAPI Shared`。
2. 播放一首确定正常的 MP3 或 FLAC。
3. 关闭 EQ、FIR、声道工具、耳机校正、ReplayGain、变速。
4. Windows 默认格式改回 `24-bit / 48 kHz` 或 `16-bit / 44.1 kHz`。
5. 检查 ECHO 音量、系统音量、设备音量。
6. 检查左右声道、声道平衡、Mono、左右互换。
7. 再逐个打开 EQ、DSP、独占、ASIO、DSD。
8. 每改一个设置就听同一段，不要同时改五个。

如果打开某个模块后立刻变差，先关掉它，不要继续叠更多设置。

## 一句话总结

HiFi 的核心不是把所有术语都点亮，而是知道每个术语在描述什么、会影响哪里、出问题时怎么回退。解析力、分离度、结像、声场这些词帮你描述听感；采样率、位深、bit-perfect、WASAPI、ASIO 帮你理解链路；EQ、Headroom、FIR、Crossfeed 帮你安全地处理声音。

听感最终属于你的耳朵，但链路要讲逻辑。先稳定，再调音；先少量，再复杂；先排查，再玄学。

继续看具体操作可以参考 [DSP 新手教程](/zh/docs/audio-output/dsp-beginner/)、[DSP Simple 教程](/zh/docs/audio-output/dsp-simple/) 和 [音频设置建议](/zh/docs/audio-output/audio-advice/)。

---

# HQPlayer 超详细教程

Source: src/content/docs/zh/docs/audio-output/hqplayer.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/audio-output/hqplayer/
Description: 从 HQPlayer Desktop 基础配置、滤波器和 DSD 调制，到 ECHO Connect 连接、远程模式、NAA 边界和常见排障。

这份教程写给想把 ECHO Next 和 HQPlayer 接起来的用户。目标不是让你第一天就背下所有滤波器名字，而是让你知道每个设置大概管什么、哪些设置先别碰、哪里出问题该在哪一层排查。

先记住一句话：

**ECHO Connect 到的是 HQPlayer Desktop，不是直接 Connect 到 DAC，也不是直接 Connect 到 NAA。**

正确链路通常是：

```text
ECHO Next -> HQPlayer Desktop -> 输出后端 / NAA -> DAC -> 耳放 / 功放 / 音箱
```

ECHO 负责曲库、选歌、播放控制和把当前曲目交给 HQPlayer。HQPlayer 负责真正的滤波、升频、DSD 调制、卷积、音量、输出设备和 NAA。

## 最短结论

第一次配置请按这个顺序来：

1. 先打开 HQPlayer Desktop，让 HQPlayer 自己播放一首普通 FLAC / WAV / MP3。
2. HQPlayer 能稳定出声后，再去 ECHO 的 `Connect` 页面启用 HQPlayer。
3. 本机连接时，ECHO 里保持 `Host = 127.0.0.1`，控制端口保持 `4321`。
4. HQPlayer 的输出先用保守 PCM，不要一上来就开 DSD512 / DSD1024、复杂卷积、NAA 和最高阶滤波。
5. ECHO 测试连接成功后，再点 `HQPlayer Desktop` 设备卡片里的 `连接`。
6. 稳定以后，再逐步试 PCM 升频、DSD 输出、CUDA、卷积和 NAA。

最小成功配置：

| 项目 | 推荐值 |
| --- | --- |
| HQPlayer | 先单独播放成功 |
| HQPlayer 输出 | 先用直连 DAC 或系统可用设备 |
| HQPlayer Default mode | 先用 `PCM`，确认稳定后再试 `SDM (DSD)` |
| ECHO 连接模式 | `本机 Desktop` |
| Host | `127.0.0.1` |
| 控制端口 | `4321` |
| 默认交接 | 新手选 `每次询问` |
| 串流保护 / 媒体服务 | 本机本地文件先关，远程 HQPlayer 再开 |

## 傻瓜升频教程

这一段写给只想做一件事的用户：**用 ECHO 选歌，然后让 HQPlayer 把音乐升频到 DAC。** 不玩 DSD、不玩 NAA、不玩卷积、不研究几十个滤波器。

目标链路就是：

```text
ECHO 选歌 -> HQPlayer 升频 -> DAC 出声
```

### 先选一个保守目标

第一次不要直接冲 768 kHz、DSD512 或 DSD1024。先按你的 DAC 能力选一个保守上限：

| DAC 稳定能力 | 第一次建议 |
| --- | --- |
| 普通 USB DAC | `192k` |
| 明确支持 384 kHz 的 DAC | `384k` |
| 不确定规格 | 先用 `192k` |

如果 `192k` 都不稳，先退回 `96k` 或让 HQPlayer 自己播放普通 PCM，确认不是驱动或设备问题。

### HQPlayer 只改这两页

先打开 HQPlayer 的设置窗口。你只需要动 `Outputs` 和 `PCM` 两页。

`Outputs` 页这样设：

| 项目 | 填什么 |
| --- | --- |
| `Backend` | Windows 新手先用 `WASAPI`；有 DAC 原厂 ASIO 驱动再用 `ASIO` |
| `Device` | 选择你的 DAC，不要选显示器、蓝牙、虚拟声卡 |
| `Channels` | `2` |
| `Default mode` | `PCM` |
| `Hardware buffer time` | `Default`，爆音再试 `100 ms` |
| `Volume max` | `0.0 dB` |

`PCM` 页这样设：

| 项目 | 填什么 |
| --- | --- |
| `Filter 1x` | `poly-sinc-gauss-hires-lp` |
| `Filter Nx` | `poly-sinc-gauss-hires-lp` |
| `Sample rate (/ Limit)` | 先选 `192k`，稳定后再试 `384k` |
| `Dither` | `TPDF` |
| `Bits` | `Default` |

其它页先别动：

| 页签 | 新手处理 |
| --- | --- |
| `Inputs` | 不用管 |
| `SDM` | 不用管，先不玩 DSD |
| `Advanced` | 保持默认；CUDA 先不开 |

点 `OK` 保存后，先在 HQPlayer 里自己拖一首 FLAC / WAV / MP3 播放。能出声，再去 ECHO。

### ECHO 里这样连

1. 打开 ECHO。
2. 进入 `Connect`。
3. 找到 `HQPlayer`。
4. 打开 `启用 HQPlayer`。
5. 连接模式选 `本机 Desktop`。
6. Host 填 `127.0.0.1`。
7. 控制端口填 `4321`。
8. 默认交接先选 `每次询问`。
9. 串流保护先关。
10. 点 `测试`。
11. 测试成功后，播放或选中一首歌。
12. 点 `HQPlayer Desktop` 设备卡片里的 `连接`。

如果成功，声音应该从 HQPlayer 选择的 DAC 出来，而不是从 ECHO 原来的本地输出设备出来。

### 先看两个限制

1. **HQPlayer 交接仅支持本地音乐。** 建议用 ECHO 已经扫描到本地曲库里的 FLAC / WAV / MP3 等文件测试。Spotify、受保护流媒体、需要官方 SDK 的在线来源、不能直接暴露为普通音频文件或 URL 的内容，不适合交给 HQPlayer。
2. **暂停、继续播放、重播、切歌可能有延迟。** HQPlayer 需要重新准备缓冲、滤波、升频、调制和输出设备状态。滤波器越重、采样率越高、DSD 调制越复杂，等待感越明显。这通常不是 ECHO 卡死，也不是按钮没点上。

### 怎么确认真的升频了

用这几个地方看：

1. DAC 屏幕或驱动面板显示的采样率。
2. HQPlayer 主界面里的输出状态。
3. 如果原曲是 44.1 kHz，升频到 `192k` 上限时，常见会显示 176.4 kHz；如果原曲是 48 kHz，常见会显示 192 kHz。
4. 如果上限设为 `384k`，44.1 kHz 家族常见会到 352.8 kHz，48 kHz 家族常见会到 384 kHz。

这是正常的。HQPlayer 通常会按 44.1 kHz 家族和 48 kHz 家族分别升频，不一定所有歌都显示同一个数字。

### 出问题就按这个退

| 现象 | 先做什么 |
| --- | --- |
| 没声音 | 回 HQPlayer `Outputs` 页确认 `Device` 选的是 DAC |
| 爆音 / 卡顿 | `Sample rate` 从 `384k` 降到 `192k` |
| 还是卡 | `Hardware buffer time` 试 `100 ms` |
| ECHO 测试失败 | 确认 HQPlayer 正在运行，Host 是 `127.0.0.1`，端口是 `4321` |
| DAC 仍显示 44.1 / 48 kHz | 确认 ECHO 已经连接到 `HQPlayer Desktop`，不是还在本地播放 |
| 一开就复杂到不会排查 | 回到 `Default mode = PCM`，`Filter = poly-sinc-gauss-hires-lp`，`Rate = 192k` |

跑稳以后，你只需要记住一个升级顺序：

```text
192k 稳定 -> 384k -> 更重滤波器 -> DSD
```

不要反过来。先升频 PCM 稳定，再考虑 DSD。

## HQPlayer 是什么

HQPlayer Desktop 是 Signalyst 的高质量音频播放器和 DSP 处理软件。官方说明里，HQPlayer Desktop 支持软件升频/降频、PCM 滤波、DSD/SDM 调制、抖动和噪声整形、卷积、参数 EQ、矩阵处理、数字音量、DSF / DSDIFF 播放、ASIO 驱动和 Network Audio Adapter。

对 ECHO 用户来说，可以简单理解为：

| 软件 | 负责什么 |
| --- | --- |
| ECHO Next | 曲库、搜索、播放队列、选歌、交接、基础播放控制 |
| HQPlayer Desktop | 采样率转换、滤波器、DSD 调制、卷积、音量、DAC 输出 |
| DAC / NAA | 最终接收数字音频并转换或转发 |

ECHO 不会替 HQPlayer 选择 DAC，不会替 HQPlayer 改滤波器，也不会替 HQPlayer 配 NAA。你在 ECHO 里连上 HQPlayer 以后，最终声音取决于 HQPlayer 当前的设置和它连接到的输出设备。

## 安装与准备

到 Signalyst 下载页下载 HQPlayer Desktop。Signalyst 下载页会列出当前 HQPlayer 6 Desktop、HQPlayer 5 Desktop 和 Network Audio Daemon。试用模式通常每次可运行 30 分钟，之后需要重启继续试用。

如果你只是第一次跟 ECHO 配合，优先装 `HQPlayer Desktop`。`HQPlayer Embedded` 更适合已经熟悉 Web UI、独立播放器或服务器玩法的用户。

安装后建议先找官方手册。Signalyst 文档页说明，HQPlayer Desktop 的 PDF 手册随安装包提供：Windows 和 Linux 可从开始菜单里的 HQPlayer 组找到，macOS 可从 DMG 安装包里找到。

## 第一次启动 HQPlayer

第一次打开 HQPlayer 时不要急着追最高规格。先做这件事：

1. 打开 HQPlayer Desktop。
2. 进入设置窗口。
3. 选择一个能出声的输出后端和设备。
4. 暂时关闭 NAA、卷积、极高 DSD 和复杂 GPU 参数。
5. 拖入一首普通 FLAC / WAV / MP3。
6. 点播放。
7. 确认 DAC 或声卡有声音，没有爆音、半速、倍速、卡顿。

如果 HQPlayer 自己都不能正常播放，ECHO Connect 也救不了它。先修 HQPlayer 到 DAC 这一段。

## 五张截图逐页讲设置

下面五张图来自 `photos/HQplayer`。教程里把它们复制到了站点资源目录，方便用户直接照着看。

### Inputs 页：输入设备

![HQPlayer Inputs 设置页](/assets/docs/hqplayer/hq1.png)

这一页是 HQPlayer 的输入设备设置。普通 ECHO 用户大多数时候不用改这里，因为 ECHO 是把曲目交给 HQPlayer 播放，不是让 HQPlayer 录音或接收外部输入。

图中能看到：

| 设置 | 图中值 | 用途 | 新手建议 |
| --- | --- | --- | --- |
| `Backend` | `WASAPI` | 选择输入后端，比如系统输入、声卡输入、实时输入来源 | 不需要实时输入时不用管 |
| `Device` | `Default endpoint` | 选择输入设备 | 不录音、不接外部数字输入就不用动 |
| `Channel offset` | `0` | 多通道输入时偏移声道编号 | 保持 `0` |
| `Hardware buffer time` | `Default` | 输入端硬件缓冲 | 保持 `Default` |
| `SDM pack` | `DoP` | 输入 DSD 时的封装方式 | 普通播放不用管 |
| `Dual wire` | 未勾选 | 部分老式双线 DSD 方案 | 不确定就别勾 |
| `Short buffer` | 未勾选 | 降低缓冲、增加实时性，但更容易不稳 | 不需要低延迟就别勾 |
| `CD drive` | `D:` | CD 播放驱动器 | 不用 CD 可忽略 |

这页最重要的提醒是：**Inputs 不是 DAC 输出页。** 你要设置 DAC，应该去 `Outputs` 页。

### Outputs 页：输出设备

![HQPlayer Outputs 设置页](/assets/docs/hqplayer/hq2.png)

这一页最关键。HQPlayer 最终从哪里出声，基本在这里决定。

图中配置是一个比较典型的 Windows + USB DAC + 厂商 ASIO 驱动方案：

| 设置 | 图中值 | 用途 | 新手建议 |
| --- | --- | --- | --- |
| `Backend` | `ASIO` | 输出后端。Windows 常见是 WASAPI、ASIO、Network Audio Adapter | 有 DAC 原厂 ASIO 驱动时可用 ASIO；不确定先用 WASAPI |
| `Device` | `TEAC ASIO USB DRIVER` | 具体输出设备或驱动 | 选你的 DAC，不要选错到显示器/蓝牙/虚拟声卡 |
| `Channels` | `2` | 输出声道数 | 立体声耳机/两声道系统选 `2` |
| `Channel offset` | `0` | 多通道输出偏移 | 保持 `0` |
| `SDM pack` | `none` | DSD 输出封装。`none` 常用于原生 DSD，`DoP` 用于 DSD over PCM | DAC 不支持原生 DSD 时先用 DoP；PCM 输出时不用纠结 |
| `Hardware buffer time` | `Default` | 输出硬件缓冲 | 爆音或断续时可增大，例如试 `100 ms` |
| `Default mode` | `SDM (DSD)` | 默认输出模式。`PCM` 是普通 PCM，`SDM (DSD)` 是把输出调制到 DSD | 新手先用 `PCM`，稳定后再试 DSD |
| `Volume min` | `-60.0 dB` | HQPlayer 软件音量最小值 | 保持默认即可 |
| `Volume max` | `0.0 dB` | HQPlayer 软件音量最大值 | 不要超过 `0.0 dB`，避免数字削波 |
| `PCM gain compensation` | `0.00` | PCM 增益补偿 | 保持 `0.00` |
| `Quick pause` | 未勾选 | 更快暂停行为 | 遇到兼容问题再试 |
| `Adaptive rate` | 未勾选 | 自适应输出采样率策略 | 新手先别开 |
| `48k DSD` | 未勾选 | 让 DSD 使用 48 kHz 家族倍频 | 只有 DAC/方案要求时再开 |
| `Short buffer` | 未勾选 | 更短输出缓冲 | 新手先别开 |

如果你只是想让 ECHO 交给 HQPlayer，然后 HQPlayer 稳定出声，Outputs 页的推荐顺序是：

1. `Backend` 先选稳定后端。
2. `Device` 选正确 DAC。
3. `Channels` 选 `2`。
4. `Default mode` 先用 `PCM`。
5. 播放稳定后再改 `SDM (DSD)`。
6. 爆音、断续、切歌不稳时，先增大 `Hardware buffer time`，不要先乱换一堆滤波器。

### PCM 页：PCM 输出与 DSD 源转 PCM

![HQPlayer PCM 设置页](/assets/docs/hqplayer/hq3.png)

这一页决定 HQPlayer 输出 PCM 时怎么重采样、怎么滤波、怎么做 dither，以及遇到 DSD 源转 PCM 时怎么处理。

图中配置：

| 设置 | 图中值 | 用途 | 新手建议 |
| --- | --- | --- | --- |
| `Filter 1x` | `sinc-long` | 处理 44.1 / 48 kHz 这类基础采样率来源时的 PCM 滤波器 | 新手可先用 `poly-sinc-gauss-long`、`poly-sinc-gauss-hires-lp` 或保守默认 |
| `Filter Nx` | `sinc-long` | 处理高于基础采样率来源时的 PCM 滤波器 | 先别和 1x 差太多，方便排查 |
| `Sample rate (/ Limit)` | `384k` | PCM 输出采样率上限 | 不要超过 DAC 稳定支持的上限 |
| `Dither` | `TPDF` | 降低位深或固定输出位深时使用的抖动 | `TPDF` 是保守安全选择 |
| `Bits` | `Default` | 输出位深 | 保持 `Default`，除非 DAC/驱动要求固定 24-bit/32-bit |
| `Noise filter` | `standard` | DSD 源转 PCM 时的噪声过滤 | 保持 `standard` |
| `Conversion` | `poly-ext2` | DSD 源转 PCM 的转换滤波 | 保持默认或稳定方案 |
| `6 dB gain` | 未勾选 | DSD 转 PCM 时补偿电平 | 不确定别开，避免电平过高 |

`Filter 1x` 和 `Filter Nx` 的区别很重要：

| 项目 | 覆盖对象 |
| --- | --- |
| `Filter 1x` | 低于 50 kHz 的基础采样率，例如 44.1 kHz、48 kHz |
| `Filter Nx` | 高采样率来源，例如 88.2 kHz、96 kHz、176.4 kHz、192 kHz |

很多音乐还是 44.1 kHz 或 48 kHz，所以 `Filter 1x` 对日常听感和性能影响非常明显。建议一次只改一个滤波器，听同一首熟悉曲目，并记录是否有卡顿、爆音、切歌延迟。

### SDM 页：DSD / SDM 输出

![HQPlayer SDM 设置页](/assets/docs/hqplayer/hq4.png)

这一页决定 HQPlayer 把 PCM 或 DSD 输出成 DSD/SDM 时怎么处理。它比 PCM 页更吃 CPU/GPU，也更挑 DAC、驱动和 USB 稳定性。

图中配置属于比较激进的高规格玩法：

| 设置 | 图中值 | 用途 | 新手建议 |
| --- | --- | --- | --- |
| `Oversampling 1x` | `sinc-long-h` | 低采样率来源升到 DSD 前的滤波器 | 新手别急着用超长滤波 |
| `Oversampling Nx` | `sinc-long-h` | 高采样率来源升到 DSD 前的滤波器 | 先和 1x 保持一致 |
| `Modulator` | `ASDM7EC-super 512+fs` | DSD 调制器，决定 PCM 转 DSD 的噪声整形/调制方式 | 非常吃性能；新手从较低 DSD 速率和较轻调制器开始 |
| `Bit rate (/ Limit)` | `44.1k x512` | DSD 输出上限。44.1k x512 约等于 DSD512 家族 | 先 DSD128 或 DSD256，稳定后再上 DSD512 |
| `Integrator` | `FIR2` | DSD 源处理时的积分器/噪声处理结构 | 保持默认或手册推荐 |
| `Conversion` | `XFi` | SDM 到 SDM 转换策略 | `XFi` 是通用选择 |
| `DirectSDM` | 已勾选 | DSD 源到 DSD 输出时跳过处理 | 想保持 DSD 直通时可开，但会禁用音量控制 |

最重要的注意事项：

1. `ASDM7EC` 系列通常质量高但算力压力大，尤其是 `super`、高倍 DSD 和 512fs 这类组合。
2. `DirectSDM` 开启后，DSD 源到 DSD 输出会跳过处理。官方手册说明它会禁用音量控制，并把 PCM 音量固定到特定安全值。实际听音请用 DAC、前级、耳放或功放控制音量。
3. 如果一开 DSD 就爆音、断续、CPU 满载，先退回 PCM，不要硬顶。
4. DAC 标称支持 DSD512，不代表你的电脑、驱动、USB 线、USB 控制器和 HQPlayer 参数组合都能稳定跑 DSD512。

### Advanced 页：CPU、GPU、处理管线

![HQPlayer Advanced 设置页](/assets/docs/hqplayer/hq5.png)

这一页决定 HQPlayer 怎么分配 CPU/GPU 算力。

图中配置：

| 设置 | 图中值 | 用途 | 新手建议 |
| --- | --- | --- | --- |
| `Multicore DSP` | 看起来为半选/启用状态 | 让 HQPlayer 使用多核心 DSP | 多核 CPU 通常可以开；出问题可回默认 |
| `E-core allocation` | `Default` | Intel 大小核 CPU 的 E-core 分配 | 保持 `Default` |
| `CUDA offload` | 已勾选 | 使用 NVIDIA GPU 分担部分 DSP 计算 | 有 NVIDIA 显卡可试；不稳定就关 |
| `Default CUDA` | `NVIDIA GeForce RTX 507...` | 默认 CUDA 设备 | 选你的独显 |
| `Convolution CUDA` | `NVIDIA GeForce RTX 507...` | 卷积用 CUDA 设备 | 有卷积时才关键 |
| `DSP pipelines` | `Default` | DSP 管线数量 | 保持默认 |
| `Blocks per cycle` | `Default` | 每周期处理块数 | 保持默认 |
| `Idle time` | `Disabled` | 空闲策略 | 保持默认 |
| `FFT filter length` | `512` | FFT 类滤波长度 | 只在使用 FFT/FIR 相关方案时重点调整 |
| `Log file` | 未勾选 | 输出日志 | 排障时临时打开 |

GPU 不是“开了就一定更好”。CUDA 适合把一部分重计算交给 NVIDIA 显卡，但它也可能引入驱动、功耗、温度、延迟和切歌稳定性问题。建议：

1. 先用 CPU 跑稳定。
2. 再开 CUDA。
3. 再上更重的滤波器或 DSD 调制器。
4. 如果开 CUDA 后才爆音，先关 CUDA 验证。
5. 如果笔记本使用独显，注意电源模式和散热。

## 滤波器怎么理解

HQPlayer 的滤波器主要用来做采样率转换。你可以把它理解成：当 HQPlayer 要把 44.1 kHz 变成 176.4 kHz、352.8 kHz、384 kHz，或者进一步变成 DSD 时，需要一个算法来重建中间采样点，并控制高频镜像、滚降、相位和瞬态表现。

不要把滤波器当玄学开关。它们确实会改变算法行为，但是否“更好听”取决于录音、DAC、输出模式、系统性能和个人偏好。

### 常见概念

| 概念 | 含义 |
| --- | --- |
| `linear phase` | 线性相位。相位关系规整，但可能有前后振铃 |
| `minimum phase` / `mp` | 最小相位。通常没有前振铃，但会改变相位响应 |
| `intermediate phase` / `ip` | 介于线性相位和最小相位之间 |
| `short` | 滤波器较短，计算压力较低，瞬态取向更明显，但截止不一定最陡 |
| `long` | 滤波器较长，截止和抑制能力更强，计算压力和启动延迟更高 |
| `gauss` | Gaussian 取向的 poly-sinc 家族，常被用作平衡、现代、通用的选择 |
| `apodizing` | 用来处理源内容里已有滤波痕迹或需要清理的情况 |
| `sinc` | 很长的 sinc 类滤波，通常技术指标强，但算力和延迟压力也大 |

官方手册里提到，`poly-sinc` 的不同变体是作者最推荐的滤波器族之一。对大多数 ECHO 用户，我也建议从 `poly-sinc` / `poly-sinc-gauss` 家族开始，而不是第一天就上 `sinc-long`、`sinc-Mx`、`closed-form` 这类高压力方案。

## 推荐滤波方案

下面不是“绝对最好”，而是更适合新手排查和日常使用的起点。

### 只想稳定出声

| 输出目标 | Filter 1x | Filter Nx | Rate / Limit | 说明 |
| --- | --- | --- | --- | --- |
| PCM 直出或轻度升频 | `poly-sinc-gauss-hires-lp` | `poly-sinc-gauss-hires-lp` | DAC 稳定上限以内 | 通用、稳妥，适合先跑通 |
| 性能较弱电脑 | `poly-sinc-gauss-short` | `poly-sinc-gauss-short` | 176.4k / 192k 起步 | 算力压力较低 |
| 不想升频 | `none` | `none` | `Default` | 只做必要位深处理，便于排查 |

### 想玩 PCM 升频

| 偏好 | 推荐起点 | 说明 |
| --- | --- | --- |
| 平衡通用 | `poly-sinc-gauss-long` | 质量和负载比较平衡 |
| 高采样率素材较多 | `poly-sinc-gauss-hires-lp` | 对 Hi-Res 和有损来源也比较友好 |
| 更重、更锐利的截止 | `poly-sinc-ext2` | 技术取向更强，负载更高 |
| 瞬态优先 | `poly-sinc-short-mp` 或同类 short/mp | 先接受它可能改变相位响应 |
| 古典/空间感取向 | `poly-sinc-long-lp` 或 `poly-sinc-gauss-long` | 计算压力较高，切歌可能更慢 |

### 想玩 DSD / SDM

| 阶段 | Oversampling | Modulator | Bit rate / Limit |
| --- | --- | --- | --- |
| 第一次试 DSD | `poly-sinc-gauss-short` 或 `poly-sinc-gauss-hires-lp` | 先用较轻的稳定调制器 | DSD128 或 DSD256 |
| 稳定后进阶 | `poly-sinc-gauss-long` | `ASDM7EC` 系列中较轻版本 | DSD256 |
| 高性能机器 | `poly-sinc-gauss-long`、`sinc-long-h` | `ASDM7EC-super` 等重调制器 | DSD512，再往上谨慎 |

如果你不知道怎么选，优先用：

```text
PCM:
Filter 1x = poly-sinc-gauss-hires-lp
Filter Nx = poly-sinc-gauss-hires-lp
Sample rate limit = 192k 或 384k，按 DAC 稳定能力来
Dither = TPDF
Bits = Default

DSD:
Oversampling 1x = poly-sinc-gauss-hires-lp
Oversampling Nx = poly-sinc-gauss-hires-lp
Bit rate limit = 44.1k x256 或设备稳定支持的较低档
DirectSDM = 只在你明确想 DSD 源直通时开启
```

## 调制器怎么选

只有当 `Default mode` 选 `SDM (DSD)`，或者你明确把 PCM 转成 DSD 输出时，`Modulator` 才是关键。

简单说：

| 调制器类型 | 特点 | 适合 |
| --- | --- | --- |
| 普通/较轻调制器 | 算力压力低，稳定性更容易保证 | 初次 DSD、笔记本、弱 CPU |
| `ASDM7` / `ASDM7EC` | 高阶、质量取向，压力更高 | 已经确认 DSD 输出稳定的用户 |
| `ASDM7EC-super` 等 | 更高压力，常需要强 CPU/GPU | 高性能台式机和明确知道自己在调什么的用户 |

推荐顺序：

1. 先 PCM 稳定。
2. 再 DSD128。
3. 再 DSD256。
4. 再试更重调制器。
5. 最后再 DSD512 / DSD1024。

出问题时，不要先怀疑 ECHO。只要 ECHO 已经把曲目交给 HQPlayer，爆音、断续、CPU 满载、DAC 不识别 DSD，大多是 HQPlayer 输出、驱动、DAC 或算力层的问题。

## ECHO 本机连接 HQPlayer

本机模式是最简单的场景：

```text
ECHO Next 和 HQPlayer Desktop 在同一台电脑
DAC 也接在这台电脑上
```

### HQPlayer 侧

1. 启动 HQPlayer Desktop。
2. 进入设置。
3. 在 `Outputs` 页选择正确 `Backend` 和 `Device`。
4. 先用 `PCM`。
5. 播放一首普通文件确认出声。
6. 如果 ECHO 测试连接失败，再确认 HQPlayer 是否允许控制端口工作。

### ECHO 侧

1. 打开 ECHO Next。
2. 进入 `Connect`。
3. 找到 `HQPlayer` 面板。
4. 打开 `启用 HQPlayer`。
5. 连接模式选择 `本机 Desktop`。
6. Host 保持 `127.0.0.1`。
7. 控制端口保持 `4321`。
8. 默认交接先选 `每次询问`。
9. `串流保护` 先关闭。
10. 点击 `测试`。

测试成功后，设备列表里会出现 `HQPlayer Desktop`。这时播放或选中一首歌，点击设备卡片里的 `连接`，ECHO 会把当前曲目交给 HQPlayer。

### 本机模式常见误区

| 误区 | 正确理解 |
| --- | --- |
| ECHO 连上以后还要选 ECHO 的本地输出设备 | HQPlayer 接管后，最终输出看 HQPlayer 的 Outputs 页 |
| ECHO 会自动帮我调 HQPlayer 滤波器 | 不会。滤波器在 HQPlayer 里调 |
| ECHO 能直接控制 NAA | 不直接控制。NAA 在 HQPlayer 里选 |
| 本机也必须开串流保护 | 本机普通本地文件通常不用 |

## ECHO 远程连接 HQPlayer

远程模式是：

```text
ECHO Next 在电脑 A
HQPlayer Desktop 在电脑 B
DAC 接在电脑 B
```

例子：

```text
ECHO 电脑: 192.168.1.20
HQPlayer 电脑: 192.168.1.50
DAC: 接在 HQPlayer 电脑上
```

这时 ECHO 要连的是：

```text
192.168.1.50:4321
```

不要填 `127.0.0.1`。在 ECHO 电脑看来，`127.0.0.1` 永远是 ECHO 这台电脑自己。

### 远程模式前置条件

1. 两台电脑在同一局域网，或者网络之间可互通。
2. HQPlayer 电脑已经打开 HQPlayer Desktop。
3. HQPlayer 电脑可以自己播放到 DAC。
4. HQPlayer 允许从网络控制。
5. HQPlayer 电脑防火墙允许 ECHO 访问控制端口 `4321`。
6. 如果要播放 ECHO 电脑上的本地文件，ECHO 电脑也要允许 HQPlayer 访问 ECHO 提供的媒体服务端口。

### ECHO 远程设置

1. 打开 ECHO。
2. 进入 `Connect`。
3. 打开 HQPlayer 面板。
4. 连接模式选择 `远程 HQPlayer`。
5. Host 填 HQPlayer 电脑 IP，例如 `192.168.1.50`。
6. 控制端口填 `4321`。
7. 打开 `串流保护`。
8. 媒体端口可先留空，让 ECHO 自动选择。
9. 如果防火墙复杂，可填固定端口，例如 `17890`，然后放行。
10. 点击 `测试`。

### 为什么远程常常需要串流保护

本机模式下，ECHO 可以把本地路径交给本机 HQPlayer：

```text
D:\Music\Album\Track.flac
```

远程模式下，HQPlayer 电脑不一定有这个路径。对电脑 B 来说，`D:\Music` 是它自己的 D 盘，不是 ECHO 电脑的 D 盘。

所以 ECHO 需要把文件临时变成一个 HTTP URL：

```text
http://192.168.1.20:17890/hqplayer-media/...
```

然后 HQPlayer 电脑通过网络读取这个 URL。

如果 ECHO 测试成功但播放失败，重点查：

1. ECHO 是否开了串流保护。
2. 媒体端口是否成功绑定。
3. HQPlayer 电脑是否能访问 ECHO 电脑 IP。
4. ECHO 电脑防火墙是否放行媒体端口。
5. 两台电脑是否被访客 Wi-Fi、VPN、代理或路由器隔离。

## NAA 怎么理解

NAA 是 Network Audio Adapter。它是 HQPlayer 到 DAC 的网络音频端点，不是 ECHO 的连接目标。

正确链路：

```text
ECHO -> HQPlayer Desktop -> NAA -> DAC
```

不是：

```text
ECHO -> NAA -> DAC
```

Signalyst 官方对 NAA 的说明是：处理由播放器应用完成，处理后的数据再通过网络异步串流到轻量的网络音频适配器，由它连接 DAC。也就是说，重活仍然在 HQPlayer 那台机器上。

### 配置 NAA 的顺序

1. 让 NAA 设备和 HQPlayer 电脑在同一网络。
2. 启动 NAA 设备或 Network Audio Daemon。
3. 在 HQPlayer 的 `Outputs` 页把 `Backend` 选为 `Network Audio Adapter`。
4. 在 `Device` 里选择被发现的 NAA。
5. 在 HQPlayer 里直接播放一首普通文件。
6. 确认 NAA 到 DAC 能正常出声。
7. 再回到 ECHO 配置 HQPlayer Connect。

ECHO 看不到 NAA 是正常的。ECHO 只需要看到 HQPlayer。

## 默认交接怎么选

ECHO 的 HQPlayer 面板里有默认交接策略：

| 选项 | 含义 | 适合 |
| --- | --- | --- |
| `优先 ECHO` | 默认仍用 ECHO 本地输出，需要手动交接给 HQPlayer | 偶尔玩 HQPlayer |
| `每次询问` | 每次交接前确认 | 新手最推荐 |
| `优先 HQPlayer` | 播放时优先交给 HQPlayer | HQPlayer 链路已经稳定 |

刚开始用 `每次询问`。等 HQPlayer、DAC、媒体服务和网络都稳定后，再改成 `优先 HQPlayer`。

## Profile 怎么用

ECHO 里的 `Profile` 字段适合记备注，例如：

```text
PCM 384k
DSD256 headphones
NAA living room
```

它不是 HQPlayer 的万能自动调参。真正的滤波器、调制器、输出设备、卷积、矩阵和 CUDA 仍然在 HQPlayer 里管理。

## 推荐配置模板

### 模板 A：先跑通

适合第一次配置、排障、确认 ECHO 能不能交给 HQPlayer。

```text
HQPlayer Outputs:
Backend = WASAPI 或 DAC 原厂 ASIO
Device = 你的 DAC
Channels = 2
Default mode = PCM
Hardware buffer time = Default

HQPlayer PCM:
Filter 1x = none 或保守默认
Filter Nx = none 或保守默认
Sample rate limit = DAC 稳定支持的较低值
Dither = TPDF
Bits = Default

ECHO:
Host = 127.0.0.1
Port = 4321
默认交接 = 每次询问
串流保护 = 关闭
```

### 模板 B：日常 PCM 升频

适合大多数 DAC 和台式机。

```text
Outputs:
Default mode = PCM

PCM:
Filter 1x = poly-sinc-gauss-hires-lp
Filter Nx = poly-sinc-gauss-hires-lp
Sample rate limit = 192k 或 384k
Dither = TPDF
Bits = Default
```

如果 CPU 轻松，可以试：

```text
Filter 1x = poly-sinc-gauss-long
Filter Nx = poly-sinc-gauss-hires-lp
```

### 模板 C：入门 DSD

适合 DAC 明确支持 DSD，且你已经 PCM 稳定。

```text
Outputs:
Default mode = SDM (DSD)
SDM pack = DoP 或 none，按 DAC/驱动支持选择

SDM:
Oversampling 1x = poly-sinc-gauss-hires-lp
Oversampling Nx = poly-sinc-gauss-hires-lp
Bit rate limit = 44.1k x128 或 44.1k x256
Modulator = 先用较轻稳定方案
DirectSDM = 只在 DSD 源直通时开启
```

### 模板 D：高性能 DSD

适合强 CPU、NVIDIA GPU、稳定 ASIO 驱动、DAC 明确支持高倍 DSD 的用户。

```text
Outputs:
Default mode = SDM (DSD)
SDM pack = none，前提是原生 DSD 可用

SDM:
Oversampling 1x = poly-sinc-gauss-long 或 sinc-long-h
Oversampling Nx = poly-sinc-gauss-hires-lp 或 sinc-long-h
Modulator = ASDM7EC 系列
Bit rate limit = 44.1k x256 起步，稳定后再 x512

Advanced:
CUDA offload = 按稳定性决定
Multicore DSP = 按稳定性决定
```

这套不要直接给新手当默认值。它出问题时排查成本更高。

## 注意事项

### 不要超过 DAC 和驱动的稳定上限

DAC 标称 384 kHz、768 kHz、DSD512，不代表每个后端、每条 USB 线、每个 USB 口、每个系统采样率组合都稳。先从低规格跑通，再往上加。

### 不要同时改多个变量

不要同时改滤波器、调制器、采样率、CUDA、NAA、卷积和 ASIO 驱动。一次只改一项，出问题才能定位。

### DSD 时注意音量

DSD、DirectSDM、原生 DSD、DoP 等方案可能绕过或改变软件音量行为。建议把数字链路音量逻辑想清楚，实际响度用 DAC、前级、耳放或功放控制。

### 暂停和重播会比普通播放慢

HQPlayer 不是 ECHO 内置的轻量本地输出通道。ECHO 把曲目交给 HQPlayer 后，暂停、继续播放、重播、切歌都要经过 HQPlayer 的控制接口和它自己的处理队列。开启升频、长滤波器、DSD 调制、CUDA 或 NAA 后，HQPlayer 可能需要重新填充缓冲或初始化处理链路，所以会有短暂延迟。

如果只是慢半拍，但最终能正常播放，通常属于正常预期。如果延迟越来越长、一直不出声或 HQPlayer 状态不动，再按排障顺序回到低采样率 PCM 测试。

### 只建议交给 HQPlayer 本地音乐

ECHO 的 HQPlayer 交接面向本地音乐文件。最稳妥的是 ECHO 本地曲库里的 FLAC / WAV / MP3 / DSF 等可访问文件。在线流媒体、受 DRM 或平台 SDK 保护的内容、Spotify 这类官方播放链路、无法直接交给 HQPlayer 读取的来源，不应强行走 HQPlayer。

如果你只是想验证升频，请先用本地 FLAC 或 WAV。不要拿在线来源当第一轮测试样本。

### 爆音时优先降复杂度

排查顺序：

1. 回到 PCM。
2. 降低采样率上限。
3. 换轻一点的滤波器。
4. 关 DSD。
5. 关卷积。
6. 关 CUDA。
7. 增大 buffer。
8. 本机直连 DAC 测试。
9. 最后再恢复 NAA 或高阶参数。

### Windows 用户别混淆系统采样率和 HQPlayer 输出

HQPlayer 使用 WASAPI 独占或 ASIO 时，可能绕过系统混音器。Windows 声音面板里的默认格式不一定等于 HQPlayer 当前输出格式。真正看输出，优先看 HQPlayer 状态、DAC 面板和 DAC 屏幕。

### ECHO EQ 与 HQPlayer DSP 不要叠着想

HQPlayer 接管后，最终输出处理在 HQPlayer 里。想在 HQPlayer 链路里做 EQ、房间校正、卷积或矩阵，请在 HQPlayer 里配置。不要用“ECHO 本地 EQ 还会完整叠到 HQPlayer 输出上”来理解这个链路。

### 试用模式会中断

HQPlayer 试用模式到时间后需要重启继续。如果播放半小时左右突然停了，先确认是不是试用限制，不要误判成 ECHO 问题。

## 常见问题

### ECHO 测试显示连接被拒绝

常见原因：

1. HQPlayer 没启动。
2. Host 填错。
3. 端口不是 `4321`。
4. HQPlayer 没允许控制。
5. 防火墙拦截。
6. 远程模式误填 `127.0.0.1`。

处理：

1. 启动 HQPlayer Desktop。
2. 本机模式填 `127.0.0.1`。
3. 远程模式填 HQPlayer 电脑 IP。
4. 控制端口填 `4321`。
5. 远程模式打开 HQPlayer 的网络控制许可。
6. 检查防火墙。

### 测试成功但没有声音

这通常不是 ECHO 到 HQPlayer 的控制问题，而是 HQPlayer 到输出设备的问题。

检查：

1. HQPlayer 是否真的进入播放状态。
2. HQPlayer `Outputs` 页的 `Backend` 是否选对。
3. `Device` 是否选到真正的 DAC。
4. DAC 是否开机、输入是否正确。
5. 音量是否太低或被静音。
6. 输出采样率是否超过 DAC 能力。
7. ASIO / WASAPI / NAA 是否能在 HQPlayer 里单独播放。

### 本机能播，远程不能播

重点查媒体路径和防火墙：

1. 远程 HQPlayer 是否能访问 ECHO 提供的媒体 URL。
2. ECHO 是否打开串流保护。
3. 媒体端口是否被防火墙拦截。
4. 两台电脑是否在同一局域网。
5. 是否被 VPN、代理或访客 Wi-Fi 隔离。

### DSD 不出声

检查：

1. DAC 是否支持目标 DSD 规格。
2. `SDM pack` 是否和 DAC/驱动匹配。DoP 和原生 DSD 不要混用理解。
3. ASIO 驱动是否为厂商官方驱动。
4. `Default mode` 是否真的为 `SDM (DSD)`。
5. `Bit rate limit` 是否超过 DAC 上限。
6. 先试 DSD64 / DSD128，不要直接 DSD512。

### 开 CUDA 后更卡

CUDA 只是一种算力分担，不是稳定性保证。可能原因：

1. NVIDIA 驱动问题。
2. 显卡功耗或温度限制。
3. 笔记本没有切到独显高性能模式。
4. 滤波器和调制器组合本身太重。
5. 切歌时 GPU 初始化或调度造成延迟。

处理方式是先关 CUDA，确认 CPU 模式稳定，再逐步打开。

### Spotify 或受保护流媒体能交给 HQPlayer 吗

不一定。很多受保护流媒体不是普通可交给 HQPlayer 的裸音频文件或 URL。如果 ECHO 提示需要官方播放链路或 SDK，这是正常边界。不要强行把所有来源都塞给 HQPlayer。

## 排障总顺序

按层排查最快：

1. **文件层**：换普通 FLAC / MP3。
2. **HQPlayer 输出层**：HQPlayer 自己能不能播。
3. **设备层**：DAC / 声卡 / NAA 是否正常。
4. **控制层**：ECHO `测试` 能不能连 `4321`。
5. **媒体层**：远程时 HQPlayer 能不能访问 ECHO 媒体 URL。
6. **播放层**：ECHO `连接` 后 HQPlayer 是否开始播放。
7. **参数层**：再逐步恢复升频、DSD、卷积、CUDA、NAA。

每次只改一个变量。这是最快的玩法。

## 参考资料

- [Signalyst HQPlayer Desktop](https://signalyst.com/hqplayer-desktop/)
- [Signalyst Quickstart guide](https://signalyst.com/quickstart-guide/)
- [Signalyst Documentation](https://www.signalyst.com/quickstart.html)
- [Signalyst Downloads](https://signalyst.com/downloads/)
- [Signalyst Network Audio Adapter](https://signalyst.com/network-audio-adapter/)
- [HQPlayer Desktop User Manual 5.5.1 mirror](https://hosteye.net/content/files/2024/03/hqplayer5desktop-manual.pdf)

---

# 为什么我的歌曲变速了

Source: src/content/docs/zh/docs/audio-output/song-speed-changed.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/audio-output/song-speed-changed/
Description: 歌曲半速、倍速、变调或进度异常时，先检查 Windows 采样率、输出模式、变速和升频设置。

如果一首歌突然听起来变慢、变快、变调，或者进度条速度不正常，先不要怀疑曲库坏了，也不要马上重装 ECHO。大多数情况是输出链路里某个采样率、驱动或 DSP 设置不匹配。

## 先做最快恢复

按这个顺序恢复到稳定状态：

1. 打开 `设置 -> 播放`，把输出模式切回 `System` 或 `WASAPI Shared`。
2. 关闭变速、变调、EQ、ReplayGain、声道工具、ECHO SRC / 升频、DSD、HQPlayer 和自动混音。
3. 播放一首普通 MP3 或 FLAC，不要用 DSD、超高采样率测试文件或远程源排障。
4. 在 Windows 声音设置里确认输出设备正确，ECHO 没有在音量合成器里被静音。
5. 如果恢复正常，再一次只打开一个高级功能。

如果 `System` 或 `WASAPI Shared` 正常，而 Exclusive、ASIO、DSD、HQPlayer 或 ECHO SRC 异常，问题通常在高级输出链路、设备驱动或设备支持范围，不是歌曲文件被 ECHO 改坏了。

## 不要把 Windows 采样率拉太高

请不要在 Windows 的 `声音 -> 更多声音设置 -> 播放设备 -> 高级 -> 默认格式` 里把采样率设置得过高。尤其不要为了“看起来 HiFi”把它拉到设备能选到的最高值。

你的系统就算能填一个亿 Hz，设置这个采样率也屁用没有。Windows 共享输出的默认格式不是给所有歌曲“免费升级音质”的魔法开关。它只是系统混音器和设备驱动之间的一个工作格式。

把 Windows 默认格式设得太高，反而可能带来这些问题：

- 驱动或设备被迫重采样，声音不一定更好。
- 某些设备在高采样率下更容易爆音、卡顿、无声。
- 共享输出、独占输出、DAC 锁定采样率之间更容易不一致。
- 排障时会让你分不清是 ECHO、Windows、驱动还是 DAC 在改采样率。
- 少数驱动在异常格式下可能出现半速、倍速或进度异常。

日常使用建议把 Windows 默认格式设在稳定范围，例如 `24 bit, 48 kHz` 或设备稳定支持的常用格式。不要为了心理安慰把系统采样率顶满。

## 为什么不能这样设置

采样率的意思是：一秒钟记录多少个音频采样点。44.1 kHz 就是一秒 44100 个点，96 kHz 就是一秒 96000 个点。真正的高采样率音源，是录音、制作、导出时就保留了更多采样点。

Windows 默认格式不是重新录音，也不是从空气里变出新细节。你把系统默认格式从 44.1 kHz 拉到 384 kHz，本质上只是告诉 Windows 混音器：“所有共享输出最后都按这个格式交给设备。”如果原始歌曲只有 44.1 kHz，系统只能用算法把它转换成 384 kHz。这个过程可能更平滑，也可能更差，但不会凭空多出母带里不存在的信息。

更麻烦的是，Windows 共享输出通常不是只服务 ECHO。浏览器、游戏、聊天软件、系统提示音都会进同一个混音链路。你把默认格式设得很极端，就等于让整个系统都围着这个格式工作：

- 低采样率音频要被系统升采样。
- 不同应用的音频要被混到同一个格式。
- 某些驱动要把这个格式再转换成设备真正支持的格式。
- 蓝牙、虚拟声卡、音效增强软件还可能继续二次处理。

所以你看到 Windows 里写着 384 kHz，不代表 DAC 最后真的稳定收到 384 kHz，也不代表这首歌变成了 384 kHz 音源。它只代表系统链路里某一段正在使用这个工作格式。

真正靠谱的思路是：**源文件是什么采样率，就尊重它；设备能稳定支持什么，就用什么；需要升频时，让 ECHO SRC 这种明确的音频处理链路来做，而不是把 Windows 默认格式硬顶满。**

## 想要更高采样率该怎么做

如果你想听更高采样率，正确路径只有两种：

1. 使用本身就是更高采样率的音源，例如真正的 88.2 kHz、96 kHz、176.4 kHz 或 192 kHz 文件。
2. 购买并解锁 ECHO Pro，使用 ECHO SRC / 升频，把普通 PCM 音源实时升频到更高目标采样率。

Windows 默认格式不是高采样率音源。把 44.1 kHz 的歌丢进系统混音器，再让 Windows 输出成 384 kHz，不等于你拥有了一首真正的 384 kHz 母带。

## 检查 ECHO 里的变速

如果只有 ECHO 里变速，先检查这些地方：

- 播放器或 DSP 页面是否开启了变速、变调或节奏相关功能。
- 是否打开了 ECHO SRC / 升频，且 DAC 或驱动不支持目标采样率。
- 是否同时启用了 DSD、HQPlayer、ASIO、Exclusive 或其它高级输出。
- 是否使用了第三方虚拟声卡、ASIO 包装层或系统级音效驱动。

想确认原始播放，请关闭所有 DSP 和升频，再用 `System` 或 `WASAPI Shared` 播放普通文件。

## 使用 ECHO SRC 时的建议

ECHO SRC 是 ECHO Pro 的高级 PCM 升频功能，不是 Windows 默认格式。想用它，请优先满足这些条件：

- 使用有线独立 DAC、USB 解码器或官方声卡驱动。
- 使用 `WASAPI Exclusive` 或设备厂商官方 `ASIO` 验证升频。
- 从 `2x PCM` 或 `4x PCM` 开始，不要一上来就开最高倍率。
- 出现变速、爆音、卡顿或无声时，先关闭 ECHO SRC，再切回 `System` 或 `WASAPI Shared`。

详细设置请看 [ECHO SRC / 升频教程](/zh/docs/audio-output/upsampling/)。

## 上报时请带这些信息

如果按上面恢复后仍然变速，请截图并提供：

- ECHO 输出模式、输出设备、当前 DSP / ECHO SRC 状态。
- 文件格式、采样率、位深。
- Windows 默认格式截图。
- DAC、声卡或驱动面板显示的实际采样率。
- 是否使用蓝牙、虚拟声卡、ASIO4ALL、FlexASIO、Voicemeeter 或其它第三方音频链路。

只说“歌变速了”很难判断原因。把采样率和输出链路一起发出来，才能快速定位。

---

# 为什么第三方音频驱动对音质没有意义

Source: src/content/docs/zh/docs/audio-output/third-party-drivers.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/audio-output/third-party-drivers/
Description: 从数字音频链路、bit-perfect、WASAPI Exclusive、ASIO、重采样、时钟、缓冲和 DAC 角度解释为什么不推荐第三方音频驱动。

这篇文档讨论的“第三方音频驱动”，主要指非设备厂商发布、试图替代、包装或拦截系统音频链路的工具，例如 ASIO 包装层、虚拟声卡、万能驱动包、系统级音效增强驱动、驱动下载站重新打包的 USB DAC 驱动等。

核心结论先放前面：**从数字音频技术角度看，第三方音频驱动通常不会让声音变好。它最多改变音频路由、接口形式、缓冲策略、延迟和兼容性；如果它让声音“明显变了”，那通常意味着它修改了音频数据，做了 DSP、重采样、混音、响度处理或格式转换。**

真正值得安装的驱动，通常只有设备厂商提供的官方驱动，并且也只在有明确设备能力需求时才有意义。比如官方 ASIO、Native DSD、固件工具、控制面板、多通道专业录音接口等。

## 先说结论

1. 音频文件解码后，本质上是一串 PCM 数字采样。驱动的核心职责是把这些采样稳定、按时、按格式送到设备。
2. 如果两条输出链路能 bit-perfect 地送出同一串采样，它们在数字层面没有“音质差异”。
3. 如果第三方驱动让声音变了，通常意味着它改变了采样数据、设备格式、音量、声道矩阵、重采样器或系统音效状态。
4. WASAPI Exclusive 的价值是独占设备、绕开 Windows Shared Audio Engine、减少系统混音和默认格式干扰。
5. ASIO 的价值是低延迟、多通道、专业录音接口和 DAW 工作流，不是普通听歌的音质升级开关。
6. 第三方 ASIO 包装层通常只是把 WDM、Kernel Streaming、WASAPI 或 PortAudio 再包装成 ASIO 接口，不能把普通声卡变成专业声卡。
7. 如果要播放 `88.2 kHz`、`96 kHz`、`176.4 kHz`、`192 kHz` 这类高采样率音乐，并希望设备按曲目原始采样率输出，应该使用 `WASAPI Exclusive` 或设备官方 `ASIO`。`WASAPI Shared` / `System` 通常会把音频转换到 Windows 设备默认格式。
8. 高采样率、低延迟、小 buffer、ASIO、Exclusive 都不等于更好音质。对听歌来说，稳定、格式正确、无额外处理，远比接口名字重要。
9. 第三方驱动增加故障点：无声、爆音、半速、倍速、切歌失败、设备占用、采样率协商失败、睡眠恢复异常、崩溃和安全风险。

## 数字音频链路到底在哪里决定音质

一首音乐从文件到耳机，大致经过这些阶段：

```text
音频文件
  -> 解码器
  -> PCM / DSD 数字数据
  -> 播放器音量 / DSP / ReplayGain / 重采样
  -> 系统音频 API
  -> 系统音频引擎或独占路径
  -> 设备驱动 / USB Audio Class / 厂商驱动
  -> DAC 数模转换
  -> 模拟输出级 / 耳放 / 功放
  -> 耳机 / 音箱 / 房间
```

数字阶段的音乐不是模糊概念，而是明确的采样序列。以 PCM 为例，它是一组按时间排列的数值：某个时刻左声道是多少、右声道是多少，下一个采样点再是多少。

因此音质判断要先分清两件事：

- **数字数据有没有被改写。**
- **DAC 和模拟输出级有没有能力把这些数据转换成低失真、低噪声、稳定的模拟信号。**

第三方驱动通常不负责解码，不负责母带制作，不负责 DAC 模拟电路，也不负责耳机单元。它最多负责数据如何进入设备。如果输入给 DAC 的数字采样完全一致，所谓“驱动让细节更多、声场更大、密度更高”在数字层面没有根据。

## bit-perfect 是边界，不是玄学

bit-perfect 的意思是：播放器解码后的目标采样，在输出到设备前没有被系统混音器、音效、音量、重采样、声道矩阵或第三方工具改写。

如果两条链路输出的采样完全一致，那么它们送给 DAC 的数字内容就是同一份数据。第三方驱动不能在“不改动数据”的同时，让同一份数据包含更多细节。

专业判断通常会看这些可验证问题：

- 文件解码后的采样格式是什么：PCM / DSD、位深、采样率、声道数。
- 播放器有没有开启 DSP、EQ、ReplayGain、音量衰减、Crossfeed、音效增强。
- 系统是否经过 Shared Audio Engine 混音。
- 输出设备是否按目标采样率打开。
- 是否发生了重采样或格式转换。
- 缓冲是否稳定，有没有 underrun、dropout、爆音。
- DAC 端是否稳定锁定输入格式。
- 模拟输出级、耳机、音箱和房间是否才是真正瓶颈。

如果有人说“第三方驱动明显更好听”，专业上应该先问：它是否真的输出了同一串数字样本？是否关掉了所有音效和增益？是否做过电平匹配？是否有 ABX 或 null test？如果没有，这个结论很难从数字音频角度成立。

## WASAPI Shared 是什么

WASAPI Shared 是 Windows 日常最常见的共享音频路径。播放器把音频交给 Windows Audio Engine，系统负责把多个应用的声音混合到同一个输出设备。

它的特点是：

- 多个应用可以同时出声。
- 兼容性最好。
- 系统音量、应用音量、通知音、浏览器、游戏都能正常工作。
- Windows 会把不同应用的音频转换到当前设备的共享格式。
- 如果应用音源采样率和设备默认格式不同，系统可能重采样。

Shared 模式不是“低端模式”。它只是更适合日常使用。只要重采样质量可接受、系统音效关闭、设备稳定，它对普通听歌完全可以很好。

对大多数用户来说，`System` / `WASAPI Shared` 的优势是长期稳定、少出问题、容易排障。稳定播放本身就是音频链路的第一要求。

但这里必须说清楚一个高采样率边界：**如果你播放的是高采样率音乐，而输出走 `WASAPI Shared` / `System`，Windows 通常会把音频转换到当前输出设备的默认格式，也就是设备属性里设置的 mix format。**

例如：

- 设备默认格式是 `24-bit / 48 kHz`，你播放 `96 kHz` 文件，Shared 模式通常会被重采样到 `48 kHz`。
- 设备默认格式是 `24-bit / 96 kHz`，你播放 `44.1 kHz` 文件，Shared 模式通常会被重采样到 `96 kHz`。
- 设备默认格式刚好和曲目一致时，采样率转换可能不会发生，但音频仍然经过 Shared Audio Engine 的共享路径。

所以，如果用户的目标是“让 DAC 按每首歌自己的采样率打开”，或者想确认高采样率文件没有被系统默认格式重采样，就不应该依赖 Shared 模式。此时应使用 `WASAPI Exclusive`，或者在专业声卡 / DAC 官方驱动可靠的前提下使用官方 `ASIO`。

## WASAPI Exclusive 是什么

WASAPI Exclusive 是 Windows 提供的独占输出模式。播放器可以独占某个音频端点，绕开 Shared Audio Engine，不让系统把其它应用声音混进来。

它的专业价值主要在这些地方：

- **绕开系统混音器**：减少 Windows Shared Audio Engine 对数据格式的统一转换。
- **控制设备打开格式**：播放器可以按曲目采样率、位深和声道格式尝试打开设备。
- **减少系统默认格式影响**：不用长期把 Windows 默认格式固定在 192 kHz 或 384 kHz。
- **更适合高采样率原生播放**：播放 `96 kHz`、`192 kHz` 等文件时，播放器可以请求设备按曲目采样率打开，而不是被 Shared 模式统一到 Windows 默认格式。
- **更接近 bit-perfect 验证路径**：在关闭 DSP 和音量处理后，更容易确认输出链路没有被系统改写。
- **延迟可控性更好**：对某些设备和实现，独占模式可以使用更直接的缓冲路径。

但 Exclusive 也有代价：

- 播放时其它应用可能无法出声。
- 设备被占用时，播放器可能打开失败。
- 切歌时如果采样率频繁变化，某些 DAC 会有继电器声、短暂无声或切换失败。
- 某些驱动的独占模式实现不稳定，可能爆音、卡顿、半速或无声。
- 蓝牙设备、虚拟声卡、部分 HDMI / 显示器音频设备未必适合独占模式。
- 系统音量、应用音量和播放器音量关系更容易让用户误判。

所以 WASAPI Exclusive 是专业、合理、可推荐的路径，但它不是“音质增强器”。它的目标是让输出链路更可控，而不是让同一份数字数据凭空变好。

## ASIO 是什么

ASIO 是 Steinberg 提出的专业音频接口模型，最初主要服务于录音、监听、DAW、软音源、多通道专业声卡和低延迟制作环境。

它和普通 Windows 播放路径的核心区别是：ASIO 通常由设备厂商提供专用驱动和 ASIO DLL，让专业软件用回调方式直接和设备驱动交换音频 buffer，减少系统混音和通用音频栈带来的延迟与不确定性。

ASIO 真正强的地方是：

- **低延迟监听**：录音、乐器输入、软音源演奏时，延迟越低越好。
- **多输入输出管理**：专业声卡可能有 8、16、32 路甚至更多通道。
- **稳定的 buffer callback**：DAW 需要按固定 buffer 节奏处理音频。
- **硬件控制面板**：采样率、clock source、buffer size、通道路由、监听混音等由厂商驱动管理。
- **专业同步能力**：Word Clock、ADAT、S/PDIF、AES、MIDI 等专业场景可能依赖厂商驱动。
- **高采样率和特殊格式能力**：部分设备需要官方 ASIO 驱动才能稳定暴露高采样率、Native DSD、多通道或厂商专用格式。

这些能力对专业制作非常重要，但对“播放一首已经制作完成的音乐”并不等于音质提升。

## WASAPI Exclusive 和 ASIO 的优劣对比

下面这张表更接近专业视角，而不是“哪个听起来高级”。

| 维度 | WASAPI Exclusive | ASIO |
| --- | --- | --- |
| 设计目标 | Windows 独占播放路径，减少系统混音和默认格式干扰 | 专业录音、监听、DAW、低延迟、多通道接口 |
| 驱动来源 | Windows 音频栈 + 设备 WDM / UAC / 厂商驱动 | 通常依赖设备厂商 ASIO 驱动和控制面板 |
| 是否绕开系统混音 | 是，通常绕开 Shared Audio Engine | 是，通常不走 Windows Shared Audio Engine |
| 对普通听歌的意义 | 很明确：减少系统混音、控制格式、便于 bit-perfect | 有时有意义，但更多是专业设备工作流需求 |
| 延迟 | 通常低于 Shared，但不是最低延迟目标 | 通常更适合极低延迟录音和实时监听 |
| 多通道专业能力 | 有限，取决于 Windows 端点暴露方式 | 强，专业接口常用 |
| 稳定性 | 一般较好，但取决于设备独占实现 | 高度依赖厂商驱动质量；好驱动很强，差驱动很麻烦 |
| 设备占用 | 独占设备，其它应用可能无声 | 经常独占或半独占，取决于驱动 |
| 热插拔 / 睡眠恢复 | 通常由 Windows 音频栈处理，兼容性较好 | 取决于厂商实现，有些驱动恢复能力一般 |
| 音量控制 | 可能绕开部分系统音量路径，应用行为需确认 | 通常由 ASIO 软件或驱动控制，系统音量常常不生效 |
| 采样率切换 | 播放器可按曲目请求设备格式 | 通常由 ASIO 驱动和控制面板控制 |
| DSD 支持边界 | 通常不是 Native DSD 路径，多数情况下依赖 DoP，把 DSD 封装进高采样率 PCM 帧 | 厂商官方 ASIO 更常见 Native DSD，可暴露更高 DSD 档位 |
| 排障难度 | 中等，Windows 事件和设备状态较容易理解 | 更高，需要看厂商驱动、buffer、控制面板、通道路由 |
| 对音质的直接提升 | 不直接提升，只减少不必要处理 | 不直接提升，只提供专业低延迟和硬件访问路径 |

一句话概括：

- **日常听歌：WASAPI Shared 稳定优先。**
- **高采样率原生输出：WASAPI Exclusive 或官方 ASIO 优先，Shared 通常会按 Windows 默认格式重采样。**
- **制作优先：专业声卡、DAW、录音、低延迟监听才优先 ASIO。**
- **没有官方 ASIO 驱动，就不要为了“看起来专业”去装第三方 ASIO 包装层。**

## DSD 在 WASAPI Exclusive 和 ASIO 下的上限不同

DSD 要单独说，因为它和普通高采样率 PCM 不是同一回事。

`WASAPI Exclusive` 本质上仍然是 Windows 音频端点的独占输出路径。很多情况下，WASAPI 不能直接把 DSD 当作 Native DSD 交给 DAC，而是通过 DoP（DSD over PCM）把 DSD 数据封装在 PCM 帧里送出去。这样做的好处是可以走标准 PCM 设备路径，坏处是最高 DSD 档位会被设备暴露的 PCM 采样率上限卡住。

常见关系是：

| DSD 档位 | DoP 通常需要的 PCM 采样率 | 对 WASAPI Exclusive 的影响 |
| --- | --- | --- |
| DSD64 | `176.4 kHz` PCM | 很多 USB DAC 可以支持 |
| DSD128 | `352.8 kHz` PCM | 需要设备和驱动暴露足够高的 PCM 采样率 |
| DSD256 | `705.6 kHz` PCM | 很多 WASAPI 设备端点不会暴露或不稳定 |
| DSD512 及以上 | 更高封装带宽 | 通常不适合指望 WASAPI + DoP 解决 |

所以，WASAPI Exclusive 能不能播放 DSD、最高到 DSD64 还是 DSD128，取决于 DAC、驱动、Windows 端点暴露的 PCM 格式，以及播放器是否支持 DoP。它不是一个“只要 Exclusive 就 Native DSD”的路径。

官方 ASIO 的情况不同。很多 USB DAC 厂商会通过自己的 ASIO 驱动暴露 Native DSD，也就是让播放器通过 ASIO 驱动把 DSD 数据以厂商支持的方式交给设备。这时最高 DSD 档位可能高于 WASAPI + DoP，例如 DSD256、DSD512，甚至更高，但前提仍然是：

- DAC 硬件本身支持对应 DSD 档位。
- 厂商官方 ASIO 驱动明确支持对应 Native DSD。
- 播放器的 ASIO / DSD 输出实现支持该设备的驱动接口。
- 设备固件、USB 模式和控制面板设置正确。

因此，如果用户关心 DSD，尤其是 DSD256、DSD512 这类高档位，不应该把 WASAPI Exclusive 和 ASIO 看成等价。**WASAPI Exclusive 更常见的是 PCM 独占和 DoP；官方 ASIO 更可能提供 Native DSD 和更高 DSD 上限。** 具体最高支持到哪里，以 DAC 厂商规格、官方驱动说明和播放器实际可打开格式为准。

## 为什么第三方 ASIO 包装层尤其不值得迷信

很多用户说的“ASIO 驱动”其实不是设备厂商原生 ASIO，而是第三方包装层。

这类工具常见逻辑是：

```text
播放器以为自己在调用 ASIO
  -> 第三方 ASIO 包装层
  -> WASAPI / WDM / Kernel Streaming / PortAudio
  -> 真实设备驱动
  -> DAC
```

也就是说，它并没有让硬件突然拥有专业 ASIO 能力，只是在接口外面套了一层。包装层可能解决某些老软件“只能选择 ASIO”的兼容问题，但它不能创造更好的 DAC、不能绕过硬件限制、不能增加音频文件信息。

它还会增加新的变量：

- 包装层自己的 buffer size。
- 真实底层 API 的 buffer size。
- 采样率协商。
- 位深转换。
- 通道映射。
- 设备独占策略。
- 错误处理和崩溃边界。

因此，第三方 ASIO 包装层对普通听歌的收益很小，风险却不少。它最常见的价值是“让某些只认 ASIO 的软件能出声”，不是“让声音更高级”。

## 低延迟不是音质

很多第三方驱动会宣传低延迟、小 buffer、实时输出。这里要分清：

- **录音和监听**：低延迟很重要。歌手监听、吉他输入、MIDI 键盘、软音源演奏都需要低延迟。
- **音乐播放**：低延迟通常不重要。播放一首本地音乐时，多几十毫秒延迟不会降低音质。

过小 buffer 反而会让播放更容易爆音、dropout、卡顿。对听歌来说，稳定 buffer 比极限低延迟更重要。

真正的音质问题是失真、噪声、动态范围、频响、声道串扰、时钟恢复、模拟输出能力和扬声器/耳机表现，而不是播放器到驱动之间少了几毫秒。

## 高采样率驱动不会制造更多细节

把 Windows 默认格式改成 `192 kHz`、`384 kHz`，或者安装一个声称支持超高采样率的第三方驱动，并不会让 `44.1 kHz` 音源凭空变成高解析母带。

采样率提高只代表每秒采样点更多。对已经制作完成的音频文件来说，原始信息已经固定。升采样通常是插值和滤波，质量取决于算法、滤波器设计、噪声整形、处理精度和输出设备能力。系统默认重采样和第三方驱动重采样不等于高质量升频。

高采样率设置还可能带来实际问题：

- 所有系统声音都被统一重采样。
- CPU 和缓冲压力增加。
- 某些驱动出现半速、倍速、爆音或无声。
- 蓝牙、虚拟声卡、游戏和浏览器链路更容易出问题。
- 排障变复杂。

如果真的要玩升频，应该使用明确的专业升频工具和可验证的处理链路，而不是依赖第三方驱动或 Windows 默认格式。

## 时钟、抖动和 USB 传输也不能被第三方驱动神化

很多“音频驱动提升音质”的说法会提到时钟、抖动和 USB 传输。这里也要分清职责。

现代 USB DAC，尤其是异步 USB Audio 设备，音频主时钟通常由 DAC 端主导。电脑和驱动主要负责按缓冲节奏送数据，DAC 负责根据自己的时钟把数字采样转换为模拟信号。

稳定传输当然重要，但第三方驱动不会神奇改善：

- DAC 内部时钟设计。
- USB 接收与隔离设计。
- DAC 芯片和模拟滤波器。
- I/V 转换。
- 运放或离散输出级。
- 耳放推力和失真表现。
- 电源噪声。
- 耳机、音箱和房间声学。

当驱动或传输出问题时，常见表现通常是明确故障：

- 爆音。
- 断续。
- 掉样。
- 无声。
- 延迟异常。
- 采样率错误导致半速或倍速。

这些是稳定性问题，不是正常的“声场变宽”“解析变高”。如果第三方驱动真的改了听感，优先怀疑它改了处理链路，而不是它突破了数字音频原理。

## 第三方驱动的实际风险

第三方音频驱动最大的问题不是“没有提升”，而是它增加了不可控变量。

常见风险包括：

- **稳定性风险**：播放失败、切歌失败、爆音、独占冲突、睡眠恢复后无声。
- **格式风险**：采样率、位深、声道数协商错误。
- **延迟风险**：多一层包装或虚拟路由后，延迟和缓冲更不可预测。
- **排障风险**：播放器、系统、虚拟声卡、包装层、真实驱动之间互相影响。
- **安全风险**：驱动下载站、重新打包安装器和系统级驱动有更高安全风险。
- **支持风险**：播放器很难为非官方驱动的 bug 做保证。

音频链路越长，越不容易稳定。普通用户追求的是长期可靠播放，不是把系统音频栈改成难以复现的混合链路。

## 什么情况下官方驱动有意义

不推荐第三方驱动，不代表所有驱动都没用。官方驱动在这些场景下可能是必要的：

| 场景 | 为什么可能需要 |
| --- | --- |
| 设备厂商要求安装 USB Audio 驱动 | 让 Windows 正确识别设备能力、控制面板或固件工具 |
| 专业声卡 / 录音接口 | 低延迟 ASIO、多输入输出、同步、监听、通道路由 |
| Native DSD | 某些 DAC 需要官方驱动暴露原生 DSD 能力 |
| 固件升级 / 控制面板 | 管理滤波器、增益、时钟、固件、输出模式 |
| 旧系统或特殊设备 | 系统内置 USB Audio Class 支持不足，必须使用厂商驱动 |

判断标准很直接：**驱动必须来自设备厂商，并且解决一个明确能力问题。** 如果只是“据说更好听”“万能优化”“发烧驱动包”，那就不值得安装。

## ECHO 的建议

如果你只是稳定听歌：

1. 优先用 `System` 或 `WASAPI Shared`。
2. Windows 默认格式建议保持 `44.1 kHz` 或 `48 kHz`。
3. 不要安装第三方 ASIO 包装层或万能音频驱动。
4. 不要从驱动下载站安装 DAC 驱动。
5. 外置 DAC 稳定后，可以尝试 `WASAPI Exclusive`。
6. 如果要播放高采样率音乐，并希望 DAC 按曲目原始采样率工作，使用 `WASAPI Exclusive` 或设备官方 `ASIO`；不要指望 `WASAPI Shared` 保持原生采样率。
7. 如果要播放 DSD，尤其是 DSD256、DSD512 这类高档位，优先确认 DAC 官方驱动和播放器的 ASIO / Native DSD 支持；WASAPI Exclusive 通常更依赖 DoP，最高上限可能更低。
8. 需要 ASIO、DSD、固件工具时，只使用设备厂商官方驱动。
9. 出现无声、爆音、半速、倍速、切歌失败时，先回到 `System` / `WASAPI Shared` 排障。

专业音频链路的目标不是把每个开关都开到最高，而是让每一个环节的职责清楚、结果可验证、问题可回退。第三方驱动之所以通常无意义，正是因为它既不能增加源文件信息，也不能替代硬件素质，还会让稳定性和排障成本变差。

---

# ECHO SRC / 升频教程

Source: src/content/docs/zh/docs/audio-output/upsampling.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/audio-output/upsampling/
Description: 教用户在 ECHO Next 中安全使用内置 ECHO SRC 升频：前置条件、独占输出、电脑配置、独立解码、倍率、质量策略、高级滤波与排障。

这份教程写给想在 ECHO Next 里使用内置升频的人。这里说的升频，是 `音效处理 -> ECHO SRC / 升频` 里的本机 PCM 采样率转换，不是 HQPlayer，也不是把 PCM 转成 DSD。

先记住一句话：

**升频是高级 DSP，不是音质魔法。先保证电脑、DAC、驱动和独占输出稳定，再逐步打开。**

![ECHO SRC / 升频普通模式界面](/assets/docs/settings/upsampling/overview.png)

## 开之前先确认三件事

### 需要电脑配置

升频会实时计算新的 PCM 采样点。倍率越高、滤波器越长、质量策略越激进，CPU / GPU 压力越大。

建议这样理解：

| 玩法 | 对电脑的要求 | 建议 |
| --- | --- | --- |
| `2x PCM` | 较轻 | 笔记本、普通台式机可先从这里试 |
| `4x PCM` | 中等 | 推荐起点，兼顾稳定和效果 |
| `8x Ultra` | 较高 | 需要更稳的 CPU、驱动和 DAC，先别作为默认 |
| 高级 Filter / CUDA | 高到很高 | 只建议确认基础升频稳定后再碰 |

如果播放时出现爆音、卡顿、切歌明显变慢、播放状态反复 fallback，先降低倍率，而不是继续堆更重的 Filter。

### 需要独立解码

升频最适合有线外置 DAC、USB 解码器、声卡或带稳定驱动的独立音频设备。它不适合拿蓝牙耳机、蓝牙音箱、显示器音频、笔记本内置扬声器去验证。

原因很简单：升频后的高采样率最终要由设备接收。没有独立解码或稳定声卡时，系统混音器、蓝牙编码、设备固件、虚拟声卡都可能把结果重新处理掉，你看到的数字不一定等于真正送到 DAC 的数字。

### 必须开启独占

想验证 ECHO SRC 是否真正生效，请使用：

- `WASAPI Exclusive`
- 或 DAC / 声卡厂商提供的官方 `ASIO`

不要用 `WASAPI Shared` 或 `System` 验证升频。共享输出会进入 Windows 混音链路，最终采样率可能由系统默认格式决定，ECHO SRC 也可能旁路。想要稳定听歌可以用共享模式；想要验证升频，请用独占或官方 ASIO。

## 最短推荐

第一次使用建议这样设置：

```text
输出模式 = WASAPI Exclusive
输出设备 = 你的独立 DAC / 声卡
ECHO SRC = 4x PCM
质量策略 = Balanced
控制模式 = 普通
高级 Filter / CUDA = 先不碰
DSD / SDM / HQPlayer = 关闭
```

播放 30 秒到 1 分钟，确认没有爆音、卡顿、切歌失败，再考虑更高倍率或更复杂滤波。

## 入口在哪里

1. 先播放一首本地 FLAC / WAV / MP3，确认基础播放正常。
2. 进入左侧 `音效处理`。
3. 在 `采样率` 分组里打开 `ECHO SRC / 升频`。
4. 先保持 `普通` 控制模式。
5. 在倍率里选择 `4x PCM`。
6. 在质量策略里选择 `Balanced`。
7. 确认输出已经是 `WASAPI Exclusive` 或官方 `ASIO`。

页面顶部会显示当前路径、源采样率、目标采样率、引擎、质量策略和精度。刚切换设置时看到“等待下一次播放规划”是正常的，切歌或重新播放后再看实际状态。

## 倍率怎么选

ECHO SRC 会按 44.1 kHz 家族和 48 kHz 家族向上转换。常见结果大致是：

| 源文件 | `2x PCM` | `4x PCM` | `8x Ultra` |
| --- | --- | --- | --- |
| 44.1 kHz | 88.2 kHz | 176.4 kHz | 352.8 kHz |
| 48 kHz | 96 kHz | 192 kHz | 384 kHz |
| 88.2 kHz | 保持或按目标处理 | 176.4 kHz | 352.8 kHz |
| 96 kHz | 保持或按目标处理 | 192 kHz | 384 kHz |
| 176.4 kHz | 保持 | 保持 | 352.8 kHz |
| 192 kHz | 保持 | 保持 | 384 kHz |

如果源文件已经达到或超过当前档位目标，ECHO 可能会旁路，不会为了让界面显示“升频”而重复处理。

### 推荐顺序

1. `关闭`：排障、确认 bit-perfect 候选、确认原始播放。
2. `2x PCM`：轻量测试，适合弱 CPU 或先确认链路。
3. `4x PCM`：推荐日常起点。
4. `8x Ultra`：实验档，确认 DAC 支持 352.8 / 384 kHz 后再试。

不要一上来就开 `8x Ultra`。它不是“越高越高级”，而是更吃电脑、更挑驱动、更挑 DAC。

## 质量策略怎么选

| 策略 | 取向 | 建议 |
| --- | --- | --- |
| `Balanced` | 稳定和开销平衡 | 第一次使用推荐 |
| `Transparent` | 更高精度，优先透明和低失真 | `Balanced` 稳定后再试 |
| `Low latency` | 降低 SRC 开销 | 低延迟、弱 CPU、排查卡顿时使用 |

如果听不出差异，这是正常的。升频不是给每首歌加特效。真正值得保留的设置，是长期播放稳定、切歌不出错、设备能锁定、听感也舒服的设置。

## 怎么确认生效

优先看这几个地方：

1. ECHO SRC 页面里的 `路径` 是否从等待状态变成正在处理。
2. `源采样率` 和 `目标采样率` 是否不同。
3. `引擎` 是否显示当前 SOXR / FIR / CUDA 状态。
4. 右上角 `Bit-perfect 路径` 是否提示当前已经离开 bit-perfect。
5. DAC 屏幕、驱动面板或声卡控制面板是否显示目标采样率。

DAC 或驱动面板的显示很重要。如果 ECHO 请求 176.4 kHz，但 DAC 最后显示 44.1 kHz 或 48 kHz，通常说明输出路径里还有共享混音、驱动重采样或设备限制。

## 为什么开启后不是 bit-perfect

bit-perfect 的意思是尽量把文件里的数字样本原样送出。升频会重新计算采样点，所以只要 ECHO SRC 真正参与处理，就不再是严格 bit-perfect。

这不是错误，而是正确提示：

- 要验证原始输出：关闭 ECHO SRC、EQ、FIR、ReplayGain、声道工具、变速等 DSP。
- 要使用升频：接受它会改变样本，并用输出状态确认链路。

## 高级模式怎么用

高级模式会展开 Filter / HQ-style、CPU/GPU Quality Ladder、Filter 1x、Filter Nx、Compute / CUDA、PCM Dither / Noise Shaping 等选项。

![ECHO SRC / 升频高级模式界面](/assets/docs/settings/upsampling/advanced.png)

新手先不要同时改这些：

- `Filter 1x`
- `Filter Nx`
- `Compute / CUDA`
- `CPU/GPU Quality Ladder`
- `PCM Dither / Noise Shaping`

如果要逐步尝试，顺序建议是：

1. 普通模式 `4x PCM` + `Balanced` 跑稳。
2. 只把质量策略改成 `Transparent`，听同一首歌。
3. 再试 `8x Ultra`，确认 DAC 能稳定锁定 352.8 / 384 kHz。
4. 最后再进高级模式换 Filter。
5. 有 NVIDIA 显卡也不要一开始就开 CUDA。先让 CPU 路径稳定，再看 CUDA 是否可用。

界面提示 CUDA 不可用、未检测到 NVIDIA 驱动、worker 缺失或 fallback 到 CPU 时，先按提示处理。GPU 占用不高不等于没生效，实时音频常常是小块低延迟任务，重点看播放状态里的 active / fallback。

## 高级选项的白话解释

| 选项 | 作用 | 新手建议 |
| --- | --- | --- |
| `Filter 1x` | 处理 44.1 / 48 kHz 这类基础采样率来源 | 先用默认或轻量方案 |
| `Filter Nx` | 处理 88.2 / 96 kHz 以上来源 | 先别和 1x 差太多，方便排障 |
| `Quality Ladder` | 一键选择整套质量/负载方案 | 从 `Realtime Safe` 或 `HiFi` 开始 |
| `Compute / CUDA` | 是否尝试 GPU 计算 | CPU 稳定后再试 |
| `Dither / Noise Shaping` | 固定位深输出时的抖动和噪声整形 | 不确定就保持默认，Float 输出通常不需要急着动 |

高级 Filter 名字看起来很专业，但排障原则仍然一样：一次只改一个变量。

## 出问题怎么退

| 现象 | 先做什么 |
| --- | --- |
| 没声音 | 关闭 ECHO SRC，输出切回 `System` 或 `WASAPI Shared` |
| 爆音 / 卡顿 | 从 `8x Ultra` 降到 `4x PCM`，再降到 `2x PCM` |
| 切歌明显变慢 | 关闭高级 Filter / CUDA，回到普通模式 |
| DAC 不显示目标采样率 | 确认输出是 `WASAPI Exclusive` 或官方 `ASIO` |
| CUDA 开了更不稳 | 切回 CPU，更新 NVIDIA 驱动后再试 |
| bit-perfect 消失 | 正常；要 bit-perfect 就关闭 ECHO SRC |
| DSD / HQPlayer 时没看到升频 | 正常；ECHO SRC 不和这些链路叠加 |

最快回退路径：

```text
关闭 ECHO SRC -> 关闭其它 DSP -> 切回 WASAPI Shared/System -> 播放普通 FLAC
```

## 不要这样用

不要拿蓝牙设备验证升频。蓝牙会经过系统栈、编码器和无线链路，不适合做采样率验证。

不要把 Windows 默认格式长期拉到极高采样率，然后以为所有声音都变好了。系统共享输出和 ECHO SRC 是两条不同链路。

不要在排查无声、爆音、DSD、ASIO、HQPlayer、远程曲库时同时打开 ECHO SRC。先把基础播放修好，再玩升频。

不要用音量更大来判断更好听。比较升频前后时，尽量保持音量一致，听同一段熟悉曲目。

## 一句话总结

大多数用户可以这样用：

1. 平时保持关闭。
2. 想试内置升频时，用独立 DAC + `WASAPI Exclusive` + `4x PCM` + `Balanced`。
3. 稳定后再试 `Transparent`。
4. 确认电脑和 DAC 都顶得住后，再试 `8x Ultra` 或高级 Filter。
5. 出问题就退回 `关闭`，不要硬顶。

ECHO SRC 的意义，是给你一条可解释、可回退的本机 PCM 升频路径。它好不好用，最终看你的电脑算力、独立解码设备、驱动稳定性，以及你是否真的听得出长期舒服的差异。

---

# USB DAC 官方驱动下载入口

Source: src/content/docs/zh/docs/audio-output/usb-dac-drivers.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/audio-output/usb-dac-drivers/
Description: 常见 USB DAC、解码器、声卡和 Hi-End 厂商的官方 USB / ASIO 驱动下载入口，以及 ECHO 对第三方驱动的支持边界。

## 常见 USB DAC 官方驱动下载入口

安装 USB / ASIO 驱动时只建议走厂商官网、厂商支持中心或官方区域站。不要从 `DriverHub`、`DriverMax`、`Treexy`、`driverscape` 这类第三方驱动站下载音频驱动；这些站点即使页面写着型号匹配，也可能夹带安装器、版本过旧或不适合你的具体设备。

ECHO 只会按系统音频接口调用已经安装好的设备驱动，不会对任何第三方驱动提供安装、修复、调试、兼容性适配或售后支持。第三方驱动导致的无声、爆音、蓝屏、识别失败、ASIO 异常、Native DSD 异常等问题，请优先联系设备厂商或驱动作者。

也不要把“装第三方音频驱动”包装成 bit-perfect 玩法。bit-perfect 讲的是链路尽量少动、样本尽量原样送到设备；一边塞入来历不明的驱动层，一边声称自己在追求原始直通，本质上已经很难自洽。尤其是用第三方驱动企图“解 DSD”，更像是把本该由 DAC、官方驱动和真实输出指示确认的能力，交给一个额外中间层来表演：嘴上说追求纯净链路，手上却先把链路改复杂，这就有点掩耳盗铃了。想玩 DSD，请用设备厂商官方驱动、官方说明和 DAC 实际指示验证；否则宁可老实回到 PCM / WASAPI，也不要把不可靠的第三方驱动当成 HiFi 捷径。

下载前先确认这三件事：

1. 设备型号完全一致，尤其是同一品牌下不同 USB 接收方案、不同代产品可能驱动不同。
2. Windows 版本一致，很多驱动会区分 `Windows 10/11`、`Windows 7/8.1`、旧款 XP/Vista。
3. 如果当前 `WASAPI Shared` 已经稳定，且你不需要 ASIO / Native DSD / 固件升级工具，不一定非要安装厂商驱动。

<div class="dac-origin-filter" data-dac-origin-filter data-mode="zh">
  <label class="dac-origin-filter__toggle">
    <input type="checkbox" data-dac-origin-toggle />
    <span class="dac-origin-filter__switch" aria-hidden="true"></span>
    <span>仅显示国产解码 / 中国品牌</span>
  </label>
  <span class="dac-origin-filter__count" data-dac-origin-count></span>
</div>

| 品牌 | 官方入口 | 备注 |
| --- | --- | --- |
| Aavik | https://aavik-acoustics.com/ | Aavik 官方站点；D / U / SD 系列手册提到 Windows 驱动需从 Aavik Acoustics 获取，按具体型号和经销 / 官方支持确认。 |
| Accuphase | https://www.accuphase.co.jp/usbuty.html | Accuphase 日本官方 USB 驱动下载索引，按 DC / DP / DAC 数字输入板型号选择。 |
| Accuphase English | https://www.accuphase.com/model/usb_notice1_v1r3.html | Accuphase 英文 USB driver 说明页，覆盖部分 DC / DP / DAC-40 旧款驱动。 |
| Allen & Heath | https://www.allen-heath.com/hardware/audio-interfaces/ | Allen & Heath 官方音频接口入口；ZEDi / CQ / Qu 系列按型号进入 Software / Downloads。 |
| AMR / Abbingdon Music Research | https://amr-audio.co.uk/products/dp-777-se/ | AMR DP-777 SE 官方页说明 Windows 需要 supplied USB Audio Class 2.0 Driver；旧 DP-777 手册也提示从 AMR 官网获取 ASIO driver。 |
| Amanero | https://www.amanero.com/site/downloads.html | Amanero 官方 Downloads，含 Combo384 / Combo768 驱动与维护工具；它是 USB 接收模块 / OEM 方案，常见于多家 DAC，需按具体设备 USB 模块确认。 |
| Antelope Audio | https://support.antelopeaudio.com/en/support/solutions/articles/42000102036-orion-32-gen4-download-section | Antelope 官方支持文章示例；Orion / Zen / Discrete 等请从官方 support 按型号进入。 |
| Apogee | https://apogeedigital.com/download-files/ | Apogee 官方下载页；Current Product Installers 可能需要登录并注册产品。 |
| April Music / Stello / Eximus | https://www.manualslib.com/manual/997828/April-Music-Eximus-Dp1.html | April Music Eximus DP1 手册含 USB Audio 2.0 Class Driver 安装章节；Stello / Eximus 旧产品官方入口较不稳定，优先看随附介质、手册、代理商或官方支持，不用第三方驱动站。 |
| Aqua acoustic quality | https://www.aquahifi.com/download.html | aqua 官方 Download 页，含 USB Audio Class 2 Driver Windows、X Core Driver 和 Formula xHD Native DSD Driver。 |
| Arcam | https://www.arcam.co.uk/product%2Caccessories%2Caccessories%2Crpac.htm | Arcam rPAC 官方旧产品页，Downloads 区含 Windows Driver、Software、FAQ 和 User Manual。 |
| Astell&Kern | https://www.astellnkern.com/en/support/download.php | A&K 官方 Download 页，含 IRIVER / Dreamus / AK HC 系列 USB DAC Driver。 |
| ATOLL | https://www.atoll-electronique.com/en/xmos-specific-driver-usb/ | ATOLL 官方 XMOS USB 专用驱动页。 |
| Audient | https://audient.com/products/audio-interfaces/id4/downloads/ | Audient iD 系列下载页；软件和驱动可能需要注册产品后从 ARC 获取。 |
| Audio Research | https://audioresearch.com/new_website/audio-research-product-manuals-drivers/ | Audio Research 官方 Product Manuals & Drivers；DAC8 / DAC9 / REFCD 等 USB 驱动或手册按具体型号确认，新版 Windows 10/11 场景也需看官方说明。 |
| Audio-GD | http://www.audio-gd.com/Pro/dac/USB32/USB32EN.htm | Audio-GD 官方 USB-32 驱动安装说明页。不同 USB 模块 / Amanero 方案请按具体设备确认；老站 HTTPS 握手可能失败，官方 HTTP 页可打开。 |
| Audiobyte | https://www.audiobyte.net/products/black-dragon | Audiobyte Black Dragon 官方页说明 Windows 可用 ASIO / WASAPI / KS 驱动并在 Downloads 区获取；Hydra VOX 等型号按产品页底部下载区确认。 |
| Audiolab | https://www.audiolab.co.uk/pages/firmware-drivers | Audiolab 官方 Firmware & Drivers，含 General USB Driver，覆盖 OMNIA、9000、8300、7000、D9、D7、M-ONE、M-DAC 等。 |
| aune | https://en.auneaudio.com/downloads | 官方 Download Center，可按 Driver 类型筛选 USB Driver。 |
| AURALiC | https://support.auralic.com/hc/en-us/sections/204968568-USB-Audio-Driver | AURALiC USB Audio Driver 版本列表。 |
| AURALiC 中国 | https://www.auralic.com.cn/?p=1755 | 中文驱动页，列出支持型号、Windows 版本和历史驱动。 |
| Aurender | https://aurender.com/home/download/ | Aurender 官方 Download 页，含 Aurender FLOW Driver for Windows 7 / 8 / 10；普通 Aurender 服务器 USB 输出兼容性需按 DAC 是否免驱判断。 |
| Ayon Audio | https://www.ayonaudio.com/updated-usb-xmos-driver/ | Ayon 官方 Updated USB-XMOS driver，适用于 CD-1sc、CD-3s、CD-5s、CD-07s、CD-1sx、CD-3sx、Sigma、Stealth、Stratos 等。 |
| Ayre Acoustics | https://ayre.com/support/ | Ayre 官方 Support，含 USB Driver 安装说明；Windows 10+ 基础播放通常有原生驱动，Native DSD 需 Ayre USB Driver。 |
| Bel Canto Design | https://www.belcantodesign.com/user-guides-and-downloads | Bel Canto 官方 User Guides and Downloads，含 XMOS USB Driver 与 USB2.0 Driver for Windows。 |
| Bel Canto FAQ | https://www.belcantodesign.com/faqs | Bel Canto 官方 FAQ 说明 Windows / JRiver 场景需下载 Windows Driver，并按 ZIP 内说明安装。 |
| Benchmark | https://benchmarkmedia.com/pages/dac2-drivers | Benchmark DAC2 / DAC3 驱动页。安装前按页面要求确认 USB Audio 2.0 模式。 |
| Berkeley Audio Design | https://www.berkeleyaudiodesign.com/downloads | Berkeley 官方 Downloads，含 Alpha USB Windows <= 9 Driver 与 Alpha USB / Alpha DAC 系列手册。 |
| 宝达 Boulder | https://boulderamp.com/products/812-dac-preamplifier/ | Boulder 812 DAC Preamplifier 官方产品页，明确有 USB-B 输入和 812 Owners Manual；未核到独立 Windows USB 驱动下载页，优先按手册 / Boulder Controller / 官方支持确认。 |
| Boulder 2120 | https://boulderamp.com/wp-content/uploads/2120-Owners-Manual.pdf | Boulder 2120 官方手册，覆盖 USB 相关输入 / 存储说明；驱动或固件问题应走 Boulder 官方支持，不用第三方“Boulder driver”站点。 |
| Bricasti Design | https://www.bricasti.com/en/consumer/m1usbupgrade.php | M1 USB 官方说明页；M1 / M1 Series II 手册说明 Windows driver 可从官网 Downloads 获取。 |
| Brinkmann Audio | https://www.brinkmann-audio.de/ | Brinkmann 官方站点；Nyquist 手册说明 Windows USB Audio 2.0 Class Driver 可由随附 USB 盘或 Brinkmann 官方获取，按 Nyquist / 具体版本确认。 |
| Bryston | https://bryston.com/digital-audio/bda3/ | Bryston BDA-3 官方产品页；手册说明 Windows 需 Bryston USB Driver，按产品 Downloads 获取。 |
| Burson Audio | https://bursonaudio.com/downloads/ | Burson Downloads & Support，含用户手册、Windows Drivers、macOS Drivers 和不同 Conductor 旧款驱动说明。 |
| Cambridge Audio | https://www.cambridgeaudio.com/eur/driver-updates | Cambridge Driver Updates，含 USB2.0 Driver 与 DacMagic 系列相关下载。 |
| Cary Audio | https://caryaudio.eu/portfolio/dac-200ts-digital-to-analog-converter/ | Cary DAC-200ts 官方欧洲产品页，Resources 区含 USB Driver、USB 固件更新包和安装说明；驱动版本需按 USB 端口固件状态匹配。 |
| 凯音 Cayin | https://en.cayin.cn/technical/9/18.html | 官方固件 / 驱动下载列表，含 Cayin USB Audio Driver 多版本。 |
| Cayin V5.74 | https://en.cayin.cn/drive/9/18/725.html | Windows 10/11 驱动说明页，适用于 RU3 及多款 USB Audio 产品。 |
| CEC | http://www.cec-web.co.jp/service/download/driver/ | CEC 官方 driver 下载目录；CD5 USB 安装手册指向此页获取 Windows USB audio driver。 |
| CEntrance | https://centrance.com/dacport-pro/ | DACport Pro 官方页说明 Windows ASIO 应用可从 CEntrance 官方下载页获取驱动。 |
| CEntrance 下载 | https://centrance.com/download/ | CEntrance 官方 Download 入口；部分下载可能需要填写邮箱或通过浏览器确认。 |
| CH Precision | https://ch-precision.com/images/firmwares/windows-10-driver-installation.pdf | CH Precision 官方 C1 Windows 10 XMOS / USB Audio Class 2.0 驱动安装说明；驱动需从对应产品 Downloads 获取。 |
| Chord Electronics | https://www.chordelectronics.jp/support/ | Chord 日本官方支持页，含 CHORD USB 产品 Windows 驱动入口；具体型号也可从 Chord 产品页查。 |
| Classé Audio | https://support.classeaudio.com/downloads.html | Classé 官方 Apps, Firmware, Drivers & Utilities，含 CP-800 / Sigma SSP USB Playback Driver 和 USB 控制驱动。 |
| Creative | https://support.creative.com/ | Creative 官方支持下载中心，Sound Blaster / USB DAC / 外置声卡按产品搜索。 |
| Cyrus Audio | https://cyrusaudio.com/products/82-dac-qxr/ | Cyrus 82 DAC / 82 DAC QXR 官方产品页，Download 区含 QXR USB Driver；其他 Cyrus DAC 按具体型号页查。 |
| dCS | https://dcsaudio.zendesk.com/hc/en-gb | dCS 支持中心。当前更偏向按产品文档、Mosaic、支持工单处理；不要用第三方站冒充 dCS USB driver。 |
| dCS 文档页 | https://dcsaudio.zendesk.com/hc/en-gb/categories/360003136680-Manuals-Documents | 按 Vivaldi、Rossini、Bartók、Lina、Debussy 等系列查手册 / 软件说明。 |
| DENAFRIPS | https://www.denafrips.com/support | 官方支持页，含 Product Manuals、Thesycon USB Driver 与 USB MCU 固件入口。 |
| Denon | https://manuals.denon.com/dnp2000ne/eu/en/DRDZSYmmnlndcl.php | Denon DNP-2000NE 官方手册说明 Windows USB-DAC 需从产品页 Download 区获取专用驱动；其他 Denon USB-DAC 型号按具体产品页查。 |
| Devialet | https://help.devialet.com/hc/en-us/articles/360000193445-What-is-Devialet-Air | Devialet 官方 Help Center；Expert / Expert Pro 的 AIR、USB / ASIO 驱动和配置通常与账户内 Expert Configuration / 官方支持相关，按设备注册状态确认。 |
| ELAC Alchemy | https://elac.com/ddp-2 | ELAC DDP-2 官方产品页，Download 区含 USB Audio Driver Software。 |
| EMM Labs | https://www.emmlabs.ca/da2i.php | DA2i 官方支持 / 下载区，含 Windows USB Audio Drivers；新版 Windows 10 USB Audio 2 通常会自动安装。 |
| EMM Labs / Meitner Legacy | https://www.emmlabs.ca/legacy.php | EMM Labs DAC2X / XDS1 与 Meitner MA-1 / MA2 等旧产品 USB Drivers 官方 legacy 页。 |
| ESI Audio | https://www.esi-audio.com/support/download/ | ESI 官方 Download 区，含 MAYA、U、GIGAPORT、Juli 等驱动。 |
| ESOTERIC | https://www.esoteric.jp/en/support/download | 按产品型号下载，页面明确包含 Windows / macOS Driver 类型。 |
| Eversolo | https://www.eversolo.com/Support/downloads.html | Eversolo 官方固件 / 驱动下载页，DAC-Z 系列和 DMP 系列按型号选择。 |
| Eversolo FAQ | https://www.eversolo.com/en/support/faq | 官方 FAQ 中提供 Windows USB IN Driver 说明和下载地址。 |
| exaSound | https://www.exasound.com/Products/e62DAC.aspx | exaSound 官方产品页说明使用自家 Mac OS / Windows ASIO drivers；最新版驱动按 exaSound support 获取。 |
| Ferrum Audio | https://ferrum.audio/support/ | Ferrum 官方 Support，含 Windows ASIO Driver、Ferrum Streaming Control Technology Driver、HYPSOS USB Driver 和 WANDLA / ERCO 文档。 |
| 飞傲 FiiO | https://www.fiio.com/newsinfo/765462.html | FiiO USB DAC Windows 驱动说明页，含 Win10/11 与 Win7/8 版本链接。 |
| Firestone Audio | https://darko.audio/2010/06/firestone-audio-bravo-24-96-digital-processor/ | Firestone Audio 旧款 Fubar / Bravo / I Love TW 等 USB DAC / DDC 资料分散；未核到稳定官方驱动下载页，旧设备优先按包装、手册、代理商或官方售后确认，不用第三方驱动站。 |
| Focusrite | https://downloads.focusrite.com/ | Focusrite 官方 Downloads，按 Scarlett、Clarett、Saffire 等系列和型号选择。 |
| Focusrite 驱动说明 | https://support.focusrite.com/hc/en-gb/articles/211881185-Download-Focusrite-interface-drivers | 官方说明哪些接口需要单独驱动、哪些通过 Focusrite Control 一并安装。 |
| Fosi Audio | https://fosiaudio.com/pages/support | Fosi 官方 SUPPORT 页，含 DAC / 耳放手册、DS1 / DS2 / Q5 等驱动入口和 Help Center 链接。 |
| Gold Note | https://www.goldnote.it/discontinued/fiorino-usb/ | Gold Note Fiorino USB / DAC-7 等旧产品页提示 Windows 需专用驱动；未核到统一驱动索引，按具体产品页或官方支持确认。 |
| Grace Design | https://www.gracedesign.com/support/firmware/m9XX_DFU_Instructions_and_Firmware_Release_Notes.pdf | Grace Design 官方 m900 / Massdrop m9XX 固件说明，包含 Windows XMOS Stereo USB Audio Class2 Driver / DFU 工具下载指引。 |
| Gryphon Audio | https://gryphon-audio.dk/wp-content/uploads/zena-dac-usb-windows-driver-installation.pdf | Gryphon 官方 Zena DAC USB Windows 驱动安装说明；驱动从 Gryphon 官网下载。 |
| 歌诗德 GUSTARD | https://www.gustard.com/?page_id=8956 | 官方 Driver download，含 XMOS / Amanero 方案和不同 Windows 版本。 |
| Hegel | https://www.hegel.com/en/technology/usb | Hegel USB 官方说明页；当前多数产品通过较新的 Windows / macOS 即插即用，旧产品或固件按 support.hegel.com 查。 |
| HiBy | https://store.hiby.com/apps/help-center | HiBy 官方 Help Center，含 USB DAC Driver Download and Installation Guide。 |
| High Resolution Technologies / HRT | https://www.stereophile.com/content/hrt-music-streamer-usb-da-converter-specifications-0 | HRT Music Streamer / HeadStreamer 等旧 USB DAC 多为免驱或旧系统场景；原厂站点可用性较差，优先看官方手册 / 经销资料，避免第三方驱动聚合站。 |
| Hidizs | https://www.hidizs.com/pages/download-center | Hidizs Download Center，含 USB DAC Driver for Windows 与部分 AP 系列驱动。 |
| Holo Audio | https://kitsunehifi.com/pages/downloads | Kitsune HiFi 是 Holo Audio 美国官方经销 / 支持来源之一，提供 HoloAudio USB Driver、固件和旧版驱动。 |
| iBasso | https://ibasso.com/down/ | iBasso 官方 Downloads，含 DX / DC / D16 等 USB-DAC Driver、固件和 App。 |
| iBasso DC 系列 | https://ibasso.com/dcseries/ | DC01 / DC02 / DC 系列驱动、固件和 UAC App 页面。 |
| Ideon Audio | https://ideonaudio.com/downloads/ | Ideon 官方 Downloads，含 Customized USB Audio 2.0 Class Driver for Windows、Absolute DAC Driver、Ayazi DAC Drivers 和 ASIO4All 说明。 |
| iFi 中国 | https://www.ifi-audio.com.cn/downloads/ | 中文驱动页，含 USB 驱动安装说明和多个 Windows 驱动版本。 |
| iFi audio | https://downloads.ifi-audio.com/support/download-hub/ | iFi Download Hub，按产品选择驱动、固件和 App。 |
| JCAT | https://jcat.eu/product/usb-card-femto-audiophile-usb-audio-output/ | JCAT 是发烧级 USB 输出卡 / USB 隔离等电脑音频链路设备，不是普通 DAC；USB Card FEMTO 页面提供可选 Renesas USB3 主控驱动，Windows 8+ / macOS 多数场景自动加载。 |
| JDS Labs | https://jdslabs.com/support/drivers/ | JDS Labs 官方 Drivers and Firmware 页，含 XMOS Driver、固件更新工具和型号支持说明。 |
| Khadas | https://www.khadas.com/support-tone | Khadas Tone 系列支持页，含 Tone1 / Tone2 / Tone2 Pro 驱动与固件入口。 |
| KingRex | https://www.kingrex.net/download/KingRex%20UD384%20USB%20DAC%20user%20manual%20verson%202%2020111017.pdf | KingRex UD384 官方手册含 Windows 驱动安装、ASIO / WASAPI 配置说明；旧款 UD01 等多为系统 USB Audio 设备，按具体型号手册确认。 |
| KORG DS-DAC | https://www.korg.com/us/support/download/software/0/529/2583/ | KORG AudioGate and USB Audio Device Setup 官方下载页，含 DS-DAC 驱动。 |
| LAiV Audio | https://www.laiv.audio/downloads | LAiV 官方 Downloads，含 Harmony DAC / Harmony µDAC / Harmony µDDC 的 Windows USB Driver、手册和 TL-USBDFU 更新组件。 |
| LampizatOr | https://www.lampizator.com/downloads | LampizatOr 官方下载页，列出 LampizatOr USB driver for Windows；旧手册也提到 XMOS 驱动。 |
| Leema Acoustics | https://leema-acoustics.com/libra/ | Leema Libra / 新 iD 系列具备 USB DAC 输入；未核到统一公开驱动下载页，现代系统多按 USB Audio Class 处理，旧系统或 ASIO 需求走官方支持。 |
| 星见夏空 LETECIEL | https://www.sina.cn/news/detail/5275641155945861.html | 星见夏空官方展会信息确认“使魔”小尾巴支持专属 ASIO 驱动与 APP 调节；未核到公开官网驱动下载页，优先通过官方账号、官方店铺、包装说明或售后获取，不用第三方驱动站。 |
| LH Labs / Light Harmonic | https://lhlabs.freshdesk.com/support/solutions/articles/5000683037-geek-out-driver-installation- | LH Labs 支持页含 Geek Out / Geek Pulse / Vi DAC 等 Light Harmonic Audio Driver 安装说明和版本提示；品牌旧支持系统仍可查，但不要使用 DriverMax 等镜像。 |
| LINDEMANN | https://lindemann-audio.de/en/limetree-usb-dac | Limetree USB-DAC 官方页；现代 USB Audio Class 2 设备通常免驱，旧款 USB-DAC 24/192 按产品文档 / 官方支持确认。 |
| Linn | https://docs.linn.co.uk/wiki/index.php/Technical_Specification%3ASelekt_DSM | LinnDocs Selekt DSM 技术规格，确认 USB Audio Class 2；未核到专用 Windows 驱动下载页，通常按系统 UAC2 / Linn 文档处理。 |
| Linn Software | https://www.linn.jp/software/ | Linn 日本官方 Software 页，含 Linn App / Kazoo / Konfig 等软件下载；这是控制 / 配置软件，不等同于第三方 USB DAC 驱动。 |
| Lotoo 乐图 | https://www.lotoo.cn/english/bottom/Service/Download/ | 官方下载中心，主要是固件、手册、快速指南；USB DAC 驱动需按具体型号说明确认。 |
| LUMIN | https://www.luminmusic.com/manual/model-differences.html | LUMIN 官方型号差异页，列明哪些型号有 USB audio output / digital inputs；LUMIN 多数场景是网络播放器 / 转盘，不是给电脑装 USB DAC 驱动。 |
| LUMIN Firmware | https://www.luminmusic.com/manual/firmware-updating.html | LUMIN 官方固件更新说明，固件通过 LUMIN App 自动检查和更新；USB 输出兼容问题应先看官方手册和固件说明。 |
| LUXMAN | https://www.luxman.com/product/detail.php?id=22 | LUXMAN Driver Software 页，面向 DA / D 系列 USB D/A 产品。 |
| LUXMAN 日本 | https://www.luxman.co.jp/product/driver_software | 日本官方驱动页，列出 D-08u、D-06u、DA-07X、DA-06、DA-250、DA-150、D-10X、D-07X、D-03X 等型号。 |
| Lynx Studio | https://support.lynxstudio.com/hc/en-us/articles/115002882989-How-do-I-install-the-Hilo-USB | Lynx 官方 Hilo USB 驱动安装说明页。 |
| M-Audio | https://www.m-audio.com/drivers | M-Audio 官方文档、驱动和软件下载页，覆盖 M-Track、AIR、MIDISPORT 等。 |
| M2Tech | https://m2tech.jp/driver.html | M2Tech 日本官方品牌站 Windows ASIO 驱动页，含当前与旧产品驱动。 |
| Marantz | https://support.marantz.com/app/answers/detail/a_id/1973/~/where-to-find-the-windows-os-audio-drivers-for-my-marantz-model | Marantz 官方支持文章列出 SACD30n、SA-10、CD 50n 等 Windows USB Audio 驱动版本。 |
| Mark Levinson | https://www.marklevinson.com/products/integrated-amplifiers/MLNO5805AM.html | Mark Levinson Nº 5805 官方产品页，Downloads 区含 Mark Levinson USB Audio Driver 和安装说明。 |
| 矩声 Matrix Audio | https://www.matrix-digi.com/en/downloads/ | 官方下载中心；部分 USB DAC 驱动也在产品手册 / DSD 配置指南中给出。 |
| Matrix Audio USB 驱动包 | https://www.matrix-digi.com/drivers/Matrix_Audio_All_Driver.zip | 矩声官方文档中给出的 USB DAC 驱动包地址。 |
| McIntosh | https://www.mcintoshlabs.com/products/d-a-converters/MDA200 | McIntosh MDA200 官方页，Downloads 区按 DA2 模块提供 Windows 10/11 与 Windows 7 USB Audio Driver。 |
| McIntosh Legacy | https://www.mcintoshlabs.com/legacy-products/cd-players/MCD550 | MCD550 官方 legacy 页，含 McIntosh USB Audio Windows Driver B 与安装指南；其他 McIntosh 型号按产品页查。 |
| Meitner Audio | https://emmlabs-meitner.com/products/meitner-ma3i | MA3i 官方产品页；MA3 / MA3i 手册说明 Windows 10/11 通常免驱，旧 Windows 从官网或随附介质获取驱动。 |
| Merging Technologies | https://www.merging.com/anubis/download | Merging Anubis 官方下载页；驱动 /固件按型号与平台选择。 |
| Meridian Audio | https://help.meridian360.com/2024/Content/Online_Help/Explorer/Documents/DownloadFiles_Explorer.htm | Meridian Explorer 官方帮助页下载入口；Explorer 系列旧款 Windows 驱动 / 文档按 Meridian 360 帮助中心查。 |
| Metrum Acoustics | https://metrumacoustics.com/modules/84-usb-module-4.html | Metrum 官方 USB Module 页面含 USB module 3 XMOS manual 下载；不同 Metrum DAC 可能使用 M2Tech、XMOS 或后续 USB 模块，驱动需按具体模块和手册确认。 |
| Métronome / Kalista | https://www.metronome.audio/downloads/ | Métronome 官方 Downloads，含 AQWO、CLASSICA、DIGITAL SHARING、C5+、C6+、C8+、CD8 S、Kalista DAC、DreamPlay DAC 等 2019 前 USB Input Drivers。 |
| Microsoft USB Audio 2.0 | https://learn.microsoft.com/windows-hardware/drivers/audio/usb-2-0-audio-drivers | Windows 10 1703 起内置 USB Audio 2.0 class driver；很多现代 DAC 不需要额外厂商驱动。 |
| Mola Mola | https://www.mola-mola.nl/downloads.php | 官方 Downloads 页，含 Mola Mola USB-Audio Driver for Windows、DIGIN programmer 和 Tambaqui / Makua 手册。 |
| MOON by Simaudio | https://simaudio.com/wp-content/uploads/2018/04/43_en_v_moon-usb-hd-dsd-guide.pdf | MOON USB HD DSD Driver 官方安装指南；Windows 需要驱动以完整支持高解析 / DSD。 |
| 水月雨 MOONDROP | https://moondroplab.com/cn/download | 支持下载页，含 MOONRIVER2、DAWN、DASH75 等 Windows 驱动 / 固件。 |
| MOTU | https://motu.com/en-us/download/#category=1&product=507 | MOTU 官方下载入口；M2 / M4 / M6 等 M-Series 按产品选择 installer。 |
| MSB Technology | https://msbtechnology.com/dacs/usb/usbdrivers/ | MSB USB 输入模块驱动页，含 Windows USB Drivers；macOS 通常不需要更新 USB 驱动。 |
| Musical Fidelity | https://musicalfidelity.com/support/software-downloads/ | 官方 Software Downloads，含 Nu-Vista / M8x / M6x / M3x DAC、M6s、MX-DAC、V-LINK192 等 Windows USB Driver。 |
| MUTEC | https://mutec-net.com/artikel.php?id=1665518548 | MUTEC 官方 MC3+USB Windows 10/11 USB Audio 2.0 driver 公告，含版本说明和下载入口。 |
| Mytek Audio | https://mytek.audio/support | Mytek 旧款产品驱动、固件、手册页，含 Mytek USB Driver 与 Control Panel。 |
| Nagra | https://www.nagraaudio.com/wp-content/uploads/2018/12/Nagra-HD-DAC-User-Manual-English.pdf | Nagra HD DAC 官方手册说明 PC 需要安装驱动，驱动在随附 USB key 中；未核到统一公开驱动下载页，优先联系 Nagra / 经销商。 |
| Naim Audio | https://www.naimaudio.com/products/dac-v1 | DAC-V1 官方产品页，Software Download / Update 区含 Driver Installer 与 Windows Custom Driver 安装说明。 |
| Neumann | https://www.neumann.com/en-us/products/audiointerfaces/mt-48 | Neumann MT 48 官方产品页；Windows 端需要 MT 48 Toolkit，产品页提供 Manuals & Software / Download Area。 |
| NICEHCK 原道 / YUANDAO | https://nicehck.cn/about | 原道现在主要是 NICEHCK 原道耳机品牌。未核到官方 USB DAC Windows 驱动页；如使用纯耳机 / IEM 不需要驱动，别从 ZOL、驱动精灵等第三方站下载“原道驱动”。 |
| North Star Design | https://naspecaudio.com/maker/north-star-design/usb-dac32/ | North Star Design USB dac32 / Essensio Plus 等旧款 USB DAC 资料多在代理商和手册中；未核到稳定官方驱动下载页，按设备随附驱动、手册或官方/代理支持确认。 |
| NuPrime | https://nuprimeaudio.com/product/dac-9/ | NuPrime DAC-9 产品页含 USB Driver 区，列出 NuPrime Audio WHQL 与旧款通用 USB Audio 驱动。 |
| Okto Research | https://www.oktoresearch.com/dac8pro | Okto Research dac8 PRO 官方页面 Downloads 区提供 Okto Research ASIO driver for Windows；旧固件版本需按手册说明联系官方确认。 |
| Onkyo | https://intl.onkyo.ru/support/firmware/p-3000r.html | Onkyo A-9000R / P-3000R 官方固件页，含 USB Device Driver for Windows / macOS 旧款下载。 |
| OPPO Digital Japan | https://www.oppodigital.jp/support/usb-driver-software/ | OPPO USB Audio Class 2.0 DAC Driver 官方日本支持页，覆盖 HA-1、HA-2、Sonica DAC、UDP-205 等旧产品。 |
| PALAB | https://www.palabaudio.com/download.html | PALAB 官方 Download 页，含 DAC-M1 手册、Windows 7 USB Driver 与 Windows 10 / 11 USB Driver。 |
| Peachtree Audio | https://www.peachtreeaudio.com/pages/usb-drivers-and-firmware | Peachtree 官方 USB Drivers and Firmware，按 Carina、nova、preDAC、sonaDAC、shift、DAC-iT X、X1 等型号区分驱动。 |
| Pioneer | https://global.pioneer/en/support/ | Pioneer 官方支持入口；U-05 等旧 USB DAC 驱动需按日本 domestic support / 具体型号页查，不建议使用第三方镜像。 |
| Playback Designs | https://www.playbackdesigns.com/ | Playback Designs 官方站；USB 驱动 / PDUU 更新工具按产品与支持下载说明获取。 |
| PreSonus | https://www.presonus.com/support/downloads | PreSonus 官方 Support Documents and Downloads，按产品和系统选择驱动。 |
| Primare | https://primare.net/support/documents-downloads/ | Primare 官方 Documents & Downloads，含 USB Driver - Primare USB Audio v5.72.0；I35 DAC 用户指南也说明 PC 需安装 Primare XMOS audio driver。 |
| Prism Sound | https://prismsound.com/music_recording/support_subs/support_tech.php?tt=0026 | Prism Sound 官方技术说明；Lyra / Titan / Atlas 等 USB interfaces 的 Windows driver、ASIO 延迟和固件更新按 Prism Sound 支持页确认。 |
| Pro-Ject Audio Systems | https://www.project-audio.com/en/downloads/ | Pro-Ject 官方 Downloads 总入口，按 DAC Box / Head Box / Pre Box 等具体型号查驱动、固件和手册。 |
| Pro-Ject DAC Box RS2 | https://www.project-audio.com/en/product/dac-box-rs2/ | DAC Box RS2 官方产品页，Download 区含 Windows Driver zip。 |
| PS Audio | https://www.psaudio.com/pages/downloads | PS Audio 官方 Downloads，含 DirectStream 固件和 Windows USB Drivers。 |
| Qudelix | https://www.qudelix.com/blogs/blog/pc-chrome-app | Qudelix 官方 PC Chrome App 说明；5K / T71 主要通过官方 App / Chrome 扩展管理，不要下载第三方“驱动包”。 |
| Questyle | https://questyleshop.com/pages/qpm-documents-downloads | Questyle QPM 文档 / 下载页，含 QPM USB DAC Driver；其他型号按官方支持或产品页确认。 |
| Rega | https://www.rega.co.uk/download/dac-r-user-manual-english.pdf | Rega DAC-R 官方手册说明 Windows USB driver 需从 Rega 网站对应产品下载，Mac OS 不需要单独驱动。 |
| Resonessence Labs | https://www.resonessencelabs.com/resonessence-generic-thesycon-usb-audio-2-0 | Resonessence 官方 Thesycon Asynchronous USB Audio 2.0 驱动页，说明支持 Resonessence 全系产品的 Windows USB Audio 2.0。 |
| RME | https://www.rme-usa.com/downloads.html | RME 驱动 / 固件下载页，适合 ADI-2 DAC、ADI-2 Pro、Babyface、Fireface 等。 |
| Rockna Audio | https://www.rockna-audio.com/products/wavedream-dac | Wavedream DAC 官方产品页 Utility 区含 USB drivers、firmware 和手册。 |
| RODE | https://help.rode.com/hc/en-us/articles/360000399616-AI-1-ASIO-Drivers | RODE AI-1 ASIO Drivers 官方帮助页。 |
| Roland Rubix | https://www.roland.com/us/support/by_product/rubix22/updates_drivers/3a8362ae-b4e3-473d-b325-2e88c689bd6a/ | Roland Rubix22 / Rubix24 / Rubix44 Windows Driver 官方页。 |
| Rotel | https://www.rotel.com/usb-drivers | Rotel 官方 PC-USB Windows Drivers 页，覆盖 A12 / A14 / RA / RC / RSP / Michi 等 PC-USB 型号。 |
| S.M.S.L | https://www.smsl-audio.com/portal/product/downlist/id/11.html | 产品驱动列表，按 DAC / AMP / Player / Other 与系列选择。 |
| Schiit | https://www.schiit.com/drivers | 官方 Windows USB Drivers 页；新款 Unison USB / Windows 10/11 通常不需要额外驱动，旧款 Gen 2 / Gen 3 / Gen 5 按页面说明。 |
| Sennheiser | https://www.sennheiser.com/en-us/support | Sennheiser 官方 Support，含 Downloads & instructions。多数耳机 / USB-C 耳机通常走系统 USB Audio 或自家软件，不要从第三方站下载“森海塞尔驱动”。 |
| SFORZATO | https://www.sfz.co.jp/index.php/download/ | SFORZATO 官方 Download 页面，包含 USB ドライバ入口；按 DSP / PMC / DST 等具体型号和日文说明确认。 |
| 山灵 Shanling | https://en.shanling.com/download/73 | UA、EM / EA 系列 USB 驱动页，页面列出兼容与不兼容型号。 |
| Singxer 声仕 | https://www.singxer.com/col.jsp?id=108 | 官方驱动下载页，含 Singxer USB Audio Class2 Driver。 |
| Soekris Audio | https://www.soekris.dk/ | Soekris 官方站列出 dac1221、dac2541、dac1541 等 R-2R DAC；多数场景按 USB Audio Class / 官方手册处理，未核到独立 Windows USB 驱动下载页。 |
| Solid State Logic | https://solidstatelogic.com/products/ssl2-plus | SSL 2 / 2+ / MKII 产品页含 Windows ASIO/WDM Driver 下载入口。 |
| Sony | https://www.sony.com/electronics/support/software/00282467 | Sony UDA-1 USB DAC Amplifier Driver 官方支持页，含 Windows 版本、文件名和安装说明。 |
| Sony 日本 | https://www.sony.jp/support/netjuke/download/driver-uda1/ | UDA-1 USB 端子用 Windows 驱动日文官方页。 |
| Sonnet Digital Audio | https://www.sonnet-audio.com/Support.html | Sonnet Digital Audio 官方 Support 页面，列出 Morpheus manual、Sonnet Windows 10 USB driver 和 Amanero Windows 10 USB driver。 |
| SOtM | https://docs.sotm-audio.com/doku.php?id=en%3Ahow_to_install_dx-usb_hd_driver | SOtM 官方文档，说明 dX-USB HD Windows 驱动安装流程和官方产品页入口。 |
| SOULNOTE | https://www.soulnote.audio/soulnote-en/downloads | SOULNOTE 官方 Downloads；Drivers and firmware 区指向厂商软件页。 |
| SOULNOTE Software | https://www.kcsr.co.jp/eu_sn_software.html | SOULNOTE 官方软件 / 驱动入口，按 D-1N、D-2、D-3 等型号确认。 |
| Soulution | https://soulution-audio.com/downloads/ | Soulution 官方 Downloads，含 590 / 560 / 760、330 / 325 等 USB Driver 项。 |
| SPL | https://spl.audio/en/spl-produkt/phonitor-x/ | SPL Phonitor x 官方页；The Drivers 区提供 DAC768xs / DAC192 的 Windows 驱动，Mac / iOS 通常免驱。 |
| SSL 日本 | https://www.solid-state-logic.co.jp/products/ssl2 | SSL 日本官方页，直接列出 SSL 2 / 2+ Windows ASIO/WDM Driver 下载入口。 |
| Steinberg / Yamaha | https://o.steinberg.net/en/support/downloads_hardware/yamaha_steinberg_usb_driver.html | Yamaha Steinberg USB Driver 官方下载页，适用于 UR / IXO / Yamaha 相关 USB 音频设备。 |
| T+A | https://www.ta-hifi.de/en/support/series-200/support-dac-200-2/ | DAC 200 支持页，含 Windows driver 与安装手册。其他型号从 T+A support 进入。 |
| 天使吉米 TANCHJIM | https://tanchjim.com/services/ | TANCHJIM 官方下载中心，含 TANCHJIM PC、ASIO 驱动、SPACE / SPACE Lite / LUNA / LUNA AT WHQL 驱动、VAST 驱动和固件升级工具。 |
| TASCAM | https://tascam.jp/int/ | TASCAM 国际官网；USB Audio Interface Driver 通常在具体产品的 Support / Downloads 页。 |
| TASCAM US-1200 | https://tascam.jp/int/product/us-1200/support | 示例产品支持页，展示 TASCAM 驱动 / 固件 / 文档下载方式。 |
| TEAC | https://www.teac.co.jp/int/support/download | TEAC 集团下载入口，需要进入具体 Premium Audio / TASCAM / ESOTERIC 产品页。 |
| Technics | https://jp.technics.com/support/downloads/pc-app/index.html | Technics 官方 Audio Player / Driver for Windows 下载页，面向带 USB-DAC 的 Technics 产品。 |
| TempoTec | https://www.tempotec.net/pages/firmware-download | TempoTec 官方 Driver & Firmware Download，含 Sonata、Serenade、V6、March、M5 等 USB2.0 Audio Driver。 |
| Theta Digital | https://www.thetadigital.com/software/ | Theta Digital 官方 Software 页，主要提供 Downloader / 固件更新工具；未核到普通 USB DAC 音频驱动下载页，Casablanca USB 多用于 Dirac / 控制场景。 |
| TIDAL Audio | https://www.tidal-audio.com/camira/ | TIDAL Audio CAMIRA 官方产品页注明 asynchronous USB class 2 input，并列出 Windows USB-driver TIDAL Camira；其他型号按产品页或官方支持确认。 |
| TOPPING | https://www.toppingaudio.com/download/v5-74-driver-for-most-of-topping-dacs | TOPPING 官方“most DACs”驱动页，区分 Win10/11 与 Win7/8.1。 |
| Totaldac | https://www.totaldac.com/use_note.htm | Totaldac 官方使用说明：Windows 10 / iOS / Linux 不需要安装驱动，旧版 Windows 需要时由官方邮件提供专用驱动。 |
| TRUTHEAR | https://truthear.com/download | TRUTHEAR 官方 Download Center，含 SHIO USB DAC/AMP 驱动和固件，页面提供版本号与 MD5。 |
| Ultrasone NAOS | https://www.av-iq.com/avcat/ctl1642/index.cfm?manufacturer=ultrasone&product=ultrasone-naos | Ultrasone NAOS 资料说明 Windows 需要驱动安装，但未核到当前可用的 Ultrasone 官方下载页；优先联系 Ultrasone 官方支持，避免第三方驱动站。 |
| Universal Audio | https://www.uaudio.com/downloads/ua-connect | UA Connect 官方下载页；Apollo / Volt / UAD 软件和驱动通常通过 UA Connect 管理。 |
| Vermeer Audio | https://www.vermeeraudio.com/es/archivo/ | Vermeer 官方 Archives，含 Vermeer Audio TWO / LaSource / LaFontaine 相关 USB audio driver、升级包和旧 Audio Aero 驱动。 |
| Vermeer Audio TWO | https://www.vermeeraudio.com/produit/vermeer-audio-two/ | Vermeer Audio TWO 官方产品页，确认异步 USB 输入、USB DSD64 等能力；驱动按官方 Archives 获取。 |
| Violectric / Lake People | https://www.violectric.de/produkte/zubehoer/violectric-usb-eingang-mit-24-bit/192-khz-tenor-fuer-dac | Violectric 官方 USB 输入模块页，说明 Windows 应用需要 proprietary driver，并从下载区获取。 |
| WADAX | https://wadax.eu/ | WADAX 官方站点；Reference Server / DAC 等 USB Audio、固件或服务资料按具体产品手册、经销商和官方支持确认，不使用第三方驱动站。 |
| Wadia | https://www.wadia.com/ContentsFiles/wadia-di322om-01.pdf | Wadia di322 官方手册说明 Windows USB Audio Driver 在产品页 PC DRIVER SETUP 区下载；按具体 Wadia 型号确认。 |
| Wavelength Audio | https://www.wavelengthaudio.com/ | Wavelength Audio 官方站说明其产品覆盖 USB / computer audio；旧款 USB DAC 多为资料留存场景，驱动或兼容问题按官方/手册确认，不用第三方驱动站。 |
| Weiss Engineering | https://weiss.ch/support/downloads/highend-hifi/ | Weiss High-End Hi-Fi 官方下载区，含 DAC202、DAC50x / HELIOS 等 USB Audio Device Driver (WIN)。 |
| Wyred 4 Sound | https://wyred4sound.com/ | Wyred 4 Sound 官方站；部分旧款异步 USB DAC / USB 转换器需要专用驱动，当前产品需按具体产品 Downloads / FAQ 判断。 |
| xDuoo | https://xduoo.net/firmware-download/ | 官方固件 / 驱动入口；部分手册注明在此选择 XDUOO USB Driver。 |
| 钰龙 YULONG | https://www.yulongaudio.com/cn/col.jsp?id=111 | 钰龙官方下载页，含 Win11、旧版 Win7 / XP 驱动和 DA8 / DA8II 等旧型号驱动。 |
| Zoom | https://zoomcorp.com/en/jp/audio-interface/ | Zoom 官方音频接口产品页；各型号 Support & Downloads 提供驱动 / 固件。 |

<style>
  .dac-driver-link {
    align-items: center;
    display: inline-flex;
    gap: 0.55rem;
    line-height: 1.25;
    max-width: 100%;
    padding: 0.18rem 0.35rem 0.18rem 0.2rem;
    text-decoration: none !important;
    vertical-align: middle;
    background: transparent !important;
    border-radius: 8px;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
    transition:
      background-color 160ms ease,
      color 160ms ease;
  }

  .dac-driver-link:hover {
    background: rgba(123, 87, 176, 0.1) !important;
  }

  .dac-driver-link__icon {
    background: rgba(255, 255, 255, 0.86);
    border: 1px solid rgba(123, 87, 176, 0.16);
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(67, 56, 101, 0.08);
    flex: 0 0 auto;
    height: 1.35rem;
    object-fit: contain;
    padding: 0.16rem;
    width: 1.35rem;
  }

  .dac-driver-link__text {
    display: grid;
    gap: 0.08rem;
    min-width: 0;
  }

  .dac-driver-link__host,
  .dac-driver-link__path {
    display: block;
    max-width: min(34rem, 100%);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dac-driver-link__host {
    color: currentColor;
    font-weight: 750;
  }

  .dac-driver-link__path {
    color: var(--sl-color-gray-3);
    font-size: 0.82em;
    font-weight: 520;
    overflow-wrap: anywhere;
  }

  :root[data-theme='dark'] .dac-driver-link:hover {
    background: rgba(189, 167, 255, 0.14) !important;
  }

  :root[data-theme='dark'] .dac-driver-link__icon {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(205, 190, 255, 0.24);
  }
</style>

<script>
(() => {
  const root = document.querySelector('[data-dac-origin-filter]');
  if (!root) return;

  const chineseBrands = new Set([
    'aune',
    'Audio-GD',
    'AURALiC',
    'AURALiC 中国',
    'Cayin V5.74',
    'DENAFRIPS',
    'Eversolo',
    'Eversolo FAQ',
    'Firestone Audio',
    'FiiO',
    'Fosi Audio',
    'GUSTARD',
    'HiBy',
    'Hidizs',
    'Holo Audio',
    'iBasso',
    'iBasso DC 系列',
    'Khadas',
    'KingRex',
    'LAiV Audio',
    'Lotoo 乐图',
    'Matrix Audio',
    'Matrix Audio USB 驱动包',
    'MOONDROP',
    'NICEHCK 原道 / YUANDAO',
    'PALAB',
    'Questyle',
    'Shanling',
    'Singxer 声仕',
    'S.M.S.L',
    '星见夏空 LETECIEL',
    '天使吉米 TANCHJIM',
    'TempoTec',
    'TOPPING',
    'TRUTHEAR',
    'xDuoo',
    'YULONG',
    '凯音 Cayin',
    '山灵 Shanling',
    '歌诗德 GUSTARD',
    '水月雨 MOONDROP',
    '矩声 Matrix Audio',
    '钰龙 YULONG',
    '飞傲 FiiO',
  ]);

  const normalize = (value) => value.replace(/\s+/g, ' ').trim();
  const table = Array.from(document.querySelectorAll('.sl-markdown-content table')).find((candidate) => {
    const head = candidate.querySelector('thead th:first-child');
    return head && /品牌|Brand/i.test(head.textContent || '');
  });
  if (!table) return;

  const rows = Array.from(table.querySelectorAll('tbody tr'));
  const toggle = root.querySelector('[data-dac-origin-toggle]');
  const count = root.querySelector('[data-dac-origin-count]');
  if (!toggle) return;

  rows.forEach((row) => {
    const link = row.cells[1]?.querySelector('a[href^="http"]');
    if (!link || link.dataset.dacDriverLink === 'ready') return;

    link.dataset.dacDriverLink = 'ready';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.classList.add('dac-driver-link');

    const label = link.textContent || link.href;
    const text = document.createElement('span');
    text.className = 'dac-driver-link__text';
    link.textContent = '';

    try {
      const url = new URL(link.href);
      const host = document.createElement('span');
      const path = document.createElement('span');
      host.className = 'dac-driver-link__host';
      path.className = 'dac-driver-link__path';
      host.textContent = url.hostname.replace(/^www\./, '');
      path.textContent = url.pathname === '/' && !url.search ? '官方网站' : url.pathname + url.search;
      text.append(host, path);
      link.title = label;

      const icon = document.createElement('img');
      icon.className = 'dac-driver-link__icon';
      icon.alt = '';
      icon.decoding = 'async';
      icon.loading = 'lazy';
      icon.referrerPolicy = 'no-referrer';
      icon.src = 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(url.hostname) + '&sz=32';
      icon.addEventListener('error', () => icon.remove(), { once: true });
      link.append(icon);
    } catch {
      // Keep the original link usable if a URL is malformed.
      text.textContent = label;
    }

    link.append(text);
  });

  rows.forEach((row) => {
    const brand = normalize(row.cells[0]?.textContent || '');
    row.dataset.chineseDac = chineseBrands.has(brand) ? 'true' : 'false';
  });

  const update = () => {
    const onlyChinese = toggle.checked;
    let visible = 0;
    rows.forEach((row) => {
      const show = !onlyChinese || row.dataset.chineseDac === 'true';
      row.hidden = !show;
      if (show) visible += 1;
    });
    if (count) count.textContent = onlyChinese ? '已显示 ' + visible + ' 个国产品牌' : '共 ' + rows.length + ' 个品牌';
  };

  toggle.addEventListener('change', update);
  update();
})();
</script>

如果你的品牌不在表里，优先搜索“品牌官网 + support/download + 具体型号”，不要直接搜“型号 + driver”后点第三方结果。找不到官方驱动时，宁可先用 Windows 自带 USB Audio 2.0 / WASAPI 路径验证播放，也不要随便安装来历不明的 ASIO 驱动。

---

# 网盘连接教程

Source: src/content/docs/zh/docs/cloud-drive.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/cloud-drive/
Description: 通过 WebDAV、NAS、Subsonic 或 Navidrome 连接自己的远程音乐库。

ECHO 可以连接你有权访问的远程音乐库。常见做法有三类：把网盘或 NAS 作为 WebDAV 文件目录连接，把自建服务器作为 SMB / NAS 路径管理，或者使用 Subsonic / Navidrome 这类个人音乐服务。

由于 QQ:3298219648 的卓越开发贡献，ECHO 将不再对普通版进行网盘支持。请购买 Pro 版以解锁网盘功能。

如果你还没有决定用哪一种方式，推荐优先使用 Subsonic 兼容服务，尤其是 Navidrome。ECHO 对 Subsonic 路线做过特殊优化：音乐库分页、专辑与艺术家读取、播放地址获取、封面缓存和大曲库浏览都更接近“音乐服务”的使用方式，不需要像普通网盘目录那样频繁递归扫描文件夹。

## 服务器推荐：雨云

如果你没有现成的 NAS 或云服务器，又想把 Navidrome、Subsonic、WebDAV、反向代理、对象存储或其它远程曲库服务长期挂起来，可以看看 [雨云](https://www.rainyun.com/NzY3Mzg5_)。

雨云是国内的云服务平台，常见产品包括云服务器、游戏云、物理服务器、虚拟主机、对象存储和 CDN 等。对 ECHO 用户来说，它更适合承担“放一个稳定的远程音乐服务”的角色：例如在云服务器上部署 Navidrome，把自己的音乐目录挂载进去，再让 ECHO 通过 Subsonic 协议连接，而不是每次都直接扫一个慢目录。

推荐这样用：

- 想长期跨设备听自己的曲库：租一台轻量云服务器，部署 Navidrome / Gonic / Airsonic，再在 ECHO 里添加 Subsonic 来源。
- 想测试 WebDAV 或反向代理：先用小规格机器验证端口、证书和目录权限，不要一开始就把完整曲库全量搬过去。
- 想放封面、公开静态文件或辅助资源：可以按需了解对象存储和 CDN，但音乐版权与访问权限仍然由你自己负责。

这是推广链接，不是 ECHO 的必需服务。你可以继续使用自己的 NAS、家用服务器、其它云厂商或本地网络方案；无论使用哪家服务，ECHO 只建议连接你有权访问和使用的内容。

## 先确认版权和权限

请只连接你自己拥有、已授权或有权使用的音乐内容。ECHO 不提供音乐下载服务，不帮助绕过付费、版权、地区或访问控制限制，也不会为侵权来源提供支持。

连接前先准备好：

- 服务地址，例如 `https://music.example.com` 或 `https://dav.example.com/music/`。
- 账号和密码，或服务生成的应用密码 / 访问令牌。
- 可以从浏览器或服务客户端正常访问的测试目录。
- 一小组确认可播放的音频文件，优先用 MP3 / FLAC / M4A 这类常见格式。
- 已激活的 ECHO Pro。未解锁 Pro 时，网盘入口可能不可用或无法完成连接。

## 先选连接方式

不同“网盘”背后的连接方式不一样。不要看到网盘两个字就随便填地址，先确认服务提供的是什么协议。

| 你的情况 | 推荐方式 | 说明 |
| --- | --- | --- |
| 网盘或 NAS 提供 WebDAV 地址 | WebDAV | 最通用，适合按文件夹浏览和播放。 |
| 自己有服务器，能部署音乐服务 | Subsonic / Navidrome | 最推荐，适合长期管理大曲库。 |
| 家里 NAS 已经整理好音乐目录 | WebDAV 或媒体服务 | 局域网优先，外网访问要注意证书和端口。 |
| 只有普通分享链接 | 不建议 | 分享链接通常不是稳定的音乐库协议，ECHO 不会把它当作官方支持路径。 |
| 想跨设备长期听同一个库 | Subsonic / Navidrome | 比直接扫网盘目录更稳定，也更像真正的音乐服务。 |

如果只是想把一小批远程文件临时打开，WebDAV 足够。如果你有几千、几万首歌，优先考虑 Navidrome。

## WebDAV 连接完整流程

WebDAV 是网盘连接里最常见的方式。它本质上是远程文件夹，所以关键是地址、账号、权限、目录结构和网络稳定性。

### 1. 在网盘或 NAS 后台开启 WebDAV

不同服务的入口名称可能不一样，常见叫法包括：

- `WebDAV`
- `DAV`
- `文件服务`
- `网络驱动器`
- `第三方应用访问`
- `应用密码`

如果服务要求生成应用密码，请优先使用应用密码，不要直接把主账号密码填进播放器。应用密码以后可以单独撤销，风险更低。

### 2. 复制正确的 WebDAV 地址

WebDAV 地址通常长这样：

```text
https://dav.example.com/
https://dav.example.com/music/
https://nas.example.com:5006/Music/
```

注意这些细节：

- 地址必须包含 `http://` 或 `https://`。
- 如果服务给了端口号，要一起复制，例如 `:5006`。
- 如果音乐目录在子路径里，路径也要带上，例如 `/Music/`。
- 有些服务要求末尾保留 `/`，连接失败时可以试一次加斜杠和不加斜杠。
- 不要把用户名、密码拼进 URL 里，账号密码应填到 ECHO 的对应输入框。

### 3. 先用浏览器或客户端验证

在填进 ECHO 前，先用浏览器、系统文件管理器或网盘官方客户端确认：

1. 账号能登录。
2. 能看到音乐目录。
3. 能打开一个普通音频文件。
4. 目录里不是空的，也不是只有分享页 HTML。

如果在浏览器或官方客户端都打不开，ECHO 里通常也不会 magically 好起来。先把网盘服务本身调通。

### 4. 在 ECHO 里添加 WebDAV 来源

1. 打开 ECHO Next。
2. 确认 ECHO Pro 已激活。
3. 进入远程来源 / 网盘连接页面。
4. 选择 `WebDAV`。
5. 填写名称，例如 `我的 NAS 音乐库`。
6. 填写 WebDAV 地址。
7. 填写用户名和应用密码。
8. 点击测试连接。
9. 测试成功后，先进入一个小目录。
10. 播放一首 MP3、FLAC 或 M4A，确认能正常缓冲和播放。

第一次连接不要直接扫整个网盘根目录。先用一个只有几张专辑的小目录确认链路稳定，再扩大范围。

### 5. 整理适合远程浏览的目录

推荐目录结构：

```text
Music/
  Artist/
    Album/
      01 - Track.flac
      02 - Track.flac
      cover.jpg
```

尽量避免：

- 把音乐、照片、压缩包、软件安装包混在同一个根目录。
- 一个目录里塞几万首歌。
- 目录层级特别深。
- 文件名里大量使用奇怪符号、临时编号或乱码。
- 同一张专辑拆到很多位置。

WebDAV 列目录比本地硬盘慢很多。目录越混乱，ECHO 越难快速判断哪些是音乐、哪些是封面、哪些应该跳过。

### 6. 再考虑同步、缓存和索引

连接能播放之后，再按需求开启同步或缓存。推荐顺序：

1. 先只浏览，不同步。
2. 播放几首不同专辑的歌曲。
3. 确认封面、时长、进度和切歌稳定。
4. 再开启小范围索引。
5. 最后才扩大到完整音乐目录。

如果你一上来就全量索引大网盘，遇到慢、卡、超时，并不一定是 ECHO 坏了。远程目录遍历、封面读取、服务限速和网络抖动都会拖慢首次扫描。

## 推荐方案：Subsonic / Navidrome

Subsonic 兼容服务更适合把远程音乐库长期接入 ECHO。它提供的是“音乐库 API”，不是单纯的文件列表，所以更适合专辑、艺术家、封面、播放列表和大曲库浏览。

推荐流程：

1. 在服务器上部署 Navidrome、Gonic、Airsonic 或其它 Subsonic 兼容服务。
2. 在服务端确认音乐目录已完成扫描，并能在网页端正常播放。
3. 在 ECHO 的远程来源页面选择 `Subsonic` 或兼容入口。
4. 填入服务器地址、用户名和密码。
5. 先测试连接，再浏览一个小范围的专辑或艺术家。
6. 播放一首普通格式歌曲，确认封面、时长和播放进度正常。
7. 最后再开启更大范围的同步、缓存或索引。

Subsonic 方案的优势：

- 大曲库浏览更稳定，不需要一次性列完整个目录树。
- 专辑、艺术家、曲目编号、封面等信息通常比普通文件目录更完整。
- ECHO 可以按音乐服务语义读取内容，减少无意义的文件夹猜测。
- 远程播放地址由服务器生成，跨设备访问更清晰。
- 对弱网络和大库分页更友好。

如果你的网盘只是用来存放音乐文件，而你又能部署一个轻量服务，建议把网盘挂载到服务器，再交给 Navidrome 扫描。这样 ECHO 连接的是 Subsonic 服务，而不是直接连接网盘目录，体验通常更稳。

## WebDAV 网盘连接

很多网盘、NAS 和同步工具都能提供 WebDAV。WebDAV 的优点是通用，缺点是它本质上仍然是远程文件目录，性能取决于网盘服务、网络、目录结构和认证方式。

连接步骤：

1. 在网盘或 NAS 后台开启 WebDAV。
2. 复制 WebDAV 地址，注意是否需要保留最后的路径斜杠。
3. 使用服务提供的应用密码，不建议直接使用主账号密码。
4. 在 ECHO 的远程来源页面选择 `WebDAV`。
5. 填入地址、用户名、密码。
6. 先测试连接，再打开一个小目录。
7. 播放一首歌曲确认稳定后，再扩大到完整目录。

WebDAV 使用建议：

- 不要一开始就扫描整个网盘根目录。
- 音乐目录尽量保持清晰，例如 `Music/Artist/Album/Track.flac`。
- 大量小文件、深层目录和慢速网盘会明显拖慢浏览。
- 如果封面很多，先确认播放稳定，再开启封面缓存或批量索引。
- 公司、校园或公共网络可能限制 WebDAV 端口。
- 如果网盘服务会限制频率，批量索引时可能出现间歇性失败，降低并发或分目录处理更稳。

## 常见网盘填写检查

不同网盘的后台名称和限制不一样，但排查方向基本相同：

| 检查项 | 正确做法 |
| --- | --- |
| 协议 | 优先使用服务官方提供的 WebDAV / DAV 地址，不要填普通网页分享链接。 |
| 账号 | 使用服务允许 WebDAV 登录的账号；有些服务要求邮箱、手机号或专门用户名。 |
| 密码 | 优先使用应用密码、访问令牌或第三方应用密码。 |
| 路径 | 直接指向音乐目录，避免从整个网盘根目录开始。 |
| HTTPS | 外网访问优先用 HTTPS；自签证书可能导致连接失败。 |
| 端口 | NAS 常见会使用非 443 端口，复制地址时不要漏掉端口号。 |
| 权限 | 确认账号至少有读取目录和读取文件的权限。 |

如果服务端提供“只读应用密码”，建议使用只读权限。ECHO 连接网盘主要是读取和播放音乐，不需要给它网盘管理权限。

## NAS / 局域网目录

如果你的音乐库在家用 NAS 上，优先确认局域网访问稳定。NAS 的瓶颈通常不是 ECHO 本身，而是硬盘休眠、账号权限、证书、路由、DDNS 或端口转发。

建议：

- 局域网内先用固定 IP 或稳定主机名连接。
- 外网访问优先使用 HTTPS 和可信证书。
- 不确定公网暴露风险时，不要直接开放管理端口。
- NAS 会休眠时，第一次播放或浏览可能需要等待硬盘唤醒。
- 大库首次索引时保持电脑和 NAS 供电稳定。

## 连接失败时怎么排查

按这个顺序查，效率最高：

1. 用浏览器或官方客户端确认账号能登录。
2. 确认服务器地址、端口、路径、HTTPS 证书没有写错。
3. 先测试一个小目录，不要直接测试全库。
4. 换一首普通格式音频，排除单个文件损坏或编码特殊。
5. 临时关闭代理或切换网络，确认是不是网络环境问题。
6. 查看服务端日志，确认请求是否到达服务器。

反馈问题时，请附上服务类型、服务器版本、连接地址格式、错误提示截图、是否使用代理、网络环境，以及能否在浏览器或原服务网页端播放。

## 常见错误怎么判断

| 现象 | 可能原因 | 处理方式 |
| --- | --- | --- |
| 提示未解锁或没有入口 | 未激活 ECHO Pro | 先按 [ECHO Pro 激活教程](/zh/docs/echo-pro/)完成激活。 |
| 401 / 403 | 用户名、密码、应用密码或权限错误 | 重新生成应用密码，确认账号有读取权限。 |
| 404 | WebDAV 路径写错 | 从服务后台复制完整地址，检查子路径和末尾斜杠。 |
| 连接超时 | 网络、端口、代理、服务限速或服务器休眠 | 换网络，检查端口和证书，先用浏览器验证。 |
| 能列目录但不能播放 | 文件权限、直链生成、服务端 Range 支持异常 | 换普通 MP3 / FLAC 测试，查看服务端日志。 |
| 封面加载慢 | 网盘读取小文件慢或封面太多 | 先关批量封面缓存，确认播放稳定后再慢慢索引。 |
| 扫描很久 | 目录过大、层级太深、网盘限速 | 分目录添加，或改用 Navidrome。 |
| 某些歌打不开 | 文件损坏、格式特殊、文件名编码异常 | 先用本地 ECHO 或其它播放器验证该文件。 |

## 什么时候不建议直接连网盘

以下情况更推荐改用 Subsonic / Navidrome：

- 曲库很大，目录层级很深。
- 网盘 WebDAV 列目录很慢或容易超时。
- 你希望按专辑、艺术家、播放列表浏览，而不是只按文件夹浏览。
- 你需要更稳定的封面、时长、曲目编号和远程播放地址。
- 你经常跨设备、跨网络访问同一个音乐库。

简单说：WebDAV 适合“我想打开远程文件夹”；Subsonic 更适合“我想把远程音乐库长期接进 ECHO”。如果条件允许，优先选 Subsonic。

---

# Hall of Shame

Source: src/content/docs/zh/docs/community-boundaries.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/community-boundaries/
Description: ECHO 的开源、赞助、支持范围与社区沟通边界。

> 强烈建议所有新用户先看完这一页，尤其是下面的截图示例。ECHO 欢迎真实反馈、日志、复现和 PR，但不接受把开源维护当成无限义务的沟通方式。

ECHO 是开源项目，不是跪地服务业，不是免费客服外包，更不是谁情绪上头时随手砸过来的垃圾桶。

源码开放、文档公开、安装包可用，意思是项目愿意透明、愿意协作、愿意让更多人参与；不等于维护者需要低声下气地求任何人使用，也不等于每一句无礼要求都要被当成产品路线图供起来。

愿意正常使用、认真反馈、提交日志、写复现、提 PR、补文档的人，欢迎。把“我不用你就完了”“开源就该伺候我”“你不按我说的做就是有罪”当沟通方式的人，请先把键盘放下，把开源两个字重新学一遍。或者学习怎么如何做人 怎么讲话 如何上网 或者闭上臭嘴

另外 如果您觉得用AI不好 请先控告NVIDIA/Bytedance/Tencent/Meta/SpaceX等厂商,这里是OpenAI Partner 建议全部控告一遍:https://openai.com/business/partners/


**动物园观察所：**

以下截图用于说明 ECHO 不接受的沟通方式：把开源误解为无限义务、把维护成本污名化、用攻击性表达替代复现和事实。截图已按公开展示需要处理可识别信息；这里讨论的是行为边界，不是公开动员围攻任何个人。


此人已经超脱人类范围 晋级为传说中的"牲畜" 此人觉得ECHO是圈钱项目 觉得开发者在骗大家钱 他可能觉得全世界都在圈钱 用电收费可能是电业局在圈钱 买车票可能是12306在圈钱 上学可能是教育局在圈钱 不知道开发者做错了什么要被扣上这种罪名 如果以后ECHO闭源 请找QQ 3298219648进行维护 此人智商已经超过了Claude Mythos,觉得任何使用AI写的项目都是垃圾 所以,以后ECHO发生任何收费/闭源向的趋势 请找此人


**补充:**

此人疑似已经失心疯了 被挂就变成典韦 彻底疯狂 天下怎么有这么蠢的人? 人生第一次见 本来我就没打算做壳 大家想免费获取Pro自己拆就是了 但这脑残不仅骂我圈钱 而且大肆宣扬 甚至用豆包写了首诗来攻击我 我是不知道圈钱在哪了

"破解开源项目"还是有史以来第一次看到 这是人吗?! 你用豆包跑一下不就破解了

嗯!我向大家承诺ECHO不会收费 而且永久开源 

不过...接下来加了一些防护措施 如果有开发需求误伤到您了 请申请开发者计划私信我获取最新私钥 

![截图 1](./Sucai/1.png)

![截图 2](./Sucai/2.png)

![截图 3](./Sucai/3.png)

![截图 4](./Sucai/4.png)

![截图 5](./Sucai/5.png)

![截图 6](./Sucai/6.png)

![截图 7](./Sucai/7.png)

![截图 8](./Sucai/8.png)

![截图 9](./Sucai/9.png)

![截图 10](./Sucai/10.png)

![截图 11](./Sucai/11.png)

![截图 12](./Sucai/12.png)

## 开源不等于零成本

首先 现在大家都在用AI写代码 如果您觉得AI写代码就是垃圾 就是烂 那么请去控告英伟达/Bytedance/AMD/Intel/腾讯 这些厂商都使用了AI

另外,ChatGPT 5.5 Pro AK了CCPCF. Codeforces估分已经到了3600+ 如果您的Rating＞3600 那您说什么我都受着

开源的意思是源码可见、规则透明、协作可参与，不是开发、测试、打包、答疑、维护、兼容、文档和情绪劳动都自动变成无偿义务。

ECHO 的维护成本包括但不限于：

- 桌面端播放链路、系统音频差异和第三方驱动兼容。
- 曲库扫描、远程来源、插件、歌词、封面和元数据边界。
- 构建、签名、发布、下载、文档和问题复现。
- 长期维护里那些看不见但一直在消耗时间的琐碎工作。

把这些都当成“反正开源，所以活该免费无限供应”，并不会显得很懂开源，只会显得很会把别人的时间当公共消耗品。开源不是廉价劳动力征用证，也不是把维护者按在服务台后面无限续杯。

## 赞助不是圈钱

ECHO 可以接受赞助，也可以在未来提供付费服务、增值服务、托管服务或其它可持续维护方式。这和“圈钱”不是一回事。

项目不靠空气运行，开发者也不靠一句“开源就应该”充电。觉得赞助恶心、付费可耻、维护者最好倒贴时间和情绪价值的人，可以继续使用已有开源版本，也可以 fork 之后自己维护。没人拦着，真的。

但请不要一边享受成果，一边把维护成本描述成道德污点。这个姿势不高级，只是吵；也不要把“我不愿意支持”包装成“项目不该活得可持续”。这不是原则，是把别人劳动当免费耗材。

## 支持范围不是许愿池

清晰、可复现、低风险的问题会更容易被处理。下面这些不会提高优先级：

- 没有日志、没有截图、没有版本号，只丢一句“不能用”。
- 把个人偏好包装成官方义务。
- 要求接入明显有版权、授权或平台边界风险的来源。
- 用威胁、扣帽子、阴阳怪气、道德审判来催功能。
- 把“我想要”说成“你必须做”，再把拒绝理解成冒犯。

维护者可以选择帮忙，也可以选择不接。开源项目不是许愿池，更不是谁声音大、攻击性强、戏多，谁就能插队。

## 社区沟通底线

可以批评 ECHO。可以指出 bug。可以说某个设计不好用。可以拿事实、日志和复现把问题讲清楚。

不欢迎的是：

- 人身攻击、造谣、骚扰、挂人和泄露个人信息。
- 把第三方侵权风险推给 ECHO 官方。
- 把“我想要”说成“你必须做”。
- 把维护者的克制误读成可以继续消耗。
- 用情绪勒索替代问题反馈，用扣帽子替代事实。

如果沟通已经只剩攻击、扣帽子和消耗，ECHO 会选择停止互动。不是怕批评，也不是输不起，而是没有必要把公共项目变成情绪战场。

## 对“开源就该跪着服务”的统一回复

不会。

ECHO 不会为了证明自己“友好”而接受羞辱式沟通，不会为了取悦任何一个人去承担不该承担的版权、授权和维护风险，也不会把维护者的时间拿去喂没有边界感的争吵。

想解决问题，请给复现。想推动功能，请讲场景。想要长期维护，请尊重成本。想把开源当成免费出气口，那这里不提供这项服务。

## 如果你真的想让 ECHO 变好

请提供可操作的信息：

- ECHO 版本、系统版本和安装渠道。
- 复现步骤、截图、错误提示、日志或诊断信息。
- 音频问题请附输出模式、设备名、文件格式、采样率和位深。
- 曲库问题请附导入路径类型、扫描阶段和错误信息。
- 功能建议请说明真实使用场景，而不是只写“快点做”。

这类反馈会减少来回确认，也更可能被真正处理。项目欢迎认真协作，不欢迎把开源当成免费情绪外包。

---

# ECHO Developer 计划

Source: src/content/docs/zh/docs/developer-plan.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/developer-plan/
Description: ECHO Developer 计划面向愿意参与 ECHO 生态、插件、工具链或体验改进的开发者，审核通过后可获得 ECHO Pro 与开发协作入口。

ECHO Developer 计划面向愿意参与 ECHO 生态建设的人：插件作者、前端开发者、音频链路研究者、工具链贡献者、文档维护者、测试反馈者，以及其它能稳定推动项目变好的开发者。

这不是普通用户反馈入口，也不是“申请了就一定给权限”的自动表单。它更像一个开发协作通道：先确认你能做什么、想参与什么，再决定是否加入。

## 开发权限边界

ECHO 官方开发仅面向通过审核的 ECHO Developer。未通过 Developer 计划的人可以反馈问题、提出建议、维护自己的 fork 或提交文档勘误，但不能参与 ECHO 官方开发、访问开发者仓库、使用内部资料或提交要求合并的实现。

如果你准备参与代码、插件、构建、发布、授权、更新源或工程文档维护，请先阅读 [ECHO Developer 开发准入](./engineering/developer-access/)。

## 计划权益

审核通过后，开发者可以获得：

- 免费 ECHO Pro 使用资格，用于开发、测试和体验验证。
- 加入 ECHO 开发者群聊。
- 按需访问开发者仓库或相关协作资料。
- 更直接地反馈插件、主题、音频输出、曲库、远程源、文档等开发问题。

ECHO Pro 权益是为了方便开发和验证，不代表可以转借、转卖或公开共享授权。

## 适合申请的人

你可以考虑申请，如果你符合其中一种情况：

| 类型 | 适合说明 |
| --- | --- |
| 插件作者 | 想为 ECHO 写歌词、封面、元数据、音源候选、工具面板或主题插件。 |
| 前端 / Electron 开发者 | 能参与界面、交互、性能、桌面集成或跨平台问题改进。 |
| 音频方向开发者 | 熟悉 WASAPI、ASIO、DSP、重采样、播放器链路、驱动或音频排障。 |
| 工具链 / 后端开发者 | 能参与发布、更新源、授权服务、数据处理、同步或诊断工具。 |
| 文档维护者 | 能把复杂功能写成用户能看懂、能照着操作的文档。 |
| 播放器作者 / 录音工作者 | 有播放器开发、专业录音、音频工程或相关产品经验。 |

如果你只是想问普通使用问题，请优先看文档和 FAQ；如果你只是想反馈 bug，请走普通反馈渠道。

## 申请需要提供

申请时请尽量一次说清楚：

- QQ：用于确认身份、后续通知和通过后邀请进群。
- GitHub：主页、公开项目、贡献记录，或能代表你的公开作品。
- 开发经验：熟悉的技术方向，例如前端、Electron、音频、插件、后端、移动端、文档工程等。
- 希望参与的方向：你想解决什么问题，或者想做什么插件 / 工具 / 文档。
- 可选补充：Codeforces、AtCoder、洛谷主页，或其它能证明能力的作品。

如果你是其它播放器作者或专业录音工作者，也可以直接说明身份和相关作品。

## 申请入口

可以从官网的 [ECHO Developer 计划页面](/zh/developer/) 发送申请或复制申请模板。

审核通过后，会按实际协作需要开通 ECHO Pro、开发者群聊和相关仓库访问。未通过不代表能力否定，只代表当前协作方向或信息不足。

## 协作边界

参与 ECHO Developer 计划后，仍然需要遵守项目边界：

- 不要公开传播内部仓库、测试包、授权信息或未发布内容。
- 不要把开发者 Pro 权益分享给其它人使用。
- 不要提交会破坏用户曲库、下载入口、更新链路或播放稳定性的高风险改动。
- 提交 PR 或建议前，尽量把目标、范围、风险和验证方式说明清楚。

ECHO 欢迎有用的贡献，也欢迎认真提问题。最重要的是稳定、可验证、能长期维护。

---

# DLNA / 数播串流教程

Source: src/content/docs/zh/docs/dlna-connect.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/dlna-connect/
Description: 如何用 ECHO 发现 DLNA 数播、投送当前歌曲、连接局域网渲染器，并排查发现、格式和网络问题。

这份教程写给想把 ECHO 的音乐投到局域网数播、流媒体播放器、智能音箱、电视或功放的人。ECHO 的 DLNA/UPnP 投送逻辑是：

```text
ECHO 选歌和控制 -> ECHO 临时提供音频 URL -> DLNA 数播/渲染器播放
```

也就是说，ECHO 不是把声音从电脑声卡“录出来”再发过去，而是把当前曲目变成数播能访问的局域网地址，然后让数播播放。

## 先说结论

第一次串流 DLNA，按这个最稳：

1. ECHO 电脑和数播连同一个局域网。
2. 数播打开 DLNA / UPnP Renderer / Media Renderer 功能。
3. ECHO 先播放或选中一首普通 MP3 / FLAC。
4. 打开 ECHO 的 `Connect` 页面。
5. 点击右上角 `刷新`。
6. 在设备列表里找到你的数播。
7. 点击设备右侧的 `连接`。
8. 数播开始播放后，再用 ECHO 的播放、暂停、停止、音量和进度控制。

如果设备列表为空，先不要改音频输出、EQ 或曲库。DLNA 发现问题通常是局域网、路由器、Windows 防火墙或数播模式问题。

## DLNA 名词先搞清楚

| 名词 | 含义 | 例子 |
| --- | --- | --- |
| DMS / Media Server | 提供媒体库和文件的服务器 | NAS、Jellyfin、Windows 媒体共享 |
| DMR / Media Renderer | 真正播放声音的设备 | 数播、功放、电视、智能音箱 |
| DMC / Control Point | 控制播放的 App | ECHO、手机遥控 App |

ECHO 在投送时主要像 DMC，同时临时提供当前曲目的 HTTP 音频地址。你要连接的是 **DMR / Media Renderer**，不是只会提供文件的 Media Server。

如果你的 NAS 出现在网络里，但它只是媒体服务器，不是播放器，ECHO 不会把它当成可投送设备。

## ECHO 当前支持什么

ECHO 会发现和控制 DLNA / UPnP Media Renderer，并使用这些控制动作：

- 发现设备。
- 设置播放 URL。
- 发送播放。
- 暂停。
- 停止。
- 跳转进度。
- 设置音量。
- 读取播放状态和位置。
- 给数播提供音频和封面 URL。

ECHO 会优先按设备支持的格式投送；如果设备不支持当前格式，ECHO 可能走转码 MP3 的保守路径。常见友好格式包括 MP3、WAV、FLAC、M4A/AAC、OGG、AIFF，但实际以数播返回的能力和稳定性为准。

## 准备网络

DLNA 依赖局域网发现。最常见的问题不是 ECHO，而是设备互相看不见。

### 推荐网络

| 项目 | 推荐 |
| --- | --- |
| ECHO 电脑 | 家庭主路由下的有线或 Wi-Fi |
| 数播 | 同一路由器下，优先有线 |
| 网络类型 | Windows 设为专用网络 |
| 路由器 | 关闭访客隔离、AP 隔离 |
| VPN / 代理 | 首次测试先关闭 |
| 防火墙 | 允许 ECHO / Electron / Node 访问专用网络 |

### 不推荐网络

- 酒店 Wi-Fi。
- 校园网。
- 公司网。
- 访客 Wi-Fi。
- 手机热点。
- Mesh 子节点隔离异常。
- 开了“无线客户端隔离”的路由器。
- ECHO 电脑走 VPN，数播走本地网络。

这些环境可能允许上网，但不允许设备互相发现。

## 准备数播 / 渲染器

在数播、功放或智能音箱上确认这些设置：

1. 设备已经开机。
2. 设备连上同一个局域网。
3. DLNA / UPnP Renderer / Media Renderer 功能已启用。
4. 设备没有处在纯蓝牙、USB DAC、光纤输入、同轴输入等模式。
5. 设备音量不是 0。
6. 设备没有被另一个 App 独占控制。
7. 固件较旧时，先重启一次设备。

很多设备有两个相似功能：

- `DLNA Server`：把设备里的文件共享出去。
- `DLNA Renderer`：让别的 App 把歌投到它这里播放。

ECHO 需要的是 Renderer。

## 在 ECHO 里投送

### 第一次投送

1. 在 ECHO 里播放或选中一首普通歌曲。
2. 建议第一首用 MP3 或 FLAC，不要用特别冷门格式。
3. 打开 `Connect` 页面。
4. 点击右上角 `刷新`。
5. 等待几秒。
6. 在设备列表里找到数播。
7. 看设备协议是否显示 `DLNA / UPnP`。
8. 点击 `连接`。
9. 如果投送成功，ECHO 会暂停本机播放，让数播播放。
10. 页面上方会显示当前 Connect 状态。

ECHO 不允许空元数据投送，所以你必须先播放或选中一首歌。设备卡片按钮如果是灰的，通常就是没有当前曲目、设备不可用或设备不支持。

### 投送后怎么控制

投送成功后，ECHO 的 Connect 页可以控制：

- 播放。
- 暂停。
- 停止。
- 断开。
- 音量。
- 进度跳转。

不是所有数播都完整支持所有控制。有些设备可以播放但不能准确回报进度；有些可以暂停但不支持 Seek；有些音量控制被设备固件锁住。这些属于 DLNA 设备差异。

### 重新投送

如果当前已经连接某个设备，再点同一个设备会显示 `重新投送`。适合：

- 换了一首歌。
- 数播状态不同步。
- 设备刚恢复在线。
- 上一次投送失败后想重新发 URL。

## ECHO 投送时实际发生了什么

投送本地文件时：

```text
本地文件 -> ECHO HTTP 服务 -> 数播读取 URL -> 数播播放
```

投送远程文件或在线流时：

```text
远程 URL -> ECHO 代理/转发或转码 -> 数播读取 ECHO URL -> 数播播放
```

ECHO 会根据数播地址选择本机局域网 IP，并创建类似这样的临时地址：

```text
http://192.168.1.20:随机端口/connect/audio/...
```

数播必须能从局域网访问这条地址。所以防火墙和网络隔离会直接影响投送。

## 格式建议

第一次测试建议：

| 格式 | 建议 |
| --- | --- |
| MP3 | 最推荐首测，兼容性最高 |
| FLAC | 常见数播通常支持，适合第二步测试 |
| WAV | 兼容性好但文件大 |
| M4A / AAC | 很多设备支持，但老设备可能不稳 |
| OGG / Opus | 设备差异较大 |
| DSD | 不建议作为第一次 DLNA 测试 |

如果某首歌投送失败，先换 MP3。MP3 能播说明发现和控制链路通，后面再查格式支持。

## 数播找不到怎么办

按这个顺序查：

1. 确认数播开机并处在网络播放 / DLNA Renderer 模式。
2. 确认 ECHO 电脑和数播在同一局域网。
3. 点击 ECHO `Connect` 页右上角 `刷新`。
4. Windows 网络类型改为 `专用网络`。
5. 允许 ECHO 通过 Windows 防火墙访问专用网络。
6. 关闭 VPN。
7. 关闭路由器 AP 隔离 / 访客隔离。
8. 重启数播。
9. 重启路由器。
10. 用手机上的 DLNA 控制 App 看是否能发现同一台数播。

如果手机 App 也发现不了，优先查网络和数播，不要只改 ECHO。

## 找得到但连接失败

常见原因：

- 设备只被发现，但 AVTransport 控制接口不稳定。
- 数播正在被其它 App 控制。
- 数播不支持当前格式。
- ECHO 提供的局域网 URL 被防火墙拦截。
- 数播不能访问 ECHO 电脑 IP。
- 路由器隔离了有线和无线设备。

处理：

1. 换一首 MP3。
2. 重启数播。
3. 关闭其它遥控 App。
4. 放行 ECHO 防火墙。
5. 电脑和数播都接同一个路由器。
6. 尽量让数播走有线。

## 有声音但封面或信息不对

DLNA 元数据由设备解释。ECHO 会提供标题、艺术家、专辑、时长和封面 URL，但设备可能：

- 不显示封面。
- 缓存上一首封面。
- 不显示艺术家。
- 不显示进度。
- 把 FLAC 显示成 unknown。

这不一定代表播放失败。先以声音、播放控制和稳定性为主。

## 播放卡顿或断流

可能原因：

- Wi-Fi 信号不稳。
- 高码率 FLAC / WAV / DSD 压力大。
- 数播缓存小。
- 路由器负载高。
- ECHO 电脑防火墙或安全软件干扰。
- 远程源本身不稳定。

建议：

1. 首测用 MP3。
2. 数播接有线。
3. ECHO 电脑也尽量接同一路由器。
4. 暂停大下载和全库扫描。
5. 远程曲库先在 ECHO 本机播放确认稳定，再投送。
6. 对不稳定设备，优先用数播厂商 App 或固件更新验证。

## DLNA 和 AirPlay / HQPlayer 怎么选

| 方式 | 适合 |
| --- | --- |
| DLNA / UPnP | 数播、电视、功放、智能音箱，局域网投送 |
| AirPlay | Apple 生态和 AirPlay 1 / RAOP 兼容链路；暂不支持 AirPlay 2 |
| HQPlayer | 专业升频、NAA、外部 HQPlayer 链路 |
| ECHO 本机输出 | 电脑直连耳机、DAC、声卡 |

普通数播优先试 DLNA。想了解 AirPlay，请看 [AirPlay 支持边界](/zh/docs/airplay-connect/)；想玩 HQPlayer/NAA，请看 HQPlayer 教程；想稳定电脑直连 DAC，请看音频输出教程。

## 常见误区

### “我的 NAS 出现了，为什么不能投送”

NAS 多数是媒体服务器，不是播放器。ECHO 需要的是 Media Renderer。NAS 可以提供文件，但不一定能出声。

### “数播能在厂商 App 里播，ECHO 为什么找不到”

厂商 App 可能走私有协议，不一定开放 DLNA Renderer。请在设备设置里确认 DLNA/UPnP Renderer 已开启。

### “电脑和数播都能上网，为什么互相看不到”

能上网不代表局域网互通。访客 Wi-Fi、AP 隔离、VPN、公司网策略都可能允许上网但禁止设备发现。

### “投送后电脑还会出声吗”

投送成功后，ECHO 会尽量暂停本机播放，让数播播放。最终声音从数播连接的 DAC、功放、音箱出来。

## 最小成功配置

1. ECHO 电脑和数播接同一个家庭路由器。
2. Windows 网络设为专用网络。
3. 数播打开 DLNA Renderer。
4. ECHO 播放一首 MP3。
5. 打开 `Connect`。
6. 点 `刷新`。
7. 找到数播。
8. 点 `连接`。
9. 数播出声。

这个配置成功后，再测试 FLAC、远程曲库、封面、Seek 和高码率文件。

## 参考

- UPnP Forum：<https://openconnectivity.org/developer/specifications/upnp-resources/>
- DLNA / UPnP 设备通常使用 Media Server、Media Renderer、Control Point 的分工；具体支持以设备固件和厂商说明为准。

---

# 下载与插件音源法律边界

Source: src/content/docs/zh/docs/download-and-plugin-source-boundary.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/download-and-plugin-source-boundary/
Description: ECHO 不提供音乐内容下载功能，插件音源接口只开放技术扩展能力，第三方来源的合法性由使用者自行负责。

这页专门说明 ECHO 在下载、音源接入、插件接口和法律责任上的边界。

## ECHO 不提供下载功能

ECHO 不提供任何用于获取音乐内容的下载功能。

ECHO 不托管、分发、售卖、镜像、索引或提供受版权保护的音频内容，也不会帮助用户下载、抓取、破解、转存或绕过任何平台的版权保护、会员限制、地区限制、DRM 或访问控制。

官网提供的安装包、更新文件和项目源码，不属于“音乐内容下载”。这些只用于安装、更新和审查 ECHO 本身，不代表 ECHO 提供任何音乐下载服务。

## 插件接口不等于官方音源

ECHO 开放插件接口，是为了让用户在本地扩展命令、主题、面板、元数据、歌词、封面和自定义音源候选。

插件音源接口只是一层受控技术接口。它允许插件在用户主动搜索或播放时返回候选信息和显式 `http` / `https` 音频 URL，但这不代表：

- ECHO 官方提供或背书该音源。
- ECHO 官方验证该音源的版权状态。
- ECHO 官方允许绕过平台授权、会员限制、DRM、地区限制或访问控制。
- ECHO 官方承担第三方插件、脚本、接口、账号、URL 或内容来源产生的法律责任。

插件作者和使用者必须自行确认来源合法、账号合法、网络访问合法、内容使用合法，并遵守对应平台条款和当地法律。

## 不承担第三方来源法律责任

任何通过插件、自填 URL、远程来源、代理、脚本、非公开 API、抓包逆向或第三方服务接入的内容，都属于用户或插件作者自行接入的第三方来源。

如果这些来源涉及侵权、盗版、规避付费、绕过访问控制、破解 DRM、未经授权抓取、会员内容转存、灰色接口或违反平台条款，相关责任由接入者、使用者、插件作者或服务提供方自行承担。ECHO 项目、维护者和官方文档不承担由此产生的法律责任。

ECHO 可以提供插件权限边界、沙箱限制、日志和错误提示，但不会为违法或侵权来源提供修复、适配、教程、接口承诺或规避方案。

## 反馈前请先确认

如果你的问题和某个音源、插件、下载站、脚本、代理或私有接口有关，请先确认：

1. 内容来源是否拥有合法授权。
2. 账号和访问方式是否符合平台规则。
3. 插件是否只返回合法可访问的 `http` / `https` 音频 URL。
4. 是否存在绕过付费、会员、地区、版权、DRM 或访问控制的行为。
5. 问题是否能在不涉及第三方侵权来源的前提下复现。

无法公开说明来源合法性的请求，不会进入官方维护范围。

---

# ECHO Pro 解锁教程

Source: src/content/docs/zh/docs/echo-pro.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/echo-pro/
Description: 在爱发电购买 ECHO Pro 后，复制爱发电订单号，并在 ECHO 里填写 QQ 号和订单号完成解锁，同时了解 HWID 绑定与注意事项。

ECHO Pro 通过爱发电赞助渠道解锁。付款完成后，不需要手动找授权文件；复制爱发电订单号，再到 ECHO 的 Pro 激活页面填写 QQ 号和订单号即可。

![ECHO Pro 权益介绍图](/assets/docs/echo-pro/pro.png)

## 解锁前准备

你需要准备：

- 已安装并能正常打开的 ECHO Next。
- 已在 [爱发电 ECHO Next 页面](https://afdian.com/a/echonext)购买 ECHO Pro，并确认付款已经完成。
- 你的 QQ 号。这个 QQ 号会用于订单归属、售后查询和后续解绑沟通。
- 爱发电订单详情里的订单号。请复制完整订单号，通常以 `2026` 开头。

订单号不是 QQ 号，也不是支付截图里的其它流水号。激活失败时，先确认复制的是完整的爱发电订单号。

## 在爱发电付款

1. 打开 [爱发电 ECHO Next 页面](https://afdian.com/a/echonext)。
2. 选择 ECHO Pro 对应的赞助档位。
3. 按爱发电页面提示完成付款。
4. 进入爱发电订单详情，复制完整订单号。

如果爱发电页面还显示订单未完成，先等付款状态更新后再去 ECHO 里解锁。

## 在 ECHO 里解锁

1. 打开 ECHO Next。
2. 进入 `设置 -> 通用`。
3. 找到 `Pro 激活` 或 `ECHO Pro 激活`。
4. 选择爱发电订单号激活方式。
5. 填写你的 QQ 号。
6. 粘贴刚刚复制的完整爱发电订单号。
7. 按页面提示完成解锁。

解锁成功后，ECHO 会按当前设备启用 ECHO Pro 权益。如果页面提示需要重启应用，按提示重启一次即可。

## 关于 HWID 绑定

ECHO Pro 会锁定当前设备的 HWID，也就是机器识别信息。这个设计是为了避免订单号或授权被随意转发使用。

请把 HWID 绑定理解为：订单号、QQ 号和当前设备会形成一条绑定记录。更换电脑、重装系统、主板/硬盘等硬件信息明显变化时，HWID 可能改变，旧绑定就不一定还能直接用于新环境。

请注意：

- 同一个订单号不要公开发到群里、论坛里或截图里。
- 不要把订单号借给别人使用；被异常占用后会影响自己的设备绑定。
- 同一订单可绑定的设备数量有限，具体以激活页面提示为准。
- 更换设备前，优先使用 [设备解绑页面](/zh/activate/unbind/) 释放旧设备名额。
- 如果设备绑定出现异常，请不要反复乱试，先保留订单号、QQ 号、ECHO 版本、系统环境和错误提示。

## 常见注意事项

- 复制订单号时，请从爱发电订单详情复制完整内容，不要手打一半。
- QQ 号请填写常用 QQ，后续售后会优先按这个 QQ 和订单记录核对。
- 付款刚完成但提示查不到订单时，可能是爱发电状态还没同步，稍等一会再试。
- 激活页面提示订单未付款、订单号不存在或格式错误时，先回到爱发电确认订单号和付款状态。
- 截图反馈时可以打码订单号的一部分，但私聊售后核对时需要提供完整订单号。

## 出问题怎么办

有任何购买、解锁、HWID、解绑或 Pro 权益异常，请在 ECHO Pro 群里反馈。

反馈时建议带上：

- 爱发电订单号，注意不要公开发给无关人员。
- 解锁时填写的 QQ 号。
- ECHO 版本。
- 系统版本。
- `设置 -> 通用 -> Pro 激活` 页面截图。
- 解锁失败时显示的错误提示。

不要把问题描述成“就是不行”。把订单号是否以 `2026` 开头、在哪一步失败、页面显示了什么说清楚，处理会快很多。

---

# ECHO Developer 开发准入

Source: src/content/docs/zh/docs/engineering/developer-access.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/engineering/developer-access/
Description: ECHO 官方开发的准入边界、沟通要求、提交流程与验证原则。仅通过 ECHO Developer 计划审核的人可以参与官方开发。

这页是 ECHO 官方开发协作的准入说明。它不是普通用户反馈入口，也不是公开 Issue 的礼貌模板。

**仅通过 ECHO Developer 计划审核并获得协作权限的人，才可以参与 ECHO 官方开发、提交可合并实现、访问开发者仓库或使用内部开发资料。** 普通用户可以反馈问题、提出建议、提交文档勘误或维护自己的 fork，但这不等于获得 ECHO 官方开发权限。

## Developer 身份

这里的 Developer 指维护者确认过的 ECHO Developer，而不是以下任意一种身份：

- 只是拥有 ECHO Pro。
- 只是加了群或发过反馈。
- 只是能访问公开 GitHub 仓库。
- 只是 fork 了项目或本地能跑起来。
- 只是让 AI 生成了一段代码或一份 PR。

Developer 身份代表你已经说明了自己的能力、协作方向、风险意识和可维护性承诺。相关申请入口见 [ECHO Developer 计划](../developer-plan/)。

## 开发前必读

参与开发前至少先读这些内容：

- [ECHO Next 开发规则](./rules/)
- [ECHO Page 开发者指南](./developer-guide/)
- [ECHO 提问与排错指南](../ai-question-guide/)
- 外部参考：[《别像弱智一样提问》](https://github.com/tangx/Stop-Ask-Questions-The-Stupid-Ways/blob/master/README.md)

最后一个外部链接标题很冲，但放在这里的原因很简单：开发协作不是猜谜。提需求、报 bug、问实现方案时，必须给目标、上下文、复现步骤、日志、已经尝试过的内容、风险和期望结果。

## 可以做什么

Developer 可以在权限范围内参与这些工作：

- 修复已确认的问题。
- 编写或改进文档、示例、插件和工具链。
- 改进桌面端、网站、构建、发布、更新源或诊断流程。
- 做小范围、可解释、可回滚的体验优化。
- 针对音频链路、曲库、元数据、远程源、插件系统等方向提交可验证的实现。

提交前要能说清楚三件事：为什么要改、改了哪里、怎么证明它没有破坏现有行为。

## 不可以做什么

Developer 也不能越过这些边界：

- 不要绕过授权、破解、伪造激活状态或削弱 ECHO Pro 校验边界。
- 不要传播内部仓库、测试包、私钥、授权信息、未发布内容或未确认路线。
- 不要把 ECHO 接口包装成盗链、下载、侵权来源、会员绕过、地区绕过或平台规则规避工具。
- 不要在没有维护者确认的情况下改动下载入口、自动更新、发布脚本、授权服务或公开导航。
- 不要把大范围重构、风格清理、顺手改名混进一个本来很小的修复里。

如果一个改动可能影响用户曲库、播放链路、下载、自动更新、授权状态、数据库迁移或远程服务，先说明风险再动手。

## 沟通格式

开发协作里不要只发一句“这里坏了”“这个能不能做”“AI 说可以这样改”。请至少给出：

```text
目标：
现象或需求：
影响范围：
相关页面 / 文件 / 日志：
我已经确认或尝试过：
可能风险：
建议验证方式：
```

如果是 bug，请给复现步骤、版本、系统、日志和截图。如果是功能建议，请先讲真实使用场景，而不是只讲“加一个按钮”。

## 提交流程

1. 先确认自己是否有 Developer 权限和对应仓库权限。
2. 开工前检查工作区状态，避免覆盖别人或其它进程的改动。
3. 把改动范围压小，只处理当前目标需要的文件。
4. 高风险点先写清楚，再实现。
5. 做最小但有效的验证，不为形式跑低价值长测试。
6. PR 或交付说明里写清楚改动、验证、风险和回滚方式。

文档改动通常只需要检查 frontmatter、链接和页面路径；下载、更新源、授权、构建脚本、桌面端行为改动则必须做对应的 targeted 验证。

## 维护者可以直接拒绝的情况

以下情况即使代码能跑，也可能被直接拒绝：

- 不是 Developer，却提交官方开发实现。
- 没有目标、没有上下文、没有验证，只丢一大段代码。
- 试图绕过授权、安全边界或平台规则。
- 改动范围明显超过问题本身。
- 影响发布、下载、更新或授权，但没有风险说明。
- 引入难以维护的新框架、新依赖、新服务或复杂抽象。

ECHO 欢迎能长期维护、能解释风险、能证明结果的开发。开发权限不是奖励，也不是身份牌；它是一份对用户、项目和维护成本负责的承诺。

---

# 开发者指南

Source: src/content/docs/zh/docs/engineering/developer-guide.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/engineering/developer-guide/
Description: 面向 ECHO Page 贡献者的开发边界、PR 规则、内容规范与验证要求。

这份文档写给参与 ECHO Page 开发、维护或提交 PR 的开发者。ECHO Page 是 ECHO Next 的官方网站、文档、更新日志与静态更新源承载项目；开发时请优先保证页面稳定、发布信息准确、用户下载入口可靠。

## 项目边界

ECHO Page 主要维护这些内容：

- 官网首页、下载页、更新日志页与文档站页面。
- `src/content/releases` 下的版本记录。
- `public/update` 下供桌面端读取的静态更新源。
- 文档内容、产品截图、品牌图和必要的部署脚本。

不要把 ECHO Next 桌面端的实现细节、临时测试记录、实验性路线草稿或未确认的发布承诺写进正式页面。对外页面应当只呈现已经确认、可以维护、不会误导用户的信息。

## 提交与 PR 规则

优先提交小而清晰的 PR。一个 PR 应该能用一句话说明目标，并且尽量只触碰同一类文件，例如只改文档、只改发布记录、只改下载页逻辑。

任何大型 PR 请先联系我，否则会被直接拒绝。

以下情况通常属于大型 PR：

- 同时改动站点结构、样式系统、发布脚本和内容数据。
- 重写首页、下载页、文档导航或更新源生成逻辑。
- 引入新的框架、构建插件、第三方服务或部署流程。
- 大规模迁移文档、批量删除内容或重排公开导航。
- 会影响用户下载、自动更新、SEO、站点语言路由或构建输出的改动。

如果不确定是否属于大型 PR，先按大型 PR 处理，说明目标、范围、风险和计划后再动手。

## 开发要求

开发前先查看当前工作区状态，避免覆盖他人正在进行的修改。多人或多进程开发时，只处理自己负责的文件；发现无关变更时不要回滚，也不要顺手重构。

内容改动应保持可读、可维护、可核查：

- 中文和英文页面尽量同步，除非明确只维护单语言页面。
- 发布说明必须和实际版本、下载产物、更新源一致。
- 外链、下载链接、GitHub Release 链接和镜像说明必须准确。
- 图片资源要有明确用途，避免无意义堆图或超大资源。
- 文档标题、侧边栏标签、路径命名应保持简短稳定。

代码和样式改动应优先沿用现有 Astro、Starlight、组件和 CSS 结构。除非有明确收益，不要增加新的抽象、全局样式层或复杂运行时逻辑。

## 高风险改动

以下改动需要特别谨慎，并在 PR 中写清楚风险：

- 修改 `astro.config.mjs`、部署脚本、站点域名、语言路由或 sitemap。
- 修改 `scripts/generate-update-feed.mjs`、`public/update` 或自动更新相关文件。
- 修改下载页产物选择、版本排序、GitHub Release 同步逻辑。
- 大幅调整文档信息架构、导航层级或公开入口。
- 删除文档、图片、下载资产或历史版本记录。

如果改动可能导致用户无法下载、无法自动更新、看到错误版本信息，必须先和维护者确认。

## 验证原则

验证要高效率，不要为了形式跑很久的低价值测试。根据改动范围选择最小但有效的证明：

- 只改 Markdown 文档时，检查页面路径、标题、链接和 frontmatter 即可。
- 改发布记录时，运行内容校验并确认版本、日期、产物字段正确。
- 改更新源或下载逻辑时，必须验证生成结果和关键下载入口。
- 改 Astro 组件、路由或样式时，至少做一次本地构建或针对页面的浏览器检查。

如果没有运行完整构建或完整测试，应在 PR 中说明原因和已经完成的针对性验证。

## PR 描述建议

PR 描述至少包含：

- 本次改动解决什么问题。
- 主要改了哪些文件或页面。
- 做过哪些验证。
- 是否有风险、回滚方式或需要维护者确认的点。

对公开内容负责，比把 PR 做大更重要。保持范围清楚、行为可验证、风险可解释，就是最好的贡献方式。

---

# GitHub 源码快照

Source: src/content/docs/zh/docs/engineering/github-source-snapshot.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/engineering/github-source-snapshot/
Description: 基于 Moekotori/ECHO main 分支的工程结构、依赖、构建脚本、平台产物和维护边界。

这页基于 GitHub 仓库 [`Moekotori/ECHO`](https://github.com/Moekotori/ECHO) 的 `main` 分支整理。它不是路线图，也不承诺未来功能；它只记录当前源码里已经能从 `README.md`、`package.json` 和 `docs/ECHO_NEXT_*.md` 看到的工程事实。

## 仓库事实

| 项目 | 当前状态 |
| --- | --- |
| 仓库 | `Moekotori/ECHO` |
| 默认分支 | `main` |
| 可见性 | Public |
| 包名 | `echo-next` |
| 当前 `package.json` 版本 | `26.6.7` |
| License | `Apache-2.0` |
| Electron appId | `app.echo.next` |
| 产品名 / 可执行文件名 | `ECHO NEXT` |

普通用户下载仍以 [GitHub Releases](https://github.com/moekotori/echo/releases/latest) 和官网镜像说明为准；源码快照只用于理解工程结构和维护边界。

## 核心定位

GitHub README 把 ECHO NEXT 定位为“面向本地曲库、HiFi 输出和长期维护的开源桌面音乐播放器”。源码文档强调它不是旧 ECHO 上继续堆功能的补丁层，而是重新拆分边界的桌面音乐播放器工程。

当前工程优先级可以概括为：

1. 本地播放可靠。
2. 音频链路稳定。
3. 大曲库不把 Renderer 卡死。
4. 用户数据安全。
5. 网络能力只作为补全和扩展，不压过本地曲库和基础播放。

## 运行与分层

源码文档中的架构分层是：

```text
React Renderer
  pages, components, virtual lists, settings, player controls
        |
Typed Preload Bridge
        |
Electron Main Process
  IPC, windows, lifecycle, services, system integration
        |
        +-- Library Core
        |     SQLite, scans, metadata, covers, folders, playlists
        |
        +-- Audio Core
        |     AudioSession, decoder pipeline, output bridge, device state
        |
        +-- Native Hosts
        |     echo-audio-host, WASAPI, ASIO, EQ, SMTC helper
        |
        +-- Experience Services
              lyrics, MV, streaming, plugins, remote sources
```

边界要求很明确：

- Renderer 负责页面、列表、歌词、MV、设置和播放控制界面。
- Preload 只暴露 typed `window.echo.*` API，不暴露 raw `ipcRenderer`、Node fs/path/process。
- Main process 组合窗口、IPC、服务和系统集成，业务逻辑应下沉到对应 service。
- Library Core 是曲库事实来源，不能让 Renderer 持有全量曲库或临时重组专辑墙。
- Audio Core 是播放事实来源，Renderer 不猜权威播放位置。
- Native hosts 承担 Electron/Node 不适合直接做的音频输出、DSP、SMTC 和底层 helper。

## 当前主要技术栈

| 方向 | GitHub 当前依赖 / 线索 |
| --- | --- |
| 桌面运行时 | Electron `^37.10.3`、electron-vite `^5.0.0`、electron-builder `^26.8.1` |
| 前端 | React `^18.2.0`、React DOM `^18.2.0`、TypeScript `^5.3.3`、Vite `^7.3.3` |
| UI 与动效 | `lucide-react`、`motion`、`@tanstack/react-virtual`、`@fontsource/outfit` |
| 本地数据库 | SQLite + `better-sqlite3` `^12.9.0` |
| 媒体处理 | `music-metadata`、`sharp`、`taglib-wasm`、FFmpeg 工具链 |
| 文本与搜索辅助 | `iconv-lite`、`pinyin-pro`、`opencc-js`、`kuroshiro`、`kuromoji` |
| 播放 / 媒体能力 | Native audio host、`shaka-player`、HQPlayer/Connect 相关服务 |
| AirPlay RAOP | optional dependency `@lox-audioserver/node-libraop`，打包时带 `airplayRaopHelper.cjs` |
| 测试 | Vitest `^4.1.6`、Testing Library、jsdom、Playwright |

依赖名只能证明源码当前包含这些工程能力，不等于所有场景都已经公开承诺完整支持。公开能力边界仍以用户文档、设置页说明和实际发布说明为准。

## 构建脚本

`package.json` 暴露的关键脚本：

| 脚本 | 作用 |
| --- | --- |
| `npm run dev` | rebuild native、确保 audio host 后启动 Electron + Vite 开发环境 |
| `npm run dev:full` | 额外构建 SMTC host 后启动完整开发环境 |
| `npm run build` | TypeScript 检查后执行 electron-vite build |
| `npm run build:win` | Windows 正式构建链路，包含 native rebuild、FFmpeg 校验、audio host、SMTC host、native scanner、Electron build、NSIS 资源、electron-builder 和 AirPlay 包验证 |
| `npm run build:win:unsigned` | Windows unsigned 构建链路，仍会走 AirPlay 包验证 |
| `npm run build:linux` | 通过 `scripts/build-linux.mjs` 构建 Linux x64 包 |
| `npm run test` | Vitest 测试 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run verify:ffmpeg` | 校验 FFmpeg 工具链 |
| `npm run verify:airplay-package` | 校验 Windows 打包后的 AirPlay RAOP 资源 |
| `npm run smoke:audio-host` / `smoke:native-scanner` / `smoke:smtc-host` | 对原生 helper 做烟测 |

文档改动通常不需要跑桌面端全量构建；涉及官网本身时跑 ECHO Page 的 `npm run build` 更直接。涉及 ECHO 桌面端构建链路时，按对应平台和改动范围选择脚本。

## 平台与产物

| 平台 | 当前源码配置 |
| --- | --- |
| Windows x64 | NSIS 安装包 + portable，产品名 `ECHO NEXT`，快捷方式名 `ECHO` |
| Linux x64 | AppImage + deb |
| macOS | `package.json` 没有 macOS 打包目标 |

Windows 打包资源包括：

- `echo-audio-host.exe`
- `echo-smtc-host.exe`
- `echo-native-scanner.exe`
- `airplayRaopHelper.cjs`
- `electron-app/tools`

Linux 打包资源包括：

- `echo-audio-host`
- `echo-native-scanner`
- `electron-app/tools-linux`

Linux 源码文档明确当前是 x64 基础构建和基础播放边界：AppImage/deb、本地曲库扫描、本地 WAV / FLAC / MP3 播放、Linux shared native output、ALSA 后端。Linux arm64、Flatpak、Snap、JACK 原生后端、PipeWire 原生后端、Linux 独占/bit-perfect 级 HiFi 后端都不应写成已支持。

## 源码文档里的核心边界

### Library Core

- SQLite 是本地曲库事实来源。
- 扫描、metadata、封面、专辑聚合、搜索索引、健康报告、move candidate 都在主进程服务边界内。
- Renderer 只拿分页数据，不拿全量曲库、不读 SQL、不生成封面、不重组专辑墙。
- 文件变化观察和 move repair 都必须保守，不能自动删除、自动合并或偷偷移动真实音频文件。

### Audio Core

- Audio Core 负责播放、时钟、输出设备、解码、DSP 状态和 HiFi 可解释性。
- 本地稳定播放优先级高于歌词、MV、下载、网络任务和插件。
- 播放进度应来自输出侧或 Audio Core 权威状态，Renderer 不应靠 timer 猜。
- WASAPI Shared、WASAPI Exclusive、ASIO、DSD、ReplayGain、EQ、重采样和 bit-perfect 状态必须诚实区分。

### Network Metadata

- 网络元数据是弱补全，不是第二个 metadata reader。
- `pending` / `reading` 不等于缺失。
- 网络结果先进入候选表和决策表，不能覆盖 manual、embedded、sidecar 或 folder structure。
- 网络封面必须通过本地封面缓存后再展示，不能直接把远程 URL 当作最终封面事实。

### Linux Build

- Linux 包必须在 Linux x64 环境构建。
- `build:linux` 会检查平台、FFmpeg、native ABI、audio host、electron-builder 产物和打包后的资源。
- CI 构建通过只说明包能产出，不代表真实桌面音频已经验收。

## 维护建议

更新这页时，优先重新核对 GitHub 当前 `package.json`、`README.md` 和 `docs/ECHO_NEXT_*.md`。不要把旧 roadmap、实验想法、issue 讨论或本地未发布分支写成公开能力。

如果源码事实和官网公开说明冲突，先以用户安全、播放稳定和实际发布说明为准，再决定是否更新官网文档或等待桌面端实现稳定。

---

# 工程文档

Source: src/content/docs/zh/docs/engineering/index.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/engineering/
Description: ECHO Next 的 GitHub 源码快照、工程规则、Linux 构建、元数据能力和原生 Worker 架构。

这里保留更适合公开沉淀的工程资料。临时测试稿、实现建议稿和过程型指南不放进正式导航；和发布、构建、边界规则直接相关的内容放在这里。

- [ECHO Next Rules](./rules/)
- [GitHub 源码快照](./github-source-snapshot/)
- [ECHO Next 技术栈与能力支持](./tech-stack-and-capabilities/)
- [Linux 构建指南](./linux-build/)
- [网络元数据补全](./network-metadata/)
- [ECHO Next Native Worker Ready Architecture](./native-workers/)
- [ECHO Developer 开发准入](./developer-access/)
- [开发者指南](./developer-guide/)

---

# linux-build

Source: src/content/docs/zh/docs/engineering/linux-build.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/engineering/linux-build/

---
title: "Linux 构建指南"
description: "ECHO Next Linux 构建环境、FFmpeg、audio host、AppImage/deb 和验收矩阵。"
sidebar:
  order: 91
  label: "Linux 构建"
---

这份文档是 ECHO Next 的 Linux x64 打包、验收和故障定位指南。目标不是“能跑一下命令”，而是把 Linux 包从环境准备、FFmpeg、ALSA、native host、electron-builder 到发布前验收都讲清楚。

当前 Linux 支持属于稳健首阶段：产出 x64 `AppImage` 和 `deb`，应用能启动、能扫描本地曲库、能播放本地 WAV / FLAC / MP3，并且在 Linux shared native output 下提供明确的 ALSA 后端。

> [!IMPORTANT]
> Linux 包必须在 Linux x64 环境中构建。不要在 Windows 上直接交叉打 Linux 包。这个项目的 Linux 包需要 Linux 版 `echo-audio-host`、Linux 版 FFmpeg、Linux 原生开发库和 Linux 打包工具；跨平台硬凑很容易产出“看起来有包、实际上不能播放”的假产物。

## 1. 当前支持边界

### 已支持

- Linux x64 桌面包。
- `AppImage`。
- `deb`。
- Electron 主程序、Renderer、Preload、主进程服务。
- 本地曲库扫描和本地播放主流程。
- Linux 版 `echo-audio-host`。
- Linux shared native output。
- shared backend `Auto`。
- shared backend `ALSA`。
- PipeWire 通过 ALSA compatibility layer 暴露出来的设备路径。
- 独立 Linux 工具目录 `electron-app/tools-linux/`。

### 暂不声明支持

- Linux arm64 / aarch64。
- rpm / snap / Flatpak 正式产物。
- JACK 原生后端。
- PipeWire 原生后端。
- Linux 独占 / bit-perfect 级别 HiFi 后端。
- 从 Windows 直接交叉构建 Linux 包。
- 发行版全矩阵兼容承诺。

### 明确仍是 Windows-only

- WASAPI Exclusive。
- ASIO。
- DirectSound compatibility mode。
- SMTC。
- Windows taskbar thumbnail controls。
- Windows audio service restart。

这些边界要保持清楚。Linux 适配不能影响 Windows 端已有播放链路，也不能把尚未验收的 Linux 能力包装成已完成能力。

## 2. 推荐构建环境

优先级从高到低：

1. 原生 Linux x64。
2. Linux x64 VM。
3. Linux CI runner。
4. WSL2 Ubuntu x64。

WSL2 可以用于构建和基础命令验证，但不建议把 WSL2 当成完整桌面验收环境。音频设备、桌面 session、AppImage 启动行为、FUSE 和 sandbox 细节都可能与真实用户环境不同。

推荐版本：

| 项目 | 建议 |
| --- | --- |
| Node.js | 20 LTS |
| npm | 9 或更高 |
| CPU | x64 |
| C++ | 支持 C++17 |
| CMake | 3.24 或更高更稳妥 |
| Electron | 使用仓库 `package-lock.json` 固定版本 |
| FFmpeg | Linux x64 可执行文件，至少包含 `aresample` |

确认平台：

```bash
uname -a
node -p "process.platform + '/' + process.arch"
```

期望 Node 输出：

```text
linux/x64
```

## 3. Ubuntu / Debian 依赖

基础构建和打包工具：

```bash
sudo apt update
sudo apt install cmake g++ pkg-config fakeroot dpkg rpm binutils
```

JUCE / audio host 相关依赖：

```bash
sudo apt install \
  libasound2-dev libjack-jackd2-dev \
  libfreetype-dev libfontconfig1-dev \
  libx11-dev libxcomposite-dev libxcursor-dev libxext-dev \
  libxinerama-dev libxrandr-dev libxrender-dev
```

桌面运行和 AppImage 验收可能需要：

```bash
sudo apt install libgtk-3-0 libnss3 libxss1 libxtst6 libdrm2 libgbm1
```

如果 AppImage 报 FUSE 相关错误，按发行版安装对应 FUSE 运行时。例如 Ubuntu 新版本可能需要：

```bash
sudo apt install libfuse2
```

不同发行版包名可能不同，但核心依赖类别不变：

- C++ 编译链。
- CMake。
- pkg-config。
- ALSA 开发库。
- X11 开发库。
- fontconfig / freetype。
- electron-builder 打包需要的 dpkg / fakeroot / rpm / binutils。

## 4. 获取代码和安装 Node 依赖

新环境从零开始：

```bash
git clone https://github.com/moekotori/echo.git
cd echo
npm ci
```

开发机已有仓库时：

```bash
git pull
npm ci
```

不要把 Windows 下的 `node_modules` 拷到 Linux。这个项目包含 native dependency，Linux 构建需要在当前 Linux 环境里重新安装或重建。

`build:linux` 会自动执行：

```bash
npm run rebuild:native
```

它会让 `better-sqlite3` 等 native dependency 匹配当前 Electron ABI。

## 5. Linux 工具目录

Linux 包使用独立工具目录：

```text
electron-app/tools-linux/
  README.md
  ffmpeg
  ffmpeg-manifest.json
  yt-dlp
```

打包后会复制到：

```text
dist/linux-unpacked/resources/tools/
```

要求：

| 文件 | 是否必须 | 作用 |
| --- | --- | --- |
| `ffmpeg` | 必须 | 解码、探测和音频处理工具链的一部分 |
| `ffmpeg-manifest.json` | 必须 | 记录 FFmpeg 版本、hash、必需 filter 和许可证信息 |
| `yt-dlp` | 可选 | 下载和部分 streaming helper |
| `README.md` | 已在仓库 | 说明目录用途 |

`yt-dlp` 缺失不应该阻断本地曲库扫描、本地播放和 Linux 包构建。它只会让下载/部分流媒体提取能力不可用。

## 6. 准备 FFmpeg

### 6.1 放置 Linux x64 FFmpeg

示例：

```bash
mkdir -p electron-app/tools-linux
cp /path/to/linux/ffmpeg electron-app/tools-linux/ffmpeg
chmod +x electron-app/tools-linux/ffmpeg
```

确认它不是 Windows 二进制：

```bash
file electron-app/tools-linux/ffmpeg
electron-app/tools-linux/ffmpeg -hide_banner -version
```

`file` 输出应该能看出 ELF / Linux x86-64。不要放 `.exe`。

### 6.2 可选放置 yt-dlp

```bash
cp /path/to/yt-dlp electron-app/tools-linux/yt-dlp
chmod +x electron-app/tools-linux/yt-dlp
```

如果没有 `yt-dlp`，可以跳过。

### 6.3 更新 manifest

当前模板在：

```text
electron-app/tools-linux/ffmpeg-manifest.json
```

字段含义：

| 字段 | 说明 |
| --- | --- |
| `name` | 工具名，通常是 `ffmpeg` |
| `version` | `ffmpeg -hide_banner -version` 输出里能匹配到的片段 |
| `source` | 本地或 CI 准备方式说明 |
| `sourceUrl` | 精确来源 URL，能填就填 |
| `downloadPage` | 下载页 |
| `artifact` | 仓库内 artifact 路径，应为 `electron-app/tools-linux/ffmpeg` |
| `sha256` | 当前 FFmpeg 文件的 SHA256 |
| `requiresSoxr` | 是否要求 `--enable-libsoxr` |
| `requiredFilters` | 必须存在的 FFmpeg filters，目前至少 `aresample` |
| `licenseFamily` | 许可证族，当前模板为 `GPLv3` |

计算 hash：

```bash
sha256sum electron-app/tools-linux/ffmpeg
```

检查 filters：

```bash
electron-app/tools-linux/ffmpeg -hide_banner -filters | grep aresample
```

检查 soxr：

```bash
electron-app/tools-linux/ffmpeg -hide_banner -version | grep enable-libsoxr
```

当前仓库模板里 `requiresSoxr` 是 `true`。如果你准备的 FFmpeg 没有 `--enable-libsoxr`，`npm run verify:ffmpeg` 会失败。此时有两个选择：

- 换一个带 `--enable-libsoxr` 的 FFmpeg。
- 如果当前发布目标不要求 soxr，把 manifest 里的 `requiresSoxr` 改成 `false`，但要明确这是发布策略变化。

### 6.4 验证 FFmpeg

```bash
npm run verify:ffmpeg
```

在 Linux 上，这条命令默认检查：

```text
electron-app/tools-linux/ffmpeg-manifest.json
```

如果要显式指定：

```bash
ECHO_FFMPEG_MANIFEST=electron-app/tools-linux/ffmpeg-manifest.json npm run verify:ffmpeg
```

通过时会看到类似：

```text
[verify:ffmpeg] OK ... sha256=...
```

## 7. audio host 和 ALSA

Linux shared native output 由 `echo-audio-host` 提供。构建入口：

```bash
npm run build:audio-host
```

相关源码和配置：

```text
native/audio-host/CMakeLists.txt
native/audio-host/src/main.cpp
native/audio-host/tests/audio_engine_tests.cpp
scripts/build-audio-host.mjs
```

Linux 平台构建特点：

- `ECHO_ENABLE_ASIO` 默认 `OFF`。
- 非 Windows 平台启用 `JUCE_ALSA=1`。
- 非 Windows 平台禁用 `JUCE_JACK=0`。
- CMake 会 `find_package(ALSA REQUIRED)`。
- 生成文件是 `electron-app/build/echo-audio-host`，没有 `.exe`。
- 构建完成后脚本会给 Linux host 设置可执行权限。

手动确认：

```bash
npm run build:audio-host
file electron-app/build/echo-audio-host
test -x electron-app/build/echo-audio-host
```

### ALSA backend 行为

应用层的 shared backend 有两种 Linux 重点路径：

- `Auto`：让 native host 根据当前设备枚举选择可用 shared backend。
- `ALSA`：只选择 ALSA 类型设备，用于明确验证 ALSA 链路。

PipeWire 系统通常通过 ALSA compatibility layer 暴露设备，所以很多现代发行版也可以走 ALSA 路径。但文档和发布说明里仍应写“ALSA 路径”，不要把 PipeWire 原生支持写成已完成。

## 8. 推荐构建流程

从干净 Linux x64 环境开始：

```bash
npm ci
npm run verify:ffmpeg
npm run test:audio-engine
npm run build:linux
```

如果只是重复打包，并且依赖和工具链没有变化：

```bash
npm run verify:ffmpeg
npm run build:linux
```

如果正在排查 audio host：

```bash
npm run build:audio-host
npm run test:audio-engine
```

如果只想先确认前端/主进程能编译：

```bash
npm run build
```

## 9. `build:linux` 做了什么

`package.json` 中：

```text
npm run build:linux
```

实际执行：

```text
node scripts/build-linux.mjs
```

脚本会按顺序做这些事：

1. 检查 `process.platform === "linux"`。
2. 检查 `process.arch === "x64"`。
3. 检查 `electron-app/tools-linux/ffmpeg` 存在且可执行。
4. 执行 `npm run rebuild:native`。
5. 执行 `npm run verify:ffmpeg`。
6. 执行 `npm run build:audio-host`。
7. 检查 `electron-app/build/echo-audio-host` 存在且可执行。
8. 执行 `npm run build`。
9. 执行 `electron-builder --linux`。
10. 检查打包后的 `resources/echo-audio-host`。
11. 检查打包后的 `resources/tools/ffmpeg`。
12. 如果源码目录有 `yt-dlp`，检查打包后的 `resources/tools/yt-dlp`。
13. 检查 `dist/` 下是否有 `.AppImage`。
14. 检查 `dist/` 下是否有 `.deb`。

只要其中任一步失败，脚本会停止。不要跳过失败继续发布。

## 10. electron-builder Linux 配置

Linux 配置在 `package.json` 的 `build.linux`：

```text
build.linux.icon = software.png
build.linux.target = AppImage x64 + deb x64
build.linux.category = AudioVideo
```

Linux extra resources：

```text
electron-app/build/echo-audio-host -> resources/echo-audio-host
electron-app/tools-linux -> resources/tools
```

也就是说，Linux 包里的 audio host 和 FFmpeg 都不是从 Windows 资源目录拿的。

预期产物：

```text
dist/linux-unpacked/resources/echo-audio-host
dist/linux-unpacked/resources/tools/ffmpeg
dist/*.AppImage
dist/*.deb
```

如果存在 `yt-dlp`：

```text
dist/linux-unpacked/resources/tools/yt-dlp
```

产包后检查权限：

```bash
test -x dist/linux-unpacked/resources/echo-audio-host
test -x dist/linux-unpacked/resources/tools/ffmpeg
test ! -f dist/linux-unpacked/resources/tools/yt-dlp || test -x dist/linux-unpacked/resources/tools/yt-dlp
```

## 11. 本地启动和桌面验收

### AppImage

```bash
chmod +x dist/*.AppImage
./dist/*.AppImage
```

### deb

```bash
sudo apt install ./dist/*.deb
```

安装后从桌面启动器或命令行启动。

### 最小验收

用小曲库验收，不要一上来导入超大库：

1. 启动应用。
2. 首次启动能进入主界面。
3. 导入一个小型本地音乐文件夹。
4. Songs 页面能显示歌曲。
5. Albums 页面能显示基本专辑信息。
6. 播放 WAV。
7. 播放 FLAC。
8. 播放 MP3。
9. 暂停、继续、上一首、下一首正常。
10. 切换曲目不会提前结束。
11. 进度不会异常跳动。

### Linux 输出验收

按顺序验收：

1. `System` 输出播放一首歌。
2. `Shared` + `Auto` 播放一首歌。
3. `Shared` + `ALSA` 播放一首歌。
4. 在 `ALSA` 下切换曲目。
5. 在 `ALSA` 下暂停 / 继续。
6. 在 `ALSA` 下拖动进度。
7. 打开播放诊断或专业状态面板，确认 output mode / backend 与选择一致。

### Linux 能力边界验收

确认 Linux 上不要出现错误可用的 Windows-only 能力：

- WASAPI Exclusive 不应作为 Linux 可用输出能力出现。
- ASIO 不应作为 Linux 可用输出能力出现。
- DirectSound 不应作为 Linux 可用 shared backend 出现。
- SMTC 相关能力不应被当作 Linux 桌面集成能力。

如果 UI 上能看到某些灰掉或说明性质的 Windows-only 文案，要确认它不会被误认为 Linux 可用路径。

## 12. 建议验收矩阵

发布前至少覆盖：

| 维度 | 最小要求 |
| --- | --- |
| 包格式 | AppImage、deb |
| 音频格式 | WAV、FLAC、MP3 |
| 输出模式 | System、Shared + Auto、Shared + ALSA |
| 曲库 | 小曲库导入和基础浏览 |
| 播放控制 | 播放、暂停、继续、切歌、拖动进度 |
| 平台隔离 | Windows-only 输出不在 Linux 上误暴露 |

有条件时增加：

| 维度 | 建议 |
| --- | --- |
| 发行版 | Ubuntu LTS、Debian stable、Fedora 或 Arch 派生环境 |
| 音频服务 | PulseAudio、PipeWire with ALSA compatibility |
| 设备 | 内置声卡、USB DAC、蓝牙输出 |
| 时间 | 连续播放 30 分钟以上 |
| 曲库 | 中型曲库扫描后播放 |

不要把所有压力混在一轮里。先确认播放，再确认扫描，再确认长时间稳定性。这样出现问题时更好定位。

## 13. 常见失败和处理

### 13.1 在 Windows 上运行 `build:linux`

现象：

```text
[build:linux] Linux packages must be built on Linux x64.
```

处理：

- 切到 Linux x64。
- 使用 WSL2 / VM / CI runner。
- 不要绕过脚本的平台检查。

### 13.2 架构不是 x64

现象：

```text
[build:linux] Linux packaging currently supports x64 only.
```

处理：

- 换 x64 runner。
- arm64 支持要另做构建链、依赖、产物和验收，不要直接复用 x64 文档。

### 13.3 找不到 Linux FFmpeg

现象：

```text
[build:linux] Missing Linux ffmpeg
```

处理：

```bash
ls -l electron-app/tools-linux/ffmpeg
file electron-app/tools-linux/ffmpeg
chmod +x electron-app/tools-linux/ffmpeg
```

确认它是 Linux ELF x86-64 文件。

### 13.4 FFmpeg 不可执行

现象：

```text
[build:linux] Linux ffmpeg is not executable
```

处理：

```bash
chmod +x electron-app/tools-linux/ffmpeg
```

如果是在 CI artifact 解压后丢失权限，也要在 CI 里显式 `chmod +x`。

### 13.5 manifest hash 不匹配

现象：

```text
[verify:ffmpeg] SHA256 mismatch
```

处理：

```bash
sha256sum electron-app/tools-linux/ffmpeg
```

把 manifest 的 `sha256` 更新为当前文件 hash。注意：如果 FFmpeg 来源不可信，先换可信二进制，不要为了过校验直接改 hash。

### 13.6 manifest 版本不匹配

现象：

```text
[verify:ffmpeg] Version output does not contain "..."
```

处理：

```bash
electron-app/tools-linux/ffmpeg -hide_banner -version
```

把 manifest 的 `version` 改成输出中真实存在的稳定片段。

### 13.7 缺少 `aresample`

现象：

```text
[verify:ffmpeg] Required FFmpeg filter is missing: aresample
```

处理：

- 换带 `aresample` 的 FFmpeg。
- 不建议移除 `requiredFilters` 来绕过，因为音频链路依赖重采样能力。

### 13.8 缺少 `libsoxr`

现象：

```text
[verify:ffmpeg] FFmpeg build configuration does not include --enable-libsoxr
```

处理：

- 使用带 `--enable-libsoxr` 的 FFmpeg。
- 或在确认发布策略允许后，把 `requiresSoxr` 改成 `false`。

### 13.9 `npm ci` 失败

处理：

- 确认 Node.js 是 20 LTS。
- 删除当前 Linux 环境的 `node_modules` 后重新 `npm ci`。
- 不要复用 Windows `node_modules`。
- 如果是网络问题，先处理 npm registry / proxy，不要改业务代码。

### 13.10 native module ABI 问题

可能表现为 `better-sqlite3` 加载失败或 Electron ABI 不匹配。

处理：

```bash
npm run rebuild:native
```

然后重新：

```bash
npm run build:linux
```

### 13.11 audio host 编译失败

现象：

```text
[build:audio-host] Failed to build JUCE audio host.
```

优先检查：

```bash
cmake --version
g++ --version
pkg-config --modversion alsa
```

再确认依赖：

```bash
sudo apt install cmake g++ pkg-config libasound2-dev libfreetype-dev libfontconfig1-dev
```

如果日志里是 JUCE 拉取失败，先处理网络或 CMake FetchContent 缓存，不要先改 audio host 代码。

### 13.12 electron-builder 没产出 AppImage / deb

检查：

```bash
ls -la dist
```

确认 `package.json` 里的 Linux target 仍包含：

```text
AppImage x64
deb x64
```

如果只缺某一种包，优先看 electron-builder 输出，不要直接改构建脚本绕过检查。

### 13.13 AppImage 启动失败

先执行：

```bash
chmod +x dist/*.AppImage
./dist/*.AppImage
```

FUSE 相关问题按发行版安装 FUSE runtime。临时分析可用：

```bash
./dist/*.AppImage --appimage-extract
```

但发布验收仍要回到标准 AppImage 启动路径。

### 13.14 deb 安装失败

执行：

```bash
sudo apt install ./dist/*.deb
```

保留 apt 输出。常见方向：

- 目标系统依赖缺失。
- deb metadata 不适配目标发行版。
- 本机已有旧安装残留。

不要用强制安装掩盖依赖问题作为发布验收结论。

### 13.15 Linux 下没有声音

先分层确认：

1. 系统播放器是否有声音。
2. ECHO `System` 输出是否有声音。
3. ECHO `Shared + Auto` 是否有声音。
4. ECHO `Shared + ALSA` 是否有声音。
5. 只有某个文件无声，还是所有格式无声。
6. 只有某个设备无声，还是所有设备无声。

可用系统命令辅助：

```bash
aplay -l
pactl info
```

如果 `System` 正常但 `ALSA` 不正常，优先看 ALSA 设备枚举和 audio host 日志。如果所有输出都不正常，先看系统音频服务和应用启动日志。

## 14. CI 示例流程

CI runner 要是 Linux x64。最小流程：

```bash
npm ci
chmod +x electron-app/tools-linux/ffmpeg
test ! -f electron-app/tools-linux/yt-dlp || chmod +x electron-app/tools-linux/yt-dlp
npm run verify:ffmpeg
npm run test:audio-engine
npm run build:linux
```

CI 可以缓存：

- npm cache。
- Electron 下载缓存。
- FFmpeg artifact。
- CMake 下载缓存。

不要跨平台缓存：

- Windows `node_modules`。
- Windows native module build output。
- Windows `electron-app/build/echo-audio-host.exe`。
- Windows `electron-app/tools/`。

CI 构建通过只说明包能产出，不说明真实桌面音频已经验收。发布前仍要做 Linux 桌面手动验收。

## 15. 发布前检查清单

产物：

- `dist/*.AppImage` 存在。
- `dist/*.deb` 存在。
- `dist/linux-unpacked/resources/echo-audio-host` 存在。
- `dist/linux-unpacked/resources/echo-audio-host` 可执行。
- `dist/linux-unpacked/resources/tools/ffmpeg` 存在。
- `dist/linux-unpacked/resources/tools/ffmpeg` 可执行。
- 如果带 `yt-dlp`，打包后也存在且可执行。

基础应用：

- AppImage 能启动。
- deb 安装后能启动。
- 首次启动能进入主界面。
- 小曲库能导入。
- Songs / Albums 基础显示正常。

播放：

- WAV 可播放。
- FLAC 可播放。
- MP3 可播放。
- 暂停 / 继续正常。
- 切歌正常。
- 拖动进度正常。
- 没有明显提前结束。
- 没有明显异常跳进度。

输出：

- `System` 可播放。
- `Shared + Auto` 可播放。
- `Shared + ALSA` 可播放。
- 诊断状态显示和实际输出选择一致。

平台边界：

- WASAPI Exclusive 没有作为 Linux 可用能力出现。
- ASIO 没有作为 Linux 可用能力出现。
- DirectSound 没有作为 Linux 可用 shared backend 出现。
- Windows SMTC 相关能力没有被当作 Linux 能力。

发布说明：

- 标明 Linux 当前是 x64。
- 标明包格式是 AppImage / deb。
- 标明 ALSA 是当前明确支持的 shared native backend。
- 不承诺 JACK / PipeWire native / Linux exclusive HiFi，除非后续已经真实实现并验收。

## 16. 维护原则

Linux 构建和 ALSA 支持后续继续按低风险方式推进：

- 构建链问题先定位环境和脚本，不要先动播放核心。
- FFmpeg 问题先看 manifest、hash、filter、权限和二进制来源。
- ALSA 问题先看设备枚举、backend 选择和 audio host 日志。
- 新增 Linux backend 要保持 Windows 行为隔离。
- 发布前优先做小曲库和播放链路验收，再做大曲库压力。
- 任何可能影响播放稳定性的改动，都要有针对性验证，不能只凭构建通过判断。

---

# ECHO Next Native Worker Ready Architecture

Source: src/content/docs/zh/docs/engineering/native-workers.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/engineering/native-workers/
Description: ECHO Next Native Worker Ready Architecture migrated from docs/ECHO_NEXT_NATIVE_WORKERS.md.

Library Core v0.1 is deliberately native-worker-ready. TypeScript owns orchestration, SQLite, IPC validation, pagination APIs, scan jobs, and UI-facing business rules. Heavy work is called through stable worker interfaces so Rust or C++ can replace the first TS implementation without changing Renderer, IPC, or the SQLite schema.

## Worker Boundary

Stable interfaces live under `src/main/library/workers/`:

- `MetadataReader.read(filePath) -> MetadataResult`
- `CoverExtractor.extract(filePath, options) -> CoverResult`
- `FileScanner.scanFolder(folderPath, options) -> AsyncIterable<ScannedFile>`

Current implementations:

- `TsMetadataReader`: `music-metadata`, embedded tags first, filename/folder fallback only for missing fields
- `TsCoverExtractor`: TS+sharp v0.2 cover worker; embedded cover, same-folder cover/front/folder image, generated default, cached paths on disk, and real resize output
- `TsFileScanner`: recursive file enumeration and stat only

Future implementations can be swapped in as:

- `RustMetadataWorker`
- `RustCoverWorker`
- `RustFileScanner`

`LibraryService` and `ScanJobQueue` depend on the interfaces, not on TS concrete classes. Renderer and preload never know which worker implementation is active.

## Stable Return Shapes

`MetadataResult` includes:

- normalized metadata fields
- `fieldSources`
- embedded cover bytes when available for the cover worker
- `warnings`
- `errors`
- `status`

`CoverResult` includes:

- `source`
- `thumbPath`
- `albumPath`
- `largePath`
- `originalRef`
- `sourceHash`
- `mimeType`
- `warnings`
- `errors`

`ScannedFile` includes:

- `path`
- `sizeBytes`
- `mtimeMs`

These shapes are the contract a native worker must preserve. Raw parser details may exist inside the worker result for diagnostics, but Renderer list APIs do not receive them.

## Rust/C++ Priority

Priority order for native work:

1. `CoverWorker`: highest priority only if TS+sharp v0.2 fails measured cover-generation targets.
2. `MetadataWorker`: second priority; tag parsing can become expensive on large libraries.
3. `FileScanner`: only Rust/C++ if 3000/10000 track pressure tests show TS directory walking is a bottleneck.

Audio output is already moving in the same direction through `echo-audio-host`.

## Service Boundary

TypeScript service layer:

- creates scan jobs
- checks incremental cache keys
- schedules worker calls with concurrency limits
- writes SQLite in transactions
- persists album and artist indexes
- exposes paginated IPC-safe results

Worker layer:

- reads tags
- extracts/caches covers; current TS+sharp v0.2 uses `sharp` for resize while TypeScript owns priority and cache scheduling
- enumerates files and stat data

IPC:

- validates input
- calls `LibraryService`
- does not run SQL, parse metadata, extract covers, or scan folders

Renderer:

- calls typed preload methods
- renders paginated tracks/albums/folders/status
- does not group albums, generate covers, scan files, or hold the full library in memory

## Performance Budget

Targets for Phase 1 and Phase 1.5 validation:

- app startup must not scan the whole library
- `getTracks` first page target: under 200 ms
- `getAlbums` first page target: under 300 ms
- unchanged scan skip rate should approach 100%
- cover thumbnails are generated during scan, not while UI scrolls
- album wall reads persisted `albums` rows after restart
- `getTracks` and `getAlbums` never return full cover binary/base64
- scan jobs run in the background and remain cancellable
- metadata and cover workers use concurrency limits
- large libraries must not leave CPU near 50% because an album wall is rendering

## Phase 1.5 Validation

Phase 1.5 Native Worker & Performance Validation:

- use Phase 1.1 `library.getDiagnostics()`, smoke tests, and `npm run benchmark:library` results before committing to native worker work
- build a Go/C#/Rust `CoverWorker` only if cover extraction/cache generation is the measured bottleneck
- evaluate Rust `MetadataWorker`
- run 3000 and 10000 track pressure tests and 3000 and 10000 album-wall pressure tests
- record CPU, memory, total scan time, metadata time, cover time, and album wall load time
- decide from measurements whether `FileScanner` needs Rust/C++
- verify worker replacement does not change Renderer, IPC, SQLite schema, or list payloads

Native CoverWorker decision indicators:

- generating 1000 album thumbs keeps CPU above 50% for a long stretch
- generating 3000 or 10000 covers has unacceptable memory peaks
- Electron `sharp` packaging or native rebuilds are unstable
- cover cache hits remain slow after `thumb.webp` and `album.webp` exist

---

# network-metadata

Source: src/content/docs/zh/docs/engineering/network-metadata.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/engineering/network-metadata/

---
title: "网络元数据补全"
description: "网络元数据作为弱补全的状态、候选表、合并规则、评分和 provider 边界。"
sidebar:
  order: 92
  label: "网络元数据"
---

Network metadata is weak completion. It is never a second metadata reader and never a replacement for embedded tags, sidecar files, folder structure, or manual edits.

## Readiness States

Tracks persist explicit readiness:

- `embedded_metadata_status`: `pending`, `reading`, `present`, `missing`, `error`
- `embedded_cover_status`: `pending`, `reading`, `present`, `missing`, `error`
- `network_metadata_status`: `none`, `pending`, `candidate_found`, `applied_missing_only`, `rejected`, `error`

`pending` and `reading` mean "not ready yet", not "absent". Network completion must not treat null fields, fallback display values, or missing cover ids as proof that embedded data is absent.

## Three-Phase Flow

Phase A: Local Metadata Read

- `FileScanner` discovers files.
- `MetadataReader` reads embedded tags and marks embedded metadata `present`, `missing`, or `error`.
- `CoverExtractor` reads embedded/folder cover and marks embedded cover `present`, `missing`, or `error`.
- `tracks` and `covers` are written only after local readers finish.

Phase B: Local Finalize

- Album grouping and artist refresh run from local rows.
- Tracks and albums are usable immediately.
- UI is not blocked by network completion.

Phase C: Network Completion

- Manual trigger only.
- Provider results first go to candidate tables.
- High-confidence candidates may apply missing-only fields.
- Lower-confidence candidates remain visible for review.
- Rejected candidates are recorded and filtered from future prompts.

## Candidate Tables

Network metadata candidates live in `network_metadata_candidates`.

Network decisions live in `network_metadata_decisions` with `applied_fields_json`, so every accepted/rejected/ignored decision is auditable.

Network cover candidates live in `network_cover_candidates`. A network cover URL is never returned to Renderer as artwork. Accepted covers must pass through the cover cache pipeline and become local `thumb`, `album`, and `large` files referenced by `covers`.

## Merge Rules

Metadata priority:

1. manual
2. embedded
3. sidecar/info
4. folder_structure
5. network
6. filename_fallback

Network may write title, artist, album, albumArtist, year, genre, trackNo, and discNo only when:

- `embedded_metadata_status` is `missing` or `error`
- candidate score is at least `0.92` for automatic missing-only application
- the existing field source is `unknown`, `filename_fallback`, or `network`

Network cannot overwrite `manual`, `embedded`, `sidecar`, or `folder_structure`.

Filename fallback cannot overwrite `manual`, `embedded`, `sidecar`, `folder_structure`, or `network`.

Cover priority:

1. manual
2. embedded
3. folder/front/cover
4. network
5. default

Network covers may apply only when:

- `embedded_cover_status` is `missing` or `error`
- current cover source is `default`
- score is at least `0.92`

Network covers never overwrite manual, embedded, or folder covers.

## Scoring

`matchScore.ts` weights title and artist highest, album medium-high, and duration strongly. A duration difference over 10 seconds caps the score below automatic application. If title or artist similarity is weak, a candidate cannot reach high confidence.

Thresholds:

- `score >= 0.92`: eligible for automatic `applyMissingOnly`
- `0.75 <= score < 0.92`: visible candidate, user confirmation required
- `score < 0.75`: filtered or treated as low priority

## Providers

The provider boundary is `NetworkMetadataProvider`.

Current first-pass providers:

- `MockMetadataProvider`: architecture and tests
- `NeteaseCloudMusicProvider`: mainland China-friendly metadata candidates
- `QQMusicProvider`: mainland China-friendly metadata and album-cover URL candidates
- `MusicBrainzProvider`: metadata candidates
- `CoverArtArchiveProvider`: cover boundary placeholder

Providers are not wired into `MetadataReader`. They run behind `NetworkMetadataService` and `NetworkMetadataJobQueue` with concurrency at most 2, timeouts, candidate storage, and failure isolation.

## Why This Avoids The Old ECHO Bug

Old ECHO could see no embedded title/artist/cover yet, assume none existed, and let filename guesses or network data win. ECHO Next stores readiness separately from values:

- Before local read completes, status is `pending` or `reading`.
- Network merge refuses to write metadata while embedded metadata is `pending` or `reading`.
- Network merge refuses to write covers while embedded cover is `pending` or `reading`.
- Once embedded data is `present`, protected field sources prevent network overwrite.
- Only confirmed `missing` or reader `error` opens the missing-only network path.

The important rule is simple: "temporarily unavailable" is not "missing".

---

# ECHO Next 开发规则

Source: src/content/docs/zh/docs/engineering/rules.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/engineering/rules/
Description: ECHO Next 的开发边界、架构约束和反破解规则。

这些规则是 ECHO Next 的开发边界和架构护栏，所有新功能、重构、插件接口、构建脚本和文档说明都应遵守。

## 核心开发规则

1. 安全稳定优先。任何会影响用户本地音乐文件、播放链路、授权状态、数据库迁移、自动更新或远程服务的改动，都必须先说明风险，并优先选择可回退、可验证的实现。
2. ECHO 是本地音乐播放器和合法扩展平台，不是破解、绕过授权、规避付费、绕过平台访问控制或获取侵权内容的工具。
3. 明确禁止任何破解行为。ECHO 官方代码、插件接口、文档、示例、脚本、构建产物和支持流程不得提供、暗示、协助或鼓励破解软件、破解服务、破解音源、绕过 DRM、绕过账号/会员/地区/付费限制、伪造授权、篡改激活状态、移除水印、逆向第三方保护机制或分发侵权内容。
4. 任何第三方来源、插件、脚本或用户自备 URL 都必须只处理用户有权访问和使用的内容。插件作者和集成者不得把 ECHO 接口包装成下载、盗链、破解或规避平台规则的能力。
5. 授权和 ECHO Pro 相关逻辑必须保持主机/服务端签名链路为最终可信来源。前端和插件只能展示状态、发起请求或携带证明，不能成为授权真相源，也不能加入绕过校验的后门。
6. 开发中发现可能被用于破解、侵权或绕过限制的需求时，应明确拒绝实现该用途，并把设计收敛到合法、本地、用户自有内容和公开可验证接口范围内。

## File Size And Ownership

1. No giant `App.tsx`.
2. No giant `main/index.ts`.
3. No giant global CSS file.
4. Pages over 500 lines must be split.
5. Services over 800 lines must be split.
6. Shared abstractions must have a clear owner and purpose.

## App Entrypoints

`src/renderer/app/App.tsx` may only compose:

- providers
- layout
- routes
- future error boundary

`src/main/index.ts` may only compose:

- app lifecycle
- main window creation through lifecycle
- IPC registration
- necessary service bootstrap

## Renderer Rules

The renderer must not:

- scan folders
- read metadata
- parse covers
- load full covers for lists
- decide album grouping
- hold the whole library in React state
- run heavy search over a full in-memory track array
- let high-frequency playback state rerender the entire app
- know whether library workers are TypeScript, Rust, or C++

Songs, albums, artists, and search results must be paged or virtualized.

Current Phase 1 list defaults:

- songs: `pageSize = 100`
- albums: `pageSize = 60`
- track rows are virtualized with an estimated 70px row height
- list and album-wall images must use lazy loading and async decoding
- AlbumsPage must request page 1 first and append more pages only near scroll bottom; it must not loop through every album page up front
- AlbumWall may stay paged + lazy image for Phase 1.2; add grid virtualization later only if large-library smoke tests prove it is needed

## Preload Rules

Preload must:

- expose `window.echo`
- keep APIs grouped by domain
- return typed results

Preload must not:

- expose raw `ipcRenderer`
- access files directly
- implement business logic
- parse metadata or covers
- know which worker implementation backs Library Core

Renderer must not open Electron dialogs directly. Folder chooser UX must go through preload and IPC, not from React components calling `dialog`.

Renderer EQ UI may render controls, curves, warnings, and preset actions. It must not process audio buffers, calculate native filter coefficients, read/write preset files directly, or bypass the typed `window.echo.eq` preload API.

## Native Worker Boundary

Library Core heavy work must be called through stable interfaces:

- `MetadataReader`
- `CoverExtractor`
- `FileScanner`

`LibraryService` may compose concrete defaults, but orchestration must depend on the interfaces. IPC and Renderer must never import `TsMetadataReader`, `TsCoverExtractor`, or `TsFileScanner`.

Future Go/C#/Rust workers must preserve the same return shapes:

- metadata fields, field sources, warnings, errors, and status
- cover source, thumb path, album path, large path, original reference, source hash, warnings, and errors
- scanned file path, size, and mtime

SQLite schema, IPC payloads, and Renderer list views must not change just because a worker implementation changes.

## Metadata Priority

Metadata priority is fixed:

1. user manual edit
2. embedded tags
3. sidecar/info files
4. folder structure
5. network completion
6. filename fallback

Filename guessing must never overwrite embedded `title`, `artist`, or `album`.

Network metadata must never overwrite embedded tags.

Network metadata must not write fields while `embedded_metadata_status` is `pending` or `reading`. It may apply only missing-only fields after embedded metadata is `missing` or `error`, and only when the current field source is `unknown`, `filename_fallback`, or `network`.

Every stored track must preserve per-field source information in `field_sources_json`.

Phase 1 must persist at least:

- `title`
- `artist`
- `album`
- `albumArtist`
- `trackNo`
- `discNo`
- `year`
- `duration`
- `codec`
- `sampleRate`
- `bitDepth`
- `bitrate`

## Cover Priority

Long-term cover priority is fixed:

1. user manual cover
2. embedded cover
3. local folder cover
4. sidecar cover
5. network cover
6. generated placeholder

Network covers must never overwrite manual, embedded, or local covers.

Network cover lookup is manual and weak. It must not write covers while `embedded_cover_status` is `pending` or `reading`, and it may apply only when the current cover source is `default`.

Current TS+sharp v0.2 covers must be stored as:

- `thumb.webp` at 96x96 for `LibraryTrack.coverThumb`
- `album.webp` at 320x320 for `LibraryAlbum.coverThumb`
- `large.webp` up to 768x768 for NowPlaying/detail
- original

`sharp` performs the real resize work. TypeScript owns cover priority, cache directory scheduling, and fallback behavior.

List views use track thumbs only. Album walls use album thumbs only. Full covers load on demand outside list scrolling.

List APIs must never return `cover_large`, `cover_original`, `largePath`, `originalRef`, raw binary cover data, or base64 cover payloads.

Do not start a Go/C#/Rust CoverWorker until benchmark or smoke-test data proves TS+sharp is insufficient. Decision indicators are sustained CPU above 50% while generating 1000 album thumbs, unacceptable memory peaks for 3000/10000 covers, unstable Electron `sharp` packaging/rebuilds, or slow cover-cache hits after derivatives already exist.

## Long Tasks

All long tasks must be:

- backgrounded
- cancellable
- progress-reporting
- error-collecting

This includes scanning, metadata extraction, cover generation, audio analysis, and future network enrichment.

Network enrichment must not run automatically at app startup, must not issue requests for every scanned track, must use provider timeouts, must keep concurrency at 2 or below, and provider failure must not affect local library rows.

Local library scans must skip metadata parsing when `path + size_bytes + mtime_ms` is unchanged.

Scan jobs must report one of these phases:

- `discovering`
- `checking_cache`
- `reading_metadata`
- `extracting_covers`
- `grouping_albums`
- `writing_database`
- `finished`
- `failed`
- `cancelled`

Per-file metadata or cover errors must be collected without failing the entire scan.

Metadata and cover workers must use concurrency limits. Cover thumbnails must be created during scans, not during list scrolling.

## Library Persistence

SQLite is the source of truth after a scan. Restarting the app must not reparse the whole library.

`better-sqlite3` must be rebuilt for the Electron runtime ABI before desktop dev runs. `npm run dev` owns that check through `npm run rebuild:native`; do not rely on the binary produced for the system Node.js ABI when testing folder import or library scanning in Electron. Vitest uses the system Node.js ABI, so Vitest global setup owns the opposite rebuild even when tests are launched directly through `vitest`, an editor, or `npm test`. `scripts/ensure-native-abi.mjs` caches ABI-specific binaries under `node_modules/.echo-native-cache` to keep repeat Node/Electron switches fast.

Required persisted tables:

- `folders`
- `tracks`
- `albums`
- `album_tracks`
- `artists`
- `covers`
- `scan_jobs`

Album wall views must read the `albums` table. They must not regroup the full track table in the renderer.

If a file is removed from a scanned folder, the next scan must hide it from list APIs without touching the disk file.

Current v0.1 policy: missing files are marked `missing = 1` and filtered out of list APIs. This keeps cache history without deleting the user's disk files.

## Album Grouping

Album grouping must be performed in Library Core and persisted.

Rules:

- same album + same album artist merges
- same album + different album artist does not merge
- album artist missing or unknown uses folder path as a weak separator
- empty or unknown album values must not collapse into one giant album
- year participates in the album key when available

## Testing Rules

Changes touching metadata, cover, audio, library, encoding, database migration, or file scanning behavior must include focused tests.

Library Core tests should prefer real SQLite and mocked metadata readers over large binary audio fixtures unless a parser integration bug specifically requires real media.

Tests that touch Library Core must cover the worker boundary with fake `MetadataReader`, `CoverExtractor`, and `FileScanner` implementations so the architecture stays Rust/C++ ready.

Folder import UX must keep `library.chooseFolder()` in main/preload, treat repeated imports as idempotent rescans, and refresh SongsPage / AlbumsPage after import or scan completion through the shared `library:changed` event. Sidebar import entries are direct actions: `Import Folder` opens the folder picker instead of navigating, and `Import File` opens the local audio file picker without exposing Electron dialogs to Renderer code.

SongsPage must stay a list view, not an import wizard. Its folder-plus button may navigate to `ImportFolderPage` through the lightweight `app:navigate:import-folder` event, while `FoldersPage`, `ImportFolderPage`, and Settings reuse `LibraryFoldersPanel`.

TrackRow may start single-track local playback through a callback passed down from SongsPage. SongsPage may store `currentTrackId`, but high-frequency playback position and audio status must stay out of App.tsx and must not rerender the song list.

The current playback queue is only the visible/loaded SongsPage window. Do not expand it into a full playback queue until a LibraryService-backed queue service exists.

PlayerBar polling is temporary. Future playback/audio status should use throttled IPC push events such as `playback:onStatus` and `audio:onStatus`, and position updates must not rerender SongsPage or TrackList.

Library diagnostics are dev-only. They must use `library.getDiagnostics()`, must not trigger scans, and must not return full track lists, full cover records, binary cover data, or base64 cover data.

EQ changes must preserve the audio-thread boundary. Preset JSON storage belongs to main/native non-realtime code, not the JUCE callback. Native EQ parameters must be passed through atomic or lock-free state, smoothed before use, and must keep disabled/bypassed output bit-transparent once the bypass fade completes.

---

# 别像弱智一样提问

Source: src/content/docs/zh/docs/engineering/stop-ask-questions-the-stupid-ways.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/engineering/stop-ask-questions-the-stupid-ways/
Description: 转载自 tangx/Stop-Ask-Questions-The-Stupid-Ways 的提问方式提醒。

> 出处：本文直接转载自 tangx 的 [Stop-Ask-Questions-The-Stupid-Ways README](https://github.com/tangx/Stop-Ask-Questions-The-Stupid-Ways/blob/master/README.md)。
>
> 原仓库许可证：[`GPL-3.0`](https://github.com/tangx/Stop-Ask-Questions-The-Stupid-Ways/blob/master/LICENSE)。下面正文保留原文内容；图片链接指向原仓库 raw 资源。

# 别像弱智一样提问

Stop-Ask-Questions-The-Stupid-Ways

## 短域名服务

+ https://git.io/how-to-ask
+ https://git.io/asking-question
+ https://git.io/stop-stupid

## 你真的准备好了吗？

![you-are-not-prepared.png](https://raw.githubusercontent.com/tangx/Stop-Ask-Questions-The-Stupid-Ways/master/images/you-are-not-prepared.png)

> 感谢群友 `for you` 提供

## 避免 xy-problem

+ 参考地址: http://xyproblem.info/

`XY Problem` 表示
1. 提问者想要解决 **原问题 X** ，且觉得解决了 **引申问题 Y** 就能解决 **X** 问题
2. ~~提问者对外提出了解决 **Y** 的的请求~~
3. 回答者帮助提问者解决 **Y** 问题。（浪费了回答者和提问者双方的时间）

> `然而, 最终 Y 问题可能并不是 X 问题的一个合适的解决方法`

因此， 提问者要避免创造这样的修罗场, 需要学会在问题之初就准确描述自己的根本问题。 [学会描述问题](#学会描述问题)

## 提问前你必须需要知道的事情

1. 要知道， `Free` 的正确翻译是 `自由`，而非 **~~`免费`~~**。
1. 要知道，愿意回答问题的人，都是 **可爱** 的人。
1. 要知道，向帮助你的人 `付费` 是一个高尚的行为。即使回答你的人不是为了钱。
1. 要知道，`花钱买时间是一个常识`。如果你不能认同，要么你钱包穷，要么你思想穷。
1. 要知道，给对方发工资的不是你或者你老板。
1. 要知道，提问的时候你才是 **孙子**，帮助你的人是 **大爷**。
1. 要知道，不回答你的问题对其他人没有任何损失。
1. 要知道，`准确描述一件事情`是一项基本生存技能。要学会 [《提问的智慧》](https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way/blob/master/README-zh_CN.md)
1. 要知道，`搜索`是一项基本生存技能，学不会用 Google 的话，你可能真的不适合你所从事的行业。
1. 要知道，`英文`是一项基本生存技能，不认识英文的话，你可能真的不适合你所从事的行业。

## 幼儿园的小朋友都知道要有礼貌

```
请问
  ...问题描述...
谢谢
```

![manners-maketh-man.jpg](https://raw.githubusercontent.com/tangx/Stop-Ask-Questions-The-Stupid-Ways/master/images/manners-maketh-man-small.png)

## 学会描述问题

> 向别人提问的时候，要学会正确的描述问题。
> 把对方当成你的老板，你在给他做报告。要用最精炼的文字和图片，向对方阐述明白一个事情的来龙去脉。

> **要知道，你不是我追的妹子，我没有时间来猜你想要什么。**

> 记住，给别人的条件越多，你的问题解决越快。因为这不是解密游戏。

1. 请问一个关于 `什么` 的问题。
1. 我想要达到 `什么样` 效果，但是我这样做出现了 `什么样` 的问题。
1. 报错日志是 `这样` 的。（要 `学会` 画关键字）
1. 我尝试过 `什么` 方法来解决。
1. 我尝试搜索过了 `什么` 关键字，在里面找到了 `这些 URL` 的回答，尝试了还是没有解决问题。
1. 我用的是 `什么` 操作系统，版本号是多少。
1. 我用的是 `什么` 软件，版本号是多少。
1. 谢谢

> 千万别认为只有别人帮助你之后才需要说 `谢谢`。

### 学会什么时候贴图

![what-time-to-use-image.png](https://raw.githubusercontent.com/tangx/Stop-Ask-Questions-The-Stupid-Ways/master/images/what-time-to-use-image.png)

像这种，IM 自动转义表情，贴出来的问题全是表情。

### 学会什么时候要圈出重点

千万不要认为别人的频率和你是同步的，然后像这样扔出一张图一个表情就了事了。

在工作中， 你`@`的人可能会多问一句什么情况。 但是在 IM 聊天群里面，就没有这么好运气了。

![stupid_02-conversation.png](https://raw.githubusercontent.com/tangx/Stop-Ask-Questions-The-Stupid-Ways/master/images/stupid_questions/stupid_02-conversation.png)

如下很难吗？

```
@xxx，我这边访问不了 git 仓库。
环境是: 环境是什么。
```

![stupid_02-no-target.png](https://raw.githubusercontent.com/tangx/Stop-Ask-Questions-The-Stupid-Ways/master/images/stupid_questions/stupid_02-no-target.png)

### 学会什么时候贴文字

## 什么是弱智一样的提问

![stupid_questions.png](https://raw.githubusercontent.com/tangx/Stop-Ask-Questions-The-Stupid-Ways/master/images/stupid_questions/stupid_questions.png)

## 萌新滚粗

![baiduit.jpg](https://raw.githubusercontent.com/tangx/Stop-Ask-Questions-The-Stupid-Ways/master/images/baiduit.jpg)

| 什么鬼？    | 咋回事？  | 怎么办？    | 救命啊！！       |
|-------------|-------------|-------------|------------------|
| 自己 google | 自己 google | 自己 google | 自己 google 了吗 |

![googleit.png](https://raw.githubusercontent.com/tangx/Stop-Ask-Questions-The-Stupid-Ways/master/images/googleit.png)

---

# ECHO Next 技术栈与能力支持

Source: src/content/docs/zh/docs/engineering/tech-stack-and-capabilities.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/engineering/tech-stack-and-capabilities/
Description: ECHO Next 的前端、桌面后端、本地数据、音频引擎、媒体处理、插件系统、发布链路与能力边界。

ECHO Next 是面向本地曲库、HiFi 输出和长期维护的桌面音乐播放器。它不是一个套在网页播放器外面的壳，而是一个由前端界面、Electron 桌面后端、本地数据库、原生音频宿主、媒体处理管线和受控插件系统组成的桌面应用工程。

> 本页是能力与技术栈说明。需要按 GitHub 当前 `main` 分支核对版本号、依赖、构建脚本和平台产物时，请看 [GitHub 源码快照](./github-source-snapshot/)。

项目的技术目标很明确：

- 本地音乐库优先，网络能力只作为补全和扩展。
- 播放稳定性优先，高级输出能力必须服务于可靠播放。
- 大曲库可长期维护，列表、封面、搜索、扫描和缓存都要可分页、可恢复、可诊断。
- 用户数据安全优先，插件、远程源、网络元数据和批量操作都必须有清晰边界。

## 总体架构

ECHO Next 采用典型的 Electron 多进程桌面架构，但并不把业务全部堆在 Renderer 中。React 只负责界面表达和用户交互，真正的曲库、播放、数据库、系统集成和原生输出由主进程服务与原生宿主分层承担。

| 层级 | 技术与职责 |
| --- | --- |
| 前端界面层 | React 18、TypeScript、Vite，负责页面、列表、播放器、歌词、MV、设置、插件面板和状态呈现 |
| 预加载桥接层 | Electron preload，向 Renderer 暴露受控 API，隔离 Node、文件系统、数据库和原生能力 |
| 桌面后端层 | Electron Main + TypeScript services，负责窗口、IPC、曲库、播放、缓存、插件、远程源、诊断和系统集成 |
| 本地数据层 | SQLite + better-sqlite3，保存曲库索引、专辑、艺术家、封面引用、播放记录、网络候选和配置状态 |
| 媒体处理层 | music-metadata、taglib-wasm、sharp、FFmpeg 工具链，负责标签、封面、技术信息、转码/探测辅助 |
| 音频输出层 | 原生 `echo-audio-host`、音频桥接服务、WASAPI、ASIO、DSD / DoP、HQPlayer 等输出链路 |
| 扩展层 | 本地插件沙箱、权限模型、provider、panel、命令、主题预设和受控网络 API |
| 发布与官网层 | Astro、Starlight、GitHub Releases、electron-updater 静态更新源和自动化发布脚本 |

这套分层的核心价值是：前端可以快速迭代体验，但不能直接越权触碰数据库、真实文件、音频设备或系统能力；后端服务可以承载重任务，但必须通过稳定 IPC 和任务队列控制风险；原生能力可以增强音频输出，但不能让整个应用被单个设备或驱动拖垮。

## 前端技术栈

ECHO Next 前端使用 React + TypeScript 构建，运行在 Electron Renderer 中。

| 技术 | 作用 |
| --- | --- |
| React 18 | 构建页面、组件、状态驱动 UI 和交互流程 |
| React DOM | Renderer 页面渲染 |
| TypeScript 5 | 约束组件、IPC 类型、业务数据结构和共享类型 |
| Vite / electron-vite | 负责 Renderer、Main、Preload 的开发和构建 |
| @vitejs/plugin-react | React 开发体验和构建支持 |
| @tanstack/react-virtual | 大列表、歌曲列表、专辑墙等虚拟滚动场景 |
| lucide-react | 图标系统 |
| CSS / 主题变量 | 应用主题、布局、动效、透明度、圆角、字体和响应式界面 |
| @fontsource | 内置字体资源，降低系统字体差异带来的 UI 波动 |

前端主要负责这些用户界面：

- 歌曲、专辑、艺术家、文件夹、收件箱、播放历史、收藏、播放队列和歌单。
- 底部播放器、播放状态、设备状态、输出提示、错误提示和恢复入口。
- 歌词页、MV 页、迷你播放器、桌面歌词和沉浸式播放界面。
- 设置页中的播放、输出、歌词、MV、外观、曲库、插件、集成和诊断。
- 插件页的权限、日志、命令、面板、导入导出和主题预设。

前端不直接做这些事情：

- 不直接扫盘。
- 不直接访问 SQLite。
- 不直接读取真实音频文件。
- 不直接控制 WASAPI、ASIO、DSD 或原生音频设备。
- 不直接授予插件系统权限。

这些能力都必须经过 preload 暴露的受控 API，再由主进程服务处理。

## 桌面后端技术栈

ECHO Next 的“后端”不是传统 Web 后端，而是运行在 Electron Main 进程中的桌面后端。它负责连接系统能力、本地文件、数据库、原生宿主和前端界面。

| 模块 | 主要职责 |
| --- | --- |
| Electron Main | 应用生命周期、窗口管理、协议注册、系统集成和进程编排 |
| IPC 服务 | 校验 Renderer 请求，暴露曲库、播放、设置、插件、远程源等受控能力 |
| Library Service | 文件扫描、元数据读取、封面缓存、专辑聚合、艺术家索引、分页查询和曲库健康 |
| Audio Service | 播放会话、设备状态、解码管线、输出桥接、音频诊断和恢复边界 |
| Plugin Service | 插件 manifest 校验、沙箱执行、权限确认、命令/provider/panel 管理 |
| Network / Remote Services | WebDAV、媒体服务器、在线元数据、远程浏览和网络任务隔离 |
| Diagnostics | 日志、健康报告、缓存统计、错误状态和问题反馈辅助 |
| Updater / Release | 与 GitHub Release 和静态更新源配合，支持版本更新链路 |

主进程服务层的设计原则是“业务集中、边界稳定、重任务隔离”。Renderer 只拿到渲染所需的结构化结果，不拿数据库连接、文件句柄或原生对象。

## 本地数据与曲库索引

ECHO Next 使用 SQLite 作为本地曲库索引和状态存储。SQLite 适合桌面应用：部署简单、读写快、无需独立服务进程，也便于备份、迁移和诊断。

| 技术 | 用途 |
| --- | --- |
| SQLite | 保存本地曲库、专辑、艺术家、播放记录、封面引用、候选元数据和配置状态 |
| better-sqlite3 | Node/Electron 侧的同步 SQLite 访问层，由主进程服务集中调用 |
| 分页查询 | 歌曲列表、专辑墙、艺术家页和远程库不把全量数据塞进 Renderer |
| 索引与排序 | 支持标题、艺术家、专辑、路径、最近播放、导入时间等查询维度 |
| WAL / 事务策略 | 支撑扫描、批量更新和缓存刷新时的数据一致性 |
| 健康报告 | 用于发现缺失文件、缓存异常、标签问题和曲库维护风险 |

曲库能力覆盖：

- 导入本地文件夹。
- 扫描 MP3、FLAC、WAV、M4A、AAC、OGG、OPUS、WMA、ALAC、AIFF、APE、WV、DSF、DFF、CUE 等常见或进阶音频格式。
- 读取标题、艺术家、专辑、专辑艺术家、曲序、碟号、年份、流派、时长、编码、采样率、位深等信息。
- 提取嵌入封面、同目录封面和生成默认封面。
- 建立歌曲、专辑、艺术家、文件夹、收件箱、收藏、历史和播放列表视图。
- 支持重扫、缺失文件识别、移动修复候选、重复歌曲筛选和标签写入边界。

曲库索引不是用户真实音频文件的替代品。ECHO 可以记录、扫描、缓存、补全和展示音乐数据，但不应在没有用户明确确认的情况下删除、覆盖或移动真实文件。

## 媒体处理技术栈

ECHO Next 的媒体处理以本地文件事实为第一优先级。嵌入标签、同目录封面和用户手动编辑比网络结果更可信。

| 技术 | 用途 |
| --- | --- |
| music-metadata | 读取常见音频文件的嵌入标签、时长和技术信息 |
| taglib-wasm | 支持标签读取/写入相关能力，适合需要更精细标签处理的路径 |
| sharp | 生成封面缩略图、专辑封面和大图缓存 |
| FFmpeg 工具链 | 辅助音频探测、解码、格式处理和部分导出/转换场景 |
| iconv-lite | 处理部分旧编码文本、歌词或标签兼容问题 |
| pinyin-pro / opencc-js | 中文搜索、繁简转换、拼音索引和别名匹配 |
| kuroshiro / kuromoji | 日文假名、罗马音和歌词/搜索增强 |

媒体处理管线遵守几个规则：

- 本地嵌入标签优先。
- 同目录封面优先于网络封面。
- 网络元数据只进入候选，不直接替代高可信字段。
- 封面以本地缓存路径进入 Renderer，不向列表返回大块二进制。
- 大曲库扫描必须可分批、可跳过未变化文件、可诊断失败原因。

## 音频与播放技术栈

音频是 ECHO Next 的核心。项目优先保证基础播放稳定，再提供更高级的 HiFi 输出、设备控制和外部链路。

| 技术 / 模块 | 作用 |
| --- | --- |
| Native Audio Host | 原生音频宿主，承载低层输出、设备状态和播放恢复边界 |
| Audio Session | 管理当前播放会话、队列、时钟、状态同步和错误恢复 |
| Decoder Pipeline | 解码、探测、格式判断和播放前准备 |
| Native Output Bridge | 主进程和原生音频宿主之间的输出桥接 |
| WASAPI Shared | Windows 日常稳定输出，适合多数设备 |
| WASAPI Exclusive | 独占设备输出，适合确认稳定的 DAC 或专业接口 |
| ASIO | 面向原厂专业声卡驱动和录音接口 |
| DSD / DoP | 面向支持 DSD 的 DAC |
| HQPlayer | 作为外部专业播放链路的控制与交接入口 |
| SMTC Host | Windows 系统媒体控制集成 |
| ReplayGain / EQ / DSP | 音量增益、均衡、声道、重采样、变速等声音处理 |

输出能力包括：

- System 输出。
- WASAPI Shared / Exclusive。
- ASIO。
- DSD / DoP。
- HQPlayer 工作流。
- EQ、Preamp、ReplayGain、Headroom、声道平衡、重采样、变速、Crossfade、Automix 等处理能力。
- 采样率、位深、编码、输出设备、bit-perfect 状态和诊断提示。

只要音频经过 EQ、ReplayGain、变速、声道处理、重采样、系统混音、蓝牙编码或虚拟声卡，就不能称为严格 bit-perfect。ECHO 的技术边界是如实展示当前链路状态，而不是把处理后的声音包装成原始直通。

## 远程源与网络能力

ECHO Next 支持远程来源和在线能力，但这些能力是扩展，不是本地曲库的替代。

| 类型 | 支持方向 |
| --- | --- |
| WebDAV / NAS | 浏览和播放用户自有服务器上的文件 |
| Jellyfin / Emby | 访问用户自己的媒体服务器和音乐库 |
| Subsonic / Navidrome | 连接个人音乐服务 |
| DLNA / AirPlay / Connect | 局域网播放与外部设备连接能力 |
| 在线元数据 | 提供标题、艺术家、专辑、封面、歌词等候选 |
| 流媒体搜索候选 | 在合规和权限边界内提供搜索、试听或播放解析入口 |
| 代理与网络设置 | 解决用户网络环境中的访问、同步和候选获取问题 |

网络元数据采用候选与决策模型：

- 网络结果先进入候选表。
- 高置信结果只允许补缺失字段。
- 用户手动编辑、嵌入标签、同目录封面和文件夹结构优先。
- 网络封面必须进入本地封面缓存后再展示。
- 低置信结果应由用户确认，不应静默覆盖。

ECHO 官方不提供音乐下载服务，不托管、分发、售卖或镜像受版权保护的音频内容，也不支持绕过版权保护、破解会员权限或规避访问控制。

## 插件系统技术栈

ECHO Next 的插件系统是本地扩展机制，不是无限制脚本执行环境。插件以文件夹形式安装，由 `echo.plugin.json` 声明能力，在受控 VM 沙箱中运行入口脚本，并通过权限模型访问有限 API。

| 能力 | 说明 |
| --- | --- |
| Manifest | 声明插件 id、版本、入口、权限、命令、provider、面板、设置和主题预设 |
| VM 沙箱 | 隔离插件运行环境，避免直接接触 Node、Electron、SQLite 和主应用 DOM |
| 权限确认 | `library:read`、`playback:read`、`playback:control`、`network` 等能力需用户确认 |
| Commands | 插件可注册用户手动触发的命令 |
| Providers | 插件可提供元数据、歌词、封面或自定义音源候选 |
| Panels | 插件面板以 sandbox iframe 显示，通过受控 postMessage bridge 与宿主通信 |
| Settings / Storage | 插件拥有自己的小型设置和 JSON 存储 |
| Theme Presets | 插件可贡献结构化主题预设，用户导入后继续微调 |
| Network API | v2 插件通过受控网络 API 访问 `http` / `https`，不能直接使用任意 Node 网络能力 |

插件可以扩展体验，但不能牺牲播放稳定性。插件不能直接操作数据库、读取任意本机文件、修改音频 buffer、Hook 播放热路径、控制原生输出设备或后台全库扫描。

## 官网与发布技术栈

ECHO Page 是 ECHO Next 的官网、文档、更新日志和静态更新源项目。它与桌面端分离，目标是稳定、可缓存、易部署。

| 技术 | 用途 |
| --- | --- |
| Astro | 构建官网首页、下载页、更新日志页和静态输出 |
| Starlight | 承载多语言文档站、侧边栏、搜索、目录和文档布局 |
| TypeScript | 约束站点数据、发布记录、组件 props 和工具脚本 |
| Astro Content Collections | 管理文档和版本发布内容 |
| Node.js scripts | 校验发布内容、同步 GitHub Release、生成更新源 |
| YAML | 生成 Electron updater 可读取的 `latest.yml` |
| Sharp | 站点图片处理和构建期优化 |
| GitHub Releases | 发布安装包、便携版、历史版本和 release notes |
| electron-updater | 桌面端自动更新链路 |
| electron-builder | 构建 Windows NSIS、portable，以及 Linux AppImage / deb 等产物 |

ECHO Page 不承载桌面端业务逻辑。它负责把下载入口、版本信息、文档和更新 feed 稳定地交付出去。

## 平台与构建

ECHO Next 当前主要面向 Windows，同时保留 Linux 构建链路。

| 平台 / 产物 | 支持方向 |
| --- | --- |
| Windows x64 | NSIS 安装包、Portable 便携版、WASAPI、ASIO、SMTC、原生音频宿主 |
| Linux x64 | AppImage、deb、Linux 音频宿主和基础桌面集成 |
| GitHub Release | 对外分发安装包、便携包和版本说明 |
| 静态更新源 | 供桌面端自动更新读取 |

常用开发命令：

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 构建必要原生依赖后启动 Electron + Vite 开发环境 |
| `npm run dev:full` | 同时准备音频宿主和 SMTC 宿主后启动完整开发环境 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run test` | 运行 Vitest 测试 |
| `npm run build` | 构建 Main、Preload 和 Renderer |
| `npm run build:win` | 构建 Windows 安装包和便携版 |
| `npm run build:linux` | 构建 Linux 产物 |
| `npm run verify:ffmpeg` | 校验 FFmpeg 工具链 |
| `npm run smoke:audio-host` | 原生音频宿主烟测 |

## ECHO 支持的用户能力

从用户角度看，ECHO Next 支持这些核心场景：

| 场景 | 支持内容 |
| --- | --- |
| 本地曲库 | 文件夹导入、扫描、歌曲、专辑、艺术家、文件夹、收件箱、搜索、排序、分页、封面缓存 |
| 播放体验 | 播放队列、底部播放器、历史、收藏、歌单、系统媒体控制、错误恢复和播放诊断 |
| HiFi 输出 | System、WASAPI Shared、WASAPI Exclusive、ASIO、DSD / DoP、HQPlayer、bit-perfect 提示 |
| 声音处理 | EQ、Preamp、ReplayGain、Headroom、声道处理、重采样、变速、Crossfade、Automix |
| 歌词与 MV | 本地歌词、在线候选、翻译、罗马音、歌词偏移、MV 匹配和播放页 |
| 元数据维护 | 嵌入标签读取、封面提取、网络候选、标签写入边界、缺失文件和重复歌曲维护 |
| 远程来源 | WebDAV、NAS、Jellyfin、Emby、Subsonic / Navidrome、远程浏览和索引 |
| 扩展生态 | 本地插件、命令、provider、面板、设置、存储、主题预设和受控网络 API |
| 主题外观 | 内置主题、自定义主题、插件主题、透明度、圆角、模糊、动效和字体风格 |
| 诊断维护 | 日志、健康报告、缓存统计、音频设备状态、插件错误和危险操作确认 |

## 不属于官方支持范围

为了保证安全、稳定和合规，以下内容不属于 ECHO 官方支持范围：

- 盗版、侵权、绕过付费、破解会员或规避访问控制的内容来源。
- 第三方下载站、资源站、爬虫脚本、灰色插件或不可公开验证的接口。
- ASIO4ALL、FlexASIO、Voicemeeter、虚拟声卡、改包驱动和系统级音效拦截工具的兼容性适配。
- 要求 ECHO 帮用户获取、搜索、下载受版权保护内容的请求。
- 插件直接操作 SQLite、真实文件系统、主应用 DOM、原生音频宿主或音频热路径。
- 网络元数据覆盖用户手动编辑、嵌入标签或同目录封面等高可信本地事实。
- 为不可复现、无日志、无系统环境、无文件信息的问题做无限制适配承诺。

ECHO 可以帮助用户管理和播放自己有权使用的内容，也可以通过插件和远程源扩展体验；但它不会成为侵权下载器、破解工具或不受控脚本宿主。

## 技术原则

ECHO Next 的技术栈选择不是为了堆名词，而是为了让播放器长期稳定：

- 前端专注交互，不直接越权触碰系统能力。
- 主进程集中业务和安全边界，所有高风险能力经过 IPC 校验。
- SQLite 承载本地曲库事实，网络结果只作为候选和补全。
- 原生音频宿主承载底层输出，Renderer 不参与音频热路径。
- 插件系统默认最小权限，扩展能力不能破坏播放稳定性。
- 大曲库路径必须分页、缓存、限流、可取消、可诊断。
- 文档和官网只公开已经确认、可以维护、不会误导用户的信息。

这就是 ECHO Next 当前的技术栈定位：用 Web 技术提供高效率桌面界面，用 Electron 主进程和本地服务承担真实桌面应用能力，用 SQLite 和媒体处理管线管理大曲库，用原生音频宿主处理关键播放链路，再用受控插件系统扩展生态。

---

# 常见问题

Source: src/content/docs/zh/docs/faq.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/faq/
Description: ECHO 常见问题、支持边界和反馈方式。

## ECHO 提供音乐下载服务吗？

不提供。ECHO 严格遵守 DMCA 以及适用的版权法律。ECHO 官方不托管、分发、售卖、镜像或提供任何音乐下载服务，也不会提供用于获取音乐内容的下载功能，更不会帮助用户绕过版权保护、会员权限或访问控制。

远程源、在线元数据、插件或用户自填 URL 只应用于你有权访问和使用的内容。任何第三方侵权来源都不代表 ECHO 官方行为，也不在支持范围内。

更完整的边界说明见 [下载与插件音源法律边界](/zh/docs/download-and-plugin-source-boundary/)。

## 远程源和在线源有什么区别？

远程源通常是你自己的 WebDAV、NAS、Jellyfin、Emby、Subsonic 或类似服务，用来浏览和播放你有权访问的内容。

在线源更多用于元数据、封面、歌词候选或其它信息补全。它们不应该覆盖你已经整理好的本地标签，也不应该被理解为 ECHO 官方内容库。

## ECHO 支持 AirPlay 2 吗？

暂不支持。ECHO 当前按 AirPlay 1 / RAOP 兼容链路维护 AirPlay 能力，不能把 AirPlay 1 能连接等同于 AirPlay 2 已支持。

AirPlay 2、多房间同步、HomePod / Apple TV 专有行为、屏幕镜像、DRM 或平台权限绕过都不属于当前支持范围。详细说明见 [AirPlay 支持边界](/zh/docs/airplay-connect/)。

## 什么时候支持手机版？

手机版在做，但不会给没有验收把握的日期。

手机版不是一句“支持一下”就能稳定上线的东西，涉及界面、播放链路、曲库、权限、系统差异和维护成本。该出的时候自然会出；没出之前，反复催不会让它更快。

## Linux 和 macOS 怎么办？

Windows 是主要支持平台。Linux 保留基础构建和基础播放边界，但请按文档自行构建和验证；没有清晰复现、日志和低风险修复路径的 Linux 问题，不会进入优先维护队列。

macOS 暂不做官方包，也不承诺维护。作者没有稳定的 macOS 开发、签名和验收环境，不能把没法长期验证的包当作正式支持。

## 什么时候支持某某音源？

不会为了个人喜好单独支持某个来源。每个人想要的源都不一样，如果官方对个人偏好逐个适配，最后只会变成不可维护的泥潭。

插件能力已经开放了自定义音源。你需要某个来源，可以通过插件构建自己的音源接入；前提是你有权访问和使用对应内容，并且不要绕过平台授权、会员限制或版权限制。

插件接口只是技术扩展点，不代表 ECHO 官方提供、背书或验证第三方音源。第三方插件、脚本、接口、账号、URL 或内容来源产生的法律责任，由插件作者、使用者或服务提供方自行承担，ECHO 项目和维护者不承担相关法律责任。

## 会增加酷狗音乐源吗？

不会。ECHO 不会增加酷狗音乐源。请不要再把“接入酷狗音乐源”当成官方路线图问题。

文档或设置里出现酷狗字样时，通常指歌词、元数据候选或历史兼容边界，不代表 ECHO 会提供酷狗音乐播放源、下载源或平台内容接入。

## 蓝牙能开独占吗？

不建议，也不维护这类问题。蓝牙耳机、蓝牙音箱请使用 `System` 或 `WASAPI Shared` 这类稳定路径，不要折腾 WASAPI Exclusive、ASIO、DSD 或 bit-perfect。

蓝牙链路由 Windows 蓝牙栈、设备驱动、耳机固件、编码器、无线环境和电量状态共同决定。任何使用蓝牙出现的断连、延迟、爆音、音量异常、音质变化、设备切换、独占失败等问题，都不作为 ECHO 官方维护范围。

## 首次导入曲库卡顿正常吗？

正常，尤其是大曲库。首次导入需要枚举文件、读取标签、提取封面、计算时长和编码信息、写入索引并刷新专辑分组。CPU、磁盘占用升高或进度阶段性变慢都可能出现。

建议先导入 3 到 10 首歌的小文件夹确认基本功能，再导入完整曲库。导入期间尽量不要同时运行全量远程同步、大量下载或其它重型后台任务。

## 没声音先查什么？

按这个顺序：

1. Windows 音量、默认输出设备和应用音量混音器。
2. ECHO 底部音量、静音状态和播放队列。
3. `Settings -> Playback` 里切回 `System` 或 `WASAPI Shared`。
4. 关闭 EQ、ReplayGain、变速、声道工具和重采样。
5. 播放一首确定正常的 MP3 或 FLAC。

确认基础播放正常后，再测试 WASAPI Exclusive、ASIO、DSD 或 HQPlayer。

## ECHO 支持 ASIO4ALL、FlexASIO、Voicemeeter 吗？

不支持。ECHO 不为第三方驱动、虚拟声卡、ASIO 包装层、系统级音效驱动或虚拟路由工具提供兼容性承诺，也不会针对它们做专门适配。

如果你需要 ASIO，请使用声卡或 DAC 厂商提供的原厂驱动。第三方包装层能不能工作取决于你的系统环境，不属于 ECHO 官方支持范围。

## 为什么打开 DSP 后不再是 bit-perfect？

因为 DSP 会改变音频信号。EQ、Preamp、ReplayGain、变速、声道平衡、重采样、Crossfade 和 Automix 都会影响原始输出。

想验证原始输出时，请先关闭所有 DSP 和增益处理，并使用稳定的有线输出设备。

## 远程源同步慢是不是 bug？

不一定。远程源速度受服务器、硬盘、网络、证书、代理、转码、限速和目录规模影响。大型 NAS 或媒体服务器首次索引慢是常见情况。

先测试小目录和单首歌曲，再扩大范围。遇到异常时截图连接状态、目录页面、同步进度和错误提示。

## 反馈问题要发什么？

请尽量提供：

- 当前页面截图。
- ECHO 版本号、系统版本和安装渠道。
- 复现步骤。
- 错误提示、日志、诊断或复制报告。
- 音频问题请附输出模式、设备名、文件格式、采样率和位深。
- 曲库问题请附导入路径类型、本地盘/移动盘/NAS、扫描阶段和错误信息。

截图和报告能显著减少来回确认。

## 官网更新会影响播放器吗？

不会。官网是静态站点。桌面端自动更新读取发布 feed 和安装包，不会解析文档页面来决定播放行为。

## 发版需要改前端代码吗？

通常不需要。新增 release Markdown、上传安装包、生成更新 feed 即可。只有下载页、文档结构或视觉样式变化时才需要改前端代码。

---

# 全国 HiFi 店铺地图

Source: src/content/docs/zh/docs/hifi-store-map.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/hifi-store-map/
Description: 基于烧友共创表整理的线下耳机、音响和 HiFi 器材试听店铺索引。

这页适合刚开始折腾耳机、播放器、DAC、耳放、音箱的用户：如果你想线下试听，可以先按城市找店，再用地图应用核对地址、预约方式和当前状态。

为避免纠纷，这里只保留相对客观的信息：城市、店铺名称、产品方向和地址。不收录动态状态、个人体验评价、推荐或负面判断。出发前请自行核实店铺是否还在、是否需要预约、目标设备是否有现货可试听。

## 使用建议

1. 先在地图应用搜索店名和地址，确认当前位置和开放时间。
2. 想试听指定耳机、播放器、DAC、耳放或音箱时，先联系店铺确认是否有样机。
3. 尽量自带熟悉的音乐、耳机线、转接头和前端设备。
4. 试听结果只代表当时设备、环境和搭配，不要直接当成最终购买结论。
5. 本页不是商业推荐，也不代表 ECHO Next 对店铺、价格或售后作背书。

表格里的店铺名和地址都可以直接点击，会按“城市 + 店铺 + 地址”打开地图搜索；手机浏览器通常会交给已安装的地图 App 或系统默认地图处理。地图平台结果可能会变化，出发前仍建议再核对一次。

## 城市索引

北京、上海、广州、深圳、大连、南京、成都、济宁、济南、青岛、潍坊、厦门、杭州、沈阳、哈尔滨、大庆、宁波、武汉、福州、贵阳、郑州、洛阳、乌鲁木齐、东莞、呼和浩特、重庆、天津、南昌、长沙、无锡、常州、南通、太原、延吉、长春。

## 店铺列表

### 北京

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [佳佳耳机](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E4%BD%B3%E4%BD%B3%E8%80%B3%E6%9C%BA%20%E5%AD%A6%E9%99%A2%E5%8D%97%E8%B7%AF34%E5%8F%B7%E9%93%B6%E6%B2%B3%E8%AF%81%E5%88%B85%E6%A5%BC521%2F519%E5%AE%A4) | 便携设备+部分大耳/台机 | [学院南路34号银河证券5楼521/519室](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E4%BD%B3%E4%BD%B3%E8%80%B3%E6%9C%BA%20%E5%AD%A6%E9%99%A2%E5%8D%97%E8%B7%AF34%E5%8F%B7%E9%93%B6%E6%B2%B3%E8%AF%81%E5%88%B85%E6%A5%BC521%2F519%E5%AE%A4) |
| [今日电器](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E4%BB%8A%E6%97%A5%E7%94%B5%E5%99%A8%20%E8%93%9D%E6%97%97%E8%90%A5%E5%85%AC%E4%BA%A4%E7%AB%99%E6%97%81%E4%B8%AD%E7%A7%91%E7%A7%91%E4%BB%AA%E5%A4%A7%E5%8E%A6) | 中高端大塞+音箱+前端 | [蓝旗营公交站旁中科科仪大厦](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E4%BB%8A%E6%97%A5%E7%94%B5%E5%99%A8%20%E8%93%9D%E6%97%97%E8%90%A5%E5%85%AC%E4%BA%A4%E7%AB%99%E6%97%81%E4%B8%AD%E7%A7%91%E7%A7%91%E4%BB%AA%E5%A4%A7%E5%8E%A6) |
| [圆声带](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E5%9C%86%E5%A3%B0%E5%B8%A6%20%E4%B8%89%E9%87%8C%E5%B1%AF%E8%80%80%E8%8E%B1%E5%9B%BD%E9%99%85%E5%B9%BF%E5%9C%BA%E5%BA%95%E5%95%86) | 耳机+前端（大耳居多） | [三里屯耀莱国际广场底商](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E5%9C%86%E5%A3%B0%E5%B8%A6%20%E4%B8%89%E9%87%8C%E5%B1%AF%E8%80%80%E8%8E%B1%E5%9B%BD%E9%99%85%E5%B9%BF%E5%9C%BA%E5%BA%95%E5%95%86) |
| [甲苯](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E7%94%B2%E8%8B%AF%20soho%E7%8E%B0%E4%BB%A3%E5%9F%8Ed%E5%BA%A7910%E5%8F%B7) | 塞子+播放器+少量大耳 | [soho现代城d座910号](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E7%94%B2%E8%8B%AF%20soho%E7%8E%B0%E4%BB%A3%E5%9F%8Ed%E5%BA%A7910%E5%8F%B7) |
| [索尼旗舰店](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E7%B4%A2%E5%B0%BC%E6%97%97%E8%88%B0%E5%BA%97%20%E4%B8%9C%E6%96%B9%E6%96%B0%E5%A4%A9%E5%9C%B01F) | 索尼全系（Z1R/黑金砖等） | [东方新天地1F](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E7%B4%A2%E5%B0%BC%E6%97%97%E8%88%B0%E5%BA%97%20%E4%B8%9C%E6%96%B9%E6%96%B0%E5%A4%A9%E5%9C%B01F) |
| [森海直营店](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E6%A3%AE%E6%B5%B7%E7%9B%B4%E8%90%A5%E5%BA%97%20%E4%B8%9C%E6%96%B9%E6%96%B0%E5%A4%A9%E5%9C%B01F) | 森海全系+艾利和播放器+HDV820 | [东方新天地1F](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E6%A3%AE%E6%B5%B7%E7%9B%B4%E8%90%A5%E5%BA%97%20%E4%B8%9C%E6%96%B9%E6%96%B0%E5%A4%A9%E5%9C%B01F) |
| [华熙live森海](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E5%8D%8E%E7%86%99live%E6%A3%AE%E6%B5%B7%20%E5%8D%8E%E7%86%99live%E4%B8%8B%E5%9D%A1) | 森海大耳+HIFIMAN/MEZE+少量塞子/蓝牙 | [华熙live下坡](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E5%8D%8E%E7%86%99live%E6%A3%AE%E6%B5%B7%20%E5%8D%8E%E7%86%99live%E4%B8%8B%E5%9D%A1) |
| [安润耳机体验店](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E5%AE%89%E6%B6%A6%E8%80%B3%E6%9C%BA%E4%BD%93%E9%AA%8C%E5%BA%97%20%E6%9C%9D%E9%98%B3%E5%8C%BA%E9%85%92%E4%BB%99%E6%A1%A5%E8%89%BA%E6%9C%AF%E5%8C%BA2%E5%8F%B7%E8%B7%AFB10%E5%8F%B7) | 铁三角/HIFIMAN/歌德（大耳为主） | [朝阳区酒仙桥艺术区2号路B10号](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E5%AE%89%E6%B6%A6%E8%80%B3%E6%9C%BA%E4%BD%93%E9%AA%8C%E5%BA%97%20%E6%9C%9D%E9%98%B3%E5%8C%BA%E9%85%92%E4%BB%99%E6%A1%A5%E8%89%BA%E6%9C%AF%E5%8C%BA2%E5%8F%B7%E8%B7%AFB10%E5%8F%B7) |
| [安润北京总店](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E5%AE%89%E6%B6%A6%E5%8C%97%E4%BA%AC%E6%80%BB%E5%BA%97%20%E8%BD%A6%E5%85%AC%E5%BA%84%E7%89%A9%E5%8D%8E%E5%A4%A7%E5%8E%A69%E5%B1%82) | 铁三角/HIFIMAN/歌德（大耳为主） | [车公庄物华大厦9层](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E5%AE%89%E6%B6%A6%E5%8C%97%E4%BA%AC%E6%80%BB%E5%BA%97%20%E8%BD%A6%E5%85%AC%E5%BA%84%E7%89%A9%E5%8D%8E%E5%A4%A7%E5%8E%A69%E5%B1%82) |
| [德海基业](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E5%BE%B7%E6%B5%B7%E5%9F%BA%E4%B8%9A%20%E6%B5%B7%E6%B7%80%E5%8C%BA%E4%B8%AD%E5%85%B3%E6%9D%91%E5%A4%A7%E8%A1%9718%E5%8F%B7%E7%A7%91%E8%B4%B8%E7%94%B5%E5%AD%90%E5%9F%8E%E5%9C%B0%E4%B8%8B%E4%BA%8C%E5%B1%82DB218-219) | 麒麟/卡美洛/SP3K等旗舰 | [海淀区中关村大街18号科贸电子城地下二层DB218-219](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E5%BE%B7%E6%B5%B7%E5%9F%BA%E4%B8%9A%20%E6%B5%B7%E6%B7%80%E5%8C%BA%E4%B8%AD%E5%85%B3%E6%9D%91%E5%A4%A7%E8%A1%9718%E5%8F%B7%E7%A7%91%E8%B4%B8%E7%94%B5%E5%AD%90%E5%9F%8E%E5%9C%B0%E4%B8%8B%E4%BA%8C%E5%B1%82DB218-219) |
| [京东MALL（南三环店）](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E4%BA%AC%E4%B8%9CMALL%EF%BC%88%E5%8D%97%E4%B8%89%E7%8E%AF%E5%BA%97%EF%BC%89%20%E4%B8%B0%E5%8F%B0%E5%8C%BA%E5%8D%97%E8%8B%91%E8%B7%AF6%E5%8F%B7%E9%99%A21%E5%8F%B7%E6%A5%BC) | 蓝牙为主+少量HIFIMAN头戴 | [丰台区南苑路6号院1号楼](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E4%BA%AC%E4%B8%9CMALL%EF%BC%88%E5%8D%97%E4%B8%89%E7%8E%AF%E5%BA%97%EF%BC%89%20%E4%B8%B0%E5%8F%B0%E5%8C%BA%E5%8D%97%E8%8B%91%E8%B7%AF6%E5%8F%B7%E9%99%A21%E5%8F%B7%E6%A5%BC) |
| [京东MALL（双井店）](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E4%BA%AC%E4%B8%9CMALL%EF%BC%88%E5%8F%8C%E4%BA%95%E5%BA%97%EF%BC%89%20%E6%9C%9D%E9%98%B3%E5%8C%BA%E5%B9%BF%E6%B8%A0%E8%B7%AF31%E5%8F%B7) | 蓝牙+HIFIMAN+HD800s/IE900+音响 | [朝阳区广渠路31号](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E4%BA%AC%E4%B8%9CMALL%EF%BC%88%E5%8F%8C%E4%BA%95%E5%BA%97%EF%BC%89%20%E6%9C%9D%E9%98%B3%E5%8C%BA%E5%B9%BF%E6%B8%A0%E8%B7%AF31%E5%8F%B7) |
| [天域联达](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E5%A4%A9%E5%9F%9F%E8%81%94%E8%BE%BE%20%E9%AB%98%E5%BE%B7%E5%9C%B0%E5%9B%BE%E6%90%9C%E7%B4%A2%E2%80%9C%E5%8C%97%E4%BA%AC%E5%A4%A9%E5%9F%9F%E8%81%94%E8%BE%BE%E2%80%9D) | 耳塞、播放器、大耳、台机 | [高德地图搜索“北京天域联达”](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E5%A4%A9%E5%9F%9F%E8%81%94%E8%BE%BE%20%E9%AB%98%E5%BE%B7%E5%9C%B0%E5%9B%BE%E6%90%9C%E7%B4%A2%E2%80%9C%E5%8C%97%E4%BA%AC%E5%A4%A9%E5%9F%9F%E8%81%94%E8%BE%BE%E2%80%9D) |
| [索尼朝阳合生汇店](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E7%B4%A2%E5%B0%BC%E6%9C%9D%E9%98%B3%E5%90%88%E7%94%9F%E6%B1%87%E5%BA%97%20%E6%9C%9D%E9%98%B3%E5%8C%BA%E8%A5%BF%E5%A4%A7%E6%9C%9B%E8%B7%AF21%E5%8F%B7%E5%90%88%E7%94%9F%E6%B1%87B2%E5%B1%8249%E5%8F%B7) | 索尼全系大耳 | [朝阳区西大望路21号合生汇B2层49号](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E7%B4%A2%E5%B0%BC%E6%9C%9D%E9%98%B3%E5%90%88%E7%94%9F%E6%B1%87%E5%BA%97%20%E6%9C%9D%E9%98%B3%E5%8C%BA%E8%A5%BF%E5%A4%A7%E6%9C%9B%E8%B7%AF21%E5%8F%B7%E5%90%88%E7%94%9F%E6%B1%87B2%E5%B1%8249%E5%8F%B7) |
| [高斯音响（克鲁采音频）](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E9%AB%98%E6%96%AF%E9%9F%B3%E5%93%8D%EF%BC%88%E5%85%8B%E9%B2%81%E9%87%87%E9%9F%B3%E9%A2%91%EF%BC%89%20%E6%B5%B7%E6%B7%80%E5%8C%BA%E9%A9%AC%E7%94%B8%E4%B8%9C%E8%B7%AF%E9%87%91%E6%BE%B3%E5%9B%BD%E9%99%85%E5%85%AC%E5%AF%93%E6%A5%BC2623) | 综合音频 | [海淀区马甸东路金澳国际公寓楼2623](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E9%AB%98%E6%96%AF%E9%9F%B3%E5%93%8D%EF%BC%88%E5%85%8B%E9%B2%81%E9%87%87%E9%9F%B3%E9%A2%91%EF%BC%89%20%E6%B5%B7%E6%B7%80%E5%8C%BA%E9%A9%AC%E7%94%B8%E4%B8%9C%E8%B7%AF%E9%87%91%E6%BE%B3%E5%9B%BD%E9%99%85%E5%85%AC%E5%AF%93%E6%A5%BC2623) |
| [原声带](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E5%8E%9F%E5%A3%B0%E5%B8%A6%20%E6%9C%9D%E9%98%B3%E5%8C%BA%E4%B8%89%E9%87%8C%E5%B1%AF%E8%A1%97%E9%81%93%E5%B9%B8%E7%A6%8F%E4%BA%8C%E6%9D%9138%E5%8F%B7%E6%A5%BC38-2) | 综合音频 | [朝阳区三里屯街道幸福二村38号楼38-2](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E5%8E%9F%E5%A3%B0%E5%B8%A6%20%E6%9C%9D%E9%98%B3%E5%8C%BA%E4%B8%89%E9%87%8C%E5%B1%AF%E8%A1%97%E9%81%93%E5%B9%B8%E7%A6%8F%E4%BA%8C%E6%9D%9138%E5%8F%B7%E6%A5%BC38-2) |
| [顺电三里屯店](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E9%A1%BA%E7%94%B5%E4%B8%89%E9%87%8C%E5%B1%AF%E5%BA%97%20%E6%9C%9D%E9%98%B3%E5%8C%BA%E5%B7%A5%E4%BD%93%E5%8C%97%E8%B7%AF%E4%B8%89%E9%87%8C%E5%B1%AFVILLAGE%E8%B4%AD%E7%89%A9%E4%B8%AD%E5%BF%83) | 品牌数码音频 | [朝阳区工体北路三里屯VILLAGE购物中心](https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC%20%E9%A1%BA%E7%94%B5%E4%B8%89%E9%87%8C%E5%B1%AF%E5%BA%97%20%E6%9C%9D%E9%98%B3%E5%8C%BA%E5%B7%A5%E4%BD%93%E5%8C%97%E8%B7%AF%E4%B8%89%E9%87%8C%E5%B1%AFVILLAGE%E8%B4%AD%E7%89%A9%E4%B8%AD%E5%BF%83) |

### 上海

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [知音堂](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20%E7%9F%A5%E9%9F%B3%E5%A0%82%20%E8%82%87%E5%98%89%E6%B5%9C%E8%B7%AF1065%E5%8F%B7%E9%A3%9E%E9%9B%95%E5%9B%BD%E9%99%85%E5%A4%A7%E5%8E%A611%E5%B1%821104%E5%AE%A4) | 全品类音频 | [肇嘉浜路1065号飞雕国际大厦11层1104室](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20%E7%9F%A5%E9%9F%B3%E5%A0%82%20%E8%82%87%E5%98%89%E6%B5%9C%E8%B7%AF1065%E5%8F%B7%E9%A3%9E%E9%9B%95%E5%9B%BD%E9%99%85%E5%A4%A7%E5%8E%A611%E5%B1%821104%E5%AE%A4) |
| [甲苯](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20%E7%94%B2%E8%8B%AF%20%E9%BB%84%E6%B5%A6%E5%8C%BA%E6%B5%99%E6%B1%9F%E4%B8%AD%E8%B7%AF%E6%98%A5%E7%94%B3%E6%B1%9F%E5%A4%A7%E5%8E%A66%E5%B1%82618) | 入门塞+二次元塞 | [黄浦区浙江中路春申江大厦6层618](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20%E7%94%B2%E8%8B%AF%20%E9%BB%84%E6%B5%A6%E5%8C%BA%E6%B5%99%E6%B1%9F%E4%B8%AD%E8%B7%AF%E6%98%A5%E7%94%B3%E6%B1%9F%E5%A4%A7%E5%8E%A66%E5%B1%82618) |
| [圆声带](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20%E5%9C%86%E5%A3%B0%E5%B8%A6%20%E9%BB%84%E6%B5%A6%E5%8C%BA%E6%B5%99%E6%B1%9F%E4%B8%AD%E8%B7%AF160%E5%8F%B7) | 综合音频 | [黄浦区浙江中路160号](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20%E5%9C%86%E5%A3%B0%E5%B8%A6%20%E9%BB%84%E6%B5%A6%E5%8C%BA%E6%B5%99%E6%B1%9F%E4%B8%AD%E8%B7%AF160%E5%8F%B7) |
| [森海塞尔体验店](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20%E6%A3%AE%E6%B5%B7%E5%A1%9E%E5%B0%94%E4%BD%93%E9%AA%8C%E5%BA%97%20%E9%BB%84%E6%B5%A6%E5%8C%BA%E8%A5%BF%E8%97%8F%E4%B8%AD%E8%B7%AF268%E5%8F%B7%E6%9D%A5%E7%A6%8F%E5%A3%AB%E5%B9%BF%E5%9C%BA6%E5%B1%82) | 森海全系+AK播放器 | [黄浦区西藏中路268号来福士广场6层](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20%E6%A3%AE%E6%B5%B7%E5%A1%9E%E5%B0%94%E4%BD%93%E9%AA%8C%E5%BA%97%20%E9%BB%84%E6%B5%A6%E5%8C%BA%E8%A5%BF%E8%97%8F%E4%B8%AD%E8%B7%AF268%E5%8F%B7%E6%9D%A5%E7%A6%8F%E5%A3%AB%E5%B9%BF%E5%9C%BA6%E5%B1%82) |
| [耳机王](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20%E8%80%B3%E6%9C%BA%E7%8E%8B%20%E9%BB%84%E6%B5%A6%E5%8C%BA%E4%BA%91%E5%8D%97%E5%8D%97%E8%B7%AF%E4%B8%8E%E6%B7%AE%E6%B5%B7%E4%B8%9C%E8%B7%AF%E4%BA%A4%E5%8F%89%E5%8F%A3%E8%A5%BF%E5%8C%9740%E7%B1%B3) | QDC私模为主 | [黄浦区云南南路与淮海东路交叉口西北40米](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20%E8%80%B3%E6%9C%BA%E7%8E%8B%20%E9%BB%84%E6%B5%A6%E5%8C%BA%E4%BA%91%E5%8D%97%E5%8D%97%E8%B7%AF%E4%B8%8E%E6%B7%AE%E6%B5%B7%E4%B8%9C%E8%B7%AF%E4%BA%A4%E5%8F%89%E5%8F%A3%E8%A5%BF%E5%8C%9740%E7%B1%B3) |
| [熊猫视听](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20%E7%86%8A%E7%8C%AB%E8%A7%86%E5%90%AC%20%E6%9D%A8%E6%B5%A6%E5%8C%BA%E5%A4%A7%E5%AD%A6%E8%B7%AF90%E5%8F%B7702%E5%AE%A4) | 高端 HiFi 器材 | [杨浦区大学路90号702室](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20%E7%86%8A%E7%8C%AB%E8%A7%86%E5%90%AC%20%E6%9D%A8%E6%B5%A6%E5%8C%BA%E5%A4%A7%E5%AD%A6%E8%B7%AF90%E5%8F%B7702%E5%AE%A4) |
| [壹试听](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20%E5%A3%B9%E8%AF%95%E5%90%AC%20%E9%9D%99%E5%AE%89%E5%8C%BA%E4%B8%87%E8%88%AA%E6%B8%A1%E8%B7%AF217%E5%8F%B7) | 综合音频 | [静安区万航渡路217号](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20%E5%A3%B9%E8%AF%95%E5%90%AC%20%E9%9D%99%E5%AE%89%E5%8C%BA%E4%B8%87%E8%88%AA%E6%B8%A1%E8%B7%AF217%E5%8F%B7) |
| [安润（上海店）](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20%E5%AE%89%E6%B6%A6%EF%BC%88%E4%B8%8A%E6%B5%B7%E5%BA%97%EF%BC%89%20%E6%9D%A8%E6%B5%A6%E5%8C%BA%E4%BA%94%E8%A7%92%E5%9C%BA%E5%A4%A7%E5%AD%A6%E8%B7%AF81%E5%8F%B7501%E5%AE%A4) | 安润代理品牌 | [杨浦区五角场大学路81号501室](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20%E5%AE%89%E6%B6%A6%EF%BC%88%E4%B8%8A%E6%B5%B7%E5%BA%97%EF%BC%89%20%E6%9D%A8%E6%B5%A6%E5%8C%BA%E4%BA%94%E8%A7%92%E5%9C%BA%E5%A4%A7%E5%AD%A6%E8%B7%AF81%E5%8F%B7501%E5%AE%A4) |
| [海帆（上海店）](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20%E6%B5%B7%E5%B8%86%EF%BC%88%E4%B8%8A%E6%B5%B7%E5%BA%97%EF%BC%89%20%E9%95%BF%E5%AE%81%E5%8C%BA%E5%85%B4%E4%B9%89%E8%B7%AF99%E5%8F%B7%E4%B8%96%E8%B4%B8%E5%B1%95%E9%A6%867F50) | 高端音频器材 | [长宁区兴义路99号世贸展馆7F50](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20%E6%B5%B7%E5%B8%86%EF%BC%88%E4%B8%8A%E6%B5%B7%E5%BA%97%EF%BC%89%20%E9%95%BF%E5%AE%81%E5%8C%BA%E5%85%B4%E4%B9%89%E8%B7%AF99%E5%8F%B7%E4%B8%96%E8%B4%B8%E5%B1%95%E9%A6%867F50) |
| [audiophile音频馆](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20audiophile%E9%9F%B3%E9%A2%91%E9%A6%86%20%E9%BB%84%E6%B5%A6%E5%8C%BA%E6%B1%89%E5%8F%A3%E8%B7%AF229%E5%8F%B7%E7%99%BE%E7%B1%B3%E9%A6%99%E6%A6%AD%E4%B8%89%E6%A5%BC356) | 发烧音频 | [黄浦区汉口路229号百米香榭三楼356](https://uri.amap.com/search?keyword=%E4%B8%8A%E6%B5%B7%20audiophile%E9%9F%B3%E9%A2%91%E9%A6%86%20%E9%BB%84%E6%B5%A6%E5%8C%BA%E6%B1%89%E5%8F%A3%E8%B7%AF229%E5%8F%B7%E7%99%BE%E7%B1%B3%E9%A6%99%E6%A6%AD%E4%B8%89%E6%A5%BC356) |

### 广州

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [天域联达](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E5%A4%A9%E5%9F%9F%E8%81%94%E8%BE%BE%20%E8%B6%8A%E7%A7%80%E5%8C%BA%E4%B8%AD%E5%B1%B1%E4%BA%94%E8%B7%AF219%E5%8F%B7%E4%B8%AD%E6%97%85%E5%95%86%E4%B8%9A%E5%9F%8E%E5%86%99%E5%AD%97%E6%A5%BC1508%E5%AE%A4) | 综合音频 | [越秀区中山五路219号中旅商业城写字楼1508室](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E5%A4%A9%E5%9F%9F%E8%81%94%E8%BE%BE%20%E8%B6%8A%E7%A7%80%E5%8C%BA%E4%B8%AD%E5%B1%B1%E4%BA%94%E8%B7%AF219%E5%8F%B7%E4%B8%AD%E6%97%85%E5%95%86%E4%B8%9A%E5%9F%8E%E5%86%99%E5%AD%97%E6%A5%BC1508%E5%AE%A4) |
| [智通（岗顶站）](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E6%99%BA%E9%80%9A%EF%BC%88%E5%B2%97%E9%A1%B6%E7%AB%99%EF%BC%89%20%E5%A4%A9%E6%B2%B3%E5%8C%BA%E5%B2%97%E9%A1%B6%E7%99%BE%E8%84%91%E6%B1%87c%E5%BA%A719%E6%A5%BC1904) | 综合音频 | [天河区岗顶百脑汇c座19楼1904](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E6%99%BA%E9%80%9A%EF%BC%88%E5%B2%97%E9%A1%B6%E7%AB%99%EF%BC%89%20%E5%A4%A9%E6%B2%B3%E5%8C%BA%E5%B2%97%E9%A1%B6%E7%99%BE%E8%84%91%E6%B1%87c%E5%BA%A719%E6%A5%BC1904) |
| [海帆（岗顶站）](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E6%B5%B7%E5%B8%86%EF%BC%88%E5%B2%97%E9%A1%B6%E7%AB%99%EF%BC%89%20%E5%A4%A9%E6%B2%B3%E5%8C%BA%E5%A3%AC%E4%B8%B0%E5%A4%A7%E5%8E%A6%E8%A5%BF%E5%8E%8534%E6%A5%BC3413%E5%AE%A4) | 进口高端器材为主 | [天河区壬丰大厦西厅34楼3413室](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E6%B5%B7%E5%B8%86%EF%BC%88%E5%B2%97%E9%A1%B6%E7%AB%99%EF%BC%89%20%E5%A4%A9%E6%B2%B3%E5%8C%BA%E5%A3%AC%E4%B8%B0%E5%A4%A7%E5%8E%A6%E8%A5%BF%E5%8E%8534%E6%A5%BC3413%E5%AE%A4) |
| [原声带](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E5%8E%9F%E5%A3%B0%E5%B8%A6%20%E5%A4%A9%E6%B2%B3%E5%8C%BA%E5%A4%A9%E6%B2%B3%E5%8D%97%E4%B8%80%E8%B7%AF88%E5%8F%B7) | 进口器材 | [天河区天河南一路88号](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E5%8E%9F%E5%A3%B0%E5%B8%A6%20%E5%A4%A9%E6%B2%B3%E5%8C%BA%E5%A4%A9%E6%B2%B3%E5%8D%97%E4%B8%80%E8%B7%AF88%E5%8F%B7) |
| [聆风hifi](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E8%81%86%E9%A3%8Ehifi%20%E5%A4%A9%E6%B2%B3%E5%8C%BA%E4%BA%94%E5%B1%B1%E8%B7%AF141%E5%8F%B7%E5%B0%9A%E5%BE%B7%E5%A4%A7%E5%8E%A6b%E5%BA%A71%E6%A5%BC103) | 综合音频 | [天河区五山路141号尚德大厦b座1楼103](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E8%81%86%E9%A3%8Ehifi%20%E5%A4%A9%E6%B2%B3%E5%8C%BA%E4%BA%94%E5%B1%B1%E8%B7%AF141%E5%8F%B7%E5%B0%9A%E5%BE%B7%E5%A4%A7%E5%8E%A6b%E5%BA%A71%E6%A5%BC103) |
| [禾信（海印广场店）](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E7%A6%BE%E4%BF%A1%EF%BC%88%E6%B5%B7%E5%8D%B0%E5%B9%BF%E5%9C%BA%E5%BA%97%EF%BC%89%20%E8%B6%8A%E7%A7%80%E5%8C%BA%E5%A4%A7%E6%B2%99%E5%A4%B4%E8%B7%AF21%E5%8F%B7%E6%B5%B7%E5%8D%B0%E5%B9%BF%E5%9C%BA1%E6%A5%BC) | 台机+周边器材 | [越秀区大沙头路21号海印广场1楼](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E7%A6%BE%E4%BF%A1%EF%BC%88%E6%B5%B7%E5%8D%B0%E5%B9%BF%E5%9C%BA%E5%BA%97%EF%BC%89%20%E8%B6%8A%E7%A7%80%E5%8C%BA%E5%A4%A7%E6%B2%99%E5%A4%B4%E8%B7%AF21%E5%8F%B7%E6%B5%B7%E5%8D%B0%E5%B9%BF%E5%9C%BA1%E6%A5%BC) |
| [禾信（天河店）](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E7%A6%BE%E4%BF%A1%EF%BC%88%E5%A4%A9%E6%B2%B3%E5%BA%97%EF%BC%89%20%E5%A4%A9%E6%B2%B3%E5%8C%BA%E5%B1%95%E6%9C%9B%E6%95%B0%E7%A0%81%E5%B9%BF%E5%9C%BA2002) | 台机为主 | [天河区展望数码广场2002](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E7%A6%BE%E4%BF%A1%EF%BC%88%E5%A4%A9%E6%B2%B3%E5%BA%97%EF%BC%89%20%E5%A4%A9%E6%B2%B3%E5%8C%BA%E5%B1%95%E6%9C%9B%E6%95%B0%E7%A0%81%E5%B9%BF%E5%9C%BA2002) |
| [宝华韦健旺角影音](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E5%AE%9D%E5%8D%8E%E9%9F%A6%E5%81%A5%E6%97%BA%E8%A7%92%E5%BD%B1%E9%9F%B3%20%E8%B6%8A%E7%A7%80%E5%8C%BA%E5%A4%A7%E6%B2%99%E5%A4%B4%E8%B7%AF21%E5%8F%B7%E9%A6%96%E5%B1%82a011%E9%93%BA) | 宝华韦健+影音产品 | [越秀区大沙头路21号首层a011铺](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E5%AE%9D%E5%8D%8E%E9%9F%A6%E5%81%A5%E6%97%BA%E8%A7%92%E5%BD%B1%E9%9F%B3%20%E8%B6%8A%E7%A7%80%E5%8C%BA%E5%A4%A7%E6%B2%99%E5%A4%B4%E8%B7%AF21%E5%8F%B7%E9%A6%96%E5%B1%82a011%E9%93%BA) |
| [典雅音响花园](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E5%85%B8%E9%9B%85%E9%9F%B3%E5%93%8D%E8%8A%B1%E5%9B%AD%20%E8%B6%8A%E7%A7%80%E5%8C%BA%E5%A4%A7%E6%B2%99%E5%A4%B4%E4%B8%89%E9%A9%AC%E8%B7%AF11%E5%8F%B7%E6%98%9F%E4%B9%8B%E5%85%89%E7%94%B5%E5%99%A8%E5%9F%8E5a) | 高端音响+音频 | [越秀区大沙头三马路11号星之光电器城5a](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E5%85%B8%E9%9B%85%E9%9F%B3%E5%93%8D%E8%8A%B1%E5%9B%AD%20%E8%B6%8A%E7%A7%80%E5%8C%BA%E5%A4%A7%E6%B2%99%E5%A4%B4%E4%B8%89%E9%A9%AC%E8%B7%AF11%E5%8F%B7%E6%98%9F%E4%B9%8B%E5%85%89%E7%94%B5%E5%99%A8%E5%9F%8E5a) |
| [讯禾](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E8%AE%AF%E7%A6%BE%20%E5%A4%A9%E6%B2%B3%E5%8C%BA%E5%B2%97%E9%A1%B6%E6%80%BB%E7%BB%9F%E6%95%B0%E7%A0%81%E6%B8%AF2%E6%A5%BCb044) | 综合音频 | [天河区岗顶总统数码港2楼b044](https://uri.amap.com/search?keyword=%E5%B9%BF%E5%B7%9E%20%E8%AE%AF%E7%A6%BE%20%E5%A4%A9%E6%B2%B3%E5%8C%BA%E5%B2%97%E9%A1%B6%E6%80%BB%E7%BB%9F%E6%95%B0%E7%A0%81%E6%B8%AF2%E6%A5%BCb044) |

### 深圳

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [雷音音频](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E9%9B%B7%E9%9F%B3%E9%9F%B3%E9%A2%91%20%E5%9C%B0%E9%93%814%E5%8F%B7%E7%BA%BF%E7%BA%A2%E5%B1%B1%E7%AB%99%E9%99%84%E8%BF%91%EF%BC%8C%E5%9C%B0%E5%9B%BE%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D) | 综合音频 | [地铁4号线红山站附近，地图搜索店名](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E9%9B%B7%E9%9F%B3%E9%9F%B3%E9%A2%91%20%E5%9C%B0%E9%93%814%E5%8F%B7%E7%BA%BF%E7%BA%A2%E5%B1%B1%E7%AB%99%E9%99%84%E8%BF%91%EF%BC%8C%E5%9C%B0%E5%9B%BE%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D) |
| [新声域](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E6%96%B0%E5%A3%B0%E5%9F%9F%20%E7%BD%97%E6%B9%96%E5%8C%BA%E5%98%89%E5%AE%BE%E8%B7%AF%E7%88%B5%E5%A3%AB%E5%A4%A7%E5%8E%A6B%E5%BA%A720b08-09) | 高端器材 | [罗湖区嘉宾路爵士大厦B座20b08-09](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E6%96%B0%E5%A3%B0%E5%9F%9F%20%E7%BD%97%E6%B9%96%E5%8C%BA%E5%98%89%E5%AE%BE%E8%B7%AF%E7%88%B5%E5%A3%AB%E5%A4%A7%E5%8E%A6B%E5%BA%A720b08-09) |
| [八度影音HiFi体验馆](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E5%85%AB%E5%BA%A6%E5%BD%B1%E9%9F%B3HiFi%E4%BD%93%E9%AA%8C%E9%A6%86%20%E9%BE%99%E5%8D%8E%E5%8C%BA%E6%B0%91%E6%B2%BB%E8%A1%97%E9%81%93%E6%B2%B9%E8%81%94%E8%B7%AF61%E5%8F%B7%E6%B8%AF%E6%B7%B1%E5%9B%BD%E9%99%85%E4%B8%AD%E5%BF%83433) | 森海、拜亚、山灵、威士顿、解码耳放 | [龙华区民治街道油联路61号港深国际中心433](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E5%85%AB%E5%BA%A6%E5%BD%B1%E9%9F%B3HiFi%E4%BD%93%E9%AA%8C%E9%A6%86%20%E9%BE%99%E5%8D%8E%E5%8C%BA%E6%B0%91%E6%B2%BB%E8%A1%97%E9%81%93%E6%B2%B9%E8%81%94%E8%B7%AF61%E5%8F%B7%E6%B8%AF%E6%B7%B1%E5%9B%BD%E9%99%85%E4%B8%AD%E5%BF%83433) |
| [至尚音响](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E8%87%B3%E5%B0%9A%E9%9F%B3%E5%93%8D%20%E8%85%BE%E8%AE%AF%E5%9C%B0%E5%9B%BE%E6%90%9C%E7%B4%A2%E2%80%9C%E4%B8%96%E7%88%B5%E9%9F%B3%E5%93%8D%E2%80%9D) | 自有品牌+综合音频 | [腾讯地图搜索“世爵音响”](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E8%87%B3%E5%B0%9A%E9%9F%B3%E5%93%8D%20%E8%85%BE%E8%AE%AF%E5%9C%B0%E5%9B%BE%E6%90%9C%E7%B4%A2%E2%80%9C%E4%B8%96%E7%88%B5%E9%9F%B3%E5%93%8D%E2%80%9D) |
| [精锐影音](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E7%B2%BE%E9%94%90%E5%BD%B1%E9%9F%B3%20%E5%8D%97%E5%B1%B1%E5%8C%BA%E5%A4%A7%E6%96%B0%E8%B7%AF88%E5%8F%B7%E9%87%91%E9%BE%99%E5%B7%A5%E4%B8%9A%E5%9F%8E63%E6%A0%8B%E4%B8%9C2%E6%A5%BC202-3) | 山灵、乐富豪、TEAC、力仕等 | [南山区大新路88号金龙工业城63栋东2楼202-3](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E7%B2%BE%E9%94%90%E5%BD%B1%E9%9F%B3%20%E5%8D%97%E5%B1%B1%E5%8C%BA%E5%A4%A7%E6%96%B0%E8%B7%AF88%E5%8F%B7%E9%87%91%E9%BE%99%E5%B7%A5%E4%B8%9A%E5%9F%8E63%E6%A0%8B%E4%B8%9C2%E6%A5%BC202-3) |
| [知音堂音频馆](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E7%9F%A5%E9%9F%B3%E5%A0%82%E9%9F%B3%E9%A2%91%E9%A6%86%20%E7%A6%8F%E7%94%B0%E5%8C%BA%E6%B0%91%E7%94%B0%E8%B7%AF37%E5%8F%B7101%E5%95%86%E9%93%BA) | 铁三角、劲浪、HIFIMAN、水月雨等 | [福田区民田路37号101商铺](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E7%9F%A5%E9%9F%B3%E5%A0%82%E9%9F%B3%E9%A2%91%E9%A6%86%20%E7%A6%8F%E7%94%B0%E5%8C%BA%E6%B0%91%E7%94%B0%E8%B7%AF37%E5%8F%B7101%E5%95%86%E9%93%BA) |
| [顺电（华强北路店）三楼](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E9%A1%BA%E7%94%B5%EF%BC%88%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%B7%AF%E5%BA%97%EF%BC%89%E4%B8%89%E6%A5%BC%20%E7%A6%8F%E7%94%B0%E5%8C%BA%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%A1%97%E9%81%93%E4%B8%8A%E6%AD%A5%E5%B7%A5%E4%B8%9A%E5%8C%BA103%E6%A0%8B) | 蓝牙/无线音频 | [福田区华强北街道上步工业区103栋](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E9%A1%BA%E7%94%B5%EF%BC%88%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%B7%AF%E5%BA%97%EF%BC%89%E4%B8%89%E6%A5%BC%20%E7%A6%8F%E7%94%B0%E5%8C%BA%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%A1%97%E9%81%93%E4%B8%8A%E6%AD%A5%E5%B7%A5%E4%B8%9A%E5%8C%BA103%E6%A0%8B) |
| [京东Mall（南山店）](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E4%BA%AC%E4%B8%9CMall%EF%BC%88%E5%8D%97%E5%B1%B1%E5%BA%97%EF%BC%89%20%E5%8D%97%E5%B1%B1%E5%8C%BA%E5%8D%97%E6%B5%B7%E5%A4%A7%E9%81%932746%E5%8F%B7) | 蓝牙/无线+少量有线+音箱 | [南山区南海大道2746号](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E4%BA%AC%E4%B8%9CMall%EF%BC%88%E5%8D%97%E5%B1%B1%E5%BA%97%EF%BC%89%20%E5%8D%97%E5%B1%B1%E5%8C%BA%E5%8D%97%E6%B5%B7%E5%A4%A7%E9%81%932746%E5%8F%B7) |
| [双阶耳机生活馆](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E5%8F%8C%E9%98%B6%E8%80%B3%E6%9C%BA%E7%94%9F%E6%B4%BB%E9%A6%86%20%E7%A6%8F%E7%94%B0%E5%8C%BA%E5%8D%8E%E5%BC%BA%E5%8C%97%E4%B8%87%E5%95%86%E7%94%B5%E5%99%A8%E5%9F%8E3%E6%A5%BC3F22%E6%88%BF%E9%97%B4) | 多品牌音频产品 | [福田区华强北万商电器城3楼3F22房间](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E5%8F%8C%E9%98%B6%E8%80%B3%E6%9C%BA%E7%94%9F%E6%B4%BB%E9%A6%86%20%E7%A6%8F%E7%94%B0%E5%8C%BA%E5%8D%8E%E5%BC%BA%E5%8C%97%E4%B8%87%E5%95%86%E7%94%B5%E5%99%A8%E5%9F%8E3%E6%A5%BC3F22%E6%88%BF%E9%97%B4) |
| [HIFI-Corner](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20HIFI-Corner%20%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%B5%9B%E6%A0%BC%E7%A7%91%E6%8A%80%E5%9B%AD%E4%B8%89%E6%A0%8B%E8%A5%BF%E5%BA%A73%E6%A5%BC%EF%BC%8C%E5%9C%B0%E9%93%813%E5%8F%B7%E7%BA%BF%E5%8D%8E%E6%96%B0%E7%AB%99B%E5%87%BA%E5%8F%A3) | 台式音响/两声道系统 | [华强北赛格科技园三栋西座3楼，地铁3号线华新站B出口](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20HIFI-Corner%20%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%B5%9B%E6%A0%BC%E7%A7%91%E6%8A%80%E5%9B%AD%E4%B8%89%E6%A0%8B%E8%A5%BF%E5%BA%A73%E6%A5%BC%EF%BC%8C%E5%9C%B0%E9%93%813%E5%8F%B7%E7%BA%BF%E5%8D%8E%E6%96%B0%E7%AB%99B%E5%87%BA%E5%8F%A3) |
| [声华audio](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E5%A3%B0%E5%8D%8Eaudio%20%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%B5%9B%E6%A0%BC%E7%A7%91%E6%8A%80%E5%9B%AD%E4%B8%89%E6%A0%8B%E8%A5%BF%E5%BA%A73%E6%A5%BC%EF%BC%8C%E5%9C%B0%E9%93%813%E5%8F%B7%E7%BA%BF%E5%8D%8E%E6%96%B0%E7%AB%99B%E5%87%BA%E5%8F%A3) | 台式音响/两声道系统 | [华强北赛格科技园三栋西座3楼，地铁3号线华新站B出口](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E5%A3%B0%E5%8D%8Eaudio%20%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%B5%9B%E6%A0%BC%E7%A7%91%E6%8A%80%E5%9B%AD%E4%B8%89%E6%A0%8B%E8%A5%BF%E5%BA%A73%E6%A5%BC%EF%BC%8C%E5%9C%B0%E9%93%813%E5%8F%B7%E7%BA%BF%E5%8D%8E%E6%96%B0%E7%AB%99B%E5%87%BA%E5%8F%A3) |
| [新丰名店](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E6%96%B0%E4%B8%B0%E5%90%8D%E5%BA%97%20%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%B5%9B%E6%A0%BC%E7%A7%91%E6%8A%80%E5%9B%AD%E4%B8%89%E6%A0%8B%E8%A5%BF%E5%BA%A73%E6%A5%BC%EF%BC%8C%E5%9C%B0%E9%93%813%E5%8F%B7%E7%BA%BF%E5%8D%8E%E6%96%B0%E7%AB%99B%E5%87%BA%E5%8F%A3) | 台式音响/两声道系统 | [华强北赛格科技园三栋西座3楼，地铁3号线华新站B出口](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E6%96%B0%E4%B8%B0%E5%90%8D%E5%BA%97%20%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%B5%9B%E6%A0%BC%E7%A7%91%E6%8A%80%E5%9B%AD%E4%B8%89%E6%A0%8B%E8%A5%BF%E5%BA%A73%E6%A5%BC%EF%BC%8C%E5%9C%B0%E9%93%813%E5%8F%B7%E7%BA%BF%E5%8D%8E%E6%96%B0%E7%AB%99B%E5%87%BA%E5%8F%A3) |
| [华强北赛格科技园三栋西座3楼](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%B5%9B%E6%A0%BC%E7%A7%91%E6%8A%80%E5%9B%AD%E4%B8%89%E6%A0%8B%E8%A5%BF%E5%BA%A73%E6%A5%BC%20%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%B5%9B%E6%A0%BC%E7%A7%91%E6%8A%80%E5%9B%AD%E4%B8%89%E6%A0%8B%E8%A5%BF%E5%BA%A73%E6%A5%BC%EF%BC%8C%E5%9C%B0%E9%93%813%E5%8F%B7%E7%BA%BF%E5%8D%8E%E6%96%B0%E7%AB%99B%E5%87%BA%E5%8F%A3) | 多品牌无源音箱、功放、台式系统 | [华强北赛格科技园三栋西座3楼，地铁3号线华新站B出口](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%B5%9B%E6%A0%BC%E7%A7%91%E6%8A%80%E5%9B%AD%E4%B8%89%E6%A0%8B%E8%A5%BF%E5%BA%A73%E6%A5%BC%20%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%B5%9B%E6%A0%BC%E7%A7%91%E6%8A%80%E5%9B%AD%E4%B8%89%E6%A0%8B%E8%A5%BF%E5%BA%A73%E6%A5%BC%EF%BC%8C%E5%9C%B0%E9%93%813%E5%8F%B7%E7%BA%BF%E5%8D%8E%E6%96%B0%E7%AB%99B%E5%87%BA%E5%8F%A3) |
| [顺电（华强北路店）四楼](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E9%A1%BA%E7%94%B5%EF%BC%88%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%B7%AF%E5%BA%97%EF%BC%89%E5%9B%9B%E6%A5%BC%20%E7%A6%8F%E7%94%B0%E5%8C%BA%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%A1%97%E9%81%93%E4%B8%8A%E6%AD%A5%E5%B7%A5%E4%B8%9A%E5%8C%BA103%E6%A0%8B%E9%A1%BA%E7%94%B5%E5%9B%9B%E6%A5%BC%EF%BC%8C%E5%9C%B0%E9%93%813%E5%8F%B7%E7%BA%BF%E5%8D%8E%E6%96%B0%E7%AB%99) | 音箱/家庭音响 | [福田区华强北街道上步工业区103栋顺电四楼，地铁3号线华新站](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E9%A1%BA%E7%94%B5%EF%BC%88%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%B7%AF%E5%BA%97%EF%BC%89%E5%9B%9B%E6%A5%BC%20%E7%A6%8F%E7%94%B0%E5%8C%BA%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%A1%97%E9%81%93%E4%B8%8A%E6%AD%A5%E5%B7%A5%E4%B8%9A%E5%8C%BA103%E6%A0%8B%E9%A1%BA%E7%94%B5%E5%9B%9B%E6%A5%BC%EF%BC%8C%E5%9C%B0%E9%93%813%E5%8F%B7%E7%BA%BF%E5%8D%8E%E6%96%B0%E7%AB%99) |
| [JBL专卖店](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20JBL%E4%B8%93%E5%8D%96%E5%BA%97%20%E7%A6%8F%E7%94%B0%E5%8C%BA%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%B7%AF%E4%B8%8A%E6%AD%A5%E5%B7%A5%E5%8C%BA202%E6%A0%8B%E5%8D%97%E6%96%B9%E5%A4%A7%E5%8E%A6%E4%BA%8C%E6%A5%BC203%E5%8F%B7) | JBL 音响/台式系统 | [福田区华强北路上步工区202栋南方大厦二楼203号](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20JBL%E4%B8%93%E5%8D%96%E5%BA%97%20%E7%A6%8F%E7%94%B0%E5%8C%BA%E5%8D%8E%E5%BC%BA%E5%8C%97%E8%B7%AF%E4%B8%8A%E6%AD%A5%E5%B7%A5%E5%8C%BA202%E6%A0%8B%E5%8D%97%E6%96%B9%E5%A4%A7%E5%8E%A6%E4%BA%8C%E6%A5%BC203%E5%8F%B7) |
| [御之声音响](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E5%BE%A1%E4%B9%8B%E5%A3%B0%E9%9F%B3%E5%93%8D%20%E7%A6%8F%E7%94%B0%E5%8C%BA%E6%B7%B1%E5%8D%97%E5%A4%A7%E9%81%93%E7%BB%BF%E6%99%AFNEO%E5%A4%A7%E5%8E%A6C%E5%BA%A724%E5%B1%8224i%E3%80%8124j%E5%AE%A4) | 高端两声道/台式系统 | [福田区深南大道绿景NEO大厦C座24层24i、24j室](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E5%BE%A1%E4%B9%8B%E5%A3%B0%E9%9F%B3%E5%93%8D%20%E7%A6%8F%E7%94%B0%E5%8C%BA%E6%B7%B1%E5%8D%97%E5%A4%A7%E9%81%93%E7%BB%BF%E6%99%AFNEO%E5%A4%A7%E5%8E%A6C%E5%BA%A724%E5%B1%8224i%E3%80%8124j%E5%AE%A4) |
| [双阶音频](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E5%8F%8C%E9%98%B6%E9%9F%B3%E9%A2%91%20%E5%8D%97%E5%B1%B1%E5%8C%BA%E6%96%87%E6%98%8C%E8%A1%9712%E5%8F%B7%E5%8D%8E%E4%BE%A8%E5%9F%8E%E6%96%87%E5%8C%96%E5%88%9B%E6%84%8F%E5%9B%AD%E5%8C%97%E5%8C%BAC3%E6%A0%8B103) | HEDD、Fostex、耳机与桌面音频 | [南山区文昌街12号华侨城文化创意园北区C3栋103](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E5%8F%8C%E9%98%B6%E9%9F%B3%E9%A2%91%20%E5%8D%97%E5%B1%B1%E5%8C%BA%E6%96%87%E6%98%8C%E8%A1%9712%E5%8F%B7%E5%8D%8E%E4%BE%A8%E5%9F%8E%E6%96%87%E5%8C%96%E5%88%9B%E6%84%8F%E5%9B%AD%E5%8C%97%E5%8C%BAC3%E6%A0%8B103) |
| [音联邦国际音响广场](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E9%9F%B3%E8%81%94%E9%82%A6%E5%9B%BD%E9%99%85%E9%9F%B3%E5%93%8D%E5%B9%BF%E5%9C%BA%20%E8%AF%B7%E5%9C%A8%E5%9C%B0%E5%9B%BE%E5%BA%94%E7%94%A8%E6%88%96%E7%82%B9%E8%AF%84%E5%B9%B3%E5%8F%B0%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D%E6%A0%B8%E5%AE%9E) | 音响广场 | [请在地图应用或点评平台搜索店名核实](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E9%9F%B3%E8%81%94%E9%82%A6%E5%9B%BD%E9%99%85%E9%9F%B3%E5%93%8D%E5%B9%BF%E5%9C%BA%20%E8%AF%B7%E5%9C%A8%E5%9C%B0%E5%9B%BE%E5%BA%94%E7%94%A8%E6%88%96%E7%82%B9%E8%AF%84%E5%B9%B3%E5%8F%B0%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D%E6%A0%B8%E5%AE%9E) |
| [JBL音响深圳体验中心](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20JBL%E9%9F%B3%E5%93%8D%E6%B7%B1%E5%9C%B3%E4%BD%93%E9%AA%8C%E4%B8%AD%E5%BF%83%20%E9%BE%99%E5%B2%97%E5%8C%BA182%E8%AE%BE%E8%AE%A1%E5%9B%AD3%E6%A0%8B4%E6%A5%BC3B07%E5%8D%95%E5%85%83) | JBL 音响 | [龙岗区182设计园3栋4楼3B07单元](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20JBL%E9%9F%B3%E5%93%8D%E6%B7%B1%E5%9C%B3%E4%BD%93%E9%AA%8C%E4%B8%AD%E5%BF%83%20%E9%BE%99%E5%B2%97%E5%8C%BA182%E8%AE%BE%E8%AE%A1%E5%9B%AD3%E6%A0%8B4%E6%A5%BC3B07%E5%8D%95%E5%85%83) |
| [雅乐荟](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E9%9B%85%E4%B9%90%E8%8D%9F%20%E7%A6%8F%E7%94%B0%E5%8C%BA%E6%B2%99%E5%A4%B4%E8%A1%97%E9%81%93%E7%A6%8F%E5%BC%BA%E8%B7%AF3030%E5%8F%B7%E7%A6%8F%E7%94%B0%E4%BD%93%E8%82%B2%E5%85%AC%E5%9B%AD%E6%96%87%E5%8C%96%E4%BD%93%E8%82%B2%E4%BA%A7%E4%B8%9A%E6%80%BB%E9%83%A8%E5%A4%A7%E5%8E%A626%E6%A5%BC) | 综合音响 | [福田区沙头街道福强路3030号福田体育公园文化体育产业总部大厦26楼](https://uri.amap.com/search?keyword=%E6%B7%B1%E5%9C%B3%20%E9%9B%85%E4%B9%90%E8%8D%9F%20%E7%A6%8F%E7%94%B0%E5%8C%BA%E6%B2%99%E5%A4%B4%E8%A1%97%E9%81%93%E7%A6%8F%E5%BC%BA%E8%B7%AF3030%E5%8F%B7%E7%A6%8F%E7%94%B0%E4%BD%93%E8%82%B2%E5%85%AC%E5%9B%AD%E6%96%87%E5%8C%96%E4%BD%93%E8%82%B2%E4%BA%A7%E4%B8%9A%E6%80%BB%E9%83%A8%E5%A4%A7%E5%8E%A626%E6%A5%BC) |

### 大连

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [佳信Hifi数码体验馆](https://uri.amap.com/search?keyword=%E5%A4%A7%E8%BF%9E%20%E4%BD%B3%E4%BF%A1Hifi%E6%95%B0%E7%A0%81%E4%BD%93%E9%AA%8C%E9%A6%86%20%E8%A5%BF%E5%AE%89%E8%B7%AF%E7%94%B5%E5%AD%90%E5%9F%8E) | 飞傲播放器+少量塞子/大耳 | [西安路电子城](https://uri.amap.com/search?keyword=%E5%A4%A7%E8%BF%9E%20%E4%BD%B3%E4%BF%A1Hifi%E6%95%B0%E7%A0%81%E4%BD%93%E9%AA%8C%E9%A6%86%20%E8%A5%BF%E5%AE%89%E8%B7%AF%E7%94%B5%E5%AD%90%E5%9F%8E) |
| [飞焰HiFi音频](https://uri.amap.com/search?keyword=%E5%A4%A7%E8%BF%9E%20%E9%A3%9E%E7%84%B0HiFi%E9%9F%B3%E9%A2%91%20%E8%A5%BF%E5%B2%97%E5%8C%BA%E5%A5%A5%E6%9E%97%E5%8C%B9%E5%85%8B%E7%94%B5%E5%AD%90%E5%9F%8E%E5%9C%B0%E4%B8%8B%E4%B8%80%E5%B1%82%E8%A5%BFA1340%E5%8F%B7) | 综合音频 | [西岗区奥林匹克电子城地下一层西A1340号](https://uri.amap.com/search?keyword=%E5%A4%A7%E8%BF%9E%20%E9%A3%9E%E7%84%B0HiFi%E9%9F%B3%E9%A2%91%20%E8%A5%BF%E5%B2%97%E5%8C%BA%E5%A5%A5%E6%9E%97%E5%8C%B9%E5%85%8B%E7%94%B5%E5%AD%90%E5%9F%8E%E5%9C%B0%E4%B8%8B%E4%B8%80%E5%B1%82%E8%A5%BFA1340%E5%8F%B7) |

### 南京

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [南京威虹音响行](https://uri.amap.com/search?keyword=%E5%8D%97%E4%BA%AC%20%E5%8D%97%E4%BA%AC%E5%A8%81%E8%99%B9%E9%9F%B3%E5%93%8D%E8%A1%8C%20%E7%A7%A6%E6%B7%AE%E5%8C%BA%E6%B4%AA%E6%AD%A6%E8%B7%AF239%E5%8F%B7%E6%96%B0%E5%A4%A7%E9%83%BD%E5%A4%A7%E5%8E%A68%E5%B1%82D) | 音箱、前级等 | [秦淮区洪武路239号新大都大厦8层D](https://uri.amap.com/search?keyword=%E5%8D%97%E4%BA%AC%20%E5%8D%97%E4%BA%AC%E5%A8%81%E8%99%B9%E9%9F%B3%E5%93%8D%E8%A1%8C%20%E7%A7%A6%E6%B7%AE%E5%8C%BA%E6%B4%AA%E6%AD%A6%E8%B7%AF239%E5%8F%B7%E6%96%B0%E5%A4%A7%E9%83%BD%E5%A4%A7%E5%8E%A68%E5%B1%82D) |
| [甲苯](https://uri.amap.com/search?keyword=%E5%8D%97%E4%BA%AC%20%E7%94%B2%E8%8B%AF%20%E7%A7%A6%E6%B7%AE%E5%8C%BA%E7%9F%B3%E9%BC%93%E8%B7%AF33%E5%8F%B7%E4%B8%9C%E6%96%B9%E5%90%8D%E8%8B%91B%E5%BA%A71610%E5%AE%A4) | 连锁综合音频 | [秦淮区石鼓路33号东方名苑B座1610室](https://uri.amap.com/search?keyword=%E5%8D%97%E4%BA%AC%20%E7%94%B2%E8%8B%AF%20%E7%A7%A6%E6%B7%AE%E5%8C%BA%E7%9F%B3%E9%BC%93%E8%B7%AF33%E5%8F%B7%E4%B8%9C%E6%96%B9%E5%90%8D%E8%8B%91B%E5%BA%A71610%E5%AE%A4) |
| [新声域](https://uri.amap.com/search?keyword=%E5%8D%97%E4%BA%AC%20%E6%96%B0%E5%A3%B0%E5%9F%9F%20%E7%8E%84%E6%AD%A6%E5%8C%BA%E7%A2%91%E4%BA%AD%E5%B7%B727%E5%8F%B7A%E5%BA%A7%E4%B8%89%E6%A5%BC303%E5%AE%A4) | 入耳+播放器+HIFIMAN大耳 | [玄武区碑亭巷27号A座三楼303室](https://uri.amap.com/search?keyword=%E5%8D%97%E4%BA%AC%20%E6%96%B0%E5%A3%B0%E5%9F%9F%20%E7%8E%84%E6%AD%A6%E5%8C%BA%E7%A2%91%E4%BA%AD%E5%B7%B727%E5%8F%B7A%E5%BA%A7%E4%B8%89%E6%A5%BC303%E5%AE%A4) |
| [Step Sound](https://uri.amap.com/search?keyword=%E5%8D%97%E4%BA%AC%20Step%20Sound%20%E6%B1%9F%E5%AE%81%E5%8C%BA%E7%BB%BF%E5%9C%B0%E4%B9%8B%E7%AA%97EA-2%E6%A0%8B1228%E5%AE%A4) | 旗舰入耳+台式大耳机系统 | [江宁区绿地之窗EA-2栋1228室](https://uri.amap.com/search?keyword=%E5%8D%97%E4%BA%AC%20Step%20Sound%20%E6%B1%9F%E5%AE%81%E5%8C%BA%E7%BB%BF%E5%9C%B0%E4%B9%8B%E7%AA%97EA-2%E6%A0%8B1228%E5%AE%A4) |

### 成都

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [戈声](https://uri.amap.com/search?keyword=%E6%88%90%E9%83%BD%20%E6%88%88%E5%A3%B0%20%E9%94%A6%E6%B1%9F%E5%8C%BA%E5%92%8C%E5%B9%B3%E8%A1%973%E5%8F%B7%EF%BC%88%E5%B8%82%E4%BA%8C%E5%8C%BB%E9%99%A2F%E5%8F%A3%EF%BC%89) | 综合音频 | [锦江区和平街3号（市二医院F口）](https://uri.amap.com/search?keyword=%E6%88%90%E9%83%BD%20%E6%88%88%E5%A3%B0%20%E9%94%A6%E6%B1%9F%E5%8C%BA%E5%92%8C%E5%B9%B3%E8%A1%973%E5%8F%B7%EF%BC%88%E5%B8%82%E4%BA%8C%E5%8C%BB%E9%99%A2F%E5%8F%A3%EF%BC%89) |
| [海帆乐逅音频馆](https://uri.amap.com/search?keyword=%E6%88%90%E9%83%BD%20%E6%B5%B7%E5%B8%86%E4%B9%90%E9%80%85%E9%9F%B3%E9%A2%91%E9%A6%86%20%E9%94%A6%E6%B1%9F%E5%8C%BA%E4%B8%9C%E5%A4%A7%E8%B7%AF577%E5%8F%B7%E7%8E%AF%E8%B4%B8ICD%E5%95%86%E5%9C%BA4%E5%B1%82415) | 综合音频 | [锦江区东大路577号环贸ICD商场4层415](https://uri.amap.com/search?keyword=%E6%88%90%E9%83%BD%20%E6%B5%B7%E5%B8%86%E4%B9%90%E9%80%85%E9%9F%B3%E9%A2%91%E9%A6%86%20%E9%94%A6%E6%B1%9F%E5%8C%BA%E4%B8%9C%E5%A4%A7%E8%B7%AF577%E5%8F%B7%E7%8E%AF%E8%B4%B8ICD%E5%95%86%E5%9C%BA4%E5%B1%82415) |
| [如歌](https://uri.amap.com/search?keyword=%E6%88%90%E9%83%BD%20%E5%A6%82%E6%AD%8C%20%E9%9D%92%E7%BE%8A%E5%8C%BA%E7%8E%89%E6%B2%99%E8%B7%AF%E4%B8%83%E5%AE%B6%E5%B7%B753%E5%8F%B7) | 耳机+音响 | [青羊区玉沙路七家巷53号](https://uri.amap.com/search?keyword=%E6%88%90%E9%83%BD%20%E5%A6%82%E6%AD%8C%20%E9%9D%92%E7%BE%8A%E5%8C%BA%E7%8E%89%E6%B2%99%E8%B7%AF%E4%B8%83%E5%AE%B6%E5%B7%B753%E5%8F%B7) |
| [成都今日](https://uri.amap.com/search?keyword=%E6%88%90%E9%83%BD%20%E6%88%90%E9%83%BD%E4%BB%8A%E6%97%A5%20%E6%AD%A6%E4%BE%AF%E5%8C%BA%E4%BA%BA%E6%B0%91%E5%8D%97%E8%B7%AF%E5%9B%9B%E6%AE%B527%E5%8F%B7%E5%95%86%E9%BC%8E%E5%9B%BD%E9%99%852%E5%8F%B7%E6%A5%BC2%E5%8D%95%E5%85%832707) | HiFi 综合音频 | [武侯区人民南路四段27号商鼎国际2号楼2单元2707](https://uri.amap.com/search?keyword=%E6%88%90%E9%83%BD%20%E6%88%90%E9%83%BD%E4%BB%8A%E6%97%A5%20%E6%AD%A6%E4%BE%AF%E5%8C%BA%E4%BA%BA%E6%B0%91%E5%8D%97%E8%B7%AF%E5%9B%9B%E6%AE%B527%E5%8F%B7%E5%95%86%E9%BC%8E%E5%9B%BD%E9%99%852%E5%8F%B7%E6%A5%BC2%E5%8D%95%E5%85%832707) |
| [海帆](https://uri.amap.com/search?keyword=%E6%88%90%E9%83%BD%20%E6%B5%B7%E5%B8%86%20%E9%94%A6%E6%B1%9F%E5%8C%BA%E4%B8%9C%E5%A4%A7%E8%B7%AF246%E5%8F%B7%E7%8E%AF%E7%90%83%E6%B1%87%E8%94%9A%E7%84%B6A%E6%A0%8B%E5%95%86%E9%93%BA2%E5%B1%82207) | 索尼+综合音频 | [锦江区东大路246号环球汇蔚然A栋商铺2层207](https://uri.amap.com/search?keyword=%E6%88%90%E9%83%BD%20%E6%B5%B7%E5%B8%86%20%E9%94%A6%E6%B1%9F%E5%8C%BA%E4%B8%9C%E5%A4%A7%E8%B7%AF246%E5%8F%B7%E7%8E%AF%E7%90%83%E6%B1%87%E8%94%9A%E7%84%B6A%E6%A0%8B%E5%95%86%E9%93%BA2%E5%B1%82207) |
| [黎音](https://uri.amap.com/search?keyword=%E6%88%90%E9%83%BD%20%E9%BB%8E%E9%9F%B3%20%E6%AD%A6%E4%BE%AF%E5%8C%BA%E4%BA%BA%E6%B0%91%E5%8D%97%E8%B7%AF%E5%9B%9B%E6%AE%B5%E6%97%B6%E4%BB%A3%E6%95%B0%E7%A0%81%E5%A4%A7%E5%8E%A6A%E5%BA%A79%E6%A5%BCA-8) | 随身系统+发烧线材 | [武侯区人民南路四段时代数码大厦A座9楼A-8](https://uri.amap.com/search?keyword=%E6%88%90%E9%83%BD%20%E9%BB%8E%E9%9F%B3%20%E6%AD%A6%E4%BE%AF%E5%8C%BA%E4%BA%BA%E6%B0%91%E5%8D%97%E8%B7%AF%E5%9B%9B%E6%AE%B5%E6%97%B6%E4%BB%A3%E6%95%B0%E7%A0%81%E5%A4%A7%E5%8E%A6A%E5%BA%A79%E6%A5%BCA-8) |

### 济宁

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [23hifi音频馆](https://uri.amap.com/search?keyword=%E6%B5%8E%E5%AE%81%2023hifi%E9%9F%B3%E9%A2%91%E9%A6%86%20%E4%BB%BB%E5%9F%8E%E5%8C%BA%E9%87%91%E5%AE%87%E8%B7%AF%E4%B8%8E%E7%A7%91%E8%8B%91%E8%B7%AF%E4%BA%A4%E5%8F%89%E5%8F%A3%E8%A5%BF200%E7%B1%B3%E5%9B%9B%E5%AD%A3%E5%9F%8E%E5%85%AC%E5%AF%93%E6%A5%BC6054) | 塞子为主 | [任城区金宇路与科苑路交叉口西200米四季城公寓楼6054](https://uri.amap.com/search?keyword=%E6%B5%8E%E5%AE%81%2023hifi%E9%9F%B3%E9%A2%91%E9%A6%86%20%E4%BB%BB%E5%9F%8E%E5%8C%BA%E9%87%91%E5%AE%87%E8%B7%AF%E4%B8%8E%E7%A7%91%E8%8B%91%E8%B7%AF%E4%BA%A4%E5%8F%89%E5%8F%A3%E8%A5%BF200%E7%B1%B3%E5%9B%9B%E5%AD%A3%E5%9F%8E%E5%85%AC%E5%AF%93%E6%A5%BC6054) |

### 济南

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [戈声](https://uri.amap.com/search?keyword=%E6%B5%8E%E5%8D%97%20%E6%88%88%E5%A3%B0%20%E9%AB%98%E5%BE%B7%E5%9C%B0%E5%9B%BE%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D) | 入门设备+大耳为主 | [高德地图搜索店名](https://uri.amap.com/search?keyword=%E6%B5%8E%E5%8D%97%20%E6%88%88%E5%A3%B0%20%E9%AB%98%E5%BE%B7%E5%9C%B0%E5%9B%BE%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D) |
| [蝉音](https://uri.amap.com/search?keyword=%E6%B5%8E%E5%8D%97%20%E8%9D%89%E9%9F%B3%20%E5%8E%86%E4%B8%8B%E5%8C%BA%E5%90%8D%E5%A3%AB%E8%B1%AA%E5%BA%AD2%E5%8C%BA6%E5%8F%B7%E6%A5%BC2-701) | 高端器材+静电系统 | [历下区名士豪庭2区6号楼2-701](https://uri.amap.com/search?keyword=%E6%B5%8E%E5%8D%97%20%E8%9D%89%E9%9F%B3%20%E5%8E%86%E4%B8%8B%E5%8C%BA%E5%90%8D%E5%A3%AB%E8%B1%AA%E5%BA%AD2%E5%8C%BA6%E5%8F%B7%E6%A5%BC2-701) |
| [美年华](https://uri.amap.com/search?keyword=%E6%B5%8E%E5%8D%97%20%E7%BE%8E%E5%B9%B4%E5%8D%8E%20%E8%B5%9B%E6%A0%BC%E7%94%B5%E5%AD%90%E5%B9%BF%E5%9C%BA%E4%BA%8C%E6%A5%BC) | 入门+中高端音频 | [赛格电子广场二楼](https://uri.amap.com/search?keyword=%E6%B5%8E%E5%8D%97%20%E7%BE%8E%E5%B9%B4%E5%8D%8E%20%E8%B5%9B%E6%A0%BC%E7%94%B5%E5%AD%90%E5%B9%BF%E5%9C%BA%E4%BA%8C%E6%A5%BC) |
| [跃翔进HiFi（美年华）](https://uri.amap.com/search?keyword=%E6%B5%8E%E5%8D%97%20%E8%B7%83%E7%BF%94%E8%BF%9BHiFi%EF%BC%88%E7%BE%8E%E5%B9%B4%E5%8D%8E%EF%BC%89%20%E5%8E%86%E4%B8%8B%E5%8C%BA%E8%A7%A3%E6%94%BE%E8%B7%AF%E5%A1%9E%E5%8D%9A%E6%95%B0%E7%A0%81%E5%B9%BF%E5%9C%BA210) | 综合音频 | [历下区解放路塞博数码广场210](https://uri.amap.com/search?keyword=%E6%B5%8E%E5%8D%97%20%E8%B7%83%E7%BF%94%E8%BF%9BHiFi%EF%BC%88%E7%BE%8E%E5%B9%B4%E5%8D%8E%EF%BC%89%20%E5%8E%86%E4%B8%8B%E5%8C%BA%E8%A7%A3%E6%94%BE%E8%B7%AF%E5%A1%9E%E5%8D%9A%E6%95%B0%E7%A0%81%E5%B9%BF%E5%9C%BA210) |
| [耳机发烧屋](https://uri.amap.com/search?keyword=%E6%B5%8E%E5%8D%97%20%E8%80%B3%E6%9C%BA%E5%8F%91%E7%83%A7%E5%B1%8B%20%E5%8E%86%E4%B8%8B%E5%8C%BA%E5%B1%B1%E5%A4%A7%E8%B7%AF%E5%8D%8E%E5%BC%BA%E5%B9%BF%E5%9C%BA%E4%BA%8C%E6%A5%BCQ2105) | 综合音频 | [历下区山大路华强广场二楼Q2105](https://uri.amap.com/search?keyword=%E6%B5%8E%E5%8D%97%20%E8%80%B3%E6%9C%BA%E5%8F%91%E7%83%A7%E5%B1%8B%20%E5%8E%86%E4%B8%8B%E5%8C%BA%E5%B1%B1%E5%A4%A7%E8%B7%AF%E5%8D%8E%E5%BC%BA%E5%B9%BF%E5%9C%BA%E4%BA%8C%E6%A5%BCQ2105) |

### 青岛

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [海韵视听数码](https://uri.amap.com/search?keyword=%E9%9D%92%E5%B2%9B%20%E6%B5%B7%E9%9F%B5%E8%A7%86%E5%90%AC%E6%95%B0%E7%A0%81%20%E5%B8%82%E5%8C%97%E5%8C%BA%E9%A2%90%E9%AB%98%E6%95%B0%E7%A0%81%E5%B9%BF%E5%9C%BA%E8%B4%9F%E4%B8%80%E5%B1%82A0076%EF%BC%9B%E7%99%BE%E8%84%91%E6%B1%872A12) | 综合音频 | [市北区颐高数码广场负一层A0076；百脑汇2A12](https://uri.amap.com/search?keyword=%E9%9D%92%E5%B2%9B%20%E6%B5%B7%E9%9F%B5%E8%A7%86%E5%90%AC%E6%95%B0%E7%A0%81%20%E5%B8%82%E5%8C%97%E5%8C%BA%E9%A2%90%E9%AB%98%E6%95%B0%E7%A0%81%E5%B9%BF%E5%9C%BA%E8%B4%9F%E4%B8%80%E5%B1%82A0076%EF%BC%9B%E7%99%BE%E8%84%91%E6%B1%872A12) |

### 潍坊

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [青州星空电子](https://uri.amap.com/search?keyword=%E6%BD%8D%E5%9D%8A%20%E9%9D%92%E5%B7%9E%E6%98%9F%E7%A9%BA%E7%94%B5%E5%AD%90%20%E4%BA%91%E9%97%A8%E5%B1%B1%E8%A1%97%E9%81%936689%E5%8F%B7%E6%98%9F%E7%A9%BA%E5%BD%95%E9%9F%B3%E6%A3%9A) | 综合音频 | [云门山街道6689号星空录音棚](https://uri.amap.com/search?keyword=%E6%BD%8D%E5%9D%8A%20%E9%9D%92%E5%B7%9E%E6%98%9F%E7%A9%BA%E7%94%B5%E5%AD%90%20%E4%BA%91%E9%97%A8%E5%B1%B1%E8%A1%97%E9%81%936689%E5%8F%B7%E6%98%9F%E7%A9%BA%E5%BD%95%E9%9F%B3%E6%A3%9A) |

### 厦门

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [港天耳机](https://uri.amap.com/search?keyword=%E5%8E%A6%E9%97%A8%20%E6%B8%AF%E5%A4%A9%E8%80%B3%E6%9C%BA%20%E5%A4%A7%E4%BC%97%E7%82%B9%E8%AF%84%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D) | 入耳塞+飞傲+K701 | [大众点评搜索店名](https://uri.amap.com/search?keyword=%E5%8E%A6%E9%97%A8%20%E6%B8%AF%E5%A4%A9%E8%80%B3%E6%9C%BA%20%E5%A4%A7%E4%BC%97%E7%82%B9%E8%AF%84%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D) |
| [硕领音频馆](https://uri.amap.com/search?keyword=%E5%8E%A6%E9%97%A8%20%E7%A1%95%E9%A2%86%E9%9F%B3%E9%A2%91%E9%A6%86%20%E9%9B%86%E7%BE%8E%E5%8C%BA%E4%BE%A8%E8%8B%B1%E8%A1%97%E9%81%93%E4%B8%87%E7%A7%91%E4%BA%91%E5%9F%8EB%E5%BA%A71403%E5%AE%A4) | HIFIMAN+水月雨等 | [集美区侨英街道万科云城B座1403室](https://uri.amap.com/search?keyword=%E5%8E%A6%E9%97%A8%20%E7%A1%95%E9%A2%86%E9%9F%B3%E9%A2%91%E9%A6%86%20%E9%9B%86%E7%BE%8E%E5%8C%BA%E4%BE%A8%E8%8B%B1%E8%A1%97%E9%81%93%E4%B8%87%E7%A7%91%E4%BA%91%E5%9F%8EB%E5%BA%A71403%E5%AE%A4) |
| [阿贵港天耳机](https://uri.amap.com/search?keyword=%E5%8E%A6%E9%97%A8%20%E9%98%BF%E8%B4%B5%E6%B8%AF%E5%A4%A9%E8%80%B3%E6%9C%BA%20%E8%AF%B7%E5%9C%A8%E5%9C%B0%E5%9B%BE%E5%BA%94%E7%94%A8%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D%E6%A0%B8%E5%AE%9E) | 综合音频 | [请在地图应用搜索店名核实](https://uri.amap.com/search?keyword=%E5%8E%A6%E9%97%A8%20%E9%98%BF%E8%B4%B5%E6%B8%AF%E5%A4%A9%E8%80%B3%E6%9C%BA%20%E8%AF%B7%E5%9C%A8%E5%9C%B0%E5%9B%BE%E5%BA%94%E7%94%A8%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D%E6%A0%B8%E5%AE%9E) |

### 杭州

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [23hifi馆](https://uri.amap.com/search?keyword=%E6%9D%AD%E5%B7%9E%2023hifi%E9%A6%86%20%E8%AF%B7%E5%9C%A8%E5%9C%B0%E5%9B%BE%E5%BA%94%E7%94%A8%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D%E6%A0%B8%E5%AE%9E) | 综合音频 | [请在地图应用搜索店名核实](https://uri.amap.com/search?keyword=%E6%9D%AD%E5%B7%9E%2023hifi%E9%A6%86%20%E8%AF%B7%E5%9C%A8%E5%9C%B0%E5%9B%BE%E5%BA%94%E7%94%A8%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D%E6%A0%B8%E5%AE%9E) |
| [蝉音](https://uri.amap.com/search?keyword=%E6%9D%AD%E5%B7%9E%20%E8%9D%89%E9%9F%B3%20%E9%AB%98%E5%BE%B7%E5%9C%B0%E5%9B%BE%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D) | 耳机+音箱 | [高德地图搜索店名](https://uri.amap.com/search?keyword=%E6%9D%AD%E5%B7%9E%20%E8%9D%89%E9%9F%B3%20%E9%AB%98%E5%BE%B7%E5%9C%B0%E5%9B%BE%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D) |
| [织语工作室](https://uri.amap.com/search?keyword=%E6%9D%AD%E5%B7%9E%20%E7%BB%87%E8%AF%AD%E5%B7%A5%E4%BD%9C%E5%AE%A4%20%E9%AB%98%E5%BE%B7%E5%9C%B0%E5%9B%BE%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D) | 塞子为主 | [高德地图搜索店名](https://uri.amap.com/search?keyword=%E6%9D%AD%E5%B7%9E%20%E7%BB%87%E8%AF%AD%E5%B7%A5%E4%BD%9C%E5%AE%A4%20%E9%AB%98%E5%BE%B7%E5%9C%B0%E5%9B%BE%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D) |
| [甲苯](https://uri.amap.com/search?keyword=%E6%9D%AD%E5%B7%9E%20%E7%94%B2%E8%8B%AF%20%E9%AB%98%E5%BE%B7%E5%9C%B0%E5%9B%BE%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D) | 塞子为主 | [高德地图搜索店名](https://uri.amap.com/search?keyword=%E6%9D%AD%E5%B7%9E%20%E7%94%B2%E8%8B%AF%20%E9%AB%98%E5%BE%B7%E5%9C%B0%E5%9B%BE%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D) |
| [甲苯（杭州店）](https://uri.amap.com/search?keyword=%E6%9D%AD%E5%B7%9E%20%E7%94%B2%E8%8B%AF%EF%BC%88%E6%9D%AD%E5%B7%9E%E5%BA%97%EF%BC%89%20%E4%B8%8A%E5%9F%8E%E5%8C%BA%E5%B9%B3%E6%B5%B7%E8%B7%AF58%E5%8F%B7%E5%B9%B3%E6%B5%B7%E6%97%BA%E8%A7%921012%E5%AE%A4) | 连锁综合音频 | [上城区平海路58号平海旺角1012室](https://uri.amap.com/search?keyword=%E6%9D%AD%E5%B7%9E%20%E7%94%B2%E8%8B%AF%EF%BC%88%E6%9D%AD%E5%B7%9E%E5%BA%97%EF%BC%89%20%E4%B8%8A%E5%9F%8E%E5%8C%BA%E5%B9%B3%E6%B5%B7%E8%B7%AF58%E5%8F%B7%E5%B9%B3%E6%B5%B7%E6%97%BA%E8%A7%921012%E5%AE%A4) |
| [织语](https://uri.amap.com/search?keyword=%E6%9D%AD%E5%B7%9E%20%E7%BB%87%E8%AF%AD%20%E8%A5%BF%E6%B9%96%E5%8C%BA%E6%96%87%E4%BA%8C%E8%B7%AF299%E5%8F%B7) | 综合音频 | [西湖区文二路299号](https://uri.amap.com/search?keyword=%E6%9D%AD%E5%B7%9E%20%E7%BB%87%E8%AF%AD%20%E8%A5%BF%E6%B9%96%E5%8C%BA%E6%96%87%E4%BA%8C%E8%B7%AF299%E5%8F%B7) |

### 沈阳

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [泡泡狼发烧音频](https://uri.amap.com/search?keyword=%E6%B2%88%E9%98%B3%20%E6%B3%A1%E6%B3%A1%E7%8B%BC%E5%8F%91%E7%83%A7%E9%9F%B3%E9%A2%91%20%E5%92%8C%E5%B9%B3%E5%8C%BA%E4%B8%89%E5%A5%BD%E8%A1%9767%E5%8F%B7%E7%94%B24%E5%8F%B7) | 综合音频 | [和平区三好街67号甲4号](https://uri.amap.com/search?keyword=%E6%B2%88%E9%98%B3%20%E6%B3%A1%E6%B3%A1%E7%8B%BC%E5%8F%91%E7%83%A7%E9%9F%B3%E9%A2%91%20%E5%92%8C%E5%B9%B3%E5%8C%BA%E4%B8%89%E5%A5%BD%E8%A1%9767%E5%8F%B7%E7%94%B24%E5%8F%B7) |

### 哈尔滨

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [AUV音品](https://uri.amap.com/search?keyword=%E5%93%88%E5%B0%94%E6%BB%A8%20AUV%E9%9F%B3%E5%93%81%20%E9%81%93%E9%87%8C%E5%8C%BA%E5%AF%8C%E5%8A%9B%E4%B8%AD%E5%BF%83T2%E5%BA%A71608) | 塞子+中档大耳+旗舰设备 | [道里区富力中心T2座1608](https://uri.amap.com/search?keyword=%E5%93%88%E5%B0%94%E6%BB%A8%20AUV%E9%9F%B3%E5%93%81%20%E9%81%93%E9%87%8C%E5%8C%BA%E5%AF%8C%E5%8A%9B%E4%B8%AD%E5%BF%83T2%E5%BA%A71608) |
| [拓维诚信科技](https://uri.amap.com/search?keyword=%E5%93%88%E5%B0%94%E6%BB%A8%20%E6%8B%93%E7%BB%B4%E8%AF%9A%E4%BF%A1%E7%A7%91%E6%8A%80%20%E5%8D%97%E5%B2%97%E5%8C%BA%E5%8D%97%E9%80%9A%E5%A4%A7%E8%A1%97258%E5%8F%B7%E8%88%B9%E8%88%B6%E5%A4%A7%E5%8E%A6%E8%A5%BF%E5%8C%BA412B%EF%BC%9B%E6%95%99%E5%8C%96%E7%94%B5%E5%AD%90%E5%A4%A7%E4%B8%96%E7%95%8C%E4%BA%94%E6%A5%BC573%E5%AE%A4) | 综合音频 | [南岗区南通大街258号船舶大厦西区412B；教化电子大世界五楼573室](https://uri.amap.com/search?keyword=%E5%93%88%E5%B0%94%E6%BB%A8%20%E6%8B%93%E7%BB%B4%E8%AF%9A%E4%BF%A1%E7%A7%91%E6%8A%80%20%E5%8D%97%E5%B2%97%E5%8C%BA%E5%8D%97%E9%80%9A%E5%A4%A7%E8%A1%97258%E5%8F%B7%E8%88%B9%E8%88%B6%E5%A4%A7%E5%8E%A6%E8%A5%BF%E5%8C%BA412B%EF%BC%9B%E6%95%99%E5%8C%96%E7%94%B5%E5%AD%90%E5%A4%A7%E4%B8%96%E7%95%8C%E4%BA%94%E6%A5%BC573%E5%AE%A4) |
| [金耳朵](https://uri.amap.com/search?keyword=%E5%93%88%E5%B0%94%E6%BB%A8%20%E9%87%91%E8%80%B3%E6%9C%B5%20%E5%8D%97%E5%B2%97%E5%8C%BA%E6%9D%BE%E8%8A%B1%E6%B1%9F%E8%A1%97139%E5%8F%B7%E6%95%99%E5%8C%96%E7%94%B5%E5%AD%90%E5%A4%A7%E4%B8%96%E7%95%8C%E4%B8%80%E6%A5%BCW1-25A) | 综合音频 | [南岗区松花江街139号教化电子大世界一楼W1-25A](https://uri.amap.com/search?keyword=%E5%93%88%E5%B0%94%E6%BB%A8%20%E9%87%91%E8%80%B3%E6%9C%B5%20%E5%8D%97%E5%B2%97%E5%8C%BA%E6%9D%BE%E8%8A%B1%E6%B1%9F%E8%A1%97139%E5%8F%B7%E6%95%99%E5%8C%96%E7%94%B5%E5%AD%90%E5%A4%A7%E4%B8%96%E7%95%8C%E4%B8%80%E6%A5%BCW1-25A) |

### 大庆

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [黑龙江音乐人（飞音耳机店）](https://uri.amap.com/search?keyword=%E5%A4%A7%E5%BA%86%20%E9%BB%91%E9%BE%99%E6%B1%9F%E9%9F%B3%E4%B9%90%E4%BA%BA%EF%BC%88%E9%A3%9E%E9%9F%B3%E8%80%B3%E6%9C%BA%E5%BA%97%EF%BC%89%20%E8%AE%A9%E8%83%A1%E8%B7%AF%E5%8C%BA%E5%BE%B7%E5%A8%81%E7%94%B5%E8%84%91%E5%9F%8E1%E6%A5%BC24%E5%8F%B7) | 专业音频 | [让胡路区德威电脑城1楼24号](https://uri.amap.com/search?keyword=%E5%A4%A7%E5%BA%86%20%E9%BB%91%E9%BE%99%E6%B1%9F%E9%9F%B3%E4%B9%90%E4%BA%BA%EF%BC%88%E9%A3%9E%E9%9F%B3%E8%80%B3%E6%9C%BA%E5%BA%97%EF%BC%89%20%E8%AE%A9%E8%83%A1%E8%B7%AF%E5%8C%BA%E5%BE%B7%E5%A8%81%E7%94%B5%E8%84%91%E5%9F%8E1%E6%A5%BC24%E5%8F%B7) |

### 宁波

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [知音堂音频体验馆](https://uri.amap.com/search?keyword=%E5%AE%81%E6%B3%A2%20%E7%9F%A5%E9%9F%B3%E5%A0%82%E9%9F%B3%E9%A2%91%E4%BD%93%E9%AA%8C%E9%A6%86%20%E4%B8%9C%E6%96%B9%E5%95%86%E5%8A%A1%E4%B8%AD%E5%BF%83) | 塞子+大耳+高端器材 | [东方商务中心](https://uri.amap.com/search?keyword=%E5%AE%81%E6%B3%A2%20%E7%9F%A5%E9%9F%B3%E5%A0%82%E9%9F%B3%E9%A2%91%E4%BD%93%E9%AA%8C%E9%A6%86%20%E4%B8%9C%E6%96%B9%E5%95%86%E5%8A%A1%E4%B8%AD%E5%BF%83) |

### 武汉

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [沸谷](https://uri.amap.com/search?keyword=%E6%AD%A6%E6%B1%89%20%E6%B2%B8%E8%B0%B7%20%E9%AB%98%E5%BE%B7%E5%9C%B0%E5%9B%BE%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D) | 大耳+塞子 | [高德地图搜索店名](https://uri.amap.com/search?keyword=%E6%AD%A6%E6%B1%89%20%E6%B2%B8%E8%B0%B7%20%E9%AB%98%E5%BE%B7%E5%9C%B0%E5%9B%BE%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D) |
| [森之源](https://uri.amap.com/search?keyword=%E6%AD%A6%E6%B1%89%20%E6%A3%AE%E4%B9%8B%E6%BA%90%20%E6%AD%A6%E6%98%8C%E5%8C%BA%E5%BE%90%E4%B8%9C%E5%A4%A7%E8%A1%97%E7%A6%8F%E6%98%9F%E6%83%A0%E8%AA%89%E5%9B%BD%E9%99%85%E5%9F%8E3%E6%9C%9F1%E6%A0%8B2804) | 综合音频 | [武昌区徐东大街福星惠誉国际城3期1栋2804](https://uri.amap.com/search?keyword=%E6%AD%A6%E6%B1%89%20%E6%A3%AE%E4%B9%8B%E6%BA%90%20%E6%AD%A6%E6%98%8C%E5%8C%BA%E5%BE%90%E4%B8%9C%E5%A4%A7%E8%A1%97%E7%A6%8F%E6%98%9F%E6%83%A0%E8%AA%89%E5%9B%BD%E9%99%85%E5%9F%8E3%E6%9C%9F1%E6%A0%8B2804) |
| [安迈](https://uri.amap.com/search?keyword=%E6%AD%A6%E6%B1%89%20%E5%AE%89%E8%BF%88%20%E6%B4%AA%E5%B1%B1%E5%8C%BA%E7%8F%9E%E7%91%9C%E8%B7%AF100%E5%8F%B7%E5%B9%BF%E5%9F%A0%E5%B1%AF%E8%B5%84%E8%AE%AF%E5%B9%BF%E5%9C%BAA%E5%BA%A7%E4%BA%8C%E6%A5%BC2033A) | 耳机全品类 | [洪山区珞瑜路100号广埠屯资讯广场A座二楼2033A](https://uri.amap.com/search?keyword=%E6%AD%A6%E6%B1%89%20%E5%AE%89%E8%BF%88%20%E6%B4%AA%E5%B1%B1%E5%8C%BA%E7%8F%9E%E7%91%9C%E8%B7%AF100%E5%8F%B7%E5%B9%BF%E5%9F%A0%E5%B1%AF%E8%B5%84%E8%AE%AF%E5%B9%BF%E5%9C%BAA%E5%BA%A7%E4%BA%8C%E6%A5%BC2033A) |

### 福州

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [申博AOSON COFFEE MORE](https://uri.amap.com/search?keyword=%E7%A6%8F%E5%B7%9E%20%E7%94%B3%E5%8D%9AAOSON%20COFFEE%20MORE%20%E9%BC%93%E6%A5%BC%E5%8C%BA%E5%A4%A7%E7%8E%8B%E5%BA%9C%E5%B7%B7%E4%B8%8E%E5%9F%8E%E5%AE%88%E5%89%8D%E8%B7%AF%E4%BA%A4%E5%8F%89%E5%8F%A3%E5%8C%9720%E7%B1%B3) | 发烧音频+碟机/音响 | [鼓楼区大王府巷与城守前路交叉口北20米](https://uri.amap.com/search?keyword=%E7%A6%8F%E5%B7%9E%20%E7%94%B3%E5%8D%9AAOSON%20COFFEE%20MORE%20%E9%BC%93%E6%A5%BC%E5%8C%BA%E5%A4%A7%E7%8E%8B%E5%BA%9C%E5%B7%B7%E4%B8%8E%E5%9F%8E%E5%AE%88%E5%89%8D%E8%B7%AF%E4%BA%A4%E5%8F%89%E5%8F%A3%E5%8C%9720%E7%B1%B3) |
| [八度音频](https://uri.amap.com/search?keyword=%E7%A6%8F%E5%B7%9E%20%E5%85%AB%E5%BA%A6%E9%9F%B3%E9%A2%91%20%E9%9B%86%E7%BE%8E%E5%8C%BA%E4%BE%A8%E8%8B%B1%E8%A1%97%E9%81%93%E4%B8%87%E7%A7%91%E4%BA%91%E5%9F%8EB%E5%BA%A71403%E5%AE%A4) | 入耳+前端+头戴 | [集美区侨英街道万科云城B座1403室](https://uri.amap.com/search?keyword=%E7%A6%8F%E5%B7%9E%20%E5%85%AB%E5%BA%A6%E9%9F%B3%E9%A2%91%20%E9%9B%86%E7%BE%8E%E5%8C%BA%E4%BE%A8%E8%8B%B1%E8%A1%97%E9%81%93%E4%B8%87%E7%A7%91%E4%BA%91%E5%9F%8EB%E5%BA%A71403%E5%AE%A4) |
| [奥申音频](https://uri.amap.com/search?keyword=%E7%A6%8F%E5%B7%9E%20%E5%A5%A5%E7%94%B3%E9%9F%B3%E9%A2%91%20%E5%8F%B0%E6%B1%9F%E5%8C%BA%E4%BA%94%E4%B8%80%E4%B8%AD%E8%B7%AF%E5%A4%A7%E5%88%A9%E5%98%89%E5%9F%8Ea1-142%EF%BC%9B%E5%A4%A7%E5%88%A9%E5%98%89%E5%86%99%E5%AD%97%E6%A5%BC537%E5%AE%A4) | 综合音频 | [台江区五一中路大利嘉城a1-142；大利嘉写字楼537室](https://uri.amap.com/search?keyword=%E7%A6%8F%E5%B7%9E%20%E5%A5%A5%E7%94%B3%E9%9F%B3%E9%A2%91%20%E5%8F%B0%E6%B1%9F%E5%8C%BA%E4%BA%94%E4%B8%80%E4%B8%AD%E8%B7%AF%E5%A4%A7%E5%88%A9%E5%98%89%E5%9F%8Ea1-142%EF%BC%9B%E5%A4%A7%E5%88%A9%E5%98%89%E5%86%99%E5%AD%97%E6%A5%BC537%E5%AE%A4) |

### 贵阳

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [索尼·耳印听觉工作室·新声域](https://uri.amap.com/search?keyword=%E8%B4%B5%E9%98%B3%20%E7%B4%A2%E5%B0%BC%C2%B7%E8%80%B3%E5%8D%B0%E5%90%AC%E8%A7%89%E5%B7%A5%E4%BD%9C%E5%AE%A4%C2%B7%E6%96%B0%E5%A3%B0%E5%9F%9F%20%E8%A7%82%E5%B1%B1%E6%B9%96%E5%8C%BA%E9%95%BF%E5%B2%AD%E5%8D%97%E8%B7%AF%E8%BE%85%E8%B7%AF%E7%BE%8E%E7%9A%84%E7%BD%AE%E4%B8%9A%E5%B9%BF%E5%9C%BAT2%E5%B9%A29%E6%A5%BC915) | 塞子为主+少量大耳 | [观山湖区长岭南路辅路美的置业广场T2幢9楼915](https://uri.amap.com/search?keyword=%E8%B4%B5%E9%98%B3%20%E7%B4%A2%E5%B0%BC%C2%B7%E8%80%B3%E5%8D%B0%E5%90%AC%E8%A7%89%E5%B7%A5%E4%BD%9C%E5%AE%A4%C2%B7%E6%96%B0%E5%A3%B0%E5%9F%9F%20%E8%A7%82%E5%B1%B1%E6%B9%96%E5%8C%BA%E9%95%BF%E5%B2%AD%E5%8D%97%E8%B7%AF%E8%BE%85%E8%B7%AF%E7%BE%8E%E7%9A%84%E7%BD%AE%E4%B8%9A%E5%B9%BF%E5%9C%BAT2%E5%B9%A29%E6%A5%BC915) |
| [四维耳机](https://uri.amap.com/search?keyword=%E8%B4%B5%E9%98%B3%20%E5%9B%9B%E7%BB%B4%E8%80%B3%E6%9C%BA%20%E5%8D%97%E6%98%8E%E5%8C%BA%E6%8A%A4%E5%9B%BD%E8%B7%AF82%E5%8F%B7%E5%87%AF%E5%AE%BE%E6%96%AF%E5%9F%BA%E5%86%99%E5%AD%97%E6%A5%BCf2%E5%B1%82) | 综合音频 | [南明区护国路82号凯宾斯基写字楼f2层](https://uri.amap.com/search?keyword=%E8%B4%B5%E9%98%B3%20%E5%9B%9B%E7%BB%B4%E8%80%B3%E6%9C%BA%20%E5%8D%97%E6%98%8E%E5%8C%BA%E6%8A%A4%E5%9B%BD%E8%B7%AF82%E5%8F%B7%E5%87%AF%E5%AE%BE%E6%96%AF%E5%9F%BA%E5%86%99%E5%AD%97%E6%A5%BCf2%E5%B1%82) |
| [新声域](https://uri.amap.com/search?keyword=%E8%B4%B5%E9%98%B3%20%E6%96%B0%E5%A3%B0%E5%9F%9F%20%E8%A7%82%E5%B1%B1%E6%B9%96%E5%8C%BA%E5%A4%A9%E4%B8%80%E5%9B%BD%E9%99%85%E5%B9%BF%E5%9C%BA9%E6%A0%8B7%E5%B1%828%E5%8F%B7) | 综合音频 | [观山湖区天一国际广场9栋7层8号](https://uri.amap.com/search?keyword=%E8%B4%B5%E9%98%B3%20%E6%96%B0%E5%A3%B0%E5%9F%9F%20%E8%A7%82%E5%B1%B1%E6%B9%96%E5%8C%BA%E5%A4%A9%E4%B8%80%E5%9B%BD%E9%99%85%E5%B9%BF%E5%9C%BA9%E6%A0%8B7%E5%B1%828%E5%8F%B7) |

### 郑州

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [雨点音频](https://uri.amap.com/search?keyword=%E9%83%91%E5%B7%9E%20%E9%9B%A8%E7%82%B9%E9%9F%B3%E9%A2%91%20%E6%B2%B3%E5%8D%97%E7%9C%81%E9%83%91%E5%B7%9E%E5%B8%82%E9%87%91%E6%B0%B4%E5%8C%BA%E4%B8%9C%E9%A3%8E%E8%B7%AF%E4%B8%96%E5%8D%9A%E4%B8%AD%E5%BF%8315%E6%A5%BC1512%E5%AE%A4) | 综合音频 | [河南省郑州市金水区东风路世博中心15楼1512室](https://uri.amap.com/search?keyword=%E9%83%91%E5%B7%9E%20%E9%9B%A8%E7%82%B9%E9%9F%B3%E9%A2%91%20%E6%B2%B3%E5%8D%97%E7%9C%81%E9%83%91%E5%B7%9E%E5%B8%82%E9%87%91%E6%B0%B4%E5%8C%BA%E4%B8%9C%E9%A3%8E%E8%B7%AF%E4%B8%96%E5%8D%9A%E4%B8%AD%E5%BF%8315%E6%A5%BC1512%E5%AE%A4) |

### 洛阳

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [云响ECHO](https://uri.amap.com/search?keyword=%E6%B4%9B%E9%98%B3%20%E4%BA%91%E5%93%8DECHO%20%E6%B6%A7%E8%A5%BF%E5%8C%BA%E7%8F%A0%E6%B1%9F%E8%B7%AF%E9%9B%86%E8%B4%A4%E5%8C%97%E8%A1%97%E4%BA%A4%E5%8F%89%E5%8F%A3%E8%A5%BF50%E7%B1%B3) | 真力音箱、qdc/HIFIMAN 代理、酒吧/咖啡场景 | [涧西区珠江路集贤北街交叉口西50米](https://uri.amap.com/search?keyword=%E6%B4%9B%E9%98%B3%20%E4%BA%91%E5%93%8DECHO%20%E6%B6%A7%E8%A5%BF%E5%8C%BA%E7%8F%A0%E6%B1%9F%E8%B7%AF%E9%9B%86%E8%B4%A4%E5%8C%97%E8%A1%97%E4%BA%A4%E5%8F%89%E5%8F%A3%E8%A5%BF50%E7%B1%B3) |

### 乌鲁木齐

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [海安德-音频馆](https://uri.amap.com/search?keyword=%E4%B9%8C%E9%B2%81%E6%9C%A8%E9%BD%90%20%E6%B5%B7%E5%AE%89%E5%BE%B7-%E9%9F%B3%E9%A2%91%E9%A6%86%20%E5%A4%A9%E5%B1%B1%E5%8C%BA%E4%B8%AD%E5%B1%B1%E8%B7%AF141%E5%8F%B7%E7%99%BE%E8%8A%B1%E6%9D%91%E6%99%BA%E8%83%BD%E7%94%9F%E6%B4%BB%E5%B9%BF%E5%9C%BA%E4%BA%8C%E5%B1%822-1%E5%8F%B7) | 飞傲、山灵、艾利和、森海、拜亚等 | [天山区中山路141号百花村智能生活广场二层2-1号](https://uri.amap.com/search?keyword=%E4%B9%8C%E9%B2%81%E6%9C%A8%E9%BD%90%20%E6%B5%B7%E5%AE%89%E5%BE%B7-%E9%9F%B3%E9%A2%91%E9%A6%86%20%E5%A4%A9%E5%B1%B1%E5%8C%BA%E4%B8%AD%E5%B1%B1%E8%B7%AF141%E5%8F%B7%E7%99%BE%E8%8A%B1%E6%9D%91%E6%99%BA%E8%83%BD%E7%94%9F%E6%B4%BB%E5%B9%BF%E5%9C%BA%E4%BA%8C%E5%B1%822-1%E5%8F%B7) |

### 东莞

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [博声音频](https://uri.amap.com/search?keyword=%E4%B8%9C%E8%8E%9E%20%E5%8D%9A%E5%A3%B0%E9%9F%B3%E9%A2%91%20%E4%B8%9C%E5%9F%8E%E4%B8%AD%E8%B7%AF%E4%B8%96%E5%8D%9A%E5%B9%BF%E5%9C%BAF%E5%8C%BA1046%E9%93%BA) | 综合音频 | [东城中路世博广场F区1046铺](https://uri.amap.com/search?keyword=%E4%B8%9C%E8%8E%9E%20%E5%8D%9A%E5%A3%B0%E9%9F%B3%E9%A2%91%20%E4%B8%9C%E5%9F%8E%E4%B8%AD%E8%B7%AF%E4%B8%96%E5%8D%9A%E5%B9%BF%E5%9C%BAF%E5%8C%BA1046%E9%93%BA) |
| [声音图书馆](https://uri.amap.com/search?keyword=%E4%B8%9C%E8%8E%9E%20%E5%A3%B0%E9%9F%B3%E5%9B%BE%E4%B9%A6%E9%A6%86%20%E5%8D%97%E5%9F%8E%E9%A6%99%E5%9B%AD%E8%B7%AF35%E5%8F%B7769%E6%96%87%E5%88%9B%E5%9B%AD1%E6%A0%8B2%E6%A5%BC%EF%BC%9B%E8%8E%9E%E5%9F%8E%E6%B2%B3%E5%B0%BE%E8%A1%9725%E5%8F%B7) | 少量耳机+CD/黑胶/磁带 | [南城香园路35号769文创园1栋2楼；莞城河尾街25号](https://uri.amap.com/search?keyword=%E4%B8%9C%E8%8E%9E%20%E5%A3%B0%E9%9F%B3%E5%9B%BE%E4%B9%A6%E9%A6%86%20%E5%8D%97%E5%9F%8E%E9%A6%99%E5%9B%AD%E8%B7%AF35%E5%8F%B7769%E6%96%87%E5%88%9B%E5%9B%AD1%E6%A0%8B2%E6%A5%BC%EF%BC%9B%E8%8E%9E%E5%9F%8E%E6%B2%B3%E5%B0%BE%E8%A1%9725%E5%8F%B7) |
| [京东Mall（台商大厦店）](https://uri.amap.com/search?keyword=%E4%B8%9C%E8%8E%9E%20%E4%BA%AC%E4%B8%9CMall%EF%BC%88%E5%8F%B0%E5%95%86%E5%A4%A7%E5%8E%A6%E5%BA%97%EF%BC%89%20%E4%B8%9C%E5%9F%8E%E8%A1%97%E9%81%93%E7%81%AB%E7%82%BC%E6%A0%91%E7%A4%BE%E5%8C%BA%E4%B8%9C%E8%8E%9E%E5%A4%A7%E9%81%9311%E5%8F%B7%E7%8E%AF%E7%90%83%E7%BB%8F%E8%B4%B8%E4%B8%AD%E5%BF%83) | 蓝牙/无线+少量有线+音箱 | [东城街道火炼树社区东莞大道11号环球经贸中心](https://uri.amap.com/search?keyword=%E4%B8%9C%E8%8E%9E%20%E4%BA%AC%E4%B8%9CMall%EF%BC%88%E5%8F%B0%E5%95%86%E5%A4%A7%E5%8E%A6%E5%BA%97%EF%BC%89%20%E4%B8%9C%E5%9F%8E%E8%A1%97%E9%81%93%E7%81%AB%E7%82%BC%E6%A0%91%E7%A4%BE%E5%8C%BA%E4%B8%9C%E8%8E%9E%E5%A4%A7%E9%81%9311%E5%8F%B7%E7%8E%AF%E7%90%83%E7%BB%8F%E8%B4%B8%E4%B8%AD%E5%BF%83) |
| [JBL音响东实CPARK店](https://uri.amap.com/search?keyword=%E4%B8%9C%E8%8E%9E%20JBL%E9%9F%B3%E5%93%8D%E4%B8%9C%E5%AE%9ECPARK%E5%BA%97%20%E5%8D%97%E5%9F%8E%E8%A1%97%E9%81%93%E4%B8%9C%E8%8E%9E%E5%A4%A7%E9%81%93%E5%8D%97%E5%9F%8E%E6%AE%B512%E5%8F%B7CPARK%E9%A1%B9%E7%9B%AE6%E6%A0%8B1%E6%A5%BC103%E5%AE%A4) | JBL 全系 | [南城街道东莞大道南城段12号CPARK项目6栋1楼103室](https://uri.amap.com/search?keyword=%E4%B8%9C%E8%8E%9E%20JBL%E9%9F%B3%E5%93%8D%E4%B8%9C%E5%AE%9ECPARK%E5%BA%97%20%E5%8D%97%E5%9F%8E%E8%A1%97%E9%81%93%E4%B8%9C%E8%8E%9E%E5%A4%A7%E9%81%93%E5%8D%97%E5%9F%8E%E6%AE%B512%E5%8F%B7CPARK%E9%A1%B9%E7%9B%AE6%E6%A0%8B1%E6%A5%BC103%E5%AE%A4) |

### 呼和浩特

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [捷声音频](https://uri.amap.com/search?keyword=%E5%91%BC%E5%92%8C%E6%B5%A9%E7%89%B9%20%E6%8D%B7%E5%A3%B0%E9%9F%B3%E9%A2%91%20%E6%96%B0%E5%9F%8E%E5%8C%BA%E4%B8%AD%E5%B1%B1%E4%B8%9C%E8%B7%AF%E6%B3%A2%E5%A3%AB%E6%95%B0%E7%A0%81%E5%B9%BF%E5%9C%BA%E4%B8%80%E6%A5%BC%E4%B8%9C%E4%BE%A7) | 综合音频 | [新城区中山东路波士数码广场一楼东侧](https://uri.amap.com/search?keyword=%E5%91%BC%E5%92%8C%E6%B5%A9%E7%89%B9%20%E6%8D%B7%E5%A3%B0%E9%9F%B3%E9%A2%91%20%E6%96%B0%E5%9F%8E%E5%8C%BA%E4%B8%AD%E5%B1%B1%E4%B8%9C%E8%B7%AF%E6%B3%A2%E5%A3%AB%E6%95%B0%E7%A0%81%E5%B9%BF%E5%9C%BA%E4%B8%80%E6%A5%BC%E4%B8%9C%E4%BE%A7) |

### 重庆

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [海帆音频馆](https://uri.amap.com/search?keyword=%E9%87%8D%E5%BA%86%20%E6%B5%B7%E5%B8%86%E9%9F%B3%E9%A2%91%E9%A6%86%20%E6%B1%9F%E5%8C%97%E5%8C%BA%E6%96%B0%E5%A3%B9%E8%A1%972%E5%8F%B7%E6%A5%BC1014%E5%AE%A4) | 塞子+大耳/台机 | [江北区新壹街2号楼1014室](https://uri.amap.com/search?keyword=%E9%87%8D%E5%BA%86%20%E6%B5%B7%E5%B8%86%E9%9F%B3%E9%A2%91%E9%A6%86%20%E6%B1%9F%E5%8C%97%E5%8C%BA%E6%96%B0%E5%A3%B9%E8%A1%972%E5%8F%B7%E6%A5%BC1014%E5%AE%A4) |
| [索尼sony store](https://uri.amap.com/search?keyword=%E9%87%8D%E5%BA%86%20%E7%B4%A2%E5%B0%BCsony%20store%20%E4%B8%87%E8%B1%A1%E5%9F%8ENL280) | 索尼全系旗舰 | [万象城NL280](https://uri.amap.com/search?keyword=%E9%87%8D%E5%BA%86%20%E7%B4%A2%E5%B0%BCsony%20store%20%E4%B8%87%E8%B1%A1%E5%9F%8ENL280) |

### 天津

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [HIFIMAN](https://uri.amap.com/search?keyword=%E5%A4%A9%E6%B4%A5%20HIFIMAN%20%E5%8D%97%E5%BC%80%E5%8C%BA%EF%BC%8C%E5%9C%B0%E5%9B%BE%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D) | HIFIMAN 全系 | [南开区，地图搜索店名](https://uri.amap.com/search?keyword=%E5%A4%A9%E6%B4%A5%20HIFIMAN%20%E5%8D%97%E5%BC%80%E5%8C%BA%EF%BC%8C%E5%9C%B0%E5%9B%BE%E6%90%9C%E7%B4%A2%E5%BA%97%E5%90%8D) |

### 南昌

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [康迪斯音频馆](https://uri.amap.com/search?keyword=%E5%8D%97%E6%98%8C%20%E5%BA%B7%E8%BF%AA%E6%96%AF%E9%9F%B3%E9%A2%91%E9%A6%86%20%E8%A5%BF%E6%B9%96%E5%8C%BA%E4%BA%8C%E4%B8%83%E5%8D%97%E8%B7%AF%E7%99%BE%E5%8A%9B%E4%BD%B3%E6%95%B0%E7%A0%81%E6%B8%AF4%E6%A5%BC8131%20A) | 塞子/前端 | [西湖区二七南路百力佳数码港4楼8131 A](https://uri.amap.com/search?keyword=%E5%8D%97%E6%98%8C%20%E5%BA%B7%E8%BF%AA%E6%96%AF%E9%9F%B3%E9%A2%91%E9%A6%86%20%E8%A5%BF%E6%B9%96%E5%8C%BA%E4%BA%8C%E4%B8%83%E5%8D%97%E8%B7%AF%E7%99%BE%E5%8A%9B%E4%BD%B3%E6%95%B0%E7%A0%81%E6%B8%AF4%E6%A5%BC8131%20A) |
| [南昌悦动](https://uri.amap.com/search?keyword=%E5%8D%97%E6%98%8C%20%E5%8D%97%E6%98%8C%E6%82%A6%E5%8A%A8%20%E9%AB%98%E6%96%B0%E5%8C%BA%E4%B8%AD%E9%AA%8F%E8%93%9D%E6%B9%BE%E9%A6%99%E9%83%A1a33%E6%A0%8B104) | 综合音频 | [高新区中骏蓝湾香郡a33栋104](https://uri.amap.com/search?keyword=%E5%8D%97%E6%98%8C%20%E5%8D%97%E6%98%8C%E6%82%A6%E5%8A%A8%20%E9%AB%98%E6%96%B0%E5%8C%BA%E4%B8%AD%E9%AA%8F%E8%93%9D%E6%B9%BE%E9%A6%99%E9%83%A1a33%E6%A0%8B104) |

### 长沙

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [金耳朵](https://uri.amap.com/search?keyword=%E9%95%BF%E6%B2%99%20%E9%87%91%E8%80%B3%E6%9C%B5%20%E8%8A%99%E8%93%89%E5%8C%BA%E8%A7%A3%E6%94%BE%E4%B8%9C%E8%B7%AF%E5%8D%8E%E6%B5%B7%E7%94%B5%E8%84%91%E5%9F%8E%E4%B8%80%E6%A5%BC004%EF%BC%9B%E5%9B%BD%E5%82%A8%E7%94%B5%E8%84%91%E5%9F%8E%E8%B4%9F%E4%B8%80%E6%A5%BCB-03) | 综合音频 | [芙蓉区解放东路华海电脑城一楼004；国储电脑城负一楼B-03](https://uri.amap.com/search?keyword=%E9%95%BF%E6%B2%99%20%E9%87%91%E8%80%B3%E6%9C%B5%20%E8%8A%99%E8%93%89%E5%8C%BA%E8%A7%A3%E6%94%BE%E4%B8%9C%E8%B7%AF%E5%8D%8E%E6%B5%B7%E7%94%B5%E8%84%91%E5%9F%8E%E4%B8%80%E6%A5%BC004%EF%BC%9B%E5%9B%BD%E5%82%A8%E7%94%B5%E8%84%91%E5%9F%8E%E8%B4%9F%E4%B8%80%E6%A5%BCB-03) |
| [小世界hifi馆](https://uri.amap.com/search?keyword=%E9%95%BF%E6%B2%99%20%E5%B0%8F%E4%B8%96%E7%95%8Chifi%E9%A6%86%20%E8%8A%99%E8%93%89%E5%8C%BA%E6%9C%9D%E9%98%B3%E8%B7%AF%E5%87%AF%E9%80%9A%E5%9B%BD%E9%99%855%E6%A0%8B2%E5%8D%95%E5%85%831606) | 综合音频 | [芙蓉区朝阳路凯通国际5栋2单元1606](https://uri.amap.com/search?keyword=%E9%95%BF%E6%B2%99%20%E5%B0%8F%E4%B8%96%E7%95%8Chifi%E9%A6%86%20%E8%8A%99%E8%93%89%E5%8C%BA%E6%9C%9D%E9%98%B3%E8%B7%AF%E5%87%AF%E9%80%9A%E5%9B%BD%E9%99%855%E6%A0%8B2%E5%8D%95%E5%85%831606) |

### 无锡

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [迩东](https://uri.amap.com/search?keyword=%E6%97%A0%E9%94%A1%20%E8%BF%A9%E4%B8%9C%20%E6%A2%81%E6%BA%AA%E5%8C%BA%E4%BA%BA%E6%B0%91%E8%A5%BF%E8%B7%AF25%E5%8F%B7%E7%99%BE%E8%84%91%E6%B1%87%E4%BA%8C%E6%A5%BC2A17) | 综合音频 | [梁溪区人民西路25号百脑汇二楼2A17](https://uri.amap.com/search?keyword=%E6%97%A0%E9%94%A1%20%E8%BF%A9%E4%B8%9C%20%E6%A2%81%E6%BA%AA%E5%8C%BA%E4%BA%BA%E6%B0%91%E8%A5%BF%E8%B7%AF25%E5%8F%B7%E7%99%BE%E8%84%91%E6%B1%87%E4%BA%8C%E6%A5%BC2A17) |
| [吽咖（万象店）](https://uri.amap.com/search?keyword=%E6%97%A0%E9%94%A1%20%E5%90%BD%E5%92%96%EF%BC%88%E4%B8%87%E8%B1%A1%E5%BA%97%EF%BC%89%20%E6%BB%A8%E6%B9%96%E5%8C%BA%E9%87%91%E7%9F%B3%E8%B7%AF88%E5%8F%B7%E5%8D%8E%E6%B6%A6%E4%B8%87%E8%B1%A1%E5%9F%8EL3-32%2F34) | 高端音频+音频潮玩 | [滨湖区金石路88号华润万象城L3-32/34](https://uri.amap.com/search?keyword=%E6%97%A0%E9%94%A1%20%E5%90%BD%E5%92%96%EF%BC%88%E4%B8%87%E8%B1%A1%E5%BA%97%EF%BC%89%20%E6%BB%A8%E6%B9%96%E5%8C%BA%E9%87%91%E7%9F%B3%E8%B7%AF88%E5%8F%B7%E5%8D%8E%E6%B6%A6%E4%B8%87%E8%B1%A1%E5%9F%8EL3-32%2F34) |
| [星期格](https://uri.amap.com/search?keyword=%E6%97%A0%E9%94%A1%20%E6%98%9F%E6%9C%9F%E6%A0%BC%20%E6%A2%81%E6%BA%AA%E5%8C%BA%E4%BA%BA%E6%B0%91%E4%B8%AD%E8%B7%AF111%E5%8F%B7%E8%8B%8F%E5%AE%81%E5%B9%BF%E5%9C%BA%E8%8B%8F%E5%AE%81%E6%98%93%E8%B4%AD1%E6%A5%BC) | 综合音频 | [梁溪区人民中路111号苏宁广场苏宁易购1楼](https://uri.amap.com/search?keyword=%E6%97%A0%E9%94%A1%20%E6%98%9F%E6%9C%9F%E6%A0%BC%20%E6%A2%81%E6%BA%AA%E5%8C%BA%E4%BA%BA%E6%B0%91%E4%B8%AD%E8%B7%AF111%E5%8F%B7%E8%8B%8F%E5%AE%81%E5%B9%BF%E5%9C%BA%E8%8B%8F%E5%AE%81%E6%98%93%E8%B4%AD1%E6%A5%BC) |

### 常州

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [佰象](https://uri.amap.com/search?keyword=%E5%B8%B8%E5%B7%9E%20%E4%BD%B0%E8%B1%A1%20%E6%AD%A6%E8%BF%9B%E5%8C%BA%E6%B9%96%E5%A1%98%E9%95%87%E8%8A%B1%E5%9B%AD%E8%A1%97301%E5%8F%B7%E4%B8%87%E8%BE%BE%E5%B9%BF%E5%9C%BAsoho%20b1%E5%BA%A71501) | 专业发烧音频 | [武进区湖塘镇花园街301号万达广场soho b1座1501](https://uri.amap.com/search?keyword=%E5%B8%B8%E5%B7%9E%20%E4%BD%B0%E8%B1%A1%20%E6%AD%A6%E8%BF%9B%E5%8C%BA%E6%B9%96%E5%A1%98%E9%95%87%E8%8A%B1%E5%9B%AD%E8%A1%97301%E5%8F%B7%E4%B8%87%E8%BE%BE%E5%B9%BF%E5%9C%BAsoho%20b1%E5%BA%A71501) |
| [万通](https://uri.amap.com/search?keyword=%E5%B8%B8%E5%B7%9E%20%E4%B8%87%E9%80%9A%20%E5%A4%A9%E5%AE%81%E5%8C%BA%E9%93%B6%E6%B2%B3%E6%B9%BE%E7%94%B5%E8%84%91%E6%95%B0%E7%A0%81%E5%9F%8E1%E5%8F%B7%E6%A5%BC516%E5%AE%A4) | 高端定制耳机为主 | [天宁区银河湾电脑数码城1号楼516室](https://uri.amap.com/search?keyword=%E5%B8%B8%E5%B7%9E%20%E4%B8%87%E9%80%9A%20%E5%A4%A9%E5%AE%81%E5%8C%BA%E9%93%B6%E6%B2%B3%E6%B9%BE%E7%94%B5%E8%84%91%E6%95%B0%E7%A0%81%E5%9F%8E1%E5%8F%B7%E6%A5%BC516%E5%AE%A4) |

### 南通

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [玄音电声数码专营店](https://uri.amap.com/search?keyword=%E5%8D%97%E9%80%9A%20%E7%8E%84%E9%9F%B3%E7%94%B5%E5%A3%B0%E6%95%B0%E7%A0%81%E4%B8%93%E8%90%A5%E5%BA%97%20%E5%B4%87%E5%B7%9D%E5%8C%BA%E4%BA%AC%E9%98%B3%E5%B9%BF%E5%9C%BA%E4%B8%80%E6%A5%BC) | 发烧音频 | [崇川区京阳广场一楼](https://uri.amap.com/search?keyword=%E5%8D%97%E9%80%9A%20%E7%8E%84%E9%9F%B3%E7%94%B5%E5%A3%B0%E6%95%B0%E7%A0%81%E4%B8%93%E8%90%A5%E5%BA%97%20%E5%B4%87%E5%B7%9D%E5%8C%BA%E4%BA%AC%E9%98%B3%E5%B9%BF%E5%9C%BA%E4%B8%80%E6%A5%BC) |

### 太原

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [艾瑞克电子](https://uri.amap.com/search?keyword=%E5%A4%AA%E5%8E%9F%20%E8%89%BE%E7%91%9E%E5%85%8B%E7%94%B5%E5%AD%90%20%E9%9D%92%E9%BE%99%E7%94%B5%E8%84%91%E5%9F%8E%E4%B8%80%E5%B1%82E%E5%8C%BA27%E5%8F%B7) | 综合音频 | [青龙电脑城一层E区27号](https://uri.amap.com/search?keyword=%E5%A4%AA%E5%8E%9F%20%E8%89%BE%E7%91%9E%E5%85%8B%E7%94%B5%E5%AD%90%20%E9%9D%92%E9%BE%99%E7%94%B5%E8%84%91%E5%9F%8E%E4%B8%80%E5%B1%82E%E5%8C%BA27%E5%8F%B7) |

### 延吉

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [畅响耳机店](https://uri.amap.com/search?keyword=%E5%BB%B6%E5%90%89%20%E7%95%85%E5%93%8D%E8%80%B3%E6%9C%BA%E5%BA%97%20%E5%BB%B6%E8%BE%B9%E6%9C%9D%E9%B2%9C%E6%97%8F%E8%87%AA%E6%B2%BB%E5%B7%9E%E5%BB%B6%E5%90%89%E5%B8%82%E5%8F%82%E8%8A%B1%E8%A1%97134-5%E5%8F%B7%E9%99%84%E8%BF%91) | 综合音频 | [延边朝鲜族自治州延吉市参花街134-5号附近](https://uri.amap.com/search?keyword=%E5%BB%B6%E5%90%89%20%E7%95%85%E5%93%8D%E8%80%B3%E6%9C%BA%E5%BA%97%20%E5%BB%B6%E8%BE%B9%E6%9C%9D%E9%B2%9C%E6%97%8F%E8%87%AA%E6%B2%BB%E5%B7%9E%E5%BB%B6%E5%90%89%E5%B8%82%E5%8F%82%E8%8A%B1%E8%A1%97134-5%E5%8F%B7%E9%99%84%E8%BF%91) |

### 长春

| 店铺 | 产品方向 | 地址 |
| --- | --- | --- |
| [海天](https://uri.amap.com/search?keyword=%E9%95%BF%E6%98%A5%20%E6%B5%B7%E5%A4%A9%20%E5%AE%BD%E5%9F%8E%E5%8C%BA%E4%BA%BA%E6%B0%91%E5%A4%A7%E8%A1%97280%E5%8F%B7%E9%95%BF%E6%98%A5%E7%A7%91%E6%8A%80%E5%9F%8E4%E6%A5%BC4D05-3%E5%8F%B7) | 专业 HiFi 体验 | [宽城区人民大街280号长春科技城4楼4D05-3号](https://uri.amap.com/search?keyword=%E9%95%BF%E6%98%A5%20%E6%B5%B7%E5%A4%A9%20%E5%AE%BD%E5%9F%8E%E5%8C%BA%E4%BA%BA%E6%B0%91%E5%A4%A7%E8%A1%97280%E5%8F%B7%E9%95%BF%E6%98%A5%E7%A7%91%E6%8A%80%E5%9F%8E4%E6%A5%BC4D05-3%E5%8F%B7) |

---

# 如何解决问题

Source: src/content/docs/zh/docs/how-to-solve-problems.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/how-to-solve-problems/
Description: 遇到 ECHO 问题时，如何截图、复制控制台报错、描述复现步骤，并让别人真的能帮你定位。

遇到问题时，最重要的不是先猜原因，而是把现场保留下来。能解决问题的人需要看到完整界面、原始报错、复现步骤和你的环境信息。只给一小片截图，或者只说“这里不行”，基本等于让别人隔空算命。

## 先说结论

请按这个顺序准备信息：

1. **截图截完整**：不要只截一个按钮、一个弹窗角落或一行红字。
2. **打开控制台**：去 `设置 -> 通用` 打开控制台或调试控制台。
3. **复现一次问题**：重新执行触发问题的操作。
4. **复制错误报告**：把控制台报错、诊断报告或复制报告内容原样发出来。
5. **写清楚你做了什么**：从打开页面到出现问题，每一步都写出来。

如果你只截图一小片，怕是世界上最聪明的 Claude Mythos 都无法解决。因为它看不到页面状态、看不到你点了什么、看不到报错来源，也不知道这是播放、曲库、网络、驱动、插件还是设置问题。

## 截图应该截什么

截图要能让别人知道“你在哪、你做了什么、软件现在是什么状态”。请尽量截完整窗口，而不是只截局部。

完整截图通常应该包含：

1. 当前页面标题或左侧导航。
2. 出错的区域。
3. 底部播放器状态，例如是否在播放、进度条是否走、音量是否静音。
4. 当前输出设备、输出模式、扫描进度、远程源状态或插件状态。
5. 弹窗、提示条、红色报错、空白区域或一直转圈的位置。
6. 如果问题和设置有关，请截到相关设置项，不要只截开关本身。

不推荐：

| 不要这样 | 为什么没用 |
| --- | --- |
| 只截一个红色感叹号 | 看不到它属于哪个页面、哪个功能。 |
| 只截“失败”两个字 | 不知道失败的是播放、扫描、登录、下载还是连接。 |
| 只截按钮 | 不知道按钮前后状态，也不知道你想完成什么。 |
| 只截聊天记录里的转述 | 转述会丢失错误码、路径、设备名和真实上下文。 |
| 只发“我这里也一样” | 不知道你的系统、版本、设备和复现步骤是否一样。 |

如果涉及动态问题，例如闪退、卡顿、切歌失败、扫描进度卡住、MV 黑屏、远程源连接失败，录屏通常比截图更有用。

## 控制台报错比口头描述重要

很多问题表面看起来一样，真实原因完全不同。

比如“没声音”可能是：

1. 输出设备选错。
2. Windows 应用音量被静音。
3. WASAPI Exclusive 被其它播放器占用。
4. ASIO 驱动打开失败。
5. DSD 文件无法被当前输出链路处理。
6. DSP、ReplayGain、变速或声道设置导致异常。
7. 文件损坏或解码失败。

只说“没声音”没有排查价值。控制台里的错误码、设备名、文件路径、音频格式、请求地址、HTTP 状态码、插件名和堆栈信息，才是真正能定位问题的证据。

## 如何复制错误报告

遇到问题时请这样做：

1. 打开 ECHO。
2. 进入 `设置 -> 通用`。
3. 打开控制台、开发控制台或调试控制台相关选项。
4. 回到出问题的页面。
5. 重新执行一次会触发问题的操作。
6. 复制控制台里的报错原文，或使用页面里的复制诊断、导出报告、复制错误报告按钮。
7. 把复制出来的内容和完整截图一起发出。

如果报错很长，不要自己删改。可以折叠、打包、粘贴到文本文件里，但不要只截最后一行。很多时候真正有用的是第一条错误、错误前后的设备状态、请求 URL、文件路径或调用栈。

## 复现步骤要能让别人照着做

好的复现步骤应该像这样：

```text
1. 打开 ECHO。
2. 进入 设置 -> 音频输出。
3. 输出模式选择 WASAPI Exclusive。
4. 设备选择 xxx USB DAC。
5. 播放这首 FLAC：文件名 / 格式 / 采样率。
6. 点击下一首后无声，进度条继续走。
7. 控制台出现这段报错：……
```

不好的复现步骤是：

```text
我就正常用，然后它坏了。
```

“正常用”不是步骤。别人不知道你点了哪里、开了哪些设置、文件是什么格式、设备是什么、问题从什么时候开始。

## 一次只改一个变量

排查问题时，不要一边换输出模式、一边开 DSD、一边改 EQ、一边换驱动、一边重扫曲库。这样即使问题消失了，也不知道到底是哪一步起作用。

建议顺序：

1. 先保存完整截图和报错。
2. 只改一个设置。
3. 复现一次。
4. 记录结果。
5. 再改下一个设置。

播放问题先回到 `System` 或 `WASAPI Shared`。曲库问题先用 3 到 10 首歌的小文件夹复现。远程源问题先确认浏览器或原服务客户端能否访问。插件问题先禁用对应插件再看是否恢复。

## 不要先做高风险操作

这些操作通常不是第一步：

1. 删除数据库。
2. 清空曲库缓存。
3. 重装 ECHO。
4. 重装声卡驱动。
5. 删除插件目录。
6. 改系统权限、注册表或杀毒软件规则。

它们可能会破坏现场，让问题更难复现。除非你已经备份，或者有人根据日志明确说明为什么必须这样做，否则先不要动。

## 最小可用问题报告

赶时间时，至少复制这段填一下：

```text
ECHO 版本：
Windows 版本：
问题页面：
我想做什么：
实际发生了什么：
复现步骤：
1.
2.
3.

完整截图：
控制台/错误报告：
我已经试过：
```

如果你想让 AI 帮你整理，也可以把上面内容发给 AI，并要求：

```text
请不要猜测根因。请先整理确定事实、缺失信息、可能原因和低风险排查步骤。
```

## 最后一句

解决问题靠证据，不靠猜。完整截图、控制台报错、复现步骤、版本和环境信息，是让问题被快速定位的最低成本。信息越完整，修复越快；信息越碎，大家越只能围着一句“不能用”打转。

---

# 导入音源

Source: src/content/docs/zh/docs/import-audio-sources.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/import-audio-sources/
Description: 保姆级说明：本地歌曲、远程曲库、插件音源分别怎么导入，导入后去哪里检查。

这页只解决一个问题：你手里有音乐，或者你手里有一个来源，怎么把它放进 ECHO Next 里用。

先别急着乱点。ECHO 里大家口头说的“音源”，可能是三种完全不同的东西：

| 你手里有什么 | 去哪里操作 | 导入后在哪里看 | 先做什么 |
| --- | --- | --- | --- |
| 本机里的 MP3、FLAC、WAV、M4A 等音乐文件 | `导入文件夹` | `收件箱`、`歌曲`、`专辑` | 先导入一个小测试文件夹 |
| NAS、WebDAV、Jellyfin、Emby、Subsonic、Navidrome 等远程音乐库 | `远程曲库` | `远程曲库`，或歌曲页的远程来源切换 | 先测试连接，再浏览小目录 |
| 第三方插件提供的搜索音源 | `插件` | `在线搜索` 里的插件音源 | 先看权限，再启用插件 |

不要把这三件事混在一起。本地文件夹不是远程曲库，远程曲库不是插件音源，插件音源也不会自动变成你的本地歌曲。

## 第一种：导入本地音乐文件夹

这是新手最应该先跑通的方式。你电脑里已经有音乐文件，就从这里开始。

### 1. 先准备一个测试文件夹

不要第一次就导入整个硬盘。先在电脑上建一个小文件夹，例如：

```text
D:\Music\Test
```

往里面放 3 到 10 首确定能正常播放的歌。建议至少包含：

| 文件 | 为什么 |
| --- | --- |
| 一首普通 MP3 | 最容易验证基础播放 |
| 一首普通 FLAC | 验证无损、标签和封面 |
| 一首带封面的歌 | 验证专辑墙和播放器封面 |

第一轮不要放这些东西：

| 不要放什么 | 为什么 |
| --- | --- |
| 整个 `C:\` | 会扫到系统文件、软件缓存和一堆没用目录 |
| 整个下载目录 | 里面经常混着安装包、压缩包、临时文件 |
| 网盘占位文件 | 看起来在本机，实际还没下载下来 |
| 损坏文件或超冷门格式 | 第一轮先证明基础流程能跑通 |
| `.zip`、`.rar`、压缩包 | 导入文件夹不是解压工具 |
| 歌曲快捷方式 | ECHO 要读真实音频文件，不是快捷方式 |

### 2. 点左侧的 `导入文件夹`

1. 打开 ECHO Next。
2. 看左侧菜单。
3. 找到 `导入文件夹`。
4. 点它。
5. Windows 会弹出一个文件夹选择窗口。
6. 在窗口里找到刚才的 `D:\Music\Test`。
7. 选中这个文件夹。
8. 点 `选择文件夹`、`确定` 或类似按钮。

注意：要选文件夹，不是选里面某一首歌。你如果点进文件夹后只盯着一首歌发呆，导入窗口可能没有选中正确目录。

### 3. 等它扫描

导入后，ECHO 会读取文件、标签、封面、时长和格式信息，然后写入曲库索引。

扫描时先别做这些事：

1. 不要拔移动硬盘。
2. 不要移动刚导入的文件夹。
3. 不要立刻重命名一堆文件。
4. 不要同时开全量远程索引。
5. 不要一边扫描一边疯狂点重建数据库。

几首歌应该很快。大曲库慢是正常的，但测试文件夹不应该卡很久。

### 4. 去 `收件箱` 和 `歌曲` 检查

导入完成后按这个顺序看：

1. 打开 `收件箱`。
2. 看刚才导入的歌有没有出现。
3. 打开 `歌曲`。
4. 搜一首歌名。
5. 找一首普通 MP3。
6. 双击播放。
7. 看底部播放器有没有变成这首歌。
8. 看进度条有没有动。
9. 听有没有声音。

看到这些就算成功：

| 位置 | 正常表现 |
| --- | --- |
| `收件箱` | 能看到新导入的歌 |
| `歌曲` | 能看到标题、艺术家、时长 |
| `专辑` | 有专辑信息的歌能归到专辑里 |
| 底部播放器 | 显示当前播放歌曲 |
| 进度条 | 播放后会往前走 |
| 声音 | 耳机、音箱或 DAC 有声音 |

如果看不到歌，先查这些：

| 问题 | 怎么查 |
| --- | --- |
| 选错文件夹 | 回到 `导入文件夹`，确认选的是有音乐的那一层 |
| 文件夹是空的 | 用资源管理器打开目录，确认里面真有音频文件 |
| 网盘文件没下载 | 在资源管理器里先把文件下载到本机 |
| 搜索框有残留 | 清空 `歌曲` 页面搜索框 |
| 扫描没结束 | 等状态结束后再看 |
| 文件格式太奇怪 | 先用普通 MP3 / FLAC 验证 |

如果进度条在动但没声音，不要先动数据库。先查系统音量、ECHO 底部音量、输出设备和 `设置 -> 播放`。

## 第二种：添加远程曲库

远程曲库适合你已经有自己的服务器或网盘服务，例如 WebDAV、NAS、Jellyfin、Emby、Subsonic 或 Navidrome。

你需要先准备好这些信息：

| 需要什么 | 示例 |
| --- | --- |
| 来源类型 | WebDAV、Jellyfin、Emby、Subsonic |
| 显示名称 | `Home NAS`、`My WebDAV` |
| 服务器地址 | `https://example.com/dav/music/` |
| 账号 | 你的服务账号 |
| 密码或 token | 对应服务的密码、应用密码或 token |
| 音乐目录 | 服务器里真正放音乐的目录 |

操作顺序：

1. 打开 `远程曲库`。
2. 选择真实的来源类型。
3. 填一个你能看懂的显示名称。
4. 填服务器地址。
5. 填账号、密码或 token。
6. 如果有根目录选项，填音乐所在目录。
7. 先点 `测试连接`。
8. 测试成功后再保存。
9. 先浏览一个小目录。
10. 播放一首普通 MP3 或 FLAC。
11. 确认能浏览、能播放后，再开启索引或同步。

远程曲库第一轮不要直接全量索引整个 NAS。远程慢不一定是 ECHO 坏了，可能是网络、服务器、证书、转码、硬盘休眠或权限配置的问题。

远程连接失败时按这个顺序看：

| 现象 | 先检查 |
| --- | --- |
| 连不上 | 地址、端口、账号、密码、证书 |
| 能连但看不到文件 | 根目录、账号权限、服务端媒体库配置 |
| 能看但不能播 | 文件权限、转码设置、网络带宽 |
| 很慢 | Wi-Fi、NAS 性能、服务端休眠、代理 |
| 只有部分文件 | 服务端索引、文件格式、目录权限 |

请只连接你有权访问和使用的内容。ECHO 不会帮你绕过付费、版权、地区、DRM 或平台访问限制。

## 第三种：导入插件音源

插件音源是插件提供的搜索候选和播放解析能力。它不是 ECHO 官方音源，也不是下载站入口。

你可能拿到两种东西：

| 你拿到什么 | 怎么处理 |
| --- | --- |
| ECHO 插件包 `.json` | 在 `插件` 页面使用导入入口 |
| 一个插件文件夹 | 放进 ECHO 插件页打开的插件目录 |

### 导入插件包

1. 打开 ECHO Next。
2. 进入 `插件`。
3. 找到导入插件包的入口。
4. 选择 `.json` 插件包。
5. 导入后先不要急着启用。
6. 点开插件详情。
7. 看它申请了哪些权限。
8. 确认来源可信后再启用。
9. 启用后看插件日志有没有报错。
10. 去 `在线搜索`，选择对应插件音源搜索。

### 放入插件文件夹

1. 打开 `插件` 页面。
2. 点击 `打开目录`。
3. 系统会打开真实插件目录。
4. 把插件文件夹放进去。
5. 回到 ECHO，点击刷新。
6. 点开插件详情。
7. 看权限。
8. 启用。
9. 看日志。
10. 到 `在线搜索` 里试插件音源。

不要自己猜插件目录。以 ECHO 插件页打开的目录为准。

看到这些权限要多想一下：

| 权限 | 为什么要谨慎 |
| --- | --- |
| `network` | 插件会访问外部网络 |
| `sources:provide` | 插件会提供自定义音源候选 |
| `library:read` | 插件会读取曲库公开字段 |
| `settings:write` | 插件可能修改设置 |
| `library:write` | 插件可能写曲库，风险更高 |

来源不明的高权限插件不要启用。插件音源只应该返回合法可访问的 `http` / `https` 音频 URL，不应该绕过平台授权、会员限制、版权限制或访问控制。

## 导入后到底去哪里找

| 你刚做了什么 | 去哪里确认 |
| --- | --- |
| 导入本地文件夹 | `收件箱`、`歌曲`、`专辑` |
| 重扫本地文件夹 | `歌曲`、`文件夹`、对应专辑 |
| 添加远程曲库 | `远程曲库`，以及歌曲页的远程来源切换 |
| 启用插件音源 | `在线搜索` 里的插件音源 |
| 下载并导入歌曲 | `下载` 任务完成后看 `收件箱` 或 `歌曲` |

如果你期待在 `歌曲` 里看到东西，但你实际只是启用了插件音源，那是不会自动出现的。插件音源通常要在 `在线搜索` 里搜索，只有你明确保存、下载或导入后的内容，才会进入本地曲库。

## 最常见的错误

| 错误操作 | 正确做法 |
| --- | --- |
| 第一次就导入整个硬盘 | 先导入 3 到 10 首歌的小文件夹 |
| 把文件夹路径选错一层 | 选真正包含音乐文件的目录 |
| 把网盘占位文件当本地文件 | 先下载到本机 |
| 以为导入就是复制文件 | 导入主要是建立索引，源文件仍在原位置 |
| 扫描没结束就说没有歌 | 等扫描结束，再看 `收件箱` 和 `歌曲` |
| 播放没声音就清数据库 | 先查音量、输出设备和输出模式 |
| 把远程曲库当本地文件夹导入 | 远程服务去 `远程曲库` 添加 |
| 以为插件音源是官方音乐库 | 插件只是第三方扩展，责任和合法性要自己确认 |
| 插件启用后找不到歌 | 去 `在线搜索` 选择插件音源，不是去本地 `歌曲` 硬找 |
| 连续启用一堆插件排错 | 一次只启用一个，先看日志 |

## 最短路线

如果你只想赶紧听到第一首歌，按这条做：

1. 建一个 `D:\Music\Test` 文件夹。
2. 放几首确定正常的 MP3 / FLAC。
3. 打开 ECHO Next。
4. 点左侧 `导入文件夹`。
5. 选中 `D:\Music\Test`。
6. 等扫描结束。
7. 打开 `收件箱` 看有没有歌。
8. 打开 `歌曲`。
9. 双击一首 MP3。
10. 底部进度条动、有声音，就完成。

这一套跑通之后，再导入完整曲库、添加远程曲库或启用插件音源。先把最小流程跑通，后面的排查才不会变成乱猜。

---

# ECHO 文档

Source: src/content/docs/zh/docs/index.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/
Description: ECHO Next 官方文档入口：能力总览、格式支持、HiFi 输出、远程曲库、插件扩展和新用户路线。

## 维护边界：先读文档，不支持绕权

这套文档不是摆设。安装、导入音源、曲库、远程来源、插件、音频输出、排障和法律边界已经写在文档里的内容，请先自己读。

如果问题在文档里已经有明确答案，但仍然反复提问、拒绝按文档操作、让维护者代读文档，相关讨论会直接关闭，账号会被屏蔽，不再单独解释。

如果已经认真看完文档，仍然不会操作、仍然需要一对一指导、仍然需要作者单独带你排查，请先购买 [ECHO Pro](./echo-pro/)。但购买 Pro 也不承诺免费人工陪跑；远程协助按次另收 `50 元/次`，且只处理合法合规、非绕权的问题。

任何妄图违反 DMCA、版权、DRM、会员、付费、地区、账号授权或平台访问控制的请求，一律拉黑。包括但不限于：索要侵权音源、盗链、破解、绕过试听限制、规避会员限制、抓取受保护内容、要求适配灰色来源或让插件承担违法获取内容的功能。

ECHO 可以帮助你管理和播放你有权使用的内容；不会帮助你获取、下载、破解、转存或规避任何没有合法授权的内容。

## 快速导航

如果你是带着具体问题来的，先看 [快速导航](./quick-navigation/)。它按“我要做什么”和“遇到什么问题”整理入口，适合快速找到安装、导入音源、曲库、音频输出、远程来源、插件、Pro、排障和工程文档。

ECHO Next 是一套面向本地音乐库、HiFi 输出、长期曲库维护和可扩展玩法的桌面音乐工作台。它的目标不是只完成基础播放，而是把曲库、播放、输出、远程来源、插件和文档支持整合成一套长期可维护的桌面应用体系。

有人看到 Electron 就急着下结论，说这不过是“纯网页播放器”。这种说法听起来很懂技术，实际只是把框架名当成全部工程事实；看见井口一圈光，就以为外面的世界只有那么大。ECHO 使用 Electron 作为桌面外壳和跨平台运行基础，但它真正承担能力的是主进程服务、本地数据库、媒体处理管线、原生音频宿主、系统音频接口、远程源服务、插件沙箱和诊断体系。把这些都忽略掉，只剩一句“Electron 等于网页”，不是评价软件，是暴露视野。

它采用桌面音乐工作台的工程结构：前台是 React + TypeScript 的现代界面，后台是 Electron 主进程、本地数据库、媒体处理管线、原生音频宿主、远程源服务、插件沙箱和官网更新链路。ECHO 关注的不只是界面展示，而是把“音乐文件从硬盘进入曲库、从曲库进入播放队列、从播放队列进入音频设备、从音频设备进入耳机或 DAC”这条链路尽量做完整、做清楚、做可诊断。

它能扫盘、建库、读标签、管封面、聚合专辑、维护艺术家索引、记录播放历史、管理歌单、连接远程曲库、投送 DLNA 数播、导入平台歌单、匹配歌词和 MV、运行受控插件、生成主题、调 EQ / DSP、处理 ReplayGain / Headroom / Crossfade / Automix，并尽量把 WASAPI、ASIO、DSD、HQPlayer、bit-perfect、重采样、设备占用和失败原因这些容易混淆的音频概念说明清楚。

想直接上手，可以跳到 [快速开始](./quick-start/)；想系统学习，可以看 [用户教程](./user-guide/)；想了解工程结构和技术栈，可以看 [技术栈与能力支持](./engineering/tech-stack-and-capabilities/)。

## 设计初衷与性能取舍

ECHO 的初衷完全不是“轻量”。它要做的是功能尽可能完整的桌面音乐播放器，而不是为了安装包尺寸、内存数字或所谓极简性能指标不断砍功能、砍体验、砍扩展能力。曲库管理、HiFi 输出、歌词、MV、远程来源、插件、主题、诊断和官网更新链路，本来就不是一个只追求小体积的项目能完整承载的方向。

关于性能，作者在 1w+ 曲库环境下观察到的日常状态约为：内存占用约 1GB，CPU 占用约 0.4%。在 2026 年，作者并不认为 1GB 内存是一个很大的桌面应用占用；如果你无法接受这样的功能取舍和资源占用，还请另寻他法。

## 产品定位

ECHO Next 是一个以本地曲库为核心、以稳定播放为底线、以 HiFi 输出和可扩展生态为上限的开源桌面音乐系统。

它同时覆盖这些层面的完整工程：

- 曲库层：文件夹导入、增量扫描、SQLite 索引、分页查询、封面缓存、缺失文件识别、重复歌曲维护、标签事实和网络候选分离。
- 媒体层：音频标签、封面、歌词、MV、时长、编码、采样率、位深、封装格式、同目录资源和在线候选的统一整理。
- 播放层：播放队列、历史、收藏、歌单、系统媒体控制、错误恢复、音频状态提示和设备诊断。
- 输出层：System、WASAPI Shared、WASAPI Exclusive、ASIO、DSD / DoP、HQPlayer，以及它们背后的驱动、设备、重采样和 bit-perfect 边界。
- 处理层：EQ、Preamp、ReplayGain、Headroom、声道平衡、重采样、变速、Crossfade、Automix，不把处理过的声音假装成原始直通。
- 网络层：WebDAV、NAS、Jellyfin、Emby、Subsonic / Navidrome、DLNA / UPnP、AirPlay 1 / RAOP 兼容链路、网络电台、在线元数据和平台歌单导入。
- 扩展层：插件 manifest、权限确认、VM 沙箱、provider、命令、面板、设置、存储、主题预设和受控网络 API。
- 维护层：日志、健康报告、缓存统计、插件错误、音频设备状态、危险操作确认、问题反馈辅助和官网自动更新源。

简单说，ECHO 做的是“音乐库 + 播放器 + HiFi 输出 + 插件生态 + 文档官网”的完整组合，不是单点功能堆叠。

## 能力总览

| 模块 | ECHO 能做什么 |
| --- | --- |
| 本地曲库 | 文件夹导入、增量扫描、歌曲、专辑、艺术家、文件夹、收件箱、搜索、排序、分页、封面缓存、缺失文件识别 |
| 标签与封面 | 读取标题、艺术家、专辑、专辑艺术家、曲序、碟号、年份、流派、时长、编码、采样率、位深、嵌入封面和同目录封面 |
| 播放体验 | 播放队列、底部播放器、播放历史、收藏、歌单、系统媒体控制、错误恢复、播放诊断 |
| HiFi 输出 | System、WASAPI Shared、WASAPI Exclusive、ASIO、DSD / DoP、HQPlayer 工作流、bit-perfect 状态提示 |
| 声音处理 | EQ、Preamp、ReplayGain、Headroom、声道平衡、重采样、变速、Crossfade、Automix |
| 歌词 | 本地歌词、在线候选、翻译、罗马音、歌词偏移、桌面歌词和播放页展示 |
| MV | MV 匹配、MV 播放页、音画同步相关设置和视频编码边界提示 |
| 远程曲库 | WebDAV、NAS、Jellyfin、Emby、Subsonic / Navidrome、远程浏览、索引和播放 |
| 连接与投送 | DLNA / UPnP 数播串流、AirPlay 1 / RAOP 兼容链路、局域网渲染器发现、外部设备播放控制 |
| 在线与歌单 | 网易云、QQ 音乐、Spotify 歌单导入，Bilibili 收藏、YouTube 播放列表、SoundCloud sets 导入 |
| 插件生态 | 本地插件、命令、provider、面板、设置、存储、主题预设和受控网络 API |
| 主题外观 | 内置主题、自定义主题、AI 主题 JSON、插件主题、透明度、圆角、模糊、动效和字体风格 |
| 诊断维护 | 日志、曲库健康报告、缓存统计、音频设备状态、插件错误、危险操作确认和问题反馈辅助 |

## 详细能力清单

如果你想快速确认 ECHO 当前覆盖了哪些能力，可以先看这张清单。

| 能力线 | 具体覆盖 |
| --- | --- |
| 曲库入口 | 导入文件夹、歌曲列表、专辑墙、艺术家页、文件夹页、收件箱、收藏、历史、播放队列、歌单 |
| 大曲库能力 | 增量扫描、分页查询、虚拟列表、封面缓存、后台任务、重扫、缺失文件识别、移动修复候选、重复歌曲筛查 |
| 元数据能力 | 标题、艺术家、专辑、专辑艺术家、曲序、碟号、年份、流派、时长、编码、采样率、位深、路径、来源 |
| 封面能力 | 嵌入封面、同目录封面、网络候选、本地缓存、缩略图、大图缓存、默认封面 |
| 搜索能力 | 标题、艺术家、专辑、路径、中文拼音、繁简转换、日文假名 / 罗马音辅助、别名和候选补全方向 |
| 播放控制 | 播放、暂停、切歌、队列、收藏、历史、系统媒体控制、进度状态、错误恢复 |
| 高级播放 | ReplayGain、EQ、Preamp、Headroom、声道平衡、重采样、变速、Crossfade、Automix |
| HiFi 输出 | System、WASAPI Shared、WASAPI Exclusive、ASIO、DSD / DoP、HQPlayer、bit-perfect 状态说明 |
| 歌词能力 | 本地歌词、在线歌词候选、翻译、罗马音、偏移校准、桌面歌词、播放页歌词 |
| MV 能力 | MV 匹配、MV 播放页、音画同步设置、视频编码边界提示 |
| 远程曲库 | WebDAV、NAS、Jellyfin、Emby、Subsonic、Navidrome、远程浏览、索引、播放 |
| 局域网连接 | DLNA / UPnP 发现、数播投送、渲染器控制、外部设备播放边界 |
| 歌单导入 | 网易云音乐、QQ 音乐、Spotify 歌单，Bilibili 收藏、YouTube 播放列表、SoundCloud sets |
| 插件系统 | 插件包导入、manifest 校验、权限模型、命令、provider、面板、设置、存储、主题预设、受控网络 API |
| 主题外观 | 内置主题、自定义主题、AI 主题 JSON、插件主题、透明度、圆角、模糊、动效、字体风格 |
| 诊断维护 | 日志、健康报告、缓存统计、音频设备状态、插件错误、扫描状态、危险操作确认 |
| 发布链路 | 官网、文档、下载页、更新日志、GitHub Release、静态更新 feed、自动更新入口 |

## 格式支持

ECHO 的文件关联和扫描能力覆盖大量常见与进阶音频格式。不是只认 MP3 / FLAC 的轻量壳，而是按本地音乐库长期维护去覆盖主流无损、有损、DSD、容器和进阶格式。

实际能否顺利播放，还取决于文件是否损坏、封装是否标准、解码链路、输出模式、驱动和硬件能力。

| 类型 | 常见格式 |
| --- | --- |
| 常见无损 | FLAC、WAV、ALAC、AIFF |
| 常见有损 | MP3、AAC、M4A、OGG、Opus、WMA |
| 进阶无损 | APE、WavPack / WV、TAK、TTA |
| DSD | DSF、DFF |
| 容器与视频音频 | MP4、M4A、MKV、MOV、WebM、MKA |
| 其它格式 | MPC、CAF、DTS、CUE 等 |

首次验证不要一上来挑战全格式边界。最稳路线是先用 MP3、FLAC、WAV、M4A 跑通导入和播放，再测试 APE、DSD、CUE、高采样率、多声道或远程来源。

## HiFi 输出能力

ECHO 的音频输出不是只给一个设备下拉框。它要回答的是：当前声音从哪里来、被谁处理过、交给哪个后端、设备有没有独占、采样率有没有变化、DSP 有没有介入、为什么它不该被叫作 bit-perfect。

| 输出能力 | 适合谁 |
| --- | --- |
| System | 普通电脑、蓝牙耳机、笔记本扬声器、第一次排障 |
| WASAPI Shared | Windows 日常听歌、常见 USB DAC、长期稳定播放 |
| WASAPI Exclusive | 希望独占设备、按曲目采样率打开 DAC、减少系统混音干扰 |
| ASIO | 原厂专业声卡驱动、录音接口、明确需要 ASIO 的设备 |
| DSD / DoP | DAC 和驱动明确支持 DSD 的用户 |
| HQPlayer | 外部 HQPlayer 升频、滤波、卷积、NAA 或专业播放链路 |

ECHO 会尽量把音频状态说清楚。只要开启 EQ、ReplayGain、变速、声道工具、重采样、系统混音、蓝牙编码或虚拟声卡，就不能把结果叫作严格 bit-perfect。你可以追求更好听，也可以追求更原生，但界面不应该把处理过的声音伪装成原始直通。

如果你只是想稳定听歌，System / WASAPI Shared 就够用；如果你要使用 DAC、独占输出、ASIO、DSD 或 HQPlayer，ECHO 会提供入口，也会把风险和排障顺序说明清楚。高级输出不是单个开关，而是一条需要设备、驱动、格式和设置共同稳定的链路。

## 曲库管理能力

本地曲库是 ECHO 的核心。导入文件夹之后，ECHO 会把文件、标签、封面、专辑、艺术家、播放历史和缓存状态组织成可搜索、可分页、可维护的索引。

它关注的是长期使用：

- 新歌进入 `收件箱`，方便先检查再归档。
- 歌曲、专辑、艺术家、文件夹都能作为不同入口。
- 大列表不应一次性塞满界面，而要分页、虚拟滚动和缓存。
- 标签、封面、网络候选和本地事实要分清优先级。
- 文件缺失、移动、重复、封面异常和标签混乱都应该能诊断，而不是只让用户重建数据库。

## 远程源、歌单和在线能力

ECHO 支持远程和在线能力，但它们是扩展，不是盗链器或下载器。

| 能力 | 支持方向 |
| --- | --- |
| WebDAV / NAS | 浏览和播放你有权访问的远程文件 |
| Jellyfin / Emby | 连接自己的媒体服务器和音乐库 |
| Subsonic / Navidrome | 以个人音乐服务方式浏览远程曲库 |
| DLNA / UPnP | 把当前歌曲投送到局域网数播、功放、电视或渲染器 |
| AirPlay | AirPlay 1 / RAOP 兼容链路；暂不支持 AirPlay 2 |
| 网络电台 | 播放公开网络电台流 |
| 歌单导入 | 读取网易云、QQ 音乐、Spotify 等平台中你可访问的歌单信息 |
| 视频收藏导入 | 导入 Bilibili 收藏、YouTube 播放列表、SoundCloud sets 作为可浏览集合 |
| 在线元数据 | 提供标题、艺术家、专辑、封面、歌词等候选 |

这些能力必须遵守版权、账号、地区、服务条款和访问权限。ECHO 官方不提供音乐下载服务，不提供用于获取音乐内容的下载功能，不托管、分发、售卖或镜像受版权保护的音频内容，也不支持绕过会员、破解权限或规避平台访问控制。插件音源接口只是技术扩展点，不代表官方音源或官方背书；第三方插件、接口、账号、URL 或内容来源产生的法律责任由接入者自行承担。

## 插件、主题和可扩展玩法

ECHO 的插件系统不是“随便跑脚本”的危险入口，而是有 manifest、权限、沙箱、命令、provider、面板和受控网络 API 的本地扩展机制。

插件可以做这些事：

- 注册用户手动触发的命令。
- 提供歌词、封面、元数据或自定义音源候选。
- 显示受控插件面板。
- 保存插件自己的设置和小型数据。
- 贡献主题预设，让用户继续微调。

插件不能直接操作 SQLite、真实文件系统、主应用 DOM、音频热路径或原生输出设备。能扩展，但不能牺牲播放稳定性。

主题方面，ECHO 支持内置主题、自定义主题和 AI 生成主题 JSON。你可以调整颜色、透明度、圆角、模糊、字体和动效，但主题仍然要遵守结构化格式，不是随便把一段 CSS 扔进应用里。

## 先看哪里

| 你现在想做什么 | 推荐入口 |
| --- | --- |
| 下载并安装 ECHO Next | [安装与下载](./install/) |
| 第一次打开软件，连下载和安装也需要一步步看 | [零基础安装启动教程](./zero-basics/) |
| 已经装好软件，不知道先点哪里 | [快速开始](./quick-start/) |
| 想系统看完整使用教程 | [用户教程](./user-guide/) |
| 想导入、整理、维护本地曲库 | [曲库管理](./library/) |
| 想导入网易云、QQ 音乐、Spotify 等歌单 | [歌单导入教程](./playlist-import/) |
| 想调输出设备、WASAPI、ASIO、bit-perfect | [音频输出](./audio-output/) |
| 想理解 EQ、DSP、削波和 Headroom | [EQ 指南](./audio-output/eq/) |
| 想连接 WebDAV、Jellyfin、Emby、Subsonic，或需要云服务器跑 Navidrome | [远程来源](./remote-sources/) 和 [云盘 / Subsonic 教程](./cloud-drive/)；没有服务器可看雨云推荐 |
| 想确认下载、插件音源和法律责任边界 | [下载与插件音源法律边界](./download-and-plugin-source-boundary/) |
| 想把 ECHO 投到数播、功放或电视 | [DLNA / 数播串流教程](./dlna-connect/) |
| 想了解 AirPlay 支持边界 | [AirPlay 支持边界](./airplay-connect/) |
| 想写插件或看权限边界 | [插件创作指南](./plugins/) |
| 想做主题或让 AI 帮你生成主题 | [AI 主题生成指南](./theme-ai-guide/) |
| 想反馈 bug 或让别人帮你排查 | [如何解决问题](./how-to-solve-problems/) |
| 想看工程能力和技术栈 | [技术栈与能力支持](./engineering/tech-stack-and-capabilities/) |

## 新用户建议路线

1. 先看 [安装与下载](./install/)，确认你拿到的是最新版本。
2. 如果连下载、安装、第一次打开都不熟，先看 [零基础安装启动教程](./zero-basics/)。
3. 按 [快速开始](./quick-start/) 导入一个小文件夹，不要一上来扫完整大盘。
4. 确认能播放、能看到封面、能搜索歌曲。
5. 再导入完整曲库。
6. 需要更高级输出时，再看 [音频输出](./audio-output/) 和 [EQ 指南](./audio-output/eq/)。
7. 需要在线能力时，再配置 [远程来源](./remote-sources/)、[歌单导入](./playlist-import/)、[网络电台](./internet-radio/) 或插件。
8. 需要排查问题时，优先带上 ECHO 版本、系统版本、输出设备、文件格式、远程源类型、复现步骤和截图。

如果你只想快速听歌，直接从 [快速开始](./quick-start/) 开始。先跑通，再折腾高级输出、远程源、DSP 和插件，这样最稳。

## 使用 AI 辅助理解

如果你读完仍然不知道怎么操作，可以把相关文档链接、你的系统环境和具体问题交给 AI 辅助理解。下面这些外部链接会在新标签页打开，不会覆盖当前 ECHO 官网页面：

<a href="https://www.doubao.com/chat/" target="_blank" rel="noopener noreferrer">豆包</a> / <a href="https://chat.deepseek.com/" target="_blank" rel="noopener noreferrer">DeepSeek</a> / <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">ChatGPT</a> / <a href="https://claude.ai/" target="_blank" rel="noopener noreferrer">Claude</a>

> 作者不会逐一回答“这个功能怎么用”之类的问题。请先自查本文档和对应页面；如果仍然看不懂，可以把文档链接、系统环境和具体问题交给 AI 辅助理解。排查问题时也不要把所有电脑异常都先归因于 ECHO：例如系统网络异常、驱动、权限、杀软拦截、设备占用等，通常需要先排查本机环境。

---

# 安装与下载

Source: src/content/docs/zh/docs/install.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/install/
Description: 获取 ECHO Next 安装包、理解 GitHub Releases、站内镜像、自动更新和 Windows 安装建议。

这一页说明 ECHO Next 应该从哪里下载、下载后怎么安装，以及为什么官网会同时保留站内下载和 GitHub Releases。

## 下载入口

推荐优先使用官网的 [下载页面](/zh/download/)。这个页面会读取当前站点同步到的最新版本，并给出 Windows 安装包路径。

如果你想直接看发布源，可以打开 GitHub Releases：

[GitHub Releases](https://github.com/Moekotori/ECHO/releases)

GitHub Releases 是发布源，官网下载目录是镜像和自动更新入口。正常情况下，发布后服务器会把安装包同步到本站的 `/update/stable/win/` 路径，下载页面和自动更新都会使用这份镜像。

## Windows 用户怎么选

| 类型 | 适合谁 | 说明 |
| --- | --- | --- |
| 安装包 | 日常长期使用 | 会按正常 Windows 应用方式安装，适合大多数用户 |
| 便携包 | 临时测试、隔离使用 | 放到独立目录运行，不适合所有自动更新场景 |
| GitHub 原始附件 | 想核对发布源的人 | 可直接从 Releases 页面下载，但国内网络可能不稳定 |

大多数用户选安装包即可。下载后双击安装，按提示完成。首次启动时建议先导入一个小音乐文件夹测试，不要马上把整块硬盘都扫进去。

## 国内下载速度

中国大陆用户直接访问 GitHub 大文件附件时，速度可能不稳定，也可能出现连接中断。官网镜像的目的就是减少这种情况：用户访问下载页时优先拿本站已经同步好的安装包，而不是每次都直连 GitHub 附件。

如果官网下载也慢，可以按这个顺序尝试：

1. 先刷新 [下载页面](/zh/download/)，确认是否已经同步到最新版本。
2. 换一个网络环境，例如手机热点或更稳定的宽带。
3. 再尝试 [GitHub Releases](https://github.com/Moekotori/ECHO/releases) 原始附件。
4. 如果两个入口版本号不一致，优先相信 GitHub Releases 是发布源，但请等待官网同步完成后再下载。

## 如何确认拿到的是最新版本

下载页面会显示当前同步到的版本号。GitHub Releases 页面会显示发布源里的最新 tag。

你可以这样判断：

| 检查项 | 应该看到 |
| --- | --- |
| 下载页面版本 | 与最新 Release tag 一致 |
| 安装包文件名 | 包含版本号，例如 `ECHO-NEXT-Setup-26.6.4.exe` |
| 自动更新清单 | `/update/stable/win/latest.yml` 指向同一版本 |
| 更新日志 | [更新日志](/zh/changelog/) 能看到同版本说明 |

如果官网版本落后，通常是同步任务还没跑完。等几分钟后刷新下载页即可。

## 第一次安装建议

1. 从 [下载页面](/zh/download/) 或 [GitHub Releases](https://github.com/Moekotori/ECHO/releases) 获取安装包。
2. 安装前关闭旧版本 ECHO Next。
3. 安装到默认位置即可，除非你明确需要自定义路径。
4. 第一次启动后先导入一个小文件夹测试。
5. 确认能播放、能显示封面、能搜索歌曲。
6. 再导入完整曲库。
7. 如果播放没有声音，先回到默认输出，不要直接清数据库。

## 自动更新怎么工作

ECHO Next 客户端应读取本站的 `/update/stable/win/latest.yml`。这个文件由发布同步流程生成，格式兼容 electron-updater。

同步流程会做这些事：

1. 读取 `https://github.com/Moekotori/ECHO/releases` 的最新发布。
2. 找到 Windows 安装包。
3. 下载到 `public/update/stable/win/`。
4. 计算 electron-updater 需要的 `sha512`。
5. 生成 `/update/stable/win/latest.yml`。
6. 写入站点更新日志内容。

这意味着 GitHub 是源头，官网是更适合普通用户下载和自动更新的入口。

## 安装后遇到问题

| 现象 | 先做什么 |
| --- | --- |
| Windows 提示未知发布者 | 确认来源是官网或 GitHub Releases，不要从第三方网盘下载 |
| 双击没反应 | 重新下载安装包，确认文件没有下载中断 |
| 启动后没声音 | 看 [快速开始](./quick-start/) 和 [音频输出](./audio-output/) |
| 曲库为空 | 先导入一个小文件夹，不要直接扫全盘 |
| 自动更新失败 | 手动访问 [下载页面](/zh/download/) 下载最新安装包 |

如果你要反馈安装问题，请带上版本号、下载入口、Windows 版本、安装包文件名和错误截图。

---

# 网络电台教程

Source: src/content/docs/zh/docs/internet-radio.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/internet-radio/
Description: 如何在 ECHO 里听网络电台、保存直播流 URL、去哪找电台，以及电台播放排障。

这份教程写给想用 ECHO 听电台的人。ECHO 的网络电台功能很直接：**把一个可以直接播放的 `http://` 或 `https://` 直播流 URL 填进去，然后播放。**

先把最容易混淆的地方说清楚：电台网页不等于电台直播流。很多网站页面上有播放按钮，但页面地址通常不能直接填进 ECHO。ECHO 需要的是音频流地址，常见形式像这样：

```text
https://example.com/live.mp3
https://example.com/stream
http://example.net:8000/radio
```

## 先说结论

第一次听电台建议这样做：

1. 打开 ECHO 的 `Connect` 页面。
2. 找到 `网络电台` 区域。
3. 先播放内置的示例电台，确认网络和播放链路正常。
4. 想添加自己的电台时，先去公开电台目录找真实直播流 URL。
5. 在 `电台名` 填一个你认得的名字。
6. 在 `直播流 URL` 填 `http/https` 音频流。
7. 点 `播放`。
8. 能稳定播放后点 `收藏`。

ECHO 当前电台规则：

| 项目 | 规则 |
| --- | --- |
| 支持 URL | 只支持 `http://` 和 `https://` |
| 不支持 URL | `mms://`、`rtsp://`、`rtmp://`、带用户名密码的 URL |
| 收藏数量 | 最多保存 40 个 |
| 播放方式 | ECHO 直接播放直播流 |
| 元数据 | ECHO 会用电台名作为标题，艺术家显示为 Internet Radio |
| Connect 状态 | 播放电台前会先断开当前 Connect 投送 |

## ECHO 里怎么听电台

### 播放内置电台

1. 打开 ECHO。
2. 进入 `Connect`。
3. 向下找到 `网络电台`。
4. 默认列表里会有几个电台，例如 ACG、东方同人或 City Pop 方向的直播流。
5. 点击某个电台右侧的播放按钮。
6. 看底部播放器是否显示电台名。
7. 看进度状态是否进入播放。
8. 听是否有声音。

如果内置电台能播，说明 ECHO 的网络播放链路基本正常。之后自定义电台播不了，多半是你填的 URL、网络访问或电台源本身的问题。

### 手动添加电台

1. 在 `电台名` 输入一个短名字，例如 `BBC Radio 6`、`SomaFM Groove Salad`、`NTS 1`。
2. 在 `直播流 URL` 输入真实音频流。
3. 点击 `播放`。
4. 如果能播，再点击 `收藏`。
5. 收藏后会出现在下方列表。
6. 以后点列表里的播放按钮即可。

建议先播放再收藏。很多电台目录会提供多个地址，有些已经失效，有些会跳转，有些只适合浏览器播放。先确认能播，再保存，列表会干净很多。

### 删除电台

1. 在 `网络电台` 收藏列表里找到电台。
2. 点击删除按钮。
3. 这个操作只删除 ECHO 本地收藏，不会影响电台源。

如果删掉的是内置默认电台，后续版本或存储迁移可能会重新补回默认项。自定义电台以 URL 为主键，重复保存同一个 URL 通常会更新同一项。

## 应该去哪找电台

找电台时，请找合法、公开、可直接播放的直播源。不要找盗版转播、私人会员接口、抓包接口或需要绕过地区/付费限制的地址。

### Radio Browser

Radio Browser 是开放的社区电台数据库，适合按国家、语言、标签、码率搜索电台。它通常会显示电台主页和真实流地址。

推荐用法：

1. 打开 Radio Browser 网站或使用支持 Radio Browser 的第三方客户端。
2. 搜索国家、语言、风格或电台名。
3. 找到电台后，优先复制 direct stream / stream URL，而不是网页地址。
4. 如果有多个流，优先选 MP3 或 AAC。
5. 回到 ECHO 粘贴 URL 测试。

适合搜索关键词：

| 想听什么 | 可以搜 |
| --- | --- |
| 日本流行 | `jpop`、`j-pop`、`anime` |
| 古典 | `classical`、`baroque`、`piano` |
| 爵士 | `jazz`、`smooth jazz` |
| 环境音乐 | `ambient`、`downtempo` |
| 新闻 | 国家名 + `news` |
| 城市电台 | 城市名或电台呼号 |

### TuneIn

TuneIn 更像大型电台目录。它适合发现电台和看电台名称，但不一定直接给出可复制的裸流 URL。

推荐用法：

1. 用 TuneIn 找电台名称、地区、语言和官网。
2. 如果 TuneIn 不给直接流地址，就打开电台官网。
3. 在电台官网找 `Listen Live`、`Stream`、`MP3`、`AAC`、`M3U`、`PLS`。
4. 找到真实 URL 后再填进 ECHO。

### SHOUTcast / Icecast 目录

很多网络电台基于 SHOUTcast 或 Icecast。目录页常常能看到 `.m3u`、`.pls` 或 `/stream` 地址。

常见线索：

- `listen.pls`
- `listen.m3u`
- `stream`
- `live.mp3`
- `;stream.mp3`
- `:8000/`

如果目录给的是 `.m3u` 或 `.pls`，它可能是播放列表文件，不是真正音频流。你可以用文本编辑器打开它，里面通常会有真正的 `http/https` 地址。

### 电台官网

很多官方电台会在官网提供直播入口。适合搜索：

```text
电台名 live stream mp3
电台名 listen live m3u
电台名 icecast
电台名 shoutcast
```

如果官网只提供网页播放器，没有公开流地址，不建议抓包硬找。那类地址经常带临时 token、地区限制或广告逻辑，稳定性差，也不适合作为 ECHO 文档支持路径。

## 怎么判断 URL 能不能填

### 看起来比较靠谱的 URL

这些更有机会直接播放：

```text
https://stream.example.org/radio.mp3
https://example.net/listen.aac
http://radio.example.com:8000/stream
https://example.com/live
```

特征：

- 以 `http://` 或 `https://` 开头。
- 不带用户名密码。
- 路径里有 `stream`、`live`、`mp3`、`aac`、`ogg` 等词。
- 用浏览器打开时会直接下载/播放音频，或显示很简单的流响应。

### 大概率不能直接填的 URL

这些通常不是 ECHO 需要的直播流：

```text
https://example.com/radio-page
https://example.com/player
https://youtube.com/watch?v=...
spotify:track:...
mms://example.com/live
rtmp://example.com/live
```

原因：

- 网页播放器不是音频流。
- YouTube、Spotify 等不是普通直播流 URL。
- `mms/rtmp/rtsp` 不是当前 ECHO 电台入口支持的 URL 类型。
- 需要登录、Cookie、地区 token 的地址不稳定。

## `.m3u` 和 `.pls` 怎么处理

有些目录给你的不是音频流，而是播放列表。

### M3U 示例

```m3u
#EXTM3U
#EXTINF:-1,Example Radio
https://stream.example.org/live.mp3
```

这种情况下，把 `https://stream.example.org/live.mp3` 复制到 ECHO。

### PLS 示例

```ini
[playlist]
NumberOfEntries=1
File1=https://stream.example.org/live
Title1=Example Radio
Length1=-1
```

这种情况下，把 `File1=` 后面的 URL 复制到 ECHO。

如果一个播放列表里有多个 `File`，优先选：

1. `https` 优先于 `http`。
2. MP3 / AAC 优先。
3. 码率适中的优先，例如 128 kbps、192 kbps、320 kbps。
4. 低延迟不重要时，稳定比高码率更重要。

## 码率和格式怎么选

| 格式 | 建议 |
| --- | --- |
| MP3 | 兼容性最好，优先选择 |
| AAC / M4A | 通常音质效率好，也常见 |
| OGG / Opus | 可能可用，但部分链路兼容性不如 MP3 |
| FLAC 电台 | 音质好但带宽高，容易受网络影响 |
| HLS `.m3u8` | 不一定适合当前电台入口，先找普通 MP3/AAC 流 |

网络电台是直播流，不是本地文件。码率越高越吃网络，缓冲和断流概率也可能更高。第一次添加电台，不要只追最高码率，先找稳定流。

## 网络电台和本地音乐有什么不同

| 项目 | 本地音乐 | 网络电台 |
| --- | --- | --- |
| 时长 | 通常固定 | 通常没有固定时长 |
| 进度条 | 可以精确跳转 | 多数不能跳转 |
| 标签 | 来自文件标签 | 多数只有电台名，少数有流内元数据 |
| 封面 | 来自文件或专辑 | 通常没有固定封面 |
| 稳定性 | 取决于本地文件和设备 | 取决于网络、电台服务器和代理 |
| 收藏 | 收藏歌曲或歌单 | 收藏电台 URL |

所以听电台时看到时长为 0、不能拖进度条、没有封面，通常不是故障。

## 常见问题

### 点播放没声音

按这个顺序排查：

1. 换一个内置电台测试。
2. 换一个普通 MP3 电台流。
3. 确认系统音量和 ECHO 音量。
4. 到音频输出里切回 `System` 或共享输出。
5. 暂时关闭代理或 VPN。
6. 确认电台 URL 在浏览器或其它播放器里仍然可用。

如果内置电台能播，你添加的不能播，问题基本在那个 URL。

### ECHO 提示 URL 无效

ECHO 当前只接受普通 `http/https` URL，并拒绝带用户名密码的 URL。

检查：

- URL 前后有没有空格。
- 是否以 `http://` 或 `https://` 开头。
- 是否复制成网页地址。
- 是否复制了 `mms://`、`rtsp://` 或 `rtmp://`。
- 是否包含 `user:password@host`。

### 播放一会儿就断

可能原因：

- 电台服务器不稳定。
- 你的网络或代理不稳定。
- 流地址带临时 token，过期了。
- 码率太高。
- 电台限制地区或客户端。

处理：

1. 换同电台的备用流。
2. 换低码率 MP3/AAC 流。
3. 关闭代理或换网络。
4. 不要用抓包出来的临时 URL。
5. 找电台官网提供的公开长期流。

### 网页能播，ECHO 不能播

网页播放器可能做了很多额外工作，例如：

- JavaScript 获取临时地址。
- Cookie 登录。
- 广告前贴片。
- 地区判断。
- HLS 分片。
- 浏览器专用跨域逻辑。

ECHO 电台入口不是网页浏览器。请找裸音频流 URL。

### 能不能把电台投送到 DLNA 数播

当前最稳的路径是先用 ECHO 本机播放电台。DLNA 投送主要围绕当前曲目和可交给数播的媒体 URL 工作，不同数播对直播流支持差异很大。想投送直播电台时，请优先确认数播本身支持网络直播流；如果不稳定，先用 ECHO 本机听电台。

## 合规提醒

网络电台应该只使用合法公开的直播源。ECHO 不提供电台内容、不托管音频、不绕过地区限制、不破解会员接口，也不指导用户抓取受保护平台的临时地址。

## 参考

- Radio Browser：<https://www.radio-browser.info/>
- TuneIn：<https://tunein.com/>
- SHOUTcast：<https://directory.shoutcast.com/>

---

# 曲库管理

Source: src/content/docs/zh/docs/library.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/library/
Description: 本地音乐库、导入、扫描、标签、封面和大曲库维护边界。

ECHO 的曲库以本地文件为核心。导入文件夹后，ECHO 会读取音频文件、嵌入标签、封面、时长、编码信息，并把它们写入可搜索、可分页、可恢复的本地索引。

## 首次导入建议

第一次使用时不要直接导入整个硬盘。建议先做一个小规模验证：

1. 准备一个只含 3 到 10 首正常歌曲的小文件夹。
2. 在 `Import Folder` 导入它。
3. 到 `Songs`、`Albums`、`Inbox` 检查歌曲、封面和专辑分组。
4. 双击歌曲确认能播放。
5. 再导入完整曲库。

这个流程能把“软件能不能正常工作”和“你的大曲库是否需要整理”分开，排障更快。

## 导入时卡顿是正常现象

首次导入大曲库时，短时间卡顿、进度变慢、CPU 或磁盘占用升高是正常现象。ECHO 需要完成这些工作：

- 枚举文件夹里的音频文件。
- 读取 MP3、FLAC、M4A、WAV、OGG 等文件的标签。
- 提取或缓存封面。
- 计算时长、编码、采样率、位深等信息。
- 写入 SQLite 索引。
- 按专辑、艺术家、文件夹刷新分组。

导入期间尽量不要同时执行全量远程同步、大量下载、全库封面补全或其它重型后台任务。等第一轮导入完成后，再做标签修复、封面补全或远程同步会更稳定。

## 扫描和重扫

重复导入同一路径通常应视为重新扫描，不应该创建重复曲库。重扫适合这些情况：

- 文件夹里新增了大量歌曲。
- 你批量修改了标签。
- 专辑封面或曲序更新了。
- 某些文件被移动、替换或恢复。

不要把全库重扫当成万能修复。只有一张专辑显示异常时，优先修那张专辑的标签；只有一个文件夹异常时，优先重扫那个文件夹。

## 标签和专辑分组

专辑显示混乱时，重点看这些字段：

| 字段 | 影响 |
| --- | --- |
| `title` | 歌曲名 |
| `artist` | 歌曲艺术家 |
| `album` | 专辑名 |
| `albumArtist` | 专辑艺术家，决定同名专辑是否合并 |
| `trackNo` | 曲序 |
| `discNo` | 多碟专辑顺序 |
| `year` | 年份显示 |
| 封面 | 专辑墙、播放栏和详情页显示 |

同一张专辑的 `album` 和 `albumArtist` 最好保持一致。合辑、原声带和多艺术家专辑尤其要检查 `albumArtist`。

## 网络元数据

网络元数据适合补全缺失信息，不适合覆盖你已经整理好的高可信标签。推荐策略：

- 本地手动编辑优先。
- 文件内嵌标签优先。
- 文件夹结构和同目录封面优先。
- 网络结果作为候选或弱补全。

批量应用网络结果前，先选少量歌曲试一次。不要一次性覆盖整个曲库。

## 文件安全边界

ECHO 的曲库索引不等于你的真实音频文件。正常曲库维护应遵守这些边界：

- 从曲库移除记录不应自动删除真实音乐文件。
- 扫描发现文件消失时，应标记为缺失或等待修复，不应擅自删除历史记录。
- 标签写入、移动修复和批量操作都应由用户明确确认。
- 删除、重命名、移动真实文件前，请先确认路径和备份。

## 大曲库使用建议

- 优先使用搜索、分页、排序和文件夹入口定位问题。
- 批量修标签前先备份重要音乐文件。
- 扫描期间保持电脑供电稳定，避免外置硬盘休眠。
- 网络盘、移动硬盘和 NAS 的扫描速度取决于设备和网络。
- 遇到异常时截图扫描进度和错误信息，再反馈报告。

---

# 歌词与 MV 匹配说明

Source: src/content/docs/zh/docs/lyrics-and-mv.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/lyrics-and-mv/
Description: 解释 ECHO NEXT 的歌词、MV 自动匹配边界，以及 MV 打不开时如何使用 MV 诊断报告。

歌词和 MV 都属于“候选匹配”功能。ECHO NEXT 会根据当前歌曲的标题、艺术家、专辑、时长、已有标签和网络来源返回结果，再尽量选择最合适的候选。

这类功能的重点是提高便利性，不是保证每首歌都能自动命中完全正确的版本。遇到不准、不同步、打不开时，先按候选和诊断排查，不要把它当成曲库、音频输出或播放器一定坏了。

## 先理解匹配为什么不可能 100%

自动匹配不是读取一个绝对标准答案。现实里同一首歌可能有很多版本：

| 情况 | 会造成什么 |
| --- | --- |
| 原版、现场版、剪辑版、Remix、伴奏版 | 歌词时间轴和 MV 画面可能完全不同 |
| 单曲版和专辑版时长不同 | 歌词整体可能越来越偏 |
| 标题里有 feat.、with、翻译名、罗马音、别名 | 搜索候选可能混入其它版本 |
| 平台视频标题不是标准曲名 | MV 自动匹配可能选到饭制、舞台、剪辑或搬运 |
| 上传者重新压制或剪掉片头片尾 | 视频和音频不可能天然完全同步 |
| 网络源返回顺序变化 | 今天第一个候选不一定永远是同一个 |

所以“自动匹配”只能做到尽量接近。它可以节省大量手动搜索时间，但不能替代用户对具体版本的判断。

## 歌词匹配应该怎么判断

歌词的优先级建议是：

1. 本地 LRC 或你自己保存过的歌词。
2. 文件内嵌歌词。
3. 在线歌词候选。
4. 手动选择的候选。
5. 单曲偏移或手动修正。

如果歌词不准，先判断是哪一种不准：

| 现象 | 更可能的原因 | 先做什么 |
| --- | --- | --- |
| 完全是另一首歌 | 匹配到错误候选 | 手动切换候选 |
| 整首都早一点或晚一点 | 候选歌词整体偏移 | 调单曲偏移 |
| 前面准、后面越来越不准 | 歌曲版本或时长不同 | 换同版本歌词 |
| 只有几句不准 | 歌词文件自身时间轴质量差 | 换候选或手动修 |
| 翻译对不上原文 | 翻译来源和主歌词不是同一版本 | 关闭翻译或换候选 |

不要拿全局偏移去修单首歌。全局偏移只适合“所有歌曲在你的设备上都稳定早一点或晚一点”的情况。

## MV 匹配为什么更难

MV 比歌词更不可能做到 100% 自动匹配，尤其当 MV 来源是 Bilibili 时。

Bilibili 本质上是视频平台，不是专门为某个音频文件建立的一一对应 MV 数据库。平台上的视频可能是官方 MV、现场、字幕版、饭制、剪辑、搬运、补帧、重压制、演唱会片段或不同地区版本。视频标题、简介、标签、投稿者和播放量只能作为线索，不能证明它就是当前音频文件的标准 MV。

更重要的是，Bilibili 视频里的音轨通常不是你正在播放的那份音频文件。即使视频内容是同一首歌，也可能存在：

1. 片头、片尾、黑屏、字幕卡。
2. 上传者剪辑过前奏或结尾。
3. 音频被重新压制。
4. 现场版和录音室版不同。
5. MV 版本和专辑版本时长不同。
6. 视频帧率、浏览器解码、网络缓冲带来的显示延迟。

因此 MV 不可能承诺与音频完全同步。ECHO NEXT 可以帮你找候选、尽量对齐、提供重播音频或手动 URL，但不能把第三方视频源变成和本地音频逐毫秒绑定的官方同步素材。

## MV 不准时怎么处理

按这个顺序排查最省时间：

1. 先看候选标题、上传者、时长和画面内容。
2. 优先选择官方 MV 或最接近官方版本的视频。
3. 如果自动候选不对，手动选择候选。
4. 如果你已经知道正确视频，直接填自定义 URL。
5. 如果音频和视频版本不同，换视频比调同步更有效。
6. 如果只是整体早晚，可以尝试同步相关设置。
7. 如果每次都差得很离谱，先提高自动匹配阈值，减少误选。

不要把“MV 不准”当作音频输出问题。音频正常播放、歌词正常显示，但 MV 选错或不同步时，重点看候选、来源、版本和视频状态。

## MV 打不开或看不到画面

打不开不一定是 ECHO 自身问题。MV 需要经过网络请求、平台访问、账号或 Cookie 状态、视频流解析、浏览器解码、画面渲染等多步链路。任意一环失败都会表现成没有画面、加载失败、黑屏或只能外部播放。

先检查：

1. 当前网络能否访问对应平台。
2. 代理设置是否影响 Bilibili、YouTube 或其它来源。
3. 账号登录状态或 Cookie 是否过期。
4. 视频是否需要登录、地区权限、会员权限或平台风控。
5. 画质是否过高，例如 HEVC、HDR、Dolby Vision、4K 60fps。
6. 是否开启了过重的沉浸背景、视频壁纸或实时效果。
7. 外部播放器能否打开同一个 URL。

如果有打不开、黑屏、加载失败、只有声音没有画面、候选明明存在但无法播放等问题，请打开 `MV 诊断报告`。它会生成可复制的本地 Markdown 报告，里面包含当前 MV 状态、候选、来源、错误线索和页面可见性信息。

反馈时请把 `MV 诊断报告` 连同截图、ECHO NEXT 版本、系统版本、当前歌曲、视频 URL 或候选标题一起发出。只说“MV 打不开”通常无法判断是网络、平台、登录、编码、候选还是渲染问题。

## 建议设置

| 目标 | 建议 |
| --- | --- |
| 想减少错配 | 提高 MV 自动匹配阈值 |
| 网络慢或页面卡 | 关闭 MV 自动预加载，降低最高画质 |
| 视频卡顿 | 关闭 60fps，先用 720p 或 1080p |
| 画面能播但歌词看不清 | 开启 MV 歌词可读性增强或调暗背景 |
| 候选经常不是官方 MV | 手动选择候选或使用自定义 URL |
| 排查打不开 | 打开 `MV 诊断报告` 并复制报告 |

## 反馈前别做什么

这些操作通常不能解决歌词或 MV 问题，反而会让排查变复杂：

1. 不要先删除数据库。
2. 不要清空整个曲库。
3. 不要连续切很多音频输出模式。
4. 不要同时改代理、账号、画质、来源顺序和同步模式。
5. 不要只截图黑屏页面而不发诊断报告。

更稳的做法是：保留当前歌曲、当前候选、当前设置和诊断报告。这样才能看出问题发生在哪一环。

---

# 歌单导入教程

Source: src/content/docs/zh/docs/playlist-import.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/playlist-import/
Description: 从网易云音乐、QQ 音乐、Spotify，以及 Bilibili 收藏、YouTube 播放列表、SoundCloud sets 导入歌单。

ECHO 的歌单导入分成两类入口：普通流媒体歌单会导入到 `Playlists / 歌单` 页面；Bilibili、YouTube、SoundCloud 这类更接近“收藏表”的来源，会导入到流媒体收藏列表。两者都只是读取你提供的合法链接和账号可访问的条目，不提供下载服务，也不会绕过平台权限、会员限制或版权保护。

## 先选对入口

在 ECHO 里打开 `Playlists / 歌单`：

1. 要导入网易云音乐、QQ 音乐、酷狗或 Spotify 歌单，用左侧的 `添加流媒体歌单` 输入框。
2. 要导入 Bilibili 收藏夹、YouTube 播放列表或 SoundCloud sets，用流媒体收藏区域里的 `导入收藏` 输入框。
3. 粘贴完整链接，点击添加或导入。
4. 等待导入完成后，在歌单列表或流媒体收藏列表里选择刚导入的项目。
5. 如果歌单很大，第一次读取需要分页拉取，等待时间会比普通本地歌单长。

不要把两类入口混用。YouTube 播放列表、Bilibili 收藏和 SoundCloud sets 不走普通“添加流媒体歌单”入口；网易云、QQ、Spotify 歌单也不走“导入收藏”入口。

## 普通歌单：网易云、QQ、Spotify

### 网易云音乐

网易云歌单常见可用格式：

- `https://music.163.com/#/playlist?id=123456789`
- `https://music.163.com/playlist?id=123456789`
- 分享文案里带有 `music.163.com` 的完整链接
- 电台 / 播客链接，例如 `https://music.163.com/djradio?id=990232286`

注意事项：

- 链接里需要能看到 `id=`，或者路径里能识别出歌单 ID。
- 如果链接来自手机 App，优先复制“分享链接”而不是只复制歌单名。
- 私密歌单、地区限制内容、账号不可访问内容，可能读取不到或只能读到部分曲目。
- 歌单里的曲目能不能播放，仍然取决于当前来源、版权状态、账号和网络。

### QQ 音乐

QQ 音乐链接格式最多，导入失败时优先检查这一段。ECHO 会尽量识别移动端、桌面端、旧版网页、hash 参数、复制分享文案和部分跳转链接，但链接里必须能解析出数字歌单 ID。

常见可用格式：

- `https://y.qq.com/n/ryqq/playlist/778899`
- `https://y.qq.com/n/yqq/playlist/7177076625.html`
- `https://i.y.qq.com/n2/m/share/details/taoge.html?id=9102222552`
- `https://i2.y.qq.com/n3/other/pages/details/playlist.html?id=9718644800`
- `https://y.qq.com/musicmac/v6/playlist/detail.html?id=7177076626`
- `https://y.qq.com/portal/playlist.html#id=9718644801`
- `https://c6.y.qq.com/base/fcgi-bin/u?__=...` 这类短分享链接
- 一整段 QQ 音乐分享文字，只要里面包含完整 `https://...` 歌单链接
- 带嵌套跳转参数的链接，例如参数名是 `url`、`redirect`、`jumpurl`、`link` 或 `shareUrl`

QQ 导入时最容易踩的坑：

- 不要只复制歌单标题、歌单作者名或截图，必须复制完整链接。
- 不要手动删掉 `id`、`disstid`、`dissid`、`dirid`、`tid`、`playlistId` 这类参数。
- QQ 的短链接可能需要先解析跳转，网络或代理异常时会失败；失败后建议重新从 QQ 音乐里复制一次完整分享链接。
- 如果链接打开后是单曲、专辑、MV、搜索页或用户主页，不是歌单页，ECHO 不会把它当作歌单导入。
- 歌单 ID 通常是一串数字；如果链接里完全没有数字歌单 ID，基本无法导入。
- QQ 歌单详情接口偶尔会返回空列表或拒绝请求，这时先在浏览器确认歌单可公开访问，再换网络或稍后重试。

推荐复制方式：

1. 在 QQ 音乐里打开目标歌单详情页。
2. 使用分享功能复制链接，不要从地址栏手工截短。
3. 如果拿到的是 `c6.y.qq.com` 短链接，可以直接粘贴；如果失败，再打开短链接后复制最终落地页地址。
4. 粘贴到 ECHO 的 `添加流媒体歌单` 输入框。
5. 导入后在歌单页检查曲目数量和封面是否符合预期。

### Spotify

Spotify 支持的歌单链接：

- `https://open.spotify.com/playlist/5MFN2Ep3ZU2FIQWIXNSLrT`
- `spotify:playlist:5MFN2Ep3ZU2FIQWIXNSLrT`

Spotify 需要额外注意：

- 先完成 [Spotify OAuth 配置](./spotify-oauth/)，并使用你自己的 Spotify Client ID 登录。
- Spotify 播放走官方播放器 / Connect 路线，通常需要 Premium；ECHO 不会提供可下载音频 URL。
- Spotify Web API 对某些歌单曲目列表有权限限制。非创建者或非协作者歌单可能会提示无法读取曲目列表。
- 如果遇到“只有创建者或协作者可读取”的提示，先在系统浏览器打开歌单，把它复制到自己的 Spotify 账号，再导入新歌单链接。
- Development Mode 下，Spotify App 可能只允许白名单用户登录；公开使用需要在 Spotify Dashboard 里处理配额和用户权限。

## 特殊收藏：Bilibili、YouTube、SoundCloud

这些来源在 ECHO 中更像“流媒体收藏表”，不是普通长期歌单。它们会记录来源、收藏表名称和读取到的条目，适合把视频平台或 SoundCloud 的列表作为一个可浏览集合保存。

### Bilibili 收藏

支持的是 Bilibili 用户收藏夹，不是普通合集、频道页或单个视频页。链接里需要能识别收藏夹 ID，例如：

- `https://www.bilibili.com/medialist/detail/ml123456789`
- `https://space.bilibili.com/123456/favlist?fid=987654321`
- 带 `fid`、`media_id` 或 `mediaId` 参数的收藏夹链接

注意事项：

- 私密收藏夹、账号不可访问的收藏夹或需要登录状态的内容，需要先在设置里的 Bilibili 账号区域登录并同步。
- ECHO 读取的是收藏夹条目，不是 Bilibili 用户所有收藏的总集合。
- 如果链接打开后不是收藏夹页面，而是单个视频、动态或个人主页，导入会失败。

### YouTube 播放列表

支持的是 YouTube playlist，典型格式：

- `https://www.youtube.com/playlist?list=PLxxxxxxxx`
- `https://www.youtube.com/watch?v=VIDEO_ID&list=PLxxxxxxxx`

注意事项：

- 链接里必须有 `list=` 播放列表 ID。
- 普通单个视频链接没有 `list=` 时不能作为播放列表导入。
- 私密、会员、地区限制、年龄限制或需要登录的播放列表，取决于你在设置里选择的 YouTube 浏览器 / Cookie 状态。
- YouTube 的列表读取依赖网络和上游页面结构，失败时先确认浏览器能打开同一个列表。

### SoundCloud Sets

支持 SoundCloud 的 sets / playlist 页面，常见格式：

- `https://soundcloud.com/user/sets/name`
- `https://soundcloud.com/discover/sets/...`

注意事项：

- 普通 SoundCloud 单曲页面不是 sets，不会当作收藏表导入。
- 私密、地区限制或需要登录的内容，可能需要在设置里选择浏览器 Cookie，或先登录 SoundCloud。
- SoundCloud 不需要 Artist Pro 或开发者 API；ECHO 使用你保存的登录状态和可访问页面。

## 导入后怎么管理

普通流媒体歌单导入后会出现在 `Playlists / 歌单` 列表中。你可以：

- 像本地歌单一样打开、播放、搜索其中的条目。
- 对已导入的远程歌单执行刷新，让 ECHO 重新读取来源列表。
- 通过外部链接按钮回到原平台查看来源。
- 遇到曲目不可播放时，先判断是单曲版权、账号状态、网络还是来源接口问题。

流媒体收藏导入后会出现在收藏列表中。你可以：

- 在 Bilibili / YouTube / SoundCloud 不同收藏表之间切换。
- 重新同步已保存的收藏来源。
- 删除某个导入收藏表；这不会删除平台上的原收藏。

## 失败时按这个顺序排查

1. 确认你粘贴的是完整 URL，不是歌单名、截图、短文本或单曲链接。
2. 确认入口选对：网易云 / QQ / Spotify 用 `添加流媒体歌单`；Bilibili / YouTube / SoundCloud 用 `导入收藏`。
3. 在浏览器里打开同一个链接，确认当前网络和账号能访问。
4. 对 QQ 音乐，检查链接里是否有数字歌单 ID 或 `id` / `disstid` / `dissid` / `dirid` / `tid` / `playlistId`。
5. 对 Spotify，确认 OAuth、Premium、白名单、歌单所有者 / 协作者权限。
6. 对 Bilibili、YouTube、SoundCloud，确认需要登录的内容已经在设置里配置账号或浏览器 Cookie。
7. 如果歌单很大，先等第一页导入完成；不要连续重复点击导入。
8. 如果仍然失败，反馈时附上来源平台、链接格式截图、错误提示、是否使用代理、是否已登录，以及浏览器能否打开原链接。

## 合规边界

歌单导入只是把你有权访问的列表信息同步到 ECHO。ECHO 不提供破解、下载、绕过会员、绕过地区限制、抓取私密内容或规避平台规则的能力。任何第三方脚本、灰色来源、资源站链接或侵权内容都不属于 ECHO 官方支持范围。

---

# plugins

Source: src/content/docs/zh/docs/plugins.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/plugins/

---
title: "插件创作指南"
description: "ECHO Next 本地插件系统的权限、Manifest、API、面板和调试指南。"
sidebar:
  order: 50
  label: "插件创作"
---

适用范围：ECHO Next 本地插件系统，当前宿主支持 `apiVersion` 1 和 2，推荐新插件使用 `apiVersion: 2`。

这份文档写给插件作者，也写给第一次打开“插件”页面、心里还没底的人。它会先帮你判断“这个想法适不适合做成插件”，再带你做一个能跑起来的最小插件，最后再讲 manifest、权限、API、面板、provider、导入导出和调试。

目标不是教插件突破宿主限制，而是教你在 ECHO 的安全边界内做出稳定、轻量、不会拖慢播放的扩展。插件应该像一个可靠的小工具：用户知道它要什么权限，出错时能看懂日志，播放音乐时也不会被它拖住。

插件接口只是技术扩展点，不代表 ECHO 官方提供、背书或验证第三方音源。ECHO 不提供任何用于获取音乐内容的下载功能，也不承担第三方插件、脚本、接口、账号、URL 或内容来源产生的法律责任。完整声明见 [下载与插件音源法律边界](/zh/docs/download-and-plugin-source-boundary/)。

如果你正在让 AI 帮你写插件，建议把本文的“让 AI 帮你写插件时怎么说”和“常见新手错误”两节一起发给它。那两节把插件类型、权限、manifest、运行边界和 AI 常见错误整理成了更适合模型执行的清单。

## 一句话模型

ECHO 插件是放在用户数据目录 `plugins/` 下的本地文件夹。宿主读取 `echo.plugin.json`，在受控 VM 沙箱里运行 `plugin.js`，按用户确认的权限暴露一个有限的全局 `echo` API，并把 `panel.html` 当作 sandbox iframe 显示。

插件可以做：

- 注册命令，让用户手动运行小工具。
- 读取当前播放状态，做轻量记录或展示。
- 分页读取曲库公开字段。
- 返回元数据、歌词、封面候选，交给宿主和用户决定是否采用。
- 提供自定义音源搜索候选，并在用户触发播放时返回显式 `http` / `https` 音频 URL。
- 使用插件自己的设置、存储、日志和面板。
- 在 `apiVersion: 2` 下通过宿主受控网络 API 访问 `http` / `https`。

插件不能做：

- 直接访问 Node、Electron、SQLite、主应用 DOM、原生音频 host、解码器、DSP 或输出设备。
- Hook 播放热路径、修改音频 buffer、控制 WASAPI/ASIO/native host 细节。
- 任意读写本机文件。
- 自动写入曲库记录或改源音频文件。
- 后台全库扫描、持续高频轮询、长时间同步阻塞。

ECHO 的核心原则是：插件能扩展体验，但不能牺牲播放稳定性。

## 先判断你的想法适不适合做插件

写代码前先停一分钟，问自己五个问题：

| 问题 | 如果答案是“是” | 建议 |
| --- | --- | --- |
| 只是想加一个按钮、菜单动作或小工具吗 | 是 | 从命令插件开始 |
| 需要显示一块自己的界面吗 | 是 | 用 Panel + Command，面板只负责 UI |
| 需要补充元数据、歌词、封面或音源候选吗 | 是 | 用对应 provider，把最终选择交给 ECHO |
| 需要读曲库但不改文件吗 | 是 | 申请 `library:read`，分页读取 |
| 需要改播放链、DSP、数据库、任意本机文件或主界面 DOM 吗 | 是 | 这不是普通插件能做的事，应改 ECHO 主程序或重新设计需求 |

一个好插件通常从很小的版本开始：先能启动，再能跑一个命令，再加权限，最后才加面板或网络。不要一开始就把“搜索、下载、改标签、写文件、自动播放、复杂 UI”全塞进第一版。

## 推荐创作路线

| 阶段 | 你要产出的东西 | 完成标准 |
| --- | --- | --- |
| 1. 描述想法 | 一句话写清楚插件要帮用户做什么 | 不提实现细节也能听懂 |
| 2. 选类型 | 命令、主题、面板、metadata、lyrics、cover、source provider | 知道它主要入口在哪里 |
| 3. 定权限 | `permissions` 只写真的会用到的权限 | 启用时用户不会被无关权限吓到 |
| 4. 写最小版 | `echo.plugin.json` + `plugin.js` | 插件页能看到、能启用、日志能看到启动信息 |
| 5. 加真实能力 | 读取播放状态、曲库分页、网络请求或 provider 返回候选 | 每一步都能单独重载验证 |
| 6. 收尾发布 | README、错误提示、导出包、发布前检查 | 别人拿到也知道怎么启用、怎么排错 |

如果你只是想先感受一下系统，不要从空白文件开始。ECHO 插件页内置了示例：播放状态面板、命令工具、曲库脚本、自定义音源、主题预设。先点“新建”，跑通后再改成自己的插件，会比盯着空白编辑器舒服很多。

## 快速开始

最快、最不容易迷路的方式是这样：

1. 打开 ECHO 的“插件”页面。
2. 点“打开目录”，确认真实插件目录。目录通常是 Electron `userData/plugins`，但不要硬猜路径，以插件页打开的目录为准。
3. 如果你还没想好结构，先在插件页点一个示例插件的“新建”。
4. 打开示例目录，看 `echo.plugin.json` 声明了什么，再看 `plugin.js` 注册了什么。
5. 每次只改一小段，保存后回到插件页点“重载”；如果改了 manifest，再点“刷新”。
6. 启用插件时认真看权限确认。权限越少，用户越容易信任。
7. 出错先看插件详情里的日志，不要马上扩大改动。把代码删回最小能启动的状态，再一段一段加回来。

如果你更想从零开始，下一节可以直接照抄。

## 零基础照着做第一个插件

这一节按“完全没写过 ECHO 插件”的用户来写。你只要会新建文件、复制文本、保存文件，就能先跑起来一个插件。

### 你需要准备什么

| 工具 | 用来做什么 |
| --- | --- |
| ECHO NEXT | 打开插件页面、创建示例、启用插件、看日志 |
| 一个文本编辑器 | 记事本也行，VS Code 更舒服 |
| 一个小音乐库 | 用来测试播放状态、曲库读取、provider 结果 |

建议先用一个只有几十首歌的小曲库试插件。插件写错了通常不会伤到主程序，但大库、网络请求和 provider 组合在一起时，排错会变得很吵。

不要一上来就改 ECHO 主程序源码。普通插件只需要放进 ECHO 打开的 `plugins/` 目录里。你要交付给别人的也是这个插件文件夹或导出的插件包，不是 ECHO 源码改动。

### 第 1 步：找到插件目录

1. 打开 ECHO NEXT。
2. 进入 `Plugins` / “插件”页面。
3. 点击“打开目录”。
4. 系统会打开一个文件夹，这就是插件目录。
5. 以后所有插件文件夹都放在这里。

不要自己猜路径。不同系统、便携版、开发版的用户数据目录可能不一样，以 ECHO 打开的目录为准。

### 第 2 步：新建插件文件夹

在刚才打开的插件目录里，新建一个文件夹：

```text
echo.hello-plugin
```

文件夹名建议和插件 id 一样。插件 id 只能用小写字母、数字、`.`、`_`、`-`，并且要用小写字母或数字开头。新手直接照这个格式写：

```text
echo.你的插件名
```

例如：

```text
echo.my-tool
echo.playback-note
echo.aurora-theme
```

### 第 3 步：写 `echo.plugin.json`

进入 `echo.hello-plugin` 文件夹，新建文件：

```text
echo.plugin.json
```

把下面内容完整复制进去：

```json
{
  "id": "echo.hello-plugin",
  "name": "Hello Plugin",
  "version": "0.0.1",
  "apiVersion": 2,
  "entry": "plugin.js",
  "permissions": [],
  "contributes": {
    "commands": [
      {
        "id": "hello",
        "title": "Hello"
      }
    ]
  }
}
```

这个文件告诉 ECHO：

| 字段 | 你现在先这样理解 |
| --- | --- |
| `id` | 插件的唯一名字，不能和别的插件重复 |
| `name` | 插件页面显示给人看的名字 |
| `version` | 插件版本，先写 `0.0.1` |
| `apiVersion` | 新插件写 `2` |
| `entry` | 插件启动时执行哪个 JS 文件 |
| `permissions` | 插件要什么权限；这个 Hello 插件不需要权限 |
| `contributes.commands` | 告诉 UI：这个插件有一个叫 `hello` 的命令 |

### 第 4 步：写 `plugin.js`

同一个文件夹里再新建文件：

```text
plugin.js
```

把下面内容完整复制进去：

```js
console.log('hello plugin loaded');

echo.commands.register('hello', { title: 'Hello' }, async () => {
  await echo.ui.notify('Hello from ECHO plugin');
  return { ok: true, message: 'Hello from ECHO plugin' };
});
```

这段代码做了三件事：

1. 插件启动时写一条日志。
2. 注册一个叫 `hello` 的命令。
3. 用户运行命令时，发一个通知，并返回一段 JSON。

注意：`echo.plugin.json` 里的命令 id 和 `plugin.js` 里的命令 id 必须一样。这里都叫 `hello`。

### 第 5 步：确认文件结构

现在你的插件目录应该长这样：

```text
plugins/
  echo.hello-plugin/
    echo.plugin.json
    plugin.js
```

如果文件名写成下面这样，ECHO 可能找不到：

```text
echo.plugin.json.txt
plugin.js.txt
Echo.Plugin.Json
Plugin.JS
```

Windows 记事本容易把文件保存成 `.txt`。如果你看不到扩展名，先在资源管理器里打开“显示文件扩展名”。

### 第 6 步：回到 ECHO 刷新

1. 回到 ECHO 的插件页面。
2. 点击“刷新”。
3. 你应该能看到 `Hello Plugin`。
4. 如果看不到，先检查文件夹名、`echo.plugin.json` 文件名、JSON 逗号有没有写错。

### 第 7 步：启用插件

1. 点开 `Hello Plugin`。
2. 点击“启用”。
3. 这个插件没有权限，所以不需要额外信任危险权限。
4. 启用后看插件日志，应该有 `hello plugin loaded`。

如果启用时报错，先看插件详情里的日志。ECHO 会把启动错误写在那里。

### 第 8 步：运行命令

插件启用后，在插件详情里找到命令 `Hello`，点击运行。你应该看到：

- 插件通知：`Hello from ECHO plugin`
- 日志里有命令运行记录。

到这里，第一个插件已经成功了。

如果通知没出来但插件没有报错，先刷新日志；如果日志里出现 `plugin_command_not_found`，说明 manifest 声明的命令 id 和 `plugin.js` 注册的命令 id 不一致；如果出现 `plugin_command_timeout`，说明命令执行超过约 2 秒，需要把耗时逻辑拆小。

### 第 9 步：修改插件后怎么生效

你改了 `plugin.js` 或 `echo.plugin.json` 之后：

1. 保存文件。
2. 回到插件页面。
3. 点击这个插件的“重载”。
4. 如果改了 manifest 但页面没变，点击“刷新”。

不要一边改文件一边期待 ECHO 自动立刻发现。插件系统当前按“刷新/重载”更新。

从这里开始，每次只加一种能力：

| 下一步想做什么 | 先加什么 | 先验证什么 |
| --- | --- | --- |
| 读播放状态 | `permissions: ["playback:read"]`，再调用 `echo.playback.getStatus()` | 命令能返回当前状态 |
| 读曲库 | `permissions: ["library:read"]`，用分页读取 | `pageSize` 不超过 100 |
| 做面板 | 增加 `panel.html` 和 `contributes.panels` | 面板能通过 `plugin:getSummary` 收到响应 |
| 访问网络 | `apiVersion: 2` + `network` 权限，使用 `echo.net.fetchJson/fetchText` | 超时、失败状态能写日志 |
| 做 provider | manifest 声明 provider，`plugin.js` 注册同 id provider | 搜索或候选结果能被 ECHO 收到 |

## 最小主题插件

如果你只是想做主题，不需要写复杂 JS。主题插件主要写 manifest，`plugin.js` 可以只放一行日志。

文件结构：

```text
plugins/
  echo.simple-theme/
    echo.plugin.json
    plugin.js
```

`echo.plugin.json`：

```json
{
  "id": "echo.simple-theme",
  "name": "Simple Theme",
  "version": "0.0.1",
  "apiVersion": 2,
  "entry": "plugin.js",
  "permissions": [],
  "contributes": {
    "themePresets": [
      {
        "id": "simple-blue",
        "title": "Simple Blue",
        "description": "一个最小主题示例。",
        "basePreset": "classic",
        "preview": "linear-gradient(135deg, #10243a 0%, #5cc8dc 100%)",
        "swatches": ["#10243a", "#5cc8dc", "#ffffff"],
        "light": {
          "appBg": "#eef8ff",
          "panel": "#ffffff",
          "accent": "#257f96",
          "text": "#234150"
        },
        "dark": {
          "appBg": "#08111f",
          "panel": "#142234",
          "accent": "#5cc8dc",
          "text": "#c8dce8"
        }
      }
    ]
  }
}
```

`plugin.js`：

```js
console.log('simple theme plugin loaded');
```

启用插件后，进入 `Settings` / “设置” > “外观”，找到“插件主题”，点击主题卡片。ECHO 会把它导入到“我的主题”，之后你还可以继续微调颜色、透明度、圆角和动效。

主题插件常见错误：

| 错误 | 结果 | 正确写法 |
| --- | --- | --- |
| 颜色写 `red` | 会被忽略 | 写 `#ff0000` |
| 颜色写 `#fff` | 会被忽略 | 写 6 位 `#ffffff` |
| 写任意 CSS | 不会生效 | 只写结构化字段 |
| 没有 `light` 也没有 `dark` | 主题会被丢弃 | 至少写一组 |
| `preview` 里写 `url(...)` | 预览会被丢弃 | 只用纯色或 `linear-gradient(...)` |

## 不知道该做哪种插件时先看这里

先按“用户怎么触发它”来选类型，不要按代码复杂度选。

| 你想做什么 | 第一版先做成 | 需要权限吗 | 先别做什么 |
| --- | --- | --- | --- |
| 点一下按钮，弹个提示、复制文本或保存一点小状态 | 命令插件 | 通常不需要 | 不要先做面板 |
| 显示当前播放状态 | 命令插件，跑通后再加面板 | `playback:read` | 不要高频轮询 |
| 控制播放、暂停、跳转 | 命令插件 | `playback:control` | 不要自动连续 seek 或抢用户操作 |
| 统计曲库里有多少歌缺标签 | 命令插件 | `library:read` | 不要一次读完整曲库 |
| 给歌曲提供候选标签 | Metadata Provider | `library:read` | 不要直接写入曲库 |
| 给歌曲提供候选歌词 | Lyrics Provider | `library:read` | 不要返回超大歌词包 |
| 给歌曲提供候选封面 | Cover Provider | `library:read`，可能还要 `network` | 不要下载大图塞进结果 |
| 接入一个第三方音乐搜索源 | Source Provider | `sources:provide`，可能还要 `network` | 不要返回不明确来源的播放 URL |
| 做一个可导入主题 | Theme Preset | 不需要 | 不要写任意 CSS 或脚本注入 |
| 做一个复杂界面 | Panel + Command | 按命令实际用到的 API 申请 | 不要在面板里直接访问 `echo` |

新手推荐顺序：

1. 先做命令插件，因为它最容易看日志、最容易确认成败。
2. 再做主题插件，因为它几乎不需要权限，适合理解 manifest 的贡献点。
3. 再做读取曲库的命令，练习分页和权限。
4. 再做 metadata、lyrics、cover 或 source provider，练习“返回候选，不直接替用户决定”。
5. 最后再做面板。面板体验更好，但多了 `postMessage` 通信，排错成本更高。

记住一个原则：插件应该把“危险动作”交给 ECHO 或用户确认。候选、展示、轻量命令很适合插件；直接改播放链、改数据库、改源文件，不适合普通插件。

## 让 AI 帮你写插件时怎么说

你可以直接把下面这段发给 AI，然后把你的需求补进去。越具体，AI 越不容易生成越界代码。

```text
请按 ECHO Next 插件系统写一个本地插件。
先阅读 docs/ECHO_NEXT_PLUGINS.md 和 docs/plugin-sdk/ForAIReadme.md；如果需要核对真实接口，再看 src/shared/types/plugins.ts、src/main/plugins/PluginManifest.ts、src/main/plugins/PluginService.ts、src/renderer/pages/PluginsPage.tsx。
不要修改 ECHO 主程序源码，只生成插件文件夹内的文件。
使用 apiVersion: 2。
权限最小化，不要申请无关权限。
插件目录名和 id 使用 echo.my-plugin 这种格式。
需要提供 echo.plugin.json、plugin.js、README.md。
如果需要面板，再提供 panel.html，并通过 plugin:runCommand 调用命令。
plugin.js 不要使用 require/import/process/window/document/fetch。
网络访问必须通过 echo.net，并声明 network 权限。
命令和事件 handler 要轻量，超过 2 秒的任务要拆小或返回“已排队”。
请先给出文件结构、manifest、权限理由、使用步骤、调试步骤，再给代码。
我的需求是：在这里写清楚用户怎么触发、要读什么、要展示什么、失败时怎么提示。
```

如果 AI 生成了代码，你要检查：

- 它有没有让你改 `src/main/...` 或 `src/renderer/...`。普通插件不应该改这些。
- 它有没有写 `require`、`import`、`process`、`window`、`document`、`fetch`。
- 它有没有一次申请很多权限。
- 它有没有告诉你把文件放进 ECHO 插件页打开的目录。
- 它有没有写清楚怎么刷新、启用、看日志。
- 它有没有把面板写成“直接调用 `echo`”。面板不能直接拿到 `echo`，要通过 `postMessage` 请求 `plugin:runCommand`。
- 它有没有把长任务写在 `playback:status` 事件里。播放状态事件应该很轻，不要在里面做网络请求、全库查询或大 JSON 写入。
- 它有没有直接采纳第三方返回的数据并写入曲库。普通插件应该返回候选，让 ECHO 和用户决定。

如果 AI 写得太大，先让它缩成“只包含一个命令、一个日志、一种权限”的版本。插件开发里，小而能跑比大而玄学更值钱。

## 常见新手错误

| 现象 | 最可能原因 | 怎么修 |
| --- | --- | --- |
| 插件页看不到插件 | 文件夹没放进插件目录，或 `echo.plugin.json` 文件名错 | 点“打开目录”，确认结构 |
| 插件显示 manifest 错误 | JSON 少逗号、多逗号、引号错 | 用 JSON 校验器检查 |
| `id must use lowercase...` | 插件 id 不符合规则 | 用 `echo.my-plugin` 这种小写格式 |
| `apiVersion must be between 1 and 2` | `apiVersion` 写错或写成字符串 | 新插件写数字 `2` |
| entry 或 panel 不生效 | 写了子目录、绝对路径或错误扩展名 | `entry` 写根目录 `.js` 文件名，`panel` 写根目录 `.html` 文件名 |
| 启用后立刻报错 | `plugin.js` 顶层代码抛错 | 看插件日志，先删到最小代码 |
| 命令不出现 | manifest 里声明了，但 `plugin.js` 没注册 | `contributes.commands[].id` 和 `echo.commands.register` 保持一致 |
| 命令点击没反应 | handler 抛错或超时 | 看日志，减少代码，先返回 `{ ok: true }` |
| 权限不足 | manifest 没写对应权限，或启用时没信任 | 补权限，刷新，再重新启用 |
| 面板里找不到 `echo` | 面板本来就没有 `echo` | 面板用 `postMessage` 调 `plugin:runCommand` |
| 网络请求失败 | 用了 `fetch` 或没申请 `network` | 用 `echo.net.fetchJson/fetchText` |
| 网络请求被拒绝 | 方法、header、URL 或响应大小不符合宿主限制 | 只用 `GET` / `POST`，只传必要 header，控制响应体 |
| 曲库读取很慢 | 一次读太多 | 分页，`pageSize <= 100` |
| provider 有时没结果 | 返回字段过大、数量太多或 handler 超时 | 控制候选数量，先返回小结果，再加缓存 |
| 插件突然被宿主禁用 | 10 分钟内连续启动失败达到隔离阈值 | 修好启动错误后再启用，先用最小代码确认能启动 |
| 导出包里带了缓存 | 手动塞了 `plugin-storage.json` | 删除运行缓存再发布 |

插件目录推荐形态：

```text
plugins/
  echo.my-plugin/
    echo.plugin.json
    plugin.js
    panel.html
    README.md
    echo-plugin.d.ts
```

运行中可能出现这些宿主文件：

```text
plugins/
  plugin-state.json
  echo.my-plugin/
    plugin-storage.json
    plugin-settings.json
```

这些文件是运行状态，不应当手动写入发布包。ECHO 导出插件包时也会排除它们。

## 文件职责

| 文件 | 是否必需 | 作用 |
| --- | --- | --- |
| `echo.plugin.json` | 必需 | 插件 manifest，声明 id、版本、入口、权限和贡献点 |
| `plugin.js` | 通常必需 | 插件入口脚本，在受控 VM 沙箱运行 |
| `panel.html` | 可选 | 插件面板，作为 sandbox iframe 显示 |
| `echo-plugin.d.ts` | 可选 | SDK 类型提示，来自 `docs/plugin-sdk/echo-plugin.d.ts` |
| `README.md` | 可选 | 给自己或用户看的说明 |
| `.css` / `.txt` / `.json` | 可选 | 静态资源或配置，导出包只支持根目录单文件 |

当前导入导出只处理插件根目录下的单文件，不递归子目录。可导出的扩展名是 `.js`、`.mjs`、`.cjs`、`.html`、`.css`、`.json`、`.md`、`.txt`。

## 编辑器类型提示

如果你用 VS Code 或支持 JS 类型检查的编辑器，可以把仓库的 SDK 类型复制到插件目录：

```text
docs/plugin-sdk/echo-plugin.d.ts -> plugins/echo.my-plugin/echo-plugin.d.ts
```

再放一个 `jsconfig.json`：

```json
{
  "compilerOptions": {
    "checkJs": true,
    "types": ["./echo-plugin"]
  }
}
```

这样 `plugin.js` 里访问 `echo.playback.getStatus()`、`echo.metadata.registerProvider()` 等 API 时会有提示。

## Manifest 基础

最小插件：

```json
{
  "id": "echo.my-plugin",
  "name": "我的插件",
  "version": "0.0.1",
  "apiVersion": 2,
  "entry": "plugin.js",
  "permissions": []
}
```

带面板、命令、provider 和插件设置的完整形态：

```json
{
  "id": "echo.metadata-helper",
  "name": "Metadata Helper",
  "version": "0.1.0",
  "apiVersion": 2,
  "minEchoVersion": "26.5.29",
  "entry": "plugin.js",
  "panel": "panel.html",
  "permissions": ["library:read", "network"],
  "contributes": {
    "commands": [
      {
        "id": "lookup-current-track",
        "title": "查询当前曲目"
      }
    ],
    "metadataProviders": [
      {
        "id": "tags",
        "title": "标签候选"
      }
    ],
    "lyricsProviders": [
      {
        "id": "lyrics",
        "title": "歌词候选"
      }
    ],
    "coverProviders": [
      {
        "id": "covers",
        "title": "封面候选"
      }
    ],
    "panels": [
      {
        "id": "main",
        "title": "Metadata Helper",
        "path": "panel.html"
      }
    ],
    "settings": [
      {
        "id": "provider-base-url",
        "title": "Provider URL",
        "type": "string",
        "defaultValue": "https://example.com/api"
      },
      {
        "id": "enable-extra-lookup",
        "title": "Extra lookup",
        "type": "boolean",
        "defaultValue": false
      }
    ]
  }
}
```

字段说明：

| 字段 | 规则 |
| --- | --- |
| `id` | 插件唯一 id，2 到 64 个字符，小写字母或数字开头，可含小写字母、数字、`.`、`_`、`-` |
| `name` | 显示名称，最多约 80 字符 |
| `version` | 插件版本字符串，最多约 40 字符 |
| `apiVersion` | 当前支持 1 到 2，新插件推荐 2 |
| `minEchoVersion` | 可选，仅作为兼容性展示和作者提示 |
| `entry` | 入口脚本文件名，必须是插件根目录内 `.js` 文件，不能写子目录 |
| `panel` | 可选面板文件名，必须是插件根目录内 `.html` 文件 |
| `permissions` | 插件请求权限，用户启用时确认 |
| `contributes.commands` | 插件命令声明，UI 可以展示 |
| `contributes.panels` | 面板入口声明 |
| `contributes.metadataProviders` | 元数据候选 provider |
| `contributes.sourceProviders` | 自定义音源 provider |
| `contributes.lyricsProviders` | 歌词候选 provider |
| `contributes.coverProviders` | 封面候选 provider |
| `contributes.themePresets` | 可导入的自定义主题预设 |
| `contributes.settings` | 插件自己的设置表单 |

注意：manifest 里的贡献点用于展示和声明。真正可运行的命令/provider 仍然要在 `plugin.js` 里注册。

## 主题预设

插件可以通过 `contributes.themePresets` 声明可导入的主题。主题贡献不需要权限，也不需要在 `plugin.js` 里注册逻辑；启用插件后，它会出现在“设置 > 外观”的插件主题区域。用户点击后，ECHO 会把它导入到“我的主题”，之后仍可继续微调、导出或删除。

主题插件只能提供结构化主题参数，不能注入任意 CSS。颜色只接受 `#RRGGBB`，数值会被宿主夹在安全范围内，`preview` 只接受纯色或 `linear-gradient(...)` 预览。每个主题至少要提供 `light` 或 `dark` 其中一组覆盖。

每个插件最多贡献 12 个主题。`light` / `dark` 可覆盖的颜色字段包括 `appBg`、`appBg2`、`appBg3`、`panel`、`panelSoft`、`accent`、`accentStrong`、`secondary`、`heading`、`text`、`muted`、`border`、`onAccent`、`buttonText`、`titlebar`、`sidebar`、`player`、`field`、`row`、`rowHover`、`rowActive`、`chip`、`focus`、`danger`、`success`、`warning`。

可覆盖的数值字段：`panelOpacityPercent` 40-100，`glassPercent` 0-80，`shadowPercent` 0-100，`cornerRadiusPx` 0-28，`panelBlurPx` 0-32，`saturationPercent` 60-140，`motionEnabled` 布尔值，`motionSpeedSeconds` 0.12-8，`motionIntensityPercent` 0-160。

```json
{
  "id": "echo.aurora-theme",
  "name": "Aurora Theme",
  "version": "0.1.0",
  "apiVersion": 2,
  "entry": "plugin.js",
  "permissions": [],
  "contributes": {
    "themePresets": [
      {
        "id": "aurora-glass",
        "title": "Aurora Glass",
        "description": "高透明玻璃、冷色背景和暖色强调。",
        "basePreset": "classic",
        "preview": "linear-gradient(135deg, #08111f 0%, #183b56 48%, #f0b35b 100%)",
        "swatches": ["#08111f", "#183b56", "#f0b35b", "#e8f8ff"],
        "light": {
          "appBg": "#eef8ff",
          "panel": "#ffffff",
          "accent": "#257f96",
          "text": "#234150",
          "panelOpacityPercent": 78,
          "glassPercent": 26,
          "cornerRadiusPx": 10,
          "panelBlurPx": 18,
          "saturationPercent": 108
        },
        "dark": {
          "appBg": "#08111f",
          "panel": "#142234",
          "accent": "#5cc8dc",
          "text": "#c8dce8",
          "panelOpacityPercent": 72,
          "glassPercent": 34,
          "cornerRadiusPx": 10,
          "panelBlurPx": 22,
          "motionIntensityPercent": 90
        }
      }
    ]
  }
}
```

## API 版本选择

推荐直接使用 `apiVersion: 2`。

`apiVersion: 1` 的行为：

- `echo.settings.get()` 读取应用设置快照。
- `echo.settings.set(patch)` 写应用设置 patch，需要 `settings:write`，风险高。
- `echo.net` 不可用。
- 仍兼容早期示例插件。

`apiVersion: 2` 的行为：

- `echo.settings.get(key)` / `getAll()` / `set(...)` 只读写本插件自己的设置，不再写全局应用设置。
- `echo.net.fetchJson()` / `fetchText()` 可用，但必须声明并被用户信任 `network` 权限。
- 可以声明 `lyricsProviders`、`coverProviders`、`settings`。

除非你在维护旧插件，否则不要用 v1 写应用全局设置。新插件的配置应放在 `contributes.settings` 里。

## 权限设计

插件默认禁用。启用时用户必须确认 manifest 里请求的所有权限。缺少信任权限时，API 会抛出 `plugin_permission_denied:*`。

写权限时把自己当成用户：如果一个插件说“我只是显示当前播放”，却申请了 `network`、`settings:write`、`sources:provide`，用户很难放心启用。权限不是能力清单越多越专业，而是越少越可信。

推荐写法是“用到什么，申请什么，并在 README 里解释为什么”：

```md
权限说明：
- playback:read：读取当前播放状态，用来显示正在播放的歌曲。
- network：访问我配置的歌词 API，只在用户点击“查询歌词”时触发。
```

不推荐写法：

```json
"permissions": ["playback:read", "playback:control", "library:read", "settings:write", "network"]
```

除非每个权限都有明确功能，否则这种写法会让用户和维护者都很难判断风险。

| 权限 | 状态 | 风险 | 说明 |
| --- | --- | --- | --- |
| `playback:read` | 已开放 | 低 | 读取当前播放状态、曲目 id、进度、音频状态快照 |
| `playback:control` | 已开放 | 中 | 播放、暂停、停止、跳转 |
| `library:read` | 已开放 | 中 | 分页读取曲库摘要和公开曲目字段，也用于 metadata、lyrics、cover provider |
| `sources:provide` | 已开放 | 中 | 注册自定义音源搜索和播放解析 |
| `settings:read` | 已开放 | 中 | v1 读取应用设置；v2 插件设置不需要它 |
| `settings:write` | 已开放 | 高 | v1 写应用设置 patch；新插件尽量不要申请 |
| `network` | 已开放 | 高 | v2 通过宿主受控 API 访问 `http` / `https` |
| `fs:plugin` | 受限 | 中 | 不开放任意文件 API，插件存储请用 `echo.storage` |
| `library:write` | 预留 | 高 | 当前不提供实际曲库写入 API |

权限最小化建议：

- 只展示播放状态：只申请 `playback:read`。
- 控制播放：再加 `playback:control`。
- 做曲库统计、元数据、歌词、封面候选：申请 `library:read`。
- 做自定义音源：申请 `sources:provide`。
- 访问第三方 API：使用 `apiVersion: 2` 并申请 `network`。
- 不要为了“以后可能用”提前申请高风险权限。

权限改动后，要回到插件页刷新并重新确认启用。用户已经信任过的旧权限，不代表新权限会自动被信任。

## `plugin.js` 运行环境

`plugin.js` 在 Node `vm` 沙箱中运行，但不是普通 Node 脚本。

可用全局对象：

- `echo`
- `console.log` / `console.warn` / `console.error`
- `setTimeout`
- `clearTimeout`

不可用：

- `require`
- `import`
- `process`
- `window`
- `document`
- Node 文件系统、网络、数据库、Electron 模块

入口脚本同步启动阶段最多运行约 1 秒。不要在文件顶层做重 CPU 工作。网络、曲库查询、批处理都应放进命令或 provider handler 里，并保持短小。

最小入口：

```js
console.log('plugin loaded');

echo.commands.register('hello', { title: 'Hello' }, async () => {
  await echo.ui.notify('Hello from plugin');
  return { ok: true };
});
```

## 公开 API 总览

| API | 权限 | 用途 |
| --- | --- | --- |
| `echo.events.on(eventName, handler)` | 视事件而定 | 监听宿主事件 |
| `echo.commands.register(id, options, handler)` | 无固定权限 | 注册可由宿主或面板触发的命令 |
| `echo.playback.getStatus()` | `playback:read` | 获取播放状态 |
| `echo.playback.play/pause/stop/seek()` | `playback:control` | 控制播放 |
| `echo.library.getSummary()` | `library:read` | 获取曲库摘要 |
| `echo.library.getTracks(query)` | `library:read` | 分页读取公开曲目字段 |
| `echo.metadata.registerProvider(...)` | `library:read` | 返回元数据候选 |
| `echo.lyrics.registerProvider(...)` | `library:read` | 返回歌词候选 |
| `echo.covers.registerProvider(...)` | `library:read` | 返回封面候选 |
| `echo.sources.registerProvider(...)` | `sources:provide` | 返回音源候选和播放 URL |
| `echo.settings.get/getAll/set` | v2 为插件设置 | 读写插件自己的设置 |
| `echo.net.fetchJson/fetchText` | `network` + v2 | 宿主受控网络请求 |
| `echo.storage.get/set` | 无任意 FS | 读写插件自己的小型 JSON 存储 |
| `echo.ui.notify(message)` | 无固定权限 | 写插件日志通知 |

## 事件

当前开放事件：

| 事件 | 权限 | 频率与含义 |
| --- | --- | --- |
| `playback:status` | `playback:read` | 播放状态合并推送，约 500ms 节流，也就是最多约 2Hz |
| `library:changed` | `library:read` | 曲库变化信号，payload 不保证长期稳定，只当刷新信号用 |

示例：

```js
const unsubscribe = echo.events.on('playback:status', async (status) => {
  await echo.storage.set('lastStatus', {
    state: status.state,
    trackId: status.currentTrackId,
    positionSeconds: Math.round(status.positionSeconds || 0)
  });
});

echo.commands.register('stop-listening', { title: '停止监听' }, () => {
  unsubscribe();
});
```

事件 handler 最多约 2 秒，超时会记录 `plugin_event_handler_timeout`。不要在 `playback:status` 里做网络请求、全库查询或大 JSON 写入。

## 命令

命令适合用户手动触发的动作，例如“记录当前播放”“查询当前曲目”“导出一个小摘要”。

```js
echo.commands.register('copy-now-playing', { title: '记录当前播放' }, async () => {
  const status = await echo.playback.getStatus();
  await echo.storage.set('lastCommandResult', {
    trackId: status.currentTrackId,
    state: status.state,
    savedAt: new Date().toISOString()
  });
  await echo.ui.notify('已记录当前播放状态。');
  return { ok: true };
});
```

命令限制：

- 参数 JSON 最大约 64 KB。
- 返回 JSON 最大约 256 KB。
- 执行超时约 2 秒。
- 失败会写入插件日志。

如果任务超过 2 秒，应拆成多次手动命令，或只返回“已排队”的轻量结果。当前插件系统不适合做长驻后台任务。

## 播放状态与播放控制

读取状态：

```js
const status = await echo.playback.getStatus();
console.log(status.state, status.currentTrackId, status.positionSeconds);
```

控制播放：

```js
await echo.playback.pause();
await echo.playback.seek(60);
await echo.playback.play();
```

播放控制是中风险能力。插件不要自动根据高频事件连续 `seek()` 或 `play/pause()`，否则会破坏用户操作和播放稳定性。

## 曲库读取

曲库 API 永远要分页。

```js
const page = await echo.library.getTracks({
  page: 1,
  pageSize: 50,
  search: 'artist or title',
  sort: 'recent',
  sourceProvider: 'local',
  fields: ['id', 'title', 'artist', 'album', 'duration', 'coverThumb']
});
```

限制：

- `pageSize` 最大 100，默认 50。
- `search` 最大约 120 字符。
- 默认字段：`id`、`mediaType`、`path`、`title`、`artist`、`album`、`duration`、`coverThumb`、`unavailable`。
- 可选字段以 `docs/plugin-sdk/echo-plugin.d.ts` 和 `src/shared/types/plugins.ts` 为准。

分页批处理建议：

```js
echo.commands.register('count-missing-album', { title: '统计缺少专辑的曲目' }, async () => {
  let page = 1;
  let missing = 0;

  while (page <= 20) {
    const result = await echo.library.getTracks({
      page,
      pageSize: 100,
      fields: ['id', 'title', 'album']
    });

    missing += result.items.filter((track) => !track.album).length;
    if (!result.hasMore) break;
    page += 1;

    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  await echo.ui.notify(`前 ${page} 页里有 ${missing} 首缺少专辑。`);
  return { missing, scannedPages: page };
});
```

不要一次拉完整曲库。大型曲库会跨进程传输大量 JSON，影响 UI 和播放响应。

## 元数据 Provider

Metadata Provider 返回候选标签，不直接写曲库。宿主会裁剪字段、展示候选，并由用户决定是否采用。

Manifest：

```json
{
  "permissions": ["library:read"],
  "contributes": {
    "metadataProviders": [
      { "id": "tags", "title": "标签候选" }
    ]
  }
}
```

`plugin.js`：

```js
echo.metadata.registerProvider('tags', { title: '标签候选' }, async ({ track }) => {
  if (!track.title || !track.artist) {
    return { candidates: [] };
  }

  return {
    candidates: [
      {
        title: track.title,
        artist: track.artist,
        album: track.album,
        genre: 'Alternative',
        year: 2026,
        confidence: 0.8,
        source: 'My Plugin',
        sourceUrl: 'https://example.com'
      }
    ]
  };
});
```

候选字段：

- `title`
- `artist`
- `album`
- `albumArtist`
- `genre`
- `year`
- `trackNo`
- `discNo`
- `bpm`
- `confidence`，范围 0 到 1
- `source`
- `sourceUrl`

限制：

- 单插件最多 8 个 metadata provider。
- 单 provider 每次最多 5 个候选。
- 请求最大约 32 KB，返回最大约 64 KB。
- provider 超时约 2.5 秒。
- 不返回二进制封面，不写文件，不写 SQLite。

## 歌词 Provider

歌词 Provider 返回歌词候选，宿主决定是否预览、应用或缓存。

Manifest：

```json
{
  "apiVersion": 2,
  "permissions": ["library:read"],
  "contributes": {
    "lyricsProviders": [
      { "id": "lyrics", "title": "歌词候选" }
    ]
  }
}
```

`plugin.js`：

```js
echo.lyrics.registerProvider('lyrics', { title: '歌词候选' }, async ({ track }) => {
  if (!track.title) {
    return { candidates: [] };
  }

  return {
    candidates: [
      {
        title: track.title,
        language: 'zh',
        lrc: '[00:00.00]示例歌词',
        source: 'My Lyrics Provider',
        confidence: 0.7
      }
    ]
  };
});
```

候选字段：

- `title`
- `language`
- `lrc`
- `text`
- `source`
- `sourceUrl`
- `confidence`

限制：

- 单插件最多 4 个 lyrics provider。
- 单 provider 每次最多 5 个候选。
- `lrc` / `text` 会被裁剪到约 80 KB。
- 请求最大约 32 KB，返回最大约 128 KB。
- provider 超时约 2.5 秒。

## 封面 Provider

Cover Provider 返回图片 URL 候选。候选必须是 `http` / `https` 图片 URL，宿主负责后续缓存、裁剪、写库决策。

Manifest：

```json
{
  "apiVersion": 2,
  "permissions": ["library:read"],
  "contributes": {
    "coverProviders": [
      { "id": "covers", "title": "封面候选" }
    ]
  }
}
```

`plugin.js`：

```js
echo.covers.registerProvider('covers', { title: '封面候选' }, async ({ track }) => {
  if (!track.album && !track.title) {
    return { candidates: [] };
  }

  return {
    candidates: [
      {
        imageUrl: 'https://example.com/cover.jpg',
        title: track.album || track.title,
        source: 'My Cover Provider',
        width: 1200,
        height: 1200,
        confidence: 0.75
      }
    ]
  };
});
```

限制：

- 单插件最多 4 个 cover provider。
- 单 provider 每次最多 8 个候选。
- `imageUrl` 必须是 `http` / `https`。
- 请求最大约 32 KB，返回最大约 128 KB。
- provider 超时约 2.5 秒。

## 自定义音源 Provider

Source Provider 用于“插件音源”。它只返回搜索候选，并在用户触发播放时解析成显式音频 URL。

它不是远程库同步 provider，也不能写入远程曲库、DSP、解码器或输出链路。Source Provider 也不是下载接口、破解接口或官方音源背书；插件作者必须确认返回的候选和播放 URL 合法可访问，相关法律责任由插件作者、使用者或服务提供方自行承担。

Manifest：

```json
{
  "apiVersion": 2,
  "permissions": ["sources:provide"],
  "contributes": {
    "sourceProviders": [
      { "id": "direct-url", "title": "Direct URL Demo" }
    ]
  }
}
```

`plugin.js`：

```js
const demoTracks = [
  {
    providerTrackId: 'demo-stream',
    title: 'Demo stream',
    artist: 'Local plugin',
    album: 'Custom source',
    duration: null,
    playable: true,
    source: 'Direct URL Demo',
    url: 'https://example.com/audio/demo.mp3'
  }
];

echo.sources.registerProvider('direct-url', { title: 'Direct URL Demo' }, {
  search: async ({ query }) => {
    const needle = String(query || '').toLowerCase();
    return {
      tracks: demoTracks
        .filter((track) => !needle || `${track.title} ${track.artist}`.toLowerCase().includes(needle))
        .map(({ url, ...track }) => track),
      total: demoTracks.length,
      hasMore: false
    };
  },
  resolvePlayback: async ({ providerTrackId }) => {
    const track = demoTracks.find((item) => item.providerTrackId === providerTrackId);
    if (!track) {
      throw new Error('plugin_source_track_not_found');
    }
    return {
      url: track.url,
      mimeType: 'audio/mpeg',
      supportsRange: true
    };
  }
});
```

搜索候选字段：

- `providerTrackId`，必填
- `title`，必填
- `artist`
- `album`
- `albumArtist`
- `duration`
- `coverUrl`
- `webUrl`
- `playable`
- `unavailableReason`
- `source`

播放解析字段：

- `url`，必填，必须是 `http` / `https`
- `expiresAt`
- `mimeType`
- `bitrate`
- `sampleRate`
- `bitDepth`
- `codec`
- `headers`
- `requiresProxy`
- `supportsRange`

限制：

- 单插件最多 4 个 source provider。
- 单 provider 每次最多 25 个搜索候选。
- 搜索请求最大约 32 KB，搜索返回最大约 128 KB。
- 播放解析请求最大约 16 KB，播放解析返回最大约 32 KB。
- provider 超时约 2.5 秒。
- `resolvePlayback` 只应在用户真的要播放时做必要解析，不要在 `search` 里预拉所有播放 URL。

## 插件设置

v2 插件设置由 manifest 声明，宿主在插件详情页渲染表单，并保存到 `plugin-settings.json`。

支持类型：

- `string`
- `select`
- `boolean`
- `number`
- `secret`

示例：

```json
{
  "contributes": {
    "settings": [
      {
        "id": "base-url",
        "title": "API URL",
        "description": "第三方 API 地址",
        "type": "string",
        "defaultValue": "https://example.com"
      },
      {
        "id": "quality",
        "title": "Quality",
        "type": "select",
        "defaultValue": "high",
        "options": [
          { "label": "High", "value": "high" },
          { "label": "Low", "value": "low" }
        ]
      },
      {
        "id": "enabled",
        "title": "Enabled",
        "type": "boolean",
        "defaultValue": false
      },
      {
        "id": "limit",
        "title": "Limit",
        "type": "number",
        "defaultValue": 5,
        "min": 1,
        "max": 25
      },
      {
        "id": "api-key",
        "title": "API Key",
        "type": "secret"
      }
    ]
  }
}
```

读取设置：

```js
const baseUrl = await echo.settings.get('base-url');
const allSettings = await echo.settings.getAll();
```

写入设置：

```js
await echo.settings.set('enabled', true);
await echo.settings.set({ limit: 10 });
```

注意：

- v2 设置是插件自己的命名空间，不写应用全局 settings。
- 宿主会按 manifest 过滤和裁剪设置值。
- `secret` 只是 UI 上用密码框显示，当前不是系统凭据保险箱。不要保存高价值长期密钥。
- 单个设置 patch 最大约 32 KB。
- 插件设置总量最大约 128 KB。
- 插件包导出不包含 `plugin-settings.json`。

## 网络访问

网络访问只在 `apiVersion: 2` 生效，并且必须申请 `network` 权限。

Manifest：

```json
{
  "apiVersion": 2,
  "permissions": ["network"]
}
```

请求 JSON：

```js
const data = await echo.net.fetchJson({
  url: 'https://example.com/api/search?q=test',
  method: 'GET',
  headers: {
    accept: 'application/json'
  },
  timeoutMs: 3000
});
```

请求文本：

```js
const text = await echo.net.fetchText('https://example.com/lyrics.txt');
```

限制：

- 只允许 `http` / `https` URL。
- 只允许 `GET` / `POST`。
- 请求 JSON 最大约 64 KB。
- 响应最大约 512 KB。
- 默认和最大超时约 5 秒。
- 允许的请求 header：`accept`、`accept-language`、`content-type`、`user-agent`。
- `authorization`、`cookie`、`set-cookie`、`x-api-key`、`x-auth-token` 等敏感 header 会被过滤。
- 非 2xx 响应会抛出 `plugin_network_http_<status>`。

网络 provider 编写建议：

- 把网络请求放到用户触发的命令或 provider handler 中。
- 对同一首歌的结果做插件 storage 缓存，但控制大小。
- 不要在 `playback:status` 事件里请求网络。
- 不要用短间隔轮询。
- 对失败返回空候选，并写清楚日志。

## 插件存储

`echo.storage` 用于保存插件自己的小型 JSON 数据。

```js
await echo.storage.set('lastLookup', {
  title: 'Song',
  savedAt: new Date().toISOString()
});

const lastLookup = await echo.storage.get('lastLookup');
```

限制：

- key 最大约 96 字符。
- 单个 value 最大约 64 KB。
- 单插件 storage 总量最大约 256 KB。
- 存储文件是 `plugin-storage.json`。
- 插件包导出不包含 storage。

storage 适合保存缓存索引、上次操作状态、小型配置。不要保存整页曲库、图片二进制、歌词大集合或长日志。

## 面板 `panel.html`

面板作为 sandbox iframe 运行。它不接触主应用 DOM，也不能直接访问 `plugin.js` 里的 `echo` 对象。

面板要和宿主交互，只能通过受控 `postMessage` bridge：

```js
parent.postMessage({
  channel: 'echo:plugin-panel',
  version: 1,
  type: 'request',
  requestId: 'request-1',
  pluginId: 'echo.my-plugin',
  action: 'plugin:getSummary'
}, '*');
```

响应：

```js
window.addEventListener('message', (event) => {
  const message = event.data;
  if (message?.channel !== 'echo:plugin-panel' || message.type !== 'response') {
    return;
  }
  if (message.ok) {
    console.log(message.result);
  } else {
    console.error(message.error);
  }
});
```

当前 panel action：

| action | payload | 作用 |
| --- | --- | --- |
| `plugin:getSummary` | 无 | 返回当前插件摘要、权限、活动、安全信息 |
| `plugin:getLogs` | 无 | 返回当前插件日志 |
| `plugin:runCommand` | `{ "commandId": "...", "args": [] }` | 执行当前插件命令 |

面板想做有权限的事，应在 `plugin.js` 里注册命令，再由面板触发 `plugin:runCommand`。不要假设面板可以直接读曲库或控制播放。

最小面板：

```html
<!doctype html>
<meta charset="utf-8">
<button id="refresh">刷新</button>
<pre id="output">等待中...</pre>
<script>
const pluginId = 'echo.my-plugin';
const channel = 'echo:plugin-panel';
const pending = new Map();
const output = document.getElementById('output');

window.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || message.channel !== channel || message.type !== 'response') return;
  const resolve = pending.get(message.requestId);
  if (!resolve) return;
  pending.delete(message.requestId);
  resolve(message);
});

function requestHost(action, payload) {
  return new Promise((resolve) => {
    const requestId = `${Date.now()}-${Math.random()}`;
    pending.set(requestId, resolve);
    parent.postMessage({ channel, version: 1, type: 'request', requestId, pluginId, action, payload }, '*');
  });
}

document.getElementById('refresh').addEventListener('click', async () => {
  output.textContent = JSON.stringify(await requestHost('plugin:getSummary'), null, 2);
});
</script>
```

## 导入、导出与发布

插件页可以导出 `.json` 插件包。包结构：

```json
{
  "type": "echo-next-plugin-package",
  "version": 1,
  "exportedAt": "2026-05-29T00:00:00.000Z",
  "manifest": {},
  "files": [
    {
      "path": "plugin.js",
      "content": "..."
    }
  ]
}
```

导出规则：

- 包最大约 2 MB。
- 最多 32 个文件。
- 单文件最大约 512 KB。
- 只导出插件根目录文件，不递归子目录。
- 排除 `plugin-state.json`、`plugin-storage.json`、`plugin-settings.json`。
- 排除 `.echo-plugin.json` 包文件，避免递归打包。

导入规则：

- 必须是 `type: "echo-next-plugin-package"` 和 `version: 1`。
- 目标插件 id 已存在时，普通 UI 导入会拒绝覆盖。
- 导入后默认禁用，需要用户确认权限再启用。
- 宿主记录来源、导入时间、包版本和 checksum。

发布前清单：

- `echo.plugin.json` 使用 `apiVersion: 2`，除非维护旧插件。
- 权限最小化。
- README 写清用途、权限原因、第三方服务边界。
- README 写清“安装到哪里、怎么启用、怎么重载、怎么卸载”。
- 不包含个人 token、cookie、运行缓存。
- 不依赖本机绝对路径。
- 不使用高频轮询。
- 大数据都分页。
- 错误路径有清晰日志。
- 在播放音乐时试一次插件主流程，确认没有明显卡顿。
- 导出包后用另一个空插件目录导入一次，确认没有漏文件。

发布包里不要承诺 ECHO 没开放的能力。比如“直接改源音频文件”“自动写曲库”“注入播放器 UI”“接管 DSP 链路”都不是普通插件能力。

## 调试

插件页会显示：

- manifest 解析错误。
- 启用状态。
- 权限风险。
- 面板 sandbox 状态。
- 命令/provider 数量。
- 活动摘要，例如命令次数、事件次数、网络次数、storage 写入次数、错误次数。
- 插件日志。

`console.log` / `console.warn` / `console.error` 会进入插件日志：

```js
console.log('lookup started');
console.warn('provider returned no result');
console.error('lookup failed', error.message);
```

常用排查顺序：

1. manifest 是否能被插件页识别。
2. 插件是否已启用，权限是否全部确认。
3. `plugin.js` 顶层是否抛错。
4. 命令是否注册，id 是否一致。
5. provider 是否申请了正确权限。
6. 返回 JSON 是否超出大小限制。
7. 网络是否缺少 `network` 权限或被 header 限制挡住。
8. 面板 `pluginId`、`channel`、`requestId` 是否正确。

排错时别一次改很多地方。先把 `plugin.js` 改成只输出一行日志，再确认启用；再注册一个只返回 `{ ok: true }` 的命令；最后才把真实逻辑加回来。这样最快，也最不容易把一个小 typo 误判成系统问题。

连续启动失败保护：

- 10 分钟内连续 3 次启动失败，宿主会自动禁用插件。
- 日志里会出现 `plugin_disabled_after_repeated_errors`。
- 修复文件后，可以手动重新启用。

## 性能与播放安全

ECHO 是播放器，插件必须默认把播放体验放在第一位。

必须遵守：

- 不在顶层做重 CPU 工作。
- 不在 `playback:status` 里做网络请求、全库查询或大写入。
- 不高频调用 `seek()`、`play()`、`pause()`。
- 曲库读取永远分页。
- Provider handler 保持 2.5 秒内完成。
- 网络超时设置短一点，失败返回空候选。
- 大任务拆成手动命令，不要自启动后台扫库。
- storage 只保存小型 JSON。
- source provider 的 `search` 只返回候选，`resolvePlayback` 只在播放时解析。
- 对第三方 API 失败、限流、空结果保持安静，不弹出连续噪声。

推荐模式：

```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scanSomePages(maxPages) {
  for (let page = 1; page <= maxPages; page += 1) {
    const result = await echo.library.getTracks({ page, pageSize: 100 });
    // do small work
    if (!result.hasMore) break;
    await sleep(0);
  }
}
```

不推荐模式：

```js
// 不要这样：事件太高频，还叠加曲库和网络。
echo.events.on('playback:status', async () => {
  const tracks = await echo.library.getTracks({ pageSize: 100 });
  await echo.net.fetchJson('https://example.com/update');
  await echo.storage.set('huge', tracks);
});
```

## 常见错误码

| 错误码 | 含义与处理 |
| --- | --- |
| `plugin_permission_confirmation_required` | 启用时没有确认全部请求权限 |
| `plugin_permission_denied:*` | 调用了未被信任的能力 |
| `plugin_manifest_invalid` | manifest 解析失败 |
| `apiVersion must be between 1 and 2` | API 版本不兼容当前宿主 |
| `plugin_not_enabled` | 插件未启用或已被宿主禁用 |
| `plugin_command_not_found` | 命令未注册或 id 写错 |
| `plugin_command_timeout` | 命令超过约 2 秒 |
| `plugin_command_args_too_large` | 命令参数超过约 64 KB |
| `plugin_command_result_too_large` | 命令返回超过约 256 KB |
| `plugin_event_not_supported:*` | 监听了未开放事件 |
| `plugin_event_handler_limit` | 同插件事件 handler 太多 |
| `plugin_event_handler_timeout` | 异步事件 handler 超过约 2 秒 |
| `plugin_metadata_provider_invalid` | metadata provider 注册参数不合法 |
| `plugin_metadata_provider_limit` | metadata provider 超过 8 个 |
| `plugin_metadata_provider_timeout` | metadata provider 超过约 2.5 秒 |
| `plugin_metadata_request_too_large` | metadata 请求超过约 32 KB |
| `plugin_metadata_result_too_large` | metadata 返回超过约 64 KB |
| `plugin_lyrics_provider_invalid` | lyrics provider 注册参数不合法 |
| `plugin_lyrics_provider_limit` | lyrics provider 超过 4 个 |
| `plugin_lyrics_provider_timeout` | lyrics provider 超过约 2.5 秒 |
| `plugin_cover_provider_invalid` | cover provider 注册参数不合法 |
| `plugin_cover_provider_limit` | cover provider 超过 4 个 |
| `plugin_cover_provider_timeout` | cover provider 超过约 2.5 秒 |
| `plugin_source_provider_invalid` | source provider 注册参数不合法 |
| `plugin_source_provider_limit` | source provider 超过 4 个 |
| `plugin_source_provider_timeout` | source provider 超过约 2.5 秒 |
| `plugin_source_provider_not_playable` | source provider 没有 `resolvePlayback` |
| `plugin_source_playback_url_invalid` | 播放 URL 不是合法 `http` / `https` |
| `plugin_source_search_request_too_large` | source 搜索请求超过约 32 KB |
| `plugin_source_search_result_too_large` | source 搜索返回超过约 128 KB |
| `plugin_source_playback_request_too_large` | source 播放解析请求超过约 16 KB |
| `plugin_source_playback_result_too_large` | source 播放解析返回超过约 32 KB |
| `plugin_storage_value_too_large` | 单个 storage value 超过约 64 KB |
| `plugin_storage_quota_exceeded` | 插件 storage 总量超过约 256 KB |
| `plugin_settings_patch_too_large` | 设置 patch 超过约 32 KB |
| `plugin_setting_value_too_large` | 插件设置单次写入过大 |
| `plugin_settings_quota_exceeded` | 插件设置总量超过约 128 KB |
| `plugin_network_requires_api_v2` | v1 插件调用了网络 API |
| `plugin_network_url_invalid` | 网络 URL 不合法 |
| `plugin_network_method_not_allowed` | 网络方法不是 `GET` / `POST` |
| `plugin_network_request_too_large` | 网络请求超过约 64 KB |
| `plugin_network_response_too_large` | 网络响应超过约 512 KB |
| `plugin_network_http_<status>` | 第三方服务返回非 2xx |
| `plugin_package_invalid` | 导入文件不是 ECHO 插件包 |
| `plugin_package_too_large` | 插件包超过约 2 MB |
| `plugin_package_file_limit_exceeded` | 插件包文件超过 32 个 |
| `plugin_package_file_too_large` | 单个包文件超过约 512 KB |
| `plugin_import_target_exists` | 目标插件 id 已存在，普通导入拒绝覆盖 |
| `plugin_disabled_after_repeated_errors` | 插件连续启动失败，被宿主自动隔离 |

## 完整示例：网络元数据候选插件

`echo.plugin.json`：

```json
{
  "id": "echo.demo-metadata",
  "name": "Demo Metadata",
  "version": "0.1.0",
  "apiVersion": 2,
  "entry": "plugin.js",
  "panel": "panel.html",
  "permissions": ["library:read", "network"],
  "contributes": {
    "commands": [
      { "id": "test-lookup", "title": "测试查询" }
    ],
    "metadataProviders": [
      { "id": "tags", "title": "Demo 标签候选" }
    ],
    "settings": [
      {
        "id": "base-url",
        "title": "API URL",
        "type": "string",
        "defaultValue": "https://example.com"
      }
    ],
    "panels": [
      { "id": "main", "title": "Demo Metadata", "path": "panel.html" }
    ]
  }
}
```

`plugin.js`：

```js
async function lookup(track) {
  const baseUrl = await echo.settings.get('base-url');
  if (!baseUrl || !track.title) {
    return [];
  }

  try {
    const url = `${String(baseUrl).replace(/\/$/, '')}/search?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist || '')}`;
    const data = await echo.net.fetchJson({
      url,
      headers: { accept: 'application/json' },
      timeoutMs: 3000
    });

    if (!Array.isArray(data?.items)) {
      return [];
    }

    return data.items.slice(0, 3).map((item) => ({
      title: item.title || track.title,
      artist: item.artist || track.artist,
      album: item.album,
      genre: item.genre,
      year: Number(item.year) || undefined,
      confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0.5)),
      source: 'Demo Metadata',
      sourceUrl: item.url
    }));
  } catch (error) {
    console.warn('lookup failed', error.message);
    return [];
  }
}

echo.metadata.registerProvider('tags', { title: 'Demo 标签候选' }, async ({ track }) => ({
  candidates: await lookup(track)
}));

echo.commands.register('test-lookup', { title: '测试查询' }, async () => {
  const page = await echo.library.getTracks({
    page: 1,
    pageSize: 1,
    sort: 'recent',
    fields: ['id', 'title', 'artist', 'album']
  });

  const track = page.items[0];
  if (!track) {
    await echo.ui.notify('曲库为空。');
    return { candidates: [] };
  }

  const candidates = await lookup(track);
  await echo.ui.notify(`找到 ${candidates.length} 个候选。`);
  return { track, candidates };
});
```

`panel.html`：

```html
<!doctype html>
<meta charset="utf-8">
<style>
  body { font: 14px system-ui; margin: 16px; color: #1f2937; }
  button { padding: 6px 10px; }
  pre { white-space: pre-wrap; border: 1px solid #d1d5db; padding: 12px; }
</style>
<button id="run">测试查询</button>
<pre id="output">等待操作...</pre>
<script>
const pluginId = 'echo.demo-metadata';
const channel = 'echo:plugin-panel';
const pending = new Map();
const output = document.getElementById('output');

window.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || message.channel !== channel || message.type !== 'response') return;
  const resolve = pending.get(message.requestId);
  if (!resolve) return;
  pending.delete(message.requestId);
  resolve(message);
});

function requestHost(action, payload) {
  return new Promise((resolve) => {
    const requestId = `${Date.now()}-${Math.random()}`;
    pending.set(requestId, resolve);
    parent.postMessage({ channel, version: 1, type: 'request', requestId, pluginId, action, payload }, '*');
  });
}

document.getElementById('run').addEventListener('click', async () => {
  const response = await requestHost('plugin:runCommand', { commandId: 'test-lookup' });
  output.textContent = JSON.stringify(response, null, 2);
});
</script>
```

## 作者检查清单

写插件前：

- 明确插件是命令、provider、面板，还是三者组合。
- 列出必须权限，删掉“可能用得上”的权限。
- 判断是否需要 `network`。如果需要，使用 `apiVersion: 2`。
- 判断是否真的需要面板。简单工具优先做命令。

写插件时：

- 顶层只注册 handler，不做重工作。
- 所有曲库操作分页。
- 所有网络请求有短超时。
- 所有 provider 返回候选，不直接写库。
- 所有错误都能返回空结果或清晰日志。
- 不把 token、cookie、用户缓存打进发布包。

发布前：

- 新装导入后默认禁用是正常行为。
- 启用权限说明能让用户看懂。
- 插件连续启动失败不会让主程序坏掉。
- 导出包里没有 `plugin-storage.json`、`plugin-settings.json`、`plugin-state.json`。
- 在播放音乐时试一次插件主流程，确认没有明显卡顿。

## 源码参考

主要契约位置：

- `src/shared/types/plugins.ts`
- `docs/plugin-sdk/echo-plugin.d.ts`
- `src/main/plugins/PluginManifest.ts`
- `src/main/plugins/PluginService.ts`
- `src/main/ipc/pluginIpc.ts`
- `src/renderer/pages/PluginsPage.tsx`

如果文档和代码不一致，以这些源码文件为准。

---

# 快速导航

Source: src/content/docs/zh/docs/quick-navigation.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/quick-navigation/
Description: 按问题类型快速找到 ECHO Next 文档入口，少走弯路。

这页给已经带着问题进来的用户。先按你的目标找入口，不要从头翻完整文档。

## 提问前先查文档

提问前请先查文档，善用左侧目录、页面内搜索和站内搜索。安装、导入音源、曲库、音频输出、远程来源、插件、Pro、排障和法律边界这些常见问题，很多已经写在对应页面里。

不要把文档里已经写明、搜索一下就能找到、没有任何环境信息和复现步骤的问题反复拿来问。问问题前至少说清楚你看过哪一页、卡在哪一步、系统版本、ECHO 版本、正在做什么、看到什么错误。

如果你选择跳过文档、跳过搜索、不给信息，只丢一句“怎么弄”“不能用”“为什么不行”，那就不要指望别人像客服一样毕恭毕敬地服务你。这里不是付费客服关系，维护者和你没有任何必然的利益往来，也没有义务把已经写好的资料再手把手念一遍。

想让别人认真帮你，就先把问题问清楚；想快速找资料，就从下面的导航开始。

## 先按目标找

| 你现在想做什么 | 先看这里 |
| --- | --- |
| 第一次下载、安装、打开 ECHO | [零基础安装启动教程](../zero-basics/) |
| 已经安装好，想最快跑通播放 | [快速开始](../quick-start/) |
| 不知道本地文件、远程库、插件音源该选哪个 | [导入音源](../import-audio-sources/) |
| 想导入本地音乐文件夹、整理专辑和标签 | [曲库管理](../library/) |
| 想导入网易云、QQ 音乐、Spotify 等歌单 | [歌单导入教程](../playlist-import/) |
| 想接 WebDAV、NAS、Jellyfin、Emby、Subsonic | [远程来源](../remote-sources/) 和 [云盘 / Subsonic 教程](../cloud-drive/) |
| 想播放网络电台 | [网络电台](../internet-radio/) |
| 想投送到数播、功放、电视或局域网渲染器 | [DLNA / 数播串流教程](../dlna-connect/) |
| 想了解 AirPlay 支持到什么程度 | [AirPlay 支持边界](../airplay-connect/) |
| 想调输出设备、WASAPI、ASIO、独占、DSD | [音频输出](../audio-output/) |
| 想理解 EQ、DSP、削波、Headroom | [EQ 指南](../audio-output/eq/) 和 [DSP 新手指南](../audio-output/dsp-beginner/) |
| 想配置 HQPlayer | [HQPlayer 教程](../audio-output/hqplayer/) |
| 想查 USB DAC、第三方驱动、ASIO4ALL 等边界 | [USB DAC 驱动](../audio-output/usb-dac-drivers/) 和 [第三方驱动边界](../audio-output/third-party-drivers/) |
| 想设置歌词、MV、翻译、罗马音 | [歌词与 MV](../lyrics-and-mv/) |
| 想安装插件或写插件 | [插件创作指南](../plugins/) |
| 想换主题、让 AI 生成主题 | [AI 主题生成指南](../theme-ai-guide/) |
| 想开通、激活或解绑 ECHO Pro | [ECHO Pro](../echo-pro/) |
| 想确认下载、插件音源、版权和法律边界 | [下载与插件音源法律边界](../download-and-plugin-source-boundary/) |
| 想反馈 bug、问问题、让别人帮你排查 | [如何解决问题](../how-to-solve-problems/) |
| 想看常见问题 | [FAQ](../faq/) |
| 想看工程结构、技术栈、开发规则 | [工程文档](../engineering/) |

## 按症状找

| 遇到的问题 | 推荐入口 |
| --- | --- |
| 没声音、爆音、半速、切歌异常 | [音频输出](../audio-output/) 和 [设置与排障](../troubleshooting/) |
| 导入后看不到歌、封面错、专辑分组乱 | [曲库管理](../library/) |
| 不确定“音源”和“下载音乐”边界 | [导入音源](../import-audio-sources/) 和 [下载与插件音源法律边界](../download-and-plugin-source-boundary/) |
| 远程库连不上、能浏览但不能播放 | [远程来源](../remote-sources/) |
| WebDAV / Navidrome / Subsonic 不知道怎么部署 | [云盘 / Subsonic 教程](../cloud-drive/) |
| 在线搜索只能试听、受会员或地区限制 | [用户教程](../user-guide/) |
| 不知道怎么描述问题 | [AI 提问指南](../ai-question-guide/) 和 [如何解决问题](../how-to-solve-problems/) |

## 最稳阅读顺序

如果你完全不知道从哪里开始，按这个顺序看：

1. [零基础安装启动教程](../zero-basics/)
2. [快速开始](../quick-start/)
3. [导入音源](../import-audio-sources/)
4. [用户教程](../user-guide/)
5. [音频输出](../audio-output/)
6. [设置与排障](../troubleshooting/)

先把下载、导入、播放跑通，再研究高级输出、远程源、插件和主题。

---

# 快速开始

Source: src/content/docs/zh/docs/quick-start.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/quick-start/
Description: 第一次使用 ECHO Next 的推荐流程：下载、导入小曲库、验证播放、检查输出，再导入完整音乐库。

这页给第一次打开 ECHO Next 的用户。目标不是一次把所有功能都学完，而是先确认三件事：能导入、能找到歌、能正常播放。

## 开始前准备

先准备一个小测试文件夹，例如：

```text
D:\Music\Test
```

里面放 5 到 20 首你确定没坏的音乐文件，最好包含常见格式：

| 格式 | 为什么建议准备 |
| --- | --- |
| MP3 | 最常见，适合确认基础播放 |
| FLAC | 常见无损，适合确认标签和封面 |
| WAV / M4A | 可选，用来确认更多格式 |

不要第一次就导入几十万文件的大目录。先用小文件夹把播放链路跑通，后面排查会轻松很多。

## 反馈与维护边界

ECHO Next 是开源项目，欢迎真实问题、复现步骤、日志、PR 和可验证的性能数据。为了让问题能被定位和修复，反馈前建议先准备这些信息：

| 需要提供 | 说明 |
| --- | --- |
| 复现步骤 | 从打开软件到出现问题，每一步尽量写清楚 |
| 日志或截图 | 崩溃、报错、播放失败、扫描失败都优先附日志 |
| 环境信息 | 系统版本、ECHO Next 版本、输出设备、驱动、曲库规模 |
| 文件或任务范围 | 是单首歌、某个文件夹、某类格式，还是完整曲库都异常 |
| 性能数据 | 卡顿、慢启动、扫描慢、内存高时，尽量提供可验证的数据 |

只写“我这里不行”、没有日志、没有环境、没有复现路径的问题，通常无法承诺修复。软件维护靠证据，不靠隔空猜测；如果你已经能定位问题，也欢迎直接提交 PR。

Windows 是主要支持平台。手机版在做，但不会给没有验收把握的日期。Linux 会保留基础构建和基础播放边界，请按 [Linux 构建指南](./engineering/linux-build/) 自行构建和验证；暂时不承诺 arm64、Flatpak、Snap、JACK、PipeWire 原生后端、独占 bit-perfect HiFi 或大量性能优化。Linux 相关 issue 如果没有明确、可复现、对主线低风险的证据，可能不会进入优先修复队列。

macOS 暂不做官方包，也不承诺维护。作者没有稳定的 macOS 开发、签名和验收环境，不能把没法长期验证的包当作正式支持。

## 1. 下载并安装

1. 打开 [下载页面](/zh/download/)。
2. 确认页面显示的是最新版本。
3. 如果你想核对发布源，可以打开 [GitHub Releases](https://github.com/Moekotori/ECHO/releases)。
4. 下载 Windows 安装包。
5. 安装并启动 ECHO Next。

下载和安装细节见 [安装与下载](./install/)。

## 2. 导入测试文件夹

1. 打开 ECHO Next。
2. 在左侧找到 `导入文件夹`。
3. 点击导入入口。
4. 在系统文件选择窗口里选中刚才准备的小文件夹。
5. 确认导入。
6. 等待扫描开始。
7. 扫描期间先不要同时启动下载器、远程同步或插件重任务。

正常情况下，导入后你应该能在 `收件箱` 或 `歌曲` 里看到这些新歌曲。

## 3. 检查曲库是否进来了

打开 `歌曲`，看这几项：

| 检查项 | 正常表现 |
| --- | --- |
| 标题 | 能看到歌曲名，不是一排空白 |
| 艺术家 | 大多数歌曲能显示艺术家 |
| 专辑 | FLAC / MP3 标签正常时能显示专辑 |
| 时长 | 能看到歌曲时长 |
| 封面 | 有封面的文件能看到封面或默认占位 |

如果标题、艺术家、专辑全都不对，先检查源文件标签。ECHO 可以整理曲库，但不能凭空知道所有损坏或缺失的元数据。

## 4. 播放第一首歌

1. 在 `歌曲` 里找一首确定正常的 MP3。
2. 双击歌曲，或点击播放按钮。
3. 看底部播放器是否出现当前歌曲。
4. 看进度条是否向前走。
5. 听是否有声音。

判断结果：

| 现象 | 说明 |
| --- | --- |
| 进度条前进且有声音 | 基础播放正常 |
| 进度条前进但没声音 | 多半是输出设备或系统音量问题 |
| 进度条不动 | 可能是文件解码、播放引擎或路径问题 |
| 一播放就跳下一首 | 可能是文件损坏或解码失败 |

## 5. 没声音先这样排查

不要一上来清数据库。播放没声音通常和数据库无关。

按这个顺序检查：

1. Windows 系统音量没有静音。
2. ECHO Next 底部音量不是 0。
3. 当前输出设备是你正在用的耳机、音箱或 DAC。
4. 先切回 `系统输出`。
5. 如果你在 Windows 上想稳定播放，再试 `WASAPI 共享输出`。
6. 暂时关闭 EQ、ReplayGain、变速和其它 DSP。
7. 换一首确定正常的 MP3。
8. 重启 ECHO Next 再试一次。

如果这样仍然不行，再去看 [音频输出](./audio-output/)。

## 6. 再导入完整曲库

小文件夹测试通过后，再导入完整曲库。

建议：

1. 确认音乐盘稳定在线。
2. 外置硬盘不要在扫描时拔掉。
3. NAS 或远程盘先确认网络稳定。
4. 先导入主要音乐根目录，不要把整个系统盘都扫进去。
5. 第一次扫描大曲库时耐心等待。
6. 扫描期间可以听歌，但不要同时开大量下载和远程全量索引。

首次扫描要读文件、标签、封面、时长和专辑信息。大曲库慢是正常的，只要状态还在推进，就先让它跑完。

## 7. 下一步看什么

| 已经做到 | 下一步 |
| --- | --- |
| 不知道“音源”该从哪导入 | 看 [导入音源](./import-audio-sources/) |
| 能导入本地歌 | 看 [用户教程](./user-guide/) |
| 想整理专辑和标签 | 看 [曲库管理](./library/) |
| 想调输出设备 | 看 [音频输出](./audio-output/) |
| 想调 EQ / DSP | 看 [EQ 指南](./audio-output/eq/) |
| 想接 WebDAV、Jellyfin、Emby | 看 [远程来源](./remote-sources/) |
| 想写插件或启用扩展 | 看 [插件创作指南](./plugins/) |

## 最短路线

只想快点开始听歌，可以记住这条：

1. 下载最新安装包。
2. 导入一个小文件夹。
3. 打开 `歌曲`。
4. 播放一首 MP3。
5. 有声音后再导入完整曲库。
6. 输出异常先回到 `系统输出`。

先跑通，再折腾。这样最稳。

---

# 远程与在线源

Source: src/content/docs/zh/docs/remote-sources.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/remote-sources/
Description: 远程文件、在线信息、网络元数据和合规边界。

远程源和在线源是 ECHO 的扩展能力，不是本地曲库的替代品。使用这些功能时，请先区分“浏览远程文件”“补全元数据”“在线播放”“用户自备服务”这几件事。

## DMCA 与版权声明

ECHO 严格遵守 DMCA 以及适用的版权法律。ECHO 官方不提供任何音乐下载服务，不提供用于获取音乐内容的下载功能，不托管、分发、售卖或镜像受版权保护的音频内容，也不提供绕过版权保护、破解会员权限或规避访问控制的功能。

你接入的 WebDAV、NAS、Jellyfin、Emby、Subsonic、云盘、代理、插件或任何第三方来源，都应只用于你有权访问和使用的内容。用户需要自行确保来源合法、账号合法、网络访问合法。

如果某个第三方来源、插件、脚本或用户自填 URL 涉及侵权内容，它不代表 ECHO 官方行为，也不在 ECHO 支持范围内。第三方来源产生的法律责任由接入者、使用者、插件作者或服务提供方自行承担，ECHO 项目和维护者不承担相关法律责任。

## 能力边界

不同来源提供的能力不同：

| 类型 | 作用 | 边界 |
| --- | --- | --- |
| WebDAV / NAS | 浏览和播放你自有服务器上的文件 | 速度取决于服务器、网络和认证配置 |
| Jellyfin / Emby | 浏览媒体库、读取元数据、播放授权内容 | 目录层级和转码行为由服务器决定 |
| Subsonic / Navidrome | 访问个人音乐服务 | 需要用户自己的服务和账号 |
| 在线元数据 | 补全标题、艺术家、专辑、封面、歌词候选 | 只能作为候选或弱补全，不应覆盖高可信本地数据 |
| 插件 | 扩展连接方式或自动化流程 | 插件行为受权限和来源限制 |

ECHO 官方文档不会指导用户获取侵权内容，也不会为不可公开验证的第三方服务提供适配承诺。

完整声明见 [下载与插件音源法律边界](/zh/docs/download-and-plugin-source-boundary/)。

ECHO 不会增加酷狗音乐源。文档或设置里出现酷狗字样时，通常只代表歌词、元数据候选或历史兼容边界，不代表官方会提供酷狗音乐播放源、下载源或平台内容接入。

如果你想听公开网络电台，请看 [网络电台教程](/zh/docs/internet-radio/)；如果你想把 ECHO 当前歌曲投到局域网数播、功放、电视或其它 DLNA / UPnP 渲染器，请看 [DLNA / 数播串流教程](/zh/docs/dlna-connect/)。

## 远程源使用建议

首次连接远程源时，按这个顺序确认：

1. 测试账号、地址、端口和证书。
2. 先浏览根目录或一个小目录。
3. 播放一首普通格式的音频。
4. 再开启索引、封面、歌词或后台同步。
5. 最后再扩大到完整目录。

不要一开始就对整个 NAS 或媒体服务器做全量索引。远程目录很大时，同步慢、封面加载慢、部分文件需要等待都是正常现象。

## 在线元数据

在线元数据适合补全缺失信息，例如封面、歌词候选、艺术家、专辑名或年份。它不应该替代本地标签事实：

- 手动编辑优先于在线结果。
- 嵌入标签优先于在线结果。
- 同目录封面优先于在线封面。
- 在线结果应尽量可预览、可撤销、可小范围应用。

批量应用在线元数据前，请先在少量歌曲上确认效果。

## 网络和代理

远程源问题经常来自网络环境：

- 家庭 NAS 可能受内网、DDNS、端口转发和证书影响。
- 校园网、公司网可能限制 WebDAV、媒体服务器或代理。
- 代理可能影响在线元数据、封面和歌词访问。
- 服务器转码、限速或休眠会影响播放稳定性。

反馈远程源问题时，请截图连接状态、目录页面、错误信息和同步进度，并说明服务类型、服务器版本、网络环境和是否使用代理。

## 不支持范围

以下情况不属于 ECHO 官方支持范围：

- 任何侵权、盗版、绕过付费或规避访问控制的内容来源。
- 第三方下载站、资源站、脚本、爬虫或灰色插件。
- 用户自改服务端、非公开接口、失效 API 或需要抓包逆向的来源。
- 需要 ECHO 帮用户获取、搜索、下载受版权保护内容的请求。
- 试图把 ECHO 插件接口当作官方背书、官方音源或法律责任转移对象的请求。
- 酷狗音乐播放源、下载源或平台内容接入请求。

ECHO 可以帮助你管理和播放你有权使用的内容，但不会提供下载服务，也不会帮助规避版权或平台规则。

---

# 设置教程

Source: src/content/docs/zh/docs/settings.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/settings/
Description: 按 ECHO 当前代码逐项解释设置页、歌词设置、MV 设置、播放高级项、曲库维护和危险操作。

这份教程按 `github.com/moekotori/echo` 当前代码里的设置页来写，面向第一次用 ECHO NEXT 的用户。

先记住一句话：**不懂就保持默认；听不见、卡顿、报错时先撤回刚改的设置，不要连续乱开高级项。**

## 先看这里

| 情况 | 建议 |
| --- | --- |
| 只是想正常听歌 | 只改语言、关闭到托盘、输出设备、主题、曲库文件夹。 |
| 听歌时卡顿 | 开低负载播放模式，关实时频谱、视频背景、后台批量任务。 |
| 没声音 | 先切回系统输出或共享输出，关 EQ、ReplayGain、变速、DSD。 |
| 歌词不准 | 先手动换候选，再调单曲偏移，最后才改全局偏移。 |
| MV 不准 | 手动选候选或填自定义 URL，不要怪音频输出。 |
| 曲库乱了 | 先查标签、合并策略、扫描状态，不要先删数据库。 |
| 数据库坏了 | 去危险操作里的恢复助手，先快照/恢复，再重建。 |

## 被追问时怎么答

先按这个口径回答，基本不会错：

| 用户问法 | 直接回答 |
| --- | --- |
| 我不知道这个要不要开 | 不懂就先别开。ECHO 的默认值是偏安全、偏稳定的；高级项是给明确知道自己要什么的人用的。 |
| 为什么我这里没有某个选项 | 有些设置会按平台、输出模式、账号状态、功能解锁、插件或当前页面状态显示。比如 ASIO/DSD 偏 Windows 和设备，下载动作要解锁，HQPlayer 要先启用集成。 |
| 改设置会不会删歌 | 普通设置不会删音乐文件。只有危险操作里写了清理、删除、重建、删除所有本地内容的按钮才是高风险；重复歌曲清理会把低优先级重复文件移到回收站。 |
| 哪些设置最容易把播放搞坏 | 输出模式、独占/ASIO/DSD、EQ、ReplayGain、变速、Automix、HQPlayer、代理、低延迟/重采样类选项。出问题先一个个关回默认。 |
| 歌词/MV 自动匹配不准怎么办 | 先手动选候选或填自定义 URL，再调单曲偏移；不要一上来改全局偏移、清库或删缓存。 |
| 卡顿是不是软件坏了 | 先关实时频谱、MV 沉浸背景、视频壁纸、后台补全，并把远程后台并发降下来。远程源、网络代理和机械硬盘也会让体验变慢。 |
| 我想恢复正常 | 播放输出切回 System/共享输出，关 EQ、ReplayGain、变速、DSD、HQPlayer，主题和歌词恢复默认，曲库问题先重扫，不要先删数据库。 |

## 设置入口

打开 ECHO NEXT，点左侧 `设置`。设置页分成这些页签：

| 页签 | 主要用途 |
| --- | --- |
| 通用 | 语言、窗口、启动、首页显示、备份、隐藏功能。 |
| 播放 | 输出模式、设备、低负载、音频高级项、ReplayGain、无缝播放。 |
| 快捷键 | 应用内快捷键和全局快捷键。 |
| 歌词 | 歌词显示、来源、偏移、桌面歌词、背景。 |
| MV | MV 来源、质量、自动匹配、沉浸背景。 |
| 集成 | 代理、账号、Spotify/TIDAL、Discord、Last.fm、Windows 控制。 |
| 插件 | 本地插件目录、示例插件、插件页面入口。 |
| 远程 | WebDAV、Jellyfin、Emby、Subsonic 等远程来源。 |
| EQ | DSP 工作台入口和当前 DSP 状态。 |
| 外观 | 主题、侧栏、壁纸、字体、封面形状。 |
| 曲库 | 文件夹、实时更新、歌词补全、体检、重复歌曲、缓存、扫描。 |
| 关于 | 版本、更新、安全模式、诊断。 |
| 危险操作 | 数据库恢复、重复清理、清缓存、重置、删除本地数据。 |

## 通用

通用页主要管语言、窗口、入口显示、基础性能开关和数据备份。下面四张图来自 `photos/Settings/通用`，教程按截图从上到下讲。

### 图 1：语言、引导、Pro 与窗口启动

![ECHO 设置通用页：语言、引导、Pro 与窗口启动](/assets/docs/settings/general/1.png)

| 设置 | 怎么用 | 新手建议 |
| --- | --- | --- |
| 显示语言 | 切换简体中文、繁體中文、日本語、English。 | 选自己看得懂的语言即可，一般不需要重启。 |
| 新手教程 | 重新打开第一次启动时的引导，里面会快速介绍本地曲库、输出模式、歌词、外观和账号入口。 | 不知道从哪里导入音乐、怎么选 WASAPI Shared / Exclusive / ASIO 时，先打开它。 |
| 用户须知 | 重新阅读使用 ECHO 前必须同意的用户须知，包含社区边界、DMCA、反馈和 AI 代码说明。 | 出现版权、下载、远程协助、反馈边界相关问题时先看这里。 |
| Pro 激活 | 打开解锁 Pro、插件启用、网页解绑/备用、展开详情等入口。 | 购买或拿到 Pro Key 后再用；没有 Pro 需求时不用管。 |
| ECHO Pro 账号 | 查看当前 Pro 账号/插件解锁状态，可显示 HWID 或展开更多信息。 | 反馈 Pro 激活问题时可以截图状态，但不要公开发自己的密钥。 |
| 关闭时隐藏到托盘 | 点击窗口关闭按钮时，把 ECHO 隐藏到托盘继续运行，而不是退出。 | 想后台听歌就开；希望点关闭就真正退出，就保持关闭。 |
| 开机自启动 | 登录 Windows 后自动启动 ECHO。默认关闭。 | 每天都用 ECHO 可以开；不想拖慢开机就关。 |
| 歌词/MV 图形内存保护 | 当歌词页或 MV 页面触发 renderer 图形内存压力时，自动关闭部分背景视频和高成本效果。 | 低配电脑、核显、长时间播放 MV 或歌词背景时建议开；正常机器可先保持默认。 |
| 启用屏幕键盘 | 输入字段聚焦时自动显示屏幕上的 Windows 键盘。 | 触摸屏、平板模式用户可开；普通键鼠用户不用开。 |

### 图 2：侧栏、功能入口与基础提示

![ECHO 设置通用页：侧栏、功能入口与基础提示](/assets/docs/settings/general/2.png)

| 设置 | 怎么用 | 新手建议 |
| --- | --- | --- |
| 隐藏侧栏 | 让左侧栏自动贴边隐藏，鼠标移到边缘时再抽出。 | 小屏幕可开；如果经常找不到页面，先关掉。 |
| 侧栏仅显示图标 | 左侧栏保留图标，但隐藏文字名称，鼠标悬停仍可查看名称。 | 熟悉各页面图标后再开；新手建议先保留文字。 |
| 流媒体入口 | 控制左侧是否显示流媒体页面。关闭后会隐藏入口，进入在线音乐搜索和收藏前仍需同意流媒体功能须知。 | 只听本地曲库可以关；需要在线搜索或收藏就开。 |
| osu downloader 入口 | 在左侧显示 osu downloader，用于搜索 osu! beatmap 并提取音频到下载流程。 | 不玩 osu! 或不需要提取 beatmap 音频就关。 |
| 显示插件 / 网盘 / EQ 设置栏目 | 在设置栏目中显示插件、网盘/远程和 EQ；功能入口仍保留在左侧。 | 想让设置页更短可以关；需要调整插件、远程源或 DSP 时再开。 |
| 关闭功能注释 | 收起设置、抽屉和导航里的解释性说明，只保留标题、控件与状态。 | 熟悉 ECHO 后可开；新手不要急着关，否则很多说明会消失。 |
| 关闭所有通知 | 禁用 ECHO 内的提醒卡片、左上角通知和播放栏通知。 | 日常不建议开，除非你明确不想看到任何提示。 |
| 下一首预告 | 当前歌曲快播完时，在左上角显示下一首的时间、歌曲名、艺术家和专辑。 | 随机播放、歌单播放建议开；不想被打扰就关。 |
| 右键菜单扩展动作 | 在曲目右键菜单中显示 osu! Timing、用系统默认应用打开、复制/保存歌曲卡片图片等动作。 | 默认隐藏可保持菜单清爽；需要这些高级动作时打开。 |
| 记住窗口尺寸 | 记住上次使用后的窗口宽高，下次启动自动恢复。 | 建议开。 |
| 快速启动 | 启动时只做轻量快速曲库验证，完整数据保护快照会在窗口打开后后台完成。默认关闭。 | 大曲库用户可开；如果正在排查数据库或启动异常，先关掉。 |

### 图 3：扫描、显示效果、搜索与在线资料

![ECHO 设置通用页：扫描、显示效果、搜索与在线资料](/assets/docs/settings/general/3.png)

| 设置 | 怎么用 | 新手建议 |
| --- | --- | --- |
| 扫描写入性能模式 | 曲库数据库使用更激进的同步策略，减少大批量扫描时的写入压力，但断电或系统崩溃时保护弱一些。 | 只有大批量导入且电脑稳定时再开；移动硬盘、容易断电或正在修库时别开。 |
| 关闭数据保护 | 不再执行启动、后台、扫描完成和更新前的数据保护快照。 | 高风险。除非你明确知道快照拖慢了工作流，否则不要打开。 |
| 波形进度条 | 底部播放栏用粗波形样式显示进度。 | 喜欢可视化可以开；低配电脑卡顿时先关。 |
| 信号路径 | 在底部播放栏显示 Signal Path 入口。歌词页可能会隐藏。 | 想看当前输出链路、DSP、重采样路径时打开。 |
| 主页波形图 | 首页显示“今日回声”的实时波形图。关闭后不渲染波形，也会跳过主页波形相关频谱分析。 | 默认开即可；如果首页卡顿、风扇明显变吵，可以关。 |
| 实时频谱分析 | 让主页波形请求主进程计算频谱。低负载播放模式会强制关闭它。 | 默认关更稳；只有想看实时 FFT 频谱时再开。 |
| 首页随机标题 | 首页标题从文案池随机抽取，显示一点随机风格。 | 纯外观选项，随喜好。 |
| 简繁互搜 | 输入繁体可搜到简体结果，输入简体也可搜到繁体结果。 | 中文、日文汉字、ACG 曲库建议开。 |
| 流媒体专辑 | 在艺人详情页的本地专辑下方按需搜索并显示流媒体专辑，可选网易云或 QQ 音乐。 | 想补全艺人在线专辑可开；只想看本地曲库、怕页面变慢就关。 |
| 艺人信息源 | 选择刷新艺人简介时使用的百科来源，例如百度百科或 Wikipedia。 | 中文网络环境可优先百度百科；国际艺人、英文资料可选 Wikipedia。 |
| 开发控制台 | 打开运行期 stdout/stderr、主进程日志和渲染器 console。 | 只有反馈问题、复现报错、开发调试时使用，日常不用开。 |

### 图 4：设置备份、自动备份与数据包迁移

![ECHO 设置通用页：设置备份、自动备份与数据包迁移](/assets/docs/settings/general/4.png)

| 设置 | 怎么用 | 新手建议 |
| --- | --- | --- |
| 设置参数备份 | `导出设置` 会导出 ECHO Next 设置参数；`导入设置` 用于迁移到新设备或恢复配置。 | 大改设置前先导出一份，出问题时能快速回滚。 |
| 自动数据备份 | 备份设置、曲库索引、播放记忆、账号本地状态、壁纸、封面缓存和元数据；备份前会校验曲库数据库，坏数据会被拒绝。 | 大曲库用户建议配置，但先选一个稳定目录，不要选会随时断开的盘。 |
| 自动备份开关 | 控制自动备份是否启用。截图里显示“自动备份未开启”。 | 没选目录前先别开；目录设置好后再启用。 |
| 备份目录 | 指定备份 zip 文件保存位置。 | 选空间足够、路径稳定的位置；不要放到临时目录。 |
| 备份周期 | 可选 3 天、7 天、每月。 | 普通用户选 7 天；频繁整理曲库可以选 3 天。 |
| 立即备份 | 不等周期，立刻生成一次备份。 | 升级、重扫曲库、大量改标签或清理前先点一次。 |
| 导入备份 | 从已有备份恢复设置和数据。 | 恢复前确认备份来自你自己的 ECHO，避免覆盖当前状态。 |
| 打开目录 | 打开当前备份目录。 | 用来确认备份文件是否真的生成。 |
| 一键导出 / 迁移 ECHO 数据包 | 导出设置、曲库索引、歌单快照、封面缓存路径和账号状态说明；不会复制音乐文件，也不会导出登录密钥。 | 迁移电脑、反馈复杂问题、修数据库前使用。 |
| 恢复入口 | 打开数据包恢复入口。页面提示：恢复前请先在危险区创建健康快照，迁移包里的 `RESTORE.md` 会说明每个文件用途。 | 真要恢复前先读 `RESTORE.md`，不要直接覆盖不明文件。 |

## 播放

先保证普通歌曲能播放，再碰高级播放设置。

### 图 1：先把声音放出来

![ECHO 设置播放页：输出模式、输出设备和低负载](/assets/docs/settings/playback/1.png)

这页最上面先告诉你一件事：**音频设置以右上角播放器抽屉为准**。如果底部播放器旁边的音频抽屉和设置页显示不一致，先信播放器抽屉，因为它离真实播放链路最近。

照着做就行：

1. 没声音时，先点 `没声音就点我`，不要一上来乱改 ASIO。
2. `输出模式` 不懂就选 `WASAPI Shared（推荐）` 或安全模式；`Exclusive` 和 `ASIO` 是给会排查声卡的人用的。
3. `共享后端` 日常用 `WASAPI Shared`；老设备或兼容性问题再试 `DirectSound 兼容`。
4. `输出设备` 选你正在听的耳机、音箱、DAC 或声卡。选错设备就是最常见的“没声音”。
5. 播放时鼠标卡、界面卡、风扇吵，再开 `低负载播放模式`；还不够再开 `低负载增强保护`。
6. `高级播放设置` 平时收起来。你没有 HiFi/排障需求，就别展开乱点。

### 图 2：高级输出和故障按钮

![ECHO 设置播放页：高级播放控制和故障排除](/assets/docs/settings/playback/2.png)

这一段是给“声音坏了、设备列表不对、想玩 ASIO/DSD”的人用的。

| 看见什么 | 应该怎么做 |
| --- | --- |
| `重启音频引擎` | ECHO 自己的音频链路卡住时先点它，风险低。 |
| `重启 Windows 音频服务` | 会影响其它软件声音，确认其它播放器/浏览器不重要时再点。 |
| `音频问题诊断窗口` | 反馈播放异常时打开，给开发者看状态、进度、duration、backend、underrun 等信息。 |
| `JUCE 主输出` | 需要原生音频输出链路时再开；普通听歌不需要。 |
| `长驻原生解码` | WAV/FLAC/MP3 想走原生解码时用；失败会回退。 |
| `DSD DoP 直出试验` | 只有本地 DSF、ASIO、DAC 都支持 DSD 时再开。 |
| `ASIO 原生 DSD 实验` | 高风险实验项，不懂就关。 |
| `ASIO 不可用保护` | ASIO 找不到设备时自动回到安全输出，建议开。 |
| `独占不稳定自动切共享` | WASAPI 独占 underrun 或设备异常时回到共享输出，建议开。 |
| `SOXR 回退保护` | 重采样出问题时回退到 FFmpeg 默认重采样，建议开。 |

### 图 3：变速、导出、小窗和音量标准化

![ECHO 设置播放页：变速、导出、迷你播放器和 ReplayGain](/assets/docs/settings/playback/3.png)

这一屏管的是播放体验，不是“有没有声音”的第一入口。

| 功能 | 傻瓜解释 | 建议 |
| --- | --- | --- |
| 变速模式 | `Nightcore` 会偏快偏高，`Daycore` 会偏慢偏低，普通变速更朴素。 | 听正常音乐就用普通或别动；排查问题先回 1.0x。 |
| 音频导出格式 | 底栏导出按钮用什么格式保存。 | 不懂选 MP3；要无损再选 FLAC/WAV。 |
| 固定音量 | 把 ECHO 音量锁到 100%。 | 接外部 DAC/前级时可开；耳机直插慎开。 |
| 播放暂停淡入淡出 | 播放/暂停时慢慢进出声音。 | 有爆音就开一点；追求原始输出就关。 |
| 迷你播放器 | 小窗显示封面、歌名和进度。 | 想边工作边听就点 `显示`，找不到小窗点 `重置位置`。 |
| A-B 循环 | 标记 A 点和 B 点，循环这一段。 | 练歌、扒谱、听细节时用。 |
| Automix | 让队列歌曲之间自动衔接。 | 随机听歌可试；听专辑别乱开。 |
| 专辑无缝播放 | 专辑曲目间尽量不插空。 | 现场、古典、连续专辑建议开。 |
| 随机播放模式 | 控制随机从全曲库、避免最近重复、伪随机等范围取歌。 | 大多数人选避免最近重复即可。 |
| 音量标准化 | ReplayGain，让不同歌响度接近。 | 随机播放建议开；bit-perfect 测试要关。 |

| 设置 | 怎么用 | 新手建议 |
| --- | --- | --- |
| 输出模式 | 选择 System、Shared、Exclusive、ASIO 等输出链路。 | 不懂就用 System；Windows 日常可用共享输出。 |
| 共享后端 | 共享输出下选择系统后端。 | 默认自动即可。 |
| 输出设备 | 选择耳机、音箱、DAC、声卡。 | 选你正在听的设备；选错会没声音。 |
| 低负载播放模式 | 降低播放时的后台和可视化压力。 | 播放中鼠标卡、界面卡、风扇吵时打开。 |
| 低负载增强保护 | 进一步降低轮询、桌面歌词、诊断和后台曲库任务影响。 | 大曲库或低配电脑建议开。 |
| 播放高级面板 | 展开高级音频设置。 | 没问题别展开乱改。 |
| 软重启音频引擎 | 重置 ECHO 音频引擎。 | 没声音、设备切换失败时先试这个。 |
| 重启 Windows Audio 服务 | 重启系统音频服务。 | 风险较高，会影响其它应用声音；确认再点。 |
| 音频问题诊断窗口 | 打开额外诊断窗口。 | 复现音频问题时开。 |
| 使用 JUCE 输出 | 用原生音频输出链路。 | 需要 WASAPI/ASIO 等高级输出时再开。 |
| 使用原生解码 | 使用原生解码链路。 | 特殊格式或高阶输出测试时再开。 |
| DSD DoP | ASIO 下以 DoP 方式输出 DSD。 | 只有 DAC 和驱动明确支持才开。 |
| ASIO Native DSD | 实验性 ASIO 原生 DSD。 | 高风险实验项，不懂别开。 |
| ASIO 不可用回退 | ASIO 设备不可用时自动回退。 | 建议开，避免直接无声。 |
| Exclusive 不稳定回退 | 独占输出不稳定时回退。 | 建议开。 |
| SoXR 回退 | 重采样失败时回退到 SoXR。 | 建议保持开启。 |
| 变速模式 | 选择变速时的音调策略，例如 Nightcore/Daycore 类效果。 | 平时保持默认；排查播放问题先恢复 1.0x。 |
| 音频导出格式 | 选择导出音频格式。 | 不懂选 MP3；要无损再选 FLAC/WAV。 |
| 固定音量 | 开启后播放器音量锁到 100%。 | 接 DAC、前级或外部音控时可开；耳机直推慎开。 |
| 播放/暂停淡入淡出 | 设置播放、暂停时的淡入淡出时长。 | 轻微淡入淡出能减少爆音；追求原始输出则关。 |
| 迷你播放器 | 显示/隐藏小窗，重置位置，设置是否自动隐藏主窗口。 | 适合边工作边听；找不到窗口时重置位置。 |
| 片段循环 | 在当前歌曲内循环一小段。 | 练歌、扒谱、听细节时用。 |
| Automix | 智能过渡、交叉淡入淡出。 | 随机听歌可开；专辑连续听建议关。 |
| 无缝播放 | 连续播放专辑曲目时减少间隙。 | 听现场、古典、无缝专辑建议开。 |
| ReplayGain 开关 | 让不同歌曲响度接近。 | 随机播放建议开；bit-perfect 测试要关。 |
| ReplayGain 预设 | 标准/安静目标响度。 | 普通用户选标准，夜间听可选安静。 |
| ReplayGain 模式 | Track、Album、Off。 | 随机听选 Track，整专辑选 Album。 |
| 防削波 | 降低过载爆音风险。 | 建议开。 |
| 播放时分析响度 | 播放没有响度数据的歌时补分析。 | 建议开。 |
| 扫描时分析缺失响度 | 扫描曲库时批量分析缺失 ReplayGain。 | 大曲库会耗时；空闲时再开。 |
| 目标 LUFS | ReplayGain 目标响度。 | 常用 -14 LUFS，越低越安静。 |
| 前级增益 | 在 ReplayGain 后整体加减音量。 | 不懂保持 0 dB；爆音就降低。 |
| 单声道 | 左右声道合并。 | 单耳听、检查相位时用，平时关。 |
| 音频状态 | 查看采样率、设备、DSP、警告并复制诊断。 | 出问题时截图或复制给开发者。 |
| 设备列表 | 展开后看设备名、索引、采样率和当前输出模式。 | 选错设备、采样率异常时看。 |

## 播放器音频抽屉

底部播放器也能打开音频抽屉。它和 `设置 -> 播放` 用的是同一批设置，但更偏“立刻切设备、立刻排查”。

| 设置 | 怎么用 | 新手建议 |
| --- | --- | --- |
| 当前输出摘要 | 显示当前编码、设备、采样率、重采样、延迟等信息。 | 没声音或采样率异常时先看这里。 |
| 高采样率警告 | 输出采样率过高时提示。 | 出现警告时先切回普通 44.1/48/96 kHz 路径。 |
| 低负载播放模式 | 同设置页的低负载模式。 | 播放时卡顿可直接在这里开。 |
| 低负载增强保护 | 同设置页的增强保护。 | 大曲库边播边扫时可开。 |
| HQPlayer 接管 | 让播放、上一首、下一首优先交给 HQPlayer。 | 只有已配置并测试 HQPlayer 后再点；退出接管后才能重新选本机输出。 |
| 系统音频 | 使用系统默认音频链路。 | 排查时最稳，没声音先点它。 |
| 系统默认输出 | 使用 WASAPI 跟随系统默认设备。 | 想让 Windows 决定输出设备时用。 |
| 具体 WASAPI 设备 | 直接选择某个耳机、音箱或 DAC。 | 设备名能认出来再选。 |
| WASAPI 独占 | 独占当前设备。 | 可能抢占设备导致其它应用没声，不懂别开。 |
| ASIO 设备 | 选择 ASIO 驱动和输出通道。 | 只给专业声卡、原厂驱动用户用。 |
| 打开 ASIO 控制面板 | 打开声卡厂商 ASIO 面板。 | 只有需要改声卡缓冲/通道时用。 |
| ASIO 输出路由 | 多输出声卡选择 1/2、3/4 等通道。 | 选错通道会没声音。 |
| 高级输出 | 展开 JUCE、DSD、回退、缓冲等高级项。 | 没问题别展开乱改。 |
| JUCE 输出 | 同播放高级里的原生输出。 | 高级输出需要时再开。 |
| JUCE 解码 | 同播放高级里的原生解码。 | 特殊格式测试时再开。 |
| DSD DoP | 用 DoP 输出 DSD。 | 必须 ASIO 和 DAC 支持。 |
| ASIO Native DSD | 实验性原生 DSD。 | 高风险，不懂别开。 |
| DSD 自动音量锁 | 播放 DSD 时锁定音量，避免误调。 | 真玩 DSD 可开；普通 PCM 不需要。 |
| ASIO 不可用回退 | ASIO 失败时回退。 | 建议开。 |
| Exclusive 不稳定回退 | 独占输出不稳时回退。 | 建议开。 |
| SoXR 回退 | 重采样失败时回退。 | 建议保持开启。 |
| 暂停时释放独占 | 暂停后释放 WASAPI 独占设备。 | 实验项；需要让其它应用临时发声时再试。 |
| 共享后端 | Auto、WASAPI Shared、DirectSound、ALSA 等。 | Windows 默认 Auto 或 WASAPI Shared。 |
| 缓冲/延迟档位 | 低延迟、均衡、稳定等。 | 爆音就选更稳定；打游戏/录音才追低延迟。 |
| ASIO Buffer | 给 ASIO 选择缓冲大小。 | 爆音加大，延迟高再减小。 |
| 记住输出 | 下次启动记住输出模式和设备。 | 常用固定 DAC/声卡建议开。 |
| 固定音量 | 同播放页固定音量。 | 外部前级/DAC 控音量时才开。 |
| 重置音频引擎 | 软重启音频引擎。 | 切设备失败、无声时先点。 |
| 隐藏设备 | 右键设备隐藏后在这里恢复。 | 设备列表太乱可隐藏；误藏了就恢复。 |
| 显示 ASIO 面板设置 | 控制是否显示“打开 ASIO 控制面板”。 | 没 ASIO 需求就关。 |

## HQPlayer 连接配置

HQPlayer 主要在 `局域网播放 / Connect` 页面配置，设置存储里对应 `hqPlayer`。

| 设置 | 怎么用 | 新手建议 |
| --- | --- | --- |
| 启用 HQPlayer 集成 | 让 ECHO 显示 HQPlayer 外部输出入口。 | 不用 HQPlayer 就关。 |
| 连接模式 | 本机 HQPlayer Desktop 或远程 HQPlayer。 | HQPlayer 在本机运行就选本机。 |
| Host | HQPlayer 控制端地址。 | 本机一般是 `127.0.0.1`。 |
| Port | HQPlayer 控制端口。 | 默认常见为 `4321`，以你的 HQPlayer 设置为准。 |
| 可执行文件路径 | HQPlayer 程序路径。 | 需要 ECHO 找到本机程序时再填。 |
| 允许启动 | 允许 ECHO 尝试启动 HQPlayer。 | 不想被自动拉起就关。 |
| 媒体服务器 | 给远程 HQPlayer 暴露本地媒体。 | 远程播放本地文件时才需要。 |
| 媒体服务器端口 | 本地媒体服务端口。 | 冲突时换端口。 |
| 默认播放后端 | ECHO Native、HQPlayer、询问。 | 新手选询问或 ECHO Native，确认稳定后再优先 HQPlayer。 |
| Profile 名称 | 交给 HQPlayer 时指定配置档。 | 不懂留空。 |
| 检测 HQPlayer | 测试 TCP 连通性和状态。 | 配完必须先测。 |
| HQPlayer 状态 | disabled、not configured、checking、available、unavailable。 | 只有 available 才说明可用。 |
| 播放交接预演 | 检查当前曲目能否交给 HQPlayer。 | 外部输出失败时看原因。 |

HQPlayer 是外部渲染器。ECHO 能控制和交接，不代表 ECHO 决定最终滤波、升采样、DSD、NAA、DAC 输出。HQPlayer 自己播不响时，先修 HQPlayer，不要在 ECHO 里乱改输出设备。

## 快捷键

每个动作都有两列：`应用内快捷键` 和 `全局快捷键`。

| 动作 | 用途 | 新手建议 |
| --- | --- | --- |
| 播放/暂停 | 控制当前播放。 | 应用内 Space 默认可用。 |
| 上一首 / 下一首 | 切歌。 | 全局快捷键容易冲突，录制后测试。 |
| 停止 | 停止播放。 | 不常用可留空。 |
| 音量加 / 音量减 | 调播放器音量。 | 开固定音量时意义不大。 |
| 快退 / 快进 | 跳转进度。 | 听长音频可设置。 |
| 显示主窗口 | 把 ECHO 拉回前台。 | 经常托盘后台听歌可设置全局键。 |
| 老板键 | 快速隐藏窗口。 | 需要时设置，不需要留空。 |
| 加速 / 减速 | 调播放速度。 | 听播客或练习时用。 |
| 打开音频设置 | 快速打开播放设置抽屉。 | 排查设备时有用。 |
| 打开 MV 设置 | 快速打开 MV 设置。 | MV 用户可设置。 |
| 打开歌词设置 | 快速打开歌词设置。 | 歌词用户可设置。 |
| 定位当前歌曲 | 跳到当前播放歌曲。 | 大曲库常用。 |
| 切换桌面歌词 | 显示/隐藏桌面歌词。 | 桌面歌词用户建议设置。 |
| 锁定桌面歌词 | 防止误拖动桌面歌词。 | 调好位置后再锁。 |

录制失败通常是快捷键被系统或其它软件占用。换一个组合，不要硬抢系统快捷键。

## 歌词

歌词设置也会出现在歌词抽屉里，设置页直接复用同一套面板。

### 图 1：先决定要不要显示歌词

![ECHO 歌词设置页：歌词显示、迷你底栏和基础文字](/assets/docs/settings/lyrics/1.png)

先别管高级来源，第一屏只回答一个问题：**你要不要看歌词，以及歌词挡不挡你。**

1. `启用歌词` 关掉后，歌词页不会加载，也不会搜索或匹配歌词。
2. `歌词匹配度设置` 是自动应用歌词的门槛。数值越高越保守，数值越低越容易自动套错歌词。新手别调太低。
3. `隐藏歌曲信息` 会隐藏歌词页里的歌曲信息，想画面干净再开。
4. `自动弹出歌词选择栏` 会在需要你选歌词候选时弹出来。歌词不准的人建议开。
5. `迷你底栏` 是歌词页底部的小播放控制条。想少挡画面可以开自动隐藏。
6. `播放 MV 时自动启用` 适合边看 MV 边看歌词。
7. `底栏透明度` 和 `底栏颜色` 只影响看起来，不影响播放。
8. `显示罗马音`、假名和翻译，都是辅助文本。你看不懂日文、韩文或外文歌词时再开。

### 图 2：歌词字体、字号和桌面歌词

![ECHO 歌词设置页：字体、字号、颜色和桌面歌词](/assets/docs/settings/lyrics/2.png)

这一屏就是“字怎么看得舒服”。

| 设置 | 怎么理解 | 新手建议 |
| --- | --- | --- |
| 优先 UtaTen 假名注音 | 日文歌词优先显示 UtaTen 的假名注音。 | 日文歌多就开；匹配不到会自动回退。 |
| 显示中文翻译 | 有翻译时显示中文，没有翻译就不会凭空生成。 | 想看意思就开。 |
| 逐字歌词高亮 | 真正有逐字时间轴时才有意义。 | 没有逐字歌词时别纠结它不动。 |
| 歌词字体 | 可用系统字体、导入字体文件、恢复默认。 | 不知道选什么就系统字体；花体字看久会累。 |
| 辅歌词字号 / 歌词字号 | 分别控制翻译/罗马音和主歌词大小。 | 主歌词先调到能看清，再调辅歌词。 |
| 歌词行距 | 行与行之间的距离。 | 太挤就加，太散就减。 |
| 每行字数 | 一行最多显示多少字。 | 自动即可；竖排或超宽屏再调。 |
| 上下文透明度 | 前后歌词有多淡。 | 想专注当前句就调低。 |
| 歌词颜色 | 手动选歌词颜色。 | 看不清时先换颜色，不要先改一堆来源。 |
| 桌面歌词 | 在桌面上显示独立歌词窗口。 | 想切到别的软件也看歌词再开。 |
| 桌面歌词显示罗马音/翻译 | 控制桌面歌词里的辅助文本。 | 屏幕小就少开，别把桌面堆满。 |

### 图 3：桌面歌词排版和歌词背景

![ECHO 歌词设置页：桌面歌词排版和歌词背景](/assets/docs/settings/lyrics/3.png)

这一屏大多是“显示效果”，不是修歌词不准。

1. `无歌词时隐藏桌面歌词` 开了以后，没有歌词的歌不会显示占位文字。
2. `桌面歌词排版` 可选横排或竖排。横排适合日常，竖排适合特定审美。
3. `桌面歌词主字号 / 翻译字号 / 透明度` 调的是桌面小窗，不是歌词页主体。
4. `沉浸式专辑封面样式` 会让歌词背景更像沉浸封面，不改变歌词来源。
5. `沉浸封面毛玻璃` 增加模糊玻璃效果。低配电脑卡顿就关。
6. `智能可读颜色` 会根据封面、壁纸或 MV 画面自动挑更容易看的文字色。
7. `歌词可读性增强` 会加描边/投影，适合背景复杂时开。
8. `显示歌词背景设置` 可选跟随主题、封面或自定义壁纸。
9. `请求网络元数据的高清封面` 只是在跟随封面时临时请求高清图，关掉就用本地封面底图。

### 图 4：歌词来源、自动匹配和延迟

![ECHO 歌词设置页：在线匹配、来源、保存和时间校准](/assets/docs/settings/lyrics/4.png)

歌词不准时，按这个顺序来，别反过来：

1. 先开 `启用在线歌词匹配`，否则只能用本地歌词。
2. 再看 `歌词源`，本地歌词会优先；没勾选的在线源不会参与自动匹配。
3. `深度优先搜索` 会多个平台一起找，找得更全，但也更慢。
4. `自动匹配歌词` 是让 ECHO 自己应用结果；如果经常套错，降低自动化，手动选候选。
5. `自动保存本地歌词文件` 会把在线手动应用的歌词保存成歌曲同名旁挂文件，不覆盖已有 `.lrc/.ttml/.txt`。
6. `新歌词默认延迟` 只影响新匹配歌词。
7. `全局延迟` 会影响所有歌曲。只有所有歌都统一早/晚，才动它。
8. `应用歌词时间轴校准` 会把校准写进当前歌曲记忆；别拿它修所有歌。
9. `显示本歌曲延迟校准` 只是把单曲校准显示出来，方便你知道这首歌有没有被单独调过。
10. `智能歌词校准` 适合少数高置信自动保存的情况；异常歌源很多时别乱开。

| 设置 | 怎么用 | 新手建议 |
| --- | --- | --- |
| 歌词显示总开关 | 控制歌词页是否显示歌词。 | 想看歌词就开。 |
| 隐藏歌词页标题 | 减少顶部信息占用。 | 喜欢沉浸显示再开。 |
| MV 自动显示曲目信息 | MV 场景是否自动显示曲目信息。 | 看 MV 时信息挡画面就关。 |
| 候选面板自动打开 | 找到候选歌词后自动展开候选列表。 | 经常手选歌词可开。 |
| 空状态隐藏 | 没歌词时减少空提示。 | 新手建议保持默认。 |
| 播放栏歌词抽屉 | 底部播放栏显示歌词小抽屉。 | 想随时看歌词可开。 |
| MV 自动启用播放栏歌词 | 进 MV 时自动启用歌词抽屉。 | 看 MV 还想看歌词就开。 |
| 播放栏歌词自动隐藏 | 不需要时自动收起。 | 小屏幕可开。 |
| 播放栏歌词透明度 | 调整底栏歌词不透明度。 | 看不清就调高。 |
| 播放栏歌词颜色模式 | 默认、自定义、跟封面。 | 不懂用默认。 |
| 播放栏歌词颜色 | 自定义颜色模式下使用。 | 背景复杂时选高对比色。 |
| 罗马音 | 显示读音辅助。 | 日文、韩文、外语跟唱可开。 |
| Utaten 假名增强 | 获取日文假名辅助。 | 日文歌可开；网络不稳可关。 |
| 翻译 | 显示翻译行。 | 想理解歌词就开；嫌乱就关。 |
| 逐词高亮 | 同步歌词时突出当前词。 | 喜欢卡拉 OK 效果可开。 |
| 高亮清晰度 | 调逐词高亮强度。 | 看不清就提高。 |
| 主歌词字号 | 调主歌词大小。 | 远看调大，窗口小调小。 |
| 副歌词字号 | 调翻译/罗马音大小。 | 副歌词抢戏就调小。 |
| 歌词字体 | 选择字体或字体文件。 | 先用系统中文字体。 |
| 文字方向 | 横排或竖排。 | 大多数用户用横排。 |
| 行距 | 调歌词行间距。 | 太挤就加大。 |
| 每行最大字符数 | 控制长句换行。 | 0 表示不强制；长句撑屏幕时设置。 |
| 上下文透明度 | 非当前行的透明度。 | 想突出当前行就降低。 |
| 歌词颜色 | 主歌词颜色。 | 背景暗用浅色，背景亮用深色。 |
| 智能可读颜色 | 自动根据背景增强可读性。 | 背景复杂时开。 |
| 背景模式 | 主题、封面、封面取色、自定义壁纸。 | 新手用主题或封面。 |
| 高分辨率网络封面 | 背景为封面时尝试高清网络封面。 | 网络好可开，加载慢就关。 |
| 自定义歌词壁纸 | 给歌词页选择壁纸。 | 只影响歌词背景，不改应用壁纸。 |
| 背景缩放 | 调整歌词背景大小。 | 背景边缘露出就加大。 |
| 封面透明度 | 背景封面可见程度。 | 字看不清就降低。 |
| 封面模糊 | 背景模糊半径。 | 字看不清就加大。 |
| 封面亮度 | 背景明暗。 | 亮背景影响阅读就调暗。 |
| 在线歌词 | 是否使用网络找歌词。 | 想自动匹配就开。 |
| 深度搜索 | 扩大搜索来源和候选。 | 找不到歌词时开；卡顿或网络差时关。 |
| 歌词来源 | LRCLIB、AMLL TTML、网易、QQ、酷狗、酷我等。 | 保留本地和常用中文源即可。 |
| 来源顺序 | 拖动决定优先级。 | 哪个更准放前面。 |
| 自动搜索 | 播放时自动找歌词。 | 建议开。 |
| 自动保存 sidecar | 自动把歌词保存到旁路文件。 | 想把歌词沉淀到本地可开。 |
| 默认偏移 | 每首歌默认时间偏移。 | 不要乱改；只在全库普遍早晚时用。 |
| 全局同步偏移 | 全局微调歌词显示延迟。 | 只调小范围，别拿它修单首歌。 |
| 时间轴修正 | 自动修正部分时间轴问题。 | 建议开。 |
| 显示单曲偏移控件 | 在歌词界面显示单曲偏移入口。 | 常手动校准歌词可开。 |
| 智能对齐 | 尝试更聪明地对齐歌词。 | 建议开。 |
| 还原歌词时序默认值 | 重置自动接受分数、默认偏移和全局偏移。 | 调乱了就点。 |
| 桌面歌词字体 | 桌面歌词单独字体。 | 不影响主界面字体。 |
| 桌面歌词透明度 | 桌面歌词整体透明度。 | 看不清调高，挡画面调低。 |
| 桌面歌词方向 | 横排或竖排。 | 大多数用户横排。 |
| 桌面歌词罗马音/翻译 | 桌面歌词是否显示辅助行。 | 觉得占空间就关。 |

## MV

### 图 1：MV 来源、质量和沉浸背景

![ECHO MV 设置页：MV 匹配、最高画质和沉浸背景](/assets/docs/settings/mv/1.png)

MV 页就三件事：开不开 MV、从哪里找、背景要不要花。

1. `启用 MV` 是总开关。关了就别问为什么没有 MV。
2. `最高画质` 是上限，不是保证每个 MV 都有 4K。网络源没有就不会凭空变出来。
3. `自动搜索网络 MV` 会自动找 MV；关掉后你需要手动搜索或应用。
4. `是否预加载 MV` 会提前准备视频，切歌体验更顺，但会吃网络和缓存。
5. `只用歌曲名搜 MV` 会减少艺人名干扰，适合标题比较准但艺人字段乱的曲库。
6. `按播放量匹配` 倾向播放量高的结果，适合热门歌；冷门歌可能不准。
7. `MV 跟随音乐进度` 让视频尽量跟音频同步。
8. `稳定 / 均衡 / 精准` 是匹配和播放策略。默认用均衡；视频模糊或 GPU 弱就别追精准。
9. `切换 MV 后自动重播音乐` 适合你希望音频和新 MV 从头对齐。
10. `自动应用匹配度` 是自动套用 MV 的门槛。数值越高越不容易乱套。
11. `Bilibili / YouTube` 可以调顺序和开关。哪个源不通或结果差，就关掉或下移。
12. `沉浸式 MV 背景` 会把 MV 当背景，调缩放、模糊、亮度、暗色遮罩。低配电脑卡顿就关。

| 设置 | 怎么用 | 新手建议 |
| --- | --- | --- |
| MV 总开关 | 控制是否启用 MV 功能。 | 不看 MV 可关。 |
| 最高质量 | 限制 720p、1080p、4K、最高等。 | 电脑一般选 1080p；显卡好再最高。 |
| 自动匹配 | 自动搜索并应用高分候选。 | 想省事可开；匹配错就关或提高阈值。 |
| 自动预加载 | 提前准备 MV 候选。 | 网络好可开，网络差可关。 |
| 优先播放量最高 | 候选里偏向高播放量。 | 流行歌可开，冷门/翻唱容易误匹配。 |
| 加载 MV 时重启音频 | 为了同步重新启动音频。 | 不懂别开；可能打断播放。 |
| 同步模式 | stable、balanced、precise。 | 开重启音频后用 balanced。 |
| 切换 MV 重播音频 | 换 MV 时重播音频。 | 需要重新对齐时开。 |
| 自动应用阈值 | 候选分数达到多少才自动使用。 | 匹配错就调高。 |
| MV 来源 | Bilibili、YouTube 可开关、排序。 | 哪个更准放前面。 |
| 沉浸背景 | 用 MV 画面做背景。 | 好看但吃 GPU；卡顿就关。 |
| 沉浸背景缩放 | 调整背景放大。 | 露边就放大。 |
| 沉浸背景模糊 | 模糊背景。 | 字看不清就加大。 |
| 沉浸背景亮度 | 调暗或调亮背景。 | 字看不清就调暗。 |
| 背景遮罩透明度 | 加遮罩让文字更清楚。 | 背景太花就提高。 |

## 集成

### 图 1：账号、外部展示和系统联动

![ECHO 联动设置页：账号登录、API、Discord、OBS、Stage 和 Windows 控制](/assets/docs/settings/integrations/1.png)

联动页不是播放音质页，它管的是“ECHO 和别的软件怎么互相知道状态”。

| 功能 | 干什么 | 新手建议 |
| --- | --- | --- |
| 账号登录 | 保存平台登录状态，供歌词、元数据、MV、下载和流媒体接入使用。 | 需要哪个平台再登录哪个，不要乱登一堆。 |
| 刷新全部 | 重新刷新账号状态和联动状态。 | 状态不对时点一次。 |
| 开发者 / API 配置 | Spotify、TIDAL、Discogs、在线歌手和 Last.fm 等密钥配置。 | 不知道 API 是什么就别展开。 |
| Discord 状态 | 把正在播放同步到 Discord Rich Presence。 | 显示 Error 时先确认 Discord 正在运行。 |
| OBS 浏览器源 | 复制链接给 OBS 显示当前歌词和曲目信息，不播放音频。 | 直播展示用；普通用户不用开。 |
| Stage API | 开本机 HTTP/SSE 接口给 Stage 客户端读取播放状态。 | 需要外部控制面板才开。 |
| Windows 媒体控件 | 把播放信息发布到 Windows 音量浮层和锁屏媒体控件。 | Windows 用户建议开。 |
| SMTC 歌词显示 | 把歌词也写进 Windows 媒体信息。 | 怕隐私或不想污染系统字段就关。 |
| 任务栏音乐控制 | 在任务栏缩略图里显示播放按钮。 | 想在任务栏切歌可开。 |

### 图 2：启动检查、Spotify、手机遥控和代理

![ECHO 联动设置页：账号刷新、Spotify、手机遥控和网络代理](/assets/docs/settings/integrations/2.png)

这一屏主要是“启动时要不要自动查”和“网络请求怎么走”。

1. `启动时刷新账号登录状态` 只检查以前登录过的账号，没有登录过的平台会保持静默。
2. `关闭账号失效通知` 开了以后，账号失效不会弹左上角提醒，但状态还在这里看得到。
3. `Spotify 自动启动官方播放器` 是给 Spotify 播放用的：如果内置 SDK 因 DRM 不可用，会尝试启动 Spotify 桌面端或网页版并接管 Connect 设备。
4. `手机遥控` 还没外部设备能力时会变成受控 IPC，不让 renderer 直接占系统资源；普通用户不用碰。
5. `网络代理` 给网页登录、网络封面、歌词、MV 搜索和元数据补全使用。
6. 第一版只建议代理联网能力，不建议让远程曲库和播放字节流走代理，避免影响正在播放的稳定性。
7. 如果你不知道自己有没有代理，就保持 `关闭`。填错代理地址，网络歌词/MV/元数据会更容易失败。
8. 改完代理后点 `保存并应用`，再点 `测试连接`。不要只填了地址就以为生效。

| 设置 | 怎么用 | 新手建议 |
| --- | --- | --- |
| 网络代理模式 | 关闭、系统代理、手动代理、PAC。 | 本地听歌不需要代理；网络歌词/MV失败再看。 |
| 手动代理地址 | 填 `http://`、`socks5://` 等代理地址。 | 不懂别填。 |
| PAC 地址 | 填 PAC 配置 URL。 | 只有你知道 PAC 是什么才用。 |
| 代理绕过规则 | 哪些地址不走代理。 | 默认会绕过本机和局域网，别随便清空。 |
| 保存/测试代理 | 保存代理并测试网络。 | 改代理后先测试。 |
| Discogs 专辑评分 token | 给专辑评分兜底。 | 可留空；想更稳定再填 token。 |
| 在线歌手信息 API | Bandsintown、Ticketmaster、SeatGeek、地区等。 | 不看演出信息可不填。 |
| Discord Rich Presence | 在 Discord 显示播放状态。 | 想展示就开，不想暴露听歌状态就关。 |
| Windows SMTC | 系统媒体控制、状态栏媒体信息。 | Windows 用户建议开。 |
| SMTC 歌词 | SMTC 里带歌词。 | 不需要系统层歌词就关。 |
| 任务栏播放控制 | Windows 任务栏缩略图按钮/进度。 | Windows 用户可开。 |
| Last.fm | 登录并 scrobble。 | 用 Last.fm 才开。 |
| Last.fm scrobble | 记录播放历史到 Last.fm。 | 不想上传记录就关。 |
| Last.fm Now Playing | 上报当前正在播放。 | 不想实时暴露就关。 |
| Last.fm 最短记录秒数 | 播放超过多少秒才 scrobble。 | 默认即可。 |
| 启动检查账号状态 | 启动时检查 YouTube、Bilibili、Spotify 等账号是否失效。 | 建议开。 |
| 关闭账号失效通知 | 登录失效时不弹左上角提醒。 | 不想被打扰可开，但别忘了手动查状态。 |
| Spotify 自动打开官方播放器 | Spotify 相关操作时尝试拉起官方播放器。 | Spotify 用户建议开。 |
| Spotify OAuth 配置 | 填自己的 Client ID 和 Redirect URI。 | 要 Spotify 登录才填。 |
| TIDAL Developer 配置 | 填 Client ID、Secret、回调地址、国家码。 | 只用于 catalog 元数据，不接入播放流。 |
| 账号登录面板 | Bilibili、YouTube、Spotify、TIDAL 等登录/检查/清除。 | 网络功能失败时先检查账号状态。 |
| 移动端集成 | 预留入口。 | 当前不用管。 |

## 插件

| 设置 | 怎么用 | 新手建议 |
| --- | --- | --- |
| 打开插件页面 | 进入插件管理页。 | 管插件时从这里进。 |
| 打开插件目录 | 打开 `userData/plugins`。 | 手动安装插件时用。 |
| 创建示例插件 | 生成播放状态面板示例。 | 学插件开发时用。 |
| 打开插件文档 | 打开插件教程。 | 不确定权限时先看文档。 |

插件权限里看到 `settings:write`、`library:write`、`network` 要谨慎。来源不明的高权限插件不要启用。

## 远程

远程页复用远程来源面板。常见设置包括来源类型、名称、服务器地址、账号、密码或 token、连接测试、同步/索引策略。

| 设置 | 怎么用 | 新手建议 |
| --- | --- | --- |
| 来源类型 | WebDAV、Jellyfin、Emby、Subsonic 等。 | 选你真实使用的服务。 |
| 显示名称 | 给远程库起名字。 | 用能看懂的名字，例如 `NAS 音乐`。 |
| 地址 | 服务器 URL。 | 复制完整地址，注意 http/https。 |
| 凭据 | 用户名、密码、token。 | 不确定就先在浏览器验证。 |
| 测试连接 | 保存前检查能不能连上。 | 必做。 |
| 索引/同步 | 是否把远程曲目写入索引。 | 先浏览，稳定后再索引。 |

大远程库不要一上来全量重任务。先测试连接、浏览、播放，再建索引。

## EQ

设置页里的 EQ 页只保留 DSP 工作台摘要。

### 图 1：ECHO SRC / 升频先选倍率和质量策略

![ECHO SRC 升频页：倍率、质量策略和高级模式入口](/assets/docs/settings/upsampling/1.png)

`ECHO SRC / 升频` 是 DSP 里的采样率转换，不是音量增强，也不是“自动变好听”。开了以后会进入 DSP 路径，并且不再标记为 bit-perfect。

最傻瓜的用法：

1. 不知道自己要什么，点 `关闭`。
2. 想试试升频，先用 `2x PCM`，不要一上来 `8x Ultra`。
3. 电脑性能不错再试 `4x PCM`；`8x Ultra` 更吃 CPU/GPU。
4. `Transparent` 偏透明低失真，`Balanced` 偏稳定开销平衡，`Low latency` 偏低延迟。
5. `A/B 原生` 用来对比开升频和不开升频的差异。听不出差异就别硬开。
6. 右上角 `Bit-perfect 路径` 可以帮你看当前是不是还保持原始输出。

### 图 2：高级滤波器和性能档位

![ECHO SRC 升频页：滤波器、GPU 计算和性能阶梯](/assets/docs/settings/upsampling/2.png)

高级模式里会出现 `Filter / HQ-style`、`Filter 1x`、`Filter Nx`、GPU Compute/CUDA 和一堆滤波器卡片。这里别慌：

| 区域 | 怎么看 | 新手建议 |
| --- | --- | --- |
| `Realtime Safe` | 优先不卡、可控，适合实时播放。 | 第一次用高级模式先选它。 |
| `HiFi` | 听感更柔和，实时压力适中。 | 电脑还行可以试。 |
| `Reference` | 更重，偏参考级。 | 建议有较强显卡再试。 |
| `Insane / Offline-like` | 超吃配置，偏冲极限体验。 | 新手别碰，卡顿正常。 |
| `Filter 1x` | 原始采样率附近用的滤波器。 | 不懂选默认。 |
| `Filter Nx` | 高采样率来源用的滤波器。 | 不懂选默认。 |
| `GPU Compute / CUDA` | 用 NVIDIA CUDA 算滤波。 | 没装驱动或没有 NVIDIA 显卡就别开。 |

如果开了升频后爆音、卡顿、切歌慢，先降倍率，再换 `Low latency` 或 `Realtime Safe`，最后再关掉升频。不要同时改十个滤波器。

| 设置 | 怎么用 | 新手建议 |
| --- | --- | --- |
| Signal path | 看当前是 Native direct 还是 DSP path。 | 想验证原始输出时应是 Native direct。 |
| EQ 状态 | 看 EQ 是 Enabled 还是 Bypassed。 | 不调音就保持 Bypassed。 |
| Preset | 当前 EQ 预设名。 | 不懂就 Flat。 |
| Safety | 看是否有 Headroom risk。 | 有风险就降前级增益。 |
| 打开 DSP 工作台 | 去侧栏 DSP 做具体调音。 | 只在那里调 EQ、余量、声道。 |
| 刷新状态 | 重新读取当前音频状态。 | 状态不准时点。 |

## 外观

### 图 1：主题、定时深浅色和左侧栏

![ECHO 外观设置页：主题、定时切换、侧栏和主题预设](/assets/docs/settings/appearance/1.png)

外观页只管“看起来和布局”，不会改变音乐文件。

1. `主题` 可选浅色、深色、跟随系统、Ambient。新手选浅色或跟随系统。
2. `定时切换深色模式` 会按时间自动切深色/浅色。先打开定时，再填切换时间。
3. `左侧栏` 用来调整入口顺序和显示状态。误隐藏入口时点 `恢复默认`。
4. `主题预设` 是整套颜色模板。先选一个预设，再在下面细调颜色。
5. `自定义当前主题` 可以改亮/暗模式、主色、强调色和文字样式。改动会实时预览，保存后才写入设置。
6. `窗口亚克力` 是实验性透明材质。Windows 11 22H2 及以上效果最好；如果窗口透明异常，重启 ECHO 或关掉它。

### 图 2：播放界面、右下角按钮和背景

![ECHO 外观设置页：播放封面取色、右下角按钮、自定义背景和封面形状](/assets/docs/settings/appearance/2.png)

这一屏适合把界面调顺眼，但别为了好看把电脑拖卡。

| 设置 | 怎么用 | 新手建议 |
| --- | --- | --- |
| 播放界面封面取色 | 播放页从小封面抽色生成轻量背景。 | 低负载模式会跳过；卡顿就关。 |
| 右下角按钮 | 决定右下角显示哪些快捷按钮，如睡眠定时、桌面歌词、迷你播放器、音量、速度、下载、导出。 | 常用的留下，不用的隐藏，界面会清爽很多。 |
| 自定义背景 | 分别选择横屏背景和竖屏背景。 | 支持图片和本地视频；视频背景更吃性能。 |
| 展开字体与排版 | 调字体、字号、行距、文字深浅等。 | 字太小先调字号，不要先换奇怪字体。 |
| 专辑封面形状 | 圆角或方角。 | 纯外观，随喜好。 |
| 外观默认值 | 恢复 Outfit、Microsoft YaHei、Noto Sans SC、字号、行距、文字深浅和圆角封面。 | 调乱了直接恢复默认。 |

| 设置 | 怎么用 | 新手建议 |
| --- | --- | --- |
| 主题 | 浅色、深色、跟随系统。 | 不懂选跟随系统或浅色。 |
| 主题定时 | 到点自动切深色/浅色。 | 晚上刺眼可开。 |
| 深色时间/浅色时间 | 设置自动切换时间。 | 例如 19:00 深色，07:00 浅色。 |
| 左侧栏 | 调整侧栏项目顺序、显示/隐藏。 | 找不到页面就点重置。 |
| 主题预设 | 选择内置主题。 | 先选预设，不要直接改一堆颜色。 |
| 自定义主题 | 新建、重命名、复制、导入、导出、保存、重置主题参数。 | 会折腾主题再用；低对比警告别忽略。 |
| 插件主题 | 导入已启用插件贡献的主题。 | 只用可信插件主题。 |
| 常用颜色 | 调背景、强调色、文字等主要颜色。 | 改完看文字是否还能读。 |
| 背景渐变 | 调 appBg、appBg2、appBg3 等渐变色。 | 别把背景调得影响阅读。 |
| Surface | 调标题栏、侧栏、播放器、列表层颜色。 | UI 看不清就撤回。 |
| 状态色 | success、warning、danger、focus。 | 不懂别改，改错会看不出警告。 |
| Motion | 动效开关、速度、强度。 | 晕动或卡顿就关或减弱。 |
| 高级细节 | muted、border、buttonText 等细项。 | 只在主题成型后微调。 |
| 界面密度 | 紧凑/标准。 | 当前代码里紧凑为默认展示。 |
| 当前播放封面取色 | 正在播放界面跟随封面主色。 | 好看但可能影响可读性。 |
| 自定义背景 | 选择横屏图片/视频背景。 | 图片优先，视频卡顿就关。 |
| 竖屏背景 | 给窄窗口或竖屏场景单独选背景。 | 有竖屏使用需求再选。 |
| 视频背景暂停模式 | 智能、最小化暂停、从不暂停。 | 默认智能最稳。 |
| 背景缩放 | 调背景大小。 | 有黑边就放大。 |
| 背景模糊 | 调背景模糊。 | 字看不清就加大。 |
| 背景亮度 | 调背景明暗。 | 背景太亮就调低。 |
| UI 透明度 | 调界面面板透明度。 | 看不清就调高。 |
| 视觉保护 | 给背景上的 UI 加保护层。 | 建议开。 |
| 统一透明度 | 统一部分 UI 透明表现。 | 追求一致观感再开。 |
| 主字体 | 设置界面主字体。 | 先用默认。 |
| 中文字体 | 中文字形优先字体。 | 中文显示怪就改这里。 |
| 兜底字体 | 缺字时使用的字体。 | 缺符号、缺日文假名时调整。 |
| 基础字号 | 改界面字号。 | 眼睛累就调大。 |
| 行高 | 改界面文字行距。 | 太挤调大，太松调小。 |
| 文本深度 | 调文字深浅。 | 看不清就调高。 |
| 专辑封面形状 | 圆角或方角。 | 喜欢实体唱片感可选方角。 |
| 外观默认值 | 恢复字体、字号、行高、文本深度和封面形状。 | 外观调乱了就点。 |

## 曲库

先把话说在前面：**媒体库里的很多按钮都会读硬盘、扫文件、查网络、写数据库，播放时可能让界面卡、切歌慢、歌词/MV 延迟，严重时还会让声音短暂停顿。**  
尤其是机械硬盘、移动硬盘、网盘映射盘、NAS、超大曲库、同时播放 DSD/升频/MV 的情况下，更容易卡。最稳的做法是：**先暂停播放或等一首歌播完，再跑扫描、补全、头像、重复分析、BPM、封面缓存迁移这些任务。**

如果你正在听歌，媒体库操作按这个优先级处理：

1. 想马上稳定播放：先别扫库，先别补歌词，先别分析重复歌曲。
2. 必须边听边整理：把 `扫描性能` 设成 `低占用`，暂停头像获取，关完整歌词补全，只做小范围操作。
3. 已经开始卡：暂停正在跑的头像/歌词/BPM/扫描任务，关实时更新曲库，等播放稳定后再继续。
4. 大批量导入音乐：先导入并扫描完，再开始听歌；不要一边扫几万首一边开 MV、升频和实时频谱。
5. 用机械硬盘或网络盘：一次只做一件事。扫库、补封面、补歌词、分析 BPM 不要叠着跑。

### 图 1：导入扫描、资料质量和歌词补全

![ECHO 媒体库设置页：文件夹、扫描器、资料质量和歌词补全](/assets/docs/settings/library/1.png)

媒体库页管的是“ECHO 怎么认识你的音乐文件”。第一屏先别急着点重建，先看这些：

1. `文件夹` 是音乐入口。点展开后添加你的音乐目录，不要扫整个系统盘，也不要把下载目录、桌面、游戏目录一起丢进去。
2. 添加文件夹后，ECHO 会读取文件名、标签、封面、时长并写入数据库。曲库越大越耗时，扫描时播放卡一点不奇怪。
3. `实时更新曲库` 会监听已添加的本地曲库文件夹，新歌或修改文件会自动入库。机械硬盘、移动硬盘、网络盘不稳时，播放中建议先关。
4. `Native File Scanner` 是实验扫描器，只发现音频文件，不读元数据、不提封面、不写曲库。普通用户保持默认，不要因为名字像“更快”就乱开。
5. `Native Metadata Reader` 是实验元数据读取器，失败会回退 TypeScript。它会碰音频标签读取，曲库大时也可能带来后台压力。
6. `资料质量整理` 是看封面、回退元数据、网络候选等问题，不是直接修所有问题。先看报告，再决定要不要补。
7. `一键歌词补全` 会批量找缺失歌词，会访问网络、匹配候选、写入记录。播放中如果卡，先停它。
8. `快速补全缺失歌词` 比完整补全轻一点；`完整补全` 更慢，适合睡觉前或离开电脑时跑。
9. `曲库体检报告` 汇总数据库、扫描、缓存、资料质量和远程源状态。它是排查入口，不是清理按钮，先看它比乱重建安全。

### 图 2：头像、歌单备份、重复歌曲和合并策略

![ECHO 媒体库设置页：歌手头像、歌单备份、重复歌曲和合并策略](/assets/docs/settings/library/2.png)

这一屏会动到整理结果，但大多数不会直接删除音乐文件。它们真正容易带来的问题是：后台任务太多时，播放和界面会变慢。

| 功能 | 怎么理解 | 新手建议 |
| --- | --- | --- |
| 艺术家墙封面 | 没有歌手头像时，用艺术家的一张专辑封面顶上。 | 想让艺术家页好看可开。 |
| 歌手头像 | 自动获取、刷新缺失头像、继续获取、清除头像缓存。 | 这是网络 + 缓存任务，播放卡顿时先暂停。 |
| 歌单自动备份 | 刷新、清空或删除歌单前保存 JSON 备份。 | 建议开，歌单误删更好救。 |
| 重复歌曲 | 隐藏低质量重复版本，不会删除文件。 | `分析重复歌曲` 会扫库，播放中别频繁点。 |
| 专辑/艺人合并策略 | 决定专辑和艺人别名怎么归并。 | 新手用标准/普通艺人合并；宽松合并可能误合并。 |
| 应用并重新整理分组 | 把合并策略应用到曲库分组。 | 会重整分组，曲库大时等空闲再点。 |
| 扫描曲库 | 重新扫描音乐目录。 | 改了标签、移动文件、换策略后再扫；正在播放时慎用。 |

### 图 3：嵌入标签、封面缓存和扫描性能

![ECHO 媒体库设置页：嵌入标签重扫、封面缓存、扫描性能和 BPM](/assets/docs/settings/library/3.png)

这一屏更偏维护和性能。看到“重扫、缓存、分析、性能”这几个词，默认都当成会占资源的操作。

1. `嵌入标签重扫` 会重新读取音频文件里的标题、艺人、专辑、音轨号和封面。它会读很多文件，播放中可能卡。
2. `全部重扫` 会无视缓存，适合大改标签后用；耗时最长，尽量别边听歌边跑。
3. `缺失封面` 只重扫没有封面或只有默认封面的歌曲，比全部重扫轻，但大曲库仍然可能占硬盘。
4. `封面缓存目录` 只是迁移或指定封面缓存位置，不会移动或删除音乐文件；迁移目录时也会有磁盘压力。
5. 不要把封面缓存目录设到 ECHO 程序目录、项目目录、同步盘临时目录或会断开的移动盘里。
6. `扫描性能` 有低占用、均衡、高性能。高性能更快，但读盘和 CPU 压力更大，播放中建议用低占用。
7. `曲库性能诊断` 只读最近扫描、并发、IPC 和卡顿指标，用来判断哪里慢。它适合拿来判断“是不是媒体库任务拖慢了播放”。
8. `BPM / Offset 分析` 会分析歌曲 BPM 和偏移，缺失时可点 `分析缺失 BPM`；大曲库会耗时，空闲时做。
9. 如果你听歌时突然卡，而这页显示最近扫描、元数据并发、封面并发、慢 IPC 或 event-loop 卡顿，就先停媒体库任务，不要先怀疑声卡坏了。

| 设置 | 怎么用 | 新手建议 |
| --- | --- | --- |
| 曲库文件夹 | 添加、移除、扫描本地音乐目录。 | 只添加音乐目录，不要扫整个系统盘；第一次扫描时别急着播放。 |
| 实时更新曲库 | 监听本地文件夹新增或修改，自动入库。 | 曲库稳定后再开；导入大批文件或播放卡顿时先关。 |
| 资料质量整理 | 查看缺封面、回退元数据、未知艺人/专辑、网络候选。 | 先看报告，再手动补；不要和扫库、BPM、头像一起跑。 |
| 一键歌词补全 | 批量给缺歌词歌曲找歌词。 | 先快速模式；完整模式空闲时跑，播放中卡顿就停。 |
| 歌词补全命中率 | 自动接受候选的分数门槛。 | 匹配错就调高。 |
| 曲库体检报告 | 汇总数据库、扫描、缓存、资料质量、远程源，只读导出。 | 报错前先导出。 |
| 曲库实验/诊断面板 | 更细的曲库诊断入口。 | 开发排查时用。 |
| 艺术家墙封面 | 用艺人专辑封面替代字母占位。 | 想让艺人页好看可开。 |
| 艺术家头像自动获取 | 网络后台抓艺人头像。 | 网络好可开；大曲库会慢慢跑，播放卡顿时暂停。 |
| 艺人缺头像用专辑封面 | 没抓到头像时用专辑封面。 | 建议开。 |
| 刷新缺失头像 | 只给缺头像艺人排队。 | 开启自动获取后再点；这是后台网络任务。 |
| 暂停/继续头像获取 | 暂停后台头像任务。 | 播放卡顿时暂停。 |
| 清理头像缓存 | 删除头像缓存记录和文件。 | 头像明显错乱再用；清完后重新获取会再次占网络。 |
| 下载路径 | 选择下载音频保存目录。 | 只在解锁下载能力后出现。 |
| 流媒体下载按钮 | 在流媒体页显示支持平台的下载按钮。 | 默认隐藏；需要下载再开。 |
| 歌单自动备份 | 刷新、清空、删除歌单前保存 JSON 备份。 | 建议开。 |
| 重复歌曲隐藏 | 在歌曲列表隐藏低音质重复版本，不删除文件。 | 大曲库建议开。 |
| 分析重复歌曲 | 重新计算重复组。 | 导入大量新歌后点；大库播放中不要反复分析。 |
| 专辑合并策略 | 标准模式或同名同封面宽松合并。 | 标准模式最稳。 |
| 艺人合并策略 | 保守或普通艺人合并。 | 普通模式推荐；误合并就改保守。 |
| 应用并重新整理分组 | 应用合并策略并重建分组。 | 改策略后才点；曲库大时等空闲。 |
| 扫描曲库 | 重新扫描已添加文件夹。 | 改文件后点，不要反复狂点；播放中卡顿就停。 |
| 嵌入标签重扫 | 重读标题、艺人、专辑、曲号、封面等内嵌标签。 | 标签修过后用；这是重读文件，空闲时跑。 |
| 重扫缺失封面 | 只处理没有封面的歌曲。 | 比全量重扫轻，但大曲库仍会占硬盘。 |
| 封面缓存目录 | 迁移或切换封面缓存目录。 | 磁盘空间不够再改；迁移时别播放高负载内容。 |
| 扫描性能 | 低占用、均衡、高性能。 | 普通用均衡；边听边扫必须用低占用。 |
| BPM / Offset 分析 | 播放或手动批量分析缺失 BPM。 | 默认开；播放卡顿时关，批量分析放空闲。 |
| 网络元数据 | 是否用网络补全元数据。 | 想补封面/信息就开；只信本地标签或播放中卡顿就关。 |
| 网络元数据来源 | 网易、QQ、酷狗、MusicBrainz 等。 | 中文曲库优先网易/QQ。 |

## 关于

### 图 1：版本、更新和 Safe mode

![ECHO 关于高级页：版本、自动更新、下载源和 Safe mode](/assets/docs/settings/advanced/1.png)

`关于 / 高级` 页先看版本，再看更新，最后才看诊断。

1. `版本号` 是你反馈问题时必须带的东西。只说“最新版”没用，直接说 `v26.x.x`。
2. `ECHO Pro` 显示是否已解锁。这里显示解锁，不代表网络账号永远不会过期。
3. `自动更新` 会启动后自动检查 GitHub Release，发现更新会在左上角提醒。
4. `下载源` 可以选镜像源。哪个源下载快用哪个，下载失败再换。
5. `检查更新` 是手动检查。
6. `ECHO NEXT / 官方网站 / 使用文档 / 百度网盘 / 哔哩哔哩 / 爱发电 / 更新日志 / QQ 群 / Discord` 都是外部入口。
7. `Safe mode` 是诊断模式：只显示异常、渲染器错误、音频错误和启动阶段，不混入普通播放日志。
8. Safe mode 开着会记录诊断，适合复现问题，不是日常音质提升开关。

### 图 2：导入导出、诊断助手和崩溃报告

![ECHO 关于高级页：导入导出、诊断助手和报告导出](/assets/docs/settings/advanced/2.png)

反馈问题时，按这个顺序准备材料：

1. 先看 `诊断助手` 状态。如果显示快照正常，说明本机状态能被读取。
2. 点 `导出 Markdown`，会生成可读的报告。
3. 点 `打开日志目录`，可以找到本地日志。
4. 播放问题再打开 `音频报告`，启动崩溃再打开 `崩溃报告`。
5. `打开调试控制台` 只在开发者让你开时再开。
6. `导出设置` 只导出当前用户设置，不会导出音乐文件。
7. `导入设置` 会覆盖当前设置，导入前会自动备份当前设置。不要导入来历不明的设置 JSON。

| 设置 | 怎么用 | 新手建议 |
| --- | --- | --- |
| 版本 | 查看当前 ECHO NEXT 版本。 | 反馈问题必须带版本。 |
| 自动更新 | 启动后检查 GitHub Release 并下载安装。 | 建议开。 |
| 更新下载源 | official、加速源、自定义 generic 源。 | official 不行再换；自定义源要可信。 |
| 检查更新 | 手动检查新版本。 | 更新失败时点。 |
| 官网/仓库/网盘/赞助/群组 | 打开相关链接。 | 需要下载或反馈时用。 |
| Safe mode | 每次启动先打开异常记录器，收集错误和慢启动阶段。 | 复现疑难问题时开，平时关。 |
| 导出诊断包 | 导出安全诊断 zip。 | 报 bug 时优先导出。 |
| 诊断助手 | 汇总音频链路、崩溃、日志、导出入口。 | 反馈前先看。 |
| 崩溃报告 | 导出 Markdown、打开日志目录、打开崩溃/音频报告、清除异常提示。 | 崩溃后按这里整理证据。 |

## 危险操作

危险操作不会主动删除你的音乐文件夹，但会影响 ECHO 的本地数据库、缓存、设置、账号、插件或记录。动手前先读描述。

### 图 1：先救命，再清理，最后才重建

![ECHO 危险操作页：恢复助手、重复清理、缓存和重建数据库](/assets/docs/settings/danger/1.png)

这里名字叫危险操作，不是吓唬你。照这个顺序来：

1. 曲库出问题，先看 `恢复助手` 的健康状态。
2. 能点 `检查健康` 就先检查健康。
3. 大改前先点 `创建健康快照`。有快照，回头才有路。
4. 如果已经坏了，优先 `恢复最近健康快照`，不要上来重建数据库。
5. `重启到恢复模式` 是给恢复助手用的，不是普通重启按钮。
6. `打开保护目录` 可以看快照和归档在哪里。
7. `导出诊断` 是反馈问题前最有用的按钮之一。
8. 输入框里的 `危险操作确认词` 是防误触的。看清按钮提示，让你输入什么再输入什么。
9. `扫描重复歌曲` 只扫描；`清理扫描结果` 会处理前面的结果，先确认候选。
10. `清空曲库缓存` 会移除曲库索引、扫描记录和封面缓存，不会删除音乐文件或曲库文件夹。
11. `禁用硬件加速` 用来排查 Chromium/GPU/图片缓存导致的异常内存，切换后要完全重启 ECHO。
12. `恢复默认设置` 会重置应用偏好、封面缓存目录和外观偏好，不会删除音乐文件。
13. `重建曲库数据库` 会让曲库数据库完全损坏时重新来过，旧数据会归档，新索引会重建。不要把它当普通刷新。

一句话：**先快照，先诊断，先恢复；最后才清缓存、恢复默认、重建数据库。**

| 设置 | 怎么用 | 新手建议 |
| --- | --- | --- |
| 曲库数据库安全 | 查看当前数据库、健康快照、坏库归档。 | 数据库异常时从这里开始。 |
| 检查健康 | 重新读取数据库健康状态。 | 怀疑损坏先点。 |
| 创建健康快照 | 手动创建数据库快照。 | 大操作前先点。 |
| 恢复最新健康快照 | 用健康快照恢复数据库。 | 比重建更安全，优先试。 |
| 修复隔离副本 | 修被隔离的坏库副本。 | 有隔离状态时优先。 |
| 归档问题曲目 | 隔离场景下归档问题曲目。 | 看清说明再点。 |
| 重启进入恢复模式 | 重启到恢复流程。 | 普通问题不用。 |
| 打开保护文件夹 | 打开快照、坏库归档、保护记录目录。 | 导出前可先查看。 |
| 导出诊断 | 导出诊断文件。 | 反馈数据库问题时用。 |
| 危险确认词 | 输入确认词后才能执行更危险动作。 | 不确定确认词含义就停手。 |
| 扫描重复歌曲 | 只扫描将要清理的重复组。 | 先扫描，不要直接清理。 |
| 清理扫描结果 | 把低优先级重复文件移到回收站并更新索引。 | 高风险，确认保留项正确再点。 |
| 清空曲库缓存 | 移除曲库索引、扫描记录、封面缓存，不删音乐文件或文件夹。 | 播放问题不要先点这个。 |
| 恢复默认设置 | 重置应用偏好、封面缓存目录和外观偏好，不删音乐文件或曲库文件夹。 | 设置调乱了才用。 |
| 重建曲库数据库 | 归档旧数据库并创建空库，不删音乐文件。 | 数据库完全坏、重扫无效时才用。 |
| 删除曲库数据库 | 只归档并删除数据库，不主动创建新库。 | 比重建更硬，最后手段。 |
| 删除所有 ECHO 本地内容 | 清空设置、账号、插件、数据库、缓存、日志、壁纸、保护快照、下载任务记录。 | 最高风险。除非你要彻底重置，否则别点。 |

## 默认值和范围速查

这些值来自 ECHO 的设置默认值和归一化逻辑。普通用户不用背，排查时照表看。

| 设置 | 默认值 | 允许范围/选项 | 怎么解释 |
| --- | --- | --- | --- |
| 语言 | 跟随系统，中文系统归到 `zh-CN`，其他多为 `en-US` | `zh-CN`、`en-US`、`ja-JP` 等受代码支持的语言 | 语言只是界面文本，不影响曲库数据。 |
| 关闭到托盘 | 关闭 | 开/关 | 开了以后点关闭按钮只是隐藏到托盘，不是退出。 |
| 记住窗口大小 | 开启 | 开/关 | 关闭后窗口尺寸不再按上次状态恢复。 |
| 主题模式 | 浅色 | `light`、`dark`、`system` | 不会影响播放，只影响外观。 |
| 定时切换主题 | 关闭 | 开/关，深色/浅色时间 | 适合白天浅色、晚上深色；时间写错会回默认。 |
| 主题预设 | `classic` | 代码内置预设或自定义主题 | 自定义主题由主题编辑器维护。 |
| 侧栏自动隐藏 | 关闭 | 开/关 | 开了以后侧栏行为会更紧凑。 |
| 侧栏仅图标 | 关闭 | 开/关；自动隐藏开启时会被压回关闭 | 不适合新手，找不到页面时先关。 |
| 歌曲排序 | 默认 | 默认、歌手/专辑等代码支持排序 | 只是列表显示顺序，不改标签。 |
| 壁纸缩放 | 100% | 100-220% | 画面没铺满再加。太大会裁切。 |
| 壁纸模糊 | 0 px | 0-40 px | 字看不清才加。 |
| 壁纸亮度 | 100% | 40-140% | 太亮压低，太暗提高。 |
| UI 不透明度 | 100% | 0-100% | 越低越透，文字可读性越差。 |
| 壁纸视觉保护 | 开启 | 开/关 | 建议开，避免背景太花看不清。 |
| 视频壁纸暂停策略 | `smart` | 代码支持的暂停策略 | 卡顿时优先关视频壁纸或用保守策略。 |
| 网络代理 | 关闭 | 关闭、手动代理、PAC | 只影响联网请求，不修本地播放问题。 |
| 网络元数据 | 开启 | 开/关；网易云、QQ、酷狗等提供方 | 关闭后在线封面、资料、匹配能力会变弱。 |
| 音频分析 | 开启 | 开/关 | 关闭可减轻扫描/分析负载，但 ReplayGain、波形等能力会减少。 |
| JUCE 输出 | 关闭 | 旧设置会被迁移；新版本满足迁移条件才允许开启 | 高级输出路径，不稳定时关。 |
| JUCE 解码 | 关闭 | 旧设置会被迁移；新版本满足迁移条件才允许开启 | 高级解码路径，不懂别开。 |
| DSD 输出 | `pcm` | `pcm`、`dop` | 没有明确 DSD 设备和驱动就保持 PCM。 |
| ASIO Native DSD 实验项 | 关闭 | 开/关 | 实验项，高风险，不是给普通用户的。 |
| DSD 自动音量锁 | 关闭 | 开/关 | 防止 DSD 场景误调音量；没用 DSD 不开。 |
| ASIO 不可用回退 | 关闭 | 开/关 | ASIO 失败时可回退，排查 ASIO 问题时有用。 |
| 独占不稳定回退 | 关闭 | 开/关 | 独占输出出问题时再开。 |
| SoXR 回退 | 开启 | 开/关 | 建议保持开，重采样失败时更稳。 |
| ECHO SRC 模式 | 关闭 | `off`、`family2x`、`family4x`、`family8x` | 追求稳定先关；采样率玩法再开。 |
| ECHO SRC 质量 | `transparent` | `transparent`、`balanced`、`lowLatency` | 低延迟更轻，透明更保守。 |
| 暂停释放独占实验项 | 关闭 | 开/关 | 独占设备被占用时再试。 |
| 音频诊断窗口 | 关闭 | 开/关 | 出问题时临时开，平时不用。 |
| 播放音量 | 100% | 0-100% | 只是播放器音量。固定音量开启时用户要小心外部音量。 |
| 固定音量 | 关闭 | 开/关 | 输出给外部 DAC/功放时才考虑；耳机用户别乱开。 |
| 无缝播放 | 关闭 | 开/关 | 专辑连续听可开；跨格式/远程源异常就关。 |
| 淡入淡出 | 关闭 | 开/关；0-2000 ms | 切歌爆音或突兀时试。追求原样输出就关。 |
| 播放速度 | 1.0x | 0.5-2.0x | 不是音质设置；听歌正常保持 1.0x。 |
| 变速模式 | `nightcore` | `nightcore`、`daycore`、`speed` | 调速后音高/音色可能变化。 |
| 导出格式 | `mp3` | 代码支持的导出格式 | 只影响导出，不影响播放库文件。 |
| 低负载播放 | 关闭 | 开/关 | 卡顿、低配电脑、远程源播放时优先尝试。 |
| 低负载增强 | 关闭 | 开/关 | 比低负载更激进，视觉/后台能力可能减少。 |
| 首页波形 | 开启 | 开/关 | 卡顿就关。 |
| 实时频谱 | 关闭 | 开/关 | 好看但吃资源，播放卡顿先关。 |
| 播放条波形进度 | 关闭 | 开/关 | 大库或低配电脑先关。 |
| 信号路径控制 | 关闭 | 开/关 | 高级音频调试用，普通用户不用。 |
| ReplayGain | 关闭 | 开/关；曲目/专辑模式 | 想统一响度再开；音量异常先关。 |
| ReplayGain 目标响度 | `-14 LUFS` | -24 到 -11 LUFS | 数值越接近 0 越响；太响可能削波。 |
| ReplayGain 前级增益 | 0 dB | -12 到 +12 dB | 不懂别加正增益。 |
| 防削波 | 开启 | 开/关 | 建议保持开。 |
| 播放时分析 ReplayGain | 开启 | 开/关 | 缺分析数据时边播边补。 |
| 扫描时补 ReplayGain | 默认关闭，需要明确同意 | 开/关 | 大库会慢，用户同意后再开。 |
| 本地曲库合并策略 | 专辑标准、歌手标准 | 保守/标准等代码支持策略 | 专辑或歌手被乱合并时调保守。 |
| 中文繁简/异体搜索 | 开启 | 开/关 | 中文搜索建议保持开。 |
| 艺术家墙用专辑图 | 关闭 | 开/关 | 没头像时可用专辑图顶上。 |
| 艺术家流媒体专辑 | 开启 | 开/关；默认网易云 | 在线补专辑信息，网络差可关。 |
| 自动抓艺术家图 | 关闭 | 开/关 | 会联网，批量库可能慢。 |
| 实时曲库更新 | 关闭 | 开/关 | 本地文件经常变化才开；大库或网络盘慎开。 |
| 自动隐藏已删除文件 | 关闭 | 开/关 | 文件被挪走时自动隐藏，误删排查时先关。 |
| 扫描性能模式 | `balanced` | 平衡等模式 | 卡顿选保守，想快再提。 |
| 远程封面加载性能 | `balanced` | 平衡等模式 | 远程卡顿就降。 |
| 远程专辑合并 | `conservative` | 保守/标准等代码支持策略 | 远程库合并错时保持保守。 |
| 远程后台并发 | 元数据 2、封面 2、歌词 1、MV 1、时长回填 1 | 元数据 1-8、封面 1-48、歌词/MV/时长回填 1-4 | 网络/服务器弱就降，想补全快再升。 |
| 重复歌曲检测 | 开启 | 开/关；默认严格 | 清理前必须先扫描结果。 |
| 扫描后自动重建重复索引 | 关闭 | 开/关 | 大库会增加扫描后处理时间。 |
| 歌词联网 | 开启 | 开/关 | 关闭后只能靠本地/内嵌歌词。 |
| 歌词来源顺序 | 本地、LRCLIB、网易云、QQ、酷狗、酷我 | 可启用、禁用、排序 | 本地优先最稳；在线源不准就换候选。 |
| 单源歌词超时 | 4500 ms | 1000-10000 ms | 网络慢可加，太大等待久。 |
| 总歌词匹配超时 | 6000 ms | 1500-15000 ms | 网络慢可加，太大页面等待久。 |
| 歌词自动接受分数 | 0.5 | 0.3-1 | 越高越保守，越低越容易误匹配。 |
| 回填歌词接受分数 | 0.45 | 0.3-0.95 | 后台补歌词用，错配多就提高。 |
| 封面自动接受分数 | 0.97 | 0.5-1 | 默认很严格，避免错封面。 |
| 歌词默认偏移 | 0 ms | -10000 到 10000 ms | 单曲整体早/晚再调。 |
| 歌词全局偏移 | 0 ms | -1000 到 1000 ms | 全部歌都偏才调。别拿它修单曲。 |
| 歌词字号 | 40 px | 22-56 px | 普通歌词主字号。 |
| 歌词副字号 | 22 px | 12-32 px | 翻译/罗马音等辅助行。 |
| 歌词行距 | 110% | 60-150% | 挤就加，太散就降。 |
| 每行最大字数 | 0 | 0-80，0 表示不强制 | 小屏或竖排再调。 |
| 上下文透明度 | 49% | 0-100% | 非当前歌词行的存在感。 |
| 歌词抽屉透明度 | 78% | 20-100% | 播放器底部歌词抽屉。 |
| 逐词高亮清晰度 | 70% | 40-100% | 逐词歌词不清楚时提高。 |
| 歌词背景封面透明度 | 100% | 0-100% | 用封面背景时才明显。 |
| 歌词背景模糊 | 10 px | 0-60 px | 字不清楚就加。 |
| 歌词背景亮度 | 100% | 40-140% | 太亮压低。 |
| 歌词背景缩放 | 100% | 70-180% | 背景留边或裁切时调。 |
| 桌面歌词 | 关闭 | 开/关；可锁定 | 开了会出现独立桌面歌词窗。 |
| 桌面歌词字号 | 34 px | 18-72 px | 只影响桌面歌词。 |
| 桌面歌词缩放 | 100% | 75-170% | 整体大小，不只是字体。 |
| 桌面歌词透明度 | 96% | 35-100% | 太透明会看不清。 |
| 迷你播放器 | 关闭 | 开/关；自动隐藏主窗口默认开 | 找不到主窗口时先看是否启用了迷你播放器自动隐藏。 |
| MV | 开启 | 开/关；默认 Bilibili、YouTube | 关闭后不自动找 MV。 |
| MV 自动匹配阈值 | 0.7 | 0.3-1 | 越高越保守；错配多就提高。 |
| MV 自动预载 | 开启 | 开/关 | 网慢或卡顿可关。 |
| MV 最高播放质量 | `max` | 自动/最高等代码支持质量 | 网络差就别追最高。 |
| MV 允许 60fps | 开启 | 开/关 | 卡顿就关。 |
| MV 沉浸背景 | 开启 | 开/关 | 卡顿、花屏、歌词不清楚时关。 |
| MV 背景缩放 | 115% | 100-220% | 画面没铺满再加。 |
| MV 背景位置 | X 50%、Y 50% | 0-100% | 调整背景焦点。 |
| MV 背景模糊 | 0 px | 0-32 px | 歌词看不清再加。 |
| MV 背景亮度 | 100% | 60-140% | 太亮压低。 |
| MV 背景遮罩 | 0% | 0-100% | 增强文字可读性。 |
| MV 同步模式 | `balanced` | `balanced`、`stable`、`precise` | 不准先手动调，别盲目上 precise。 |
| MV 切换重放音频 | 开启 | 开/关 | 换 MV 后保持同步用。 |
| 声道平衡 | 默认中立 | 声像、左右增益、左右延迟、频段增益受代码限制 | 听感偏耳、设备偏差再调；不懂保持 0。 |
| 自动备份 | 关闭 | 开/关；间隔默认 7 天 | 建议指定稳定本地目录，不要指临时盘。 |
| 歌单备份 | 开启 | 开/关 | 建议保持开。 |
| 自动更新 | 开启 | 官方源默认 | 自定义更新源写错会回默认或不可用。 |
| 启动检查账号 | 开启 | 开/关 | 不想看到账号状态检查可关。 |
| 隐藏账号过期提醒 | 开启 | 开/关 | 关了会更容易看到过期提醒。 |
| Spotify 官方播放器自动启动 | 开启 | 开/关 | Spotify 集成需要时保留。 |
| TIDAL 国家/地区 | `US` | 合法地区码 | 影响 TIDAL 请求结果。 |
| Connect 接收器自启 | 关闭 | 开/关 | 需要局域网控制再开。 |
| Discord Rich Presence | 关闭 | 开/关 | 开了会向 Discord 显示播放状态。 |
| Last.fm | 关闭 | 开/关；Scrobble/Now Playing 默认开 | 登录后才有意义。 |
| Last.fm 最短提交时长 | 30 秒 | 1-240 秒 | 太低会误提交，太高漏提交。 |
| Windows SMTC | 开启 | 开/关 | Windows 媒体控制中心。 |
| SMTC 歌词 | 关闭 | 开/关 | 想把歌词暴露到系统媒体信息时再开。 |
| 任务栏播放控制 | 关闭 | 开/关 | Windows 任务栏控制按钮。 |

## AppSettings 字段级索引

这一节是给“有人拿字段名追问”的场景用的。它按 `AppSettings` 存储字段归类；**字段存在不等于设置页一定有一个独立按钮**，有些字段是窗口位置、登录令牌、迁移版本、页面展开状态或功能解锁标记。

| 字段 | 归属 | 说明 |
| --- | --- | --- |
| `appMemoryVersion` | 内部迁移 | 设置结构版本，应用迁移旧配置时用，用户不要手改。 |
| `onboardingCompleted` | 首次引导 | 记录是否完成新手引导。 |
| `locale` | 通用 | 界面语言。 |
| `hideToTrayOnClose` | 通用 | 关闭窗口时隐藏到托盘。 |
| `rememberWindowSizeEnabled`、`rememberedWindowSize` | 通用/窗口 | 是否记住窗口大小，以及上次窗口尺寸。 |
| `sidebarRouteOrder`、`sidebarHiddenRouteIds` | 外观/侧栏 | 侧栏页面顺序和隐藏页面。 |
| `sidebarAutoHideEnabled`、`sidebarIconOnlyEnabled` | 外观/侧栏 | 侧栏自动隐藏和仅图标显示。 |
| `songsSort` | 曲库列表 | 歌曲列表排序方式。 |
| `appearanceTheme`、`appearanceThemeScheduleEnabled`、`appearanceThemeScheduleDarkAt`、`appearanceThemeScheduleLightAt` | 外观/主题 | 浅色/深色/系统主题，以及定时切换时间。 |
| `appearanceThemePreset`、`appearanceThemePresetOverrides`、`appearanceCustomThemes`、`appearanceThemeCustomId` | 外观/主题 | 当前预设、自定义主题覆盖、自定义主题列表和当前自定义主题。 |
| `appearanceThemePresetsExpanded`、`appearanceThemeCustomExpanded`、`appearanceSidebarLayoutExpanded` | 外观/页面状态 | 设置页里主题/自定义/侧栏区域是否展开。 |
| `appearancePreferences` | 外观/细节 | 字体、字号、文本深度、封面形状等外观偏好集合。 |
| `appCustomWallpaperPath`、`appPortraitWallpaperPath` | 外观/壁纸 | 横屏和竖屏壁纸路径。 |
| `appWallpaperMediaType`、`appPortraitWallpaperMediaType` | 外观/壁纸 | 横屏/竖屏壁纸类型，图片或视频。 |
| `appWallpaperScalePercent`、`appWallpaperBlurPx`、`appWallpaperBrightnessPercent`、`appWallpaperUiOpacityPercent` | 外观/壁纸 | 壁纸缩放、模糊、亮度、界面透明度。 |
| `appWallpaperVisualProtectionEnabled`、`appWallpaperUnifiedOpacityEnabled`、`nowPlayingCoverColorEnabled`、`appVideoWallpaperPauseMode` | 外观/壁纸 | 视觉保护、统一透明度、播放页封面取色、视频壁纸暂停策略。 |
| `rememberedAudioOutput`、`hiddenAudioDeviceKeys` | 播放/输出设备 | 上次输出设备和被隐藏设备。 |
| `audioUseJuceOutput`、`audioUseJuceDecode` | 播放/高级音频 | JUCE 输出和 JUCE 解码开关，旧配置会受迁移版本限制。 |
| `audioDsdOutputMode`、`audioAsioNativeDsdExperimentalEnabled`、`audioDsdAutoVolumeLockEnabled` | 播放/DSD | DSD 输出模式、ASIO Native DSD 实验项、DSD 音量保护。 |
| `audioAsioUnavailableFallbackEnabled`、`audioExclusiveInstabilityFallbackEnabled`、`audioSoxrFallbackEnabled` | 播放/回退保护 | ASIO、独占输出和重采样相关回退。 |
| `audioEchoSrcMode`、`audioEchoSrcQualityProfile` | 播放/重采样 | ECHO SRC 倍频模式和质量档位。 |
| `audioReleaseExclusiveOnPauseExperimentalEnabled`、`audioIssueDiagnosticsWindowEnabled` | 播放/排查 | 暂停释放独占设备实验项、音频诊断窗口。 |
| `channelBalance` | 播放/声道 | 左右声道平衡、增益、延迟和频段平衡。 |
| `playerVolume`、`fixedVolumeEnabled` | 播放/音量 | 播放器音量和固定音量。 |
| `gaplessPlaybackEnabled` | 播放/连续播放 | 无缝播放。 |
| `audioTransportFadeEnabled`、`audioTransportFadeInMs`、`audioTransportFadeOutMs`、`audioTransportFadeCurve` | 播放/切歌 | 淡入淡出开关、时长、曲线。 |
| `playbackSpeed`、`playbackSpeedMode` | 播放/变速 | 播放速度和变速模式。 |
| `audioExportFormat` | 播放/导出 | 音频导出格式。 |
| `lowLoadPlaybackModeEnabled`、`lowLoadPlaybackEnhancementsEnabled` | 播放/性能 | 低负载播放和低负载增强。 |
| `backgroundSpacePauseEnabled` | 播放/内部保护 | 当前归一化后固定为关闭，不要承诺用户有可用开关。 |
| `homeWaveformVisualizerEnabled`、`audioVisualSpectrumEnabled`、`playerWaveformProgressEnabled` | 播放/视觉 | 首页波形、实时频谱、播放进度波形。 |
| `homeRandomHeroTitleEnabled` | 首页 | 首页随机标题。 |
| `signalPathControlEnabled` | 播放/高级 | 信号路径控制入口。 |
| `replayGainEnabled`、`replayGainMode`、`replayGainTargetLufs`、`replayGainPreampDb`、`replayGainPreventClipping` | ReplayGain | 响度标准化开关、模式、目标响度、前级增益、防削波。 |
| `replayGainAnalyzeOnPlay`、`replayGainAnalyzeMissingOnScanOptIn`、`replayGainAnalyzeMissingOnScan` | ReplayGain | 播放时分析、扫描时补分析的授权和实际开关。 |
| `albumMergeStrategy`、`artistMergeStrategy`、`remoteAlbumMergeStrategy` | 曲库/合并 | 本地专辑、歌手、远程专辑合并策略。 |
| `chineseCrossScriptSearchEnabled` | 曲库/搜索 | 中文繁简/异体搜索兼容。 |
| `artistWallAlbumArtwork`、`artistWallAlbumFallbackForMissingAvatars` | 曲库/艺术家墙 | 艺术家墙封面图策略。 |
| `artistStreamingAlbumsEnabled`、`artistStreamingAlbumsProvider` | 曲库/艺术家资料 | 在线艺术家专辑补全。 |
| `autoFetchArtistImages`、`artistImageFetchPaused` | 曲库/艺术家图 | 自动抓艺术家图和暂停状态。 |
| `liveLibraryUpdatesEnabled`、`liveLibraryAutoHideDeletedEnabled` | 曲库/实时更新 | 文件变化监听和自动隐藏已删除曲目。 |
| `coverCacheDir` | 曲库/封面缓存 | 自定义封面缓存目录。 |
| `audioAnalysisEnabled` | 曲库/分析 | 音频分析总开关。 |
| `scanPerformanceMode` | 曲库/扫描 | 扫描性能模式。 |
| `remoteCoverLoadPerformanceMode` | 远程/性能 | 远程封面加载性能模式。 |
| `remoteBackgroundConcurrency` | 远程/后台任务 | 远程元数据、封面、歌词、MV、时长回填并发。 |
| `duplicateTracksEnabled`、`duplicateTracksMode`、`duplicateTracksAutoRebuildAfterScan` | 曲库/重复歌曲 | 重复检测开关、严格度、扫描后自动重建。 |
| `playlistBackupsEnabled` | 曲库/歌单 | 歌单备份。 |
| `networkMetadataEnabled`、`networkMetadataProviders` | 曲库/在线元数据 | 在线元数据总开关和提供方列表。 |
| `lyricsNetworkEnabled`、`lyricsPreferredProvider`、`lyricsEnabledProviders`、`lyricsProviderOrder` | 歌词/来源 | 歌词联网、默认来源、启用来源、来源顺序。 |
| `lyricsProviderTimeoutMs`、`lyricsTotalMatchTimeoutMs` | 歌词/匹配 | 单来源超时和总匹配超时。 |
| `lyricsCoverAutoAcceptScore`、`lyricsAutoAcceptScore`、`lyricsBackfillAutoAcceptScore` | 歌词/自动接受 | 封面、手动/自动搜索、后台回填的接受阈值。 |
| `lyricsDeepSearchEnabled`、`lyricsAutoSearch` | 歌词/搜索 | 深度搜索和自动搜索。 |
| `lyricsRestartOnApplyEnabled`、`lyricsAutoSaveSidecarEnabled` | 歌词/应用保存 | 应用歌词后重启播放、自动保存外置歌词。 |
| `lyricsDefaultOffsetMs`、`lyricsGlobalSyncOffsetMs` | 歌词/偏移 | 单曲默认偏移和全局偏移。 |
| `lyricsTimelineCorrectionEnabled`、`lyricsOffsetControlsEnabled`、`lyricsSmartAlignmentEnabled` | 歌词/时序 | 时间轴修正、偏移控件、智能对齐。 |
| `lyricsEnabled`、`lyricsHeaderHidden`、`lyricsEmptyStateHidden` | 歌词/页面显示 | 歌词总开关、头部隐藏、空状态隐藏。 |
| `lyricsMvAutoShowTrackInfoDisabled`、`lyricsCandidatePanelAutoOpenEnabled` | 歌词/页面行为 | MV 时曲目信息显示策略、候选面板自动打开。 |
| `lyricsPlayerBarDrawerEnabled`、`lyricsPlayerBarDrawerAutoEnableForMv`、`lyricsPlayerBarDrawerAutoHideEnabled` | 歌词/播放器抽屉 | 播放条歌词抽屉开关、MV 自动启用、自动隐藏。 |
| `lyricsPlayerBarDrawerOpacityPercent`、`lyricsPlayerBarDrawerColorMode`、`lyricsPlayerBarDrawerColor` | 歌词/播放器抽屉 | 抽屉透明度、颜色模式、自定义颜色。 |
| `lyricsRomanizationEnabled`、`lyricsUtatenKanaEnabled`、`lyricsTranslationEnabled` | 歌词/辅助文本 | 罗马音、假名、翻译显示。 |
| `lyricsWordHighlightEnabled`、`lyricsWordHighlightClarityPercent` | 歌词/逐词 | 逐词高亮和清晰度。 |
| `lyricsFontSizePx`、`lyricsSecondaryFontSizePx`、`lyricsFontFamily`、`lyricsFontFilePath` | 歌词/字体 | 主字号、副字号、字体名、自定义字体文件。 |
| `lyricsTextDirection`、`lyricsLineSpacingPercent`、`lyricsLineMaxChars`、`lyricsContextOpacityPercent` | 歌词/排版 | 横竖排、行距、每行最大字数、上下文透明度。 |
| `lyricsColor`、`lyricsSmartReadableColorsEnabled` | 歌词/颜色 | 歌词颜色和智能可读颜色。 |
| `lyricsHighResolutionNetworkCoverEnabled` | 歌词/背景 | 使用更高清的网络封面。 |
| `lyricsBackgroundMode`、`lyricsCustomWallpaperPath` | 歌词/背景 | 背景模式和自定义歌词壁纸。 |
| `lyricsCoverOpacityPercent`、`lyricsCoverBlurPx`、`lyricsCoverBrightnessPercent`、`lyricsBackgroundScalePercent` | 歌词/背景 | 封面透明度、模糊、亮度、背景缩放。 |
| `desktopLyricsEnabled`、`desktopLyricsLocked` | 桌面歌词 | 桌面歌词开关和锁定。 |
| `desktopLyricsFontSizePx`、`desktopLyricsScalePercent`、`desktopLyricsFontFamily`、`desktopLyricsFontFilePath` | 桌面歌词/字体 | 字号、整体缩放、字体名、自定义字体文件。 |
| `desktopLyricsColorMode`、`desktopLyricsColor`、`desktopLyricsStrokeColor`、`desktopLyricsOpacityPercent` | 桌面歌词/颜色 | 颜色模式、文字颜色、描边颜色、透明度。 |
| `desktopLyricsTextDirection`、`desktopLyricsRomanizationEnabled`、`desktopLyricsTranslationEnabled` | 桌面歌词/文本 | 方向、罗马音、翻译。 |
| `desktopLyricsBounds` | 桌面歌词/窗口 | 桌面歌词位置和大小。 |
| `miniPlayerEnabled`、`miniPlayerLocked`、`miniPlayerAutoHideMainWindow`、`miniPlayerBounds` | 迷你播放器 | 迷你播放器开关、锁定、自动隐藏主窗口、窗口位置。 |
| `mvEnabled`、`mvEnabledProviders`、`mvProviderOrder` | MV/来源 | MV 总开关、启用来源、来源顺序。 |
| `mvAutoSearch`、`mvAutoPreload`、`mvAutoApplyThreshold`、`mvPreferHighestViewCount` | MV/匹配 | 自动搜索、预载、自动应用阈值、优先高播放量。 |
| `mvImmersiveBackground`、`mvImmersiveBackgroundAutoScale`、`mvImmersiveBackgroundScalePercent` | MV/沉浸背景 | 背景开关、自动缩放、缩放比例。 |
| `mvImmersiveBackgroundOffsetXPercent`、`mvImmersiveBackgroundOffsetYPercent`、`mvImmersiveBackgroundBlurPx`、`mvImmersiveBackgroundBrightnessPercent`、`mvImmersiveBackgroundOverlayOpacityPercent` | MV/沉浸背景 | 背景位置、模糊、亮度、遮罩。 |
| `mvLyricsReadabilityEnhanced`、`mvHideLyrics` | MV/歌词 | 增强可读性、隐藏歌词。 |
| `mvRestartAudioOnLoad`、`mvSyncMode`、`mvReplayAudioOnChange` | MV/同步 | 加载后重启音频、同步模式、换 MV 后重放音频。 |
| `mvMaxQuality`、`mvAllow60fps` | MV/质量 | 最大质量和 60fps。 |
| `safeModeEnabled`、`fastStartupEnabled`、`dataProtectionDisabled` | 关于/启动保护 | 安全模式、快速启动、数据保护禁用状态。 |
| `autoUpdateEnabled`、`autoUpdateSource`、`autoUpdateCustomUrl` | 关于/更新 | 自动更新、更新源、自定义更新地址。 |
| `autoAccountCheckOnStartup`、`suppressAccountExpiryNotices` | 集成/账号 | 启动账号检查、账号过期提醒策略。 |
| `spotifyAutoLaunchOfficialPlayer`、`spotifyClientId`、`spotifyRedirectUri` | 集成/Spotify | Spotify 官方播放器启动和 OAuth 配置。 |
| `tidalClientId`、`tidalClientSecret`、`tidalRedirectUri`、`tidalCountryCode` | 集成/TIDAL | TIDAL OAuth 和地区配置。 |
| `downloadsFeatureUnlocked`、`streamingDownloadActionsEnabled` | 集成/下载 | 下载功能解锁标记和流媒体下载动作开关。 |
| `connectAutoStartReceiversEnabled` | 集成/Connect | Connect 接收器自动启动。 |
| `hqPlayer` | 集成/HQPlayer | HQPlayer 主机、端口、模式等连接设置集合。 |
| `networkProxyMode`、`networkProxyUrl`、`networkProxyBypassRules`、`networkProxyPacUrl` | 集成/代理 | 代理模式、代理地址、绕过规则、PAC 地址。 |
| `onlineArtistInfoBandsintownAppId`、`onlineArtistInfoTicketmasterApiKey`、`onlineArtistInfoSeatGeekClientId`、`onlineArtistInfoRegion`、`onlineArtistInfoSources` | 集成/在线艺人资料 | 演出和艺人信息来源配置。 |
| `onlineAlbumInfoDiscogsUserToken` | 集成/Discogs | Discogs 专辑资料令牌。 |
| `discordRichPresenceEnabled` | 集成/Discord | Discord 播放状态。 |
| `lastFmEnabled`、`lastFmUsername`、`lastFmSessionKey`、`lastFmAuthToken` | 集成/Last.fm | Last.fm 开关、用户名、会话、授权令牌。 |
| `lastFmScrobbleEnabled`、`lastFmNowPlayingEnabled`、`lastFmMinScrobbleSeconds` | 集成/Last.fm | Scrobble、正在播放、最短提交秒数。 |
| `smtcEnabled`、`smtcLyricsEnabled`、`taskbarPlaybackControlsEnabled` | 集成/Windows | Windows 媒体控制、SMTC 歌词、任务栏播放控制。 |
| `autoDataBackupEnabled`、`autoDataBackupDirectory`、`autoDataBackupIntervalDays` | 备份 | 自动数据备份开关、目录、间隔。 |
| `autoDataBackupLastRunAt`、`autoDataBackupLastPath`、`autoDataBackupLastError` | 备份/运行记录 | 上次备份时间、路径、错误信息。 |
| `localShortcuts`、`globalShortcuts` | 快捷键 | 应用内快捷键和全局快捷键配置。 |

### 字段排查注意

- 如果字段里有 `LastFmSessionKey`、`AuthToken`、`ClientSecret`、`UserToken`、账号 cookie，不要让用户截图公开，不要手动改。
- 如果字段是 `Bounds`、`WindowSize`、`Expanded`、`LastRunAt`、`LastPath`、`LastError`，一般是界面状态或运行记录，不是功能开关。
- 如果字段写着 `Experimental`、`NativeDsd`、`Exclusive`、`Asio`、`Juce`，默认按高风险高级音频项处理；普通用户先关。
- 如果字段是 `downloadsFeatureUnlocked` 或 `streamingDownloadActionsEnabled`，不要承诺所有构建都能下载；它受解锁状态限制。
- 如果字段是 `backgroundSpacePauseEnabled`，当前代码会归一化成 `false`，不要把它写成稳定可用功能。

## 出问题先按这个顺序

1. 想想刚才改了哪个设置，先改回去。
2. 播放问题先回到 System 或共享输出。
3. 关闭 EQ、ReplayGain、变速、DSD、Automix。
4. 关闭实时频谱、视频背景、后台批量补全。
5. 看 `播放 -> 音频状态`，复制诊断。
6. 曲库问题先看 `曲库体检报告`。
7. 数据库问题再去 `危险操作 -> 曲库数据库安全`。
8. 反馈前带版本、页面、截图、日志、复现步骤。

别一上来就删除数据库。很多问题只是输出设备、代理、歌词候选、扫描还没完成，重建数据库只会让排查更麻烦。

---

# spotify-oauth

Source: src/content/docs/zh/docs/spotify-oauth.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/spotify-oauth/

---
title: "Spotify OAuth 配置"
description: "Spotify App、回调地址、Development Mode 和常见 OAuth 错误处理。"
sidebar:
  order: 32
  label: "Spotify OAuth"
---

ECHO 不内置公共 Spotify Client ID。每个用户需要准备自己的 Spotify Developer App，然后把 Client ID 填到 ECHO。

## 需要准备

- Spotify Premium 账号。
- 可访问 Spotify Developer Dashboard。
- 只需要 Client ID，不要填写、保存或分享 Client Secret。
- ECHO 设置页显示的 Redirect URI，默认是：

```text
http://127.0.0.1:43879/spotify/callback
```

## 创建 Spotify App

1. 打开 <https://developer.spotify.com/dashboard>。
2. 登录你的 Spotify 账号。
3. 创建一个 App。
4. 在 App 的 Settings 里找到 Client ID。
5. 在 Redirect URIs 里添加 ECHO 显示的 Redirect URI。
6. 保存设置。

## 在 ECHO 里填写

1. 打开 ECHO 设置。
2. 进入 `集成`。
3. 找到 `Spotify OAuth 配置`。
4. 填入 Spotify Dashboard 里的 `Client ID`。
5. `Redirect URI` 保持和 Spotify Dashboard 里注册的一致。
6. 点击 `保存 Spotify 配置`。
7. 回到 Spotify 账号卡片，点击登录。

登录会打开系统默认浏览器。如果浏览器里已经登录 Spotify，通常不需要再输入密码。

## Development Mode 限制

新建 Spotify App 通常处于 Development Mode。这个模式有几个限制：

- App 拥有者需要 Premium。
- 只有被加入该 App 用户名单的 Spotify 账号可以正常使用 API。
- 未加入用户名单时，用户可能能完成登录，但后续请求会失败，常见错误是 `The user is not registered for this application`。

如果只是自己使用，创建自己的 App 后用自己的账号登录即可。  
如果要给少量测试用户使用，需要在 Spotify Dashboard 的 Users Management 里添加他们的 Spotify 邮箱。  
如果要公开给大量用户，需要申请 Spotify Extended Quota。

## 常见问题

### The user is not registered for this application

当前登录的 Spotify 账号没有被加入这个 Client ID 对应 App 的用户名单。

处理方式：

- 用自己的 Spotify App Client ID 登录。
- 或让 App 拥有者在 Spotify Dashboard > Users Management 添加你的 Spotify 邮箱。

### INVALID_CLIENT: Invalid redirect URI

ECHO 里的 Redirect URI 和 Spotify Dashboard 里注册的不一致。

处理方式：

- 两边必须完全一致。
- 建议直接使用默认值：`http://127.0.0.1:43879/spotify/callback`。

### Spotify Premium or regional permission is required

可能原因：

- 当前 Spotify 账号不是 Premium。
- 当前地区不能播放该内容。
- Spotify Connect / Web Playback SDK 当前不可用。

### 能不能下载 Spotify 音频

不能。ECHO 的 Spotify 接入只走官方 OAuth、Web API、Web Playback SDK / Spotify Connect，不提供可下载音频 URL，也不会进入 ECHO native audio 解码路径。

## 参考

- <https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow>
- <https://developer.spotify.com/documentation/web-api/concepts/redirect_uri>
- <https://developer.spotify.com/documentation/web-api/concepts/quota-modes>

---

# theme-ai-guide

Source: src/content/docs/zh/docs/theme-ai-guide.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/theme-ai-guide/

---
title: "AI 主题生成指南"
description: "给 AI 和用户使用的 ECHO Next 主题 JSON 结构、字段含义和生成检查清单。"
sidebar:
  order: 51
  label: "AI 主题"
---

这份文档给 AI 阅读。用户可以把它连同自己的审美描述一起发送给 AI，让 AI 生成 ECHO 可导入的自定义主题 JSON。

目标：生成一个 `echo-next.custom-theme` JSON 文件。用户在 ECHO 的 `设置 -> 外观 -> 自定义当前主题 -> 导入参数` 中导入后，就能得到一个“我的主题”。

## 生成原则

- 只输出 JSON，不输出 CSS、JS、HTML 或解释性文字。
- JSON 必须能被 `JSON.parse` 解析：不要写注释，不要有尾随逗号，不要使用单引号。
- 颜色只使用 `#RRGGBB` 十六进制格式，例如 `#101416`。不要输出 `rgb()`、`rgba()`、`hsl()`、透明色或渐变字符串。
- 字段名必须完全匹配本文档，不要发明新字段。
- 至少提供 `light` 或 `dark` 其中一组。推荐同时提供两组。
- 主题可以故意低对比度，但要知道这可能影响可读性。ECHO 只提醒，不会阻止用户保存。
- 优先做有审美一致性的主题：背景、面板、播放器、侧栏、文字、强调色要像同一个设计系统。
- 不要只把所有颜色都换成同一色相的深浅变化。至少使用一个主强调色、一个辅助强调色和一组中性色。

## 顶层结构

输出这个结构：

```json
{
  "schema": "echo-next.custom-theme",
  "version": 2,
  "exportedAt": "2026-06-03T00:00:00.000Z",
  "theme": {
    "id": "theme-ai-example",
    "name": "AI Example",
    "basePreset": "classic",
    "createdAt": "2026-06-03T00:00:00.000Z",
    "updatedAt": "2026-06-03T00:00:00.000Z",
    "light": {},
    "dark": {}
  }
}
```

字段说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `schema` | 是 | 固定为 `echo-next.custom-theme` |
| `version` | 是 | 固定为 `2` |
| `exportedAt` | 是 | ISO 时间字符串 |
| `theme.id` | 是 | 1-80 个字符，只用字母、数字、下划线、点、冒号、短横线 |
| `theme.name` | 是 | 用户看到的主题名，最多 48 个字符 |
| `theme.basePreset` | 是 | 基础预设名，见下方列表 |
| `theme.createdAt` | 是 | ISO 时间字符串 |
| `theme.updatedAt` | 是 | ISO 时间字符串 |
| `theme.light` | 否 | 浅色模式覆盖参数 |
| `theme.dark` | 否 | 深色模式覆盖参数 |

可用的 `basePreset`：

```text
classic, echoTwilight, sakuraMilk, peachSoda, mintCandy, berryDream,
matchaCream, lemonMochi, cottonCloud, melonCream, seaSaltJelly,
caramelPudding, neonCandy, nyanCat, childrenDoodle, wisteriaBubble,
strawberryCookie, graphiteAurora, amberNoir, oceanStudio, rosewoodVinyl,
darkSideMoon, shibuyaNight, kyotoKurenai, ukiyoIndigo, fujiSnow,
matsuriLantern, ginzaNoir, frostJazz, FINAL
```

不知道选什么时用 `classic`。如果用户要求“保留某个预设的气质再微调”，就把那个预设写入 `basePreset`。

## 色调结构

`light` 和 `dark` 的字段相同。可以只写需要覆盖的字段，但建议生成完整字段，方便用户导入后直接得到完整效果。

```json
{
  "appBg": "#f4f8fb",
  "appBg2": "#d8e8ef",
  "appBg3": "#dce3f2",
  "panel": "#fbfdff",
  "panelSoft": "#e6eef4",
  "accent": "#245f9e",
  "accentStrong": "#163f70",
  "secondary": "#7f3e70",
  "heading": "#142234",
  "text": "#34495f",
  "muted": "#546a80",
  "border": "#5c7da9",
  "onAccent": "#ffffff",
  "buttonText": "#34495f",
  "titlebar": "#fbfdff",
  "sidebar": "#e6eef4",
  "player": "#fbfdff",
  "field": "#ffffff",
  "row": "#ffffff",
  "rowHover": "#eef4fa",
  "rowActive": "#dce9ff",
  "chip": "#ffffff",
  "focus": "#245f9e",
  "danger": "#d64545",
  "success": "#2f8f72",
  "warning": "#c98a16",
  "panelOpacityPercent": 78,
  "glassPercent": 20,
  "shadowPercent": 82,
  "cornerRadiusPx": 14,
  "panelBlurPx": 15,
  "saturationPercent": 100,
  "motionEnabled": true,
  "motionSpeedSeconds": 0.18,
  "motionIntensityPercent": 64
}
```

## 颜色字段含义

| 字段 | 用途 | 生成建议 |
| --- | --- | --- |
| `appBg` | 主窗口底色 | 决定主题第一印象 |
| `appBg2` | 背景渐变中段 | 和 `appBg` 同气质但有层次 |
| `appBg3` | 背景渐变尾色 | 可加入轻微冷暖对比 |
| `panel` | 主要面板色 | 需要承载正文和按钮 |
| `panelSoft` | 弱层级面板 | 侧栏、次级区域、柔和背景 |
| `accent` | 主强调色 | 主按钮、进度、焦点 |
| `accentStrong` | 强强调色 | 标题高光、强调层次 |
| `secondary` | 第三强调色 | 小状态、高亮点缀 |
| `heading` | 主文字 | 标题、重要文字 |
| `text` | 正文文字 | 歌名、设置正文、列表文字 |
| `muted` | 次要文字 | 描述、辅助说明 |
| `border` | 边框和分割线 | 不要比文字更抢眼 |
| `onAccent` | 强调按钮上的文字 | 必须能压住 `accent` |
| `buttonText` | 普通按钮文字 | 通常接近 `text` |
| `titlebar` | 窗口顶部栏 | 通常接近 `panel` 或 `appBg` |
| `sidebar` | 左侧导航背景 | 通常接近 `panelSoft` |
| `player` | 底部播放器背景 | 可比 `panel` 稍深或稍实 |
| `field` | 输入框和搜索框 | 需要和 `text` 有可读性 |
| `row` | 列表普通行 | 通常接近 `panel` |
| `rowHover` | 列表悬停行 | 比 `row` 稍有变化 |
| `rowActive` | 列表选中行 | 带一点 `accent` 气质 |
| `chip` | 筛选芯片、小按钮底色 | 通常接近 `field` |
| `focus` | 键盘焦点和描边高亮 | 通常等于或接近 `accent` |
| `danger` | 危险色 | 删除、错误 |
| `success` | 成功色 | 正常、连接成功 |
| `warning` | 警告色 | 提醒、注意 |

## 数值字段范围

| 字段 | 范围 | 说明 |
| --- | --- | --- |
| `panelOpacityPercent` | 40-100 | 面板不透明度，越低越透 |
| `glassPercent` | 0-80 | 玻璃感和背景模糊层次 |
| `shadowPercent` | 0-100 | 阴影强度 |
| `cornerRadiusPx` | 0-28 | 圆角大小 |
| `panelBlurPx` | 0-32 | 面板模糊程度 |
| `saturationPercent` | 60-140 | 整体饱和度 |
| `motionEnabled` | `true` / `false` | 是否启用主题动效 |
| `motionSpeedSeconds` | 0.12-8 | 动效速度，越小越快 |
| `motionIntensityPercent` | 0-160 | 动效强度 |

## 对比度建议

ECHO 允许用户保存低对比度主题，但 AI 应该优先保证可读性。

推荐检查：

- `text` 对 `appBg` 尽量达到 4.5:1。
- `heading` 对 `appBg` 尽量达到 4.5:1。
- `buttonText` 对 `panel` 尽量达到 4.5:1。
- `onAccent` 对 `accent` 尽量达到 3:1。

浅色主题常见做法：

- 背景用浅色，文字用深色。
- `accent` 如果偏深，`onAccent` 用 `#ffffff`。
- 面板不要和背景完全一样，至少有轻微层次。

深色主题常见做法：

- 背景用深色，文字用浅色。
- `accent` 可以更明亮，但避免荧光色过多。
- `muted` 不要太暗，否则辅助文字会看不清。

## 完整示例

```json
{
  "schema": "echo-next.custom-theme",
  "version": 2,
  "exportedAt": "2026-06-03T00:00:00.000Z",
  "theme": {
    "id": "theme-ai-midnight-lychee",
    "name": "Midnight Lychee",
    "basePreset": "classic",
    "createdAt": "2026-06-03T00:00:00.000Z",
    "updatedAt": "2026-06-03T00:00:00.000Z",
    "light": {
      "appBg": "#f8f1f5",
      "appBg2": "#ead8e8",
      "appBg3": "#d7edf0",
      "panel": "#fffafd",
      "panelSoft": "#efe2eb",
      "accent": "#9f3d72",
      "accentStrong": "#67264b",
      "secondary": "#2f7f87",
      "heading": "#2a1724",
      "text": "#4b3241",
      "muted": "#735b69",
      "border": "#b67598",
      "onAccent": "#ffffff",
      "buttonText": "#4b3241",
      "titlebar": "#fffafd",
      "sidebar": "#efe2eb",
      "player": "#fff7fb",
      "field": "#ffffff",
      "row": "#ffffff",
      "rowHover": "#f5edf2",
      "rowActive": "#efd4e4",
      "chip": "#fffafd",
      "focus": "#9f3d72",
      "danger": "#c84355",
      "success": "#2f8f72",
      "warning": "#bd7a1c",
      "panelOpacityPercent": 80,
      "glassPercent": 18,
      "shadowPercent": 78,
      "cornerRadiusPx": 14,
      "panelBlurPx": 14,
      "saturationPercent": 104,
      "motionEnabled": true,
      "motionSpeedSeconds": 0.22,
      "motionIntensityPercent": 58
    },
    "dark": {
      "appBg": "#0d0910",
      "appBg2": "#1d1020",
      "appBg3": "#0b2428",
      "panel": "#211725",
      "panelSoft": "#17101a",
      "accent": "#f08abd",
      "accentStrong": "#ffd6ea",
      "secondary": "#72d0d7",
      "heading": "#fff6fb",
      "text": "#eadce7",
      "muted": "#c8aeba",
      "border": "#c875a4",
      "onAccent": "#321020",
      "buttonText": "#eadce7",
      "titlebar": "#18101b",
      "sidebar": "#17101a",
      "player": "#211725",
      "field": "#17101a",
      "row": "#201522",
      "rowHover": "#2a1a2e",
      "rowActive": "#3a2039",
      "chip": "#26192b",
      "focus": "#f08abd",
      "danger": "#ff6b7a",
      "success": "#65d6a1",
      "warning": "#f0b45b",
      "panelOpacityPercent": 88,
      "glassPercent": 24,
      "shadowPercent": 96,
      "cornerRadiusPx": 14,
      "panelBlurPx": 18,
      "saturationPercent": 108,
      "motionEnabled": true,
      "motionSpeedSeconds": 0.22,
      "motionIntensityPercent": 70
    }
  }
}
```

## 用户提示词模板

用户可以把下面这段发给 AI，并在最后补充自己的审美描述：

```text
请根据我提供的 ECHO AI 主题生成指南，为 ECHO 生成一个可导入的自定义主题 JSON。

要求：
- 只输出一个 JSON 代码块。
- 使用 schema = "echo-next.custom-theme"，version = 2。
- 同时生成 light 和 dark 两套色调。
- 所有颜色必须是 #RRGGBB。
- 不要输出 CSS、JS、解释文字或注释。
- 字段必须符合指南，不要增加不存在的字段。
- 尽量保证正文、标题、按钮和强调按钮可读。

我的主题需求：
主题名：
关键词：
想要的氛围：
喜欢的颜色：
不喜欢的颜色：
更偏浅色还是深色：
是否需要高对比度：
是否需要动效：
参考对象或画面：
```

## AI 生成前检查清单

生成 JSON 前检查：

- `schema` 是否为 `echo-next.custom-theme`。
- `version` 是否为 `2`。
- `theme.id` 是否只包含安全字符且不超过 80 个字符。
- `theme.name` 是否不超过 48 个字符。
- `basePreset` 是否在允许列表中。
- 是否至少有 `light` 或 `dark`。
- 所有颜色是否都是 `#RRGGBB`。
- 数值是否在范围内。
- JSON 是否没有注释和尾随逗号。
- 主题是否符合用户描述，而不是只随机堆颜色。

## 进阶：插件主题结构

如果用户不是要导入单个 JSON，而是要制作主题插件，可以使用 `contributes.themePresets`。插件主题不是本文档的主要目标，但结构如下：

```json
{
  "id": "echo.ai-theme-pack",
  "name": "AI Theme Pack",
  "version": "0.1.0",
  "apiVersion": 2,
  "entry": "plugin.js",
  "permissions": [],
  "contributes": {
    "themePresets": [
      {
        "id": "midnight-lychee",
        "title": "Midnight Lychee",
        "description": "荔枝粉、夜色紫和冷青色高光。",
        "basePreset": "classic",
        "preview": "linear-gradient(135deg, #0d0910 0%, #1d1020 50%, #72d0d7 100%)",
        "swatches": ["#0d0910", "#f08abd", "#72d0d7", "#eadce7"],
        "light": {
          "appBg": "#f8f1f5",
          "panel": "#fffafd",
          "accent": "#9f3d72",
          "heading": "#2a1724",
          "text": "#4b3241",
          "onAccent": "#ffffff"
        },
        "dark": {
          "appBg": "#0d0910",
          "panel": "#211725",
          "accent": "#f08abd",
          "heading": "#fff6fb",
          "text": "#eadce7",
          "onAccent": "#321020"
        }
      }
    ]
  }
}
```

插件主题额外规则：

- `themePresets` 最多 12 个。
- `preview` 只能是纯色或 `linear-gradient(...)`。
- `swatches` 只放 `#RRGGBB` 颜色。
- 主题插件不需要权限，不注入任意 CSS。

---

# 设置与排障

Source: src/content/docs/zh/docs/troubleshooting.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/troubleshooting/
Description: 常见设置、更新、播放、曲库和上报问题时需要准备的信息。

排障时先缩小范围，再改设置。不要一上来清库、重装、删除配置或同时改很多开关；那样很难判断真正原因。

## 上报前请截图并发报告

如果你要反馈问题，请尽量同时提供：

- 当前页面截图，尤其是错误提示、播放状态、输出设备、扫描进度或远程源状态。
- ECHO 版本号、系统版本、安装渠道和问题发生时间。
- 你正在做的操作步骤，例如导入文件夹、切换输出、扫描远程源、播放某个格式。
- 音频文件格式、采样率、位深、输出模式和设备型号。
- 如果页面里有诊断、日志、错误详情或复制报告按钮，请把报告一起发出。

截图和报告能让问题定位快很多。只说“不能用”“卡了”“没声音”通常不足以判断是设置、文件、驱动、网络还是程序问题。

## 更新异常

Windows 自动更新读取的是发布用的静态 feed，不是网页本身。先检查：

1. 你的网络能访问 GitHub Release 或当前下载镜像。
2. 当前版本号是否真的低于最新版本。
3. 杀毒软件、防火墙或公司网络是否拦截安装包。
4. 下载目录是否有权限、磁盘空间是否足够。

如果安装包下载失败，优先手动去下载页重新下载。不要为了更新问题删除曲库数据库。

## 播放异常

无声、爆音、半速、倍速、切歌失败或进度异常时，按这个顺序排查：

1. Windows 音量、默认输出设备和应用音量混音器。
2. ECHO 底部音量、静音状态和当前播放队列。
3. `Settings -> Playback` 里的输出模式，先切回 `System` 或 `WASAPI Shared`。
4. 暂时关闭 EQ、ReplayGain、变速、声道工具、重采样和自动混音。
5. 换一首确定正常的 MP3 或 FLAC。
6. 再尝试 WASAPI Exclusive、ASIO、DSD 或 HQPlayer 等高级路径。

如果歌曲听起来变慢、变快、变调，或你把 Windows 默认格式采样率拉得很高，请先看 [为什么我的歌曲变速了](/zh/docs/audio-output/song-speed-changed/)。

第三方驱动、虚拟声卡和 ASIO 包装层不属于 ECHO 支持范围。包括但不限于 ASIO4ALL、FlexASIO、Voicemeeter、声卡厂商以外的改包驱动、系统级音效驱动和虚拟路由软件。它们可能可以工作，但 ECHO 不承诺兼容，也不会为这些驱动单独适配。

## 曲库异常

曲库问题通常先从小范围验证开始：

1. 新建一个只含 3 到 10 首歌的小文件夹。
2. 导入这个文件夹，确认扫描、封面、专辑分组和播放是否正常。
3. 再导入完整曲库。
4. 如果只有某张专辑显示错误，优先检查 `album`、`albumArtist`、曲序、碟号和封面标签。
5. 只有在明确需要时才执行全库重扫。

首次导入大曲库时卡顿、进度慢、CPU 或磁盘占用升高是正常现象。ECHO 需要读取文件、标签、封面、时长、编码信息并写入索引。导入期间不要同时运行大量下载、远程全量同步或其它重型后台任务。

## 远程源和在线源异常

远程源问题先区分三件事：

- 账号或地址是否能连上。
- 目录是否能浏览。
- 音频是否能实际播放。

WebDAV、Jellyfin、Emby、Subsonic、NAS、代理和校园/公司网络的兼容性会受服务器配置影响。远程源同步慢时，不要反复删除重建；先截图当前状态、保留错误信息，再尝试暂停、恢复或缩小同步范围。

## 设置恢复

如果设置改乱了，优先恢复相关模块，不要直接清空所有数据：

- 播放问题先恢复播放输出和 DSP 设置。
- 歌词问题先恢复歌词显示、在线歌词和偏移。
- 主题问题先切回默认主题。
- 曲库问题先暂停后台任务，再处理具体文件夹。

清库、删配置、重装属于最后手段。操作前请备份重要配置和本地曲库文件。

---

# user-guide

Source: src/content/docs/zh/docs/user-guide.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/user-guide/

---
title: "ECHO NEXT 用户教程"
description: "从首次导入曲库到日常播放、歌词、MV、远程来源和插件的完整使用教程。"
sidebar:
  order: 4
  label: "用户教程"
---

这份教程默认面向中文用户，按“打开软件后要点哪里、看到什么算正常、出问题先查哪里”的方式写。

你不需要先懂工程架构。先会导入本地歌、会播放、会找歌、会换输出设备，再逐步了解歌词、MV、DSP、远程曲库、下载器和插件。

## 阅读方式

如果你是新用户，建议按顺序阅读：

1. 先看“第一次使用”。
2. 再看“本地曲库”和“播放控制”。
3. 已经能稳定播放后，再看“歌词”“MV”“音频输出与 HiFi”。
4. 最后再启用“远程来源”“流媒体搜索”“下载器”“插件”。

如果你只是想找某个页面怎么用，可以直接跳到对应章节。

## 中文界面速查

教程里优先使用中文页面名。少数保留英文的是音频协议、文件格式、插件权限或第三方工具名，例如 WASAPI、ASIO、FLAC、ReplayGain、FFmpeg、yt-dlp。

| 中文名称 | 你要找的入口或含义 |
| --- | --- |
| 导入文件夹 | 把本地音乐目录加入 ECHO NEXT |
| 收件箱 | 看新导入、还没整理过的歌曲 |
| 歌曲 | 全部歌曲主列表，日常找歌从这里开始 |
| 专辑 | 专辑墙和专辑详情 |
| 艺术家 | 按艺术家浏览曲库 |
| 播放队列 | 临时播放顺序 |
| 歌单 | 长期保存的一组歌曲 |
| 收藏 | 快速标记喜欢的歌 |
| 播放历史 | 找回最近听过的内容 |
| 在线搜索 | 搜索流媒体候选 |
| 下载 | 管理下载任务 |
| 远程曲库 | WebDAV、Jellyfin、Emby、Subsonic 等外部来源 |
| 局域网播放 | DLNA、AirPlay 等局域网设备 |
| 设置 -> 播放 | 输出设备、WASAPI、ASIO、ReplayGain、播放链路 |
| 设置 -> EQ / DSP | 均衡器、前级增益、DSP 处理状态 |

## 零基础照着做

这一节把用户当成第一次打开播放器的人来写。不要急着理解所有名词，先照着做一遍，能播放、能找到歌、能调输出，就算跑通。

先记住三个地方：

| 屏幕位置 | 你看它干什么 |
| --- | --- |
| 左侧菜单 | 决定你现在要做什么，例如导入、找歌、看专辑、改设置 |
| 中间列表 | 显示当前页面的内容，例如歌曲列表、专辑列表、下载任务 |
| 底部播放器 | 判断有没有真的开始播放：歌名、封面、进度条、音量都在这里看 |

新手最容易犯的错是“点到了歌，但没有播放”。选中一首歌只是选中，真正开始播放后，底部播放器会变成当前歌曲，进度条会动。

### 开始前先准备好

不要一上来就把整个硬盘扫进去。先准备一个小测试目录，把最基础链路跑通。

1. 在电脑上新建一个文件夹，例如 `D:\Music\Test`。
2. 放 3 到 10 首确定正常的歌进去。
3. 至少放一首普通 MP3。
4. 如果你有 FLAC，也放一首 FLAC。
5. 不要先放一堆特殊格式、损坏文件、网盘占位文件。
6. 如果歌在移动硬盘里，确认硬盘已经插好。
7. 如果歌在网盘同步目录里，确认文件真的已经下载到本机，不只是云端占位。

建议测试文件这样选：

| 文件类型 | 为什么适合测试 |
| --- | --- |
| 普通 MP3 | 最容易播放，用来确认基础声音链路 |
| 普通 FLAC | 用来确认无损文件和标签读取 |
| 带封面的专辑曲目 | 用来确认封面和专辑显示 |
| 不要用超冷门格式 | 第一轮先证明软件能正常工作，不要先挑战边界 |

测试目录能正常播放以后，再导入完整曲库。这样出问题时你知道是“基础播放就不行”，还是“大曲库、特殊文件、设备设置”引起的。

### 五分钟跑通本地播放

目标：确认 ECHO NEXT 能扫描你的本地歌曲，并且能正常播放。

1. 准备一个小文件夹，例如 `D:\Music\Test`。
2. 往里面放几首你确定没坏的歌，最好包含 MP3 和 FLAC。
3. 打开 ECHO NEXT。
4. 先别动设置，先看左侧菜单。
5. 在左侧找到 `导入文件夹`。
6. 点击 `导入文件夹`。
7. 系统会弹出文件夹选择窗口。
8. 在窗口里找到你刚才准备的 `D:\Music\Test`。
9. 选中文件夹，不要只选中里面某一首歌。
10. 确认导入。
11. 回到 ECHO NEXT，等待扫描开始。
12. 扫描期间不要马上乱点危险设置，先让它把这几个文件扫完。
13. 如果界面显示正在扫描、正在读取、正在导入，都先等一下。
14. 打开 `收件箱`。
15. 看看刚才那几首歌有没有出现。
16. 打开 `歌曲`。
17. 在歌曲列表里找到其中一首普通 MP3。
18. 双击这首歌，或者点击播放按钮。
19. 看底部播放器是否显示当前歌曲。
20. 看进度条是否开始移动。
21. 看音量是不是大于 0。
22. 听耳机或音箱有没有声音。

正常结果：

| 位置 | 正常表现 |
| --- | --- |
| `收件箱` | 能看到新导入歌曲 |
| `歌曲` | 能看到歌曲标题、艺术家、时长 |
| 底部播放器 | 显示当前播放歌曲 |
| 进度条 | 播放后会向前走 |
| 音频输出 | 能听到声音 |

如果每一项都正常，你已经完成最重要的一步：本地导入和基础播放是通的。后面再研究歌词、MV、DSP、远程库都不急。

如果看不到刚才导入的歌，先按这个顺序查：

1. 你选的是不是文件夹，而不是某个空目录。
2. 文件夹里是不是确实有音频文件。
3. 文件是不是本机真实文件，不是网盘占位。
4. 扫描是不是还没结束。
5. `收件箱` 和 `歌曲` 都看一遍。
6. 搜索框里是不是残留了关键词，把搜索框清空。
7. 文件后缀是不是常见音频格式，例如 MP3、FLAC、WAV、M4A。

如果没有声音，先不要重建数据库。按这个顺序排查：

1. 系统音量是不是静音。
2. ECHO NEXT 底部音量是不是太低。
3. 当前输出设备是不是你正在用的耳机或音箱。
4. 换一首确定正常的 MP3。
5. 到 `设置 -> 播放` 把输出模式切回 `系统输出` 或共享输出。
6. 关闭 EQ、ReplayGain、变速。
7. 再试播放。

如果进度条不动，优先怀疑文件、路径或解码；如果进度条在动但没声音，优先怀疑音量、输出设备或输出模式。不要把这两类问题混在一起乱改。

### 第一轮成功后检查什么

小测试目录能播放以后，再做四个简单检查。

1. 去 `歌曲`，确认标题、艺术家、时长大致正常。
2. 去 `专辑`，确认专辑有没有出现。
3. 点一首带封面的歌，确认底部播放器有没有封面。
4. 在 `歌曲` 搜索框里输入歌名的一部分，确认能搜到。

检查结果这样判断：

| 现象 | 说明 | 先做什么 |
| --- | --- | --- |
| 歌能播，但标题乱码 | 多半是源文件标签编码或标签内容问题 | 先看同一文件在其它播放器里的信息 |
| 歌能播，但专辑拆成好几张 | 专辑名、专辑艺术家、碟号不统一 | 后面看“想整理一张专辑怎么做” |
| 歌能播，但封面不对 | 文件内嵌封面或文件夹封面可能不统一 | 先别清缓存，先查源文件 |
| 搜不到歌 | 可能搜索词不对、扫描未完成、列表过滤未清空 | 清空搜索和筛选，再看 `歌曲` |

这一轮的目标不是把曲库整理得完美，而是确认软件能正常读到文件、显示出来、播放出来。

### 第一次导入完整曲库

目标：把你的长期音乐目录加入 ECHO NEXT。

1. 先确认你的小文件夹测试已经正常。
2. 确认完整曲库所在磁盘稳定在线。
3. 如果是移动硬盘，确认盘符不会突然变化。
4. 如果是 NAS 或同步盘，确认网络稳定。
5. 确认你要导入的是音乐根目录，不是整个系统盘。
6. 不要把 `C:\`、下载缓存、游戏目录、软件目录一起扫进去。
7. 打开 `导入文件夹` 或 `文件夹`。
8. 选择完整音乐根目录，例如 `D:\Music`。
9. 开始导入。
10. 让扫描跑完第一轮。
11. 扫描时可以看 `歌曲`，但不要同时启动下载器和远程全量索引。
12. 扫描时电脑变忙是正常的，尤其是第一次读大量封面和标签。
13. 扫描结束后打开 `专辑`。
14. 检查专辑墙是否大致正确。
15. 打开 `艺术家`。
16. 检查艺术家有没有明显重复或乱码。
17. 打开 `收件箱`。
18. 检查新导入内容。
19. 先播放几首不同格式的歌。
20. 再开始整理标签、建歌单、开歌词和 MV。

如果第一次扫描很慢，不代表坏了。首次扫描要读文件、标签、封面、时长和专辑信息。大曲库就是会花时间。

完整曲库导入后，先别急着批量修。按这个顺序看：

| 先看什么 | 为什么 |
| --- | --- |
| `歌曲` 数量 | 确认大致扫进来了 |
| `收件箱` | 确认新导入内容集中在哪里 |
| `专辑` | 看专辑是否明显拆分 |
| `艺术家` | 看艺术家是否乱码或重复 |
| 随机播放几首 | 确认不是只有测试目录能播 |

如果你有几万首歌，第一天只要完成“导入、能搜、能播、能看专辑”就够了。不要第一天就批量重写标签、清缓存、重建数据库、装插件、全量远程索引一起上。

### 每天听歌怎么用

最简单的日常流程：

1. 打开 ECHO NEXT。
2. 进 `歌曲`。
3. 用搜索框找歌，或者切到 `专辑` 找专辑。
4. 找到想听的歌。
5. 直接播放，或者右键加入队列。
6. 想临时排一批歌，就放 `播放队列`。
7. 想长期保存，就放 `歌单`。
8. 特别喜欢，就点收藏，之后在 `收藏` 里找。
9. 忘记刚才听了什么，就去 `播放历史`。

不要把所有东西都塞进队列。队列是临时的，播放列表才是长期保存。

### 想整理一张专辑怎么做

目标：让专辑显示正确，曲目顺序正确，封面正确。

1. 打开 `专辑`。
2. 搜索专辑名。
3. 如果同一张专辑出现多份，点进去看曲目。
4. 检查每首歌的“专辑名”是否一致。
5. 检查每首歌的“专辑艺术家”是否一致。
6. 检查“曲号”是否是 1、2、3 这样。
7. 多碟专辑检查“碟号”。
8. 如果信息错了，回到 `歌曲`。
9. 找到这些歌曲。
10. 右键编辑标签。
11. 改完后回到 `专辑` 看是否合并正确。
12. 如果封面错，检查文件内嵌封面或文件夹封面。

专辑整理优先看这几个字段：

| 字段 | 为什么重要 |
| --- | --- |
| 专辑名 | 决定专辑名称，对应标签字段 `album` |
| 专辑艺术家 | 决定同名专辑是否应该归到一起，对应标签字段 `albumArtist` |
| 曲号 | 决定曲目顺序，对应标签字段 `trackNo` |
| 碟号 | 决定多碟顺序，对应标签字段 `discNo` |
| 年份 | 决定发行年份显示，对应标签字段 `year` |
| 封面 | 决定专辑墙观感 |

### 想做一个歌单怎么做

目标：把一批歌长期保存起来。

1. 打开 `歌曲`。
2. 搜索你想加入的歌曲。
3. 选中一首或多首。
4. 右键。
5. 选择加入播放列表。
6. 选择已有歌单，或者新建歌单。
7. 打开 `歌单`。
8. 找到这个歌单。
9. 检查歌曲是否都在里面。
10. 之后想听这个主题时，直接从 `歌单` 打开。

建议歌单分类：

| 歌单 | 用途 |
| --- | --- |
| 日常听 | 平时最常听 |
| 新歌待整理 | 刚导入还没确定是否保留 |
| 耳机测试 | 测低频、人声、声场、齿音 |
| 高解析测试 | 测 Hi-Res、DSD、不同采样率 |
| 夜间听 | 响度稳定、不吵 |
| 车载 | 适合路上听 |

### 想调音频输出怎么做

目标：先保证能听，再追求更高级输出。

1. 先用默认输出播放一首确定正常的歌。
2. 有声音后再进 `设置 -> 播放`。
3. 找到输出设备。
4. 如果你不确定选什么，先用 `系统输出`。
5. 如果想更稳定的 Windows 日常输出，试 `WASAPI 共享输出`。
6. 如果你明确想独占设备，再试 `WASAPI 独占输出`。
7. 如果你有专业声卡，再试 `ASIO`。
8. 每切一次输出模式，都播放同一首歌确认是否正常。
9. 出现异常就切回上一个正常模式。
10. 调输出时先关闭 EQ、ReplayGain、变速。

判断是否正常：

| 项目 | 正常表现 |
| --- | --- |
| 设备 | 能看到你要用的耳机、音箱或 DAC |
| 播放 | 点播放后进度前进 |
| 声音 | 没爆音、没明显卡顿、没异常加速 |
| 状态 | 没有持续报错 |
| 切歌 | 上一首、下一首正常 |

### 想看歌词怎么做

1. 先播放一首歌。
2. 打开 `歌词`。
3. 看是否自动出现歌词。
4. 如果没有歌词，检查歌词来源设置。
5. 如果歌词整体早或晚，调整时间偏移。
6. 如果匹配错版本，手动选择候选。
7. 如果字体太小，到歌词设置调字号。
8. 如果背景复杂看不清，打开可读性增强或调颜色。

### 想看 MV 怎么做

1. 先播放一首歌。
2. 点击 MV 入口或打开 MV 相关页面。
3. 等待候选结果。
4. 先选最像官方 MV 的候选。
5. 如果自动候选不对，手动选择。
6. 如果有自定义 URL，就粘贴指定视频。
7. 如果高质量内嵌播放失败，尝试外部播放。
8. 如果 HEVC、HDR、Dolby Vision 不能播，这是编码支持问题，不一定是匹配问题。

### 想下载一首歌怎么做

1. 打开 `下载`。
2. 确认输出目录。
3. 搜索关键词，或者粘贴 URL。
4. 看搜索结果标题、时长、上传者是否符合预期。
5. 点击下载。
6. 查看任务状态。
7. 等待下载、提取音频、导入曲库。
8. 完成后去 `收件箱` 或 `歌曲` 检查。

下载前请确认内容来源合法。下载器依赖网络、平台策略、FFmpeg、yt-dlp 和本机环境，失败时先看工具状态和错误信息。

### 想添加远程音乐库怎么做

1. 打开 `远程曲库`。
2. 选择来源类型，例如 WebDAV、Jellyfin、Subsonic。
3. 填显示名称。
4. 填服务器地址。
5. 填账号、密码或 token。
6. 选择同步模式。
7. 先点测试连接。
8. 测试成功再保存。
9. 先用“仅浏览”或小范围索引试用。
10. 稳定后再建立索引。

不要一上来就对巨大远程库做重任务。先确认能连接、能浏览、能播放。

### 想启用插件怎么做

1. 打开 `插件`。
2. 先看插件名称和来源。
3. 打开插件详情。
4. 看它请求了哪些权限。
5. 如果有 `settings:write`、`library:write`、`network`，要特别谨慎。
6. 确认可信后再启用。
7. 启用后看活动摘要和日志。
8. 如果插件报错，先禁用。
9. 如果连续启动失败，宿主可能会隔离它。

新手建议先只试示例插件，不要直接启用来源不明的高权限插件。

## 看不懂界面时先这样判断

这一节专门给“我不知道现在发生了什么”的情况用。不要急，先判断你在哪个页面、正在做哪类事情。

### 先看左侧页面

| 你在左侧点到 | 说明 |
| --- | --- |
| `歌曲` | 你在看歌曲列表 |
| `专辑` | 你在看专辑 |
| `艺术家` | 你在看艺术家 |
| `文件夹` | 你在看本地导入目录 |
| `收件箱` | 你在看新导入歌曲 |
| `播放队列` | 你在看当前临时播放顺序 |
| `收藏` | 你在看收藏 |
| `播放历史` | 你在看播放历史 |
| `歌单` | 你在看长期歌单 |
| `在线搜索` | 你在搜在线内容 |
| `下载` | 你在下载 |
| `远程曲库` | 你在配置远程库 |
| `局域网播放` | 你在找局域网投放设备 |
| `插件` | 你在管理插件 |
| `设置` | 你在改全局设置 |

### 再看底部播放器

底部播放器显示的是当前播放状态。判断顺序：

1. 有没有歌曲标题。
2. 有没有封面。
3. 播放按钮是播放还是暂停。
4. 进度条有没有动。
5. 音量是不是太低。
6. 有没有错误提示。
7. 当前输出设备是不是正确。

如果列表里有歌，但底部播放器没变化，说明你可能只是选中了歌曲，还没有真正开始播放。

### 再看右键菜单

右键菜单能告诉你当前对象是什么。

| 右键对象 | 你可能看到 |
| --- | --- |
| 本地歌曲 | 编辑标签、打开文件夹、复制路径、删除 |
| 远程歌曲 | 加队列、播放、收藏，但本地文件操作会少 |
| 专辑 | 播放专辑、加入队列、编辑专辑标签、保存封面 |
| 队列歌曲 | 从队列移除、下一首播放 |
| 插件 | 启用、禁用、重载、查看日志 |

如果某个按钮没有出现，先想想：这个对象是不是远程的？是不是当前页面不支持？是不是没有选中内容？

### 再看状态文字

常见状态大概这样理解：

| 状态 | 含义 | 你要做什么 |
| --- | --- | --- |
| 正在加载 | 页面或数据还在准备 | 等一下，不要连续猛点 |
| 正在扫描 | 曲库扫描任务正在跑 | 等扫描完成 |
| 已排队 | 任务还没开始 | 等任务轮到它 |
| 正在下载 | 下载任务正在跑 | 看进度和速度 |
| 正在导入曲库 | 下载结果正在写入曲库 | 完成后去 `收件箱` 看 |
| 失败 | 当前任务没有完成 | 点开错误或看日志 |
| 已取消 | 任务被你或系统取消 | 需要的话重新开始 |
| 文件不可用 | 找不到文件或远程资源 | 检查路径、磁盘、远程来源 |

### 如果你不知道该点哪里

按目标找入口：

| 目标 | 去哪里 |
| --- | --- |
| 我要导入本地歌 | `导入文件夹` |
| 我要找歌 | `歌曲` |
| 我要按专辑听 | `专辑` |
| 我要看新歌 | `收件箱` |
| 我要临时排歌 | `播放队列` |
| 我要做长期歌单 | `歌单` |
| 我要调声音输出 | `设置 -> 播放` |
| 我要调 EQ | `设置 -> EQ / DSP` |
| 我要调歌词 | `设置 -> 歌词` 或 `歌词` |
| 我要看 MV | 播放器的 MV 入口或 MV 设置 |
| 我要下载 | `下载` |
| 我要连远程库 | `远程曲库` |
| 我要改主题 | `设置 -> 外观` |
| 我要看日志 | `设置 -> 关于` 或相关诊断入口 |
| 我要做危险修复 | `设置 -> 危险操作`，先备份 |

## 新手不要乱动的地方

这些功能不是不能用，而是要知道自己在干什么。

| 功能 | 为什么要谨慎 |
| --- | --- |
| 删除歌曲 | 可能影响真实文件或曲库记录 |
| 重建数据库 | 会影响曲库索引、扫描状态和本地记录 |
| 清理缓存 | 封面、临时文件或下载结果可能需要重新生成 |
| 修改插件高风险权限 | 插件可能改设置、读网络、写曲库 |
| 改代理 | 会影响歌词、MV、流媒体、下载、网络元数据 |
| 改输出模式到独占或 ASIO | 可能因为设备或驱动导致无声或失败 |
| 批量标签编辑 | 改错会让专辑、艺术家、搜索全部乱掉 |
| 全量远程索引 | 大远程库可能跑很久，也可能占网络 |

安全做法：

1. 先小范围试。
2. 看清楚会影响什么。
3. 能备份就备份。
4. 不确定就不要点危险按钮。
5. 出问题先恢复上一步，不要连续乱改。

## 常见目标的最短路径

### 我要播放一首本地歌

1. `歌曲`。
2. 搜索歌名。
3. 找到歌曲。
4. 双击或点播放。
5. 看底部播放器。
6. 有声音就完成。

### 我要播放一整张专辑

1. `专辑`。
2. 搜索专辑名。
3. 打开专辑。
4. 检查曲目顺序。
5. 点播放专辑，或右键专辑选择播放。

### 我要把几首歌排到下一首后面

1. `歌曲`。
2. 选中歌曲。
3. 右键。
4. 选“下一首播放”或“加入队列”。
5. 去 `播放队列` 检查顺序。

### 我要把一首歌加入歌单

1. `歌曲`。
2. 找到歌曲。
3. 右键。
4. 选择加入播放列表。
5. 选择歌单。
6. 去 `歌单` 检查。

### 我要修正歌名

1. `歌曲`。
2. 找到歌曲。
3. 右键。
4. 选择编辑标签。
5. 修改标题。
6. 保存。
7. 搜索新标题确认。

### 我要修正专辑拆分

1. `专辑`。
2. 找到被拆开的专辑。
3. 记住哪些曲目应该属于同一专辑。
4. 回到 `歌曲`。
5. 找到这些曲目。
6. 编辑标签。
7. 统一“专辑名”和“专辑艺术家”。
8. 保存。
9. 回到 `专辑` 检查是否合并。

### 我要换输出设备

1. 插好耳机、音箱或 DAC。
2. 确认系统能识别设备。
3. 打开 `设置 -> 播放`。
4. 找输出设备。
5. 选择目标设备。
6. 先用“系统输出”或“共享输出”测试。
7. 播放一首歌。
8. 正常后再考虑“独占输出”或 ASIO。

### 我要让声音别忽大忽小

1. 打开 `设置 -> 播放`。
2. 找 ReplayGain。
3. 开启相关响度处理。
4. 播放几首不同专辑的歌测试。
5. 如果你要 bit-perfect，就关掉 ReplayGain。

### 我要让歌词晚一点或早一点

1. 播放歌曲。
2. 打开 `歌词`。
3. 判断歌词是早了还是晚了。
4. 打开歌词设置。
5. 调整时间偏移。
6. 调一点就播放检查，不要一次调太大。
7. 保存后再听一遍副歌确认。

### 我要把视频当 MV 绑定

1. 播放歌曲。
2. 打开 MV 入口。
3. 搜索候选。
4. 找最正确的视频。
5. 如果候选没有，复制视频 URL。
6. 用自定义 URL 绑定。
7. 播放确认。
8. 高规格视频不能内嵌时用外部播放。

## 基本概念

ECHO NEXT 不是单纯的文件打开器。它更像一个本地音乐管理系统，核心由几层组成：

| 概念 | 说明 |
| --- | --- |
| 本地文件 | 你磁盘上的真实音频文件，例如 FLAC、MP3、WAV、M4A |
| 曲库 | ECHO NEXT 从文件中扫描出来的 SQLite 数据库 |
| 标签 | 文件里记录的标题、艺术家、专辑、年份、曲号、封面等元数据 |
| 封面缓存 | 为列表和专辑墙生成的轻量封面文件 |
| 队列 | 当前临时播放顺序 |
| 播放列表 | 用户长期保存的歌单 |
| 远程来源 | WebDAV、Jellyfin、Emby、SMB、SSHFS、Subsonic 等外部音乐库 |
| 网络元数据 | 从网络来源找到的候选信息，只应该补缺，不应该覆盖高可信标签 |
| 音频输出 | 系统输出、WASAPI、ASIO、EQ、ReplayGain 等播放链路设置 |
| 插件 | 本地可编辑、受权限控制的扩展脚本 |

### 本地优先

ECHO NEXT 的中心是本地曲库。远程来源、流媒体搜索、下载器、网络元数据、插件都属于扩展能力。它们应该围绕本地听歌体验服务，而不是让播放器变成完全依赖在线平台的壳。

### 稳定优先

播放稳定比功能数量更重要。扫描、封面生成、远程补全、下载、插件、诊断窗口都不应该抢占播放链路。

### 可解释优先

音频输出、bit-perfect、EQ、ReplayGain、MV 候选回退、歌词匹配都要尽量说清楚当前状态。不要把被 DSP 处理过的声音伪装成 bit-perfect，也不要把网络候选当成绝对正确的元数据。

## 第一次使用

### 推荐路线

第一次使用时，不建议立刻导入完整大曲库。更稳的路线是：

1. 准备一个小文件夹，里面放 10 到 50 首常见格式的歌。
2. 打开 ECHO NEXT。
3. 用 `导入文件夹` 导入这个小文件夹。
4. 在 `收件箱` 查看新导入歌曲。
5. 在 `歌曲` 搜索、排序、播放几首歌。
6. 在 `专辑` 检查专辑和封面是否聚合正常。
7. 打开 `歌词` 和 `MV` 看候选是否可用。
8. 进入 `设置 -> 播放` 确认输出设备。
9. 如果这些都正常，再导入完整曲库。

这样做的好处是：如果扫描、播放、封面、输出、歌词、MV 里有任何一环不对，你能在小范围里定位，不会一开始就被几万首歌和多个后台任务拖住。

### 不建议一开始就做的事

| 不建议 | 原因 |
| --- | --- |
| 一次导入整个几十万文件目录 | 首次扫描会很慢，问题也难定位 |
| 同时开启远程库、下载器、插件、网络补全 | 多条后台链路叠在一起，不容易判断问题来源 |
| 外置硬盘没稳定连接就扫全库 | 容易产生缺失、不可访问、扫描失败等状态 |
| 歌词和 MV 不准就立刻认为程序坏了 | 自动匹配依赖元数据和网络来源，天然存在误差 |
| 播放异常时直接重建数据库 | 播放问题多数不需要动数据库 |

## 页面总览

| 页面 | 主要用途 | 最常用操作 |
| --- | --- | --- |
| `导入文件夹` | 导入本地音乐文件夹 | 选择目录并开始扫描 |
| `文件夹` | 管理导入根目录 | 查看扫描状态、维护目录 |
| `收件箱` | 查看新扫描歌曲 | 检查新导入内容 |
| `歌曲` | 全曲库主列表 | 搜索、排序、播放、右键、标签编辑 |
| `专辑` | 专辑墙和专辑详情 | 按专辑播放、检查封面、整理专辑 |
| `艺术家` | 艺术家浏览 | 检查艺术家聚合 |
| `播放队列` | 当前播放队列 | 调整临时播放顺序 |
| `收藏` | 收藏歌曲 | 快速查看喜欢的歌 |
| `播放历史` | 播放历史 | 找回刚听过的内容 |
| `歌单` | 播放列表 | 管理长期歌单 |
| `歌词` | 沉浸式歌词页 | 看歌词、调偏移、看辅助文本 |
| `在线搜索` | 流媒体搜索 | 搜索单曲、专辑、歌手、歌单 |
| `下载` | 下载任务 | URL 下载、搜索下载、导入曲库 |
| `远程曲库` | 远程来源 | 添加 WebDAV、Jellyfin、Subsonic 等 |
| `局域网播放` | 局域网播放 | DLNA、AirPlay 等发现和连接 |
| `插件` | 插件管理 | 启用、禁用、查看权限和日志 |
| `设置` | 全局设置 | 播放、歌词、MV、EQ、外观、曲库、危险操作 |

## 本地曲库

本地曲库是 ECHO NEXT 的核心。曲库质量越好，搜索、专辑墙、歌词匹配、MV 匹配、播放列表和统计越可靠。

### 文件整理建议

推荐结构：

```text
Music/
  Artist/
    2024 - Album Name/
      01 - Track.flac
      02 - Track.flac
      cover.jpg
```

不是必须这样放，但稳定的目录结构会减少后续整理成本。

建议：

1. 一个专辑文件夹里尽量放同一张专辑。
2. 同一张专辑的“专辑名”和“专辑艺术家”保持一致。
3. 多碟专辑写好“碟号”和“曲号”。
4. 不要把临时下载目录直接当长期曲库。
5. 外置硬盘和 NAS 路径尽量固定。
6. 文件名可以辅助识别，但不要只依赖文件名。

### 支持的常见音频格式

项目的文件关联包含大量格式，常见包括：

| 类型 | 示例 |
| --- | --- |
| 无损 | FLAC、WAV、ALAC、AIFF、APE、WavPack |
| 有损 | MP3、AAC、M4A、OGG、Opus、WMA |
| DSD | DSF、DFF |
| 视频或容器 | MKV、MP4、MOV、WebM、MKA |
| 其它 | MPC、TAK、TTA、CAF、DTS、CUE |

是否能顺利播放取决于解码工具、文件本身、封装方式和当前音频链路。

## 导入文件夹

### 入口

你可以通过这些入口导入：

1. 侧边栏 `导入文件夹`。
2. `文件夹` 页面里的添加入口。
3. `设置 -> 曲库` 里的文件夹管理区域。

### 导入时发生什么

导入文件夹后，ECHO NEXT 会：

1. 记录这个根目录。
2. 后台扫描目录。
3. 找出音频文件。
4. 读取嵌入式标签。
5. 读取或提取封面。
6. 写入曲库数据库。
7. 聚合专辑和艺术家。
8. 更新 `歌曲`、`专辑`、`艺术家`、`收件箱` 等页面。

### 扫描状态怎么看

扫描过程可能包含这些阶段：

| 阶段 | 含义 |
| --- | --- |
| 排队 | 等待扫描任务开始 |
| 发现文件 | 遍历目录，寻找音频文件 |
| 检查增量缓存 | 判断哪些文件没有变化 |
| 读取元数据 | 读取标题、艺术家、专辑、时长等 |
| 提取封面 | 读取嵌入封面或文件夹封面 |
| 整理专辑 | 聚合同一专辑和曲目顺序 |
| 写入数据库 | 保存扫描结果 |
| 完成 | 本轮扫描结束 |
| 失败 / 取消 | 本轮扫描未完成 |

### 大曲库导入建议

如果你的曲库很大：

1. 第一次扫描时保持磁盘在线。
2. 不要同时做大量下载、远程同步和插件批处理。
3. 扫描期间可以浏览，但尽量避免频繁切换大范围筛选。
4. 如果扫描失败，先看失败路径，不要直接重建数据库。
5. 后续扫描会尽量复用未变化文件，通常比首次快。

## 文件夹

`文件夹` 用来管理导入根目录。

### 适合做什么

1. 查看已经添加的音乐文件夹。
2. 添加新的根目录。
3. 判断某个目录是否还可访问。
4. 触发或观察扫描。
5. 检查哪些目录可能出错。

### 常见问题

| 现象 | 可能原因 | 建议 |
| --- | --- | --- |
| 文件夹突然不可用 | 外置盘离线、盘符变化、权限变化 | 先恢复路径，不要急着删除 |
| 扫描很慢 | 首次扫描、大量封面、大量无损文件 | 等待完成，避免同时跑重任务 |
| 新文件没出现 | 没重新扫描、文件格式异常、路径不在根目录下 | 手动刷新或检查目录 |
| 重复出现歌曲 | 添加了父目录和子目录 | 保留一个根目录 |

## 收件箱

`收件箱` 是新导入内容的检查区。

### 适合场景

1. 刚下载了一批歌。
2. 刚复制了一张专辑。
3. 刚导入新文件夹。
4. 想快速筛查新增歌曲是否正常。

### 检查清单

| 检查项 | 看什么 |
| --- | --- |
| 标题 | 是否是正确歌名，不是文件名乱码 |
| 艺术家 | 是否统一 |
| 专辑 | 是否聚合到正确专辑 |
| 封面 | 是否显示正确封面 |
| 时长 | 是否异常为 0 或明显不对 |
| 播放 | 是否能正常播放 |
| 格式 | 是否符合预期 |

如果新导入内容质量很差，优先整理源文件标签，再重新读取或重新扫描。

## 歌曲列表

`歌曲` 是最重要的日常页面。找歌、播放、整理、排查，大多数都会经过这里。

### 搜索

搜索适合找：

1. 歌曲标题。
2. 艺术家。
3. 专辑。
4. 某些版本关键字。

建议：

1. 大曲库里优先搜索，不要纯靠滚动。
2. 搜索不到时检查标签，不要只看文件名。
3. 如果艺术家或专辑字段为空，搜索效果会下降。

### 排序

| 排序 | 适合用途 |
| --- | --- |
| 默认排序 | 日常浏览 |
| 创建时间正序 / 倒序 | 找新导入或旧导入 |
| 歌曲名 A-Z / Z-A | 按标题整理 |
| 音乐时间短到长 / 长到短 | 找异常短音频、长音频、整轨 |
| 文件修改时间旧到新 / 新到旧 | 找最近改过的文件 |
| 歌曲质量 / 大小 | 找高规格或异常小文件 |
| 常听歌曲 | 找播放频率高的内容 |
| 随机排序 | 打散浏览 |
| 按艺术家 | 检查艺术家聚合 |
| 按专辑 | 检查专辑字段 |
| 最近更新 | 查看最近扫描变化 |

### 本地和远程来源切换

歌曲页可以在本地曲库和远程来源之间切换。区别是：

| 来源 | 能做什么 | 限制 |
| --- | --- | --- |
| 本地 | 播放、编辑标签、打开文件夹、复制路径、删除、封面操作 | 依赖本地文件存在 |
| 远程 | 浏览、播放、加入队列、收藏、加入歌单 | 不一定能编辑标签或打开本地路径 |

如果你在远程歌曲上看不到某些右键操作，这是正常边界。

### 多选

多选适合：

1. 批量加入队列。
2. 批量加入播放列表。
3. 批量收藏。
4. 批量从队列移除。

不建议对大量文件一次性做高风险修改。尤其是删除、标签写入、重读标签这类动作，最好分批确认。

### 重复歌曲筛选

重复歌曲筛选适合清理：

1. 同一文件复制了多份。
2. 同一首歌不同码率。
3. 同一专辑重复导入。
4. 下载目录和正式曲库重复。

但这些不一定是重复：

1. 现场版。
2. Remaster。
3. Radio Edit。
4. Instrumental。
5. Cover。
6. 不同语言版本。
7. 专辑版和单曲版。

删除前至少对比路径、时长、码率、专辑和文件大小。

### 右键菜单

本地歌曲常见右键动作：

| 操作 | 说明 | 风险 |
| --- | --- | --- |
| 加入播放列表 | 保存到长期歌单 | 低 |
| 下一首播放 | 插入到当前播放后 | 低 |
| 加入队列 | 加到队列末尾 | 低 |
| 收藏 / 取消收藏 | 改变喜欢状态 | 低 |
| 编辑标签 | 修改曲库或文件标签 | 中 |
| 重新读取嵌入式标签 | 用文件标签刷新曲库记录 | 中 |
| 打开 osu! timing | 查看或调整 timing | 低到中 |
| 跳到专辑 | 打开专辑详情 | 低 |
| 在文件夹中显示 | 打开系统文件夹 | 低 |
| 复制路径 | 复制本地路径 | 低 |
| 用系统打开 | 交给系统默认程序 | 低 |
| 复制歌名和艺术家 | 用于搜索或分享 | 低 |
| 复制 / 保存封面 | 导出封面素材 | 低 |
| 删除歌曲 | 删除或移除歌曲 | 高 |

### 标签编辑

标签编辑会影响曲库显示，某些情况下也可能写回文件标签。

建议字段规则：

| 字段 | 建议 |
| --- | --- |
| 歌名 | 只写歌曲标题，不要塞艺术家 |
| 艺术家 | 参与演唱或主要艺人 |
| 专辑名 | 同一张专辑保持一致 |
| 专辑艺术家 | 同一专辑尽量统一 |
| 年份 | 用发行年份，不要随意混入日期文本 |
| 曲号 | 曲号写数字 |
| 碟号 | 多碟专辑写碟号 |
| 风格 | 可以粗略，不要写太碎 |

### 歌曲列表排查

| 问题 | 先检查 |
| --- | --- |
| 歌找不到 | 是否导入目录、是否扫描完成、标签是否为空 |
| 标题乱码 | 源文件标签编码或文件名来源 |
| 专辑拆分 | 专辑名 / 专辑艺术家是否一致 |
| 封面不显示 | 文件是否有封面、文件夹是否有 cover/front 图片、缓存是否生成 |
| 播放失败 | 文件是否存在、格式是否可解码、输出设备是否正常 |
| 右键少选项 | 是否远程歌曲、是否当前上下文不支持 |

## 专辑墙

`专辑` 是按专辑浏览的主入口。

### 适合做什么

1. 按专辑听歌。
2. 检查专辑封面。
3. 整理多碟专辑。
4. 检查同名专辑是否混在一起。
5. 找缺失封面的专辑。
6. 将整张专辑加入队列或歌单。

### 专辑排序

专辑页支持标题、艺术家、创建时间、时长、文件修改时间、最近更新、随机等排序。常见用法：

| 目标 | 推荐排序 |
| --- | --- |
| 找最近加入的专辑 | 创建时间倒序或最近更新 |
| 检查标题 | 标题排序 |
| 检查艺术家 | 艺术家排序 |
| 随便听一张 | 随机 |
| 找异常专辑 | 时长排序 |

### 专辑详情

进入专辑详情后，重点看：

1. 曲目顺序是否正确。
2. 碟号是否正确。
3. 曲号是否完整。
4. 封面是否正确。
5. 艺术家和专辑艺术家是否符合预期。

### 专辑右键菜单

常见动作：

| 操作 | 用途 |
| --- | --- |
| 播放专辑 | 从头播放整张专辑 |
| 加入歌单 | 保存到长期播放列表 |
| 加入队列 | 临时加入播放顺序 |
| 收藏专辑 | 标记喜欢的专辑 |
| 编辑标签 | 修正专辑级信息 |
| 复制专辑信息 | 复制标题、艺术家等 |
| 复制 / 保存封面 | 处理封面 |
| 删除专辑 | 高风险，谨慎 |

### 专辑聚合错误

| 现象 | 可能原因 | 处理 |
| --- | --- | --- |
| 一张专辑拆成多张 | 专辑名或专辑艺术家不一致 | 统一标签后重新读取 |
| 多个专辑混成一张 | 专辑名相同但专辑艺术家缺失 | 补专辑艺术家 |
| 曲目顺序错 | 曲号或碟号缺失 | 补曲号和碟号 |
| 封面错 | 单曲嵌入封面不同 | 统一封面或文件夹封面 |
| 年份不对 | 标签年份混乱 | 修正 year |

## 艺术家

`艺术家` 适合检查艺术家聚合。

常见拆分原因：

1. `Aimer` 和 `aimer`。
2. `YOASOBI` 和 `Yoasobi`。
3. `Artist feat. B` 和 `Artist / B`。
4. 中文名和英文名混用。
5. 前后有空格。
6. 使用了不同标点。

建议先确定你希望使用哪种命名规则，再批量整理标签。

## 播放队列

队列是临时的播放顺序。

### 队列适合

1. 今天临时想听的一批歌。
2. 临时把搜索结果排在一起。
3. 测试不同格式或不同采样率。
4. 快速插入下一首。

### 队列不适合

1. 长期收藏。
2. 主题歌单。
3. 需要跨设备或长期维护的列表。

长期内容请使用 `歌单`。

### 使用建议

1. 临时听歌用队列。
2. 确定要长期保留时，再加入播放列表。
3. 测试音频设备时，可以建立一个专门播放列表，而不是每次手动排队。

## 收藏

`收藏` 是快速收藏。

适合：

1. 标记常听歌曲。
2. 临时收集喜欢的歌。
3. 从收藏里快速开始播放。

不适合：

1. 复杂分类。
2. 多主题整理。
3. 专辑级结构管理。

复杂整理请用播放列表。

## 播放历史

`播放历史` 记录播放过的内容。

适合：

1. 找回刚才听过但忘记收藏的歌。
2. 回看最近播放顺序。
3. 排查某首歌是否反复出问题。
4. 确认某次播放是否真的进入下一首。

## 歌单

播放列表适合长期整理。

### 推荐歌单类型

1. 日常精选。
2. 夜间听。
3. 工作背景。
4. 耳机测试。
5. 音箱测试。
6. 高解析测试。
7. 新专辑候选。
8. 车载同步。
9. 本地无损精选。
10. 某个艺人的精选。

### 队列和播放列表的区别

| 功能 | 适合 |
| --- | --- |
| 播放队列 | 临时播放顺序 |
| 歌单 | 长期保存和整理 |
| 收藏 | 快速标记喜欢 |
| 播放历史 | 找回播放记录 |

## 播放控制

底部播放器是全局播放控制区。

### 常见控件

1. 播放 / 暂停。
2. 上一首 / 下一首。
3. 进度条。
4. 音量。
5. 当前歌曲标题、艺术家和封面。
6. 队列入口。
7. 歌词入口。
8. MV 入口。
9. 输出或状态提示。

### 播放异常排查

| 现象 | 先检查 |
| --- | --- |
| 点播放没声音 | 系统音量、应用音量、输出设备 |
| 进度不走 | 文件是否可解码、音频宿主是否启动 |
| 突然下一首 | 文件是否损坏、是否提前结束、是否有解码错误 |
| 进度跳动 | 输出模式、设备、播放诊断 |
| 切歌卡顿 | 是否同时扫描、下载、远程补全、插件重任务 |
| 某些文件不能播 | 文件格式、封装、损坏、FFmpeg 支持 |

不要看到播放问题就先重建数据库。播放链路和数据库不是一回事。

## 歌词

歌词体验包含显示、匹配、翻译、罗马音、假名增强、偏移和样式。

### 歌词来源

歌词可能来自：

1. 本地 LRC。
2. 嵌入式歌词。
3. 在线歌词候选。
4. 手动选择的候选。
5. 增强来源，例如日文假名或注音辅助。

### 歌词设置

常见设置：

| 设置 | 用途 |
| --- | --- |
| 歌词来源 | 控制从哪里找歌词 |
| 时间偏移 | 修正整体早晚 |
| 字体 | 调整歌词字体 |
| 字号 | 调整阅读大小 |
| 行宽限制 | 避免长句撑爆 |
| 翻译 | 显示辅助翻译 |
| 罗马音 | 给日文等内容提供读音辅助 |
| 假名增强 | 在可用时显示日文假名或注音 |
| 可读性增强 | 提高背景复杂时的歌词可读性 |

### 歌词不同步

| 情况 | 处理 |
| --- | --- |
| 全部歌词都晚一点 | 增加负向或正向偏移，按实际设置方向调整 |
| 只有某几句不准 | 可能是歌词文件本身时间轴不准 |
| 匹配到另一首 | 手动选择候选 |
| 现场版对不上 | 找现场版歌词或手动调整 |
| 翻译和原文不成对 | 来源数据质量问题 |

### 日文假名和罗马音

假名、罗马音是辅助文本，不应该替代主歌词时间轴。它们适合：

1. 日文学习。
2. 看不熟悉汉字读音。
3. 跟唱。
4. 辅助理解。

如果增强来源质量不好，宁可不显示，也不要破坏主歌词。

## MV

MV 功能围绕当前歌曲查找视频候选。

### MV 来源和候选

MV 可能来自 Bilibili、YouTube 或其它支持来源。匹配会依赖：

1. 歌曲标题。
2. 艺术家。
3. 专辑。
4. 平台搜索结果。
5. 候选标题。
6. 视频质量和编码。

### 质量选择

常见质量包括 720p、1080p、1080p 60fps、4K、4K 60fps、4K 120fps 等。实际可用质量由平台返回结果决定。

注意：

1. 高质量不一定能内嵌播放。
2. HEVC、HDR、Dolby Vision 等编码可能需要外部播放器。
3. Bilibili 某些高规格流可能浏览器不支持。
4. 自动选择不一定是你想要的版本。

### MV 不准怎么办

1. 手动选择候选。
2. 自定义 URL。
3. 修正歌曲标题和艺术家。
4. 对同名歌曲加上版本信息。
5. 接受部分歌曲需要手选，这是正常情况。

## 音频输出与 HiFi

音频输出是 ECHO NEXT 的重点之一，但也是最容易受设备环境影响的部分。

### 输出模式

| 模式 | 说明 | 适合 |
| --- | --- | --- |
| 系统输出 | 使用系统默认输出 | 普通用户、快速排查 |
| WASAPI 共享输出 | Windows 共享输出 | 日常稳定播放 |
| WASAPI 独占输出 | 独占设备 | 更直接的设备输出 |
| ASIO | 专业声卡链路 | 声卡、录音设备、低延迟场景 |
| DirectSound | 兼容输出 | 特殊设备或排查 |

### 选择建议

1. 不确定时先用“系统输出”。
2. 想稳定日常播放，用“WASAPI 共享输出”。
3. 想测试独占输出，再试“WASAPI 独占输出”。
4. 有专业声卡，再试 ASIO。
5. 遇到异常先回到“系统输出”或“共享输出”。

### bit-perfect

bit-perfect 代表信号尽量未经处理地输出。以下情况通常会破坏 bit-perfect：

1. EQ。
2. 前级增益。
3. ReplayGain。
4. 变速。
5. 重采样。
6. 系统混音。
7. 某些设备驱动处理。

不要为了显示好看强行追求 bit-perfect。如果你需要 EQ 或响度统一，就接受信号被处理。

### 采样率

采样率状态可能涉及：

1. 文件采样率。
2. 解码输出采样率。
3. 请求输出采样率。
4. 设备实际采样率。
5. 共享模式设备采样率。

如果这些值不同，不一定是 bug。共享输出、系统混音、设备限制都会影响实际结果。

## EQ / DSP

EQ 是 DSP 的一部分，用来调整声音风格。ECHO NEXT 的 DSP 不只是一个孤立的均衡器开关，它会影响信号链路、前级增益、ReplayGain、变速、bit-perfect 状态和削波风险。

最简单的判断方式是：只要你开启了 EQ、前级增益、响度统一、变速或其它处理，声音就不再是完全原生的 bit-perfect 输出。需要原生输出时，把这些 DSP 处理全部关掉，再回到“系统输出”或你确认稳定的 WASAPI / ASIO 输出模式。

### 基本原则

1. 从“平直”或“默认”预设开始。
2. 小幅调整。
3. 提升频段时降低前级增益。
4. 不要所有频段一起大幅提升。
5. 每种设备保存单独预设。

### 频段理解

| 频段 | 大致影响 |
| --- | --- |
| 低频 | 鼓、贝斯、厚度 |
| 中低频 | 温暖感、浑厚感，也容易糊 |
| 中频 | 人声、吉他、主体 |
| 中高频 | 清晰度、齿音 |
| 高频 | 空气感、亮度，也容易刺 |

### 常见问题

| 问题 | 处理 |
| --- | --- |
| 声音爆或破 | 降低前级增益 |
| 低频太轰 | 降低低频或中低频 |
| 人声靠后 | 轻微提升中频 |
| 声音刺 | 降低中高频或高频 |
| 想验证原始输出 | 关闭 EQ 和前级增益 |

## ReplayGain 和响度

ReplayGain 用来让不同歌曲的响度更接近。

适合：

1. 随机播放不同专辑。
2. 混合播放不同年代音乐。
3. 播放来源复杂的曲库。
4. 夜间听歌避免忽大忽小。

不适合：

1. bit-perfect 验证。
2. 想保持每张专辑原始响度关系。
3. 专业对比测试。

## 播放速度

播放速度功能适合特殊场景，例如听播客、练习、Nightcore / Daycore 等。

注意：

1. 变速会改变音频处理链路。
2. 变速后不应视为 bit-perfect。
3. 如果播放异常，先恢复正常速度再排查。

## 远程曲库

远程来源用于访问不在本机磁盘上的音乐。

### 支持类型

| 类型 | 适合 |
| --- | --- |
| WebDAV / AList | 网盘、AList、支持 WebDAV 的服务 |
| Jellyfin | 自建媒体服务器 |
| Emby | 自建媒体服务器 |
| NAS / SMB | 局域网共享 |
| SSHFS | SSH 文件系统 |
| Subsonic / Navidrome | 音乐服务器 |

### 添加远程来源

一般流程：

1. 进入 `远程曲库`。
2. 选择来源类型。
3. 填写显示名称。
4. 填写服务器地址。
5. 填写账号、密码或 token。
6. 选择同步模式。
7. 测试连接。
8. 保存。
9. 需要时开始索引。

### 同步模式

| 模式 | 说明 | 建议 |
| --- | --- | --- |
| 仅浏览 | 不写入曲库索引 | 临时访问 |
| 建立索引 | 写入远程曲目索引，播放时取流 | 推荐 |
| 镜像缓存 | 未来扩展，不默认复制整库 | 谨慎 |

### 远程后台任务

远程来源可能产生后台任务：

1. 元数据。
2. 封面。
3. 歌词。
4. MV。
5. 时长回填。

这些任务应当低优先级运行，尤其在播放中不要抢资源。

### 远程排查

| 现象 | 检查 |
| --- | --- |
| 连接失败 | 地址、账号、密码、证书、代理、防火墙 |
| 扫描慢 | 服务端速度、网络、文件数量 |
| 播放卡 | 网络带宽、服务端响应、正在后台任务 |
| 封面不显示 | 远程封面权限、缓存、后台任务 |
| 文件缺失 | 远程路径变化、服务端索引变化 |

## 局域网播放

`局域网播放` 面向 DLNA、AirPlay 等局域网发现和播放能力。

### 使用前检查

1. 电脑和目标设备在同一局域网。
2. 路由器没有隔离设备。
3. 防火墙允许相关通信。
4. 安全软件没有拦截。
5. 多网卡环境下选择了正确网络。

### 发现不到设备

可能原因：

1. 设备不在同一网络。
2. 路由器开启 AP 隔离。
3. Windows 防火墙拦截。
4. 设备服务没启动。
5. 多网卡广播到了错误接口。

处理顺序：

1. 重启目标设备投放服务。
2. 确认网络。
3. 检查防火墙。
4. 刷新 ECHO NEXT。
5. 必要时重启应用。

## 在线搜索

`在线搜索` 用于在线搜索、试听和发现候选。

### 搜索类型

| 类型 | 用途 |
| --- | --- |
| 单曲 | 找具体歌曲 |
| 专辑 | 找整张发行 |
| 歌手 | 找艺术家详情 |
| 歌单 | 找平台歌单 |

### 质量偏好

| 偏好 | 含义 |
| --- | --- |
| 最高可用 | 尽量选择平台返回的最高质量 |
| 高音质 | 通常偏 320kbps |
| 标准 | 兼容优先 |
| 无损 | 优先 FLAC 等无损 |
| Hi-Res | 平台可用时尝试高解析 |

质量偏好不是保证。平台没有对应资源、账号权限不足、网络失败时，都可能回退或失败。

### 为什么流媒体只能播 30 秒

如果某个平台的歌曲只能播放 30 秒，通常不是 ECHO 把声音截断了，而是平台只返回了试听片段、账号权限不足、地区版权不可用，或当前接入方式只能拿到 preview stream。

先检查这些地方：

1. 当前平台账号是否已经登录。
2. 账号是否有播放完整歌曲所需的会员、Premium、订阅或地区权限。
3. 当前歌曲在你的账号地区是否可播放。
4. 平台官方客户端或网页是否能播放完整版本。
5. ECHO 里使用的插件、账号、API 配置或外部来源是否只提供试听链接。

ECHO 只能按合法账号状态、平台返回结果和插件提供的公开 URL 播放。ECHO 不会帮你绕过会员、付费、地区、版权、DRM、访问控制或平台规则，也不会提供“把 30 秒试听变成完整歌曲”的 bypass。

如果你要的是绕过平台限制、破解会员试听、伪造账号状态或规避版权控制，请卸载 ECHO，另寻合法合规的播放方式。这类需求不属于 ECHO 的功能范围，也不会进入官方维护。

### 平台边界

1. NetEase、QQ Music 等更偏音乐来源。
2. Spotify 更偏账号、链接或外部生态能力。
3. SoundCloud 依赖平台公开资源。
4. Bilibili 更偏视频来源。
5. 任何平台都不承诺绕过会员或版权限制。

## 下载器

下载器用于 URL 下载、搜索下载和导入曲库。

### 页面能力

1. 粘贴 URL 下载。
2. 搜索 YouTube / Bilibili。
3. 查看任务状态。
4. 查看下载进度。
5. 查看速度和 ETA。
6. 取消任务。
7. 设置输出目录。
8. 检查 FFmpeg、yt-dlp 等工具状态。

### 任务状态

| 状态 | 含义 |
| --- | --- |
| 排队 | 等待下载任务开始 |
| 解析链接 | 正在识别 URL 和可下载流 |
| 下载中 | 正在下载文件 |
| 提取音频 | 正在从视频或容器里提取音频 |
| 导入曲库 | 正在把下载结果加入本地曲库 |
| 绑定 MV | 正在把视频来源绑定到当前歌曲 |
| 完成 | 任务已经完成 |
| 失败 | 任务出错，需要看错误详情 |
| 已取消 | 任务已经取消 |

### 下载设置

| 设置 | 建议 |
| --- | --- |
| 音频策略 | 默认最佳可用 |
| 下载目录 | 选择空间充足、路径稳定的位置 |
| 导入曲库 | 想长期管理就开启 |
| 绑定 MV | 想保留视频来源就开启 |

### 下载失败排查

| 问题 | 检查 |
| --- | --- |
| 搜不到 | 平台搜索、网络、代理、关键词 |
| 解析失败 | URL 是否有效、平台是否限制 |
| 下载慢 | 网络、平台限速、代理 |
| 提取音频失败 | FFmpeg 是否可用 |
| 导入失败 | 输出文件是否存在、曲库路径权限 |

请确认内容来源合法。

## 插件

插件是受控扩展能力，不是随便执行任意脚本的后门。

### 插件目录

插件通常放在用户数据目录下的 `plugins/`。每个插件是独立文件夹，包含插件清单、脚本和可选面板。

典型结构：

```text
plugins/
  echo.example/
    echo.plugin.json
    plugin.js
    panel.html
    plugin-storage.json
```

### 启用流程

1. 打开 `插件`。
2. 创建示例插件或导入插件包。
3. 刷新插件列表。
4. 查看插件权限。
5. 确认可信后启用。
6. 出错时看插件日志。
7. 修改插件文件后重载。

### 示例插件类型

| 类型 | 说明 |
| --- | --- |
| 播放状态面板 | 监听播放状态，显示小面板 |
| 命令工具 | 注册手动执行命令 |
| 曲库脚本 | 读取曲库摘要，做轻量整理 |
| 自定义音源 | 返回搜索候选，并在播放时解析显式音频 URL |

### 权限说明

| 权限 | 能力 | 风险 |
| --- | --- | --- |
| `playback:read` | 读取播放状态 | 低 |
| `playback:control` | 播放、暂停、跳转 | 中 |
| `library:read` | 分页读取曲库公开字段 | 中 |
| `library:write` | 预留曲库写入能力 | 高 |
| `sources:provide` | 提供自定义音源候选和播放 URL | 中 |
| `settings:read` | 读取设置快照 | 中 |
| `settings:write` | 写入设置 | 高 |
| `network` | 访问外部网络 | 高 |
| `fs:plugin` | 读写插件目录数据 | 中 |

### 插件安全建议

1. 不要启用来源不明的高权限插件。
2. 不要让插件做大量同步计算。
3. 不要让插件扫描完整曲库。
4. 插件报错先禁用，再看日志。
5. 设置写入和曲库写入属于高风险权限。
6. 自定义音源只应返回合法 `http` / `https` 音频 URL，不应绕过平台授权或触碰本地文件系统。

启用自定义音源插件后，可以在 `在线搜索` 页面选择“插件音源”进行搜索。ECHO 只在搜索和播放解析时调用插件，播放仍由宿主拿到显式音频 URL 后进入原有播放链路。

插件 v2 额外支持受控网络 API、歌词提供器、封面提供器和插件自有设置。网络访问必须有 `network` 权限，并且只能通过宿主包装的 `echo.net.fetchJson/fetchText`；歌词、封面和音源都只返回候选，是否应用或播放由 ECHO 决定。插件包导入会记录校验信息，覆盖已有插件时会保留旧目录备份。

## 设置

设置页内容很多，可以按模块理解。

### 通用

常见内容：

1. 语言。
2. 窗口行为。
3. 托盘行为。
4. 设置备份。
5. 自动备份。

建议开启自动备份，尤其是你经常调整设置、插件、远程来源或音频输出。

### 播放

管理播放相关内容：

1. 输出设备。
2. 输出模式。
3. 音频状态。
4. HQPlayer 相关设置。
5. 播放速度。
6. ReplayGain。
7. 当前播放诊断。

### 快捷键

快捷键分两类：

| 类型 | 说明 |
| --- | --- |
| 应用内快捷键 | ECHO NEXT 聚焦时生效 |
| 全局快捷键 | ECHO NEXT 不聚焦时也可能生效 |

常见动作：

1. 播放 / 暂停。
2. 上一首。
3. 下一首。
4. 停止。
5. 音量加减。
6. 快退快进。
7. 显示主窗口。
8. 老板键。
9. 速度调整。
10. 打开音频设置、MV 设置、歌词设置。

全局快捷键可能与系统或其它应用冲突。录制失败时换一个组合。

### 歌词

歌词设置集中管理：

1. 歌词来源。
2. 时间偏移。
3. 字体。
4. 辅助文本。
5. 假名增强。
6. 可读性。

### MV

MV 设置管理：

1. 来源。
2. 质量。
3. 同步模式。
4. 外部播放。
5. 自定义视频。
6. 可读性增强。

### 集成

集成能力可能包括：

1. Last.fm。
2. Discord Presence。
3. 账号。
4. YouTube 浏览器登录信息来源。
5. 网络代理。
6. 自动更新。

代理模式通常有：

| 模式 | 说明 |
| --- | --- |
| 关闭 | 不使用代理 |
| 系统代理 | 跟随系统设置 |
| 手动代理 | 手动填写代理地址 |
| PAC | 使用 PAC 配置 |

代理会影响网络歌词、MV、流媒体、下载、元数据等功能。播放本地文件通常不需要代理。

### EQ / DSP

EQ 设置集中管理：

1. 开关。
2. 10 段均衡调节。
3. 前级增益。
4. 内置预设。
5. 用户预设。
6. 保存、导入或恢复。

### 外观

外观设置管理：

1. 主题。
2. 自定义颜色。
3. 字体。
4. 壁纸。
5. 视频背景。
6. 动效。
7. 圆角、透明度、模糊等视觉参数。

建议：

1. 先保证文字可读。
2. 再调整装饰效果。
3. 视频背景不应该影响播放稳定。
4. UI 字体和歌词字体分开处理。

### 曲库

曲库设置管理：

1. 本地文件夹。
2. 网络元数据。
3. 曲库质量。
4. 重复歌曲。
5. ReplayGain 分析。
6. BPM 分析。
7. 艺术家图片缓存。
8. 数据库保护。

数据库、缓存、扫描相关操作都要谨慎。

### 关于

通常包含：

1. 应用版本。
2. 项目链接。
3. 日志。
4. 诊断。
5. 崩溃信息。

反馈问题前建议先看这里是否有可导出的诊断信息。

### 危险操作

危险区可能包含：

1. 重建数据库。
2. 修复数据库。
3. 删除数据库。
4. 清理缓存。
5. 恢复默认设置。
6. 数据库快照或恢复。

原则：

1. 能备份先备份。
2. 能小范围修复就不要全量重建。
3. 播放问题不要第一时间动数据库。
4. 不确定影响范围时先停手。

## 外观和桌面体验

### 字体

字体分两类：

| 类型 | 重点 |
| --- | --- |
| 应用 UI 字体 | 可读性、布局稳定 |
| 歌词字体 | 观感、沉浸、舞台感 |

不要为了歌词效果把整个应用 UI 字体改得难读。

### 壁纸和视频背景

壁纸和视频背景适合增强氛围，但要注意：

1. 视频背景会消耗渲染资源。
2. 最小化或隐藏时应该减少开销。
3. 播放卡顿时先关闭视频背景排查。
4. 低性能设备不要使用太重的视频背景。

## 网络元数据

网络元数据是补全，不是真相。

优先级建议：

1. 手动整理。
2. 嵌入式标签。
3. sidecar 或文件夹信息。
4. 网络候选。
5. 文件名兜底匹配。

网络元数据适合：

1. 缺标题。
2. 缺艺术家。
3. 缺专辑。
4. 缺年份。
5. 缺封面。

不适合：

1. 覆盖你手动整理过的字段。
2. 覆盖嵌入式高可信标签。
3. 盲目批量套用低分候选。

## 备份和安全

建议备份：

1. 设置。
2. 曲库数据库。
3. 插件目录。
4. 重要播放列表。
5. 长期整理过的音乐文件标签。

高风险操作前，至少确认：

1. 影响范围是什么。
2. 是否会删除文件。
3. 是否只影响缓存。
4. 是否能恢复。
5. 是否有备份。

## 常见排查路线

### 播放没有声音

1. 检查系统音量。
2. 检查 ECHO NEXT 音量。
3. 检查输出设备。
4. 切回“系统输出”。
5. 换一首确定正常的 MP3 或 FLAC。
6. 关闭 EQ、ReplayGain、变速。
7. 查看音频状态和日志。

### 某首歌播放失败

1. 用其它播放器播放同一文件。
2. 检查文件是否损坏。
3. 检查格式是否特殊。
4. 看是否只有这首失败。
5. 看日志是否有解码错误。
6. 必要时重新导入或重新读取标签。

### 曲库显示不对

1. 检查源文件标签。
2. 检查是否扫描完成。
3. 检查是否添加了重复目录。
4. 检查网络元数据是否覆盖了预期字段。
5. 重新读取嵌入式标签。
6. 不要一上来清空数据库。

### 封面不对

1. 检查文件嵌入封面。
2. 检查文件夹封面。
3. 检查同一专辑每首歌封面是否一致。
4. 清理或刷新封面缓存前先确认影响范围。

### 歌词不准

1. 看是否匹配到错误版本。
2. 手动选择候选。
3. 调整时间偏移。
4. 修正歌曲标题和艺术家。
5. 检查是否现场版、翻唱、剪辑版。

### MV 不准

1. 手动选择候选。
2. 自定义 URL。
3. 修正元数据。
4. 检查平台搜索结果。
5. 接受部分歌曲需要手动绑定。

### 远程来源连接失败

1. 检查地址。
2. 检查账号和密码。
3. 检查证书。
4. 检查代理。
5. 检查服务端日志。
6. 检查防火墙。

### 下载失败

1. 检查 URL。
2. 检查平台是否限制。
3. 检查 FFmpeg 和 yt-dlp。
4. 检查代理。
5. 检查输出目录权限。
6. 检查磁盘空间。

## 反馈问题时请带什么

有效反馈最好包含：

1. ECHO NEXT 版本。
2. 操作系统版本。
3. 安装版、便携版还是开发模式。
4. 问题发生页面。
5. 复现步骤。
6. 预期行为。
7. 实际行为。
8. 截图。
9. 日志或诊断报告。
10. 如果是播放问题，附输出模式、设备、音频格式和是否只影响某些文件。
11. 如果是扫描问题，附文件夹类型、本地盘还是远程盘、失败路径。
12. 如果是网络问题，附代理模式、来源类型和服务端返回信息。

只说“不能用”“不好用”“卡了”通常很难修。越接近真实操作链路，越容易定位。

---

# 零基础安装启动教程

Source: src/content/docs/zh/docs/zero-basics.md
Kind: starlight-doc
Locale: zh-CN
URL: /zh/docs/zero-basics/
Description: 从买电脑、接电源、连显示器和音频设备，到下载安装 ECHO Next、导入小曲库并播放第一首歌的保姆级流程。

这页写给真的从零开始的用户。你不需要懂 GitHub，不需要懂播放器术语，也不需要先研究音频驱动。按顺序做：先有一台能正常开机的 Windows 电脑，再把电源、显示器、耳机或音箱接好，然后下载、安装、导入几首歌、播放第一首歌。

有些步骤看起来基础到离谱，但它们就是最容易被跳过的地方。别一边跳步骤一边问为什么不行，电脑不会读心，软件也不会猜你到底把线插进了哪里。

本文不是电脑购买导购，不推荐具体店铺、型号、价格和链接。硬件行情每天都能变，跟着短视频买“神机”之前，先确认它至少是一台正常的 Windows 电脑。

## 0. 先确认你到底有没有一台合适的电脑

ECHO Next 当前主要面向 Windows 桌面使用。最稳的起点是一台能正常运行 Windows 10 或 Windows 11 的笔记本或台式机。

| 项目 | 建议 |
| --- | --- |
| 系统 | Windows 10 或 Windows 11，64 位 |
| 处理器 | 近几年常见的 Intel Core、AMD Ryzen 或同级 x64 处理器 |
| 内存 | 8 GB 起步更舒服；4 GB 只是 Windows 11 官方最低门槛，不是愉快使用门槛 |
| 硬盘 | SSD 优先，至少留出数 GB 空间给系统更新、安装包、缓存和曲库索引 |
| 屏幕 | 笔记本自带屏幕即可；台式机需要显示器 |
| 网络 | 能打开网页，能进入 ECHO 下载页 |
| 音频 | 笔记本扬声器、耳机、音箱、USB DAC、声卡任选其一，先保证能出声 |

Windows 11 的官方最低要求可以看 [Microsoft 的系统要求](https://support.microsoft.com/zh-cn/windows/windows-11-%E7%B3%BB%E7%BB%9F%E8%A6%81%E6%B1%82-86c11283-ea52-4782-9efd-7674389a7ba3)。注意，“最低要求”只表示系统能装，不表示你开十个软件还能优雅地听歌。踩着最低线买电脑，然后抱怨卡，这个锅不应该甩给播放器。

如果你已经有电脑，先跳到 [2. 把电脑接上电](#2-把电脑接上电)。如果你连电脑都还没买，继续往下看。

## 1. 如果还没买电脑，先按这个思路买

购买渠道可以是品牌官网、京东自营、天猫品牌旗舰店、淘宝上信誉明确的品牌店或本地电脑店。不要从陌生群文件、私聊甩链接、二手倒卖话术里买所谓“全新顶配办公神机”。卖家嘴里的“高配”经常只是形容词，不是硬件规格。

普通用户按这个优先级看：

| 你要看的信息 | 应该怎么判断 |
| --- | --- |
| 是否预装 Windows | 最省事。没有系统也能用，但你得会自己装系统，本文不陪你在 BIOS 里迷路 |
| CPU | 不要只看“i7”“锐龙”，要看完整型号；只写“高端处理器”基本等于没写 |
| 内存 | 8 GB 起步，16 GB 更稳；2 GB、4 GB 老机器不要拿来折腾现代桌面软件 |
| 硬盘 | 选 SSD，不要只写“500G 大硬盘”却不给硬盘类型 |
| 屏幕和接口 | 台式机要确认有显示器接口；要接 DAC 就确认有 USB 接口 |
| 售后 | 有清楚退换、保修、发票或订单记录 |

购买前问卖家这几句话：

1. 这台电脑能否正常运行 Windows 10 或 Windows 11？
2. CPU 完整型号是什么？
3. 内存是多少 GB？能不能升级？
4. 硬盘是 SSD 还是机械硬盘？
5. 是否预装正版 Windows？
6. 有没有电源适配器、电源线、显示器线？
7. 如果到手无法开机或系统异常，怎么退换？

卖家如果只会回“能用”“放心”“办公游戏都行”，却不给具体配置，就别把钱急着打出去。购物不是许愿池，付款按钮也不是智力豁免键。

## 2. 准备插座、电源线和桌面位置

电脑先要能稳定供电。软件再先进，也不能让没插电的主机凭空发光。

你需要这些东西：

| 场景 | 需要什么 |
| --- | --- |
| 笔记本 | 笔记本、电源适配器、电源线、墙插或合格插线板 |
| 台式机 | 主机、电源线、显示器、显示器电源线、HDMI / DP / VGA 等显示器线 |
| 外接耳机 | 3.5mm 耳机、USB 耳机或蓝牙耳机 |
| 外接音箱 | 音箱电源线、音频线或 USB 线 |
| USB DAC / 声卡 | USB 数据线、DAC 电源或供电线、耳机或音箱连接线 |

插座和插线板建议：

| 项目 | 建议 |
| --- | --- |
| 插线板 | 用正规品牌、带安全认证、外壳没有破损的产品 |
| 接地 | 台式机和音频设备优先使用带接地的三孔插座 |
| 功率 | 不要把电脑、显示器、电暖器、电吹风全塞进同一个小插排 |
| 摆放 | 不要压在椅子脚下，不要放在潮湿地面，不要让线缆绷得像琴弦 |
| 扩展 | 不要插线板接插线板再接插线板，套娃到最后只会把排障变成猜谜 |

如果插头插不进去，先确认方向和孔位，不要硬怼。两脚插头进两孔，三脚插头进三孔，USB-C 进 USB-C，USB-A 进 USB-A。接口长得不一样不是为了考验你的蛮力。

## 3. 把电脑、显示器和音频设备接好

### 笔记本

1. 把电源适配器接到笔记本。
2. 把适配器另一头插进墙插或插线板。
3. 如果插线板有开关，打开开关。
4. 如果用有线耳机，把耳机插进 3.5mm 耳机口或 USB 口。
5. 如果用蓝牙耳机，先不用急着连；第一次排障建议先用有线设备或笔记本扬声器。

### 台式机

1. 把主机电源线插进主机背面的电源接口。
2. 把主机电源线另一头插进墙插或插线板。
3. 把显示器电源线接好。
4. 用 HDMI、DisplayPort 或其它显示器线连接主机和显示器。
5. 打开显示器电源。
6. 如果主机电源背后有 `I / O` 开关，拨到 `I`。
7. 接好耳机、音箱或 DAC。

如果开机后显示器没画面，先看显示器是不是开了、输入源是不是选对、线是不是插紧。不要第一反应就重装系统。屏幕都没亮，ECHO Next 还没资格背锅。

### USB DAC 或声卡

第一次使用 ECHO Next 时，建议先走系统默认输出，确认基础播放成功后再研究独占、ASIO、DSD、HQPlayer 这些高级路径。

如果你已经接 USB DAC：

1. 用 USB 数据线连接电脑和 DAC。
2. 如果 DAC 需要独立电源，先接电源再开机。
3. 把耳机或音箱接到 DAC 的输出口。
4. 等 Windows 识别设备。
5. 在 Windows 音量面板里确认输出设备能选到它。

不要把 DAC、耳放、音箱、电源、USB 线、平衡线一起乱插，然后只发一句“没声音”。线越多，越要按顺序确认。

## 4. 打开电脑并登录 Windows

1. 确认电脑已经接电。
2. 按电脑主机、笔记本或键盘上的电源键。
3. 等 Windows 进入登录界面。
4. 输入你的 Windows 密码、PIN 或用指纹登录。
5. 等桌面完全出现，不要刚看到壁纸就疯狂点软件。

桌面出现后，先等 10 到 30 秒。很多电脑开机后还在加载输入法、网络、杀毒软件和托盘程序。你越急着乱点，越容易把自己点进一堆弹窗。

如果你不知道自己的系统版本，按 `Win + I` 打开 Windows 设置，进入 `系统`，再看 `关于`。如果连这里都找不到，先把 Windows 基础操作学一下，再继续折腾播放器。

## 5. 确认网络能用

下载软件之前先确认网络正常。

1. 看右下角任务栏有没有网络图标。
2. 如果是 Wi-Fi，确认已经连上你的无线网络。
3. 如果是网线，确认网线插好。
4. 打开浏览器，随便访问一个正常网站。
5. 如果网页都打不开，不要先怪 ECHO Next。软件还没下载，锅还没到它手里。

如果你在学校、公司、网吧或受管网络里，GitHub 访问可能不稳定。优先用 ECHO 官网下载页，不要先去各种第三方网盘找来路不明的安装包。

## 6. 打开浏览器

Windows 上常见浏览器有 Edge、Chrome、Firefox。

1. 在任务栏或开始菜单里找到浏览器图标。
2. 双击打开浏览器。
3. 点击顶部地址栏。
4. 输入 ECHO Next 官网地址，或从你拿到的官方链接进入。
5. 按回车。

注意，地址栏不是搜索框弹出来的广告结果。不要看到第一个花里胡哨的下载按钮就点。软件下载只认官网和 GitHub Releases。

## 7. 进入下载页面

在官网里打开 [下载页面](/zh/download/)。

你应该看到当前版本和 Windows 下载入口。下载时优先选安装包，也就是适合普通用户日常使用的版本。

| 你看到的东西 | 该怎么选 |
| --- | --- |
| Windows 安装包 | 普通用户优先选这个 |
| Portable / 便携包 | 临时测试或隔离使用才选 |
| GitHub Releases | 用来核对发布源，国内网络可能慢 |
| 奇怪网盘、群文件、别人转发 | 不建议使用 |

如果你不知道该选哪个，就选 Windows 安装包。别在第一个页面就开始研究便携版、自动更新、发布源、校验值。先把软件装上。

## 8. 下载安装包

1. 点击 Windows 安装包下载链接。
2. 浏览器可能会询问保存位置，默认保存到 `下载` 文件夹即可。
3. 等下载完成。
4. 不要在下载进度还没结束时双击文件。
5. 下载完成后，在浏览器下载列表里点击 `在文件夹中显示`。

安装包文件名通常会包含版本号，例如：

```text
ECHO-NEXT-Setup-26.6.4.exe
```

版本号不一定和上面示例完全一样。真正要看的是下载页显示的最新版本。示例只是示例，不要对着示例文件名找半天。

## 9. Windows 提示风险怎么办

Windows 有时会提示“未知发布者”“Windows 已保护你的电脑”之类的信息。先别慌，也别无脑乱点。

你要先确认来源：

| 情况 | 该怎么做 |
| --- | --- |
| 从 ECHO 官网下载 | 可以继续安装 |
| 从 GitHub Releases 下载 | 可以继续安装 |
| 从陌生网盘、群文件、短链接下载 | 不建议安装 |
| 文件名很怪，版本号对不上 | 删除后重新从官网下载 |

如果确认来源是官网或 GitHub Releases，SmartScreen 页面通常可以点 `更多信息`，再点 `仍要运行`。如果你不确定来源，别装。先删掉，重新从官网下载。

## 10. 安装 ECHO Next

1. 双击下载好的 `.exe` 安装包。
2. 如果 Windows 弹出权限确认，确认程序来源后点击允许。
3. 安装位置保持默认即可。
4. 等安装完成。
5. 如果安装器提供启动选项，可以直接启动 ECHO Next。
6. 如果没有自动启动，就从开始菜单打开。

普通用户不要一上来改安装路径。你如果连安装在哪都说不清，默认路径就是最稳的选择。

## 11. 第一次打开软件

打开 ECHO Next 后，先观察界面，不要立刻连点十个按钮。

你应该能看到大致这些区域：

| 区域 | 用来做什么 |
| --- | --- |
| 左侧导航 | 进入歌曲、专辑、文件夹、设置等页面 |
| 中间内容区 | 显示当前页面内容 |
| 底部播放器 | 播放、暂停、进度、音量 |
| 设置入口 | 调整输出、主题、曲库、插件等 |

第一次打开时，曲库为空是正常的。软件不是算命的，你还没导入音乐，它不会凭空知道你的歌在哪里。

## 12. 先准备一个小测试音乐文件夹

不要第一次就把 `C:\`、`D:\`、整个移动硬盘或 NAS 全扫进去。先准备一个小文件夹。

推荐这样建：

```text
D:\Music\Test
```

里面放 5 到 20 首确定能播放的歌。最好有：

| 格式 | 作用 |
| --- | --- |
| MP3 | 验证最基础播放 |
| FLAC | 验证无损文件、标签和封面 |
| M4A 或 WAV | 可选，用来测试更多格式 |

先用小文件夹跑通流程。流程通了，再导入完整曲库。别一开始就扔几十万文件进去，然后盯着扫描进度怀疑人生。

## 13. 导入音乐文件夹

1. 在 ECHO Next 左侧找到导入文件夹、曲库或类似入口。
2. 点击导入。
3. 在 Windows 文件选择窗口里找到刚才准备的小文件夹。
4. 选中文件夹。
5. 点击确认。
6. 等 ECHO Next 开始扫描。
7. 扫描时不要拔硬盘，不要移动文件夹，不要同时开大规模下载。

导入后，打开 `歌曲` 页面。正常情况下，你应该能看到刚才放进去的音乐。

## 14. 检查歌曲有没有进来

看这几项：

| 检查项 | 正常表现 |
| --- | --- |
| 歌曲标题 | 能看到歌曲名 |
| 艺术家 | 大多数歌曲能显示艺术家 |
| 专辑 | 标签正常时能显示专辑 |
| 时长 | 能显示歌曲长度 |
| 封面 | 有封面的文件能显示封面或占位图 |

如果这些信息全乱，先检查你的源文件标签。ECHO Next 可以读取和整理曲库，但不能凭空修复所有烂标签。文件本身没写信息，播放器当然读不出来。

## 15. 播放第一首歌

1. 打开 `歌曲`。
2. 找一首确定没问题的 MP3。
3. 双击它。
4. 看底部播放器是否出现歌曲信息。
5. 看进度条是否向前走。
6. 听有没有声音。

判断方式很简单：

| 现象 | 说明 |
| --- | --- |
| 有声音，进度条在走 | 基础播放成功 |
| 没声音，进度条在走 | 多半是音量或输出设备问题 |
| 进度条不走 | 可能是文件、路径或播放链路问题 |
| 一播放就跳下一首 | 可能是文件损坏或解码失败 |

能播放第一首歌，就说明最基础流程已经通了。后面再研究 EQ、DSP、WASAPI、ASIO、远程曲库都来得及。

## 16. 没声音先查这些

不要一没声音就卸载重装、清数据库、删配置。播放没声音通常不是数据库的错。

按顺序检查：

1. Windows 右下角系统音量没有静音。
2. ECHO Next 底部音量不是 0。
3. 耳机、音箱或 DAC 已经插好。
4. Windows 当前默认输出设备选对了。
5. ECHO Next 输出模式先切回 `系统输出`。
6. 暂时关闭 EQ、ReplayGain、变速和其它 DSP。
7. 换一首确定正常的 MP3。
8. 退出 ECHO Next 后重新打开。

这些都做完还不行，再去看 [音频输出](./audio-output/) 和 [常见问题](./faq/)。不要跳过前面 8 步直接问“是不是软件坏了”。

## 17. 再导入完整曲库

小测试文件夹能导入、能显示、能播放之后，再导入完整曲库。

导入大曲库前确认：

| 项目 | 建议 |
| --- | --- |
| 本地硬盘 | 确认硬盘稳定，不要扫描中途拔掉 |
| 移动硬盘 | 扫描期间保持连接 |
| NAS / 远程盘 | 先确认网络稳定 |
| 曲库目录 | 选音乐根目录，不要选整个系统盘 |
| 扫描时间 | 大曲库慢是正常的 |

首次扫描会读取文件、标签、时长、封面和专辑信息。几万首歌不是几秒钟的事。只要状态还在推进，就让它跑完。

## 18. 更新软件

ECHO Next 后续可能会提示更新。正常情况下：

1. 优先使用软件内自动更新。
2. 自动更新失败时，去 [下载页面](/zh/download/) 手动下载最新版。
3. 安装新版本前关闭正在运行的 ECHO Next。
4. 安装完成后再打开。

不要同时打开旧版本安装器、新版本安装器和正在运行的软件。一个软件还没关，另一个安装器就往上盖，出问题很正常。

## 19. 反馈问题时别只发一句“不行”

如果你真的需要反馈问题，请至少带上这些信息：

| 信息 | 示例 |
| --- | --- |
| ECHO Next 版本 | `26.6.4` |
| Windows 版本 | Windows 11 23H2 |
| 电脑类型 | 笔记本、台式机、迷你主机、虚拟机 |
| 音频设备 | 笔记本扬声器、蓝牙耳机、USB DAC、声卡、HDMI 显示器 |
| 下载入口 | 官网下载页或 GitHub Releases |
| 问题步骤 | 下载、安装、启动、导入、播放里的哪一步 |
| 错误表现 | 无法启动、没声音、扫不进歌、播放跳过 |
| 截图 | 报错弹窗、设置页、输出设备、下载文件名 |

只发“打不开”“没声音”“你这软件有问题”没有排查价值。把信息说清楚，别让别人隔着屏幕猜你电脑里发生了什么。

## 最短路线

懒得看全文就按这条做：

1. 买或准备一台正常 Windows 电脑。
2. 把电脑、显示器、电源、耳机或音箱接好。
3. 开电脑，登录 Windows。
4. 确认网络能打开网页。
5. 打开浏览器。
6. 进入 [下载页面](/zh/download/)。
7. 下载 Windows 安装包。
8. 下载完成后双击安装。
9. 打开 ECHO Next。
10. 准备一个只有几首歌的小文件夹。
11. 导入这个小文件夹。
12. 打开 `歌曲`。
13. 播放一首 MP3。
14. 有声音后再导入完整曲库。

先跑通，再折腾。基础流程都没跑完就开始改高级设置，只会把简单问题变复杂。

---

# 1.1.6

Source: src/content/releases/en/1.1.6.md
Kind: release-note
Locale: en-US
URL: /en/changelog/1.1.6/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/1.1.6

Add Auto Update.
Fixed some bugs.

---

# 1.1.7

Source: src/content/releases/en/1.1.7.md
Kind: release-note
Locale: en-US
URL: /en/changelog/1.1.7/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/1.1.7

ECHO 1.1.7
这次更新主要集中在播放器稳定性、歌词体验和界面细节优化，修掉了一批影响日常使用的问题，也补全了一些之前缺失的功能。

本次更新

修复拖动进度条时可能误触发连续切歌的问题，拖动播放进度现在更稳定。
修复单曲循环无效的问题，播放结束后会正确留在当前歌曲循环。
优化搜索后关闭搜索栏时的播放列表定位，当前播放歌曲不再一下跳回列表开头难以找到。
修复多处中文、日文路径与设备名称显示乱码的问题，包括播放器日志、音频 Host 输出等。
优化歌词解析与展示逻辑，改善原文、翻译、罗马音的适配表现。
修复开启翻译后歌词仍不显示翻译的问题。
优化手动选词流程，选择歌词后不再强制关闭，方便连续调整。
新增桌面悬浮歌词锁定功能，减少误触，也改善了空白区域过大的体验问题。
新增桌面悬浮歌词“是否显示翻译”开关。
优化音频设置与音量记忆，重启软件后不再总是恢复默认。
新增更新日志入口，应用内可以更直观看到每次更新内容。
新增歌词来源状态显示，可区分当前歌词来自本地、网易云、手选或缓存。
新增播放历史功能，并调整到右上角入口，后续也会继续扩展这一栏的能力。
微调默认启动窗口宽度，初始界面更舒展一些。
体验优化

播放历史入口改为右上角功能按钮，整体风格更统一。
部分界面交互和按钮布局进一步对齐现有功能区样式。
持续优化桌面歌词、播放控制和日志输出的整体稳定性。

移除了him

---

# 1.1.8

Source: src/content/releases/en/1.1.8.md
Kind: release-note
Locale: en-US
URL: /en/changelog/1.1.8/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/1.1.8

本次更新

优化了资料库监听逻辑。新增、删除、重命名、移动歌曲文件后，列表、专辑、文件夹、歌词绑定等内容现在会更稳定地同步更新，并减少重复项出现的情况。
新增资料库清理能力。现在可以扫描并清除失效的本地引用，避免歌单、收藏、历史记录里残留已经不存在的文件。
加入“最近播放”和“最常播放”智能集合。播放器会基于播放历史自动整理高频内容，找歌更快。
补充播放统计基础能力。现在会记录 playCount 和 lastPlayedAt，为后续更多智能推荐和集合功能打下基础。
调整了主窗口默认尺寸。整体比例更均衡，默认打开时歌曲信息更容易看清，不会显得过于横向。
优化播放器主界面排版。标题、歌手和技术信息的显示更稳定，长一点的信息也更不容易被挤掉。
优化 Mini Waveform Bar 的渲染性能。减少了卡顿和掉帧，波形动画会比之前更顺滑。
修复部分网易云下载歌曲“已自动下载歌词，但首次播放显示无歌词”的问题。现在会更稳地等待本地歌词文件落盘，不必再手动去歌词页刷新。
保持可视化相关功能默认关闭，减少初始界面干扰，也避免不必要的性能占用。
体验改进

本地媒体库在长期使用下会更干净、更一致。
新下载歌曲的歌词命中率和首次显示成功率更高。
默认界面更克制，也更接近日常听歌时最舒服的状态。
兼容与说明

已有用户的个人设置会尽量保留，不会随更新强行覆盖。
新增的资料统计与智能集合会在后续版本继续扩展。

---

# 1.1.9

Source: src/content/releases/en/1.1.9.md
Kind: release-note
Locale: en-US
URL: /en/changelog/1.1.9/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/1.1.9

Fixed some bugs.

---

# 1.2.0

Source: src/content/releases/en/1.2.0.md
Kind: release-note
Locale: en-US
URL: /en/changelog/1.2.0/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/1.2.0

一些缝缝补补 修复了很多BUG

1.增加排序功能
2.现在音乐支持减速啦~
3.加了一些乱七八糟的东西
4.移除him

---

# 1.2.1

Source: src/content/releases/en/1.2.1.md
Kind: release-note
Locale: en-US
URL: /en/changelog/1.2.1/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/1.2.1

优化了一些内容!

---

# 1.2.2

Source: src/content/releases/en/1.2.2.md
Kind: release-note
Locale: en-US
URL: /en/changelog/1.2.2/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/1.2.2

更新日志：
超级大更新记得更新哦
新功能：
Windows 原生音频引擎现已新增 ASIO 支持
音频设置中新增 ASIO 设备列表与选择功能
新增专辑补全功能
当本地专辑只有部分歌曲时，现在可以使用补全功能将整张专辑补齐
按 F11 可以进入全屏模式
如果歌曲信息/封面匹配错误，按住 Ctrl 后点击歌曲信息/封面即可自己修改

优化：
优化了大量内容与整体性能表现
大型曲库场景下的流畅度显著提升
现在即使导入上万首歌曲，浏览、加载和播放也不会卡顿了

改进：
保留了原有 WASAPI 播放逻辑，避免影响现有用户的使用体验
改进了原生音频进程与设置界面的联动逻辑
提升了 ASIO 驱动初始化与缓冲区创建阶段的兼容性
优化了音频设备枚举与切换体验

修复：
修复了部分 ASIO 驱动初始化失败的问题
修复了部分设备在 ASIOCreateBuffers 阶段可能无法正常启动的问题
修复了多项原生音频链路中的兼容性与稳定性问题

---

# 1.2.3

Source: src/content/releases/en/1.2.3.md
Kind: release-note
Locale: en-US
URL: /en/changelog/1.2.3/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/1.2.3

本次更新主要围绕三件事展开：修复歌词误匹配、补强播放队列体验，以及处理启动与运行期的一些稳定性/资源占用问题。整体方向是让匹配更准、队列更顺手、播放器更稳。

Update Notes:
优化了设置界面 增加搜索功能
增加了很多小细节功能!
修复了歌词系统“完全匹配错歌”的问题。
提高了歌词候选的最低置信门槛。
强化了标题/艺术家匹配过弱时的拒绝逻辑。
网易云歌词结果现在也会带上置信度校验，避免“搜到了但其实搜错了”。
修复了手动搜索歌词点击后无反应的问题。
手动点选网易云歌词时，现在会正确应用结果，不再因为返回值异常导致失效。
新增“下一首队列”持久化。
重启应用后，下一首 队列会自动恢复，不需要重新添加。
新增“下一首队列”拖拽排序。
队列项支持拖拽重排，左侧加入拖拽手柄，操作更直观。
优化了歌曲列表滚动条样式。
滚动条视觉更统一，不再显得过于原生和突兀。
修复了专辑页每次重启都重新加载的问题。
专辑 metadata 缓存机制已补上，重启后不会再从空状态整页重扫。
修复了最近一次内存优化引发的专辑封面丢失问题。
专辑区封面恢复正常加载，同时保留部分运行时内存止血改动。
优化了运行期内存占用。
嵌入封面在进入前端前会先压缩。
MV / 歌词 / 运行时缓存增加了上限控制。
切歌时会主动释放一部分旧曲目相关的大对象。
BPM 检测使用的临时 AudioContext 现在会在用完后关闭，避免持续堆积。
新增 WASAPI 独占启动行为开关。
默认仍会在启动时关闭独占模式。
现在可以在 音频设置 -> WASAPI 独占 下方设置是否保留上次的独占状态。

大家可以注意的点:
歌词自动匹配是否明显减少错歌。
手动搜索歌词是否能稳定应用。
下一首队列是否能在重启后恢复、拖拽排序是否正常。
专辑页重启后是否不再整页重载，封面是否正常显示。
连续播放/切歌后内存是否比旧版本稳定。
WASAPI 独占在默认模式和“保留上次状态”模式下是否都符合预期。

如有任何问题请及时在issues里提交~谢谢喵!

---

# 1.3.0

Source: src/content/releases/en/1.3.0.md
Kind: release-note
Locale: en-US
URL: /en/changelog/1.3.0/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/1.3.0

ECHO讨论群:1053560752
作者很喜欢HiFi,很愿意去钻研hifi相关的任何事情
本次是有史以来最大的更新,代表着ECHO进入新篇章
增加了数不胜数的功能 如果你问性能是否会有影响?
答案是不会!而且优化了非常多! 占用由原来的3G到现在的700MB~


重构了UI,现在更方便管理
本来想把这个版本发到carnary区域的 但是我个人测试的结果是没什么大问题 就想着和大家一起找bug

其他修改也太多了....这次想偷懒一下!
总之,Enjoy it!

---

# 1.3.1

Source: src/content/releases/en/1.3.1.md
Kind: release-note
Locale: en-US
URL: /en/changelog/1.3.1/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/1.3.1

近期修复
修复大量BUG  但目前仍存在许多bug 本次修复为紧急修复
移除了设置里的「实时频谱可视化」和「迷你波形条」两个功能，并清理相关配置、组件、样式和多语言文案。
清理了 App.jsx 中大量乱码注释，编码检查现在通过。
修复 Discord RPC 在连接关闭时触发 UnhandledRejection: connection closed 的崩溃日志问题。
修复 npm run dev 时反复输出 segfault-handler / WTSAPI32 / WINSTA 原生堆栈的问题，避免 naudiodon 启动时注册 crash.log 处理器。
修复 dev 环境缺少 app:setAutoUpdateEnabled IPC handler 的报错。
修复窗口销毁时仍发送音频状态导致的主进程报错。
修复 YouTube 下载的 .opus/.ogg 音频封面只显示顶部一小条的问题；旧缓存会自动刷新，新下载会优先嵌入 JPEG 封面。
下载与在线音乐
优化 YouTube 登录流程，改为系统浏览器登录并由应用自动保存 cookies，减少手动导出 cookies.txt 的麻烦。
集中处理 YouTube cookie 参数，确保元数据读取、单曲下载、歌单导入下载走同一套认证逻辑。
优化 yt-dlp 元数据缓存和下载进度处理。
增加快速下载模式，减少部分下载后的后处理耗时。
改进 SoundCloud 下载错误提示和文件命名。
增加 QQ 音乐下载相关路径，包括搜索、专辑曲目、直链获取、Cookie 状态和下载后元数据写入。
下载后的音频会更稳定地写入标题、艺人、专辑、封面等元数据。
移除Herobrine

---

# 1.3.2

Source: src/content/releases/en/1.3.2.md
Kind: release-note
Locale: en-US
URL: /en/changelog/1.3.2/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/1.3.2

BUG FIX :)
这次完美解决了独占模式下重采样的问题
(最头大的问题终于解决了...)
如果您觉得下载速度慢的话,请加群1053560752
目前暂未手搓国内更新源(懒)不过也马上了ovo

---

# 1.3.3

Source: src/content/releases/en/1.3.3.md
Kind: release-note
Locale: en-US
URL: /en/changelog/1.3.3/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/1.3.3

更新日志:
## 中文

### 音频引擎
- 重构 Windows WASAPI 独占输出路径，新增原生 WASAPI Exclusive 后端。
- 独占模式下可按音源采样率动态请求设备输出，减少被系统默认格式锁到 48kHz 的情况。
- 设备列表现在会显示 WASAPI 独占模式下可用的更高采样率能力。
- 改进 native audio bridge 与 FFmpeg 解码链路，192k 等高采样率播放路径更明确。
- BPM 分析切换到更成熟的异步分析路径，避免点击歌曲后先等待 BPM 检测再播放。

### AirPlay / DLNA 投放接收
- 新增 AirPlay 1 / RAOP 音频接收端，手机、平板和 Mac 可将音频投送到 ECHO。
- AirPlay 音频接入 ECHO 当前音频输出链路，可继续使用当前输出设备、音量和 EQ。
- 投放状态面板升级为“投放接收”，同时管理 DLNA 与 AirPlay。
- 改进 AirPlay 元数据处理，减少歌词行、上一首残留信息被误当作歌名的情况。
- 投放播放时会构造虚拟曲目信息，避免继续显示本地歌曲的 MV 或错误元数据。

### 远程音乐库
- 新增 Navidrome / Subsonic 远程音乐库支持。
- 支持连接测试、远程歌手/专辑/歌曲浏览、搜索、封面与播放流解析。
- 远程曲目可加入队列、喜欢和歌单，并使用 `subsonic://` 等内部引用保存。
- 新增 NAS / 本地网络文件夹 / WebDAV / SSHFS 方向的远程库适配基础。
- WebDAV 播放走本地代理，避免把带鉴权参数的真实 URL 长期暴露或写入播放列表。

### 媒体库与缓存
- 新增专辑封面持久缓存，重开软件后专辑墙不再每次重新慢慢加载封面。
- 新增艺人头像缓存，头像加载成功后会压缩并保存为本地 IndexedDB data URL。
- 艺人头像会优先使用本地可信图；没有头像时会尝试从网易云、QQ 音乐等大陆更友好的来源补全。
- 改进艺人名搜索清洗逻辑，支持去除 `CV(...)`、feat 信息，并拆分组合艺人名进行多轮搜索。
- 失败的头像搜索会短期缓存，避免反复请求；新版搜索策略会自动绕过旧 miss 记录重新尝试。

### 艺人页体验
- 艺人页从列表升级为艺人墙布局，显示更接近专辑墙。
- 修复多个艺人共用同一张合辑封面导致“头像撞脸”的问题。
- 没有可信头像时，改为统一浅色圆形文字头像，视觉更干净。
- 改进艺人头像选择策略，避免随便拿专辑封面冒充艺人头像。

### UI 与交互
- 优化歌曲列表滚动和部分布局表现。
- AirPlay 播放期间点击本地歌曲时，会先处理投放状态，避免本地歌曲被错误替换成 AirPlay 信息。
- 改进 cast / 本地播放之间的状态切换，减少歌词、封面、MV 残留。
- 更新投放接收抽屉说明文案和状态显示。

### 构建与维护
- 新增 AirPlay RAOP 构建脚本。
- 更新 native audio host 构建配置，补充 WASAPI exclusive 源文件与 Windows 链接依赖。
- 新增 `_HOTFIX_192K` 调试与重建文档。
- 保持编码守卫、App.jsx 守卫和生产构建通过。

---

## English

### Audio Engine
- Reworked the Windows WASAPI exclusive output path with a native WASAPI Exclusive backend.
- Exclusive mode can now request the device output rate dynamically based on the source sample rate, reducing cases where playback is locked to the Windows default 48kHz format.
- Device listing now reports higher WASAPI-exclusive capabilities where available.
- Improved the native audio bridge and FFmpeg decode path for clearer high-sample-rate playback, including 192kHz sources.
- BPM analysis now runs through a more mature asynchronous path so playback does not wait for BPM detection before starting.

### AirPlay / DLNA Cast Receiver
- Added an AirPlay 1 / RAOP audio receiver so iPhone, iPad, and Mac can stream audio to ECHO.
- AirPlay audio is routed through ECHO’s current audio output path, including the selected device, volume, and EQ.
- The cast drawer has been upgraded into a unified receiver panel for both DLNA and AirPlay.
- Improved AirPlay metadata handling to reduce cases where lyrics lines or stale metadata are shown as the song title.
- Cast playback now uses virtual track metadata to avoid showing local-track MV or stale local metadata during casting.

### Remote Music Libraries
- Added Navidrome / Subsonic remote music library support.
- Supports connection testing, remote artist/album/song browsing, search, cover art, and stream URL resolution.
- Remote tracks can be added to the queue, liked songs, and playlists using internal references such as `subsonic://`.
- Added foundational support for NAS / local network folders / WebDAV / SSHFS-style remote library workflows.
- WebDAV playback now uses a local proxy, avoiding long-lived authenticated URLs in playlists or UI state.

### Library And Cache
- Added persistent album cover caching so album walls no longer reload covers from scratch after every restart.
- Added artist avatar caching; successfully loaded avatars are compressed and stored locally as IndexedDB data URLs.
- Artist avatars prefer trusted local images first, then try mainland-friendly sources such as NetEase Cloud Music and QQ Music.
- Improved artist search cleanup by stripping `CV(...)`, feat text, and splitting combined artist names for multi-pass lookup.
- Failed avatar lookups are cached briefly to avoid repeated requests, while newer lookup strategies can bypass old miss records.

### Artist Page
- Replaced the artist list with an artist-wall layout similar to the album wall.
- Fixed repeated “same avatar” cases caused by shared compilation album covers.
- Artists without trusted images now use a clean light circular text avatar.
- Improved avatar selection so album covers are not blindly reused as artist portraits.

### UI And Interaction
- Improved song-list scrolling and related layout behavior.
- Clicking a local song during AirPlay playback now handles the cast state first, avoiding local tracks being overwritten by AirPlay metadata.
- Improved state cleanup between cast playback and local playback, reducing stale lyrics, covers, and MV display.
- Updated cast receiver drawer copy and status display.

### Build And Maintenance
- Added an AirPlay RAOP build script.
- Updated native audio host build configuration with WASAPI exclusive sources and Windows link dependencies.
- Added `_HOTFIX_192K` rebuild and troubleshooting documentation.
- Encoding guard, App.jsx guard, and production build checks are passing.

---

# 1.3.4

Source: src/content/releases/en/1.3.4.md
Kind: release-note
Locale: en-US
URL: /en/changelog/1.3.4/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/1.3.4

This release has no GitHub Release body.

---

# 1.3.5

Source: src/content/releases/en/1.3.5.md
Kind: release-note
Locale: en-US
URL: /en/changelog/1.3.5/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/1.3.5

修复了一些BUG.
加了一些大家想要的功能~

---

# 1.3.6

Source: src/content/releases/en/1.3.6.md
Kind: release-note
Locale: en-US
URL: /en/changelog/1.3.6/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/1.3.6

修复BUG,优化性能.
优化了资源库
尽力优化了歌词/MV匹配 但如果实在找不到请手选(手选是有记忆的所以只用选一次就好了)

---

# 1.3.7

Source: src/content/releases/en/1.3.7.md
Kind: release-note
Locale: en-US
URL: /en/changelog/1.3.7/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/1.3.7

<img width="1717" height="916" alt="bf17c2a4-2a6a-4d49-9884-013e7cd216eb" src="https://github.com/user-attachments/assets/7da10084-375a-4711-a603-c1bc602aab5a" />

2026:5.6 中午12点热更新 不更新版本号
**ECHO 更新日志:**
**本次更新较大,可能会造成一些奇怪的BUG 您可以在issues里面提出或加入ECHO QQ讨论群:1053560752**
**新增**
- 新增迷你播放器：可独立浮窗显示当前歌曲、封面、播放进度和基础控制，并支持置顶、记住窗口位置，以及打开后自动隐藏主窗口。
- 新增中文/CJK 字体 fallback 设置：主 UI 字体不变，但中文缺字时可单独选择中文字体，主题导入/导出也会保留该设置。
- 新增繁体中文 `zh-TW` 界面语言，并补齐更新弹窗、设置页、主题名等多语言文本。
- 设置页加入搜索与分组导航，账号登录、播放、外观、媒体库、远程/云端等设置更容易找到。
- 下载/账号登录流程整理：YouTube、网易云、QQ 音乐等登录状态统一放到更清晰的账号设置入口。
- 现在按Esc可以退出界面了 比如在歌词界面可以按Esc回到主界面,专辑/艺人界面也可以哦~
**改进**
- 优化 Automix 交接逻辑，减少下一首卡死、MV 状态过早切换和主进程被大块缓冲写入拖住的风险。
- 播放队列范围更稳定：手动上一首/下一首、自动播放和 gapless 预缓冲会尽量遵守当前播放来源，不再轻易跳回全库。
- 歌词匹配更保守：纯音乐、卡拉 OK、标题/歌手不可信的在线歌词候选会被拒绝，避免给歌曲套错歌词。
- 优化内嵌歌词 seek 后的定位，快进/拖动后歌词行会更快重新锚定到正确位置。
- 罗马音生成改为分块、缓存、增量显示，覆盖更多歌曲，并补齐打包环境所需运行资源。
- MV 搜索、Bilibili 直连/嵌入播放、结尾同步逻辑继续收紧，减少尾段循环、抖动和卡顿。
- Discord RPC 状态更新更稳，减少重复推送和空状态。
- Last.fm 登录增加超时/错误反馈，并修正 API 配置诊断路径。
- 网易云错误日志和“操作频繁”提示增加乱码修复，Windows 控制台输出也减少特殊符号导致的 mojibake。
- 对低端机进行了优化
**修复**
- 修复部分右键菜单在歌词/UI 调整后不弹出或定位异常的问题。
- 修复封面/元数据缓存容易受 dev/preview 域名变化影响的问题，改为更稳定的主进程缓存路径。
- 修复更新弹窗部分文案未走本地化的问题。
- 修复部分 CUE、音频探测、歌词拖放、Last.fm payload、主题色和字体 fallback 的边缘行为，并补充单元测试。

**性能与稳定性**
- 收紧大型资料库下的缓存、历史、回填和封面元数据保留上限，减少长期运行后的内存压力。
- 图书馆健康检查加入缺失文件、重复歌曲、缺封面、乱码、缺歌词、损坏音频、异常采样率和 35 秒以下短音频检测。
- 增加 App.jsx 变更守卫和 UTF-8 编码守卫，降低后续大文件集成和乱码回归风险。

Enjoy it!

---

# 1.3.8

Source: src/content/releases/en/1.3.8.md
Kind: release-note
Locale: en-US
URL: /en/changelog/1.3.8/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/1.3.8

<img width="1672" height="941" alt="image" src="https://github.com/user-attachments/assets/ae131183-bc2c-4074-9cfa-38274aab4439" />


ECHO 1.3.8 更新日志:

这次更新主要围绕播放体验、流媒体使用 ASIO的修复 歌词与 MV 稳定性、流媒体入口、Windows 打包可靠性做了一轮集中修复。目标不是重做界面，而是让 ECHO 在日常听歌时更稳、更顺手，也更容易诊断问题。


主要更新
歌词体验
重整歌词设置抽屉，把歌词开关、歌词来源、本地歌词优先级、深度搜索、手动搜索、链接加载和显示样式集中到同一个入口。
新增歌词背景模式：支持跟随主题、跟随封面、自定义纯色和自定义壁纸。
跟随封面/壁纸模式支持透明度与模糊度调节，歌词页可以更贴近当前播放内容。
新增歌词可读性增强开关：强化文字字重、描边和字幕式阴影，但不再给歌词加突兀底框。
成功匹配到的在线歌词会写入本地缓存，后续播放同一首歌时不必重复等待网络请求。
优化在线歌词加载策略：优先显示第一个可用结果，手动搜索也会逐步展示候选，减少“卡在等待中”的感觉。
对纯音乐/无歌词曲目增加更保守的处理，避免自动匹配到明显不属于当前歌曲的歌词。
MV 与视频
优化 MV 自动搜索与排序：歌曲名 + 艺人匹配更准确，官方 MV 或高度接近的结果会优先自动选中。
对 live、cover 等结果不再简单降权；当它们确实更匹配、播放量也更高时，仍可作为候选。
修复 Bilibili 直连流媒体卡在同一时间点反复播放的问题；检测到直连播放停滞时会自动回退到嵌入式播放路径。
缩小 MV 区域与歌词/播放器之间的视觉缝隙，让播放页看起来更连贯。
流媒体与歌单
流媒体页新增网易云音乐歌单、QQ 音乐歌单链接/ID 加载入口。
支持保存最近打开过的流媒体歌单历史，可快速重新打开。
流媒体说明中补充网络限制提示，避免在网络不可用或受限环境下误判为功能异常。
默认保留原生流、WASAPI Exclusive、EQ 等能力的使用路径；受平台限制的来源仍会按兼容方式处理。
曲库与交互
歌曲右键菜单新增“定位到专辑”和“编辑标签”等入口，能更快从当前歌曲跳回曲库上下文。
专辑、文件夹、分组相关右键菜单补齐播放、加入下一首、复制名称、资源管理器显示等操作。
艺人页新增排序选项，可按名称、歌曲数、加入时间等维度查看。
新增播放画面缩放设置，只调整播放区域内容，不影响全局界面字号。
新增标题栏工具按钮开关，可控制投屏、一起听歌、插件入口是否显示。
自动 BPM 检测默认关闭，需要时可手动开启，避免不必要的后台分析。
稳定性与 Windows 体验
加强单实例逻辑：避免安装后旧进程仍在托盘里、新进程再次启动导致缓存锁冲突或白屏。
主窗口首次加载失败时会有限次自动重载，减少安装后偶发白窗停住的情况。
修复托盘/迷你播放器状态导致主窗口打开后不可见或藏在角落的问题。
自定义字体会在选择和启动时校验，阻止无效或过大的字体文件造成渲染进程崩溃。
网络共享目录监听和投屏相关服务做了隔离处理，降低外部服务异常拖垮主界面的风险。
AirPlay / DLNA 错误状态拆分显示；AirPlay 后端缺失时不再影响 DLNA 的基础可用性。
打包与发布
Windows 构建流程会先构建 AirPlay RAOP 原生依赖，再执行 Electron/Vite 与 installer 打包。
Windows 安装器接入自定义 NSIS 脚本，用于更可靠地处理安装和快捷方式行为。
修复
修复部分在线歌词结果有效但因为响应较慢被误判为“无匹配”的问题。
修复手动歌词候选搜索需要等待最慢来源完成后才显示结果的问题。
修复 MV 自动选择中过度偏向播放量、导致官方近似匹配被热门非官方结果压过的问题。
修复流媒体 MV 直连路径出现无限重复同一片段时无法自动恢复的问题。
修复重复启动 ECHO 可能产生第二个白屏窗口的问题。
修复部分打包后的窗口恢复状态导致看起来“打不开”的问题。

---

# 26.5.14

Source: src/content/releases/en/26.5.14.md
Kind: release-note
Locale: en-US
URL: /en/changelog/26.5.14/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/26.5.14

ECHO "NEXT"初版发布

此版本仍然为测试版,会少许多功能,也多了一些功能~
欢迎大家来提BUG(缺少的功能不算BUG 不要提!)

另外 ECHO版本号永久更改为"年份.月份.日期"
比如今天是2026.5.14 版本号就为v26.5.14


ECHO NEXT 更新日志:


引入自适应低延迟播放链路，扩展原生 echo-audio-host、播放 IPC、音频会话与输出桥。
增强播放稳定性诊断、音频输出记忆、进度控制与播放速度相关测试。
增加 NCM 转换工具、流媒体缓存/导入能力、曲库扫描与 BPM 分析基础设施。
补齐下载、歌单、设置、歌曲页、流媒体搜索等大量 UI 与测试覆盖。
21:10 Fix Bilibili MV quality selection

修复 Bilibili MV 清晰度选择，支持更准确的 DASH 视频流解析。
扩展高质量/高帧率 MV 选择逻辑，并更新 MV 面板与相关测试。
同步增强原生音频引擎测试、播放 IPC、曲库索引与设置项。
当前未提交更新

深色主题正式落地：

新增 appearanceTheme: light | dark | system 设置。
设置页可切换浅色、深色、跟随系统。
为主框架、侧边栏、播放器、设置页、歌曲页、歌词页、EQ 面板补齐深色样式。
歌词体验升级：

默认歌词字号调整为 40px，副歌词调整为 22px。
新增歌词行距设置 lyricsLineSpacingPercent，范围 60% - 150%。
修复 seek 后歌词位置短暂回跳的问题。
MV 关闭时歌词页可自动切回居中单栏布局。
网络歌单增强：

网络歌单支持选择播放音质：Hi-Res / Lossless / High / Standard。
网络歌单支持从原始平台链接刷新导入。
播放队列会保留网络曲目的音质偏好。
Bilibili 集成增强：

Bilibili 账号检查接入真实登录状态校验。
MV 播放 URL 支持 WBI 签名与 DASH 视频流。
质量选择会遵循最大清晰度和 60fps 设置。
曲库与元数据改进：

WAV LIST/INFO 标签读取增强，支持多编码候选解码。
宽松专辑合并逻辑改为“封面一致且专辑名相似度 90% 以上”。
默认开启重复曲目检测与音频分析。
流媒体 BPM 分析：

新增 streaming.analyzeBpm IPC / preload API。
播放流媒体曲目时可触发 BPM / beat offset 分析。
受设置页“BPM / Offset 分析”开关控制。
播放器细节修复：

播放速度滑杆拖动时不再被外部状态刷新打断。
播放栏新增流媒体 BPM 分析状态回写。
深色模式下播放器按钮、进度条和状态 chip 视觉统一。
测试与覆盖

新增/更新了 Bilibili、MV、歌词设置、歌词页、歌单页、主题偏好、WAV 元数据读取、播放队列、曲库索引等测试。

---

# 26.5.15

Source: src/content/releases/en/26.5.15.md
Kind: release-note
Locale: en-US
URL: /en/changelog/26.5.15/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/26.5.15

ECHO NEXT 更新日志:

引入自适应低延迟播放链路，扩展原生 echo-audio-host、播放 IPC、音频会话与输出桥。
增强播放稳定性诊断、音频输出记忆、进度控制与播放速度相关测试。
增加 NCM 转换工具、流媒体缓存/导入能力、曲库扫描与 BPM 分析基础设施。
补齐下载、歌单、设置、歌曲页、流媒体搜索等大量 UI 与测试覆盖。
21:10 Fix Bilibili MV quality selection

修复 Bilibili MV 清晰度选择，支持更准确的 DASH 视频流解析。
扩展高质量/高帧率 MV 选择逻辑，并更新 MV 面板与相关测试。
同步增强原生音频引擎测试、播放 IPC、曲库索引与设置项。
当前未提交更新

深色主题正式落地：

新增 appearanceTheme: light | dark | system 设置。
设置页可切换浅色、深色、跟随系统。
为主框架、侧边栏、播放器、设置页、歌曲页、歌词页、EQ 面板补齐深色样式。
歌词体验升级：

默认歌词字号调整为 40px，副歌词调整为 22px。
新增歌词行距设置 lyricsLineSpacingPercent，范围 60% - 150%。
修复 seek 后歌词位置短暂回跳的问题。
MV 关闭时歌词页可自动切回居中单栏布局。
网络歌单增强：

网络歌单支持选择播放音质：Hi-Res / Lossless / High / Standard。
网络歌单支持从原始平台链接刷新导入。
播放队列会保留网络曲目的音质偏好。
Bilibili 集成增强：

Bilibili 账号检查接入真实登录状态校验。
MV 播放 URL 支持 WBI 签名与 DASH 视频流。
质量选择会遵循最大清晰度和 60fps 设置。
曲库与元数据改进：

WAV LIST/INFO 标签读取增强，支持多编码候选解码。
宽松专辑合并逻辑改为“封面一致且专辑名相似度 90% 以上”。
默认开启重复曲目检测与音频分析。
流媒体 BPM 分析：

新增 streaming.analyzeBpm IPC / preload API。
播放流媒体曲目时可触发 BPM / beat offset 分析。
受设置页“BPM / Offset 分析”开关控制。
播放器细节修复：

播放速度滑杆拖动时不再被外部状态刷新打断。
播放栏新增流媒体 BPM 分析状态回写。
深色模式下播放器按钮、进度条和状态 chip 视觉统一。
测试与覆盖

新增/更新了 Bilibili、MV、歌词设置、歌词页、歌单页、主题偏好、WAV 元数据读取、播放队列、曲库索引等测试。

---

# 26.5.16

Source: src/content/releases/en/26.5.16.md
Kind: release-note
Locale: en-US
URL: /en/changelog/26.5.16/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/26.5.16

新增与改进

新增 MV 切歌自动重播设置，优化 MV 面板与歌词页之间的联动体验。
增强音频核心能力，补充 ASIO / WASAPI 相关原生音频宿主逻辑，并扩展多组音频稳定性测试。
歌曲与专辑列表新增“文件修改时间”排序，方便按最近整理或最近下载的音乐快速浏览。
改进 WebDAV 远程音乐源流程，完善远程文件系统适配、扫描、元数据读取和设置面板测试。
优化逐曲歌词与 MV 延迟记忆的文案，让设置含义更清晰。
修复拖拽导入时的 Downloads 兜底逻辑，提升从外部文件管理器导入音乐时的可靠性。
增强媒体库搜索与索引，包括中文搜索变体、搜索 token、播放列表备份和数据库迁移能力。
改进歌词解析、歌词匹配和国内音乐平台歌词/流媒体供应商逻辑。
补充大量单元测试与回归测试，覆盖播放器、歌词、MV、WebDAV、资料库、导入、设置页等关键路径。
体验层面

这一天的成果更偏“打地基”和“把边角磨顺”：播放链路更稳，远程资源更可靠，资料库检索和排序更实用，MV/歌词相关设置也更容易理解。整体上，ECHO Next 在本地音乐管理、在线资源接入和高质量播放体验上都往前推了一大步。

---

# 26.5.17

Source: src/content/releases/en/26.5.17.md
Kind: release-note
Locale: en-US
URL: /en/changelog/26.5.17/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/26.5.17

<img width="1672" height="941" alt="image" src="https://github.com/user-attachments/assets/fcb000db-27ef-47de-ae92-d228d01aeb5a" />


更新日志
版本日期：2026-05-17

增加 DSD DoP 直通播放试验能力，并扩展原生 audio host、DSD 探测、播放链路和相关 smoke 脚本。
加入 ASIO 原生 DSD 播放支持，扩展 ASIO host、WASAPI/ASIO 输出路径、音频设置与测试覆盖。
优化歌词可读性，改善明暗主题下歌词背景、颜色和 UI 层次。
新增音频排障控制项，音频抽屉支持更多诊断和恢复操作。
修复倍速播放影响进度条的问题，并补充播放进度相关测试。
改进歌词匹配逻辑，包括自动应用、匹配面板自动关闭、匹配评分与候选展示体验。
修复 ALAC 技术元数据相关问题，并同步了 speed progress 分支剩余修复。
忽略本地 FFmpeg 二进制文件，减少无关构建产物进入版本库。
修复 diff 上下文下提交信息生成逻辑。
当前进行中 / 未提交

播放切歌竞态保护：防止较慢的流媒体解析结果覆盖后发起的本地播放请求。
网易云流媒体增强：搜索缓存升级，公共搜索为空时回退到 cloudsearch，播放解析从 song_url_v1 回退到旧版 song_url。
QQ 音乐流媒体增强：改进 cookie/UIN/guid 读取、播放 vkey 平台回退、歌手详情失败后的搜索回退。
流媒体专辑/歌手详情页加入返回动画，并修复 Escape/back 行为只在对应详情页启用。
歌词匹配面板视觉继续打磨，覆盖明暗主题和 MV 背景场景。
补充了播放器下载、播放取消、网易/QQ 流媒体回退等测试。

UI进行了深度打磨 补齐了一些功能
还有一些杂七杂八的bugfix.
Enjoy it

---

# 26.5.18

Source: src/content/releases/en/26.5.18.md
Kind: release-note
Locale: en-US
URL: /en/changelog/26.5.18/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/26.5.18

something bugfix
主题功能回归~

---

# ECHO Next 更新日志

Source: src/content/releases/en/26.5.24.md
Kind: release-note
Locale: en-US
URL: /en/changelog/26.5.24/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/26.5.24

# ECHO Next 更新日志
<img width="1536" height="1024" alt="update" src="https://github.com/user-attachments/assets/daa8a78d-78cb-46ac-a21a-6b6d07971772" />

本版本增加的功能较多 若您无法忍受各种BUG 请勿更新!
重要的是 本次更新为实验性更新 BUG对比上个版本可能只增不少 但本次ECHO增加了排错控制台 请您积极反馈BUG!
## 总览

这几天的重点不是堆新按钮，而是把 ECHO Next 往“更稳、更可信、更专业”的方向推了一大步：播放链路继续加固，资料库恢复和扫描更安全，歌词/MV/流媒体体验更完整，插件与诊断体系更像正式产品，EQ/HQPlayer/Connect 也开始进入更专业的控制层。

一句话版本：这轮更新主要是在保护播放体验的前提下，把高级功能做得更可见、更可诊断、更不容易误伤用户数据，喵。

## 播放与音频稳定性

- 改进 gapless 播放、ReplayGain 体验和 CUE/虚拟曲目支持，减少播放衔接、音量管理和复杂音频文件上的不确定性。
- 加入更窄范围的播放位置异常检测：当底层上报出现不合理跳变时，优先在 `AudioSession` 链路内恢复，并通过已有错误提示/诊断报告暴露问题。
- 修复早期播放阶段的进度跳变场景，避免 `1s -> 6s` 这类异常被误判成正常推进，导致曲目提前结束或自动切歌。
- 损坏本地音频文件现在会更明确地报错，覆盖主进程/native 解码路径和 preload/system-output 路径，避免坏 FLAC 静默重播或假装正常结束。
- 降低播放事故期间诊断窗口、音量计和日志采集对热路径的压力，减少“诊断本身影响播放”的风险。
- 默认关闭 JUCE decode 试验路径，并收敛音频恢复日志噪音，让默认播放路径更保守、更稳定。
- EQ 工具升级为更专业的控制台：补强 native EQ 协议、预设、桥接、曲线视图和面板交互，为后续专业调音打底。
- 新增/完善音频 smoke、AudioCore、EQ、SMTC 等相关测试覆盖，重点保护已经修过的播放稳定性问题。

## 资料库、扫描与数据保护

- 加固资料库恢复模式与 poisoned metadata 隔离，避免坏元数据污染正常资料库视图。
- 增强数据保护、备份、缓存盘点和数据包处理逻辑，降低恢复/迁移类操作对用户数据的风险。
- 扫描流程开始隔离单目录 `readdir` / `stat` 失败，并通过目录快照复用降低 inaccessible path 对缺失曲目判断的误伤。
- 新增资料库健康报告、质量面板和相关安全测试，让用户能更清楚地看到本地库问题，而不是只看到“扫描失败”。
- 加强封面、元数据读取、远程资料库存储、扫描 job 和 search token 的可靠性。
- 引入 osu! archive 导入、标签写入、BPM/ReplayGain/封面提取等工作流的更多保护和测试。

## 歌词、MV 与流媒体

- 歌词系统继续增强：加入歌词校准、智能对齐、可读色优化、歌词专用设置与更完整的设置入口。
- 日语歌词加入可选 UtaTen 假名/furigana 增强，作为 secondary text 补充，不替换主歌词文本和时间轴，默认关闭，低风险接入。
- QQ 音乐、LRCLIB、罗马音、中文歌词提供链路继续补强，减少错配和弱匹配直接上屏。
- MV 匹配和视频协议继续优化，Bilibili 外部播放/直链解析增加更稳的回退与刷新逻辑。
- 流媒体侧新增/增强 Bilibili、QQ 音乐、网易云等 provider，并修复 artist detail 因 provider/cache 数据不完整导致空白或横向溢出的问题。
- Spotify 播放/授权、下载授权、流媒体缓存和 provider 原始元数据读取有进一步补强。

## 插件、诊断与高级工具

- 插件运行时增加事件 allowlist、查询上限、存储/设置配额和字段过滤，减少插件越界访问或拖慢主流程的风险。
- 插件面板加入受控 `echo:plugin-panel` 桥接，允许 sandbox 面板请求有限的 host 动作，如 summary、logs、runCommand。
- 插件管理页增强 package 导入/导出、权限风险、活动摘要、安全摘要，以及重复启动失败后的自动禁用。
- 新增内置调试控制台，集中查看 stdout/stderr/renderer console 等信息，替代吵人的启动提示。
- 播放专业状态面板默认折叠，同时保留问题原因、诊断摘要和高级状态入口。
- 设置页新增/强化诊断助手入口，将“详细、安全、稳定、尤其音频相关”的产品方向落实为可见面板。

## HQPlayer、Connect、SMTC 与外部控制

- HQPlayer 方向完成一轮重要推进：新增控制 adapter/sender/media server/service、IPC、类型和测试，为后续 HQPlayer handoff/control 与数字转盘能力铺路。
- Connect 页面和服务大幅增强，加入更多连接状态、远程源、控制入口和视觉整理。
- SMTC 主机、Windows SMTC 服务和状态同步继续补强，降低系统媒体控制状态漂移。
- AirPlay/RAOP spike、Connect HTTP server 和网络 fetch/proxy 相关链路继续迭代。
- Linux shared-output 增加 ALSA 支持，同时保持 Windows 行为隔离，避免跨平台支持误伤现有 Windows 播放体验。

## UI、设置与使用体验

- 设置页大幅扩展：音频、插件、诊断、远程源、歌词、外观、备份等入口更集中，也更容易搜索和跳转。
- App UI 字体支持扩展到三组用户优先字体加一组最低优先级备用字体，并保持歌词字体独立。
- 歌词页、队列抽屉、播放栏、桌面歌词窗口、历史页、收件箱、歌曲列表、远程源面板等大量界面完成可见打磨。
- 新增段落循环、桌面歌词、播放会话持久化、历史页面增强等播放辅助功能。
- 专辑/艺人详情增强线上资料、演出信息、artist insights 和关联跳转体验。
- Onboarding、导入、远程源过滤、拖拽导入、歌曲行和标签编辑器继续补强。

---

# 26.5.27

Source: src/content/releases/en/26.5.27.md
Kind: release-note
Locale: en-US
URL: /en/changelog/26.5.27/

## Release notes

This is the first release-content sample for ECHOPage. Future releases should copy this file and update the version, date, artifact names, sha512 values, sizes, and notes.

## Maintenance rules

- The download and changelog pages read this frontmatter automatically.
- `/update/stable/win/latest.yml` is generated from the newest stable win-x64 release.
- The desktop client should read the machine feed, not parse website HTML.

---

# 26.5.29

Source: src/content/releases/en/26.5.29.md
Kind: release-note
Locale: en-US
URL: /en/changelog/26.5.29/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/26.5.29

ECHO Next 26.5.29 更新日志
新增

新增流媒体收藏：支持导入 Bilibili 收藏、YouTube 播放列表、SoundCloud sets，并可本地保存、播放、入队、取消收藏、导出。
新增插件音源能力：插件可通过 sourceProviders 提供搜索和播放解析，进入 ECHO 的流媒体搜索/播放链路。
新增 YouTube 流媒体 provider，补齐播放解析、收藏导入和相关页面入口。
优化

曲库标题排序改为 SQLite 侧分页排序，避免大曲库每次分页都把全部结果拉到 JS 排序。
远程库增强远程专辑聚合、远程封面缓存/预加载和远程源展示，降低远程浏览卡顿感。
歌单页加入“本地歌单 / 流媒体收藏”切换，远程歌单、收藏播放和音质选择更顺。
Connect 页面支持隐藏/恢复局域网设备、折叠设备列表，并优化 HQPlayer 连接设置与主题适配。
设置页简化播放/暂停淡入淡出为单个时长滑杆，0 ms 即关闭；ReplayGain 改为标准/安静预设 + 高级面板。
修复与稳定性

增加 postinstall 原生 ABI 检查，降低 better-sqlite3 被错误重编译后导致曲库系统失效的风险。
增强启动/性能诊断：记录慢启动阶段、渲染长任务、动画帧卡顿、用户输入上下文和路由切换日志。
优化图片墙延迟加载和并发控制，滚动时减少封面加载对界面的影响。
增加 IME 友好的搜索输入处理，减少中文/日文输入时搜索抖动或误触发。
数据库健康检查加入缓存和 WAL/SHM 签名判断，减少重复 quick_check 对启动的影响。
Dev Console 增加 Performance timeline，可把卡顿和最近后台任务、播放阶段、音频状态关联起来看。
下载服务改为懒初始化，避免启动时立刻注册下载目录到曲库。
Discord / SMTC 初始同步改为仅在播放或加载中触发，减少空闲启动噪音。
艺人详情页本地歌曲预览增加“加载更多”，避免一次性渲染过多曲目。
ReplayGain 和淡入淡出设置 UI 继续收紧，文案和多语言已同步。

---

# 26.5.30

Source: src/content/releases/en/26.5.30.md
Kind: release-note
Locale: en-US
URL: /en/changelog/26.5.30/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/26.5.30

播放稳定性与诊断
启动诊断和播放性能日志更完整，遇到卡顿、启动慢或数据库异常时，更容易从控制台和诊断信息里定位原因。
播放性能记录补充更多关键节点，方便后续判断问题来自音频链路、数据库、渲染层还是后台任务。
低风险调整多处后台行为，继续避免扫描、远程同步、封面预热、诊断轮询等工作抢占播放热路径。
修复桌面歌词锁定状态下的鼠标穿透问题，减少桌面歌词影响正常桌面操作的概率。
歌词与专辑信息
歌词匹配链路增强：本地歌词读取、查询构造、评分与来源质量记忆继续完善，目标是更少误配、更稳定命中。
歌词设置里的显示选项改为可折叠面板，并记住展开状态，常用设置更清爽。
专辑详情补充外部评分与更多在线信息展示，MusicBrainz / Wikipedia 等来源的信息可见性更好。
专辑详情页增加更多菜单能力，可把整张专辑加入播放队列，也可以直接打开本地专辑所在文件夹。
流媒体与收藏
新增流媒体收藏导入 / 导出能力，便于迁移或备份跨平台收藏数据。
YouTube、Bilibili、SoundCloud 等流媒体搜索和收藏链路继续补强，MV 面板、播放栏状态和搜索页体验同步优化。
流媒体播放与本地播放的状态提示更明确，减少用户误判“当前到底由谁在播放”。

---

# 26.6.1

Source: src/content/releases/en/26.6.1.md
Kind: release-note
Locale: en-US
URL: /en/changelog/26.6.1/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/26.6.1

更新内容:
不知道,总之就是很大的更新

设置-主题 送大家的有儿童节礼物~
六一快乐!

Tips:Airplay暂时不可用,酷狗音乐源仅为测试(不要找我反馈 我打算删了这垃圾源) 网易云暂停重播可能会导致歌词小幅度漂移!(无法修复,如果您觉得延迟很大请使用本地!) 本地绝对0延迟喵

哦对 我们还可以听电台了!

---

# 26.6.3

Source: src/content/releases/en/26.6.3.md
Kind: release-note
Locale: en-US
URL: /en/changelog/26.6.3/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/26.6.3

核心更新
新增 FIR 房间校正（FIR Room Correction）能力，进一步增强音频处理链。
播放历史页面新增“最近播放”列表，提升回看/续播体验。
增加插件自定义主题能力，支持主题可由插件定义扩展。
新增 AMLL TTML 歌词源，提升歌词匹配和展示覆盖面。
EQ 页面/面板持续优化：Simple 模式打磨、界面与交互改进，并增强 Equalizer APO 导入/兼容支持。
体验与交互优化
相册/艺人详情页的返回导航修复，降低返回路径错乱。
EQ 与音频设置相关页体验优化，含样式和状态显示细节改进。
主题预设与外观相关设置进一步完善，包含更多主题能力与测试覆盖。
首次运行与设置相关流程体验提升，涉及主题与外观引导链路。
功能补充与平台能力
文档与插件 SDK 补充：扩展插件作者文档和主题预设相关说明，降低二次开发门槛。
更多本地化文案更新（多语言文本）与错误/状态文案补齐。
IPC 与 preload、main/renderer 通信链路持续对齐，支持新功能所需参数与类型。
稳定性与治理
多处测试补齐（audio/lyrics/eq/IPC/theme 等模块），提高回归保障。
清理并移除近期生成产物与无用临时文件，优化仓库体积与提交卫生。

---

# ECHO Next 26.6.4 更新日志

Source: src/content/releases/en/26.6.4.md
Kind: release-note
Locale: en-US
URL: /en/changelog/26.6.4/

## Release notes

Synced from GitHub Release: https://github.com/Moekotori/ECHO/releases/tag/26.6.4

# ECHO Next 26.6.4 更新日志
<img width="1672" height="941" alt="image" src="https://github.com/user-attachments/assets/7aa1a077-c455-4d6e-ad13-580a45abed97" />

本次更新重点是 DSP。ECHO Next 不再把 EQ 当成一个孤立的设置面板，而是把它升级成一套更清楚、更安全、更接近专业播放器工作流的 DSP 控制中心：用户能看到信号经过了哪些处理、哪些处理会影响 bit-perfect、哪里存在削波风险，以及关闭 DSP 后是否真的回到原生播放路径。

首先修复了用户提出的BUG,增加了一些排序方案 增加了增量扫描 
其次 增加了Final主题 需要持有FINAL耳机才可以使用哦~请给我发私信获取key!
<img width="2564" height="1578" alt="QQ_1780586196112" src="https://github.com/user-attachments/assets/2b7ad416-5314-44a7-b35c-688127d19695" />


## DSP 控制中心

- 新增独立 DSP 页面，并接入侧边栏导航；EQ 从设置页里的单一模块，升级为可长期扩展的 DSP 工作区。
- 将 DSP 按模块重新组织为 Headroom、EQ、耳机校正、FIR 房间校正、声道平衡和安全监控，用户不需要在一个超长 EQ 面板里找所有功能。
- 重构 EQ / DSP 的视觉层级，采用更接近 Roon 风格的侧栏与模块面板：左侧快速看链路状态，右侧进入对应处理模块。
- 补齐 DSP 页面中文与英文文案，让每个模块都能说明当前状态、下一步建议和对输出链路的影响。
- 内置 EQ 预设收敛为更核心的曲线，减少花哨但难以判断的预设，保留更适合作为调音起点的基础声音方向。

## 原生 DSP 链路

- 新增 `DspChain`，把 EQ、FIR 卷积、声道平衡、Headroom 与保护限幅整合为统一处理链，而不是各自散落在播放链路里。
- 新增 `DspHeadroomProcessor`，为高增益 EQ、FIR、声道处理预留数字余量，降低 DSP 后级削波概率。
- 原生 audio-host 已接入 DSP 链路，在实际 PCM 输出前统一处理样本，并继续保留未启用 DSP 时的直通路径。
- Audio Status 现在会明确上报 `dspActive`、`dspClippingRisk` 和 `dspLimiterProtecting`，播放器、状态抽屉和专业面板可以基于真实音频链路提示用户。
- Protect limiter 从“看起来危险”的提示升级为可解释的保护状态：待命、发现风险、正在保护输出都能区分显示。

## FIR 房间校正

- 支持导入 FIR / IR 文件用于房间校正，ECHO 会保存校正状态并通过原生 DSP 链路加载。
- 房间校正新增启用/关闭、Trim 调整、清除 IR、状态读取等完整控制路径。
- UI 会显示 IR 名称、采样率、tap 数、声道模式、延迟样本与输出峰值估算，方便判断校正是否真的生效。
- 房间校正启用时会明确标记 DSP active，并提示 bit-perfect 不再成立；关闭后回到未处理路径。
- 增加安全 Trim 建议，尤其在 FIR 输出存在增益风险时，优先引导降低 Trim，而不是让用户盲目开关。

## 耳机校正与 OPRA

- 新增 OPRA 耳机校正服务，可搜索耳机型号并把参数化校正曲线转换成 ECHO 可用的 EQ 预设。
- 新增耳机校正面板，支持选择型号、预览校正、应用到 EQ，并显示来源与兼容性提示。
- OPRA 参数会按 ECHO 当前安全范围做裁剪，不支持的滤波器会跳过并给出提示，避免把不可执行的曲线伪装成已完整应用。
- 耳机校正生成的 EQ 默认作为受管理预设，避免用户误改后还以为仍是原始校正曲线。
- 提供“转换为自定义 EQ”路径，想继续手工调音时可以脱离耳机校正锁定。
简短的说OPRA是什么:
你可以选择大奥曲线了! 

## Equalizer APO 导入导出

- 支持粘贴并解析 Equalizer APO 配置，把常见 Filter / GraphicEQ 写法转换为 ECHO 的 EQ 曲线。
- 支持导出普通 Equalizer APO 配置，也支持导出 GraphicEQ 格式，方便在 ECHO 与外部桌面音频工具之间迁移。
- 导入过程增加预览与错误提示，空内容、无法识别内容和超出范围的参数不会静默失败。
- EQ 曲线视图和参数面板同步适配 APO 导入后的频点、Q 值和增益，让导入结果能被继续编辑。

## bit-perfect 与输出安全

- DSP 页面、EQ 面板、播放器状态和专业音频面板都会更明确地区分“原生直通”和“DSP 路径”。
- 只要 EQ、FIR、声道平衡或耳机校正等 DSP 处理启用，界面会明确提示 bit-perfect 已关闭。
- Headroom 文案做了降噪：高增益 EQ 不再被夸张描述为严重风险，而是更准确地提示“有削波可能，建议预留余量”。
- 关闭 DSP 时不会因为 Headroom 或默认同步命令而压低音量、改动样本或触发多余原生处理，保留原生播放安全路径。
- 修正可选 DSP 状态同步逻辑：Room Correction 和 Channel Balance 都处于默认关闭状态时，不再向 native bridge 发送不必要的 DSP 控制命令。

## UI 与可用性

- EQ Simple mode 增加更容易理解的说明：开启时只处理启用的 DSP 模块，关闭后回到 native playback path。
- DSP 路径增加模块卡片、状态徽章、风险提示、下一步建议和实时指标，减少“声音被处理了但用户不知道”的情况。
- EQ 曲线交互继续打磨，31-band / PEQ / APO 导入后的曲线更容易观察和编辑。
- 设置页导航优化，DSP / EQ 入口更清楚；曲库加载也被延后，减少进入设置时被大库扫描拖慢的概率。

## 非 DSP 相关补充

- 新增 AMLL TTML 歌词 provider，扩展歌词匹配来源。
- 修复专辑和歌手详情页返回路径，减少从详情页返回列表时丢上下文的问题。
- 移除过期 roadmap 与评估文档，降低文档噪音，避免旧计划误导后续开发。

---

# 1.1.6

Source: src/content/releases/zh/1.1.6.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/1.1.6/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/1.1.6

Add Auto Update.
Fixed some bugs.

---

# 1.1.7

Source: src/content/releases/zh/1.1.7.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/1.1.7/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/1.1.7

ECHO 1.1.7
这次更新主要集中在播放器稳定性、歌词体验和界面细节优化，修掉了一批影响日常使用的问题，也补全了一些之前缺失的功能。

本次更新

修复拖动进度条时可能误触发连续切歌的问题，拖动播放进度现在更稳定。
修复单曲循环无效的问题，播放结束后会正确留在当前歌曲循环。
优化搜索后关闭搜索栏时的播放列表定位，当前播放歌曲不再一下跳回列表开头难以找到。
修复多处中文、日文路径与设备名称显示乱码的问题，包括播放器日志、音频 Host 输出等。
优化歌词解析与展示逻辑，改善原文、翻译、罗马音的适配表现。
修复开启翻译后歌词仍不显示翻译的问题。
优化手动选词流程，选择歌词后不再强制关闭，方便连续调整。
新增桌面悬浮歌词锁定功能，减少误触，也改善了空白区域过大的体验问题。
新增桌面悬浮歌词“是否显示翻译”开关。
优化音频设置与音量记忆，重启软件后不再总是恢复默认。
新增更新日志入口，应用内可以更直观看到每次更新内容。
新增歌词来源状态显示，可区分当前歌词来自本地、网易云、手选或缓存。
新增播放历史功能，并调整到右上角入口，后续也会继续扩展这一栏的能力。
微调默认启动窗口宽度，初始界面更舒展一些。
体验优化

播放历史入口改为右上角功能按钮，整体风格更统一。
部分界面交互和按钮布局进一步对齐现有功能区样式。
持续优化桌面歌词、播放控制和日志输出的整体稳定性。

移除了him

---

# 1.1.8

Source: src/content/releases/zh/1.1.8.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/1.1.8/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/1.1.8

本次更新

优化了资料库监听逻辑。新增、删除、重命名、移动歌曲文件后，列表、专辑、文件夹、歌词绑定等内容现在会更稳定地同步更新，并减少重复项出现的情况。
新增资料库清理能力。现在可以扫描并清除失效的本地引用，避免歌单、收藏、历史记录里残留已经不存在的文件。
加入“最近播放”和“最常播放”智能集合。播放器会基于播放历史自动整理高频内容，找歌更快。
补充播放统计基础能力。现在会记录 playCount 和 lastPlayedAt，为后续更多智能推荐和集合功能打下基础。
调整了主窗口默认尺寸。整体比例更均衡，默认打开时歌曲信息更容易看清，不会显得过于横向。
优化播放器主界面排版。标题、歌手和技术信息的显示更稳定，长一点的信息也更不容易被挤掉。
优化 Mini Waveform Bar 的渲染性能。减少了卡顿和掉帧，波形动画会比之前更顺滑。
修复部分网易云下载歌曲“已自动下载歌词，但首次播放显示无歌词”的问题。现在会更稳地等待本地歌词文件落盘，不必再手动去歌词页刷新。
保持可视化相关功能默认关闭，减少初始界面干扰，也避免不必要的性能占用。
体验改进

本地媒体库在长期使用下会更干净、更一致。
新下载歌曲的歌词命中率和首次显示成功率更高。
默认界面更克制，也更接近日常听歌时最舒服的状态。
兼容与说明

已有用户的个人设置会尽量保留，不会随更新强行覆盖。
新增的资料统计与智能集合会在后续版本继续扩展。

---

# 1.1.9

Source: src/content/releases/zh/1.1.9.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/1.1.9/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/1.1.9

Fixed some bugs.

---

# 1.2.0

Source: src/content/releases/zh/1.2.0.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/1.2.0/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/1.2.0

一些缝缝补补 修复了很多BUG

1.增加排序功能
2.现在音乐支持减速啦~
3.加了一些乱七八糟的东西
4.移除him

---

# 1.2.1

Source: src/content/releases/zh/1.2.1.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/1.2.1/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/1.2.1

优化了一些内容!

---

# 1.2.2

Source: src/content/releases/zh/1.2.2.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/1.2.2/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/1.2.2

更新日志：
超级大更新记得更新哦
新功能：
Windows 原生音频引擎现已新增 ASIO 支持
音频设置中新增 ASIO 设备列表与选择功能
新增专辑补全功能
当本地专辑只有部分歌曲时，现在可以使用补全功能将整张专辑补齐
按 F11 可以进入全屏模式
如果歌曲信息/封面匹配错误，按住 Ctrl 后点击歌曲信息/封面即可自己修改

优化：
优化了大量内容与整体性能表现
大型曲库场景下的流畅度显著提升
现在即使导入上万首歌曲，浏览、加载和播放也不会卡顿了

改进：
保留了原有 WASAPI 播放逻辑，避免影响现有用户的使用体验
改进了原生音频进程与设置界面的联动逻辑
提升了 ASIO 驱动初始化与缓冲区创建阶段的兼容性
优化了音频设备枚举与切换体验

修复：
修复了部分 ASIO 驱动初始化失败的问题
修复了部分设备在 ASIOCreateBuffers 阶段可能无法正常启动的问题
修复了多项原生音频链路中的兼容性与稳定性问题

---

# 1.2.3

Source: src/content/releases/zh/1.2.3.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/1.2.3/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/1.2.3

本次更新主要围绕三件事展开：修复歌词误匹配、补强播放队列体验，以及处理启动与运行期的一些稳定性/资源占用问题。整体方向是让匹配更准、队列更顺手、播放器更稳。

Update Notes:
优化了设置界面 增加搜索功能
增加了很多小细节功能!
修复了歌词系统“完全匹配错歌”的问题。
提高了歌词候选的最低置信门槛。
强化了标题/艺术家匹配过弱时的拒绝逻辑。
网易云歌词结果现在也会带上置信度校验，避免“搜到了但其实搜错了”。
修复了手动搜索歌词点击后无反应的问题。
手动点选网易云歌词时，现在会正确应用结果，不再因为返回值异常导致失效。
新增“下一首队列”持久化。
重启应用后，下一首 队列会自动恢复，不需要重新添加。
新增“下一首队列”拖拽排序。
队列项支持拖拽重排，左侧加入拖拽手柄，操作更直观。
优化了歌曲列表滚动条样式。
滚动条视觉更统一，不再显得过于原生和突兀。
修复了专辑页每次重启都重新加载的问题。
专辑 metadata 缓存机制已补上，重启后不会再从空状态整页重扫。
修复了最近一次内存优化引发的专辑封面丢失问题。
专辑区封面恢复正常加载，同时保留部分运行时内存止血改动。
优化了运行期内存占用。
嵌入封面在进入前端前会先压缩。
MV / 歌词 / 运行时缓存增加了上限控制。
切歌时会主动释放一部分旧曲目相关的大对象。
BPM 检测使用的临时 AudioContext 现在会在用完后关闭，避免持续堆积。
新增 WASAPI 独占启动行为开关。
默认仍会在启动时关闭独占模式。
现在可以在 音频设置 -> WASAPI 独占 下方设置是否保留上次的独占状态。

大家可以注意的点:
歌词自动匹配是否明显减少错歌。
手动搜索歌词是否能稳定应用。
下一首队列是否能在重启后恢复、拖拽排序是否正常。
专辑页重启后是否不再整页重载，封面是否正常显示。
连续播放/切歌后内存是否比旧版本稳定。
WASAPI 独占在默认模式和“保留上次状态”模式下是否都符合预期。

如有任何问题请及时在issues里提交~谢谢喵!

---

# 1.3.0

Source: src/content/releases/zh/1.3.0.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/1.3.0/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/1.3.0

ECHO讨论群:1053560752
作者很喜欢HiFi,很愿意去钻研hifi相关的任何事情
本次是有史以来最大的更新,代表着ECHO进入新篇章
增加了数不胜数的功能 如果你问性能是否会有影响?
答案是不会!而且优化了非常多! 占用由原来的3G到现在的700MB~


重构了UI,现在更方便管理
本来想把这个版本发到carnary区域的 但是我个人测试的结果是没什么大问题 就想着和大家一起找bug

其他修改也太多了....这次想偷懒一下!
总之,Enjoy it!

---

# 1.3.1

Source: src/content/releases/zh/1.3.1.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/1.3.1/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/1.3.1

近期修复
修复大量BUG  但目前仍存在许多bug 本次修复为紧急修复
移除了设置里的「实时频谱可视化」和「迷你波形条」两个功能，并清理相关配置、组件、样式和多语言文案。
清理了 App.jsx 中大量乱码注释，编码检查现在通过。
修复 Discord RPC 在连接关闭时触发 UnhandledRejection: connection closed 的崩溃日志问题。
修复 npm run dev 时反复输出 segfault-handler / WTSAPI32 / WINSTA 原生堆栈的问题，避免 naudiodon 启动时注册 crash.log 处理器。
修复 dev 环境缺少 app:setAutoUpdateEnabled IPC handler 的报错。
修复窗口销毁时仍发送音频状态导致的主进程报错。
修复 YouTube 下载的 .opus/.ogg 音频封面只显示顶部一小条的问题；旧缓存会自动刷新，新下载会优先嵌入 JPEG 封面。
下载与在线音乐
优化 YouTube 登录流程，改为系统浏览器登录并由应用自动保存 cookies，减少手动导出 cookies.txt 的麻烦。
集中处理 YouTube cookie 参数，确保元数据读取、单曲下载、歌单导入下载走同一套认证逻辑。
优化 yt-dlp 元数据缓存和下载进度处理。
增加快速下载模式，减少部分下载后的后处理耗时。
改进 SoundCloud 下载错误提示和文件命名。
增加 QQ 音乐下载相关路径，包括搜索、专辑曲目、直链获取、Cookie 状态和下载后元数据写入。
下载后的音频会更稳定地写入标题、艺人、专辑、封面等元数据。
移除Herobrine

---

# 1.3.2

Source: src/content/releases/zh/1.3.2.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/1.3.2/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/1.3.2

BUG FIX :)
这次完美解决了独占模式下重采样的问题
(最头大的问题终于解决了...)
如果您觉得下载速度慢的话,请加群1053560752
目前暂未手搓国内更新源(懒)不过也马上了ovo

---

# 1.3.3

Source: src/content/releases/zh/1.3.3.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/1.3.3/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/1.3.3

更新日志:
## 中文

### 音频引擎
- 重构 Windows WASAPI 独占输出路径，新增原生 WASAPI Exclusive 后端。
- 独占模式下可按音源采样率动态请求设备输出，减少被系统默认格式锁到 48kHz 的情况。
- 设备列表现在会显示 WASAPI 独占模式下可用的更高采样率能力。
- 改进 native audio bridge 与 FFmpeg 解码链路，192k 等高采样率播放路径更明确。
- BPM 分析切换到更成熟的异步分析路径，避免点击歌曲后先等待 BPM 检测再播放。

### AirPlay / DLNA 投放接收
- 新增 AirPlay 1 / RAOP 音频接收端，手机、平板和 Mac 可将音频投送到 ECHO。
- AirPlay 音频接入 ECHO 当前音频输出链路，可继续使用当前输出设备、音量和 EQ。
- 投放状态面板升级为“投放接收”，同时管理 DLNA 与 AirPlay。
- 改进 AirPlay 元数据处理，减少歌词行、上一首残留信息被误当作歌名的情况。
- 投放播放时会构造虚拟曲目信息，避免继续显示本地歌曲的 MV 或错误元数据。

### 远程音乐库
- 新增 Navidrome / Subsonic 远程音乐库支持。
- 支持连接测试、远程歌手/专辑/歌曲浏览、搜索、封面与播放流解析。
- 远程曲目可加入队列、喜欢和歌单，并使用 `subsonic://` 等内部引用保存。
- 新增 NAS / 本地网络文件夹 / WebDAV / SSHFS 方向的远程库适配基础。
- WebDAV 播放走本地代理，避免把带鉴权参数的真实 URL 长期暴露或写入播放列表。

### 媒体库与缓存
- 新增专辑封面持久缓存，重开软件后专辑墙不再每次重新慢慢加载封面。
- 新增艺人头像缓存，头像加载成功后会压缩并保存为本地 IndexedDB data URL。
- 艺人头像会优先使用本地可信图；没有头像时会尝试从网易云、QQ 音乐等大陆更友好的来源补全。
- 改进艺人名搜索清洗逻辑，支持去除 `CV(...)`、feat 信息，并拆分组合艺人名进行多轮搜索。
- 失败的头像搜索会短期缓存，避免反复请求；新版搜索策略会自动绕过旧 miss 记录重新尝试。

### 艺人页体验
- 艺人页从列表升级为艺人墙布局，显示更接近专辑墙。
- 修复多个艺人共用同一张合辑封面导致“头像撞脸”的问题。
- 没有可信头像时，改为统一浅色圆形文字头像，视觉更干净。
- 改进艺人头像选择策略，避免随便拿专辑封面冒充艺人头像。

### UI 与交互
- 优化歌曲列表滚动和部分布局表现。
- AirPlay 播放期间点击本地歌曲时，会先处理投放状态，避免本地歌曲被错误替换成 AirPlay 信息。
- 改进 cast / 本地播放之间的状态切换，减少歌词、封面、MV 残留。
- 更新投放接收抽屉说明文案和状态显示。

### 构建与维护
- 新增 AirPlay RAOP 构建脚本。
- 更新 native audio host 构建配置，补充 WASAPI exclusive 源文件与 Windows 链接依赖。
- 新增 `_HOTFIX_192K` 调试与重建文档。
- 保持编码守卫、App.jsx 守卫和生产构建通过。

---

## English

### Audio Engine
- Reworked the Windows WASAPI exclusive output path with a native WASAPI Exclusive backend.
- Exclusive mode can now request the device output rate dynamically based on the source sample rate, reducing cases where playback is locked to the Windows default 48kHz format.
- Device listing now reports higher WASAPI-exclusive capabilities where available.
- Improved the native audio bridge and FFmpeg decode path for clearer high-sample-rate playback, including 192kHz sources.
- BPM analysis now runs through a more mature asynchronous path so playback does not wait for BPM detection before starting.

### AirPlay / DLNA Cast Receiver
- Added an AirPlay 1 / RAOP audio receiver so iPhone, iPad, and Mac can stream audio to ECHO.
- AirPlay audio is routed through ECHO’s current audio output path, including the selected device, volume, and EQ.
- The cast drawer has been upgraded into a unified receiver panel for both DLNA and AirPlay.
- Improved AirPlay metadata handling to reduce cases where lyrics lines or stale metadata are shown as the song title.
- Cast playback now uses virtual track metadata to avoid showing local-track MV or stale local metadata during casting.

### Remote Music Libraries
- Added Navidrome / Subsonic remote music library support.
- Supports connection testing, remote artist/album/song browsing, search, cover art, and stream URL resolution.
- Remote tracks can be added to the queue, liked songs, and playlists using internal references such as `subsonic://`.
- Added foundational support for NAS / local network folders / WebDAV / SSHFS-style remote library workflows.
- WebDAV playback now uses a local proxy, avoiding long-lived authenticated URLs in playlists or UI state.

### Library And Cache
- Added persistent album cover caching so album walls no longer reload covers from scratch after every restart.
- Added artist avatar caching; successfully loaded avatars are compressed and stored locally as IndexedDB data URLs.
- Artist avatars prefer trusted local images first, then try mainland-friendly sources such as NetEase Cloud Music and QQ Music.
- Improved artist search cleanup by stripping `CV(...)`, feat text, and splitting combined artist names for multi-pass lookup.
- Failed avatar lookups are cached briefly to avoid repeated requests, while newer lookup strategies can bypass old miss records.

### Artist Page
- Replaced the artist list with an artist-wall layout similar to the album wall.
- Fixed repeated “same avatar” cases caused by shared compilation album covers.
- Artists without trusted images now use a clean light circular text avatar.
- Improved avatar selection so album covers are not blindly reused as artist portraits.

### UI And Interaction
- Improved song-list scrolling and related layout behavior.
- Clicking a local song during AirPlay playback now handles the cast state first, avoiding local tracks being overwritten by AirPlay metadata.
- Improved state cleanup between cast playback and local playback, reducing stale lyrics, covers, and MV display.
- Updated cast receiver drawer copy and status display.

### Build And Maintenance
- Added an AirPlay RAOP build script.
- Updated native audio host build configuration with WASAPI exclusive sources and Windows link dependencies.
- Added `_HOTFIX_192K` rebuild and troubleshooting documentation.
- Encoding guard, App.jsx guard, and production build checks are passing.

---

# 1.3.4

Source: src/content/releases/zh/1.3.4.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/1.3.4/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/1.3.4

这个版本没有填写 GitHub Release 正文。

---

# 1.3.5

Source: src/content/releases/zh/1.3.5.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/1.3.5/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/1.3.5

修复了一些BUG.
加了一些大家想要的功能~

---

# 1.3.6

Source: src/content/releases/zh/1.3.6.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/1.3.6/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/1.3.6

修复BUG,优化性能.
优化了资源库
尽力优化了歌词/MV匹配 但如果实在找不到请手选(手选是有记忆的所以只用选一次就好了)

---

# 1.3.7

Source: src/content/releases/zh/1.3.7.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/1.3.7/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/1.3.7

<img width="1717" height="916" alt="bf17c2a4-2a6a-4d49-9884-013e7cd216eb" src="https://github.com/user-attachments/assets/7da10084-375a-4711-a603-c1bc602aab5a" />

2026:5.6 中午12点热更新 不更新版本号
**ECHO 更新日志:**
**本次更新较大,可能会造成一些奇怪的BUG 您可以在issues里面提出或加入ECHO QQ讨论群:1053560752**
**新增**
- 新增迷你播放器：可独立浮窗显示当前歌曲、封面、播放进度和基础控制，并支持置顶、记住窗口位置，以及打开后自动隐藏主窗口。
- 新增中文/CJK 字体 fallback 设置：主 UI 字体不变，但中文缺字时可单独选择中文字体，主题导入/导出也会保留该设置。
- 新增繁体中文 `zh-TW` 界面语言，并补齐更新弹窗、设置页、主题名等多语言文本。
- 设置页加入搜索与分组导航，账号登录、播放、外观、媒体库、远程/云端等设置更容易找到。
- 下载/账号登录流程整理：YouTube、网易云、QQ 音乐等登录状态统一放到更清晰的账号设置入口。
- 现在按Esc可以退出界面了 比如在歌词界面可以按Esc回到主界面,专辑/艺人界面也可以哦~
**改进**
- 优化 Automix 交接逻辑，减少下一首卡死、MV 状态过早切换和主进程被大块缓冲写入拖住的风险。
- 播放队列范围更稳定：手动上一首/下一首、自动播放和 gapless 预缓冲会尽量遵守当前播放来源，不再轻易跳回全库。
- 歌词匹配更保守：纯音乐、卡拉 OK、标题/歌手不可信的在线歌词候选会被拒绝，避免给歌曲套错歌词。
- 优化内嵌歌词 seek 后的定位，快进/拖动后歌词行会更快重新锚定到正确位置。
- 罗马音生成改为分块、缓存、增量显示，覆盖更多歌曲，并补齐打包环境所需运行资源。
- MV 搜索、Bilibili 直连/嵌入播放、结尾同步逻辑继续收紧，减少尾段循环、抖动和卡顿。
- Discord RPC 状态更新更稳，减少重复推送和空状态。
- Last.fm 登录增加超时/错误反馈，并修正 API 配置诊断路径。
- 网易云错误日志和“操作频繁”提示增加乱码修复，Windows 控制台输出也减少特殊符号导致的 mojibake。
- 对低端机进行了优化
**修复**
- 修复部分右键菜单在歌词/UI 调整后不弹出或定位异常的问题。
- 修复封面/元数据缓存容易受 dev/preview 域名变化影响的问题，改为更稳定的主进程缓存路径。
- 修复更新弹窗部分文案未走本地化的问题。
- 修复部分 CUE、音频探测、歌词拖放、Last.fm payload、主题色和字体 fallback 的边缘行为，并补充单元测试。

**性能与稳定性**
- 收紧大型资料库下的缓存、历史、回填和封面元数据保留上限，减少长期运行后的内存压力。
- 图书馆健康检查加入缺失文件、重复歌曲、缺封面、乱码、缺歌词、损坏音频、异常采样率和 35 秒以下短音频检测。
- 增加 App.jsx 变更守卫和 UTF-8 编码守卫，降低后续大文件集成和乱码回归风险。

Enjoy it!

---

# 1.3.8

Source: src/content/releases/zh/1.3.8.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/1.3.8/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/1.3.8

<img width="1672" height="941" alt="image" src="https://github.com/user-attachments/assets/ae131183-bc2c-4074-9cfa-38274aab4439" />


ECHO 1.3.8 更新日志:

这次更新主要围绕播放体验、流媒体使用 ASIO的修复 歌词与 MV 稳定性、流媒体入口、Windows 打包可靠性做了一轮集中修复。目标不是重做界面，而是让 ECHO 在日常听歌时更稳、更顺手，也更容易诊断问题。


主要更新
歌词体验
重整歌词设置抽屉，把歌词开关、歌词来源、本地歌词优先级、深度搜索、手动搜索、链接加载和显示样式集中到同一个入口。
新增歌词背景模式：支持跟随主题、跟随封面、自定义纯色和自定义壁纸。
跟随封面/壁纸模式支持透明度与模糊度调节，歌词页可以更贴近当前播放内容。
新增歌词可读性增强开关：强化文字字重、描边和字幕式阴影，但不再给歌词加突兀底框。
成功匹配到的在线歌词会写入本地缓存，后续播放同一首歌时不必重复等待网络请求。
优化在线歌词加载策略：优先显示第一个可用结果，手动搜索也会逐步展示候选，减少“卡在等待中”的感觉。
对纯音乐/无歌词曲目增加更保守的处理，避免自动匹配到明显不属于当前歌曲的歌词。
MV 与视频
优化 MV 自动搜索与排序：歌曲名 + 艺人匹配更准确，官方 MV 或高度接近的结果会优先自动选中。
对 live、cover 等结果不再简单降权；当它们确实更匹配、播放量也更高时，仍可作为候选。
修复 Bilibili 直连流媒体卡在同一时间点反复播放的问题；检测到直连播放停滞时会自动回退到嵌入式播放路径。
缩小 MV 区域与歌词/播放器之间的视觉缝隙，让播放页看起来更连贯。
流媒体与歌单
流媒体页新增网易云音乐歌单、QQ 音乐歌单链接/ID 加载入口。
支持保存最近打开过的流媒体歌单历史，可快速重新打开。
流媒体说明中补充网络限制提示，避免在网络不可用或受限环境下误判为功能异常。
默认保留原生流、WASAPI Exclusive、EQ 等能力的使用路径；受平台限制的来源仍会按兼容方式处理。
曲库与交互
歌曲右键菜单新增“定位到专辑”和“编辑标签”等入口，能更快从当前歌曲跳回曲库上下文。
专辑、文件夹、分组相关右键菜单补齐播放、加入下一首、复制名称、资源管理器显示等操作。
艺人页新增排序选项，可按名称、歌曲数、加入时间等维度查看。
新增播放画面缩放设置，只调整播放区域内容，不影响全局界面字号。
新增标题栏工具按钮开关，可控制投屏、一起听歌、插件入口是否显示。
自动 BPM 检测默认关闭，需要时可手动开启，避免不必要的后台分析。
稳定性与 Windows 体验
加强单实例逻辑：避免安装后旧进程仍在托盘里、新进程再次启动导致缓存锁冲突或白屏。
主窗口首次加载失败时会有限次自动重载，减少安装后偶发白窗停住的情况。
修复托盘/迷你播放器状态导致主窗口打开后不可见或藏在角落的问题。
自定义字体会在选择和启动时校验，阻止无效或过大的字体文件造成渲染进程崩溃。
网络共享目录监听和投屏相关服务做了隔离处理，降低外部服务异常拖垮主界面的风险。
AirPlay / DLNA 错误状态拆分显示；AirPlay 后端缺失时不再影响 DLNA 的基础可用性。
打包与发布
Windows 构建流程会先构建 AirPlay RAOP 原生依赖，再执行 Electron/Vite 与 installer 打包。
Windows 安装器接入自定义 NSIS 脚本，用于更可靠地处理安装和快捷方式行为。
修复
修复部分在线歌词结果有效但因为响应较慢被误判为“无匹配”的问题。
修复手动歌词候选搜索需要等待最慢来源完成后才显示结果的问题。
修复 MV 自动选择中过度偏向播放量、导致官方近似匹配被热门非官方结果压过的问题。
修复流媒体 MV 直连路径出现无限重复同一片段时无法自动恢复的问题。
修复重复启动 ECHO 可能产生第二个白屏窗口的问题。
修复部分打包后的窗口恢复状态导致看起来“打不开”的问题。

---

# 26.5.14

Source: src/content/releases/zh/26.5.14.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/26.5.14/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/26.5.14

ECHO "NEXT"初版发布

此版本仍然为测试版,会少许多功能,也多了一些功能~
欢迎大家来提BUG(缺少的功能不算BUG 不要提!)

另外 ECHO版本号永久更改为"年份.月份.日期"
比如今天是2026.5.14 版本号就为v26.5.14


ECHO NEXT 更新日志:


引入自适应低延迟播放链路，扩展原生 echo-audio-host、播放 IPC、音频会话与输出桥。
增强播放稳定性诊断、音频输出记忆、进度控制与播放速度相关测试。
增加 NCM 转换工具、流媒体缓存/导入能力、曲库扫描与 BPM 分析基础设施。
补齐下载、歌单、设置、歌曲页、流媒体搜索等大量 UI 与测试覆盖。
21:10 Fix Bilibili MV quality selection

修复 Bilibili MV 清晰度选择，支持更准确的 DASH 视频流解析。
扩展高质量/高帧率 MV 选择逻辑，并更新 MV 面板与相关测试。
同步增强原生音频引擎测试、播放 IPC、曲库索引与设置项。
当前未提交更新

深色主题正式落地：

新增 appearanceTheme: light | dark | system 设置。
设置页可切换浅色、深色、跟随系统。
为主框架、侧边栏、播放器、设置页、歌曲页、歌词页、EQ 面板补齐深色样式。
歌词体验升级：

默认歌词字号调整为 40px，副歌词调整为 22px。
新增歌词行距设置 lyricsLineSpacingPercent，范围 60% - 150%。
修复 seek 后歌词位置短暂回跳的问题。
MV 关闭时歌词页可自动切回居中单栏布局。
网络歌单增强：

网络歌单支持选择播放音质：Hi-Res / Lossless / High / Standard。
网络歌单支持从原始平台链接刷新导入。
播放队列会保留网络曲目的音质偏好。
Bilibili 集成增强：

Bilibili 账号检查接入真实登录状态校验。
MV 播放 URL 支持 WBI 签名与 DASH 视频流。
质量选择会遵循最大清晰度和 60fps 设置。
曲库与元数据改进：

WAV LIST/INFO 标签读取增强，支持多编码候选解码。
宽松专辑合并逻辑改为“封面一致且专辑名相似度 90% 以上”。
默认开启重复曲目检测与音频分析。
流媒体 BPM 分析：

新增 streaming.analyzeBpm IPC / preload API。
播放流媒体曲目时可触发 BPM / beat offset 分析。
受设置页“BPM / Offset 分析”开关控制。
播放器细节修复：

播放速度滑杆拖动时不再被外部状态刷新打断。
播放栏新增流媒体 BPM 分析状态回写。
深色模式下播放器按钮、进度条和状态 chip 视觉统一。
测试与覆盖

新增/更新了 Bilibili、MV、歌词设置、歌词页、歌单页、主题偏好、WAV 元数据读取、播放队列、曲库索引等测试。

---

# 26.5.15

Source: src/content/releases/zh/26.5.15.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/26.5.15/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/26.5.15

ECHO NEXT 更新日志:

引入自适应低延迟播放链路，扩展原生 echo-audio-host、播放 IPC、音频会话与输出桥。
增强播放稳定性诊断、音频输出记忆、进度控制与播放速度相关测试。
增加 NCM 转换工具、流媒体缓存/导入能力、曲库扫描与 BPM 分析基础设施。
补齐下载、歌单、设置、歌曲页、流媒体搜索等大量 UI 与测试覆盖。
21:10 Fix Bilibili MV quality selection

修复 Bilibili MV 清晰度选择，支持更准确的 DASH 视频流解析。
扩展高质量/高帧率 MV 选择逻辑，并更新 MV 面板与相关测试。
同步增强原生音频引擎测试、播放 IPC、曲库索引与设置项。
当前未提交更新

深色主题正式落地：

新增 appearanceTheme: light | dark | system 设置。
设置页可切换浅色、深色、跟随系统。
为主框架、侧边栏、播放器、设置页、歌曲页、歌词页、EQ 面板补齐深色样式。
歌词体验升级：

默认歌词字号调整为 40px，副歌词调整为 22px。
新增歌词行距设置 lyricsLineSpacingPercent，范围 60% - 150%。
修复 seek 后歌词位置短暂回跳的问题。
MV 关闭时歌词页可自动切回居中单栏布局。
网络歌单增强：

网络歌单支持选择播放音质：Hi-Res / Lossless / High / Standard。
网络歌单支持从原始平台链接刷新导入。
播放队列会保留网络曲目的音质偏好。
Bilibili 集成增强：

Bilibili 账号检查接入真实登录状态校验。
MV 播放 URL 支持 WBI 签名与 DASH 视频流。
质量选择会遵循最大清晰度和 60fps 设置。
曲库与元数据改进：

WAV LIST/INFO 标签读取增强，支持多编码候选解码。
宽松专辑合并逻辑改为“封面一致且专辑名相似度 90% 以上”。
默认开启重复曲目检测与音频分析。
流媒体 BPM 分析：

新增 streaming.analyzeBpm IPC / preload API。
播放流媒体曲目时可触发 BPM / beat offset 分析。
受设置页“BPM / Offset 分析”开关控制。
播放器细节修复：

播放速度滑杆拖动时不再被外部状态刷新打断。
播放栏新增流媒体 BPM 分析状态回写。
深色模式下播放器按钮、进度条和状态 chip 视觉统一。
测试与覆盖

新增/更新了 Bilibili、MV、歌词设置、歌词页、歌单页、主题偏好、WAV 元数据读取、播放队列、曲库索引等测试。

---

# 26.5.16

Source: src/content/releases/zh/26.5.16.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/26.5.16/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/26.5.16

新增与改进

新增 MV 切歌自动重播设置，优化 MV 面板与歌词页之间的联动体验。
增强音频核心能力，补充 ASIO / WASAPI 相关原生音频宿主逻辑，并扩展多组音频稳定性测试。
歌曲与专辑列表新增“文件修改时间”排序，方便按最近整理或最近下载的音乐快速浏览。
改进 WebDAV 远程音乐源流程，完善远程文件系统适配、扫描、元数据读取和设置面板测试。
优化逐曲歌词与 MV 延迟记忆的文案，让设置含义更清晰。
修复拖拽导入时的 Downloads 兜底逻辑，提升从外部文件管理器导入音乐时的可靠性。
增强媒体库搜索与索引，包括中文搜索变体、搜索 token、播放列表备份和数据库迁移能力。
改进歌词解析、歌词匹配和国内音乐平台歌词/流媒体供应商逻辑。
补充大量单元测试与回归测试，覆盖播放器、歌词、MV、WebDAV、资料库、导入、设置页等关键路径。
体验层面

这一天的成果更偏“打地基”和“把边角磨顺”：播放链路更稳，远程资源更可靠，资料库检索和排序更实用，MV/歌词相关设置也更容易理解。整体上，ECHO Next 在本地音乐管理、在线资源接入和高质量播放体验上都往前推了一大步。

---

# 26.5.17

Source: src/content/releases/zh/26.5.17.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/26.5.17/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/26.5.17

<img width="1672" height="941" alt="image" src="https://github.com/user-attachments/assets/fcb000db-27ef-47de-ae92-d228d01aeb5a" />


更新日志
版本日期：2026-05-17

增加 DSD DoP 直通播放试验能力，并扩展原生 audio host、DSD 探测、播放链路和相关 smoke 脚本。
加入 ASIO 原生 DSD 播放支持，扩展 ASIO host、WASAPI/ASIO 输出路径、音频设置与测试覆盖。
优化歌词可读性，改善明暗主题下歌词背景、颜色和 UI 层次。
新增音频排障控制项，音频抽屉支持更多诊断和恢复操作。
修复倍速播放影响进度条的问题，并补充播放进度相关测试。
改进歌词匹配逻辑，包括自动应用、匹配面板自动关闭、匹配评分与候选展示体验。
修复 ALAC 技术元数据相关问题，并同步了 speed progress 分支剩余修复。
忽略本地 FFmpeg 二进制文件，减少无关构建产物进入版本库。
修复 diff 上下文下提交信息生成逻辑。
当前进行中 / 未提交

播放切歌竞态保护：防止较慢的流媒体解析结果覆盖后发起的本地播放请求。
网易云流媒体增强：搜索缓存升级，公共搜索为空时回退到 cloudsearch，播放解析从 song_url_v1 回退到旧版 song_url。
QQ 音乐流媒体增强：改进 cookie/UIN/guid 读取、播放 vkey 平台回退、歌手详情失败后的搜索回退。
流媒体专辑/歌手详情页加入返回动画，并修复 Escape/back 行为只在对应详情页启用。
歌词匹配面板视觉继续打磨，覆盖明暗主题和 MV 背景场景。
补充了播放器下载、播放取消、网易/QQ 流媒体回退等测试。

UI进行了深度打磨 补齐了一些功能
还有一些杂七杂八的bugfix.
Enjoy it

---

# 26.5.18

Source: src/content/releases/zh/26.5.18.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/26.5.18/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/26.5.18

something bugfix
主题功能回归~

---

# ECHO Next 更新日志

Source: src/content/releases/zh/26.5.24.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/26.5.24/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/26.5.24

# ECHO Next 更新日志
<img width="1536" height="1024" alt="update" src="https://github.com/user-attachments/assets/daa8a78d-78cb-46ac-a21a-6b6d07971772" />

本版本增加的功能较多 若您无法忍受各种BUG 请勿更新!
重要的是 本次更新为实验性更新 BUG对比上个版本可能只增不少 但本次ECHO增加了排错控制台 请您积极反馈BUG!
## 总览

这几天的重点不是堆新按钮，而是把 ECHO Next 往“更稳、更可信、更专业”的方向推了一大步：播放链路继续加固，资料库恢复和扫描更安全，歌词/MV/流媒体体验更完整，插件与诊断体系更像正式产品，EQ/HQPlayer/Connect 也开始进入更专业的控制层。

一句话版本：这轮更新主要是在保护播放体验的前提下，把高级功能做得更可见、更可诊断、更不容易误伤用户数据，喵。

## 播放与音频稳定性

- 改进 gapless 播放、ReplayGain 体验和 CUE/虚拟曲目支持，减少播放衔接、音量管理和复杂音频文件上的不确定性。
- 加入更窄范围的播放位置异常检测：当底层上报出现不合理跳变时，优先在 `AudioSession` 链路内恢复，并通过已有错误提示/诊断报告暴露问题。
- 修复早期播放阶段的进度跳变场景，避免 `1s -> 6s` 这类异常被误判成正常推进，导致曲目提前结束或自动切歌。
- 损坏本地音频文件现在会更明确地报错，覆盖主进程/native 解码路径和 preload/system-output 路径，避免坏 FLAC 静默重播或假装正常结束。
- 降低播放事故期间诊断窗口、音量计和日志采集对热路径的压力，减少“诊断本身影响播放”的风险。
- 默认关闭 JUCE decode 试验路径，并收敛音频恢复日志噪音，让默认播放路径更保守、更稳定。
- EQ 工具升级为更专业的控制台：补强 native EQ 协议、预设、桥接、曲线视图和面板交互，为后续专业调音打底。
- 新增/完善音频 smoke、AudioCore、EQ、SMTC 等相关测试覆盖，重点保护已经修过的播放稳定性问题。

## 资料库、扫描与数据保护

- 加固资料库恢复模式与 poisoned metadata 隔离，避免坏元数据污染正常资料库视图。
- 增强数据保护、备份、缓存盘点和数据包处理逻辑，降低恢复/迁移类操作对用户数据的风险。
- 扫描流程开始隔离单目录 `readdir` / `stat` 失败，并通过目录快照复用降低 inaccessible path 对缺失曲目判断的误伤。
- 新增资料库健康报告、质量面板和相关安全测试，让用户能更清楚地看到本地库问题，而不是只看到“扫描失败”。
- 加强封面、元数据读取、远程资料库存储、扫描 job 和 search token 的可靠性。
- 引入 osu! archive 导入、标签写入、BPM/ReplayGain/封面提取等工作流的更多保护和测试。

## 歌词、MV 与流媒体

- 歌词系统继续增强：加入歌词校准、智能对齐、可读色优化、歌词专用设置与更完整的设置入口。
- 日语歌词加入可选 UtaTen 假名/furigana 增强，作为 secondary text 补充，不替换主歌词文本和时间轴，默认关闭，低风险接入。
- QQ 音乐、LRCLIB、罗马音、中文歌词提供链路继续补强，减少错配和弱匹配直接上屏。
- MV 匹配和视频协议继续优化，Bilibili 外部播放/直链解析增加更稳的回退与刷新逻辑。
- 流媒体侧新增/增强 Bilibili、QQ 音乐、网易云等 provider，并修复 artist detail 因 provider/cache 数据不完整导致空白或横向溢出的问题。
- Spotify 播放/授权、下载授权、流媒体缓存和 provider 原始元数据读取有进一步补强。

## 插件、诊断与高级工具

- 插件运行时增加事件 allowlist、查询上限、存储/设置配额和字段过滤，减少插件越界访问或拖慢主流程的风险。
- 插件面板加入受控 `echo:plugin-panel` 桥接，允许 sandbox 面板请求有限的 host 动作，如 summary、logs、runCommand。
- 插件管理页增强 package 导入/导出、权限风险、活动摘要、安全摘要，以及重复启动失败后的自动禁用。
- 新增内置调试控制台，集中查看 stdout/stderr/renderer console 等信息，替代吵人的启动提示。
- 播放专业状态面板默认折叠，同时保留问题原因、诊断摘要和高级状态入口。
- 设置页新增/强化诊断助手入口，将“详细、安全、稳定、尤其音频相关”的产品方向落实为可见面板。

## HQPlayer、Connect、SMTC 与外部控制

- HQPlayer 方向完成一轮重要推进：新增控制 adapter/sender/media server/service、IPC、类型和测试，为后续 HQPlayer handoff/control 与数字转盘能力铺路。
- Connect 页面和服务大幅增强，加入更多连接状态、远程源、控制入口和视觉整理。
- SMTC 主机、Windows SMTC 服务和状态同步继续补强，降低系统媒体控制状态漂移。
- AirPlay/RAOP spike、Connect HTTP server 和网络 fetch/proxy 相关链路继续迭代。
- Linux shared-output 增加 ALSA 支持，同时保持 Windows 行为隔离，避免跨平台支持误伤现有 Windows 播放体验。

## UI、设置与使用体验

- 设置页大幅扩展：音频、插件、诊断、远程源、歌词、外观、备份等入口更集中，也更容易搜索和跳转。
- App UI 字体支持扩展到三组用户优先字体加一组最低优先级备用字体，并保持歌词字体独立。
- 歌词页、队列抽屉、播放栏、桌面歌词窗口、历史页、收件箱、歌曲列表、远程源面板等大量界面完成可见打磨。
- 新增段落循环、桌面歌词、播放会话持久化、历史页面增强等播放辅助功能。
- 专辑/艺人详情增强线上资料、演出信息、artist insights 和关联跳转体验。
- Onboarding、导入、远程源过滤、拖拽导入、歌曲行和标签编辑器继续补强。

---

# 26.5.27

Source: src/content/releases/zh/26.5.27.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/26.5.27/

## 发布说明

这是 ECHOPage 的第一份内容驱动 release 样本。以后发版时优先复制这份文件，改版本号、日期、安装包文件名、sha512、大小和正文说明即可。

## 维护规则

- 下载页和更新日志会自动读取这份 frontmatter。
- `/update/stable/win/latest.yml` 会从最新 stable win-x64 release 自动生成。
- 客户端更新源不要读取 HTML 页面，只读取机器可解析的 feed。

---

# 26.5.29

Source: src/content/releases/zh/26.5.29.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/26.5.29/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/26.5.29

ECHO Next 26.5.29 更新日志
新增

新增流媒体收藏：支持导入 Bilibili 收藏、YouTube 播放列表、SoundCloud sets，并可本地保存、播放、入队、取消收藏、导出。
新增插件音源能力：插件可通过 sourceProviders 提供搜索和播放解析，进入 ECHO 的流媒体搜索/播放链路。
新增 YouTube 流媒体 provider，补齐播放解析、收藏导入和相关页面入口。
优化

曲库标题排序改为 SQLite 侧分页排序，避免大曲库每次分页都把全部结果拉到 JS 排序。
远程库增强远程专辑聚合、远程封面缓存/预加载和远程源展示，降低远程浏览卡顿感。
歌单页加入“本地歌单 / 流媒体收藏”切换，远程歌单、收藏播放和音质选择更顺。
Connect 页面支持隐藏/恢复局域网设备、折叠设备列表，并优化 HQPlayer 连接设置与主题适配。
设置页简化播放/暂停淡入淡出为单个时长滑杆，0 ms 即关闭；ReplayGain 改为标准/安静预设 + 高级面板。
修复与稳定性

增加 postinstall 原生 ABI 检查，降低 better-sqlite3 被错误重编译后导致曲库系统失效的风险。
增强启动/性能诊断：记录慢启动阶段、渲染长任务、动画帧卡顿、用户输入上下文和路由切换日志。
优化图片墙延迟加载和并发控制，滚动时减少封面加载对界面的影响。
增加 IME 友好的搜索输入处理，减少中文/日文输入时搜索抖动或误触发。
数据库健康检查加入缓存和 WAL/SHM 签名判断，减少重复 quick_check 对启动的影响。
Dev Console 增加 Performance timeline，可把卡顿和最近后台任务、播放阶段、音频状态关联起来看。
下载服务改为懒初始化，避免启动时立刻注册下载目录到曲库。
Discord / SMTC 初始同步改为仅在播放或加载中触发，减少空闲启动噪音。
艺人详情页本地歌曲预览增加“加载更多”，避免一次性渲染过多曲目。
ReplayGain 和淡入淡出设置 UI 继续收紧，文案和多语言已同步。

---

# 26.5.30

Source: src/content/releases/zh/26.5.30.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/26.5.30/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/26.5.30

播放稳定性与诊断
启动诊断和播放性能日志更完整，遇到卡顿、启动慢或数据库异常时，更容易从控制台和诊断信息里定位原因。
播放性能记录补充更多关键节点，方便后续判断问题来自音频链路、数据库、渲染层还是后台任务。
低风险调整多处后台行为，继续避免扫描、远程同步、封面预热、诊断轮询等工作抢占播放热路径。
修复桌面歌词锁定状态下的鼠标穿透问题，减少桌面歌词影响正常桌面操作的概率。
歌词与专辑信息
歌词匹配链路增强：本地歌词读取、查询构造、评分与来源质量记忆继续完善，目标是更少误配、更稳定命中。
歌词设置里的显示选项改为可折叠面板，并记住展开状态，常用设置更清爽。
专辑详情补充外部评分与更多在线信息展示，MusicBrainz / Wikipedia 等来源的信息可见性更好。
专辑详情页增加更多菜单能力，可把整张专辑加入播放队列，也可以直接打开本地专辑所在文件夹。
流媒体与收藏
新增流媒体收藏导入 / 导出能力，便于迁移或备份跨平台收藏数据。
YouTube、Bilibili、SoundCloud 等流媒体搜索和收藏链路继续补强，MV 面板、播放栏状态和搜索页体验同步优化。
流媒体播放与本地播放的状态提示更明确，减少用户误判“当前到底由谁在播放”。

---

# 26.6.1

Source: src/content/releases/zh/26.6.1.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/26.6.1/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/26.6.1

更新内容:
不知道,总之就是很大的更新

设置-主题 送大家的有儿童节礼物~
六一快乐!

Tips:Airplay暂时不可用,酷狗音乐源仅为测试(不要找我反馈 我打算删了这垃圾源) 网易云暂停重播可能会导致歌词小幅度漂移!(无法修复,如果您觉得延迟很大请使用本地!) 本地绝对0延迟喵

哦对 我们还可以听电台了!

---

# 26.6.3

Source: src/content/releases/zh/26.6.3.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/26.6.3/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/26.6.3

核心更新
新增 FIR 房间校正（FIR Room Correction）能力，进一步增强音频处理链。
播放历史页面新增“最近播放”列表，提升回看/续播体验。
增加插件自定义主题能力，支持主题可由插件定义扩展。
新增 AMLL TTML 歌词源，提升歌词匹配和展示覆盖面。
EQ 页面/面板持续优化：Simple 模式打磨、界面与交互改进，并增强 Equalizer APO 导入/兼容支持。
体验与交互优化
相册/艺人详情页的返回导航修复，降低返回路径错乱。
EQ 与音频设置相关页体验优化，含样式和状态显示细节改进。
主题预设与外观相关设置进一步完善，包含更多主题能力与测试覆盖。
首次运行与设置相关流程体验提升，涉及主题与外观引导链路。
功能补充与平台能力
文档与插件 SDK 补充：扩展插件作者文档和主题预设相关说明，降低二次开发门槛。
更多本地化文案更新（多语言文本）与错误/状态文案补齐。
IPC 与 preload、main/renderer 通信链路持续对齐，支持新功能所需参数与类型。
稳定性与治理
多处测试补齐（audio/lyrics/eq/IPC/theme 等模块），提高回归保障。
清理并移除近期生成产物与无用临时文件，优化仓库体积与提交卫生。

---

# ECHO Next 26.6.4 更新日志

Source: src/content/releases/zh/26.6.4.md
Kind: release-note
Locale: zh-CN
URL: /zh/changelog/26.6.4/

## 发布说明

同步自 GitHub Release：https://github.com/Moekotori/ECHO/releases/tag/26.6.4

# ECHO Next 26.6.4 更新日志
<img width="1672" height="941" alt="image" src="https://github.com/user-attachments/assets/7aa1a077-c455-4d6e-ad13-580a45abed97" />

本次更新重点是 DSP。ECHO Next 不再把 EQ 当成一个孤立的设置面板，而是把它升级成一套更清楚、更安全、更接近专业播放器工作流的 DSP 控制中心：用户能看到信号经过了哪些处理、哪些处理会影响 bit-perfect、哪里存在削波风险，以及关闭 DSP 后是否真的回到原生播放路径。

首先修复了用户提出的BUG,增加了一些排序方案 增加了增量扫描 
其次 增加了Final主题 需要持有FINAL耳机才可以使用哦~请给我发私信获取key!
<img width="2564" height="1578" alt="QQ_1780586196112" src="https://github.com/user-attachments/assets/2b7ad416-5314-44a7-b35c-688127d19695" />


## DSP 控制中心

- 新增独立 DSP 页面，并接入侧边栏导航；EQ 从设置页里的单一模块，升级为可长期扩展的 DSP 工作区。
- 将 DSP 按模块重新组织为 Headroom、EQ、耳机校正、FIR 房间校正、声道平衡和安全监控，用户不需要在一个超长 EQ 面板里找所有功能。
- 重构 EQ / DSP 的视觉层级，采用更接近 Roon 风格的侧栏与模块面板：左侧快速看链路状态，右侧进入对应处理模块。
- 补齐 DSP 页面中文与英文文案，让每个模块都能说明当前状态、下一步建议和对输出链路的影响。
- 内置 EQ 预设收敛为更核心的曲线，减少花哨但难以判断的预设，保留更适合作为调音起点的基础声音方向。

## 原生 DSP 链路

- 新增 `DspChain`，把 EQ、FIR 卷积、声道平衡、Headroom 与保护限幅整合为统一处理链，而不是各自散落在播放链路里。
- 新增 `DspHeadroomProcessor`，为高增益 EQ、FIR、声道处理预留数字余量，降低 DSP 后级削波概率。
- 原生 audio-host 已接入 DSP 链路，在实际 PCM 输出前统一处理样本，并继续保留未启用 DSP 时的直通路径。
- Audio Status 现在会明确上报 `dspActive`、`dspClippingRisk` 和 `dspLimiterProtecting`，播放器、状态抽屉和专业面板可以基于真实音频链路提示用户。
- Protect limiter 从“看起来危险”的提示升级为可解释的保护状态：待命、发现风险、正在保护输出都能区分显示。

## FIR 房间校正

- 支持导入 FIR / IR 文件用于房间校正，ECHO 会保存校正状态并通过原生 DSP 链路加载。
- 房间校正新增启用/关闭、Trim 调整、清除 IR、状态读取等完整控制路径。
- UI 会显示 IR 名称、采样率、tap 数、声道模式、延迟样本与输出峰值估算，方便判断校正是否真的生效。
- 房间校正启用时会明确标记 DSP active，并提示 bit-perfect 不再成立；关闭后回到未处理路径。
- 增加安全 Trim 建议，尤其在 FIR 输出存在增益风险时，优先引导降低 Trim，而不是让用户盲目开关。

## 耳机校正与 OPRA

- 新增 OPRA 耳机校正服务，可搜索耳机型号并把参数化校正曲线转换成 ECHO 可用的 EQ 预设。
- 新增耳机校正面板，支持选择型号、预览校正、应用到 EQ，并显示来源与兼容性提示。
- OPRA 参数会按 ECHO 当前安全范围做裁剪，不支持的滤波器会跳过并给出提示，避免把不可执行的曲线伪装成已完整应用。
- 耳机校正生成的 EQ 默认作为受管理预设，避免用户误改后还以为仍是原始校正曲线。
- 提供“转换为自定义 EQ”路径，想继续手工调音时可以脱离耳机校正锁定。
简短的说OPRA是什么:
你可以选择大奥曲线了! 

## Equalizer APO 导入导出

- 支持粘贴并解析 Equalizer APO 配置，把常见 Filter / GraphicEQ 写法转换为 ECHO 的 EQ 曲线。
- 支持导出普通 Equalizer APO 配置，也支持导出 GraphicEQ 格式，方便在 ECHO 与外部桌面音频工具之间迁移。
- 导入过程增加预览与错误提示，空内容、无法识别内容和超出范围的参数不会静默失败。
- EQ 曲线视图和参数面板同步适配 APO 导入后的频点、Q 值和增益，让导入结果能被继续编辑。

## bit-perfect 与输出安全

- DSP 页面、EQ 面板、播放器状态和专业音频面板都会更明确地区分“原生直通”和“DSP 路径”。
- 只要 EQ、FIR、声道平衡或耳机校正等 DSP 处理启用，界面会明确提示 bit-perfect 已关闭。
- Headroom 文案做了降噪：高增益 EQ 不再被夸张描述为严重风险，而是更准确地提示“有削波可能，建议预留余量”。
- 关闭 DSP 时不会因为 Headroom 或默认同步命令而压低音量、改动样本或触发多余原生处理，保留原生播放安全路径。
- 修正可选 DSP 状态同步逻辑：Room Correction 和 Channel Balance 都处于默认关闭状态时，不再向 native bridge 发送不必要的 DSP 控制命令。

## UI 与可用性

- EQ Simple mode 增加更容易理解的说明：开启时只处理启用的 DSP 模块，关闭后回到 native playback path。
- DSP 路径增加模块卡片、状态徽章、风险提示、下一步建议和实时指标，减少“声音被处理了但用户不知道”的情况。
- EQ 曲线交互继续打磨，31-band / PEQ / APO 导入后的曲线更容易观察和编辑。
- 设置页导航优化，DSP / EQ 入口更清楚；曲库加载也被延后，减少进入设置时被大库扫描拖慢的概率。

## 非 DSP 相关补充

- 新增 AMLL TTML 歌词 provider，扩展歌词匹配来源。
- 修复专辑和歌手详情页返回路径，减少从详情页返回列表时丢上下文的问题。
- 移除过期 roadmap 与评估文档，降低文档噪音，避免旧计划误导后续开发。
