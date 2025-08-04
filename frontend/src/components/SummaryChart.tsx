import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

export default function SummaryChart({ filename }: { filename: string }) {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/get_summary/${filename}`);
        setSummary(res.data);
      } catch (err) {
        console.error("Summary fetch failed", err);
      }
    };
    fetchSummary();
  }, [filename]);

  if (!summary) return <p className="mt-6">Loading summary...</p>;

  return (
    <div className="mt-6 grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-lg font-semibold mb-2">Missing Values</h2>
        <BarChart width={400} height={250} data={summary.nulls}>
          <XAxis dataKey="column" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="nulls" fill="#8884d8" />
        </BarChart>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Outliers</h2>
        <BarChart width={400} height={250} data={summary.outliers}>
          <XAxis dataKey="column" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="outliers" fill="#82ca9d" />
        </BarChart>
      </div>

      <div className="col-span-2">
        <h2 className="text-lg font-semibold mb-2">Duplicate Rows</h2>
        <PieChart width={300} height={250}>
          <Pie
            data={[
              { name: "Duplicates", value: summary.duplicates },
              { name: "Unique", value: summary.total_rows - summary.duplicates || 1 },
            ]}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
            dataKey="value"
          >
            {COLORS.map((color, index) => (
              <Cell key={index} fill={color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>
    </div>
  );
}
