import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import { formatName, generateTimeRange } from "./home";
import "../styles/checkin.css";

const Checkin = () => {
  document.title = "ISU Weight Club | Check-in";

  const navigate = useNavigate();

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
  const [submitting, setSubmitting] = useState(false);

  const [update_firstName, setUpdate_firstName] = useState("");
  const [update_lastName, setUpdate_lastName] = useState("");
  const [update_date, setUpdate_date] = useState("");
  const [update_submitting, setUpdate_submitting] = useState(false);

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
    } else if (name === "update_firstName") {
      setUpdate_firstName(value);
    } else if (name === "lastName") {
      setLastName(value);
    } else if (name === "update_lastName") {
      setUpdate_lastName(value);
    } else if (name === "date") {
      setDate(value);
    } else if (name === "update_date") {
      setUpdate_date(value);
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
    const name = formatName(firstName, lastName);

    if (firstName === "" || lastName === "" || date === "") {
      alert("Please enter a name and/or date."); return;
    } else if (
      checkinHour === "" ||
      checkinMin === "" ||
      checkinAMPM === "" ||
      checkoutHour === "" ||
      checkoutMin === "" ||
      checkoutAMPM === ""
    ) {
      alert("Please enter a checkin/checkout time."); return;
    } else if (range.length === 1) {
      alert("Must check in for atleast 30 minutes."); return;
    } else if (range.length === 0) {
      alert("Check in time must be before check out time."); return;
    }

   
    setSubmitting(true);

    fetch(
      `https://us-central1-weight-club-e16e5.cloudfunctions.net/${
        isHso ? "hso" : "member"
      }CheckIn?date=${date}&name=${name}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          range: range,
        }),
      }
    )
      .then((res) => {
        setSubmitting(false);
        if (!res.ok) {
          return res.text().then((err) => {
            throw new Error(err);
          });
        } else {
          alert(
            `Successfully checked in from ${checkin} to ${checkout} on ${date}.`
          );
          navigate('../');
        }
      })
      .catch((err) => {
        setSubmitting(false);
        alert(err.message);
      });

    setTimeout(() => {
      if (submitting) {
        alert(`Unable to checkin due to connection issues.`);
      }
      setSubmitting(false);
    }, [5000]);
  }

  async function update(e) {
    e.preventDefault();
    if (
      update_firstName === "" ||
      update_lastName === "" ||
      update_date === ""
    ) {
      alert("Please enter a name and/or date.");
      return;
    }

    const name = formatName(update_firstName, update_lastName);
    setUpdate_submitting(true);

    fetch(
      `https://us-central1-weight-club-e16e5.cloudfunctions.net/getCheckedInTimeRanges?date=${update_date}&name=${name}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }
    )
      .then((res) => {
        setUpdate_submitting(false);
        if (!res.ok) {
          return res.text().then((err) => {
            throw new Error(err);
          });
        } else {
          res.json().then(ranges => {
            if (ranges.length > 0) {
              navigate("../update", {
                state: {
                  date: update_date,
                  name: name,
                },
              });
            } else {
              alert(`No checkin found for ${name} on ${update_date}.`)
            }
          })
          
        }
      })
      .catch((err) => {
        setUpdate_submitting(false);
        alert(err.message);
      });
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
        <p className="disclaimer">
          * Click{" "}
          <a
            href="https://www.recservices.iastate.edu/wp-content/uploads/2023/08/FALL-2023-HOURS.pdf"
            target="_blank"
          >
            here
          </a>{" "}
          to view Beyer Hall hours.
        </p>
        {submitting ? (
          <TailSpin
            height="150"
            width="150"
            color="#89847E"
            wrapperClass="loader"
          />
        ) : (
          <div className="button" id="submit-button" onClick={submit}>
            Submit »
          </div>
        )}
      </div>
      <h1 className="heading" id="update-message">
        Already Checked In?
      </h1>
      <div className="checkin-form">
        <div className="input-container">
          <label htmlFor="update_firstName">First Name</label>
          <input type="text" name="update_firstName" onChange={handleChange} />
        </div>
        <div className="input-container">
          <label htmlFor="update_lastName">Last Name</label>
          <input type="text" name="update_lastName" onChange={handleChange} />
        </div>
        <div className="input-container">
          <label htmlFor="update_date">Date</label>
          <input type="date" name="update_date" onChange={handleChange} />
        </div>
        {update_submitting ? (
          <TailSpin 
            height="150"
            width="150"
            color="#89847E"
            wrapperClass="loader"
          />
        ) : (
          <div className="button" id="submit-button" onClick={update}>
            Update »
          </div>
        )}
       
      </div>
    </div>
  );
};

export default Checkin;
