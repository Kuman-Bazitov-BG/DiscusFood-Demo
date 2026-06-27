import { formatPrice } from '../../lib/format'

// ── Seller (your store) details shown on every invoice ───────────────
export const SELLER = {
  name: 'Discus Fish',
  email: 'hello@discusfish.app',
  site: 'discusfish.app',
}

// ── Shapes used to render an invoice document ─────────────────────────
export interface InvoiceLine {
  name: string
  quantity: number
  unit_price_cents: number
}

export interface InvoiceOrder {
  order_number: string | null
  email: string | null
  created_at: string
  currency: string
  subtotal_cents: number
  shipping_cents: number
  discount_cents: number
  tax_cents: number
  amount_total_cents: number
  customer_note: string | null
  // Billing snapshot (business accounts)
  billing_company: string | null
  billing_vat_number: string | null
  billing_registration_number: string | null
  billing_contact_name: string | null
  billing_email: string | null
  billing_phone: string | null
  billing_address1: string | null
  billing_address2: string | null
  billing_city: string | null
  billing_state: string | null
  billing_postal_code: string | null
  billing_country: string | null
  // Shipping snapshot (fallback when no billing details)
  ship_name: string | null
  ship_phone: string | null
  ship_address1: string | null
  ship_address2: string | null
  ship_city: string | null
  ship_postal_code: string | null
  ship_country: string | null
  order_items: InvoiceLine[]
}

export interface InvoiceDoc {
  invoice_number: string
  issued_at: string
  total_cents: number
  currency: string
  pdf_url: string | null
  order_id: string
  order: InvoiceOrder | null
}

const esc = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  )

const fmtDate = (v?: string | null): string =>
  v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

/** Recipient email for the invoice — prefer billing, then order, then shipping name is no email. */
export function invoiceRecipient(doc: InvoiceDoc): string {
  return doc.order?.billing_email || doc.order?.email || ''
}

/** The "bill to" block as an array of non-empty lines. */
function billToLines(o: InvoiceOrder | null): string[] {
  if (!o) return []
  const useBilling = !!(o.billing_company || o.billing_contact_name || o.billing_address1)
  if (useBilling) {
    return [
      o.billing_company,
      o.billing_contact_name,
      o.billing_address1,
      o.billing_address2,
      [o.billing_postal_code, o.billing_city].filter(Boolean).join(' '),
      [o.billing_state, o.billing_country].filter(Boolean).join(', '),
      o.billing_vat_number ? `VAT: ${o.billing_vat_number}` : null,
      o.billing_registration_number ? `Reg: ${o.billing_registration_number}` : null,
      o.billing_email || o.email,
      o.billing_phone,
    ].filter((l): l is string => !!l && l.trim() !== '')
  }
  return [
    o.ship_name,
    o.ship_address1,
    o.ship_address2,
    [o.ship_postal_code, o.ship_city].filter(Boolean).join(' '),
    o.ship_country,
    o.email,
    o.ship_phone,
  ].filter((l): l is string => !!l && l.trim() !== '')
}

/** Build a self-contained, printable HTML document for an invoice. */
export function buildInvoiceHtml(doc: InvoiceDoc): string {
  const o = doc.order
  const cur = doc.currency
  const money = (c: number) => formatPrice(c, cur)
  const billTo = billToLines(o)

  const rows =
    (o?.order_items ?? [])
      .map(
        (it) => `
        <tr>
          <td>${esc(it.name)}</td>
          <td class="num">${it.quantity}</td>
          <td class="num">${money(it.unit_price_cents)}</td>
          <td class="num">${money(it.unit_price_cents * it.quantity)}</td>
        </tr>`,
      )
      .join('') ||
    `<tr><td colspan="4" class="muted">No line items recorded for this order.</td></tr>`

  const totalsRow = (label: string, value: string, strong = false, neg = false) => `
    <tr class="${strong ? 'total' : ''}">
      <td class="t-label">${esc(label)}</td>
      <td class="num">${neg ? '−' : ''}${value}</td>
    </tr>`

  const totals = o
    ? [
        totalsRow('Subtotal', money(o.subtotal_cents)),
        o.discount_cents ? totalsRow('Discount', money(o.discount_cents), false, true) : '',
        totalsRow('Shipping', money(o.shipping_cents)),
        o.tax_cents ? totalsRow('Tax', money(o.tax_cents)) : '',
        totalsRow('Total', money(o.amount_total_cents), true),
      ].join('')
    : totalsRow('Total', money(doc.total_cents), true)

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Invoice ${esc(doc.invoice_number)}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a; margin: 0; padding: 40px; background: #f1f5f9;
  }
  .sheet {
    max-width: 800px; margin: 0 auto; background: #fff; padding: 48px;
    border-radius: 12px; box-shadow: 0 10px 40px rgba(15,23,42,.08);
  }
  header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; }
  .brand { font-size: 22px; font-weight: 800; letter-spacing: -.02em; }
  .brand small { display:block; font-size: 12px; font-weight: 500; color:#64748b; margin-top:4px; }
  h1 { font-size: 28px; margin: 0 0 4px; letter-spacing: -.02em; }
  .doc-meta { text-align: right; font-size: 13px; color:#475569; }
  .doc-meta b { color:#0f172a; }
  .parties { display:flex; gap: 32px; margin: 36px 0 28px; }
  .parties section { flex: 1; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color:#94a3b8; font-weight:700; margin-bottom:8px; }
  .parties p { margin: 0; font-size: 13px; line-height: 1.55; color:#334155; }
  table.items { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
  table.items thead th {
    text-align:left; padding: 10px 12px; background:#f8fafc; color:#64748b;
    font-size: 11px; text-transform: uppercase; letter-spacing:.06em; border-bottom: 2px solid #e2e8f0;
  }
  table.items td { padding: 12px; border-bottom: 1px solid #eef2f7; }
  .num { text-align: right; white-space: nowrap; }
  .muted { color:#94a3b8; text-align:center; padding: 20px; }
  .totals { width: 280px; margin-left: auto; margin-top: 18px; border-collapse: collapse; font-size: 13px; }
  .totals td { padding: 7px 12px; }
  .totals .t-label { color:#64748b; }
  .totals .total td { border-top: 2px solid #e2e8f0; font-weight: 800; font-size: 15px; color:#0f172a; padding-top: 12px; }
  .note { margin-top: 32px; font-size: 12px; color:#475569; background:#f8fafc; border-radius: 8px; padding: 14px 16px; }
  footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eef2f7; font-size: 12px; color:#94a3b8; text-align:center; }
  @media print {
    body { background:#fff; padding: 0; }
    .sheet { box-shadow: none; border-radius: 0; max-width: none; padding: 24px; }
    @page { margin: 16mm; }
  }
</style>
</head>
<body>
  <div class="sheet">
    <header>
      <div>
        <div class="brand">${esc(SELLER.name)}<small>${esc(SELLER.email)} · ${esc(SELLER.site)}</small></div>
      </div>
      <div class="doc-meta">
        <h1>Invoice</h1>
        <div><b>${esc(doc.invoice_number)}</b></div>
        <div>Issued: ${fmtDate(doc.issued_at)}</div>
        ${o?.order_number ? `<div>Order: ${esc(o.order_number)}</div>` : ''}
      </div>
    </header>

    <div class="parties">
      <section>
        <div class="label">From</div>
        <p><b>${esc(SELLER.name)}</b><br/>${esc(SELLER.email)}<br/>${esc(SELLER.site)}</p>
      </section>
      <section>
        <div class="label">Bill to</div>
        <p>${billTo.length ? billTo.map(esc).join('<br/>') : '<span style="color:#94a3b8">No billing details on file.</span>'}</p>
      </section>
    </div>

    <table class="items">
      <thead>
        <tr><th>Description</th><th class="num">Qty</th><th class="num">Unit</th><th class="num">Amount</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <table class="totals">${totals}</table>

    ${o?.customer_note ? `<div class="note"><b>Note:</b> ${esc(o.customer_note)}</div>` : ''}

    <footer>Thank you for your business — ${esc(SELLER.name)}</footer>
  </div>
</body>
</html>`
}

/** Open the invoice in a new window and trigger the print dialog (Save as PDF). */
export function printInvoice(doc: InvoiceDoc): void {
  const html = buildInvoiceHtml(doc)
  const w = window.open('', '_blank', 'width=900,height=1000')
  if (!w) {
    alert('Please allow pop-ups to print or download the invoice.')
    return
  }
  w.document.open()
  w.document.write(html)
  w.document.close()
  // Wait for layout/fonts before invoking print.
  w.onload = () => {
    w.focus()
    w.print()
  }
}

/** Download the invoice as a standalone .html file (offline copy). */
export function downloadInvoiceHtml(doc: InvoiceDoc): void {
  const blob = new Blob([buildInvoiceHtml(doc)], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${doc.invoice_number}.html`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Build a mailto: link addressed to the customer with the invoice summary. */
export function invoiceMailto(doc: InvoiceDoc): string {
  const to = invoiceRecipient(doc)
  const total = formatPrice(doc.total_cents, doc.currency)
  const subject = `Invoice ${doc.invoice_number} from ${SELLER.name}`
  const lines = [
    `Hello,`,
    ``,
    `Please find your invoice ${doc.invoice_number}${doc.order?.order_number ? ` for order ${doc.order.order_number}` : ''}.`,
    `Amount: ${total}`,
    ``,
    doc.pdf_url ? `Download your invoice PDF: ${doc.pdf_url}` : `Your invoice is attached.`,
    ``,
    `Thank you for shopping with ${SELLER.name}.`,
    SELLER.email,
  ]
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    lines.join('\n'),
  )}`
}
