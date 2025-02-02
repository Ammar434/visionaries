import { getMonthName, getMonthNumber, getSeverityLabel } from './utils.js';

export function drawMonthlyChart(data) {
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const width = 500;
    const height = 300;

    const monthlyData = Object.entries(data).map(([month, count]) => ({
        month: getMonthName(parseInt(month)),
        count: count
    })).sort((a, b) => getMonthNumber(a.month) - getMonthNumber(b.month));

    const svg = d3.select('#monthly-chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const x = d3.scaleBand()
        .range([margin.left, width - margin.right])
        .padding(0.1)
        .domain(monthlyData.map(d => d.month));

    const y = d3.scaleLinear()
        .range([height - margin.bottom, margin.top])
        .domain([0, d3.max(monthlyData, d => d.count)]).nice();

    // Create tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    // Add bars
    svg.selectAll('rect')
        .data(monthlyData)
        .join('rect')
        .attr('x', d => x(d.month))
        .attr('y', d => y(d.count))
        .attr('width', x.bandwidth())
        .attr('height', d => y(0) - y(d.count))
        .attr('fill', '#4299e1')
        .on('mouseover', (event, d) => {
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`${d.month}: ${d.count} accidents`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', () => {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
}

export function drawSeverityChart(data) {
    const width = 500;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 40;

    const severityData = Object.entries(data).map(([severity, count]) => ({
        severity: getSeverityLabel(severity),
        count: count
    }));

    const svg = d3.select('#severity-chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal()
        .domain(severityData.map(d => d.severity))
        .range(['#48bb78', '#ecc94b', '#f56565']);

    const pie = d3.pie()
        .value(d => d.count);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    // Create tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    const arcs = svg.selectAll('arc')
        .data(pie(severityData))
        .enter()
        .append('g');

    arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.severity))
        .on('mouseover', (event, d) => {
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`${d.data.severity}: ${d.data.count} accidents<br/>${((d.data.count / d3.sum(severityData, d => d.count)) * 100).toFixed(1)}%`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', () => {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

    arcs.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .text(d => ((d.data.count / d3.sum(severityData, d => d.count)) * 100).toFixed(0) + '%');
}