import { useViews } from "@/context/ViewContext"
import useLocalStorage from "@/hooks/useLocalStorage"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { ReactNode } from "react"
import Split from "react-split"
import styles from "./SplitterComponent.module.css"

function SplitterComponent({ children }: { children: ReactNode }) {
    const { isSidebarOpen } = useViews()
    const { isMobile, width } = useWindowDimensions()
    const { setItem, getItem } = useLocalStorage()

    const getGutter = () => {
        const gutter = document.createElement("div")
        gutter.className = styles.gutter
        return gutter
    }

    const getSizes = () => {
        if (isMobile) return [0, width]
        const savedSizes = getItem("editorSizes")
        let sizes = [25, 75]
        if (savedSizes) {
            sizes = JSON.parse(savedSizes)
        }
        return isSidebarOpen ? sizes : [0, width]
    }

    const getMinSizes = () => {
        if (isMobile) return [0, width]
        return isSidebarOpen ? [10, 10] : [0, width] // allow resizing to extremes
    }

    const getMaxSizes = () => {
        if (isMobile) return [0, Infinity]
        return [Infinity, Infinity] // let both panels grow
    }

    const handleGutterDrag = (sizes: number[]) => {
        setItem("editorSizes", JSON.stringify(sizes))
    }

    const getGutterStyle = () => ({
        width: "7px",
        display: isSidebarOpen && !isMobile ? "block" : "none",
    })

    return (
        <Split
            sizes={getSizes()}
            minSize={getMinSizes()}
            maxSize={getMaxSizes()}
            gutter={getGutter}
            dragInterval={1}
            direction="horizontal"
            gutterAlign="center"
            cursor="col-resize"
            snapOffset={30}
            gutterStyle={getGutterStyle}
            onDrag={handleGutterDrag}
            className={styles.splitContainer}
        >
            {children}
        </Split>
    )
}

export default SplitterComponent
