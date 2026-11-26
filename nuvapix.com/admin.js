// =====================================================
//  PAPAN PEMUKA ADMIN — urus pengguna & pakej (admin.html)
// =====================================================
(function () {
  const $ = (id) => document.getElementById(id);
  const t = (k, v) => I18N.t(k, v);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let data = null; // { me, users, stats, quotas }

  let toastT;
  function toast(msg, ms = 3400) {
    const el = $("toast"); el.textContent = msg; el.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => (el.hidden = true), ms);
  }
  const errText = (e) => t("adm.err", { e: e.code || e.message });
  const day = (s) => (s ? s.slice(0, 10) : t("adm.never"));
  const plusDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

  // ---------- Log masuk ----------
  function showGate(msgKey) {
    $("dash").hidden = true; $("gate").hidden = false; $("logoutBtn").hidden = !Account.user;
    $("gateSub").textContent = t(msgKey || "adm.gateSub");
  }
  $("gateForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, btn = f.querySelector("button");
    $("gateErr").hidden = true; btn.disabled = true;
    try {
      await Account.login(f.email.value.trim(), f.password.value);
      f.reset();
      await load();
    } catch (ex) {
      $("gateErr").textContent = t(`err.${["invalid", "disabled", "throttle", "network"].includes(ex.code) ? ex.code : "server"}`);
      $("gateErr").hidden = false;
    } finally { btn.disabled = false; }
  });
  $("logoutBtn").addEventListener("click", async () => { await Account.logout(); data = null; showGate(); });

  // ---------- Muat data ----------
  async function load() {
    try {
      data = await Account.call("admin.php?action=list");
    } catch (e) {
      data = null;
      if (e.code === "auth") return showGate();
      if (e.code === "forbidden") return showGate("adm.notAdmin");
      return toast(errText(e), 6000);
    }
    $("gate").hidden = true; $("dash").hidden = false; $("logoutBtn").hidden = false;
    render();
  }
  $("refresh").addEventListener("click", load);
  $("q").addEventListener("input", renderRows);
  $("filter").addEventListener("change", renderRows);

  // ---------- Paparan ----------
  function render() {
    if (!data) return;
    const me = data.users.find((u) => u.id === data.me);
    $("who").textContent = me ? me.email : "";
    const s = data.stats;
    $("stats").innerHTML = [["adm.stTotal", s.total], ["adm.stFree", s.free], ["adm.stBasic", s.basic], ["adm.stPro", s.pro], ["adm.stExpired", s.expired]]
      .map(([k, v]) => `<div class="adm-stat"><span>${esc(t(k))}</span><b>${v}</b></div>`).join("");
    renderRows();
  }

  function matches(u) {
    const q = $("q").value.trim().toLowerCase(), f = $("filter").value;
    if (q && !(u.email.toLowerCase().includes(q) || (u.name || "").toLowerCase().includes(q))) return false;
    if (!f) return true;
    if (f === "disabled") return u.disabled;
    if (f === "expired") return u.plan !== "free" && u.effectivePlan === "free";
    return u.effectivePlan === f;
  }

  function usageText(u) {
    const main = u.quota === null ? t("adm.usageUnl", { n: u.used })
      : t(u.effectivePlan === "free" ? "adm.usageFree" : "adm.usageMonth", { n: u.used, total: u.quota });
    return `${esc(main)}<span class="adm-sub">${esc(t("adm.usageTotal", { n: u.usedTotal }))}</span>`;
  }

  function rowHTML(u) {
    const isAdmin = u.role === "admin", self = u.id === data.me;
    const expired = u.plan !== "free" && u.effectivePlan === "free";
    const plans = ["free", "basic", "pro"].map((p) => `<option value="${p}" ${u.plan === p ? "selected" : ""}>${esc(t(`plan.${p}.name`))}</option>`).join("");
    return `<tr data-id="${u.id}" class="${u.disabled ? "is-disabled" : ""}">
      <td class="adm-user" data-label="${esc(t("adm.cUser"))}">
        <b>${esc(u.email)}${isAdmin ? '<span class="adm-badge">ADMIN</span>' : ""}${self ? ` <span class="muted small">(${esc(t("adm.you"))})</span>` : ""}</b>
        <input type="text" name="name" value="${esc(u.name)}" maxlength="80" placeholder="${esc(t("auth.name"))}" aria-label="${esc(t("auth.name"))}" style="margin-top:6px;width:100%" />
        <small>${esc(t("adm.joined", { d: day(u.createdAt) }))} · ${esc(t("adm.lastLogin", { d: day(u.lastLogin) }))}</small>
      </td>
      <td data-label="${esc(t("adm.cPlan"))}">
        <select name="plan" ${isAdmin ? "disabled" : ""} aria-label="${esc(t("adm.cPlan"))}">${plans}</select>
        ${expired ? `<span class="adm-sub adm-warn">${esc(t("adm.expired"))}</span>` : ""}
      </td>
      <td data-label="${esc(t("adm.cExpires"))}">
        <input type="date" name="planExpires" value="${esc(u.planExpires || "")}" ${isAdmin || u.plan === "free" ? "disabled" : ""} aria-label="${esc(t("adm.cExpires"))}" />
        <span class="adm-sub">${esc(t("adm.noExpiry"))}</span>
      </td>
      <td data-label="${esc(t("adm.cUsage"))}">${usageText(u)}</td>
      <td data-label="${esc(t("adm.cStatus"))}">
        <label class="adm-check"><input type="checkbox" name="disabled" ${u.disabled ? "checked" : ""} ${self ? "disabled" : ""} /> ${esc(t("adm.disabled"))}</label>
      </td>
      <td data-label="${esc(t("adm.cActions"))}">
        <div class="adm-acts">
          <button type="button" class="save" data-act="save">${esc(t("adm.save"))}</button>
          <button type="button" data-act="reset">${esc(t("adm.reset"))}</button>
          <button type="button" data-act="pw" ${isAdmin ? "disabled" : ""}>${esc(t("adm.pw"))}</button>
          <button type="button" class="del" data-act="del" ${isAdmin || self ? "disabled" : ""}>${esc(t("adm.del"))}</button>
        </div>
      </td>
    </tr>`;
  }

  function renderRows() {
    if (!data) return;
    const list = data.users.filter(matches);
    $("rows").innerHTML = list.map(rowHTML).join("");
    $("empty").hidden = list.length > 0;
    $("count").textContent = t("adm.count", { n: list.length });
  }

  // Pakej berbayar tanpa tarikh: cadangkan 30 hari
  $("rows").addEventListener("change", (e) => {
    if (e.target.name !== "plan") return;
    const tr = e.target.closest("tr"), exp = tr.querySelector('[name="planExpires"]');
    exp.disabled = e.target.value === "free";
    if (e.target.value !== "free" && !exp.value) exp.value = plusDays(30);
  });

  // ---------- Tindakan ----------
  async function post(action, body) { return Account.call(`admin.php?action=${action}`, body); }
  function replaceUser(nu) { data.users = data.users.map((u) => (u.id === nu.id ? nu : u)); }

  $("rows").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-act]"); if (!btn) return;
    const tr = btn.closest("tr"), id = Number(tr.dataset.id), u = data.users.find((x) => x.id === id);
    const val = (n) => tr.querySelector(`[name="${n}"]`);
    const act = btn.dataset.act;
    try {
      if (act === "save" || act === "reset") {
        if (act === "reset" && !confirm(t("adm.resetConfirm", { email: u.email }))) return;
        btn.disabled = true;
        const r = await post("update", {
          id, plan: val("plan").value, planExpires: val("planExpires").value, name: val("name").value,
          disabled: val("disabled").checked, resetUsage: act === "reset",
        });
        replaceUser(r.user);
        await load(); // kemas kini statistik
        toast(t("adm.saved", { email: u.email }));
      } else if (act === "pw") {
        const pw = prompt(t("adm.pwPrompt", { email: u.email }));
        if (pw === null) return;
        if (pw.length < 8) return toast(t("err.password"));
        await post("password", { id, password: pw });
        toast(t("adm.pwDone", { email: u.email }));
      } else if (act === "del") {
        if (!confirm(t("adm.delConfirm", { email: u.email }))) return;
        await post("delete", { id });
        await load();
        toast(t("adm.deleted", { email: u.email }));
      }
    } catch (ex) {
      if (ex.code === "auth" || ex.code === "forbidden") return showGate();
      toast(errText(ex), 6000);
    } finally { btn.disabled = false; }
  });

  // ---------- Bahasa ----------
  function applyExtra() {
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
    if (!$("gate").hidden && !Account.user) $("gateSub").textContent = t("adm.gateSub");
    render();
  }
  document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => I18N.set(b.dataset.lang)));
  I18N.onChange(applyExtra);
  I18N.apply();

  Account.refresh().then(() => (Account.user ? load() : showGate()));
})();
