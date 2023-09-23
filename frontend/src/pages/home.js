import { useEffect, useState } from "react";
import Availability from "../components/availability";
import { TailSpin } from "react-loader-spinner";
import { Link } from "react-router-dom";
import "../styles/home.css";

/*
TODO:
- Fix current time and open/closed message
- Add current checked in members at bottom of screen
- Yesterday & Tomorrow check in graphs
- Center check in screen
*/

const Home = () => {
  const [date, setDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [chartData, setChartData] = useState([]);
  const [memberData, setMemberData] = useState({});
  const [memberCount, setMemberCount] = useState({});
  const [hsoData, setHsoData] = useState({});
  const [hsoCount, setHsoCount] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [currentMembers, setCurrentMembers] = useState([]);

  // Determine current Date & Time
  useEffect(() => {
    let dateString = new Date().toLocaleDateString().replace(/\//g, "-");
    let dateArr = dateString.split("-");
    let day = dateArr[0].length == 1 ? `0${dateArr[0]}` : dateArr[0];
    let month = dateArr[1].length == 1 ? `0${dateArr[1]}` : dateArr[1];
    let year = dateArr[2];
    dateString = `${year}-${day}-${month}`;

    let timeString = new Date().toLocaleTimeString();
    timeString =
      timeString.substring(0, timeString.length - 6) +
      timeString.substring(timeString.length - 3, timeString.length); // remove seconds from time

    let min = Number(
      timeString.substring(timeString.length - 5, timeString.length - 3)
    );
    min = min - (min % 15);
    if (min == 0) {
      min = "00";
    }

    timeString =
      timeString.substring(0, timeString.length - 5) +
      min +
      timeString.substring(timeString.length - 3, timeString.length);

    setDate(dateString);
    setCurrentTime(timeString);

    console.log("Current Date: ", dateString);
    console.log("Current Time: ", timeString);
  }, []);

  useEffect(() => {
    async function fetchData() {
      const times = await getTimes();

      const fetchedMemberCount = await getMemberCount();
      const fetchedHsoCount = await getHsoCount();
      const newData = times.map((time12) => {
        let time24 = convertTo24Hour(time12);
        return {
          time: time12,
          memberCount: fetchedMemberCount[time24],
          hsoCount: fetchedHsoCount[time24],
        };
      });
      setChartData(newData);
      setMemberCount(fetchedMemberCount);
      setHsoCount(fetchedHsoCount);

      const newMemberData = await getMembers();
      const newHsoData = await getHso();
      setMemberData(newMemberData);
      setHsoData(newHsoData);
    }

    if (date !== "" && date !== undefined) {
      fetchData();
    }
  }, [date]);

  useEffect(() => {
    let currentTime24 = convertTo24Hour(currentTime);
    setCurrentMembers(memberData[currentTime24]);

    if (
      memberCount[currentTime24] + hsoCount[currentTime24] >= 3 &&
      hsoCount[currentTime24] > 0
    ) {
      setIsOpen(true);
      console.log("Club is Open");
    } else {
      setIsOpen(false);
      console.log("Club is Closed");
    }
  }, [memberCount]);

  async function getTimes() {
    try {
      const res = await fetch(
        `https://us-central1-weight-club-e16e5.cloudfunctions.net/getTimes?date=${date}`,
        { method: "GET" }
      );
      const times24 = await res.json();
      return times24.map((time24) => convertTo12Hour(time24));
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async function getMemberCount() {
    try {
      const res = await fetch(
        `https://us-central1-weight-club-e16e5.cloudfunctions.net/getMemberCount?date=${date}`,
        { method: "GET" }
      );
      const count = await res.json();
      return count;
    } catch (err) {
      console.log(err);
      return 0;
    }
  }

  async function getHsoCount() {
    try {
      const res = await fetch(
        `https://us-central1-weight-club-e16e5.cloudfunctions.net/getHsoCount?date=${date}`,
        { method: "GET" }
      );
      const count = await res.json();
      return count;
    } catch (err) {
      console.log(err);
      return 0;
    }
  }

  async function getMembers() {
    try {
      const res = await fetch(
        `https://us-central1-weight-club-e16e5.cloudfunctions.net/getMembers?date=${date}`,
        { method: "GET" }
      );
      const members = await res.json();
      return members;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async function getHso() {
    try {
      const res = await fetch(
        `https://us-central1-weight-club-e16e5.cloudfunctions.net/getHso?date=${date}`,
        { method: "GET" }
      );
      const members = await res.json();
      return members;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  function convertTo24Hour(time12) {
    const [time, period] = time12.split(" ");
    let [hours, minutes] = time.split(":");

    if (period === "PM" && hours !== "12") {
      hours = String(parseInt(hours) + 12);
    } else if (period === "AM" && hours === "12") {
      hours = "00";
    }

    hours = hours.padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  function convertTo12Hour(time24) {
    const [hours, mins] = time24.split(":");
    let period = "AM";
    let hours12 = parseInt(hours);
    if (hours12 >= 12) {
      period = "PM";
      if (hours12 > 12) {
        hours12 -= 12;
      }
    }
    return `${hours12}:${mins} ${period}`;
  }

  return (
    <div className="home">
      <h1 className="heading">Availability</h1>
      <div className="graph-container">
          {chartData.length !== 0 ? (
            <div className="availability-graph">
              <Availability
                chartData={chartData}
                memberData={memberData}
                hsoData={hsoData}
                date={date}
              />
            </div>
          ) : (
              <TailSpin
                height="150"
                width="150"
                color="#89847E"
                wrapperClass="loader"
              />
          )}
        
      </div>
      <div className="button">
        <Link exact="true" to="/checkin">
          Check In »
        </Link>
      </div>
      <div className="current-members-container">
        <h2>
          The Club is{" "}
          {isOpen ? (
            <span className="open">OPEN</span>
          ) : (
            <span className="closed">CLOSED</span>
          )}
        </h2>
      </div>
    </div>
  );
};

export default Home;
