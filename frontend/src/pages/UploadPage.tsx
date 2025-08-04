import { useState } from "react";
import Papa from "papaparse";
import axios from "axios";
import SummaryChart from "@/components/SummaryChart";

export default function UploadPage() {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [cleanedData, setCleanedData] = useState<any[]>([]);
  const [cleanedFileName, setCleanedFileName] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === "text/csv") {
      setFile(uploadedFile);

      Papa.parse(uploadedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setCsvData(results.data.slice(0, 10)); // Preview first 10 rows
        },
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/upload_csv`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("✅ CSV uploaded successfully!");
    } catch (err) {
      alert("❌ Upload failed.");
      console.error(err);
    }
  };

  const handleClean = async () => {
    if (!file) return;

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/clean_data`, {
        filename: file.name,
      });

      const cleanedName = res.data.cleaned_filename;
      setCleanedFileName(cleanedName);

      const previewRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/preview_cleaned/${cleanedName}`);
      setCleanedData(previewRes.data.rows);
    } catch (err) {
      alert("❌ Cleaning failed.");
      console.error(err);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🧹 Data Cleaning Tool</h1>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4 block"
      />

      <div className="flex gap-4">
        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload to Backend
        </button>

        <button
          onClick={handleClean}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Clean Dataset
        </button>
      </div>

      {/* CSV Preview */}
      {csvData.length > 0 && (
        <div className="mt-8 overflow-auto">
          <h2 className="font-semibold mb-2 text-lg">📄 Original CSV Preview:</h2>
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                {Object.keys(csvData[0]).map((col) => (
                  <th key={col} className="px-2 py-1 border">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, idx) => (
                    <td key={idx} className="px-2 py-1 border">
                      {val?.toString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cleaned Data Preview */}
      {cleanedData.length > 0 && (
        <div className="mt-12 overflow-auto">
          <h2 className="font-semibold mb-2 text-lg">✅ Cleaned Data Preview:</h2>
          <table className="min-w-full text-sm border">
            <thead className="bg-green-100">
              <tr>
                {Object.keys(cleanedData[0]).map((col) => (
                  <th key={col} className="px-2 py-1 border">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cleanedData.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, idx) => (
                    <td key={idx} className="px-2 py-1 border">
                      {val?.toString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <a
            href={`${import.meta.env.VITE_API_BASE_URL}/download_cleaned/${cleanedFileName}`}
            download
            className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            ⬇ Download Cleaned CSV
          </a>
        </div>
      )}

      {/* Summary Chart */}
      {cleanedFileName && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-2">📊 Data Cleaning Summary:</h2>
          <SummaryChart filename={cleanedFileName} />
        </div>
      )}
    </div>
  );
}
