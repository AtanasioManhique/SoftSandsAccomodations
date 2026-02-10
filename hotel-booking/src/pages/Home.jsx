import React from 'react';
import { Link } from 'react-router-dom';
import Center from '../components/Center'; // Adjust the path as necessary
import FeaturedDestination from '../components/FeaturedDestination';
import ExploreDestination from '../components/ExploreDestination';
import FeatureSection from '../components/FeatureSection';
import Footer from '../components/Footer';
import Testimonial from '../components/Testimonial';


const Home = () => {


    return(
        <>
        <Center/>
        <FeaturedDestination/>
        <ExploreDestination/>
        <Testimonial/>
        <FeatureSection/>
         
        
        </>



    );
}
export default Home;