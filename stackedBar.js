function transposeData(country, c, d, r){
    let confirmedNum = c.filter(t => t.country===country)[0].count;
    let deathsNum = d.filter(t => t.country===country)[0].count;
    let recoveredNum = r.filter(t => t.country===country)[0].count;

    //only for drawing chart
    let dataset = [{
        'confirmedNum': confirmedNum-deathsNum-recoveredNum,
        'deathsNum': deathsNum,
        'recoveredNum': recoveredNum
    }]

    let numberset = {
        'confirmedNum': confirmedNum,
        'deathsNum': deathsNum,
        'recoveredNum': recoveredNum,
        'deathsRatio': deathsNum/confirmedNum,
        'recoveredRatio': recoveredNum/confirmedNum
    }
    
    let stack = d3.stack().keys(Object.keys(dataset[0]))(dataset);
    return {stack, dataset, numberset};
}

function getStackConfig(){
    let width = 600;
    let height = 330;
    let margin = {
        top: 100,
        bottom: 180,
        left: 10,
        right: 200
    }

    //The body is the are that will be occupied by the bars.
    let bodyHeight = height - margin.top - margin.bottom
    let bodyWidth = width - margin.left - margin.right

    let container = d3.select('#stackedChart')
        .attr("width", width)
        .attr('height', height)
    
    //---for legends
    let colors = ['darkgrey','firebrick','green']
    let colorsScale = d3.scaleOrdinal()
        .range(colors)
    let lengthScale = d3.scaleLinear()
        .range([0,bodyWidth])
    
    //---for tooltip
    let tooltip = container
        .append('g')
        .style('display', 'none')
    tooltip
        .append('rect')
        .attr('class', 'tooltipRect')
        .attr("width", 90)
        .attr("height", 40)
        .attr("x", 10)
        .attr("y", 32)
        .attr("rx", 4)
        .attr("ry", 4);
    tooltip.append('text')
        .attr("x", 25)
        .attr("y", 55)
    
    return { width, height, margin, bodyHeight, bodyWidth, container, colorsScale, lengthScale, colors, tooltip }
}

function drawLegend(config){
    let {colors, container} = config;
    let rectWidth = 20, rectHeight = 20;
    let legendNames = ['Confirmed','Deaths','Recovered']
    
    let legend = container.append('g').selectAll('.legend')
        .data(colors)
        .enter().append('g')
        .attr('class','legend')
        .style('transform', function(d, i){return `translate(15px, ${i*25+5}px)`})
    legend.append('rect')
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr('fill', d => d)
    legend.append('text')
        .attr('x', rectWidth+10)
        .attr('y', 15)
        .text((d, i) => legendNames[i])
}

function showStackTooltip(total, curNum, tooltip, coords, color){
    let formatPercentage = d3.format(",.2%")
    tooltip.style('transform',`translate(${coords[0]}px,${coords[1]}px)`)
    tooltip.select('text')
        .text(formatPercentage(curNum/total))
    tooltip.select('rect')
        .style('stroke', color)
        .style('fill', color)
        .style('opacity', 0.1)
}

function drawStackChart(country){
    d3.select('#stackTitle')
        .text(`Deaths And Recovered In ${country}`)
    let c=store.confirmedByCtry, d=store.deathsByCtry, r = store.recoveredByCtry
    let {stack, dataset, numberset} = transposeData(country, c, d, r);
    let config = getStackConfig();
    let keys = Object.keys(dataset[0])

    // console.log(numberset)

    let lengthScale = config.lengthScale;
    lengthScale.domain([0, numberset.confirmedNum])
    config.colorsScale.domain(keys)

    config.container.append('g')
        .style('transform', `translate(${config.margin.left}px,${config.margin.top}px)`)
        // .selectAll('g')
        .selectAll('rect')
        .data(stack)
        .enter()
        .append('rect')
        // .append('g')
            .attr('fill', d => config.colorsScale(d.key))
        // .selectAll('rect')
        // .data(d => d).enter().append('rect')
            .attr('x', d => lengthScale(d[0][0]))
            .attr('width', d => {
                console.log(d)
                return lengthScale(d[0][1])-lengthScale(d[0][0])
            })
            .attr('height', config.bodyHeight)
            .on('mouseover', function(d){
                config.tooltip.style('display', 'block').raise()
                // d3.select('#stackTooltip').style('display', 'block')
                // showStackTooltip(numberset.confirmedNum, d[0][1]-d[0][0], config.tooltip, d3.mouse(config.container.node()));
                console.log("over")
            })
            .on('mouseout', function(d){
                config.tooltip.style('display', 'none')
                // d3.select('#stackTooltip').style('display', 'none');
                // console.log("out")
            })
            .on('mousemove', function(d){
                // console.log(d[1]-d[0])
                //----d3.mouse(config.container.node()) : relative position to svg
                showStackTooltip(numberset.confirmedNum, d[0][1]-d[0][0], config.tooltip, d3.mouse(config.container.node()), config.colorsScale(d.key));
            })
            .transition().duration(500)
            
    
    drawLegend(config)
}