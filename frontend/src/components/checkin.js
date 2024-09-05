import { useState } from 'react'
import { UserOutlined, LoadingOutlined } from '@ant-design/icons'
import { Input, DatePicker, TimePicker, Switch, Spin, Select, message } from 'antd' // Import message
import dayjs from 'dayjs'
import '../styles/checkin.css'

const { Option } = Select

const Checkin = ({ onCheckinAdded }) => {
    const [name, setName] = useState(null) // State for name input
    const [isHso, setIsHso] = useState(false) // State for HSO switch
    const [isAnon, setIsAnon] = useState(false) // State for Anonymous switch
    const [isRepeat, setIsRepeat] = useState(false) // State for Repeat switch
    const [selectedDays, setSelectedDays] = useState([]) // State to track selected days of the week
    const [submitting, setSubmitting] = useState(false) // State to handle loading wheel
    const [selectedDate, setSelectedDate] = useState(null) // State to track the selected date
    const [timeRange, setTimeRange] = useState([null, null]) // State to track start and end times

    const handleNameChange = (e) => {
        setName(e.target.value)
    }

    const handleDateChange = (date) => {
        setSelectedDate(date)
    }

    const handleTimeChange = (times) => {
        setTimeRange(times)
    }

    const handleDaysChange = (days) => {
        setSelectedDays(days)
    }

    const disabledTime = () => {
        if (!selectedDate) return {}
        const dayOfWeek = selectedDate.day()

        switch (dayOfWeek) {
            case 0: // Sunday
                return {
                    disabledHours: () => [...Array(8).keys(), 24], // Disable hours before 8 AM and after 11 PM
                    disabledMinutes: (hour) => (hour === 24 ? [0] : []), // Disable 12:00 AM
                }
            case 1: // Monday
            case 2: // Tuesday
            case 3: // Wednesday
            case 4: // Thursday
                return {
                    disabledHours: () => [...Array(6).keys()], // Disable hours before 6 AM
                }
            case 5: // Friday
                return {
                    disabledHours: () => [...Array(6).keys(), 22, 23, 24], // Disable hours before 6 AM and after 10 PM
                    disabledMinutes: (hour) => (hour === 24 ? [0] : []), // Disable 12:00 AM
                }
            case 6: // Saturday
                return {
                    disabledHours: () => [...Array(8).keys(), 18, 19, 20, 21, 22, 23, 24], // Disable hours before 8 AM and after 6 PM
                    disabledMinutes: (hour) => (hour === 24 ? [0] : []), // Disable 12:00 AM
                }
            default:
                return {}
        }
    }

    // Function to get the date for a specific day of the week within the current week
    function getDateForDay(day) {
        const today = dayjs()
        const currentWeekday = today.day() // Current day of the week (0 = Sunday, 6 = Saturday)
        const targetDay = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ].indexOf(day)
        // Ensure the target date is within the current week
        if (targetDay < currentWeekday) {
            // If the target day is before today, skip creating a check-in for it
            return null
        }

        return today.add(targetDay - currentWeekday, 'day')
    }

    const handleSubmit = async () => {
        if (!name || !selectedDate || !timeRange[0] || !timeRange[1]) {
            message.error('Please fill in all required fields.')
            return
        }

        setSubmitting(true)

        // Extract the date, start time, and end time
        const formattedDate = selectedDate.format('YYYY-MM-DD') // Ensure date is formatted correctly
        const startTime = timeRange[0].format('HH:mm')
        const endTime = timeRange[1].format('HH:mm')

        try {
            if (isRepeat) {
                // Add repeating check-in
                const response = await fetch(
                    'https://us-central1-weight-club-e16e5.cloudfunctions.net/addRepeatingCheckin',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            name: name,
                            days: selectedDays.join(','),
                            startTime: startTime,
                            endTime: endTime,
                            isHso: isHso,
                            isAnonymous: isAnon,
                        }),
                    }
                )

                if (response.ok) {
                    message.success('Repeating check-in added successfully!')

                    // Create individual check-ins for the selected repeating days within the current week
                    for (const day of selectedDays) {
                        const targetDate = getDateForDay(day)
                        if (targetDate) {
                            // Only create if the date is valid
                            const individualResponse = await fetch(
                                'https://us-central1-weight-club-e16e5.cloudfunctions.net/addIndividualCheckin',
                                {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        name: name,
                                        date: targetDate.format('YYYY-MM-DD'), // Ensure the date is in 'YYYY-MM-DD' format
                                        startTime: startTime,
                                        endTime: endTime,
                                        isHso: isHso,
                                        isAnonymous: isAnon,
                                    }),
                                }
                            )

                            if (!individualResponse.ok) {
                                console.error(
                                    'Failed to add individual check-in for repeating day:',
                                    individualResponse.status,
                                    individualResponse.statusText
                                )
                                message.error(
                                    'Failed to add individual check-in for a repeating day. Please try again.'
                                )
                            }
                        }
                    }

                    onCheckinAdded() // Call the callback to refresh the graph
                } else {
                    console.error(
                        'Failed to add repeating check-in:',
                        response.status,
                        response.statusText
                    )
                    message.error('Failed to add repeating check-in. Please try again.')
                }
            } else {
                // Add individual check-in
                const response = await fetch(
                    'https://us-central1-weight-club-e16e5.cloudfunctions.net/addIndividualCheckin',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            name: name,
                            date: formattedDate,
                            startTime: startTime,
                            endTime: endTime,
                            isHso: isHso,
                            isAnonymous: isAnon,
                        }),
                    }
                )

                if (response.ok) {
                    message.success('Individual check-in added successfully!')
                    onCheckinAdded() // Call the callback to refresh the graph
                } else {
                    console.error(
                        'Failed to add individual check-in:',
                        response.status,
                        response.statusText
                    )
                    message.error('Failed to add individual check-in. Please try again.')
                }
            }
        } catch (error) {
            console.error('Error making request:', error)
            message.error('Error making request. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="checkin">
            <div className="checkin-form">
                <div className="input-container">
                    <Input
                        placeholder="Name"
                        suffix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                        onChange={handleNameChange}
                    />
                </div>
                <div className="input-container">
                    <DatePicker onChange={handleDateChange} />
                </div>
                <div className="input-container">
                    <TimePicker.RangePicker
                        format={'h:mm A'}
                        minuteStep={15}
                        disabledTime={disabledTime} // Set disabled times based on selected date
                        onChange={handleTimeChange}
                        use12Hours
                    />
                </div>
                <div className="switch-container">
                    <div className="switch-item">
                        <span>HSO</span>
                        <Switch
                            checked={isHso}
                            onChange={(checked) => setIsHso(checked)}
                        />
                    </div>
                    <div className="switch-item">
                        <span>Anonymous</span>
                        <Switch
                            checked={isAnon}
                            onChange={(checked) => setIsAnon(checked)}
                        />
                    </div>
                    <div className="switch-item">
                        <span>Repeat</span>
                        <Switch
                            checked={isRepeat}
                            onChange={(checked) => setIsRepeat(checked)}
                        />
                    </div>
                </div>
                {isRepeat && (
                    <div className="input-container">
                        <Select
                            mode="multiple"
                            placeholder="Select days to repeat"
                            onChange={handleDaysChange}
                            style={{ width: '100%' }}
                        >
                            <Option value="Monday">Monday</Option>
                            <Option value="Tuesday">Tuesday</Option>
                            <Option value="Wednesday">Wednesday</Option>
                            <Option value="Thursday">Thursday</Option>
                            <Option value="Friday">Friday</Option>
                            <Option value="Saturday">Saturday</Option>
                            <Option value="Sunday">Sunday</Option>
                        </Select>
                    </div>
                )}
                {submitting ? (
                    <Spin
                        indicator={<LoadingOutlined style={{ fontSize: 64 }} spin />}
                        size="large"
                    />
                ) : (
                    <div className="button" id="submit-button" onClick={handleSubmit}>
                        Check In »
                    </div>
                )}
            </div>
        </div>
    )
}

export default Checkin
