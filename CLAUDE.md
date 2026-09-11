# CLAUDE.md — Shavit Timer Replay Viewer

## 项目概述

网页端 Source 引擎 Bhop/Surf 计时器回放查看器。加载 `.replay` 二进制文件，使用 WebGL 在浏览器中 3D 渲染玩家运动轨迹和地图。

- **演示站**: https://teasofficial.github.io/ShavitTimerReplayViewer/
- **语言**: TypeScript（源码）+ HTML/CSS
- **协议**: MIT

## 构建与部署

```bash
cp config.template.sh config.sh   # 编辑配置
bash build.sh                      # tsc 编译 → 复制 js/styles/images → sed 替换模板变量
```

输出 `index.html` 由 `index.template.html` + `sed` 变量替换生成（`${VERSION}`, `${RESOURCEDIR}`, `${BASEURL}`, `${MAPSURL}`）。

## 核心架构

```
src/
├── BinaryReader.ts    # DataView 封装，小端序二进制读取
├── ReplayFile.ts      # 回放文件解析（多版本格式） + TickData 类
├── ReplayViewer.ts    # 核心播放器，继承 SourceUtils.MapViewer
├── ReplayControls.ts  # 播放控制条 UI（进度条/速度/暂停/全屏/设置）
├── KeyDisplay.ts      # 按键显示覆盖层（WASD/跳跃/蹲下等）
├── RouteLine.ts       # 运动轨迹线（PvsEntity，分段 DebugLine）
├── OptionsMenu.ts     # 设置菜单面板
├── Event.ts           # Event / ChangedEvent 事件系统
├── Utils.ts           # Hermite 插值、角度差计算
├── js/                # 第三方库（facepunch.webgame.js, sourceutils.js）
├── styles/            # CSS
└── images/            # 图标（crosshair/play/pause/settings/fullscreen）
```

ReplayViewer 继承 `SourceUtils.MapViewer`（来自 sourceutils.js），后者提供 WebGL 地图渲染、相机控制、PVS 可见性裁剪等。

## 回放文件格式（二进制）

| 偏移 | 字段 | 类型 | 说明 |
|------|------|------|------|
| 0 | header | string(\n) | 格式版本头 |
| ~ | mapName | string(\0) | 地图名 |
| ~ | style | uint8 | 模式 |
| ~ | track | uint8 | 赛道 |
| ~ | preframes | int32 | 预帧数 |
| ~ | size | int32 | 总 tick 数 (+256) |
| ~ | time | float32 | 完成时间(秒) |
| ~ | steamid | int32 | Steam ID |

每个 Tick 数据: position(12B) + angles(8B) + buttons(4B) + flags(4B) + movetype(4B) = 32-44B

## 支持的格式版本

| 版本头 | 类型 | TickRate | TickSize | 插件 |
|--------|------|----------|----------|------|
| `9:{SHAVITREPLAYFORMAT}{FINAL}` | Bhop | 100 | 40 | shavitush/bhoptimer |
| `10:{SHAVITREPLAYFORMAT}{FINAL}` | Surf V10 | 66 | 44 | bhopppp/Shavit-Surf-Timer |
| `11:{SHAVITREPLAYFORMAT}{FINAL}` | Surf V11 | 66 | 44 | bhopppp/Shavit-Surf-Timer |

## 关键配置点

- **Tickrate 修改**: [src/ReplayFile.ts](src/ReplayFile.ts) — Bhop 100Tick, Surf 66Tick
- **地图 URL**: `viewer.mapBaseUrl = "./maps"`（index.html 或 index.template.html 中设置）
- **HUD 自动隐藏**: [src/ReplayControls.ts](src/ReplayControls.ts) `autoHidePeriod = 2`（秒）

## .gitignore 排除项

`/js`, `/styles`, `/images`, `config.sh`, `*.lnk` — 这些是构建产物或本地配置，不在仓库中。源码在 `src/` 下。

## 常用操作

- **修改 Tickrate**: 编辑 [src/ReplayFile.ts](src/ReplayFile.ts) 中对应分支的 `this.tickRate`
- **添加新地图**: 将导出的地图 JSON 放入 `maps/<mapname>/`，将回放文件放入 `replays/`
- **更新索引页的回放列表**: 编辑 [index.template.html](index.template.html)（或 [index.html](index.html)）中 `#replay-list` 的内容
- **修改播放器默认行为**: 编辑 [src/ReplayViewer.ts](src/ReplayViewer.ts) 中的属性默认值（`autoRepeat`, `showCrosshair`, `saveTickInHash` 等）
