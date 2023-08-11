import Availability from "./availability";
import { Link } from "react-router-dom";

const Home = () => {


    return (
        <div className="home">
            <div className="availability-graph">
                <Availability />
            </div>
            <div className="checkin-button" >
                <Link exact="true" to="/checkin">Check In »</Link>
            </div>
        </div>
    )

}

export default Home;
