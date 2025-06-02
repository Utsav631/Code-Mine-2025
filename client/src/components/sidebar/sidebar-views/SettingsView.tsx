import Select from "@/components/common/Select"
import { useSettings } from "@/context/SettingContext"
import useResponsive from "@/hooks/useResponsive"
import { editorFonts } from "@/resources/Fonts"
import { editorThemes } from "@/resources/Themes"
import { langNames } from "@uiw/codemirror-extensions-langs"
import { ChangeEvent, useEffect } from "react"
import "./SettingsView.css";


function SettingsView() {
    const {
        theme,
        setTheme,
        language,
        setLanguage,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
        showGitHubCorner,
        setShowGitHubCorner,
        resetSettings,
    } = useSettings()
    const { viewHeight } = useResponsive()

    const handleFontFamilyChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setFontFamily(e.target.value)
    const handleThemeChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setTheme(e.target.value)
    const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setLanguage(e.target.value)
    const handleFontSizeChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setFontSize(parseInt(e.target.value))
    const handleShowGitHubCornerChange = (e: ChangeEvent<HTMLInputElement>) =>
        setShowGitHubCorner(e.target.checked)

    useEffect(() => {
        // Set editor font family
        const editor = document.querySelector(
            ".cm-editor > .cm-scroller",
        ) as HTMLElement
        if (editor !== null) {
            editor.style.fontFamily = `${fontFamily}, monospace`
        }
    }, [fontFamily])

    return (
  <div className="settings-view" style={{ height: viewHeight }}>
    <h1 className="view-title">Settings</h1>

    {/* Choose Font Family and Font Size option */}
    <div className="settings-row">
      <Select
        onChange={handleFontFamilyChange}
        value={fontFamily}
        options={editorFonts}
        title="Font Family"
      />
      <select
        value={fontSize}
        onChange={handleFontSizeChange}
        title="Font Size"
      >
        {[...Array(13).keys()].map((size) => (
          <option key={size} value={size + 12}>
            {size + 12}
          </option>
        ))}
      </select>
    </div>

    {/* Choose theme option */}
    <Select
      onChange={handleThemeChange}
      value={theme}
      options={Object.keys(editorThemes)}
      title="Theme"
    />

    {/* Choose language option */}
    <Select
      onChange={handleLanguageChange}
      value={language}
      options={langNames}
      title="Language"
    />

    {/* Show GitHub corner toggle */}
    <div className="toggle-container">
      <label>Show github corner</label>
      <label>
        <input
          type="checkbox"
          onChange={handleShowGitHubCornerChange}
          checked={showGitHubCorner}
        />
        <span className="switch"></span>
      </label>
    </div>

    {/* Reset button */}
    <button className="reset-button" onClick={resetSettings}>
      Reset to default
    </button>
  </div>
)

}

export default SettingsView
