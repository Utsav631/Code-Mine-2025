import { useNavigate } from "react-router-dom"
import styles from "./ConnectionStatusPage.module.css"

function ConnectionStatusPage() {
    return (
        <div className={styles.wrapper}>
            <ConnectionError />
        </div>
    )
}

const ConnectionError = () => {
    const navigate = useNavigate()

    const reloadPage = () => {
        window.location.reload()
    }

    const gotoHomePage = () => {
        navigate("/")
    }

    return (
        <>
            <span className={styles.message}>
                Oops! Something went wrong. Please try again
            </span>
            <div className={styles.buttons}>
                <button className={styles.button} onClick={reloadPage}>
                    Try Again
                </button>
                <button className={styles.button} onClick={gotoHomePage}>
                    Go to HomePage
                </button>
            </div>
        </>
    )
}

export default ConnectionStatusPage
