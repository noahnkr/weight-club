import '../styles/about.css'

const About = () => {
    document.title = 'ISU Weight Club | About'

    return (
        <div className="about">
            <h1 className="heading">About the ISU Weight Club</h1>

            <div className="about-content">
                <p>
                    We strive to push the physical and mental boundaries of the human
                    body. We believe that every person is capable of greatness through
                    hard work, determination, and discipline. The Weight Club at Iowa
                    State University achieves this through lifting weights. Whether it is
                    Powerlifting, Olympic Weightlifting, Strongman, Crossfit,
                    Bodybuilding, or improving overall fitness, we cater to all forms of
                    strength training.
                </p>

                <p>
                    We look for members who are motivated to push themselves further than
                    the average gym-goer. We offer opportunities for members to compete in
                    Powerlifting, Olympic Weightlifting, Strongman, and Crossfit events.
                    Additionally, we provide the necessary training equipment for members
                    to succeed in their chosen events. Our atmosphere is tight-knit, with
                    many knowledgeable members who are willing to go out of their way to
                    help others reach their fullest potential.
                </p>

                <h2 className="subheading">Meet the Creator</h2>

                <div className="creator-info">
                    <p>
                        This website was created by Noah Roberts, a dedicated member of
                        the ISU Weight Club and a Computer Science student at Iowa State
                        University. Noah designed this platform to streamline check-ins,
                        enhance communication, and bring our community closer together.
                    </p>

                    <p>
                        Feel free to reach out if you have any questions, suggestions, or
                        just want to connect!
                    </p>

                    <div className="contact-info">
                        <p>
                            Email:{' '}
                            <a href="mailto:noahnkr@iastate.edu">noahnkr@iastate.edu</a>
                        </p>
                        <p>
                            Website:{' '}
                            <a
                                href="https://noahnkr.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                noahnkr.com
                            </a>
                        </p>
                        <p>
                            Instagram:{' '}
                            <a
                                href="https://www.instagram.com/nkr.lifts/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                @nkr.lifts
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default About
