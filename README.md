# Shavit Timer Replay Viewer

用于在网页端观看玩家的 Bhop/Surf 回放记录，适用于 2025 年的 Shavit Timer 系列插件。

## 示例网站

🔗 [https://teasofficial.github.io/ShavitTimerReplayViewer/](https://teasofficial.github.io/ShavitTimerReplayViewer/)

## 功能特性

- **3D 地图渲染**：基于 WebGL 在浏览器中渲染 Source 引擎地图（BSP → JSON 导出）
- **回放播放**：加载 `.replay` 二进制文件，实时回放玩家操作
- **平滑运动插值**：使用 Hermite 曲线对 tick 之间进行平滑插值
- **按键显示**：实时展示玩家的按键操作（WASD、跳跃、蹲下等）
- **速度/同步率**：显示玩家的速度与同步率统计
- **自由视角**：支持第三人称固定视角和自由视角（FreeCam），按 `X` 切换
- **播放控制**：
  - 播放/暂停（鼠标点击或空格键）
  - 多档播放速度调节（-5x ~ 10x，支持倒放）
  - 进度条拖拽跳转
- **运动轨迹线**：自由视角下显示玩家完整运动路径
- **全屏模式**：按 `F` 进入全屏

## 支持的插件

本项目兼容以下 SourceMod 计时器插件：

| 插件 | 类型 | Tickrate | 格式版本 |
|---|---|---|---|
| [shavitush/bhoptimer](https://github.com/shavitush/bhoptimer) | Bhop | 100 Tick | `9:{SHAVITREPLAYFORMAT}{FINAL}` |
| [bhopppp/Shavit-Surf-Timer](https://github.com/bhopppp/Shavit-Surf-Timer) V10 | Surf | 66 Tick | `10:{SHAVITREPLAYFORMAT}{FINAL}` |
| [bhopppp/Shavit-Surf-Timer](https://github.com/bhopppp/Shavit-Surf-Timer) V11 | Surf | 66 Tick | `11:{SHAVITREPLAYFORMAT}{FINAL}` |

## 快速开始

### 直接使用

通过 URL 参数加载回放：

```
https://teasofficial.github.io/ShavitTimerReplayViewer/?replay=./replays/bhop_bfur.replay
```

### 本地构建

```bash
# 1. 复制并编辑配置
cp config.template.sh config.sh
# 编辑 config.sh 设置部署目录等参数

# 2. 构建
bash build.sh
```

构建流程：
1. `tsc` 编译 TypeScript 源码
2. 复制 `js/`、`styles/`、`images/` 到目标目录
3. 使用 `sed` 替换 `index.template.html` 中的模板变量生成最终页面

### 项目结构

```
├── src/                    # TypeScript 源码
│   ├── BinaryReader.ts     # 二进制数据读取器
│   ├── ReplayFile.ts       # Replay 文件解析（支持多版本格式）
│   ├── ReplayViewer.ts     # 核心播放器（继承自 SourceUtils.MapViewer）
│   ├── ReplayControls.ts   # 播放控制条（进度、速度等）
│   ├── KeyDisplay.ts       # 按键显示覆盖层
│   ├── OptionsMenu.ts      # 设置菜单
│   ├── RouteLine.ts        # 运动轨迹线渲染
│   ├── Event.ts            # 事件系统（Event / ChangedEvent）
│   ├── Utils.ts            # 数学工具（Hermite 插值等）
│   ├── js/                 # 第三方 JS 库
│   │   ├── facepunch.webgame.js  # Facepunch WebGame 引擎
│   │   └── sourceutils.js        # Source 引擎地图工具
│   ├── styles/             # CSS 样式
│   └── images/             # 图标资源
├── replays/                # 示例回放文件
│   ├── bhop_bfur.replay
│   ├── bhop_enlightened.replay
│   └── surf_anoobis*.replay
├── maps/                   # 导出地图数据
│   ├── bhop_bfur/
│   ├── bhop_enlightened/
│   └── surf_anoobis/
├── index.template.html     # HTML 模板
├── build.sh                # 构建脚本
├── config.template.sh      # 构建配置模板
└── tsconfig.json           # TypeScript 配置
```

## 使用说明

### URL 参数

| 参数 | 说明 |
|---|---|
| `replay` | 回放文件 URL（支持相对路径和绝对路径） |

### 快捷键

| 按键 | 功能 |
|---|---|
| 鼠标左键点击画面 | 播放/暂停 |
| `Space` | 播放/暂停 |
| `X` | 切换固定视角/自由视角 |
| `F` | 切换全屏 |
| 鼠标拖拽 | 自由视角下旋转/缩放 |

## 技术说明

### 回放文件格式

回放文件为二进制格式，结构如下：

| 字段 | 类型 | 说明 |
|---|---|---|
| header | string | 格式头，以 `\n` 结尾 |
| mapName | string | 地图名称，以 `\0` 结尾 |
| style | uint8 | 模式 |
| track | uint8 | 赛道（0 = 主赛道） |
| preframes | int32 | 预帧数 |
| size | int32 | 总 tick 数 |
| time | float32 | 完成时间（秒） |
| steamid | int32 | 玩家 Steam ID |
| ...header padding | | 根据版本不同 |
| tickData[] | | 每 tick 的玩家数据 |

每个 Tick 数据（40-44 字节）：

| 字段 | 类型 | 大小 |
|---|---|---|
| position | Vector3 (float×3) | 12 字节 |
| angles | Vector2 (float×2) | 8 字节 |
| buttons | int32 | 4 字节 |
| flags | int32 | 4 字节 |
| movetype | int32 | 4 字节 |

### Tickrate 说明

- **Bhop**：100 Tick（100 tick/s）
- **Surf**：66 Tick（66 tick/s）

Tickrate 设置不正确会导致回放文件解析错乱。如需修改，请编辑 [src/ReplayFile.ts](src/ReplayFile.ts) 中对应的 `tickRate` 值。

## 开源协议

[MIT License](LICENSE) — 开源网站，禁止倒卖。

## 致谢

- 基于 [Facepunch.WebGame](https://github.com/Facepunch/WebGame) 引擎
- 使用 [lz-string](https://github.com/pieroxy/lz-string) 进行数据压缩
