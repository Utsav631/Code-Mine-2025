import { useRunCode } from "@/context/RunCodeContext"
import useResponsive from "@/hooks/useResponsive"
import { ChangeEvent } from "react"
import toast from "react-hot-toast"
import { LuCopy } from "react-icons/lu"
import { PiCaretDownBold } from "react-icons/pi"
import "./RunView.css";


function RunView() {
    const { viewHeight } = useResponsive()
    const {
        setInput,
        output,
        isRunning,
        supportedLanguages,
        selectedLanguage,
        setSelectedLanguage,
        runCode,
    } = useRunCode()

    const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const lang = JSON.parse(e.target.value)
        setSelectedLanguage(lang)
    }

    const copyOutput = () => {
        navigator.clipboard.writeText(output)
        toast.success("Output copied to clipboard")
    }

    return (
    <div className="run-view-container">
        <h1 className="run-view-title">Run Code</h1>
        <div className="run-view-inner">
            <div className="relative">
                <select
                    className="select-language"
                    value={JSON.stringify(selectedLanguage)}
                    onChange={handleLanguageChange}
                >
                    {supportedLanguages
                        .sort((a, b) => (a.language > b.language ? 1 : -1))
                        .map((lang, i) => (
                            <option key={i} value={JSON.stringify(lang)}>
                                {lang.language + (lang.version ? ` (${lang.version})` : "")}
                            </option>
                        ))}
                </select>
                <PiCaretDownBold
                    size={16}
                    style={{ position: "absolute", bottom: 12, right: 20, color: "white" }}
                />
            </div>
            <textarea
                className="input-textarea"
                placeholder="Write your input here..."
                onChange={(e) => setInput(e.target.value)}
            />
            <button
                className="run-button"
                onClick={runCode}
                disabled={isRunning}
            >
                {isRunning ? "Running..." : "Run Code"}
            </button>
            <label className="output-label">
                Output:
                <button onClick={copyOutput} title="Copy Output">
                    <LuCopy size={18} style={{ cursor: "pointer", color: "white" }} />
                </button>
            </label>
            <div className="output-container">
                <code>
                    <pre>{output}</pre>
                </code>
            </div>
        </div>
    </div>
)

}

export default RunView
