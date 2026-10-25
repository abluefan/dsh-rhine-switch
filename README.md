# dsh-rhine-switch

给 `dsh-rhine-splash` 提供折叠式皮肤开关面板。

## 为什么需要它

`rhine-splash` 把设置卡片注册到 `plugins.row.config`，但 DSH 0.2.1-rc.2 的插件页已经没有那个 slot ⇒ 卡片永远不会出现。

本插件把同样的控件搬到**设置侧栏**（`settings.section`），补上这个缺口。

## 可控制项

开屏动画、界面主题、品牌、Logo、推理滑桿、计费、时长、退场动画等，逐项开关。

写入 `rhine-splash` 的 profile 配置，全部字段 volatile ⇒ **立即生效、不重启**。

## 安装

### ① 通过插件市场（推荐）

在 [awesome-dsh-plugin](https://awesome-dsh-plugin.com) 的目录里找到本插件，
或在 dsh 的 **插件 → 发现** 里搜索 `dsh-rhine-switch`，点安装。

### ② 手动安装

任选一种，**不要两种同时用**：

**A. 复制 + 手写 insert（适合本地开发）**

1. 把本目录复制到 `$DSH_HOME/profiles/web/node_modules/dsh-rhine-switch/`
2. 在 `$DSH_HOME/profiles/web/cordis.patch.yml` 加：

   ```yaml
   - insert:
       - id: rhine-switch
         name: 'dsh-rhine-switch'
   ```

3. 重启 dsh，或让 Loader 重载配置

**B. `dsh plugin add`（需要包已发布到 npm）**

```sh
dsh plugin --profile web add dsh-rhine-switch
```

> ⚠ 用 B 之后，包名会进 `dsh.profile.bundles`，bundles 层会读本包自带的
> `cordis.patch.yml`；此时**不要**再做 A 的第 2 步 —— 同一个 id 会被插两次，
> DSH 启动会直接失败。

## 文件

| 文件 | 作用 |
|---|---|
| `index.js` | Host 入口（空壳，只为让 Loader 有入口挂 client 半边） |
| `lib/client.js` | 实际 UI —— 注册 `settings.section`，通过 `ctx.configForms.get('rhine-splash')` 读写 rhine 配置 |

## 依赖

- `dsh-rhine-splash`（第三方皮肤插件）
- DSH ≥ 0.2.1
