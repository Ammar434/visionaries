// mapVisualizer.js
export class MapVisualizer {
    constructor(containerId) {
        this.containerId = containerId;
        this.svg = null;
        this.projection = null;
        this.width = 0;
        this.height = 0;
        this.accidents = [];
    }

    initialize() {
        const container = document.getElementById(this.containerId);
        this.width = container.clientWidth;
        this.height = container.clientHeight;

        this.svg = d3.select(`#${this.containerId}`)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        // Create projection centered on France
        this.projection = d3.geoMercator()
            .center([2.2137, 46.2276])
            .scale(2500)
            .translate([this.width / 2, this.height / 2]);

        // Add base map group
        this.svg.append('g')
            .attr('class', 'map-base');

        // Add points group
        this.svg.append('g')
            .attr('class', 'accident-points');
    }

    updateData(accidents) {
        this.accidents = accidents;
        this.drawPoints();
    }

    drawPoints() {
        // Remove existing points
        this.svg.select('.accident-points')
            .selectAll('circle')
            .remove();

        // Add new points
        this.svg.select('.accident-points')
            .selectAll('circle')
            .data(this.accidents)
            .enter()
            .append('circle')
            .attr('cx', d => this.projection([d.long, d.lat])[0])
            .attr('cy', d => this.projection([d.long, d.lat])[1])
            .attr('r', 4)
            .attr('fill', 'red')
            .attr('opacity', 0.6)
            .on('mouseover', (event, d) => this.handleMouseOver(event, d))
            .on('mouseout', (event, d) => this.handleMouseOut(event, d))
            .on('click', (event, d) => this.handleClick(event, d));
    }

    handleMouseOver(event, d) {
        d3.select(event.target)
            .attr('r', 6)
            .attr('fill', 'orange')
            .attr('opacity', 1);

        // Add tooltip
        this.svg.append('text')
            .attr('class', 'tooltip')
            .attr('x', event.pageX + 10)
            .attr('y', event.pageY - 10)
            .text(`Date: ${d.jour}/${d.mois}/${d.an}`);
    }

    handleMouseOut(event, d) {
        d3.select(event.target)
            .attr('r', 4)
            .attr('fill', 'red')
            .attr('opacity', 0.6);

        // Remove tooltip
        this.svg.selectAll('.tooltip').remove();
    }

    handleClick(event, d) {
        console.log('Accident details:', d);
        // TODO: Show detailed accident information
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