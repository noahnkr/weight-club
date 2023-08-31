import { Bar } from "react-chartjs-2";
import { Chart } from "chart.js/auto";
import AnnotationPlugin from "chartjs-plugin-annotation";
import ZoomPlugin from  "chartjs-plugin-zoom";

Chart.register(AnnotationPlugin, ZoomPlugin);

const Availability = ({ chartData, memberData, hsoData, date }) => {
  function convertTo24Hour(time12) {
    const [time, period] = time12.split(" ");
    let [hours, minutes] = time.split(":");

    if (period === "PM" && hours !== "12") {
      hours = String(parseInt(hours) + 12);
    } else if (period === "AM" && hours === "12") {
      hours = "00";
    }

    hours = hours.padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  const availabilityData = {
    labels: chartData.map((data) => data.time),
    datasets: [
      {
        label: "HSO",
        data: chartData.map((data) => data.hsoCount),
        backgroundColor: "rgba(28, 217, 78, 0.3)",
        borderColor: "rgb(28, 217, 78)",
        borderWidth: 2,
      },
      {
        label: "Members",
        data: chartData.map((data) => data.memberCount),
        backgroundColor: "rgba(54, 162, 235, 0.3)",
        borderColor: "rgb(54, 162, 235)",
        borderWidth: 2,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: true, text: date },
      zoom: {
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "xy",
        },
        pan: {
          enabled: true,
          mode: "xy",
        },
        limits: {
          y: {min: 0, max: 50}
        }
      },
      tooltip: {
        callbacks: {
          title: (ctx) => ctx.label,
          label: (ctx) => {
            let memberArray = ctx.datasetIndex == 0 ? hsoData : memberData;
            return memberArray[convertTo24Hour(ctx.label)];
          }
        },
      },
      legend: {
        display: true,
      },
      annotation: {
        annotations: {
          minMembers: {
            type: "line",
            yMin: 3,
            yMax: 3,
            borderColor: "black",
            borderWidth: 1
          }
        },
      },
    },
    scales: {
      x: { 
        type: 'category',
        stacked: true 
      },
      y: {
        min: 0,
        max: 10,
        stacked: true,
        beginAtZero: true,
        beforeBuildTicks: (scale) => {
          const step = 1; // Set the desired step size
          const ticks = [];
          for (let i = Math.floor(scale.min); i <= Math.ceil(scale.max); i += step) {
            ticks.push(i);
          }
          return ticks;
        },
      },
    },
  };

  return <Bar data={availabilityData} options={options} />;
};

export default Availability;
