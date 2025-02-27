import { AccidentSequences } from './accident_sequences.js';

/**
 * Configuration for the sunburst visualization
 */
export const VIZ_CONFIG = {
    dimensions: {
        width: 750,
        height: 750,
        radiusRatio: 20,
        minRadiusScale: 0.2,
        maxRadiusScale: 0.85,
        padding: 0.01,
        legendWidth: 200,
        legendItemHeight: 25
    },
    colors: {
        defaultColor: "#ccc",
        backgroundColor: "#f8f9fa",
        textColor: "#333333",
        highlightColor: "#ff7f0e",
        opacity: {
            default: 0.8,
            highlight: 1.0,
            fade: 0.3
        }
    },
    colorScales: {
        timeOfDay: {
            title: "Time of Day",
            domain: ['plein-jour', 'crepuscule', 'nuit-sans-eclairage', 'nuit-eclairage-eteint', 'nuit-eclairage-allume'],
            range: ['#ffd700', '#ffa500', '#2c3e50', '#34495e', '#7f8c8d'],
            labels: {
                'plein-jour': 'Daylight',
                'crepuscule': 'Twilight',
                'nuit-sans-eclairage': 'Night (No Lighting)',
                'nuit-eclairage-eteint': 'Night (Lights Off)',
                'nuit-eclairage-allume': 'Night (Lights On)'
            }
        },
        weather: {
            title: "Weather Conditions",
            domain: ['normal', 'pluie-legere', 'pluie-forte', 'neige-grele', 'brouillard', 'vent-tempete'],
            range: ['#66c2a5', '#8da0cb', '#6baed6', '#a6cee3', '#b2df8a', '#e31a1c'],
            labels: {
                'normal': 'Normal',
                'pluie-legere': 'Light Rain',
                'pluie-forte': 'Heavy Rain',
                'neige-grele': 'Snow/Hail',
                'brouillard': 'Fog',
                'vent-tempete': 'Wind/Storm'
            }
        },
        location: {
            title: "Location Type",
            domain: ['en-agglomeration', 'hors-agglomeration'],
            range: ['#e78ac3', '#a6d854'],
            labels: {
                'en-agglomeration': 'Urban Area',
                'hors-agglomeration': 'Rural Area'
            }
        },
        severity: {
            title: "Injury Severity",
            domain: ['indemne', 'blesse-leger', 'hospitalise', 'tue'],
            range: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3'],
            labels: {
                'indemne': 'Unharmed',
                'blesse-leger': 'Minor Injury',
                'hospitalise': 'Hospitalized',
                'tue': 'Fatal'
            }
        }
    },
    animation: {
        duration: 750,
        delay: 50
    },
    levels: [
        { id: 'timeOfDay', name: 'Time of Day' },
        { id: 'weather', name: 'Weather' },
        { id: 'location', name: 'Location' },
        { id: 'severity', name: 'Severity' }
    ]
};

/**
 * SunburstVisualization class
 * Creates and manages an interactive sunburst diagram for accident data visualization
 */
class SunburstVisualization {
    /**
     * Create a new sunburst visualization
     * @param {string} containerId - The ID of the container element
     * @param {Object} options - Optional configuration overrides
     */
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = d3.select(containerId);
        this.config = { ...VIZ_CONFIG, ...options };
        this.selectedLevels = [...this.config.levels.slice(0, 2)]; // Default: use first two levels
        this.selectedNode = null;
        this.data = null;
        this.isUpdating = false; // Flag to prevent recursive updates

        // Set up tooltip
        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "sunburst-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "rgba(255, 255, 255, 0.95)")
            .style("border", "1px solid #ddd")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("box-shadow", "0 2px 5px rgba(0, 0, 0, 0.2)")
            .style("pointer-events", "none")
            .style("font-size", "14px")
            .style("z-index", "1000");

        // Initialize the visualization layout
        this.init();
    }

    /**
     * Initialize the visualization
     */
    init() {
        this.setupDimensions();
        this.createControls();
        this.setupSVG();
        this.setupColorScales();
        this.setupLayout();
        this.createLegend();

        // Set up responsive behavior
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    /**
     * Set up visualization dimensions
     */
    setupDimensions() {
        this.width = this.config.dimensions.width;
        this.height = this.config.dimensions.height;
        this.radius = Math.min(this.width, this.height) / this.config.dimensions.radiusRatio;

        // Responsive sizing
        if (this.container.node().getBoundingClientRect().width > 0) {
            const containerWidth = this.container.node().getBoundingClientRect().width;
            if (containerWidth < this.width) {
                const scale = containerWidth / this.width;
                this.width = containerWidth;
                this.height = this.height * scale;
                this.radius = Math.min(this.width, this.height) / this.config.dimensions.radiusRatio;
            }
        }
    }

    /**
     * Create control panel elements
     */
    createControls() {
        // Clear any existing controls
        this.container.select(".sunburst-controls").remove();

        // Create control container
        const controlsContainer = this.container
            .append("div")
            .attr("class", "sunburst-controls")
            .style("margin-bottom", "20px");

        // Add title
        controlsContainer.append("h3")
            .text("Bicycle Accident Analysis")
            .style("margin-top", "0")
            .style("margin-bottom", "15px")
            .style("color", "#0052cc");

        // Create level selection controls
        const levelSelector = controlsContainer
            .append("div")
            .attr("class", "level-selector")
            .style("margin-bottom", "15px");

        levelSelector.append("span")
            .text("Hierarchy Levels: ")
            .style("font-weight", "bold")
            .style("margin-right", "10px");

        // Add level selection checkboxes
        this.config.levels.forEach((level) => {
            const levelCheckbox = levelSelector
                .append("label")
                .style("margin-right", "15px")
                .style("cursor", "pointer")
                .style("user-select", "none");

            levelCheckbox.append("input")
                .attr("type", "checkbox")
                .attr("value", level.id)
                .property("checked", this.selectedLevels.some(l => l.id === level.id))
                .style("margin-right", "5px")
                .on("change", (event) => {
                    this.toggleLevel(level.id, event.target.checked);
                });

            levelCheckbox.append("span")
                .text(level.name);
        });

        // Add button row
        const buttonRow = controlsContainer
            .append("div")
            .style("display", "flex")
            .style("gap", "10px");

        // Add reset zoom button
        buttonRow.append("button")
            .attr("class", "reset-button")
            .text("Reset View")
            .style("padding", "6px 12px")
            .style("border", "none")
            .style("border-radius", "4px")
            .style("background-color", "#0052cc")
            .style("color", "white")
            .style("cursor", "pointer")
            .on("click", () => this.resetZoom());

        // Add download button
        buttonRow.append("button")
            .attr("class", "download-button")
            .text("Export SVG")
            .style("padding", "6px 12px")
            .style("border", "1px solid #0052cc")
            .style("border-radius", "4px")
            .style("background-color", "white")
            .style("color", "#0052cc")
            .style("cursor", "pointer")
            .on("click", () => this.downloadSVG());
    }

    /**
     * Set up the SVG container for the visualization
     */
    setupSVG() {
        // Clear existing content
        this.container.select(".sunburst-visualization").remove();

        // Create wrapper
        const wrapper = this.container
            .append("div")
            .attr("class", "sunburst-visualization")
            .style("display", "flex")
            .style("align-items", "flex-start")
            .style("flex-wrap", "wrap");

        // Create chart container
        const chartContainer = wrapper
            .append("div")
            .attr("class", "chart-container")
            .style("flex", "1 1 auto")
            .style("min-width", "500px")
            .style("position", "relative");

        // Create SVG
        this.svg = chartContainer.append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("viewBox", `0 0 ${this.width} ${this.height}`)
            .style("font-family", "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");

        // Add background circle
        this.svg.append("circle")
            .attr("cx", this.width / 2)
            .attr("cy", this.height / 2)
            .attr("r", this.radius + 20)
            .attr("fill", this.config.colors.backgroundColor)
            .attr("stroke", "#e0e0e0")
            .attr("stroke-width", 1);

        // Create main group for sunburst
        this.chart = this.svg.append("g")
            .attr("transform", `translate(${this.width / 2},${this.height / 2})`);

        // Create center text group
        this.centerText = this.chart.append("g")
            .attr("class", "center-text")
            .style("text-anchor", "middle")
            .style("pointer-events", "none");

        // Add center text elements
        this.centerText.append("text")
            .attr("class", "percentage")
            .attr("dy", "-0.5em")
            .attr("font-size", "2em")
            .attr("font-weight", "bold")
            .text("");

        this.centerText.append("text")
            .attr("class", "sequence")
            .attr("dy", "1.5em")
            .attr("font-size", "1em")
            .text("");

        this.centerText.append("text")
            .attr("class", "count")
            .attr("dy", "3em")
            .attr("font-size", "1.2em")
            .attr("fill", "#555")
            .text("");

        // Create legend container
        this.legendContainer = wrapper
            .append("div")
            .attr("class", "legend-container")
            .style("flex", "0 0 auto")
            .style("margin-left", "20px")
            .style("width", `${this.config.dimensions.legendWidth}px`);
    }

    /**
     * Set up color scales for the visualization
     */
    setupColorScales() {
        this.colorScales = {};
        Object.entries(this.config.colorScales).forEach(([level, scale]) => {
            this.colorScales[level] = d3.scaleOrdinal()
                .domain(scale.domain)
                .range(scale.range);
        });
    }

    /**
     * Set up the D3 layout for partitioning data
     */
    setupLayout() {
        // Create arc generator
        this.arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
            .padRadius(this.radius / 2)
            .innerRadius(d => this.calculateRadius(d, 'inner'))
            .outerRadius(d => this.calculateRadius(d, 'outer'));

        // Create partition layout
        this.partition = d3.partition()
            .size([2 * Math.PI, this.radius]);
    }

    /**
     * Create interactive legend for the visualization
     */
    createLegend() {
        // Clear existing legend
        this.legendContainer.html("");

        // Add legend title
        this.legendContainer.append("h4")
            .text("Legend")
            .style("margin-top", "0")
            .style("margin-bottom", "15px")
            .style("color", "#333");

        // Create sections for each level in the visualization
        this.selectedLevels.forEach((level, i) => {
            const scaleInfo = this.config.colorScales[level.id];
            if (!scaleInfo) return;

            // Create section container
            const section = this.legendContainer
                .append("div")
                .attr("class", `legend-section legend-${level.id}`)
                .style("margin-bottom", "20px");

            // Add section title
            section.append("h5")
                .text(scaleInfo.title)
                .style("margin-top", "0")
                .style("margin-bottom", "8px")
                .style("font-weight", "600")
                .style("color", "#555");

            // Add items
            const items = section.selectAll(".legend-item")
                .data(scaleInfo.domain)
                .enter()
                .append("div")
                .attr("class", "legend-item")
                .style("display", "flex")
                .style("align-items", "center")
                .style("margin-bottom", "6px")
                .style("cursor", "pointer")
                .on("mouseover", (event, d) => this.highlightCategory(level.id, d))
                .on("mouseout", () => this.resetHighlight());

            // Add color swatch
            items.append("div")
                .style("width", "15px")
                .style("height", "15px")
                .style("border-radius", "3px")
                .style("background-color", d => this.colorScales[level.id](d))
                .style("margin-right", "8px");

            // Add label
            items.append("div")
                .text(d => scaleInfo.labels[d] || d)
                .style("font-size", "0.9em");
        });
    }

    /**
     * Calculate the radius for a given data point
     * @param {Object} d - The data point
     * @param {string} type - 'inner' or 'outer'
     * @returns {number} - The calculated radius
     */
    calculateRadius(d, type) {
        const minRadius = this.radius * this.config.dimensions.minRadiusScale;

        if (type === 'inner') {
            return Math.max(minRadius, d.y0 * this.radius);
        }
        return Math.max(d.y0 * this.radius, d.y1 * this.radius) - 1;
    }

    /**
     * Get the appropriate color for a data point
     * @param {Object} d - The data point
     * @returns {string} - The color as a hex code
     */
    getColor(d) {
        // Skip the root node
        if (d.depth === 0) return 'none';

        // Get the appropriate level for this depth
        const levelIds = this.selectedLevels.map(l => l.id);
        const scaleKey = levelIds[d.depth - 1];

        if (!scaleKey) return this.config.colors.defaultColor;

        return this.colorScales[scaleKey]?.(d.data.name) || this.config.colors.defaultColor;
    }

    /**
     * Format a number with commas - FIXED to avoid stack overflow
     * @param {number} num - The number to format
     * @returns {string} - The formatted number
     */
    formatNumber(num) {
        if (num === undefined || num === null) return "0";

        // Convert to string once
        const numStr = String(num);

        // Simple non-regex implementation to avoid stack overflow
        let result = "";
        let count = 0;

        for (let i = numStr.length - 1; i >= 0; i--) {
            count++;
            result = numStr[i] + result;

            if (count % 3 === 0 && i > 0) {
                result = "," + result;
            }
        }

        return result;
    }

    /**
     * Update the visualization with new data
     * @param {Object} data - The hierarchical data for the visualization
     */
    update(data) {
        // Prevent recursive updates
        if (this.isUpdating) return;
        this.isUpdating = true;

        try {
            this.data = data;

            // Apply level filtering if needed
            const filteredData = this.applyLevelFilter(data);

            // Create hierarchy
            const root = d3.hierarchy(filteredData)
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value);

            // Store the original positions for animations
            this.currentRoot = root;

            // Calculate partition layout
            const nodes = this.partition(root).descendants();

            // Create transition
            const t = d3.transition()
                .duration(this.config.animation.duration);

            // Update the paths
            const paths = this.chart.selectAll("path.segment")
                .data(nodes.filter(d => d.depth > 0), d => d.data.name + d.depth);

            // Handle exiting nodes
            paths.exit()
                .transition(t)
                .style("opacity", 0)
                .remove();

            // Handle new nodes
            const enterPaths = paths.enter()
                .append("path")
                .attr("class", "segment")
                .attr("d", this.arc)
                .style("fill", d => this.getColor(d))
                .style("opacity", 0)
                .style("stroke", "white")
                .style("stroke-width", 0.5);

            // Store current state for transitions
            enterPaths.each(function (d) {
                this._current = d;
            });

            // Add interactivity
            enterPaths
                .on("mouseover", (event, d) => this.handleMouseOver(event, d))
                .on("mousemove", (event) => this.handleMouseMove(event))
                .on("mouseout", () => this.handleMouseOut())
                .on("click", (event, d) => this.handleClick(event, d));

            // Update all paths with proper transition
            enterPaths.merge(paths)
                .transition(t)
                .style("fill", d => this.getColor(d))
                .style("opacity", 1)
                .attrTween("d", function (d) {
                    // Safe interpolation that doesn't cause recursion
                    const i = d3.interpolate(
                        this._current || { x0: d.x0, x1: d.x0, y0: d.y0, y1: d.y0 },
                        { x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1 }
                    );

                    // Store current state
                    this._current = { x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1 };

                    // Return interpolation function
                    return (t) => {
                        const b = i(t);
                        return this.arc({
                            x0: b.x0,
                            x1: b.x1,
                            y0: b.y0,
                            y1: b.y1,
                            depth: d.depth,
                            data: d.data
                        });
                    };
                }.bind(this));

            // Update center text
            this.updateCenterText(root);
        } finally {
            // Always reset the update flag
            this.isUpdating = false;
        }
    }

    /**
     * Apply level filtering to the data - FIXED to be more efficient
     * @param {Object} data - The original data
     * @returns {Object} - Filtered data
     */
    applyLevelFilter(data) {
        if (!data) return { name: "root", children: [] };

        // Get selected level IDs
        const levelIds = this.selectedLevels.map(l => l.id);

        // If using all levels or no levels selected, return original data
        if (levelIds.length === this.config.levels.length) {
            return data;
        }

        // Clone the data to avoid modifying the original
        const filteredData = { name: data.name, children: [] };

        // Maximum depth to go (based on selected levels)
        const maxDepth = levelIds.length;

        // Iterative approach to avoid stack overflow
        const processNode = (srcNode, destNode, currentDepth) => {
            if (currentDepth >= maxDepth) {
                // We've reached max depth, calculate the sum
                destNode.value = getNodeValue(srcNode);
                return;
            }

            // Process children if they exist
            if (srcNode.children && srcNode.children.length > 0) {
                destNode.children = [];

                for (const srcChild of srcNode.children) {
                    const destChild = { name: srcChild.name };
                    destNode.children.push(destChild);
                    processNode(srcChild, destChild, currentDepth + 1);
                }
            } else {
                // No children, so just copy the value
                destNode.value = srcNode.value || 0;
            }
        };

        // Helper to calculate total value of a node and its children
        const getNodeValue = (node) => {
            if (!node.children) return node.value || 0;

            let sum = 0;
            for (const child of node.children) {
                sum += getNodeValue(child);
            }
            return sum;
        };

        // Start processing from root
        processNode(data, filteredData, 0);

        return filteredData;
    }

    /**
     * Handle mouse over event for segments
     * @param {Event} event - The mouse event
     * @param {Object} d - The data point
     */
    handleMouseOver(event, d) {
        // Calculate percentage
        const root = d.ancestors().find(node => node.depth === 0);
        const percentage = (100 * d.value / root.value).toFixed(1);

        // Get the sequence
        const sequence = d.ancestors().reverse().slice(1);

        // Update center display
        this.updateCenterText(null, d, percentage);

        // Highlight the sequence
        this.highlightSequence(sequence);

        // Show tooltip
        this.showTooltip(event, d, percentage);
    }

    /**
     * Handle mouse move event for tooltip positioning
     * @param {Event} event - The mouse event
     */
    handleMouseMove(event) {
        // Position tooltip near mouse
        this.tooltip
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 10) + "px");
    }

    /**
     * Handle mouse out event
     */
    handleMouseOut() {
        // Hide tooltip
        this.tooltip.style("visibility", "hidden");

        // Reset center text if no node is selected
        if (!this.selectedNode) {
            this.updateCenterText(this.currentRoot);
        }

        // Reset highlight if no node is selected
        if (!this.selectedNode) {
            this.resetHighlight();
        }
    }

    /**
     * Handle click event on segments
     * @param {Event} event - The click event
     * @param {Object} d - The data point
     */
    handleClick(event, d) {
        // Toggle selection state
        if (this.selectedNode === d) {
            this.selectedNode = null;
            this.resetZoom();
        } else {
            this.selectedNode = d;
            this.zoomToNode(d);
        }

        // Prevent event bubbling
        event.stopPropagation();
    }

    /**
     * Zoom to a specific node - FIXED to avoid stack overflow
     * @param {Object} d - The node to zoom to
     */
    zoomToNode(d) {
        if (!d || this.isUpdating) return;

        // Get the sequence for this node
        const sequence = d.ancestors().reverse().slice(1);

        // Highlight the sequence
        this.highlightSequence(sequence);

        // Update center text
        const root = d.ancestors().find(node => node.depth === 0);
        const percentage = (100 * d.value / root.value).toFixed(1);
        this.updateCenterText(null, d, percentage);

        // Create a fixed transition
        const t = d3.transition().duration(750);

        // Track which paths should stay visible
        const keepVisible = new Set();
        sequence.forEach(node => keepVisible.add(node));

        // Get angle sizes for zooming
        const targetX0 = d.x0;
        const targetX1 = d.x1;
        const targetY0 = d.y0;
        const targetY1 = d.y1;

        // Apply transform to visible paths
        this.chart.selectAll("path.segment")
            .filter(node => keepVisible.has(node) || node === d)
            .transition(t)
            .attrTween("d", function (node) {
                // Calculate scaled position
                const xScale = d3.scaleLinear()
                    .domain([targetX0, targetX1])
                    .range([0, 2 * Math.PI]);

                const yScale = d3.scaleLinear()
                    .domain([targetY0, 1])
                    .range([0, 1]);

                // Store start and end points
                const startX0 = node.x0;
                const startX1 = node.x1;
                const startY0 = node.y0;
                const startY1 = node.y1;

                // Define what the final state should be
                const endX0 = xScale(node.x0);
                const endX1 = xScale(node.x1);
                const endY0 = yScale(node.y0);
                const endY1 = yScale(node.y1);

                // Create interpolator
                const interpolator = d3.interpolateObject(
                    { x0: startX0, x1: startX1, y0: startY0, y1: startY1 },
                    { x0: endX0, x1: endX1, y0: endY0, y1: endY1 }
                );

                // Return tween function
                return (t) => {
                    const pos = interpolator(t);
                    node.x0 = pos.x0;
                    node.x1 = pos.x1;
                    node.y0 = pos.y0;
                    node.y1 = pos.y1;
                    return this.arc(node);
                };
            }.bind(this));

        // Fade out paths that should be hidden
        this.chart.selectAll("path.segment")
            .filter(node => !keepVisible.has(node) && node !== d)
            .transition(t)
            .style("opacity", 0.1);
    }

    /**
     * Reset zoom to show the entire visualization
     */
    resetZoom() {
        // Prevent during updates
        if (this.isUpdating) return;

        // Clear selected node
        this.selectedNode = null;

        // Reset highlight
        this.resetHighlight();

        // Only proceed if we have data
        if (!this.data) return;

        // Reset the visualization with a smooth transition
        this.update(this.data);
    }

    /**
     * Show tooltip with detailed information
     * @param {Event} event - The mouse event
     * @param {Object} d - The data point
     * @param {string} percentage - The percentage string
     */
    showTooltip(event, d, percentage) {
        // Get sequence for display
        const sequence = d.ancestors().reverse().slice(1);
        const sequenceLabels = [];

        // Build sequence labels safely to avoid recursion
        for (let i = 0; i < sequence.length; i++) {
            const node = sequence[i];
            const levelId = this.selectedLevels[i]?.id;

            if (!levelId) {
                sequenceLabels.push(node.data.name);
                continue;
            }

            const scaleInfo = this.config.colorScales[levelId];
            const label = scaleInfo?.labels[node.data.name] || node.data.name;
            sequenceLabels.push(label);
        }

        // Create tooltip content
        let content = `
            <div style="font-weight: bold; font-size: 1.1em; margin-bottom: 8px;">${sequenceLabels.join(' > ')}</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <div style="font-weight: bold;">Count:</div>
                <div>${this.formatNumber(d.value)}</div>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <div style="font-weight: bold;">Percentage:</div>
                <div>${percentage}%</div>
            </div>
        `;

        // Show tooltip
        this.tooltip
            .html(content)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 10) + "px")
            .style("visibility", "visible");
    }

    /**
     * Update the center text display - FIXED to avoid stack overflow
     * @param {Object} root - The root node (for total count)
     * @param {Object} node - The currently selected/hovered node
     * @param {string} percentage - The percentage to display
     */
    updateCenterText(root = null, node = null, percentage = null) {
        // If root is provided, show total overview
        if (root) {
            this.centerText.select(".percentage")
                .text("100%");

            this.centerText.select(".sequence")
                .text("All Accidents");

            this.centerText.select(".count")
                .text(`Total: ${this.formatNumber(root.value)}`);

            return;
        }

        // If no node is provided, clear the text
        if (!node) {
            this.centerText.select(".percentage").text("");
            this.centerText.select(".sequence").text("");
            this.centerText.select(".count").text("");
            return;
        }

        // Get sequence for display
        const sequence = node.ancestors().reverse().slice(1);
        const sequenceLabels = [];

        // Build sequence labels safely
        for (let i = 0; i < sequence.length; i++) {
            const n = sequence[i];
            const levelId = i < this.selectedLevels.length ? this.selectedLevels[i].id : null;

            if (!levelId) {
                sequenceLabels.push(n.data.name);
                continue;
            }

            const scaleInfo = this.config.colorScales[levelId];
            const label = scaleInfo?.labels[n.data.name] || n.data.name;
            sequenceLabels.push(label);
        }

        // Update text elements
        this.centerText.select(".percentage")
            .text(`${percentage}%`);

        this.centerText.select(".sequence")
            .text(sequenceLabels.join(' > '));

        this.centerText.select(".count")
            .text(`${this.formatNumber(node.value)} accidents`);
    }

    /**
     * Highlight a sequence of nodes in the visualization
     * @param {Array} sequence - Array of nodes to highlight
     */
    highlightSequence(sequence) {
        if (!sequence || sequence.length === 0) return;

        // Create a set for faster lookups
        const highlightSet = new Set(sequence);

        // Apply highlighting to all segments
        this.chart.selectAll("path.segment")
            .transition()
            .duration(200)
            .style("opacity", node => {
                return highlightSet.has(node) ?
                    this.config.colors.opacity.highlight :
                    this.config.colors.opacity.fade;
            })
            .style("stroke-width", node => {
                return highlightSet.has(node) ? 1.5 : 0.5;
            });
    }

    /**
     * Highlight segments belonging to a specific category
     * @param {string} levelId - The level ID
     * @param {string} category - The category value
     */
    highlightCategory(levelId, category) {
        // Find the level index
        const levelIndex = this.selectedLevels.findIndex(l => l.id === levelId);
        if (levelIndex === -1) return;

        // Highlight matching segments
        this.chart.selectAll("path.segment")
            .transition()
            .duration(200)
            .style("opacity", node => {
                return (node.depth === levelIndex + 1 && node.data.name === category) ?
                    this.config.colors.opacity.highlight :
                    this.config.colors.opacity.fade;
            })
            .style("stroke-width", node => {
                return (node.depth === levelIndex + 1 && node.data.name === category) ? 1.5 : 0.5;
            });
    }

    /**
     * Reset highlighting to default state
     */
    resetHighlight() {
        // If we have a selected node, maintain its highlighting
        if (this.selectedNode) {
            const sequence = this.selectedNode.ancestors().reverse().slice(1);
            this.highlightSequence(sequence);
            return;
        }

        // Otherwise reset to default opacity
        this.chart.selectAll("path.segment")
            .transition()
            .duration(200)
            .style("opacity", this.config.colors.opacity.default)
            .style("stroke-width", 0.5);
    }

    /**
     * Toggle a level in the hierarchy
     * @param {string} levelId - The ID of the level to toggle
     * @param {boolean} isActive - Whether the level should be active
     */
    toggleLevel(levelId, isActive) {
        // Prevent during updates
        if (this.isUpdating) return;

        // Validate inputs
        if (!levelId) return;

        // Find the level info
        const levelInfo = this.config.levels.find(l => l.id === levelId);
        if (!levelInfo) return;

        // Get a copy of current levels
        const newLevels = [...this.selectedLevels];

        // Update selected levels
        if (isActive) {
            // Don't add if already present
            if (newLevels.some(l => l.id === levelId)) return;

            // Find the original position of this level
            const originalIndex = this.config.levels.findIndex(l => l.id === levelId);

            // Insert at the correct position
            let inserted = false;
            for (let i = 0; i < newLevels.length; i++) {
                const currentLevelIndex = this.config.levels.findIndex(l => l.id === newLevels[i].id);
                if (originalIndex < currentLevelIndex) {
                    newLevels.splice(i, 0, levelInfo);
                    inserted = true;
                    break;
                }
            }

            // If not inserted, add to the end
            if (!inserted) {
                newLevels.push(levelInfo);
            }
        } else {
            // Don't remove if it's not present
            if (!newLevels.some(l => l.id === levelId)) return;

            // Remove the level
            const index = newLevels.findIndex(l => l.id === levelId);
            if (index !== -1) {
                newLevels.splice(index, 1);
            }
        }

        // Only update if there's been a change
        if (JSON.stringify(newLevels) !== JSON.stringify(this.selectedLevels)) {
            // Update selected levels
            this.selectedLevels = newLevels;

            // Reset selected node
            this.selectedNode = null;

            // Update visualization
            this.createLegend();
            this.update(this.data);
        }
    }

    /**
     * Handle window resize event
     */
    handleResize() {
        // Prevent during updates
        if (this.isUpdating) return;

        // Update dimensions
        this.setupDimensions();

        // Update SVG viewBox
        this.svg
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("viewBox", `0 0 ${this.width} ${this.height}`);

        // Update background circle
        this.svg.select("circle")
            .attr("cx", this.width / 2)
            .attr("cy", this.height / 2)
            .attr("r", this.radius + 20);

        // Update chart transform
        this.chart
            .attr("transform", `translate(${this.width / 2},${this.height / 2})`);

        // Update arc generator
        this.setupLayout();

        // Update visualization
        if (this.data) {
            this.update(this.data);
        }
    }

    /**
     * Download the current SVG as an image
     */
    downloadSVG() {
        try {
            // Create a clone of the SVG
            const svgClone = this.svg.node().cloneNode(true);

            // Set attributes needed for download
            d3.select(svgClone)
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .attr("version", "1.1");

            // Convert to string
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgClone);

            // Create download link
            const link = document.createElement('a');
            link.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
            link.download = 'accident_visualization.svg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error exporting SVG:", error);
            alert("Failed to export SVG. Please try again.");
        }
    }
}

/**
 * Initialize the visualization when document is ready
 */
async function initVisualization() {
    try {
        // Show loading indicator
        const container = d3.select("#chart");

        const loading = container
            .append("div")
            .attr("class", "loading-indicator")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("justify-content", "center")
            .style("align-items", "center")
            .style("height", "300px");

        loading.append("div")
            .style("font-size", "18px")
            .style("margin-bottom", "20px")
            .text("Loading accident data...");

        loading.append("div")
            .style("width", "50px")
            .style("height", "50px")
            .style("border", "5px solid #f3f3f3")
            .style("border-top", "5px solid #0052cc")
            .style("border-radius", "50%")
            .style("animation", "spin 2s linear infinite");

        // Add keyframes for spinner
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        // Load data
        const sequences = new AccidentSequences();
        const data = await sequences.createHierarchicalData();

        // Remove loading indicator
        loading.remove();

        // Create and update visualization
        const visualization = new SunburstVisualization("#chart");
        visualization.update(data);
    } catch (error) {
        console.error("Error creating visualization:", error);

        // Show error message
        const container = d3.select("#chart");
        container.html("");

        container.append("div")
            .style("padding", "20px")
            .style("text-align", "center")
            .style("color", "#d32f2f")
            .html(`
                <h3>Error Loading Visualization</h3>
                <p>${error.message}</p>
                <button style="padding: 8px 16px; background-color: #0052cc; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                  onclick="window.location.reload()">
                  Retry
                </button>
            `);
    }
}

document.addEventListener('DOMContentLoaded', initVisualization);
