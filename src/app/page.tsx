import dynamic from "next/dynamic";
import Layout from "../../components/layout/Layout";
import Banner from "../../components/sections/home1/Banner";
import Certifications from "../../components/sections/home1/Certifications";
import About from "../../components/sections/home1/About";

const WhyAgileSolutions = dynamic(() => import("../../components/sections/home1/WhyAgileSolutions"));
const Service = dynamic(() => import("../../components/sections/home1/Service"));
const Specialties = dynamic(() => import("../../components/sections/home1/Specialties"));
const Software = dynamic(() => import("../../components/sections/home1/Software"));
const RevenueChallenges = dynamic(() => import("../../components/sections/home1/RevenueChallenges"));
const BenefitsMedicalBilling = dynamic(() => import("../../components/sections/home1/BenefitsMedicalBilling"));
const DedicatedTeamPractice = dynamic(() => import("../../components/sections/home1/DedicatedTeamPractice"));
const EffortlessOnboarding = dynamic(() => import("../../components/sections/home1/EffortlessOnboarding"));
const FaqSection = dynamic(() => import("../../components/sections/home1/FaqSection"));
const Testimonial = dynamic(() => import("../../components/sections/home1/Testimonial"));
const GoogleMapSection = dynamic(() => import("../../components/sections/home1/GoogleMap"));

export default function Home() {
  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={1} footerStyle={1}>
        <Banner />
        <Certifications />
        <About />
        <WhyAgileSolutions />
        <Service />
        <Specialties />
        <Software />
        <RevenueChallenges />
        <BenefitsMedicalBilling />
        <DedicatedTeamPractice />
        <EffortlessOnboarding />
        <FaqSection />
        <Testimonial />
        <GoogleMapSection />
      </Layout>
    </div>
  );
}
