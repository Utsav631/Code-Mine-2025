import styles from "./Footer.module.css"

function Footer() {
    return (
        <footer className={styles.footer}>
            <span>
                Build with ❤️ by{" "}
                <a
                    href="https://github.com/Utsav631"
                    className={styles.link}
                >
                    sahilatahar
                </a>
            </span>
        </footer>
    )
}

export default Footer
