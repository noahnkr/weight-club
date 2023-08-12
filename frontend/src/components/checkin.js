import { useState } from "react";
import '../styles/checkin.css';

const Checkin = () => {

    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [checkinHour, setCheckinHour] = useState('06');
    const [checkinMin, setCheckinMin] = useState('00');
    const [checkinAMPM, setCheckinAMPM] = useState('AM');
    const [checkoutHour, setCheckoutHour] = useState('09');
    const [checkoutMin, setCheckoutMin] = useState('00');
    const [checkoutAMPM, setCheckoutAMPM] = useState('PM');

    function handleChange(e) {
        let name = e.target.name;
        let value = e.target.value;
        if (name.includes('checkin')) {
            if (name.includes('Hour')) { setCheckinHour(value); } 
            else if (name.includes('Min')) { setCheckinMin(value); } 
            else if (name.includes('AMPM')) { setCheckinAMPM(value); }
        } else if (name.includes('checkout')) {
            if (name.includes('Hour')) { setCheckoutHour(value); } 
            else if (name.includes('Min')) { setCheckoutMin(value); } 
            else if (name.includes('AMPM')) { setCheckoutAMPM(value); }
        } else if (name === 'name') {
          setName(value);
        } else if (name === 'date') {
          setDate(value);
        }
    }

    function submit(e) {
        e.preventDefault();
        const checkin = `${checkinHour}:${checkinMin} ${checkinAMPM}`;
        const checkout = `${checkoutHour}:${checkoutMin} ${checkoutAMPM}`;
        const range = getTimeRange(checkin, checkout);

        if (range.length == 0) {
            window.alert('Check in time must be before check out time.');
            return;
        } else if (name === '' || date === '') {
            window.alert('Please enter a name and/or date.');
            return;
        }

        range.forEach(time => {
            fetch(`http://localhost:4000/checkin/member/${date}`, {
                method: 'PUT',
                headers: { 'content-type' : 'application/json' },
                body: JSON.stringify({
                  name: name,
                  time: time
                })
            })
            .then(res => res.json())
            .catch(err => console.log(err));
        });
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

    return (
        <div className="checkin">
            <p>Name</p>
            <input type="text" name="name" onChange={handleChange} />
            <p>Date</p>
            <input type="date" name="date" onChange={handleChange} />
            <p>Check In</p>
            <div className="time-container" id="checkin-input">
              <select name="checkinHour" id="checkinHour" defaultValue={'06'} onChange={handleChange}>
                <option value="01">1</option>
                <option value="02">2</option>
                <option value="03">3</option>
                <option value="04">4</option>
                <option value="05">5</option>
                <option value="06">6</option>
                <option value="07">7</option>
                <option value="08">8</option>
                <option value="09">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
              </select>
              <p>:</p>
              <select name="checkinMin" id="checkinMin" defaultValue={'00'} onChange={handleChange}>
                <option value="00">00</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
              </select>
              <select name="checkinAMPM" id="checkinAMPM" defaultValue={'AM'} onChange={handleChange}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            <p>Check Out</p>
            <div className="time-container" id="checkout-input">            
              <select name="checkoutHour" id="checkoutHour" defaultValue={'09'} onChange={handleChange}>
                <option value="01">1</option>
                <option value="02">2</option>
                <option value="03">3</option>
                <option value="04">4</option>
                <option value="05">5</option>
                <option value="06">6</option>
                <option value="07">7</option>
                <option value="08">8</option>
                <option value="09">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
              </select>
              <p>:</p>
              <select name="checkoutMin" id="checkoutMin" defaultValue={'00'} onChange={handleChange}>
                <option value="00">00</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
              </select>
              <select name="checkoutAMPM" id="checkoutAMPM" defaultValue={'PM'} onChange={handleChange}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            <input type="submit" value="Submit" onClick={submit} />
        </div>
    );
};

export default Checkin;