import { useEffect, useMemo, useRef, useState } from "react";
import Loader from "./Loader";

const BACKEND_URL = "https://comedial-unbreeched-bobbi.ngrok-free.dev";

/* =========================================
   DETECTION COMPONENT
========================================= */
export default function Detection() {
  const [file, setFile] = useState(null);

  const [model, setModel] = useState("pothole");

  const [imageUrl, setImageUrl] = useState(null);

  const [videoUrl, setVideoUrl] = useState(null);

  const [previewUrl, setPreviewUrl] = useState(null);

  const [loading, setLoading] = useState(false);

  const [dragActive, setDragActive] = useState(false);

  const [detectTime, setDetectTime] = useState(null);

  const [stats, setStats] = useState(null);

  const [error, setError] = useState("");

  const inputRef = useRef(null);

  /* =========================================
     FILE PREVIEW
  ========================================= */
  useEffect(() => {
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);

    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  /* =========================================
     FILE SIZE
  ========================================= */
  const fileSize = useMemo(() => {
    if (!file) return "";

    return (file.size / (1024 * 1024)).toFixed(2);
  }, [file]);

  /* =========================================
     HANDLE DETECTION
  ========================================= */
  const handleDetect = async () => {
    if (!file) {
      setError("Please upload an image or video");
      return;
    }

    setLoading(true);

    setError("");

    setImageUrl(null);

    setVideoUrl(null);

    const start = performance.now();

    const formData = new FormData();

    try {
      /* IMAGE */
      if (file.type.startsWith("image")) {
        formData.append("image", file);

        const res = await fetch(`${BACKEND_URL}/detect?model=${model}`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Image detection failed");
        }

        const data = await res.json();

        console.log("Detection result:", data);

        setStats(data);

        setImageUrl(previewUrl);
      } else if (file.type.startsWith("video")) {

      /* VIDEO */
        formData.append("video", file);

        const res = await fetch(`${BACKEND_URL}/detect-video?model=${model}`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Video detection failed");
        }

        const blob = await res.blob();

        const processedVideo = URL.createObjectURL(blob);

        setVideoUrl(processedVideo);
      } else {
        throw new Error("Unsupported file type");
      }

      const end = performance.now();

      setDetectTime(((end - start) / 1000).toFixed(2));
    } catch (err) {
      console.error(err);

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     DRAG DROP
  ========================================= */
  const handleDrop = (e) => {
    e.preventDefault();

    setDragActive(false);

    if (e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  /* =========================================
     RESET
  ========================================= */
  const resetAll = () => {
    setFile(null);

    setPreviewUrl(null);

    setImageUrl(null);

    setVideoUrl(null);

    setStats(null);

    setError("");

    setDetectTime(null);
  };

  return (
    <div className="detect-root">
      {/* LOADER */}
      {loading && <Loader loadername="Running AI Detection" />}

      {/* =====================================
          HEADER
      ====================================== */}
      <div className="detect-header">
        <div>
          <h1>AI Detection System</h1>

          <p>Smart road intelligence powered by AI computer vision</p>
        </div>

        <div className="detect-live">
          <span className="live-dot"></span>
          AI ONLINE
        </div>
      </div>

      {/* =====================================
          MAIN GRID
      ====================================== */}
      <div className="detect-grid">
        {/* =====================================
            LEFT PANEL
        ====================================== */}
        <div className="detect-card">
          <h2>Upload Media</h2>

          {/* MODEL */}
          <div className="form-group">
            <label>Select AI Model</label>

            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="detect-select"
            >
              <option value="pothole">Pothole Detection</option>

              <option value="lane_detection">Lane Detection</option>

              <option value="traffic_light">Traffic Light Detection</option>
            </select>
          </div>

          {/* DRAG DROP */}
          <div
            className={`drop-zone ${dragActive ? "active" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
          >
            <input
              ref={inputRef}
              type="file"
              hidden
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <div className="drop-icon">📂</div>

            <h3>Drag & Drop Files Here</h3>

            <p>Supports images and videos</p>

            <button className="upload-btn">Browse Files</button>
          </div>

          {/* FILE INFO */}
          {file && (
            <div className="file-info">
              <div>
                <strong>Name:</strong> {file.name}
              </div>

              <div>
                <strong>Type:</strong> {file.type}
              </div>

              <div>
                <strong>Size:</strong> {fileSize} MB
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="detect-actions">
            <button className="primary-btn" onClick={handleDetect} disabled={loading}>
              {loading ? "Processing..." : "Run Detection"}
            </button>

            <button className="secondary-btn" onClick={resetAll}>
              Reset
            </button>
          </div>

          {/* ERROR */}
          {error && <div className="detect-error">{error}</div>}

          {/* STATS */}
          {detectTime && (
            <div className="detect-stats">
              <div className="stat-box">
                <span>Detection Time</span>

                <h3>{detectTime}s</h3>
              </div>

              <div className="stat-box">
                <span>Model</span>

                <h3>{model.replace("_", " ")}</h3>
              </div>
            </div>
          )}
        </div>

        {/* =====================================
            RIGHT PANEL
        ====================================== */}
        <div className="detect-card preview-card">
          <h2>Detection Preview</h2>

          {/* PREVIEW */}
          {previewUrl && !videoUrl && (
            <img src={previewUrl} alt="preview" className="preview-media" />
          )}

          {/* IMAGE RESULT */}
          {imageUrl && <img src={imageUrl} alt="result" className="preview-media" />}

          {/* VIDEO RESULT */}
          {videoUrl && <video src={videoUrl} controls autoPlay className="preview-media" />}

          {/* EMPTY STATE */}
          {!previewUrl && !videoUrl && (
            <div className="empty-preview">
              <div className="empty-icon">🚦</div>

              <h3>No Media Selected</h3>

              <p>Upload image or video to start AI analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
