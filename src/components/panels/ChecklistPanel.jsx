import React, { useState, useEffect } from "react";
import { useSanctuaryStore } from "../../store/sanctuaryStore";
import styles from "./ChecklistPanel.module.css";

function getServiceDate() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Calculate days until next Sunday (if today is Sunday, use today)
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);

  return nextSunday.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ChecklistPanel({ section, title }) {
  const {
    checklist,
    toggleChecklistItem,
    addChecklistItem,
    removeChecklistItem,
    resetChecklist,
    updateChecklistMeta,
    serviceOrder,
  } = useSanctuaryStore();

  const [newItemText, setNewItemText] = useState("");
  const items = checklist[section] || [];
  const meta = checklist[section + "Meta"] || { date: "", technicianName: "" };
  const doneCount = items.filter((i) => i.done).length;
  const isComplete = doneCount === items.length && items.length > 0;

  // Get logo from service order if available
  const logoSlide = serviceOrder.find((i) => i.slide?.type === "logo")?.slide;
  const logoDataUrl = logoSlide?.logoDataUrl;

  // Auto-set today's date if empty
  useEffect(() => {
    if (!meta.date) {
      updateChecklistMeta(section, "date", getServiceDate());
    }
  }, [section]);

  const handleAdd = () => {
    const text = newItemText.trim();
    if (!text) return;
    addChecklistItem(section, text);
    setNewItemText("");
  };

  const handleReset = () => {
    resetChecklist(section);
    updateChecklistMeta(section, "date", getServiceDate());
    updateChecklistMeta(section, "technicianName", "");
  };

  const handlePrint = () => {
    const date = meta.date || getServiceDate();
    const tech = meta.technicianName || "________________________";

    // Group items by category
    const groups = new Map();
    items.forEach((item) => {
      const sep = item.text.indexOf(" — ");
      const category = sep > -1 ? item.text.slice(0, sep) : "General";
      const task = sep > -1 ? item.text.slice(sep + 3) : item.text;
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push({ ...item, displayText: task });
    });

    let tableRows = "";
    groups.forEach((groupItems, category) => {
      tableRows += `
        <tr>
          <td colspan="2" class="category-header">${category}</td>
        </tr>
      `;
      groupItems.forEach((item) => {
        tableRows += `
          <tr>
            <td class="item-cell">
              <span class="checkbox">${item.done ? "✓" : ""}</span>
              <span class="${item.done ? "done-text" : ""}">${item.displayText}</span>
            </td>
            <td class="status-cell">${item.done ? "✓" : ""}</td>
          </tr>
        `;
      });
    });

    const html = `
      <!DOCTYPE html><html><head>
      <title>Declare — ${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        
        body { 
          font-family: 'Inter', -apple-system, Arial, sans-serif; 
          padding: 32px 40px; 
          background: #fff; 
          color: #111; 
          font-size: 12px;
          line-height: 1.4;
        }
        
        /* Header */
        .header { 
          display: flex; 
          align-items: flex-start; 
          margin-bottom: 24px; 
          padding-bottom: 20px; 
          border-bottom: 2px solid #111; 
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        
        .logo { 
          width: 50px; 
          height: 50px; 
          object-fit: contain;
        }
        
        .logo-placeholder {
          width: 50px;
          height: 50px;
          border: 2px solid #111;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 800;
        }
        
        .brand-info { }
        
        .brand-name { 
          font-size: 28px; 
          font-weight: 800; 
          letter-spacing: -0.02em;
          line-height: 1;
        }
        
        .church-name { 
          font-size: 11px; 
          color: #555;
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .meta-section { 
          text-align: right;
        }
        
        .meta-row {
          display: flex;
          align-items: baseline;
          justify-content: flex-end;
          gap: 8px;
          margin-bottom: 6px;
        }
        
        .meta-label { 
          font-size: 10px; 
          color: #666; 
          text-transform: uppercase; 
          letter-spacing: 0.08em;
          font-weight: 600;
        }
        
        .meta-value { 
          font-size: 13px; 
          color: #111;
          font-weight: 500;
          min-width: 140px;
          border-bottom: 1px solid #999;
          padding-bottom: 2px;
        }
        
        /* Title Bar */
        .title-bar { 
          background: #111; 
          color: #fff;
          padding: 12px 20px; 
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .title { 
          font-size: 16px; 
          font-weight: 700; 
          text-transform: uppercase; 
          letter-spacing: 0.08em; 
        }
        
        .progress { 
          font-size: 11px; 
          opacity: 0.8;
        }
        
        /* Table */
        table { 
          width: 100%; 
          border-collapse: collapse; 
          border: 1px solid #333;
        }
        
        .category-header {
          padding: 10px 14px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          background: #eee;
          border-bottom: 1px solid #333;
          border-top: 1px solid #333;
        }
        
        .item-cell {
          padding: 10px 14px;
          border-bottom: 1px solid #ddd;
          font-size: 12px;
        }
        
        .checkbox {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 1.5px solid #333;
          border-radius: 3px;
          margin-right: 10px;
          text-align: center;
          line-height: 14px;
          font-size: 11px;
          font-weight: 700;
          vertical-align: middle;
        }
        
        .done-text {
          text-decoration: line-through;
          color: #888;
        }
        
        .status-cell {
          padding: 10px 14px;
          border-bottom: 1px solid #ddd;
          text-align: center;
          width: 40px;
          font-weight: 600;
        }
        
        /* Footer */
        .footer { 
          margin-top: 24px; 
          padding-top: 12px; 
          border-top: 1px solid #ccc; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
        }
        
        .footer-brand { 
          font-size: 10px; 
          color: #888;
        }
        
        .footer-status { 
          font-size: 11px; 
          color: #111;
          font-weight: 600;
        }
        
        /* Notes Section */
        .notes-section {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #ccc;
        }
        
        .notes-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }
        
        .notes-lines {
          border-bottom: 1px solid #ccc;
          height: 24px;
          margin-bottom: 4px;
        }
        
        @media print {
          body { padding: 20px; }
          .title-bar { -webkit-print-color-adjust: exact; background: #111 !important; color: #fff !important; }
          .category-header { -webkit-print-color-adjust: exact; background: #eee !important; }
        }
      </style>
      </head><body>
      <div class="header">
        <div class="logo-section">
          ${logoDataUrl ? `<img src="${logoDataUrl}" class="logo" />` : '<div class="logo-placeholder">D</div>'}
          <div class="brand-info">
            <div class="brand-name">Declare</div>
            <div class="church-name">The Floodgates Church</div>
          </div>
        </div>
        <div class="meta-section">
          <div class="meta-row">
            <span class="meta-label">Date:</span>
            <span class="meta-value">${date}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Name:</span>
            <span class="meta-value">${tech}</span>
          </div>
        </div>
      </div>
      
      <div class="title-bar">
        <div class="title">${title}</div>
        <div class="progress">${doneCount} of ${items.length} completed</div>
      </div>
      
      <table>
        <tbody>${tableRows}</tbody>
      </table>
      
      <div class="notes-section">
        <div class="notes-label">Notes:</div>
        <div class="notes-lines"></div>
        <div class="notes-lines"></div>
        <div class="notes-lines"></div>
      </div>
      
      <div class="footer">
        <div class="footer-brand">Printed from Declare — The Floodgates Church</div>
        <div class="footer-status">${isComplete ? "✓ All items complete" : `${items.length - doneCount} items remaining`}</div>
      </div>
      </body></html>
    `;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  return (
    <div className={styles.panel}>
      {/* Premium Header */}
      <div className={styles.premiumHeader}>
        <div className={styles.brandRow}>
          {logoDataUrl ? (
            <img
              src={logoDataUrl}
              className={styles.logoImg}
              alt="Church Logo"
            />
          ) : (
            <div className={styles.logoPlaceholder}>D</div>
          )}
          <div className={styles.brandInfo}>
            <div className={styles.brandName}>Declare</div>
            <div className={styles.churchName}>The Floodgates Church</div>
          </div>
        </div>
        <div className={styles.titleSection}>
          <div className={styles.checklistTitle}>{title}</div>
          <div className={styles.progressText}>
            {isComplete ? (
              <span className={styles.completeText}>✓ All Complete</span>
            ) : (
              <>
                {doneCount} / {items.length}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div
          className={`${styles.progressFill} ${isComplete ? styles.progressComplete : ""}`}
          style={{
            width: items.length ? `${(doneCount / items.length) * 100}%` : "0%",
          }}
        />
      </div>

      {/* Meta Fields */}
      <div className={styles.metaFields}>
        <div className={styles.metaField}>
          <label className={styles.metaLabel}>Date</label>
          <input
            type="text"
            className={styles.metaInput}
            value={meta.date}
            onChange={(e) =>
              updateChecklistMeta(section, "date", e.target.value)
            }
            placeholder={getServiceDate()}
          />
        </div>
        <div className={styles.metaField}>
          <label className={styles.metaLabel}>Technician</label>
          <input
            type="text"
            className={styles.metaInput}
            value={meta.technicianName}
            onChange={(e) =>
              updateChecklistMeta(section, "technicianName", e.target.value)
            }
            placeholder="Enter name..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className={styles.headerActions}>
        <button
          className={styles.actionBtn}
          onClick={handlePrint}
          title="Print checklist"
        >
          <span className={styles.actionIcon}>🖨</span> Print
        </button>
        <button
          className={styles.actionBtn}
          onClick={handleReset}
          title="Reset all items"
        >
          <span className={styles.actionIcon}>↺</span> Reset
        </button>
      </div>

      {/* Checklist Items */}
      <div className={styles.items}>
        {(() => {
          const groups = [];
          const groupMap = new Map();
          items.forEach((item) => {
            const sep = item.text.indexOf(" — ");
            const category = sep > -1 ? item.text.slice(0, sep) : "General";
            const task = sep > -1 ? item.text.slice(sep + 3) : item.text;
            if (!groupMap.has(category)) {
              const group = { category, items: [] };
              groups.push(group);
              groupMap.set(category, group);
            }
            groupMap.get(category).items.push({ ...item, displayText: task });
          });
          return groups.map((group) => {
            const groupDone = group.items.filter((i) => i.done).length;
            const groupComplete = groupDone === group.items.length;
            return (
              <div key={group.category} className={styles.group}>
                <div className={styles.groupHeader}>
                  <span className={styles.groupName}>{group.category}</span>
                  <span
                    className={`${styles.groupCount} ${groupComplete ? styles.groupCountComplete : ""}`}
                  >
                    {groupComplete ? "✓" : `${groupDone}/${group.items.length}`}
                  </span>
                </div>
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.item} ${item.done ? styles.done : ""}`}
                  >
                    <div
                      className={`${styles.checkbox} ${item.done ? styles.checkboxDone : ""}`}
                      onClick={() => toggleChecklistItem(section, item.id)}
                    >
                      {item.done && <span className={styles.checkmark}>✓</span>}
                    </div>
                    <span className={styles.itemText}>{item.displayText}</span>
                    <button
                      className={styles.removeItem}
                      onClick={() => removeChecklistItem(section, item.id)}
                      title="Remove item"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            );
          });
        })()}
      </div>

      {/* Add item */}
      <div className={styles.addRow}>
        <input
          className={styles.addInput}
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add checklist item…"
        />
        <button className={styles.addItemBtn} onClick={handleAdd}>
          +
        </button>
      </div>
    </div>
  );
}
