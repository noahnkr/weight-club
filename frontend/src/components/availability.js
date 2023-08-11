import { Bar } from 'react-chartjs-2';
import { useState } from 'react';
import { Chart } from 'chart.js/auto';
import 'chartjs-plugin-zoom';

const Availability = () => {

  const times = [['6:00 AM', '6:15 AM', '6:30 AM', '6:45 AM'],
                 ['7:00 AM', '7:15 AM', '7:30 AM', '7:45 AM'],  
                 ['8:00 AM', '8:15 AM', '8:30 AM', '8:45 AM'],  
                 ['9:00 AM', '9:15 AM', '9:30 AM', '9:45 AM'],  
                 ['10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM'],  
                 ['11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM'],  
                 ['12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM'],  
                 ['1:00 PM', '1:15 PM', '1:30 PM', '1:45 PM'],  
                 ['2:00 PM', '2:15 PM', '2:30 PM', '2:45 PM'],  
                 ['3:00 PM', '3:15 PM', '3:30 PM', '3:45 PM'],  
                 ['4:00 PM', '4:15 PM', '4:30 PM', '4:45 PM'],  
                 ['5:00 PM', '5:15 PM', '5:30 PM', '5:45 PM'],  
                 ['6:00 PM', '6:15 PM', '6:30 PM', '6:45 PM'],  
                 ['7:00 PM', '7:15 PM', '7:30 PM', '7:45 PM'],  
                 ['8:00 PM', '8:15 PM', '8:30 PM', '8:45 PM'],  
                 ['9:00 PM']];


  const [availabilityData, setAvailabilityData] = useState(times.map(time => {
    return {
      time: time[0],
      count: Math.round(Math.random() * 10)
    }
  }));

  const [chartData, setChartData] = useState({
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
  });

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