import { useEffect } from "react";
import "./xml-tool.css";

export default function XmlTool() {

  useEffect(() => {

    let lastSelectedCell = null;

    const fileInput = document.getElementById("fileInput");
    const fontSizeSlider = document.getElementById("fontSizeSlider");

    fileInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = evt => convertXML(evt.target.result);
      reader.readAsText(file, "UTF-8");
    });

    function convertXML(xmlText) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "application/xml");
      const rows = xmlDoc.getElementsByTagName("Row");
      const outputDiv = document.getElementById("output");

      if (rows.length === 0) {
        outputDiv.innerHTML = "<p style='color:red;'>找不到 &lt;Row&gt; 標籤。</p>";
      }

      let html = '<table><thead><tr><th class="rowHeader">#</th>';

      const firstCells = rows[0].getElementsByTagName("Cell");
      for (let j = 0; j < firstCells.length; j++) {
        html += `<th data-col="${j}">${firstCells[j].textContent}</th>`;
      }
      html += "</tr></thead><tbody>";

      for (let i = 1; i < rows.length; i++) {
        html += `<tr><td class="rowHeader" data-row="${i}">${i}</td>`;

        const cells = rows[i].getElementsByTagName("Cell");
        for (let j = 0; j < cells.length; j++) {
          const text = cells[j].textContent;
          html += `<td data-row="${i}" data-col="${j}" title="${text}">${text}</td>`;
        }
        html += "</tr>";
      }
      html += "</tbody></table>";

      outputDiv.innerHTML = html;

      activateSelection();
      activateColumnResize();
    }

    function activateSelection() {
      const table = document.querySelector("table");
      if (!table) return;
      const cells = table.querySelectorAll("td,th");
      const formulaBar = document.getElementById("formulaBar");

      cells.forEach(cell => {
        cell.addEventListener("click", e => {
          const isCtrl = e.ctrlKey || e.metaKey;
          const isShift = e.shiftKey;

          if (cell.tagName === "TH" && cell.dataset.col !== undefined) {
            if (!isCtrl && !isShift) clearSelection();
            selectColumn(cell.dataset.col);
            formulaBar.textContent = "";
            lastSelectedCell = null;
            return;
          }

          if (cell.classList.contains("rowHeader")) {
            if (!isCtrl && !isShift) clearSelection();
            selectRow(cell.dataset.row);
            formulaBar.textContent = "";
            lastSelectedCell = null;
            return;
          }

          if (!isCtrl && !isShift) clearSelection();

          if (isShift && lastSelectedCell) {
            selectRange(lastSelectedCell, cell);
          } else {
            cell.classList.toggle("selected");
            lastSelectedCell = cell;
          }

          if (!isShift && !isCtrl) {
            formulaBar.textContent = cell.textContent;
          }
        });
      });
    }

    function clearSelection() {
      document.querySelectorAll(".selected").forEach(el => el.classList.remove("selected"));
    }

    function selectRow(r) {
      document.querySelectorAll(`[data-row="${r}"]`).forEach(el => el.classList.add("selected"));
    }

    function selectColumn(c) {
      document.querySelectorAll(`[data-col="${c}"]`).forEach(el => el.classList.add("selected"));
    }

    function selectRange(start, end) {
      const sr = +start.dataset.row;
      const sc = +start.dataset.col;
      const er = +end.dataset.row;
      const ec = +end.dataset.col;

      const rMin = Math.min(sr, er);
      const rMax = Math.max(sr, er);
      const cMin = Math.min(sc, ec);
      const cMax = Math.max(sc, ec);

      for (let r = rMin; r <= rMax; r++) {
        for (let c = cMin; c <= cMax; c++) {
          const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
          if (cell) cell.classList.add("selected");
        }
      }
    }

    document.addEventListener("copy", e => {
      const selected = document.querySelectorAll(".selected");
      if (!selected.length) return;

      const rows = {};
      selected.forEach(cell => {
        const r = cell.dataset.row || "h";
        if (!rows[r]) rows[r] = [];
        rows[r].push(cell.innerText);
      });

      const out = Object.values(rows).map(r => r.join("\t")).join("\n");
      e.clipboardData.setData("text/plain", out);
      e.preventDefault();
    });

    function activateColumnResize() {
      const ths = document.querySelectorAll("th");

      ths.forEach(th => {
        const resizer = document.createElement("div");
        resizer.className = "th-resizer";
        th.appendChild(resizer);

        let startX, startWidth;

        resizer.addEventListener("mousedown", e => {
          e.preventDefault();
          startX = e.pageX;
          startWidth = th.offsetWidth;

          document.addEventListener("mousemove", resize);
          document.addEventListener("mouseup", stopResize);
        });

        function resize(e) {
          const newWidth = startWidth + (e.pageX - startX);
          if (newWidth > 40) {
            th.style.width = newWidth + "px";

            const col = th.dataset.col;
            if (col !== undefined) {
              document.querySelectorAll(`td[data-col="${col}"]`).forEach(td => {
                td.style.width = newWidth + "px";
              });
            }
          }
        }

        function stopResize() {
          document.removeEventListener("mousemove", resize);
          document.removeEventListener("mouseup", stopResize);
        }
      });
    }

    fontSizeSlider.addEventListener("input", e => {
      const size = e.target.value;
      document.getElementById("fontSizeValue").textContent = size;

      document.querySelectorAll("th, td, .rowHeader").forEach(el => {
        el.style.fontSize = size + "px";
      });
    });

  }, []);

  return (
    <div className="xml-tool-container">
      <div className="xml-tool-titlebar">
        <h2>線上 Excel 檢視器</h2>
      </div>

      <div className="xml-tool-toolbar">
        <div className="xml-tool-control">
          <label className="xml-tool-label" htmlFor="fileInput">選擇檔案</label>
          <input type="file" id="fileInput" accept=".xls,.xlsx,.xml" />
        </div>

        <div className="xml-tool-control xml-tool-slider">
          <label className="xml-tool-label" htmlFor="fontSizeSlider">
            字體大小：<span id="fontSizeValue">11</span>px
          </label>
          <input type="range" min="8" max="20" defaultValue="11" id="fontSizeSlider" />
        </div>
      </div>

      <div className="xml-tool-formula" aria-label="公式列">
        <div id="formulaBar"></div>
      </div>
      <div className="xml-tool-output" id="output"></div>
    </div>
  );
}
