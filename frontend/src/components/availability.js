import { Bar } from 'react-chartjs-2';
import { useState } from 'react';
import { Chart } from 'chart.js/auto';
import 'chartjs-plugin-zoom';

const Availability = (props) => {

  /*const [availabilityData, setAvailabilityData] = useState(times.map(time => {
    return {
      time: time[0],
      count: Math.round(Math.random() * 10)
    }
  }));*/

  const availabilityData = props.data;
  console.log(availabilityData);

  const chartData = {
    labels: availabilityData.map(data => data.time), 
    datasets: [
      {
        label: 'Members',
        data: availabilityData.map(data => data.count),
        backgroundColor: availabilityData.map(data => data.count < 3 ? 'rgba(255, 99, 132, 0.3)' : 'rgba(54, 162, 235, 0.3)'),
        borderColor: availabilityData.map(data => data.count < 3 ? 'rgb(255, 99, 132)' : 'rgb(54, 162, 235)'),
        borderWidth: 2
      }
    ]
  };

  return (
      <Bar
        data={chartData}
        options={{
          plugins: {
            tooltip: {
              callbacks: {
                title: () => '',
                label: (ctx) => {
                  return 'BRUH';
                }
              }
            },
            legend: {
              display: false
            }
          }
        }}
      />
  );
};

export default Availability;