let bisectDate = d3.bisector(function(d) { return d.date; }).left
// let tooltip = d3.select('#tooltipTimeSeries')

//line chart: config
function getTimeChartConfig(){
    let width = 1000;
    let height = 350;
    let margin = {
        top: 20,
        bottom: 70,
        left: 100,
        right: 110
    }

    //The body is the are that will be occupied by the bars.
    let bodyHeight = height - margin.top - margin.bottom
    let bodyWidth = width - margin.left - margin.right

    let container = d3.select('#confirmedTimeChart')
        .attr("width", width)
        .attr('height', height)

    let tooltip = container.append('g')
        .attr('class', 'tooltipTimeSeries')
    
    tooltip.append("circle")
        .attr("r", 5);
    tooltip.append("rect")
        .attr('class', 'tooltipRect')
        .attr("width", 130)
        .attr("height", 75)
        .attr("x", 10)
        .attr("y", -22)
        .attr("rx", 4)
        .attr("ry", 4);
    tooltip.append('text')
        .attr('class', 'tooltipDate')
        .style('font-weight', 'bold')
        .attr("x", 18)
        .attr("y", -2);
    tooltip.append("text")
        .attr("x", 18)
        .attr("y", 18)
        .text("Total Confirmed:");
    tooltip.append("text")
        .attr('class', 'tooltipNumber')
        .style('font-weight', 'bold')
        .attr("x", 18)
        .attr("y", 38);
    
    
    return { width, height, margin, bodyHeight, bodyWidth, container, tooltip }
}

//format time for one denoted country(string)
function timeSeriesConfirmed(country, data){
    let result = data
        .filter(d => d['Country/Region']===country)
        .reduce((acc, d)=>{
            let dList = Object.keys(d);
            let numList = Object.values(d);
            for(let i in dList){
                if(i>=4){
                    let date = dList[i], num = numList[i];
                    let parts = date.split("/");
                    fdate = new Date(Number("20"+parts[2]), Number(parts[0]) - 1, Number(parts[1]));
                    let curData = acc[fdate] || {
                        'date': fdate,
                        'num': 0
                    }
                    curData.num += +num;
                    acc[fdate] = curData;
                }
            }
            return acc;
        },{})
    
    result = Object.keys(result).map(key => result[key])
    return result;
}

//line chart: scales
function getTimeSeriesScales(data, config){
    let xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        // .domain([data[0].date, data[data.length-1].date])
        .range([0, config.bodyWidth])
        .nice()
    
    let maxNum = data[data.length-1].num;
    let yScale = d3.scaleLinear()
        .range([config.bodyHeight, 0])
        .domain([0, maxNum])
        .nice()
    
    return {xScale, yScale};
}

function drawAxesTimeSeriesChart(data, scales, config){
    let {xScale, yScale} = scales;
    let {container, margin, height} = config;

    let axisX = d3.axisBottom(xScale)
    container.append('g')
        .style('transform', `translate(${margin.left}px,${height-margin.bottom}px)`)
        .call(axisX)
    
    let axisY = d3.axisLeft(yScale)
    container.append('g')
        .style('transform', `translate(${margin.left}px,${margin.top}px)`)
        .call(axisY)
        
}

function drawLinesTimeSeries(data, scales, config){
    let {margin, container, tooltip} = config; // this is equivalent to 'let margin = config.margin; let container = config.container'
    let {xScale, yScale} = scales;
    let body = container.append("g")
        .style("transform", 
            `translate(${margin.left}px,${margin.top}px)`
        )
    
    let lineG = d3.line()
        .x(d=> xScale(d.date))
        .y(d=> yScale(d.num))
    
    body.append('path')
        .datum(data)
        .attr('d', lineG)
        .attr('class', 'line')
        
    container
        .on('mouseover', function(d){
            tooltip.style('display', 'block')
            // showToolTip([d3.event.clientX, d3.event.clientY], d.date, d.num)
        })
        .on('mouseout', function(d){
            tooltip.style('display', 'none');
        })
        // .on('mousemove', showToolTip(scales, data))
        .on('mousemove', function(){
            showToolTip(scales, data, this, config)
        })
}

function showToolTip(scales, data, tt, config){
    let {margin, tooltip} = config
    let {xScale, yScale} = scales;
    //---d3.mouse(this): the relative position to this svg!!!
    let x0 = xScale.invert(d3.mouse(tt)[0]-margin.left),
        i = bisectDate(data, x0, 1),
        d = data[i - 1]
        // d1 = data[i]
        // d = x0 - d0.date > d1.date - x0 ? d1 : d0;

    tooltip.attr("transform", "translate(" + (xScale(d.date)+margin.left) + "," + (yScale(d.num)+margin.top)
     + ")");

    tooltip.select('.tooltipDate')
        .text(d.date.toLocaleDateString("en-US"))   //convert to m/dd/yyyy format
    tooltip.select('.tooltipNumber')
        .text(d.num)
}

function drawTimeSeries(data, country){
    d3.select('#timeSeriesTitle').text(`Confirmed In ${country} - Time Series`)
    let config = getTimeChartConfig();
    let scales = getTimeSeriesScales(data, config);
    drawAxesTimeSeriesChart(data, scales, config);
    // initToolTip();
    drawLinesTimeSeries(data, scales, config);
    
}