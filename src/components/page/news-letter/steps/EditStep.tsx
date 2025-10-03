import React from "react";
import ReactEmailEditor from "../components/ReactEmailEditor";

const EditStep: React.FC = () => {
  return (
    <div className="h-screen w-screen fixed inset-0 z-50 bg-white" style={{ height: "100vh", width: "100vw" }}>
      <div className="h-full w-full" style={{ height: "100%", width: "100%" }}>
        <ReactEmailEditor />
      </div>
    </div>
  );
};

export default EditStep;
