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

    const weekdayTimes = ['6:00 AM', '6:15 AM', '6:30 AM', '6:45 AM',
                          '7:00 AM', '7:15 AM', '7:30 AM', '7:45 AM',  
                          '8:00 AM', '8:15 AM', '8:30 AM', '8:45 AM',  
                          '9:00 AM', '9:15 AM', '9:30 AM', '9:45 AM',  
                          '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',  
                          '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',  
                          '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',  
                          '1:00 PM', '1:15 PM', '1:30 PM', '1:45 PM',  
                          '2:00 PM', '2:15 PM', '2:30 PM', '2:45 PM',  
                          '3:00 PM', '3:15 PM', '3:30 PM', '3:45 PM',  
                          '4:00 PM', '4:15 PM', '4:30 PM', '4:45 PM',  
                          '5:00 PM', '5:15 PM', '5:30 PM', '5:45 PM',  
                          '6:00 PM', '6:15 PM', '6:30 PM', '6:45 PM',  
                          '7:00 PM', '7:15 PM', '7:30 PM', '7:45 PM',  
                          '8:00 PM', '8:15 PM', '8:30 PM', '8:45 PM',  
                          '9:00 PM'];

    const weekendTimes =  ['8:00 AM', '8:15 AM', '8:30 AM', '8:45 AM',  
                           '9:00 AM', '9:15 AM', '9:30 AM', '9:45 AM',  
                           '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',  
                           '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',  
                           '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',  
                           '1:00 PM', '1:15 PM', '1:30 PM', '1:45 PM',  
                           '2:00 PM', '2:15 PM', '2:30 PM', '2:45 PM',  
                           '3:00 PM', '3:15 PM', '3:30 PM', '3:45 PM',  
                           '4:00 PM', '4:15 PM', '4:30 PM', '4:45 PM',  
                           '5:00 PM', '5:15 PM', '5:30 PM', '5:45 PM',  
                           '6:00 PM'];

    const [date, setDate] = useState('');
    const [currentTime, setCurrentTime] = useState('')
    const [data, setData] = useState([]);
    const [members, setMembers] = useState([]);
    const [hso, setHso] = useState([]);

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
            const newData = await Promise.all(
                weekdayTimes.map(async time => {
                    const memberCount = await getMemberCount(time);
                    const hsoCount = await getHsoCount(time);
                    return {
                        time: time,
                        memberCount: memberCount,
                        hsoCount: hsoCount
                    };
                })
            );
            setData(newData);

            const newMembers = await Promise.all(
                weekdayTimes.map(async time => {
                    return await getMembers(time);
                })
            );
            setMembers(newMembers);

            const newHso = await Promise.all(
                weekdayTimes.map(async time => {
                    return await getHso(time);
                })
            );
            setHso(newHso);
        }

        fetchData();
    }, [date])
    

    async function getMemberCount(time) {
        try {
            const res = await fetch(`https://us-central1-weight-club-e16e5.cloudfunctions.net/getMemberCount?date=${date}&time=${time}`, { method: 'GET' });
            const count = await res.json();
            return count;
        } catch (err) {
            console.log(err);
            return 0;
        }
    }

    async function getHsoCount(time) {
        try {
            const res = await fetch(`https://us-central1-weight-club-e16e5.cloudfunctions.net/getHsoCount?date=${date}&time=${time}`, { method: 'GET' });
            const count = await res.json();
            return count;
        } catch (err) {
            console.log(err);
            return 0;
        }
    }

    async function getMembers(time) {
        try {
            const res = await fetch(`https://us-central1-weight-club-e16e5.cloudfunctions.net/getMembers?date=${date}&time=${time}`, { method: 'GET' });
            const members = await res.json();
            return members;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    async function getHso(time) {
        try {
            const res = await fetch(`https://us-central1-weight-club-e16e5.cloudfunctions.net/getHso?date=${date}&time=${time}`, { method: 'GET' });
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
                <Availability data={data} members={members} hso={hso} />
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
