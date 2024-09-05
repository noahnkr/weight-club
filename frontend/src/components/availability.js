import React from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart } from 'chart.js/auto'
import AnnotationPlugin from 'chartjs-plugin-annotation'
import ZoomPlugin from 'chartjs-plugin-zoom'

// Register plugins outside of the component to avoid re-registering them on each render
Chart.register(AnnotationPlugin, ZoomPlugin)

// Utility function to convert 24-hour format to 12-hour format
const convertTo12HourFormat = (time24) => {
    const [hours, minutes] = time24.split(':')
    let period = 'AM'
    let hours12 = parseInt(hours, 10)

    if (hours12 >= 12) {
        period = 'PM'
        if (hours12 > 12) {
            hours12 -= 12
        }
    } else if (hours12 === 0) {
        hours12 = 12
    }

    // Return formatted time
    return `${hours12}:${minutes} ${period}`
}

const Availability = ({ memberData }) => {
    const { memberCounts, hsoCounts, memberNames, hsoNames } = memberData

    const intervals = Object.keys(memberCounts) // X-axis labels (15-minute intervals)
    const memberCountsData = intervals.map((interval) => memberCounts[interval]) // Y-axis data for members
    const hsoCountsData = intervals.map((interval) => hsoCounts[interval]) // Y-axis data for HSOs

    // Convert intervals from 24-hour to 12-hour format for display
    const formattedIntervals = intervals.map(convertTo12HourFormat)

    const data = {
        labels: formattedIntervals,
        datasets: [
            {
                label: 'HSO',
                data: hsoCountsData,
                backgroundColor: 'rgba(28, 217, 78, 0.3)',
                borderColor: 'rgb(28, 217, 78)',
                borderWidth: 2,
            },
            {
                label: 'Member',
                data: memberCountsData,
                backgroundColor: 'rgba(54, 162, 235, 0.3)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 2,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'category',
                stacked: true,
            },
            y: {
                beginAtZero: true,
                min: 0,
                max: 8,
                stacked: true,
                ticks: {
                    stepSize: 1, // Controls the increment step size
                },
            },
        },
        plugins: {
            zoom: {
                zoom: {
                    wheel: { enabled: true },
                    pinch: { enabled: true },
                    mode: 'xy',
                },
                pan: {
                    enabled: true,
                    mode: 'xy',
                },
                limits: {
                    y: { min: 0, max: 50 },
                },
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const names = ctx.datasetIndex === 0 ? hsoNames : memberNames
                        const interval = intervals[ctx.dataIndex]
                        return names[interval]
                    },
                },
            },
            legend: {
                display: true,
            },
            annotation: {
                annotations: {
                    minMembers: {
                        type: 'line',
                        yMin: 3,
                        yMax: 3,
                        borderColor: 'black',
                        borderWidth: 1,
                    },
                },
            },
        },
    }

    return <Bar data={data} options={options} />
}

export default Availability
