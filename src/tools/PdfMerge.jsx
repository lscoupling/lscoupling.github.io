import { useEffect, useRef, useState } from "react";
import "./pdf-merge.css";

// 確保 pdfjsLib, PDFLib, Sortable 這些全域變數已在 index.html 中載入

const PdfMerge = () => {
  const containerRef = useRef(null);
  const fileInputRef = useRef(null); //用 ref 直接控制 input
  const previewRef = useRef(null);   // 用 ref 直接控制預覽區
  
  // 使用 useRef 來儲存檔案列表，這樣不會因為 React 重新渲染而重置變數
  const filesRef = useRef([]); 

  // 模式狀態
  const [currentMode, setCurrentMode] = useState("preview");

  // --- 1. 核心渲染邏輯 (保持原本的手動 DOM 操作) ---
  const renderPreviews = async () => {
    const preview = previewRef.current;
    if (!preview) return;

    preview.innerHTML = ""; // 清空

    // 使用 ref 中的檔案列表
    const files = filesRef.current; 

    for (let i = 0; i < files.length; i++) {
      const box = document.createElement("div");
      box.className = "preview-box";

      // 刪除按鈕
      const del = document.createElement("button");
      del.className = "delete-btn";
      del.textContent = "×";
      del.onclick = (e) => {
        e.stopPropagation(); // 防止誤觸其他事件
        filesRef.current.splice(i, 1); // 更新 ref 資料
        renderPreviews(); // 重新渲染
      };

      const canvas = document.createElement("canvas");
      const name = document.createElement("div");
      name.className = "preview-name";
      name.textContent = files[i].name;

      const page = document.createElement("div");
      page.className = "page-num";
      page.textContent = `第 ${i + 1} 頁`;

      box.append(del, canvas, name, page);
      preview.appendChild(box);

      // PDF 縮圖繪製
      try {
        const pdfBytes = await files[i].arrayBuffer();
        // @ts-ignore
        const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
        const pg = await pdf.getPage(1);

        const vp = pg.getViewport({ scale: 0.3 });
        const ctx = canvas.getContext("2d");
        canvas.height = vp.height;
        canvas.width = vp.width;

        // @ts-ignore
        await pg.render({ canvasContext: ctx, viewport: vp }).promise;
      } catch (e) {
        console.error("預覽失敗:", e);
      }
    }

    // Sortable 拖曳排序
    // @ts-ignore
    if (typeof Sortable !== 'undefined') {
        Sortable.create(preview, {
            animation: 150,
            onEnd: e => {
              // 同步更新 ref 中的陣列順序
              const item = filesRef.current.splice(e.oldIndex, 1)[0];
              filesRef.current.splice(e.newIndex, 0, item);
              renderPreviews();
            }
        });
    }
  };

  // --- 2. 事件處理器 (移到 useEffect 外部，綁定在 JSX 上) ---

  // 處理點擊上傳區
  const handleUploadAreaClick = () => {
    // 直接觸發 input 點擊，React 確保這只會執行一次
    fileInputRef.current?.click();
  };

  // 處理檔案選擇
  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      for (let f of selectedFiles) {
        if (f.type === "application/pdf") {
            filesRef.current.push(f);
        }
      }
      renderPreviews();
    }
    // 關鍵修正：重置 input value，確保下次選同一個檔案也能觸發 change
    e.target.value = ''; 
  };

  // 處理拖曳
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.background = "#dceaff";
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.style.background = "#eaf2ff";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.style.background = "#eaf2ff";
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
        for (let f of droppedFiles) {
            if (f.type === "application/pdf") {
                filesRef.current.push(f);
            }
        }
        renderPreviews();
    }
  };

  // 處理合併
  const handleMerge = async () => {
    if (!filesRef.current.length) return alert("請先上傳 PDF");

    // @ts-ignore
    const merged = await PDFLib.PDFDocument.create();
    for (const f of filesRef.current) {
      const buf = await f.arrayBuffer();
      // @ts-ignore
      const pdf = await PDFLib.PDFDocument.load(buf);
      const pages = await merged.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }

    const result = await merged.save();
    const blob = new Blob([result], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "merged.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- 3. useEffect 只負責處理 Body 樣式切換 ---
  useEffect(() => {
    document.body.setAttribute('data-mode', currentMode);
    
    // 清理函式：組件卸載時移除屬性
    return () => {
        document.body.removeAttribute('data-mode');
    };
  }, [currentMode]);


  return (
    <div className="pdf-tool-container" ref={containerRef}>

      <h2>📄 PDF 合併器</h2>

      <div id="view-toggle">
        <button 
            id="mode-preview" 
            className={currentMode === 'preview' ? 'active' : ''}
            onClick={() => setCurrentMode('preview')}
        >
            🖼️ 預覽模式
        </button>
        <button 
            id="mode-list" 
            className={currentMode === 'list' ? 'active' : ''}
            onClick={() => setCurrentMode('list')}
        >
            📃 檔名模式
        </button>
      </div>

      {/* 重點修正：
         1. 使用 React 的 onClick, onDragOver 等屬性，而非 addEventListener。
         2. 這能徹底解決「開啟兩次」和事件衝突的問題。
      */}
      <div 
        id="upload-area"
        onClick={handleUploadAreaClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        拖曳或點擊上傳 PDF 檔案
      </div>

      <input 
        id="file-input" 
        ref={fileInputRef} // 綁定 ref
        type="file" 
        accept="application/pdf" 
        multiple 
        style={{ display: 'none' }} 
        onChange={handleFileChange} // 綁定 onChange
      />

      <div id="preview" ref={previewRef}></div>

      <button id="merge-btn" onClick={handleMerge}>合併 PDF</button>

    </div>
  );
};

export default PdfMerge;