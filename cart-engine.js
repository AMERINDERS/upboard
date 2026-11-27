// Cart math. Used by cart.html in the browser and by the tests in Node.
// Codes are applied to a line in the order the salesperson added them, each on the running line price.
(function (root) {
  const TAX_RATE = 0.13; // Ontario HST

  const r2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
  const skuMatch = (sku, list) => !!list && list.some((s) => sku === s || sku.startsWith(s));

  function describe(rule) {
    switch (rule.type) {
      case "pct": return rule.value === 100 ? "Item becomes free" : rule.value + "% off the line price";
      case "regTarget": return "Line ends at " + rule.value + "% off the regular price";
      case "amt": return "$" + rule.value + " off" + (rule.per === "unit" ? " each" : " (once)");
      case "freeUnits": return rule.value === 1 ? "1 unit free" : "Up to " + rule.value + " units free";
      case "taxPct": return "$ off equal to " + rule.value + "% of the line price (we pay the tax)";
      default: return "Reference only - no discount";
    }
  }

  function lineCalc(line, codesByCode) {
    const qty = Math.max(1, Math.floor(+line.qty || 1));
    const unit = Math.max(0, +line.unitPrice || 0);
    const regUnit = Math.max(unit, +line.regUnit || 0);
    const base = r2(unit * qty);
    const reg = r2(regUnit * qty);
    let running = base;
    const steps = [];
    for (const code of line.codes || []) {
      const rule = codesByCode[code];
      let d = 0, note = "";
      if (!rule) { steps.push({ code, amount: 0, note: "Unknown code" }); continue; }
      switch (rule.type) {
        case "pct": d = running * rule.value / 100; break;
        case "regTarget": {
          const target = reg * (1 - rule.value / 100);
          d = running - target;
          if (d <= 0) note = "Already at or below " + rule.value + "% off regular";
          break;
        }
        case "amt": d = rule.per === "unit" ? rule.value * qty : rule.value; break;
        case "freeUnits": d = Math.min(rule.value, qty) * (running / qty); break;
        case "taxPct": d = running * rule.value / 100; break;
        default: note = "Reference only"; d = 0;
      }
      d = r2(Math.max(0, Math.min(d, running)));
      running = r2(running - d);
      steps.push({ code, amount: d, note });
    }
    return { qty, unit, base, reg, steps, discount: r2(base - running), total: running };
  }

  function cartCalc(lines, codesByCode, taxRate) {
    const rate = taxRate == null ? TAX_RATE : taxRate;
    let subtotal = 0, discounts = 0, net = 0, taxable = 0;
    const out = lines.map((l) => {
      const c = lineCalc(l, codesByCode);
      subtotal += c.base; discounts += c.discount; net += c.total;
      if (l.taxable !== false) taxable += c.total;
      return c;
    });
    subtotal = r2(subtotal); discounts = r2(discounts); net = r2(net); taxable = r2(taxable);
    const tax = r2(taxable * rate);
    return { lines: out, subtotal, discounts, net, taxable, tax, total: r2(net + tax), rate };
  }

  // Can this code go on this line? Returns { ok, errors[], warnings[] }.
  function checkCode(rule, line, todayISO) {
    const errors = [], warnings = [];
    if (!rule) return { ok: false, errors: ["Code not found on the cheat sheets"], warnings };
    if (rule.type === "info") errors.push("Reference only - this is not a discount code");
    const sku = String(line.sku || "").toUpperCase();
    const have = line.codes || [];
    if (have.includes(rule.code)) errors.push(rule.code + " is already on this item");
    if (rule.skus && !skuMatch(sku, rule.skus)) errors.push("Only works on: " + rule.skus.join(", ") + (sku ? " (this item is " + sku + ")" : ""));
    if (rule.excludeSkus && skuMatch(sku, rule.excludeSkus)) errors.push(sku + " is excluded from " + rule.code);
    for (const c of rule.conflicts || []) if (have.includes(c)) errors.push("Cannot be combined with " + c + " (already on this item)");
    if (rule.softSkus && sku && !skuMatch(sku, rule.softSkus)) warnings.push("Sheet lists: " + rule.softSkus.join(", ") + " - this item is " + sku);
    if (todayISO && rule.to && todayISO > rule.to) warnings.push("EXPIRED - this offer ended " + rule.to);
    if (todayISO && rule.from && todayISO < rule.from) warnings.push("NOT STARTED - this offer starts " + rule.from);
    if (rule.verify) warnings.push("Needs checking: " + rule.verify);
    const regU = +line.regUnit || 0, unitP = +line.unitPrice || 0;
    if (rule.type !== "info" && regU > unitP && unitP > 0)
      warnings.push("This item is already on sale on the website (reg. $" + regU.toFixed(2) + ", now $" + unitP.toFixed(2) + "). Many offers exclude discounted items - make sure this code still applies.");
    if (line.kind === "warranty") warnings.push("This is a warranty line");
    return { ok: errors.length === 0, errors, warnings };
  }

  function warrantyOptions(cat, price) {
    // rows: [min, max, codeA, priceA, codeB, priceB]; min may be a text label (choose by hand)
    return cat.rows.map((r, i) => {
      const fixed = typeof r[0] === "number";
      const inBand = fixed && price >= r[0] && (r[1] == null || price <= r[1]);
      const label = cat.bySize ? r[0] : fixed ? "$" + r[0].toLocaleString() + (r[1] == null ? " & over" : " - $" + r[1].toLocaleString()) : r[0];
      const plans = cat.bySize ? [{ name: cat.plans[0], code: r[1], price: r[2] }]
        : [cat.plans[0] && r[2] ? { name: cat.plans[0], code: r[2], price: r[3] } : null,
           cat.plans[1] && r[4] ? { name: cat.plans[1], code: r[4], price: r[5] } : null].filter(Boolean);
      return { i, label, inBand, plans };
    });
  }

  const api = { TAX_RATE, r2, lineCalc, cartCalc, checkCode, describe, warrantyOptions, skuMatch };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CartEngine = api;
})(this);
