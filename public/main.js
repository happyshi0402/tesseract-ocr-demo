const ocrImage = document.getElementById("ocr-image");
const ocrPaste = document.getElementById("ocr-paste");
const ocrResult = document.getElementById("ocr-result");

ocrImage.addEventListener("change", (e) => {
  const file = e.target.files[0];
  ocrFile(file);
});

ocrPaste.addEventListener(
  "paste",
  async (e) => {
    if (!e.clipboardData || e.clipboardData.items.length === 0) {
      return false;
    }
    const { items } = e.clipboardData;

    let file;
    for (let i = 0; i < items.length; i++) {
      if (
        items[i].kind === "file" &&
        (items[i].type === "image/png" || items[i].type === "image/jpg")
      ) {
        file = items[i].getAsFile();
        break;
      }
    }
    if (!file) {
      return false;
    }

    ocrFile(file);
  },
  false
);

async function ocrFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    ocrPaste.innerHTML = `<img src="${e.target.result}" />`;
  };
  reader.readAsDataURL(file);
  const formData = new FormData();
  formData.append("image", file);
  ocrResult.innerText = "正在识别中...";
  try {
    const result = await (
      await fetch("/ocr", {
        method: "POST",
        body: formData,
      })
    ).json();
    ocrResult.innerText = result.join("\n");
  } catch (error) {
    ocrResult.innerText = `识别失败: ${error.message}`;
  }
}
