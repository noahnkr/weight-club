import { useState } from "react";
import "../styles/checkin.css";

const Checkin = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [date, setDate] = useState("");
  const [checkinHour, setCheckinHour] = useState("");
  const [checkinMin, setCheckinMin] = useState("");
  const [checkinAMPM, setCheckinAMPM] = useState("");
  const [checkoutHour, setCheckoutHour] = useState("");
  const [checkoutMin, setCheckoutMin] = useState("");
  const [checkoutAMPM, setCheckoutAMPM] = useState("");
  const [isHso, setisHso] = useState(false);

  function handleChange(e) {
    let name = e.target.name;
    let value = e.target.value;
    if (name.includes("checkin")) {
      if (name.includes("Hour")) {
        setCheckinHour(value);
      } else if (name.includes("Min")) {
        setCheckinMin(value);
      } else if (name.includes("AMPM")) {
        setCheckinAMPM(value);
      }
    } else if (name.includes("checkout")) {
      if (name.includes("Hour")) {
        setCheckoutHour(value);
      } else if (name.includes("Min")) {
        setCheckoutMin(value);
      } else if (name.includes("AMPM")) {
        setCheckoutAMPM(value);
      }
    } else if (name === "firstName") {
      setFirstName(value);
    } else if (name === "lastName") {
      setLastName(value);
    } else if (name === "date") {
      setDate(value);
    } else if (name === "member") {
      setisHso(false);
    } else if (name === "hso") {
      setisHso(true);
    }
  }

  function submit(e) {
    e.preventDefault();
    const checkin = `${checkinHour}:${checkinMin} ${checkinAMPM}`;
    const checkout = `${checkoutHour}:${checkoutMin} ${checkoutAMPM}`;
    const range = generateTimeRange(checkin, checkout);
    const name = `${firstName} ${lastName}`;

    if (firstName === "" || lastName === "" || date === "") {
      alert("Please enter a name and/or date.");
      return;
    } else if (
      checkinHour === "" ||
      checkinMin === "" ||
      checkinAMPM === "" ||
      checkoutHour === "" ||
      checkoutMin === "" ||
      checkoutAMPM === ""
    ) {
      alert("Please enter a checkin/checkout time.");
      return;
    } else if (range.length === 1) {
      alert("Must check in for atleast 30 minutes.");
      return;
    } else if (range.length === 0) {
      alert("Check in time must be before check out time.");
      return;
    }

    fetch(
      `https://us-central1-weight-club-e16e5.cloudfunctions.net/${
        isHso ? "hso" : "member"
      }CheckIn?date=${date}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          range: range,
        }),
      }
    )
      .then((res) => {
        if (!res.ok) {
          return res.text().then((err) => {
            throw new Error(err);
          });
        } else {
          alert(`Successfully checked in from ${checkin} to ${checkout} on ${date}.`);
        }
      })
      .catch((err) => alert(err.message));
  }

  function generateTimeRange(startTime12hr, endTime12hr) {
    function convertTo24HourFormat(time12hr) {
      const [time, period] = time12hr.split(" ");
      const [hours, minutes] = time.split(":");

      let hours24 = parseInt(hours);

      if (period.toLowerCase() === "pm" && hours24 !== 12) {
        hours24 += 12;
      } else if (period.toLowerCase() === "am" && hours24 === 12) {
        hours24 = 0;
      }

      const formattedHours = hours24.toString().padStart(2, "0");
      return `${formattedHours}:${minutes}`;
    }

    const start24hr = new Date(
      `1970-01-01 ${convertTo24HourFormat(startTime12hr)}`
    );
    const end24hr = new Date(
      `1970-01-01 ${convertTo24HourFormat(endTime12hr)}`
    );
    const timeArray = [];

    while (start24hr <= end24hr) {
      const timeString = start24hr.toTimeString().slice(0, 5);
      timeArray.push(timeString);
      start24hr.setMinutes(start24hr.getMinutes() + 15);
    }

    return timeArray;
  }

  return (
    <div className="checkin">
      <h1 className="heading">Check In</h1>
      <div className="checkin-form">
        <div className="input-container">
          <label htmlFor="firstName">First Name</label>
          <input type="text" name="firstName" onChange={handleChange} />
        </div>
        <div className="input-container">
          <label htmlFor="lastName">Last Name</label>
          <input type="text" name="lastName" onChange={handleChange} />
        </div>
        <div className="input-container">
          <label htmlFor="date">Date</label>
          <input type="date" name="date" onChange={handleChange} />
        </div>
        <div className="input-container">
          <div className="time-container" id="checkin-input">
            <label htmlFor="checkinHour">Check In</label>
            <select
              name="checkinHour"
              id="checkinHour"
              defaultValue=""
              onChange={handleChange}
            >
              <option value=""></option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
            <p>:</p>
            <select
              name="checkinMin"
              id="checkinMin"
              defaultValue=""
              onChange={handleChange}
            >
              <option value=""></option>
              <option value="00">00</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
            </select>
            <select
              name="checkinAMPM"
              id="checkinAMPM"
              defaultValue=""
              onChange={handleChange}
            >
              <option value=""></option>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
        <div className="input-container">
          <div className="time-container" id="checkout-input">
            <label htmlFor="checkoutHour">Check Out</label>
            <select
              name="checkoutHour"
              id="checkoutHour"
              defaultValue=""
              onChange={handleChange}
            >
              <option value=""></option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
            <p>:</p>
            <select
              name="checkoutMin"
              id="checkoutMin"
              defaultValue=""
              onChange={handleChange}
            >
              <option value=""></option>
              <option value="00">00</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
            </select>
            <select
              name="checkoutAMPM"
              id="checkoutAMPM"
              defaultValue=""
              onChange={handleChange}
            >
              <option value=""></option>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
          <div className="member-type-container">
            <div>
              <label htmlFor="member">Member</label>
              <input
                type="radio"
                name="member"
                checked={!isHso}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="hso">HSO</label>
              <input
                type="radio"
                name="hso"
                checked={isHso}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <p id="disclaimer">
          * Click <a href="https://www.recservices.iastate.edu/wp-content/uploads/2023/08/FALL-2023-HOURS.pdf" target="_blank">here</a> to view Beyer Hall hours.
        </p>
        <div className="button" id="submit-button" onClick={submit}>
          Submit »
        </div>
      </div>
    </div>
  );
};

export default Checkin;
