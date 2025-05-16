import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';

interface WordCloudProps {
  data: { text: string; value: number }[];
  width?: number;
  height?: number;
}

const WordCloud: React.FC<WordCloudProps> = ({ 
  data, 
  width = 800, 
  height = 400 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create color scale
    const colorScale = d3.scaleSequential()
      .domain([0, data.length])
      .interpolator(d3.interpolateRainbow);

    // Create word cloud layout
    const layout = d3.layout.cloud()
      .size([width, height])
      .words(data)
      .padding(5)
      .rotate(() => ~~(Math.random() * 2) * 90)
      .font("Poppins")
      .fontSize(d => Math.sqrt(d.value) * 5)
      .on("end", draw);

    layout.start();

    function draw(words: any[]) {
      const svg = d3.select(svgRef.current);
      
      // Add gradient definitions
      const defs = svg.append("defs");
      const gradient = defs.append("linearGradient")
        .attr("id", "wordCloudGradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", theme.palette.primary.main);

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", theme.palette.secondary.main);

      // Create word groups with animation
      const wordGroups = svg.append("g")
        .attr("transform", `translate(${width/2},${height/2})`)
        .selectAll("g")
        .data(words)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);

      // Add words with hover effects
      wordGroups.append("text")
        .style("font-size", d => `${d.size}px`)
        .style("font-family", "Poppins")
        .style("fill", (d, i) => colorScale(i))
        .attr("text-anchor", "middle")
        .attr("transform", d => `rotate(${d.rotate})`)
        .text(d => d.text)
        .style("cursor", "pointer")
        .on("mouseover", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .style("font-size", d => `${d.size * 1.2}px`)
            .style("fill", theme.palette.primary.main);
        })
        .on("mouseout", function(d, i) {
          d3.select(this)
            .transition()
            .duration(200)
            .style("font-size", d => `${d.size}px`)
            .style("fill", colorScale(i));
        });

      // Add subtle animation
      wordGroups
        .transition()
        .duration(2000)
        .attrTween("transform", function(d) {
          const i = d3.interpolateNumber(0, 1);
          return function(t) {
            const angle = d.rotate + Math.sin(t * 2 * Math.PI) * 5;
            return `translate(${d.x + Math.sin(t * 2 * Math.PI) * 2},${d.y + Math.cos(t * 2 * Math.PI) * 2}) rotate(${angle})`;
          };
        })
        .transition()
        .duration(2000)
        .attrTween("transform", function(d) {
          return function(t) {
            return `translate(${d.x},${d.y}) rotate(${d.rotate})`;
          };
        });
    }
  }, [data, width, height, theme]);

  return (
    <Card 
      elevation={3}
      sx={{
        borderRadius: 2,
        background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }}
    >
      <CardContent>
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom
          sx={{
            fontFamily: 'Poppins',
            fontWeight: 600,
            color: theme.palette.primary.main,
            textAlign: 'center',
            mb: 3
          }}
        >
          Emotion Word Cloud
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: height,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 2,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
              zIndex: 0
            }
          }}
        >
          <svg
            ref={svgRef}
            width={width}
            height={height}
            style={{
              position: 'relative',
              zIndex: 1
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default WordCloud; 