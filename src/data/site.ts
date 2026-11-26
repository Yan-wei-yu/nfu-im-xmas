import type { Site } from './types.ts';

const OFFICIAL_ORIGIN = 'https://im.nfu.edu.tw';
const official = (path: string): string => `${OFFICIAL_ORIGIN}${path}`;
/** 官網路徑裡的「＿」是全形底線 */
const INDUSTRY = '/zh_tw/Industry%EF%BC%BFAcademic';
const SITE_URL = 'https://nfu-im-xmas.vercel.app';

export const site: Site = {
  meta: {
    title: '虎科資管 Merry Christmas｜聖誕版系網（非官方）',
    description:
      '國立虎尾科技大學資訊管理系的聖誕主題網站：六大亮點特色、2026 成果與數字。個人製作，非官方網站。',
    url: `${SITE_URL}/`,
    ogImage: `${SITE_URL}/og.png`,
    themeColor: '#050A1F',
  },
  nav: {
    brand: '虎科資管 × Xmas',
    items: [
      { label: '特色', url: '#highlights' },
      { label: '成果', url: '#gifts' },
      { label: '數字', url: '#stats' },
      { label: '聯絡', url: '#contact' },
    ],
    official: { label: '官方系網', url: `${OFFICIAL_ORIGIN}/` },
  },
  hero: {
    org: '國立虎尾科技大學 資訊管理系',
    eyebrow: '> merry_xmas()',
    titleLines: ['虎科資管', 'Merry Christmas'],
    subtitle: 'AI × 數據 × 商管',
    countdownFallback: '12/25 聖誕快樂',
    treeLabel: '資料聖誕樹：點吊飾看六大亮點特色',
  },
  highlightsSection: {
    title: '六大亮點特色',
    lead: '培養跨域力，成就未來力。點樹上的吊飾或下面的卡片，看每個特色的重點。',
  },
  highlights: [
    {
      id: 'ai',
      title: 'AI 智慧應用',
      tagline: '學習 AI 技術與應用，開創智慧未來',
      points: [
        '從智慧醫療、金融科技到生成式 AI，培養資料分析、機器學習與系統整合能力',
        '透過實作專題、產學合作與真實案例，學會用 AI 解決產業問題',
      ],
      links: [{ label: '到官網看更多', url: official('/zh_tw/about/ai') }],
      color: 'ice',
      icon: 'chip',
      ornament: { layer: 2, index: 0 },
    },
    {
      id: 'data',
      title: '大數據分析',
      tagline: '數據驅動決策，解鎖商業價值',
      points: [
        '結合 AI、資料分析、雲端與系統整合，把產業痛點變成可執行的方案',
        '實際專案：雲林縣政府住商 e 化用電健診、大林慈濟醫院自動化排班、台化靜電集塵設備參數優化',
      ],
      links: [{ label: '到官網看更多', url: official('/zh_tw/about/bigdata') }],
      color: 'pine',
      icon: 'chart',
      ornament: { layer: 3, index: 2 },
    },
    {
      id: 'intern',
      title: '企業實習',
      tagline: '與企業接軌，累積實戰經驗',
      points: [
        '日四技、技優專班、夜四技與碩士班都有學生到企業實習，分暑期與學期制',
        '實習單位橫跨科技、製造、醫療與農業生技，例如友達光電、上銀科技、欣銓科技',
      ],
      links: [{ label: '到官網看更多', url: official(`${INDUSTRY}/off_campus`) }],
      color: 'berry',
      icon: 'briefcase',
      ornament: { layer: 4, index: 1 },
    },
    {
      id: 'global',
      title: '海外交流',
      tagline: '拓展國際視野，豐富學習經驗',
      points: [
        '交換與研習足跡遍及美國、日本、德國、泰國、加拿大',
        '合作學校包括美國德州大學聖安東尼奧校區（UTSA）、日本近畿大學、群馬大學、泰國北曼谷國王科技大學',
      ],
      links: [{ label: '到官網看更多', url: official(`${INDUSTRY}/Overseas`) }],
      color: 'ice',
      icon: 'globe',
      ornament: { layer: 5, index: 3 },
    },
    {
      id: 'project',
      title: '專題競賽',
      tagline: '挑戰創新競賽，展現實力',
      points: [
        '大三開始做專題、參加校外競賽，累積 100+ 件專題與競賽成果',
        '近年題目：即時 AI 全端網頁生成、AI 機車震動故障診斷、食品影像辨識系統',
      ],
      links: [
        {
          label: '專題影片',
          url: 'https://www.youtube.com/@%E5%9C%8B%E7%AB%8B%E8%99%8E%E5%B0%BE%E7%A7%91%E6%8A%80%E5%A4%A7%E5%AD%B8-f4y/playlists',
        },
        { label: '專題列表', url: official('/zh_tw/s_info/u_project') },
      ],
      color: 'berry',
      icon: 'trophy',
      ornament: { layer: 6, index: 0 },
    },
    {
      id: 'career',
      title: '就業升學',
      tagline: '多元出路選擇，成就職涯夢想',
      points: [
        '四年藍圖：大一打基礎、大二練專業、大三做專題與考證照、大四實習或海外交換',
        '出路：AI 工程師、資料分析師、軟體工程師、ERP 顧問，也可以升碩士班或走 4+1 預研生',
      ],
      links: [{ label: '到官網看更多', url: official('/zh_tw/about/further') }],
      color: 'pine',
      icon: 'cap',
      ornament: { layer: 6, index: 5 },
    },
  ],
  giftsSection: {
    title: '2026 成果禮物盒',
    lead: '今年系上收到的禮物：亮眼成果，還有學長姐的故事。',
    video: {
      label: '60 秒認識虎科資管',
      url: official('/zh_tw/news/videos/%E8%B3%87%E8%A8%8A%E7%AE%A1%E7%90%86%E7%B3%BB%E7%B0%A1%E4%BB%8B-26697713'),
    },
    more: { label: '更多最新消息', url: official('/zh_tw/news') },
  },
  gifts: [
    {
      date: '2026-06-18',
      category: '亮眼成果',
      title: '胡念祖老師帶領學生產學技術交流',
      url: official(
        '/zh_tw/news/newstall/%E8%83%A1%E5%BF%B5%E7%A5%96%E8%80%81%E5%B8%AB%E5%B8%B6%E9%A0%98%E5%AD%B8%E7%94%9F%E7%94%A2%E5%AD%B8%E6%8A%80%E8%A1%93%E4%BA%A4%E6%B5%81-39106589',
      ),
    },
    {
      date: '2026-06-18',
      category: '亮眼成果',
      title: '資安升級：AI助力守護數位邊界',
      url: official(
        '/zh_tw/news/newstall/%E8%B3%87%E5%AE%89%E5%8D%87%E7%B4%9A-AI%E5%8A%A9%E5%8A%9B%E5%AE%88%E8%AD%B7%E6%95%B8%E4%BD%8D%E9%82%8A%E7%95%8C-47146575',
      ),
    },
    {
      date: '2026-06-18',
      category: '亮眼成果',
      title: '學生時期，就具備改變社會的千萬級影響力',
      url: official(
        '/zh_tw/news/newstall/%E5%AD%B8%E7%94%9F%E6%99%82%E6%9C%9F-%E5%B0%B1%E5%85%B7%E5%82%99%E6%94%B9%E8%AE%8A%E7%A4%BE%E6%9C%83%E7%9A%84%E5%8D%83%E8%90%AC%E7%B4%9A%E5%BD%B1%E9%9F%BF%E5%8A%9B-63026983',
      ),
    },
    {
      date: '2026-06-18',
      category: '亮眼成果',
      title: '產業對接：畢業即戰力，提早佈署職涯藍圖',
      url: official(
        '/zh_tw/news/newstall/%E7%94%A2%E6%A5%AD%E5%B0%8D%E6%8E%A5-%E7%95%A2%E6%A5%AD%E5%8D%B3%E6%88%B0%E5%8A%9B-%E6%8F%90%E6%97%A9%E4%BD%88%E7%BD%B2%E8%81%B7%E6%B6%AF%E8%97%8D%E5%9C%96-1482294',
      ),
    },
    {
      date: '2026-06-18',
      category: '學長姐故事',
      title: '本系碩士班同學申請美國德州大學聖安東尼奧分校（UTSA）碩士班雙聯學制成功通過',
      url: official(
        '/zh_tw/news/videos/%E6%9C%AC%E7%B3%BB%E7%A2%A9%E5%A3%AB%E7%8F%AD%E5%90%8C%E5%AD%B8%E7%94%B3%E8%AB%8B%E7%BE%8E%E5%9C%8B%E5%BE%B7%E5%B7%9E%E5%A4%A7%E5%AD%B8%E8%81%96%E5%AE%89%E6%9D%B1%E5%B0%BC%E5%A5%A7%E5%88%86%E6%A0%A1-UTSA-%E7%A2%A9%E5%A3%AB%E7%8F%AD%E9%9B%99%E8%81%AF%E5%AD%B8%E5%88%B6%E6%88%90%E5%8A%9F%E9%80%9A%E9%81%8E-78086612',
      ),
    },
    {
      date: '2026-06-17',
      category: '學長姐故事',
      title: '本系同學參加臺灣證券交易所「臺灣創新板 LOGO 設計徵選比賽」榮獲個人組第一名金獎',
      url: official(
        '/news/newstall/-%E8%B3%87%E7%AE%A1%E7%B3%BB-%E5%85%AC%E5%91%8A-%E7%8B%82%E8%B3%80-%E6%9C%AC%E7%B3%BB%E9%99%B3%E5%BD%A5%E6%9A%9F%E5%90%8C%E5%AD%B8%E5%8F%83%E5%8A%A0%E8%87%BA%E7%81%A3%E8%AD%89%E5%88%B8%E4%BA%A4%E6%98%93%E6%89%80-%E8%87%BA%E7%81%A3%E5%89%B5%E6%96%B0%E6%9D%BFLOGO%E8%A8%AD%E8%A8%88%E5%BE%B4%E9%81%B8%E6%AF%94%E8%B3%BD-%E6%A6%AE%E7%8D%B2%E5%80%8B%E4%BA%BA%E7%B5%84%E7%AC%AC%E4%B8%80%E5%90%8D%E9%87%91%E7%8D%8E-%E5%9C%8B%E7%AB%8B%E8%99%8E%E5%B0%BE%E7%A7%91%E6%8A%80%E5%A4%A7%E5%AD%B8-%E8%B3%87%E8%A8%8A%E7%AE%A1%E7%90%86%E7%B3%BB-38941858',
      ),
    },
  ],
  statsSection: { title: '數字見證實力' },
  stats: [
    { kind: 'ring', value: 95, suffix: '%', label: '畢業生升學／就業率' },
    { kind: 'count', value: 50, suffix: '+', label: '企業合作實習機會' },
    { kind: 'count', value: 100, suffix: '+', label: '專題競賽成果' },
    { kind: 'venn', parts: ['AI', '數據', '商管'], label: '跨域整合能力' },
  ],
  partnersSection: { title: '產學合作夥伴' },
  partners: ['IBM', 'SAP', 'Microsoft', 'Oracle', '雲林縣政府', '資策會', '工研院', '品印三維'],
  cta: {
    title: '下一個改變未來的人，也許就是你',
    lead: '加入虎科資管，開啟你的無限可能！',
    primary: { label: '了解課程', url: official('/zh_tw/course') },
    secondary: { label: '加入虎科資管 LINE', url: 'https://line.me/R/ti/p/@218jnlb' },
  },
  footer: {
    org: '國立虎尾科技大學 資訊管理系',
    address: '632 雲林縣虎尾鎮文化路 64 號',
    tel: '05-6315731',
    fax: '05-6364127',
    email: 'imoffice@nfu.edu.tw',
    quickLinks: [
      { label: '最新消息', url: official('/zh_tw/news') },
      { label: '系所簡介', url: official('/zh_tw/about') },
      { label: '師資簡介', url: official('/zh_tw/faculty') },
      { label: '課程特色', url: official('/zh_tw/course') },
      { label: '招生資訊', url: official('/zh_tw/admission') },
      { label: '學生園區', url: official('/zh_tw/s_info') },
      { label: '產學研究', url: official(INDUSTRY) },
    ],
    disclaimer:
      '本站為個人製作的聖誕主題非官方網站，內容整理自虎科資管系網（2026/11/26），正式資訊以系網為準。',
  },
};
