import { useState } from 'react'
import { UserOutlined, LoadingOutlined } from '@ant-design/icons'
import { Input, DatePicker, TimePicker, Switch, Select, Spin, message } from 'antd'
import { isValidTimeRange } from '../components/checkin'
import dayjs from 'dayjs'
import '../styles/style.css'
import '../styles/checkin.css'
import '../styles/update.css'

const { Option } = Select

const Update = () => {
    const [foundCheckins, setFoundCheckins] = useState(false) // State controlling update form inputs
    const [finding, setFinding] = useState(false) // State controlling the wheel while finding checkins

    const [name, setName] = useState(null)
    const [selectedDate, setSelectedDate] = useState(null)

    // Each state hook is an array with each element containing check-in information.
    // Since users can havee several check-ins (individual and repeating), each check-in
    // entry's information is stored at the corresponding index across the state arrays.
    const [individualIds, setIndividualIds] = useState([])
    const [individualTimeRanges, setIndividualTimeRanges] = useState([])
    const [individualIsHso, setIndividualIsHso] = useState([])
    const [individualIsAnon, setIndividualIsAnon] = useState([])
    const [individualUpdatingOrDeleting, setIndividualUpdatingOrDeleting] = useState([]) // State controlling each individual update item's wheel

    const [repeatingIds, setRepeatingIds] = useState([])
    const [repeatingTimeRanges, setRepeatingTimeRanges] = useState([])
    const [repeatingIsHso, setRepeatingIsHso] = useState([])
    const [repeatingIsAnon, setRepeatingIsAnon] = useState([])
    const [repeatingDays, setRepeatingDays] = useState([])
    const [repeatingUpdatingOrDeleting, setRepeatingUpdatingOrDeleting] = useState([]) // State controlling each repeating update item's wheel

    const handleNameChange = (e) => {
        setName(e.target.value)
    }

    const handleDateChange = (date) => {
        setSelectedDate(date)
    }

    const handleTimeChange = (times, index, repeating) => {
        if (repeating) {
            const updatedTimeRanges = [...repeatingTimeRanges]
            updatedTimeRanges[index] = times
            setRepeatingTimeRanges(updatedTimeRanges)
        } else {
            const updatedTimeRanges = [...individualTimeRanges]
            updatedTimeRanges[index] = times
            setIndividualTimeRanges(updatedTimeRanges)
        }
    }

    const handleHsoChange = (checked, index, repeating) => {
        if (repeating) {
            const updatedHso = [...repeatingIsHso]
            updatedHso[index] = checked
            setRepeatingIsHso(updatedHso)
        } else {
            const updatedHso = [...individualIsHso]
            updatedHso[index] = checked
            setIndividualIsHso(updatedHso)
        }
    }

    const handleAnonChange = (checked, index, repeating) => {
        if (repeating) {
            const updatedAnon = [...repeatingIsAnon]
            updatedAnon[index] = checked
            setRepeatingIsAnon(updatedAnon)
        } else {
            const updatedAnon = [...individualIsAnon]
            updatedAnon[index] = checked
            setIndividualIsAnon(updatedAnon)
        }
    }

    const handleDaysChange = (days, index) => {
        const updatedDays = [...repeatingDays]
        updatedDays[index] = days
        setRepeatingDays(updatedDays)
    }

    const findCheckIns = async () => {
        if (!name || !selectedDate) {
            message.error('Please fill in all required fields.')
            return
        }

        setFinding(true)

        try {
            // Fetch individual check-ins
            const individualResponse = await fetch(
                `https://us-central1-weight-club-e16e5.cloudfunctions.net/getIndividualCheckins?name=${name.trim()}&date=${selectedDate.format(
                    'YYYY-MM-DD'
                )}`,
                {
                    method: 'GET',
                }
            )
            const individualData = await individualResponse.json()

            // Fetch repeating check-ins
            const repeatingResponse = await fetch(
                `https://us-central1-weight-club-e16e5.cloudfunctions.net/getRepeatingCheckins?name=${name.trim()}`,
                {
                    method: 'GET',
                }
            )
            const repeatingData = await repeatingResponse.json()

            // Check if any check-ins were found
            if (individualData.length === 0 && repeatingData.length === 0) {
                message.info(
                    `No check-ins found on ${selectedDate.format(
                        'MMMM Do, YYYY'
                    )} for \`${name.trim()}\`.`
                )
                setFinding(false)
                setFoundCheckins(false)
                return
            }
            // Update state with individual check-ins
            const formattedIndividualTimeRanges = individualData.map((checkin) => [
                dayjs(checkin.startTime, 'HH:mm'),
                dayjs(checkin.endTime, 'HH:mm'),
            ])
            setIndividualTimeRanges(formattedIndividualTimeRanges)
            setIndividualIsHso(individualData.map((checkin) => checkin.isHso))
            setIndividualIsAnon(individualData.map((checkin) => checkin.isAnonymous))
            setIndividualIds(individualData.map((checkin) => checkin.id))
            setIndividualUpdatingOrDeleting(individualTimeRanges.map(() => false))

            // Update state with repeating check-ins
            const formattedRepeatingTimeRanges = repeatingData.map((checkin) => [
                dayjs(checkin.startTime, 'HH:mm'),
                dayjs(checkin.endTime, 'HH:mm'),
            ])
            setRepeatingTimeRanges(formattedRepeatingTimeRanges)
            setRepeatingIsHso(repeatingData.map((checkin) => checkin.isHso))
            setRepeatingIsAnon(repeatingData.map((checkin) => checkin.isAnonymous))
            setRepeatingDays(repeatingData.map((checkin) => checkin.days.split(',')))
            setRepeatingIds(repeatingData.map((checkin) => checkin.id))
            setRepeatingUpdatingOrDeleting(repeatingTimeRanges.map(() => false))
            setFoundCheckins(true)
        } catch (error) {
            console.error('Error fetching check-ins:', error)
            message.error('Failed to fetch check-ins. Please try again later.')
        } finally {
            setFinding(false)
        }
    }

    const updateCheckin = async (index, repeating) => {
        // Replace this update and delete item's buttons with loading wheel
        if (repeating) {
            const newUpdatingOrDeleting = [...repeatingUpdatingOrDeleting]
            newUpdatingOrDeleting[index] = true
            setRepeatingUpdatingOrDeleting(newUpdatingOrDeleting)
        } else {
            const newUpdatingOrDeleting = [...individualUpdatingOrDeleting]
            newUpdatingOrDeleting[index] = true
            setIndividualUpdatingOrDeleting(newUpdatingOrDeleting)
        }

        try {
            const id = repeating ? repeatingIds[index] : individualIds[index]
            const timeRange = repeating
                ? repeatingTimeRanges[index]
                : individualTimeRanges[index]
            const startTime = timeRange[0].format('HH:mm')
            const startTime12 = timeRange[0].format('h:mm A')
            const endTime = timeRange[1].format('HH:mm')
            const endTime12 = timeRange[1].format('h:mm A')
            const isHso = repeating ? repeatingIsHso[index] : individualIsHso[index]
            const isAnonymous = repeating
                ? repeatingIsAnon[index]
                : individualIsAnon[index]

            // Ensure repeating checkin time is valid for each day
            if (repeating) {
                for (const day of repeatingDays[index]) {
                    if (!isValidTimeRange(day, startTime, endTime)) {
                        message.error(
                            `Check-in from ${startTime12} - ${endTime12} is not valid on ${day}. Please check Beyer hall hours.`
                        )
                        return
                    }
                }
            }

            const response = repeating
                ? await fetch(
                      'https://us-central1-weight-club-e16e5.cloudfunctions.net/updateRepeatingCheckin',
                      {
                          method: 'PUT',
                          headers: {
                              'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                              id: id,
                              days: repeatingDays.join(','),
                              startTime: startTime,
                              endTime: endTime,
                              isHso: isHso,
                              isAnonymous: isAnonymous,
                          }),
                      }
                  )
                : await fetch(
                      'https://us-central1-weight-club-e16e5.cloudfunctions.net/updateIndividualCheckin',
                      {
                          method: 'PUT',
                          headers: {
                              'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                              id: id,
                              startTime: startTime,
                              endTime: endTime,
                              isHso: isHso,
                              isAnonymous: isAnonymous,
                          }),
                      }
                  )

            if (response.ok) {
                const data = await response.json()
                message.success(
                    `${
                        repeating ? 'Repeating' : 'Individual'
                    } check-in updated successfully!`
                )
            } else {
                message.error(
                    `Failed to update ${repeating ? 'repeating' : 'individual'} check-in.`
                )
            }
        } catch (error) {
            console.error('Error making request:', error)
            message.error('Error occurred while updating check-in.')
        } finally {
            if (repeating) {
                const newUpdatingOrDeleting = [...repeatingUpdatingOrDeleting]
                newUpdatingOrDeleting[index] = false
                setRepeatingUpdatingOrDeleting(newUpdatingOrDeleting)
            } else {
                const newUpdatingOrDeleting = [...individualUpdatingOrDeleting]
                newUpdatingOrDeleting[index] = false
                setIndividualUpdatingOrDeleting(newUpdatingOrDeleting)
            }
        }
    }

    const deleteCheckin = async (index, repeating) => {
        // Replace this update and delete item's buttons with loading wheel
        if (repeating) {
            const newUpdatingOrDeleting = [...repeatingUpdatingOrDeleting]
            newUpdatingOrDeleting[index] = true
            setRepeatingUpdatingOrDeleting(newUpdatingOrDeleting)
        } else {
            const newUpdatingOrDeleting = [...individualUpdatingOrDeleting]
            newUpdatingOrDeleting[index] = true
            setIndividualUpdatingOrDeleting(newUpdatingOrDeleting)
        }

        try {
            const id = repeating ? repeatingIds[index] : individualIds[index]
            const response = await fetch(
                `https://us-central1-weight-club-e16e5.cloudfunctions.net/deleteCheckin?id=${id}&repeating=${repeating}`,
                {
                    method: 'DELETE',
                }
            )

            if (response.ok) {
                const data = await response.json()
                message.success(
                    `${
                        repeating ? 'Repeating' : 'Individual'
                    } check-in deleted successfully!`
                )

                // Remove the deleted check-in from the state
                if (repeating) {
                    const updatedRepeatingTimeRanges = [...repeatingTimeRanges]
                    const updatedRepeatingIsHso = [...repeatingIsHso]
                    const updatedRepeatingIsAnon = [...repeatingIsAnon]
                    const updatedRepeatingDays = [...repeatingDays]
                    const updatedRepeatingIds = [...repeatingIds]

                    updatedRepeatingTimeRanges.splice(index, 1)
                    updatedRepeatingIsHso.splice(index, 1)
                    updatedRepeatingIsAnon.splice(index, 1)
                    updatedRepeatingDays.splice(index, 1)
                    updatedRepeatingIds.splice(index, 1)

                    setRepeatingTimeRanges(updatedRepeatingTimeRanges)
                    setRepeatingIsHso(updatedRepeatingIsHso)
                    setRepeatingIsAnon(updatedRepeatingIsAnon)
                    setRepeatingDays(updatedRepeatingDays)
                    setRepeatingIds(updatedRepeatingIds)
                } else {
                    const updatedIndividualTimeRanges = [...individualTimeRanges]
                    const updatedIndividualIsHso = [...individualIsHso]
                    const updatedIndividualIsAnon = [...individualIsAnon]
                    const updatedIndividualIds = [...individualIds]

                    updatedIndividualTimeRanges.splice(index, 1)
                    updatedIndividualIsHso.splice(index, 1)
                    updatedIndividualIsAnon.splice(index, 1)
                    updatedIndividualIds.splice(index, 1)

                    setIndividualTimeRanges(updatedIndividualTimeRanges)
                    setIndividualIsHso(updatedIndividualIsHso)
                    setIndividualIsAnon(updatedIndividualIsAnon)
                    setIndividualIds(updatedIndividualIds)
                }
            } else {
                message.error(
                    `Failed to delete ${repeating ? 'repeating' : 'individual'} check-in.`
                )
            }
        } catch (error) {
            console.error('Error making request:', error)
            message.error('Error occurred while deleting check-in.')
        } finally {
            if (repeating) {
                const newUpdatingOrDeleting = [...repeatingUpdatingOrDeleting]
                newUpdatingOrDeleting[index] = false
                setRepeatingUpdatingOrDeleting(newUpdatingOrDeleting)
            } else {
                const newUpdatingOrDeleting = [...individualUpdatingOrDeleting]
                newUpdatingOrDeleting[index] = false
                setIndividualUpdatingOrDeleting(newUpdatingOrDeleting)
            }
        }
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

    return (
        <div className="update">
            <h1 className="heading">Update Check In</h1>
            {!foundCheckins ? (
                <div className="update-form">
                    <div className="input-container">
                        <Input
                            placeholder="Name"
                            suffix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                            onChange={handleNameChange}
                        />
                    </div>
                    <div className="input-container">
                        <DatePicker onChange={handleDateChange} inputReadOnly />
                    </div>
                    {finding ? (
                        <Spin
                            indicator={<LoadingOutlined style={{ fontSize: 64 }} spin />}
                            size="large"
                        />
                    ) : (
                        <div className="button" id="submit-button" onClick={findCheckIns}>
                            Find »
                        </div>
                    )}
                </div>
            ) : (
                <div className="update-form">
                    {individualTimeRanges.length != 0 ? (
                        <h2 className="subheading update-date">
                            {selectedDate ? selectedDate.format('MMMM Do, YYYY') : ''}
                        </h2>
                    ) : (
                        <></>
                    )}
                    {individualTimeRanges.map((individual, index) => (
                        <div className="update-item" key={index}>
                            <div className="input-container">
                                <TimePicker.RangePicker
                                    format={'h:mm A'}
                                    minuteStep={15}
                                    disabledTime={disabledTime}
                                    value={individual}
                                    onChange={(times) =>
                                        handleTimeChange(times, index, false)
                                    }
                                    use12Hours
                                    inputReadOnly
                                />
                            </div>
                            <div className="switch-container">
                                <div className="switch-item">
                                    <span>HSO</span>
                                    <Switch
                                        checked={individualIsHso[index]}
                                        onChange={(checked) =>
                                            handleHsoChange(checked, index, false)
                                        }
                                    />
                                </div>
                                <div className="switch-item">
                                    <span>Anonymous</span>
                                    <Switch
                                        checked={individualIsAnon[index]}
                                        onChange={(checked) =>
                                            handleAnonChange(checked, index, false)
                                        }
                                    />
                                </div>
                            </div>
                            {individualUpdatingOrDeleting[index] ? (
                                <div className="update-delete-container spin-container">
                                    <Spin
                                        indicator={
                                            <LoadingOutlined
                                                style={{ fontSize: 64 }}
                                                spin
                                            />
                                        }
                                        size="large"
                                    />
                                </div>
                            ) : (
                                <div className="update-delete-container">
                                    <div
                                        className="button"
                                        onClick={() => updateCheckin(index, false)}
                                    >
                                        Update »
                                    </div>
                                    <div
                                        className="button"
                                        onClick={() => deleteCheckin(index, false)}
                                    >
                                        Delete »
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {repeatingTimeRanges.length != 0 ? (
                        <h2 className="subheading update-date">Repeating</h2>
                    ) : (
                        <></>
                    )}
                    {repeatingTimeRanges.map((repeating, index) => (
                        <div className="update-item" key={index}>
                            <div className="input-container">
                                <TimePicker.RangePicker
                                    format={'h:mm A'}
                                    minuteStep={15}
                                    value={repeating}
                                    onChange={(times) =>
                                        handleTimeChange(times, index, true)
                                    }
                                    use12Hours
                                    inputReadOnly
                                />
                            </div>
                            <div className="switch-container">
                                <div className="switch-item">
                                    <span>HSO</span>
                                    <Switch
                                        checked={repeatingIsHso[index]}
                                        onChange={(checked) =>
                                            handleHsoChange(checked, index, true)
                                        }
                                    />
                                </div>
                                <div className="switch-item">
                                    <span>Anonymous</span>
                                    <Switch
                                        checked={repeatingIsAnon[index]}
                                        onChange={(checked) =>
                                            handleAnonChange(checked, index, true)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="input-container">
                                <Select
                                    mode="multiple"
                                    placeholder="Select days to repeat"
                                    value={repeatingDays[index]}
                                    onChange={(days) => handleDaysChange(days, index)}
                                    style={{ width: '100%' }}
                                    showSearch={false}
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
                            {repeatingUpdatingOrDeleting[index] ? (
                                <div className="update-delete-container spin-container">
                                    <Spin
                                        indicator={
                                            <LoadingOutlined
                                                style={{ fontSize: 64 }}
                                                spin
                                            />
                                        }
                                        size="large"
                                    />
                                </div>
                            ) : (
                                <div className="update-delete-container">
                                    <div
                                        className="button"
                                        onClick={() => updateCheckin(index, true)}
                                    >
                                        Update »
                                    </div>
                                    <div
                                        className="button"
                                        onClick={() => deleteCheckin(index, true)}
                                    >
                                        Delete »
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Update
