// =====================================================
//  AKAUN PENGGUNA — sambungan ke api/ (PHP di hosting)
//  Account.status = null (tetamu) atau { user, plan, quota, used, remaining }
// =====================================================
window.Account = (function () {
  const API = "api/";
  let status = null;
  const listeners = [];

  async function call(path, body) {
    const opt = body === undefined
      ? { credentials: "same-origin" }
      : { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-Nuvapix": "1" }, body: JSON.stringify(body) };
    let res;
    try { res = await fetch(API + path, opt); }
    catch { const e = new Error("network"); e.code = "network"; throw e; }
    let data = null;
    try { data = await res.json(); } catch {}
    if (!res.ok || !data || data.ok === false) {
      const e = new Error(data?.error || "server");
      e.code = data?.error || "server"; e.data = data; e.httpStatus = res.status;
      throw e;
    }
    return data;
  }
  function set(s) { status = s || null; listeners.forEach((f) => f(status)); }

  return {
    get status() { return status; },
    get user() { return status?.user || null; },
    get isAdmin() { return status?.user?.role === "admin"; },
    onChange(f) { listeners.push(f); },
    call,
    async refresh() {
      try { const d = await call("auth.php?action=me"); set(d.status); }
      catch { /* API tiada (cth. fail tempatan): kekal sebagai tetamu */ }
      return status;
    },
    async login(email, password) { const d = await call("auth.php?action=login", { email, password }); set(d.status); return status; },
    async register(name, email, password) { const d = await call("auth.php?action=register", { name, email, password }); set(d.status); return status; },
    async logout() { try { await call("auth.php?action=logout", {}); } catch {} set(null); },
    // Rekod n gambar siap. Pulangkan false jika kuota habis.
    async consume(n = 1) {
      try { const d = await call("usage.php", { n }); set(d.status); return true; }
      catch (e) {
        if (e.data?.status) set(e.data.status);
        if (e.code === "quota") return false;
        if (e.code === "auth") set(null);
        throw e;
      }
    },
  };
})();
