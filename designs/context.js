// Parses the policy context Cloudflare Gateway appends to the redirect URL
// ("Send policy context") and exposes it as window.BlockContext.
(function () {
  var params = new URLSearchParams(location.search);
  var get = function (k) { var v = params.get(k); return v ? v.trim() : ""; };
  var filters = { http: "HTTP policy", dns: "DNS policy", av: "Antivirus", l4: "Network policy" };

  var siteUri = get("cf_site_uri");
  var host = hostOf(siteUri);
  var validHost = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host);

  var categories = [];
  if (get("cf_application_name")) categories.push(get("cf_application_name"));
  (get("cf_request_categories") || get("cf_request_category_names")).split(",").forEach(function (c) {
    if (c.trim()) categories.push(c.trim());
  });

  var rows = [
    ["Rule ID", get("cf_rule_id")],
    ["Source IP", get("cf_source_ip")],
    ["Time", formatTime(new Date())],
    ["Blocked by", filters[get("cf_filter")] || get("cf_filter")],
    ["Account ID", get("cf_account_id")],
    ["User", get("cf_user_email")],
    ["Device ID", get("cf_device_id")],
    ["Request ID", get("cf_request_id")],
    ["Query ID", get("cf_query_id")],
    ["Connection ID", get("cf_connection_id")]
  ].filter(function (r) { return r[1]; });

  window.BlockContext = {
    siteUri: siteUri,
    host: siteUri ? host : "",
    radarUrl: validHost ? "https://radar.cloudflare.com/domains/domain/" + encodeURIComponent(host) : "",
    categories: categories,
    rows: rows,
    summary: function () {
      return (siteUri ? ["Site: " + siteUri] : [])
        .concat(rows.map(function (r) { return r[0] + ": " + r[1]; }))
        .join("\n");
    },
    copy: copyText,
    // Wires a button to copy the summary; label element text flips to "Copied".
    bindCopy: function (button, label, idleText) {
      button.addEventListener("click", function () {
        copyText(window.BlockContext.summary()).then(
          function () { label.textContent = "Copied"; },
          function () { label.textContent = "Copy failed"; }
        ).then(function () {
          setTimeout(function () { label.textContent = idleText; }, 1800);
        });
      });
    }
  };

  if (siteUri) document.title = "Access restricted · " + host;

  function hostOf(uri) {
    if (!uri) return "";
    try { return new URL(/^[a-z]+:\/\//i.test(uri) ? uri : "https://" + uri).hostname; }
    catch (e) { return uri; }
  }

  function formatTime(d) {
    var date = d.toLocaleDateString("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
    var time = d.toLocaleTimeString("en-US", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
    return date + " at " + time + " UTC";
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy") ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }
})();
