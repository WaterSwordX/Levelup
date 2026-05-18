import { FolderTree, PenLine, Timer, BarChart3, Target, Award, Download, Clock, LayoutDashboard, Lightbulb, Share2 } from 'lucide-react'
import RevealSection from '../components/RevealSection'

const sections = [
  {
    icon: FolderTree,
    title: '技能分类',
    color: '#E8941A',
    steps: [
      '进入「分类」页面，点击右上角「添加大类」创建顶级分类，如：音乐、编程、绘画',
      '鼠标悬停在分类上，点击「+」图标可添加子分类，支持无限细分',
      '例如：音乐 → 编曲 → 混音 → 人声处理',
      '每个分类可设置颜色，方便视觉区分',
      '悬停时点击奖杯图标可跳转详情页，查看里程碑和分享卡片',
      '点击「编辑」可修改名称和颜色，点击「删除」会同时删除所有子分类',
    ],
  },
  {
    icon: PenLine,
    title: '记录事件',
    color: '#4ECDC4',
    steps: [
      '进入「记录」页面',
      '从分类选择器中选择一个分类（可选任意层级）',
      '填写「做了什么」描述（可选）',
      '输入时长（单位：分钟），选择日期',
      '点击「添加记录」保存',
      '下方会显示所有历史记录，可随时删除',
    ],
  },
  {
    icon: Timer,
    title: '专注计时',
    color: '#A78BFA',
    steps: [
      '进入「专注」页面',
      '先选择一个技能分类',
      '点击「开始」按钮开始计时——即便切到后台，计时也会用系统时间校准',
      '专注过程中可「暂停」和「继续」，支持多段累加',
      '点击「结束」完成计时，时长超过 30 秒即可保存',
      '保存时可补充描述和开始时间（均为可选）',
      '专注记录会自动同步到连击——今天有记录，连击就不断',
    ],
  },
  {
    icon: Target,
    title: '目标设定',
    color: '#E86B6B',
    steps: [
      '在「分类」页面，鼠标悬停在任意分类上',
      '点击「靶心」图标打开目标设定',
      '输入目标小时数（如：500 小时）',
      '保存后，看板页面会显示目标进度条和完成百分比',
      '可随时修改或清除目标',
    ],
  },
  {
    icon: LayoutDashboard,
    title: '看板与自定义',
    color: '#E8941A',
    steps: [
      '首页「看板」展示你的整体数据概览',
      '顶部五张卡片：今日、本周、本月、连击天数、总计投入时间',
      '「连击」卡片显示你连续打卡的天数——今天只要有记录，连击就不会断',
      '即便今天只练了 5 分钟，连击依然在，这在心理学上比总时长更能促进行为坚持',
      '点击右上角「自定义看板」进入编辑模式，可自由显示/隐藏各个区块',
      '可控制的区块：计时日、今日数据、里程碑、目标进度、技能总览、最近记录',
      '点击眼睛图标切换显示/隐藏，配置自动保存——打造属于你自己的看板',
    ],
  },
  {
    icon: Share2,
    title: '分类详情与分享卡片',
    color: '#3B82F6',
    steps: [
      '在看板或分类页面点击任意技能分类，进入详情页',
      '顶部「技能卡片」展示该技能的：累计投入、坚持天数、记录次数、目标进度',
      '点击「保存为图片」可将卡片导出为 PNG，用于分享或留念',
      '可设定技能的「开始日期」，卡片会自动计算「已坚持 X 天」',
      '设定开始日期后，修改或清除都很方便——这是个可选设定，不强制',
      '时间记录列表显示每次练习的日期、开始时间和时长',
    ],
  },
  {
    icon: BarChart3,
    title: '统计图表',
    color: '#4ECDC4',
    steps: [
      '进入「统计」页面查看可视化数据',
      '饼图：各分类的时间占比',
      '柱状图：过去 4 周的每周投入趋势',
      '热力图：过去 90 天的每日活跃情况（颜色越深投入越多）',
    ],
  },
  {
    icon: Award,
    title: '里程碑成就',
    color: '#A78BFA',
    steps: [
      '当某个技能累计达到特定时间（1h、10h、50h、100h、200h、500h、1000h 等）时，自动生成成就卡片',
      '在看板「里程碑」区块和分类详情页均可查看成就卡片',
      '从分类页点击分类旁的奖杯图标，可直接跳转到该分类的里程碑时间轴',
      '进入分类详情页后，可在「自定义里程碑」区域为该技能单独设定专属阈值',
      '例如：给「钢琴」单独设定 60h、150h、365h 的里程碑',
      '每张成就卡片都支持「保存为图片」导出 PNG，方便分享或留念',
    ],
  },
  {
    icon: Download,
    title: '数据导出',
    color: '#E86B6B',
    steps: [
      '进入「统计」页面，右上角有两个导出按钮',
      '「导出CSV」：下载表格文件，可用 Excel 打开',
      '「导出PDF」：在新窗口打开格式化报告，用浏览器的「打印」功能保存为 PDF',
    ],
  },
  {
    icon: Clock,
    title: '数据说明',
    color: 'var(--slate-ghost)',
    steps: [
      '所有数据保存在浏览器本地（localStorage），不会上传到任何服务器',
      '清除浏览器缓存会导致数据丢失，建议定期使用「导出CSV」备份',
      '子分类的时间会自动汇总到父分类中',
      '同一浏览器的不同标签页共享同一份数据',
    ],
  },
]

export default function Guide() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <RevealSection>
        <div>
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
          >
            使用说明
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--silver-mist)' }}>
            Levelup 帮助你记录在各类技能上的时间投入，让积累看得见。
          </p>
        </div>
      </RevealSection>

      <div className="space-y-3">
        {sections.map((section, i) => (
          <RevealSection key={section.title} delay={i * 30}>
            <div className="p-5" style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${section.color}12` }}
                >
                  <section.icon size={16} style={{ color: section.color }} />
                </div>
                <h3
                  className="text-sm font-semibold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
                >
                  {section.title}
                </h3>
              </div>
              <ol className="space-y-1.5 pl-12">
                {section.steps.map((step, j) => (
                  <li key={j} className="text-xs list-decimal" style={{ color: 'var(--silver-mist)' }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </RevealSection>
        ))}
      </div>

      <RevealSection delay={150}>
        <div
          className="p-5"
          style={{
            background: 'var(--carbon-base)',
            border: '1px solid var(--ember-ghost)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <h3
            className="text-sm font-semibold flex items-center gap-2 mb-3"
            style={{ color: '#E8941A' }}
          >
            <Lightbulb size={15} />
            小贴士
          </h3>
          <ul className="space-y-1.5 text-xs" style={{ color: 'var(--silver-mist)' }}>
            <li className="flex items-start gap-2">
              <span style={{ color: '#E8941A' }}>·</span>
              每天坚持记录，哪怕只有 5 分钟——保持连击比单次投入时长更重要
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: '#E8941A' }}>·</span>
              设定一个阶段性目标（如 100 小时），看着进度条前进会很有成就感
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: '#E8941A' }}>·</span>
              里程碑达成时记得保存成就卡片，记录你的成长轨迹
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: '#E8941A' }}>·</span>
              给技能设置「开始日期」，看坚持了多少天，会很有成就感
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: '#E8941A' }}>·</span>
              善用「自定义看板」功能，只保留你关心的区块，让看板更清爽
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: '#E8941A' }}>·</span>
              定期导出 CSV 备份数据，防止浏览器缓存丢失
            </li>
          </ul>
        </div>
      </RevealSection>
    </div>
  )
}
