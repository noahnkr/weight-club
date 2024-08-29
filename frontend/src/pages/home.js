import { useEffect, useState } from "react";
import Availability from "../components/availability";
import { TailSpin } from "react-loader-spinner";
import { Link } from "react-router-dom";
import "../styles/home.css";

const Home = () => {
  document.title = "ISU Weight Club | Home";
  const [dataCache, setDataCache] = useState({});
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
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

    setCurrentDate(dateString);
    setCurrentTime(timeString);

    console.log("Current Date: ", dateString);
    console.log("Current Time: ", timeString);
  }, []);

  useEffect(() => {
    if (currentDate !== "" && currentDate !== undefined) {
        fetchData();
    }
  }, [currentDate]);

  async function fetchData() {
    if (dataCache[currentDate]) {
        setChartData(dataCache[currentDate].chartData);
        setMemberData(dataCache[currentDate].memberData);
        setHsoData(dataCache[currentDate].hsoData);
     } else {
        console.log("Fetching Data...")
        const times = await getTimes();
        const currentMemberCount = await getMemberCount();
        const currentHsoCount = await getHsoCount();
        const currentMemberData = await getMembers();
        const currentHsoData = await getHso();

        const currentChartData = times.map((time12) => {
          let time24 = convertTo24Hour(time12);
          return {
            time: time12,
            memberCount: currentMemberCount[time24],
            hsoCount: currentHsoCount[time24],
          };
        });

        setChartData(currentChartData);
        setMemberData(currentMemberData);
        setHsoData(currentHsoData);

        const newDataCache = { ...dataCache };
        newDataCache[currentDate] = {
          chartData: currentChartData,
          memberData: currentMemberData,
          hsoData: currentHsoData
        }
        setDataCache(newDataCache);
     }
  }

  async function getTimes() {
    try {
      const res = await fetch(
        `https://us-central1-weight-club-e16e5.cloudfunctions.net/getTimes?date=${currentDate}`,
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
        `https://us-central1-weight-club-e16e5.cloudfunctions.net/getMemberCount?date=${currentDate}`,
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
        `https://us-central1-weight-club-e16e5.cloudfunctions.net/getHsoCount?date=${currentDate}`,
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
        `https://us-central1-weight-club-e16e5.cloudfunctions.net/getMembers?date=${currentDate}`,
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
        `https://us-central1-weight-club-e16e5.cloudfunctions.net/getHso?date=${currentDate}`,
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
    let newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);

    let nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() - 2);

    setChartData([]);
    setCurrentDate(formatDate(newDate));
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

    let newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(formatDate(newDate));

    let nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 2);

    setChartData([]);
    setCurrentDate(formatDate(newDate));
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
          <h3 className={`date subheading ${animationClass}`}>{formatDateToReadable(currentDate)}</h3>
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
                date={currentDate}
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

// converts a 12-hour time to 24-hour time
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

// converts a 24-hour time to 12-hour
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

// converts a date object to string format for database querying
// Sample output: "YYYY-MM-DD"
export function formatDate(unformattedDate) {
  let dateString = unformattedDate.toISOString().split("T")[0];
  let dateArr = dateString.split("-");
  let day = dateArr[2].length == 1 ? `0${dateArr[2]}` : dateArr[2];
  let month = dateArr[1].length == 1 ? `0${dateArr[1]}` : dateArr[1];
  let year = dateArr[0];
  return `${year}-${month}-${day}`;
}

// Converts a date string in the format: "YYYY-MM-DD" to "[Month] [Day], [Year]"
export function formatDateToReadable(unformattedDate) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const year = unformattedDate.split("-")[0];
  const month = months[Number(unformattedDate.split("-")[1]) - 1];
  const day = Number(unformattedDate.split("-")[2]);

  // Add the appropriate suffix to the day of the month
  let daySuffix = "th";
  if (day === 1 || day === 21 || day === 31) {
    daySuffix = "st";
  } else if (day === 2 || day === 22) {
    daySuffix = "nd";
  } else if (day === 3 || day === 23) {
    daySuffix = "rd";
  }

  const formattedDate = `${month} ${day}${daySuffix}, ${year}`;
  return formattedDate;
}

// Removes any extra spaces and capitalizes first character
export function formatName(first, last) {
  let formattedFirst = first.replace(" ", "");
  formattedFirst = formattedFirst.charAt().toUpperCase() + formattedFirst.slice(1);

  let formattedLast = last.replace(" ", "");
  formattedLast = formattedLast.charAt().toUpperCase() + formattedLast.slice(1);

  return `${formattedFirst} ${formattedLast}`;
}

// Generates a list of 24 hour times in 15-minute incremets inclusively between two parameter 12-hour times.
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
