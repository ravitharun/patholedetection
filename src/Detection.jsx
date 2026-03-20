import { useState } from "react";

const BACKEND_URL = "https://comedial-unbreeched-bobbi.ngrok-free.dev";

export default function Detection() {
  const [file, setFile] = useState(null);
  const [model, setModel] = useState("pothole");
  const [imageUrl, setImageUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDetect = async () => {
    if (!file) {
      alert("Select image or video");
      return;
    }

    setLoading(true);
    setImageUrl(null);
    setVideoUrl(null);

    const formData = new FormData();

    try {
      // 🖼 IMAGE
      if (file.type.startsWith("image")) {
        formData.append("image", file);

        const res = await fetch(
          `${BACKEND_URL}/detect?model=${model}`,
          { method: "POST", body: formData }
        );

        if (!res.ok) throw new Error("Image detection failed");

        const data = await res.json();
        console.log("Image detections:", data);

        setImageUrl(URL.createObjectURL(file));
      }

      // 🎥 VIDEO
      else if (file.type.startsWith("video")) {
        formData.append("video", file);

        const res = await fetch(
          `${BACKEND_URL}/detect-video?model=${model}`,
          { method: "POST", body: formData }
        );

        if (!res.ok) throw new Error("Video detection failed");

        const blob = await res.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }

      else {
        alert("Unsupported file type");
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🚦 ML Detection System</h2>

      <select value={model} onChange={e => setModel(e.target.value)}>
        <option value="pothole">Pothole</option>
        <option value="lane_detection">Lane Detection</option>
        <option value="traffic_light">Traffic Light</option>
      </select>

      <br /><br />

      <input
        type="file"
        accept="image/*,video/*"
        onChange={e => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleDetect} disabled={loading}>
        {loading ? "Detecting..." : "Detect"}
      </button>

      <br /><br />

      {imageUrl && (
        <img
          src={imageUrl}
          alt="result"
          style={{ width: "100%", borderRadius: 8 }}
        />
      )}

      {videoUrl && (
        <video
          src={videoUrl}
          controls
          style={{ width: "100%", borderRadius: 8 }}
        />
      )}
    </div>
  );
}
//hi 