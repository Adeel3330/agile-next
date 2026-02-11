import { GoogleMap } from "@react-google-maps/api";
import Layout from "../../components/layout/Layout";
import About from "../../components/sections/home1/About";
import About_Two from "../../components/sections/home1/About_Two";
import Appointment from "../../components/sections/home1/Appointment";
import Banner from "../../components/sections/home1/Banner";
import Certifications from "../../components/sections/home1/Certifications";
import FaqSection from "../../components/sections/home1/FaqSection";
// import Chooseus from "../../components/sections/home1/Chooseus";
import Contact_Info from "../../components/sections/home1/Contact_Info";
import News from "../../components/sections/home1/News";
import Portfolio from "../../components/sections/home1/Portfolio";
import Service from "../../components/sections/home1/Service";
import Specialties from "../../components/sections/home1/Specialties";
import Software from "../../components/sections/home1/Software";
import Team from "../../components/sections/home1/Team";
import Testimonial from "../../components/sections/home1/Testimonial";
// import Working from "../../components/sections/home1/Working";
import GoogleMapSection from "../../components/sections/home1/GoogleMap";
import RevenueChallenges from "../../components/sections/home1/RevenueChallenges";
import BenefitsMedicalBilling from "../../components/sections/home1/BenefitsMedicalBilling";
import WhyAgileSolutions from "../../components/sections/home1/WhyAgileSolutions";
import EffortlessOnboarding from "../../components/sections/home1/EffortlessOnboarding";

export default function Home() {

    return (
        <div className="boxed_wrapper">
            <Layout headerStyle={1} footerStyle={1}>
                <Banner/>
                <Contact_Info/>
                <Certifications/>
                <About/>
                <Service/>
                <RevenueChallenges/>
                <BenefitsMedicalBilling/>
                <WhyAgileSolutions/>
                <EffortlessOnboarding/>
                <Specialties/>
                <Software/>
                {/* <Chooseus/> */}
                {/* <Appointment/> */}
                {/* <Working/> */}
                {/* <About_Two/> */}
                {/* <Team/> */}
                {/* <Portfolio/> */}
                <News/>
                <FaqSection/>
                <Testimonial/>
                <GoogleMapSection/>
            </Layout>
        </div>
    )
}
