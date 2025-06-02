import { createContext, useCallback, useContext, useEffect, useMemo, ReactNode } from "react"
import { Socket, io } from "socket.io-client"
import { toast } from "react-hot-toast"

import { DrawingData } from "@/types/app"
import { SocketContext as SocketContextType, SocketEvent, SocketId } from "@/types/socket"
import { RemoteUser, USER_STATUS, User } from "@/types/user"
import { useAppContext } from "./AppContext"

const SocketContext = createContext<SocketContextType | null>(null)

export const useSocket = (): SocketContextType => {
    const context = useContext(SocketContext)
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider")
    }
    return context
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

const SocketProvider = ({ children }: { children: ReactNode }) => {
    const {
        users,
        setUsers,
        setStatus,
        setCurrentUser,
        drawingData,
        setDrawingData,
    } = useAppContext()

    const socket: Socket = useMemo(() => {
        return io(BACKEND_URL, { reconnectionAttempts: 2 })
    }, [])

    const handleError = useCallback((err: unknown) => {
        console.error("Socket error:", err)
        setStatus(USER_STATUS.CONNECTION_FAILED)
        toast.dismiss()
        toast.error("Failed to connect to the server")
    }, [setStatus])

    const handleUsernameExist = useCallback(() => {
        toast.dismiss()
        setStatus(USER_STATUS.INITIAL)
        toast.error("Username already exists. Please choose another one.")
    }, [setStatus])

    const handleJoiningAccept = useCallback(
        ({ user, users }: { user: User; users: RemoteUser[] }) => {
            setCurrentUser(user)
            setUsers(users)
            setStatus(USER_STATUS.JOINED)
            toast.dismiss()

            if (users.length > 1) {
                toast.loading("Syncing data, please wait...")
            }
        },
        [setCurrentUser, setUsers, setStatus]
    )

    const handleUserLeft = useCallback(
        ({ user }: { user: User }) => {
            toast.success(`${user.username} left the room`)
            setUsers((prevUsers) => prevUsers.filter(u => u.username !== user.username))
        },
        [setUsers]
    )

    const handleRequestDrawing = useCallback(
        ({ socketId }: { socketId: SocketId }) => {
            socket.emit(SocketEvent.SYNC_DRAWING, { socketId, drawingData })
        },
        [drawingData, socket]
    )

    const handleDrawingSync = useCallback(
        ({ drawingData }: { drawingData: DrawingData }) => {
            setDrawingData(drawingData)
        },
        [setDrawingData]
    )

    useEffect(() => {
        socket.on("connect_error", handleError)
        socket.on("connect_failed", handleError)
        socket.on(SocketEvent.USERNAME_EXISTS, handleUsernameExist)
        socket.on(SocketEvent.JOIN_ACCEPTED, handleJoiningAccept)
        socket.on(SocketEvent.USER_DISCONNECTED, handleUserLeft)
        socket.on(SocketEvent.REQUEST_DRAWING, handleRequestDrawing)
        socket.on(SocketEvent.SYNC_DRAWING, handleDrawingSync)

        return () => {
            socket.off("connect_error", handleError)
            socket.off("connect_failed", handleError)
            socket.off(SocketEvent.USERNAME_EXISTS, handleUsernameExist)
            socket.off(SocketEvent.JOIN_ACCEPTED, handleJoiningAccept)
            socket.off(SocketEvent.USER_DISCONNECTED, handleUserLeft)
            socket.off(SocketEvent.REQUEST_DRAWING, handleRequestDrawing)
            socket.off(SocketEvent.SYNC_DRAWING, handleDrawingSync)
        }
    }, [
        handleError,
        handleUsernameExist,
        handleJoiningAccept,
        handleUserLeft,
        handleRequestDrawing,
        handleDrawingSync,
        socket,
    ])

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    )
}

export { SocketProvider }
export default SocketContext
