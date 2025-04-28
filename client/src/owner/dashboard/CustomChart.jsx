import { useRef, useEffect } from "react";
import { Chart } from "chart.js/auto";

const CustomChart = ({ type, data, options }) => {
     const canvasRef = useRef(null);
     const chartRef = useRef(null);

     useEffect(() => {
          if (chartRef.current) {
               chartRef.current.destroy(); // Destroy previous chart instance
          }

          chartRef.current = new Chart(canvasRef.current, {
               type,
               data,
               options,
          });

          // Cleanup on component unmount
          return () => {
               if (chartRef.current) chartRef.current.destroy();
          };
     }, [type, data, options]); // Recreate chart if data/options change

     return <canvas ref={canvasRef} />;
};

export default CustomChart;
