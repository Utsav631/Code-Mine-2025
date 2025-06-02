import "./ChatsView.css"
import ChatInput from "@/components/chats/ChatInput"
import ChatList from "@/components/chats/ChatList"
import useResponsive from "@/hooks/useResponsive"

const ChatsView = () => {
    const { viewHeight } = useResponsive()

    return (
        <div
            className="chats-view"
            style={{ height: `calc(${viewHeight} - 80px)` }}

        >
            <h1 className="view-title">Group Chat</h1>
            <ChatList />
            <ChatInput />
        </div>
    )
}

export default ChatsView
