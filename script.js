const fetchFiles = async () => {
  try {
    const res = await fetch("files.json");
    return await res.json();
  } catch (err) {
    console.error("Gagal mengambil daftar file:", err);
    return [];
  }
};

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 ** 2) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 ** 3) return (bytes / 1024 ** 2).toFixed(1) + " MB";
  return (bytes / 1024 ** 3).toFixed(1) + " GB";
};

const fetchFileSize = async (url) => {
  try {
    const res = await fetch(url, { method: "HEAD" });
    const size = res.headers.get("content-length");
    return size ? formatSize(Number(size)) : "N/A";
  } catch {
    return "N/A";
  }
};

const renderFileList = async () => {
  const listEl = document.getElementById("fileList");
  listEl.innerHTML = "";

  const files = await fetchFiles();

  for (const file of files) {
    const size = await fetchFileSize(file.path);
    const ext = file.name.split(".").pop().toLowerCase();
    const previewable = ["pdf", "png", "jpg", "jpeg", "txt", "md"];
    let previewBtn = "";

    if (previewable.includes(ext)) {
      previewBtn = `<button class="preview-btn" data-path="${file.path}" data-ext="${ext}">Lihat</button>`;
    }

    const item = document.createElement("div");
    item.className = "file-item";
    item.innerHTML = `
      <span>${file.name} <small>(${size})</small></span>
      <div class="file-actions">
        ${previewBtn}
        <a class="download-btn" href="${file.path}" download>Unduh</a>
      </div>
    `;
    listEl.appendChild(item);
  }

  document.querySelectorAll(".preview-btn").forEach(btn => {
    btn.addEventListener("click", () => showPreview(btn.dataset.path, btn.dataset.ext));
  });
};

const showPreview = (path, ext) => {
  let content = "";
  if (ext === "pdf") {
    content = `<embed src="${path}" width="100%" height="500px" type="application/pdf"/>`;
  } else if (["png", "jpg", "jpeg"].includes(ext)) {
    content = `<img src="${path}" style="max-width:100%;height:auto;" />`;
  } else {
    fetch(path)
      .then(res => res.text())
      .then(text => {
        content = `<pre style="white-space: pre-wrap;">${text}</pre>`;
        document.getElementById("previewModal").innerHTML = content;
        document.getElementById("modalContainer").style.display = "block";
      });
    return;
  }

  document.getElementById("previewModal").innerHTML = content;
  document.getElementById("modalContainer").style.display = "block";
};

document.getElementById("search").addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll(".file-item").forEach((item) => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(term) ? "flex" : "none";
  });
});

const toggle = document.getElementById("darkToggle");
toggle.addEventListener("change", () => {
  document.body.classList.toggle("dark", toggle.checked);
  localStorage.setItem("darkMode", toggle.checked ? "1" : "0");
});

window.addEventListener("DOMContentLoaded", () => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const saved = localStorage.getItem("darkMode");
  const enableDark = saved === "1" || (saved === null && prefersDark);
  toggle.checked = enableDark;
  document.body.classList.toggle("dark", enableDark);
  renderFileList();
});
