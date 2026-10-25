// dsh-rhine-switch client half
//
// 在设置侧栏注册一个「莱茵皮肤」折叠面板，逐项控制 dsh-rhine-splash：
//   开关：开屏动画 / 界面主题 / 品牌 / 推理滑桿 / 计费 / 允许跳过 / 刷新重播
//   数值：开屏时长（ms）
//   下拉：退场动画 / 开屏主题 / Logo 方案
//
// 数据通路：
//   · 读：ctx.configForms.get('rhine-splash').getSnapshot().value（Host 的 describe 镜像）
//   · 写：同一个 ConfigForm 的 set(field, value) → remote.settings.mutate
//   · rhine 的 Config 全部字段 volatile ⇒ 写完立即提交到运行中的 fiber.config，
//     不 remount、不拆会话；下次 pre-step / 重新渲染就读到新值。
//
// 格式：tsdown 产出的 lazy-CJS 约定 —— window.__ModuleLoader__ 外壳，
// factory 里普通模块代码；require('react') 拿的是 baseline external。
window.__ModuleLoader__.load({
  id: 'dsh-rhine-switch',
  factory: (require) => {
    const module = { exports: {} }
    const exports = module.exports
    const React = require('react')
    const h = React.createElement

    /** rhine-splash 在 profile 里的 entry id，也就是它的 settings namespace。 */
    const NS = 'rhine-splash'

    const SWITCHES = [
      ['enabled', '开屏动画', '启动时播放开屏动画'],
      ['uiTheme', '莱茵界面主题', '主界面配色与圆角'],
      ['brand', '品牌标志替换', '侧栏与会话页的 Logo'],
      ['effortSlider', '推理强度滑块', '输入框旁的滑块'],
      ['billing', '计费与余额', '侧栏左下角的费用卡片'],
      ['skippable', '允许跳过开屏', '按键跳过动画'],
      ['replayOnReload', '刷新时重播', 'F5 刷新也播放'],
    ]

    const SELECTS = [
      ['exit', '退场动画', [
        ['random', '随机'], ['doors', '舱门'], ['decode', '代码消散'],
        ['glitch', '故障撕裂'], ['iris', '六边形光圈'],
      ]],
      ['theme', '开屏主题', [['auto', '跟随界面'], ['light', '浅色'], ['dark', '深色']]],
      ['logo', 'Logo 方案', [['plate', '模块铭牌'], ['cell', '开放细胞']]],
    ]

    const COLORS = [
      ['accentLight', '浅色强调色'],
      ['accentDark', '深色强调色'],
    ]

    const border = '1px solid rgba(127,127,127,0.22)'
    const muted = 'rgba(127,127,127,0.9)'

    const rowStyle = {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '12px', padding: '7px 2px',
    }
    const labelStyle = { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }
    const titleStyle = { fontSize: '13px' }
    const hintStyle = { fontSize: '11px', color: muted }
    const controlStyle = {
      flex: '0 0 auto', fontSize: '12px', padding: '3px 6px',
      border, borderRadius: '6px', background: 'transparent', color: 'inherit',
    }

    /** 一行开关。 */
    function toggleRow(key, title, hint, value, set) {
      return h('div', { key, style: rowStyle }, [
        h('div', { key: 'l', style: labelStyle }, [
          h('div', { key: 't', style: titleStyle }, title),
          h('div', { key: 'h', style: hintStyle }, hint),
        ]),
        h('input', {
          key: 'c',
          type: 'checkbox',
          checked: value[key] !== false,
          style: { width: '16px', height: '16px', cursor: 'pointer' },
          onChange: (event) => { set(key, event.currentTarget.checked) },
        }),
      ])
    }

    /** 一行下拉。 */
    function selectRow(key, title, options, value, set) {
      return h('div', { key, style: rowStyle }, [
        h('div', { key: 't', style: titleStyle }, title),
        h('select', {
          key: 's',
          style: controlStyle,
          value: value[key] ?? options[0][0],
          onChange: (event) => { set(key, event.currentTarget.value) },
        }, options.map(([v, label]) => h('option', { key: v, value: v }, label))),
      ])
    }

    /** 一行数字（失焦或回车才提交，避免每按一个键就写一次 Host）。 */
    function numberRow(key, title, value, set, min, max, step) {
      return h(NumberRow, { key, field: key, title, value: value[key], set, min, max, step })
    }

    function NumberRow({ field, title, value, set, min, max, step }) {
      const [draft, setDraft] = React.useState(String(value ?? ''))
      React.useEffect(() => { setDraft(String(value ?? '')) }, [value])
      const commit = () => {
        const parsed = Number(draft)
        if (!Number.isFinite(parsed)) { setDraft(String(value ?? '')); return }
        const clamped = Math.min(max, Math.max(min, parsed))
        setDraft(String(clamped))
        set(field, clamped)
      }
      return h('div', { style: rowStyle }, [
        h('div', { key: 't', style: titleStyle }, title),
        h('input', {
          key: 'i',
          type: 'number', min, max, step, value: draft,
          style: Object.assign({ width: '96px' }, controlStyle),
          onChange: (event) => { setDraft(event.currentTarget.value) },
          onBlur: commit,
          onKeyDown: (event) => { if (event.key === 'Enter') event.currentTarget.blur() },
        }),
      ])
    }

    /** 折叠面板正文。 */
    function Body({ form }) {
      const [snap, setSnap] = React.useState(() => form.getSnapshot())
      React.useEffect(() => form.subscribe(() => setSnap(form.getSnapshot())), [form])

      const value = snap.value ?? {}
      const set = (field, next) => { form.set(field, next).catch(() => {}) }

      if (snap.status === 'loading') {
        return h('div', { style: { fontSize: '12px', color: muted, padding: '4px 2px' } }, '加载中…')
      }

      return h('div', { style: { paddingTop: '4px' } }, [
        h('div', { key: 'switches' }, SWITCHES.map(([key, title, hint]) =>
          toggleRow(key, title, hint, value, set))),
        h('div', {
          key: 'sep1',
          style: { height: '1px', background: 'rgba(127,127,127,0.18)', margin: '6px 0' },
        }),
        h('div', { key: 'numbers' }, [
          numberRow('duration', '开屏时长（ms）', value, set, 0, 15000, 100),
          numberRow('maxWait', '最长等待（ms）', value, set, 0, 20000, 100),
        ]),
        h('div', {
          key: 'sep2',
          style: { height: '1px', background: 'rgba(127,127,127,0.18)', margin: '6px 0' },
        }),
        h('div', { key: 'selects' }, SELECTS.map(([key, title, options]) =>
          selectRow(key, title, options, value, set))),
        h('div', { key: 'sep3', style: { height: '1px', background: 'rgba(127,127,127,0.18)', margin: '6px 0' } }),
        h('div', { key: 'texts' }, [
          textRow('title', '开屏主标题', value, set),
          textRow('subtitle', '开屏副标题', value, set),
          textRow('code', '角落编号', value, set),
        ]),
        h('div', { key: 'colors' }, COLORS.map(([key, title]) =>
          textRow(key, title, value, set))),
        h('div', {
          key: 'note',
          style: { marginTop: '8px', fontSize: '11px', color: muted, lineHeight: '1.5' },
        }, '改动立即写入 rhine-splash 的 profile 配置（volatile），不需要重启。清空文本框会恢复默认值。'),
      ])
    }

    /** 一行文本（失焦提交；清空 = 恢复默认）。 */
    function textRow(field, title, value, set) {
      return h(TextRow, { key: field, field, title, value: value[field], set })
    }

    function TextRow({ field, title, value, set }) {
      const [draft, setDraft] = React.useState(value ?? '')
      React.useEffect(() => { setDraft(value ?? '') }, [value])
      return h('div', { style: Object.assign({}, rowStyle, { alignItems: 'flex-start' }) }, [
        h('div', { key: 't', style: Object.assign({}, titleStyle, { paddingTop: '4px' }) }, title),
        h('input', {
          key: 'i',
          type: 'text',
          value: draft,
          placeholder: '默认',
          style: Object.assign({ width: '200px' }, controlStyle),
          onChange: (event) => { setDraft(event.currentTarget.value) },
          onBlur: () => {
            const next = draft.trim()
            if (next === '') setDraft('')
            set(field, next === '' ? undefined : next)
          },
          onKeyDown: (event) => { if (event.key === 'Enter') event.currentTarget.blur() },
        }),
      ])
    }

    /** 设置侧栏里的折叠 section。 */
    function Section({ form }) {
      const [open, setOpen] = React.useState(false)
      return h('div', null, [
        h('button', {
          key: 'head',
          type: 'button',
          onClick: () => setOpen((v) => !v),
          style: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '8px 2px', background: 'none', border: 'none',
            color: 'inherit', cursor: 'pointer', fontSize: '13px', textAlign: 'left',
          },
        }, [
          h('span', { key: 't' }, '莱茵皮肤'),
          h('span', { key: 'a', style: { color: muted, fontSize: '12px' } }, open ? '▾' : '▸'),
        ]),
        open ? h('div', { key: 'body' }, h(Body, { form })) : null,
      ])
    }

    const inject = ['slots', 'configForms']

    /**
     * 插件入口。
     * @param ctx - client cordis context。
     */
    function apply(ctx) {
      const slots = ctx.get('slots')
      const forms = ctx.get('configForms')
      if (slots === undefined || forms === undefined) return

      const form = forms.get(NS)
      slots.inject('settings.section', () => slots.register({
        name: 'settings.section',
        id: 'rhine-switch',
        order: 30,
        label: () => '莱茵皮肤',
        inject: () => ({ form }),
      }, Section))
    }

    exports.name = 'dsh-rhine-switch'
    exports.inject = inject
    exports.apply = apply
    return module.exports
  },
})
