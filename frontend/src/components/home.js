import Availability from "./availability";

const Home = () => {

    function handleClick(e) {
        e.preventDefault();
        fetch('https://localhost:4000/create', {
            method: 'POST',
            body: JSON.stringify({
                time: '6:00 AM',
                count: 12
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Posted')
        })
        .catch(err => console.log(err));
    }

    return (
        <div className="home">
            <div style={{width: '80%', height: '80%'}}>
            <Availability />
            </div>
            <button onClick={handleClick}>Update</button>
        </div>
    )

}

export default Home;
