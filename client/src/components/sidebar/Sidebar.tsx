import styles from "./Sidebar.module.css"
import SidebarButton from "@/components/sidebar/sidebar-views/SidebarButton"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { useViews } from "@/context/ViewContext"
import useResponsive from "@/hooks/useResponsive"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { ACTIVITY_STATE } from "@/types/app"
import { SocketEvent } from "@/types/socket"
import { VIEWS } from "@/types/view"
import { IoCodeSlash } from "react-icons/io5"
import { MdOutlineDraw } from "react-icons/md"
import { Tooltip } from 'react-tooltip'
import { useState } from 'react'

function Sidebar() {
    const {
        activeView,
        isSidebarOpen,
        viewComponents,
        viewIcons,
        setIsSidebarOpen,
    } = useViews()
    const { minHeightReached } = useResponsive()
    const { activityState, setActivityState } = useAppContext()
    const { socket } = useSocket()
    const { isMobile } = useWindowDimensions()
    const [showTooltip, setShowTooltip] = useState(true)

    const changeState = () => {
        setShowTooltip(false)
        if (activityState === ACTIVITY_STATE.CODING) {
            setActivityState(ACTIVITY_STATE.DRAWING)
            socket.emit(SocketEvent.REQUEST_DRAWING)
        } else {
            setActivityState(ACTIVITY_STATE.CODING)
        }

        if (isMobile) {
            setIsSidebarOpen(false)
        }
    }

    return (
        <aside className={styles.sidebarWrapper}>
            <div
                className={`${styles.sidebarContainer} md:${styles.sidebarContainerDesktop} ${minHeightReached ? styles.hideSidebar : ''}`}
            >
                {[
                    VIEWS.FILES,
                    VIEWS.CHATS,
                    VIEWS.COPILOT,
                    VIEWS.RUN,
                    VIEWS.CLIENTS,
                    VIEWS.SETTINGS
                ].map((view) => (
                    <SidebarButton
                        key={view}
                        viewName={view}
                        icon={viewIcons[view]}
                    />
                ))}

                <div className={styles.sidebarButtonWrapper}>
                    <button
                        className={styles.toggleButton}
                        onClick={changeState}
                        onMouseEnter={() => setShowTooltip(true)}
                        data-tooltip-id="activity-state-tooltip"
                        data-tooltip-content={
                            activityState === ACTIVITY_STATE.CODING
                                ? "Switch to Drawing Mode"
                                : "Switch to Coding Mode"
                        }
                    >
                        {activityState === ACTIVITY_STATE.CODING
                            ? <MdOutlineDraw size={24} />
                            : <IoCodeSlash size={24} />}
                    </button>
                    {showTooltip && (
                        <Tooltip
                            id="activity-state-tooltip"
                            place="right"
                            offset={15}
                            className="!z-50 tooltip"
                            noArrow={false}
                            positionStrategy="fixed"
                            float={true}
                        />
                    )}
                </div>
            </div>

            <div
                className={`${styles.viewContainerDesktop} ${isMobile ? styles.viewContainer : ''}`}
                style={isSidebarOpen ? {} : { display: "none" }}
            >
                {viewComponents[activeView]}
            </div>
        </aside>
    )
}

export default Sidebar