import { useChatRoom } from "@/context/ChatContext"
import { useViews } from "@/context/ViewContext"
import { VIEWS } from "@/types/view"
import { useState } from "react"
import { Tooltip } from "react-tooltip"
import { buttonStyles } from "../tooltipStyles"
import clsx from "clsx"
import "./buttonStyles.css"

interface ViewButtonProps {
  viewName: VIEWS
  icon: JSX.Element
}

const ViewButton = ({ viewName, icon }: ViewButtonProps) => {
  const { activeView, setActiveView, isSidebarOpen, setIsSidebarOpen } = useViews()
  const { isNewMessage } = useChatRoom()
  const [showTooltip, setShowTooltip] = useState(false)

  const isActive = activeView === viewName

  const handleViewClick = () => {
    if (isActive) {
      setIsSidebarOpen(!isSidebarOpen)
    } else {
      setActiveView(viewName)
      setIsSidebarOpen(true)
    }
  }

  return (
    <div className="relative flex flex-col items-center">
      <button
  onClick={handleViewClick}
  onMouseEnter={() => setShowTooltip(true)}
  aria-label={viewName}
  className={`sidebar-button ${isActive ? "active" : ""}`}
  {...(showTooltip && {
    "data-tooltip-id": `tooltip-${viewName}`,
    "data-tooltip-content": viewName,
  })}
>
  <div className="flex items-center justify-center">{icon}</div>

  {viewName === VIEWS.CHATS && isNewMessage && (
    <div className="notification-dot"></div>
  )}
</button>


      {showTooltip && (
        <Tooltip
          id={`tooltip-${viewName}`}
          place="right"
          offset={25}
          // NO styles applied here
          noArrow={false}
          positionStrategy="fixed"
          float={true}
        />
      )}
    </div>
  )
}

export default ViewButton
