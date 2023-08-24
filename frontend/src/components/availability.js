import { Bar } from 'react-chartjs-2';
import { Chart } from 'chart.js/auto'


const Availability = ({ data, members }) => {

  const chartData = {
    labels: data.map(data => data.time), 
    datasets: [
      {
        label: 'Members',
        data: data.map(data => data.count),
        backgroundColor: data.map(data => data.count < 3 ? 'rgba(255, 99, 132, 0.3)' : 'rgba(54, 162, 235, 0.3)'),
        borderColor: data.map(data => data.count < 3 ? 'rgb(255, 99, 132)' : 'rgb(54, 162, 235)'),
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
    }
  };

  return <Bar data={chartData} options={chartOptions} />
};

export default Availability;