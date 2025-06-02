import { useAppContext } from "@/context/AppContext"
import { RemoteUser, USER_CONNECTION_STATUS } from "@/types/user"
import Avatar from "react-avatar"
import styles from "./Users.module.css"

function Users() {
    const { users } = useAppContext()

    return (
        <div className={styles.container}>
            <div className={styles.userGrid}>
                {users.map((user) => {
                    return <User key={user.socketId} user={user} />
                })}
            </div>
        </div>
    )
}

const User = ({ user }: { user: RemoteUser }) => {
    const { username, status } = user
    const title = `${username} - ${status === USER_CONNECTION_STATUS.ONLINE ? "online" : "offline"}`

    return (
        <div className={styles.userCard} title={title}>
            <Avatar name={username} size="50" round={"12px"} title={title} />
            <p className={styles.username}>{username}</p>
            <div
                className={`${styles.statusDot} ${
                    status === USER_CONNECTION_STATUS.ONLINE
                        ? styles.online
                        : styles.offline
                }`}
            ></div>
        </div>
    )
}

export default Users
