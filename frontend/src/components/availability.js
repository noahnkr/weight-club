import { Bar } from 'react-chartjs-2';
import { Chart } from 'chart.js/auto'


const Availability = ({ data, members, hso }) => {

  const chartData = {
    labels: data.map(data => data.time), 
    datasets: [
      {
        label: 'Members',
        data: data.map(data => data.memberCount),
        backgroundColor: 'rgba(54, 162, 235, 0.3)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2
      },
      {
        label: 'HSO',
        data: data.map(data => data.hsoCount),
        backgroundColor: 'rgba(202, 255, 191, 0.3)',
        borderColor: 'rgb(202, 255, 191)',
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    plugins: {
      title: { display: true, text: 'My Chart' },
      zoom: {
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'xy'
        },
        pan: {
          enabled: true,
          mode: 'x'
        }
      },
      tooltip: {
        callbacks: {
          title: () => 'Members:',
          label: (ctx) => members[ctx.dataIndex].join(', ')
        }
      },
      legend: {
        display: false
      }
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true }
    }
  };

  return <Bar data={chartData} options={chartOptions} />
};

export default Availability;