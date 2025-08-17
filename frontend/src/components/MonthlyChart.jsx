import { Bar } from "react-chartjs-2";

const MonthlyChart = ({ data }) => {
  // data: [{ category: 'Food', total: 120 }, ...]
  return (
    <Bar
      data={{
        labels: data.map((d) => d.category),
        datasets: [
          {
            label: "Amount Spent",
            data: data.map((d) => d.total),
            backgroundColor: "rgba(75,192,192,0.6)",
          },
        ],
      }}
    />
  );
};

export default MonthlyChart;
