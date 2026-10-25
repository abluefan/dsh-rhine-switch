/**
 * dsh-rhine-switch —— dsh-rhine-splash 的开关面板（Host 半边）。
 *
 * 真正的 UI 在 lib/client.js：它注册到设置页的 `settings.section`，
 * 通过 `ctx.configForms.get('rhine-splash')` 读写 rhine 的配置。
 *
 * rhine-splash 自己把设置卡片注册到 `plugins.row.config`，而 0.2.1-rc.2
 * 的插件页已经没有那个 slot，所以卡片永远不会出现。本插件把同样的控件
 * 搬到设置侧栏，补上这个缺口。
 *
 * Host 半边不提供任何服务；它只需要存在，让 Loader 有 entry 可以挂载
 * client 半边（package.json 的 dsh.client.platform = 'web'）。
 *
 * @module dsh-rhine-switch
 */

export const name = 'dsh-rhine-switch'

/** 没有 Host 侧依赖。 */
export function apply() {}
