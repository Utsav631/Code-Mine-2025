import SplitterComponent from "@/components/SplitterComponent"
import ConnectionStatusPage from "@/components/connection/ConnectionStatusPage"
import Sidebar from "@/components/sidebar/Sidebar"
import WorkSpace from "@/components/workspace"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import useFullScreen from "@/hooks/useFullScreen"
import useUserActivity from "@/hooks/useUserActivity"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS, User } from "@/types/user"
import { useEffect } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import styles from './Layout.module.css';

function EditorPage() {
    useUserActivity()  // Listen user online/offline status
    useFullScreen()     // Enable fullscreen mode

    const navigate = useNavigate()
    const { roomId } = useParams()
    const { status, setCurrentUser, currentUser } = useAppContext()
    const { socket } = useSocket()
    const location = useLocation()

    useEffect(() => {
        if (!roomId || !location.state?.username) {
            navigate("/", { replace: true })
            return
        }

        const username = location.state.username
        if (currentUser.username.length > 0) return

        const user: User = { username, roomId }
        setCurrentUser(user)
        socket.emit(SocketEvent.JOIN_REQUEST, user)
    }, [
        currentUser.username,
        location.state?.username,
        navigate,
        roomId,
        setCurrentUser,
        socket,
    ])

    if (status === USER_STATUS.CONNECTION_FAILED) {
        return <ConnectionStatusPage />
    }

    return (
        <div className={styles.container}>
            <SplitterComponent>
                <div className={styles.sidebarPane}>
                    <Sidebar />
                </div>
                <div className={styles.workspacePane}>
                    <WorkSpace />
                </div>
            </SplitterComponent>
        </div>
    ) 
}

export default EditorPage
