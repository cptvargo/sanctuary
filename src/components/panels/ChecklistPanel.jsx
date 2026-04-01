import React, { useState } from 'react'
import { useSanctuaryStore } from '../../store/sanctuaryStore'
import styles from './ChecklistPanel.module.css'

export default function ChecklistPanel({ section, title }) {
  const { checklist, toggleChecklistItem, addChecklistItem, removeChecklistItem, resetChecklist } = useSanctuaryStore()
  const [newItemText, setNewItemText] = useState('')
  const items = checklist[section] || []
  const doneCount = items.filter(i => i.done).length

  const handleAdd = () => {
    const text = newItemText.trim()
    if (!text) return
    addChecklistItem(section, text)
    setNewItemText('')
  }

  const handlePrint = () => {
    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const rows = items.map(i => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #eee;font-size:14px;color:${i.done ? '#888' : '#111'};text-decoration:${i.done ? 'line-through' : 'none'}">
          ${i.done ? '☑' : '☐'} ${i.text}
        </td>
        <td style="padding:10px 16px;border-bottom:1px solid #eee;font-size:12px;color:#888;text-align:right">${i.done ? '✓ Done' : ''}</td>
      </tr>
    `).join('')

    const html = `
      <!DOCTYPE html><html><head>
      <title>The Floodgates Church — ${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .sub { color: #666; font-size: 13px; margin-bottom: 24px; }
        .progress { font-size: 13px; color: #444; margin-bottom: 16px; padding: 8px 12px; background: #f5f5f5; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
        th { background: #f0f0f0; padding: 10px 16px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #555; }
      </style>
      </head><body>
      <h1>The Floodgates Church</h1>
      <div class="sub">${title} — ${date}</div>
      <div class="progress">${doneCount} of ${items.length} items completed</div>
      <table>
        <thead><tr><th>Item</th><th style="text-align:right">Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:24px;font-size:11px;color:#aaa">Printed from Sanctuary — The Floodgates Church</p>
      </body></html>
    `

    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    win.print()
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>{title}</div>
          <div className={styles.progress}>{doneCount} / {items.length} complete</div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.printBtn} onClick={handlePrint} title="Print checklist">🖨 Print</button>
          <button className={styles.resetBtn} onClick={() => resetChecklist(section)} title="Reset all items">↺ Reset</button>
        </div>
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: items.length ? `${(doneCount / items.length) * 100}%` : '0%' }}
        />
      </div>

      <div className={styles.items}>
        {items.map(item => (
          <div key={item.id} className={`${styles.item} ${item.done ? styles.done : ''}`}>
            <div className={styles.checkbox} onClick={() => toggleChecklistItem(section, item.id)}>
              {item.done ? <span className={styles.checkmark}>✓</span> : null}
            </div>
            <span className={styles.itemText}>{item.text}</span>
            <button className={styles.removeItem} onClick={() => removeChecklistItem(section, item.id)}>×</button>
          </div>
        ))}
      </div>

      {/* Add item */}
      <div className={styles.addRow}>
        <input
          className={styles.addInput}
          value={newItemText}
          onChange={e => setNewItemText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add checklist item…"
        />
        <button className={styles.addItemBtn} onClick={handleAdd}>+</button>
      </div>
    </div>
  )
}
