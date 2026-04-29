import React from 'react';
import Navbar from'./Navbar';
import Hero from'./Hero';
import WhySection from './WhySection';
import FeaturesAndCareer from './feature';
import Courses from './courses';
import Admissions from './Admission';
import Faculty from './Faculty';
import Contact from './contact';
import About from './about';
import Footer from './Footer';

function Home(){
    return(
        <div>
            <Navbar/>
            <Hero/>
            <WhySection/>
            <FeaturesAndCareer/>
            <Courses/>
            <Admissions/>
            <Faculty/>
            <About/>
            <Contact/>
            <Footer/>
            
        </div>
    );
}
export default Home;