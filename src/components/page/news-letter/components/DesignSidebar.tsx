import React, { useState } from "react";

interface DesignSidebarProps {
  selectedElement: string | null;
}

interface LayoutFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface ColorOption {
  id: string;
  value: string;
  label: string;
}

const DesignSidebar: React.FC<DesignSidebarProps> = ({ selectedElement }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(["layout", "template"]);
  const [selectedFormat, setSelectedFormat] = useState("default");
  const [bodyColor, setBodyColor] = useState("#ffffff");
  const [borderWidth, setBorderWidth] = useState(1);
  const [borderColor, setBorderColor] = useState("#EAF0F6");
  const [backgroundType, setBackgroundType] = useState("color");
  const [backgroundColor, setBackgroundColor] = useState("#EEEEEE");

  // Text Styles
  const [paragraphFont, setParagraphFont] = useState("Arial");
  const [paragraphSize, setParagraphSize] = useState("15px");
  const [heading1Font, setHeading1Font] = useState("Arial");
  const [heading1Size, setHeading1Size] = useState("28px");
  const [heading2Font, setHeading2Font] = useState("Arial");
  const [heading2Size, setHeading2Size] = useState("22px");
  const [lineHeight, setLineHeight] = useState("1.5");
  const [linkColor, setLinkColor] = useState("#ff6b35");

  // Button Styles
  const [buttonRadius, setButtonRadius] = useState(0);
  const [buttonColor, setButtonColor] = useState("#ff6b35");
  const [buttonFont, setButtonFont] = useState("Arial");
  const [buttonFontSize, setButtonFontSize] = useState("16px");

  // Divider Styles
  const [dividerHeight, setDividerHeight] = useState(1);
  const [dividerColor, setDividerColor] = useState("#1e3a8a");
  const [dividerStyle, setDividerStyle] = useState("Solid");

  // Spacing
  const [topPadding, setTopPadding] = useState("0px");
  const [bottomPadding, setBottomPadding] = useState("0px");
  const [removeMobilePadding, setRemoveMobilePadding] = useState(true);

  const layoutFormats: LayoutFormat[] = [
    {
      id: "default",
      name: "Default",
      description: "Best for bespoke email designs when you need complex layouts with padding and columns.",
      icon: (
        <div className="w-8 h-8 border border-gray-300 rounded bg-white flex items-center justify-center">
          <div className="w-4 h-4 bg-gray-200"></div>
        </div>
      ),
    },
    {
      id: "boxed",
      name: "Boxed",
      description: "Best for email designs where most of the content sits inside a border.",
      icon: (
        <div className="w-8 h-8 border-2 border-blue-500 rounded bg-blue-50 flex items-center justify-center">
          <div className="w-4 h-4 bg-blue-200"></div>
        </div>
      ),
    },
    {
      id: "simple",
      name: "Simple",
      description:
        "Best for 1 to 1 communications when you need a simple layout. This will make the content full width by removing formatting like padding and columns.",
      icon: (
        <div className="w-8 h-8 border border-gray-300 rounded bg-white flex items-center justify-center">
          <div className="w-6 h-1 bg-gray-300"></div>
        </div>
      ),
    },
  ];

  const fontOptions = ["Arial", "Georgia", "Times New Roman", "Helvetica", "Verdana"];
  const fontSizes = ["12px", "14px", "15px", "16px", "18px", "20px", "22px", "24px", "28px", "32px"];
  const lineHeights = ["1.0", "1.2", "1.4", "1.5", "1.6", "1.8", "2.0"];
  const dividerStyles = ["Solid", "Dashed", "Dotted"];

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {/* Layout Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("layout")}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-900">Layout</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${
                expandedSections.includes("layout") ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.includes("layout") && (
            <div className="px-4 pb-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                  <div className="space-y-2">
                    {layoutFormats.map((format) => (
                      <div key={format.id}>
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="format"
                            value={format.id}
                            checked={selectedFormat === format.id}
                            onChange={(e) => setSelectedFormat(e.target.value)}
                            className="mt-1 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {format.icon}
                              <span className="text-sm font-medium text-gray-900">{format.name}</span>
                            </div>
                            <p className="text-xs text-gray-500">{format.description}</p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Template Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("template")}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-900">Template</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">All devices</span>
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  expandedSections.includes("template") ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {expandedSections.includes("template") && (
            <div className="px-4 pb-4 space-y-4">
              {/* Body Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Body color</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">#</span>
                  <input
                    type="text"
                    value={bodyColor.replace("#", "")}
                    onChange={(e) => setBodyColor(`#${e.target.value}`)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                    style={{ backgroundColor: bodyColor }}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "color";
                      input.value = bodyColor;
                      input.onchange = (e) => setBodyColor((e.target as HTMLInputElement).value);
                      input.click();
                    }}
                  />
                </div>
              </div>

              {/* Border Width and Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Border width</label>
                  <select
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(Number(e.target.value))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[0, 1, 2, 3, 4, 5].map((width) => (
                      <option key={width} value={width}>
                        {width}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">#</span>
                    <input
                      type="text"
                      value={borderColor.replace("#", "")}
                      onChange={(e) => setBorderColor(`#${e.target.value}`)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div
                      className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
                      style={{ backgroundColor: borderColor }}
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "color";
                        input.value = borderColor;
                        input.onchange = (e) => setBorderColor((e.target as HTMLInputElement).value);
                        input.click();
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Background Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background type</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="backgroundType"
                      value="color"
                      checked={backgroundType === "color"}
                      onChange={(e) => setBackgroundType(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Color</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="backgroundType"
                      value="pattern"
                      checked={backgroundType === "pattern"}
                      onChange={(e) => setBackgroundType(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Pattern</span>
                  </label>
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background color</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">#</span>
                  <input
                    type="text"
                    value={backgroundColor.replace("#", "")}
                    onChange={(e) => setBackgroundColor(`#${e.target.value}`)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                    style={{ backgroundColor: backgroundColor }}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "color";
                      input.value = backgroundColor;
                      input.onchange = (e) => setBackgroundColor((e.target as HTMLInputElement).value);
                      input.click();
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Text Styles Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("textStyles")}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-900">Text styles</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${
                expandedSections.includes("textStyles") ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.includes("textStyles") && (
            <div className="px-4 pb-4 space-y-4">
              {/* Paragraph */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Paragraph</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={paragraphFont}
                    onChange={(e) => setParagraphFont(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  >
                    {fontOptions.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                  <select
                    value={paragraphSize}
                    onChange={(e) => setParagraphSize(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  >
                    {fontSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Heading 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heading 1</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={heading1Font}
                    onChange={(e) => setHeading1Font(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  >
                    {fontOptions.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                  <select
                    value={heading1Size}
                    onChange={(e) => setHeading1Size(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  >
                    {fontSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Heading 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heading 2</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={heading2Font}
                    onChange={(e) => setHeading2Font(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  >
                    {fontOptions.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                  <select
                    value={heading2Size}
                    onChange={(e) => setHeading2Size(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  >
                    {fontSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Line Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Line height</label>
                <select
                  value={lineHeight}
                  onChange={(e) => setLineHeight(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  {lineHeights.map((height) => (
                    <option key={height} value={height}>
                      {height}
                    </option>
                  ))}
                </select>
              </div>

              {/* Text Link Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text link color</label>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded-full border border-gray-300 cursor-pointer"
                    style={{ backgroundColor: linkColor }}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "color";
                      input.value = linkColor;
                      input.onchange = (e) => setLinkColor((e.target as HTMLInputElement).value);
                      input.click();
                    }}
                  />
                  <div className="flex space-x-1">
                    <button className="px-2 py-1 text-xs font-medium bg-gray-100 rounded">B</button>
                    <button className="px-2 py-1 text-xs font-medium bg-gray-100 rounded italic">I</button>
                    <button className="px-2 py-1 text-xs font-medium bg-gray-100 rounded underline">U</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buttons Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("buttons")}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-900">Buttons</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${
                expandedSections.includes("buttons") ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.includes("buttons") && (
            <div className="px-4 pb-4 space-y-4">
              {/* Button Radius and Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Radius</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={buttonRadius}
                      onChange={(e) => setButtonRadius(Number(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 11l5-5m0 0l5 5m-5-5v12"
                        />
                      </svg>
                      <svg
                        className="w-3 h-3 text-gray-400 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 13l-5 5m0 0l-5-5m5 5V6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button color</label>
                  <div
                    className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                    style={{ backgroundColor: buttonColor }}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "color";
                      input.value = buttonColor;
                      input.onchange = (e) => setButtonColor((e.target as HTMLInputElement).value);
                      input.click();
                    }}
                  />
                </div>
              </div>

              {/* Button Font */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={buttonFont}
                    onChange={(e) => setButtonFont(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  >
                    {fontOptions.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                  <div className="relative">
                    <select
                      value={buttonFontSize}
                      onChange={(e) => setButtonFontSize(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      {fontSizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 11l5-5m0 0l5 5m-5-5v12"
                        />
                      </svg>
                      <svg
                        className="w-3 h-3 text-gray-400 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 13l-5 5m0 0l-5-5m5 5V6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Button Style */}
              <div>
                <div className="flex space-x-1">
                  <button className="px-2 py-1 text-xs font-medium bg-gray-100 rounded">B</button>
                  <button className="px-2 py-1 text-xs font-medium bg-gray-100 rounded italic">I</button>
                  <button className="px-2 py-1 text-xs font-medium bg-gray-100 rounded underline">U</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dividers Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("dividers")}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-900">Dividers</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${
                expandedSections.includes("dividers") ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.includes("dividers") && (
            <div className="px-4 pb-4 space-y-4">
              {/* Height and Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={dividerHeight}
                      onChange={(e) => setDividerHeight(Number(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 11l5-5m0 0l5 5m-5-5v12"
                        />
                      </svg>
                      <svg
                        className="w-3 h-3 text-gray-400 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 13l-5 5m0 0l-5-5m5 5V6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div
                    className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                    style={{ backgroundColor: dividerColor }}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "color";
                      input.value = dividerColor;
                      input.onchange = (e) => setDividerColor((e.target as HTMLInputElement).value);
                      input.click();
                    }}
                  />
                </div>
              </div>

              {/* Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                <select
                  value={dividerStyle}
                  onChange={(e) => setDividerStyle(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  {dividerStyles.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Spacing Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("spacing")}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-900">Spacing</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${
                expandedSections.includes("spacing") ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.includes("spacing") && (
            <div className="px-4 pb-4 space-y-4">
              {/* Padding */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    id="applyAllSides"
                    className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="applyAllSides" className="text-sm text-gray-700">
                    Apply to all sides
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Top</label>
                    <div className="relative">
                      <select
                        value={topPadding}
                        onChange={(e) => setTopPadding(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="0px">0px</option>
                        <option value="5px">5px</option>
                        <option value="10px">10px</option>
                        <option value="15px">15px</option>
                        <option value="20px">20px</option>
                      </select>
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 11l5-5m0 0l5 5m-5-5v12"
                          />
                        </svg>
                        <svg
                          className="w-3 h-3 text-gray-400 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 13l-5 5m0 0l-5-5m5 5V6"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Bottom</label>
                    <div className="relative">
                      <select
                        value={bottomPadding}
                        onChange={(e) => setBottomPadding(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="0px">0px</option>
                        <option value="5px">5px</option>
                        <option value="10px">10px</option>
                        <option value="15px">15px</option>
                        <option value="20px">20px</option>
                      </select>
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 11l5-5m0 0l5 5m-5-5v12"
                          />
                        </svg>
                        <svg
                          className="w-3 h-3 text-gray-400 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 13l-5 5m0 0l-5-5m5 5V6"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Settings */}
              <div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">MOBILE</span>
                </div>
                <div className="mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={removeMobilePadding}
                      onChange={(e) => setRemoveMobilePadding(e.target.checked)}
                      className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Remove padding on mobile devices</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignSidebar;
