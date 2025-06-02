import { useAppContext } from "@/context/AppContext"
import { useChatRoom } from "@/context/ChatContext"
import { SyntheticEvent, useEffect, useRef } from "react"
import styles from "./ChatList.module.css"

function ChatList() {
    const {
        messages,
        isNewMessage,
        setIsNewMessage,
        lastScrollHeight,
        setLastScrollHeight,
    } = useChatRoom()
    const { currentUser } = useAppContext()
    const messagesContainerRef = useRef<HTMLDivElement | null>(null)

    const handleScroll = (e: SyntheticEvent) => {
        const container = e.target as HTMLDivElement
        setLastScrollHeight(container.scrollTop)
    }

    useEffect(() => {
        if (!messagesContainerRef.current) return
        messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight
    }, [messages])

    useEffect(() => {
        if (isNewMessage) {
            setIsNewMessage(false)
        }
        if (messagesContainerRef.current)
            messagesContainerRef.current.scrollTop = lastScrollHeight
    }, [isNewMessage, setIsNewMessage, lastScrollHeight])

    return (
        <div
            className={styles.chatContainer}
            ref={messagesContainerRef}
            onScroll={handleScroll}
        >
            {messages.map((message, index) => {
                const isCurrentUser = message.username === currentUser.username
                return (
                    <div
                        key={index}
                        className={`${styles.messageBox} ${
                            isCurrentUser ? styles.selfEnd : ""
                        }`}
                    >
                        <div className={styles.meta}>
                            <span className={styles.username}>
                                {message.username}
                            </span>
                            <span className={styles.timestamp}>
                                {message.timestamp}
                            </span>
                        </div>
                        <p className={styles.messageText}>{message.message}</p>
                    </div>
                )
            })}
        </div>
    )
}

export default ChatList
