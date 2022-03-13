import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import axios from "axios";
import * as d3 from "d3";

const App = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchAPI = async () => {
      const response = await axios.get("https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json");
      const data = response.data;

      setData(data);
    };
    fetchAPI();
  }, []);

  d3.select("body").selectAll("*").remove();

  return (
    <>
      <CreateBarChart data={data} />
    </>
  );
};

const CreateBarChart = ({ data }) => {
  const margin = {
      top: 100,
      right: 20,
      bottom: 30,
      left: 60,
    },
    width = 920 - margin.left - margin.right,
    height = 630 - margin.top - margin.bottom;
  useEffect(() => {
    let x = d3.scaleLinear().range([0, width]);
    let y = d3.scaleLinear().range([0, height]);

    let tooltip = d3.select("body").append("div").attr("class", "tooltip").attr("id", "tooltip").style("opacity", 0);
    let svg = d3
      .select("body")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("class", "graph")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    let color = d3.scaleOrdinal(d3.schemeCategory10);

    let timeFormat = d3.timeFormat("%M:%S");

    let xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
    let yAxis = d3.axisLeft(y).tickFormat(timeFormat);

    data.forEach((d) => {
      d.Place = +d.Place;
      let parsedTime = d.Time.split(":");
      d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
    });

    x.domain([d3.min(data, (d) => d.Year - 1), d3.max(data, (d) => d.Year + 1)]);
    y.domain(
      d3.extent(data, function (d) {
        return d.Time;
      })
    );

    svg
      .append("g")
      .attr("class", "x axis")
      .attr("id", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "x-axis-label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Year");

    svg.append("g").attr("class", "y axis").attr("id", "y-axis").call(yAxis).append("text").attr("class", "label").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end").text("Best Time (minutes)");

    svg.append("text").attr("transform", "rotate(-90)").attr("x", -160).attr("y", -44).style("font-size", 18).text("Time in Minutes");

    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 6)
      .attr("cx", function (d) {
        return x(d.Year);
      })
      .attr("cy", function (d) {
        return y(d.Time);
      })
      .attr("data-xvalue", function (d) {
        return d.Year;
      })
      .attr("data-yvalue", function (d) {
        return d.Time.toISOString();
      })
      .style("fill", function (d) {
        return color(d.Doping !== "");
      })
      .on("mouseover", function (d) {
        tooltip.style("opacity", 0.9);
        tooltip.attr("data-year", d.Year);
        tooltip
          .html(d.Name + ": " + d.Nationality + "<br/>" + "Year: " + d.Year + ", Time: " + timeFormat(d.Time) + (d.Doping ? "<br/><br/>" + d.Doping : ""))
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });

    svg
      .append("text")
      .attr("id", "title")
      .attr("x", width / 2)
      .attr("y", 0 - margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "30px")
      .text("Doping in Professional Bicycle Racing");
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 0 - margin.top / 2 + 25)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .text("35 Fastest times up Alpe d'Huez");

    let legendContainer = svg.append("g").attr("id", "legend");

    let legend = legendContainer
      .selectAll("#legend")
      .data(color.domain())
      .enter()
      .append("g")
      .attr("class", "legend-label")
      .attr("transform", function (d, i) {
        return "translate(0," + (height / 2 - i * 20) + ")";
      });

    legend
      .append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

    legend
      .append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function (d) {
        if (d) {
          return "Riders with doping allegations";
        } else {
          return "No doping allegations";
        }
      });
  }, [data]);
  return <></>;
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
