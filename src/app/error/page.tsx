import Layout from "../../../components/layout/Layout";
import Link from "next/link";

export default function Portfolio_Page() {
  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Page Not Found">
        <section className="error-section centred pt_130 pb_150">
            <div className="auto-container">
                <div className="content-box">
                    <h1>404</h1>
                    <h2>Oops! that page can not <br />be found.</h2>
                    <Link href="/" className="theme-btn btn-two"><span>Back to Homepage</span></Link>
                </div>
            </div>
        </section>
      </Layout>
    </div>
  );
}
