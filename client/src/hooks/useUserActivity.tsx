import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { SocketEvent, SocketId } from "@/types/socket"
import { RemoteUser, USER_CONNECTION_STATUS } from "@/types/user"
import { useCallback, useEffect } from "react"

function useUserActivity() {
	const { setUsers } = useAppContext()
	const { socket } = useSocket()

	// Emit online/offline only if socket.id is available
	const emitUserStatus = useCallback(
		(status: SocketEvent.USER_ONLINE | SocketEvent.USER_OFFLINE) => {
			if (socket && socket.id) {
				socket.emit(status, { socketId: socket.id })
			}
		},
		[socket],
	)

	const handleVisibilityChange = useCallback(() => {
		if (document.visibilityState === "visible") {
			emitUserStatus(SocketEvent.USER_ONLINE)
		} else if (document.visibilityState === "hidden") {
			emitUserStatus(SocketEvent.USER_OFFLINE)
		}
	}, [emitUserStatus])

	const updateUserStatus = useCallback(
		({ socketId, status }: { socketId: SocketId; status: USER_CONNECTION_STATUS }) => {
			setUsers((users) =>
				users.map((user) =>
					user.socketId === socketId ? { ...user, status } : user,
				),
			)
		},
		[setUsers],
	)

	const handleUserOnline = useCallback(
		({ socketId }: { socketId: SocketId }) => {
			updateUserStatus({ socketId, status: USER_CONNECTION_STATUS.ONLINE })
		},
		[updateUserStatus],
	)

	const handleUserOffline = useCallback(
		({ socketId }: { socketId: SocketId }) => {
			updateUserStatus({ socketId, status: USER_CONNECTION_STATUS.OFFLINE })
		},
		[updateUserStatus],
	)

	const handleTypingEvent = useCallback(
		({ user }: { user: RemoteUser }) => {
			setUsers((users) =>
				users.map((u) => (u.socketId === user.socketId ? user : u)),
			)
		},
		[setUsers],
	)

	useEffect(() => {
		document.addEventListener("visibilitychange", handleVisibilityChange)

		if (socket) {
			socket.on(SocketEvent.USER_ONLINE, handleUserOnline)
			socket.on(SocketEvent.USER_OFFLINE, handleUserOffline)
			socket.on(SocketEvent.TYPING_START, handleTypingEvent)
			socket.on(SocketEvent.TYPING_PAUSE, handleTypingEvent)
		}

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange)

			if (socket) {
				socket.off(SocketEvent.USER_ONLINE, handleUserOnline)
				socket.off(SocketEvent.USER_OFFLINE, handleUserOffline)
				socket.off(SocketEvent.TYPING_START, handleTypingEvent)
				socket.off(SocketEvent.TYPING_PAUSE, handleTypingEvent)
			}
		}
	}, [
		socket,
		handleVisibilityChange,
		handleUserOnline,
		handleUserOffline,
		handleTypingEvent,
	])
}

export default useUserActivity
