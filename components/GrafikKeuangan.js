import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export default function GrafikKeuangan({ data }) {
  const chartData = {
    labels: data.map((item) => item.bulan),
    datasets: [
      {
        label: "Pemasukan",
        data: data.map((item) => item.pemasukan),
        borderColor: "#2e7d32",
        backgroundColor: "rgba(46, 125, 50, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Pengeluaran",
        data: data.map((item) => item.pengeluaran),
        borderColor: "#d32f2f",
        backgroundColor: "rgba(211, 47, 47, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Saldo",
        data: data.map((item) => item.saldo),
        borderColor: "#1976d2",
        backgroundColor: "rgba(25, 118, 210, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Grafik Keuangan 6 Bulan Terakhir",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "Rp " + value.toLocaleString("id-ID");
          },
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
