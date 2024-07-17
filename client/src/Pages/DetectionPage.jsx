import { Button, Card } from "flowbite-react";
import React, { useContext, useEffect, useState } from "react";
import { GrPowerReset } from "react-icons/gr";
import { GiCorn } from "react-icons/gi";
import { MdCancel, MdOutlineSaveAlt } from "react-icons/md";
import { ImPencil2 } from "react-icons/im";
import { ReactPictureAnnotation } from "react-picture-annotation";
import axios from "axios";
import DropImageInput from "../Components/DropImageInput";
import LoadingCard from "../Components/LoadingCard";
import SaveResultModal from "../Components/Storage/SaveResultModal";
import { AuthContext } from "../Components/Authentication/PrivateRoute";

function DetectionPage() {
  const { userInfo } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [quota, setQuota] = useState(0);
  const [showToolTip, setShowToolTip] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [isReannotating, setIsReannotating] = useState(false);

  useEffect(() => {
    fetchQuota();
  }, [status]);

  useEffect(() => {
    if (result.annotated_image) {
      const img = new Image();
      img.onload = () => {
        console.log("Annotated image size:", img.width, "x", img.height);
      };
      img.src = `data:image/png;base64,${result.annotated_image}`;
    }
  }, [result.annotated_image]);

  useEffect(() => {
    console.log("Current result:", result);
    console.log("Current file:", file);
  }, [result, file]);

  const fetchQuota = async () => {
    try {
      const res = await axios.get("/api/detect/get_detection_quota");
      setQuota(res.data.quota);
    } catch (error) {
      console.error("Error fetching quota:", error);
      alert("Failed to fetch quota");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert("Please provide an image...");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setStatus("RUNNING");
      const res = await axios.post("/api/detect/init_detection", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        fetchDetectionResult(res.data.result_id);
      } else {
        throw new Error("Detection initialization failed");
      }
    } catch (error) {
      console.error("Error submitting detection:", error);
      setStatus("ERROR");
      alert("Detection failed");
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult({});
    setStatus("");
    setIsReannotating(false);
    setAnnotations([]);
    setOriginalImage(null);
  };

  const fetchDetectionResult = async (resultID) => {
    try {
      const res = await axios.get(`/api/detect/get_detection_result?result_id=${resultID}`);
      if (res.data.status === "ERROR") {
        throw new Error("Detection failed");
      } else if (res.data.status === "SUCCESS") {
        setStatus("SUCCESS");
        setResult(res.data.data);
      } else {
        setTimeout(() => fetchDetectionResult(resultID), 500);
      }
    } catch (error) {
      console.error("Error fetching detection result:", error);
      setStatus("ERROR");
      alert("Failed to fetch detection result");
    }
  };

  const handleReannotate = () => {
    console.log("handleReannotate called");
    console.log("Current result:", result);
    console.log("Current file:", file);
    setIsReannotating(true);
    const reader = new FileReader();
    reader.onloadend = () => setOriginalImage(reader.result);
    reader.readAsDataURL(file);

    const initialAnnotations = result.annotations.map((box, index) => ({
      id: index.toString(),
      mark: { x: box.x, y: box.y, width: box.width, height: box.height },
      comment: `Tassel ${index + 1}`,
    }));
    setAnnotations(result.annotations); 
  };

  const onAnnotationChange = (newAnnotations) => {
    const convertedAnnotations = newAnnotations.map(ann => ({
      height: ann.mark.height,
      width: ann.mark.width,
      x: ann.mark.x,
      y: ann.mark.y
    }));
    setAnnotations(convertedAnnotations);
  };


  const handleSaveAnnotations = () => {
    console.log("Saving new annotations:", annotations);
    setIsReannotating(false);
    setResult(prevResult => ({
      ...prevResult,
      annotations: annotations,
      tassel_count: annotations.length
    }));
  };

  const renderAnnotation = ({ annotation, onClick, onChange }) => {
    const { x, y, width, height } = annotation;
    return (
      <div
        key={annotation.id}
        style={{
          border: "1px solid red",
          position: "absolute",
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          width: `${width * 100}%`,
          height: `${height * 100}%`,
          cursor: "pointer"
        }}
        onClick={onClick}
      />
    );
  };

  const handleSelect = (selectedId) => {
    console.log("Selected annotation:", selectedId);
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
      <LoadingCard show={status === "RUNNING"}>Detecting Maize Tassels...</LoadingCard>
      <SaveResultModal
        state={showSaveModal}
        setState={setShowSaveModal}
        file={file}
        results={result}
        post_save_action={handleReset}
      />

      {/* Decorative blobs */}
      {[1, 2, 3, 4, 5].map(num => (
        <div key={num} className={`blob${num > 1 ? num : ''} text-${['yellow-300', 'custom-green-2', 'custom-green-1', 'custom-brown-1', 'blue-500'][num-1]}`}>
          <GiCorn size={250} />
        </div>
      ))}

      <Card className="relative my-6 mx-4 lg:my-10 lg:mx-16 shadow-lg border xl:mb-20">
        <header className="flex flex-wrap flex-row gap-2 justify-between shadow-b border-b-2 pb-5 border-black">
          <h1 className="text-4xl font-extrabold">Detect Maize Tassel</h1>
          <span className="px-4 py-2 bg-custom-brown-3 rounded-lg shadow-md font-semibold">
            Monthly Quota: {quota}/{userInfo.detection_quota_limit}
          </span>
        </header>
        <div className="flex flex-wrap flex-col justify-start px-8 mt-4 gap-3">
          <h2 className="text-2xl font-semibold">
            {status === "SUCCESS" ? "Result" : "Upload Image"}
          </h2>
          <section className="flex justify-center">
            {status !== "SUCCESS" && !isReannotating && (
              <DropImageInput
                file={file}
                setFile={setFile}
                disabled={status === "RUNNING"}
              />
            )}
            {status === "SUCCESS" && !isReannotating && (
              <img
                className="rounded shadow border max-h-192"
                src={`data:image/png;base64,${result.annotated_image}`}
                alt="Detection Result"
              />
            )}
    {isReannotating && (
      <div style={{ width: "100%", height: "500px" }}>
        <ReactPictureAnnotation
          image={originalImage}
          onAnnotationChange={onAnnotationChange}
          annotationData={annotations.map((ann, index) => ({
            id: index.toString(),
            mark: { x: ann.x, y: ann.y, width: ann.width, height: ann.height },
            comment: `Tassel ${index + 1}`
          }))}
          onChange={onAnnotationChange}
          onSelect={handleSelect}
          renderAnnotation={renderAnnotation}
          width={result.image_width || 800}  // 백엔드에서 제공한 너비 사용
          height={result.image_height || 600}  // 백엔드에서 제공한 높이 사용
          scrollSpeed={0}
          zoomScale={1}
          disabled={false}
          allowZoom={false}
        />
      </div>
    )}
          </section>
          {status !== "SUCCESS" && (
            <section className="flex flex-col lg:flex-row justify-end gap-8 mt=3">
              <Button
                disabled={status === "RUNNING"}
                className="bg-custom-brown-1 hover:bg-custom-brown-2 pl-6 pr-8 py-2 shadow w-full lg:w-56"
                onClick={handleReset}
              >
                <div className="flex flex-row justify-center items-center">
                  <GrPowerReset size={16} />
                  <span className="ml-2 font-bold text-center">Reset</span>
                </div>
              </Button>
              <div
                className="relative"
                onMouseEnter={() => setShowToolTip(true)}
                onMouseLeave={() => setShowToolTip(false)}
              >
                <div
                  hidden={quota > 0 || !showToolTip}
                  className="absolute -top-11 lg:-left-12 text-sm lg:w-80 text-center bg-red-500 text-white px-3 py-2 rounded-lg shadow"
                >
                  You ran out of Detection Quota this month.
                </div>
                <Button
                  disabled={status === "RUNNING" || quota === 0}
                  className="bg-custom-green-1 hover:bg-custom-green-2 pl-6 pr-8 py-2 shadow w-full lg:w-56"
                  onClick={handleSubmit}
                >
                  <div className="flex flex-row justify-center items-center">
                    <GiCorn size={16} />
                    <span className="ml-2 font-bold text-center">Detect</span>
                  </div>
                </Button>
              </div>
            </section>
          )}
          {status === "SUCCESS" && (
            <>
              <section className="flex flex-col md:flex-row font-medium text-xl">
                <span>TOTAL TASSEL COUNT =</span>
                <div className="ml-1 text-custom-green-1 flex flex-row justify-start items-center gap-1">
                  <span>{result.tassel_count}</span>
                  <GiCorn />
                </div>
              </section>
              <section className="flex flex-col lg:flex-row justify-between gap-4 mt-2">
                {!isReannotating ? (
                  <Button
                    className="bg-custom-brown-1 hover:bg-custom-brown-2 pl-6 pr-8 py-2 shadow w-100 lg:w-56"
                    onClick={handleReannotate}
                  >
                    <div className="flex flex-row justify-center items-center">
                      <ImPencil2 size={16} />
                      <span className="ml-2 font-bold text-center">Reannotate</span>
                    </div>
                  </Button>
                ) : (
                  <Button
                    className="bg-custom-brown-1 hover:bg-custom-brown-2 pl-6 pr-8 py-2 shadow w-100 lg:w-56"
                    onClick={handleSaveAnnotations}
                  >
                    <div className="flex flex-row justify-center items-center">
                      <MdOutlineSaveAlt size={16} />
                      <span className="ml-2 font-bold text-center">Save</span>
                    </div>
                  </Button>
                )}
                <div className="flex flex-col lg:flex-row justify-end gap-4 lg:gap-8">
                  <Button
                    className="bg-red-500 hover:bg-red-800 pl-6 pr-8 py-2 shadow w-100 lg:w-56"
                    onClick={handleReset}
                  >
                    <div className="flex flex-row justify-center items-center">
                      <MdCancel size={16} />
                      <span className="ml-2 font-bold text-center">Cancel</span>
                    </div>
                  </Button>
                  <Button
                    disabled={!file || !result}
                    className="bg-custom-green-1 hover:bg-custom-green-2 pl-6 pr-8 py-2 shadow lg:w-56"
                    onClick={() => setShowSaveModal(true)}
                  >
                    <div className="flex flex-row justify-center items-center">
                      <MdOutlineSaveAlt size={16} />
                      <span className="ml-2 font-bold text-center">Save</span>
                    </div>
                  </Button>
                </div>
              </section>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

export default DetectionPage;