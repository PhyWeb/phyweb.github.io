/**
 * Converts a TSV (Tab-Separated Values) string into a JSON string
 * compatible with the .pw session file format for the Grapher application.
 *
 * This function is standalone and does not depend on the application's main instance.
 *
 * @param {string} tsvString - The string containing the data in TSV format.
 * @returns {string} A JSON string representing the content of the .pw file.
 */
export function convertTSVtoPW(tsvString) {
    // Helper function to split lines, tolerating tabs and spaces
    const splitFlexibleLine = (line) => line.trim().split(/\t+/);

    const lines = tsvString.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) {
        throw new Error("Input TSV string is empty or contains only whitespace.");
    }

    let headers = [];
    let units = [];
    let dataLines = [];

    // Check if the first line is numeric to determine if there are headers
    const firstLineCells = splitFlexibleLine(lines[0]);
    const isFirstLineNumeric = firstLineCells.length > 0 && !isNaN(parseFloat(firstLineCells[0].replace(',', '.').trim()));

    if (isFirstLineNumeric) {
        // No header row, generate default headers
        const numColumns = lines.reduce((max, line) => Math.max(max, splitFlexibleLine(line).length), 0);
        headers = Array.from({ length: numColumns }, (_, i) => `Colonne ${i + 1}`);
        units = Array(numColumns).fill("");
        dataLines = lines;
    } else {
        // Header row exists
        headers = splitFlexibleLine(lines[0]);
        
        // Check for a unit row (if the second line is not numeric)
        if (lines.length > 1) {
            const secondLineCells = splitFlexibleLine(lines[1]);
            const isSecondLineNumeric = secondLineCells.length > 0 && !isNaN(parseFloat(secondLineCells[0].replace(',', '.').trim()));

            if (isSecondLineNumeric) {
                // No unit row
                units = Array(headers.length).fill("");
                dataLines = lines.slice(1);
            } else {
                // Unit row exists
                units = splitFlexibleLine(lines[1]);
                dataLines = lines.slice(2);
            }
        } else {
            // Only a header row
            units = Array(headers.length).fill("");
        }
    }

    // Ensure headers and units match the maximum number of columns found
    const numColumns = Math.max(headers.length, units.length, ...dataLines.map(line => splitFlexibleLine(line).length));
    while (headers.length < numColumns) headers.push(`Colonne ${headers.length + 1}`);
    while (units.length < numColumns) units.push("");

    // Prepare data columns
    const columnsData = Array.from({ length: numColumns }, () => []);
    for (const line of dataLines) {
        const cells = splitFlexibleLine(line);
        for (let i = 0; i < numColumns; i++) {
            const rawValue = cells[i];
            let value = null;
            if (rawValue !== undefined && rawValue.trim() !== "") {
                const parsed = parseFloat(rawValue.replace(',', '.').trim());
                if (!isNaN(parsed)) {
                    value = parsed;
                }
            }
            columnsData[i].push(value);
        }
    }

    // Create curve objects from the parsed data
    const curves = headers.map((title, i) => ({
        title: title,
        unit: units[i] || "",
        values: columnsData[i],
        // Default properties similar to those in generatePW
        color: null, // Grapher will assign a color
        line: true,
        markers: true,
        lineWidth: 2,
        lineStyle: "Solid",
        markerSymbol: "circle",
        markerRadius: 3,
        type: "raw",
        length: columnsData[i].length
    }));

    // Construct the final .pw state object
    const pwState = {
        version: "3.0",
        data: {
            curves: curves,
            parameters: [],
            models: [],
            annotations: []
        },
        calculations: "", // No calculations by default
        grapher: {
            xCurve: curves.length > 0 ? curves[0].title : null,
            yCurves: curves.slice(1).map(c => c.title)
        },
        sort: {
            lastSortVariable: null
        }
    };

    // Return the state as a JSON string with indentation
    return JSON.stringify(pwState, null, 2);
}