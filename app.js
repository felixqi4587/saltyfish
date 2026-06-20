/* ===========================================================================
   app.js — shared backbone for all 1406rocks pages (KvK, gift codes, future…)
   Defines globals used by every page: helpers, the cloud base URL, the auth
   module (password is NEVER hardcoded — typed once, validated by the Worker,
   kept in sessionStorage), and a clock. New pages just <script src="app.js">.
   =========================================================================== */
window.WBASE = "https://1406rocks-plan.kingshot1406.workers.dev";

/* ---- tiny DOM/format helpers ---- */
window.$ = function (i) { return document.getElementById(i); };
window.esc = function (s) { return (s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); };
window.pad = function (n) { return (n < 10 ? "0" : "") + n; };
window.clk = function (ms) { var d = new Date(ms); return pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + pad(d.getUTCSeconds()); };
window.toast = function (t) { var el = $("toast"); if (!el) return; el.textContent = t; el.classList.add("show"); setTimeout(function () { el.classList.remove("show"); }, 2200); };

/* ---- auth: the admin password is validated server-side and held in sessionStorage,
        so it is never written into the public page source ---- */
window.PW_KEY = "rocks1406_pw";
window.getPw = function () { try { return sessionStorage.getItem(PW_KEY) || ""; } catch (e) { return ""; } };
window.setPw = function (p) { try { sessionStorage.setItem(PW_KEY, p); } catch (e) {} };
window.clearPw = function () { try { sessionStorage.removeItem(PW_KEY); } catch (e) {} };
window.verifyPw = function (p) {
  return fetch(WBASE + "/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: p }) })
    .then(function (r) { return r.ok; }).catch(function () { return false; });
};
// POST to the Worker with the stored password injected
window.authedFetch = function (path, body) {
  body = body || {}; body.password = getPw();
  return fetch(WBASE + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
};
// ensure we have a valid password (prompt + verify if not). resolves true/false.
window.requireAuth = function (label) {
  if (getPw()) return Promise.resolve(true);
  var p = prompt(label || (window.t ? t("d_pw_admin") : "管理密码："));
  if (p == null) return Promise.resolve(false);
  return verifyPw(p).then(function (ok) { if (ok) { setPw(p); return true; } toast(window.t ? t("pw_wrong") : "密码错误"); return false; });
};

/* ===========================================================================
   i18n — site-wide 中文 / English. Default by browser language (non-zh → en),
   switchable anytime, remembered in localStorage. Pages mark static text with
   data-i18n / data-i18n-html / data-i18n-ph; dynamic JS strings use t()/tf().
   =========================================================================== */
window.LANG_KEY = "saltyfish_lang";
window.lang = (function () {
  try { var s = localStorage.getItem(LANG_KEY); if (s === "zh" || s === "en") return s; } catch (e) {}
  return (String(navigator.language || navigator.userLanguage || "").toLowerCase().indexOf("zh") === 0) ? "zh" : "en";
})();
window.I18N = {
  zh: {
    nav_home: "🐟 首页", nav_def: "🛡️ 防守", nav_gift: "🎁 礼包码", utc_local: "UTC · 本地",
    /* home */
    home_def_title: "防守支援", home_def_desc: "填你的行军时间 → 看几点发补兵、护住王城",
    home_gift_title: "礼包码", home_gift_desc: "全队自动兑换 · 官方 Discord 直连（需密码）",
    home_foot: "咸鱼小队自用工具 · 非官方、与 Century Games 无关 · 摸鱼有度，集结有我 🐟",
    q0: "躺平不是摆烂，是战略性休息 🐟", q1: "打不过就一起躺，集结照样支棱 💪", q2: "我们不生产战力，只是盐的搬运工 🧂",
    q3: "今天也是想被腌入味的一天", q4: "平时咸鱼，战时神兵 ⚔️", q5: "保护集结？那必须支棱起来！",
    /* defense */
    def_h1: "防守支援", def_sub: "咸鱼小队 · 几点发补兵、护住王城",
    def_hero_step: "先填这一个：你到王城的行军时间",
    def_hero_sub: "游戏里开一次集结、看一眼到王城的行军时间填进来 —— 下方就会告诉你 <b>每条敌鲸该几点发补兵</b>，正好在它落地后约 1 秒补满、把它弹回去。",
    unit_min: "分", unit_sec: "秒", def_usually: "通常 1 分多",
    def_legend: "🔴 敌鲸来袭<br>🛡️ 你的补兵<br>🏰 王城护盾",
    def_panel_title: "🛡️ 补兵时机尺（按你的行军算）",
    def_panel_hint: "挑当场正在来袭的那条敌鲸，照大字发兵。🟢=你发兵（最关键）；绿色带=你的行军；🔴🔵双色点=敌落地、过约1秒你补满。补兵带纯兵、可加速。",
    def_local_sum: "🔧 我自己设敌鲸（仅本机，临时试算）",
    def_local_hint: "默认用管理发布的敌鲸时间。想自己试算就在这里加/改（只存你本机、不影响别人）。",
    def_add_local: "＋ 加一条敌鲸", def_use_local: "用我本机的", def_use_cloud: "用管理发布的",
    def_admin_sum: "🎯 管理：设敌方鲸鱼并发布（需密码）",
    def_admin_hint: "设好敌鲸到王城的行军时间并发布，全队防守者打开就能看到、各自填自己行军即可。",
    def_admin_unlock: "🔓 输入密码解锁管理", def_add_enemy: "＋ 加敌鲸", def_publish: "📣 发布给全队",
    def_foot: "行军时间随距离与加速变化，请游戏内实测。咸鱼小队自用、非官方、与 Century Games 无关 🐟",
    /* defense dynamic */
    d_empty: "管理员还没发布敌方鲸鱼；战时可口头报点，或在上面「我自己设敌鲸」临时试算。",
    d_you_send: "你发兵", d_enemy_land: "敌落地", d_refilled: "补满✓",
    d_gather_band: "敌集结 5:00（加速）", d_send_now: "发兵！", d_your_march: "你行军 {x}", d_depart: "他发车", d_refill_plus: "+1秒 补满✓",
    d_short_gather: "集结剩 {x}", d_short_land: "发车后 {x}", d_short_imm: "发车后立刻", d_short_fill: "先填行军",
    d_cue_gather: "他集结剩 {x} 时发兵", d_cue_land: "他发车后 {x} 发兵",
    d_cue_imm: "他发车后立刻发（你很快）", d_cue_fill: "先填你的行军时间",
    d_note: "补兵在它落地后≈1秒到，正好补满 ✓", d_erow: "敌集结 5:00 · 你行军 {x}",
    d_lane_title: "🔴 {n} · 行军 {x}",
    d_ph_gather: "① 敌方集结中（加速）…", d_ph_send: "② 发兵！就是现在", d_ph_land: "③ 敌落地",
    d_ph_refill: "✅ 补满·弹回", d_ph_low: "③ 护盾告急→快补兵", d_ph_inc: "② 敌方来袭→盯落地",
    d_fx_send: "发兵！", d_fx_land: "敌落地", d_fx_refill: "补满！",
    d_gather_cd: "集结 {x}", d_land_cd: "落地 {x}",
    d_net_connecting: "连接云端中…", d_net_pub: "已连接 · {who} 于 {t} UTC 发布敌鲸",
    d_net_nopub: "已连接 · 管理还没发布敌鲸", d_net_off: "离线 · 用默认/本机",
    d_t_pub: "已发布 ✓", d_t_local: "已用本机敌鲸", d_t_cloud: "已用管理发布的", d_t_unlock: "已解锁管理 ✓",
    d_confirm_over: "有人刚发布了新版，覆盖？", d_pub_ok: "✓ 已发布给全队", d_pub_fail: "发布失败（密码或网络）", d_pub_neterr: "网络错误", d_publishing: "发布中…", d_whale_ph: "敌鲸名",
    d_enemy: "敌", d_whale: "敌鲸", d_admin: "管理", d_pw_admin: "管理密码：",
    /* gift */
    g_pw_admin: "管理密码：", g_roster_hint: "<b>只填 Player ID</b>（游戏内点左上角头像可看到），名字会自动获取并显示在右边。改动自动保存。",
    g_roster_empty: "还没有队员，点下方「＋ 加队员」，<b>只填 Player ID</b>，名字会自动获取。",
    g_ph_fid: "Player ID", g_name_loading: "名字自动获取…", g_name_query: "查询中…", g_name_fill: "填 Player ID",
    g_name_notfound: "查无此 ID", g_name_failed: "获取失败", pw_wrong: "密码错误",
    g_h1: "礼包码", g_sub: "咸鱼小队 · 全自动兑换", g_pw_gate: "管理密码（礼包码）：",
    g_gate_head: "需要管理密码", g_gate_sub: "礼包码兑换是管理功能，输入密码后才能进入 / 修改。", g_gate_btn: "输入密码进入", g_back_home: "← 返回首页",
    g_hero_head: "全自动兑换", g_hero_sub: "队员零操作。官方 Discord 直连每分钟读 + 三方源每 5 分钟兜底，发现新码<b>全队自动秒兑</b>。",
    g_discord_checking: "检查连接中…", g_token_sum: "⚙️ 设置 / 更换 官方 Discord Bot Token",
    g_token_hint: "粘 <b>1406rocks-codebot</b> 的 Bot Token，云端即每分钟直读你关注的官方发码频道。Token 只存你自己的云端。",
    g_ph_token: "粘贴 Bot Token", g_connect: "连接",
    g_roster_title: "👥 队员名单", g_add_member: "＋ 加队员", g_save_hint: "改动会自动保存到云端",
    g_codes_title: "🎟 当前可用礼包码", g_loading: "加载中…", g_codes_none: "暂无可用码", g_codes_failed: "加载失败",
    g_hist_sum: "📜 历史码（已过期 / 已用尽）", g_hist_usedup: "已用尽", g_hist_expired: "已过期",
    g_redeem_btn: "▶ 立即云端兑换全队", g_redeeming: "云端兑换中…（约几十秒）", g_redeem_wait: "正在云端给全队兑换，请稍候…",
    g_redeem_done: "云端兑换完成 ✓", g_redeem_fail: "兑换失败", g_neterr_timeout: "网络错误/超时",
    g_log_empty_roster: "名单为空——请先在上方添加队员（输入即自动保存到云端）。",
    g_log_no_codes: "暂无可兑换的礼包码（系统每分钟自动收码，有新码会自动兑换）。", g_log_none: "暂无结果。",
    g_log_detail: "兑换明细 · ", g_mode_auto: "自动", g_mode_discord: "Discord", g_mode_manual: "手动", g_new_redeemed: "本次新兑 ", g_got: "已得", g_id: "ID",
    st_ok: "✓ 刚兑换", st_already: "✓ 已兑换", st_expired: "码过期", st_invalid: "码无效", st_usedup: "已用尽", st_limited: "⚠ 限量抢光", st_bad_fid: "FID错误", st_rate: "限流稍后", st_capped: "超上限,下次", st_err: "失败",
    g_feed_sum: "📥 手动喂码（备用·看到码立刻抢）", g_feed_hint: "在官方 Discord 看到新码？把码或整段消息粘进来，云端立刻全队抢兑，不等巡检。",
    g_ph_ingest: "粘贴官方码 或 整段消息", g_grab_now: "⚡ 立即抢", g_feed_need: "先粘贴官方码或消息。", g_grabbing: "抢兑中…",
    g_feed_pushing: "正在把码推到云端、立即给全队抢兑…", g_feed_nocode: "没识别出码——直接把码本身粘进来再试。",
    g_feed_pushed1: "✓ 已推送 ", g_feed_pushed2: "，云端正在给全队抢兑。几秒后下方「立即云端兑换全队」可看到明细。",
    g_feed_pushed_toast: "已推送官方码，云端抢兑中 ⚡", g_feed_pushfail: "推送失败。",
    g_dc_unknown: "状态未知。", g_dc_notconn_err: "未连接：", g_dc_notconn: "尚未连接官方 Discord（粘贴 Bot Token 即可开启）。",
    g_dc_nochan: "（无可读频道）", g_dc_conn1: "● 已连接", g_dc_conn2: " · 每 1 分钟直读：", g_dc_statusfail: "状态加载失败。",
    g_dc_need: "先粘贴 Bot Token。", g_dc_connecting: "连接中…", g_dc_verifying: "正在验证 token 并读取可见频道…",
    g_dc_nochan_full: "（无可读频道，确认 bot 已在你服务器、能看到那个频道）", g_dc_connected1: "✓ 已连接！每分钟直读：",
    g_dc_conntoast: "官方 Discord 已连接 ✓", g_dc_connfail: "连接失败：", g_dc_tokinvalid: "token 无效",
    g_saving: "保存中…", g_saved_ok: "已保存（云端+本机）✓", g_saved_local: "已存本机，云端稍后重试", g_saved_localfail: "已存本机，云端失败（稍后重试）",
    g_foot: "礼包码由官方 Discord 直连 + 多个社区源自动收集；有效性以官方兑换接口实测为准。本工具为 1406 玩家自制、非官方、与 Century Games 无关。"
  },
  en: {
    nav_home: "🐟 Home", nav_def: "🛡️ Defense", nav_gift: "🎁 Gift Codes", utc_local: "UTC · Local",
    home_def_title: "Defense Support", home_def_desc: "Enter your march time → see when to reinforce & hold the castle",
    home_gift_title: "Gift Codes", home_gift_desc: "Auto-redeem for the squad · official Discord link (password)",
    home_foot: "Salty Fish squad's own tool · unofficial, not affiliated with Century Games 🐟",
    q0: "Lying flat isn't slacking — it's strategic rest 🐟", q1: "Can't beat 'em? Lie down together, still rally 💪",
    q2: "We don't make power, we just haul the salt 🧂", q3: "Another day hoping to get pickled just right",
    q4: "Salted fish by day, war gods by night ⚔️", q5: "Protect the rally? Time to step up!",
    def_h1: "Defense Support", def_sub: "Salty Fish · when to reinforce, hold the castle",
    def_hero_step: "① Fill this first: your march time to the castle",
    def_hero_sub: "Open a rally in-game, check your march time to the castle and enter it — below tells you <b>when to send reinforcements for each enemy whale</b>, refilling ~1s after it lands to bounce it back.",
    unit_min: "m", unit_sec: "s", def_usually: "usually ~1 min",
    def_legend: "🔴 Enemy whale<br>🛡️ Your refill<br>🏰 Castle shield",
    def_panel_title: "🛡️ Reinforcement timing (by your march)",
    def_panel_hint: "Pick the whale currently attacking and send by the big text. 🟢 = you send (most important); green band = your march; the 🔴🔵 two-tone dot = enemy lands, then you refill ~1s later. Send pure troops, speedups OK.",
    def_local_sum: "🔧 Set whales myself (local only, scratch)",
    def_local_hint: "Defaults to admin-published whale times. Add/edit here to try your own (local only, doesn't affect others).",
    def_add_local: "＋ Add a whale", def_use_local: "Use mine", def_use_cloud: "Use published",
    def_admin_sum: "🎯 Admin: set & publish enemy whales (password)",
    def_admin_hint: "Set enemy march times to the castle and publish; defenders just open it and fill their own march.",
    def_admin_unlock: "🔓 Enter password to unlock", def_add_enemy: "＋ Add enemy", def_publish: "📣 Publish to squad",
    def_foot: "March times vary by distance & speedups; verify in-game. Salty Fish's own, unofficial, not affiliated with Century Games 🐟",
    d_empty: "No enemy whales published yet; call them out in chat, or use “Set whales myself” above to try.",
    d_you_send: "You send", d_enemy_land: "Lands", d_refilled: "Refilled✓",
    d_gather_band: "Enemy gather 5:00 (rush)", d_send_now: "SEND!", d_your_march: "march {x}", d_depart: "they depart", d_refill_plus: "+1s refilled✓",
    d_short_gather: "gather -{x}", d_short_land: "after launch {x}", d_short_imm: "send now", d_short_fill: "fill march",
    d_cue_gather: "Send at their gather -{x}", d_cue_land: "Send {x} after they depart",
    d_cue_imm: "Send right after they depart (you're fast)", d_cue_fill: "Fill your march time first",
    d_note: "Refill arrives ~1s after it lands — exactly full ✓", d_erow: "Enemy gather 5:00 · your march {x}",
    d_lane_title: "🔴 {n} · march {x}",
    d_ph_gather: "① Enemy gathering (rush)…", d_ph_send: "② SEND! right now", d_ph_land: "③ Enemy lands",
    d_ph_refill: "✅ Refilled · bounced", d_ph_low: "③ Shield low → refill!", d_ph_inc: "② Incoming → watch landing",
    d_fx_send: "SEND!", d_fx_land: "Lands", d_fx_refill: "Refilled!",
    d_gather_cd: "gather {x}", d_land_cd: "land {x}",
    d_net_connecting: "Connecting…", d_net_pub: "Connected · {who} published at {t} UTC",
    d_net_nopub: "Connected · no whales published yet", d_net_off: "Offline · using local/default",
    d_t_pub: "Published ✓", d_t_local: "Using my local whales", d_t_cloud: "Using published whales", d_t_unlock: "Admin unlocked ✓",
    d_confirm_over: "Someone just published a newer version. Overwrite?", d_pub_ok: "✓ Published to squad", d_pub_fail: "Publish failed (password or network)", d_pub_neterr: "Network error", d_publishing: "Publishing…", d_whale_ph: "Enemy name",
    d_enemy: "Enemy ", d_whale: "Enemy whale", d_admin: "Admin", d_pw_admin: "Admin password:",
    g_pw_admin: "Admin password:", g_roster_hint: "<b>Player ID only</b> (tap your avatar top-left in-game to see it); the name is fetched automatically and shown on the right. Saved automatically.",
    g_roster_empty: "No members yet — tap “+ Add member” below and just enter a Player ID; the name fills in automatically.",
    g_ph_fid: "Player ID", g_name_loading: "fetching name…", g_name_query: "looking up…", g_name_fill: "enter Player ID",
    g_name_notfound: "no such ID", g_name_failed: "lookup failed", pw_wrong: "Wrong password",
    g_h1: "Gift Codes", g_sub: "Salty Fish · fully auto-redeem", g_pw_gate: "Admin password (gift codes):",
    g_gate_head: "Admin password required", g_gate_sub: "Gift-code redemption is an admin feature — enter the password to enter / edit.", g_gate_btn: "Enter password", g_back_home: "← Back home",
    g_hero_head: "Fully automatic", g_hero_sub: "Zero effort for members. Official Discord read every minute + third-party sources every 5 min as backup; new codes are <b>auto-redeemed for the whole squad instantly</b>.",
    g_discord_checking: "Checking connection…", g_token_sum: "⚙️ Set / change official Discord Bot Token",
    g_token_hint: "Paste the <b>1406rocks-codebot</b> Bot Token; the cloud then reads your followed official code channels every minute. The token is stored only in your own cloud.",
    g_ph_token: "Paste Bot Token", g_connect: "Connect",
    g_roster_title: "👥 Squad roster", g_add_member: "＋ Add member", g_save_hint: "Changes auto-save to the cloud",
    g_codes_title: "🎟 Active gift codes", g_loading: "Loading…", g_codes_none: "No active codes", g_codes_failed: "Load failed",
    g_hist_sum: "📜 History (expired / used up)", g_hist_usedup: "used up", g_hist_expired: "expired",
    g_redeem_btn: "▶ Redeem for whole squad now", g_redeeming: "Redeeming… (tens of sec)", g_redeem_wait: "Redeeming for the whole squad, please wait…",
    g_redeem_done: "Redeem complete ✓", g_redeem_fail: "Redeem failed", g_neterr_timeout: "Network error / timeout",
    g_log_empty_roster: "Roster empty — add members above first (auto-saves to cloud).",
    g_log_no_codes: "No codes to redeem yet (the system collects codes every minute and auto-redeems new ones).", g_log_none: "No results yet.",
    g_log_detail: "Redeem detail · ", g_mode_auto: "Auto", g_mode_discord: "Discord", g_mode_manual: "Manual", g_new_redeemed: "newly redeemed ", g_got: "got", g_id: "ID",
    st_ok: "✓ Just redeemed", st_already: "✓ Already", st_expired: "Expired", st_invalid: "Invalid", st_usedup: "Used up", st_limited: "⚠ Limit reached", st_bad_fid: "Bad FID", st_rate: "Rate-limited", st_capped: "Capped, next time", st_err: "Failed",
    g_feed_sum: "📥 Manual feed (backup · grab instantly)", g_feed_hint: "Saw a new code on official Discord? Paste the code or whole message; the cloud grabs it for the squad instantly.",
    g_ph_ingest: "Paste an official code or full message", g_grab_now: "⚡ Grab now", g_feed_need: "Paste a code or message first.", g_grabbing: "Grabbing…",
    g_feed_pushing: "Pushing the code to the cloud, grabbing for the squad…", g_feed_nocode: "No code detected — paste the code itself and retry.",
    g_feed_pushed1: "✓ Pushed ", g_feed_pushed2: " — the cloud is grabbing for the squad. Detail shows under “Redeem for whole squad now” in a few seconds.",
    g_feed_pushed_toast: "Code pushed, grabbing in the cloud ⚡", g_feed_pushfail: "Push failed.",
    g_dc_unknown: "Status unknown.", g_dc_notconn_err: "Not connected: ", g_dc_notconn: "Not connected to official Discord (paste a Bot Token to enable).",
    g_dc_nochan: "(no readable channels)", g_dc_conn1: "● Connected", g_dc_conn2: " · reading every minute: ", g_dc_statusfail: "Status load failed.",
    g_dc_need: "Paste a Bot Token first.", g_dc_connecting: "Connecting…", g_dc_verifying: "Verifying token and reading channels…",
    g_dc_nochan_full: "(no readable channels — make sure the bot is in your server and can see that channel)", g_dc_connected1: "✓ Connected! reading every minute: ",
    g_dc_conntoast: "Official Discord connected ✓", g_dc_connfail: "Connection failed: ", g_dc_tokinvalid: "invalid token",
    g_saving: "Saving…", g_saved_ok: "Saved (cloud + local) ✓", g_saved_local: "Saved locally, cloud will retry", g_saved_localfail: "Saved locally, cloud failed (will retry)",
    g_foot: "Codes are collected automatically from official Discord + several community sources; validity is per the official redeem API. Made by 1406 players, unofficial, not affiliated with Century Games."
  }
};
window.t = function (k) { var d = I18N[lang] || I18N.zh; return (d && d[k] != null) ? d[k] : ((I18N.zh && I18N.zh[k] != null) ? I18N.zh[k] : k); };
window.tf = function (k, vars) { var s = t(k); for (var p in vars) s = s.split("{" + p + "}").join(vars[p]); return s; };
window.applyI18n = function (root) {
  root = root || document;
  [].forEach.call(root.querySelectorAll("[data-i18n]"), function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
  [].forEach.call(root.querySelectorAll("[data-i18n-html]"), function (el) { el.innerHTML = t(el.getAttribute("data-i18n-html")); });
  [].forEach.call(root.querySelectorAll("[data-i18n-ph]"), function (el) { el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"))); });
  document.documentElement.lang = (lang === "zh") ? "zh-CN" : "en";
};
window.renderLangToggle = function () {
  var m = $("langtoggle"); if (!m) return;
  m.innerHTML = '<button class="langbtn' + (lang === "zh" ? " on" : "") + '" data-l="zh">中</button><button class="langbtn' + (lang === "en" ? " on" : "") + '" data-l="en">EN</button>';
  [].forEach.call(m.querySelectorAll("button"), function (b) { b.onclick = function () { setLang(b.getAttribute("data-l")); }; });
};
window.setLang = function (l) {
  lang = l; try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
  applyI18n(); renderLangToggle(); if (typeof window.onLangChange === "function") window.onLangChange();
};
window.initI18n = function () { applyI18n(); renderLangToggle(); };

/* ---- shared header clock (fills #utc / #loc if present) ---- */
window.startClock = function () {
  function tick() {
    var d = new Date(), u = $("utc"), l = $("loc");
    if (u) u.textContent = pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + pad(d.getUTCSeconds());
    if (l) l.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }
  tick(); setInterval(tick, 500);
};
