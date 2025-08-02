import { useState } from "react";
import Papa from "papaparse";
import axios from "axios";

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
          setCsvData(results.data.slice(0, 10)); // preview first 10 rows
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
      alert("CSV uploaded successfully!");
    } catch (err) {
      alert("Upload failed.");
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

      // Get preview of cleaned file
      const previewRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/preview_cleaned/${cleanedName}`);
      setCleanedData(previewRes.data.rows);
    } catch (err) {
      alert("Cleaning failed.");
      console.error(err);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Your CSV</h1>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4"
      />

      <div className="space-x-4 mb-6">
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

      {csvData.length > 0 && (
        <div className="mt-6 overflow-auto">
          <h2 className="font-semibold mb-2">📄 CSV Preview (First 10 Rows):</h2>
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

      {cleanedData.length > 0 && (
        <div className="mt-10 overflow-auto">
          <h2 className="font-semibold mb-2 text-green-700">✅ Cleaned Data Preview (First 10 Rows):</h2>
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
            className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            download
          >
            ⬇ Download Cleaned CSV
          </a>
        </div>
      )}
    </div>
  );
}
