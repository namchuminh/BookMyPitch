/*
 Template Name: Lunoz - Admin & Dashboard Template
 Author: Myra Studio
 File: Dashboard
*/

$(function() {
  'use strict';

  var currentURL = window.location.href;

  function maxMinData(data){
    var max = data[0]
    var min = data[0]
    for(let i = 0; i < data.length; i++){
      if(data[i] > max){
        max = data[i]
      }
    }


    for(let i = 0; i < data.length; i++){
      if(data[i] < min){
        min = data[i]
      }
    }

    return [min, max + 200000]
  }

  $.get(currentURL + '/revenue/', function(data){
    var min = maxMinData(data)[0]
    var max = maxMinData(data)[1]
    const formatter = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    });
    const xValues = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
    const yValues = data;
    new Chart("myChart", {
      type: "line",
      data: {
        labels: xValues,
        datasets: [{
          fill: true,
          lineTension: 0,
          backgroundColor: "rgba(0,0,255,0.2)",
          borderColor: "rgba(0,0,255,0.1)",
          data: yValues
        }]
      },
      options: {
        legend: {display: false},
        scales: {
          yAxes: [{
            ticks: {
              min: min, 
              max:max,
              callback: function(value) {
                return formatter.format(value);
              }
            }
          }],
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem) {
              return formatter.format(tooltipItem.yLabel);
            }
          }
        }
      }
    });
  });
  
});