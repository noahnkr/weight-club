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
  document.title = "ISU Weight Club | Home";
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [chartData, setChartData] = useState([]);
  const [memberData, setMemberData] = useState({});
  const [hsoData, setHsoData] = useState({});

  // Determine current Date & Time
  useEffect(() => {
    let dateString = new Date().toLocaleDateString().replace(/\//g, "-");
    let dateArr = dateString.split("-");
    let day = dateArr[1].length == 1 ? `0${dateArr[1]}` : dateArr[1];
    let month = dateArr[0].length == 1 ? `0${dateArr[0]}` : dateArr[0];
    let year = dateArr[2];
    dateString = `${year}-${month}-${day}`;

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
    setTime(timeString);

    console.log("Current Date: ", dateString);
    console.log("Current Time: ", timeString);
  }, []);

  useEffect(() => {
    if (date !== "" && date !== undefined) {
      fetchData();
    }

  }, [date]);

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

    const newMemberData = await getMembers();
    const newHsoData = await getHso();
    setMemberData(newMemberData);
    setHsoData(newHsoData);
  }

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

  async function collectionExists(reqDate) {
    try {
      const res = await fetch(
        `https://us-central1-weight-club-e16e5.cloudfunctions.net/collectionExists?date=${reqDate}`,
        { method: "GET" }
      );
      return await res.json();
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  const [showLeftArrow, setShowLeftArrow] = useState(true);
  function handleLeftArrow() {
    setAnimationClass('slide-left-exit');

    let newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);

    let nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() - 2);

    setChartData([]);
    setDate(formatDate(newDate));
    collectionExists(formatDate(nextDate)).then(res => {
      setShowLeftArrow(res);
      setShowRightArrow(true);
    });
    
   

    setTimeout(() => {
      setAnimationClass('slide-left-enter');
    }, [100])

    setTimeout(() => {
      setAnimationClass('');
    }, [200])
  }

  const [showRightArrow, setShowRightArrow] = useState(true);
  function handleRightArrow() {
    setAnimationClass('slide-right-exit');

    let newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    setDate(formatDate(newDate));

    let nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 2);

    setChartData([]);
    setDate(formatDate(newDate));
    collectionExists(formatDate(nextDate)).then(res => {
      setShowRightArrow(res);
      setShowLeftArrow(true);
    })
    

    setTimeout(() => {
      setAnimationClass('slide-right-enter');
    }, [100])

    setTimeout(() => {
      setAnimationClass('');
    }, [200])
  }

  const [animationClass, setAnimationClass] = useState('');

  return (
    <div className="home">
      <h1 className="heading">Availability</h1>
      <div className="date-controller">
        {showLeftArrow ? <div className="left" onClick={handleLeftArrow}>
          <h3 className="subheading">&lt;</h3>
        </div> : <></>}
        <div className="date-container">
          <h3 className={`date subheading ${animationClass}`}>{date}</h3>
        </div>
        {showRightArrow ? <div className="right" onClick={handleRightArrow}>
          <h3 className="subheading">&gt;</h3>
        </div> : <></>}
      </div>
      
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
    </div>
  );
};

export function convertTo24Hour(time12) {
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

export function convertTo12Hour(time24) {
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

export function formatDate(unformattedDate) {
  let dateString = unformattedDate.toISOString().split("T")[0];
  let dateArr = dateString.split("-");
  let day = dateArr[2].length == 1 ? `0${dateArr[2]}` : dateArr[2];
  let month = dateArr[1].length == 1 ? `0${dateArr[1]}` : dateArr[1];
  let year = dateArr[0];
  return `${year}-${month}-${day}`;
}

export function formatName(first, last) {
  let formattedFirst = first.replace(" ", "");
  formattedFirst = formattedFirst.charAt().toUpperCase() + formattedFirst.slice(1);

  let formattedLast = last.replace(" ", "");
  formattedLast = formattedLast.charAt().toUpperCase() + formattedLast.slice(1);

  return `${formattedFirst} ${formattedLast}`;
}

export function generateTimeRange(startTime12hr, endTime12hr) {
  const start24hr = new Date(
    `1970-01-01 ${convertTo24Hour(startTime12hr)}`
  );
  const end24hr = new Date(
    `1970-01-01 ${convertTo24Hour(endTime12hr)}`
  );
  const timeArray = [];

  while (start24hr <= end24hr) {
    const timeString = start24hr.toTimeString().slice(0, 5);
    timeArray.push(timeString);
    start24hr.setMinutes(start24hr.getMinutes() + 15);
  }

  return timeArray;
}
export default Home;
