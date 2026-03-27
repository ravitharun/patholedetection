const preview = document.getElementById("preview");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function detect() {
  const fileInput = document.getElementById("fileInput");
  const model = document.getElementById("model").value;

  if (!fileInput.files.length) {
    alert("Select an image");
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("image", file);

  preview.src = URL.createObjectURL(file);

  preview.onload = async () => {
    canvas.width = preview.naturalWidth;
    canvas.height = preview.naturalHeight;

    preview.style.width = preview.naturalWidth + "px";
    preview.style.height = preview.naturalHeight + "px";

    canvas.style.width = preview.width + "px";
    canvas.style.height = preview.height + "px";

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const res = await fetch(
      `http://127.0.0.1:5000/detect?model=${model}`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    document.getElementById("output").textContent =
      JSON.stringify(data, null, 2);

    drawBoxes(data.detections);
  };
}

function drawBoxes(detections) {
  ctx.lineWidth = 4;
  ctx.strokeStyle = "red";
  ctx.font = "20px Arial";
  ctx.fillStyle = "red";

  detections.forEach(det => {
    const [x1, y1, x2, y2] = det.bbox;
    const w = x2 - x1;
    const h = y2 - y1;

    ctx.strokeRect(x1, y1, w, h);
    ctx.fillText(
      det.confidence.toFixed(2),
      x1 + 5,
      y1 + 20
    );
  });
}
