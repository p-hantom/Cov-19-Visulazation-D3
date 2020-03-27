

//bar chart: config
function getConfirmedChartConfig(){
    let width = 360;
    let height = 400;
    let margin = {
        top: 10,
        bottom: 50,
        left: 100,
        right: 10
    }

    //The body is the are that will be occupied by the bars.
    let bodyHeight = height - margin.top - margin.bottom
    let bodyWidth = width - margin.left - margin.right

    let container = d3.select('#confirmedChart')
        .attr("width", width)
        .attr('height', height)
    
    return { width, height, margin, bodyHeight, bodyWidth, container }
}

//bar chart: scales
function getConfirmedChartScales(data, config){
    let maxCount = d3.max(data, d => d.count);
    
    let xScale = d3.scaleLinear()
        .domain([0, maxCount])
        .range([0, config.bodyWidth])
        .nice()
    
    let yScale = d3.scaleBand()
        .domain(data.map(d => {
            return d.country;
        }))
        .range([0, config.bodyHeight])
        .padding(0.1)
    
    return {xScale, yScale};
}

//bar chart: draw axes
function drawAxesConfirmedChart(data, scales, config){
    let {xScale, yScale} = scales;
    let {container, margin, height} = config;
    let axisX = d3.axisBottom(xScale)
        .ticks(5)
    
    container.append('g')
        .style('transform', `translate(${margin.left}px,${height-margin.bottom}px)`)
        .call(axisX)
    
    let axisY = d3.axisLeft(yScale)

    container.append('g')
        .style('transform', `translate(${margin.left}px,${margin.top}px)`)
        .call(axisY)
}

//bar chart: draw bars
function drawBarsConfirmedChart(data, scales, config){
    let {margin, container} = config; // this is equivalent to 'let margin = config.margin; let container = config.container'
    let {xScale, yScale} = scales;
    let body = container.append("g")
        .style("transform", 
            `translate(${margin.left}px,${margin.top}px)`
        )
    let bars = body.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .on('click', function(d){
            d3.select('#confirmedChart').selectAll('rect').attr('fill', '#2a5599')
            d3.select(this).attr('fill', 'darkred')
            d3.select('#confirmedTimeChart').selectAll('*').remove()
            d3.select('#stackedChart').selectAll('*').remove()
            
            drawStackChart(d.country)
            
            drawTimeSeries(timeSeriesConfirmed(d.country, store.confirmed), d.country);
            
        })
        //.on should not be written after transition, as there'd be confusion between transition.on() and others
    
    bars.attr('height', yScale.bandwidth())
        .attr('y', d => yScale(d.country))
        .transition().duration(500)
        .attr('width', d => xScale(d.count))
        .attr("fill", "#2a5599")
}

//bar chart: draw
function drawConfirmedChart(data){
    let config = getConfirmedChartConfig();
    let scales = getConfirmedChartScales(data, config);
    drawAxesConfirmedChart(data, scales, config);
    drawBarsConfirmedChart(data, scales, config);
}