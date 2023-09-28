import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { convertTo12Hour, generateTimeRange, formatDateToReadable } from "./home";
import "../styles/checkin.css";
import { TailSpin } from "react-loader-spinner";

const Update = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { date, name } = location.state;

  const [ranges, setRanges] = useState([]);
  const [checkinHour, setCheckinHour] = useState([]);
  const [checkinMin, setCheckinMin] = useState([]);
  const [checkinAMPM, setCheckinAMPM] = useState([]);
  const [checkoutHour, setCheckoutHour] = useState([]);
  const [checkoutMin, setCheckoutMin] = useState([]);
  const [checkoutAMPM, setCheckoutAMPM] = useState([]);
  const [isHso, setIsHso] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(
      `https://us-central1-weight-club-e16e5.cloudfunctions.net/getCheckedInTimeRanges?date=${date}&name=${name}`,
      { method: "GET" }
    )
      .then((res) => {
        if (!res.ok) {
          return res.text().then((err) => {
            throw new Error(err);
          });
        } else {
          return res.json();
        }
      })
      .then((resRanges) => {
        setRanges(resRanges);

        const defaultValues = resRanges.map(range => {
          const original_checkin = convertTo12Hour(range.checkIn);
          const original_checkout = convertTo12Hour(range.checkOut);

          const original_checkinHour = original_checkin.split(":")[0];
          const original_checkinMin = original_checkin
            .split(":")[1]
            .split(" ")[0];
          const original_checkinAMPM = original_checkin
            .split(":")[1]
            .split(" ")[1];

          const original_checkoutHour = original_checkout.split(":")[0];
          const original_checkoutMin = original_checkout
            .split(":")[1]
            .split(" ")[0];
          const original_checkoutAMPM = original_checkout
            .split(":")[1]
            .split(" ")[1];

          return {
            checkinHour: original_checkinHour,
            checkinMin: original_checkinMin,
            checkinAMPM: original_checkinAMPM,
            checkoutHour: original_checkoutHour,
            checkoutMin: original_checkoutMin,
            checkoutAMPM: original_checkoutAMPM,
          };
        });

        setCheckinHour(defaultValues.map((v) => v.checkinHour));
        setCheckinMin(defaultValues.map((v) => v.checkinMin));
        setCheckinAMPM(defaultValues.map((v) => v.checkinAMPM));
        setCheckoutHour(defaultValues.map((v) => v.checkoutHour));
        setCheckoutMin(defaultValues.map((v) => v.checkoutMin));
        setCheckoutAMPM(defaultValues.map((v) => v.checkoutAMPM));
      })
      .catch((err) => {
        console.log(
          `There was an error getting ranges on date ${date} for ${name}`
        );
      });
  }, [date, name]);

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
    } else if (name === "member") {
      setIsHso(false);
    } else if (name === "hso") {
      setIsHso(true);
    }
  }

  function updateCheckin(id) {
    if (
        window.confirm(
            `Are you sure you want to update check-in from ${convertTo12Hour(ranges[id].checkIn)} - ${convertTo12Hour(ranges[id].checkOut)} to ${checkinHour}:${checkinMin} ${checkinAMPM}-${checkoutHour}:${checkoutMin} ${checkoutAMPM} on ${formatDateToReadable(date)}?`)) {
            const deletedRange = generateTimeRange(convertTo12Hour(ranges[id].checkIn), convertTo12Hour(ranges[id].checkOut));

            setSubmitting(true);
            fetch(
                `https://us-central1-weight-club-e16e5.cloudfunctions.net/delete${ranges[id].isHso ? "Hso" : "Member"}CheckIn?date=${date}&name=${name}`, 
                { 
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        range: deletedRange
                    })
                  }
            ).then(res => {
                if (!res.ok) {
                    return res.text().then((err) => {
                      throw new Error(err);
                    });
                  } else {
                    const newRange = generateTimeRange(`${checkinHour}:${checkinMin} ${checkinAMPM}`, `${checkoutHour}:${checkoutMin} ${checkoutAMPM}`);
                    fetch(
                        `https://us-central1-weight-club-e16e5.cloudfunctions.net/${isHso ? "hso" : "member"}CheckIn?date=${date}&name=${name}`,
                        {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            range: newRange,
                          }),
                        }
                      )
                        .then((res) => {
                          if (!res.ok) {
                            return res.text().then((err) => {
                              throw new Error(err);
                            });
                          } else {
                                setSubmitting(false);
                                alert(
                                  `Successfully updated check-in from ${convertTo12Hour(ranges[id].checkIn)} - ${convertTo12Hour(ranges[id].checkOut)} to ${checkinHour}:${checkinMin} ${checkinAMPM}-${checkoutHour}:${checkoutMin} ${checkoutAMPM} on ${formatDateToReadable(date)}.`);
                                
                                navigate('../');
                          }
                        });
                      }
            }).catch(err => {
                setSubmitting(false);
                alert(err.message);
            });
    }
    
  }

  function deleteCheckin(id) {
    if (
      window.confirm(
        `Are you sure you want to delete check-in from ${convertTo12Hour(ranges[id].checkIn)} - ${convertTo12Hour(ranges[id].checkOut)} on ${formatDateToReadable(date)}?`)) {
        const deletedRange = generateTimeRange(convertTo12Hour(ranges[id].checkIn), convertTo12Hour(ranges[id].checkOut));
        setSubmitting(true);
        fetch(
            `https://us-central1-weight-club-e16e5.cloudfunctions.net/delete${ranges[id].isHso ? "Hso" : "Member"}CheckIn?date=${date}&name=${name}`, 
            { 
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    range: deletedRange
                })
             }
        ).then(res => {
            if (!res.ok) {
                return res.text().then((err) => {
                  throw new Error(err);
                });
              } else {
                setSubmitting(false);
                alert(
                  `Successfully deleted check-in from ${convertTo12Hour(ranges[id].checkIn)} - ${convertTo12Hour(ranges[id].checkOut)} 
                   on ${formatDateToReadable(date)}.`
                );
                navigate('../');
              }
        }).catch(err => {
            setSubmitting(false);
            alert(err.message);
        });
        
    }
  }

  return (
    <div className="update">
      <h1 className="heading">Update Check In</h1>
      <h3 className="subheading">{name}</h3>
      <h3 className="subheading">{formatDateToReadable(date)}</h3>
      <div className="update-form">
        {ranges.map((range, index) => {
          return (
            <div className="ranges" key={index}>
              <div className="input-container">
                <div className="time-container" id="checkin-input">
                  <label htmlFor="checkinHour">Check In</label>
                  <select
                    name="checkinHour"
                    id="checkinHour"
                    defaultValue={checkinHour[index]}
                    onChange={handleChange}
                  >
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
                    defaultValue={checkinMin[index]}
                    onChange={handleChange}
                  >
                    <option value="00">00</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                  </select>
                  <select
                    name="checkinAMPM"
                    id="checkinAMPM"
                    defaultValue={checkinAMPM[index]}
                    onChange={handleChange}
                  >
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
                    defaultValue={checkoutHour[index]}
                    onChange={handleChange}
                  >
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
                    defaultValue={checkoutMin[index]}
                    onChange={handleChange}
                  >
                    <option value="00">00</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                  </select>
                  <select
                    name="checkoutAMPM"
                    id="checkoutAMPM"
                    defaultValue={checkoutAMPM[index]}
                    onChange={handleChange}
                  >
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

              {
                submitting ? (
                  <div className="update-delete-container">
                    <TailSpin 
                    height="150"
                    width="150"
                    color="#89847E"
                    wrapperClass="loader"
                  />
                  </div>
                ) : (
                  <div className="update-delete-container">
                    <div
                      className="button"
                      onClick={() => {
                        updateCheckin(index);
                      }}
                    >
                      Update »
                    </div>
                    <div
                      className="button"
                      onClick={() => {
                        deleteCheckin(index);
                      }}
                    >
                      Delete »
                    </div>
                </div>
                )
              }
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Update;
