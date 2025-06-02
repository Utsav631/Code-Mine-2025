import "./UsersView.css"; // 👈 This line is critical

import Users from "@/components/common/Users";
import { useAppContext } from "@/context/AppContext";
import { useSocket } from "@/context/SocketContext";
import useResponsive from "@/hooks/useResponsive";
import { USER_STATUS } from "@/types/user";
import toast from "react-hot-toast";
import { GoSignOut } from "react-icons/go";
import { IoShareOutline } from "react-icons/io5";
import { LuCopy } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";

function UsersView() {
    const navigate = useNavigate();
    const { viewHeight } = useResponsive();
    const { setStatus } = useAppContext();
    const { socket } = useSocket();
    const { roomId } = useParams();

    const copyRoomId = async () => {
        if (roomId) {
            try {
                await navigator.clipboard.writeText(roomId);
                toast.success("Room ID copied to clipboard");
            } catch (error) {
                toast.error("Unable to copy Room ID to clipboard");
                console.log(error);
            }
        }
    };

    const shareURL = async () => {
        const url = window.location.href;
        try {
            await navigator.share({ url });
        } catch (error) {
            toast.error("Unable to share URL");
            console.log(error);
        }
    };

    const leaveRoom = () => {
        socket.disconnect();
        setStatus(USER_STATUS.DISCONNECTED);
        navigate("/", { replace: true });
    };

    return (
        <div className="users-view" style={{ height: viewHeight }}>
            <h1 className="view-title">Users</h1>

            {/* Buttons on top */}
            <div className="users-actions">
                <div className="users-button-group">
                    <button
                        className="users-button button-white"
                        onClick={shareURL}
                        title="Share Link"
                    >
                        <IoShareOutline size={26} />
                    </button>
                    <button
                        className="users-button button-white"
                        onClick={copyRoomId}
                        title="Copy Room ID"
                    >
                        <LuCopy size={22} />
                    </button>
                    <button
                        className="users-button button-yellow"
                        onClick={leaveRoom}
                        title="Leave room"
                    >
                        <GoSignOut size={22} />
                    </button>
                </div>
            </div>

            {/* Users below */}
            <Users />
        </div>
    );
}

export default UsersView;
