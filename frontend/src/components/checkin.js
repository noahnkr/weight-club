import { useState } from "react";

const Checkin = () => {

    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckout] = useState('');

    function handleChange(e) {
        let name = e.target.name;
        let value = e.target.value;
        if (name === 'name') { setName(value); } 
        else if (name === 'date') { setDate(value); } 
        else if (name === 'checkin') { setCheckIn(value); } 
        else if (name === 'checkout') { setCheckout(value); }
    }

    function getTimeRange(startTime, endTime) {
        const result = [];
        const parseTime = (timeStr) => {
          const [time, ampm] = timeStr.split(' ');
          const [hour, minute] = time.split(':').map(Number);
          return { hour, minute, ampm };
        };
      
        const { hour: startHour, minute: startMinute, ampm: startAMPM } = parseTime(startTime);
        const { hour: endHour, minute: endMinute, ampm: endAMPM } = parseTime(endTime);
      
        if (
          (startAMPM === 'PM' && endAMPM === 'AM') ||
          (startHour > endHour || (startHour === endHour && startMinute > endMinute))
        ) {
          return result;
        }
      
        let currentHour = startHour;
        let currentMinute = startMinute;
        let currentAMPM = startAMPM;
      
        while (
          currentAMPM !== endAMPM ||
          (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute))
        ) {
          result.push(`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')} ${currentAMPM}`);
          currentMinute = (currentMinute + 15) % 60;
          currentHour = currentMinute === 0 ? (currentHour + 1) % 12 || 12 : currentHour;
          currentAMPM = currentHour === 12 ? (currentAMPM === 'AM' ? 'PM' : 'AM') : currentAMPM;
        }
      
        return result;
      }

    function submit(e) {
        e.preventDefault();
        const range = getTimeRange(checkIn, checkOut);

        if (range.length == 0) {
            window.alert('Check in time must be before check out time.');
            return;
        } else if (name === '') {
            window.alert('Please enter a name.');
            return;
        }

        console.log

        range.forEach(time => {
            fetch(`https://localhost:4000/checkin/member?name=${name}&date=${date}&time=${time}`, {
                method: 'PUT',
                headers: { 'content-type' : 'application/json' }
            })
            .then(res => res.json())
            .catch(err => console.log(err));
        });
    }

    

    return (
        <div className="checkin">
            <p>Name</p>
            <input type="text" name="name" onChange={handleChange} />
            <p>Date</p>
            <input type="date" name="date" onChange={handleChange} />
            <p>Check In</p>
            <input type="time" step="900" name="checkin" onChange={handleChange} />
            <p>Check Out</p>
            <input type="time" step="900" name="checkout" onChange={handleChange} />
            <input type="submit" value="Submit" onClick={submit} />
        </div>
    )



}

export default Checkin;