import * as d3 from 'd3';

export class MapVisualizer {
    constructor(containerId) {
        this.containerId = containerId;
        this.svg = null;
        this.projection = null;
        this.width = 0;
        this.height = 0;
        this.accidents = [];
        this.zoom = null;
        this.tooltip = null;
    }

    initialize() {
        const container = document.getElementById(this.containerId);
        this.width = container.clientWidth;
        this.height = container.clientHeight;

        // Create tooltip div
        this.tooltip = d3.select('body')
            .append('div')
            .attr('class', 'map-tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background-color', 'white')
            .style('padding', '10px')
            .style('border-radius', '5px')
            .style('box-shadow', '0 2px 4px rgba(0,0,0,0.2)')
            .style('pointer-events', 'none');

        this.svg = d3.select(`#${this.containerId}`)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        // Add gradient definitions for point halos
        const defs = this.svg.append('defs');
        const gradient = defs.append('radialGradient')
            .attr('id', 'point-halo')
            .attr('cx', '50%')
            .attr('cy', '50%')
            .attr('r', '50%');

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', 'rgba(255, 0, 0, 0.4)');
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', 'rgba(255, 0, 0, 0)');

        // Create projection centered on France
        this.projection = d3.geoMercator()
            .center([2.2137, 46.2276])
            .scale(2500)
            .translate([this.width / 2, this.height / 2]);

        // Create a main container for all map elements
        this.mainContainer = this.svg.append('g')
            .attr('class', 'main-container');

        // Add zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([1, 12])  // Allow more zoom levels
            .extent([[0, 0], [this.width, this.height]])
            .on('zoom', (event) => {
                this.mainContainer.attr('transform', event.transform);

                // Scale points inversely to maintain size
                const points = this.mainContainer.selectAll('.accident-point');
                points.attr('r', 4 / event.transform.k);
                points.attr('stroke-width', 1 / event.transform.k);

                // Adjust halos
                const halos = this.mainContainer.selectAll('.point-halo');
                halos.attr('r', 12 / event.transform.k);
            });

        // Add double-click to reset zoom
        this.svg.on('dblclick', () => {
            this.svg.transition()
                .duration(750)
                .call(this.zoom.transform, d3.zoomIdentity);
        });

        this.svg.call(this.zoom);

        // Add layers to main container
        this.mainContainer.append('g')
            .attr('class', 'map-base');

        this.mainContainer.append('g')
            .attr('class', 'density-layer');

        this.mainContainer.append('g')
            .attr('class', 'accident-points');
    }

    getSeverityColor(severity) {
        const colors = {
            1: '#fee8c8', // Light injury
            2: '#fdbb84', // Severe injury
            3: '#e34a33'  // Fatal
        };
        return colors[severity] || '#999999';
    }

    updateData(accidents) {
        this.accidents = accidents;
        this.drawDensity();
        this.drawPoints();
    }

    drawDensity() {
        // Create a 2D density estimation using kernel density estimation
        const points = this.accidents.map(d => {
            const pos = this.projection([d.long, d.lat]);
            return pos ? pos : null;
        }).filter(d => d !== null);

        if (points.length === 0) return;

        // Create density data
        const densityData = d3.contourDensity()
            .x(d => d[0])
            .y(d => d[1])
            .size([this.width, this.height])
            .bandwidth(20)
            (points);

        // Color scale for density
        const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
            .domain([0, d3.max(densityData, d => d.value) || 1]);

        // Draw density contours
        this.svg.select('.density-layer')
            .selectAll('path')
            .data(densityData)
            .join('path')
            .attr('d', d3.geoPath())
            .attr('fill', d => colorScale(d.value))
            .attr('opacity', 0.3);
    }

    drawPoints() {
        const points = this.svg.select('.accident-points')
            .selectAll('g')
            .data(this.accidents)
            .join('g')
            .attr('transform', d => {
                const pos = this.projection([d.long, d.lat]);
                return pos ? `translate(${pos[0]},${pos[1]})` : null;
            });

        // Remove old elements
        points.selectAll('*').remove();

        // Add halos
        points.append('circle')
            .attr('class', 'point-halo')
            .attr('r', 12)
            .attr('fill', 'url(#point-halo)')
            .style('opacity', 0);

        // Add points
        points.append('circle')
            .attr('class', 'accident-point')
            .attr('r', 4)
            .attr('fill', d => this.getSeverityColor(d.grav))
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .attr('opacity', 0.8);

        // Add interactions
        points
            .on('mouseover', (event, d) => this.handleMouseOver(event, d))
            .on('mouseout', (event, d) => this.handleMouseOut(event, d))
            .on('click', (event, d) => this.handleClick(event, d));
    }

    handleMouseOver(event, d) {
        const point = d3.select(event.currentTarget);

        // Animate point
        point.select('.accident-point')
            .transition()
            .duration(200)
            .attr('r', 6)
            .attr('opacity', 1);

        point.select('.point-halo')
            .transition()
            .duration(200)
            .style('opacity', 1);

        // Show tooltip
        this.tooltip
            .transition()
            .duration(200)
            .style('opacity', 0.9);

        const tooltipContent = `
            <strong>Date:</strong> ${d.jour}/${d.mois}/${d.an}<br/>
            <strong>Severity:</strong> ${this.getSeverityLabel(d.grav)}<br/>
            ${d.location_details ? `<strong>Location:</strong> ${d.location_details.voie}` : ''}
        `;

        this.tooltip
            .html(tooltipContent)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
    }

    handleMouseOut(event, d) {
        const point = d3.select(event.currentTarget);

        // Reset point
        point.select('.accident-point')
            .transition()
            .duration(200)
            .attr('r', 4)
            .attr('opacity', 0.8);

        point.select('.point-halo')
            .transition()
            .duration(200)
            .style('opacity', 0);

        // Hide tooltip
        this.tooltip
            .transition()
            .duration(200)
            .style('opacity', 0);
    }

    getSeverityLabel(severity) {
        const labels = {
            1: 'Light injury',
            2: 'Severe injury',
            3: 'Fatal'
        };
        return labels[severity] || 'Unknown';
    }

    handleClick(event, d) {
        // Zoom to clicked point
        const pos = this.projection([d.long, d.lat]);
        if (pos) {
            // Calculate bounds to center the point
            const scale = 8;
            const dx = pos[0];
            const dy = pos[1];
            const x = (this.width / 2) - (dx * scale);
            const y = (this.height / 2) - (dy * scale);

            // Smoothly zoom to the accident location
            this.svg.transition()
                .duration(750)
                .call(this.zoom.transform,
                    d3.zoomIdentity
                        .translate(x, y)
                        .scale(scale)
                );

            // Prevent event bubbling
            event.stopPropagation();
        }
    }

    filterByMonth(month) {
        if (month === 'all') {
            this.updateData(this.accidents);
        } else {
            const filtered = this.accidents.filter(d => d.mois === parseInt(month));
            this.updateData(filtered);
        }
    }
}