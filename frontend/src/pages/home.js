import { useEffect, useState } from 'react'
import Availability from '../components/availability'
import Checkin from '../components/checkin'
import { UserOutlined, LoadingOutlined } from '@ant-design/icons'
import { Spin, message } from 'antd' // Import message for alerts
import '../styles/home.css'

const Home = () => {
    document.title = 'ISU Weight Club | Home'
    const [currentDate, setCurrentDate] = useState(new Date())
    const [memberData, setMemberData] = useState({
        memberCounts: {},
        hsoCounts: {},
        memberNames: {},
        hsoNames: {},
    })

    const [isLoading, setIsLoading] = useState(false)
    const [animationClass, setAnimationClass] = useState('')

    // Update graph data when the date is changed
    useEffect(() => {
        fetchData()
    }, [currentDate])

    const fetchData = async () => {
        setIsLoading(true)

        // Format current date into 'YYYY-MM-DD'
        const year = currentDate.getFullYear()
        const month = String(currentDate.getMonth() + 1).padStart(2, '0')
        const day = String(currentDate.getDate()).padStart(2, '0')
        const date = `${year}-${month}-${day}`

        try {
            // Fetch member counts
            const countsResponse = await fetch(
                `https://us-central1-weight-club-e16e5.cloudfunctions.net/getMemberCounts?date=${date}`,
                { method: 'GET' }
            )
            const countsData = await countsResponse.json()

            // Fetch member names
            const namesResponse = await fetch(
                `https://us-central1-weight-club-e16e5.cloudfunctions.net/getMemberNames?date=${date}`,
                { method: 'GET' }
            )
            const namesData = await namesResponse.json()

            // Update state with fetched data
            setMemberData({
                memberCounts: countsData.memberCounts,
                hsoCounts: countsData.hsoCounts,
                memberNames: namesData.memberNames,
                hsoNames: namesData.hsoNames,
            })
        } catch (error) {
            console.error('Error fetching data:', error)
            message.error('Failed to fetch data. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    function formatDateToReadable(date) {
        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ]

        const year = date.getFullYear()
        const month = months[date.getMonth()]
        const day = date.getDate()

        let daySuffix = 'th'
        if (day === 1 || day === 21 || day === 31) {
            daySuffix = 'st'
        } else if (day === 2 || day === 22) {
            daySuffix = 'nd'
        } else if (day === 3 || day === 23) {
            daySuffix = 'rd'
        }

        return `${month} ${day}${daySuffix}, ${year}`
    }

    const handleLeftArrow = () => {
        setAnimationClass('slide-left-exit')

        const previousDate = new Date(currentDate)
        previousDate.setDate(previousDate.getDate() - 1)
        setCurrentDate(previousDate)

        setTimeout(() => {
            setAnimationClass('slide-left-enter')
        }, [100])

        setTimeout(() => {
            setAnimationClass('')
        }, [200])
    }

    const handleRightArrow = () => {
        setAnimationClass('slide-right-exit')

        const nextDate = new Date(currentDate)
        nextDate.setDate(nextDate.getDate() + 1)
        setCurrentDate(nextDate)

        setTimeout(() => {
            setAnimationClass('slide-right-enter')
        }, [100])

        setTimeout(() => {
            setAnimationClass('')
        }, [200])
    }

    return (
        <div className="home">
            <div className="date-controller">
                <div className="left" onClick={handleLeftArrow}>
                    <h3 className="subheading">&lt;</h3>
                </div>
                <div
                    className="date-container"
                    onClick={() => setCurrentDate(new Date())}
                >
                    <h3 className={`date subheading ${animationClass}`}>
                        {formatDateToReadable(currentDate)}
                    </h3>
                </div>
                <div className="right" onClick={handleRightArrow}>
                    <h3 className="subheading">&gt;</h3>
                </div>
            </div>

            <div className="graph-container">
                {isLoading ? (
                    <Spin
                        indicator={<LoadingOutlined style={{ fontSize: 128 }} spin />}
                        size="large"
                    />
                ) : (
                    <div className="availability-graph">
                        <Availability memberData={memberData} />
                    </div>
                )}
            </div>
            <Checkin onCheckinAdded={fetchData} />
        </div>
    )
}

export default Home
