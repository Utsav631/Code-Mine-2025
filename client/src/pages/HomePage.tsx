import illustration from "@/assets/illustration.jpeg"
import FormComponent from "@/components/forms/FormComponent"
import "./HomePage.css"

function HomePage() {
    return (
        <div className="homepage">
            <div className="homepage-inner">
                <div className="homepage-illustration">
                    <img
                        src={illustration}
                        alt="Code Sync Illustration"
                        className="illustration-img"
                    />
                </div>
                <div className="homepage-form">
                    <FormComponent />
                </div>
            </div> 
            {/* <Footer /> */}
        </div>
    )
}

export default HomePage
