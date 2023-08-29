import { useEffect, useState } from "react";
import Availability from "./availability";
import { Link } from "react-router-dom";

/*
TODO:
- Add member names to tooltips
- Fix availability chart zoom and scaling, especially for mobile
- HSO checkin, seperate color for chart
*/

const Home = () => {


    const [date, setDate] = useState('');
    const [currentTime, setCurrentTime] = useState('')
    const [data, setData] = useState([]);
    const [members, setMembers] = useState([]);

    // Determine current Date & Time
    useEffect(() => {
        let dateString = new Date().toISOString().split('T')[0];
        let timeString = new Date().toLocaleString().split(', ')[1];
        
        timeString = timeString.substring(0, timeString.length - 6) +
                     timeString.substring(timeString.length - 3, timeString.length); // remove seconds from time

        let min = Number(timeString.substring(timeString.length - 5, timeString.length - 3));
        min = min - (min % 15);

        timeString = timeString.substring(0, timeString.length - 5) + min + timeString.substring(timeString.length - 3, timeString.length);
        
        setDate(dateString);
        setCurrentTime(timeString);
    }, [])

    useEffect(() => {
        async function fetchData() {
            const times = await getTimes();
            console.log(times);
            const memberCount = await getMemberCount();
            const hsoCount = await getHsoCount();
            
            const newData = times.map(time => {
                return {
                    time: time,
                    memberCount: memberCount[time],
                    hsoCount: hsoCount[time]
                };
            });
            setData(newData);

            const memberData = await getMembers();
            const hsoData = await getHso();

            const newMembers = times.map(time => {
                return {
                    time: time,
                    members: memberData[time],
                    hso: hsoData[time]
                };
            })
            setMembers(newMembers);
        }
        
        if (date !== '' && date !== undefined) {
            fetchData();
        }
        
    }, [date])
    

    async function getTimes() {
        try {
            const res = await fetch(`https://us-central1-weight-club-e16e5.cloudfunctions.net/getTimes?date=${date}`, { method: 'GET' });
            const times = await res.json();
            return times;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    async function getMemberCount() {
        try {
            const res = await fetch(`https://us-central1-weight-club-e16e5.cloudfunctions.net/getMemberCount?date=${date}`, { method: 'GET' });
            const count = await res.json();
            return count;
        } catch (err) {
            console.log(err);
            return 0;
        }
    }

    async function getHsoCount() {
        try {
            const res = await fetch(`https://us-central1-weight-club-e16e5.cloudfunctions.net/getHsoCount?date=${date}`, { method: 'GET' });
            const count = await res.json();
            return count;
        } catch (err) {
            console.log(err);
            return 0;
        }
    }

    async function getMembers() {
        try {
            const res = await fetch(`https://us-central1-weight-club-e16e5.cloudfunctions.net/getMembers?date=${date}`, { method: 'GET' });
            const members = await res.json();
            return members;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    async function getHso() {
        try {
            const res = await fetch(`https://us-central1-weight-club-e16e5.cloudfunctions.net/getHso?date=${date}`, { method: 'GET' });
            const members = await res.json();
            return members;
        } catch (err) {
            console.log(err);
            return [];
        }
    }


    return (
        <div className="home">
            <h1 className="heading">Availability</h1>
            <div className="availability-graph">
                <Availability data={data} memberData={members} />
            </div>
            <div className="button">
                <Link exact="true" to="/checkin">Check In »</Link>
            </div>
            <div className="current-members">
                <span>
                    <h2>The Club is </h2>
                </span>

            </div>
        </div>
    )

}

export default Home;
